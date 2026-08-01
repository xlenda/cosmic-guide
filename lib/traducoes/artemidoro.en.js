// lib/traducoes/artemidoro.en.js
// THE ENGLISH PACK for the five species of dream — natural American app
// English.
//
// Same SHAPE as lib/traducoes/artemidoro.pt.js: same keys, same fields,
// functions with the same signature. What NEVER changes between packs: the
// attalus.org verbatim (translating a quotation falsifies it), the loci
// (1.2.45 stays 1.2.45), the Greek and its transliteration, and the internal
// KEYS — species ids are the transliterated Greek names in all three packs,
// because they are data, not screen text.
//
// Every rule from the header of lib/artemidoro.js applies to each string here:
// hook first and source second, a locus on every historical claim, nothing
// about anybody's body, no verdict and no promise, and — the one that matters
// most in this feature — SORTING IS NOT INTERPRETING. Nowhere does this pack
// say "your dream means that…".
//
// One visible consequence of the body rule: the list in 1.9 has six items and
// the sixth is the state of the dreamer's body. The quotation carries an
// ellipsis there and verbatim.checklist19.elisao says so out loud, with the
// locus, so anyone can go read the full list in the source.

function recibo({ autor, obra, locus, quando }) {
  return `${autor}, ${obra} ${locus}, ${quando}`;
}

const AUTORES = {
  oneirocritica: 'Artemidorus of Daldis',
  macrobio: 'Macrobius',
  edicaoPack: 'Roger A. Pack',
  harrisMcCoy: 'Daniel E. Harris-McCoy',
  hammondThonemann: 'Martin Hammond and Peter Thonemann',
};

// ---------------------------------------------------------------------------
// THE QUOTATIONS — verbatim, never translated
// ---------------------------------------------------------------------------
const VERBATIM = {
  definicao11: {
    texto: 'A dream differs from a vision in that the one is indicative of what is to come, the other of what is.',
    parafrase:
      'One of the two points at what is coming; the other at what already is. That is the line between enhypnion and oneiros — and English translations disagree about which English word belongs to which Greek term, which is exactly why this app keeps the Greek.',
    locus: 'Artemidorus of Daldis, Oneirocritica 1.1, English trans. from attalus.org',
    elisao: null,
  },
  checklist19: {
    texto:
      "[the interpreter must know] the dreamer's identity, occupation, birth, financial status, … and age. Also, the nature of the dream itself must be examined accurately.",
    parafrase:
      'Before interpreting anything you have to know who the person is, what they do for a living, where they come from, how much they have and how old they are — and the dream itself has to be examined carefully.',
    locus: 'Artemidorus of Daldis, Oneirocritica 1.9, English trans. from attalus.org',
    elisao:
      "The ellipsis is ours, and here it is out loud: at that point the original list carries a sixth item, the state of the dreamer's body. It exists, it sits in Oneirocritica 1.9 for anyone who wants to check it, and the app does not use it — because nothing here speaks about anybody's body.",
  },
  prefacio: {
    texto:
      'I did not rely upon any simple theory of probabilities but rather on experience and the testimony of actual dream-fulfillments.',
    parafrase:
      'He presents himself as someone who collected verified outcomes, not as someone who received a revelation — and that is what Book V, with its 95 cases, is there to back up.',
    locus: 'Artemidorus of Daldis, Oneirocritica, preface, English trans. from attalus.org',
    elisao: null,
  },
};

// ---------------------------------------------------------------------------
// THE HOOK — real life, no proper name, no paragraph number, no Greek
// ---------------------------------------------------------------------------
const CHAMADA = {
  neutra:
    'You had a fight with someone at seven in the evening and dreamed about the same fight at midnight. Is that a message, or is it just the day coming back? ' +
    'Before asking what a dream means, there is another question, and almost no app asks it: it is the one that decides whether there is anything to say at all.',
  enhypnion:
    'From what you answered, the dream handed you back the day you had. Go to bed hungry and you dream that you eat; go to bed furious at your boss and your boss shows up. ' +
    'That has a name, it has an owner, and it is almost two thousand years old — and the first thing the name does is take some weight off your dream.',
  oneiros:
    'From what you answered, this was not your day coming back: people, a place or a whole scene walked in that you did not live through that day. ' +
    'From here comes the second question, the one almost nobody asks: whose dream is this?',
};

