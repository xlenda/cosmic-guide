// lib/traducoes/artemidoro.es.js
// EL PACK ESPAÑOL de las cinco especies de sueño — español neutro de app.
//
// Misma FORMA que lib/traducoes/artemidoro.pt.js: mismas claves, mismos
// campos, funciones con la misma firma. Lo que NUNCA cambia entre packs: el
// verbatim inglés de attalus.org (traducir una cita es falsificarla), los loci
// (1.2.45 sigue siendo 1.2.45), el griego y su transliteración, y las CLAVES
// internas — los ids de las especies son los nombres griegos transliterados en
// los tres packs, porque son datos, no texto de pantalla.
//
// Todas las reglas de la cabecera de lib/artemidoro.js valen para cada string
// de aquí: primero engancha y después la fuente, locus en toda afirmación
// histórica, ninguna afirmación sobre el cuerpo, nada de veredicto ni de
// promesa, y — la que más importa en esta función — CLASIFICAR NO ES
// INTERPRETAR. En ningún lugar sale "tu sueño significa que…".

function recibo({ autor, obra, locus, quando }) {
  return `${autor}, ${obra} ${locus}, ${quando}`;
}

const AUTORES = {
  oneirocritica: 'Artemidoro de Daldis',
  macrobio: 'Macrobio',
  edicaoPack: 'Roger A. Pack',
  harrisMcCoy: 'Daniel E. Harris-McCoy',
  hammondThonemann: 'Martin Hammond y Peter Thonemann',
};

// ---------------------------------------------------------------------------
// LAS CITAS — verbatim, sin traducir
// ---------------------------------------------------------------------------
const VERBATIM = {
  definicao11: {
    texto: 'A dream differs from a vision in that the one is indicative of what is to come, the other of what is.',
    parafrase:
      'Uno de los dos apunta a lo que viene; el otro, a lo que ya es. Es la línea que separa el enhypnion del oneiros — y las traducciones inglesas no coinciden sobre qué palabra inglesa usar para cada término griego, y por eso esta app se queda con el griego.',
    locus: 'Artemidoro de Daldis, Oneirocritica 1.1, trad. inglesa de attalus.org',
    elisao: null,
  },
  checklist19: {
    texto:
      "[the interpreter must know] the dreamer's identity, occupation, birth, financial status, … and age. Also, the nature of the dream itself must be examined accurately.",
    parafrase:
      'Antes de interpretar hay que saber quién es la persona, a qué se dedica, de dónde viene, cuánto tiene y qué edad tiene — y examinar el propio sueño con cuidado.',
    locus: 'Artemidoro de Daldis, Oneirocritica 1.9, trad. inglesa de attalus.org',
    elisao:
      'La elisión de los puntos suspensivos es nuestra, y queda dicha: ahí la lista original trae un sexto punto, el estado del cuerpo de quien sueña. Existe, está en Oneirocritica 1.9 para quien quiera comprobarlo, y la app no lo usa — porque aquí no se habla del cuerpo de nadie.',
  },
  prefacio: {
    texto:
      'I did not rely upon any simple theory of probabilities but rather on experience and the testimony of actual dream-fulfillments.',
    parafrase:
      'Él se presenta como alguien que juntó desenlaces comprobados, no como alguien que recibió una revelación — y eso es lo que justifica el Libro V, con los 95 casos.',
    locus: 'Artemidoro de Daldis, Oneirocritica, prefacio, trad. inglesa de attalus.org',
    elisao: null,
  },
};

// ---------------------------------------------------------------------------
// EL GANCHO — vida real, sin nombre propio, sin párrafo, sin griego
// ---------------------------------------------------------------------------
const CHAMADA = {
  neutra:
    'Discutiste con alguien a las siete de la noche y soñaste con la misma discusión a medianoche. ¿Eso es un aviso, o es el día que vuelve? ' +
    'Antes de preguntar qué quiere decir un sueño hay otra pregunta, y casi ninguna app la hace: es la que decide si hay algo que decir.',
  enhypnion:
    'Por lo que respondiste, el sueño te devolvió el día que tuviste. Quien se acuesta con hambre sueña que come; quien se acuesta con rabia del jefe sueña con el jefe. ' +
    'Eso tiene nombre, tiene dueño y tiene casi dos mil años — y lo primero que hace ese nombre es quitarle peso a tu sueño.',
  oneiros:
    'Por lo que respondiste, no fue tu día volviendo: entró en el sueño gente, un lugar o una escena que no viviste ese día. ' +
    'Desde aquí viene la segunda pregunta, la que casi nadie hace: ¿de quién es este sueño?',
};

