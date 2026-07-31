// Testes de lib/funnel.js — a camada de disparo do funil PRÓPRIO (o lote vai
// pra POST /api/track, ver server-patches/src/http/trackRoutes.js).
//
// O que estes testes protegem, em ordem de importância:
//   1. PRIVACIDADE: nenhum campo fora da allowlist de props sai do aparelho, e
//      o sessionId é aleatório (nunca derivado de e-mail/nome/id de conta).
//   2. NUNCA QUEBRAR A TELA: track() é síncrona e não lança nem com fetch
//      explodindo, storage quebrado ou argumento absurdo.
//   3. NÃO INFLAR O NÚMERO: dedupe — o relatório conta COUNT(DISTINCT
//      session_id) por evento, então evento repetido é só ruído.
//   4. NÃO CRESCER SEM LIMITE: fila com teto e lote descartado depois de N
//      tentativas de rede falhas.
//
// Mesmo esquema de mock por require-cache dos outros testes deste diretório
// (missions.test.js, coupleData.saveProfile.test.js): AsyncStorage em memória
// e um stub de react-native (lib/funnel.js importa AppState/Platform).
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

const mem = new Map();
let storageBroken = false;

const asyncStorageMock = {
  __esModule: true,
  default: {
    async getItem(k) {
      if (storageBroken) throw new Error('storage indisponível');
      return mem.has(k) ? mem.get(k) : null;
    },
    async setItem(k, v) {
      if (storageBroken) throw new Error('storage indisponível');
      mem.set(k, String(v));
    },
    async removeItem(k) {
      if (storageBroken) throw new Error('storage indisponível');
      mem.delete(k);
    },
    async multiRemove(keys) {
      keys.forEach((k) => mem.delete(k));
    },
  },
};

const appStateListeners = [];
const reactNativeMock = {
  __esModule: true,
  Platform: { OS: 'test' },
  AppState: {
    currentState: 'active',
    addEventListener(type, handler) {
      appStateListeners.push({ type, handler });
      return { remove() {} };
    },
  },
};

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === '@react-native-async-storage/async-storage') return asyncStorageMock;
  if (request === 'react-native') return reactNativeMock;
  return originalLoad.call(this, request, parent, isMain);
};

const funnelLib = require('../lib/funnel.js');
const { track, funnel, flushFunnel, resetFunnelSession, FUNNEL_SESSION_KEY, FUNNEL_EVENTS, __funnelDebug, __funnelResetForTests } = funnelLib;

// ---------------------------------------------------------------------------
// Rede falsa. `modo` decide o que a rota responde neste teste.
// ---------------------------------------------------------------------------
let requisicoes = [];
let modo = 'ok'; // 'ok' | 'rede-fora' | '400' | '500' | 'lanca'

function instalarFetch() {
  global.fetch = async (url, options) => {
    requisicoes.push({ url, options, body: JSON.parse(options.body) });
    if (modo === 'rede-fora') throw new Error('Network request failed');
    if (modo === 'lanca') throw new TypeError('fetch explodiu');
    if (modo === '400') return { ok: false, status: 400 };
    if (modo === '500') return { ok: false, status: 500 };
    return { ok: true, status: 204 };
  };
}

function reset() {
  mem.clear();
  storageBroken = false;
  requisicoes = [];
  modo = 'ok';
  __funnelResetForTests();
  instalarFetch();
}

// ---------------------------------------------------------------------------
// FILA + LOTE
// ---------------------------------------------------------------------------

test('fila: track() não manda nada na hora — junta e sai em UM lote', async () => {
  reset();
  track('app_open');
  track('home_view');
  track('reading_start');

  assert.strictEqual(requisicoes.length, 0, 'não pode disparar requisição por evento');
  assert.strictEqual(__funnelDebug().queue.length, 3);

  await flushFunnel();

  assert.strictEqual(requisicoes.length, 1, 'os 3 eventos têm que caber numa requisição só');
  assert.deepStrictEqual(
    requisicoes[0].body.events.map((e) => e.event),
    ['app_open', 'home_view', 'reading_start']
  );
  assert.strictEqual(__funnelDebug().queue.length, 0);
});

