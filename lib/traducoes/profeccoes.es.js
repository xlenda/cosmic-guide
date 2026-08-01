// lib/traducoes/profeccoes.es.js
// EL PACK ESPAÑOL DE LAS PROFECCIONES — misma FORMA que profeccoes.pt.js:
// mismas claves, mismos campos, mismos placeholders {x}. El motor
// (lib/profeccoes.js) no sabe de idiomas: solo pide piezas a este objeto.
//
// LA REGLA DE ESCRITURA, igual que en portugués: ENGANCHA PRIMERO, FUENTE
// DESPUÉS. Cada `prende`, `mes` y `curto` abre en la vida real, en español de
// conversación. El recibo (obra, autor, siglo) vive en `tradicao` y en
// `fonte`, nunca en la apertura.
//
// LA LÍNEA ROJA: ninguna afirmación de salud, ni implícita — nada de aliviar,
// calmar, sanar, curar ni tratar. Firmico y Valente listan dolencias bajo la
// Casa 6, la Casa 12 y Saturno: eso entra SIEMPRE como registro histórico con
// dueño y siglo, jamás como frase dirigida al cuerpo de quien lee. Tampoco hay
// promesa de resultado, ni veredicto, ni aviso defensivo.
//
// LO QUE NO SE TRADUCE: el verbatim de Robbins (Loeb, 1940) es idéntico en los
// tres packs, en inglés. La glosa en español va al lado, marcada como glosa.

const VERBATIM = {
  anual: {
    obra: 'Ptolemy, Tetrabiblos IV.10 ("Of the Division of Times"), trans. F. E. Robbins, Loeb, 1940',
    texto:
      'setting out from each of the prorogatory places, in the order of the signs, the number of years from birth, one year to each sign […] taking the ruler of the last sign.',
  },
  mensal: {
    obra: 'Ptolemy, Tetrabiblos IV.10, trans. F. E. Robbins, Loeb, 1940',
    texto:
      'We shall do the same thing for the months, setting out, again, the number of months from the month of birth, starting from the places that govern the year, twenty-eight days to a sign; and similarly for the days, we shall set out the number of the days from the day of birth, starting with the places which govern the months, two and a third days to a sign.',
  },
  prorrogativos: {
    obra: 'Ptolemy, Tetrabiblos IV.10, trans. F. E. Robbins, Loeb, 1940',
    texto:
      'We shall apply the prorogation from the horoscope to events relating to the body and to journeys […]; that from the Lot of Fortune to matters of property; that from the moon to affections of the soul and to marriage; that from the sun to dignities and glory; that from the mid-heaven to the other details of the conduct of life.',
  },
};

// Las CLAVES son canónicas (el nombre en portugués) y nunca cambian.
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

// `planetas` es la ETIQUETA; `planetasNaFrase` es el nombre tal como entra en
// una oración — en español "es la Luna", nunca "es Luna".
const PLANETAS = {
  sol: 'Sol',
  lua: 'Luna',
  mercurio: 'Mercurio',
  venus: 'Venus',
  marte: 'Marte',
  jupiter: 'Júpiter',
  saturno: 'Saturno',
};

const PLANETAS_NA_FRASE = {
  sol: 'el Sol',
  lua: 'la Luna',
  mercurio: 'Mercurio',
  venus: 'Venus',
  marte: 'Marte',
  jupiter: 'Júpiter',
  saturno: 'Saturno',
};

