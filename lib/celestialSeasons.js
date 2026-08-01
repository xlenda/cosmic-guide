// lib/celestialSeasons.js
// "Temporadas do Céu" — eventos celestes REAIS acontecendo agora, pro banner
// da Home: Mercúrio retrógrado (calculado de verdade, lib/signs.js), próxima
// Lua Cheia/Nova (astronomy-engine via lib/lunarCalendar) e a temporada
// zodiacal corrente. FOMO honesto por definição: as datas vêm do céu, nunca
// de um contador inventado. Sem motor de astronomia disponível, os eventos
// astronômicos somem (nunca são chutados) — a temporada zodiacal fica, que é
// calendário fixo.
import { isMercuryRetrograde } from './signs';
import { nextExactNewOrFullMoon } from './lunarCalendar';
import { zodiacSigns } from '../theme';
import { txtCelestial, FASE_NOME, ELEMENTO_NOME } from './traducoes/celestial';
import { nomeDoSigno } from './synastry';

// Preenche {x} de uma moldura do pack — mesmo helper das outras libs.
function fill(tpl, vars) {
  return String(tpl).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function toDateStr(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatBR(d) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

// ÚLTIMO dia do retrógrado corrente: varre dia a dia até isMercuryRetrograde
// virar false e devolve o dia ANTERIOR a esse (teto de 45 dias — retrógrados
// reais duram ~21, o teto é só proteção contra loop). Barato: cada passo é
// trigonometria O(1).
//
// Antes esta função devolvia o primeiro dia em que Mercúrio JÁ ESTAVA DIRETO, e
// esse valor era impresso como "Até {data}" — o banner esticava o retrógrado um
// dia a mais do que ele dura (em 2026: mostrava "Até 21/03" com a estação direta
// em 20/03 às 20:00 UTC, e o próprio app já classificando 21/03 como direto).
// Mercúrio retrógrado é justamente a data que o público deste app mais confere
// em outras fontes, então a divergência aparecia.
function mercuryRetroEnd(fromDate) {
  const cursor = new Date(fromDate);
  let prev = new Date(fromDate);
  for (let i = 0; i < 45; i++) {
    cursor.setDate(cursor.getDate() + 1);
    if (isMercuryRetrograde(toDateStr(cursor)) === false) return prev;
    prev = new Date(cursor);
  }
  return null;
}

// Próxima Lua Cheia ou Nova nos próximos `horizon` dias (inclui hoje) — só os
// dois marcos que todo mundo conhece; devolve null se nenhum cair na janela (o
// banner simplesmente não mostra o item lunar).
//
// Usa o INSTANTE EXATO (SearchMoonPhase), não o rótulo de fase do dia. A versão
// anterior varria dia a dia procurando o primeiro dia cujo RÓTULO era
// Cheia/Nova, e como o rótulo vem de uma fatia de 45° (~3,7 dias), o banner
// anunciava "Lua Cheia hoje" em até 4 dias seguidos — um dia antes do evento e
// dois depois. O comentário do topo deste arquivo promete que as datas vêm do
// céu; marco lunar tem data única, e agora é essa que aparece.
function nextLunarMilestone(fromDate, horizon = 7) {
  const event = nextExactNewOrFullMoon(fromDate, horizon + 2);
  if (!event || !event.date) return null;

  // Comparação em DIAS DE CALENDÁRIO locais (o usuário lê "em 2 dias" contra o
  // próprio calendário, não contra o relógio UTC do instante).
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const inDays = Math.round((startOfDay(event.date) - startOfDay(fromDate)) / 86400000);
  if (inDays < 0 || inDays > horizon) return null;

  return { name: event.name, emoji: event.emoji, inDays, date: event.date };
}

// Temporada zodiacal corrente a partir das faixas fixas de zodiacSigns
// (theme.js, formato '21 Mar - 19 Abr').
const MES_ABREV = { Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5, Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11 };
function currentZodiacSeason(date) {
  const md = (m, d) => m * 100 + d;
  const now = md(date.getMonth(), date.getDate());
  for (const sign of zodiacSigns) {
    const m = sign.dates.match(/^(\d+) (\w+) - (\d+) (\w+)$/);
    if (!m) continue;
    const start = md(MES_ABREV[m[2]], Number(m[1]));
    const end = md(MES_ABREV[m[4]], Number(m[3]));
    const inside = start <= end ? now >= start && now <= end : now >= start || now <= end; // Capricórnio cruza o ano
    if (inside) return { sign, endsDay: Number(m[3]), endsMonth: MES_ABREV[m[4]] };
  }
  return null;
}

// Lista de eventos ativos, do mais "quente" pro mais permanente — a Home
// mostra os 2 primeiros. Cada item: { emoji, title, detail }.
// `lang` desde 01/08/2026. Antes isto devolvia tudo em português, e a Home
// preferia DESLIGAR o subtítulo do Calendário em es/en a mostrar frase híbrida
// — o gringo perdia a informação em vez de recebê-la.
export function activeCelestialEvents(date = new Date(), lang = 'pt') {
  const events = [];
  const dateStr = toDateStr(date);
  const T = txtCelestial(lang);

  if (isMercuryRetrograde(dateStr) === true) {
    const end = mercuryRetroEnd(date);
    events.push({
      emoji: '☿',
      title: T.mercurioTitulo,
      detail: end ? fill(T.mercurioAte, { data: formatBR(end) }) : T.mercurioSemData,
    });
  }

  const lunar = nextLunarMilestone(date);
  if (lunar) {
    const nome = (FASE_NOME[lang] && FASE_NOME[lang][lunar.name]) || lunar.name;
    const molde = lunar.inDays === 0 ? T.luaHoje : lunar.inDays > 1 ? T.luaEmDiasPlural : T.luaEmDias;
    events.push({
      emoji: lunar.emoji,
      title: fill(molde, { nome, n: lunar.inDays }),
      // A Lua Cheia NÃO é a fase da colheita — ver o cabeçalho do pack. Este
      // era o último lugar do app onde a versão errada sobrevivia.
      detail: lunar.name === 'Lua Cheia' ? T.luaCheiaDetalhe : T.luaNovaDetalhe,
    });
  }

  const season = currentZodiacSeason(date);
  if (season) {
    const signo = nomeDoSigno(season.sign.pt, lang);
    const elemento = (ELEMENTO_NOME[lang] && ELEMENTO_NOME[lang][season.sign.element]) || season.sign.element;
    events.push({
      emoji: season.sign.icon,
      title: fill(T.temporadaTitulo, { signo }),
      detail: fill(T.temporadaDetalhe, {
        signo,
        elemento,
        dia: pad2(season.endsDay),
        mes: pad2(season.endsMonth + 1),
      }),
    });
  }

  return events;
}
