// lib/traducoes/comoDecide.en.js
// The ENGLISH PACK for the "How this app decides" card — sibling of
// comoDecide.pt.js, same SHAPE: same keys, same fields, functions with the
// same signature. The engine lives in lib/comoDecide.js.
//
// Natural American app English, same register as lib/traducoes/seita.en.js.
// Every rule in the engine header applies here in full: hook first and receipt
// second, nothing about anyone's body, no promises, no percentages — not even
// to name the one the app refuses to use.
//
// What does NOT live here: work, author and date. Those are engine data, in
// canonical Portuguese, and they pass through traduzirAutor/traduzirQuando
// before they reach a screen. The WORK never translates (De Agri Cultura stays
// De Agri Cultura), the AUTHOR gets the established English form (Cato the
// Elder), the DATE gets the English form (2nd c. BC).

function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} and ${itens[itens.length - 1]}`;
}

const ABERTURA = {
  titulo: 'How this app decides',
  chamada:
    'You read that today is not the day to send that text and, underneath it, the question sits there: where did that come from? ' +
    'From a calculation anyone can check, or from a sentence that fits any person on any given Tuesday?',
  explicacao:
    'This screen answers that, screen by screen, by pulling apart three things that usually arrive mixed together.' +
    '\n\n' +
    'What the app CALCULATED: planet positions, Moon phase, exact instants. Those are numbers, checkable against any ephemeris, and if one is wrong it is simply wrong — no interpretation saves it.' +
    '\n\n' +
    'What the app READ: the tradition, always with work, author and century. Somebody wrote that, somewhere, at some point. It can be beautiful and it can be old, and it still is not the same kind of thing as the calculation.' +
    '\n\n' +
    "What is the APP'S OWN READING: the way of saying it in plain English today, the order of the screens, what gets in and what stays out. That part is ours, and it is signed." +
    '\n\n' +
    'When the calculation and the tradition disagree, the source wins, and the difference gets written down instead of hidden. When the research never found where something came from, that is written down too.',
};

const ROTULOS = {
  calculado: 'What the app calculated',
  tradicao: 'What the app read — and whose it is',
  leituraDoApp: 'What is our own choice',
  naoFaz: 'What the app refuses to do',
  convencoes: 'What holds across the whole app',
  decisoes: 'Screen by screen',
  fontes: 'Where it is written',
};

// ---------------------------------------------------------------------------
// THE SCREEN CHROME — screens/ComoDecideScreen.js
// ---------------------------------------------------------------------------
// Same shape and same keys as the Portuguese pack: button labels, section
// headings and the copy notice. They live HERE, not in lib/i18n.js, because the
// screen is a display case: it writes nothing and picks no language — it reads
// `cardComoDecide(lang).idioma`, the language the engine already resolved.
//
// `textoCompartilhavel` lives in the pack for the same reason: the text that
// travels through someone else's WhatsApp is content, and content is not born
// inside a component. It ALWAYS closes on the link, as in lib/idadeReal.js.
const MARCA = 'cosmicguide.cloud';

const CHROME = {
  subtitulo: 'What is math, what is reading, and what the app refuses to do',
  ondeAparece: 'WHERE IT SHOWS UP',
  abrir: 'See how this part is decided',
  fechar: 'Close',
  pendencia: 'NO FIRST-HAND SOURCE',
  verbatim: 'IN THE WORDS OF THE SOURCE',
  compartilhar: 'Share',
  copiado: 'Text copied — paste it anywhere.',
  naoCopiou: 'Could not copy here — select the text and copy it.',
  bibliografiaNota:
    'Each work appears once, in the order the app uses it. Whatever has no first-hand edition read yet stays out of this list and is written inside the item itself.',
  rodape:
    'If you find a claim on this screen with no work, author and century behind it, that one is on us — and it is worth writing to tell us.',
  marca: MARCA,
  textoCompartilhavel: (d) =>
    [
      `${ABERTURA.titulo} — ${d.nome}`,
      '',
      d.chamada,
      '',
      `${ROTULOS.calculado}:`,
      d.calculado.map((x) => `• ${x.texto}`).join('\n'),
      '',
      `${ROTULOS.tradicao}:`,
      d.tradicao.map((x) => `• ${x.texto}\n  ${x.recibo}`).join('\n'),
      '',
      `${ROTULOS.leituraDoApp}:`,
      d.leituraDoApp.map((x) => `• ${x.texto}`).join('\n'),
      '',
      `${ROTULOS.naoFaz}:`,
      d.naoFaz.map((x) => `• ${x.texto}`).join('\n'),
      '',
      MARCA,
    ].join('\n'),
};

const EXIGENCIA = {
  rotulos: {
    data: 'your birth date',
    hora: 'your birth time',
    cidade: 'your birth city',
  },
  precisa: (nomes) => `This calculation needs ${lista(nomes)}.`,
  falta: (nomes) => `${lista(nomes)} is missing, so this calculation cannot run. The app shows what is missing instead of a plausible-looking result.`,
  pronto: 'With what you have already entered, this calculation runs.',
  comoResolver: 'The field lives in the Birth Chart.',
};

// The date arrives ALREADY punctuated from the engine (see reciboDaFonte):
// "séc. II d.C." already ends in a period and "2nd c. AD" would not.
const RECIBO = ({ autor, obra, quando }) => `Who wrote this: ${autor}, ${obra} — ${quando}`;
const RECIBO_SEM_AUTOR = ({ obra, quando }) => `Where it is written: ${obra} — ${quando} Work with no known author.`;
const SEM_FONTE =
  'No primary edition read in this research base. The information is in the survey, the first-hand source has not been checked yet — and until it is, it carries less weight than everything else on this screen.';

// Complement to lib/traducoes/datacao.js, which does not know these four yet.
// The engine sets the order: datacao.js rules, this only fills the gaps.
const AUTORES = {
  'Manílio': 'Manilius',
  'Artemidoro': 'Artemidorus',
  'Dião Cássio': 'Cassius Dio',
  'Aristóteles': 'Aristotle',
};

// The quotations: `texto` is Robbins's English (Loeb/Harvard, 1940) and
// Cary's (Loeb), IDENTICAL across the three packs. What changes per language
// is the paraphrase — signed by the app, never inside quotation marks — and
// the language of the locus.
const VERBATIM = {
  ptolomeuZodiaco: {
    texto: 'and from no other source',
    parafrase:
      'The beginnings of the signs are counted from the equinoxes and the solstices — and from nowhere else. The line is short and it is categorical: counting any other way is counting something else.',
    locus: 'Ptolemy, Tetrabiblos I.22, trans. Robbins, 1940',
  },
  ptolomeuAversao: {
    texto:
      'if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions',
    parafrase:
      'Signs that are averse to each other, or opposite, make for the deepest bad blood and the longest fights. This is the line that keeps the app from putting opposition at the top of the scale — in the source it sits at the bottom, next to aversion.',
    locus: 'Ptolemy, Tetrabiblos IV.7, trans. Robbins, 1940',
  },
  dioCassio: {
    texto:
      'The custom, however, of referring the days to the seven stars called planets was instituted by the Egyptians, but is now found among all mankind, though its adoption has been comparatively recent',
    parafrase:
      'The primary source for the planetary week says the custom is recent, and adds that the ancient Greeks did not know it. Calling the week of the planets immemorial contradicts the very text people cite for it.',
    locus: 'Cassius Dio, Historia Romana 37.18, trans. Cary',
  },
};

const CONVENCOES = {
  zodiaco: {
    nome: 'The zodiac here is tropical, counted from the seasons',
    chamada:
      'One day someone tells you that "actually" you are the sign before yours, and the conversation ends in a draw because nobody knows where either version comes from. Both exist, both have an owner, and the distance between them is measurable.',
    texto:
      'The app counts the signs from the equinoxes and solstices: the point where the Sun crosses the celestial equator in March opens Aries, and from there on in thirty-degree steps. That is the tropical zodiac, and the source is categorical about the starting point.' +
      '\n\n' +
      "Indian astrology counts from the stars instead, correcting for the precession of the equinoxes — the slow drift of the Earth's axis, about one degree every seventy years. That is why, for most people, the Vedic sign is the one before the Western one. Nobody is wrong: they are two starting points, each coherent on its own terms, and the gap between them is known astronomy. The text that records the meeting of the two traditions is a Greek-to-Sanskrit translation made in the 2nd century.",
  },
  efemeride: {
    nome: 'The math comes from an ephemeris, never from a date table',
    chamada:
      'People born on October 23rd spend their lives being Libra on one site and Scorpio on the next. This is not a matter of opinion: the border between the two is an instant, and an instant does not fit in a calendar table.',
    texto:
      'The app computes the longitude of the Sun for the minute you were born and sees which side of the border it landed on. It used to do what almost everyone does: a fixed table of dates. Measured across 1950 to 2030, that table was wrong on 293 days out of 29,585 — and on October 23rd it was wrong in 44 of the 81 years, always at the turn, always for the people who care most about the answer.' +
      '\n\n' +
      'The rule that came out of it holds across the app: no statement about the sky comes from a table, it comes from a calculation. And when the calculation cannot run — no date, no time, no city — the app says so and says where to enter it. A plausible sky is an invented sky.',
  },
  regencias: {
    nome: 'Rulerships are the seven visible to the naked eye',
    chamada:
      'You read here that Scorpio is ruled by Mars, you search online and Pluto is everywhere. It looks like the app got it wrong. It is the other way around, and one date settles the argument.',
    texto:
      'The table the app uses is the old one: Mars for Aries and Scorpio, Venus for Taurus and Libra, Mercury for Gemini and Virgo, the Moon for Cancer, the Sun for Leo, Jupiter for Sagittarius and Pisces, Saturn for Capricorn and Aquarius. And it is not memorized: each line is derived from how far each planet can ever get from the Sun, which is something you can watch in the sky.' +
      '\n\n' +
      'Uranus was discovered in 1781, Neptune in 1846, Pluto in 1930. The modern rulerships attached to them are a 19th and 20th century layer, and this research never found who proposed each one, or when. Until somebody does, they stay out of the main block — and the absence is stated, which is not the same as pretending they do not exist.',
  },
  casas: {
    nome: 'The houses are Whole Sign houses',
    chamada:
      'You open your chart here and your friend opens hers in another app, and half the planets sit in different houses. Nobody miscalculated: there are two ways to slice the same wheel, and most apps never say which one they use.',
    texto:
      'Here House 1 is the entire sign of the Ascendant, zero to thirty degrees, and the next sign is House 2. It is the oldest system that survived: a 4th century handbook states the rule twelve times in a row, with no room for doubt, and a contemporary of its author runs the same count to find the place of the father. What is modern is the English name, whole sign — coined in the 1990s.' +
      '\n\n' +
      'The app skips Placidus for a practical reason on top of the historical one: near the poles that system has no mathematical definition, and this app gets opened all over the world. The gap between the two was measured across twenty thousand charts: about half the planets change house, and practically every chart changes in at least one. That is why the screen prints the name of the system next to the houses.',
  },
  semNota: {
    nome: 'There is no score, and there will not be one',
    chamada:
      'Every couples app spits out a two-digit number with a full bar next to it. Nobody explains where it comes from. The answer is that it comes from nowhere.',
    texto:
      'The app had that and killed it. Compatibility ran on ten fixed texts for all 144 possible pairs, and the scores all landed between seventy-four and ninety-two: everyone matched everyone, and opposition — the hardest aspect there is — got the highest score on the table. The horoscope had four bars (love, work, money and one more) drawn by hashing the date. Neither number came from any calculation at all.' +
      '\n\n' +
      "In their place came the tradition's own vocabulary: the relationship between two signs has a name — trine, sextile, square, opposition, aversion — and it has an order, because the source ranks the configurations in four steps. Name and rank are what the source gives. A two-digit number is what it does not give, and drawing one reads as a measurement no matter what caption sits underneath.",
  },
  ia: {
    nome: 'Where artificial intelligence comes in, and what it cannot do',
    chamada:
      'Part of what you read here is written on the spot by a language model: the chat, the dream reading, the photo readings. Worth knowing when — because it changes what to expect from the text.',
    texto:
      'The sky is never the model\'s job. Positions, phases and aspects are computed by the app, on your device, from an ephemeris. When the conversation touches the sky, the app ships along a block with what it already calculated — your sign, today\'s Moon sign, the real aspects between today\'s sky and your chart — and the instruction is blunt: never state a position, house, aspect or retrograde that is not in that block. If the data is not there, the model asks for your chart instead of filling the gap.' +
      '\n\n' +
      'The other rules it gets: no percentages, of anything; never put a symbol into a dream that you did not write; on photos, describe what is visible before interpreting; and nothing about the body, under any circumstance. If a sentence would still be true with you swapped for anyone else, it has orders to delete it and write again.',
  },
};

const FEATURES = {
  horoscopo: {
    nome: 'Daily horoscope',
    tela: 'Horoscope',
    chamada:
      'You know the horoscope that says "your intuition is sharper today". It fits you, your boss and your ex, on any day of the year. The test is simple: swap the sign and read it again. If it still fits, it never said anything.',
    textos: {
      regente:
        'Where the planet that rules your sign is today: which sign it landed in, what dignity it has there, whether it is retrograde. Mars changes sign every six weeks — which is why the Aries text today is not the Aries text a month from now.',
      lua:
        'Which sign the Moon is in right now and what relationship that makes with your sign. She changes sign every two days and change, and on the same day the twelve signs get different relationships with the same Moon.',
      mudanca:
        'What changed since yesterday: the Moon switched signs, the lunar quarter turned, the ruler went in or out of retrograde. On days when nothing big changed, the text says it is a small day instead of manufacturing a headline.',
      domicilios:
        'Which planet rules which sign. The table is not memorized: each line is derived from how far that planet can ever get from the Sun.',
      dignidades:
        'Exaltation and fall — plus the word "peregrine", which is a planet with no dignity at all where it stands. It is the most common case of all, and the screen does not frame it as bad news.',
      signoInteiro:
        'The relationship between two signs is counted by whole sign, with no orb in degrees. That is how the source does the math, and it is what lets the app talk about aspects knowing only the sign.',
      regentePrimeiro:
        "Opening with your sign's ruler rather than with the Sun is a reading order that comes from the tradition itself — and it is what makes Aries and Gemini read differently on the same day.",
      quartos:
        'The four stretches of the lunar month, described as qualities of the air: moist, hot, dry, cold. That was weather talk, not people talk.',
      ordem:
        'The order of the blocks and the way of saying all this in plain conversation. When the only new fact of the day is the weekday planet, it drops out of the top line — it stays on screen, with the same honest text, it just does not take the headline on a day when it admits it is not one.',
      ancora:
        "The sky of the day is anchored to noon, universal time. Without that anchor the Home screen at eleven at night would tell a different story from the noon notification, and both would be calling themselves \"today\".",
      semBarras:
        'It does not score you. It used to: four bars — love, work, money and a fourth one that has no business existing in an astrology app — with ten fixed sets of numbers picked by the date and drawn like measurements. They came from no calculation at all and were removed, rather than given a footnote.',
      semCeuInventado:
        'It does not state a Moon phase or a planet position it has not computed. The canned line "the waning Moon favored closing cycles" went out on waxing Moon days, with the app\'s own calendar showing the right phase two screens away.',
    },
  },
  mapa: {
    nome: 'Birth Chart',
    tela: 'Birth Chart',
    chamada:
      'Some people find out at thirty that they spent their whole life thinking they were one sign and they are another. It is not bad memory: the sign turns at an instant, and the instant depends on the year, the hour and the place.',
    textos: {
      sol: "The Sun sign from the Sun's real longitude at the minute you were born — not from a calendar date range.",
      lua: 'The Moon sign at that same instant, with the time zone of the place. She moves thirteen degrees a day, so a few hours already change the answer.',
      ascendente:
        'The Ascendant, sign and degree. It needs time and city: within two hours it has already changed sign, and the horizon is different at every point on the planet.',
      casas: 'The twelve houses, one per sign, counted from the sign of the Ascendant.',
      planetas:
        'The ten planets by ecliptic longitude, all in the same frame, and the aspects between them. With no birth time the math runs at noon: for the slow planets that approximation is honest, for the Ascendant and the houses it is not — which is why those two disappear from the screen instead of showing up approximate.',
      zodiaco: 'Signs counted from the equinoxes and solstices, which is what makes the Sun sign an instant rather than a date.',
      casasInteiras:
        'House 1 is the whole sign of the Ascendant. The most explicit handbook that survived from antiquity states that rule twelve times in a row, once per house.',
      firmico:
        'And a contemporary of his runs the same count another way, to find the place of the father in the chart: the sign where the count stops is the place, not some thirty-degree patch.',
      domicilios: 'The planet that rules each sign, which is what the screen uses to say whose house it is.',
      rotuloDoSistema:
        'The screen prints the name of the system next to the houses. It looks like a nerd detail, and it is what prevents the dullest argument there is: comparing two apps without knowing they slice the wheel differently.',
      semPlacidus:
        'Placidus has no mathematical definition near the poles, and this app gets opened everywhere. Whole Sign never breaks at any latitude — and it happens to also be the oldest system.',
      semHoraSemAscendente:
        'With no birth time, the Ascendant and the houses vanish from the screen, with the reason printed. Half an hour of difference changes the Ascendant sign in plenty of births, and assuming noon here would be a coin flip.',
      casaSemSignificado:
        'The twelve cells say "House N — sign" and nothing more. The app still has no house meanings with a source read end to end, and it prefers the dry cell to the most common invention in the field, which is deducing a house meaning from the sign that matches its number.',
    },
  },
  ceu: {
    nome: "Today's sky for you",
    tela: 'Home',
    chamada:
      'Two friends with the same sign open the app on the same day and read different things. This is where the reading stops being about your sign and starts being about your birth.',
    textos: {
      cruzamento:
        "Today's ten planets against the ten from the day you were born, aspect by aspect. No canned sentences: what shows up on screen is what the math found.",
      orbe:
        'Orbs are scaled by speed: wide for the Moon, tight for the slow ones. Without that, a Pluto transit sat at the top of a screen called "today" for months — across four test births, the same sentence showed up in July, August and October.',
      tresMaisApertados: 'Out of everything the math found, the three tightest aspects. The rest exists and stays out for room, not for convenience.',
      quatroAspectos:
        'There are four aspects, and the angles come from musical ratios applied to the semicircle: a half, a third, three to two, four to three.',
      conjuncao:
        'And conjunction is not one of them: two planets in the same place fall into a separate category, bodily application. Nearly every app calls it an aspect; the source does not.',
      rapidoELento:
        "Calling a fast transit the news of the day and a slow one a chapter is our way of organizing the screen. The practice does draw that line, but in other words — these two lines are the app's.",
      semMapaSemTela:
        'With no birth date this screen does not exist. The app does not swap your chart for "the sky of your sign" just to have something to show: that would be manufacturing a birth that is not yours.',
    },
  },
  taro: {
    nome: 'Tarot',
    tela: 'Tarot',
    chamada:
      'The card that came up did not come from the sky or from your unconscious: it came from a shuffle. Saying so ruins nothing — the deck is from 1911, and being ancient was never the point of it.',
    textos: {
      sorteio:
        'No sky enters here at all. The 78 cards get shuffled, three come out, and the orientation of each one — upright or reversed — is a coin flip. No planet position takes part in the choice, and the app does not pretend otherwise.',
      waite:
        'The deck is the Rider-Waite-Smith, drawn by Pamela Colman Smith under Waite\'s direction. On eleven cards the app shows his list of meanings in English, word for word: translating a quotation falsifies it.',
      goldenDawn:
        'The correspondence between each card and a planet, sign and decan comes from a late 19th century English order, and the screen prints its name. There is no such thing as "the" astrological attribution of tarot: there are at least three, and they contradict each other.',
      gebelin:
        'Reading tarot as an oracle starts with an essay announcing a lost Egyptian book — written forty years before anyone could read a hieroglyph. Tarot cartomancy is a little over two centuries old, not four millennia, and Waite himself debunks the Egypt story in his own book.',
      posicoes: 'The three positions in the spread — what stayed, what is here, what is coming — and the decision to always show all three together.',
      textoDaCarta:
        'The text for each card in plain English. A card carries four fixed data points (arcanum, letter, path, attribution) and the rest is our writing, built so that changing the card changes the sentence.',
      semEgito: 'The app never said Egypt and it is not going to. Saying 1781 is more interesting, and it has the advantage of being true.',
      semFuturo: 'It does not state the future. A shuffled card does not know your next month, and the app does not lend it authority it never had.',
    },
  },
  compatibilidade: {
    nome: 'Compatibility',
    tela: 'Compatibility',
    chamada:
      '"We yell at each other and make up ten minutes later" and "we go three days without speaking" are not the same couple. Neither one fits inside a two-digit number.',
    textos: {
      distancia:
        'The distance between the two signs on the wheel, counted in whole signs: zero to six. It is the only calculation on this screen, and it is the same one the source makes — it counts signs, not degrees.',
      quatroAspectos:
        'Four aspects, and only four: opposition, trine, square, sextile. And the criterion for calling them harmonious is not the element, it is the gender of the sign — fire getting along with air is a consequence of that, not the cause.',
      comandantes:
        'Commanding and obeying signs: pairs equidistant from the equinoctial point. The relationship has a direction — one commands, the other obeys — and it is the category nobody in this field implements.',
      seVeem: 'Signs that behold each other, or of equal power: pairs equidistant from the solstitial point. Cancer and Capricorn have no partner here.',
      aversao:
        'And averse signs: the ones with none of the familiarities above, one or five signs apart. Checked pair by pair, that is 48 of the 144 combinations — a third of the grid simply does not relate. A low score does not sell, which is why almost nobody mentions it.',
      escala:
        'Applied to two people, the same work ranks the configurations in four steps. Opposition is not at the top: it sits at the bottom, next to aversion — and the old version of the app gave it the highest score on the board.',
      traducaoParaCasal:
        'Turning "square" into the fight in the kitchen, the bed, money and jealousy is the app\'s work. The name of the relationship and the rank of the steps come from the source, and neither one gets flipped to make the reading friendlier.',
      soSignoSolar:
        'The screen compares two Sun signs and says so out loud. Real synastry compares two full charts, with Moon, Venus, Mars and Ascendant; a Sun sign is one slice of that.',
      semNota: 'No percentage, no score, no bar. If a number ever comes back, it will not be allowed to contradict the relationship printed next to it.',
      semEsconderAversao:
        'And no swapping "aversion" for a friendlier synonym. A third of the pairs do not look at each other in the source, and that is exactly the part users already suspected on their own.',
    },
  },
  lua: {
    nome: 'Moon Calendar',
    tela: 'Moon Calendar',
    chamada:
      'You look out the window: the Moon is half lit. The app says "First Quarter". The half is a fact; the name is where somebody decided to cut the cycle — and that somebody has a name and a date.',
    textos: {
      elongacao: 'The longitude difference between the Moon and the Sun, right now, in degrees. That number decides the phase, and it is checkable in any ephemeris.',
      instanteExato:
        'The exact instant of the next New Moon and the next Full Moon, found by bisection. A phase label and an exact instant are different things: on the day of the full Moon, fullness happens at a specific hour.',
      quatroQuartos: 'The ancient division of the lunar month is in four, and the qualities it describes are weather: moisture, heat, dryness, cold.',
      hesiodo:
        'The month counted day by day, first to thirtieth, with a good day and a bad day for each kind of work — that one really is archaic, and it is seven centuries older than birth-chart astrology.',
      oitoFases:
        'The eight phases with names and personality readings are 20th century. The eightfold frame is good and the app uses it; it just is not ancient, and the two dates are eighteen hundred years apart.',
      nomesDeLua:
        'The full-moon names — Wolf Moon, Strawberry Moon — came out of a northern-hemisphere farming almanac. "Snow Moon" in February describes winter up there; down here February is the peak of summer.',
      colheita:
        'And the reputation of the full Moon as harvest time inverts the Roman source: what gets cut, harvested and sheared belongs to the waning Moon. On the full Moon, what ancient farming called for was sowing beans.',
      oitoFatias:
        'Slicing the cycle into eight forty-five-degree wedges is a modern calendar convention, and it works for naming what you see in the sky. The app uses it and says that it does.',
      semMilenar: 'It does not call the eight phases ancient. The ancient frame is the four quarters, and it is on the next screen over, with the name of the man who wrote it.',
      semInstrucao:
        'It does not tell you to do anything because of the phase. It describes what Roman farming did, in the past tense, with the name of whoever wrote it down — "they planted" is a record, "plant now" would be advice.',
    },
  },
  calendario: {
    nome: 'Cosmic Calendar',
    tela: 'Cosmic Calendar',
    chamada:
      'Eclipse, retrograde, supermoon: it all lands in your feed at once, always in capital letters and never with a date. Here it runs the other way — date and hour first, then the name, and the age of the name right beside it.',
    textos: {
      eventos:
        "The month's real events: the four Moon phases, the Sun's entry into each sign (which is where equinoxes and solstices fall), the start and end of Mercury retrograde, and the exact aspects between the fast planets.",
      bisseccao:
        'Every instant is found by bisection over the ephemeris, not copied from a list. That is why the app shows an hour and a minute instead of "around the 15th".',
      ingressos: "The Sun's entry into the cardinal signs is the starting point of the tropical zodiac itself — it is not a calendar coincidence.",
      conjuncao:
        'Conjunction shows up labeled as bodily application, not as an aspect: in the source there are four aspects, and two planets in the same place are not looking at each other, they are together.',
      quartos: 'Plus the quarters of the Moon, which is the ancient frame for the lunar month, with the weather qualities it described.',
      reciboPorEvento:
        'Every event comes with a paragraph in plain conversation and the receipt right below it. The order is always that one: first what it is, then who wrote it.',
      semFonteAntiga:
        'Where no ancient source exists, the text says exactly that: contemporary popular practice, no ancient source located. Inventing antiquity is the two-thousand-year-old pattern this app exists in order not to repeat.',
      semAgenda:
        'No sky event gets turned into a calendar instruction. No "best day to", no "make the most of this energy". The sky is measured; what happens to your week is not ours to declare.',
    },
  },
  rituais: {
    nome: 'Rituals',
    tela: 'Rituals',
    chamada:
      'Lighting a candle and writing three sentences on a scrap of paper does not move the sky. It moves what you do in the ten minutes that follow — and that is what this tradition was always about, long before it became a post.',
    textos: {
      faseEDia:
        'The current Moon phase and the day of the week. A ritual that asks for a waning Moon on a Friday only shows up when both line up; when only one does, the screen says which one instead of faking a perfect fit.',
      semEfemeride:
        'If the ephemeris is unavailable, the phase drops out of the match and what remains are the rituals that depend only on the weekday — a weekday is calendar arithmetic and stays true with no sky at all.',
      diasPlanetarios:
        'The days of the week named after planets. And the primary source says the custom was new when he was writing, which is the opposite of what usually gets repeated.',
      qualidades:
        'The qualities of the seven planets — to warm, to cool, to dry, to moisten. They are physical, and in our sentences the planet is always the subject: the tradition assigns cooling to Saturn, never "Saturn cools you down".',
      lavoura: 'Waxing and waning in Roman farming: what got cut, harvested and sheared went on the waning Moon, and the text says it took less damage that way.',
      catao: 'Two centuries earlier, the same custom: fig, apple, olive, pear and vine were planted on the dark of the Moon, in the afternoon.',
      columela: 'And the exception that blocks the easy generalization: beans were sown on the eve of the full Moon, or on the day itself.',
      vinteEUm:
        'The twenty-one rituals, the five fields in each one (intention, materials, step by step, best moment, care) and the choice of what gets in. The writing is ours.',
      semFonteAntiga:
        'Where there is no ancient source, the field says so: contemporary popular practice, no ancient source located. Half the library is that, and it is stated.',
      semPromessa:
        'No ritual promises a result. The text describes what you do — write three sentences, read them out loud, put out the candle — and stops there.',
      semCorpo:
        'And none of them promises an effect on the reader\'s body. The difference between the right text and the forbidden one is a preposition: "write three sentences" describes; "write three sentences in order to" already promises.',
    },
  },
  sonhos: {
    nome: 'Dreams',
    tela: 'Dreams',
    chamada:
      'You wake up with the scene still stuck to you: the door that would not open, the person who should not have been there. The first impulse is to search "what does dreaming about a door mean" — and that is the exact moment it turns into a fortune cookie.',
    textos: {
      semCeu:
        'No sky on this screen. What goes into the reading is what you wrote, in your own words, plus your earlier dreams when there are any.',
      especies:
        'The question that comes before interpreting: does this dream merely mirror your day — hunger, fear, what happened yesterday — or is it saying one thing by means of another? The distinction comes from the largest dream handbook that survived antiquity, and it is what separates a method from a dictionary.',
      quemSonhou:
        'And the demand that comes with it: before interpreting you have to know whose dream it is — occupation, situation, age. The same symbol does not say the same thing to two different people, and that is precisely what a symbol dictionary cannot do.',
      regrasDoModelo:
        'The text is written by a language model on the server, under blunt rules: list first the elements YOU wrote; never introduce a symbol that is not in the account — if the dream has no water, nobody talks about water; point at what was out of place; name the recurring motif only when it really is in the earlier dreams; and close with a question that fits this dream and no other. If the account is two lines long, it asks for one detail instead of inventing a dream.',
      camadaModerna:
        'The second layer — the dream as a counterweight to the waking attitude, the figures as parts of the dreamer — is a 20th century reading, and the app names it as modern instead of lending it the age of the ancient handbook.',
      semDiagnostico: 'It is not a diagnosis and it is not a prediction. A dream does not announce your next month, and this screen does not pretend it does.',
      semTerceiro:
        'And it does not state what the other person in the dream feels, thinks or is about to do. That figure is material from your dream, not the real person asleep across town.',
    },
  },
  corpo: {
    nome: 'The body and the signs',
    tela: 'Zodiac Man',
    chamada:
      'You have seen the drawing: the figure with the twelve signs spread over the body, Aries at the head, Leo at the heart. Half of it is swapped around — and you can prove it with the poem it came from.',
    textos: {
      luaAgora:
        'Which sign the Moon is in right now and what time she moves on. That was the clock of the old practice: every two and a half days the region changed, and the bedside almanac was there to look it up.',
      manilio:
        'The list of the twelve comes from a 1st century astronomical poem. And in it Leo is not the heart — it is the flanks and shoulder blades; Libra is not the kidneys — it is the buttocks. The version going around today swapped both.',
      naoEPtolomeu:
        'And it is not in the Tetrabiblos, the way nearly every website claims: the list there is of planets, not of the twelve signs. Crediting the list to the wrong author is the kind of mistake that survives by copying.',
      culpeper:
        'The herbal layer comes from a 17th century English herbal, and his sentences appear in English, untranslated — because what is being shown is what the man wrote, not what we think he meant.',
      historiaNaoConselho:
        'The screen is about a chapter of ancient medical astrology, and the choice to tell it as history — who wrote it, when, and what changed along the way — is ours. The subject is the drawing, not you.',
      semCorpo:
        'No sentence tells you to do anything with your body. Everything in the past tense and with an owner: "the medieval tradition associated", never "your weak point is". Nothing here may lead anyone to put off seeing a doctor.',
    },
  },
  fotos: {
    nome: 'Photo readings: hand, face, foot and moles',
    tela: 'Readings',
    chamada:
      'You photograph your palm under the kitchen light expecting to see your wedding date. You do not — and the reason is more interesting than the photo.',
    textos: {
      semConta:
        'There is no calculation here at all. The photo goes to the server, a model describes what is visible and only then interprets. If the photo does not show what it needs, the reading says so instead of inventing a hand.',
      quiromanciaModerna:
        'Palmistry with mounts, hand types and a marriage line is modern: it starts in 1839 and gets organized at the end of the 19th century, with its own society in London. The "Aristotle" text that opens half the manuals is not among his canonical works.',
      benham:
        'The manual that fixed the system as it circulates today is from 1900, and its title already announces the ambition of the period: scientific hand reading. Knowing the date keeps the early 20th century from being mistaken for antiquity.',
      linhaDaVida:
        'Tying the length of a line to lifespan is the oldest documented claim in this whole family of practices — it sits in a 4th century BC work of natural history. The app keeps the ban on reading lifespan there, and swaps the justification: it is not a recent folk myth, it is the opposite, and it stays banned.',
      rostoEPe:
        'The face is read through Chinese physiognomy and the foot through the Indian samudrika tradition, and the screen prints both names. But the size of the backing has to be stated: the samudrika corpus runs to hundreds of manuscripts, most of them anonymous, and this research base has read no primary edition of either tradition. Saying "samudrika says X" is citing a corpus, not a work.',
      nomeiaATradicao:
        'Naming the tradition on screen instead of saying "energy reading" is our choice. A name has an address; energy does not.',
      descreveAntes:
        'The instruction forces the model to describe before interpreting — which part of the body is in frame, the lighting, what is sharp. That is what keeps a reading from discussing a line the photo never showed.',
      semPele:
        'Nothing about your skin: not color, not border, not size, not change in a mole. That belongs to a dermatologist, and the model is instructed to say so plainly if anyone asks. The reading is about position, and that is all.',
      semTempoDeVida: 'And nothing about lifespan, in any of the four readings. It is the oldest line in the tradition and it is the first one the app cuts.',
    },
  },
  cafe: {
    nome: 'Coffee grounds',
    tela: 'Coffee',
    chamada:
      'The cup gets flipped onto the saucer, the grounds run down, and somebody always says the whole thing is ancient. The arithmetic does not work, and it is easy arithmetic: the practice cannot be older than the drink.',
    textos: {
      semConta: 'No calculation and no sky: it is a photo, a description and a reading. What the screen can offer is the historical backing, and that backing is short and dated.',
      manual1742:
        'Reading grounds shows up in print in Europe in an anonymous thirty-one-page booklet from 1742 — the oldest this survey located, reviewed in a journal of the same year.',
      dicionarioDeSalao:
        'And the symbol dictionary everyone knows — a snake is enmity, a house is a move — is British parlour entertainment from the end of the 19th century, consolidated in a popular book in the 1920s.',
      istambul:
        'The coffee houses of Istanbul open around 1555, and that date is what topples the "ancient" label: nobody reads coffee grounds before there is coffee. The chronology is solid in the survey, but what was read first-hand here are the 1742 booklet and the symbol book.',
      geografiaDaXicara:
        'The geography of the cup the app uses — the handle is the person, clockwise is time, the rim is what is near and the bottom is what is far — is the convention of parlour tasseography. It is the one that exists, and the app says that is what it is.',
      semNomeSemData:
        'It gives no names of people and no dates of events. Grounds are a shape at the bottom of a cup; the rest is conversation, and good conversation does not need to fake precision.',
    },
  },
  chat: {
    nome: 'The assistant',
    tela: 'Chat',
    chamada:
      'You type "is he coming back?" at two in the morning. What comes back is neither yes nor no — and it is worth knowing why before assuming the app is dodging.',
    textos: {
      contexto:
        "What the app calculated and ships along with the conversation: your sign, today's Moon sign and phase, and the real aspects between today's sky and your chart. None of that is written by the model — it arrives finished, from math run on your device.",
      semDadoSemAfirmacao:
        'And what was not calculated does not get in. If your chart is empty, that part of the block arrives empty and the assistant has orders to ask for the chart instead of inferring it.',
      vocabulario:
        'The vocabulary it is allowed to use is the citable one: elements and modalities of the signs — cardinal starts, fixed sustains, mutable adapts — and the four aspects by angle.',
      qualidades: 'Plus the physical qualities of the seven planets, always with the planet as the subject of the sentence.',
      regraDura:
        'The bluntest rule in the system: never state a position, house, aspect or retrograde that is not in the context block. Anyone who knows astrology checks the ephemeris in five seconds, and does not come back.',
      testeDoBarnum:
        'And the test it runs before answering: if the sentence would still be true with you swapped for anyone else, delete it and write again, anchored in something concrete.',
      semBaralho:
        'It has no deck. It never says it drew, pulled or turned a card — the one who draws is you, on the Tarot screen. If you tell it your spread, it talks about those cards and only those.',
      semNota: 'It gives no percentage for anything, compatibility included. And it does not talk about the body, under any circumstance.',
    },
  },
};

export const PACK = {
  idioma: 'en',
  tela: 'How this app decides',
  abertura: ABERTURA,
  chrome: CHROME,
  rotulos: ROTULOS,
  exigencia: EXIGENCIA,
  recibo: RECIBO,
  reciboSemAutor: RECIBO_SEM_AUTOR,
  semFonte: SEM_FONTE,
  autores: AUTORES,
  verbatim: VERBATIM,
  convencoes: CONVENCOES,
  features: FEATURES,
};

export default PACK;
