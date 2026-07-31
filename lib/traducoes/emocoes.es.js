// lib/traducoes/emocoes.es.js
// PACK EM ESPANHOL (neutro latino-americano) para lib/emocoes.js — mesma forma
// do pack pt derivado (packDeTextos), chave por chave. O motor continua
// canônico em PT; este arquivo carrega SÓ o texto que a pessoa lê.
//
// AS REGRAS DESTE ARQUIVO (as mesmas de lib/emocoes.js, primas em espanhol):
//   (1) A `fala` é DESABAFO, não formulário: "Tô ansiosa com o futuro" vira
//       "Me tiene inquieta lo que viene" — como a pessoa falaria com uma
//       amiga, nunca "estoy ansiosa por el futuro" de robô. A pessoa PODE se
//       descrever; a resposta do app é que não pode tratar.
//   (2) A ponte é de ASSUNTO, nunca de efeito: descreve o que a leitura
//       cobre, jamais o que faz com a pessoa. Por isso "ayudar" não entra —
//       "esto te ayuda" é exatamente a ponte de tratamento que a tela não faz.
//   (3) Linha vermelha em espanhol: nada de aliviar/calmar/sanar/curar/
//       tratar/energizar, nada de promessa (atraer/garantizar/manifestar/
//       proteger/alejar), nada de mecanismo (energía/vibración/aura).
//       "sueño" no SINGULAR também não entra (é a palavra de dormir) — a
//       feature de sonhos fala em "sueños" e "lo que soñaste".
//       test/emocoesIdiomas.test.js varre este arquivo inteiro e morde.
//   (4) Sofrimento pesado continua fora: duelo, desesperación, pánico e
//       parentes não viram chip em nenhum idioma.
//   (5) Nenhuma afirmação histórica: sem autor, obra, século ou ano — a fonte
//       mora DENTRO da feature, a porta só aponta. Igual ao PT.
//   (6) Terminologia herdada de lib/i18n.js (es): Asentar, Camino Guiado,
//       Diario Cósmico, Calendario Cósmico, Rituales (estantes Amor/Limpieza/
//       Prosperidad), Tarot, Compatibilidad, Sueños.
//
// CONTRATO DE FORMA (cobrado por test/emocoesIdiomas.test.js): `tela` com as
// quatro frases do chrome; `estados` com os MESMOS ids de ESTADOS, cada um com
// `fala` e `pontes` (array de STRINGS, na mesma ordem das pontes PT — o
// destino fica no motor); `destinos` com os MESMOS ids de DESTINOS, cada um
// com `rotulo` e `botao`.
export default {
  tela: {
    titulo: '¿Cómo estás?',
    subtitulo: 'Dilo a tu manera',
    intro: 'Toca lo que más se parezca a ti ahora. Cada estado apunta a la lectura que cubre ese asunto.',
    overlinePontes: 'Dónde vive ese asunto en la app',
  },

  estados: {
    ansiosaComOFuturo: {
      fala: 'Me tiene inquieta lo que viene',
      pontes: [
        'La tirada de tres cartas tiene una casa solo para lo que viene: el Futuro, leído como dirección — hacia dónde apunta el asunto si nada cambia. Es exactamente esa pregunta la que la casa cubre.',
        'El horóscopo de hoy describe el cielo de tu día, para tu signo — el día que viene es exactamente el asunto que cubre.',
      ],
    },
    brigueiComQuemAmo: {
      fala: 'Me peleé con alguien que amo',
      pontes: [
        'La lectura de compatibilidad le pone nombre a la relación entre los dos signos — incluidas las combinaciones difíciles, que llama por su nombre en vez de maquillarlas con una nota alta.',
        'El diario es la página sin público: tu versión de la pelea, escrita con fecha, para releerla cuando baje el polvo.',
      ],
    },
    semRumo: {
      fala: 'No sé qué rumbo tomar',
      pontes: [
        'La tirada de tres casas divide la pregunta en partes: de dónde viene el asunto, dónde está y hacia dónde apunta. El rumbo es exactamente lo que mira.',
        'El Camino es un sendero de siete días con un paso marcado por día — para quien quiere empezar a andar sin tener que decidir el mapa entero hoy.',
      ],
    },
    saudadeDeAlguem: {
      fala: 'Extraño mucho a alguien',
      pontes: [
        'En el estante de Amor de los Rituales hay un gesto hecho para ese asunto: la carta que no se envía — escribir lo que sientes, leerlo en voz alta y guardarlo.',
        'El diario guarda lo que extrañas, con fecha. En un mes puedes releerlo y ver en qué se convirtió.',
      ],
    },
    medoDeDecidirErrado: {
      fala: 'Miedo de tomar la decisión equivocada',
      pontes: [
        'El tarot abre la decisión en tres casas — de dónde viene, dónde está, hacia dónde apunta. Es lectura de la situación, y la elección queda en tus manos.',
        'En el diario puedes escribir los dos lados de la decisión, con fecha — y volver después a revisar lo que ya habías visto.',
      ],
    },
    querendoRecomecar: {
      fala: 'Con ganas de empezar de nuevo',
      pontes: [
        'El Camino empieza desde el día uno a propósito: siete días, un paso por día, progreso marcado en la pantalla. Un nuevo comienzo con riel.',
        'El estante de Limpieza de los Rituales es todo de cierre — vaciar, soltar, cerrar lo que quedó abierto, con tu propia mano.',
      ],
    },
    cabecaCheia: {
      fala: 'La cabeza a mil, pensamientos que no paran',
      pontes: [
        'Asentar es respiración contada: cuatro tiempos, comienzo y final marcados en el reloj. La pantalla solo lleva el ritmo — el resto es tuyo.',
        'El diario acepta la lista entera, tal como está — vaciarla en el papel es un gesto, y la página la guarda con fecha.',
      ],
    },
    sonhoQueNaoLargou: {
      fala: 'Soñé algo raro y no me lo saco de la cabeza',
      pontes: [
        'La lectura de sueños parte de la imagen que quedó: cuentas lo que soñaste y la lectura recorre lo que esa imagen carga en la tradición.',
      ],
    },
    divididaEntreDuasPessoas: {
      fala: 'Dividida entre dos personas',
      pontes: [
        'La compatibilidad lee una pareja a la vez — puedes correr los dos pares y comparar la relación que sale nombrada en cada uno.',
        'En el tarot, el tema de Amor lee las cartas desde la pregunta del vínculo — el deseo, lo que todavía no se vuelve palabra, lo que hace falta decir.',
      ],
    },
    granaApertada: {
      fala: 'El dinero no alcanza este mes',
      pontes: [
        'El tarot tiene un tema solo de dinero: las mismas cartas, leídas con el número mirado de frente, sin la historia alrededor.',
        'El estante de Prosperidad de los Rituales empieza con las cuentas sobre la mesa, literalmente — papel, bolígrafo y el tamaño real de lo que hay.',
      ],
    },
    conheciAlguem: {
      fala: 'Conocí a alguien y ya me estoy ilusionando',
      pontes: [
        'La lectura de compatibilidad toma los dos signos y dice qué relación existe entre ellos — relación con nombre, no un porcentaje suelto.',
        'El tema de Amor del tarot recibe exactamente ese tipo de pregunta — el vínculo que está naciendo, leído carta por carta.',
      ],
    },
    diaGrandeAmanha: {
      fala: 'Mañana es un día importante para mí',
      pontes: [
        'El Calendario Cósmico muestra lo que el cielo tiene marcado para la fecha: fase exacta de la Luna, ingreso del Sol, retrógrado — todo calculado, nada tabulado.',
        'El horóscopo del día lee el cielo de hoy para tu signo — el retrato del cielo en la víspera de tu día importante.',
      ],
    },
  },

  destinos: {
    taro: { rotulo: 'Tarot', botao: 'Abrir el Tarot' },
    horoscopo: { rotulo: 'Horóscopo del día', botao: 'Ver el horóscopo de hoy' },
    compatibilidade: { rotulo: 'Compatibilidad', botao: 'Abrir Compatibilidad' },
    sonhos: { rotulo: 'Lectura de sueños', botao: 'Contar lo que soñaste' },
    diario: { rotulo: 'Diario Cósmico', botao: 'Escribir en el Diario' },
    aterramento: { rotulo: 'Asentar', botao: 'Abrir Asentar' },
    rituais: { rotulo: 'Rituales', botao: 'Ver los Rituales' },
    jornada: { rotulo: 'Camino Guiado', botao: 'Empezar el Camino' },
    calendarioCosmico: { rotulo: 'Calendario Cósmico', botao: 'Abrir el Calendario Cósmico' },
  },
};
