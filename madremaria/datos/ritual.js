// datos/ritual.js
// O RITUAL DE SETE DIAS — a tabela de conteudo. Sem motor, sem disco, sem tela.
// Comentarios em portugues, como em datos/preguntas.js e lib/almacen.js.
//
// ===========================================================================
// DE ONDE VEM O FORMATO
// ===========================================================================
// A arquitetura e do funil de WhatsApp que ja converte: tarefa unica e curta
// com preco declarado ("5 minutinhos"), janela FECHADA e nomeada ("durante 7
// dias"), um compromisso pedido em voz alta ANTES do dia 1, uma unica regra de
// contencao concreta, e um retorno ja marcado no calendario.
//
// O que NAO vem junto, e e a metade que o funil vende: a causalidade. La o
// ritual "age", as velas ficam acesas, e faltar um dia estraga o trabalho. Aqui
// nada age sobre ninguem. Os sete dias sao sobre quem esta segurando o telefone
// — e por isso o dia 7 nao entrega profecia, entrega o DADO DELA: a linha que
// ela mesma deixou no dia 1, com a data, sem uma virgula mudada.
//
// ===========================================================================
// O FORMATO DE UM DIA (todos os campos obrigatorios)
// ===========================================================================
//   dia      — 1..7. O numero e DADO; nenhum titulo escreve "Dia 3".
//   titulo   — 3 a 5 palavras, sem promessa, sem numero.
//   abertura — o texto que abre o dia: o que hoje pede dela. Fala com ela,
//              nunca sobre a outra pessoa.
//   pregunta — de diario, sobre a vida dela. Nunca afirmacao nossa.
//   placeholder — o que aparece no campo vazio, antes de ela escrever. Nunca
//              exemplo de resposta: exemplo de resposta ensina o que dizer, e o
//              dia 7 so vale se a linha do dia 1 for dela.
//   gesto    — { titulo, cuerpo } UM gesto pequeno, que cabe em cinco minutos,
//              e que depende so dela. Gesto que depende de terceiro pode
//              "falhar", e ritual que falha vira culpa.
//   cierre   — uma frase que fecha o dia. Constata o que ela fez hoje e nao
//              promete nada sobre amanha nem sobre a outra pessoa.
//   espeja   — id de uma pergunta de datos/preguntas.js. E o analogo do campo
//              `fontes` da Jornada do Cosmic Guide: la o texto aponta para uma
//              fonte historica checavel, aqui aponta para a FONTE DELA. Nao ha
//              afirmacao historica neste arquivo, entao nao ha recibo a dar.
//
// DOIS ALIASES, e por que sao DERIVADOS e nao escritos a mao: `lectura` repete
// `abertura` e `gesto.texto` repete `gesto.cuerpo`. Eles existem porque o campo
// nasceu com dois nomes enquanto motor e telas eram escritos em paralelo, e sao
// GERADOS no map logo abaixo de DIAS_BASE — nunca digitados duas vezes. Dois
// campos que podem discordar acabam discordando, e aqui a discordancia sairia na
// tela como o app dizendo duas coisas diferentes no mesmo dia. Quando as telas
// convergirem num nome so, some o map e some o alias; nenhum texto se move.
//
// CUIDADO COM O NOME: `cierre` (minusculo, campo do dia) fecha CADA dia.
// `CIERRE` (maiusculo, no fim do arquivo) sao as duas molduras do espelho do
// dia 7. Sao coisas diferentes e nao se substituem.
//
// ===========================================================================
// A LINHA QUE NAO SE ATRAVESSA (o portao e test/ritual.test.js)
// ===========================================================================
//  1. Nenhum texto promete desfecho nem fala do futuro de quem esta do outro
//     lado. Varrido com hablaDelFuturo() de lib/lectura.js.
//  2. Nenhum gesto empurra para fora — procurar, escrever, ligar, insistir.
//     Varrido com sugiereContacto() de lib/lectura.js. Nos sete dias NAO existe
//     um so gesto de contato: se ela respondeu no onboarding que esta sem
//     contato ou que escreveu e nao teve resposta (IDS_CONTACTO_DURO em
//     datos/preguntas.js), mandar contato seria o app empurrando ela para o
//     lugar mais doloroso possivel.
//  3. Nenhum texto diz que faltar um dia estraga alguma coisa. O ritual parado
//     fica do tamanho que ficou, esperando (mesma regra de lib/hilo.js).
//  4. Nenhum texto descreve EFEITO do gesto no corpo ou na mente. O funil diz
//     "isso vai te acalmar"; aqui se descreve o gesto e ponto. Alegacao de
//     saude reprova em test/copy.test.js e reprova na ficha da loja.
//  5. O genero de quem esta do outro lado nunca e assumido: "essa pessoa".
//
// IDIOMA: portugues do Brasil, como datos/cartas.json. As strings moram aqui,
// junto do campo que elas justificam — mesma convencao de datos/preguntas.js,
// que tambem carrega texto e microcopy.
//
// OS TRES IDIOMAS (12/09/2026): o PT e este arquivo e nao se move. ES e EN moram
// em datos/ritual.es.js e datos/ritual.en.js, com os dias por chave 1..7, e quem
// costura e datos/traduzir.js. QUEM DESENHA CHAMA FUNCAO: getDia(n), pacto(),
// cierre(), nudos() — as constantes DIAS/PACTO/CIERRE/NUDOS sao avaliadas no
// import, quando o idioma ainda nao chegou, e continuam em portugues de
// proposito (e o que os portoes de doutrina varrem). Ver o bloco OS TRES IDIOMAS
// no fim do arquivo.
// ===========================================================================

