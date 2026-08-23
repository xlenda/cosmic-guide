// O LADO DO APP DO PAYWALL DE VERDADE (30/07/2026).
//
// Contexto: até aqui o paywall inteiro morava no AsyncStorage deste aparelho
// (lib/featureUsage.js, lib/chatFreeMessages.js). Um localStorage.clear() no
// DevTools devolvia as 9 leituras grátis, pra sempre. A cota passou a ser
// contada no SERVIDOR, por CONTA (server-patches/src/http/aiQuota.js), e este
// arquivo trava as DUAS peças que o app precisa ter pra isso funcionar:
//
//   1. o JWT do Supabase VAI JUNTO em toda chamada de IA. Sem ele o servidor
//      não sabe que é o assinante falando: o assinante levaria paywall depois
//      de pagar, e a cota de quem não assina seria burlável só trocando de IP;
//
//   2. "cota esgotada" é DISTINGUÍVEL de "caiu a rede". A resposta de cota
//      sobe como AiAccessError para a tela abrir o caminho de acesso; falha
//      técnica permanece erro comum para a tela preservar a entrada e dizer,
//      com honestidade, que nada foi gerado.
const test = require('node:test');
const assert = require('node:assert/strict');

const aiClient = require('../lib/aiClient.js');
const {
  fetchAiChatReply,
  fetchAiPalmReading,
  fetchAiDreamReading,
  fetchAiEnhancedInsight,
  setAuthTokenProvider,
  isAiAccessError,
  isQuotaExhausted,
  isLoginRequired,
} = aiClient;

// --- mock de rede ------------------------------------------------------------
let chamadas = [];
let responder = null;

function mockRede(fn) {
  responder = fn;
}

global.fetch = async (url, options = {}) => {
  chamadas.push({ url, options });
  const { status = 200, body = {}, semCorpo = false } = (await responder(url, options)) || {};
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      if (semCorpo) throw new Error('resposta sem corpo JSON');
      return body;
    },
  };
};

test.beforeEach(() => {
  chamadas = [];
  responder = async () => ({ status: 200, body: { reply: 'oi' } });
  setAuthTokenProvider(null);
});

function ultimoHeaderAuth() {
  return chamadas[chamadas.length - 1].options.headers.Authorization;
}

// =============================================================================
// 1) O TOKEN VAI JUNTO
// =============================================================================

test('com sessão, toda chamada de IA leva o JWT no Authorization', async () => {
  setAuthTokenProvider(async () => 'jwt-do-carlos');
  responder = async () => ({ status: 200, body: { reply: 'olá' } });
  await fetchAiChatReply('luna', 'oi', []);
  assert.equal(ultimoHeaderAuth(), 'Bearer jwt-do-carlos', 'sem isto o assinante é tratado como anônimo');
});

test('sem sessão, a chamada sai sem Authorization (deslogado continua funcionando)', async () => {
  responder = async () => ({ status: 200, body: { reply: 'olá' } });
  await fetchAiChatReply('luna', 'oi', []);
  assert.equal(ultimoHeaderAuth(), undefined);
  assert.equal(chamadas[0].options.headers['Content-Type'], 'application/json');
});

test('falha ao ler a sessão não derruba a chamada — segue como anônimo', async () => {
  setAuthTokenProvider(async () => {
    throw new Error('storage indisponível');
  });
  responder = async () => ({ status: 200, body: { reply: 'olá' } });
  assert.equal(await fetchAiChatReply('luna', 'oi', []), 'olá');
  assert.equal(ultimoHeaderAuth(), undefined);
});

test('o token é lido a CADA chamada (o SDK renova sozinho — token velho em cache seria 401 eterno)', async () => {
  let n = 0;
  setAuthTokenProvider(async () => `jwt-${++n}`);
  responder = async () => ({ status: 200, body: { reply: 'olá' } });
  await fetchAiChatReply('luna', 'oi', []);
  await fetchAiChatReply('luna', 'oi', []);
  assert.equal(chamadas[0].options.headers.Authorization, 'Bearer jwt-1');
  assert.equal(chamadas[1].options.headers.Authorization, 'Bearer jwt-2');
});

test('TODAS as rotas de IA levam o token — nenhuma pode ficar de fora', async () => {
  setAuthTokenProvider(async () => 'jwt');
  const casos = [
    () => aiClient.fetchAiChatReply('luna', 'oi', []),
    () => aiClient.fetchAiPalmReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiFaceReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiFootReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiMolesReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiCoffeeReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiCoffeeWeeklySummary([{ title: 'a', body: 'b' }]),
    () => aiClient.fetchAiEnhancedInsight('falei', 'tarot', 'A Torre'),
    () => aiClient.fetchAiWeeklyInsight([{ title: 'a', body: 'b' }]),
    () => aiClient.fetchAiDreamReading('sonhei'),
  ];
  assert.equal(casos.length, 10, 'se este número mudar, uma rota de IA nasceu sem cobertura');
  responder = async () => ({
    status: 200,
    body: { reply: 'r', title: 't', body: 'b', enhanced: 'e' },
  });
  for (const caso of casos) {
    await caso();
    assert.equal(ultimoHeaderAuth(), 'Bearer jwt');
  }
});

// =============================================================================
// 2) COTA ESGOTADA ≠ ERRO DE REDE
// =============================================================================

