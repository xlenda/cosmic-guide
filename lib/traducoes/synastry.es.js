// lib/traducoes/synastry.es.js
// O PACK ESPANHOL da sinastria — espanhol neutro-latino (ustedes, nunca
// vosotros), tradução de SENTIDO e não literal, mesma FORMA exata do pack PT
// (mesmas chaves, mesmas funções, mesma assinatura).
//
// O QUE NUNCA SE TRADUZ AQUI: o verbatim de Robbins (campo `texto` — inglês
// idêntico nos três packs), os nomes de obra (Tetrabiblos, Christian
// Astrology, Mathesis, Sun Signs...), os loci e os números. Nomes próprios
// consagrados traduzem: Ptolomeu→Ptolomeo, Manílio→Manilio.
//
// LINHA VERMELHA (regra 4 de lib/synastry.js, primos em ES): aliviar, calmar,
// sanar, curar, tratar, energizar — NENHUM entra, em nenhuma forma.
// test/synastryIdiomas.test.js varre este pack inteiro atrás deles.

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

const ELEMENTOS = { fogo: 'fuego', ar: 'aire', 'água': 'agua', terra: 'tierra' };

const ARTIGOS = { fogo: 'el fuego', ar: 'el aire', 'água': 'el agua', terra: 'la tierra' };

const QUALIDADES_NOME = { quente: 'caliente', frio: 'frío', seco: 'seco', 'úmido': 'húmedo' };

function fraseQualidades(q) {
  return `${q[0]} y ${q[1]}`;
}

const MODALIDADES = {
  cardeal: {
    id: 'cardeal',
    nome: 'cardinal',
    ptolomeu: 'solsticial o equinoccial',
    glosa: 'la estación cambia cuando el Sol entra en ellos',
  },
  fixo: {
    id: 'fixo',
    nome: 'fijo',
    ptolomeu: 'sólido',
    glosa: 'la estación ya está asentada cuando el Sol está en ellos',
  },
  mutavel: {
    id: 'mutavel',
    nome: 'mutable',
    ptolomeu: 'bicorpóreo',
    glosa: 'quedan entre dos estaciones y participan de las dos',
  },
};

const ARISTOTELES_LOCUS = 'Aristóteles, Acerca de la Generación y la Corrupción II.3';

const CATEGORIAS = {
  harmonico: 'armónico',
  desarmonico: 'disarmónico',
  semAspecto: 'sin aspecto',
  copresenca: 'copresencia',
};

const GRAUS_IV7 = {
  1: 'lo que la fuente llama simpatía segura e indisoluble',
  2: 'simpatía, y la fuente dice que menor',
  3: 'antipatía, y la fuente dice que menor',
  4: 'el grupo que la fuente pone al fondo',
};

// El verbatim de Robbins queda EN INGLÉS (traducir la cita es falsificarla);
// la paráfrasis en español la firma la app, sin comillas y sin locus.
const VERBATIM = {
  quatroAspectos: {
    texto:
      'Of the parts of the zodiac those first are familiar one to another which are in aspect. These are the ones which are in opposition... those which are in trine... those which are said to be in quartile... and finally those that occupy the sextile position.',
    parafrase:
      'De las partes del zodíaco, tienen familiaridad entre sí las que se miran en aspecto — y los aspectos son cuatro: oposición, trígono, cuadratura y sextil.',
    locus: 'Ptolomeo, Tetrabiblos I.13 (De los aspectos de los signos), trad. Robbins, 1940',
  },
  harmonicos: {
    texto:
      'Of these aspects trine and sextile are called harmonious because they are composed of signs of the same kind, either entirely of feminine or entirely of masculine signs; while quartile and opposition are disharmonious because they are composed of signs of opposite kinds.',
    parafrase:
      'Trígono y sextil se llaman armónicos porque juntan signos del mismo género — todos masculinos o todos femeninos; cuadratura y oposición son disarmónicas porque juntan signos de tipos opuestos.',
    locus: 'Ptolomeo, Tetrabiblos I.13, trad. Robbins, 1940',
  },
  disjuntos: {
    texto:
      "'Disjunct' and 'alien' are the names applied to those divisions of the zodiac which have none whatever of the aforesaid familiarities with one another... they are found to be entirely without share in the four aforesaid aspects, opposition, trine, quartile, and sextile, and are either one or five signs apart; for those which are one sign apart are as it were averted from one another...",
    parafrase:
      'Disjuntos y ajenos son los signos que no tienen familiaridad alguna entre sí: quedan fuera de los cuatro aspectos, a uno o a cinco signos de distancia — y los que son vecinos quedan como desviados el uno del otro.',
    locus: 'Ptolomeo, Tetrabiblos I.16 (De los signos disjuntos), trad. Robbins, 1940',
  },
  duradouro: {
    texto:
      "Marriages for the most part are lasting when in both the genitures the luminaries happen to be in harmonious aspect, that is, in trine or in sextile with one another, and particularly when this comes about by exchange; and even more when the husband's moon is in such aspect with the wife's sun.",
    parafrase:
      'Los matrimonios suelen durar cuando el Sol y la Luna de las dos cartas están en aspecto armónico — trígono o sextil —, sobre todo intercambiando lugares, y Ptolomeo le da peso extra a la Luna de uno sobre el Sol del otro (él escribe marido y esposa; la app describe la figura, no el arreglo).',
    locus: 'Ptolomeo, Tetrabiblos IV.5 (Del matrimonio), trad. Robbins, 1940',
  },
  separacao: {
    texto:
      'Divorces on slight pretexts and complete alienations occur when the aforesaid positions of the luminaries are in disjunct signs, or in opposition or in quartile.',
    parafrase:
      'Los divorcios por pretextos pequeños y los distanciamientos completos ocurren cuando esas posiciones de las luminarias caen en signos disjuntos, en oposición o en cuadratura.',
    locus: 'Ptolomeo, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  modificador: {
    texto:
      'Similarly, when the luminaries are in inharmonious positions, the beneficent planets testifying to the luminaries do not completely terminate the marriages, but bring about renewals and recollections, which preserve kindness and affection.',
    parafrase:
      'Aun con las luminarias en posición disarmónica, si los planetas benéficos dan testimonio, el matrimonio no se termina del todo: vienen recomienzos y recuerdos, que preservan gentileza y afecto.',
    locus: 'Ptolomeo, Tetrabiblos IV.5, trad. Robbins, 1940',
  },
  escala: {
    texto:
      'In inquiries regarding matters of importance we must observe the places in both nativities which have the greatest authority, that is, those of the sun, the moon, the horoscope, and the Lot of Fortune; for if they chance to fall in the same signs of the zodiac, or if they exchange places, either all or most of them... they bring about secure and indissoluble sympathy, unbroken by any quarrel. However, if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions. If they chance to be situated in neither of these ways, but merely in signs which bear an aspect to one another, if they are in trine or in sextile, they make the sympathies less, and in quartile, the antipathies less.',
    parafrase:
      'En los asuntos de peso se miran los lugares de mayor autoridad de las dos cartas — Sol, Luna, Ascendente y Parte de la Fortuna. En los mismos signos, o intercambiando lugares: simpatía firme, que ninguna pelea deshace. En signos disjuntos u opuestos: las enemistades más hondas y las disputas más duraderas. En trígono o sextil, las simpatías son menores; en cuadratura, las antipatías son menores.',
    locus: 'Ptolomeo, Tetrabiblos IV.7 (De los amigos y enemigos), trad. Robbins, 1940',
  },
};

const NOTA_ESCALA =
  'Aquí no hay porcentaje, y la ausencia es deliberada. No existe nota de compatibilidad entre signos en ninguna fuente occidental antigua, medieval o renacentista: Ptolomeo da categorías — armónico, disarmónico, disjunto — y, en el capítulo de los amigos y enemigos, una escala de cuatro peldaños y un conteo de cuántos lugares concuerdan ("either all or most of them"), sin unidad. La puntuación numérica tradicional existe en Occidente, pero es otra cosa: la tabla de dignidades esenciales de William Lilly (Christian Astrology, Londres, 1647) mide la fuerza de UN planeta en una carta, no la afinidad entre dos personas. Y la única puntuación de compatibilidad de verdad tradicional que la investigación encontró no es occidental — es el Ashtakoota indio, de 36 puntos, calculado por nakshatra y signo lunar, jamás por signo solar; otra tradición, otra escala, otro dato de entrada. Un número de dos dígitos es la forma más fuerte de afirmar precisión que existe, y nada aquí sostiene esa promesa — así que la app muestra el aspecto, que es geometría verificable, y lo que la fuente dice de él.';

