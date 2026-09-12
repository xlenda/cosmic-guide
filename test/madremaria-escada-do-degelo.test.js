// A ESCADA DO DEGELO (11/09) — as missoes de contato em ORDEM.
//
// As 105 missoes que pedem acao com a outra pessoa nao sao equivalentes: uma
// frase gentil num post publico e um risco; o convite com hora e lugar e outro.
// Entregues fora de ordem, o convite chega antes de o canal ter reaberto — e
// cai no vazio. A escada as ordena em nove degraus, e o motor do dia usa o
// degrau da pessoa como TETO.
//
// O QUE SE VIGIA AQUI:
//   · toda missao de contato tem degrau, e nenhuma missao interna tem;
//   · o motor nunca entrega acima do teto, e entrega abaixo (gesto leve pode
//     repetir);
//   · CONTATO DURO continua intocado: quem esta sem contato nao recebe nenhuma
//     das 105, com escada ou sem escada, em nenhum degrau;
//   · sobe so quem CUMPRE, uma vez por dia, e nunca alem do ultimo degrau;
//   · nao existe descer por castigo — so o recuo que ela pede;
//   · a chave nova esta no Apagar tudo E na Privacidade (regra da casa).
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { DEGRAUS_DA_ESCADA, DEGRAU_POR_MISSAO, degrauDaMissao } from '../madremaria/datos/escada.js';
import { MISSOES_POR_CAPITULO } from '../madremaria/datos/missoes365.js';
import { missaoDoDia } from '../madremaria/lib/missaoDoDia.js';

/* FUSAO COSMIC GUIDE: o pipeline de teste do Cosmic (@babel/register +
 * babel-preset-expo) transpila para CommonJS com alvo Hermes, que rejeita
 * `import.meta`. __dirname existe nesse alvo, entao a mesma URL base sai dele:
 * mesma semantica, mesmo arquivo lido. */
const __RAIZ_URL = require('node:url').pathToFileURL(__dirname + '/').href;

const ler = (rel) => readFileSync(new URL(rel, __RAIZ_URL), 'utf8');
const TODAS = Object.values(MISSOES_POR_CAPITULO).flat();
const CONTATO = TODAS.filter((m) => m.precisaContato);
const INTERNAS = TODAS.filter((m) => !m.precisaContato);

test('toda missao de contato tem degrau, e nenhuma interna tem', () => {
  const semDegrau = [...new Set(CONTATO.filter((m) => !DEGRAU_POR_MISSAO[m.titulo]).map((m) => m.titulo))];
  assert.deepEqual(semDegrau, [], 'missao de contato fora da escada: ela sairia em qualquer ordem');

  // As que se completam sozinhas nao entram na escada: o trabalho interno nao
  // tem degrau, e por isso sai em qualquer dia.
  const internasComDegrau = INTERNAS.filter((m) => DEGRAU_POR_MISSAO[m.titulo]).map((m) => m.titulo);
  assert.deepEqual(internasComDegrau, [], 'missao interna ganhou degrau — a escada so governa o contato');

  for (const n of Object.values(DEGRAU_POR_MISSAO)) {
    assert.ok(Number.isInteger(n) && n >= 1 && n <= DEGRAUS_DA_ESCADA, `degrau fora da faixa: ${n}`);
  }
  assert.equal(degrauDaMissao({ titulo: 'nao existe' }), 0);
  assert.equal(degrauDaMissao(null), 0);
});

test('os nove degraus estao povoados, do mais leve ao de coragem', () => {
  const porDegrau = {};
  for (const n of Object.values(DEGRAU_POR_MISSAO)) porDegrau[n] = (porDegrau[n] || 0) + 1;
  for (let n = 1; n <= DEGRAUS_DA_ESCADA; n += 1) {
    assert.ok(porDegrau[n] > 0, `degrau ${n} vazio — a escada teria um buraco`);
  }
  // O convite e o erro assumido sao o topo; a reacao num post e o piso.
  assert.equal(DEGRAU_POR_MISSAO['Convite de dia claro'], 9);
  assert.equal(DEGRAU_POR_MISSAO['O erro com nome e sobrenome'], 9);
  assert.equal(DEGRAU_POR_MISSAO['Uma frase gentil no post'], 1);
  assert.equal(DEGRAU_POR_MISSAO['Reacao de um toque'] ?? DEGRAU_POR_MISSAO['Reação de um toque'], 1);
});

test('o motor nunca entrega acima do teto, e sem degrau se comporta como antes', () => {
  const respostas = { hoy: 'me-escribe-a-veces' }; // contato aberto
  const dias = [];
  for (let d = 1; d <= 28; d += 1) dias.push(`2026-09-${String(d).padStart(2, '0')}`);

  for (const teto of [1, 3, 5, 9]) {
    for (const dia of dias) {
      for (let lua = 1; lua <= 13; lua += 1) {
        const m = missaoDoDia(dia, lua, respostas, teto);
        if (!m) continue;
        const d = degrauDaMissao(m);
        assert.ok(d <= teto, `${dia} lua ${lua}: missao "${m.titulo}" (degrau ${d}) acima do teto ${teto}`);
      }
    }
  }

  // Sem degrau informado, nada filtra: e o comportamento anterior, intacto.
  const semTeto = missaoDoDia('2026-09-28', 7, respostas);
  const comTeto = missaoDoDia('2026-09-28', 7, respostas, 9);
  assert.ok(semTeto && comTeto);
});

