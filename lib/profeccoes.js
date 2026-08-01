// lib/profeccoes.js
// PROFECÇÕES ANUAIS E MENSAIS — a técnica preditiva mais bem documentada da
// tradição helenística, e que praticamente nenhum app popular tem.
//
// ===========================================================================
// O QUE ELA É, EM TRÊS LINHAS
// ===========================================================================
// A cada ano de vida, o ponto de partida do mapa "anda" um signo. Idade 0 está
// na casa 1, idade 1 na casa 2, idade 12 de volta à casa 1. O signo onde a
// contagem para é a CASA DO ANO; o planeta que rege esse signo é o SENHOR DO
// ANO (dominus anni). A conta inteira é `casa = (idade % 12) + 1`.
//
// FONTE PRIMÁRIA: Ptolomeu, Tetrabiblos IV.10, "Of the Division of Times"
// (trad. F. E. Robbins, Loeb, 1940) — verbatim guardado nos packs, em inglês,
// sem tradução, igual ao padrão de lib/synastry.js:
//
//   "setting out from each of the prorogatory places, in the order of the
//    signs, the number of years from birth, one year to each sign […] taking
//    the ruler of the last sign."
//
// O MESMO capítulo dá a camada mensal, e quase ninguém cita:
//
//   "We shall do the same thing for the months […] starting from the places
//    that govern the year, twenty-eight days to a sign"
//
// 28 dias por signo × 12 = 336 dias; sobra um resto de ~29 dias no fim do ano,
// e é por isso que um ano profectado tem TREZE mudanças de signo mensal, não
// doze. O esquema é fractal e fecha sozinho: 2⅓ dias × 12 = 28 dias (a camada
// diária, que este módulo não implementa).
//
// Toda a pesquisa está em docs/tradicao/13-tecnicas-preditivas.md §7 e §13.3.
// As doze casas vêm de docs/tradicao/12-as-doze-casas.md §5, os sete planetas
// de docs/tradicao/11-planetas-em-profundidade.md §3, e a tabela de domicílios
// de docs/tradicao/01-astrologia-fundamentos.md §2.6.
//
// ===========================================================================
// AS CINCO DECISÕES QUE ESTE ARQUIVO TOMA, E POR QUÊ
// ===========================================================================
//
// 1. A IDADE SAI DO RETORNO SOLAR, NÃO DA DIFERENÇA DE DATAS.
//    Medido na base (doc 13 §7.4): o ano profectado vira quando o Sol volta ao
//    grau natal, e esse instante desliza ~5,8h por ano — em ano pré-bissexto
//    ele cai UM DIA ANTES do aniversário do calendário. Um app que perguntasse
//    "já fez aniversário este ano?" erraria o Senhor do Ano justamente nas
//    vésperas, que é quando a pessoa mais olha. Aqui a virada é achada por
//    Newton sobre a longitude eclíptica do Sol (2–3 iterações, custo nenhum).
//
// 2. SEM HORA/CIDADE, A CONTAGEM SAI DO SOL — E ISSO TEM FONTE PRIMÁRIA.
//    A profecção do Ascendente exige hora + cidade, e getAnyBirthData()
//    devolve os dois como opcionais. A saída NÃO é um modo degradado
//    inventado: Ptolomeu IV.10 manda profeccionar a partir de CADA um dos
//    lugares prorrogativos e nomeia cinco — Ascendente, Lote da Fortuna, Lua,
//    Sol e Meio-do-Céu —, dizendo o que cada um cobre. O do Sol cobre
//    "dignities and glory". Como o app conhece o signo solar de TODO usuário,
//    a feature existe para todo mundo, rotulada, com a citação junto. E o
//    resultado carrega `melhoraCom`, dizendo o que falta e onde preencher —
//    nunca beco sem saída.
//
// 3. CASAS INTEIRAS, PORQUE A TÉCNICA PRESSUPÕE EXATAMENTE ISSO.
//    Casa 1 = o signo inteiro do ponto de partida. É o que lib/signs.js já faz
//    em `houses()`. Num app Placidus a técnica ficaria conceitualmente torta.
//    Coincidência favorável rara — e por isso este módulo NÃO chama `houses()`:
//    ele só precisa do signo de partida e faz a roda com aritmética modular,
//    o que também o deixa funcionar no caminho solar (onde não há casas).
//
// 4. A TABELA DE DOMICÍLIOS MORA AQUI, E É A DE PTOLOMEU I.17.
//    ⚠️ O FALSO AMIGO Nº 1 DO REPOSITÓRIO: `lib/grounding.js` exporta
//    `REGENTES`, mas são os regentes do DIA DA SEMANA (ordem caldaica —
//    segunda = Lua, terça = Marte). Reaproveitar aquela tabela aqui daria
//    Senhor do Ano errado em todos os casos. A tabela certa é a de domicílio,
//    e ela bate byte a byte com `DOMICILIO_POR_SIGNO` de lib/dailyHoroscope.js
//    — o teste confere as duas uma contra a outra para nunca divergirem.
//
// 5. NUNCA FABRICAR CÉU. Sem efeméride carregada, sem data, com data inválida
//    ou com "hoje" anterior ao nascimento, a função devolve
//    `{ disponivel: false, motivo, texto }` e o texto diz o que fazer. Não
//    existe caminho em que este módulo chute uma virada de ano.
//
// ===========================================================================
// TRÊS IDIOMAS DESDE O NASCIMENTO
// ===========================================================================
// Todo texto vive em lib/traducoes/profeccoes.{pt,es,en}.js, na MESMA forma.
// O motor recebe `lang` com default 'pt' em toda função que devolve texto; a
// tela passa o idioma que já tem do useLanguage(). test/profeccoes.test.js
// guarda o golden do PT (byte a byte) e prova a paridade de chaves e de
// placeholders nos três.
//
// MÓDULO PURO: nada de AsyncStorage aqui (se um dia precisar, é via
// lib/storage.js — nunca require direto). Sem rede, sem estado, determinístico.
import { ascendantSign, signoFromDate, SIGNS } from './signs';
import { resolveOffsetHours } from './timezone';
import PACK_PT from './traducoes/profeccoes.pt';
import PACK_ES from './traducoes/profeccoes.es';
import PACK_EN from './traducoes/profeccoes.en';

