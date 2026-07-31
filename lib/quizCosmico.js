// lib/quizCosmico.js
// O QUIZ "VOCÊ SABIA?" — 40 perguntas de múltipla escolha que derrubam mito com
// fonte, servidas em rodadas de 7 por dia. É a mecânica dos dois concorrentes
// medidos (aprender jogando), com a diferença que é o produto inteiro deste
// app: aqui errar ENSINA, porque a explicação conta a história real — com obra,
// autor e século no recibo.
//
// ATENÇÃO AO NOME: existe screens/QuizScreen.js, que é o quiz do CASAL — outra
// feature, outra tela, outro motor. Este arquivo não tem relação com ele.
//
// ===========================================================================
// AS REGRAS QUE ESTE ARQUIVO OBEDECE (e test/quizCosmico.test.js cobra)
// ===========================================================================
// (1) PRENDE PRIMEIRO, FONTE DEPOIS — regra da casa (docs/tradicao/00-tese.md e
//     o feedback literal do dono em lib/rituais.js). Toda `explicacao` abre em
//     português de conversa, no concreto; o recibo mora no campo `fonte`, que a
//     tela mostra DEPOIS da explicação. O teste confere que os primeiros 40
//     caracteres da explicação não carregam "séc." nem ano de quatro dígitos.
//
// (2) NADA INVENTADO — todo fato vem da base docs/tradicao/ e cada pergunta
//     carrega `base` com o caminho do documento onde ele foi conferido. Onde a
//     base diz "não encontrei fonte", a pergunta diz isso também (é o caso da
//     tiragem de três cartas). Fonte além do que a base registra não entra:
//     por isso Sexto Empírico vai sem locus de capítulo e a Escala do Doze de
//     Agrippa vai pelo nome que a base usa.
//
// (3) LINHA VERMELHA — nenhuma alegação de saúde nem implícita, nenhuma
//     promessa de resultado, nenhum mecanismo pseudocientífico. Mesma régua de
//     lib/rituais.js e lib/grounding.js; o teste varre TODO texto visível
//     daqui (perguntas, opções, explicações, fontes, frases de placar) e
//     também o código-fonte inteiro da tela.
//
// (4) SEM SISTEMA PARALELO DE RECOMPENSA — a Jornada tem as medalhas
//     (lib/jornada.js) e elas são o ÚNICO sistema desse tipo no app. O placar
//     daqui termina em FRASE por faixa de acerto, e acabou. O teste confere
//     que nenhuma frase de placar fala em medalha.
//
// (5) STORAGE SEMPRE via lib/storage.js (getItemSeguro/setItemSeguro) — o
//     helper existe porque o fallback errado apagava progresso (a história
//     completa está no cabeçalho de lib/storage.js).
//
// (6) i18n NÃO FOI TOCADO NESTA FASE — o conteúdo vive aqui em PT (padrão
//     declarado de lib/synastry.js e lib/rituais.js) e o chrome da tela usa
//     constantes locais em screens/QuizCosmicoScreen.js. TODO(i18n): o
//     integrador da fase 2 é o único que mexe em lib/i18n.js/routes/App/Home.
//
// ===========================================================================
// A RODADA DO DIA É DETERMINÍSTICA, E ISSO É DECISÃO DE PRODUTO
// ===========================================================================
// Mesmo dia = mesmas 7 perguntas, para todo mundo, em qualquer aparelho. Três
// razões: (a) dá assunto — duas pessoas podem comparar a rodada do dia;
// (b) recarregar a tela no meio da rodada não embaralha as perguntas que
// faltam (o progresso salvo continua apontando pras mesmas 7); (c) nada de
// Math.random — mesma decisão de lib/brindes.js e lib/lovePhrase.js, pelas
// mesmas razões. O dia é o dia LOCAL (lib/localDay.js), nunca UTC.

import { localDayStr } from './localDay';
import { getItemSeguro, setItemSeguro } from './storage';

export const TAMANHO_RODADA = 7;
export const CHAVE_QUIZ_COSMICO = 'cosmic-quiz-cosmico-v1';

// Rótulos de exibição dos três temas. PT literal — ver nota (6) do cabeçalho.
export const TEMA_ROTULOS = {
  taro: 'Tarô',
  lua: 'Lua',
  historia: 'História',
};

