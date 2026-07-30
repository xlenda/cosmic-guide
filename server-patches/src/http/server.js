const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { SubscriptionRepository } = require("../infrastructure/SubscriptionRepository");
const { HotmartPaymentProvider } = require("../infrastructure/HotmartPaymentProvider");
const { AnthropicChatProvider } = require("../infrastructure/AnthropicChatProvider");
const { PushSubscriptionRepository } = require("../infrastructure/PushSubscriptionRepository");
const { ConversionTrackingProvider } = require("../infrastructure/ConversionTrackingProvider");
const { socialRouter } = require("./socialRoutes");
const { buildAdminRouter } = require("./adminRoutes");
const { buildAccountRouter } = require("./accountRoutes");
const { requireAuth, requireVerifiedEmail, optionalAuth } = require("./accountAuth");
const { compressImage } = require("../infrastructure/imageProcessing");
const { InitiateCheckoutUseCase } = require("../application/InitiateCheckoutUseCase");
const { ProcessWebhookUseCase } = require("../application/ProcessWebhookUseCase");
const { GetSubscriptionStatusUseCase } = require("../application/GetSubscriptionStatusUseCase");
const { GetAccountSubscriptionUseCase } = require("../application/GetAccountSubscriptionUseCase");
const { ClaimSubscriptionUseCase } = require("../application/ClaimSubscriptionUseCase");
const { stripControlChars } = require("../infrastructure/textSanitize");
const { timingSafeStringEqual } = require("../infrastructure/timingSafeCompare");

const PORT = process.env.PORT || 3005;
const HOTMART_HOTTOK = process.env.HOTMART_HOTTOK || "";
// 3 ofertas reais do mesmo produto Hotmart, pra pessoa escolher o plano na
// hora de assinar (Planos.jsx) em vez de só existir a oferta mensal —
// achado real de auditoria de retenção, 25/07/2026. Os 2 códigos novos têm
// fallback com os valores reais já cadastrados no painel Hotmart (não são
// segredo — o offer code roda no navegador do cliente, dentro do Checkout
// Elements), mas continuam configuráveis por env var se um dia mudarem.
const HOTMART_OFFER_CODE = process.env.HOTMART_OFFER_CODE || "";
const HOTMART_OFFER_CODE_QUARTERLY = process.env.HOTMART_OFFER_CODE_QUARTERLY || "7b1wqipw";
const HOTMART_OFFER_CODE_ANNUAL = process.env.HOTMART_OFFER_CODE_ANNUAL || "lb6plj87";
// Lista separada por vírgula — este backend atende DOIS frontends (o funil em
// oddpro.pro e o app Cosmic Guide em cosmicguide.cloud). Antes disso só um
// valor era possível, então cosmicguide.cloud nunca batia com o Access-Control-
// Allow-Origin devolvido e o navegador bloqueava silenciosamente toda chamada
// de /api/chat, /api/palm, /api/coffee e /api/dream vinda do app — o fallback
// mockado honesto (lib/aiClient.js no app) escondia o erro, então a IA real
// nunca respondeu em produção sem que ninguém percebesse.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGIN || "https://oddpro.pro")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "";
// Sem essa var configurada, /api/admin/* responde 503 em vez de aceitar
// qualquer token (nunca abre a rota "sem querer" por falta de configuração).
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";
// Confirmação de Purchase server-side (Meta Conversions API) — sem as duas
// vars configuradas, nenhuma chamada é feita (nunca inventa um Pixel ID nem
// tenta mandar evento pra um destino que não existe). Ver
// ConversionTrackingProvider.js e uso em ProcessWebhookUseCase.
const FB_PIXEL_ID = process.env.FB_PIXEL_ID || "";
const FB_CONVERSIONS_API_TOKEN = process.env.FB_CONVERSIONS_API_TOKEN || "";

