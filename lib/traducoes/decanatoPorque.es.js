// lib/traducoes/decanatoPorque.es.js
// EL PACK EN ESPAÑOL de "por qué esta carta es este decanato" — español
// rioplatense/neutro de app, natural, sin calcos del portugués.
//
// Misma FORMA que lib/traducoes/decanatoPorque.pt.js: mismas claves, mismos
// campos, funciones con la misma firma. Lo que NUNCA cambia entre packs: el
// verbatim inglés de Robbins (traducir una cita es falsificarla), los loci
// (Tetrabiblos I.22 sigue siendo Tetrabiblos I.22), los números, los nombres de
// OBRA (Book T sigue siendo Book T) y las CLAVES internas — los nombres de
// planeta, signo, naipe, elemento y modalidad siguen en portugués en los tres
// packs porque son datos, no texto de pantalla.
//
// Todas las reglas del encabezado de lib/decanatoPorque.js valen para cada
// string de acá: enganchar primero y citar después, locus en toda afirmación
// histórica, ninguna afirmación de salud, ningún veredicto ni promesa, ningún
// aviso defensivo — y la específica de esta feature: NO LEER LA VIDA DE NADIE.
// Esta pantalla explica un encaje, no lo que la carta significa para vos.

const PLANETAS = {
  'Saturno': 'Saturno',
  'Júpiter': 'Júpiter',
  'Marte': 'Marte',
  'Sol': 'Sol',
  'Vênus': 'Venus',
  'Mercúrio': 'Mercurio',
  'Lua': 'Luna',
};

const SIGNOS = {
  'Áries': 'Aries', 'Touro': 'Tauro', 'Gêmeos': 'Géminis', 'Câncer': 'Cáncer',
  'Leão': 'Leo', 'Virgem': 'Virgo', 'Libra': 'Libra', 'Escorpião': 'Escorpio',
  'Sagitário': 'Sagitario', 'Capricórnio': 'Capricornio', 'Aquário': 'Acuario', 'Peixes': 'Piscis',
};

// La palabra que une planeta y signo en la etiqueta que publica el mazo
// ("Marte en Aries"). El motor arma la etiqueta con ella y la compara con el
// mazo — si algún día difieren, el test lo agarra.
const CONECTOR = 'en';

const NAIPES = { paus: 'Bastos', copas: 'Copas', espadas: 'Espadas', ouros: 'Oros' };
const ELEMENTOS = { fogo: 'Fuego', agua: 'Agua', ar: 'Aire', terra: 'Tierra' };
const MODALIDADES = { cardinal: 'cardinal', fixo: 'fijo', mutavel: 'mutable' };
const ORDINAIS = { 1: 'primero', 2: 'segundo', 3: 'tercero' };
const NUMERO_EXTENSO = {
  2: 'Dos', 3: 'Tres', 4: 'Cuatro', 5: 'Cinco', 6: 'Seis',
  7: 'Siete', 8: 'Ocho', 9: 'Nueve', 10: 'Diez',
};

// Nombres de autor que lib/traducoes/datacao.js todavía no conoce: cubre el
// elenco antiguo (Ptolomeo, Valente, Catón…), no la Golden Dawn ni Dión Casio,
// y este archivo no puede editar aquel. Extensión local con las MISMAS claves
// en los tres packs; pierde contra el mapa compartido el día en que aprenda
// estos nombres. Ver autorNaLingua() en el motor.
const AUTORES = {
  'Dio Cássio': 'Dión Casio',
  'Ordem Hermética da Golden Dawn': 'Orden Hermética de la Golden Dawn',
  'Israel Regardie': 'Israel Regardie',
};

// La nota que acompaña a cada fuente de las capas. Vive en el pack, no en el
// motor, porque es PROSA. Las claves son las de CAMADAS[].fontes[].notaChave
// del motor y son las MISMAS en los tres packs.
const NOTAS_DE_FONTE = {
  robbins: 'trad. Robbins, 1940',
  cary: 'trad. Cary, LacusCurtius',
  regardie: 'la publicación que sacó el Book T del círculo cerrado',
};