const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };

// Idioma desconhecido cai no PT — nunca numa tradução inventada na hora.
function packDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// ---------------------------------------------------------------------------
// A RODA — ordem canônica dos signos, a mesma de lib/signs.js
// ---------------------------------------------------------------------------
export const ORDEM_SIGNOS = SIGNS.map((s) => s.name);

// Domicílios — Ptolomeu, Tetrabiblos I.17 (doc 01 §2.6). Só os sete clássicos:
// Urano, Netuno e Plutão são de 1781, 1846 e 1930, e as regências modernas
// atribuídas a eles não têm autor nem data localizados. Um Senhor do Ano
// pendurado num planeta que Ptolomeu não via não seria a técnica dele.
//
// Os valores são IDS canônicos, não nomes de tela — o nome sai do pack.
export const DOMICILIO_POR_SIGNO = {
  'Áries': 'marte',
  'Touro': 'venus',
  'Gêmeos': 'mercurio',
  'Câncer': 'lua',
  'Leão': 'sol',
  'Virgem': 'mercurio',
  'Libra': 'venus',
  'Escorpião': 'marte',
  'Sagitário': 'jupiter',
  'Capricórnio': 'saturno',
  'Aquário': 'saturno',
  'Peixes': 'jupiter',
};

export const PTOLOMEU_DOMICILIO_LOCUS = 'Ptolomeu, Tetrabiblos I.17';
export const PTOLOMEU_PROFECCAO_LOCUS = 'Ptolomeu, Tetrabiblos IV.10';

// Ptolomeu IV.10 dá 28 dias por signo para a camada mensal. Não é "um mês
// civil": 28 × 12 = 336, e o resto do ano tropical produz a décima terceira
// mudança. Ver o cabeçalho.
export const DIAS_POR_SIGNO_MENSAL = 28;

const DIA_MS = 86400000;
const ANO_TROPICO_MS = 365.242190 * DIA_MS;

// Verbatim de Robbins — idêntico nos três packs, em inglês, sem tradução.
export const VERBATIM = PACK_PT.verbatim;
export const NAO_ACHADO = PACK_PT.naoAchado;
export const FONTES = PACK_PT.fontes;
export const BASE = PACK_PT.base;

// ---------------------------------------------------------------------------
// Preenchimento de molde — mesmo helper de lib/mitos.js. Placeholder ausente
// fica como está, para o teste de paridade poder flagrá-lo.
// ---------------------------------------------------------------------------
export function preencher(molde, vars = {}) {
  if (typeof molde !== 'string') return '';
  return molde.replace(/\{(\w+)\}/g, (m, chave) =>
    Object.prototype.hasOwnProperty.call(vars, chave) ? String(vars[chave]) : m
  );
}

