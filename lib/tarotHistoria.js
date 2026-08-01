// lib/tarotHistoria.js
// A HISTÓRIA REAL DO TARÔ — a linha do tempo que mora DENTRO do álbum das 78.
//
// ===========================================================================
// POR QUE ESTE MÓDULO EXISTE, E POR QUE ELE NÃO É lib/mitos.js NEM lib/idadeReal.js
// ===========================================================================
// `lib/mitos.js` é card avulso: "te contaram X, a fonte diz Y", um por dia.
// `lib/idadeReal.js` é tabela de idades: a informação principal é um NÚMERO.
// Aqui a informação principal é a ORDEM. O conteúdo desta feature só funciona
// lido em sequência, porque o achado é justamente a DISTÂNCIA entre duas datas:
// as imagens são de 1440 em diante e a leitura adivinhatória documentada entra
// séculos depois. Quem lê um item solto não vê isso; quem desce a linha, vê.
//
// Há sobreposição de ITEM com os dois módulos de propósito (o Egito de 1781
// aparece nos três) — e nenhuma de TEXTO: test/tarotHistoria.test.js varre os
// catálogos e reprova qualquer sequência de oito palavras em comum.
//
// ===========================================================================
// O ACHADO QUE GOVERNA O TOM — e ele vem da tese, não desta pesquisa
// ===========================================================================
// docs/tradicao/00-tese.md §3 registra que a astrologia ocidental COMEÇA com
// uma invenção de antiguidade: os textos que fundam o mapa natal circulam sob
// os nomes de Nechepso e Petosiris, um faraó e um sacerdote egípcios, e os dois
// são pseudônimos de autores gregos de Alexandria, c. 150–120 a.C.
//
// É o mesmo gesto de Court de Gébelin com o tarô, 1.900 anos depois. Logo, o
// tom desta feature NÃO é denúncia: inventar antiguidade não é a corrupção da
// tradição, é um traço dela, e o mercado de hoje é só o capítulo mais recente.
// `paraleloDaAntiguidade()` existe para dizer isso com todas as letras, e o
// teste exige que ele cite Nechepso, Petosiris e a palavra pseudônimo — porque
// sem esse bloco a linha do tempo vira acusação, que é o que ela não é.
//
// ===========================================================================
// A REGRA DE ESCRITA: PRENDE PRIMEIRO, FONTE DEPOIS
// ===========================================================================
// Feedback literal do dono, duas vezes: "está muito científico, preciso mesclar
// pro povão entender". A tradução disso em regra POSICIONAL, que é a única que
// dá para travar por teste: todo texto longo ABRE na vida real — o baralho que
// te deram, a mesa, o jogo, a mão de quem embaralha — e FECHA no recibo (obra,
// autor, ano). Os primeiros 70 caracteres de todo `texto` não podem trazer ano
// de quatro dígitos. Errado: "Court de Gébelin, em 1781, estabelece que…".
// Certo: "Um clérigo erudito encontra o tarô por acaso numa reunião em Paris…".
//
// A LINHA VERMELHA (regra de PALAVRA, não de intenção), nos TRÊS idiomas:
// nenhuma alegação de saúde nem implícita, nenhuma promessa, nenhum veredito
// sobre quem acredita, nenhuma prova social inventada, nenhum aviso defensivo.
// E duas armadilhas específicas desta feature:
//   · o mito "um povo viajante trouxe o tarô do Egito" NÃO pode ser escrito com
//     o exônimo que o app bane nos três idiomas. Escreve-se o povo Rom pelo
//     nome, que além de correto é o que a linguística de 1782–1783 usa.
//   · desmontar um mito não autoriza xingar quem acredita nele. "ingênuo",
//     "engano", "charlatão" e os primos em es/en estão na varredura.
//
// ===========================================================================
// TODA AFIRMAÇÃO HISTÓRICA É CHECADA POR MÁQUINA
// ===========================================================================
// Mesmo mecanismo de lib/jornada.js: a datação não mora solta na prosa. Cada
// marco aponta ids de DATACOES, e cada entrada de DATACOES carrega `doc` (o
// arquivo da base) e `provas` (as strings LITERAIS que têm de aparecer nesse
// arquivo). O teste abre os documentos e confere prova por prova — e varre no
// sentido contrário também: TODO ano de quatro dígitos que aparecer em texto de
// tela, em qualquer idioma, tem de existir na base. Inventar data por descuido
// fica impossível, que é justamente como ela costuma entrar.
//
// ===========================================================================
// NUNCA FABRICAR — a versão desta feature
// ===========================================================================
// Esta feature não toca em efeméride nem em dado de nascimento: não há céu a
// calcular e não há hora nem cidade a exigir. A regra reaparece traduzida para
// conteúdo: `historiaDaCarta()` devolve `null` para as 72 cartas que não têm
// nota pesquisada, em vez de gerar enchimento; e o que a pesquisa procurou e
// não achou fica em NAO_ACHADO, declarado, em vez de completado com a versão
// que circula por aí (a etimologia de "tarocco", a data cravada do Sermão
// Steele, o nome "Marselha" antes de 1930).
//
// A IDADE É CONTA, NUNCA TABELA (tese §1): a abertura do álbum diz quantos anos
// tem a leitura de cartas, e esse número sai de `anoRef - ANO_LEITURA_DATAVEL`.
// Vira 246 sozinho na virada do ano, sem ninguém editar string nenhuma.
//
// ===========================================================================
// OS TRÊS IDIOMAS
// ===========================================================================
// Este arquivo é MOTOR: ids, ordem, fase, datações, endereços. TODA prosa mora
// em lib/traducoes/tarotHistoria.{pt,es,en}.js, com a MESMA forma — mesmas
// chaves, mesmas funções, mesma assinatura. É o padrão de lib/seita.js.
// O que NUNCA muda entre os três: o nome da OBRA (Le Monde primitif continua
// Le Monde primitif), os verbatins ingleses de Waite (traduzir citação é
// falsificá-la), os números e os ids. O AUTOR passa por traduzirAutor e a
// DATAÇÃO por traduzirQuando, de lib/traducoes/datacao.js. Toda função pública
// tem `lang` com default 'pt'.
import { traduzirAutor, traduzirQuando } from './traducoes/datacao';
import PACK_PT from './traducoes/tarotHistoria.pt';
import PACK_ES from './traducoes/tarotHistoria.es';
import PACK_EN from './traducoes/tarotHistoria.en';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma desconhecido cai no PT — mesmo fallback de lib/i18n.js e lib/seita.js.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// Mesmo destino de lib/mitos.js e lib/idadeReal.js. Endereço não se traduz.
export const LINK_COMPARTILHAR = 'https://cosmicguide.cloud/cosmic-guide/';

