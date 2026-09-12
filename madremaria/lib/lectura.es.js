// lib/lectura.es.js
// EL ESPANOL DEL MOTOR DE LECTURA. Espejo de TABLAS + ALTERNATIVAS + el saludo
// sin nombre de lib/lectura.js, con las MISMAS claves y la misma forma.
//
// ===========================================================================
// POR QUE UN ARCHIVO HERMANO Y NO CLAVES DE datos/textos.js
// ===========================================================================
// Lo que vive aqui es una TABLA INDEXADA POR RESPUESTA: el motor pide
// TABLAS.accion['entender-mi-parte'], no una clave de pantalla. Aplanar eso en
// 'lectura.tablas.accion.entender-mi-parte' cambiaria una tabla que el motor ya
// lee por 76 claves sueltas sin dueno — y, sobre todo, entraria en
// datos/textos.es.js, que es el archivo del OTRO equipo de traduccion. Mismo
// criterio, y mismo molde, de datos/lecturas.js con datos/lecturas.es.js.
//
// EL FALLBACK es el de t() y el de traduzir.js, en este orden: campo en el
// idioma activo -> campo en PORTUGUES -> nada inventado. Una clave que falte
// aqui muestra el portugues, que es verdadero; nunca una pantalla en blanco.
//
// ===========================================================================
// DOCTRINA — las tres reglas que este archivo no puede romper
// ===========================================================================
// 1. NINGUNA PROMESA DE DESENLACE. Ningun texto de aqui dice lo que va a hacer
//    la otra persona. La lectura describe y termina en un gesto de QUIEN LEE.
// 2. TRATAMIENTO DE "TU", LATAM NEUTRO. Nunca "vos", nunca "vosotros", nunca
//    "usted". El portao de test/madremaria-promessa-tres-idiomas.test.js cobra.
// 3. LA OTRA PERSONA ES SIEMPRE "esa persona". Nunca "el", nunca "ella": el
//    genero de quien esta del otro lado no se asume (contrato, item 4).
//
// ===========================================================================
// LAS ALTERNATIVAS — lo que entra EN LUGAR de la frase retirada
// ===========================================================================
// Son lo que recibe, en vez de la invitacion, alguien en contacto duro. Por eso
// NINGUNA puede contener una palabra de contacto (escribir, mensaje, llamar,
// hablar, buscar, mandar...): si una alternativa casara con PATRONES_CONTACTO,
// la propia guardia se la comeria y la persona en bloqueo recibiria justo lo que
// la proteccion existe para evitar. Y como las guardias de lib/lectura.js
// llevan la red ESPANOLA viva (escribele, llamar, habla, dile, espera
// respuesta, va a volver, volvera, manana), la redaccion de aqui las esquiva a
// proposito:
//   · "no pide ningun paso hacia afuera" en vez de "no escribas";
//   · "de este lado del hilo" en vez de "sin contactar";
//   · "sostener" en vez de "esperar";
//   · presente puro, nunca "va a" ni futuro sintetico.
// test/madremaria-lectura-tres-idiomas.test.js verifica una por una.
// ===========================================================================

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