const CASAS = {
  1: {
    nomeAntigo: 'Horoskopos — "el timón"',
    prende:
      'La pregunta del año vuelve hacia ti: el cuerpo, el nombre, la manera de aparecer en la puerta. Lo que estaba en manos de otros vuelve a las tuyas. Es la rueda que regresa al punto de partida — cada doce años cae aquí.',
    mes: 'El asunto vuelve hacia ti: cuerpo, nombre, la cara que muestras.',
    tradicao:
      'El primer lugar es el Horoskopos. Paulo de Alejandría (s. IV) lo llama "el origen y el fundamento" y también "el timón"; Fírmico Materno, en el mismo siglo, escribe que de ahí se determina el carácter de la natividad entera — "la piedra angular y la base". Es donde Mercurio se alegra.',
    moderno:
      '"Máscara social" y "cómo te ve el mundo" es lectura del siglo XX. Legítima, solo que posterior — y es otra función: la antigua es arquitectónica, el punto cero desde donde se cuentan las demás casas.',
    fonte: 'Paulo de Alejandría, cap. 24 · Fírmico Materno, Mathesis II.XIX.2 (s. IV)',
  },
  2: {
    nomeAntigo: 'Puerta del Hades',
    prende:
      'Año de cuentas sobre la mesa: lo que entra, lo que sale, lo que sostiene el mes. Aquí el dinero no es estatus — es el alquiler, el mercado, la cuota que vence el día 10.',
    mes: 'Cuentas sobre la mesa: lo que entra, lo que sale, lo que sostiene el mes.',
    tradicao:
      'El nombre antiguo del segundo lugar es Puerta del Hades. Fírmico Materno (s. IV) dice que muestra "aumento en las esperanzas personales y en los bienes materiales" y, en la misma frase, lo clasifica como lugar pasivo, "porque no hace ningún aspecto con el Ascendente". Valente (s. II) es más duro: allí "los benéficos no hacen bien". Fírmico también lo llama Spes, Esperanza.',
    moderno:
      '"Autoestima" y "mis valores" es giro del siglo XX, y nace de un juego de palabras inglés — values sirve para valor moral y para valor en dinero. Ninguna fuente antigua leída en esta base da ese paso.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.3 (s. IV) · Vetio Valente, Anthologiae II (s. II)',
  },
  3: {
    nomeAntigo: 'la Diosa',
    prende:
      'Año de gente cercana: el hermano, el primo, el vecino que se volvió amigo, el grupo de siempre. Y de ir y volver — maleta pequeña, carretera corta, dormir en casa ajena.',
    mes: 'Gente cercana e ir y volver: hermano, vecino, la carretera corta.',
    tradicao:
      'El tercer lugar se llama la Diosa, y es donde la Luna se alegra. Fírmico Materno (s. IV) pone aquí "hermanos y amigos" y también "los viajeros". Paulo de Alejandría añade amistad, patrocinio y vivir en el extranjero; Valente, en la tabla de los nueve nombres, da a este lugar la madre.',
    moderno:
      '"Comunicación y mente concreta" viene del alfabeto de doce letras, que iguala casa, signo y planeta: semilla en Lilly, 1647, y doctrina plena en el siglo XX, popularizada por Zipporah Dobyns en los años 1970. Chris Brennan observa que el planeta antiguo de este lugar es la Luna, no Mercurio — la coincidencia de tema es eso, coincidencia entre dos motores distintos.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.4 (s. IV) · Paulo de Alejandría, cap. 24',
  },
  4: {
    nomeAntigo: 'Hypógeion — el Subterráneo',
    prende:
      'Año de raíz: la casa, el terreno, la mudanza, lo que la familia guarda y lo que debe. El asunto que llevaba años debajo de la alfombra suele ser de este tipo.',
    mes: 'Raíz: casa, mudanza, el asunto de familia que estaba guardado.',
    tradicao:
      'El cuarto lugar es el Hypógeion, el subterráneo. Fírmico Materno (s. IV) es tajante y no habla del padre: "propiedad de la familia, sustancia, posesiones, bienes domésticos, todo lo que concierne a la riqueza escondida y recuperada". Paulo de Alejandría pone aquí tierras, fundaciones, la patria y el fin de la vida.',
    moderno:
      'Padre o madre en la Casa 4 es pelea entre capas, y decimos cuál estamos usando: Lilly (1647) pone aquí al padre y a la madre en la 10; la astrología moderna lo invirtió; y Fírmico saca a los padres de las casas y los pone en los planetas — el Sol informa sobre el padre, la Luna sobre la madre. Valente, por su parte, pone al padre en la 9 y a la madre en la 3.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.5 y II.XIX.13 (s. IV) · Paulo de Alejandría, cap. 24',
  },
  5: {
    nomeAntigo: 'Buena Fortuna',
    prende:
      'Año en que aparece la conversación sobre los hijos — tener, criar, cuidar, o el hijo de alguien que se volvió asunto tuyo. Y lo que se hace por gusto, sin cobrar nada por ello.',
    mes: 'Lo que se hace por gusto — y la conversación sobre los hijos.',
    tradicao:
      'El quinto lugar es la Buena Fortuna, donde Venus se alegra. Fírmico Materno (s. IV): "de este lugar se descubre el número de los hijos y su sexo — se llama Buena Fortuna porque es la casa de Venus", y está en trígono con el Ascendente. Valente, en el siglo II, llegaba a ligar este lugar al matrimonio.',
    moderno:
      '"Creatividad, escenario y autoexpresión" viene del alfabeto de doce letras — la 5ª casa igualada a Leo y al Sol —, doctrina plena del siglo XX. No hallé esa lectura en ninguna fuente antigua de esta base.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.6 (s. IV) · Vetio Valente, Anthologiae II (s. II)',
  },
  6: {
    nomeAntigo: 'Mala Fortuna',
    prende:
      'Año de trabajo que pesa: el turno que no termina, la tarea que nadie quiso y quedó contigo, el jefe que exige. Es el lugar del servicio prestado — y del desgaste que viene con él.',
    mes: 'Trabajo que pesa: el turno, la tarea que quedó, lo que desgasta.',
    tradicao:
      'El sexto lugar se llama Mala Fortuna, y es donde Marte se alegra. Fírmico Materno (s. IV) escribe que allí buscaban los antiguos la causa de las dolencias del cuerpo, y que es lugar pasivo, "porque no hace aspecto con el Ascendente". Valente (s. II) va más lejos: un benéfico allí no ayuda. Sue Ward, leyendo la tradición horaria, afina el vocabulario — el asunto es servidumbre y faena, no "servicio".',
    moderno:
      '"Rutina, hábitos y bienestar" es lectura del siglo XX, venida de la misma igualdad entre la 6ª casa, Virgo y Mercurio. De la lista antigua el único punto que sobrevivió fue el trabajo; el resto cambió de signo.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.7 (s. IV) · Vetio Valente, Anthologiae II (s. II)',
  },
  7: {
    nomeAntigo: 'Dýsis — el Poniente',
    prende:
      'Año del otro: quien se sienta enfrente. Matrimonio, sociedad, contrato, y también la pelea que solo existe porque hay dos personas en ella. Poco se resuelve a solas en un año así.',
    mes: 'El otro: contrato, sociedad, la conversación que necesita dos personas.',
    tradicao:
      'El séptimo lugar es el Dýsis, el Poniente — donde el Sol se pone. Fírmico Materno (s. IV): "de este lugar preguntaremos la naturaleza y el número de los matrimonios". Y el mismo Fírmico observa que es el lugar más adverso al Ascendente, porque está en oposición a él. Paulo de Alejandría pone aquí, además del matrimonio, las estancias largas en el extranjero.',
    moderno:
      '"El espejo", "el alma gemela" y "la proyección de la sombra" es lectura junguiana del siglo XX. Lilly, en 1647, todavía ponía aquí al enemigo público — y Sue Ward niega expresamente que esta sea la casa del "otro desconocido".',
    fonte: 'Fírmico Materno, Mathesis II.XIX.8 (s. IV) · Paulo de Alejandría, cap. 24',
  },
  8: {
    nomeAntigo: 'Epicatáfora — Comienzo de la Muerte, y "el Ocioso"',
    prende:
      'Año de dinero que no es tuyo: herencia, deuda, la parte del otro en la cuenta, lo que quedó de alguien. Y de lo que se cierra — y que solo se cierra con firma.',
    mes: 'Dinero que no es tuyo: la parte del otro, la deuda, lo que se cierra.',
    tradicao:
      'El octavo lugar se llama Epicatáfora, comienzo de la muerte, y Paulo de Alejandría le da otro nombre: el Ocioso (argós). Fírmico Materno (s. IV) dice que es lugar pasivo, "porque no hace aspecto con el Ascendente". Paulo pone aquí la ganancia que viene de herencias. Ptolomeo excluye este lugar de la prorrogación justamente por ser disjunto del Ascendente.',
    moderno:
      '"Sexo y transformación" entra después de 1930: Plutón es descubierto, atribuido a Escorpio, y Escorpio es equiparado a la Casa 8 por el alfabeto de doce letras. Sue Ward describe la cadena con todas las letras. Ninguna fuente antigua de esta base liga la Casa 8 al sexo.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.9 (s. IV) · Paulo de Alejandría, cap. 24 · Ptolomeo, Tetrabiblos III.10',
  },
  9: {
    nomeAntigo: 'el Dios',
    prende:
      'Año de salir del propio patio: otro país, otra lengua, otra manera de pensar. Un curso, la fe, una pregunta grande que no se despega de la cabeza.',
    mes: 'Salir del propio patio: otro país, otra lengua, una pregunta grande.',
    tradicao:
      'El noveno lugar es el Dios, y es donde el Sol se alegra. Fírmico Materno (s. IV) pone allí religión y viaje al extranjero. Valente (s. II) es el más rico: "amistad, viaje, beneficios venidos de cosas extranjeras. Es el lugar de Dios, del rey, del soberano; astrología, decretos oraculares, la aparición de los dioses, adivinación". La astrología misma vive en esta casa.',
    moderno:
      '"Filosofía y estudios superiores" es la versión secular de lo mismo, y llega en el siglo XX por la igualdad entre la 9ª casa, Sagitario y Júpiter — pero esta es la casa en que lo antiguo y lo moderno más se parecen. Vale decirlo: la credibilidad también se construye admitiendo cuándo el mercado acierta.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.10 (s. IV) · Vetio Valente, Anthologiae II (s. II)',
  },
  10: {
    nomeAntigo: 'Mesouránēma — el Medio Cielo',
    prende:
      'Año de aparecer: lo que haces, quién te ve haciéndolo, el nombre que queda. Ascenso, cambio de función, el proyecto que sale del borrador y se vuelve cosa pública.',
    mes: 'Aparecer: lo que haces y quién te ve haciéndolo.',
    tradicao:
      'El décimo lugar es el Mesouránēma, y la palabra griega para lo que rige es praxis — acción, lo que se hace. Fírmico Materno (s. IV) lo llama "el primero en importancia" y lista allí las acciones, la patria, la casa y la carrera. Ptolomeo lo pone en primer lugar entre los lugares prorrogativos. Una nota técnica que casi nadie da: en Casas Enteras el Medio Cielo no es la cúspide de la Casa 10 — Paulo (cap. 30) avisa que el grado culminante cae a veces en la 9 y a veces en la 11. Cuando esta app dice Casa 10, dice el décimo signo contado desde el punto de partida.',
    moderno:
      '"Carrera" en el sentido de empleo es traducción del siglo XX, moderna y estrecha, de praxis: Fírmico incluía aquí también la patria y la casa. Y hay una inversión para registrar: Lilly, en 1647, ponía a la madre en la Casa 10; la astrología moderna puso al padre.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.11 (s. IV) · Paulo de Alejandría, cap. 30 · Ptolomeo, Tetrabiblos IV.10',
  },
  11: {
    nomeAntigo: 'Agathos Daimon — el Buen Daimon',
    prende:
      'Año de quien te da la mano: la invitación, la recomendación, la puerta abierta por alguien que ya estaba dentro. Lo que llega por gente, no por esfuerzo solitario.',
    mes: 'Quien te da la mano: la invitación, la recomendación, la puerta abierta.',
    tradicao:
      'El undécimo lugar es el Buen Daimon — Agathos Daimon, el buen espíritu —, y es donde Júpiter se alegra. Fírmico Materno (s. IV) dice que es "la casa de Júpiter" y que está en sextil con el Ascendente. Paulo de Alejandría pone aquí alianza, patrocinio y buenas expectativas. Valente (s. II): los benéficos en este lugar "hacen a los hombres ilustres y ricos desde la juventud".',
    moderno:
      '"Amigos y grupos" es consolidación posterior — Paulo ponía la amistad en la Casa 3. Y la carga de colectivo, activismo y red viene de Urano, planeta descubierto en 1781: en la práctica es del siglo XX.',
    fonte:
      'Fírmico Materno, Mathesis II.XIX.12 (s. IV) · Paulo de Alejandría, cap. 24 · Vetio Valente, Anthologiae II (s. II)',
  },
  12: {
    nomeAntigo: 'Cacodaemon — el Mal Daimon',
    prende:
      'Año de bastidores: lo que corre por debajo, lo que nadie comenta en la reunión, el acuerdo que queda detrás de la puerta. Y de lidiar con quien estorba sin levantar la voz.',
    mes: 'Bastidores: lo que corre por debajo y no se comenta en la reunión.',
    tradicao:
      'El duodécimo lugar es el Mal Daimon — Cacodaemon —, y es donde Saturno se alegra. Fírmico Materno (s. IV) dice que de ahí se determina "la naturaleza de los enemigos", que es lugar pasivo "porque no hace aspecto con el Ascendente", y que es la casa de Saturno. Sue Ward define al enemigo oculto de manera afilada: suelen ser personas que uno mismo considera amigas. Ptolomeo excluye este lugar por su nombre, y la razón que da es atmosférica — la exhalación húmeda y espesa de la tierra enturbia allí la luz de las estrellas.',
    moderno:
      '"Inconsciente, karma y vidas pasadas" entra en el siglo XX, en tres saltos: la teosofía de Alan Leo (Esoteric Astrology, 1913), las casas como campos de experiencia en Rudhyar (1936 y 1972) y la consolidación psicológica con Liz Greene y Sasportas (The Twelve Houses, 1985). Y "autosabotaje" circula mucho: la investigación de esta base no halló la primera aparición en fuente fechada — queda registrado como no hallado.',
    fonte: 'Fírmico Materno, Mathesis II.XIX.13 (s. IV) · Ptolomeo, Tetrabiblos III.10',
  },
};

