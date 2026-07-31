// lib/traducoes/pensamento.es.js
// PACK EN ESPAÑOL (neutro latinoamericano) del PENSAMIENTO CÓSMICO DEL DÍA —
// lib/dailyThought.js. Es el contenido nº 1 de la Home: lo ve todo el mundo,
// todos los días. Aquí vive SOLO el texto que la persona lee; el motor sigue
// siendo el mismo y sigue siendo canónico en portugués.
//
// EL MOTOR NO CAMBIA. Mismo día + mismo signo = mismo pensamiento, en
// cualquier idioma: fase, signo lunar, regente del día, retrógrado y aspecto
// se calculan igual y se eligen igual. Lo único que este archivo hace es
// prestarle palabras a esa cuenta.
//
// LO QUE NUNCA SE TRADUCE (y test/pensamentoIdiomas.test.js lo cobra):
//   · las CLAVES de `signos`, `planetas` y `aspectos` — son los nombres
//     canónicos de lib/signs.js, la junta con el cálculo. Si alguien las
//     traduce, el pensamiento se queda mudo en silencio;
//   · los emojis (fase, signo, regente, ↩️): no tienen idioma;
//   · el ORDEN de `regentes` (0 = domingo … 6 = sábado, orden caldeo) y el
//     orden de `relacionSigno` (0 = mismo signo … 6 = signo opuesto).
//     Reordenar es decirle a la persona otra cosa de la que el cielo dice.
//
// LA LÍNEA ROJA, en español: no entra aliviar, calmar, sanar, curar, tratar
// ni energizar, ni sus parientes. Tampoco promesa de resultado, ni veredicto
// sobre la vida de nadie, ni aviso defensivo, ni prueba social inventada. El
// texto describe el cielo y ofrece una invitación — nunca dice qué va a pasar.
//
// EL TONO: agarra primero, recibo después — igual que el PT. Se abre en
// conversación de la vida real y recién ahí aparece la fuente. Traducción de
// SENTIDO: "deixa espaço pra" no es "deja espacio para" por diccionario, es la
// misma mano abierta en español rioplatense-neutro.
export default {
  // Las tres aperturas por período (mañana / tarde / noche, hora local del
  // aparato). Son la única parte que cambia dentro del mismo día.
  aberturas: {
    manha: 'El día está empezando ahora, entero, sin nada escrito todavía.',
    tarde: 'Ya pasó la mitad del día — buen momento para mirar si va para el lado que querías.',
    noite: 'El día se está cerrando — antes de acostarte, vale anotar lo que te dejó.',
  },

  // Sin efeméride no hay cielo, y el cielo no se inventa: el texto lo dice.
  // "Calendario Lunar" es el nombre de la pantalla en español (lib/i18n.js).
  carregando: 'El cielo de hoy todavía se está cargando — abre el Calendario Lunar en un momento.',

  // Moldes. Los placeholders son parte del contrato: mismos nombres, mismos
  // espacios finales. {icone} ya viene con su espacio cuando existe.
  saudacao: '{icone}{signo}, ',
  luaEm: 'La Luna está en {signo} {emoji}. ',
  // POR QUE NO ES "Hoy es día de {planeta}" NI EMPIEZA POR EL PLANETA: en
  // español los dos luminares piden artículo ("el Sol", "la Luna"), y por eso
  // `planetas` lo trae abajo. Dos consecuencias: (a) "día de Sol" sin artículo
  // se lee como DÍA SOLEADO, no como día regido por el Sol — de ahí "Hoy manda
  // el Sol", que además evita la contracción sucia "de el"; (b) un planeta ya
  // no puede abrir la frase en minúscula, así que la línea del aspecto empieza
  // por "En el cielo," (mismo recurso que el pack en inglés).
  regenteFrase: 'Hoy manda {planeta} {emoji} — deja espacio para {tema}. {ponte}',
  aspectoFrase: 'En el cielo, {planetaA} y {planetaB} están en {aspecto} {quando} — {tom}.',

  // Relación entre la Luna de hoy y el signo de la persona, por signo entero
  // (doctrina helenística: dos signos se ven o no se ven, sin orbe).
  // 0 = mismo signo … 6 = signo opuesto. El orden ES el significado.
  relacaoSigno: [
    'La Luna está justo en tu signo hoy — lleva el día con el corazón más expuesto, tu sensibilidad está alta.',
    'La Luna pide un ajuste fino en tu rutina hoy — las adaptaciones pequeñas rinden más que las decisiones grandes.',
    'La Luna abre una oportunidad liviana para tu signo hoy — vale aprovecharla sin forzar.',
    'La Luna tensiona un poco tu signo hoy — puede exigir una decisión que venías postergando.',
    'La Luna fluye fácil con tu signo hoy — las cosas tienden a resolverse con menos esfuerzo que de costumbre.',
    'La Luna pide un pequeño reajuste de expectativa hoy — lo que parece fuera de lugar solo necesita otro ángulo.',
    'La Luna está justo enfrente de tu signo hoy — es normal sentir un tira y afloja entre lo que quieres y lo que el momento pide.',
  ],

  // Regencia tradicional de los días de la semana (orden caldeo). Índice =
  // Date.getDay(): 0 = domingo … 6 = sábado. El nombre del planeta NO vive
  // aquí — sale de `planetas`, para que haya una sola fuente. `ponte` es el
  // puente al día siguiente y nombra al regente REAL de mañana.
  regentes: [
    {
      tema: 'brillar a tu manera, sin tener que explicarte ante nadie',
      ponte: 'Mañana llega la Luna trayendo espacio para sentir más hondo — guárdale un lugar.',
    }, // domingo
    {
      tema: 'sentir con profundidad y cuidar de quien amas — incluida tu propia persona',
      ponte: 'Mañana Marte presta coraje para que lo que sentiste hoy se vuelva acción.',
    }, // lunes
    {
      tema: 'actuar incluso con miedo — el coraje de verdad es dar el paso a pesar de él',
      ponte: 'Mañana Mercurio ayuda a poner en palabras lo que empezaste a mover hoy.',
    }, // martes
    {
      tema: 'decir lo que hace falta decir, aunque la voz salga temblando un poco',
      ponte: 'Mañana Júpiter abre horizontes a partir de lo que se conversó hoy.',
    }, // miércoles
    {
      tema: 'creer que todavía hay tiempo para que pasen cosas buenas',
      ponte: 'Mañana Venus invita al amor y a la abundancia — aprovecha lo que se abrió hoy.',
    }, // jueves
    {
      tema: 'permitirte recibir amor, belleza y abundancia sin culpa',
      ponte: 'Mañana Saturno ayuda a darle forma y raíz a todo eso.',
    }, // viernes
    {
      tema: 'encarar lo que pesa con madurez — no todo tiene que ser liviano para valer la pena',
      ponte: 'Mañana el ciclo vuelve a empezar con el Sol — un capítulo nuevo de tu semana.',
    }, // sábado
  ],

  // Mercurio retrógrado — se calcula de verdad (lib/signs.js), nunca se
  // supone. "sin apuro" en lugar de "con calma": el sentido es el mismo y la
  // palabra prohibida no entra.
  retrogrado:
    'Si hoy parece que nada anda al ritmo correcto, Mercurio retrógrado ↩️ lo explica — no es idea tuya. Es una invitación a revisar y ajustar sin apuro, sin prisa por decidir todo ahora.',

  // "hoy" solo cuando el aspecto es de hoy de verdad (involucra luminar o
  // planeta personal). Entre planetas lentos dura semanas: eso es un período,
  // no una novedad del día.
  aspectoQuando: {
    hoje: 'hoy',
    periodo: 'en este período',
  },

  // CLAVES CANÓNICAS (lib/signs.js, ASPECTS_TABLE). `nome` va en minúscula
  // porque entra en medio de la frase; `tom` es el significado tradicional.
  aspectos: {
    'Conjunção': { nome: 'conjunción', tom: 'sumando fuerzas a tu favor' },
    'Sextil': { nome: 'sextil', tom: 'abriendo una oportunidad liviana para aprovechar' },
    'Trígono': { nome: 'trígono', tom: 'fluyendo fácil, casi sin esfuerzo' },
    'Quadratura': {
      nome: 'cuadratura',
      tom: 'exigiendo una decisión difícil — duele, pero es del tipo de dolor que hace crecer',
    },
    'Oposição': {
      nome: 'oposición',
      tom: 'tirando para dos lados — está bien sentir ese peso antes de encontrar el punto medio',
    },
  },

  // NOMBRES — las claves son los nombres canónicos de lib/signs.js.
  signos: {
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
  },
  // Los dos luminares llevan artículo — en español "Luna y Júpiter están en
  // trígono" es agramatical, y "día de Sol" cambia de sentido. Los otros ocho
  // van sin artículo, como se dicen.
  planetas: {
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
  },
};
