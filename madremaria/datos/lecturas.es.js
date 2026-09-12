// datos/lecturas.es.js
// ESPANHOL dos dois catalogos de datos/lecturas.js — as oito figuras da borra e
// as quatro linhas da mao. Arquivo VIZINHO, como datos/textos.es.js: o PT fica
// no original (testes leem a copy crua de la por readFileSync) e cada idioma
// mora no seu, para dois tradutores nao colidirem.
//
// ===========================================================================
// O QUE ESTE ARQUIVO TRAZ, E O QUE ELE NAO TRAZ
// ===========================================================================
// Ele traz SO texto visivel: nome, comoE, leitura, pergunta, naoTemFonte e a
// `nota` de dentro da fonte (que e prosa da Madre sobre o que a obra NAO
// sustenta, e por isso se traduz e se vigia).
//
// Ele NAO traz:
//   · id — chave tecnica. Mudar id = dado do disco orfao, sem erro nenhum. Aqui
//     o id e a CHAVE do objeto, nao um campo: e como a fusao encontra o par.
//   · obra / autor / quando — CITACAO BIBLIOGRAFICA REAL. "Telling Fortunes by
//     Tea Leaves" de Cicely Kent, Londres 1922, e um livro que existe; traduzir
//     o titulo faria a citacao apontar para um livro que nao existe, e o ANO
//     tambem nao muda. Quem resolve esses tres campos e o PT, sempre: a fusao
//     em datos/lecturas.js pega o `fonte` inteiro do original e so substitui a
//     `nota`, que e prosa da Madre.
//   · temFonte, e `naoTemFonte: null` — derivados no original, nunca digitados.
//
// ===========================================================================
// AS MESMAS TRES LINHAS DO ORIGINAL, EM ESPANHOL
// ===========================================================================
//  1. Nenhum ceu fabricado — este arquivo nao fala de lua nem de transito.
//  2. NENHUM DESFECHO PROMETIDO. Os manuais dizem que o anel e casamento e que
//     o passaro e noticia que chega; o texto ATRIBUI a leitura ao manual e
//     recusa a promessa em seguida. Traducao que prometesse seria violacao
//     NOVA, mesmo o original nao prometendo. Varrido por
//     test/madremaria-promessa-tres-idiomas.test.js, que descobre este arquivo
//     pelo disco e tira o idioma do NOME ('.es.js' = espanhol).
//  3. Nenhum empurrao para o contato: as doze perguntas sao sobre ELA.
//
// GENERO: 'esa persona' nos dois catalogos, como no PT — nada de 'él'/'ella'
// para quem esta do outro lado. E nada de adjetivo que trave o genero de quem
// le: o espanhol pede cuidado onde o portugues nao pedia ("sentada" nao entra).
// ===========================================================================

/* A datacao da PRATICA, mostrada uma vez por tela, acima das figuras. */
export const TRADICION_BORRA = {
  titulo: '¿De cuándo es esto?',
  texto:
    'Leer lo que el poso deja en la taza es práctica vieja y extendida, y llega a Europa junto con el café, en el siglo XVII. El repertorio de figuras que circula hoy es bastante más nuevo: se organizó en manuales ingleses de comienzos del siglo XX, y de ahí sale casi todo lo que se lee por ahí.',
  fonte: {
    nota: 'Es uno de los manuales que fijaron ese repertorio. Él describe figuras; él no afirma, en ningún punto, que una figura informe de lo que otra persona está pensando o haciendo.',
  },
};

export const TRADICION_MANO = {
  titulo: '¿De cuándo es esto?',
  texto:
    'Mirar las líneas de la mano es práctica antigua y aparece en lugares muy distantes entre sí. Pero el sistema que los manuales usan hoy — los nombres de las líneas, los montes, los tipos de mano — se organizó en Europa entre 1840 y 1900. Es reciente, y vale saberlo antes de leer cualquier cosa.',
  fonte: {
    nota: 'El tratado atribuido a Aristóteles que esos manuales suelen citar como origen no está entre sus obras. Y nada de esto habla del cuerpo de nadie: no sustituye un examen médico y no se usa aquí para decir nada sobre la salud.',
  },
};

/* =================================================================================
 * AS OITO FIGURAS DA BORRA, por id. A ORDEM de tela continua saindo do PT: aqui
 * e um mapa, nao uma lista, justamente para ninguem reordenar a tela por engano
 * ao traduzir.
 * ================================================================================= */
