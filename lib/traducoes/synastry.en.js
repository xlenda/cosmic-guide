// lib/traducoes/synastry.en.js
// THE ENGLISH PACK for synastry — natural American-app English, translation of
// MEANING rather than word-for-word, same exact SHAPE as the PT pack (same
// keys, same functions, same signatures).
//
// WHAT NEVER GETS TRANSLATED: the Robbins verbatim (`texto` field — identical
// English in all three packs; here it simply reads natively), the work titles
// (Tetrabiblos, Christian Astrology, Mathesis, Sun Signs...), the loci and the
// numbers. Consecrated proper names DO translate: Ptolomeu→Ptolemy,
// Manílio→Manilius, Aristóteles→Aristotle.
//
// RED LINE (rule 4 of lib/synastry.js, English cousins): relieve, soothe,
// calm, heal, cure, treat, energize — NONE of them enters, in any form.
// test/synastryIdiomas.test.js sweeps this whole pack for them.

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

const ELEMENTOS = { fogo: 'fire', ar: 'air', 'água': 'water', terra: 'earth' };

const ARTIGOS = { fogo: 'the fire', ar: 'the air', 'água': 'the water', terra: 'the earth' };

const QUALIDADES_NOME = { quente: 'hot', frio: 'cold', seco: 'dry', 'úmido': 'moist' };

function fraseQualidades(q) {
  return `${q[0]} and ${q[1]}`;
}

const MODALIDADES = {
  cardeal: {
    id: 'cardeal',
    nome: 'cardinal',
    ptolomeu: 'solstitial or equinoctial',
    glosa: 'the season turns when the Sun enters them',
  },
  fixo: {
    id: 'fixo',
    nome: 'fixed',
    ptolomeu: 'solid',
    glosa: 'the season is already settled while the Sun is in them',
  },
  mutavel: {
    id: 'mutavel',
    nome: 'mutable',
    ptolomeu: 'bicorporeal',
    glosa: 'they sit between two seasons and take part in both',
  },
};

const ARISTOTELES_LOCUS = 'Aristotle, On Generation and Corruption II.3';

const CATEGORIAS = {
  harmonico: 'harmonious',
  desarmonico: 'disharmonious',
  semAspecto: 'no aspect',
  copresenca: 'co-presence',
};

const GRAUS_IV7 = {
  1: 'what the source calls secure and indissoluble sympathy',
  2: 'sympathy — and the source calls it lesser',
  3: 'antipathy — and the source calls it lesser',
  4: 'the group the source places at the bottom',
};

// The Robbins verbatim reads natively here; the paraphrase is still the app's
// own voice (labeled on screen, never in quotes, never with a locus).
const VERBATIM = {
  quatroAspectos: {
    texto:
      'Of the parts of the zodiac those first are familiar one to another which are in aspect. These are the ones which are in opposition... those which are in trine... those which are said to be in quartile... and finally those that occupy the sextile position.',
    parafrase:
      'Of the parts of the zodiac, the ones familiar to each other are those that behold each other in aspect — and the aspects are four: opposition, trine, quartile, and sextile.',
    locus: 'Ptolemy, Tetrabiblos I.13 (Of the Aspects of the Signs), trans. Robbins, 1940',
  },
  harmonicos: {
    texto:
      'Of these aspects trine and sextile are called harmonious because they are composed of signs of the same kind, either entirely of feminine or entirely of masculine signs; while quartile and opposition are disharmonious because they are composed of signs of opposite kinds.',
    parafrase:
      'Trine and sextile are called harmonious because they join signs of the same kind — all masculine or all feminine; quartile and opposition are disharmonious because they join signs of opposite kinds.',
    locus: 'Ptolemy, Tetrabiblos I.13, trans. Robbins, 1940',
  },
  disjuntos: {
    texto:
      "'Disjunct' and 'alien' are the names applied to those divisions of the zodiac which have none whatever of the aforesaid familiarities with one another... they are found to be entirely without share in the four aforesaid aspects, opposition, trine, quartile, and sextile, and are either one or five signs apart; for those which are one sign apart are as it were averted from one another...",
    parafrase:
      'Disjunct and alien are the signs with no familiarity whatever between them: they stand outside the four aspects, one or five signs apart — and the ones next door sit as if turned away from each other.',
    locus: 'Ptolemy, Tetrabiblos I.16 (Of Disjunct Signs), trans. Robbins, 1940',
  },
  duradouro: {
    texto:
      "Marriages for the most part are lasting when in both the genitures the luminaries happen to be in harmonious aspect, that is, in trine or in sextile with one another, and particularly when this comes about by exchange; and even more when the husband's moon is in such aspect with the wife's sun.",
    parafrase:
      "Marriages tend to last when the Sun and Moon of the two charts are in harmonious aspect — trine or sextile —, above all when they exchange places, and Ptolemy gives extra weight to one person's Moon upon the other's Sun (he writes husband and wife; the app describes the figure, not the arrangement).",
    locus: 'Ptolemy, Tetrabiblos IV.5 (Of Marriage), trans. Robbins, 1940',
  },
  separacao: {
    texto:
      'Divorces on slight pretexts and complete alienations occur when the aforesaid positions of the luminaries are in disjunct signs, or in opposition or in quartile.',
    parafrase:
      'Divorces on small pretexts and complete estrangements happen when those positions of the luminaries fall in disjunct signs, in opposition, or in quartile.',
    locus: 'Ptolemy, Tetrabiblos IV.5, trans. Robbins, 1940',
  },
  modificador: {
    texto:
      'Similarly, when the luminaries are in inharmonious positions, the beneficent planets testifying to the luminaries do not completely terminate the marriages, but bring about renewals and recollections, which preserve kindness and affection.',
    parafrase:
      'Even with the luminaries in a disharmonious position, if the benefic planets bear witness, the marriage does not end for good: renewals and recollections come, preserving kindness and affection.',
    locus: 'Ptolemy, Tetrabiblos IV.5, trans. Robbins, 1940',
  },
  escala: {
    texto:
      'In inquiries regarding matters of importance we must observe the places in both nativities which have the greatest authority, that is, those of the sun, the moon, the horoscope, and the Lot of Fortune; for if they chance to fall in the same signs of the zodiac, or if they exchange places, either all or most of them... they bring about secure and indissoluble sympathy, unbroken by any quarrel. However, if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions. If they chance to be situated in neither of these ways, but merely in signs which bear an aspect to one another, if they are in trine or in sextile, they make the sympathies less, and in quartile, the antipathies less.',
    parafrase:
      'In weighty matters, one looks at the places of greatest authority in the two charts — Sun, Moon, Ascendant and Lot of Fortune. In the same signs, or exchanging places: firm sympathy no quarrel undoes. In disjunct or opposite signs: the deepest enmities and the most lasting disputes. In trine or sextile the sympathies are lesser; in quartile, the antipathies are lesser.',
    locus: 'Ptolemy, Tetrabiblos IV.7 (Of Friends and Enemies), trans. Robbins, 1940',
  },
};