import * as EN from './ritual.en.js';
import * as ES from './ritual.es.js';
import { idiomaMadre } from './textos.js';
import { traduzido } from './traduzir.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * O PACTO — pedido ANTES do dia 1, nunca no meio da semana.
 *
 * "Posso confiar que voce vai fazer sua parte com todo o coracao?" e a pergunta
 * fechada do funil, e ela funciona: quem responde sim cumpre mais. A versao
 * honesta e esta — ela toca em "eu topo os sete dias" sabendo o preco (cinco
 * minutos), o fim (sete dias) e o que ganha no ultimo dia. E sabendo tambem que
 * faltar nao custa nada, porque isso e verdade e esconder seria a isca.
 * ================================================================================= */
export const PACTO = congelar({
  titulo: 'Sete dias, cinco minutos por dia',
  cuerpo:
    'Um gesto pequeno por dia, sete dias, e acabou. Não tem hora marcada e não tem lugar certo: cinco minutos, onde você estiver. No sétimo dia este aparelho devolve, com a data, a linha que você deixar aqui hoje. Nada disto sai deste telefone e nada disto chega a essa pessoa. Os sete dias são seus.',
  boton: 'Eu topo os sete dias',
  nota: 'Se um dia passar em branco, ele fica esperando do jeito que está. Você volta e continua de onde parou.',
});

/* =================================================================================
 * OS SETE DIAS
 *
 * DIAS_BASE e a fonte da verdade: e aqui que se escreve e se corrige texto.
 * A exportacao DIAS sai do map logo abaixo, ja com os aliases derivados.
 * ================================================================================= */
