// datos/lecturas.js
// OS DOIS CATALOGOS DAS LEITURAS: as figuras da borra e as linhas da mao.
// Tabela de conteudo pura — sem motor, sem disco, sem tela. Comentarios em
// portugues, como em datos/rituais.js, datos/ritual.js e datos/preguntas.js.
//
// ===========================================================================
// O QUE ESTE ARQUIVO E, E O QUE ELE NAO E
// ===========================================================================
// Ele NAO e um dicionario de simbolos que decide o que a pessoa viu. E o
// contrario disso: quem olha a xicara e a propria palma e ELA, quem escolhe a
// figura e ELA, e o que este arquivo faz e dizer o que a tradicao registra
// sobre aquela forma — com obra, autor e quando — e devolver uma pergunta.
//
// A decisao esta escrita em docs/RITUAL-DA-XICARA.md, secao 2, e ela nasceu de
// um limite tecnico virado desenho: o Fio Vermelho nao tem servidor de visao, e
// fingir que um modelo "le" borra de cafe seria a mentira mais cara possivel
// neste nicho. A saida e melhor que a analise automatica — escolher e
// participar; receber e assistir — e ela funciona offline, para sempre, sem
// custo por leitura.
//
// ===========================================================================
// O FORMATO DE UMA ENTRADA (os dois catalogos usam o mesmo)
// ===========================================================================
//   id           — chave tecnica, sem acento, nunca visivel.
//   nome         — como ela se chama na tela.
//   comoE        — COMO RECONHECER a forma. Descricao visual, nada mais: e o
//                  campo que permite escolher sem ter estudado nada.
//   leitura      — o que a TRADICAO registra sobre aquela forma, e onde a
//                  tradicao vai longe demais, o texto diz que ela vai. Nunca
//                  um desfecho, nunca uma frase sobre outra pessoa.
//   pergunta     — o que fica com ela. Toda leitura termina em pergunta, nunca
//                  em veredito: o app organiza a tradicao e devolve o assunto.
//   fonte        — { obra, autor, quando, nota } quando ha tradicao datavel, ou
//                  null. A `nota` diz o que a fonte NAO sustenta.
//   naoTemFonte  — string declarando a ausencia, OBRIGATORIA quando fonte e
//                  null. Ausencia declarada e diferente de ausencia escondida.
//
// ===========================================================================
// O RECIBO — a parte mais importante deste arquivo
// ===========================================================================
// A mentira comum destes catalogos nao e inventar a fonte: e deixar a fonte
// parecer sustentar mais do que sustenta ("os antigos ja sabiam que..."). Tres
// das oito figuras da borra NAO estao nos manuais, e as tres dizem isso em voz
// alta em vez de pegar emprestada uma obra que nao fala delas:
//
//   · o NO e a figura da propria casa (o fio, o nudo) e nao vem de manual nenhum;
//   · o MURO nao foi localizado nas listas consultadas;
//   · o PONTO existe nos manuais, mas com OUTRO assunto (dinheiro) — e usar a
//     fonte antiga para falar de outra coisa e usa-la como enfeite.
//
// O mesmo rigor vale para a mao, e la a linha mais sensivel e a da vida: varios
// manuais a leem como medida de quanto tempo alguem vive. Isso nao tem apoio
// nenhum, o texto recusa a leitura na cara, e NENHUMA entrada deste arquivo
// afirma coisa alguma sobre corpo, sintoma ou tempo de vida de quem quer que
// seja. O modelo de catalogo datado bem feito e o lib/artemidoro.js do app
// irmao: datacao por entrada, loci precisos, e a ausencia declarada.
//
// ===========================================================================
// AS TRES LINHAS QUE NENHUM TEXTO DAQUI ATRAVESSA
// ===========================================================================
//  1. NENHUM CEU FABRICADO. Este arquivo nao fala de lua, de transito nem de
//     dia astrologico — nao ha nada aqui para estimar, entao nao ha como
//     estimar errado. Quem cruza gesto com ceu e lib/plano.js, e la o ceu ou
//     existe (efemeride) ou o bloco nao renderiza.
//  2. NENHUM DESFECHO PROMETIDO. Nenhuma figura anuncia o que vai acontecer, e
//     nenhuma diz o que outra pessoa sente, pensa ou fara. Os manuais dizem —
//     o anel e "casamento", o passaro e "noticia que chega" —, e por isso o
//     texto de cada entrada ATRIBUI a leitura ao manual e recusa a promessa em
//     seguida. Citar o que a tradicao diz nao e afirmar que e verdade.
//  3. NENHUM EMPURRAO PARA O CONTATO. Nenhuma pergunta daqui manda procurar,
//     escrever, ligar ou aparecer. Duas das cinco respostas da pergunta 4 do
//     onboarding sao 'le-escribi-no-responde' e 'cero-contacto'
//     (IDS_CONTACTO_DURO em datos/preguntas.js): para quem respondeu qualquer
//     uma delas, uma pergunta de contato e o app empurrando a pessoa para o
//     lugar mais doloroso que ela tem. Por construcao nao ha nada aqui para
//     filtrar — todas as doze perguntas sao sobre ELA.
//
// E valem as gerais que test/copy-promessa-app-inteiro.test.js cobra: sem prova social inventada,
// sem alegacao de saude, sem assumir genero de quem esta do outro lado, sem
// punir falta, sem cor literal fora do theme.js.
//
// ===========================================================================
// OS TRES IDIOMAS (12/09/2026)
// ===========================================================================
// O PT mora AQUI e nao se move: e a fonte da verdade (ordem, ids, contagem) e e
// o que os testes de doutrina varrem. ES e EN moram em vizinhos —
// datos/lecturas.es.js e datos/lecturas.en.js —, um mapa por id com SO o texto
// visivel. Quem costura e datos/traduzir.js, na hora da chamada.
//
// QUEM DESENHA CHAMA FUNCAO, NAO CONSTANTE: figurasDaBorra(), linhasDaMao(),
// tradicaoDaBorra(), tradicaoDaMao(), getFigura(id), getLinea(id). As constantes
// FIGURAS_BORRA / LINEAS_MANO continuam exportadas e continuam em PORTUGUES —
// elas sao avaliadas no import, e o idioma so chega depois, por setIdiomaMadre().
// Ver o bloco OS TRES IDIOMAS no fim do arquivo.
//
// O QUE NAO ATRAVESSA A TRADUCAO, por construcao: `id` (chave tecnica — id
// trocado = dado do disco orfao, sem erro nenhum) e `obra`/`autor`/`quando`, que
// sao CITACAO REAL. Heron-Allen, Cicely Kent e Benham escreveram livros que
// existem; traduzir o titulo faria a citacao apontar para um livro que nao
// existe. A `nota` DE DENTRO da fonte, sim, se traduz: ela e prosa da Madre
// sobre o que a obra NAO sustenta, e e a linha mais importante do recibo.
//
// ===========================================================================
// DISCO: NADA. Este arquivo nao cria chave de armazenamento nenhuma, e as duas
// telas que o consomem tambem nao (screens/RitualCafeScreen.js e
// screens/RitualMaoScreen.js gravam so o no do dia, por lib/hilo.js, que ja
// tem a chave 'hilo' na lista). Por isso nao ha nada a acrescentar em
// CLAVES_HILO_ROJO (screens/AjustesScreen.js). No dia em que alguem quiser
// guardar "a figura que ela escolheu" — que e o fio do mes de
// docs/RITUAL-DA-XICARA.md, secao 4 —, a chave nova entra NAQUELA lista antes
// de qualquer outra coisa, senao ela sobrevive ao "Apagar tudo" e a politica de
// privacidade da ficha de loja vira declaracao falsa.
// ===========================================================================

