// lib/traducoes/seita.es.js
// EL PACK ESPAÑOL de la secta (hairesis) — español neutro-latino.
//
// Misma FORMA que lib/traducoes/seita.pt.js: mismas claves, mismos campos,
// funciones con la misma firma. Lo que NUNCA cambia entre packs: el verbatim
// inglés de Robbins y de Riley (traducir una cita es falsificarla), los loci
// (Tetrabiblos I.7 sigue siendo Tetrabiblos I.7), los números, y las CLAVES
// internas — los nombres de planeta siguen en portugués en los tres packs
// porque son datos, no texto de pantalla.
//
// Valen aquí todas las reglas del encabezado de lib/seita.js: engancha primero
// y la fuente después, locus en toda afirmación histórica, ninguna afirmación
// de salud, ningún veredicto ni promesa, y — la más importante de esta
// función — NO COMPLETAR EL HUECO: Valente afirma lo positivo (maléfico en su
// propia secta es dador de bien) y la app no afirma lo negativo, porque la base
// no encontró la línea antigua que lo autorice.

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

const SEITA_NOME = { diurno: 'diurno', noturno: 'nocturno' };
const SEITA_MAPA = { diurno: 'carta diurna', noturno: 'carta nocturna' };

// Tetrabiblos I.5. Vocabulario de física antigua, no juicio moral.
const CLASSES = { benefico: 'benéfico', malefico: 'maléfico', comum: 'común' };

function formatarGraus(n) {
  return Number(n).toFixed(1).replace('.', ',');
}

const ESTRELA = { manha: 'de la mañana', tarde: 'de la tarde' };
const TURNO = { diurno: 'del día', noturno: 'de la noche' };

// ---------------------------------------------------------------------------
// LAS CITAS — verbatim, sin traducir
// ---------------------------------------------------------------------------
const VERBATIM = {
  valensMaleficos: {
    texto:
      'even the malefic stars, when they are operative in appropriate places in their own sect, are bestowers of good and indicative of the greatest positions and success; when they are inoperative, they bring about disasters and accusations.',
    parafrase:
      'Hasta los astros maléficos, cuando operan en lugares apropiados y en su propia secta, son dadores de bien y señal de las mayores posiciones; cuando quedan inoperantes, traen desastres y acusaciones.',
    locus: 'Vetio Valente, Anthologiae I.1, trad. Riley',
  },
  ptolomeuMercurio: {
    texto: 'common as before, diurnal when it is a morning star and nocturnal as an evening star',
    parafrase:
      'Mercurio es común, como ya lo era: diurno cuando aparece en el cielo antes que el Sol, nocturno cuando aparece después.',
    locus: 'Ptolomeo, Tetrabiblos I.7, trad. Robbins, 1940',
  },
  ptolomeuBeneficos: {
    texto: 'because of their tempered nature and because they abound in the hot and the moist',
    parafrase:
      'Júpiter, Venus y la Luna son benéficos por su naturaleza templada y por abundar en lo caliente y lo húmedo — y fíjate que la Luna está en la lista.',
    locus: 'Ptolomeo, Tetrabiblos I.5, trad. Robbins, 1940',
  },
  ptolomeuMaleficos: {
    texto: 'one because of his excessive cold and the other for his excessive dryness',
    parafrase:
      'Saturno y Marte son maléficos por exceso: uno de frío, el otro de sequedad. Es clasificación de cualidad elemental, no de carácter.',
    locus: 'Ptolomeo, Tetrabiblos I.5, trad. Robbins, 1940',
  },
  ptolomeuComuns: {
    texto: 'have both powers, because they have a common nature',
    parafrase:
      'Sol y Mercurio tienen los dos poderes, porque su naturaleza es común — toman el color de la compañía. El Sol no es benéfico en la cuenta de Ptolomeo.',
    locus: 'Ptolomeo, Tetrabiblos I.5, trad. Robbins, 1940',
  },
  valensDia: {
    texto: 'of the day sect',
    parafrase: 'La etiqueta que Valente da, planeta por planeta, a los que juegan de día: Sol, Júpiter y Saturno.',
    locus: 'Vetio Valente, Anthologiae I.1, trad. Riley',
  },
  valensNoite: {
    texto: 'of the night sect',
    parafrase: 'La etiqueta que Valente da, planeta por planeta, a los que juegan de noche: Luna, Venus y Marte.',
    locus: 'Vetio Valente, Anthologiae I.1, trad. Riley',
  },
};