const DIAS_BASE = [
  /* --- 1 -------------------------------------------------------------------------
   * NOMEAR. O dia que carrega o produto inteiro: e aqui que ela deposita o texto
   * que o dia 7 devolve. Por isso o gesto do dia 1 e o unico que pede palavra
   * escrita, e por isso a abertura ja anuncia o dia 7 — o retorno marcado no
   * calendario e o que sustenta a semana. Anunciar antes tambem e o que faz do
   * dia 7 uma promessa cumprida, em vez de uma surpresa feita com o texto dela. */
  {
    dia: 1,
    titulo: 'O que você guarda hoje',
    abertura:
      'Este é o primeiro dos sete. Antes de qualquer outra coisa, deixe registrado o que pesa agora — com as suas palavras, do jeito que sair, sem arrumar a frase. No sétimo dia esta mesma linha volta para você com a data de hoje ao lado. Ninguém além de você lê isto: fica neste aparelho.',
    pregunta: 'O que ficou sem ser dito quando aquilo se rompeu?',
    placeholder: 'Do jeito que sair. Fica neste aparelho.',
    gesto: {
      titulo: 'Uma linha só',
      cuerpo: 'Deixe aqui, em uma linha só, o que está pesando neste momento. Cinco minutos bastam.',
    },
    cierre: 'Guardado com a data de hoje. É esta linha que volta no sétimo dia.',
    espeja: 'corte',
  },

  /* --- 2 -------------------------------------------------------------------------
   * O lado do fio que esta na mao dela. E a terceira posicao da leitura (TU
   * EXTREMO) esticada em um dia.
   *
   * CUIDADO COM A METAFORA — este dia ja foi escrito errado uma vez, assim: "este
   * e o unico que se mexe quando voce puxa" (e o `cierre` repetia "um lado do fio
   * se mexe quando voce puxa"). Nenhuma palavra proibida, nenhum lint aceso, e
   * mesmo assim era o app dizendo que existe um fio de duas pontas entre ela e a
   * outra pessoa e que puxar move alguma coisa. Lido por quem brigou ontem, isso e
   * a promessa inteira do funil dita em imagem. Aqui o fio so tem o lado que esta
   * NA MAO DELA, e ninguem puxa nada: o `cierre` sai sozinho na tela do dia ja
   * fechado, entao ele tem de se sustentar sem a abertura ao lado. */
  {
    dia: 2,
    titulo: 'A sua mão no nó',
    abertura:
      'Hoje o olhar vai para um lado só do fio: o que está na sua mão. É o único sobre o qual dá para dizer alguma coisa sem adivinhar.',
    pregunta: 'Que parte disto tudo está mesmo na sua mão?',
    placeholder: 'O que dependeu só de você hoje.',
    gesto: {
      titulo: 'Uma coisa sua',
      cuerpo: 'Escolha uma coisa do dia de hoje que dependeu só de você e deixe anotado qual foi.',
    },
    cierre: 'Hoje o olhar foi para um lado só: o que está na sua mão.',
    espeja: 'intencion',
  },

  /* --- 3 -------------------------------------------------------------------------
   * A CONTENCAO — a peca mais forte do funil e a mais escorregadia. La ela e
   * regra ("evite enviar mensagens") e vira culpa no dia em que a pessoa manda.
   * Aqui ela e CONVITE REVERSIVEL e sobre ela: a vontade tem um lugar para ir.
   * Nenhuma consequencia e descrita, porque nao existe nenhuma — e porque dizer
   * que nao procurar "funciona" seria dizer que o ritual age sobre alguem.
   * O `cierre` fecha com isso escrito com todas as letras: a escolha continua
   * sendo dela, e nada aqui muda de tamanho por causa dela. */
  {
    dia: 3,
    titulo: 'A vontade da madrugada',
    abertura:
      'A vontade de dizer alguma coisa costuma ter horário, e cada pessoa tem o seu. Hoje o dia pede uma coisa só: reparar qual é o seu.',
    pregunta: 'Que hora do dia isso costuma apertar em você?',
    placeholder: 'A frase inteira, do jeito que ela veio.',
    gesto: {
      titulo: 'A frase cabe aqui',
      cuerpo:
        'Se a vontade de dizer algo apertar hoje, ela cabe aqui: deixe a frase inteira nesta tela, do jeito que ela veio.',
    },
    cierre: 'A vontade tem hora, e agora tem lugar. O que você faz com ela continua sendo escolha sua.',
    espeja: 'hoy',
  },

  /* --- 4 -------------------------------------------------------------------------
   * O limite do app dito como gesto: nenhuma carta le a outra pessoa. Separar o
   * que se sabe do que se supoe e a unica "leitura" honesta do outro lado. */
  {
    dia: 4,
    titulo: 'Parar de adivinhar',
    abertura:
      'Boa parte do cansaço não vem do que aconteceu: vem de reconstruir de cabeça o que se passa do outro lado. Nenhuma carta lê essa pessoa, e este aparelho também não. O que sobra, quando isso sai da conta, é o que dá para saber de verdade.',
    pregunta: 'O que você sabe mesmo, e o que você anda supondo?',
    placeholder: 'O que você anda supondo — e o que você sabe.',
    gesto: {
      titulo: 'Sei ou suponho',
      cuerpo:
        'Anote uma coisa que você vem supondo sobre essa pessoa e marque ao lado: isto eu sei, ou isto eu suponho.',
    },
    cierre: 'Nenhuma carta lê essa pessoa, e este aparelho também não. Hoje você separou o que sabe do que supõe.',
    espeja: 'hoy',
  },

  /* --- 5 -------------------------------------------------------------------------
   * Decisao do tamanho do dia. O funil pede fe; aqui se pede uma escolha
   * minuscula que ela consegue conferir sozinha antes de dormir.
   *
   * A abertura dizia "e e ela que muda o dia seguinte". Passava em todo lint —
   * nao ha palavra proibida, nao ha verbo no futuro, nao se fala da outra pessoa —
   * e mesmo assim era o app afirmando que o passo de hoje MUDA o que vem depois.
   * Quem esta esperando uma pessoa voltar nao le isso como conselho de habito: le
   * como o efeito comecando. O que a abertura pode dizer sobre a decisao pequena e
   * so o que se confere hoje — que ela cabe no dia de hoje. */
  {
    dia: 5,
    titulo: 'Uma decisão pequena hoje',
    abertura:
      'Decisão grande não se toma numa semana difícil. Decisão pequena, sim — e é a única que você consegue cumprir hoje, do começo ao fim, sem depender de mais ninguém.',
    pregunta: 'Qual foi a menor decisão que você tomou hoje por conta própria?',
    placeholder: 'A decisão, e o que aconteceu depois de cumprir.',
    gesto: {
      titulo: 'Do tamanho de hoje',
      cuerpo:
        'Escolha uma decisão minúscula para hoje, do tamanho de cinco minutos, e deixe anotado qual foi depois de cumprir.',
    },
    cierre: 'Foi pequena e foi sua. É o tamanho que cabe numa semana difícil.',
    espeja: 'intencion',
  },

  /* --- 6 -------------------------------------------------------------------------
   * "A sua parte" sem exagero para nenhum dos dois lados: nem culpa inteira nem
   * inocencia inteira. E a vespera do espelho, e prepara a leitura do dia 7. */
  {
    dia: 6,
    titulo: 'O tamanho da sua parte',
    abertura:
      'A sua parte não é a história inteira, e também não é nada. Ela tem um tamanho, e dá para dizer qual é sem aumentar e sem diminuir.',
    pregunta: 'Qual foi a sua parte, dita sem exagero para nenhum dos dois lados?',
    placeholder: 'Comece por "a minha parte foi".',
    gesto: {
      titulo: 'A minha parte foi',
      cuerpo: 'Deixe aqui uma frase que comece por "a minha parte foi".',
    },
    cierre: 'Nem a história inteira, nem nada. Hoje ela ficou do tamanho que tem.',
    espeja: 'corte',
  },

  /* --- 7 -------------------------------------------------------------------------
   * O ESPELHO. O app nao compara, nao conclui e nao diz que ela mudou: ele
   * CITA, com data, e pergunta. No instante em que este dia disser "voce estava
   * assim, agora esta assim", virou veredito sobre a vida dela — que e o erro do
   * funil com voz de terapeuta. Ver CIERRE, logo abaixo. */
  {
    dia: 7,
    titulo: 'O sétimo dia',
    abertura:
      'Sete dias, sete registros seus. Hoje o aparelho devolve a linha do primeiro dia exatamente como você a deixou, com a data. Ela não é diagnóstico e não mede nada: é o que ficou guardado por sete dias, entregue de volta.',
    pregunta: 'O que você vê agora nessa linha do primeiro dia?',
    placeholder: 'A linha de hoje, com a data.',
    gesto: {
      titulo: 'Leia e deixe a linha de hoje',
      cuerpo: 'Leia a linha do primeiro dia e deixe embaixo uma linha nova, com a data de hoje.',
    },
    cierre: 'Sete dias, sete registros seus, com data. Ficam aqui, e você pode reler quando quiser.',
    espeja: 'corte',
  },
];

