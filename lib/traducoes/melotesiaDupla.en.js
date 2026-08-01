// lib/traducoes/melotesiaDupla.en.js
// THE ENGLISH PACK for the double melothesia — natural American app English.
//
// Same SHAPE as lib/traducoes/melotesiaDupla.pt.js: same keys, same fields,
// functions with the same signature. What never changes between packs lives in
// the engine (lib/melotesiaDupla.js): Manilius's Latin, the Hebrew letter, the
// Hebrew month, the loci and the internal keys.
//
// Every rule from the header of lib/melotesiaDupla.js applies to each string
// here, and two of them outrank the rest on this subject:
//
//   · NO HEALTH CLAIM, not even implied. Nothing about what a body part feels,
//     needs, or how to look after it. Say what the tradition assigned, in the
//     past, with a source. When a sentence is doubtful, the sentence goes.
//   · HOOK FIRST, SOURCE SECOND. Every `abertura` is a scene from real life —
//     the tattoo, the office chair, the fitting room — and the receipt shows up
//     in `leitura`, after it. Never the other way around.
//
// And the structural rule: the two columns NEVER become one. There is no
// sentence here saying "the body part of Aries is X"; there is "Manilius
// assigned X" and "the Sefer Yetzirah assigned Y".

const ROTULOS = {
  manilio: 'Manilius',
  sefer: 'Sefer Yetzirah',
  capitulo: 'ch.',
  verso: 'Latin line',
  letra: 'letter',
  mes: 'month of',
  recensao: 'recension',
};

const TIPOS = {
  superficie: 'surface of the trunk or the head',
  membro: 'arm or leg',
  viscera: 'inner organ',
};

const RELACOES = {
  concordam: 'both name the same part',
  vizinhas: 'different parts, same region of the body',
  divergem: 'different regions of the body',
};

// korkeban stays untranslated in all three packs — the reason is in
// NOTA_KORKEBAN.
const ORGAOS = {
  peDireito: 'Right foot',
  rimDireito: 'Right kidney',
  peEsquerdo: 'Left foot',
  maoDireita: 'Right hand',
  rimEsquerdo: 'Left kidney',
  maoEsquerda: 'Left hand',
  vesicula: 'Gall bladder',
  intestino: 'Small intestine',
  estomago: 'Stomach (kivah)',
  figado: 'Liver',
  korkeban: 'Korkeban',
  baco: 'Spleen',
};

