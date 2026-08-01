// lib/traducoes/transitoFase.es.js
// El PACK ESPAÑOL de aplicativo × separativo. Misma FORMA que
// transitoFase.pt.js: mismas claves, mismos campos, funciones con la misma
// firma. El motor vive en lib/transitoFase.js.
//
// Valen aquí todas las reglas de la cabecera de lib/transitoFase.js: engancha
// primero y la fuente después, locus en toda afirmación histórica, ninguna
// afirmación sobre el cuerpo, nada de veredicto ni de promesa, y — la más
// importante de esta pieza — NO COMPLETAR EL HUECO: la astrología moderna dice
// que el aspecto aplicativo pesa más que el separativo, y esta base no encontró
// la línea antigua que lo autorice. La app describe los dos y no los ordena.
//
// La DATACIÓN no se escribe a mano: pasa por traduzirQuando() y traduzirAutor()
// de lib/traducoes/datacao.js.

import { traduzirAutor, traduzirQuando } from './datacao.js';

const LANG = 'es';
const PTOLOMEU = traduzirAutor('Ptolomeu', LANG);
const VALENTE = traduzirAutor('Vétio Valente', LANG);
const SEC_II = traduzirQuando('séc. II', LANG);
const SEC_XX = traduzirQuando('séc. XX', LANG);
const ANO_LILLY = traduzirQuando('1647', LANG);

// Las CLAVES son datos (vienen así de personalSky.js) y siguen en portugués en
// los tres packs; solo cambia el valor.
const PLANETAS = {
  'Sol': 'Sol',
  'Lua': 'Luna',
  'Mercúrio': 'Mercurio',
  'Vênus': 'Venus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
  'Urano': 'Urano',
  'Netuno': 'Neptuno',
  'Plutão': 'Plutón',
};

// La MISMA lista, en la forma que entra en medio de una frase. El español pide
// artículo en unos y no en otros ("el Sol está", pero "Mercurio está"). Sin
// estas dos listas el texto sale "Sol está a 3 grados", que es el tipo de
// costura que delata a un generador de frases.
const PLANETAS_FRASE = {
  'Sol': 'el Sol',
  'Lua': 'la Luna',
  'Mercúrio': 'Mercurio',
  'Vênus': 'Venus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
  'Urano': 'Urano',
  'Netuno': 'Neptuno',
  'Plutão': 'Plutón',
};

const ASPECTOS = {
  'Conjunção': 'Conjunción',
  'Sextil': 'Sextil',
  'Quadratura': 'Cuadratura',
  'Trígono': 'Trígono',
  'Oposição': 'Oposición',
};

const FASE_NOME = {
  aplicativo: 'se está formando',
  separativo: 'se está deshaciendo',
  estacionario: 'no se está moviendo',
};

const FASE_TERMO = {
  aplicativo: 'aplicativo (el ángulo que todavía va a cerrarse)',
  separativo: 'separativo (el ángulo que ya se cerró y se está abriendo)',
  estacionario: 'estacionario (el planeta casi no avanza en el cielo)',
};

function formatarGraus(n, casas = 2) {
  return Number(Math.abs(n)).toFixed(casas).replace('.', ',');
}

function graus(n, casas = 2) {
  const s = formatarGraus(n, casas);
  return Number(s.replace(',', '.')) === 1 ? '1 grado' : `${s} grados`;
}

function duracao(dias) {
  const d = Math.abs(dias);
  if (d < 1 / 24) return 'menos de una hora';
  if (d < 1) {
    const h = Math.max(1, Math.round(d * 24));
    return h === 1 ? 'cerca de una hora' : `cerca de ${h} horas`;
  }
  let inteiros = Math.floor(d);
  let horas = Math.round((d - inteiros) * 24);
  if (horas === 24) {
    inteiros += 1;
    horas = 0;
  }
  const parteDias = inteiros === 1 ? 'cerca de un día' : `cerca de ${inteiros} días`;
  if (!horas) return parteDias;
  return `${parteDias} y ${horas === 1 ? 'una hora' : `${horas} horas`}`;
}

