// lib/traducoes/luaForaDeCurso.es.js
// EL PACK EN ESPAÑOL de la Luna fuera de curso. Misma FORMA que el pack pt:
// mismas claves, mismas funciones con la misma firma. Lo que nunca cambia entre
// packs: el verbatim en inglés de Lilly y de Morrison, los loci (Christian
// Astrology, Londres, 1647, p. 112 sigue siendo eso en los tres) y los números.
//
// Las reglas del encabezado de lib/luaForaDeCurso.js valen para cada string de
// este archivo:
//   • NINGUNA ORDEN A LA PERSONA. Nada de «no firmes», «evita», «aprovecha
//     para». La app describe el cielo (que es cálculo) y describe lo que cada
//     autor escribió (que es cita). La decisión es de quien lee.
//   • EL CONSEJO DE AGENDA NO ES ANTIGUO: es de Al H. Morrison, desde ~1970.
//     En Lilly (1647) el criterio juzga una PREGUNTA de astrología horaria.
//   • LA CITA NO SE TRADUCE. El inglés queda igual; la paráfrasis al lado es de
//     la app y va sin comillas.
//   • NINGUNA AFIRMACIÓN DE SALUD, ni implícita. Por eso la cita de Morrison
//     entra recortada.

const SIGNOS = {
  'Áries': 'Aries',
  'Touro': 'Tauro',
  'Gêmeos': 'Géminis',
  'Câncer': 'Cáncer',
  'Leão': 'Leo',
  'Virgem': 'Virgo',
  'Libra': 'Libra',
  'Escorpião': 'Escorpio',
  'Sagitário': 'Sagitario',
  'Capricórnio': 'Capricornio',
  'Aquário': 'Acuario',
  'Peixes': 'Piscis',
};

const PLANETAS = {
  'Sol': 'Sol',
  'Mercúrio': 'Mercurio',
  'Vênus': 'Venus',
  'Marte': 'Marte',
  'Júpiter': 'Júpiter',
  'Saturno': 'Saturno',
};

const ASPECTOS = {
  conjuncao: 'Conjunción',
  sextil: 'Sextil',
  quadratura: 'Cuadratura',
  trigono: 'Trígono',
  oposicao: 'Oposición',
};

const ASPECTOS_COM_GLOSA = {
  conjuncao: 'una conjunción (los dos en el mismo grado del zodíaco)',
  sextil: 'un sextil (60° entre los dos)',
  quadratura: 'una cuadratura (90° entre los dos)',
  trigono: 'un trígono (120° entre los dos)',
  oposicao: 'una oposición (180°, uno justo enfrente del otro)',
};

// El género cambia de aspecto a aspecto también en español: «una conjunción
// exacta», pero «un sextil exacto».
const ASPECTOS_EXATO = {
  conjuncao: 'una conjunción exacta',
  sextil: 'un sextil exacto',
  quadratura: 'una cuadratura exacta',
  trigono: 'un trígono exacto',
  oposicao: 'una oposición exacta',
};

function dur(h) {
  const min = Math.round((h || 0) * 60);
  if (min < 1) return 'menos de un minuto';
  if (min < 60) return `${min} ${min === 1 ? 'minuto' : 'minutos'}`;
  const horas = Math.floor(min / 60);
  const resto = min % 60;
  if (resto === 0) return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
  return `${horas} h ${String(resto).padStart(2, '0')} min`;
}

function graus(g) {
  return `${(g || 0).toFixed(1).replace('.', ',')}°`;
}

function fimDaRegua(c) {
  return c.definicaoId === 'porfirio' ? 'avanzar 30°' : 'cambiar de signo';
}

// Después de «antes de que» el español pide subjuntivo — con el infinitivo la
// frase queda rota. Cada idioma resuelve su propia gramática dentro del pack.
function fimDaReguaSubjuntivo(c) {
  return c.definicaoId === 'porfirio' ? 'avance 30°' : 'cambie de signo';
}

