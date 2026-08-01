// lib/traducoes/waiteRegras.en.js
// THE ENGLISH PACK of Waite's four rules of practice. Same SHAPE as
// lib/traducoes/waiteRegras.pt.js: same keys, same fields, functions with the
// same signature. The engine lives in lib/waiteRegras.js.
//
// What does NOT change from pt: the English verbatim (translating a quotation
// falsifies it), the name of the WORK, the years, and the internal KEYS — the
// four rule ids stay in Portuguese across all three packs, because they are
// data, not screen text.
//
// The two rules most easily broken here:
//   · HOOK FIRST. `chamada` is the real life of the person in this chair.
//     Waite, "1911" and "§8" may only appear in `recibo`.
//   · THE FOUR NOTES ARE NOT IN QUOTATION MARKS. This base does not hold the
//     literal 1911 English of the four (only the shuffling sentence, in
//     VERBATIM). Every `recibo` REPORTS what Waite wrote, unquoted. That
//     matters most in this pack, where invented English would read exactly
//     like the original.

const TITULO = 'Four things before you draw';

const ABERTURA =
  'You can tap the button right now and have three cards on screen in two seconds. That part is a draw. ' +
  'What turns it into a reading is four small things, done first, in this chair, with the phone in your hand: ' +
  'say the question out loud, shuffle without answering it inside your head, admit which answer you were hoping for, ' +
  'and read as if the cards belonged to somebody else. All four together take under a minute.' +
  '\n\n' +
  'None of them is the app talking. This is the list of practice notes A. E. Waite attached to his own book, ' +
  'The Pictorial Key to the Tarot, 1911, in Part III §8 — four items, in this order.' +
  '\n\n' +
  'Waite is the man who commissioned Pamela Colman Smith to paint the deck this screen draws from: the cards came out in London, ' +
  'from William Rider & Son, in December 1909, and the book followed two years later to explain them. ' +
  'Same hand, two years apart.';

const REGRAS = {
  pergunta: {
    titulo: 'Say the question out loud',
    chamada:
      'The question that comes up first is almost never one question. It is the guy who did not answer yesterday, the bill due on Friday, and your mother asking when this gets sorted out — all in the same thought. ' +
      'Mixed like that, three questions accept any card as an answer, because any card fits one of them.',
    oQueVoceFaz: () =>
      'Pick one. Type it in the field above, then say it, with your mouth, at the volume of somebody talking to a person in the room. It is awkward the first time. That is the whole rule.',
    porQue: () =>
      'Speaking finishes the sentence. A question you only think stays half built and bends toward whatever shows up; a question you say has a beginning and an end, and you hear on the spot how vague it was.',
    recibo:
      'First of the four practice notes A. E. Waite gives in The Pictorial Key to the Tarot, 1911, Part III §8: formulate the question definitely and repeat it aloud before starting.',
  },
  embaralhar: {
    titulo: 'Shuffle with an empty head',
    chamada:
      'This is the part nobody does. While the hand shuffles, the head is already building the verdict: a good card means I stay, a bad card means I end it on Sunday. ' +
      'At that point the deck has become an audience.',
    oQueVoceFaz: () =>
      'While the cards shuffle on screen, count to twenty watching them and answer nothing inside. If the thought jumps to the answer, go back to one. Twenty seconds, the length of the animation — and the twenty is ours, not his.',
    porQue: () =>
      'This is not mysticism, it is order of operations. Somebody who answered before turning the card is not reading the card: they are checking whether it agrees.',
    recibo:
      'Second practice note in A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §8: keep the mind as blank as possible while shuffling. ' +
      'And his shuffling has a second half almost nobody quotes — in the same paragraph he says to turn part of the pack upside down before mixing. ' +
      'That is where the reversed card comes from: from his alternative method, not from the Celtic Cross in the same book, which mentions no reversed card at all. ' +
      'Card by card reversed meanings are older than Waite and come from Etteilla, from 1770 onwards.',
  },
  vies: {
    titulo: 'Say which answer you were hoping for',
    chamada:
      'It is rare for anybody to open a deck without wanting one outcome. You want it to say stay, or to say go, or to say it was not your fault. ' +
      'The problem is never the wanting — it is the wanting walking in dressed as a reading.',
    oQueVoceFaz: () =>
      'Before you draw, finish this sentence out loud: I wanted the card to say ____. In plain words, no decoration, once.',
    porQue: () =>
      'A named preference is still there, but it becomes visible. From then on the table holds two separate things: what the card brings and what you wanted it to bring.',
    recibo:
      'Third practice note in A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §8: set personal bias and preconceived ideas aside, or the judgement comes out tinted by them.',
  },
  estranho: {
    titulo: 'Read it as if it belonged to somebody else',
    chamada:
      'The hardest reading there is is your own. For a friend you settle it in two minutes: you see the whole shape, you speak without fear, you get the tone right. ' +
      'In your own you are inside the shape — and from inside, the shape is invisible.',
    oQueVoceFaz: (c) =>
      c.paraQuem === 'outra'
        ? 'You landed on the easy case: the reading belongs to somebody else. Use the advantage and do not trim what sounds unkind — trimming so as not to hurt is the bias from rule three, wearing a tie.'
        : 'When the three cards land, say out loud what you would tell a friend who drew exactly those cards in exactly your situation. Then notice what you were about to tell yourself. The gap between those two sentences is the size of today’s bias.',
    porQue: (c) =>
      c.paraQuem === 'outra'
        ? 'The closer the life at stake, the less distance there is to see it. Stranger, friend, yourself: that is the order of difficulty in the source, and reading for another person puts you on the easiest step.'
        : 'The closer the life at stake, the less distance there is to see it. Stranger, friend, yourself: that is the order of difficulty in the source, and you are standing on the top step of it.',
    recibo:
      'Fourth practice note in A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §8: because of bias, it is easier to divine correctly for a stranger than for oneself or for a friend. ' +
      'And it is worth saying what that implies in here: most of the time this app does precisely the case Waite calls the hardest — you reading for you. ' +
      'The rule does not disqualify the reading; it says where to pay attention. The trick of speaking as if to a friend is the app’s: Waite states the difficulty and teaches no way around it.',
  },
};