const NOTA_ESCALA =
  'There is no percentage here, and the absence is deliberate. No compatibility score between signs exists in any ancient, medieval or Renaissance Western source: Ptolemy gives categories — harmonious, disharmonious, disjunct — and, in the chapter on friends and enemies, a four-step scale and a count of how many places agree ("either all or most of them"), with no unit. Traditional numerical scoring does exist in the West, but it measures something else: William Lilly\'s table of essential dignities (Christian Astrology, London, 1647) measures the strength of ONE planet in a chart, not the affinity between two people. And the only genuinely traditional compatibility score the research found is not Western — it is the Indian Ashtakoota, out of 36 points, computed by nakshatra and Moon sign, never by sun sign; another tradition, another scale, another input. A two-digit number is the strongest claim of precision there is, and nothing here backs that promise — so the app shows the aspect, which is checkable geometry, and what the source says about it.';

const NOTA_GRAU =
  'The degree is order, not measure. It comes from Ptolemy, Tetrabiblos IV.7, which orders the configurations between two charts into four steps and stops there: step 4 is not "twice as bad" as step 2, and none of the four is a verdict. In the same Tetrabiblos, IV.5, he records the union in a disharmonious position that does NOT end.';

const RESSALVA_SIGNO_SOLAR =
  'This compares sun sign with sun sign, and that cut comes from a newspaper column: it was born with R. H. Naylor in the Sunday Express of August 24, 1930, and became the weekly column "Your Stars" — that is where the public\'s sun-sign horoscope comes from. Ancient synastry is something else — in the marriage chapter (IV.5) Ptolemy compares the Sun and Moon of the two charts, with special weight on one person\'s Moon over the other\'s Sun; and in the chapter this screen\'s degree comes from (IV.7) he compares FOUR places in each chart: Sun, Moon, Ascendant and Lot of Fortune. The aspect below is real and its source is cited; applying the IV.7 scale to a pair of sun signs is this app\'s simplification, and the app would rather say so than pretend otherwise.';

const NOTA_CARACTEROLOGIA =
  'The "How it goes in real life" block that opens this reading is contemporary characterology — and the app would rather say so than let you assume otherwise. Describing personality by sun sign ("Aries people are impulsive", "Scorpios are intense") is not in Ptolemy or Manilius: it is a 20th-century practice, from Alan Leo onward, which reached the wide public through R. H. Naylor\'s newspaper column (1930) and Linda Goodman\'s books (1968 and 1978). From the ancient source comes only the skeleton beneath that text, and it is checkable: the distance between the two signs and the figure it forms (Tetrabiblos I.13 and I.16), the four elements with their two qualities each (Aristotle, On Generation and Corruption II.3), the three seasonal groups today called modality (Tetrabiblos I.11), and the planet housed in each sign (Tetrabiblos I.17). The vocabulary of temperament hung on that skeleton is ours, and it is modern. One more note, because it is easy to miss: when the text says who tends to make the first move, that rests on overcoming (kathuperterisis), a Hellenistic doctrine passed down by Antiochus, Porphyry and Rhetorius, by which, of two places in aspect, the one in the earlier sign — the one from which the other is the tenth — prevails. Where there is no aspect at all, as in aversion, there is no overcoming to invoke: there, the order is decided by modality read the modern way, and that is this app\'s reading, not the source\'s. None of this enters the degree, the category or the figure: planetary rulership, in particular, does not weigh a gram in the count (see the gap recorded in NAO_ACHADO about enemy rulers).';

