// lib/traducoes/melotesiaDupla.es.js
// EL PACK ESPAÑOL de la melotesia doble — español neutro de app.
//
// Misma FORMA que lib/traducoes/melotesiaDupla.pt.js: mismas claves, mismos
// campos, funciones con la misma firma. Lo que NUNCA cambia entre packs vive en
// el motor (lib/melotesiaDupla.js): el latín de Manilio, la letra hebrea, el mes
// hebreo, los loci y las claves internas.
//
// Todas las reglas del encabezado de lib/melotesiaDupla.js valen para cada
// string de aquí, y dos mandan más que las demás en este tema:
//
//   · NINGUNA AFIRMACIÓN DE SALUD, ni implícita. Nada sobre lo que una parte del
//     cuerpo siente, necesita o cómo ocuparse de ella. Se dice lo que la
//     tradición atribuía, en pasado, con fuente. Ante la duda, la frase se
//     borra.
//   · ENGANCHA PRIMERO, FUENTE DESPUÉS. Cada `abertura` es una escena de vida
//     real — el tatuaje, la silla de oficina, el probador — y el recibo llega en
//     la `leitura`, después. Nunca al revés.
//
// Y la regla estructural: las dos columnas NUNCA se vuelven una. Aquí no existe
// ninguna frase que diga "la parte del cuerpo de Aries es X"; existe "Manilio
// atribuía X" y "el Sefer Yetzirah atribuía Y".

const ROTULOS = {
  manilio: 'Manilio',
  sefer: 'Sefer Yetzirah',
  capitulo: 'cap.',
  verso: 'verso latino',
  letra: 'letra',
  mes: 'mes de',
  recensao: 'recensión',
};

const TIPOS = {
  superficie: 'superficie del tronco o de la cabeza',
  membro: 'brazo o pierna',
  viscera: 'órgano interno',
};

const RELACOES = {
  concordam: 'las dos nombran la misma parte',
  vizinhas: 'partes distintas, misma región del cuerpo',
  divergem: 'regiones distintas del cuerpo',
};

// korkeban se queda sin traducir en los tres packs — la razón está en
// NOTA_KORKEBAN.
const ORGAOS = {
  peDireito: 'Pie derecho',
  rimDireito: 'Riñón derecho',
  peEsquerdo: 'Pie izquierdo',
  maoDireita: 'Mano derecha',
  rimEsquerdo: 'Riñón izquierdo',
  maoEsquerda: 'Mano izquierda',
  vesicula: 'Vesícula',
  intestino: 'Intestino delgado',
  estomago: 'Estómago (kivah)',
  figado: 'Hígado',
  korkeban: 'Korkeban',
  baco: 'Bazo',
};