// ---------------------------------------------------------------------------
// LA EXPLICACIÓN — abre en concreto, cierra con el recibo
// ---------------------------------------------------------------------------
const EXPLICACAO = {
  neutra:
    'Día infernal en el trabajo, el jefe encima todo el tiempo, y de noche ahí está él en el sueño. Por la mañana la persona escribe "soñar con el jefe" en Google y el primer sitio responde que es miedo a la autoridad. ' +
    'Solo que lo que pasó a las cinco de la tarde lo explica mejor.' +
    '\n\n' +
    'Quien separó esas dos cosas por escrito — el sueño que devuelve el día y el sueño que trae otra cosa — fue Artemidoro de Daldis, en la Oneirocritica, siglo II d.C. ' +
    'Son cinco libros: el cuarto es sobre método y el quinto es una colección de 95 sueños con el desenlace anotado. No es un diccionario de símbolos; es un manual de cómo preguntar.' +
    '\n\n' +
    'Él tiene una palabra para cada tipo. Enhypnion (en griego — el sueño que refleja lo que la persona está viviendo) es el del hambriento que sueña que come, el del sediento que sueña que bebe, el del miedoso que ve lo que teme, el de quien ama y sueña que está con quien ama: los ejemplos son suyos, en 1.2. ' +
    'Oneiros es el otro, el sueño significativo de lo que vendrá (1.1).' +
    '\n\n' +
    'Solo después vienen las cinco especies, y responden otra pregunta: ¿de quién es el sueño — solo tuyo, de otra persona que conoces, de ustedes dos, de tu ciudad o del mundo (1.2.45–55)? ' +
    'Responde y la app dice en qué cajón cae tu relato, con el párrafo al lado. No dice qué quiere decir el sueño: en la cuenta de Artemidoro eso depende de quién eres tú, y en 1.9 él enumera lo que habría que saber antes.',
  enhypnion:
    'Día infernal en el trabajo, el jefe encima todo el tiempo, y de noche ahí está él en el sueño. Por la mañana viene la búsqueda en Google, y el primer sitio responde que el jefe en un sueño es miedo a la autoridad. ' +
    'Solo que lo que pasó a las cinco de la tarde lo explica mejor: el sueño devolvió el día.' +
    '\n\n' +
    'Eso tiene nombre desde el siglo II d.C. Artemidoro de Daldis, en la Oneirocritica, llama enhypnion (en griego — el sueño que refleja lo que la persona está viviendo) al sueño hecho del ahora. ' +
    'Los ejemplos son suyos, en 1.2: el hambriento sueña que come, el sediento que bebe, el miedoso ve lo que teme, quien ama sueña que está con quien ama. En su cuenta, este tipo no anuncia nada — es espejo de lo que ya es, no aviso de lo que viene.' +
    '\n\n' +
    'La frase que separa los dos tipos está en 1.1 y es corta: "A dream differs from a vision in that the one is indicative of what is to come, the other of what is." ' +
    'Las traducciones inglesas no coinciden sobre qué palabra usar para cada término griego, y por eso esta app se queda con el griego: enhypnion para el sueño de lo que es, oneiros para el de lo que vendrá.' +
    '\n\n' +
    'Nada de esto es un veredicto sobre tu noche. Es el cajón donde la fuente pone el relato que diste, con el párrafo al lado. ' +
    'Si mañana miras mejor y respondes distinto, el cajón cambia — y así trabajaba él: por el relato entero y por quien lo contó (1.9).',
  oneiros:
    'Hay sueños que el día no explica. No pensaste en esa persona, no pasaste cerca de ese lugar, no tenías rabia ni miedo de nada — y aun así la escena vino entera, con gente, dirección y hora.' +
    '\n\n' +
    'Para ese, Artemidoro de Daldis usa otra palabra: oneiros (en griego — el sueño significativo de lo que vendrá), y lo separa del enhypnion, que es el sueño hecho de lo que la persona ya estaba viviendo. ' +
    'La distinción está en la Oneirocritica 1.1–1.2, siglo II d.C., y la frase es esta: "A dream differs from a vision in that the one is indicative of what is to come, the other of what is."' +
    '\n\n' +
    'Caer de ese lado no quiere decir que el sueño anuncie lo que esperas, ni algo bueno ni algo malo. Quiere decir solo esto, y solo por tu relato: no es tu día volviendo.' +
    '\n\n' +
    'Aquí entran las cinco especies. Antes de cualquier símbolo, él pregunta de quién es el sueño: solo tuyo, de otra persona que conoces, de ustedes dos, de tu ciudad o del mundo (1.2.45–55). ' +
    'Es una pregunta estructural, sacada del texto, y es la que la app hace enseguida — en vez de abrir un diccionario de imágenes.',
};