const NOTA_GRAU =
  'El grado es orden, no medida. Viene de Ptolomeo, Tetrabiblos IV.7, que ordena las configuraciones entre dos cartas en cuatro peldaños y ahí se detiene: el grado 4 no es "el doble de malo" que el grado 2, y ninguno de los cuatro es un veredicto. En el mismo Tetrabiblos, IV.5, él registra la unión en posición disarmónica que NO se termina.';

const RESSALVA_SIGNO_SOLAR =
  'Esto compara signo solar con signo solar, y ese recorte es de columna de periódico: nació con R. H. Naylor en el Sunday Express del 24 de agosto de 1930 y se volvió la columna semanal "Your Stars" — de ahí viene el horóscopo por signo solar para el público. La sinastría antigua es otra cosa — en el capítulo del matrimonio (IV.5) Ptolomeo compara el Sol y la Luna de las dos cartas, con peso especial en la Luna de uno sobre el Sol del otro; y en el capítulo de donde sale el grado de esta pantalla (IV.7) él compara CUATRO lugares de cada carta: Sol, Luna, Ascendente y Parte de la Fortuna. El aspecto de abajo es real y su fuente está citada; aplicar la escala de IV.7 a un par de signos solares es una simplificación de esta app, y la app prefiere decirlo antes que fingir que no.';

const NOTA_CARACTEROLOGIA =
  'El bloque "Cómo es en la vida real", que abre esta lectura, es caracterología contemporánea — y la app prefiere decirlo antes que dejarte suponer otra cosa. Describir personalidad por signo solar ("el ariano es impulsivo", "el escorpiano es intenso") no está en Ptolomeo ni en Manilio: es práctica del siglo XX, de Alan Leo en adelante, que llegó al gran público por la columna de periódico de R. H. Naylor (1930) y por los libros de Linda Goodman (1968 y 1978). De la fuente antigua viene solo la osamenta debajo de aquel texto, y es verificable: la distancia entre los dos signos y la figura que forma (Tetrabiblos I.13 y I.16), los cuatro elementos con sus dos cualidades cada uno (Aristóteles, Acerca de la Generación y la Corrupción II.3), los tres grupos estacionales que hoy se llaman modalidad (Tetrabiblos I.11) y el planeta que tiene casa en cada signo (Tetrabiblos I.17). El vocabulario de temperamento colgado de esa osamenta es nuestro, y es moderno. Una nota más, porque es fácil de perder: cuando el texto dice quién suele dar el primer paso, eso se apoya en la superación (kathuperterisis), doctrina helenística transmitida por Antíoco, Porfirio y Retorio, según la cual entre dos lugares en aspecto predomina el que está en el signo anterior — aquel a partir del cual el otro es el décimo. Donde no hay aspecto alguno, como en la aversión, no hay superación que invocar: ahí quien decide el orden es la modalidad leída al modo moderno, y eso es lectura de esta app, no de la fuente. Nada de esto entra en el grado, la categoría o la figura: la regencia de planeta, en particular, no pesa un gramo en la cuenta (ver el vacío registrado en NAO_ACHADO sobre regentes enemigos).';

// El rótulo del ECO del camino — la doctrina entera está en el pack PT.
// Es a propósito la misma frase con que abre todo `caminho` de este pack
// ("Por dónde empezar, en la práctica:"): el eco corta esa apertura del cuerpo
// para no decir lo mismo dos veces en el mismo pliegue de la pantalla.
const ROTULO_CAMINHO = 'Por dónde empezar';

