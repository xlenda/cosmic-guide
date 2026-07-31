// lib/traducoes/jornada.es.js
// PACK DE TEXTOS da Jornada Guiada em ESPAÑOL NEUTRO LATINO.
//
// Regras deste arquivo (as mesmas do PT, ver o cabeçalho de lib/jornada.js):
//   · tradução de SENTIDO, não literal — prende primeiro, recibo no fim;
//   · NÃO se traduz: nome de obra e locus (Tetrabiblos I.8, Naturalis
//     Historia XVIII.321), verbatim latino (luna silente, interlunium),
//     números e datas. Nome próprio consagrado TRADUZ (Ptolomeu → Ptolomeo,
//     Catão → Catón el Viejo);
//   · o verbatim de Robbins fica em INGLÊS como citação, com paráfrase em
//     espanhol ao lado — traduzir citação é falsificá-la;
//   · linha vermelha: nada de aliviar/calmar/sanar/curar/tratar/energizar,
//     nada de promessa de resultado, nada de prova social inventada.
//     test/jornadaIdiomas.test.js varre este arquivo inteiro e morde;
//   · MESMA FORMA do pack pt derivado (packDeTextos em lib/jornada.js):
//     mesmas chaves, `acao` é a STRING do texto (a feature fica no motor).
//
// Terminologia herdada de lib/i18n.js (bloco JORNADA_I18N, es): sendero,
// Camino, Carta Natal, Calendario Lunar, Sonido del Cielo, Asentar,
// Diario Cósmico, Tarot, "Recibo:".
export default {
  trilhas: {
    luaSeteDias: {
      nome: '7 días de Luna',
      subtitulo: 'Lo que la labranza antigua hacía en cada fase — y lo que es invento de ayer',
      dias: {
        1: {
          titulo: 'La luna que nadie ve',
          leitura:
            'La Luna Nueva es la única fase que no se ve. Está allá arriba, al lado del Sol, con la cara oscura vuelta hacia nosotros. Los romanos la llamaban luna silente — la luna callada. Y justo ahí era cuando se plantaba: higuera, manzano, olivo, peral y vid, al caer la tarde. La lógica es de campo, no de misterio — lo que va a crecer entra en la tierra cuando la Luna va a crecer con él. ' +
            'Recibo: Catón el Viejo, De Agri Cultura 40.1, siglo II a.C.',
          pergunta: '¿Qué estás empezando ahora que todavía no puedes mostrarle a nadie?',
          acao: 'Abre el Calendario Lunar y mira en qué fase está la Luna hoy de verdad.',
        },
        2: {
          titulo: 'La regla que resume mil años',
          leitura:
            'Si te vas a quedar con una sola frase de este sendero, que sea esta: en el campo antiguo, lo que se quería ver crecer iba a la tierra con la Luna creciendo, y lo que se quería secar o achicar se hacía en menguante. Es lo que decía tu abuela, y tiene versión en latín escrita mucho antes: omnia quae seruntur crescente luna — todo lo que se siembra debe sembrarse con la luna creciendo. Una sola regla, aplicada al año entero del campo — y habla de semilla, madera y lana, no de asuntos de gente: estirar la regla hacia tu propia vida es práctica popular contemporánea, sin fuente antigua localizada. ' +
            'Recibo: Paladio, Opus Agriculturae I.6.12, siglos IV–V d.C.',
          pergunta: '¿Hay algo en tu vida hoy que toca hacer crecer, y otra cosa que toca reducir? ¿Cuáles?',
          acao: 'Escribe en el Diario Cósmico una cosa que quieras aumentar y una que quieras reducir.',
        },
        3: {
          titulo: 'La mitad encendida',
          leitura:
            'El Cuarto Creciente es la Luna cortada por la mitad en el cielo. Y aquí va una corrección que casi ninguna app hace: la división antigua de la Luna es en CUATRO partes, no en ocho. Ptolomeo describe los cuatro cuartos y le da una cualidad a cada uno — de la nueva al cuarto creciente, más húmedo; del cuarto a la llena, más caliente; de la llena al menguante, más seco; del menguante a la desaparición, más frío. ¿Las ocho fases con nombre psicológico? Esas son de 1967, y el autor tiene nombre. ' +
            'Recibo: Ptolomeo, Tetrabiblos I.8, siglo II d.C.; las ocho fases psicológicas son de Dane Rudhyar, The Lunation Cycle, 1967.',
          pergunta: '¿En qué punto del camino estás: al principio, a la mitad, o ya de vuelta?',
          acao: 'En el Calendario Lunar, busca la fecha del próximo cuarto — y fíjate en que es una hora exacta, no un día entero.',
        },
        4: {
          titulo: 'La noche que engaña',
          leitura:
            'La Luna Llena parece llena unas tres noches seguidas, pero llena de verdad lo es un solo instante — el momento en que queda a 180 grados del Sol. Por eso el almanaque no coincide con la app: uno etiqueta por franja, la otra por el instante. Y va una sorpresa: en la llena, la fuente romana manda SEMBRAR habas, no cosechar. Cosechar para guardar es cosa de la menguante. De regalo, dos nombres que suenan antiguos y no lo son: la primera lista impresa de nombres de luna es de 1918, el Maine Farmers\' Almanac publicó las suyas en los años 1930 y el Old Farmer\'s Almanac lo redujo todo a un nombre por mes; y "superluna" se acuñó en 1979. ' +
            'Recibo: Columela, De Re Rustica XI.2.85, siglo I d.C.; primera lista impresa en Daniel Carter Beard, 1918; listas del Maine Farmers\' Almanac, años 1930; simplificación del Old Farmer\'s Almanac, siglo XX; "superluna" por Richard Nolle, 1979.',
          pergunta: '¿Qué cosa en tu vida parece estar en su punto más alto, aunque sabes que todavía se está sembrando?',
          acao: 'Deja sonar el Sonido del Cielo por tres minutos mientras relees el párrafo de hoy.',
        },
        5: {
          titulo: 'Lo que se corta, se cosecha y se esquila',
          leitura:
            'La Luna empezó a menguar. En el campo antiguo, es ahora cuando se toca todo lo que necesita secarse sin pudrirse. Plinio escribió la regla en una sola línea: omnia quae caeduntur, carpuntur, tondentur, innocentius decrescente luna — todo lo que se corta, se cosecha y se esquila sufre menos daño con la luna menguante. Fíjate en lo modesta que es su promesa: no es que quede mejor, es que se estropea menos. ' +
            'Recibo: Plinio el Viejo, Naturalis Historia XVIII.321, siglo I d.C.',
          pergunta: '¿Qué cosechaste ya este mes sin detenerte a notar que lo cosechaste?',
          acao: 'Saca una carta en el Tarot pensando en lo que ya está listo para cerrarse.',
        },
        6: {
          titulo: 'Madera, estiércol y el silencio del fin de mes',
          leitura:
            'El fin del mes lunar era la temporada de los trabajos pesados y sin público: cortar madera, esparcir estiércol, desmalezar. Para la madera, Plinio da la ventana con precisión de artesano — entre el vigésimo y el trigésimo día de la Luna, y el punto justo es el interlunium, la luna oscura; Columela repite la misma franja. El estiércol y el desmalezado son otra rúbrica, con otra dirección, y por eso llevan recibo propio. Nada de esto luce para publicar, y justo por eso sobrevivió: era trabajo que daba resultado material, y por eso alguien lo anotó. ' +
            'Recibo: para la madera, Plinio el Viejo, Naturalis Historia XVI.190–191, siglo I d.C., y Columela, De Re Rustica XI.2.11, siglo I d.C.; para el estiércol y el desmalezado, Plinio el Viejo, Naturalis Historia XVIII.322, siglo I d.C., y Columela, De Re Rustica II.5.1, siglo I d.C.',
          pergunta: '¿Cuál es tu trabajo de luna oscura — ese que nadie ve y que sostiene todo lo demás?',
          acao: 'Haz un ciclo de respiración en Asentar antes de cerrar la app hoy.',
        },
        7: {
          titulo: 'El calendario que llegó antes que las fases',
          leitura:
            'El sendero cierra con la parte que casi todo el mundo se salta. Antes de que existiera la "Gibosa Creciente", existía la cuenta: primer día de la Luna, segundo, tercero, hasta el trigésimo. Hesíodo tiene un calendario día por día — el cuarto y el séptimo son sagrados. Virgilio manda huir del quinto y dice que el decimoséptimo es feliz para plantar la vid y domar bueyes. O sea: el esquema antiguo es de DÍAS NUMERADOS, no de ocho fases con nombre. Quien traspone uno al otro está inventando una equivalencia que la fuente no hace — y ahora tú lo sabes antes que todo el mundo. ' +
            'Recibo: Hesíodo, Los trabajos y los días, vv. 765–828, siglo VII a.C.; Virgilio, Geórgicas I.276–286, siglo I a.C.',
          pergunta: 'Después de estos siete días, ¿qué miras distinto en el cielo?',
          acao: 'Vuelve al Calendario Lunar y revisa cuántos días faltan para la próxima Luna Nueva.',
        },
      },
    },

    mapaSeteDias: {
      nome: 'Conoce tu Carta',
      subtitulo: 'Sol, Luna, Ascendente y casas — qué es cálculo y qué es opinión de alguien',
      dias: {
        1: {
          titulo: 'Tu Sol no es una fecha',
          leitura:
            'Todo el mundo sabe su signo solar, y casi todo el mundo aprendió mal cómo funciona. El signo del Sol no es una franja de calendario: es dónde estaba el Sol, en grados, en el instante en que naciste. Y los signos empiezan en los equinoccios y solsticios, que son INSTANTES — no los días 21 de cada mes. Quien nació cerca del cambio puede llevar el signo equivocado toda la vida por eso. Por eso esta app te pide tu fecha de nacimiento en vez de preguntarte el signo: el cálculo acierta más que la memoria. ' +
            'Recibo: Ptolomeo, Tetrabiblos I.22, siglo II d.C.',
          pergunta: '¿Alguna vez dudaste de tu signo? ¿Qué te hizo dudar?',
          acao: 'Abre la Carta Natal y revisa que tu fecha y hora de nacimiento estén bien.',
        },
        2: {
          titulo: 'La Luna cambia de signo cada dos días y medio',
          leitura:
            'El Sol tarda un mes en cruzar un signo. La Luna tarda dos días y medio. Eso lo cambia todo a la hora de leer una carta: la Luna es la pieza que más depende de saber la hora exacta, y la que más separa a dos hermanos nacidos en la misma semana. Un detalle bonito de los griegos: al tercer lugar de la carta lo llamaban "la Diosa", que era la Luna, y al noveno "el Dios", que era el Sol. Los dos luminares — Sol y Luna, las dos luces de la carta — tenían cada uno su casa preferida, y de ahí vino parte de los nombres que usamos hasta hoy. ' +
            'Recibo: nombres griegos de los lugares en la nota 56 de F. E. Robbins al Tetrabiblos, Loeb, 1940.',
          pergunta: '¿Quién de tu familia tiene la fecha de nacimiento más cercana a la tuya? ¿En qué son distintos?',
          acao: 'En la Carta Natal, encuentra la posición de tu Luna y anota su signo.',
        },
        3: {
          titulo: 'El Ascendente es el timón',
          leitura:
            'El Ascendente es el grado que subía por el horizonte este a la hora exacta en que naciste, en el lugar exacto donde naciste. Cambia más o menos cada dos horas — con hora adivinada es casi cara o cruz entre dos signos. Y no es "cómo te ve el mundo": esa es lectura moderna. En la fuente antigua es el origen y el fundamento de toda la carta, el punto desde donde se cuenta todo lo demás. Pablo de Alejandría usa una palabra griega hermosa para eso: oíax, el timón. ' +
            'Recibo: Pablo de Alejandría, Introductory Matters, cap. 24, 378 d.C.; Fírmico Materno, Mathesis II, 19.2, c. 335 d.C.',
          pergunta: '¿Sabes la hora exacta de tu nacimiento? ¿Quién podría confirmártela hoy?',
          acao: 'Completa la hora y la ciudad en la Carta Natal — sin las dos, el Ascendente no se calcula.',
        },
        4: {
          titulo: 'Las cuatro esquinas del cielo',
          leitura:
            'Cuatro puntos sostienen la carta: lo que sube por el este, lo que baja por el oeste, lo más alto del cielo y el punto opuesto abajo. Los griegos los llamaban kentra, los pivotes. Ahora el dato que cambia tu confianza en cualquier carta de colores de internet: de la Antigüedad sobreviven unas trescientas cartas, y solo treinta y dos traen el medio cielo. Las cúspides intermedias — esas doce líneas que las apps dibujan — aparecen en DOS. No es que los antiguos no supieran calcularlas: es que el sistema que usaban no las necesitaba. ' +
            'Recibo: relevamiento de Robert Hand, 2007, sobre los papiros de Oxirrinco y el corpus de Neugebauer & van Hoesen.',
          pergunta: '¿Qué está hoy en el punto más alto de tu vida, a la vista de todos?',
          acao: 'En la Carta Natal, ubica el Ascendente y el Medio Cielo y mira en qué signos caen.',
        },
        5: {
          titulo: 'Las casas tenían nombre, y el nombre tenía opinión',
          leitura:
            'Hoy se dice "casa 2, de los recursos" y "casa 8, de la transformación", todo neutro y ordenadito. Los nombres originales no tenían nada de neutros. La segunda era la Puerta del Hades. La quinta, Buena Fortuna; la sexta, Mala Fortuna. La octava, Comienzo de la Muerte. La undécima, Buen Daimon; la duodécima, Mal Daimon — el daimon era el espíritu que acompaña a la persona, más o menos su ángel de la guarda. Siete de los doce nombres son juicio de valor, no tema. La astrología moderna borró esa capa entera y no le avisó a nadie — y la carta antigua era un mapa moral del cielo, no un formulario. ' +
            'Recibo: nombres griegos en la nota 56 de F. E. Robbins, Loeb, 1940; nombres latinos en Fírmico Materno, Mathesis II.XVI–XX, siglo IV d.C.',
          pergunta: '¿Cuál de esos nombres antiguos te incomodó más? ¿Por qué?',
          acao: 'Escribe en el Diario Cósmico cuál de los doce nombres griegos crees que describe tu año.',
        },
        6: {
          titulo: 'No todos los antiguos estaban de acuerdo',
          leitura:
            'Aquí va lo que el mercado esconde y que vuelve el tema más interesante: los antiguos discutían entre ellos. Vetio Valente, que representa la práctica corriente del siglo II, usa técnicas que Ptolomeo simplemente ignora — y Ptolomeo, que es el más citado hoy, era en realidad un reformador que podó parte de la tradición que recibió. Cuando alguien diga "los antiguos enseñaban", pregunta cuál antiguo. Casi siempre la respuesta es: uno de ellos, y no necesariamente la mayoría. ' +
            'Recibo: Vetio Valente, Antologías, Libro II caps. 4–16, c. 150–175 d.C.',
          pergunta: '¿En qué parte de tu vida aceptaste una versión única de una historia que tenía más de un lado?',
          acao: 'Saca una carta en el Tarot y escribe DOS lecturas distintas de ella.',
        },
        7: {
          titulo: '¿Qué sistema de casas? La pregunta que casi nadie hace',
          leitura:
            'Dos cartas del mismo nacimiento pueden no coincidir en las casas, y ninguna de las dos está defectuosa — usan reglas de medir distintas. En la Antigüedad la regla era simple: el signo donde cae el Ascendente es la casa 1 entera, el siguiente es la casa 2, y listo. Es lo que Pablo de Alejandría describe, doce veces, con todas las letras. El sistema que hoy es estándar es otro, publicado mucho después, y el método ni siquiera es del autor cuyo nombre lleva. Saber qué regla usa tu carta es más útil que cualquier interpretación. ' +
            'Recibo: Pablo de Alejandría, Introductory Matters, cap. 24, 378 d.C.; publicación del Placidus en 1650, con el método atribuido a Giovanni Antonio Magini (1555–1617).',
          pergunta: 'Después de esta semana, ¿qué quieres revisar sin prisa en tu carta?',
          acao: 'Abre la Carta Natal una última vez y lee la nota sobre qué sistema de casas usa.',
        },
      },
    },

    taroVinteDois: {
      nome: 'Las 22 del Tarot',
      subtitulo: 'Las 22 cartas figuradas del tarot — y la edad real de cada historia que te contaron sobre ellas',
      dias: {
        1: {
          titulo: 'Antes de adivinar, era juego',
          leitura:
            'El tarot nació como baraja de juego en la Italia del Renacimiento — un juego de bazas, la misma familia que el truco o la brisca, donde cada ronda tiene un ganador, con palos y una quinta serie de cartas que valía más que todas: los triunfos. Son 22, y no eran símbolos secretos: eran una galería de figuras que cualquier persona culta de la época reconocía. La primera lista completa de los 22, en orden, aparece en un sermón de un predicador dominico que estaba maldiciendo el juego — lista las cartas para decir que eran cosa del diablo, y sin querer nos dejó el documento. ' +
            'Recibo: Sermón Steele, c. 1470–1500.',
          pergunta: '¿Qué cosa de tu vida hoy se toma demasiado en serio y empezó como un juego?',
          acao: 'Abre el Tarot y mira los 22 arcanos mayores en orden, sin sacar ninguna carta.',
        },
        2: {
          titulo: 'El día en que el tarot se volvió egipcio',
          leitura:
            'La historia de Egipto tiene autor, editorial y año. Un erudito francés se topó con el tarot en una reunión social en París, decidió en el acto que aquello era un libro sagrado egipcio salvado del incendio de Alejandría, y lo publicó. El detalle que lo derrumba todo: escribió eso en 1781, y nadie en el mundo sabía leer jeroglíficos en ese momento. La Piedra de Rosetta no apareció hasta 1799, y Champollion no descifró la escritura hasta 1822. Afirmó el contenido de textos que era literalmente imposible leer. ' +
            'Recibo: Antoine Court de Gébelin, Le Monde primitif, vol. VIII, 1781; Champollion descifra el jeroglífico en 1822.',
          pergunta: '¿Qué historia repites hace años sin haberla revisado nunca en el origen?',
          acao: 'En el Tarot, elige una carta y lee su ficha hasta el final — incluida la datación.',
        },
        3: {
          titulo: 'Quién inventó la profesión',
          leitura:
            'Dos años después del Egipto imaginario, un peluquero y vendedor de semillas de París hizo algo mucho más concreto: convirtió el tarot en método. Significado fijo para cada carta, significado distinto cuando sale invertida, posición en la mesa que cambia la lectura. En 1789 publicó la primera baraja del mundo diseñada específicamente para adivinar — antes de eso, toda baraja de tarot era baraja de juego adaptada. La cartomancia con tarot, como profesión, tiene esa edad. ' +
            'Recibo: Jean-Baptiste Alliette, "Etteilla" — primer manual con invertidas en 1770, Grand Etteilla en 1789.',
          pergunta: '¿Qué haces hoy que alguien tuvo que inventar desde cero en un año específico?',
          acao: 'Saca tres cartas en el Tarot y fíjate en cómo la posición de cada una cambia lo que dice.',
        },
        4: {
          titulo: 'El truco de las tres madres',
          leitura:
            'Seguro escuchaste que los 22 arcanos corresponden a las 22 letras hebreas, y que eso prueba antigüedad. Prueba lo contrario: la asociación es del mismo volumen francés de 1781, hecha por otro autor del grupo. Lo que sí existe es un texto hebreo que divide las 22 letras en tres "madres", siete "dobles" y doce "simples". Las tres madres son Álef, Mem y Shin — el Loco, el Colgado y el Juicio. Si alguna tabla llama madre a Bet o a Guímel, está corrompida, y ahora sabes revisarlo. ' +
            'Recibo: Comte de Mellet, en Le Monde primitif, vol. VIII, 1781; la división de las letras viene del Sepher Yetzirah.',
          pergunta: '¿Dónde aceptaste ya el "es antiguo" como si fuera un argumento?',
          acao: 'Busca el Loco, el Colgado y el Juicio en el Tarot y mira los tres uno al lado del otro.',
        },
        5: {
          titulo: 'Los doce signos, en orden, dentro de la baraja',
          leitura:
            'Aquí la cosa se pone elegante. Encajando los 22 triunfos en la cuadrícula de las letras, los doce signos caen en orden zodiacal perfecto: el Emperador es Aries, el Hierofante es Tauro, los Enamorados son Géminis, el Carro es Cáncer, la Fuerza es Leo, el Ermitaño es Virgo, la Justicia es Libra, la Muerte es Escorpio, la Templanza es Sagitario, el Diablo es Capricornio, la Estrella es Acuario y la Luna es Piscis. Y el famoso intercambio entre la Fuerza y la Justicia no fue capricho de Waite: sin él, Leo y Libra quedaban fuera de orden. ' +
            'Recibo: Book T y los Cipher Manuscripts de la Golden Dawn, fines del siglo XIX.',
          pergunta: '¿Cuál de esas doce cartas corresponde a tu signo solar? ¿Qué te parece el encuentro?',
          acao: 'Abre el Tarot en la carta de tu signo y compárala con lo que leíste en tu Carta Natal.',
        },
        6: {
          titulo: 'La baraja que conoces tiene dirección',
          leitura:
            'Esas imágenes que todo el mundo reconoce — escenas con personas en todas las cartas, incluidas las numeradas — salieron de una baraja publicada en Londres en diciembre de 1909. El arte es de Pamela Colman Smith, una ilustradora que pasó décadas acreditada solo por sus iniciales. La estructura es de A. E. Waite, y el libro que lo explica todo salió en 1911. Cuando alguien te diga que el dibujo tiene milenios, tú tienes la fecha, la ciudad y la editorial. ' +
            'Recibo: baraja publicada por William Rider & Son, Londres, diciembre de 1909, arte de Pamela Colman Smith (1878–1951); The Pictorial Key to the Tarot, A. E. Waite, 1911.',
          pergunta: '¿Quién hizo algo importante en tu vida y se quedó sin el crédito?',
          acao: 'Saca una carta en el Tarot y fíjate en cuántas personas y objetos caben en el dibujo.',
        },
        7: {
          titulo: 'La Cruz Celta no es celta',
          leitura:
            'La tirada más famosa del mundo — esa de diez cartas en cruz con una columna al lado — fue bautizada "método antiguo celta de adivinación" por el propio Waite, en el libro de 1911. De celta no tiene nada: no existe ninguna evidencia celta, ni atestación anterior a la Golden Dawn de los años 1890. ¿Por qué "celta", entonces? Circula la tesis de que el nombre vino de la ola del renacimiento literario irlandés en Londres — es plausible, circula mucho, y nadie encontró una fuente primaria que lo compruebe. Queda como hipótesis, no como causa. La tirada es buena, sigue siendo buena, y puedes usarla cuanto quieras — solo que ahora sabiendo que tiene la edad de tu bisabuela, no la de los druidas. ' +
            'Recibo: A. E. Waite, The Pictorial Key to the Tarot, "An Ancient Celtic Method of Divination", 1911.',
          pergunta: 'Después de esta semana, ¿qué cambió en tu manera de mirar una carta?',
          acao: 'Haz una tirada en el Tarot y escribe en el Diario Cósmico lo que viste, sin buscar un significado ya hecho.',
        },
      },
    },

    ceuDosAntigos: {
      nome: 'El Cielo de los Antiguos',
      subtitulo: 'Qué se puede medir, qué es atribuido — y por qué importa la diferencia',
      dias: {
        1: {
          titulo: 'Dos capas, nunca una sola',
          leitura:
            'Hay dos cosas muy distintas dentro de una carta astral, y toda app las mezcla. Una es cálculo: dónde estaba el Sol, en grados, el día en que naciste — se puede errar y se puede probar que se erró. La otra es lo que la cultura fue colgando encima: "los Libra son diplomáticos". Puede ser bonita y vieja, pero no es del mismo tipo. Esta app separa las dos. No es manía de rigor: fue exactamente aquí donde tuvo el peor bug de su historia, decidiendo el signo por tabla de calendario en vez de por cuenta de cielo. ' +
            'Recibo: Ptolomeo, Tetrabiblos I.22, siglo II d.C. — los signos empiezan en los equinoccios y solsticios, que son instantes.',
          pergunta: '¿Qué cosa que repites sobre ti es medida, y cuál es atribuida?',
          acao: 'Abre la Carta Natal y fíjate en qué números son calculados y qué textos son interpretación.',
        },
        2: {
          titulo: 'La fundación ya era un seudónimo',
          leitura:
            'Esta es la mejor historia de toda la investigación. Los textos que fundan la carta natal como sistema circulan bajo los nombres de un faraón y de un sacerdote egipcios. Los dos son seudónimos. Quienes escribieron fueron autores griegos en Alejandría, hacia 150 a 120 antes de Cristo, dándole pedigrí egipcio a un texto que estaban escribiendo en ese mismo instante. O sea: inventar antigüedad no es la corrupción de la tradición — es un rasgo de ella, presente desde el primer día. ' +
            'Recibo: textos atribuidos a Nechepso y Petosiris, seudónimos usados por autores griegos en Alejandría, 150–120 a.C.',
          pergunta: '¿Qué autoridad le prestaste alguna vez a una idea tuya para que la tomaran en serio?',
          acao: 'Escribe en el Diario Cósmico una creencia tuya e intenta recordar quién te la contó.',
        },
        3: {
          titulo: 'La tradición peleaba consigo misma',
          leitura:
            '"Saber milenario" es una expresión que aplana cuatro mil años de gente en desacuerdo. Ptolomeo escribe contra prácticas babilónicas. Valente usa técnicas que Ptolomeo ignora. Y hubo quien escribió un libro entero llamado Contra los astrólogos — y ese autor es fuente primaria tanto como los otros. Mostrar el desacuerdo parece debilidad, pero es lo contrario: quiere decir que ahí hay un tema de verdad, con literatura y controversia, y no un texto de galleta de la fortuna. ' +
            'Recibo: Sexto Empírico, Contra los astrólogos, siglo III.',
          pergunta: '¿En qué tema cambiaste de lado después de escuchar a la otra parte?',
          acao: 'Haz un ciclo en Asentar y pasa esos minutos con la idea de que estar en desacuerdo no es un defecto.',
        },
        4: {
          titulo: 'Lo nuevo vestido de viejo',
          leitura:
            'Haz la prueba con cualquier cosa que te vendan como ancestral: busca la primera vez que alguien la escribió. "Superluna" tiene 1979 y tiene autor. Los nombres de las lunas llenas — del Lobo, de la Fresa — vienen de listas publicadas en el siglo XX: la primera impresa es de 1918, el Maine Farmers\' Almanac publicó las suyas en los años 1930 y el Old Farmer\'s Almanac lo redujo todo a un nombre por mes. Esas listas mezclan orígenes algonquinos, ingleses coloniales, celtas y neopaganos, y la evaluación corriente es que la alegación de origen indígena es "parcialmente verdadera" — ni sello ancestral, ni invento de la nada. Nada de eso tiene que salir de la app; tiene que ganar su fecha. ' +
            'Recibo: "superluna" acuñada por Richard Nolle, 1979; primera lista impresa en Daniel Carter Beard, 1918; listas del Maine Farmers\' Almanac, años 1930; simplificación del Old Farmer\'s Almanac, siglo XX; evaluación de Patricia Haddock, Mysteries of the Moon, 1992.',
          pergunta: '¿Qué práctica tuya tiene menos edad de la que imaginabas? ¿Y por eso dejó de servirte?',
          acao: 'En el Calendario Lunar, mira el nombre de la próxima luna llena y recuerda de dónde salió.',
        },
        5: {
          titulo: 'Un tercio de los pares no se hablan',
          leitura:
            'La compatibilidad en porcentaje no existe en ninguna fuente — es invento comercial, del mismo lote que el horóscopo de periódico. Lo que la tradición tiene es mejor y más duro. Ptolomeo describe seis tipos de relación entre signos, y una de ellas es la aversión: por la definición estructural, los signos a uno o a cinco signos de distancia no se ven. Son 24 pares, casi un tercio de la tabla. Y cuando él lo aplica a dos personas, en un capítulo más adelante, la aversión no es indiferencia tibia: cae en el mismo escalón que la oposición, el cuarto y último de una escala — "they produce the deepest enmities and lasting contentions": producen las enemistades más hondas y las disputas más duraderas. Ninguna app del mercado muestra esto, porque un puntaje bajo no vende. ' +
            'Recibo: Ptolomeo, Tetrabiblos I.16 (la definición estructural) y IV.7 (la aplicación a la relación, con la escala de cuatro escalones), siglo II d.C.',
          pergunta: '¿Conoces a alguien con quien la conversación nunca arranca — y, mirándolo de cerca, eso es indiferencia o es roce?',
          acao: 'Escribe en el Diario Cósmico qué opinas de una lectura que no te da un buen puntaje.',
        },
        6: {
          titulo: 'Donde los cielos se cruzaron',
          leitura:
            'Si ya escuchaste eso de que "tu signo védico es otro" y no lo entendiste, es así. Un texto del siglo II tradujo la astrología griega al sánscrito — su nombre quiere decir, literalmente, "la astrología de los jonios", los griegos. Por eso la astrología india tiene casas, aspectos y planetas reconocibles. La diferencia es que corre sobre otro zodíaco, que corrige el desplazamiento lento del cielo. Resultado: el signo que sale en un sistema muchas veces no es el que sale en el otro. Ninguno de los dos está mal — son reglas de medir distintas, y el desencuentro entre ellas es medible. ' +
            'Recibo: Yavanajātaka, traducción del griego al sánscrito, siglo II d.C.',
          pergunta: '¿Dónde tú y otra persona tuvieron razón al mismo tiempo, midiendo con reglas distintas?',
          acao: 'Compara en la Carta Natal la posición de tu Sol en grados, no solo el nombre del signo.',
        },
        7: {
          titulo: 'Hasta nuestra salvedad tiene fecha',
          leitura:
            'Toda app repite la misma frase: "no es predicción, es reflexión", "tendencias, no determinismos". Ese marco no nació de escrúpulo filosófico — nació de defensa penal. Alan Leo fue procesado por adivinación en Inglaterra en 1914 y de nuevo en 1917, y la tesis de su defensa era exactamente esa: yo describo tendencias, no fortunas. Perdió. El mercado entero heredó la frase sin saber de dónde vino, y esta app también. Saber el origen no la vuelve falsa: sigue siendo la descripción honesta de lo que hacemos aquí. ' +
            'Recibo: procesos contra Alan Leo, Inglaterra, 1914 y 1917.',
          pergunta: 'Después de estos siete días, ¿qué empezaste a exigirle a cualquier cosa que te digan sobre el cielo?',
          acao: 'Saca una carta en el Tarot y lee su datación antes de leer su significado.',
        },
      },
    },
  },

  // Nome de medalha tem que continuar dando vontade de printar — tradução de
  // produto, não de dicionário. A legenda descreve o FEITO (dias, recibos,
  // senderos), nunca o que a pessoa virou — mesma regra do PT.
  medalhas: {
    primeiraLuz: {
      nome: 'Primera Luz',
      legenda: 'Abriste el sendero. Día 1 de 7.',
    },
    andarilhoDoZodiaco: {
      nome: 'Caminante del Zodíaco',
      legenda: 'Tres días seguidos. Volviste dos veces después del primero.',
    },
    guardiaoDaEfemeride: {
      nome: 'Guardián de la Efeméride',
      legenda:
        'Cinco días, cinco recibos leídos — obra, autor y siglo en cada uno. La efeméride es la tabla que dice dónde estaba cada planeta.',
    },
    desbravadorDoCeu: {
      nome: 'Pionero del Cielo',
      legenda: 'El sendero entero, del primer día al séptimo.',
    },
  },

  medalhasJornada: {
    leitorDeFontes: {
      nome: 'Cazador de Fuentes',
      legenda: 'Dos senderos enteros cerrados: catorce días y catorce recibos.',
    },
    cartografoDoCeu: {
      nome: 'Cartógrafo del Cielo',
      legenda: 'Todos los senderos completos. El Camino entero, de principio a fin.',
    },
  },
};