test('lote: chegando a 10 eventos, o envio sai sozinho sem esperar o debounce', async () => {
  reset();
  // 10 eventos DISTINTOS (o dedupe colapsaria repetições) usando a variação.
  const kinds = ['tarot', 'dream', 'coffee', 'palma', 'horoscope', 'chat', 'birthchart', 'compatibility', 'lunar', 'rosto'];
  kinds.forEach((k) => funnel.readingDone(k));

  // scheduleFlush dispara flush() de forma assíncrona; um tick basta.
  await new Promise((r) => setTimeout(r, 0));
  await flushFunnel();

  assert.strictEqual(requisicoes.length, 1);
  assert.strictEqual(requisicoes[0].body.events.length, 10);
});

test('corpo do lote é exatamente o que a rota espera: { sessionId, events:[{event, props?}] }', async () => {
  reset();
  funnel.planSelect('annual');
  await flushFunnel();

  const body = requisicoes[0].body;
  assert.deepStrictEqual(Object.keys(body).sort(), ['events', 'sessionId']);
  assert.deepStrictEqual(body.events, [{ event: 'plan_select', props: { plan: 'annual' } }]);
  assert.strictEqual(requisicoes[0].options.method, 'POST');
  assert.strictEqual(requisicoes[0].options.headers['Content-Type'], 'application/json');
  assert.ok(String(requisicoes[0].url).endsWith('/api/track'), requisicoes[0].url);
});

test('lote nunca passa do teto de 30 que a rota aceita', async () => {
  reset();
  for (let i = 0; i < 60; i++) track('reading_done', { kind: `k${i}` }, { key: `reading_done:k${i}` });
  // O 10º evento já dispara o envio automático, então quando este teste chega
  // aqui existe uma requisição EM VOO — e flushFunnel() é (de propósito) um
  // no-op enquanto `inflight`, pra não mandar o mesmo lote duas vezes. Ceder o
  // event loop antes é o que deixa esse envio terminar; sem isso o teste media
  // o relógio, não o teto de lote.
  await new Promise((r) => setImmediate(r));
  await flushFunnel();
  assert.ok(requisicoes.length >= 1);
  requisicoes.forEach((r) => assert.ok(r.body.events.length <= 30, `lote de ${r.body.events.length} eventos`));
});

// ---------------------------------------------------------------------------
// ENVIO AUTOMÁTICO — os dois caminhos que fazem o evento sair SOZINHO.
//
// Estes dois testes existem por causa de um bug real: scheduleFlush() chamava
// `flush()`, função que não existe neste módulo. Como todo teste antigo chamava
// `await flushFunnel()` na mão, a suíte ficava verde enquanto no app de verdade
// NADA era enviado — e, pior, o ReferenceError dentro do setTimeout (sem
// try/catch em volta) subia como EXCEÇÃO NÃO CAPTURADA a cada 5 segundos, que é
// exatamente o que telemetria nunca pode fazer.
// Regra pros dois: NENHUM flushFunnel() manual. Quem envia é o módulo.
// ---------------------------------------------------------------------------

test('envio automático: ao bater 10 eventos o lote sai SOZINHO, sem flush manual', async () => {
  reset();
  const kinds = ['tarot', 'dream', 'coffee', 'palma', 'horoscope', 'chat', 'birthchart', 'compatibility', 'lunar', 'rosto'];
  kinds.forEach((k) => funnel.readingDone(k));

  // Só ceder o event loop — nada de flushFunnel() aqui, é esse o ponto.
  await new Promise((r) => setImmediate(r));

  assert.strictEqual(requisicoes.length, 1, 'o gatilho de lote não disparou envio nenhum');
  assert.strictEqual(requisicoes[0].body.events.length, 10);
  assert.strictEqual(__funnelDebug().queue.length, 0);
});