const SIGNOS = {
  aries: {
    nome: 'Aries',
    parte: 'Head',
    abertura:
      "You've heard a thousand times that Aries is the head. It's the first thing that shows up when somebody draws that little figure with the twelve signs scattered over a body.",
    leitura:
      'The Latin list of Manilius, in the 1st century, opens the body at the head, and that is where the line everybody repeats comes from. The Hebrew list of the Sefer Yetzirah, dated between the 2nd and the 6th century, opens at the other end: for Aries it puts the right foot. ' +
      'Neither one is correcting the other — neither one knows the other exists. Two distant texts split up the same body by different criteria, and this is the sign where the gap between them is as wide as it gets: the two far ends.',
  },
  touro: {
    nome: 'Taurus',
    parte: 'Neck',
    abertura:
      'That bull tattoo right below the nape. Whoever picked the spot was following a two-thousand-year-old list without knowing it.',
    leitura:
      'Manilius gives Taurus the neck — in the Latin line, the most beautiful neck. The Sefer Yetzirah gives the right kidney, through the letter Vav, in the month of Iyar. ' +
      'One sits outside and high on the trunk; the other sits inside and a good deal lower. They diverge, and this is the second sign in a row where they do.',
  },
  gemeos: {
    nome: 'Gemini',
    parte: 'Arms, joined to the shoulders',
    abertura:
      "Some people cannot tell a story with their arms still. You already know who I'm talking about, and you have probably mimicked them behind their back.",
    leitura:
      'Manilius gives Gemini the arms joined to the shoulders. The Sefer Yetzirah gives the left foot, through the letter Zayin, in the month of Sivan. ' +
      'They diverge — but notice a coincidence of kind that happens only here: across the twelve lines, this is the one sign where both sources point at a limb. Different parts, same category of part.',
  },
  cancer: {
    nome: 'Cancer',
    parte: 'Chest',
    abertura:
      'The relative who pulls you into the hug and presses you against their chest before you get to say hi. Every family has one.',
    leitura:
      'Manilius places the chest under Cancer. The Sefer Yetzirah gives the right hand, through the letter Chet, in the month of Tamuz. ' +
      'They diverge — and this is one of the two lines where the popular version disagrees with Manilius too, which leaves three different maps fighting over the same sign.',
  },
  leao: {
    nome: 'Leo',
    parte: 'Flanks and shoulder blades',
    abertura:
      'That friend who walks into any room with the shoulders back, taking up space before saying a word.',
    leitura:
      'Manilius gives Leo the flanks and the shoulder blades — not the heart, which is what gets repeated everywhere. The Sefer Yetzirah gives the left kidney, through the letter Tet, in the month of Av. ' +
      'And this is one of only two cases where the two lists come close: the kidney sits in the flank. Close is not the same, and the app does not turn that into agreement.',
  },
  virgem: {
    nome: 'Virgo',
    parte: 'Lower belly',
    abertura:
      'Belt loosened at the end of Sunday lunch. Everybody knows the discreet maneuver under the tablecloth.',
    leitura:
      'Manilius gives Virgo the lower belly. The Sefer Yetzirah gives the left hand, through the letter Yod, in the month of Elul. ' +
      'They diverge, and in a way that shows the shape of each list: where the Latin one is on the trunk, the Hebrew one is on a limb.',
  },
  libra: {
    nome: 'Libra',
    parte: 'Buttocks and haunches',
    abertura:
      'Eight hours a day in the same office chair, and the group chat at work is always about the chair.',
    leitura:
      'Manilius gives Libra the buttocks — "Libra regit clunes", in the Latin line. The kidneys, which the market has been repeating for decades, are not there: in the PLANETARY list of Ptolemy (Tetrabiblos III.xvii, 2nd century) they belong to Mars. ' +
      'The Sefer Yetzirah gives the gall bladder, through the letter Lamed, in the month of Tishrei. Two ancient lists, and neither says what the market says.',
  },
  escorpiao: {
    nome: 'Scorpio',
    parte: 'Groin',
    abertura:
      'Scorpio and sex have been the same joke for decades. On this line, and only this one, the joke has an old text behind it.',
    leitura:
      'Manilius writes it with no detour: "et Scorpios inguine gaudet" — the Scorpion delights in the groin. The Sefer Yetzirah gives the small intestine, through the letter Nun, in the month of Cheshvan. ' +
      'This is the second of the two cases where the lists land in the same region of the body: groin and small intestine share the lower belly. Neighbors, not equals.',
  },
  sagitario: {
    nome: 'Sagittarius',
    parte: 'Thighs',
    abertura:
      'Jeans that squeeze the thigh and gap at the waist. Half the fitting-room line is arguing about exactly that right now.',
    leitura:
      'Manilius gives the Centaur the thighs. The Sefer Yetzirah gives the stomach — kivah, in Hebrew — through the letter Samekh, in the month of Kislev. ' +
      'They diverge: one list is on the leg, the other is in the middle of the trunk and on the inside.',
  },
  capricornio: {
    nome: 'Capricorn',
    parte: 'Both knees',
    abertura:
      'Kneeling behind the couch to find the outlet, then getting up with one hand on the armrest.',
    leitura:
      'Manilius gives Capricorn both knees, and the Latin line says the sign commands the pair of them. The Sefer Yetzirah gives the liver, through the letter Ayin, in the month of Tevet. ' +
      'They diverge, and it is one more pair where the Latin list is on the outside and the Hebrew one is on the inside.',
  },
  aquario: {
    nome: 'Aquarius',
    parte: 'Legs, from the thigh down',
    abertura:
      'The leg bouncing under the table for the whole meeting, and the person next to it never daring to say anything.',
    leitura:
      'Manilius gives Aquarius the legs, from the thigh down. The Sefer Yetzirah gives the korkeban, through the letter Tzadi, in the month of Shevat — and that is the word translators never settle. ' +
      'The app keeps the term transliterated from Hebrew instead of picking an organ just to close the line.',
  },
  peixes: {
    nome: 'Pisces',
    parte: 'Feet',
    abertura:
      "Taking your shoes off after a full day on your feet. It's the first thing that happens at the door, before the bag even hits the floor.",
    leitura:
      'Manilius closes the list where the body ends: in the Latin line, the Fishes claim the right over the feet for themselves. The Sefer Yetzirah gives the spleen, through the letter Qof, in the month of Adar. ' +
      'The Latin list ends at the foot; the Hebrew one had STARTED at the foot, back in Aries, and ends at an inner organ. The two walk paths that never cross at a single point.',
  },
};

const CAMADA_TARDIA = {
  cancer:
    '"Cancer is the stomach" is a later deduction, not what Manilius wrote. The Latin line puts the CHEST under Cancer. The stomach shows up in the PLANETARY list of Ptolemy (Tetrabiblos III.xvii, 2nd century), assigned to the Moon — and that is where the association slid over to the sign from.',
  leao:
    '"Leo is the heart" is a later deduction, not what Manilius wrote. The Latin line gives Leo the FLANKS and the SHOULDER BLADES. The heart shows up in the PLANETARY list of Ptolemy (Tetrabiblos III.xvii, 2nd century), assigned to the Sun — and that is where the association slid over to the sign from.',
};