// ---------------------------------------------------------------------------
// AS PERGUNTAS
// ---------------------------------------------------------------------------
// Formato de cada uma:
//   id         → único, kebab-case, prefixado pelo tema
//   tema       → 'taro' | 'lua' | 'historia'
//   pergunta   → o enunciado
//   opcoes     → SEMPRE 4, todas distintas; errar tem que ser plausível e, de
//                preferência, divertido — a opção errada boa é a que o mercado
//                repete com convicção
//   certaIdx   → índice da única certa (0-3)
//   explicacao → 2-3 frases que ENSINAM depois da resposta. Nunca humilha quem
//                errou: a explicação conta a história, não corrige a pessoa
//   fonte      → o recibo visível: obra, autor, século/ano
//   base       → onde na base docs/tradicao/ o fato foi conferido (técnico,
//                não vai pra tela)
export const PERGUNTAS = [
  // ======================= TARÔ =======================
  {
    id: 'taro-leitura-nascimento',
    tema: 'taro',
    pergunta: 'O tarô como leitura do futuro nasceu quando?',
    opcoes: [
      'No Egito antigo, com o Livro de Thoth',
      'Na Itália do século XV, junto com as cartas',
      'No século XVIII — antes disso, o tarô era só jogo',
      'Na Grécia clássica, nos templos de oráculo',
    ],
    certaIdx: 2,
    explicacao:
      'O baralho existe desde a Itália do século XV — mas passou uns 350 anos sendo jogo de aposta e salão, e ainda é jogado até hoje na França e na Áustria. A leitura mais antiga documentada é uma folha bolonhesa de antes de 1750, e o primeiro método publicado é de Etteilla, em 1783. Resumo honesto: seis séculos de imagem, dois séculos e meio de leitura.',
    fonte: 'Folha bolonhesa (antes de 1750), achada por Franco Pratesi · Etteilla, primeiro método publicado, 1783',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §2.1 e §3.4',
  },
  {
    id: 'taro-egito-autor',
    tema: 'taro',
    pergunta: 'Quem inventou a história de que o tarô vem do Egito?',
    opcoes: [
      'Sacerdotes egípcios, em papiros do templo',
      'Antoine Court de Gébelin, num livro de 1781',
      'Os primeiros fabricantes de cartas italianos',
      'Aleister Crowley, em 1944',
    ],
    certaIdx: 1,
    explicacao:
      'Court de Gébelin viu um jogo de tarô numa reunião social em Paris, achou que reconhecia símbolos egípcios e publicou que era o Livro de Thoth — sem apresentar um único documento. O detalhe que derruba tudo: ele escreveu isso em 1781, e ninguém no mundo lia egípcio antes de Champollion decifrar os hieróglifos, em 1822.',
    fonte: 'Antoine Court de Gébelin, Le Monde primitif, vol. 8, "Du Jeu des Tarots", 1781',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §2.2',
  },
  {
    id: 'taro-waite-refuta',
    tema: 'taro',
    pergunta: 'O que Waite — autor do baralho mais vendido do mundo — escreveu em 1911 sobre a origem egípcia do tarô?',
    opcoes: [
      'Que não há "uma partícula de evidência" para ela',
      'Que era o maior segredo do baralho',
      'Que só iniciados podiam confirmá-la',
      'Que os faraós a deixaram gravada nos templos',
    ],
    certaIdx: 0,
    explicacao:
      'Waite dedica uma seção inteira do Pictorial Key a desmontar Court de Gébelin: chama os dez argumentos dele de "pilares de areia" e lembra que a etimologia egípcia foi proposta quando ninguém sabia ler egípcio. Quem diz que o tarô não vem do Egito está do lado do autor do baralho — não contra ele.',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, Parte I §4, 1911',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §2.2',
  },
  {
    id: 'taro-quem-desenhou',
    tema: 'taro',
    pergunta: 'Quem desenhou as 78 cartas do famoso "baralho de Waite", lançado em dezembro de 1909?',
    opcoes: [
      'O próprio A. E. Waite',
      'Éliphas Lévi',
      'Uma gráfica anônima de Londres',
      'A artista Pamela Colman Smith',
    ],
    certaIdx: 3,
    explicacao:
      'Waite encomendou e dirigiu, mas quem desenhou carta por carta foi Pamela Colman Smith — por isso o nome justo é Rider-Waite-Smith. Para as 56 cartas menores, Smith se apoiou no Sola Busca, um baralho italiano de cerca de 1491 cujas fotos tinham acabado de entrar no British Museum, em 1907.',
    fonte: 'Baralho Waite-Smith, dez/1909 · A. E. Waite, The Pictorial Key to the Tarot, 1911',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §5.10',
  },
  {
    id: 'taro-estrela',
    tema: 'taro',
    pergunta: 'Na lista de significados de Waite (1911), a carta da Estrela quer dizer, em primeiro lugar...',
    opcoes: [
      'Esperança e futuro brilhante',
      'Uma viagem longa por mar',
      'Perda, roubo, privação, abandono',
      'Reencontro com um amor antigo',
    ],
    certaIdx: 2,
    explicacao:
      'É o caso mais chocante da lista: Waite escreve "Loss, theft, privation, abandonment" — e só depois anota que "outra leitura diz: esperança e boas perspectivas". A leitura moderna inverteu a prioridade seguindo a imagem de Smith, não o texto de Waite: as duas metades do baralho nunca contaram a mesma história.',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911 — carta XVII, A Estrela',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §5.14',
  },
  {
    id: 'taro-morte',
    tema: 'taro',
    pergunta: 'E a carta da Morte, na mesma lista de Waite (1911), significa...',
    opcoes: [
      'Nunca significa morte, só recomeço',
      '"Fim, mortalidade, destruição"',
      'Herança inesperada',
      'Um casamento próximo',
    ],
    certaIdx: 1,
    explicacao:
      'A leitura "transformação" é uma escolha ética do século XX — legítima, e é a que este app usa —, mas não estava lá no começo: Waite escreve "End, mortality, destruction, corruption". Saber o que o autor escreveu e o que a prática escolheu depois é meio caminho pra ler tarô sem repetir lenda.',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911 — carta XIII',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §5.13',
  },
  {
    id: 'taro-cruz-celta',
    tema: 'taro',
    pergunta: 'A tiragem "Cruz Celta" é celta?',
    opcoes: [
      'Sim — vem dos druidas da Irlanda',
      'Sim — está em manuscritos medievais',
      'Não — é egípcia, apesar do nome',
      'Não — o nome é de Waite, em 1911',
    ],
    certaIdx: 3,
    explicacao:
      'O nome aparece pela primeira vez no livro de Waite, que diz apenas que o método "era usado em privado há muitos anos". A estrutura vem dos círculos da Golden Dawn dos anos 1890 — nenhuma atestação celta, nenhum druida no processo.',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, Parte III §7, 1911',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §3.2',
  },
  {
    id: 'taro-tres-cartas',
    tema: 'taro',
    pergunta: 'A tiragem de três cartas Passado / Presente / Futuro vem de onde?',
    opcoes: [
      'Ninguém achou fonte primária — popularizou-se no século XX',
      'Do Pictorial Key de Waite',
      'Da Golden Dawn',
      'Dos templos do Egito',
    ],
    certaIdx: 0,
    explicacao:
      'Waite dá três métodos no livro — de 10, 42 e 35 cartas — e nenhum é um três-cartas temporal; a Golden Dawn usava outra tiragem, a Opening of the Key, uma operação de horas. A tiragem de três é legítima como prática — só não dá pra chamá-la de "a clássica", porque ninguém achou o texto que a funda.',
    fonte: 'Verificado em A. E. Waite, The Pictorial Key to the Tarot, 1911 — a tiragem não está lá',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §3.6',
  },
  {
    id: 'taro-invertidas',
    tema: 'taro',
    pergunta: 'Quem foi o primeiro a publicar significados de carta invertida, um por carta?',
    opcoes: [
      'Os fabricantes de Marselha',
      'Waite, em 1911',
      'Etteilla, a partir de 1770',
      'Uma tradição oral milenar, sem registro escrito',
    ],
    certaIdx: 2,
    explicacao:
      'Etteilla instituiu o significado invertido sistemático — toda leitura de invertida no mundo desce dele. E tem surpresa em Waite: lá, a invertida costuma ser um sentido lateral, às vezes melhor que o direto — a Roda da Fortuna de cabeça pra baixo vira "aumento, abundância".',
    fonte: 'Etteilla, primeiro manual de cartomancia com invertidas, 1770 · Waite, 1911',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §3.4 e §5.12',
  },
  {
    id: 'taro-78-cartas',
    tema: 'taro',
    pergunta: 'Todo tarô tem 78 cartas?',
    opcoes: [
      'Sim — é número fixado desde a origem',
      'Não — a Minchiate de Florença tem 97; o Bolonhês, 62',
      'Sim — 78 é a soma das letras hebraicas',
      'Não — o número muda a cada século',
    ],
    certaIdx: 1,
    explicacao:
      'O 78 é o padrão que venceu, não uma lei: a Minchiate florentina tem 97 cartas, o Tarocco Bolognese tem 62 e o Siciliano, 64. De quebra, isso desmonta a numerologia das "22 lâminas = 22 letras hebraicas" — os padrões históricos nem sempre têm 22 trunfos.',
    fonte: 'Padrões italianos históricos (Minchiate, Bolognese, Siciliano) — Dummett, The Game of Tarot, 1980',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §5.17',
  },
  {
    id: 'taro-marselha',
    tema: 'taro',
    pergunta: 'O "Tarô de Marselha" é o tarô mais antigo que existe?',
    opcoes: [
      'Não — os mais antigos são italianos, pintados à mão no século XV',
      'Sim — foi desenhado em Marselha no século XII',
      'Sim — chegou nas caravelas fenícias',
      'Não — é cópia do baralho de Waite',
    ],
    certaIdx: 0,
    explicacao:
      'Os tarôs mais antigos que sobreviveram são os italianos pintados à mão, como os Visconti-Sforza de meados do século XV. O padrão "de Marselha" é impressão francesa posterior (Noblet c. 1650, Conver 1760) — e o nome comercial "Ancien Tarot de Marseille" foi popularizado por Paul Marteau, da editora Grimaud, em 1930.',
    fonte: 'Paul Marteau / Grimaud, Ancien Tarot de Marseille, 1930',
    base: 'docs/tradicao/05-taro-historia-e-leitura.md §5.6-5.7',
  },

  // ======================= LUA =======================
  {
    id: 'lua-superlua',
    tema: 'lua',
    pergunta: 'Quem inventou a palavra "Superlua"?',
    opcoes: [
      'A NASA, na era Apollo',
      'Galileu, ao apontar o telescópio',
      'Os almanaques coloniais americanos',
      'O astrólogo Richard Nolle, numa revista de 1979',
    ],
    certaIdx: 3,
    explicacao:
      '"Superlua" parece termo de observatório, mas nasceu numa revista de horóscopo: Richard Nolle cunhou o nome na Dell Horoscope em 1979, e a imprensa só adotou em massa em 2011. O nome técnico é perigee syzygy — e a diferença de tamanho, real (~14%), é imperceptível a olho nu sem uma foto lado a lado.',
    fonte: 'Richard Nolle, revista Dell Horoscope, 1979',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §4.5',
  },
  {
    id: 'lua-cheia-lavoura',
    tema: 'lua',
    pergunta: 'Lua Cheia era época de quê na lavoura romana?',
    opcoes: [
      'De colher tudo o que estava maduro',
      'De semear favas',
      'De cortar madeira',
      'De tosquiar as ovelhas',
    ],
    certaIdx: 1,
    explicacao:
      'É o contrário do que se repete por aí: colher, cortar e tosquiar eram trabalho de minguante — Plínio anota que assim a planta "sofre menos dano". Na cheia, Columela mandava semear fava. A regra da roça era: crescente pra pôr, minguante pra tirar — e a fava na véspera da cheia era a instrução específica de Columela.',
    fonte: 'Columela, De Re Rustica XI.2.85, séc. I · Plínio, o Velho, Naturalis Historia XVIII.321, séc. I',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
  },
  {
    id: 'lua-nomes-almanaque',
    tema: 'lua',
    pergunta: '"Lua do Lobo", "Lua do Morango", "Lua da Neve" — de onde vêm esses nomes?',
    opcoes: [
      'Dos povos indígenas do Brasil',
      'Da mitologia grega',
      'De almanaques de fazenda dos EUA, nos anos 1930',
      'Dos druidas celtas',
    ],
    certaIdx: 2,
    explicacao:
      'A lista padrão saiu de almanaque de fazenda americano: o Maine Farmers\' Almanac publicou os nomes nos anos 1930, e o Old Farmer\'s Almanac simplificou pra um nome por mês. É uma mistura de fontes algonquianas, inglesas e celtas vendida como sistema único — e descreve o ciclo agrícola do nordeste dos EUA: "Lua da Neve" em fevereiro, aqui, cai no pico do verão.',
    fonte: 'Maine Farmers\' Almanac, anos 1930 · primeira lista impressa: Daniel Carter Beard, 1918',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §4.1-4.3',
  },
  {
    id: 'lua-rosa',
    tema: 'lua',
    pergunta: 'Em abril, a "Lua Rosa" fica rosa?',
    opcoes: [
      'Não — o nome vem de uma flor',
      'Sim — por causa do pólen na atmosfera',
      'Sim — nos anos de eclipse',
      'Não — o nome vem de uma cantora',
    ],
    certaIdx: 0,
    explicacao:
      'A flor é a Phlox subulata, o musgo-rosa que forra o chão no início da primavera do leste da América do Norte. A Lua segue da cor de sempre — o nome descreve o calendário de flores de lá, não o céu daqui.',
    fonte: 'Lista padrão do Old Farmer\'s Almanac, séc. XX',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §4.2',
  },
  {
    id: 'lua-azul',
    tema: 'lua',
    pergunta: '"Lua Azul é a segunda lua cheia do mês." Essa definição nasceu como...',
    opcoes: [
      'Folclore inglês medieval',
      'Um erro de leitura numa revista, em 1946',
      'Cálculo oficial dos observatórios',
      'Tradição dos navegadores portugueses',
    ],
    certaIdx: 1,
    explicacao:
      'James Hugh Pruett leu errado um artigo do Maine Farmers\' Almanac — que usava "Blue Moon" pra terceira cheia de uma estação com quatro — e publicou a versão "segunda do mês" na Sky & Telescope em 1946. A NPR repetiu em 1980, o Trivial Pursuit cristalizou em 1986, e a própria revista se corrigiu em 1999. Nenhuma das duas definições é antiga.',
    fonte: 'Olson, Fienberg & Sinnott, "What\'s a Blue Moon?", Sky & Telescope, maio/1999',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §4.4',
  },
  {
    id: 'lua-oito-fases',
    tema: 'lua',
    pergunta: 'As oito fases da Lua com leitura de personalidade são de que época?',
    opcoes: [
      'Da Babilônia',
      'De Roma',
      'De 1967 — Dane Rudhyar',
      'Da Grécia de Hesíodo',
    ],
    certaIdx: 2,
    explicacao:
      'A divisão antiga que tem fonte é em quatro quartos, com qualidades de clima — úmido, quente, seco, frio —, em Ptolomeu. As oito fases nomeadas com leitura psicológica são de Dane Rudhyar: formuladas no The Lunation Cycle (1967), sobre ideia que ele vinha desenvolvendo desde os anos 1930-40. E "gibosa" é só latim pra "corcunda": descreve a forma, não carrega doutrina.',
    fonte: 'Ptolomeu, Tetrabiblos I.8, séc. II · Dane Rudhyar, The Lunation Cycle, 1967',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.1',
  },
  {
    id: 'lua-minguante',
    tema: 'lua',
    pergunta: 'O que a lavoura romana reservava pra Lua minguante?',
    opcoes: [
      'Semear tudo',
      'Casar e batizar',
      'Nada — era fase de descanso',
      'Cortar, colher e tosquiar',
    ],
    certaIdx: 3,
    explicacao:
      'Tudo que se corta, se colhe e se tosquia sofre menos dano com a lua minguante — é assim que Plínio resume a regra, e Catão e Columela mandam pra minguante também a capina, o esterco e o corte de madeira. O que devia secar ou diminuir ia todo pra essa fase: é a regra lunar com mais fonte primária que existe.',
    fonte: 'Plínio, o Velho, Naturalis Historia XVIII.321-322, séc. I · Catão, De Agri Cultura 29 e 31.2, séc. II a.C.',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
  },
  {
    id: 'lua-catao-plantio',
    tema: 'lua',
    pergunta: 'Catão, no século II a.C., mandava plantar figueira e videira em qual momento da Lua?',
    opcoes: [
      'Na cheia, à meia-noite',
      'Na "lua muda" (escura), à tarde',
      'No quarto crescente, ao amanhecer',
      'Em qualquer dia par',
    ],
    certaIdx: 1,
    explicacao:
      '"Luna silente" — a lua calada, quando ela some do céu. É o registro agrícola romano da ideia de começar no escuro: a semente vai pra terra quando a Lua ainda não aparece, e cresce junto com ela. Dois mil anos depois isso virou "ritual de Lua Nova" — a raiz é instrução de fazenda.',
    fonte: 'Catão, o Velho, De Agri Cultura 40.1, séc. II a.C.',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.2',
  },
  {
    id: 'lua-sangue',
    tema: 'lua',
    pergunta: '"Lua de Sangue" como nome de eclipse existe desde quando?',
    opcoes: [
      'Desde a Bíblia',
      'Desde Roma antiga',
      'Desde 2008',
      'Desde a Idade Média',
    ],
    certaIdx: 2,
    explicacao:
      'A imagem é bíblica — "a lua se converterá em sangue", no livro de Joel —, mas o termo como nome de evento é do pastor Mark Biltz, em 2008, e virou mundial com o livro Four Blood Moons, de John Hagee. Astrônomos não usam. E a profecia da tétrade de 2014-15 não se cumpriu.',
    fonte: 'Joel 2:31 (a imagem) · Mark Biltz, 2008, e John Hagee, Four Blood Moons, 2013 (o termo)',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §4.6',
  },
  {
    id: 'lua-intencoes',
    tema: 'lua',
    pergunta: '"Escrever intenções na Lua Nova", como se pratica hoje, foi popularizado por...',
    opcoes: [
      'Jan Spiller, num livro de 2001',
      'Cleópatra',
      'Os monges copistas',
      'Nostradamus',
    ],
    certaIdx: 0,
    explicacao:
      'Plantar de verdade na lua escura é fonte primária romana — Catão e Paládio mandam. Trocar a semente por uma intenção escrita é transposição recente, popularizada por Jan Spiller no New Moon Astrology. O gesto de começar no escuro é velho; a lista de desejos é de anteontem.',
    fonte: 'Catão, De Agri Cultura 40.1, séc. II a.C. (o plantio) · Jan Spiller, New Moon Astrology, 2001 (a intenção)',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §5',
  },
  {
    id: 'lua-eclipse-pais',
    tema: 'lua',
    pergunta: 'Pra Ptolomeu, no século II, um eclipse dizia respeito a quem?',
    opcoes: [
      'A quem nasceu naquele dia',
      'A países, cidades e reis',
      'A cada pessoa, conforme o signo',
      'A ninguém — ele não escreveu sobre eclipses',
    ],
    certaIdx: 1,
    explicacao:
      'Na fonte, eclipse é assunto de mapa-múndi: Ptolomeu dedica seis capítulos do Tetrabiblos a prever efeitos sobre regiões e governantes — até a duração ele calcula por hora de escuridão. "Sua temporada de eclipses vai virar sua vida" não vem de lá: a aplicação individual é moderna.',
    fonte: 'Ptolomeu, Tetrabiblos II.4-II.9, séc. II',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.6',
  },
  {
    id: 'lua-tempo-signo',
    tema: 'lua',
    pergunta: 'Quanto tempo a Lua fica em cada signo?',
    opcoes: [
      'Exatos 2 dias e meio',
      'Uma semana',
      'Em média ~2,28 dias — e varia',
      'Um mês',
    ],
    certaIdx: 2,
    explicacao:
      'O famoso "2 dias e meio" é arredondamento: a média real é ~2,28 dias (2d 6h40m), variando de ~1,95 a ~2,55 conforme a velocidade da Lua, que muda ao longo do mês. Parece detalhe — mas é a diferença entre tabela decorada e céu calculado, que é a briga número um deste app.',
    fonte: 'Medição astronômica: mês sideral de 27,32 dias dividido pelos 12 signos',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §2',
  },
  {
    id: 'lua-colheita-hemisferio',
    tema: 'lua',
    pergunta: 'A "Lua da Colheita" (Harvest Moon) de setembro vale pro Brasil?',
    opcoes: [
      'Vale — o nome é universal',
      'Vale, mas só no Sul do país',
      'Não — no Brasil o fenômeno não existe',
      'Não — aqui o equivalente cai em março',
    ],
    certaIdx: 3,
    explicacao:
      'O fenômeno é real: perto do equinócio de outono, a Lua cheia nasce quase na mesma hora por várias noites seguidas. Só que o outono do hemisfério sul começa em março — setembro como "mês da colheita" é calendário do nordeste dos Estados Unidos; por aqui é primavera.',
    fonte: 'Fenômeno astronômico medível · nome inglês atestado desde 1706 (Merriam-Webster)',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §4.2',
  },
  {
    id: 'lua-saros',
    tema: 'lua',
    pergunta: '"Saros", o nome do ciclo dos eclipses, veio de onde?',
    opcoes: [
      'É a palavra babilônica pra "eclipse"',
      'De um erro de Halley em 1691 — apontado em 1756 e nunca corrigido',
      'Do grego, "sombra"',
      'De um astrônomo persa',
    ],
    certaIdx: 1,
    explicacao:
      'Halley pescou a palavra num léxico bizantino e colou no ciclo de 18 anos — mas šār, em babilônico, é o número 3.600, não um ciclo de eclipses. Le Gentil apontou o erro em 1756 e o nome ficou assim mesmo. Os babilônios, donos da descoberta, chamavam de "ciclo de 18 anos".',
    fonte: 'Edmond Halley, 1691; o erro apontado por Guillaume Le Gentil, 1756',
    base: 'docs/tradicao/04-lua-fases-e-calendario.md §3.6',
  },

  // ======================= HISTÓRIA =======================
  {
    id: 'hist-horoscopo-jornal',
    tema: 'historia',
    pergunta: 'O horóscopo de jornal — doze caixinhas, uma por signo — foi inventado quando?',
    opcoes: [
      'Na Babilônia',
      'Na Grécia clássica',
      'Em 24 de agosto de 1930',
      'Nos anos 1960, nos EUA',
    ],
    certaIdx: 2,
    explicacao:
      'Foi por causa de um nascimento real: o Sunday Express encomendou a R. H. Naylor um horóscopo da princesa Margaret, recém-nascida — e o jornal precisou explicar aos leitores o que era um horóscopo, porque em 1930 ninguém sabia. As doze caixinhas nasceram de um problema editorial: o único dado que todo leitor sabe de cor é a própria data de nascimento.',
    fonte: 'R. H. Naylor, "What the Stars Foretell for the New Princess", Sunday Express, 24/08/1930',
    base: 'docs/tradicao/10-historia-da-astrologia.md §9.1-9.2',
  },
  {
    id: 'hist-horoscopo-antigo',
    tema: 'historia',
    pergunta: 'O horóscopo individual mais antigo que se conhece é de que ano?',
    opcoes: ['3000 a.C.', '410 a.C.', '150 d.C.', '1781'],
    certaIdx: 1,
    explicacao:
      'É uma tábua de argila babilônica com o céu da noite de um nascimento — e é só uma lista de posições: sem Ascendente, sem casas, sem interpretação nenhuma. O mapa natal como sistema de leitura é invenção grega, uns três séculos depois, em Alexandria.',
    fonte: 'Francesca Rochberg, Babylonian Horoscopes, American Philosophical Society, 1998',
    base: 'docs/tradicao/10-historia-da-astrologia.md §1.3',
  },
  {
    id: 'hist-babilonios',
    tema: 'historia',
    pergunta: 'O que os sacerdotes da Babilônia liam no céu?',
    opcoes: [
      'Presságios de Estado — rei, guerra, colheita',
      'O mapa natal de cada pessoa',
      'O par ideal de cada signo',
      'O nome que cada criança devia receber',
    ],
    certaIdx: 0,
    explicacao:
      'A série Enūma Anu Enlil tem milhares de presságios, e todos falam ao palácio: "se tal fenômeno, então tal consequência para o rei e para o país". A astrologia mais antiga não era sobre você — o registro individual só aparece séculos depois, e a interpretação individual é grega.',
    fonte: 'Enūma Anu Enlil, série cuneiforme, compilação c. séc. XVI-XII a.C.',
    base: 'docs/tradicao/10-historia-da-astrologia.md §1.1',
  },
  {
    id: 'hist-nechepso',
    tema: 'historia',
    pergunta: 'Os textos que fundaram o mapa natal circulavam assinados por "Nechepso e Petosiris". Quem eram eles?',
    opcoes: [
      'Um faraó e um sacerdote de verdade',
      'Dois astrônomos da corte persa',
      'Discípulos diretos de Ptolomeu',
      'Pseudônimos — autores gregos fingindo antiguidade egípcia',
    ],
    certaIdx: 3,
    explicacao:
      'Autores gregos de Alexandria, por volta de 150-120 a.C., assinaram como um faraó e um sacerdote pra dar pedigree egípcio ao que estavam escrevendo naquele momento. A astrologia ocidental começa com uma falsificação de antiguidade — o mesmo gesto que Court de Gébelin repetiria com o tarô, 1.900 anos depois.',
    fonte: 'Corpus de Nechepso-Petosiris, c. 150-120 a.C.; fragmentos coligidos por Riess, 1892',
    base: 'docs/tradicao/10-historia-da-astrologia.md §2.1',
  },
  {
    id: 'hist-tendencias',
    tema: 'historia',
    pergunta: 'A frase "astrologia não prevê, aponta tendências" nasceu onde?',
    opcoes: [
      'Nos templos da Babilônia',
      'Num tribunal de Londres, como defesa criminal',
      'Num congresso de astrônomos',
      'Na contracultura dos anos 1960',
    ],
    certaIdx: 1,
    explicacao:
      'Alan Leo, o homem que industrializou o horóscopo, foi processado duas vezes por adivinhação sob a lei inglesa; a defesa dizia que ele descrevia "tendências", não fortunas. Ruiu quando a acusação leu, em voz alta, uma previsão de morte do almanaque dele — condenado, multa de cinco libras. O mercado herdou a frase sem saber que ela nasceu como tese de defesa, em 1914-1917.',
    fonte: 'Processos de Alan Leo, Londres, 1914 e 1917',
    base: 'docs/tradicao/10-historia-da-astrologia.md §8.3',
  },
  {
    id: 'hist-contra-astrologos',
    tema: 'historia',
    pergunta: 'Quem escreveu, ainda na Antiguidade, um livro inteiro chamado "Contra os Astrólogos"?',
    opcoes: [
      'Ninguém — a crítica é invenção moderna',
      'Júlio César',
      'Sexto Empírico, no século III',
      'O imperador Nero',
    ],
    certaIdx: 2,
    explicacao:
      'A discordância é tão antiga quanto a prática: Sexto Empírico escreveu o Contra os Astrólogos no século III, e ele é fonte primária tanto quanto Ptolomeu. "Conhecimento milenar" achata quatro mil anos de gente brigando — e a briga é a parte mais interessante da história.',
    fonte: 'Sexto Empírico, Contra os Astrólogos, séc. III',
    base: 'docs/tradicao/00-tese.md, proposição 2',
  },
  {
    id: 'hist-mercurio-retro',
    tema: 'historia',
    pergunta: '"Mercúrio retrógrado quebra celular e derruba contrato." O que a fonte antiga diz de verdade?',
    opcoes: [
      'Fala de atraso: expectativas e empreendimentos adiados',
      'Exatamente isso, só que com carroças',
      'Manda viajar mais',
      'Nada — ninguém observava retrogradação',
    ],
    certaIdx: 0,
    explicacao:
      'A fonte fala de espera, não de aparelho: Vétio Valente escreve que planetas retrógrados "adiam expectativas, ações, lucros e empreendimentos" — e que a segunda estação "cancela o atraso". Nada de tecnologia nem de ex. A expressão "Mercúrio retrógrado" nem aparece na imprensa geral antes de 1996.',
    fonte: 'Vétio Valente, Antologias, séc. II',
    base: 'docs/tradicao/11-planetas-em-profundidade.md §8.5',
  },
  {
    id: 'hist-retro-frequencia',
    tema: 'historia',
    pergunta: 'Planeta retrógrado no céu é coisa rara?',
    opcoes: [
      'Raríssima — uma vez por década',
      'Não — em 85,9% dos dias há algum planeta retrógrado',
      'Só acontece em ano bissexto',
      'Impossível — planeta não anda pra trás',
    ],
    certaIdx: 1,
    explicacao:
      'Medindo com a efeméride: Saturno passa 36,3% do tempo retrógrado, Plutão 44,4% — e em 85,9% dos dias tem algum planeta retrógrado no céu. Se retrogradação virasse a vida do avesso, o avesso seria o normal. O movimento é aparente: perspectiva das órbitas, não marcha a ré.',
    fonte: 'Medição própria com efeméride astronômica — base de tradição do app, doc 11',
    base: 'docs/tradicao/11-planetas-em-profundidade.md §8.6',
  },
  {
    id: 'hist-urano',
    tema: 'historia',
    pergunta: 'Aquário "sempre foi" regido por Urano?',
    opcoes: [
      'Sim — desde os caldeus',
      'Sim — está no Tetrabiblos',
      'Não — Urano só foi descoberto em 1781; na tradição, Aquário era de Saturno',
      'Não — Aquário era do Sol',
    ],
    certaIdx: 2,
    explicacao:
      'Não dá pra um signo ser "desde sempre" de um planeta que ninguém conhecia: Urano entra no mapa em 1781, e a atribuição a Aquário começa por volta de 1825-1828 — em 1834 um leitor ainda perguntava por que o planeta novo não tinha casa nenhuma. No Tetrabiblos, Aquário é domicílio de Saturno.',
    fonte: 'Ptolomeu, Tetrabiblos I.17, séc. II · atribuição a Urano: Smith, 1825 / Varley, 1828',
    base: 'docs/tradicao/11-planetas-em-profundidade.md §8.3',
  },
  {
    id: 'hist-semana-planetaria',
    tema: 'historia',
    pergunta: 'Segunda da Lua, terça de Marte... A semana planetária já era "imemorial" pros romanos?',
    opcoes: [
      'Não — quem a registra já chamava o costume de "comparativamente recente"',
      'Sim — vinha do início dos tempos',
      'Sim — foi decretada por Rômulo',
      'Não — foi inventada no século XIX',
    ],
    certaIdx: 0,
    explicacao:
      'Dião Cássio, o historiador que documenta o costume, escreve que os gregos antigos não o conheciam e que a adoção era recente — e ainda dá duas explicações concorrentes pra ordem dos dias, porque nem ele tinha certeza. Até a fonte antiga já achava a moda nova.',
    fonte: 'Dião Cássio, História Romana 37.18-19, séc. III',
    base: 'docs/tradicao/14-simbolismo-comparado.md §3.2 e §8.9',
  },
  {
    id: 'hist-porcentagem',
    tema: 'historia',
    pergunta: 'A "porcentagem de compatibilidade" entre signos vem de qual fonte antiga?',
    opcoes: [
      'Do Tetrabiblos de Ptolomeu',
      'Do Carmen Astrologicum de Doroteu',
      'Dos papiros de Alexandria',
      'De nenhuma — não existe número em fonte antiga',
    ],
    certaIdx: 3,
    explicacao:
      'Foram varridos Ptolomeu, Doroteu, Māshā\'allāh e Lilly: nenhum número, nenhum "87%". O que a tradição tem é uma escala de quatro degraus — e nela a oposição fica no fundo, não no topo que os apps costumam dar. A porcentagem é convenção de mídia do século XX, sem inventor documentado.',
    fonte: 'Ptolomeu, Tetrabiblos IV.7, séc. II (a escala ordinal); a porcentagem: séc. XX, sem autor identificado',
    base: 'docs/tradicao/02-aspectos-e-sinastria.md §3.1',
  },
  {
    id: 'hist-leao-coracao',
    tema: 'historia',
    pergunta: 'Na lista antiga que ligava signos a partes do corpo, Leão correspondia a quê?',
    opcoes: [
      'Ao coração, claro',
      'Aos flancos e às omoplatas',
      'À cabeça',
      'Aos pés',
    ],
    certaIdx: 1,
    explicacao:
      '"Leão = coração" não está em Manílio nem em Ptolomeu: em Manílio, autor da lista dos doze signos, Leão ficava com flancos e omoplatas — e Libra, que o mercado dá aos rins, ficava com as nádegas. A versão "coração" é datável: aparece impressa na Escala do Doze de Agrippa, em 1533.',
    fonte: 'Manílio, Astronomica II.453-465, séc. I · Agrippa, Escala do Doze, 1533',
    base: 'docs/tradicao/01-astrologia-fundamentos.md §3.2-3.4',
  },
  {
    id: 'hist-signo-solar',
    tema: 'historia',
    pergunta: 'Na astrologia antiga, o signo solar — "o seu signo" — era o centro de tudo?',
    opcoes: [
      'Não — o Sol era um dos sete planetas; quem marcava o indivíduo era o Ascendente',
      'Sim — desde sempre',
      'Sim — Ptolomeu manda começar por ele',
      'Não — o centro era Júpiter',
    ],
    certaIdx: 0,
    explicacao:
      'Na tradição, o significador do indivíduo é o Ascendente — e o caráter, em Ptolomeu, vem de Mercúrio e da Lua. O signo solar virou o centro por dois motivos com nome e data: Alan Leo, que precisava produzir leituras em escala, e o jornal de 1930, que precisava de doze caixinhas.',
    fonte: 'Ptolomeu, Tetrabiblos III.13, séc. II · Alan Leo, 1895-1917 · Naylor, 1930',
    base: 'docs/tradicao/10-historia-da-astrologia.md §14.8',
  },
  {
    id: 'hist-cuspide',
    tema: 'historia',
    pergunta: 'Quem nasce "na cúspide" é um pouco dos dois signos?',
    opcoes: [
      'Sim — é doutrina antiga',
      'Sim — mas só nas cúspides de água',
      'Não — a fronteira de signo é um instante exato; quem erra é a tabela de datas',
      'Não — cúspide é erro de tradução',
    ],
    certaIdx: 2,
    explicacao:
      'Os signos começam nos equinócios e solstícios, que são instantes — Ptolomeu escreve que se contam a partir deles "e de nenhuma outra fonte". Quem cria a lenda é a tabela de data fixa dos almanaques, que erra de verdade nas fronteiras (29% dos dias de virada, medido). A resposta não é "sou dos dois": é calcular a longitude do Sol na hora do nascimento — que é o que este app faz.',
    fonte: 'Ptolomeu, Tetrabiblos I.22, séc. II · medição própria do app: 318 de 1.092 dias de virada errados por tabela',
    base: 'docs/tradicao/01-astrologia-fundamentos.md §3.11-3.12',
  },
  {
    id: 'hist-5000-anos',
    tema: 'historia',
    pergunta: '"A astrologia tem 5.000 anos." Qual é a conta honesta?',
    opcoes: [
      '5.000 mesmo, desde as pirâmides',
      'Uns 2.000 a 2.500 anos de tradição textual contínua',
      '10.000, desde as cavernas',
      '300 anos, desde os jornais',
    ],
    certaIdx: 1,
    explicacao:
      'O que tem ~4.000 anos são presságios de Estado mesopotâmicos — outra coisa, sem mapa individual. O zodíaco tem ~2.450 anos, o horóscopo individual mais antigo é de 410 a.C., e o mapa natal com Ascendente tem ~2.150. Dois milênios e pouco de textos contínuos já é impressionante — não precisa inflar.',
    fonte: 'Síntese da pesquisa em fonte primária deste app — base de tradição, doc 10 §14.1',
    base: 'docs/tradicao/10-historia-da-astrologia.md §14.1',
  },
];

