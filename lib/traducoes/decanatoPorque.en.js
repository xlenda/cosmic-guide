// lib/traducoes/decanatoPorque.en.js
// THE ENGLISH PACK for "why this card is this decan" — natural American app
// English, not a translation of the Portuguese sentence by sentence.
//
// Same SHAPE as lib/traducoes/decanatoPorque.pt.js: same keys, same fields,
// functions with the same signature. What NEVER changes between packs: the
// Robbins verbatim (translating a quotation falsifies it), the loci
// (Tetrabiblos I.22 stays Tetrabiblos I.22), the numbers, the WORK titles
// (Book T stays Book T) and the internal KEYS — planet, sign, suit, element and
// modality names stay in Portuguese across all three packs because they are
// data, not screen text.
//
// Every rule from the header of lib/decanatoPorque.js applies to each string
// here: hook first and source second, a locus on every historical claim, no
// health claim, no verdict and no promise, no defensive disclaimer — and the
// one specific to this feature: DO NOT READ ANYONE'S LIFE. This screen explains
// a fit, not what the card means for the person holding it.

const PLANETAS = {
  'Saturno': 'Saturn',
  'Júpiter': 'Jupiter',
  'Marte': 'Mars',
  'Sol': 'Sun',
  'Vênus': 'Venus',
  'Mercúrio': 'Mercury',
  'Lua': 'Moon',
};

const SIGNOS = {
  'Áries': 'Aries', 'Touro': 'Taurus', 'Gêmeos': 'Gemini', 'Câncer': 'Cancer',
  'Leão': 'Leo', 'Virgem': 'Virgo', 'Libra': 'Libra', 'Escorpião': 'Scorpio',
  'Sagitário': 'Sagittarius', 'Capricórnio': 'Capricorn', 'Aquário': 'Aquarius', 'Peixes': 'Pisces',
};

// The word that joins planet and sign in the label the deck publishes ("Mars in
// Aries"). The engine builds the label with it and compares it to the deck — if
// the two ever drift apart, the test catches it.
const CONECTOR = 'in';

const NAIPES = { paus: 'Wands', copas: 'Cups', espadas: 'Swords', ouros: 'Pentacles' };
const ELEMENTOS = { fogo: 'Fire', agua: 'Water', ar: 'Air', terra: 'Earth' };
const MODALIDADES = { cardinal: 'cardinal', fixo: 'fixed', mutavel: 'mutable' };
const ORDINAIS = { 1: 'first', 2: 'second', 3: 'third' };
const NUMERO_EXTENSO = {
  2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five', 6: 'Six',
  7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
};

// Author names lib/traducoes/datacao.js does not know yet: it covers the
// ancient cast (Ptolemy, Valens, Cato…), not the Golden Dawn or Cassius Dio,
// and this file cannot edit that one. Local extension with the SAME keys in all
// three packs; it loses to the shared map the day that map learns these names.
// See autorNaLingua() in the engine.
const AUTORES = {
  'Dio Cássio': 'Cassius Dio',
  'Ordem Hermética da Golden Dawn': 'Hermetic Order of the Golden Dawn',
  'Israel Regardie': 'Israel Regardie',
};

// The note that travels with each layer's source. It lives in the pack, not in
// the engine, because it is PROSE — "trad." is "trans." here, and Regardie's
// note is a whole sentence. The keys are the ones in the engine's
// CAMADAS[].fontes[].notaChave and are the SAME across the three packs.
const NOTAS_DE_FONTE = {
  robbins: 'trans. Robbins, 1940',
  cary: 'trans. Cary, LacusCurtius',
  regardie: 'the publication that took Book T out of the closed circle',
};

