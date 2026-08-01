// lib/traducoes/waiteRegras.pt.js
// O PACK PORTUGUÊS das quatro regras de prática de Waite — TODA prosa que o
// usuário lê antes de tirar mora aqui. O motor (a ordem, os ids, a datação, a
// contagem de palavras) fica em lib/waiteRegras.js. Os packs irmãos
// (waiteRegras.es.js, waiteRegras.en.js) repetem exatamente esta FORMA:
// mesmas chaves, mesmos campos, funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/waiteRegras.js valem para cada string
// daqui. As duas que mais se erram nesta feature:
//
//   · PRENDE PRIMEIRO. `chamada` é a vida real da pessoa nesta cadeira — a
//     conversa que não começou, a conta de sexta, a mãe. Waite, "1911" e "§8"
//     só podem aparecer em `recibo`. O teste reprova o contrário.
//   · AS QUATRO NÃO VÃO ENTRE ASPAS. Esta base não tem o inglês literal delas
//     (só a frase do embaralho, em VERBATIM). Por isso todo `recibo` RELATA
//     o que Waite escreveu, sem aspas. Pôr aspas aqui é inventar citação.

// ---------------------------------------------------------------------------
// O TÍTULO E A ABERTURA
// ---------------------------------------------------------------------------
// Três parágrafos: o primeiro é só vida real (a mão no celular, o botão), o
// segundo entrega a fonte, o terceiro data o baralho que a tela vai sortear.
const TITULO = 'Quatro coisas antes de tirar';

const ABERTURA =
  'Dá pra tocar no botão agora e ter três cartas na tela em dois segundos. Essa parte é sorteio. ' +
  'O que vira leitura são quatro coisas pequenas, feitas antes, nesta cadeira, com o celular na mão: ' +
  'dizer a pergunta em voz alta, embaralhar sem ir respondendo por dentro, admitir qual resposta você queria, ' +
  'e ler como se as cartas fossem de outra pessoa. As quatro juntas levam menos de um minuto.' +
  '\n\n' +
  'Nenhuma delas é ideia do app. É a lista de notas de prática que A. E. Waite anexou ao próprio livro, ' +
  'The Pictorial Key to the Tarot, 1911, na Parte III §8 — quatro itens, nesta ordem.' +
  '\n\n' +
  'Waite é quem encomendou a Pamela Colman Smith o baralho que você está prestes a tirar: as cartas saíram em Londres, ' +
  'por William Rider & Son, em dezembro de 1909, e o livro veio dois anos depois para explicá-las. ' +
  'As regras e o baralho são da mesma mão, com dois anos de diferença.';

