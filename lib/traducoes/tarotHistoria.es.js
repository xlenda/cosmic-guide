// lib/traducoes/tarotHistoria.es.js
// EL PACK ESPAÑOL de la historia del tarot. Misma FORMA que
// lib/traducoes/tarotHistoria.pt.js: mismas claves, mismos campos, funciones
// con la misma firma. El motor vive en lib/tarotHistoria.js.
//
// LAS REGLAS, IDÉNTICAS A LAS DEL PACK PT:
// 1. ENGANCHA PRIMERO, FUENTE DESPUÉS. Todo `texto` abre en la vida real y
//    cierra con el recibo. Los primeros 70 caracteres no llevan año de cuatro
//    cifras. El test lo reprueba.
// 2. NINGUNA AFIRMACIÓN SOBRE EL CUERPO, ninguna promesa, ningún veredicto
//    sobre quien cree en el mito, ninguna prueba social, ningún aviso defensivo.
// 3. DESMONTAR NO ES INSULTAR. Inventar antigüedad es un rasgo de la tradición,
//    no su corrupción — y quien repitió lo de Egipto lo escuchó de alguien que
//    quería. Al pueblo Rom se le nombra por su nombre.
// 4. LAS CITAS DE WAITE VAN EN INGLÉS, idénticas en los tres packs. Traducir
//    una cita es falsificarla.
// 5. EL TÍTULO DE LA OBRA NO SE TRADUCE. Le Monde primitif sigue siendo
//    Le Monde primitif. Autor y datación pasan por lib/traducoes/datacao.js.

const TELA = {
  titulo: 'La historia real de esta baraja',
  subtitulo: 'Del juego de corte italiano a la baraja que está en tu álbum',
  ctaLinhaDoTempo: 'Ver la línea del tiempo',
  rotuloRecibo: 'Recibo',
  rotuloFases: 'Cómo leer esta línea',
  rotuloNaoSeSustenta: 'Lo que se repite, y lo que muestra la fuente',
  rotuloOQueSeDiz: 'Lo que se dice',
  rotuloOQueAFonteMostra: 'Lo que muestra la fuente',
  rotuloParalelo: 'Y hay algo que nadie cuenta',
  rotuloFontes: 'Dónde verificarlo',
  rotuloNoAlbum: 'Esto aparece en tu álbum',
};

const FASES = {
  jogo: 'Cuando solo era un juego',
  leitura: 'Cuando se volvieron oráculo',
  oculto: 'Cuando ganaron sistema',
  erudicao: 'Cuando alguien fue a verificarlo',
};

// Las siete fuentes que NO son obra con título: una baraja en un museo, un
// libro de cuentas, una hoja sin título, una piedra, una objeción, una tesis,
// un corpus. Su nombre es descripción, y la descripción se dice en la lengua
// de quien lee. El título de una obra sigue intacto en el motor.
const OBRAS = {
  baralhoMameluco: 'baraja mameluca (Topkapı Sarayı Müzesi, Estambul)',
  contasDeFerrara: 'libros de cuentas de las cortes de Ferrara y Florencia (carte da trionfi)',
  folhaBolonhesa: 'hoja manuscrita boloñesa, con significados de 35 cartas',
  pedraDeRoseta: 'la Piedra de Rosetta y el desciframiento del jeroglífico',
  objecaoMerlin: 'la objeción de Romain Merlin, retomada por Waite en el Pictorial Key',
  teseVaillant: 'la tesis del origen egipcio por vía del pueblo Rom',
  textosFundadores: 'los textos fundadores atribuidos a Nechepso y a Petosiris',
};

const AUTORES = {
  anonimo: 'sin autor conocido',
  escrivao: 'escribanos de corte',
  frade: 'un fraile anónimo',
  gravadorIncerto: 'grabador incierto (hipótesis: Nicola di Maestro Antonio)',
  smithEWaite: 'Pamela Colman Smith en el arte y A. E. Waite en la estructura',
  pseudonimos: 'seudónimos de autores griegos en Alejandría',
};