// ---------------------------------------------------------------------------
// 1. AS DUAS DATAS DE QUE SAEM AS IDADES
// ---------------------------------------------------------------------------
// Ficam em constante nomeada porque a abertura CALCULA em cima delas, e porque
// a diferença entre as duas é o conteúdo inteiro desta feature.
//
// 1440: menção documentada mais antiga a baralhos de trionfi (Florença) —
//       docs/tradicao/05 §2.1. É onde a IMAGEM começa a ter recibo.
// 1781: o volume VIII do Monde primitif, de onde desce a leitura adivinhatória
//       como sistema — o mesmo ano que lib/idadeReal.js usa em 'taro-divinatorio'.
export const ANO_PRIMEIRA_MENCAO = 1440;
export const ANO_LEITURA_DATAVEL = 1781;

function anoCorrente() {
  return new Date().getFullYear();
}

/**
 * Quantos anos tem a leitura de cartas, contra o ano de referência.
 * `anoRef` existe para o teste poder cravar o ano; a tela não passa nada.
 */
export function anosDeLeitura(anoRef = anoCorrente()) {
  return anoRef - ANO_LEITURA_DATAVEL;
}

/** Séculos de imagem, arredondados — "cerca de seis séculos", nunca "5.000 anos". */
export function seculosDeImagem(anoRef = anoCorrente()) {
  return Math.round((anoRef - ANO_PRIMEIRA_MENCAO) / 100);
}