// El campo `texto` es el inglés de Robbins (Loeb/Harvard, 1940) y de Riley, y es
// IDÉNTICO en los tres packs. Lo que cambia por idioma es la `parafrase` —
// firmada por la app, nunca entre comillas — y el idioma del `locus`.
const VERBATIM = {
  ptolomeuI24: {
    texto:
      "In general those which precede are said to 'apply' to those which follow, and those that follow to 'be separated' from those that precede, when the interval between them is not great.",
    parafrase:
      'En general, los que van delante se dice que se "aplican" a los que siguen, y los que siguen que se "separan" de los que iban delante, cuando el intervalo entre ellos no es grande. Es la definición de los dos estados, y es posicional: supone al planeta avanzando hacia adelante.',
    locus: `${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers", trad. Robbins, 1940 — ${SEC_II}`,
  },
  valenteJupiterRetrogrado: {
    texto:
      'If Jupiter is ahead <of the Ascendant> and is found to have a retrograde configuration, its beneficial effect will be strong because it is being carried towards the position of the Ascendant.',
    parafrase:
      'Júpiter por delante del Ascendente y en marcha retrógrada está siendo LLEVADO hacia él — o sea, acercándose, y no alejándose. Es la fuente antigua que resuelve el caso que la definición posicional deja fuera.',
    locus: `${VALENTE}, Anthologiae IX.3, trad. Riley — ${SEC_II}`,
  },
  valenteEstacoes: {
    texto:
      'If the stars are passed the first stationary point and are found to be retrograde, they delay expectations, actions, profits, and enterprises. […] If they are at <or passed> the second stationary point, they cancel any delay and reinstate the same activities.',
    parafrase:
      'La marcha hacia atrás es demora — y solo demora. Y la segunda parada cancela la demora y devuelve las mismas actividades. La tradición trae un final de historia que el folclore moderno recortó.',
    locus: `${VALENTE}, Anthologiae IV.14, "The Phases and Transits of the Stars", trad. Riley — ${SEC_II}`,
  },
};

// BLOQUE 1 — EL GANCHO. Vida real, sin término técnico, sin nombre propio, sin
// siglo. Es lo primero que muestra la pantalla.
const CHAMADA = {
  aplicativo: () =>
    'Hay cosas que uno siente llegar antes de que lleguen. La conversación que todavía no tuviste y ya pesa. La cuenta que todavía no venció. ' +
    'El aire de la casa que cambió y nadie lo comentó. Esto de aquí es de ese tipo: todavía no es — está viniendo.',
  separativo: () =>
    'Hay peleas que terminaron el lunes y siguen ocupando el jueves. Hay semanas duras que ya pasaron y el cuerpo todavía anda despacio. ' +
    'Hay conversaciones cerradas que uno sigue respondiendo por dentro, tres días después. Esto de aquí es de ese tipo: ya fue — lo que queda es el rastro.',
  estacionario: () =>
    'Hay momentos en que nada avanza. Ni llega ni pasa. Es lo más difícil de sostener, porque no se puede decir si aquello terminó o si todavía ni empezó — ' +
    'y uno se queda sin saber si ordena o si espera. Esto de aquí está exactamente ahí, detenido.',
};

const RECIBO_PTOLOMEU =
  `Los dos estados tienen nombre, y el nombre es viejo. ${PTOLOMEU} escribió un capítulo entero solo sobre esto en el Tetrabiblos I.24, ${SEC_II} — ` +
  `el título es "Of Applications and Separations and the Other Powers". La frase: "${VERBATIM.ptolomeuI24.texto}" ` +
  `Lo que va delante se APLICA a lo que sigue; lo que sigue se SEPARA de lo que iba delante. ` +
  `De ahí los dos términos que usa la app: aplicativo, el ángulo que todavía va a cerrarse, y separativo, el que ya se cerró y se está abriendo.`;

