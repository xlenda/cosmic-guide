// datos/sinastria.es.js
// O ESPANHOL do ritmo dos dois. Arquivo VIZINHO de datos/sinastria.js (PT, que
// continua sendo a fonte das CHAVES e da estrutura). So texto mora aqui.
//
// ===========================================================================
// AS TRES COISAS QUE QUEBRAM EM SILENCIO SE MUDAREM
// ===========================================================================
// 1. OS PLACEHOLDERS {el:fogo} / {el:terra} / {el:ar} / {el:agua}. Eles sao
//    resolvidos por lib/sinastria.js com a regex /\{el:(fogo|terra|ar|agua)\}/g
//    — o nome dentro do marcador e PORTUGUES SEM ACENTO e e comparado contra
//    ELEMENTOS do motor. Traduzir para {el:fuego} nao da erro: o marcador fica
//    na tela, literal, para sempre. Ficam identicos, na posicao que a gramatica
//    espanhola pede.
// 2. AS CHAVES DOS PARES: 'agua+fogo', 'ar+terra' — portugues, sem acento,
//    em ordem alfabetica. lib/sinastria.js monta a chave com
//    [elA, elB].sort().join('+') a partir de ELEMENTOS = ['fogo','terra','ar',
//    'agua']. Uma chave 'agua+fuego' nunca e encontrada, e a leitura daquele par
//    sai vazia. Decisao de portabilidade do PT (chave com acento e fragil a
//    normalizacao unicode) que vale aqui igual.
// 3. AS CHAVES DOS ASPECTOS: copresenca, trigono, sextil, quadratura, oposicao,
//    aversao30, aversao150 — ids tecnicos vindos de ID_POR_DISTANCIA. O NOME
//    VISIVEL da figura e outra coisa e esta traduzido (NOME_DO_ASPECTO_ES).
//
// ===========================================================================
// A TRADICAO CITADA, E O QUE ELA PROIBE
// ===========================================================================
// Ptolomeu (Tetrabiblos I.13 e I.16), Aristoteles (Da Geracao e Corrupcao II.3)
// e Linda Goodman (Sun Signs 1968 / Love Signs 1978). Nomes de autor e titulos
// de obra nao se traduzem — e nao aparecem neste arquivo, so no cabecalho do PT.
//
// O que a tradicao impoe ao TEXTO, e vale em espanhol:
//   · SEM PLACAR. Nenhuma nota, percentual, ranking ou "compatibilidad 87%".
//     A tradicao inteira e PROSA SEM PERCENTUAL, e numero aqui viraria veredito.
//     test/madremaria-sinastria.test.js reprova /%|por cento|nota \d|pontua/.
//   · SEM VEREDITO. E uma lente para conversar, nunca uma sentenca sobre o par.
//   · AS DUAS AVERSOES SAO DIFERENTES. aversao30 e aversao150 sao a mesma
//     familia e leituras DISTINTAS (I.16); o teste afirma que os dois textos nao
//     sao iguais. Colapsar as duas numa traducao so e proibido.
//   · "Sin aspecto" e o nome HONESTO da aversao: Ptolomeu diz que esses signos
//     nao se veem ("disjunct and alien"), e inventar um nome mais bonito seria
//     fabricar ceu.
//
// ===========================================================================
// GENERO, E O QUE OS TEXTOS NUNCA AFIRMAM
// ===========================================================================
// Os textos falam do RITMO entre dois SIGNOS — nunca da vontade de alguem, nunca
// do que a outra pessoa sente ou vai fazer. O teste morde /\bela (vai|sente|
// quer|pensa)\b/ e o equivalente masculino no PT; em espanhol a armadilha e a
// mesma com "él/ella siente", e nenhuma linha daqui a comete. O par generico do
// PT ("um dos dois", "o outro") vira "uno de los dos" / "el otro", que e
// gramatica e nao atribuicao de genero a ninguem.
//
// FALAR_POR_ELEMENTO_ES e o unico bloco que fala de AGIR, e as tres regras que
// test/madremaria-sinastria.test.js cobra continuam inteiras em espanhol:
//   · condicional sempre — "cuando haya conversación", nunca "ve a hablarle";
//   · descreve COMO falar, nunca o que a outra pessoa vai responder;
//   · fala do SIGNO, nunca de "él" ou "ella".