export function perguntaPorId(id) {
  return PERGUNTAS.find((p) => p.id === id) || null;
}

// ---------------------------------------------------------------------------
// A RODADA DO DIA — determinística, sem Math.random
// ---------------------------------------------------------------------------
// hashStr é o mesmo desenho de lib/lovePhrase.js (h*31 + charCode). O shuffle
// é Fisher-Yates alimentado por xorshift32 — só aritmética de inteiro, então o
// resultado é idêntico em qualquer plataforma e em qualquer dia do futuro.
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function embaralharIndices(n, seed) {
  // Semente 0 travaria o xorshift em 0 pra sempre — o `|| golden ratio` cobre.
  let estado = (seed >>> 0) || 0x9e3779b9;
  const proximo = () => {
    estado ^= estado << 13;
    estado >>>= 0;
    estado ^= estado >>> 17;
    estado ^= estado << 5;
    estado >>>= 0;
    return estado / 4294967296;
  };
  const idx = [];
  for (let i = 0; i < n; i += 1) idx.push(i);
  for (let i = n - 1; i > 0; i -= 1) {
    const j = Math.floor(proximo() * (i + 1));
    const tmp = idx[i];
    idx[i] = idx[j];
    idx[j] = tmp;
  }
  return idx;
}

// As 7 perguntas do dia. Mesmo `dia` (YYYY-MM-DD local) = mesma rodada, sempre.
export function rodadaDoDia(dia = localDayStr()) {
  const ordem = embaralharIndices(PERGUNTAS.length, hashStr(`quiz-cosmico:${dia}`));
  return ordem.slice(0, TAMANHO_RODADA).map((i) => PERGUNTAS[i]);
}

