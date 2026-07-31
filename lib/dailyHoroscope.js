// lib/dailyHoroscope.js
// O HORÓSCOPO DIÁRIO — refeito em 31/07/2026 sobre efeméride calculada.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
// ===========================================================================
// A tela de Horóscopo montava o texto do dia assim: oito frases prontas por
// aba (`horoscope.reading.hoje.1` … `.8`), sorteadas por hash de
// `signo|aba|data`. Oito textos girando para doze signos e 365 dias.
//
// Três defeitos, todos verificáveis:
//
// 1. EFEITO BARNUM. "Hoje sua intuição está mais afiada que o normal" serve
//    para qualquer signo em qualquer dia. O teste é o do dono do app: troque
//    a carta (aqui, o signo) e releia — se o texto continuar servindo, ele não
//    dizia nada.
//
// 2. AFIRMAÇÃO DE CÉU SEM CÉU. As frases afirmavam posição planetária que o
//    app nunca calculou: "A Lua minguante favoreceu o encerramento de ciclos"
//    (`horoscope.reading.ontem.1`) saía em dias de Lua crescente, com o
//    Calendário Lunar da própria casa mostrando a fase certa duas telas
//    adiante. A auditoria de tradição registra esse achado em
//    docs/tradicao/04-lua-fases-e-calendario.md, §6, `lib/i18n.js`.
//
// 3. NOTA INVENTADA APRESENTADA COMO MEDIDA. O `SCORE_POOL` tinha dez
//    conjuntos fixos ({ Amor: 62, Trabalho: 74, Saúde: 58, Dinheiro: 70 }…)
//    escolhidos pelo mesmo hash e desenhados como barra de progresso.
//    Enquanto isso o prompt da persona do assistente, no servidor
//    (server-patches/src/infrastructure/AnthropicChatProvider.js), proíbe:
//    "Não atribua porcentagem a compatibilidade nem a nada mais. Número de
//    dois dígitos é a forma mais forte de afirmar precisão que existe, e a
//    tradição não sustenta essa promessa."
//    O app dizia uma coisa no chat e o contrário na tela ao lado.
//
// DECISÃO SOBRE O SCORE_POOL: morreu. Não virou "índice do app" com aviso.
// Um número de dois dígitos desenhado como barra preenchida LÊ como medida,
// e nenhuma legenda desfaz isso — a mesma razão pela qual o prompt da IA
// proíbe a porcentagem em vez de pedir que ela venha com ressalva. Além
// disso, não havia o que medir: o número não saía de conta nenhuma, era um
// literal escolhido por hash. lib/synastry.js tomou a mesma decisão pelo mesmo
// motivo e também não tem nota: lá existe uma CATEGORIA ptolomaica e uma escala
// ORDINAL de quatro degraus (Tetrabiblos IV.7), e nenhuma das duas é número de
// 0 a 100 — o app inteiro está sem porcentagem de compatibilidade.
//
// ===========================================================================
// A REGRA DE ESCRITA QUE VALE AQUI, e o teste que a cobra
// ===========================================================================
// Frase que AFIRMA posição de planeta só pode existir se a posição foi
// calculada nesta mesma execução. Toda afirmação de tradição carrega o locus
// (mesmo padrão de lib/zodiacBody.js e lib/grounding.js). Nada de nota, nada
// de porcentagem, nada de "sua sorte hoje".
//
// test/dailyHoroscope.test.js quebra o build quando: dois signos recebem o
// mesmo conjunto de blocos no mesmo dia; o mesmo signo recebe o mesmo
// conjunto em dias de céu diferente; ou uma chave da família nova falta em
// algum dos três idiomas.
//
// ===========================================================================
// DE ONDE VEM CADA PEÇA (tudo com fonte, tudo marcado)
// ===========================================================================
// [FP] = fonte primária · [TP] = tradição posterior · [MOD] = convenção moderna
//
// 1. O EIXO: o signo fala pela CONDIÇÃO DO SEU REGENTE. [FP]
//    Valens, Anthologiae I.2, sobre Áries: os nascidos sob o signo serão isto
//    ou aquilo "conforme a relação com o regente da casa". Signo solar
//    incondicional não é o método antigo — é criação do século XX (Alan Leo,
//    R. H. Naylor, Linda Goodman). Por isso o primeiro bloco desta tela não é
//    sobre o signo: é sobre onde está, hoje, o planeta que rege o signo.
//    Isso resolve o Barnum sozinho: Marte muda de signo a cada ~6 semanas e
//    entra em dignidade diferente em cada um, então Áries e Escorpião (mesmo
//    regente) e Touro e Libra (mesmo regente) leem coisas diferentes de
//    Gêmeos e Virgem no mesmo dia.
//
// 2. DOMICÍLIOS. [FP] Ptolomeu, Tetrabiblos I.17 — e ele DEDUZ a tabela, não
//    a herda: Vênus nunca se afasta mais de dois signos do Sol, Mercúrio mais
//    de um, e é dessa distância angular observável que sai a distribuição.
//
// 3. EXALTAÇÕES E QUEDAS. [FP] Ptolomeu, Tetrabiblos I.19 — POR SIGNO. Os
//    graus famosos (Sol a 19° de Áries etc.) NÃO estão no Tetrabiblos; são
//    helenísticos tardios, de raiz babilônica. Este arquivo não usa grau
//    nenhum de dignidade, de propósito.
//
// 4. OS QUATRO ASPECTOS. [FP] Ptolomeu, Tetrabiblos I.13 — oposição, trígono,
//    quadratura, sextil, e só. Duas consequências que quase todo app erra e
//    esta tela respeita:
//      (a) conjunção NÃO é aspecto: Tetrabiblos I.24 a trata como "aplicação
//          corporal", categoria separada, e I.16 põe signos coincidentes fora
//          dos quatro aspectos;
//      (b) os aspectos são entre SIGNOS INTEIROS, sem orbe em graus — não
//          existe tabela de orbes no Tetrabiblos. Onde esta tela usa orbe em
//          graus (o aspecto céu-a-céu, que vem de lib/signs.js), o texto
//          declara que a tolerância é convenção moderna de software. [MOD]
//      (c) 30° e 150° não são aspectos: Tetrabiblos I.16 chama esses signos
//          de disjuntos e alheios. Quando a Lua cai aí em relação ao signo da
//          pessoa, a tela DIZ isso, em vez de fingir um "quincunce".
//
// 5. OS QUARTOS DA LUA. [FP] Ptolomeu, Tetrabiblos I.8: da nova ao quarto
//    crescente a Lua é mais produtora de umidade; do quarto crescente à cheia,
//    de calor; da cheia ao quarto minguante, de secura; do quarto minguante à
//    ocultação, de frio. QUATRO quartos. A divisão em OITO fases com sentido
//    psicológico é de Dane Rudhyar, The Lunation Cycle, 1967 [TP] — por isso o
//    nome de oito fases aparece aqui rotulado como convenção de astronomia
//    moderna, e a leitura vem do quarto.
//
// 6. A PRÁTICA LUNAR ROMANA. [FP] Crescente para o que deve crescer (Paládio,
//    Opus Agriculturae I.6.12; Catão, De Agri Cultura 40.1), minguante para o
//    que se corta, colhe-para-guardar e tosquia (Plínio, Naturalis Historia
//    XVIII.321-322; Columela XII.16.1). ATENÇÃO: "Lua Cheia = hora de colher"
//    é inversão da fonte, e o app a repetia em lib/lunarCalendar.js e
//    lib/celestialSeasons.js. Aqui não se repete.
//
// 7. REGENTE DO DIA DA SEMANA. [FP] Ordem caldaica, já documentada e traduzida
//    em lib/grounding.js (locus: Dião Cássio, História Romana 37.18-19) com as
//    sete qualidades térmicas de Tetrabiblos I.4. Este arquivo REUSA aquelas
//    chaves de i18n em vez de reescrevê-las — inclusive o aviso de que a
//    qualidade é física e a transposição para o ânimo é nossa.
//
// 8. RETROGRADAÇÃO. [FP] Valens, Anthologiae, seção de trânsitos: passada a
//    primeira estação os planetas "atrasam expectativas, ações, lucros e
//    empreendimentos"; passada a segunda, "cancelam o atraso e reinstauram as
//    mesmas atividades". [MOD] O pacote "aparelho quebra, ex reaparece" é
//    folclore do século XX e a tela diz isso na cara.
//
// 9. ZODÍACO TRÓPICO. [FP] Ptolomeu, Tetrabiblos I.10 e I.22. O app é trópico
//    e não dizia isso em lugar nenhum (achado da auditoria, doc 01 §4.6). Agora
//    diz, no rodapé.
//
// ===========================================================================
// O QUE ESTE ARQUIVO NÃO FAZ
// ===========================================================================
// - Não toca lib/signs.js, lib/synastry.js nem lib/journey.js: só importa.
// - Não fabrica. Sem astronomy-engine, `horoscopeFor` devolve
//   { available: false } e a tela mostra uma linha honesta em vez de texto.
// - Não dá nota, porcentagem, cor da sorte, número da sorte nem hora da sorte.
//   Cor/número/hora por signo não têm fonte em tradição nenhuma (doc 01, §3.15)
//   e eram literais sorteados por hash, exatamente como as notas.
// - Não fala de saúde, corpo, sono, humor ou remédio. Nem por metáfora.
import { SIGNS, moonSign, aspects, isMercuryRetrograde, planetPositions } from './signs';
import { getMoonPhase } from './lunarCalendar';
import { regentePorPlaneta, regenteKey } from './grounding';