const LEITURAS = {
  trigono(c) {
    return {
      aspecto: 'Trígono',
      natureza: 'afinidad por identidad',
      categoria: CATEGORIAS.harmonico,
      resumo: `${c.A} y ${c.B} se entienden casi sin esfuerzo — mismo elemento, ${c.nomeElemA}. Trígono, la figura que la tradición llama armónica.`,
      texto:
        `Ustedes dos se entienden casi sin esfuerzo — a ${c.A} y a ${c.B} los mueve el mismo tipo de cosa, así que no hay nada que traducir entre ustedes. ` +
        `Y esto no lo estamos inventando nosotros. El nombre de la figura es Trígono (es cuando un signo ve al otro desde un ángulo fácil): cuatro signos de distancia, 120 grados. ` +
        `Ptolomeo lo llama armónico (la palabra de la fuente para un encuentro de afinidad) — pero junto con el sextil (el otro ángulo fácil), y sin poner uno encima del otro: ` +
        `en su libro, el Tetrabiblos (IV.7), los dos caen en el MISMO peldaño (Ptolomeo ordena los encuentros en una escalera de cuatro posiciones): "they make the sympathies less" (las simpatías son menores). Quien ordena a los dos es William Lilly, ` +
        `Christian Astrology (Londres, 1647, p. 106): sextil y trígono son "arguments of Love, Unity and Friendship; but the Trine is more forcible" (lazos de amor, unión y amistad — y el trígono es el más fuerte de los dos). ` +
        `Eso es tradición inglesa del siglo XVII, no Ptolomeo, y por eso no cambia el peldaño aquí. ` +
        `${c.A} y ${c.B} son del mismo elemento, ${c.nomeElemA}, y por lo tanto de las mismas dos cualidades: ${c.qA}. ` +
        `Lo que cambia es la modalidad (el modo de cada signo dentro de la estación): ${c.A} es ${c.modA.nome} (${c.modA.glosa}) y ${c.B} es ${c.modB.nome} (${c.modB.glosa}). ` +
        `Cambia la hora de entrar, no lo que importa.`,
      forte:
        `Reconocimiento sin esfuerzo: ${c.nomeElemA} leyendo ${c.nomeElemA}. Ustedes no gastan energía explicándose lo obvio el uno al otro, ` +
        `y en el capítulo del matrimonio es justamente el trígono entre el Sol y la Luna de las dos cartas lo que Ptolomeo asocia a las uniones que duran.`,
      cuidado:
        `Lo que la geometría no entrega aquí es fricción. El trígono describe facilidad, y la facilidad no empuja a nadie de su lugar — ` +
        `lo que necesite cambiar entre ${c.A} y ${c.B} sale de ustedes, porque el aspecto no lo cobra. ` +
        `(Esta última frase es lectura de la app: Ptolomeo dice "armónico" y ahí se detiene.)`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
      fontes: [
        'Ptolomeo, Tetrabiblos I.13 — el trígono es armónico; cuatro signos, 120 grados',
        'Ptolomeo, Tetrabiblos IV.7 — trígono y sextil en el MISMO peldaño: "they make the sympathies less"',
        'William Lilly, Christian Astrology, Londres, 1647, Libro I, p. 106 — "the Trine is more forcible": el orden entre los dos armónicos es suyo, no de Ptolomeo',
        'Ptolomeo, Tetrabiblos IV.5 — luminarias en trígono entre las dos cartas: uniones duraderas',
        ARISTOTELES_LOCUS + ' — las dos cualidades del elemento ' + c.nomeElemA,
      ],
    };
  },

  sextil(c) {
    const q = c.qComum;
    return {
      aspecto: 'Sextil',
      natureza: 'afinidad por una cualidad en común',
      categoria: CATEGORIAS.harmonico,
      resumo: `${c.A} y ${c.B} tienen un punto de encuentro de verdad y libertad para diferir en el resto. Sextil — el ángulo suave, que la fuente llama armónico.`,
      texto:
        `Hay conexión de verdad entre ${c.A} y ${c.B}, sin la exigencia de ser iguales: un punto en común sostiene la conversación, y el resto cada uno lo resuelve a su manera. ` +
        `El nombre de esto es Sextil (es cuando dos signos se ven desde un ángulo suave): dos signos de distancia, 60 grados — ` +
        `armónico (la palabra de la fuente para un encuentro de afinidad) en Tetrabiblos I.13, y en el mismo peldaño del trígono (el otro ángulo fácil) en la escalera de cuatro posiciones de Tetrabiblos IV.7, el libro de Ptolomeo. ` +
        `Llamar al sextil el más suave de los dos es de William Lilly (Christian Astrology, 1647, p. 106: "the Trine is more forcible" — el trígono es el más fuerte de los dos), no de Ptolomeo. ` +
        `En la física antigua, cada elemento es dos cosas: ${c.artA} de ${c.A} es ${c.qA}; ${c.artB} de ${c.B}, ${c.qB}. ` +
        `Lo que los dos tienen en común es una sola cualidad, lo ${q} — no es la identidad del trígono, es medio camino, y esa cuenta es nuestra, vía Aristóteles. ` +
        `Lo que es de Ptolomeo: a dos signos de distancia se ven (I.13) y son de la misma polaridad (la fuente dice "mismo género": la lista de los signos alterna uno sí, uno no, y estos dos caen en el mismo grupo — I.12). ` +
        `Las modalidades divergen (${c.A} ${c.modA.nome}, ${c.B} ${c.modB.nome}), así que el tiempo de cada uno es distinto.`,
      forte:
        `Un punto de contacto real — lo ${q} — y ninguna obligación de ser iguales en el resto. ` +
        `Ptolomeo pone al sextil al lado del trígono entre los aspectos de unión duradera.`,
      cuidado:
        `El sextil es contacto, no fusión: el encaje es de una sola cualidad, y las otras dos quedan fuera de la cuenta. ` +
        `Donde uno funciona a un ritmo que el otro no sigue, nadie está equivocado — son elementos distintos.`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.duradouro],
      fontes: [
        'Ptolomeo, Tetrabiblos I.13 — el sextil es armónico; dos signos, 60 grados',
        'Ptolomeo, Tetrabiblos I.12 — los géneros de los signos alternan uno a uno: a dos signos de distancia, el género es siempre el mismo',
        'Ptolomeo, Tetrabiblos IV.7 — sextil y trígono en el MISMO peldaño: "they make the sympathies less"',
        'William Lilly, Christian Astrology, Londres, 1647, Libro I, p. 106 — "the Trine is more forcible": el orden entre los dos armónicos es suyo, no de Ptolomeo',
        'Ptolomeo, Tetrabiblos IV.5 — luminarias en sextil: uniones duraderas',
        ARISTOTELES_LOCUS + ` — ${c.nomeElemA} y ${c.nomeElemB} comparten lo ${q}`,
      ],
    };
  },

  quadratura(c) {
    const contrarios = c.comum.length === 0;
    const mod = c.modA; // la cuadratura es siempre la MISMA modalidad — aritmética del zodíaco
    const abertura = contrarios
      ? `${c.A} es ${c.qA}; ${c.B} es ${c.qB}: ninguna cualidad en común. ` +
        `Según la física de Aristóteles, ${c.artA} y ${c.artB} son contrarios absolutos — es el caso más duro que una cuadratura puede tener ` +
        `(la física es de Aristóteles; graduar una cuadratura como más dura que otra es lectura de esta app, no cita).`
      : `${c.A} es ${c.qA}; ${c.B} es ${c.qB}. Los dos todavía comparten lo ${c.qComum} — un hilo en común, y uno solo. ` +
        `No es el peor caso de la propia cuadratura: contrarios absolutos, según la física de Aristóteles, serían elementos sin ninguna cualidad en común ` +
        `(la física es de Aristóteles; graduar una cuadratura como más dura que otra es lectura de esta app, no cita).`;
    const aberturaHumana = contrarios
      ? `El choque entre ${c.A} y ${c.B} es de los grandes: cada uno quiere llevar la vida para su lado, con la misma fuerza y al mismo tiempo — nadie está equivocado, es temperamento contra temperamento, casi sin terreno neutral. `
      : `Hay chispa de verdad entre ${c.A} y ${c.B}: cada uno jala para su lado, con la misma fuerza y al mismo tiempo — pero existe un hilo sosteniendo las dos puntas, y aparece cuando baja el polvo. `;
    return {
      aspecto: 'Cuadratura',
      natureza: contrarios ? 'fricción entre contrarios absolutos' : 'fricción con un hilo en común',
      categoria: CATEGORIAS.desarmonico,
      resumo: `${c.A} y ${c.B} tienen fricción de verdad — cada uno jala para su lado, con la misma fuerza. Cuadratura: disarmónica en la fuente, y la fuente no decide el resto.`,
      texto:
        aberturaHumana +
        `El nombre de esto es Cuadratura (es cuando dos signos se ven desde un ángulo que aprieta): tres signos de distancia, 90 grados. ` +
        `Ptolomeo la lista entre los aspectos DISARMÓNICOS (la palabra de la fuente para un encuentro de fricción), y da el motivo — ` +
        `está compuesta de "signos de tipos opuestos". ${abertura} ` +
        `Y los dos son del grupo ${mod.nome} (${mod.ptolomeu} en Ptolomeo: ${mod.glosa}): mismo tiempo interno, blancos distintos. ` +
        `Ustedes se disputan el mismo territorio.`,
      forte:
        `Ustedes sí se ven. La cuadratura es aspecto — los dos lados se miran y se reconocen, y es exactamente por eso que logran pelear, ` +
        `irritarse y eventualmente arreglarse. La aversión, que es el "no combina" de verdad de la tradición, no permite ni la pelea.`,
      cuidado:
        `Aquí duele, y la tradición no finge lo contrario: en el capítulo del matrimonio, Ptolomeo pone la cuadratura al lado de la oposición y de los signos disjuntos ` +
        `entre las posiciones en que ocurren separaciones. Y, en el MISMO capítulo, el propio Ptolomeo avisa que eso no es sentencia — con los planetas que la tradición llama benéficos (Venus y Júpiter) ` +
        `apoyando al Sol y a la Luna (las "luminarias" de la fuente), la unión en posición disarmónica no se termina, y trae "recomienzos y recuerdos, que preservan gentileza y afecto". ` +
        `Un aspecto tenso describe por qué la relación duele donde duele. No decide el desenlace, y esta app no decide por ti.`,
      // El campo `caminho`: ver el bloque de comentario del pack pt — mismas
      // cuatro reglas (sin promesa, concreto, con fuente donde la hay, sin
      // salud ni porcentaje) y misma cobertura de pruebas en los tres idiomas.
      caminho: contrarios
        ? `Por dónde empezar, en la práctica: sin ninguna cualidad en común entre ${c.artA} y ${c.artB}, el terreno neutral no viene listo — ` +
          `acordar ANTES quién decide qué, asunto por asunto, suele rendir más que resolverlo en caliente. ` +
          `Y vale recordar lo que dice la fuente sobre la figura: William Lilly (Christian Astrology, Londres, 1647, p. 106) llama a la cuadratura "imperfect enmity" ` +
          `(enemistad imperfecta) y, en la misma página, deduce de ahí que "the matter is not yet so farre gone" — es la pelea en la que todavía hay reconciliación posible.`
        : `Por dónde empezar, en la práctica: el hilo en común es lo ${c.qComum}, y de ahí suele salir el terreno neutral — ` +
          `volver a lo que los dos ya comparten antes de discutir lo que los separa es el gesto más barato que tiene esta pareja a mano. ` +
          `Y vale recordar lo que dice la fuente sobre la figura: William Lilly (Christian Astrology, Londres, 1647, p. 106) llama a la cuadratura "imperfect enmity" ` +
          `(enemistad imperfecta) y, en la misma página, deduce de ahí que "the matter is not yet so farre gone" — es la pelea en la que todavía hay reconciliación posible.`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
      fontes: [
        'Ptolomeo, Tetrabiblos I.13 — la cuadratura es disarmónica: "signos de tipos opuestos"',
        'Ptolomeo, Tetrabiblos IV.5 — separación; y el modificador que impide la sentencia',
        ARISTOTELES_LOCUS +
          (contrarios
            ? ` — ${c.nomeElemA} y ${c.nomeElemB} no comparten ninguna cualidad`
            : ` — ${c.nomeElemA} y ${c.nomeElemB} comparten lo ${c.qComum}`),
        'Ptolomeo, Tetrabiblos I.11 — los grupos de modalidad (aquí, ' + mod.nome + '); que la cuadratura caiga siempre en el mismo grupo es aritmética del zodíaco (3 signos = misma columna módulo 3), no afirmación del capítulo',
      ],
    };
  },

  oposicao(c) {
    const q = c.qComum;
    const mod = c.modA; // la oposición también es siempre la misma modalidad
    return {
      aspecto: 'Oposición',
      natureza: 'eje — las dos puntas del mismo diámetro',
      categoria: CATEGORIAS.desarmonico,
      resumo: `${c.A} y ${c.B}: las dos puntas del mismo eje — se completan y se enfrentan por el mismo motivo. Oposición, disarmónica en la fuente.`,
      texto:
        `Uno es el revés del otro: lo que atrae y lo que roza entre ${c.A} y ${c.B} nace del mismo lugar, y ese tira y afloja es el diseño de la pareja — no un defecto. ` +
        `El nombre de esto es Oposición (dos signos de frente uno al otro, cada uno en una punta del mismo eje): el eje ${c.A}–${c.B}, seis signos, 180 grados. ` +
        `Ptolomeo la lista entre los disarmónicos (la palabra de la fuente para un encuentro de fricción), y el propio Ptolomeo la liga a Saturno, el planeta del límite, al explicar las casas (Tetrabiblos I.17). ` +
        `Y hay un detalle honesto: la explicación que Ptolomeo da para los encuentros de fricción ni siquiera cierra bien para este caso — la dureza aquí es de posición, no de temperamento (la aritmética de eso está en las fuentes, aquí abajo). ` +
        `Por el elemento tampoco se explica: ${c.artA} y ${c.artB} comparten lo ${q}, y son exactamente los mismos pares de elemento que el sextil (el ángulo suave de 60 grados) junta. ` +
        `La dureza de la oposición no es de elemento, es de posición — es el eje (lectura nuestra, y aritmética verificable) — y IV.7 la pone en el peldaño de abajo en vez de entre los armónicos. ` +
        `Los dos son del grupo ${mod.nome} (${mod.glosa}) — dos polos con el mismo tiempo interno.`,
      forte:
        `Lo que a uno le falta al otro le sobra, y no por casualidad: es el mismo eje visto desde los dos lados. ` +
        `Ningún otro par de signos se completa por un motivo tan estructural como este. ` +
        `(En la tradición, el lugar del matrimonio se cuenta a partir del Ascendente — la carta completa, no solo el signo. ` +
        `Leer el séptimo signo a partir del Sol es un atajo de esta app, no doctrina antigua.)`,
      cuidado:
        `Encuentro de iguales en polos contrarios: ustedes se completan y se enfrentan por el mismo motivo, y el motivo es estructural, no circunstancial — es el diseño del eje. ` +
        `Ptolomeo pone la oposición entre las posiciones de separación — y, en la misma página, registra que los planetas que la tradición llama benéficos (Venus y Júpiter), ` +
        `apoyando al Sol y a la Luna (las "luminarias" de la fuente), traen "recomienzos y recuerdos, que preservan gentileza y afecto". Descripción de la naturaleza del encuentro, no de su final.`,
      caminho:
        `Por dónde empezar, en la práctica: el eje es UNO solo, así que casi nunca hay algo que ganar en solitario aquí — ` +
        `alternar quién conduce, tema por tema, suele sostener más que insistir en convencer al otro de cruzar a tu lado. ` +
        `Y el terreno común es verificable, no es consuelo: ${c.artA} y ${c.artB} comparten lo ${q}, el mismo par de elementos que junta el ángulo suave de 60 grados — ` +
        `empezar una conversación dura por ahí es usar lo que ya existe (la aritmética es de la física de Aristóteles; usarla así es lectura de esta app).`,
      verbatins: [VERBATIM.harmonicos, VERBATIM.modificador],
      fontes: [
        'Ptolomeo, Tetrabiblos I.13 — la oposición es disarmónica; seis signos, 180 grados',
        'Ptolomeo, Tetrabiblos I.12 — los géneros de los signos alternan uno a uno a partir de Aries: por eso los signos opuestos son siempre del MISMO género, y la justificación de I.13 no se aplica a la oposición',
        'Ptolomeo, Tetrabiblos I.17 (las casas de los planetas) — la oposición ligada a Saturno: los signos opuestos a las luminarias son suyos porque "their diametrical aspect is not consistent with beneficence"',
        'Ptolomeo, Tetrabiblos IV.5 — separación; y el modificador que impide la sentencia',
        ARISTOTELES_LOCUS + ` — ${c.nomeElemA} y ${c.nomeElemB} comparten lo ${q}: elementos compatibles`,
        'Julius Firmicus Maternus, Mathesis, siglo IV — el séptimo LUGAR (el Descendente, contado desde el Ascendente) como lugar de la unión (atribución consensual; verbatim no verificado)',
      ],
    };
  },

  aversao(c, distancia) {
    const umSigno = distancia === 1;
    const abertura = umSigno
      ? `${c.A} y ${c.B} están a UN signo de distancia, 30 grados. Ptolomeo describe esos signos como si estuvieran "como desviados el uno del otro".`
      : `${c.A} y ${c.B} están a CINCO signos de distancia, 150 grados. Ptolomeo los pone fuera de los cuatro aspectos, junto con los vecinos de 30 grados.`;
    const aberturaHumana = umSigno
      ? `De entrada, ${c.A} y ${c.B} ni se ven — no es rivalidad, es que el tema no viene listo: vecinos de muro que casi no se cruzan. Puente entre ustedes existe, pero se construye a mano. `
      : `Desde donde están, ${c.A} y ${c.B} no se divisan — no es enemistad, es distancia sin ventana: el entendimiento que exista entre ustedes lo levantaron ustedes dos, ladrillo a ladrillo. `;
    return {
      aspecto: 'Aversión',
      natureza: umSigno ? 'signos disjuntos — vecinos que no se ven' : 'signos disjuntos — distantes que no se ven',
      categoria: CATEGORIAS.semAspecto,
      resumo: `${c.A} y ${c.B} de entrada ni se ven — no es pelea, falta ángulo: Ptolomeo no registra aspecto a ${distancia} ${umSigno ? 'signo' : 'signos'} de distancia.`,
      texto:
        aberturaHumana +
        `El nombre que da la fuente es Aversión (dos signos que no forman ángulo alguno entre sí — ni el fácil, ni el difícil). ` +
        `${abertura} Esto NO es un aspecto: él llama a esos signos "disjuntos y ajenos" (quiere decir: separados y extraños el uno al otro), y dice que no tienen familiaridad alguna entre sí. ` +
        `El criterio es óptico — los signos en aspecto se ven; estos no se ven. ` +
        `Y no hay nada, ni de un lado ni del otro, que sostenga: ${c.A} es ${c.nomeElemA} y ${c.modA.nome} (${c.modA.glosa}); ${c.B} es ${c.nomeElemB} y ${c.modB.nome} (${c.modB.glosa}). ` +
        `Ni el elemento ni el ritmo de la estación (la modalidad) en común. Este es el "no combina" de la tradición — y no la cuadratura, como se suele decir por ahí.`,
      forte:
        `Nada aquí es heredado. Si existe reconocimiento entre ${c.A} y ${c.B}, lo construyeron ustedes dos — ` +
        `la geometría no puede llevarse el crédito, y en rigor ni siquiera tiene algo que decir.`,
      cuidado:
        `La aversión no es pelea: es ausencia de reconocimiento automático, dos signos que no se registran. Es el punto de partida más desfavorable de la tradición, ` +
        `y es también el punto donde la lectura por signo solar muestra su límite — la comparación de parejas que hace Ptolomeo (el nombre de eso es sinastría) no mira solo el signo: ` +
        `mira el Sol y la Luna de la carta natal entera de cada uno. Esto describe el comienzo, no el final: ningún texto antiguo decreta el desenlace de nada a partir de dos signos.`,
      caminho: umSigno
        ? `Por dónde empezar, en la práctica: aquí nada llega por reconocimiento automático, así que decir en voz alta lo que quedaría sobreentendido — ` +
          `qué espera cada uno de la semana, y qué día — suele ahorrar más fricción que cualquier arreglo hecho después del hecho. ` +
          `Y la fuente da una pista útil: en Tetrabiblos IV.7 Ptolomeo registra que el lazo tiene TIPO — por elección, por necesidad, o por placer y dolor —, ` +
          `y donde la geometría no entrega familiaridad alguna lo que queda es la elección, dicha con todas las letras (la aplicación práctica es lectura de esta app).`
        : `Por dónde empezar, en la práctica: sin ángulo entre los dos, el encuentro no ocurre por casualidad — ` +
          `fijar un punto de la semana que sea de los dos, y repetirlo, suele rendir más aquí que cualquier conversación sobre la relación. ` +
          `Y conviene traducir en vez de suponer: ${c.A} y ${c.B} no comparten elemento ni modalidad, así que lo que a uno le parece obvio rara vez llegó entero al otro ` +
          `(la falta de familiaridad es de Tetrabiblos I.16; la traducción práctica es lectura de esta app).`,
      verbatins: [VERBATIM.disjuntos, VERBATIM.separacao],
      fontes: [
        'Ptolomeo, Tetrabiblos I.16 — signos disjuntos y ajenos, a uno o a cinco signos de distancia',
        'Ptolomeo, Tetrabiblos IV.5 — luminarias en signos disjuntos entre las posiciones de separación',
        ARISTOTELES_LOCUS + ` — ${c.nomeElemA} y ${c.nomeElemB}: elementos distintos`,
        'Ptolomeo, Tetrabiblos I.11 — modalidades distintas (' + c.modA.nome + ' y ' + c.modB.nome + ')',
      ],
    };
  },

  copresenca(c) {
    return {
      aspecto: 'Copresencia',
      natureza: 'mismo signo — la geometría se calla',
      categoria: CATEGORIAS.copresenca,
      resumo: `${c.A} con ${c.A}: dos iguales partiendo del mismo lugar. Copresencia, y no aspecto — Ptolomeo enumera cuatro, y este no está en la lista.`,
      texto:
        `Dos iguales en el mismo lugar: ustedes se reconocen de entrada y hablan el mismo idioma de nacimiento — el desafío es que nadie dentro de la pareja mira desde afuera. ` +
        `El nombre de esto es Copresencia (estar juntos en el mismo signo, en vez de mirarse desde algún ángulo). ` +
        `Y aquí la tradición dice algo que esta app insiste en repetir en voz alta: esto NO es un aspecto. ` +
        `Ptolomeo enumera cuatro — oposición, trígono, cuadratura y sextil — y repite la lista más adelante; la conjunción (el nombre que se usa hoy para dos astros juntos en el mismo signo) no está en ella. ` +
        `Los signos en el mismo lugar no se miran: están juntos. ${c.A} con ${c.A} es ${c.nomeElemA} sobre ${c.nomeElemA}, ${c.qA} por partida doble, ` +
        `los dos del grupo ${c.modA.nome} (${c.modA.ptolomeu} en Ptolomeo: ${c.modA.glosa}). Ningún contraste que medir. ` +
        `Sobre PLANETAS juntos, Lilly (Christian Astrology, 1647, p. 106) dice que la conjunción es buena o mala según quién se junta — sobre dos signos iguales, lo que da la fuente es IV.7.`,
      forte:
        `Ustedes parten del mismo lugar: mismo elemento, mismas dos cualidades, misma modalidad. ` +
        `No hay malentendido de temperamento que traducir entre uno y otro.`,
      cuidado:
        `Tampoco hay espejo que sostenga: lo que uno exagera, el otro lo exagera igual, y no hay un tercer punto de vista dentro de la pareja. ` +
        `Y fíjate en lo que la app NO está haciendo aquí: como la geometría se calla, no hay aspecto que nombrar — ` +
        `lo que la fuente dice del mismo signo es que produce "secure and indissoluble sympathy" (simpatía firme, que no se deshace) — y es lo único que se puede decir. ` +
        `Donde no hay figura que leer, esta app prefiere callarse también.`,
      verbatins: [VERBATIM.quatroAspectos, VERBATIM.disjuntos],
      fontes: [
        'Ptolomeo, Tetrabiblos I.13 — la enumeración de los cuatro aspectos; la conjunción no está entre ellos',
        'Ptolomeo, Tetrabiblos I.16 — "the four aforesaid aspects, opposition, trine, quartile, and sextile"',
        'William Lilly, Christian Astrology, Londres, 1647, Libro I, p. 106 — "Conjunctions are good or bad, as the Planets in Conjunction are friends or enemies to one another": doctrina sobre PLANETAS en conjunción, no sobre dos signos solares iguales',
        ARISTOTELES_LOCUS + ` — las dos cualidades del elemento ${c.nomeElemA}`,
        'Ptolomeo, Tetrabiblos I.11 — modalidad ' + c.modA.nome,
      ],
    };
  },
};

