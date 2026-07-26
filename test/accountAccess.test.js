// ACESSO PELA CONTA, NÃO PELO APARELHO — regressão do bug estrutural relatado
// pelo dono do produto (26/07/2026):
//   "então não é pelo celular que ele tem que entrar, mas pelo login e senha
//    que ele assinou né"
//
// Antes, "ser assinante" era ter um correlationCode gravado no AsyncStorage
// DESTE aparelho. Limpar o navegador, trocar de celular ou abrir no PC = pagou
// e perdeu o acesso. E clicar "Assinar" DEPOIS de já ter pago repontava a
// chave local pra uma pendência nova e o acesso SUMIA (laço real vivido por um
// cliente pagante, 4 checkouts).
//
// Estes testes travam as 4 garantias da correção:
//   1. a conta resolve o acesso (união com o aparelho, nunca substituição);
//   2. o aparelho se auto-repara com o correlationCode que a conta devolve;
//   3. "Assinar" nunca sobrescreve o ponteiro de quem já assina;
//   4. rede fora / backend antigo / 401 NUNCA revogam acesso de quem tem.
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

// Sessão do Supabase: `sessao` null = deslogado (a maioria do app — login só é
// exigido na tela de Planos).
let sessao = { access_token: 'jwt-do-carlos' };
const supabaseMock = {
  __esModule: true,
  supabase: {
    auth: {
      async getSession() {
        return { data: { session: sessao } };
      },
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'expo-secure-store') return secureStoreMock;
  if (request === './supabaseClient') return supabaseMock;
  return originalLoad.call(this, request, parent, isMain);
};

const coupleData = require('../lib/coupleData.js');
const accountSubscription = require('../lib/accountSubscription.js');

// --- mock de rede -----------------------------------------------------------
// `rotas` mapeia um pedaço da URL -> função(url, options) => { status, body }.
let rotas = {};
let chamadas = [];
global.fetch = async (url, options = {}) => {
  chamadas.push({ url, options });
  const chave = Object.keys(rotas).find((k) => url.includes(k));
  if (!chave) throw new Error(`rota não mockada: ${url}`);
  const { status, body } = await rotas[chave](url, options);
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      if (body === undefined) throw new Error('sem corpo');
      return body;
    },
  };
};

function reset() {
  mem.async.clear();
  rotas = {};
  chamadas = [];
  sessao = { access_token: 'jwt-do-carlos' };
}

const CODIGO_ANTIGO = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const CODIGO_DA_CONTA = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const EMAIL = 'carlos.alberto.sanches09@gmail.com';

// === 1) UNIÃO: a conta resolve, o aparelho continua valendo ==================

test('conta com assinatura ativa concede acesso mesmo com o aparelho zerado (celular novo / navegador limpo)', () => {
  const r = coupleData.combineAccessResults({
    account: { available: true, confirmed: true, hasAccess: true, hasCoupleAccess: false, status: 'active', currentPeriodEnd: '2026-08-26' },
    couple: { hasAccess: false, confirmed: true },
    solo: { hasAccess: false, confirmed: true },
  });
  assert.strictEqual(r.hasAccess, true, 'era exatamente isso que fazia quem pagou perder o acesso ao trocar de aparelho');
  assert.strictEqual(r.source, 'account');
  assert.strictEqual(r.status, 'active', 'a conta é a fonte AUTORITATIVA de status quando concede acesso');
  assert.strictEqual(r.currentPeriodEnd, '2026-08-26');
});

test('aparelho concede acesso e a CONTA falhando (401/JWKS fora) NÃO revoga', () => {
  const r = coupleData.combineAccessResults({
    account: { available: false, confirmed: false, hasAccess: false },
    couple: { hasAccess: true, confirmed: true, status: 'active' },
    solo: { hasAccess: false, confirmed: true },
  });
  assert.strictEqual(r.hasAccess, true, 'nenhuma resposta da conta pode derrubar acesso concedido por outra fonte');
  assert.strictEqual(r.hasCoupleAccess, true);
  assert.strictEqual(r.confirmed, true, 'com acesso concedido não há incerteza nenhuma a propagar');
});

