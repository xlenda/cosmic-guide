// Fuso horário REAL de um instante de nascimento — o conserto do Ascendente.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE
//
// lib/cities.js sempre guardou `utcOffset` FIXO por cidade (São Paulo = -3,
// sempre) e lib/signs.js usa esse número pra converter a hora informada pela
// pessoa em instante UTC. Só que o Brasil teve horário de verão até 2019:
// quem nasceu em 10/01/2015 às 13:00 em São Paulo estava em UTC-2, não -3.
//
// Uma hora de erro não é detalhe: o Ascendente anda ~30° a cada 2 horas, ou
// seja UM SIGNO a cada 2h. Medido com a própria ascendantSign() deste app,
// varrendo as 48 meias-horas de um dia de janeiro em São Paulo:
//
//   120 de 240 combinações data×hora testadas mudam de signo entre -3 e -2.
//   Metade dos nascimentos do período de horário de verão sai com o
//   Ascendente ERRADO — e o Ascendente é o campo mais valorizado da tela.
//
// O horário de verão brasileiro existiu em 1931-33, 1949-53, 1963-68 e
// 1985-2019 (Sul/Sudeste/Centro-Oeste; a Bahia entrou em 2011-2012, o Nordeste
// participou em vários dos ciclos antigos). Não dá pra resolver isso com
// tabela na mão. Indo pro mundo (EUA e Europa inteiros com DST ATIVO até
// hoje) deixa de ser caso de borda e vira o caso comum.
//
// A CORREÇÃO é o fuso IANA ("America/Sao_Paulo"), que o backend passou a
// devolver em cada cidade (campo `timezone` de GET /api/cities/search). Com
// ele o offset é CALCULADO pro instante certo, usando a tzdata que já vem no
// aparelho — via Intl.DateTimeFormat, sem uma única dependência nova.
//
// ===========================================================================
// AS TRÊS DECISÕES QUE ESTE ARQUIVO TOMA (e que precisam estar escritas)
//
// 1) HORA DE PAREDE → INSTANTE, EM DUAS PASSADAS.
//    A pessoa informa a hora do RELÓGIO da maternidade ("nasci 14:30"). Pra
//    saber o offset daquele momento é preciso o instante UTC; pra saber o
//    instante UTC é preciso o offset. Circular. Resolve-se chutando que a
//    hora de parede é UTC, lendo o offset naquele ponto, corrigindo, e lendo
//    o offset de novo no ponto corrigido. Duas passadas bastam: nenhuma
//    transição de fuso do mundo real é maior que o erro da primeira passada.
//    (Mesmo algoritmo do servidor, em citiesRoutes.js — de propósito: os dois
//    lados precisam concordar no número, senão o app mostraria um Ascendente
//    calculado offline e outro online.)
//
// 2) AS HORAS QUE NÃO EXISTEM E AS QUE ACONTECEM DUAS VEZES.
//    Na entrada do horário de verão o relógio pula (no Brasil, 00:00 → 01:00):
//    a hora de parede 00:30 daquele dia NUNCA existiu. Na saída ele volta
//    (00:00 → 23:00 do dia anterior): a hora 23:30 acontece DUAS vezes.
//    Regra adotada, medida no comportamento real deste código:
//      · hora inexistente  → lida como se o relógio JÁ tivesse pulado, isto é,
//        o offset DEPOIS da transição (2014-10-19 00:30 em São Paulo → -2).
//      · hora ambígua      → a PRIMEIRA ocorrência, a que ainda está no
//        horário de verão (2015-02-21 23:30 em São Paulo → -2).
//    Por que decidir em silêncio em vez de pedir desempate à pessoa: a janela
//    afetada é de 1 hora por ano, e a hora de nascimento que as pessoas
//    informam quase nunca tem precisão de minuto (é "por volta das 23h", lida
//    de uma certidão). Errar 1h numa janela de 1h/ano é incomparavelmente
//    melhor que o erro de hoje, que são 1h errada durante os ~4 MESES de
//    horário de verão, todo ano, pra todo mundo.
//
// 3) SE O APARELHO NÃO SOUBER O FUSO, NÃO INVENTA.
//    Aparelho Android antigo com Hermes sem ICU completo pode não conhecer
//    `timeZone`/`longOffset`. Aqui isso devolve null e quem chama cai no
//    `utcOffset` fixo da cidade — exatamente o comportamento de hoje, nunca
//    pior. Nada neste arquivo lança exceção.
//
// Faixa suportada: 1900–2100. Antes disso a tzdata registra hora solar local
// com offsets quebrados (-3:06:28 em São Paulo até 1914) que ninguém quer num
// mapa astral; os nascimentos reais do app estão todos em 1940+.
// ===========================================================================

const ANO_MIN = 1900;
const ANO_MAX = 2100;