const ABERTURA = {
  chamada:
    'Alguien te dijo que una baraja no se compra, que tiene que ser un regalo. Alguien habló de Egipto, de faraones, de un secreto guardado por sacerdotes. Y lo guardaste sin discutir, como se guarda lo que uno escucha de quien quiere.',
  texto: (c) =>
    'Ahora viene lo raro: la historia de verdad es mejor que la que te contaron, y tiene dirección. ' +
    'Estas cartas nacieron como JUEGO. Juego de apuesta, mesa de corte italiana, triunfo que gana al palo — la misma idea del tute. ' +
    'Y no es pasado muerto: todavía se juega al tarot en Francia, al Königrufen en Austria y al tarocchini en Bolonia, con la misma baraja.' +
    '\n\n' +
    `La lectura de cartas tal como la conoces entra mucho después, y se puede señalar el volumen y la página. Son unos ${c.seculosDeImagem} siglos de imagen frente a ${c.anosDeLeitura} años de lectura — ` +
    'y cada peldaño de esa distancia tiene obra, autor y año, desde la primera baraja pintada a mano hasta la que está en tu álbum.' +
    '\n\n' +
    'Nada de esto le quita una línea a lo que sientes cuando sacas una carta. Solo cambia lo que respondes cuando te pregunten de dónde viene.',
};

