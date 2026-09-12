// UM DIA, UM ATO — o contrato do calendário (lib/atoDoDia.js, 03/09).
//
// "cada dia tem que ser uma coisa": o motor decide o TIPO do dia, puro e
// determinístico. O que se vigia aqui:
//   · a moldura da semana: sexta = ritmo, sábado = encontro, domingo = gesto;
//   · seg–qui só saem dos três tipos de semana (gesto/missão/pergunta);
//   · NUNCA dois dias vizinhos com o mesmo tipo — variedade é o produto;
//   · determinismo absoluto (mesma data, mesmo ato) e data podre sem lançar;
//   · a corrente (lib/corrente.js) guarda e devolve a deixa LITERAL.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { ATOS, atoDoDia, diaSeguinte } from '../madremaria/lib/atoDoDia.js';
import { t } from '../madremaria/datos/textos.js';

function diasDesde(inicio, n) {
  const dias = [];
  let d = inicio;
  for (let i = 0; i < n; i += 1) {
    dias.push(d);
    d = diaSeguinte(d);
  }
  return dias;
}

test('a moldura da semana: sexta ritmo, sabado encontro, domingo gesto', () => {
  // 2026-09-04 é sexta; 05 sábado; 06 domingo (fatos de calendário).
  assert.equal(atoDoDia('2026-09-04'), 'ritmo');
  assert.equal(atoDoDia('2026-09-05'), 'encontro');
  assert.equal(atoDoDia('2026-09-06'), 'gesto');
  // E vale para TODAS as sextas/sábados/domingos de um ano inteiro.
  for (const dia of diasDesde('2026-01-01', 365)) {
    const ds = new Date(dia + 'T00:00:00Z').getUTCDay();
    const ato = atoDoDia(dia);
    if (ds === 5) assert.equal(ato, 'ritmo', dia);
    if (ds === 6) assert.equal(ato, 'encontro', dia);
    if (ds === 0) assert.equal(ato, 'gesto', dia);
    if (ds >= 1 && ds <= 4) {
      assert.ok(
        ['gesto', 'missao', 'pergunta'].includes(ato),
        `${dia} (${ds}) saiu do trio da semana: ${ato}`
      );
    }
    assert.ok(ATOS.includes(ato), dia);
  }
});

test('nunca dois dias vizinhos com o mesmo ato — 800 dias seguidos', () => {
  let anterior = null;
  for (const dia of diasDesde('2026-01-01', 800)) {
    const ato = atoDoDia(dia);
    assert.notEqual(ato, anterior, `${dia} repetiu o ato de ontem (${ato})`);
    anterior = ato;
  }
});

test('deterministico e sem relogio: mesma data, mesmo ato; data podre nao lanca', () => {
  assert.equal(atoDoDia('2026-09-08'), atoDoDia('2026-09-08'));
  assert.equal(atoDoDia('podre'), 'gesto');
  assert.equal(diaSeguinte('2026-12-31'), '2027-01-01');
  assert.equal(diaSeguinte('podre'), 'podre');
});

test('os tres tipos da semana aparecem toda semana util', () => {
  // Em qualquer janela seg-qui, o trio cobre os 3 tipos (um deles repete):
  // sem isso uma semana inteira poderia passar sem missão ou sem pergunta.
  const dias = diasDesde('2026-01-05', 7 * 8); // 8 semanas a partir de uma segunda
  for (let s = 0; s < 8; s += 1) {
    const semana = dias.slice(s * 7, s * 7 + 4).map(atoDoDia); // seg-qui
    for (const tipo of ['gesto', 'missao', 'pergunta']) {
      assert.ok(semana.includes(tipo), `semana ${s} sem ${tipo}: ${semana.join(',')}`);
    }
  }
});

test('cada ato tem nome publico no banco de textos, sem promessa', () => {
  for (const ato of ATOS) {
    const nome = t('plano.ato.' + ato);
    assert.ok(nome && !nome.startsWith('plano.ato.'), `sem texto para ${ato}`);
    assert.doesNotMatch(nome, /volta|destino|sorte|garant/i, nome);
  }
});