const RECIBO_VALENTE =
  `Y aquí está el agujero en la definición de ${PTOLOMEU}, que vale más citar que esconder: es POSICIONAL. Quien va delante en el orden de los signos se aplica a quien sigue — ` +
  `y eso solo funciona si el planeta avanza hacia adelante. Visto desde aquí, retrocede con frecuencia. Quien registró el caso fue ${VALENTE}, en la Anthologiae IX.3, del mismo ${SEC_II}, ` +
  `hablando de un Júpiter en marcha retrógrada: "${VERBATIM.valenteJupiterRetrogrado.texto}" — siendo llevado HACIA el punto, y no alejándose de él. ` +
  `Esta app sigue a ${VALENTE} y mide el movimiento, no el orden de los signos. Hicimos la cuenta de las dos maneras en 66.445 aspectos entre 2020 y 2029: ` +
  `los dos criterios discrepan en poco más de uno de cada ocho, y las discrepancias son, sin una sola excepción, planeta retrógrado.`;

const RECIBO_DATA =
  `Una última cosa, y es sobre lo que este plazo NO es. El ángulo se cierra a la hora que dice la cuenta, y eso es astronomía: cualquier efeméride lo confirma. ` +
  `Ahora bien, la idea de que el día del ángulo exacto sea el día de un acontecimiento no viene de ninguna fuente antigua — es del ${SEC_XX} y nació junto con el software de efemérides barato. ` +
  `${VALENTE}, que es quien más usa el tránsito en la antigüedad, lo lee como disparador de un período que otro factor ya gobernaba, nunca solo: ` +
  `"Be aware of the transits of the stars and their changes of sign at the various chronocratorships" (Anthologiae IX.3).`;

const RECIBO_ESTACOES =
  `La tradición antigua tiene algo que decir sobre el planeta detenido, y es modesto. ${VALENTE}, Anthologiae IV.14, ${SEC_II} — el capítulo se llama "The Phases and Transits of the Stars": ` +
  `"${VERBATIM.valenteEstacoes.texto}" Demora en la primera parada, demora cancelada en la segunda. Eso dice la fuente, y nada más.`;

const ABERTURA_COMUM =
  'La diferencia entre algo que está llegando y algo que ya pasó es la información más útil que alguien puede recibir sobre su propio día — y casi nadie la recibe. ' +
  'Si está llegando, todavía eliges cómo lo recibes. Si ya pasó, lo que queda es ordenar lo que quedó. Son dos avisos distintos, y la mayoría de las apps entrega el mismo texto para los dos.';

function comoOAppMede(c) {
  return (
    `La cuenta es fácil de comprobar: la app mira dónde está ${c.transitoNome} hoy, mira dónde estará mañana, y ve si el hueco hasta el encuentro con ${c.natalNome} de tu carta de nacimiento ` +
    `se achicó o creció. Es la misma efeméride de la Carta Astral, sin tabla y sin adivinanza.`
  );
}