// ---------------------------------------------------------------------------
// 2. AS DATAÇÕES — obra, autor, quando, e as provas que a máquina confere
// ---------------------------------------------------------------------------
// `autor: null` + `autorChave` quando o autor NÃO é nome próprio (um frade
// anônimo, um escrivão de corte, um gravador incerto): nome próprio passa por
// traduzirAutor e volta igual nos três idiomas, mas "um frade anônimo" tem de
// ser dito na língua de quem lê — senão a fonte sai pela metade, que é o mesmo
// que não dar fonte. O pack resolve `autorChave` em pack.autores.
//
// `obra: null` + `obraChave` pela MESMA razão, e ela é a menos óbvia deste
// arquivo. A regra é que título de obra nunca traduz — Le Monde primitif
// continua Le Monde primitif em qualquer língua. Só que sete destas fontes não
// são obras tituladas: são um baralho num museu, um livro de contas de corte,
// uma folha manuscrita sem título, uma pedra. O nome delas não é título, é
// DESCRIÇÃO — e descrição em português dentro de um recibo em inglês é fonte
// entregue pela metade. Essas sete vão para pack.obras e são ditas na língua de
// quem lê. Onde há título, ele fica intacto e a descrição vai para a prosa.
//
// `quando` é escrito nas formas que lib/traducoes/datacao.js sabe verter
// ("séc. XV", "1440 e 1442", "fim do séc. XIX", "dezembro de 1909"). Onde a
// base usa uma forma que o tradutor não conhece — "anterior a 1750", "última
// terça parte do séc. XV" —, o `quando` guarda o século e a NUANCE vai para a
// prosa do pack, que é traduzida à mão. Datação pela metade é datação errada.
export const DATACOES = {
  rheinfelden: {
    obra: 'Tractatus de moribus et disciplina humanae conversationis (ms. Basel, F IV 43)',
    autor: 'Johannes von Rheinfelden',
    quando: '1377',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Johannes von Rheinfelden', 'Tractatus de moribus', '1377', 'F IV 43'],
  },
  mameluco: {
    obra: null,
    obraChave: 'baralhoMameluco',
    autor: null,
    autorChave: 'anonimo',
    quando: 'séc. XV',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Topkapı', 'bastões de pólo', 'cimitarras', 'mameluco'],
  },
  trionfiFerrara: {
    obra: null,
    obraChave: 'contasDeFerrara',
    autor: null,
    autorChave: 'escrivao',
    quando: '1440 e 1442',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['carte da trionfi', '1442', '1440', 'Sigismondo Pandolfo Malatesta'],
  },
  viscontiSforza: {
    obra: 'Visconti-Sforza (Morgan Library · Accademia Carrara · Colleoni)',
    autor: 'Bonifacio Bembo',
    quando: 'c. 1441–1451',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Visconti-Sforza', 'Bonifacio Bembo', 'c. 1441–1451', 'Morgan Library'],
  },
  sermaoSteele: {
    obra: 'Sermones de ludo cum aliis ("Steele Sermon")',
    autor: null,
    autorChave: 'frade',
    quando: 'séc. XV',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Sermones de ludo cum aliis', 'ludus triumphorum', '22 trunfos', 'última terça parte do séc. XV'],
  },
  solaBusca: {
    obra: 'Sola Busca',
    autor: null,
    autorChave: 'gravadorIncerto',
    quando: 'c. 1491',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Sola Busca', 'c. 1491', 'Nicola di Maestro Antonio', 'British Museum'],
  },
  palavraTarocho: {
    obra: 'tarocho (Ferrara, 1505) · taraux (Avignon, 1505) · Alberto Lollio (1550)',
    autor: 'Alberto Lollio',
    quando: '1505 e 1550',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['tarocho', 'taraux', '1505', 'Alberto Lollio', '1550'],
  },
  padroesRegionais: {
    obra: 'Minchiate florentina, Tarocco Bolognese e Tarocco Siciliano',
    autor: null,
    autorChave: 'anonimo',
    quando: 'séc. XVI',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Minchiate', '97 cartas', 'Tarocco Bolognese', '62 cartas', 'Siciliano'],
  },
  folhaBolonhesa: {
    obra: null,
    obraChave: 'folhaBolonhesa',
    autor: 'Franco Pratesi',
    quando: 'séc. XVIII',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Franco Pratesi', 'Anterior a 1750', '35 cartas', 'atestação mais antiga'],
  },
  etteilla: {
    obra: 'Etteilla, ou manière de se récréer avec un jeu de cartes · Grand Etteilla',
    autor: 'Jean-Baptiste Alliette, "Etteilla"',
    quando: '1770 e 1789',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Jean-Baptiste Alliette', 'Grand Etteilla', '1770', '1789', 'significado invertido'],
  },
  courtDeGebelin: {
    obra: 'Le Monde primitif, vol. VIII, "Du Jeu des Tarots"',
    autor: 'Antoine Court de Gébelin',
    quando: '1781',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Court de Gébelin', 'Le Monde primitif', '1781', 'Livro de Thoth'],
  },
  mellet: {
    obra: 'Le Monde primitif, vol. VIII (ensaio do Comte de Mellet)',
    autor: 'Comte de Mellet',
    quando: '1781',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Comte de Mellet', 'alfabeto', '1781'],
  },
  champollion: {
    obra: null,
    obraChave: 'pedraDeRoseta',
    autor: 'Jean-François Champollion',
    quando: '1799 e 1822',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Pedra de Roseta', 'Champollion', '1799', '1822'],
  },
  levi: {
    obra: 'Dogme et Rituel de la Haute Magie',
    autor: 'Éliphas Lévi',
    quando: '1854 e 1856',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Dogme et Rituel de la Haute Magie', 'Éliphas Lévi', '1854', '1856', 'Árvore da Vida'],
  },
  papusWirth: {
    obra: 'Le Tarot des Bohémiens (arcanos de Oswald Wirth)',
    autor: 'Papus (Gérard Encausse)',
    quando: '1889',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Le Tarot des Bohémiens', 'Oswald Wirth', '1889', 'Papus'],
  },
  bookT: {
    obra: 'Cipher Manuscripts · "Book T — The Tarot" (ed. Israel Regardie)',
    autor: 'Golden Dawn',
    quando: 'fim do séc. XIX',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Book T', 'Cipher Manuscripts', 'Israel Regardie', '1937', '36 decanatos'],
  },
  riderWaiteSmith: {
    obra: 'Rider-Waite-Smith (William Rider & Son)',
    autor: null,
    autorChave: 'smithEWaite',
    quando: 'dezembro de 1909',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Pamela Colman Smith', 'William Rider & Son', '1909', '1878–1951'],
  },
  pictorialKey: {
    obra: 'The Pictorial Key to the Tarot',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['The Pictorial Key to the Tarot', 'Waite', '1911', 'pillars of sand'],
  },
  merlin: {
    obra: null,
    obraChave: 'objecaoMerlin',
    autor: 'Romain Merlin',
    quando: '1869',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Romain Merlin', '1869', 'noroeste da Índia', '1782–1783'],
  },
  vaillant: {
    obra: null,
    obraChave: 'teseVaillant',
    autor: 'J.-A. Vaillant',
    quando: '1854 e 1857',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Vaillant', 'Boiteau', '1857', '1854'],
  },
  marteau: {
    obra: 'Ancien Tarot de Marseille (Grimaud)',
    autor: 'Paul Marteau',
    quando: '1930',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Paul Marteau', 'Ancien Tarot de Marseille', '1930', 'Nicolas Conver'],
  },
  crowley: {
    obra: 'The Book of Thoth',
    autor: 'Aleister Crowley',
    quando: '1944',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['The Book of Thoth', 'Aleister Crowley', '1944', 'Frieda', 'Harris'],
  },
  dummett: {
    obra: 'The Game of Tarot: from Ferrara to Salt Lake City · A Wicked Pack of Cards',
    autor: 'Michael Dummett',
    quando: '1980 e 1996',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Michael Dummett', 'The Game of Tarot', '1980', 'A Wicked Pack of Cards', '1996'],
  },
  waiteEstrela: {
    obra: 'The Pictorial Key to the Tarot, "Divinatory Meanings" (XVII, IX)',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Loss, theft, privation, abandonment', 'hope and bright prospects', '1911'],
  },
  waiteInvertidas: {
    obra: 'The Pictorial Key to the Tarot, "Divinatory Meanings" (X, III)',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Increase, abundance, superfluity', 'the unravelling of involved matters', 'Pollack'],
  },
  waiteMorte: {
    obra: 'The Pictorial Key to the Tarot, "Divinatory Meanings" (XIII)',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['End, mortality', 'destruction, corruption', 'DEATH'],
  },
  waiteLouco: {
    obra: 'The Pictorial Key to the Tarot, II §3',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['the Zero is an unnumbered card', 'LE MAT', 'ZERO. THE FOOL'],
  },
  trocaForcaJustica: {
    obra: 'Cipher Manuscripts (Golden Dawn)',
    autor: 'Golden Dawn',
    quando: 'fim do séc. XIX',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Cipher Manuscripts', 'Força', 'Justiça', 'ordem zodiacal'],
  },
  moakley: {
    obra: 'The Tarot Cards Painted by Bonifacio Bembo',
    autor: 'Gertrude Moakley',
    quando: '1966',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Gertrude Moakley', '1966', 'Petrarca', 'Roda da Fortuna'],
  },
  // A única datação que NÃO vem do doc 05: é a tese, e é o achado que dá o tom.
  nechepsoPetosiris: {
    obra: null,
    obraChave: 'textosFundadores',
    autor: null,
    autorChave: 'pseudonimos',
    quando: 'c. 150–120 a.C.',
    doc: '00-tese.md',
    provas: ['Nechepso', 'Petosiris', 'pseudônimos', '150–120 a.C.'],
  },
};

