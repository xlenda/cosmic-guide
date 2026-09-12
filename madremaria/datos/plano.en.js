// datos/plano.en.js
// O INGLES do conteudo do plano do dia: cinco rituais, sete reflexoes, onze
// afirmacoes, quatro acoes de encontro. Arquivo VIZINHO de datos/plano.js (PT,
// fonte da estrutura) e de datos/plano.es.js. Comentarios em portugues.
//
// ===========================================================================
// O QUE NAO SE TRADUZ, E O QUE NAO SE PODE RECONTAR
// ===========================================================================
// 1. `id` do ritual — lib/plano.js devolve `ritual.id` e a tela decide por ele.
// 2. `camera` e `momento` (fasesLua / diasSemana): estrutura, lida do PT. Os
//    nomes de fase sao NOME CANONICO de lib/ceu.js e casam byte a byte; nao
//    estao aqui de proposito.
// 3. A CONTAGEM E A ORDEM: 5 / 7 / 11 / 4, mesma ordem do PT. lib/plano.js roda
//    a rotacao pelo INDICE e cinco, sete e onze sao primos entre si de proposito
//    (as tres rotacoes so coincidem a cada 385 dias). Dez afirmacoes em vez de
//    onze fariam o dia 12 repetir o dia 1.
// 4. A DOUTRINA: nenhum texto depende do ceu; nenhum promete desfecho nem diz o
//    que a outra pessoa faz ou sente; NENHUM GESTO EMPURRA PARA FORA — nao ha
//    reach out, text them, show up, let them know. O app reage ao contato; nao
//    provoca. A formula inglesa de nicho ("let him see what he's missing") nao
//    entra aqui em nenhuma forma suave.
//
// ===========================================================================
// GESTO OBSERVAVEL E O PAIS DO GESTO
// ===========================================================================
// Todo `acao` termina em algo respondivel com sim ou nao no fim do dia. Nenhum
// dos cinco depende do Brasil — cafe, papel na gaveta, a propria mao sob a luz,
// dez minutos na rua, a mesa posta — entao nenhum foi substituido. "Dez minutos
// de rua" virou "ten minutes outside": "on the street" em ingles americano
// carrega sentido de rua como lugar de quem nao tem casa, e o gesto e sair e
// voltar por outro caminho, nao o lugar.
//
// ===========================================================================
// GENERO: O PT TRAVA EM FEMININO TRES VEZES, O INGLES NAO MARCA
// ===========================================================================
// "coma sentada", "aprendeu a fazer sozinha", "foi feliz sozinha". O ingles nao
// concorda em genero em adjetivo, entao as tres atravessam neutras sem esforco
// — e e o certo: quem respondeu 'homem' ou 'prefiro-nao-dizer' em P7 recebe o
// mesmo plano. Mesma razao de lib/genero.js existir.

/* Os cinco rituais, por ID. Mapa e nao lista: a ordem e a estrutura moram no PT. */
export const RITUAIS_EN = {
  'cafe-da-manha': {
    titulo: "Today's coffee",
    acao: 'Make the coffee slowly and take a photo of the cup before the first sip.',
    porque: 'The photo stays on this phone. It is a record of your day, not a message to anyone.',
  },
  'linha-no-papel': {
    titulo: 'One line on paper',
    acao: 'Write down on a piece of paper the sentence that got stuck in your throat, and put the paper in a drawer.',
    porque:
      'No name on the paper: with a name, the gesture stops being about what you feel and becomes something aimed at another person.',
  },
  'leitura-da-mao': {
    titulo: 'The reading of the hand',
    acao: 'Open your hand under good light and trace the longest line with your finger, beginning to end, three times.',
    porque:
      'Reading your own hand is an old practice, and here it works as a pause. The hand you are looking at is yours.',
  },
  'caminho-de-volta': {
    titulo: 'Ten minutes outside',
    acao: 'Go out for ten minutes and come back by a different route than the one you took out.',
    porque: 'Changing the route changes what you notice. That is all it is, and that is plenty for one day.',
  },
  'mesa-posta': {
    titulo: 'The table set',
    acao: 'Set the table for yourself — plate, glass, napkin — and eat there, with no phone.',
    porque: 'Eating standing up is the fastest way for a whole day to go by without you in it.',
  },
};

/* SETE reflexoes, na MESMA ORDEM. Todas pergunta, todas sobre ela — nenhuma
 * pergunta pelo que a outra pessoa pensa, que e a pergunta que o app nao pode
 * responder e que, feita todo dia, vira ruminacao. */
export const REFLEXOES_EN = [
  'What did you miss today: the person, or the routine the two of you had?',
  'Of everything that happened, which part still hurts and which part only annoys you?',
  'If nobody were watching, what would you do with this afternoon?',
  'What good thing from that bond already existed before it, and is still yours?',
  'What did you learn to do on your own over these last few months?',
  'Are you waiting for a sign, or are you waiting for a decision of your own?',
  'Which limit did you let slide once, and would not let slide again?',
];

/* ONZE afirmacoes, na MESMA ORDEM. Todas no presente: afirmacao no futuro ("one
 * day I will understand") e promessa com outra roupa. Nenhuma ganhou "will come
 * back" na traducao — e a formula inglesa que o portao da doutrina morde. */
export const AFIRMACOES_EN = [
  'I can miss someone and still take no step today.',
  'My end of the thread is mine, and it is the only one I hold.',
  'I owe no one an explanation for how long I am taking.',
  'Today I take care of my part, which is the part that actually exists.',
  'I have the right to change my mind without telling anyone.',
  'Silence is not an answer, and it is not a punishment either.',
  'I do not need to understand everything today in order to live today.',
  'My calm is not being kept by anyone else.',
  'I choose what I do with my evening.',
  'Nothing in me is broken because that story did not close.',
  'I am the most constant person in this story.',
];

/* QUATRO acoes de encontro, na MESMA ORDEM.
 *
 * ESTA LISTA SO EXISTE PARA QUEM TEM CONTATO. Com 'le-escribi-no-responde',
 * 'cero-contacto' ou bloqueio, lib/plano.js NAO le este array — o bloco sai
 * travado com o motivo escrito. Por isso elas falam de mesa e de hora sem
 * rodeio, e por isso o portao varre a saida inteira naquele estado.
 *
 * Nenhuma promete desfecho, mesmo com contato ativo: oferecer uma mesa e uma
 * acao DELA, e o que acontece na mesa nao e assunto de um app de tarot. */
export const ENCONTROS_EN = [
  'Pick a place where you were already happy on your own, and block that hour in your day.',
  'Leave one evening genuinely free in your calendar, with no plan B and no end time.',
  'Offer a table and a time, short and clear: a thirty-minute coffee is enough.',
  'Plan something you would do anyway, and leave a chair open.',
];

export default { RITUAIS_EN, REFLEXOES_EN, AFIRMACOES_EN, ENCONTROS_EN };