import * as EN from './lecturas.en.js';
import * as ES from './lecturas.es.js';
import { traduzido } from './traduzir.js';

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * DE QUANDO E ISTO — a datacao da PRATICA, mostrada uma vez por tela, acima das
 * figuras. Ela existe para a pessoa saber o tamanho real do que esta usando
 * antes de escolher, e nao depois. Repare que as duas dizem a mesma coisa
 * incomoda: o repertorio que circula hoje e NOVO, e nao antigo.
 * ================================================================================= */

export const TRADICION_BORRA = congelar({
  titulo: 'De quando é isto',
  texto:
    'Ler o que a borra deixa na xícara é prática velha e espalhada, e ela chega à Europa junto com o café, no século XVII. O repertório de figuras que circula hoje é bem mais novo: foi organizado em manuais ingleses do começo do século XX, e é de lá que sai quase tudo o que se lê por aí.',
  fonte: {
    obra: 'Telling Fortunes by Tea Leaves',
    autor: 'Cicely Kent',
    quando: 'Londres, 1922',
    nota: 'É um dos manuais que fixaram esse repertório. Ele descreve figuras; ele não afirma, em nenhum ponto, que uma figura informe o que outra pessoa está pensando ou fazendo.',
  },
});

export const TRADICION_MANO = congelar({
  titulo: 'De quando é isto',
  texto:
    'Olhar as linhas da mão é prática antiga e aparece em lugares muito distantes uns dos outros. Mas o sistema que os manuais usam hoje — os nomes das linhas, os montes, os tipos de mão — foi organizado na Europa entre 1840 e 1900. É recente, e vale saber disso antes de ler qualquer coisa.',
  fonte: {
    obra: 'A Manual of Cheirosophy',
    autor: 'Edward Heron-Allen',
    quando: 'Londres, 1885',
    nota: 'O tratado atribuído a Aristóteles que esses manuais costumam citar como origem não está entre as obras dele. E nada disto fala do corpo de ninguém: não substitui exame médico e não é usado aqui para dizer nada sobre saúde.',
  },
});