const MARCOS = {
  'rheinfelden-1377': {
    titulo: 'Las cartas llegan a Europa — y ya vienen con sermón incluido',
    texto:
      'La primera vez que alguien en Europa describe una baraja por escrito, es un fraile quejándose de ella. ' +
      'Johannes von Rheinfelden, en Basilea, año 1377: cuatro palos, figuras, y una moraleja sobre el orden social colgada de cada carta. ' +
      'Fíjate en lo que NO está ahí: ningún triunfo, ninguna adivinación, ningún Egipto. Solo gente jugando, y un religioso molesto con eso.',
  },
  'mameluco-naipes': {
    titulo: 'Los cuatro palos vienen de Egipto. Solo ellos.',
    texto:
      'Aquí hay una ironía buena: sí existe un vínculo entre Egipto y la baraja, y es real — solo que no es el que te contaron. ' +
      'La baraja mameluca que sobrevivió casi entera está en Estambul, en el Topkapı, y trae cuatro palos: monedas, cimitarras, copas y bastones de polo. ' +
      'Las monedas se volvieron oros, las cimitarras espadas, los bastones bastos. O sea: de allí vinieron los 56 menores, los que coleccionas en los cuatro palos del álbum. Los 22 triunfos no estaban en esa baraja.',
  },
  'trionfi-ferrara': {
    titulo: 'La primera vez que aparece la palabra, es en un libro de cuentas',
    texto:
      'No es en un templo ni en la carpa de una adivina: es en la contabilidad de un duque al que le gustaba jugar. ' +
      'El escribano de la corte de Ferrara anota carte da trionfi — cartas de triunfo — en el libro de gastos, en 1442. ' +
      'Dos años antes, en Florencia, alguien registra el traspaso de dos barajas a Sigismondo Pandolfo Malatesta. Así entra el tarot en la historia escrita: como partida de gasto.',
  },
  'visconti-sforza': {
    titulo: 'Las más antiguas que quedan están pintadas a mano, con oro',
    texto:
      'Antes de la imprenta barata, una baraja era artículo de rico: pintada a mano, pan de oro, encargada por la familia que mandaba en Milán. ' +
      'Las Visconti-Sforza, de c. 1441–1451, son los tarots más antiguos que llegaron hasta hoy — y no son una sola baraja: son varias, todas incompletas, hoy repartidas entre Nueva York y Bérgamo. ' +
      'Parte de la pintura se atribuye a Bonifacio Bembo. Ninguna se hizo para adivinar nada.',
  },
  'sermao-steele': {
    titulo: 'Un fraile insulta a los jugadores y salva la lista de los 22',
    texto:
      'La lista más antigua de los 22 triunfos, en orden, llegó hasta nosotros porque un religioso estaba enfadado. ' +
      'En el sermón que los estudiosos llaman Sermón Steele, predica contra los dados y las cartas y, para mostrar el tamaño del problema, enumera uno por uno los triunfos del ludus triumphorum. ' +
      'Insultó, enumeró, y quedó de fuente. El orden que da es esencialmente el que usa tu álbum en los Arcanos Mayores. La fecha exacta nadie la fija: último tercio del siglo XV.',
  },
  'sola-busca': {
    titulo: 'La primera baraja completa con escena en todas las cartas',
    texto:
      'Fíjate en tu álbum: hasta las cartas numeradas tienen gente, paisaje, algo que ocurre. Eso es raro, y es reciente. ' +
      'La Sola Busca, grabada en metal hacia 1491, es la baraja de 78 más antigua que sobrevivió entera y la primera en la que cada carta de palo tiene escena, en vez del símbolo repetido. ' +
      'Guarda ese nombre: vuelve cuatro siglos después, en Londres.',
  },
  'palavra-taro': {
    titulo: 'La palabra "tarot" llega después del juego — y nadie sabe de dónde',
    texto:
      'Durante décadas el juego se llamó trionfi, triunfos, y nada más. ' +
      'La forma tarocho aparece en Ferrara en 1505 y taraux en Aviñón ese mismo año. De dónde salió la palabra, nadie lo sabe — y no es ignorancia nuestra: en 1550 el poeta ferrarés Alberto Lollio ya escribía que el origen del nombre era desconocido. ' +
      'Quien te ofrece una etimología egipcia te está ofreciendo algo que el siglo XVI ya había dado por perdido.',
  },
  'padroes-regionais': {
    titulo: 'No todo tarot tiene 78 cartas',
    texto:
      'Tu álbum tiene 78 casillas porque ese fue el estándar que ganó — no porque 78 sea un número sagrado. ' +
      'En la Florencia del siglo XVI se jugaba a la Minchiate, con 97 cartas, con los doce signos y los cuatro elementos entre los triunfos. En Bolonia eran 62. En Sicilia, 64. ' +
      'Cuando alguien saca un significado místico del número 78, está haciendo numerología sobre la decisión de un fabricante.',
  },
  'folha-bolonhesa': {
    titulo: 'La primera adivinación hallada es italiana, popular y sin misterio',
    texto:
      'Antes de cualquier ocultista francés, alguien en Bolonia escribió a mano, en una sola hoja, lo que quería decir cada carta: 35 de ellas, con una manera sencilla de disponerlas en la mesa. ' +
      'La hoja es anterior a 1750, la encontró en archivo el investigador Franco Pratesi, y allí el Loco significa "locura", sin ninguna capa secreta. ' +
      'No hay cartas invertidas en ella. Es el testimonio más antiguo que se conoce de cartomancia con tarot — y es gente común, no sacerdotes.',
  },
  etteilla: {
    titulo: 'El primer profesional de las cartas tenía método, tabla y precio',
    texto:
      'Hubo un tipo en París que firmó su nombre al revés — Alliette se volvió Etteilla — y convirtió la lectura de cartas en oficio. ' +
      'Fue él quien fijó un significado para cada carta, un significado para la carta al revés y una manera definida de disponerlas: empezó en 1770 con baraja común y en 1789 lanzó el Grand Etteilla, la primera baraja diseñada a propósito para adivinar. ' +
      'Toda carta invertida que hayas leído, en cualquier baraja del mundo, desciende de él.',
  },
  'volume-1781': {
    titulo: 'Egipto entra en la historia en un libro francés, sin un solo documento',
    texto:
      'Un clérigo erudito se topa con el tarot por casualidad en una reunión social en París, cree reconocer símbolos egipcios y escribe que aquello es lo que quedó del Libro de Thoth, salvado por los sacerdotes. ' +
      'No presenta ni un documento. Es Antoine Court de Gébelin, en el volumen VIII del Monde primitif, en 1781. En el mismo volumen, el Comte de Mellet ata los 22 triunfos a las 22 letras hebreas. ' +
      'Dos ensayos de un libro francés fundaron todo lo que hoy se vende como milenario.',
  },
  'levi-arvore': {
    titulo: 'El Árbol de la Vida se cuelga de las cartas',
    texto:
      'Un exseminarista francés que firmaba Éliphas Lévi toma la sugerencia de Mellet y monta el sistema entero: cada triunfo se vuelve una letra hebrea y un sendero del Árbol de la Vida cabalístico. ' +
      'Dogme et Rituel de la Haute Magie sale en dos volúmenes, 1854 y 1856, cada uno con 22 capítulos — la forma del libro imita la baraja. Papus lo populariza en 1889, con arcanos dibujados por Oswald Wirth. ' +
      'Ningún documento italiano de los siglos XV a XVII une triunfo con letra hebrea. Esa costura es del siglo XIX.',
  },
  'book-t': {
    titulo: 'La tabla astrológica que usa esta app nace en una orden de Londres',
    texto:
      'Cuando la app te dice que una carta es "Marte en Aries", eso no viene de Italia ni de Egipto. ' +
      'Viene de una orden iniciática inglesa de fines del siglo XIX, la Golden Dawn, en los documentos internos llamados Cipher Manuscripts y Book T: allí los 22 triunfos, los 36 decanatos de las cartas del 2 al 10 y las figuras de corte reciben cada uno su correspondencia. ' +
      'Israel Regardie publicó el material a partir de 1937. Hay al menos tres tablas rivales e incompatibles — esta app usa la de la Golden Dawn y lo dice en pantalla, en vez de escribir "la atribución astrológica" como si fuera una sola.',
  },
  'rider-waite-smith': {
    titulo: 'Sale la baraja que está en tu álbum — con fecha, ciudad y editorial',
    texto:
      'Las imágenes que coleccionas aquí no cayeron del cielo: Londres, diciembre de 1909, editorial William Rider & Son. ' +
      'Las 78 las dibujó Pamela Colman Smith, ilustradora, trabajando a partir de instrucciones de A. E. Waite — sin bocetos de él. Su nombre quedó fuera del título durante décadas, y por eso lo correcto es decir Rider-Waite-Smith. ' +
      'Para los 56 menores, Smith se apoyó en la Sola Busca: las fotografías de las 78 cartas de aquella baraja de 1491 entraron en el British Museum en 1907, dos años antes.',
  },
  'waite-desmente': {
    titulo: 'El autor de la baraja más vendida del mundo desmonta Egipto en su propio libro',
    texto:
      'Esta es la mejor parte, y casi nadie la cuenta: quien derribó el origen egipcio fue el propio autor de la baraja, en el libro que la acompaña. ' +
      'En 1911, Waite examina los diez argumentos de Court de Gébelin y escribe: "These, therefore, are ten pillars which support the edifice of the thesis, and the same are pillars of sand". ' +
      'Sobre la etimología, recuerda que se propuso antes de la Piedra de Rosetta, cuando nadie en el mundo sabía leer egipcio — la Piedra apareció en 1799 y Champollion solo descifró el jeroglífico en 1822. Y concluye: "there is no particle of evidence for the Egyptian origin of Tarot cards". ' +
      'Cuando esta app dice que el tarot no viene de Egipto, no está siendo escéptica con la tradición: está del lado de Waite.',
  },
  'marteau-marselha': {
    titulo: 'Hasta "Tarot de Marsella" es nombre de catálogo',
    texto:
      'El Marsella no es el tarot más antiguo: es un patrón de impresión francés de los siglos XVII y XVIII — Noblet en París hacia 1650, Conver en Marsella en 1760. ' +
      'Los tarots más viejos que existen siguen siendo los italianos pintados a mano. El nombre tal como lo usamos hoy lo popularizó en 1930 Paul Marteau, de la fábrica Grimaud, que fijó colores y dibujo a partir del Conver. ' +
      'Circulan dos atribuciones anteriores para el nombre, y esta investigación no logró verificar ninguna de las dos en la fuente.',
  },
  'crowley-thoth': {
    titulo: 'El "Libro de Thoth" que existe de verdad es de plena Segunda Guerra',
    texto:
      'Si alguien te dice que el tarot es el Libro de Thoth, conviene saber que sí existe un libro con ese nombre. ' +
      'Aleister Crowley publicó The Book of Thoth en 1944, con arte de Frieda Harris, siguiendo a la Golden Dawn con un cambio que él mismo declara. ' +
      'Es una baraja del siglo XX con nombre egipcio — no un documento egipcio. El orden cronológico deshace la confusión solo.',
  },
  'dummett-arquivo': {
    titulo: 'Quien juntó las pruebas fue un profesor de lógica',
    texto:
      'La historia que acabas de leer no salió de la intuición de nadie: salió de archivo, de libro de cuentas, de museo. ' +
      'Michael Dummett, filósofo de Oxford, publicó The Game of Tarot en 1980 siguiendo el rastro documental de Ferrara hasta Salt Lake City; en 1996, con Ronald Decker y Thierry Depaulis, publicó A Wicked Pack of Cards, sobre el origen del tarot ocultista. ' +
      'Por eso cada fecha de esta línea tiene dónde verificarse — y por eso puede cambiar, si aparece un documento nuevo. Una historia que no se puede corregir no es historia.',
  },
};

