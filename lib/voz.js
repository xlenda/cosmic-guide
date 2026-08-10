// O BOTÃO "OUVIR" — leitura em voz alta com a VOZ DO APARELHO.
//
// Por que este módulo existe (08/08/2026): o concorrente premium tem um play
// em cada leitura. Aqui a mesma coisa sai da Web Speech API do navegador
// (speechSynthesis) — custo ZERO, funciona offline, e fala nos três idiomas
// do app. Nenhuma chamada de rede, nenhum provedor, nenhuma chave.
//
// Detecção por CAPACIDADE, nunca Platform.OS — regra da casa (mesma de
// theme.js com localStorage): o que importa é se `window.speechSynthesis`
// existe NESTE ambiente, não em qual plataforma o bundle acha que está.
// Em node:test não existe window e tudo aqui degrada pra no-op — por isso o
// módulo nunca toca window no top-level, só dentro das funções.
//
// AS TRÊS ARMADILHAS REAIS da Web Speech API, e como cada uma é tratada:
//
//   1. iOS SAFARI SÓ FALA DEPOIS DE GESTO DO USUÁRIO — speak() fora de um
//      handler de toque é silenciosamente ignorado. Não precisa de truque:
//      o botão Ouvir É o gesto; falar() só é chamada de dentro do onPress.
//
//   2. CHROME DESKTOP PAUSA UTTERANCE LONGA (~15s) e nunca retoma — bug
//      antigo e ainda vivo. A defesa é nunca entregar utterance longa:
//      quebraEmFrases() fatia o texto em FIM DE FRASE (mesma régua de
//      lib/storySlides.js) e falar() enfileira UMA utterance POR FRASE.
//      Frases cabem folgadas no limite, e a fila do próprio synthesizer
//      emenda uma na outra sem silêncio perceptível.
//
//   3. getVoices() PODE VIR VAZIO NO PRIMEIRO TICK (Chrome carrega as vozes
//      assíncrono e só avisa via onvoiceschanged). A defesa NÃO é desistir de
//      escolher (ver abaixo): é AQUECER a lista quando o botão monta e usar o
//      cache — nunca esperar promise dentro do onPress, que mataria a
//      armadilha 1.
//
// A VOZ BOA NÃO VEM DE GRAÇA — ESCOLHER É OBRIGATÓRIO (09/08/2026):
// até hoje este módulo só setava `utterance.lang` e deixava o navegador
// decidir. O resultado foi o relato do dono: "voz robótica". O navegador
// escolhe a voz PADRÃO do sistema pro idioma, que costuma ser a mais velha
// e sintética instalada — enquanto na MESMA lista existem vozes NEURAIS de
// verdade, grátis e já instaladas:
//   · Edge/Windows: "Microsoft Francisca Online (Natural)" — Azure neural
//   · Chrome/Android: "Google português do Brasil" — cloud, muito natural
//   · iOS/Safari: Luciana (pt-BR), Joana (pt-PT), Mónica (es), Samantha (en)
// e também as PIORES: vozes "compact"/eSpeak e as de brincadeira do macOS
// (Zarvox, Albert, Bahh...), que casam com o idioma e soam terríveis.
// Por isso agora existe um placar (pontuarVoz): premia marca de voz neural,
// pune as compactas e as de brincadeira, e casa o idioma exato antes do
// prefixo. Sem nenhuma voz elegível, cai no comportamento antigo (só lang) —
// que continua funcionando, só que soando como soava.

// Idioma do app ('pt'|'es'|'en') → BCP-47 que o synthesizer entende.
const LANG_FALA = {
  pt: 'pt-BR',
  es: 'es-ES',
  en: 'en-US',
};

// Ritmo levemente abaixo do padrão: leitura de app é texto pra acompanhar,
// não locução de aviso — 0.95 soa natural nos três idiomas.
const RITMO = 0.95;

