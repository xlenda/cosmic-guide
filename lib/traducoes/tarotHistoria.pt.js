// lib/traducoes/tarotHistoria.pt.js
// O PACK PORTUGUÊS da história do tarô — TODA prosa que a pessoa lê mora aqui.
// O motor (a ordem, as datações, as provas, a conta de idade) fica em
// lib/tarotHistoria.js. Os packs irmãos (.es, .en) repetem exatamente esta
// FORMA: mesmas chaves, mesmos campos, funções com a mesma assinatura.
//
// AS REGRAS QUE VALEM PARA CADA STRING DAQUI (cabeçalho de lib/tarotHistoria.js):
//
// 1. PRENDE PRIMEIRO, FONTE DEPOIS. Todo `texto` abre na vida real — o baralho
//    que te deram, a mesa, a mão que embaralha, o que você achava que sabia — e
//    fecha no recibo. Os primeiros 70 caracteres não podem trazer ano de quatro
//    dígitos. O teste reprova.
// 2. NENHUMA ALEGAÇÃO DE SAÚDE, nenhuma promessa, nenhum veredito sobre quem
//    acredita no mito, nenhuma prova social, nenhum aviso defensivo.
// 3. DESMONTAR NÃO É XINGAR. A tese diz que inventar antiguidade é um traço da
//    tradição, não a corrupção dela. Quem repetiu o Egito a vida inteira ouviu
//    de alguém que gostava dele. O tom é o de quem conta uma coisa boa.
// 4. AS CITAÇÕES DE WAITE FICAM EM INGLÊS, idênticas nos três packs. Traduzir
//    citação é falsificá-la; a paráfrase vem ao lado, assinada pelo app.
// 5. O NOME DA OBRA NUNCA TRADUZ. Le Monde primitif continua Le Monde primitif.
//    Autor e datação passam por lib/traducoes/datacao.js, no motor.

// ---------------------------------------------------------------------------
// CHROME DA TELA
// ---------------------------------------------------------------------------
const TELA = {
  titulo: 'A história real deste baralho',
  subtitulo: 'Do jogo de corte italiano ao baralho que está no seu álbum',
  ctaLinhaDoTempo: 'Ver a linha do tempo',
  rotuloRecibo: 'Recibo',
  rotuloFases: 'Como ler esta linha',
  rotuloNaoSeSustenta: 'O que se repete, e o que a fonte mostra',
  rotuloOQueSeDiz: 'O que se diz',
  rotuloOQueAFonteMostra: 'O que a fonte mostra',
  rotuloParalelo: 'E tem uma coisa que ninguém conta',
  rotuloFontes: 'Onde conferir',
  rotuloNoAlbum: 'Isto aparece no seu álbum',
};

// Os quatro trechos da régua. A virada de "jogo" para "leitura" é o argumento
// inteiro desta feature: são séculos de distância entre uma coisa e outra.
const FASES = {
  jogo: 'Enquanto era só jogo',
  leitura: 'Quando viraram oráculo',
  oculto: 'Quando ganharam sistema',
  erudicao: 'Quando alguém foi conferir',
};

// As sete fontes que NÃO são obra titulada: um baralho num museu, um livro de
// contas, uma folha sem título, uma pedra, uma objeção, uma tese, um corpus de
// textos. O nome delas é descrição, e descrição se diz na língua de quem lê.
// Título de obra, esse continua intacto no motor. Ver lib/tarotHistoria.js §2.
const OBRAS = {
  baralhoMameluco: 'baralho mameluco (Topkapı Sarayı Müzesi, Istambul)',
  contasDeFerrara: 'livros de contas das cortes de Ferrara e de Florença (carte da trionfi)',
  folhaBolonhesa: 'folha manuscrita bolonhesa, com significados de 35 cartas',
  pedraDeRoseta: 'a Pedra de Roseta e a decifração do hieróglifo',
  objecaoMerlin: 'a objeção de Romain Merlin, retomada por Waite no Pictorial Key',
  teseVaillant: 'a tese da origem egípcia por via do povo Rom',
  textosFundadores: 'os textos fundadores atribuídos a Nechepso e a Petosiris',
};