// ---------------------------------------------------------------------------
// BLOQUE 1 — EL GANCHO. Vida real, sin término técnico, sin nombre propio.
// ---------------------------------------------------------------------------
const CHAMADA = {
  diurno: () =>
    'En la hora exacta en que naciste todavía había claridad afuera: el Sol estaba por encima de la línea del horizonte. ' +
    'Parece un detalle de partida de nacimiento. Es la pieza que cambia la lectura de siete planetas de una sola vez.',
  noturno: () =>
    'En la hora exacta en que naciste ya estaba oscuro afuera: el Sol estaba por debajo de la línea del horizonte. ' +
    'Parece un detalle de partida de nacimiento. Es la pieza que cambia la lectura de siete planetas de una sola vez.',
};

const EXPLICACAO = {
  diurno: (c) =>
    `Toda carta cae de un lado o del otro de esa línea, sin término medio: o el Sol ya había salido y aún no se había puesto, o no. ` +
    `Tu Sol estaba a ${formatarGraus(c.graus)} grados por encima del horizonte.` +
    `\n\n` +
    `Lo que eso hace: la astrología antigua reparte los planetas en dos equipos. Tres juegan de día, tres juegan de noche, y uno cambia de lado según el caso. ` +
    `Quien nació de día tiene al equipo del día jugando en casa. El mismo Saturno, el mismo Marte y la misma Luna no se leen igual en las dos cartas — y es solo eso lo que las separa.` +
    `\n\n` +
    `El nombre en la fuente es secta (hairesis, en griego — el equipo al que pertenece cada planeta). ` +
    `La tabla es de Ptolomeo, Tetrabiblos I.7, s. II: Sol y Júpiter de día, Luna y Venus de noche, Mercurio según aparezca en el cielo antes o después del Sol. ` +
    `Vetio Valente, en el mismo siglo, lo confirma planeta por planeta en la Anthologiae I.1.` +
    `\n\n` +
    `Y Valente agrega la frase que casi todo resumen se salta: el maléfico que opera en lugar apropiado y en su propia secta es dador de bien, no de estrago. ` +
    `Por eso Saturno en una carta diurna — la tuya — no es el Saturno de una carta nocturna.`,
  noturno: (c) =>
    `Toda carta cae de un lado o del otro de esa línea, sin término medio: o el Sol ya había salido y aún no se había puesto, o no. ` +
    `Tu Sol estaba a ${formatarGraus(c.graus)} grados por debajo del horizonte.` +
    `\n\n` +
    `Lo que eso hace: la astrología antigua reparte los planetas en dos equipos. Tres juegan de día, tres juegan de noche, y uno cambia de lado según el caso. ` +
    `Quien nació de noche tiene al equipo de la noche jugando en casa. El mismo Marte, el mismo Saturno y la misma Luna no se leen igual en las dos cartas — y es solo eso lo que las separa.` +
    `\n\n` +
    `El nombre en la fuente es secta (hairesis, en griego — el equipo al que pertenece cada planeta). ` +
    `La tabla es de Ptolomeo, Tetrabiblos I.7, s. II: Sol y Júpiter de día, Luna y Venus de noche, Mercurio según aparezca en el cielo antes o después del Sol. ` +
    `Vetio Valente, en el mismo siglo, lo confirma planeta por planeta en la Anthologiae I.1.` +
    `\n\n` +
    `Y Valente agrega la frase que casi todo resumen se salta: el maléfico que opera en lugar apropiado y en su propia secta es dador de bien, no de estrago. ` +
    `Por eso Marte en una carta nocturna — la tuya — no es el Marte de una carta diurna.`,
};

const NOTA_CONDICAO =
  'Una salvedad que impone la propia fuente. Valente pide dos cosas a la vez: que el planeta esté en su propia secta Y que esté operando en lugar apropiado. ' +
  'La secta esta app la calcula, y es lo que estás leyendo aquí. El lugar apropiado, no — eso pide la casa y la condición de cada planeta, que esta pantalla todavía no lee. ' +
  'Media regla, dicha como media.';