test('conta responde "sem assinatura" e o aparelho tem código válido: o aparelho ganha', () => {
  const r = coupleData.combineAccessResults({
    account: { available: true, confirmed: true, hasAccess: false },
    couple: { hasAccess: false, confirmed: true },
    solo: { hasAccess: true, confirmed: true, status: 'active' },
  });
  assert.strictEqual(r.hasAccess, true, 'as 14 pendências antigas do funil web só existem por esse caminho');
  assert.strictEqual(r.source, 'solo');
});

test('tudo fora do ar: sem acesso, mas TAMBÉM sem confirmação (não queima a prévia grátis)', () => {
  const r = coupleData.combineAccessResults({
    account: { available: false, confirmed: false, hasAccess: false },
    couple: { hasAccess: false, confirmed: false },
    solo: { hasAccess: false, confirmed: false },
  });
  assert.strictEqual(r.hasAccess, false);
  assert.strictEqual(r.confirmed, false, 'confirmed=false é o que impede lib/featureUsage.js de marcar prévia usada');
});

test('assinatura SOLO ativa não destrava as telas exclusivas de casal', () => {
  const r = coupleData.combineAccessResults({
    account: { available: true, confirmed: true, hasAccess: true, hasCoupleAccess: false, status: 'active' },
    couple: { hasAccess: false, confirmed: true },
    solo: { hasAccess: true, confirmed: true },
  });
  assert.strictEqual(r.hasAccess, true);
  assert.strictEqual(r.hasCoupleAccess, false, 'solo pagou as leituras individuais, não Reconectar/Descobrir/Agir');
});

test('backend antigo (conta indisponível) + aparelho sem código = estado real, não incerteza', () => {
  const r = coupleData.combineAccessResults({
    account: { available: false, confirmed: true, hasAccess: false },
    couple: { hasAccess: false, confirmed: true },
    solo: { hasAccess: false, confirmed: true },
  });
  assert.strictEqual(r.hasAccess, false);
  assert.strictEqual(r.confirmed, true, 'nunca assinou é resposta, não falha');
});

// === 2) GET /me: nada aqui pode virar "sem acesso" por engano ================

test('deslogado nem chega a bater na rede da conta', async () => {
  reset();
  sessao = null;
  const r = await accountSubscription.fetchAccountSubscription();
  assert.strictEqual(r.available, false);
  assert.strictEqual(r.confirmed, true, 'deslogado é estado real (a maioria do app), não incerteza');
  assert.strictEqual(chamadas.length, 0);
});

test('backend AINDA sem a rota (404) vira "sem informação de conta", nunca "sem acesso"', async () => {
  reset();
  // Servidor antigo casa ":correlationCode = me" na rota pública e devolve 404.
  rotas['/api/subscription/me'] = async () => ({ status: 404, body: { error: 'não encontrado' } });
  const r = await accountSubscription.fetchAccountSubscription();
  assert.strictEqual(r.available, false, 'deploy app-antes-backend não pode deslogar ninguém');
  assert.strictEqual(r.confirmed, true);
  assert.strictEqual(r.reason, 'route-missing');
});

test('401 (JWKS fora / token não verificável) devolve confirmed=false — incerteza, não "não assina"', async () => {
  reset();
  rotas['/api/subscription/me'] = async () => ({ status: 401, body: { error: 'token inválido' } });
  const r = await accountSubscription.fetchAccountSubscription();
  assert.strictEqual(r.hasAccess, false, 'acesso é fail-closed na rota de conta');
  assert.strictEqual(r.confirmed, false, 'mas a incerteza precisa propagar pro accessConfirmed');
});

test('429 (recheck de 5min x vários aparelhos) é transitório, nunca "sem acesso"', async () => {
  reset();
  rotas['/api/subscription/me'] = async () => ({ status: 429, body: { error: 'muitas requisições' } });
  const r = await accountSubscription.fetchAccountSubscription();
  assert.strictEqual(r.confirmed, false);
  assert.strictEqual(r.reason, 'rate-limited');
});

test('manda o JWT no Authorization e NUNCA o e-mail na query (e-mail vem do token)', async () => {
  reset();
  rotas['/api/subscription/me'] = async () => ({ status: 200, body: { hasAccess: true, status: 'active' } });
  await accountSubscription.fetchAccountSubscription();
  assert.strictEqual(chamadas[0].options.headers.Authorization, 'Bearer jwt-do-carlos');
  assert.ok(!chamadas[0].url.includes('@'), 'e-mail em query permitiria reivindicar assinatura de terceiro');
});

