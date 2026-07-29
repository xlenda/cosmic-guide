// Rastreamento PRÓPRIO de funil do Cosmic Guide — o lado servidor.
//
// ===========================================================================
// LINHA DE MOUNT — JÁ ESTÁ NO server.js (não é mais um passo pendente):
//
//   app.use("/api/track", require("./trackRoutes").trackRouter);
//
// Ela fica logo DEPOIS de `app.use(cors({ origin: ALLOWED_ORIGINS }))` e ANTES
// de `app.use(express.json({ limit: "10mb", ... }))`, e essa POSIÇÃO faz parte
// do contrato: o parser próprio deste router (16kb, abaixo) é o que vale pro
// /api/track, e o parser global de 10mb — que existe por causa das fotos em
// base64 da leitura de mão — nunca é aplicado a uma rota PÚBLICA de telemetria.
// Mover o mount pra depois do parser global quebra o caminho do
// navigator.sendBeacon (text/plain), porque o global reclama o corpo antes.
// NÃO REMOVER nem reordenar sem olhar os dois últimos testes de
// test/trackRoutes.http.test.js — eles existem só pra travar isto. Esta rota
// já ficou pronta, testada e sem a linha de mount uma vez: 15 testes verdes e
// 404 pra todo lote que o app mandava.
// ===========================================================================
//
// POR QUE ISTO EXISTE: ~40 pessoas entraram no app nos últimos dias e ZERO
// iniciaram checkout. Não há instrumentação nenhuma, então não se sabe ONDE
// elas param — toda melhoria de produto vira chute. O que já existe no app
// (lib/conversionTracking.js) dispara UM evento, o ÚLTIMO do funil, e está
// inerte porque EXPO_PUBLIC_FB_PIXEL_ID/EXPO_PUBLIC_GA_ID nunca foram
// configurados. Aquilo continua no lugar (serve pro Meta Ads no dia em que o
// dono configurar); isto aqui é COMPLEMENTAR e funciona no minuto em que
// subir: dado do próprio dono, no banco que já existe, sem terceiro no meio e
// sem ser comido por bloqueador de anúncio.
//
// PRIVACIDADE (inegociável — o app tem tela de LGPD e lida com dado sensível
// de nascimento). O que este módulo registra é "o que ACONTECEU", nunca "o
// que a pessoa ESCREVEU":
//   - NUNCA grava nome, e-mail, data/hora/cidade de nascimento, conteúdo de
//     leitura, texto de diário ou mensagem de chat. Nem por acidente: `props`
//     só aceita chaves de uma lista fixa e valores curtos (ver PROPS_KEYS).
//   - session_id é um uuid ALEATÓRIO gerado no aparelho, sem relação nenhuma
//     com a conta (Supabase). Serve só pra contar pessoas distintas por
//     degrau. É por ele ser anônimo que esta rota pode ser pública.
//   - IP não é gravado em lugar nenhum. Ele existe só na memória do
//     rate-limiter (express-rate-limit), como em toda rota daqui.
//   - Nada de log por requisição: além do volume, o log é outro lugar onde
//     dado vaza sem querer.
//   - "Apagar meus dados" apaga o rastro DE VERDADE, e não só no aparelho:
//     POST /api/track/forget (abaixo) some com as linhas desta sessão no
//     servidor. Sem essa rota, o app apagava o uuid localmente e as linhas
//     ficavam aqui até a retenção vencer — "apaguei" pela metade.
//
// O QUE ESTA ROTA *NÃO* RESOLVE SOZINHA (achado de auditoria, 29/07/2026):
// a tabela não tem IP, mas o nginx loga IP + horário de TODA requisição em
// /var/log/nginx/access.log. Quem tem root consegue casar o POST /api/track
// das 20:13:07 daquele IP com as linhas gravadas às 20:13:07 e assim ligar
// session_id ↔ IP ↔ (pela mesma janela de tempo, em outra rota) e-mail de
// assinante. A correção está FORA do node, no vhost: `access_log off` no
// location /api/track — arquivo pronto em server-patches/nginx/api-cosmicguide.
// Enquanto ele não for aplicado, a reidentificação por log continua possível
// pra quem já tem acesso de root à VPS.
//
// POR QUE PÚBLICA: a maior parte do funil acontece deslogado (abertura,
// onboarding, primeira leitura, paywall). Exigir login mataria justamente os
// degraus onde as 40 pessoas provavelmente estão parando.
const express = require("express");
const rateLimit = require("express-rate-limit");
const { db } = require("../infrastructure/db");
const { stripControlChars } = require("../infrastructure/textSanitize");

