// lib/traducoes/seita.en.js
// THE ENGLISH PACK for sect (hairesis) — natural American app English.
//
// Same SHAPE as lib/traducoes/seita.pt.js: same keys, same fields, functions
// with the same signature. What NEVER changes between packs: the Robbins and
// Riley verbatim (translating a quotation falsifies it), the loci (Tetrabiblos
// I.7 stays Tetrabiblos I.7), the numbers, and the internal KEYS — planet names
// stay in Portuguese across all three packs because they are data, not screen
// text.
//
// Every rule from the header of lib/seita.js applies to each string here: hook
// first and source second, a locus on every historical claim, no health claim,
// no verdict and no promise, and — the most important one for this feature —
// DO NOT FILL THE GAP: Valens states the positive (a malefic in its own sect
// bestows good) and the app does not state the negative, because the research
// base found no ancient line that authorizes it.

const PLANETAS = {
  'Sol': 'the Sun',
  'Lua': 'the Moon',
  'Mercúrio': 'Mercury',
  'Vênus': 'Venus',
  'Marte': 'Mars',
  'Júpiter': 'Jupiter',
  'Saturno': 'Saturn',
  'Urano': 'Uranus',
  'Netuno': 'Neptune',
  'Plutão': 'Pluto',
};

const SEITA_NOME = { diurno: 'diurnal', noturno: 'nocturnal' };
const SEITA_MAPA = { diurno: 'day chart', noturno: 'night chart' };

// Tetrabiblos I.5. Ancient physics vocabulary, not a moral verdict.
const CLASSES = { benefico: 'benefic', malefico: 'malefic', comum: 'common' };

function formatarGraus(n) {
  return Number(n).toFixed(1);
}

const ESTRELA = { manha: 'morning', tarde: 'evening' };
const TURNO = { diurno: 'day', noturno: 'night' };

// ---------------------------------------------------------------------------
// THE QUOTATIONS — verbatim, never translated
// ---------------------------------------------------------------------------
const VERBATIM = {
  valensMaleficos: {
    texto:
      'even the malefic stars, when they are operative in appropriate places in their own sect, are bestowers of good and indicative of the greatest positions and success; when they are inoperative, they bring about disasters and accusations.',
    parafrase:
      'Even the malefic stars, when they work from fitting places and inside their own sect, hand out good rather than damage; idle, they hand out the opposite.',
    locus: 'Vettius Valens, Anthologiae I.1, trans. Riley',
  },
  ptolomeuMercurio: {
    texto: 'common as before, diurnal when it is a morning star and nocturnal as an evening star',
    parafrase:
      'Mercury is common, as it already was: of the day when it shows up in the sky ahead of the Sun, of the night when it shows up after.',
    locus: 'Ptolemy, Tetrabiblos I.7, trans. Robbins, 1940',
  },
  ptolomeuBeneficos: {
    texto: 'because of their tempered nature and because they abound in the hot and the moist',
    parafrase:
      'Jupiter, Venus and the Moon are benefic for their tempered nature and their abundance of the hot and the moist — and note that the Moon is on that list.',
    locus: 'Ptolemy, Tetrabiblos I.5, trans. Robbins, 1940',
  },
  ptolomeuMaleficos: {
    texto: 'one because of his excessive cold and the other for his excessive dryness',
    parafrase:
      'Saturn and Mars are malefic by excess: one of cold, the other of dryness. That is a classification of elemental quality, not of character.',
    locus: 'Ptolemy, Tetrabiblos I.5, trans. Robbins, 1940',
  },
  ptolomeuComuns: {
    texto: 'have both powers, because they have a common nature',
    parafrase:
      'The Sun and Mercury hold both powers, because their nature is common — they take the color of the company they keep. The Sun is not benefic in Ptolemy.',
    locus: 'Ptolemy, Tetrabiblos I.5, trans. Robbins, 1940',
  },
  valensDia: {
    texto: 'of the day sect',
    parafrase: 'The tag Valens hands out, planet by planet, to the ones that play by day: Sun, Jupiter and Saturn.',
    locus: 'Vettius Valens, Anthologiae I.1, trans. Riley',
  },
  valensNoite: {
    texto: 'of the night sect',
    parafrase: 'The tag Valens hands out, planet by planet, to the ones that play by night: Moon, Venus and Mars.',
    locus: 'Vettius Valens, Anthologiae I.1, trans. Riley',
  },
};