// ---------------------------------------------------------------------------
// 3. A LINHA DO TEMPO — 18 marcos, em ordem
// ---------------------------------------------------------------------------
// `anoOrdem` é para ORDENAR e para posicionar na régua da tela. Ele NUNCA é
// impresso: a data que a tela mostra vem do recibo, porque "séc. XV" não é
// 1400 e escrever 1400 seria cravar o que a base não crava.
//
// `fase` agrupa a régua em quatro trechos, e a virada entre 'jogo' e 'leitura'
// é o argumento inteiro desta feature.
//
// `album` é o que amarra a linha do tempo ao álbum das 78: `grupos` são as
// chaves de COLLECTION_GROUPS (lib/tarotCollection.js) e `cartas` são ids do
// baralho (lib/tarotDeck.js). Nenhum dos dois módulos é importado aqui de
// propósito — tarotCollection puxa AsyncStorage, e esta feature é texto puro.
// Quem confere que os ids existem de verdade é o teste, que importa o baralho.
export const FASES = ['jogo', 'leitura', 'oculto', 'erudicao'];

export const LINHA_DO_TEMPO = [
  { id: 'rheinfelden-1377', anoOrdem: 1377, fase: 'jogo', datacoes: ['rheinfelden'], album: { grupos: [], cartas: [] } },
  { id: 'mameluco-naipes', anoOrdem: 1400, fase: 'jogo', datacoes: ['mameluco'], album: { grupos: ['paus', 'copas', 'espadas', 'ouros'], cartas: [] } },
  { id: 'trionfi-ferrara', anoOrdem: 1442, fase: 'jogo', datacoes: ['trionfiFerrara'], album: { grupos: [], cartas: [] } },
  { id: 'visconti-sforza', anoOrdem: 1451, fase: 'jogo', datacoes: ['viscontiSforza'], album: { grupos: ['maiores'], cartas: [] } },
  { id: 'sermao-steele', anoOrdem: 1470, fase: 'jogo', datacoes: ['sermaoSteele'], album: { grupos: ['maiores'], cartas: [] } },
  { id: 'sola-busca', anoOrdem: 1491, fase: 'jogo', datacoes: ['solaBusca'], album: { grupos: ['espadas'], cartas: ['espadas-03'] } },
  { id: 'palavra-taro', anoOrdem: 1505, fase: 'jogo', datacoes: ['palavraTarocho'], album: { grupos: [], cartas: [] } },
  { id: 'padroes-regionais', anoOrdem: 1550, fase: 'jogo', datacoes: ['padroesRegionais'], album: { grupos: ['maiores'], cartas: [] } },
  { id: 'folha-bolonhesa', anoOrdem: 1749, fase: 'leitura', datacoes: ['folhaBolonhesa'], album: { grupos: ['maiores'], cartas: ['major-00'] } },
  { id: 'etteilla', anoOrdem: 1770, fase: 'leitura', datacoes: ['etteilla'], album: { grupos: [], cartas: [] } },
  { id: 'volume-1781', anoOrdem: 1781, fase: 'leitura', datacoes: ['courtDeGebelin', 'mellet'], album: { grupos: ['maiores'], cartas: [] } },
  { id: 'levi-arvore', anoOrdem: 1854, fase: 'oculto', datacoes: ['levi', 'papusWirth'], album: { grupos: ['maiores'], cartas: [] } },
  { id: 'book-t', anoOrdem: 1888, fase: 'oculto', datacoes: ['bookT'], album: { grupos: ['maiores', 'paus', 'copas', 'espadas', 'ouros'], cartas: [] } },
  { id: 'rider-waite-smith', anoOrdem: 1909, fase: 'oculto', datacoes: ['riderWaiteSmith', 'solaBusca'], album: { grupos: ['maiores', 'paus', 'copas', 'espadas', 'ouros'], cartas: [] } },
  { id: 'waite-desmente', anoOrdem: 1911, fase: 'oculto', datacoes: ['pictorialKey', 'champollion'], album: { grupos: [], cartas: [] } },
  { id: 'marteau-marselha', anoOrdem: 1930, fase: 'oculto', datacoes: ['marteau'], album: { grupos: [], cartas: [] } },
  { id: 'crowley-thoth', anoOrdem: 1944, fase: 'oculto', datacoes: ['crowley'], album: { grupos: [], cartas: [] } },
  { id: 'dummett-arquivo', anoOrdem: 1980, fase: 'erudicao', datacoes: ['dummett'], album: { grupos: [], cartas: [] } },
];