/* NA CAMA, pela FIGURA entre os signos (a distancia no zodiaco). */
export const CAMA_POR_ASPECTO_ES = {
  copresenca:
    'quieren lo mismo a la misma hora, y nadie tira del otro: no hay desde dónde mirarse por encima',
  trigono:
    'le toman el ritmo la primera noche, y el problema aquí nunca es falta de ganas',
  sextil:
    'empieza más despacio de lo que los dos esperaban y mejora con el tiempo, que es lo contrario de lo que suele pasar',
  quadratura: 'lo que irrita de día es exactamente lo que atrae de noche',
  oposicao:
    'en la cama la discusión del día sigue por otros medios, y es ahí donde funciona',
  /* As duas aversoes, DIFERENTES — Tetrabiblos I.16. */
  aversao30:
    'al principio uno de los dos siempre cree que quiere más que el otro, y casi nunca es verdad: es solo que el tiempo de respuesta es distinto',
  aversao150:
    'las ganas no llegan juntas, llegan cuando uno de los dos decide que llegaron',
};

/* NA CAMA, pelo PAR DE ELEMENTOS. Chaves em portugues sem acento — ver o
 * cabecalho. Os {el:...} ficam identicos e mudam de POSICAO quando a sintaxe
 * espanhola pede. */
export const CAMA_POR_ELEMENTOS_ES = {
  'fogo+fogo':
    'Fuego con fuego prende rápido, calienta alto y no tiene la menor paciencia con los rodeos.',
  'terra+terra':
    'Tierra con tierra es deseo físico y sin prisa: piel, olor, repetición, y un gusto declarado por aquello que ya se sabe que funciona.',
  'ar+ar':
    'Aire con aire prende por la cabeza: una frase justa en el momento justo vale aquí más que cualquier avance.',
  'agua+agua':
    'Agua con agua es deseo emocional antes que físico: cuando el clima está torcido, el cuerpo lo sabe primero.',
  'ar+fogo':
    '{el:ar} prende por la cabeza y {el:fogo} prende por el cuerpo, y es ese desencuentro de puerta de entrada el que mantiene a los dos con curiosidad.',
  'agua+terra':
    '{el:agua} entra por el clima y {el:terra} entra por el tacto, y las dos puertas dan al mismo sitio: es un deseo más fácil de sostener que de explicar.',
  'fogo+terra':
    '{el:fogo} quiere ahora y {el:terra} quiere bien hecho: el roce empieza en el reloj, y es el mismo roce que sostiene la atracción.',
  'agua+fogo':
    '{el:fogo} avanza y {el:agua} siente antes de responder: cuando el tiempo de los dos coincide es eléctrico, y cuando no coincide uno se siente rechazado y el otro, apurado.',
  'ar+terra':
    '{el:ar} quiere conversar sobre el deseo y {el:terra} quiere practicarlo en silencio, y ninguno de los dos entiende de entrada por qué el otro insiste en lo contrario.',
  'agua+ar':
    '{el:agua} necesita clima y {el:ar} necesita ligereza: funciona muy bien mientras ninguno le exija al otro su propio idioma.',
};

/* NA CONVERSA, pelo par de elementos. */
export const CONVERSA_POR_ELEMENTOS_ES = {
  'fogo+fogo':
    'Dos de fuego hablan alto, se entusiasman juntos y se cortan la frase sin mala intención: el tema avanza más rápido que la escucha.',
  'terra+terra':
    'Dos de tierra conversan poco y resuelven mucho, y lo que los dos llaman conversación suele ser un acuerdo práctico.',
  'ar+ar':
    'Dos de aire conversan por deporte, y lo que se traba no es la falta de tema: es la falta de conclusión.',
  'agua+agua':
    'Dos aguas dicen mucho sin decir: la mitad de la conversación pasa en la mirada, el tono y el silencio, y la otra mitad queda para después.',
  'ar+fogo':
    '{el:ar} trae el tema y {el:fogo} trae la opinión, y es una conversación rápida que rara vez aburre.',
  'agua+terra':
    '{el:agua} habla de lo que sintió y {el:terra} responde con lo que se puede hacer, y falta acordar cuándo uno quiere solución y cuándo quiere solo ser escuchado.',
  'fogo+terra':
    '{el:fogo} habla en bloque y ya quiere decidir, {el:terra} pide detalle antes de estar de acuerdo, y lo que se traba es el ritmo y no el contenido.',
  'agua+fogo':
    '{el:fogo} dice la cosa directa que {el:agua} suele rumiar por días, y el tema a veces reaparece la semana siguiente.',
  'ar+terra':
    '{el:ar} teoriza y {el:terra} quiere el ejemplo concreto: el malentendido clásico es que uno encuentra al otro superficial y el otro lo encuentra complicado.',
  'agua+ar':
    '{el:ar} explica el sentimiento y {el:agua} siente la explicación, y cuando se calienta uno huye a la lógica y el otro huye al silencio.',
};