const SIGNOS = {
  aries: {
    nome: 'Aries',
    parte: 'Cabeza',
    abertura:
      'Mil veces te dijeron que Aries es la cabeza. Es lo primero que aparece cuando alguien dibuja ese muñequito con los doce signos repartidos por el cuerpo.',
    leitura:
      'La lista latina de Manilio, en el siglo I, abre el cuerpo por la cabeza, y de ahí sale la frase que todo el mundo repite. La lista hebrea del Sefer Yetzirah, fechada entre los siglos II y VI, abre por el otro extremo: en Aries pone el pie derecho. ' +
      'Ninguna corrige a la otra — ninguna de las dos conoce a la otra. Son dos textos lejanos que repartieron el mismo cuerpo con criterios distintos, y este es el signo donde la distancia entre ellos es la mayor posible: los dos extremos.',
  },
  touro: {
    nome: 'Tauro',
    parte: 'Cuello',
    abertura:
      'Ese tatuaje de toro justo debajo de la nuca. Quien eligió el lugar estaba siguiendo, sin saberlo, una lista de dos mil años.',
    leitura:
      'Manilio le da a Tauro el cuello — en el verso latino, el bellísimo cuello. El Sefer Yetzirah le da el riñón derecho, por la letra Vav, en el mes de Iyar. ' +
      'Uno está por fuera y arriba del tronco; el otro está por dentro y bastante más abajo. Divergen, y es el segundo signo seguido en que divergen.',
  },
  gemeos: {
    nome: 'Géminis',
    parte: 'Brazos, unidos a los hombros',
    abertura:
      'Hay gente que no logra contar una historia con los brazos quietos. Ya sabes de quién hablo, y seguro alguna vez la imitaste por detrás.',
    leitura:
      'Manilio le da a Géminis los brazos unidos a los hombros. El Sefer Yetzirah le da el pie izquierdo, por la letra Zayin, en el mes de Sivan. ' +
      'Divergen — pero fíjate en una coincidencia de naturaleza que solo ocurre aquí: en las doce líneas, este es el único signo en que las dos fuentes señalan un miembro. Partes distintas, misma categoría de parte.',
  },
  cancer: {
    nome: 'Cáncer',
    parte: 'Pecho',
    abertura:
      'La persona que te agarra para el abrazo y te aprieta contra el pecho antes de que llegues a decir hola. En toda familia hay una.',
    leitura:
      'Manilio sitúa el pecho bajo Cáncer. El Sefer Yetzirah le da la mano derecha, por la letra Chet, en el mes de Tamuz. ' +
      'Divergen — y esta es una de las dos líneas en que la versión popular también discrepa del propio Manilio, lo que deja tres mapas distintos disputándose el mismo signo.',
  },
  leao: {
    nome: 'Leo',
    parte: 'Costados y omóplatos',
    abertura:
      'Ese amigo que entra a cualquier lugar con el hombro hacia atrás, ocupando espacio antes incluso de hablar.',
    leitura:
      'Manilio le da a Leo los costados y los omóplatos — no el corazón, que es lo que se repite por ahí. El Sefer Yetzirah le da el riñón izquierdo, por la letra Tet, en el mes de Av. ' +
      'Y este es uno de los dos únicos casos en que las dos listas se acercan: el riñón queda en el costado. Cerca no es igual, y la app no convierte eso en acuerdo.',
  },
  virgem: {
    nome: 'Virgo',
    parte: 'Bajo vientre',
    abertura:
      'Cinturón aflojado al final del almuerzo del domingo. Todo el mundo conoce la maniobra discreta por debajo del mantel.',
    leitura:
      'Manilio le da a Virgo el bajo vientre. El Sefer Yetzirah le da la mano izquierda, por la letra Yod, en el mes de Elul. ' +
      'Divergen, y de un modo que muestra el estilo de cada lista: donde la latina está en el tronco, la hebrea está en el miembro.',
  },
  libra: {
    nome: 'Libra',
    parte: 'Nalgas y caderas',
    abertura:
      'Ocho horas al día en la misma silla de oficina, y el tema del grupo del trabajo siempre es la silla.',
    leitura:
      'Manilio le da a Libra las nalgas — "Libra regit clunes", en el verso latino. Los riñones, que el mercado repite desde hace décadas, no están ahí: en la lista PLANETARIA de Ptolomeo (Tetrabiblos III.xvii, siglo II) son de Marte. ' +
      'El Sefer Yetzirah le da la vesícula, por la letra Lamed, en el mes de Tishrei. Dos listas antiguas, y ninguna de las dos dice lo que dice el mercado.',
  },
  escorpiao: {
    nome: 'Escorpio',
    parte: 'Ingle',
    abertura:
      'Escorpio y el sexo son el mismo chiste desde hace décadas. En esta línea, y solo en esta, el chiste tiene respaldo de texto antiguo.',
    leitura:
      'Manilio escribe sin rodeos: "et Scorpios inguine gaudet" — el Escorpión se alegra con la ingle. El Sefer Yetzirah le da el intestino delgado, por la letra Nun, en el mes de Cheshvan. ' +
      'Es el segundo de los dos casos en que las dos listas quedan en la misma región del cuerpo: ingle e intestino delgado comparten el bajo vientre. Vecinas, no iguales.',
  },
  sagitario: {
    nome: 'Sagitario',
    parte: 'Muslos',
    abertura:
      'Pantalón que aprieta en el muslo y sobra en la cintura. La mitad de la fila del probador está discutiendo exactamente eso ahora mismo.',
    leitura:
      'Manilio le da al Centauro los muslos. El Sefer Yetzirah le da el estómago — kivah, en hebreo —, por la letra Samekh, en el mes de Kislev. ' +
      'Divergen: una lista está en la pierna, la otra está en medio del tronco y por dentro.',
  },
  capricornio: {
    nome: 'Capricornio',
    parte: 'Las dos rodillas',
    abertura:
      'Arrodillarse detrás del sofá para encontrar el enchufe, y levantarse apoyando la mano en el brazo del sillón.',
    leitura:
      'Manilio le da a Capricornio las dos rodillas, y el verso latino dice que el signo impera sobre ambas. El Sefer Yetzirah le da el hígado, por la letra Ayin, en el mes de Tevet. ' +
      'Divergen, y es otro par donde la lista latina está por fuera y la hebrea por dentro.',
  },
  aquario: {
    nome: 'Acuario',
    parte: 'Piernas, del muslo hacia abajo',
    abertura:
      'La pierna que se mueve debajo de la mesa durante toda la reunión, y la persona de al lado sin animarse a comentar nada.',
    leitura:
      'Manilio le da a Acuario las piernas, del muslo hacia abajo. El Sefer Yetzirah le da el korkeban, por la letra Tzadi, en el mes de Shevat — y esa es la palabra que las traducciones no resuelven. ' +
      'La app deja el término transliterado del hebreo en vez de elegir un órgano solo para cerrar la línea.',
  },
  peixes: {
    nome: 'Piscis',
    parte: 'Pies',
    abertura:
      'Sacarse el zapato después de un día entero de pie. Es lo primero que se hace al entrar a casa, antes incluso de soltar el bolso.',
    leitura:
      'Manilio cierra la lista donde el cuerpo termina: en el verso latino, los Peces reclaman para sí el derecho sobre los pies. El Sefer Yetzirah le da el bazo, por la letra Qof, en el mes de Adar. ' +
      'La lista latina termina en el pie; la hebrea había EMPEZADO en el pie, allá en Aries, y termina en una víscera. Las dos recorren caminos que no se cruzan en ningún punto.',
  },
};