test('envio automático: o timer de debounce envia e NÃO lança (nada de exceção não capturada)', async () => {
  reset();

  // Recorder de timers em vez de esperar 5s de verdade: guarda o callback que o
  // módulo agendou e deixa este teste executá-lo na mão, de forma determinística.
  const agendados = [];
  const setTimeoutReal = global.setTimeout;
  const clearTimeoutReal = global.clearTimeout;
  global.setTimeout = (fn, ms) => {
    const id = { fn, ms, unref() {} };
    agendados.push(id);
    return id;
  };
  global.clearTimeout = (id) => {
    const i = agendados.indexOf(id);
    if (i >= 0) agendados.splice(i, 1);
  };

  try {
    track('app_open'); // 1 evento só: abaixo do gatilho de lote, então cai no debounce

    const debounce = agendados.find((t) => t.ms === 5000);
    assert.ok(debounce, 'nenhum timer de debounce foi agendado');

    // No bug, esta chamada lançava ReferenceError: flush is not defined — e no
    // app real ninguém estava lá pra pegar, porque o setTimeout do módulo não
    // tem try/catch em volta.
    assert.doesNotThrow(() => debounce.fn());

    await new Promise((r) => setImmediate(r));
    await new Promise((r) => setImmediate(r));

    assert.strictEqual(requisicoes.length, 1, 'o debounce não enviou o evento');
    assert.strictEqual(requisicoes[0].body.events[0].event, 'app_open');
  } finally {
    global.setTimeout = setTimeoutReal;
    global.clearTimeout = clearTimeoutReal;
  }
});

// ---------------------------------------------------------------------------
// DEDUPE — o relatório conta COUNT(DISTINCT session_id) por evento, então
// repetir o mesmo evento na mesma execução soma ZERO e só gasta banda/cota.
// ---------------------------------------------------------------------------

test('dedupe: paywall re-renderizando 8x no mesmo foco vira UM evento só', async () => {
  reset();
  for (let i = 0; i < 8; i++) funnel.paywallView('gate', 'Reconectar');
  await flushFunnel();

  assert.strictEqual(requisicoes.length, 1);
  assert.strictEqual(requisicoes[0].body.events.length, 1);
  assert.strictEqual(requisicoes[0].body.events[0].event, 'paywall_view');
});

test('dedupe respeita a VARIAÇÃO: cada muro (gate/onetime_lock/planos) conta uma vez', async () => {
  reset();
  funnel.paywallView('gate', 'Agir');
  funnel.paywallView('gate', 'Agir');
  funnel.paywallView('onetime_lock', 'Dream');
  funnel.paywallView('planos', 'Planos');
  await flushFunnel();

  const sources = requisicoes[0].body.events.map((e) => e.props.source);
  assert.deepStrictEqual(sources, ['gate', 'onetime_lock', 'planos']);
});

test('dedupe: app_open uma vez por execução, mesmo com o App remontando', async () => {
  reset();
  funnel.appOpen();
  funnel.appOpen();
  funnel.appOpen();
  assert.strictEqual(__funnelDebug().queue.filter((e) => e.event === 'app_open').length, 1);
});

test('once:false permite repetir de propósito, quando alguém realmente precisar', () => {
  reset();
  track('home_view', null, { once: false });
  track('home_view', null, { once: false });
  assert.strictEqual(__funnelDebug().queue.length, 2);
});

// ---------------------------------------------------------------------------
// PRIVACIDADE — a razão de este módulo ter uma allowlist própria e não só
// confiar no servidor.
// ---------------------------------------------------------------------------

test('PRIVACIDADE: nenhuma chave fora da allowlist sai do aparelho', async () => {
  reset();
  track('reading_done', {
    kind: 'tarot',
    // Tudo abaixo é dado pessoal/conteúdo e NÃO pode viajar. Se um dia alguém
    // passar isso por engano num ponto de disparo, tem que morrer aqui.
    title: 'Tarô de Amor — Passado, Presente e Futuro',
    body: 'texto inteiro da leitura',
    email: 'alguem@exemplo.com',
    nome: 'Maria',
    birthDate: '1990-04-12',
    city: 'São Paulo',
    userId: 'uuid-do-supabase',
  });
  await flushFunnel();

  const props = requisicoes[0].body.events[0].props;
  assert.deepStrictEqual(props, { kind: 'tarot' });
});