// ---------------------------------------------------------------------------
// THE EXPLANATION — opens concrete, closes with the receipt
// ---------------------------------------------------------------------------
const EXPLICACAO = {
  neutra:
    'A brutal day at work, the boss on your back the whole time, and at night there he is in the dream. In the morning you type "dreaming about my boss" into Google and the first result says it is fear of authority. ' +
    'Except that what happened at five in the afternoon explains it better.' +
    '\n\n' +
    'The person who first put those two things apart in writing — the dream that hands the day back and the dream that brings something else — was Artemidorus of Daldis, in the Oneirocritica, 2nd century AD. ' +
    'Five books: the fourth one is about method and the fifth is a collection of 95 dreams with the outcome written down. It is not a symbol dictionary; it is a manual on how to ask.' +
    '\n\n' +
    'He has a word for each kind. Enhypnion (in Greek — the dream that mirrors what the person is living through) is the hungry one dreaming that he eats, the thirsty one dreaming that he drinks, the frightened one seeing what he fears, the one in love dreaming of the person he loves: the examples are his, in 1.2. ' +
    'Oneiros is the other one, the dream that is significant of what is to come (1.1).' +
    '\n\n' +
    'Only after that come the five species, and they answer a different question: whose dream is it — yours alone, about someone you know, about the two of you, about your city, or about the world (1.2.45–55)? ' +
    'Answer and the app says which drawer your report lands in, with the paragraph next to it. It does not say what the dream means: on his account that depends on who you are, and in 1.9 he lists what would have to be known first.',
  enhypnion:
    'A brutal day at work, the boss on your back the whole time, and at night there he is in the dream. In the morning comes the Google search, and the first result says a boss in a dream is fear of authority. ' +
    'Except that what happened at five in the afternoon explains it better: the dream handed the day back to you.' +
    '\n\n' +
    'This has had a name since the 2nd century AD. Artemidorus of Daldis, in the Oneirocritica, calls enhypnion (in Greek — the dream that mirrors what the person is living through) the dream made out of right now. ' +
    'The examples are his, in 1.2: the hungry man dreams that he eats, the thirsty one that he drinks, the frightened one sees what he fears, the one in love dreams of the person he loves. On his account this kind announces nothing — it is a mirror of what is, not notice of what comes.' +
    '\n\n' +
    'The sentence that splits the two is in 1.1, and it is short: "A dream differs from a vision in that the one is indicative of what is to come, the other of what is." ' +
    'English translations disagree about which word belongs to which Greek term, and that is why this app keeps the Greek: enhypnion for the dream of what is, oneiros for the dream of what is to come.' +
    '\n\n' +
    'None of this is a verdict about your night. It is the drawer the source puts your report in, with the paragraph beside it. ' +
    'If tomorrow you look closer and answer differently, the drawer changes — and that is how he worked anyway: by the whole report and by the person who gave it (1.9).',
  oneiros:
    'Some dreams the day does not explain. You had not thought about that person, had not walked near that place, were not angry or scared of anything — and the scene still showed up whole, with people, an address and a time.' +
    '\n\n' +
    'For that one Artemidorus of Daldis uses a different word: oneiros (in Greek — the dream that is significant of what is to come), and he keeps it apart from enhypnion, the dream made out of what the person was already living through. ' +
    'The distinction is in Oneirocritica 1.1–1.2, 2nd century AD, and the sentence is this one: "A dream differs from a vision in that the one is indicative of what is to come, the other of what is."' +
    '\n\n' +
    'Landing on that side does not mean the dream announces what you are hoping for, or anything good or bad. It means only this, and only from your own report: it is not your day coming back.' +
    '\n\n' +
    'This is where the five species come in. Before any symbol at all, he asks whose the dream is: yours alone, about someone you know, about the two of you, about your city, or about the world (1.2.45–55). ' +
    'It is a structural question, taken straight from the text, and it is the one the app asks next — instead of opening a dictionary of images.',
};