/* =================================================================================
 * AS OITO FIGURAS DA BORRA
 *
 * A ordem aqui e a de leitura humana, e ela e a ordem da tela — diferente de
 * datos/rituais.js, onde a ordem do catalogo nao pode virar ordem de exibicao
 * porque um motor sorteia. Aqui nao ha sorteio nenhum: quem escolhe e ela, e a
 * lista inteira fica visivel de uma vez. As cinco com fonte vem primeiro, as
 * tres sem fonte depois — nao por hierarquia, mas porque a tela mostra o bloco
 * "sem fonte antiga" junto e agrupar evita a impressao de que a marca some.
 * ================================================================================= */
const FIGURAS_BASE = [
  {
    id: 'anel',
    nome: 'Um anel',
    comoE: 'Uma volta fechada, ou quase fechada, em qualquer parte da xícara.',
    leitura:
      'Nos manuais o anel é a figura do que se fecha: uma linha que dá a volta inteira e encosta no próprio começo. Eles leem isso como casamento. Aqui ele não anuncia nada sobre ninguém — é uma forma fechada, e foi ela que puxou o seu olho hoje.',
    pergunta:
      'O que na sua última semana já deu a volta inteira e chegou de novo no ponto de partida?',
    fonte: {
      obra: 'Telling Fortunes by Tea Leaves',
      autor: 'Cicely Kent',
      quando: 'Londres, 1922',
      nota: 'O anel está no repertório inglês que os manuais do começo do século XX organizaram. Kent o lê como casamento; esta leitura não faz isso, e nenhuma figura daqui afirma coisa alguma sobre outra pessoa.',
    },
    naoTemFonte: null,
  },

  {
    id: 'passaro',
    nome: 'Um pássaro',
    comoE: 'Um corpo pequeno com duas linhas abrindo para os lados, como asas.',
    leitura:
      'O pássaro é uma das figuras mais repetidas do repertório, e os manuais o leem como notícia que chega de longe. O que dá para dizer sem inventar é o que a forma é: uma coisa pequena, de asas abertas, parada no meio da borra. Notícia nenhuma está escrita numa xícara.',
    pergunta: 'Qual assunto seu ficou parado à espera de algo que não está na sua mão?',
    fonte: {
      obra: 'Telling Fortunes by Tea Leaves',
      autor: 'Cicely Kent',
      quando: 'Londres, 1922',
      nota: 'A leitura de notícia é do manual, não deste app. Ela é citada aqui como o que a tradição registra — citar o que a tradição diz não é afirmar que aquilo acontece.',
    },
    naoTemFonte: null,
  },

  {
    id: 'caminho',
    nome: 'Um caminho',
    comoE: 'Uma linha comprida, reta ou ondulada, atravessando a borra.',
    leitura:
      'Linhas compridas são, nos manuais, figura de viagem: quanto mais reta, mais direto o percurso; quanto mais ondulada, mais desvio. É descrição de forma, e é só isso que ela entrega. Onde essa linha começa e onde ela termina são coisas que só você sabe olhar.',
    pergunta: 'Se essa linha fosse o seu último mês, em que ponto dela você está agora?',
    fonte: {
      obra: 'Telling Fortunes by Tea Leaves',
      autor: 'Cicely Kent',
      quando: 'Londres, 1922',
      nota: 'Linhas como percurso é das partes mais estáveis do repertório inglês. O manual descreve o traço; ele não marca data nem destino, e este texto também não.',
    },
    naoTemFonte: null,
  },

  {
    id: 'ponte',
    nome: 'Uma ponte',
    comoE: 'Duas margens e um traço curto ligando as duas.',
    leitura:
      'A ponte está nas listas inglesas de figuras, lida como passagem de um lado para o outro. O que ela mostra é a estrutura: existem duas margens, e existe alguma coisa curta no meio. A ponte não diz quem atravessa, nem em que dia.',
    pergunta:
      'Quais são as duas margens do seu assunto de hoje — a de onde você saiu e a que você está olhando?',
    fonte: {
      obra: 'Telling Fortunes by Tea Leaves',
      autor: 'Cicely Kent',
      quando: 'Londres, 1922',
      nota: 'A ponte aparece no repertório como passagem. O manual não nomeia quem passa nem quando — e onde ele silencia, este texto silencia junto.',
    },
    naoTemFonte: null,
  },

  {
    id: 'escada',
    nome: 'Uma escada',
    comoE: 'Duas linhas paralelas com traços curtos atravessando entre elas.',
    leitura:
      'A escada está no repertório dos manuais, lida como subida por etapas. A forma é literal: degraus, um acima do outro, nenhum pulado. Ela descreve o jeito de subir — não a altura de chegada, que nenhuma borra sabe.',
    pergunta: 'Qual é o degrau imediatamente à sua frente: o próximo, não o último?',
    fonte: {
      obra: 'Telling Fortunes by Tea Leaves',
      autor: 'Cicely Kent',
      quando: 'Londres, 1922',
      nota: 'A escada é do repertório inglês. O manual fala de etapas; ele não promete o topo, e a pergunta daqui pede de propósito o degrau seguinte.',
    },
    naoTemFonte: null,
  },

  {
    id: 'no',
    nome: 'Um nó',
    comoE: 'Um ponto onde duas ou mais linhas se cruzam e o desenho engrossa.',
    leitura:
      'O nó não vem dos manuais: é a figura da própria casa. Numa borra ele aparece como engrossamento, um pedaço mais escuro onde os traços se juntam e param de correr. É o mesmo desenho que dá nome ao seu fio aqui dentro.',
    pergunta: 'Qual é o assunto que, quando você chega nele, faz o resto parar?',
    fonte: null,
    naoTemFonte:
      'O nó não foi localizado nas listas de figuras de borra: ele é a figura deste app, não da tradição. Entra aqui como forma, e por isso não tem obra nem autor a citar — inventar um seria pior que não ter nenhum.',
  },

  {
    id: 'muro',
    nome: 'Um muro',
    comoE: 'Uma faixa escura contínua, sem abertura, cortando a xícara.',
    leitura:
      'O muro não está nas listas antigas. Ele entrou aqui porque é o que muita gente enxerga primeiro numa borra fechada: uma faixa sem passagem. É uma forma que interrompe — e reparar nela já diz alguma coisa sobre onde o seu olho foi parar hoje.',
    pergunta: 'O que hoje você está tratando como intransponível, e com que régua você mediu isso?',
    fonte: null,
    naoTemFonte:
      'O muro não foi localizado nos manuais de borra consultados. É figura contemporânea, e está declarada como tal em vez de ganhar emprestada uma obra que não fala dela.',
  },

  {
    id: 'ponto',
    nome: 'Um ponto sozinho',
    comoE: 'Uma marca única, separada, longe do resto do desenho.',
    leitura:
      'Pontos existem nos manuais de borra, mas com outro assunto: eles são lidos como dinheiro. Este app não usa essa leitura. Aqui o ponto é o que ele parece — uma marca sozinha, que ficou fora do resto do desenho e mesmo assim está lá.',
    pergunta: 'O que na sua vida ficou desse jeito: separado do resto, e ainda assim ali?',
    fonte: null,
    naoTemFonte:
      'O ponto aparece nos manuais ingleses com outro sentido (dinheiro), então esta leitura não se apoia neles. Ela é contemporânea, e emprestar a obra antiga para falar de outra coisa seria usá-la como enfeite.',
  },
];

