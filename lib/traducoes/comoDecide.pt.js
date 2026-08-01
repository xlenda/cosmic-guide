// lib/traducoes/comoDecide.pt.js
// O PACK PORTUGUÊS do card "Como este app decide" — TODA prosa que o usuário
// lê mora aqui. O motor (a lista de features, as fontes canônicas, a montagem
// e a amarração com lib/traducoes/datacao.js) fica em lib/comoDecide.js.
// Os packs irmãos (comoDecide.es.js, comoDecide.en.js) repetem exatamente esta
// FORMA: mesmas chaves, mesmos campos, funções com a mesma assinatura.
//
// TODAS as regras do cabeçalho de lib/comoDecide.js valem para cada string
// daqui, e duas delas mordem mais nesta tela do que nas outras:
//
//   · PRENDE PRIMEIRO. Uma tela sobre método é a que mais corre risco de abrir
//     em erudição. Toda `chamada` daqui abre na cena real — a discussão de
//     signo com a amiga, a foto da mão na luz da cozinha, a pergunta das duas
//     da manhã — e o recibo vem depois.
//   · NÃO ELOGIAR O APP. Transparência que só mostra acerto é folheto. Onde o
//     app é omisso (as células de casa do Mapa Astral), o texto diz que é
//     omisso; onde a pesquisa não tem edição lida (o café, o mian xiang), o
//     texto diz isso na cara do usuário.
//
// O QUE NÃO MORA AQUI: obra, autor e data. São dados, vivem no motor em
// português canônico e passam por traduzirAutor/traduzirQuando na hora de
// montar o recibo. Escrever "Ptolomeu, Tetrabiblos I.17, séc. II" à mão dentro
// de uma string deste arquivo seria criar uma segunda verdade sobre a mesma
// fonte, e as duas divergiriam na primeira revisão.

// ---------------------------------------------------------------------------
// A MOLDURA
// ---------------------------------------------------------------------------
function lista(itens) {
  if (itens.length <= 1) return itens.join('');
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}

const ABERTURA = {
  titulo: 'Como este app decide',
  chamada:
    'Você lê que hoje não é dia de mandar aquela mensagem e, no fundo, fica a pergunta: isso saiu de onde? ' +
    'De uma conta que alguém pode conferir, ou de um texto que serve pra qualquer pessoa em qualquer terça-feira?',
  explicacao:
    'Esta tela responde, tela por tela, separando três coisas que costumam chegar misturadas.' +
    '\n\n' +
    'O que o app CALCULOU: posição de planeta, fase da Lua, instante exato. É número, dá pra conferir em qualquer efeméride, e se estiver errado está errado — não tem interpretação que salve.' +
    '\n\n' +
    'O que o app LEU: a tradição, sempre com obra, autor e século. É atribuição de gente: alguém escreveu aquilo, em algum lugar, em alguma época. Pode ser bonita e pode ser antiga, mas não é da mesma natureza que a conta.' +
    '\n\n' +
    'O que é LEITURA DO APP: o jeito de dizer isso em português de hoje, a ordem das telas, o que entra e o que fica de fora. Isso é nosso, e vai assinado.' +
    '\n\n' +
    'Quando a conta e a tradição discordam, quem manda é a fonte, e a diferença fica escrita em vez de escondida. Quando a pesquisa não achou de onde veio uma coisa, está escrito também.',
};

const ROTULOS = {
  calculado: 'O que o app calculou',
  tradicao: 'O que o app leu — e de quem',
  leituraDoApp: 'O que é escolha nossa',
  naoFaz: 'O que o app se recusa a fazer',
  convencoes: 'O que vale no app inteiro',
  decisoes: 'Tela por tela',
  fontes: 'Onde isso está escrito',
};

const EXIGENCIA = {
  rotulos: {
    data: 'sua data de nascimento',
    hora: 'sua hora de nascimento',
    cidade: 'sua cidade de nascimento',
  },
  precisa: (nomes) => `Esta conta precisa de ${lista(nomes)}.`,
  falta: (nomes) => `Falta ${lista(nomes)} para esta conta rodar. Sem isso o app mostra o que falta, não um resultado plausível.`,
  pronto: 'Com o que você já informou, esta conta roda.',
  comoResolver: 'O campo fica no Mapa Astral.',
};

// A datação chega JÁ pontuada do motor (ver reciboDaFonte): "séc. II d.C."
// já termina em ponto e "2nd c. AD" não terminaria.
const RECIBO = ({ autor, obra, quando }) => `Quem escreveu isso: ${autor}, ${obra} — ${quando}`;
const RECIBO_SEM_AUTOR = ({ obra, quando }) => `Onde isso está escrito: ${obra} — ${quando} Obra sem autor conhecido.`;
const SEM_FONTE =
  'Sem edição primária lida nesta base. A informação existe no levantamento, a fonte de primeira mão ainda não foi conferida — e enquanto não for, ela vale menos que as outras desta tela.';

// Complemento a lib/traducoes/datacao.js, que ainda não conhece estes quatro.
// A ordem é a do motor: datacao.js manda, isto aqui só preenche o que falta.
const AUTORES = {
  'Manílio': 'Manílio',
  'Artemidoro': 'Artemidoro',
  'Dião Cássio': 'Dião Cássio',
  'Aristóteles': 'Aristóteles',
};

