// Portao do armazenamento — e um teste de MUTACAO, nao de caminho feliz.
//
// Os tres comportamentos abaixo sao exatamente os que uma refatoracao futura
// desfaz sem perceber, porque o codigo continua "funcionando" nos dois casos:
//   1. o fallback mora no CATCH, nao no `if (!A)`;
//   2. a memoria e escrita TAMBEM no caminho feliz;
//   3. leerSeguro NUNCA lanca.
// Um teste que so grava e le com storage saudavel passa com as tres regras
// quebradas. Por isso aqui o storage e injetado e programado para estourar.
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  _inyectarAlmacenParaTests,
  _reiniciarParaTests,
  borrarSeguro,
  guardarSeguro,
  leerSeguro,
} from '../madremaria/lib/almacen.js';

// Storage falso com dois botoes: `fallaLectura` e `fallaEscritura`. Registra
// toda chave que recebe, para que o teste do prefixo observe o endereco real.
function almacenFalso({ fallaLectura = false, fallaEscritura = false } = {}) {
  const disco = new Map();
  const clavesVistas = [];
  return {
    disco,
    clavesVistas,
    async getItem(k) {
      clavesVistas.push(k);
      if (fallaLectura) throw new Error('SecurityError simulado');
      return disco.has(k) ? disco.get(k) : null;
    },
    async setItem(k, v) {
      clavesVistas.push(k);
      if (fallaEscritura) throw new Error('QuotaExceededError simulado');
      disco.set(k, v);
    },
    async removeItem(k) {
      clavesVistas.push(k);
      if (fallaEscritura) throw new Error('QuotaExceededError simulado');
      disco.delete(k);
    },
  };
}

test('caminho feliz: grava no disco e le de volta', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  assert.equal(await guardarSeguro('perfil', 'ana'), true);
  assert.equal(await leerSeguro('perfil'), 'ana');
  assert.equal(falso.disco.get('mm-hr.perfil'), 'ana');
});

test('o prefixo mm-hr. e aplicado UMA vez, e o chamador passa a chave nua', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await guardarSeguro('hilo', '3');
  assert.deepEqual(falso.clavesVistas, ['mm-hr.hilo'], 'a chave de disco tem de ser mm-hr.hilo');

  // FUSAO COSMIC GUIDE: o prefixo virou 'mm-hr.' porque os dois apps dividem o
  // mesmo AsyncStorage; o ISOLAMENTO e o motivo do prefixo existir, e este e o
  // teste que o guarda. Trocar o prefixo no modulo sem trocar aqui derruba isto.
  //
  // O contrato: quem chama passa a chave NUA. Passar a chave ja prefixada e
  // erro do chamador e produz mm-hr.mm-hr.hilo — este teste documenta isso para
  // que ninguem "conserte" o modulo tornando o prefixo idempotente, o que
  // criaria o caso ambiguo de uma chave legitima comecando com mm-hr.
  falso.clavesVistas.length = 0;
  await guardarSeguro('mm-hr.hilo', '9');
  assert.deepEqual(falso.clavesVistas, ['mm-hr.mm-hr.hilo']);
});

// MUTACAO 1 — mova o fallback do catch para o `if (!A)` e este teste falha.
test('leitura que estoura cai em memoria e NAO lanca', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await guardarSeguro('perfil', 'ana'); // grava com disco saudavel
  falso.getItem = async () => {
    throw new Error('SecurityError simulado');
  };

  const valor = await leerSeguro('perfil');
  assert.equal(valor, 'ana', 'devia ter vindo da memoria depois do disco estourar');
});

// MUTACAO 2 — tire o `_memoria.set` do caminho feliz e este teste falha.
test('escrita no caminho feliz TAMBEM vai para a memoria', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await guardarSeguro('perfil', 'ana'); // disco saudavel: so o disco bastaria
  falso.getItem = async () => {
    throw new Error('disco morreu depois');
  };

  assert.equal(
    await leerSeguro('perfil'),
    'ana',
    'sem escrita em memoria no caminho feliz, este valor estaria perdido'
  );
});

// MUTACAO 3 — troque o catch de guardarSeguro por um throw e este teste falha.
test('escrita que estoura devolve false, nao lanca, e o valor continua legivel', async () => {
  const falso = almacenFalso({ fallaEscritura: true });
  _inyectarAlmacenParaTests(falso);

  const ok = await guardarSeguro('perfil', 'ana');
  assert.equal(ok, false, 'devia sinalizar que nao foi ao disco');
  assert.equal(await leerSeguro('perfil'), 'ana', 'e mesmo assim continuar legivel na sessao');
});

test('uma vez que o disco quebra, a sessao inteira para de insistir', async () => {
  const falso = almacenFalso({ fallaLectura: true });
  _inyectarAlmacenParaTests(falso);

  await leerSeguro('perfil'); // primeira falha levanta a flag
  const antes = falso.clavesVistas.length;

  await leerSeguro('perfil');
  await leerSeguro('hilo');

  assert.equal(falso.clavesVistas.length, antes, 'nao devia ter tocado no disco de novo');
});

test('leerSeguro devolve null para chave que nunca existiu, sem lancar', async () => {
  _inyectarAlmacenParaTests(almacenFalso());
  assert.equal(await leerSeguro('nunca-gravada'), null);
});

test('sem storage nenhum, tudo continua funcionando em memoria', async () => {
  _inyectarAlmacenParaTests(null);

  assert.equal(await guardarSeguro('perfil', 'ana'), false);
  assert.equal(await leerSeguro('perfil'), 'ana');
  assert.equal(await borrarSeguro('perfil'), false);
  assert.equal(await leerSeguro('perfil'), null);
});

test('borrar remove do disco e da memoria', async () => {
  const falso = almacenFalso();
  _inyectarAlmacenParaTests(falso);

  await guardarSeguro('perfil', 'ana');
  assert.equal(await borrarSeguro('perfil'), true);
  assert.equal(falso.disco.has('mm-hr.perfil'), false);
  assert.equal(await leerSeguro('perfil'), null);

  _reiniciarParaTests();
});