const DEFINICOES = {
  moderna: {
    nome: 'por frontera de signo',
    naFrase: 'de la frontera de signo',
    criterio:
      'la Luna está fuera de curso cuando ya no cierra ningún ángulo exacto con los otros seis antes de cambiar de signo',
    autor: 'William Lilly',
    seculo: '1647',
    locus: 'William Lilly, Christian Astrology, Londres, 1647, p. 112',
    quemUsa:
      'es la regla de las tablas de «día libre» que circulan hoy, llevada al gran público por Al H. Morrison desde ~1970',
    porQueEssa:
      'La pantalla abre con esta porque es la que ya viste en algún lado. La otra queda al costado, calculada también, porque las dos existen y no dan el mismo período.',
  },
  porfirio: {
    nome: 'por los 30° siguientes',
    naFrase: 'de los 30° siguientes',
    criterio:
      'la Luna está fuera de curso cuando no cierra ningún ángulo exacto con los otros seis en los 30° siguientes de su camino — y la frontera de signo no entra en la cuenta',
    autor: 'Porfirio de Tiro (la primera definición conocida es de Antíoco de Atenas)',
    seculo: 'siglo III d.C. (Antíoco, siglo II)',
    locus:
      'Porfirio de Tiro, Introducción al Tetrabiblos, siglo III (trad. James H. Holden, Porphyry the Philosopher, AFA, 2009); Antíoco de Atenas, siglo II, en Eduardo Gramaglia, Astrología Hermética, p. 188',
    quemUsa: 'es la definición helenística, la más antigua que se conoce — y casi ninguna app la usa',
    porQueEssa:
      'Esta es la regla antigua, y es más exigente que la moderna: pide 30° limpios de camino, no solo el pedazo que falta hasta el cambio de signo.',
  },
};

const VERBATIM = {
  lilly: {
    texto:
      'A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other.',
    parafrase:
      'Un planeta está fuera de curso cuando acaba de separarse de otro y no va, enseguida, a aplicar a ningún otro mientras siga en ese signo.',
    locus: 'William Lilly, Christian Astrology, Londres, 1647, p. 112',
  },
  // La cita de Morrison entra RECORTADA a propósito, y el recorte está
  // declarado en la paráfrasis: la lista de prácticas que él enumera está en el
  // documento de investigación y no tiene por qué aparecer en una app.
  morrison: {
    texto:
      'Every couple of days there comes a time which is best used to subjective, spiritual non-material concerns…',
    parafrase:
      'Cada dos días, más o menos, llega un período que él describe como mejor aprovechado en cosas subjetivas y no materiales. La cita está recortada a propósito: la lista de prácticas que él da después está en el documento de investigación, y una app no es lugar para sugerirle prácticas a nadie.',
    locus: 'Al H. Morrison, The Void of Course Moon, desde ~1970',
  },
};

function abertura(c) {
  if (c.foraDeCurso) {
    // El tramo vacío es OTRO en cada regla: la cuenta de Porfirio no habla de
    // signos, así que la apertura tampoco puede hacerlo.
    const trecho = c.definicaoId === 'porfirio'
      ? `la Luna tiene 30° enteros de camino por delante, de ${c.signo} en adelante,`
      : `la Luna atraviesa el resto de ${c.signo}`;
    return `¿Viste esa captura que aparece todas las semanas — «no firmes nada ahora, la Luna está fuera de curso»? Sale de esta cuenta. En este momento ${trecho} sin cerrar ningún ángulo exacto más con ninguno de los otros seis cuerpos que la astrología antigua seguía: un tramo de camino sin ninguna cita marcada. Los griegos lo llamaban kenodromia — correr en el vacío.`;
  }
  return `¿Viste esa captura que aparece todas las semanas — «no firmes nada ahora, la Luna está fuera de curso»? Sale de esta cuenta, y en este momento da lo contrario: la Luna tiene cita marcada. En ${dur(c.horasAteProximo)} cierra ${c.aspectoExato} con ${c.planeta}, antes de ${fimDaRegua(c)}. Mientras haya una cita por delante, no está corriendo en el vacío — que es lo que los griegos llamaban kenodromia.`;
}