const MITOS = {
  egito: {
    oQueSeDiz: 'Esta baraja es el Libro de Thoth: viene del Egipto de los faraones, guardada por sacerdotes hasta llegar a Europa.',
    oQueAFonteMostra:
      'La afirmación entera sale de un capítulo publicado en París en 1781, sin ningún documento adjunto — y quien la demolió, en 1911, fue el autor de la baraja más vendida del planeta, en el manual que acompaña su propia baraja. ' +
      'Existe un vínculo entre Egipto y la baraja, y es otro: los cuatro palos mamelucos, monedas, cimitarras, copas y bastones de polo. Explica los 56 menores, no los 22 triunfos.',
  },
  etimologia: {
    oQueSeDiz: 'TAROT viene del egipcio TAR-RO, "camino real" — el camino real de la vida.',
    oQueAFonteMostra:
      'Esa etimología se escribió en 1781. La Piedra de Rosetta apareció en 1799 y Champollion descifró el jeroglífico en 1822: en 1781 nadie en el planeta sabía leer egipcio, empezando por quien propuso la etimología. ' +
      'El origen de la palabra tarocco sigue siendo desconocido, y ya se declaraba desconocido en 1550. Los anagramas ROTA, TORA y ORAT son juego de letras latinas del siglo XIX, no etimología.',
  },
  'vinte-e-duas-letras': {
    oQueSeDiz: 'Son 22 arcanos mayores y 22 letras hebreas — prueba de que el tarot es cabalístico desde el origen.',
    oQueAFonteMostra:
      'El vínculo lo sugiere el Comte de Mellet en 1781 y lo sistematiza Éliphas Lévi en 1854: Ilustración francesa y ocultismo del siglo XIX, no Jerusalén antigua. Ningún documento italiano de los siglos XV a XVII ata triunfo con letra. ' +
      'Y el argumento numérico se cae dentro del propio juego: la Minchiate florentina tiene 40 triunfos. Si el 22 fuera diseño cabalístico, alguien habría avisado a los florentinos.',
  },
  'povo-rom': {
    oQueSeDiz: 'Fue un pueblo viajero el que trajo el tarot desde Egipto a Europa.',
    oQueAFonteMostra:
      'La idea es de Boiteau, 1854, y de Vaillant, 1857 — y tiene dos problemas de fecha. La lengua muestra que el pueblo Rom viene del noroeste de la India, y la lingüística comparada lo estableció en 1782–1783, antes de que se escribiera la tesis. ' +
      'Además, las cartas ya circulaban en Europa antes de la llegada documentada de los Rom. Waite ya hacía esa objeción en 1911, acreditando la corrección a Romain Merlin, 1869.',
  },
  'cinco-mil-anos': {
    oQueSeDiz: 'El tarot tiene cinco mil años: viene de la Atlántida, de los druidas, de una sabiduría perdida.',
    oQueAFonteMostra:
      'No hay fuente para ninguna de las tres. Lo que se sostiene, y se puede verificar carta por carta en un museo, es esto: unos seis siglos de imagen y unos dos siglos y medio de lectura. ' +
      'Es menos de lo que se anuncia por ahí y es más interesante, porque cada uno de esos siglos tiene ciudad, nombre y documento — y los cinco mil años no tienen ni una línea.',
  },
  'sempre-espiritual': {
    oQueSeDiz: 'El tarot siempre fue instrumento espiritual; el juego es una degradación moderna.',
    oQueAFonteMostra:
      'El orden del tiempo es el contrario. Primero vinieron unos 350 años de mesa de juego, apuesta y salón; la primera lectura documentada llega después de todo eso. ' +
      'Y el juego no murió para volverse oráculo: al tarot se juega en Francia, al Königrufen en Austria y al tarocchini en Bolonia, hoy, con las mismas cartas que están en tu álbum.',
  },
};