const router = express.Router();

// ---------------------------------------------------------------------------
// ALLOWLIST DE EVENTOS — o funil mínimo que responde "onde elas pararam".
//
// Nome curto, minúsculo, estável: uma vez que o app dispara e o dado começa a
// acumular, RENOMEAR um evento quebra a série histórica (o degrau some do
// relatório). Adicionar nome novo é barato; renomear, não. Texto livre nunca
// entra: sem esta lista, qualquer um enche a tabela com o que quiser.
// ---------------------------------------------------------------------------
const EVENTS = [
  "app_open", //         abriu o app (1x por sessão, na raiz do App.js)
  "onboarding_start", // viu a tela de escolha solo/casal (OnboardingChoiceScreen)
  "onboarding_done", //  salvou o perfil (signo solo ou quiz de casal concluído)
  "home_view", //        chegou na Home de verdade, já com perfil
  "reading_start", //    pediu a 1ª leitura (tarô, mão, café, sonho, mapa...)
  "reading_done", //     a leitura apareceu na tela pra ela
  "paywall_view", //     bateu no paywall (FeatureGate) ou abriu a tela Planos
  "plan_select", //      escolheu um plano (mensal/trimestral/anual)
  "login_view", //       o app pediu login (o checkout só renderiza logado)
  "login_done", //       login/cadastro concluído
  "checkout_click", //   clicou em assinar
  "checkout_open", //    o checkout da Hotmart abriu de fato na tela
];
const EVENT_SET = new Set(EVENTS);

// ---------------------------------------------------------------------------
// `props` — contexto MÍNIMO, opcional, com chave conhecida. Serve pra
// responder "qual leitura?", "qual plano?", "qual tela?" sem nunca carregar
// conteúdo. Chave desconhecida REJEITA o lote inteiro: é o que impede a rota
// de virar um saco de lixo pra qualquer campo que alguém tenha vontade de
// mandar (inclusive um campo com dado pessoal, mandado sem querer).
// ---------------------------------------------------------------------------
const PROPS_KEYS = new Set([
  "screen", //   nome da rota (ver routes.js) — ex.: "Planos", "Tarô"
  "kind", //     tipo de leitura — ex.: "tarot", "palm", "coffee", "dream"
  "plan", //     "trial" | "quarterly" | "annual"
  "mode", //     "solo" | "couple"
  "source", //   de onde veio o clique — ex.: "home_card", "gate"
  "lang", //     "pt" | "en" | "es"
  "platform", // "web" | "ios" | "android"
]);

const MAX_BATCH = 30; //        eventos por requisição
const MAX_PROPS_KEYS = 6; //    chaves por evento
const MAX_PROPS_JSON = 300; //  caracteres do JSON final de props
const MAX_VALUE_LEN = 40; //    caracteres por valor de prop
const MAX_EVENT_NAME_LEN = 40; // corta antes de comparar com a allowlist
// uuid v4 tem 36 caracteres; a faixa aceita um pouco a mais/menos pra não
// amarrar o app a um formato específico de geração, sem virar campo livre.
const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;

// Generoso de propósito, no padrão dos outros limiters do server.js (janela de
// 15 min): o app manda em LOTE, então uma sessão inteira gasta poucas dezenas
// de requisições. O teto alto é porque o mesmo IP costuma ser várias pessoas
// (NAT de operadora móvel, wi-fi de casa/empresa) — um limite apertado apagaria
// do relatório justamente quem está junto, e telemetria perdida é o problema
// que este módulo existe pra resolver.
const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// /forget é apagamento, não medição: acontece UMA vez, quando a pessoa toca em
// "apagar todos os dados". Teto bem mais apertado que o de gravação porque
// cada chamada é um DELETE (mesmo que não apague nada) e porque ninguém
// legítimo precisa de mais que isso.
const forgetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// Parser próprio: 16kb é ~50x o maior lote válido possível (30 eventos com
// props cheia). Ver a nota da linha de mount lá em cima — só vale se este
// router for montado antes do express.json global de 10mb.
//
// `text/plain` também é aceito de propósito: o jeito confiável de mandar o
// ÚLTIMO evento antes da pessoa fechar a aba é navigator.sendBeacon, e beacon
// só escapa do preflight de CORS com um Content-Type da lista segura
// (text/plain). Com application/json o navegador precisaria de um OPTIONS
// prévio no meio do unload — que é exatamente quando ele não acontece, e o
// evento se perde. O corpo continua sendo JSON e passa pela MESMA validação;
// o Content-Type aqui não decide nada além de quem parseia.
const jsonParser = express.json({ limit: "16kb", type: ["application/json", "text/plain"] });

