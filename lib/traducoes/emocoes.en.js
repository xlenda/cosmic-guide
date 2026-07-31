// lib/traducoes/emocoes.en.js
// ENGLISH PACK for lib/emocoes.js — same shape as the derived pt pack
// (packDeTextos), key by key. The engine stays canonical in PT; this file
// carries ONLY the text the person reads, translated for SENSE.
//
// THE RULES OF THIS FILE (same red line as lib/emocoes.js, English cousins):
//   (1) The `fala` is a person VENTING, not a form field: "Tô ansiosa com o
//       futuro" becomes "I keep worrying about what's next" — the way you'd
//       say it to a friend, never "I am anxious about the future". The person
//       may describe herself; the app's answer is what must not treat.
//   (2) The bridge is about SUBJECT, never effect: it says what the reading
//       covers, never what it does to you. That is why "help" never enters —
//       "this helps with how you feel" is exactly the treatment bridge this
//       screen does not build.
//   (3) Red line in English: no relieve/soothe/calm/heal/cure/treat/energize,
//       no promises (attract/guarantee/manifest/protect/ward off), no made-up
//       mechanism (energy/vibration/aura/chakra). "sleep" stays out too — the
//       dreams feature talks about dreams, not sleep.
//       test/emocoesIdiomas.test.js sweeps every VALUE in this pack and bites.
//       (Comments are deliberately out of the sweep: this very line has to be
//       able to spell the forbidden words in order to forbid them.)
//   (4) Heavy suffering stays out: grief, despair, panic and their kin do not
//       become chips in any language.
//   (5) No historical claims: no author, work, century or year — the source
//       lives INSIDE the feature; the door only points. Same as PT.
//   (6) Terminology inherited from lib/i18n.js (en): Settle, Guided Journey,
//       Cosmic Diary, Cosmic Calendar, Rituals (shelves Love / Clearing out /
//       Prosperity), Tarot, Compatibility, Dreams.
//
// SHAPE CONTRACT (enforced by test/emocoesIdiomas.test.js): `tela` with the
// four chrome lines; `estados` with the SAME ids as ESTADOS, each with `fala`
// and `pontes` (array of STRINGS, same order as the PT bridges — the
// destination stays in the engine); `destinos` with the SAME ids as DESTINOS,
// each with `rotulo` and `botao`.
export default {
  tela: {
    titulo: 'How are you doing?',
    subtitulo: 'Say it your way',
    intro: 'Tap whatever sounds most like you right now. Each one points to the reading that covers that subject.',
    overlinePontes: 'Where this lives in the app',
  },

  estados: {
    ansiosaComOFuturo: {
      fala: "I keep worrying about what's next",
      pontes: [
        "The three-card spread has one position just for what's ahead: the Future, read as direction — where things are pointing if nothing changes. That question is exactly what this position covers.",
        "Today's horoscope describes the sky over your day, for your sign — the day ahead is exactly the subject it covers.",
      ],
    },
    brigueiComQuemAmo: {
      fala: 'I got into a fight with someone I love',
      pontes: [
        'The compatibility reading names the relationship between two signs — including the tough pairings, which it calls by name instead of dressing them up with a high score.',
        'The diary is the page with no audience: your side of the fight, written down with a date, to reread once the dust settles.',
      ],
    },
    semRumo: {
      fala: "I don't know which way to go",
      pontes: [
        'The three-position spread splits the question into parts: where things came from, where they stand and where they point. Direction is exactly what it looks at.',
        'The Journey is a seven-day trail with one step marked out per day — for when you want to get moving without having to decide the whole map today.',
      ],
    },
    saudadeDeAlguem: {
      fala: 'I miss someone like crazy',
      pontes: [
        "On the Love shelf of the Rituals there's a gesture made for exactly this subject: the letter that never gets sent — write what you feel, read it out loud, and put it away.",
        'The diary keeps that missing-someone feeling on record, with a date. A month from now you can reread it and see what it turned into.',
      ],
    },
    medoDeDecidirErrado: {
      fala: 'Scared of making the wrong call',
      pontes: [
        'The tarot opens the decision into three positions — where it came from, where it stands, where it points. It reads the situation; the choice stays in your hands.',
        'In the diary you can write out both sides of the decision, dated — and come back later to check what you had already seen.',
      ],
    },
    querendoRecomecar: {
      fala: 'Ready for a fresh start',
      pontes: [
        'The Journey starts from day one on purpose: seven days, one step a day, progress marked on screen. A fresh start with rails under it.',
        'The Clearing out shelf in the Rituals is all endings — emptying, letting go, closing what was left open, with your own hands.',
      ],
    },
    cabecaCheia: {
      fala: "My mind won't shut off",
      pontes: [
        'Settle is counted breathing: four counts, with a start and an end marked on the clock. The screen only keeps the beat — the rest is yours.',
        'The diary takes the whole list, exactly as it is — dumping it onto the page is a gesture, and the page keeps it dated.',
      ],
    },
    sonhoQueNaoLargou: {
      fala: "Had a weird dream and it won't leave me alone",
      pontes: [
        'The dream reading starts from the image that stayed with you: you tell what you dreamed and the reading walks through what that image carries in tradition.',
      ],
    },
    divididaEntreDuasPessoas: {
      fala: 'Torn between two people',
      pontes: [
        'Compatibility reads one pair at a time — you can run both pairings and compare the relationship each one comes back named as.',
        "In the tarot, the Love theme reads the cards through the question of the bond — the desire, what hasn't been put into words yet, what needs saying.",
      ],
    },
    granaApertada: {
      fala: "Money's tight this month",
      pontes: [
        'The tarot has a theme just for money: the same cards, read with the numbers looked at straight on, without the story around them.',
        "The Prosperity shelf of the Rituals starts with the bills on the table, literally — pen, paper and the real size of what's there.",
      ],
    },
    conheciAlguem: {
      fala: "Just met someone and I'm already getting ahead of myself",
      pontes: [
        'The compatibility reading takes both signs and says what kind of relationship runs between them — a relationship with a name, not a loose percentage.',
        "The tarot's Love theme takes exactly this kind of question — the bond that's just beginning, read card by card.",
      ],
    },
    diaGrandeAmanha: {
      fala: "Tomorrow's a big day for me",
      pontes: [
        "The Cosmic Calendar shows what the sky has marked for that date: the exact Moon phase, the Sun's ingress, retrogrades — all computed, none of it from a lookup table.",
        "The daily horoscope reads today's sky for your sign — a portrait of the sky on the eve of your big day.",
      ],
    },
  },

  destinos: {
    taro: { rotulo: 'Tarot', botao: 'Open the Tarot' },
    horoscopo: { rotulo: "Today's horoscope", botao: "See today's horoscope" },
    compatibilidade: { rotulo: 'Compatibility', botao: 'Open Compatibility' },
    sonhos: { rotulo: 'Dream reading', botao: 'Tell your dream' },
    diario: { rotulo: 'Cosmic Diary', botao: 'Write in the Diary' },
    aterramento: { rotulo: 'Settle', botao: 'Open Settle' },
    rituais: { rotulo: 'Rituals', botao: 'See the Rituals' },
    jornada: { rotulo: 'Guided Journey', botao: 'Start the Journey' },
    calendarioCosmico: { rotulo: 'Cosmic Calendar', botao: 'Open the Cosmic Calendar' },
  },
};