const GRUPOS = {
  maiores: {
    titulo: 'Los 22 triunfos: un desfile italiano, no un alfabeto secreto',
    texto:
      'Estas 22 figuras no eran un enigma para iniciados: eran el repertorio visual de cualquier fiesta y cualquier iglesia de la Italia del siglo XV. ' +
      'Virtudes (la Fuerza, la Justicia, la Templanza), estados de vida (el Emperador, el Papa, la Papisa), la Rueda de la Fortuna, el triunfo de la Muerte, el Juicio Final — las mismas imágenes de los desfiles triunfales y de los Triumphi de Petrarca, tesis que Gertrude Moakley defendió en 1966. ' +
      'La lista más antigua de ellos, en orden, sobrevivió en un sermón contra el juego, del último tercio del siglo XV.',
  },
  paus: {
    titulo: 'Los bastos eran bastones de polo',
    texto:
      'En la baraja mameluca de la que vinieron los palos europeos, este era el palo de los bastones de polo — deporte de noble a caballo, que en Europa no se jugaba. ' +
      'Sin el deporte, el dibujo pasó a ser bastón, cayado, basto. El ejemplar casi completo está en Estambul, en el Topkapı, y es del siglo XV.',
  },
  copas: {
    titulo: 'Las copas eran copas, y atravesaron todo sin cambiar',
    texto:
      'Este es el palo que menos cambió por el camino: copa en la baraja mameluca, copa en Italia, copa en España, copas aquí. ' +
      'Cuando la imagen ya existe en la mesa de quien recibe, no necesita traducción. Siglo XV, y la baraja está en Estambul.',
  },
  espadas: {
    titulo: 'Las espadas eran cimitarras',
    texto:
      'La hoja curva de la baraja mameluca se enderezó al llegar a Italia y se volvió la espada recta que ves en tus cartas. ' +
      'En España el dibujo quedó más parecido al original. Misma baraja del siglo XV, mismo Topkapı.',
  },
  ouros: {
    titulo: 'Los oros son monedas — el palo del dinero, sin metáfora',
    texto:
      'Moneda en la baraja mameluca, denaro en Italia, oros aquí. Es el palo que menos traducción necesitó, porque el dinero es lo que cruza fronteras con más facilidad. ' +
      'Siglo XV, ejemplar casi completo en Estambul.',
  },
};

