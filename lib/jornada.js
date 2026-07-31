// lib/jornada.js
// A JORNADA GUIADA — trilhas de 7 dias com progresso visível.
//
// TODO(i18n): TODA string de conteúdo deste arquivo está em português, de
// propósito. lib/i18n.js está sendo editado por outro time agora e não pode
// receber chaves novas nesta leva. Quando reabrir: mover `titulo`, `leitura`,
// `pergunta`, `acao.texto`, `nome`/`legenda` das medalhas e os rótulos de
// FEATURES para o dicionário sob o prefixo `jornada.`, mantendo os `id` como
// segmento de chave (todos em camelCase, sem hífen — chave com hífen escapa da
// varredura estática de test/i18nKeysExist.test.js). O que NÃO se traduz e fica
// aqui: DATACOES (obra, autor, século) e os verbatins latinos — traduzir
// citação é falsificá-la, mesma regra de lib/zodiacBody.js e lib/grounding.js.
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

// ---------------------------------------------------------------------------
// 1. PERSISTÊNCIA
// ---------------------------------------------------------------------------
// Require preguiçoso dentro de try/catch — cópia literal do getStorage de
// lib/cosmicSound.js. O motivo é o mesmo: o módulo resolve em Node (então um
// import estático não quebra o teste) mas estoura "window is not defined" em
// runtime fora do app. Com o require preguiçoso, ambiente sem AsyncStorage
// simplesmente degrada para memória em vez de derrubar a tela.
let _Storage;

function getStorage() {
  if (_Storage !== undefined) return _Storage;
  try {
    const mod = require('@react-native-async-storage/async-storage');
    _Storage = (mod && (mod.default || mod)) || null;
  } catch {
    _Storage = null;
  }
  return _Storage;
}

export const CHAVE_JORNADA = 'cosmic-jornada-v1';