// ---------------------------------------------------------------------------
// THE FIVE SPECIES — Oneirocritica 1.2.45–55
// ---------------------------------------------------------------------------
const ESPECIES = {
  idioi: {
    nome: 'yours alone',
    oQueE: 'The dream is yours from start to finish: you are the one acting and the one going through it, and nobody else has a part in the scene.',
    exemplo: 'You are late, you run, you miss the bus and you miss the interview — and there is nobody else there.',
  },
  allotrioi: {
    nome: 'about someone else',
    oQueE: 'The dream is about another person, and it is someone you know: your mother, your boss, your ex. You are there as the one watching.',
    exemplo: 'Your mother walks into a house you have never seen, and you stay at the door, watching.',
  },
  koina: {
    nome: 'about the two of you',
    oQueE: 'You and somebody else, together in the same scene, both of you with a part in what happens.',
    exemplo: 'You and the person you sleep next to are arguing inside a parked car, and you are both talking.',
  },
  demosia: {
    nome: 'about your city',
    oQueE: 'The dream belongs to nobody in particular: it belongs to the place that belongs to everyone — the square, the street, the harbor, the temple.',
    exemplo: 'The square downtown packed with people you do not know, and something happening in the middle of it.',
  },
  kosmika: {
    nome: 'about the world',
    oQueE: 'The sky and the weather: what shows up overhead and reaches everyone at once.',
    exemplo: 'The sky turns red in the middle of the afternoon and the whole street stops to look.',
  },
};

const ESPECIE_TEXTO = (e) =>
  `From what you answered, the dream is ${e.nome} — ${e.transliteracao} (${e.grego}), on the list of five. ${e.oQueE}`;

const SEM_ESPECIE = {
  faltaResposta:
    'One answer is still missing before anyone can say whose dream this is — and the app would rather say it is missing than pick one of the five blind.',
  pessoaDesconhecida:
    'You said you do not know the person who showed up, and this is where the app stops. The second of the five species is defined in so many words as another person KNOWN to the dreamer (1.2.45). ' +
    'What Artemidorus does with a stranger, this research never read — and pushing your report into the closest-looking drawer would be inventing method in his name.',
  foraDaLista:
    'The five species say WHOSE the dream is: you, someone you know, the two of you, the city, the world (1.2.45–55). ' +
    'You answered that it is none of those, and the list ends there — there is no sixth drawer in the source, and the app does not open one. It stays without a species, and that is stated.',
};

// ---------------------------------------------------------------------------
// THE VOCABULARY OF 1.1–1.2
// ---------------------------------------------------------------------------
const VOCABULARIO = {
  enhypnion: {
    nome: 'the dream that hands the day back',
    oQueE:
      'It mirrors what the person is living through while asleep: the hunger, the fear, the missing someone, the fight that would not leave their head. On Artemidorus’ account this kind announces nothing — and the examples are his.',
  },
  oneiros: {
    nome: 'the dream that brings something else',
    oQueE: 'The dream that is significant of what is to come. It is what is left over when the day does not explain the scene.',
  },
  theorematikoi: {
    nome: 'the direct dream',
    oQueE:
      'It happens exactly as it was seen. The example is his: a man dreamed of a shipwreck, and the shipwreck came just as in the dream. You can only know afterward, which is precisely the problem.',
  },
  allegorikoi: {
    nome: 'the allegorical dream',
    oQueE: 'It says one thing by means of another. The five species are subdivisions of this one — not of dreams in general.',
  },
  horama: {
    nome: 'the vision',
    oQueE:
      'A vision tied to the significant dreams. The exact definition did not survive clearly, and the app says so instead of filling in the gap.',
  },
  chrematismos: {
    nome: 'the dream where someone speaks',
    oQueE:
      'A person or a god speaks and instructs the sleeper. This research read the entry in summary, not the full passage — so the description stops here.',
  },
  phantasma: {
    nome: 'the image on the threshold',
    oQueE:
      'The strange image that shows up on the edge of sleep, with no content about the future. This research read the entry in summary, not the full passage — so the description stops here.',
  },
};

// ---------------------------------------------------------------------------
// THE QUESTIONS
// ---------------------------------------------------------------------------
const PERGUNTAS = {
  diaAnterior: {
    pergunta:
      'Is what showed up in the dream what you lived through that day? Hunger, fear, missing someone, the seven o’clock fight, the thing that would not leave your head.',
    opcoes: {
      sim: 'Yes — my day is right there in it',
      nao: 'No — something came in that I did not live',
    },
  },
  quemApareceu: {
    pergunta: 'Whose dream is it? Think about who has a part in the scene, not about who walks by in the background.',
    opcoes: {
      'so-voce': 'Just me',
      'outra-pessoa': 'Someone else, with me watching',
      'voce-e-outra': 'Me and somebody else, both of us in the scene',
      'a-cidade': 'The city: a street, a square, a place that belongs to everyone',
      'o-mundo': 'The sky, the weather, something that reaches everyone at once',
      'nada-disso': 'None of that',
    },
  },
  conheceQuemApareceu: {
    pergunta: 'Do you know that person in real life?',
    opcoes: { sim: 'I know them', nao: 'I do not know them' },
  },
  aindaComVoce: {
    pergunta: 'Did the dream stay with you after you woke up?',
    opcoes: {
      sim: 'It stayed — I carried it around all day',
      nao: 'It was gone the moment I got up',
    },
  },
};

