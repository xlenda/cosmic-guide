// lib/traducoes/profeccoes.en.js
// THE ENGLISH PACK FOR PROFECTIONS — same SHAPE as profeccoes.pt.js: same
// keys, same fields, same {x} placeholders. The engine (lib/profeccoes.js)
// knows nothing about language: it only asks this object for pieces.
//
// THE WRITING RULE, same as in Portuguese: HOOK FIRST, SOURCE AFTER. Every
// `prende`, `mes` and `curto` opens in real life, in plain spoken English. The
// receipt (work, author, century) lives in `tradicao` and `fonte`, never in
// the opening line.
//
// THE RED LINE: no health claim, not even implied — nothing that relieves,
// soothes, calms, heals, cures or treats. Firmicus and Valens list ailments
// under House 6, House 12 and Saturn: that always enters as a historical
// record with an owner and a century, never as a sentence aimed at the body of
// the person reading. No promise of outcome, no verdict, no defensive
// disclaimer either.
//
// WHAT IS NEVER TRANSLATED: the Robbins verbatim (Loeb, 1940) is byte-for-byte
// identical across the three packs. Here it happens to read natively; the
// paraphrase alongside it is still labelled as a gloss.

const VERBATIM = {
  anual: {
    obra: 'Ptolemy, Tetrabiblos IV.10 ("Of the Division of Times"), trans. F. E. Robbins, Loeb, 1940',
    texto:
      'setting out from each of the prorogatory places, in the order of the signs, the number of years from birth, one year to each sign […] taking the ruler of the last sign.',
  },
  mensal: {
    obra: 'Ptolemy, Tetrabiblos IV.10, trans. F. E. Robbins, Loeb, 1940',
    texto:
      'We shall do the same thing for the months, setting out, again, the number of months from the month of birth, starting from the places that govern the year, twenty-eight days to a sign; and similarly for the days, we shall set out the number of the days from the day of birth, starting with the places which govern the months, two and a third days to a sign.',
  },
  prorrogativos: {
    obra: 'Ptolemy, Tetrabiblos IV.10, trans. F. E. Robbins, Loeb, 1940',
    texto:
      'We shall apply the prorogation from the horoscope to events relating to the body and to journeys […]; that from the Lot of Fortune to matters of property; that from the moon to affections of the soul and to marriage; that from the sun to dignities and glory; that from the mid-heaven to the other details of the conduct of life.',
  },
};

// The KEYS are canonical (the Portuguese name) and never change.
const SIGNOS = {
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
};

// `planetas` is the LABEL; `planetasNaFrase` is the name as it enters a
// sentence — in English "is the Sun", never "is Sun".
const PLANETAS = {
  sol: 'Sun',
  lua: 'Moon',
  mercurio: 'Mercury',
  venus: 'Venus',
  marte: 'Mars',
  jupiter: 'Jupiter',
  saturno: 'Saturn',
};

const PLANETAS_NA_FRASE = {
  sol: 'the Sun',
  lua: 'the Moon',
  mercurio: 'Mercury',
  venus: 'Venus',
  marte: 'Mars',
  jupiter: 'Jupiter',
  saturno: 'Saturn',
};