const LEITURA = {
  aplicativo: (c) =>
    ABERTURA_COMUM +
    `\n\n` +
    `Hoy es el primer caso: ${c.transitoNome} está a ${graus(c.residuoGraus)} del ángulo exacto con ${c.natalNome} de tu carta de nacimiento, y esa distancia se está achicando. ` +
    `${PRAZO(c)} ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_VALENTE +
    `\n\n` +
    RECIBO_DATA,
  separativo: (c) =>
    ABERTURA_COMUM +
    `\n\n` +
    `Hoy es el segundo caso: ${c.transitoNome} YA pasó por el ángulo exacto con ${c.natalNome} de tu carta de nacimiento — está a ${graus(c.residuoGraus)} de él ahora, y esa distancia está creciendo. ` +
    `${PRAZO(c)} ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_VALENTE +
    `\n\n` +
    RECIBO_DATA,
  estacionario: (c) =>
    'Hay momentos en que nada se mueve. No es bueno ni malo: es sin respuesta. Uno no sabe si ordena lo que quedó o si espera lo que viene, porque no hay manera de decir cuál de los dos es. ' +
    'Sostener eso es distinto de sostener algo difícil que avanza.' +
    `\n\n` +
    `Hoy es ese caso, y es literal: ${c.transitoNome} casi no se movió en el cielo — avanzó ${graus(c.movimentoDiario, 4)} en veinticuatro horas. ` +
    `Con el planeta sin moverse, el ángulo con ${c.natalNome} de tu carta de nacimiento no se achica ni crece, y la app no elige un verbo por ti. ` +
    `Lo que sí se puede decir es la distancia: ${graus(c.residuoGraus)} hasta el encuentro exacto. ${comoOAppMede(c)}` +
    `\n\n` +
    RECIBO_ESTACOES +
    `\n\n` +
    RECIBO_PTOLOMEU +
    `\n\n` +
    RECIBO_DATA,
};

function PRAZO(c) {
  if (c.fase === 'estacionario') {
    return `Sin plazo: con ${c.transitoNome} sin moverse en el cielo, la cuenta dividiría por casi cero, y la app no pone número encima de eso.`;
  }
  if (!c.dentroDoHorizonte) {
    return (
      `La app no pone plazo en este: la estimación pasa de ${c.horizonte} días, y ahí es donde la cuenta deja de sostenerse. ` +
      `Lo que sí se puede decir es medida, no proyección — ${graus(c.residuoGraus)} separan a ${c.transitoNome} del ángulo exacto ahora, y el movimiento de hoy es de ${graus(c.movimentoDiario, 3)} por día.`
    );
  }
  if (c.diasParaExato > 0) {
    return c.exatoNoDia
      ? `El ángulo exacto se cierra hoy, dentro de ${duracao(c.diasParaExato)}.`
      : `El ángulo exacto se cierra dentro de ${duracao(c.diasParaExato)}.`;
  }
  return c.exatoNoDia
    ? `El ángulo exacto se cerró hoy, hace ${duracao(c.diasParaExato)}.`
    : `El ángulo exacto se cerró hace ${duracao(c.diasParaExato)}.`;
}

const LINHA_CURTA = {
  aplicativo: (c) =>
    c.dentroDoHorizonte
      ? `Se está formando: el ángulo exacto se cierra dentro de ${duracao(c.diasParaExato)}.`
      : `Se está formando: faltan ${graus(c.residuoGraus)} para el ángulo exacto.`,
  separativo: (c) =>
    c.dentroDoHorizonte
      ? `Ya se está deshaciendo: el ángulo exacto se cerró hace ${duracao(c.diasParaExato)}.`
      : `Ya se está deshaciendo: pasó del ángulo exacto hace ${graus(c.residuoGraus)}.`,
  estacionario: (c) =>
    `Sin movimiento: ${c.transitoNome} casi no avanzó en las últimas veinticuatro horas, y el ángulo no se está cerrando ni abriendo.`,
};

const NOTA_MARCHA = {
  direto: (c) =>
    `Hoy ${c.transitoNome} está en marcha directa: avanzó ${graus(c.movimentoDiario, 3)} hacia adelante en las últimas veinticuatro horas. ` +
    `En ese caso el orden de los signos y el movimiento real dicen lo mismo, y los dos criterios de la tradición coinciden.`,
  retrogrado: (c) =>
    `Hoy ${c.transitoNome} está en marcha retrógrada: avanzó ${graus(c.movimentoDiario, 3)} HACIA ATRÁS en las últimas veinticuatro horas. ` +
    `Es el caso en que el verbo se invierte — lo que se estaba yendo vuelve, lo que estaba llegando se aleja — y es donde esta app deja la definición posicional de ${PTOLOMEU} (Tetrabiblos I.24) ` +
    `y sigue la de ${VALENTE} (Anthologiae IX.3), que es la que mira el movimiento. ` +
    `Sobre la marcha hacia atrás en sí, lo que dice la fuente antigua es una sola cosa y es modesta: "If the stars are passed the first stationary point and are found to be retrograde, they delay expectations, actions, profits, and enterprises" ` +
    `(${VALENTE}, Anthologiae IV.14, ${SEC_II}). Demora. Y la segunda parada cancela la demora — "they cancel any delay and reinstate the same activities" —, ` +
    `que es la mitad que el folclore moderno recortó.`,
};