// Autores que não são nome próprio. Nome próprio passa por traduzirAutor e
// volta igual nos três idiomas; estes aqui precisam da língua de quem lê.
const AUTORES = {
  anonimo: 'sem autor conhecido',
  escrivao: 'escrivães de corte',
  frade: 'um frade anônimo',
  gravadorIncerto: 'gravador incerto (hipótese: Nicola di Maestro Antonio)',
  smithEWaite: 'Pamela Colman Smith na arte e A. E. Waite na estrutura',
  pseudonimos: 'pseudônimos de autores gregos em Alexandria',
};

// ---------------------------------------------------------------------------
// A ABERTURA — a primeira coisa que a tela mostra, dentro do álbum
// ---------------------------------------------------------------------------
// Zero data na chamada. Zero nome próprio. É a vida de quem abriu o álbum.
const ABERTURA = {
  chamada:
    'Alguém te disse que baralho não se compra, tem que ser presente. Alguém falou em Egito, em faraó, em segredo guardado por sacerdotes. Você guardou isso sem discutir, do jeito que a gente guarda o que ouviu de quem gosta.',
  texto: (c) =>
    'Agora a parte estranha: a história de verdade é melhor que a que te contaram, e ela tem endereço. ' +
    'Essas cartas nasceram como JOGO. Jogo de aposta, mesa de corte italiana, trunfo que ganha do naipe — a mesma ideia do truco. ' +
    'E não é passado morto: ainda se joga tarot na França, Königrufen na Áustria e tarocchini em Bolonha, com o mesmo baralho.' +
    '\n\n' +
    `A leitura de cartas como você conhece entra muito depois, e dá para apontar o volume e a página. São cerca de ${c.seculosDeImagem} séculos de imagem contra ${c.anosDeLeitura} anos de leitura — ` +
    'e cada degrau dessa distância tem obra, autor e ano, do primeiro baralho pintado à mão até o que está no seu álbum.' +
    '\n\n' +
    'Nada disso tira uma linha do que você sente quando tira uma carta. Só troca o que você responde quando perguntarem de onde isso vem.',
};