// Troca de processador de pagamento no futuro = trocar só esta linha por outra classe
// que implemente a mesma interface PaymentProvider. Nada abaixo precisa mudar.
const paymentProvider = new HotmartPaymentProvider({
  hottok: HOTMART_HOTTOK,
  offerCodes: { trial: HOTMART_OFFER_CODE, quarterly: HOTMART_OFFER_CODE_QUARTERLY, annual: HOTMART_OFFER_CODE_ANNUAL },
});
const repository = new SubscriptionRepository();
const pushRepository = new PushSubscriptionRepository();

const conversionTracker =
  FB_PIXEL_ID && FB_CONVERSIONS_API_TOKEN
    ? new ConversionTrackingProvider({ pixelId: FB_PIXEL_ID, accessToken: FB_CONVERSIONS_API_TOKEN })
    : null;

const initiateCheckout = new InitiateCheckoutUseCase(repository, paymentProvider);
const processWebhook = new ProcessWebhookUseCase(repository, paymentProvider, conversionTracker);
const getSubscriptionStatus = new GetSubscriptionStatusUseCase(repository);
// Acesso resolvido pela CONTA (sub do JWT do Supabase) em vez de pelo aparelho
// — o correlationCode guardado no AsyncStorage vira só um ponteiro de fallback.
const getAccountSubscription = new GetAccountSubscriptionUseCase(repository);
const claimSubscription = new ClaimSubscriptionUseCase(repository, getAccountSubscription);

// Sem chave configurada, os endpoints /api/chat, /api/palm, /api/coffee e /api/dream
// respondem 503 em vez de derrubar o processo — permite subir o deploy antes de a chave existir.
const aiProvider = ANTHROPIC_API_KEY ? new AnthropicChatProvider({ apiKey: ANTHROPIC_API_KEY }) : null;

const app = express();
// Sem isso, express-rate-limit chaveia por req.ip = o socket do nginx
// (127.0.0.1), não o IP real do visitante — todo o tráfego cai no MESMO
// balde, então um abusador esgota o limite pra todo mundo e o "limite por
// IP" dos comentários abaixo nunca existiu de verdade. Também deixava o
// recheck de assinatura (a cada 5min, CoupleContext.js no app) tomar 429
// esporádico com poucas dezenas de usuários ativos (achado real de
// auditoria, 25/07/2026). "1" = confia só no primeiro proxy da cadeia
// (nginx), que é exatamente a topologia real do VPS.
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS }));

// Rastreamento PRÓPRIO de funil (src/http/trackRoutes.js + migração 010) — a
// rota que responde "onde as ~40 pessoas que entraram no app pararam". Ela tem
// o PRÓPRIO parser de corpo (16kb, e aceita text/plain por causa do
// navigator.sendBeacon), então precisa vir ANTES do express.json global de
// 10mb logo abaixo: o body-parser pula quando o corpo já foi lido, e um teto
// de 10mb numa rota PÚBLICA de telemetria seria um convite. Depois do
// cors() porque o app manda de outra origem (cosmicguide.cloud) e o preflight
// é respondido ali em cima.
// Carregada com require preguiçoso e dentro de try/catch: telemetria nunca
// pode impedir a API (checkout, webhook de pagamento) de subir.
try {
  app.use("/api/track", require("./trackRoutes").trackRouter);
} catch (err) {
  console.error("[api/track] rota de funil não montada:", err && err.message);
}