const CAMADA_TARDIA = {
  cancer:
    '"Cáncer es el estómago" es deducción posterior, no lo que escribió Manilio. El verso latino pone el PECHO bajo Cáncer. El estómago aparece en la lista PLANETARIA de Ptolomeo (Tetrabiblos III.xvii, siglo II), atribuido a la Luna — y de ahí se deslizó la asociación hacia el signo.',
  leao:
    '"Leo es el corazón" es deducción posterior, no lo que escribió Manilio. El verso latino le da a Leo los COSTADOS y los OMÓPLATOS. El corazón aparece en la lista PLANETARIA de Ptolomeo (Tetrabiblos III.xvii, siglo II), atribuido al Sol — y de ahí se deslizó la asociación hacia el signo.',
};

const CHAMADA =
  'Alguien ya te dijo, con mucha seguridad, qué parte del cuerpo "es" de tu signo. ' +
  'Lo que esa persona no sabía es que existen dos listas antiguas de esas, escritas lejos una de la otra — y no coinciden en una sola línea.';

const EXPLICACAO =
  'Siempre hay alguien en el asado jurando que el de Leo es el corazón y el de Libra es el riñón, con la convicción de quien vio eso escrito en algún lado. ' +
  'Y lo vio de verdad: está escrito en todas partes. La pregunta que nadie hace es quién lo escribió primero.' +
  '\n\n' +
  'Fueron dos. No uno: dos — y ahí la historia se pone buena. Una de las listas es romana, en verso latino, y baja por el cuerpo de la cabeza a los pies siguiendo el orden del zodíaco. ' +
  'La otra es hebrea, salió de una cuenta sobre las letras del alfabeto, y casi no habla de la superficie del cuerpo: habla de lo que está por dentro. ' +
  'Se escribieron en mundos distintos y llegaron a mapas distintos de la misma persona.' +
  '\n\n' +
  'La primera es de Manilio, Astronomica II.453-465, siglo I — la atestación más antigua de la correspondencia en texto continuo conservado. ' +
  'Y no es de Ptolomeo, y vale insistir porque el error es corriente: el Tetrabiblos presupone la correspondencia y nunca enumera los doce signos; lo que enumera es la lista de los planetas. ' +
  'La segunda es el Sefer Yetzirah, cap. 5, fechado entre los siglos II y VI, que reparte las 22 letras hebreas en 3 madres, 7 dobles y 12 simples, y amarra cada una de las 12 simples a un signo, a un mes y a un órgano.' +
  '\n\n' +
  'Puestas lado a lado, las doce líneas no coinciden en ninguna. En ninguna — y el desencuentro tiene forma: donde Manilio está en la superficie y en los miembros, el Sefer Yetzirah está en las vísceras. ' +
  'En dos signos las dos llegan a la misma región del cuerpo sin nombrar la misma parte, y es lo más cerca que quedan en dos mil años.' +
  '\n\n' +
  'Por eso las dos aparecen aquí en columnas separadas y rotuladas, nunca sumadas. ' +
  'Sumarlas produciría una tercera lista, que nunca existió y no tiene autor ni siglo — que es exactamente lo que hoy se encuentra en la mayoría de los sitios que repiten el tema.';