/* =================================================================================
 * AS QUATRO LINHAS DA MAO
 *
 * Sem camera, e a ausencia dela e o desenho, nao um limite: foto de mao e dado
 * biometrico numa ficha de loja, e o gesto nao fica melhor por causa dela (o
 * mesmo raciocinio ja escrito em datos/rituais.js, no bloco A CAMERA).
 *
 * O campo `onde` faz aqui o papel que `comoE` faz na borra: ele permite achar a
 * linha sem ter estudado nada. E ele e literalmente anatomico — "sob a base dos
 * dedos", "contornando o polegar" —, porque descrever posicao e o unico jeito
 * de a pessoa escolher a linha certa sem o app olhar a mao dela.
 * ================================================================================= */
const LINEAS_BASE = [
  {
    id: 'corazon',
    nome: 'A linha do coração',
    comoE: 'A mais alta das três grandes: ela corre na horizontal, logo abaixo da base dos dedos.',
    leitura:
      'Os manuais europeus do século XIX batizaram essa linha de "do coração" e leram nela o registro da vida afetiva. O que dá para conferir olhando é a forma: onde ela nasce, se corre inteira ou se parte no meio, e onde ela termina. O nome é do manual; o desenho é seu, e ele já estava aí antes de qualquer leitura.',
    pergunta:
      'Percorra ela até o fim com o dedo. Em que ponto ela muda — e o que você estava lembrando quando chegou nesse ponto?',
    fonte: {
      obra: 'A Manual of Cheirosophy',
      autor: 'Edward Heron-Allen',
      quando: 'Londres, 1885',
      nota: 'O nome e a leitura afetiva desta linha vêm da sistematização europeia do século XIX. Nada aqui afirma o que outra pessoa sente, e nada aqui fala do seu corpo.',
    },
    naoTemFonte: null,
  },

  {
    id: 'cabeza',
    nome: 'A linha da cabeça',
    comoE: 'A do meio: ela sai perto do indicador e atravessa a palma na horizontal, abaixo da do coração.',
    leitura:
      'Os manuais leem nesta linha o modo de pensar — reta seria o jeito prático, curvada para baixo seria o jeito imaginativo. A parte verificável é só o traço: quanto ela atravessa, se ela cai no fim, se ela encosta na linha da vida no começo. A régua é do manual, e ela é de 1900.',
    pergunta:
      'Ela é reta ou cai no fim? Descreva o traço em uma frase, sem tirar nenhuma conclusão sobre você.',
    fonte: {
      obra: 'The Laws of Scientific Hand Reading',
      autor: 'William G. Benham',
      quando: 'Nova York, 1900',
      nota: 'Benham montou o sistema mais detalhado da escola europeia e o chamou de científico; ele não é. É um esquema de classificação de formas — útil para olhar, sem valor de prova sobre ninguém.',
    },
    naoTemFonte: null,
  },

  {
    id: 'vida',
    nome: 'A linha da vida',
    comoE: 'O arco que contorna a base do polegar, do meio da palma até o pulso.',
    leitura:
      'É a linha onde os manuais mais erram: vários deles a leem como medida de quanto tempo alguém vive. Isso não tem apoio nenhum, e este app não repete. O que dá para olhar é o arco — quanto ele abre em direção ao centro da palma e por onde ele passa. É um desenho, e desenho não é prognóstico de coisa nenhuma.',
    pergunta:
      'O arco dela é largo ou fechado? Diga isso em uma frase, e pare aí: a frase não precisa de conclusão.',
    fonte: {
      obra: 'A Manual of Cheirosophy',
      autor: 'Edward Heron-Allen',
      quando: 'Londres, 1885',
      nota: 'A leitura de tempo de vida circula desde os manuais do século XIX e é recusada aqui na cara. Nenhuma linha da mão informa sobre o corpo de ninguém, e nada disto substitui exame médico.',
    },
    naoTemFonte: null,
  },

  {
    id: 'destino',
    nome: 'A linha do destino',
    comoE: 'A vertical que sobe pelo meio da palma na direção do dedo do meio. Muita mão não tem nenhuma.',
    leitura:
      'Os manuais do século XIX chamam esta de linha do destino e leem nela trabalho e lugar. A informação mais interessante é outra, e é dos próprios manuais: essa linha falta em muitas mãos, e a falta dela não significa nada de ruim em manual nenhum. Se você não achar uma, isso também é o desenho da sua mão.',
    pergunta:
      'Você achou uma? Se sim, de onde ela sai. Se não, o que você reparou no lugar onde ela estaria?',
    fonte: {
      obra: 'The Laws of Scientific Hand Reading',
      autor: 'William G. Benham',
      quando: 'Nova York, 1900',
      nota: 'A ausência desta linha é registrada pelos próprios manuais como comum e sem peso. Ela entra aqui por isso: é o item do catálogo que desarma a leitura em vez de reforçá-la.',
    },
    naoTemFonte: null,
  },
];