const SENHORES = {
  sol: {
    prende:
      'El asunto del año es aparecer: el cargo, el nombre, la palabra que vale porque la dices tú. Padre, jefe, quien manda — ese tipo de figura suele ocupar espacio en la conversación.',
    curto: 'El Sol lleva el asunto hacia lo público.',
    tradicao:
      'Valente (s. II) abre el catálogo de los planetas por el Sol y lo define como "el órgano de la percepción mental". Debajo de él agrupa realeza, mando, cargo, reputación pública, honores — y las personas: el padre, el patrón. Ptolomeo no lo llama benéfico: en su clasificación el Sol es común.',
    moderno:
      '"El Sol rige la personalidad" es de Alan Leo, de 1895 en adelante. No está en las fuentes antiguas.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II) · Ptolomeo, Tetrabiblos I.5',
  },
  lua: {
    prende:
      'El asunto del año es lo que queda cerca del suelo: casa, mudanza, rutina, la madre, quién cuida a quién. Se cambia de lugar más de lo que se cambia de rumbo.',
    curto: 'La Luna lleva el asunto hacia lo de casa.',
    tradicao:
      'La lista de Valente (s. II) para la Luna sorprende a quien espera emoción: "la vida del hombre, el cuerpo", la madre, la administración de la casa, la ciudad, ganancias y gastos — y viajes y andanzas, con una explicación por imagen: "no da caminos rectos, a causa de Cáncer". Y Ptolomeo clasifica a la Luna como benéfica, junto a Júpiter y Venus, cosa que casi ninguna app dice.',
    moderno:
      '"Luna igual a emociones" es énfasis del siglo XX. La fuente antigua habla primero de cuerpo, de casa y de ciudad.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II) · Ptolomeo, Tetrabiblos I.5',
  },
  mercurio: {
    prende:
      'El año se pone hablador: propuesta, mensaje, cuenta por cerrar, papel por firmar. Mucho se resuelve por texto y por conversación — y cambia de forma a mitad del camino.',
    curto: 'Mercurio lleva el asunto hacia el papel y la conversación.',
    tradicao:
      'Valente (s. II) es larguísimo sobre Mercurio, y el resumen en una palabra es intermediación: letras, disputa, embajadas, cuentas, geometría, pesos y medidas, mercados, bancos — "el creador de todo el comercio". El mismo planeta hace al notario y al tramposo, y eso es doctrina, no chiste. Y la línea que más pesa aquí: "Mercurio volverá todo caprichoso en el resultado, y bastante perturbado".',
    moderno:
      'El pánico alrededor de Mercurio retrógrado es de finales del siglo XX. Ninguna fuente antigua promete aparatos rotos — y, medido en esta base, el planeta pasa cerca del 19% del tiempo retrógrado, tres veces por año.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II)',
  },
  venus: {
    prende:
      'El asunto del año es la gente que quieres cerca: el acuerdo, la propuesta, la reconciliación, la invitación. Y gastar en lo bonito y sentir que valió la pena.',
    curto: 'Venus lleva el asunto hacia el acuerdo y el afecto.',
    tradicao:
      'Valente (s. II) abre Venus con dos palabras: "Venus es deseo y amor". Después vienen matrimonio, amistad, compañía, acuerdos en términos favorables — y el oficio: música, canto, pintura, mezcla de colores, perfumería, orfebrería. Ptolomeo la clasifica como benéfica.',
    moderno:
      '"Venus es autoestima" es lectura del siglo XX. En la fuente, Venus es vínculo, acuerdo y oficio — cosa que se hace con otra persona.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II) · Ptolomeo, Tetrabiblos I.5',
  },
  marte: {
    prende:
      'Año de hacer, y de hacer cortando: la obra, la mudanza forzada, la conversación que nadie quería tener y se tuvo. Herramienta en la mano, plazo corto, roce.',
    curto: 'Marte lleva el asunto hacia lo que exige herramienta y plazo.',
    tradicao:
      'La lista de Valente (s. II) para Marte es la más dura del catálogo: fuerza, disputa, pleito, ira — y también mando, campaña, oficio con fuego y hierro, albañilería. Ptolomeo lo clasifica como maléfico por sequedad excesiva; Valente registra lo contrario cuando está en su propia secta y bien colocado — ahí es dador de bien. El vector de Marte en la fuente es acción que corta.',
    moderno:
      'Leer a Marte como "impulso y pasión" es vocabulario del siglo XX, de Rudhyar en adelante. La fuente habla de hierro, fuego, oficio manual y mando.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II) · Ptolomeo, Tetrabiblos I.5',
  },
  jupiter: {
    prende:
      'El año abre espacio: el cargo que alguien ofrece, el acuerdo que se destraba, el papeleo que por fin avanza. También es año de hijos, de herencia y de firmar en nombre de otro.',
    curto: 'Júpiter lleva el asunto hacia lo que abre espacio.',
    tradicao:
      'Valente (s. II) resume a Júpiter en aumento: engendrar hijos, abundancia de cosecha, justicia, cargos, arbitrajes, herencia — "posesión segura de bienes", "liberación de vínculos". Ptolomeo lo clasifica como benéfico, de fuerza templada.',
    moderno:
      '"Suerte" es atajo del siglo XX. Y un número que reordena la conversación, medido en esta base: Júpiter pasa casi un tercio del tiempo retrógrado — si la retrogradación fuera la catástrofe que se anuncia, el planeta de la suerte estaría averiado cuatro meses al año, todos los años.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II) · Ptolomeo, Tetrabiblos I.5',
  },
  saturno: {
    prende:
      'Año de peso y de plazo: lo que tarda, lo que exige documento, lo que solo sale con paciencia. Y también año de recibir cargo — la llave que entrega es la de quien administra lo ajeno.',
    curto: 'Saturno lleva el asunto hacia lo que tarda y pide documento.',
    tradicao:
      'Valente (s. II) hace de Saturno el retrato más largo y más sombrío del catálogo — lentitud, obstáculo, deuda, luto — y lo llama "la estrella de Némesis". Pero el mismo Valente escribe que Saturno "pone en las manos grandes puestos y posiciones distinguidas, supervisiones, la administración de la propiedad ajena". Saturno da cargo, y el mercado casi nunca lo dice. Ptolomeo lo clasifica como maléfico por frío excesivo, con la misma salvedad de secta que vale para Marte.',
    moderno:
      '"Saturno es el villano" es caricatura. Y la lectura del retorno de Saturno como crisis de madurez es del siglo XX: el ciclo de treinta años es antiguo (Valente ya llama al trigésimo año punto crítico), la crisis psicológica no.',
    fonte: 'Vetio Valente, Anthologiae I.1 (s. II) · Ptolomeo, Tetrabiblos I.5',
  },
};