// ---------------------------------------------------------------------------
// AS CITAÇÕES — verbatim, sem tradução
// ---------------------------------------------------------------------------
// `texto` é o inglês de Robbins (Loeb/Harvard, 1940) e de Cary (Loeb), e é
// IDÊNTICO nos três packs. O que muda por idioma é a `parafrase` — assinada
// pelo app, nunca entre aspas — e a língua do `locus`.
const VERBATIM = {
  ptolomeuZodiaco: {
    texto: 'and from no other source',
    parafrase:
      'Os começos dos signos se contam dos equinócios e dos solstícios — e de nenhuma outra origem. A frase é curta e é categórica: quem conta de outro jeito está contando outra coisa.',
    locus: 'Ptolomeu, Tetrabiblos I.22, trad. Robbins, 1940',
  },
  ptolomeuAversao: {
    texto:
      'if they are in disjunct signs or opposite signs, they produce the deepest enmities and lasting contentions',
    parafrase:
      'Signos alheios um ao outro, ou opostos, produzem as inimizades mais fundas e as brigas mais compridas. É a linha que impede o app de pôr a oposição no topo da escala — na fonte ela está no fundo, junto da aversão.',
    locus: 'Ptolomeu, Tetrabiblos IV.7, trad. Robbins, 1940',
  },
  dioCassio: {
    texto:
      'The custom, however, of referring the days to the seven stars called planets was instituted by the Egyptians, but is now found among all mankind, though its adoption has been comparatively recent',
    parafrase:
      'A própria fonte primária dos dias planetários diz que o costume é recente, e acrescenta que os gregos antigos não o conheciam. Quem chama a semana dos planetas de imemorial está contrariando o texto que cita.',
    locus: 'Dião Cássio, Historia Romana 37.18, trad. Cary',
  },
};

// ---------------------------------------------------------------------------
// AS CONVENÇÕES — o que vale no app inteiro
// ---------------------------------------------------------------------------
const CONVENCOES = {
  zodiaco: {
    nome: 'O zodíaco daqui é o trópico, contado das estações',
    chamada:
      'Um dia alguém te diz que "na verdade" você é do signo anterior, e a conversa morre em empate porque ninguém sabe de onde vem cada versão. As duas existem, as duas têm dono, e a distância entre elas é medida.',
    texto:
      'O app conta os signos a partir dos equinócios e solstícios: o ponto em que o Sol cruza o equador celeste em março abre o Áries, e dali em diante de trinta em trinta graus. Isso se chama zodíaco trópico, e a fonte é categórica sobre o ponto de partida.' +
      '\n\n' +
      'A astrologia indiana conta a partir das estrelas e corrige a precessão dos equinócios — o lento escorregar do eixo da Terra, que move o referencial cerca de um grau a cada setenta anos. Por isso, para a maior parte das pessoas, o signo védico é o anterior ao ocidental. Não é erro de ninguém: são dois pontos de partida, cada um coerente por dentro, e a diferença é astronomia conhecida. O texto que registra o encontro das duas tradições é uma tradução do grego para o sânscrito feita no séc. II.',
  },
  efemeride: {
    nome: 'A conta sai de efeméride, nunca de tabela de datas',
    chamada:
      'Quem nasceu em 23 de outubro passa a vida sendo Libra num site e Escorpião no outro. Não é briga de opinião: a fronteira entre os dois é um instante, e instante não cabe numa tabela de calendário.',
    texto:
      'O app calcula a longitude do Sol no minuto do seu nascimento e vê de que lado da fronteira ela caiu. Antes ele fazia o que quase todo mundo faz: tabela fixa de datas. Medindo o período de 1950 a 2030, aquela tabela errava 293 dias em 29.585 — e em 23 de outubro errava em 44 dos 81 anos, sempre na virada, sempre com quem mais liga para a resposta.' +
      '\n\n' +
      'A regra que ficou vale para o app inteiro: nenhuma afirmação sobre o céu sai de tabela, sai de conta. E quando a conta não roda — falta data, falta hora, falta cidade —, o app diz que não roda e diz onde informar. Céu plausível é céu inventado.',
  },
  regencias: {
    nome: 'As regências são as dos sete que se enxergam a olho nu',
    chamada:
      'Você lê aqui que quem rege Escorpião é Marte, procura na internet e acha Plutão em todo lugar. Parece que o app se enganou. É o contrário, e a data resolve a discussão em uma linha.',
    texto:
      'A tabela do app é a antiga: Marte em Áries e Escorpião, Vênus em Touro e Libra, Mercúrio em Gêmeos e Virgem, a Lua em Câncer, o Sol em Leão, Júpiter em Sagitário e Peixes, Saturno em Capricórnio e Aquário. E ela não é decorada — cada linha é deduzida da distância máxima que cada planeta pode ficar do Sol, que é coisa observável no céu.' +
      '\n\n' +
      'Urano foi descoberto em 1781, Netuno em 1846 e Plutão em 1930. As regências modernas atribuídas a eles são camada do séc. XIX e XX, e esta pesquisa não achou quem as propôs primeiro nem quando. Enquanto não achar, elas ficam fora do bloco principal — e a ausência fica escrita, que é diferente de fingir que não existem.',
  },
  casas: {
    nome: 'As casas são Casas Inteiras',
    chamada:
      'Você abre o seu mapa aqui e o da sua amiga em outro app, e metade dos planetas está em casa diferente. Ninguém errou a conta: são dois jeitos de cortar a mesma roda, e a maioria dos apps não diz qual usa.',
    texto:
      'Aqui a Casa 1 é o signo inteiro do Ascendente, de zero a trinta graus, e o signo seguinte é a Casa 2. É o sistema mais antigo que sobreviveu: um manual do séc. IV enuncia a regra doze vezes seguidas, sem margem para dúvida, e um contemporâneo dele faz a mesma conta para achar o lugar do pai. O nome em inglês, whole sign, é que é moderno — foi cunhado nos anos 1990.' +
      '\n\n' +
      'O app não usa Placidus por um motivo prático além do histórico: perto dos polos aquele sistema fica matematicamente indefinido, e o app é aberto no mundo inteiro. A diferença entre os dois foi medida em vinte mil mapas: cerca de metade dos planetas troca de casa, e praticamente todo mapa muda em pelo menos um. É por isso que a tela escreve o nome do sistema ao lado das casas.',
  },
  semNota: {
    nome: 'Não existe nota, e não vai existir',
    chamada:
      'Todo app de casal cospe um número de dois dígitos com uma barra cheia do lado. Ninguém explica de onde ele sai. A resposta é que não sai de lugar nenhum.',
    texto:
      'O app tinha isso e matou. A compatibilidade rodava com dez textos fixos para as 144 combinações possíveis, e as notas ficavam todas entre setenta e quatro e noventa e dois: todo mundo combinava com todo mundo, e a oposição — o aspecto mais duro que existe — recebia a nota mais alta da tabela. O horóscopo tinha quatro barras (amor, trabalho, dinheiro e mais uma) sorteadas pela data. Nenhum dos dois números saía de conta alguma.' +
      '\n\n' +
      'No lugar entrou o vocabulário da própria tradição: a relação entre dois signos tem nome — trígono, sextil, quadratura, oposição, aversão — e tem ordem, porque a fonte ordena as configurações em quatro degraus. Nome e ordem é o que ela dá. Número de dois dígitos ela não dá, e desenhar um lê como medida por mais legenda que se ponha embaixo.',
  },
  ia: {
    nome: 'Onde entra inteligência artificial, e o que ela não pode fazer',
    chamada:
      'Parte do que você lê aqui é escrita na hora por um modelo de linguagem: o chat, a leitura de sonho, as leituras por foto. Vale saber quando — porque muda o que dá para esperar do texto.',
    texto:
      'O céu nunca é trabalho do modelo. Quem calcula posição, fase e aspecto é o app, no seu aparelho, com efeméride. Quando a conversa toca o céu, o app manda junto um bloco com o que já calculou — seu signo, o signo da Lua de hoje, os aspectos reais entre o céu de hoje e o seu mapa — e a instrução é dura: nunca afirmar posição, casa, aspecto ou retrogradação que não esteja nesse bloco. Se o dado não está lá, o modelo pede o seu mapa em vez de preencher a lacuna.' +
      '\n\n' +
      'As outras regras que ele recebe: nada de porcentagem, de nada; nada de introduzir no sonho um símbolo que você não escreveu; nas fotos, descrever o que está visível antes de interpretar; e nada de saúde, em nenhuma circunstância. Se a frase continuar verdadeira trocando você por outra pessoa qualquer, ele tem ordem de apagar e escrever de novo.',
  },
};