// ---------------------------------------------------------------------------
// AS QUATRO REGRAS
// ---------------------------------------------------------------------------
// Cada uma tem quatro blocos, sempre nesta ordem:
//   chamada      — a vida real. Sem nome próprio, sem ano, sem capítulo.
//   oQueVoceFaz  — o gesto, agora, nesta cadeira. É o que vira retenção.
//   porQue       — o motivo, ainda em língua de conversa.
//   recibo       — obra, autor, ano, parte. A fonte chega por último.
// `oQueVoceFaz` e `porQue` são funções porque a quarta regra muda conforme a
// leitura seja sua ou de outra pessoa; as outras três recebem o contexto e o
// ignoram, para que a forma seja idêntica nas quatro.
const REGRAS = {
  pergunta: {
    titulo: 'Diga a pergunta em voz alta',
    chamada:
      'A pergunta que sobe primeiro quase nunca é uma pergunta só. É o cara que não respondeu ontem, a conta que vence sexta e a sua mãe perguntando quando é que isso se resolve — tudo no mesmo pensamento. ' +
      'Misturadas assim, três perguntas aceitam qualquer carta como resposta, porque sempre serve pra alguma delas.',
    oQueVoceFaz: () =>
      'Escolha uma. Escreva ela no campo aqui em cima e depois fale ela, com a boca, no volume de quem conversa com alguém na sala. Dá vergonha na primeira vez. É a regra inteira.',
    porQue: () =>
      'Falar termina a frase. Pergunta pensada fica pela metade e se molda ao que vier; pergunta dita tem começo, meio e fim, e você escuta na hora o quanto ela estava vaga.',
    recibo:
      'Primeira das quatro notas de prática de A. E. Waite em The Pictorial Key to the Tarot, 1911, Parte III §8: formular a pergunta definidamente e repeti-la em voz alta antes de começar.',
  },
  embaralhar: {
    titulo: 'Embaralhe com a cabeça vazia',
    chamada:
      'Este é o pedaço que ninguém faz. Enquanto a mão embaralha, a cabeça já vai montando o veredito: se vier carta boa é sinal de ficar, se vier carta ruim eu termino no domingo. ' +
      'Nesse ponto o baralho virou plateia.',
    oQueVoceFaz: () =>
      'Enquanto as cartas se misturam na tela, conte até vinte olhando pra elas e não responda nada por dentro. Se o pensamento pular pra resposta, volta pro um. São vinte segundos, o tempo da animação — e os vinte são conta nossa, não dele.',
    porQue: () =>
      'Não é mística, é ordem das operações. Quem já respondeu antes de virar a carta não lê a carta: confere se ela concorda.',
    recibo:
      'Segunda nota de prática de A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8: manter a mente o mais em branco possível enquanto embaralha. ' +
      'E o embaralhar dele tem uma segunda metade que quase ninguém cita — no mesmo parágrafo ele manda virar parte das cartas de cabeça pra baixo antes de misturar. ' +
      'É daí que sai a carta invertida: do método alternativo dele, e não da Cruz Celta do mesmo livro, que não menciona invertida nenhuma. ' +
      'O significado invertido carta a carta é mais velho que Waite e vem de Etteilla, a partir de 1770.',
  },
  vies: {
    titulo: 'Diga qual resposta você queria',
    chamada:
      'É raro alguém abrir um baralho sem estar torcendo por um lado. Você quer que diga pra ficar, ou pra sair, ou que a culpa não foi sua. ' +
      'O problema nunca é a torcida — é a torcida entrando disfarçada de leitura.',
    oQueVoceFaz: () =>
      'Antes de tirar, complete esta frase em voz alta: eu queria que a carta dissesse ____. Com todas as letras, sem enfeitar, uma vez só.',
    porQue: () =>
      'Torcida com nome continua ali, mas fica visível. Depois disso a mesa tem duas coisas separadas: o que a carta traz e o que você queria que ela trouxesse.',
    recibo:
      'Terceira nota de prática de A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8: pôr de lado o viés pessoal e as ideias preconcebidas, ou o julgamento sai tingido por elas.',
  },
  estranho: {
    titulo: 'Leia como se fosse de outra pessoa',
    chamada:
      'A leitura mais difícil que existe é a sua. Pra uma amiga você resolve em dois minutos: enxerga o desenho inteiro, fala sem medo, acerta o tom. ' +
      'Na sua, você está dentro do desenho — e de dentro não dá pra ver a forma.',
    oQueVoceFaz: (c) =>
      c.paraQuem === 'outra'
        ? 'Você caiu no caso fácil: a leitura é de outra pessoa. Use a vantagem e não corte o que soar antipático — o corte para não magoar é o viés da regra três, só que de gravata.'
        : 'Quando as três cartas aparecerem, diga em voz alta o que você diria pra uma amiga que tirou exatamente essas cartas na exata situação sua. Depois repare no que você ia dizer pra si mesmo. A distância entre as duas frases é o tamanho do viés de hoje.',
    porQue: (c) =>
      c.paraQuem === 'outra'
        ? 'Quanto mais perto a vida em jogo, menor a distância para enxergar. Estranho, amigo, você mesmo: é essa a ordem de dificuldade na fonte, e lendo para outra pessoa você está no degrau mais fácil.'
        : 'Quanto mais perto a vida em jogo, menor a distância para enxergar. Estranho, amigo, você mesmo: é essa a ordem de dificuldade na fonte, e você está no degrau mais alto dela.',
    recibo:
      'Quarta nota de prática de A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8: por causa do viés, é mais fácil adivinhar corretamente para um estranho do que para si mesmo ou para um amigo. ' +
      'E vale dizer o que isso implica aqui dentro: na maior parte do tempo este app faz justamente o caso que Waite chama de mais difícil — você lendo para você. ' +
      'A regra não desqualifica a leitura; ela diz onde ficar atento. O truque de falar como se fosse para uma amiga é do app: Waite constata a dificuldade e não ensina saída.',
  },
};

// ---------------------------------------------------------------------------
// A CITAÇÃO — verbatim, sem tradução, a única deste módulo
// ---------------------------------------------------------------------------
// `texto` é o inglês do Pictorial Key e é IDÊNTICO nos três packs. O que muda
// por idioma é a `parafrase` — assinada pelo app, nunca entre aspas — e a
// língua do `locus`.
const VERBATIM = {
  embaralhar: {
    texto: 'Shuffle the entire pack and turn some of the cards round, so as to invert their tops.',
    parafrase:
      'Embaralhe o baralho inteiro e vire algumas cartas ao contrário, de modo a inverter o topo delas. É a primeira linha do método alternativo — e é o endereço exato de onde a carta invertida entra na prática.',
    locus: 'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8',
  },
};