// === 3) AUTO-REPARO DO APARELHO ============================================

test('conta ativa (solo) regrava o correlationCode local — aparelho novo passa a funcionar offline depois', async () => {
  reset();
  rotas['/api/subscription/me'] = async () => ({
    status: 200,
    body: { hasAccess: true, status: 'active', scope: 'solo', correlationCode: CODIGO_DA_CONTA },
  });

  assert.strictEqual(await coupleData.getSoloCorrelationCode(EMAIL), null);
  const r = await accountSubscription.checkAccountAccess({ email: EMAIL });
  assert.strictEqual(r.hasAccess, true);
  assert.strictEqual(await coupleData.getSoloCorrelationCode(EMAIL), CODIGO_DA_CONTA);
});

test('ponteiro PODRE (apontando pra pendência errada) é consertado pela conta', async () => {
  reset();
  // Foi o caso real: compra aprovada às 17:14, mas o aparelho apontava pra uma
  // pendência criada às 17:48 por um clique a mais em "Assinar".
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_ANTIGO);
  rotas['/api/subscription/me'] = async () => ({
    status: 200,
    body: { hasAccess: true, status: 'active', scope: 'solo', correlationCode: CODIGO_DA_CONTA },
  });

  await accountSubscription.checkAccountAccess({ email: EMAIL });
  assert.strictEqual(await coupleData.getSoloCorrelationCode(EMAIL), CODIGO_DA_CONTA);
});

test('escopo casal regrava a chave de CASAL; escopo desconhecido NUNCA toca nela', async () => {
  reset();
  rotas['/api/subscription/me'] = async () => ({
    status: 200,
    body: {
      hasAccess: true,
      hasCoupleAccess: true,
      subscriptions: [
        { scope: 'couple', hasAccess: true, correlationCode: CODIGO_DA_CONTA, status: 'active' },
        { hasAccess: true, correlationCode: CODIGO_ANTIGO, status: 'active' },
      ],
    },
  });

  await accountSubscription.checkAccountAccess({ voce: 'Carlos', amor: 'Ana', email: EMAIL });
  assert.strictEqual(await coupleData.getCorrelationCode('Carlos', 'Ana'), CODIGO_DA_CONTA);
  assert.strictEqual(
    await coupleData.getSoloCorrelationCode(EMAIL),
    CODIGO_ANTIGO,
    'escopo desconhecido vai pra chave solo, a conservadora — nunca pra de casal'
  );
});

test('conta SEM acesso não mexe no ponteiro local (o aparelho pode saber de algo que a conta ainda não sabe)', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_ANTIGO);
  rotas['/api/subscription/me'] = async () => ({ status: 200, body: { hasAccess: false } });

  await accountSubscription.checkAccountAccess({ email: EMAIL });
  assert.strictEqual(await coupleData.getSoloCorrelationCode(EMAIL), CODIGO_ANTIGO);
});

// === 4) "ASSINAR" NÃO PODE APAGAR O VÍNCULO DE QUEM JÁ PAGA =================

test('alreadyActive: o correlationCode local NÃO é sobrescrito (este era o laço que sumia com o acesso)', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_ANTIGO);
  rotas['/api/checkout/initiate'] = async () => ({
    status: 200,
    body: { alreadyActive: true, correlationCode: CODIGO_DA_CONTA, status: 'active' },
  });

  const data = await coupleData.initiateSoloCheckout(EMAIL, 'trial', 'jwt-do-carlos');
  assert.strictEqual(data.alreadyActive, true);
  assert.strictEqual(
    await coupleData.getSoloCorrelationCode(EMAIL),
    CODIGO_ANTIGO,
    'sem checkout novo não há ponteiro novo — repontar aqui é o que fazia o acesso sumir'
  );
});

test('alreadyActive de casal também preserva o ponteiro de casal', async () => {
  reset();
  await coupleData.saveCorrelationCode('Carlos', 'Ana', CODIGO_ANTIGO);
  rotas['/api/checkout/initiate'] = async () => ({
    status: 200,
    body: { alreadyActive: true, correlationCode: CODIGO_DA_CONTA, status: 'active' },
  });

  await coupleData.initiateCheckout('Carlos', 'Ana', EMAIL, 'annual', 'jwt-do-carlos');
  assert.strictEqual(await coupleData.getCorrelationCode('Carlos', 'Ana'), CODIGO_ANTIGO);
});

