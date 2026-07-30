// lib/zodiacBody.js
// O HOMEM ZODIACAL (homo signorum) — dados da tela de HISTÓRIA da astrologia
// médica medieval/renascentista (iatromatemática).
//
// ===========================================================================
// A LINHA QUE NÃO SE ATRAVESSA — leia antes de editar qualquer string daqui
// ===========================================================================
// Descrever a tradição é seguro. Aplicá-la a uma pessoa é conselho médico.
//
// PERMITIDO: sempre no PASSADO, sempre com a fonte, sempre como registro do
// que alguém escreveu ou fazia. "A tradição medieval associava Áries à
// cabeça." "Culpeper, em 1653, atribuiu esta erva a Vênus." "Médicos até o
// séc. XVII evitavam a sangria na região regida pelo signo da Lua."
//
// PROIBIDO, sem exceção: qualquer frase no imperativo ou no presente que
// oriente o corpo de quem lê. Nada de "cuide de", "evite", "fortaleça",
// "proteja", "atenção com", "é um bom momento para", "seu ponto fraco é".
// Nada de tratamento, erva, suplemento, exercício, dieta, ou momento bom/ruim
// para procedimento. Nada de "seu signo indica tendência a" — isso é
// diagnóstico disfarçado.
//
// TESTE PARA CADA FRASE: se alguém pudesse LER e MUDAR o que faz com o próprio
// corpo por causa dela, ela está errada. Reescreva como registro do que se
// acreditava, ou corte.
//
// Nada nesta tela pode induzir ninguém a adiar um médico de verdade.
//
// test/zodiacBody.test.js checa isso automaticamente: varre TODOS os valores
// `zodiacBody.*` do dicionário nos três idiomas procurando verbo no imperativo
// dirigido ao leitor e vocabulário terapêutico. Quebrar a regra quebra o
// build. É de propósito.
// ===========================================================================
//
// ONDE MORA O TEXTO. O que é traduzível (nome da parte do corpo, glosa,
// notas, história) vive em lib/i18n.js sob o prefixo `zodiacBody.` e é lido
// por chave montada com os helpers signKey/planetKey/historyKey daqui. O que
// NÃO é traduzível vive neste arquivo: o latim verbatim de Manílio, o latim e
// o inglês do Centiloquium, as citações verbatim de Culpeper (inglês de 1653)
// e a bibliografia. Traduzir citação verbatim seria falsificá-la.
//
// O QUE ESTA LISTA É E O QUE NÃO É. As doze correspondências abaixo são as de
// MANÍLIO, Astronomica II.453-465 (séc. I d.C.) — a atestação canônica mais
// antiga em texto contínuo conservado. NÃO são de Ptolomeu: o Tetrabiblos
// III.xvii pressupõe a correspondência mas nunca enumera os doze signos; o que
// ele enumera é a lista PLANETÁRIA (ver PLANET_RULERSHIP). Atribuir a lista
// Áries-cabeça ao Tetrabiblos é erro corrente e o app não o repete.
//
// O QUE FICOU DE FORA, DE PROPÓSITO (acréscimos de ~100 anos apresentados por
// aí como antigos): adrenais, sistema endócrino, sistema linfático/imunológico,
// sistema nervoso, sistema circulatório, pâncreas, chakras, Urano/Netuno/Plutão,
// dieta/suplemento/sal por signo. Nada disso está em Manílio nem em Ptolomeu —
// entra com Heinrich Daath (Medical Astrology, manual n.º 9 da série de Alan
// Leo, 1914 — o livro NÃO é de Alan Leo, ele era o editor da série), Heindel
// (1929) e Cornell (1933). Ver
// MODERN_ADDITIONS: eles aparecem na tela nomeados como o que são, e nunca
// como correspondência válida. Não acrescente correspondência nova aqui sem
// fonte antiga verificada.
import { SIGNS, moonSign } from './signs';