// ---------------------------------------------------------------------------
// OS 18 MARCOS
// ---------------------------------------------------------------------------
const MARCOS = {
  'rheinfelden-1377': {
    titulo: 'As cartas chegam à Europa — e já vêm com sermão junto',
    texto:
      'A primeira vez que alguém na Europa descreve um baralho por escrito, é um frade reclamando dele. ' +
      'Johannes von Rheinfelden, em Basileia, ano de 1377: quatro naipes, figuras, e uma moral sobre a ordem social pendurada em cada carta. ' +
      'Repare no que NÃO está lá — nenhum trunfo, nenhuma adivinhação, nenhum Egito. Só gente jogando, e um religioso incomodado com isso.',
  },
  'mameluco-naipes': {
    titulo: 'Os quatro naipes vêm do Egito. Só eles.',
    texto:
      'Aqui tem uma ironia boa: existe sim um elo entre Egito e baralho, e ele é real — só que não é o que te contaram. ' +
      'O baralho mameluco que sobreviveu quase inteiro está em Istambul, no Topkapı, e traz quatro naipes: moedas, cimitarras, taças e bastões de pólo. ' +
      'Moedas viraram ouros, cimitarras viraram espadas, bastões viraram paus. Ou seja: o que veio de lá foram os 56 menores, os que você coleciona nos quatro naipes do álbum. Os 22 trunfos não estavam nesse baralho.',
  },
  'trionfi-ferrara': {
    titulo: 'A primeira vez que a palavra aparece, é num livro de contas',
    texto:
      'Não é num templo nem numa tenda de vidente: é na contabilidade de um duque que gostava de jogar. ' +
      'O escrivão da corte de Ferrara anota carte da trionfi — cartas de triunfo — no livro de despesas, em 1442. ' +
      'Dois anos antes, em Florença, alguém registra a transferência de dois baralhos para Sigismondo Pandolfo Malatesta. É assim que o tarô entra na história escrita: como item de despesa.',
  },
  'visconti-sforza': {
    titulo: 'Os mais antigos que sobraram são pintados à mão, com ouro',
    texto:
      'Antes da impressão barata, baralho era artigo de rico: pintado à mão, folha de ouro, encomendado pela família que mandava em Milão. ' +
      'Os Visconti-Sforza, de c. 1441–1451, são os tarôs mais antigos que chegaram até hoje — e não são um baralho só: são vários, todos incompletos, hoje repartidos entre Nova York e Bérgamo. ' +
      'Parte da pintura é atribuída a Bonifacio Bembo. Nenhum deles foi feito para adivinhar nada.',
  },
  'sermao-steele': {
    titulo: 'Um frade xinga os jogadores e salva a lista dos 22',
    texto:
      'A lista mais antiga dos 22 trunfos, na ordem, chegou até nós porque um religioso estava irritado. ' +
      'No sermão que os estudiosos chamam de Sermão Steele, ele prega contra dados e cartas e, para mostrar o tamanho do problema, enumera um por um os trunfos do ludus triumphorum. ' +
      'Xingou, listou, virou fonte. A ordem que ele dá é essencialmente a que o seu álbum usa nos Arcanos Maiores. A data exata ninguém crava: última terça parte do século XV.',
  },
  'sola-busca': {
    titulo: 'O primeiro baralho completo com cena em toda carta',
    texto:
      'Repare no seu álbum: até as cartas numeradas têm gente, cenário, história acontecendo. Isso é raro, e é recente. ' +
      'O Sola Busca, gravado em metal por volta de 1491, é o baralho de 78 mais antigo que sobreviveu inteiro e o primeiro em que toda carta de naipe ganha cena, em vez do símbolo repetido. ' +
      'Guarde o nome dele: volta daqui a quatro séculos, em Londres.',
  },
  'palavra-taro': {
    titulo: 'A palavra "tarô" chega depois do jogo — e ninguém sabe de onde',
    texto:
      'Durante décadas o jogo se chamou trionfi, trunfos, e mais nada. ' +
      'A forma tarocho aparece em Ferrara em 1505 e taraux em Avignon no mesmo ano. De onde veio a palavra, ninguém sabe — e isso não é ignorância nossa: em 1550 o poeta ferrarês Alberto Lollio já escrevia que a origem do nome era desconhecida. ' +
      'Quem te oferece uma etimologia egípcia está oferecendo uma coisa que o século XVI já tinha dado por perdida.',
  },
  'padroes-regionais': {
    titulo: 'Nem todo tarô tem 78 cartas',
    texto:
      'O seu álbum tem 78 casas porque foi esse o padrão que venceu — não porque 78 seja um número sagrado. ' +
      'Na Florença do século XVI se jogava Minchiate, com 97 cartas, com os doze signos e os quatro elementos entre os trunfos. Em Bolonha eram 62. Na Sicília, 64. ' +
      'Quando alguém tira significado místico do número 78, está fazendo numerologia em cima da decisão de um fabricante.',
  },
  'folha-bolonhesa': {
    titulo: 'A primeira adivinhação achada é italiana, popular, e sem mistério',
    texto:
      'Antes de qualquer ocultista francês, alguém em Bolonha escreveu à mão, numa folha só, o que cada carta queria dizer: 35 delas, com um jeito simples de dispor na mesa. ' +
      'A folha é anterior a 1750, foi encontrada em arquivo pelo pesquisador Franco Pratesi, e o Louco ali significa "loucura", sem nenhuma camada secreta. ' +
      'Não há cartas invertidas nela. É a atestação mais antiga conhecida de cartomancia com tarô — e é gente comum, não sacerdote.',
  },
  etteilla: {
    titulo: 'O primeiro profissional de cartas tinha método, tabela e preço',
    texto:
      'Teve um sujeito em Paris que assinou o nome ao contrário — Alliette virou Etteilla — e transformou leitura de carta em ofício. ' +
      'Foi ele quem fixou significado para cada carta, significado para a carta de cabeça para baixo e um jeito definido de dispor: começou em 1770 com baralho comum e em 1789 lançou o Grand Etteilla, o primeiro baralho desenhado de propósito para adivinhar. ' +
      'Toda invertida que você já leu, em qualquer baralho do mundo, desce dele.',
  },
  'volume-1781': {
    titulo: 'O Egito entra na história num livro francês, sem um documento',
    texto:
      'Um clérigo erudito encontra o tarô por acaso numa reunião social em Paris, acha que está reconhecendo símbolo egípcio e escreve que aquilo é o resto do Livro de Thoth, salvo pelos sacerdotes. ' +
      'Não apresenta um documento sequer. É Antoine Court de Gébelin, no volume VIII do Monde primitif, em 1781. No mesmo volume, o Comte de Mellet amarra os 22 trunfos às 22 letras hebraicas. ' +
      'Duas páginas de um livro francês fundaram tudo o que hoje se vende como milenar.',
  },
  'levi-arvore': {
    titulo: 'A Árvore da Vida é pendurada nas cartas',
    texto:
      'Um ex-seminarista francês que assinava Éliphas Lévi pega a sugestão de Mellet e monta o sistema inteiro: cada trunfo vira uma letra hebraica e um caminho na Árvore da Vida cabalística. ' +
      'Dogme et Rituel de la Haute Magie sai em dois volumes, 1854 e 1856, cada um com 22 capítulos — a forma do livro imita o baralho. Papus populariza em 1889, com arcanos desenhados por Oswald Wirth. ' +
      'Nenhum documento italiano dos séculos XV a XVII liga trunfo a letra hebraica. Essa costura é do século XIX.',
  },
  'book-t': {
    titulo: 'A tabela astrológica que este app usa nasce numa ordem de Londres',
    texto:
      'Quando o app te diz que uma carta é "Marte em Áries", isso não vem da Itália nem do Egito. ' +
      'Vem de uma ordem iniciática inglesa do fim do século XIX, a Golden Dawn, nos documentos internos chamados Cipher Manuscripts e Book T: é lá que os 22 trunfos, os 36 decanatos das cartas de 2 a 10 e as figuras de corte ganham cada um a sua correspondência. ' +
      'Israel Regardie publicou o material a partir de 1937. Existem pelo menos três tabelas rivais e incompatíveis — este app usa a da Golden Dawn e diz isso na tela, em vez de escrever "a atribuição astrológica" como se fosse uma só.',
  },
  'rider-waite-smith': {
    titulo: 'Sai o baralho que está no seu álbum — com data, cidade e editora',
    texto:
      'As imagens que você coleciona aqui não caíram do céu: Londres, dezembro de 1909, editora William Rider & Son. ' +
      'Quem desenhou as 78 foi Pamela Colman Smith, ilustradora, trabalhando a partir de instruções de A. E. Waite — sem esboço dele. O nome dela ficou fora do título por décadas, e é por isso que o certo é dizer Rider-Waite-Smith. ' +
      'Para os 56 menores, Smith se apoiou no Sola Busca: as fotografias das 78 cartas daquele baralho de 1491 entraram no British Museum em 1907, dois anos antes.',
  },
  'waite-desmente': {
    titulo: 'O autor do baralho mais vendido do mundo desmonta o Egito no próprio livro',
    texto:
      'Essa é a melhor parte, e quase ninguém conta: quem derrubou a origem egípcia foi o próprio autor do baralho, no livro que o acompanha. ' +
      'Em 1911, Waite examina os dez argumentos de Court de Gébelin e escreve: "These, therefore, are ten pillars which support the edifice of the thesis, and the same are pillars of sand". ' +
      'Sobre a etimologia, lembra que ela foi proposta antes da Pedra de Roseta, quando ninguém no mundo sabia ler egípcio — a Pedra apareceu em 1799 e Champollion só decifrou o hieróglifo em 1822. E conclui: "there is no particle of evidence for the Egyptian origin of Tarot cards". ' +
      'Quando este app diz que o tarô não vem do Egito, ele não está sendo cético com a tradição: está do lado de Waite.',
  },
  'marteau-marselha': {
    titulo: 'Até "Tarô de Marselha" é nome de catálogo',
    texto:
      'O Marselha não é o tarô mais antigo: é um padrão de impressão francês dos séculos XVII e XVIII — Noblet em Paris por volta de 1650, Conver em Marselha em 1760. ' +
      'Os tarôs mais velhos que existem continuam sendo os italianos pintados à mão. O nome como a gente usa hoje foi popularizado em 1930 por Paul Marteau, da fabricante Grimaud, que fixou cores e desenho a partir do Conver. ' +
      'Circulam duas atribuições anteriores para o nome, e esta pesquisa não conseguiu conferir nenhuma das duas na fonte.',
  },
  'crowley-thoth': {
    titulo: 'O "Livro de Thoth" que existe de verdade é do meio da Segunda Guerra',
    texto:
      'Se alguém te disser que o tarô é o Livro de Thoth, vale saber que existe mesmo um livro com esse nome. ' +
      'Aleister Crowley publicou The Book of Thoth em 1944, com arte de Frieda Harris, seguindo a Golden Dawn com uma troca declarada por ele. ' +
      'É um baralho do século XX com nome egípcio — não um documento egípcio. A ordem cronológica resolve a confusão sozinha.',
  },
  'dummett-arquivo': {
    titulo: 'Quem juntou as provas foi um professor de lógica',
    texto:
      'A história que você acabou de ler não veio da intuição de ninguém: veio de arquivo, de livro de contas, de museu. ' +
      'Michael Dummett, filósofo de Oxford, publicou The Game of Tarot em 1980 seguindo o rastro documental de Ferrara até Salt Lake City; em 1996, com Ronald Decker e Thierry Depaulis, publicou A Wicked Pack of Cards, sobre a origem do tarô ocultista. ' +
      'É por isso que cada data desta linha tem onde ser conferida — e é por isso que ela pode mudar, se aparecer documento novo. Uma história que não pode ser corrigida não é história.',
  },
};

