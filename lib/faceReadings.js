// Banco de leituras MOCK para o modo Rosto do hub de Leitura Simbólica
// (PalmScreen). Tudo aqui é conteúdo fixo local, sem qualquer análise real da
// foto enviada — é só um placeholder honesto até existir visão computacional
// de verdade por trás.
//
// TODO(real-AI): trocar o corpo desta função por uma chamada à API real
// quando houver uma ANTHROPIC_API_KEY (ou similar) com suporte a visão
// disponível. Como este é um app RN client-side, a chave NÃO pode viver
// aqui — precisa de um endpoint de proxy no backend Express (mesmo padrão
// do backend Hotmart já existente), ex.: POST /api/face { imageBase64 } ->
// leitura real da IA, mantendo a key só no servidor. A foto seria enviada
// pro proxy, nunca analisada localmente como é feito hoje.

const READINGS = [
  {
    title: 'Mente clara, passo firme',
    features: {
      testa: 'A testa aqui fala de uma mente que já processou mais do que aparenta — não é sobre estar com tudo resolvido, é sobre confiar no que você já entendeu.',
      olhos: 'O olhar sugere alguém que enxerga além do óbvio, mesmo quando escolhe não comentar tudo o que percebe.',
      boca: 'A expressão ao redor da boca aponta pra uma comunicação que está mais sincera do que costumava ser.',
    },
  },
  {
    title: 'Coração visível no rosto',
    features: {
      testa: 'A testa relaxada indica que uma preocupação recente perdeu peso — o corpo começou a descansar antes da mente perceber.',
      olhos: 'Os olhos carregam um brilho de quem está se permitindo sentir de novo, sem tanta blindagem.',
      boca: 'O contorno da boca sugere palavras guardadas que ainda esperam a hora certa de sair.',
    },
  },
  {
    title: 'Determinação silenciosa',
    features: {
      testa: 'A testa marcada fala de decisões que já foram tomadas internamente, mesmo sem anúncio.',
      olhos: 'O olhar firme mostra alguém pronto pra sustentar uma escolha até o fim.',
      boca: 'Os lábios contidos sugerem que nem tudo precisa ser dito pra ser verdadeiro.',
    },
  },
  {
    title: 'Abertura para o novo',
    features: {
      testa: 'A testa aqui indica curiosidade recuperada — vontade de aprender algo fora da rotina.',
      olhos: 'O olhar vivo sugere disposição pra enxergar pessoas e situações sem os filtros de antes.',
      boca: 'O sorriso contido nos cantos da boca fala de uma alegria que ainda está se permitindo aparecer.',
    },
  },
  {
    title: 'Serenidade conquistada',
    features: {
      testa: 'A testa serena mostra alguém que parou de lutar contra algo que não dependia só dela(e).',
      olhos: 'Os olhos tranquilos indicam aceitação, não resignação — são coisas diferentes.',
      boca: 'A boca relaxada sugere que o silêncio, agora, é escolha e não fuga.',
    },
  },
];

const QUESTIONS = [
  'O que dessa leitura mais fez sentido pra fase que você está vivendo?',
  'Qual dessas três regiões do rosto você sente que fala mais forte com você agora?',
  'Se pudesse mudar uma coisa na forma como você se expressa hoje, qual seria?',
  'O que você adiou dizer pra si mesma(o) que talvez precise ouvir agora?',
  'Essa reflexão bateu com algo que as pessoas já comentam sobre sua expressão?',
];

// Evita repetir a mesma leitura duas vezes seguidas (não precisa persistir
// entre sessões, só durante o uso do app).
let lastReadingIndex = -1;
let lastQuestionIndex = -1;

function pickIndex(poolLength, lastIndex) {
  if (poolLength === 1) return 0;
  let index = Math.floor(Math.random() * poolLength);
  if (index === lastIndex) {
    index = (index + 1) % poolLength;
  }
  return index;
}

// Ponto único de "leitura" do modo Rosto hoje: não recebe nem analisa a foto
// de verdade — devolve uma reflexão simbólica mockada e honesta, sempre com
// uma pergunta reflexiva no final. Quando houver backend real com visão
// computacional, essa função vira uma chamada assíncrona pro proxy — ver
// TODO(real-AI) no topo do arquivo.
export function getMockFaceReading() {
  lastReadingIndex = pickIndex(READINGS.length, lastReadingIndex);
  lastQuestionIndex = pickIndex(QUESTIONS.length, lastQuestionIndex);

  const reading = READINGS[lastReadingIndex];
  const question = QUESTIONS[lastQuestionIndex];

  const body = [
    `Testa: ${reading.features.testa}`,
    `Olhos: ${reading.features.olhos}`,
    `Boca: ${reading.features.boca}`,
    '',
    question,
  ].join('\n\n');

  return { title: reading.title, body };
}
