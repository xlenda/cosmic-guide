// lib/traducoes/idadeReal.en.js
// ENGLISH PACK for lib/idadeReal.js — same shape as the Portuguese source of
// truth, entry for entry. The engine stays canonical in PT; this file carries
// ONLY the text a person reads, translated by MEANING rather than word by word.
//
// THE RULES FOR THIS FILE (test/idadeReal.test.js sweeps all of it):
//
//  (1) NO health claim, not even implied: relieve/soothe/calm/heal/cure/treat
//      and their relatives never appear. No promise of an outcome, no
//      pseudo-mechanism, no verdict on anyone who believed the story, no
//      invented social proof, no defensive small print.
//  (2) WHAT NEVER TRANSLATES: the locus (Tetrabiblos I.13, Astronomica
//      II.453–465), work titles (Le Monde primitif, The Lunation Cycle, Sun
//      Signs, Harmonice Mundi, Swiss Ephemeris), numbers, dates, and the
//      cosmicguide.cloud link. Established names DO translate: Ptolomeu →
//      Ptolemy, Manílio → Manilius, Vétio Valente → Vettius Valens, Doroteu →
//      Dorotheus, Teosofia → Theosophy.
//  (3) TONE MIRRORS THE PT: HOOK FIRST, SOURCE SECOND. Every `detalhe` opens in
//      real life — the headline, the carousel, the feed — and the receipt
//      (work, author, year) lands in the second half. The first 60 characters
//      carry no four-digit year and no the word "century".
//  (4) The label voice is the one an American app would use: the receipt box
//      says RECEIPTS, which is the word the English-speaking internet already
//      uses for "proof". A literal rendering of the Portuguese labels reads
//      like machine translation and the test rejects it.
//  (5) "século" is spelled out as "century" — the Portuguese abbreviation
//      "séc." must not survive, and neither may the Portuguese word "anos".
//
// SHAPE CONTRACT: `tela` carries exactly the PT screen keys with the same
// {n}/{total}/{ano} placeholders; `itens` carries EXACTLY the engine's 30 ids
// with the six text fields; `temas`, `graus`, `formato` and `compartilhar`
// repeat the PT shape.
export default {
  tela: {
    titulo: 'The real age of everything',
    subtitulo: 'Looks ancient × has a birth certificate',
    intro:
      'Thirty things the market sells as ancient, with the year each one turned up. The list opens with the newest.',
    ordenarPor: 'SORT',
    ordemMaisNovo: 'Newest first',
    ordemMaisAntigo: 'Oldest first',
    ordemTema: 'By topic',
    rotuloQuem: 'WHO INVENTED IT',
    rotuloQuando: 'WHEN',
    recibo: 'RECEIPTS',
    abrir: 'See the story',
    fechar: 'Close',
    compartilhar: 'Share',
    copiado: 'Text copied — paste it wherever you like.',
    naoCopiou: "Couldn't copy here — select the text and copy it.",
    idadeAnos: '{n} years',
    idadeAnosAprox: 'about {n} years',
    semData: 'no date',
    semDataLonga: 'The research went looking for the inventor and came up empty. That is stated, not buried.',
    comoContamos:
      'The age here is arithmetic, not a lookup table: {ano} minus the year the source gives. That is why it ticks over on its own every New Year.',
    progresso: "You've opened {n} of {total}.",
    marca: 'cosmicguide.cloud',
  },

  formato: {
    separadorMilhar: ',',
  },

  temas: {
    zodiaco: 'The zodiac',
    mapa: 'The chart',
    planetas: 'The planets',
    lua: 'The Moon',
    oraculos: 'The oracles',
    leitura: 'How it gets read',
    mercado: 'The market',
  },

  graus: {
    FP: {
      nome: 'primary source',
      glosa: 'the ancient text says so, and the research points to the work and the chapter',
    },
    TP: {
      nome: 'later tradition',
      glosa: 'it turned up after the ancient world, with a known author and date',
    },
    IR: {
      nome: 'recent invention',
      glosa: 'no ancient root: it was born in the 19th, 20th or 21st century',
    },
    AM: {
      nome: 'modern scholarship',
      glosa: 'it is the conclusion of historical research, 19th to 21st century',
    },
  },

  compartilhar: {
    idade: 'Real age:',
    pensam: 'What people think:',
    quem: 'Who invented it:',
    recibo: 'Receipts:',
  },

  itens: {
    'zodiaco-12': {
      coisa: 'The zodiac of twelve 30° signs',
      oQuePensam: "It's 5,000 years old and the oldest thing in astrology.",
      quemInventou: 'the astronomers of Babylon',
      quando: 'c. 450–400 BC',
      fonte: 'Babylon, c. 450–400 BC',
      detalhe:
        'This is the line where the honest answer beats the round number. The Babylonians swapped the constellations, which come in wildly different sizes, for twelve equal 30° slices of the ecliptic — the band of sky the Sun appears to walk along. Without that grid there is no saying "Mars in Gemini" as a coordinate, and the whole of astrology still runs on it.',
    },
    'homem-zodiacal': {
      coisa: 'The Zodiac Man, handing each sign a part of the body',
      oQuePensam: "It's in the Tetrabiblos, it's Ptolemy's list.",
      quemInventou: 'Manilius, in the poem Astronomica',
      quando: '1st century AD',
      fonte: 'Manilius, Astronomica II.453–465, 1st century; corroborated by Vettius Valens',
      detalhe:
        'The list that shares the body out among the twelve signs is not where everyone swears it is. Ptolemy sets out the correspondence for the planets; the one for the signs comes from Manilius, in a poem written in verse. And there Leo does not get the heart — it gets the flanks and the shoulder blades.',
    },

    'mapa-natal': {
      coisa: 'The birth chart with Ascendant and houses',
      oQuePensam: 'The Babylonians were already reading birth charts 5,000 years ago.',
      quemInventou: 'Greek authors in Alexandria, under the pen names Nechepso and Petosiris',
      quando: 'c. 150–120 BC',
      fonte: 'Nechepso and Petosiris corpus, c. 150–120 BC; first collection of the fragments: Riess, 1892',
      detalhe:
        'The tastiest part of this line is the beginning: Western astrology debuts with a made-up antiquity. The texts that found the birth chart circulate signed by an Egyptian pharaoh and an Egyptian priest, and both names are pen names for Greeks writing in Alexandria at that very moment. Giving new work an ancient pedigree did not spoil the tradition later on: it is there from day one.',
    },
    'aspectos-maiores': {
      coisa: 'The five major aspects',
      oQuePensam: 'Sacred geometry whose origin is lost in time.',
      quemInventou: 'the Hellenistic tradition; systematised by Ptolemy',
      quando: 'c. 150–120 BC; systematised in the 2nd century',
      fonte: 'Ptolemy, Tetrabiblos I.13, 2nd century',
      detalhe:
        'Opposition, trine, square and sextile are no wizard doodle: Ptolemy derives the angles from musical proportions applied to the half circle. And his test for "gets along" is not the element, it is the gender of the sign — the "fire with air" version is a second-hand summary. The conjunction, for him, does not even make the list.',
    },
    'casas-inteiras': {
      coisa: 'Whole Sign Houses, one house per sign',
      oQuePensam: 'A social-media fad, invented the day before yesterday.',
      quemInventou: 'it is the original method of Hellenistic astrology',
      quando: 'c. 150–120 BC',
      fonte: 'Original Hellenistic method; Holden, 1982 · Hand, 2000/2007 · Brennan, 2017',
      detalhe:
        'Every so often someone calls Whole Sign Houses a passing fad, and it is the other way round: house astrology started with that method, each house taking one entire sign, no degree cut down the middle. Holden published on it in 1982, Hand in 2000 and Brennan in 2017 — and in India the system never stopped being used. What is modern here is the English name.',
    },
    horaria: {
      coisa: 'Horary astrology, the question that becomes a chart',
      oQuePensam: 'Ancient Greek technique, from the first astrologers.',
      quemInventou: 'astrologers of the Islamic world',
      quando: '9th century',
      fonte: 'Islamic world, 9th century; inherited by Lilly, 1647',
      detalhe:
        'Asking the question out loud and casting a chart for the minute of the asking is one of the cleverest things in the craft — and it is not Greek. The branch matures in the Islamic world, and that is where Lilly picks up what would become the core of the English tradition. The cliché that Arab astrologers "merely preserved" does not hold: they developed.',
    },
    'partes-arabes': {
      coisa: 'The "Arabic parts", such as the Part of Fortune',
      oQuePensam: 'A medieval Arab invention, end to end.',
      quemInventou: 'the name is from the Islamic world; the idea of a lot is Hellenistic',
      quando: '9th century for the name; c. 150–120 BC for the idea',
      fonte: 'Islamic world, 9th century; the lot as a concept: Hellenistic tradition',
      detalhe:
        'The name gives away an origin, and the origin is only half right. Lots — points worked out by arc, with no planet actually sitting at that spot in the sky — are already in Greek astrology; what the Arab tradition did was multiply them. Ptolemy, by the way, was one of the pruners: he throws out almost all of them.',
    },
    'aspectos-menores': {
      coisa: 'The minor aspects: quintile, semisquare, sesquisquare',
      oQuePensam: 'An ancient refinement, for advanced reading.',
      quemInventou: 'Johannes Kepler',
      quando: '1619',
      fonte: 'Kepler, Harmonice Mundi, Book IV, 1619',
      detalhe:
        'The man who invented the chart\'s "extra" angles is the same one who worked out how the planets move. Kepler pulled them from harmonic ratios, in the very book where he was chasing the music of the orbits — and to him astronomy and a reformed astrology were not at war. Ptolemy recognises five figures and gives a reason why only those exist.',
    },
    placidus: {
      coisa: 'The Placidus house system',
      oQuePensam: "It's the traditional system, Ptolemy's own.",
      quemInventou: 'published by Placidus de Titis; the Swiss Ephemeris credits the invention to Magini',
      quando: '1650',
      fonte: 'Placidus de Titis, 1650; invention credited to Magini (1555–1617), via Swiss Ephemeris',
      detalhe:
        'It is the default on almost every website, which is exactly why it looks like the oldest one going — it is among the newest on this list. It went to print in 1650, and the Swiss Ephemeris, the calculation library running underneath nearly every astrology app, credits the invention to Magini a century earlier. The Tetrabiblos, which usually takes the credit, describes no house system at all.',
    },

    'urano-aquario': {
      coisa: 'Uranus as the ruler of Aquarius',
      oQuePensam: 'A classical rulership, the way it has always been.',
      quemInventou: 'Smith and Varley, after the planet was found in 1781',
      quando: '1825–1828',
      fonte: 'Ptolemy, Tetrabiblos I.17, 2nd century; assignment to Uranus: Smith, 1825 · Varley, 1828',
      detalhe:
        'A planet nobody had ever seen could not rule anything, and Uranus only turned up in a telescope in 1781. The one who owns Aquarius in the tradition is Saturn — the sign is his domicile, and domicile means the place where a planet sits in its own house. The swap shows up around 1825 and was still being argued over in the almanacs of 1834.',
    },
    'saturno-mestre': {
      coisa: 'Saturn, the great teacher of the chart',
      oQuePensam: 'An ancient reading, the planet of lessons forever.',
      quemInventou: 'Liz Greene',
      quando: '1976',
      fonte: 'Liz Greene, 1976; the ancient counterpoint: Vettius Valens, Anthologies, 2nd century',
      detalhe:
        "Every post about the Saturn return brings a stern teacher along, and that teacher is younger than plenty of people's dads. In the ancient authors he is the greater malefic, and what changes the reading is sect — whether the person was born by day or by night. The maturing-teacher figure was published by Liz Greene in 1976.",
    },
    'mercurio-retrogrado': {
      coisa: '"Mercury retrograde breaks devices and kills contracts"',
      oQuePensam: 'An old rule, flagged by astrologers for centuries.',
      quemInventou: 'no author identified — the research looked and found none',
      quando: '20th and 21st centuries, no exact date',
      fonte: 'No ancient source; what Valens says: Anthologies, 2nd century. Press trail: 1996',
      detalhe:
        'The calendar\'s favourite scapegoat has no birth certificate. The research went hunting for whoever invented the rule and came back empty-handed: it circulates as internet folklore, and the phrase does not even reach the general press before 1996. What Valens writes in the 2nd century is delay — a retrograde "delays expectations, actions and profits".',
    },

    superlua: {
      coisa: 'The Supermoon',
      oQuePensam: 'A classic astronomical event, ancient name and all.',
      quemInventou: 'Richard Nolle, an astrologer',
      quando: '1979',
      fonte: 'Richard Nolle, Dell Horoscope magazine, 1979',
      detalhe:
        'The headline promises a giant moon and you step outside to a moon exactly like yesterday\'s. The word is not even astronomy: "supermoon" was coined by an astrologer in a horoscope magazine, and the technical term is perigee syzygy — a full moon at the point of its orbit closest to Earth. It only became a real headline from 2011 on.',
    },
    'oito-fases': {
      coisa: 'The eight Moon phases, each with its meaning',
      oQuePensam: 'An age-old lunar cycle, one lesson per phase.',
      quemInventou: 'Dane Rudhyar',
      quando: '1936',
      fonte: 'Dane Rudhyar, The Astrology of Personality, 1936; The Lunation Cycle, 1967',
      detalhe:
        'The eight-phase carousel goes around as if it came from your grandmother, and it is newer than her fridge. The person who built the eight types, each with a personality reading, was Dane Rudhyar. Before that the split was different: Ptolemy works with four quarters and talks about qualities — hot, cold, dry, moist —, never about temperament.',
    },
    'luas-cheias-nomes': {
      coisa: 'The full moon names: Wolf Moon, Strawberry Moon',
      oQuePensam: 'Indigenous names, handed down generation after generation.',
      quemInventou: "the Maine Farmers' Almanac, an American farming almanac",
      quando: 'the 1930s',
      fonte: "Maine Farmers' Almanac, the 1930s; oldest printed list verified: Beard, 1918",
      detalhe:
        'Every month the feed announces a new name for the full moon, and the name never matches the backyard down here. The list came out of a farmers\' almanac from the northeastern United States and describes the growing calendar up there, which is why the "Snow Moon" lands at the height of a southern summer. The oldest printed list the research found is from 1918, made for the Boy Scouts, and it is not even the famous one.',
    },
    'lua-de-sangue': {
      coisa: 'The "Blood Moon"',
      oQuePensam: 'An ancient biblical term for a lunar eclipse.',
      quemInventou: 'pastor Mark Biltz; popularised by John Hagee\'s book',
      quando: '2008; the book in 2013',
      fonte: 'Mark Biltz, 2008 · John Hagee, Four Blood Moons, 2013',
      detalhe:
        'Of everything on this list that sounds biblical, this name is younger than the first iPhone. The person who started calling a lunar eclipse that was a pastor in the United States, and the idea became a popular book five years later. The image is in Joel 2:31, that much is true — what is not there is the name of the event, and no astronomer uses it.',
    },

    'taro-divinatorio': {
      coisa: 'Tarot as a system of divination',
      oQuePensam: 'A sacred book of Egypt, kept by the priests.',
      quemInventou: 'Antoine Court de Gébelin',
      quando: '1781',
      fonte: 'Court de Gébelin, Le Monde primitif, vol. 8, "Du Jeu des Tarots", 1781',
      detalhe:
        'Before it became an oracle, that deck spent some three and a half centuries on a card table with money on it — and tarocco is still played in Italy. The turn has a chapter and a year: a French scholar published the Egyptian thesis in 1781, and the first reading method came out two years later. That makes six centuries of imagery and two and a half of reading.',
    },
    'rider-waite': {
      coisa: 'The Rider-Waite-Smith deck as "the traditional tarot"',
      oQuePensam: 'It is the artwork of always, the original deck.',
      quemInventou: 'Pamela Colman Smith drew it; A. E. Waite directed',
      quando: '1909–1911',
      fonte: 'Rider-Waite-Smith, December 1909; A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'It is the deck in every tarot photo, and that is precisely why it looks like the oldest. The 78 images are by Pamela Colman Smith and came out in December 1909, with the book the following year. Calling that deck traditional wipes out some 470 years of tarot that came before it.',
    },
    'simbolos-borra-cafe': {
      coisa: 'The symbol dictionary for coffee grounds',
      oQuePensam: 'An age-old Turkish tradition, symbol by symbol.',
      quemInventou: '"A Highland Seer" and Cicely Kent; whoever mapped the cup was never identified',
      quando: '1881–1922',
      fonte: 'Tea-Cup Reading and Fortune-Telling by Tea Leaves, "A Highland Seer", 1881 · Cicely Kent, 1922',
      detalhe:
        'Bird means news, anchor means steadiness, ring means union: that whole table has an address, and the address is Britain. It went to print as a drawing-room pastime between 1881 and 1922, in the world of afternoon tea. As for splitting the cup into handle, rim and bottom, the research went looking for who codified it and found nobody: that gets said out loud.',
    },

    'signo-personalidade': {
      coisa: '"Your sign is X, so you are like this"',
      oQuePensam: 'The ancients already described the twelve personalities.',
      quemInventou: 'Alan Leo',
      quando: 'c. 1895–1910',
      fonte: 'Alan Leo, c. 1895–1910',
      detalhe:
        'That little chart of "how each sign behaves in an argument" is younger than talking pictures. The sign-portrait format belongs to the Englishman Alan Leo, right at the turn into the 20th century, and he is the one who put the Sun at the centre of everything. For Ptolemy, what describes character is Mercury and the Moon — and there is no chapter of twelve personalities.',
    },
    'retratos-goodman': {
      coisa: 'The sign portraits going around today',
      oQuePensam: 'The description of always, inherited from the Greeks.',
      quemInventou: 'Linda Goodman',
      quando: '1968',
      fonte: 'Linda Goodman, Sun Signs, 1968',
      detalhe:
        'The text you recognise as your sign — how you love, how you argue, how you work — came almost entirely out of a paperback. Linda Goodman published Sun Signs in 1968 and fixed the vocabulary the market still repeats. Valens, in the 2nd century, also describes the signs one by one, and his portrait is unrecognisable to anyone reading horoscopes today.',
    },
    'potencial-psicologico': {
      coisa: 'The chart as a portrait of what someone could become',
      oQuePensam: 'Astrology was always a tool for self-knowledge.',
      quemInventou: 'Dane Rudhyar',
      quando: '1936',
      fonte: 'Dane Rudhyar, The Astrology of Personality, 1936',
      detalhe:
        "The idea that the chart shows who you might become, rather than what is going to happen to you, is the frame this app uses. It has an author and a year: Dane Rudhyar rewrote astrology's entire vocabulary in 1936, bringing Jung inside it. Ancient astrology was a different animal — it forecast events, inside a fatalistic picture.",
    },
    'nao-e-previsao': {
      coisa: '"It is not prediction, these are tendencies"',
      oQuePensam: "Astrology's elegant old caveat.",
      quemInventou: 'Alan Leo, defending himself against fortune-telling charges',
      quando: '1914 and 1917',
      fonte: 'Alan Leo trials, London, 1914 and 1917',
      detalhe:
        "That sentence is in the mouth of every astrology app, this one included. It was born in a London courtroom: Alan Leo was answering a fortune-telling charge, and the defence held that this was a description of tendency, not a reading of fortune. The prosecution read out at trial a line where his almanac foretold a death in his family; the conviction came in 1917, and the caveat became the whole market's inheritance.",
    },
    'karma-mapa': {
      coisa: 'Karma and past lives in the chart',
      oQuePensam: 'An ancient layer of astrology, inherited from the East.',
      quemInventou: 'the Theosophical Society and its heirs',
      quando: 'from 1875 on',
      fonte: 'Theosophy, 1875 onwards',
      detalhe:
        'When somebody tells you that you "came here to settle something", the vocabulary is a good deal newer than astrology. Karma, debt and past lives are not in Ptolemy, in Valens, in Firmicus, in Bonatti or in Lilly. They enter the West through Theosophy, a society founded in 1875, which carried Indian vocabulary into the chart.',
    },
    'nodos-missao': {
      coisa: 'The North Node as "your soul mission"',
      oQuePensam: 'Ancient Vedic wisdom about life purpose.',
      quemInventou: 'the Theosophical layer; the popular format is Martin Schulman\'s',
      quando: 'from 1875 on; Schulman, 1975',
      fonte: 'Theosophy, 1875 onwards · Martin Schulman, Karmic Astrology, 1975',
      detalhe:
        'If anyone has ever read your life mission off a single point in the chart, that point wears a new label. Jyotish, which is Indian astrology, does not read Rahu and Ketu as markers of personal karma — so the "Vedic" tag does not stand up. The reading arrives through Theosophy and becomes a book in 1975, with Martin Schulman.',
    },
    'astrologia-tradicional': {
      coisa: 'The "traditional astrology" taught today',
      oQuePensam: 'It is ancient astrology straight from the source, no middleman.',
      quemInventou: 'Project Hindsight — Robert Schmidt, Ellen Black, Robert Zoller and Robert Hand',
      quando: '1992–93',
      fonte: 'Project Hindsight, 1992–93',
      detalhe:
        'What gets sold today as "traditional astrology" is newer than plenty of the people reading this. It is a reconstruction: from 1992 on, a group of translators began putting into English Greek texts nobody had translated, and rebuilt the system out of them. Where the text ran out, interpretation came in, and there is open disagreement among the rebuilders themselves.',
    },

    'horoscopo-jornal': {
      coisa: 'The daily horoscope by sun sign',
      oQuePensam: "It is astrology's classic format, the way it always was.",
      quemInventou: 'R. H. Naylor, in the Sunday Express',
      quando: '24 August 1930',
      fonte: 'R. H. Naylor, Sunday Express, 24/08/1930',
      detalhe:
        'You can mark on a calendar the day the horoscope in your feed was born: a Sunday in August, in a London paper, because of a newborn princess. It worked so well it became a fixed column, and the twelve-box format came from how little room the page had. The old part of astrology is something else — the whole chart, with a time and a place.',
    },
    'porcentagem-compatibilidade': {
      coisa: 'The compatibility percentage between signs',
      oQuePensam: 'A traditional calculation, taken from some old book.',
      quemInventou: 'no author identified — the research looked and found none',
      quando: '20th century, no exact date',
      fonte: 'No ancient source; the scale that does exist: Ptolemy, Tetrabiblos IV.7, 2nd century',
      detalhe:
        'This is one of the lines the research could not date, and the absence is already the answer. A compatibility number exists in no ancient, medieval or Renaissance Western source: they swept Ptolemy, Dorotheus, Māshāʾallāh and Lilly and found not one. What the tradition does have is a four-step scale, and in it a third of the pairs falls outside — signs that do not even see each other.',
    },
    'frequencias-hz': {
      coisa: 'The Hz frequency of each sign',
      oQuePensam: 'An ancient correspondence between sound and sky.',
      quemInventou: 'no author identified — wellness marketing vocabulary',
      quando: '20th and 21st centuries, no exact date',
      fonte: 'No ancient source; stone and plant by sign, those do have one: Culpeper, 1653',
      detalhe:
        'There is no dating whoever married a sign to a number of hertz, because there is no author: the research looked and did not find one. The numbers going around — 528, 432, 639 — come from the so-called solfeggio frequencies, which are 20th-century and turn up in no ancient source. Stone and plant by sign, those do have a datable tradition, and it is Culpeper, 1653.',
    },
    'app-astrologia': {
      coisa: 'The astrology app as a category',
      oQuePensam: 'It feels like it always existed; you are born with one in your pocket.',
      quemInventou: 'Co-Star, in New York',
      quando: '2017',
      fonte: 'Co-Star, New York, 2017; The Pattern and Sanctuary, 2017–2019',
      detalhe:
        'The newest thing on this list is the one you are holding. The "astrology app" genre was born in 2017, with Co-Star in New York, and filled out with The Pattern and Sanctuary right after. No ancient tradition has a rule for a reading delivered by a system with no person in the loop: the ethics of that are entirely contemporary, this app\'s included.',
    },
  },
};