const NOTAS_DE_CARTA = {
  estrela: {
    titulo: 'En 1911 esta era una carta de robo',
    texto:
      'Abriste La Estrella y leíste esperanza. El libro que Waite escribió para acompañar la baraja empieza su entrada por otro lado: "Loss, theft, privation, abandonment" — pérdida, robo, privación, abandono. ' +
      'La esperanza viene después, presentada como "another reading says". La prioridad se invirtió a lo largo del siglo XX. ' +
      'Esta app sigue la lectura de hoy a propósito, y conviene saber por qué: las listas de palabras de Waite descienden de la cartomancia francesa, mientras que las imágenes de Pamela Colman Smith llevan el simbolismo de la Golden Dawn. Las dos mitades de la baraja no cuentan la misma historia, y la app se queda con la imagen.',
  },
  roda: {
    titulo: 'Del revés, esta carta MEJORA en el texto original',
    texto:
      'La regla que aprendiste dice que la carta invertida es lo mismo, pero trabado. En el texto de Waite no es así: la Rueda de la Fortuna invertida es "Increase, abundance, superfluity" — aumento, abundancia, exceso. ' +
      'La Emperatriz invertida es "Light, truth, the unravelling of involved matters". La clave "invertida es bloqueo" es del siglo XX, de la línea que pasa por Eden Gray, Rachel Pollack y Mary K. Greer — es buena lectura, solo que no es antigua. ' +
      'La invertida sistemática, carta por carta, la instituyó Etteilla, en el siglo XVIII.',
  },
  morte: {
    titulo: 'La delicadeza de la Muerte es del siglo XX, y la app se queda con ella',
    texto:
      'Cuando sale la Muerte, alguien en la mesa se ríe incómodo y alguien dice "no es muerte literal, es transformación". ' +
      'La segunda frase es una elección de lectura del siglo XX — legítima, y es la que esta app mantiene. Solo que no es lo que está escrito en 1911: la entrada de Waite abre con "End, mortality, destruction, corruption". ' +
      'Decir que "la tradición siempre lo leyó como transformación" es atribuirle a Waite una delicadeza que tuvo el siglo pasado.',
  },
  louco: {
    titulo: 'La carta trae un 0. El autor de la baraja dice que no tiene número.',
    texto:
      'Miras El Loco y ves un cero impreso arriba. En su libro, Waite escribe: "Wherever it ought to be put, the Zero is an unnumbered card" — y, en la lista de significados, el Loco aparece después del 20, no antes del 1. ' +
      'En el Tarot de Marsella es LE MAT, sin número alguno. En Etteilla es la carta 78. El "0 al principio" es convención de la Golden Dawn, de fines del siglo XIX. ' +
      'La carta de tu álbum y el libro de su autor discrepan, y eso está impreso desde la primera edición.',
  },
  'forca-justica': {
    titulo: 'La Fuerza es la 8 y la Justicia la 11 — y el cambio no fue de Waite',
    texto:
      'Si alguna vez viste una baraja más antigua, la Justicia era la 8 y la Fuerza la 11. La inversión que usa tu álbum ya estaba en los Cipher Manuscripts de la Golden Dawn antes de que existiera la baraja; Waite siguió el orden en el que se formó. ' +
      'El motivo es astrológico y sencillo: poner Leo y Libra en la secuencia del zodiaco. Es atribución de la Golden Dawn, de fines del siglo XIX — no es la corrección de un error antiguo, es una elección de escuela.',
  },
  'tres-espadas': {
    titulo: 'Esta imagen tiene un pariente de 1491',
    texto:
      'Tres espadas atravesando un corazón, bajo la lluvia. Es una de las cartas más reconocibles de la baraja — y tiene antepasado. ' +
      'La carta correspondiente de la Sola Busca, grabada hacia 1491, se le parece mucho, y el vínculo está documentado: las fotografías de las 78 cartas de aquella baraja entraron en el British Museum en 1907, dos años antes de que Pamela Colman Smith dibujara las suyas. ' +
      'La congruencia aparece también en el Diez de Bastos y en el Diez de Espadas.',
  },
};