// ---------------------------------------------------------------------------
// TELA POR TELA
// ---------------------------------------------------------------------------
const FEATURES = {
  horoscopo: {
    nome: 'Horóscopo do dia',
    tela: 'Horóscopo',
    chamada:
      'Você já leu aquele horóscopo que diz "sua intuição está mais afiada hoje". Serve pra você, pro seu chefe e pro seu ex, em qualquer dia do ano. O teste é simples: troque o signo e releia. Se o texto continuar servindo, ele não dizia nada.',
    textos: {
      regente:
        'Onde está hoje o planeta que rege o seu signo: em que signo ele caiu, que dignidade tem ali e se está retrógrado. Marte muda de signo a cada seis semanas — por isso o texto de Áries hoje não é o de Áries daqui a um mês.',
      lua:
        'Em que signo a Lua está agora e que relação isso faz com o seu signo. Ela troca de signo a cada dois dias e pouco, e no mesmo dia os doze signos recebem relações diferentes com a mesma Lua.',
      mudanca:
        'O que mudou de ontem para hoje: a Lua trocou de signo, o quarto lunar virou, o regente entrou ou saiu de retrógrado. Nos dias em que nada grande mudou, o texto diz que é pouco em vez de fabricar manchete.',
      domicilios:
        'Quem rege qual signo. A tabela não é decorada: cada linha é deduzida da distância máxima que aquele planeta pode ficar do Sol.',
      dignidades:
        'Exaltação e queda — e a palavra "peregrino", que é o planeta sem dignidade nenhuma no lugar onde está. É o caso mais comum de todos, e a tela não o apresenta como má notícia.',
      signoInteiro:
        'A relação entre dois signos é contada por signo inteiro, sem orbe em graus. É assim que a conta é feita na fonte, e é o que permite falar de aspecto sabendo só o signo.',
      regentePrimeiro:
        'Abrir pelo regente do seu signo, e não pelo Sol, é ordem de leitura da própria tradição — e é ela que faz Áries e Gêmeos lerem coisas diferentes no mesmo dia.',
      quartos:
        'Os quatro trechos do mês lunar, descritos como qualidades do ar: úmido, quente, seco, frio. Era descrição de clima, não de gente.',
      ordem:
        'A ordem dos blocos e o jeito de dizer isso em língua de conversa. Quando o único fato novo do dia é o planeta do dia da semana, ele desce da primeira linha — continua na tela, com o mesmo texto honesto, só não ocupa a manchete num dia em que ele próprio admite não ser manchete.',
      ancora:
        'O céu do dia é ancorado ao meio-dia, em hora universal. Sem essa âncora, a Home às onze da noite contaria uma história diferente da notificação do meio-dia, e as duas se chamariam "hoje".',
      semBarras:
        'Não dá nota. Dava: quatro barras — amor, trabalho, dinheiro e uma quarta que num app de astrologia não deveria existir nunca —, com dez conjuntos fixos de números escolhidos pela data e desenhados como se fossem medida. Não saíam de conta alguma e foram removidos, em vez de ganharem uma legenda de rodapé.',
      semCeuInventado:
        'Não afirma fase da Lua nem posição de planeta sem ter calculado. A frase pronta "a Lua minguante favoreceu o encerramento de ciclos" saía em dia de Lua crescente, com o calendário da própria casa mostrando a fase certa duas telas adiante.',
    },
  },
  mapa: {
    nome: 'Mapa Astral',
    tela: 'Mapa Astral',
    chamada:
      'Tem gente que descobre aos trinta que passou a vida se achando de um signo e é de outro. Não é falha de memória: é que o signo vira num instante, e o instante depende do ano, da hora e do lugar.',
    textos: {
      sol: 'O signo solar pela longitude real do Sol no minuto em que você nasceu — não pela faixa de datas do calendário.',
      lua: 'O signo da Lua no mesmo instante, com o fuso do lugar. Ela anda treze graus por dia, então algumas horas já mudam a resposta.',
      ascendente:
        'O Ascendente, signo e grau. Exige hora e cidade: em duas horas ele já trocou de signo, e o horizonte é diferente em cada ponto do planeta.',
      casas: 'As doze casas, uma por signo, contadas a partir do signo do Ascendente.',
      planetas:
        'Os dez planetas por longitude eclíptica, todos no mesmo referencial, e os aspectos entre eles. Sem hora, a conta é feita ao meio-dia: para os planetas lentos a aproximação é honesta, para o Ascendente e as casas não é — e por isso esses dois somem da tela em vez de sair aproximados.',
      zodiaco: 'Os signos contados dos equinócios e solstícios, que é o que faz o cálculo do signo solar ser um instante e não uma data.',
      casasInteiras:
        'A Casa 1 é o signo inteiro do Ascendente. O manual mais explícito que sobreviveu da Antiguidade enuncia essa regra doze vezes seguidas, uma por casa.',
      firmico: 'E um contemporâneo dele faz a mesma conta por outro caminho, para achar o lugar do pai no mapa: o signo em que a contagem para é o lugar, não um trecho de trinta graus qualquer.',
      domicilios: 'O planeta que rege cada signo, que é o que a tela usa para dizer de quem é a casa.',
      rotuloDoSistema:
        'A tela escreve o nome do sistema ao lado das casas. Parece detalhe de nerd, e é o que evita a conversa mais chata que existe: a de comparar dois apps sem saber que eles cortam a roda de jeitos diferentes.',
      semPlacidus:
        'Placidus fica matematicamente indefinido perto dos polos, e este app é aberto no mundo inteiro. Casas Inteiras não quebra em latitude nenhuma — e por acaso é também o sistema mais antigo.',
      semHoraSemAscendente:
        'Sem hora, o Ascendente e as casas somem da tela, com o motivo escrito. Meia hora de diferença troca o Ascendente de signo em muitos nascimentos, e chutar meio-dia aqui seria cara ou coroa.',
      casaSemSignificado:
        'As doze células dizem "Casa N — signo" e mais nada. O app ainda não tem significado de casa com fonte lida ponta a ponta, e prefere a célula seca à invenção mais comum do ramo, que é deduzir o significado da casa pelo signo correspondente.',
    },
  },
  ceu: {
    nome: 'Céu de hoje pra você',
    tela: 'Início',
    chamada:
      'Dois amigos do mesmo signo abrem o app no mesmo dia e leem coisas diferentes. É aqui que a leitura deixa de ser sobre o seu signo e passa a ser sobre o seu nascimento.',
    textos: {
      cruzamento:
        'Os dez planetas de hoje contra os dez do dia em que você nasceu, aspecto por aspecto. Nenhuma frase pronta: o que aparece na tela é o que a conta achou.',
      orbe:
        'O orbe é escalonado por velocidade: largo para a Lua, apertado para os lentos. Sem isso, um trânsito de Plutão ocupava o topo de uma tela chamada "hoje" durante meses — em quatro nascimentos testados, a mesma frase aparecia em julho, agosto e outubro.',
      tresMaisApertados: 'De tudo que a conta achou, os três aspectos mais apertados. O resto existe e fica de fora por espaço, não por conveniência.',
      quatroAspectos:
        'Os aspectos são quatro, e os ângulos saem de proporções musicais aplicadas ao semicírculo: metade, um terço, três por dois, quatro por três.',
      conjuncao:
        'E a conjunção não é um deles: dois planetas no mesmo lugar entram numa categoria à parte, a aplicação corporal. Quase todo app chama de aspecto; a fonte não chama.',
      rapidoELento:
        'Chamar trânsito rápido de notícia do dia e trânsito lento de capítulo é jeito nosso de organizar a tela. A prática faz essa distinção, mas com outras palavras — as destas duas linhas são do app.',
      semMapaSemTela:
        'Sem data de nascimento, esta tela não existe. O app não troca o seu mapa pelo "céu do seu signo" para ter o que mostrar: isso seria fabricar um nascimento que não é o seu.',
    },
  },
  taro: {
    nome: 'Tarô',
    tela: 'Tarô',
    chamada:
      'A carta que caiu não veio do céu nem do seu inconsciente: veio de um embaralhamento. Dizer isso não estraga nada — o baralho é de 1911, e a graça dele nunca foi ser antigo.',
    textos: {
      sorteio:
        'Aqui não entra céu nenhum. As 78 cartas são embaralhadas, três saem, e a orientação de cada uma — direita ou invertida — é cara ou coroa. Nenhuma posição de planeta participa da escolha, e o app não finge que participa.',
      waite:
        'O baralho é o Rider-Waite-Smith, desenhado por Pamela Colman Smith sob direção de Waite. Em onze cartas o app mostra a lista de significados dele em inglês, palavra por palavra: traduzir citação é falsificá-la.',
      goldenDawn:
        'A correspondência de cada carta com planeta, signo e decanato é a de uma ordem inglesa do fim do séc. XIX, e a tela escreve o nome dela. Não existe "a" atribuição astrológica do tarô: existem pelo menos três, incompatíveis entre si.',
      gebelin:
        'A leitura do tarô como oráculo nasce num ensaio que anunciava um livro egípcio perdido — escrito quarenta anos antes de alguém conseguir ler hieróglifo. A cartomancia com tarô tem pouco mais de dois séculos, não quatro milênios, e o próprio Waite desmente o Egito no livro dele.',
      posicoes: 'As três posições da tiragem — o que ficou, o que está, o que vem — e a decisão de mostrar sempre as três juntas.',
      textoDaCarta:
        'O texto de cada carta em português de hoje. A carta tem quatro dados que não mudam (arcano, letra, caminho, atribuição) e o resto é redação nossa, escrita para que trocar a carta mude a frase.',
      semEgito: 'O app nunca disse Egito e não vai dizer. Dizer 1781 é mais interessante, e tem a vantagem de ser verdade.',
      semFuturo: 'Não afirma o futuro. Carta sorteada não sabe o seu mês que vem, e o app não empresta a ela uma autoridade que ela não tem.',
    },
  },
  compatibilidade: {
    nome: 'Compatibilidade',
    tela: 'Compatibilidade',
    chamada:
      '"A gente briga alto e faz as pazes na mesma hora" e "a gente fica três dias sem se falar" não são o mesmo casal. Nenhum dos dois cabe num número de dois dígitos.',
    textos: {
      distancia:
        'A distância entre os dois signos na roda, contada em signos inteiros: de zero a seis. É a única conta desta tela, e é a mesma que a fonte faz — ela conta signos, não graus.',
      quatroAspectos:
        'Quatro aspectos, e só quatro: oposição, trígono, quadratura, sextil. E o critério para chamá-los de harmônicos não é o elemento, é o gênero do signo — a afinidade entre fogo e ar é consequência disso, não a causa.',
      comandantes:
        'Signos comandantes e obedientes: pares à mesma distância do ponto do equinócio. A relação tem direção — um comanda e o outro obedece —, e é a categoria que nenhum app do ramo implementa.',
      seVeem: 'Signos que se veem, ou de igual poder: pares à mesma distância do ponto do solstício. Câncer e Capricórnio não têm par aqui.',
      aversao:
        'E os signos alheios: os que não têm nenhuma das familiaridades acima, a um ou a cinco signos de distância. Conferindo par a par, são 48 das 144 combinações — um terço da tabela simplesmente não se relaciona. Nota baixa não vende, e por isso quase ninguém conta.',
      escala:
        'Na aplicação a duas pessoas, a mesma obra ordena as configurações em quatro degraus. A oposição não está no topo: está no fundo, junto da aversão — e o app antigo dava a ela a nota máxima.',
      traducaoParaCasal:
        'Traduzir "quadratura" para briga na cozinha, cama, dinheiro e ciúme é trabalho do app. O nome da relação e a ordem dos degraus são da fonte, e nenhum dos dois é invertido para a leitura ficar simpática.',
      soSignoSolar:
        'A tela compara dois signos solares e diz isso em voz alta. Sinastria de verdade compara dois mapas inteiros, com Lua, Vênus, Marte e Ascendente; um signo é uma fatia disso.',
      semNota: 'Sem porcentagem, sem nota, sem barra. Se um dia voltar um número, ele não vai poder contradizer a relação que estiver escrita ao lado.',
      semEsconderAversao:
        'E sem trocar "aversão" por um sinônimo simpático. Um terço dos pares não se olha na fonte, e essa é justamente a parte que o usuário já desconfiava sozinho.',
    },
  },
  lua: {
    nome: 'Calendário Lunar',
    tela: 'Calendário Lunar',
    chamada:
      'Você olha pela janela: a Lua está pela metade. O app diz "Quarto Crescente". A metade é fato; o nome é o lugar onde alguém decidiu cortar o ciclo — e esse alguém tem nome e data.',
    textos: {
      elongacao: 'A diferença de longitude entre a Lua e o Sol, agora, em graus. É esse número que decide a fase, e ele é conferível em qualquer efeméride.',
      instanteExato:
        'O instante exato da próxima Lua Nova e da próxima Cheia, achado por bisseção. Rótulo de fatia e instante exato são coisas diferentes: no dia da cheia, a cheia acontece numa hora específica.',
      quatroQuartos: 'A divisão antiga do mês lunar é em quatro, e as qualidades que ela descreve são de clima: umidade, calor, secura, frio.',
      hesiodo:
        'O mês contado dia a dia, do primeiro ao trigésimo, com dia bom e dia ruim para cada trabalho — isso sim é genuinamente arcaico, e é sete séculos mais velho que a astrologia de mapa natal.',
      oitoFases:
        'As oito fases com nome e leitura de personalidade são do séc. XX. A moldura de oito é boa e o app usa; ela só não é milenar, e a diferença entre as duas datas é de mil e oitocentos anos.',
      nomesDeLua:
        'Os nomes de lua cheia — Lua do Lobo, Lua do Morango — saíram de um almanaque agrícola do hemisfério norte. "Lua da Neve" em fevereiro descreve o inverno de lá; aqui fevereiro é pico de verão.',
      colheita:
        'E a fama de que a cheia é fase de colher inverte a fonte romana: o que se corta, se colhe e se tosquia é na minguante. Na cheia, o que a lavoura antiga mandava era semear fava.',
      oitoFatias:
        'Cortar o ciclo em oito fatias de quarenta e cinco graus é convenção moderna de calendário, e serve para dar nome ao que você vê no céu. O app usa e declara que usa.',
      semMilenar: 'Não chama as oito fases de milenar. A moldura milenar é a de quatro quartos, e ela está na tela ao lado, com o nome de quem a escreveu.',
      semInstrucao:
        'Não manda você fazer nada por causa da fase. Descreve o que a lavoura romana fazia, no passado, com o nome de quem escreveu — "plantavam" é registro, "plante" seria conselho.',
    },
  },
  calendario: {
    nome: 'Calendário Cósmico',
    tela: 'Calendário Cósmico',
    chamada:
      'Eclipse, retrógrado, superlua: chega tudo junto no seu feed, sempre em letra maiúscula e sem data. Aqui é ao contrário — primeiro a data e a hora, depois o nome, e a idade do nome junto.',
    textos: {
      eventos:
        'Os eventos reais do mês: as quatro fases da Lua, a entrada do Sol em cada signo (que é onde caem equinócios e solstícios), o começo e o fim da retrogradação de Mercúrio e os aspectos exatos entre os planetas rápidos.',
      bisseccao:
        'Cada instante é achado por bisseção sobre a efeméride, não copiado de lista. É por isso que o app mostra hora e minuto em vez de "por volta do dia 15".',
      ingressos: 'A entrada do Sol nos signos cardeais é o próprio ponto de partida do zodíaco trópico — não é coincidência de calendário.',
      conjuncao:
        'A conjunção aparece rotulada como aplicação corporal, e não como aspecto: na fonte os aspectos são quatro, e dois planetas no mesmo lugar não se olham, estão juntos.',
      quartos: 'E os quartos da Lua, que é a moldura antiga do mês lunar, com as qualidades de clima que ela descrevia.',
      reciboPorEvento:
        'Cada evento vem com um parágrafo em língua de conversa e o recibo logo embaixo. A ordem é sempre essa: primeiro o que é, depois quem escreveu.',
      semFonteAntiga:
        'Onde não existe fonte antiga, o texto escreve exatamente isso: prática popular contemporânea, sem fonte antiga localizada. Inventar antiguidade é o padrão de dois mil anos que este app existe para não repetir.',
      semAgenda:
        'Nenhum evento do céu recebe instrução de agenda. Nada de "melhor dia para", nada de "aproveite a energia de". O céu é medido; o que acontece com a sua semana não é nosso para afirmar.',
    },
  },
  rituais: {
    nome: 'Rituais',
    tela: 'Rituais',
    chamada:
      'Acender uma vela e escrever três frases num papel não mexe no céu. Mexe no que você faz nos dez minutos seguintes — e é disso que essa tradição sempre falou, muito antes de virar post.',
    textos: {
      faseEDia:
        'A fase da Lua de agora e o dia da semana. Um ritual que pede minguante numa sexta só aparece quando os dois batem; quando bate um só, a tela diz qual bateu em vez de fingir encaixe perfeito.',
      semEfemeride:
        'Se a efeméride não estiver disponível, a fase some da conta e sobram os rituais que dependem só do dia da semana — dia da semana é aritmética de calendário e continua verdadeiro sem céu nenhum.',
      diasPlanetarios:
        'Os dias da semana com nome de planeta. E a fonte primária diz que o costume era novo quando ela escreveu, o que é o oposto do que se costuma repetir.',
      qualidades:
        'As qualidades dos sete planetas — aquecer, esfriar, secar, umedecer. São físicas, e nas nossas frases o planeta é sempre o sujeito: a tradição atribui a Saturno esfriar, não "Saturno esfria você".',
      lavoura: 'Crescente e minguante na lavoura romana: o que se corta, se colhe e se tosquia era na minguante, e o texto diz que sofria menos dano.',
      catao: 'Dois séculos antes, o mesmo costume: figueira, macieira, oliveira, pereira e videira se plantavam com a lua muda, à tarde.',
      columela: 'E a exceção que impede a generalização fácil: fava se semeava na véspera ou no próprio dia da cheia.',
      vinteEUm:
        'Os vinte e um rituais, os cinco campos de cada um (intenção, materiais, passo a passo, momento ideal, cuidados) e a escolha do que entra. A redação é nossa.',
      semFonteAntiga:
        'Onde não há fonte antiga, o campo escreve: prática popular contemporânea, sem fonte antiga localizada. Metade da biblioteca é isso, e está dito.',
      semPromessa:
        'Nenhum ritual promete resultado. O texto descreve o que você faz — escreva três frases, leia em voz alta, apague a vela — e para aí.',
      semCorpo:
        'E nenhum promete efeito no corpo de quem lê. A diferença entre o texto certo e o proibido é uma preposição: "escreva três frases" descreve; "escreva três frases para" já promete.',
    },
  },
  sonhos: {
    nome: 'Sonhos',
    tela: 'Sonhos',
    chamada:
      'Você acorda com a cena grudada: a porta que não abria, a pessoa que não devia estar ali. O primeiro impulso é procurar "o que significa sonhar com porta" — e é exatamente aí que vira biscoito da sorte.',
    textos: {
      semCeu:
        'Nada de céu nesta tela. O que entra na leitura é o que você escreveu, com as suas palavras, mais os seus sonhos anteriores quando existem.',
      especies:
        'A pergunta que vem antes da interpretação: este sonho só espelha o seu dia — fome, medo, o que aconteceu ontem — ou está dizendo uma coisa por outra? A distinção é do maior manual de sonhos que sobreviveu da Antiguidade, e é ela que separa método de dicionário.',
      quemSonhou:
        'E a exigência que vem junto: antes de interpretar é preciso saber de quem é o sonho — ofício, situação, idade. O mesmo símbolo não diz a mesma coisa para duas pessoas diferentes, e é isso que um dicionário de símbolos não consegue fazer.',
      regrasDoModelo:
        'O texto é escrito por um modelo de linguagem no servidor, com regras duras: listar antes os elementos que VOCÊ escreveu; nunca introduzir um símbolo que não está no relato — se o sonho não tem água, não se fala de água; apontar o que estava fora do lugar; nomear o motivo que se repete quando ele está mesmo nos sonhos anteriores; e fechar com uma pergunta que só serve para este sonho. Se o relato tem duas linhas, ele pede um detalhe em vez de inventar um sonho.',
      camadaModerna:
        'A segunda camada — o sonho como contrapeso da atitude desperta, as figuras como partes de quem sonhou — é leitura do séc. XX, e o app a nomeia como moderna em vez de emprestar a ela a idade do manual antigo.',
      semDiagnostico: 'Não é diagnóstico e não é previsão. Sonho não anuncia o mês que vem, e esta tela não finge que anuncia.',
      semTerceiro:
        'E não afirma o que a outra pessoa do sonho sente, pensa ou vai fazer. Aquela figura é material do seu sonho, não a pessoa real dormindo do outro lado da cidade.',
    },
  },
  corpo: {
    nome: 'O corpo e os signos',
    tela: 'Homem Zodiacal',
    chamada:
      'Você já viu o desenho: o boneco com os doze signos espalhados pelo corpo, Áries na cabeça, Leão no coração. Metade dele está trocada — e dá para provar com o poema de onde ele saiu.',
    textos: {
      luaAgora:
        'Em que signo a Lua está agora e a que horas ela troca. Era esse o relógio da prática antiga: a cada dois dias e meio a região mudava, e o almanaque de cabeceira servia para consultar isso.',
      manilio:
        'A lista dos doze vem de um poema astronômico do séc. I. E nele Leão não é o coração — é flancos e omoplatas; Libra não são os rins — são as nádegas. A versão que circula hoje trocou as duas.',
      naoEPtolomeu:
        'E não está no Tetrabiblos, como quase todo site diz: ali a lista é de planetas, não dos doze signos. Atribuir a lista ao autor errado é o tipo de erro que sobrevive por cópia.',
      culpeper:
        'A camada das ervas vem de um herbário inglês do séc. XVII, e as frases dele aparecem em inglês, sem tradução — porque o que está sendo mostrado é o que o homem escreveu, não o que a gente acha que ele quis dizer.',
      historiaNaoConselho:
        'A tela é sobre um capítulo da astrologia médica antiga, e a escolha de contar isso como história — quem escreveu, quando, e o que mudou no caminho — é nossa. O assunto é o desenho, não você.',
      semCorpo:
        'Nenhuma frase manda você fazer nada com o seu corpo. Tudo no passado e com dono: "a tradição medieval associava", nunca "o seu ponto fraco é". Nada aqui pode fazer alguém adiar um médico.',
    },
  },
  fotos: {
    nome: 'Leituras por foto: mão, rosto, pé e pintas',
    tela: 'Leituras',
    chamada:
      'Você tira foto da palma da mão com a luz da cozinha esperando ver a data do casamento. Não vê — e o motivo é mais interessante que a foto.',
    textos: {
      semConta:
        'Aqui não há conta nenhuma. A foto vai para o servidor, um modelo descreve o que está visível e só depois interpreta. Se a foto não mostra o que precisa, a leitura diz isso em vez de inventar uma mão.',
      quiromanciaModerna:
        'A quiromancia com montes, tipos de mão e linha do casamento é moderna: nasce em 1839 e se organiza no fim do séc. XIX, com sociedade própria em Londres. O escrito "de Aristóteles" que abre metade dos manuais não está nas obras canônicas dele.',
      benham:
        'O manual que fixou o sistema como ele circula hoje é de 1900, e o título dele já anuncia a ambição da época: leitura científica da mão. É bom saber a data para não confundir o começo do séc. XX com a Antiguidade.',
      linhaDaVida:
        'Ligar o comprimento de uma linha ao tempo de vida é a afirmação mais antiga documentada de toda essa família de práticas — está numa obra de história natural do séc. IV a.C. O app mantém a proibição de ler tempo de vida ali, e troca a justificativa: não é mito popular recente, é o contrário, e continua proibido.',
      rostoEPe:
        'O rosto é lido pela fisiognomonia chinesa e o pé pela tradição indiana samudrika, e a tela escreve os dois nomes. Mas é preciso dizer o tamanho do lastro: o corpus samudrika tem centenas de manuscritos, a maioria anônimos, e esta base não leu edição primária de nenhuma das duas tradições. Citar "o samudrika diz X" é citar um corpus, não uma obra.',
      nomeiaATradicao:
        'Nomear a tradição na tela em vez de dizer "leitura energética" é escolha nossa. Nome tem endereço; energia não tem.',
      descreveAntes:
        'A instrução obriga o modelo a descrever antes de interpretar — que parte do corpo aparece, iluminação, o que está nítido. É o que impede a leitura de falar de uma linha que a foto não mostra.',
      semPele:
        'Nada sobre a sua pele: nem cor, nem borda, nem tamanho, nem mudança de uma pinta. Isso é assunto de dermatologista, e o modelo tem instrução de dizer isso com naturalidade se alguém perguntar. A leitura é de posição, e só.',
      semTempoDeVida: 'E nada de tempo de vida, em nenhuma das quatro leituras. É a linha mais antiga da tradição e é a primeira que o app corta.',
    },
  },
  cafe: {
    nome: 'Borra de café',
    tela: 'Café',
    chamada:
      'A xícara vira no pires, a borra escorre e alguém sempre diz que aquilo é milenar. A conta não fecha, e é fácil de fechar: a prática não pode ser mais velha que a bebida.',
    textos: {
      semConta: 'Nenhuma conta e nenhum céu: é foto, descrição e leitura. O que a tela pode oferecer é o lastro histórico, e ele é curto e datado.',
      manual1742:
        'A leitura de borra aparece impressa na Europa num manualzinho anônimo de trinta e uma páginas, de 1742 — o mais antigo que este levantamento localizou, com resenha em jornal do mesmo ano.',
      dicionarioDeSalao:
        'E o dicionário de símbolos que todo mundo conhece — cobra é inimizade, casa é mudança — é entretenimento de salão britânico do fim do séc. XIX, consolidado num livro popular dos anos 1920.',
      istambul:
        'Os cafés de Istambul abrem por volta de 1555, e é essa data que derruba o rótulo "milenar": não dá para ler borra de café antes de haver café. A cronologia é sólida no levantamento, mas quem foi lido de primeira mão aqui são o manual de 1742 e o livro de símbolos.',
      geografiaDaXicara:
        'A geografia da xícara que o app usa — a alça é a pessoa, o sentido horário é o tempo, a borda é o que está perto e o fundo é o que está longe — é a convenção da tasseografia de salão. É a que existe, e o app diz que é essa.',
      semNomeSemData:
        'Não dá nome de pessoa nem data de acontecimento. Borra é forma no fundo de uma xícara; o resto é conversa, e conversa boa não precisa fingir precisão.',
    },
  },
  chat: {
    nome: 'O assistente',
    tela: 'Chat',
    chamada:
      'Você digita "ele volta?" às duas da manhã. O que chega de volta não é sim nem não — e vale saber por quê antes de achar que o app está enrolando.',
    textos: {
      contexto:
        'O que o app calculou e manda junto na conversa: o seu signo, o signo e a fase da Lua de hoje, e os aspectos reais entre o céu de hoje e o seu mapa. Nada disso é escrito pelo modelo — chega pronto, de conta feita no seu aparelho.',
      semDadoSemAfirmacao:
        'E o que não foi calculado não entra. Se o seu mapa não está preenchido, o bloco chega vazio naquela parte e o assistente tem ordem de pedir o mapa em vez de deduzir.',
      vocabulario:
        'O vocabulário que ele pode usar é o citável: elementos e modalidades dos signos — cardinal inicia, fixo sustenta, mutável adapta — e os quatro aspectos por ângulo.',
      qualidades: 'Mais as qualidades físicas dos sete planetas, sempre com o planeta como sujeito da frase.',
      regraDura:
        'A regra mais dura do sistema: nunca afirmar posição, casa, aspecto ou retrogradação que não esteja no bloco de contexto. Quem entende de astrologia confere a efeméride em cinco segundos, e não volta.',
      testeDoBarnum:
        'E o teste que ele aplica antes de responder: se a frase continuar verdadeira trocando você por outra pessoa qualquer, apagar e escrever de novo, ancorada em algo concreto.',
      semBaralho:
        'Ele não tem baralho. Nunca diz que puxou, tirou ou virou uma carta — quem puxa é você, na tela do Tarô. Se você contar a tiragem, ele fala daquelas cartas e só daquelas.',
      semNota: 'Não dá porcentagem de nada, inclusive de compatibilidade. E não fala de saúde, em nenhuma circunstância.',
    },
  },
};

export const PACK = {
  idioma: 'pt',
  tela: 'Como este app decide',
  abertura: ABERTURA,
  rotulos: ROTULOS,
  exigencia: EXIGENCIA,
  recibo: RECIBO,
  reciboSemAutor: RECIBO_SEM_AUTOR,
  semFonte: SEM_FONTE,
  autores: AUTORES,
  verbatim: VERBATIM,
  convencoes: CONVENCOES,
  features: FEATURES,
};

export default PACK;