// ---------------------------------------------------------------------------
// 1. TABELAS DE TRADIÇÃO (nenhuma delas tem grau — de propósito)
// ---------------------------------------------------------------------------

// Domicílios — Ptolomeu, Tetrabiblos I.17. Só os sete clássicos: Urano,
// Netuno e Plutão foram descobertos em 1781, 1846 e 1930, e as regências
// modernas atribuídas a eles não têm autor nem data localizados (doc 01, §2.6).
// Um app que quer dizer "conhecimento milenar" não pode pendurar o bloco
// principal num planeta que Ptolomeu não via.
export const DOMICILIO_POR_SIGNO = {
  'Áries': 'Marte',
  'Touro': 'Vênus',
  'Gêmeos': 'Mercúrio',
  'Câncer': 'Lua',
  'Leão': 'Sol',
  'Virgem': 'Mercúrio',
  'Libra': 'Vênus',
  'Escorpião': 'Marte',
  'Sagitário': 'Júpiter',
  'Capricórnio': 'Saturno',
  'Aquário': 'Saturno',
  'Peixes': 'Júpiter',
};

// Exaltações — Ptolomeu, Tetrabiblos I.19, por SIGNO. Cinco signos não
// exaltam ninguém (Gêmeos, Leão, Escorpião, Sagitário, Aquário) e a tabela
// registra isso com ausência, não com preenchimento inventado.
export const EXALTACAO_POR_SIGNO = {
  'Áries': 'Sol',
  'Touro': 'Lua',
  'Câncer': 'Júpiter',
  'Virgem': 'Mercúrio',
  'Libra': 'Saturno',
  'Capricórnio': 'Marte',
  'Peixes': 'Vênus',
};