test('PRIVACIDADE: valor comprido (cara de texto de usuário) é descartado, não truncado', async () => {
  reset();
  track('reading_done', { kind: 'x'.repeat(41), source: 'home_card' });
  await flushFunnel();
  assert.deepStrictEqual(requisicoes[0].body.events[0].props, { source: 'home_card' });
});

test('valor com caractere de controle é descartado (ANSI não entra no relatório)', async () => {
  // O relatório é um script de TERMINAL (scripts/funil.js). Um valor com ESC
  // (0x1b) guardado no banco vira sequência ANSI obedecida na hora de ler o
  // funil — e o servidor recusaria o LOTE INTEIRO por causa dele, levando
  // junto os eventos bons.
  reset();
  track('reading_done', { kind: '\u001b[31mtarot', source: 'home_card' });
  track('paywall_view', { screen: 'linha1\nlinha2', mode: 'solo' }, { key: 'p2' });
  await flushFunnel();

  const eventos = requisicoes[0].body.events;
  assert.deepStrictEqual(eventos[0].props, { source: 'home_card' });
  assert.deepStrictEqual(eventos[1].props, { mode: 'solo' });
});

test('PRIVACIDADE: sessionId é aleatório, anônimo e persistente — nunca derivado de conta', async () => {
  reset();
  funnel.appOpen();
  await flushFunnel();

  const id = requisicoes[0].body.sessionId;
  // Mesma faixa que a rota valida (SESSION_RE em trackRoutes.js).
  assert.match(id, /^[A-Za-z0-9_-]{16,64}$/);
  assert.strictEqual(mem.get(FUNNEL_SESSION_KEY), id, 'tem que persistir pra contar a mesma pessoa amanhã');

  // Dois aparelhos "diferentes" (storage limpo) nunca geram o mesmo id.
  mem.clear();
  __funnelResetForTests();
  requisicoes = [];
  funnel.appOpen();
  await flushFunnel();
  assert.notStrictEqual(requisicoes[0].body.sessionId, id);
});

test('PRIVACIDADE: "apagar meus dados" mata o uuid e joga fora o que não foi enviado', async () => {
  reset();
  funnel.appOpen();
  await flushFunnel();
  assert.ok(mem.has(FUNNEL_SESSION_KEY));
  const idAntigo = requisicoes[0].body.sessionId;

  funnel.homeView('solo');
  assert.strictEqual(__funnelDebug().queue.length, 1);

  await resetFunnelSession();

  assert.strictEqual(mem.has(FUNNEL_SESSION_KEY), false, 'o uuid tem que sumir do aparelho');
  assert.strictEqual(__funnelDebug().queue.length, 0, 'o que estava na fila não pode ser enviado depois');
  assert.strictEqual(__funnelDebug().sessionId, null);

  // Depois de apagar, o aparelho volta a ser uma pessoa nova pro relatório.
  const antes = requisicoes.length;
  funnel.appOpen();
  await flushFunnel();
  assert.strictEqual(requisicoes.length, antes + 1);
  assert.notStrictEqual(requisicoes[antes].body.sessionId, idAntigo);
});

// ---------------------------------------------------------------------------
// APAGAMENTO NO SERVIDOR — "apagar meus dados" tem que valer dos DOIS lados.
// Sem isto, o app apagava o uuid do aparelho e as linhas continuavam no banco
// (POST /api/track já as tinha enviado) até a retenção de 90 dias vencer: uma
// promessa de eliminação cumprida pela metade.
// ---------------------------------------------------------------------------

test('PRIVACIDADE: apagar manda o servidor apagar o rastro daquela sessão', async () => {
  reset();
  funnel.appOpen();
  await flushFunnel();
  const id = requisicoes[0].body.sessionId;

  requisicoes = [];
  await resetFunnelSession();

  assert.strictEqual(requisicoes.length, 1, 'uma requisição de apagamento tem que sair');
  const pedido = requisicoes[0];
  assert.ok(String(pedido.url).endsWith('/api/track/forget'), pedido.url);
  assert.strictEqual(pedido.options.method, 'POST');
  // SÓ o uuid: mandar e-mail/id de conta "pra ajudar a achar" criaria
  // exatamente o vínculo que este módulo inteiro existe pra não ter.
  assert.deepStrictEqual(pedido.body, { sessionId: id });
});