// ---------------------------------------------------------------------------
// As doze correspondências (Manílio, Astronomica II.453-465)
// ---------------------------------------------------------------------------
// `sign` casa byte a byte com SIGNS de lib/signs.js (é assim que a posição da
// Lua e o signo solar da pessoa encontram sua entrada aqui).
// `latin` é verbatim do Latin Library — não editar sem reconferir a fonte.
// `locus` foi RECONTADO em 30/07/2026 contra a numeração impressa da própria
// página (ela marca 450, 455, 460 e 465 na margem): 453 = "Accipe divisas",
// 456 = "exercent. Aries caput…", 460 = "sub Cancro est…", 465 = "…Piscesque
// pedum". As três primeiras entradas vinham com o verso errado por uma a duas
// linhas (Áries dava 454-456, Touro 456-457, Gêmeos 457-459) — herdado da
// pesquisa, que se contradizia com o próprio intervalo geral II.453-465.
// Conferir na margem antes de mexer.
// `lateLayer: true` marca a entrada cuja versão POPULAR ("Leão = coração",
// "Câncer = estômago") é dedução posterior, não o que Manílio escreveu.
export const ZODIAC_BODY = [
  {
    id: 'aries',
    sign: 'Áries',
    emoji: '♈',
    latin: 'Aries caput est ante omnia princeps sortitus',
    locus: 'Astronomica II.456-457',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'touro',
    sign: 'Touro',
    emoji: '♉',
    latin: 'censusque sui pulcherrima colla Taurus',
    locus: 'Astronomica II.457-458',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'gemeos',
    sign: 'Gêmeos',
    emoji: '♊',
    latin: 'et in Geminis aequali bracchia sorte scribuntur conexa umeris',
    locus: 'Astronomica II.458-459',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'cancer',
    sign: 'Câncer',
    emoji: '♋',
    latin: 'pectusque locatum sub Cancro est',
    locus: 'Astronomica II.459-460',
    confidence: 'alta',
    lateLayer: true,
  },
  {
    id: 'leao',
    sign: 'Leão',
    emoji: '♌',
    latin: 'laterum regnum scapulaeque Leonis',
    locus: 'Astronomica II.460',
    confidence: 'alta',
    lateLayer: true,
  },
  {
    id: 'virgem',
    sign: 'Virgem',
    emoji: '♍',
    latin: 'Virginis in propriam descendunt ilia sortem',
    locus: 'Astronomica II.461',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'libra',
    sign: 'Libra',
    emoji: '♎',
    latin: 'Libra regit clunes',
    locus: 'Astronomica II.462',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'escorpiao',
    sign: 'Escorpião',
    emoji: '♏',
    latin: 'et Scorpios inguine gaudet',
    locus: 'Astronomica II.462',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'sagitario',
    sign: 'Sagitário',
    emoji: '♐',
    latin: 'Centauro femina accedunt',
    locus: 'Astronomica II.463',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'capricornio',
    sign: 'Capricórnio',
    emoji: '♑',
    latin: 'Capricornus utrisque imperitat genibus',
    locus: 'Astronomica II.463-464',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'aquario',
    sign: 'Aquário',
    emoji: '♒',
    latin: 'crurum fundentis Aquari arbitrium est',
    locus: 'Astronomica II.464-465',
    confidence: 'alta',
    lateLayer: false,
  },
  {
    id: 'peixes',
    sign: 'Peixes',
    emoji: '♓',
    latin: 'Piscesque pedum sibi iura reposcunt',
    locus: 'Astronomica II.465',
    confidence: 'alta',
    lateLayer: false,
  },
];

