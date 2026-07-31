// lib/traducoes/quiz.es.js
// PACK EM ESPAÑOL (neutro latinoamericano) del quiz "¿Sabías?" — mesma forma
// exata do pack pt derivado por packDeTextos() em lib/quizCosmico.js, chave por
// chave. O motor continua canônico em PT; este arquivo carrega SÓ o texto que a
// pessoa lê.
//
// ===========================================================================
// O QUE ESTE ARQUIVO NÃO PODE MUDAR (é estrutura, não texto)
// ===========================================================================
// A ORDEM das quatro opções e o `certaIdx` moram no motor e são os MESMOS nos
// três idiomas: `opcoes[2]` aqui é a tradução de `opcoes[2]` lá, sempre. Trocar
// duas opções de lugar neste arquivo faria a resposta certa apontar pra outra
// alternativa — é o bug mais caro que esta frente pode produzir, e
// test/quizIdiomas.test.js confere índice por índice. Também não moram aqui:
// id, tema, base e a rodada determinística do dia (mesmo dia = mesmas 7
// perguntas em qualquer idioma).
//
// ===========================================================================
// AS REGRAS DE TRADUÇÃO (primas das de lib/quizCosmico.js)
// ===========================================================================
// (1) PRENDE PRIMEIRO, FONTE DEPOIS — a explicação abre em conversa; o recibo
//     mora no campo `fonte`. Nada de "siglo" abreviado nem ano de quatro
//     dígitos nos primeiros 40 caracteres.
// (2) NÃO SE TRADUZ: locus (Tetrabiblos I.8, XVIII.321, De Agri Cultura 40.1),
//     nomes de obra em latim, inglês ou francês (Naturalis Historia, The
//     Pictorial Key to the Tarot, Le Monde primitif, Sky & Telescope...),
//     números, datas e a citação verbatim em inglês de Waite ("Loss, theft,
//     privation, abandonment"). Nome consagrado TRADUZ: Ptolomeu → Ptolomeo,
//     Plínio, o Velho → Plinio el Viejo, Catão → Catón, Dião Cássio → Dión
//     Casio, Vétio Valente → Vetio Valente, Manílio → Manilio. Título que o
//     próprio PT já verteu do grego/latim acompanha: Contra os Astrólogos →
//     Contra los Astrólogos, Antologias → Antologías, História Romana →
//     Historia Romana.
// (3) SEPARADOR DECIMAL: o espanhol usa a mesma convenção do português
//     (85,9% · 4.000 anos) — os números saem BYTE A BYTE iguais aos do PT, e o
//     teste compara o conjunto inteiro.
// (4) LINHA VERMELHA EM ESPANHOL: nada de aliviar/calmar/sanar/curar/tratar/
//     energizar, nada de promessa (garantizar/atraer/proteger/manifestar),
//     nada de veredito sobre a pessoa, nada de prova social inventada
//     ("millones de personas", "está comprobado"). Nem na opção ERRADA — opção
//     errada com promessa continua sendo promessa na tela.
// (5) O QUIZ NÃO HUMILHA QUEM ERRA: a explicação conta a história, nunca
//     corrige a pessoa. As frases de placar falam do CONTEÚDO, e nenhuma
//     inventa medalha (o único sistema de medalhas do app é o da Jornada).
// (6) ESPANHOL NEUTRO LATINO: "tú" (nunca "vosotros" nem voseo), léxico
//     compartilhado — "baraja", "tirada", "carta natal", "app". Terminologia
//     herdada de lib/i18n.js (es).
export default {
  // O chrome da tela — as mesmas chaves de CHROME_TELA no motor, com as mesmas
  // assinaturas de função.
  tela: {
    titulo: '¿Sabías?',
    subtitulo: 'Siete preguntas por día — el mito cae, la fuente queda',
    contador: (n, total) => `Pregunta ${n} de ${total}`,
    certo: '¡En la fuente correcta!',
    errado: 'No fue esta vez — la correcta está marcada.',
    fontePrefixo: 'Fuente: ',
    proxima: 'Siguiente pregunta',
    verPlacar: 'Ver marcador',
    placarTitulo: 'Ronda de hoy',
    placarDe: (acertos, total) => `${acertos} de ${total}`,
    acumulado: (respondidas, acertos) =>
      `En total ya respondiste ${respondidas} pregunta${respondidas === 1 ? '' : 's'} — ${acertos} en la fuente correcta.`,
    amanha: 'Mañana hay siete nuevas. La ronda cambia con el día — y es la misma para todo el mundo, así que se puede comparar.',
    rodadaFeitaAviso: 'Ya hiciste la ronda de hoy.',
    a11yOpcao: (n) => `Alternativa ${n}`,
  },

  temas: {
    taro: 'Tarot',
    lua: 'Luna',
    historia: 'Historia',
  },

  // Na MESMA ordem de FAIXAS_PLACAR: da rodada limpa até a rodada zerada.
  placar: [
    'Ronda limpia: siete de siete en la fuente correcta. Esas son exactamente las historias que circulan mal por ahí — y las acabas de comprobar todas en el recibo.',
    'Casi todo en la fuente correcta. Las que se escaparon quedaron con la explicación y el recibo justo arriba — y mañana hay siete más.',
    'Mitad y mitad — y tiene sentido: buena parte de esas historias circula mal desde hace décadas, con fecha y autor del error. Ahora sabes dónde comprobar.',
    'Las respuestas "obvias" de este quiz son justamente las que el mercado repite sin fuente. Cada explicación de arriba cuenta la historia real, con autor y fecha — y mañana hay revancha.',
  ],

  perguntas: {
    // ======================= TAROT =======================
    'taro-leitura-nascimento': {
      pergunta: '¿Cuándo nació el tarot como lectura del futuro?',
      opcoes: [
        'En el antiguo Egipto, con el Libro de Thoth',
        'En la Italia del siglo XV, junto con las cartas',
        'En el siglo XVIII — antes de eso, el tarot era solo un juego',
        'En la Grecia clásica, en los templos oraculares',
      ],
      explicacao:
        'La baraja existe desde la Italia del siglo XV — pero pasó unos 350 años siendo juego de apuesta y de salón, y todavía se juega hoy en Francia y en Austria. La lectura más antigua documentada es una hoja boloñesa de antes de 1750, y el primer método publicado es de Etteilla, en 1783. Resumen honesto: seis siglos de imagen, dos siglos y medio de lectura.',
      fonte: 'Hoja boloñesa (antes de 1750), hallada por Franco Pratesi · Etteilla, primer método publicado, 1783',
    },
    'taro-egito-autor': {
      pergunta: '¿Quién inventó la historia de que el tarot viene de Egipto?',
      opcoes: [
        'Sacerdotes egipcios, en papiros del templo',
        'Antoine Court de Gébelin, en un libro de 1781',
        'Los primeros fabricantes de cartas italianos',
        'Aleister Crowley, en 1944',
      ],
      explicacao:
        'Court de Gébelin vio una partida de tarot en una reunión social en París, creyó reconocer símbolos egipcios y publicó que era el Libro de Thoth — sin presentar un solo documento. El detalle que lo derrumba todo: escribió eso en 1781, y nadie en el mundo leía egipcio antes de que Champollion descifrara los jeroglíficos, en 1822.',
      fonte: 'Antoine Court de Gébelin, Le Monde primitif, vol. 8, "Du Jeu des Tarots", 1781',
    },
    'taro-waite-refuta': {
      pergunta: '¿Qué escribió Waite — autor de la baraja más vendida del mundo — en 1911 sobre el origen egipcio del tarot?',
      opcoes: [
        'Que no hay "una partícula de evidencia" a su favor',
        'Que era el mayor secreto de la baraja',
        'Que solo los iniciados podían confirmarlo',
        'Que los faraones lo dejaron grabado en los templos',
      ],
      explicacao:
        'Waite dedica una sección entera del Pictorial Key a desmontar a Court de Gébelin: llama a sus diez argumentos "pilares de arena" y recuerda que la etimología egipcia se propuso cuando nadie sabía leer egipcio. Quien dice que el tarot no viene de Egipto está del lado del autor de la baraja — no en su contra.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, Parte I §4, 1911',
    },
    'taro-quem-desenhou': {
      pergunta: '¿Quién dibujó las 78 cartas de la famosa "baraja de Waite", lanzada en diciembre de 1909?',
      opcoes: [
        'El propio A. E. Waite',
        'Éliphas Lévi',
        'Una imprenta anónima de Londres',
        'La artista Pamela Colman Smith',
      ],
      explicacao:
        'Waite encargó y dirigió, pero quien dibujó carta por carta fue Pamela Colman Smith — por eso el nombre justo es Rider-Waite-Smith. Para las 56 cartas menores, Smith se apoyó en el Sola Busca, una baraja italiana de cerca de 1491 cuyas fotos acababan de entrar en el British Museum, en 1907.',
      fonte: 'Baraja Waite-Smith, dic./1909 · A. E. Waite, The Pictorial Key to the Tarot, 1911',
    },
    'taro-estrela': {
      pergunta: 'En la lista de significados de Waite (1911), la carta de la Estrella quiere decir, en primer lugar...',
      opcoes: [
        'Esperanza y futuro brillante',
        'Un viaje largo por mar',
        'Pérdida, robo, privación, abandono',
        'Reencuentro con un amor antiguo',
      ],
      explicacao:
        'Es el caso más chocante de la lista: Waite escribe "Loss, theft, privation, abandonment" — y solo después anota que "otra lectura dice: esperanza y buenas perspectivas". La lectura moderna invirtió la prioridad siguiendo la imagen de Smith, no el texto de Waite: las dos mitades de la baraja nunca contaron la misma historia.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911 — carta XVII, La Estrella',
    },
    'taro-morte': {
      pergunta: 'Y la carta de la Muerte, en esa misma lista de Waite (1911), significa...',
      opcoes: [
        'Nunca significa muerte, solo recomienzo',
        '"Fin, mortalidad, destrucción"',
        'Herencia inesperada',
        'Una boda cercana',
      ],
      explicacao:
        'La lectura "transformación" es una elección ética del siglo XX — legítima, y es la que usa esta app —, pero no estaba ahí al comienzo: Waite escribe "End, mortality, destruction, corruption". Saber qué escribió el autor y qué eligió después la práctica ya es la mitad del camino para leer tarot sin repetir leyendas.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911 — carta XIII',
    },
    'taro-cruz-celta': {
      pergunta: '¿La tirada "Cruz Celta" es celta?',
      opcoes: [
        'Sí — viene de los druidas de Irlanda',
        'Sí — está en manuscritos medievales',
        'No — es egipcia, a pesar del nombre',
        'No — el nombre es de Waite, en 1911',
      ],
      explicacao:
        'El nombre aparece por primera vez en el libro de Waite, que solo dice que el método "se usaba en privado desde hacía muchos años". La estructura viene de los círculos de la Golden Dawn de los años 1890 — ninguna atestación celta, ningún druida en el proceso.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, Parte III §7, 1911',
    },
    'taro-tres-cartas': {
      pergunta: '¿De dónde viene la tirada de tres cartas Pasado / Presente / Futuro?',
      opcoes: [
        'Nadie encontró fuente primaria — se popularizó en el siglo XX',
        'Del Pictorial Key de Waite',
        'De la Golden Dawn',
        'De los templos de Egipto',
      ],
      explicacao:
        'Waite da tres métodos en el libro — de 10, 42 y 35 cartas — y ninguno es un tres-cartas temporal; la Golden Dawn usaba otra tirada, la Opening of the Key, una operación de horas. La tirada de tres es legítima como práctica — lo que no se puede es llamarla "la clásica", porque nadie encontró el texto que la funda.',
      fonte: 'Verificado en A. E. Waite, The Pictorial Key to the Tarot, 1911 — la tirada no está ahí',
    },
    'taro-invertidas': {
      pergunta: '¿Quién fue el primero en publicar significados de carta invertida, uno por carta?',
      opcoes: [
        'Los fabricantes de Marsella',
        'Waite, en 1911',
        'Etteilla, a partir de 1770',
        'Una tradición oral milenaria, sin registro escrito',
      ],
      explicacao:
        'Etteilla instituyó el significado invertido sistemático — toda lectura de invertida en el mundo desciende de él. Y hay sorpresa en Waite: ahí la invertida suele ser un sentido lateral, a veces mejor que el derecho — la Rueda de la Fortuna al revés pasa a ser "aumento, abundancia".',
      fonte: 'Etteilla, primer manual de cartomancia con invertidas, 1770 · Waite, 1911',
    },
    'taro-78-cartas': {
      pergunta: '¿Todo tarot tiene 78 cartas?',
      opcoes: [
        'Sí — es número fijado desde el origen',
        'No — la Minchiate de Florencia tiene 97; el Boloñés, 62',
        'Sí — 78 es la suma de las letras hebreas',
        'No — el número cambia cada siglo',
      ],
      explicacao:
        'El 78 es el patrón que ganó, no una ley: la Minchiate florentina tiene 97 cartas, el Tarocco Bolognese tiene 62 y el Siciliano, 64. De paso, eso desmonta la numerología de las "22 láminas = 22 letras hebreas" — los patrones históricos no siempre tienen 22 triunfos.',
      fonte: 'Patrones italianos históricos (Minchiate, Bolognese, Siciliano) — Dummett, The Game of Tarot, 1980',
    },
    'taro-marselha': {
      pergunta: '¿El "Tarot de Marsella" es el tarot más antiguo que existe?',
      opcoes: [
        'No — los más antiguos son italianos, pintados a mano en el siglo XV',
        'Sí — fue diseñado en Marsella en el siglo XII',
        'Sí — llegó en las naves fenicias',
        'No — es copia de la baraja de Waite',
      ],
      explicacao:
        'Los tarots más antiguos que sobrevivieron son los italianos pintados a mano, como los Visconti-Sforza de mediados del siglo XV. El patrón "de Marsella" es impresión francesa posterior (Noblet c. 1650, Conver 1760) — y el nombre comercial "Ancien Tarot de Marseille" lo popularizó Paul Marteau, de la editorial Grimaud, en 1930.',
      fonte: 'Paul Marteau / Grimaud, Ancien Tarot de Marseille, 1930',
    },

    // ======================= LUNA =======================
    'lua-superlua': {
      pergunta: '¿Quién inventó la palabra "Superluna"?',
      opcoes: [
        'La NASA, en la era Apolo',
        'Galileo, al apuntar el telescopio',
        'Los almanaques coloniales estadounidenses',
        'El astrólogo Richard Nolle, en una revista de 1979',
      ],
      explicacao:
        '"Superluna" parece término de observatorio, pero nació en una revista de horóscopo: Richard Nolle acuñó el nombre en Dell Horoscope en 1979, y la prensa solo lo adoptó en masa en 2011. El nombre técnico es perigee syzygy — y la diferencia de tamaño, real (~14%), es imperceptible a simple vista sin una foto lado a lado.',
      fonte: 'Richard Nolle, revista Dell Horoscope, 1979',
    },
    'lua-cheia-lavoura': {
      pergunta: '¿La Luna Llena era época de qué en el campo romano?',
      opcoes: [
        'De cosechar todo lo que estaba maduro',
        'De sembrar habas',
        'De cortar madera',
        'De esquilar las ovejas',
      ],
      explicacao:
        'Es lo contrario de lo que se repite por ahí: cosechar, cortar y esquilar era trabajo de menguante — Plinio anota que así la planta "sufre menos daño". En la llena, Columela mandaba sembrar habas. La regla del campo era: creciente para poner, menguante para sacar — y las habas en la víspera de la llena era la instrucción específica de Columela.',
      fonte: 'Columela, De Re Rustica XI.2.85, siglo I · Plinio el Viejo, Naturalis Historia XVIII.321, siglo I',
    },
    'lua-nomes-almanaque': {
      pergunta: '"Luna del Lobo", "Luna de la Fresa", "Luna de Nieve" — ¿de dónde vienen esos nombres?',
      opcoes: [
        'De los pueblos indígenas del Amazonas',
        'De la mitología griega',
        'De almanaques agrícolas de EE. UU., en los años 1930',
        'De los druidas celtas',
      ],
      explicacao:
        'La lista estándar salió de un almanaque agrícola estadounidense: el Maine Farmers\' Almanac publicó los nombres en los años 1930, y el Old Farmer\'s Almanac lo simplificó a un nombre por mes. Es una mezcla de fuentes algonquinas, inglesas y celtas vendida como sistema único — y describe el ciclo agrícola del noreste de EE. UU.: al sur del ecuador, "Luna de Nieve" en febrero cae en pleno verano.',
      fonte: 'Maine Farmers\' Almanac, años 1930 · primera lista impresa: Daniel Carter Beard, 1918',
    },
    'lua-rosa': {
      pergunta: 'En abril, ¿la "Luna Rosa" se pone rosa?',
      opcoes: [
        'No — el nombre viene de una flor',
        'Sí — por el polen en la atmósfera',
        'Sí — en los años de eclipse',
        'No — el nombre viene de una cantante',
      ],
      explicacao:
        'La flor es la Phlox subulata, el musgo rosa que tapiza el suelo al comienzo de la primavera del este de América del Norte. La Luna sigue del color de siempre — el nombre describe el calendario de flores de allá, no el cielo de acá.',
      fonte: 'Lista estándar del Old Farmer\'s Almanac, siglo XX',
    },
    'lua-azul': {
      pergunta: '"Luna Azul es la segunda luna llena del mes." Esa definición nació como...',
      opcoes: [
        'Folclore inglés medieval',
        'Un error de lectura en una revista, en 1946',
        'Cálculo oficial de los observatorios',
        'Tradición de los navegantes portugueses',
      ],
      explicacao:
        'James Hugh Pruett leyó mal un artículo del Maine Farmers\' Almanac — que usaba "Blue Moon" para la tercera llena de una estación con cuatro — y publicó la versión "segunda del mes" en Sky & Telescope en 1946. La NPR lo repitió en 1980, el Trivial Pursuit lo cristalizó en 1986, y la propia revista se corrigió en 1999. Ninguna de las dos definiciones es antigua.',
      fonte: 'Olson, Fienberg & Sinnott, "What\'s a Blue Moon?", Sky & Telescope, mayo/1999',
    },
    'lua-oito-fases': {
      pergunta: '¿De qué época son las ocho fases de la Luna con lectura de personalidad?',
      opcoes: [
        'De Babilonia',
        'De Roma',
        'De 1967 — Dane Rudhyar',
        'De la Grecia de Hesíodo',
      ],
      explicacao:
        'La división antigua que tiene fuente es en cuatro cuartos, con cualidades de clima — húmedo, caliente, seco, frío —, en Ptolomeo. Las ocho fases nombradas con lectura psicológica son de Dane Rudhyar: formuladas en The Lunation Cycle (1967), sobre una idea que venía desarrollando desde los años 1930-40. Y "gibosa" es solo latín para "jorobada": describe la forma, no carga doctrina.',
      fonte: 'Ptolomeo, Tetrabiblos I.8, siglo II · Dane Rudhyar, The Lunation Cycle, 1967',
    },
    'lua-minguante': {
      pergunta: '¿Qué reservaba el campo romano para la Luna menguante?',
      opcoes: [
        'Sembrar todo',
        'Casarse y bautizar',
        'Nada — era fase de descanso',
        'Cortar, cosechar y esquilar',
      ],
      explicacao:
        'Todo lo que se corta, se cosecha y se esquila sufre menos daño con la luna menguante — así resume Plinio la regla, y Catón y Columela mandan a menguante también el desmalezado, el estiércol y el corte de madera. Lo que debía secar o disminuir iba todo a esa fase: es la regla lunar con más fuente primaria que existe.',
      fonte: 'Plinio el Viejo, Naturalis Historia XVIII.321-322, siglo I · Catón, De Agri Cultura 29 y 31.2, siglo II a.C.',
    },
    'lua-catao-plantio': {
      pergunta: 'Catón, en el siglo II a.C., ¿en qué momento de la Luna mandaba plantar higuera y vid?',
      opcoes: [
        'En la llena, a medianoche',
        'En la "luna callada" (oscura), por la tarde',
        'En el cuarto creciente, al amanecer',
        'En cualquier día par',
      ],
      explicacao:
        '"Luna silente" — la luna callada, cuando desaparece del cielo. Es el registro agrícola romano de la idea de empezar en lo oscuro: la semilla va a la tierra cuando la Luna todavía no aparece, y crece junto con ella. Dos mil años después eso se volvió "ritual de Luna Nueva" — la raíz es una instrucción de campo.',
      fonte: 'Catón el Viejo, De Agri Cultura 40.1, siglo II a.C.',
    },
    'lua-sangue': {
      pergunta: '¿Desde cuándo existe "Luna de Sangre" como nombre de eclipse?',
      opcoes: [
        'Desde la Biblia',
        'Desde la Roma antigua',
        'Desde 2008',
        'Desde la Edad Media',
      ],
      explicacao:
        'La imagen es bíblica — "la luna se convertirá en sangre", en el libro de Joel —, pero el término como nombre de evento es del pastor Mark Biltz, en 2008, y se volvió mundial con el libro Four Blood Moons, de John Hagee. Los astrónomos no lo usan. Y la profecía de la tétrada de 2014-15 no se cumplió.',
      fonte: 'Joel 2:31 (la imagen) · Mark Biltz, 2008, y John Hagee, Four Blood Moons, 2013 (el término)',
    },
    'lua-intencoes': {
      pergunta: '"Escribir intenciones en la Luna Nueva", como se practica hoy, lo popularizó...',
      opcoes: [
        'Jan Spiller, en un libro de 2001',
        'Cleopatra',
        'Los monjes copistas',
        'Nostradamus',
      ],
      explicacao:
        'Plantar de verdad en la luna oscura es fuente primaria romana — Catón y Paladio lo mandan. Cambiar la semilla por una intención escrita es transposición reciente, popularizada por Jan Spiller en New Moon Astrology. El gesto de empezar en lo oscuro es viejo; la lista de deseos es de anteayer.',
      fonte: 'Catón, De Agri Cultura 40.1, siglo II a.C. (la siembra) · Jan Spiller, New Moon Astrology, 2001 (la intención)',
    },
    'lua-eclipse-pais': {
      pergunta: 'Para Ptolomeo, en el siglo II, ¿a quién le concernía un eclipse?',
      opcoes: [
        'A quien nació ese día',
        'A países, ciudades y reyes',
        'A cada persona, según su signo',
        'A nadie — él no escribió sobre eclipses',
      ],
      explicacao:
        'En la fuente, el eclipse es asunto de mapamundi: Ptolomeo dedica seis capítulos del Tetrabiblos a prever efectos sobre regiones y gobernantes — hasta la duración la calcula por hora de oscuridad. "Tu temporada de eclipses te va a cambiar la vida" no viene de ahí: la aplicación individual es moderna.',
      fonte: 'Ptolomeo, Tetrabiblos II.4-II.9, siglo II',
    },
    'lua-tempo-signo': {
      pergunta: '¿Cuánto tiempo pasa la Luna en cada signo?',
      opcoes: [
        'Exactamente 2 días y medio',
        'Una semana',
        'En promedio ~2,28 días — y varía',
        'Un mes',
      ],
      explicacao:
        'El famoso "2 días y medio" es un redondeo: el promedio real es ~2,28 días (2d 6h40m), y varía de ~1,95 a ~2,55 según la velocidad de la Luna, que cambia a lo largo del mes. Parece detalle — pero es la diferencia entre tabla memorizada y cielo calculado, que es la pelea número uno de esta app.',
      fonte: 'Medición astronómica: mes sideral de 27,32 días dividido por los 12 signos',
    },
    'lua-colheita-hemisferio': {
      pergunta: 'La "Luna de la Cosecha" (Harvest Moon) de septiembre, ¿vale al sur del ecuador?',
      opcoes: [
        'Vale — el nombre es universal',
        'Vale, pero solo en el extremo sur del continente',
        'No — al sur del ecuador el fenómeno no existe',
        'No — ahí el equivalente cae en marzo',
      ],
      explicacao:
        'El fenómeno es real: cerca del equinoccio de otoño, la Luna llena sale casi a la misma hora varias noches seguidas. Solo que el otoño del hemisferio sur empieza en marzo — septiembre como "mes de la cosecha" es calendario del noreste de Estados Unidos; al sur del ecuador es primavera.',
      fonte: 'Fenómeno astronómico medible · nombre inglés atestiguado desde 1706 (Merriam-Webster)',
    },
    'lua-saros': {
      pergunta: '"Saros", el nombre del ciclo de los eclipses, ¿de dónde salió?',
      opcoes: [
        'Es la palabra babilónica para "eclipse"',
        'De un error de Halley en 1691 — señalado en 1756 y nunca corregido',
        'Del griego, "sombra"',
        'De un astrónomo persa',
      ],
      explicacao:
        'Halley pescó la palabra en un léxico bizantino y la pegó al ciclo de 18 años — pero šār, en babilónico, es el número 3.600, no un ciclo de eclipses. Le Gentil señaló el error en 1756 y el nombre quedó así igual. Los babilonios, dueños del descubrimiento, lo llamaban "ciclo de 18 años".',
      fonte: 'Edmond Halley, 1691; el error señalado por Guillaume Le Gentil, 1756',
    },

    // ======================= HISTORIA =======================
    'hist-horoscopo-jornal': {
      pergunta: 'El horóscopo de diario — doce casillas, una por signo — ¿cuándo se inventó?',
      opcoes: [
        'En Babilonia',
        'En la Grecia clásica',
        'El 24 de agosto de 1930',
        'En los años 1960, en EE. UU.',
      ],
      explicacao:
        'Fue por un nacimiento real: el Sunday Express le encargó a R. H. Naylor un horóscopo de la princesa Margarita, recién nacida — y el diario tuvo que explicarles a los lectores qué era un horóscopo, porque en 1930 nadie lo sabía. Las doce casillas nacieron de un problema editorial: el único dato que todo lector sabe de memoria es su propia fecha de nacimiento.',
      fonte: 'R. H. Naylor, "What the Stars Foretell for the New Princess", Sunday Express, 24/08/1930',
    },
    'hist-horoscopo-antigo': {
      pergunta: '¿De qué año es el horóscopo individual más antiguo que se conoce?',
      opcoes: ['3000 a.C.', '410 a.C.', '150 d.C.', '1781'],
      explicacao:
        'Es una tablilla de arcilla babilónica con el cielo de la noche de un nacimiento — y es solo una lista de posiciones: sin Ascendente, sin casas, sin ninguna interpretación. La carta natal como sistema de lectura es invención griega, unos tres siglos después, en Alejandría.',
      fonte: 'Francesca Rochberg, Babylonian Horoscopes, American Philosophical Society, 1998',
    },
    'hist-babilonios': {
      pergunta: '¿Qué leían en el cielo los sacerdotes de Babilonia?',
      opcoes: [
        'Presagios de Estado — rey, guerra, cosecha',
        'La carta natal de cada persona',
        'La pareja ideal de cada signo',
        'El nombre que debía recibir cada niño',
      ],
      explicacao:
        'La serie Enūma Anu Enlil tiene miles de presagios, y todos le hablan al palacio: "si tal fenómeno, entonces tal consecuencia para el rey y para el país". La astrología más antigua no era sobre ti — el registro individual solo aparece siglos después, y la interpretación individual es griega.',
      fonte: 'Enūma Anu Enlil, serie cuneiforme, compilación c. siglos XVI-XII a.C.',
    },
    'hist-nechepso': {
      pergunta: 'Los textos que fundaron la carta natal circulaban firmados por "Nechepso y Petosiris". ¿Quiénes eran?',
      opcoes: [
        'Un faraón y un sacerdote de verdad',
        'Dos astrónomos de la corte persa',
        'Discípulos directos de Ptolomeo',
        'Seudónimos — autores griegos fingiendo antigüedad egipcia',
      ],
      explicacao:
        'Autores griegos de Alejandría, alrededor de 150-120 a.C., firmaron como un faraón y un sacerdote para darle pedigrí egipcio a lo que estaban escribiendo en ese momento. La astrología occidental empieza con una falsificación de antigüedad — el mismo gesto que Court de Gébelin repetiría con el tarot, 1.900 años después.',
      fonte: 'Corpus de Nechepso-Petosiris, c. 150-120 a.C.; fragmentos recogidos por Riess, 1892',
    },
    'hist-tendencias': {
      pergunta: 'La frase "la astrología no predice, apunta tendencias" ¿dónde nació?',
      opcoes: [
        'En los templos de Babilonia',
        'En un tribunal de Londres, como defensa penal',
        'En un congreso de astrónomos',
        'En la contracultura de los años 1960',
      ],
      explicacao:
        'Alan Leo, el hombre que industrializó el horóscopo, fue procesado dos veces por adivinación bajo la ley inglesa; la defensa decía que él describía "tendencias", no fortunas. Se cayó cuando la acusación leyó en voz alta una predicción de muerte del almanaque de él — condenado, multa de cinco libras. El mercado heredó la frase sin saber que nació como tesis de defensa, en 1914-1917.',
      fonte: 'Procesos de Alan Leo, Londres, 1914 y 1917',
    },
    'hist-contra-astrologos': {
      pergunta: '¿Quién escribió, todavía en la Antigüedad, un libro entero llamado "Contra los Astrólogos"?',
      opcoes: [
        'Nadie — la crítica es invención moderna',
        'Julio César',
        'Sexto Empírico, en el siglo III',
        'El emperador Nerón',
      ],
      explicacao:
        'El desacuerdo es tan antiguo como la práctica: Sexto Empírico escribió el Contra los Astrólogos en el siglo III, y él es fuente primaria tanto como Ptolomeo. "Conocimiento milenario" aplana cuatro mil años de gente discutiendo — y la discusión es la parte más interesante de la historia.',
      fonte: 'Sexto Empírico, Contra los Astrólogos, siglo III',
    },
    'hist-mercurio-retro': {
      pergunta: '"Mercurio retrógrado rompe celulares y tumba contratos." ¿Qué dice de verdad la fuente antigua?',
      opcoes: [
        'Habla de atraso: expectativas y emprendimientos postergados',
        'Exactamente eso, pero con carretas',
        'Manda viajar más',
        'Nada — nadie observaba la retrogradación',
      ],
      explicacao:
        'La fuente habla de espera, no de aparatos: Vetio Valente escribe que los planetas retrógrados "postergan expectativas, acciones, ganancias y emprendimientos" — y que la segunda estación "cancela el atraso". Nada de tecnología ni de ex. La expresión "Mercurio retrógrado" ni siquiera aparece en la prensa general antes de 1996.',
      fonte: 'Vetio Valente, Antologías, siglo II',
    },
    'hist-retro-frequencia': {
      pergunta: '¿Un planeta retrógrado en el cielo es cosa rara?',
      opcoes: [
        'Rarísima — una vez por década',
        'No — en el 85,9% de los días hay algún planeta retrógrado',
        'Solo pasa en año bisiesto',
        'Imposible — un planeta no anda para atrás',
      ],
      explicacao:
        'Midiendo con la efeméride: Saturno pasa 36,3% del tiempo retrógrado, Plutón 44,4% — y en el 85,9% de los días hay algún planeta retrógrado en el cielo. Si la retrogradación pusiera la vida de cabeza, estar de cabeza sería lo normal. El movimiento es aparente: perspectiva de las órbitas, no marcha atrás.',
      fonte: 'Medición propia con efeméride astronómica — base de tradición de la app, doc 11',
    },
    'hist-urano': {
      pergunta: '¿Acuario "siempre fue" regido por Urano?',
      opcoes: [
        'Sí — desde los caldeos',
        'Sí — está en el Tetrabiblos',
        'No — Urano solo se descubrió en 1781; en la tradición, Acuario era de Saturno',
        'No — Acuario era del Sol',
      ],
      explicacao:
        'No puede un signo ser "desde siempre" de un planeta que nadie conocía: Urano entra en la carta en 1781, y la atribución a Acuario empieza alrededor de 1825-1828 — en 1834 un lector todavía preguntaba por qué el planeta nuevo no tenía ninguna casa. En el Tetrabiblos, Acuario es domicilio de Saturno.',
      fonte: 'Ptolomeo, Tetrabiblos I.17, siglo II · atribución a Urano: Smith, 1825 / Varley, 1828',
    },
    'hist-semana-planetaria': {
      pergunta: 'Lunes de la Luna, martes de Marte... ¿La semana planetaria ya era "inmemorial" para los romanos?',
      opcoes: [
        'No — quien la registra ya llamaba a la costumbre "comparativamente reciente"',
        'Sí — venía del inicio de los tiempos',
        'Sí — la decretó Rómulo',
        'No — se inventó en el siglo XIX',
      ],
      explicacao:
        'Dión Casio, el historiador que documenta la costumbre, escribe que los griegos antiguos no la conocían y que la adopción era reciente — y encima da dos explicaciones que compiten para el orden de los días, porque ni él estaba seguro. Hasta la fuente antigua veía la moda como nueva.',
      fonte: 'Dión Casio, Historia Romana 37.18-19, siglo III',
    },
    'hist-porcentagem': {
      pergunta: 'El "porcentaje de compatibilidad" entre signos, ¿de qué fuente antigua viene?',
      opcoes: [
        'Del Tetrabiblos de Ptolomeo',
        'Del Carmen Astrologicum de Doroteo',
        'De los papiros de Alejandría',
        'De ninguna — no existe número en fuente antigua',
      ],
      explicacao:
        'Revisados Ptolomeo, Doroteo, Māshā\'allāh y Lilly: ningún número, ningún "87%". Lo que la tradición tiene es una escala de cuatro escalones — y ahí la oposición queda en el fondo, no en el tope que suelen darle las apps. El porcentaje es convención mediática del siglo XX, sin inventor documentado.',
      fonte: 'Ptolomeo, Tetrabiblos IV.7, siglo II (la escala ordinal); el porcentaje: siglo XX, sin autor identificado',
    },
    'hist-leao-coracao': {
      pergunta: 'En la lista antigua que ligaba signos a partes del cuerpo, ¿a qué correspondía Leo?',
      opcoes: [
        'Al corazón, claro',
        'A los flancos y a los omóplatos',
        'A la cabeza',
        'A los pies',
      ],
      explicacao:
        '"Leo = corazón" no está en Manilio ni en Ptolomeo: en Manilio, autor de la lista de los doce signos, Leo se quedaba con los flancos y los omóplatos — y Libra, que el mercado le da a los riñones, se quedaba con las nalgas. La versión "corazón" es datable: aparece impresa en la Escala del Doce de Agrippa, en 1533.',
      fonte: 'Manilio, Astronomica II.453-465, siglo I · Agrippa, Escala del Doce, 1533',
    },
    'hist-signo-solar': {
      pergunta: 'En la astrología antigua, el signo solar — "tu signo" — ¿era el centro de todo?',
      opcoes: [
        'No — el Sol era uno de los siete planetas; lo que marcaba al individuo era el Ascendente',
        'Sí — desde siempre',
        'Sí — Ptolomeo manda empezar por él',
        'No — el centro era Júpiter',
      ],
      explicacao:
        'En la tradición, el significador del individuo es el Ascendente — y el carácter, en Ptolomeo, viene de Mercurio y de la Luna. El signo solar se volvió el centro por dos motivos con nombre y fecha: Alan Leo, que necesitaba producir lecturas en escala, y el diario de 1930, que necesitaba doce casillas.',
      fonte: 'Ptolomeo, Tetrabiblos III.13, siglo II · Alan Leo, 1895-1917 · Naylor, 1930',
    },
    'hist-cuspide': {
      pergunta: 'Quien nace "en la cúspide", ¿es un poco de los dos signos?',
      opcoes: [
        'Sí — es doctrina antigua',
        'Sí — pero solo en las cúspides de agua',
        'No — la frontera de signo es un instante exacto; lo que se equivoca es la tabla de fechas',
        'No — cúspide es error de traducción',
      ],
      explicacao:
        'Los signos empiezan en los equinoccios y solsticios, que son instantes — Ptolomeo escribe que se cuentan a partir de ellos "y de ninguna otra fuente". Lo que crea la leyenda es la tabla de fecha fija de los almanaques, que se equivoca de verdad en las fronteras (29% de los días de cambio, medido). La respuesta no es "soy de los dos": es calcular la longitud del Sol a la hora del nacimiento — que es lo que hace esta app.',
      fonte: 'Ptolomeo, Tetrabiblos I.22, siglo II · medición propia de la app: 318 de 1.092 días de cambio errados por tabla',
    },
    'hist-5000-anos': {
      pergunta: '"La astrología tiene 5.000 años." ¿Cuál es la cuenta honesta?',
      opcoes: [
        '5.000 justos, desde las pirámides',
        'Unos 2.000 a 2.500 años de tradición textual continua',
        '10.000, desde las cavernas',
        '300 años, desde los diarios',
      ],
      explicacao:
        'Lo que tiene ~4.000 años son presagios de Estado mesopotámicos — otra cosa, sin carta individual. El zodíaco tiene ~2.450 años, el horóscopo individual más antiguo es de 410 a.C., y la carta natal con Ascendente tiene ~2.150. Dos milenios y pico de textos continuos ya es impresionante — no hace falta inflar.',
      fonte: 'Síntesis de la investigación en fuente primaria de esta app — base de tradición, doc 10 §14.1',
    },
  },
};