// ---------------------------------------------------------------------------
// LAS CINCO ESPECIES — Oneirocritica 1.2.45–55
// ---------------------------------------------------------------------------
const ESPECIES = {
  idioi: {
    nome: 'solo tuyo',
    oQueE: 'El sueño es tuyo de principio a fin: tú haces y tú aguantas todo, y nadie más entra en la escena con un papel.',
    exemplo: 'Vas tarde, corres, pierdes el bus y pierdes la entrevista — y no hay nadie más ahí.',
  },
  allotrioi: {
    nome: 'de otra persona',
    oQueE: 'El sueño es sobre otra persona, y es alguien que conoces: tu madre, tu jefe, tu ex. Tú estás ahí mirando.',
    exemplo: 'Tu madre entra en una casa que nunca viste, y tú te quedas parado en la puerta, mirando.',
  },
  koina: {
    nome: 'de ustedes dos',
    oQueE: 'Tú y alguien más, juntos en la misma escena, los dos con papel en lo que pasa.',
    exemplo: 'Tú y la persona con la que duermes discuten dentro de un coche parado, y hablan los dos.',
  },
  demosia: {
    nome: 'de tu ciudad',
    oQueE: 'El sueño no es de nadie en particular: es del lugar que es de todos — la plaza, la calle, el puerto, el templo.',
    exemplo: 'La plaza del centro llena de gente que no conoces, y algo pasando ahí en medio.',
  },
  kosmika: {
    nome: 'del mundo',
    oQueE: 'El cielo y el tiempo: lo que aparece allá arriba y alcanza a todos a la vez.',
    exemplo: 'El cielo se pone rojo a media tarde y la calle entera se para a mirar.',
  },
};

const ESPECIE_TEXTO = (e) =>
  `Por lo que respondiste, el sueño es ${e.nome} — ${e.transliteracao} (${e.grego}), en la lista de las cinco. ${e.oQueE}`;

const SEM_ESPECIE = {
  faltaResposta:
    'Todavía falta una respuesta para decir de quién es el sueño — y la app prefiere decir que falta antes que elegir una de las cinco a ciegas.',
  pessoaDesconhecida:
    'Dijiste que no conoces a la persona que apareció, y aquí la app se detiene. La segunda de las cinco especies está definida con todas las letras como otra persona CONOCIDA de quien soñó (1.2.45). ' +
    'Qué hace Artemidoro con el desconocido, esta investigación no lo leyó — y empujar tu relato al cajón más parecido sería inventar método en su nombre.',
  foraDaLista:
    'Las cinco especies dicen de QUIÉN es el sueño: tú, otra persona que conoces, ustedes dos, la ciudad, el mundo (1.2.45–55). ' +
    'Respondiste que no es nada de eso, y la lista termina ahí — no hay un sexto cajón en la fuente, y la app no abre uno. Se queda sin especie, y queda dicho.',
};

