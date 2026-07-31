// lib/traducoes/wallpaper.es.js
// PACK EN ESPAÑOL (neutro latinoamericano) del PAPEL TAPIZ DEL CIELO —
// lib/wallpaper.js. Traduce las dos capas de texto de la feature: las frases
// que van DENTRO del dibujo (pantalla de bloqueo) y el chrome de la pantalla
// que lo entrega (screens/WallpaperScreen.js).
//
// EL DIBUJO NO CAMBIA DE IDIOMA. Gradiente, glifo, disco de iluminación y la
// elección determinista por día (hash FNV-1a del YYYY-MM-DD) son idénticos en
// los tres idiomas: el mismo día cae en la MISMA posición del pool. Por eso
// cada pool de aquí tiene exactamente la misma cantidad de frases que el PT —
// si sobra o falta una, el índice del día apunta a otra frase y el papel tapiz
// deja de ser "el mismo cielo en otro idioma".
//
// LO QUE NUNCA SE TRADUCE:
//   · las CLAVES de `frases`, `fases`, `signos` y `planetas` — son los nombres
//     canónicos de lib/lunarCalendar.js y lib/signs.js, la junta con el
//     cálculo real;
//   · la marca cosmicguide.cloud y el enlace, iguales en los tres idiomas;
//   · los números: 1080 × 1920 es la medida del archivo, no una figura de
//     estilo; y el siglo de Plinio es siglo I en cualquier idioma.
//
// LA LÍNEA ROJA, en español: nada de aliviar, calmar, sanar, curar, tratar ni
// energizar. Ninguna promesa de resultado, ningún veredicto, ningún mecanismo
// pseudocientífico (energía, vibración, aura), ninguna prueba social. Una
// frase de pantalla de bloqueo INVITA a hacer algo hoy — nunca anuncia lo que
// el universo va a devolver.
//
// EL RECIBO EN LA PROPIA FRASE: las tres frases que afirman algo histórico
// traen autor y siglo adentro (Plinio, siglo I), igual que el PT. Es la única
// forma de afirmar algo en una tela donde no cabe una nota al pie.
export default {
  // ---------------------------------------------------------------------
  // 1. LAS FRASES DEL DIBUJO — claves = nombres canónicos de fase
  // ---------------------------------------------------------------------
  frases: {
    'Lua Nova': [
      'Cielo oscuro, mes en cero. ¿Qué quieres dejar nacer antes de que la Luna se llene?',
      'Hoy nadie ve la Luna. Buen día para dar, en silencio, el primer paso de algo.',
      'Punto cero del ciclo. Anota una sola cosa: la que quieres llevar este mes.',
    ],
    'Lua Crescente': [
      'La luz está volviendo. Lo que empezaste merece diez minutos hoy.',
      'Luna finita en el cielo: un paso pequeño también es un paso. Da el de hoy.',
      'La Luna crece un poco cada noche. Hay algo tuyo que puede ir al mismo ritmo.',
    ],
    'Quarto Crescente': [
      'Mitad de la luz: primera encrucijada del mes. ¿El plan sigue siendo el mismo?',
      'Media Luna en el cielo. Buen momento para revisar la ruta antes de seguir.',
      'La semana pide foco en un solo punto. ¿Cuál?',
    ],
    'Lua Gibosa Crescente': [
      'Casi llena. Falta poco: ajusta el detalle, no empieces de nuevo desde cero.',
      'Más de media Luna encendida — eso es lo que dice «gibosa». Termina lo que está a un paso del final.',
      'Antes del pico, el retoque. ¿Qué se puede pulir hoy?',
    ],
    'Lua Cheia': [
      'Pico de luz del mes. Mira lo que ya venía dibujándose en tu vida.',
      'Cielo claro toda la noche. Buen momento para ver el conjunto, no el detalle.',
      'Dicen que la Luna Llena es día de cosecha. La fuente romana ponía la cosecha en la menguante (Plinio, siglo I).',
    ],
    'Lua Gibosa Minguante': [
      'La luz empezó a ceder. Pásale a alguien una cosa que aprendiste en el mes.',
      'Era ahora cuando el campo romano cosechaba para guardar (Plinio, siglo I). ¿Qué guardas de este mes?',
      'Después del pico, lo compartido. Cuéntale a alguien lo que salió bien.',
    ],
    'Quarto Minguante': [
      'Mitad de la luz, cayendo. ¿Qué sale de tu lista hoy?',
      'Una cosa menos hoy: un compromiso, una pestaña abierta, un peso en la mochila.',
      'En menguante, el campo romano cortaba y desmalezaba (Plinio, siglo I). Corta una cosa hoy.',
    ],
    'Lua Minguante': [
      'Últimos días del ciclo. Menos ruido, más silencio — el mes nuevo ya viene.',
      'La Luna está desapareciendo del cielo. Buen momento de recuento: ¿qué se queda, qué se va?',
      'Fin de ciclo es inventario. Una línea en el diario ya cuenta.',
    ],
  },

  // Sin efeméride: la frase DICE que el cielo no se calculó, en vez de fingir.
  // Ninguna de las tres nombra fase ni signo — nombrarlos sería exactamente el
  // cielo inventado que esta rama existe para evitar.
  frasesSemCeu: [
    'El cielo de hoy no se pudo calcular — y el cielo no se inventa. Queda la invitación: un minuto lejos de la pantalla.',
    'Sin efeméride ahora. En lugar de un cielo inventado, una pregunta: ¿qué vienes postergando desde ayer?',
    'Hoy la app no alcanzó el cielo. El día sigue siendo tuyo: elige una cosa para terminar.',
  ],

  // Defensa contra el futuro: fase con nombre desconocido, pero cielo SÍ
  // calculado. No afirma nada.
  frasesGenericas: [
    'Levanta la vista de la pantalla hoy a la noche: el cielo de verdad sigue ahí arriba.',
  ],

  // ---------------------------------------------------------------------
  // 2. NOMBRES PARA MOSTRAR — claves canónicas, valores traducidos
  // ---------------------------------------------------------------------
  // Estos ocho tienen que coincidir carácter por carácter con lo que
  // lib/lunarCalendar.js devuelve en español: una sola fuente de verdad para
  // el nombre de la fase en toda la app (el test lo compara).
  fases: {
    'Lua Nova': 'Luna Nueva',
    'Lua Crescente': 'Luna Creciente',
    'Quarto Crescente': 'Cuarto Creciente',
    'Lua Gibosa Crescente': 'Luna Gibosa Creciente',
    'Lua Cheia': 'Luna Llena',
    'Lua Gibosa Minguante': 'Luna Gibosa Menguante',
    'Quarto Minguante': 'Cuarto Menguante',
    'Lua Minguante': 'Luna Menguante',
  },
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
  // Los siete regentes de la semana (orden caldeo) — el único planeta que el
  // dibujo llega a nombrar, en la rama sin efeméride.
  planetas: {
    // Los dos luminares llevan artículo: el dibujo imprime "HOY RIGE ___", y
    // "DÍA DE SOL" se leería como día soleado, no como día regido por el Sol.
    'Sol': 'el Sol',
    'Lua': 'la Luna',
    'Marte': 'Marte',
    'Mercúrio': 'Mercurio',
    'Júpiter': 'Júpiter',
    'Vênus': 'Venus',
    'Saturno': 'Saturno',
  },

  // ---------------------------------------------------------------------
  // 3. FECHA EN LETRAS — sin Intl, igual que el PT
  // ---------------------------------------------------------------------
  // Índice 0 = domingo (Date.getDay()) y 0 = enero (Date.getMonth()). Sin año:
  // el papel tapiz se queda semanas en la pantalla y el año solo lo
  // envejecería.
  diasSemana: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  meses: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ],
  dataLonga: '{diaSemana}, {dia} de {mes}',

  // ---------------------------------------------------------------------
  // 4. EL CHROME DE LA PANTALLA (screens/WallpaperScreen.js)
  // ---------------------------------------------------------------------
  // `titulo` y `subtitulo` son los MISMOS de la tarjeta de la Home en
  // lib/i18n.js ('home.card.wallpaper.*'): la feature tiene un solo nombre
  // visible por idioma, y el test lo cobra.
  tela: {
    titulo: 'Fondo de pantalla',
    subtitulo: 'El cielo de hoy en tu pantalla',
    baixar: 'DESCARGAR FONDO DE PANTALLA',
    baixado: 'Descargado. Ahora solo falta ponerlo como fondo de pantalla en la configuración del celular.',
    falhou: 'No se pudo generar la imagen ahora. Prueba de nuevo.',
    tamanho: '1080 × 1920 — entra en cualquier pantalla de celular.',
    amanha: 'Mañana el cielo cambia — y el dibujo cambia con él. Vuelve por acá.',
    soWeb: 'Descargar la imagen es de la versión web por ahora. Abre cosmicguide.cloud en el navegador del celular y aparece el botón.',
    semCeu: 'La posición de la Luna no se pudo calcular ahora — el dibujo de hoy es neutro y lo dice en la propia frase.',
    luaEm: 'LUNA EN',
    // "HOY RIGE" y no "DÍA DE": es la palabra técnica del regente del día y
    // resuelve el artículo — "HOY RIGE EL SOL", "HOY RIGE LA LUNA".
    diaDe: 'HOY RIGE',
    iluminada: 'iluminada',
  },
};
