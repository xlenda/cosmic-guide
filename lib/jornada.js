// lib/jornada.js
// A JORNADA GUIADA — trilhas de 7 dias com progresso visível.
//
// i18n — FEITO EM DUAS CAMADAS, e elas não se misturam:
//
//   · Os rótulos de FEATURES (seção 2) são CHAVE de lib/i18n.js
//     (`jornada.feature.*`) — são nome de tela do app e entram INTERPOLADOS
//     numa frase já traduzida ("Open {feature}"). Continuam lá.
//
//   · O CONTEÚDO (nome/subtitulo das trilhas, os quatro campos dos 28 dias,
//     nome/legenda das medalhas) tem PACK POR IDIOMA em
//     lib/traducoes/jornada.es.js e lib/traducoes/jornada.en.js, com a MESMA
//     FORMA do pack pt (que é derivado das tabelas daqui por packDeTextos —
//     o PT canônico continua inline neste arquivo, intocado byte a byte, e é
//     ele que test/jornada.test.js varre). O motor ganhou `lang` com default
//     'pt' em todo acessor de texto: chamada antiga continua PT, a tela passa
//     o idioma do useLanguage(). Paridade de chaves, recibo no fim e linha
//     vermelha nos três idiomas são cobrados por test/jornadaIdiomas.test.js.
//
// O que NÃO se traduz e fica aqui: DATACOES (obra, autor, século) e os
// verbatins latinos — traduzir citação é falsificá-la, mesma regra de
// lib/zodiacBody.js e lib/grounding.js. Nos packs, nome de obra e locus ficam
// como estão; nome próprio consagrado traduz (Ptolomeu → Ptolemy/Ptolomeo).
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de escrever qualquer texto aqui
// ===========================================================================
// Esta tela ensina história. Não promete nada a ninguém.
//
// PROIBIDO, sem exceção e nem por implicação: qualquer efeito sobre corpo ou
// mente ("acalma", "reduz a ansiedade", "melhora o sono", "energiza",
// "equilibra", "alivia") e qualquer promessa de resultado ("vai atrair",
// "garante", "faz acontecer", "muda sua vida"). Uma trilha de 7 dias é o
// formato clássico do app devocional, e é exatamente nesse formato que a
// promessa se infiltra — "no sétimo dia você vai sentir". Não vai. Nós não
// sabemos, e dizer que sabemos é a mentira mais fácil deste produto.
//
// PERMITIDO: o que a tradição REGISTRA, sempre no passado e sempre com dono
// ("Catão mandava plantar…"), o que a pessoa VAI FAZER ("abra o Calendário
// Lunar e veja a fase de hoje") e a pergunta que ela responde sozinha.
//
// test/jornada.test.js varre os quatro campos de todos os 28 dias atrás desse
// vocabulário e falha o build. É de propósito.
// ===========================================================================
//
// ===========================================================================
// A REGRA DE TOM — povão primeiro, recibo depois. Nunca o contrário.
// ===========================================================================
// Feedback literal do dono: "muito científico, preciso mesclar para o povão
// entender e deixar científico também".
//
// A tradução disso em regra de escrita, e ela é posicional: TODA `leitura`
// ABRE em português de conversa — a coisa que a pessoa entende sem nenhum
// preparo — e FECHA com o recibo (obra, autor, século). O recibo no fim é
// prêmio; o recibo no começo é pedágio, e a pessoa fecha o app antes de
// chegar no conteúdo.
//
// Trava: o teste exige que o último período de toda `leitura` comece com
// "Recibo:" e que nenhuma delas ABRA com nome de autor ou com data.
// ===========================================================================
//
// ===========================================================================
// DE ONDE VEM A DATA — e por que ela é uma tabela, não um texto
// ===========================================================================
// A tese (docs/tradicao/00-tese.md) obriga: "toda afirmação histórica precisa
// de obra + autor + século, e precisa EXISTIR na base docs/tradicao/".
//
// Se a citação morasse solta dentro da prosa, o único jeito de checá-la seria
// alguém ler os 28 textos com os documentos abertos ao lado. Então ela não
// mora solta: cada dia aponta para ids de DATACOES, e cada entrada de DATACOES
// carrega `doc` (o arquivo da base) e `provas` (as strings literais que TÊM que
// aparecer nesse arquivo). O teste abre os documentos e confere prova por
// prova. É a mesma ideia do teste de efeméride: a afirmação checável tem que
// ser checada por máquina, não por boa vontade.
//
// E a varredura roda nos dois sentidos: o teste também procura QUALQUER data na
// prosa (ano de quatro dígitos, "séc. X", "III a.C.") e exige que ela pertença
// a uma entrada de DATACOES. Inventar antiguidade fica impossível por descuido
// — que é justamente como ela costuma entrar.
//
// Quando NÃO houver fonte antiga: a entrada usa `quando: 'prática popular
// contemporânea, sem fonte antiga localizada'`. É a frase exata que a tese
// manda usar, e ela é preferível a um século aproximado.
// ===========================================================================
import { localDayStr } from './localDay';
import { ROUTES } from '../routes';
import packEs from './traducoes/jornada.es';
import packEn from './traducoes/jornada.en';

// A frase que substitui a antiguidade inventada — literal, sempre igual, a mesma
// constante de lib/rituais.js e lib/calendarioCosmico.js. O cabeçalho acima
// promete o mecanismo desde o primeiro dia e NENHUMA entrada o usava: a regra da
// lavoura era transposta para a vida de quem lê sem marca de transposição
// nenhuma. Agora é constante exportada, e test/jornada.test.js exige a frase
// literal em toda leitura cuja pergunta ou ação aplique a regra antiga à vida
// de quem lê.
export const SEM_FONTE_ANTIGA = 'prática popular contemporânea, sem fonte antiga localizada';

// ---------------------------------------------------------------------------
// 1. PERSISTÊNCIA
// ---------------------------------------------------------------------------
// O helper vive em lib/storage.js e é o MESMO de lib/cosmicSound.js e dos
// rituais. Antes eram duas cópias literais do mesmo getStorage — e as duas
// tinham o mesmo defeito: o fallback de memória morava no ramo `if (!S)`, que é
// inalcançável (o require SEMPRE resolve; quem estoura é a chamada), então uma
// falha de storage aqui apagava o dia concluído em silêncio. O tratamento certo
// (fallback no CATCH, flag de sessão) está escrito uma vez só, lá.
import { getItemSeguro, setItemSeguro } from './storage';

export const CHAVE_JORNADA = 'cosmic-jornada-v1';

// ---------------------------------------------------------------------------
// 2. AS FEATURES QUE UMA AÇÃO PODE APONTAR
// ---------------------------------------------------------------------------
// A ação do dia nunca inventa tela: ela manda a pessoa para algo que já existe.
// `rota` é o nome de rota real de routes.js — importado, não copiado, pra que
// renomear uma rota quebre o teste em vez de quebrar o botão em produção.
//
// 'som' é o único com rota nula de propósito: o Som do Céu é o
// <CosmicSoundPlayer> montado global em App.js e embutido inline na Home e no
// Assentar — não é destino de navegação, é um controle que já está na tela.
//
// `rotulo` É CHAVE DE TRADUÇÃO, não texto. Foi a primeira parcela da migração
// de i18n deste arquivo, e ela veio primeiro porque era a de pior
// custo-benefício deixar quebrada: são seis strings, elas entram DENTRO de uma
// frase traduzida (t('jornada.acao.abrir', { feature }) → "Open {feature}") e
// são NOME DE TELA do próprio app, não citação — o botão em inglês lia "Open
// Diário Cósmico". A chave é literal, nunca montada por template, pra que
// test/i18nKeysExist.test.js enxergue as seis na varredura estática (é a mesma
// razão de MES_KEYS em screens/CalendarioCosmicoScreen.js ser um array
// literal). `rota` continua vindo de routes.js de propósito: renomear uma rota
// tem que quebrar o teste, não o botão em produção.
export const FEATURES = {
  taro: { rotulo: 'jornada.feature.taro', rota: ROUTES.TAROT_MAIN },
  mapa: { rotulo: 'jornada.feature.mapa', rota: ROUTES.BIRTH_CHART },
  calendarioLunar: { rotulo: 'jornada.feature.calendarioLunar', rota: ROUTES.LUNAR_CALENDAR },
  som: { rotulo: 'jornada.feature.som', rota: null },
  aterramento: { rotulo: 'jornada.feature.aterramento', rota: ROUTES.GROUNDING },
  diario: { rotulo: 'jornada.feature.diario', rota: ROUTES.DIARY },
};