// Fallback de sessão, usado SÓ quando não há AsyncStorage. Não é cache do
// storage real: se o storage existe, toda leitura vai nele. Cache por cima de
// storage presente é como nascem os bugs de "concluí e sumiu quando voltei" —
// o valor certo estava no disco e o errado, na memória.
let _memoria = null;

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
export const FEATURES = {
  taro: { rotulo: 'Tarô', rota: ROUTES.TAROT_MAIN },
  mapa: { rotulo: 'Mapa Natal', rota: ROUTES.BIRTH_CHART },
  calendarioLunar: { rotulo: 'Calendário Lunar', rota: ROUTES.LUNAR_CALENDAR },
  som: { rotulo: 'Som do Céu', rota: null },
  aterramento: { rotulo: 'Assentar', rota: ROUTES.GROUNDING },
  diario: { rotulo: 'Diário Cósmico', rota: ROUTES.DIARY },
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
    provas: ['An Ancient Celtic Method of Divination', 'Waite', '1911'],
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
          'Se você guardar uma frase só desta trilha, guarde esta: o que você quer que cresça, faça na Lua crescente; o que você quer que seque ou diminua, faça na minguante. É a coisa que sua avó falava, e ela tem versão em latim escrita muito antes: omnia quae seruntur crescente luna — tudo que se semeia deve ser semeado com a lua crescendo. Uma regra só, aplicada ao ano inteiro da roça. ' +
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
          'Lua Cheia parece cheia por umas três noites seguidas, mas cheia mesmo ela é num instante só — o momento em que fica a 180 graus do Sol. Por isso almanaque discorda de app: um rotula por fatia, o outro pelo instante. E vai uma surpresa: na cheia, a fonte romana manda SEMEAR favas, não colher. Colher para guardar é a minguante. De quebra, dois nomes que soam antigos e não são: os nomes das luas cheias saíram de um almanaque dos anos 1930, e "superlua" foi cunhada em 1979. ' +
          'Recibo: Columela, De Re Rustica XI.2.85, séc. I d.C.; nomes das luas no Maine Farmers\' Almanac, anos 1930; "superlua" por Richard Nolle, 1979.',
        pergunta: 'O que na sua vida parece estar no auge, mas você sabe que ainda está sendo semeado?',
        acao: {
          texto: 'Deixe o Som do Céu tocando por três minutos enquanto relê o parágrafo de hoje.',
          feature: 'som',
        },
        fontes: ['columelaFavas', 'almanaqueNomesDaLua', 'nolleSuperlua'],
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
          'O fim do mês lunar era a temporada dos trabalhos pesados e sem plateia: cortar madeira, espalhar esterco, capinar. Plínio dá a janela com precisão de artesão — entre o vigésimo e o trigésimo dia da Lua, e o ponto ótimo é o interlunium, a lua escura. Columela repete a mesma faixa. Nada disso é bonito de postar, e é exatamente por isso que sobreviveu: era trabalho que dava resultado material, e por isso alguém anotou. ' +
          'Recibo: Plínio, o Velho, Naturalis Historia XVI.190–191, séc. I d.C.; Columela, De Re Rustica XI.2.11, séc. I d.C.',
        pergunta: 'Qual é o seu trabalho de lua escura — aquele que ninguém vê e que sustenta o resto?',
        acao: {
          texto: 'Faça um ciclo de respiração no Assentar antes de fechar o app hoje.',
          feature: 'aterramento',
        },
        fontes: ['plinioMadeira', 'columelaMadeira'],
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
          'O Sol leva um mês pra atravessar um signo. A Lua leva dois dias e meio. Isso muda tudo na hora de ler um mapa: a Lua é a peça que mais depende de saber a hora certa, e é a que mais separa dois irmãos nascidos na mesma semana. Um detalhe bonito dos gregos: eles chamavam o terceiro lugar do mapa de "a Deusa", que era a Lua, e o nono de "o Deus", que era o Sol. Os dois luminares tinham cada um a sua casa preferida, e daí veio parte dos nomes que a gente usa até hoje. ' +
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
          'Quatro pontos seguram o mapa: o que sobe a leste, o que desce a oeste, o mais alto do céu e o ponto oposto embaixo. Os gregos chamavam de kentra. Agora o dado que muda sua confiança em qualquer mapa colorido da internet: sobraram cerca de trezentos mapas da Antiguidade, e só trinta e dois trazem o meio do céu. Cúspides intermediárias — aquelas doze linhas que os apps desenham — aparecem em DOIS. Não é que os antigos não soubessem calcular: é que o sistema que eles usavam não precisava delas. ' +
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
          'Hoje se diz "casa 2, dos recursos" e "casa 8, da transformação", tudo neutro e arrumadinho. Os nomes originais não eram nada neutros. A segunda era a Porta do Hades. A quinta, Boa Fortuna; a sexta, Má Fortuna. A oitava, Começo da Morte. A décima primeira, Bom Daimon; a décima segunda, Mau Daimon. Sete dos doze nomes são juízo de valor, não tema. A astrologia moderna apagou essa camada inteira e não avisou ninguém — e o mapa antigo era um mapa moral do céu, não um formulário. ' +
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
    subtitulo: 'Os arcanos maiores, com a idade real: 1781 e 1911, não o Egito',
    duracao: 7,
    dias: [
      {
        dia: 1,
        titulo: 'Antes de adivinhar, era jogo',
        leitura:
          'O tarô nasceu como baralho de jogo na Itália do Renascimento — jogo de vaza, com naipes e uma quinta série de cartas que valia mais que todas: os trunfos. São 22, e eles não eram símbolos secretos, eram uma galeria alegórica que qualquer pessoa culta da época reconhecia. A primeira lista completa dos 22, na ordem, aparece num sermão de um pregador dominicano que estava xingando o jogo — ele lista as cartas pra dizer que eram coisa do diabo, e sem querer nos deu o documento. ' +
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
        titulo: 'Três mães, sete duplas, doze simples',
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
          'A tiragem mais famosa do mundo, aquela de dez cartas em cruz com uma coluna do lado, foi batizada de "método antigo celta de adivinhação" pelo próprio Waite, no livro de 1911. Não tem nada de celta: era a moda do renascimento literário irlandês na Londres daquela época, e o nome pegou. A tiragem é boa, continua boa, e você pode usá-la à vontade — só que agora sabendo que ela tem a idade da sua bisavó, não a dos druidas. Isso é mais interessante que o mito, e tem a vantagem de ser verdade. ' +
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
          'Existe uma diferença de natureza entre "o Sol estava a 209,98 graus de longitude naquele dia" e "libriano é diplomático". A primeira frase pode estar errada, e dá pra provar que está. A segunda é atribuição cultural: pode ser útil, bonita e antiga, mas não é do mesmo tipo. Todo app de astrologia mistura as duas e apresenta como se fossem uma coisa só. Este separa. Não é frescura de rigor: foi exatamente aqui que este app teve o pior bug da história dele, decidindo signo por tabela de calendário em vez de conta de céu. ' +
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
          'Faça o teste com qualquer coisa que te venderem como ancestral: procure a primeira vez que alguém escreveu aquilo. "Superlua" tem 1979 e tem autor. Os nomes das luas cheias — do Lobo, do Morango — saíram de um almanaque de fazendeiros dos anos 1930, não de tradição indígena milenar. As oito fases como ciclo psicológico são do século passado. Nada disso precisa sair do app; precisa ganhar a data. "Este baralho é de 1911" é informação, não é ressalva envergonhada. ' +
          'Recibo: "supermoon" cunhado por Richard Nolle, 1979; nomes das luas no Maine Farmers\' Almanac, anos 1930.',
        pergunta: 'Que prática sua tem menos idade do que você imaginava? E ela deixou de servir por isso?',
        acao: {
          texto: 'No Calendário Lunar, veja o nome da próxima lua cheia e lembre de onde ele veio.',
          feature: 'calendarioLunar',
        },
        fontes: ['nolleSuperlua', 'almanaqueNomesDaLua'],
      },
      {
        dia: 5,
        titulo: 'Um terço dos pares não se falam',
        leitura:
          'Compatibilidade em porcentagem não existe em fonte nenhuma — é invenção comercial, do mesmo lote do horóscopo de jornal. O que a tradição tem é melhor e mais duro. Ptolomeu descreve seis tipos de relação entre signos, e uma delas é a aversão: signos a um ou a cinco signos de distância, que simplesmente não se enxergam. São 24 pares, quase um terço da tabela. Nenhum app do mercado mostra isso, porque nota baixa não vende — e é justamente a parte que muita gente já desconfiava sozinha. ' +
          'Recibo: Ptolomeu, Tetrabiblos I.16 (a definição) e IV.7 (a aplicação em relacionamento), séc. II d.C.',
        pergunta: 'Você conhece alguém com quem simplesmente não há conversa — sem culpa de ninguém?',
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
          'Se você já ouviu que "seu signo védico é outro" e não entendeu, é o seguinte. Um texto do século II traduziu a astrologia grega para o sânscrito — o nome dele quer dizer, literalmente, "a astrologia dos jônios", dos gregos. Por isso a astrologia indiana tem casas, aspectos e planetas reconhecíveis. A diferença é que ela roda sobre outro zodíaco, que corrige o deslocamento lento do céu. Resultado: pra maioria das pessoas os dois sistemas dão signos diferentes. Nenhum dos dois está errado — são réguas distintas, e o desencontro entre elas é medível. ' +
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
// `marco` é o número de dias concluídos DENTRO de uma trilha.
export const MEDALHAS = [
  {
    id: 'primeiraLuz',
    marco: 1,
    nome: 'Primeira Luz',
    legenda: 'Você abriu a trilha. O primeiro dia é o que menos gente faz.',
  },
  {
    id: 'andarilhoDoZodiaco',
    marco: 3,
    nome: 'Andarilho do Zodíaco',
    legenda: 'Três dias seguidos de caminho. Já não foi curiosidade.',
  },
  {
    id: 'guardiaoDaEfemeride',
    marco: 5,
    nome: 'Guardião da Efeméride',
    legenda: 'Cinco dias. Você já pede a fonte antes de acreditar.',
  },
  {
    id: 'desbravadorDoCeu',
    marco: 7,
    nome: 'Desbravador do Céu',
    legenda: 'Trilha inteira, do primeiro ao sétimo dia. Poucos chegam aqui.',
  },
];

// Medalhas que não são de uma trilha só — dependem de quantas trilhas
// inteiras a pessoa fechou. `trilhas` é o número exigido.
export const MEDALHAS_JORNADA = [
  {
    id: 'leitorDeFontes',
    trilhas: 2,
    nome: 'Leitor de Fontes',
    legenda: 'Duas trilhas fechadas. Obra, autor e século já são reflexo seu.',
  },
  {
    id: 'cartografoDoCeu',
    trilhas: TRILHAS.length,
    nome: 'Cartógrafo do Céu',
    legenda: 'Todas as trilhas concluídas. A Jornada inteira, do começo ao fim.',
  },
];

// Medalhas conquistadas com N dias concluídos numa trilha.
export function medalhasPara(diasConcluidos) {
  const n = Number.isFinite(diasConcluidos) ? diasConcluidos : 0;
  return MEDALHAS.filter((m) => n >= m.marco);
}

// A próxima medalha a caminho — é o que a UI mostra como "faltam X dias".
// Devolve null quando não há mais nenhuma (a pessoa terminou a trilha).
export function proximaMedalha(diasConcluidos) {
  const n = Number.isFinite(diasConcluidos) ? diasConcluidos : 0;
  return MEDALHAS.find((m) => n < m.marco) || null;
}

export function medalhasDaJornada(trilhasConcluidas) {
  const n = Number.isFinite(trilhasConcluidas) ? trilhasConcluidas : 0;
  return MEDALHAS_JORNADA.filter((m) => n >= m.trilhas);
}

// ---------------------------------------------------------------------------
// 6. ACESSO AO CONTEÚDO
// ---------------------------------------------------------------------------
export function trilhaPorId(id) {
  return TRILHAS.find((t) => t.id === id) || null;
}

export function diaDaTrilha(trilhaId, dia) {
  const t = trilhaPorId(trilhaId);
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
  const ultima =
    typeof bruto.ultimaConclusao === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(bruto.ultimaConclusao)
      ? bruto.ultimaConclusao
      : null;

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
  const S = getStorage();
  if (!S) return _memoria;
  try {
    const cru = await S.getItem(CHAVE_JORNADA);
    if (!cru) return null;
    return JSON.parse(cru);
  } catch {
    // JSON corrompido não pode derrubar a tela nem apagar o que ainda dá pra
    // ler — vira estado vazio, e a próxima conclusão reescreve por cima.
    return null;
  }
}

async function gravarBruto(estado) {
  const S = getStorage();
  if (!S) {
    _memoria = estado;
    return;
  }
  try {
    await S.setItem(CHAVE_JORNADA, JSON.stringify(estado));
  } catch {}
}

// Estado inteiro, com todas as trilhas normalizadas. É o que a tela de
// listagem usa pra desenhar as barras de progresso de uma vez só.
export async function carregarJornada() {
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
    medalhasJornada: medalhasDaJornada(concluidas),
  };
}

export async function progressoDaTrilha(trilhaId) {
  const jornada = await carregarJornada();
  return jornada.trilhas[trilhaId] || progressoVazio(trilhaId);
}

// O "passo do dia" do Bible Path: o único dia que a tela abre. Devolve null
// quando a trilha acabou — aí a UI mostra a medalha, não um oitavo dia.
export async function passoDeHoje(trilhaId) {
  const p = await progressoDaTrilha(trilhaId);
  if (p.concluida || p.diaAtual === null) return null;
  return diaDaTrilha(trilhaId, p.diaAtual);
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
export async function concluirDia(trilhaId, dia, agora = new Date(), opcoes = {}) {
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
  const medalhasNovas = medalhasPara(depois.diasConcluidos.length).filter((m) => !jaTinha.has(m.id));

  const contar = (mapa) =>
    TRILHAS.filter((t) => normalizarProgresso(t.id, mapa[t.id]).concluida).length;
  const trilhasAntes = contar(guardadas);
  const trilhasDepois = contar(novoEstado.trilhas);
  const jaTinhaJornada = new Set(medalhasDaJornada(trilhasAntes).map((m) => m.id));
  const medalhasJornadaNovas = medalhasDaJornada(trilhasDepois).filter(
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
