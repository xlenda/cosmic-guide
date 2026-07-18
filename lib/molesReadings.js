// Banco de leituras MOCK para o modo Pintas do hub de Leitura Simbólica
// (PalmScreen). Tudo aqui é conteúdo fixo local, sem qualquer análise real da
// foto enviada — é só um placeholder honesto até existir visão computacional
// de verdade por trás.
//
// TODO(real-AI): trocar o corpo desta função por uma chamada à API real
// quando houver uma ANTHROPIC_API_KEY (ou similar) com suporte a visão
// disponível. Como este é um app RN client-side, a chave NÃO pode viver
// aqui — precisa de um endpoint de proxy no backend Express (mesmo padrão
// do backend Hotmart já existente), ex.: POST /api/moles { imageBase64 } ->
// leitura real da IA, mantendo a key só no servidor. A foto seria enviada
// pro proxy, nunca analisada localmente como é feito hoje.

const READINGS = [
  {
    title: 'Marca de sorte quieta',
    traits: {
      localizacao: 'A posição dessa pinta é associada, na tradição popular, a uma sorte discreta — que age nos bastidores, não nos holofotes.',
      formato: 'O contorno arredondado sugere estabilidade: coisas que crescem devagar, mas duram.',
      constelacao: 'Isolada ou em grupo, essa marca reforça a ideia de que sua força vem da constância, não da pressa.',
    },
  },
  {
    title: 'Sinal de intuição',
    traits: {
      localizacao: 'Tradicionalmente, marcas nessa região são lidas como um lembrete pra confiar mais na intuição do que na lógica pura.',
      formato: 'O formato mais alongado remete a caminhos que ainda estão se desenhando, não totalmente definidos.',
      constelacao: 'O padrão de distribuição sugere fases de vida conectadas entre si, mesmo quando parecem desconexas.',
    },
  },
  {
    title: 'Marca de proteção',
    traits: {
      localizacao: 'Essa localização é lida, no folclore, como um sinal de proteção — alguém ou algo cuidando de você sem alarde.',
      formato: 'O contorno bem definido fala de limites que você tem aprendido a colocar com mais clareza.',
      constelacao: 'A presença de mais de uma marca próxima reforça a ideia de rede de apoio, mesmo que nem sempre visível.',
    },
  },
  {
    title: 'Sinal de recomeço',
    traits: {
      localizacao: 'Essa região, na tradição popular, está ligada a recomeços — ciclos que se fecham pra abrir espaço a outros.',
      formato: 'O formato irregular sugere que nem todo processo de mudança precisa ser organizado pra valer.',
      constelacao: 'O conjunto de marcas ali perto remete a experiências acumuladas, não a uma coisa isolada.',
    },
  },
  {
    title: 'Marca de temperamento forte',
    traits: {
      localizacao: 'Tradicionalmente essa posição é associada a temperamento forte e vontade própria.',
      formato: 'O contorno bem marcado reforça a leitura de alguém que não costuma passar despercebido(a).',
      constelacao: 'Mesmo sozinha, essa marca carrega peso simbólico — não precisa de companhia pra dizer algo sobre você.',
    },
  },
];

const QUESTIONS = [
  'O que dessa leitura mais fez sentido pra fase que você está vivendo?',
  'Qual dessas três leituras (localização, formato ou conjunto) fala mais forte com você agora?',
  'Se pudesse escolher uma coisa pra mudar hoje, qual seria?',
  'O que você adiou dizer pra si mesma(o) que talvez precise ouvir agora?',
  'Essa reflexão bateu com algo que você já sentia sobre seu próprio temperamento?',
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

// Ponto único de "leitura" do modo Pintas hoje: não recebe nem analisa a foto
// de verdade — devolve uma reflexão simbólica mockada e honesta, sempre com
// uma pergunta reflexiva no final. Quando houver backend real com visão
// computacional, essa função vira uma chamada assíncrona pro proxy — ver
// TODO(real-AI) no topo do arquivo.
export function getMockMolesReading() {
  lastReadingIndex = pickIndex(READINGS.length, lastReadingIndex);
  lastQuestionIndex = pickIndex(QUESTIONS.length, lastQuestionIndex);

  const reading = READINGS[lastReadingIndex];
  const question = QUESTIONS[lastQuestionIndex];

  const body = [
    `Localização: ${reading.traits.localizacao}`,
    `Formato: ${reading.traits.formato}`,
    `Conjunto: ${reading.traits.constelacao}`,
    '',
    question,
  ].join('\n\n');

  return { title: reading.title, body };
}