// Preparo PREGUIÇOSO de propósito. Se o statement fosse preparado aqui no
// topo (padrão do resto do backend), este require passaria a ser mais um jeito
// de o processo INTEIRO não subir: `db.prepare` lança na hora se a tabela não
// existir, e basta a migração 010 não ter sido aplicada (deploy pela metade,
// rollback do arquivo .sql, banco restaurado de backup antigo) pra API inteira
// — checkout, webhook de pagamento, tudo — morrer na inicialização por causa
// de telemetria. Preparando na primeira chamada, o pior caso vira "tracking
// desligado e um erro no log", que é o que telemetria merece.
// A transação faz 30 inserts custarem um fsync só, em vez de 30 (o banco está
// em WAL e este é o caminho quente da rota).
let inserirLote = null;
function obterInserirLote() {
  if (inserirLote) return inserirLote;
  const stmt = db.prepare(
    "INSERT INTO funnel_events (session_id, event, props, created_at) VALUES (?, ?, ?, ?)"
  );
  inserirLote = db.transaction((rows) => {
    for (const r of rows) stmt.run(r.sessionId, r.event, r.props, r.createdAt);
  });
  return inserirLote;
}

// Apagamento por sessão (POST /forget). Preparo preguiçoso pelo MESMO motivo
// do insert acima: sem a migração 010 aplicada, `db.prepare` lançaria no
// require e derrubaria a API inteira por causa de telemetria.
let apagarSessao = null;
function obterApagarSessao() {
  if (!apagarSessao) {
    apagarSessao = db.prepare("DELETE FROM funnel_events WHERE session_id = ?");
  }
  return apagarSessao;
}

// Retenção: evento de navegação envelhece rápido e não tem valor nenhum depois
// de alguns meses — o que interessa é a tendência recente. Sem isto a tabela só
// cresce, e o banco inteiro (com dado de assinatura junto) fica mais pesado pra
// backup e pra tudo. Roda no máximo 1x por hora, fora do caminho da resposta, e
// falha em silêncio: limpeza NUNCA pode atrapalhar o app.
const RETENTION_DAYS = (() => {
  const n = Number.parseInt(process.env.TRACK_RETENTION_DAYS || "", 10);
  if (!Number.isFinite(n)) return 90;
  return Math.min(Math.max(n, 7), 3650);
})();
// TETO DE LINHAS — a segunda trava, contra ABUSO e não contra idade. A
// retenção sozinha não protege o disco: a rota é PÚBLICA por necessidade (o
// funil acontece deslogado), então qualquer um pode mandar lote válido atrás
// de lote válido. O rate-limiter segura UM IP (300 req × 30 eventos por 15
// min), mas nada segura mil IPs, e 90 dias de enchimento caberiam em dezenas
// de milhões de linhas — no MESMO arquivo SQLite onde mora a assinatura de
// quem pagou. 500 mil linhas ≈ 50 MB e ≈ 10x o volume real esperado (40
// pessoas/dia × ~15 eventos × 90 dias ≈ 54 mil linhas), então na operação
// normal este teto nunca encosta.
const MAX_ROWS = (() => {
  const n = Number.parseInt(process.env.TRACK_MAX_ROWS || "", 10);
  if (!Number.isFinite(n)) return 500000;
  return Math.min(Math.max(n, 10000), 50000000);
})();
const PRUNE_EVERY_MS = 60 * 60 * 1000;
let lastPruneAt = 0;

function schedulePrune() {
  const agora = Date.now();
  if (agora - lastPruneAt < PRUNE_EVERY_MS) return;
  lastPruneAt = agora;
  setImmediate(() => {
    try {
      const corte = new Date(agora - RETENTION_DAYS * 24 * 3600 * 1000).toISOString();
      db.prepare("DELETE FROM funnel_events WHERE created_at < ?").run(corte);
      // Depois da idade, o volume. `ORDER BY id DESC LIMIT 1 OFFSET N` acha o
      // id da N-ésima linha mais nova andando só no índice da chave primária;
      // devolve undefined (e não apaga nada) quando a tabela ainda não passou
      // do teto, que é o caso normal.
      const limite = db.prepare("SELECT id FROM funnel_events ORDER BY id DESC LIMIT 1 OFFSET ?").get(MAX_ROWS);
      if (limite) {
        const r = db.prepare("DELETE FROM funnel_events WHERE id <= ?").run(limite.id);
        console.error(`[api/track] teto de ${MAX_ROWS} linhas atingido — ${r.changes} linha(s) antiga(s) removida(s)`);
      }
    } catch (err) {
      console.error("[api/track] limpeza por retenção falhou:", err && err.message);
    }
  });
}