// ---------------------------------------------------------------------------
// BLOCK 1 — THE HOOK. Real life, no technical term, no proper name.
// ---------------------------------------------------------------------------
const CHAMADA = {
  diurno: () =>
    'At the exact hour you were born there was still daylight outside: the Sun was above the horizon line. ' +
    'It reads like a line on a birth certificate. It is the piece that changes how seven planets are read, all at once.',
  noturno: () =>
    'At the exact hour you were born it was already dark outside: the Sun was below the horizon line. ' +
    'It reads like a line on a birth certificate. It is the piece that changes how seven planets are read, all at once.',
};

const EXPLICACAO = {
  diurno: (c) =>
    `Every chart lands on one side of that line or the other, with no middle ground: either the Sun had risen and not yet set, or it had not. ` +
    `Your Sun was ${formatarGraus(c.graus)} degrees above the horizon.` +
    `\n\n` +
    `Here is what that does. Ancient astrology splits the planets into two teams. Three play by day, three play by night, and one switches sides depending on the chart. ` +
    `Born by day, you have the day team playing at home. The same Saturn, the same Mars and the same Moon do not read alike in the two charts — and that single fact is the whole difference.` +
    `\n\n` +
    `The word in the source is sect (hairesis, in Greek — the team each planet belongs to). ` +
    `The table is Ptolemy's, Tetrabiblos I.7, 2nd century: Sun and Jupiter by day, Moon and Venus by night, Mercury according to whether it shows up in the sky ahead of the Sun or after it. ` +
    `Vettius Valens, in the same century, checks it off planet by planet in Anthologiae I.1.` +
    `\n\n` +
    `And Valens adds the line almost every summary skips: a malefic working from a fitting place, inside its own sect, bestows good rather than damage. ` +
    `That is why Saturn in a day chart — yours — is not the Saturn of a night chart.`,
  noturno: (c) =>
    `Every chart lands on one side of that line or the other, with no middle ground: either the Sun had risen and not yet set, or it had not. ` +
    `Your Sun was ${formatarGraus(c.graus)} degrees below the horizon.` +
    `\n\n` +
    `Here is what that does. Ancient astrology splits the planets into two teams. Three play by day, three play by night, and one switches sides depending on the chart. ` +
    `Born by night, you have the night team playing at home. The same Mars, the same Saturn and the same Moon do not read alike in the two charts — and that single fact is the whole difference.` +
    `\n\n` +
    `The word in the source is sect (hairesis, in Greek — the team each planet belongs to). ` +
    `The table is Ptolemy's, Tetrabiblos I.7, 2nd century: Sun and Jupiter by day, Moon and Venus by night, Mercury according to whether it shows up in the sky ahead of the Sun or after it. ` +
    `Vettius Valens, in the same century, checks it off planet by planet in Anthologiae I.1.` +
    `\n\n` +
    `And Valens adds the line almost every summary skips: a malefic working from a fitting place, inside its own sect, bestows good rather than damage. ` +
    `That is why Mars in a night chart — yours — is not the Mars of a day chart.`,
};

const NOTA_CONDICAO =
  'A caveat the source itself imposes. Valens asks for two things at once: the planet must be in its own sect AND working from an appropriate place. ' +
  'Sect is what this app computes, and it is what you are reading here. The appropriate place is not — that needs the house and the condition of each planet, which this screen does not read yet. ' +
  'Half the rule, said as half.';

const NOTA_LEITURA_DO_APP =
  'What is arithmetic and what is reading. The arithmetic: the app compares the longitude of the Sun with the axis of the Ascendant and the Descendant, which is the horizon as the chart draws it — real hour, real city, real ephemeris, no lookup table. ' +
  'The reading: who belongs to the day and who belongs to the night is Ptolemy\'s table (Tetrabiblos I.7) and Valens\'s (Anthologiae I.1), both 2nd century. ' +
  'The way of telling it in plain English today is the app\'s, and only that.';

const NOTA_LIMITROFE = (c) =>
  `Close call: the Sun was ${formatarGraus(c.graus)} degrees from the horizon at the hour you entered — near the flip. ` +
  `Inside that band, a few minutes either way move the chart from diurnal to nocturnal. If the hour you have is approximate, the birth certificate settles it. ` +
  `(The 3 degrees the app uses as its watch band are our choice, not an ancient rule: at the average pace of the axis they run about 13 minutes on the clock. In the source there is no middle ground — it is either above or below.)`;