// ---------------------------------------------------------------------------
// O PLACAR — frase por faixa, e NADA de medalha
// ---------------------------------------------------------------------------
// A Jornada (lib/jornada.js) é dona do único sistema de medalhas do app.
// Aqui o fim de rodada devolve uma frase — sobre o CONTEÚDO, nunca veredito
// sobre a pessoa. Errar não humilha: as faixas baixas lembram que o erro tem
// autor e data, porque tem mesmo.
export const FAIXAS_PLACAR = [
  {
    min: 1,
    frase:
      'Rodada limpa: sete de sete na fonte certa. Essas são exatamente as histórias que circulam erradas por aí — e você acabou de conferir todas no recibo.',
  },
  {
    min: 5 / 7,
    frase:
      'Quase tudo na fonte certa. As que escaparam ficaram com a explicação e o recibo logo acima — e amanhã tem mais sete.',
  },
  {
    min: 3 / 7,
    frase:
      'Meio a meio — e faz sentido: boa parte dessas histórias circula errada há décadas, com data e autor do erro. Agora você sabe onde conferir.',
  },
  {
    min: 0,
    frase:
      'As respostas "óbvias" deste quiz são justamente as que o mercado repete sem fonte. Cada explicação aí de cima conta a história real, com autor e data — e amanhã tem revanche.',
  },
];