const ESTRUTURA = (c) =>
  `Son ${c.total} líneas. En ${c.concordam} de ellas las dos fuentes nombran la misma parte del cuerpo — cero, y ese cero es el dato principal de esta pantalla. ` +
  `En ${c.vizinhas} las dos quedan en la misma región sin nombrar la misma parte; en las otras ${c.divergem}, ni eso.` +
  `\n\n` +
  `Y la forma del desencuentro cabe en dos números. En la lista de Manilio: ${c.manilioSuperficie} entradas de superficie del tronco o de la cabeza, ${c.manilioMembro} de brazo o pierna, ${c.manilioViscera} de órgano interno. ` +
  `En el Sefer Yetzirah: ${c.seferSuperficie} de superficie, ${c.seferMembro} de miembro, ${c.seferViscera} de órgano interno. ` +
  `Un mapa se hizo desde fuera; el otro, desde dentro. No es que discrepen sobre dónde queda cada cosa — es que están mirando cosas distintas.`;

const NOTA_DA_CLASSIFICACAO =
  'Quien llamó "vecinos" a dos pares fue la app, no las fuentes. Ninguna de las dos listas comenta a la otra: Manilio escribe en el siglo I y no podría conocer un texto fechado entre los siglos II y VI. ' +
  '"Vecinas" aquí quiere decir una sola cosa — las dos partes quedan en la misma región del cuerpo. Es lectura de la app sobre las dos listas, y viene rotulada como lectura de la app.';

const NOTA_NAO_FUNDIR =
  'Las dos columnas nunca se vuelven una sola. Mezclarlas produciría una tercera lista, sin autor y sin siglo, que ninguno de los dos textos sostiene — y ese es el error más común del tema. ' +
  'Aquí cada atribución anda con el nombre de la obra pegado, y la pantalla no tiene ninguna línea que diga "la parte del cuerpo de este signo es X".';

const NOTA_LEITURA_DO_APP =
  'Qué es fuente y qué es app. Fuente: los doce versos latinos de Manilio (Astronomica II.453-465, siglo I) y las doce letras simples del Sefer Yetzirah (cap. 5, siglos II–VI). ' +
  'App: la comparación línea por línea, el recuento, y las etiquetas "coinciden", "vecinas" y "divergen". La manera de contarlo en español de hoy también es de la app, y nada más que eso.';

const NOTA_KORKEBAN =
  'korkeban (קורקבן) se queda sin traducir a propósito. Las versiones corrientes oscilan entre molleja, buche y esófago, y ninguna se volvió consenso. ' +
  'Elegir una para dejar la lista redonda sería fijar lo que la fuente no fija.';