/* =================================================================================
 * O QUE AS TELAS CONSOMEM
 *
 * `temFonte` sai daqui, de uma origem so: a tela precisa escolher entre desenhar
 * o bloco da obra e desenhar o bloco "sem fonte antiga", e deixar essa decisao
 * para um `if` dentro do JSX e o jeito mais rapido de uma entrada nova nascer
 * sem nenhum dos dois blocos — que e exatamente o silencio que este arquivo
 * existe para impedir.
 * ================================================================================= */
const conDerivados = (e) => ({ ...e, temFonte: Boolean(e.fonte) });

export const FIGURAS_BORRA = congelar(FIGURAS_BASE.map(conDerivados));
export const LINEAS_MANO = congelar(LINEAS_BASE.map(conDerivados));

/** 8 e 4. Ninguem digita esses numeros na tela. */
export const TOTAL_FIGURAS = FIGURAS_BORRA.length;
export const TOTAL_LINEAS = LINEAS_MANO.length;

/** Os ids, na ordem do catalogo. */
export const IDS_FIGURAS = congelar(FIGURAS_BORRA.map((f) => f.id));
export const IDS_LINEAS = congelar(LINEAS_MANO.map((l) => l.id));

/**
 * A figura pelo id. Devolve undefined quando nao existe — nunca lanca. Um id
 * que nao existe tem de aparecer como ausencia, nunca como uma figura errada
 * com cara de certa.
 *
 * JA NO IDIOMA ATIVO (ver OS TRES IDIOMAS, abaixo): em PT devolve a entrada do
 * catalogo, sem copia; em ES/EN devolve a mesma entrada com o texto visivel
 * trocado e `fonte.obra/autor/quando` intactos.
 */
