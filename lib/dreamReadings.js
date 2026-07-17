// Banco de leituras MOCK para a tela de Sonhos (DreamScreen). Tudo aqui é
// conteúdo fixo local, sem qualquer análise real do texto do sonho enviado —
// é só um placeholder honesto usado quando a IA real (POST /api/dream) não
// responde. Ver lib/aiClient.js -> fetchAiDreamReading para a chamada real.
//
// Mesmo padrão de lib/palmReadings.js: banco de textos variados + evita
// repetir a mesma leitura duas vezes seguidas, sempre com uma pergunta
// reflexiva no final e o disclaimer de que é simbólico/entretenimento.

const READINGS = [
  {
    title: 'Águas que revelam emoções',
    body:
      'Sonhos com água costumam falar de emoção em movimento — calma quando ela está serena, turbulência quando vem em ondas ou tempestade. ' +
      'Não é sobre prever nada, mas sobre notar o que anda pedindo espaço para ser sentido antes de vir à tona sozinho.',
  },
  {
    title: 'Quedas e a busca por controle',
    body:
      'Sonhar que está caindo geralmente aparece quando alguma área da vida parece sem apoio ou fora do seu controle. ' +
      'Simbolicamente, é menos um aviso e mais um convite a perguntar onde você sente que falta chão firme agora.',
  },
  {
    title: 'Voos e o desejo de liberdade',
    body:
      'Voar em sonho costuma se conectar à vontade de escapar de um peso ou de enxergar uma situação de mais longe. ' +
      'É um símbolo de leveza e perspectiva, não uma mensagem literal sobre o futuro.',
  },
  {
    title: 'Perseguições e o que se evita',
    body:
      'Ser perseguida(o) em sonho costuma simbolizar algo que a mente evita encarar de frente durante o dia — um sentimento, uma conversa, uma decisão. ' +
      'O sonho não aponta o quê exatamente; isso só quem sonhou sabe olhando pra própria rotina.',
  },
  {
    title: 'Casas e cômodos desconhecidos',
    body:
      'Explorar uma casa com cômodos que você não conhecia costuma representar partes de si mesma(o) ainda pouco exploradas. ' +
      'É um símbolo de autoconhecimento em andamento, não um mapa de um lugar real.',
  },
  {
    title: 'Perder algo importante',
    body:
      'Sonhos de perda — de um objeto, de um caminho, de alguém de vista — costumam refletir um medo de perder controle sobre algo que importa na vida acordada. ' +
      'Vale menos temer o sonho em si e mais perguntar o que essa sensação de perda tem ecoado no dia a dia.',
  },
];

const QUESTIONS = [
  'Que sentimento ficou mais forte quando você acordou desse sonho?',
  'Alguma coisa da sua rotina recente combina com o que apareceu no sonho?',
  'Se esse sonho fosse uma mensagem sua pra você mesma(o), o que ele estaria tentando dizer?',
  'Esse tipo de sonho já se repetiu antes? O que muda de uma vez pra outra?',
  'O que você sentiu falta de fazer ou dizer antes de dormir essa noite?',
];

// Evita repetir a mesma leitura/pergunta duas vezes seguidas (não precisa
// persistir entre sessões, só durante o uso do app).
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

// Ponto único de "leitura" mockada do app: não analisa o texto do sonho de
// verdade — devolve uma reflexão simbólica genérica e honesta, sempre com
// uma pergunta reflexiva no final. Usada só quando fetchAiDreamReading falha
// (ver screens/DreamScreen.js).
export function getMockDreamReading(dreamText) {
  lastReadingIndex = pickIndex(READINGS.length, lastReadingIndex);
  lastQuestionIndex = pickIndex(QUESTIONS.length, lastQuestionIndex);

  const reading = READINGS[lastReadingIndex];
  const question = QUESTIONS[lastQuestionIndex];

  const body = [reading.body, '', question].join('\n\n');

  return { title: reading.title, body };
}