// Ordem dos signos na roda — a mesma de SIGNS em lib/signs.js, repetida aqui
// só como índice de leitura. `oposto` é aritmética da roda, não tabela nova:
// o exílio é o signo oposto ao domicílio e a queda é o oposto da exaltação.
// Ptolomeu nomeia a QUEDA ("depression", Tetrabiblos I.19). O exílio é a
// leitura simétrica da tabela de I.17 e a tela o apresenta como tal, sem
// atribuir a palavra a ele.
const ORDEM = SIGNS.map((s) => s.name);

function signoOposto(nome) {
  const i = ORDEM.indexOf(nome);
  if (i === -1) return null;
  return ORDEM[(i + 6) % 12];
}

// Dignidade essencial de um planeta no signo onde ele está AGORA.
// Devolve 'domicilio' | 'exaltacao' | 'exilio' | 'queda' | 'peregrino'.
// "Peregrino" é o termo tradicional para o planeta sem dignidade essencial
// no lugar onde está — e é o caso mais comum, então a tela não pode tratá-lo
// como exceção nem como má notícia.
export function dignidadeDe(planeta, signo) {
  if (!planeta || !signo) return null;
  if (DOMICILIO_POR_SIGNO[signo] === planeta) return 'domicilio';
  if (EXALTACAO_POR_SIGNO[signo] === planeta) return 'exaltacao';
  const oposto = signoOposto(signo);
  if (oposto && DOMICILIO_POR_SIGNO[oposto] === planeta) return 'exilio';
  if (oposto && EXALTACAO_POR_SIGNO[oposto] === planeta) return 'queda';
  return 'peregrino';
}

// Relação por SIGNO INTEIRO entre dois signos — é assim que Ptolomeu conta
// aspecto (Tetrabiblos I.13), sem orbe em graus. A distância é simétrica
// (dois signos à frente e dois atrás são o mesmo sextil).
//
//   0 → co-presença     (Tetrabiblos I.24, "aplicação corporal": NÃO é aspecto)
//   1 → alheio de 30°   (Tetrabiblos I.16, disjunto: NÃO é aspecto)
//   2 → sextil          harmônico
//   3 → quadratura      desarmônico
//   4 → trígono         harmônico
//   5 → alheio de 150°  (Tetrabiblos I.16, disjunto: NÃO é aspecto)
//   6 → oposição        desarmônico
const RELACAO_POR_DISTANCIA = [
  'copresenca', 'alheio30', 'sextil', 'quadratura', 'trigono', 'alheio150', 'oposicao',
];

export function relacaoSignoInteiro(signoA, signoB) {
  const a = ORDEM.indexOf(signoA);
  const b = ORDEM.indexOf(signoB);
  if (a === -1 || b === -1) return null;
  const bruta = Math.abs(a - b) % 12;
  return RELACAO_POR_DISTANCIA[Math.min(bruta, 12 - bruta)];
}

// Os quatro quartos de Ptolomeu (Tetrabiblos I.8), lidos da elongação real
// Lua−Sol que lib/lunarCalendar.js já entrega em graus.
//   0°–90°   q1  úmido    (nova → quarto crescente)
//   90°–180° q2  quente   (quarto crescente → cheia)
//   180°–270° q3 seco     (cheia → quarto minguante)
//   270°–360° q4 frio     (quarto minguante → nova)
// A metade crescente (q1+q2) e a minguante (q3+q4) é o que decide qual
// prática agrícola romana pode ser citada — e é por isso que esta função
// existe em vez de reaproveitar o rótulo de oito fases.
export function quartoLunar(longitudeGraus) {
  if (typeof longitudeGraus !== 'number' || Number.isNaN(longitudeGraus)) return null;
  const lon = ((longitudeGraus % 360) + 360) % 360;
  const idx = Math.floor(lon / 90); // 0..3
  return {
    id: ['q1', 'q2', 'q3', 'q4'][idx],
    metade: idx < 2 ? 'crescente' : 'minguante',
  };
}

// Regência dos dias da semana — ordem caldaica. Índice = Date.getUTCDay()
// para bater com a âncora de meio-dia UTC usada no resto do arquivo.
// Os nomes casam byte a byte com lib/grounding.js (REGENTES), que é de onde
// vem a qualidade térmica traduzida nos três idiomas.
export const REGENTE_POR_DIA = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];

// ---------------------------------------------------------------------------
// 2. CÁLCULO — nada aqui é literal, tudo sai de efeméride
// ---------------------------------------------------------------------------

// MEMÓRIA DE CURTO PRAZO, por data. Uma leitura completa pede o céu de hoje E o
// de ontem (para dizer o que mudou), mais duas posições planetárias para a
// retrogradação e mais uma para os aspectos — e a tela chama horoscopeFor a
// cada render, e as três abas pedem três dias.
//
// Sem cache, trocar de signo no seletor recalculava tudo do zero doze vezes
// seguidas na UI thread. Com cache, o segundo pedido do mesmo dia é uma leitura
// de Map.
//
// O cache é por DATA, nunca por signo: o céu de um dia é o mesmo para os doze,
// e é a leitura que difere. Guardar por signo esconderia um bug de mistura de
// dados atrás de uma otimização, que é o pior lugar para escondê-lo.
//
// Limite pequeno e descarte do mais antigo (Map preserva ordem de inserção):
// o app usa três dias por vez; o teste varre um ano. Sem limite, um cron que
// varresse década ficaria com o ano inteiro na memória à toa.
const CACHE_MAX = 96;