const CHAMADA =
  'Somebody has told you, with great confidence, which body part "belongs" to your sign. ' +
  'What that person did not know is that there are two ancient lists of the kind, written far apart from each other — and they do not match on a single line.';

const EXPLICACAO =
  'There is always someone at the barbecue swearing that Leo is the heart and Libra is the kidneys, with the conviction of a person who saw it written down somewhere. ' +
  'And they did see it: it is written everywhere. The question nobody asks is who wrote it first.' +
  '\n\n' +
  'Two people did. Not one: two — and that is where the story gets good. One of the lists is Roman, in Latin verse, and walks down the body from head to feet following the order of the zodiac. ' +
  'The other one is Hebrew, came out of a count on the letters of the alphabet, and barely mentions the surface of the body: it talks about what sits inside. ' +
  'They were written in different worlds and arrived at different maps of the same person.' +
  '\n\n' +
  'The first one is by Manilius, Astronomica II.453-465, 1st century — the oldest attestation of the correspondence in continuous surviving text. ' +
  'And it is not by Ptolemy, which is worth insisting on because the mistake is everywhere: the Tetrabiblos assumes the correspondence and never enumerates the twelve signs; what it enumerates is the list of planets. ' +
  'The second one is the Sefer Yetzirah, ch. 5, dated between the 2nd and the 6th century, which splits the 22 Hebrew letters into 3 mothers, 7 doubles and 12 simples, and ties each of the 12 simples to a sign, a month and an organ.' +
  '\n\n' +
  'Put side by side, the twelve lines match on none. Not one — and the mismatch has a shape: where Manilius is on the surface and on the limbs, the Sefer Yetzirah is in the viscera. ' +
  'On two signs the lists reach the same region of the body without naming the same part, and that is as close as they ever get in two thousand years.' +
  '\n\n' +
  'That is why both show up here in separate, labeled columns, never added together. ' +
  'Adding them would produce a third list, one that never existed and has no author and no century — which is exactly what most of the sites on the subject carry today.';

const ESTRUTURA = (c) =>
  `There are ${c.total} lines. On ${c.concordam} of them the two sources name the same body part — zero, and that zero is the main finding of this screen. ` +
  `On ${c.vizinhas} they land in the same region without naming the same part; on the other ${c.divergem}, not even that.` +
  `\n\n` +
  `And the shape of the mismatch fits in two numbers. In the list of Manilius: ${c.manilioSuperficie} entries on the surface of the trunk or the head, ${c.manilioMembro} on an arm or a leg, ${c.manilioViscera} on an inner organ. ` +
  `In the Sefer Yetzirah: ${c.seferSuperficie} on the surface, ${c.seferMembro} on a limb, ${c.seferViscera} on an inner organ. ` +
  `One map was drawn from the outside; the other, from the inside. They are not disagreeing about where each thing sits — they are looking at different things.`;

const NOTA_DA_CLASSIFICACAO =
  'Calling two of the pairs "neighbors" was the app, not the sources. Neither list comments on the other: Manilius writes in the 1st century and could not have known a text dated between the 2nd and the 6th. ' +
  '"Neighbors" here means one thing only — the two parts sit in the same region of the body. It is a reading by the app over both lists, and it comes labeled as a reading by the app.';

const NOTA_NAO_FUNDIR =
  'The two columns never become one. Blending them would produce a third list, with no author and no century, that neither text supports — and that is the most common mistake on the subject. ' +
  'Here every attribution travels with the name of the work stuck to it, and the screen has no line saying "the body part of this sign is X".';

const NOTA_LEITURA_DO_APP =
  'What is source and what is app. Source: the twelve Latin lines of Manilius (Astronomica II.453-465, 1st century) and the twelve simple letters of the Sefer Yetzirah (ch. 5, 2nd–6th century). ' +
  'App: the line-by-line comparison, the count, and the labels "agree", "neighbors" and "diverge". The way of telling all this in today\'s English is the app too, and that is all.';

const NOTA_KORKEBAN =
  'korkeban (קורקבן) stays untranslated on purpose. The versions in circulation swing between gizzard, crop and esophagus, and none of them became consensus. ' +
  'Picking one so the list looks tidy would fix what the source does not fix.';

const BLOQUEIO =
  'A caveat the app makes about itself. The Hebrew column on this screen came from the Gra/Ari recension, through a secondary report — not from the critical edition that compares the manuscripts (A. Peter Hayman, Mohr Siebeck, 2004). ' +
  'The order of the organs varies between recensions of the Sefer Yetzirah, so this is one version among several, and not the final word. ' +
  'The Latin column carries no such caveat: the text of Manilius survives, and the line numbers were checked against the printed margin of the page itself.';

