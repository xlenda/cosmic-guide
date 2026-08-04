// UMA ÂNCORA SÓ PRA "A FASE DA LUA DE HOJE" — achado da auditoria de
// 02/08/2026. O app tinha TRÊS, e nenhuma sabia da outra:
//
//   meio-dia UTC   — dailyHoroscope, dailyThought, cosmicSound (`T12:00:00Z`)
//   agora          — getMoonPhaseToday e rituaisDeHoje (`new Date()`)
//   meio-dia local — a grade do Calendário Lunar (getMoonPhaseForMonth)
//
// Como o rótulo de fase vem de uma fatia de 45° (~3,7 dias), perto de uma
// borda as três discordavam sobre o MESMO dia: a grade marcava "Lua Cheia" na
// casinha de hoje enquanto o card acima dizia "Gibosa Minguante", e um ritual
// que pede Lua Cheia sumia da lista no mesmo instante.
//
// Estes testes não travam QUAL fase sai — isso é efeméride e muda. Travam que
// as superfícies concordam entre si, que é a regra que o app não pode quebrar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { getMoonPhaseToday, getMoonPhaseForMonth, faseDoDia, meioDiaLocal } from '../lib/lunarCalendar.js';
import { getThoughtForDate } from '../lib/dailyThought.js';
import { getSkyTuning } from '../lib/cosmicSound.js';

const DIA_MS = 86400000;

test('o card de hoje e a casinha de hoje na grade dizem a MESMA fase', () => {
  const hoje = new Date();
  const grade = getMoonPhaseForMonth(hoje.getFullYear(), hoje.getMonth() + 1, 'pt');
  const casinha = grade.find((d) => d.day === hoje.getDate());
  assert.ok(casinha, 'o dia de hoje precisa existir na grade do mês');
  assert.equal(getMoonPhaseToday('pt').name, casinha.phase.name, 'o card e a grade discordaram sobre hoje');
});

test('em 400 dias seguidos, grade e card nunca discordam — inclusive nas bordas de fase', () => {
  const divergencias = [];
  for (let i = 0; i < 400; i++) {
    const d = new Date(2026, 0, 1 + i);
    const grade = getMoonPhaseForMonth(d.getFullYear(), d.getMonth() + 1, 'pt');
    const casinha = grade.find((x) => x.day === d.getDate());
    const pelaFuncaoDoDia = faseDoDia(d, 'pt');
    if (casinha.phase.name !== pelaFuncaoDoDia.name) {
      divergencias.push(`${d.toISOString().slice(0, 10)}: grade=${casinha.phase.name} dia=${pelaFuncaoDoDia.name}`);
    }
  }
  assert.deepEqual(divergencias, [], `dias em que grade e faseDoDia discordaram:\n${divergencias.join('\n')}`);
});

test('o pensamento do dia e o som do céu usam a mesma fase do mesmo dia', () => {
  // Foram os dois que ficaram no meio-dia UTC até 03/08/2026 — num aparelho a
  // oeste de Greenwich isso é uma manhã, não um meio-dia, e perto de borda dá
  // outro rótulo.
  const divergencias = [];
  for (let i = 0; i < 120; i++) {
    const d = new Date(2026, 0, 1 + i);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const doDia = faseDoDia(iso, 'pt');
    const som = getSkyTuning(d);
    if (som.ceuDisponivel && som.fase && som.fase !== doDia.name) {
      divergencias.push(`${iso}: som=${som.fase} dia=${doDia.name}`);
    }
    // O pensamento cita o nome da fase no texto; se a âncora divergisse, o
    // nome citado seria de outra fase que a da grade daquele mesmo dia.
    const pensamento = getThoughtForDate(d, null, 'pt');
    if (pensamento && !pensamento.includes(doDia.name)) {
      divergencias.push(`${iso}: o pensamento não cita "${doDia.name}"`);
    }
  }
  assert.deepEqual(divergencias, [], divergencias.slice(0, 10).join('\n'));
});

test('faseDoDia aceita string ISO e Date, e os dois dão o mesmo dia', () => {
  const d = new Date(2026, 6, 31, 23, 59, 59);
  assert.equal(faseDoDia(d, 'pt').name, faseDoDia('2026-07-31', 'pt').name);
  // A hora dentro do dia não muda o rótulo do DIA — é isso que "âncora" quer
  // dizer, e é o que impede duas telas de discordarem por causa do relógio.
  assert.equal(faseDoDia(new Date(2026, 6, 31, 0, 1), 'pt').name, faseDoDia(new Date(2026, 6, 31, 23, 58), 'pt').name);
});

test('meioDiaLocal é meio-dia no fuso de quem lê, e recusa data inválida', () => {
  const m = meioDiaLocal(new Date(2026, 6, 31, 3, 0, 0));
  assert.equal(m.getHours(), 12);
  assert.equal(m.getDate(), 31);
  assert.equal(m.getMonth(), 6);
  assert.equal(meioDiaLocal('não é data'), null);
});

test('dias vizinhos continuam podendo ter fases diferentes — a âncora não achatou nada', () => {
  const nomes = new Set();
  for (let i = 0; i < 30; i++) nomes.add(faseDoDia(new Date(Date.now() + i * DIA_MS), 'pt').name);
  assert.ok(nomes.size >= 4, `em 30 dias deveria haver várias fases, vieram ${nomes.size}`);
});