function memoPorData(fn) {
  const cache = new Map();
  return (dateStr, ...resto) => {
    const chave = resto.length ? `${dateStr}|${resto.join('|')}` : dateStr;
    if (cache.has(chave)) return cache.get(chave);
    const valor = fn(dateStr, ...resto);
    cache.set(chave, valor);
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value);
    return valor;
  };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

export function isoDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function somaDias(dateStr, dias) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

// Signo em que uma longitude eclíptica cai. 30° por signo, zodíaco TRÓPICO
// (é o que planetPositions devolve — ver Tetrabiblos I.10 e I.22 para a
// escolha, e o rodapé da tela, que a declara).
function signoDaLongitude(lon) {
  const l = ((lon % 360) + 360) % 360;
  return ORDEM[Math.floor(l / 30)];
}

function posicaoDe(posicoes, planeta) {
  if (!posicoes) return null;
  const p = posicoes.find((x) => x.planet === planeta);
  return p ? p.longitude : null;
}

// Retrogradação de QUALQUER dos sete, pela mesma definição que
// lib/signs.js:isMercuryRetrograde() usa para Mercúrio: compara a longitude
// dois dias antes e dois dias depois; se caiu (tratando o giro de 360°), o
// movimento aparente é retrógrado nessa janela. Está aqui, e não em signs.js,
// porque signs.js é território de outra frente — este arquivo só importa de lá.
// Sol e Lua nunca retrogradam: devolve false sem gastar cálculo.
function _planetaRetrogrado(dateStr, planeta) {
  if (planeta === 'Sol' || planeta === 'Lua') return false;
  const antes = planetPositions(somaDias(dateStr, -2));
  const depois = planetPositions(somaDias(dateStr, 2));
  if (!antes || !depois) return null;
  const a = posicaoDe(antes, planeta);
  const b = posicaoDe(depois, planeta);
  if (a === null || b === null) return null;
  let delta = b - a;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta < 0;
}

// O céu de UMA data, sem nenhuma referência a pessoa ou signo. Tudo aqui é
// calculado: se qualquer peça essencial faltar, devolve null (nunca estima).
function _ceuDoDia(dateStr) {
  const fase = getMoonPhase(new Date(`${dateStr}T12:00:00Z`));
  const lua = moonSign(dateStr);
  const posicoes = planetPositions(dateStr);
  if (!fase || !lua || !posicoes) return null;

  const quarto = quartoLunar(fase.longitude);
  const diaSemana = new Date(`${dateStr}T12:00:00Z`).getUTCDay();

  // Signo de cada um dos sete clássicos neste dia — a base de todo bloco de
  // regente. Urano/Netuno/Plutão ficam de fora (ver cabeçalho, item 2).
  const signoDoPlaneta = {};
  for (const nome of ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']) {
    const lon = posicaoDe(posicoes, nome);
    if (lon !== null) signoDoPlaneta[nome] = signoDaLongitude(lon);
  }

  return {
    dateStr,
    luaSigno: lua.name,
    luaEmoji: lua.emoji,
    luaDignidade: dignidadeDe('Lua', lua.name),
    faseNome: fase.name,
    faseEmoji: fase.emoji,
    iluminacao: fase.illumination,
    elongacao: Math.round(fase.longitude),
    quartoId: quarto ? quarto.id : null,
    quartoMetade: quarto ? quarto.metade : null,
    diaSemana,
    regenteDoDia: REGENTE_POR_DIA[diaSemana],
    mercurioRetrogrado: isMercuryRetrograde(dateStr),
    signoDoPlaneta,
  };
}

// Aspecto real do dia envolvendo um planeta específico (o regente do signo da
// pessoa). Filtra para os sete clássicos — um trígono Netuno-Plutão dura anos
// e não é notícia de dia nenhum — e devolve o de menor orbe. `ptolomaico`
// diz se o encaixe está entre os quatro de Tetrabiblos I.13; a conjunção
// entra marcada como false, para a tela poder nomeá-la pelo que ela é
// (aplicação corporal, Tetrabiblos I.24).
const CLASSICOS = new Set(['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno']);

// Slug ASCII do tipo de aspecto, para montar chave de i18n sem acento nem
// maiúscula (chave com "í" ou "ç" é um convite a erro de digitação silencioso).
// Os nomes de entrada vêm de lib/signs.js:ASPECTS_TABLE e não são traduzíveis lá.
const SLUG_ASPECTO = {
  'Conjunção': 'conjuncao',
  'Sextil': 'sextil',
  'Quadratura': 'quadratura',
  'Trígono': 'trigono',
  'Oposição': 'oposicao',
};

function _aspectoDoRegente(dateStr, planeta) {
  const todos = aspects(dateStr);
  if (!todos || todos.length === 0) return null;
  const uteis = todos.filter(
    (a) =>
      (a.planetA === planeta || a.planetB === planeta) &&
      CLASSICOS.has(a.planetA) &&
      CLASSICOS.has(a.planetB)
  );
  if (uteis.length === 0) return null;
  const melhor = uteis.reduce((best, a) => (a.orb < best.orb ? a : best), uteis[0]);
  return {
    planetA: melhor.planetA,
    planetB: melhor.planetB,
    aspectType: melhor.aspectType,
    aspectSlug: SLUG_ASPECTO[melhor.aspectType] || null,
    orb: Math.round(melhor.orb * 10) / 10,
    ptolomaico: melhor.aspectType !== 'Conjunção',
  };
}