const NOTA_LEITURA_DO_APP =
  'Qué es cuenta y qué es lectura. La cuenta: la app compara la longitud del Sol con el eje del Ascendente y del Descendente, que es el horizonte dibujado en la carta — hora, ciudad y efeméride de verdad, sin tabla. ' +
  'La lectura: quién es del día y quién es de la noche es tabla de Ptolomeo (Tetrabiblos I.7) y de Valente (Anthologiae I.1), ambos del s. II. ' +
  'La manera de contarlo en español de hoy es de la app, y nada más que eso.';

const NOTA_LIMITROFE = (c) =>
  `Por poco: el Sol estaba a ${formatarGraus(c.graus)} grados del horizonte en la hora que indicaste — cerca del cambio. ` +
  `En esa franja, unos pocos minutos de diferencia mueven la carta de diurna a nocturna. Si la hora que tienes es aproximada, la partida de nacimiento lo resuelve. ` +
  `(Los 3 grados que la app usa como franja de atención son elección nuestra, no regla antigua: al ritmo medio del eje son unos 13 minutos de reloj. En la fuente no hay término medio — o está encima, o está debajo.)`;

const MERCURIO = {
  manha: (c) =>
    `Mercurio apareció en el cielo antes que el Sol aquel día — estrella de la mañana, a ${formatarGraus(c.elongacao)} grados de él. Por ese criterio entra en el equipo del día.`,
  tarde: (c) =>
    `Mercurio apareció en el cielo después que el Sol aquel día — estrella de la tarde, a ${formatarGraus(c.elongacao)} grados de él. Por ese criterio entra en el equipo de la noche.`,
  indeterminado:
    'Mercurio es el único que cambia de lado: entra en el día si aparece en el cielo antes que el Sol, y en la noche si aparece después. Sin la carta calculada no se puede decir cuál de los dos es el tuyo, y la app no adivina.',
};

const LINHAS = {
  'Sol': {
    naSeita: () =>
      'El Sol está en casa: es el dueño del turno en que naciste. Eso no lo vuelve bondadoso. Ptolomeo no pone al Sol entre los benéficos — lo pone entre los comunes, que toman el color de quien tengan cerca.',
    foraDaSeita: () =>
      'El Sol es del turno del día y tú naciste de noche: está fuera de su propia secta. Tampoco se vuelve un problema por eso. En la cuenta de Ptolomeo el Sol es común, y común es quien toma el color de la compañía.',
  },
  'Lua': {
    naSeita: () =>
      'La Luna está en casa: naciste en su turno. Y hay un detalle que casi nadie cuenta — en la lista de Ptolomeo la Luna es benéfica, en el mismo grupo que Júpiter y Venus. La costumbre es citar a los dos y olvidar al luminar.',
    foraDaSeita: () =>
      'La Luna es del turno de la noche y tú naciste de día: fuera de su propia secta. Sigue siendo benéfica en la lista de Ptolomeo, junto a Júpiter y Venus — cosa que casi todo resumen olvida. Solo que no está en su turno.',
  },
  'Mercúrio': {
    naSeita: (c) =>
      `Mercurio es el único que cambia de lado, y el criterio es la hora en que aparece en el cielo: antes que el Sol, es del día; después, es de la noche. ` +
      `En tu caso es estrella ${ESTRELA[c.estrela]} — y cayó en el mismo turno de tu carta. Está en casa.`,
    foraDaSeita: (c) =>
      `Mercurio cambia de lado según aparezca antes o después que el Sol. En tu caso es estrella ${ESTRELA[c.estrela]}, lo que lo pone en el turno ${TURNO[c.estrela === 'manha' ? 'diurno' : 'noturno']} — ` +
      `y tu carta es ${SEITA_NOME[c.seita]}. Fuera de su propia secta, entonces.`,
  },
  'Vênus': {
    naSeita: () =>
      'Venus está en casa: es del turno de la noche, y es en él donde naciste. Valente resume lo que ella mueve en dos palabras — deseo y afecto — y Ptolomeo la pone entre los benéficos.',
    foraDaSeita: () =>
      'Venus es del turno de la noche y tú naciste de día: fuera de su propia secta. Sigue siendo benéfica en la cuenta de Ptolomeo — la clasificación sale de su naturaleza, no del turno.',
  },
  'Marte': {
    naSeita: () =>
      'Marte es maléfico en la lista antigua, y aquí viene el giro: naciste de noche, que es su turno. Marte está en su propia secta. ' +
      'Valente escribe, en la misma página en que lo llama maléfico, que un maléfico así colocado es dador de bien. En la fuente, Marte es lo que corta, forja y manda.',
    foraDaSeita: () =>
      'Marte es del turno de la noche y tú naciste de día: fuera de su propia secta. Y aquí la app frena. ' +
      'La frase de Valente sobre el dador de bien es para el maléfico EN su propia secta; la frase opuesta suya es sobre el maléfico inoperante, que no es lo mismo. ' +
      'Ningún texto antiguo de esta base dice que Marte de día sea peor, y el hueco queda declarado en vez de rellenado.',
  },
  'Júpiter': {
    naSeita: () =>
      'Júpiter está en casa: del turno del día, y es en él donde naciste. Es benéfico en la lista de Ptolomeo, y el motivo que él da es físico, no moral — ' +
      'Júpiter calienta y humedece en su justa medida, y son esas las dos cualidades que la fuente llama fecundas.',
    foraDaSeita: () =>
      'Júpiter es del turno del día y tú naciste de noche: fuera de su propia secta. Sigue siendo benéfico en la cuenta de Ptolomeo — la clasificación sale de su naturaleza, no del turno.',
  },
  'Saturno': {
    naSeita: () =>
      'Esta es la línea que el resumen de Saturno suele saltarse: Saturno es el maléfico del turno del DÍA, y tú naciste de día. Está en su propia secta. ' +
      'Valente, en la misma página en que lo llama maléfico, escribe que el maléfico bien puesto en su propia secta es dador de bien — y enumera cargo, supervisión y administración de bienes ajenos. ' +
      'El Saturno de las lecciones y la madurez es otro: viene de Liz Greene, 1976.',
    foraDaSeita: () =>
      'Saturno es del turno del día y tú naciste de noche: fuera de su propia secta. Y aquí la app se detiene. ' +
      'La frase de Valente sobre el dador de bien es para el maléfico EN su propia secta; la frase opuesta suya es sobre el maléfico inoperante, que no es lo mismo. ' +
      'Ningún texto antiguo de esta base dice que Saturno de noche sea peor, y el hueco queda declarado en vez de rellenado.',
  },
};

