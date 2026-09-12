// datos/hechos.es.js
// ESPANHOL dos 22 fatos historicos. Vizinho de datos/hechos.js, um arquivo por
// idioma — mesma forma de datos/textos.es.js e datos/lunacoes.es.js.
//
// ===========================================================================
// ESTE ARQUIVO E O ATIVO MAIS CARO DO APP, E A TRADUCAO PODE ESTRAGA-LO
// ===========================================================================
// O original substitui o "EITA! 92% dos usuarios" do concorrente por um FATO
// HISTORICO VERIFICAVEL, e o contador anima ate um ANO REAL. O eixo que este
// produto ganha do mercado e Confianca, e ele vale enquanto cada linha aguentar
// ser conferida por quem quiser conferir. As cinco regras do cabecalho original
// valem em espanhol com uma virgula a mais:
//   1. Sem fonte solida, NAO inventa. Aqui nao ha fato novo: ha o MESMO fato,
//      dito em espanhol. Nada foi acrescentado e nada foi tirado.
//   2. Onde e interpretacao e nao fato, o `cuerpo` diz isso com todas as letras
//      ("los historiadores relacionan..."; "el baralho nunca dijo eso"). Ver
//      major-06 e major-07, onde a ressalva sobrevive palavra por palavra.
//   3. Nenhum fato fala de desfecho de relacionamento, previsao ou sorte. O
//      fato e sobre o BARALHO, nunca sobre a vida de quem raspou.
//   4. Nada de numero redondo sem fonte. Todo ano citado no `cuerpo` continua
//      aparecendo textualmente na `fuente` da mesma entrada — que NAO muda.
//   5. Zero prova social: nenhuma porcentagem, nenhum contador de gente.
//
// ===========================================================================
// O QUE NAO SE TRADUZ — e aqui a regra e mais dura que nos outros arquivos
// ===========================================================================
//  · `fuente` NAO entra neste arquivo. E o recibo: obra, autor/impressor,
//    cidade e ano. `anios` tambem nao — e numero, e a invariante testada diz
//    que ele aparece textualmente dentro da `fuente`.
//  · AS CITACOES DE WAITE FICAM EM INGLES, exatamente como no original:
//    "Wherever it ought to be put, the Zero is an unnumbered card",
//    "Increase, abundance, superfluity", "End, mortality, destruction,
//    corruption", "Loss, theft, privation, abandonment", "another reading
//    says", "difficulty, doubt, ignorance", "Light, truth, the unravelling of
//    involved matters, public rejoicings", "treason, dissimulation, roguery,
//    corruption", "things connected with churches, religions, sects, the
//    priesthood", "Tzaddi is not the Star". Traduzir uma citacao e
//    FALSIFICA-LA; a traducao vai ao lado, entre travessoes — e e ela que aqui
//    virou espanhol.
//  · Titulos de obra e nomes de autor tambem ficam: The Pictorial Key to the
//    Tarot, Cipher Manuscripts, Book T, Dogme et Rituel de la Haute Magie,
//    Grand Etteilla, A Wicked Pack of Cards, The Book of Thoth, Liber AL vel
//    Legis, The Complete Book of Tarot Reversals, Sefer Yetzirah, The
//    Encyclopedia of Tarot, The Game of Tarot, Minchiate, LE MAT, LE PAPE, LA
//    PAPESSE, LA MAISON DIEU, Ancien Tarot de Marseille, PCS.
//  · Nomes de pessoa nao se traduzem: A. E. Waite, Pamela Colman Smith,
//    Éliphas Lévi, Jean-Baptiste Alliette, Etteilla, Aleister Crowley, Frieda
//    Harris, Gertrude Moakley, Israel Regardie, Nicolas Conver, Paul Marteau,
//    Bonifacio Bembo, Eden Gray, Rachel Pollack, Mary K. Greer, Comte de
//    Mellet, Stuart R. Kaplan, Michael Dummett.
//  · So vira espanhol o que e palavra comum ("edición de", "impreso en") e o
//    exonimo consagrado de cidade: Marsella, Londres, París, Milán, Nueva York,
//    Bérgamo, Chicago, Florencia.
//  · NOMES DAS CARTAS em espanhol no `cuerpo`: El Loco, El Mago, La Sacerdotisa,
//    La Emperatriz, El Emperador, El Hierofante, Los Enamorados, El Carro, La
//    Justicia, El Ermitaño, La Rueda de la Fortuna, La Fuerza, El Colgado, La
//    Muerte, La Templanza, El Diablo, La Torre, La Estrella, La Luna, El Sol,
//    El Juicio, El Mundo. Sao o rotulo que a usuaria ve na propria carta.
//
// FORMA: dicionario plano, 'hecho.<id>.titular' e 'hecho.<id>.cuerpo', com o
// MESMO id do original ('major-00' a 'major-21'). Id nao se traduz: ele e a
// chave do baralho, e mudar um orfana a carta sem levantar erro nenhum.
// ===========================================================================