const LEITURAS = {
  trigono(c) {
    return {
      aspecto: 'Trine',
      natureza: 'affinity through sameness',
      categoria: CATEGORIAS.harmonico,
      resumo: `${c.A} and ${c.B} understand each other almost without trying — same element, ${c.nomeElemA}. Trine, the figure the tradition calls harmonious.`,
      texto:
        `You two understand each other almost without trying — the same kind of thing moves ${c.A} and ${c.B}, so there is nothing to translate between you. ` +
        `And this is not us making it up. The figure's name is Trine (when one sign sees the other from an easy angle): four signs apart, 120 degrees. ` +
        `Ptolemy calls it harmonious (the source's word for a meeting of affinity) — but together with the sextile (the other easy angle), and without ranking one above the other: ` +
        `in his book, the Tetrabiblos (IV.7), the two land on the SAME step (Ptolemy orders these meetings on a ladder of four positions): "they make the sympathies less". The one who ranks the two is William Lilly, ` +
        `Christian Astrology (London, 1647, p. 106): sextile and trine are "arguments of Love, Unity and Friendship; but the Trine is more forcible". ` +
        `That is 17th-century English tradition, not Ptolemy, and that is why it does not change the step here. ` +
        `${c.A} and ${c.B} share the same element, ${c.nomeElemA}, and therefore the same two qualities: ${c.qA}. ` +
        `What differs is the modality (each sign's way of sitting inside the season): ${c.A} is ${c.modA.nome} (${c.modA.glosa}) and ${c.B} is ${c.modB.nome} (${c.modB.glosa}). ` +
        `The timing of entry changes, not what matters.`,
      forte:
        `Recognition without effort: ${c.nomeElemA} reading ${c.nomeElemA}. You two do not burn energy explaining the obvious to each other, ` +
        `and in the marriage chapter it is precisely the trine between the Sun and Moon of the two charts that Ptolemy associates with unions that last.`,
      cuidado:
        `What the geometry does not deliver here is friction. Trine describes ease, and ease pushes no one out of place — ` +
        `whatever needs to change between ${c.A} and ${c.B} starts with the two of you, because the aspect will not demand it. ` +
        `(That last sentence is the app's reading: Ptolemy says "harmonious" and stops there.)`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
      fontes: [
        'Ptolemy, Tetrabiblos I.13 — the trine is harmonious; four signs, 120 degrees',
        'Ptolemy, Tetrabiblos IV.7 — trine and sextile on the SAME step: "they make the sympathies less"',
        'William Lilly, Christian Astrology, London, 1647, Book I, p. 106 — "the Trine is more forcible": the ranking of the two harmonious aspects is his, not Ptolemy\'s',
        'Ptolemy, Tetrabiblos IV.5 — luminaries in trine across the two charts: lasting unions',
        ARISTOTELES_LOCUS + ' — the two qualities of the element ' + c.nomeElemA,
      ],
    };
  },

  sextil(c) {
    const q = c.qComum;
    return {
      aspecto: 'Sextile',
      natureza: 'affinity through one shared quality',
      categoria: CATEGORIAS.harmonico,
      resumo: `${c.A} and ${c.B} have a real meeting point and the freedom to differ on the rest. Sextile — the light angle, which the source calls harmonious.`,
      texto:
        `There is a real bond between ${c.A} and ${c.B}, with no demand to be alike: one point in common keeps the conversation standing, and the rest each of you settles your own way. ` +
        `The name for this is Sextile (when two signs see each other from a light angle): two signs apart, 60 degrees — ` +
        `harmonious (the source's word for a meeting of affinity) in Tetrabiblos I.13, and on the same step as the trine (the other easy angle) on the four-position ladder of Tetrabiblos IV.7, Ptolemy's book. ` +
        `Calling the sextile the milder of the two comes from William Lilly (Christian Astrology, 1647, p. 106: "the Trine is more forcible"), not from Ptolemy. ` +
        `In the old physics, every element is two things: ${c.artA} of ${c.A} is ${c.qA}; ${c.artB} of ${c.B}, ${c.qB}. ` +
        `What the two share is a single quality, the ${q} — not the trine's sameness, but half the road, and that count is ours, via Aristotle. ` +
        `What is Ptolemy's: two signs apart they behold each other (I.13) and they are of the same polarity (the source says "same kind": the list of signs alternates one by one, and these two fall in the same group — I.12). ` +
        `The modalities diverge (${c.A} ${c.modA.nome}, ${c.B} ${c.modB.nome}), so each one's timing is different.`,
      forte:
        `One real point of contact — the ${q} — and no obligation to match anywhere else. ` +
        `Ptolemy places the sextile next to the trine among the aspects of lasting union.`,
      cuidado:
        `Sextile is contact, not fusion: the fit is one quality wide, and the other two stay out of the count. ` +
        `Where one of you runs at a pace the other does not follow, nobody is wrong — these are different elements.`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
      fontes: [
        'Ptolemy, Tetrabiblos I.13 — the sextile is harmonious; two signs, 60 degrees',
        'Ptolemy, Tetrabiblos I.12 — the kinds of the signs alternate one by one: two signs apart, the kind is always the same',
        'Ptolemy, Tetrabiblos IV.7 — sextile and trine on the SAME step: "they make the sympathies less"',
        'William Lilly, Christian Astrology, London, 1647, Book I, p. 106 — "the Trine is more forcible": the ranking of the two harmonious aspects is his, not Ptolemy\'s',
        'Ptolemy, Tetrabiblos IV.5 — luminaries in sextile: lasting unions',
        ARISTOTELES_LOCUS + ` — ${c.nomeElemA} and ${c.nomeElemB} share the ${q}`,
      ],
    };
  },

  quadratura(c) {
    const contrarios = c.comum.length === 0;
    const mod = c.modA; // the quartile is always the SAME modality — zodiac arithmetic
    const abertura = contrarios
      ? `${c.A} is ${c.qA}; ${c.B} is ${c.qB}: no quality in common. ` +
        `By Aristotle's physics, ${c.artA} and ${c.artB} are absolute contraries — the hardest case a quartile can present ` +
        `(the physics is Aristotle's; grading one quartile as harder than another is this app's reading, not a quotation).`
      : `${c.A} is ${c.qA}; ${c.B} is ${c.qB}. The two still share the ${c.qComum} — one thread in common, and only one. ` +
        `It is not the quartile's own worst case: absolute contraries, by Aristotle's physics, would be elements with no quality in common at all ` +
        `(the physics is Aristotle's; grading one quartile as harder than another is this app's reading, not a quotation).`;
    const aberturaHumana = contrarios
      ? `The clash between ${c.A} and ${c.B} is one of the big ones: each wants to steer life its own way, with the same force and at the same time — nobody is wrong, it is temperament against temperament, with almost no neutral ground. `
      : `There is a real spark between ${c.A} and ${c.B}: each pulls its own way, with the same force and at the same time — but there is a thread holding the two ends, and it shows once the dust settles. `;
    return {
      aspecto: 'Quartile',
      natureza: contrarios ? 'friction between absolute contraries' : 'friction with one shared thread',
      categoria: CATEGORIAS.desarmonico,
      resumo: `${c.A} and ${c.B} carry real friction — each pulls its own way, with equal force. Quartile: disharmonious in the source, and the source does not decide the rest.`,
      texto:
        aberturaHumana +
        `The name for this is Quartile (the square — when two signs see each other from an angle that pinches): three signs apart, 90 degrees. ` +
        `Ptolemy lists it among the DISHARMONIOUS aspects (the source's word for a meeting of friction), and gives the reason — ` +
        `it is composed of "signs of opposite kinds". ${abertura} ` +
        `And both are ${mod.nome} signs (${mod.ptolomeu} in Ptolemy: ${mod.glosa}): same inner clock, different targets. ` +
        `You two contend for the same territory.`,
      forte:
        `You do see each other. The quartile is an aspect — both sides look at and recognize each other, and that is exactly why you manage to fight, ` +
        `to get on each other's nerves, and eventually to work things out. Aversion, which is the tradition's real "no common ground", does not even allow the fight.`,
      cuidado:
        `This one stings, and the tradition does not pretend otherwise: in the marriage chapter, Ptolemy places the quartile beside the opposition and the disjunct signs ` +
        `among the positions where separations occur. And in the SAME chapter, Ptolemy himself warns this is no sentence — with the planets the tradition calls benefic (Venus and Jupiter) ` +
        `supporting the Sun and Moon (the source's "luminaries"), the union in a disharmonious position does not end, and brings "renewals and recollections, which preserve kindness and affection". ` +
        `A tense aspect describes why the relationship aches where it aches. It does not decide the outcome, and this app does not decide for you.`,
      // The `caminho` field: see the comment block in the pt pack — same four
      // rules (no promise, concrete, sourced where a source exists, no health
      // claim and no percentage) and the same test coverage in all three langs.
      caminho: contrarios
        ? `Where to start, in practice: with no quality at all shared between ${c.artA} and ${c.artB}, neutral ground does not come ready-made — ` +
          `agreeing BEFOREHAND on who decides what, subject by subject, tends to go further than settling it in the heat of the moment. ` +
          `And it is worth remembering what the source says about this figure: William Lilly (Christian Astrology, London, 1647, p. 106) calls the quartile an "imperfect enmity" ` +
          `and, on the same page, draws from it that "the matter is not yet so farre gone" — this is the quarrel in which reconciliation is still on the table.`
        : `Where to start, in practice: the shared thread is the ${c.qComum}, and that is usually where the neutral ground comes from — ` +
          `going back to what the two already share before arguing about what divides them is the cheapest move this pair has at hand. ` +
          `And it is worth remembering what the source says about this figure: William Lilly (Christian Astrology, London, 1647, p. 106) calls the quartile an "imperfect enmity" ` +
          `and, on the same page, draws from it that "the matter is not yet so farre gone" — this is the quarrel in which reconciliation is still on the table.`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
      fontes: [
        'Ptolemy, Tetrabiblos I.13 — the quartile is disharmonious: "signs of opposite kinds"',
        'Ptolemy, Tetrabiblos IV.5 — separation; and the modifier that blocks the sentence',
        ARISTOTELES_LOCUS +
          (contrarios
            ? ` — ${c.nomeElemA} and ${c.nomeElemB} share no quality`
            : ` — ${c.nomeElemA} and ${c.nomeElemB} share the ${c.qComum}`),
        'Ptolemy, Tetrabiblos I.11 — the modality groups (here, ' + mod.nome + '); that the quartile always falls within one group is zodiac arithmetic (3 signs = same column modulo 3), not a claim of the chapter',
      ],
    };
  },

  oposicao(c) {
    const q = c.qComum;
    const mod = c.modA; // the opposition is also always the same modality
    return {
      aspecto: 'Opposition',
      natureza: 'axis — the two ends of the same diameter',
      categoria: CATEGORIAS.desarmonico,
      resumo: `${c.A} and ${c.B}: the two ends of the same axis — they complete and confront each other for the same reason. Opposition, disharmonious in the source.`,
      texto:
        `One is the reverse of the other: what attracts and what grinds between ${c.A} and ${c.B} is born in the same place, and that tug-of-war is the pair's design — not a flaw. ` +
        `The name for this is Opposition (two signs facing each other, each at one end of the same axis): the ${c.A}–${c.B} axis, six signs, 180 degrees. ` +
        `Ptolemy lists it among the disharmonious (the source's word for a meeting of friction), and Ptolemy himself ties it to Saturn, the planet of limits, when explaining the houses (Tetrabiblos I.17). ` +
        `And here is an honest detail: the reason Ptolemy gives for the meetings of friction does not quite close for this case — the hardness here is one of position, not of temperament (the arithmetic is in the sources just below). ` +
        `Nor is it explained by element: ${c.artA} and ${c.artB} share the ${q}, and these are exactly the same element pairs the sextile (the light 60-degree angle) brings together. ` +
        `The opposition's hardness is not of element but of position — it is the axis (our reading, and checkable arithmetic) — and IV.7 places it on the bottom step instead of among the harmonious. ` +
        `Both are ${mod.nome} signs (${mod.glosa}) — two poles with the same inner clock.`,
      forte:
        `What one lacks the other has to spare, and not by chance: it is the same axis seen from both ends. ` +
        `No other pair of signs completes each other for a reason this structural. ` +
        `(In the tradition, the place of marriage is counted from the Ascendant — the full chart, not just the sign. ` +
        `Reading the seventh sign from the Sun is this app's shortcut, not ancient doctrine.)`,
      cuidado:
        `A meeting of equals at contrary poles: you complete and confront each other for the same reason, and the reason is structural, not circumstantial — it is the design of the axis. ` +
        `Ptolemy places the opposition among the positions of separation — and, on the same page, records that the planets the tradition calls benefic (Venus and Jupiter), ` +
        `supporting the Sun and Moon (the source's "luminaries"), bring "renewals and recollections, which preserve kindness and affection". A description of the meeting's nature, not of its end.`,
      caminho:
        `Where to start, in practice: the axis is a single ONE, so there is almost never anything to win alone here — ` +
        `taking turns at leading, subject by subject, tends to hold up better than insisting the other cross over to your side. ` +
        `And the common ground is checkable, not a consolation: ${c.artA} and ${c.artB} share the ${q}, the very element pair the light 60-degree angle brings together — ` +
        `opening a hard conversation there is using what already exists (the arithmetic is Aristotle's physics; putting it to this use is this app's reading).`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
      fontes: [
        'Ptolemy, Tetrabiblos I.13 — the opposition is disharmonious; six signs, 180 degrees',
        'Ptolemy, Tetrabiblos I.12 — the kinds of the signs alternate one by one starting at Aries: opposite signs are therefore always of the SAME kind, and the reasoning of I.13 does not apply to the opposition',
        'Ptolemy, Tetrabiblos I.17 (the houses of the planets) — the opposition tied to Saturn: the signs opposite the luminaries are his because "their diametrical aspect is not consistent with beneficence"',
        'Ptolemy, Tetrabiblos IV.5 — separation; and the modifier that blocks the sentence',
        ARISTOTELES_LOCUS + ` — ${c.nomeElemA} and ${c.nomeElemB} share the ${q}: compatible elements`,
        'Julius Firmicus Maternus, Mathesis, 4th century — the seventh PLACE (the Descendant, counted from the Ascendant) as the place of union (consensual attribution; verbatim not verified)',
      ],
    };
  },

  aversao(c, distancia) {
    const umSigno = distancia === 1;
    const abertura = umSigno
      ? `${c.A} and ${c.B} are ONE sign apart, 30 degrees. Ptolemy describes such signs as being "as it were averted from one another".`
      : `${c.A} and ${c.B} are FIVE signs apart, 150 degrees. Ptolemy places them outside the four aspects, along with the 30-degree neighbors.`;
    const aberturaHumana = umSigno
      ? `At the start, ${c.A} and ${c.B} do not even see each other — it is not a feud, it is that nothing comes ready-made: next-door neighbors who barely cross paths. A bridge between you exists, but it is built by hand. `
      : `From where they stand, ${c.A} and ${c.B} cannot spot each other — not enmity, but distance without a window: whatever understanding exists between you, you two raised it brick by brick. `;
    return {
      aspecto: 'Aversion',
      natureza: umSigno ? 'disjunct signs — neighbors that do not see each other' : 'disjunct signs — distant ones that do not see each other',
      categoria: CATEGORIAS.semAspecto,
      resumo: `${c.A} and ${c.B} do not even see each other at the start — it is not a fight, there is no angle: Ptolemy records no aspect at ${distancia} sign${umSigno ? '' : 's'} of distance.`,
      texto:
        aberturaHumana +
        `The source's name for it is Aversion (two signs that form no angle at all with each other — neither the easy one nor the hard one). ` +
        `${abertura} This is NOT an aspect: he calls these signs "disjunct and alien" (meaning: separated and strangers to each other), and says they have no familiarity whatever with one another. ` +
        `The criterion is optical — signs in aspect see each other; these do not. ` +
        `And there is nothing on either side to hold on to: ${c.A} is ${c.nomeElemA} and ${c.modA.nome} (${c.modA.glosa}); ${c.B} is ${c.nomeElemB} and ${c.modB.nome} (${c.modB.glosa}). ` +
        `Neither the element nor the season's rhythm (the modality) in common. This is the tradition's real "no common ground" — not the quartile, as people usually say.`,
      forte:
        `Nothing here is inherited. If recognition exists between ${c.A} and ${c.B}, you two built it — ` +
        `the geometry cannot take credit for it, and strictly speaking it has nothing to say.`,
      cuidado:
        `Aversion is not a fight: it is the absence of automatic recognition, two signs that do not register each other. It is the tradition's least favorable starting point, ` +
        `and it is also where the sun-sign reading shows its limit — the couple comparison Ptolemy actually makes (the name for it is synastry) does not look at the sign alone: ` +
        `it looks at the Sun and Moon of each person's full birth chart. This describes the beginning, not the end: no ancient text decrees the outcome of anything from two signs.`,
      caminho: umSigno
        ? `Where to start, in practice: nothing here arrives by automatic recognition, so saying out loud what would otherwise be left implied — ` +
          `what each one expects of the week, and on which day — tends to spare more friction than any patching up done after the fact. ` +
          `And the source offers a useful hint: in Tetrabiblos IV.7 Ptolemy records that the bond has a KIND — by choice, by need, or through pleasure and pain — ` +
          `and where the geometry hands over no familiarity at all, what is left is the choice, spelled out (the practical application is this app's reading).`
        : `Where to start, in practice: with no angle between the two, the meeting does not happen by chance — ` +
          `fixing one point in the week that belongs to both, and repeating it, tends to go further here than any conversation about the relationship. ` +
          `And it is worth translating instead of assuming: ${c.A} and ${c.B} share neither element nor modality, so what looks obvious to one rarely reached the other whole ` +
          `(the absence of familiarity is from Tetrabiblos I.16; the practical translation is this app's reading).`,
      verbatins: [VERBATIM.disjuntos, VERBATIM.separacao],
      fontes: [
        'Ptolemy, Tetrabiblos I.16 — disjunct and alien signs, one or five signs apart',
        'Ptolemy, Tetrabiblos IV.5 — luminaries in disjunct signs among the positions of separation',
        ARISTOTELES_LOCUS + ` — ${c.nomeElemA} and ${c.nomeElemB}: distinct elements`,
        'Ptolemy, Tetrabiblos I.11 — distinct modalities (' + c.modA.nome + ' and ' + c.modB.nome + ')',
      ],
    };
  },

  copresenca(c) {
    return {
      aspecto: 'Co-presence',
      natureza: 'same sign — the geometry goes silent',
      categoria: CATEGORIAS.copresenca,
      resumo: `${c.A} with ${c.A}: two of the same starting from the same place. Co-presence, not an aspect — Ptolemy lists four, and this is not one of them.`,
      texto:
        `Two of the same in the same place: you recognize each other on sight and speak the same native language — the catch is that no one inside the pair sees it from outside. ` +
        `The name for this is Co-presence (being together in the same sign, instead of beholding each other from some angle). ` +
        `And here the tradition says something this app insists on repeating out loud: this is NOT an aspect. ` +
        `Ptolemy lists four — opposition, trine, quartile, and sextile — and repeats the list later; conjunction (today's name for two bodies together in the same sign) is not on it. ` +
        `Signs in the same place do not behold each other: they are together. ${c.A} with ${c.A} is ${c.nomeElemA} on ${c.nomeElemA}, ${c.qA} twice over, ` +
        `both ${c.modA.nome} (${c.modA.ptolomeu} in Ptolemy: ${c.modA.glosa}). No contrast to measure. ` +
        `On PLANETS together, Lilly (Christian Astrology, 1647, p. 106) says the conjunction is good or bad depending on who joins whom — on two equal signs, what the source gives is IV.7.`,
      forte:
        `You start from the same place: same element, same two qualities, same modality. ` +
        `There is no misunderstanding of temperament to translate between you.`,
      cuidado:
        `No mirror to hold things either: what one overdoes, the other overdoes the same, and there is no third point of view inside the pair. ` +
        `And notice what the app is NOT doing here: since the geometry goes silent, there is no aspect to name — ` +
        `what the source says of the same sign is that it produces "secure and indissoluble sympathy" — and that is all there is to say. ` +
        `Where there is no figure to read, this app prefers to go silent too.`,
      verbatins: [VERBATIM.quatroAspectos, VERBATIM.disjuntos],
      fontes: [
        'Ptolemy, Tetrabiblos I.13 — the list of the four aspects; conjunction is not among them',
        'Ptolemy, Tetrabiblos I.16 — "the four aforesaid aspects, opposition, trine, quartile, and sextile"',
        'William Lilly, Christian Astrology, London, 1647, Book I, p. 106 — "Conjunctions are good or bad, as the Planets in Conjunction are friends or enemies to one another": doctrine about PLANETS in conjunction, not about two equal sun signs',
        ARISTOTELES_LOCUS + ` — the two qualities of the element ${c.nomeElemA}`,
        'Ptolemy, Tetrabiblos I.11 — modality ' + c.modA.nome,
      ],
    };
  },
};

