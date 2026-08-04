// A LUA CHEIA SUMIA NO PRÓPRIO DIA — achado da auditoria de 02/08/2026,
// medido contra a efeméride real em 03/08/2026: 21 dos 25 marcos lunares de
// 2026 desapareciam do banner assim que o instante exato passava.
//
// A causa: nextLunarMilestone pedia o PRÓXIMO marco a partir de "agora".
// SearchMoonPhase procura sempre pra frente, então uma Lua Cheia às 08:38 já
// não existia às 10h — e o próximo marco, a ~15 dias, caía fora do horizonte
// de 7 dias. O banner ficava mudo no único dia em que o evento importa.
//
// Estes testes usam DATAS REAIS de 2026 (conferidas contra o próprio motor,
// astronomy-engine), não instantes inventados.
import test from 'node:test';
import assert from 'node:assert/strict';
import { activeCelestialEvents } from '../lib/celestialSeasons.js';
import { nextExactNewOrFullMoon } from '../lib/lunarCalendar.js';

// Os marcos de 2026, direto do motor — se a efeméride mudar, o teste acompanha.
function marcosDe(ano, quantos = 25) {
  const out = [];
  let cursor = new Date(ano, 0, 1);
  for (let i = 0; i < quantos; i++) {
    const e = nextExactNewOrFullMoon(cursor, 40);
    if (!e || e.date.getFullYear() !== ano) break;
    out.push(e);
    cursor = new Date(e.date.getTime() + 3600e3);
  }
  return out;
}

function anunciaLuaHoje(quando, lang = 'pt') {
  return activeCelestialEvents(quando, lang).some(
    (e) => (e.emoji === '🌕' || e.emoji === '🌑') && /hoje|hoy|today/i.test(e.title)
  );
}

test('o marco lunar continua sendo anunciado DEPOIS do instante exato, no mesmo dia', () => {
  const marcos = marcosDe(2026);
  assert.ok(marcos.length >= 20, `esperava ~25 marcos em 2026, achei ${marcos.length}`);

  const falhas = [];
  for (const m of marcos) {
    // 2h depois do instante — a hora em que a pessoa realmente abre o app.
    const depois = new Date(m.date.getTime() + 2 * 3600e3);
    if (depois.getDate() !== m.date.getDate()) continue; // virou o dia: outro caso
    if (!anunciaLuaHoje(depois)) {
      falhas.push(`${m.name} ${m.date.toLocaleString('pt-BR')}`);
    }
  }
  assert.deepEqual(falhas, [], `marcos que sumiram no próprio dia:\n${falhas.join('\n')}`);
});

test('também aparece ANTES do instante, no mesmo dia — o dia inteiro vale', () => {
  const marcos = marcosDe(2026).filter((m) => m.date.getHours() >= 3);
  assert.ok(marcos.length > 5);
  for (const m of marcos.slice(0, 8)) {
    const antes = new Date(m.date.getTime() - 2 * 3600e3);
    if (antes.getDate() !== m.date.getDate()) continue;
    assert.ok(anunciaLuaHoje(antes), `${m.name} não apareceu 2h antes do instante`);
  }
});

test('o marco de ONTEM não vaza pra hoje — a meia-noite local é o piso', () => {
  const marcos = marcosDe(2026);
  for (const m of marcos.slice(0, 10)) {
    // Meio-dia do dia SEGUINTE ao marco.
    const amanha = new Date(m.date.getFullYear(), m.date.getMonth(), m.date.getDate() + 1, 12, 0, 0);
    const eventos = activeCelestialEvents(amanha, 'pt');
    const lunar = eventos.find((e) => e.emoji === '🌕' || e.emoji === '🌑');
    if (!lunar) continue;
    assert.doesNotMatch(
      lunar.title,
      /hoje/i,
      `no dia seguinte a ${m.name} o banner ainda dizia "hoje": ${lunar.title}`
    );
  }
});

test('nas três línguas o anúncio do dia sai traduzido', () => {
  const m = marcosDe(2026)[0];
  const depois = new Date(m.date.getTime() + 2 * 3600e3);
  if (depois.getDate() !== m.date.getDate()) return;
  for (const lang of ['pt', 'es', 'en']) {
    const eventos = activeCelestialEvents(depois, lang);
    const lunar = eventos.find((e) => e.emoji === '🌕' || e.emoji === '🌑');
    assert.ok(lunar, `${lang}: o marco lunar precisa aparecer`);
    assert.ok(lunar.title && lunar.detail, `${lang}: título e detalhe não podem vir vazios`);
  }
});
