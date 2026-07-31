// lib/traducoes/mitos.es.js
// PACK EM ESPANHOL (neutro latino-americano) para lib/mitos.js — mesma forma
// da fonte de verdade em português, mito a mito. O motor continua canônico em
// PT; este arquivo carrega SÓ o texto que a pessoa lê, traduzido por SENTIDO,
// não ao pé da letra.
//
// AS REGRAS DESTE ARQUIVO (mesma linha vermelha de lib/mitos.js, primos em
// espanhol — test/mitosIdiomas.test.js varre tudo):
//   (1) NENHUMA alegação de saúde: aliviar/calmar/sanar/curar/tratar/energizar
//       e parentes não entram, nem implícitos. Por isso "se trata de" nunca
//       aparece aqui — a conjugação esbarraria na varredura, e a varredura
//       está certa.
//   (2) NENHUMA promessa, veredito ou aviso defensivo: o mito data, cita e
//       devolve a história real — não zomba de quem acredita nem "desmascara"
//       com moral. Mesmo tom da tese (docs/tradicao/00-tese.md).
//   (3) O que nunca se traduz: locus (Tetrabiblos I.22, Astronomica
//       II.453–465), nome de obra (The Lunation Cycle, Le Monde primitif,
//       Sky & Telescope), números, datas e o link cosmicguide.cloud. Nome
//       consagrado TRADUZ (Ptolomeu → Ptolomeo, Catão → Catón, Manílio →
//       Manilio, Vétio Valente → Vetio Valente).
//   (4) O tom espelha o PT: PRENDE PRIMEIRO, FONTE DEPOIS. Todo `detalhe`
//       abre na vida real — feed, playa, laptop trabada — e o recibo (obra,
//       autor, ano) chega na segunda metade. Os primeiros 60 caracteres não
//       carregam ano de quatro dígitos nem "siglo".
//   (5) A palavra banida por docs/tradicao/06 §2 continua banida no idioma:
//       nem "cigana" nem o primo espanhol entram em texto nenhum.
//
// CONTRATO DE FORMA (cobrado por test/mitosIdiomas.test.js):
//   - `tela` tem exatamente as chaves de CHROME_TELA (lib/mitos.js), com os
//     mesmos placeholders {n}/{total} — e `marca` é o domínio, idêntico nos
//     três idiomas.
//   - `mitos` tem EXATAMENTE os 25 ids de MITOS, cada um com oQueTeContaram,
//     oQueAFonteDiz, fonte e detalhe — nenhum valor vazio.
//   - `compartilhar` traz os três rótulos do texto que sai do app; o motor
//     monta as linhas e fecha SEMPRE no LINK_COMPARTILHAR literal.
export default {
  // O chrome da tela. Mesmas chaves de CHROME_TELA (PT), mesmos placeholders.
  tela: {
    titulo: 'Mito × Fuente',
    subtitulo: 'Lo que te contaron × lo que está escrito',
    mitoDoDia: 'MITO DEL DÍA',
    teContaram: 'TE CONTARON',
    fonteDiz: 'LA FUENTE DICE',
    recibo: 'RECIBO',
    anterior: 'Anterior',
    proximo: 'Siguiente',
    compartilhar: 'Compartir',
    voltarAoDia: 'Volver al mito del día',
    contador: '{n} de {total}',
    progresso: 'Ya revisaste {n} de {total} mitos.',
    copiado: 'Texto copiado — pégalo donde quieras.',
    naoCopiou: 'No se pudo copiar aquí — selecciona el texto y cópialo.',
    marca: 'cosmicguide.cloud',
  },

  // Os rótulos do texto compartilhável — voz de conversa, como o PT.
  compartilhar: {
    teContaram: 'Te contaron:',
    fonteDiz: 'La fuente dice:',
    recibo: 'Recibo:',
  },

  mitos: {
    'taro-egito': {
      oQueTeContaram: 'El tarot viene del antiguo Egipto — es el Libro de Thoth de los faraones.',
      oQueAFonteDiz:
        'La idea entera nace en un capítulo de un libro francés de 1781, de Antoine Court de Gébelin — 41 años antes de que Champollion descifrara los jeroglíficos. Él no tenía cómo leer una sola línea de egipcio. El propio Waite escribió en 1911 que no existe ninguna evidencia del origen egipcio.',
      fonte: 'Le Monde primitif, vol. 8, "Du Jeu des Tarots" — Court de Gébelin, 1781',
      detalhe:
        'Ese mazo que venden como secreto de los faraones pasó unos 350 años como juego de apuestas en mesas de taberna italiana. La lectura de cartas como la conocemos tiene 245 años: nació cuando Court de Gébelin publicó la tesis egipcia en 1781 — y dos años después Etteilla vendió el primer método. El propio Waite, en 1911, escribió que no hay ninguna evidencia del origen egipcio.',
    },
    superlua: {
      oQueTeContaram: '"Superluna" es un fenómeno raro que la astronomía anuncia desde siempre.',
      oQueAFonteDiz:
        'El término lo acuñó un astrólogo, Richard Nolle, en una revista de horóscopos en 1979. No existe una definición astronómica oficial — el nombre técnico es perigeo-sizigia, y la diferencia de tamaño es imperceptible a simple vista sin una comparación lado a lado.',
      fonte: 'Richard Nolle, revista Dell Horoscope, 1979',
      detalhe:
        'Cada titular de "Superluna gigante" anuncia un espectáculo que nadie distingue a simple vista — la diferencia es de un 14% de diámetro, visible solo en fotos comparadas. La palabra ni siquiera es de la astronomía: quien la acuñó fue un astrólogo, Richard Nolle, en una revista de horóscopos en 1979. El término solo se viralizó en 2011.',
    },
    'luas-cheias-nomes': {
      oQueTeContaram: '"Luna del Lobo", "Luna de Fresa"… son nombres indígenas milenarios.',
      oQueAFonteDiz:
        "La lista estándar la publicó el Maine Farmers' Almanac en los años 1930 — una recopilación de fuentes algonquinas, inglesas coloniales y celtas — y el Old Farmer's Almanac la simplificó a un nombre por mes. Y describe el ciclo agrícola del noreste de Estados Unidos: al sur del ecuador llega con el hemisferio equivocado.",
      fonte: "Maine Farmers' Almanac, años 1930",
      detalhe:
        'Fíjate que la "Luna de Nieve" de febrero cae en pleno verano si estás al sur del ecuador — el nombre llegó listo desde el hemisferio de arriba. La lista famosa salió de un almanaque agrícola estadounidense de los años 1930, una recopilación de fuentes algonquinas, inglesas y celtas simplificada a un nombre por mes.',
    },
    'oito-fases': {
      oQueTeContaram: 'Las 8 fases de la Luna, cada una con su significado, son sabiduría milenaria.',
      oQueAFonteDiz:
        'La lectura psicológica de las ocho fases es de Dane Rudhyar — formulada en los ocho tipos soli-lunares de The Lunation Cycle (1967), sobre una idea que venía desarrollando desde los años 1930-40 (The Astrology of Personality, 1936). La división antigua es otra — Ptolomeo trabaja con cuatro cuartos, y describe cualidades, no personalidad.',
      fonte: 'Dane Rudhyar — The Astrology of Personality, 1936; The Lunation Cycle, 1967',
      detalhe:
        'El carrusel con las ocho fases de la Luna y el "modo de uso" de cada una tiene dueño y acta de nacimiento. Quien formuló los ocho tipos con lectura psicológica fue Dane Rudhyar, en The Lunation Cycle (1967), sobre una idea que venía desarrollando desde los años 1930-40. Los autores antiguos dividían la Luna en cuatro cuartos — Ptolomeo describía cualidades, no personalidad.',
    },
    'quiromancia-milenar': {
      oQueTeContaram: 'Leer la mano es un arte milenario — montes, tipos de mano, línea del matrimonio.',
      oQueAFonteDiz:
        "El sistema moderno nace en 1843 con D'Arpentigny (La Chirognomonie), toma cuerpo con Heron-Allen (1883) y se vuelve manual con Benham (1900). Y los cuatro tipos de mano por elemento son de Fred Gettings, 1965.",
      fonte: "La Chirognomonie, D'Arpentigny, 1843 · The Laws of Scientific Hand Reading, Benham, 1900",
      detalhe:
        "La línea del matrimonio que te mostraron en la playa es más joven que la fotografía. El paquete completo — montes, tipos de mano, líneas con nombre — se armó entre 1843 y 1900, de D'Arpentigny a Benham. Y los cuatro tipos de mano por elemento son de 1965, de Fred Gettings.",
    },
    'borra-de-cafe': {
      oQueTeContaram: 'Leer la borra del café es una tradición turca milenaria, con símbolos ancestrales.',
      oQueAFonteDiz:
        'El café solo llega a Estambul en el siglo XVI — la práctica no puede ser más vieja que la bebida. Y el diccionario de símbolos (serpiente = enemistad, casa = mudanza) es salón británico de fines del siglo XIX, consolidado por Cicely Kent en 1922.',
      fonte: 'Tea-Cup Reading, "A Highland Seer", 1881 · Cicely Kent, 1922',
      detalhe:
        'No había forma de que la bisabuela de hace mil años leyera la borra del café: los primeros cafés de Estambul son de 1555, y la práctica no puede ser más vieja que la bebida. La tabla de símbolos, con la serpiente queriendo decir enemistad, se armó en salones británicos entre 1881 y 1922, como juego de té de la tarde.',
    },
    'saturno-mestre': {
      oQueTeContaram: 'Saturno es el gran maestro del zodíaco, el profesor de las lecciones — desde siempre.',
      oQueAFonteDiz:
        'La lectura de Saturno como maestro y maduración es de Liz Greene, 1976. En las fuentes antiguas Saturno es maléfico, y la lectura depende de la secta: Valente anota que los maléficos bien ubicados indican "las mayores posiciones y éxito".',
      fonte: 'Liz Greene, 1976 · contrapunto: Vetio Valente, Antologías, siglo II',
      detalhe:
        'El planeta villano se volvió profesor, y nadie notó el cambio. En las fuentes antiguas Saturno es el maléfico mayor — y Valente incluso anota que, bien ubicado en su propia secta, indica "las mayores posiciones y éxito". El "gran maestro que trae lecciones" es una relectura psicológica publicada por Liz Greene en 1976.',
    },
    'karma-astrologia': {
      oQueTeContaram: 'El karma y las vidas pasadas siempre fueron parte de la astrología.',
      oQueAFonteDiz:
        'No están en Ptolomeo, Valente, Fírmico, Bonatti ni Lilly. Entran a Occidente por la Teosofía, a partir de 1875, importados del vocabulario indio. Y el Nodo Norte como "misión del alma" es de Martin Schulman, 1975.',
      fonte: 'Teosofía, desde 1875 · Martin Schulman, Karmic Astrology, 1975',
      detalhe:
        'La "deuda kármica" de la carta no aparece en ningún autor antiguo — ni en los griegos, ni en los medievales, ni en Lilly. Ese vocabulario entra a la astrología occidental por la Teosofía, fundada en 1875. Y el paquete "Nodo Norte = misión del alma" es de un libro de 1975, de Martin Schulman.',
    },
    'porcentagem-compatibilidade': {
      oQueTeContaram: 'Existe un porcentaje de compatibilidad entre signos — "ustedes tienen un 87% de match".',
      oQueAFonteDiz:
        'El número no existe en fuente alguna — antigua, medieval o renacentista. Revisados Ptolomeo, Doroteo, Māshāʾallāh y Lilly: ninguno. Lo que la tradición tiene es una escala de cuatro peldaños (Tetrabiblos IV.7), y en ella un tercio de los pares de signos es "ajeno".',
      fonte: 'Sin fuente antigua — invención comercial del siglo XX; la escala real: Ptolomeo, Tetrabiblos IV.7, siglo II',
      detalhe:
        'Ese "ustedes combinan 87%" no salió de ningún libro — salió de revistas y de software del siglo pasado. En la fuente antigua la regla es otra y más dura: Ptolomeo ordena las relaciones en cuatro peldaños, y a un tercio de los pares de signos los llama ajenos — ni se ven. La nota baja no vende, y el mercado dejó de mostrarla.',
    },
    'lua-azul': {
      oQueTeContaram: '"Luna Azul" es la segunda luna llena del mes — definición clásica.',
      oQueAFonteDiz:
        "Es un error de lectura documentado: en 1946 el astrónomo aficionado James Hugh Pruett entendió mal la regla del Maine Farmers' Almanac en Sky & Telescope (allí era la tercera llena de una estación con cuatro). La propia revista se corrigió en 1999. Ninguna de las dos definiciones es antigua.",
      fonte: 'Sky & Telescope, James Hugh Pruett, 1946; fe de erratas de la propia revista, 1999',
      detalhe:
        'La definición que todo el mundo repite nació de alguien leyendo mal una revista. En 1946 el astrónomo aficionado Pruett entendió mal la regla del almanaque en Sky & Telescope; NPR la repitió en 1980 y el Trivial Pursuit la cristalizó en 1986. La propia revista publicó la corrección en 1999 — demasiado tarde.',
    },
    'lua-de-sangue': {
      oQueTeContaram: '"Luna de Sangre" es un término bíblico antiguo para los eclipses.',
      oQueAFonteDiz:
        'La imagen existe en Joel 2:31, pero el término como nombre de eclipse es del pastor Mark Biltz (2008) y de John Hagee (Four Blood Moons, 2013). Los astrónomos no lo usan.',
      fonte: 'Mark Biltz, 2008 · John Hagee, Four Blood Moons, 2013',
      detalhe:
        'El nombre que estampa cada titular de eclipse es más nuevo que el iPhone. Como etiqueta de eclipse lunar, "Luna de Sangre" la lanzó un pastor estadounidense en 2008 y se volvió best seller en 2013. La Biblia tiene la imagen poética en Joel — pero no llama así a los eclipses.',
    },
    'mercurio-retrogrado': {
      oQueTeContaram: 'Mercurio retrógrado rompe aparatos, tumba sistemas y hace volver al ex.',
      oQueAFonteDiz:
        'La fuente antigua habla de demora: Valente escribe que el retrógrado "pospone expectativas, acciones y ganancias" y que la segunda estación "cancela la demora". Nada de tecnología, contratos ni ex. La expresión ni siquiera aparece en la prensa general antes de 1996.',
      fonte: 'Vetio Valente, Antologías, siglo II; rastreo de prensa: 1996',
      detalhe:
        'El culpable oficial de la laptop trabada tiene coartada de casi dos mil años. Lo que Valente escribió en el siglo II fue demora: el retrógrado "pospone expectativas, acciones y ganancias" — nada de aparatos, contratos ni ex. La expresión solo llega a la prensa a partir de 1996.',
    },
    'leao-coracao': {
      oQueTeContaram: 'Leo rige el corazón — así está en los textos antiguos.',
      oQueAFonteDiz:
        'En la lista antigua del Hombre Zodiacal (Manilio, Astronomica II), a Leo le tocan los flancos y los omóplatos — el corazón es del Sol, no del signo. La versión "Leo = corazón" imprimible más antigua es la Escala del Doce de Agrippa, 1533.',
      fonte: 'Manilio, Astronomica II.453–465, siglo I · Agrippa, 1533',
      detalhe:
        'Pregunta en cualquier grupo de astrología de dónde viene el "Leo rige el corazón" y nadie señala el libro. En la lista más antigua de cuerpo y signo, Manilio le da a Leo los flancos y los omóplatos — el corazón pertenecía al Sol. La versión popular solo aparece impresa en 1533, en la Escala del Doce de Agrippa.',
    },
    ofiuco: {
      oQueTeContaram: 'Existe un 13.º signo, Ofiuco, que te esconden.',
      oQueAFonteDiz:
        'Signo nunca fue constelación. El zodíaco es de doce partes iguales de 30° desde el siglo V a.C., y Ptolomeo (Tetrabiblos I.22) dice que los signos se cuentan a partir de los equinoccios y solsticios "y de ninguna otra fuente". Los límites de constelación de la IAU son de 1930.',
      fonte: 'Ptolomeo, Tetrabiblos I.22, siglo II · límites de constelación de la IAU, 1930',
      detalhe:
        'Cada tanto vuelve el mismo titular: "la NASA cambió tu signo". Solo que el signo es una tajada de 30° contada desde el equinoccio, no un dibujo de constelación — es así desde hace unos 2.450 años, y Ptolomeo escribió que los signos se cuentan desde los equinoccios "y de ninguna otra fuente". El mapa de constelaciones que aloja a Ofiuco lo dibujó la IAU en 1930, para uso astronómico.',
    },
    'urano-aquario': {
      oQueTeContaram: 'Urano rige Acuario — regencia clásica.',
      oQueAFonteDiz:
        'Urano fue descubierto en 1781. En la tradición, Acuario es domicilio de Saturno (Ptolomeo, Tetrabiblos I.17). La atribución a Urano empieza en 1825 (Smith) y 1828 (Varley) — y en 1834 todavía se discutía.',
      fonte: 'Ptolomeo, Tetrabiblos I.17, siglo II; atribución a Urano: Smith, 1825 / Varley, 1828',
      detalhe:
        'El "regente clásico" de Acuario ni siquiera existía en los mapas hasta hace nada: Urano solo fue descubierto en 1781. En la tradición, Acuario siempre fue casa de Saturno. El cambio empieza alrededor de 1825 — y en 1834 todavía había lectores de almanaque preguntando por qué el planeta nuevo no tenía casa.',
    },
    'estrela-esperanca': {
      oQueTeContaram: 'La carta de la Estrella siempre fue la carta de la esperanza.',
      oQueAFonteDiz:
        'En el manual del propio mazo (Waite, 1911), la primera lectura de la Estrella es "pérdida, robo, privación, abandono" — la esperanza aparece como segunda lectura, "otra versión". La prioridad se invirtió a lo largo del siglo XX.',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'Abre el manual original del mazo más vendido del mundo y busca la Estrella: la primera lectura es "pérdida, robo, privación, abandono". La esperanza está ahí como "otra versión", en segundo lugar. Fue el siglo XX el que ascendió la segunda opción a significado único — siguiendo la imagen, no el texto.',
    },
    'carta-invertida': {
      oQueTeContaram: 'Carta invertida quiere decir bloqueo o negación — lectura tradicional.',
      oQueAFonteDiz:
        'En Waite (1911) la invertida suele ser un significado lateral — a veces mejor que el de la carta derecha: la Rueda de la Fortuna invertida es "aumento, abundancia"; el Emperador invertido es "benevolencia, compasión, crédito". La clave "bloqueo/exceso" es del siglo XX (Gray, Pollack, Greer).',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'Hay cartas que mejoran patas arriba en el manual original: la Rueda de la Fortuna invertida se vuelve "aumento, abundancia", y el Emperador invertido, "benevolencia, compasión". En Waite, 1911, la invertida suele ser un significado lateral — no un defecto de la carta. La regla "invertida = bloqueo" se escribió después, a lo largo del siglo XX.',
    },
    'cruz-celta': {
      oQueTeContaram: 'La Cruz Celta es un método céltico ancestral de tirada.',
      oQueAFonteDiz:
        'El nombre es de Waite, 1911. La estructura viene de círculos de la Golden Dawn de los años 1890 — y Waite dice apenas que la tirada "se ha usado en privado por muchos años".',
      fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'La tirada más famosa del tarot no tiene nada de druida. El nombre "Cruz Celta" se estrena en 1911, en el manual de Waite, y el diseño viene de los círculos ocultistas de Londres de los años 1890. De celta, solo el bautizo.',
    },
    'marselha-o-mais-antigo': {
      oQueTeContaram: 'El Tarot de Marsella es el tarot original, el más antiguo de todos.',
      oQueAFonteDiz:
        'Es un patrón de impresión francés de los siglos XVII–XVIII (Noblet c. 1650, Conver 1760). Los tarots más antiguos son los italianos pintados a mano del siglo XV. Y el nombre "Tarot de Marsella" lo popularizó Paul Marteau, del fabricante Grimaud, en 1930.',
      fonte: 'Patrón francés, siglos XVII–XVIII (Conver, 1760); el nombre: Paul Marteau, Grimaud, 1930',
      detalhe:
        'El "tarot original" es más nuevo que los mazos a los que dice anteceder: los tarots italianos pintados a mano vienen primero, y el patrón de Marsella es impresión francesa de los siglos XVII–XVIII. Hasta el nombre es etiqueta comercial: quien bautizó "Tarot de Marsella" fue el fabricante Paul Marteau, en 1930.',
    },
    'astrologia-5000-anos': {
      oQueTeContaram: 'La astrología tiene 5.000 años.',
      oQueAFonteDiz:
        'Lo que tiene ~4.000 años son presagios de Estado mesopotámicos — otra cosa. El zodíaco tiene ~2.450 años; el horóscopo individual más antiguo es del 410 a.C.; la carta natal con Ascendente y casas tiene ~2.150 años.',
      fonte: 'Horóscopo cuneiforme más antiguo: 410 a.C.; carta natal helenística: c. 150–120 a.C.',
      detalhe:
        'El número redondo duplica la edad real de la cosa. Lo que los babilonios de hace 4.000 años leían era presagio de Estado — lluvia, guerra, rey — y no carta de persona. El primer horóscopo individual conocido es del 410 a.C., y la carta natal con Ascendente y casas tiene unos 2.150 años.',
    },
    'horoscopo-de-jornal': {
      oQueTeContaram: 'El horóscopo diario por signo es el formato clásico de la astrología.',
      oQueAFonteDiz:
        'Tiene fecha de estreno: 24 de agosto de 1930, en el Sunday Express, por R. H. Naylor — sobre el nacimiento de la princesa Margaret. En 1930 el diario tuvo que explicarles a los lectores qué era un horóscopo.',
      fonte: 'R. H. Naylor, Sunday Express, 24/08/1930',
      detalhe:
        'El horóscopo de tu feed tiene fecha de estreno como una telenovela: agosto de 1930, en un diario británico, sobre el nacimiento de una princesa. Era tanta la novedad que el diario tuvo que explicarles a los lectores qué era un horóscopo. En la tradición, lo que describe al individuo es el Ascendente, no el signo solar.',
    },
    'signo-personalidade': {
      oQueTeContaram: '"Aries es impulsivo, Escorpio es intenso" — los antiguos ya los describían así.',
      oQueAFonteDiz:
        'La caracterología por signo solar es del siglo XX: Alan Leo (c. 1895–1910) en adelante, popularizada por Linda Goodman en 1968. En Ptolomeo, el carácter viene de Mercurio y de la Luna (Tetrabiblos III.13) — no existe un capítulo de "doce personalidades".',
      fonte: 'Alan Leo, c. 1895–1910 · Linda Goodman, Sun Signs, 1968 · Ptolomeo, Tetrabiblos III.13, siglo II',
      detalhe:
        'El retrato hablado de tu signo — terco, dramático, soñador — no está en ningún autor antiguo. Ese formato nace con Alan Leo en el cambio al siglo XX y explota con Linda Goodman en 1968. Ptolomeo leía el carácter en Mercurio y en la Luna; y el retrato que Valente hace de los signos es irreconocible para quien lee horóscopos hoy.',
    },
    'numerologia-pitagoras': {
      oQueTeContaram: 'La tabla numerológica A=1, B=2… viene de Pitágoras.',
      oQueAFonteDiz:
        'Pitágoras no dejó ningún escrito, y el alfabeto de 26 letras no es el suyo. La tabla en tres columnas de nueve es rastreable hasta L. Dow Balliett, 1908 — los "números maestros" 11 y 22 también son de ella.',
      fonte: 'L. Dow Balliett, 1908',
      detalhe:
        'El "método de Pitágoras" usa un alfabeto que Pitágoras nunca vio — y él no dejó ningún escrito. La tabla de tres filas con el alfabeto moderno tiene su rastro más antiguo en un libro de 1908, de L. Dow Balliett, junto con los números maestros 11 y 22. De griego, quedó el nombre.',
    },
    'lua-nova-intencoes': {
      oQueTeContaram: 'La Luna Nueva es el momento de sembrar intenciones — ritual ancestral.',
      oQueAFonteDiz:
        'Sembrar DE VERDAD en la luna oscura es fuente primaria: Catón, siglo II a.C., "luna silente". "Sembrar intenciones" es transposición moderna — Jan Spiller, New Moon Astrology, 2001.',
      fonte: 'Catón, De Agri Cultura 40.1, siglo II a.C. · Jan Spiller, New Moon Astrology, 2001',
      detalhe:
        'La parte de sembrar es romana; la parte de la lista de deseos tiene la edad de Windows XP. Catón mandaba sembrar con la luna oscura — siembra de verdad, en el suelo. El cuaderno de intenciones de Luna Nueva es de un libro estadounidense de 2001, de Jan Spiller.',
    },
    'nao-e-previsao': {
      oQueTeContaram: '"No es predicción, son tendencias" — el marco elegante de siempre de la astrología.',
      oQueAFonteDiz:
        'La frase nace de una defensa penal: Alan Leo fue procesado por adivinación en Londres en 1914 y 1917; la tesis de la defensa era que él describía tendencias, no fortunas. Se derrumbó cuando la fiscalía leyó su almanaque prediciendo una muerte en la familia — fue condenado y multado con £5.',
      fonte: 'Procesos de Alan Leo, Londres, 1914 y 1917',
      detalhe:
        'La frase más elegante del mercado nació en un tribunal. Alan Leo, procesado por adivinación en Londres, se defendió diciendo que describía tendencias, no fortunas — la fiscalía leyó en voz alta su almanaque prediciendo una muerte en la familia, y fue condenado en 1917. El mercado entero heredó la frase sin saber de dónde vino.',
    },
  },
};
