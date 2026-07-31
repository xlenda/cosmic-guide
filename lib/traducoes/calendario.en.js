// lib/traducoes/calendario.en.js
// TEXT PACK — ENGLISH (natural US-app English, not word-for-word).
//
// READ lib/traducoes/calendario.pt.js BEFORE EDITING — its header is the
// contract shared by the three packs: same keys, same {x} placeholders,
// translation of MEANING (hook first, receipt after; conversation, not a
// lecture).
//
// NEVER TRANSLATED: Latin/Greek work titles and loci (Tetrabiblos I.13,
// Naturalis Historia XVIII.321, De Re Rustica XI.2.85, De Agri Cultura 40.1,
// Anthologiae V), numbers, dates. Robbins's verbatims are ALREADY English —
// here they appear directly, in quotes. Consecrated proper names DO
// translate: Ptolomeu → Claudius Ptolemy, Plínio → Pliny the Elder,
// Catão → Cato the Elder, Os Trabalhos e os Dias → Works and Days.
//
// RED LINE (test/calendarioIdiomas.test.js sweeps and fails the build):
// no relieve/soothe/calm/heal/cure/treat/energize nor any health claim; no
// promised outcomes; no instructions to the reader in calendar events; no
// defensive disclaimers.
//
// The sentinel below is NOT screen text (the screen cuts the paragraph at it
// and discards it) — that is why it stays identical to the PT pack,
// untranslated.

const R = 'Quem escreveu isso:';

// The fixed phrase for a modern practice with no ancient source — always
// this one, never softened variations.
const SFA = 'a contemporary popular practice, with no ancient source located';

