// lib/mitos.js
// MITO × FONTE — o catálogo dos enganos que o mercado inteiro repete, cada um
// com a fonte que o desmente. Um card por mito: o que te contaram (riscado),
// o que a fonte diz, e o recibo embaixo.
//
// ===========================================================================
// DE ONDE VEM CADA LINHA — e por que nada aqui é opinião nossa
// ===========================================================================
// Todo mito deste arquivo foi tirado da base docs/tradicao/ — em especial da
// tabela "isso é milenar?" (docs/tradicao/10-historia-da-astrologia.md §13) e
// das tabelas A–G de docs/tradicao/00-LEIA-PRIMEIRO.md. Cada entrada carrega
// `base` com o arquivo e o locus onde a afirmação foi conferida; o teste abre
// o caminho e reprova se o arquivo não existir. Se um mito novo não tiver
// endereço na base, ele NÃO ENTRA — é a regra de ouro nº 1 (tradição sempre
// com fonte) e a proposição 3 da tese (docs/tradicao/00-tese.md): quase tudo
// que o mercado vende como antigo é moderno, datável, e tem autor.
//
// O TOM É O DA TESE, não o de denúncia: "inventar antiguidade não é a
// corrupção da tradição, é um traço da tradição" — está lá desde Nechepso e
// Petosiris, ~150 a.C. Por isso nenhum texto daqui zomba de quem acredita nem
// dá veredito sobre a prática: ele data, cita e devolve a história real, que
// é mais interessante que a inventada.
//
// A REGRA DE ESCRITA (a mesma de lib/rituais.js, travada por teste): PRENDE
// PRIMEIRO, FONTE DEPOIS. `detalhe` abre na vida real, em português de
// conversa — manchete, praia, feed, notebook travado — e o recibo (obra,
// autor, ano) chega depois. Os primeiros 60 caracteres de `detalhe` não podem
// conter ano de quatro dígitos nem "séc." — test/mitos.test.js confere.
//
// A LINHA VERMELHA (regra de PALAVRA, não de intenção): nenhuma alegação de
// saúde nem implícita, nenhuma promessa de resultado, nenhum mecanismo
// pseudocientífico ("energia", "vibração"). E uma proibição herdada de
// docs/tradicao/06 §2, literal: a palavra "cigana" não entra em nenhum texto
// do app — nem citando o mito. test/mitos.test.js varre tudo e aborta.
//
// TEXTO DE CONTEÚDO VIVE AQUI, EM PT — padrão declarado de lib/synastry.js e
// lib/rituais.js. Chaves de i18n são só pro chrome da tela, e nesta fase
// ninguém mexe em lib/i18n.js: screens/MitosScreen.js usa constantes locais.
//
// STORAGE: sempre via lib/storage.js (getItemSeguro/setItemSeguro) — nunca
// require direto de AsyncStorage. O helper existe porque o fallback errado
// apagava progresso (a história completa está no cabeçalho de lib/storage.js).
import { getItemSeguro, setItemSeguro } from './storage';

// Mesmo destino do textoCompartilhavel de lib/rituais.js — é o link que fecha
// todo texto que sai do app.
export const LINK_COMPARTILHAR = 'https://cosmicguide.cloud/cosmic-guide/';