// ---------------------------------------------------------------------------
// A PRIMEIRA REGRA, COM CAMPO DE TEXTO
// ---------------------------------------------------------------------------
// A avaliação é do TEXTO digitado, nunca da vida de quem digitou, e diz isso
// com todas as letras onde o critério é do app.
const PERGUNTA = {
  rotulo: 'Sua pergunta',
  ajuda: 'Uma pergunta só, escrita do jeito que você falaria.',
  exemplos: [
    'O que está me segurando nessa conversa que eu não começo?',
    'O que eu não estou vendo nesse trabalho novo?',
    'De que é feito o meu medo de ligar pra minha mãe?',
  ],
  avaliacao: {
    vazia:
      'Ainda não tem pergunta escrita. Dá pra tirar assim mesmo, o app não tranca nada — mas a primeira nota de 1911 é exatamente esta: uma pergunta formulada, não um assunto solto.',
    curta:
      'Está curta. Isto é leitura do app e não regra de Waite: abaixo de quatro palavras costuma sobrar assunto e faltar pergunta. Diga o que você quer saber, sobre quem, e desde quando.',
    duasPerguntas:
      'Tem mais de uma pergunta aí dentro. Escolha uma para esta tiragem e guarde a outra — a nota de 1911 pede uma pergunta formulada, no singular.',
    definida:
      'Uma pergunta, com começo e fim. Agora a parte que dá vergonha, e que é a regra inteira: diga ela em voz alta, uma vez.',
  },
  emVozAlta:
    'Em voz alta mesmo. A nota de 1911 manda repetir a pergunta em voz alta antes de começar, e é a única das quatro que tem som.',
};

// ---------------------------------------------------------------------------
// O ESTADO DAS QUATRO
// ---------------------------------------------------------------------------
const PROGRESSO = {
  nenhuma:
    'Nenhuma das quatro ainda. Juntas levam menos de um minuto, e não trancam nada: o botão de tirar continua onde está.',
  parcial: (c) => `${c.feitas} de ${c.total} feitas. A próxima é: ${c.proxima}.`,
  completo: 'As quatro feitas. A lista é de 1911 e coube num minuto de hoje. Pode tirar.',
};

const BOTAO = {
  antes: 'Tirar as três cartas',
  depois: 'Fiz as quatro — tirar as cartas',
};

// ---------------------------------------------------------------------------
// A DATAÇÃO — a nota de cada fonte que esta tela cita
// ---------------------------------------------------------------------------
const GRAUS = { FP: 'fonte primária', TP: 'tradição posterior' };

const NOTAS_DE_DATACAO = {
  pictorialKey: 'O livro onde estão as quatro notas de prática, e de onde sai tudo o que esta tela diz.',
  baralhoRWS:
    'O baralho que a tela sorteia. Arte de Pamela Colman Smith, conceito e estrutura de A. E. Waite, publicado em Londres por William Rider & Son — dois anos antes do livro.',
  etteilla:
    'Quem instituiu significado invertido carta a carta. Toda leitura de carta invertida no mundo desce daí, e é anterior a Waite.',
  cruzCelta:
    'A tiragem de dez cartas que Waite batizou de método celta antigo, no mesmo livro. O nome é dele, de 1911; a estrutura vem dos círculos da Golden Dawn. E ela não menciona carta invertida em momento nenhum.',
};

// ---------------------------------------------------------------------------
// AS RESSALVAS QUE ANDAM JUNTO COM O PREPARO
// ---------------------------------------------------------------------------
const NOTA_SEM_TRANCA =
  'O app não tranca o botão, e isso é decisão nossa em cima da fonte: Waite chamou os quatro itens de notas de prática, não de condições. Quem quiser tirar direto, tira.';

const NOTA_LEITURA_DO_APP =
  'O que é de Waite e o que é do app. As quatro regras são dele, de 1911, e estão aqui na ordem em que ele as escreveu; o jeito de contar em português de hoje é nosso. ' +
  'Duas medidas também são nossas, e estão declaradas onde aparecem: os vinte segundos do embaralho (ele pede a mente em branco e não dá duração) e as quatro palavras mínimas da pergunta (ele pede a pergunta definida e não diz como se mede isso). ' +
  'E há uma diferença maior, que é melhor dizer do que esconder: a tiragem de três cartas com passado, presente e futuro não está no The Pictorial Key. ' +
  'O livro descreve três métodos — de dez, de quarenta e duas e de trinta e cinco cartas — e nenhum é esse. ' +
  'As quatro regras de preparo servem para qualquer tiragem; a de três é escolha nossa, popularizada no séc. XX, e desta base não saiu fonte datada anterior a isso.';