function estado(c) {
  if (c.foraDeCurso) {
    const fim = c.definicaoId === 'porfirio'
      ? 'que falten 30° de camino para la próxima cita'
      : `que entre en ${c.proximoSigno}`;
    return `Lectura de la app, con la regla ${c.definicaoNaFrase}: la Luna está fuera de curso. El tramo empezó hace ${dur(c.horasDecorridas)}, cuando cerró ${c.aspectoAnteriorExato} con ${c.planetaAnterior}, y sigue hasta ${fim} — ${dur(c.horasQueFaltam)} más.`;
  }
  return `Lectura de la app, con la regla ${c.definicaoNaFrase}: la Luna no está fuera de curso ahora. Su última cita fue ${c.aspectoAnteriorExato} con ${c.planetaAnterior}, hace ${dur(c.horasDesdeAnterior)}, y la próxima llega antes de que ella ${fimDaReguaSubjuntivo(c)}.`;
}

function janela(c) {
  if (c.foraDeCurso) {
    if (c.definicaoId === 'porfirio') {
      return `La ventana entera dura ${dur(c.horasDeJanela)}: va de la cita con ${c.planetaAnterior} hasta el punto en que faltan 30° de camino para la próxima. Dónde cambia de signo en el medio no importa aquí — Porfirio no habla de ningún signo.`;
    }
    return `La ventana entera dura ${dur(c.horasDeJanela)}: va de la cita con ${c.planetaAnterior} hasta la entrada en ${c.proximoSigno}. Apenas cambia de signo, la cuenta vuelve a empezar de cero.`;
  }
  if (c.temJanelaFutura) {
    return `Ahora no hay ninguna ventana abierta. La próxima empieza en ${dur(c.horasAteJanela)} y dura ${dur(c.horasDeJanelaFutura)}.`;
  }
  const d = c.diasVarridos;
  return `Ahora no hay ninguna ventana abierta — y en los próximos ${d} ${d === 1 ? 'día' : 'días'}, que es hasta donde llegó este recorrido, tampoco aparece ninguna con esta regla.`;
}

function proximoEncontro(c) {
  const onde = c.proximoNoSignoAtual
    ? `Se cierra todavía en ${c.signo}.`
    : `Se cierra recién después de que ella entra en ${c.proximoSigno}.`;
  // La observación sobre la divergencia solo entra cuando las dos reglas
  // realmente no coinciden en este instante.
  const nota = !c.proximoNoSignoAtual && c.divergem
    ? ' Y es justamente ese detalle el que hace que las dos reglas no coincidan ahora.'
    : '';
  return `El próximo ángulo exacto es ${c.aspectoComGlosa} con ${c.planeta}: en ${dur(c.horasAteProximo)}, después de ${graus(c.grausAteProximo)} más de camino de la Luna. ${onde}${nota}`;
}

const RELACAO_FIXA =
  'La relación entre las dos es fija y se puede verificar: todo lo que la regla de los 30° llama vacío, la de la frontera de signo también lo llama — nunca al revés, porque el pedazo que falta hasta el cambio de signo nunca pasa de 30°.';

function divergencia(c) {
  if (!c.divergem) {
    if (c.foraDeCurso) {
      return `En este instante las dos reglas dicen lo mismo: las dos ven a la Luna corriendo en el vacío. ${RELACAO_FIXA}`;
    }
    return `En este instante las dos reglas dicen lo mismo: ninguna de las dos ve vacío ahora. ${RELACAO_FIXA}`;
  }
  const si = c.foraDeCurso ? c.definicaoNaFrase : c.outraDefinicaoNaFrase;
  const no = c.foraDeCurso ? c.outraDefinicaoNaFrase : c.definicaoNaFrase;
  return `En este instante las dos reglas no coinciden: la regla ${si} dice que la Luna está fuera de curso, y la regla ${no} dice que no. No es un error de cálculo — son dos criterios con unos 1.400 años entre uno y otro, recortando el mismo día de maneras distintas. ${RELACAO_FIXA} Por eso la misma noche aparece como «día libre» en una app y como noche común en otra.`;
}