// As três funções acima são caras (cada uma dispara varreduras de efeméride) e
// são chamadas repetidamente com a MESMA data — pelas três abas da tela, pelos
// doze signos do seletor e a cada render. Aqui elas ganham a memória por data
// descrita em memoPorData(). A ordem dos argumentos das duas últimas foi
// invertida para (dateStr, planeta) só por causa disso: a chave do cache começa
// pela data, que é o eixo do problema.
const _ceuDoDiaMemo = memoPorData(_ceuDoDia);
const _planetaRetrogradoMemo = memoPorData(_planetaRetrogrado);
const _aspectoDoRegenteMemo = memoPorData(_aspectoDoRegente);

export function ceuDoDia(dateStr) {
  return _ceuDoDiaMemo(dateStr);
}

export function planetaRetrogrado(planeta, dateStr) {
  return _planetaRetrogradoMemo(dateStr, planeta);
}

export function aspectoDoRegente(planeta, dateStr) {
  return _aspectoDoRegenteMemo(dateStr, planeta);
}

// ---------------------------------------------------------------------------
// 3. CHAVES DE i18n
// ---------------------------------------------------------------------------
// REGRA DESTE ARQUIVO, e ela é diferente da de lib/grounding.js de propósito:
// aqui a chave estática aparece INTEIRA e literal ('horoscope.sky.moon.position'),
// não montada por helper a partir de um sufixo. O motivo é
// test/i18nKeysExist.test.js: ele varre screens/ components/ lib/ atrás de
// qualquer literal com cara de chave e exige que exista no dicionário. Um
// helper que recebesse só o sufixo faria o teste enxergar o sufixo como se
// fosse chave — chave que não existe — e quebrar o build por falso positivo.
// (Este comentário já foi a prova disso: numa versão anterior ele CITAVA o
// sufixo entre aspas e o teste quebrou o build por causa do próprio comentário.
// Ficou a lição: aqui dentro, sufixo solto entre aspas nem em comentário.)
// Chave inteira é visível ao grep, conferida pelo teste estático e impossível
// de divergir do dicionário sem alguém perceber.
//
// As chaves de família dinâmica (dignidade, relação lunar, quarto, dia da
// semana, nome de aspecto) continuam em template literal, porque o sufixo só é
// conhecido em runtime — e para essas o test/dailyHoroscope.test.js confere a
// família inteira nos três idiomas, que é justamente o que o teste estático não
// consegue fazer.
export const SKY_PREFIX = 'horoscope.sky.';

export function skyKey(campo) {
  return SKY_PREFIX + campo;
}

// Slug do planeta para as chaves REAPROVEITADAS de lib/grounding.js
// (grounding.ruler.<slug>.name e .quality). Elas já existem nos três idiomas e
// já carregam a qualidade térmica de Tetrabiblos I.4 com o aviso de que a
// descrição é física — reescrevê-las aqui criaria uma segunda verdade sobre o
// mesmo capítulo do mesmo autor, e as duas iam divergir na primeira revisão.
const SLUG_PLANETA = {
  'Sol': 'sol', 'Lua': 'lua', 'Mercúrio': 'mercurio', 'Vênus': 'venus',
  'Marte': 'marte', 'Júpiter': 'jupiter', 'Saturno': 'saturno',
};

export function planetaNomeKey(planeta) {
  const slug = SLUG_PLANETA[planeta];
  return slug ? regenteKey(slug, 'name') : null;
}

export function planetaQualidadeKey(planeta) {
  const slug = SLUG_PLANETA[planeta];
  return slug ? regenteKey(slug, 'quality') : null;
}

// ---------------------------------------------------------------------------
// 4. MONTAGEM DOS BLOCOS
// ---------------------------------------------------------------------------
// Cada bloco é { id, titleKey, lines: [{ key, vars }] }. A tela não escolhe
// conteúdo: ela renderiza t(line.key, line.vars) na ordem em que vierem.
//
// Um valor de `vars` pode ser:
//   - string   → entra literal na interpolação (nome de signo, graus, orbe);
//   - { i18n } → é uma chave a TRADUZIR antes de interpolar. É assim que o nome
//     do planeta e o do dia da semana chegam em espanhol e inglês sem este
//     arquivo guardar uma segunda tabela de nomes.
// O resolvedor mora na tela (resolveVars em screens/HoroscopeScreen.js), porque
// é lá que o `t` do idioma ativo existe. Este módulo continua puro e testável
// sem dicionário nenhum.
function i18nVar(key) {
  return { i18n: key };
}