function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} y ${itens[itens.length - 1]}`;
}

function faixa(c) {
  return `de ${c.grauInicio}° a ${c.grauFim}° de ${c.signoNome}`;
}

// ---------------------------------------------------------------------------
// LAS CITAS — verbatim, sin traducir
// ---------------------------------------------------------------------------
const VERBATIM = {
  ptolomeuRejeita: {
    texto:
      'These matters, as they have only plausible and not natural, but, rather, unfounded, arguments in their favour, we shall omit.',
    parafrase:
      'El astrólogo más influyente del mundo antiguo mira los decanatos y dice que los argumentos a favor son plausibles, no naturales y, en el fondo, sin base — así que los va a dejar afuera. Los dejó. Sobrevivieron sin él.',
    obra: 'Tetrabiblos I.22',
    autor: 'Ptolomeu',
    quando: 'séc. II',
    nota: 'trad. Robbins, 1940',
  },
  ptolomeuFace: {
    texto:
      "The planets are said to be in their 'proper face' when an individual planet keeps to the sun or moon the same aspect which its house has to their houses",
    parafrase:
      'Su "cara propia" es un planeta guardando, con el Sol o con la Luna, el mismo ángulo que su casa guarda con las casas de esos dos. Es relación de ángulo. No es el pedazo de diez grados del signo — mismo nombre, otra cosa.',
    obra: 'Tetrabiblos I.23',
    autor: 'Ptolomeu',
    quando: 'séc. II',
    nota: 'trad. Robbins, 1940',
  },
};

// ---------------------------------------------------------------------------
// BLOQUE 1 — EL GANCHO. Vida real, sin término técnico, sin nombre propio, sin
// siglo. Cambia por naipe porque el momento de sacar carta es distinto en cada
// territorio, y porque la misma apertura en 36 cartas se vuelve molde reciclado.
// ---------------------------------------------------------------------------
const CHAMADA = {
  paus: () =>
    'Barajaste con una decisión atragantada — si vas, si te quedás, si mandás el mensaje. Salió esta carta. ' +
    'Cuál carta sale es azar, y mañana puede salir otra. Qué pedazo de cielo es esta carta no tiene nada de azar: ya estaba decidido antes de que el mazo llegara a tu mano.',
  copas: () =>
    'Barajaste pensando en una persona. Quizá en esa charla que quedó por la mitad, quizá en la que ni empezó. Salió esta carta. ' +
    'Cuál carta sale es azar. Qué pedazo de cielo es esta carta, no: ya estaba decidido antes de que el mazo llegara a tu mano.',
  espadas: () =>
    'Barajaste después de la discusión — de esas donde la buena respuesta aparece tres horas más tarde. Salió esta carta. ' +
    'Cuál carta sale es azar. Qué pedazo de cielo es esta carta, no: ya estaba decidido antes de que el mazo llegara a tu mano.',
  ouros: () =>
    'Barajaste con la cuenta del mes en la cabeza, o con el trabajo que no arranca. Salió esta carta. ' +
    'Cuál carta sale es azar, y mañana puede salir otra. Qué pedazo de cielo es esta carta no tiene nada de azar: ya estaba decidido antes de que el mazo llegara a tu mano.',
};

// ---------------------------------------------------------------------------
// BLOQUE 2 — LA EXPLICACIÓN. Cinco párrafos: abre en la vida real, muestra la
// regla, muestra la cuenta cerrando, y recién ahí entrega el recibo con obra,
// autor y siglo.
// ---------------------------------------------------------------------------
const EXPLICACAO = (c) =>
  `Hay algo que casi nadie separa cuando saca una carta. El azar decide CUÁL carta llega a tu mano — y nada más que eso. ` +
  `Lo que esa carta es, el pedazo de cielo que ocupa, el nombre antiguo que lleva: nada de eso salió sorteado con ella. ` +
  `Estaba escrito antes, en una regla que no hizo excepción con ninguna de las treinta y seis cartas numeradas. Y la regla entra en cuatro pasos.` +
  `\n\n` +
  `Paso uno: el palo da el elemento. El palo de ${c.naipeNome} es ${c.elementoNome}, y ${c.elementoNome} en el cielo son tres signos — ${lista(c.signosDoElemento)}. ` +
  `Paso dos: el número elige cuál de los tres. Dos, Tres y Cuatro van al signo cardinal del elemento; Cinco, Seis y Siete al fijo; Ocho, Nueve y Diez al mutable. ` +
  `Esta es un ${c.numeroExtenso}, y el signo ${c.modalidadeNome} de ${c.elementoNome} es ${c.signoNome}. ` +
  `Paso tres: el número también elige el pedazo. Cada signo tiene treinta grados y se parte en tres tajadas de diez — eso es lo que la tradición llama decanato, un tercio de signo. ` +
  `Dos, Cinco y Ocho toman el primer tercio; Tres, Seis y Nueve el segundo; Cuatro, Siete y Diez el tercero. El ${c.numeroExtenso} toma el ${c.ordinal}: ${faixa(c)}.` +
  `\n\n` +
  `Paso cuatro, el más lindo: el planeta sale de un conteo. Poné en fila los treinta y seis tercios en orden, del primero de ${c.ariesNome} al último de ${c.peixesNome}. ` +
  `Ahora repartí los siete planetas en rueda, siempre en este orden — ${lista(c.ordemCaldaicaNome)} —, uno por tercio, empezando con ${c.planetaQueAbre} en el tercio número uno. ` +
  `${c.posicao === 1
      ? `Este es el tercio número uno, y por eso el planeta es ${c.planetaNome}.`
      : `Este es el tercio número ${c.posicao} de treinta y seis: son ${c.passos} pasos desde ${c.planetaQueAbre} hasta él, y ${c.passos} pasos en la rueda de siete caen en ${c.planetaNome}.`} ` +
  `Por eso esta carta es ${c.rotulo}. El nombre tradicional que lleva, ${c.tituloGD}, viene de la misma tabla.` +
  `\n\n` +
  `Y fijate cómo cierra la cuenta. Doce signos, tres tercios en cada uno: treinta y seis. El elemento avanza de cuatro en cuatro signos y el trío de números avanza de tres en tres; ` +
  `como tres y cuatro no tienen divisor común, cada naipe recibe cada trío exactamente una vez. Por eso los cuatro naipes tienen Dos, Tres, Cuatro, Cinco, Seis, Siete, Ocho, Nueve y Diez completos — no sobra carta ni falta carta. ` +
  `Los planetas, en cambio, no cierran redondo: treinta y seis dividido siete da cinco y sobra uno. ${c.planetaQueAbre} aparece ${c.vezesDoPlanetaQueAbre} veces en la vuelta, los otros seis aparecen ${c.vezesDosOutros} cada uno. El sobrante es ${c.planetaQueAbre}, y por eso la vuelta abre en él y cierra en él.` +
  `\n\n` +
  `Ahora el recibo, porque las tres capas de esto tienen edades muy distintas y el mercado las vende como si fueran una sola. ` +
  `Los tercios de diez grados ya circulaban y ya eran pelea en la antigüedad: ${c.autorPtolomeu}, en Tetrabiblos I.22, ${c.quandoPtolomeu}, escribe sobre ellos "we shall omit" — el astrólogo más sistemático del mundo antiguo tiró los decanatos por la borda, y sobrevivieron igual. ` +
  `El orden de los siete planetas que usa el conteo está en ${c.autorDio}, Historia Romana 37.18–19, ${c.quandoDio}. ` +
  `Y quien encajó los treinta y seis tercios en las treinta y seis cartas fue la ${c.autorGoldenDawn}, en Book T — The Tarot, ${c.anoBookT}, publicado por ${c.autorRegardie} en The Golden Dawn, ${c.quandoRegardie}. ` +
  `La estructura del cielo es antigua; el encaje en las cartas tiene poco más de cien años. Conviene saber cuál es cuál.`;

// ---------------------------------------------------------------------------
// LA REGLA EN CUATRO PASOS — para la pantalla que prefiera lista numerada
// ---------------------------------------------------------------------------
const A_REGRA = [
  {
    titulo: 'El palo da el elemento',
    texto: (c) =>
      `El palo de ${c.naipeNome} es ${c.elementoNome}. Y ${c.elementoNome}, en el cielo, son tres signos: ${lista(c.signosDoElemento)}. ` +
      `Ninguna carta numerada de ${c.naipeNome} cae fuera de esos tres.`,
  },
  {
    titulo: 'El número elige cuál de los tres',
    texto: (c) =>
      `Dos, Tres y Cuatro van al signo cardinal del elemento; Cinco, Seis y Siete al fijo; Ocho, Nueve y Diez al mutable. ` +
      `Esta carta es un ${c.numeroExtenso}, y el signo ${c.modalidadeNome} de ${c.elementoNome} es ${c.signoNome}.`,
  },
  {
    titulo: 'El número también elige el tercio',
    texto: (c) =>
      `Cada signo tiene treinta grados y se parte en tres tajadas de diez — decanato es eso, un tercio de signo. ` +
      `Dos, Cinco y Ocho toman el primer tercio; Tres, Seis y Nueve el segundo; Cuatro, Siete y Diez el tercero. ` +
      `El ${c.numeroExtenso} toma el ${c.ordinal}: ${faixa(c)}.`,
  },
  {
    titulo: 'El conteo da el planeta',
    texto: (c) =>
      `Poné en fila los treinta y seis tercios en orden, del primero de ${c.ariesNome} al último de ${c.peixesNome}, y repartí los siete planetas en rueda — ` +
      `${lista(c.ordemCaldaicaNome)} —, empezando con ${c.planetaQueAbre} en el tercio número uno. ` +
      `${c.posicao === 1
        ? `Este es el tercio número uno: el conteo empieza exactamente acá, y el planeta es ${c.planetaNome}.`
        : `Este es el tercio número ${c.posicao} de treinta y seis; ${c.passos} pasos en la rueda desde ${c.planetaQueAbre} caen en ${c.planetaNome}.`} ` +
      `De ahí la etiqueta: ${c.rotulo}.`,
  },
];

const A_CONTA = (c) =>
  c.posicao === 1
    ? `Tercio número ${c.posicao} de 36. El conteo empieza exactamente acá: ${c.planetaQueAbre} abre la vuelta, y el planeta de esta carta es ${c.planetaNome}.`
    : `Tercio número ${c.posicao} de 36. Son ${c.passos} pasos desde ${c.planetaQueAbre} hasta acá, y ${c.passos} pasos en la rueda de siete caen en ${c.planetaNome}.`;

const NOTA_DA_VOLTA = (c) =>
  `Los siete no cierran redondo en treinta y seis: treinta y seis dividido siete da cinco y sobra uno. ` +
  `${c.planetaQueAbre} aparece ${c.vezesDoPlanetaQueAbre} veces en la vuelta y cada uno de los otros seis aparece ${c.vezesDosOutros}. ` +
  `El sobrante es ${c.planetaQueAbre} — y por eso la vuelta abre en él, en el primer tercio de ${c.ariesNome}, y cierra en él, en el último de ${c.peixesNome}.`;

const NOTA_DO_PRIMEIRO_TERCO = (c) =>
  `Una regla que parece existir y casi existe — y vale mirarla de cerca, porque de esos casi nacen las leyendas. ` +
  `El primer tercio de ${c.ariesNome} cae en ${c.planetaQueAbre}, que es justamente el dueño de ${c.ariesNome} en la tabla de domicilios de ${c.autorPtolomeu} (Tetrabiblos I.17, ${c.quandoPtolomeu}). ` +
  `Da ganas de concluir que cada signo abre con su propio dueño. No es así: entre los doce, esto pasa en ${c.signosQueAbremComODono.length} — ${lista(c.signosQueAbremComODono)} —, y los dos son casas de ${c.planetaQueAbre}, que es quien abre el conteo. ` +
  `En los otros diez no coincide: ${c.touroNome} abre en ${c.abreTouro} y su dueño es ${c.donoDeTouro}; ${c.gemeosNome} abre en ${c.abreGemeos} y su dueño es ${c.donoDeGemeos}. ` +
  `Dos de doce es efecto colateral del punto de partida, no principio. Y ningún texto antiguo de esta base dice por qué el conteo empieza en ${c.planetaQueAbre} — la falta queda declarada en vez de rellenada con un motivo lindo.`;

const CONFERENCIA_TEXTO = (c) =>
  `Verificado ahora, con esta pantalla abierta: el app rehízo los cuatro pasos para las treinta y seis cartas y comparó cada una con la tabla del mazo. Coinciden ${c.conferem} de ${c.total}.`;

// ---------------------------------------------------------------------------
// LAS TRES CAPAS — la cadena entera, cada eslabón con su edad
// ---------------------------------------------------------------------------
const CAMADAS = {
  decanatos: {
    titulo: 'Los tercios de diez grados',
    idade: 'antigüedad, sin fecha cerrada',
    texto:
      'Dividir cada signo en tres tajadas de diez grados es la pieza más vieja de la cadena, y esta base no logró fijar obra ni autor para su origen. Lo que sí está verificado es el techo: en el siglo II los decanatos ya circulaban y ya eran discutidos, porque Ptolomeo los conoce y los descarta con todas las letras. Sobrevivieron a pesar de él.',
  },
  ordemDosPlanetas: {
    titulo: 'El orden de los siete',
    idade: 'antiguo, con fuente fechada',
    texto:
      'Saturno, Júpiter, Marte, Sol, Venus, Mercurio, Luna: los siete por período aparente decreciente, del más lento al más rápido, leídos como distancia a la Tierra. La misma secuencia genera las horas planetarias y los nombres de los días de la semana. Quien aplicó ese orden a los treinta y seis tercios empezando por Marte fue la astrología helenística, en las llamadas caras — y ese eslabón puntual esta base no lo leyó en fuente primaria.',
  },
  asTrintaESeisCartas: {
    titulo: 'El encaje en las treinta y seis cartas',
    idade: 'siglo XIX',
    texto:
      'Esta es la capa nueva, y es la que suele venderse como antigua. Poner los treinta y seis tercios en las treinta y seis cartas numeradas, en orden zodiacal, empezando por el Dos de Bastos, es obra de la Golden Dawn. No existe equivalente en Lévi, en Etteilla ni en el tarot italiano. La estructura del cielo es milenaria; esta correspondencia no.',
  },
};

// ---------------------------------------------------------------------------
// LAS SALVEDADES QUE VAN CON TODA LECTURA
// ---------------------------------------------------------------------------
const NOTA_ATRIBUICAO_RIVAL = () =>
  'Una frase que este app no escribe: "la atribución astrológica del tarot". No existe una. ' +
  'Existen por lo menos tres, incompatibles entre sí — la de la Golden Dawn (Book T, 1888), que es la que se usa acá; la continental de Éliphas Lévi (Dogme et Rituel de la Haute Magie, 1854–1856) y de Papus (1889), que corre todas las letras un casillero; y la de Aleister Crowley (The Book of Thoth, 1944), que intercambia dos. ' +
  'Decir "la" atribución sería esconder que hubo una elección. La elección de este app está dicha, y es la de 1888.';

const NOTA_ARMADILHA_PTOLOMEU = (c) =>
  `La trampa de cita de esta materia, y es común hasta en manual impreso. ` +
  `${c.autorPtolomeu} tiene un capítulo sobre "cara" — Tetrabiblos I.23, ${c.quandoPtolomeu} — y más de un libro moderno lo cita como si fuera la fuente del decanato. No lo es. ` +
  `Ahí, "cara" es un planeta guardando con el Sol o con la Luna el mismo ángulo que su casa guarda con las casas de esos dos: relación de ángulo, no tajada de diez grados. Mismo nombre, otra cosa. ` +
  `Y en el capítulo anterior, I.22, el mismo autor rechaza los decanatos. Quien cita I.23 para justificar decanato está citando en contra de sí mismo.`;

const NOTA_LEITURA_DO_APP = (c) =>
  `Qué es fuente y qué es lectura del app, separado. La fuente: la tabla de las treinta y seis cartas es de la ${c.autorGoldenDawn}, Book T — The Tarot, ${c.anoBookT}, y el app no le cambió una línea. ` +
  `La lectura del app: los cuatro pasos que acabás de leer son NUESTRA manera de contar la cuenta — la fuente publica la tabla terminada, no la receta. ` +
  `Lo que hizo el app fue rehacer el recorrido, de diez en diez grados y de siete en siete planetas, y verificar carta por carta si reproduce las treinta y seis entradas. Las reproduce, sin excepción, y la verificación corre cada vez que se abre esta pantalla. ` +
  `Si algún día una carta no coincide, esta pantalla lo dice en lugar de contar la historia igual.`;

// ---------------------------------------------------------------------------
// LA BIBLIOGRAFÍA
// ---------------------------------------------------------------------------
const FONTES = [
  'Ptolomeo, Tetrabiblos I.22 (trad. F. E. Robbins, Loeb/Harvard, 1940), siglo II — los decanatos ya circulan y él los rechaza: "we shall omit". Es lo que prueba su antigüedad, por boca de quien no los quería',
  'Ptolomeo, Tetrabiblos I.23, siglo II — su "cara propia" es relación de ángulo con el Sol y la Luna, y NO el tercio de diez grados. Nunca citar I.23 para justificar decanato',
  'Ptolomeo, Tetrabiblos I.17, siglo II — los domicilios de los siete, usados acá solo para mostrar que "cada signo abre con su propio dueño" coincide en dos signos de doce, Aries y Escorpio, y que los dos son casas de Marte, que es quien abre el conteo',
  'Dión Casio, Historia Romana 37.18–19 (trad. Cary, LacusCurtius), siglo III — el orden de los siete: Saturno, Júpiter, Marte, Sol, Venus, Mercurio, Luna. Él mismo llama reciente, para su época, a la costumbre planetaria',
  'Orden Hermética de la Golden Dawn, Book T — The Tarot, 1888 — el encaje de los treinta y seis decanatos en las treinta y seis cartas numeradas, con los títulos ("Señor del Dominio", "Señor de la Ruina")',
  'Israel Regardie, The Golden Dawn, 1937–1940 — la publicación que sacó el Book T del círculo cerrado de la Orden',
  'Éliphas Lévi, Dogme et Rituel de la Haute Magie, 1854–1856, y Papus, 1889 — la atribución continental rival, que corre todas las letras un casillero',
  'Aleister Crowley, The Book of Thoth, 1944 — la tercera atribución, que intercambia Heh y Tzaddi y mantiene los signos',
];

// ---------------------------------------------------------------------------
// CUANDO LA CARTA NO TIENE DECANATO — y cada motivo es un motivo distinto
// ---------------------------------------------------------------------------
const FALTA = {
  maior: {
    texto:
      'Los veintidós Arcanos Mayores no entran en esta cuenta, y no es olvido: en la misma tabla de 1888 reciben otra cosa — una letra hebrea cada uno, y con ella un signo, un planeta o un elemento. El decanato es asunto de las treinta y seis cartas numeradas de Dos a Diez. Sumando: veintidós Mayores, cuatro Ases, dieciséis figuras y treinta y seis numeradas dan las setenta y ocho del mazo.',
    comoResolver: 'La atribución de esta carta aparece en su ficha, en Tarot por Tema.',
  },
  as: {
    texto:
      'El As no es un pedazo de cielo. En la misma tabla de 1888 es la raíz del elemento del naipe entero — la fuerza todavía sin lugar, antes de cualquier división en grados. Los cuatro Ases quedan fuera de los treinta y seis decanatos a propósito, y por eso la cuenta del mazo cierra.',
    comoResolver: 'La atribución de esta carta aparece en su ficha, en Tarot por Tema.',
  },
  corte: {
    texto:
      'Las dieciséis figuras reciben elemento compuesto, no decanato. Y acá la tabla misma tiene dos versiones rivales: la Golden Dawn usa Caballero, Reina, Príncipe y Princesa, y este mazo es Rider-Waite-Smith, que tiene Rey y Sota en lugar de Príncipe y Princesa. El app usa la adaptación corriente y registra que es adaptación, en vez de fingir que hay una sola convención.',
    comoResolver: 'La atribución de esta carta aparece en su ficha, en Tarot por Tema.',
  },
  carta: {
    texto:
      'Esta carta no fue reconocida en el mazo, así que no hay encaje que explicar. El app prefiere decir esto antes que armar una explicación sobre una carta que no encontró.',
    comoResolver: 'Volvé a la tirada en Tarot por Tema y tocá la carta de nuevo.',
  },
  divergencia: {
    texto: (e) =>
      `La regla y la tabla del mazo no coinciden en esta carta: el conteo produce "${e.daRegra}" y el mazo publica "${e.doBaralho}". ` +
      'Cuando pasa esto, el app no explica un encaje que no pudo verificar — mostrar la diferencia es más honesto que elegir uno de los dos en silencio.',
    comoResolver: 'Nada que hacer acá: es un desencuentro dentro del propio app, y queda registrado en esta pantalla.',
  },
};

// ---------------------------------------------------------------------------
// EL CHROME DE LA PANTALLA — títulos y etiquetas de quien MUESTRA esta lectura
// ---------------------------------------------------------------------------
// Nació cuando la sección entró en el modal del Álbum de las 78. La pantalla no
// redacta ni una línea: todo lo que necesita escribir vive aquí, con paridad
// exacta de claves con .pt y .en. Ninguna de estas etiquetas dice lo que la
// carta significa — solo nombran las cajas donde aparece la REGLA.
const CHROME = {
  titulo: 'Por qué esta carta es este decanato',
  subtitulo: 'La regla que lo decidió antes de que la baraja llegara a tus manos',
  abrir: 'Toca para ver la regla',
  fechar: 'Toca para cerrar la regla',
  rotuloTituloGD: 'Nombre tradicional',
  rotuloRegra: 'La regla, en cuatro pasos',
  rotuloConta: 'La cuenta de esta carta',
  rotuloConferencia: 'Verificado ahora',
  rotuloCamadas: 'Las tres edades de esto',
  rotuloCitacoes: 'En el original',
  rotuloRessalvas: 'Lo que acompaña a esta lectura',
  rotuloFontes: 'Dónde verificarlo',
};

export const PACK = {
  idioma: 'es',
  tela: 'Tarot por Tema',
  chrome: CHROME,
  autores: AUTORES,
  planetas: PLANETAS,
  signos: SIGNOS,
  conector: CONECTOR,
  naipes: NAIPES,
  elementos: ELEMENTOS,
  modalidades: MODALIDADES,
  ordinais: ORDINAIS,
  numeroExtenso: NUMERO_EXTENSO,
  notasDeFonte: NOTAS_DE_FONTE,
  lista,
  faixa,
  chamada: CHAMADA,
  explicacao: EXPLICACAO,
  aRegra: A_REGRA,
  aConta: A_CONTA,
  notaDaVolta: NOTA_DA_VOLTA,
  notaDoPrimeiroTerco: NOTA_DO_PRIMEIRO_TERCO,
  conferenciaTexto: CONFERENCIA_TEXTO,
  camadas: CAMADAS,
  notaAtribuicaoRival: NOTA_ATRIBUICAO_RIVAL,
  notaArmadilhaPtolomeu: NOTA_ARMADILHA_PTOLOMEU,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  verbatim: VERBATIM,
  fontes: FONTES,
  falta: FALTA,
};

export default PACK;
