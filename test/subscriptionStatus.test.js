// Regressão do bug crítico reproduzido AO VIVO pelo tester (26/07/2026, 21h):
// "parece que ele libera de vez em quando uma vez só o horóscopo e depois ele
//  cai para assinatura de novo... diz que eu já usei uma vez o horóscopo e
//  pede assinatura" — dito por um assinante ATIVO (4 assinaturas active).
//
// Uma das pernas do bug: checkSubscriptionStatus/checkSoloSubscriptionStatus
// tratavam QUALQUER status < 500 como resposta definitiva ("não assina,
// CONFIRMADO") — inclusive 429 do rate limit (que o recheck de 5 em 5 minutos
// x vários aparelhos estoura de verdade) e 408. Resultado: pagante revogado e,
// pior, prévia grátis vitalícia queimada (lib/featureUsage.js marca quando
// hasAccess=false E confirmed=true). 429/408 são TRANSITÓRIOS: retry e, se
// esgotar, confirmed:false — o mesmo padrão de lib/accountSubscription.js.
//
// Também trava aqui a regressão de privacidade do "apagar meus dados":
// USER_SIGN_KEY (signo do modo solo) só era removido quando existia perfil de
// CASAL — o usuário 100% solo apagava tudo e o signo dele sobrevivia (LGPD).
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = { async: new Map() };

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      return mem.async.has(k) ? mem.async.get(k) : null;
    },
    async setItem(k, v) {
      mem.async.set(k, v);
    },
    async multiRemove(keys) {
      keys.forEach((k) => mem.async.delete(k));
    },
  },
};

const secureStoreMock = {
  __esModule: true,
  async getItemAsync() {
    return null;
  },
  async setItemAsync() {},
  async deleteItemAsync() {},
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'expo-secure-store') return secureStoreMock;
  return originalLoad.call(this, request, parent, isMain);
};

const coupleData = require('../lib/coupleData.js');

// --- mock de rede (mesmo desenho de test/accountAccess.test.js) --------------
// `respostas` é uma FILA: cada chamada consome a próxima; a última se repete.
let respostas = [];
let chamadas = 0;
global.fetch = async () => {
  chamadas += 1;
  const r = respostas.length > 1 ? respostas.shift() : respostas[0];
  if (!r) throw new Error('sem resposta mockada');
  return {
    ok: r.status >= 200 && r.status < 300,
    status: r.status,
    async json() {
      return r.body;
    },
  };
};

function reset() {
  mem.async.clear();
  respostas = [];
  chamadas = 0;
}

const EMAIL = 'pai-do-dono@example.com';

test('429 em TODAS as tentativas: retry acontece e o resultado é INCERTEZA (confirmed:false), nunca "não assina confirmado"', async () => {
  reset();
  await coupleData.saveCorrelationCode('Carlos', 'Ana', 'cccccccccccccccccccccccccccccccc');
  respostas = [{ status: 429, body: { error: 'muitas requisições' } }];

  const r = await coupleData.checkSubscriptionStatus('Carlos', 'Ana');
  assert.strictEqual(r.hasAccess, false, 'acesso continua fail-closed durante o rate limit');
  assert.strictEqual(
    r.confirmed,
    false,
    'era exatamente o confirmed:true no 429 que revogava o pagante e queimava a prévia grátis vitalícia dele'
  );
  assert.strictEqual(chamadas, 3, '429 é transitório: precisa passar pelas 3 tentativas antes de desistir');
});

test('429 passageiro seguido de 200 active: o retry RECUPERA o assinante na mesma checagem', async () => {
  reset();
  await coupleData.saveCorrelationCode('Carlos', 'Ana', 'cccccccccccccccccccccccccccccccc');
  respostas = [
    { status: 429, body: { error: 'muitas requisições' } },
    { status: 200, body: { hasAccess: true, status: 'active' } },
  ];

  const r = await coupleData.checkSubscriptionStatus('Carlos', 'Ana');
  assert.strictEqual(r.hasAccess, true, 'antes, o primeiro 429 encerrava a checagem como "não assina"');
  assert.strictEqual(r.confirmed, true);
  assert.strictEqual(r.status, 'active');
});

test('404 (código desconhecido) continua sendo estado REAL: confirmed:true, sem retry', async () => {
  reset();
  await coupleData.saveCorrelationCode('Carlos', 'Ana', 'cccccccccccccccccccccccccccccccc');
  respostas = [{ status: 404, body: { error: 'não encontrado' } }];

  const r = await coupleData.checkSubscriptionStatus('Carlos', 'Ana');
  assert.strictEqual(r.hasAccess, false);
  assert.strictEqual(r.confirmed, true, '4xx real (não transitório) segue sendo resposta definitiva');
  assert.strictEqual(chamadas, 1, '4xx real não é retentado');
});

test('SOLO: 408 esgotado também vira incerteza (confirmed:false) — mesma regra da checagem de casal', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, 'ssssssssssssssssssssssssssssssss');
  respostas = [{ status: 408, body: { error: 'timeout' } }];

  const r = await coupleData.checkSoloSubscriptionStatus(EMAIL);
  assert.strictEqual(r.hasAccess, false);
  assert.strictEqual(r.confirmed, false);
  assert.strictEqual(chamadas, 3);
});

test('SOLO: 429 seguido de 200 active recupera o assinante solo', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, 'ssssssssssssssssssssssssssssssss');
  respostas = [
    { status: 429, body: { error: 'muitas requisições' } },
    { status: 200, body: { hasAccess: true, status: 'active' } },
  ];

  const r = await coupleData.checkSoloSubscriptionStatus(EMAIL);
  assert.strictEqual(r.hasAccess, true);
  assert.strictEqual(r.confirmed, true);
});

// === "apagar meus dados" x usuário 100% solo =================================

test('deleteAllCoupleData remove o signo solo (USER_SIGN_KEY) mesmo SEM perfil de casal', async () => {
  reset();
  await coupleData.saveUserSign({ name: 'Áries', pt: 'Áries' });
  assert.ok(await coupleData.getUserSign(), 'sanidade: o signo foi salvo');

  await coupleData.deleteAllCoupleData();

  assert.strictEqual(
    await coupleData.getUserSign(),
    null,
    'o signo é dado pessoal de quem apagou — não pode sobreviver a "apagar meus dados" só porque nunca houve casal'
  );
});