// ---------------------------------------------------------------------------
// 4. O QUE NÃO SE SUSTENTA — e por quê
// ---------------------------------------------------------------------------
// Desmontar o mito É o conteúdo, não um adendo: por isso cada entrada tem duas
// metades obrigatórias e elas nunca saem separadas da função. Devolver
// `oQueSeDiz` sozinho seria o app afirmando a coisa errada.
export const NAO_SE_SUSTENTA = [
  { id: 'egito', datacoes: ['courtDeGebelin', 'pictorialKey', 'mameluco'] },
  { id: 'etimologia', datacoes: ['courtDeGebelin', 'champollion', 'palavraTarocho'] },
  { id: 'vinte-e-duas-letras', datacoes: ['mellet', 'levi', 'padroesRegionais'] },
  { id: 'povo-rom', datacoes: ['vaillant', 'merlin'] },
  { id: 'cinco-mil-anos', datacoes: ['trionfiFerrara', 'folhaBolonhesa'] },
  { id: 'sempre-espiritual', datacoes: ['rheinfelden', 'dummett'] },
];

// ---------------------------------------------------------------------------
// 5. O QUE O ÁLBUM MOSTRA — grupos e cartas
// ---------------------------------------------------------------------------
// Espelha as chaves de COLLECTION_GROUPS. O teste compara com o baralho real e
// reprova se alguém acrescentar um naipe lá e esquecer daqui.
export const GRUPOS_DO_ALBUM = ['maiores', 'paus', 'copas', 'espadas', 'ouros'];

