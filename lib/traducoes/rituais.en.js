// lib/traducoes/rituais.en.js
// ENGLISH PACK for lib/rituais.js — same shape as the Portuguese source of
// truth, key for key. The motor stays canonical in PT; this file carries ONLY
// the text a reader sees, translated by SENSE, not word for word.
//
// THE RULES OF THIS FILE (same red line as lib/rituais.js, English cousins):
//   (1) NO health claim, ever: relieve/soothe/calm/heal/cure/treat/energize
//       and relatives never enter, not even implied.
//   (2) NO promise of outcome: attract/guarantee/manifest/protect/unlock/
//       ward off and relatives never enter. A ritual is what the person DOES.
//   (3) NO pseudoscientific mechanism: energy/vibration/aura/cleansing never
//       enter, not even as poetic imagery.
//   (4) What never gets translated: work titles and loci (Tetrabiblos I.4,
//       Naturalis Historia XVIII.321-322, Carmen Astrologicum), numbers,
//       dates. Consecrated author names DO translate (Ptolomeu → Ptolemy).
//   (5) Tone mirrors the PT: hooks first, receipt last — conversation, not
//       lecture. Every `intencao`/`momentoTexto` opens plain and closes on a
//       source (or on the literal no-source phrase).
//
// STRUCTURE CONTRACT (enforced by test/rituaisIdiomas.test.js):
//   - `rituais` has EXACTLY the 21 ids of RITUAIS, each with titulo, intencao,
//     materiais[], passos[], momentoTexto, cuidados, naoTemFonte[] — same
//     array lengths as PT, no empty values, same {x} placeholders.
//   - `cuidados` here EXCLUDES the ethical notice: the motor appends
//     `avisoEtico` to the end, exactly as the PT source concatenates its own.
//   - every `naoTemFonte` line ends with `semFonteAntiga` + '.'.
export default {
  // The owner's ethical notice, carried over with the same force — the last
  // sentence is a hard limit of conduct, not a legal hedge.
  avisoEtico:
    'These rituals are gestures of intention, made with your own hands and about your own life. Other people’s will is not yours to touch.',

  // The literal phrase that replaces invented antiquity, always identical.
  semFonteAntiga: 'contemporary popular practice, no ancient source found',

  // The wrapper of the daily-match reason: "Friday (day of Venus)".
  motivoDia: '{dia} (day of {planeta})',

  // The receipts, as the screen prints them (author, work, century). Work
  // titles and loci stay as they are; author names take their consecrated
  // English forms.
  fontes: {
    dioCassio: { autor: 'Cassius Dio', obra: 'Roman History 37.18-19', seculo: '3rd century' },
    ptolomeuI4: { autor: 'Claudius Ptolemy', obra: 'Tetrabiblos I.4', seculo: '2nd century' },
    ptolomeuI8: { autor: 'Claudius Ptolemy', obra: 'Tetrabiblos I.8', seculo: '2nd century' },
    plinioColheita: { autor: 'Pliny the Elder', obra: 'Naturalis Historia XVIII.321-322', seculo: '1st century' },
    columelaFava: { autor: 'Columella', obra: 'De Re Rustica XI.2.85', seculo: '1st century' },
    columelaPassa: { autor: 'Columella', obra: 'De Re Rustica XII.16.1', seculo: '1st century' },
    columelaEsterco: { autor: 'Columella', obra: 'De Re Rustica II.5.1', seculo: '1st century' },
    columelaMadeira: { autor: 'Columella', obra: 'De Re Rustica XI.2.11', seculo: '1st century' },
    cataoPlantio: { autor: 'Cato the Elder', obra: 'De Agri Cultura 40.1', seculo: '2nd century BC' },
    cataoEsterco: { autor: 'Cato the Elder', obra: 'De Agri Cultura 29', seculo: '2nd century BC' },
    paladio: { autor: 'Palladius', obra: 'Opus Agriculturae I.6.12', seculo: '4th-5th century' },
    hesiodo: { autor: 'Hesiod', obra: 'Works and Days, vv. 765-828', seculo: '7th century BC' },
    virgilio: { autor: 'Virgil', obra: 'Georgics I.276-286', seculo: '1st century BC' },
    mashaallahBagda: { autor: 'Māshā’allāh ibn Atharī', obra: 'foundation chart of Baghdad (762)', seculo: '8th century' },
    mashaallahVenus: { autor: 'Māshā’allāh', obra: 'Book of Aristotle III.7.11', seculo: '8th century' },
    albiruni: { autor: 'al-Bīrūnī', obra: 'Chronology of Ancient Nations (al-Āthār al-bāqiya)', seculo: '11th century' },
    doroteu: { autor: 'Dorotheus of Sidon', obra: 'Carmen Astrologicum', seculo: '1st century' },
    rudhyar: { autor: 'Dane Rudhyar', obra: 'The Lunation Cycle', seculo: '20th century (1967)' },
  },

  // The three "best moment" explainers the screen shows once, at the end.
  momentoIdeal: {
    eletiva: {
      titulo: 'Picking the hour to begin is genuinely old',
      texto:
        'Setting the day and hour to start something important is not an app-era invention: it is an entire branch of ancient astrology — choosing the hour to begin — which the Arabs called ikhtiyārāt, the choices. And there is a case on record with a date and an address. In 762 the caliph al-Manṣūr commissioned the choice of the moment to start building Baghdad; the one who chose it was Nawbakht the Persian, assisted by the young Māshā’allāh ibn Atharī, 8th century. The chart reaches us through al-Bīrūnī, Chronology of Ancient Nations, 11th century.',
      ressalvas: [
        'This one we record but have not read — the work exists in the bibliography and nobody here opened it. It stands as an attribution: Dorotheus of Sidon, Carmen Astrologicum, 1st century.',
        'The ancient criterion was the whole sky of a single instant (where each planet stood, in which part of the sky, and what was rising on the horizon), not "Moon phase and day of the week". Reducing the choice of the moment to those two data points is our simplification, and that is why it gets flagged in every ritual.',
      ],
    },
    semana: {
      titulo: 'Why each day has a planet',
      texto:
        'Monday belongs to the Moon, Tuesday to Mars, Wednesday to Mercury — and that is not almanac guesswork. It comes from the old line-up of the planets, the so-called Chaldean order: the seven arranged from slowest to fastest. The sequence of the days is worked out from it: each hour of the day gets a planet in the order of the line, and since a day has 24 hours and the line has 7 names, every turn skips three positions — which is why the sequence of the days is not the same as the line itself. The one who records it is Cassius Dio, Roman History 37.18-19, 3rd century, and he gives two competing explanations for the same thing, because he himself did not know which one was right.',
      ressalvas: [
        'Not even to a Roman was this immemorial: the very author who records it calls the custom "comparatively recent" and says the ancient Greeks did not know it. Cassius Dio, Roman History 37.18-19, 3rd century.',
        'In the ancient source the planets warm, dry and moisten — they have no personality. Claudius Ptolemy, Tetrabiblos I.4, 2nd century.',
        'The nickname "Chaldean" is Greco-Roman usage for "Babylonian" in a loose sense. The research behind this app could not verify that this specific order is the canonical order of Babylonian astronomical texts — it stays as a common nickname, not a checked fact.',
      ],
    },
    fases: {
      titulo: 'What ancient farming did in each phase, according to those who wrote it down',
      texto:
        'The rule is short and comes from the fields: what you wanted to see grow went into the ground with the Moon waxing, and what you wanted to dry out or shrink was done under the waning. There is a source at both ends — Palladius, Opus Agriculturae I.6.12, 4th-5th century, for sowing under the waxing; Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century, for cutting, harvesting and shearing under the waning.',
      ressalvas: [
        'The ancient division of the lunar cycle is into FOUR quarters, with elemental qualities — Claudius Ptolemy, Tetrabiblos I.8, 2nd century. The eight named phases with a psychological reading are by Dane Rudhyar, The Lunation Cycle, 20th century (1967).',
        'The fame of the Full Moon as harvest time inverts the ancient source: Columella, De Re Rustica XI.2.85, 1st century, sows beans at the full, and it is the waning that Pliny reserves for harvesting and storing.',
        'The source speaks of plants, timber and animals. Carrying "pruning a branch" over to "ending a subscription" is our reading, a contemporary one, and each ritual marks where it does that.',
      ],
    },
  },

  rituais: {
    // ===================== LOVE =====================
    'amor-carta-que-nao-se-envia': {
      titulo: 'The letter you never send',
      intencao:
        'You put on paper what you feel for someone, read it out loud once, and put it away. The letter is headed for a drawer, not for the person — what you do here is keep what is yours, without reaching into whoever is on the other side. Writing out affection for your own sake is contemporary popular practice, no ancient source found.',
      materiais: [
        'A sheet of paper and a pen',
        'An envelope',
        'A white candle, if you want one (it’s optional and changes nothing of what is written here)',
      ],
      passos: [
        'Sit at a table, phone in another room, and write today’s date at the top of the sheet — without the person’s name.',
        'Write in the first person: what you feel, what you wish you had said, what you are not going to say.',
        'Read the text out loud, once only, start to finish.',
        'Fold the sheet, put it in the envelope and write today’s date on the outside.',
        'Keep the envelope somewhere of your own. If you light the candle, put it out before leaving the room.',
      ],
      momentoTexto:
        'Friday is the day you can stop and look at what you feel without the week pushing you along. And the day’s name has carried Venus since Antiquity: it comes out of the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest — from which the sequence of the days is derived by skipping three positions with every turn of 24 hours. Venus even shows up in ancient judgment about couples: Māshā’allāh, Book of Aristotle III.7.11, 8th century, looks at Venus and the Moon in the same sign. The New Moon comes in as the start of the lunar month, which is genuinely ancient calendar-keeping. The one who records the sequence of the days is Cassius Dio, Roman History 37.18-19, 3rd century — and he himself says the custom was a novelty in his time —; the one who counts the lunar month day by day is Hesiod, Works and Days, vv. 765-828, 7th century BC.',
      cuidados:
        'This ritual is about what you feel, and it stops there. Don’t write anyone’s name on the paper: with a name, the exercise stops being about what you feel and becomes a gesture aimed at another person. Don’t write asking the other person to change their mind, don’t send the letter later, and don’t use anyone’s name as a target. If this involves someone who asked for distance, respect the distance.',
      naoTemFonte: [
        'Lighting a candle in a gesture of affection, of any color, white included: contemporary popular practice, no ancient source found.',
        'Writing a letter never to be sent: contemporary popular practice, no ancient source found.',
      ],
    },
    'amor-mesa-posta-pra-dois': {
      titulo: 'The table set for two',
      intencao:
        'It’s about taking one evening off autopilot with the person you’re already with: table set, phones far away, a conversation that isn’t household logistics. What you do here is pay attention on purpose to the person at your side. Dinner as a gesture of closeness is contemporary popular practice, no ancient source found.',
      materiais: [
        'A table and two chairs',
        'Food you both like (it can be simple)',
        'Two candles, or any low light',
        'One agreement: both phones in another room',
      ],
      passos: [
        'Agree on the day in advance, both of you on board. A ritual scheduled by one person alone turns into a demand.',
        'Set the table beforehand: plates, glasses, the low light.',
        'Leave both phones in another room.',
        'Each of you says, without being interrupted, one thing you noticed about the other this month.',
        'Then talk about anything that isn’t bills, schedules or work.',
        'Blow out the candles together at the end.',
      ],
      momentoTexto:
        'Friday works for a practical reason — it’s when you can stay up without thinking about the next morning — and the day’s name carries Venus by inheritance from the old line-up of the planets, the Chaldean order: the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. The Full Moon comes in as the peak of light in the cycle, which is astronomy; reading it as the hour to see clearly is today’s reading, and the ancient source gives it another use. The one who records the sequence of the days is Cassius Dio, Roman History 37.18-19, 3rd century; the one who sows beans on the eve or the very day of the full is Columella, De Re Rustica XI.2.85, 1st century.',
      cuidados:
        'Agree on it first. A couple’s ritual decided by one person stops being a ritual and becomes a test. If the other person doesn’t want to, don’t insist and don’t reschedule on your own.',
      naoTemFonte: [
        'A candlelit dinner as a couple’s ritual: contemporary popular practice, no ancient source found.',
      ],
    },
    'amor-lista-do-que-eu-quero-sentir': {
      titulo: 'The list of what I want to feel',
      intencao:
        'It’s a short list, written by hand, of what you want to feel in a relationship — not of who you want to show up. The difference is the whole point of the exercise: a person’s name becomes a demand, a feeling becomes a criterion of your own. An intention list at the New Moon is contemporary popular practice, no ancient source found.',
      materiais: ['Paper and a pen', 'Ten minutes without interruption'],
      passos: [
        'Write at the top of the sheet: "what I want to feel".',
        'List at most seven items, one per line, each starting with a verb.',
        'Cross out anything that is a person’s name. If a line ends up empty, leave it empty.',
        'Read the list out loud once.',
        'Keep the paper where you’ll run into it without searching — inside a book you use.',
      ],
      momentoTexto:
        'Starting in the dark of the Moon is an old gesture, and it is agricultural before it is symbolic. Roman farming planted fig, apple, olive, pear and vine with the silent moon — the Roman name for the New Moon, when it doesn’t show in the sky — always in the afternoon. The one who orders this is Cato the Elder, De Agri Cultura 40.1, 2nd century BC; and Palladius, Opus Agriculturae I.6.12, 4th-5th century, repeats the rule of sowing while the Moon grows. Swapping the seed for an intention is our transposition, and it gets said: contemporary popular practice, no ancient source found.',
      cuidados:
        'Don’t write people’s names on the list. The exercise loses its meaning and becomes an attempt to reach into someone else’s life. If the list turns into a charge against yourself, tear it up and write a smaller one.',
      naoTemFonte: [
        'A wish list at the New Moon: contemporary popular practice, no ancient source found.',
      ],
    },

    // ===================== PROSPERITY =====================
    'prosperidade-conta-na-mesa': {
      titulo: 'The bills on the table',
      intencao:
        'It’s about putting every bill of the month on the table, on paper, and looking at them all at once instead of one by one in a fright. What you do here is see the real size of what exists. Looking at the bills together is household organization, not tradition: contemporary popular practice, no ancient source found.',
      materiais: [
        'Every bill and invoice of the month, printed or written down',
        'A sheet of paper',
        'A pen',
        'A clear table',
      ],
      passos: [
        'Clear the table completely before starting.',
        'Lay each bill open on the table, all visible at the same time.',
        'On the sheet, write three columns: due this week, due this month, can wait.',
        'Move every paper into a column. No paper stays out.',
        'Add up each column and write the total underneath, with today’s date.',
        'Keep the sheet in sight and put the bills away.',
      ],
      momentoTexto:
        'Thursday is the day the week can still be fixed: whatever shows up here still fits into Friday. And the day’s name has carried Jupiter since Antiquity, by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. About Jupiter itself, the ancient source speaks of physics, not money: warming and moistening, in a force it calls temperate. Tying Jupiter to money is today’s reading: contemporary popular practice, no ancient source found. The one who records the sequence of the days is Cassius Dio, Roman History 37.18-19, 3rd century — and he himself notes the custom was recent in his time —; the physics of the planet is Ptolemy’s, Tetrabiblos I.4, 2nd century.',
      cuidados:
        'This is an inventory, not a payment plan. If the total is frightening, the next step is talking to someone who knows debt — not repeating the ritual. And don’t do this with another person’s bills unless they are with you.',
      naoTemFonte: [
        'Jupiter as the planet of money: contemporary popular practice, no ancient source found.',
      ],
    },
    'prosperidade-semear-na-cheia': {
      titulo: 'Sowing at the full',
      intencao:
        'It’s about planting something real — a pot, a seedling, a handful of beans on cotton — on the day of the Full Moon, and looking after it for a month. What you do here is take on a task that only depends on you showing up every day. And the date has a direct agricultural source: Columella, De Re Rustica XI.2.85, 1st century, sows beans on the eve or the very day of the full moon.',
      materiais: [
        'A pot with soil, or a jar with cotton',
        'Seeds (beans will do, and they are the closest relative of the source’s fava)',
        'Water',
        'A spot with light',
      ],
      passos: [
        'On the day of the full, prepare the soil or wet the cotton.',
        'Put in the seeds and cover them.',
        'Write on a slip of paper the date and one short sentence about what you are starting this month.',
        'Leave the slip under the pot.',
        'Water it every day, at the same time, until the next Full Moon.',
        'At the next full, read the slip and write underneath what actually happened.',
      ],
      momentoTexto:
        'Here the date is not decoration: it’s the very day the source prescribes. Columella, De Re Rustica XI.2.85, 1st century, sows beans on the eve or the very day of the full moon — and that is the interesting exception, because the general rule of Roman farming is the opposite: Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century, puts under the waning everything that gets cut, harvested and sheared. Full for putting in, waning for taking out. What the source does not say is that any of this holds for money — that part is contemporary popular practice, no ancient source found.',
      cuidados:
        'The plant is a plant. If it dies, it means nothing about you or your month — it means water was missing, light was missing, or the seed didn’t take. Don’t decide anything about money based on what the seedling did or didn’t do.',
      naoTemFonte: [
        'Planting a seed for money matters: contemporary popular practice, no ancient source found.',
      ],
    },
    'prosperidade-caderno-do-que-entra': {
      titulo: 'The notebook of what comes in',
      intencao:
        'It’s about opening a notebook just to write down the money that comes in, line by line, through one whole cycle of the Moon. What you do here is look straight at a number most of us avoid. An income notebook is a habit of household management: contemporary popular practice, no ancient source found.',
      materiais: ['A small notebook, for this alone', 'A pen', 'Five minutes a day'],
      passos: [
        'Start at the New Moon. Write the date on the first page.',
        'Every time money comes in, write it down: date, amount, where it came from.',
        'Don’t write expenses in this notebook. It is for income only, on purpose.',
        'At the Full Moon, add up what is there so far and write the subtotal.',
        'At the next New Moon, close the cycle with the total and one sentence about what you saw.',
      ],
      momentoTexto:
        'It starts at the New Moon for a counting reason: the Moon’s month is measured from one new to the next, 29 and a half days, and that is timekeeping, not symbolism. The lunar month counted day by day, from the first to the thirtieth, is already in Hesiod, Works and Days, vv. 765-828, 7th century BC. What the source does not do is tie that beginning to money — that is contemporary popular practice, no ancient source found.',
      cuidados:
        'Writing down income doesn’t change how much comes in. If the notebook shows it doesn’t add up, the next step is concrete help — credit counseling, renegotiation, one more job.',
      naoTemFonte: [
        'An income notebook closed by lunar cycle: contemporary popular practice, no ancient source found.',
      ],
    },

    // ===================== PROTECTION =====================
    'protecao-volta-pela-casa': {
      titulo: 'The walk through the house',
      intencao:
        'It’s about walking through your home, room by room, checking what closes and what is loose: door, window, gas valve, outlet, whatever needs to stay out of a child’s reach. What you do here is practical care for the place where you live. A checking round is a household habit: contemporary popular practice, no ancient source found.',
      materiais: ['Five minutes', 'A piece of paper to note what needs fixing'],
      passos: [
        'Start at the front door and always move in the same direction.',
        'In each room, check what closes: window, valve, outlet, gas cylinder.',
        'Write down what’s broken instead of fixing it on the spot.',
        'Finish at the front door and write on the paper the date and time you closed the round.',
        'The next day, solve the first item on the list.',
      ],
      momentoTexto:
        'Saturday is the day the house is full of people and you can look at everything at once, without rushing. Its name carries Saturn by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. About Saturn itself, the ancient source describes physics and weather, not door-keeping: to cool and to dry. Turning that into a "day to close up the house" is our leap, and the leap is declared: contemporary popular practice, no ancient source found. The one who records the sequence of the days is Cassius Dio, Roman History 37.18-19, 3rd century; the physics of the planet is Ptolemy’s, Tetrabiblos I.4, 2nd century.',
      cuidados:
        'This is a check, not a shield. If anything on the list involves risk — wiring, gas, structure — call a professional instead of repeating the round.',
      naoTemFonte: [
        'Saturday as the day to look after the house: contemporary popular practice, no ancient source found.',
      ],
    },
    'protecao-hora-escolhida': {
      titulo: 'The chosen hour',
      intencao:
        'It’s about choosing in advance the day and hour to start something important — a move, a trip, a first meeting, a signature — instead of starting on whatever day was left over. What you do here is arrive decided. And the practice is documented, with a date and an address: in 762 the one who chose the hour to found Baghdad was Nawbakht the Persian, assisted by the young Māshā’allāh ibn Atharī, 8th century, and the episode reaches us through al-Bīrūnī, Chronology of Ancient Nations, 11th century.',
      materiais: ['A calendar', 'The schedules of the people involved', 'Paper and a pen'],
      passos: [
        'Write in one line what is about to start. One line only.',
        'Choose three possible dates within the next four weeks.',
        'For each date, note the Moon phase and the day of the week.',
        'Pick one and write the time, hour and minute.',
        'Tell the people involved the chosen date.',
        'On the day, start at the set time, even if with a small gesture.',
      ],
      momentoTexto:
        'Choosing the hour to begin is an entire branch of ancient astrology — electing the moment — which the Arabs called ikhtiyārāt, the choices. And it has a case with a date and an address: the afternoon of July 31, 762 was elected for starting the construction of Baghdad by Nawbakht the Persian, assisted by the young Māshā’allāh ibn Atharī, 8th century, and the chart reaches us through al-Bīrūnī, Chronology of Ancient Nations, 11th century. Two honest notes. This app’s research base also records Dorotheus of Sidon, Carmen Astrologicum, 1st century, as the origin of that lineage, but did not read the work directly — it stands as a recorded attribution, not a first-hand reading. And the ancient criterion was the whole sky of the instant — where each planet stood, in which part of the sky, and what was rising on the horizon — not "waxing moon and done": using the phase alone is our simplification, contemporary popular practice, no ancient source found.',
      cuidados:
        'Choosing the date decides when you start, and that is all — what comes after it is still work. Don’t postpone an urgent decision waiting for a Moon phase, and never postpone a scheduled appointment, a legal deadline or a safety measure because of a calendar.',
      naoTemFonte: [
        'Reducing the election of the moment to "Moon phase + day of the week": contemporary popular practice, no ancient source found.',
      ],
    },
    'protecao-limite-escrito': {
      titulo: 'The written boundary',
      intencao:
        'It’s about writing, in one sentence, what you will no longer accept — and also writing what you will do when it happens again. What you do here is leave "I should have said something" behind and have the sentence ready. Writing the boundary before the conversation is contemporary popular practice, no ancient source found.',
      materiais: ['Paper and a pen', 'A place where nobody reads over your shoulder'],
      passos: [
        'Write the situation in one sentence, no adjectives: what happens, with whom, how often.',
        'Write the boundary in one sentence that starts with "I".',
        'Write what you will do next time. It must be something that depends only on you.',
        'Read the three sentences out loud.',
        'Keep the paper in your wallet, or photograph it and keep it on your phone.',
      ],
      momentoTexto:
        'Tuesday is a working day early enough for the sentence written here to still count for the whole week. The day’s name carries Mars by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. And the ancient source on Mars is far less epic than its fame: to dry and to burn, from the planet’s fiery colour — that is physics, not character. Using Tuesday for hard subjects is our choice: contemporary popular practice, no ancient source found. The one who records the sequence of the days is Cassius Dio, Roman History 37.18-19, 3rd century; the physics of the planet is Ptolemy’s, Tetrabiblos I.4, 2nd century.',
      cuidados:
        'A boundary is about your conduct, not about forcing anyone into anything. If the situation involves violence or threats, this is not the tool: go to the police, a support network or someone you trust, today.',
      naoTemFonte: [
        'Mars as the planet of courage and boundaries: contemporary popular practice, no ancient source found.',
      ],
    },

    // ===================== CLEARING =====================
    'limpeza-cortar-o-que-ja-secou': {
      titulo: 'Cutting what has already dried',
      intencao:
        'It’s about picking one thing that is clearly over — a subscription you don’t use, a group that only takes up space, a pile of old paper — and actually ending it, today. What you do here is the cut, instead of the postponement. And the gesture of cutting under the waning Moon has a source: Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century, writes that everything cut, harvested and sheared takes less damage with the moon decreasing.',
      materiais: [
        'A list of the things you’ve been putting off ending',
        'Phone or computer, if the cancellation is online',
        'A trash bag or a donation box, if it is a physical thing',
      ],
      passos: [
        'Pick ONE thing. Just one.',
        'Write its name on a piece of paper.',
        'Do the ending now: cancel, leave the group, throw it out, donate it.',
        'Cross the name off the paper.',
        'Keep the crossed-out paper until the next waning Moon and pick the next one.',
      ],
      momentoTexto:
        'This is the ritual with the most direct source in the whole library, and it’s worth saying why: ancient farming TAKES OUT under the waning, and that is written down, not folklore. Everything cut, harvested and sheared took less damage with the moon decreasing, and grapes for raisins were picked under the waning. Carrying "pruning a branch" over to "cancelling a subscription" is ours, contemporary: contemporary popular practice, no ancient source found. The ones who write both things are Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century, and Columella, De Re Rustica XII.16.1, 1st century.',
      cuidados:
        'End only what is yours to end. Don’t cancel, throw out or delete another person’s things. And if the urge to cut is aimed at a bond with a person, wait a day before doing anything.',
      naoTemFonte: [
        'Applying the waning rule to a subscription, a group or a commitment: contemporary popular practice, no ancient source found.',
      ],
    },
    'limpeza-uma-gaveta-so': {
      titulo: 'One drawer only',
      intencao:
        'It’s about choosing one drawer — one, not the whole closet — emptying it onto the bed and putting back only what you used in the last twelve months. What you do here is finish something today, instead of starting a renovation. Tidying one drawer at a time is a common household method: contemporary popular practice, no ancient source found.',
      materiais: ['One drawer', 'Two boxes: one for donation, one for trash', 'A damp cloth'],
      passos: [
        'Choose the drawer before starting and don’t change your mind halfway.',
        'Empty everything onto the bed or the floor.',
        'Wipe the bottom of the empty drawer with the cloth.',
        'Put back only what you used in the last twelve months.',
        'The rest goes into the donation or trash box today, before the day ends.',
        'Close the drawer and don’t open it until tomorrow.',
      ],
      momentoTexto:
        'The waning is the half of the lunar month when ancient farming takes out instead of putting in, and that is written in more than one place. Manuring and weeding were done with the moon decreasing; it was written that manure spread under the waning did not sprout the weed seeds that came inside it; and manuring was already done under the silent moon — the Roman name for the New Moon, when it doesn’t show in the sky. Calling a messy drawer a "weed" is our figure of speech: contemporary popular practice, no ancient source found. The three receipts: Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century; Columella, De Re Rustica II.5.1, 1st century; Cato the Elder, De Agri Cultura 29, 2nd century BC.',
      cuidados:
        'One drawer. If you open the whole closet, the ritual becomes a move and stays half done. And don’t throw out things that belong to someone else in the house without asking.',
      naoTemFonte: [
        'House tidying as a matter of lunar phase: contemporary popular practice, no ancient source found.',
      ],
    },
    'limpeza-o-que-ja-pode-ficar-pra-tras': {
      titulo: 'What can stay behind now',
      intencao:
        'It’s about writing by hand three things you still carry that can now stay where they are — and then tearing up or burning the paper. What you do here is the gesture of letting go, and it stands on its own. Writing in order to tear up is contemporary popular practice, no ancient source found.',
      materiais: [
        'Paper and a pen',
        'A sink, or a deep plate with a little water',
        'If burning: a ceramic plate and the tap close by',
      ],
      passos: [
        'Write three short sentences, one per line, each starting with "it can stay behind".',
        'Read all three out loud, slowly.',
        'Tear the paper into small pieces, or burn it over the ceramic plate, with the tap running next to you.',
        'Throw the pieces away, or wet the ashes before discarding them.',
        'Wash your hands and go back to what you were doing.',
      ],
      momentoTexto:
        'Monday is the day to move out of the way what was left hanging from last month. Its name carries the Moon by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. The phase matters here for the same reason as the other clearing rituals: the waning is where ancient farming placed everything that gets cut, harvested and sheared. And it’s worth knowing that the division into eight named phases the app shows on screen is not ancient; the ancient one is four quarters. The receipts: Cassius Dio, Roman History 37.18-19, 3rd century, for the sequence of the days; Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century, for the waning; Ptolemy, Tetrabiblos I.8, 2nd century, for the four quarters; and Dane Rudhyar, The Lunation Cycle, 20th century (1967), for the eight psychological phases.',
      cuidados:
        'If you burn it, do it at the sink, with water running next to you, and never near a curtain or alcohol. If the three sentences are about a person, write what YOU will do, not what they should do.',
      naoTemFonte: [
        'Burning written paper as a symbolic closing: contemporary popular practice, no ancient source found.',
      ],
    },

    // ===================== COURAGE =====================
    'coragem-ligacao-que-voce-adia': {
      titulo: 'The call you keep putting off',
      intencao:
        'It’s about making, today, one call you’ve been pushing back for weeks — the dentist, the bank, the relative. What you do here is cross off the list an item that has been there far too long. Facing the pending item with a set time is contemporary popular practice, no ancient source found.',
      materiais: [
        'The phone number, already written down',
        'A clock',
        'Two written sentences: how you will open and what you need to ask',
      ],
      passos: [
        'Write the number on paper, by hand.',
        'Write the first sentence you will say, in full.',
        'Write the main question. Just one.',
        'Set the time: within the next thirty minutes.',
        'Call. If it goes to voicemail, leave a message with the first sentence.',
        'Cross the number off the paper.',
      ],
      momentoTexto:
        'Tuesday is early enough in the week for the call to still get resolved before Friday. The day’s name carries Mars by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. Mars as the planet of courage is a personality reading, and a recent one: the ancient source only speaks of heat and dryness — to dry and to burn, from the planet’s fiery colour. Using Tuesday to face pending items is our choice: contemporary popular practice, no ancient source found. The receipts: Cassius Dio, Roman History 37.18-19, 3rd century, who tells that the custom was new in his time; and Ptolemy, Tetrabiblos I.4, 2nd century.',
      cuidados:
        'If the call is to someone who asked not to be contacted, don’t call. What you face here is your own pending item, never another person’s boundary.',
      naoTemFonte: [
        'Tuesday as the day to face pending items: contemporary popular practice, no ancient source found.',
      ],
    },
    'coragem-tres-linhas-antes': {
      titulo: 'Three lines beforehand',
      intencao:
        'It’s about writing three lines before a hard conversation: what you want to say, what you won’t say, and how you want to leave the room. What you do here is walk in with a plan instead of improvising. Scripting a conversation beforehand is contemporary popular practice, no ancient source found.',
      materiais: ['A card or half a sheet of paper', 'A pen', 'Five minutes before the conversation'],
      passos: [
        'Line 1: the opening sentence. Write it in full, word for word.',
        'Line 2: what you decided not to say, even if the chance comes up.',
        'Line 3: how you want to leave — what you want to have agreed by the end.',
        'Read the three out loud, once.',
        'Fold the paper and carry it in your pocket.',
        'After the conversation, write on the back what actually happened.',
      ],
      momentoTexto:
        'The waxing phase comes in through the general rule of ancient farming, and it is simple: what you wanted to see grow went into the ground with the Moon growing. Tuesday takes its name from Mars by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. And the fit between "waxing moon" and "hard conversation" is ours: contemporary popular practice, no ancient source found. The receipts: Palladius, Opus Agriculturae I.6.12, 4th-5th century, for sowing under the waxing; Cassius Dio, Roman History 37.18-19, 3rd century, for the sequence of the days.',
      cuidados:
        'A hard conversation that was agreed on beats a hard conversation by ambush: tell the person you want to talk. If there is any risk of aggression, don’t do it alone and don’t do it at home.',
      naoTemFonte: [
        'Scheduling a hard conversation by the Moon phase: contemporary popular practice, no ancient source found.',
      ],
    },
    'coragem-o-dia-escolhido': {
      titulo: 'The chosen day',
      intencao:
        'It’s about marking on the calendar, with day and hour, the thing you’ve been postponing for months — the application, the interview, the request. What you do here is turn "someday I will" into one line in the schedule. Choosing the date as a way of committing is contemporary popular practice, no ancient source found.',
      materiais: [
        'A calendar in plain sight',
        'A pen that doesn’t erase',
        'One person you will tell the date to',
      ],
      passos: [
        'Write the thing in one line.',
        'Choose a date within the next twenty-one days.',
        'Write it on the calendar, by hand, with the hour.',
        'Tell the date to one person today.',
        'On the eve, reread the line you wrote.',
      ],
      momentoTexto:
        'Choosing a good day to begin is an old thing, and it is more literal than it sounds: Hesiod, Works and Days, vv. 765-828, 7th century BC, lists day by day of the lunar month which ones are good and which are not; Virgil, Georgics I.276-286, 1st century BC, orders you to flee the fifth day and gives the seventeenth as favorable for planting the vine. Two honest notes: both count DAYS of the lunar month, 1 to 30, not phases — converting that into "Waxing Moon" is our arithmetic; and their list is about farm and household, not exam applications. At both ends, what remains is contemporary popular practice, no ancient source found.',
      cuidados:
        'Marking the date doesn’t do the work. If the day arrives and you’re not ready, reschedule once and write down why — rescheduling three times is a sign the step is too big and needs breaking into smaller pieces.',
      naoTemFonte: [
        'Converting the lunar-month days of Hesiod and Virgil into named phases: contemporary popular practice, no ancient source found.',
      ],
    },

    // ===================== FOCUS =====================
    'foco-uma-coisa-so': {
      titulo: 'One thing only',
      intencao:
        'It’s about choosing, at the start of the day, a single thing that needs to happen — and writing it on a paper that sits in front of your keyboard. What you do here is have a ready criterion for saying "not today". Choosing one main task per day is a common working method: contemporary popular practice, no ancient source found.',
      materiais: ['A small piece of paper', 'A pen', 'A fixed spot where the paper stays visible'],
      passos: [
        'Before opening any message, write the single thing of the day.',
        'Write underneath what you agree with yourself NOT to do today.',
        'Put the paper in front of your keyboard, or on the fridge door.',
        'At the end of the day, write on the back: done, half done or not done.',
        'Keep the week’s papers together and look at them all on Sunday.',
      ],
      momentoTexto:
        'Wednesday is the middle of the week: the day you can tell whether the week is moving or not. Its name carries Mercury by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. And there is a fine detail in the ancient source: Mercury is the only one of the seven with no fixed quality, now drying, now absorbing moisture, as if inspired by the speed of its own motion. Tying that to study and writing is today’s convention: contemporary popular practice, no ancient source found. The receipts: Cassius Dio, Roman History 37.18-19, 3rd century; and Ptolemy, Tetrabiblos I.4, 2nd century.',
      cuidados:
        'One thing a day is a criterion, not a charge. On a day it didn’t happen, write "not done" and move on — the stack of papers exists so you can see the week’s pattern, not to become evidence against you.',
      naoTemFonte: [
        'Wednesday as the day for study and writing: contemporary popular practice, no ancient source found.',
      ],
    },
    'foco-mesa-vazia': {
      titulo: 'The empty desk',
      intencao:
        'It’s about leaving your desk with nothing on it beyond what you’ll use in the next hour. What you do here is take out of sight what competes for your attention. An empty desk as a method is contemporary popular practice, no ancient source found.',
      materiais: ['An empty box', 'A cloth', 'Ten minutes'],
      passos: [
        'Take EVERYTHING off the desk and put it in the box.',
        'Wipe the empty desk with the cloth.',
        'Put back only what you’ll use in the next hour.',
        'Put the box out of your field of vision.',
        'Work for an hour. Then decide, item by item, what comes back.',
      ],
      momentoTexto:
        'The idea of taking things out in the shrinking phase comes from Roman farming, and it is literal: under the decreasing moon went everything that gets cut, harvested and sheared, and timber was cut between days 20 and 30 of the lunar month. Wednesday takes its name from Mercury by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. The jump from "harvesting wheat" to "clearing the desk" is ours: contemporary popular practice, no ancient source found. The receipts: Pliny the Elder, Naturalis Historia XVIII.321-322, 1st century; Columella, De Re Rustica XI.2.11, 1st century; and Cassius Dio, Roman History 37.18-19, 3rd century.',
      cuidados:
        'Don’t throw anything away in this ritual — everything goes into the box. Deciding what to discard is another ritual, on another day.',
      naoTemFonte: [
        'Clearing the work desk under the waning: contemporary popular practice, no ancient source found.',
      ],
    },
    'foco-vinte-minutos-marcados': {
      titulo: 'Twenty minutes on the clock',
      intencao:
        'It’s about working twenty timed minutes on one thing only, with the phone in another room, and stopping when the timer rings even if it’s going well. What you do here is complete one whole block instead of chopping up the afternoon. Timed blocks are a working method of today: contemporary popular practice, no ancient source found.',
      materiais: [
        'A timer (the kitchen one will do)',
        'The task already chosen before starting',
        'The phone in another room',
      ],
      passos: [
        'Choose the task and write its name on a paper.',
        'Take the phone to another room.',
        'Set twenty minutes.',
        'Work on that task only. If something else comes to mind, note it on the paper and keep going.',
        'When it rings, stop. Even if it’s going well.',
        'Write on the paper how far you got.',
      ],
      momentoTexto:
        'The waxing phase comes in through the general agricultural rule: what you want to grow goes in with the Moon growing, according to Palladius, Opus Agriculturae I.6.12, 4th-5th century. And the first quarter is one of the divisions with a genuinely ancient source: Ptolemy, Tetrabiblos I.8, 2nd century, splits the cycle into four quarters and gives each one a quality. The eight named phases you see in the app are a modern convention, and their psychological reading is by Dane Rudhyar, The Lunation Cycle, 20th century (1967).',
      cuidados:
        'Twenty minutes is a block, not a goal. If you can’t make the twenty, note how many they were and stop — a written number serves to adjust the next block, not to charge you.',
      naoTemFonte: [
        'A timed work block in the waxing phase: contemporary popular practice, no ancient source found.',
      ],
    },

    // ===================== SELF-WORTH =====================
    'autoestima-o-que-eu-fiz': {
      titulo: 'What I did',
      intencao:
        'It’s about writing on one sheet what you actually did in the last seven days — the small included, the boring included. What you do here is read the whole list at once, because scattered it disappears. Taking inventory of what got done is contemporary popular practice, no ancient source found.',
      materiais: ['A full sheet', 'A pen', 'Your agenda or phone history, to remember'],
      passos: [
        'Write the seven days at the top, one under the other.',
        'For each day, write at least one thing you did. Washing dishes counts.',
        'Don’t write what was missing. This sheet is only for what happened.',
        'Read the whole sheet out loud, start to finish.',
        'Keep it and repeat next Sunday.',
      ],
      momentoTexto:
        'Sunday is when the week is already over and the next one hasn’t started — the only hour you can look at both. Its name carries the Sun by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. And the ancient source on the Sun speaks of heat and dryness, not personal shine: to warm and, to a degree, to dry. Sunday as the day to look over the week is our arrangement, from the working calendar: contemporary popular practice, no ancient source found. The receipts: Cassius Dio, Roman History 37.18-19, 3rd century; and Ptolemy, Tetrabiblos I.4, 2nd century.',
      cuidados:
        'If the sheet comes out short, it is right as it is — short weeks exist. Don’t turn the list into a comparison with someone else’s week.',
      naoTemFonte: [
        'Sunday as the day for a personal review: contemporary popular practice, no ancient source found.',
      ],
    },
    'autoestima-espelho-e-tres-frases': {
      titulo: 'The mirror and three sentences',
      intencao:
        'It’s about standing in front of the mirror and saying out loud three sentences about things you did — checkable ones, not generic praise. What you do here is hear your own voice saying something that can be verified. Speaking to the mirror is contemporary popular practice, no ancient source found.',
      materiais: ['A mirror', 'The three sentences written beforehand, on paper', 'The door closed'],
      passos: [
        'Write the three sentences first, on the paper. Each one must cite a fact: what you did, and when.',
        'Close the door and stand in front of the mirror.',
        'Read the first sentence out loud, looking at yourself.',
        'Repeat with the second and the third.',
        'Fold the paper and keep it. Don’t throw it away.',
      ],
      momentoTexto:
        'The Full Moon is the peak of light in the cycle, and that is astronomy, not interpretation. Reading the full as the hour to see clearly is already today’s reading, and the ancient source gives it another use. Sunday takes its name from the Sun by inheritance from the old line-up of the planets — the Chaldean order, the seven arranged from slowest to fastest, from which the sequence of the days is derived by skipping three positions every 24 planetary hours. The receipts: Columella, De Re Rustica XI.2.85, 1st century, who sows beans at the full; Ptolemy, Tetrabiblos I.8, 2nd century, who marks the stretch from the full to the last quarter as the dry part of the cycle; and Cassius Dio, Roman History 37.18-19, 3rd century, for the sequence of the days.',
      cuidados:
        'The sentence has to be checkable. If you don’t believe what you’re saying, swap it for a smaller, truer fact — a sentence that rings false is of no use here.',
      naoTemFonte: [
        'Speaking to the mirror at the Full Moon: contemporary popular practice, no ancient source found.',
      ],
    },
    'autoestima-carta-de-um-ano': {
      titulo: 'The one-year letter',
      intencao:
        'It’s about writing a letter to yourself one year from now, dated, and keeping it sealed. What you do here is record who you are today, in your own words, to check later. A letter to your future self is contemporary popular practice, no ancient source found.',
      materiais: ['Paper and a pen', 'An envelope', 'A safe place to keep it for twelve months'],
      passos: [
        'Write today’s date at the top.',
        'Tell where you stand: work, home, people around, what is hard right now.',
        'Write three questions for the you of one year from now.',
        'Don’t write goals. Write questions.',
        'Seal the envelope, write the opening date on the outside and put it away.',
        'On the date, open it and answer in writing.',
      ],
      momentoTexto:
        'The full comes in here through light, which is measurement, and it’s worth separating measurement from reading. Ptolemy, Tetrabiblos I.8, 2nd century, divides the lunar cycle into four quarters with qualities — that is the ancient doctrine of phases, and it is the only one. The eight named phases with a personality reading are by Dane Rudhyar, The Lunation Cycle, 20th century (1967). And writing a letter to your future self at the full is in no source at all: contemporary popular practice, no ancient source found.',
      cuidados:
        'A year is a long time. Write in a way that demands nothing of the person who opens it — the one who opens it is you, and you may be somewhere else in life.',
      naoTemFonte: [
        'A letter to your future self written at the Full Moon: contemporary popular practice, no ancient source found.',
      ],
    },
  },
};