app.use(
  express.json({
    limit: "10mb", // fotos em base64 (leitura de mão) passam do limite padrão de 100kb
    verify: (req, _res, buf) => {
      req.rawBody = buf.toString("utf8");
    },
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Sem isso, qualquer um que descubra a URL pode martelar os endpoints de IA
// (cada chamada custa de verdade na conta da Anthropic) ou spammar criação de
// assinaturas pendentes. Limite por IP.
//
// 20/15min puniu um usuário REAL: o testador percorreu as ~10 leituras do app
// em sequência (uso legítimo de quem acabou de assinar) e o "lapidar com IA"
// começou a falhar no meio — cada leitura gasta 1-2 chamadas, então 10 telas
// estouram 20 fácil (29/07/2026). 60/15min ainda barra script automatizado
// (um loop dispara centenas por minuto) sem punir o assinante empolgado — e o
// teto de custo real continua sendo o contador diário de ai_usage logo abaixo,
// que é por instalação e não por IP.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// Contador diário de chamadas de IA (tabela ai_usage, migração 006) — cada
// chamada custa dinheiro real na Anthropic; sem contar, não dá pra saber se
// o preço da assinatura cobre o uso (viabilidade) nem quando oferecer pacote
// de tokens pra usuário pesado. Best-effort: falha de contagem NUNCA derruba
// a chamada em si.
const { db: usageDb } = require("../infrastructure/db");
const countAiUsageStmt = usageDb.prepare(
  `INSERT INTO ai_usage (day, endpoint, count) VALUES (?, ?, 1)
   ON CONFLICT(day, endpoint) DO UPDATE SET count = count + 1`
);
function countAiUsage(endpoint) {
  try {
    countAiUsageStmt.run(new Date().toISOString().slice(0, 10), endpoint);
  } catch {}
}

// Sufixo dos endpoints contados que NÃO são gente: hoje só o canary. Quem lê a
// métrica (rota admin /ai-usage) usa isto pra separar as duas contas.
const CANARY_SUFFIX = ":canary";

// O canary (scripts/canary-check.sh, no cron de 15 em 15 minutos) faz uma
// chamada de IA REAL em /api/chat de propósito — é assim que ele detecta
// crédito da Anthropic zerado, coisa que um /health 200 nunca pegaria. O
// efeito colateral: 4 chamadas por hora, 96 por dia, TODAS gravadas na
// ai_usage como se fossem conversa de usuário. Medido no banco em 29/07/2026:
// 96 "chat" no dia 28, 97 no dia 27 — e o uso humano real desses dias era
// zero. A única métrica que dizia "o Chat Espiritual está sendo usado" estava
// medindo o próprio monitoramento, e é com ela que se decide preço de
// assinatura e pacote de tokens.
//
// A chamada continua acontecendo (o canary tem que ser real pra servir pra
// algo) e continua sendo contada — só passa a ser contada num balde separado
// ("chat:canary"), em vez de sumir: o custo na Anthropic é real e precisa
// aparecer em algum lugar, e a linha também serve de prova de que o canary
// rodou.
//
// Três condições, todas obrigatórias:
//   1. o header que só o canary manda (curl -H 'X-Canary: 1');
//   2. sem X-Forwarded-For — tráfego de gente entra pelo nginx, que sempre
//      põe esse header; o canary bate direto na porta 3005;
//   3. peer TCP no loopback.
// Um cliente da internet não consegue satisfazer (2) e (3) passando pelo
// nginx, então ninguém "esconde" uso pago forjando o header.
function ehCanary(req) {
  if (req.headers["x-canary"] !== "1") return false;
  if (req.headers["x-forwarded-for"]) return false;
  const peer = req.socket?.remoteAddress || "";
  return peer === "127.0.0.1" || peer === "::1" || peer === "::ffff:127.0.0.1";
}

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// optionalAuth: usa o JWT do Supabase SE ele vier (o app sempre manda — só
// renderiza o checkout com usuário logado), mas nunca devolve 401 sem ele, pra
// não quebrar o funil web antigo em oddpro.pro, que não tem Supabase nenhum.
app.post("/api/checkout/initiate", checkoutLimiter, optionalAuth, async (req, res) => {
  try {
    // amountCents/currency NÃO são mais aceitos do body — preço é decidido
    // só pelo servidor a partir do plano (ver PLAN_PRICING no use case).
    const { coupleName, customerEmail, plan, scope } = req.body || {};
    // `scope` só decide em qual "balde" (casal/solo) a idempotência olha — não
    // é fronteira de segurança: mentir nele no máximo permite comprar um
    // segundo plano que a pessoa vai pagar. O que NÃO vem mais do body é o
    // e-mail quando há sessão: aí vale sempre o do token verificado.
    const result = await initiateCheckout.execute({
      coupleName,
      customerEmail,
      plan,
      scope,
      supabaseUserId: req.userId || null,
      accountEmail: req.userEmail || null,
    });
    res.json(result);
  } catch (err) {
    // Antes vazava err.message cru pro cliente — único lugar da API que fazia
    // isso, podendo expor detalhe interno (erro de driver do banco, mensagem
    // de exceção do provider de pagamento). Achado real de auditoria (18/07/2026).
    console.error("[api/checkout/initiate] erro:", err.message);
    res.status(500).json({ error: "falha ao iniciar checkout" });
  }
});

// Única rota pública sem rate limiter até então — checkout, IA, webhook,
// push e admin já tinham o seu. Consulta pública (não exige nenhuma prova de
// posse do correlationCode) e barata o bastante pra ser martelada sem
// limite. Achado real de auditoria (19/07/2026).
const publicReadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

// Rotas de assinatura pela CONTA (GET /me, POST /claim). Precisam ser
// registradas ANTES da rota por código abaixo: o Express casa na ORDEM de
// registro, e "/api/subscription/me" também casa com ":correlationCode" — se a
// antiga viesse primeiro, /me responderia 404 "não encontrado" pra sempre.
// A rota por código continua exatamente como estava (pública, mesmo limiter,
// mesma resposta): ela é a rede de segurança de quem está deslogado, de quem já
// tem código salvo no aparelho e das 14 pendências legadas sem e-mail.
app.use(
  "/api/subscription",
  buildAccountRouter({ getAccountSubscription, claimSubscription, requireAuth, requireVerifiedEmail })
);

app.get("/api/subscription/:correlationCode", publicReadLimiter, (req, res) => {
  const result = getSubscriptionStatus.execute({ correlationCode: req.params.correlationCode });
  if (!result) return res.status(404).json({ error: "não encontrado" });
  res.json(result);
});

// Mesmo limite do maxLength={500} do TextInput em ChatScreen.js — o client já
// trava a digitação nesse tamanho, isso aqui é a garantia server-side (um
// cliente alterado ou uma chamada direta à API não deve conseguir gastar
// tokens da Anthropic com uma mensagem gigante).
const CHAT_MESSAGE_MAX_LENGTH = 500;

app.post("/api/chat", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { personaId, message, history } = req.body || {};
    if (!message) return res.status(400).json({ error: "message é obrigatório" });
    if (typeof message !== "string" || message.length > CHAT_MESSAGE_MAX_LENGTH) {
      return res.status(400).json({ error: `message deve ter no máximo ${CHAT_MESSAGE_MAX_LENGTH} caracteres` });
    }
    const reply = await aiProvider.chat({ personaId, message, history });
    console.log("[api/chat] sucesso");
    // Único endpoint que o canary chama — ver ehCanary() acima.
    countAiUsage(ehCanary(req) ? `chat${CANARY_SUFFIX}` : "chat");
    res.json({ reply });
  } catch (err) {
    console.error("[api/chat] erro:", err.message);
    res.status(500).json({ error: "falha ao gerar resposta" });
  }
});

app.post("/api/palm", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzePalm(compressed);
    console.log("[api/palm] sucesso");
    countAiUsage("palm");
    res.json(reading);
  } catch (err) {
    console.error("[api/palm] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/coffee", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeCoffee(compressed);
    console.log("[api/coffee] sucesso");
    countAiUsage("coffee");
    res.json(reading);
  } catch (err) {
    console.error("[api/coffee] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/moles", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeMoles(compressed);
    console.log("[api/moles] sucesso");
    countAiUsage("moles");
    res.json(reading);
  } catch (err) {
    console.error("[api/moles] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/foot", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeFoot(compressed);
    console.log("[api/foot] sucesso");
    countAiUsage("foot");
    res.json(reading);
  } catch (err) {
    console.error("[api/foot] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/face", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeFace(compressed);
    console.log("[api/face] sucesso");
    countAiUsage("face");
    res.json(reading);
  } catch (err) {
    console.error("[api/face] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

// Mesmo limite do maxLength={2000} do TextInput em DreamScreen.js — mesma
// lógica do CHAT_MESSAGE_MAX_LENGTH acima.
const DREAM_TEXT_MAX_LENGTH = 2000;

app.post("/api/dream", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { dreamText } = req.body || {};
    if (!dreamText) return res.status(400).json({ error: "dreamText é obrigatório" });
    if (typeof dreamText !== "string" || dreamText.length > DREAM_TEXT_MAX_LENGTH) {
      return res.status(400).json({ error: `dreamText deve ter no máximo ${DREAM_TEXT_MAX_LENGTH} caracteres` });
    }
    const reading = await aiProvider.interpretDream({ dreamText });
    console.log("[api/dream] sucesso");
    countAiUsage("dream");
    res.json(reading);
  } catch (err) {
    console.error("[api/dream] erro:", err.message);
    res.status(500).json({ error: "falha ao interpretar o sonho" });
  }
});

const INSIGHT_TRANSCRIPT_MAX_LENGTH = 2000;

app.post("/api/enhance-insight", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { transcript, readingType, readingTitle } = req.body || {};
    if (!transcript) return res.status(400).json({ error: "transcript é obrigatório" });
    if (typeof transcript !== "string" || transcript.length > INSIGHT_TRANSCRIPT_MAX_LENGTH) {
      return res.status(400).json({ error: `transcript deve ter no máximo ${INSIGHT_TRANSCRIPT_MAX_LENGTH} caracteres` });
    }
    const result = await aiProvider.enhanceInsight({ transcript, readingType, readingTitle });
    console.log("[api/enhance-insight] sucesso");
    countAiUsage("enhance-insight");
    res.json(result);
  } catch (err) {
    console.error("[api/enhance-insight] erro:", err.message);
    res.status(500).json({ error: "falha ao organizar o insight" });
  }
});

// Feed social só pra usuários solo (sem parceiro pareado — ver isCouple no
// app); Reconectar/Agir e o resto do conteúdo de casal nunca passam por aqui.
// Cada rota exige um JWT válido do Supabase (ver socialAuth.js).
app.use("/api/social", socialRouter);

// Rotas de suporte/admin (buscar/forçar status de assinatura) — protegidas
// por ADMIN_TOKEN (header X-Admin-Token), nunca abertas sem essa var setada.
app.use("/api/admin", buildAdminRouter({ repository, adminToken: ADMIN_TOKEN }));

// Web Push — o app Cosmic Guide roda só como web (sem publicação em loja),
// então notificação de celular só existe através disso (ver lib/webPush.js no
// app): a chave pública é a mesma pra todo mundo (por definição, é pública),
// subscribe/unsubscribe guardam/apagam a inscrição real do navegador da
// pessoa, junto do signo dela (não-sensível) pra personalizar o envio diário.
const pushLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

app.get("/api/push/vapid-public-key", (_req, res) => {
  if (!VAPID_PUBLIC_KEY) return res.status(503).json({ error: "Web Push não configurado no servidor" });
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Sem essa allowlist, /api/push/subscribe (rota pública, sem auth — qualquer
// pessoa pode registrar um Web Push do próprio navegador) aceitava QUALQUER
// string como endpoint. Os crons diários (send-daily-push.js,
// send-streak-risk-push.js) chamam webpush.sendNotification pra cada
// endpoint salvo, então um endpoint apontando pra um IP/porta interna do VPS
// (compartilhado com outros processos pm2) faria o servidor disparar uma
// requisição HTTPS pra lá todo dia — SSRF cego. Só os serviços de push reais
// dos navegadores suportados chegam até aqui de verdade; qualquer outra
// coisa é sempre uma tentativa de abuso, nunca um caso de uso legítimo.
const { isAllowedPushEndpoint } = require("../infrastructure/pushAllowlist");

app.post("/api/push/subscribe", pushLimiter, (req, res) => {
  try {
    const { subscription, sign } = req.body || {};
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: "subscription (endpoint + keys) é obrigatório" });
    }
    if (!isAllowedPushEndpoint(subscription.endpoint)) {
      return res.status(400).json({ error: "subscription.endpoint inválido" });
    }
    const { p256dh, auth } = subscription.keys;
    if (!p256dh || !auth) return res.status(400).json({ error: "subscription.keys.p256dh e .auth são obrigatórios" });

    // sign.name nunca passava por sanitização nenhuma (ao contrário do feed
    // social) — mesmo risco de spoofing visual via caracteres de controle
    // Unicode, só que na própria notificação da pessoa (achado real de
    // auditoria, 25/07/2026).
    const cleanSignName = sign && sign.name ? stripControlChars(String(sign.name)).slice(0, 40) : null;

    pushRepository.save({
      endpoint: subscription.endpoint,
      p256dh,
      auth,
      signName: cleanSignName,
      signIcon: sign && sign.icon,
    });
    console.log("[api/push/subscribe] inscrição salva");
    res.json({ ok: true });
  } catch (err) {
    console.error("[api/push/subscribe] erro:", err.message);
    res.status(500).json({ error: "falha ao salvar inscrição" });
  }
});

// Exige a chave `auth` da própria inscrição (só quem tem a PushSubscription
// de verdade no navegador a conhece) antes de aceitar mexer num endpoint —
// sem isso, quem soubesse/adivinhasse o endpoint de outra pessoa podia
// silenciar as notificações dela ou forjar o streak dela (achado real de
// auditoria, 25/07/2026). Endpoint desconhecido responde 404 (nada a provar);
// auth ausente ou errada responde 403 (achado real, mas não é dono).
function verifyPushOwnership(endpoint, auth) {
  const row = pushRepository.findByEndpoint(endpoint);
  if (!row) return { ok: false, status: 404, error: "inscrição não encontrada" };
  if (!auth || !timingSafeStringEqual(auth, row.auth)) {
    return { ok: false, status: 403, error: "não autorizado" };
  }
  return { ok: true };
}

app.post("/api/push/sync-streak", pushLimiter, (req, res) => {
  try {
    const { endpoint, auth, lastActiveDate, currentStreak } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: "endpoint é obrigatório" });
    if (typeof lastActiveDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(lastActiveDate)) {
      return res.status(400).json({ error: "lastActiveDate deve ser YYYY-MM-DD" });
    }
    if (!Number.isInteger(currentStreak) || currentStreak < 0) {
      return res.status(400).json({ error: "currentStreak deve ser um inteiro >= 0" });
    }
    const ownership = verifyPushOwnership(endpoint, auth);
    if (!ownership.ok) return res.status(ownership.status).json({ error: ownership.error });
    pushRepository.updateStreak({ endpoint, lastActiveDate, currentStreak });
    res.json({ ok: true });
  } catch (err) {
    console.error("[api/push/sync-streak] erro:", err.message);
    res.status(500).json({ error: "falha ao sincronizar sequência" });
  }
});

app.post("/api/push/sync-diary", pushLimiter, (req, res) => {
  try {
    const { endpoint, auth, lastDiaryDate } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: "endpoint é obrigatório" });
    if (typeof lastDiaryDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(lastDiaryDate)) {
      return res.status(400).json({ error: "lastDiaryDate deve ser YYYY-MM-DD" });
    }
    const ownership = verifyPushOwnership(endpoint, auth);
    if (!ownership.ok) return res.status(ownership.status).json({ error: ownership.error });
    pushRepository.updateDiaryDate({ endpoint, lastDiaryDate });
    res.json({ ok: true });
  } catch (err) {
    console.error("[api/push/sync-diary] erro:", err.message);
    res.status(500).json({ error: "falha ao sincronizar diário" });
  }
});

