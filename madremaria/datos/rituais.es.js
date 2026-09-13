// datos/rituais.es.js
// ESPANHOL dos rituais ROTATIVOS de datos/rituais.js — os gestos que giram e nao
// acabam. Arquivo VIZINHO, como datos/textos.es.js.
//
// ATENCAO AO NOME: este NAO e datos/ritual.es.js (singular), que e o ritual de
// SETE DIAS. Dois arquivos de nome quase igual e papeis que nao se misturam, e a
// confusao atravessa a traducao igual: aqui nao ha dia 7, nao ha pacto e nao ha
// progresso.
//
// ===========================================================================
// O QUE ESTE ARQUIVO TRAZ, E O QUE ELE NAO TRAZ
// ===========================================================================
// TRAZ texto visivel: nome, gesto, duracao, abertura, comoFazer[], fecho,
// naoTemFonte e a `nota` de dentro da fonte.
//
// NAO TRAZ, e nao pode trazer:
//   · id — chave tecnica, e aqui ele e a CHAVE do objeto: e assim que a fusao
//     acha o par. E o que lib/rituaisRotativos.js poe na ESCALA; id trocado =
//     toque morto na rotacao, sem erro nenhum.
//   · precisaCamera — O CAMPO QUE MANDA. So o cafe pede camera, e quem le isso e
//     a tela, nao o texto. Uma traducao que o apagasse mudaria a tela em
//     silencio.
//   · obra / autor / quando — CITACAO BIBLIOGRAFICA REAL. "Das Spiel der
//     Hoffnung" de Johann Kaspar Hechtel (Nuremberg, 1799), "Oneirocritica" de
//     Artemidoro, "Les Rêveries du promeneur solitaire" de Rousseau: titulos de
//     livro e nomes de autor nao se traduzem, e o ano nao muda. Vem do PT.
//   · comoFazerTexto — DERIVADO no original (os passos juntos numa string).
//     Digitar aqui seria o segundo campo que um dia discorda do primeiro.
//
// ===========================================================================
// OS PASSOS: VERBO OBSERVAVEL, E A TRADUCAO TEM DE MANTER ISSO
// ===========================================================================
// O cabecalho do original e duro nisto e a regra sobrevive em espanhol: todo
// passo e verbo de acao que se PODE CONFERIR ("gira", "mira", "escribe"). Nada
// de "siente", "conéctate", "permítete" — verbo que ninguem consegue conferir e
// verbo que a pessoa acha que fez errado.
//
// "ESCRIBE" aqui e legitimo e a distincao custou uma medida: escrever nao e
// sair. O passo pede palavra num papel que fica NESTE telefone, que e o oposto
// de mandar recado. O que continua proibido — e a rede de contato de
// lib/plano.js continua varrendo em runtime — e "escríbele A ELLA" e "escribe un
// mensaje". Nenhum passo deste arquivo manda procurar, escrever para, ligar nem
// aparecer: duas das cinco respostas da pergunta 4 do onboarding sao
// 'le-escribi-no-responde' e 'cero-contacto', e para quem respondeu qualquer uma
// delas um gesto de contato e o app empurrando a pessoa para o lugar mais
// doloroso que ela tem.
//
// ===========================================================================
// SEM ALEGACAO DE SAUDE, EM NENHUM IDIOMA
// ===========================================================================
// Nenhum destes gestos "calma", "alivia", "trata" nem "ordena la cabeza". O
// texto descreve o gesto e para. Isso reprova em test/copy-promessa-app-inteiro.test.js e reprova na
// ficha da loja — e o escorregao mais facil e justo no respiro e na caminhada.
// O `naoTemFonte` do canto diz, no PT, que "arrumar com as maos aquieta a
// cabeca": e a frase do ORIGINAL e foi mantida como esta, sem aumentar.
//
// E NENHUM DESFECHO PROMETIDO: nada sobre o que a outra pessoa vai fazer depois
// do gesto. Varrido por test/madremaria-promessa-tres-idiomas.test.js, que
// descobre este arquivo pelo disco e tira o idioma do nome ('.es.js').
//
// GESTO QUE TEVE DE MUDAR DE PAIS: nenhum. Os sete gestos pedem xicara de cafe,
// a propria mao, o celular, papel, um quarteirao e uma gaveta — tudo isso existe
// em qualquer pais hispanofalante. O unico ajuste de vocabulario e regional:
// 'poso del café' (nao 'borra'), que e o termo que a Onda 1 ja fixou na tela
// ('plano.tela.ritual.abrir.cafe' em datos/textos.es.js).
// ===========================================================================