// ---------------------------------------------------------------------------
// Efeméride — o mesmo require protegido de lib/signs.js, para o Metro não
// quebrar se o pacote não resolver. Sem ela NÃO se calcula nada: é a lei de
// nunca fabricar céu.
// ---------------------------------------------------------------------------
let _Astronomy = null;
function getAstronomy() {
  if (_Astronomy) return _Astronomy;
  try {
    _Astronomy = require('astronomy-engine');
  } catch {
    _Astronomy = false;
  }
  return _Astronomy;
}

function dataValida(dateStr) {
  if (typeof dateStr !== 'string') return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
  if (!m) return false;
  const ano = +m[1];
  const mes = +m[2];
  const dia = +m[3];
  const d = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  return d.getUTCFullYear() === ano && d.getUTCMonth() + 1 === mes && d.getUTCDate() === dia;
}

// Aceita o que as telas têm na mão, sem obrigar ninguém a montar objeto novo:
//   '1990-03-14'                       só a data (o caminho solar)
//   { date, time, city }               exatamente o que getAnyBirthData devolve
// Nunca fabrica: o que não vier fica null.
export function normalizarNascimento(nascimento) {
  if (!nascimento) return null;
  if (typeof nascimento === 'string') return { date: nascimento, time: null, city: null };
  if (typeof nascimento === 'object' && typeof nascimento.date === 'string') {
    return {
      date: nascimento.date,
      time: nascimento.time || null,
      city: nascimento.city || null,
    };
  }
  return null;
}

function coordenadasDe(city) {
  if (!city || typeof city !== 'object') return null;
  const lat = typeof city.lat === 'number' ? city.lat : city.latitude;
  const lon = typeof city.lon === 'number' ? city.lon : city.longitude;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  return { lat, lon };
}

// Hora de PAREDE → instante UTC. É a mesma conversão de instanteUtcMs() em
// lib/signs.js, replicada aqui porque lá ela é privada. Sem `city`, a hora é
// lida como UTC (convenção histórica do app); sem `time`, meio-dia — o palpite
// que menos erra dentro do dia, o mesmo que signoFromDate usa.
function instanteUtcMs(dateStr, timeStr, city) {
  const hora = timeStr || '12:00';
  const base = new Date(`${dateStr}T${hora}:00Z`).getTime();
  if (Number.isNaN(base)) return NaN;
  if (!city) return base;
  const offset = resolveOffsetHours(city, dateStr, hora);
  if (typeof offset !== 'number' || Number.isNaN(offset)) return base;
  return base - offset * 3600 * 1000;
}

// ---------------------------------------------------------------------------
// O PONTO DE PARTIDA (o "lugar prorrogativo")
// ---------------------------------------------------------------------------
// Com hora + cidade → o Ascendente, a forma canônica.
// Só com data → o Sol, que Ptolomeu nomeia no mesmo capítulo e liga às
// "dignities and glory". Devolve também o que falta, para a tela nunca deixar
// a pessoa num beco sem saída.
export function pontoDePartida(nascimento) {
  const n = normalizarNascimento(nascimento);
  if (!n) return null;
  if (!dataValida(n.date)) return null;

  const coords = coordenadasDe(n.city);
  if (n.time && coords) {
    const asc = ascendantSign(n.date, n.time, coords.lat, coords.lon, n.city);
    if (asc && asc.name) return { origem: 'ascendente', signo: asc.name, falta: [] };
  }

  const solo = signoFromDate(n.date, n.time || undefined, n.city || undefined);
  if (!solo) return null;

  const falta = [];
  if (!n.time) falta.push('hora');
  if (!coords) falta.push('cidade');
  return { origem: 'sol', signo: solo, falta };
}

// ---------------------------------------------------------------------------
// RETORNO SOLAR — a virada do ano profectado
// ---------------------------------------------------------------------------
function longitudeDoSol(A, ms) {
  // Mesmo referencial de signoFromDate: eclíptica APARENTE da data. Duas
  // definições de "onde o Sol está" dentro do mesmo app seria pior que uma
  // errada consistente.
  const sol = A.Ecliptic(A.GeoVector(A.Body.Sun, new Date(ms), true));
  return ((sol.elon % 360) + 360) % 360;
}

// Diferença angular em (-180, 180] — sem isso o cruzamento de 0°/360° faria a
// bisseção pular um ano inteiro.
function difAngular(a, b) {
  let d = (a - b) % 360;
  if (d > 180) d -= 360;
  if (d <= -180) d += 360;
  return d;
}

