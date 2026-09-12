// datos/lunacoes.js
// OS TREZE TEMAS DO ARCO — a tabela de conteudo do ano. Sem motor, sem disco,
// sem tela. O tom da SEMANA mora em datos/fases.js; aqui mora o tema da
// LUNACAO. Comentarios em portugues, como em datos/ritual.js e lib/ceu.js.
//
// ===========================================================================
// TREZE, E POR QUE O NUMERO NAO E ARREDONDADO
// ===========================================================================
// O mes sinodico mede 29,530588 dias em media (varia de ~29,27 a ~29,83). Doze
// lunacoes somam 354,37 dias; treze somam 383,90; o ano tropico tem 365,2422.
// A lua e o calendario NAO fecham juntos e nunca fecharam — e essa defasagem de
// ~11 dias que produz o ciclo metonico (19 anos = 235 lunacoes).
//
// TRES CONSEQUENCIAS DE PROJETO, e as tres sao boas:
//  1. O tema e contado por LUNACAO, nunca por data. O tema 13 abre por volta do
//     dia 355 e fecha por volta do dia 384 — FORA do ano civil.
//  2. Na segunda passada os blocos (tema, fase) caem em datas diferentes das da
//     primeira, deslocados ~11 dias. Nenhuma data de calendario recebe duas
//     vezes a mesma configuracao.
//  3. NAO EXISTE ANIVERSARIO. Comemorar "um ano, a mesma lua voltou" na data
//     civil de instalacao e FABRICAR CEU: nessa data a lua esta ~11 dias
//     adiantada em relacao ao ponto de partida. Se um dia o app quiser marco de
//     volta completa, o marco e a 13a lua nova MEDIDA, com data — ou nao existe.
//
// ===========================================================================
// A REGRA ANTI-CULPA QUE E ESTRUTURAL, NAO REDACIONAL
// ===========================================================================
// O tema sai da LUA, nunca da assiduidade. Se ele avancasse por dias
// registrados, sumir tres semanas atrasaria o ano inteiro e o retorno viria com
// fatura. Aqui a lua seguiu sem ninguem: quem volta no dia 200 encontra o tema
// do dia 200, sem cobranca e sem recuperacao de atrasados. O retorno e MUDO,
// igual a lib/hilo.js. Sumir um dia e sumir trinta dao o mesmo resumo.
//
// E NAO EXISTE CONTADOR DE ANO. Nada de "ano 3% completo", nada de "faltam 4
// lunacoes para", nada de "voce perdeu 12 dias". Vale a doutrina de NUDOS em
// datos/ritual.js: so FATO CONTAVEL — noites, lunacoes fechadas —, nunca
// percentual e nunca ausencia contabilizada.
//
// ===========================================================================
// O ARCO SERVE AOS DOIS DESFECHOS, E NAO TORCE POR NENHUM
// ===========================================================================
// O app nao sabe se essa pessoa volta, e nao vota. Todo texto daqui tem de
// continuar legivel nos dois cenarios — e por isso nenhuma abertura e nenhum
// fecho promete, cobra ou conclui sobre a vida de quem esta lendo.
//
// TRES ARMADILHAS ESPECIFICAS, ja mapeadas:
//  · "Treze meses" soa a duracao de tratamento, e quem chega no dia 1 le como
//    prazo. O app anuncia a FORMA (treze temas, a lua fechando voltas, o espelho
//    no fim) e NUNCA o resultado. Nenhum tema e "etapa"; todo tema e PERGUNTA.
//  · A lunacao 6 (o tamanho da parte) e o ponto exato onde este arco pode ferir.
//    Simetria obrigatoria em cada texto: nem a historia inteira, nem nada.
//  · A lunacao 8 (raiva) nao prescreve estado. "Este mes nao" e resposta
//    legitima em TODO tema, e nenhum tema exige emocao para ser cumprido.
//
// ===========================================================================
// O FORMATO DE UMA LUNACAO (todos os campos obrigatorios)
// ===========================================================================
//   numero   — 1..13. O numero e DADO; nenhum nome escreve "Mes 3".
//   nome     — 3 a 5 palavras. Sem promessa, sem numero, sem verbo no futuro.
//   pergunta — a que a lunacao INTEIRA responde. E dela que saem as perguntas
//              do dia; ela nunca vira afirmacao nossa.
//   abertura — 2 frases, aparecem na LUA NOVA (fase 1 de datos/fases.js).
//   fecho    — 2 frases, aparecem na MINGUANTE (fase 4). Constata o que ficou
//              escrito e nao conclui nada sobre a vida de ninguem.
//   foco     — o que muda no PLANO DO DIA durante essa lunacao. E o campo que
//              lib/plano.js consome; os outros quatro sao texto de tela.
//   bloco    — o agrupamento do arco (ver ARCO, abaixo).
//
// ===========================================================================
// O QUE SE REPETE NO ANO 2, E COMO ISSO SE RESOLVE
// ===========================================================================
// Carta, ritual e orientacao saem de aritmetica de dia e nao repetem em 365
// dias. O que repete sao estes TREZE TEMAS, na mesma ordem — e isso nao se
// resolve com combinatoria, resolve-se com conteudo, em duas camadas:
//   (a) um segundo conjunto de textos por tema, escolhido pela contagem de
//       lunacoes desde a instalacao, para que a lunacao 14 nao abra com o texto
//       da lunacao 1;
//   (b) a que vale o produto: na segunda passada, cada tema CITA de volta,
//       VERBATIM e com a data, o que foi escrito naquele mesmo tema na primeira
//       passada. E o espelho do dia 7 de datos/ritual.js em escala de ano, e
//       esse conteudo nao precisa ser escrito — e dela.
// A camada (b) e a unica coisa no app que fica melhor no ano 2 do que no ano 1,
// e nao custa uma linha de texto novo. A camada (a) ainda nao existe neste
// arquivo: quando existir, entra como campo irmao de `abertura` e `fecho`, e
// NAO como um segundo array de treze itens que pode dessincronizar do primeiro.
//
// ===========================================================================
// INTEGRACAO — A CHAVE QUE ESTE ARQUIVO NAO CRIA
// ===========================================================================
// Nada aqui grava nada: e tabela congelada, pura, sem storage e sem React.
// Mas o que ELA escreve por lunacao E gravado por quem consumir este arquivo, e
// e o dado mais sensivel do app. Toda chave nova entra em CLAVES_HILO_ROJO
// (screens/AjustesScreen.js) NO MESMO COMMIT — senao sobrevive ao "Apagar tudo"
// e a politica de privacidade vira declaracao falsa numa ficha de loja.
// ===========================================================================