export const RITUAIS = {
  cafe: {
    nome: 'El poso del café',
    gesto: 'Girar la taza vacía sobre el platillo y mirar el dibujo que dejó el poso.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día es del poso. Te tomas el café hasta el final, giras la taza y miras lo que quedó dibujado ahí. Nadie aquí va a decirte qué es la figura: la que elige la palabra eres tú.',
    comoFazer: [
      'Tómate el café hasta que quede solo el poso en el fondo.',
      'Gira la taza boca abajo sobre el platillo y cuenta hasta diez.',
      'Dale la vuelta y mira el dibujo unos segundos, sin buscar nada concreto.',
      'Fotografía la taza.',
      /* NO "escríbela": el enclítico cae en PATRONES_CONTACTO (bloque 20 de
       * lib/lectura.js), y con razón — en español "escríbela" también se lee
       * "escríbele a ella", y la red de lib/plano.js borraría este paso para
       * quien está en contacto duro. El objeto va explícito, que además es copy
       * más clara. */
      'Elige UNA palabra para lo que viste y escribe esa palabra debajo de la foto.',
    ],
    fecho:
      'Quedaron una foto y una palabra, con la fecha de hoy. La palabra es tuya: nada aquí la corrigió.',
    fonte: {
      nota: 'Leer lo que el poso deja en la taza es práctica antigua y extendida, pero el repertorio de figuras que circula hoy se organizó en manuales ingleses de comienzos del siglo XX. El manual describe figuras; él no afirma que informen sobre otra persona.',
    },
  },

  mao: {
    nome: 'La línea de la propia mano',
    gesto: 'Abrir la propia palma bajo una luz y seguir una línea con el dedo, de principio a fin.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día es de tu mano. Abres la palma, eliges una línea y la recorres con el dedo hasta donde el trazo termina. Es un dibujo que te acompaña todo el día y que casi nunca miras.',
    comoFazer: [
      'Abre la mano que usas menos, bajo una luz directa.',
      'Elige UNA línea, la que te tire del ojo primero.',
      'Recórrela con el dedo de la otra mano, despacio, desde el principio hasta donde se pierde.',
      'Fíjate dónde es honda, dónde se parte y dónde otra línea la cruza.',
      'Escribe una frase sobre lo que viste en el dibujo — no sobre lo que significa.',
    ],
    fecho: 'Miraste tu propia mano durante cinco minutos y dejaste una frase escrita sobre ella.',
    fonte: {
      nota: 'El sistema de montes, tipos de mano y nombres de las líneas que los manuales usan hoy se organizó en la Europa del siglo XIX. El tratado atribuido a Aristóteles que esos manuales suelen citar no está entre sus obras. Nada de esto sustituye un examen médico, y este ritual no afirma nada sobre el cuerpo de nadie.',
    },
  },

  cartas: {
    nome: 'Las tres de siempre',
    gesto: 'Volver a abrir tu lectura y escuchar una de las tres hasta el final.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día es de tus tres cartas — las mismas que te trajeron hasta aquí. Ellas no cambian. Quien cambia, de luna en luna, es quien lee.',
    comoFazer: [
      'Vuelve a abrir tu lectura.',
      'Relee las tres en orden, sin prisa.',
      'Elige la que más te mueva hoy — puede no ser la misma que la última vez.',
      'Escucha su audio hasta el final, sin hacer otra cosa mientras escuchas.',
    ],
    fecho: 'La lectura es la misma. Lo que cambia es el oído — y es eso lo que mide este gesto.',
    fonte: {
      nota: 'El juego de 36 cartas de donde salieron las tres de esta lectura. Pasó a llamarse "baraja Lenormand" solo en 1846, dos años después de la muerte de Marie Anne Lenormand — su nombre se tomó prestado sin permiso, y por eso la fuente aquí es el juego original, no la leyenda.',
    },
  },

  sonho: {
    nome: 'Lo que dejó la noche',
    gesto: 'Escribir lo que dejó la noche — el sueño, o la forma de despertar.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día es de la noche que pasó. ¿Vino sueño? Vale el trozo suelto, la escena sin pies ni cabeza. ¿No vino? También sirve — cómo despertaste es recado del mismo sitio.',
    comoFazer: [
      'Si vino sueño, escribe lo que quedó, en el orden desordenado en que venga.',
      'Si no vino, escribe cómo despertaste: el cuerpo, el humor, lo primero que pensaste.',
      'Apunta quién aparecía — en el sueño, o en el primer pensamiento.',
      'Subraya la imagen más fuerte de lo que escribiste.',
      'Escribe lo que TÚ crees que es. La app no te va a dar ningún significado.',
    ],
    fecho: 'Lo que dejó la noche está escrito con la fecha. De aquí a un mes seguirá estando aquí.',
    fonte: {
      nota: 'Es el tratado de sueños más completo que llegó de la antigüedad — y pasa cinco libros insistiendo en que el mismo sueño quiere decir cosas distintas según quién lo soñó. Por eso aquí no existe diccionario de símbolos: el registro es tuyo y la lectura de él también.',
    },
  },

  caminhada: {
    nome: 'La caminata de fijarse',
    gesto: 'Salir a pie, cinco minutos, y volver con UNA cosa nunca vista.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día es de la calle. No es ejercicio: es salir de la órbita del teléfono y volver con un detalle que siempre estuvo ahí y nunca habías visto.',
    comoFazer: [
      'Sal a pie, sin auriculares y sin rumbo marcado — la manzana basta.',
      'Camina mirando hacia arriba y a los lados, no al suelo.',
      'Elige UNA cosa en la que nunca te habías fijado: una ventana, un árbol, un sonido.',
      'Vuelve y escribe esa cosa en una línea, en la pregunta de hoy.',
    ],
    fecho:
      'La calle era la misma ayer. Lo que cambió fue el ojo — y un ojo entrenado en fijarse ve lo que la rutina esconde.',
    fonte: {
      nota: 'El libro que hizo de la caminata sin rumbo un método para escucharse: Rousseau salía a pie para poner la cabeza en orden y anotaba, al volver, lo que el camino le había mostrado.',
    },
  },

  canto: {
    nome: 'Un rincón en orden',
    gesto: 'Elegir un rincón pequeño y dejarlo en orden, con las manos.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día es de ordenar UN rincón — el cajón, la mesita, el bolso. Uno solo, pequeño a propósito: lo que quepa en cinco minutos.',
    comoFazer: [
      'Elige el rincón antes de empezar, y no lo cambies a mitad.',
      'Sácalo todo de ahí, sin juzgar nada.',
      'Devuelve solo lo que se queda; el resto tiene dos destinos: la basura, u otro sitio.',
      'Mira el rincón terminado diez segundos, sin tocar nada más.',
    ],
    fecho:
      'Nadie ordena la vida entera en un día. Un rincón por vez es como se hace cualquier cosa grande.',
    naoTemFonte:
      'Este gesto no tiene ningún tratado antiguo detrás, y preferimos decirlo a inventar uno. Está aquí porque ordenar con las manos aquieta la cabeza — y un rincón en orden es un trozo del día bajo tu mando.',
  },

  respiro: {
    nome: 'Cinco minutos quieta',
    gesto: 'Sentarse, girar el teléfono boca abajo y contar las respiraciones hasta llegar a veinte.',
    duracao: '5 minutos',
    abertura:
      'Hoy el día no pide ningún material: ni taza, ni baraja, ni cuaderno. Solo cinco minutos en los que la única tarea es contar hasta veinte.',
    comoFazer: [
      'Siéntate donde estés y apoya los dos pies en el suelo.',
      'Gira el teléfono con la pantalla boca abajo.',
      'Cuenta veinte respiraciones enteras, una a una.',
      'Si pierdes la cuenta, empieza otra vez por el uno — perder la cuenta es parte del gesto.',
      'Gira el teléfono de nuevo y marca el día.',
    ],
    fecho: 'Cinco minutos en los que no hiciste nada más. El día de hoy está marcado.',
    naoTemFonte:
      'Contar respiraciones sentada: práctica contemporánea, sin fuente antigua localizada. Existen tradiciones que cuentan la respiración desde hace mucho tiempo, pero ninguna de ellas describe este gesto así, con este número y en esta duración — así que no hay obra que citar, e inventar una sería peor que no tener ninguna.',
  },
};

export default RITUAIS;