const LINHA_MODERNA = {
  'Urano': (c) =>
    `La secta no se aplica a Urano. La doctrina es sobre los siete que se ven a simple vista, y Urano recién fue descubierto en ${c.ano} — más de mil seiscientos años después de que Ptolomeo escribiera la tabla. La app no le inventa un lugar en ella.`,
  'Netuno': (c) =>
    `La secta no se aplica a Neptuno. La tabla es del s. II y Neptuno fue descubierto en ${c.ano}: no hay forma de que Ptolomeo o Valente hayan dicho nada sobre él. Dejar la línea en blanco sería más honesto que rellenarla, y decirlo lo es todavía más.`,
  'Plutão': (c) =>
    `La secta no se aplica a Plutón. Fue descubierto en ${c.ano} — dieciocho siglos después de la tabla. Donde la fuente no habla, la app tampoco.`,
};

const RECIBOS = {
  'Sol': 'Ptolomeo, Tetrabiblos I.7 — el Sol abre la lista de los diurnos. Valente, Anthologiae I.1: "of the day sect". Clase común: Tetrabiblos I.5.',
  'Lua': 'Ptolomeo, Tetrabiblos I.7 — la Luna abre la lista de los nocturnos. Valente, Anthologiae I.1: "of the night sect". Benéfica: Tetrabiblos I.5, junto a Júpiter y Venus.',
  'Mercúrio':
    'Ptolomeo, Tetrabiblos I.7 — "common as before, diurnal when it is a morning star and nocturnal as an evening star". Estrella de la mañana y de la tarde: Tetrabiblos I.8. La grilla de Valente en I.1, tal como esta base la registra, no incluye a Mercurio.',
  'Vênus': 'Ptolomeo, Tetrabiblos I.7 — Venus entre los nocturnos. Valente, Anthologiae I.1: "of the night sect", y "Venus is desire and love". Benéfica: Tetrabiblos I.5.',
  'Marte':
    'Ptolomeo, Tetrabiblos I.7 — Marte en la secta de la noche. Valente, Anthologiae I.1: "of the night sect". Maléfico por sequedad excesiva: Tetrabiblos I.5. La razón dada para que entre en la noche — que es húmeda y templa lo seco — viene del resumen del capítulo I.7, y esta base no verificó la frase entera en el original.',
  'Júpiter':
    'Ptolomeo, Tetrabiblos I.7 — Júpiter entre los diurnos. Valente, Anthologiae I.1: "of the day sect". Benéfico: Tetrabiblos I.5, "because of their tempered nature and because they abound in the hot and the moist".',
  'Saturno':
    'Ptolomeo, Tetrabiblos I.7 — Saturno en la secta del día. Valente, Anthologiae I.1: "of the day sect". Maléfico por frío excesivo: Tetrabiblos I.5. La razón dada para que entre en el día — que es caliente y templa el frío — viene del resumen del capítulo I.7, y esta base no verificó la frase entera en el original.',
  'Urano': 'Descubierto en 1781. No está en Ptolomeo ni en Valente: no hay secta antigua que atribuirle.',
  'Netuno': 'Descubierto en 1846. No está en Ptolomeo ni en Valente: no hay secta antigua que atribuirle.',
  'Plutão': 'Descubierto en 1930. No está en Ptolomeo ni en Valente: no hay secta antigua que atribuirle.',
};