function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} and ${itens[itens.length - 1]}`;
}

function faixa(c) {
  return `from ${c.grauInicio}° to ${c.grauFim}° of ${c.signoNome}`;
}

// ---------------------------------------------------------------------------
// THE QUOTATIONS — verbatim, never translated
// ---------------------------------------------------------------------------
const VERBATIM = {
  ptolomeuRejeita: {
    texto:
      'These matters, as they have only plausible and not natural, but, rather, unfounded, arguments in their favour, we shall omit.',
    parafrase:
      'The most influential astrologer of the ancient world looks at the decans and says the arguments for them are plausible, not natural, and basically groundless — so he is leaving them out. He did. They survived without him.',
    obra: 'Tetrabiblos I.22',
    autor: 'Ptolomeu',
    quando: 'séc. II',
    nota: 'trans. Robbins, 1940',
  },
  ptolomeuFace: {
    texto:
      "The planets are said to be in their 'proper face' when an individual planet keeps to the sun or moon the same aspect which its house has to their houses",
    parafrase:
      'His "proper face" is a planet holding, toward the Sun or the Moon, the same angle its own house holds toward theirs. It is an angular relation. It is not the ten-degree slice of a sign — same word, different thing.',
    obra: 'Tetrabiblos I.23',
    autor: 'Ptolomeu',
    quando: 'séc. II',
    nota: 'trans. Robbins, 1940',
  },
};

// ---------------------------------------------------------------------------
// BLOCK 1 — THE HOOK. Real life, no technical term, no proper name, no century.
// It changes by suit, because the moment of pulling a card is different in each
// territory, and because one opener across 36 cards turns into recycled framing.
// ---------------------------------------------------------------------------
const CHAMADA = {
  paus: () =>
    'You shuffled with a decision stuck in your throat — whether to go, whether to stay, whether to send the text. This card came up. ' +
    'Which card comes up is chance, and tomorrow a different one might. Which piece of sky this card is: not chance at all. That was settled long before the deck reached your hands.',
  copas: () =>
    'You shuffled thinking about a person. Maybe about the conversation that stopped halfway, maybe about the one that never started. This card came up. ' +
    'Which card comes up is chance. Which piece of sky this card is, is not: that was settled long before the deck reached your hands.',
  espadas: () =>
    'You shuffled after the argument — the kind where the good comeback shows up three hours late. This card came up. ' +
    'Which card comes up is chance. Which piece of sky this card is, is not: that was settled long before the deck reached your hands.',
  ouros: () =>
    'You shuffled with this month\'s bill on your mind, or with work that refuses to move. This card came up. ' +
    'Which card comes up is chance, and tomorrow a different one might. Which piece of sky this card is: not chance at all. That was settled long before the deck reached your hands.',
};

// ---------------------------------------------------------------------------
// BLOCK 2 — THE EXPLANATION. Five paragraphs: opens in real life, lays out the
// rule, shows the arithmetic closing, and only then hands over the receipt with
// work, author and century.
// ---------------------------------------------------------------------------
const EXPLICACAO = (c) =>
  `There is something almost nobody separates when they pull a card. The shuffle decides WHICH card lands in your hand — and that is all it decides. ` +
  `What that card is, the piece of sky it stands for, the old name it carries: none of that was drawn along with it. ` +
  `It was written down first, in a rule that made no exception for any of the thirty-six numbered cards. And the rule fits in four steps.` +
  `\n\n` +
  `Step one: the suit gives the element. ${c.naipeNome} are ${c.elementoNome}, and ${c.elementoNome} in the sky means three signs — ${lista(c.signosDoElemento)}. ` +
  `Step two: the number picks which of the three. Two, Three and Four go to the cardinal sign of the element; Five, Six and Seven to the fixed one; Eight, Nine and Ten to the mutable one. ` +
  `This one is a ${c.numeroExtenso}, and the ${c.modalidadeNome} sign of ${c.elementoNome} is ${c.signoNome}. ` +
  `Step three: the number also picks the slice. Every sign runs thirty degrees and splits into three slices of ten — that is what the tradition calls a decan, one third of a sign. ` +
  `Two, Five and Eight take the first third; Three, Six and Nine the second; Four, Seven and Ten the third. The ${c.numeroExtenso} takes the ${c.ordinal}: ${faixa(c)}.` +
  `\n\n` +
  `Step four is the pretty one: the planet comes out of a count. Line up the thirty-six thirds in order, from the first of ${c.ariesNome} to the last of ${c.peixesNome}. ` +
  `Now deal the seven planets around them, always in this order — ${lista(c.ordemCaldaicaNome)} —, one per third, starting with ${c.planetaQueAbre} on third number one. ` +
  `${c.posicao === 1
      ? `This is third number one, and that is why the planet is ${c.planetaNome}.`
      : `This one is third number ${c.posicao} of thirty-six: ${c.passos} steps from ${c.planetaQueAbre} to here, and ${c.passos} steps around a wheel of seven land on ${c.planetaNome}.`} ` +
  `That is why this card is ${c.rotulo}. The traditional name it carries, ${c.tituloGD}, comes from the same table.` +
  `\n\n` +
  `And look at how the arithmetic closes. Twelve signs, three thirds each: thirty-six. The element steps forward every four signs and the trio of numbers steps forward every three; ` +
  `since three and four share no divisor, each suit gets each trio exactly once. That is why all four suits carry a complete Two, Three, Four, Five, Six, Seven, Eight, Nine and Ten — no card left over, no card missing. ` +
  `The planets, on the other hand, do not close evenly: thirty-six divided by seven is five with one left over. ${c.planetaQueAbre} shows up ${c.vezesDoPlanetaQueAbre} times in the lap, the other six show up ${c.vezesDosOutros} times each. The remainder is ${c.planetaQueAbre}, which is why the lap opens on it and closes on it.` +
  `\n\n` +
  `Now the receipt, because the three layers here are wildly different in age and the market sells all three as one. ` +
  `The ten-degree thirds were already in circulation and already contested in antiquity: ${c.autorPtolomeu}, in Tetrabiblos I.22, ${c.quandoPtolomeu}, writes of them "we shall omit" — the most systematic astrologer of the ancient world threw the decans out, and they survived anyway. ` +
  `The order of the seven planets used in the count is in ${c.autorDio}, ${c.quandoDio}, Historia Romana 37.18–19. ` +
  `And the people who fitted the thirty-six thirds onto the thirty-six cards were the ${c.autorGoldenDawn}, in Book T — The Tarot, ${c.anoBookT}, published by ${c.autorRegardie} in The Golden Dawn, ${c.quandoRegardie}. ` +
  `The structure of the sky is ancient; the fit onto the cards is barely over a hundred years old. Worth knowing which is which.`;

// ---------------------------------------------------------------------------
// THE RULE IN FOUR STEPS — for a screen that wants a numbered list
// ---------------------------------------------------------------------------
const A_REGRA = [
  {
    titulo: 'The suit gives the element',
    texto: (c) =>
      `${c.naipeNome} are ${c.elementoNome}. And ${c.elementoNome}, in the sky, means three signs: ${lista(c.signosDoElemento)}. ` +
      `No numbered card of ${c.naipeNome} falls outside those three.`,
  },
  {
    titulo: 'The number picks which of the three',
    texto: (c) =>
      `Two, Three and Four go to the cardinal sign of the element; Five, Six and Seven to the fixed one; Eight, Nine and Ten to the mutable one. ` +
      `This card is a ${c.numeroExtenso}, and the ${c.modalidadeNome} sign of ${c.elementoNome} is ${c.signoNome}.`,
  },
  {
    titulo: 'The number also picks the third',
    texto: (c) =>
      `Every sign runs thirty degrees and splits into three slices of ten — a decan is exactly that, one third of a sign. ` +
      `Two, Five and Eight take the first third; Three, Six and Nine the second; Four, Seven and Ten the third. ` +
      `The ${c.numeroExtenso} takes the ${c.ordinal}: ${faixa(c)}.`,
  },
  {
    titulo: 'The count gives the planet',
    texto: (c) =>
      `Line up the thirty-six thirds in order, from the first of ${c.ariesNome} to the last of ${c.peixesNome}, and deal the seven planets around them — ` +
      `${lista(c.ordemCaldaicaNome)} —, starting with ${c.planetaQueAbre} on third number one. ` +
      `${c.posicao === 1
        ? `This is third number one: the count starts right here, and the planet is ${c.planetaNome}.`
        : `This is third number ${c.posicao} of thirty-six; ${c.passos} steps around the wheel from ${c.planetaQueAbre} land on ${c.planetaNome}.`} ` +
      `Hence the label: ${c.rotulo}.`,
  },
];

const A_CONTA = (c) =>
  c.posicao === 1
    ? `Third number ${c.posicao} of 36. The count starts right here: ${c.planetaQueAbre} opens the lap, and the planet of this card is ${c.planetaNome}.`
    : `Third number ${c.posicao} of 36. That is ${c.passos} steps from ${c.planetaQueAbre} to here, and ${c.passos} steps around a wheel of seven land on ${c.planetaNome}.`;

const NOTA_DA_VOLTA = (c) =>
  `The seven do not close evenly over thirty-six: thirty-six divided by seven is five with one left over. ` +
  `${c.planetaQueAbre} shows up ${c.vezesDoPlanetaQueAbre} times in the lap and each of the other six shows up ${c.vezesDosOutros} times. ` +
  `The remainder is ${c.planetaQueAbre} — which is why the lap opens on it, at the first third of ${c.ariesNome}, and closes on it, at the last third of ${c.peixesNome}.`;

const NOTA_DO_PRIMEIRO_TERCO = (c) =>
  `A rule that looks like it exists and almost does — worth a close look, because folklore is made out of almosts like this one. ` +
  `The first third of ${c.ariesNome} lands on ${c.planetaQueAbre}, which happens to be the ruler of ${c.ariesNome} in the table of domiciles from ${c.autorPtolomeu} (Tetrabiblos I.17, ${c.quandoPtolomeu}). ` +
  `It is tempting to conclude that every sign opens with its own ruler. That is not it: across the twelve, this happens in ${c.signosQueAbremComODono.length} — ${lista(c.signosQueAbremComODono)} — and both of them are houses of ${c.planetaQueAbre}, the planet that opens the count. ` +
  `In the other ten it does not hold: ${c.touroNome} opens on ${c.abreTouro} and its ruler is ${c.donoDeTouro}; ${c.gemeosNome} opens on ${c.abreGemeos} and its ruler is ${c.donoDeGemeos}. ` +
  `Two out of twelve is a side effect of where the count begins, not a principle. And no ancient text in this research base says why it begins on ${c.planetaQueAbre} — the gap is declared instead of filled with an elegant reason.`;

const CONFERENCIA_TEXTO = (c) =>
  `Checked just now, with this screen open: the app re-ran the four steps for all thirty-six cards and compared each one against the deck's table. ${c.conferem} of ${c.total} match.`;

