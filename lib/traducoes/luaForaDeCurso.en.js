// lib/traducoes/luaForaDeCurso.en.js
// THE ENGLISH PACK for the void-of-course Moon. Same SHAPE as the pt pack: same
// keys, same functions with the same signature. What never changes between
// packs: the English verbatim from Lilly and Morrison, the loci (Christian
// Astrology, London, 1647, p. 112 stays that in all three) and the numbers.
//
// The rules in the header of lib/luaForaDeCurso.js apply to every string here:
//   • NO ORDERS TO THE READER. No "don't sign", "avoid", "use this time to".
//     The app describes the sky (which is arithmetic) and describes what each
//     author wrote (which is a quotation). The decision stays with the reader.
//   • THE CALENDAR ADVICE IS NOT ANCIENT. It is Al H. Morrison, from ~1970 on.
//     In Lilly (1647) the criterion judges a horary QUESTION.
//   • A QUOTATION IS NEVER TRANSLATED. Here the source language happens to be
//     English; the paraphrase beside it is ours and carries no quote marks.
//   • NO HEALTH CLAIMS, not even implied. That is why the Morrison quotation is
//     truncated — his list of practices lives in the research document.
//
// Aspect names follow the rest of the app (lib/traducoes/synastry.en.js), which
// uses Robbins's "Quartile" with "the square" as the gloss.

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

const PLANETAS = {
  'Sol': 'the Sun',
  'Mercúrio': 'Mercury',
  'Vênus': 'Venus',
  'Marte': 'Mars',
  'Júpiter': 'Jupiter',
  'Saturno': 'Saturn',
};

const ASPECTOS = {
  conjuncao: 'Conjunction',
  sextil: 'Sextile',
  quadratura: 'Quartile',
  trigono: 'Trine',
  oposicao: 'Opposition',
};

const ASPECTOS_COM_GLOSA = {
  conjuncao: 'a conjunction (both at the same degree of the zodiac)',
  sextil: 'a sextile (60° between them)',
  quadratura: 'a quartile, the square (90° between them)',
  trigono: 'a trine (120° between them)',
  oposicao: 'an opposition (180°, one straight across from the other)',
};

// English has no gender to agree with, but the shape is the same in all three
// packs: the mid-sentence form of each figure, article included.
const ASPECTOS_EXATO = {
  conjuncao: 'an exact conjunction',
  sextil: 'an exact sextile',
  quadratura: 'an exact quartile',
  trigono: 'an exact trine',
  oposicao: 'an exact opposition',
};

