// lib/traducoes/idadeReal.es.js
// PACK EN ESPAÑOL (neutro latinoamericano) para lib/idadeReal.js — misma forma
// que la fuente de verdad en portugués, entrada por entrada. El motor sigue
// canónico en PT; este archivo carga SOLO el texto que la persona lee,
// traducido por SENTIDO y no al pie de la letra.
//
// LAS REGLAS DE ESTE ARCHIVO (test/idadeReal.test.js barre todo):
//
//  (1) NINGUNA afirmación de salud: aliviar/calmar/sanar/curar/tratar/energizar
//      y parientes no entran, ni implícitos. Por eso "se trata de" nunca
//      aparece aquí — la conjugación chocaría con el barrido, y el barrido
//      tiene razón. Tampoco "bienestar": donde el PT dice "marketing de
//      bem-estar", aquí se lee "marketing de wellness".
//  (2) NINGUNA promesa, veredicto ni aviso defensivo. El catálogo fecha, cita y
//      devuelve la historia real; no se burla de quien creyó. Mismo tono de la
//      tesis (docs/tradicao/00-tese.md).
//  (3) LO QUE NUNCA SE TRADUCE: el locus (Tetrabiblos I.13, Astronomica
//      II.453–465), el título de obra (Le Monde primitif, The Lunation Cycle,
//      Sun Signs, Harmonice Mundi, Swiss Ephemeris), los números, las fechas y
//      el enlace cosmicguide.cloud. El nombre consagrado SÍ se traduce:
//      Ptolomeu → Ptolomeo, Manílio → Manilio, Vétio Valente → Vetio Valente,
//      Doroteu → Doroteo, Teosofia → Teosofía.
//  (4) EL TONO ESPEJA EL PT: ENGANCHA PRIMERO, FUENTE DESPUÉS. Todo `detalhe`
//      abre en la vida real — el titular, el carrusel, el feed — y el recibo
//      (obra, autor, año) llega en la segunda mitad. Los primeros 60 caracteres
//      no cargan año de cuatro dígitos ni la palabra "siglo".
//  (5) La palabra prohibida por docs/tradicao/06 §2 sigue prohibida en el
//      idioma, y "siglo" se escribe entero: la abreviatura "séc." no sobrevive.
//
// CONTRATO DE FORMA: `tela` tiene exactamente las claves de la pantalla en PT,
// con los mismos placeholders {n}/{total}/{ano}; `itens` tiene EXACTAMENTE los
// 30 ids del motor con los seis campos de texto; `temas`, `graus`, `formato` y
// `compartilhar` repiten la forma del PT.
export default {
  tela: {
    titulo: 'La edad real de cada cosa',
    subtitulo: 'Parece milenario × tiene acta de nacimiento',
    intro:
      'Treinta cosas que el mercado vende como antiguas, con el año en que apareció cada una. La lista abre por la más nueva.',
    ordenarPor: 'ORDENAR',
    ordemMaisNovo: 'La más nueva primero',
    ordemMaisAntigo: 'La más antigua primero',
    ordemTema: 'Por tema',
    rotuloQuem: 'QUIÉN LO INVENTÓ',
    rotuloQuando: 'CUÁNDO',
    recibo: 'RECIBO',
    abrir: 'Ver la historia',
    fechar: 'Cerrar',
    compartilhar: 'Compartir',
    copiado: 'Texto copiado — pégalo donde quieras.',
    naoCopiou: 'No se pudo copiar aquí — selecciona el texto y cópialo.',
    idadeAnos: '{n} años',
    idadeAnosAprox: 'cerca de {n} años',
    semData: 'sin fecha',
    semDataLonga: 'La investigación buscó al inventor y no lo encontró. Queda declarado.',
    comoContamos:
      'La edad aquí es cuenta, no tabla: {ano} menos el año que da la fuente. Por eso cambia sola cuando cambia el año.',
    progresso: 'Ya abriste {n} de {total}.',
    marca: 'cosmicguide.cloud',
  },

  formato: {
    separadorMilhar: '.',
  },

  temas: {
    zodiaco: 'El zodíaco',
    mapa: 'La carta',
    planetas: 'Los planetas',
    lua: 'La Luna',
    oraculos: 'Los oráculos',
    leitura: 'La forma de leer',
    mercado: 'El mercado',
  },

  graus: {
    FP: {
      nome: 'fuente primaria',
      glosa: 'el texto antiguo lo dice, y la investigación señala obra y capítulo',
    },
    TP: {
      nome: 'tradición posterior',
      glosa: 'surgió después del mundo antiguo, con autor y fecha conocidos',
    },
    IR: {
      nome: 'invención reciente',
      glosa: 'no tiene raíz antigua: nació en los siglos XIX, XX o XXI',
    },
    AM: {
      nome: 'academia moderna',
      glosa: 'es conclusión de investigación histórica, de los siglos XIX al XXI',
    },
  },

  compartilhar: {
    idade: 'Edad real:',
    pensam: 'Lo que se cree:',
    quem: 'Quién lo inventó:',
    recibo: 'Recibo:',
  },

  itens: {
    'zodiaco-12': {
      coisa: 'El zodíaco de doce signos de 30°',
      oQuePensam: 'Tiene 5.000 años y es lo más antiguo de la astrología.',
      quemInventou: 'los astrónomos de Babilonia',
      quando: 'c. 450–400 a.C.',
      fonte: 'Babilonia, c. 450–400 a.C.',
      detalhe:
        'Esta es la línea en que la respuesta honesta impresiona más que la cifra redonda. Los babilonios cambiaron las constelaciones, que tienen tamaños muy distintos, por doce rebanadas iguales de 30° en la eclíptica — la franja del cielo por donde el Sol parece caminar. Sin esa grilla no existe decir "Marte en Géminis" como coordenada, y sobre ella corre la astrología entera hasta hoy.',
    },
    'homem-zodiacal': {
      coisa: 'El Hombre Zodiacal, que le da a cada signo una parte del cuerpo',
      oQuePensam: 'Está en el Tetrabiblos, es lista de Ptolomeo.',
      quemInventou: 'Manilio, en el poema Astronomica',
      quando: 'siglo I d.C.',
      fonte: 'Manilio, Astronomica II.453–465, siglo I; corroborado por Vetio Valente',
      detalhe:
        'La lista que reparte el cuerpo entre los doce signos no está donde todo el mundo jura que está. Ptolomeo enumera la correspondencia de los planetas; quien escribe la de los signos es Manilio, en un poema en verso. Y ahí Leo no se queda con el corazón — se queda con los flancos y los omóplatos.',
    },

    'mapa-natal': {
      coisa: 'La carta natal con Ascendente y casas',
      oQuePensam: 'Los babilonios ya leían cartas natales hace 5.000 años.',
      quemInventou: 'autores griegos de Alejandría, bajo los seudónimos Nechepso y Petosiris',
      quando: 'c. 150–120 a.C.',
      fonte: 'Corpus de Nechepso y Petosiris, c. 150–120 a.C.; primera colección de los fragmentos: Riess, 1892',
      detalhe:
        'Lo más sabroso de esta línea es el comienzo: la astrología occidental debuta con una antigüedad inventada. Los textos que fundan la carta natal circulan firmados por un faraón y un sacerdote egipcios, y los dos son seudónimos de griegos que escribían en ese momento en Alejandría. Darle pedigrí antiguo a algo nuevo no corrompió la tradición después: está ahí desde su primer día.',
    },
    'aspectos-maiores': {
      coisa: 'Los cinco aspectos mayores',
      oQuePensam: 'Geometría sagrada de origen perdido en el tiempo.',
      quemInventou: 'la tradición helenística; sistematizados por Ptolomeo',
      quando: 'c. 150–120 a.C.; sistematización en el siglo II',
      fonte: 'Ptolomeo, Tetrabiblos I.13, siglo II',
      detalhe:
        'Oposición, trígono, cuadratura y sextil no son dibujo de mago: Ptolomeo saca los ángulos de proporciones musicales aplicadas al medio círculo. Y su criterio para "combina" no es el elemento, es el género del signo — la versión "fuego con aire" es resumen de segunda mano. La conjunción, para él, ni entra en la lista.',
    },
    'casas-inteiras': {
      coisa: 'Las Casas Enteras, una casa por signo',
      oQuePensam: 'Moda de redes sociales, invención de ahora.',
      quemInventou: 'es el método original de la astrología helenística',
      quando: 'c. 150–120 a.C.',
      fonte: 'Método helenístico original; Holden, 1982 · Hand, 2000/2007 · Brennan, 2017',
      detalhe:
        'Cada tanto alguien llama a las Casas Enteras moda pasajera, y es al revés: con ese método empezó la astrología de casas, cada casa ocupando un signo entero, sin cortar grados por la mitad. Holden publicó sobre eso en 1982, Hand en 2000 y Brennan en 2017 — y en la India el sistema nunca dejó de usarse. Lo moderno aquí es el nombre en inglés.',
    },
    horaria: {
      coisa: 'La astrología horaria, la pregunta que se vuelve carta',
      oQuePensam: 'Técnica griega antigua, de los primeros astrólogos.',
      quemInventou: 'astrólogos del mundo islámico',
      quando: 'siglo IX',
      fonte: 'Mundo islámico, siglo IX; heredada por Lilly, 1647',
      detalhe:
        'Hacer la pregunta en voz alta y levantar la carta del minuto de la pregunta es de lo más ingenioso del oficio — y no es griego. La rama madura en el mundo islámico, y de ahí hereda Lilly lo que sería el corazón de la tradición inglesa. Aquel cliché de que los árabes "solo preservaron" no se sostiene: ellos desarrollaron.',
    },
    'partes-arabes': {
      coisa: 'Las "partes árabes", como la Parte de la Fortuna',
      oQuePensam: 'Invención árabe medieval, de punta a punta.',
      quemInventou: 'el nombre es del mundo islámico; el concepto de lote es helenístico',
      quando: 'siglo IX el nombre; c. 150–120 a.C. el concepto',
      fonte: 'Mundo islámico, siglo IX; concepto de lote: tradición helenística',
      detalhe:
        'El nombre entrega un origen, y el origen está por la mitad. Los lotes — puntos que se calculan por arco, sin ningún astro ocupando ese lugar del cielo — ya están en la astrología griega; lo que hicieron los árabes fue multiplicarlos. Ptolomeo, por cierto, era de los que podaban: los descarta casi todos.',
    },
    'aspectos-menores': {
      coisa: 'Los aspectos menores: quintil, semicuadratura, sesquicuadratura',
      oQuePensam: 'Refinamiento antiguo, para lectura avanzada.',
      quemInventou: 'Johannes Kepler',
      quando: '1619',
      fonte: 'Kepler, Harmonice Mundi, Libro IV, 1619',
      detalhe:
        'Quien inventó los ángulos "extra" de la carta fue el mismo hombre que descubrió cómo se mueven los planetas. Kepler los sacó de razones armónicas, en el mismo libro donde trabajaba la música de las órbitas — y para él astronomía y astrología reformada no peleaban. Ptolomeo reconoce cinco figuras y da razón de que solo esas existan.',
    },
    placidus: {
      coisa: 'El sistema de casas Placidus',
      oQuePensam: 'Es el sistema tradicional, el de Ptolomeo.',
      quemInventou: 'publicado por Placidus de Titis; el Swiss Ephemeris acredita la invención a Magini',
      quando: '1650',
      fonte: 'Placidus de Titis, 1650; atribución de invención a Magini (1555–1617), vía Swiss Ephemeris',
      detalhe:
        'Es el estándar que usa casi todo sitio, y por eso parece el más antiguo de todos — es de los más nuevos de esta lista. Salió impreso en 1650, y el Swiss Ephemeris, la biblioteca de cálculo que corre por debajo de casi todo software de astrología, acredita la invención a Magini, un siglo antes. El Tetrabiblos, que suele llevarse la fama, no describe ningún sistema de casas.',
    },

    'urano-aquario': {
      coisa: 'Urano como regente de Acuario',
      oQuePensam: 'Regencia clásica, de toda la vida.',
      quemInventou: 'Smith y Varley, después del descubrimiento del planeta en 1781',
      quando: '1825–1828',
      fonte: 'Ptolomeo, Tetrabiblos I.17, siglo II; atribución a Urano: Smith, 1825 · Varley, 1828',
      detalhe:
        'Un planeta que nadie había visto no podía regir nada, y Urano recién apareció en un telescopio en 1781. Quien manda en Acuario, en la tradición, es Saturno — el signo es su domicilio, y domicilio quiere decir el lugar donde el planeta está en su propia casa. El cambio aparece hacia 1825 y todavía se discutía en los almanaques de 1834.',
    },
    'saturno-mestre': {
      coisa: 'Saturno, el gran maestro y profesor de la carta',
      oQuePensam: 'Lectura antigua, el planeta de las lecciones de siempre.',
      quemInventou: 'Liz Greene',
      quando: '1976',
      fonte: 'Liz Greene, 1976; contrapunto antiguo: Vetio Valente, Antologías, siglo II',
      detalhe:
        'Todo posteo sobre retorno de Saturno trae un profesor severo, y ese profesor tiene menos edad que muchos padres de familia. En los autores antiguos él es el maléfico mayor, y lo que cambia la lectura es la secta — si la persona nació de día o de noche. La figura del maestro que hace madurar la publicó Liz Greene en 1976.',
    },
    'mercurio-retrogrado': {
      coisa: '"Mercurio retrógrado rompe aparatos y tumba contratos"',
      oQuePensam: 'Regla antigua, avisada por los astrólogos hace siglos.',
      quemInventou: 'sin autor identificado — la investigación buscó y no encontró',
      quando: 'siglos XX y XXI, sin fecha exacta',
      fonte: 'Sin fuente antigua; lo que dice Valente: Antologías, siglo II. Rastreo de prensa: 1996',
      detalhe:
        'El chivo expiatorio más popular del calendario no tiene acta de nacimiento. La investigación fue a buscar al inventor de la regla y volvió con las manos vacías: circula como folclore de internet, y antes de 1996 ni los diarios hablaban de eso. Y lo que Valente escribe en el siglo II es demora y nada más: para él el retrógrado "posterga expectativas, acciones y ganancias".',
    },

    superlua: {
      coisa: 'La Superluna',
      oQuePensam: 'Fenómeno astronómico clásico, con nombre antiguo y todo.',
      quemInventou: 'Richard Nolle, astrólogo',
      quando: '1979',
      fonte: 'Richard Nolle, revista Dell Horoscope, 1979',
      detalhe:
        'El titular anuncia una luna gigante y uno sale a la calle a ver una luna igualita a la de ayer. Ni de la astronomía es el nombre: quien acuñó "superluna" fue un astrólogo, en una revista de horóscopos, y el término técnico es perigeo-sicigia — luna llena en el punto de la órbita más cercano a la Tierra. Recién se volvió titular en serio a partir de 2011.',
    },
    'oito-fases': {
      coisa: 'Las ocho fases de la Luna y lo que significa cada una',
      oQuePensam: 'Ciclo lunar milenario, una lección por fase.',
      quemInventou: 'Dane Rudhyar',
      quando: '1936',
      fonte: 'Dane Rudhyar, The Astrology of Personality, 1936; The Lunation Cycle, 1967',
      detalhe:
        'El carrusel de las ocho fases circula como si fuera cosa de la abuela, y es más nuevo que su heladera. Quien armó los ocho tipos, con lectura de personalidad en cada uno, fue Dane Rudhyar. Antes de eso la división era otra: Ptolomeo trabaja con cuatro cuartos y habla de cualidades — caliente, frío, seco, húmedo —, nunca de temperamento.',
    },
    'luas-cheias-nomes': {
      coisa: 'Los nombres de las lunas llenas: Luna del Lobo, Luna de la Fresa',
      oQuePensam: 'Nombres de pueblos originarios, pasados de generación en generación.',
      quemInventou: "Maine Farmers' Almanac, un almanaque agrícola estadounidense",
      quando: 'década de 1930',
      fonte: "Maine Farmers' Almanac, década de 1930; lista impresa más antigua verificada: Beard, 1918",
      detalhe:
        'Cada mes el feed anuncia un nombre nuevo para la luna llena, y el nombre nunca combina con el patio de acá. La lista salió de un almanaque de granjeros del noreste de Estados Unidos y describe el calendario agrícola de allá, lo que explica que la "Luna de la Nieve" caiga en pleno verano del sur. La impresa más antigua que halló la investigación es de 1918, hecha para los Boy Scouts, y ni siquiera es la famosa.',
    },
    'lua-de-sangue': {
      coisa: 'La "Luna de Sangre"',
      oQuePensam: 'Término bíblico antiguo para el eclipse lunar.',
      quemInventou: 'el pastor Mark Biltz; popularizado por el libro de John Hagee',
      quando: '2008; el libro en 2013',
      fonte: 'Mark Biltz, 2008 · John Hagee, Four Blood Moons, 2013',
      detalhe:
        'De todo lo que suena bíblico en esta lista, este nombre es más nuevo que el primer iPhone. Quien empezó a llamar así al eclipse lunar fue un pastor de Estados Unidos, y la idea se volvió libro popular cinco años después. La imagen está en Joel 2:31, eso es cierto — lo que no está ahí es el nombre del fenómeno, y ningún astrónomo lo usa.',
    },

    'taro-divinatorio': {
      coisa: 'El tarot como sistema de adivinación',
      oQuePensam: 'Libro sagrado de Egipto, guardado por los sacerdotes.',
      quemInventou: 'Antoine Court de Gébelin',
      quando: '1781',
      fonte: 'Court de Gébelin, Le Monde primitif, vol. 8, "Du Jeu des Tarots", 1781',
      detalhe:
        'Ese mazo estuvo en mesas de juego con dinero de por medio mucho antes de volverse oráculo, y todavía hoy se juega tarocco en Italia. El giro tiene capítulo y año: un erudito francés publicó la tesis egipcia en 1781, y el primer método de lectura salió dos años después. Da seis siglos de imagen y dos y medio de lectura.',
    },
    'rider-waite': {
      coisa: 'El mazo Rider-Waite-Smith como "el tarot tradicional"',
      oQuePensam: 'Es el dibujo de siempre, el mazo original.',
      quemInventou: 'Pamela Colman Smith lo dibujó; A. E. Waite lo dirigió',
      quando: '1909–1911',
      fonte: 'Rider-Waite-Smith, diciembre de 1909; A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'Es el mazo que aparece en toda foto de tarot, y justamente por eso parece el más antiguo. Las 78 imágenes son de Pamela Colman Smith y salieron en diciembre de 1909, con el libro al año siguiente. Llamar tradicional a ese mazo borra unos 470 años de tarot que vinieron antes que él.',
    },
    'simbolos-borra-cafe': {
      coisa: 'El diccionario de símbolos de la borra de café',
      oQuePensam: 'Tradición turca milenaria, símbolo por símbolo.',
      quemInventou: '"A Highland Seer" y Cicely Kent; quien repartió la taza no fue identificado',
      quando: '1881–1922',
      fonte: 'Tea-Cup Reading and Fortune-Telling by Tea Leaves, "A Highland Seer", 1881 · Cicely Kent, 1922',
      detalhe:
        'Pájaro es noticia, ancla es firmeza, anillo es unión: esa tabla entera tiene dirección, y la dirección es Gran Bretaña. Se imprimió como juego de sala de visitas entre 1881 y 1922, en el ambiente del té de la tarde. La división de la taza en asa, borde y fondo, en cambio, la investigación buscó y no encontró quién la codificó: queda declarado.',
    },

    'signo-personalidade': {
      coisa: '"Tu signo es X, entonces eres así"',
      oQuePensam: 'Los antiguos ya describían las doce personalidades.',
      quemInventou: 'Alan Leo',
      quando: 'c. 1895–1910',
      fonte: 'Alan Leo, c. 1895–1910',
      detalhe:
        'Ese cuadrito de "cómo actúa cada signo en una pelea" tiene menos edad que el cine sonoro. El formato de retrato por signo es del inglés Alan Leo, en la vuelta al siglo XX, y fue él quien puso al Sol en el centro de todo. Para Ptolomeo, quien describe el carácter son Mercurio y la Luna — y no existe un capítulo de las doce personalidades.',
    },
    'retratos-goodman': {
      coisa: 'Los retratos de signo que circulan hoy',
      oQuePensam: 'Descripción de siempre, heredada de los griegos.',
      quemInventou: 'Linda Goodman',
      quando: '1968',
      fonte: 'Linda Goodman, Sun Signs, 1968',
      detalhe:
        'El texto que reconoces de tu signo — la forma de amar, de pelear, de trabajar — salió casi todo de un libro de quiosco. Linda Goodman publicó Sun Signs en 1968 y fijó el vocabulario que el mercado repite hasta ahora. Valente, en el siglo II, también describe signo por signo, y su retrato es irreconocible para quien lee horóscopos hoy.',
    },
    'potencial-psicologico': {
      coisa: 'La carta como retrato del potencial de cada quien',
      oQuePensam: 'La astrología siempre fue herramienta de autoconocimiento.',
      quemInventou: 'Dane Rudhyar',
      quando: '1936',
      fonte: 'Dane Rudhyar, The Astrology of Personality, 1936',
      detalhe:
        'La idea de que la carta muestra quién puedes llegar a ser, y no lo que te va a pasar, es el marco que usa esta app. Tiene autor y año: Dane Rudhyar reescribió el vocabulario entero de la astrología en 1936, trayendo a Jung adentro. La astrología antigua era otra cosa — predecía eventos, en un cuadro fatalista.',
    },
    'nao-e-previsao': {
      coisa: '"No es predicción, son tendencias"',
      oQuePensam: 'La salvedad elegante y antigua de la astrología.',
      quemInventou: 'Alan Leo, en la defensa de los procesos por adivinación',
      quando: '1914 y 1917',
      fonte: 'Procesos de Alan Leo, Londres, 1914 y 1917',
      detalhe:
        'Esa frase está en la boca de toda app de astrología, incluida esta. Nació en un tribunal de Londres: Alan Leo respondía por adivinación, y la defensa sostenía que aquello era descripción de tendencia, no lectura de fortuna. La fiscalía leyó en el juicio una línea donde su almanaque predecía una muerte en la familia; fue condenado en 1917, y la salvedad quedó como herencia del mercado entero.',
    },
    'karma-mapa': {
      coisa: 'Karma y vidas pasadas en la carta',
      oQuePensam: 'Capa antigua de la astrología, heredada de Oriente.',
      quemInventou: 'la Sociedad Teosófica y sus herederos',
      quando: 'a partir de 1875',
      fonte: 'Teosofía, 1875 en adelante',
      detalhe:
        'Cuando alguien dice que "viniste a pagar algo", el vocabulario es bastante más nuevo que la astrología. Karma, deuda y vidas pasadas no están en Ptolomeo, en Valente, en Fírmico, en Bonatti ni en Lilly. Entran en Occidente por la Teosofía, una sociedad fundada en 1875, que trajo vocabulario indio adentro de la carta.',
    },
    'nodos-missao': {
      coisa: 'El Nodo Norte como "misión del alma"',
      oQuePensam: 'Sabiduría védica antigua sobre el propósito de vida.',
      quemInventou: 'la capa teosófica; el formato popular es de Martin Schulman',
      quando: 'a partir de 1875; Schulman, 1975',
      fonte: 'Teosofía, 1875 en adelante · Martin Schulman, Karmic Astrology, 1975',
      detalhe:
        'Si alguien ya te leyó la misión de vida señalando un punto de la carta, ese punto tiene etiqueta nueva. El jyotish, que es la astrología india, no lee a Rahu y Ketu como indicadores de karma personal — así que el rótulo "védico" no se sostiene. La lectura llega por la Teosofía y se vuelve libro en 1975, con Martin Schulman.',
    },
    'astrologia-tradicional': {
      coisa: 'La "astrología tradicional" que se enseña hoy',
      oQuePensam: 'Es la astrología antigua directo de la fuente, sin intermediario.',
      quemInventou: 'Project Hindsight — Robert Schmidt, Ellen Black, Robert Zoller y Robert Hand',
      quando: '1992–93',
      fonte: 'Project Hindsight, 1992–93',
      detalhe:
        'Lo que hoy se vende como "astrología tradicional" es más nuevo que mucha gente que está leyendo esto. Es una reconstrucción: a partir de 1992 un grupo de traductores empezó a pasar al inglés textos griegos que nadie había traducido, y rearmó el sistema desde ahí. Donde faltó texto entró interpretación, y hay disputa abierta entre los propios reconstructores.',
    },

    'horoscopo-jornal': {
      coisa: 'El horóscopo diario por signo',
      oQuePensam: 'Es el formato clásico de la astrología, de siempre.',
      quemInventou: 'R. H. Naylor, en el diario Sunday Express',
      quando: '24 de agosto de 1930',
      fonte: 'R. H. Naylor, Sunday Express, 24/08/1930',
      detalhe:
        'Se puede marcar en el calendario el día en que nació el horóscopo de tu feed: un domingo de agosto, en un diario de Londres, por una princesa recién nacida. Funcionó tan bien que se volvió sección fija, y el formato de doce cajitas vino de la falta de espacio en la página. La parte antigua de la astrología es otra — la carta entera, con hora y lugar.',
    },
    'porcentagem-compatibilidade': {
      coisa: 'El porcentaje de compatibilidad entre signos',
      oQuePensam: 'Es cálculo tradicional, sacado de libro antiguo.',
      quemInventou: 'sin autor identificado — la investigación buscó y no encontró',
      quando: 'siglo XX, sin fecha exacta',
      fonte: 'Sin fuente antigua; la escala que sí existe: Ptolomeo, Tetrabiblos IV.7, siglo II',
      detalhe:
        'Esta es una de las líneas que la investigación no logró fechar, y la ausencia ya es la respuesta. Número de compatibilidad no existe en fuente occidental antigua, medieval ni renacentista: barrieron a Ptolomeo, a Doroteo, a Māshāʾallāh y a Lilly y no hallaron ninguno. Lo que tiene la tradición es una escala de cuatro escalones, y ahí un tercio de los pares queda afuera — son signos que ni se ven.',
    },
    'frequencias-hz': {
      coisa: 'La frecuencia en Hz de cada signo',
      oQuePensam: 'Correspondencia antigua entre el sonido y el cielo.',
      quemInventou: 'sin autor identificado — vocabulario del marketing de wellness',
      quando: 'siglos XX y XXI, sin fecha exacta',
      fonte: 'Sin fuente antigua; piedra y planta por signo, esas sí tienen: Culpeper, 1653',
      detalhe:
        'No se puede fechar a quien juntó signo y número de hertz, porque no hay autor: la investigación buscó y no encontró. Los números que circulan — 528, 432, 639 — vienen de las llamadas frecuencias solfeggio, que son del siglo XX y no aparecen en ninguna fuente antigua. Piedra y planta por signo, esas sí tienen tradición fechable, y es de Culpeper, 1653.',
    },
    'app-astrologia': {
      coisa: 'La app de astrología como categoría',
      oQuePensam: 'Parece que siempre existió; uno ya nace con una en el bolsillo.',
      quemInventou: 'Co-Star, en Nueva York',
      quando: '2017',
      fonte: 'Co-Star, Nueva York, 2017; The Pattern y Sanctuary, 2017–2019',
      detalhe:
        'La cosa más nueva de esta lista es justamente la que tienes en la mano. El género "app de astrología" nació en 2017, con Co-Star en Nueva York, y tomó cuerpo con The Pattern y Sanctuary poco después. Ninguna tradición antigua tiene regla para una lectura entregada por sistema, sin persona en el circuito: la ética de eso es toda contemporánea, incluida la de esta app.',
    },
  },
};