/* NA BRIGA, pelo par de elementos. */
export const BRIGA_POR_ELEMENTOS_ES = {
  'fogo+fogo':
    'Los dos estallan, y estallan juntos: sube en diez segundos y baja casi igual de rápido, siempre que nadie se lo guarde.',
  'terra+terra':
    'Ninguno de los dos grita: los dos se enfurruñan, trabajan callados y dejan que la conversación envejezca por días.',
  'ar+ar':
    'El desacuerdo se vuelve debate, gana quien argumenta mejor, y por eso nadie sale satisfecho.',
  'agua+agua':
    'Nadie dice lo que le dolió en el momento: los dos se alejan, lloran por separado y vuelven cuando el clima cambia solo.',
  'ar+fogo':
    '{el:fogo} estalla y {el:ar} racionaliza, y nada irrita más a quien está con rabia que oír un argumento bien armado.',
  'agua+terra':
    '{el:agua} se dolió y {el:terra} se endurece, y el silencio de los dos tiene sentidos distintos que nadie traduce.',
  'fogo+terra':
    '{el:fogo} se planta en el momento y {el:terra} no responde, y vuelve al tema tres días después con todo anotado.',
  'agua+fogo':
    '{el:fogo} grita y olvida, {el:agua} no grita y no olvida: es diferencia de memoria, no de amor.',
  'ar+terra':
    '{el:ar} quiere discutir la relación y {el:terra} quiere dejar de hablar y actuar, y cada uno llama huida al método del otro.',
  'agua+ar':
    '{el:ar} convierte el tema en broma para despejar y {el:agua} entiende la broma como poco caso.',
};

/* QUANDO HOUVER CONVERSA — o passo pratico, pelo ELEMENTO DA OUTRA PESSOA.
 * As tres regras que o teste cobra, em espanhol: condicional sempre ("cuando
 * haya conversación"), descreve COMO falar e nunca o que a outra pessoa vai
 * responder, e fala do SIGNO e nunca de "él"/"ella". */
export const FALAR_POR_ELEMENTO_ES = {
  fogo: 'Con un signo de fuego, la conversación buena es corta y directa: di lo que quieres en el primer minuto, sin preparar el terreno. El rodeo, para el fuego, suena a trampa.',
  terra:
    'Con un signo de tierra, la palabra dicha vale menos que la cosa hecha: una propuesta concreta, con día y hora, abre más puertas que cualquier declaración.',
  ar: 'Con un signo de aire, empieza por una idea y no por un reclamo: el aire entra por la conversación interesante y sale de la conversación pesada. Ligereza primero, el resto después.',
  agua: 'Con un signo de agua, el tono importa más que la frase: elige la hora tranquila y di lo que sentiste, no lo que la otra persona hizo. La acusación cierra al agua al instante.',
};

/* O nome VISIVEL de cada figura, para a linha do par na tela. As CHAVES seguem
 * sendo os ids tecnicos. "Sin aspecto" e o nome honesto da aversao (I.16). */
export const NOME_DO_ASPECTO_ES = {
  copresenca: 'el mismo signo',
  trigono: 'trígono, la figura fácil',
  sextil: 'sextil, la figura amiga',
  quadratura: 'cuadratura, la figura de roce',
  oposicao: 'oposición, la figura de espejo',
  aversao30: 'sin aspecto — los signos vecinos no se ven',
  aversao150: 'sin aspecto — la distancia que no se ve',
};

export default {
  CAMA_POR_ASPECTO_ES,
  CAMA_POR_ELEMENTOS_ES,
  CONVERSA_POR_ELEMENTOS_ES,
  BRIGA_POR_ELEMENTOS_ES,
  FALAR_POR_ELEMENTO_ES,
  NOME_DO_ASPECTO_ES,
};
