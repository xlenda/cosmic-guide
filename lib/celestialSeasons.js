// lib/celestialSeasons.js
// "Temporadas do Céu" — eventos celestes REAIS acontecendo agora, pro banner
// da Home: Mercúrio retrógrado (calculado de verdade, lib/signs.js), próxima
// Lua Cheia/Nova (astronomy-engine via lib/lunarCalendar) e a temporada
// zodiacal corrente. FOMO honesto por definição: as datas vêm do céu, nunca
// de um contador inventado. Sem motor de astronomia disponível, os eventos
// astronômicos somem (nunca são chutados) — a temporada zodiacal fica, que é
// calendário fixo.
import { isMercuryRetrograde } from './signs';
import { getMoonPhase } from './lunarCalendar';
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

// Fim do retrógrado corrente: varre dia a dia até isMercuryRetrograde virar
// false (teto de 45 dias — retrógrados reais duram ~21, o teto é só proteção
// contra loop). Barato: cada passo é trigonometria O(1).
function mercuryRetroEnd(fromDate) {
  const cursor = new Date(fromDate);
  for (let i = 0; i < 45; i++) {
    cursor.setDate(cursor.getDate() + 1);
    if (isMercuryRetrograde(toDateStr(cursor)) === false) return cursor;
  }
  return null;
}

// Próxima Lua Cheia ou Nova nos próximos `horizon` dias (inclui hoje) — só
// os dois marcos que todo mundo conhece; devolve null se nenhum cair na
// janela (o banner simplesmente não mostra o item lunar).
function nextLunarMilestone(fromDate, horizon = 7) {
  for (let i = 0; i <= horizon; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    const phase = getMoonPhase(new Date(`${toDateStr(d)}T12:00:00Z`));
    if (!phase) return null;
    if (phase.name === 'Lua Cheia' || phase.name === 'Lua Nova') {
      return { name: phase.name, emoji: phase.emoji, inDays: i, date: d };
    }
  }
  return null;
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