const PARALELO = {
  chamada:
    'Da mala sensación descubrir que algo que respetabas lo inventó un señor en una sala de París. La sensación se pasa cuando ves que no es una excepción — es el método de la casa, y es mucho más viejo que el tarot.',
  texto:
    'La astrología occidental, la que usa el resto de esta app, empieza exactamente igual. ' +
    'Los textos que fundan la carta natal como sistema circulan bajo los nombres de Nechepso, un faraón, y Petosiris, un sacerdote egipcio. Los dos son seudónimos: quienes escribieron fueron autores griegos en Alejandría, hacia 150 a 120 a.C., dándole pedigrí egipcio a un texto que estaban produciendo en ese momento.' +
    '\n\n' +
    'Es el mismo gesto de Court de Gébelin, 1.900 años después. Y el del astrólogo que acuñó "Superluna" en 1979. Y el del almanaque que bautizó las lunas llenas en los años 1930.' +
    '\n\n' +
    'O sea: inventar antigüedad no es la corrupción de la tradición — es un rasgo suyo, desde el primer día. Eso no es motivo para soltar la baraja. Es motivo para saber lo que tienes en la mano: unos seis siglos de imagen, dos siglos y medio de lectura, y un linaje de gente que siempre creyó que su propio invento tenía que parecer más viejo de lo que era.',
};