const RECIBO = {
  moderna:
    'La regla que está en pantalla es la de la frontera de signo, que es la de las tablas de «día libre». Viene de William Lilly, Christian Astrology, Londres, 1647, p. 112: "A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other." Fijate en el "during his being in that Signe" — es exactamente ahí donde el signo entra en la definición. En los griegos no estaba.',
  porfirio:
    'La regla que está en pantalla es la antigua: Porfirio de Tiro, siglo III, en la Introducción al Tetrabiblos, mide por los 30° siguientes del camino de la Luna y no menciona ninguna frontera de signo. La primera definición conocida es todavía más vieja — Antíoco de Atenas, siglo II —, y Gramaglia (Astrología Hermética, p. 188) registra en él una variante medida en tiempo: un día y una noche, unos 13° de arco.',
};

// 📐 MEDICIÓN DE LA APP, y así queda rotulada en la última frase. Los números
// salen de janelasForaDeCurso() recorriendo todo 2026, y el test los rehace en
// cada build.
const O_QUANTO_ISSO_MUDA =
  'Y el tamaño de la diferencia se puede medir, en vez de solo decir que existe. Corriendo todo 2026 en este mismo motor: con la regla de la frontera de signo son 159 ventanas en el año, y la Luna pasa 23,6% del tiempo fuera de curso — casi una cuarta parte. Con la regla de los 30° de Porfirio son 5 ventanas en todo el año, 0,65% del tiempo. La misma expresión, en las dos puntas de la tradición, describe algo cotidiano y algo raro. Esto es medición de esta app, no afirmación de una fuente antigua.';

const COMO_O_MERCADO_USA =
  'El consejo de agenda no es antiguo, y vale la pena saber de dónde salió. En Lilly, 1647, «fuera de curso» es un juicio de astrología horaria: responde a una pregunta hecha al astrólogo y señala que nada saldrá de ese asunto. Quien lo convirtió en regla del día a día fue Al H. Morrison (1916–1995), que desde ~1970 publicó tablas de Void-of-Course Moon y llevó el tema al gran público. El astrólogo contemporáneo Anthony Louis (2013 y 2021) sostiene que esa lectura es un malentendido de Lilly. Las tres posiciones están acá porque las tres existen; qué hacer con ellas es decisión de quien lee.';

const O_QUE_NAO_SE_ACHOU =
  'Y lo que la investigación no encontró queda dicho: ningún texto antiguo manda dejar de empezar cosas con la Luna fuera de curso. Tampoco encontramos quién cambió el criterio de los 30° por el de la frontera de signo — el giro ocurre en algún punto entre Fírmico Materno (siglo IV) y Mashallah y Abu Ma\'shar (siglos VIII–IX), y el texto que lo documentaría no fue localizado.';

const OS_SETE_E_OS_TRES =
  'La cuenta usa los siete cuerpos de la astrología antigua: la Luna y los seis con los que puede encontrarse — Sol, Mercurio, Venus, Marte, Júpiter y Saturno. Urano, Neptuno y Plutón quedan afuera porque ninguna de las definiciones citadas acá los conocía: Urano recién fue visto en 1781. Eso cambia el resultado, y la dirección del cambio es aritmética — un cuerpo más solo puede agregar citas, y una cita más solo puede acortar la ventana. Una app que sume los tres modernos muestra períodos más cortos que los de acá.';

const NOTA_CONJUNCAO =
  'Un detalle que la app no esconde: Ptolomeo enumera cuatro aspectos (oposición, trígono, cuadratura y sextil) y la conjunción no está entre ellos — dos cuerpos en el mismo grado no se miran, están juntos. Las definiciones de fuera de curso cuentan cinco, con la conjunción incluida, porque lo que miden es la cita que se perfecciona. Son dos cuentas conviviendo dentro de la misma tradición, y la app prefiere mostrarlo antes que redondear.';