const CASAS = {
  1: {
    nomeAntigo: 'Horoskopos — "the tiller"',
    prende:
      'The question of the year swings back to you: the body, the name, the way you show up at the door. What was sitting in other people\'s hands lands back in yours. This is the wheel returning to its starting point — every twelve years it lands here.',
    mes: 'The subject swings back to you: body, name, the face you show.',
    tradicao:
      'The first place is the Horoskopos. Paul of Alexandria (4th c.) calls it "the origin and the foundation" and also "the tiller"; Firmicus Maternus, in the same century, writes that the character of the whole nativity is settled from here — "the cornerstone and basis". It is where Mercury rejoices.',
    moderno:
      '"Social mask" and "how the world sees you" is a 20th-century reading. Legitimate, only later — and a different job: the ancient one is architectural, the zero point from which every other house is counted.',
    fonte: 'Paul of Alexandria, ch. 24 · Firmicus Maternus, Mathesis II.XIX.2 (4th c.)',
  },
  2: {
    nomeAntigo: 'Gate of Hades',
    prende:
      'A year of bills on the table: what comes in, what goes out, what keeps the month standing. Money here is not status — it is rent, groceries, the instalment due on the 10th.',
    mes: 'Bills on the table: what comes in, what goes out, what keeps the month standing.',
    tradicao:
      'The old name of the second place is the Gate of Hades. Firmicus Maternus (4th c.) says it shows "increase in personal hopes and in material possessions" and, in the same breath, files it as a passive place, "because it is not in any way aspected to the ascendant". Valens (2nd c.) is harsher: there "the benefics do no good". Firmicus also calls it Spes, Hope.',
    moderno:
      '"Self-worth" and "my values" is a 20th-century swerve, and it rides on an English pun — values covers both moral worth and money worth. No ancient source read in this base makes that jump.',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.3 (4th c.) · Vettius Valens, Anthologiae II (2nd c.)',
  },
  3: {
    nomeAntigo: 'the Goddess',
    prende:
      'A year of people close by: the sibling, the cousin, the neighbour who became a friend, the same old group. And of going and coming back — small bag, short road, sleeping at someone else\'s place.',
    mes: 'People close by, going and coming back: sibling, neighbour, the short road.',
    tradicao:
      'The third place is called the Goddess, and it is where the Moon rejoices. Firmicus Maternus (4th c.) puts "brothers and friends" here, and also "travellers". Paul of Alexandria adds friendship, patronage and living abroad; Valens, in the table of the Nine Names, gives this place the mother.',
    moderno:
      '"Communication and the concrete mind" comes from the twelve-letter alphabet, which equates house, sign and planet: a seed in Lilly, 1647, and full doctrine in the 20th century, popularised by Zipporah Dobyns in the 1970s. Chris Brennan points out that the ancient planet of this place is the Moon, not Mercury — the overlap in theme is just that, an overlap between two different engines.',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.4 (4th c.) · Paul of Alexandria, ch. 24',
  },
  4: {
    nomeAntigo: 'Hypogeion — the Underground',
    prende:
      'A year of roots: the house, the land, the move, what the family keeps and what it owes. The thing that has been under the rug for years is usually of this kind.',
    mes: 'Roots: house, moving, the family matter that had been put away.',
    tradicao:
      'The fourth place is the Hypogeion, the underground. Firmicus Maternus (4th c.) is blunt and says nothing about the father: "family property, substance, possessions, household goods, anything that pertains to hidden and recovered wealth". Paul of Alexandria puts land, foundations, the homeland and the end of life here.',
    moderno:
      'Father or mother in House 4 is a fight between layers, and we say which one we are using: Lilly (1647) puts the father here and the mother in the 10th; modern astrology flipped it; and Firmicus takes the parents out of the houses altogether and puts them in the planets — the Sun tells you about the father, the Moon about the mother. Valens, for his part, puts the father in the 9th and the mother in the 3rd.',
    fonte:
      'Firmicus Maternus, Mathesis II.XIX.5 and II.XIX.13 (4th c.) · Paul of Alexandria, ch. 24',
  },
  5: {
    nomeAntigo: 'Good Fortune',
    prende:
      'A year when the conversation about children shows up — having them, raising them, looking after them, or somebody else\'s child becoming your business. And whatever you do for the love of it, with nothing charged for it.',
    mes: 'What you do for the love of it — and the conversation about children.',
    tradicao:
      'The fifth place is Good Fortune, where Venus rejoices. Firmicus Maternus (4th c.): "from this house is discovered the number of children and their sex. It is called Bona Fortuna because it is the house of Venus", and it stands in trine to the ascendant. Valens, in the 2nd century, went as far as linking this place to marriage.',
    moderno:
      '"Creativity, the stage, self-expression" comes from the twelve-letter alphabet — the 5th house equated with Leo and the Sun — full doctrine in the 20th century. I did not find that reading in any ancient source in this base.',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.6 (4th c.) · Vettius Valens, Anthologiae II (2nd c.)',
  },
  6: {
    nomeAntigo: 'Bad Fortune',
    prende:
      'A year of work that weighs: the shift that never ends, the task nobody wanted and you got, the boss who keeps asking. This is the place of service rendered — and of the wear that comes with it.',
    mes: 'Work that weighs: the shift, the task left over, what wears you down.',
    tradicao:
      'The sixth place is called Bad Fortune, and it is where Mars rejoices. Firmicus Maternus (4th c.) writes that this is where the ancients looked for the cause of bodily infirmities, and that it is a passive place, "because it is not aspected to the ascendant". Valens (2nd c.) goes further: a benefic there does not help. Sue Ward, reading the horary tradition, sharpens the vocabulary — the subject is servitude and toil, not "service".',
    moderno:
      '"Routine, habits and wellbeing" is a 20th-century reading, arriving through the same equation of the 6th house with Virgo and Mercury. Of the ancient list the only item that survived was work; everything else flipped sign.',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.7 (4th c.) · Vettius Valens, Anthologiae II (2nd c.)',
  },
  7: {
    nomeAntigo: 'Dysis — the Setting Place',
    prende:
      'A year of the other person: whoever sits across from you. Marriage, partnership, contract — and also the argument that only exists because there are two people in it. Little gets settled alone in a year like this.',
    mes: 'The other person: contract, partnership, the conversation that needs two.',
    tradicao:
      'The seventh place is Dysis, the setting place — where the Sun goes down. Firmicus Maternus (4th c.): "from this house we shall inquire as to the nature and number of marriages". And the same Firmicus notes that this is the place most adverse to the ascendant, because it stands in opposition to it. Paul of Alexandria puts long stays abroad here alongside marriage.',
    moderno:
      '"The mirror", "the soulmate" and "the projection of the shadow" is a 20th-century Jungian reading. Lilly, in 1647, still put the public enemy here — and Sue Ward flatly denies that this is the house of "the unknown other".',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.8 (4th c.) · Paul of Alexandria, ch. 24',
  },
  8: {
    nomeAntigo: 'Epicatafora — Beginning of Death, and "the Idle One"',
    prende:
      'A year of money that is not yours: inheritance, debt, the other side\'s share of the bill, what somebody left behind. And of things that close — and only close with a signature.',
    mes: 'Money that is not yours: the other side\'s share, the debt, what closes.',
    tradicao:
      'The eighth place is called Epicatafora, the beginning of death, and Paul of Alexandria gives it another name: the Idle One (argos). Firmicus Maternus (4th c.) says it is a passive place, "since it is not in aspect to the ascendant". Paul puts profit from inheritance here. Ptolemy leaves this place out of the prorogation precisely because it is disjunct from the ascendant.',
    moderno:
      '"Sex and transformation" arrives after 1930: Pluto is discovered, assigned to Scorpio, and Scorpio is equated with House 8 through the twelve-letter alphabet. Sue Ward spells the chain out. No ancient source in this base links House 8 to sex.',
    fonte:
      'Firmicus Maternus, Mathesis II.XIX.9 (4th c.) · Paul of Alexandria, ch. 24 · Ptolemy, Tetrabiblos III.10',
  },
  9: {
    nomeAntigo: 'the God',
    prende:
      'A year of stepping outside your own yard: another country, another language, another way of thinking. A course, faith, one big question that will not leave your head.',
    mes: 'Stepping outside your own yard: another country, another language, a big question.',
    tradicao:
      'The ninth place is the God, and it is where the Sun rejoices. Firmicus Maternus (4th c.) puts religion and foreign travel there. Valens (2nd c.) is the richest: "friendship, travel, benefits from foreign things. It\'s the place of God, king, sovereign; astrology, oracular decrees, the appearance of gods, divination". Astrology itself lives in this house.',
    moderno:
      '"Philosophy and higher education" is the secular version of the same thing, and it arrives in the 20th century through the equation of the 9th house with Sagittarius and Jupiter — but this is the house where ancient and modern look most alike. Worth saying out loud: credibility is also built by admitting when the market gets it right.',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.10 (4th c.) · Vettius Valens, Anthologiae II (2nd c.)',
  },
  10: {
    nomeAntigo: 'Mesouranema — the Midheaven',
    prende:
      'A year of showing up: what you do, who watches you do it, the name that sticks. A promotion, a change of role, the project that leaves the draft folder and becomes a public thing.',
    mes: 'Showing up: what you do and who watches you do it.',
    tradicao:
      'The tenth place is the Mesouranema, and the Greek word for what it governs is praxis — action, what one does. Firmicus Maternus (4th c.) calls it "the first in importance" and lists actions, homeland, home and professional career there. Ptolemy puts it first among the prorogatory places. One technical note almost nobody gives: under Whole Sign houses the Midheaven is not the cusp of House 10 — Paul (ch. 30) warns that the culminating degree sometimes falls in the 9th and sometimes in the 11th. When this app says House 10, it means the tenth sign counted from the starting point.',
    moderno:
      '"Career" in the job sense is a 20th-century translation of praxis, modern and narrow: Firmicus included homeland and home here too. And there is an inversion worth logging: Lilly, in 1647, put the mother in House 10; modern astrology put the father there.',
    fonte:
      'Firmicus Maternus, Mathesis II.XIX.11 (4th c.) · Paul of Alexandria, ch. 30 · Ptolemy, Tetrabiblos IV.10',
  },
  11: {
    nomeAntigo: 'Agathos Daimon — the Good Spirit',
    prende:
      'A year of whoever gives you a hand: the invitation, the referral, the door opened by someone who was already inside. What arrives through people, not through solitary effort.',
    mes: 'Whoever gives you a hand: the invitation, the referral, the open door.',
    tradicao:
      'The eleventh place is the Good Daimon — Agathos Daimon, the good spirit — and it is where Jupiter rejoices. Firmicus Maternus (4th c.) says it is "the house of Jupiter" and that it can be seen to be in sextile to the ascendant. Paul of Alexandria puts alliance, patronage and good expectations here. Valens (2nd c.): benefics in this place "make men illustrious and rich from youth".',
    moderno:
      '"Friends and groups" is a later consolidation — Paul put friendship in House 3. And the load of collective, activism and network comes from Uranus, a planet discovered in 1781: in practice it is 20th century.',
    fonte:
      'Firmicus Maternus, Mathesis II.XIX.12 (4th c.) · Paul of Alexandria, ch. 24 · Vettius Valens, Anthologiae II (2nd c.)',
  },
  12: {
    nomeAntigo: 'Cacodaemon — the Bad Spirit',
    prende:
      'A year of backstage: what runs underneath, what nobody mentions in the meeting, the arrangement that stays behind the door. And of handling whoever gets in the way without raising your voice.',
    mes: 'Backstage: what runs underneath and never gets mentioned in the meeting.',
    tradicao:
      'The twelfth place is the Bad Daimon — Cacodaemon — and it is where Saturn rejoices. Firmicus Maternus (4th c.) says the nature of enemies is determined from here, that it is a passive place "because it is not aspected to the ascendant", and that it is the house of Saturn. Sue Ward defines the hidden enemy sharply: usually people the person considers friends. Ptolemy excludes this place by name, and the reason he gives is atmospheric — the moist, thick exhalation of the earth muddies the light of the stars there.',
    moderno:
      '"The unconscious, karma and past lives" enters in the 20th century, in three jumps: Alan Leo\'s theosophy (Esoteric Astrology, 1913), houses as fields of experience in Rudhyar (1936 and 1972), and the psychological consolidation with Liz Greene and Sasportas (The Twelve Houses, 1985). As for "self-undoing", it circulates widely and the research behind this base did not find a first appearance in any dated source — it is logged as not found.',
    fonte: 'Firmicus Maternus, Mathesis II.XIX.13 (4th c.) · Ptolemy, Tetrabiblos III.10',
  },
};

