// A LUA NO SIGNO DELA + A APOSTA DO CORAÇÃO (04/09).
//
// Lua no signo: trânsito MEDIDO (astronomy-engine, zodíaco tropical) — o
// teste confere o ritmo físico (2-4 dias por mês, em blocos contíguos) e o
// determinismo. Aposta: revela SÓ contra dia posterior, acerto conta, erro
// não vira número, e as 9 frases descrevem sem julgar.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { apostarAmanha, estadoDaAposta, revelarAposta } from '../madremaria/lib/coracao.js';
import { luaNoSignoDela, signoDaLuaEm } from '../madremaria/lib/luaNoSigno.js';
import { SIGNOS } from '../madremaria/lib/signo.js';
import { t } from '../madremaria/datos/textos.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

function diasDe(inicio, n) {
  const out = [];
  let d = new Date(inicio + 'T12:00:00Z').getTime();
  for (let i = 0; i < n; i += 1) {
    out.push(new Date(d).toISOString().slice(0, 10));
    d += 86400000;
  }
  return out;
}

test('a lua percorre o zodiaco no ritmo fisico: 2-4 dias por signo, em bloco', () => {
  const dias = diasDe('2026-09-01', 60);
  const serie = dias.map(signoDaLuaEm);
  for (const s of serie) assert.ok(SIGNOS.some((x) => x.nome === s), 'signo desconhecido: ' + s);
  // Conta os blocos contíguos: cada um dura 2-4 dias (amostrado ao meio-dia).
  let atual = serie[0];
  let tam = 1;
  for (let i = 1; i < serie.length; i += 1) {
    if (serie[i] === atual) {
      tam += 1;
    } else {
      assert.ok(tam >= 1 && tam <= 4, `bloco de ${atual} durou ${tam} dias`);
      atual = serie[i];
      tam = 1;
    }
  }
  // Determinismo: mesma data, mesmo signo.
  assert.equal(signoDaLuaEm('2026-09-26'), signoDaLuaEm('2026-09-26'));
  // Sem signo dado, nunca ha dia especial; data podre nao lanca.
  assert.equal(luaNoSignoDela('2026-09-26', null), false);
  assert.equal(signoDaLuaEm('podre'), null);
});

test('a aposta revela SO contra dia posterior, conta o acerto e nao expira', async () => {
  await apostarAmanha('2026-09-04', 'pesado');
  // Revelar no MESMO dia da aposta: nada (a de hoje espera).
  assert.equal(await revelarAposta('2026-09-04', 'leve'), null);
  // Dias depois (faltou o dia 05): revela contra o proximo registro, sem drama.
  const r = await revelarAposta('2026-09-07', 'leve');
  assert.ok(r);
  assert.equal(r.apostou, 'pesado');
  assert.equal(r.chegou, 'leve');
  assert.equal(r.acertos, 0, 'erro de aposta virou numero');
  // A revelacao persiste para a reabertura, e a aposta foi consumida.
  const e = await estadoDaAposta();
  assert.equal(e.aposta, null);
  assert.equal(e.revelada.dia, '2026-09-07');
  // Acerto conta.
  await apostarAmanha('2026-09-07', 'neutro');
  const r2 = await revelarAposta('2026-09-08', 'neutro');
  assert.equal(r2.acertos, 1);
});

test('as 9 frases da aposta descrevem e nao julgam', () => {
  for (const a of ['leve', 'neutro', 'pesado']) {
    for (const c of ['leve', 'neutro', 'pesado']) {
      const frase = t(`coracao.aposta.${a}.${c}`);
      assert.ok(frase && !frase.startsWith('coracao.'), `sem frase ${a}.${c}`);
      assert.doesNotMatch(
        frase,
        /melhor|pior|errou|erro|acertou em|falhou|fracass|culpa|deveria/i,
        `${a}.${c}: ${frase}`
      );
    }
  }
  // A copy da lua descreve o ceu, nunca sorte/destino.
  const lua = t('plano.luaNoSigno', { signo: 'Touro' });
  assert.doesNotMatch(lua, /sorte|destino|energia|favor/i, lua);
});

test('o mapa marca SEU DIA so no futuro, e o plano anuncia no cabecalho', () => {
  const MAPA = readFileSync(new URL('../madremaria/screens/MapaDoAnoScreen.js', __RAIZ_URL), 'utf8');
  assert.match(MAPA, /casa\.estado === 'futuro' && luaNoSignoDela/);
  const PLANO = readFileSync(new URL('../madremaria/screens/PlanoScreen.js', __RAIZ_URL), 'utf8');
  assert.match(PLANO, /signoDela && luaNoSignoDela\(dia, signoDela\)/);
  // E a aposta de hoje NUNCA se revela no ato: o gate vive na lib.
  const CORACAO = readFileSync(new URL('../madremaria/lib/coracao.js', __RAIZ_URL), 'utf8');
  assert.match(CORACAO, /estado\.aposta\.feitaEm >= dia\) return null/);
});
