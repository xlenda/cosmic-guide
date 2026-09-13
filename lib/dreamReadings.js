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
