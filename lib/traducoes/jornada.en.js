// lib/traducoes/jornada.en.js
// TEXT PACK for the Guided Journey in natural US-app ENGLISH.
//
// Rules of this file (the same as PT, see the header of lib/jornada.js):
//   · translation of MEANING, not word-for-word — hook first, receipt last;
//   · NEVER translated: work titles and loci (Tetrabiblos I.8, Naturalis
//     Historia XVIII.321), Latin verbatims (luna silente, interlunium),
//     numbers and dates. Consecrated proper names DO translate
//     (Ptolomeu → Ptolemy, Catão → Cato the Elder);
//   · the Robbins verbatim is ALREADY English — here it appears directly,
//     no paraphrase needed;
//   · red line: no relieve/soothe/calm/heal/cure/treat/energize, no promise
//     of results, no invented social proof. test/jornadaIdiomas.test.js
//     sweeps this whole file and bites;
//   · SAME SHAPE as the derived pt pack (packDeTextos in lib/jornada.js):
//     same keys, `acao` is the STRING of the action text (the feature id
//     stays in the engine).
//
// Terminology inherited from lib/i18n.js (JORNADA_I18N block, en): trail,
// Journey, Birth Chart, Moon Calendar, Sound of the Sky, Grounding,
// Cosmic Diary, Tarot, "Receipt:".
export default {
  trilhas: {
    luaSeteDias: {
      nome: '7 Days of the Moon',
      subtitulo: 'What ancient farming did in each phase — and what was invented yesterday',
      dias: {
        1: {
          titulo: 'The moon nobody sees',
          leitura:
            'The New Moon is the only phase you cannot see. It is up there, right next to the Sun, with its dark face turned toward us. The Romans had a name for that: luna silente — the silent moon. And that was exactly when they planted: fig, apple, olive, pear and vine, late in the afternoon. The logic is farm logic, not mystery — what is meant to grow goes into the ground while the Moon is about to grow along with it. ' +
            'Receipt: Cato the Elder, De Agri Cultura 40.1, 2nd century BC.',
          pergunta: "What are you starting right now that you can't show anyone yet?",
          acao: 'Open the Moon Calendar and see which phase the Moon is really in today.',
        },
        2: {
          titulo: 'The rule that sums up a thousand years',
          leitura:
            'If you keep only one sentence from this whole trail, keep this one: on the old farm, whatever you wanted to see grow went into the ground with the Moon growing, and whatever you wanted to dry out or shrink was done on the waning. It is the thing your grandmother used to say, and it has a Latin version written long before her: omnia quae seruntur crescente luna — everything that is sown should be sown with the moon growing. One single rule, applied to the farm\'s whole year — and it is about seed, wood and wool, not about people\'s lives: stretching the rule onto your own life is contemporary popular practice, with no ancient source located. ' +
            'Receipt: Palladius, Opus Agriculturae I.6.12, 4th–5th century AD.',
          pergunta: 'Is there something in your life right now that is meant to grow, and something else that is meant to shrink? What are they?',
          acao: 'Write in the Cosmic Diary one thing you want to increase and one you want to reduce.',
        },
        3: {
          titulo: 'Half lit',
          leitura:
            'The First Quarter is the Moon cut in half across the sky. And here comes a correction almost no app makes: the ancient division of the Moon is FOUR parts, not eight. Ptolemy describes the four quarters and gives each one a quality — from the new to the first quarter, moister; from the quarter to the full, hotter; from the full to the last quarter, drier; from the last quarter to the dark, colder. The eight phases with psychological names? Those are from 1967, and the author has a name. ' +
            'Receipt: Ptolemy, Tetrabiblos I.8, 2nd century AD; the eight psychological phases are Dane Rudhyar\'s, The Lunation Cycle, 1967.',
          pergunta: 'Where are you on the road: at the start, halfway through, or already on the way back?',
          acao: 'In the Moon Calendar, look up the date of the next quarter — and notice it is an exact hour, not a whole day.',
        },
        4: {
          titulo: 'The night that fools you',
          leitura:
            'The Full Moon looks full for about three nights in a row, but truly full it is for a single instant — the moment it sits exactly 180 degrees from the Sun. That is why almanacs disagree with apps: one labels by slice, the other by the instant. And here is a surprise: on the full, the Roman source says to SOW broad beans, not harvest them. Harvesting for storage belongs to the waning. As a bonus, two names that sound ancient and are not: the first printed list of moon names is from 1918, the Maine Farmers\' Almanac published its lists in the 1930s and the Old Farmer\'s Almanac cut it all down to one name per month; and "supermoon" was coined in 1979. ' +
            'Receipt: Columella, De Re Rustica XI.2.85, 1st century AD; first printed list in Daniel Carter Beard, 1918; Maine Farmers\' Almanac lists, 1930s; Old Farmer\'s Almanac simplification, 20th century; "supermoon" by Richard Nolle, 1979.',
          pergunta: 'What in your life looks like it is at its peak, when you know it is still being sown?',
          acao: "Let the Sound of the Sky play for three minutes while you reread today's paragraph.",
        },
        5: {
          titulo: 'What gets cut, harvested and sheared',
          leitura:
            'The Moon has started to shrink. On the old farm, this is when you touch everything that needs to dry without rotting. Pliny wrote the rule in a single line: omnia quae caeduntur, carpuntur, tondentur, innocentius decrescente luna — everything that is cut, gathered and sheared takes less harm with the moon waning. Notice how modest his claim is: not that it turns out better, but that it spoils less. ' +
            'Receipt: Pliny the Elder, Naturalis Historia XVIII.321, 1st century AD.',
          pergunta: 'What have you already harvested this month without stopping to notice you harvested it?',
          acao: 'Draw one card in the Tarot thinking about what is ready to be closed.',
        },
        6: {
          titulo: 'Wood, manure and the hush at the end of the month',
          leitura:
            'The end of the lunar month was the season for heavy work with no audience: cutting wood, spreading manure, weeding. For the wood, Pliny gives the window with a craftsman\'s precision — between the twentieth and the thirtieth day of the Moon, and the sweet spot is the interlunium, the dark moon; Columella repeats the same range. Manure and weeding are a different entry, with a different address, so they get their own receipt. None of this is pretty to post, and that is exactly why it survived: it was work that produced material results, so somebody wrote it down. ' +
            'Receipt: for the wood, Pliny the Elder, Naturalis Historia XVI.190–191, 1st century AD, and Columella, De Re Rustica XI.2.11, 1st century AD; for the manure and the weeding, Pliny the Elder, Naturalis Historia XVIII.322, 1st century AD, and Columella, De Re Rustica II.5.1, 1st century AD.',
          pergunta: 'What is your dark-moon work — the kind nobody sees, that holds up everything else?',
          acao: 'Do one breathing cycle in Grounding before you close the app today.',
        },
        7: {
          titulo: 'The calendar that came before the phases',
          leitura:
            'The trail closes with the part almost everyone skips. Before "Waxing Gibbous" existed, there was counting: first day of the Moon, second, third, up to the thirtieth. Hesiod has a day-by-day calendar — the fourth and the seventh are holy. Virgil says to run from the fifth, and that the seventeenth is a lucky one for planting the vine and taming oxen. In other words: the ancient scheme is NUMBERED DAYS, not eight named phases. Whoever maps one onto the other is inventing an equivalence the source never makes — and now you know that before everybody else. ' +
            'Receipt: Hesiod, Works and Days, vv. 765–828, 7th century BC; Virgil, Georgics I.276–286, 1st century BC.',
          pergunta: 'After these seven days, what do you look at differently in the sky?',
          acao: 'Go back to the Moon Calendar and check how many days are left until the next New Moon.',
        },
      },
    },

    mapaSeteDias: {
      nome: 'Meet Your Chart',
      subtitulo: "Sun, Moon, Ascendant and houses — what is math and what is somebody's opinion",
      dias: {
        1: {
          titulo: 'Your Sun is not a date',
          leitura:
            'Everybody knows their own sun sign, and almost everybody learned how it works the wrong way. Your sun sign is not a calendar range: it is where the Sun was, by degree, at the instant you were born. And the signs begin at the equinoxes and solstices, which are INSTANTS — not the 21st of each month. Someone born near the turn can carry the wrong sign their whole life because of that. That is why this app asks for your birth date instead of asking your sign: the math gets it right more often than memory does. ' +
            'Receipt: Ptolemy, Tetrabiblos I.22, 2nd century AD.',
          pergunta: 'Have you ever doubted your sign? What made you doubt it?',
          acao: 'Open the Birth Chart and check that your birth date and time are right.',
        },
        2: {
          titulo: 'The Moon changes sign every two and a half days',
          leitura:
            'The Sun takes a month to cross a sign. The Moon takes two and a half days. That changes everything about reading a chart: the Moon is the piece that depends most on knowing the right time, and the one that most separates two siblings born in the same week. A beautiful detail from the Greeks: they called the third place of the chart "the Goddess", which was the Moon, and the ninth "the God", which was the Sun. The two luminaries — Sun and Moon, the chart\'s two lights — each had their favorite house, and part of the names we still use came from there. ' +
            'Receipt: Greek names of the places in F. E. Robbins\' note 56 to the Tetrabiblos, Loeb, 1940.',
          pergunta: 'Who in your family has the birth date closest to yours? How are you two different?',
          acao: "In the Birth Chart, find your Moon's position and write down its sign.",
        },
        3: {
          titulo: 'The Ascendant is the helm',
          leitura:
            'The Ascendant is the degree that was rising on the eastern horizon at the exact time you were born, in the exact place you were born. It changes roughly every two hours — a guessed time is nearly a coin toss between two signs. And it is not "how the world sees you": that is a modern reading. In the ancient source it is the origin and foundation of the whole chart, the point from which everything else is counted. Paulus of Alexandria uses a beautiful Greek word for it: oíax, the helm. ' +
            'Receipt: Paulus of Alexandria, Introductory Matters, ch. 24, 378 AD; Firmicus Maternus, Mathesis II, 19.2, c. 335 AD.',
          pergunta: 'Do you know the exact time you were born? Who could confirm it for you today?',
          acao: 'Fill in the time and city in the Birth Chart — without both, the Ascendant cannot be computed.',
        },
        4: {
          titulo: 'The four corners of the sky',
          leitura:
            'Four points hold the chart: what rises in the east, what sets in the west, the highest point of the sky and the opposite point below. The Greeks called them kentra, the pivots. Now the fact that changes how much you trust any colorful chart on the internet: about three hundred charts survive from Antiquity, and only thirty-two include the midheaven. Intermediate cusps — those twelve lines the apps draw — show up in TWO. It is not that the ancients could not compute them: the system they used did not need them. ' +
            'Receipt: Robert Hand\'s 2007 survey of the Oxyrhynchus papyri and the Neugebauer & van Hoesen corpus.',
          pergunta: "What is at the highest point of your life right now, in everyone's plain sight?",
          acao: 'In the Birth Chart, find the Ascendant and the Midheaven and see which signs they fall in.',
        },
        5: {
          titulo: 'The houses had names, and the names had opinions',
          leitura:
            'Today people say "second house, resources" and "eighth house, transformation", all neutral and tidy. The original names were anything but neutral. The second was the Gate of Hades. The fifth, Good Fortune; the sixth, Bad Fortune. The eighth, Beginning of Death. The eleventh, Good Daimon; the twelfth, Bad Daimon — the daimon was the spirit that walks with a person, more or less their guardian angel. Seven of the twelve names are value judgments, not topics. Modern astrology erased that whole layer and told no one — and the ancient chart was a moral map of the sky, not a form to fill out. ' +
            'Receipt: Greek names in F. E. Robbins\' note 56, Loeb, 1940; Latin names in Firmicus Maternus, Mathesis II.XVI–XX, 4th century AD.',
          pergunta: 'Which of those old names bothered you the most? Why?',
          acao: 'Write in the Cosmic Diary which of the twelve Greek names you think describes your year.',
        },
        6: {
          titulo: 'Not everyone in antiquity agreed',
          leitura:
            'Here is the thing the market hides, and it makes the subject more interesting: the ancients argued with each other. Vettius Valens, who represents the working practice of the second century, uses techniques Ptolemy simply ignores — and Ptolemy, the most quoted today, was actually a reformer who pruned part of the tradition he received. When someone says "the ancients taught", ask which ancient. The answer is almost always: one of them, and not necessarily the majority. ' +
            'Receipt: Vettius Valens, Anthologies, Book II ch. 4–16, c. 150–175 AD.',
          pergunta: 'Where in your life did you accept a single version of a story that had more than one side?',
          acao: 'Draw one card in the Tarot and write TWO different readings of it.',
        },
        7: {
          titulo: 'Which house system? The question almost nobody asks',
          leitura:
            'Two charts of the same birth can disagree about houses, and neither one is broken — they use different rulers. In Antiquity the ruler was simple: the sign where the Ascendant falls is the whole first house, the next sign is the second, and that is it. That is what Paulus of Alexandria describes, twelve times, in so many words. The system that became today\'s default is another one, published much later, and the method is not even by the author whose name it carries. Knowing which ruler your chart uses is more useful than any interpretation. ' +
            'Receipt: Paulus of Alexandria, Introductory Matters, ch. 24, 378 AD; Placidus published in 1650, with the method attributed to Giovanni Antonio Magini (1555–1617).',
          pergunta: 'After this week, what do you want to take your time checking in your own chart?',
          acao: 'Open the Birth Chart one last time and read the note about which house system it uses.',
        },
      },
    },

    taroVinteDois: {
      nome: 'The Tarot 22',
      subtitulo: 'The 22 picture cards of the tarot — and the real age of every story you were told about them',
      dias: {
        1: {
          titulo: 'Before fortune-telling, it was a game',
          leitura:
            'The tarot was born as a playing deck in Renaissance Italy — a trick-taking game, the same family as hearts or spades, where every round has a winner, with suits plus a fifth series of cards that beat them all: the trumps. There are 22 of them, and they were not secret symbols; they were a gallery of figures any educated person of the time would recognize. The first complete list of the 22, in order, appears in a sermon by a Dominican preacher who was cursing the game — he lists the cards to call them the devil\'s work, and by accident handed us the document. ' +
            'Receipt: Steele Sermon, c. 1470–1500.',
          pergunta: 'What in your life today is taken far too seriously and started as play?',
          acao: 'Open the Tarot and look at the 22 major arcana in order, without drawing a single card.',
        },
        2: {
          titulo: 'The day the tarot became Egyptian',
          leitura:
            'The Egypt story has an author, a publisher and a year. A French scholar ran into the tarot at a social gathering in Paris, decided on the spot that it was a sacred Egyptian book saved from the fire of Alexandria, and published it. The detail that brings it all down: he wrote that in 1781, and nobody in the world could read hieroglyphs at that moment. The Rosetta Stone only turned up in 1799, and Champollion only cracked the script in 1822. He asserted the content of texts that were literally impossible to read. ' +
            'Receipt: Antoine Court de Gébelin, Le Monde primitif, vol. VIII, 1781; Champollion deciphers hieroglyphs in 1822.',
          pergunta: 'Which story have you been repeating for years without ever checking the source?',
          acao: 'In the Tarot, pick one card and read its file to the end — dating included.',
        },
        3: {
          titulo: 'Who invented the profession',
          leitura:
            'Two years after the imaginary Egypt, a Parisian hairdresser and seed seller did something far more concrete: he turned the tarot into a method. A fixed meaning for each card, a different meaning when it comes out reversed, a position on the table that changes the reading. In 1789 he published the world\'s first deck designed specifically for divination — before that, every tarot deck was a game deck adapted. Card reading with tarot, as a profession, is that old. ' +
            'Receipt: Jean-Baptiste Alliette, "Etteilla" — first manual with reversals in 1770, Grand Etteilla in 1789.',
          pergunta: 'What do you do today that someone had to invent from scratch in a specific year?',
          acao: "Draw three cards in the Tarot and notice how each one's position changes what it says.",
        },
        4: {
          titulo: 'The trick of the three mothers',
          leitura:
            'You have probably heard that the 22 arcana match the 22 Hebrew letters, and that this proves antiquity. It proves the opposite: the pairing comes from the same French volume of 1781, by another author in the group. What does exist is a Hebrew text that splits the 22 letters into three "mothers", seven "doubles" and twelve "simples". The three mothers are Aleph, Mem and Shin — the Fool, the Hanged Man and Judgement. If some table calls Beth or Gimel a mother, it is corrupted, and now you know how to check. ' +
            'Receipt: Comte de Mellet, in Le Monde primitif, vol. VIII, 1781; the division of the letters comes from the Sepher Yetzirah.',
          pergunta: 'Where have you accepted "it\'s ancient" as if it were an argument?',
          acao: 'Find the Fool, the Hanged Man and Judgement in the Tarot and look at the three side by side.',
        },
        5: {
          titulo: 'The twelve signs, in order, inside the deck',
          leitura:
            'Here it gets elegant. Fit the 22 trumps into the letter grid and the twelve signs land in perfect zodiacal order: the Emperor is Aries, the Hierophant is Taurus, the Lovers are Gemini, the Chariot is Cancer, Strength is Leo, the Hermit is Virgo, Justice is Libra, Death is Scorpio, Temperance is Sagittarius, the Devil is Capricorn, the Star is Aquarius and the Moon is Pisces. And the famous swap between Strength and Justice was no whim of Waite\'s: without it, Leo and Libra came out of order. ' +
            'Receipt: Book T and the Golden Dawn\'s Cipher Manuscripts, late 19th century.',
          pergunta: 'Which of those twelve cards pairs with your sun sign? What do you make of the match?',
          acao: "Open the Tarot on your sign's card and compare it with what you read in your Birth Chart.",
        },
        6: {
          titulo: 'The deck you know has an address',
          leitura:
            'Those images everyone recognizes — scenes with people on every card, including the numbered ones — came from a deck published in London in December 1909. The art is by Pamela Colman Smith, an illustrator who spent decades credited only by her initials. The structure is A. E. Waite\'s, and the book explaining it all came out in 1911. When someone tells you the drawing is millennia old, you have the date, the city and the publisher. ' +
            'Receipt: deck published by William Rider & Son, London, December 1909, art by Pamela Colman Smith (1878–1951); The Pictorial Key to the Tarot, A. E. Waite, 1911.',
          pergunta: 'Who did something important in your life and never got the credit?',
          acao: 'Draw one card in the Tarot and notice how many people and objects fit in the drawing.',
        },
        7: {
          titulo: 'The Celtic Cross is not Celtic',
          leitura:
            'The most famous spread in the world — ten cards in a cross with a column beside it — was christened "an ancient Celtic method of divination" by Waite himself, in the 1911 book. Celtic it is not: there is no Celtic evidence whatsoever, and no attestation earlier than the Golden Dawn of the 1890s. Why "Celtic", then? There is a circulating thesis that the name rode the wave of the Irish literary revival in London — it is plausible, it circulates widely, and nobody has found a primary source that proves it. It stays a hypothesis, not a cause. The spread is good, it remains good, and you can use it as much as you like — only now knowing it is your great-grandmother\'s age, not the druids\'. ' +
            'Receipt: A. E. Waite, The Pictorial Key to the Tarot, "An Ancient Celtic Method of Divination", 1911.',
          pergunta: 'After this week, what changed in the way you look at a card?',
          acao: 'Do a spread in the Tarot and write in the Cosmic Diary what you saw, without looking up a ready-made meaning.',
        },
      },
    },

    ceuDosAntigos: {
      nome: 'The Sky of the Ancients',
      subtitulo: 'What can be measured, what is attributed — and why the difference matters',
      dias: {
        1: {
          titulo: 'Two layers, never just one',
          leitura:
            'There are two very different things inside a birth chart, and every app mixes them up. One is math: where the Sun was, by degree, on the day you were born — it can be wrong, and it can be proven wrong. The other is what culture kept hanging on top of it: "Libras are diplomatic". It can be beautiful and old, but it is not the same kind of thing. This app keeps the two apart. It is not fussiness: this is exactly where it had the worst bug of its history, deciding signs by calendar table instead of sky math. ' +
            'Receipt: Ptolemy, Tetrabiblos I.22, 2nd century AD — the signs begin at the equinoxes and solstices, which are instants.',
          pergunta: 'Which thing you repeat about yourself is measured, and which one is attributed?',
          acao: 'Open the Birth Chart and notice which numbers are computed and which texts are interpretation.',
        },
        2: {
          titulo: 'The foundation was already a pen name',
          leitura:
            'This is the best story in the whole research. The texts that found the birth chart as a system circulate under the names of an Egyptian pharaoh and an Egyptian priest. Both are pseudonyms. The actual writers were Greek authors in Alexandria, around 150 to 120 before Christ, giving an Egyptian pedigree to a text they were writing right then. In other words: inventing antiquity is not a corruption of the tradition — it is a feature of it, present from day one. ' +
            'Receipt: texts attributed to Nechepso and Petosiris, pseudonyms used by Greek authors in Alexandria, 150–120 BC.',
          pergunta: 'What authority have you ever borrowed for an idea of yours so it would be taken seriously?',
          acao: 'Write one belief of yours in the Cosmic Diary and try to remember who told it to you.',
        },
        3: {
          titulo: 'The tradition argued with itself',
          leitura:
            '"Millennia-old wisdom" is a phrase that flattens four thousand years of people disagreeing. Ptolemy writes against Babylonian practices. Valens uses techniques Ptolemy ignores. And someone wrote an entire book called Against the Astrologers — and that author is a primary source as much as the others. Showing the disagreement looks like weakness, but it is the opposite: it means there is a real subject there, with literature and controversy, not a fortune-cookie text. ' +
            'Receipt: Sextus Empiricus, Against the Astrologers, 3rd century.',
          pergunta: 'On what subject did you change sides after hearing the other side?',
          acao: 'Do one cycle in Grounding and spend those minutes with the idea that disagreeing is not a defect.',
        },
        4: {
          titulo: 'The new dressed up as old',
          leitura:
            'Run this test on anything sold to you as ancestral: look for the first time someone wrote it down. "Supermoon" has 1979 and an author. The full moon names — Wolf, Strawberry — come from lists published in the 20th century: the first printed one is from 1918, the Maine Farmers\' Almanac published its own in the 1930s and the Old Farmer\'s Almanac cut it all down to one name per month. Those lists mix Algonquian, colonial English, Celtic and neopagan origins, and the current assessment is that the claim of Indigenous origin is "partially true" — neither an ancestral stamp nor an invention out of nowhere. None of it needs to leave the app; it needs to get its date. ' +
            'Receipt: "supermoon" coined by Richard Nolle, 1979; first printed list in Daniel Carter Beard, 1918; Maine Farmers\' Almanac lists, 1930s; Old Farmer\'s Almanac simplification, 20th century; assessment by Patricia Haddock, Mysteries of the Moon, 1992.',
          pergunta: 'Which practice of yours is younger than you imagined? And did that make it stop serving you?',
          acao: 'In the Moon Calendar, check the name of the next full moon and remember where it came from.',
        },
        5: {
          titulo: "A third of the pairs don't speak",
          leitura:
            'Compatibility percentages exist in no source at all — they are a commercial invention, from the same batch as the newspaper horoscope. What the tradition has is better and harder. Ptolemy describes six kinds of relation between signs, and one of them is aversion: by the structural definition, signs one or five signs apart do not see each other. That is 24 pairs, nearly a third of the table. And when he applies it to two people, in a later chapter, aversion is no mild indifference: it lands on the same rung as opposition, the fourth and last of a scale — "they produce the deepest enmities and lasting contentions". No app on the market shows this, because a low score does not sell. ' +
            'Receipt: Ptolemy, Tetrabiblos I.16 (the structural definition) and IV.7 (the application to relationships, with the four-rung scale), 2nd century AD.',
          pergunta: 'Do you know someone the conversation never clicks with — and, up close, is that indifference or friction?',
          acao: 'Write in the Cosmic Diary what you think of a reading that does not give you a good score.',
        },
        6: {
          titulo: 'Where the skies crossed',
          leitura:
            'If you have heard "your Vedic sign is different" and did not get it, here is the thing. A second-century text translated Greek astrology into Sanskrit — its name literally means "the astrology of the Ionians", the Greeks. That is why Indian astrology has recognizable houses, aspects and planets. The difference is that it runs on another zodiac, one that corrects for the sky\'s slow drift. The result: the sign that comes out in one system often is not the one that comes out in the other. Neither is wrong — they are different rulers, and the gap between them is measurable. ' +
            'Receipt: Yavanajātaka, translated from Greek into Sanskrit, 2nd century AD.',
          pergunta: 'Where were you and someone else right at the same time, measuring with different rulers?',
          acao: "Compare in the Birth Chart your Sun's position in degrees, not just the sign's name.",
        },
        7: {
          titulo: 'Even our disclaimer has a date',
          leitura:
            'Every app repeats the same line: "not prediction, reflection", "tendencies, not determinism". That frame was not born of philosophical scruple — it was born as a criminal defense. Alan Leo was prosecuted for fortune-telling in England in 1914 and again in 1917, and his defense\'s argument was exactly that: I describe tendencies, not fortunes. He lost. The whole market inherited the sentence without knowing where it came from, and this app did too. Knowing the origin does not make it false: it is still the honest description of what we do here. ' +
            'Receipt: prosecutions of Alan Leo, England, 1914 and 1917.',
          pergunta: 'After these seven days, what did you start demanding from anything anyone tells you about the sky?',
          acao: 'Draw one card in the Tarot and read its dating before you read its meaning.',
        },
      },
    },
  },

  // Medal names have to stay screenshot-worthy — product translation, not
  // dictionary translation ("Sky Trailblazer" has punch; "Sky Explorer" is
  // lukewarm). The caption describes the DEED (days, receipts, trails),
  // never what the person became — same rule as PT.
  medalhas: {
    primeiraLuz: {
      nome: 'First Light',
      legenda: 'You opened the trail. Day 1 of 7.',
    },
    andarilhoDoZodiaco: {
      nome: 'Zodiac Wanderer',
      legenda: 'Three days in a row. You came back twice after the first one.',
    },
    guardiaoDaEfemeride: {
      nome: 'Keeper of the Ephemeris',
      legenda:
        'Five days, five receipts read — work, author and century in each one. The ephemeris is the table that says where every planet was.',
    },
    desbravadorDoCeu: {
      nome: 'Sky Trailblazer',
      legenda: 'The whole trail, from the first day to the seventh.',
    },
  },

  medalhasJornada: {
    leitorDeFontes: {
      nome: 'Source Hunter',
      legenda: 'Two whole trails closed: fourteen days and fourteen receipts.',
    },
    cartografoDoCeu: {
      nome: 'Cartographer of the Sky',
      legenda: 'Every trail complete. The whole Journey, start to finish.',
    },
  },
};
