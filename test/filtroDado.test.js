// O PORTÃO DE lib/filtroDado.js — a lei "NUNCA FABRICAR" virada em função.
//
// Este arquivo existe porque o cabeçalho de lib/filtroDado.js prometia, desde
// 12/09/2026, "teste por mutação em test/filtroDado.test.js" — e esse arquivo
// nunca existiu. A cobertura funcional existia (test/diagramacaoPecas.test.js
// exercita temValor e apenasReais), mas quem abrisse o módulo da lei, fosse
// procurar o portão pelo nome escrito ali e não achasse, concluiria que a lei
// não tem guarda. Num módulo que decide se um número inventado entra ou não na
// tela, essa dúvida é cara demais pra ficar em aberto.
//
// O QUE AQUI SE SEGURA, e que os testes das peças não seguram: o caso 3 da
// regra — "não tem valor nem convite, a linha SOME". É o único caso em que a
// ausência de código correto produz uma tela plausível e errada: uma célula
// com traço, um "0", um "não informado". A pessoa lê um dado que não existe.
const test = require('node:test');
const assert = require('node:assert');

const { temValor, apenasReais } = require('../lib/filtroDado.js');

test('0 e false são DADOS, não ausência de dado', () => {
  // O bug clássico do `if (!valor)`. Zero acertos é um dado; "false" numa
  // coluna de sim/não é um dado. Tratá-los como vazio APAGA informação real.
  assert.strictEqual(temValor(0), true, 'zero é dado');
  assert.strictEqual(temValor(false), true, 'false é dado');
  assert.strictEqual(temValor(''), false);
  assert.strictEqual(temValor('   '), false, 'só espaço não é dado');
  assert.strictEqual(temValor(null), false);
  assert.strictEqual(temValor(undefined), false);
  // NaN e Infinity não são número exibível: viraram "NaN" na tela.
  assert.strictEqual(temValor(NaN), false, 'NaN na célula é fabricação visual');
  assert.strictEqual(temValor(Infinity), false);
});

test('sem valor E sem convite, a linha SOME — não vira traço nem zero', () => {
  const saida = apenasReais([
    { chave: 'com', rotulo: 'Tem', valor: 7 },
    { chave: 'sem', rotulo: 'Não tem' }, // nem valor nem convite
    { chave: 'vazio', rotulo: 'Vazio', valor: '   ' },
    { chave: 'nulo', rotulo: 'Nulo', valor: null, convite: '' },
  ]);
  assert.deepStrictEqual(
    saida.map((x) => x.chave),
    ['com'],
    'só a linha com dado real sobrevive: as outras somem, não viram "—"',
  );
});

test('sem valor mas com convite, a linha aparece MARCADA como pendente', () => {
  const saida = apenasReais([
    { chave: 'a', valor: 0 },
    { chave: 'b', convite: 'Adicione sua data' },
  ]);
  assert.strictEqual(saida.length, 2);
  assert.strictEqual(saida[0].pendente, false, 'valor real não é pendente');
  assert.strictEqual(saida[1].pendente, true, 'convite tem de vir marcado');
  // `pendente` é o que permite a peça pintar apagado em vez de fingir dado.
  assert.ok('pendente' in saida[0] && 'pendente' in saida[1]);
});

test('entrada suja não derruba e não inventa linha', () => {
  assert.deepStrictEqual(apenasReais(null), []);
  assert.deepStrictEqual(apenasReais(undefined), []);
  assert.deepStrictEqual(apenasReais('nao e array'), []);
  assert.deepStrictEqual(apenasReais([null, undefined, 42, 'texto']), []);
});

test('o filtro não altera o item original (a peça recebe cópia)', () => {
  const original = { chave: 'x', valor: 3 };
  const saida = apenasReais([original]);
  assert.strictEqual(original.pendente, undefined, 'não escreve no objeto de quem chamou');
  assert.strictEqual(saida[0].valor, 3);
});