const PERGUNTA_DO_APP =
  'This question is the app’s, not the source’s: no ancient text in this research uses it as a criterion. It is here to help you look closer — and it does not change the sorting.';

// ---------------------------------------------------------------------------
// THE 1.9 CHECKLIST
// ---------------------------------------------------------------------------
const CHECKLIST_INTRO =
  'Before saying what any image means, Artemidorus demands knowing who did the dreaming. The list is his, it has six items, and it is what separates his method from a dictionary:';

const CHECKLIST = {
  identidade: 'who the person is',
  oficio: 'what they do for a living',
  nascimento: 'where they come from',
  dinheiro: 'how much they have',
  corpo:
    'the state of their body — this item is on his list and the app does not use it: nothing here speaks about anybody’s body. It stays cited so you can check the full list in the source.',
  idade: 'how old they are',
};

// ---------------------------------------------------------------------------
// THE WHY
// ---------------------------------------------------------------------------
const PORQUE_CAMADA = {
  enhypnion:
    'You answered that your day is right there in it, and that answer is what decides: by Artemidorus’ own question (1.2), the dream that mirrors what the person is living through is the enhypnion.',
  oneiros:
    'You answered that something came in that you did not live through that day, and that answer is what decides: the dream that does not mirror the present is what he calls oneiros (1.1).',
};

const PORQUE_ESPECIE = {
  'so-voce': 'And you said only you show up in the scene — that puts the report in the first of the five species.',
  'outra-pessoa-conhecida':
    'And you said the one who shows up is another person, someone you know — that is exactly the definition of the second species.',
  'outra-pessoa-desconhecida':
    'On the species, the app stopped: you said you do not know the person who showed up, and the definition in the source asks for someone known.',
  'voce-e-outra': 'And you said both of you are in the scene, each with a part — that is what the third species covers.',
  'a-cidade': 'And you said the dream belongs to the place that belongs to everyone — street, square, harbor, temple. That is the fourth species.',
  'o-mundo': 'And you said it is the sky, the weather, the thing that reaches everyone at once — that is the fifth.',
  'nada-disso': 'On the species, nothing landed: the five say whose the dream is, and you answered that it is none of them.',
};

// ---------------------------------------------------------------------------
// THE CAVEATS THAT RIDE ALONG WITH EVERY SORTING
// ---------------------------------------------------------------------------
const NOTA_SUBESPECIE =
  'One detail that changes the size of the claim. The five species are subdivisions of the allegorical dream — the one that says a thing by means of another (Oneirocritica 1.2.1). ' +
  'The other kind, the direct dream, is the one that happens exactly as it was seen: Artemidorus’ own example is a man who dreamed of a shipwreck, and the shipwreck came just as in the dream. ' +
  'Only the outcome tells one from the other, and the app has no outcome. So it names the species by who showed up, and never rules that your dream is allegorical.';

const NOTA_NAO_E_DICIONARIO =
  'Why there is no symbol dictionary here. "Water is emotion, falling is losing control, flying is freedom" is not in Artemidorus and not in any ancient source in this research — it is a modern magazine dictionary. ' +
  'His method is the opposite: the same dream reads differently depending on who dreamed it. The case he records is the cleanest there is — an enslaved man dreamed he had three penises; he was freed, and with manumission he came to have three names, like every Roman citizen (5.91). ' +
  'In a man who was already free, the same dream would say none of that. In 1.79 it is money that changes everything: the reading depends on what the dreamer has and on what his mother has. ' +
  'That is why this app sorts the report and does not sell you the meaning of an image.';

const NOTA_LEITURA_DO_APP =
  'What is source and what is app. The split between the dream that hands the day back and the dream that brings something else is from Artemidorus of Daldis, Oneirocritica 1.1–1.2, 2nd century AD; the five species are from 1.2.45–55; the demand to know who did the dreaming is from 1.9. ' +
  'What is ours: the questions in today’s English, the order they show up in, and one of them entirely — whether the dream stayed with you after waking, which no ancient text in this research authorizes as a criterion and which therefore decides nothing.';