const NOTA_HORIZONTE = (c) =>
  `Por qué aquí no hay fecha. El plazo sale de una recta trazada con veinticuatro horas de movimiento, y solo se sostiene cerca del encuentro. ` +
  `Lo comprobamos contra la efeméride real en 3.735 aspectos: hasta tres días el error mediano quedó por debajo de una hora; de una semana en adelante llega a pasar de un mes, ` +
  `porque el planeta cambia de velocidad y puede detenerse y volver antes de llegar. Fuera de los ${c.horizonte} días la app dice grado, que es medida, y calla sobre día, que sería proyección.`;

const NOTA_ORBE =
  `De quién es el orbe de esta pantalla — orbe es la distancia a partir de la cual la app considera que el ángulo ya cuenta. ` +
  `Es convención moderna nuestra, no de la fuente: ${PTOLOMEU} no da ningún orbe (en Tetrabiblos I.13, ${SEC_II}, los aspectos son entre signos enteros), ` +
  `y en I.24 la condición es solo "when the interval between them is not great" — que no es grado. ` +
  `En la tradición posterior el orbe pertenece al PLANETA y no al aspecto, y quien lo tabula es William Lilly, Christian Astrology, Libro I, p. 107, Londres, ${ANO_LILLY}.`;

const NOTA_LEITURA_DO_APP =
  `Qué es cuenta y qué es lectura. La cuenta: la app toma la posición del planeta hoy, la misma posición mañana y la posición de tu carta de nacimiento, con efeméride de verdad, ` +
  `y ve si el hueco hasta el ángulo exacto se achicó o creció. Eso es astronomía, y cualquier efeméride lo confirma. ` +
  `La lectura: llamar aplicativo a un estado y separativo al otro es ${PTOLOMEU} (Tetrabiblos I.24) y ${VALENTE} (Anthologiae IX.3), ambos del ${SEC_II}. ` +
  `Elegir el movimiento real en lugar del orden de los signos, cuando los dos discrepan, es elección de esta app — declarada aquí en vez de escondida. ` +
  `Y lo que la app NO dice: que uno de los dos estados valga más que el otro. La astrología moderna lo repite todo el tiempo; esta base no encontró la línea antigua que lo autorice, ` +
  `y el hueco queda declarado en vez de rellenado.`;

const NOTA_DATA_DE_EVENTO =
  `Lo que este plazo no es. El ángulo se cierra a la hora que dice la cuenta — eso es astronomía y se puede comprobar. ` +
  `Que el día del ángulo exacto sea el día de un acontecimiento es idea del ${SEC_XX}, nacida junto con el software de efemérides barato, y no está en ninguna fuente antigua. ` +
  `${VALENTE} lee el tránsito como disparador de un período que otro factor ya gobernaba, nunca solo: ` +
  `"Be aware of the transits of the stars and their changes of sign at the various chronocratorships" (Anthologiae IX.3, trad. Riley, ${SEC_II}).`;