const MERCURIO = {
  manha: (c) =>
    `Mercury showed up in the sky ahead of the Sun that day — morning star, ${formatarGraus(c.elongacao)} degrees from it. By that criterion it joins the day team.`,
  tarde: (c) =>
    `Mercury showed up in the sky after the Sun that day — evening star, ${formatarGraus(c.elongacao)} degrees from it. By that criterion it joins the night team.`,
  indeterminado:
    'Mercury is the only one that switches sides: it joins the day if it shows up in the sky ahead of the Sun, and the night if it shows up after. Without the computed chart there is no telling which one is yours, and the app does not guess.',
};

const LINHAS = {
  'Sol': {
    naSeita: () =>
      'The Sun is at home: it owns the half of the day you were born into. That does not make it kind. Ptolemy does not list the Sun among the benefics — he lists it among the commons, which take the color of whoever stands nearby.',
    foraDaSeita: () =>
      'The Sun belongs to the day and you were born at night: it sits outside its own sect. That does not turn it into a problem either. In Ptolemy the Sun is common, and common means it takes the color of the company.',
  },
  'Lua': {
    naSeita: () =>
      'The Moon is at home: you were born in her half. And here is a detail almost nobody passes along — in Ptolemy the Moon is benefic, in the same group as Jupiter and Venus. The habit is to name those two and forget the luminary.',
    foraDaSeita: () =>
      'The Moon belongs to the night and you were born by day: outside her own sect. She stays benefic in Ptolemy, right next to Jupiter and Venus — which almost every summary forgets. She just is not in her own half.',
  },
  'Mercúrio': {
    naSeita: (c) =>
      `Mercury is the only one that switches sides, and the test is when it shows up in the sky: ahead of the Sun, it belongs to the day; after it, to the night. ` +
      `In your case it is a ${ESTRELA[c.estrela]} star — and it landed in the same half as your chart. At home.`,
    foraDaSeita: (c) =>
      `Mercury switches sides depending on whether it shows up ahead of the Sun or after it. In your case it is a ${ESTRELA[c.estrela]} star, which puts it on the ${TURNO[c.estrela === 'manha' ? 'diurno' : 'noturno']} team — ` +
      `and your chart is ${SEITA_NOME[c.seita]}. Outside its own sect, then.`,
  },
  'Vênus': {
    naSeita: () =>
      'Venus is at home: she belongs to the night, and the night is where you were born. Valens sums up what she moves in two words — desire and love — and Ptolemy lists her among the benefics.',
    foraDaSeita: () =>
      'Venus belongs to the night and you were born by day: outside her own sect. She stays benefic in Ptolemy — the classification comes from her nature, not from the half of the day.',
  },
  'Marte': {
    naSeita: () =>
      'Mars is a malefic on the ancient list, and here is the turn: you were born at night, which is his half. Mars is inside his own sect. ' +
      'Valens writes, on the same page where he calls him malefic, that a malefic placed like this bestows good. In the source, Mars is what cuts, forges and commands.',
    foraDaSeita: () =>
      'Mars belongs to the night and you were born by day: outside his own sect. And here the app puts on the brakes. ' +
      'The Valens line about bestowing good is about a malefic INSIDE its own sect; his opposite line is about a malefic that is inoperative, which is not the same thing. ' +
      'No ancient text in this research base says Mars by day is worse, and the gap stays declared instead of filled.',
  },
  'Júpiter': {
    naSeita: () =>
      'Jupiter is at home: he belongs to the day, and the day is where you were born. He is benefic in Ptolemy, and the reason Ptolemy gives is physical, not moral — ' +
      'Jupiter warms and moistens in the right measure, and those are the two qualities the source calls generative.',
    foraDaSeita: () =>
      'Jupiter belongs to the day and you were born at night: outside his own sect. He stays benefic in Ptolemy — the classification comes from his nature, not from the half of the day.',
  },
  'Saturno': {
    naSeita: () =>
      'This is the line the standard Saturn summary tends to skip: Saturn is the malefic of the DAY, and you were born by day. He is inside his own sect. ' +
      'Valens, on the same page where he calls him malefic, writes that a malefic well placed in its own sect bestows good — and lists rank, supervision and the management of other people\'s property. ' +
      'The Saturn of lessons and maturing is a different one: that comes from Liz Greene, 1976.',
    foraDaSeita: () =>
      'Saturn belongs to the day and you were born at night: outside his own sect. And here the app stops. ' +
      'The Valens line about bestowing good is about a malefic INSIDE its own sect; his opposite line is about a malefic that is inoperative, which is not the same thing. ' +
      'No ancient text in this research base says Saturn by night is worse, and the gap stays declared instead of filled.',
  },
};