// Convite de casal com notificação — quem convida gera um código atrelado à
// PROPRIA inscrição de push (prova de posse via verifyPushOwnership, mesma
// trava do sync-streak); quando o par abre o link e o app chama /accept, o
// servidor notifica o convidador na hora. /accept é público de propósito (o
// par ainda não tem nada registrado), mas: código é aleatório de 16 hex
// (inguessável), aceita UMA vez só (markAccepted atômico), rate-limited, e a
// resposta é sempre genérica (não vaza se um código existe ou não).
const { CoupleInviteRepository } = require("../infrastructure/CoupleInviteRepository");
const inviteRepository = new CoupleInviteRepository();
const webpush = require("web-push");
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT || "mailto:contato@cosmicguide.cloud", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

app.post("/api/invite/create", pushLimiter, (req, res) => {
  try {
    const { endpoint, auth, coupleName } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: "endpoint é obrigatório" });
    const ownership = verifyPushOwnership(endpoint, auth);
    if (!ownership.ok) return res.status(ownership.status).json({ error: ownership.error });
    const cleanName = coupleName ? stripControlChars(String(coupleName)).slice(0, 80) : null;
    const { code } = inviteRepository.create({ inviterEndpoint: endpoint, coupleName: cleanName });
    res.json({ code });
  } catch (err) {
    console.error("[api/invite/create] erro:", err.message);
    res.status(500).json({ error: "falha ao criar convite" });
  }
});