// ---------------------------------------------------------------------------
// EL VOCABULARIO DE 1.1–1.2
// ---------------------------------------------------------------------------
const VOCABULARIO = {
  enhypnion: {
    nome: 'el sueño que devuelve el día',
    oQueE:
      'Refleja lo que la persona está viviendo mientras duerme: el hambre, el miedo, la falta que le hace alguien, la pelea que no se le fue de la cabeza. En la cuenta de Artemidoro, este tipo no anuncia nada — y los ejemplos son suyos.',
  },
  oneiros: {
    nome: 'el sueño que trae otra cosa',
    oQueE: 'El sueño significativo de lo que vendrá. Es lo que queda cuando el día no explica la escena.',
  },
  theorematikoi: {
    nome: 'el sueño directo',
    oQueE:
      'Pasa exactamente como fue visto. El ejemplo es suyo: un hombre soñó con un naufragio, y el naufragio vino como en el sueño. Solo se sabe después, que es justamente el problema.',
  },
  allegorikoi: {
    nome: 'el sueño alegórico',
    oQueE: 'Dice una cosa por medio de otra. Las cinco especies son subdivisiones de este — no del sueño en general.',
  },
  horama: {
    nome: 'la visión',
    oQueE:
      'Una visión ligada a los sueños significativos. La definición exacta no llegó clara hasta nosotros, y la app lo dice en vez de completar lo que falta.',
  },
  chrematismos: {
    nome: 'el sueño en que alguien habla',
    oQueE:
      'Una persona o una divinidad habla e instruye a quien duerme. Esta investigación leyó la entrada en resumen, no el pasaje entero — y por eso la descripción se detiene aquí.',
  },
  phantasma: {
    nome: 'la imagen del umbral',
    oQueE:
      'La imagen extraña que aparece al borde del sueño, sin contenido de futuro. Esta investigación leyó la entrada en resumen, no el pasaje entero — y por eso la descripción se detiene aquí.',
  },
};

// ---------------------------------------------------------------------------
// LAS PREGUNTAS
// ---------------------------------------------------------------------------
const PERGUNTAS = {
  diaAnterior: {
    pergunta:
      '¿Lo que apareció en el sueño es lo que viviste ese día? Hambre, miedo, la falta que te hace alguien, la pelea de las siete, el asunto que no se te fue de la cabeza.',
    opcoes: {
      sim: 'Sí — mi día está ahí dentro',
      nao: 'No — vino algo que no viví',
    },
  },
  quemApareceu: {
    pergunta: '¿De quién es el sueño? Piensa en quién tiene papel en la escena, no en quién pasa por el fondo.',
    opcoes: {
      'so-voce': 'Solo yo',
      'outra-pessoa': 'Otra persona, y yo mirando',
      'voce-e-outra': 'Yo y alguien más, los dos en la escena',
      'a-cidade': 'La ciudad: la calle, la plaza, un lugar que es de todos',
      'o-mundo': 'El cielo, el tiempo, algo que alcanza a todos a la vez',
      'nada-disso': 'Nada de eso',
    },
  },
  conheceQuemApareceu: {
    pergunta: '¿Conoces a esa persona en la vida real?',
    opcoes: { sim: 'La conozco', nao: 'No la conozco' },
  },
  aindaComVoce: {
    pergunta: '¿El sueño siguió contigo después de despertar?',
    opcoes: {
      sim: 'Siguió — pasé el día con eso',
      nao: 'Se fue apenas me levanté',
    },
  },
};

const PERGUNTA_DO_APP =
  'Esta pregunta es de la app, no de la fuente: ningún texto antiguo de esta investigación la usa como criterio. Sirve para que mires mejor — y no cambia la clasificación.';

// ---------------------------------------------------------------------------
// EL CHECKLIST DE 1.9
// ---------------------------------------------------------------------------
const CHECKLIST_INTRO =
  'Antes de decir qué quiere decir cualquier imagen, Artemidoro exige saber quién soñó. La lista es suya, tiene seis puntos, y es lo que separa su método de un diccionario:';

const CHECKLIST = {
  identidade: 'quién es la persona',
  oficio: 'a qué se dedica',
  nascimento: 'de dónde viene',
  dinheiro: 'cuánto tiene',
  corpo:
    'cómo está su cuerpo — este punto está en la lista de él y la app no lo usa: aquí no se habla del cuerpo de nadie. Queda citado para que puedas comprobar la lista entera en la fuente.',
  idade: 'qué edad tiene',
};