/**
 * DIAS — o que motor e telas consomem. Os dois aliases (`lectura`, `gesto.texto`)
 * saem daqui, de uma origem so: nao ha como um deles ficar para tras numa
 * correcao de texto, porque nenhum dos dois e digitado.
 */
export const DIAS = congelar(
  DIAS_BASE.map((d) => ({
    ...d,
    lectura: d.abertura,
    gesto: { ...d.gesto, texto: d.gesto.cuerpo },
  }))
);

/* =================================================================================
 * CIERRE — as duas versoes do dia 7.
 *
 * `conEspejo` e um molde com {fecha}: a tela poe a citacao dela LOGO ABAIXO,
 * verbatim, nunca dentro da frase e nunca reescrita. O texto nao adjetiva o que
 * ela escreveu e nao compara com hoje — so situa a data e devolve a palavra.
 *
 * `sinEspejo` existe porque a melhor cena do produto nao pode quebrar justo para
 * quem so tocou nos botoes: quem nao deixou linha nenhuma no dia 1 chega ao dia
 * 7 e encontra o que de fato existe — as sete datas.
 * ================================================================================= */
export const CIERRE = congelar({
  conEspejo: 'Em {fecha}, no primeiro dia, você deixou isto aqui:',
  sinEspejo:
    'No primeiro dia você não deixou nenhuma linha escrita. Os sete dias contam do mesmo jeito: o que ficou registrado foram as datas, e elas estão aqui embaixo.',
});