const SENHORES = {
  sol: {
    prende:
      'The subject of the year is showing up: the post, the name, the word that carries because it is you saying it. Father, boss, whoever is in charge — that kind of figure tends to take up room in the conversation.',
    curto: 'The Sun pulls the subject towards what is public.',
    tradicao:
      'Valens (2nd c.) opens the planetary catalogue with the Sun and defines it as "the organ of mental perception". Under it he gathers kingship, command, office, public reputation, honours — and the people: the father, the master. Ptolemy does not call it benefic: in his classification the Sun is common.',
    moderno:
      '"The Sun rules the personality" is Alan Leo, from 1895 onwards. It is not in the ancient sources.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.) · Ptolemy, Tetrabiblos I.5',
  },
  lua: {
    prende:
      'The subject of the year is whatever sits close to the ground: house, moving, routine, the mother, who looks after whom. You change place more than you change direction.',
    curto: 'The Moon pulls the subject towards the household.',
    tradicao:
      'Valens\'s list (2nd c.) for the Moon surprises anyone expecting feelings: "man\'s life, body", the mother, household administration, the city, gains and expenses — and journeys and wanderings, with an explanation by image: "it does not provide straight pathways because of Cancer". And Ptolemy classes the Moon as benefic, alongside Jupiter and Venus, which almost no app says.',
    moderno:
      '"Moon equals emotions" is a 20th-century emphasis. The ancient source talks first about body, household and city.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.) · Ptolemy, Tetrabiblos I.5',
  },
  mercurio: {
    prende:
      'The year turns talkative: a proposal, a message, an account to close, a paper to sign. A lot gets settled by text and by conversation — and changes shape halfway through.',
    curto: 'Mercury pulls the subject towards paperwork and conversation.',
    tradicao:
      'Valens (2nd c.) runs very long on Mercury, and the one-word summary is brokerage: letters, dispute, embassies, accounts, geometry, weights and measures, markets, banks — "the creator of all marketing and banking". The same planet makes the notary and the trickster, and that is doctrine, not a joke. And the line that weighs most here: "Mercury will make everything capricious in outcome and quite disturbed".',
    moderno:
      'The panic around Mercury retrograde belongs to the late 20th century. No ancient source promises broken devices — and, measured in this base, the planet spends about 19% of the time retrograde, three times a year.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.)',
  },
  venus: {
    prende:
      'The subject of the year is the people you want nearby: the agreement, the proposal, the making-up, the invitation. And spending on something beautiful and feeling it was worth it.',
    curto: 'Venus pulls the subject towards agreement and affection.',
    tradicao:
      'Valens (2nd c.) opens Venus with two words: "Venus is desire and love". Then come marriage, friendship, company, agreements on favourable terms — and the crafts: music, singing, painting, the mixing of colours, perfumery, goldsmithing. Ptolemy classes her as benefic.',
    moderno:
      '"Venus is self-worth" is a 20th-century reading. In the source, Venus is bond, agreement and craft — something done with another person.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.) · Ptolemy, Tetrabiblos I.5',
  },
  marte: {
    prende:
      'A year of doing, and of doing by cutting: the building work, the forced move, the conversation nobody wanted to have and had anyway. Tool in hand, short deadline, friction.',
    curto: 'Mars pulls the subject towards what demands a tool and a deadline.',
    tradicao:
      'Valens\'s list (2nd c.) for Mars is the hardest in the catalogue: force, strife, lawsuits, anger — and also command, campaign, work with fire and iron, masonry. Ptolemy classes him as malefic through excessive dryness; Valens records the opposite when he is in his own sect and well placed — there he is a giver of good. Mars\'s vector in the source is action that cuts.',
    moderno:
      'Reading Mars as "drive and passion" is 20th-century vocabulary, from Rudhyar onwards. The source talks about iron, fire, handwork and command.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.) · Ptolemy, Tetrabiblos I.5',
  },
  jupiter: {
    prende:
      'The year makes room: the post somebody offers, the deal that unblocks, the paperwork that finally moves. It is also a year of children, of inheritance, and of signing on someone else\'s behalf.',
    curto: 'Jupiter pulls the subject towards whatever makes room.',
    tradicao:
      'Valens (2nd c.) sums Jupiter up as increase: begetting children, abundance of harvest, justice, offices, arbitrations, inheritance — "safe possession of goods", "release from bonds". Ptolemy classes him as benefic, of tempered force.',
    moderno:
      '"Luck" is a 20th-century shortcut. And one number reorders the conversation, measured in this base: Jupiter spends nearly a third of the time retrograde — if retrogradation were the disaster it is announced to be, the planet of luck would be out of order four months a year, every year.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.) · Ptolemy, Tetrabiblos I.5',
  },
  saturno: {
    prende:
      'A year of weight and of deadlines: what takes long, what demands a document, what only comes out with patience. And also a year of being handed a post — the key he gives is the key of whoever administers what belongs to others.',
    curto: 'Saturn pulls the subject towards what takes long and asks for a document.',
    tradicao:
      'Valens (2nd c.) makes Saturn the longest and darkest portrait in the catalogue — slowness, obstacle, debt, mourning — and calls him "the star of Nemesis". But the same Valens writes that Saturn "puts into one\'s hands great ranks and distinguished positions, supervisions, management of others\' property". Saturn hands out office, and the market almost never says so. Ptolemy classes him as malefic through excessive cold, with the same sect caveat that applies to Mars.',
    moderno:
      '"Saturn is the villain" is a caricature. And reading the Saturn return as a maturity crisis is 20th century: the thirty-year cycle is ancient (Valens already calls the thirtieth year a critical point), the psychological crisis is not.',
    fonte: 'Vettius Valens, Anthologiae I.1 (2nd c.) · Ptolemy, Tetrabiblos I.5',
  },
};