// What each planet moves in each dimension. Contemporary characterology,
// declared as such — third person singular on purpose.
const PLANETA = {
  Marte: {
    quimica: 'shows up, asks, and already knows the answer',
    conversa: 'opens with the problem and wants the problem solved today',
    briga: 'raises their voice before thinking',
    casa: 'muscles through and hates asking for help',
    prazo: 'needs a target up ahead to keep from getting bored',
  },
  'Vênus': {
    quimica: 'leaves the question hanging longer than needed, because the waiting is half the pleasure',
    conversa: 'keeps coming back to who was gracious to whom, and how',
    briga: 'goes stone-faced and pushes the talk to the next day',
    casa: 'sets the house and the mood before anyone visits',
    prazo: 'needs to feel chosen again, and often',
  },
  'Mercúrio': {
    quimica: 'sends three messages before laying a hand on anyone',
    conversa: 'arrives with three topics and drops the first one midway',
    briga: 'argues to win, not to understand',
    casa: 'makes the list and hands out the chores',
    prazo: 'needs there to still be something new to talk about',
  },
  Lua: {
    quimica: 'wants the familiar scent on the pillow before wanting anything else',
    conversa: 'talks about what stung three days after it stung',
    briga: 'withdraws and lets the silence weigh',
    casa: 'looks after the small stuff nobody notices',
    prazo: 'needs to feel safe to stay open',
  },
  Sol: {
    quimica: 'wants to be looked at right away, and notices right away when they are not',
    conversa: 'brings up the big plan and what you two are building',
    briga: 'takes it in the pride and hardens',
    casa: "wants to be the household's reference point",
    prazo: 'needs to hear the recognition out loud',
  },
  'Júpiter': {
    quimica: 'turns the night into an outing and the outing into a story to tell later',
    conversa: 'starts talking about travel and ends up talking about the meaning of things',
    briga: 'drops one truth too big and spends the week regretting it',
    casa: 'spends more than planned and promises more than fits',
    prazo: 'needs open horizon, not a leash',
  },
  Saturno: {
    quimica: 'takes their time, tests the ground, and once they let go it is all at once',
    conversa: 'brings work, money, and what can be sustained through the end of the month',
    briga: 'turns cold and starts collecting on what was agreed',
    casa: 'runs the bills, the calendar, and what was agreed',
    prazo: 'needs commitment spelled out in full',
  },
};

