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
export function activeCelestialEvents(date = new Date()) {
  const events = [];
  const dateStr = toDateStr(date);

  if (isMercuryRetrograde(dateStr) === true) {
    const end = mercuryRetroEnd(date);
    events.push({
      emoji: '☿',
      title: 'Mercúrio retrógrado',
      detail: end
        ? `Até ${formatBR(end)} — época de revisar, reler e reconferir antes de assinar qualquer coisa.`
        : 'Época de revisar, reler e reconferir antes de assinar qualquer coisa.',
    });
  }

  const lunar = nextLunarMilestone(date);
  if (lunar) {
    events.push({
      emoji: lunar.emoji,
      title: lunar.inDays === 0 ? `${lunar.name} hoje` : `${lunar.name} em ${lunar.inDays} dia${lunar.inDays > 1 ? 's' : ''}`,
      detail:
        lunar.name === 'Lua Cheia'
          ? 'Auge do ciclo — tradição de colher, celebrar e enxergar com clareza o que cresceu.'
          : 'Começo de ciclo — tradição de plantar intenções pro mês que nasce.',
    });
  }

  const season = currentZodiacSeason(date);
  if (season) {
    events.push({
      emoji: season.sign.icon,
      title: `Temporada de ${season.sign.pt}`,
      detail: `O Sol atravessa ${season.sign.pt} (${season.sign.element}) até ${pad2(season.endsDay)}/${pad2(season.endsMonth + 1)} — a energia coletiva do momento.`,
    });
  }

  return events;
}