export function getFigura(id) {
  return traduzido(FIGURAS_BORRA.find((f) => f.id === id), LECTURAS_POR_IDIOMA.figuras, id);
}

/** A linha da mao pelo id. Mesma regra do getFigura. */
export function getLinea(id) {
  return traduzido(LINEAS_MANO.find((l) => l.id === id), LECTURAS_POR_IDIOMA.linhas, id);
}

/* =================================================================================
 * OS TRES IDIOMAS
 * =================================================================================
 * As duas telas de leitura mostram a LISTA INTEIRA de uma vez (quem escolhe e ela,
 * e nao ha sorteio), entao nao basta o getter por id: `figurasDaBorra()` e
 * `linhasDaMao()` sao o que a tela chama.
 *
 * Por que FUNCAO e nao constante: `FIGURAS_BORRA` e avaliada uma vez, no import, e
 * o idioma so chega depois, por setIdiomaMadre(). Funcao le o idioma NA HORA DA
 * CHAMADA — a mesma escolha que t() faz em datos/textos.js, e pelo mesmo motivo:
 * t() e importado no escopo de modulo em 47 arquivos, metade deles logica pura
 * testada em node:test sem React, e hook mataria essas suites.
 *
 * `FIGURAS_BORRA` e `LINEAS_MANO` continuam exportados e continuam em PORTUGUES:
 * eles sao a fonte da verdade do catalogo (ordem, ids, contagem) e e o que os
 * testes de doutrina varrem. Quem desenha chama as funcoes.
 *
 * Import ESTATICO dos dois vizinhos, como datos/textos.js faz com textos.es.js: o
 * Metro precisa ver as tres pontas em tempo de build, e um `await import()` aqui
 * tornaria sincrono em assincrono dentro de um render.
 * ================================================================================= */

