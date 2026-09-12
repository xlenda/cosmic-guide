// datos/lenormand.es.js
// EL ESPAÑOL del Baralho Cigano (Lenormand) — las 36 cartas.
//
// Arquivo de UM tradutor so, no mesmo molde de datos/textos.es.js: o portugues
// fica em datos/lenormand.js (intocado), o ingles em datos/lenormand.en.js.
// Tres arquivos disjuntos, zero conflito de merge.
//
// ===========================================================================
// O QUE ESTA AQUI, E O QUE NAO ESTA
// ===========================================================================
// TRADUZIDO — os quatro campos que a pessoa LE na tela:
//   nome     o nome canonico da carta no baralho espanhol (El Jinete, El Trebol…)
//   escena   a descricao da imagem
//   leitura  o que a carta diz
//   convite  o gesto que fica com quem le
//   avisoDeAudio  (so a carta 01 tem) — nota interna, nao vai para a tela
//
// NAO TRADUZIDO, e nao e esquecimento:
//   id      'lenormand-01' e endereco de dado e de arte
//           (assets/madremaria/lenormand/<id>.jpg). Mudar = arte orfa, sem erro.
//   numero  numero, nao palavra.
//   naipe   Copas / Ouros / Paus / Espadas — ver a nota no fim deste arquivo.
//   claves  palavras-chave. O portao de doutrina as trata como campo tecnico
//           (CAMPOS_FORA em test/madremaria-promessa-tres-idiomas.test.js) e
//           nenhuma tela as desenha hoje. Ficam no PT com o resto do dado.
//   audio   nome de arquivo .m4a, resolvido por require ESTATICO pelo Metro.
//
// ===========================================================================
// O NOME DA CARTA: POR QUE ELE MUDA AQUI
// ===========================================================================
// O cabecalho do PT diz que trocar o nome "seria inventar um baralho
// diferente". Vale, e e por isso que aqui nao ha invencao nenhuma: o Lenormand
// circula em espanhol com nomes canonicos proprios desde o seculo XIX, e sao
// esses que entram — El Jinete, El Trebol, El Barco, La Casa, El Arbol, Las
// Nubes, La Serpiente, El Ataud, El Ramo, La Guadana, El Latigo, Los Pajaros,
// El Nino, La Zorra, El Oso, Las Estrellas, La Ciguena, El Perro, La Torre, El
// Jardin, La Montana, Los Caminos, Los Ratones, El Corazon, El Anillo, El
// Libro, La Carta, El Hombre, La Mujer, El Lirio, El Sol, La Luna, La Llave,
// Los Peces, El Ancla, La Cruz.
//
// Isto e o oposto de traduzir um TITULO DE OBRA (esses ficam intactos, ver
// `fuente`/`obra` em outros arquivos): o nome da carta nao aponta para fora do
// app, ele E a carta. Deixar "O Cavaleiro" em portugues na tela espanhola faria
// a voz e a tela falarem linguas diferentes sem nenhum ganho de fidelidade.
//
// ===========================================================================
// AS TRES CARTAS COM VOZ GRAVADA — O DESENCONTRO DECLARADO
// ===========================================================================
// O Coracao (24), As Nuvens (06) e O Cavaleiro (01) tem audio na voz do dono,
// EM PORTUGUES. Nao existe audio espanhol destas cartas, e este arquivo nao
// finge que existe: a tela desenha o texto espanhol e o botao de ouvir continua
// tocando o .m4a portugues, porque `audio` nao e traduzido em lugar nenhum.
// Enquanto as faixas nao forem regravadas em espanhol, quem abre o app em
// espanhol LE em espanhol e OUVE em portugues. Isso esta anotado aqui para
// ninguem descobrir por acidente — e o mesmo tipo de desencontro que o PT ja
// declara para o `avisoDeAudio` do Cavaleiro.
//
// ===========================================================================
// ENCANTAMENTO HONESTO — VALE EM ESPANHOL TAMBEM
// ===========================================================================
// A doutrina esta em madremaria/theme.js:80: "nunca um desfecho, nunca uma
// promessa sobre o que a outra pessoa vai fazer". Uma traducao que promete e
// violacao NOVA, ainda que o original nao prometa — e o espanhol de nicho
// amoroso tem formula feita para isso. Nenhuma destas entra aqui: "volvera",
// "va a volver", "regresara", "te va a escribir", "recuperaras", "en X dias",
// "garantizado", "el destino lo traera".
//
// Toda `leitura` descreve o que a carta MOSTRA; todo `convite` fecha num gesto
// de QUEM ESTA LENDO. Nenhum dos 36 convites manda procurar, escrever ou
// aparecer para a outra pessoa — a guarda de lib/lectura.js
// (PATRONES_CONTACTO) ja cobre portugues e espanhol, e os 36 convites passam
// por ela limpos. MEDIDO, nao presumido: rodei sugiereContacto() sobre os 36
// convites nos tres idiomas, e o resultado e 0/36 nos tres.
//
// UMA ARMADILHA QUE ESSA MEDICAO PEGOU, e vale para quem traduzir a proxima
// carta: a guarda espanhola tem /habla(?!\s+(de|del|sobre|contigo))/ —
// "habla" e contato, a nao ser que venha seguido de 'de', 'del', 'sobre' ou
// 'contigo'. A carta 28 saiu primeiro como "Antes de decidir de quien habla
// esta carta": 'habla' seguido de 'esta', e a guarda acusava. O PT ("de quem
// essa carta fala") e imune porque o verbo fica no fim. Para quem esta em
// contato duro, isso significava perder o convite inteiro e receber a
// alternativa generica — em silencio, sem erro nenhum. Reescrito para "si esta
// carta habla de ti o de la otra persona": mesmo sentido, 'habla' seguido de
// 'de', guarda satisfeita. Ordem de palavra aqui nao e estilo: e o que decide
// se a usuaria recebe a carta inteira.
//
// GENERO: o PT fala com a pessoa no feminino em cinco convites ("sozinha",
// "a usuaria"). Em espanhol esses ficam NEUTROS — a frase foi reescrita para
// nao travar genero onde o app fala com qualquer pessoa. Exemplo: "o que voce
// esta preenchendo sozinha" -> "lo que estas completando por tu cuenta".
// O genero de QUEM ESTA DO OUTRO LADO nunca e assumido: "esa persona".
//
// TRATAMENTO: tu, como datos/textos.es.js e datos/cartas.es.json ja fixaram.
// Nunca "usted", nunca apelido.