function dur(h) {
  const min = Math.round((h || 0) * 60);
  if (min < 1) return 'less than a minute';
  if (min < 60) return `${min} ${min === 1 ? 'minute' : 'minutes'}`;
  const hours = Math.floor(min / 60);
  const rest = min % 60;
  if (rest === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return `${hours}h ${String(rest).padStart(2, '0')}m`;
}

function graus(g) {
  return `${(g || 0).toFixed(1)}°`;
}

function fimDaRegua(c) {
  return c.definicaoId === 'porfirio' ? 'moving another 30°' : 'changing sign';
}

// Same idea, with a subject, for the slot after "before she ___".
function fimDaReguaComSujeito(c) {
  return c.definicaoId === 'porfirio' ? 'moves another 30°' : 'changes sign';
}

const DEFINICOES = {
  moderna: {
    nome: 'the sign-boundary definition',
    // In English this slot needs no preposition — each pack solves the same
    // problem its own way. It is used as "by the ___ rule".
    naFrase: 'sign-boundary',
    criterio:
      'the Moon is void of course when she perfects no further exact angle with the other six before she changes sign',
    autor: 'William Lilly',
    seculo: '1647',
    locus: 'William Lilly, Christian Astrology, London, 1647, p. 112',
    quemUsa:
      'it is the rule behind the "free day" tables you see around, carried to a wide audience by Al H. Morrison from ~1970 on',
    porQueEssa:
      'The screen opens on this one because it is the one you have already seen somewhere. The other sits beside it, calculated too, because both exist and they do not hand back the same period.',
  },
  porfirio: {
    nome: 'the next-30° definition',
    naFrase: '30-degree',
    criterio:
      'the Moon is void of course when she perfects no exact angle with the other six within the next 30° of her path — and the sign boundary plays no part in it',
    autor: 'Porphyry of Tyre (the earliest known definition is Antiochus of Athens\'s)',
    seculo: '3rd century AD (Antiochus, 2nd century)',
    locus:
      'Porphyry of Tyre, Introduction to the Tetrabiblos, 3rd century (trans. James H. Holden, Porphyry the Philosopher, AFA, 2009); Antiochus of Athens, 2nd century, in Eduardo Gramaglia, Astrología Hermética, p. 188',
    quemUsa: 'it is the Hellenistic definition, the oldest one on record — and almost no app uses it',
    porQueEssa:
      'This is the old rule, and it asks for more than the modern one: a clean 30° of road, not just the stretch left before the sign changes.',
  },
};

const VERBATIM = {
  lilly: {
    texto:
      'A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other.',
    parafrase:
      'A planet is void of course when it has just separated from another one and will not, straight after, apply to any other while it stays in that sign.',
    locus: 'William Lilly, Christian Astrology, London, 1647, p. 112',
  },
  // Morrison is quoted SHORT on purpose, and the cut is declared in the
  // paraphrase: the list of practices he goes on to give lives in the research
  // document (doc 04 §3.4). What matters here is the frame, because the frame
  // is what proves the shift from horary judgement to daily planner.
  morrison: {
    texto:
      'Every couple of days there comes a time which is best used to subjective, spiritual non-material concerns…',
    parafrase:
      'Every couple of days, he writes, a stretch arrives that he describes as best spent on subjective, non-material things. The quotation is cut on purpose: the list of practices he gives next is in the research document, and an app is no place to suggest practices to anyone.',
    locus: 'Al H. Morrison, The Void of Course Moon, from ~1970 on',
  },
};

function abertura(c) {
  if (c.foraDeCurso) {
    // The empty stretch is a DIFFERENT stretch under each rule, and Porphyry's
    // count says nothing about signs — so neither can the opening line.
    const trecho = c.definicaoId === 'porfirio'
      ? `the Moon has a full 30° of road ahead of her, from ${c.signo} onward,`
      : `the Moon is crossing the rest of ${c.signo}`;
    return `You know that screenshot that goes around every week — "don't sign anything right now, the Moon is void of course"? It comes from this arithmetic. Right now ${trecho} without perfecting a single further exact angle with any of the other six bodies old astrology tracked: a stretch of road with nothing scheduled on it. The Greeks called that kenodromia — running on empty.`;
  }
  return `You know that screenshot that goes around every week — "don't sign anything right now, the Moon is void of course"? It comes from this arithmetic, and right now the arithmetic says the opposite: the Moon has something scheduled. In ${dur(c.horasAteProximo)} she perfects ${c.aspectoExato} with ${c.planeta}, before ${fimDaRegua(c)}. While a meeting is still ahead of her she is not running on empty — which is what the Greeks called kenodromia.`;
}

function estado(c) {
  if (c.foraDeCurso) {
    const fim = c.definicaoId === 'porfirio'
      ? 'the next meeting is 30° of road away'
      : `she enters ${c.proximoSigno}`;
    return `App reading, by the ${c.definicaoNaFrase} rule: the Moon is void of course. The stretch opened ${dur(c.horasDecorridas)} ago, when she perfected ${c.aspectoAnteriorExato} with ${c.planetaAnterior}, and it runs until ${fim} — ${dur(c.horasQueFaltam)} more.`;
  }
  return `App reading, by the ${c.definicaoNaFrase} rule: the Moon is not void of course right now. Her last meeting was ${c.aspectoAnteriorExato} with ${c.planetaAnterior}, ${dur(c.horasDesdeAnterior)} ago, and the next one lands before she ${fimDaReguaComSujeito(c)}.`;
}

function janela(c) {
  if (c.foraDeCurso) {
    if (c.definicaoId === 'porfirio') {
      return `The whole window runs ${dur(c.horasDeJanela)}: from the meeting with ${c.planetaAnterior} to the point where 30° of road are left before the next one. Where she changes sign in the middle of that does not count here — Porphyry says nothing about signs.`;
    }
    return `The whole window runs ${dur(c.horasDeJanela)}: from the meeting with ${c.planetaAnterior} to her entry into ${c.proximoSigno}. The moment she changes sign, the count starts over from zero.`;
  }
  if (c.temJanelaFutura) {
    return `No window is open right now. The next one opens in ${dur(c.horasAteJanela)} and runs ${dur(c.horasDeJanelaFutura)}.`;
  }
  const d = c.diasVarridos;
  return `No window is open right now — and over the next ${d} ${d === 1 ? 'day' : 'days'}, which is as far as this sweep went, none opens by this rule either.`;
}

function proximoEncontro(c) {
  const onde = c.proximoNoSignoAtual
    ? `It perfects while she is still in ${c.signo}.`
    : `It only perfects after she enters ${c.proximoSigno}.`;
  // The remark about the disagreement only goes in when the two rules really do
  // disagree at this instant.
  const nota = !c.proximoNoSignoAtual && c.divergem
    ? ' And that detail is exactly what makes the two rules disagree right now.'
    : '';
  return `The next exact angle is ${c.aspectoComGlosa} with ${c.planeta}: in ${dur(c.horasAteProximo)}, after another ${graus(c.grausAteProximo)} of the Moon's road. ${onde}${nota}`;
}

const RELACAO_FIXA =
  'The relation between the two is fixed, and you can check it: everything the 30-degree rule calls empty, the sign-boundary rule calls empty as well — never the other way round, because the stretch left before the sign changes is never more than 30°.';

function divergencia(c) {
  if (!c.divergem) {
    if (c.foraDeCurso) {
      return `At this instant the two rules say the same thing: both see the Moon running on empty. ${RELACAO_FIXA}`;
    }
    return `At this instant the two rules say the same thing: neither of them sees empty road right now. ${RELACAO_FIXA}`;
  }
  const sim = c.foraDeCurso ? c.definicaoNaFrase : c.outraDefinicaoNaFrase;
  const nao = c.foraDeCurso ? c.outraDefinicaoNaFrase : c.definicaoNaFrase;
  return `At this instant the two rules disagree: the ${sim} rule says the Moon is void of course, and the ${nao} rule says she is not. This is not a slip in the arithmetic — they are two criteria some 1,400 years apart, cutting the same day in different places. ${RELACAO_FIXA} That is why the same night shows up as a "free day" in one app and as an ordinary night in another.`;
}

const RECIBO = {
  moderna:
    'The rule on screen is the sign-boundary one, the same one behind the "free day" tables. It comes from William Lilly, Christian Astrology, London, 1647, p. 112: "A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other." Look at "during his being in that Signe" — that is exactly where the sign enters the definition. In the Greeks it was not there.',
  porfirio:
    'The rule on screen is the old one: Porphyry of Tyre, 3rd century, in the Introduction to the Tetrabiblos, measures by the next 30° of the Moon\'s path and mentions no sign boundary at all. The earliest known definition is older still — Antiochus of Athens, 2nd century — and Gramaglia (Astrología Hermética, p. 188) records in him a variant measured in time: a day and a night, some 13° of arc.',
};

// 📐 A MEASUREMENT BY THE APP, and the last sentence labels it as one. The
// numbers come from janelasForaDeCurso() sweeping the whole of 2026, and the
// test recomputes them on every build.
const O_QUANTO_ISSO_MUDA =
  'And the size of the difference can be measured, not just asserted. Running the whole of 2026 through this same engine: by the sign-boundary rule there are 159 windows in the year, and the Moon spends 23.6% of the time void of course — close to a quarter of it. By Porphyry\'s 30-degree rule there are 5 windows in the entire year, 0.65% of the time. The same phrase, at the two ends of the tradition, names something everyday and something rare. This is a measurement by this app, not a claim from an ancient source.';

const COMO_O_MERCADO_USA =
  'The calendar advice is not ancient, and it is worth knowing where it came from. In Lilly, 1647, "void of course" is a horary judgement: it answers a question put to the astrologer and signals that nothing will come of that matter. The person who turned it into a day-to-day rule was Al H. Morrison (1916–1995), who from ~1970 on published Void-of-Course Moon tables and carried the subject to a wide audience. The contemporary astrologer Anthony Louis (2013 and 2021) argues that this reading is a misunderstanding of Lilly. All three positions are here because all three exist; what to do with them is the reader\'s call.';

const O_QUE_NAO_SE_ACHOU =
  'And what the research did not find gets said out loud: no ancient text tells anyone to hold off on starting things while the Moon is void of course. We also did not find who swapped the 30° criterion for the sign-boundary one — the switch happens somewhere between Firmicus Maternus (4th century) and Masha\'allah and Abu Ma\'shar (8th–9th centuries), and the text that would document it was not located.';

const OS_SETE_E_OS_TRES =
  'The count uses the seven bodies of old astrology: the Moon and the six she can meet — the Sun, Mercury, Venus, Mars, Jupiter and Saturn. Uranus, Neptune and Pluto stay out because none of the definitions cited here knew about them: Uranus was first seen in 1781. That changes the result, and the direction of the change is arithmetic — one more body can only add meetings, and one more meeting can only shorten a window. An app that adds the three modern planets shows shorter periods than these.';

const NOTA_CONJUNCAO =
  'One detail the app does not hide: Ptolemy lists four aspects (opposition, trine, quartile and sextile) and conjunction is not among them — two bodies at the same degree do not look at each other, they are together. The void-of-course definitions count five, conjunction included, because what they measure is the meeting that perfects. Two counts living inside the same tradition, and the app would rather show that than round it off.';

const COMO_FOI_CALCULADO =
  'How this was worked out: for each of the six bodies, the app looks for the instant when the angle with the Moon becomes exact — 0°, 60°, 90°, 120° or 180° — not "within orb". The sign change is the instant the Moon\'s longitude crosses a multiple of 30°. All of it from a calculated ephemeris, never from a table: the same engine the app uses for the rest of the sky.';

const LEITURA_DO_APP =
  'What is arithmetic and what is attribution: the instants above are measured, and anyone who wants to check them can. The meaning each era gave to that empty stretch is attribution — and here every layer shows up with the name and the century of whoever wrote it.';

const SEM_DADO_PESSOAL =
  'This reading asks nothing of you: no birth time, no city, because the Moon sits at the same point of the sky for everyone at the same moment. All your city changes is the clock those instants are shown on.';

const GLOSA =
  '"Void of course" translates a Greek word: κενοδρομία, kenodromia — kenós, empty, plus drómos, course. Running on empty.';

const INDISPONIVEL = {
  semEfemeride:
    'The ephemeris engine did not answer just now, so there is no way to say where the Moon is. The app would rather say that than estimate: an estimated time here would be invention. Opening the screen again in a moment usually sorts it out.',
  dataInvalida:
    'The date that came in is not a valid date, so there is no sky to work with. With a real date — year, month and day — the arithmetic comes straight back.',
  buscaNaoConvergiu:
    'The search for the exact instant of the next meeting did not close inside the precision the app requires. Rather than round a time off and show it as if it were certain, the app shows none.',
};

function resumoJanela(c) {
  if (c.definicaoId === 'porfirio') {
    return `Void of course for ${dur(c.duracaoHoras)}, from ${c.aspecto.toLowerCase()} with ${c.planeta} until 30° are left before ${c.aspectoSeguinte.toLowerCase()} with ${c.planetaSeguinte}.`;
  }
  return `Void of course for ${dur(c.duracaoHoras)}, from ${c.aspecto.toLowerCase()} with ${c.planeta} until she enters ${c.proximoSigno}.`;
}

const FONTE = [
  'Antiochus of Athens, 2nd century AD — the earliest known definition of κενοδρομία (the void-of-course Moon), handed down in later compilations; cited in Eduardo Gramaglia, Astrología Hermética, p. 188, which also records the variant measured in time, "a day and a night", some 13° of arc',
  'Porphyry of Tyre, Introduction to the Tetrabiblos, 3rd century AD — defines it by the next 30°, with no mention of a sign boundary (trans. James H. Holden, Porphyry the Philosopher, AFA, 2009)',
  'William Lilly, Christian Astrology, London, 1647, p. 112 — "A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other": this is where the sign boundary enters the criterion',
  'Al H. Morrison (1916–1995), The Void of Course Moon — tables and newsletters from ~1970 on: the point where a horary criterion turns into daily calendar advice',
  'Anthony Louis, "Will the Real Void-of-Course Moon Please Stand Up?" (2013) and "Lilly\'s definition of the Void of Course Moon" (2021), tonylouis.wordpress.com — the argument that Morrison\'s reading is a misunderstanding of Lilly',
  'Chris Brennan, Hellenistic Astrology: The Study of Fate and Fortune, Amor Fati, 2017 — κενοδρομία in its Hellenistic context',
  'Ptolemy, Tetrabiblos I.13 (Of the aspects of the signs), trans. F. E. Robbins, Loeb/Harvard, 1940 — the aspects that give this count its vocabulary',
];

export const PACK = {
  lang: 'en',
  termo: 'Void-of-course Moon',
  glosa: GLOSA,
  signos: SIGNOS,
  planetas: PLANETAS,
  aspectos: ASPECTOS,
  aspectosComGlosa: ASPECTOS_COM_GLOSA,
  aspectosExato: ASPECTOS_EXATO,
  definicoes: DEFINICOES,
  verbatim: VERBATIM,
  abertura,
  estado,
  janela,
  proximoEncontro,
  divergencia,
  resumoJanela,
  recibo: RECIBO,
  oQuantoIssoMuda: O_QUANTO_ISSO_MUDA,
  comoOMercadoUsa: COMO_O_MERCADO_USA,
  oQueNaoSeAchou: O_QUE_NAO_SE_ACHOU,
  osSeteEOsTres: OS_SETE_E_OS_TRES,
  notaConjuncao: NOTA_CONJUNCAO,
  comoFoiCalculado: COMO_FOI_CALCULADO,
  leituraDoApp: LEITURA_DO_APP,
  semDadoPessoal: SEM_DADO_PESSOAL,
  indisponivel: INDISPONIVEL,
  fonte: FONTE,
};