// ---------------------------------------------------------------------------
// EL PORQUÉ
// ---------------------------------------------------------------------------
const PORQUE_CAMADA = {
  enhypnion:
    'Respondiste que tu día está ahí dentro, y es esa respuesta la que decide: por la pregunta de Artemidoro (1.2), el sueño que refleja lo que la persona está viviendo es el enhypnion.',
  oneiros:
    'Respondiste que vino algo que no viviste ese día, y es esa respuesta la que decide: el sueño que no refleja el ahora es el que él llama oneiros (1.1).',
};

const PORQUE_ESPECIE = {
  'so-voce': 'Y dijiste que solo tú apareces en la escena — eso pone el relato en la primera de las cinco especies.',
  'outra-pessoa-conhecida':
    'Y dijiste que quien aparece es otra persona, y que la conoces — es exactamente la definición de la segunda especie.',
  'outra-pessoa-desconhecida':
    'Sobre la especie, la app se detuvo: dijiste que no conoces a la persona que apareció, y la definición de la fuente pide que sea conocida.',
  'voce-e-outra': 'Y dijiste que están los dos en la escena, cada uno con papel — es lo que abarca la tercera especie.',
  'a-cidade': 'Y dijiste que el sueño es del lugar que es de todos — calle, plaza, puerto, templo. Es la cuarta especie.',
  'o-mundo': 'Y dijiste que es el cielo, el tiempo, lo que alcanza a todos a la vez — es la quinta.',
  'nada-disso': 'Sobre la especie, no salió: las cinco dicen de quién es el sueño, y respondiste que no es de ninguno.',
};

// ---------------------------------------------------------------------------
// LAS ADVERTENCIAS QUE ACOMPAÑAN A TODA CLASIFICACIÓN
// ---------------------------------------------------------------------------
const NOTA_SUBESPECIE =
  'Un detalle que cambia el tamaño de la afirmación. Las cinco especies son subdivisiones del sueño alegórico — el que dice una cosa por medio de otra (Oneirocritica 1.2.1). ' +
  'El otro tipo, el sueño directo, es el que pasa exactamente como fue visto: el ejemplo del propio Artemidoro es un hombre que soñó con un naufragio, y el naufragio vino como en el sueño. ' +
  'Solo el desenlace separa uno del otro, y desenlace la app no tiene. Por eso nombra la especie por quien apareció y no decreta que tu sueño sea alegórico.';

const NOTA_NAO_E_DICIONARIO =
  'Por qué aquí no hay diccionario de símbolos. "El agua es emoción, caer es perder el control, volar es libertad" no está en Artemidoro ni en ninguna fuente antigua de esta investigación — es diccionario moderno, de revista. ' +
  'Su método es lo contrario: el mismo sueño cambia de lectura según quién soñó. El caso que él registra es el más limpio que hay — un esclavo soñó que tenía tres penes; fue liberado y, con la manumisión, pasó a tener tres nombres, como todo ciudadano romano (5.91). ' +
  'En un hombre que ya era libre, el mismo sueño no diría nada de eso. En 1.79 es el dinero el que cambia todo: la lectura depende de lo que tiene quien soñó y de lo que tiene su madre. ' +
  'Por eso esta app clasifica el relato y no vende significado de imágenes.';

const NOTA_LEITURA_DO_APP =
  'Qué es fuente y qué es app. La separación entre el sueño que devuelve el día y el sueño que trae otra cosa es de Artemidoro de Daldis, Oneirocritica 1.1–1.2, siglo II d.C.; las cinco especies son de 1.2.45–55; la exigencia de saber quién soñó es de 1.9. ' +
  'Lo nuestro: las preguntas en español de hoy, el orden en que aparecen y una de ellas entera — la de si el sueño siguió contigo después de despertar, que ningún texto antiguo de esta investigación autoriza como criterio y que, por eso, no decide nada.';

const NOTA_DISCORDANCIA = (c) =>
  c.camada === 'enhypnion'
    ? 'Tus dos respuestas tiran para lados distintos: dijiste que tu día está ahí dentro y, al mismo tiempo, que el sueño siguió contigo después de despertar. ' +
      'La app no desempata sola y no esconde la contradicción. Quien decide aquí es la pregunta de Artemidoro (1.2), porque la otra es nuestra.'
    : 'Tus dos respuestas tiran para lados distintos: dijiste que vino algo que no viviste ese día y, al mismo tiempo, que el sueño se fue apenas te levantaste. ' +
      'La app no desempata sola y no esconde la contradicción. Quien decide aquí es la pregunta de Artemidoro (1.2), porque la otra es nuestra.';