/** As 36, por id. Campo ausente aqui cai no portugues de datos/lenormand.js. */
export const LENORMAND_ES = {
  'lenormand-01': {
    nome: 'El Jinete',
    escena: 'el jinete al galope, ya en movimiento cuando la carta se da vuelta',
    leitura:
      'El Jinete es una carta de movimiento: habilidad, fuerza, energía y velocidad. Habla de iniciativa — de lo que ya está andando y de lo que depende de que alguien dé el paso.',
    convite:
      'Elige algo tuyo que está detenido esperando la decisión de otra persona, y da ahí el paso que depende solo de ti.',
    avisoDeAudio:
      'El audio grabado termina en "algo irá vir em sua direção e você precisa estar preparado". Es predicción de futuro, y la app no la hace. El texto escrito guarda la fuerza de la carta sin la predicción. Regrabar esa frase resuelve el desencuentro. Además, el audio está en portugués: no hay versión en español de esta faja todavía.',
  },

  'lenormand-02': {
    nome: 'El Trébol',
    escena: 'el trébol pequeño en medio del pasto, fácil de pasar por alto',
    leitura:
      'El Trébol habla de suerte pequeña y de corta duración: una rendija, un alivio, una coincidencia buena que no se repite sola. Es la carta del azar menudo — lo que aparece gratis y se va igual cuando nadie lo nota.',
    convite:
      'Anota la cosa buena más pequeña que te pasó hoy sin que la planearas, y lo que costaría que vuelva a pasar por tu cuenta.',
  },

  'lenormand-03': {
    nome: 'El Barco',
    escena: 'el barco con las velas abiertas, ya alejado de la orilla',
    leitura:
      'El Barco habla de distancia: viaje, alejamiento, nostalgia y lo que ocurre lejos de donde estás. Es también la carta de lo que se mueve por cuenta propia, empujado por un viento que nadie controla desde el puerto.',
    convite:
      'Nombra la distancia que más pesa hoy — de kilómetro, de tiempo o de tema — y escribe cuál de las tres está a tu alcance.',
  },

  'lenormand-04': {
    nome: 'La Casa',
    escena: 'la casa cerrada, con la puerta y el techo enteros',
    leitura:
      'La Casa habla de base: hogar, familia, pertenencia y la estructura que sostiene el resto. En una lectura de relación, señala el terreno donde la cosa pasa — qué es morada de verdad y qué es solo paso.',
    convite:
      'Mira el cuarto donde más tiempo pasas y pregúntate qué hay ahí que sea tuyo de verdad, y no heredado de una vida de dos.',
  },

  'lenormand-05': {
    nome: 'El Árbol',
    escena: 'el árbol solo en el campo, con la raíz más grande que la copa',
    leitura:
      'El Árbol habla de raíz y de tiempo largo: lo que crece despacio, lo que tiene origen antiguo y lo que no cambia de lugar por voluntad. Es la carta de la vitalidad lenta, la que mide en años lo que las otras miden en días.',
    convite:
      'Elige algo tuyo que solo mejora con repetición y haz hoy la porción más pequeña de eso.',
  },

  'lenormand-06': {
    nome: 'Las Nubes',
    escena: 'las nubes cargadas de un lado y claras del otro, cubriendo el sol',
    leitura:
      'Las Nubes hablan de falta de claridad: duda, secreto, inseguridad y conflicto. Hay algo o alguien guardando una parte de la verdad, igual que la nube esconde el brillo del sol sin apagarlo.',
    convite:
      'Separa, en el papel, lo que sabes de lo que estás completando por tu cuenta. La duda pierde tamaño cuando gana dos columnas.',
  },

  'lenormand-07': {
    nome: 'La Serpiente',
    escena: 'la serpiente enroscada, avanzando en curva y nunca en línea recta',
    leitura:
      'La Serpiente habla de desvío y de astucia: el camino que no va derecho, la complicación que se enrosca y la presencia de un interés que no es el tuyo. Es la carta de lo que se mueve despacio y sin ruido.',
    convite:
      'Señala el punto exacto donde la historia empezó a dar vueltas, y lo que aceptaste ahí para no pelear.',
  },

  'lenormand-08': {
    nome: 'El Ataúd',
    escena: 'el ataúd cerrado, atravesado delante del camino',
    leitura:
      'El Ataúd es la carta del fin: cierre, luto y lo que ya se despidió sin ceremonia. No anuncia ninguna pérdida — le pone nombre a lo que dentro de ti ya terminó y sigue ocupando lugar.',
    convite:
      'Escribe el nombre de algo que terminó y que todavía mantienes abierto, y deja el papel guardado.',
  },

  'lenormand-09': {
    nome: 'El Ramo',
    escena: 'el ramo ya cortado y arreglado, ofrecido con las dos manos',
    leitura:
      'El Ramo habla de gentileza ofrecida: belleza, agrado, cortesía y la alegría que llega arreglada. Es la carta del gesto bonito — y también de lo que es bonito por fuera sin que nadie pregunte qué lo sostiene por dentro.',
    convite:
      'Ofrece hoy una gentileza a alguien que no tiene nada que ver con esta historia, y fíjate en lo que te queda después.',
  },

  'lenormand-10': {
    nome: 'La Guadaña',
    escena: 'la guadaña con la hoja girada, detenida en lo alto del gesto',
    leitura:
      'La Guadaña habla de corte: decisión brusca, separación seca y la cosecha que solo ocurre porque algo fue segado. Es la carta del gesto rápido, que resuelve y lastima en el mismo movimiento.',
    convite:
      'Elige un corte pequeño que dependa solo de ti — un grupo, una pestaña abierta, una costumbre — y hazlo hoy.',
  },

  'lenormand-11': {
    nome: 'El Látigo',
    escena: 'el látigo de varias tiras, hecho para golpear siempre en el mismo lugar',
    leitura:
      'El Látigo habla de repetición y de roce: la misma discusión otra vez, el mismo desgaste, el mismo lugar golpeado muchas veces. Es también la carta de la disciplina — la repetición sirve para lastimar o para entrenar, y la diferencia está en quién elige el ritmo.',
    convite:
      'Identifica la frase que ya repetiste demasiado en esta historia y decide qué hacer con el aliento que te consume.',
  },

  'lenormand-12': {
    nome: 'Los Pájaros',
    escena: 'dos pájaros pequeños en la misma rama, hablando al mismo tiempo',
    leitura:
      'Los Pájaros hablan de conversación y de ruido: el parloteo, la agitación menuda y el nerviosismo que viene de tanta palabra junta. Son dos a propósito — la carta trata de lo que solo existe entre dos personas o entre dos voces tuyas.',
    convite:
      'Elige cuál de las dos voces dentro de ti está hablando más fuerte hoy, y dale a la otra cinco minutos escritos.',
  },

  'lenormand-13': {
    nome: 'El Niño',
    escena: 'la criatura de pie al comienzo del camino, sin equipaje',
    leitura:
      'El Niño habla de lo que es nuevo y pequeño: comienzo, ingenuidad, liviandad y el tamaño todavía reducido de algo que acaba de nacer. Es la carta que pide que no se le exija a un brote el rendimiento de un árbol.',
    convite:
      'Mide algo reciente de tu vida por el tamaño que tiene hoy, y escribe qué sería justo pedirle.',
  },

  'lenormand-14': {
    nome: 'La Zorra',
    escena: 'la zorra detenida de costado, mirando sin acercarse',
    leitura:
      'La Zorra habla de cautela y de viveza: lo que no se presenta por su nombre verdadero, el interés disfrazado y la necesidad de mirar dos veces. En la tradición es también la carta del trabajo — el lugar donde hay que ser astuto para sobrevivir.',
    convite:
      'Escribe algo que finjiste aceptar en esta historia y el precio que fingir te cobró.',
  },

  'lenormand-15': {
    nome: 'El Oso',
    escena: 'el oso de pie, demasiado grande para ignorarlo',
    leitura:
      'El Oso habla de fuerza y de poder: protección, mando, recursos y el peso de quien manda en la escena. Es también la carta de los celos y de la posesión — la misma fuerza que protege es la que ahoga cuando no sabe medirse.',
    convite:
      'Reconoce dónde en esta historia tienes fuerza de verdad y dónde solo tienes ganas de controlar.',
  },

  'lenormand-16': {
    nome: 'Las Estrellas',
    escena: 'muchas estrellas pequeñas repartidas por el cielo entero',
    leitura:
      'Las Estrellas hablan de orientación: esperanza, claridad y la dirección que se encuentra mirando hacia arriba en vez de hacia los pies. Son muchas a propósito — la carta trata tanto del rumbo como de la dispersión de quien quiere seguir todos los puntos a la vez.',
    convite:
      'Escribe los tres rumbos que se pelean tu cabeza hoy y marca el único que puedes caminar esta semana.',
  },

  'lenormand-17': {
    nome: 'La Cigüeña',
    escena: 'la cigüeña con las alas abiertas, cambiando de estación',
    leitura:
      'La Cigüeña habla de cambio: desplazamiento, cambio de fase y el movimiento de quien parte y vuelve con la estación. Es la carta de la novedad que no rompe — mueve el lugar de la cosa sin destruir lo que ya existía.',
    convite:
      'Cambia hoy algo pequeño y concreto de tu rutina y fíjate en lo que eso mueve en el resto del día.',
  },

  'lenormand-18': {
    nome: 'El Perro',
    escena: 'el perro sentado al lado, sin correa y sin prisa',
    leitura:
      'El Perro habla de lealtad: amistad, confianza y la presencia que se queda sin que haya que llamarla. Es también la carta que pregunta si la fidelidad en juego es elección o es dependencia con otro nombre.',
    convite:
      'Elige a una persona leal de tu vida que no tenga que ver con esta historia y ocupa un pedazo de tu día con esa presencia.',
  },

  'lenormand-19': {
    nome: 'La Torre',
    escena: 'la torre alta y angosta, con una sola ventana',
    leitura:
      'La Torre habla de aislamiento y de autoridad: el límite firme, la institución, la altura que protege y aparta al mismo tiempo. Es la carta de quien se recoge — por elección, por cargo o por defensa.',
    convite:
      'Fíjate si tu recogimiento de hoy te está protegiendo o solo te está dejando a solas con el tema.',
  },

  'lenormand-20': {
    nome: 'El Jardín',
    escena: 'el jardín público de alamedas abiertas, donde todo el mundo pasa',
    leitura:
      'El Jardín habla de lo que es público: convivencia, comunidad, encuentro y la parte de la vida que pasa delante de los demás. Es la carta de la exposición — lo que se muestra en la plaza lo ve mucha gente y cada uno lo explica a su manera.',
    convite:
      'Elige un lugar colectivo, aunque sea pequeño, donde estés hoy por un motivo que no tenga nada que ver con esta historia.',
  },

  'lenormand-21': {
    nome: 'La Montaña',
    escena: 'la montaña atravesada en el camino, sin atajo visible',
    leitura:
      'La Montaña habla de obstáculo: bloqueo, demora y el peso de lo que no se resuelve por esfuerzo de voluntad. Es la carta de lo que es grande de verdad — y que por eso se atraviesa por partes o se rodea, nunca de un salto.',
    convite:
      'Divide el obstáculo que más te traba en tres pedazos y haz hoy el más pequeño.',
  },

  'lenormand-22': {
    nome: 'Los Caminos',
    escena: 'el camino que se abre en dos, sin cartel en ninguno de los lados',
    leitura:
      'Los Caminos hablan de elección: la bifurcación, la alternativa y la incomodidad de decidir sin garantía. Es la carta que devuelve la decisión a las manos de quien consulta, y no a las circunstancias.',
    convite:
      'Escribe las dos opciones que tienes delante y lo que cuesta cada una — no lo que promete cada una.',
  },

  'lenormand-23': {
    nome: 'Los Ratones',
    escena: 'los ratones roendo la esquina de lo que está guardado',
    leitura:
      'Los Ratones hablan de pérdida lenta: el desgaste que come por los bordes, el cansancio que se acumula y lo poco que desaparece todos los días sin alboroto. Es la carta de lo que no se rompe de una vez — solo disminuye.',
    convite:
      'Encuentra las rendijas por donde tu energía se escapa en silencio y cierra una hoy, aunque quede mal cerrada.',
  },

  'lenormand-24': {
    nome: 'El Corazón',
    escena: 'un corazón abierto, sin marco y sin guardia',
    leitura:
      'El Corazón habla de afecto declarado: amor, felicidad, pasión e intimidad. En una lectura de relación, señala un momento de conexión emocional sincera y la búsqueda de armonía entre las personas involucradas.',
    // Lo que TÚ haces con eso hoy. Nunca lo que va a hacer la otra persona.
    convite:
      'Fíjate en qué lugar de tu día aparece todavía ese afecto — y qué te pide a ti, no a la otra persona.',
  },

  'lenormand-25': {
    nome: 'El Anillo',
    escena: 'el anillo cerrado, sin comienzo y sin fin visibles',
    leitura:
      'El Anillo habla de vínculo: compromiso, acuerdo, alianza y la forma redonda de lo que se repite. Es la carta del contrato — escrito o no — y de las condiciones que alguien aceptó sin leer.',
    convite:
      'Escribe el acuerdo no dicho que vienes cumpliendo en esta historia y decide si todavía es tuyo.',
  },

  'lenormand-26': {
    nome: 'El Libro',
    escena: 'el libro de tapa cerrada, con parte de las páginas todavía intacta',
    leitura:
      'El Libro habla de lo que está guardado: secreto, conocimiento y la parte de la historia que todavía no fue abierta. Es la carta del estudio — lo que se sabe por dentro, y lo que solo se descubre leyendo hasta el final.',
    convite:
      'Elige un tema tuyo que postergaste por no saber lo suficiente y lee hoy su primera página.',
  },

  'lenormand-27': {
    nome: 'La Carta',
    escena: 'el sobre cerrado encima de la mesa, todavía sin abrir',
    leitura:
      'La Carta habla de noticia y de palabra escrita: documento, recado, aviso y todo lo que circula por escrito en vez de circular por voz. Es la carta de lo que queda registrado — lo que se puede releer después, al contrario de lo que se dice en caliente.',
    convite:
      'Escríbete a ti lo que dirías si nadie fuera a leerlo, y guarda el papel sin destino.',
  },

  /* LAS DOS CARTAS DE PERSONA (28 y 29). El nombre viene de la tradición y no
   * define el género de nadie en la lectura — la misma regla del portugués. */
  'lenormand-28': {
    nome: 'El Hombre',
    escena: 'la figura de cuerpo entero, de pie y vuelta hacia quien lee',
    leitura:
      'Esta es una de las dos cartas de persona del mazo: marca uno de los lados de la historia — quien consulta o quien está del otro lado. El nombre viene de la tradición y no define el género de nadie en la lectura; a quién representa se decide por las cartas que caen alrededor.',
    convite:
      'Antes de decidir si esta carta habla de ti o de la otra persona, escribe en una línea lo que quieres para ti en esta historia.',
  },

  'lenormand-29': {
    nome: 'La Mujer',
    escena: 'la segunda figura de cuerpo entero, de frente a la primera',
    leitura:
      'Esta es la otra carta de persona, y hace par con la anterior: una representa a quien consulta y la otra, a quien está del otro lado. Cuál es cuál no viene del nombre — viene de dónde cae cada una y de lo que pidió la pregunta.',
    convite:
      'Marca en el papel cuál de las dos figuras eres tú hoy, y qué cambia en la lectura si se invierte la posición.',
  },

  'lenormand-30': {
    nome: 'El Lirio',
    escena: 'los lirios abiertos en campo abierto, en el ritmo lento del invierno',
    leitura:
      'El Lirio habla de madurez: serenidad, honra, experiencia y lo que solo llega después de un tiempo vivido. En la tradición toca también la intimidad — la que está hecha de calma y no de urgencia.',
    convite:
      'Elige hoy una decisión que tomarías con diez años más de camino, y toma solo esa.',
  },

  'lenormand-31': {
    nome: 'El Sol',
    escena: 'el sol alto, sin ninguna nube entre él y el suelo',
    leitura:
      'El Sol habla de claridad y de energía: éxito, calor, visibilidad y la fuerza de quien tiene el día a favor. Es la carta de lo que aparece entero, sin sombra encima — lo contrario exacto de lo que describen Las Nubes.',
    convite:
      'Nombra la única cosa de tu vida que hoy está clara y hazla el punto de apoyo del resto del día.',
  },

  'lenormand-32': {
    nome: 'La Luna',
    escena: 'la luna sola en el cielo, cambiando de forma sin cambiar de tamaño',
    leitura:
      'La Luna habla de emoción y de imaginación: el sueño, la noche, el reconocimiento y el ciclo que se rehace sin prisa. Es la carta de lo que sentimos sobre una cosa, que no siempre es del tamaño de la cosa.',
    convite:
      'Separa hoy el hecho del sentimiento sobre el hecho — dos líneas, una para cada uno, y lee las dos en voz alta.',
  },

  'lenormand-33': {
    nome: 'La Llave',
    escena: 'la llave sola, sin la cerradura al lado',
    leitura:
      'La Llave habla de apertura: solución, acceso, destrabe y la certeza de que existe una puerta para ese asunto. En la tradición es una de las cartas más firmes del mazo — confirma lo que está a su lado en vez de dudar.',
    convite:
      'Haz la lista de las puertas que ya sabes abrir sin ayuda y usa una de ellas hoy, aunque no sea la principal.',
  },

  'lenormand-34': {
    nome: 'Los Peces',
    escena: 'los peces en cardumen, siempre en movimiento en la misma agua',
    leitura:
      'Los Peces hablan de flujo: dinero, recursos, abundancia y todo lo que circula en vez de quedarse quieto. Es también la carta de la profundidad — lo que corre por debajo de la superficie y sostiene lo que se ve arriba.',
    convite:
      'Mira un número concreto de tu vida hoy — una cuenta, un gasto, un saldo — y resuelve la cosa más pequeña que ese número te pide.',
  },

  'lenormand-35': {
    nome: 'El Ancla',
    escena: 'el ancla en el fondo, sosteniendo un barco que no se ve',
    leitura:
      'El Ancla habla de permanencia: firmeza, puerto, trabajo constante y lo que se queda en su lugar cuando el agua se mueve. Es la carta de la estabilidad — y también de la terquedad, porque la misma ancla que sostiene es la que impide zarpar.',
    convite:
      'Descubre qué te sostiene hoy y escribe si es raíz o es peso, con una sola palabra para cada uno.',
  },

  'lenormand-36': {
    nome: 'La Cruz',
    escena: 'la cruz plantada en el suelo, marcando el lugar de un peso',
    leitura:
      'La Cruz es la carta más pesada del mazo: carga, prueba y lo que se lleva por deber, por creencia o por historia de familia. No anuncia ningún castigo — le pone nombre al peso que ya está ahí y pregunta de quién es.',
    convite:
      'Escribe un peso que llevas y al lado el nombre de quien lo puso ahí; si el nombre es el tuyo, ya es un comienzo.',
  },
};

/* ===========================================================================
   EL NAIPE NO SE TRADUCE, Y NO ES OLVIDO
   ===========================================================================
   `naipe` (Copas / Ouros / Paus / Espadas) es la carta francesa incrustada en
   la carta del Lenormand, y el cabecalho del portugues explica para que sirve:
   habilitar la lectura combinada de la tradicion. Hoy NINGUNA pantalla lo
   dibuja — ninguna de las dos pantallas que leen el mazo
   (LeituraDeEntradaScreen, ReouvirTresCartasScreen) lo muestra, y el portao de
   doutrina no lo varre.

   Traducirlo aqui seria escribir texto que nadie lee y abrir la puerta a que
   el dia en que una pantalla lo dibuje existan dos listas de naipes que se
   pueden desincronizar. Cuando haya pantalla que lo muestre, se traduce ahi —
   Copas / Oros / Bastos / Espadas — y este comentario sale.
   =========================================================================== */

export default LENORMAND_ES;
