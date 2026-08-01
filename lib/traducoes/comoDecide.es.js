// lib/traducoes/comoDecide.es.js
// El PACK ESPAÑOL de la tarjeta "Cómo decide esta app" — hermano de
// comoDecide.pt.js, con la MISMA forma: mismas claves, mismos campos,
// funciones con la misma firma. El motor vive en lib/comoDecide.js.
//
// Español neutro-latino, como en lib/traducoes/synastry.es.js y seita.es.js.
// Las reglas del encabezado del motor valen aquí enteras: engancha primero y
// recibo después, ninguna afirmación sobre el cuerpo, ninguna promesa, ningún
// porcentaje — ni siquiera para nombrar el que la app no usa.
//
// Lo que NO vive aquí: obra, autor y fecha. Son datos del motor, en portugués
// canónico, y pasan por traduzirAutor/traduzirQuando antes de aparecer. La
// obra nunca se traduce; el autor recibe la forma consagrada del idioma; la
// fecha recibe la forma del idioma (siglo II a.C.).

function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} y ${itens[itens.length - 1]}`;
}

const ABERTURA = {
  titulo: 'Cómo decide esta app',
  chamada:
    'Lees que hoy no es día de mandar ese mensaje y, en el fondo, queda la pregunta: ¿de dónde salió eso? ' +
    '¿De una cuenta que cualquiera puede revisar, o de un texto que le sirve a cualquier persona un martes cualquiera?',
  explicacao:
    'Esta pantalla responde, pantalla por pantalla, separando tres cosas que suelen llegar mezcladas.' +
    '\n\n' +
    'Lo que la app CALCULÓ: posición de planeta, fase de la Luna, instante exacto. Es número, se revisa en cualquier efeméride, y si está mal está mal — no hay interpretación que lo salve.' +
    '\n\n' +
    'Lo que la app LEYÓ: la tradición, siempre con obra, autor y siglo. Es atribución de gente: alguien escribió eso, en algún lugar, en alguna época. Puede ser hermosa y puede ser antigua, pero no es de la misma naturaleza que la cuenta.' +
    '\n\n' +
    'Lo que es LECTURA DE LA APP: la manera de decirlo en español de hoy, el orden de las pantallas, qué entra y qué queda afuera. Eso es nuestro, y va firmado.' +
    '\n\n' +
    'Cuando la cuenta y la tradición no coinciden, manda la fuente, y la diferencia queda escrita en vez de escondida. Cuando la investigación no encontró de dónde viene algo, también queda escrito.',
};

const ROTULOS = {
  calculado: 'Lo que la app calculó',
  tradicao: 'Lo que la app leyó — y de quién',
  leituraDoApp: 'Lo que es decisión nuestra',
  naoFaz: 'Lo que la app se niega a hacer',
  convencoes: 'Lo que vale en toda la app',
  decisoes: 'Pantalla por pantalla',
  fontes: 'Dónde está escrito',
};

const EXIGENCIA = {
  rotulos: {
    data: 'tu fecha de nacimiento',
    hora: 'tu hora de nacimiento',
    cidade: 'tu ciudad de nacimiento',
  },
  precisa: (nomes) => `Esta cuenta necesita ${lista(nomes)}.`,
  falta: (nomes) => `Falta ${lista(nomes)} para que esta cuenta corra. Sin eso la app muestra lo que falta, no un resultado verosímil.`,
  pronto: 'Con lo que ya cargaste, esta cuenta corre.',
  comoResolver: 'El campo está en la Carta Astral.',
};

// La datación llega YA puntuada del motor (ver reciboDaFonte): "siglo II d.C."
// ya termina en punto y "2nd c. AD" no terminaría.
const RECIBO = ({ autor, obra, quando }) => `Quién escribió esto: ${autor}, ${obra} — ${quando}`;
const RECIBO_SEM_AUTOR = ({ obra, quando }) => `Dónde está escrito: ${obra} — ${quando} Obra sin autor conocido.`;
const SEM_FONTE =
  'Sin edición primaria leída en esta base. El dato existe en el relevamiento, la fuente de primera mano todavía no fue verificada — y mientras no lo sea, vale menos que las otras de esta pantalla.';

// Complemento a lib/traducoes/datacao.js, que todavía no conoce a estos
// cuatro. El orden lo fija el motor: datacao.js manda, esto solo rellena.
const AUTORES = {
  'Manílio': 'Manilio',
  'Artemidoro': 'Artemidoro',
  'Dião Cássio': 'Dión Casio',
  'Aristóteles': 'Aristóteles',
};

// Las citas: `texto` es el inglés de Robbins (Loeb/Harvard, 1940) y de Cary
// (Loeb), IDÉNTICO en los tres packs. Cambian la paráfrasis — firmada por la
// app, nunca entre comillas — y el idioma del locus.
const VERBATIM = {
  ptolomeuZodiaco: {
    texto: 'and from no other source',
    parafrase:
      'Los comienzos de los signos se cuentan desde los equinoccios y los solsticios — y desde ninguna otra fuente. La frase es corta y es categórica: quien cuenta de otra manera está contando otra cosa.',
    locus: 'Ptolomeo, Tetrabiblos I.22, trad. Robbins, 1940',
  },
  ptolomeuAversao: {
    texto:
      'if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions',
    parafrase:
      'Signos ajenos entre sí, u opuestos, producen las enemistades más hondas y las peleas más largas. Es la línea que impide poner la oposición en la cima de la escala: en la fuente está en el fondo, junto a la aversión.',
    locus: 'Ptolomeo, Tetrabiblos IV.7, trad. Robbins, 1940',
  },
  dioCassio: {
    texto:
      'The custom, however, of referring the days to the seven stars called planets was instituted by the Egyptians, but is now found among all mankind, though its adoption has been comparatively recent',
    parafrase:
      'La propia fuente primaria de los días planetarios dice que la costumbre es reciente, y agrega que los griegos antiguos no la conocían. Quien llama inmemorial a la semana de los planetas contradice al texto que cita.',
    locus: 'Dión Casio, Historia Romana 37.18, trad. Cary',
  },
};

const CONVENCOES = {
  zodiaco: {
    nome: 'El zodíaco de aquí es el trópico, contado desde las estaciones',
    chamada:
      'Un día alguien te dice que "en realidad" sos del signo anterior, y la charla termina en empate porque nadie sabe de dónde viene cada versión. Las dos existen, las dos tienen dueño, y la distancia entre ellas está medida.',
    texto:
      'La app cuenta los signos desde los equinoccios y solsticios: el punto donde el Sol cruza el ecuador celeste en marzo abre Aries, y de ahí en adelante de treinta en treinta grados. Eso se llama zodíaco trópico, y la fuente es categórica sobre el punto de partida.' +
      '\n\n' +
      'La astrología india cuenta desde las estrellas y corrige la precesión de los equinoccios — el lento deslizamiento del eje de la Tierra, que mueve el referencial cerca de un grado cada setenta años. Por eso, para la mayoría de la gente, el signo védico es el anterior al occidental. No es error de nadie: son dos puntos de partida, cada uno coherente por dentro, y la diferencia es astronomía conocida. El texto que registra el encuentro de las dos tradiciones es una traducción del griego al sánscrito hecha en el siglo II.',
  },
  efemeride: {
    nome: 'La cuenta sale de efeméride, nunca de tabla de fechas',
    chamada:
      'Quien nació el 23 de octubre se pasa la vida siendo Libra en un sitio y Escorpio en otro. No es pelea de opiniones: la frontera entre los dos es un instante, y un instante no entra en una tabla de calendario.',
    texto:
      'La app calcula la longitud del Sol en el minuto de tu nacimiento y ve de qué lado de la frontera cayó. Antes hacía lo que hace casi todo el mundo: tabla fija de fechas. Midiendo el período de 1950 a 2030, aquella tabla erraba 293 días de 29.585 — y el 23 de octubre erraba en 44 de los 81 años, siempre en el cambio, siempre con quien más le importa la respuesta.' +
      '\n\n' +
      'La regla que quedó vale para toda la app: ninguna afirmación sobre el cielo sale de tabla, sale de cuenta. Y cuando la cuenta no corre — falta fecha, falta hora, falta ciudad —, la app dice que no corre y dice dónde cargarlo. Cielo verosímil es cielo inventado.',
  },
  regencias: {
    nome: 'Las regencias son las de los siete que se ven a simple vista',
    chamada:
      'Leés acá que quien rige Escorpio es Marte, buscás en internet y encontrás Plutón en todos lados. Parece que la app se equivocó. Es al revés, y la fecha resuelve la discusión en una línea.',
    texto:
      'La tabla de la app es la antigua: Marte en Aries y Escorpio, Venus en Tauro y Libra, Mercurio en Géminis y Virgo, la Luna en Cáncer, el Sol en Leo, Júpiter en Sagitario y Piscis, Saturno en Capricornio y Acuario. Y no está aprendida de memoria: cada línea se deduce de la distancia máxima que cada planeta puede alejarse del Sol, que es cosa observable en el cielo.' +
      '\n\n' +
      'Urano fue descubierto en 1781, Neptuno en 1846 y Plutón en 1930. Las regencias modernas atribuidas a ellos son capa del siglo XIX y XX, y esta investigación no encontró quién las propuso primero ni cuándo. Mientras no aparezca, quedan fuera del bloque principal — y la ausencia queda escrita, que es distinto de fingir que no existen.',
  },
  casas: {
    nome: 'Las casas son Casas Enteras',
    chamada:
      'Abrís tu carta acá y la de tu amiga en otra app, y la mitad de los planetas está en otra casa. Nadie erró la cuenta: son dos maneras de cortar la misma rueda, y la mayoría de las apps no dice cuál usa.',
    texto:
      'Acá la Casa 1 es el signo entero del Ascendente, de cero a treinta grados, y el signo siguiente es la Casa 2. Es el sistema más antiguo que sobrevivió: un manual del siglo IV enuncia la regla doce veces seguidas, sin margen de duda, y un contemporáneo suyo hace la misma cuenta para hallar el lugar del padre. El nombre en inglés, whole sign, es lo moderno — se acuñó en los años noventa.' +
      '\n\n' +
      'La app no usa Placidus por un motivo práctico además del histórico: cerca de los polos ese sistema queda matemáticamente indefinido, y la app se abre en todo el mundo. La diferencia entre los dos se midió en veinte mil cartas: cerca de la mitad de los planetas cambia de casa, y prácticamente toda carta cambia en al menos uno. Por eso la pantalla escribe el nombre del sistema al lado de las casas.',
  },
  semNota: {
    nome: 'No existe puntaje, y no va a existir',
    chamada:
      'Toda app de pareja escupe un número de dos dígitos con una barra llena al lado. Nadie explica de dónde sale. La respuesta es que no sale de ningún lado.',
    texto:
      'La app tenía eso y lo mató. La compatibilidad corría con diez textos fijos para las 144 combinaciones posibles, y los puntajes quedaban todos entre setenta y cuatro y noventa y dos: todo el mundo combinaba con todo el mundo, y la oposición — el aspecto más duro que existe — recibía el puntaje más alto de la tabla. El horóscopo tenía cuatro barras (amor, trabajo, dinero y una más) sorteadas por la fecha. Ninguno de los dos números salía de cuenta alguna.' +
      '\n\n' +
      'En su lugar entró el vocabulario de la propia tradición: la relación entre dos signos tiene nombre — trígono, sextil, cuadratura, oposición, aversión — y tiene orden, porque la fuente ordena las configuraciones en cuatro escalones. Nombre y orden es lo que ella da. Número de dos dígitos no lo da, y dibujar uno se lee como medida por más leyenda que se ponga debajo.',
  },
  ia: {
    nome: 'Dónde entra inteligencia artificial, y qué no puede hacer',
    chamada:
      'Parte de lo que leés acá lo escribe en el momento un modelo de lenguaje: el chat, la lectura de sueño, las lecturas por foto. Vale saber cuándo — porque cambia lo que se puede esperar del texto.',
    texto:
      'El cielo nunca es trabajo del modelo. Quien calcula posición, fase y aspecto es la app, en tu aparato, con efeméride. Cuando la charla toca el cielo, la app manda junto un bloque con lo que ya calculó — tu signo, el signo de la Luna de hoy, los aspectos reales entre el cielo de hoy y tu carta — y la instrucción es dura: nunca afirmar posición, casa, aspecto ni retrogradación que no esté en ese bloque. Si el dato no está, el modelo pide tu carta en vez de rellenar el hueco.' +
      '\n\n' +
      'Las otras reglas que recibe: nada de porcentaje, de nada; nada de meter en el sueño un símbolo que vos no escribiste; en las fotos, describir lo que está visible antes de interpretar; y nada sobre el cuerpo, en ninguna circunstancia. Si la frase sigue siendo verdadera cambiándote por cualquier otra persona, tiene orden de borrar y escribir de nuevo.',
  },
};

const FEATURES = {
  horoscopo: {
    nome: 'Horóscopo del día',
    tela: 'Horóscopo',
    chamada:
      'Ya leíste ese horóscopo que dice "hoy tu intuición está más afilada". Te sirve a vos, a tu jefe y a tu ex, cualquier día del año. La prueba es simple: cambiá el signo y volvé a leer. Si el texto sigue sirviendo, no decía nada.',
    textos: {
      regente:
        'Dónde está hoy el planeta que rige tu signo: en qué signo cayó, qué dignidad tiene ahí y si está retrógrado. Marte cambia de signo cada seis semanas — por eso el texto de Aries de hoy no es el de Aries dentro de un mes.',
      lua:
        'En qué signo está la Luna ahora y qué relación hace eso con tu signo. Cambia de signo cada dos días y pico, y el mismo día los doce signos reciben relaciones distintas con la misma Luna.',
      mudanca:
        'Qué cambió de ayer a hoy: la Luna cambió de signo, giró el cuarto lunar, el regente entró o salió de retrógrado. Los días en que no cambió nada grande, el texto dice que es poco en vez de fabricar titular.',
      domicilios:
        'Quién rige cada signo. La tabla no está aprendida de memoria: cada línea se deduce de la distancia máxima que ese planeta puede alejarse del Sol.',
      dignidades:
        'Exaltación y caída — y la palabra "peregrino", que es el planeta sin dignidad ninguna en el lugar donde está. Es el caso más común de todos, y la pantalla no lo presenta como mala noticia.',
      signoInteiro:
        'La relación entre dos signos se cuenta por signo entero, sin orbe en grados. Así se hace la cuenta en la fuente, y es lo que permite hablar de aspecto sabiendo solo el signo.',
      regentePrimeiro:
        'Abrir por el regente de tu signo, y no por el Sol, es orden de lectura de la propia tradición — y es lo que hace que Aries y Géminis lean cosas distintas el mismo día.',
      quartos:
        'Los cuatro tramos del mes lunar, descritos como cualidades del aire: húmedo, cálido, seco, frío. Era descripción de clima, no de gente.',
      ordem:
        'El orden de los bloques y la manera de decirlo en lengua de conversación. Cuando el único hecho nuevo del día es el planeta del día de la semana, baja de la primera línea — sigue en la pantalla, con el mismo texto honesto, solo que no ocupa el titular un día en que él mismo admite no serlo.',
      ancora:
        'El cielo del día se ancla al mediodía, en hora universal. Sin ese ancla, el Inicio a las once de la noche contaría una historia distinta de la notificación del mediodía, y las dos se llamarían "hoy".',
      semBarras:
        'No da puntaje. Lo daba: cuatro barras — amor, trabajo, dinero y una cuarta que en una app de astrología no debería existir nunca —, con diez conjuntos fijos de números elegidos por la fecha y dibujados como si fueran medida. No salían de cuenta alguna y se quitaron, en vez de recibir una leyenda al pie.',
      semCeuInventado:
        'No afirma fase de la Luna ni posición de planeta sin haber calculado. La frase hecha "la Luna menguante favoreció el cierre de ciclos" salía en día de Luna creciente, con el calendario de la propia casa mostrando la fase correcta dos pantallas más adelante.',
    },
  },
  mapa: {
    nome: 'Carta Astral',
    tela: 'Carta Astral',
    chamada:
      'Hay gente que descubre a los treinta que se pasó la vida creyéndose de un signo y es de otro. No es falla de memoria: el signo cambia en un instante, y el instante depende del año, de la hora y del lugar.',
    textos: {
      sol: 'El signo solar por la longitud real del Sol en el minuto en que naciste — no por la franja de fechas del calendario.',
      lua: 'El signo de la Luna en el mismo instante, con el huso del lugar. Camina trece grados por día, así que unas horas ya cambian la respuesta.',
      ascendente:
        'El Ascendente, signo y grado. Exige hora y ciudad: en dos horas ya cambió de signo, y el horizonte es distinto en cada punto del planeta.',
      casas: 'Las doce casas, una por signo, contadas desde el signo del Ascendente.',
      planetas:
        'Los diez planetas por longitud eclíptica, todos en el mismo referencial, y los aspectos entre ellos. Sin hora, la cuenta se hace al mediodía: para los planetas lentos la aproximación es honesta, para el Ascendente y las casas no lo es — y por eso esos dos desaparecen de la pantalla en vez de salir aproximados.',
      zodiaco: 'Los signos contados desde los equinoccios y solsticios, que es lo que hace que el cálculo del signo solar sea un instante y no una fecha.',
      casasInteiras:
        'La Casa 1 es el signo entero del Ascendente. El manual más explícito que sobrevivió de la Antigüedad enuncia esa regla doce veces seguidas, una por casa.',
      firmico:
        'Y un contemporáneo suyo hace la misma cuenta por otro camino, para hallar el lugar del padre en la carta: el signo donde el conteo se detiene es el lugar, no un tramo de treinta grados cualquiera.',
      domicilios: 'El planeta que rige cada signo, que es lo que la pantalla usa para decir de quién es la casa.',
      rotuloDoSistema:
        'La pantalla escribe el nombre del sistema al lado de las casas. Parece detalle de nerd, y es lo que evita la conversación más aburrida que existe: comparar dos apps sin saber que cortan la rueda de maneras distintas.',
      semPlacidus:
        'Placidus queda matemáticamente indefinido cerca de los polos, y esta app se abre en todo el mundo. Casas Enteras no se rompe en ninguna latitud — y de paso es también el sistema más antiguo.',
      semHoraSemAscendente:
        'Sin hora, el Ascendente y las casas desaparecen de la pantalla, con el motivo escrito. Media hora de diferencia cambia el Ascendente de signo en muchos nacimientos, y suponer el mediodía acá sería cara o cruz.',
      casaSemSignificado:
        'Las doce celdas dicen "Casa N — signo" y nada más. La app todavía no tiene significado de casa con fuente leída de punta a punta, y prefiere la celda seca a la invención más común del rubro, que es deducir el significado de la casa por el signo correspondiente.',
    },
  },
  ceu: {
    nome: 'Cielo de hoy para vos',
    tela: 'Inicio',
    chamada:
      'Dos amigos del mismo signo abren la app el mismo día y leen cosas distintas. Acá la lectura deja de ser sobre tu signo y pasa a ser sobre tu nacimiento.',
    textos: {
      cruzamento:
        'Los diez planetas de hoy contra los diez del día en que naciste, aspecto por aspecto. Ninguna frase hecha: lo que aparece en pantalla es lo que la cuenta encontró.',
      orbe:
        'El orbe está escalonado por velocidad: ancho para la Luna, apretado para los lentos. Sin eso, un tránsito de Plutón ocupaba la cima de una pantalla llamada "hoy" durante meses — en cuatro nacimientos probados, la misma frase aparecía en julio, agosto y octubre.',
      tresMaisApertados: 'De todo lo que la cuenta encontró, los tres aspectos más apretados. El resto existe y queda afuera por espacio, no por conveniencia.',
      quatroAspectos:
        'Los aspectos son cuatro, y los ángulos salen de proporciones musicales aplicadas al semicírculo: la mitad, un tercio, tres por dos, cuatro por tres.',
      conjuncao:
        'Y la conjunción no es uno de ellos: dos planetas en el mismo lugar entran en una categoría aparte, la aplicación corporal. Casi toda app la llama aspecto; la fuente no.',
      rapidoELento:
        'Llamar noticia del día al tránsito rápido y capítulo al tránsito lento es manera nuestra de ordenar la pantalla. La práctica hace esa distinción, pero con otras palabras — las de estas dos líneas son de la app.',
      semMapaSemTela:
        'Sin fecha de nacimiento, esta pantalla no existe. La app no cambia tu carta por el "cielo de tu signo" para tener algo que mostrar: eso sería fabricar un nacimiento que no es el tuyo.',
    },
  },
  taro: {
    nome: 'Tarot',
    tela: 'Tarot',
    chamada:
      'La carta que cayó no vino del cielo ni de tu inconsciente: vino de un mezclado. Decirlo no arruina nada — el mazo es de 1911, y su gracia nunca fue ser antiguo.',
    textos: {
      sorteio:
        'Acá no entra ningún cielo. Las 78 cartas se mezclan, salen tres, y la orientación de cada una — derecha o invertida — es cara o cruz. Ninguna posición de planeta participa de la elección, y la app no finge que participe.',
      waite:
        'El mazo es el Rider-Waite-Smith, dibujado por Pamela Colman Smith bajo dirección de Waite. En once cartas la app muestra su lista de significados en inglés, palabra por palabra: traducir una cita es falsificarla.',
      goldenDawn:
        'La correspondencia de cada carta con planeta, signo y decanato es la de una orden inglesa de fines del siglo XIX, y la pantalla escribe su nombre. No existe "la" atribución astrológica del tarot: existen al menos tres, incompatibles entre sí.',
      gebelin:
        'La lectura del tarot como oráculo nace en un ensayo que anunciaba un libro egipcio perdido — escrito cuarenta años antes de que alguien pudiera leer jeroglíficos. La cartomancia con tarot tiene poco más de dos siglos, no cuatro milenios, y el propio Waite desmiente lo egipcio en su libro.',
      posicoes: 'Las tres posiciones de la tirada — lo que quedó, lo que está, lo que viene — y la decisión de mostrar siempre las tres juntas.',
      textoDaCarta:
        'El texto de cada carta en español de hoy. La carta tiene cuatro datos que no cambian (arcano, letra, sendero, atribución) y el resto es redacción nuestra, escrita para que cambiar la carta cambie la frase.',
      semEgito: 'La app nunca dijo Egipto y no lo va a decir. Decir 1781 es más interesante, y tiene la ventaja de ser verdad.',
      semFuturo: 'No afirma el futuro. Una carta sorteada no sabe tu mes que viene, y la app no le presta una autoridad que no tiene.',
    },
  },
  compatibilidade: {
    nome: 'Compatibilidad',
    tela: 'Compatibilidad',
    chamada:
      '"Peleamos a los gritos y hacemos las paces en el mismo rato" y "estamos tres días sin hablarnos" no son la misma pareja. Ninguna de las dos entra en un número de dos dígitos.',
    textos: {
      distancia:
        'La distancia entre los dos signos en la rueda, contada en signos enteros: de cero a seis. Es la única cuenta de esta pantalla, y es la misma que hace la fuente — ella cuenta signos, no grados.',
      quatroAspectos:
        'Cuatro aspectos, y solo cuatro: oposición, trígono, cuadratura, sextil. Y el criterio para llamarlos armónicos no es el elemento, es el género del signo — la afinidad entre fuego y aire es consecuencia de eso, no la causa.',
      comandantes:
        'Signos que mandan y signos que obedecen: pares a la misma distancia del punto del equinoccio. La relación tiene dirección — uno manda y el otro obedece —, y es la categoría que ninguna app del rubro implementa.',
      seVeem: 'Signos que se ven, o de igual poder: pares a la misma distancia del punto del solsticio. Cáncer y Capricornio no tienen par acá.',
      aversao:
        'Y los signos ajenos: los que no tienen ninguna de las familiaridades anteriores, a uno o a cinco signos de distancia. Revisando par por par, son 48 de las 144 combinaciones — un tercio de la tabla simplemente no se relaciona. Puntaje bajo no vende, y por eso casi nadie lo cuenta.',
      escala:
        'En la aplicación a dos personas, la misma obra ordena las configuraciones en cuatro escalones. La oposición no está en la cima: está en el fondo, junto a la aversión — y la app vieja le daba el puntaje máximo.',
      traducaoParaCasal:
        'Traducir "cuadratura" a pelea en la cocina, cama, dinero y celos es trabajo de la app. El nombre de la relación y el orden de los escalones son de la fuente, y ninguno de los dos se invierte para que la lectura quede simpática.',
      soSignoSolar:
        'La pantalla compara dos signos solares y lo dice en voz alta. La sinastría de verdad compara dos cartas enteras, con Luna, Venus, Marte y Ascendente; un signo es una rebanada de eso.',
      semNota: 'Sin porcentaje, sin puntaje, sin barra. Si algún día vuelve un número, no va a poder contradecir la relación escrita al lado.',
      semEsconderAversao:
        'Y sin cambiar "aversión" por un sinónimo simpático. Un tercio de los pares no se mira en la fuente, y esa es justamente la parte que el usuario ya sospechaba solo.',
    },
  },
  lua: {
    nome: 'Calendario Lunar',
    tela: 'Calendario Lunar',
    chamada:
      'Mirás por la ventana: la Luna está por la mitad. La app dice "Cuarto Creciente". La mitad es un hecho; el nombre es el lugar donde alguien decidió cortar el ciclo — y ese alguien tiene nombre y fecha.',
    textos: {
      elongacao: 'La diferencia de longitud entre la Luna y el Sol, ahora, en grados. Ese número decide la fase, y se revisa en cualquier efeméride.',
      instanteExato:
        'El instante exacto de la próxima Luna Nueva y de la próxima Llena, hallado por bisección. Etiqueta de tramo e instante exacto son cosas distintas: el día de la llena, la llena ocurre a una hora precisa.',
      quatroQuartos: 'La división antigua del mes lunar es en cuatro, y las cualidades que describe son de clima: humedad, calor, sequedad, frío.',
      hesiodo:
        'El mes contado día por día, del primero al trigésimo, con día bueno y día malo para cada trabajo — eso sí es genuinamente arcaico, y es siete siglos más viejo que la astrología de carta natal.',
      oitoFases:
        'Las ocho fases con nombre y lectura de personalidad son del siglo XX. El marco de ocho es bueno y la app lo usa; solo que no es milenario, y entre las dos fechas hay mil ochocientos años.',
      nomesDeLua:
        'Los nombres de luna llena — Luna del Lobo, Luna de la Frutilla — salieron de un almanaque agrícola del hemisferio norte. "Luna de la Nieve" en febrero describe el invierno de allá; acá febrero es pico de verano.',
      colheita:
        'Y la fama de que la llena es fase de cosecha invierte la fuente romana: lo que se corta, se cosecha y se esquila va en menguante. En la llena, lo que la labranza antigua mandaba era sembrar habas.',
      oitoFatias:
        'Cortar el ciclo en ocho tramos de cuarenta y cinco grados es convención moderna de calendario, y sirve para ponerle nombre a lo que ves en el cielo. La app lo usa y declara que lo usa.',
      semMilenar: 'No llama milenarias a las ocho fases. El marco milenario es el de cuatro cuartos, y está en la pantalla de al lado, con el nombre de quien lo escribió.',
      semInstrucao:
        'No te manda hacer nada por la fase. Describe lo que la labranza romana hacía, en pasado, con el nombre de quien lo escribió — "plantaban" es registro, "plantá" sería consejo.',
    },
  },
  calendario: {
    nome: 'Calendario Cósmico',
    tela: 'Calendario Cósmico',
    chamada:
      'Eclipse, retrógrado, superluna: llega todo junto a tu feed, siempre en mayúsculas y sin fecha. Acá es al revés — primero la fecha y la hora, después el nombre, y la edad del nombre al lado.',
    textos: {
      eventos:
        'Los eventos reales del mes: las cuatro fases de la Luna, la entrada del Sol en cada signo (que es donde caen equinoccios y solsticios), el comienzo y el fin de la retrogradación de Mercurio y los aspectos exactos entre los planetas rápidos.',
      bisseccao:
        'Cada instante se halla por bisección sobre la efeméride, no se copia de una lista. Por eso la app muestra hora y minuto en vez de "alrededor del día 15".',
      ingressos: 'La entrada del Sol en los signos cardinales es el punto de partida mismo del zodíaco trópico — no es coincidencia de calendario.',
      conjuncao:
        'La conjunción aparece rotulada como aplicación corporal, y no como aspecto: en la fuente los aspectos son cuatro, y dos planetas en el mismo lugar no se miran, están juntos.',
      quartos: 'Y los cuartos de la Luna, que es el marco antiguo del mes lunar, con las cualidades de clima que describía.',
      reciboPorEvento:
        'Cada evento viene con un párrafo en lengua de conversación y el recibo justo debajo. El orden es siempre ese: primero qué es, después quién lo escribió.',
      semFonteAntiga:
        'Donde no existe fuente antigua, el texto escribe exactamente eso: práctica popular contemporánea, sin fuente antigua localizada. Inventar antigüedad es el patrón de dos mil años que esta app existe para no repetir.',
      semAgenda:
        'Ningún evento del cielo recibe instrucción de agenda. Nada de "mejor día para", nada de "aprovechá la energía de". El cielo se mide; lo que pasa con tu semana no es nuestro para afirmarlo.',
    },
  },
  rituais: {
    nome: 'Rituales',
    tela: 'Rituales',
    chamada:
      'Encender una vela y escribir tres frases en un papel no mueve el cielo. Mueve lo que hacés en los diez minutos siguientes — y de eso hablaba esa tradición mucho antes de volverse posteo.',
    textos: {
      faseEDia:
        'La fase de la Luna de ahora y el día de la semana. Un ritual que pide menguante en viernes solo aparece cuando coinciden los dos; cuando coincide uno solo, la pantalla dice cuál en vez de fingir encaje perfecto.',
      semEfemeride:
        'Si la efeméride no está disponible, la fase sale de la cuenta y quedan los rituales que dependen solo del día de la semana — el día de la semana es aritmética de calendario y sigue siendo cierto sin cielo ninguno.',
      diasPlanetarios:
        'Los días de la semana con nombre de planeta. Y la fuente primaria dice que la costumbre era nueva cuando ella escribió, que es lo contrario de lo que suele repetirse.',
      qualidades:
        'Las cualidades de los siete planetas — calentar, enfriar, secar, humedecer. Son físicas, y en nuestras frases el planeta es siempre el sujeto: la tradición atribuye a Saturno enfriar, no "Saturno te enfría".',
      lavoura: 'Creciente y menguante en la labranza romana: lo que se corta, se cosecha y se esquila iba en menguante, y el texto dice que sufría menos daño.',
      catao: 'Dos siglos antes, la misma costumbre: higuera, manzano, olivo, peral y vid se plantaban con la luna muda, por la tarde.',
      columela: 'Y la excepción que impide la generalización fácil: las habas se sembraban la víspera o el día mismo de la llena.',
      vinteEUm:
        'Los veintiún rituales, los cinco campos de cada uno (intención, materiales, paso a paso, momento ideal, cuidados) y la elección de qué entra. La redacción es nuestra.',
      semFonteAntiga:
        'Donde no hay fuente antigua, el campo escribe: práctica popular contemporánea, sin fuente antigua localizada. La mitad de la biblioteca es eso, y está dicho.',
      semPromessa:
        'Ningún ritual promete resultado. El texto describe lo que hacés — escribí tres frases, leelas en voz alta, apagá la vela — y ahí se detiene.',
      semCorpo:
        'Y ninguno promete efecto en el cuerpo de quien lee. La diferencia entre el texto correcto y el prohibido es una preposición: "escribí tres frases" describe; "escribí tres frases para" ya promete.',
    },
  },
  sonhos: {
    nome: 'Sueños',
    tela: 'Sueños',
    chamada:
      'Te despertás con la escena pegada: la puerta que no abría, la persona que no debía estar ahí. El primer impulso es buscar "qué significa soñar con una puerta" — y ahí mismo se vuelve galletita de la fortuna.',
    textos: {
      semCeu:
        'Nada de cielo en esta pantalla. Lo que entra en la lectura es lo que vos escribiste, con tus palabras, más tus sueños anteriores cuando los hay.',
      especies:
        'La pregunta que viene antes de interpretar: ¿este sueño solo refleja tu día — hambre, miedo, lo que pasó ayer — o está diciendo una cosa por otra? La distinción es del mayor manual de sueños que sobrevivió de la Antigüedad, y es la que separa método de diccionario.',
      quemSonhou:
        'Y la exigencia que viene con ella: antes de interpretar hay que saber de quién es el sueño — oficio, situación, edad. El mismo símbolo no dice lo mismo para dos personas distintas, y eso es lo que un diccionario de símbolos no puede hacer.',
      regrasDoModelo:
        'El texto lo escribe un modelo de lenguaje en el servidor, con reglas duras: listar antes los elementos que VOS escribiste; nunca meter un símbolo que no está en el relato — si el sueño no tiene agua, no se habla de agua; señalar lo que estaba fuera de lugar; nombrar el motivo que se repite cuando de verdad está en los sueños anteriores; y cerrar con una pregunta que solo sirve para este sueño. Si el relato tiene dos líneas, pide un detalle en vez de inventar un sueño.',
      camadaModerna:
        'La segunda capa — el sueño como contrapeso de la actitud despierta, las figuras como partes de quien soñó — es lectura del siglo XX, y la app la nombra como moderna en vez de prestarle la edad del manual antiguo.',
      semDiagnostico: 'No es diagnóstico y no es predicción. Un sueño no anuncia el mes que viene, y esta pantalla no finge que lo anuncie.',
      semTerceiro:
        'Y no afirma lo que la otra persona del sueño siente, piensa o va a hacer. Esa figura es material de tu sueño, no la persona real durmiendo del otro lado de la ciudad.',
    },
  },
  corpo: {
    nome: 'El cuerpo y los signos',
    tela: 'Hombre Zodiacal',
    chamada:
      'Ya viste el dibujo: el muñeco con los doce signos repartidos por el cuerpo, Aries en la cabeza, Leo en el corazón. La mitad está cambiada — y se prueba con el poema de donde salió.',
    textos: {
      luaAgora:
        'En qué signo está la Luna ahora y a qué hora cambia. Ese era el reloj de la práctica antigua: cada dos días y medio la región cambiaba, y el almanaque de cabecera servía para consultarlo.',
      manilio:
        'La lista de los doce viene de un poema astronómico del siglo I. Y en él Leo no es el corazón — son los flancos y los omóplatos; Libra no son los riñones — son las nalgas. La versión que circula hoy cambió las dos.',
      naoEPtolomeu:
        'Y no está en el Tetrabiblos, como dice casi todo sitio: ahí la lista es de planetas, no de los doce signos. Atribuir la lista al autor equivocado es el tipo de error que sobrevive por copia.',
      culpeper:
        'La capa de las hierbas viene de un herbario inglés del siglo XVII, y sus frases aparecen en inglés, sin traducción — porque lo que se está mostrando es lo que el hombre escribió, no lo que nosotros creemos que quiso decir.',
      historiaNaoConselho:
        'La pantalla es sobre un capítulo de la astrología médica antigua, y la decisión de contarlo como historia — quién lo escribió, cuándo, y qué cambió en el camino — es nuestra. El tema es el dibujo, no vos.',
      semCorpo:
        'Ninguna frase te manda hacer nada con tu cuerpo. Todo en pasado y con dueño: "la tradición medieval asociaba", nunca "tu punto débil es". Nada de acá puede hacer que alguien postergue a un médico.',
    },
  },
  fotos: {
    nome: 'Lecturas por foto: mano, rostro, pie y lunares',
    tela: 'Lecturas',
    chamada:
      'Sacás una foto de la palma con la luz de la cocina esperando ver la fecha del casamiento. No la ves — y el motivo es más interesante que la foto.',
    textos: {
      semConta:
        'Acá no hay cuenta ninguna. La foto va al servidor, un modelo describe lo que está visible y recién después interpreta. Si la foto no muestra lo necesario, la lectura lo dice en vez de inventar una mano.',
      quiromanciaModerna:
        'La quiromancia con montes, tipos de mano y línea del matrimonio es moderna: nace en 1839 y se organiza a fines del siglo XIX, con sociedad propia en Londres. El escrito "de Aristóteles" que abre la mitad de los manuales no está en sus obras canónicas.',
      benham:
        'El manual que fijó el sistema tal como circula hoy es de 1900, y su título ya anuncia la ambición de la época: lectura científica de la mano. Conviene saber la fecha para no confundir el inicio del siglo XX con la Antigüedad.',
      linhaDaVida:
        'Ligar el largo de una línea al tiempo de vida es la afirmación más antigua documentada de toda esta familia de prácticas — está en una obra de historia natural del siglo IV a.C. La app mantiene la prohibición de leer tiempo de vida ahí, y cambia la justificación: no es mito popular reciente, es lo contrario, y sigue prohibido.',
      rostoEPe:
        'El rostro se lee por la fisiognomía china y el pie por la tradición india samudrika, y la pantalla escribe los dos nombres. Pero hay que decir el tamaño del respaldo: el corpus samudrika tiene cientos de manuscritos, la mayoría anónimos, y esta base no leyó edición primaria de ninguna de las dos tradiciones. Citar "el samudrika dice X" es citar un corpus, no una obra.',
      nomeiaATradicao:
        'Nombrar la tradición en la pantalla en vez de decir "lectura energética" es decisión nuestra. Un nombre tiene dirección; la energía no.',
      descreveAntes:
        'La instrucción obliga al modelo a describir antes de interpretar — qué parte del cuerpo aparece, la iluminación, qué está nítido. Es lo que impide que la lectura hable de una línea que la foto no muestra.',
      semPele:
        'Nada sobre tu piel: ni color, ni borde, ni tamaño, ni cambio de un lunar. Eso es asunto de dermatología, y el modelo tiene instrucción de decirlo con naturalidad si alguien pregunta. La lectura es de posición, y nada más.',
      semTempoDeVida: 'Y nada de tiempo de vida, en ninguna de las cuatro lecturas. Es la línea más antigua de la tradición y es la primera que la app corta.',
    },
  },
  cafe: {
    nome: 'Borra de café',
    tela: 'Café',
    chamada:
      'La taza se da vuelta sobre el plato, la borra escurre y alguien siempre dice que eso es milenario. La cuenta no cierra, y es fácil de cerrar: la práctica no puede ser más vieja que la bebida.',
    textos: {
      semConta: 'Ninguna cuenta y ningún cielo: es foto, descripción y lectura. Lo que la pantalla puede ofrecer es el respaldo histórico, y es corto y fechado.',
      manual1742:
        'La lectura de borra aparece impresa en Europa en un manualito anónimo de treinta y una páginas, de 1742 — el más antiguo que este relevamiento localizó, con reseña en un periódico del mismo año.',
      dicionarioDeSalao:
        'Y el diccionario de símbolos que todo el mundo conoce — la serpiente es enemistad, la casa es mudanza — es entretenimiento de salón británico de fines del siglo XIX, consolidado en un libro popular de los años veinte.',
      istambul:
        'Los cafés de Estambul abren alrededor de 1555, y esa fecha es la que derrumba la etiqueta "milenario": no se puede leer borra de café antes de que haya café. La cronología es sólida en el relevamiento, pero lo que se leyó de primera mano acá son el manual de 1742 y el libro de símbolos.',
      geografiaDaXicara:
        'La geografía de la taza que usa la app — el asa es la persona, el sentido horario es el tiempo, el borde es lo cercano y el fondo es lo lejano — es la convención de la tasseografía de salón. Es la que existe, y la app dice que es esa.',
      semNomeSemData:
        'No da nombre de persona ni fecha de acontecimiento. La borra es una forma en el fondo de una taza; el resto es charla, y la buena charla no necesita fingir precisión.',
    },
  },
  chat: {
    nome: 'El asistente',
    tela: 'Chat',
    chamada:
      'Escribís "¿vuelve?" a las dos de la mañana. Lo que llega de vuelta no es sí ni no — y conviene saber por qué antes de pensar que la app está esquivando.',
    textos: {
      contexto:
        'Lo que la app calculó y manda junto en la charla: tu signo, el signo y la fase de la Luna de hoy, y los aspectos reales entre el cielo de hoy y tu carta. Nada de eso lo escribe el modelo — llega hecho, de una cuenta corrida en tu aparato.',
      semDadoSemAfirmacao:
        'Y lo que no fue calculado no entra. Si tu carta no está cargada, el bloque llega vacío en esa parte y el asistente tiene orden de pedir la carta en vez de deducir.',
      vocabulario:
        'El vocabulario que puede usar es el citable: elementos y modalidades de los signos — cardinal inicia, fijo sostiene, mutable adapta — y los cuatro aspectos por ángulo.',
      qualidades: 'Más las cualidades físicas de los siete planetas, siempre con el planeta como sujeto de la frase.',
      regraDura:
        'La regla más dura del sistema: nunca afirmar posición, casa, aspecto ni retrogradación que no esté en el bloque de contexto. Quien sabe de astrología revisa la efeméride en cinco segundos, y no vuelve.',
      testeDoBarnum:
        'Y la prueba que aplica antes de responder: si la frase sigue siendo verdadera cambiándote por cualquier otra persona, borrar y escribir de nuevo, anclada en algo concreto.',
      semBaralho:
        'No tiene mazo. Nunca dice que sacó, tiró ni dio vuelta una carta — quien saca sos vos, en la pantalla del Tarot. Si le contás la tirada, habla de esas cartas y solo de esas.',
      semNota: 'No da porcentaje de nada, tampoco de compatibilidad. Y no habla del cuerpo, en ninguna circunstancia.',
    },
  },
};

export const PACK = {
  idioma: 'es',
  tela: 'Cómo decide esta app',
  abertura: ABERTURA,
  rotulos: ROTULOS,
  exigencia: EXIGENCIA,
  recibo: RECIBO,
  reciboSemAutor: RECIBO_SEM_AUTOR,
  semFonte: SEM_FONTE,
  autores: AUTORES,
  verbatim: VERBATIM,
  convencoes: CONVENCOES,
  features: FEATURES,
};

export default PACK;