export default {
  semFonteAntiga: SFA,

  // -------------------------------------------------------------------------
  // 1. THE FOUR MOONS
  // -------------------------------------------------------------------------
  marcosLunares: {
    luaNova: {
      titulo: 'New Moon',
      paragrafo:
        'The Moon has vanished from the sky — and it vanished because it sits on the same side as the Sun, with its lit half facing away from us. This is the zero point of the cycle: from here the light starts growing again, for about 29 and a half days, until it all starts over. And it is not a stretch of days: it is one instant, the minute when Sun and Moon reach the same longitude as seen from Earth. ' +
        R +
        ' Claudius Ptolemy — Tetrabiblos I.8 (2nd century AD) counts the four stretches of the lunar month from this point. And the month counted day by day, 1st through 30th, is already in Hesiod, Works and Days, vv. 765-828 (7th century BC): starting the month here is one of the genuinely ancient customs.',
      fonte: 'Claudius Ptolemy, Tetrabiblos I.8 — 2nd century AD; Hesiod, Works and Days vv. 765-828 — 7th century BC',
      tradicao: {
        texto:
          'Roman farmers planted fig, apple, olive, pear and vine at the New Moon, the one when the Moon disappears from the sky — the Romans called it the silent moon, the interlunar days — and always in the afternoon.',
        obra: 'De Agri Cultura 40.1',
        autor: 'Cato the Elder',
        seculo: '2nd century BC',
      },
      avisoDeIdade:
        'Reading the New Moon as the time to "plant an intention" is ' +
        SFA +
        '. What is genuinely old is the marker: the month began here.',
    },
    quartoCrescente: {
      titulo: 'First Quarter',
      paragrafo:
        'Half the disk lit, half the disk dark, with a straight cut down the middle: that is what shows when the Moon sits 90° from the Sun, at a right angle seen from Earth. From here to the full, the light only grows. ' +
        R +
        ' Claudius Ptolemy, Tetrabiblos I.8 (2nd century AD) — and worth knowing: the ancient division is that one, of FOUR quarters. The eight named phases with a personality reading are far newer: Dane Rudhyar, The Lunation Cycle, 1967.',
      fonte: 'Claudius Ptolemy, Tetrabiblos I.8 — 2nd century AD',
      tradicao: {
        texto:
          'Ptolemy described the four stretches of the lunar month as qualities of air and matter: from new to first quarter, more productive of moisture; from first quarter to full, of heat; from full to last quarter, of dryness; from last quarter to the vanishing, of cold. It was a description of weather, not of people.',
        obra: 'Tetrabiblos I.8',
        autor: 'Claudius Ptolemy',
        seculo: '2nd century AD',
      },
      avisoDeIdade:
        'The eight-phase frame with psychological meaning comes from Dane Rudhyar (The Lunation Cycle, 1967). Calling the eight a "millennia-old tradition" credits it with an age it does not have.',
    },
    luaCheia: {
      titulo: 'Full Moon',
      paragrafo:
        'The Moon shows up fully lit and rises at about the hour the Sun sets. It sits on the opposite side from the Sun, with Earth in the middle, which is why we see its whole face illuminated. This too is an instant, not a season — the four or five days when it "looks full" are a limit of the eye: the math marks a single minute. ' +
        R +
        ' Claudius Ptolemy — Tetrabiblos I.8 (2nd century AD) marks here the middle of the cycle, between the two quarters.',
      fonte: 'Claudius Ptolemy, Tetrabiblos I.8 — 2nd century AD',
      tradicao: {
        texto:
          'Columella had beans sown on the eve of the full moon or on the day itself. And, contrary to this phase\'s reputation, this was not when harvesting-to-store happened: Pliny the Elder recorded that everything cut, gathered and sheared took less damage under a waning moon.',
        obra: 'De Re Rustica XI.2.85 and Naturalis Historia XVIII.321',
        autor: 'Columella and Pliny the Elder',
        seculo: '1st century AD',
      },
      avisoDeIdade:
        'The "harvest phase" reputation inverts the Roman source: harvesting to store belonged to the waning moon (Pliny, Naturalis Historia XVIII.321, 1st century AD).',
    },
    quartoMinguante: {
      titulo: 'Last Quarter',
      paragrafo:
        'Half the disk lit again, now on the other side. The Moon is back at 90° from the Sun, but on the way down: the light will keep shrinking until it disappears altogether. ' +
        R +
        ' Claudius Ptolemy, Tetrabiblos I.8 (2nd century AD), the same chapter that splits the lunar month into four, not eight.',
      fonte: 'Claudius Ptolemy, Tetrabiblos I.8 — 2nd century AD',
      tradicao: {
        texto:
          'This is the stretch of the month that shows up most in ancient farm writing. It was under the waning moon that wood got cut, crops got gathered for drying, sheep got sheared, weeding and manuring got done — everything meant to shrink rather than grow.',
        obra: 'Naturalis Historia XVIII.321-322, De Re Rustica XI.2.11 and De Agri Cultura 31.2',
        autor: 'Pliny the Elder, Columella and Cato the Elder',
        seculo: '2nd century BC to 1st century AD',
      },
      avisoDeIdade: null,
    },
  },

  // -------------------------------------------------------------------------
  // 2. THE SUN CHANGING SIGN
  // -------------------------------------------------------------------------
  ingresso: {
    titulo: 'Sun enters {signo}',
    abertura:
      'The Sun changes sign: it leaves {anterior} and enters {novo}. ' +
      'And the date shifts from year to year, because this is not a slot on the calendar — it is an astronomical instant, ' +
      'the minute the Sun finishes another 30° of its path around the zodiac circle. ' +
      'Another thing that trips a lot of people up: the sign is not the constellation sitting behind it. ' +
      'It is the slice of sky counted from the March equinox — the instant when day and night ' +
      'come out even and the sky\'s year starts over{complemento}. ',
    complementoAries: ', and this ingress is exactly that — the Sun returns to the zero degree everything is counted from',
    complementoCardinal: ', and this ingress is exactly {evento} — {explica}',
    recibo:
      R +
      ' Claudius Ptolemy, Tetrabiblos I.22 (2nd century AD): the beginnings of the signs are taken from the equinoxes and solstices, "and from no other source".',
    fonte: 'Claudius Ptolemy, Tetrabiblos I.22 — 2nd century AD',
    tradicaoTexto:
      'For Ptolemy this was no calendar coincidence: his zodiac is the solar year split into twelve, and {evento} is one of the four points the count starts from. He picked that reference frame on purpose and explained why.',
    tradicaoObra: 'Tetrabiblos I.22',
    tradicaoAutor: 'Claudius Ptolemy',
    tradicaoSeculo: '2nd century AD',
    avisoDeIdade:
      '"Ophiuchus, the 13th sign they are hiding" mixes up sign and constellation. The constellation boundaries astronomy uses date from 1930 (International Astronomical Union), and the twelve-equal-parts zodiac is far older than that.',
    cardinais: {
      'Áries': { evento: 'the March equinox', explica: 'the instant when day and night run almost the same length the world over' },
      'Câncer': { evento: 'the June solstice', explica: 'the instant the Sun reaches its northernmost point of the year, which makes the longest day in the northern hemisphere and the shortest in the southern' },
      'Libra': { evento: 'the September equinox', explica: 'the other instant of the year when day and night nearly come out even' },
      'Capricórnio': { evento: 'the December solstice', explica: 'the instant the Sun reaches its southernmost point of the year, which makes the shortest day in the northern hemisphere and the longest in the southern' },
    },
  },

  // -------------------------------------------------------------------------
  // 3. MERCURY RETROGRADE
  // -------------------------------------------------------------------------
  retro: {
    inicio: {
      titulo: 'Mercury goes retrograde',
      paragrafo:
        'Mercury seems to move backward across the sky — and "seems" is the right word, because it is an illusion of perspective. ' +
        'Earth is overtaking Mercury on the outside of the curve, and the planet appears to slip backward against the backdrop of stars, ' +
        'the same way the car in the next lane seems to roll backward as yours moves past. Nothing brakes and nothing actually reverses. ' +
        'It happens three or four times a year, lasts about three weeks, and there is nothing rare about it: measured against the ephemeris ' +
        '— the planetary position tables astronomers and astrologers use alike —, ' +
        'some planet is retrograde in the sky on 86% of all days. ' +
        R +
        ' Vettius Valens, Anthologiae V (2nd century AD). And what he says is one thing only: delay — retrograde planets ' +
        '"delay expectations, actions, profits, and enterprises".',
      fonte: 'Vettius Valens, Anthologiae V — 2nd century AD',
      tradicao: {
        texto:
          'Ptolemy did not even class retrogradation as good or bad: to him it was a thermal phase of the planet\'s cycle — from the first station (the day the planet seems to stand still before backing up) to the acronychal rising (when the planet comes up in the east right as the Sun sets), heat; from the acronychal rising to the second station, dryness.',
        obra: 'Tetrabiblos I.8',
        autor: 'Claudius Ptolemy',
        seculo: '2nd century AD',
      },
      avisoDeIdade:
        '"Mercury retrograde breaks gadgets, kills contracts and brings the ex back" appears in no ancient source: it is 20th- and 21st-century folklore. The first mention of "Mercury retrograde" in the New York Times is usually said to be from 1996 — that is reported by secondary outlets and has not been checked against the paper\'s archive, so it stays secondhand news. Valens also never singles out Mercury: his rule applies equally to Mars, Jupiter and Saturn.',
    },
    fim: {
      titulo: 'Last day of Mercury retrograde',
      paragrafo:
        'Mercury stops and starts moving forward again against the backdrop of stars. This is the so-called second station — the day ' +
        'the planet seems to stand still before picking its course back up —, and from the next day on the apparent motion is direct again. ' +
        R +
        ' Vettius Valens, Anthologiae V (2nd century AD) — and Valens also recorded the other half, the part the internet tends to crop out: ' +
        'past the second station, planets "cancel any delay and reinstate the same activities".',
      fonte: 'Vettius Valens, Anthologiae V — 2nd century AD',
      tradicao: {
        texto:
          'Lilly classed retrogradation as an accidental debility — on his scale, a planet in a weak position, not a bad planet —, the mark of a matter running backward and slow to settle, never of catastrophe.',
        obra: 'Christian Astrology',
        autor: 'William Lilly',
        seculo: '17th century (1647/1659)',
      },
      avisoDeIdade:
        'The honest summary of the tradition on retrogradation fits in three words: delays, revisits, contradicts. Nothing beyond that sits in any ancient source.',
    },
  },

  // -------------------------------------------------------------------------
  // 4. EXACT ASPECT BETWEEN THE PERSONAL PLANETS
  // -------------------------------------------------------------------------
  aspecto: {
    titulo: '{planetA} and {planetB} in {exato} {aspecto}',
    aberturaConjuncao:
      '{planetA} and {planetB} sit today at the same point of the zodiac circle, seen from Earth — that is what "conjunction" means: {glosa}. An angle is an angle, it can be checked in any planetary position table, and the meeting has a set time. ',
    aberturaOutros:
      'Seen from Earth, {planetA} and {planetB} sit today at exactly {grau}° from each other on the zodiac circle — that is what "{aspecto}" means: {glosa}. An angle is an angle: it can be checked in any planetary position table, and the instant has a set time. ',
    reciboConjuncao:
      R +
      ' Claudius Ptolemy, Tetrabiblos I.13 and I.24 (2nd century AD) — and here is a detail almost every app gets wrong: in Ptolemy the conjunction is NOT an aspect. His aspects are four (opposition 180°, trine 120°, square 90°, sextile 60°), and the conjunction shows up in I.24 as "bodily application", a category of its own.',
    reciboOutros:
      R +
      ' Claudius Ptolemy — Tetrabiblos I.13 (2nd century AD) recognizes four aspects and four only (opposition 180°, trine 120°, square 90° and sextile 60°), and draws those angles from musical ratios applied to the semicircle.',
    fonteConjuncao: 'Claudius Ptolemy, Tetrabiblos I.13 and I.24 — 2nd century AD',
    fonteOutros: 'Claudius Ptolemy, Tetrabiblos I.13 — 2nd century AD',
    tradicao: {
      texto:
        'Ptolemy called the trine and the sextile harmonious, and the square and the opposition disharmonious. The reason he gave was the gender of the signs: the harmonious ones would join signs of the same gender, and the disharmonious ones, signs of opposite genders. The math works out for the square and fails for the opposition, because six signs apart the gender is always the same. The hole is his, and recording it is worth more than repeating the line as if it held up.',
      obra: 'Tetrabiblos I.12-I.13',
      autor: 'Claudius Ptolemy',
      seculo: '2nd century AD',
    },
    avisoDeIdade:
      'The tolerance degrees ("orb") used to find the aspect — 8° for conjunction, opposition, square and trine, 6° for sextile — are a modern software convention: there is no table of orbs in degrees in the Tetrabiblos. Here they only serve to locate the pair; the published time is that of the exact angle.',
    nomes: {
      'Conjunção': 'Conjunction',
      'Sextil': 'Sextile',
      'Quadratura': 'Square',
      'Trígono': 'Trine',
      'Oposição': 'Opposition',
    },
    glosa: {
      'Conjunção': 'the same degree, one behind the other along our line of sight',
      'Sextil': 'a sixth of the circle between the two',
      'Quadratura': 'a quarter of the circle between the two',
      'Trígono': 'a third of the circle between the two',
      'Oposição': 'half the circle between the two, one on each side',
    },
    exato: {
      'Conjunção': 'exact',
      'Sextil': 'exact',
      'Quadratura': 'exact',
      'Trígono': 'exact',
      'Oposição': 'exact',
    },
  },

  // -------------------------------------------------------------------------
  // 5. THE EIGHT MOON PHASES
  // -------------------------------------------------------------------------
  // The historical correction must survive with the same clarity as in PT:
  // harvesting to store belongs to the WANING moon (Pliny, Naturalis Historia
  // XVIII.321); the full, in Columella XI.2.85, is the day for SOWING beans.
  fases: {
    luaNova: {
      nome: 'New Moon',
      reflexao:
        'Dark sky, month beginning: the New Moon is the cycle\'s zero point. What remains is the symbolic invitation to pause before acting — worth jotting down what you want to see begin this cycle. And the receipt is honest: opening the month at the New Moon is a genuinely millennia-old custom, from every ancient lunisolar calendar (the kind that counts months by the Moon); reading it as the time to "plant an intention", though, is a contemporary reading, not an ancient one.',
    },
    luaCrescente: {
      nome: 'Waxing Crescent',
      reflexao:
        'The light is growing, and the reading here is one of building: taking the first steps in what began at the New Moon. It is a symbolic reminder to keep the rhythm — small actions count for more than big decisions right now. Receipt: that reading is contemporary, not ancient — the eight-phase frame dates from 1967 (Dane Rudhyar, "The Lunation Cycle").',
    },
    quartoCrescente: {
      nome: 'First Quarter',
      reflexao:
        'Half the light, the cycle\'s first crossroads: the symbolic invitation is to review the plan — worth asking what needs more focus this week. Course correction and creative tension are a contemporary reading, let that be said. But the marker itself is genuinely ancient division: Ptolemy splits the cycle in four (Tetrabiblos I.8), and this is one of the four.',
    },
    gibosaCrescente: {
      nome: 'Waxing Gibbous',
      reflexao:
        'Almost full (that is what "gibbous" means: more than half the Moon already lit), the hour is for refining details. What remains is the symbolic invitation to patience with what is already underway — adjusting is different from starting over. Honest receipt: that reading is contemporary, not ancient inheritance; the gibbous is not even a named phase outside the eight-phase frame, which dates from 1967.',
    },
    luaCheia: {
      nome: 'Full Moon',
      reflexao:
        'The Moon is at the cycle\'s peak of light — that is astronomy — and the symbolic invitation is to see clearly: to notice what had already been taking shape. Everyone repeats that the Full Moon is harvest day, but the Roman source says the opposite. Columella puts the day for SOWING beans at the full (XI.2.85). Harvesting and storing belongs to the waning moon — it is Pliny who reserves it for that (Naturalis Historia XVIII.321). In other words: the harvest-phase reputation inverts the source.',
    },
    gibosaMinguante: {
      nome: 'Waning Gibbous',
      reflexao:
        'The light has started to give, and this was when Roman farms harvested for storage. Gratitude and sharing are the contemporary layer on top of that — a symbolic invitation to look back with a lighter hand. A good moment to pass along something you learned. The receipt for the old part: Pliny records that what gets cut, gathered and sheared takes less damage under a shrinking moon (Naturalis Historia XVIII.321).',
    },
    quartoMinguante: {
      nome: 'Last Quarter',
      reflexao:
        'Half the light, now falling: it is time for taking out, not putting in. Letting go of what no longer serves is the symbolic invitation — an emotional clean-out; carrying it inward is contemporary, let that be said. Worth asking yourself what can already stay behind. And the receipt is among the best: of the eight labels, this is one of the two with the best ancient backing — Pliny assigns to the waning moon whatever is cutting, gathering, shearing, weeding (Naturalis Historia XVIII.321–322).',
    },
    luaMinguante: {
      nome: 'Waning Crescent',
      reflexao:
        'The Moon is fading from the sky: these are the last days before it meets the Sun (the conjunction) and the cycle starts again. Rest and drawing inward are the contemporary reading of that emptying-out — a symbolic invitation to slow down. A good moment for silence and personal stock-taking. Receipt: for the Roman old moon, this end of the month remained the one for taking out, not putting in (Pliny, Naturalis Historia XVIII.321–322).',
    },
  },

  // -------------------------------------------------------------------------
  // NAMES — keys are the canonical names from lib/signs.js (never change).
  // -------------------------------------------------------------------------
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
  planetas: {
    'Sol': 'Sun',
    'Mercúrio': 'Mercury',
    'Vênus': 'Venus',
    'Marte': 'Mars',
  },
};
