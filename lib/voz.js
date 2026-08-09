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
//      assíncrono e só avisa via onvoiceschanged). Por isso NÃO escolhemos
//      voice na mão: `utterance.lang` basta — o navegador resolve a melhor
//      voz instalada pro idioma pedido, mesmo que a lista ainda não tenha
//      chegado pro JS.

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

  for (const frase of frases) {
    const u = new window.SpeechSynthesisUtterance(frase);
    // Armadilha 3: lang basta — nada de escolher voice de getVoices().
    u.lang = LANG_FALA[lang] || LANG_FALA.pt;
    u.rate = RITMO;
    u.onend = () => {
      restantes -= 1;
      if (restantes <= 0) encerrar();
    };
    // Erro em QUALQUER frase encerra a leitura toda: cancel() derruba a fila
    // inteira com 'interrupted', e frase quebrada no meio é pior que parar.
    u.onerror = () => encerrar();
    synth.speak(u);
  }
}

/** Cala a voz agora — derruba a frase atual e a fila inteira. */
export function parar() {
  if (vozDisponivel()) window.speechSynthesis.cancel();
}

/** true enquanto o aparelho está falando (qualquer utterance da fila). */
export function falando() {
  return vozDisponivel() && window.speechSynthesis.speaking;
}