const COMO_FOI_CALCULADO =
  'Cómo se calculó esto: para cada uno de los seis cuerpos, la app busca el instante en que el ángulo con la Luna queda exacto — 0°, 60°, 90°, 120° o 180° —, no «dentro del orbe». El cambio de signo es el instante en que la longitud de la Luna cruza el múltiplo de 30°. Todo por efemérides calculadas, nunca por tabla: es el mismo motor que la app usa para el resto del cielo.';

const LEITURA_DO_APP =
  'Qué es cálculo y qué es atribución: los instantes de arriba están medidos, y quien quiera verificarlos puede. El sentido que cada época le dio a ese vacío es atribución — y acá cada capa aparece con el nombre y el siglo de quien la escribió.';

const SEM_DADO_PESSOAL =
  'Esta lectura no te pide nada: no usa hora de nacimiento ni ciudad, porque la Luna está en el mismo punto del cielo para todo el mundo al mismo tiempo. Lo que tu ciudad cambia es solo el reloj en el que esos instantes aparecen.';

const GLOSA =
  '«Fuera de curso» traduce una palabra griega: κενοδρομία, kenodromia — kenós, vacío, más drómos, curso. Correr en el vacío.';

const INDISPONIVEL = {
  semEfemeride:
    'El motor de efemérides no respondió ahora, así que no hay manera de decir dónde está la Luna. La app prefiere decir eso antes que estimar: un horario estimado acá sería invento. Volver a abrir la pantalla en un rato suele resolverlo.',
  dataInvalida:
    'La fecha recibida no es una fecha válida, así que no existe cielo para calcular. Con una fecha real — año, mes y día —, la cuenta vuelve enseguida.',
  buscaNaoConvergiu:
    'La búsqueda del instante exacto de la próxima cita no cerró dentro de la precisión que la app exige. En vez de redondear un horario y mostrarlo como si fuera seguro, la app no muestra ninguno.',
};

function resumoJanela(c) {
  if (c.definicaoId === 'porfirio') {
    return `Fuera de curso por ${dur(c.duracaoHoras)}, de ${c.aspecto.toLowerCase()} con ${c.planeta} hasta que falten 30° para ${c.aspectoSeguinte.toLowerCase()} con ${c.planetaSeguinte}.`;
  }
  return `Fuera de curso por ${dur(c.duracaoHoras)}, de ${c.aspecto.toLowerCase()} con ${c.planeta} hasta la entrada en ${c.proximoSigno}.`;
}

const FONTE = [
  'Antíoco de Atenas, siglo II d.C. — la primera definición conocida de κενοδρομία (Luna fuera de curso), transmitida en compilaciones posteriores; citada en Eduardo Gramaglia, Astrología Hermética, p. 188, que registra también la variante medida en tiempo, «un día y una noche», unos 13° de arco',
  'Porfirio de Tiro, Introducción al Tetrabiblos, siglo III d.C. — define por los 30° siguientes, sin hablar de frontera de signo (trad. James H. Holden, Porphyry the Philosopher, AFA, 2009)',
  'William Lilly, Christian Astrology, Londres, 1647, p. 112 — "A Planet is void of course, when he is separated from a Planet, nor doth forthwith, during his being in that Signe, apply to any other": acá es donde la frontera de signo entra en el criterio',
  'Al H. Morrison (1916–1995), The Void of Course Moon — tablas y boletines desde ~1970: el punto en que un criterio de astrología horaria se vuelve consejo de agenda diaria',
  'Anthony Louis, «Will the Real Void-of-Course Moon Please Stand Up?» (2013) y «Lilly\'s definition of the Void of Course Moon» (2021), tonylouis.wordpress.com — la crítica de que la lectura de Morrison es un malentendido de Lilly',
  'Chris Brennan, Hellenistic Astrology: The Study of Fate and Fortune, Amor Fati, 2017 — κενοδρομία en el contexto helenístico',
  'Ptolomeo, Tetrabiblos I.13 (De los aspectos de los signos), trad. F. E. Robbins, Loeb/Harvard, 1940 — los aspectos que dan el vocabulario de esta cuenta',
];

export const PACK = {
  lang: 'es',
  termo: 'Luna fuera de curso',
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