// ---------------------------------------------------------------------------
// Regência planetária (Ptolomeu, Tetrabiblos III.xvii, trad. Ashmand)
// ---------------------------------------------------------------------------
// ESTA é a lista que Ptolomeu de fato enumera — e é dela, não do signo de
// Leão, que sai o coração (do SOL); e é dela, não de Câncer, que sai o
// estômago (da LUA). `hasNote` marca os quatro planetas onde a pesquisa
// precisou corrigir uma atribuição corrente.
export const PLANET_RULERSHIP_LOCUS = 'Tetrabiblos III.xvii';
export const PLANET_RULERSHIP = [
  { id: 'saturn', symbol: '♄', hasNote: true },
  { id: 'jupiter', symbol: '♃', hasNote: true },
  { id: 'mars', symbol: '♂', hasNote: true },
  { id: 'sun', symbol: '☉', hasNote: true },
  { id: 'venus', symbol: '♀', hasNote: false },
  { id: 'mercury', symbol: '☿', hasNote: false },
  { id: 'moon', symbol: '☾', hasNote: false },
];

// ---------------------------------------------------------------------------
// Os blocos de história
// ---------------------------------------------------------------------------
// `locus` é a referência bibliográfica (não traduzida, ver cabeçalho).
// O bloco `rule` carrega o aforismo 20 do CENTILOQUIUM nas duas formas em que
// circulou — o latim medieval e a tradução inglesa de Ashmand. A obra é
// PSEUDO-ptolomaica (provavelmente séc. X árabe; primeira tradução latina em
// Barcelona, 1136). Atribuí-la a Ptolomeu, como faz a Wikipédia em inglês, é
// erro — e o texto da tela diz isso com todas as letras.
export const HISTORY_BLOCKS = [
  { id: 'origin', locus: 'Manílio, Astronomica II.453-465' },
  {
    id: 'precursor',
    locus: 'Tábua BM 56605 (British Museum) — John Z. Wee, Journal of Cuneiform Studies 67 (2015), pp. 217-233',
    confidence: 'media',
  },
  {
    id: 'image',
    locus: 'Très Riches Heures du Duc de Berry, fól. 14v, irmãos Limbourg, c. 1411-1416, Musée Condé (Chantilly) MS 65',
  },
  {
    id: 'print',
    locus: 'Le Compost et Kalendrier des Bergiers, Guy Marchant, Paris, 1491; The Kalender of Shepherdes, Paris 1503 e Richard Pynson, Londres 1506',
  },
  {
    id: 'rule',
    locus: 'Pseudo-Ptolomeu, Centiloquium (Karpos / Liber Fructus), aforismo 20',
    // Ordem das últimas palavras conferida em 30/07/2026: as edições correntes
    // trazem "quod illi membro dominatur", não "quod membro illi dominatur".
    latin: 'Membrum ferro ne percutito, cum Luna signum tenuerit, quod illi membro dominatur',
    english: 'Pierce not with iron that part of the body which may be governed by the sign actually occupied by the Moon',
  },
  {
    id: 'instruments',
    locus: 'Wellcome Collection — the enigma of the medieval folding almanac',
  },
  {
    id: 'university',
    locus: 'Cecco d’Ascoli, Bolonha, anos 1320; cátedras em Paris, Pádua, Bolonha e Florença',
  },
  {
    id: 'plague',
    locus: 'Compendium de epidemia, Faculdade de Medicina de Paris, outubro de 1348',
  },
  {
    id: 'exit',
    locus: 'Vesalius, De humani corporis fabrica, 1543; Harvey, De motu cordis, 1628; The Historical Journal (Cambridge), Reassessing the Marginalization of Astrology in the Early Modern World',
  },
  { id: 'afterlife', locus: null },
];

