// lib/traducoes/pensamento.en.js
// ENGLISH PACK for the COSMIC THOUGHT OF THE DAY — lib/dailyThought.js. This
// is the app's number-one piece of content: the Home card everyone reads every
// day. Only the words the reader sees live here; the engine stays canonical in
// Portuguese.
//
// THE ENGINE DOES NOT CHANGE. Same day + same sign = same thought, in every
// language: phase, Moon sign, ruler of the day, retrograde and aspect are
// computed and picked identically. All this file does is lend that arithmetic
// a vocabulary.
//
// WHAT IS NEVER TRANSLATED (test/pensamentoIdiomas.test.js enforces it):
//   · the KEYS of `signos`, `planetas` and `aspectos` — those are the
//     canonical names from lib/signs.js, the joint with the calculation.
//     Translate a key and the thought goes silently mute;
//   · the emoji (phase, sign, ruler, ↩️): they have no language;
//   · the ORDER of `regentes` (0 = Sunday … 6 = Saturday, Chaldean order) and
//     the order of `relacaoSigno` (0 = same sign … 6 = opposite sign).
//     Reordering tells the reader something the sky did not say.
//
// THE RED LINE, in English: no relieve, soothe, calm, heal, cure, treat or
// energize, and none of their relatives. No promised outcome, no verdict on
// anyone's life, no defensive disclaimer, no invented social proof. The text
// describes the sky and offers an invitation — it never says what will happen.
//
// THE VOICE: hook first, receipt after — same as the PT. It opens in real-life
// conversation and only then names a source. Translation of SENSE, not of
// words: this should read like an American app talking, not like Portuguese
// wearing English.
export default {
  // The three openers by time of day (morning / afternoon / night, device
  // local time). They are the only part that shifts within one same day.
  aberturas: {
    manha: 'The day is starting right now, whole, with nothing written on it yet.',
    tarde: 'Half the day is gone — a good moment to check if it\'s going where you wanted it to.',
    noite: 'The day is closing — before bed, worth writing down what it left you.',
  },

  // No ephemeris means no sky, and sky is not something we make up: the text
  // says so. "Lunar Calendar" is the screen's English name (lib/i18n.js).
  carregando: 'Today\'s sky is still loading — open the Lunar Calendar in a moment.',

  // Templates. The placeholders are part of the contract: same names, same
  // trailing spaces. {icone} already carries its own space when it exists.
  //
  // WHY THE ASPECT LINE OPENS WITH "In the sky," AND THE PT ONE DOES NOT: in
  // English the two luminaries need their article ("the Moon", "the Sun"), so
  // `planetas` below carries it. A planet can therefore never start a
  // sentence here — "the Moon and Uranus are in sextile" would open a sentence
  // in lowercase. Both templates keep the planet mid-sentence, and the line
  // reads like English instead of like Portuguese wearing English.
  // AND IT SAYS "in the sky", NOT "overhead": overhead means at the zenith, and
  // two planets in aspect can perfectly well be below the horizon. The app does
  // not compute altitude, so it does not get to claim any (proposition 1 of
  // docs/tradicao/00-tese.md — no astronomical claim without the maths behind
  // it). The prefix is there for the capital letter, and that is all it does.
  saudacao: '{icone}{signo}, ',
  luaEm: 'The Moon is in {signo} {emoji}. ',
  regenteFrase: 'Today belongs to {planeta} {emoji} — leave room for {tema}. {ponte}',
  aspectoFrase: 'In the sky, {planetaA} and {planetaB} are in {aspecto} {quando} — {tom}.',

  // The relationship between today's Moon and the reader's own sign, read by
  // whole sign (Hellenistic doctrine: two signs either see each other or they
  // do not, no orb). 0 = same sign … 6 = opposite sign. The order IS the
  // meaning.
  relacaoSigno: [
    'The Moon is right in your sign today — carry the day with your heart more exposed, your sensitivity is running high.',
    'The Moon asks for a fine adjustment to your routine today — small tweaks go further than big decisions.',
    'The Moon opens an easy chance for your sign today — worth taking it without forcing anything.',
    'The Moon puts some tension on your sign today — it may call in a decision you have been putting off.',
    'The Moon flows easily with your sign today — things tend to sort themselves out with less effort than usual.',
    'The Moon asks for a small reset of expectation today — what looks out of place only needs another angle.',
    'The Moon sits right across from your sign today — it\'s normal to feel a tug-of-war between what you want and what the moment asks for.',
  ],

  // Traditional rulership of the weekdays (Chaldean order). Index =
  // Date.getDay(): 0 = Sunday … 6 = Saturday. The planet's name does NOT live
  // here — it comes from `planetas`, so there is one single source. `ponte` is
  // the bridge into tomorrow and names tomorrow's REAL ruler.
  regentes: [
    {
      tema: 'shining your own way, with no need to explain yourself to anyone',
      ponte: 'Tomorrow the Moon arrives bringing room to feel more deeply — save a place for that.',
    }, // Sunday
    {
      tema: 'feeling deeply and caring for the people you love — yourself included',
      ponte: 'Tomorrow Mars lends the courage to turn what you felt today into action.',
    }, // Monday
    {
      tema: 'acting even while afraid — real courage is taking the step in spite of it',
      ponte: 'Tomorrow Mercury helps put into words what you started moving today.',
    }, // Tuesday
    {
      tema: 'saying what needs to be said, even if your voice shakes a little',
      ponte: 'Tomorrow Jupiter opens horizons out of what got talked through today.',
    }, // Wednesday
    {
      tema: 'believing there is still time for the good things to happen',
      ponte: 'Tomorrow Venus invites you toward love and abundance — use what opened up today.',
    }, // Thursday
    {
      tema: 'letting yourself receive love, beauty and abundance without guilt',
      ponte: 'Tomorrow Saturn helps give all of that shape and roots.',
    }, // Friday
    {
      tema: 'facing what weighs on you with maturity — not everything has to be light to be worth it',
      ponte: 'Tomorrow the cycle starts over with the Sun — a new chapter of your week.',
    }, // Saturday
  ],

  // Mercury retrograde — actually computed (lib/signs.js), never assumed.
  // "slowly, with no rush" instead of "calmly": same sense, and the banned
  // word stays out.
  retrogrado:
    'If today feels like nothing runs at the right pace, Mercury retrograde ↩️ explains it — it\'s not just you. It\'s an invitation to review and adjust slowly, with no rush to decide everything now.',

  // "today" only when the aspect really is of today (it involves a luminary or
  // a personal planet). Between slow planets it lasts weeks: that is a
  // stretch of time, not news of the day.
  aspectoQuando: {
    hoje: 'today',
    periodo: 'over this period',
  },

  // CANONICAL KEYS (lib/signs.js, ASPECTS_TABLE). `nome` is lowercase because
  // it lands mid-sentence; `tom` is the traditional meaning.
  aspectos: {
    'Conjunção': { nome: 'conjunction', tom: 'adding their forces in your favor' },
    'Sextil': { nome: 'sextile', tom: 'opening an easy opportunity to make use of' },
    'Trígono': { nome: 'trine', tom: 'flowing easily, almost without effort' },
    'Quadratura': {
      nome: 'square',
      tom: 'calling in a hard decision — it hurts, but it\'s the kind of hurt that makes you grow',
    },
    'Oposição': {
      nome: 'opposition',
      tom: 'pulling in two directions — it\'s fine to feel that weight before finding the middle ground',
    },
  },

  // NAMES — keys are the canonical names from lib/signs.js.
  signos: {
    'Áries': 'Aries',
    'Touro': 'Taurus',
    'Gêmeos': 'Gemini',
    'Câncer': 'Cancer',
    'Leão': 'Leo',
    'Virgem': 'Virgo',
    'Libra': 'Libra',
    'Escorpião': 'Scorpio',
    'Sagitário': 'Sagittarius',
    'Capricórnio': 'Capricorn',
    'Aquário': 'Aquarius',
    'Peixes': 'Pisces',
  },
  // The two luminaries carry their article: English says "the Sun" and "the
  // Moon", never bare "Sun"/"Moon", in running prose. The templates above are
  // written so neither ever lands at the start of a sentence.
  planetas: {
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
  },
};