const congelar = (obj) => {
  Object.keys(obj).forEach((k) => {
    const v = obj[k];
    if (v && typeof v === 'object' && !Object.isFrozen(v)) congelar(v);
  });
  return Object.freeze(obj);
};

/* =================================================================================
 * O ARCO — os agrupamentos, e o que cada um compra.
 *
 * A ORDEM E A DECISAO, e ela nao e cosmetica. As mesmas treze perguntas em
 * ordem diferente sao outro produto: "qual foi a sua parte" perguntada no mes 2
 * e uma maquina de culpa (ela responde "foi tudo eu" e o app assina embaixo);
 * perguntada no mes 6, ja tem contrapeso escrito nos meses 3 e 5.
 * ================================================================================= */
export const ARCO = congelar({
  chao: {
    id: 'chao',
    nome: 'O chão',
    lunacoes: [1, 2, 3],
    porque:
      'O terreno: o que aconteceu, como é o dia agora, e o que já era seu antes. Tudo que se nomeia aqui continua verdade nos dois desfechos possíveis.',
  },
  laco: {
    id: 'laco',
    nome: 'O laço',
    lunacoes: [4, 5, 6],
    porque:
      'O custo diário: o impulso com horário, a ruminação, e o tamanho da parte. É o bloco que mais precisa de contrapeso, e ele vem do bloco anterior.',
  },
  alargamento: {
    id: 'alargamento',
    nome: 'O alargamento',
    lunacoes: [7, 8, 9],
    porque:
      'A metade exata do arco, onde o foco sai do vínculo: quem mais existe, o que ficou sem ser dito, e o que se quer sem citar ninguém.',
  },
  capacidade: {
    id: 'capacidade',
    nome: 'A capacidade',
    lunacoes: [10, 11],
    porque:
      'Confiança como capacidade geral e limite dito nos dois sentidos. São as duas lunações mais escorregadias do ano: as duas convidam ao "prepare-se para a conversa", e as duas recusam.',
  },
  fechamento: {
    id: 'fechamento',
    nome: 'O fechamento',
    lunacoes: [12, 13],
    porque:
      'Arquivo e devolução. Separar o arquivo (12) do fechamento (13) impede que o último mês faça as duas coisas ao mesmo tempo e acabe virando veredito.',
  },
});