export const LECTURAS_POR_IDIOMA = {
  figuras: { es: ES.FIGURAS_BORRA, en: EN.FIGURAS_BORRA },
  linhas: { es: ES.LINEAS_MANO, en: EN.LINEAS_MANO },
  /* As duas molduras de datacao nao tem id: elas sao uma so, por tela. O `id`
   * sintetico abaixo existe so para a fusao achar o par. */
  borra: { es: { tradicao: ES.TRADICION_BORRA }, en: { tradicao: EN.TRADICION_BORRA } },
  mano: { es: { tradicao: ES.TRADICION_MANO }, en: { tradicao: EN.TRADICION_MANO } },
};

/** As oito figuras, na ordem do catalogo, no idioma ativo. */
export function figurasDaBorra() {
  return FIGURAS_BORRA.map((f) => traduzido(f, LECTURAS_POR_IDIOMA.figuras, f.id));
}

/** As quatro linhas, na ordem do catalogo, no idioma ativo. */
export function linhasDaMao() {
  return LINEAS_MANO.map((l) => traduzido(l, LECTURAS_POR_IDIOMA.linhas, l.id));
}

/** A moldura "de quando e isto" da borra, no idioma ativo. */
export function tradicaoDaBorra() {
  return traduzido(TRADICION_BORRA, LECTURAS_POR_IDIOMA.borra, 'tradicao');
}

/** A moldura "de quando e isto" da mao, no idioma ativo. */
export function tradicaoDaMao() {
  return traduzido(TRADICION_MANO, LECTURAS_POR_IDIOMA.mano, 'tradicao');
}

export default {
  TRADICION_BORRA,
  TRADICION_MANO,
  FIGURAS_BORRA,
  LINEAS_MANO,
  getFigura,
  getLinea,
  figurasDaBorra,
  linhasDaMao,
  tradicaoDaBorra,
  tradicaoDaMao,
};