export const FIGURAS_BORRA = {
  anel: {
    nome: 'Un anillo',
    comoE: 'Una vuelta cerrada, o casi cerrada, en cualquier parte de la taza.',
    leitura:
      'En los manuales el anillo es la figura de lo que se cierra: una línea que da la vuelta entera y toca su propio comienzo. Ellos leen eso como matrimonio. Aquí no anuncia nada sobre nadie: es una forma cerrada, y fue ella la que te tiró del ojo hoy.',
    pergunta:
      '¿Qué cosa de tu última semana ya dio la vuelta entera y volvió al punto de partida?',
    fonte: {
      nota: 'El anillo está en el repertorio inglés que los manuales de comienzos del siglo XX organizaron. Kent lo lee como matrimonio; esta lectura no hace eso, y ninguna figura de aquí afirma cosa alguna sobre otra persona.',
    },
  },

  passaro: {
    nome: 'Un pájaro',
    comoE: 'Un cuerpo pequeño con dos líneas abriéndose a los lados, como alas.',
    leitura:
      'El pájaro es una de las figuras más repetidas del repertorio, y los manuales lo leen como noticia que llega de lejos. Lo que se puede decir sin inventar es lo que la forma es: una cosa pequeña, de alas abiertas, quieta en medio del poso. Ninguna noticia está escrita en una taza.',
    pergunta: '¿Qué asunto tuyo quedó parado esperando algo que no está en tu mano?',
    fonte: {
      nota: 'La lectura de noticia es del manual, no de esta app. Se cita aquí como lo que la tradición registra: citar lo que la tradición dice no es afirmar que aquello ocurra.',
    },
  },

  caminho: {
    nome: 'Un camino',
    comoE: 'Una línea larga, recta u ondulada, atravesando el poso.',
    leitura:
      'Las líneas largas son, en los manuales, figura de viaje: cuanto más recta, más directo el recorrido; cuanto más ondulada, más desvío. Es descripción de forma, y es solo eso lo que entrega. Dónde empieza esa línea y dónde termina son cosas que solo tú sabes mirar.',
    pergunta: 'Si esa línea fuera tu último mes, ¿en qué punto de ella estás ahora?',
    fonte: {
      nota: 'Las líneas como recorrido es de las partes más estables del repertorio inglés. El manual describe el trazo; no marca fecha ni destino, y este texto tampoco.',
    },
  },

  ponte: {
    nome: 'Un puente',
    comoE: 'Dos orillas y un trazo corto uniendo las dos.',
    leitura:
      'El puente está en las listas inglesas de figuras, leído como paso de un lado al otro. Lo que muestra es la estructura: existen dos orillas, y existe algo corto en medio. El puente no dice quién cruza, ni en qué día.',
    pergunta:
      '¿Cuáles son las dos orillas de tu asunto de hoy: la de donde saliste y la que estás mirando?',
    fonte: {
      nota: 'El puente aparece en el repertorio como paso. El manual no nombra quién pasa ni cuándo, y donde él se calla, este texto se calla con él.',
    },
  },

  escada: {
    nome: 'Una escalera',
    comoE: 'Dos líneas paralelas con trazos cortos atravesando entre ellas.',
    leitura:
      'La escalera está en el repertorio de los manuales, leída como subida por etapas. La forma es literal: peldaños, uno encima del otro, ninguno saltado. Describe el modo de subir, no la altura de llegada, que ningún poso conoce.',
    pergunta: '¿Cuál es el peldaño que tienes justo delante: el siguiente, no el último?',
    fonte: {
      nota: 'La escalera es del repertorio inglés. El manual habla de etapas; no promete la cima, y la pregunta de aquí pide a propósito el peldaño siguiente.',
    },
  },

  no: {
    nome: 'Un nudo',
    comoE: 'Un punto donde dos o más líneas se cruzan y el dibujo engorda.',
    leitura:
      'El nudo no viene de los manuales: es la figura de la propia casa. En un poso aparece como engrosamiento, un trozo más oscuro donde los trazos se juntan y dejan de correr. Es el mismo dibujo que da nombre a tu hilo aquí dentro.',
    pergunta: '¿Cuál es el asunto que, cuando llegas a él, hace que el resto se pare?',
    naoTemFonte:
      'El nudo no se localizó en las listas de figuras de poso: es la figura de esta app, no de la tradición. Entra aquí como forma, y por eso no tiene obra ni autor que citar — inventar uno sería peor que no tener ninguno.',
  },

  muro: {
    nome: 'Un muro',
    comoE: 'Una franja oscura continua, sin abertura, cortando la taza.',
    leitura:
      'El muro no está en las listas antiguas. Entró aquí porque es lo que mucha gente ve primero en un poso cerrado: una franja sin paso. Es una forma que interrumpe, y fijarte en ella ya dice algo sobre dónde fue a parar tu ojo hoy.',
    pergunta: '¿Qué estás tratando hoy como infranqueable, y con qué regla lo mediste?',
    naoTemFonte:
      'El muro no se localizó en los manuales de poso consultados. Es figura contemporánea, y está declarada como tal en vez de quedarse prestada una obra que no habla de ella.',
  },

  ponto: {
    nome: 'Un punto solo',
    comoE: 'Una marca única, separada, lejos del resto del dibujo.',
    leitura:
      'Los puntos existen en los manuales de poso, pero con otro asunto: se leen como dinero. Esta app no usa esa lectura. Aquí el punto es lo que parece: una marca sola, que quedó fuera del resto del dibujo y aun así está ahí.',
    pergunta: '¿Qué en tu vida quedó de ese modo: separado del resto, y aun así ahí?',
    naoTemFonte:
      'El punto aparece en los manuales ingleses con otro sentido (dinero), así que esta lectura no se apoya en ellos. Es contemporánea, y prestar la obra antigua para hablar de otra cosa sería usarla de adorno.',
  },
};