// ---------------------------------------------------------------------------
// O QUE NÃO SE SUSTENTA — as duas metades nunca saem separadas
// ---------------------------------------------------------------------------
const MITOS = {
  egito: {
    oQueSeDiz: 'Este baralho é o Livro de Thoth: veio do Egito dos faraós, guardado por sacerdotes até chegar na Europa.',
    oQueAFonteMostra:
      'A afirmação inteira sai de um capítulo publicado em Paris em 1781, sem nenhum documento anexado — e quem a demoliu, em 1911, foi o autor do baralho mais vendido do planeta, no manual que acompanha o próprio baralho. ' +
      'Existe um elo entre Egito e baralho, e ele é outro: os quatro naipes mamelucos, moedas, cimitarras, taças e bastões de pólo. Ele explica os 56 menores, não os 22 trunfos.',
  },
  etimologia: {
    oQueSeDiz: 'TAROT vem do egípcio TAR-RO, "caminho real" — o caminho real da vida.',
    oQueAFonteMostra:
      'Essa etimologia foi escrita em 1781. A Pedra de Roseta só apareceu em 1799 e Champollion só decifrou o hieróglifo em 1822: em 1781 ninguém no planeta sabia ler egípcio, a começar por quem propôs a etimologia. ' +
      'A origem da palavra tarocco continua desconhecida, e já era declarada desconhecida em 1550. Os anagramas ROTA, TORA e ORAT são jogo de letras latinas do século XIX, não etimologia.',
  },
  'vinte-e-duas-letras': {
    oQueSeDiz: 'São 22 arcanos maiores e 22 letras hebraicas — prova de que o tarô é cabalístico desde a origem.',
    oQueAFonteMostra:
      'A ligação é sugerida pelo Comte de Mellet em 1781 e sistematizada por Éliphas Lévi em 1854: Iluminismo francês e ocultismo do século XIX, não Jerusalém antiga. Nenhum documento italiano dos séculos XV a XVII amarra trunfo a letra. ' +
      'E o argumento numérico cai dentro do próprio jogo: a Minchiate florentina tem 40 trunfos. Se 22 fosse desenho cabalístico, alguém teria avisado os florentinos.',
  },
  'povo-rom': {
    oQueSeDiz: 'Foi um povo viajante que trouxe o tarô do Egito para a Europa.',
    oQueAFonteMostra:
      'A ideia é de Boiteau, 1854, e de Vaillant, 1857 — e ela tem dois problemas de data. A língua mostra que o povo Rom vem do noroeste da Índia, e a linguística comparada estabeleceu isso em 1782–1783, antes de a tese ser escrita. ' +
      'Além disso, as cartas já circulavam na Europa antes da chegada documentada dos Rom. Waite fazia essa objeção em 1911, creditando a correção a Romain Merlin, 1869.',
  },
  'cinco-mil-anos': {
    oQueSeDiz: 'O tarô tem cinco mil anos: vem da Atlântida, dos druidas, de uma sabedoria perdida.',
    oQueAFonteMostra:
      'Não há fonte para nenhuma das três. O que se sustenta, e dá para conferir carta por carta em museu, é: cerca de seis séculos de imagem e cerca de dois séculos e meio de leitura. ' +
      'É menos do que se anuncia por aí e é mais interessante, porque cada um desses séculos tem cidade, nome e documento — e cinco mil anos não têm nem uma linha.',
  },
  'sempre-espiritual': {
    oQueSeDiz: 'O tarô sempre foi instrumento espiritual; o jogo é uma degradação moderna.',
    oQueAFonteMostra:
      'A ordem do tempo é o contrário. Primeiro vieram uns 350 anos de mesa de jogo, aposta e salão; a primeira leitura documentada chega depois disso tudo. ' +
      'E o jogo não morreu para virar oráculo: o tarot é jogado na França, o Königrufen na Áustria e o tarocchini em Bolonha, hoje, com as mesmas cartas que estão no seu álbum.',
  },
};

