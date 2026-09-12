// A CELULA NOVA DO DIA — frase, missao e coracao (cronogramacao de 01/09).
//
// Provado por mutacao em 01/09, tres vezes: o pulo do contato removido do
// motor da missao, a fila de escrita desligada, e o determinismo trocado por
// indice fixo. Vermelho nas tres.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { FRASES } from '../madremaria/datos/frases.js';
import {
  CAPITULO_POR_LUA,
  MISSOES_FDS,
  MISSOES_POR_CAPITULO,
} from '../madremaria/datos/missoes365.js';
import { HUMORES, placarDaSemana, registrarCoracao } from '../madremaria/lib/coracao.js';
import { fraseDoDia } from '../madremaria/lib/fraseDoDia.js';
import { estadoDaMissao, marcarMissao, missaoDoDia } from '../madremaria/lib/missaoDoDia.js';

const PROIBIDAS = [/vai voltar/i, /garant/i, /alma gêmea/i, /\bdestino\b/i, /%/, /por cento/i];

/* ===================================================================================
   A FRASE DO DIA
   =================================================================================== */

test('o banco de frases existe, e nenhuma frase quebra a doutrina', () => {
  assert.ok(FRASES.length >= 40, 'banco de frases minguou');
  for (const f of FRASES) {
    for (const re of PROIBIDAS) assert.doesNotMatch(f, re, f.slice(0, 50));
  }
});

test('mesma data = mesma frase, datas seguidas = frases diferentes', () => {
  assert.equal(fraseDoDia('2026-09-01'), fraseDoDia('2026-09-01'));
  assert.notEqual(fraseDoDia('2026-09-01'), fraseDoDia('2026-09-02'));
  assert.equal(fraseDoDia('lixo'), null);
});

/* ===================================================================================
   A MISSAO DO DIA
   =================================================================================== */

test('todo pool tem conteudo, e nenhum pool e 100% precisaContato', () => {
  const pools = [...Object.values(MISSOES_POR_CAPITULO), MISSOES_FDS];
  for (const pool of pools) {
    assert.ok(pool.length >= 10, 'pool mirrado');
    const solo = pool.filter((m) => !m.precisaContato);
    assert.ok(solo.length >= 3, 'pool sem missao solo suficiente para o contato duro');
    for (const m of pool) {
      assert.ok(m.titulo && m.acao && m.porque, 'missao com campo vazio');
      for (const re of PROIBIDAS) {
        assert.doesNotMatch(m.titulo + ' ' + m.acao + ' ' + m.porque, re, m.titulo);
      }
    }
  }
  // toda lua 1..13 tem capitulo mapeado
  for (let lua = 1; lua <= 13; lua += 1) {
    assert.ok(MISSOES_POR_CAPITULO[CAPITULO_POR_LUA[lua]], `lua ${lua} sem capitulo`);
  }
});

test('contato duro NUNCA recebe missao que aponta para fora — o ano inteiro', () => {
  const duras = [{ hoy: 'cero-contacto' }, { hoy: 'le-escribi-no-responde' }, { hoy: 'bloqueo' }];
  const base = new Date(Date.UTC(2026, 8, 1));
  for (let n = 0; n < 365; n += 1) {
    const t = new Date(base.getTime() + n * 86400000);
    const dia = t.toISOString().slice(0, 10);
    const lua = 1 + (Math.floor(n / 29) % 13);
    for (const r of duras) {
      const m = missaoDoDia(dia, lua, r);
      assert.ok(m, `dia ${dia} sem missao para contato duro`);
      assert.equal(m.precisaContato, false, `${dia}: missao de contato vazou (${m.titulo})`);
    }
  }
});

test('a missao e deterministica e muda com o dia', () => {
  const a = missaoDoDia('2026-09-02', 1, { hoy: 'hablamos' });
  const b = missaoDoDia('2026-09-02', 1, { hoy: 'hablamos' });
  const c = missaoDoDia('2026-09-03', 1, { hoy: 'hablamos' });
  assert.equal(a.titulo, b.titulo);
  assert.notEqual(a.titulo, c.titulo);
});

test('aceitar e cumprir em sequencia rapida nao se engolem (a fila de escrita)', async () => {
  const dia = '2026-03-15';
  // SEM await entre as duas — e exatamente o toque duplo rapido da tela.
  const p1 = marcarMissao(dia, { aceita: true });
  const p2 = marcarMissao(dia, { cumprida: true });
  await Promise.all([p1, p2]);
  const e = await estadoDaMissao(dia);
  assert.equal(e.aceita, true, 'o aceite foi engolido pela segunda escrita');
  assert.equal(e.cumprida, true);
});

test('marcarMissao sem mudanca devolve false, nunca lanca', async () => {
  assert.equal(await marcarMissao('2026-03-16'), false);
  assert.equal(await marcarMissao('lixo', { aceita: true }), false);
});

/* ===================================================================================
   O CORACAO
   =================================================================================== */

test('o coracao conta a semana de verdade, e trocar de ideia troca o dia', async () => {
  assert.deepEqual([...HUMORES], ['leve', 'neutro', 'pesado']);
  await registrarCoracao('2026-05-11', 'leve');
  await registrarCoracao('2026-05-12', 'pesado');
  await registrarCoracao('2026-05-12', 'leve'); // trocou de ideia
  const p = await placarDaSemana('2026-05-14');
  assert.equal(p.semana.leve, 2);
  assert.equal(p.semana.pesado, 0, 'o humor trocado nao pode contar duas vezes');
  assert.equal(p.semana.registrados, 2);
});