export const PACK = {
  idioma: 'en',
  signos: SIGNOS,
  planetas: PLANETAS,
  planetasNaFrase: PLANETAS_NA_FRASE,
  verbatim: VERBATIM,
  casas: CASAS,
  senhores: SENHORES,

  // The screen chrome (screens/ProfeccoesScreen.js) — same shape and the same
  // keys as the PT pack. The screen is a shop window: it writes nothing, it
  // only passes the `lang` through. `locale` is not prose: it is the tag Intl
  // uses to write the date of the year's turn in the right language.
  tela: {
    titulo: 'Profections',
    subtitulo: 'The subject of your year — and who holds the key',
    intro:
      'Every year of your life has a subject and a planet in charge of it. The count moves one sign per birthday: at twelve the wheel closes and returns to the start, which is why years twelve apart rhyme so much with each other. Here is where your wheel stopped this year — and where it stands right now, inside the month.',
    introDois:
      'It is the best documented predictive technique of the Hellenistic tradition, and it asks for very little: only your date of birth. With the hour and the city, the count starts running from the Ascendant, which is the canonical form; without them it runs from the Sun, which Ptolemy names in the same chapter. The screen always says which of the two was used.',
    carregando: 'Looking for your date of birth…',
    indisponivelTitulo: 'The count cannot start',
    botaoMapa: 'Fill it in on the Birth Chart',
    rotuloPontoDePartida: 'Where the count starts from',
    rotuloQuandoVira: 'When your year turns',
    rotuloCamadaMensal: 'The 28-day layer',
    rotuloCasasInteiras: 'The house system used',
    rotuloAPalavra: 'The word "profection"',
    rotuloTradicao: 'What the tradition says about the place and the lord',
    abrir: 'Open',
    fechar: 'Close',
    compartilhar: 'Share',
    copiado: 'Text copied — paste it wherever you like.',
    naoCopiou: 'Could not copy here — select the text and copy it.',
    marca: 'cosmicguide.cloud',
    locale: 'en-US',
  },

  moldes: {
    senhorDoAno: 'The one holding the key to the year is {planeta}.',
    senhorDoMes: 'For these 28 days the key is held by {planeta}.',
    tituloAno: 'Year {idade} · house {casa} · {signo}',
    tituloMes: 'Month {mes} of the year · house {casa} · {signo}',
    fonte: '{base} · {casa} · {senhor}',
    fonteMes: '{base} · {casa} · {senhor}',
    janela: 'from {inicio} to {fim}',
  },

  fonteBase: 'Ptolemy, Tetrabiblos IV.10 (2nd c.)',

  comoFunciona:
    'The arithmetic is a child\'s: for every year of life, the starting point of your chart moves one sign along. At 1 year old you are on the second sign; at 11, on the twelfth; at 12, back to the first. The sign where the count stops is the house of the year, and the planet that rules that sign is the Lord of the Year.',

  deOndeVem:
    'It is in Ptolemy, Tetrabiblos IV.10, the chapter "Of the Division of Times", 2nd century: setting out from each of the prorogatory places, in the order of the signs, one year to each sign, and taking the ruler of the last sign. Chris Brennan calls annual profection the most widespread time-lord technique of the Hellenistic tradition.',

  aPalavra:
    'The word "profection" is Latin, not Greek: profectio, departure, advance. The Hellenistic tradition had no name for the technique — searching for "profect" across Mark Riley\'s complete translation of Valens returns zero occurrences. Anyone looking for "profection" in the Greeks will not find it.',

  camadaMensal:
    'The same chapter gives the layer below: twenty-eight days to a sign, counted from the place that governs the year. That is thirteen changes inside a single year. And it gives a daily layer too, two and a third days to a sign — which this app does not use.',

  quandoViraOAno:
    'The year does not turn at midnight on your birthday: it turns when the Sun comes back to the exact degree it held at your birth. That instant slides almost six hours a year and, in a pre-leap year, it falls on the day before the calendar birthday. That is why the count here comes from the solar return and not from a difference of dates.',

  sistemaDeCasas:
    'The count runs on Whole Sign houses: house 1 is the entire sign of the starting point, house 2 is the next sign, and so on. It is the system the technique presupposes, and it is the same one this app\'s Birth Chart already uses.',

  origem: {
    ascendente: {
      rotulo: 'counted from your Ascendant',
      texto:
        'The count runs from your Ascendant, which is the canonical form of the technique. In Ptolemy\'s text, the prorogation from the horoscope — the Ascendant — covers events relating to the body and to journeys.',
    },
    sol: {
      rotulo: 'counted from your Sun',
      texto:
        'Without the hour and the city of birth there is no way to know your Ascendant, so the count runs from the Sun. And this is not a workaround: Ptolemy instructs you to prorogate from each of the prorogatory places, and names five — Ascendant, Lot of Fortune, Moon, Sun and Midheaven — each governing a different subject. The one from the Sun, in his text, covers dignities and glory.',
      glosa:
        'Gloss of the passage: the prorogation from the horoscope applies to matters of the body and to journeys; the one from the Lot of Fortune to matters of property; the one from the Moon to affections of the soul and to marriage; the one from the Sun to dignities and glory; the one from the midheaven to the other details of the conduct of life.',
    },
  },

  melhoraCom: {
    hora:
      'Your birth hour is missing. With it and the city, the same count starts running from the Ascendant — the canonical form, and the one Ptolemy ties to the body and to journeys. You can fill it in on the Birth Chart.',
    cidade:
      'Your birth city is missing. With it and the hour, the same count starts running from the Ascendant — the canonical form, and the one Ptolemy ties to the body and to journeys. You can fill it in on the Birth Chart.',
    ambos:
      'Your birth hour and city are missing. With both, the same count starts running from the Ascendant — the canonical form, and the one Ptolemy ties to the body and to journeys. You can fill them in on the Birth Chart.',
  },

  precisao: {
    exata:
      'With hour and city, the instant your year turns is worked out to the minute: it is the Sun returning to the exact degree of your birth.',
    meioDia:
      'Without the birth hour, the calculation uses noon — the guess that goes least wrong inside a day. The turn of the year may fall a few hours before or after what is shown here.',
  },

  indisponivel: {
    semData:
      'To count the years of this wheel the beginning is missing: your date of birth. You can fill it in on the Birth Chart, and the count appears straight away.',
    dataInvalida:
      'The stored birth date is not a valid calendar date, so the count cannot start. Fix it on the Birth Chart and this works again.',
    semEfemeride:
      'The sky table did not load on this device, and without it there is no way to know the exact hour your year turns. We would rather say so than invent a date.',
    antesDoNascimento:
      'The chosen date is earlier than your birth, and the count of years of life only begins there.',
  },

  rotulos: {
    titulo: 'Annual profection',
    tituloMensal: 'Monthly profection',
    idade: 'Year of life',
    casaDoAno: 'House of the year',
    signoDoAno: 'Sign of the year',
    senhorDoAno: 'Lord of the year',
    senhorDoMes: 'Lord of the month',
    casaDoMes: 'House of the month',
    signoDoMes: 'Sign of the month',
    nomeAntigo: 'Ancient name of the place',
    viradaDoAno: 'This year began on',
    proximaVirada: 'The next one begins on',
    inicioDoMes: 'This stretch began on',
    fimDoMes: 'The next stretch begins on',
    comoFunciona: 'How the count is made',
    deOndeVem: 'Where this comes from',
    oQueOModernoDiz: 'What the modern reading usually says',
    oQueMelhora: 'What improves with more data',
    naoAchado: 'What the research did not find',
    fontes: 'Sources',
    precisao: 'Precision',
    verbatim: 'In the original',
  },

  naoAchado: [
    'Paul of Alexandria, Eisagogika ch. 31, is pointed to by the secondary literature as the clearest exposition of the method. The research behind this base did not find the text in an accessible translation — the chapter attribution is second-hand.',
    'Dorotheus of Sidon, Carmen Astrologicum IV.1, is cited as the source for the Lord of the Year. The research behind this base did not verify the passage in the text: the Pingree and Dykes translations are under copyright.',
    'A Greek name for the technique: there is none. The Hellenistic tradition used the procedure without naming it, and the name that stuck is the later Latin profectio.',
  ],

  fontes: [
    {
      obra: 'Tetrabiblos IV.10, "Of the Division of Times"',
      autor: 'Claudius Ptolemy',
      seculo: '2nd c.',
      grau: 'primary source',
      nota: 'F. E. Robbins translation, Loeb Classical Library, 1940',
    },
    {
      obra: 'Tetrabiblos I.17 (the houses of the planets) and I.5 (benefics and malefics)',
      autor: 'Claudius Ptolemy',
      seculo: '2nd c.',
      grau: 'primary source',
      nota: 'the table of domiciles is what yields the Lord of the Year',
    },
    {
      obra: 'Mathesis II.XIX',
      autor: 'Julius Firmicus Maternus',
      seculo: '4th c.',
      grau: 'primary source',
      nota: 'Jean Rhys Bram translation; it is the source of the ancient names of the twelve places',
    },
    {
      obra: 'Anthologiae I.1 and Book II',
      autor: 'Vettius Valens',
      seculo: '2nd c.',
      grau: 'primary source',
      nota: 'complete translation by Mark T. Riley',
    },
    {
      obra: 'Eisagogika, ch. 24 and ch. 30',
      autor: 'Paul of Alexandria',
      seculo: '378 CE',
      grau: 'primary source',
      nota: 'the names of the places and the warning that the Midheaven is not the cusp of House 10',
    },
    {
      obra: 'Hellenistic Astrology: The Study of Fate and Fortune',
      autor: 'Chris Brennan',
      seculo: '2017',
      grau: 'modern scholarship',
      nota: 'work under copyright, used as a bibliographic reference; profection as the most widespread time-lord technique of the tradition',
    },
  ],

  base: [
    { arquivo: 'docs/tradicao/13-tecnicas-preditivas.md', locus: '§7 e §13.3' },
    { arquivo: 'docs/tradicao/12-as-doze-casas.md', locus: '§5' },
    { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§3' },
    { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§2.6' },
    { arquivo: 'docs/tradicao/16-oportunidades-de-conteudo.md', locus: 'oportunidade nº 6' },
  ],
};

export default PACK;