// ---------------------------------------------------------------------------
// 3. AS DATAÇÕES — a base de recibos
// ---------------------------------------------------------------------------
// `provas` são strings LITERAIS procuradas no arquivo `doc` da base. Guardo o
// locus (capítulo/verso) junto do autor e do século porque é o locus que
// permite conferir, e é ele que o mercado nunca dá.
export const DATACOES = {
  // ---- Lua e calendário: docs/tradicao/04 ----
  catoPlantio: {
    obra: 'De Agri Cultura 40.1',
    autor: 'Catão, o Velho',
    quando: 'séc. II a.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['De Agri Cultura', 'Catão, o Velho', 'II a.C.', '40.1', 'luna silente'],
  },
  paladioSemeadura: {
    obra: 'Opus Agriculturae I.6.12',
    autor: 'Paládio',
    quando: 'séc. IV–V d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Opus Agriculturae', 'Paládio', 'IV–V d.C.', 'I.6.12'],
  },
  ptolomeuQuartos: {
    obra: 'Tetrabiblos I.8',
    autor: 'Ptolomeu',
    quando: 'séc. II d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Tetrabiblos', 'Ptolomeu', 'I.8', 'séc. II'],
  },
  rudhyarOitoFases: {
    obra: 'The Lunation Cycle',
    autor: 'Dane Rudhyar',
    quando: '1967',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['The Lunation Cycle', 'Dane Rudhyar', '1967'],
  },
  columelaFavas: {
    obra: 'De Re Rustica XI.2.85',
    autor: 'Columela',
    quando: 'séc. I d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['De Re Rustica', 'Columela', 'I d.C.', 'XI.2.85'],
  },
  columelaMadeira: {
    obra: 'De Re Rustica XI.2.11',
    autor: 'Columela',
    quando: 'séc. I d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['De Re Rustica', 'Columela', 'I d.C.', 'XI.2.11'],
  },
  plinioColheita: {
    obra: 'Naturalis Historia XVIII.321',
    autor: 'Plínio, o Velho',
    quando: 'séc. I d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Naturalis Historia', 'Plínio, o Velho', 'I d.C.', 'XVIII.321'],
  },
  plinioMadeira: {
    obra: 'Naturalis Historia XVI.190–191',
    autor: 'Plínio, o Velho',
    quando: 'séc. I d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Naturalis Historia', 'Plínio, o Velho', 'I d.C.', 'XVI.190–191', 'interlunium'],
  },
  // XVI.190–191 e XI.2.11 são o locus de CORTAR MADEIRA e nada mais. Esterco e
  // capina estão sob outra rubrica em docs/tradicao/04 §3.2, com outros loci —
  // e o dia 6 citava as três atividades com recibo para uma só.
  plinioEsterco: {
    obra: 'Naturalis Historia XVIII.322',
    autor: 'Plínio, o Velho',
    quando: 'séc. I d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Naturalis Historia', 'Plínio, o Velho', 'I d.C.', 'XVIII.322', 'decrescente luna'],
  },
  columelaEsterco: {
    obra: 'De Re Rustica II.5.1',
    autor: 'Columela',
    quando: 'séc. I d.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['De Re Rustica', 'Columela', 'I d.C.', 'II.5.1'],
  },
  hesiodoDias: {
    obra: 'Os Trabalhos e os Dias, vv. 765–828',
    autor: 'Hesíodo',
    quando: 'séc. VII a.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Os Trabalhos e os Dias', 'Hesíodo', 'VII a.C.', '765–828'],
  },
  virgilioDias: {
    obra: 'Geórgicas I.276–286',
    autor: 'Virgílio',
    quando: 'séc. I a.C.',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Geórgicas', 'Virgílio', 'I a.C.', 'I.276–286'],
  },
  almanaqueNomesDaLua: {
    obra: "Maine Farmers' Almanac",
    autor: "Maine Farmers' Almanac (sem autor único)",
    quando: 'anos 1930',
    doc: '00-tese.md',
    provas: ["Maine Farmers' Almanac", '1930'],
  },
  // A cadeia dos nomes de lua tem CINCO elos em docs/tradicao/04 §4.1, e o
  // almanaque dos anos 1930 é o terceiro. Dizer só "anos 1930" encurtava a
  // história; dizer "não é indígena" endurecia além do que a base sustenta —
  // a avaliação corrente (Haddock) é "parcialmente verdadeira".
  beardPrimeiraLista: {
    obra: "The American Boys' Book of Signs, Signals and Symbols (primeira lista impressa)",
    autor: 'Daniel Carter Beard',
    quando: '1918',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Daniel Carter Beard', '1918', 'primeira lista impressa'],
  },
  oldFarmersUmNomePorMes: {
    obra: "Old Farmer's Almanac (simplificação para um nome por mês)",
    autor: "Old Farmer's Almanac (sem autor único)",
    quando: 'séc. XX',
    doc: '04-lua-fases-e-calendario.md',
    provas: ["Old Farmer's Almanac", 'simplificou para um nome'],
  },
  haddockMedley: {
    obra: 'Mysteries of the Moon (exame das atribuições)',
    autor: 'Patricia Haddock',
    quando: '1992',
    doc: '04-lua-fases-e-calendario.md',
    provas: ['Patricia Haddock', '1992', 'parcialmente'],
  },
  nolleSuperlua: {
    obra: 'cunhagem do termo "supermoon"',
    autor: 'Richard Nolle',
    quando: '1979',
    doc: '00-tese.md',
    provas: ['Richard Nolle', '1979'],
  },

  // ---- Mapa, ângulos e casas: docs/tradicao/03 e 12 ----
  ptolomeuSignosInstantes: {
    obra: 'Tetrabiblos I.22',
    autor: 'Ptolomeu',
    quando: 'séc. II d.C.',
    doc: '00-tese.md',
    provas: ['Tetrabiblos', 'Ptolomeu', 'I.22', 'séc. II'],
  },
  pauloAscendente: {
    obra: 'Introductory Matters, cap. 24',
    autor: 'Paulo de Alexandria',
    quando: '378 d.C.',
    doc: '03-casas-e-mapa-natal.md',
    provas: ['Paulo de Alexandria', 'Introductory Matters', 'cap. 24', '378 d.C.', 'oíax'],
  },
  firmicoFundamento: {
    obra: 'Mathesis II, 19.2',
    autor: 'Fírmico Materno',
    quando: 'c. 335 d.C.',
    doc: '03-casas-e-mapa-natal.md',
    provas: ['Fírmico Materno', 'Mathesis', 'II, 19.2', 'c. 335 d.C.'],
  },
  handCuspides: {
    obra: 'Whole Sign Houses (levantamento dos mapas sobreviventes)',
    autor: 'Robert Hand',
    quando: '2007',
    doc: '03-casas-e-mapa-natal.md',
    provas: ['Hand 2007', 'Oxyrhynchus', 'cúspides intermediárias'],
  },
  nomesGregosDosLugares: {
    obra: 'Tetrabiblos, nota 56 do tradutor (Loeb)',
    autor: 'F. E. Robbins',
    quando: '1940',
    doc: '12-as-doze-casas.md',
    provas: ['Robbins', 'nota 56', '1940', 'Boa Fortuna', 'Porta do Hades'],
  },
  firmicoNomesLatinos: {
    obra: 'Mathesis II.XVI–XX',
    autor: 'Fírmico Materno',
    quando: 'séc. IV d.C.',
    doc: '12-as-doze-casas.md',
    provas: ['Fírmico', 'Mathesis', 'II.XVI–XX', 'séc. IV'],
  },
  valenteLugares: {
    obra: 'Antologias, Livro II caps. 4–16',
    autor: 'Vétio Valente',
    quando: 'c. 150–175 d.C.',
    doc: '03-casas-e-mapa-natal.md',
    provas: ['Vétio Valente', 'c. 150–175 d.C.'],
  },
  pauloCasasInteiras: {
    obra: 'Introductory Matters, cap. 24 (Casas Inteiras)',
    autor: 'Paulo de Alexandria',
    quando: '378 d.C.',
    doc: '03-casas-e-mapa-natal.md',
    provas: ['Casas Inteiras', 'Paulo de Alexandria', '378 d.C.', 'zoidion'],
  },
  placidoPublicacao: {
    obra: 'publicação do sistema de casas Placidus',
    autor: 'Placido de Titis (método atribuído a Giovanni Antonio Magini)',
    quando: '1650',
    doc: '03-casas-e-mapa-natal.md',
    provas: ['Placido', '1650', 'Giovanni Antonio Magini', '1555–1617'],
  },

  // ---- Tarô: docs/tradicao/05 ----
  sermaoSteele: {
    obra: 'Sermão Steele (primeira lista dos 22 trunfos)',
    autor: 'pregador dominicano anônimo',
    quando: 'c. 1470–1500',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Sermão Steele', '22 trunfos', 'c. 1470–1500'],
  },
  gebelinEgito: {
    obra: 'Le Monde primitif, vol. VIII',
    autor: 'Antoine Court de Gébelin',
    quando: '1781',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Le Monde primitif', 'Court de Gébelin', '1781'],
  },
  champollionHieroglifo: {
    obra: 'decifração do hieróglifo (Pedra de Roseta achada em 1799)',
    autor: 'Jean-François Champollion',
    quando: '1822',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Champollion', '1822', '1799'],
  },
  etteillaBaralho: {
    obra: 'Grand Etteilla, primeiro baralho desenhado para adivinhação',
    autor: 'Jean-Baptiste Alliette, "Etteilla"',
    quando: '1789',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Etteilla', 'Grand Etteilla', '1789', '1770'],
  },
  melletLetras: {
    obra: 'Le Monde primitif, vol. VIII (ensaio do Comte de Mellet)',
    autor: 'Comte de Mellet',
    quando: '1781',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Comte de Mellet', '1781', 'alfabeto'],
  },
  sepherYetzirah: {
    obra: 'Sepher Yetzirah (3 mães, 7 duplas, 12 simples)',
    autor: 'anônimo, tradição hebraica',
    quando: 'sem datação consensual — a atribuição ao tarô é de 1781 em diante',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Sepher Yetzirah', 'mães', 'duplas', 'simples'],
  },
  bookTGoldenDawn: {
    obra: 'Book T / Cipher Manuscripts',
    autor: 'Golden Dawn',
    quando: 'fim do séc. XIX',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Book T', 'Golden Dawn', 'Cipher Manuscripts', 'ordem zodiacal'],
  },
  waitePictorialKey: {
    obra: 'The Pictorial Key to the Tarot',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['The Pictorial Key to the Tarot', 'Waite', '1911'],
  },
  baralhoRiderWaiteSmith: {
    obra: 'baralho Rider-Waite-Smith (William Rider & Son, Londres)',
    autor: 'arte de Pamela Colman Smith, estrutura de A. E. Waite',
    quando: 'dezembro de 1909',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['Pamela Colman Smith', '1909', 'William Rider & Son', '1878–1951'],
  },
  cruzCeltaWaite: {
    obra: 'The Pictorial Key to the Tarot, "An Ancient Celtic Method of Divination"',
    autor: 'A. E. Waite',
    quando: '1911',
    doc: '05-taro-historia-e-leitura.md',
    provas: ['An Ancient Celtic Method of Divination', 'Waite', '1911', '1890'],
  },

  // ---- A tese: docs/tradicao/00-tese.md ----
  bugSignoSolar: {
    obra: 'Tetrabiblos I.22 (os signos começam em instantes, não em datas)',
    autor: 'Ptolomeu',
    quando: 'séc. II d.C.',
    doc: '00-tese.md',
    provas: ['signoFromDate', 'Tetrabiblos', 'I.22', 'equinócios e solstícios'],
  },
  nechepsoPetosiris: {
    obra: 'textos fundadores atribuídos a Nechepso e Petosiris (pseudônimos)',
    autor: 'autores gregos anônimos, em Alexandria',
    quando: '150–120 a.C.',
    doc: '00-tese.md',
    provas: ['Nechepso', 'Petosiris', '150–120 a.C.', 'pseudônimos'],
  },
  sextoEmpiricoContra: {
    obra: 'Contra os Astrólogos',
    autor: 'Sexto Empírico',
    quando: 'séc. III',
    doc: '00-tese.md',
    provas: ['Contra os Astrólogos', 'Sexto Empírico', 'séc. III'],
  },
  ptolomeuDissidente: {
    obra: 'Tetrabiblos (leitura de conjunto)',
    autor: 'Ptolomeu, contra a prática corrente de Vétio Valente',
    quando: 'séc. II d.C.',
    doc: '00-tese.md',
    provas: ['reformador dissidente', 'Valente', 'lotes'],
  },
  ptolomeuAversao: {
    obra: 'Tetrabiblos I.16 e IV.7',
    autor: 'Ptolomeu',
    quando: 'séc. II d.C.',
    doc: '00-tese.md',
    provas: ['I.16', 'IV.7', 'desconexos', '48'],
  },
  yavanajataka: {
    obra: 'Yavanajātaka ("a astrologia dos jônios"), do grego para o sânscrito',
    autor: 'tradutor anônimo',
    quando: 'séc. II d.C.',
    doc: '00-tese.md',
    provas: ['Yavanajātaka', 'sânscrito', 'sideral', 'tropical'],
  },
  alanLeoProcesso: {
    obra: 'processos por adivinhação na Inglaterra',
    autor: 'Alan Leo (réu)',
    quando: '1914 e 1917',
    doc: '00-tese.md',
    provas: ['Alan Leo', '1914', '1917', 'tendências'],
  },
};