// Valor de prop: string curta (sem caracteres de controle invisíveis, mesmo
// tratamento do resto da API), número finito ou booleano. Qualquer outra coisa
// — objeto, array, null, função serializada — é recusada: é por aninhamento que
// um payload pequeno vira um payload gigante, e é por tipo estranho que texto
// de usuário entraria disfarçado.
// Caracteres de controle C0/C1 + DEL. stripControlChars() (usado logo abaixo)
// cobre os invisíveis de Unicode (zero-width, bidi), mas NÃO o ESC 0x1b nem
// quebra de linha/tab. Um valor com ESC (0x1b) seguido de sequência ANSI
// atravessaria a validação e ficaria guardado até alguém rodar
// `node scripts/funil.js` num terminal, que obedece a sequência. Como
// todo valor legítimo aqui é um slug curto ('tarot', 'annual', 'Planos'), a
// regra é simplesmente: nenhum caractere de controle, nunca.
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F-\u009F]/;

function normalizeValue(value) {
  if (typeof value === "string") {
    const limpo = stripControlChars(value).trim();
    if (!limpo || limpo.length > MAX_VALUE_LEN) return { ok: false };
    if (CONTROL_CHARS_RE.test(limpo)) return { ok: false };
    return { ok: true, value: limpo };
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return { ok: false };
    return { ok: true, value };
  }
  if (typeof value === "boolean") return { ok: true, value };
  return { ok: false };
}

function normalizeProps(props) {
  if (props === undefined || props === null) return { ok: true, json: null };
  if (typeof props !== "object" || Array.isArray(props)) {
    return { ok: false, error: "props deve ser um objeto" };
  }
  const chaves = Object.keys(props);
  if (chaves.length === 0) return { ok: true, json: null };
  if (chaves.length > MAX_PROPS_KEYS) {
    return { ok: false, error: `props aceita no máximo ${MAX_PROPS_KEYS} chaves` };
  }
  const limpo = {};
  for (const chave of chaves) {
    if (!PROPS_KEYS.has(chave)) {
      // Recusa explícita (e não "ignora a chave") de propósito: se o app
      // começar a mandar uma chave nova, o agente do app descobre na hora, em
      // vez de achar que está medindo algo que nunca foi gravado.
      return { ok: false, error: `props.${chave} não é uma chave conhecida` };
    }
    const valor = normalizeValue(props[chave]);
    if (!valor.ok) {
      return { ok: false, error: `props.${chave} inválida (string até ${MAX_VALUE_LEN}, número ou booleano)` };
    }
    limpo[chave] = valor.value;
  }
  const json = JSON.stringify(limpo);
  if (json.length > MAX_PROPS_JSON) {
    return { ok: false, error: `props excede ${MAX_PROPS_JSON} caracteres` };
  }
  return { ok: true, json };
}

// Valida o lote INTEIRO antes de gravar qualquer coisa: ou entra tudo, ou não
// entra nada. Um lote meio-gravado produziria um funil silenciosamente errado —
// e um funil errado é pior que funil nenhum, porque as decisões continuam.
function validateBatch(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "corpo deve ser { sessionId, events: [...] }" };
  }
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (!SESSION_RE.test(sessionId)) {
    return { ok: false, error: "sessionId inválido (16-64 caracteres, [A-Za-z0-9_-])" };
  }
  const events = body.events;
  if (!Array.isArray(events) || events.length === 0) {
    return { ok: false, error: "events (array não vazio) é obrigatório" };
  }
  if (events.length > MAX_BATCH) {
    return { ok: false, error: `events aceita no máximo ${MAX_BATCH} eventos por requisição` };
  }

  const createdAt = new Date().toISOString();
  const rows = [];
  for (const item of events) {
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return { ok: false, error: "cada evento deve ser um objeto { event, props? }" };
    }
    const nome = typeof item.event === "string" ? item.event.trim() : "";
    if (!nome || nome.length > MAX_EVENT_NAME_LEN || !EVENT_SET.has(nome)) {
      // A mensagem não devolve a allowlist inteira: quem integra tem o arquivo,
      // e quem está sondando não ganha um mapa de graça.
      return { ok: false, error: "event desconhecido" };
    }
    const props = normalizeProps(item.props);
    if (!props.ok) return { ok: false, error: props.error };
    // created_at é sempre a hora do SERVIDOR — o relógio do aparelho pode estar
    // em qualquer ano, e um timestamp vindo do cliente é campo controlado pelo
    // cliente (dá pra plantar evento no passado e sujar o histórico).
    rows.push({ sessionId, event: nome, props: props.json, createdAt });
  }
  return { ok: true, rows };
}