const MESMO_REGENTE_LEAD = {
  quimica: 'run on the same engine',
  conversa: 'pull from the same place',
  briga: 'ignite the same way',
  casa: 'run the household the same way',
  prazo: 'need the same thing to stay standing',
};

function fraseRegentes(c, campo) {
  const a = PLANETA[c.regA][campo];
  const b = PLANETA[c.regB][campo];
  if (c.A === c.B) {
    return `With the same sign on both sides, ${c.A} ${a} — and the trait comes doubled, with no one to counter it.`;
  }
  if (c.regA === c.regB) {
    return `${c.A} and ${c.B} ${MESMO_REGENTE_LEAD[campo]}, and the portrait fits both: each one ${a}.`;
  }
  return `${c.A} ${a}; ${c.B} ${b}.`;
}

const QUIMICA_CAMA = {
  copresenca: 'you two want the same thing at the same hour, and nobody leads: there is nowhere for one to look at the other from above',
  trigono: 'you two find the rhythm on the first night, and the problem here is never lack of desire',
  sextil: 'it starts slower than either of you expected and gets better with time, which is the opposite of how it usually goes',
  quadratura: 'what grates by day is exactly what pulls by night',
  oposicao: "in bed the day's argument continues by other means, and that is where it works",
  aversao30: 'early on one of you always thinks they want it more than the other, and it is almost never true: only the response time differs',
  aversao150: 'the wanting does not arrive together, it arrives when one of you decides it has',
};