const FONTES = [
  'A. E. Waite, The Pictorial Key to the Tarot, 1911 — la Parte I §4 es la historia y es donde derriba el origen egipcio; la Parte II §3 es la numeración del Loco. Dominio público, texto íntegro en sacred-texts.com/tarot/pkt/',
  'Antoine Court de Gébelin, Le Monde primitif, vol. VIII, "Du Jeu des Tarots", 1781 — el ensayo que inventa el origen egipcio, y el ensayo del Comte de Mellet, en el mismo volumen, que ata los 22 triunfos al alfabeto hebreo',
  'Michael Dummett, The Game of Tarot: from Ferrara to Salt Lake City, 1980 — el trabajo de archivo que estableció la historia documental de la baraja',
  'Ronald Decker, Thierry Depaulis y Michael Dummett, A Wicked Pack of Cards: The Origins of the Occult Tarot, 1996 — el origen del tarot ocultista, de 1781 en adelante',
  'Golden Dawn, Cipher Manuscripts y "Book T — The Tarot" — la tabla astrológica de las 78 cartas, publicada por Israel Regardie a partir de 1937. Es la tabla que usa esta app',
  'Sermones de ludo cum aliis, norte de Italia, último tercio del siglo XV — la lista más antigua que se conoce de los 22 triunfos, en orden',
  'Gertrude Moakley, The Tarot Cards Painted by Bonifacio Bembo, 1966 — la tesis de que los triunfos derivan de los Triumphi de Petrarca y de los desfiles triunfales. Influyente, no consensuada',
  'docs/tradicao/05-taro-historia-e-leitura.md — la base interna donde se verificó cada fecha de esta pantalla, con el grado de cada afirmación',
];

const COMPARTILHAR = {
  oQueSeDiz: 'Dicen que:',
  oQueAFonteMostra: 'La fuente muestra:',
  recibo: 'Recibo:',
};

export const PACK = {
  idioma: 'es',
  tela: TELA,
  fases: FASES,
  obras: OBRAS,
  autores: AUTORES,
  abertura: ABERTURA,
  marcos: MARCOS,
  mitos: MITOS,
  grupos: GRUPOS,
  notasDeCarta: NOTAS_DE_CARTA,
  paralelo: PARALELO,
  fontes: FONTES,
  compartilhar: COMPARTILHAR,
};

export default PACK;