// ---------------------------------------------------------------------------
// THE THREE LAYERS — the whole chain, each link with its own age
// ---------------------------------------------------------------------------
const CAMADAS = {
  decanatos: {
    titulo: 'The ten-degree thirds',
    idade: 'antiquity, no settled date',
    texto:
      'Splitting each sign into three ten-degree slices is the oldest piece of the chain, and this research base could not pin a work or an author to its origin. What is confirmed is the ceiling: by the 2nd century the decans were already current and already disputed, because Ptolemy knows them and discards them in so many words. They survived in spite of him.',
  },
  ordemDosPlanetas: {
    titulo: 'The order of the seven',
    idade: 'ancient, with a dated source',
    texto:
      'Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon: the seven by decreasing apparent period, slowest to fastest, read as distance from the Earth. The same sequence generates the planetary hours and the names of the weekdays. Applying that order to the thirty-six thirds starting from Mars was Hellenistic work, in what are called the faces — and that particular link this base has not read in a primary source.',
  },
  asTrintaESeisCartas: {
    titulo: 'The fit onto the thirty-six cards',
    idade: '19th c.',
    texto:
      'This is the new layer, and it is the one usually sold as ancient. Putting the thirty-six thirds onto the thirty-six numbered cards, in zodiacal order, starting from the Two of Wands, is Golden Dawn work. There is no equivalent in Lévi, in Etteilla or in the Italian tarot. The structure of the sky goes back millennia; this correspondence does not.',
  },
};