// ---------------------------------------------------------------------------
// AS SEÇÕES DO ÁLBUM
// ---------------------------------------------------------------------------
const GRUPOS = {
  maiores: {
    titulo: 'Os 22 trunfos: um desfile italiano, não um alfabeto secreto',
    texto:
      'Estas 22 figuras não eram enigma para iniciado: eram o repertório visual de qualquer festa e qualquer igreja da Itália do século XV. ' +
      'Virtudes (Força, Justiça, Temperança), estados de vida (o Imperador, o Papa, a Papisa), a Roda da Fortuna, o triunfo da Morte, o Juízo Final — as mesmas imagens dos desfiles triunfais e dos Triumphi de Petrarca, tese que Gertrude Moakley defendeu em 1966. ' +
      'A lista mais antiga deles, na ordem, sobreviveu num sermão contra o jogo, da última terça parte do século XV.',
  },
  paus: {
    titulo: 'Paus eram bastões de pólo',
    texto:
      'No baralho mameluco de onde vieram os naipes europeus, este era o naipe dos bastões de pólo — esporte de nobre a cavalo, que a Europa não jogava. ' +
      'Sem o esporte, o desenho virou bastão, cajado, pau. O exemplar quase completo está em Istambul, no Topkapı, e é do século XV.',
  },
  copas: {
    titulo: 'Copas são taças, e taça atravessou tudo sem mudar',
    texto:
      'Este é o naipe que menos mudou no caminho: taça no baralho mameluco, taça na Itália, copa na Espanha, copas aqui. ' +
      'Quando a imagem já existe na mesa de quem recebe, ela não precisa de tradução. Século XV, o baralho está em Istambul.',
  },
  espadas: {
    titulo: 'Espadas eram cimitarras',
    texto:
      'A lâmina curva do baralho mameluco endireitou ao chegar na Itália e virou a espada reta que você vê nas suas cartas. ' +
      'Na Espanha o desenho ficou mais parecido com o original. Mesmo baralho do século XV, mesmo Topkapı.',
  },
  ouros: {
    titulo: 'Ouros são moedas — o naipe do dinheiro, sem metáfora',
    texto:
      'Moeda no baralho mameluco, denaro na Itália, ouros aqui. É o naipe que menos precisou de tradução, porque dinheiro é a coisa que atravessa fronteira mais fácil. ' +
      'Século XV, exemplar quase completo em Istambul.',
  },
};