const FONTES = [
  'Ptolomeo, Tetrabiblos I.7 (trad. F. E. Robbins, Loeb/Harvard, 1940) — la tabla de las sectas: Sol y Júpiter diurnos, Luna y Venus nocturnos, Mercurio común, diurno como estrella de la mañana y nocturno como estrella de la tarde',
  'Vetio Valente, Anthologiae I.1 (trad. Riley) — la misma grilla planeta por planeta, y la regla del maléfico que opera en su propia secta',
  'Ptolomeo, Tetrabiblos I.5 — benéficos, maléficos y comunes, derivados de las cuatro cualidades: la Luna entre los benéficos, el Sol entre los comunes',
  'Ptolomeo, Tetrabiblos I.8 — oriental y occidental: el planeta que aparece en el cielo antes que el Sol y el que aparece después',
  'Ptolomeo, Tetrabiblos I.7 — la razón dada para que los dos maléficos entren en la secta contraria a su propia naturaleza (Saturno en el día, Marte en la noche). Viene del resumen del capítulo; esta base no verificó la frase entera en el original',
  'Liz Greene, Saturn: A New Look at an Old Devil, 1976 — el Saturno de las lecciones y la madurez, que es lectura del s. XX y no de la tradición antigua',
];

const FALTA = {
  data: {
    texto:
      'Sin la fecha de nacimiento no hay dónde buscar el Sol, y es su posición respecto al horizonte la que decide si la carta es diurna o nocturna.',
    comoResolver: 'Indica tu fecha de nacimiento en la Carta Astral.',
  },
  hora: {
    texto:
      'Falta la hora. Diurna o nocturna es una pregunta sobre el instante: ¿el Sol estaba por encima o por debajo del horizonte cuando naciste? El mediodía y la medianoche del mismo día dan respuestas opuestas, así que aquí no hay conjetura honesta que valga.',
    comoResolver: 'Indica la hora de nacimiento en la Carta Astral — es el mismo campo que desbloquea el Ascendente.',
  },
  cidade: {
    texto:
      'Falta la ciudad. El horizonte es distinto en cada punto del planeta: la misma hora del mismo día es de día en un lugar y de noche en otro. Sin el lugar, no hay horizonte con el que comparar.',
    comoResolver: 'Elige la ciudad de nacimiento en la Carta Astral — es el mismo campo que desbloquea el Ascendente y las casas.',
  },
  efemeride: {
    texto: 'Las posiciones del cielo no se pudieron calcular ahora. La app prefiere no mostrar nada antes que mostrar un cielo inventado.',
    comoResolver: 'Vuelve a intentarlo en un momento, en la Carta Astral.',
  },
};

export const PACK = {
  idioma: 'es',
  tela: 'Carta Astral',
  formatarGraus,
  planetas: PLANETAS,
  seitaNome: SEITA_NOME,
  seitaMapa: SEITA_MAPA,
  classes: CLASSES,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  notaCondicao: NOTA_CONDICAO,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaLimitrofe: NOTA_LIMITROFE,
  mercurio: MERCURIO,
  linhas: LINHAS,
  linhaModerna: LINHA_MODERNA,
  recibos: RECIBOS,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