const NOTA_DISCORDANCIA = (c) =>
  c.camada === 'enhypnion'
    ? 'Your two answers pull in different directions: you said your day is right there in it and, at the same time, that the dream stayed with you after you woke up. ' +
      'The app does not break the tie on its own and does not hide the clash. What decides here is Artemidorus’ question (1.2), because the other one is ours.'
    : 'Your two answers pull in different directions: you said something came in that you did not live through that day and, at the same time, that the dream was gone the moment you got up. ' +
      'The app does not break the tie on its own and does not hide the clash. What decides here is Artemidorus’ question (1.2), because the other one is ours.';

// ---------------------------------------------------------------------------
// WHAT IS MISSING, AND WHERE TO ANSWER IT
// ---------------------------------------------------------------------------
const FALTA = {
  diaAnterior: {
    texto:
      'The first question is missing, and it is the one that decides everything else: is what showed up in the dream what you lived through that day? ' +
      'Without it there is no way to know whether the dream handed your day back or brought something else, and those two drawers look nothing alike. The app does not pick one for you.',
    comoResolver: 'Answer the first question on the Dreams screen.',
  },
  quemApareceu: {
    texto:
      'Whose dream it is has not been answered yet. The five species of Artemidorus separate the dream that is yours alone, the one about someone else, the one about the two of you, the one about the city and the one about the world — and what tells them apart is who has a part in the scene. ' +
      'Without that answer the app has no way to choose, and it is not going to choose on its own.',
    comoResolver: 'Answer whose dream it is, on the Dreams screen.',
  },
  conheceQuemApareceu: {
    texto:
      'One short answer is missing, and it decides the drawer: do you know the person who showed up? The second species is defined as another person known to the dreamer (1.2.45), ' +
      'so knowing them or not moves the report — and when you do not know them, this research does not know which drawer it goes in.',
    comoResolver: 'Answer whether you know the person, on the Dreams screen.',
  },
};

// ---------------------------------------------------------------------------
// THE BIBLIOGRAPHY
// ---------------------------------------------------------------------------
const FONTES = [
  'Artemidorus of Daldis, Oneirocritica (Ὀνειροκριτικά), 2nd century AD — five books, written around 170–200 AD; Book IV is about method and Book V collects 95 dreams with the outcome written down',
  'Oneirocritica 1.1–1.2 — enhypnion and oneiros, the split between the direct dream (theorematikoi) and the allegorical one (allegorikoi), and the five species of the allegorical in 1.2.45–55',
  'Oneirocritica 1.9 — what the interpreter has to know about the dreamer before interpreting any image',
  'Oneirocritica 5.91 and 1.79 — the two cases where the same dream reads differently depending on the dreamer’s situation: the enslaved man who gained three names, and the poor man with a rich mother',
  'Partial free English translation at attalus.org/translate/artemidorus.html; standard Greek edition by Roger A. Pack (Teubner, 1963); translation and commentary by Daniel E. Harris-McCoy (Oxford, 2012); translation by Martin Hammond with an introduction by Peter Thonemann (Oxford World’s Classics, 2020)',
  'Papyrus Chester Beatty III (Egypt, c. 1220 BC) and the Ziqīqu series (tablets from Ashurbanipal’s library, 7th century BC) — the fixed-equivalence dictionaries that came before, and that Artemidorus’ method is the opposite of',
  'Macrobius, Commentarii in Somnium Scipionis, c. 430 AD — the SECOND fivefold taxonomy of late antiquity, by another author in another century; this research did not check his terms against an edition, which is why the app does not list them',
];

export const PACK = {
  idioma: 'en',
  tela: 'Dreams',
  autores: AUTORES,
  recibo,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  especies: ESPECIES,
  especieTexto: ESPECIE_TEXTO,
  semEspecie: SEM_ESPECIE,
  vocabulario: VOCABULARIO,
  perguntas: PERGUNTAS,
  perguntaDoApp: PERGUNTA_DO_APP,
  checklistIntro: CHECKLIST_INTRO,
  checklist: CHECKLIST,
  porqueCamada: PORQUE_CAMADA,
  porqueEspecie: PORQUE_ESPECIE,
  notaSubespecie: NOTA_SUBESPECIE,
  notaNaoEDicionario: NOTA_NAO_E_DICIONARIO,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaDiscordancia: NOTA_DISCORDANCIA,
  falta: FALTA,
  verbatim: VERBATIM,
  fontes: FONTES,
};

export default PACK;
