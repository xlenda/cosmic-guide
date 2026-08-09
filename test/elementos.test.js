// Elementos com % — a única porcentagem que a doutrina permite: a que sai de
// uma conta refazível (10 planetas, cada um num signo, cada signo num
// elemento, % = contagem × 10). Estes testes travam três coisas:
//
//   1. o MAPEAMENTO signo→elemento passa pela mesma SIGNS de lib/signs.js
//      (nada de tabela paralela que possa divergir);
//   2. a conta fecha SEMPRE — contagem soma 10, pct soma 100, todo planeta
//      aparece em exatamente um elemento;
//   3. "nunca fabricar" — sem data, ou com data inválida, é null e ponto.
//
// Os valores travados abaixo saíram do PRÓPRIO motor (astronomy-engine é
// matemática pura, determinística: rodou uma vez, vale pra sempre). Conferido
// por fora: em 09/01/2026 Sol/Mercúrio/Vênus/Marte estão em Capricórnio
// (longitudes ~282–290°, faixa 270–300 = índice 9) e Plutão em Aquário — o
// stellium de Capricórnio é notícia pública de astronomia do período.
const test = require('node:test');
const assert = require('node:assert/strict');

const { distribuicaoDeElementos, ELEMENTOS } = require('../lib/elementos.js');

test('2026-01-09: Sol a ~289° é Capricórnio — e Capricórnio conta pra Terra', () => {
  // O mapeamento índice = floor(longitude/30): 289° → índice 9 → Capricórnio,
  // cujo element em SIGNS é 'terra'. Se alguém trocar a tabela ou o índice,
  // o Sol deste dia muda de time e este teste grita.
  const r = distribuicaoDeElementos('2026-01-09');
  assert.ok(r, 'data válida com motor presente não pode dar null');
  assert.ok(r.planetasPorElemento.terra.includes('Sol'), 'Sol de 09/01/2026 é Capricórnio → terra');
  // O céu inteiro do dia, travado (5 em Terra, 3 em Água, 2 em Ar, 0 em Fogo):
  assert.equal(r.contagem.terra, 5);
  assert.equal(r.contagem.agua, 3);
  assert.equal(r.contagem.ar, 2);
  assert.equal(r.contagem.fogo, 0);
  assert.equal(r.pct.terra, 50, 'pct é contagem × 10 — 5 em Terra = 50%');
});

test('a conta fecha: contagem soma 10, pct soma 100, cada planeta em um só elemento', () => {
  const r = distribuicaoDeElementos('1990-05-15');
  assert.ok(r);
  assert.equal(r.total, 10, 'são os 10 planetas clássicos, sempre');
  const somaContagem = ELEMENTOS.reduce((s, el) => s + r.contagem[el], 0);
  const somaPct = ELEMENTOS.reduce((s, el) => s + r.pct[el], 0);
  assert.equal(somaContagem, 10, 'todo planeta cai em exatamente um elemento');
  assert.equal(somaPct, 100, '10 planetas × 10 pontos: a soma é 100 sem arredondar');
  // planetasPorElemento é a MESMA conta, planeta a planeta:
  const listados = ELEMENTOS.reduce((s, el) => s + r.planetasPorElemento[el].length, 0);
  assert.equal(listados, 10, 'a lista de recibo bate com a contagem');
  for (const el of ELEMENTOS) {
    assert.equal(r.planetasPorElemento[el].length, r.contagem[el], `${el}: lista e contagem divergem`);
  }
});

test('sem data ou com data inválida: null, nunca um céu inventado', () => {
  assert.equal(distribuicaoDeElementos(null), null);
  assert.equal(distribuicaoDeElementos(''), null);
  assert.equal(distribuicaoDeElementos('2024-02-30'), null, '30 de fevereiro não existe');
  assert.equal(distribuicaoDeElementos('nao-e-data'), null);
});

test('dominante: um líder claro vem como string (1990-05-15 → terra, 6 de 10)', () => {
  // Resultado real do motor, olhado e travado: Sol, Lua, Mercúrio, Saturno,
  // Urano e Netuno em signos de Terra nesse dia.
  const r = distribuicaoDeElementos('1990-05-15');
  assert.equal(r.dominante, 'terra');
  assert.equal(r.contagem.terra, 6);
  assert.deepEqual(
    [...r.planetasPorElemento.terra].sort(),
    ['Lua', 'Mercúrio', 'Netuno', 'Saturno', 'Sol', 'Urano'].sort()
  );
});

test('dominante: empate vem como ARRAY dos empatados, na ordem fixa dos elementos', () => {
  // 11/11/1995: 4 em Fogo e 4 em Água — a regra documentada em lib/elementos.js
  // devolve os dois, sem inventar desempate (desempate seria leitura, não conta).
  const r = distribuicaoDeElementos('1995-11-11');
  assert.equal(r.contagem.fogo, 4);
  assert.equal(r.contagem.agua, 4);
  assert.ok(Array.isArray(r.dominante), 'empate no topo tem que vir como array');
  assert.deepEqual(r.dominante, ['fogo', 'agua'], 'ordem fixa: fogo/terra/ar/agua');
});