/* =================================================================================
 * AS TREZE LUNACOES
 * ================================================================================= */
const LUNACOES_BASE = [
  /* --- 1 -------------------------------------------------------------------------
   * NOMEAR. Primeira posicao porque e o unico momento em que nao existe
   * historico dentro do app — e porque e a linha que todo o resto cita de volta.
   * Repete de proposito o dia 1 de datos/ritual.js: o deposito que sustenta o
   * espelho. La o espelho e de sete dias; aqui e de treze lunacoes.
   *
   * A abertura ja anuncia o retorno, como no ritual: retorno marcado antes e
   * promessa cumprida depois, em vez de surpresa feita com o texto dela. */
  {
    numero: 1,
    bloco: 'chao',
    nome: 'Nomear o que foi',
    pergunta: 'O que aconteceu, dito com as suas palavras e sem arrumar a frase?',
    abertura:
      'Esta lunação começa pelo começo: o que aconteceu, escrito por você, do jeito que sair. Não precisa ficar bonito nem fazer sentido para mais ninguém — fica neste aparelho.',
    fecho:
      'O que você escreveu nesta lunação ficou guardado com a data. Quando a lua fechar a volta, ele volta para você exatamente como está.',
    foco: 'O plano do dia abre espaço para escrever e a pergunta puxa para o registro, nunca para a interpretação. Nada é resumido nem comentado pelo app.',
  },

  /* --- 2 -------------------------------------------------------------------------
   * A ROTINA. Segunda posicao porque perguntar isto ANTES de nomear soa a
   * desvio ("vamos falar da sua rotina"), e perguntar no mes 6 e tarde: ate la
   * ja existe uma rotina de esperar. O problema imediato tem 24 horas de
   * comprimento — nao e a historia, e a terca-feira. */
  {
    numero: 2,
    bloco: 'chao',
    nome: 'A rotina que sobrou',
    pergunta: 'Como é um dia seu agora, do acordar até apagar a luz?',
    abertura:
      'Depois de nomear o que foi, sobra uma coisa de vinte e quatro horas de comprimento: a terça-feira. Esta lunação olha para a forma do seu dia, não para a história.',
    fecho:
      'O dia tem uma forma, e ela ficou descrita com as suas palavras. O que você faz com essa forma continua sendo escolha sua.',
    foco: 'Os gestos do dia ficam ancorados em hora e lugar concretos — o café, o trajeto, a hora de deitar. É o único terreno onde gesto pequeno cabe.',
  },

  /* --- 3 -------------------------------------------------------------------------
   * O QUE JA ERA MEU. Fecha o chao. So funciona depois do mes 2, porque o
   * material da resposta e concreto (o cafe, o caminho, a musica, a amizade) e
   * nao conceitual. Vindo cedo, protege o arco inteiro: tudo que se nomeia aqui
   * continua verdade nos dois desfechos, e vira o estoque de onde o app tira
   * gesto quando a lunacao ficar dura. */
  {
    numero: 3,
    bloco: 'chao',
    nome: 'O que já era meu',
    pergunta: 'O que era seu antes desse vínculo e continua sendo seu?',
    abertura:
      'Esta lunação pede coisas concretas e não conceitos: o café, o caminho, a música, a amizade. O material vem do mês que passou, que já está anotado aqui.',
    fecho:
      'O que entrou nesta lista continua sendo seu de qualquer maneira. Ela fica guardada, e é dela que o app tira gesto quando um dia ficar duro.',
    foco: 'O gesto do dia passa a sair da lista que você escreveu, em vez de vir pronto do app.',
  },

  /* --- 4 -------------------------------------------------------------------------
   * A VONTADE TEM HORA. Abre o laco, e e o dia 3 de datos/ritual.js esticado em
   * ~29 dias. Primeira lunacao que toca no impulso — nunca antes: no mes 1 o
   * impulso ainda e a unica coisa que ela tem, e mapea-lo cedo demais e o app
   * pedindo contencao antes de ter oferecido qualquer coisa em troca.
   *
   * Aqui a vontade nao e regra nem proibicao: e DADO COM HORARIO, coisa que ela
   * confere sozinha. Nenhuma consequencia e descrita, porque nao existe nenhuma. */
  {
    numero: 4,
    bloco: 'laco',
    nome: 'A vontade tem hora',
    pergunta: 'A que horas a vontade de dizer alguma coisa aperta em você?',
    abertura:
      'A vontade de dizer alguma coisa costuma ter horário, e cada pessoa tem o seu. Esta lunação não pede contenção: pede que você repare qual é o seu.',
    fecho:
      'A vontade tem hora, e agora essa hora está anotada. O que você faz com ela continua sendo escolha sua.',
    foco: 'O dia ganha um campo com horário: a frase inteira cabe ali, do jeito que ela veio e com a hora em que veio.',
  },

  /* --- 5 -------------------------------------------------------------------------
   * SEI OU SUPONHO. O coracao do laco, e o dia 4 do ritual em escala de mes. A
   * ruminacao e o custo diario real do quarto e do quinto mes, quando a novidade
   * da dor passou e sobrou a reconstrucao mental.
   *
   * E a lunacao em que o app repete, sem eufemismo, o proprio limite: nenhuma
   * carta le essa pessoa. Dito no mes 5 isso e honestidade; dito no mes 1 seria
   * um app se desqualificando antes de ter servido para alguma coisa. */
  {
    numero: 5,
    bloco: 'laco',
    nome: 'Sei ou suponho',
    pergunta: 'Onde termina o que você sabe e começa o que você reconstrói de cabeça?',
    abertura:
      'Nenhuma carta lê essa pessoa, e este aparelho também não. O que dá para fazer é separar o que você sabe do que você vem supondo.',
    fecho:
      'Ficou anotado o que é sabido e o que é suposto, lado a lado e com a data. Nada aqui diz qual dos dois é maior.',
    foco: 'A pergunta do dia passa a pedir a marcação em duas colunas: isto eu sei, isto eu suponho.',
  },

  /* --- 6 -------------------------------------------------------------------------
   * O TAMANHO DA PARTE. O eixo do arco, e a posicao e a decisao mais delicada de
   * toda a estrutura. Nos meses 1 a 3 esta pergunta e maquina de culpa; no mes 6
   * tem contrapeso, porque ja existe o que era dela antes (3) e ja existe a
   * separacao entre saber e supor (5).
   *
   * SIMETRIA OBRIGATORIA em cada texto desta lunacao: nem a historia inteira,
   * nem nada. Nenhuma pergunta daqui pode ser respondida so com uma acusacao a
   * si mesma sem que o app ofereca a outra metade NA MESMA TELA. */
  {
    numero: 6,
    bloco: 'laco',
    nome: 'O tamanho da parte',
    pergunta: 'Qual foi a sua parte, dita sem aumentar e sem diminuir?',
    abertura:
      'A sua parte não é a história inteira, e também não é nada. Esta lunação pede o tamanho dela, com as duas metades na mesma tela.',
    fecho:
      'Nem a história inteira, nem nada: o que ficou escrito foi o tamanho. Ele fica guardado e é seu para revisar quando quiser.',
    foco: 'Toda tela desta lunação traz as duas metades juntas — o que foi seu e o que não foi. Nenhum campo aceita só uma delas.',
  },

  /* --- 7 -------------------------------------------------------------------------
   * OS OUTROS FIOS. Abre o alargamento, e e a primeira lunacao inteira em que a
   * outra pessoa nao e o assunto. Setima posicao porque e a metade exata do arco
   * e porque tirar o foco antes disso seria o app mudando de assunto na cara
   * dela.
   *
   * O QUE ESTA LUNACAO NAO E: nao e "faca amizades novas para superar". E
   * inventario do que JA EXISTE. */
  {
    numero: 7,
    bloco: 'alargamento',
    nome: 'Os outros fios',
    pergunta: 'Quem mais está na sua vida, e há quanto tempo você não olha para isso?',
    abertura:
      'Esta lunação inteira não é sobre essa pessoa: é inventário do que já existe. A irmã, o colega, a vizinha, o grupo que ficou parado em março.',
    fecho:
      'A lista é do tamanho que ela é e não precisa crescer. Ela fica guardada, com a data.',
    foco: 'O gesto do dia pode envolver alguém da lista que você escreveu — e nunca essa pessoa.',
  },

  /* --- 8 -------------------------------------------------------------------------
   * A RAIVA NAO DITA. Deliberadamente tarde. Raiva pedida no mes 2 e roteiro de
   * despeito e vira gesto de contato disfarcado; raiva no mes 8, com sete
   * lunacoes de registro atras, e informacao sobre o que ela nao aceita mais.
   * Vem depois de "os outros fios" porque olhar para fora primeiro tira desta
   * lunacao o ar de camara fechada.
   *
   * REGRA DURA: nenhum gesto sai do aparelho, e o app NUNCA sugere que dizer a
   * raiva a alguem resolve alguma coisa. E o tema tem de aceitar "este mes nao":
   * "este mes e de raiva" lido por quem nao esta com raiva vira "estou sentindo
   * errado". */
  {
    numero: 8,
    bloco: 'alargamento',
    nome: 'A raiva não dita',
    pergunta: 'O que ficou sem ser dito do lado da raiva?',
    abertura:
      'Esta lunação abre um lugar para o que ficou sem ser dito do lado da raiva. Não estar com raiva neste mês é resposta legítima, e o dia continua igual.',
    fecho:
      'O que você escreveu aqui não saiu deste aparelho e não vai sair. Ficou escrito, e escrever não é a mesma coisa que resolver.',
    foco: 'A escrita do dia é fechada: nada desta lunação tem botão de enviar, compartilhar ou copiar.',
  },

  /* --- 9 -------------------------------------------------------------------------
   * O QUE EU QUERO. A dobradica que faz o arco inteiro servir aos dois
   * desfechos. Separa "eu quero essa pessoa de volta" de "eu quero isto que eu
   * tinha" sem dizer qual das duas e a certa — o app nao sabe e nao vota.
   *
   * Nona posicao porque exige o mes 8 antes: enquanto a raiva esta sem nome,
   * tudo que se quer sai formulado contra alguem. Depois desta lunacao, todo
   * desejo escrito continua legivel nos dois cenarios. */
  {
    numero: 9,
    bloco: 'alargamento',
    nome: 'O que eu quero',
    pergunta: 'O que você quer, dito sem citar ninguém?',
    abertura:
      'A regra desta lunação é uma só: escrever o que você quer sem citar ninguém. O app não sabe o que você deveria querer, e não vota.',
    fecho:
      'O que ficou escrito continua legível de qualquer maneira, porque não depende de ninguém para ser lido. Fica guardado, com a data.',
    foco: 'A pergunta do dia é sempre formulada sem citar terceiros, e o pedido é que a resposta também seja.',
  },

  /* --- 10 ------------------------------------------------------------------------
   * CONFIAR DE NOVO. Abre a capacidade, e e a lunacao mais escorregadia do ano.
   * A FORMULACAO E O QUE A SALVA: "em quem for" — obrigatoria em cada texto, nao
   * so no titulo.
   *
   * Confianca tratada como capacidade GERAL serve para uma reconciliacao e serve
   * para qualquer vinculo futuro; tratada como preparacao para uma conversa
   * especifica, vira ensaio de um encontro que o app nao pode prometer. Decima
   * posicao porque so depois do mes 9 existe o que colocar na lista de condicoes. */
  {
    numero: 10,
    bloco: 'capacidade',
    nome: 'Confiar de novo',
    pergunta: 'O que você precisaria para confiar de novo — em quem for?',
    abertura:
      'A formulação desta lunação é "em quem for", e ela vale em todo dia daqui até a próxima lua nova. Confiança aqui é capacidade geral, não preparação para uma conversa específica.',
    fecho:
      'A lista de condições é sua e ficou anotada. Ela serve para qualquer vínculo, e não tem prazo.',
    foco: 'Todo gesto do dia é completável hoje e sozinho. Nenhum é ensaio de conversa, e a formulação "em quem for" aparece em cada tela.',
  },

  /* --- 11 ------------------------------------------------------------------------
   * O QUE SE DIZ. O limite, dito nos DOIS sentidos. Se essa pessoa esta por
   * perto, e a conversa; se nao esta, e a carta que nao se envia e continua
   * tendo valor. Consequencia direta do mes 10: quem sabe o que precisa para
   * confiar sabe o que precisa dizer.
   *
   * E a ultima lunacao de conteudo NOVO — as duas seguintes trabalham com
   * material que ela mesma produziu. */
  {
    numero: 11,
    bloco: 'capacidade',
    nome: 'O que se diz',
    pergunta: 'O que você diria, e o que fica sendo só seu?',
    abertura:
      'Esta lunação trabalha os dois lados do limite: o que se diz e o que fica sendo só seu. A carta que não se envia conta igual.',
    fecho:
      'Ficou escrito dos dois lados, e nada disto saiu do aparelho. É a última lunação de material novo: as duas seguintes trabalham com o que você já escreveu.',
    foco: 'A tela do dia tem dois campos lado a lado — o que sairia da boca e o que fica guardado. Nenhum dos dois tem botão de enviar.',
  },

  /* --- 12 ------------------------------------------------------------------------
   * O ANO POR DENTRO. A lunacao do arquivo. O app NAO resume, NAO compara e NAO
   * conclui: ele abre o que ela escreveu, por lunacao, com as datas, e pergunta.
   * Aqui o app e INDICE, nao interprete.
   *
   * Penultima posicao porque precisa das onze anteriores como material — e
   * porque separar o arquivo (12) do fechamento (13) impede que o ultimo mes
   * faca as duas coisas ao mesmo tempo e acabe virando veredito. */
  {
    numero: 12,
    bloco: 'fechamento',
    nome: 'O ano por dentro',
    pergunta: 'O que este ano guardou de você, na sua letra?',
    abertura:
      'Esta lunação é arquivo. O app abre o que você escreveu, lunação por lunação, com as datas, e não resume nada.',
    fecho:
      'O que você leu foi escrito por você, com data ao lado. Aqui o app é índice, não intérprete.',
    foco: 'O plano do dia troca a pergunta nova pela releitura de uma entrada antiga, na ordem das lunações. Nenhuma entrada vem comentada.',
  },

  /* --- 13 ------------------------------------------------------------------------
   * A MESMA LUA. O fechamento que nao fecha nada por ela. Devolve a linha da
   * lunacao 1 VERBATIM e com a data — mesmo mecanismo do dia 7 de
   * datos/ritual.js, em escala de ano — e entrega um FATO MEDIDO no lugar de uma
   * conclusao: doze lunacoes sao 354 dias, treze sao 384, e o ano civil tem 365.
   * A lua e o calendario nao fecham juntos.
   *
   * O TEXTO DIZ "ESTA FECHANDO", E NAO "FECHOU", e a diferenca nao e de estilo.
   * A abertura entra na LUA NOVA que abre a decima terceira lunacao, e nesse
   * instante so DOZE lunacoes se fecharam. A volta de treze fecha na lua nova
   * SEGUINTE — que e ANIVERSARIO_LUNAR em lib/ano.js, `lunacaoAbsoluta === 14`.
   * Escrever "a lua fechou uma volta" na abertura punha o app afirmando por um
   * mes inteiro uma medida que ele mesmo desmente no fim do arquivo: fabricar
   * ceu justamente no tema que existe para entregar fato medido no lugar de
   * conclusao.
   *
   * O arco termina numa PERGUNTA que so ela responde, e a resposta define por
   * onde a segunda volta comeca. Nem "supere e siga" nem "e essa pessoa
   * apareceu": o mes 13 nao sabe e nao torce. */
  {
    numero: 13,
    bloco: 'fechamento',
    nome: 'A mesma lua',
    pergunta: 'A lua está fechando uma volta. Qual pergunta você quer abrir na próxima?',
    abertura:
      'Esta é a décima terceira lunação, e é ela que fecha a volta. Doze lunações somam 354 dias, treze somam 384 e o ano civil tem 365: a lua e o calendário não fecham juntos, e nunca fecharam.',
    fecho:
      'A linha da primeira lunação está aqui, com a data, do jeito que você a deixou. A pergunta da próxima volta é sua para escrever.',
    foco: 'O dia devolve verbatim a primeira entrada da lunação 1, com a data, e pede uma pergunta — nunca uma conclusão.',
  },
];

