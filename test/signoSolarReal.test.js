// O SIGNO É ONDE O SOL ESTÁ, NÃO O QUE A TABELA DIZ.
//
// Até 31/07/2026 signoFromDate decidia o signo por tabela fixa de calendário.
// A auditoria de tradição varreu 1950-2030 com o próprio astronomy-engine que o
// app já usa pra Lua e Ascendente e achou 293 dias errados em 29.585 (0,99%) —
// sempre nas fronteiras, que é justamente onde a pessoa mais presta atenção.
// 23/10 errava em 44 dos 81 anos; 21/06 em 42; 20/01 em 38.
//
// Ptolomeu, Tetrabiblos I.22: os signos começam nos equinócios e solstícios, que
// são INSTANTES, não datas. O equinócio de março cai entre 19 e 21 conforme o
// ano bissexto — nenhuma tabela fixa acerta sempre.
//
// Estes testes travam as duas metades: os casos que a tabela errava passam a
// acertar, E o meio dos signos continua exatamente igual (a correção é
// cirúrgica, não pode mexer em quem já estava certo).
const test = require('node:test');
const assert = require('node:assert/strict');

const { signoFromDate, SIGNS } = require('../lib/signs.js');

// Casos medidos pela auditoria com a longitude eclíptica real do Sol.
const FRONTEIRAS_QUE_ERRAVAM = [
  { data: '2010-10-23', certo: 'Libra', tabelaDizia: 'Escorpião', lon: 209.98 },
  { data: '1988-01-20', certo: 'Capricórnio', tabelaDizia: 'Aquário', lon: 299.64 },
  { data: '1979-08-23', certo: 'Leão', tabelaDizia: 'Virgem', lon: 149.77 },
];

for (const { data, certo, tabelaDizia, lon } of FRONTEIRAS_QUE_ERRAVAM) {
  test(`${data}: Sol a ${lon}° é ${certo}, não ${tabelaDizia}`, () => {
    assert.equal(
      signoFromDate(data),
      certo,
      `a tabela fixa dizia ${tabelaDizia} — dizer o signo errado é o pior erro possível num app de astrologia`
    );
  });
}

test('o meio de cada signo não mudou — a correção é só nas fronteiras', () => {
  // Uma data bem no miolo de cada signo: aqui tabela e astronomia sempre
  // concordaram, e têm que continuar concordando.
  const MEIOS = [
    ['1990-01-05', 'Capricórnio'],
    ['1990-02-05', 'Aquário'],
    ['1990-03-05', 'Peixes'],
    ['1990-04-05', 'Áries'],
    ['1990-05-05', 'Touro'],
    ['1990-06-05', 'Gêmeos'],
    ['1990-07-05', 'Câncer'],
    ['1990-08-05', 'Leão'],
    ['1990-09-05', 'Virgem'],
    ['1990-10-05', 'Libra'],
    ['1990-11-05', 'Escorpião'],
    ['1990-12-05', 'Sagitário'],
  ];
  for (const [data, esperado] of MEIOS) {
    assert.equal(signoFromDate(data), esperado, `${data} deveria ser ${esperado}`);
  }
});

test('todo dia do ano devolve um signo válido — ninguém pode ficar sem', () => {
  const nomes = new Set(SIGNS.map((s) => s.name));
  const vistos = new Set();
  for (let mes = 1; mes <= 12; mes++) {
    const ultimoDia = new Date(Date.UTC(2024, mes, 0)).getUTCDate();
    for (let dia = 1; dia <= ultimoDia; dia++) {
      const data = `2024-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const s = signoFromDate(data);
      assert.ok(nomes.has(s), `${data} devolveu "${s}", que não é signo`);
      vistos.add(s);
    }
  }
  assert.equal(vistos.size, 12, 'um ano inteiro tem que passar pelos 12 signos');
});

test('a hora move a fronteira — quem nasceu na virada finalmente vê o certo', () => {
  // O Sol entra em Áries no equinócio; em 2024 isso foi em 20/03 às 03:06 UTC.
  // Antes disso ainda é Peixes, depois é Áries. A tabela dava Peixes o dia todo.
  const antes = signoFromDate('2024-03-20', '01:00');
  const depois = signoFromDate('2024-03-20', '10:00');
  assert.equal(antes, 'Peixes', 'antes do equinócio ainda é Peixes');
  assert.equal(depois, 'Áries', 'depois do equinócio já é Áries');
  assert.notEqual(antes, depois, 'a hora precisa importar no dia da virada');
});

test('data inválida devolve null, não um signo inventado', () => {
  assert.equal(signoFromDate(null), null);
  assert.equal(signoFromDate(''), null);
  assert.equal(signoFromDate('2024-02-30'), null, '30 de fevereiro não existe');
  assert.equal(signoFromDate('nao-e-data'), null);
});