export function fraseDoPlacar(acertos, total = TAMANHO_RODADA) {
  const t = total > 0 ? total : TAMANHO_RODADA;
  const razao = Math.max(0, Math.min(1, (acertos || 0) / t));
  const faixa = FAIXAS_PLACAR.find((f) => razao >= f.min);
  return (faixa || FAIXAS_PLACAR[FAIXAS_PLACAR.length - 1]).frase;
}

// ---------------------------------------------------------------------------
// PROGRESSO — puro no meio, storage nas pontas
// ---------------------------------------------------------------------------
// O formato gravado:
//   historico   → { 'YYYY-MM-DD': { acertos, total } } — rodadas FECHADAS
//   emAndamento → { dia, respondidas, acertos } | null — a rodada de hoje, se
//                 a pessoa saiu no meio (a lista de perguntas não precisa ser
//                 gravada: rodadaDoDia(dia) é determinística e a reconstrói)
//   totais      → { respondidas, acertos } acumulados da vida
export function estadoInicialQuiz() {
  return {
    versao: 1,
    historico: {},
    emAndamento: null,
    totais: { respondidas: 0, acertos: 0 },
  };
}

// Nunca lança e nunca devolve estrutura meio-quebrada: JSON corrompido, campo
// com tipo errado ou contagem impossível (acertos > respondidas) caem fora e o
// que sobra é sempre um estado utilizável.
export function normalizarQuiz(cru) {
  if (!cru || typeof cru !== 'string') return estadoInicialQuiz();
  let bruto;
  try {
    bruto = JSON.parse(cru);
  } catch {
    return estadoInicialQuiz();
  }
  if (!bruto || typeof bruto !== 'object') return estadoInicialQuiz();

  const limpo = estadoInicialQuiz();

  if (bruto.historico && typeof bruto.historico === 'object') {
    for (const dia of Object.keys(bruto.historico)) {
      const r = bruto.historico[dia];
      if (
        r &&
        Number.isInteger(r.acertos) &&
        Number.isInteger(r.total) &&
        r.total > 0 &&
        r.acertos >= 0 &&
        r.acertos <= r.total
      ) {
        limpo.historico[dia] = { acertos: r.acertos, total: r.total };
      }
    }
  }

  const ea = bruto.emAndamento;
  if (
    ea &&
    typeof ea.dia === 'string' &&
    Number.isInteger(ea.respondidas) &&
    Number.isInteger(ea.acertos) &&
    ea.respondidas >= 0 &&
    ea.respondidas < TAMANHO_RODADA &&
    ea.acertos >= 0 &&
    ea.acertos <= ea.respondidas
  ) {
    limpo.emAndamento = { dia: ea.dia, respondidas: ea.respondidas, acertos: ea.acertos };
  }

  const t = bruto.totais;
  if (
    t &&
    Number.isInteger(t.respondidas) &&
    Number.isInteger(t.acertos) &&
    t.respondidas >= 0 &&
    t.acertos >= 0 &&
    t.acertos <= t.respondidas
  ) {
    limpo.totais = { respondidas: t.respondidas, acertos: t.acertos };
  }

  return limpo;
}