app.post("/api/invite/accept", pushLimiter, async (req, res) => {
  // Resposta sempre { ok: true } (mesmo pra código inexistente/já aceito) —
  // o aceite é cortesia de notificação, nunca um gate: o perfil do casal já
  // foi salvo no aparelho do par pelos params da URL antes desta chamada.
  res.json({ ok: true });
  try {
    const { code } = req.body || {};
    if (typeof code !== "string" || !/^[a-f0-9]{16}$/.test(code)) return;
    const invite = inviteRepository.findByCode(code);
    if (!invite || !inviteRepository.markAccepted(code)) return;

    const row = pushRepository.findByEndpoint(invite.inviter_endpoint);
    if (!row || !isAllowedPushEndpoint(row.endpoint)) return;
    const payload = JSON.stringify({
      title: "💜 Seu par entrou no Cosmic Guide!",
      body: invite.couple_name
        ? `${invite.couple_name} agora estão juntos no app — as leituras de casal já estão liberadas pra explorar.`
        : "O convite foi aceito — as leituras de casal já estão liberadas pra explorar.",
    });
    try {
      await webpush.sendNotification({ endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } }, payload);
      console.log("[api/invite/accept] convite aceito, convidador notificado");
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) pushRepository.remove(row.endpoint);
      else console.error("[api/invite/accept] push falhou:", err.message);
    }
  } catch (err) {
    console.error("[api/invite/accept] erro:", err.message);
  }
});