const BLOQUEIO =
  'Una salvedad que la app hace sobre sí misma. La columna hebrea de esta pantalla vino de la recensión Gra/Ari, por relato de fuente secundaria — no de la edición crítica que compara los manuscritos (A. Peter Hayman, Mohr Siebeck, 2004). ' +
  'El orden de los órganos varía entre las recensiones del Sefer Yetzirah, así que esta es una versión entre varias, y no la palabra final. ' +
  'La columna latina no tiene esa salvedad: el texto de Manilio está conservado y el verso fue cotejado con la numeración impresa de la propia página.';

const PRECISAO = {
  meiaDia:
    'Sin la hora de nacimiento, el signo solar de aquí se leyó al mediodía del día indicado — el instante que menos se equivoca dentro del día. Quien nació en el cambio de un signo puede recibir el vecino por eso, y es justo quien más lo nota. La hora del acta lo resuelve.',
  semCidade:
    'La hora llegó, pero sin la ciudad no hay huso que aplicar: se leyó como hora de Greenwich. Para quien nació cerca del cambio de un signo, eso puede cambiar la línea entera. Elegir la ciudad de nacimiento lo resuelve.',
};

const NOTAS_DE_FONTE = {
  manilio:
    'La lista latina de esta pantalla, verso por verso. Es la atestación canónica más antigua de la correspondencia signo↔parte del cuerpo en texto continuo conservado.',
  sefer:
    'La lista hebrea de esta pantalla. El capítulo reparte las 12 letras simples entre los 12 signos, los 12 meses y los 12 órganos, siempre con la misma tríada: en el universo, en el año, en el cuerpo.',
  hayman:
    'La edición crítica que coteja más de 19 manuscritos y decide entre las recensiones. Esta base NO la consultó — es el bloqueo declarado de esta pantalla, y está escrito en la pantalla, no solo aquí.',
  kaplan:
    'La traducción por la que la recensión Gra/Ari llegó a esta base. Es una entre varias, y por eso la columna hebrea anda con confianza media en vez de alta.',
  westcott:
    'La traducción victoriana que circula gratis por internet y que la bibliografía manda evitar. Queda citada aquí para decir que NO es la base de esta pantalla.',
  ptolomeu:
    'La lista PLANETARIA — la que Ptolomeo sí enumera. De ahí, y no del signo de Leo, sale el corazón (del Sol); de ahí, y no de Libra, salen los riñones (de Marte). Está aquí para deshacer las dos confusiones más repetidas del tema.',
};

const FALTA = {
  data: {
    texto:
      'Sin la fecha de nacimiento no hay signo solar que calcular. Y la app no pregunta el signo directo: preguntar el signo es pedirle a la persona que se equivoque justo cuando nació en el cambio, que es cuando más importa.',
    comoResolver: 'Ingresa tu fecha de nacimiento en la Carta Astral.',
  },
  efemeride: {
    texto:
      'Las posiciones del cielo no pudieron calcularse ahora. La app prefiere no mostrar nada antes que mostrar un cielo inventado — la comparación de las dos listas sigue abierta más arriba, no depende de efemérides.',
    comoResolver: 'Inténtalo de nuevo en un momento, en la Carta Astral.',
  },
};

export const PACK = {
  idioma: 'es',
  tela: 'Hombre Zodiacal',
  telaDoNascimento: 'Carta Astral',
  rotulos: ROTULOS,
  tipos: TIPOS,
  relacoes: RELACOES,
  orgaos: ORGAOS,
  signos: SIGNOS,
  camadaTardia: CAMADA_TARDIA,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  estrutura: ESTRUTURA,
  notaDaClassificacao: NOTA_DA_CLASSIFICACAO,
  notaNaoFundir: NOTA_NAO_FUNDIR,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaKorkeban: NOTA_KORKEBAN,
  bloqueio: BLOQUEIO,
  precisao: PRECISAO,
  notasDeFonte: NOTAS_DE_FONTE,
  falta: FALTA,
};

export default PACK;
