// datos/sinastria.en.js
// O INGLES do ritmo dos dois. Arquivo VIZINHO de datos/sinastria.js (PT, fonte
// das CHAVES e da estrutura) e de datos/sinastria.es.js. So texto mora aqui.
//
// ===========================================================================
// AS TRES COISAS QUE QUEBRAM EM SILENCIO SE MUDAREM
// ===========================================================================
// 1. OS PLACEHOLDERS {el:fogo} / {el:terra} / {el:ar} / {el:agua}. Resolvidos
//    por lib/sinastria.js com a regex /\{el:(fogo|terra|ar|agua)\}/g — o nome
//    dentro do marcador e PORTUGUES SEM ACENTO e e comparado contra ELEMENTOS
//    do motor. {el:fire} nao da erro: fica literal na tela para sempre. Ficam
//    identicos, na posicao que a gramatica inglesa pede.
// 2. AS CHAVES DOS PARES: 'agua+fogo', 'ar+terra' — portugues, sem acento, em
//    ordem alfabetica, montadas por [elA, elB].sort().join('+') no motor.
//    'fire+water' nunca e encontrada e a leitura daquele par sai vazia.
// 3. AS CHAVES DOS ASPECTOS: copresenca, trigono, sextil, quadratura, oposicao,
//    aversao30, aversao150 — ids tecnicos de ID_POR_DISTANCIA. O NOME VISIVEL da
//    figura e outra coisa e esta traduzido (NOME_DO_ASPECTO_EN).
//
// ===========================================================================
// O QUE A TRADICAO CITADA PROIBE AO TEXTO
// ===========================================================================
// Ptolomeu (Tetrabiblos I.13, I.16), Aristoteles (On Generation and Corruption
// II.3), Linda Goodman (Sun Signs 1968 / Love Signs 1978) — autores e obras nao
// se traduzem, e nao aparecem neste arquivo.
//
//   · SEM PLACAR: nenhuma nota, percentual ou "87% compatible". A tradicao e
//     PROSA SEM PERCENTUAL; numero aqui viraria veredito, e o teste reprova.
//   · SEM VEREDITO: e uma lente para conversar, nunca uma sentenca sobre o par.
//   · AS DUAS AVERSOES SAO LEITURAS DIFERENTES (I.16). Colapsar numa so e
//     proibido, e o teste afirma que os dois textos diferem.
//   · "No aspect" e o nome honesto da aversao: Ptolomeu diz que esses signos nao
//     se veem ("disjunct and alien").
//
// ===========================================================================
// GENERO E PROMESSA
// ===========================================================================
// Os textos falam do RITMO entre dois SIGNOS — nunca do que a outra pessoa
// sente, quer ou vai fazer. O par generico do PT ("um dos dois", "o outro") vira
// "one of the two" / "the other one": gramatica, nao genero. Nenhuma linha diz
// "he will" nem "she feels".
//
// "will come back" / "guaranteed" / "for sure" nao aparecem em nenhuma forma:
// sao exatamente as formulas inglesas que o portao da doutrina morde, e que nao
// tinham terminacao verbal para hablaDelFuturo() detectar antes dele existir.
//
// FALAR_POR_ELEMENTO_EN e o unico bloco que fala de AGIR, e as tres regras
// continuam: condicional sempre ("when there is a conversation"), descreve COMO
// falar e nunca o que a outra pessoa responde, e fala do SIGNO.

/* NA CAMA, pela FIGURA entre os signos (a distancia no zodiaco). */
export const CAMA_POR_ASPECTO_EN = {
  copresenca:
    'you both want the same thing at the same hour, and neither one pulls: there is no vantage point to look down from',
  trigono:
    'you find the rhythm on the first night, and the problem here is never a lack of wanting',
  sextil:
    'it starts slower than either of you expected and gets better with time, which is the opposite of what usually happens',
  quadratura: 'what grates by day is exactly what pulls by night',
  oposicao:
    "in bed the day's argument carries on by other means, and that is where it works",
  /* As duas aversoes, DIFERENTES — Tetrabiblos I.16. */
  aversao30:
    'at the start one of the two always believes they want it more than the other, and it is almost never true: it is only that the response time is different',
  aversao150:
    'the wanting does not arrive together; it arrives when one of the two decides it has arrived',
};

/* NA CAMA, pelo PAR DE ELEMENTOS. Chaves em portugues sem acento. */
export const CAMA_POR_ELEMENTOS_EN = {
  'fogo+fogo':
    'Fire with fire catches fast, burns high, and has not the slightest patience for circling around.',
  'terra+terra':
    'Earth with earth is physical desire and in no hurry: skin, scent, repetition, and a declared taste for what is already known to work.',
  'ar+ar':
    'Air with air catches through the head — the right sentence at the right moment is worth more here than any advance.',
  'agua+agua':
    'Water with water is emotional desire before it is physical: when the mood is off, the body knows first.',
  'ar+fogo':
    '{el:ar} catches through the head and {el:fogo} catches through the body, and it is that mismatch of entry points that keeps them both curious.',
  'agua+terra':
    '{el:agua} comes in through the mood and {el:terra} comes in through touch, and both doors open onto the same room — a desire easier to sustain than to explain.',
  'fogo+terra':
    '{el:fogo} wants it now and {el:terra} wants it done well: the friction starts at the clock, and it is the same friction that holds the attraction.',
  'agua+fogo':
    '{el:fogo} moves forward and {el:agua} feels before answering — when their timing lines up it is electric, and when it does not, one feels refused and the other feels rushed.',
  'ar+terra':
    '{el:ar} wants to talk the desire over and {el:terra} wants to practise it in silence, and neither one understands straight away why the other insists on the opposite.',
  'agua+ar':
    '{el:agua} needs a mood and {el:ar} needs lightness: it works very well as long as neither demands the other speak their own language.',
};