app.post("/api/push/unsubscribe", pushLimiter, (req, res) => {
  try {
    const { endpoint, auth } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: "endpoint é obrigatório" });
    const ownership = verifyPushOwnership(endpoint, auth);
    if (!ownership.ok) return res.status(ownership.status).json({ error: ownership.error });
    pushRepository.remove(endpoint);
    res.json({ ok: true });
  } catch (err) {
    console.error("[api/push/unsubscribe] erro:", err.message);
    res.status(500).json({ error: "falha ao remover inscrição" });
  }
});

app.post("/api/coffee-weekly-summary", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { readings } = req.body || {};
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ error: "readings (array não vazio) é obrigatório" });
    }
    if (readings.length > 7) {
      return res.status(400).json({ error: "readings aceita no máximo 7 leituras" });
    }
    for (const r of readings) {
      if (!r || typeof r.title !== "string" || typeof r.body !== "string") {
        return res.status(400).json({ error: "cada leitura precisa de title e body em string" });
      }
    }
    const summary = await aiProvider.summarizeCoffeeWeek({ readings });
    console.log("[api/coffee-weekly-summary] sucesso");
    countAiUsage("coffee-weekly-summary");
    res.json(summary);
  } catch (err) {
    console.error("[api/coffee-weekly-summary] erro:", err.message);
    res.status(500).json({ error: "falha ao gerar a conclusão da semana" });
  }
});

