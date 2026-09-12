// datos/ritual.es.js
// ESPANHOL do RITUAL DE SETE DIAS de datos/ritual.js — o pacto, os sete dias, as
// duas molduras do espelho e os rotulos dos nos. Arquivo VIZINHO, como
// datos/textos.es.js.
//
// ATENCAO AO NOME: este NAO e datos/rituais.es.js (plural), que sao os cinco
// gestos que giram. Aqui ha comeco, meio e FIM marcado no dia 7: tem pacto, tem
// progresso gravado no disco ('ritual'), e acaba.
//
// ===========================================================================
// O QUE ESTE ARQUIVO TRAZ, E O QUE ELE NAO TRAZ
// ===========================================================================
// TRAZ texto visivel: titulo, abertura, pregunta, placeholder, gesto{titulo,
// cuerpo}, cierre; o PACTO inteiro; as duas frases do CIERRE; os rotulos dos
// NUDOS.
//
// NAO TRAZ, e nao pode trazer:
//   · dia — o numero e DADO e e o que lib/ritual.js usa para contar. Aqui o dia
//     e a CHAVE do objeto DIAS: e assim que a fusao acha o par.
//   · espeja — id de uma pergunta de datos/preguntas.js. Chave tecnica: id
//     trocado = espelho apontando para pergunta que nao existe, em silencio.
//   · lectura e gesto.texto — ALIASES DERIVADOS no original. Digitar aqui seria
//     criar o segundo campo que um dia discorda do primeiro, e a discordancia
//     sairia na tela como o app dizendo duas coisas no mesmo dia.
//   · id e marco dos NUDOS — o marco e o FATO CONTAVEL (1, 3, 5, 7 noites) e o
//     id e o que lib/ritual.js compara.
//   · {fecha} em CIERRE.conEspejo — marcador de interpolacao: sobrevive IDENTICO.
//     Traduzir o nome do marcador quebraria a interpolacao em silencio.
//
// ===========================================================================
// AS CINCO LINHAS DO ORIGINAL, EM ESPANHOL
// ===========================================================================
//  1. Nenhum texto promete desfecho nem fala do futuro de quem esta do outro
//     lado. E em espanhol o risco e maior que em portugues, porque a morfologia
//     de futuro ('-rá', '-rán') e a mesma que os portoes antigos mordem: bastava
//     um "volverá" para o app virar o funil que ele recusa ser.
//  2. Nenhum gesto empurra para fora — procurar, escrever A ALGUIEN, ligar,
//     insistir. Nos sete dias NAO existe um so gesto de contato, e o dia 3 e
//     exatamente o contrario disso: a frase que ela quer mandar cabe NESTA tela.
//  3. Nenhum texto diz que faltar um dia estraga alguma coisa. A `nota` do pacto
//     diz isso com todas as letras, e ela e a linha que o funil esconde.
//  4. Nenhum texto descreve EFEITO do gesto no corpo ou na mente. O funil diz
//     "esto te va a calmar"; aqui se descreve o gesto e ponto. Alegacao de saude
//     reprova em test/copy.test.js e reprova na ficha da loja.
//  5. O genero de quem esta do outro lado nunca se assume: 'esa persona'.
//
// ===========================================================================
// OS DOIS DIAS QUE JA FORAM ESCRITOS ERRADO — e a traducao repete o conserto
// ===========================================================================
// O original documenta duas reescritas que nenhum lint pegaria, e as duas
// atravessam a traducao:
//
//   DIA 2 — ja dissera "este es el único que se mueve cuando tiras". Nenhuma
//   palavra proibida, e mesmo assim era o app dizendo que existe um fio de duas
//   pontas entre ela e a outra pessoa e que puxar move alguma coisa. Aqui o fio
//   so tem o lado que esta NA MAO DELA, e ninguem puxa nada.
//
//   DIA 5 — ja dissera "y es ella la que cambia el día siguiente". Passava em
//   todo lint e era o app afirmando que o passo de hoje MUDA o que vem depois.
//   Quem espera uma pessoa voltar nao le isso como conselho de habito: le como o
//   efeito comecando. O que a abertura pode dizer e so o que se confere HOJE.
//
// E os NUDOS: todo rotulo e FATO CONTAVEL — noites, nada mais. Nao existe
// "Libre", nao existe "Curada", nao existe "Renacida". A armadilha ali nao e
// lexical, e GRAMATICAL: "Ya no espera" nao usa palavra proibida nenhuma e
// afirma o que ela VIROU.
// ===========================================================================