/* =================================================================================
 * NUDOS — os "marcos" do ritual, no vocabulario que o app ja tem (lib/hilo.js
 * conta a sequencia em nos).
 *
 * REGRA DE ESCRITA, copiada da Jornada do Cosmic Guide e valendo literal aqui:
 * o no premia o que a pessoa FEZ — voltou, leu, terminou —, NUNCA o que ela
 * VIROU. Nao existe "Livre", nao existe "Curada", nao existe "Renascida": isso
 * seria promessa de resultado com carinha de premio.
 *
 * E a armadilha nao e lexical, e GRAMATICAL. "Ja nao espera mais" e "Voce
 * virou outra pessoa" nao usam nenhuma palavra proibida e afirmam, as duas, o
 * que ela virou — passariam por qualquer lista de palavras. Por isso todo
 * rotulo aqui e FATO CONTAVEL: noites. Nada mais.
 *
 * Concessao 100% derivada em lib/ritual.js: nenhum no e gravado no disco, entao
 * nao existe no dessincronizado do progresso.
 * ================================================================================= */
export const NUDOS = congelar([
  { id: 'unaNoche', marco: 1, rotulo: 'Uma noite' },
  { id: 'tresNoches', marco: 3, rotulo: 'Três noites' },
  { id: 'cincoNoches', marco: 5, rotulo: 'Cinco noites' },
  { id: 'sieteNoches', marco: 7, rotulo: 'As sete noites' },
]);

/* =================================================================================
 * CONTRATO PARA O MOTOR E PARA AS TELAS
 * ================================================================================= */

export const RITUAL = congelar({
  id: 'sieteNudos',
  duracion: DIAS.length,
  minutosPorDia: 5,
  PACTO,
  DIAS,
  CIERRE,
  NUDOS,
});

/** 7. Ninguem digita o numero na tela nem no motor. */
export const DURACION = DIAS.length;