// Carta do baralho → id da nota. Só entram as cartas em que a pesquisa achou
// algo VERIFICADO e específico daquela carta. As outras 72 devolvem null, de
// propósito: nota genérica em carta é enchimento, e enchimento com cara de
// fonte é o que esta feature existe para não fazer.
// A Força e a Justiça dividem a mesma nota porque a história é a mesma troca.
export const NOTAS_DE_CARTA = {
  'major-00': 'louco',
  'major-08': 'forca-justica',
  'major-10': 'roda',
  'major-11': 'forca-justica',
  'major-13': 'morte',
  'major-17': 'estrela',
  'espadas-03': 'tres-espadas',
};

// Datações de cada nota de carta.
const DATACOES_DA_NOTA = {
  louco: ['waiteLouco', 'bookT'],
  'forca-justica': ['trocaForcaJustica', 'riderWaiteSmith'],
  roda: ['waiteInvertidas', 'etteilla'],
  morte: ['waiteMorte'],
  estrela: ['waiteEstrela', 'riderWaiteSmith'],
  'tres-espadas': ['solaBusca', 'riderWaiteSmith'],
};

// Datações de cada seção do álbum.
const DATACOES_DO_GRUPO = {
  maiores: ['sermaoSteele', 'moakley'],
  paus: ['mameluco'],
  copas: ['mameluco'],
  espadas: ['mameluco'],
  ouros: ['mameluco'],
};

// ---------------------------------------------------------------------------
// 6. O QUE A PESQUISA PROCUROU E NÃO ACHOU
// ---------------------------------------------------------------------------
// Mesmo padrão de lib/seita.js e lib/synastry.js: declarar o buraco impede que
// a próxima pessoa o preencha com a versão que circula por aí. É registro de
// pesquisa, não vai para a tela — por isso fica no motor e em PT.
export const NAO_ACHADO = [
  {
    id: 'etimologiaDeTarocco',
    texto:
      'A origem da palavra tarocco. Não é lacuna desta pesquisa: em 1550 o poeta ferrarês Alberto Lollio já a declarava desconhecida. Por isso o app diz "ninguém sabe" em vez de escolher entre as etimologias que circulam — e a egípcia, de 1781, é a única com data de invenção conhecida.',
  },
  {
    id: 'dataDoSermaoSteele',
    texto:
      'A data cravada do Sermones de ludo cum aliis. As estimativas vão de 1450 a 1500 conforme o autor. A base manda escrever "última terça parte do séc. XV" e não um ano; o campo `quando` guarda só o século, e a nuance fica na prosa.',
  },
  {
    id: 'nomeMarselhaAntesDe1930',
    texto:
      'O nome "Tarot de Marseille" antes de Paul Marteau, 1930. Circulam duas atribuições anteriores — Papus, 1889, e Romain Merlin, 1856 — e a base não conseguiu conferir nenhuma das duas na fonte. O app escreve "popularizado em 1930", que é o que se sustenta.',
  },
  {
    id: 'rebatismoCelta',
    texto:
      'A fonte primária da tese de que Waite rebatizou a tiragem de "celta" na onda do Irish Literary Revival. É plausível e circula muito; a base não achou o documento. Por isso a Cruz Celta não entra nesta linha do tempo como marco datado — ela é caso de lib/mitos.js, que a classifica pelo que ela é.',
  },
  {
    id: 'tresCartasPassadoPresenteFuturo',
    texto:
      'A primeira atestação datada da tiragem de três cartas Passado/Presente/Futuro — que é a que este app usa. Não está em Waite (que dá 10, 42 e 35 cartas) nem no Book T. É popularização do séc. XX enquanto ninguém achar a atestação, e por isso o app nunca a chama de clássica.',
  },
  {
    id: 'ordemDoFrade',
    texto:
      'A ordem religiosa do autor do Sermão Steele. A base diz "um frade" e não nomeia a ordem; Johannes von Rheinfelden, de 1377, é que é dominicano. Os dois não se misturam, e o pack diz apenas "um frade anônimo".',
  },
];