// Lo que cada planeta mueve en cada dimensión. Caracterología contemporánea,
// declarada como tal — tercera persona del singular a propósito.
const PLANETA = {
  Marte: {
    quimica: 'llega, pregunta y ya sabe la respuesta',
    conversa: 'abre por el problema y quiere el problema resuelto hoy',
    briga: 'levanta la voz antes de pensar',
    casa: 'resuelve a la fuerza y detesta pedir ayuda',
    prazo: 'necesita un blanco adelante para no aburrirse',
  },
  'Vênus': {
    quimica: 'deja la pregunta en el aire más tiempo del necesario, porque la espera es la mitad del placer',
    conversa: 'vuelve siempre a cómo se portó cada quien con quién',
    briga: 'pone mala cara y deja la conversación para el día siguiente',
    casa: 'arregla la casa y el ambiente antes de cualquier visita',
    prazo: 'necesita sentirse elegido de nuevo, y seguido',
  },
  'Mercúrio': {
    quimica: 'manda tres mensajes antes de rozarle la mano a alguien',
    conversa: 'llega con tres temas y suelta el primero a la mitad',
    briga: 'argumenta para ganar, no para entender',
    casa: 'hace la lista y reparte la tarea',
    prazo: 'necesita que todavía exista tema nuevo entre los dos',
  },
  Lua: {
    quimica: 'quiere el olor conocido en la almohada antes de querer cualquier otra cosa',
    conversa: 'habla de lo que quedó atravesado tres días después de que quedó',
    briga: 'se repliega y deja que el silencio pese',
    casa: 'cuida el detalle que nadie ve',
    prazo: 'necesita sentirse a salvo para seguir abierto',
  },
  Sol: {
    quimica: 'quiere ser mirado al instante, y nota al instante cuando no lo es',
    conversa: 'saca el plan grande y lo que los dos están construyendo',
    briga: 'se hiere en el orgullo y se endurece',
    casa: 'quiere ser la referencia de la casa',
    prazo: 'necesita oír el reconocimiento en voz alta',
  },
  'Júpiter': {
    quimica: 'convierte la noche en plan y el plan en historia para contar después',
    conversa: 'empieza hablando de viajes y termina hablando del sentido de las cosas',
    briga: 'suelta una verdad demasiado grande y pasa la semana arrepintiéndose',
    casa: 'gasta más de lo que planeó y promete más de lo que cabe',
    prazo: 'necesita horizonte abierto, no correa',
  },
  Saturno: {
    quimica: 'se demora, prueba el terreno, y cuando se suelta es de una vez',
    conversa: 'trae trabajo, dinero y lo que se puede sostener hasta fin de mes',
    briga: 'se pone frío y empieza a cobrar lo acordado',
    casa: 'controla la cuenta, la agenda y lo que quedó acordado',
    prazo: 'necesita compromiso dicho con todas las letras',
  },
};

