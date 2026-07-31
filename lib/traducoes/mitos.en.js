// lib/traducoes/mitos.en.js
// ENGLISH PACK for lib/mitos.js — the same shape as lib/traducoes/mitos.es.js,
// myth by myth. The engine stays canonical in PT; this file carries ONLY the
// text a person reads, translated by MEANING, never word for word.
//
// THE VOICE. This is not a translation of Portuguese, it is an American app
// talking. The single biggest trap is the label: "te contaram" has the sound of
// someone leaning in, and "they told you" is the literal that kills it. What an
// app in English actually writes on that card is THE MYTH — and the citation
// box underneath is not a "receipt" in the accounting sense, it is RECEIPTS,
// the internet's own word for proof. Those two words do in English what the
// Portuguese pair does in Portuguese: they make the card readable in one
// second, from a screenshot, with no explanation.
//
// THE RULES OF THIS FILE (the same red line as lib/mitos.js, in its English
// cousins — test/mitosIdiomas.test.js sweeps all of it):
//   (1) NO health claim: relieve/soothe/calm/heal/cure/treat/energize and
//       relatives do not enter, not even implied. "Heal" is banned as a stem,
//       so "health" never shows up here either — and the sweep is right.
//   (2) NO promise, no verdict, no defensive disclaimer: the myth gets dated,
//       cited and handed back its real history — it never mocks the person who
//       believed it and never "debunks" with a moral. Same tone as the thesis
//       (docs/tradicao/00-tese.md).
//   (3) WHAT IS NEVER TRANSLATED: loci (Tetrabiblos I.22, Astronomica
//       II.453–465), work titles (The Lunation Cycle, Le Monde primitif,
//       Sky & Telescope, Le Monde primitif), numbers, dates and the
//       cosmicguide.cloud link. Established names DO translate (Ptolomeu →
//       Ptolemy, Manílio → Manilius, Catão → Cato the Elder, Vétio Valente →
//       Vettius Valens) — and they follow the spelling already used by
//       lib/traducoes/rituais.en.js and tarot.en.js, so the app says one name
//       per person. Centuries follow the same house style: "séc. II" →
//       "2nd century", "séc. II a.C." → "2nd century BC".
//   (4) THE TONE MIRRORS PT: HOOK FIRST, SOURCE AFTER. Every `detalhe` opens in
//       real life — a headline, the beach, your feed, a frozen laptop — and the
//       receipt (work, author, year) lands in the second half. The first 60
//       characters carry no four-digit year and no "century".
//   (5) The word banned by docs/tradicao/06 §2 stays banned in the language:
//       neither the Portuguese word nor its English cousin appears anywhere.
//
// SHAPE CONTRACT (enforced by test/mitosIdiomas.test.js):
//   - `tela` has exactly the keys of CHROME_TELA in lib/mitos.js, with the same
//     {n}/{total} placeholders — and `marca` is the domain, identical in all
//     three languages.
//   - `compartilhar` carries the three labels of the text that leaves the app;
//     the engine assembles the lines and ALWAYS closes on the literal
//     LINK_COMPARTILHAR.
//   - `mitos` has EXACTLY the 25 ids of MITOS, each with oQueTeContaram,
//     oQueAFonteDiz, fonte and detalhe — no empty value.
export default {
  // The screen chrome. Same keys as CHROME_TELA (PT), same placeholders.
  tela: {
    titulo: 'Myth × Source',
    subtitulo: 'What you were told × what\'s actually written',
    mitoDoDia: 'MYTH OF THE DAY',
    teContaram: 'THE MYTH',
    fonteDiz: 'THE SOURCE SAYS',
    recibo: 'RECEIPTS',
    anterior: 'Previous',
    proximo: 'Next',
    compartilhar: 'Share',
    voltarAoDia: 'Back to today\'s myth',
    contador: '{n} of {total}',
    progresso: 'You\'ve gone through {n} of {total} myths.',
    copiado: 'Copied — paste it wherever you want.',
    naoCopiou: 'Couldn\'t copy here — select the text and copy it.',
    marca: 'cosmicguide.cloud',
  },

  // The labels of the shareable text — conversational, like the PT.
  compartilhar: {
    teContaram: 'The myth:',
    fonteDiz: 'The source says:',
    recibo: 'Receipts:',
  },

  mitos: {
    'taro-egito': {
      oQueTeContaram: 'Tarot comes from ancient Egypt — it\'s the Book of Thoth of the pharaohs.',
      oQueAFonteDiz:
        'The whole idea starts in one chapter of a French book from 1781, by Antoine Court de Gébelin — 41 years before Champollion cracked the hieroglyphs. He had no way of reading a single line of Egyptian. Waite himself wrote in 1911 that there is no evidence whatsoever for the Egyptian origin.',
      fonte: 'Le Monde primitif, vol. 8, "Du Jeu des Tarots" — Court de Gébelin, 1781',
      detalhe:
        'That deck they sell you as a secret of the pharaohs spent some 350 years as a gambling game on Italian tavern tables. Card reading as we know it is 245 years old: it began when Court de Gébelin published the Egyptian thesis in 1781 — and two years later Etteilla was selling the first method. Waite himself, in 1911, wrote that there is no evidence for the Egyptian origin.',
    },
    superlua: {
      oQueTeContaram: '"Supermoon" is a rare event astronomy has been announcing forever.',
      oQueAFonteDiz:
        'The term was coined by an astrologer, Richard Nolle, in a horoscope magazine in 1979. There is no official astronomical definition — the technical name is perigee-syzygy, and the difference in size is impossible to catch with the naked eye without a side-by-side comparison.',
      fonte: 'Richard Nolle, Dell Horoscope magazine, 1979',
      detalhe:
        'Every "giant Supermoon" headline promises a show nobody can pick out with the naked eye — the difference is about 14% in diameter, visible only in photos placed side by side. The word isn\'t even astronomy\'s: it was coined by an astrologer, Richard Nolle, in a horoscope magazine in 1979. It only went viral in 2011.',
    },
    'luas-cheias-nomes': {
      oQueTeContaram: '"Wolf Moon", "Strawberry Moon"… those are ancient Indigenous names.',
      oQueAFonteDiz:
        "The standard list was published by the Maine Farmers' Almanac in the 1930s — a gathering of Algonquian, colonial English and Celtic sources — and the Old Farmer's Almanac trimmed it to one name per month. And it describes the farming year of the northeastern United States: south of the equator it lands with the wrong hemisphere.",
      fonte: "Maine Farmers' Almanac, 1930s",
      detalhe:
        'Notice that February\'s "Snow Moon" falls at the height of summer south of the equator — the name arrived pre-packed from the hemisphere up top. The famous list came out of an American farming almanac from the 1930s, a gathering of Algonquian, English and Celtic sources trimmed to one name per month.',
    },
    'oito-fases': {
      oQueTeContaram: 'The 8 phases of the Moon, each with its own meaning, are ancient wisdom.',
      oQueAFonteDiz:
        'The psychological reading of the eight phases is Dane Rudhyar\'s — set out as eight soli-lunar types in The Lunation Cycle (1967), on an idea he had been developing since the 1930s-40s (The Astrology of Personality, 1936). The old division is a different one — Ptolemy works with four quarters, and describes qualities, not personality.',
      fonte: 'Dane Rudhyar — The Astrology of Personality, 1936; The Lunation Cycle, 1967',
      detalhe:
        'The carousel with the eight Moon phases and a "how to use it" for each one has an author and a birth certificate. The one who set out the eight types with a psychological reading was Dane Rudhyar, in The Lunation Cycle (1967), on an idea he had been developing since the 1930s-40s. The old authors split the Moon into four quarters — Ptolemy described qualities, not personality.',
    },
    'quiromancia-milenar': {
      oQueTeContaram: 'Reading palms is an ancient art — mounts, hand types, the marriage line.',
      oQueAFonteDiz:
        "The modern system is born in 1843 with D'Arpentigny (La Chirognomonie), fills out with Heron-Allen (1883) and becomes a manual with Benham (1900). And the four hand types by element are Fred Gettings', 1965.",
      fonte: "La Chirognomonie, D'Arpentigny, 1843 · The Laws of Scientific Hand Reading, Benham, 1900",
      detalhe:
        "The marriage line somebody traced on your palm at the beach is younger than photography. The whole package — mounts, hand types, lines with names — was assembled between 1843 and 1900, from D'Arpentigny to Benham. And the four hand types by element are from 1965, by Fred Gettings.",
    },
    'borra-de-cafe': {
      oQueTeContaram: 'Reading coffee grounds is an ancient Turkish tradition, with ancestral symbols.',
      oQueAFonteDiz:
        'Coffee only reaches Istanbul in the 16th century — the practice cannot be older than the drink. And the dictionary of symbols (snake = enmity, house = a move) is late-19th-century British parlor, pinned down by Cicely Kent in 1922.',
      fonte: 'Tea-Cup Reading, "A Highland Seer", 1881 · Cicely Kent, 1922',
      detalhe:
        'There was no way a great-grandmother from a thousand years back was reading coffee grounds: the first coffeehouses in Istanbul date to 1555, and the practice cannot be older than the drink. The table of symbols, with the snake standing for enmity, was put together in British parlors between 1881 and 1922, as an afternoon-tea game.',
    },
    'saturno-mestre': {
      oQueTeContaram: 'Saturn is the great teacher of the zodiac, the professor of lessons — always was.',
      oQueAFonteDiz:
        'Reading Saturn as teacher and maturity is Liz Greene, 1976. In the old sources Saturn is malefic, and the reading depends on the sect: Valens notes that well-placed malefics indicate "the greatest positions and success".',
      fonte: 'Liz Greene, 1976 · counterpoint: Vettius Valens, Anthologies, 2nd century',
      detalhe:
        'The villain planet became the professor, and nobody noticed the swap. In the old sources Saturn is the greater malefic — and Valens even notes that, well placed in its own sect, it indicates "the greatest positions and success". The "great teacher who brings lessons" is a psychological rereading published by Liz Greene in 1976.',
    },
    'karma-astrologia': {
      oQueTeContaram: 'Karma and past lives were always part of astrology.',
      oQueAFonteDiz:
        'They are not in Ptolemy, Valens, Firmicus, Bonatti or Lilly. They enter the West through Theosophy, from 1875 onward, imported from Indian vocabulary. And the North Node as "soul mission" is Martin Schulman, 1975.',
      fonte: 'Theosophy, 1875 onward · Martin Schulman, Karmic Astrology, 1975',
      detalhe:
        'The "karmic debt" in your chart appears in no ancient author — not in the Greeks, not in the medievals, not in Lilly. That vocabulary enters Western astrology through Theosophy, founded in 1875. And the "North Node = soul mission" package comes from a book of 1975, by Martin Schulman.',
    },
    'porcentagem-compatibilidade': {
      oQueTeContaram: 'There is a compatibility percentage between signs — "you two are an 87% match".',
      oQueAFonteDiz:
        'The number exists in no source at all — ancient, medieval or Renaissance. Ptolemy, Dorotheus, Māshāʾallāh and Lilly, all combed through: nothing. What the tradition has is a scale of four steps (Tetrabiblos IV.7), and in it a third of the sign pairs are "alien".',
      fonte: 'No ancient source — a 20th-century commercial invention; the real scale: Ptolemy, Tetrabiblos IV.7, 2nd century',
      detalhe:
        'That "you two are 87% compatible" came out of no book — it came out of magazines and software from the last century. In the old source the yardstick is a different one, and harsher: Ptolemy sorts the relationships into four steps, and a third of the sign pairs he calls alien — they don\'t even see each other. A low score doesn\'t sell, so the market stopped showing it.',
    },
    'lua-azul': {
      oQueTeContaram: '"Blue Moon" is the second full moon in a month — the classic definition.',
      oQueAFonteDiz:
        "It is a documented misreading: in 1946 the amateur astronomer James Hugh Pruett got the Maine Farmers' Almanac rule wrong in Sky & Telescope (there it was the third full moon of a season with four). The magazine itself ran the correction in 1999. Neither of the two definitions is old.",
      fonte: 'Sky & Telescope, James Hugh Pruett, 1946; the magazine\'s own correction, 1999',
      detalhe:
        'The definition everybody repeats was born from somebody misreading a magazine. In 1946 the amateur astronomer Pruett got the almanac rule wrong in Sky & Telescope; NPR repeated it in 1980 and Trivial Pursuit set it in stone in 1986. The magazine published the correction in 1999 — too late.',
    },
    'lua-de-sangue': {
      oQueTeContaram: '"Blood Moon" is an ancient biblical term for eclipses.',
      oQueAFonteDiz:
        'The image exists in Joel 2:31, but the term as the name of an eclipse comes from pastor Mark Biltz (2008) and John Hagee (Four Blood Moons, 2013). Astronomers don\'t use it.',
      fonte: 'Mark Biltz, 2008 · John Hagee, Four Blood Moons, 2013',
      detalhe:
        'The name stamped on every eclipse headline is newer than the iPhone. As a label for a lunar eclipse, "Blood Moon" was launched by an American pastor in 2008 and turned into a best seller in 2013. The Bible has the poetic image in Joel — but it doesn\'t call an eclipse that.',
    },
    'mercurio-retrogrado': {
      oQueTeContaram: 'Mercury retrograde breaks devices, takes down systems and sends the ex back.',
      oQueAFonteDiz:
        'The old source talks about delay: Valens writes that the retrograde "postpones expectations, actions and profits" and that the second station "cancels the delay". Nothing about technology, contracts or exes. The phrase doesn\'t even show up in the general press before 1996.',
      fonte: 'Vettius Valens, Anthologies, 2nd century; press trail: 1996',
      detalhe:
        'The official culprit behind your frozen laptop has an alibi almost two thousand years old. What Valens wrote in the 2nd century was delay: the retrograde "postpones expectations, actions and profits" — nothing about devices, contracts or exes. The phrase only reaches the press from 1996 on.',
    },
    'leao-coracao': {
      oQueTeContaram: 'Leo rules the heart — that\'s how it is in the ancient texts.',
      oQueAFonteDiz:
        'In the old Zodiac Man list (Manilius, Astronomica II), Leo gets the flanks and the shoulder blades — the heart belongs to the Sun, not to the sign. The oldest printable "Leo = heart" version is Agrippa\'s Scale of Twelve, 1533.',
      fonte: 'Manilius, Astronomica II.453–465, 1st century · Agrippa, 1533',
      detalhe:
        'Ask an astrology circle where "Leo rules the heart" comes from and nobody points to the book. In the oldest list of body and sign, Manilius gives Leo the flanks and the shoulder blades — the heart belonged to the Sun. The popular version only shows up in print in 1533, in Agrippa\'s Scale of Twelve.',
    },
    ofiuco: {
      oQueTeContaram: 'There is a 13th sign, Ophiuchus, that they\'re hiding from you.',
      oQueAFonteDiz:
        'A sign was never a constellation. The zodiac has been twelve equal parts of 30° since the 5th century BC, and Ptolemy (Tetrabiblos I.22) says the signs are counted from the equinoxes and solstices "and from no other source". The IAU constellation boundaries are from 1930.',
      fonte: 'Ptolemy, Tetrabiblos I.22, 2nd century · IAU constellation boundaries, 1930',
      detalhe:
        'Every so often the same headline comes back around: "NASA changed your sign". Except a sign is a 30° slice counted from the equinox, not a constellation drawing — it has been that way for some 2,450 years, and Ptolemy wrote that the signs are counted from the equinoxes "and from no other source". The constellation map that houses Ophiuchus was drawn by the IAU in 1930, for astronomical use.',
    },
    'urano-aquario': {
      oQueTeContaram: 'Uranus rules Aquarius — classical rulership.',
      oQueAFonteDiz:
        'Uranus was discovered in 1781. In the tradition, Aquarius is the domicile of Saturn (Ptolemy, Tetrabiblos I.17). The attribution to Uranus begins in 1825 (Smith) and 1828 (Varley) — and in 1834 it was still being argued.',
      fonte: 'Ptolemy, Tetrabiblos I.17, 2nd century; attribution to Uranus: Smith, 1825 / Varley, 1828',
      detalhe:
        'The "classical ruler" of Aquarius didn\'t even exist on the charts until the other day: Uranus was only discovered in 1781. In the tradition, Aquarius was always the house of Saturn. The swap begins around 1825 — and in 1834 there were still almanac readers asking why the new planet had no house at all.',
    },
    'estrela-esperanca': {
      oQueTeContaram: 'The Star card was always the card of hope.',
      oQueAFonteDiz:
        'In the deck\'s own manual (Waite, 1911), the first reading of the Star is "loss, theft, privation, abandonment" — hope appears as a second reading, "another version". The priority was flipped over the course of the 20th century.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'Open the original manual of the best-selling deck in the world and look up the Star: the first reading is "loss, theft, privation, abandonment". Hope is in there as "another version", in second place. It was the 20th century that promoted the second option to sole meaning — following the picture, not the text.',
    },
    'carta-invertida': {
      oQueTeContaram: 'A reversed card means blockage or denial — traditional reading.',
      oQueAFonteDiz:
        'In Waite (1911) the reversal is usually a side meaning — sometimes better than the upright card: the Wheel of Fortune reversed is "increase, abundance"; the Emperor reversed is "benevolence, compassion, credit". The "blockage/excess" key is 20th century (Gray, Pollack, Greer).',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'Some cards get better upside down in the original manual: the Wheel of Fortune reversed becomes "increase, abundance", and the Emperor reversed, "benevolence, compassion". In Waite, 1911, the reversal is usually a side meaning — not a defect in the card. The rule "reversed = blockage" was written afterwards, over the course of the 20th century.',
    },
    'cruz-celta': {
      oQueTeContaram: 'The Celtic Cross is an ancient Celtic spread.',
      oQueAFonteDiz:
        'The name is Waite\'s, 1911. The structure comes from Golden Dawn circles of the 1890s — and Waite says only that the spread "has been used in private for many years".',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'The most famous spread in tarot has nothing druid about it. The name "Celtic Cross" debuts in 1911, in Waite\'s manual, and the layout comes from the occultist circles of 1890s London. Celtic in name only.',
    },
    'marselha-o-mais-antigo': {
      oQueTeContaram: 'The Tarot de Marseille is the original tarot, the oldest of them all.',
      oQueAFonteDiz:
        'It is a French printing pattern of the 17th–18th centuries (Noblet c. 1650, Conver 1760). The oldest tarots are the hand-painted Italian ones of the 15th century. And the name "Tarot de Marseille" was popularized by Paul Marteau, of the manufacturer Grimaud, in 1930.',
      fonte: 'French pattern, 17th–18th centuries (Conver, 1760); the name: Paul Marteau, Grimaud, 1930',
      detalhe:
        'The "original tarot" is newer than the decks it claims to come before: the hand-painted Italian tarots come first, and the Marseille pattern is French printing of the 17th–18th centuries. Even the name is a commercial label: the one who christened "Tarot de Marseille" was the manufacturer Paul Marteau, in 1930.',
    },
    'astrologia-5000-anos': {
      oQueTeContaram: 'Astrology is 5,000 years old.',
      oQueAFonteDiz:
        'What is ~4,000 years old are Mesopotamian state omens — a different thing. The zodiac is ~2,450 years old; the oldest individual horoscope is from 410 BC; the natal chart with Ascendant and houses is ~2,150 years old.',
      fonte: 'Oldest cuneiform horoscope: 410 BC; Hellenistic natal chart: c. 150–120 BC',
      detalhe:
        'The round number doubles the real age of the thing. What the Babylonians of 4,000 years ago were reading were state omens — rain, war, the king — not a person\'s chart. The first known individual horoscope is from 410 BC, and the natal chart with Ascendant and houses is some 2,150 years old.',
    },
    'horoscopo-de-jornal': {
      oQueTeContaram: 'The daily horoscope by sign is astrology\'s classic format.',
      oQueAFonteDiz:
        'It has a premiere date: August 24, 1930, in the Sunday Express, by R. H. Naylor — about the birth of Princess Margaret. In 1930 the paper had to explain to its readers what a horoscope was.',
      fonte: 'R. H. Naylor, Sunday Express, 24/08/1930',
      detalhe:
        'The horoscope in your feed has a premiere date like a soap opera: August 1930, in a British paper, about the birth of a princess. It was such a novelty that the paper had to explain to its readers what a horoscope was. In the tradition, the one who describes the individual is the Ascendant, not the Sun sign.',
    },
    'signo-personalidade': {
      oQueTeContaram: '"Aries is impulsive, Scorpio is intense" — the ancients already described them that way.',
      oQueAFonteDiz:
        'Characterology by Sun sign is 20th century: Alan Leo (c. 1895–1910) onward, popularized by Linda Goodman in 1968. In Ptolemy, character comes from Mercury and the Moon (Tetrabiblos III.13) — there is no chapter of "twelve personalities".',
      fonte: 'Alan Leo, c. 1895–1910 · Linda Goodman, Sun Signs, 1968 · Ptolemy, Tetrabiblos III.13, 2nd century',
      detalhe:
        'The sketch of your sign — stubborn, dramatic, dreamy — is in no ancient author at all. That format is born with Alan Leo at the turn of the 20th century and blows up with Linda Goodman in 1968. Ptolemy read character in Mercury and in the Moon; and the portrait Valens draws of the signs is unrecognizable to anyone who reads horoscopes today.',
    },
    'numerologia-pitagoras': {
      oQueTeContaram: 'The numerology table A=1, B=2… comes from Pythagoras.',
      oQueAFonteDiz:
        'Pythagoras left no writings, and the 26-letter alphabet is not his. The table in three columns of nine traces back to L. Dow Balliett, 1908 — the "master numbers" 11 and 22 are hers as well.',
      fonte: 'L. Dow Balliett, 1908',
      detalhe:
        'The "Pythagoras method" uses an alphabet Pythagoras never saw — and he left no writings behind. The three-row table with the modern alphabet has its oldest trail in a book from 1908, by L. Dow Balliett, along with the master numbers 11 and 22. All that\'s left of the Greek is the name.',
    },
    'lua-nova-intencoes': {
      oQueTeContaram: 'The New Moon is the moment to plant intentions — an ancestral ritual.',
      oQueAFonteDiz:
        'Planting FOR REAL on the dark moon is a primary source: Cato the Elder, 2nd century BC, "luna silente". "Planting intentions" is a modern transposition — Jan Spiller, New Moon Astrology, 2001.',
      fonte: 'Cato the Elder, De Agri Cultura 40.1, 2nd century BC · Jan Spiller, New Moon Astrology, 2001',
      detalhe:
        'The planting part is Roman; the wish-list part is as old as Windows XP. Cato the Elder told farmers to sow with the dark moon — actual planting, in the ground. The New Moon intentions notebook comes from an American book of 2001, by Jan Spiller.',
    },
    'nao-e-previsao': {
      oQueTeContaram: '"It\'s not prediction, they\'re tendencies" — astrology\'s elegant old framing.',
      oQueAFonteDiz:
        'The phrase is born from a criminal defense: Alan Leo was prosecuted for fortune-telling in London in 1914 and 1917; the defense argument was that he described tendencies, not fortunes. It fell apart when the prosecution read out his almanac predicting a death in the family — he was convicted and fined £5.',
      fonte: 'Alan Leo trials, London, 1914 and 1917',
      detalhe:
        'The most elegant phrase on the market was born in a courtroom. Alan Leo, prosecuted for fortune-telling in London, defended himself by saying he described tendencies, not fortunes — the prosecution read his almanac out loud, predicting a death in the family, and he was convicted in 1917. The whole market inherited the phrase without knowing where it came from.',
    },
  },
};
