// lib/traducoes/idadeReal.pt.js
// O PACK PORTUGUÊS da tabela "A idade real de cada coisa" — TODO texto que a
// pessoa lê mora aqui. O motor (ano de origem, arredondamento, ordenação,
// agrupamento, compartilhável) ficou em lib/idadeReal.js; a prosa ficou neste
// arquivo, e os packs irmãos (idadeReal.es.js e idadeReal.en.js) repetem
// exatamente esta FORMA: mesmas chaves, mesmos campos, mesmos placeholders.
//
// O PT É A FONTE DE VERDADE e não muda um byte sem que o golden mude junto:
// test/golden/idadeReal.pt.golden.json trava os 30 itens campo a campo, o
// chrome, os rótulos e os 30 compartilháveis. Se test/idadeReal.test.js acusar
// diferença, o erro está aqui — não no golden.
//
// AS REGRAS DE CADA STRING (todas varridas por test/idadeReal.test.js):
//
//  (1) TRADIÇÃO SEMPRE COM FONTE. Toda afirmação histórica carrega o locus —
//      obra, autor, século. O que é conta do app (a idade) vem rotulado como
//      conta do app, na linha `comoContamos` da tela. O que a pesquisa
//      procurou e não achou fica DECLARADO como não achado: são as três
//      entradas com "sem autor identificado", e a ausência é o resultado.
//
//  (2) PRENDE PRIMEIRO, FONTE DEPOIS. Todo `detalhe` abre na vida real, em
//      português de conversa — a manchete, o carrossel, o post, o feed — e o
//      recibo chega na segunda metade. Os primeiros 60 caracteres não trazem
//      ano de quatro dígitos nem "séc.". Duas a três frases, tamanho de card.
//
//  (3) LINHA VERMELHA, regra de PALAVRA e não de intenção: nenhuma alegação de
//      saúde nem implícita, nenhuma promessa de resultado, nenhum mecanismo
//      pseudocientífico, nenhum veredito sobre quem acredita, nenhuma prova
//      social inventada, nenhum aviso defensivo. E a palavra banida por
//      docs/tradicao/06 §2 não entra em texto nenhum do app.
//
//  (4) O TOM É O DA TESE, não o de denúncia. "Inventar antiguidade não é a
//      corrupção da tradição, é um traço da tradição" — está lá desde
//      Nechepso e Petosiris. Datar não é desmascarar: é devolver a história
//      real, que é mais interessante que a inventada.
//
//  (5) TERMO TÉCNICO GANHA GLOSA na primeira aparição, no molde de
//      lib/lunarCalendar.js: eclíptica, domicílio, seita, lote, perigeu-
//      sizígia e Swiss Ephemeris chegam explicados na mesma frase.
//
//  (6) NÃO REPETIR lib/mitos.js. Há itens em comum de propósito (Superlua está
//      nos dois), mas nenhuma sequência de oito palavras pode coincidir — o
//      teste varre os dois catálogos e reprova.
export default {
  // -------------------------------------------------------------------------
  // O CHROME DA TELA
  // -------------------------------------------------------------------------
  // Os moldes com {n}, {total} e {ano} passam por `preencher` — nunca vão
  // direto para o JSX, senão a chave crua aparece na cara da pessoa.
  // `marca` é o domínio: NÃO se traduz em idioma nenhum.
  tela: {
    titulo: 'A idade real de cada coisa',
    subtitulo: 'Parece milenar × tem certidão de nascimento',
    intro:
      'Trinta coisas que o mercado vende como antigas, com o ano em que cada uma apareceu. A lista abre pela mais nova.',
    ordenarPor: 'ORDENAR',
    ordemMaisNovo: 'Mais nova primeiro',
    ordemMaisAntigo: 'Mais antiga primeiro',
    ordemTema: 'Por tema',
    rotuloQuem: 'QUEM INVENTOU',
    rotuloQuando: 'QUANDO',
    recibo: 'RECIBO',
    abrir: 'Ver a história',
    fechar: 'Fechar',
    compartilhar: 'Compartilhar',
    copiado: 'Texto copiado — cola onde quiser.',
    naoCopiou: 'Não deu pra copiar aqui — seleciona o texto e copia.',
    idadeAnos: '{n} anos',
    idadeAnosAprox: 'cerca de {n} anos',
    semData: 'sem data',
    semDataLonga: 'A pesquisa procurou o inventor e não achou. Fica declarado.',
    comoContamos:
      'A idade aqui é conta, não tabela: {ano} menos o ano que a fonte dá. Por isso ela vira sozinha na virada do ano.',
    progresso: 'Você já abriu {n} de {total}.',
    marca: 'cosmicguide.cloud',
  },

  // Convenção de língua, não de conteúdo: 2.450 em português, 2,450 em inglês.
  formato: {
    separadorMilhar: '.',
  },

  // -------------------------------------------------------------------------
  // OS TEMAS — o segundo modo de ordenação da tela
  // -------------------------------------------------------------------------
  temas: {
    zodiaco: 'O zodíaco',
    mapa: 'O mapa',
    planetas: 'Os planetas',
    lua: 'A Lua',
    oraculos: 'Os oráculos',
    leitura: 'O jeito de ler',
    mercado: 'O mercado',
  },

  // -------------------------------------------------------------------------
  // OS GRAUS DE ORIGEM — a marcação da base, explicada
  // -------------------------------------------------------------------------
  // As quatro marcas de docs/tradicao/00-LEIA-PRIMEIRO.md. A sigla é a mesma
  // nos três idiomas (é código da base); nome e glosa traduzem.
  graus: {
    FP: {
      nome: 'fonte primária',
      glosa: 'o texto antigo diz isso, e a pesquisa aponta obra e capítulo',
    },
    TP: {
      nome: 'tradição posterior',
      glosa: 'surgiu depois do mundo antigo, com autor e data conhecidos',
    },
    IR: {
      nome: 'invenção recente',
      glosa: 'não tem raiz antiga: nasceu nos séculos XIX, XX ou XXI',
    },
    AM: {
      nome: 'academia moderna',
      glosa: 'é conclusão de pesquisa histórica, dos séculos XIX ao XXI',
    },
  },

  // -------------------------------------------------------------------------
  // OS RÓTULOS DO COMPARTILHÁVEL
  // -------------------------------------------------------------------------
  // Ficam separados do chrome porque não são da tela: viajam no WhatsApp de
  // quem recebe. O motor monta as linhas e fecha SEMPRE no link.
  compartilhar: {
    idade: 'Idade real:',
    pensam: 'O que pensam:',
    quem: 'Quem inventou:',
    recibo: 'Recibo:',
  },

  // -------------------------------------------------------------------------
  // AS TRINTA ENTRADAS
  // -------------------------------------------------------------------------
  itens: {
    // --- o zodíaco ---------------------------------------------------------
    'zodiaco-12': {
      coisa: 'O zodíaco de doze signos de 30°',
      oQuePensam: 'Tem 5.000 anos e é a coisa mais antiga da astrologia.',
      quemInventou: 'os astrônomos da Babilônia',
      quando: 'c. 450–400 a.C.',
      fonte: 'Babilônia, c. 450–400 a.C.',
      detalhe:
        'Esta é a linha em que a resposta honesta impressiona mais que o chute redondo. Os babilônios trocaram as constelações, que têm tamanhos bem diferentes, por doze fatias iguais de 30° na eclíptica — a faixa do céu por onde o Sol parece caminhar. Sem essa grade não existe dizer "Marte em Gêmeos" como coordenada, e é sobre ela que roda a astrologia inteira até hoje.',
    },
    'homem-zodiacal': {
      coisa: 'O Homem Zodiacal, que dá a cada signo uma parte do corpo',
      oQuePensam: 'Está no Tetrabiblos, é lista de Ptolomeu.',
      quemInventou: 'Manílio, no poema Astronomica',
      quando: 'séc. I d.C.',
      fonte: 'Manílio, Astronomica II.453–465, séc. I; corroborado por Vétio Valente',
      detalhe:
        'A lista que reparte o corpo entre os doze signos não está onde todo mundo jura que está. Ptolomeu enumera a correspondência dos planetas; quem escreve a dos signos é Manílio, num poema em versos. E nela Leão não fica com o coração — fica com os flancos e as omoplatas.',
    },

    // --- o mapa ------------------------------------------------------------
    'mapa-natal': {
      coisa: 'O mapa natal com Ascendente e casas',
      oQuePensam: 'Os babilônios já liam mapa natal, há 5.000 anos.',
      quemInventou: 'autores gregos de Alexandria, sob os pseudônimos Nechepso e Petosiris',
      quando: 'c. 150–120 a.C.',
      fonte: 'Corpus de Nechepso e Petosiris, c. 150–120 a.C.; primeira coleção dos fragmentos: Riess, 1892',
      detalhe:
        'A parte mais saborosa desta linha é o começo: a astrologia ocidental estreia com uma invenção de antiguidade. Os textos que fundam o mapa natal circulam assinados por um faraó e um sacerdote egípcios, e os dois são pseudônimos de gregos que escreviam naquele momento em Alexandria. Dar pedigree antigo a coisa nova não corrompeu a tradição depois: está lá desde o primeiro dia dela.',
    },
    'aspectos-maiores': {
      coisa: 'Os cinco aspectos maiores',
      oQuePensam: 'Geometria sagrada de origem perdida no tempo.',
      quemInventou: 'a tradição helenística; sistematizados por Ptolomeu',
      quando: 'c. 150–120 a.C.; sistematização no séc. II',
      fonte: 'Ptolomeu, Tetrabiblos I.13, séc. II',
      detalhe:
        'Oposição, trígono, quadratura e sextil não são desenho de mago: Ptolomeu tira os ângulos de proporções musicais aplicadas ao meio-círculo. E o critério dele para "combina" não é elemento, é o gênero do signo — a versão "fogo com ar" é resumo de segunda mão. A conjunção, para ele, nem entra na lista.',
    },
    'casas-inteiras': {
      coisa: 'As Casas Inteiras, uma casa por signo',
      oQuePensam: 'Modinha de rede social, invenção de agora.',
      quemInventou: 'é o método original da astrologia helenística',
      quando: 'c. 150–120 a.C.',
      fonte: 'Método helenístico original; Holden, 1982 · Hand, 2000/2007 · Brennan, 2017',
      detalhe:
        'Volta e meia alguém chama Casas Inteiras de moda passageira, e é o contrário: é com esse método que a astrologia de casas começou, cada casa ocupando um signo inteiro, sem cortar grau no meio. Holden publicou sobre isso em 1982, Hand em 2000 e Brennan em 2017 — e na Índia o sistema nunca deixou de ser usado. O que é moderno aqui é o nome em inglês.',
    },
    horaria: {
      coisa: 'A astrologia horária, a pergunta que vira mapa',
      oQuePensam: 'Técnica grega antiga, dos primeiros astrólogos.',
      quemInventou: 'astrólogos do mundo islâmico',
      quando: 'séc. IX',
      fonte: 'Mundo islâmico, séc. IX; herdada por Lilly, 1647',
      detalhe:
        'Fazer a pergunta em voz alta e levantar o mapa do minuto da pergunta é uma das coisas mais engenhosas do ofício — e não é grega. O ramo amadurece no mundo islâmico, e é de lá que Lilly herda o que viraria o coração da tradição inglesa. Aquele clichê de que os árabes "só preservaram" não se sustenta: eles desenvolveram.',
    },
    'partes-arabes': {
      coisa: 'As "partes árabes", como a Parte da Fortuna',
      oQuePensam: 'Invenção árabe medieval, de cabo a rabo.',
      quemInventou: 'o nome é do mundo islâmico; o conceito de lote é helenístico',
      quando: 'séc. IX o nome; c. 150–120 a.C. o conceito',
      fonte: 'Mundo islâmico, séc. IX; conceito de lote: tradição helenística',
      detalhe:
        'O nome entrega uma origem, e a origem está pela metade. Os lotes — pontos que se calculam por arco, sem astro nenhum ocupando aquele lugar do céu — já estão na astrologia grega; o que os árabes fizeram foi multiplicá-los. Ptolomeu, aliás, era dos que podavam: ele descarta quase todos.',
    },
    'aspectos-menores': {
      coisa: 'Os aspectos menores: quintil, semiquadratura, sesquiquadratura',
      oQuePensam: 'Refinamento antigo, para leitura avançada.',
      quemInventou: 'Johannes Kepler',
      quando: '1619',
      fonte: 'Kepler, Harmonice Mundi, Livro IV, 1619',
      detalhe:
        'Quem inventou os ângulos "extras" do mapa foi o mesmo homem que descobriu como os planetas se movem. Kepler os tirou de razões harmônicas, no mesmo livro em que trabalhava a música das órbitas — e, para ele, astronomia e astrologia reformada não brigavam. Ptolomeu reconhece cinco figuras e dá razão para só essas existirem.',
    },
    placidus: {
      coisa: 'O sistema de casas Placidus',
      oQuePensam: 'É o sistema tradicional, o de Ptolomeu.',
      quemInventou: 'publicado por Placidus de Titis; o Swiss Ephemeris credita a invenção a Magini',
      quando: '1650',
      fonte: 'Placidus de Titis, 1650; atribuição de invenção a Magini (1555–1617), via Swiss Ephemeris',
      detalhe:
        'É o padrão que quase todo site usa, e por isso parece o mais antigo de todos — é dos mais novos desta lista. Saiu impresso em 1650, e o Swiss Ephemeris, a biblioteca de cálculo que roda por baixo de quase todo software de astrologia, credita a invenção a Magini, um século antes. O Tetrabiblos, que costuma levar a fama, não descreve sistema de casas nenhum.',
    },

    // --- os planetas -------------------------------------------------------
    'urano-aquario': {
      coisa: 'Urano como regente de Aquário',
      oQuePensam: 'Regência clássica, de toda a vida.',
      quemInventou: 'Smith e Varley, depois da descoberta do planeta em 1781',
      quando: '1825–1828',
      fonte: 'Ptolomeu, Tetrabiblos I.17, séc. II; atribuição a Urano: Smith, 1825 · Varley, 1828',
      detalhe:
        'Um planeta que ninguém tinha visto não podia reger coisa nenhuma, e Urano só apareceu num telescópio em 1781. Quem é dono de Aquário na tradição é Saturno — o signo é domicílio dele, e domicílio quer dizer o lugar em que o planeta está em casa, mandando. A troca aparece por volta de 1825 e ainda estava em discussão nos almanaques de 1834.',
    },
    'saturno-mestre': {
      coisa: 'Saturno, o grande mestre e professor do mapa',
      oQuePensam: 'Leitura antiga, o planeta das lições de sempre.',
      quemInventou: 'Liz Greene',
      quando: '1976',
      fonte: 'Liz Greene, 1976; contraponto antigo: Vétio Valente, Antologias, séc. II',
      detalhe:
        'Todo post sobre retorno de Saturno traz um professor severo, e o professor tem menos idade que muito pai de família. Nos autores antigos ele é o maléfico maior, e o que muda a leitura é a seita — se a pessoa nasceu de dia ou de noite. A figura do mestre que amadurece foi publicada por Liz Greene em 1976.',
    },
    'mercurio-retrogrado': {
      coisa: '"Mercúrio retrógrado quebra aparelho e derruba contrato"',
      oQuePensam: 'Regra antiga, avisada pelos astrólogos há séculos.',
      quemInventou: 'sem autor identificado — a pesquisa procurou e não achou',
      quando: 'séculos XX e XXI, sem data exata',
      fonte: 'Sem fonte antiga; o que Valente diz: Antologias, séc. II. Rastreio de imprensa: 1996',
      detalhe:
        'O bode expiatório mais popular do calendário não tem certidão de nascimento. A pesquisa foi atrás do inventor da regra e voltou de mãos vazias: isso circula como folclore de internet, e antes de 1996 nem os jornais falavam nisso. Já o que Valente escreve no séc. II é atraso e nada além: para ele o retrógrado "adia expectativas, ações e lucros".',
    },

    // --- a Lua -------------------------------------------------------------
    superlua: {
      coisa: 'A Superlua',
      oQuePensam: 'Fenômeno astronômico clássico, com nome antigo e tudo.',
      quemInventou: 'Richard Nolle, astrólogo',
      quando: '1979',
      fonte: 'Richard Nolle, revista Dell Horoscope, 1979',
      detalhe:
        'A manchete promete lua gigante e você sai de casa pra ver uma lua igualzinha à de ontem. Nem da astronomia o nome é: quem cunhou "superlua" foi um astrólogo, numa revista de horóscopo, e o termo técnico é perigeu-sizígia — lua cheia no ponto da órbita mais perto da Terra. Virou manchete de verdade só a partir de 2011.',
    },
    'oito-fases': {
      coisa: 'As oito fases da Lua e o significado de cada uma',
      oQuePensam: 'Ciclo lunar milenar, uma lição por fase.',
      quemInventou: 'Dane Rudhyar',
      quando: '1936',
      fonte: 'Dane Rudhyar, The Astrology of Personality, 1936; The Lunation Cycle, 1967',
      detalhe:
        'O carrossel das oito fases circula como se fosse coisa de avó, e é mais novo que a geladeira dela. Quem montou os oito tipos, com leitura de personalidade em cada um, foi Dane Rudhyar. Antes disso a divisão era outra: Ptolomeu trabalha com quatro quartos e fala de qualidades — quente, frio, seco, úmido —, nunca de temperamento.',
    },
    'luas-cheias-nomes': {
      coisa: 'Os nomes das luas cheias: Lua do Lobo, Lua do Morango',
      oQuePensam: 'Nomes de povos originários, passados de geração em geração.',
      quemInventou: "Maine Farmers' Almanac, um almanaque agrícola americano",
      quando: 'anos 1930',
      fonte: "Maine Farmers' Almanac, anos 1930; lista impressa mais antiga verificada: Beard, 1918",
      detalhe:
        'Todo mês o feed anuncia um nome novo pra lua cheia, e o nome nunca combina com o quintal daqui. A lista saiu de um almanaque de fazendeiro do nordeste dos Estados Unidos e descreve o calendário agrícola de lá, o que explica a "Lua da Neve" cair no auge do verão brasileiro. A impressa mais antiga que a pesquisa achou é de 1918, feita para os Boy Scouts, e nem é a famosa.',
    },
    'lua-de-sangue': {
      coisa: 'A "Lua de Sangue"',
      oQuePensam: 'Termo bíblico antigo para eclipse lunar.',
      quemInventou: 'o pastor Mark Biltz; popularizado pelo livro de John Hagee',
      quando: '2008; o livro em 2013',
      fonte: 'Mark Biltz, 2008 · John Hagee, Four Blood Moons, 2013',
      detalhe:
        'De tudo que soa bíblico nesta lista, este nome é mais novo que o primeiro iPhone. Quem passou a chamar eclipse lunar assim foi um pastor dos Estados Unidos, e a ideia virou livro popular cinco anos depois. A imagem está em Joel 2:31, isso é verdade — o que não está lá é o nome do fenômeno, e astrônomo não usa.',
    },

    // --- os oráculos -------------------------------------------------------
    'taro-divinatorio': {
      coisa: 'O tarô como sistema de adivinhação',
      oQuePensam: 'Livro sagrado do Egito, guardado pelos sacerdotes.',
      quemInventou: 'Antoine Court de Gébelin',
      quando: '1781',
      fonte: 'Court de Gébelin, Le Monde primitif, vol. 8, "Du Jeu des Tarots", 1781',
      detalhe:
        'Antes de virar oráculo, aquele baralho passou uns três séculos e meio em mesa de jogo valendo dinheiro — e ainda hoje se joga tarocco na Itália. A virada tem capítulo e ano: um erudito francês publicou a tese egípcia em 1781, e o primeiro método de leitura saiu dois anos depois. Dá seis séculos de imagem e dois e meio de leitura.',
    },
    'rider-waite': {
      coisa: 'O baralho Rider-Waite-Smith como "o tarô tradicional"',
      oQuePensam: 'É o desenho de sempre, o baralho original.',
      quemInventou: 'Pamela Colman Smith desenhou; A. E. Waite dirigiu',
      quando: '1909–1911',
      fonte: 'Rider-Waite-Smith, dezembro de 1909; A. E. Waite, The Pictorial Key to the Tarot, 1911',
      detalhe:
        'É o baralho que aparece em toda foto de tarô, e é justamente por isso que ele parece o mais antigo. As 78 imagens são de Pamela Colman Smith e saíram em dezembro de 1909, com o livro no ano seguinte. Chamar esse baralho de tradicional apaga uns 470 anos de tarô que veio antes dele.',
    },
    'simbolos-borra-cafe': {
      coisa: 'O dicionário de símbolos da borra de café',
      oQuePensam: 'Tradição turca milenar, símbolo por símbolo.',
      quemInventou: '"A Highland Seer" e Cicely Kent; quem repartiu a xícara não foi identificado',
      quando: '1881–1922',
      fonte: 'Tea-Cup Reading and Fortune-Telling by Tea Leaves, "A Highland Seer", 1881 · Cicely Kent, 1922',
      detalhe:
        'Pássaro é notícia, âncora é firmeza, anel é união: essa tabela toda tem endereço, e o endereço é a Grã-Bretanha. Ela foi impressa como brincadeira de sala de visita entre 1881 e 1922, no ambiente do chá da tarde. Já a divisão da xícara em alça, borda e fundo a pesquisa procurou e não achou quem codificou: fica declarado.',
    },

    // --- o jeito de ler ----------------------------------------------------
    'signo-personalidade': {
      coisa: '"Seu signo é X, então você é assim"',
      oQuePensam: 'Os antigos já descreviam as doze personalidades.',
      quemInventou: 'Alan Leo',
      quando: 'c. 1895–1910',
      fonte: 'Alan Leo, c. 1895–1910',
      detalhe:
        'Aquele quadro de "como cada signo age numa briga" tem menos idade que o cinema falado. O formato de retrato por signo é do inglês Alan Leo, na virada para o séc. XX, e foi ele que pôs o Sol no centro de tudo. Para Ptolomeu, quem descreve o caráter são Mercúrio e a Lua — e não existe capítulo das doze personalidades.',
    },
    'retratos-goodman': {
      coisa: 'Os retratos de signo que circulam hoje',
      oQuePensam: 'Descrição de sempre, herdada dos gregos.',
      quemInventou: 'Linda Goodman',
      quando: '1968',
      fonte: 'Linda Goodman, Sun Signs, 1968',
      detalhe:
        'O texto que você reconhece do seu signo — o jeito de amar, de brigar, de trabalhar — veio quase todo de um livro de banca. Linda Goodman publicou Sun Signs em 1968 e fixou o vocabulário que o mercado repete até agora. Valente, no séc. II, também descreve signo por signo, e o retrato dele é irreconhecível pra quem lê horóscopo hoje.',
    },
    'potencial-psicologico': {
      coisa: 'O mapa como retrato do potencial de cada um',
      oQuePensam: 'A astrologia sempre foi ferramenta de autoconhecimento.',
      quemInventou: 'Dane Rudhyar',
      quando: '1936',
      fonte: 'Dane Rudhyar, The Astrology of Personality, 1936',
      detalhe:
        'A ideia de que o mapa mostra quem você pode vir a ser, e não o que vai te acontecer, é a moldura que este app usa. Ela tem autor e ano: Dane Rudhyar reescreveu o vocabulário inteiro da astrologia em 1936, trazendo Jung para dentro dela. A astrologia antiga era outra coisa — previa evento, num quadro fatalista.',
    },
    'nao-e-previsao': {
      coisa: '"Não é previsão, são tendências"',
      oQuePensam: 'A ressalva elegante e antiga da astrologia.',
      quemInventou: 'Alan Leo, na defesa dos processos por adivinhação',
      quando: '1914 e 1917',
      fonte: 'Processos de Alan Leo, Londres, 1914 e 1917',
      detalhe:
        'Essa frase está na boca de todo app de astrologia, inclusive neste aqui. Ela nasceu num tribunal de Londres: Alan Leo respondia por adivinhação, e a defesa sustentava que aquilo era descrição de tendência, não leitura de fortuna. A promotoria leu no julgamento uma linha em que o almanaque dele previa morte na família; ele foi condenado em 1917, e a ressalva virou herança do mercado inteiro.',
    },
    'karma-mapa': {
      coisa: 'Karma e vidas passadas no mapa',
      oQuePensam: 'Camada antiga da astrologia, herdada do Oriente.',
      quemInventou: 'a Sociedade Teosófica e seus herdeiros',
      quando: 'a partir de 1875',
      fonte: 'Teosofia, 1875 em diante',
      detalhe:
        'Quando alguém diz que você "veio pagar alguma coisa", o vocabulário é bem mais novo que a astrologia. Karma, dívida e vidas passadas não estão em Ptolomeu, em Valente, em Fírmico, em Bonatti nem em Lilly. Entram no Ocidente pela Teosofia, uma sociedade fundada em 1875, que trouxe vocabulário indiano para dentro do mapa.',
    },
    'nodos-missao': {
      coisa: 'O Nodo Norte como "missão da alma"',
      oQuePensam: 'Sabedoria védica antiga sobre o propósito de vida.',
      quemInventou: 'a camada teosófica; o formato popular é de Martin Schulman',
      quando: 'a partir de 1875; Schulman, 1975',
      fonte: 'Teosofia, 1875 em diante · Martin Schulman, Karmic Astrology, 1975',
      detalhe:
        'Se alguém já leu a sua missão de vida apontando um ponto do mapa, esse ponto tem etiqueta nova. O jyotish, que é a astrologia indiana, não lê Rahu e Ketu como indicadores de carma pessoal — então o rótulo "védico" não para em pé. A leitura chega pela Teosofia e vira livro em 1975, com Martin Schulman.',
    },
    'astrologia-tradicional': {
      coisa: 'A "astrologia tradicional" que se ensina hoje',
      oQuePensam: 'É a astrologia antiga direta da fonte, sem intermediário.',
      quemInventou: 'Project Hindsight — Robert Schmidt, Ellen Black, Robert Zoller e Robert Hand',
      quando: '1992–93',
      fonte: 'Project Hindsight, 1992–93',
      detalhe:
        'O que se vende hoje como "astrologia tradicional" é mais novo que muita gente que está lendo isto. É uma reconstrução: a partir de 1992 um grupo de tradutores começou a passar para o inglês textos gregos que ninguém tinha traduzido, e remontou o sistema a partir deles. Onde faltou texto entrou interpretação, e há disputa aberta entre os próprios reconstrutores.',
    },

    // --- o mercado ---------------------------------------------------------
    'horoscopo-jornal': {
      coisa: 'O horóscopo diário por signo',
      oQuePensam: 'É o formato clássico da astrologia, de sempre.',
      quemInventou: 'R. H. Naylor, no jornal Sunday Express',
      quando: '24 de agosto de 1930',
      fonte: 'R. H. Naylor, Sunday Express, 24/08/1930',
      detalhe:
        'Dá pra marcar no calendário o dia em que o horóscopo do seu feed nasceu: um domingo de agosto, num jornal de Londres, por causa de uma princesa recém-nascida. Deu tão certo que virou seção fixa, e o formato de doze caixinhas veio da limitação de espaço da página. A parte antiga da astrologia é outra — o mapa inteiro, com hora e lugar.',
    },
    'porcentagem-compatibilidade': {
      coisa: 'A porcentagem de compatibilidade entre signos',
      oQuePensam: 'É cálculo tradicional, tirado de livro antigo.',
      quemInventou: 'sem autor identificado — a pesquisa procurou e não achou',
      quando: 'século XX, sem data exata',
      fonte: 'Sem fonte antiga; a escala que existe: Ptolomeu, Tetrabiblos IV.7, séc. II',
      detalhe:
        'Esta é uma das linhas que a pesquisa não conseguiu datar, e a ausência já é a resposta. Número de compatibilidade não existe em fonte ocidental antiga, medieval ou renascentista: varreram Ptolomeu, Doroteu, Māshāʾallāh e Lilly e não acharam nenhum. A régua que a fonte antiga oferece é outra — quatro degraus ordenados, com um terço dos pares de signos ficando de fora, sem nem se ver.',
    },
    'frequencias-hz': {
      coisa: 'A frequência em Hz de cada signo',
      oQuePensam: 'Correspondência antiga entre o som e o céu.',
      quemInventou: 'sem autor identificado — vocabulário de marketing de bem-estar',
      quando: 'séculos XX e XXI, sem data exata',
      fonte: 'Sem fonte antiga; pedra e planta por signo, essas têm: Culpeper, 1653',
      detalhe:
        'Não dá pra datar quem juntou signo e número de hertz, porque não há autor: a pesquisa procurou e não achou. Os números que circulam — 528, 432, 639 — vêm das chamadas frequências solfeggio, que são do séc. XX e não aparecem em fonte antiga nenhuma. Pedra e planta por signo, essas sim têm tradição datável, e ela é de Culpeper, 1653.',
    },
    'app-astrologia': {
      coisa: 'O app de astrologia como categoria',
      oQuePensam: 'Parece que sempre existiu; já se nasce com um no bolso.',
      quemInventou: 'Co-Star, em Nova York',
      quando: '2017',
      fonte: 'Co-Star, Nova York, 2017; The Pattern e Sanctuary, 2017–2019',
      detalhe:
        'A coisa mais nova desta lista é justamente a que você está segurando. O gênero "app de astrologia" nasceu em 2017, com o Co-Star em Nova York, e ganhou corpo com The Pattern e Sanctuary logo depois. Nenhuma tradição antiga tem regra para leitura entregue por sistema, sem pessoa no circuito: a ética disso é toda contemporânea, inclusive a deste app.',
    },
  },
};