const PRECISAO = {
  meiaDia:
    'With no birth time, the Sun sign here was read at noon of the day given — the instant that misses by the least inside a day. Anyone born at the turn of a sign may get the neighboring one because of that, and those are exactly the people who notice. The time on the birth certificate settles it.',
  semCidade:
    'The time came in, but with no city there is no time zone to apply: it was read as Greenwich time. For anyone born near the turn of a sign, that can swap the whole line. Picking the birth city settles it.',
};

const NOTAS_DE_FONTE = {
  manilio:
    'The Latin list on this screen, line by line. It is the oldest canonical attestation of the sign↔body part correspondence in continuous surviving text.',
  sefer:
    'The Hebrew list on this screen. The chapter splits the 12 simple letters across the 12 signs, the 12 months and the 12 organs, always in the same triad: in the universe, in the year, in the body.',
  hayman:
    'The critical edition that collates 19+ manuscripts and decides between the recensions. This research base did NOT consult it — that is the declared blocker of this screen, and it is written on the screen, not only here.',
  kaplan:
    'The translation through which the Gra/Ari recension reached this base. It is one among several, and that is why the Hebrew column carries medium confidence instead of high.',
  westcott:
    'The Victorian translation that circulates for free online and that the bibliography warns against. It is cited here to say that it is NOT the basis of this screen.',
  ptolomeu:
    'The PLANETARY list — the one Ptolemy does enumerate. The heart comes from there, from the Sun, and not from the sign of Leo; the kidneys come from there, from Mars, and not from Libra. It is here to undo the two most repeated confusions on the subject.',
};

const FALTA = {
  data: {
    texto:
      'With no birth date there is no Sun sign to compute. And the app does not ask for the sign directly: asking for the sign is asking the person to get it wrong exactly when they were born at the turn, which is when it matters most.',
    comoResolver: 'Enter your birth date in the Birth Chart.',
  },
  efemeride: {
    texto:
      'The sky positions could not be computed right now. The app would rather show nothing than show an invented sky — the comparison of the two lists is still open above, it does not depend on an ephemeris.',
    comoResolver: 'Try again in a moment, in the Birth Chart.',
  },
};

// ---------------------------------------------------------------------------
// THE SCREEN CHROME — labels only, and nothing beyond labels
// ---------------------------------------------------------------------------
// The showcase (the two-list block inside screens/ZodiacBodyScreen.js) writes
// nothing: it passes the `lang` through and prints what is here. No string in
// this block makes a new historical claim — every claim still comes out of the
// engine with work, author and century stuck to it.
//
// All three packs carry this block with the SAME keys.
const CHROME = {
  selo: 'Two lists, not one',
  secao: 'The two lists of the body, side by side',
  abrir: 'open',
  fechar: 'close',
  etiquetaApp:
    'The comparison below is a reading by the app over the two lists — neither source says a word about the other.',
  rotuloSeuSigno: 'The line of your Sun sign',
  rotuloTabela: 'The twelve lines, side by side',
  ajudaTabela: 'Tap a sign to see both columns in full and the receipt behind each one.',
  rotuloConta: 'The count, line by line',
  rotuloComoSurgiram: 'Where the two lists came from',
  rotuloNatureza: 'Kind of part',
  rotuloRecibo: 'Receipt',
  rotuloRessalvas: 'The caveats on this screen',
  rotuloBloqueio: 'What this screen has not checked yet',
  rotuloFontes: 'Where each line came from',
  confianca: { alta: 'high confidence', media: 'medium confidence' },
  signoDeclarado:
    'This line came from the sign saved in your profile. With a birth date, the app reads the sign from the real position of the Sun instead of taking the declared one.',
  irParaMapa: 'Open the Birth Chart',
  compartilhar: 'Share',
  copiado: 'Text copied. Paste it wherever you like.',
  naoCopiou: 'Copying did not work here. Select the text and copy it by hand.',
  marca: 'Cosmic Guide',
  indisponivel:
    'The comparison of the two lists could not be assembled right now. The app would rather show nothing than show half a line.',
};

export const PACK = {
  idioma: 'en',
  tela: 'Zodiac Man',
  telaDoNascimento: 'Birth Chart',
  chrome: CHROME,
  rotulos: ROTULOS,
  tipos: TIPOS,
  relacoes: RELACOES,
  orgaos: ORGAOS,
  signos: SIGNOS,
  camadaTardia: CAMADA_TARDIA,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  estrutura: ESTRUTURA,
  notaDaClassificacao: NOTA_DA_CLASSIFICACAO,
  notaNaoFundir: NOTA_NAO_FUNDIR,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaKorkeban: NOTA_KORKEBAN,
  bloqueio: BLOQUEIO,
  precisao: PRECISAO,
  notasDeFonte: NOTAS_DE_FONTE,
  falta: FALTA,
};

export default PACK;