const QUIMICA_FIGURA = {
  copresenca: (c) => `With ${c.A} on both sides, desire is a mirror: you recognize your own wanting in the other and light up with nothing to translate — ${QUIMICA_CAMA.copresenca}.`,
  trigono: (c) => `Between ${c.A} and ${c.B} desire runs loose because you both want the same thing in the same language — ${QUIMICA_CAMA.trigono}.`,
  sextil: () => `The attraction between you is one of curiosity: there is a real meeting point and enough difference to keep it interesting — ${QUIMICA_CAMA.sextil}.`,
  quadratura: (c) => `Desire between you is born of friction, and ${c.A} and ${c.B} know it better than they admit: ${QUIMICA_CAMA.quadratura}.`,
  oposicao: () => `You attract each other by the reverse: what fascinates you in the other is exactly what you lack, and neither of you admits it out loud — ${QUIMICA_CAMA.oposicao}.`,
  aversao30: () => `Between you, desire does not come ready-made: that spark of instant recognition is missing, and what exists was built by living side by side — ${QUIMICA_CAMA.aversao30}.`,
  aversao150: () => `Attraction between you tends to grow from the outside in, because nothing about your meeting is automatic — ${QUIMICA_CAMA.aversao150}.`,
};

const QUIMICA_ELEMENTO = {
  'fogo+fogo': () => 'Fire with fire lights fast, burns high, and has zero patience for beating around the bush.',
  'terra+terra': () => 'Earth with earth is physical, unhurried desire: skin, scent, repetition, and a declared taste for what is already known to work.',
  'ar+ar': () => 'Air with air lights up through the head — the right sentence at the right moment is worth more here than any move.',
  'água+água': () => 'Water with water is emotional desire before it is physical: when the mood is off, the body knows first.',
  'ar+fogo': (c) => `${c.el('ar')} lights up through the head and ${c.el('fogo')} through the body, and that mismatch of entry doors is what keeps you both curious.`,
  'terra+água': (c) => `${c.el('água')} comes in through the mood and ${c.el('terra')} through touch, and the two doors open onto the same room — a desire easier to sustain than to explain.`,
  'fogo+terra': (c) => `${c.el('fogo')} wants it now and ${c.el('terra')} wants it done right: the friction starts at the clock, and it is the same friction that holds the attraction.`,
  'fogo+água': (c) => `${c.el('fogo')} advances and ${c.el('água')} feels before answering — when your timing lines up it is electric, and when it does not, one feels refused and the other rushed.`,
  'ar+terra': (c) => `${c.el('ar')} wants to talk about desire and ${c.el('terra')} wants to practice it in silence, and neither immediately understands why the other insists on the opposite.`,
  'ar+água': (c) => `${c.el('água')} needs a mood and ${c.el('ar')} needs lightness: it works very well as long as neither demands the other speak their language.`,
};

const QUIMICA_MODALIDADE = {
  'cardeal+cardeal': () => 'The risk is desire becoming the thing you both put off, because both of you only know how to start.',
  'fixo+fixo': () => 'The risk is desire turning into habit and the two of you repeating the same script for months, never complaining and never changing a thing.',
  'mutavel+mutavel': () => 'The risk is the topic changing, the plan changing and the wanting changing with them, missing the repetition that turns attraction into intimacy.',
  'cardeal+fixo': (c) => `It cools when ${c.md('cardeal')} proposes something new and ${c.md('fixo')} wants what already worked, and one reads the other as haste or as standing still.`,
  'cardeal+mutavel': (c) => `It cools when ${c.md('cardeal')} decides and ${c.md('mutavel')} adapts, until the day adapting costs too much.`,
  'fixo+mutavel': (c) => `It cools when ${c.md('fixo')} wants assurance and ${c.md('mutavel')} wants the freedom to change their mind, and that is the conversation that always finds its way back to bed.`,
};

const CONVERSA_FIGURA = {
  copresenca: () => `You understand each other at half a sentence, and what nobody brings up is precisely the flaw you both share.`,
  trigono: () => `You talk without effort and without translation, and the topic nobody brings up is the one that would require disagreeing.`,
  sextil: () => `You never run out of easy topics and owe each other no agreement, and what nobody brings up is the underlying deal, because everything is working.`,
  quadratura: () => `You two argue well: the conversation has a thesis, a counter-thesis and a scoreboard, and what nobody brings up is the apology.`,
  oposicao: () => `You talk like two sides of the same question, and each sentence of one answers something the other never got to say — what nobody brings up is the question of who gives way.`,
  aversao30: () => `Between you there is no ready-made topic: the conversation has to be pulled, almost always by the same one, and what nobody brings up is what would require explaining why it matters.`,
  aversao150: () => `You start from distant references and spend a good part of your breath explaining the obvious to each other, and what nobody brings up is each one's past, which stays in separate boxes.`,
};

const CONVERSA_ELEMENTO = {
  'fogo+fogo': () => 'Two fire signs talk loud, get excited together and cut each other off without malice: the topic moves faster than the listening.',
  'terra+terra': () => 'Two earth signs talk little and settle much, and what they both call a conversation is usually a practical arrangement.',
  'ar+ar': () => 'Two air signs talk for sport, and what stalls is not lack of subject — it is lack of conclusion.',
  'água+água': () => 'Two water signs say plenty without saying: half the conversation happens in glances, tone and silence, and the other half is left for later.',
  'ar+fogo': (c) => `${c.el('ar')} brings the topic and ${c.el('fogo')} brings the opinion, and it is a fast conversation that rarely gets dull.`,
  'terra+água': (c) => `${c.el('água')} talks about what they felt and ${c.el('terra')} answers with what can be done, and what is missing is agreeing on when one wants a solution and when one just wants to be heard.`,
  'fogo+terra': (c) => `${c.el('fogo')} speaks in blocks and already wants to decide, ${c.el('terra')} asks for detail before agreeing, and what stalls is pace, not content.`,
  'fogo+água': (c) => `${c.el('fogo')} says the blunt thing that ${c.el('água')} tends to chew on for days, and the topic sometimes resurfaces the following week.`,
  'ar+terra': (c) => `${c.el('ar')} theorizes and ${c.el('terra')} wants the concrete example: the classic misunderstanding is one finding the other shallow and the other finding the first complicated.`,
  'ar+água': (c) => `${c.el('ar')} explains the feeling and ${c.el('água')} feels the explanation, and when things heat up one flees into logic and the other into silence.`,
};

