const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const fs = require('node:fs');
const path = require('node:path');

const mem = new Map();
const failedSetKeys = new Set();
const BONUS_KEY = 'cosmic-reward-bonus-tarot';
const BALANCE_KEY = 'cosmic-tokens-balance';
let bonusWriteBlock = null;

function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(key) {
      await Promise.resolve();
      return mem.has(key) ? mem.get(key) : null;
    },
    async setItem(key, value) {
      await Promise.resolve();
      if (key === BONUS_KEY && bonusWriteBlock) {
        const block = bonusWriteBlock;
        bonusWriteBlock = null;
        block.started.resolve();
        await block.release.promise;
      }
      if (failedSetKeys.has(key)) throw new Error(`storage failure: ${key}`);
      mem.set(key, String(value));
    },
  },
};

const originalLoad = Module._load;
Module._load = function loadWithStorageMock(request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  return originalLoad.call(this, request, parent, isMain);
};

const rewards = require('../lib/cosmeticRewards.js');
const tokens = require('../lib/tokens.js');

test.beforeEach(() => {
  mem.clear();
  failedSetKeys.clear();
  bonusWriteBlock = null;
});

test('adicoes concorrentes nao perdem incremento', async () => {
  const results = await Promise.all([
    rewards.addBonusTarotReading(),
    rewards.addBonusTarotReading(),
  ]);
  assert.deepEqual(results, [1, 2]);
  assert.equal(await rewards.getBonusTarotReadings(), 2);
});

test('um unico bonus libera exatamente uma de duas tentativas concorrentes', async () => {
  await rewards.addBonusTarotReading();
  const results = await Promise.all([
    rewards.consumeBonusTarotReading(),
    rewards.consumeBonusTarotReading(),
  ]);
  assert.equal(results.filter(Boolean).length, 1);
  assert.equal(await rewards.getBonusTarotReadings(), 0);
});

test('a leitura do contador espera uma gravacao de bonus ainda em andamento', async () => {
  const started = deferred();
  const release = deferred();
  bonusWriteBlock = { started, release };

  const adding = rewards.addBonusTarotReading();
  await started.promise;

  let readSettled = false;
  const reading = rewards.getBonusTarotReadings().then((value) => {
    readSettled = true;
    return value;
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(readSettled, false, 'o getter nao pode enxergar o valor antigo durante o setItem');

  release.resolve();
  assert.equal(await adding, 1);
  assert.equal(await reading, 1);
});

test('falha ao persistir a Leitura Bonus estorna a cobranca e registra a compensacao', async () => {
  mem.set(BALANCE_KEY, JSON.stringify(100));
  failedSetKeys.add(BONUS_KEY);

  const result = await rewards.redeemBonusTarotReadingWithTokens({
    cost: 80,
    purchaseReason: 'Leitura Bonus',
    refundReason: 'Estorno - Leitura Bonus',
  });

  assert.deepEqual(result, {
    ok: false,
    reason: 'delivery_failed',
    refunded: true,
    balance: 100,
  });
  assert.equal(await tokens.getTokenBalance(), 100, 'saldo precisa voltar exatamente ao valor anterior');
  assert.equal(await rewards.getBonusTarotReadings(), 0, 'nao pode anunciar um bonus que nao foi salvo');

  const history = await tokens.getTokenHistory();
  assert.equal(history[0].amount, 80);
  assert.equal(history[0].meta.kind, 'refund');
  assert.equal(history[1].amount, -80);
});

test('falha ao persistir a propria cobranca nao entrega bonus nem altera o saldo', async () => {
  mem.set(BALANCE_KEY, JSON.stringify(100));
  failedSetKeys.add(BALANCE_KEY);

  const result = await rewards.redeemBonusTarotReadingWithTokens({
    cost: 80,
    purchaseReason: 'Leitura Bonus',
    refundReason: 'Estorno - Leitura Bonus',
  });

  assert.deepEqual(result, { ok: false, balance: 100, reason: 'storage_error' });
  assert.equal(await tokens.getTokenBalance(), 100);
  assert.equal(await rewards.getBonusTarotReadings(), 0);
});

test('Loja usa a mesma saga no item avulso e no brinde antes de gravar a posse', () => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'screens', 'LojaScreen.js'), 'utf8');
  assert.ok(
    source.split('redeemBonusTarotReadingWithTokens({').length - 1 >= 2,
    'item avulso e brinde precisam compartilhar a saga de cobranca/entrega/estorno'
  );

  const giftStart = source.indexOf('async function redeemBrindeInner');
  const saga = source.indexOf('redeemBonusTarotReadingWithTokens({', giftStart);
  const ownership = source.indexOf('grantBrinde(brinde.id)', giftStart);
  assert.ok(saga > giftStart && saga < ownership, 'o bonus prometido precisa ser confirmado antes da posse do brinde');
  assert.match(source, /result\.reason === 'delivery_failed'/);
  assert.match(source, /loja\.alert\.deliveryFailed\.refundedText/);
});
