// lib/traducoes/quiz.en.js
// ENGLISH PACK (natural American-app English) for the "Did you know?" quiz —
// exactly the same shape as the derived pt pack from packDeTextos() in
// lib/quizCosmico.js, key by key. The engine stays canonical in PT; this file
// carries ONLY the text a person reads.
//
// ===========================================================================
// WHAT THIS FILE MUST NEVER CHANGE (it is structure, not text)
// ===========================================================================
// The ORDER of the four options and `certaIdx` live in the engine and are the
// SAME in all three languages: `opcoes[2]` here is the translation of
// `opcoes[2]` there, always. Swapping two options around in this file would
// make the right answer point at a different alternative — the most expensive
// bug this workstream can ship, and test/quizIdiomas.test.js checks it index by
// index. Also not here: id, tema, base, and the deterministic daily round (same
// day = same 7 questions in any language).
//
// ===========================================================================
// TRANSLATION RULES (cousins of the ones in lib/quizCosmico.js)
// ===========================================================================
// (1) HOOK FIRST, RECEIPT AFTER — the explanation opens in plain conversation;
//     the receipt lives in `fonte`. No abbreviated century and no four-digit
//     year in the first 40 characters.
// (2) NEVER TRANSLATED: the locus (Tetrabiblos I.8, XVIII.321, De Agri Cultura
//     40.1), work titles in Latin, English or French (Naturalis Historia, The
//     Pictorial Key to the Tarot, Le Monde primitif, Sky & Telescope...),
//     numbers, dates, and Waite's verbatim quote ("Loss, theft, privation,
//     abandonment"). Established names DO translate: Ptolomeu → Ptolemy,
//     Plínio, o Velho → Pliny the Elder, Catão → Cato, Columela → Columella,
//     Dião Cássio → Cassius Dio, Vétio Valente → Vettius Valens, Manílio →
//     Manilius. Titles PT itself rendered from Greek/Latin follow suit: Contra
//     os Astrólogos → Against the Astrologers, Antologias → Anthologies,
//     História Romana → Roman History.
// (3) DECIMAL SEPARATOR: English flips the Portuguese convention (85,9% →
//     85.9% · 4.000 anos → 4,000 years). The VALUE never changes — the test
//     normalizes separators and compares the whole set of numbers against PT.
//     Ordinal centuries ("2nd c.") are the only new digits allowed.
// (4) RED LINE IN ENGLISH: no relieve/soothe/calm/heal/cure/treat/energize, no
//     promise (guarantee/attract/protect/manifest), no verdict about the
//     person, no invented social proof ("millions of users", "science says").
//     Not even in a WRONG option — a wrong option that promises is still a
//     promise on screen.
// (5) THE QUIZ NEVER SHAMES A WRONG ANSWER: the explanation tells the story, it
//     does not correct the person. The score lines talk about the CONTENT, and
//     none of them invents a badge (the Journey owns the app's only badges).
// (6) AMERICAN APP ENGLISH: contractions where a person would use them, short
//     sentences, no British spelling, no academic register. Terminology
//     inherited from lib/i18n.js (en).
export default {
  // The screen chrome — same keys as CHROME_TELA in the engine, same function
  // signatures.
  tela: {
    titulo: 'Did you know?',
    subtitulo: 'Seven questions a day — the myth falls, the source stays',
    contador: (n, total) => `Question ${n} of ${total}`,
    certo: 'Right on the source!',
    errado: 'Not this time — the right one is marked.',
    fontePrefixo: 'Source: ',
    proxima: 'Next question',
    verPlacar: 'See your score',
    placarTitulo: 'Today\'s round',
    placarDe: (acertos, total) => `${acertos} of ${total}`,
    acumulado: (respondidas, acertos) =>
      `In total you\'ve answered ${respondidas} question${respondidas === 1 ? '' : 's'} — ${acertos} on the right source.`,
    amanha: 'Tomorrow brings seven new ones. The round changes with the day — and it\'s the same for everyone, so you can compare.',
    rodadaFeitaAviso: 'You already played today\'s round.',
    a11yOpcao: (n) => `Option ${n}`,
  },

  temas: {
    taro: 'Tarot',
    lua: 'Moon',
    historia: 'History',
  },

  // Same order as FAIXAS_PLACAR: from the clean round down to the blank one.
  placar: [
    'Clean round: seven out of seven on the right source. Those are exactly the stories that circulate wrong out there — and you just checked every one of them against the receipt.',
    'Almost all of it on the right source. The ones that got away came with the explanation and the receipt right above — and tomorrow there are seven more.',
    'Half and half — and that adds up: a good part of these stories has been circulating wrong for decades, with a date and an author for the mistake. Now you know where to check.',
    'The "obvious" answers in this quiz are exactly the ones the market repeats with no source. Every explanation above tells the real story, with an author and a date — and tomorrow there\'s a rematch.',
  ],

  perguntas: {
    // ======================= TAROT =======================
    'taro-leitura-nascimento': {
      pergunta: 'When was tarot born as a way to read the future?',
      opcoes: [
        'In ancient Egypt, with the Book of Thoth',
        'In 15th-century Italy, along with the cards',
        'In the 18th century — before that, tarot was just a card game',
        'In classical Greece, in the oracle temples',
      ],
      explicacao:
        'The deck has been around since 15th-century Italy — but it spent some 350 years as a gambling and parlor game, and it\'s still played today in France and Austria. The oldest documented reading is a Bolognese sheet from before 1750, and the first published method is Etteilla\'s, in 1783. Honest summary: six centuries of imagery, two and a half centuries of reading.',
      fonte: 'Bolognese sheet (before 1750), found by Franco Pratesi · Etteilla, first published method, 1783',
    },
    'taro-egito-autor': {
      pergunta: 'Who invented the story that tarot comes from Egypt?',
      opcoes: [
        'Egyptian priests, in temple papyri',
        'Antoine Court de Gébelin, in a book from 1781',
        'The first Italian card makers',
        'Aleister Crowley, in 1944',
      ],
      explicacao:
        'Court de Gébelin saw a game of tarot at a Paris social gathering, thought he recognized Egyptian symbols and published that it was the Book of Thoth — without producing a single document. The detail that brings it all down: he wrote that in 1781, and nobody in the world could read Egyptian before Champollion cracked the hieroglyphs, in 1822.',
      fonte: 'Antoine Court de Gébelin, Le Monde primitif, vol. 8, "Du Jeu des Tarots", 1781',
    },
    'taro-waite-refuta': {
      pergunta: 'What did Waite — author of the best-selling deck in the world — write in 1911 about tarot\'s Egyptian origin?',
      opcoes: [
        'That there isn\'t "a particle of evidence" for it',
        'That it was the deck\'s greatest secret',
        'That only initiates could confirm it',
        'That the pharaohs left it carved in the temples',
      ],
      explicacao:
        'Waite gives a whole section of the Pictorial Key to taking Court de Gébelin apart: he calls his ten arguments "pillars of sand" and points out that the Egyptian etymology was proposed when nobody could read Egyptian. Saying tarot doesn\'t come from Egypt puts you on the side of the deck\'s own author — not against him.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, Part I §4, 1911',
    },
    'taro-quem-desenhou': {
      pergunta: 'Who drew the 78 cards of the famous "Waite deck", released in December 1909?',
      opcoes: [
        'A. E. Waite himself',
        'Éliphas Lévi',
        'An anonymous London print shop',
        'The artist Pamela Colman Smith',
      ],
      explicacao:
        'Waite commissioned and directed it, but the one who drew card by card was Pamela Colman Smith — which is why the fair name is Rider-Waite-Smith. For the 56 minor cards, Smith leaned on the Sola Busca, an Italian deck from around 1491 whose photographs had just landed at the British Museum, in 1907.',
      fonte: 'Waite-Smith deck, Dec/1909 · A. E. Waite, The Pictorial Key to the Tarot, 1911',
    },
    'taro-estrela': {
      pergunta: 'In Waite\'s list of meanings (1911), the Star card means, first of all...',
      opcoes: [
        'Hope and a bright future',
        'A long voyage by sea',
        'Loss, theft, privation, abandonment',
        'A reunion with an old love',
      ],
      explicacao:
        'It\'s the most jarring entry on the list: Waite writes "Loss, theft, privation, abandonment" — and only then notes that "another reading says: hope and bright prospects". Modern reading flipped the priority by following Smith\'s picture, not Waite\'s text: the two halves of the deck never told the same story.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911 — card XVII, The Star',
    },
    'taro-morte': {
      pergunta: 'And the Death card, on that same Waite list (1911), means...',
      opcoes: [
        'It never means death, only a fresh start',
        '"End, mortality, destruction"',
        'An unexpected inheritance',
        'A wedding coming up',
      ],
      explicacao:
        'The "transformation" reading is an ethical choice of the twentieth century — a legitimate one, and the one this app uses — but it wasn\'t there at the start: Waite writes "End, mortality, destruction, corruption". Knowing what the author wrote and what practice chose later is half the battle when it comes to reading tarot without repeating legends.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911 — card XIII',
    },
    'taro-cruz-celta': {
      pergunta: 'Is the "Celtic Cross" spread actually Celtic?',
      opcoes: [
        'Yes — it comes from the druids of Ireland',
        'Yes — it shows up in medieval manuscripts',
        'No — it\'s Egyptian, despite the name',
        'No — the name is Waite\'s, from 1911',
      ],
      explicacao:
        'The name shows up for the first time in Waite\'s book, which only says the method "has been long used in private". The structure comes out of the Golden Dawn circles of the 1890s — no Celtic attestation, no druid anywhere in the process.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, Part III §7, 1911',
    },
    'taro-tres-cartas': {
      pergunta: 'Where does the three-card Past / Present / Future spread come from?',
      opcoes: [
        'Nobody has found a primary source — it caught on in the twentieth century',
        'From Waite\'s Pictorial Key',
        'From the Golden Dawn',
        'From the temples of Egypt',
      ],
      explicacao:
        'Waite gives three methods in the book — of 10, 42 and 35 cards — and none of them is a three-card timeline; the Golden Dawn used a different spread, the Opening of the Key, an operation that takes hours. The three-card spread is legitimate as practice — you just can\'t call it "the classic one", because nobody has found the text that founds it.',
      fonte: 'Checked in A. E. Waite, The Pictorial Key to the Tarot, 1911 — the spread is not there',
    },
    'taro-invertidas': {
      pergunta: 'Who was the first to publish reversed-card meanings, one for every card?',
      opcoes: [
        'The Marseille card makers',
        'Waite, in 1911',
        'Etteilla, starting in 1770',
        'A thousand-year-old oral tradition, with no written record',
      ],
      explicacao:
        'Etteilla set up systematic reversed meanings — every reversed reading in the world descends from him. And there\'s a surprise in Waite: there, the reversal is usually a sideways sense, sometimes better than the upright one — the Wheel of Fortune upside down becomes "increase, abundance".',
      fonte: 'Etteilla, first cartomancy manual with reversals, 1770 · Waite, 1911',
    },
    'taro-78-cartas': {
      pergunta: 'Does every tarot deck have 78 cards?',
      opcoes: [
        'Yes — the number was fixed from the start',
        'No — the Minchiate of Florence has 97; the Bolognese, 62',
        'Yes — 78 is the sum of the Hebrew letters',
        'No — the number changes every century',
      ],
      explicacao:
        'The 78 is the pattern that won, not a law: the Florentine Minchiate has 97 cards, the Tarocco Bolognese has 62 and the Sicilian one, 64. It also takes down the numerology of "22 cards = 22 Hebrew letters" — historical patterns don\'t always have 22 trumps.',
      fonte: 'Historical Italian patterns (Minchiate, Bolognese, Siciliano) — Dummett, The Game of Tarot, 1980',
    },
    'taro-marselha': {
      pergunta: 'Is the "Tarot de Marseille" the oldest tarot there is?',
      opcoes: [
        'No — the oldest ones are Italian, hand-painted in the fifteenth century',
        'Yes — it was designed in Marseille in the twelfth century',
        'Yes — it arrived on Phoenician ships',
        'No — it\'s a copy of the Waite deck',
      ],
      explicacao:
        'The oldest surviving tarots are the hand-painted Italian ones, like the Visconti-Sforza decks from the middle of the fifteenth century. The "Marseille" pattern is later French printing (Noblet c. 1650, Conver 1760) — and the trade name "Ancien Tarot de Marseille" was made popular by Paul Marteau, of the Grimaud house, in 1930.',
      fonte: 'Paul Marteau / Grimaud, Ancien Tarot de Marseille, 1930',
    },

    // ======================= MOON =======================
    'lua-superlua': {
      pergunta: 'Who coined the word "Supermoon"?',
      opcoes: [
        'NASA, in the Apollo era',
        'Galileo, when he pointed his telescope up',
        'The colonial American almanacs',
        'The astrologer Richard Nolle, in a magazine in 1979',
      ],
      explicacao:
        '"Supermoon" sounds like an observatory term, but it was born in a horoscope magazine: Richard Nolle coined the name in Dell Horoscope in 1979, and the press only picked it up in bulk in 2011. The technical name is perigee syzygy — and the size difference, real as it is (~14%), goes unnoticed by the naked eye without a side-by-side photo.',
      fonte: 'Richard Nolle, Dell Horoscope magazine, 1979',
    },
    'lua-cheia-lavoura': {
      pergunta: 'In Roman farming, the Full Moon was the time for what?',
      opcoes: [
        'Harvesting everything that was ripe',
        'Sowing broad beans',
        'Cutting timber',
        'Shearing the sheep',
      ],
      explicacao:
        'It\'s the opposite of what gets repeated everywhere: harvesting, cutting and shearing were waning-moon work — Pliny notes that this way the plant "suffers less damage". At the full moon, Columella called for sowing beans. The farm rule went: waxing to put in, waning to take out — and beans on the eve of the full moon was Columella\'s specific instruction.',
      fonte: 'Columella, De Re Rustica XI.2.85, 1st c. · Pliny the Elder, Naturalis Historia XVIII.321, 1st c.',
    },
    'lua-nomes-almanaque': {
      pergunta: '"Wolf Moon", "Strawberry Moon", "Snow Moon" — where do those names come from?',
      opcoes: [
        'From the Indigenous peoples of the Amazon',
        'From Greek mythology',
        'From U.S. farm almanacs, in the 1930s',
        'From the Celtic druids',
      ],
      explicacao:
        'The standard list came out of an American farm almanac: the Maine Farmers\' Almanac published the names in the 1930s, and the Old Farmer\'s Almanac trimmed it to one name per month. It\'s a mix of Algonquian, English and Celtic sources sold as a single system — and it describes the farming year of the U.S. Northeast: below the equator, "Snow Moon" in February lands in the middle of summer.',
      fonte: 'Maine Farmers\' Almanac, 1930s · first printed list: Daniel Carter Beard, 1918',
    },
    'lua-rosa': {
      pergunta: 'In April, does the "Pink Moon" actually turn pink?',
      opcoes: [
        'No — the name comes from a flower',
        'Yes — because of pollen in the atmosphere',
        'Yes — in eclipse years',
        'No — the name comes from a singer',
      ],
      explicacao:
        'The flower is Phlox subulata, the moss pink that carpets the ground in early spring in eastern North America. The Moon stays the color it always is — the name describes the flower calendar of that one region, not the sky above you.',
      fonte: 'Standard list of the Old Farmer\'s Almanac, 20th c.',
    },
    'lua-azul': {
      pergunta: '"A Blue Moon is the second full moon in a month." That definition was born as...',
      opcoes: [
        'Medieval English folklore',
        'A misreading in a magazine, in 1946',
        'The official calculation of the observatories',
        'A tradition of Portuguese navigators',
      ],
      explicacao:
        'James Hugh Pruett misread an article in the Maine Farmers\' Almanac — which used "Blue Moon" for the third full moon in a season with four — and published the "second in the month" version in Sky & Telescope in 1946. NPR repeated it in 1980, Trivial Pursuit set it in stone in 1986, and the magazine itself ran the correction in 1999. Neither definition is old.',
      fonte: 'Olson, Fienberg & Sinnott, "What\'s a Blue Moon?", Sky & Telescope, May/1999',
    },
    'lua-oito-fases': {
      pergunta: 'The eight moon phases with personality readings date from when?',
      opcoes: [
        'From Babylon',
        'From Rome',
        'From 1967 — Dane Rudhyar',
        'From the Greece of Hesiod',
      ],
      explicacao:
        'The old division that has a source behind it is into four quarters, with weather qualities — moist, hot, dry, cold — in Ptolemy. The eight named phases with psychological readings are Dane Rudhyar\'s: set out in The Lunation Cycle (1967), on an idea he\'d been developing since the 1930-40s. And "gibbous" is just Latin for "humpbacked": it describes the shape, it carries no doctrine.',
      fonte: 'Ptolemy, Tetrabiblos I.8, 2nd c. · Dane Rudhyar, The Lunation Cycle, 1967',
    },
    'lua-minguante': {
      pergunta: 'What did Roman farming save for the waning Moon?',
      opcoes: [
        'Sowing everything',
        'Weddings and baptisms',
        'Nothing — it was the resting phase',
        'Cutting, harvesting and shearing',
      ],
      explicacao:
        'Everything you cut, harvest or shear takes less damage under a waning moon — that\'s how Pliny sums up the rule, and Cato and Columella send weeding, manuring and timber cutting to the waning moon as well. Whatever was supposed to dry out or shrink went to that phase: it\'s the lunar rule with the most primary sources behind it.',
      fonte: 'Pliny the Elder, Naturalis Historia XVIII.321-322, 1st c. · Cato, De Agri Cultura 29 and 31.2, 2nd c. BC',
    },
    'lua-catao-plantio': {
      pergunta: 'Cato, in the second century BC, said to plant fig and grapevine at which moment of the Moon?',
      opcoes: [
        'At the full moon, at midnight',
        'At the "silent moon" (dark), in the afternoon',
        'At the first quarter, at dawn',
        'On any even-numbered day',
      ],
      explicacao:
        '"Luna silente" — the silent moon, when it disappears from the sky. It\'s the Roman farming record of the idea of starting in the dark: the seed goes into the ground while the Moon is still out of sight, and grows along with it. Two thousand years later that turned into a "New Moon ritual" — the root is a farm instruction.',
      fonte: 'Cato the Elder, De Agri Cultura 40.1, 2nd c. BC',
    },
    'lua-sangue': {
      pergunta: 'How long has "Blood Moon" been a name for an eclipse?',
      opcoes: [
        'Since the Bible',
        'Since ancient Rome',
        'Since 2008',
        'Since the Middle Ages',
      ],
      explicacao:
        'The image is biblical — "the moon shall be turned into blood", in the book of Joel — but the term as the name of an event comes from pastor Mark Biltz, in 2008, and went global with John Hagee\'s book Four Blood Moons. Astronomers don\'t use it. And the prophecy about the 2014-15 tetrad didn\'t come true.',
      fonte: 'Joel 2:31 (the image) · Mark Biltz, 2008, and John Hagee, Four Blood Moons, 2013 (the term)',
    },
    'lua-intencoes': {
      pergunta: '"Writing intentions at the New Moon", the way it\'s done today, was popularized by...',
      opcoes: [
        'Jan Spiller, in a book from 2001',
        'Cleopatra',
        'The copyist monks',
        'Nostradamus',
      ],
      explicacao:
        'Actually planting at the dark moon is Roman primary source — Cato and Palladius call for it. Swapping the seed for a written intention is a recent transposition, made popular by Jan Spiller in New Moon Astrology. The gesture of starting in the dark is old; the wish list is from the day before yesterday.',
      fonte: 'Cato, De Agri Cultura 40.1, 2nd c. BC (the planting) · Jan Spiller, New Moon Astrology, 2001 (the intention)',
    },
    'lua-eclipse-pais': {
      pergunta: 'For Ptolemy, in the second century, an eclipse was about whom?',
      opcoes: [
        'Whoever was born that day',
        'Countries, cities and kings',
        'Each person, according to their sign',
        'Nobody — he never wrote about eclipses',
      ],
      explicacao:
        'In the source, an eclipse is a world-map matter: Ptolemy gives six chapters of the Tetrabiblos to predicting effects on regions and rulers — he even works out how long they last by the hours of darkness. "Your eclipse season is going to flip your life" doesn\'t come from there: applying it to one person is modern.',
      fonte: 'Ptolemy, Tetrabiblos II.4-II.9, 2nd c.',
    },
    'lua-tempo-signo': {
      pergunta: 'How long does the Moon stay in each sign?',
      opcoes: [
        'Exactly 2 and a half days',
        'A week',
        'On average ~2.28 days — and it varies',
        'A month',
      ],
      explicacao:
        'The famous "2 and a half days" is a rounding: the real average is ~2.28 days (2d 6h40m), ranging from ~1.95 to ~2.55 depending on the Moon\'s speed, which changes over the month. It sounds like a detail — but it\'s the difference between a memorized table and a calculated sky, which is this app\'s number one fight.',
      fonte: 'Astronomical measurement: a sidereal month of 27.32 days divided by the 12 signs',
    },
    'lua-colheita-hemisferio': {
      pergunta: 'Does September\'s "Harvest Moon" work everywhere on Earth?',
      opcoes: [
        'It does — the name is universal',
        'It does, but only in the northern half of the country',
        'No — below the equator the phenomenon doesn\'t exist',
        'No — south of the equator the equivalent falls in March',
      ],
      explicacao:
        'The phenomenon is real: near the autumn equinox, the full Moon rises at nearly the same time for several nights in a row. It just happens that autumn south of the equator starts in March — September as "harvest month" is the calendar of the U.S. Northeast; below the equator it\'s spring.',
      fonte: 'Measurable astronomical phenomenon · English name attested since 1706 (Merriam-Webster)',
    },
    'lua-saros': {
      pergunta: 'Where did "Saros", the name of the eclipse cycle, come from?',
      opcoes: [
        'It\'s the Babylonian word for "eclipse"',
        'From a mistake by Halley in 1691 — pointed out in 1756 and never fixed',
        'From the Greek for "shadow"',
        'From a Persian astronomer',
      ],
      explicacao:
        'Halley fished the word out of a Byzantine lexicon and stuck it on the 18-year cycle — but šār, in Babylonian, is the number 3,600, not an eclipse cycle. Le Gentil pointed out the mistake in 1756 and the name stayed anyway. The Babylonians, who owned the discovery, called it the "18-year cycle".',
      fonte: 'Edmond Halley, 1691; the mistake pointed out by Guillaume Le Gentil, 1756',
    },

    // ======================= HISTORY =======================
    'hist-horoscopo-jornal': {
      pergunta: 'The newspaper horoscope — twelve boxes, one per sign — was invented when?',
      opcoes: [
        'In Babylon',
        'In classical Greece',
        'On August 24, 1930',
        'In the 1960s, in the U.S.',
      ],
      explicacao:
        'It came out of a royal birth: the Sunday Express commissioned R. H. Naylor to do a horoscope for the newborn Princess Margaret — and the paper had to explain to its readers what a horoscope even was, because in 1930 nobody knew. The twelve boxes were born of an editorial problem: the one piece of data every reader knows by heart is their own birth date.',
      fonte: 'R. H. Naylor, "What the Stars Foretell for the New Princess", Sunday Express, 24/08/1930',
    },
    'hist-horoscopo-antigo': {
      pergunta: 'The oldest known individual horoscope is from what year?',
      opcoes: ['3000 BC', '410 BC', 'AD 150', '1781'],
      explicacao:
        'It\'s a Babylonian clay tablet with the sky on the night of a birth — and it\'s only a list of positions: no Ascendant, no houses, no interpretation at all. The birth chart as a system of reading is a Greek invention, some three centuries later, in Alexandria.',
      fonte: 'Francesca Rochberg, Babylonian Horoscopes, American Philosophical Society, 1998',
    },
    'hist-babilonios': {
      pergunta: 'What did the priests of Babylon read in the sky?',
      opcoes: [
        'Omens of state — king, war, harvest',
        'Each person\'s birth chart',
        'The ideal match for each sign',
        'The name each child should be given',
      ],
      explicacao:
        'The Enūma Anu Enlil series holds thousands of omens, and every one of them speaks to the palace: "if such a phenomenon, then such a consequence for the king and for the country". The oldest astrology wasn\'t about you — the individual record only shows up centuries later, and individual interpretation is Greek.',
      fonte: 'Enūma Anu Enlil, cuneiform series, compiled c. XVI-XII centuries BC',
    },
    'hist-nechepso': {
      pergunta: 'The texts that founded the birth chart circulated signed by "Nechepso and Petosiris". Who were they?',
      opcoes: [
        'A real pharaoh and a real priest',
        'Two astronomers of the Persian court',
        'Direct disciples of Ptolemy',
        'Pen names — Greek authors faking Egyptian antiquity',
      ],
      explicacao:
        'Greek authors in Alexandria, around 150-120 BC, signed as a pharaoh and a priest to lend Egyptian pedigree to what they were writing right then. Western astrology begins with a forged antiquity — the same move Court de Gébelin would repeat with tarot, 1,900 years later.',
      fonte: 'Nechepso-Petosiris corpus, c. 150-120 BC; fragments collected by Riess, 1892',
    },
    'hist-tendencias': {
      pergunta: 'Where was the line "astrology doesn\'t predict, it points to tendencies" born?',
      opcoes: [
        'In the temples of Babylon',
        'In a London courtroom, as a criminal defense',
        'At an astronomers\' conference',
        'In the counterculture of the 1960s',
      ],
      explicacao:
        'Alan Leo, the man who industrialized the horoscope, was prosecuted twice for fortune-telling under English law; his defense was that he described "tendencies", not fortunes. It collapsed when the prosecution read out loud a death prediction from his own almanac — convicted, fined five pounds. The market inherited the line without knowing it was born as a defense argument, in 1914-1917.',
      fonte: 'Alan Leo trials, London, 1914 and 1917',
    },
    'hist-contra-astrologos': {
      pergunta: 'Who wrote, back in antiquity, an entire book called "Against the Astrologers"?',
      opcoes: [
        'Nobody — the criticism is a modern invention',
        'Julius Caesar',
        'Sextus Empiricus, in the third century',
        'The emperor Nero',
      ],
      explicacao:
        'The disagreement is as old as the practice: Sextus Empiricus wrote Against the Astrologers in the third century, and he\'s a primary source every bit as much as Ptolemy. "Ancient wisdom" flattens four thousand years of people arguing — and the argument is the most interesting part of the story.',
      fonte: 'Sextus Empiricus, Against the Astrologers, 3rd c.',
    },
    'hist-mercurio-retro': {
      pergunta: '"Mercury retrograde breaks your phone and kills deals." What does the ancient source actually say?',
      opcoes: [
        'It talks about delay: expectations and ventures postponed',
        'Exactly that, only with carts',
        'It says to travel more',
        'Nothing — nobody tracked retrogrades',
      ],
      explicacao:
        'The source talks about waiting, not about devices: Vettius Valens writes that retrograde planets "postpone expectations, actions, profits and undertakings" — and that the second station "cancels the delay". Nothing about tech, nothing about your ex. The phrase "Mercury retrograde" doesn\'t even show up in the general press before 1996.',
      fonte: 'Vettius Valens, Anthologies, 2nd c.',
    },
    'hist-retro-frequencia': {
      pergunta: 'Is a retrograde planet in the sky a rare thing?',
      opcoes: [
        'Extremely rare — once a decade',
        'No — on 85.9% of days some planet is retrograde',
        'It only happens in leap years',
        'Impossible — planets don\'t move backwards',
      ],
      explicacao:
        'Measured against the ephemeris: Saturn spends 36.3% of the time retrograde, Pluto 44.4% — and on 85.9% of days some planet is retrograde in the sky. If retrogrades turned life upside down, upside down would be the normal state. The motion is apparent: a matter of orbital perspective, not reverse gear.',
      fonte: 'Our own measurement with an astronomical ephemeris — the app\'s tradition base, doc 11',
    },
    'hist-urano': {
      pergunta: 'Has Aquarius "always" been ruled by Uranus?',
      opcoes: [
        'Yes — since the Chaldeans',
        'Yes — it\'s in the Tetrabiblos',
        'No — Uranus was only discovered in 1781; in the tradition, Aquarius belonged to Saturn',
        'No — Aquarius belonged to the Sun',
      ],
      explicacao:
        'A sign can\'t have "always" belonged to a planet nobody knew about: Uranus enters the chart in 1781, and the attribution to Aquarius starts around 1825-1828 — in 1834 a reader was still asking why the new planet had no house at all. In the Tetrabiblos, Aquarius is Saturn\'s domicile.',
      fonte: 'Ptolemy, Tetrabiblos I.17, 2nd c. · attribution to Uranus: Smith, 1825 / Varley, 1828',
    },
    'hist-semana-planetaria': {
      pergunta: 'Monday for the Moon, Saturday for Saturn... was the planetary week already "immemorial" to the Romans?',
      opcoes: [
        'No — the man who records it already called the custom "comparatively recent"',
        'Yes — it went back to the beginning of time',
        'Yes — Romulus decreed it',
        'No — it was invented in the nineteenth century',
      ],
      explicacao:
        'Cassius Dio, the historian who documents the custom, writes that the ancient Greeks didn\'t know it and that the adoption was recent — and he gives two competing explanations for the order of the days, because not even he was sure. Even the ancient source thought the fashion was new.',
      fonte: 'Cassius Dio, Roman History 37.18-19, 3rd c.',
    },
    'hist-porcentagem': {
      pergunta: 'Which ancient source does the "compatibility percentage" between signs come from?',
      opcoes: [
        'Ptolemy\'s Tetrabiblos',
        'Dorotheus\' Carmen Astrologicum',
        'The Alexandria papyri',
        'None — there is no number in any ancient source',
      ],
      explicacao:
        'Ptolemy, Dorotheus, Māshā\'allāh and Lilly were all combed through: no number, no "87%". What the tradition has is a four-step scale — and on it the opposition sits at the bottom, not at the top the apps tend to give it. The percentage is media convention from the twentieth century, with no documented inventor.',
      fonte: 'Ptolemy, Tetrabiblos IV.7, 2nd c. (the ordinal scale); the percentage: 20th c., no identified author',
    },
    'hist-leao-coracao': {
      pergunta: 'In the ancient list that tied signs to body parts, Leo matched what?',
      opcoes: [
        'The heart, obviously',
        'The flanks and the shoulder blades',
        'The head',
        'The feet',
      ],
      explicacao:
        '"Leo = heart" is not in Manilius or in Ptolemy: in Manilius, author of the list of the twelve signs, Leo got the flanks and the shoulder blades — and Libra, which the market hands the kidneys, got the buttocks. The "heart" version can be dated: it shows up in print in Agrippa\'s Scale of Twelve, in 1533.',
      fonte: 'Manilius, Astronomica II.453-465, 1st c. · Agrippa, Scale of Twelve, 1533',
    },
    'hist-signo-solar': {
      pergunta: 'In ancient astrology, was the sun sign — "your sign" — the center of everything?',
      opcoes: [
        'No — the Sun was one of the seven planets; what marked the individual was the Ascendant',
        'Yes — always has been',
        'Yes — Ptolemy says to start there',
        'No — the center was Jupiter',
      ],
      explicacao:
        'In the tradition, the significator of the individual is the Ascendant — and character, in Ptolemy, comes from Mercury and the Moon. The sun sign became the center for two reasons with a name and a date: Alan Leo, who needed to produce readings at scale, and the 1930 newspaper, which needed twelve boxes.',
      fonte: 'Ptolemy, Tetrabiblos III.13, 2nd c. · Alan Leo, 1895-1917 · Naylor, 1930',
    },
    'hist-cuspide': {
      pergunta: 'Is someone born "on the cusp" a bit of both signs?',
      opcoes: [
        'Yes — it\'s ancient doctrine',
        'Yes — but only on the water cusps',
        'No — the sign boundary is an exact instant; what gets it wrong is the date table',
        'No — "cusp" is a translation error',
      ],
      explicacao:
        'The signs begin at the equinoxes and solstices, which are instants — Ptolemy writes that they\'re counted from those "and from no other source". What creates the legend is the fixed-date table in the almanacs, which really does get the boundaries wrong (29% of changeover days, measured). The answer isn\'t "I\'m both": it\'s calculating the Sun\'s longitude at the hour of birth — which is what this app does.',
      fonte: 'Ptolemy, Tetrabiblos I.22, 2nd c. · the app\'s own measurement: 318 of 1,092 changeover days wrong by table',
    },
    'hist-5000-anos': {
      pergunta: '"Astrology is 5,000 years old." What\'s the honest count?',
      opcoes: [
        '5,000 exactly, since the pyramids',
        'Some 2,000 to 2,500 years of continuous textual tradition',
        '10,000, since the caves',
        '300 years, since the newspapers',
      ],
      explicacao:
        'What\'s ~4,000 years old are Mesopotamian omens of state — a different thing, with no individual chart. The zodiac is ~2,450 years old, the oldest individual horoscope is from 410 BC, and the birth chart with an Ascendant is ~2,150. Two millennia and change of continuous texts is impressive enough — no need to inflate it.',
      fonte: 'Synthesis of this app\'s primary-source research — tradition base, doc 10 §14.1',
    },
  },
};