const CONVERSA_MODALIDADE = {
  'cardeal+cardeal': () => 'Who yields the topic: neither of you, which is why the conversation that matters tends to become two parallel conversations.',
  'fixo+fixo': () => 'Who yields the topic: nobody yields, but you both shelve it — the subject leaves the table whole and returns identical weeks later.',
  'mutavel+mutavel': () => 'Who yields the topic: both, gladly, which is why the subject that matters gets pushed to next Sunday.',
  'cardeal+fixo': (c) => `Who yields the topic: ${c.md('cardeal')}, already keen to wrap up and move on, while ${c.md('fixo')} stays on the same point.`,
  'cardeal+mutavel': (c) => `Who yields the topic: ${c.md('mutavel')}, who changes course without complaint and only later notices they were not heard.`,
  'fixo+mutavel': (c) => `Who yields the topic: ${c.md('mutavel')}, and ${c.md('fixo')} picks the subject back up and returns it in the next sentence, unchanged.`,
};

const BRIGA_FIGURA = {
  copresenca: () => `You fight over the shared flaw: each sees in the other what they cannot stand in themselves, and the way back comes when you both tire at the same time.`,
  trigono: () => `The recurring reason between you tends to be small and dissolves by the next day, because neither of you has a taste for keeping a conflict standing.`,
  sextil: () => `What cuts between you is distance: nothing explodes, but one of you disappears for a few days and the other does not ask.`,
  quadratura: () => `You fight over territory — you both want to run the same thing at the same time — and the way back usually comes from fatigue, not agreement.`,
  oposicao: () => `Your fight is always the same one under different names, how much each gives way, and the way back tends to be quick because neither of you gets used to being without the counterpoint.`,
  aversao30: () => `Between you the recurring reason is pure misunderstanding: one said one thing and the other heard another, and the way back depends on someone explaining what seemed obvious.`,
  aversao150: () => `What stings between you is the feeling of not being taken seriously, and the reconnection usually comes from outside, through some practical matter that forces you to talk.`,
};

const BRIGA_ELEMENTO = {
  'fogo+fogo': () => 'You both blow up, and blow up together: it spikes in ten seconds and drops almost as fast, as long as nobody keeps score.',
  'terra+terra': () => 'Neither of you yells: you both sulk, work in silence and let the conversation age for days.',
  'ar+ar': () => 'The disagreement becomes a debate, whoever argues best wins, and that is why nobody walks away satisfied.',
  'água+água': () => 'Nobody says what stung in the moment: you drift apart, cry separately and come back when the weather shifts on its own.',
  'ar+fogo': (c) => `${c.el('fogo')} explodes and ${c.el('ar')} rationalizes, and nothing annoys someone angry more than hearing a well-built argument.`,
  'terra+água': (c) => `${c.el('água')} gets wounded and ${c.el('terra')} hardens, and their two silences mean different things that nobody translates.`,
  'fogo+terra': (c) => `${c.el('fogo')} stamps their foot on the spot and ${c.el('terra')} does not answer, then returns to the subject three days later with everything noted down.`,
  'fogo+água': (c) => `${c.el('fogo')} yells and forgets, ${c.el('água')} does not yell and does not forget: it is a difference of memory, not of love.`,
  'ar+terra': (c) => `${c.el('ar')} wants to discuss the relationship and ${c.el('terra')} wants to stop talking and act, and each calls the other's method an escape.`,
  'ar+água': (c) => `${c.el('ar')} turns the matter into a joke to clear the air and ${c.el('água')} reads the joke as not caring.`,
};

const BRIGA_MODALIDADE = {
  'cardeal+cardeal': () => 'Duration: short and frequent, because you both want it settled now and restarted now.',
  'fixo+fixo': () => 'Duration: long, because neither backs down first — and the reconnection comes through a practical gesture, almost never a formal apology.',
  'mutavel+mutavel': () => 'Duration: open-ended, because the conflict does not end, it dissolves, and sometimes reappears months later wearing different clothes.',
  'cardeal+fixo': (c) => `Duration: ${c.md('cardeal')} wants it settled today and ${c.md('fixo')} needs time, and rushing the second is what stretches the matter most.`,
  'cardeal+mutavel': (c) => `Duration: short, because ${c.md('mutavel')} gives in before the end — and giving in too early is what brings the same reason back.`,
  'fixo+mutavel': (c) => `Duration: ${c.md('fixo')} holds the grudge while ${c.md('mutavel')} has already changed the subject, and that clock difference becomes the second reason.`,
};

const CONVIVENCIA_FIGURA = {
  copresenca: (c) => `Day to day, ${c.A} and ${c.B} have the same quirks and the same gaps: what one leaves for tomorrow, the other leaves too.`,
  trigono: (c) => `Day to day, ${c.A} and ${c.B} coordinate without a meeting, because the priorities are born alike.`,
  sextil: (c) => `Day to day, ${c.A} and ${c.B} help each other without blending: each keeps their corner, and the ends meet at the end of the month.`,
  quadratura: (c) => `Day to day, ${c.A} and ${c.B} contend for the same spot in the house and on the calendar, and the friction shows up more on an ordinary Tuesday than in any big crisis.`,
  oposicao: (c) => `Day to day, ${c.A} and ${c.B} split life by poles: what one does well, the other does not touch — and it works, until one of you feels alone in their own department.`,
  aversao30: (c) => `Day to day, ${c.A} and ${c.B} trip over the small stuff — schedules, dishes, who tells whom —, and none of it is big while all of it is daily.`,
  aversao150: (c) => `Day to day, ${c.A} and ${c.B} live almost in parallel, each with a full routine of their own, and you have to book a meeting inside your own home.`,
};

const CONVIVENCIA_ELEMENTO = {
  'fogo+fogo': () => 'Money comes in and goes out fast: you both spend on what brings pleasure and postpone what is boring.',
  'terra+terra': () => 'Bills on time, house in order, chores split as agreed — it is comfortable, and it runs the risk of becoming pure administration.',
  'ar+ar': () => 'The house stays full of people and plans, and the routine is the post nobody wants to take.',
  'água+água': () => 'The house becomes a refuge: it takes everyone in, keeps everything, and sometimes leaves little room for the two of you.',
  'ar+fogo': (c) => `${c.el('fogo')} decides and ${c.el('ar')} negotiates, and neither wants the boring part, which is the bill due on the tenth.`,
  'terra+água': (c) => `${c.el('terra')} holds up the structure and ${c.el('água')} holds up the mood: it is a division that works well and needs to be said out loud so it does not turn into resentment.`,
  'fogo+terra': (c) => `${c.el('fogo')} wants to change house, car and city while ${c.el('terra')} wants to finish paying for the first one, and money is the topic that returns most.`,
  'fogo+água': (c) => `${c.el('fogo')} steers the boat outward and ${c.el('água')} steers it inward, and each one's family enters the equation more than either would like.`,
  'ar+terra': (c) => `${c.el('terra')} handles what is fixed and ${c.el('ar')} handles what varies, and it works until the day one of you tires of their own role.`,
  'ar+água': (c) => `${c.el('ar')} plans and ${c.el('água')} senses whether the plan fits, and the household routine is what slips to later fastest.`,
};