/**
 * LUNACOES — os treze temas, congelados. A ordem do array e a ordem do arco:
 * indice 0 e a lunacao 1.
 */
export const LUNACOES = congelar(LUNACOES_BASE);

/**
 * A lunacao pelo numero (1 a 13).
 *
 * Devolve undefined fora do intervalo — nunca lanca. Tambem devolve undefined
 * para '3' e para 3.5, mesma regra de getDia em datos/ritual.js: um tema que nao
 * existe tem de aparecer como AUSENCIA, nunca como um tema errado com cara de
 * certo. Um erro de indice que devolvesse a lunacao 6 no lugar da 3 poria "qual
 * foi a sua parte" na frente de quem esta no terceiro mes — que e exatamente o
 * caso que a ordem deste arco existe para evitar.
 */
export function lunacaoPorNumero(n) {
  return LUNACOES.find((l) => l.numero === n);
}

/** As lunacoes de um bloco do ARCO, na ordem. Array vazio para bloco desconhecido. */
export function lunacoesDoBloco(bloco) {
  return LUNACOES.filter((l) => l.bloco === bloco);
}

/** 13. Ninguem digita o numero na tela nem no motor. */
export const TOTAL_LUNACOES = LUNACOES.length;

/* =================================================================================
 * NUMEROS DO CICLO — medida, nao doutrina.
 *
 * Estao aqui porque a lunacao 13 os CITA na tela, e um numero citado tem de vir
 * de um lugar so. Se um texto do app contradisser um destes, o texto esta errado.
 *
 * Nenhum deles autoriza estimar fase: quem mede a lua e lib/ceu.js, e sem
 * efemeride o app fica CALADO sobre a lua. "Mes sinodico medio" nao e permissao
 * para dividir o ano em treze fatias iguais e chamar isso de lunacao.
 * ================================================================================= */
export const CICLO = congelar({
  mesSinodicoMedio: 29.530588,
  mesSinodicoMinimo: 29.27,
  mesSinodicoMaximo: 29.83,
  dozeLunacoes: 354.37,
  trezeLunacoes: 383.9,
  anoTropico: 365.2422,
  cicloMetonicoAnos: 19,
  cicloMetonicoLunacoes: 235,
  nota:
    'O mês sinódico varia; nenhum destes números vira calendário fixo. A defasagem de ~11 dias entre doze lunações e o ano civil é o motivo de o tema ser contado por lunação medida, nunca por data.',
});

export const ANO = congelar({
  id: 'trezeLunacoes',
  duracao: TOTAL_LUNACOES,
  ARCO,
  LUNACOES,
  CICLO,
});

export default ANO;