export const PACK = {
  idioma: 'es',
  signos: SIGNOS,
  planetas: PLANETAS,
  planetasNaFrase: PLANETAS_NA_FRASE,
  verbatim: VERBATIM,
  casas: CASAS,
  senhores: SENHORES,

  // El chrome de la pantalla (screens/ProfeccoesScreen.js) — misma forma y las
  // mismas claves que en el pack PT. La pantalla es escaparate: no redacta
  // nada, solo pasa el `lang`. `locale` no es prosa: es la etiqueta que Intl
  // usa para escribir la fecha del cambio de año en el idioma correcto.
  tela: {
    titulo: 'Profecciones',
    subtitulo: 'El asunto de tu año — y quién sostiene la llave',
    intro:
      'Cada año de tu vida tiene un asunto y un planeta a cargo de él. La cuenta avanza un signo por cumpleaños: a los doce la rueda se cierra y vuelve al principio, y por eso los años de doce en doce se parecen tanto entre sí. Aquí está dónde se detuvo tu rueda este año — y dónde está ahora, dentro del mes.',
    introDois:
      'Es la técnica predictiva mejor documentada de la tradición helenística, y pide poco: solo tu fecha de nacimiento. Con la hora y la ciudad, la cuenta pasa a salir del Ascendente, que es la forma canónica; sin ellas, sale del Sol, que Ptolomeo nombra en el mismo capítulo. La pantalla siempre dice cuál de los dos se usó.',
    carregando: 'Buscando tu fecha de nacimiento…',
    indisponivelTitulo: 'La cuenta no puede empezar',
    botaoMapa: 'Completar en la Carta Natal',
    rotuloPontoDePartida: 'De dónde sale la cuenta',
    rotuloQuandoVira: 'Cuándo cambia tu año',
    rotuloCamadaMensal: 'La capa de 28 días',
    rotuloCasasInteiras: 'El sistema de casas usado',
    rotuloAPalavra: 'La palabra "profección"',
    rotuloTradicao: 'Lo que la tradición dice del lugar y del señor',
    abrir: 'Abrir',
    fechar: 'Cerrar',
    compartilhar: 'Compartir',
    copiado: 'Texto copiado — pégalo donde quieras.',
    naoCopiou: 'No se pudo copiar aquí — selecciona el texto y cópialo.',
    marca: 'cosmicguide.cloud',
    locale: 'es-ES',
  },

  moldes: {
    senhorDoAno: 'Quien tiene la llave del año es {planeta}.',
    senhorDoMes: 'En estos 28 días quien sostiene la llave es {planeta}.',
    tituloAno: 'Año {idade} · casa {casa} · {signo}',
    tituloMes: 'Mes {mes} del año · casa {casa} · {signo}',
    fonte: '{base} · {casa} · {senhor}',
    fonteMes: '{base} · {casa} · {senhor}',
    janela: 'del {inicio} al {fim}',
  },

  fonteBase: 'Ptolomeo, Tetrabiblos IV.10 (s. II)',

  comoFunciona:
    'La cuenta es de niño: por cada año de vida, el punto de partida de tu carta avanza un signo. Al cumplir 1 año estás en el segundo signo; a los 11, en el duodécimo; a los 12, de vuelta al primero. El signo donde la cuenta se detiene es la casa del año, y el planeta que rige ese signo es el Señor del Año.',

  deOndeVem:
    'Está en Ptolomeo, Tetrabiblos IV.10, el capítulo "De la División de los Tiempos", del siglo II: partiendo de cada uno de los lugares prorrogativos, en el orden de los signos, un año para cada signo, y se toma el regente del último signo. Chris Brennan llama a la profección anual la técnica de señor del tiempo más difundida de la tradición helenística.',

  aPalavra:
    'La palabra "profección" es latina, no griega: profectio, partida, avance. La tradición helenística no tenía nombre para la técnica — buscando "profect" en la traducción íntegra de Valente hecha por Mark Riley, el resultado es cero apariciones. Quien busque "profección" en los griegos no la va a encontrar.',

  camadaMensal:
    'El mismo capítulo da la capa de abajo: veintiocho días por signo, contados desde el lugar que gobierna el año. Son trece cambios dentro de un solo año. Y da todavía la capa diaria, de dos días y un tercio por signo — que esta app no usa.',

  quandoViraOAno:
    'El año no cambia a medianoche del cumpleaños: cambia cuando el Sol vuelve al grado exacto en que estaba en tu nacimiento. Ese instante se desplaza casi seis horas por año y, en año prebisiesto, cae el día anterior al cumpleaños del calendario. Por eso la cuenta aquí sale del retorno solar y no de la diferencia de fechas.',

  sistemaDeCasas:
    'La cuenta es por Casas Enteras: la casa 1 es el signo entero del punto de partida, la casa 2 es el signo siguiente, y así sucesivamente. Es el sistema que la técnica presupone, y es el mismo que la Carta Natal de esta app ya usa.',

  origem: {
    ascendente: {
      rotulo: 'contado desde tu Ascendente',
      texto:
        'La cuenta sale de tu Ascendente, que es la forma canónica de la técnica. En el texto de Ptolomeo, la prorrogación desde el horóscopo — el Ascendente — cubre lo que concierne al cuerpo y a los viajes.',
    },
    sol: {
      rotulo: 'contado desde tu Sol',
      texto:
        'Sin la hora y la ciudad de nacimiento no se puede saber tu Ascendente, así que la cuenta sale del Sol. Y esto no es un apaño: Ptolomeo manda profeccionar desde cada uno de los lugares prorrogativos, y nombra cinco — Ascendente, Parte de la Fortuna, Luna, Sol y Medio Cielo —, cada uno gobernando un asunto. El del Sol, en su texto, cubre las dignidades y la gloria.',
      glosa:
        'Glosa del pasaje: "aplicaremos la prorrogación desde el horóscopo a los sucesos relativos al cuerpo y a los viajes; la de la Parte de la Fortuna a las cuestiones de propiedad; la de la Luna a las afecciones del alma y al matrimonio; la del Sol a las dignidades y la gloria; la del medio cielo a los demás detalles de la conducta de la vida."',
    },
  },

  melhoraCom: {
    hora:
      'Falta la hora de tu nacimiento. Con ella y con la ciudad, la misma cuenta pasa a salir del Ascendente — la forma canónica, y la que Ptolomeo liga al cuerpo y a los viajes. Se puede completar en la Carta Natal.',
    cidade:
      'Falta la ciudad de tu nacimiento. Con ella y con la hora, la misma cuenta pasa a salir del Ascendente — la forma canónica, y la que Ptolomeo liga al cuerpo y a los viajes. Se puede completar en la Carta Natal.',
    ambos:
      'Faltan la hora y la ciudad de tu nacimiento. Con las dos, la misma cuenta pasa a salir del Ascendente — la forma canónica, y la que Ptolomeo liga al cuerpo y a los viajes. Se puede completar en la Carta Natal.',
  },

  precisao: {
    exata:
      'Con hora y ciudad, el instante en que tu año cambia se calcula al minuto: es el retorno del Sol al grado exacto del nacimiento.',
    meioDia:
      'Sin la hora de nacimiento, el cálculo usa el mediodía — que es la conjetura que menos yerra dentro del día. El cambio de año puede caer algunas horas antes o después de lo que aparece aquí.',
  },

  indisponivel: {
    semData:
      'Para contar los años de esta rueda falta el comienzo: tu fecha de nacimiento. Se puede completar en la Carta Natal, y la cuenta aparece al instante.',
    dataInvalida:
      'La fecha de nacimiento guardada no es una fecha de calendario válida, así que no se puede empezar la cuenta. Corrigiéndola en la Carta Natal, esto vuelve a funcionar.',
    semEfemeride:
      'La tabla del cielo no cargó en este aparato, y sin ella no se puede saber la hora exacta en que cambia tu año. Preferimos decirlo a inventar una fecha.',
    antesDoNascimento:
      'La fecha elegida es anterior a tu nacimiento, y la cuenta de años de vida solo empieza ahí.',
  },

  rotulos: {
    titulo: 'Profección anual',
    tituloMensal: 'Profección mensual',
    idade: 'Año de vida',
    casaDoAno: 'Casa del año',
    signoDoAno: 'Signo del año',
    senhorDoAno: 'Señor del año',
    senhorDoMes: 'Señor del mes',
    casaDoMes: 'Casa del mes',
    signoDoMes: 'Signo del mes',
    nomeAntigo: 'Nombre antiguo del lugar',
    viradaDoAno: 'Este año empezó el',
    proximaVirada: 'El próximo empieza el',
    inicioDoMes: 'Este tramo empezó el',
    fimDoMes: 'El próximo tramo empieza el',
    comoFunciona: 'Cómo se hace la cuenta',
    deOndeVem: 'De dónde viene esto',
    oQueOModernoDiz: 'Lo que suele decir lo moderno',
    oQueMelhora: 'Qué mejora con más datos',
    naoAchado: 'Lo que la investigación no halló',
    fontes: 'Fuentes',
    precisao: 'Precisión',
    verbatim: 'En el original',
  },

  naoAchado: [
    'Paulo de Alejandría, Eisagogiká cap. 31, es señalado por la literatura secundaria como la exposición más clara del método. La investigación de esta base no halló el texto en traducción accesible — la atribución del capítulo es de segunda mano.',
    'Doroteo de Sidón, Carmen Astrologicum IV.1, es citado como fuente del Señor del Año. La investigación de esta base no verificó el pasaje en el texto: las traducciones de Pingree y de Dykes están protegidas.',
    'Nombre griego para la técnica: no hay. La tradición helenística usaba el procedimiento sin bautizarlo, y el nombre que quedó es el latino profectio, posterior.',
  ],

  fontes: [
    {
      obra: 'Tetrabiblos IV.10, "De la División de los Tiempos"',
      autor: 'Claudio Ptolomeo',
      seculo: 's. II',
      grau: 'fuente primaria',
      nota: 'traducción de F. E. Robbins, Loeb Classical Library, 1940',
    },
    {
      obra: 'Tetrabiblos I.17 (las casas de los planetas) y I.5 (benéficos y maléficos)',
      autor: 'Claudio Ptolomeo',
      seculo: 's. II',
      grau: 'fuente primaria',
      nota: 'la tabla de domicilios es la que da el Señor del Año',
    },
    {
      obra: 'Mathesis II.XIX',
      autor: 'Julio Fírmico Materno',
      seculo: 's. IV',
      grau: 'fuente primaria',
      nota: 'traducción de Jean Rhys Bram; es la fuente de los nombres antiguos de los doce lugares',
    },
    {
      obra: 'Anthologiae I.1 y Libro II',
      autor: 'Vetio Valente',
      seculo: 's. II',
      grau: 'fuente primaria',
      nota: 'traducción íntegra de Mark T. Riley',
    },
    {
      obra: 'Eisagogiká, cap. 24 y cap. 30',
      autor: 'Paulo de Alejandría',
      seculo: '378 d.C.',
      grau: 'fuente primaria',
      nota: 'los nombres de los lugares y el aviso de que el Medio Cielo no es la cúspide de la Casa 10',
    },
    {
      obra: 'Hellenistic Astrology: The Study of Fate and Fortune',
      autor: 'Chris Brennan',
      seculo: '2017',
      grau: 'academia moderna',
      nota: 'obra protegida, usada como referencia bibliográfica; la profección como la técnica de señor del tiempo más difundida de la tradición',
    },
  ],

  base: [
    { arquivo: 'docs/tradicao/13-tecnicas-preditivas.md', locus: '§7 e §13.3' },
    { arquivo: 'docs/tradicao/12-as-doze-casas.md', locus: '§5' },
    { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§3' },
    { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§2.6' },
    { arquivo: 'docs/tradicao/16-oportunidades-de-conteudo.md', locus: 'oportunidade nº 6' },
  ],
};

export default PACK;