// ---------------------------------------------------------------------------
// THE CAVEATS THAT TRAVEL WITH EVERY READING
// ---------------------------------------------------------------------------
const NOTA_ATRIBUICAO_RIVAL = () =>
  'A phrase this app never writes: "the astrological attribution of the tarot". There is no such single thing. ' +
  'There are at least three, mutually incompatible — the Golden Dawn one (Book T, 1888), which is the one used here; the continental one from Éliphas Lévi (Dogme et Rituel de la Haute Magie, 1854–1856) and Papus (1889), which shifts every letter by one slot; and Aleister Crowley\'s (The Book of Thoth, 1944), which swaps two. ' +
  'Saying "the" attribution would hide that a choice was made. This app\'s choice is stated, and it is the 1888 one.';

const NOTA_ARMADILHA_PTOLOMEU = (c) =>
  `The citation trap of this subject, and it turns up even in printed manuals. ` +
  `${c.autorPtolomeu} has a chapter on "face" — Tetrabiblos I.23, ${c.quandoPtolomeu} — and more than one modern book cites it as the source of the decan. It is not. ` +
  `There, "face" is a planet holding toward the Sun or the Moon the same angle its own house holds toward theirs: an angular relation, not a ten-degree slice. Same word, different thing. ` +
  `And in the chapter before it, I.22, the same author rejects the decans outright. Citing I.23 to justify a decan is citing against yourself.`;