// ---------------------------------------------------------------------------
// LEITURA × MÉTODO — acrescentado em 31/07/2026 por auditoria de leitura
// ---------------------------------------------------------------------------
// O QUE A AUDITORIA MEDIU. Renderizados os doze signos no mesmo dia, com o
// dicionário de verdade: 596 palavras por signo, e sobreposição de 0,81 entre
// dois signos quaisquer (pior par, Câncer × Virgem: 0,93). Ou seja: de cada dez
// palavras que a pessoa lê no horóscopo dela, oito são idênticas às que os
// outros onze signos leem — e idênticas às que ela mesma leu ontem.
//
// O QUE ESSAS OITO PALAVRAS SÃO. Não são enchimento inventado: são as FONTES.
// "A tabela de domicílios não é arbitrária — Ptolomeu a deduz no Tetrabiblos
// I.17 da distância angular máxima…", "A conta acima é por SIGNO INTEIRO, sem
// orbe em graus…", os 60 nomes de Plínio e Columela, o aviso de Rudhyar. Cada
// uma delas foi conquistada contra um app que antes sorteava frase por hash, e
// nenhuma pode sair.
//
// MAS A DOSE É O PROBLEMA. O que é sobre ESTE signo HOJE — Marte, regente de
// Áries, está em Gêmeos e peregrino; a Lua em Aquário faz sextil com Áries —
// cabe em ~60 palavras, e está enterrado sob 536 de aparato metodológico que
// não muda de signo para signo nem de dia para dia. O dono do app chamou esse
// efeito, no tarô, de enrolar linguiça; aqui ele tem outra causa (erudição, não
// vagueza) e o mesmo sintoma: o leitor não acha o que veio buscar.
//
// A SOLUÇÃO, e o que ela NÃO é. Não é cortar fonte, não é resumir Ptolomeu, não
// é pôr "saiba mais" em cima de conteúdo vazio. Cada linha passa a declarar o
// que ela é:
//   role: 'leitura' → o que o céu calculado diz sobre este signo neste dia.
//   role: 'metodo'  → de onde isso vem, e o que a fonte NÃO autoriza dizer.
// A tela (screens/HoroscopeScreen.js) mostra a leitura e guarda o método atrás
// de um toque por bloco, aberto por quem quiser. Nada é removido, nada é
// reescrito, nenhuma chave de i18n muda: muda a ORDEM DE LEITURA.
//
// O TESTE DE QUE ISSO NÃO VIRA DESCULPA: `assinatura()` continua somando as
// duas classes, então nenhuma linha pode sumir sem quebrar
// test/dailyHoroscope.test.js — marcar como 'metodo' não é rota de fuga para
// apagar ressalva.
const LEITURA = 'leitura';
const METODO = 'metodo';

function linha(key, vars, role = LEITURA) {
  return { key, vars: vars || null, role };
}

// Açúcar para as linhas de aparato, que são as que se repetem iguais nos doze
// signos: a justificativa do método, a régua da conta e a ressalva do que a
// fonte não autoriza.
function nota(key, vars) {
  return linha(key, vars, METODO);
}

// O QUE MUDOU de um dia para o anterior, e por quê.
//
// Esta função é a resposta direta ao defeito principal: antes, o texto de hoje
// diferia do de ontem porque o hash da string mudou. Agora difere porque o CÉU
// mudou, e o motivo aparece escrito na primeira linha da tela.
//
// A ordem da lista é de SALIÊNCIA, não de conveniência: a troca de signo da Lua
// reescreve o bloco mais pessoal (a relação dela com o signo de quem lê), então
// vem primeiro. O regente do dia da semana muda todo santo dia e por isso é o
// último recurso — anunciar "mudou porque hoje é terça" como novidade seria a
// mesma enrolação de antes, só que com aparência de cálculo.
function blocoMudanca(ceu, anterior, regenteDoSigno) {
  if (!anterior) return null;

  if (ceu.luaSigno !== anterior.luaSigno) {
    return linha('horoscope.sky.change.moonSign', { novo: ceu.luaSigno, velho: anterior.luaSigno });
  }
  if (ceu.quartoId !== anterior.quartoId) {
    return linha('horoscope.sky.change.quarter', {
      velho: i18nVar(skyKey(`quarterShort.${anterior.quartoId}`)),
      novo: i18nVar(skyKey(`quarterShort.${ceu.quartoId}`)),
    });
  }
  const antesRegente = anterior.signoDoPlaneta[regenteDoSigno];
  const agoraRegente = ceu.signoDoPlaneta[regenteDoSigno];
  if (antesRegente && agoraRegente && antesRegente !== agoraRegente) {
    return linha('horoscope.sky.change.rulerSign', {
      planeta: i18nVar(planetaNomeKey(regenteDoSigno)),
      velho: antesRegente,
      novo: agoraRegente,
    });
  }
  if (ceu.mercurioRetrogrado !== anterior.mercurioRetrogrado) {
    return linha(
      ceu.mercurioRetrogrado ? 'horoscope.sky.change.retroOn' : 'horoscope.sky.change.retroOff'
    );
  }
  if (ceu.regenteDoDia !== anterior.regenteDoDia) {
    return linha('horoscope.sky.change.dayRuler', {
      velho: i18nVar(planetaNomeKey(anterior.regenteDoDia)),
      novo: i18nVar(planetaNomeKey(ceu.regenteDoDia)),
      luaSigno: ceu.luaSigno,
    });
  }
  return null;
}