/* NA CONVERSA, pelo par de elementos. */
export const CONVERSA_POR_ELEMENTOS_EN = {
  'fogo+fogo':
    'Two fires talk loud, get excited together and cut each other off without meaning harm: the subject moves faster than the listening.',
  'terra+terra':
    'Two earths talk little and settle a lot, and what they both call a conversation is usually a practical arrangement.',
  'ar+ar':
    'Two airs converse for sport, and what gets stuck is not a shortage of subjects — it is a shortage of conclusions.',
  'agua+agua':
    'Two waters say a great deal without saying it: half the conversation happens in the look, the tone and the silence, and the other half is left for later.',
  'ar+fogo':
    '{el:ar} brings the subject and {el:fogo} brings the opinion, and it is a fast conversation that rarely bores.',
  'agua+terra':
    '{el:agua} speaks of what was felt and {el:terra} answers with what can be done, and what is missing is agreeing when one wants a solution and when one only wants to be heard.',
  'fogo+terra':
    '{el:fogo} speaks in one block and already wants to decide, {el:terra} asks for the detail before agreeing, and what gets stuck is pace and not content.',
  'agua+fogo':
    '{el:fogo} says the blunt thing that {el:agua} tends to chew on for days, and the subject sometimes comes back the following week.',
  'ar+terra':
    '{el:ar} theorises and {el:terra} wants the concrete example: the classic misunderstanding is one finding the other shallow and the other finding the first one complicated.',
  'agua+ar':
    '{el:ar} explains the feeling and {el:agua} feels the explanation, and when it heats up one escapes into logic and the other escapes into silence.',
};

/* NA BRIGA, pelo par de elementos. */
export const BRIGA_POR_ELEMENTOS_EN = {
  'fogo+fogo':
    'They both blow up, and they blow up together: it rises in ten seconds and comes down almost as fast, as long as nobody stores it away.',
  'terra+terra':
    'Neither one shouts: they both go sullen, work in silence, and let the conversation grow old over days.',
  'ar+ar':
    'The disagreement turns into a debate, whoever argues better wins, and that is why nobody walks away satisfied.',
  'agua+agua':
    'Neither says what hurt at the moment it hurt: they both withdraw, cry apart, and come back when the mood changes on its own.',
  'ar+fogo':
    '{el:fogo} blows up and {el:ar} rationalises, and nothing irritates someone who is angry more than hearing a well-built argument.',
  'agua+terra':
    '{el:agua} is wounded and {el:terra} hardens, and the silence of the two means different things that nobody translates.',
  'fogo+terra':
    '{el:fogo} digs in on the spot and {el:terra} does not answer, then comes back to it three days later with everything written down.',
  'agua+fogo':
    '{el:fogo} shouts and forgets, {el:agua} does not shout and does not forget: it is a difference of memory, not of love.',
  'ar+terra':
    '{el:ar} wants to discuss the relationship and {el:terra} wants to stop talking and act, and each one calls the other method an escape.',
  'agua+ar':
    '{el:ar} turns the subject into a joke to clear the air and {el:agua} hears the joke as not caring.',
};

/* QUANDO HOUVER CONVERSA — o passo pratico, pelo ELEMENTO DA OUTRA PESSOA.
 * Condicional sempre, COMO falar e nunca a resposta da outra pessoa, e sempre
 * o SIGNO e nunca "he"/"she". */
export const FALAR_POR_ELEMENTO_EN = {
  fogo: 'With a fire sign, the good conversation is short and direct: say what you want in the first minute, without preparing the ground. Circling around, to fire, sounds like a trap.',
  terra:
    'With an earth sign, the word said counts for less than the thing done: a concrete proposal, with a day and an hour, opens more doors than any declaration.',
  ar: 'With an air sign, start from an idea and not from a complaint: air comes in through the interesting conversation and leaves the heavy one. Lightness first, the rest afterwards.',
  agua: 'With a water sign, the tone matters more than the sentence: pick the calm hour and say what you felt, not what the other person did. An accusation closes water on the spot.',
};

/* O nome VISIVEL de cada figura. As CHAVES seguem sendo os ids tecnicos.
 * "No aspect" e o nome honesto da aversao (I.16). */
export const NOME_DO_ASPECTO_EN = {
  copresenca: 'the same sign',
  trigono: 'trine, the easy figure',
  sextil: 'sextile, the friendly figure',
  quadratura: 'square, the figure of friction',
  oposicao: 'opposition, the figure of the mirror',
  aversao30: 'no aspect — neighbouring signs do not see each other',
  aversao150: 'no aspect — the distance that does not see',
};

export default {
  CAMA_POR_ASPECTO_EN,
  CAMA_POR_ELEMENTOS_EN,
  CONVERSA_POR_ELEMENTOS_EN,
  BRIGA_POR_ELEMENTOS_EN,
  FALAR_POR_ELEMENTO_EN,
  NOME_DO_ASPECTO_EN,
};