// POST /api/track — lote de eventos de funil.
//
// Corpo:  { "sessionId": "<uuid anônimo do aparelho>",
//           "events": [ { "event": "paywall_view", "props": { "screen": "Planos" } } ] }
// Resposta: 204 sem corpo (sucesso) | 400 { error } (lote recusado) | 429 (limite)
//
// Nunca 500, nunca exceção que suba pro middleware de erro: telemetria não
// pode derrubar nem atrasar NADA do app. Se o banco falhar na hora de gravar,
// a resposta continua sendo 204 — perder um evento é aceitável, quebrar a tela
// de quem está usando o produto não é.
router.post("/", trackLimiter, jsonParser, (req, res) => {
  try {
    // ANTES da validação de propósito: a limpeza roda em setImmediate (nunca
    // no caminho da resposta) e precisa acontecer também quando o lote é
    // RECUSADO — senão bastava enviar só payload inválido pra tabela crescer
    // sem nunca ser podada.
    schedulePrune();
    const resultado = validateBatch(req.body);
    if (!resultado.ok) return res.status(400).json({ error: resultado.error });

    try {
      obterInserirLote()(resultado.rows);
    } catch (err) {
      console.error("[api/track] falha ao gravar lote:", err && err.message);
    }

    res.status(204).end();
  } catch (err) {
    // Rede de segurança final (corpo malformado que escape da validação, JSON
    // quebrado, o que for): responde e segue a vida.
    console.error("[api/track] erro inesperado:", err && err.message);
    if (!res.headersSent) res.status(204).end();
  }
});

// POST /api/track/forget — "apagar meus dados" chegando até aqui.
//
// Corpo:  { "sessionId": "<uuid anônimo do aparelho>" }
// Resposta: 204 sem corpo, SEMPRE (sucesso, sessão inexistente, banco fora do
//           ar — tudo 204) | 400 { error } (sessionId fora do formato) | 429.
//
// POR QUE EXISTE: sem ela, "Apagar todos os dados" (PrivacyScreen → clearAll)
// apagava o uuid do APARELHO e deixava as linhas aqui até a retenção vencer —
// ou seja, prometia apagar e apagava pela metade. Não é o pedido de acesso da
// LGPD (não existe nada aqui pra devolver: a tabela não sabe quem é a pessoa),
// é o de ELIMINAÇÃO, e ele agora vale dos dois lados.
//
// POR QUE PODE SER PÚBLICA: o corpo é só um uuid aleatório de 128 bits que a
// própria pessoa gerou no aparelho. Quem quisesse apagar o rastro de outra
// pessoa teria que ADIVINHAR o uuid dela, e o estrago máximo seria apagar
// evento de navegação de uma sessão — não existe aqui nada que dê dinheiro,
// acesso ou identidade. Por isso também não devolvemos quantas linhas saíram:
// um contador transformaria a rota num oráculo de "este uuid já existiu?".
router.post("/forget", forgetLimiter, jsonParser, (req, res) => {
  try {
    const corpo = req.body;
    const sessionId = corpo && typeof corpo.sessionId === "string" ? corpo.sessionId.trim() : "";
    if (!SESSION_RE.test(sessionId)) {
      return res.status(400).json({ error: "sessionId inválido (16-64 caracteres, [A-Za-z0-9_-])" });
    }
    try {
      obterApagarSessao().run(sessionId);
    } catch (err) {
      // Tabela ausente (migração não aplicada) ou banco travado: some em
      // silêncio, exatamente como a gravação. O aparelho já apagou o lado dele.
      console.error("[api/track/forget] falha ao apagar sessão:", err && err.message);
    }
    res.status(204).end();
  } catch (err) {
    console.error("[api/track/forget] erro inesperado:", err && err.message);
    if (!res.headersSent) res.status(204).end();
  }
});

// Um corpo que nem é JSON válido faz o express.json lançar ANTES do handler —
// sem este tratador o erro subiria pro middleware de erro central do server.js
// e viraria um 500 pra uma chamada de telemetria. Aqui vira 400, sem barulho.
router.use((err, _req, res, next) => {
  if (!err) return next();
  if (res.headersSent) return next(err);
  res.status(400).json({ error: "corpo inválido" });
});

module.exports = { trackRouter: router, EVENTS, PROPS_KEYS, MAX_BATCH, MAX_PROPS_JSON, validateBatch };