// ---------------------------------------------------------------------------
// AS NOTAS DE CARTA — dentro do modal do álbum
// ---------------------------------------------------------------------------
const NOTAS_DE_CARTA = {
  estrela: {
    titulo: 'Em 1911, esta era uma carta de roubo',
    texto:
      'Você abriu A Estrela e leu esperança. O livro que Waite escreveu para acompanhar o baralho começa a entrada dela por outro lado: "Loss, theft, privation, abandonment" — perda, roubo, privação, abandono. ' +
      'A esperança vem depois, apresentada como "another reading says". A prioridade foi invertida ao longo do século XX. ' +
      'Este app segue a leitura de hoje de propósito, e vale saber por quê: as listas de palavras de Waite descem da cartomancia francesa, enquanto as imagens de Pamela Colman Smith carregam o simbolismo da Golden Dawn. As duas metades do baralho não contam a mesma história, e o app fica com a imagem.',
  },
  roda: {
    titulo: 'De cabeça para baixo, esta carta MELHORA no texto original',
    texto:
      'A regra que você aprendeu diz que carta invertida é a mesma coisa, só que travada. No texto de Waite não é isso: a Roda da Fortuna invertida é "Increase, abundance, superfluity" — aumento, abundância, excesso. ' +
      'A Imperatriz invertida é "Light, truth, the unravelling of involved matters". A chave "invertida é bloqueio" é do século XX, da linhagem que passa por Eden Gray, Rachel Pollack e Mary K. Greer — é boa leitura, só não é antiga. ' +
      'Invertida sistemática, carta por carta, quem instituiu foi Etteilla, no século XVIII.',
  },
  morte: {
    titulo: 'A gentileza da Morte é do século XX, e o app fica com ela',
    texto:
      'Quando sai a Morte, alguém na mesa ri sem graça e alguém diz "não é morte literal, é transformação". ' +
      'A segunda frase é uma escolha de leitura do século XX — legítima, e é a que este app mantém. Só não é o que está escrito em 1911: a entrada de Waite abre com "End, mortality, destruction, corruption". ' +
      'Dizer que "a tradição sempre leu como transformação" é dar a Waite uma delicadeza que quem teve foi o século passado.',
  },
  louco: {
    titulo: 'A carta traz um 0. O autor do baralho diz que ela não tem número.',
    texto:
      'Você olha O Louco e vê um zero impresso no alto. No livro dele, Waite escreve: "Wherever it ought to be put, the Zero is an unnumbered card" — e, na lista de significados, o Louco aparece depois do 20, não antes do 1. ' +
      'No Tarô de Marselha ele é LE MAT, sem número nenhum. Em Etteilla é a carta 78. O "0 no começo" é convenção da Golden Dawn, do fim do século XIX. ' +
      'A carta do seu álbum e o livro do autor dela discordam, e isso está impresso desde a primeira edição.',
  },
  'forca-justica': {
    titulo: 'A Força é a 8 e a Justiça é a 11 — e a troca não foi de Waite',
    texto:
      'Se você já viu um baralho mais antigo, a Justiça era a 8 e a Força a 11. A inversão que o seu álbum usa já estava nos Cipher Manuscripts da Golden Dawn antes de o baralho existir; Waite seguiu a ordem em que foi formado. ' +
      'O motivo é astrológico e simples: pôr Leão e Libra na sequência do zodíaco. É atribuição da Golden Dawn, do fim do século XIX — não é a correção de um erro antigo, é uma escolha de escola.',
  },
  'tres-espadas': {
    titulo: 'Esta imagem tem um parente de 1491',
    texto:
      'Três espadas atravessando um coração, sob chuva. É uma das cartas mais reconhecíveis do baralho — e ela tem antepassado. ' +
      'A carta correspondente do Sola Busca, gravado por volta de 1491, é muito parecida, e a ligação é documentada: as fotografias das 78 cartas daquele baralho entraram no British Museum em 1907, dois anos antes de Pamela Colman Smith desenhar as dela. ' +
      'A congruência aparece também no Dez de Paus e no Dez de Espadas.',
  },
};

