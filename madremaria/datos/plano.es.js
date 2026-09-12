// datos/plano.es.js
// O ESPANHOL do conteudo do plano do dia: os cinco rituais, as sete reflexoes,
// as onze afirmacoes e as quatro acoes de encontro. Arquivo VIZINHO de
// datos/plano.js, que continua sendo o portugues e a fonte da estrutura.
//
// ===========================================================================
// AS QUATRO COISAS QUE ESTE ARQUIVO NAO PODE MUDAR
// ===========================================================================
// 1. O `id` do ritual ('cafe-da-manha', 'linha-no-papel', 'leitura-da-mao',
//    'caminho-de-volta', 'mesa-posta'). lib/plano.js devolve `ritual.id` na
//    saida e screens/PlanoScreen.js decide por ele; um id traduzido some do
//    disco sem erro nenhum.
// 2. `camera` e `momento` (fasesLua, diasSemana). Os nomes de fase sao NOME
//    CANONICO, nao texto: casam byte a byte com FASES de lib/ceu.js. Eles nao
//    estao aqui de proposito — este arquivo so carrega TEXTO, e a estrutura e
//    lida do PT. Traduzir 'Lua Cheia' para 'Luna Llena' faria o ritual parar
//    de casar com a fase, em silencio, para sempre.
// 3. A CONTAGEM E A ORDEM de cada lista: 5 / 7 / 11 / 4, na mesma ordem. A
//    rotacao de lib/plano.js e aritmetica de dia sobre o INDICE
//    (`indiceDaVolta(REFLEXOES.length, giro)`), e cinco, sete e onze sao primos
//    entre si de proposito — as tres rotacoes so voltam a coincidir a cada 385
//    dias. Uma lista espanhola com dez afirmacoes em vez de onze quebraria essa
//    aritmetica e faria o dia 12 repetir o dia 1.
// 4. AS TRES LINHAS DA DOUTRINA, que valem em espanhol igual:
//    · nenhum texto depende do ceu (o ritual e inteiro sem efemeride);
//    · nenhum promete desfecho nem diz o que a outra pessoa faz ou sente;
//    · NENHUM GESTO EMPURRA PARA FORA: nao ha buscar, ligar, insistir,
//      aparecer — nem nas versoes suaves ("deja una senal", "haz que se
//      entere"). O app reage ao contato; nao provoca. Em espanhol isto e mais
//      facil de violar sem querer, porque o nicho amoroso hispanofalante tem
//      formula feita para "que sepa que existes". Nada disso entra aqui.
//
// ===========================================================================
// GESTO OBSERVAVEL, E O GESTO QUE TROCOU DE PAIS
// ===========================================================================
// Todo `acao` termina em algo que se responde com si ou no no fim do dia: a
// foto foi tirada ou nao, o papel foi guardado ou nao. "Reconecta con tu
// esencia" nao e acao, e enfeite.
//
// Nenhum dos cinco gestos depende do Brasil: cafe, papel na gaveta, a propria
// mao sob a luz, dez minutos de rua, a mesa posta. Os cinco se fazem em
// qualquer pais, com o que ja esta dentro de casa. Nao houve gesto substituido.
//
// ===========================================================================
// GENERO: O PT TRAVA EM FEMININO, O ESPANHOL NAO
// ===========================================================================
// Tres linhas do PT concordam em feminino: "coma sentada" (mesa-posta), "o que
// voce aprendeu a fazer sozinha" (reflexao 5) e "um lugar onde voce ja foi
// feliz sozinha" (encontro 1). Carregar isso para o espanhol ("siéntate sola")
// faria o plano do dia falar com outra pessoa para quem respondeu 'homem' ou
// 'prefiro-nao-dizer' em P7 — o mesmo defeito que lib/genero.js existe para
// consertar no fecho da leitura profunda.
//
// Entao as tres ficam NEUTRAS em espanhol, sem perder o gesto:
//   · "come sentado a la mesa" -> "come en la mesa, sentado" seria pior:
//     viraria masculino. A saida e tirar o adjetivo: "come ahí, sin teléfono".
//   · "sola" -> "por tu cuenta" / "sin compañía": diz a mesma solidao escolhida
//     sem marcar genero.
// Isto NAO e afrouxar o original: e a mesma frase dita numa lingua que obriga a
// escolher onde o portugues nao obrigava. Anotado no relatorio.

/* Os cinco rituais, por ID. Mapa e nao lista de proposito: a ordem e a
 * estrutura (camera, momento) moram no PT, e repetir a ordem aqui seria uma
 * segunda fonte da verdade livre para divergir. */