// `signName` é o nome do signo como em SIGNS/theme (ex.: 'Áries').
// `date` é um Date; o céu é ancorado ao MEIO-DIA UTC da data — a mesma âncora de
// lib/dailyThought.js. Sem ela o texto mudaria conforme a hora em que a pessoa
// abre o app (a Lua anda ~13°/dia) enquanto o resto já está fixado por data, e
// a Home às 23h contaria uma história diferente da notificação das 12h. Foi um
// achado real de auditoria em 25/07/2026, registrado em lib/dailyThought.js.
export function horoscopeFor(signName, date = new Date()) {
  const dateStr = date instanceof Date ? isoDate(date) : String(date);
  const ceu = ceuDoDia(dateStr);
  if (!ceu) {
    // Sem motor de efeméride não há céu, e sem céu esta tela não escreve.
    // Preencher com frase genérica é exatamente o defeito que este arquivo veio
    // consertar — melhor uma linha honesta do que oito textos girando.
    return { dateStr, available: false, blocks: [], facts: null };
  }

  const regente = DOMICILIO_POR_SIGNO[signName] || null;
  const signoDoRegente = regente ? ceu.signoDoPlaneta[regente] : null;
  const dignidadeRegente = regente && signoDoRegente ? dignidadeDe(regente, signoDoRegente) : null;
  const regenteRetro = regente ? planetaRetrogrado(regente, dateStr) : null;
  const relacaoLua = relacaoSignoInteiro(signName, ceu.luaSigno);
  const aspecto = regente ? aspectoDoRegente(regente, dateStr) : null;
  const anterior = ceuDoDia(somaDias(dateStr, -1));

  const blocks = [];

  // --- Bloco 0: por que este texto difere do de ontem ----------------------
  // ORDEM CONDICIONAL (31/07/2026). O bloco continua sendo o primeiro quando o
  // que mudou é grande — a Lua trocou de signo, virou o quarto lunar, o regente
  // do signo mudou de casa, Mercúrio entrou ou saiu de retrógrado. Nesses dias
  // ele é a manchete legítima, e test/dailyHoroscope.test.js exige que seja.
  //
  // Mas o último recurso da lista é o regente do dia da semana, que muda todo
  // santo dia, e o texto dele diz — corretamente — "É pouco". Abrir o horóscopo
  // da pessoa com "é pouco" é jogar fora a primeira linha, que é a única que
  // todo mundo lê. Nesses dias ele desce para depois dos dois blocos que são
  // sobre o signo de quem está lendo, e a tela abre pelo regente.
  //
  // Isto não esconde nada e não é otimização de engajamento: a linha continua
  // inteira, no mesmo lugar da lista de blocos, com o mesmo texto honesto. Só
  // deixa de ocupar a manchete num dia em que ela própria admite não ser
  // manchete.
  const mudanca = blocoMudanca(ceu, anterior, regente);
  const mudancaFraca = !!mudanca && mudanca.key === 'horoscope.sky.change.dayRuler';
  const blocoDeMudanca = mudanca
    ? { id: 'change', titleKey: 'horoscope.sky.changeTitle', lines: [mudanca] }
    : null;
  if (blocoDeMudanca && !mudancaFraca) blocks.push(blocoDeMudanca);

  // --- Bloco 1: o regente do SEU signo (o eixo — ver cabeçalho, item 1) ----
  // É este bloco que faz Áries e Gêmeos lerem coisas diferentes no mesmo dia, e
  // faz o Áries de hoje ler diferente do Áries de daqui a três semanas: Marte
  // troca de signo a cada ~6 semanas e a dignidade muda junto com ele.
  if (regente && signoDoRegente) {
    const lines = [
      linha('horoscope.sky.ruler.domicile', {
        signo: signName,
        planeta: i18nVar(planetaNomeKey(regente)),
      }),
      linha('horoscope.sky.ruler.position', {
        planeta: i18nVar(planetaNomeKey(regente)),
        signoPlaneta: signoDoRegente,
      }),
      linha(skyKey(`ruler.dignity.${dignidadeRegente}`), {
        planeta: i18nVar(planetaNomeKey(regente)),
        signoPlaneta: signoDoRegente,
        signo: signName,
      }),
    ];
    if (regenteRetro === true) {
      lines.push(
        linha('horoscope.sky.ruler.retrograde', { planeta: i18nVar(planetaNomeKey(regente)) })
      );
    }
    // Por que o bloco do regente vem primeiro (Valens, Anthologiae I.2) é
    // MÉTODO: é a defesa da escolha de arquitetura desta tela, não notícia
    // sobre o dia de quem lê. Sai igual para os doze signos, todo dia do ano.
    lines.push(nota('horoscope.sky.ruler.valens', { signo: signName }));
    blocks.push({ id: 'ruler', titleKey: 'horoscope.sky.rulerTitle', lines });
  }

  // --- Bloco 2: a Lua de hoje contra o SEU signo ---------------------------
  // Muda de verdade a cada ~2,3 dias, e muda por signo: no mesmo dia, doze
  // signos recebem até sete relações ptolomaicas diferentes com a mesma Lua.
  if (relacaoLua) {
    const lines = [
      linha('horoscope.sky.moon.position', {
        signoLua: ceu.luaSigno,
        emoji: ceu.luaEmoji || '',
      }),
      linha(skyKey(`moon.rel.${relacaoLua}`), { signo: signName, signoLua: ceu.luaSigno }),
    ];
    if (ceu.luaDignidade && ceu.luaDignidade !== 'peregrino') {
      lines.push(linha(skyKey(`moon.dignity.${ceu.luaDignidade}`), { signoLua: ceu.luaSigno }));
    }
    // A régua da conta (signo inteiro, sem orbe, Tetrabiblos I.13) é MÉTODO:
    // ela diz como a linha acima foi obtida e o que ela não promete.
    lines.push(nota('horoscope.sky.moon.wholeSign'));
    blocks.push({ id: 'moon', titleKey: 'horoscope.sky.moonTitle', lines });
  }

  // A mudança fraca entra aqui: depois dos dois blocos que falam do signo de
  // quem lê, e antes dos blocos que valem igual para os doze signos.
  if (blocoDeMudanca && mudancaFraca) blocks.push(blocoDeMudanca);

  // --- Bloco 3: o QUARTO lunar (Tetrabiblos I.8), não a fase de oito -------
  if (ceu.quartoId) {
    blocks.push({
      id: 'quarter',
      titleKey: 'horoscope.sky.quarterTitle',
      lines: [
        linha(skyKey(`quarter.${ceu.quartoId}`), { graus: String(ceu.elongacao) }),
        linha(skyKey(`quarter.practice.${ceu.quartoMetade}`)),
        // A explicação de por que o app lê o QUARTO e não a fase de oito nomes
        // (Rudhyar, 1967) é MÉTODO. A correção que ela carrega — "colher para
        // guardar é minguante, não é Lua Cheia" — já foi dita na linha de
        // prática acima, que é leitura; aqui é a genealogia do rótulo.
        nota('horoscope.sky.quarter.eightNames', { fase: ceu.faseNome }),
      ],
    });
  }

  // --- Bloco 4: o regente do dia da semana (ordem caldaica) ----------------
  blocks.push({
    id: 'day',
    titleKey: 'horoscope.sky.dayTitle',
    lines: [
      linha('horoscope.sky.day.chaldean', {
        dia: i18nVar(skyKey(`weekday.${ceu.diaSemana}`)),
        planeta: i18nVar(planetaNomeKey(ceu.regenteDoDia)),
      }),
      // Qualidade térmica de Tetrabiblos I.4, emprestada de lib/grounding.js já
      // traduzida — uma fonte só, uma redação só.
      linha(planetaQualidadeKey(ceu.regenteDoDia)),
      // O aviso de que a qualidade de Tetrabiblos I.4 é FÍSICA e que ler "dia
      // de Saturno" como dia pesado é transposição nossa: MÉTODO, e dos mais
      // importantes do app — mas é sempre a mesma frase, e repeti-la em
      // primeiro plano todo dia é o caminho mais curto para deixarem de lê-la.
      nota('horoscope.sky.day.transposition'),
    ],
  });

  // --- Bloco 5: Mercúrio retrógrado, só quando o cálculo diz que sim -------
  if (ceu.mercurioRetrogrado === true) {
    blocks.push({
      id: 'retro',
      titleKey: 'horoscope.sky.retroTitle',
      // Valens é a leitura (o que a fonte antiga diz que a retrogradação faz);
      // o desmonte do folclore de séc. XX é a ressalva que a enquadra.
      lines: [linha('horoscope.sky.retro.valens'), nota('horoscope.sky.retro.folklore')],
    });
  }

  // --- Bloco 6: aspecto real do regente do seu signo neste dia -------------
  if (aspecto) {
    const lines = [
      linha('horoscope.sky.aspect.line', {
        a: i18nVar(planetaNomeKey(aspecto.planetA)),
        b: i18nVar(planetaNomeKey(aspecto.planetB)),
        aspecto: i18nVar(skyKey(`aspectName.${aspecto.aspectSlug}`)),
        orb: String(aspecto.orb).replace('.', ','),
      }),
      // Orbe é convenção moderna de software; conjunção não é aspecto em
      // Ptolomeu. As duas são ressalvas sobre COMO o número acima foi obtido.
      nota(
        aspecto.ptolomaico ? 'horoscope.sky.aspect.orbNote' : 'horoscope.sky.aspect.conjunction'
      ),
    ];
    blocks.push({ id: 'aspect', titleKey: 'horoscope.sky.aspectTitle', lines });
  }

  return {
    dateStr,
    available: true,
    facts: {
      luaSigno: ceu.luaSigno,
      luaEmoji: ceu.luaEmoji,
      faseNome: ceu.faseNome,
      faseEmoji: ceu.faseEmoji,
      iluminacao: ceu.iluminacao,
      elongacao: ceu.elongacao,
      quartoId: ceu.quartoId,
      quartoMetade: ceu.quartoMetade,
      diaSemana: ceu.diaSemana,
      regenteDoDia: ceu.regenteDoDia,
      regenteDoSigno: regente,
      signoDoRegente,
      dignidadeDoRegente: dignidadeRegente,
      regenteRetrogrado: regenteRetro,
      mercurioRetrogrado: ceu.mercurioRetrogrado,
      relacaoLua,
      aspecto,
    },
    blocks,
  };
}