// ---------------------------------------------------------------------------
// O PARALELO — o achado que muda o tom de tudo
// ---------------------------------------------------------------------------
const PARALELO = {
  chamada:
    'Dá uma sensação ruim descobrir que uma coisa que você respeitava foi inventada por um sujeito numa sala em Paris. A sensação passa quando você vê que isso não é exceção — é o método da casa, e é muito mais velho que o tarô.',
  texto:
    'A astrologia ocidental, que o resto deste app usa, começa exatamente do mesmo jeito. ' +
    'Os textos que fundam o mapa natal como sistema circulam sob os nomes de Nechepso, um faraó, e Petosiris, um sacerdote egípcio. Os dois são pseudônimos: quem escreveu foram autores gregos em Alexandria, por volta de 150 a 120 a.C., dando pedigree egípcio a um texto que eles estavam produzindo naquele momento.' +
    '\n\n' +
    'É o mesmo gesto de Court de Gébelin, 1.900 anos depois. E do astrólogo que cunhou "Superlua" em 1979. E do almanaque que batizou as luas cheias nos anos 1930.' +
    '\n\n' +
    'Ou seja: inventar antiguidade não é a corrupção da tradição — é um traço dela, desde o primeiro dia. Isso não é motivo para largar o baralho. É motivo para saber o que você tem na mão: cerca de seis séculos de imagem, dois séculos e meio de leitura, e uma linhagem de gente que sempre achou que a própria invenção precisava parecer mais velha do que era.',
};