const MESMO_REGENTE_LEAD = {
  quimica: 'corren con el mismo motor',
  conversa: 'jalan del mismo lugar',
  briga: 'se encienden de la misma manera',
  casa: 'administran la vida de la misma manera',
  prazo: 'necesitan lo mismo para seguir en pie',
};

function fraseRegentes(c, campo) {
  const a = PLANETA[c.regA][campo];
  const b = PLANETA[c.regB][campo];
  if (c.A === c.B) {
    return `Siendo el mismo signo de los dos lados, ${c.A} ${a} — y el rasgo viene doble, sin nadie que haga contrapunto.`;
  }
  if (c.regA === c.regB) {
    return `${c.A} y ${c.B} ${MESMO_REGENTE_LEAD[campo]}, y el retrato vale para los dos: cada uno ${a}.`;
  }
  return `${c.A} ${a}; ${c.B} ${b}.`;
}

const QUIMICA_CAMA = {
  copresenca: 'ustedes quieren lo mismo a la misma hora, y nadie jala: no hay desde dónde mirar al otro desde arriba',
  trigono: 'ustedes agarran el ritmo la primera noche, y el problema aquí nunca es falta de ganas',
  sextil: 'empieza más lento de lo que los dos esperaban y mejora con el tiempo, que es lo contrario de lo que suele pasar',
  quadratura: 'lo que irrita de día es exactamente lo que jala de noche',
  oposicao: 'en la cama la discusión del día sigue por otros medios, y es ahí donde funciona',
  aversao30: 'al principio uno de los dos siempre cree que quiere más que el otro, y casi nunca es verdad: es solo el tiempo de respuesta que es distinto',
  aversao150: 'las ganas no llegan juntas, llegan cuando uno de los dos decide que llegaron',
};