// Instante do n-ésimo retorno do Sol ao grau natal. Newton com derivada local
// (o Sol anda 0,953 a 1,020 °/dia, então a derivada não pode ser constante).
// Converge em 2–3 passos; o teto de 12 existe só para nunca girar à toa.
function retornoSolarMs(A, natalMs, lonNatal, n) {
  if (n === 0) return natalMs; // o retorno zero é o próprio nascimento, exato
  let t = natalMs + n * ANO_TROPICO_MS;
  for (let i = 0; i < 12; i++) {
    const d = difAngular(longitudeDoSol(A, t), lonNatal);
    const h = 3600000;
    const v = difAngular(longitudeDoSol(A, t + h), longitudeDoSol(A, t - h)) / 2; // °/hora
    if (!v) break;
    const passo = (d / v) * h;
    t -= passo;
    if (Math.abs(passo) < 1000) break; // menos de um segundo: chegou
  }
  return t;
}

function msDeHoje(hoje) {
  if (hoje === undefined || hoje === null) return Date.now();
  if (hoje instanceof Date) return hoje.getTime();
  if (typeof hoje === 'number') return hoje;
  if (typeof hoje === 'string') {
    // Data sem hora: meio-dia UTC, o mesmo palpite de menor erro do resto do app.
    if (/^\d{4}-\d{2}-\d{2}$/.test(hoje)) return new Date(`${hoje}T12:00:00Z`).getTime();
    return new Date(hoje).getTime();
  }
  return NaN;
}

// Idade profeccional = quantos retornos solares já aconteceram até `hojeMs`.
// Devolve também a janela do ano corrente, que é o que a camada mensal usa.
function idadePorRetornoSolar(A, natalMs, lonNatal, hojeMs) {
  if (hojeMs < natalMs) return null;
  let n = Math.floor((hojeMs - natalMs) / ANO_TROPICO_MS);
  if (n < 0) n = 0;
  for (let guarda = 0; guarda < 6; guarda++) {
    const inicio = retornoSolarMs(A, natalMs, lonNatal, n);
    if (inicio > hojeMs) {
      if (n === 0) return null;
      n -= 1;
      continue;
    }
    const fim = retornoSolarMs(A, natalMs, lonNatal, n + 1);
    if (fim <= hojeMs) {
      n += 1;
      continue;
    }
    return { idade: n, inicioMs: inicio, fimMs: fim };
  }
  return null;
}

// ---------------------------------------------------------------------------
// A ARITMÉTICA DA RODA — a conta inteira da técnica
// ---------------------------------------------------------------------------
export function casaDaIdade(idade) {
  if (!Number.isFinite(idade) || idade < 0) return null;
  return (Math.floor(idade) % 12) + 1;
}

export function signoDeslocado(signoBase, passos) {
  const i = ORDEM_SIGNOS.indexOf(signoBase);
  if (i === -1) return null;
  const p = ((Math.floor(passos) % 12) + 12) % 12;
  return ORDEM_SIGNOS[(i + p) % 12];
}

// O Senhor do Ano é o regente de DOMICÍLIO do signo onde a contagem para.
// Devolve o id canônico ('venus'), não o nome de tela.
export function senhorDoSigno(signo) {
  return DOMICILIO_POR_SIGNO[signo] || null;
}

function indisponivel(motivo, lang) {
  const pack = packDoIdioma(lang);
  return {
    disponivel: false,
    motivo,
    texto: pack.indisponivel[motivo] || pack.indisponivel.semData,
    fonte: pack.fonteBase,
  };
}

function melhoraCom(falta, pack) {
  if (!falta || falta.length === 0) return null;
  const chave = falta.length === 2 ? 'ambos' : falta[0];
  return { falta: falta.slice(), texto: pack.melhoraCom[chave] || pack.melhoraCom.ambos };
}