test('PRIVACIDADE: apagar usa o uuid do STORAGE, mesmo sem nada em memória', async () => {
  // Caso real: a pessoa abre o app, vai direto no Perfil → Privacidade e toca
  // em "apagar tudo" sem que nenhum track() tenha chegado a resolver o id em
  // memória. O rastro de ONTEM (mesmo uuid, já no servidor) tem que morrer.
  reset();
  mem.set(FUNNEL_SESSION_KEY, 'sessao-de-ontem-0123456789');
  assert.strictEqual(__funnelDebug().sessionId, null);

  await resetFunnelSession();

  assert.strictEqual(requisicoes.length, 1);
  assert.deepStrictEqual(requisicoes[0].body, { sessionId: 'sessao-de-ontem-0123456789' });
  assert.strictEqual(mem.has(FUNNEL_SESSION_KEY), false);
});

test('apagar em aparelho que nunca mandou evento não fala com o servidor', async () => {
  reset();
  await resetFunnelSession();
  assert.strictEqual(requisicoes.length, 0, 'sem uuid não há o que apagar lá');
});

test('uuid corrompido no storage não vira pedido de apagamento inválido', async () => {
  reset();
  mem.set(FUNNEL_SESSION_KEY, 'curto'); // fora de SESSION_RE — o servidor daria 400
  await resetFunnelSession();
  assert.strictEqual(requisicoes.length, 0);
  assert.strictEqual(mem.has(FUNNEL_SESSION_KEY), false, 'e o lixo sai do aparelho do mesmo jeito');
});

test('rede fora não impede o apagamento LOCAL (a ordem é: apaga aqui, avisa lá)', async () => {
  reset();
  funnel.appOpen();
  await flushFunnel();
  modo = 'rede-fora';

  await assert.doesNotReject(resetFunnelSession());

  assert.strictEqual(mem.has(FUNNEL_SESSION_KEY), false, 'o aparelho fica limpo mesmo sem rede');
  assert.strictEqual(__funnelDebug().sessionId, null);
});

// ---------------------------------------------------------------------------
// ALLOWLIST DE EVENTOS — um nome fora da lista derrubaria o LOTE INTEIRO no
// servidor (validateBatch é tudo-ou-nada), levando junto os eventos bons.
// ---------------------------------------------------------------------------

test('evento fora da allowlist é descartado no aparelho, sem contaminar o lote', async () => {
  reset();
  track('app_open');
  track('checkout_finalizado'); // não existe
  track('paywall_view');
  await flushFunnel();

  assert.deepStrictEqual(
    requisicoes[0].body.events.map((e) => e.event),
    ['app_open', 'paywall_view']
  );
});

test('a allowlist local é exatamente a do servidor (13 eventos)', () => {
  assert.deepStrictEqual(
    [...FUNNEL_EVENTS].sort(),
    [
      'app_open', 'checkout_click', 'checkout_open', 'home_view', 'login_done', 'login_view',
      'onboarding_done', 'onboarding_start', 'paywall_view', 'plan_select', 'reading_done', 'reading_start',
      'today_line_tap',
    ].sort()
  );
});

// ---------------------------------------------------------------------------
// NUNCA LANÇA / NUNCA BLOQUEIA
// ---------------------------------------------------------------------------

test('track() é síncrona e não devolve promise — a UI nunca tem o que esperar', () => {
  reset();
  assert.strictEqual(track('app_open'), undefined);
});

test('nunca lança: argumentos absurdos', () => {
  reset();
  assert.doesNotThrow(() => track());
  assert.doesNotThrow(() => track(null));
  assert.doesNotThrow(() => track(123));
  assert.doesNotThrow(() => track('app_open', 'string em vez de objeto'));
  assert.doesNotThrow(() => track('app_open', ['array']));
  assert.doesNotThrow(() => track('home_view', { kind: { aninhado: true }, plan: NaN, mode: null }));
  assert.doesNotThrow(() => funnel.readingDone(undefined));
});