/* =================================================================================
 * AS QUATRO LINHAS DA MAO, por id.
 *
 * `comoE` aqui e literalmente anatomico, como no PT — "debajo de la base de los
 * dedos", "rodea la base del pulgar" — porque descrever posicao e o unico jeito
 * de ela achar a linha certa sem o app olhar a mao dela.
 * ================================================================================= */
export const LINEAS_MANO = {
  corazon: {
    nome: 'La línea del corazón',
    comoE:
      'La más alta de las tres grandes: corre en horizontal, justo debajo de la base de los dedos.',
    leitura:
      'Los manuales europeos del siglo XIX bautizaron esa línea como "del corazón" y leyeron en ella el registro de la vida afectiva. Lo que se puede comprobar mirando es la forma: dónde nace, si corre entera o se parte en medio, y dónde termina. El nombre es del manual; el dibujo es tuyo, y ya estaba ahí antes de cualquier lectura.',
    pergunta:
      'Recórrela hasta el final con el dedo. ¿En qué punto cambia, y qué estabas recordando cuando llegaste a ese punto?',
    fonte: {
      nota: 'El nombre y la lectura afectiva de esta línea vienen de la sistematización europea del siglo XIX. Nada aquí afirma lo que otra persona siente, y nada aquí habla de tu cuerpo.',
    },
  },

  cabeza: {
    nome: 'La línea de la cabeza',
    comoE:
      'La del medio: sale cerca del índice y atraviesa la palma en horizontal, debajo de la del corazón.',
    leitura:
      'Los manuales leen en esta línea el modo de pensar: recta sería el modo práctico, curvada hacia abajo sería el modo imaginativo. La parte verificable es solo el trazo: cuánto atraviesa, si cae al final, si toca la línea de la vida al principio. La regla es del manual, y es de 1900.',
    pergunta:
      '¿Es recta o cae al final? Describe el trazo en una frase, sin sacar ninguna conclusión sobre ti.',
    fonte: {
      nota: 'Benham montó el sistema más detallado de la escuela europea y lo llamó científico; no lo es. Es un esquema de clasificación de formas — útil para mirar, sin valor de prueba sobre nadie.',
    },
  },

  vida: {
    nome: 'La línea de la vida',
    comoE: 'El arco que rodea la base del pulgar, del medio de la palma hasta la muñeca.',
    leitura:
      'Es la línea donde los manuales más se equivocan: varios la leen como medida de cuánto tiempo vive alguien. Eso no tiene ningún apoyo, y esta app no lo repite. Lo que se puede mirar es el arco: cuánto se abre hacia el centro de la palma y por dónde pasa. Es un dibujo, y un dibujo no es pronóstico de nada.',
    pergunta:
      '¿Su arco es ancho o cerrado? Dilo en una frase, y párate ahí: la frase no necesita conclusión.',
    fonte: {
      nota: 'La lectura de tiempo de vida circula desde los manuales del siglo XIX y aquí se rechaza a la cara. Ninguna línea de la mano informa del cuerpo de nadie, y nada de esto sustituye un examen médico.',
    },
  },

  destino: {
    nome: 'La línea del destino',
    comoE:
      'La vertical que sube por el medio de la palma en dirección al dedo del medio. Muchas manos no tienen ninguna.',
    leitura:
      'Los manuales del siglo XIX llaman a esta la línea del destino y leen en ella trabajo y lugar. La información más interesante es otra, y es de los propios manuales: esa línea falta en muchas manos, y su falta no significa nada malo en ningún manual. Si no encuentras una, eso también es el dibujo de tu mano.',
    pergunta:
      '¿Encontraste una? Si sí, de dónde sale. Si no, qué viste en el lugar donde estaría.',
    fonte: {
      nota: 'La ausencia de esta línea la registran los propios manuales como común y sin peso. Entra aquí por eso: es el ítem del catálogo que desarma la lectura en vez de reforzarla.',
    },
  },
};

export default { TRADICION_BORRA, TRADICION_MANO, FIGURAS_BORRA, LINEAS_MANO };