// ---------------------------------------------------------------------------
// 7. O RECIBO — obra, autor e datação, montados no idioma
// ---------------------------------------------------------------------------
// A OBRA nunca traduz. O AUTOR ganha a forma consagrada da língua
// (traduzirAutor) ou, quando não é nome próprio, o rótulo do pack. A DATAÇÃO
// ganha a forma da língua (traduzirQuando). `linha` é o recibo pronto para a
// tela imprimir em uma linha só.
function reciboDe(ids, pack, lang) {
  return (ids || []).map((id) => {
    const d = DATACOES[id];
    if (!d) return null;
    const autor = d.autor ? traduzirAutor(d.autor, lang) : pack.autores[d.autorChave];
    const obra = d.obra || pack.obras[d.obraChave];
    const quando = traduzirQuando(d.quando, lang);
    return {
      id,
      obra,
      autor,
      quando,
      doc: `docs/tradicao/${d.doc}`,
      linha: `${obra} — ${autor}, ${quando}`,
    };
  }).filter(Boolean);
}

/** O recibo de uma datação avulsa, para quem precisar só dela. */
export function datacao(id, lang = 'pt') {
  const pack = packDoIdioma(lang);
  return reciboDe([id], pack, lang)[0] || null;
}

// ---------------------------------------------------------------------------
// 8. A PORTA DE ENTRADA DO ÁLBUM
// ---------------------------------------------------------------------------
/**
 * O bloco que abre a história dentro do Álbum das 78 Cartas.
 *
 * `lang`   — 'pt' (default), 'es' ou 'en'.
 * `anoRef` — ano de referência da conta de idade. A tela não passa nada; o
 *            teste crava para poder comparar byte a byte.
 *
 * Devolve `{ chamada, texto, anosDeLeitura, seculosDeImagem, cta, recibo }`.
 * `chamada` é a primeira coisa que a tela mostra e não tem uma data sequer —
 * é a vida real de quem abriu o álbum. O recibo vem no fim.
 */
export function aberturaDoAlbum(lang = 'pt', anoRef = anoCorrente()) {
  const pack = packDoIdioma(lang);
  const c = { anosDeLeitura: anosDeLeitura(anoRef), seculosDeImagem: seculosDeImagem(anoRef) };
  return {
    chamada: pack.abertura.chamada,
    texto: pack.abertura.texto(c),
    anosDeLeitura: c.anosDeLeitura,
    seculosDeImagem: c.seculosDeImagem,
    cta: pack.tela.ctaLinhaDoTempo,
    recibo: reciboDe(['trionfiFerrara', 'courtDeGebelin', 'dummett'], pack, lang),
  };
}

// ---------------------------------------------------------------------------
// 9. A LINHA DO TEMPO
// ---------------------------------------------------------------------------
function montarMarco(base, pack, lang) {
  const t = pack.marcos[base.id];
  return {
    id: base.id,
    anoOrdem: base.anoOrdem,
    fase: base.fase,
    faseNome: pack.fases[base.fase],
    titulo: t.titulo,
    texto: t.texto,
    album: base.album,
    recibo: reciboDe(base.datacoes, pack, lang),
  };
}

/**
 * Os 18 marcos, do primeiro baralho descrito na Europa à erudição que
 * estabeleceu tudo isto. Sempre em ordem cronológica — a ordem É o conteúdo.
 */
export function linhaDoTempo(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return [...LINHA_DO_TEMPO]
    .sort((a, b) => a.anoOrdem - b.anoOrdem)
    .map((m) => montarMarco(m, pack, lang));
}

/** Um marco pelo id. Id desconhecido devolve null — nunca um marco inventado. */
export function marcoPorId(id, lang = 'pt') {
  const base = LINHA_DO_TEMPO.find((m) => m.id === id);
  if (!base) return null;
  return montarMarco(base, packDoIdioma(lang), lang);
}

/** Os marcos de uma fase ('jogo', 'leitura', 'oculto', 'erudicao'). */
export function marcosDaFase(fase, lang = 'pt') {
  if (!FASES.includes(fase)) return [];
  return linhaDoTempo(lang).filter((m) => m.fase === fase);
}

// ---------------------------------------------------------------------------
// 10. O QUE NÃO SE SUSTENTA
// ---------------------------------------------------------------------------
function montarMito(base, pack, lang) {
  const t = pack.mitos[base.id];
  return {
    id: base.id,
    oQueSeDiz: t.oQueSeDiz,
    oQueAFonteMostra: t.oQueAFonteMostra,
    recibo: reciboDe(base.datacoes, pack, lang),
  };
}