const VERBATIM = {
  embaralhar: {
    texto: 'Shuffle the entire pack and turn some of the cards round, so as to invert their tops.',
    parafrase:
      'Waite’s own sentence, opening his alternative reading method — and the exact address where the reversed card enters the practice.',
    locus: 'A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §8',
  },
};

const PERGUNTA = {
  rotulo: 'Your question',
  ajuda: 'One question, written the way you would say it.',
  exemplos: [
    'What is holding me back in the conversation I keep not starting?',
    'What am I not seeing about this new job?',
    'What is my fear of calling my mother made of?',
  ],
  avaliacao: {
    vazia:
      'No question written yet. You can draw anyway, the app locks nothing — but the first note from 1911 is exactly this one: a formulated question, not a loose topic.',
    curta:
      'It came out short. This is the app reading the text, not a rule of Waite: under four words there is usually plenty of topic and no question. Say what you want to know, about whom, and since when.',
    duasPerguntas:
      'There is more than one question in there. Pick one for this draw and keep the other — the 1911 note asks for a formulated question, singular.',
    definida:
      'One question, with a beginning and an end. Now the awkward part, which is the whole rule: say it out loud, once.',
  },
  emVozAlta:
    'Out loud for real. The 1911 note has the question repeated aloud before starting, and it is the only one of the four that makes a sound.',
};

const PROGRESSO = {
  nenhuma:
    'None of the four yet. Together they take under a minute, and they lock nothing: the draw button stays where it is.',
  parcial: (c) => `${c.feitas} of ${c.total} done. Next one: ${c.proxima}.`,
  completo: 'All four done. The list is from 1911 and it fitted into a minute of today. Go ahead and draw.',
};

const BOTAO = {
  antes: 'Draw the three cards',
  depois: 'Did all four — draw the cards',
};

const GRAUS = { FP: 'primary source', TP: 'later tradition' };

const NOTAS_DE_DATACAO = {
  pictorialKey: 'The book the four practice notes live in, and the source of everything this screen says.',
  baralhoRWS:
    'The deck this screen draws from. Art by Pamela Colman Smith, concept and structure by A. E. Waite, published in London by William Rider & Son — two years before the book.',
  etteilla:
    'The man who established card by card reversed meanings. Every reversed reading in the world descends from there, and it predates Waite.',
  cruzCelta:
    'The ten-card spread Waite named an ancient Celtic method, in the same book. The name is his, from 1911; the structure comes out of Golden Dawn circles. And it mentions no reversed card at any point.',
};

const NOTA_SEM_TRANCA =
  'The app does not lock the button, and that is our decision resting on the source: Waite called the four items notes on practice, not conditions. Anyone who wants to draw straight away, draws.';

const NOTA_LEITURA_DO_APP =
  'What is Waite and what is the app. The four rules are his, from 1911, and they sit here in the order he wrote them; the way of telling them in today’s English is ours. ' +
  'Two measurements are ours too, and they are declared where they appear: the twenty seconds of shuffling (he asks for a blank mind and gives no duration) and the four-word floor on the question (he asks for a definite question and does not say how that is measured). ' +
  'And there is a bigger difference, better said than hidden: the three-card spread with past, present and future is not in The Pictorial Key. ' +
  'The book describes three methods — of ten, of forty-two and of thirty-five cards — and none of them is that one. ' +
  'The four rules of preparation work for any spread; the three-card one is our choice, popularised in the 20th century, and no dated source older than that came out of this base.';

const FONTES = [
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §8 — the four practice notes: question formulated and repeated aloud, mind as blank as possible while shuffling, personal bias set aside, and reading for a stranger as the easier case',
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §8 — "Shuffle the entire pack and turn some of the cards round, so as to invert their tops": the instruction to invert cards sits in his alternative method',
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Part III §7 — the Celtic Cross, ten cards, and not one line about reversed cards',
  'Pamela Colman Smith (art) and A. E. Waite (concept), deck published by William Rider & Son, London, December 1909 — two years before the book',
  'Etteilla, from 1770 onwards — systematic card by card reversed meanings, older than Waite',
  'French cartomancy of the 18th–19th centuries, passé, présent, avenir — the idea of splitting a reading into three times, which the app uses and the Pictorial Key does not carry',
];

export const PACK = {
  idioma: 'en',
  tela: 'Tarot by Theme',
  titulo: TITULO,
  abertura: ABERTURA,
  regras: REGRAS,
  verbatim: VERBATIM,
  pergunta: PERGUNTA,
  progresso: PROGRESSO,
  botao: BOTAO,
  graus: GRAUS,
  notasDeDatacao: NOTAS_DE_DATACAO,
  notaSemTranca: NOTA_SEM_TRANCA,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  fontes: FONTES,
};

export default PACK;