// Generalização do resumo semanal acima — aceita leituras de QUALQUER tipo do
// Diário Cósmico (tarô, palma, rosto, pé, pintas, café, sonho) juntas.
app.post("/api/weekly-insight", aiLimiter, async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { readings } = req.body || {};
    if (!Array.isArray(readings) || readings.length === 0) {
      return res.status(400).json({ error: "readings (array não vazio) é obrigatório" });
    }
    if (readings.length > 7) {
      return res.status(400).json({ error: "readings aceita no máximo 7 leituras" });
    }
    for (const r of readings) {
      if (!r || typeof r.title !== "string" || typeof r.body !== "string") {
        return res.status(400).json({ error: "cada leitura precisa de title e body em string" });
      }
    }
    const summary = await aiProvider.summarizeWeeklyInsight({ readings });
    console.log("[api/weekly-insight] sucesso");
    countAiUsage("weekly-insight");
    res.json(summary);
  } catch (err) {
    console.error("[api/weekly-insight] erro:", err.message);
    res.status(500).json({ error: "falha ao gerar o insight da semana" });
  }
});

// Generoso o bastante pra nunca bloquear reentregas legítimas do Hotmart (raras,
// um evento por compra/mudança de assinatura), restritivo o bastante pra impedir
// que alguém martele esse endpoint público não-autenticado.
const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, reason: "muitas requisições" },
});