// ---------------------------------------------------------------------------
// Culpeper (1616-1654) — The English Physitian (1652) / The Complete Herbal (1653)
// ---------------------------------------------------------------------------
// Citações verbatim do texto integral (Project Gutenberg 49513), em inglês de
// 1653, sem tradução (ver cabeçalho).
//
// CORTE DELIBERADO: de cada verbete só sobrou a ATRIBUIÇÃO planetária e o
// RACIOCÍNIO. Toda a parte terapêutica ("strengthen the heart exceedingly",
// "remedies the evils choler can inflict", "eradicates all diseases in the
// throat") ficou de fora — nem parafraseada, nem com ressalva. É exatamente o
// tipo de frase que a regra do dono proíbe.
//
// AS RETICÊNCIAS SÃO OBRIGATÓRIAS onde o corte cai no meio da frase de
// Culpeper. Três verbetes (vervain, camomile, angelica) terminavam com PONTO
// numa posição em que o original tem VÍRGULA e continua — o que faz uma frase
// truncada passar por frase inteira. Conferido contra o texto integral
// (Gutenberg 49513) em 30/07/2026: "This is an herb of Venus, and excellent
// for the womb…", "They are under the dominion of the Moon, and being made
// into a poultice…", "…herbs of other planets, and you may happen to do
// wonders." Numa tela que se vende como citação verbatim, apagar o corte é
// pior do que o corte. Se for cortar mais, corte com "...".
export const CULPEPER_QUOTES = {
  // Como ele decidia a regência: um silogismo escolástico sobre o LUGAR onde a
  // planta cresce. Verbete Wormwood.
  method:
    'Wormwood is an herb of Mars, and if Pontanus say otherwise, he is beside the bridge; I prove it thus: What delights in martial places, is a martial herb; but Wormwood delights in martial places (for about forges and iron works you may gather a cart-load of it,) ergo, it is a martial herb.',
  // Ele mesmo diz que está dando um modelo replicável.
  pattern:
    'In this our herb, I shall give the pattern of a ruler, the sons of art rough cast... Whereby, my brethren, the astrologers may know by a penny how a shilling is coined.',
  // O antagonismo Marte/Vênus — puro esquema de qualidades, sem terapêutica.
  antipathy:
    'The greatest antipathy between the planets, is between Mars and Venus: one is hot, the other cold; one diurnal, the other nocturnal; one dry, the other moist; their houses are opposite, one masculine, the other feminine; one public, the other private; one is valiant, the other effeminate; one loves the light, the other hates it; one loves the field, the other sheets.',
  // A cadeia signo → parte do corpo → planeta, na frase dele. O resto da
  // passagem (quinsy, cura por antipatia) foi cortado de propósito.
  chain: 'then the throat is under Venus... Venus rules the throat, (it being under Taurus her sign.)',
  // O panfleto: escrever em inglês contra o monopólio do latim era disputa
  // profissional, não consenso médico de 1653.
  politics:
    'As for the college of physicians, they are too stately to college or too proud to continue.',
};

// Atribuições verbatim — só planeta e signo. A fórmula de abertura no livro é
// sempre a mesma: "_Government and virtues._]".
export const CULPEPER_HERBS = [
  { id: 'rosemary', quote: 'The Sun claims privilege in it, and it is under the celestial Ram.' },
  { id: 'marigold', quote: 'It is an herb of the Sun, and under Leo.' },
  { id: 'woodBetony', quote: 'The herb is appropriated to the planet Jupiter, and the sign Aries.' },
  { id: 'vervain', quote: 'This is an herb of Venus...' },
  { id: 'camomile', quote: 'They are under the dominion of the Moon...' },
  { id: 'bittersweet', quote: 'It is under the planet Mercury, and a notable herb of his also, if it be rightly gathered under his influence.' },
  {
    id: 'angelica',
    // A regência governava até a HORA DA COLHEITA — é a passagem que mostra
    // o quanto o esquema era operacional.
    quote:
      'It is an herb of the Sun in Leo; let it be gathered when he is there, the Moon applying to his good aspect; let it be gathered either in his hour, or in the hour of Jupiter, let Sol be angular; observe the like in gathering the herbs of other planets...',
  },
];

