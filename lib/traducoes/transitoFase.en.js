// lib/traducoes/transitoFase.en.js
// The ENGLISH pack for applying × separating. Same SHAPE as
// transitoFase.pt.js: same keys, same fields, functions with the same
// signature. The engine lives in lib/transitoFase.js.
//
// Every rule in the header of lib/transitoFase.js holds for each string here:
// hook first and source afterwards, a locus on every historical claim, nothing
// said about the body, no verdict and no promise, and — the most important one
// for this piece — DO NOT FILL THE GAP: modern astrology says the applying
// aspect outweighs the separating one, and this research base did not find the
// ancient line that authorises it. The app describes both and ranks neither.
//
// DATING is not hand-written: it goes through traduzirQuando() and
// traduzirAutor() from lib/traducoes/datacao.js.

import { traduzirAutor, traduzirQuando } from './datacao.js';

const LANG = 'en';
const PTOLOMEU = traduzirAutor('Ptolomeu', LANG);
const VALENTE = traduzirAutor('Vétio Valente', LANG);
const SEC_II = traduzirQuando('séc. II', LANG);
const SEC_XX = traduzirQuando('séc. XX', LANG);
const ANO_LILLY = traduzirQuando('1647', LANG);

// The KEYS are data (they arrive this way from personalSky.js) and stay in
// Portuguese across the three packs; only the value changes.
const PLANETAS = {
  'Sol': 'Sun',
  'Lua': 'Moon',
  'Mercúrio': 'Mercury',
  'Vênus': 'Venus',
  'Marte': 'Mars',
  'Júpiter': 'Jupiter',
  'Saturno': 'Saturn',
  'Urano': 'Uranus',
  'Netuno': 'Neptune',
  'Plutão': 'Pluto',
};