// ---------------------------------------------------------------------------
// O CATÁLOGO — 25 mitos, cada um com recibo e endereço na base
// ---------------------------------------------------------------------------
// Campos:
//   id             — estável, kebab-case; é o que o storage grava.
//   oQueTeContaram — o mito como ele circula, na frase em que ele circula.
//   oQueAFonteDiz  — a correção, com obra/autor/data dentro do texto.
//   fonte          — o recibo curto que a tela imprime embaixo do card.
//   detalhe        — 2–3 frases prende-primeiro: vida real na abertura,
//                    recibo na segunda metade.
//   base           — arquivo + locus em docs/tradicao/ onde isto foi conferido.
export const MITOS = [
  {
    id: 'taro-egito',
    oQueTeContaram: 'O tarô vem do Egito antigo — é o Livro de Thoth dos faraós.',
    oQueAFonteDiz:
      'A ideia inteira nasce num capítulo de livro francês de 1781, de Antoine Court de Gébelin — 41 anos antes de Champollion decifrar os hieróglifos. Ele não tinha como ler uma linha de egípcio. O próprio Waite escreveu em 1911 que não existe nenhuma evidência da origem egípcia.',
    fonte: 'Le Monde primitif, vol. 8, "Du Jeu des Tarots" — Court de Gébelin, 1781',
    detalhe:
      'Aquele baralho que vendem como segredo dos faraós passou uns 350 anos como jogo de aposta em mesa de taverna italiana. A leitura de cartas como a gente conhece tem 245 anos: nasceu quando Court de Gébelin publicou a tese egípcia em 1781 — e dois anos depois Etteilla vendeu o primeiro método. O próprio Waite, em 1911, escreveu que não há nenhuma evidência da origem egípcia.',
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.1–5.2' },
  },
  {
    id: 'superlua',
    oQueTeContaram: '"Superlua" é um fenômeno raro que a astronomia anuncia desde sempre.',
    oQueAFonteDiz:
      'O termo foi cunhado por um astrólogo, Richard Nolle, numa revista de horóscopos em 1979. Não existe definição astronômica oficial — o nome técnico é perigeu-sizígia, e a diferença de tamanho é imperceptível a olho nu sem comparação lado a lado.',
    fonte: 'Richard Nolle, revista Dell Horoscope, 1979',
    detalhe:
      'Toda manchete de "Superlua gigante" promete um espetáculo que ninguém distingue a olho nu — a diferença é de uns 14% de diâmetro, visível só em foto comparada. A palavra nem é da astronomia: quem a cunhou foi um astrólogo, Richard Nolle, numa revista de horóscopo em 1979. O termo só viralizou em 2011.',
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4.5' },
  },
  {
    id: 'luas-cheias-nomes',
    oQueTeContaram: '"Lua do Lobo", "Lua do Morango"… são nomes indígenas milenares.',
    oQueAFonteDiz:
      'A lista padrão foi publicada pelo Maine Farmers\' Almanac nos anos 1930 — um apanhado de fontes algonquianas, inglesas coloniais e celtas — e simplificada pelo Old Farmer\'s Almanac para um nome por mês. E ela descreve o ciclo agrícola do nordeste dos EUA: chega ao Brasil com o hemisfério errado.',
    fonte: "Maine Farmers' Almanac, anos 1930",
    detalhe:
      'Repare que a "Lua da Neve" de fevereiro cai no auge do verão brasileiro — o nome veio pronto do hemisfério de cima. A lista famosa saiu de um almanaque agrícola americano dos anos 1930, um apanhado de fontes algonquianas, inglesas e celtas simplificado para um nome por mês.',
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4' },
  },
  {
    id: 'oito-fases',
    oQueTeContaram: 'As 8 fases da Lua, cada uma com seu significado, são sabedoria milenar.',
    oQueAFonteDiz:
      'A leitura psicológica das oito fases é de Dane Rudhyar — formulada nos oito tipos sololunares em The Lunation Cycle (1967), sobre ideia que ele vinha desenvolvendo desde os anos 1930-40 (The Astrology of Personality, 1936). A divisão antiga é outra — Ptolomeu trabalha com quatro quartos, e descreve qualidades, não personalidade.',
    fonte: 'Dane Rudhyar — The Astrology of Personality, 1936; The Lunation Cycle, 1967',
    detalhe:
      'O carrossel com as oito fases da Lua e o "modo de usar" de cada uma tem dono e certidão. Quem formulou os oito tipos com leitura psicológica foi Dane Rudhyar, no The Lunation Cycle (1967), sobre ideia que ele vinha desenvolvendo desde os anos 1930-40. Os autores antigos dividiam a Lua em quatro quartos — Ptolomeu descrevia qualidades, não personalidade.',
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§3.1' },
  },
  {
    id: 'quiromancia-milenar',
    oQueTeContaram: 'Ler a mão é uma arte milenar — montes, tipos de mão, linha do casamento.',
    oQueAFonteDiz:
      'O sistema moderno nasce em 1843 com D\'Arpentigny (La Chirognomonie), ganha corpo com Heron-Allen (1883) e vira manual com Benham (1900). E os quatro tipos de mão por elemento são de Fred Gettings, 1965.',
    fonte: "La Chirognomonie, D'Arpentigny, 1843 · The Laws of Scientific Hand Reading, Benham, 1900",
    detalhe:
      'A linha do casamento que te mostraram na praia tem menos idade que a fotografia. O pacote completo — montes, tipos de mão, linhas com nome — foi montado entre 1843 e 1900, de D\'Arpentigny a Benham. E os quatro tipos de mão por elemento são de 1965, de Fred Gettings.',
    base: { arquivo: 'docs/tradicao/06-oniromancia-e-artes-corporais.md', locus: '§2; Heron-Allen e Benham: 00-LEIA-PRIMEIRO §A' },
  },
  {
    id: 'borra-de-cafe',
    oQueTeContaram: 'Ler borra de café é tradição turca milenar, com símbolos ancestrais.',
    oQueAFonteDiz:
      'O café só chega a Istambul no séc. XVI — a prática não pode ser mais velha que a bebida. E o dicionário de símbolos (cobra = inimizade, casa = mudança) é salão britânico do fim do séc. XIX, consolidado por Cicely Kent em 1922.',
    fonte: 'Tea-Cup Reading, "A Highland Seer", 1881 · Cicely Kent, 1922',
    detalhe:
      'Não tinha como a bisavó de mil anos atrás ler borra de café: os primeiros cafés de Istambul são de 1555, e a prática não pode ser mais velha que a bebida. Já a tabela de símbolos, com cobra querendo dizer inimizade, foi montada em salão britânico entre 1881 e 1922, como jogo de chá da tarde.',
    base: { arquivo: 'docs/tradicao/06-oniromancia-e-artes-corporais.md', locus: '§6.1' },
  },
  {
    id: 'saturno-mestre',
    oQueTeContaram: 'Saturno é o grande mestre do zodíaco, o professor das lições — desde sempre.',
    oQueAFonteDiz:
      'A leitura de Saturno como mestre e amadurecimento é de Liz Greene, 1976. Nas fontes antigas Saturno é maléfico, e a leitura depende da seita: Valente anota que maléficos bem colocados indicam "as maiores posições e sucesso".',
    fonte: 'Liz Greene, 1976 · contraponto: Vétio Valente, Antologias, séc. II',
    detalhe:
      'O planeta vilão virou professor, e ninguém notou a troca. Nas fontes antigas Saturno é o maléfico maior — e Valente ainda anota que, bem colocado na própria seita, ele indica "as maiores posições e sucesso". O "grande mestre que traz lições" é releitura psicológica publicada por Liz Greene em 1976.',
    base: { arquivo: 'docs/tradicao/15-campo-contemporaneo-e-autores.md', locus: '§6' },
  },
  {
    id: 'karma-astrologia',
    oQueTeContaram: 'Karma e vidas passadas sempre fizeram parte da astrologia.',
    oQueAFonteDiz:
      'Não estão em Ptolomeu, Valente, Fírmico, Bonatti nem Lilly. Entram no Ocidente pela Teosofia, a partir de 1875, importados do vocabulário indiano. E o Nodo Norte como "missão da alma" é de Martin Schulman, 1975.',
    fonte: 'Teosofia, 1875 em diante · Martin Schulman, Karmic Astrology, 1975',
    detalhe:
      'A "dívida kármica" do mapa não aparece em nenhum autor antigo — nem nos gregos, nem nos medievais, nem em Lilly. Esse vocabulário entra na astrologia ocidental pela Teosofia, fundada em 1875. E o pacote "Nodo Norte = missão da alma" é de um livro de 1975, de Martin Schulman.',
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§13; nodos: 04 §3.5' },
  },
  {
    id: 'porcentagem-compatibilidade',
    oQueTeContaram: 'Existe uma porcentagem de compatibilidade entre signos — "vocês têm 87% de match".',
    oQueAFonteDiz:
      'Número não existe em fonte nenhuma — antiga, medieval ou renascentista. Varridos Ptolomeu, Doroteu, Māshāʾallāh e Lilly: nenhum. O que a tradição tem é uma escala de quatro degraus (Tetrabiblos IV.7), e nela um terço dos pares de signos é "alheio".',
    fonte: 'Sem fonte antiga — invenção comercial do séc. XX; a escala real: Ptolomeu, Tetrabiblos IV.7, séc. II',
    detalhe:
      'Aquele "vocês combinam 87%" não saiu de livro nenhum — saiu de revista e de software do século passado. Na fonte antiga a régua é outra e mais dura: Ptolomeu ordena as relações em quatro degraus, e um terço dos pares de signos ele chama de alheios — nem se veem. Nota baixa não vende, e o mercado parou de mostrar.',
    base: { arquivo: 'docs/tradicao/02-aspectos-e-sinastria.md', locus: '§3.1' },
  },
  {
    id: 'lua-azul',
    oQueTeContaram: '"Lua Azul" é a segunda lua cheia do mês — definição clássica.',
    oQueAFonteDiz:
      'É um erro de leitura documentado: em 1946 o astrônomo amador James Hugh Pruett entendeu mal a regra do Maine Farmers\' Almanac na Sky & Telescope (lá era a terceira cheia de uma estação com quatro). A própria revista se corrigiu em 1999. Nenhuma das duas definições é antiga.',
    fonte: 'Sky & Telescope, James Hugh Pruett, 1946; errata da própria revista, 1999',
    detalhe:
      'A definição que todo mundo repete nasceu de alguém lendo errado uma revista. Em 1946 o astrônomo amador Pruett entendeu mal a regra do almanaque na Sky & Telescope; a NPR repetiu em 1980 e o Trivial Pursuit cristalizou em 1986. A própria revista publicou a correção em 1999 — tarde demais.',
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4.4' },
  },
  {
    id: 'lua-de-sangue',
    oQueTeContaram: '"Lua de Sangue" é um termo bíblico antigo para eclipses.',
    oQueAFonteDiz:
      'A imagem existe em Joel 2:31, mas o termo como nome de eclipse é do pastor Mark Biltz (2008) e de John Hagee (Four Blood Moons, 2013). Astrônomos não usam.',
    fonte: 'Mark Biltz, 2008 · John Hagee, Four Blood Moons, 2013',
    detalhe:
      'O nome que estampa toda manchete de eclipse é mais novo que o iPhone. Como rótulo de eclipse lunar, "Lua de Sangue" foi lançado por um pastor americano em 2008 e virou best-seller em 2013. A Bíblia tem a imagem poética em Joel — mas não chama eclipse assim.',
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§4.6' },
  },
  {
    id: 'mercurio-retrogrado',
    oQueTeContaram: 'Mercúrio retrógrado quebra aparelhos, derruba sistemas e manda o ex voltar.',
    oQueAFonteDiz:
      'A fonte antiga fala em atraso: Valente escreve que o retrógrado "adia expectativas, ações e lucros" e que a segunda estação "cancela o atraso". Nada de tecnologia, contratos ou ex. A expressão nem aparece na imprensa geral antes de 1996.',
    fonte: 'Vétio Valente, Antologias, séc. II; rastreio de imprensa: 1996',
    detalhe:
      'O culpado oficial do notebook travado tem álibi de quase dois mil anos. O que Valente escreveu no séc. II foi atraso: o retrógrado "adia expectativas, ações e lucros" — nada de aparelho, contrato ou ex. A expressão só ganha a imprensa a partir de 1996.',
    base: { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§8.5; ver também 01 §3.18' },
  },
  {
    id: 'leao-coracao',
    oQueTeContaram: 'Leão rege o coração — está assim nos textos antigos.',
    oQueAFonteDiz:
      'Na lista antiga do Homem Zodiacal (Manílio, Astronomica II), Leão fica com flancos e omoplatas — o coração é do Sol, não do signo. A versão "Leão = coração" imprimível mais antiga é a Escala do Doze de Agrippa, 1533.',
    fonte: 'Manílio, Astronomica II.453–465, séc. I · Agrippa, 1533',
    detalhe:
      'Pergunta numa roda de astrologia de onde vem o "Leão rege o coração" e ninguém aponta o livro. Na lista mais antiga de corpo e signo, Manílio dá a Leão os flancos e as omoplatas — o coração pertencia ao Sol. A versão popular só aparece impressa em 1533, na Escala do Doze de Agrippa.',
    base: { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§3.2; datação: 14 §6.2' },
  },
  {
    id: 'ofiuco',
    oQueTeContaram: 'Existe um 13º signo, Ofiúco, que escondem de você.',
    oQueAFonteDiz:
      'Signo nunca foi constelação. O zodíaco é de doze partes iguais de 30° desde o séc. V a.C., e Ptolomeu (Tetrabiblos I.22) diz que os signos se contam a partir dos equinócios e solstícios "e de nenhuma outra fonte". Os limites de constelação da IAU são de 1930.',
    fonte: 'Ptolomeu, Tetrabiblos I.22, séc. II · limites de constelação da IAU, 1930',
    detalhe:
      'De tempos em tempos volta a mesma manchete: "a NASA mudou o seu signo". Só que signo é fatia de 30° contada do equinócio, não desenho de constelação — é assim há uns 2.450 anos, e Ptolomeu escreveu que os signos se contam dos equinócios "e de nenhuma outra fonte". O mapa de constelações que abriga Ofiúco foi desenhado pela IAU em 1930, para uso astronômico.',
    base: { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§3.13' },
  },
  {
    id: 'urano-aquario',
    oQueTeContaram: 'Urano rege Aquário — regência clássica.',
    oQueAFonteDiz:
      'Urano foi descoberto em 1781. Na tradição, Aquário é domicílio de Saturno (Ptolomeu, Tetrabiblos I.17). A atribuição a Urano começa em 1825 (Smith) e 1828 (Varley) — e em 1834 ainda era discutida.',
    fonte: 'Ptolomeu, Tetrabiblos I.17, séc. II; atribuição a Urano: Smith, 1825 / Varley, 1828',
    detalhe:
      'O "regente clássico" de Aquário nem existia nos mapas até outro dia: Urano só foi descoberto em 1781. Na tradição, Aquário sempre foi casa de Saturno. A troca começa por volta de 1825 — e em 1834 ainda havia leitor de almanaque perguntando por que o planeta novo não tinha casa nenhuma.',
    base: { arquivo: 'docs/tradicao/11-planetas-em-profundidade.md', locus: '§8.3' },
  },
  {
    id: 'estrela-esperanca',
    oQueTeContaram: 'A carta da Estrela sempre foi a carta da esperança.',
    oQueAFonteDiz:
      'No manual do próprio baralho (Waite, 1911), a primeira leitura da Estrela é "perda, roubo, privação, abandono" — a esperança aparece como segunda leitura, "outra versão". A prioridade foi invertida ao longo do séc. XX.',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
    detalhe:
      'Abre o manual original do baralho mais vendido do mundo e procura a Estrela: a primeira leitura é "perda, roubo, privação, abandono". A esperança está lá como "outra versão", em segundo lugar. Foi o séc. XX que promoveu a segunda opção a significado único — seguindo a imagem, não o texto.',
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.14' },
  },
  {
    id: 'carta-invertida',
    oQueTeContaram: 'Carta invertida quer dizer bloqueio ou negação — leitura tradicional.',
    oQueAFonteDiz:
      'Em Waite (1911) a invertida costuma ser um significado lateral — às vezes melhor que o da carta em pé: Roda da Fortuna invertida é "aumento, abundância"; Imperador invertido é "benevolência, compaixão, crédito". A chave "bloqueio/excesso" é do séc. XX (Gray, Pollack, Greer).',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
    detalhe:
      'Tem carta que melhora de cabeça para baixo no manual original: a Roda da Fortuna invertida vira "aumento, abundância", e o Imperador invertido, "benevolência, compaixão". Em Waite, 1911, a invertida costuma ser um significado lateral — não um defeito da carta. A regra "invertida = bloqueio" foi escrita depois, ao longo do séc. XX.',
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.12' },
  },
  {
    id: 'cruz-celta',
    oQueTeContaram: 'A Cruz Celta é um método céltico ancestral de tiragem.',
    oQueAFonteDiz:
      'O nome é de Waite, 1911. A estrutura vem de círculos da Golden Dawn dos anos 1890 — e Waite diz apenas que a tiragem "tem sido usada em privado por muitos anos".',
    fonte: 'A. E. Waite, The Pictorial Key to the Tarot, 1911',
    detalhe:
      'A tiragem mais famosa do tarô não tem nada de druida. O nome "Cruz Celta" estreia em 1911, no manual de Waite, e o desenho vem dos círculos ocultistas de Londres dos anos 1890. De celta, só o batismo.',
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.15' },
  },
  {
    id: 'marselha-o-mais-antigo',
    oQueTeContaram: 'O Tarô de Marselha é o tarô original, o mais antigo de todos.',
    oQueAFonteDiz:
      'É um padrão de impressão francês dos séc. XVII–XVIII (Noblet c. 1650, Conver 1760). Os tarôs mais antigos são os italianos pintados à mão do séc. XV. E o nome "Tarô de Marselha" foi popularizado por Paul Marteau, da fabricante Grimaud, em 1930.',
    fonte: 'Padrão francês, séc. XVII–XVIII (Conver, 1760); o nome: Paul Marteau, Grimaud, 1930',
    detalhe:
      'O "tarô original" é mais novo que os baralhos que ele diz anteceder: os tarôs italianos pintados à mão vêm primeiro, e o padrão de Marselha é impressão francesa dos séc. XVII–XVIII. Até o nome é etiqueta comercial: quem batizou "Tarô de Marselha" foi o fabricante Paul Marteau, em 1930.',
    base: { arquivo: 'docs/tradicao/05-taro-historia-e-leitura.md', locus: '§5.6–5.7' },
  },
  {
    id: 'astrologia-5000-anos',
    oQueTeContaram: 'A astrologia tem 5.000 anos.',
    oQueAFonteDiz:
      'O que tem ~4.000 anos são presságios de Estado mesopotâmicos — outra coisa. O zodíaco tem ~2.450 anos; o horóscopo individual mais antigo é de 410 a.C.; o mapa natal com Ascendente e casas tem ~2.150 anos.',
    fonte: 'Horóscopo cuneiforme mais antigo: 410 a.C.; mapa natal helenístico: c. 150–120 a.C.',
    detalhe:
      'O número redondo dobra a idade real da coisa. O que os babilônios de 4.000 anos atrás liam era presságio de Estado — chuva, guerra, rei — e não mapa de pessoa. O primeiro horóscopo individual conhecido é de 410 a.C., e o mapa natal com Ascendente e casas tem uns 2.150 anos.',
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§14.1–14.2' },
  },
  {
    id: 'horoscopo-de-jornal',
    oQueTeContaram: 'O horóscopo diário por signo é o formato clássico da astrologia.',
    oQueAFonteDiz:
      'Tem data de estreia: 24 de agosto de 1930, no Sunday Express, por R. H. Naylor — sobre o nascimento da princesa Margaret. Em 1930 o jornal precisou explicar aos leitores o que era um horóscopo.',
    fonte: 'R. H. Naylor, Sunday Express, 24/08/1930',
    detalhe:
      'O horóscopo do seu feed tem data de estreia como novela: agosto de 1930, num jornal britânico, sobre o nascimento de uma princesa. Era tanta novidade que o jornal precisou explicar aos leitores o que era um horóscopo. Na tradição, quem descreve o indivíduo é o Ascendente, não o signo solar.',
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§14.8–14.9' },
  },
  {
    id: 'signo-personalidade',
    oQueTeContaram: '"Ariano é impulsivo, escorpiano é intenso" — os antigos já descreviam assim.',
    oQueAFonteDiz:
      'A caracterologia por signo solar é do séc. XX: Alan Leo (c. 1895–1910) em diante, popularizada por Linda Goodman em 1968. Em Ptolomeu, o caráter vem de Mercúrio e da Lua (Tetrabiblos III.13) — não existe capítulo de "doze personalidades".',
    fonte: 'Alan Leo, c. 1895–1910 · Linda Goodman, Sun Signs, 1968 · Ptolomeu, Tetrabiblos III.13, séc. II',
    detalhe:
      'O retrato falado do seu signo — teimoso, dramático, sonhador — não está em autor antigo nenhum. Esse formato nasce com Alan Leo na virada do séc. XX e explode com Linda Goodman em 1968. Ptolomeu lia caráter em Mercúrio e na Lua; e o retrato que Valente faz dos signos é irreconhecível pra quem lê horóscopo hoje.',
    base: { arquivo: 'docs/tradicao/01-astrologia-fundamentos.md', locus: '§3.1; datação: 10 §13' },
  },
  {
    id: 'numerologia-pitagoras',
    oQueTeContaram: 'A tabela numerológica A=1, B=2… vem de Pitágoras.',
    oQueAFonteDiz:
      'Pitágoras não deixou nenhum escrito, e o alfabeto de 26 letras não é o dele. A tabela em três colunas de nove é rastreável a L. Dow Balliett, 1908 — os "números-mestres" 11 e 22 também são dela.',
    fonte: 'L. Dow Balliett, 1908',
    detalhe:
      'O "método de Pitágoras" usa um alfabeto que Pitágoras nunca viu — e ele não deixou nenhum escrito. A tabela de três linhas com o alfabeto moderno tem seu rastro mais antigo num livro de 1908, de L. Dow Balliett, junto com os números-mestres 11 e 22. De grego, sobrou o nome.',
    base: { arquivo: 'docs/tradicao/07-outras-tradicoes-e-oportunidades.md', locus: '§2.4' },
  },
  {
    id: 'lua-nova-intencoes',
    oQueTeContaram: 'Lua Nova é o momento de plantar intenções — ritual ancestral.',
    oQueAFonteDiz:
      'Plantar DE VERDADE na lua escura é fonte primária: Catão, séc. II a.C., "luna silente". "Plantar intenções" é transposição moderna — Jan Spiller, New Moon Astrology, 2001.',
    fonte: 'Catão, De Agri Cultura 40.1, séc. II a.C. · Jan Spiller, New Moon Astrology, 2001',
    detalhe:
      'A parte de plantar é romana; a parte da lista de desejos tem a idade do Windows XP. Catão mandava semear com a lua escura — plantação de verdade, no chão. O caderno de intenções de Lua Nova é de um livro americano de 2001, de Jan Spiller.',
    base: { arquivo: 'docs/tradicao/04-lua-fases-e-calendario.md', locus: '§5' },
  },
  {
    id: 'nao-e-previsao',
    oQueTeContaram: '"Não é previsão, são tendências" — a moldura elegante de sempre da astrologia.',
    oQueAFonteDiz:
      'A frase nasce de defesa criminal: Alan Leo foi processado por adivinhação em Londres em 1914 e 1917; a tese da defesa era que ele descrevia tendências, não fortunas. Ela ruiu quando a acusação leu o almanaque dele prevendo morte na família — foi condenado e multado em £5.',
    fonte: 'Processos de Alan Leo, Londres, 1914 e 1917',
    detalhe:
      'A frase mais elegante do mercado nasceu num tribunal. Alan Leo, processado por adivinhação em Londres, defendeu-se dizendo que descrevia tendências, não fortunas — a acusação leu em voz alta o almanaque dele prevendo morte na família, e ele foi condenado em 1917. O mercado inteiro herdou a frase sem saber de onde veio.',
    base: { arquivo: 'docs/tradicao/10-historia-da-astrologia.md', locus: '§13; detalhes: 00-tese.md §3' },
  },
];

// ---------------------------------------------------------------------------
// BUSCA
// ---------------------------------------------------------------------------
export function mitoPorId(id) {
  return MITOS.find((m) => m.id === id) || null;
}

// ---------------------------------------------------------------------------
// MITO DO DIA — determinístico por data local, padrão de lib/dailyThought.js
// ---------------------------------------------------------------------------
// Mesmo dia = mesmo mito, em qualquer aparelho, sem sorteio e sem estado: a
// data local vira string YYYY-MM-DD (o mesmo toDateStr de lib/dailyThought.js)
// e um hash determinístico escolhe o índice. O multiplicador 31 é o clássico
// de string hash; o módulo grande primo mantém a conta em inteiro seguro de
// float64 (31 * 1e6 + 127 << 2^53) sem depender de Math.imul.
function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function indiceDoMitoDoDia(date = new Date()) {
  const s = toDateStr(date);
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) % 1000003;
  }
  return h % MITOS.length;
}

export function mitoDoDia(date = new Date()) {
  return MITOS[indiceDoMitoDoDia(date)];
}

// ---------------------------------------------------------------------------
// COMPARTILHAR — o único texto daqui que sai do app
// ---------------------------------------------------------------------------
// Mesmo desenho do textoCompartilhavel de lib/rituais.js: linhas simples,
// legíveis no grupo da família, sem urgência e sem emoji de dinheiro — e a
// ÚLTIMA linha é sempre o link. O teste confere o endsWith.
export function textoCompartilhavel(mitoOuId) {
  const m = typeof mitoOuId === 'string' ? mitoPorId(mitoOuId) : mitoOuId;
  if (!m) return '';
  const linhas = [
    `Te contaram: ${m.oQueTeContaram}`,
    `A fonte diz: ${m.oQueAFonteDiz}`,
    `Recibo: ${m.fonte}.`,
    LINK_COMPARTILHAR,
  ];
  return linhas.join('\n');
}

// ---------------------------------------------------------------------------
// MITOS JÁ VISTOS — progresso leve, via lib/storage.js
// ---------------------------------------------------------------------------
// Grava a lista de ids que a pessoa já abriu, pra tela poder dizer "você já
// conferiu 7 de 25". Regras herdadas de lib/storage.js: nunca lança, falha de
// disco cai pra memória de sessão, e leitura suja (JSON inválido, id que saiu
// do catálogo) volta limpa em vez de quebrar a tela.
export const CHAVE_MITOS_VISTOS = 'cosmic-mitos-vistos';

export async function lerMitosVistos() {
  const bruto = await getItemSeguro(CHAVE_MITOS_VISTOS);
  if (!bruto) return [];
  try {
    const lista = JSON.parse(bruto);
    if (!Array.isArray(lista)) return [];
    // Filtra id que não existe mais e deduplica preservando a ordem — catálogo
    // pode mudar entre versões, e a contagem da tela nunca pode passar do total.
    const vivos = [];
    for (const id of lista) {
      if (typeof id === 'string' && mitoPorId(id) && !vivos.includes(id)) vivos.push(id);
    }
    return vivos;
  } catch {
    return [];
  }
}

// Devolve a lista atualizada (a tela usa o length). Id desconhecido não grava.
export async function marcarMitoVisto(id) {
  const vistos = await lerMitosVistos();
  if (!mitoPorId(id) || vistos.includes(id)) return vistos;
  const novos = [...vistos, id];
  await setItemSeguro(CHAVE_MITOS_VISTOS, JSON.stringify(novos));
  return novos;
}