const FONTES = [
  `${PTOLOMEU}, Tetrabiblos I.24, "Of Applications and Separations and the Other Powers" (trad. F. E. Robbins, Loeb/Harvard, 1940), ${SEC_II} — la definición de los dos estados: lo que precede se aplica, lo que sigue se separa`,
  `${VALENTE}, Anthologiae IX.3 (trad. Mark T. Riley), ${SEC_II} — el Júpiter en marcha retrógrada "being carried towards the position of the Ascendant": la fuente antigua que registra el caso que la definición posicional deja fuera`,
  `${VALENTE}, Anthologiae IV.14, "The Phases and Transits of the Stars" (trad. Riley), ${SEC_II} — las estaciones: demora en la primera, demora cancelada en la segunda`,
  `${VALENTE}, Anthologiae IX.3 (trad. Riley), ${SEC_II} — "Be aware of the transits of the stars and their changes of sign at the various chronocratorships": en la fuente el tránsito es disparador, y quien define el asunto es el señor del tiempo`,
  `${PTOLOMEU}, Tetrabiblos I.13, ${SEC_II} — los cuatro aspectos, y la ausencia de cualquier orbe: en ${PTOLOMEU} el aspecto es entre signos enteros`,
  `William Lilly, Christian Astrology, Libro I, p. 107, Londres, ${ANO_LILLY} — la tabla de orbes y la regla de la mitad: en la tradición posterior el orbe pertenece al planeta, no al aspecto`,
];

const FALTA = {
  data: {
    texto:
      'Sin la fecha de nacimiento no hay carta con la cual comparar el cielo de hoy, y de esa comparación sale todo: si el ángulo se está formando o si ya se deshizo. La app prefiere no mostrar nada antes que mostrar una carta inventada.',
    comoResolver: 'Ingresa tu fecha de nacimiento en la Carta Astral.',
  },
  aspecto: {
    texto:
      'No se pudo reconocer el aspecto indicado. Esta lectura trabaja sobre un encuentro entre un planeta del cielo de hoy y un punto de tu carta de nacimiento, con uno de los cinco ángulos que la app calcula — y sin los tres nombres no hay nada que medir.',
    comoResolver: 'Abre El cielo de hoy para ti desde la Carta Astral, que es de donde salen estos aspectos.',
  },
  efemeride: {
    texto:
      'Las posiciones del cielo no se pudieron calcular ahora. Sin ellas no hay manera de comparar la posición de hoy con la de mañana, que es toda la cuenta de esta lectura. La app prefiere no mostrar nada antes que mostrar un cielo inventado.',
    comoResolver: 'Inténtalo de nuevo en un momento, en la Carta Astral.',
  },
  horaParaLuaNatal: {
    texto:
      'Falta la hora de nacimiento, y aquí no es un detalle. Este encuentro toca tu Luna de nacimiento, y la Luna es el único punto de la carta que avanza rápido: hasta 7,69 grados en veinticuatro horas — más que toda la distancia que esta pantalla considera. ' +
      'Sin la hora, la app usaría el mediodía. Medimos lo que eso hace: comparando la Luna natal del mediodía con la de medianoche y la de las 23:59 en 6.334 encuentros, de las 12.668 comparaciones 10.054 salieron de alcance, 2.613 siguieron en alcance pero cambiaron el verbo, y exactamente una sobrevivió igual. ' +
      'Decir "se está formando" encima de eso sería cara o cruz con cara de cuenta.',
    comoResolver: 'Ingresa la hora de nacimiento en la Carta Astral — es el mismo campo que destraba el Ascendente.',
  },
};

export const PACK = {
  idioma: 'es',
  tela: 'Carta Astral',
  telaCeu: 'El cielo de hoy para ti',
  formatarGraus,
  graus,
  duracao,
  planetas: PLANETAS,
  planetasFrase: PLANETAS_FRASE,
  aspectos: ASPECTOS,
  faseNome: FASE_NOME,
  faseTermo: FASE_TERMO,
  chamada: CHAMADA,
  leitura: LEITURA,
  prazo: PRAZO,
  linhaCurta: LINHA_CURTA,
  notaMarcha: NOTA_MARCHA,
  notaHorizonte: NOTA_HORIZONTE,
  notaOrbe: NOTA_ORBE,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaDataDeEvento: NOTA_DATA_DE_EVENTO,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
