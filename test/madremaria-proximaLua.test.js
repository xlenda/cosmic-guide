// Portao da UNICA urgencia que este produto aceita.
//
// lib/proximaLua.js escreve a frase que aparece no ultimo card da leitura
// profunda e no paywall que vem logo depois dele. Ela e o argumento mais forte
// das duas telas — e o unico prazo do app inteiro — exatamente porque nao e
// fabricada: e uma efemeride com dia e hora, conferivel em qualquer calendario
// do mundo.
//
// O QUE ESTE ARQUIVO IMPEDE, e nesta ordem de gravidade:
//
//   1. FABRICAR CEU. Sem efemeride, a funcao tem de devolver `null` para as duas
//      telas nao desenharem nada. O jeito "util" de quebrar isso e obvio e
//      tentador: somar 29,53 dias a hoje e mostrar uma data aproximada. Uma data
//      de lua errada por um dia derruba, sozinha, tudo o que o app diz sobre
//      medir em vez de inventar — e derruba justamente na tela em que ele esta
//      pedindo dinheiro.
//   2. FRASE PELA METADE. Marcador nao interpolado ('{mes}', '{hora}') na tela e
//      pior que linha ausente: parece defeito, e aparece no unico lugar onde o
//      app promete precisao.
//   3. A DATA DIVERGIR DA MEDIDA. A frase tem de bater, campo a campo, com o
//      `instante` que lib/ano.js devolve — nao com um segundo calculo.
import assert from 'node:assert/strict';
import test from 'node:test';

import { _inyectarMotorParaTests as _inyectarCielo, _reiniciarCieloParaTests } from '../madremaria/lib/ceu.js';
import { _reiniciarAnoParaTests, proximaVirada } from '../madremaria/lib/ano.js';
import { proximaLuaNova } from '../madremaria/lib/proximaLua.js';

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];
const SEMANA = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado',
];

test('com efemeride: a frase sai completa, sem marcador aberto', () => {
  const lua = proximaLuaNova(new Date('2026-09-01T12:00:00'));
  assert.ok(lua, 'ha efemeride instalada: a frase tem de existir');
  assert.doesNotMatch(lua.quando, /[{}]/, 'marcador nao interpolado chegou a tela');
  assert.doesNotMatch(lua.nota, /[{}]/);
  assert.match(lua.quando, /\d{1,2}h\d{2}\./);
});

/* A frase nao pode ser um SEGUNDO calculo. Ela e a leitura em voz alta do mesmo
 * `instante` que lib/ano.js mediu — dia, mes, dia da semana e hora conferidos um
 * a um contra ele. Duas contas separadas so precisam divergir uma vez, na virada
 * da lunacao, para a tela se contradizer sozinha. */
test('a frase le a medida de lib/ano.js, e nao uma conta propria', () => {
  const agora = new Date('2026-09-01T12:00:00');
  const lua = proximaLuaNova(agora);
  const medida = proximaVirada(agora).instante;
  assert.ok(lua && medida);

  assert.equal(lua.iso, medida.iso);
  assert.equal(lua.dia, medida.dia);

  const [data, hora] = medida.local.split('T');
  const [ano, mes, dia] = data.split('-').map(Number);
  const [hh, mm] = hora.split(':');

  const civil = new Date(ano, mes - 1, dia, 12, 0, 0);
  const esperada = `${SEMANA[civil.getDay()]}, ${dia} de ${MESES[mes - 1]}, às ${Number(hh)}h${mm}.`;
  assert.equal(lua.quando, esperada);
});

/* O teste que sustenta a doutrina. `_inyectarCielo(false)` apaga o ceu inteiro —
 * lib/ano.js obedece ao gate de lib/ceu.js — e o retorno tem de ser `null`
 * CRAVADO: nao um objeto com data aproximada, nao um objeto com campos vazios,
 * nao uma frase dizendo "por volta de". As duas telas conferem `if (lua)` e nao
 * desenham nada; um objeto qualquer aqui viraria caixa com texto quebrado la. */
test('sem efemeride: null, e nunca uma data aproximada', () => {
  _inyectarCielo(false);
  _reiniciarAnoParaTests();
  try {
    assert.equal(proximaLuaNova(new Date('2026-09-01T12:00:00')), null);
  } finally {
    _reiniciarCieloParaTests();
    _reiniciarAnoParaTests();
  }
});

test('instante invalido nao vira a lua de hoje: null', () => {
  assert.equal(proximaLuaNova('nao e uma data'), null);
});