test('402 quota_exhausted vira AiAccessError — a tela leva ao paywall, não ao mock', async () => {
  responder = async () => ({
    status: 402,
    body: { error: 'Sua cota gratuita acabou.', code: 'quota_exhausted', scope: 'account', bucket: 'chat', upgrade: true },
  });
  await assert.rejects(
    () => fetchAiChatReply('luna', 'oi', []),
    (err) => {
      assert.ok(isAiAccessError(err), 'precisa ser reconhecível como bloqueio de acesso');
      assert.ok(isQuotaExhausted(err));
      assert.equal(isLoginRequired(err), false);
      assert.equal(err.status, 402);
      assert.equal(err.scope, 'account');
      return true;
    }
  );
});

test('401 login_required vira AiAccessError de LOGIN (rotas com foto)', async () => {
  responder = async () => ({
    status: 401,
    body: { error: 'Entre na sua conta.', code: 'login_required', scope: 'vision' },
  });
  await assert.rejects(
    () => fetchAiPalmReading('b64', 'image/jpeg'),
    (err) => {
      assert.ok(isLoginRequired(err), 'o app precisa oferecer CRIAR CONTA, não cartão de crédito');
      assert.equal(isQuotaExhausted(err), false);
      assert.equal(err.status, 401);
      return true;
    }
  );
});

test('402 anônimo traz loginHelps — criar conta ainda destrava, e a tela precisa saber', async () => {
  responder = async () => ({
    status: 402,
    body: { code: 'quota_exhausted', scope: 'ip', loginHelps: true },
  });
  await assert.rejects(
    () => fetchAiDreamReading('sonhei'),
    (err) => {
      assert.equal(err.scope, 'ip');
      assert.equal(err.loginHelps, true);
      return true;
    }
  );
});

test('500 do servidor NÃO é bloqueio de acesso — sobe como falha técnica', async () => {
  responder = async () => ({ status: 500, body: { error: 'erro interno' } });
  await assert.rejects(
    () => fetchAiChatReply('luna', 'oi', []),
    (err) => {
      assert.equal(isAiAccessError(err), false, 'queda do servidor não pode abrir paywall');
      assert.match(err.message, /chat falhou \(500\)/);
      return true;
    }
  );
});

test('413 (corpo grande demais) não é paywall', async () => {
  responder = async () => ({ status: 413, body: { error: 'grande demais', code: 'body_too_large' } });
  await assert.rejects(
    () => fetchAiChatReply('luna', 'oi', []),
    (err) => {
      assert.equal(isAiAccessError(err), false);
      return true;
    }
  );
});

test('402 SEM code reconhecível (proxy no caminho, WAF) não abre paywall', async () => {
  responder = async () => ({ status: 402, body: { mensagem: 'sei lá' } });
  await assert.rejects(
    () => fetchAiChatReply('luna', 'oi', []),
    (err) => {
      assert.equal(isAiAccessError(err), false, 'só o contrato do NOSSO backend abre o muro');
      assert.match(err.message, /chat falhou \(402\)/);
      return true;
    }
  );
});

test('erro sem corpo JSON nenhum não explode dentro do cliente', async () => {
  responder = async () => ({ status: 403, semCorpo: true });
  await assert.rejects(
    () => fetchAiChatReply('luna', 'oi', []),
    (err) => {
      assert.equal(isAiAccessError(err), false);
      assert.match(err.message, /chat falhou \(403\)/);
      return true;
    }
  );
});

test('o bloqueio é reconhecido em TODAS as rotas, não só no chat', async () => {
  responder = async () => ({ status: 402, body: { code: 'quota_exhausted', scope: 'account' } });
  const casos = [
    () => aiClient.fetchAiChatReply('luna', 'oi', []),
    () => aiClient.fetchAiPalmReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiFaceReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiFootReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiMolesReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiCoffeeReading('b64', 'image/jpeg'),
    () => aiClient.fetchAiCoffeeWeeklySummary([{ title: 'a', body: 'b' }]),
    () => aiClient.fetchAiEnhancedInsight('falei', 'tarot', 'A Torre'),
    () => aiClient.fetchAiWeeklyInsight([{ title: 'a', body: 'b' }]),
    () => aiClient.fetchAiDreamReading('sonhei'),
  ];
  for (const caso of casos) {
    await assert.rejects(caso, (err) => isQuotaExhausted(err));
  }
});

// =============================================================================
// 3) O sucesso continua exatamente como era (nenhuma regressão de contrato)
// =============================================================================

test('resposta boa continua devolvendo o mesmo formato de sempre', async () => {
  responder = async () => ({ status: 200, body: { title: 'Recomeços', body: 'Sua linha da vida...' } });
  assert.deepEqual(await fetchAiPalmReading('b64', 'image/jpeg'), {
    title: 'Recomeços',
    body: 'Sua linha da vida...',
  });

  responder = async () => ({ status: 200, body: { enhanced: 'texto organizado' } });
  assert.equal(await fetchAiEnhancedInsight('falei', 'tarot', 'A Torre'), 'texto organizado');
});

test('200 com payload malformado continua sendo erro técnico (nunca fabrica leitura, nunca abre paywall)', async () => {
  responder = async () => ({ status: 200, body: { title: 'só o título' } });
  await assert.rejects(
    () => fetchAiPalmReading('b64', 'image/jpeg'),
    (err) => {
      assert.equal(isAiAccessError(err), false);
      assert.match(err.message, /resposta vazia\/malformada/);
      return true;
    }
  );
});