// ---------------------------------------------------------------------------
// QUÉ FALTA, Y DÓNDE RESPONDER
// ---------------------------------------------------------------------------
const FALTA = {
  diaAnterior: {
    texto:
      'Falta la primera pregunta, y es la que decide todo lo demás: ¿lo que apareció en el sueño es lo que viviste ese día? ' +
      'Sin ella no hay forma de saber si el sueño te devolvió el día o trajo otra cosa, y esos dos cajones no se parecen en nada. La app no elige uno por ti.',
    comoResolver: 'Responde la primera pregunta en la pantalla de Sueños.',
  },
  quemApareceu: {
    texto:
      'Falta decir de quién es el sueño. Las cinco especies de Artemidoro separan el sueño que es solo tuyo, el que es de otra persona, el de ustedes dos, el de la ciudad y el del mundo — y la diferencia entre ellas es quién tiene papel en la escena. ' +
      'Sin esa respuesta la app no tiene cómo elegir, y no va a elegir por su cuenta.',
    comoResolver: 'Responde de quién es el sueño, en la pantalla de Sueños.',
  },
  conheceQuemApareceu: {
    texto:
      'Falta una respuesta corta, y es decisiva: ¿conoces a la persona que apareció? La segunda especie está definida como otra persona conocida de quien soñó (1.2.45), ' +
      'así que conocerla o no cambia el cajón — y, cuando no la conoces, esta investigación no sabe cuál es el cajón.',
    comoResolver: 'Responde si conoces a la persona, en la pantalla de Sueños.',
  },
};

// ---------------------------------------------------------------------------
// EL CHROME DE LA PANTALLA — las etiquetas de screens/DreamScreen.js
// ---------------------------------------------------------------------------
// Nace AQUÍ, y no en lib/i18n.js, por el mismo motivo que todo lo demás: la
// pantalla es escaparate, no redacta ni una línea y solo pasa el `lang`. Cada
// etiqueta existe en los tres packs con la MISMA clave — quien agregue una
// aquí está obligado a agregarla en los otros dos, y test/artemidoro.test.js
// lo comprueba.
const CHROME = {
  kicker: 'ANTES DE INTERPRETAR',
  titulo: '¿Este sueño dice algo?',
  abrir: 'Abrir las preguntas',
  fechar: 'Cerrar',
  perguntasTitulo: 'RESPONDE CON LO QUE RECUERDES',
  rotuloDaFonte: 'DE LA FUENTE',
  rotuloDoApp: 'PREGUNTA DE LA APP',
  limpar: 'Volver a empezar las respuestas',
  rotuloCamada: 'LA CAPA',
  rotuloEspecie: 'LA ESPECIE',
  rotuloSemEspecie: 'SIN ESPECIE',
  rotuloPorque: 'POR QUÉ CAYÓ AQUÍ',
  rotuloDiscordancia: 'LAS DOS RESPUESTAS TIRAN PARA LADOS DISTINTOS',
  explicacaoAbrir: 'Por qué esta pregunta va primero',
  explicacaoFechar: 'Cerrar el texto',
  especiesAbrir: 'Ver las cinco especies',
  especiesFechar: 'Cerrar las cinco',
  especiesTitulo: 'LAS CINCO, TAL COMO ESTÁN EN LA FUENTE',
  exemploRotulo: 'POR EJEMPLO',
  ressalvasAbrir: 'Leer las advertencias y la bibliografía',
  ressalvasFechar: 'Cerrar las advertencias',
  checklistTitulo: 'LO QUE ÉL EXIGÍA SABER ANTES',
  verbatimTitulo: 'EN EL ORIGINAL',
  verbatimParafrase: 'EN CONVERSACIÓN',
  verbatimElisao: 'SOBRE EL CORTE',
  fontesTitulo: 'DE DÓNDE VIENE ESTO',
  compartilhar: 'Compartir',
  copiado: 'Texto copiado — solo falta pegarlo donde quieras.',
  naoCopiou: 'No se pudo copiar por aquí. Selecciona el texto y cópialo a mano.',
  ponteIA:
    'La lectura por inteligencia artificial de esta pantalla es otra cosa, y es de la app — no de Artemidoro. Esta parte de arriba solo dice en qué cajón cae tu relato y qué exigiría saber la fuente antes de cualquier interpretación.',
  marca: 'Cosmic Guide',
};