export const TABLAS = congelar({
  /* --- POSICION 1: EL NUDO — respuestas.corte (P2) ---------------------------- */
  preguntaNudo: {
    pelea: '¿Qué se dijo aquella vez que ninguno de los dos supo deshacer después?',
    distancia: '¿En qué momento dejaron de contarse las cosas pequeñas?',
    ruptura: '¿Qué se rompió de verdad el día en que aquello se dijo con todas las letras?',
    'me-arrepenti': '¿De qué te estabas protegiendo cuando decidiste terminar?',
    'nunca-empezo': '¿Qué quedó sin decirse en algo que nunca llegó a tener nombre?',
    generica: '¿Dónde exactamente se enredó esto?',
  },

  fraseNudo: {
    pelea: 'La carta no juzga esa discusión: marca ahí el punto donde el hilo apretó. Un nudo apretado se mira antes de tocarlo.',
    distancia:
      'La carta muestra un nudo que se hizo despacio, sin un día exacto que señalar. Eso no lo hace menor: lo hace más difícil de encontrar.',
    ruptura:
      'La carta pone el nudo en algo que sí se dijo. Lo que se dijo tiene fecha, y una fecha por lo menos da un borde por donde empezar a mirar.',
    'me-arrepenti':
      'La carta pone el nudo de tu lado del hilo. Ahí hay algo incómodo y algo útil a la vez: es la única punta a tu alcance.',
    'nunca-empezo':
      'La carta muestra un nudo hecho de lo que no llegó a pasar. Enreda igual, aun sin una historia que contarle a nadie.',
    generica: 'La carta marca el punto donde el hilo apretó. No explica el por qué: señala dónde mirar.',
  },

  /* --- POSICION 2: LA TENSION — el PAR cuando (P3) + hoy (P4) ------------------ */
  preguntaTension: {
    dias: '¿Cuánto de lo que sientes hoy es la herida y cuánto es el susto de estos días?',
    semanas: '¿Qué parte de la tensión sigue viva y qué parte ya se volvió costumbre de estas semanas?',
    'meses-1-3': '¿Qué se volvió rutina en estos meses sin que lo notaras?',
    'meses-3-12': '¿Qué sostienes estirado hace meses porque soltarlo parece perder?',
    'mas-de-un-ano': '¿Qué de esto sigue tenso de verdad y qué ya es un gesto viejo que repites?',
    generica: '¿Qué mantiene esto estirado hoy, exactamente?',
  },

  tiempo: {
    dias: 'Con días de intervalo, la carta lee una tensión todavía caliente: nada se asentó, y lo que pesa hoy pesa el doble por el ruido.',
    semanas:
      'Con semanas de intervalo, la carta lee una tensión que ya perdió el ruido del principio y se quedó más callada.',
    'meses-1-3': 'Con uno a tres meses de intervalo, la carta lee una tensión que ya tomó forma de rutina.',
    'meses-3-12':
      'Con varios meses de intervalo, la carta lee una tensión que se volvió parte del paisaje y casi no se nota hasta que alguien la nombra.',
    'mas-de-un-ano':
      'Con más de un año de intervalo, la carta lee una tensión antigua, de esas que se sostienen por costumbre y no por urgencia.',
    generica: 'La carta lee una tensión que ya está instalada desde hace tiempo.',
  },

  /* Segunda mitad: el eje del contacto. Los dos estados del filtro duro
   * ('le-escribi-no-responde' y 'cero-contacto') describen la espera SIN
   * proponer nada — son ellos los que la guardia protege, y por eso no pueden
   * caer en ella. Redactados sin "escribir", sin "mensaje" y sin "esperar
   * respuesta", que son justo la forma que PATRONES_CONTACTO muerde. */
  contacto: {
    hablamos:
      'Y como todavía hay conversación, lo estirado no es el silencio, sino lo que no se nombra dentro de esa conversación.',
    'le-escribi-no-responde':
      'Y como ya hubo un intento tuyo sin retorno, la tensión vive hoy de este lado: quien la sostiene es la pausa, no un intercambio.',
    'cero-contacto':
      'Y como no hay contacto de ninguno de los dos lados, lo estirado es tuyo y solo tuyo: hoy no hay nadie del otro lado tirando del hilo.',
    'me-escribe-a-veces':
      'Y como los avisos aparecen sin patrón, la tensión se renueva sola cada vez y nunca llega a asentarse.',
    bloqueo:
      'Y como hay un bloqueo en medio, la carta lee una tensión sin salida hacia afuera: lo que se mueve, se mueve por dentro.',
    generica: 'Y el estado del contacto hoy cambia el peso de esa tensión más que cualquier otra cosa.',
  },

  /* --- POSICION 3: TU PUNTA — respuestas.intencion (P5) ----------------------- */
  preguntaExtremo: {
    'entender-que-paso': '¿Qué parte de esta historia entiendes hoy mejor que ayer?',
    'entender-mi-parte': '¿Qué hiciste que hoy harías distinto, sin convertirlo en culpa?',
    /* "en vez de quedarte a la espera de una señal" seria la frase natural aqui y
     * cae en la propia guardia (esperar + senal): la guardia no lee negacion, y
     * tampoco deberia. La pregunta se reescribe; la guardia no se afloja. */
    'decidir-insistir-o-soltar': '¿Qué necesitas saber sobre ti para decidir hoy, sin depender de ninguna señal de afuera?',
    'entender-que-diria': '¿Qué dirías si no tuvieras que cuidar la reacción de nadie?',
    'entender-para-cerrar': '¿Qué te falta entender para que este asunto deje de ocupar el primer lugar del día?',
    generica: '¿Qué parte de esto está de verdad en tus manos hoy?',
  },

  fraseExtremo: {
    'entender-que-paso':
      'La punta del hilo que sostienes hoy no es la explicación entera: es la parte de la historia que ya puedes contar sin que se te enrede la voz. Esa parte ya es tuya.',
    'entender-mi-parte':
      'La punta que sostienes hoy es tu parte, del tamaño real que tiene: ni toda la culpa, ni ninguna. Mirar esa parte entera es lo que la deja del tamaño de una sola persona.',
    'decidir-insistir-o-soltar':
      'La punta que sostienes hoy no es la decisión: es el material con el que se decide. Nadie decide bien con la mitad de los datos y la otra mitad imaginada.',
    'entender-que-diria':
      'La punta que sostienes hoy es tu voz: lo que dirías, entero, sin editar por miedo a la reacción de nadie. Esa versión existe aunque no llegue a ningún lado.',
    'entender-para-cerrar':
      'La punta que sostienes hoy es el espacio que este asunto ocupa en tu día. Ese espacio es tuyo y se mide sin permiso de nadie.',
    generica:
      'La punta que sostienes hoy es lo que está en tu mano: mirar, nombrar y decidir cuánto lugar darle a esto.',
  },

  /* --- SINTESIS --------------------------------------------------------------- */
  lecturaCierre: {
    pelea: 'Las tres se leen sobre una historia que se cortó de golpe: por eso el nudo tiene fecha y la tensión todavía suena a lo que se dijo.',
    distancia:
      'Las tres se leen sobre una historia que se fue soltando de a poco: por eso el nudo no tiene fecha exacta y la tensión parece más un vacío que un ruido.',
    ruptura:
      'Las tres se leen sobre una historia que se cerró con palabras: por eso el nudo está en lo que se dijo, y la tensión en todo lo que quedó debajo de eso.',
    'me-arrepenti':
      'Las tres se leen sobre una decisión que fue tuya: por eso el nudo cae de tu lado y tu punta pesa más que en cualquier otra tirada.',
    'nunca-empezo':
      'Las tres se leen sobre algo que no llegó a tener nombre: por eso el nudo está hecho de posibilidad y no de historia, y aprieta igual.',
    generica:
      'Las tres se leen juntas: el nudo donde apretó, la tensión que mantiene esto estirado y la punta que tienes en la mano.',
  },

  tuParte: {
    'entender-que-paso':
      'Lo que sostienes es la versión de los hechos que sí se puede revisar: la tuya. Esa se ordena sola, sin que nadie venga a confirmarla.',
    'entender-mi-parte':
      'Lo que sostienes es tu parte, y solo ella. La parte de quien está del otro lado no está en tu mano ni está en esta lectura.',
    'decidir-insistir-o-soltar':
      'Lo que sostienes es el criterio: con qué información decides y con cuál no. La decisión puede quedar para después; el criterio no.',
    'entender-que-diria':
      'Lo que sostienes son tus palabras. Existen enteras incluso sin ser dichas, y ordenarlas cambia el peso que el asunto tiene en tu día.',
    'entender-para-cerrar':
      'Lo que sostienes es el lugar que este asunto ocupa. Nadie más cambia ese lugar por ti, y por eso nadie más puede impedir que tú lo cambies.',
    generica:
      'Lo que sostienes es tu punta del hilo: lo que miras, lo que nombras y el lugar que le das a esto en el día.',
  },

  /* Bloque "UNA ACCION PARA HOY". Toda accion se completa sola: papel, voz,
   * cuenta. Ninguna depende de que alguien responda, aparezca o autorice.
   *
   * EL VERBO DE CADA ACCION ESQUIVA LA PROPIA GUARDIA, y en espanol eso es mas
   * estrecho que en portugues: "escribe" y "anota" estan FUERA — la raiz
   * 'escr[ií]b' cae en el patron de clitico y 'anota' no existe en la red, pero
   * el imperativo espanhol de apuntar que si pasa limpio es "apunta". Se usan
   * apunta / termina / haz / cuenta, medidos contra sugiereContacto(). */
  accion: {
    'entender-que-paso':
      'Apunta en una sola línea qué se rompió, con tus palabras y sin adorno. Una línea, y déjala donde nadie más la lea.',
    'entender-mi-parte':
      'Termina en voz alta, una sola vez, la frase que empieza por «en esto yo hice». Nadie necesita oírlo para que valga.',
    'decidir-insistir-o-soltar':
      'Haz dos listas en la misma hoja: lo que sabes y lo que estás suponiendo. No decidas hoy; hoy es solo separar una cosa de la otra.',
    'entender-que-diria':
      'Apunta lo que dirías, entero, en una hoja que se pueda romper después. La hoja no es para nadie: es para sacarte esto de la cabeza.',
    'entender-para-cerrar':
      'Cuenta cuántas veces este asunto apareció en tu cabeza desde que te despertaste y apunta el número sin corregirlo. Cerrar empieza por saber el tamaño real de lo que se cierra.',
    generica:
      'Apunta en una hoja la frase que hoy da vueltas y déjala ahí. Sacarla de la cabeza y ponerla en el papel ya es la acción.',
  },

  entrada: {
    nudo: {
      derecha: 'De pie en esta posición, la carta dice sin rodeos:',
      invertida: 'Cabeza abajo en esta posición, la carta cambia el acento:',
    },
    tension: {
      derecha: 'De pie, la carta señala por dónde afloja:',
      invertida: 'Invertida, la carta señala lo que está apretando demasiado:',
    },
    extremo: {
      derecha: 'De pie en tu punta, la carta devuelve esto:',
      invertida: 'Invertida en tu punta, la carta devuelve esto:',
    },
  },
});