// ---------------------------------------------------------------------------
// O que NÃO é da tradição (aparece na tela nomeado como acréscimo recente)
// ---------------------------------------------------------------------------
export const MODERN_ADDITIONS = [
  'glands',      // adrenais, endócrino, linfático, nervoso, circulatório, pâncreas
  'libraKidneys', // "Libra rege os rins" — Manílio dá as nádegas; Ptolomeu dá os rins a Marte
  'leoHeart',    // "Leão = coração" e "Câncer = estômago" como doutrina antiga
  'outerPlanets', // Urano (1781), Netuno (1846), Plutão (1930)
  'chakras',     // sincretismo do séc. XX (Alice Bailey, 1953)
  'diet',        // dieta/suplemento/óleo/sal de Schuessler (1873) "do seu signo"
  'weakSpot',    // "seu signo mostra seu ponto fraco de saúde"
  'consensus',   // "era medicina consensual e todos acreditavam"
];

// O que a pesquisa procurou e NÃO achou. Fica na tela: dizer que não se achou
// é mais honesto do que completar por dedução — e impede que a próxima pessoa
// a editar preencha a lacuna com a versão que circula por aí.
export const NOT_VERIFIED = [
  'law',        // "a Europa exigia POR LEI consultar a Lua antes de tratar" (a data 1405 nunca tem fonte)
  'hippocrates', // a citação "um médico sem astrologia..." — espúria
  'chauliac',   // a passagem astrológica do Chirurgia Magna (1363) não foi localizada
  'humourMap',  // o mapa fechado planeta↔quatro humores em fonte ANTIGA
];

// Bibliografia — citações neutras, sem tradução (ver cabeçalho).
export const SOURCES = [
  'Manílio, Astronomica II.453-465 (texto latino, The Latin Library)',
  'Ptolomeu, Tetrabiblos III.xvii, III.xvi, I.iv e I.v (trad. J. M. Ashmand)',
  'Pseudo-Ptolomeu, Centiloquium / Liber Fructus, aforismo 20 (latim: Barcelona, 1136)',
  'Nicholas Culpeper, The Complete Herbal, 1653 (texto integral, Project Gutenberg 49513)',
  'John Z. Wee, Discovery of the Zodiac Man in Cuneiform, Journal of Cuneiform Studies 67 (2015), pp. 217-233',
  'Très Riches Heures du Duc de Berry, fól. 14v, c. 1411-1416, Musée Condé (Chantilly) MS 65',
  'Le Compost et Kalendrier des Bergiers, Paris, 1491; The Kalender of Shepherdes, Londres, 1506',
  'Compendium de epidemia, Faculdade de Medicina de Paris, outubro de 1348',
  'Reassessing the Marginalization of Astrology in the Early Modern World, The Historical Journal (Cambridge)',
  'Wellcome Collection, The enigma of the medieval folding almanac',
];

// ---------------------------------------------------------------------------
// Helpers de chave i18n — sempre por template literal, nunca literal solto,
// pra ninguém escrever uma chave à mão e ela divergir do dicionário.
// ---------------------------------------------------------------------------
export function signKey(id, field) {
  return `zodiacBody.sign.${id}.${field}`;
}
export function planetKey(id, field) {
  return `zodiacBody.planet.${id}.${field}`;
}
export function historyKey(id, field) {
  return `zodiacBody.history.${id}.${field}`;
}
export function herbKey(id) {
  return `zodiacBody.culpeper.herb.${id}`;
}
export function modernKey(id) {
  return `zodiacBody.modern.${id}`;
}
export function notVerifiedKey(id) {
  return `zodiacBody.notVerified.${id}`;
}

const BY_SIGN = ZODIAC_BODY.reduce((acc, entry) => {
  acc[entry.sign] = entry;
  return acc;
}, {});

// Entrada pelo nome do signo em português (o mesmo de SIGNS em lib/signs.js) —
// null se não existir, nunca um chute.
export function entryForSign(signName) {
  return BY_SIGN[signName] || null;
}

export function entryById(id) {
  return ZODIAC_BODY.find((e) => e.id === id) || null;
}