export const RITUAIS_ES = {
  'cafe-da-manha': {
    titulo: 'El café de hoy',
    acao: 'Prepara el café con calma y saca una foto de la taza antes del primer sorbo.',
    porque: 'La foto se queda en este teléfono. Es un registro de tu día, no un recado para nadie.',
  },
  'linha-no-papel': {
    titulo: 'Una línea en un papel',
    acao: 'Apunta en un papel la frase que se te quedó atragantada y guarda el papel en un cajón.',
    porque:
      'Sin ningún nombre en el papel: con un nombre, el gesto deja de ser sobre lo que sientes y pasa a estar dirigido a otra persona.',
  },
  'leitura-da-mao': {
    titulo: 'La lectura de la mano',
    acao: 'Abre la mano bajo una buena luz y sigue la línea más larga con el dedo, de principio a fin, tres veces.',
    porque:
      'Leerse la propia mano es práctica antigua, y aquí sirve de pausa. La mano que estás mirando es la tuya.',
  },
  'caminho-de-volta': {
    titulo: 'Diez minutos de calle',
    acao: 'Sal diez minutos y vuelve por un camino distinto al de la ida.',
    porque: 'Cambiar el trayecto cambia lo que notas. Es solo eso, y ya es bastante para un día.',
  },
  'mesa-posta': {
    titulo: 'La mesa puesta',
    /* "coma sentada" do PT sai sem adjetivo: o gesto e comer A MESA, posta, sem
     * telefone — e ele sobrevive inteiro sem marcar genero. */
    acao: 'Pon la mesa para ti — plato, vaso, servilleta — y come ahí, sin teléfono.',
    porque: 'Comer de pie es la forma más rápida de que un día entero pase sin ti dentro.',
  },
};

/* SETE reflexoes, na MESMA ORDEM do PT. Todas sao pergunta, e toda pergunta e
 * sobre ela. Nenhuma pergunta pelo que a outra pessoa pensa: essa e a pergunta
 * que o app nao pode responder e que, feita todo dia, vira rumiacao. */
export const REFLEXOES_ES = [
  '¿De qué sentiste falta hoy: de la persona o de la rutina que tenían?',
  'De lo que pasó, ¿qué parte todavía duele y qué parte solo molesta?',
  'Si nadie estuviera mirando, ¿qué harías con esta tarde?',
  '¿Qué cosa buena de ese vínculo ya existía antes de él y sigue siendo tuya?',
  /* "sozinha" -> "por tu cuenta": mesma solidao, sem genero. */
  '¿Qué aprendiste a hacer por tu cuenta en estos últimos meses?',
  '¿Estás esperando una señal o estás esperando una decisión tuya?',
  '¿Qué límite dejaste pasar una vez y no dejarías pasar de nuevo?',
];

/* ONZE afirmacoes, na MESMA ORDEM. Todas no presente: afirmacao no futuro ("un
 * día voy a entender") e promessa con outra roupa, e promessa e o que este
 * produto nao vende. Nenhuma delas ganhou "volverá" na traducao. */
export const AFIRMACOES_ES = [
  'Puedo echar de menos y aun así no dar ningún paso hoy.',
  'Mi extremo del hilo es mío, y es el único que sostengo.',
  'No debo explicaciones por el tiempo que estoy tardando.',
  'Hoy cuido de mi parte, que es la parte que existe de verdad.',
  'Tengo derecho a cambiar de opinión sin avisar a nadie.',
  'El silencio no es una respuesta, y tampoco es un castigo.',
  'No necesito entenderlo todo hoy para vivir el día de hoy.',
  'Mi calma no está guardada con nadie más.',
  'Yo elijo qué hago con mi noche.',
  'Nada en mí está roto porque esa historia no se haya cerrado.',
  'Soy la persona más constante de esta historia.',
];

/* QUATRO acoes de encontro, na MESMA ORDEM.
 *
 * ESTA LISTA SO EXISTE PARA QUEM TEM CONTATO. Com 'le-escribi-no-responde',
 * 'cero-contacto' ou bloqueio, lib/plano.js NAO le este array: o bloco sai
 * travado, com o motivo escrito. Por isso elas podem falar de mesa, de hora e
 * de encontro sem rodeio — e por isso o portao varre a saida inteira naquele
 * estado: um vazamento destas quatro linhas para quem esta em contato zero e o
 * pior bug possivel deste modulo.
 *
 * Nenhuma promete desfecho, mesmo com contato ativo. Reservar una mesa e uma
 * acao DELA; o que acontece na mesa nao e assunto de um app de tarot. */
export const ENCONTROS_ES = [
  /* "feliz sozinha" -> "por tu cuenta": sem genero, mesma frase. */
  'Elige un lugar donde ya fuiste feliz por tu cuenta y reserva esa hora en tu día.',
  'Deja una noche de verdad libre en la agenda, sin plan B y sin hora de terminar.',
  'Ofrece una mesa y un horario, cortos y claros: un café de treinta minutos alcanza.',
  'Propón algo que harías de todos modos, y deja una silla libre.',
];

export default { RITUAIS_ES, REFLEXOES_ES, AFIRMACOES_ES, ENCONTROS_ES };