// El texto que sale al compartir. Se arma con lo que la clasificación ya
// devolvió — la pantalla no escribe ni una palabra por su cuenta.
const TEXTO_COMPARTILHAVEL = (r) => {
  if (!r || !r.disponivel) return null;
  const linhas = [
    'Antes de preguntar qué quiere decir un sueño viene otra pregunta: ¿este sueño dice algo?',
    '',
    `La capa: ${r.camadaNome} — ${r.camadaTransliteracao} (${r.camadaGrego})`,
    r.camadaRecibo,
  ];
  if (r.especieNome) {
    linhas.push('', `La especie: ${r.especieNome} — ${r.especieTransliteracao} (${r.especieGrego})`, r.especieRecibo);
  } else {
    linhas.push('', 'La especie: no se pudo decir — y la app prefiere decirlo antes que elegir una de las cinco a ciegas.');
  }
  linhas.push('', 'Cosmic Guide');
  return linhas.join('\n');
};

// ---------------------------------------------------------------------------
// LA BIBLIOGRAFÍA
// ---------------------------------------------------------------------------
const FONTES = [
  'Artemidoro de Daldis, Oneirocritica (Ὀνειροκριτικά), siglo II d.C. — cinco libros, escritos alrededor del 170–200 d.C.; el Libro IV es sobre método y el Libro V reúne 95 sueños con el desenlace anotado',
  'Oneirocritica 1.1–1.2 — enhypnion y oneiros, la división entre sueño directo (theorematikoi) y alegórico (allegorikoi), y las cinco especies del alegórico en 1.2.45–55',
  'Oneirocritica 1.9 — lo que el intérprete necesita saber sobre quien soñó antes de interpretar cualquier imagen',
  'Oneirocritica 5.91 y 1.79 — los dos casos en que el mismo sueño cambia de lectura según la situación de quien soñó: el esclavo que ganó tres nombres y el pobre de madre rica',
  'Traducción inglesa parcial y gratuita en attalus.org/translate/artemidorus.html; edición griega de referencia de Roger A. Pack (Teubner, 1963); traducción y comentario de Daniel E. Harris-McCoy (Oxford, 2012); traducción de Martin Hammond con introducción de Peter Thonemann (Oxford World\'s Classics, 2020)',
  'Papiro Chester Beatty III (Egipto, c. 1220 a.C.) y la serie Ziqīqu (tablillas de Asurbanipal, siglo VII a.C.) — los diccionarios de equivalencia fija que vinieron antes, y de los que el método de Artemidoro es lo contrario',
  'Macrobio, Commentarii in Somnium Scipionis, c. 430 d.C. — la SEGUNDA taxonomía de cinco especies de la Antigüedad tardía, de otro autor y otro siglo; esta investigación no comprobó sus términos en edición, y por eso la app no los enumera',
];

export const PACK = {
  idioma: 'es',
  tela: 'Sueños',
  autores: AUTORES,
  recibo,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  especies: ESPECIES,
  especieTexto: ESPECIE_TEXTO,
  semEspecie: SEM_ESPECIE,
  vocabulario: VOCABULARIO,
  perguntas: PERGUNTAS,
  perguntaDoApp: PERGUNTA_DO_APP,
  checklistIntro: CHECKLIST_INTRO,
  checklist: CHECKLIST,
  porqueCamada: PORQUE_CAMADA,
  porqueEspecie: PORQUE_ESPECIE,
  notaSubespecie: NOTA_SUBESPECIE,
  notaNaoEDicionario: NOTA_NAO_E_DICIONARIO,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  notaDiscordancia: NOTA_DISCORDANCIA,
  falta: FALTA,
  verbatim: VERBATIM,
  fontes: FONTES,
  chrome: CHROME,
  textoCompartilhavel: TEXTO_COMPARTILHAVEL,
};

export default PACK;