// Sanidade: a lista tem que cobrir os doze signos de lib/signs.js, na ordem.
// Se alguém renomear um signo lá e esquecer daqui, isto vira `false` e o teste
// test/zodiacBody.test.js quebra o build (em vez de a tela mostrar buraco).
export function coversAllSigns() {
  return SIGNS.length === ZODIAC_BODY.length && SIGNS.every((s, i) => ZODIAC_BODY[i].sign === s.name);
}

// ---------------------------------------------------------------------------
// A Lua caminhando pelo corpo
// ---------------------------------------------------------------------------
// A Lua percorre os doze signos em ~27,3 dias — cerca de 2,5 dias em cada um.
// Era esse o relógio da prática (o aforismo 20 do Centiloquium): a cada ~2,5
// dias a região "do dia" mudava, e o almanaque dobrável servia pra consultar
// isso de cabeceira. Aqui a posição é ASTRONOMIA REAL (astronomy-engine, via
// moonSign de lib/signs.js) — nada de tabela inventada.
export const MOON_DAYS_PER_SIGN = 2.5;
export const MOON_CYCLE_DAYS = 27.3;

const HOUR_MS = 3600 * 1000;
// A Lua nunca fica mais de ~3 dias no mesmo signo; 80 horas cobre o pior caso
// com folga. Se em 80 horas não mudou, algo está errado e devolvemos null em
// vez de fabricar uma data.
const MAX_LOOKAHEAD_HOURS = 80;

function utcParts(date) {
  const p = (n) => String(n).padStart(2, '0');
  return {
    dateStr: `${date.getUTCFullYear()}-${p(date.getUTCMonth() + 1)}-${p(date.getUTCDate())}`,
    timeStr: `${p(date.getUTCHours())}:${p(date.getUTCMinutes())}`,
  };
}

// moonSign() monta um instante UTC a partir de (dateStr, timeStr) — por isso
// as partes têm que sair de getUTC*, não das locais: passar hora local como se
// fosse UTC desloca o cálculo em até 12 horas, o que perto de uma mudança de
// signo mostra a parte do corpo errada.
export function moonSignAt(date) {
  const { dateStr, timeStr } = utcParts(date);
  return moonSign(dateStr, timeStr);
}

// { sign, entry, nextSign, nextEntry, changesAt, msUntilChange } — ou null se
// astronomy-engine não estiver disponível (mesmo contrato honesto de
// moonSign: nunca fabrica um resultado).
export function moonBodyTransit(now = new Date()) {
  const sign = moonSignAt(now);
  if (!sign) return null;
  const entry = entryForSign(sign.name);
  const base = { sign, entry, nextSign: null, nextEntry: null, changesAt: null, msUntilChange: null };

  // Passo grosso de 1 hora até achar a primeira hora em que o signo mudou...
  let lo = now;
  let hi = null;
  for (let h = 1; h <= MAX_LOOKAHEAD_HOURS; h++) {
    const t = new Date(now.getTime() + h * HOUR_MS);
    const s = moonSignAt(t);
    if (!s) return base;
    if (s.name !== sign.name) {
      lo = new Date(now.getTime() + (h - 1) * HOUR_MS);
      hi = t;
      break;
    }
  }
  if (!hi) return base;

  // ...e bisseção até o minuto. ~7 iterações, cada uma um cálculo O(1).
  while (hi.getTime() - lo.getTime() > 60 * 1000) {
    const mid = new Date(Math.floor((lo.getTime() + hi.getTime()) / 2));
    const s = moonSignAt(mid);
    if (s && s.name === sign.name) lo = mid;
    else hi = mid;
  }

  const nextSign = moonSignAt(hi);
  return {
    sign,
    entry,
    nextSign,
    nextEntry: nextSign ? entryForSign(nextSign.name) : null,
    changesAt: hi,
    msUntilChange: hi.getTime() - now.getTime(),
  };
}