test('nunca lança: fetch estourando não vaza erro nem trava a fila pra sempre', async () => {
  reset();
  modo = 'lanca';
  track('app_open');
  await assert.doesNotReject(flushFunnel());
  assert.strictEqual(__funnelDebug().queue.length, 1, 'falha transitória mantém o evento pra tentar de novo');
});

test('nunca lança: AsyncStorage quebrado ainda deixa o funil funcionar nesta execução', async () => {
  reset();
  storageBroken = true;
  track('app_open');
  await assert.doesNotReject(flushFunnel());
  assert.strictEqual(requisicoes.length, 1, 'sem storage o id não persiste, mas o evento sai mesmo assim');
  assert.match(requisicoes[0].body.sessionId, /^[A-Za-z0-9_-]{16,64}$/);
});

test('nunca lança: resetFunnelSession com storage quebrado', async () => {
  reset();
  track('app_open');
  storageBroken = true;
  await assert.doesNotReject(resetFunnelSession());
  assert.strictEqual(__funnelDebug().queue.length, 0);
});

// ---------------------------------------------------------------------------
// FILA NÃO CRESCE SEM LIMITE
// ---------------------------------------------------------------------------

test('rede fora: o lote é descartado depois de 3 tentativas, a fila não vira bola de neve', async () => {
  reset();
  modo = 'rede-fora';
  track('app_open');

  await flushFunnel();
  assert.strictEqual(__funnelDebug().queue.length, 1, '1ª falha: segura');
  await flushFunnel();
  assert.strictEqual(__funnelDebug().queue.length, 1, '2ª falha: segura');
  await flushFunnel();
  assert.strictEqual(__funnelDebug().queue.length, 0, '3ª falha: descarta em silêncio');
  assert.strictEqual(requisicoes.length, 3);
});

test('400 do servidor (lote que nunca seria aceito) não fica em retry eterno', async () => {
  reset();
  modo = '400';
  track('app_open');
  await flushFunnel();
  assert.strictEqual(__funnelDebug().queue.length, 0, 'payload recusado sai da fila na hora');
  assert.strictEqual(requisicoes.length, 1, 'e não é reenviado');
});

test('500 do servidor conta como falha transitória (vale tentar de novo)', async () => {
  reset();
  modo = '500';
  track('app_open');
  await flushFunnel();
  assert.strictEqual(__funnelDebug().queue.length, 1);
});

test('a fila tem teto: um track() em laço não consome memória sem limite', () => {
  reset();
  for (let i = 0; i < 500; i++) track('reading_done', { kind: `k${i}` }, { key: `k${i}` });
  assert.strictEqual(__funnelDebug().queue.length, 30);
});

test('eventos que chegam DURANTE o envio não são jogados fora junto com o lote', async () => {
  reset();
  let liberar;
  const espera = new Promise((r) => {
    liberar = r;
  });
  global.fetch = async (url, options) => {
    requisicoes.push({ url, options, body: JSON.parse(options.body) });
    await espera;
    return { ok: true, status: 204 };
  };

  track('app_open');
  const envio = flushFunnel();
  await new Promise((r) => setTimeout(r, 0));
  track('home_view'); // entrou na fila com a requisição no ar
  liberar();
  await envio;

  assert.strictEqual(requisicoes[0].body.events.length, 1);
  assert.deepStrictEqual(__funnelDebug().queue.map((e) => e.event), ['home_view']);
});

// ---------------------------------------------------------------------------
// CICLO DE VIDA — o último evento antes do app ir pro fundo precisa sair.
// ---------------------------------------------------------------------------

test('app indo pro fundo (AppState) força o envio do que estava na fila', async () => {
  reset();
  appStateListeners.length = 0;
  track('app_open');
  assert.ok(appStateListeners.length > 0, 'o listener é instalado no primeiro track()');

  appStateListeners.forEach(({ handler }) => handler('background'));
  await new Promise((r) => setTimeout(r, 0));

  assert.strictEqual(requisicoes.length, 1);
  assert.strictEqual(requisicoes[0].body.events[0].event, 'app_open');
});
