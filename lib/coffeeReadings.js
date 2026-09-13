// Banco de leituras MOCK para a tela de Ritual do Café (CoffeeScreen). Tudo
// aqui é conteúdo fixo local, sem qualquer análise real da foto enviada — é
// só um placeholder honesto até existir visão computacional de verdade por
// trás.
//
// TODO(real-AI): trocar o corpo desta função por uma chamada à API real
// quando houver uma ANTHROPIC_API_KEY (ou similar) com suporte a visão
// disponível. Como este é um app RN client-side, a chave NÃO pode viver
// aqui — precisa de um endpoint de proxy no backend Express (mesmo padrão
// do backend Hotmart já existente), ex.: POST /api/coffee { imageBase64 } ->
// leitura real da IA, mantendo a key só no servidor. A foto seria enviada
// pro proxy, nunca analisada localmente como é feito hoje.

const READINGS = [
  {
    title: 'Caminhos se abrindo',
    zones: {
      borda: 'Perto da borda, as formas falam do que está mais próximo — pequenos sinais de que um caminho novo está prestes a se abrir.',
      meio: 'No meio da xícara, o desenho sugere o presente: uma fase de escolhas que ainda não foram totalmente assumidas.',
      fundo: 'No fundo, a borra guarda o que é mais profundo — raízes antigas que ainda sustentam suas decisões de hoje.',
    },
  },
  {
    title: 'Encontros e reencontros',
    zones: {
      borda: 'Na borda, as manchas remetem a encontros próximos — conversas que podem reacender algo que parecia adormecido.',
      meio: 'No meio, os traços formam algo como um laço: o convite é notar quem realmente está presente na sua rotina agora.',
      fundo: 'No fundo da xícara, aparece um resquício de memória antiga, como se um capítulo passado ainda pedisse fechamento.',
    },
  },
  {
    title: 'Clareza depois da dúvida',
    zones: {
      borda: 'Perto da borda, os desenhos sugerem notícias ou conversas que devem trazer mais clareza em breve.',
      meio: 'No meio, a forma central lembra uma balança — sinal de que uma decisão está sendo pesada com mais cuidado do que o normal.',
      fundo: 'No fundo, a borra mais densa fala de algo que você já sabe no fundo, mas ainda hesita em admitir.',
    },
  },
  {
    title: 'Movimento e mudança de ares',
    zones: {
      borda: 'Na borda, os traços soltos indicam movimento — uma vontade de sair da rotina e mudar de ares.',
      meio: 'No meio, a forma aberta sugere que há espaço para recomeçar algo sem carregar o peso do que já passou.',
      fundo: 'No fundo, resta uma marca fixa, como uma âncora: um valor ou pessoa que continua servindo de base mesmo com a mudança.',
    },
  },
  {
    title: 'Coração e paciência',
    zones: {
      borda: 'Perto da borda, as formas curvas apontam para o campo afetivo — sentimentos que estão mais à flor da pele do que parecem.',
      meio: 'No meio, o desenho fala de paciência: algo está amadurecendo no seu tempo, mesmo que a vontade seja acelerar.',
      fundo: 'No fundo, a borra concentrada sugere uma pergunta que você vem evitando fazer a si mesma(o).',
    },
  },
];

const QUESTIONS = [
  'O que dessa leitura mais fez sentido pra fase que você está vivendo?',
  'Qual dessas três regiões da xícara você sente que fala mais forte com você agora?',
  'Se pudesse escolher uma coisa pra mudar hoje, qual seria?',
  'O que você adiou dizer pra si mesma(o) que talvez precise ouvir agora?',
  'Essa reflexão bateu com algo que você já vinha sentindo antes mesmo de tomar o café?',
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
export function getMockCoffeeReading() {
  lastReadingIndex = pickIndex(READINGS.length, lastReadingIndex);
  lastQuestionIndex = pickIndex(QUESTIONS.length, lastQuestionIndex);

  const reading = READINGS[lastReadingIndex];
  const question = QUESTIONS[lastQuestionIndex];

  const body = [
    `Perto da borda: ${reading.zones.borda}`,
    `No meio da xícara: ${reading.zones.meio}`,
    `No fundo da xícara: ${reading.zones.fundo}`,
    '',
    question,
  ].join('\n\n');

  // isGeneric: MARCADOR, NAO CONTRATO (corrigido em 13/09/2026).
  //
  // Este comentario dizia "a tela usa isso pra DIZER que a leitura e simbolica
  // geral". Nao usa, e nunca usou: varri o repo e NENHUMA tela le isGeneric,
  // nem renderiza a chave de confissao 'reading.genericNote' (que existe
  // traduzida nos 3 idiomas em lib/i18n.js e nao e lida por ninguem).
  //
  // A doutrina de hoje e MAIS DURA que essa confissao, e por isso o app nao
  // mente em producao: test/aiHonestyScreens.test.js PROIBE as telas de
  // chamarem estes mocks e EXIGE que mostrem o aviso de IA indisponivel quando ela
  // falha. Ou seja, quando a IA cai a pessoa ve "nao consegui ler agora" — e
  // nao um texto plausivel fabricado.
  //
  // ⚠️ A ARMADILHA, e o motivo deste aviso existir: ficou no repo um kit
  // completo — funcao mock de leitura plausivel, um flag pra declara-la e uma
  // frase de confissao em 3 idiomas — todo desconectado. Quem precisar de um
  // fallback acha o kit montado, liga o mock confiando que a confissao vem
  // junto (era o que o comentario antigo GARANTIA) e publica leitura fabricada
  // sem aviso. Isso e a lei 1, NUNCA FABRICAR, e o caso real que a originou
  // esta aqui embaixo. Antes de ligar qualquer coisa disto: a tela TEM de
  // renderizar a confissao, e o portao de honestidade tem de ser reescrito.
  //
  // Caso real (29/07/2026): sonho sem agua nenhuma recebeu "Aguas que revelam
  // emocoes".
  return { ...({ title: reading.title, body }), isGeneric: true };
}