const QUIMICA_FIGURA = {
  copresenca: (c) => `Con ${c.A} de los dos lados el deseo es de espejo: ustedes reconocen sus propias ganas en el otro y se encienden sin traducir nada — ${QUIMICA_CAMA.copresenca}.`,
  trigono: (c) => `Entre ${c.A} y ${c.B} el deseo corre suelto porque los dos quieren lo mismo y en el mismo idioma — ${QUIMICA_CAMA.trigono}.`,
  sextil: () => `La atracción entre ustedes es de curiosidad: existe un punto de encuentro de verdad y diferencia suficiente para mantener la gracia — ${QUIMICA_CAMA.sextil}.`,
  quadratura: (c) => `El deseo entre ustedes nace de la fricción, y ${c.A} y ${c.B} lo saben mejor de lo que admiten: ${QUIMICA_CAMA.quadratura}.`,
  oposicao: () => `Ustedes se atraen por el revés: lo que te fascina del otro es exactamente lo que te falta a ti, y ninguno de los dos lo admite en voz alta — ${QUIMICA_CAMA.oposicao}.`,
  aversao30: () => `Entre ustedes el deseo no viene listo: falta esa chispa de reconocimiento inmediato, y lo que existe se construyó en la convivencia — ${QUIMICA_CAMA.aversao30}.`,
  aversao150: () => `La atracción entre ustedes suele nacer de afuera hacia adentro, porque nada en el encuentro de los dos es automático — ${QUIMICA_CAMA.aversao150}.`,
};

const QUIMICA_ELEMENTO = {
  'fogo+fogo': () => 'Fuego con fuego se enciende rápido, sube alto y no tiene la menor paciencia con los rodeos.',
  'terra+terra': () => 'Tierra con tierra es deseo físico y sin prisa: piel, olor, repetición, y un gusto declarado por lo que ya se sabe que funciona.',
  'ar+ar': () => 'Aire con aire se enciende por la cabeza — una frase justa en el momento justo vale más aquí que cualquier avance.',
  'água+água': () => 'Agua con agua es deseo emocional antes que físico: cuando el ambiente está torcido, el cuerpo lo sabe primero.',
  'ar+fogo': (c) => `${c.el('ar')} se enciende por la cabeza y ${c.el('fogo')} se enciende por el cuerpo, y es ese desencuentro de puerta de entrada lo que mantiene a los dos curiosos.`,
  'terra+água': (c) => `${c.el('água')} entra por el ambiente y ${c.el('terra')} entra por el tacto, y las dos puertas dan al mismo lugar — es un deseo más fácil de sostener que de explicar.`,
  'fogo+terra': (c) => `${c.el('fogo')} quiere ahora y ${c.el('terra')} quiere bien hecho: la fricción empieza en el reloj, y es la misma fricción la que sostiene la atracción.`,
  'fogo+água': (c) => `${c.el('fogo')} avanza y ${c.el('água')} siente antes de responder — cuando el tiempo de los dos coincide es eléctrico, y cuando no coincide uno se siente rechazado y el otro apurado.`,
  'ar+terra': (c) => `${c.el('ar')} quiere conversar sobre el deseo y ${c.el('terra')} quiere practicarlo en silencio, y ninguno de los dos entiende de inmediato por qué el otro insiste en lo contrario.`,
  'ar+água': (c) => `${c.el('água')} necesita ambiente y ${c.el('ar')} necesita ligereza: funciona muy bien mientras nadie le cobre al otro su propio idioma.`,
};

const QUIMICA_MODALIDADE = {
  'cardeal+cardeal': () => 'El riesgo es que el deseo se vuelva la cosa que los dos postergan, porque los dos solo saben empezar.',
  'fixo+fixo': () => 'El riesgo es que el deseo se vuelva hábito y los dos repitan el mismo guion por meses, sin quejarse y sin cambiar nada.',
  'mutavel+mutavel': () => 'El riesgo es que cambie el tema, cambie el plan y cambien las ganas junto con ellos, y falte la repetición que convierte atracción en intimidad.',
  'cardeal+fixo': (c) => `Se enfría cuando ${c.md('cardeal')} propone novedad y ${c.md('fixo')} quiere lo que ya funcionó, y uno lee al otro como prisa o como estancamiento.`,
  'cardeal+mutavel': (c) => `Se enfría cuando ${c.md('cardeal')} decide y ${c.md('mutavel')} se adapta, hasta el día en que adaptarse sale demasiado caro.`,
  'fixo+mutavel': (c) => `Se enfría cuando ${c.md('fixo')} quiere garantía y ${c.md('mutavel')} quiere libertad de cambiar de idea, y esa es la conversación que siempre vuelve a la cama.`,
};

const CONVERSA_FIGURA = {
  copresenca: () => `Ustedes se entienden con media frase, y lo que nadie saca es justamente el defecto que los dos tienen igual.`,
  trigono: () => `Ustedes conversan sin esfuerzo y sin traducción, y el tema que nadie saca es el que exigiría estar en desacuerdo.`,
  sextil: () => `Ustedes tienen tema fácil y ninguna obligación de estar de acuerdo, y lo que nadie saca es el acuerdo de fondo, porque todo está funcionando.`,
  quadratura: () => `Ustedes discuten bien: la conversación tiene tesis, contratesis y marcador, y lo que nadie saca es el pedido de disculpas.`,
  oposicao: () => `Ustedes conversan como dos lados de la misma cuestión, y cada frase de uno responde a una que el otro ni llegó a decir — lo que nadie saca es la pregunta de quién cede.`,
  aversao30: () => `Entre ustedes no existe tema listo: la conversación hay que jalarla, casi siempre el mismo, y lo que nadie saca es lo que exigiría explicar por qué eso importa.`,
  aversao150: () => `Ustedes parten de referencias lejanas y gastan buena parte del aliento explicándose lo obvio, y lo que nadie saca es el pasado de cada uno, que queda en cajas separadas.`,
};

const CONVERSA_ELEMENTO = {
  'fogo+fogo': () => 'Dos de fuego hablan fuerte, se entusiasman juntos y se cortan la frase sin maldad: el tema avanza más rápido que la escucha.',
  'terra+terra': () => 'Dos de tierra conversan poco y resuelven mucho, y lo que los dos llaman conversación suele ser un acuerdo práctico.',
  'ar+ar': () => 'Dos de aire conversan por deporte, y lo que se traba no es falta de tema — es falta de conclusión.',
  'água+água': () => 'Dos aguas dicen mucho sin decir: la mitad de la conversación pasa en miradas, tono y silencio, y la otra mitad queda para después.',
  'ar+fogo': (c) => `${c.el('ar')} trae el tema y ${c.el('fogo')} trae la opinión, y es una conversación rápida que rara vez aburre.`,
  'terra+água': (c) => `${c.el('água')} habla de lo que sintió y ${c.el('terra')} responde con lo que se puede hacer, y falta acordar cuándo uno quiere solución y cuándo quiere solo ser escuchado.`,
  'fogo+terra': (c) => `${c.el('fogo')} habla en bloque y ya quiere decidir, ${c.el('terra')} pide detalle antes de aceptar, y lo que se traba es ritmo y no contenido.`,
  'fogo+água': (c) => `${c.el('fogo')} dice la cosa directa que ${c.el('água')} suele rumiar por días, y el tema a veces reaparece a la semana siguiente.`,
  'ar+terra': (c) => `${c.el('ar')} teoriza y ${c.el('terra')} quiere el ejemplo concreto: el malentendido clásico es que uno encuentre al otro superficial y el otro encuentre al primero complicado.`,
  'ar+água': (c) => `${c.el('ar')} explica el sentimiento y ${c.el('água')} siente la explicación, y cuando la cosa se enciende uno huye a la lógica y el otro huye al silencio.`,
};