// Fim de frase, com o fecho (aspas/parênteses) pertencendo à frase — a MESMA
// régua de lib/storySlides.js (RE_FRASES), sem o \s* final: o espaço entre
// frases fica no COMEÇO da frase seguinte, então juntar os pedaços reconstrói
// o texto original byte a byte (é o contrato que test/voz.test.js cobra).
const RE_FRASES = /[^.!?…]+[.!?…]+[”"'’)\]]*|[^.!?…]+$/g;

/** true quando ESTE ambiente sabe falar (browser com Web Speech API). */
export function vozDisponivel() {
  return (
    typeof window !== 'undefined' &&
    !!window.speechSynthesis &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

// ---------------------------------------------------------------------------
// A ESCOLHA DA VOZ (o conserto do "robótico")
// ---------------------------------------------------------------------------

// Marcas no NOME que denunciam a geração da voz. Os pesos são grosseiros de
// propósito: o que importa é a ordem (neural > cloud > premium > comum >
// compacta > brincadeira), não o número exato.
const MARCAS_DE_VOZ = [
  [/natural|neural/i, 100],   // Edge/Azure: "... Online (Natural)"
  [/online/i, 85],            // idem, quando o "(Natural)" não vem no nome
  [/google/i, 80],            // Chrome/Android: vozes de nuvem do Google
  [/siri/i, 70],
  [/premium|enhanced|aprimorad|mejorad/i, 60],
  [/compact|comprimid/i, -60],
  [/espeak|pico|festival/i, -90],
  // As vozes de BRINCADEIRA do macOS casam com en-US e soam absurdas numa
  // leitura — precisam ficar abaixo de qualquer voz séria.
  [/zarvox|albert|bahh|bells|boing|bubbles|cellos|deranged|hysterical|jester|organ|superstar|trinoids|whisper|wobble|bad news|good news|junior|kathy|princess|ralph|fred/i, -300],
];

// Nomes que a prática mostra serem as melhores vozes locais de cada sistema
// nos TRÊS idiomas do app (iOS/macOS principalmente, onde não há "Natural"
// no nome pra denunciar qualidade).
const NOMES_PREFERIDOS = /luciana|joana|francisca|ant[oô]nio|fernanda|m[oó]nica|paulina|isabela|helena|samantha|serena|allison|ava|karen|daniel|alex/i;

// Cache de vozes do módulo. A lista chega assíncrona no Chrome; guardar aqui
// é o que permite ESCOLHER dentro do onPress sem esperar promise (armadilha 1
// do cabeçalho: await antes de speak() no iOS mata o gesto).
let _vozes = [];
let _aquecida = false;

function coletarVozes() {
  if (!vozDisponivel()) return [];
  try {
    const lista = window.speechSynthesis.getVoices();
    if (Array.isArray(lista) && lista.length) _vozes = lista;
  } catch {
    // Alguns WebViews antigos lançam aqui — a lista fica vazia e falar() cai
    // no comportamento antigo (só lang), que nunca deixou de funcionar.
  }
  return _vozes;
}

/**
 * Aquece o cache de vozes. Idempotente e sem custo: chame quando o botão de
 * ouvir MONTA (não no toque) — quando a pessoa tocar, a lista já está aqui.
 */
export function aquecerVozes() {
  if (!vozDisponivel() || _aquecida) return;
  _aquecida = true;
  coletarVozes();
  try {
    // O evento é a única forma confiável no Chrome: getVoices() no primeiro
    // tick vem vazio e nunca mais é consultado sozinho.
    window.speechSynthesis.addEventListener('voiceschanged', coletarVozes);
  } catch {
    try {
      window.speechSynthesis.onvoiceschanged = coletarVozes;
    } catch {}
  }
}

// Placar de uma voz para o idioma alvo (ex.: 'pt-BR'). Negativo alto = fora.
function pontuarVoz(voz, alvo) {
  const lang = String(voz.lang || '').replace('_', '-').toLowerCase();
  const a = alvo.toLowerCase();
  let p;
  if (lang === a) p = 50;                                   // pt-BR pedido, pt-BR achado
  else if (lang.split('-')[0] === a.split('-')[0]) p = 15;  // pt-PT serve pra pt-BR
  else return -Infinity;                                    // idioma errado, fora

  const nome = String(voz.name || '');
  for (const [re, peso] of MARCAS_DE_VOZ) if (re.test(nome)) p += peso;
  if (NOMES_PREFERIDOS.test(nome)) p += 45;
  // Empate técnico: a voz padrão do sistema desempata a favor dela.
  if (voz.default) p += 3;
  return p;
}

/**
 * A melhor voz de uma LISTA para o idioma alvo, ou null. Pura e exportada por
 * isso: é a única parte da escolha que dá pra testar sem browser (o resto é
 * getVoices(), que só existe lá). Empate mantém a primeira da lista.
 */
export function escolherVoz(lista, alvo) {
  if (!Array.isArray(lista) || !lista.length || !alvo) return null;
  let melhor = null;
  let melhorP = -Infinity;
  for (const v of lista) {
    if (!v) continue;
    const p = pontuarVoz(v, alvo);
    if (p > melhorP) {
      melhorP = p;
      melhor = v;
    }
  }
  return melhorP > -Infinity ? melhor : null;
}

/**
 * A melhor voz INSTALADA pro idioma, ou null (lista ainda vazia / nenhuma voz
 * do idioma). Nunca lança e nunca espera: usa só o cache já aquecido.
 */
export function melhorVoz(alvo) {
  return escolherVoz(_vozes.length ? _vozes : coletarVozes(), alvo);
}

/**
 * Quebra `texto` em frases pra fila de utterances (armadilha 2). Pura e
 * exportada por isso: é a única parte testável sem browser.
 * Garantias: nada se perde (frases.join('') === texto), texto sem pontuação
 * final vira 1 item, vazio/null/undefined viram [].
 */
export function quebraEmFrases(texto) {
  const s = String(texto ?? '');
  if (!s) return [];
  // Texto só de pontuação ("...") não casa com nenhum ramo do regex — sai
  // inteiro como frase única em vez de sumir.
  return s.match(RE_FRASES) || [s];
}

/**
 * Fala `texto` no idioma do app ('pt'|'es'|'en'). Cancela qualquer fala
 * anterior antes de começar (só existe UMA voz no app por vez). `aoTerminar`
 * é chamado UMA vez, quando a última frase termina — ou no primeiro erro
 * (inclusive o "interrupted" que um cancel()/parar() dispara), pra quem
 * chamou nunca ficar com estado "falando" pendurado.
 */
export function falar(texto, lang, aoTerminar) {
  const fim = typeof aoTerminar === 'function' ? aoTerminar : () => {};
  if (!vozDisponivel()) {
    fim();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();

  const frases = quebraEmFrases(texto)
    .map((f) => f.trim())
    .filter(Boolean);
  if (!frases.length) {
    fim();
    return;
  }

  let restantes = frases.length;
  let encerrou = false;
  const encerrar = () => {
    if (encerrou) return;
    encerrou = true;
    fim();
  };

  // Auditoria 09/08/2026, dois consertos nesta fila:
  // 1. Erro REAL numa frase do meio (ex.: 'network' em voz remota) não
  //    derrubava o resto — encerrar() avisava o botão, mas as frases
  //    seguintes continuavam falando (fala fantasma com botão em "Ouvir").
  //    Agora o onerror também chama synth.cancel(): a fila morre junto, e o
  //    'interrupted' em cascata cai no encerrou=true (idempotente).
  // 2. Chrome tem bug antigo de coletar utterance sem referência viva e a
  //    fala morrer no meio sem evento — _filaViva segura as referências até
  //    a leitura encerrar.
  const filaViva = [];
  _filaViva = filaViva;

  const alvo = LANG_FALA[lang] || LANG_FALA.pt;
  // A escolha acontece UMA vez por leitura, fora do laço: a mesma voz do
  // começo ao fim (trocar de voz no meio da fila soaria como duas pessoas).
  const voz = melhorVoz(alvo);

  for (const frase of frases) {
    const u = new window.SpeechSynthesisUtterance(frase);
    u.lang = alvo;
    // Sem voz elegível (lista ainda vazia, idioma sem voz instalada), só o
    // lang — o comportamento antigo, que sempre funcionou.
    if (voz) u.voice = voz;
    u.rate = RITMO;
    u.onend = () => {
      restantes -= 1;
      if (restantes <= 0) encerrar();
    };
    u.onerror = () => {
      encerrar();
      // Depois do encerrar: o cancel dispara 'interrupted' nas restantes, e
      // esses onerror em cascata batem no encerrou=true sem efeito.
      synth.cancel();
    };
    filaViva.push(u);
    synth.speak(u);
  }
}

// Referência viva da fila atual (conserto 2 acima) — substituída a cada
// falar(); a anterior vira lixo coletável só quando a nova assume.
let _filaViva = null;

/** Cala a voz agora — derruba a frase atual e a fila inteira. */
export function parar() {
  if (vozDisponivel()) window.speechSynthesis.cancel();
}

/** true enquanto o aparelho está falando (qualquer utterance da fila). */
export function falando() {
  return vozDisponivel() && window.speechSynthesis.speaking;
}