app.post("/webhook/hotmart", webhookLimiter, (req, res) => {
  // Nunca logar req.body inteiro aqui — carrega e-mail/nome do comprador em
  // claro (o Hotmart manda isso no envelope de todo evento). O payload
  // completo já fica guardado em subscription_events.raw_payload (SQLite,
  // pra auditoria de verdade) via processWebhook abaixo; o console só
  // precisa do necessário pra acompanhar o log ao vivo (achado real de
  // auditoria, 25/07/2026).
  console.log("[webhook] recebido:", req.body?.event, req.body?.id);
  try {
    const result = processWebhook.execute({ rawBody: req.rawBody, headers: req.headers, payload: req.body });
    console.log("[webhook] resultado:", JSON.stringify(result));
    // Sempre responde 200 pro Hotmart não ficar reentregando — o motivo de falha vai só no log/resposta.
    res.json(result);
  } catch (err) {
    // Sem este try/catch, uma falha inesperada aqui (ex.: escrita no banco) virava
    // um 500 do Express — o oposto do que o comentário acima promete — fazendo o
    // Hotmart reentregar o mesmo evento indefinidamente, com a ativação da compra
    // seguindo sem registro a cada tentativa.
    console.error("[webhook] erro inesperado:", err.message);
    res.json({ ok: false, reason: "erro interno ao processar" });
  }
});

// Middleware de erro central — precisa ser o ÚLTIMO app.use, depois de toda
// rota. Sem isso, uma exceção não tratada (ex.: duas requisições simultâneas
// de PUT /api/social/profile com o mesmo username: as duas passam pela
// checagem de "já existe" antes de qualquer INSERT terminar, e a segunda
// esbarra na constraint UNIQUE do banco) sobe pro handler padrão do Express,
// que devolve HTML — quebrando o contrato {error} que o resto da API segue.
// Achado real de auditoria (18/07/2026).
app.use((err, req, res, _next) => {
  if (err && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
    return res.status(409).json({ error: "esse valor já está em uso" });
  }
  console.error("[erro não tratado]", err && err.message);
  res.status(500).json({ error: "erro interno" });
});

// require.main === module só é true quando este arquivo é executado
// diretamente (pm2/npm start) — quando um teste faz require("../src/http/server").app
// pra rodar contra supertest, o processo não sobe outro listener na mesma
// porta (nem precisa: supertest injeta requisições direto no app, sem porta
// TCP nenhuma).
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Forja del Amor backend rodando na porta ${PORT}`);
  });
}

module.exports = { app };