const LINHA_MODERNA = {
  'Urano': (c) =>
    `Sect does not apply to Uranus. The doctrine covers the seven you can see with the naked eye, and Uranus was only found in ${c.ano} — more than sixteen hundred years after Ptolemy wrote the table. The app does not invent a slot for it.`,
  'Netuno': (c) =>
    `Sect does not apply to Neptune. The table is 2nd century and Neptune was found in ${c.ano}: there is no way Ptolemy or Valens said anything about it. Leaving the line blank would be more honest than filling it, and saying so is more honest still.`,
  'Plutão': (c) =>
    `Sect does not apply to Pluto. It was found in ${c.ano} — eighteen centuries after the table. Where the source is silent, so is the app.`,
};

const RECIBOS = {
  'Sol': 'Ptolemy, Tetrabiblos I.7 — the Sun opens the diurnal list. Valens, Anthologiae I.1: "of the day sect". Common class: Tetrabiblos I.5.',
  'Lua': 'Ptolemy, Tetrabiblos I.7 — the Moon opens the nocturnal list. Valens, Anthologiae I.1: "of the night sect". Benefic: Tetrabiblos I.5, alongside Jupiter and Venus.',
  'Mercúrio':
    'Ptolemy, Tetrabiblos I.7 — "common as before, diurnal when it is a morning star and nocturnal as an evening star". Morning and evening star: Tetrabiblos I.8. The Valens grid in I.1, as this research base records it, does not include Mercury.',
  'Vênus': 'Ptolemy, Tetrabiblos I.7 — Venus among the nocturnals. Valens, Anthologiae I.1: "of the night sect", and "Venus is desire and love". Benefic: Tetrabiblos I.5.',
  'Marte':
    'Ptolemy, Tetrabiblos I.7 — Mars in the night sect. Valens, Anthologiae I.1: "of the night sect". Malefic by excessive dryness: Tetrabiblos I.5. The reason given for putting him in the night — the night is moist and tempers the dry — comes from the chapter summary of I.7, and this research base did not check the full sentence in the original.',
  'Júpiter':
    'Ptolemy, Tetrabiblos I.7 — Jupiter among the diurnals. Valens, Anthologiae I.1: "of the day sect". Benefic: Tetrabiblos I.5, "because of their tempered nature and because they abound in the hot and the moist".',
  'Saturno':
    'Ptolemy, Tetrabiblos I.7 — Saturn in the day sect. Valens, Anthologiae I.1: "of the day sect". Malefic by excessive cold: Tetrabiblos I.5. The reason given for putting him in the day — the day is hot and tempers the cold — comes from the chapter summary of I.7, and this research base did not check the full sentence in the original.',
  'Urano': 'Found in 1781. Not in Ptolemy, not in Valens: there is no ancient sect to assign.',
  'Netuno': 'Found in 1846. Not in Ptolemy, not in Valens: there is no ancient sect to assign.',
  'Plutão': 'Found in 1930. Not in Ptolemy, not in Valens: there is no ancient sect to assign.',
};

const FONTES = [
  'Ptolemy, Tetrabiblos I.7 (trans. F. E. Robbins, Loeb/Harvard, 1940) — the table of sects: Sun and Jupiter diurnal, Moon and Venus nocturnal, Mercury common, diurnal as a morning star and nocturnal as an evening star',
  'Vettius Valens, Anthologiae I.1 (trans. Riley) — the same grid planet by planet, and the rule of the malefic working inside its own sect',
  'Ptolemy, Tetrabiblos I.5 — benefics, malefics and commons, derived from the four qualities: the Moon among the benefics, the Sun among the commons',
  'Ptolemy, Tetrabiblos I.8 — oriental and occidental: the planet that shows up in the sky ahead of the Sun and the one that shows up after',
  'Ptolemy, Tetrabiblos I.7 — the reason given for the two malefics joining the sect opposite their own nature (Saturn by day, Mars by night). It comes from the chapter summary; this research base did not check the full sentence in the original',
  'Liz Greene, Saturn: A New Look at an Old Devil, 1976 — the Saturn of lessons and maturing, a 20th-century reading and not the ancient tradition',
];

