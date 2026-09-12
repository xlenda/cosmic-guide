// datos/ritual.en.js
// INGLES do RITUAL DE SETE DIAS de datos/ritual.js. Arquivo VIZINHO, como
// datos/textos.en.js, e mesma forma do ritual.es.js ao lado.
//
// ATENCAO AO NOME: este NAO e datos/rituais.en.js (plural), que sao os gestos que
// giram. Aqui ha comeco, meio e FIM marcado no dia 7.
//
// ===========================================================================
// O QUE NAO ENTRA AQUI
// ===========================================================================
//   · dia — numero DADO, e aqui e a CHAVE do objeto DIAS. Nenhum titulo escreve
//     "Day 3": o numero vem do campo, e a tela e quem o desenha.
//   · espeja — id de pergunta de datos/preguntas.js. Chave tecnica.
//   · lectura / gesto.texto — ALIASES DERIVADOS no original.
//   · id e marco dos NUDOS.
//   · {fecha} em CIERRE.conEspejo — marcador de interpolacao, IDENTICO nos tres
//     idiomas. O nome do marcador NAO se traduz (nao vira {date}): quem chama
//     passa por 'fecha', e traduzir o marcador quebraria a interpolacao em
//     silencio. O que muda e a POSICAO que a gramatica pede: em ingles a data vem
//     depois de "On", como em portugues, mas sem "o".
//
// ===========================================================================
// A LINHA QUE NAO SE ATRAVESSA, EM INGLES
// ===========================================================================
// Nenhum texto promete desfecho nem fala do futuro de quem esta do outro lado. E
// em ingles o portao antigo nao ajuda: hablaDelFuturo() (lib/lectura.js) morde
// MORFOLOGIA de futuro PT/ES — '-rá', '-rán' — e "will come back" nao tem
// terminacao para morder. Quem guarda este arquivo e
// test/madremaria-promessa-tres-idiomas.test.js, com 28 formulas EN.
//
// Nenhum gesto empurra para fora. Em ingles o cuidado e extra porque "reach out"
// soa inofensivo e e exatamente o empurrao proibido: nos sete dias NAO existe um
// so gesto de contato, e o dia 3 e o contrario disso — a frase que ela quer
// mandar cabe NESTA tela.
//
// Nenhum texto diz que faltar um dia estraga alguma coisa; nenhum descreve EFEITO
// do gesto no corpo ou na mente ("this will calm you down" e alegacao de saude, e
// reprova na ficha da loja); e o genero de quem esta do outro lado nunca se
// assume: 'that person', 'they' — nunca 'he'/'she'.
//
// Os dois dias que o original registra como JA ESCRITOS ERRADO atravessam o
// conserto: o DIA 2 nao volta a dizer que puxar o fio move alguma coisa (aqui o
// fio so tem o lado que esta na mao dela), e o DIA 5 nao volta a dizer que a
// decisao de hoje muda o dia seguinte — quem espera uma pessoa voltar le isso
// como o efeito comecando.
//
// Os NUDOS sao FATO CONTAVEL: nights, nada mais. Nao existe "Free", nao existe
// "Healed". A armadilha ali e GRAMATICAL, nao lexical: "No longer waiting" nao usa
// palavra proibida nenhuma e afirma o que ela VIROU.
// ===========================================================================

export const PACTO = {
  titulo: 'Seven days, five minutes a day',
  cuerpo:
    'One small gesture a day, seven days, and that is it. No set time and no set place: five minutes, wherever you are. On the seventh day this device hands you back, with the date, the line you leave here today. None of this leaves this phone and none of this reaches that person. The seven days are yours.',
  boton: 'I am in for the seven days',
  nota: 'If a day goes by blank, it stays waiting just as it is. You come back and carry on from where you stopped.',
};

