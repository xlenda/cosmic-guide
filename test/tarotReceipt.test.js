const test = require('node:test');
const assert = require('node:assert/strict');
const { buildTarotReceipt, tarotReceiptPack } = require('../lib/tarotReceipt.js');

test('recibo mostra somente os ingredientes verificáveis da leitura', () => {
  const receipt = buildTarotReceipt({
    themeLabel: 'Amor',
    focusLabel: 'Novos vínculos',
    spreadLabel: 'Situação, tensão e próximo passo',
    signLabel: 'Áries',
    question: 'NÃO PODE APARECER',
    cards: [{ name: 'A Lua' }, { name: 'O Sol' }, { name: 'A Estrela' }],
  });
  const visible = JSON.stringify(receipt);
  assert.match(visible, /Amor/);
  assert.match(visible, /A Lua/);
  assert.ok(!visible.includes('NÃO PODE APARECER'));
});

test('recibo assume honestamente quando não existe lente de signo', () => {
  const receipt = buildTarotReceipt({ themeLabel: 'Energia', cards: [] }, 'pt');
  assert.equal(receipt.rows.find((row) => row.id === 'sign').value, 'Sem lente de signo');
});

test('packs PT/ES/EN têm as mesmas chaves', () => {
  const keys = Object.keys(tarotReceiptPack('pt')).sort();
  for (const lang of ['pt', 'es', 'en']) {
    assert.deepEqual(Object.keys(tarotReceiptPack(lang)).sort(), keys);
  }
});