const FALTA = {
  data: {
    texto:
      'Without your birth date there is nowhere to look for the Sun, and it is the Sun\'s position against the horizon that decides whether the chart is diurnal or nocturnal.',
    comoResolver: 'Enter your birth date in the Birth Chart.',
  },
  hora: {
    texto:
      'The hour is missing. Diurnal or nocturnal is a question about an instant: was the Sun above or below the horizon when you were born? Noon and midnight of the same day give opposite answers, so there is no honest guess to make here.',
    comoResolver: 'Enter your birth time in the Birth Chart — it is the same field that unlocks the Ascendant.',
  },
  cidade: {
    texto:
      'The city is missing. The horizon is different at every point on the planet: the same hour of the same day is daylight in one place and night in another. Without the place there is no horizon to compare against.',
    comoResolver: 'Pick your birth city in the Birth Chart — it is the same field that unlocks the Ascendant and the houses.',
  },
  efemeride: {
    texto: 'The sky positions could not be computed right now. The app would rather show nothing than show an invented sky.',
    comoResolver: 'Try again in a moment, in the Birth Chart.',
  },
};

// ---------------------------------------------------------------------------
// THE SECTION CHROME — the labels the screen draws around the reading
// ---------------------------------------------------------------------------
// Same shape and same keys as the `chrome` block in seita.pt.js. It lives here,
// not in lib/i18n.js, because sect is a section inside the Birth Chart and the
// screen only passes `lang` along: no sentence is born inside the component.
//
// `marca` is the domain: it is NOT translated in any language.
const CHROME = {
  rotulo: 'BORN BY DAY OR BY NIGHT',
  abrir: 'Read the whole thing',
  fechar: 'Close',
  limitrofeRotulo: 'CLOSE CALL',
  mercurioTitulo: 'THE ONLY ONE THAT SWITCHES SIDES',
  planetasTitulo: 'THE SEVEN, ONE BY ONE',
  grupoNaSeita: 'Playing at home',
  grupoForaDaSeita: 'Outside their own team',
  grupoIndeterminado: 'No side settled',
  grupoModernos: 'The three the table never mentions',
  reciboRotulo: 'RECEIPT',
  notasTitulo: 'THE CAVEATS',
  citacoesTitulo: 'IN THE WORDS OF THE SOURCE',
  fontesTitulo: 'SOURCES',
  indisponivelTitulo: 'Still one field short of an answer',
  comoResolverRotulo: 'HOW TO FIX IT',
  compartilhar: 'Share',
  copiado: 'Text copied — paste it wherever you want.',
  naoCopiou: 'Copying failed here — select the text and copy it.',
  marca: 'cosmicguide.cloud',
  compartilhavel: (r) =>
    [
      r.chamada,
      'The ancient source has a name for this: sect (hairesis, in Greek — the team each planet belongs to). The table is Ptolemy\'s, Tetrabiblos I.7, 2nd century, and Vettius Valens checks it off planet by planet in Anthologiae I.1.',
      r.limitrofe
        ? `Mine came out ${SEITA_NOME[r.seita]}, and barely: the Sun was ${formatarGraus(r.grausDoHorizonte)} degrees from the horizon, a band where a few minutes would flip the answer.`
        : `Mine came out ${SEITA_NOME[r.seita]}.`,
      'Cosmic Guide — cosmicguide.cloud',
    ].join('\n\n'),
};

export const PACK = {
  idioma: 'en',
  tela: 'Birth Chart',
  chrome: CHROME,
  formatarGraus,
  planetas: PLANETAS,
  seitaNome: SEITA_NOME,
  seitaMapa: SEITA_MAPA,
  classes: CLASSES,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  notaCondicao: NOTA_CONDICAO,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaLimitrofe: NOTA_LIMITROFE,
  mercurio: MERCURIO,
  linhas: LINHAS,
  linhaModerna: LINHA_MODERNA,
  recibos: RECIBOS,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