const CONVERSA_MODALIDADE = {
  'cardeal+cardeal': () => 'Quién cede el tema: ninguno de los dos, y por eso la conversación que importa suele volverse dos conversaciones paralelas.',
  'fixo+fixo': () => 'Quién cede el tema: nadie cede, pero los dos archivan — el asunto sale de la mesa entero y vuelve igualito semanas después.',
  'mutavel+mutavel': () => 'Quién cede el tema: los dos, con gusto, y por eso el asunto que importa queda para el próximo domingo.',
  'cardeal+fixo': (c) => `Quién cede el tema: ${c.md('cardeal')}, que ya quiere concluir y pasar al siguiente, mientras ${c.md('fixo')} sigue en el mismo punto.`,
  'cardeal+mutavel': (c) => `Quién cede el tema: ${c.md('mutavel')}, que cambia de ruta sin quejarse y solo se da cuenta después de que no fue escuchado.`,
  'fixo+mutavel': (c) => `Quién cede el tema: ${c.md('mutavel')}, y ${c.md('fixo')} recoge el asunto y lo devuelve en la frase siguiente, igualito.`,
};

const BRIGA_FIGURA = {
  copresenca: () => `Ustedes pelean por el defecto compartido: cada uno ve en el otro lo que no soporta de sí, y la vuelta ocurre cuando los dos se cansan al mismo tiempo.`,
  trigono: () => `El motivo recurrente entre ustedes suele ser pequeño y se disuelve al día siguiente, porque a ninguno de los dos le gusta mantener el conflicto en pie.`,
  sextil: () => `Lo que se atraviesa entre ustedes es distancia: nada explota, pero uno de los dos desaparece unos días y el otro no pregunta.`,
  quadratura: () => `Ustedes pelean por territorio — los dos quieren mandar en lo mismo y a la misma hora —, y la vuelta suele llegar por cansancio, no por acuerdo.`,
  oposicao: () => `La pelea de ustedes es siempre la misma con nombres distintos, cuánto cede cada uno, y la vuelta suele ser rápida porque ninguno de los dos se acostumbra a quedarse sin el contrapunto.`,
  aversao30: () => `Entre ustedes el motivo recurrente es malentendido puro: uno dijo una cosa y el otro oyó otra, y la vuelta depende de que alguien explique lo que parecía obvio.`,
  aversao150: () => `Lo que duele entre ustedes es la sensación de no ser tomado en serio, y el reacercamiento suele venir de afuera, por un asunto práctico que obliga a los dos a hablarse.`,
};

const BRIGA_ELEMENTO = {
  'fogo+fogo': () => 'Los dos explotan, y explotan juntos: sube en diez segundos y baja casi igual de rápido, siempre que nadie se lo guarde.',
  'terra+terra': () => 'Ninguno de los dos grita: los dos se enfurruñan, trabajan callados y dejan la conversación envejecer por días.',
  'ar+ar': () => 'El desencuentro se vuelve debate, gana el que argumenta mejor, y por eso nadie sale satisfecho.',
  'água+água': () => 'Nadie dice lo que dolió en el momento: los dos se alejan, lloran por separado y vuelven cuando el clima cambia solo.',
  'ar+fogo': (c) => `${c.el('fogo')} explota y ${c.el('ar')} racionaliza, y nada irrita más a quien está con rabia que oír un argumento bien armado.`,
  'terra+água': (c) => `${c.el('água')} se lastima y ${c.el('terra')} se endurece, y el silencio de los dos tiene sentidos distintos que nadie traduce.`,
  'fogo+terra': (c) => `${c.el('fogo')} patalea en el momento y ${c.el('terra')} no responde, y vuelve al tema tres días después con todo anotado.`,
  'fogo+água': (c) => `${c.el('fogo')} grita y olvida, ${c.el('água')} no grita y no olvida: es diferencia de memoria, no de amor.`,
  'ar+terra': (c) => `${c.el('ar')} quiere discutir la relación y ${c.el('terra')} quiere dejar de hablar y actuar, y cada uno llama fuga al método del otro.`,
  'ar+água': (c) => `${c.el('ar')} convierte el asunto en chiste para despejar el aire y ${c.el('água')} entiende el chiste como poco interés.`,
};

const BRIGA_MODALIDADE = {
  'cardeal+cardeal': () => 'Duración: corta y frecuente, porque los dos quieren resolver en el momento y recomenzar en el momento.',
  'fixo+fixo': () => 'Duración: larga, porque ninguno de los dos recula primero — y el reacercamiento llega por un gesto práctico, casi nunca por una disculpa formal.',
  'mutavel+mutavel': () => 'Duración: indefinida, porque el conflicto no termina, se disuelve, y a veces reaparece meses después con otra ropa.',
  'cardeal+fixo': (c) => `Duración: ${c.md('cardeal')} quiere resolver hoy y ${c.md('fixo')} necesita tiempo, y apurar al segundo es lo que más alarga el asunto.`,
  'cardeal+mutavel': (c) => `Duración: corta, porque ${c.md('mutavel')} cede antes del final — y ceder demasiado pronto es lo que hace volver el mismo motivo.`,
  'fixo+mutavel': (c) => `Duración: ${c.md('fixo')} sostiene el resentimiento mientras ${c.md('mutavel')} ya cambió de tema, y esa diferencia de reloj se vuelve el segundo motivo.`,
};

const CONVIVENCIA_FIGURA = {
  copresenca: (c) => `En el día a día, ${c.A} y ${c.B} tienen las mismas mañas y los mismos huecos: lo que uno deja para mañana, el otro también lo deja.`,
  trigono: (c) => `En el día a día, ${c.A} y ${c.B} se coordinan sin reunión, porque las prioridades ya nacen parecidas.`,
  sextil: (c) => `En el día a día, ${c.A} y ${c.B} se ayudan sin mezclarse: cada uno tiene su rincón, y las puntas se encuentran a fin de mes.`,
  quadratura: (c) => `En el día a día, ${c.A} y ${c.B} se disputan el mismo lugar de la casa y de la agenda, y la fricción aparece más un martes común que en una crisis grande.`,
  oposicao: (c) => `En el día a día, ${c.A} y ${c.B} dividen la vida por polos: lo que uno hace bien, el otro ni lo toca — y funciona, hasta que uno de los dos se siente solo en su propio sector.`,
  aversao30: (c) => `En el día a día, ${c.A} y ${c.B} tropiezan en lo pequeño — horarios, platos, quién avisa a quién —, y nada de eso es grande mientras todo eso es diario.`,
  aversao150: (c) => `En el día a día, ${c.A} y ${c.B} viven casi en paralelo, cada uno con la rutina entera armada, y hay que agendar encuentro dentro de la propia casa.`,
};

const CONVIVENCIA_ELEMENTO = {
  'fogo+fogo': () => 'El dinero entra y sale rápido: los dos gastan en lo que da placer y postergan lo aburrido.',
  'terra+terra': () => 'Cuentas al día, casa en orden y división acordada — es cómodo, y corre el riesgo de volverse pura administración.',
  'ar+ar': () => 'La casa vive llena de gente y de planes, y la rutina es el puesto que nadie quiere asumir.',
  'água+água': () => 'La casa se vuelve refugio: acoge a todo el mundo, guarda todo, y a veces queda poco espacio para los dos.',
  'ar+fogo': (c) => `${c.el('fogo')} decide y ${c.el('ar')} negocia, y ninguno de los dos quiere la parte aburrida, que es la cuenta que vence el día diez.`,
  'terra+água': (c) => `${c.el('terra')} sostiene la estructura y ${c.el('água')} sostiene el ambiente: es una división que funciona bien y que necesita decirse en voz alta para no volverse reclamo.`,
  'fogo+terra': (c) => `${c.el('fogo')} quiere cambiar de casa, de carro y de ciudad mientras ${c.el('terra')} quiere terminar de pagar la primera, y el dinero es el tema que más vuelve.`,
  'fogo+água': (c) => `${c.el('fogo')} empuja el barco hacia afuera y ${c.el('água')} empuja el barco hacia adentro, y la familia de cada uno entra en la cuenta más de lo que los dos quisieran.`,
  'ar+terra': (c) => `${c.el('terra')} cuida lo fijo y ${c.el('ar')} cuida lo variable, y funciona hasta el día en que uno de los dos se cansa de su propio papel.`,
  'ar+água': (c) => `${c.el('ar')} planifica y ${c.el('água')} siente si el plan cabe, y la rutina de la casa es lo que más rápido queda para después.`,
};