const NOTA_LEITURA_DO_APP = (c) =>
  `What is source and what is the app's reading, kept apart. The source: the table of the thirty-six cards is from the ${c.autorGoldenDawn}, Book T — The Tarot, ${c.anoBookT}, and the app did not change a line of it. ` +
  `The app's reading: the four steps you just read are OUR way of telling the count — the source publishes the finished table, not the recipe. ` +
  `What the app did was re-walk the route, ten degrees at a time and seven planets at a time, and check card by card whether it reproduces the thirty-six entries. It does, without exception, and the check runs every time this screen opens. ` +
  `If a card ever fails to match, this screen says so instead of telling the story anyway.`;

// ---------------------------------------------------------------------------
// THE BIBLIOGRAPHY
// ---------------------------------------------------------------------------
const FONTES = [
  'Ptolemy, Tetrabiblos I.22 (trans. F. E. Robbins, Loeb/Harvard, 1940), 2nd c. — the decans are already current and he rejects them: "we shall omit". That is what proves how old they are, from the mouth of someone who did not want them',
  'Ptolemy, Tetrabiblos I.23, 2nd c. — his "proper face" is an angular relation with the Sun and the Moon, NOT the ten-degree third. Never cite I.23 to justify a decan',
  'Ptolemy, Tetrabiblos I.17, 2nd c. — the domiciles of the seven, used here only to show that "every sign opens with its own ruler" holds in two signs out of twelve, Aries and Scorpio, and that both are houses of Mars, the planet that opens the count',
  'Cassius Dio, Historia Romana 37.18–19 (trans. Cary, LacusCurtius), 3rd c. — the order of the seven: Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon. He himself calls the planetary custom recent for his own day',
  'Hermetic Order of the Golden Dawn, Book T — The Tarot, 1888 — the fit of the thirty-six decans onto the thirty-six numbered cards, with the titles ("Lord of Dominion", "Lord of Ruin")',
  'Israel Regardie, The Golden Dawn, 1937–1940 — the publication that took Book T out of the Order\'s closed circle',
  'Éliphas Lévi, Dogme et Rituel de la Haute Magie, 1854–1856, and Papus, 1889 — the rival continental attribution, which shifts every letter by one slot',
  'Aleister Crowley, The Book of Thoth, 1944 — the third attribution, which swaps Heh and Tzaddi and keeps the signs',
];