// Tudo que as duas funções públicas precisam calcular antes de escrever texto.
function contexto(nascimento, hoje) {
  const n = normalizarNascimento(nascimento);
  if (!n) return { erro: 'semData' };
  if (!dataValida(n.date)) return { erro: 'dataInvalida' };

  const A = getAstronomy();
  if (!A) return { erro: 'semEfemeride' };

  const partida = pontoDePartida(n);
  if (!partida) return { erro: 'semEfemeride' };

  const natalMs = instanteUtcMs(n.date, n.time, n.city);
  if (Number.isNaN(natalMs)) return { erro: 'dataInvalida' };

  const hojeMs = msDeHoje(hoje);
  if (!Number.isFinite(hojeMs)) return { erro: 'dataInvalida' };
  if (hojeMs < natalMs) return { erro: 'antesDoNascimento' };

  let lonNatal;
  try {
    lonNatal = longitudeDoSol(A, natalMs);
  } catch {
    return { erro: 'semEfemeride' };
  }

  const ano = idadePorRetornoSolar(A, natalMs, lonNatal, hojeMs);
  if (!ano) return { erro: 'antesDoNascimento' };

  const casa = casaDaIdade(ano.idade);
  const signo = signoDeslocado(partida.signo, ano.idade);
  if (!signo) return { erro: 'semEfemeride' };

  return {
    nascimento: n,
    partida,
    natalMs,
    hojeMs,
    idade: ano.idade,
    inicioMs: ano.inicioMs,
    fimMs: ano.fimMs,
    casa,
    signo,
    senhor: senhorDoSigno(signo),
    precisao: n.time && coordenadasDe(n.city) ? 'exata' : 'meioDia',
  };
}

function blocoComum(ctx, pack) {
  const origem = pack.origem[ctx.partida.origem];
  return {
    disponivel: true,
    origem: ctx.partida.origem,
    origemRotulo: origem.rotulo,
    origemTexto: origem.texto,
    origemGlosa: origem.glosa || null,
    signoDePartida: pack.signos[ctx.partida.signo],
    signoDePartidaId: ctx.partida.signo,
    precisao: ctx.precisao,
    precisaoTexto: pack.precisao[ctx.precisao],
    melhoraCom: melhoraCom(ctx.partida.falta, pack),
    sistemaDeCasas: pack.sistemaDeCasas,
    comoFunciona: pack.comoFunciona,
    deOndeVem: pack.deOndeVem,
    aPalavra: pack.aPalavra,
    quandoViraOAno: pack.quandoViraOAno,
    verbatim: pack.verbatim,
    naoAchado: pack.naoAchado,
    fontes: pack.fontes,
    rotulos: pack.rotulos,
  };
}

// ---------------------------------------------------------------------------
// PROFECÇÃO ANUAL — a função da feature
// ---------------------------------------------------------------------------
// profeccaoAnual(nascimento, hoje) → {
//   idade, casaProfectada, signoDoAno, senhorDoAno, texto, fonte, … }
//
// `texto` obedece a regra da casa: abre na vida real (a casa do ano), e só
// depois entra quem está com a chave. O recibo fica em `fonte` e em `detalhe`.
export function profeccaoAnual(nascimento, hoje = new Date(), lang = 'pt') {
  const pack = packDoIdioma(lang);
  const ctx = contexto(nascimento, hoje);
  if (ctx.erro) return indisponivel(ctx.erro, lang);

  const casa = pack.casas[ctx.casa];
  const senhor = pack.senhores[ctx.senhor];
  const nomePlaneta = pack.planetas[ctx.senhor];

  // Rótulo e nome-na-frase são campos diferentes de propósito: em português
  // "é a Lua" e não "é Lua", em inglês "is the Sun" e não "is Sun".
  const nomeNaFrase = pack.planetasNaFrase[ctx.senhor];
  const linhaSenhor = `${preencher(pack.moldes.senhorDoAno, { planeta: nomeNaFrase })} ${senhor.prende}`;
  const texto = `${casa.prende}\n\n${linhaSenhor}`;
  const fonte = preencher(pack.moldes.fonte, {
    base: pack.fonteBase,
    casa: casa.fonte,
    senhor: senhor.fonte,
  });

  return {
    ...blocoComum(ctx, pack),
    idade: ctx.idade,
    casaProfectada: ctx.casa,
    signoDoAno: pack.signos[ctx.signo],
    signoDoAnoId: ctx.signo,
    senhorDoAno: nomePlaneta,
    senhorDoAnoId: ctx.senhor,
    nomeAntigoDaCasa: casa.nomeAntigo,
    texto,
    fonte,
    titulo: preencher(pack.moldes.tituloAno, {
      idade: ctx.idade,
      casa: ctx.casa,
      signo: pack.signos[ctx.signo],
    }),
    viradaDoAno: new Date(Math.round(ctx.inicioMs)).toISOString(),
    proximaVirada: new Date(Math.round(ctx.fimMs)).toISOString(),
    detalhe: {
      casaPrende: casa.prende,
      casaTradicao: casa.tradicao,
      casaModerno: casa.moderno,
      casaFonte: casa.fonte,
      senhorPrende: senhor.prende,
      senhorTradicao: senhor.tradicao,
      senhorModerno: senhor.moderno,
      senhorFonte: senhor.fonte,
    },
  };
}