// Construir um Intl.DateTimeFormat custa ~1ms. Um mapa por fuso resolve pra
// sempre (o mundo tem ~420 fusos IANA, e um app típico usa 1 ou 2).
const cacheLongOffset = new Map();
const cachePartes = new Map();

function temIntl() {
  return typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function';
}

// --- Método 1: timeZoneName "longOffset" ("GMT-03:00"). Direto e exato,
// disponível em todo navegador moderno e no Node com ICU completo.
function formatterLongOffset(timeZone) {
  if (cacheLongOffset.has(timeZone)) return cacheLongOffset.get(timeZone);
  let f = null;
  try {
    f = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'longOffset' });
  } catch (_) {
    f = null; // fuso desconhecido pelo aparelho, ou 'longOffset' não suportado
  }
  cacheLongOffset.set(timeZone, f);
  return f;
}

function porLongOffset(timeZone, instanteMs) {
  const f = formatterLongOffset(timeZone);
  if (!f) return null;
  let partes;
  try {
    partes = f.formatToParts(new Date(instanteMs));
  } catch (_) {
    return null;
  }
  const nome = partes.find((p) => p.type === 'timeZoneName');
  if (!nome) return null;
  const m = /^GMT([+-])(\d{1,2}):(\d{2})$/.exec(nome.value);
  if (!m) return nome.value === 'GMT' ? 0 : null; // "GMT" puro = UTC exato
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
}