export const ALTERNATIVAS = congelar({
  contacto: {
    generica:
      'Con el contacto como está hoy, esta lectura no pide ningún paso hacia afuera. Lo que queda por hacer se hace de este lado del hilo.',
    nudo: 'Aquí la carta no pide movimiento hacia afuera: pide mirar el nudo desde donde estás, que es el único lugar desde donde se puede mirar.',
    tension:
      'Con el contacto como está hoy, la carta no señala a nadie más. Sostener la tensión sin tirar más del hilo también es hacer algo.',
    extremo:
      'Tu punta del hilo no depende de que aparezca nadie más. Lo que hoy te toca se completa contigo, y por eso se puede completar.',
    accion: 'La acción de hoy no pasa por nadie más: pasa por ti, y termina cuando tú terminas.',
  },
  futuro: {
    generica: 'Esta carta no predice nada. Habla del lugar donde estás hoy.',
    extremo:
      'En tu punta, la carta no predice nada: habla de lo que tienes hoy en la mano y de lo que se puede mirar con eso.',
    accion: 'La acción de hoy se hace hoy y termina hoy. No necesita fecha para valer.',
  },
  aviso:
    'Con el contacto como está hoy, esta lectura no pide ningún paso hacia afuera. Quédate con la imagen de la carta: la acción del día es la que tú sostienes.',
});

/* El saludo de cuando el nombre no llegó. TRADUCIDO, y no dejado en portugues:
 * es la PRIMERA linea de la sintesis, la que abre la pantalla del climax del
 * embudo. Dejarla en portugues pondria una sola frase en otro idioma justo
 * arriba de todo el bloque traducido — el defecto exacto que
 * feedback-app-inteiro-no-mesmo-idioma nombra. Nunca interpolar vacio en
 * 'sintesis.saludo': quedaria ", esto es lo que...". */
export const SALUDO_SIN_NOMBRE = 'Esto es lo que quedó sobre la mesa.';

/* El encabezado de la enumeracion de las tres cartas en la sintesis. Vive aqui
 * y no en datos/textos.es.js por el mismo motivo que las tablas: lo monta el
 * motor, y el motor lee de aqui. */
export const SOBRE_LA_MESA = 'Sobre la mesa:';

export default TABLAS;