// ---------------------------------------------------------------------------
// O CHROME DA TELA — os rótulos que a vitrine precisa e o motor não devolve
// ---------------------------------------------------------------------------
// Escrito em 01/08/2026, quando screens/TarotScreen.js finalmente ligou este
// módulo. A regra da casa: o chrome da tela sai do pack do próprio módulo,
// nunca de lib/i18n.js, e o componente não redige uma linha. Se faltar palavra
// na tela, ela nasce AQUI e nos dois packs irmãos, com as mesmas chaves.
//
// `convite` e `conviteLinha` são o cartão FECHADO — o que a pessoa lê antes de
// decidir abrir. Por isso valem para eles as mesmas duas regras do resto:
// PRENDE PRIMEIRO (nada de Waite, ano ou capítulo nessa altura; a fonte inteira
// está a um toque de distância, dentro) e nada de tranca — o texto diz, na
// própria isca, que o botão de tirar continua onde estava.
//
// `contando` carrega o único molde desta feature: `{s}`, os segundos que faltam.
// O antigo `tela` era só o nome da tela e virou `nome` aqui dentro; nenhum
// consumidor lia a string solta.
const TELA = {
  nome: 'Tarô por Tema',
  convite: 'Quatro coisas antes de tirar',
  conviteLinha:
    'O que separa um sorteio de uma leitura acontece agora, nesta cadeira, antes de o dedo tocar no botão. ' +
    'São quatro gestos pequenos, levam menos de um minuto juntos, e não trancam nada: o botão de tirar continua ali embaixo.',
  abrir: 'Ver as quatro',
  fechar: 'Fechar',
  pular: 'Fechar e tirar direto',
  paraQuemRotulo: 'Esta leitura é',
  paraQuemVoce: 'Para mim',
  paraQuemOutra: 'Para outra pessoa',
  rotuloGesto: 'O QUE FAZER AGORA',
  rotuloPorQue: 'POR QUÊ',
  rotuloRecibo: 'DE ONDE ISSO VEM',
  rotuloExemplos: 'Exemplos de pergunta',
  contar: 'Contar os vinte segundos',
  contando: 'Contando… faltam {s}',
  contada: 'Vinte segundos contados',
  marcar: 'Marcar como feita',
  marcada: 'Feita',
  rotuloVerbatim: 'A frase, no inglês do livro',
  rotuloDatacao: 'As datas desta tela',
  rotuloFontes: 'Fontes',
  verFontes: 'Ver as fontes',
  ocultarFontes: 'Ocultar as fontes',
};

// ---------------------------------------------------------------------------
// A BIBLIOGRAFIA
// ---------------------------------------------------------------------------
const FONTES = [
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8 — as quatro notas de prática: pergunta formulada e repetida em voz alta, mente o mais em branco possível ao embaralhar, viés pessoal posto de lado, e a leitura para um estranho como caso mais fácil',
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §8 — "Shuffle the entire pack and turn some of the cards round, so as to invert their tops": a instrução de inverter cartas está no método alternativo dele',
  'A. E. Waite, The Pictorial Key to the Tarot, 1911, Parte III §7 — a Cruz Celta, dez cartas, e nenhuma linha sobre carta invertida',
  'Pamela Colman Smith (arte) e A. E. Waite (conceito), baralho publicado por William Rider & Son, Londres, dezembro de 1909 — dois anos antes do livro',
  'Etteilla, a partir de 1770 — o significado invertido sistemático, carta a carta, que é anterior a Waite',
  'Cartomancia francesa dos séc. XVIII–XIX, passé, présent, avenir — a ideia de dividir a leitura em três tempos, que o app usa e que o Pictorial Key não traz',
];

export const PACK = {
  idioma: 'pt',
  tela: TELA,
  titulo: TITULO,
  abertura: ABERTURA,
  regras: REGRAS,
  verbatim: VERBATIM,
  pergunta: PERGUNTA,
  progresso: PROGRESSO,
  botao: BOTAO,
  graus: GRAUS,
  notasDeDatacao: NOTAS_DE_DATACAO,
  notaSemTranca: NOTA_SEM_TRANCA,
  notaLeituraDoApp: NOTA_LEITURA_DO_APP,
  fontes: FONTES,
};

export default PACK;