// ---------------------------------------------------------------------------
// BIBLIOGRAFIA — títulos de obra intactos, descrição no idioma
// ---------------------------------------------------------------------------
const FONTES = [
  'A. E. Waite, The Pictorial Key to the Tarot, 1911 — Parte I §4 é a história e é onde ele derruba a origem egípcia; Parte II §3 é a numeração do Louco. Domínio público, texto integral em sacred-texts.com/tarot/pkt/',
  'Antoine Court de Gébelin, Le Monde primitif, vol. VIII, "Du Jeu des Tarots", 1781 — o ensaio que inventa a origem egípcia, e o ensaio do Comte de Mellet, no mesmo volume, que liga os 22 trunfos ao alfabeto hebraico',
  'Michael Dummett, The Game of Tarot: from Ferrara to Salt Lake City, 1980 — o trabalho de arquivo que estabeleceu a história documental do baralho',
  'Ronald Decker, Thierry Depaulis e Michael Dummett, A Wicked Pack of Cards: The Origins of the Occult Tarot, 1996 — a origem do tarô ocultista, de 1781 em diante',
  'Golden Dawn, Cipher Manuscripts e "Book T — The Tarot" — a tabela astrológica das 78 cartas, publicada por Israel Regardie a partir de 1937. É a tabela que este app usa',
  'Sermones de ludo cum aliis, norte da Itália, última terça parte do séc. XV — a lista mais antiga conhecida dos 22 trunfos, na ordem',
  'Gertrude Moakley, The Tarot Cards Painted by Bonifacio Bembo, 1966 — a tese de que os trunfos derivam dos Triumphi de Petrarca e dos desfiles triunfais. Influente, não consensual',
  'docs/tradicao/05-taro-historia-e-leitura.md — a base interna em que cada data desta tela foi conferida, com o grau de cada afirmação',
];

// ---------------------------------------------------------------------------
// RÓTULOS DO COMPARTILHÁVEL
// ---------------------------------------------------------------------------
const COMPARTILHAR = {
  oQueSeDiz: 'Dizem que:',
  oQueAFonteMostra: 'A fonte mostra:',
  recibo: 'Recibo:',
};

export const PACK = {
  idioma: 'pt',
  tela: TELA,
  fases: FASES,
  obras: OBRAS,
  autores: AUTORES,
  abertura: ABERTURA,
  marcos: MARCOS,
  mitos: MITOS,
  grupos: GRUPOS,
  notasDeCarta: NOTAS_DE_CARTA,
  paralelo: PARALELO,
  fontes: FONTES,
  compartilhar: COMPARTILHAR,
};

export default PACK;