// Assinatura do céu de um dia PARA UM SIGNO — a lista de chaves e valores que a
// tela vai renderizar, sem o texto. É o que test/dailyHoroscope.test.js compara
// para provar as duas coisas que o dono pediu: dois signos diferentes recebem
// leituras diferentes no mesmo dia, e o mesmo signo recebe leituras diferentes
// em dias de céu diferente. Comparar assinatura em vez de texto mantém o teste
// válido quando a redação for revista.
export function assinatura(signName, date = new Date()) {
  const h = horoscopeFor(signName, date);
  if (!h.available) return 'indisponivel';
  return h.blocks
    .map((b) =>
      b.lines
        .map((l) => {
          const vars = l.vars
            ? Object.keys(l.vars)
                .sort()
                .map((k) => {
                  const v = l.vars[k];
                  return `${k}=${v && v.i18n ? v.i18n : v}`;
                })
                .join(',')
            : '';
          return `${l.key}(${vars})`;
        })
        .join('|')
    )
    .join('||');
}

// Resumo de UMA linha para o Diário Cósmico. Também sai de cálculo: sem céu não
// há frase — e o Diário simplesmente não recebe entrada nesse dia, em vez de
// receber uma linha inventada.
export function resumoDoDia(signName, date = new Date()) {
  const h = horoscopeFor(signName, date);
  if (!h.available) return null;
  const f = h.facts;
  const partes = [`${f.faseEmoji || ''} ${f.faseNome}`.trim(), `Lua em ${f.luaSigno}`];
  if (f.regenteDoSigno && f.signoDoRegente) {
    partes.push(`${f.regenteDoSigno} (regente de ${signName}) em ${f.signoDoRegente}`);
  }
  partes.push(`dia de ${f.regenteDoDia}`);
  return partes.join(' · ');
}