// The SAME list, in the form that goes inside a sentence. English wants "the
// Sun" and "the Moon" but bare "Mercury". Without these two lists the text
// comes out as "Sun sits 3 degrees away", which is the kind of seam that gives
// a sentence generator away.
const PLANETAS_FRASE = {
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

const ASPECTOS = {
  'Conjunção': 'Conjunction',
  'Sextil': 'Sextile',
  'Quadratura': 'Square',
  'Trígono': 'Trine',
  'Oposição': 'Opposition',
};

const FASE_NOME = {
  aplicativo: 'is forming',
  separativo: 'is breaking up',
  estacionario: 'is standing still',
};

const FASE_TERMO = {
  aplicativo: 'applying (the angle that has yet to close)',
  separativo: 'separating (the angle that already closed and is opening again)',
  estacionario: 'stationary (the planet barely moves in the sky)',
};

function formatarGraus(n, casas = 2) {
  return Number(Math.abs(n)).toFixed(casas);
}

function graus(n, casas = 2) {
  const s = formatarGraus(n, casas);
  return Number(s) === 1 ? '1 degree' : `${s} degrees`;
}

function duracao(dias) {
  const d = Math.abs(dias);
  if (d < 1 / 24) return 'less than an hour';
  if (d < 1) {
    const h = Math.max(1, Math.round(d * 24));
    return h === 1 ? 'about an hour' : `about ${h} hours`;
  }
  let inteiros = Math.floor(d);
  let horas = Math.round((d - inteiros) * 24);
  if (horas === 24) {
    inteiros += 1;
    horas = 0;
  }
  const parteDias = inteiros === 1 ? 'about a day' : `about ${inteiros} days`;
  if (!horas) return parteDias;
  return `${parteDias} and ${horas === 1 ? 'an hour' : `${horas} hours`}`;
}

// The `texto` field is Robbins's English (Loeb/Harvard, 1940) and Riley's, and
// it is IDENTICAL across the three packs. What changes per language is the
// `parafrase` — signed by the app, never inside quotation marks — and the
// language of the `locus`.
const VERBATIM = {
  ptolomeuI24: {
    texto:
      "In general those which precede are said to 'apply' to those which follow, and those that follow to 'be separated' from those that precede, when the interval between them is not great.",
    parafrase:
      'Whatever goes ahead applies to whatever follows, and whatever follows separates from what went ahead, as long as the gap between them is small. That is the definition of the two states, and it is positional: it assumes the planet moving forward.',
    locus: `${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers", trans. Robbins, 1940 — ${SEC_II}`,
  },
  valenteJupiterRetrogrado: {
    texto:
      'If Jupiter is ahead <of the Ascendant> and is found to have a retrograde configuration, its beneficial effect will be strong because it is being carried towards the position of the Ascendant.',
    parafrase:
      'Jupiter sitting ahead of the Ascendant and running retrograde is being CARRIED toward it — closing in, not drifting off. This is the ancient source that settles the case the positional definition leaves out.',
    locus: `${VALENTE}, Anthologiae IX.3, trans. Riley — ${SEC_II}`,
  },
  valenteEstacoes: {
    texto:
      'If the stars are passed the first stationary point and are found to be retrograde, they delay expectations, actions, profits, and enterprises. […] If they are at <or passed> the second stationary point, they cancel any delay and reinstate the same activities.',
    parafrase:
      'Backward motion is delay — and only delay. And the second station cancels the delay and reinstates the same activities. The tradition carries an ending that modern folklore cut off.',
    locus: `${VALENTE}, Anthologiae IV.14, "The Phases and Transits of the Stars", trans. Riley — ${SEC_II}`,
  },
};

// BLOCK 1 — THE HOOK. Real life, no technical term, no proper name, no century.
// It is the first thing the screen shows.
const CHAMADA = {
  aplicativo: () =>
    'Some things can be felt coming before they arrive. The conversation nobody has had yet, already weighing. The bill that has not fallen due. ' +
    'The air in the house that changed and no one mentioned it. This one is that kind: it is not here yet — it is on its way.',
  separativo: () =>
    'Some fights end on Monday and still take up room on Thursday. Some heavy weeks are over and the body is still moving slowly. ' +
    'Some conversations are closed and a person keeps answering them inside their own head, three days later. This one is that kind: it is done — what is left is the trail.',
  estacionario: () =>
    'Some stretches simply do not move. Nothing arrives and nothing passes. That is the hardest kind to sit with, because there is no telling whether the thing ended or has not started — ' +
    'and a person is left not knowing whether to tidy up or to wait. This one is exactly there, standing still.',
};

const RECIBO_PTOLOMEU =
  `Both states have a name, and the name is old. ${PTOLOMEU} wrote an entire chapter about nothing else in Tetrabiblos I.24, ${SEC_II} — ` +
  `the title is "Of Applications and Separations and the Other Powers". The sentence: "${VERBATIM.ptolomeuI24.texto}" ` +
  `Whatever goes ahead APPLIES to whatever follows; whatever follows SEPARATES from what went ahead. ` +
  `Hence the two terms the app uses: applying, the angle that has yet to close, and separating, the one that already closed and is opening again.`;

const RECIBO_VALENTE =
  `And here is the hole in ${PTOLOMEU}'s definition, better quoted than hidden: it is POSITIONAL. Whatever comes first in the order of the signs applies to whatever comes next — ` +
  `and that only works if the planet moves forward. Seen from here, it runs backward often enough. The one who recorded that case is ${VALENTE}, in Anthologiae IX.3, from the same ${SEC_II}, ` +
  `writing about a Jupiter in retrograde motion: "${VERBATIM.valenteJupiterRetrogrado.texto}" — carried TOWARD the point, not away from it. ` +
  `This app follows ${VALENTE} and measures the motion, not the order of the signs. We ran the sum both ways across 66,445 aspects between 2020 and 2029: ` +
  `the two criteria disagree in a little over one in eight, and every single disagreement, without one exception, is a retrograde planet.`;

const RECIBO_DATA =
  `One last thing, and it is about what this timing is NOT. The angle closes at the hour the arithmetic says, and that part is astronomy: any ephemeris confirms it. ` +
  `The idea that the day of the exact angle is the day of an event, on the other hand, comes from no ancient source at all — it is ${SEC_XX} and it was born alongside cheap ephemeris software. ` +
  `${VALENTE}, who leans on transits more than anyone else in antiquity, reads them as the trigger of a period some other factor already governed, never on their own: ` +
  `"Be aware of the transits of the stars and their changes of sign at the various chronocratorships" (Anthologiae IX.3).`;

const RECIBO_ESTACOES =
  `The ancient tradition does have something to say about a planet at a standstill, and it is modest. ${VALENTE}, Anthologiae IV.14, ${SEC_II} — the chapter is called "The Phases and Transits of the Stars": ` +
  `"${VERBATIM.valenteEstacoes.texto}" Delay at the first station, delay cancelled at the second. That is what the source says, and nothing more.`;

const ABERTURA_COMUM =
  'The difference between something on its way in and something already on its way out is the most useful thing anybody can be told about their own day — and almost nobody gets told. ' +
  'On its way in, there is still a choice about how to meet it. Already gone, what is left is sorting out the leftovers. Two different notices, and most apps hand over the same paragraph for both.';

function comoOAppMede(c) {
  return (
    `The arithmetic is easy to check: the app looks at where ${c.transitoNome} is today, looks at where it stands tomorrow, and sees whether the gap to the meeting with your natal ${c.natalNome} ` +
    `shrank or grew. Same ephemeris the Birth Chart runs on — no lookup table, no guessing.`
  );
}

const LEITURA = {
  aplicativo: (c) =>
    ABERTURA_COMUM +
    `\n\n` +
    `Today is the first case: ${c.transitoNome} sits ${graus(c.residuoGraus)} away from the exact angle with your natal ${c.natalNome}, and that distance is shrinking. ` +
    `${PRAZO(c)} ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_VALENTE +
    `\n\n` +
    RECIBO_DATA,
  separativo: (c) =>
    ABERTURA_COMUM +
    `\n\n` +
    `Today is the second case: ${c.transitoNome} has ALREADY gone past the exact angle with your natal ${c.natalNome} — it sits ${graus(c.residuoGraus)} away from it now, and that distance is growing. ` +
    `${PRAZO(c)} ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_VALENTE +
    `\n\n` +
    RECIBO_DATA,
  estacionario: (c) =>
    'Some stretches do not move at all. Not good, not bad: unanswered. There is no knowing whether to sort out what is left behind or to wait for what is coming, because there is no telling which one it is. ' +
    'Sitting with that is a different thing from sitting with something hard that at least moves.' +
    `\n\n` +
    `Today is that case, and it is literal: ${c.transitoNome} is practically at a standstill in the sky — it moved ${graus(c.movimentoDiario, 4)} in twenty-four hours. ` +
    `With the planet stopped, the angle to your natal ${c.natalNome} is neither shrinking nor growing, and the app will not pick a verb on your behalf. ` +
    `What can be stated is the distance: ${graus(c.residuoGraus)} to the exact meeting. ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_ESTACOES +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_DATA,
};

function PRAZO(c) {
  if (c.fase === 'estacionario') {
    return `No timing here: with ${c.transitoNome} at a standstill, the sum would divide by almost zero, and the app puts no number on top of that.`;
  }
  if (!c.dentroDoHorizonte) {
    return (
      `The app gives no timing for this one: the estimate runs past ${c.horizonte} days, and that is where the arithmetic stops holding. ` +
      `What can be stated is measurement, not projection — ${graus(c.residuoGraus)} separate ${c.transitoNome} from the exact angle right now, and today it moves ${graus(c.movimentoDiario, 3)} per day.`
    );
  }
  if (c.diasParaExato > 0) {
    return c.exatoNoDia
      ? `The exact angle closes today, ${duracao(c.diasParaExato)} from now.`
      : `The exact angle closes in ${duracao(c.diasParaExato)}.`;
  }
  return c.exatoNoDia
    ? `The exact angle closed today, ${duracao(c.diasParaExato)} ago.`
    : `The exact angle closed ${duracao(c.diasParaExato)} ago.`;
}

const LINHA_CURTA = {
  aplicativo: (c) =>
    c.dentroDoHorizonte
      ? `Forming: the exact angle closes in ${duracao(c.diasParaExato)}.`
      : `Forming: ${graus(c.residuoGraus)} to go until the exact angle.`,
  separativo: (c) =>
    c.dentroDoHorizonte
      ? `Already breaking up: the exact angle closed ${duracao(c.diasParaExato)} ago.`
      : `Already breaking up: ${graus(c.residuoGraus)} past the exact angle.`,
  estacionario: (c) =>
    `Standing still: ${c.transitoNome} barely moved over the last twenty-four hours, and the angle is neither closing nor opening.`,
};

const NOTA_MARCHA = {
  direto: (c) =>
    `Today ${c.transitoNome} runs direct: it moved ${graus(c.movimentoDiario, 3)} forward over the last twenty-four hours. ` +
    `In that case the order of the signs and the real motion say the same thing, and the two criteria of the tradition agree.`,
  retrogrado: (c) =>
    `Today ${c.transitoNome} runs retrograde: it moved ${graus(c.movimentoDiario, 3)} BACKWARD over the last twenty-four hours. ` +
    `This is the case where the verb flips — what was leaving comes back, what was arriving pulls away — and it is where this app drops ${PTOLOMEU}'s positional definition (Tetrabiblos I.24) ` +
    `and follows ${VALENTE}'s (Anthologiae IX.3), the one that watches the motion. ` +
    `About backward motion itself, the ancient source says one thing only, and it is modest: "If the stars are passed the first stationary point and are found to be retrograde, they delay expectations, actions, profits, and enterprises" ` +
    `(${VALENTE}, Anthologiae IV.14, ${SEC_II}). Delay. And the second station cancels the delay — "they cancel any delay and reinstate the same activities" — ` +
    `which is the half modern folklore cut away.`,
};

const NOTA_HORIZONTE = (c) =>
  `Why there is no date here. The timing comes from a straight line drawn through twenty-four hours of motion, and it only holds near the meeting. ` +
  `We checked it against the real ephemeris across 3,735 aspects: out to three days the median error stayed under an hour; from a week onward it can run past a month, ` +
  `because the planet changes speed and may stop and turn back before it gets there. Beyond ${c.horizonte} days the app states degrees, which is measurement, and says nothing about days, which would be projection.`;

const NOTA_ORBE =
  `Whose orb this screen uses — orb being the distance from which the app counts an angle as standing. ` +
  `It is our own modern convention, not the source's: ${PTOLOMEU} gives no orb at all (in Tetrabiblos I.13, ${SEC_II}, aspects run between whole signs), ` +
  `and in I.24 the condition is only "when the interval between them is not great" — which is not a number of degrees. ` +
  `In the later tradition the orb belongs to the PLANET and not to the aspect, and the one who tabulates it is William Lilly, Christian Astrology, Book I, p. 107, London, ${ANO_LILLY}.`;

const NOTA_LEITURA_DO_APP =
  `What is arithmetic and what is reading. The arithmetic: the app takes the planet's position today, the same position tomorrow and the position in your birth chart, from a real ephemeris, ` +
  `and sees whether the gap to the exact angle shrank or grew. That part is astronomy, and any ephemeris confirms it. ` +
  `The reading: calling one state applying and the other separating is ${PTOLOMEU} (Tetrabiblos I.24) and ${VALENTE} (Anthologiae IX.3), both ${SEC_II}. ` +
  `Choosing real motion over the order of the signs, where the two disagree, is this app's choice — declared here instead of hidden. ` +
  `And what the app does NOT say: that either state outweighs the other. Modern astrology repeats that constantly; this research base did not find the ancient line that authorises it, ` +
  `and the gap stays declared instead of filled.`;

const NOTA_DATA_DE_EVENTO =
  `What this timing is not. The angle closes at the hour the arithmetic says — that part is astronomy and can be checked. ` +
  `That the day of the exact angle should be the day of an event is a ${SEC_XX} idea, born alongside cheap ephemeris software, and it sits in no ancient source. ` +
  `${VALENTE} reads a transit as the trigger of a period some other factor already governed, never on its own: ` +
  `"Be aware of the transits of the stars and their changes of sign at the various chronocratorships" (Anthologiae IX.3, trans. Riley, ${SEC_II}).`;

const FONTES = [
  `${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers" (trans. F. E. Robbins, Loeb/Harvard, 1940), ${SEC_II} — the definition of the two states: what precedes applies, what follows separates`,
  `${VALENTE}, Anthologiae IX.3 (trans. Mark T. Riley), ${SEC_II} — the Jupiter in retrograde motion "being carried towards the position of the Ascendant": the ancient source recording the case the positional definition leaves out`,
  `${VALENTE}, Anthologiae IV.14, "The Phases and Transits of the Stars" (trans. Riley), ${SEC_II} — the stations: delay at the first, delay cancelled at the second`,
  `${VALENTE}, Anthologiae IX.3 (trans. Riley), ${SEC_II} — "Be aware of the transits of the stars and their changes of sign at the various chronocratorships": in the source a transit is the trigger, and the subject is set by the lord of time`,
  `${PTOLOMEU}, Tetrabiblos I.13, ${SEC_II} — the four aspects, and the absence of any orb: in ${PTOLOMEU} an aspect runs between whole signs`,
  `William Lilly, Christian Astrology, Book I, p. 107, London, ${ANO_LILLY} — the table of orbs and the rule of the moiety: in the later tradition the orb belongs to the planet, not to the aspect`,
];

const FALTA = {
  data: {
    texto:
      "Without the birth date there is no chart to compare today's sky against, and everything comes out of that comparison: whether the angle is forming or has already broken up. The app would rather show nothing than show an invented chart.",
    comoResolver: 'Enter your birth date in the Birth Chart.',
  },
  aspecto: {
    texto:
      "The aspect given could not be recognised. This reading works on a meeting between a planet in today's sky and a point in your birth chart, at one of the five angles the app computes — and without the three names there is nothing to measure.",
    comoResolver: "Open Today's sky for you from the Birth Chart, which is where these aspects come from.",
  },
  efemeride: {
    texto:
      "The sky positions could not be computed right now. Without them there is no way to compare today's position against tomorrow's, which is the whole arithmetic of this reading. The app would rather show nothing than show an invented sky.",
    comoResolver: 'Try again in a moment, in the Birth Chart.',
  },
  horaParaLuaNatal: {
    texto:
      'The birth hour is missing, and here it is not a detail. This meeting touches your natal Moon, and the Moon is the one point in the chart that travels fast: up to 7.69 degrees in twenty-four hours — more than the whole distance this screen works with. ' +
      'Without the hour the app would fall back on noon. We measured what that does: comparing the natal Moon at noon against midnight and against 23:59 across 6,334 meetings, out of 12,668 comparisons 10,054 fell out of range, 2,613 stayed in range but flipped the verb, and exactly one survived unchanged. ' +
      'Saying "it is forming" on top of that would be a coin toss wearing the face of arithmetic.',
    comoResolver: 'Enter the birth hour in the Birth Chart — the same field that unlocks the Ascendant.',
  },
};

// ---------------------------------------------------------------------------
// THE SCREEN CHROME — everything the SHOWCASE draws around the reading. Same
// shape and same keys as the `chrome` block in transitoFase.pt.js; the screen
// writes not one line of it.
// ---------------------------------------------------------------------------
const LINK_COMPARTILHAR = 'https://cosmicguide.cloud/cosmic-guide/';

function tituloDoCard(r) {
  return `Today's ${r.transitoRotulo} × natal ${r.natalRotulo}`;
}

function subtituloDoCard(r) {
  if (!r.aspectoNome || typeof r.angulo !== 'number') return '';
  return `${r.aspectoNome} · ${r.angulo}°`;
}

function textoCompartilhavel(r) {
  if (!r || !r.disponivel) return '';
  return [
    tituloDoCard(r),
    r.linhaCurta,
    `The tradition calls this one ${r.faseTermo}.`,
    `${PTOLOMEU}, Tetrabiblos I.24, ${SEC_II} — the chapter that tells the two states apart.`,
    LINK_COMPARTILHAR,
  ].join('\n');
}

const CHROME = {
  marca: 'cosmicguide.cloud',
  kicker: 'Coming in or on its way out',
  titulo: "The direction of today's meetings",
  intro:
    'Two things can sit the same distance from today and have nothing in common: the talk booked for the day after tomorrow and the argument that ended the day before yesterday. ' +
    'One is still on its way in; the other is done, and what is left of it is a trail. Which side a thing is on changes what a person does about it — and that is exactly what almost no app says.',
  porQue:
    "The calendar above marks the day of the sky's meetings with itself. This part is a different thing: it looks at today's sky against your birth chart and states the DIRECTION of each meeting. " +
    'The angle that has yet to close and the one that already closed and is opening again show up at the SAME distance in degrees — what tells them apart is the sign of the subtraction, and the sign is what gives the verb.',
  divergencia:
    `Both states have had a name since the ${SEC_II}, and there is a whole chapter about nothing else: ${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers" (trans. Robbins). ` +
    `Except that the two sources from that same century do not say the same thing. ${PTOLOMEU} defines by POSITION — whatever goes ahead applies to whatever follows — and that only holds if the planet always moves forward. ` +
    `${VALENTE}, Anthologiae IX.3, records the leftover case: a Jupiter running retrograde "is being carried towards the position of the Ascendant" — moving toward the point, backwards. ` +
    `This app measures the motion and follows ${VALENTE}; wherever the two criteria disagree, the planet is retrograde, without a single exception in the sweep we ran. The choice is written down here instead of hidden.`,
  rotuloLista: 'One by one, with the direction',
  abrir: 'Read the whole thing',
  fechar: 'Close the reading',
  rotuloRecibo: 'Where this comes from',
  rotuloVerbatim: 'The sources, word for word',
  rotuloNotas: 'What is arithmetic and what is reading',
  compartilhar: 'Share',
  copiado: 'Copied. Just paste it wherever.',
  naoCopiou: 'Copying did not work here. Select the text above and copy it by hand.',
  semAspectos:
    'Today no planet in the sky sits close enough to a point in your birth chart for this reading. ' +
    'Nothing is missing: it is a day with no meeting inside the range the app works with, and tomorrow the list changes on its own.',
  semNascimento: {
    texto:
      "This part only exists with your birth date: it compares today's sky against the chart of your birth and states which side of the meeting each planet is on. " +
      'Without the date, the app would rather show nothing than show an invented chart.',
    cta: 'Enter it in the Birth Chart',
  },
  bloqueado: {
    titulo: 'The first one is open. The rest comes with the plan.',
    texto:
      "The most exact meeting of the day stays open here. The others in today's sky, each with its own direction and the full sources, sit with the subscription.",
    cta: 'See the plans',
  },
  selo: {
    aplicativo: 'Coming in',
    separativo: 'On its way out',
    estacionario: 'Standing still',
  },
  tituloDoCard,
  subtituloDoCard,
  textoCompartilhavel,
};

export const PACK = {
  idioma: 'en',
  tela: 'Birth Chart',
  telaCeu: "Today's sky for you",
  chrome: CHROME,
  formatarGraus,
  graus,
  duracao,
  planetas: PLANETAS,
  planetasFrase: PLANETAS_FRASE,
  aspectos: ASPECTOS,
  faseNome: FASE_NOME,
  faseTermo: FASE_TERMO,
  chamada: CHAMADA,
  leitura: LEITURA,
  prazo: PRAZO,
  linhaCurta: LINHA_CURTA,
  notaMarcha: NOTA_MARCHA,
  notaHorizonte: NOTA_HORIZONTE,
  notaOrbe: NOTA_ORBE,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaDataDeEvento: NOTA_DATA_DE_EVENTO,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