const CONVIVENCIA_MODALIDADE = {
  'cardeal+cardeal': () => 'Quién decide: los dos quieren decidir, y el arreglo que funciona es dividir territorios en vez de dividir cada decisión.',
  'fixo+fixo': () => 'Quién decide: quien decidió la primera vez, porque lo que se volvió hábito en esa casa tiene vida larga.',
  'mutavel+mutavel': () => 'Quién decide: depende del día, y ahí es donde la casa queda frágil — va bien en la improvisación y mal en lo que necesita fecha.',
  'cardeal+fixo': (c) => `Quién decide: ${c.md('cardeal')} propone y empuja, y ${c.md('fixo')} tiene poder de veto y lo usa.`,
  'cardeal+mutavel': (c) => `Quién decide: ${c.md('cardeal')}, casi siempre, y ${c.md('mutavel')} descubre su propia opinión solo después de que ya fue atropellada.`,
  'fixo+mutavel': (c) => `Quién decide: ${c.md('fixo')} en las cosas de raíz — casa, cuentas, plazos — y ${c.md('mutavel')} en todo lo que cambia cada semana.`,
};

const LONGO_FIGURA = {
  copresenca: (c) => `Lo que sostiene a ${c.A} y ${c.B} es el reconocimiento: nadie aquí necesita explicar quién es.`,
  trigono: (c) => `Lo que sostiene a ${c.A} y ${c.B} es la facilidad, y la facilidad es justamente lo que no le cobra cambio a nadie.`,
  sextil: (c) => `Lo que sostiene a ${c.A} y ${c.B} es la libertad: el vínculo es real y no exige que ninguno de los dos deje de ser quien es.`,
  quadratura: (c) => `Lo que sostiene a ${c.A} y ${c.B} es que la disputa la toman en serio los dos — friccionar por algo que ambos quieren es señal de que ambos todavía quieren.`,
  oposicao: (c) => `Lo que sostiene a ${c.A} y ${c.B} es la necesidad mutua de contrapunto: cada uno usa al otro para ver su propio punto ciego.`,
  aversao30: (c) => `Lo que sostiene a ${c.A} y ${c.B} es lo que se construyó a mano, porque nada aquí vino gratis.`,
  aversao150: (c) => `Lo que sostiene a ${c.A} y ${c.B} es la elección repetida: sin reconocimiento automático, cada día juntos es una decisión tomada de nuevo.`,
};

const LONGO_ELEMENTO = {
  'fogo+fogo': () => 'Dos de fuego duran mientras tengan un proyecto en común que empujar, y lo que pide trabajo consciente es el aburrimiento, que aquí se vuelve pelea por nada.',
  'terra+terra': () => 'Dos de tierra duran por construcción, porque lo hecho juntos pesa a favor, y lo que pide trabajo consciente es no dejar que la vida se vuelva puro mantenimiento.',
  'ar+ar': () => 'Dos de aire duran mientras sigan siendo interesantes el uno para el otro, y lo que pide trabajo consciente es el día en que el tema escasea.',
  'água+água': () => 'Dos aguas duran por el vínculo emocional, que es fuerte y no necesita palabras, y lo que pide trabajo consciente es aprender a decir aquello que los dos ya saben.',
  'ar+fogo': (c) => `${c.el('ar')} y ${c.el('fogo')} duran por el movimiento — mientras haya plan nuevo, hay gasolina —, y lo que pide trabajo consciente es la parte quieta de la vida.`,
  'terra+água': (c) => `${c.el('terra')} y ${c.el('água')} duran por el cuidado mutuo, que aquí es real, y lo que pide trabajo consciente es no confundir cuidado con control.`,
  'fogo+terra': (c) => `${c.el('fogo')} y ${c.el('terra')} duran por el respeto a lo que el otro hace bien, y lo que pide trabajo consciente es el tiempo, que nunca es el mismo para los dos.`,
  'fogo+água': (c) => `${c.el('fogo')} y ${c.el('água')} duran por la intensidad, que los dos reconocen de lejos, y lo que pide trabajo consciente es la temperatura, que se negocia en vez de vencerse.`,
  'ar+terra': (c) => `${c.el('ar')} y ${c.el('terra')} duran por la complementariedad práctica, y lo que pide trabajo consciente es la sensación recurrente de estar solo estando acompañado.`,
  'ar+água': (c) => `${c.el('ar')} y ${c.el('água')} duran por la ternura sin peso, y lo que pide trabajo consciente es la hora de la conversación seria, que los dos postergan.`,
};

const LONGO_FECHO = {
  harmonico: 'La facilidad tampoco es promesa: lo que está descrito aquí es el modo de la cosa, y el desenlace sigue siendo de ustedes dos.',
  desarmonico: 'Y queda dicho, porque es lo que la tradición registra y el mercado esconde: la fricción no es sentencia — la misma fuente que esta app cita describe la unión en posición difícil que no se termina, y vuelve a rehacerse.',
  semAspecto: 'Y esto describe el comienzo de ustedes, no el final: la falta de reconocimiento automático es punto de partida, y un punto de partida no decide ningún desenlace.',
  copresenca: 'La semejanza tampoco es promesa: lo que está descrito aquí es el modo de la cosa, y el desenlace sigue siendo de ustedes dos.',
};

const CHAMADA = {
  copresenca: (c) => `${c.A} con ${c.B}: dos iguales en el mismo lugar, y el espejo muestra todo — incluso lo que nadie quería ver.`,
  trigono: (c) => `${c.A} y ${c.B}: mismo idioma, mismo ritmo de deseo, y quien da el primer paso casi siempre es ${c.lider}.`,
  sextil: (c) => `${c.A} y ${c.B}: conexión de verdad con espacio de sobra — ${c.lider} jala, ${c.segue} acompaña, y nadie se siente ahogado.`,
  quadratura: (c) => `${c.A} y ${c.B}: lo que irrita de día es lo que enciende de noche, y quien empuja la relación hacia adelante es ${c.lider}.`,
  oposicao: (c) => `${c.A} y ${c.B}: imán y tira y afloja en la misma cuerda. Nadie cede primero, y eso es lo que jala y eso es lo que cansa.`,
  aversao30: (c) => `${c.A} y ${c.B}: nada aquí viene listo, ni el deseo ni la conversación, y el puente suele levantarlo ${c.lider}.`,
  aversao150: (c) => `${c.A} y ${c.B}: dos mundos que no se cruzan por casualidad — ${c.lider} da el primer paso, y lo que existe entre los dos fue elegido.`,
};

export const PACK = {
  lang: 'es',
  signos: SIGNOS,
  elementos: ELEMENTOS,
  artigos: ARTIGOS,
  qualidades: QUALIDADES_NOME,
  fraseQualidades,
  modalidades: MODALIDADES,
  categorias: CATEGORIAS,
  grausIV7: GRAUS_IV7,
  aristotelesLocus: ARISTOTELES_LOCUS,
  notaEscala: NOTA_ESCALA,
  notaGrau: NOTA_GRAU,
  ressalvaSignoSolar: RESSALVA_SIGNO_SOLAR,
  notaCaracterologia: NOTA_CARACTEROLOGIA,
  rotuloCaminho: ROTULO_CAMINHO,
  verbatim: VERBATIM,
  leituras: LEITURAS,
  planeta: PLANETA,
  mesmoRegenteLead: MESMO_REGENTE_LEAD,
  fraseRegentes,
  quimicaCama: QUIMICA_CAMA,
  quimicaFigura: QUIMICA_FIGURA,
  quimicaElemento: QUIMICA_ELEMENTO,
  quimicaModalidade: QUIMICA_MODALIDADE,
  conversaFigura: CONVERSA_FIGURA,
  conversaElemento: CONVERSA_ELEMENTO,
  conversaModalidade: CONVERSA_MODALIDADE,
  brigaFigura: BRIGA_FIGURA,
  brigaElemento: BRIGA_ELEMENTO,
  brigaModalidade: BRIGA_MODALIDADE,
  convivenciaFigura: CONVIVENCIA_FIGURA,
  convivenciaElemento: CONVIVENCIA_ELEMENTO,
  convivenciaModalidade: CONVIVENCIA_MODALIDADE,
  longoFigura: LONGO_FIGURA,
  longoElemento: LONGO_ELEMENTO,
  longoFecho: LONGO_FECHO,
  chamada: CHAMADA,
};