test('checkout de verdade continua salvando o código e agora manda o JWT junto', async () => {
  reset();
  rotas['/api/checkout/initiate'] = async () => ({
    status: 200,
    body: { correlationCode: CODIGO_DA_CONTA, checkoutConfig: { offerCode: 'aqwv9uci', xcod: 'x' } },
  });

  const data = await coupleData.initiateSoloCheckout(EMAIL, 'trial', 'jwt-do-carlos');
  assert.ok(data.checkoutConfig);
  assert.strictEqual(await coupleData.getSoloCorrelationCode(EMAIL), CODIGO_DA_CONTA);
  assert.strictEqual(chamadas[0].options.headers.Authorization, 'Bearer jwt-do-carlos');
  assert.strictEqual(JSON.parse(chamadas[0].options.body).scope, 'solo');
});

test('sem token (funil web antigo, oddpro.pro) o checkout continua exatamente como era', async () => {
  reset();
  rotas['/api/checkout/initiate'] = async () => ({
    status: 200,
    body: { correlationCode: CODIGO_DA_CONTA, checkoutConfig: { offerCode: 'aqwv9uci' } },
  });

  await coupleData.initiateCheckout('Carlos', 'Ana', EMAIL, 'trial');
  assert.strictEqual(chamadas[0].options.headers.Authorization, undefined);
  assert.strictEqual(await coupleData.getCorrelationCode('Carlos', 'Ana'), CODIGO_DA_CONTA);
});

// === 5) RECUPERAÇÃO MANUAL (e-mail do pagamento ≠ e-mail do login) ==========

test('sem código neste aparelho, a recuperação avisa em vez de fingir sucesso', async () => {
  reset();
  const r = await accountSubscription.recoverSubscriptionFromDevice({ email: EMAIL });
  assert.strictEqual(r.attempted, 0);
  assert.strictEqual(r.reason, 'no-code');
});

test('recuperação manda o código do aparelho (prova de posse) e vincula à conta', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_ANTIGO);
  rotas['/api/subscription/claim'] = async () => ({ status: 200, body: { hasAccess: true, status: 'active' } });

  const r = await accountSubscription.recoverSubscriptionFromDevice({ email: EMAIL });
  assert.strictEqual(r.linked, 1);
  assert.strictEqual(JSON.parse(chamadas[0].options.body).correlationCode, CODIGO_ANTIGO);
  assert.strictEqual(chamadas[0].options.headers.Authorization, 'Bearer jwt-do-carlos');
});

test('409 (assinatura já é de outra conta) é reportado sem virar erro genérico', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_ANTIGO);
  rotas['/api/subscription/claim'] = async () => ({ status: 409, body: { error: 'não foi possível vincular' } });

  const r = await accountSubscription.recoverSubscriptionFromDevice({ email: EMAIL });
  assert.strictEqual(r.linked, 0);
  assert.strictEqual(r.alreadyOwned, 1);
});

test('auto-vínculo silencioso só tenta UMA vez por conta+código (o /claim tem limite de 10/15min)', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_ANTIGO);
  rotas['/api/subscription/claim'] = async () => ({ status: 200, body: { hasAccess: true } });

  const args = { userId: 'uuid-carlos', email: EMAIL, entries: [] };
  const primeira = await accountSubscription.autoLinkDeviceCodes(args);
  const segunda = await accountSubscription.autoLinkDeviceCodes(args);

  assert.deepStrictEqual(primeira, [CODIGO_ANTIGO]);
  assert.deepStrictEqual(segunda, [], 'o refreshAccess roda de 5 em 5 minutos — sem a marca, torraria o rate limit');
  assert.strictEqual(chamadas.length, 1);
});

test('auto-vínculo não repete o que a conta JÁ conhece', async () => {
  reset();
  await coupleData.saveSoloCorrelationCode(EMAIL, CODIGO_DA_CONTA);
  const linked = await accountSubscription.autoLinkDeviceCodes({
    userId: 'uuid-carlos',
    email: EMAIL,
    entries: [{ correlationCode: CODIGO_DA_CONTA, hasAccess: true }],
  });
  assert.deepStrictEqual(linked, []);
  assert.strictEqual(chamadas.length, 0);
});
