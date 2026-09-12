// datos/preguntas.en.js
// O INGLES das 7 perguntas do onboarding e da PANTALLA_CERO. Arquivo VIZINHO de
// datos/preguntas.js (PT, intacto) e de datos/preguntas.es.js. Comentarios em
// portugues, como em todo datos/.
//
// ===========================================================================
// O QUE NAO SE TRADUZ AQUI
// ===========================================================================
// `id` de pergunta e de opcao, `tipo`, `maxLargo`, `largo`, `anoMinimo`, a
// ORDEM. Os ids das opcoes sao o contrato do motor: 'le-escribi-no-responde' e
// 'cero-contacto' sao IDS_CONTACTO_DURO (o filtro que tira toda acao de
// "escreva para essa pessoa" do caminho de quem escreveu e nao teve resposta).
// Traduzir um id para 'i-wrote-no-answer' nao da erro: desliga a protecao em
// silencio para quem usa o app em ingles. Ver o cabecalho do .es.js.
//
// "Madre Maria" continua Madre Maria: e nome proprio, nao descricao.
//
// ===========================================================================
// A VOZ EM INGLES
// ===========================================================================
// Segunda pessoa ("you"), frases curtas, sem locutor. O ingles nao marca genero
// em adjetivo, entao a armadilha de P1..P6 (concordar com quem le antes de P7
// ser respondida) nao existe aqui — mas a regra 1 continua inteira: a outra
// pessoa e "that person" / "whoever is on the other side", nunca "he" nem
// "she". Vale em P4.
//
// PROMESSA: "it does not guess the ending" e a linha da PANTALLA_CERO, e P5 diz
// em voz alta que a leitura serve para entender e nao para prever. Nenhuma
// opcao de P5 virou "find out if they will come back" — e a formula inglesa que
// o portao da doutrina morde, e seria uma promessa nova que o PT nao faz.

export const PANTALLA_CERO_EN = {
  /* "stopped halfway" e a escolha que Onda 1 fixou em 'app.tagline'
     (datos/textos.en.js): "unfinished" diria que falta acabar, e prometeria o
     acabamento. Mesma frase nos dois lugares, uma voz so. */
  titulo: 'Three cards for the story that stopped halfway',
  cuerpo:
    'Today Madre Maria gives you a tarot reading about that bond that never closed: where it got tangled, what keeps it pulled tight, and which end of the thread you are holding. It does not guess the ending, because no card reads the other person.',
  boton: 'See my three cards',
};

/* As sete perguntas, por ID — mapa e nao lista, pelo mesmo motivo do .es.js: a
 * ordem canonica mora no PT e nao se repete aqui. */
export const PREGUNTAS_EN = {
  nombre: {
    texto: 'What is your name?',
    microcopy:
      'So the reading can call you by your name in the part that weighs the most, instead of a form-letter "hello". It stays on this phone: no account, no email, it is not sent anywhere.',
    placeholder: 'Your name',
  },

  corte: {
    texto: 'What happened between you two?',
    microcopy:
      'It sets the first card, the one about the knot. Without knowing where the thread got tangled, the reading would be about any story but yours.',
    opciones: {
      pelea: 'One bad argument, and it all broke right there',
      distancia: 'We drifted apart little by little, no fight',
      ruptura: 'We ended it: it was said in plain words',
      'me-arrepenti': 'I was the one who ended it, and I regretted it',
      'nunca-empezo': 'It never really got started',
    },
  },

  cuando: {
    texto: 'How long ago was that?',
    microcopy:
      'It changes the middle card: a week of tension does not look like a year of it. This is the only calendar detail we ask for, and that is why it is a range and not a date.',
    opciones: {
      dias: 'A few days ago',
      semanas: 'A few weeks',
      'meses-1-3': 'Between one and three months',
      'meses-3-12': 'Between three months and a year',
      'mas-de-un-ano': 'More than a year',
    },
  },

  hoy: {
    texto: 'How is the contact today?',
    microcopy:
      'It filters the action the reading ends with. Some advice makes no sense if you already wrote and nobody answered: with this answer it stays out, instead of showing up and pushing you to insist.',
    /* Texto traduzido, ids intocados: estes dois continuam IDS_CONTACTO_DURO. */
    opciones: {
      hablamos: 'We do talk, even if it is different from before',
      'le-escribi-no-responde': 'I wrote and no answer came',
      'cero-contacto': 'Zero contact for a while now, on both sides',
      /* "that person": regra 4 do contrato. Nunca "he", nunca "she". */
      'me-escribe-a-veces': 'Sometimes that person writes to me, with no clear pattern',
      bloqueo: 'There is a block in the middle',
    },
  },

  intencion: {
    texto: 'What do you want to understand today?',
    microcopy:
      'It sets the tone of the third card, the one that is only about you. There is no option here for guessing the ending: this reading is for understanding, not for predicting.',
    opciones: {
      'entender-que-paso': 'Understand what actually broke',
      'entender-mi-parte': 'See what my own part in this was',
      'decidir-insistir-o-soltar': 'Decide whether I keep insisting or let go',
      'entender-que-diria': 'Know what I would say if there were a conversation',
      'entender-para-cerrar': 'Understand enough to close the matter',
    },
  },

  nacimiento: {
    texto: 'What day were you born?',
    microcopy:
      'Two things come from this: your sign, which the app works out on its own — you do not have to find it in a list — and your age. They are what make the plan for the next few days speak to your stage of life instead of to just anyone. We do not ask for the time or the place. It stays on this phone, and it goes out with "Delete everything".',
    /* Rotulos de tela, em caixa alta como no PT. 'YEAR' caberia, mas 'YR' nao
     * e palavra: o campo tem largura para quatro letras (o placeholder e
     * 'YYYY'), entao fica 'YEAR'. */
    campos: {
      dia: { rotulo: 'DAY', placeholder: 'DD' },
      mes: { rotulo: 'MONTH', placeholder: 'MM' },
      ano: { rotulo: 'YEAR', placeholder: 'YYYY' },
    },
  },

  genero: {
    texto: 'And how should we speak to you?',
    microcopy:
      'It only changes the words the reading uses to address you — the closing is said in your gender, and not in someone else\'s. It changes no card, it changes nothing in the spread, and it says nothing about whoever is on the other side: about that person the app still asks nothing.',
    /* "I would rather not say" e resposta INTEIRA — ha um fecho neutro escrito
     * para ela (datos/profunda.js, FECHOS), nao um remendo. */
    opciones: {
      mulher: 'I am a woman',
      homem: 'I am a man',
      'prefiro-nao-dizer': 'I would rather not say',
    },
  },
};

export default { PANTALLA_CERO_EN, PREGUNTAS_EN };