// ---------------------------------------------------------------------------
// WHEN THE CARD HAS NO DECAN — and each reason is a different reason
// ---------------------------------------------------------------------------
const FALTA = {
  maior: {
    texto:
      'The twenty-two Major Arcana are not part of this count, and it is not an oversight: in the same 1888 table they get something else — one Hebrew letter each, and with it a sign, a planet or an element. Decans are the business of the thirty-six cards numbered Two through Ten. Adding it up: twenty-two Majors, four Aces, sixteen court cards and thirty-six numbered cards make the seventy-eight of the deck.',
    comoResolver: 'The attribution of this card shows up on its own entry, in Tarot by Theme.',
  },
  as: {
    texto:
      'The Ace is not a piece of sky. In the same 1888 table it is the root of the element of the whole suit — the force with no place yet, before any division into degrees. The four Aces sit outside the thirty-six decans on purpose, and that is exactly why the deck\'s arithmetic closes.',
    comoResolver: 'The attribution of this card shows up on its own entry, in Tarot by Theme.',
  },
  corte: {
    texto:
      'The sixteen court cards get a compound element, not a decan. And here the table itself has two rival versions: the Golden Dawn uses Knight, Queen, Prince and Princess, and this deck is Rider-Waite-Smith, which has King and Page where Prince and Princess would be. The app uses the current adaptation and says out loud that it is an adaptation, rather than pretending only one convention exists.',
    comoResolver: 'The attribution of this card shows up on its own entry, in Tarot by Theme.',
  },
  carta: {
    texto:
      'This card was not recognized in the deck, so there is no fit to explain. The app would rather say that than build an explanation on top of a card it could not find.',
    comoResolver: 'Go back to the spread in Tarot by Theme and tap the card again.',
  },
  divergencia: {
    texto: (e) =>
      `The rule and the deck's table disagree on this card: the count produces "${e.daRegra}" and the deck publishes "${e.doBaralho}". ` +
      'When that happens the app does not explain a fit it could not verify — showing the disagreement is more honest than quietly picking one of the two.',
    comoResolver: 'Nothing to do here: this is a mismatch inside the app itself, and it stays on the record on this screen.',
  },
};

// ---------------------------------------------------------------------------
// THE SCREEN CHROME — titles and labels for whoever DISPLAYS this reading
// ---------------------------------------------------------------------------
// Born when the feature moved into the modal of the Album of 78. The screen
// writes nothing of its own: everything it needs lives here, with exact key
// parity against .pt and .es. None of these labels says what the card means —
// they only name the boxes the RULE shows up in.
const CHROME = {
  titulo: 'Why this card is this decan',
  subtitulo: 'The rule that settled it before the deck ever reached your hands',
  abrir: 'Tap to see the rule',
  fechar: 'Tap to close the rule',
  rotuloTituloGD: 'Traditional name',
  rotuloRegra: 'The rule, in four steps',
  rotuloConta: 'The count for this card',
  rotuloConferencia: 'Checked just now',
  rotuloCamadas: 'The three ages of this',
  rotuloCitacoes: 'In the original',
  rotuloRessalvas: 'What travels with this reading',
  rotuloFontes: 'Where to check it',
};

export const PACK = {
  idioma: 'en',
  tela: 'Tarot by Theme',
  chrome: CHROME,
  autores: AUTORES,
  planetas: PLANETAS,
  signos: SIGNOS,
  conector: CONECTOR,
  naipes: NAIPES,
  elementos: ELEMENTOS,
  modalidades: MODALIDADES,
  ordinais: ORDINAIS,
  numeroExtenso: NUMERO_EXTENSO,
  notasDeFonte: NOTAS_DE_FONTE,
  lista,
  faixa,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  aRegra: A_REGRA,
  aConta: A_CONTA,
  notaDaVolta: NOTA_DA_VOLTA,
  notaDoPrimeiroTerco: NOTA_DO_PRIMEIRO_TERCO,
  conferenciaTexto: CONFERENCIA_TEXTO,
  camadas: CAMADAS,
  notaAtribuicaoRival: NOTA_ATRIBUICAO_RIVAL,
  notaArmadilhaPtolomeu: NOTA_ARMADILHA_PTOLOMEU,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