// ---------------------------------------------------------------------------
// PROFECÇÃO MENSAL — 28 dias por signo, dentro do ano já profectado
// ---------------------------------------------------------------------------
// "starting from the places that govern the year, twenty-eight days to a sign"
// — Ptolomeu IV.10. A contagem começa no signo DO ANO (não no de nascimento) e
// no instante do retorno solar (não no dia 1º do mês civil). São treze
// mudanças por ano, o que transforma uma feature anual numa feature mensal.
//
// `segmento` é 0-based (0 = o primeiro trecho de 28 dias do ano profectado) e
// `mes` é 1-based, que é o que a tela mostra.
export function profeccaoMensal(nascimento, hoje = new Date(), lang = 'pt') {
  const pack = packDoIdioma(lang);
  const ctx = contexto(nascimento, hoje);
  if (ctx.erro) return indisponivel(ctx.erro, lang);

  const janelaMs = DIAS_POR_SIGNO_MENSAL * DIA_MS;
  let segmento = Math.floor((ctx.hojeMs - ctx.inicioMs) / janelaMs);
  if (segmento < 0) segmento = 0;
  // 13 é o último trecho possível: 13 × 28 = 364 dias, e o ano tropical tem
  // 365,24. O resto do ano cabe dentro dele; o trecho 14 não existe.
  const maxSegmento = Math.floor((ctx.fimMs - ctx.inicioMs) / janelaMs);
  if (segmento > maxSegmento) segmento = maxSegmento;

  const signoMes = signoDeslocado(ctx.signo, segmento);
  const casaMes = ((ctx.casa - 1 + segmento) % 12) + 1;
  const senhorMes = senhorDoSigno(signoMes);

  const casa = pack.casas[casaMes];
  const senhor = pack.senhores[senhorMes];
  const nomePlaneta = pack.planetas[senhorMes];

  const nomeNaFrase = pack.planetasNaFrase[senhorMes];
  const linhaSenhor = `${preencher(pack.moldes.senhorDoMes, { planeta: nomeNaFrase })} ${senhor.curto}`;
  const texto = `${casa.mes}\n\n${linhaSenhor}`;
  const fonte = preencher(pack.moldes.fonteMes, {
    base: pack.fonteBase,
    casa: casa.fonte,
    senhor: senhor.fonte,
  });

  const inicioMes = ctx.inicioMs + segmento * janelaMs;
  const fimMes = Math.min(inicioMes + janelaMs, ctx.fimMs);

  return {
    ...blocoComum(ctx, pack),
    idade: ctx.idade,
    casaProfectada: ctx.casa,
    signoDoAno: pack.signos[ctx.signo],
    signoDoAnoId: ctx.signo,
    senhorDoAno: pack.planetas[ctx.senhor],
    senhorDoAnoId: ctx.senhor,
    segmento,
    mes: segmento + 1,
    casaDoMes: casaMes,
    signoDoMes: pack.signos[signoMes],
    signoDoMesId: signoMes,
    senhorDoMes: nomePlaneta,
    senhorDoMesId: senhorMes,
    // O nome antigo aqui é o do lugar DO MÊS, não o do ano — nome distinto
    // para a tela não misturar as duas camadas sem perceber.
    nomeAntigoDaCasaDoMes: casa.nomeAntigo,
    texto,
    fonte,
    titulo: preencher(pack.moldes.tituloMes, {
      mes: segmento + 1,
      casa: casaMes,
      signo: pack.signos[signoMes],
    }),
    camadaMensal: pack.camadaMensal,
    inicio: new Date(Math.round(inicioMes)).toISOString(),
    fim: new Date(Math.round(fimMes)).toISOString(),
    viradaDoAno: new Date(Math.round(ctx.inicioMs)).toISOString(),
    proximaVirada: new Date(Math.round(ctx.fimMs)).toISOString(),
    detalhe: {
      casaPrende: casa.prende,
      casaMes: casa.mes,
      casaTradicao: casa.tradicao,
      casaModerno: casa.moderno,
      casaFonte: casa.fonte,
      senhorCurto: senhor.curto,
      senhorTradicao: senhor.tradicao,
      senhorModerno: senhor.moderno,
      senhorFonte: senhor.fonte,
    },
  };
}