// ---------------------------------------------------------------------------
// 4. AS TRILHAS
// ---------------------------------------------------------------------------
// Formato de cada dia, e os quatro campos são obrigatórios em todos os 28:
//   titulo   — curto, sem promessa, sem número (o número é da UI)
//   leitura  — abre no português de conversa, FECHA em "Recibo: …"
//   pergunta — de diário. Sobre a vida de quem lê, que é a camada 3 da tese:
//              dela, nunca nossa para afirmar. Por isso é pergunta, não frase.
//   acao     — mínima, verificável, e aponta pra feature que JÁ existe
//   fontes   — ids de DATACOES; o primeiro é o que aparece no "Recibo:"
export const TRILHAS = [
  {
    id: 'luaSeteDias',
    nome: '7 dias de Lua',
    subtitulo: 'O que a lavoura antiga fazia em cada fase — e o que é invenção de ontem',
    duracao: 7,
    dias: [
      {
        dia: 1,
        titulo: 'A lua que ninguém vê',
        leitura:
          'Lua Nova é a única fase que você não enxerga. Ela está lá em cima, do lado do Sol, com a cara escura virada pra gente. Os romanos chamavam isso de luna silente — a lua muda. E era justamente aí que se plantava: figueira, macieira, oliveira, pereira e videira, no fim da tarde. A lógica é de roça, não de mistério — o que vai crescer entra na terra quando a Lua vai crescer junto. ' +
          'Recibo: Catão, o Velho, De Agri Cultura 40.1, séc. II a.C.',
        pergunta: 'O que você está começando agora que ainda não dá pra mostrar pra ninguém?',
        acao: {
          texto: 'Abra o Calendário Lunar e veja em que fase a Lua está hoje de verdade.',
          feature: 'calendarioLunar',
        },
        fontes: ['catoPlantio'],
      },
      {
        dia: 2,
        titulo: 'A regra que resume mil anos',
        leitura:
          'Se você guardar uma frase só desta trilha, guarde esta: na roça antiga, o que se queria ver crescer ia para a terra com a Lua crescendo, e o que se queria secar ou diminuir era feito na minguante. É a coisa que sua avó falava, e ela tem versão em latim escrita muito antes: omnia quae seruntur crescente luna — tudo que se semeia deve ser semeado com a lua crescendo. Uma regra só, aplicada ao ano inteiro da roça — e ela é sobre semente, madeira e lã, não sobre assunto de gente: estender a regra à própria vida é ' +
          SEM_FONTE_ANTIGA +
          '. ' +
          'Recibo: Paládio, Opus Agriculturae I.6.12, séc. IV–V d.C.',
        pergunta: 'Tem alguma coisa na sua vida hoje que é de fazer crescer, e outra que é de diminuir? Quais?',
        acao: {
          texto: 'Escreva no Diário Cósmico uma coisa que você quer aumentar e uma que quer reduzir.',
          feature: 'diario',
        },
        fontes: ['paladioSemeadura'],
      },
      {
        dia: 3,
        titulo: 'Metade acesa',
        leitura:
          'Quarto Crescente é a Lua cortada ao meio no céu. E aqui vem uma correção que quase nenhum app faz: a divisão antiga da Lua é em QUATRO pedaços, não em oito. Ptolomeu descreve os quatro quartos e dá uma qualidade a cada um — da nova ao quarto crescente, mais úmido; do quarto à cheia, mais quente; da cheia ao minguante, mais seco; do minguante ao sumiço, mais frio. As oito fases com nome psicológico, essas são de 1967, e o autor tem nome. ' +
          'Recibo: Ptolomeu, Tetrabiblos I.8, séc. II d.C.; as oito fases psicológicas são de Dane Rudhyar, The Lunation Cycle, 1967.',
        pergunta: 'Em que ponto do caminho você está: no começo, na metade, ou já voltando?',
        acao: {
          texto: 'No Calendário Lunar, procure a data do próximo quarto — e repare que ela é uma hora exata, não um dia inteiro.',
          feature: 'calendarioLunar',
        },
        fontes: ['ptolomeuQuartos', 'rudhyarOitoFases'],
      },
      {
        dia: 4,
        titulo: 'A noite que engana',
        leitura:
          'Lua Cheia parece cheia por umas três noites seguidas, mas cheia mesmo ela é num instante só — o momento em que fica a 180 graus do Sol. Por isso almanaque discorda de app: um rotula por fatia, o outro pelo instante. E vai uma surpresa: na cheia, a fonte romana manda SEMEAR favas, não colher. Colher para guardar é a minguante. De quebra, dois nomes que soam antigos e não são: a primeira lista impressa de nomes de lua é de 1918, o Maine Farmers\' Almanac publicou as listas dele nos anos 1930 e o Old Farmer\'s Almanac reduziu tudo a um nome por mês; e "superlua" foi cunhada em 1979. ' +
          'Recibo: Columela, De Re Rustica XI.2.85, séc. I d.C.; primeira lista impressa em Daniel Carter Beard, 1918; listas do Maine Farmers\' Almanac, anos 1930; simplificação do Old Farmer\'s Almanac, séc. XX; "superlua" por Richard Nolle, 1979.',
        pergunta: 'O que na sua vida parece estar no auge, mas você sabe que ainda está sendo semeado?',
        acao: {
          texto: 'Deixe o Som do Céu tocando por três minutos enquanto relê o parágrafo de hoje.',
          feature: 'som',
        },
        fontes: [
          'columelaFavas',
          'beardPrimeiraLista',
          'almanaqueNomesDaLua',
          'oldFarmersUmNomePorMes',
          'nolleSuperlua',
        ],
      },
      {
        dia: 5,
        titulo: 'O que se corta, se colhe e se tosquia',
        leitura:
          'A Lua começou a diminuir. Na roça antiga, é agora que se mexe em tudo que precisa secar sem apodrecer. Plínio escreveu a regra numa linha só: omnia quae caeduntur, carpuntur, tondentur, innocentius decrescente luna — tudo que se corta, se colhe e se tosquia sofre menos dano com a lua minguante. Repare que a promessa dele é modesta: não é que fica melhor, é que estraga menos. ' +
          'Recibo: Plínio, o Velho, Naturalis Historia XVIII.321, séc. I d.C.',
        pergunta: 'O que você já colheu neste mês e ainda não parou pra reparar que colheu?',
        acao: {
          texto: 'Tire uma carta no Tarô pensando no que está pronto pra ser encerrado.',
          feature: 'taro',
        },
        fontes: ['plinioColheita'],
      },
      {
        dia: 6,
        titulo: 'Madeira, esterco e o silêncio do fim do mês',
        leitura:
          'O fim do mês lunar era a temporada dos trabalhos pesados e sem plateia: cortar madeira, espalhar esterco, capinar. Para a madeira, Plínio dá a janela com precisão de artesão — entre o vigésimo e o trigésimo dia da Lua, e o ponto ótimo é o interlunium, a lua escura; Columela repete a mesma faixa. Esterco e capina são outra rubrica, com outro endereço, e por isso vão com recibo próprio. Nada disso é bonito de postar, e é exatamente por isso que sobreviveu: era trabalho que dava resultado material, e por isso alguém anotou. ' +
          'Recibo: para a madeira, Plínio, o Velho, Naturalis Historia XVI.190–191, séc. I d.C., e Columela, De Re Rustica XI.2.11, séc. I d.C.; para o esterco e a capina, Plínio, o Velho, Naturalis Historia XVIII.322, séc. I d.C., e Columela, De Re Rustica II.5.1, séc. I d.C.',
        pergunta: 'Qual é o seu trabalho de lua escura — aquele que ninguém vê e que sustenta o resto?',
        acao: {
          texto: 'Faça um ciclo de respiração no Assentar antes de fechar o app hoje.',
          feature: 'aterramento',
        },
        fontes: ['plinioMadeira', 'columelaMadeira', 'plinioEsterco', 'columelaEsterco'],
      },
      {
        dia: 7,
        titulo: 'O calendário que veio antes das fases',
        leitura:
          'Fecha a trilha com a parte que quase todo mundo pula. Antes de existir "Lua Gibosa Crescente", existia contagem: primeiro dia da Lua, segundo, terceiro, até o trigésimo. Hesíodo tem um calendário dia a dia — o quarto e o sétimo são sagrados. Virgílio manda fugir do quinto e diz que o décimo sétimo é feliz para plantar a vinha e domar bois. Ou seja: o esquema antigo é de DIAS NUMERADOS, não de oito fases com nome. Quem transpõe um pro outro está inventando uma equivalência que a fonte não faz — e agora você sabe disso antes de todo mundo. ' +
          'Recibo: Hesíodo, Os Trabalhos e os Dias, vv. 765–828, séc. VII a.C.; Virgílio, Geórgicas I.276–286, séc. I a.C.',
        pergunta: 'Depois destes sete dias, o que você olha no céu de um jeito diferente?',
        acao: {
          texto: 'Volte ao Calendário Lunar e confira quantos dias faltam para a próxima Lua Nova.',
          feature: 'calendarioLunar',
        },
        fontes: ['hesiodoDias', 'virgilioDias'],
      },
    ],
  },

  {
    id: 'mapaSeteDias',
    nome: 'Conhecendo seu Mapa',
    subtitulo: 'Sol, Lua, Ascendente e casas — o que é conta e o que é opinião de alguém',
    duracao: 7,
    dias: [
      {
        dia: 1,
        titulo: 'Seu Sol não é uma data',
        leitura:
          'Todo mundo sabe o próprio signo solar, e quase todo mundo aprendeu errado como ele funciona. Signo do Sol não é faixa de calendário: é onde o Sol estava, em grau, no instante em que você nasceu. E os signos começam nos equinócios e solstícios, que são INSTANTES — não os dias 21 de cada mês. Quem nasceu perto da virada pode ter o signo trocado a vida inteira por causa disso. É por isso que este app pede sua data de nascimento em vez de perguntar seu signo: a conta acerta mais que a memória. ' +
          'Recibo: Ptolomeu, Tetrabiblos I.22, séc. II d.C.',
        pergunta: 'Você já duvidou do seu signo alguma vez? O que te fez duvidar?',
        acao: {
          texto: 'Abra o Mapa Natal e confira se sua data e hora de nascimento estão certas.',
          feature: 'mapa',
        },
        fontes: ['ptolomeuSignosInstantes'],
      },
      {
        dia: 2,
        titulo: 'A Lua muda de signo a cada dois dias e meio',
        leitura:
          'O Sol leva um mês pra atravessar um signo. A Lua leva dois dias e meio. Isso muda tudo na hora de ler um mapa: a Lua é a peça que mais depende de saber a hora certa, e é a que mais separa dois irmãos nascidos na mesma semana. Um detalhe bonito dos gregos: eles chamavam o terceiro lugar do mapa de "a Deusa", que era a Lua, e o nono de "o Deus", que era o Sol. Os dois luminares — Sol e Lua, as duas luzes do mapa — tinham cada um a sua casa preferida, e daí veio parte dos nomes que a gente usa até hoje. ' +
          'Recibo: nomes gregos dos lugares na nota 56 de F. E. Robbins ao Tetrabiblos, Loeb, 1940.',
        pergunta: 'Quem na sua família tem a data de nascimento mais perto da sua? No que vocês são diferentes?',
        acao: {
          texto: 'No Mapa Natal, ache a posição da sua Lua e anote o signo dela.',
          feature: 'mapa',
        },
        fontes: ['nomesGregosDosLugares'],
      },
      {
        dia: 3,
        titulo: 'O Ascendente é o leme',
        leitura:
          'O Ascendente é o grau que estava subindo no horizonte leste na hora exata em que você nasceu, no lugar exato onde você nasceu. Muda a cada duas horas, mais ou menos — hora chutada é quase cara ou coroa entre dois signos. E ele não é "como o mundo te vê": essa é leitura moderna. Na fonte antiga ele é a origem e o fundamento do mapa inteiro, o ponto a partir do qual se conta todo o resto. Paulo de Alexandria usa uma palavra grega bonita pra isso: oíax, o leme. ' +
          'Recibo: Paulo de Alexandria, Introductory Matters, cap. 24, 378 d.C.; Fírmico Materno, Mathesis II, 19.2, c. 335 d.C.',
        pergunta: 'Você sabe a hora exata do seu nascimento? Quem poderia te confirmar isso hoje?',
        acao: {
          texto: 'Preencha hora e cidade no Mapa Natal — sem os dois, o Ascendente não é calculado.',
          feature: 'mapa',
        },
        fontes: ['pauloAscendente', 'firmicoFundamento'],
      },
      {
        dia: 4,
        titulo: 'Os quatro cantos do céu',
        leitura:
          'Quatro pontos seguram o mapa: o que sobe a leste, o que desce a oeste, o mais alto do céu e o ponto oposto embaixo. Os gregos chamavam de kentra, os pivôs. Agora o dado que muda sua confiança em qualquer mapa colorido da internet: sobraram cerca de trezentos mapas da Antiguidade, e só trinta e dois trazem o meio do céu. Cúspides intermediárias — aquelas doze linhas que os apps desenham — aparecem em DOIS. Não é que os antigos não soubessem calcular: é que o sistema que eles usavam não precisava delas. ' +
          'Recibo: levantamento de Robert Hand, 2007, sobre os papiros de Oxyrhynchus e o corpus de Neugebauer & van Hoesen.',
        pergunta: 'O que hoje está no ponto mais alto da sua vida, à vista de todo mundo?',
        acao: {
          texto: 'No Mapa Natal, localize o Ascendente e o Meio-do-Céu e veja em que signos eles caem.',
          feature: 'mapa',
        },
        fontes: ['handCuspides'],
      },
      {
        dia: 5,
        titulo: 'As casas tinham nome, e o nome tinha opinião',
        leitura:
          'Hoje se diz "casa 2, dos recursos" e "casa 8, da transformação", tudo neutro e arrumadinho. Os nomes originais não eram nada neutros. A segunda era a Porta do Hades. A quinta, Boa Fortuna; a sexta, Má Fortuna. A oitava, Começo da Morte. A décima primeira, Bom Daimon; a décima segunda, Mau Daimon — daimon era o espírito que acompanha a pessoa, mais ou menos o anjo da guarda deles. Sete dos doze nomes são juízo de valor, não tema. A astrologia moderna apagou essa camada inteira e não avisou ninguém — e o mapa antigo era um mapa moral do céu, não um formulário. ' +
          'Recibo: nomes gregos na nota 56 de F. E. Robbins, Loeb, 1940; nomes latinos em Fírmico Materno, Mathesis II.XVI–XX, séc. IV d.C.',
        pergunta: 'Qual desses nomes antigos te incomodou mais? Por quê?',
        acao: {
          texto: 'Escreva no Diário Cósmico qual dos doze nomes gregos você acha que descreve seu ano.',
          feature: 'diario',
        },
        fontes: ['nomesGregosDosLugares', 'firmicoNomesLatinos'],
      },
      {
        dia: 6,
        titulo: 'Nem todo mundo antigo concordava',
        leitura:
          'Aqui vai a coisa que o mercado esconde e que deixa o assunto mais interessante: os antigos brigavam entre si. Vétio Valente, que representa a prática corrente do século II, usa técnicas que Ptolomeu simplesmente ignora — e Ptolomeu, que é o mais citado hoje, era na verdade um reformador que podou parte da tradição que recebeu. Quando alguém diz "os antigos ensinavam", pergunte qual antigo. Quase sempre a resposta é: um deles, e não necessariamente a maioria. ' +
          'Recibo: Vétio Valente, Antologias, Livro II caps. 4–16, c. 150–175 d.C.',
        pergunta: 'Onde na sua vida você aceitou uma versão única de uma história que tinha mais de um lado?',
        acao: {
          texto: 'Tire uma carta no Tarô e escreva DUAS leituras diferentes dela.',
          feature: 'taro',
        },
        fontes: ['valenteLugares', 'ptolomeuDissidente'],
      },
      {
        dia: 7,
        titulo: 'Qual sistema de casas? A pergunta que quase ninguém faz',
        leitura:
          'Dois mapas do mesmo nascimento podem discordar de casa, e nenhum dos dois está com defeito — eles usam réguas diferentes. Na Antiguidade a régua era simples: o signo onde cai o Ascendente é a casa 1 inteira, o seguinte é a casa 2, e pronto. É o que Paulo de Alexandria descreve, doze vezes, com todas as letras. O sistema que virou padrão hoje é outro, publicado muito depois, e o método nem é do autor cujo nome ele carrega. Saber qual régua seu mapa usa é mais útil que qualquer interpretação. ' +
          'Recibo: Paulo de Alexandria, Introductory Matters, cap. 24, 378 d.C.; publicação do Placidus em 1650, com o método atribuído a Giovanni Antonio Magini (1555–1617).',
        pergunta: 'Depois desta semana, o que você quer conferir com calma no seu mapa?',
        acao: {
          texto: 'Abra o Mapa Natal uma última vez e leia a nota sobre qual sistema de casas ele usa.',
          feature: 'mapa',
        },
        fontes: ['pauloCasasInteiras', 'placidoPublicacao'],
      },
    ],
  },

  {
    id: 'taroVinteDois',
    nome: 'As 22 do Tarô',
    subtitulo: 'As 22 cartas figuradas do tarô — e a idade real de cada história que te contaram sobre elas',
    duracao: 7,
    dias: [
      {
        dia: 1,
        titulo: 'Antes de adivinhar, era jogo',
        leitura:
          'O tarô nasceu como baralho de jogo na Itália do Renascimento — jogo de vaza, o mesmo tipo de jogo de truco ou buraco, em que cada rodada tem um vencedor, com naipes e uma quinta série de cartas que valia mais que todas: os trunfos. São 22, e eles não eram símbolos secretos, eram uma galeria de figuras que qualquer pessoa culta da época reconhecia. A primeira lista completa dos 22, na ordem, aparece num sermão de um pregador dominicano que estava xingando o jogo — ele lista as cartas pra dizer que eram coisa do diabo, e sem querer nos deu o documento. ' +
          'Recibo: Sermão Steele, c. 1470–1500.',
        pergunta: 'Que coisa da sua vida hoje é levada a sério demais e começou como brincadeira?',
        acao: {
          texto: 'Abra o Tarô e olhe os 22 arcanos maiores em ordem, sem tirar carta nenhuma.',
          feature: 'taro',
        },
        fontes: ['sermaoSteele'],
      },
      {
        dia: 2,
        titulo: 'O dia em que o tarô virou egípcio',
        leitura:
          'A história do Egito tem autor, editora e ano. Um erudito francês encontrou o tarô numa reunião social em Paris, decidiu na hora que aquilo era um livro sagrado egípcio salvo do incêndio de Alexandria, e publicou. O detalhe que derruba tudo: ele escreveu isso em 1781, e ninguém no mundo sabia ler hieróglifo naquele momento. A Pedra de Roseta só apareceu em 1799, e Champollion só decifrou a escrita em 1822. Ele afirmou o conteúdo de textos que era literalmente impossível ler. ' +
          'Recibo: Antoine Court de Gébelin, Le Monde primitif, vol. VIII, 1781; Champollion decifra o hieróglifo em 1822.',
        pergunta: 'Qual história que você repete há anos você nunca conferiu na origem?',
        acao: {
          texto: 'No Tarô, escolha uma carta e leia a ficha dela até o fim — inclusive a datação.',
          feature: 'taro',
        },
        fontes: ['gebelinEgito', 'champollionHieroglifo'],
      },
      {
        dia: 3,
        titulo: 'Quem inventou a profissão',
        leitura:
          'Dois anos depois do Egito imaginário, um cabeleireiro e vendedor de sementes parisiense fez algo bem mais concreto: transformou o tarô em método. Significado fixo pra cada carta, significado diferente quando ela sai invertida, posição na mesa que muda a leitura. Em 1789 ele publica o primeiro baralho do mundo desenhado especificamente pra adivinhação — antes disso, todo baralho de tarô era baralho de jogo adaptado. A cartomancia com tarô, como profissão, tem essa idade. ' +
          'Recibo: Jean-Baptiste Alliette, "Etteilla" — primeiro manual com invertidas em 1770, Grand Etteilla em 1789.',
        pergunta: 'O que você faz hoje que alguém precisou inventar do zero num ano específico?',
        acao: {
          texto: 'Tire três cartas no Tarô e repare como a posição de cada uma muda o que ela diz.',
          feature: 'taro',
        },
        fontes: ['etteillaBaralho'],
      },
      {
        dia: 4,
        titulo: 'O truque das três mães',
        leitura:
          'Você já deve ter ouvido que os 22 arcanos correspondem às 22 letras hebraicas, e que isso prova antiguidade. Prova o contrário: a associação é do mesmo volume francês de 1781, feita por outro autor do grupo. O que existe de fato é um texto hebraico que divide as 22 letras em três "mães", sete "duplas" e doze "simples". As três mães são Aleph, Mem e Shin — o Louco, o Enforcado e o Julgamento. Se alguma tabela chamar Beth ou Gimel de mãe, ela está corrompida, e agora você sabe conferir. ' +
          'Recibo: Comte de Mellet, em Le Monde primitif, vol. VIII, 1781; a divisão das letras vem do Sepher Yetzirah.',
        pergunta: 'Onde você já aceitou "é antigo" como se fosse argumento?',
        acao: {
          texto: 'Ache o Louco, o Enforcado e o Julgamento no Tarô e olhe os três lado a lado.',
          feature: 'taro',
        },
        fontes: ['melletLetras', 'sepherYetzirah'],
      },
      {
        dia: 5,
        titulo: 'Os doze signos, em ordem, dentro do baralho',
        leitura:
          'Aqui a coisa fica elegante. Encaixando os 22 trunfos na grade das letras, os doze signos caem em ordem zodiacal perfeita: o Imperador é Áries, o Hierofante é Touro, os Enamorados são Gêmeos, o Carro é Câncer, a Força é Leão, o Eremita é Virgem, a Justiça é Libra, a Morte é Escorpião, a Temperança é Sagitário, o Diabo é Capricórnio, a Estrela é Aquário e a Lua é Peixes. E a famosa troca entre Força e Justiça não foi capricho de Waite: sem ela, Leão e Libra saíam fora de ordem. ' +
          'Recibo: Book T e os Cipher Manuscripts da Golden Dawn, fim do séc. XIX.',
        pergunta: 'Qual dessas doze cartas casa com o seu signo solar? O que você acha do encontro?',
        acao: {
          texto: 'Abra o Tarô na carta do seu signo e compare com o que você leu no seu Mapa Natal.',
          feature: 'taro',
        },
        fontes: ['bookTGoldenDawn'],
      },
      {
        dia: 6,
        titulo: 'O baralho que você conhece tem endereço',
        leitura:
          'Aquelas imagens que todo mundo reconhece — as cenas com pessoas em todas as cartas, inclusive nas numeradas — saíram de um baralho publicado em Londres em dezembro de 1909. A arte é de Pamela Colman Smith, uma ilustradora que passou décadas creditada só pelas iniciais. A estrutura é de A. E. Waite, e o livro que explica tudo saiu em 1911. Quando alguém disser que o desenho tem milênios, você tem a data, a cidade e a editora. ' +
          'Recibo: baralho publicado por William Rider & Son, Londres, dezembro de 1909, arte de Pamela Colman Smith (1878–1951); The Pictorial Key to the Tarot, A. E. Waite, 1911.',
        pergunta: 'Quem fez alguma coisa importante na sua vida e ficou sem crédito?',
        acao: {
          texto: 'Tire uma carta no Tarô e repare em quantas pessoas e objetos cabem no desenho.',
          feature: 'taro',
        },
        fontes: ['baralhoRiderWaiteSmith', 'waitePictorialKey'],
      },
      {
        dia: 7,
        titulo: 'A Cruz Celta não é celta',
        leitura:
          'A tiragem mais famosa do mundo, aquela de dez cartas em cruz com uma coluna do lado, foi batizada de "método antigo celta de adivinhação" pelo próprio Waite, no livro de 1911. De celta ela não tem nada: não existe evidência celta nenhuma, nem atestação anterior à Golden Dawn dos anos 1890. Por que "celta", então? Circula a tese de que o nome veio da onda do renascimento literário irlandês em Londres — é plausível, circula muito, e ninguém achou fonte primária que comprove. Fica como hipótese, não como causa. A tiragem é boa, continua boa, e você pode usá-la à vontade — só que agora sabendo que ela tem a idade da sua bisavó, não a dos druidas. ' +
          'Recibo: A. E. Waite, The Pictorial Key to the Tarot, "An Ancient Celtic Method of Divination", 1911.',
        pergunta: 'Depois desta semana, o que mudou no jeito que você olha para uma carta?',
        acao: {
          texto: 'Faça uma tiragem no Tarô e escreva no Diário Cósmico o que você viu, sem procurar significado pronto.',
          feature: 'taro',
        },
        fontes: ['cruzCeltaWaite'],
      },
    ],
  },

  {
    id: 'ceuDosAntigos',
    nome: 'O Céu dos Antigos',
    subtitulo: 'O que dá pra medir, o que é atribuído — e por que a diferença importa',
    duracao: 7,
    dias: [
      {
        dia: 1,
        titulo: 'Duas camadas, nunca uma só',
        leitura:
          'Tem duas coisas muito diferentes dentro de um mapa astral, e todo app mistura as duas. Uma é conta: onde o Sol estava, em grau, no dia em que você nasceu — dá pra errar e dá pra provar que errou. A outra é o que a cultura foi pendurando em cima disso: "libriano é diplomático". Pode ser bonita e antiga, mas não é do mesmo tipo. Este app separa as duas. Não é frescura de rigor: foi exatamente aqui que ele teve o pior bug da história dele, decidindo signo por tabela de calendário em vez de conta de céu. ' +
          'Recibo: Ptolomeu, Tetrabiblos I.22, séc. II d.C. — os signos começam nos equinócios e solstícios, que são instantes.',
        pergunta: 'Qual coisa que você repete sobre si mesmo é medida, e qual é atribuída?',
        acao: {
          texto: 'Abra o Mapa Natal e repare quais números são calculados e quais textos são interpretação.',
          feature: 'mapa',
        },
        fontes: ['bugSignoSolar'],
      },
      {
        dia: 2,
        titulo: 'A fundação já era um pseudônimo',
        leitura:
          'Esta é a melhor história da pesquisa inteira. Os textos que fundam o mapa natal como sistema circulam sob os nomes de um faraó e de um sacerdote egípcios. Os dois são pseudônimos. Quem escreveu foram autores gregos em Alexandria, por volta de 150 a 120 antes de Cristo, dando pedigree egípcio a um texto que eles estavam escrevendo naquele instante. Ou seja: inventar antiguidade não é a corrupção da tradição — é um traço dela, presente desde o primeiro dia. ' +
          'Recibo: textos atribuídos a Nechepso e Petosiris, pseudônimos usados por autores gregos em Alexandria, 150–120 a.C.',
        pergunta: 'Que autoridade você já emprestou a uma ideia sua pra ela ser levada a sério?',
        acao: {
          texto: 'Escreva no Diário Cósmico uma crença sua e tente lembrar quem foi que te contou.',
          feature: 'diario',
        },
        fontes: ['nechepsoPetosiris'],
      },
      {
        dia: 3,
        titulo: 'A tradição brigava consigo mesma',
        leitura:
          '"Conhecimento milenar" é uma expressão que achata quatro mil anos de gente discordando. Ptolomeu escreve contra práticas babilônicas. Valente usa técnicas que Ptolomeu ignora. E teve quem escrevesse um livro inteiro chamado Contra os Astrólogos — e esse autor é fonte primária tanto quanto os outros. Mostrar a discordância parece fraqueza, mas é o contrário: quer dizer que existe um assunto de verdade ali, com literatura e controvérsia, e não um texto de biscoito. ' +
          'Recibo: Sexto Empírico, Contra os Astrólogos, séc. III.',
        pergunta: 'Em que assunto você mudou de lado depois de ouvir a outra parte?',
        acao: {
          texto: 'Faça um ciclo no Assentar e passe esses minutos com a ideia de que discordar não é defeito.',
          feature: 'aterramento',
        },
        fontes: ['sextoEmpiricoContra', 'ptolomeuDissidente'],
      },
      {
        dia: 4,
        titulo: 'O novo que se veste de velho',
        leitura:
          'Faça o teste com qualquer coisa que te venderem como ancestral: procure a primeira vez que alguém escreveu aquilo. "Superlua" tem 1979 e tem autor. Os nomes das luas cheias — do Lobo, do Morango — vêm de listas publicadas no século XX: a primeira impressa é de 1918, o Maine Farmers\' Almanac publicou as dele nos anos 1930 e o Old Farmer\'s Almanac reduziu tudo a um nome por mês. Essas listas misturam origens algonquianas, inglesas coloniais, celtas e neopagãs, e a avaliação corrente é que a alegação de origem indígena é "parcialmente verdadeira" — nem carimbo de ancestral, nem invenção do nada. Nada disso precisa sair do app; precisa ganhar a data. ' +
          'Recibo: "supermoon" cunhado por Richard Nolle, 1979; primeira lista impressa em Daniel Carter Beard, 1918; listas do Maine Farmers\' Almanac, anos 1930; simplificação do Old Farmer\'s Almanac, séc. XX; avaliação de Patricia Haddock, Mysteries of the Moon, 1992.',
        pergunta: 'Que prática sua tem menos idade do que você imaginava? E ela deixou de servir por isso?',
        acao: {
          texto: 'No Calendário Lunar, veja o nome da próxima lua cheia e lembre de onde ele veio.',
          feature: 'calendarioLunar',
        },
        fontes: [
          'nolleSuperlua',
          'beardPrimeiraLista',
          'almanaqueNomesDaLua',
          'oldFarmersUmNomePorMes',
          'haddockMedley',
        ],
      },
      {
        dia: 5,
        titulo: 'Um terço dos pares não se falam',
        leitura:
          'Compatibilidade em porcentagem não existe em fonte nenhuma — é invenção comercial, do mesmo lote do horóscopo de jornal. O que a tradição tem é melhor e mais duro. Ptolomeu descreve seis tipos de relação entre signos, e uma delas é a aversão: pela definição estrutural, signos a um ou a cinco signos de distância não se enxergam. São 24 pares, quase um terço da tabela. E quando ele aplica isso a duas pessoas, num capítulo mais adiante, a aversão não é indiferença morna: ela cai no mesmo degrau da oposição, o quarto e último de uma escala — "they produce the deepest enmities and lasting contentions", produzem as inimizades mais fundas e as contendas mais duradouras. Nenhum app do mercado mostra isso, porque nota baixa não vende. ' +
          'Recibo: Ptolomeu, Tetrabiblos I.16 (a definição estrutural) e IV.7 (a aplicação em relacionamento, com a escala de quatro degraus), séc. II d.C.',
        pergunta: 'Você conhece alguém com quem a conversa nunca engata — e, olhando de perto, isso é indiferença ou é atrito?',
        acao: {
          texto: 'Escreva no Diário Cósmico o que você acha de uma leitura que não te dá nota boa.',
          feature: 'diario',
        },
        fontes: ['ptolomeuAversao'],
      },
      {
        dia: 6,
        titulo: 'Onde os céus se cruzaram',
        leitura:
          'Se você já ouviu que "seu signo védico é outro" e não entendeu, é o seguinte. Um texto do século II traduziu a astrologia grega para o sânscrito — o nome dele quer dizer, literalmente, "a astrologia dos jônios", dos gregos. Por isso a astrologia indiana tem casas, aspectos e planetas reconhecíveis. A diferença é que ela roda sobre outro zodíaco, que corrige o deslocamento lento do céu. Resultado: o signo que sai num sistema muitas vezes não é o que sai no outro. Nenhum dos dois está errado — são réguas distintas, e o desencontro entre elas é medível. ' +
          'Recibo: Yavanajātaka, tradução do grego para o sânscrito, séc. II d.C.',
        pergunta: 'Onde você e outra pessoa estavam certos ao mesmo tempo, medindo com réguas diferentes?',
        acao: {
          texto: 'Compare no Mapa Natal a posição do seu Sol em graus, não só o nome do signo.',
          feature: 'mapa',
        },
        fontes: ['yavanajataka'],
      },
      {
        dia: 7,
        titulo: 'Até a nossa ressalva tem data',
        leitura:
          'Todo app repete a mesma frase: "não é previsão, é reflexão", "tendências, não determinismos". Essa moldura não nasceu de escrúpulo filosófico — nasceu de defesa criminal. Alan Leo foi processado por adivinhação na Inglaterra em 1914 e de novo em 1917, e a tese da defesa dele era exatamente essa: eu descrevo tendências, não fortunas. Ele perdeu. O mercado inteiro herdou a frase sem saber de onde veio, e este app também. Saber a origem não a torna falsa: ela continua sendo a descrição honesta do que a gente faz aqui. ' +
          'Recibo: processos contra Alan Leo, Inglaterra, 1914 e 1917.',
        pergunta: 'Depois destes sete dias, o que você passou a exigir de qualquer coisa que te digam sobre o céu?',
        acao: {
          texto: 'Tire uma carta no Tarô e leia a datação dela antes de ler o significado.',
          feature: 'taro',
        },
        fontes: ['alanLeoProcesso'],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// 5. MEDALHAS
// ---------------------------------------------------------------------------
// O concorrente Bible Path chama de "Desbravador" quem chega ao dia 15. O nome
// é o produto: ninguém printa "50% concluído".
//
// Regra de escrita das medalhas, e ela é a mesma da linha vermelha: a medalha
// premia o que a pessoa FEZ (leu, voltou, terminou), nunca o que ela virou. Não
// existe "Iluminado", não existe "Curado", não existe "Transformado" — isso
// seria promessa de resultado com carinha de prêmio.
//
// E a armadilha aqui não é lexical, é GRAMATICAL: "Já não foi curiosidade",
// "Você já pede a fonte antes de acreditar" e "Obra, autor e século já são
// reflexo seu" não usam nenhuma palavra proibida e afirmam, as três, o que a
// pessoa virou. Toda legenda é FATO CONTÁVEL: dias, recibos, trilhas.
//
// `marco` é o número de dias concluídos DENTRO de uma trilha.
export const MEDALHAS = [
  {
    id: 'primeiraLuz',
    marco: 1,
    nome: 'Primeira Luz',
    legenda: 'Você abriu a trilha. Dia 1 de 7.',
  },
  {
    id: 'andarilhoDoZodiaco',
    marco: 3,
    nome: 'Andarilho do Zodíaco',
    legenda: 'Três dias seguidos. Você voltou duas vezes depois do primeiro.',
  },
  {
    id: 'guardiaoDaEfemeride',
    marco: 5,
    nome: 'Guardião da Efeméride',
    // A palavra mais técnica do produto é o nome de um prêmio que a pessoa
    // printa. Em vez de fugir dela, a legenda ensina a palavra.
    legenda: 'Cinco dias, cinco recibos lidos — obra, autor e século em cada um. Efeméride é a tabela que diz onde cada planeta estava.',
  },
  {
    id: 'desbravadorDoCeu',
    marco: 7,
    nome: 'Desbravador do Céu',
    legenda: 'Trilha inteira, do primeiro ao sétimo dia.',
  },
];

// Medalhas que não são de uma trilha só — dependem de quantas trilhas
// inteiras a pessoa fechou. `trilhas` é o número exigido.
export const MEDALHAS_JORNADA = [
  {
    id: 'leitorDeFontes',
    trilhas: 2,
    nome: 'Leitor de Fontes',
    legenda: 'Duas trilhas fechadas: catorze dias e catorze recibos.',
  },
  {
    id: 'cartografoDoCeu',
    trilhas: TRILHAS.length,
    nome: 'Cartógrafo do Céu',
    legenda: 'Todas as trilhas concluídas. A Jornada inteira, do começo ao fim.',
  },
];

// ---------------------------------------------------------------------------
// 5.5 IDIOMAS — os packs es/en por cima das tabelas PT
// ---------------------------------------------------------------------------
// O PT é o canônico e mora nas tabelas acima, byte a byte como sempre foi —
// test/jornadaIdiomas.test.js guarda saídas douradas pra provar isso. Os packs
// (lib/traducoes/jornada.<lang>.js) trocam SÓ texto: id, dia, feature, rota e
// fontes vêm sempre das tabelas daqui, então a máquina de progresso e a base
// de recibos são uma só nos três idiomas.
//
// `lang` desconhecido cai em PT de propósito — é o mesmo default do chrome
// (lib/i18n.js) e garante que a chamada antiga, sem argumento, não muda nada.
const PACKS = { es: packEs, en: packEn };

// A forma canônica dos textos, num objeto só — o pack pt é DERIVADO das
// tabelas (nunca uma segunda cópia), e é contra ele que o teste de paridade
// compara as chaves de es/en.
export function packDeTextos(lang = 'pt') {
  if (lang !== 'pt') return PACKS[lang] || null;
  const trilhas = {};
  for (const t of TRILHAS) {
    const dias = {};
    for (const d of t.dias) {
      dias[d.dia] = { titulo: d.titulo, leitura: d.leitura, pergunta: d.pergunta, acao: d.acao.texto };
    }
    trilhas[t.id] = { nome: t.nome, subtitulo: t.subtitulo, dias };
  }
  const medalhas = {};
  for (const m of MEDALHAS) medalhas[m.id] = { nome: m.nome, legenda: m.legenda };
  const medalhasJornada = {};
  for (const m of MEDALHAS_JORNADA) medalhasJornada[m.id] = { nome: m.nome, legenda: m.legenda };
  return { trilhas, medalhas, medalhasJornada };
}

// Memo por idioma: as tabelas são estáticas, então montar uma vez basta. Para
// 'pt' devolve a PRÓPRIA referência de TRILHAS/MEDALHAS — identidade, não
// cópia: é a garantia mais forte de que o caminho PT não passou por refactor.
const _trilhasPorIdioma = {};
const _medalhasPorIdioma = {};
const _medalhasJornadaPorIdioma = {};

export function trilhasParaIdioma(lang = 'pt') {
  const pack = PACKS[lang];
  if (!pack) return TRILHAS;
  if (!_trilhasPorIdioma[lang]) {
    _trilhasPorIdioma[lang] = TRILHAS.map((t) => {
      const pt = pack.trilhas[t.id] || {};
      const dias = pt.dias || {};
      return {
        ...t,
        nome: pt.nome || t.nome,
        subtitulo: pt.subtitulo || t.subtitulo,
        dias: t.dias.map((d) => {
          const pd = dias[d.dia] || {};
          return {
            ...d,
            titulo: pd.titulo || d.titulo,
            leitura: pd.leitura || d.leitura,
            pergunta: pd.pergunta || d.pergunta,
            acao: { ...d.acao, texto: pd.acao || d.acao.texto },
          };
        }),
      };
    });
  }
  return _trilhasPorIdioma[lang];
}

function medalhasComPack(lista, chave, lang) {
  const pack = PACKS[lang];
  if (!pack) return lista;
  const cache = chave === 'medalhas' ? _medalhasPorIdioma : _medalhasJornadaPorIdioma;
  if (!cache[lang]) {
    cache[lang] = lista.map((m) => {
      const pm = (pack[chave] || {})[m.id] || {};
      return { ...m, nome: pm.nome || m.nome, legenda: pm.legenda || m.legenda };
    });
  }
  return cache[lang];
}

export function medalhasParaIdioma(lang = 'pt') {
  return medalhasComPack(MEDALHAS, 'medalhas', lang);
}

export function medalhasJornadaParaIdioma(lang = 'pt') {
  return medalhasComPack(MEDALHAS_JORNADA, 'medalhasJornada', lang);
}

// Medalhas conquistadas com N dias concluídos numa trilha.
export function medalhasPara(diasConcluidos, lang = 'pt') {
  const n = Number.isFinite(diasConcluidos) ? diasConcluidos : 0;
  return medalhasParaIdioma(lang).filter((m) => n >= m.marco);
}

// A próxima medalha a caminho — é o que a UI mostra como "faltam X dias".
// Devolve null quando não há mais nenhuma (a pessoa terminou a trilha).
export function proximaMedalha(diasConcluidos, lang = 'pt') {
  const n = Number.isFinite(diasConcluidos) ? diasConcluidos : 0;
  return medalhasParaIdioma(lang).find((m) => n < m.marco) || null;
}

export function medalhasDaJornada(trilhasConcluidas, lang = 'pt') {
  const n = Number.isFinite(trilhasConcluidas) ? trilhasConcluidas : 0;
  return medalhasJornadaParaIdioma(lang).filter((m) => n >= m.trilhas);
}

// ---------------------------------------------------------------------------
// 6. ACESSO AO CONTEÚDO
// ---------------------------------------------------------------------------
export function trilhaPorId(id, lang = 'pt') {
  return trilhasParaIdioma(lang).find((t) => t.id === id) || null;
}

export function diaDaTrilha(trilhaId, dia, lang = 'pt') {
  const t = trilhaPorId(trilhaId, lang);
  if (!t) return null;
  return t.dias.find((d) => d.dia === dia) || null;
}

// O recibo montado a partir dos ids de DATACOES — é o que a tela mostra
// recolhido embaixo da leitura, e o que permite conferir sem sair do app.
export function fontesDoDia(trilhaId, dia) {
  const d = diaDaTrilha(trilhaId, dia);
  if (!d) return [];
  return d.fontes.map((id) => ({ id, ...DATACOES[id] }));
}

// ---------------------------------------------------------------------------
// 7. PROGRESSO
// ---------------------------------------------------------------------------
// Formato guardado (uma chave só, JSON):
//   { v: 1, trilhas: { <trilhaId>: { diasConcluidos: [1,2], ultimaConclusao: 'YYYY-MM-DD' } } }
//
// `diaAtual` NÃO é guardado: é derivado de diasConcluidos.length + 1. Guardar
// os dois é guardar a mesma informação duas vezes, e dois campos que podem
// discordar acabam discordando — foi assim que apareceu o "concluí o dia 3 e
// ele voltou pro 2" em features parecidas. Um só é a fonte da verdade.
export const VERSAO_ESTADO = 1;

function progressoVazio(trilhaId) {
  const t = trilhaPorId(trilhaId);
  const total = t ? t.duracao : 0;
  return {
    trilhaId,
    diasConcluidos: [],
    diaAtual: total > 0 ? 1 : null,
    ultimaConclusao: null,
    total,
    concluida: false,
  };
}

// Saneamento na LEITURA, não na escrita. Storage é do usuário: pode voltar de
// um backup velho, de uma versão anterior do app, ou de alguém mexendo no
// devtools. Como a regra do produto é que não se pula dia, o conjunto de dias
// concluídos é sempre um prefixo 1..n — então qualquer coisa que chegue é
// reduzida ao maior prefixo contíguo válido. Um estado {1,2,5} vira {1,2}: a
// pessoa não perde o que fez de verdade e o 5 (que não podia existir) some.
export function dataLocalValida(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T12:00:00`);
  return !Number.isNaN(d.getTime()) && localDayStr(d) === s;
}

export function normalizarProgresso(trilhaId, bruto) {
  const base = progressoVazio(trilhaId);
  if (!bruto || typeof bruto !== 'object') return base;

  const lista = Array.isArray(bruto.diasConcluidos) ? bruto.diasConcluidos : [];
  const presentes = new Set(
    lista.map((n) => Number(n)).filter((n) => Number.isInteger(n) && n >= 1 && n <= base.total)
  );

  const prefixo = [];
  for (let d = 1; d <= base.total; d += 1) {
    if (!presentes.has(d)) break;
    prefixo.push(d);
  }

  const concluida = base.total > 0 && prefixo.length === base.total;
  // Round-trip em vez de regex de formato. `/^\d{4}-\d{2}-\d{2}$/` aceitava
  // '2026-13-45': data impossível com formato válido, que nunca é igual ao
  // localDayStr de hoje — e a trava de "um passo por dia" abria sozinha, que é
  // exatamente o que este módulo existe pra impedir. O meio-dia é de propósito:
  // ancora a conversão longe da virada de dia em qualquer fuso.
  const ultima = dataLocalValida(bruto.ultimaConclusao) ? bruto.ultimaConclusao : null;

  return {
    trilhaId,
    diasConcluidos: prefixo,
    diaAtual: concluida ? null : prefixo.length + 1,
    // Sem nenhum dia concluído não existe "última conclusão" — se sobrou data
    // de um estado corrompido, ela é lixo e vai embora junto.
    ultimaConclusao: prefixo.length === 0 ? null : ultima,
    total: base.total,
    concluida,
  };
}

async function lerBruto() {
  // getItemSeguro nunca lança: storage ausente OU storage que estoura na
  // chamada caem os dois no fallback de memória de lib/storage.js. É por isso
  // que aqui não há mais ramo `if (!S)` — ele era inalcançável e o progresso
  // sumia por esse buraco.
  const cru = await getItemSeguro(CHAVE_JORNADA);
  if (!cru) return null;
  try {
    return JSON.parse(cru);
  } catch {
    // JSON corrompido não pode derrubar a tela nem apagar o que ainda dá pra
    // ler — vira estado vazio, e a próxima conclusão reescreve por cima.
    return null;
  }
}

async function gravarBruto(estado) {
  // Devolve false quando só deu pra guardar em memória. A sessão continua
  // certa: o lerBruto seguinte acha o estado, e a medalha não some da tela.
  return setItemSeguro(CHAVE_JORNADA, JSON.stringify(estado));
}

// Estado inteiro, com todas as trilhas normalizadas. É o que a tela de
// listagem usa pra desenhar as barras de progresso de uma vez só. `lang` só
// muda o TEXTO das medalhas devolvidas — o progresso é um só, em qualquer
// idioma (a chave de storage não sabe de idioma, de propósito).
export async function carregarJornada(lang = 'pt') {
  const bruto = await lerBruto();
  const guardadas = (bruto && bruto.trilhas) || {};
  const trilhas = {};
  for (const t of TRILHAS) {
    trilhas[t.id] = normalizarProgresso(t.id, guardadas[t.id]);
  }
  const concluidas = Object.values(trilhas).filter((p) => p.concluida).length;
  return {
    v: VERSAO_ESTADO,
    trilhas,
    trilhasConcluidas: concluidas,
    diasConcluidosTotal: Object.values(trilhas).reduce((s, p) => s + p.diasConcluidos.length, 0),
    medalhasJornada: medalhasDaJornada(concluidas, lang),
  };
}

export async function progressoDaTrilha(trilhaId) {
  const jornada = await carregarJornada();
  return jornada.trilhas[trilhaId] || progressoVazio(trilhaId);
}

// O "passo do dia" do Bible Path: o único dia que a tela abre. Devolve null
// quando a trilha acabou — aí a UI mostra a medalha, não um oitavo dia.
export async function passoDeHoje(trilhaId, lang = 'pt') {
  const p = await progressoDaTrilha(trilhaId);
  if (p.concluida || p.diaAtual === null) return null;
  return diaDaTrilha(trilhaId, p.diaAtual, lang);
}

// ---------------------------------------------------------------------------
// 8. CONCLUIR UM DIA — e as duas travas
// ---------------------------------------------------------------------------
// TRAVA 1, a que o produto exige: não se pula dia. Só o `diaAtual` pode ser
// concluído. Tentar o 5 estando no 3 devolve motivo 'diaAFrente' — não é erro
// de programação, é resposta esperada, então não lança exceção: a tela precisa
// do motivo pra escrever a mensagem certa.
//
// TRAVA 2, a do formato: um passo por dia local. Uma trilha de 7 dias lida em
// vinte minutos não é uma trilha, é uma página de texto — o valor do formato
// está em voltar amanhã. Vem por `umPorDia`, que é TRUE por omissão. O flag
// existe porque quem chama pode ter motivo legítimo pra desligar (QA, uma
// eventual trilha relâmpago), mas o padrão nunca é o permissivo.
//
// `localDayStr` e não toISOString: às 22h no Brasil o dia UTC já é amanhã, e a
// pessoa conseguiria dois passos numa noite só. É o mesmo bug que lib/localDay.js
// documenta pro streak.
export function podeConcluir(progresso, dia, agora = new Date(), opcoes = {}) {
  const { umPorDia = true } = opcoes;
  const d = Number(dia);

  if (!progresso || progresso.total === 0) return { ok: false, motivo: 'trilhaDesconhecida' };
  if (!Number.isInteger(d) || d < 1 || d > progresso.total) return { ok: false, motivo: 'diaInvalido' };
  if (progresso.concluida) return { ok: false, motivo: 'trilhaConcluida' };
  if (progresso.diasConcluidos.includes(d)) return { ok: false, motivo: 'jaConcluido' };
  if (d > progresso.diaAtual) return { ok: false, motivo: 'diaAFrente' };
  if (umPorDia && progresso.ultimaConclusao === localDayStr(agora)) {
    return { ok: false, motivo: 'jaFezHoje' };
  }
  return { ok: true, motivo: null };
}

// Devolve sempre o mesmo formato, com ou sem sucesso:
//   { ok, motivo, progresso, medalhasNovas, medalhasJornadaNovas }
// `medalhasNovas` só traz o que foi conquistado NESTA chamada — é o que
// dispara a animação. Recalcular a lista inteira faria a tela comemorar a
// Primeira Luz de novo no dia 4.
//
// `opcoes.lang` só muda o TEXTO das medalhas devolvidas (a tela as mostra
// direto). A comparação de "o que é novo" é por id, que é igual nos três
// idiomas — trocar de idioma no meio da trilha não re-comemora nada.
export async function concluirDia(trilhaId, dia, agora = new Date(), opcoes = {}) {
  const { lang = 'pt' } = opcoes;
  const bruto = await lerBruto();
  const guardadas = (bruto && bruto.trilhas) || {};
  const antes = normalizarProgresso(trilhaId, guardadas[trilhaId]);

  const veredito = podeConcluir(antes, dia, agora, opcoes);
  if (!veredito.ok) {
    return {
      ok: false,
      motivo: veredito.motivo,
      progresso: antes,
      medalhasNovas: [],
      medalhasJornadaNovas: [],
    };
  }

  const d = Number(dia);
  const depois = normalizarProgresso(trilhaId, {
    diasConcluidos: [...antes.diasConcluidos, d],
    ultimaConclusao: localDayStr(agora),
  });

  const novoEstado = {
    v: VERSAO_ESTADO,
    trilhas: {
      ...guardadas,
      [trilhaId]: {
        diasConcluidos: depois.diasConcluidos,
        ultimaConclusao: depois.ultimaConclusao,
      },
    },
  };
  await gravarBruto(novoEstado);

  const jaTinha = new Set(medalhasPara(antes.diasConcluidos.length).map((m) => m.id));
  const medalhasNovas = medalhasPara(depois.diasConcluidos.length, lang).filter(
    (m) => !jaTinha.has(m.id)
  );

  const contar = (mapa) =>
    TRILHAS.filter((t) => normalizarProgresso(t.id, mapa[t.id]).concluida).length;
  const trilhasAntes = contar(guardadas);
  const trilhasDepois = contar(novoEstado.trilhas);
  const jaTinhaJornada = new Set(medalhasDaJornada(trilhasAntes).map((m) => m.id));
  const medalhasJornadaNovas = medalhasDaJornada(trilhasDepois, lang).filter(
    (m) => !jaTinhaJornada.has(m.id)
  );

  return { ok: true, motivo: null, progresso: depois, medalhasNovas, medalhasJornadaNovas };
}

// Zera UMA trilha e deixa as outras intactas. Existe porque a pessoa que
// terminou vai querer refazer, e porque apagar tudo pra refazer uma é o tipo
// de coisa que faz alguém perder três trilhas por engano.
export async function reiniciarTrilha(trilhaId) {
  const bruto = await lerBruto();
  const guardadas = { ...((bruto && bruto.trilhas) || {}) };
  delete guardadas[trilhaId];
  await gravarBruto({ v: VERSAO_ESTADO, trilhas: guardadas });
  return progressoVazio(trilhaId);
}
