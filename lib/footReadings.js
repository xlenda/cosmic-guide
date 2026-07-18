// Banco de leituras MOCK para o modo Pé do hub de Leitura Simbólica
// (PalmScreen). Tudo aqui é conteúdo fixo local, sem qualquer análise real da
// foto enviada — é só um placeholder honesto até existir visão computacional
// de verdade por trás.
//
// TODO(real-AI): trocar o corpo desta função por uma chamada à API real
// quando houver uma ANTHROPIC_API_KEY (ou similar) com suporte a visão
// disponível. Como este é um app RN client-side, a chave NÃO pode viver
// aqui — precisa de um endpoint de proxy no backend Express (mesmo padrão
// do backend Hotmart já existente), ex.: POST /api/foot { imageBase64 } ->
// leitura real da IA, mantendo a key só no servidor. A foto seria enviada
// pro proxy, nunca analisada localmente como é feito hoje.

const READINGS = [
  {
    title: 'Base firme, caminho seu',
    zones: {
      arco: 'O arco do pé fala de sustentação — sinal de que você tem construído uma base mais firme do que imagina.',
      dedos: 'Os dedos voltados pra frente sugerem foco num objetivo que já está em movimento.',
      calcanhar: 'O calcanhar marcado indica raízes — memórias e pessoas que seguram você quando o caminho balança.',
    },
  },
  {
    title: 'Passos de mudança',
    zones: {
      arco: 'O arco aqui sugere flexibilidade: você tem se adaptado mais rápido do que costumava.',
      dedos: 'Os dedos mais afastados indicam vontade de explorar direções novas.',
      calcanhar: 'O calcanhar mais leve fala de menos peso do passado sendo carregado hoje.',
    },
  },
  {
    title: 'Cansaço que pede pausa',
    zones: {
      arco: 'O arco tenso sugere um corpo pedindo descanso antes mesmo da mente admitir.',
      dedos: 'Os dedos contraídos indicam algo sendo segurado com mais força do que o necessário.',
      calcanhar: 'O calcanhar mais apoiado fala de estabilidade buscada, mesmo em meio ao cansaço.',
    },
  },
  {
    title: 'Caminhada com propósito',
    zones: {
      arco: 'O arco elevado aponta pra alguém em movimento constante — sempre um passo à frente do planejado.',
      dedos: 'Os dedos alinhados sugerem clareza sobre a direção a seguir.',
      calcanhar: 'O calcanhar firme indica confiança no próprio ritmo, mesmo quando os outros seguem mais rápido ou mais devagar.',
    },
  },
  {
    title: 'Reencontro com o chão',
    zones: {
      arco: 'O arco relaxado fala de alguém se permitindo desacelerar sem culpa.',
      dedos: 'Os dedos soltos sugerem menos controle e mais confiança no que vem a seguir.',
      calcanhar: 'O calcanhar bem apoiado indica presença — os pés no chão, literalmente, num momento que pede isso.',
    },
  },
];

const QUESTIONS = [
  'O que dessa leitura mais fez sentido pra fase que você está vivendo?',
  'Qual dessas três regiões do pé você sente que fala mais forte com você agora?',
  'Se pudesse escolher uma direção nova pra seguir hoje, qual seria?',
  'O que você adiou dizer pra si mesma(o) que talvez precise ouvir agora?',
  'Essa reflexão bateu com o ritmo que você sente estar vivendo agora?',
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

// Ponto único de "leitura" do modo Pé hoje: não recebe nem analisa a foto de
// verdade — devolve uma reflexão simbólica mockada e honesta, sempre com uma
// pergunta reflexiva no final. Quando houver backend real com visão
// computacional, essa função vira uma chamada assíncrona pro proxy — ver
// TODO(real-AI) no topo do arquivo.
export function getMockFootReading() {
  lastReadingIndex = pickIndex(READINGS.length, lastReadingIndex);
  lastQuestionIndex = pickIndex(QUESTIONS.length, lastQuestionIndex);

  const reading = READINGS[lastReadingIndex];
  const question = QUESTIONS[lastQuestionIndex];

  const body = [
    `Arco do pé: ${reading.zones.arco}`,
    `Dedos: ${reading.zones.dedos}`,
    `Calcanhar: ${reading.zones.calcanhar}`,
    '',
    question,
  ].join('\n\n');

  return { title: reading.title, body };
}