export const ES = {
  // --- BLOQUE A · verificado por prueba en el Cosmic Guide -----------------
  'hecho.major-00.titular':
    'La carta lleva un 0, y el autor del mazo escribió que no tiene número.',
  'hecho.major-00.cuerpo':
    'Miras El Loco y ves un cero impreso arriba. En el libro que acompaña al mazo, A. E. Waite escribe: "Wherever it ought to be put, the Zero is an unnumbered card" — dondequiera que deba ponerse, el Cero es una carta sin número — y en su lista de significados El Loco aparece después del 20, no antes del 1. '
    + 'En el Tarot de Marsella la carta se llama LE MAT y no lleva ningún número; el "0 al comienzo" es convención de la Golden Dawn, de fines del siglo XIX.',

  'hecho.major-08.titular':
    'Esta carta era la 11. Cambió de número por un motivo astrológico.',
  'hecho.major-08.cuerpo':
    'En los mazos anteriores La Justicia es la 8 y La Fuerza es la 11. El cambio que ves aquí ya estaba en los Cipher Manuscripts de la Golden Dawn antes de que existiera el mazo de 1909: Waite siguió el orden de la orden en que se formó, no lo inventó. '
    + 'El motivo es de tabla y es simple: con Leo en la 8 y Libra en la 11, los doce signos quedan en secuencia zodiacal.',

  'hecho.major-10.titular': 'Invertida, esta carta MEJORA en el texto original.',
  'hecho.major-10.cuerpo':
    'La regla que circula dice que la carta invertida es lo mismo, solo trabado. En el texto de Waite no es así: La Rueda de la Fortuna invertida es "Increase, abundance, superfluity" — aumento, abundancia, exceso. '
    + 'La invertida sistemática, carta por carta, la instituyó Etteilla en el siglo XVIII; la clave "invertida es bloqueo" llegó apenas en el siglo XX, con Eden Gray, Rachel Pollack y Mary K. Greer.',

  'hecho.major-11.titular':
    'Waite eligió una única carta como ejemplo, y el ejemplo era un juicio.',
  'hecho.major-11.cuerpo':
    'La Justicia era la 8 hasta que la Golden Dawn cambió su número con el de La Fuerza, y ese cambio ya estaba en los Cipher Manuscripts, antes del mazo. '
    + 'Es, además, la única carta que Waite nombra al explicar cómo elegir el significador cuando la consulta es sobre un asunto y no sobre una persona: su ejemplo textual es "¿habrá juicio?", y la carta que manda poner sobre la mesa es el triunfo XI. '
    + 'El detalle está en la descripción que hace de la Cruz Celta, que él mismo titula "un antiguo método celta" sin ofrecer una sola prueba de que sea celta ni antiguo.',

  'hecho.major-13.titular': 'La delicadeza con que hoy se lee esta carta es del siglo XX.',
  'hecho.major-13.cuerpo':
    'Cuando sale La Muerte, alguien en la mesa dice "no es muerte literal, es transformación". Esa segunda frase es una elección de lectura del siglo pasado — legítima, y es la que sostiene la lectura de hoy — pero no es lo que está escrito en 1911: la entrada de Waite abre con "End, mortality, destruction, corruption". '
    + 'Decir "la tradición siempre leyó esta carta como transformación" es atribuirle a Waite una delicadeza que fue del siglo siguiente, no de él.',

  'hecho.major-17.titular': 'En 1911 esta era una carta de robo.',
  'hecho.major-17.cuerpo':
    'Sacaste La Estrella y leíste esperanza. El libro que Waite escribió para acompañar el mazo empieza esa entrada por otro lado: "Loss, theft, privation, abandonment" — pérdida, robo, privación, abandono. '
    + 'La esperanza aparece después, presentada como "another reading says". La prioridad entre las dos se invirtió a lo largo del siglo XX, y la lectura de hoy sigue la imagen de Pamela Colman Smith, no la lista de palabras de Waite.',

  // --- BLOQUE B · escrito sobre los documentos de investigación del repo ---
  'hecho.major-01.titular':
    'Esta carta fue la primera letra del alfabeto hebreo durante 34 años.',
  'hecho.major-01.cuerpo':
    'Éliphas Lévi empieza la cuenta en El Mago y le da Aleph, la primera letra, dejando a El Loco sin número entre el Juicio y el Mundo. '
    + 'En 1888 la Golden Dawn adelanta a El Loco, le da Aleph, y a El Mago le toca Beth — con eso todas las letras se desplazan un lugar. '
    + 'Las dos tablas circulan hoy como si fueran una sola, y son incompatibles: quien dice "la correspondencia" está eligiendo un lado sin avisar.',

  'hecho.major-02.titular':
    'La Luna de esta carta la eligió un cartomante que firmaba el apellido al revés.',
  'hecho.major-02.cuerpo':
    'Jean-Baptiste Alliette invirtió su propio apellido y pasó a llamarse Etteilla; en 1789 publicó el Grand Etteilla, el primer mazo dibujado a propósito para la lectura. '
    + 'Fue él quien fijó Sacerdotisa = Luna y Emperatriz = Venus, y la Golden Dawn conservó esas dos cuando armó su tabla un siglo después, descartando el resto de su sistema por incompatible. '
    + 'La atribución no viene de Egipto ni de Jerusalén: viene de un profesional parisino del siglo XVIII que cobraba por consulta.',

  'hecho.major-03.titular':
    'En la lista original, esta carta lee mejor invertida que al derecho.',
  'hecho.major-03.cuerpo':
    'La Emperatriz al derecho, en la lista de Waite, incluye "difficulty, doubt, ignorance" — dificultad, duda, ignorancia. La Emperatriz invertida es "Light, truth, the unravelling of involved matters, public rejoicings": luz, verdad, el desenredo de asuntos enmarañados. '
    + 'O sea, en 1911 la invertida no era la versión trabada de nada, y la clave moderna "invertida = energía bloqueada" es del siglo XX, con autores de nombre conocido: Eden Gray, Rachel Pollack, Mary K. Greer.',

  'hecho.major-04.titular': 'Una sola línea de un libro de 1904 cambió la letra de esta carta.',
  'hecho.major-04.cuerpo':
    'Aleister Crowley leyó en el Liber AL vel Legis I:57 la frase "Tzaddi is not the Star" y concluyó que dos triunfos habían cambiado de letra. '
    + 'En The Book of Thoth, de 1944, El Emperador pasa a ser Tzaddi y La Estrella pasa a ser Heh; los signos no se mueven — Aries sigue en el Emperador y Acuario en la Estrella — lo que se mueve son las letras y, con ellas, los caminos. '
    + 'Quien lee con el mazo de Crowley hereda ese cambio; quien lee con el de 1909, no. Son dos sistemas, no uno.',

  'hecho.major-07.titular':
    'Existe una tesis de que este carro es, literalmente, un carro alegórico de desfile.',
  'hecho.major-07.cuerpo':
    'Gertrude Moakley propuso en 1966 que los 22 triunfos son el programa visual de los desfiles triunfales italianos y de los Triumphi de Petrarca: carros alegóricos que cruzaban la ciudad en fiesta, cada uno venciendo al anterior. '
    + 'La palabra trionfo, de donde sale "triunfo", nombraba el desfile antes de nombrar el juego. '
    + 'Cuidado con el grado: los historiadores relacionan la carta con esos desfiles y la tesis es influyente, pero no es consenso — el mazo nunca dijo eso, y ningún documento del siglo XV lo confirma.',

  'hecho.major-09.titular': 'En la lista de 1911, la primera palabra de esta carta es "traición".',
  'hecho.major-09.cuerpo':
    'El significado al derecho de El Ermitaño en el libro de Waite incluye "treason, dissimulation, roguery, corruption" — traición, disimulo, picardía, corrupción. '
    + 'La lectura de hoy, la del recogimiento y la lámpara que ilumina el propio camino, sigue la imagen de Pamela Colman Smith y no esa lista. '
    + 'Las dos mitades del mazo no cuentan la misma historia: las listas de palabras descienden de la cartomancia francesa, y las imágenes cargan simbolismo de la Golden Dawn.',

  'hecho.major-12.titular':
    'Solo tres cartas del mazo llevan una letra "madre". Esta es una de ellas.',
  'hecho.major-12.cuerpo':
    'El Sefer Yetzirah, texto del primer milenio, divide el alfabeto hebreo en 3 madres, 7 dobles y 12 simples. Cuando la Golden Dawn encajó los triunfos en esa grilla, las tres madres cayeron en El Loco (Aleph, aire), El Colgado (Mem, agua) y El Juicio (Shin, fuego); Israel Regardie publicó ese material a partir de 1937 y solo ahí pudo leerse fuera de la orden. '
    + 'Muchas tablas que circulan hoy traen esa columna mal: si una llama "madre" a Beth, Guímel o Dálet, está corrompida.',

  'hecho.major-14.titular': 'De las cuatro virtudes cardinales, en este mazo falta una.',
  'hecho.major-14.cuerpo':
    'La Templanza, La Fuerza y La Justicia están entre los triunfos; la Prudencia no. Sí está en la Minchiate florentina del siglo XVI, un tarot de 97 cartas donde además desfilan los doce signos y los cuatro elementos — o sea, la ausencia es decisión de fabricante, no enigma. '
    + 'Detalle de la misma carta: en la lista de Waite, la Templanza invertida es "things connected with churches, religions, sects, the priesthood".',

  'hecho.major-20.titular':
    'En el sistema francés, El Loco se sienta exactamente entre esta carta y El Mundo.',
  'hecho.major-20.cuerpo':
    'Éliphas Lévi ordenó los triunfos con El Mago al frente y dejó a El Loco sin número, metido entre El Juicio (XX) y El Mundo (XXI). Con ese arreglo El Juicio recibe la letra Resh; en la tabla de la Golden Dawn, tres décadas después, El Juicio recibe Shin y El Loco se va al comienzo. '
    + 'Hay tres lugares posibles para una carta sin número, y la historia usó los tres: el Comte de Mellet la puso al final en 1781, Lévi en el penúltimo hueco, la Golden Dawn al frente.',

  'hecho.major-21.titular': 'Es el único triunfo en que las dos escuelas rivales concuerdan.',
  'hecho.major-21.cuerpo':
    'La tabla de Lévi y la de la Golden Dawn están desplazadas una casilla entera: donde una pone Aleph la otra pone Beth, y así hasta el final. '
    + 'La única carta que recibe la misma letra en las dos es El Mundo, que es Tav en ambas — la última letra, en la última carta. '
    + 'La coincidencia es aritmética y no mística: es lo que sobra cuando dos sistemas empiezan distinto y terminan en el mismo lugar.',

  // --- BLOQUE C · hecho general documentado, a falta de hecho de la carta --
  'hecho.major-05.titular':
    'Durante más de cuatro siglos esta carta se llamó, sin rodeos, "El Papa".',
  'hecho.major-05.cuerpo':
    'En los triunfos italianos del siglo XV y en el patrón de Marsella la carta trae impreso LE PAPE, y su pareja, la número 2, LA PAPESSE. Son dos de las "condiciones de vida" que desfilan en la serie, al lado del Emperador y la Emperatriz. '
    + 'Los nombres Hierofante y Sacerdotisa aparecen en el mazo publicado en Londres en diciembre de 1909: son un cambio de rótulo de poco más de un siglo, no un nombre antiguo.',

  'hecho.major-06.titular':
    'La escena que conoces tiene poco más de un siglo. La anterior era otra cosa.',
  'hecho.major-06.cuerpo':
    'En el patrón de Marsella la carta muestra a un joven entre dos figuras, con un arquero apuntando desde arriba: una escena de elección, no de pareja. '
    + 'La versión que se volvió estándar — dos figuras desnudas, un ángel, dos árboles — es la que Pamela Colman Smith dibujó para el mazo de 1909, y se volvió estándar porque ese mazo se volvió estándar. '
    + 'Los historiadores relacionan la escena antigua con el motivo de la encrucijada moral; el mazo nunca dijo eso, y esa parte es interpretación.',

  'hecho.major-15.titular': 'En el tarot pintado más antiguo que sobrevivió, esta carta no está.',
  'hecho.major-15.cuerpo':
    'Los mazos Visconti-Sforza, pintados a mano con pan de oro en Milán hacia 1441–1451, son los tarots más viejos que llegaron hasta hoy — y llegaron incompletos: al conjunto que hoy se reparte entre la Morgan Library y la Accademia Carrara le faltan justamente El Diablo y La Torre. '
    + 'Los catálogos no deciden si se perdieron o si nunca llegaron a pintarse. Cualquier afirmación sobre "el Diablo original" del siglo XV se hace sobre una carta que nadie tiene delante de los ojos.',

  'hecho.major-16.titular': 'En el mazo de Marsella esta carta se llama "La Casa de Dios".',
  'hecho.major-16.cuerpo':
    'El tarot de Nicolas Conver, impreso en Marsella en 1760, titula la carta LA MAISON DIEU: la casa de Dios, no una torre. El nombre "La Torre" es el del mazo londinense de 1909. '
    + 'Y el patrón entero se llama "de Marsella" mucho después de existir: quien lo popularizó fue Paul Marteau con la fábrica Grimaud, en 1930, fijando colores y dibujo a partir del Conver.',

  'hecho.major-18.titular':
    'El crustáceo que sale del agua ya estaba en los mazos franceses del siglo XVIII.',
  'hecho.major-18.cuerpo':
    'Dos torres, dos animales aullando y un crustáceo saliendo del lago: la escena está en el patrón de Marsella mucho antes de 1909, y Pamela Colman Smith la mantuvo casi entera al redibujar el mazo. '
    + 'Es una de las pocas cartas en que la continuidad visual entre los dos mazos se ve a ojo desnudo. Lo que cambió no fue el dibujo: fue el sistema de lectura colgado encima de él, armado entre 1781 y 1911.',

  'hecho.major-19.titular':
    'Hay una firma escondida en las 78 cartas, y son solo tres letras.',
  'hecho.major-19.cuerpo':
    'En una esquina de cada escena está el monograma PCS: es Pamela Colman Smith (1878–1951), la ilustradora que dibujó las 78 a partir de indicaciones de A. E. Waite, sin bocetos de él. '
    + 'Su nombre quedó fuera del título del mazo durante décadas, y por eso lo correcto es decir Rider-Waite-Smith, y no Rider-Waite. '
    + 'Este dato no es exclusivo de El Sol: vale para las 78 cartas, y es lo que más se omite cuando se cuenta de dónde salió este mazo.',
};

export default ES;