// --- Método 2 (reserva): formata a data COMPLETA no fuso alvo e compara com
// o instante. Só precisa de suporte a `timeZone`, que é bem mais antigo que
// `longOffset` — é o caminho que salva aparelhos com Intl parcial.
function formatterPartes(timeZone) {
  if (cachePartes.has(timeZone)) return cachePartes.get(timeZone);
  let f = null;
  try {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (_) {
    f = null;
  }
  cachePartes.set(timeZone, f);
  return f;
}

function porPartes(timeZone, instanteMs) {
  const f = formatterPartes(timeZone);
  if (!f) return null;
  let partes;
  try {
    partes = f.formatToParts(new Date(instanteMs));
  } catch (_) {
    return null;
  }
  const v = {};
  for (const p of partes) if (p.type !== 'literal') v[p.type] = p.value;
  if (!v.year || !v.month || !v.day || v.hour === undefined) return null;
  // hour12:false produz "24" em vez de "00" em alguns motores (bug histórico
  // do ICU) — normalizar aqui evita um erro de 24h uma vez por dia.
  const hora = Number(v.hour) % 24;
  const comoUtc = Date.UTC(
    Number(v.year),
    Number(v.month) - 1,
    Number(v.day),
    hora,
    Number(v.minute || 0),
    Number(v.second || 0)
  );
  if (!Number.isFinite(comoUtc)) return null;
  // Arredonda pro minuto: offsets do mundo real são múltiplos de 15min, e o
  // arredondamento mata o resíduo de segundos dos fusos pré-1914.
  return Math.round((comoUtc - instanteMs) / 60000);
}

/**
 * Um fuso IANA é conhecido por ESTE aparelho? (feature detection de verdade:
 * pergunta pelo fuso, não pela versão do motor)
 */
export function timeZoneSupported(timeZone) {
  if (!temIntl() || typeof timeZone !== 'string' || !timeZone) return false;
  return offsetMinutesAtInstant(timeZone, Date.UTC(2000, 0, 1, 12)) !== null;
}

/**
 * Offset (MINUTOS) daquele fuso NAQUELE INSTANTE UTC. null = não deu pra
 * saber (Intl ausente, fuso desconhecido, formato inesperado).
 */
export function offsetMinutesAtInstant(timeZone, instanteMs) {
  if (!temIntl() || typeof timeZone !== 'string' || !timeZone) return null;
  if (!Number.isFinite(instanteMs)) return null;
  const direto = porLongOffset(timeZone, instanteMs);
  if (direto !== null) return direto;
  return porPartes(timeZone, instanteMs);
}

/**
 * Offset (MINUTOS) para uma HORA DE PAREDE — "o que estava escrito no relógio".
 * É esta a função que resolve o horário de verão. Ver a decisão (1) e (2) no
 * cabeçalho.
 */
export function offsetMinutesAtWallTime(timeZone, ano, mes, dia, hora, minuto) {
  if (!Number.isFinite(ano) || ano < ANO_MIN || ano > ANO_MAX) return null;
  const h = Number.isFinite(hora) ? hora : 12;
  const mi = Number.isFinite(minuto) ? minuto : 0;
  const chute = Date.UTC(ano, mes - 1, dia, h, mi, 0, 0);
  if (!Number.isFinite(chute)) return null;
  const passo1 = offsetMinutesAtInstant(timeZone, chute);
  if (passo1 === null) return null;
  const passo2 = offsetMinutesAtInstant(timeZone, chute - passo1 * 60000);
  return passo2 === null ? passo1 : passo2;
}

// "YYYY-MM-DD" — o formato que a tela de nascimento já usa.
const DATA_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
// "HH:MM" (aceita "H:MM" por segurança) — idem.
const HORA_RE = /^(\d{1,2}):(\d{2})$/;

/**
 * Quebra data+hora do app em campos. Hora ausente vira MEIO-DIA: é o ponto do
 * dia mais distante das duas transições possíveis, então é o palpite que erra
 * menos quando a pessoa não sabe a hora. (moonSign/aspects já usam meio-dia
 * pela mesma razão.)
 */
export function parseBirthMoment(dateStr, timeStr) {
  if (typeof dateStr !== 'string') return null;
  const d = DATA_RE.exec(dateStr.trim());
  if (!d) return null;
  const ano = Number(d[1]);
  const mes = Number(d[2]);
  const dia = Number(d[3]);
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  let hora = 12;
  let minuto = 0;
  if (typeof timeStr === 'string' && timeStr.trim()) {
    const t = HORA_RE.exec(timeStr.trim());
    if (!t) return null;
    hora = Number(t[1]);
    minuto = Number(t[2]);
    if (hora > 23 || minuto > 59) return null;
  }
  return { ano, mes, dia, hora, minuto };
}

/**
 * O que o resto do app chama: dado o fuso IANA e a data/hora informadas na
 * tela, devolve o offset em HORAS (o que ascendantSign/houses/
 * astrocartographyCities esperam). null quando não dá pra saber.
 */
export function offsetHoursFor(timeZone, dateStr, timeStr) {
  const m = parseBirthMoment(dateStr, timeStr);
  if (!m) return null;
  const min = offsetMinutesAtWallTime(timeZone, m.ano, m.mes, m.dia, m.hora, m.minuto);
  return min === null ? null : min / 60;
}

/**
 * Aquele nascimento caiu em horário de verão? Compara o offset real com o
 * offset PADRÃO da cidade (o campo `utcOffset`, que o backend também devolve).
 * Serve pra mostrar "horário de verão aplicado" na tela — é o que faz o número
 * ser confiável em vez de parecer erro de 1h.
 */
export function isDstAt(timeZone, dateStr, timeStr, offsetPadraoHoras) {
  const real = offsetHoursFor(timeZone, dateStr, timeStr);
  if (real === null || typeof offsetPadraoHoras !== 'number') return false;
  return Math.abs(real - offsetPadraoHoras) > 1 / 60;
}

/**
 * PONTE ÚNICA usada por lib/signs.js — aceita, na mesma posição de argumento:
 *
 *   número            -3                       (assinatura antiga, intocada)
 *   string IANA       "America/Sao_Paulo"      (novo)
 *   objeto cidade     { timezone, utcOffset }  (novo, e o mais seguro:
 *                     o utcOffset serve de reserva se o aparelho não conhecer
 *                     o fuso)
 *
 * Devolve HORAS ou null. Nunca lança.
 */
export function resolveOffsetHours(zona, dateStr, timeStr) {
  if (typeof zona === 'number') return Number.isNaN(zona) ? null : zona;

  if (typeof zona === 'string' && zona.trim()) {
    const texto = zona.trim();
    // Uma string numérica ("-3") é offset, não fuso — quem passou isso
    // provavelmente veio de um campo de formulário.
    if (/^[+-]?\d+(\.\d+)?$/.test(texto)) return Number(texto);
    return offsetHoursFor(texto, dateStr, timeStr);
  }

  if (zona && typeof zona === 'object') {
    if (typeof zona.timezone === 'string' && zona.timezone) {
      const real = offsetHoursFor(zona.timezone, dateStr, timeStr);
      if (real !== null) return real;
    }
    // `utcOffsetAt` chega pronto do servidor quando a busca mandou `at` —
    // aproveitamos, mas só depois de tentar o cálculo local (que também
    // funciona quando a pessoa MUDA a hora de nascimento sem trocar a cidade).
    if (typeof zona.utcOffsetAt === 'number' && !Number.isNaN(zona.utcOffsetAt)) {
      return zona.utcOffsetAt;
    }
    if (typeof zona.utcOffset === 'number' && !Number.isNaN(zona.utcOffset)) {
      return zona.utcOffset;
    }
  }

  return null;
}

/**
 * "-02:00" / "+05:30" — pra mostrar o fuso aplicado na tela.
 */
export function formatOffset(horas) {
  if (typeof horas !== 'number' || Number.isNaN(horas)) return '';
  const total = Math.round(horas * 60);
  const sinal = total < 0 ? '-' : '+';
  const abs = Math.abs(total);
  const hh = String(Math.floor(abs / 60)).padStart(2, '0');
  const mm = String(abs % 60).padStart(2, '0');
  return `${sinal}${hh}:${mm}`;
}