const CONVIVENCIA_MODALIDADE = {
  'cardeal+cardeal': () => 'Who decides: you both want to, and the arrangement that works is splitting territories instead of splitting every decision.',
  'fixo+fixo': () => 'Who decides: whoever decided the first time, because what became habit in this house lives long.',
  'mutavel+mutavel': () => 'Who decides: depends on the day, and that is where the house gets fragile — great at improvising, poor at anything that needs a date.',
  'cardeal+fixo': (c) => `Who decides: ${c.md('cardeal')} proposes and pushes, and ${c.md('fixo')} holds veto power and uses it.`,
  'cardeal+mutavel': (c) => `Who decides: ${c.md('cardeal')}, almost always, and ${c.md('mutavel')} discovers their own opinion only after it has been run over.`,
  'fixo+mutavel': (c) => `Who decides: ${c.md('fixo')} on the root things — home, bills, deadlines — and ${c.md('mutavel')} on everything that changes weekly.`,
};

const LONGO_FIGURA = {
  copresenca: (c) => `What holds ${c.A} and ${c.B} is recognition: nobody here needs to explain who they are.`,
  trigono: (c) => `What holds ${c.A} and ${c.B} is the ease, and the ease is precisely what demands change from no one.`,
  sextil: (c) => `What holds ${c.A} and ${c.B} is the freedom: the bond is real and does not require either of you to stop being who you are.`,
  quadratura: (c) => `What holds ${c.A} and ${c.B} is that both take the dispute seriously — grinding over something you both want is a sign you both still want it.`,
  oposicao: (c) => `What holds ${c.A} and ${c.B} is the mutual need for a counterpoint: each uses the other to see their own blind spot.`,
  aversao30: (c) => `What holds ${c.A} and ${c.B} is what was built by hand, because nothing here came free.`,
  aversao150: (c) => `What holds ${c.A} and ${c.B} is the repeated choice: with no automatic recognition, every day together is a decision made again.`,
};

const LONGO_ELEMENTO = {
  'fogo+fogo': () => 'Two fire signs last as long as there is a shared project to push, and what asks for conscious work is boredom, which here turns into fighting over nothing.',
  'terra+terra': () => 'Two earth signs last by building, because what was made together weighs in their favor, and what asks for conscious work is not letting life become pure upkeep.',
  'ar+ar': () => 'Two air signs last as long as they stay interesting to each other, and what asks for conscious work is the day the conversation runs thin.',
  'água+água': () => 'Two water signs last by the emotional bond, which is strong and needs no words, and what asks for conscious work is learning to say what you both already know.',
  'ar+fogo': (c) => `${c.el('ar')} and ${c.el('fogo')} last by movement — as long as there is a new plan, there is fuel —, and what asks for conscious work is the still part of life.`,
  'terra+água': (c) => `${c.el('terra')} and ${c.el('água')} last by mutual care, which here is real, and what asks for conscious work is not mistaking care for control.`,
  'fogo+terra': (c) => `${c.el('fogo')} and ${c.el('terra')} last by respect for what the other does well, and what asks for conscious work is timing, which is never the same for both.`,
  'fogo+água': (c) => `${c.el('fogo')} and ${c.el('água')} last by intensity, which they recognize in each other from afar, and what asks for conscious work is the temperature, which is negotiated rather than won.`,
  'ar+terra': (c) => `${c.el('ar')} and ${c.el('terra')} last by practical complementarity, and what asks for conscious work is the recurring feeling of being alone in company.`,
  'ar+água': (c) => `${c.el('ar')} and ${c.el('água')} last by weightless tenderness, and what asks for conscious work is the hour of the serious talk, which you both postpone.`,
};

const LONGO_FECHO = {
  harmonico: 'Ease is not a promise either: what is described here is the shape of the thing, and the outcome remains yours, the two of you.',
  desarmonico: 'And let it be said, because it is what the tradition records and the market hides: friction is no sentence — the very source this app cites describes the union in a hard position that does not end, and mends itself again.',
  semAspecto: 'And this describes your beginning, not your end: the lack of automatic recognition is a starting point, and a starting point decides no outcome.',
  copresenca: 'Likeness is not a promise either: what is described here is the shape of the thing, and the outcome remains yours, the two of you.',
};

const CHAMADA = {
  copresenca: (c) => `${c.A} with ${c.B}: two of the same in the same place, and the mirror shows everything — including what nobody wanted to see.`,
  trigono: (c) => `${c.A} and ${c.B}: same language, same rhythm of desire, and the first move almost always comes from ${c.lider}.`,
  sextil: (c) => `${c.A} and ${c.B}: a real bond with room to spare — ${c.lider} pulls, ${c.segue} keeps pace, and nobody feels smothered.`,
  quadratura: (c) => `${c.A} and ${c.B}: what grates by day is what lights up by night, and the one pushing the relationship forward is ${c.lider}.`,
  oposicao: (c) => `${c.A} and ${c.B}: magnet and tug-of-war on the same rope. Neither gives way first, and that is what pulls and that is what wears.`,
  aversao30: (c) => `${c.A} and ${c.B}: nothing here comes ready-made, not the desire and not the conversation, and the bridge usually gets raised by ${c.lider}.`,
  aversao150: (c) => `${c.A} and ${c.B}: two worlds that do not cross by accident — ${c.lider} makes the first move, and what exists between you was chosen.`,
};

export const PACK = {
  lang: 'en',
  signos: SIGNOS,
  elementos: ELEMENTOS,
  artigos: ARTIGOS,
  qualidades: QUALIDADES_NOME,
  fraseQualidades,
  modalidades: MODALIDADES,
  categorias: CATEGORIAS,
  grausIV7: GRAUS_IV7,
  aristotelesLocus: ARISTOTELES_LOCUS,
  notaEscala: NOTA_ESCALA,
  notaGrau: NOTA_GRAU,
  ressalvaSignoSolar: RESSALVA_SIGNO_SOLAR,
  notaCaracterologia: NOTA_CARACTEROLOGIA,
  verbatim: VERBATIM,
  leituras: LEITURAS,
  planeta: PLANETA,
  mesmoRegenteLead: MESMO_REGENTE_LEAD,
  fraseRegentes,
  quimicaCama: QUIMICA_CAMA,
  quimicaFigura: QUIMICA_FIGURA,
  quimicaElemento: QUIMICA_ELEMENTO,
  quimicaModalidade: QUIMICA_MODALIDADE,
  conversaFigura: CONVERSA_FIGURA,
  conversaElemento: CONVERSA_ELEMENTO,
  conversaModalidade: CONVERSA_MODALIDADE,
  brigaFigura: BRIGA_FIGURA,
  brigaElemento: BRIGA_ELEMENTO,
  brigaModalidade: BRIGA_MODALIDADE,
  convivenciaFigura: CONVIVENCIA_FIGURA,
  convivenciaElemento: CONVIVENCIA_ELEMENTO,
  convivenciaModalidade: CONVIVENCIA_MODALIDADE,
  longoFigura: LONGO_FIGURA,
  longoElemento: LONGO_ELEMENTO,
  longoFecho: LONGO_FECHO,
  chamada: CHAMADA,
};