/**
 * O dia pelo numero. Devolve undefined fora de 1..7 — nunca lanca. Tambem
 * devolve undefined para '3' e para 3.5: um dia que nao existe tem de aparecer
 * como ausencia, nunca como um dia errado com cara de certo.
 *
 * JA NO IDIOMA ATIVO (ver OS TRES IDIOMAS, abaixo). Os dois aliases derivados
 * (`lectura` e `gesto.texto`) sao RECOMPOSTOS depois da fusao: eles repetem
 * `abertura` e `gesto.cuerpo`, e deixa-los vir da entrada PT faria a tela mostrar
 * a abertura em ingles e a `lectura` em portugues no mesmo dia — que e
 * exatamente a discordancia que os aliases existem para impedir.
 */
export function getDia(dia) {
  const base = DIAS.find((d) => d.dia === dia);
  const tr = traduzido(base, DIAS_POR_IDIOMA, dia);
  if (tr === base) return base;
  return Object.freeze({
    ...tr,
    lectura: tr.abertura,
    gesto: { ...tr.gesto, texto: tr.gesto.cuerpo },
  });
}

/* =================================================================================
 * OS TRES IDIOMAS (12/09/2026)
 * =================================================================================
 * O PT mora NESTE arquivo e nao se move: ele e a fonte da verdade e e o que os
 * portoes de doutrina varrem (test/madremaria-ritual.test.js importa DIAS e NUDOS
 * direto daqui). ES e EN moram em vizinhos — datos/ritual.es.js e
 * datos/ritual.en.js —, com os dias por CHAVE 1..7. Quem costura e
 * datos/traduzir.js, na hora da chamada.
 *
 * As constantes DIAS, PACTO, CIERRE e NUDOS continuam exportadas e continuam em
 * PORTUGUES: sao avaliadas no import, e o idioma so chega depois, por
 * setIdiomaMadre(). Quem desenha chama as FUNCOES — getDia(n), pacto(),
 * cierre(), nudos().
 *
 * NAO ATRAVESSAM a traducao: `dia` (numero dado, e a chave do par), `espeja` (id
 * de pergunta de datos/preguntas.js), `marco` e `id` dos nos (fato contavel e
 * chave tecnica), e os dois aliases derivados. O marcador {fecha} de
 * CIERRE.conEspejo sobrevive IDENTICO nos tres idiomas — traduzi-lo quebraria a
 * interpolacao em silencio.
 * ================================================================================= */
const DIAS_POR_IDIOMA = { es: ES.DIAS, en: EN.DIAS };
const PACTO_POR_IDIOMA = { es: { pacto: ES.PACTO }, en: { pacto: EN.PACTO } };
const CIERRE_POR_IDIOMA = { es: { cierre: ES.CIERRE }, en: { cierre: EN.CIERRE } };
const NUDOS_POR_IDIOMA = { es: ES.NUDOS, en: EN.NUDOS };

/** Os sete dias, na ordem, no idioma ativo. */
export function dias() {
  return DIAS.map((d) => getDia(d.dia));
}

/** O PACTO no idioma ativo. */
export function pacto() {
  return traduzido(PACTO, PACTO_POR_IDIOMA, 'pacto');
}

/** As duas molduras do dia 7 no idioma ativo. */
export function cierre() {
  return traduzido(CIERRE, CIERRE_POR_IDIOMA, 'cierre');
}

/**
 * Os quatro nos no idioma ativo. So o `rotulo` troca: `id` e `marco` sao chave
 * tecnica e fato contavel, e e por `marco` que lib/ritual.js decide qual no
 * caiu. O rotulo e FATO CONTAVEL em todo idioma — noites, nada mais: nao existe
 * "Libre", nao existe "Healed".
 */
export function nudos() {
  const dict = NUDOS_POR_IDIOMA[idiomaMadre()];
  if (!dict) return NUDOS;
  return Object.freeze(
    NUDOS.map((n) => (dict[n.id] ? Object.freeze({ ...n, rotulo: dict[n.id] }) : n))
  );
}

/* Os dois nomes alternativos do mesmo contrato, para o motor e as telas que
 * foram escritos em paralelo com este arquivo. Sao a MESMA referencia, nao uma
 * copia: RITUAL_DIAS === DIAS e diaPorNumero === getDia. */
export const RITUAL_DIAS = DIAS;
export const diaPorNumero = getDia;

export default RITUAL;