/** As seis coisas que o mercado repete e a fonte não sustenta, com o porquê. */
export function oQueNaoSeSustenta(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return NAO_SE_SUSTENTA.map((m) => montarMito(m, pack, lang));
}

/** Um item pelo id. Id desconhecido devolve null. */
export function itemQueNaoSeSustenta(id, lang = 'pt') {
  const base = NAO_SE_SUSTENTA.find((m) => m.id === id);
  if (!base) return null;
  return montarMito(base, packDoIdioma(lang), lang);
}

// ---------------------------------------------------------------------------
// 11. DENTRO DO ÁLBUM — a seção e a carta
// ---------------------------------------------------------------------------
/**
 * A nota histórica de uma seção do álbum ('maiores', 'paus', 'copas',
 * 'espadas', 'ouros'). Chave desconhecida devolve null.
 */
export function historiaDoGrupo(grupo, lang = 'pt') {
  if (!GRUPOS_DO_ALBUM.includes(grupo)) return null;
  const pack = packDoIdioma(lang);
  const t = pack.grupos[grupo];
  return {
    grupo,
    titulo: t.titulo,
    texto: t.texto,
    recibo: reciboDe(DATACOES_DO_GRUPO[grupo], pack, lang),
  };
}

/**
 * A nota histórica de uma carta, pelo id do baralho ('major-17', 'espadas-03').
 *
 * Devolve `null` para as 72 cartas que não têm nota pesquisada — e isso é a
 * resposta certa, não um buraco: a tela simplesmente não mostra o bloco.
 * Inventar uma curiosidade para cada carta seria fabricar fonte, que é a única
 * coisa que esta feature não pode fazer.
 */
export function historiaDaCarta(cartaId, lang = 'pt') {
  const notaId = NOTAS_DE_CARTA[cartaId];
  if (!notaId) return null;
  const pack = packDoIdioma(lang);
  const t = pack.notasDeCarta[notaId];
  return {
    cartaId,
    notaId,
    titulo: t.titulo,
    texto: t.texto,
    recibo: reciboDe(DATACOES_DA_NOTA[notaId], pack, lang),
  };
}

/** As cartas do baralho que têm nota — para a tela marcar o selo no álbum. */
export function cartasComHistoria() {
  return Object.keys(NOTAS_DE_CARTA);
}

// ---------------------------------------------------------------------------
// 12. O PARALELO — o achado que muda o tom
// ---------------------------------------------------------------------------
/**
 * O bloco que fecha a linha do tempo: o tarô e a astrologia ocidental começam
 * com o mesmo gesto, e ele tem 2.000 anos. Sem este bloco a feature vira
 * denúncia — que é exatamente o que a tese pede para ela não ser.
 */
export function paraleloDaAntiguidade(lang = 'pt') {
  const pack = packDoIdioma(lang);
  return {
    chamada: pack.paralelo.chamada,
    texto: pack.paralelo.texto,
    recibo: reciboDe(['nechepsoPetosiris', 'courtDeGebelin'], pack, lang),
  };
}

// ---------------------------------------------------------------------------
// 13. BIBLIOGRAFIA, CHROME E COMPARTILHÁVEL
// ---------------------------------------------------------------------------
/** A bibliografia da tela, no idioma. Títulos de obra intactos. */
export function fontes(lang = 'pt') {
  return packDoIdioma(lang).fontes;
}

/** Títulos, rótulos e botões da tela. */
export function chromeDaTela(lang = 'pt') {
  return packDoIdioma(lang).tela;
}

/**
 * O compartilhável de um item de "o que não se sustenta" — quatro linhas e o
 * link. É a peça que circula sozinha: quase todo mundo acha que sabe a origem
 * do tarô, e quase todo mundo sabe a versão de 1781.
 *
 * Aceita o id ou o objeto já montado. Id desconhecido devolve null.
 */
export function textoCompartilhavel(mitoOuId, lang = 'pt') {
  const id = typeof mitoOuId === 'string' ? mitoOuId : mitoOuId && mitoOuId.id;
  const item = itemQueNaoSeSustenta(id, lang);
  if (!item) return null;
  const pack = packDoIdioma(lang);
  const recibo = item.recibo.map((r) => r.linha).join(' · ');
  return [
    `${pack.compartilhar.oQueSeDiz} ${item.oQueSeDiz}`,
    `${pack.compartilhar.oQueAFonteMostra} ${item.oQueAFonteMostra}`,
    `${pack.compartilhar.recibo} ${recibo}`,
    LINK_COMPARTILHAR,
  ].join('\n');
}