test('CONTATO DURO continua intocado: nenhuma das 105 sai, em nenhum degrau', () => {
  const titulosDeContato = new Set(CONTATO.map((m) => m.titulo));
  for (const hoy of ['cero-contacto', 'le-escribi-no-responde', 'bloqueo']) {
    for (let d = 1; d <= 28; d += 1) {
      const dia = `2026-09-${String(d).padStart(2, '0')}`;
      for (let lua = 1; lua <= 13; lua += 1) {
        for (const teto of [undefined, 1, 5, 9]) {
          const m = missaoDoDia(dia, lua, { hoy }, teto);
          if (!m) continue;
          assert.ok(!m.precisaContato, `${hoy} ${dia} lua ${lua}: recebeu "${m.titulo}", que pede contato`);
          assert.ok(!titulosDeContato.has(m.titulo), `${hoy}: "${m.titulo}" e da escada`);
        }
      }
    }
  }
});

test('sobe so quem cumpre, uma vez por dia, e nunca alem do ultimo', async () => {
  const { _inyectarAlmacenParaTests, _reiniciarParaTests } = await import('../madremaria/lib/almacen.js');
  const disco = new Map();
  _inyectarAlmacenParaTests({
    getItem: async (k) => (disco.has(k) ? disco.get(k) : null),
    setItem: async (k, v) => { disco.set(k, v); },
    removeItem: async (k) => { disco.delete(k); },
  });
  try {
    const { cumpriuNaEscada, degrauDeHoje, lerEscada, recuar, normalizarDegrau } = await import('../madremaria/lib/escada.js');

    assert.equal(await degrauDeHoje(), 1, 'quem nunca cumpriu nada comeca no primeiro degrau');

    const leve = CONTATO.find((m) => DEGRAU_POR_MISSAO[m.titulo] === 1);
    const r1 = await cumpriuNaEscada('2026-09-11', leve);
    assert.equal(r1.subiu, true);
    assert.equal(r1.degrau, 2);

    // Duas vezes no mesmo dia nao sobe duas vezes.
    const r2 = await cumpriuNaEscada('2026-09-11', leve);
    assert.equal(r2.subiu, false);
    assert.equal(r2.degrau, 2);

    // Missao INTERNA nao move a escada: o trabalho interno e metade do
    // caminho, mas nao e o que abre a proxima porta.
    const r3 = await cumpriuNaEscada('2026-09-12', INTERNAS[0]);
    assert.equal(r3.subiu, false);
    assert.equal(r3.degrau, 2);

    // O recuo e dela, e nunca passa do primeiro.
    const r4 = await recuar();
    assert.equal(r4.degrau, 1);
    const r5 = await recuar();
    assert.equal(r5.recuou, false);
    assert.equal(r5.degrau, 1);

    // Lixo no disco vira o primeiro degrau, nunca erro.
    disco.set('mm-hr.escada', '{quebrado');
    assert.equal((await lerEscada()).degrau, 1);
    disco.set('mm-hr.escada', JSON.stringify({ degrau: 99 }));
    assert.equal((await lerEscada()).degrau, DEGRAUS_DA_ESCADA);
    disco.set('mm-hr.escada', JSON.stringify({ degrau: -5 }));
    assert.equal((await lerEscada()).degrau, 1);
    assert.equal(normalizarDegrau('abc'), 1);
  } finally {
    _reiniciarParaTests();
  }
});

test('a chave nova esta no Apagar tudo E na Privacidade, no mesmo commit', () => {
  const ajustes = ler('../madremaria/screens/AjustesScreen.js');
  const lista = ajustes.slice(ajustes.indexOf('CLAVES_HILO_ROJO'), ajustes.indexOf(']);', ajustes.indexOf('CLAVES_HILO_ROJO')));
  assert.match(lista, /'escada'/, "a chave 'escada' nao sai no Apagar tudo");

  const textos = ler('../madremaria/datos/textos.js');
  const priv = textos.slice(textos.indexOf("'privacidad.guarda.lineas'"), textos.indexOf("'privacidad.guarda.pie'"));
  assert.match(priv, /degrau/i, 'a Privacidade nao declara o que a escada guarda');
});

test('a tela do dia le o degrau e sobe ao cumprir', () => {
  const tela = ler('../madremaria/screens/PlanoScreen.js');
  assert.match(tela, /from '\.\.\/lib\/escada'/);
  assert.match(tela, /missaoDoDia\(dia, lunacao, respuestas \|\| \{\}, degrau\)/, 'a tela nao passa o degrau ao motor');
  assert.match(tela, /if \(mudanca && mudanca\.cumprida\) \{/, 'a tela sobe sem ser por cumprimento');
  assert.match(tela, /cumpriuNaEscada\(dia, missao\)/);
  // Aceitar nao pode subir: o que abre a porta e o ato feito.
  assert.doesNotMatch(tela, /mudanca\.aceita[\s\S]{0,80}cumpriuNaEscada/);
});
