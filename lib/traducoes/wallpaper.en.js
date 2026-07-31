// lib/traducoes/wallpaper.en.js
// ENGLISH PACK for the SKY WALLPAPER — lib/wallpaper.js. It translates the two
// layers of text in the feature: the lines that go INSIDE the drawing (they
// land on a lock screen) and the chrome of the screen that delivers it
// (screens/WallpaperScreen.js).
//
// THE DRAWING DOES NOT CHANGE LANGUAGE. Gradient, glyph, illumination disc and
// the deterministic pick by day (FNV-1a hash of the YYYY-MM-DD) are identical
// in all three languages: the same day lands on the SAME position of the pool.
// That is why every pool here holds exactly as many lines as the PT one — one
// line more or fewer and the day's index points somewhere else, and the
// wallpaper stops being "the same sky in another language".
//
// WHAT IS NEVER TRANSLATED:
//   · the KEYS of `frases`, `fases`, `signos` and `planetas` — canonical names
//     from lib/lunarCalendar.js and lib/signs.js, the joint with the real
//     calculation;
//   · the cosmicguide.cloud mark and the link, identical in all three;
//   · the numbers: 1080 × 1920 is the file's size, not a figure of speech, and
//     Pliny's century is the 1st in any language.
//
// THE RED LINE, in English: no relieve, soothe, calm, heal, cure, treat or
// energize. No promised outcome, no verdict, no pseudoscientific mechanism
// (energy, vibration, aura), no social proof. A lock-screen line INVITES you
// to do something today — it never announces what the universe will hand back.
//
// THE RECEIPT INSIDE THE LINE: the three lines that assert something
// historical carry author and century in the line itself (Pliny, 1st century),
// same as the PT. On a canvas with no room for a footnote, that is the only
// honest way to assert anything.
export default {
  // ---------------------------------------------------------------------
  // 1. THE LINES ON THE DRAWING — keys are the canonical phase names
  // ---------------------------------------------------------------------
  frases: {
    'Lua Nova': [
      'Dark sky, month back to zero. What do you want to see born before the Moon fills up?',
      'Nobody sees the Moon today. A good day to take, quietly, the first step of something.',
      'The cycle\'s zero point. Write down one thing only: the one you want to carry this month.',
    ],
    'Lua Crescente': [
      'The light is coming back. What you started deserves ten minutes today.',
      'A thin Moon in the sky: a small step is still a step. Take today\'s.',
      'The Moon grows a little each night. Something of yours can move at that same pace.',
    ],
    'Quarto Crescente': [
      'Half the light: the month\'s first crossroads. Is the plan still the same?',
      'Half a Moon in the sky. A good time to check the route before going on.',
      'The week is asking for focus on one single point. Which one?',
    ],
    'Lua Gibosa Crescente': [
      'Almost full. Nearly there: adjust the detail, don\'t start over from scratch.',
      'More than half the Moon lit — that is what "gibbous" means. Finish what sits one step from done.',
      'Before the peak, the touch-up. What can you polish today?',
    ],
    'Lua Cheia': [
      'The month\'s peak of light. Look at what had already been taking shape in your life.',
      'A clear sky all night long. A good time to see the whole, not the detail.',
      'They say the Full Moon is harvest day. The Roman source put harvest at the waning moon (Pliny, 1st century).',
    ],
    'Lua Gibosa Minguante': [
      'The light has started to pull back. Pass along to someone one thing you learned this month.',
      'This was when Roman farms harvested for storage (Pliny, 1st century). What do you keep from this month?',
      'After the peak, the sharing. Tell someone what worked.',
    ],
    'Quarto Minguante': [
      'Half the light, and falling. What comes off your list today?',
      'One thing less today: a commitment, an open tab, a weight in the backpack.',
      'At the waning moon, Roman farms cut and weeded (Pliny, 1st century). Cut one thing today.',
    ],
    'Lua Minguante': [
      'The cycle\'s last days. Less noise, more silence — the new month is already coming.',
      'The Moon is fading from the sky. A good moment to take stock: what stays, what goes?',
      'End of cycle is inventory. One line in the journal already counts.',
    ],
  },

  // No ephemeris: the line SAYS the sky was not computed instead of faking it.
  // None of the three names a phase or a sign — naming one would be exactly
  // the invented sky this branch exists to avoid.
  frasesSemCeu: [
    'Today\'s sky couldn\'t be computed — and sky isn\'t something we make up. The invitation stands: one minute away from the screen.',
    'No ephemeris right now. Instead of an invented sky, a question: what have you been putting off since yesterday?',
    'Today the app did not reach the sky. The day is still yours: pick one thing to finish.',
  ],

  // Guard against the future: unknown phase name, but the sky WAS computed.
  // Asserts nothing.
  frasesGenericas: [
    'Look up from the screen tonight: the real sky is still up there.',
  ],

  // ---------------------------------------------------------------------
  // 2. DISPLAY NAMES — canonical keys, translated values
  // ---------------------------------------------------------------------
  // These eight must match character for character what lib/lunarCalendar.js
  // returns in English: one single source of truth for the phase name across
  // the whole app (the test compares them).
  fases: {
    'Lua Nova': 'New Moon',
    'Lua Crescente': 'Waxing Crescent',
    'Quarto Crescente': 'First Quarter',
    'Lua Gibosa Crescente': 'Waxing Gibbous',
    'Lua Cheia': 'Full Moon',
    'Lua Gibosa Minguante': 'Waning Gibbous',
    'Quarto Minguante': 'Last Quarter',
    'Lua Minguante': 'Waning Crescent',
  },
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
  // The seven rulers of the week (Chaldean order) — the only planet the
  // drawing ever names, on the branch with no ephemeris.
  // The two luminaries carry their article, same as in the Daily Thought pack:
  // the drawing prints "DAY OF ___", and "DAY OF SUN" is not English. With the
  // article it reads DAY OF THE SUN / DAY OF THE MOON / DAY OF MARS.
  planetas: {
    'Sol': 'the Sun',
    'Lua': 'the Moon',
    'Marte': 'Mars',
    'Mercúrio': 'Mercury',
    'Júpiter': 'Jupiter',
    'Vênus': 'Venus',
    'Saturno': 'Saturn',
  },

  // ---------------------------------------------------------------------
  // 3. THE LONG DATE — no Intl, same as the PT
  // ---------------------------------------------------------------------
  // Index 0 = Sunday (Date.getDay()) and 0 = January (Date.getMonth()). No
  // year: a wallpaper stays on the screen for weeks, and the year would only
  // age the drawing. English puts the month before the day — that is why
  // `dataLonga` has a different word order and the same placeholders.
  diasSemana: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  meses: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  dataLonga: '{diaSemana}, {mes} {dia}',

  // ---------------------------------------------------------------------
  // 4. THE SCREEN CHROME (screens/WallpaperScreen.js)
  // ---------------------------------------------------------------------
  // `titulo` and `subtitulo` are the SAME strings as the Home card in
  // lib/i18n.js ('home.card.wallpaper.*'): the feature has one visible name
  // per language, and the test enforces it.
  tela: {
    titulo: 'Wallpaper',
    subtitulo: 'Today\'s sky on your screen',
    baixar: 'DOWNLOAD WALLPAPER',
    baixado: 'Downloaded. Now just set it as your wallpaper in your phone settings.',
    falhou: 'Could not generate the image right now. Try again.',
    tamanho: '1080 × 1920 — fits any phone screen.',
    amanha: 'Tomorrow the sky changes — and the drawing changes with it. Come back.',
    soWeb: 'Downloading the image is web-only for now. Open cosmicguide.cloud in your phone browser and the button shows up.',
    semCeu: 'The Moon\'s position could not be computed right now — today\'s drawing is neutral and says so in its own line.',
    luaEm: 'MOON IN',
    diaDe: 'DAY OF',
    iluminada: 'lit',
  },
};