export async function carregarQuizCosmico() {
  const cru = await getItemSeguro(CHAVE_QUIZ_COSMICO);
  return normalizarQuiz(cru);
}

export async function salvarQuizCosmico(estado) {
  return setItemSeguro(CHAVE_QUIZ_COSMICO, JSON.stringify(estado));
}

// A rodada fechada do dia, ou null. É o que decide se a tela mostra pergunta
// ou placar.
export function rodadaFeita(estado, dia) {
  return (estado && estado.historico && estado.historico[dia]) || null;
}

// Garante um emAndamento do dia certo. Rodada de ONTEM abandonada no meio não
// vira nada: descarta-se em silêncio (as respostas já contadas ficam nos
// totais) e a de hoje começa do zero — as perguntas de hoje são outras.
export function comecarRodada(estado, dia) {
  const e = estado || estadoInicialQuiz();
  if (rodadaFeita(e, dia)) return e;
  if (e.emAndamento && e.emAndamento.dia === dia) return e;
  return { ...e, emAndamento: { dia, respondidas: 0, acertos: 0 } };
}

// Uma resposta. Puro: devolve o estado novo, não grava — quem chama decide
// quando salvar (a tela salva a cada resposta, o teste inspeciona sem disco).
// Depois da 7ª, a rodada fecha no historico e emAndamento zera; responder de
// novo no mesmo dia não muda nada.
export function aplicarResposta(estado, dia, acertou) {
  const e = comecarRodada(estado, dia);
  if (rodadaFeita(e, dia)) return e;

  const ea = e.emAndamento && e.emAndamento.dia === dia ? e.emAndamento : { dia, respondidas: 0, acertos: 0 };
  const respondidas = ea.respondidas + 1;
  const acertos = ea.acertos + (acertou ? 1 : 0);
  const totais = {
    respondidas: e.totais.respondidas + 1,
    acertos: e.totais.acertos + (acertou ? 1 : 0),
  };

  if (respondidas >= TAMANHO_RODADA) {
    return {
      ...e,
      totais,
      emAndamento: null,
      historico: { ...e.historico, [dia]: { acertos, total: TAMANHO_RODADA } },
    };
  }
  return { ...e, totais, emAndamento: { dia, respondidas, acertos } };
}