export const PACTO = {
  titulo: 'Siete días, cinco minutos al día',
  cuerpo:
    'Un gesto pequeño al día, siete días, y se acabó. No tiene hora fija y no tiene sitio fijo: cinco minutos, donde estés. El séptimo día este aparato te devuelve, con la fecha, la línea que dejes aquí hoy. Nada de esto sale de este teléfono y nada de esto llega a esa persona. Los siete días son tuyos.',
  boton: 'Me apunto a los siete días',
  nota: 'Si un día pasa en blanco, se queda esperando tal como está. Vuelves y sigues desde donde lo dejaste.',
};

/* Os sete dias, pela CHAVE `dia` (1..7). A ordem sai do PT. */
export const DIAS = {
  1: {
    titulo: 'Lo que guardas hoy',
    abertura:
      /* "esta misma línea vuelve a ti" era la traducción literal del PT y el
       * portão la reprobó con razón: "vuelve a ti" es el idioma exacto del
       * funnel, y el app no puede usarlo ni cuando el sujeto es una línea que
       * ella misma escribió. Reescrito para que el sujeto sea el APARATO y el
       * verbo sea devolver, que es lo que de verdad pasa el día 7. */
      'Este es el primero de los siete. Antes de cualquier otra cosa, deja registrado lo que pesa ahora — con tus palabras, como salga, sin arreglar la frase. El séptimo día este aparato te devuelve esta misma línea, con la fecha de hoy al lado. Nadie más que tú lee esto: se queda en este aparato.',
    pregunta: '¿Qué quedó sin decir cuando aquello se rompió?',
    placeholder: 'Como salga. Se queda en este aparato.',
    gesto: {
      titulo: 'Una línea sola',
      cuerpo: 'Deja aquí, en una línea sola, lo que está pesando en este momento. Cinco minutos bastan.',
    },
    cierre: 'Guardado con la fecha de hoy. Es esta línea la que vuelve el séptimo día.',
  },

  2: {
    titulo: 'Tu mano en el nudo',
    abertura:
      'Hoy la mirada va a un lado solo del hilo: el que está en tu mano. Es el único sobre el que se puede decir algo sin adivinar.',
    pregunta: '¿Qué parte de todo esto está de verdad en tu mano?',
    placeholder: 'Lo que dependió solo de ti hoy.',
    gesto: {
      titulo: 'Una cosa tuya',
      cuerpo: 'Elige una cosa del día de hoy que dependió solo de ti y deja anotado cuál fue.',
    },
    cierre: 'Hoy la mirada fue a un lado solo: el que está en tu mano.',
  },

  3: {
    titulo: 'Las ganas de la madrugada',
    abertura:
      'Las ganas de decir algo suelen tener horario, y cada persona tiene el suyo. Hoy el día pide una cosa sola: fijarte en cuál es el tuyo.',
    pregunta: '¿A qué hora del día suele apretarte esto?',
    placeholder: 'La frase entera, tal como vino.',
    gesto: {
      titulo: 'La frase cabe aquí',
      cuerpo:
        'Si hoy te aprietan las ganas de decir algo, caben aquí: deja la frase entera en esta pantalla, tal como vino.',
    },
    cierre: 'Las ganas tienen hora, y ahora tienen sitio. Lo que hagas con ellas sigue siendo tu elección.',
  },

  4: {
    titulo: 'Dejar de adivinar',
    abertura:
      'Buena parte del cansancio no viene de lo que pasó: viene de reconstruir de cabeza lo que ocurre del otro lado. Ninguna carta lee a esa persona, y este aparato tampoco. Lo que queda, cuando eso sale de la cuenta, es lo que se puede saber de verdad.',
    pregunta: '¿Qué sabes de verdad, y qué vienes suponiendo?',
    placeholder: 'Lo que vienes suponiendo — y lo que sabes.',
    gesto: {
      titulo: 'Lo sé o lo supongo',
      cuerpo:
        'Anota una cosa que vienes suponiendo sobre esa persona y marca al lado: esto lo sé, o esto lo supongo.',
    },
    cierre:
      'Ninguna carta lee a esa persona, y este aparato tampoco. Hoy separaste lo que sabes de lo que supones.',
  },

  5: {
    titulo: 'Una decisión pequeña hoy',
    abertura:
      'Una decisión grande no se toma en una semana difícil. Una pequeña, sí — y es la única que consigues cumplir hoy, de principio a fin, sin depender de nadie más.',
    pregunta: '¿Cuál fue la decisión más pequeña que tomaste hoy por tu cuenta?',
    placeholder: 'La decisión, y lo que pasó después de cumplirla.',
    gesto: {
      titulo: 'Del tamaño de hoy',
      cuerpo:
        'Elige una decisión minúscula para hoy, del tamaño de cinco minutos, y deja anotado cuál fue después de cumplirla.',
    },
    cierre: 'Fue pequeña y fue tuya. Es el tamaño que cabe en una semana difícil.',
  },

  6: {
    titulo: 'El tamaño de tu parte',
    abertura:
      'Tu parte no es la historia entera, y tampoco es nada. Tiene un tamaño, y se puede decir cuál es sin aumentarlo y sin rebajarlo.',
    pregunta: '¿Cuál fue tu parte, dicha sin exagerar para ninguno de los dos lados?',
    placeholder: 'Empieza por "mi parte fue".',
    gesto: {
      titulo: 'Mi parte fue',
      cuerpo: 'Deja aquí una frase que empiece por "mi parte fue".',
    },
    cierre: 'Ni la historia entera, ni nada. Hoy quedó del tamaño que tiene.',
  },

  7: {
    titulo: 'El séptimo día',
    abertura:
      'Siete días, siete registros tuyos. Hoy el aparato devuelve la línea del primer día exactamente como la dejaste, con la fecha. No es un diagnóstico y no mide nada: es lo que quedó guardado durante siete días, entregado de vuelta.',
    pregunta: '¿Qué ves ahora en esa línea del primer día?',
    placeholder: 'La línea de hoy, con la fecha.',
    gesto: {
      titulo: 'Lee y deja la línea de hoy',
      cuerpo: 'Lee la línea del primer día y deja debajo una línea nueva, con la fecha de hoy.',
    },
    cierre: 'Siete días, siete registros tuyos, con fecha. Se quedan aquí, y puedes releerlos cuando quieras.',
  },
};

/* AS DUAS MOLDURAS DO DIA 7. O {fecha} sobrevive identico: quem chama t() passa
 * por esse nome, e o espanhol pede a data no mesmo lugar que o portugues. A tela
 * poe a citacao dela LOGO ABAIXO, verbatim — o texto nao adjetiva o que ela
 * escreveu e nao compara com hoje. */
export const CIERRE = {
  conEspejo: 'El {fecha}, en el primer día, dejaste esto aquí:',
  sinEspejo:
    'El primer día no dejaste ninguna línea escrita. Los siete días cuentan igual: lo que quedó registrado fueron las fechas, y están aquí abajo.',
};

/* OS ROTULOS DOS NOS. Fato contavel: noites, nada mais. */
export const NUDOS = {
  unaNoche: 'Una noche',
  tresNoches: 'Tres noches',
  cincoNoches: 'Cinco noches',
  sieteNoches: 'Las siete noches',
};

export default { PACTO, DIAS, CIERRE, NUDOS };