/* Os sete dias, pela CHAVE `dia` (1..7). A ordem sai do PT. */
export const DIAS = {
  1: {
    titulo: 'What you put down today',
    abertura:
      /* "this same line comes back to you" was the literal PT rendering and the
       * gate failed it, rightly: "comes back to you" is the funnel's exact
       * idiom, and this app cannot use it even when the subject is a line she
       * wrote herself. Rewritten so the subject is the DEVICE and the verb is
       * hands back, which is what actually happens on day 7. */
      'This is the first of the seven. Before anything else, put down what weighs on you now — in your words, however it comes out, without fixing the sentence. On the seventh day this device hands this same line back to you, with today’s date beside it. Nobody but you reads this: it stays on this device.',
    pregunta: 'What went unsaid when that broke?',
    placeholder: 'However it comes out. It stays on this device.',
    gesto: {
      titulo: 'One line only',
      cuerpo: 'Leave here, in one line only, what is weighing on you right now. Five minutes is enough.',
    },
    cierre: 'Kept with today’s date. This is the line that comes back on the seventh day.',
  },

  2: {
    titulo: 'Your hand on the knot',
    abertura:
      'Today the looking goes to one side of the thread only: the side in your hand. It is the only one you can say anything about without guessing.',
    pregunta: 'Which part of all this is really in your hand?',
    placeholder: 'What depended only on you today.',
    gesto: {
      titulo: 'One thing of yours',
      cuerpo: 'Pick one thing from today that depended only on you and write down which it was.',
    },
    cierre: 'Today the looking went to one side only: the side in your hand.',
  },

  3: {
    titulo: 'The late-night urge',
    abertura:
      'The urge to say something tends to keep a schedule, and everyone has their own. Today asks one thing only: noticing what yours is.',
    pregunta: 'What time of day does this usually tighten in you?',
    placeholder: 'The whole sentence, just as it came.',
    gesto: {
      titulo: 'The sentence fits here',
      cuerpo:
        'If the urge to say something tightens today, it fits here: leave the whole sentence on this screen, just as it came.',
    },
    cierre: 'The urge has a time, and now it has a place. What you do with it is still your choice.',
  },

  4: {
    titulo: 'Stop guessing',
    abertura:
      'A good part of the tiredness does not come from what happened: it comes from rebuilding in your head what is going on at the other end. No card reads that person, and neither does this device. What is left, once that goes out of the reckoning, is what can actually be known.',
    pregunta: 'What do you actually know, and what have you been assuming?',
    placeholder: 'What you have been assuming — and what you know.',
    gesto: {
      titulo: 'I know it or I assume it',
      cuerpo:
        'Write down one thing you have been assuming about that person and mark beside it: this I know, or this I assume.',
    },
    cierre:
      'No card reads that person, and neither does this device. Today you set apart what you know from what you assume.',
  },

  5: {
    titulo: 'One small decision today',
    abertura:
      'A big decision is not made in a hard week. A small one is — and it is the only one you can see through today, start to finish, without depending on anyone else.',
    pregunta: 'What was the smallest decision you made on your own today?',
    placeholder: 'The decision, and what happened once you saw it through.',
    gesto: {
      titulo: 'The size of today',
      cuerpo:
        'Pick a tiny decision for today, the size of five minutes, and write down which it was once you have seen it through.',
    },
    cierre: 'It was small and it was yours. That is the size that fits in a hard week.',
  },

  6: {
    titulo: 'The size of your part',
    abertura:
      'Your part is not the whole story, and it is not nothing either. It has a size, and you can say what it is without inflating it and without shrinking it.',
    pregunta: 'What was your part, said without exaggerating for either side?',
    placeholder: 'Start with "my part was".',
    gesto: {
      titulo: 'My part was',
      cuerpo: 'Leave here one sentence starting with "my part was".',
    },
    cierre: 'Not the whole story, not nothing. Today it came out the size it is.',
  },

  7: {
    titulo: 'The seventh day',
    abertura:
      'Seven days, seven records of yours. Today the device hands back the line from the first day exactly as you left it, with the date. It is not a diagnosis and it measures nothing: it is what was kept for seven days, handed back.',
    pregunta: 'What do you see now in that line from the first day?',
    placeholder: 'Today’s line, with the date.',
    gesto: {
      titulo: 'Read it and leave today’s line',
      cuerpo: 'Read the line from the first day and leave a new one underneath, with today’s date.',
    },
    cierre: 'Seven days, seven records of yours, with dates. They stay here, and you can reread them whenever you like.',
  },
};

/* AS DUAS MOLDURAS DO DIA 7. O {fecha} sobrevive IDENTICO — nao vira {date}. */
export const CIERRE = {
  conEspejo: 'On {fecha}, on the first day, you left this here:',
  sinEspejo:
    'On the first day you left no line written. The seven days count all the same: what was recorded were the dates, and they are here below.',
};

/* OS ROTULOS DOS NOS. Fato contavel: nights, nada mais. */
export const NUDOS = {
  unaNoche: 'One night',
  tresNoches: 'Three nights',
  cincoNoches: 'Five nights',
  sieteNoches: 'All seven nights',
};

export default { PACTO, DIAS, CIERRE, NUDOS };
