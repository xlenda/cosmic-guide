// Banco de leituras MOCK para a tela de Leitura de Mão (PalmScreen). Tudo aqui
// é conteúdo fixo local, sem qualquer análise real da foto enviada — é só um
// placeholder honesto até existir visão computacional de verdade por trás.
//
// TODO(real-AI): trocar o corpo desta função por uma chamada à API real
// quando houver uma ANTHROPIC_API_KEY (ou similar) com suporte a visão
// disponível. Como este é um app RN client-side, a chave NÃO pode viver
// aqui — precisa de um endpoint de proxy no backend Express (mesmo padrão
// do backend Hotmart já existente), ex.: POST /api/palm { imageBase64 } ->
// leitura real da IA, mantendo a key só no servidor. A foto seria enviada
// pro proxy, nunca analisada localmente como é feito hoje.

const READINGS = [
  {
    title: 'Recomeços e coragem',
    lines: {
      vida: 'A linha da vida fala de recomeços — não porque prevê datas, mas porque toda mão carrega marcas de quantas vezes você já se reergueu.',
      coracao: 'No amor, o convite aqui é encarar o medo de começar de novo, mesmo sem garantia de como vai terminar.',
      cabeca: 'Mentalmente, é hora de trocar a pergunta "e se der errado" por "e se eu nem tentar".',
    },
  },
  {
    title: 'Abertura no amor',
    lines: {
      vida: 'A vitalidade aqui pede menos pressa e mais presença nas coisas que já estão dando certo.',
      coracao: 'A linha do coração sugere uma abertura: talvez você esteja mais pronta(o) pra deixar alguém entrar do que imagina.',
      cabeca: 'A cabeça tenta racionalizar o que o coração já sentiu — vale ouvir os dois lados antes de decidir.',
    },
  },
  {
    title: 'Clareza mental e decisões',
    lines: {
      vida: 'A energia vital aqui está ligada a sustentar uma escolha até o fim, sem se distrair no meio do caminho.',
      coracao: 'No coração, a dica é não confundir medo de errar com falta de sentimento.',
      cabeca: 'A linha da cabeça se destaca: este é um momento de decisões, e a clareza vem mais de ouvir você mesma(o) do que de esperar um sinal de fora.',
    },
  },
  {
    title: 'Equilíbrio corpo-mente',
    lines: {
      vida: 'A linha da vida aponta pra um corpo que está pedindo mais atenção do que a rotina tem dado.',
      coracao: 'Emocionalmente, o convite é notar quando o cansaço físico vira também cansaço de sentir.',
      cabeca: 'Mentalmente, o equilíbrio vem de simplificar — nem tudo precisa ser resolvido hoje.',
    },
  },
  {
    title: 'Intuição e mudança de ciclo',
    lines: {
      vida: 'A linha da vida sugere que um ciclo está se fechando, mesmo que ainda não esteja nítido qual.',
      coracao: 'No campo afetivo, a intuição pode estar tentando avisar algo que a razão ainda não quis ouvir.',
      cabeca: 'Mentalmente, é um bom momento pra confiar mais no que você sente antes de qualquer coisa acontecer, e menos em certezas prontas.',
    },
  },
];

const QUESTIONS = [
  'O que dessa leitura mais fez sentido pra fase que você está vivendo?',
  'Qual dessas três linhas você sente que pesa mais em você agora?',
  'Se pudesse escolher uma coisa pra mudar hoje, qual seria?',
  'O que você adiou dizer pra si mesma(o) que talvez precise ouvir agora?',
  'Essa reflexão bateu com algo que você já vinha sentindo?',
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

// Ponto único de "leitura" do app hoje: não recebe nem analisa a foto de
// verdade — devolve uma reflexão simbólica mockada e honesta, sempre com uma
// pergunta reflexiva no final. Quando houver backend real com visão
// computacional, essa função vira uma chamada assíncrona pro proxy — ver
// TODO(real-AI) no topo do arquivo.
export function getMockPalmReading() {
  lastReadingIndex = pickIndex(READINGS.length, lastReadingIndex);
  lastQuestionIndex = pickIndex(QUESTIONS.length, lastQuestionIndex);

  const reading = READINGS[lastReadingIndex];
  const question = QUESTIONS[lastQuestionIndex];

  const body = [
    `Linha da vida: ${reading.lines.vida}`,
    `Linha do coração: ${reading.lines.coracao}`,
    `Linha da cabeça: ${reading.lines.cabeca}`,
    '',
    question,
  ].join('\n\n');

  return { title: reading.title, body };
}
