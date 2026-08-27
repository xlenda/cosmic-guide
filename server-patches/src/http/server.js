const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("node:path");

const { SubscriptionRepository } = require("../infrastructure/SubscriptionRepository");
const { HotmartPaymentProvider } = require("../infrastructure/HotmartPaymentProvider");
const { AnthropicChatProvider } = require("../infrastructure/AnthropicChatProvider");
const { PushSubscriptionRepository } = require("../infrastructure/PushSubscriptionRepository");
const { ConversionTrackingProvider } = require("../infrastructure/ConversionTrackingProvider");
const { ElevenLabsVoiceProvider } = require("../infrastructure/ElevenLabsVoiceProvider");
const { CosmicMemoryRepository } = require("../infrastructure/CosmicMemoryRepository");
const { db } = require("../infrastructure/db");
const { VoiceAudioCache } = require("../infrastructure/VoiceAudioCache");
const { VoiceQuota } = require("../infrastructure/VoiceQuota");
const {
  VoiceSynthesisService,
  VoiceSynthesisError,
  DEFAULT_MAX_TEXT_CHARACTERS,
} = require("../application/VoiceSynthesisService");
const { buildVoiceRouter } = require("./voiceRoutes");
const { buildMemoryRouter } = require("./memoryRoutes");
const { socialRouter } = require("./socialRoutes");
const { moderationRouter } = require("./moderationRoutes");
const { buildAdminRouter } = require("./adminRoutes");
const { buildAccountRouter } = require("./accountRoutes");
const { requireAuth, requireVerifiedEmail, optionalAuth } = require("./accountAuth");
const { compressImage } = require("../infrastructure/imageProcessing");
const { InitiateCheckoutUseCase } = require("../application/InitiateCheckoutUseCase");
const { ProcessWebhookUseCase } = require("../application/ProcessWebhookUseCase");
const { GetSubscriptionStatusUseCase } = require("../application/GetSubscriptionStatusUseCase");
const { GetAccountSubscriptionUseCase } = require("../application/GetAccountSubscriptionUseCase");
const { ClaimSubscriptionUseCase } = require("../application/ClaimSubscriptionUseCase");
const {
  ChatContextValidationError,
  sanitizeChatContext,
} = require("../application/chatContext");
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
const memoryRepository = new CosmicMemoryRepository({ database: db });

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

// Busca de cidade de nascimento (src/http/citiesRoutes.js + o banco de
// referência data/cities.sqlite, gerado por scripts/import-cities.js).
//
// POR QUE EXISTE: a lista de cidades do app é um array estático de 400
// municípios brasileiros, e um testador relatou (29/07/2026) que a dele
// (Junqueirópolis, ~20 mil habitantes) não está lá. Não tem lista fixa que
// resolva isso — são 5.570 municípios só no Brasil, e o app quer rodar no
// mundo inteiro. Buscando aqui, o custo no bundle do app é zero e vêm junto
// as ~150 mil cidades do GeoNames COM O FUSO IANA, que é o que conserta o
// Ascendente de quem nasceu em horário de verão (o app hoje usa um offset
// fixo por cidade e erra 1h — meio signo — pra todo nascimento de janeiro
// entre 1985 e 2019 no Sudeste/Sul/Centro-Oeste).
//
// Só faz LEITURA, e num banco SEPARADO do forja.sqlite (dado de referência
// não divide arquivo com assinatura). Não lê corpo de requisição, então a
// posição em relação ao express.json abaixo é indiferente pra ela — está
// aqui em cima só pra ficar junto do outro mount opcional.
// try/catch pelo mesmo motivo do /api/track: uma lista de cidades não pode
// impedir checkout e webhook de pagamento de subir. Se o banco de referência
// não tiver sido gerado ainda, a rota sobe assim mesmo e responde 503 com a
// instrução do que rodar — ver citiesRoutes.js.
try {
  app.use("/api/cities", require("./citiesRoutes").citiesRouter);
} catch (err) {
  console.error("[api/cities] rota de busca de cidades não montada:", err && err.message);
}

// O teto de 10 MB existia por causa de UMA coisa: foto em base64 nas leituras
// com imagem. Ele valia pra API INTEIRA, e um teto de 10 MB numa rota de texto
// não protege nada — é convite pra encher a memória do processo (que é o mesmo
// que serve checkout e webhook de pagamento, num VPS de 6 GB) mandando corpo
// gigante em /api/chat, /api/dream ou /api/weekly-insight. Achado de auditoria
// (30/07/2026), junto com a cota de IA.
//
// Agora são dois parsers, e a ORDEM é o que faz funcionar: o das imagens é
// montado ANTES e SÓ nas 5 rotas que recebem foto. Quando ele roda, o
// body-parser marca req._body, e o parser global logo abaixo pula a
// requisição sem reclamar do tamanho. Se a ordem invertesse, o global de
// 256 kb rejeitaria a foto com 413 antes de a rota ser alcançada.
//
// 256 kb no texto é folgado de sobra pro pior caso real (weekly-insight:
// 7 leituras × ~4 kb ≈ 28 kb) e 40x menor que os 10 MB de antes.
const IMAGE_BODY_LIMIT = process.env.IMAGE_BODY_LIMIT || "10mb";
const TEXT_BODY_LIMIT = process.env.TEXT_BODY_LIMIT || "256kb";
const guardarCorpoCru = (req, _res, buf) => {
  req.rawBody = buf.toString("utf8");
};

// As 5 rotas que recebem imagem em base64 (as mesmas que exigem conta na cota
// de IA — ver aiQuota.js). Uma lista só, usada aqui e no mount do parser.
const ROTAS_COM_IMAGEM = ["/api/palm", "/api/face", "/api/foot", "/api/moles", "/api/coffee"];

app.use(ROTAS_COM_IMAGEM, express.json({ limit: IMAGE_BODY_LIMIT, verify: guardarCorpoCru }));
app.use(express.json({ limit: TEXT_BODY_LIMIT, verify: guardarCorpoCru }));

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

// Voz neural custa por caractere. Além da cota diária POR CONTA, este freio
// por IP segura rajadas de tokens inválidos e múltiplas contas atrás do mesmo
// cliente. O status tem balde próprio para não bloquear uma geração legítima.
const voiceSynthesisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas solicitações de voz — tente novamente em alguns minutos.", code: "voice_rate_limited" },
});
const voiceStatusLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas consultas — tente novamente em alguns minutos." },
});

// Contador diário de chamadas de IA (tabela ai_usage, migração 006) — cada
// chamada custa dinheiro real na Anthropic; sem contar, não dá pra saber se
// o preço da assinatura cobre o uso (viabilidade) nem quando oferecer pacote
// de tokens pra usuário pesado. Best-effort: falha de contagem NUNCA derruba
// a chamada em si.
const { db: usageDb } = require("../infrastructure/db");

// ELEVENLABS_API_KEY existe SOMENTE no ambiente do backend. Os IDs públicos
// são escolhidos pelo servidor (defaults auditados ou overrides de ambiente),
// nunca pelo cliente. Sem chave, /status não anuncia voz e /synthesize fecha
// em 503 — nenhuma voz do aparelho é usada como substituta silenciosa.
let voiceService;
try {
  const voiceProvider = new ElevenLabsVoiceProvider();
  const dataDir = process.env.DATA_DIR || path.join(__dirname, "..", "..", "data");
  const voiceCache = new VoiceAudioCache({
    directory: process.env.VOICE_CACHE_DIR || path.join(dataDir, "voice-cache"),
    maxFileBytes: voiceProvider.maxAudioBytes,
  });
  voiceService = new VoiceSynthesisService({
    provider: voiceProvider,
    cache: voiceCache,
    quota: new VoiceQuota({ db: usageDb }),
  });
} catch (error) {
  console.error("[voice] inicialização desativada com segurança:", error && error.name);
  voiceService = {
    maxTextCharacters: DEFAULT_MAX_TEXT_CHARACTERS,
    status: () => ({
      available: false,
      languages: [],
      maxCharacters: DEFAULT_MAX_TEXT_CHARACTERS,
      requiresLogin: true,
      requiresVerifiedEmail: true,
    }),
    synthesize: async () => {
      throw new VoiceSynthesisError("voice_unavailable", { retryable: true });
    },
  };
}

app.use(
  "/api/voice",
  buildVoiceRouter({
    service: voiceService,
    requireAuth,
    requireVerifiedEmail,
    synthesisLimiter: voiceSynthesisLimiter,
    statusLimiter: voiceStatusLimiter,
  })
);

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
// zero. A única métrica que dizia "o chat antigo está sendo usado" estava
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

// COTA DE IA — o paywall de verdade (src/http/aiQuota.js + migração 011).
//
// Até 30/07/2026 NENHUMA das 10 rotas abaixo checava autenticação ou
// assinatura: o único freio de pagamento era o AsyncStorage do APARELHO
// (lib/featureUsage.js no app). localStorage.clear() devolvia todas as
// leituras grátis, e um curl sem token nenhum torrava ~5.700 chamadas por dia
// por IP na conta Anthropic do dono. O arquivo aiQuota.js explica a régua
// inteira (quem passa, quem paga, por que as rotas com foto exigem conta).
//
// Aqui só o essencial da ORDEM, que é o que faz a coisa funcionar:
//   aiLimiter        → freio bruto por IP (continua igual, 60/15min)
//   optionalAuth     → descobre QUEM é; nunca devolve 401 por falta de token
//   aiQuota.gate(x)  → decide se pode e cobra a cota
// Sem optionalAuth ANTES do gate, req.userId nunca existe e o assinante seria
// tratado como anônimo.
//
// ehCanary entra como isenção: o canary chama /api/chat de verdade, sem token,
// 4x por hora — sem isenção ele mesmo estouraria a cota anônima do servidor e
// o monitoramento morreria em silêncio.
const { buildAiQuota } = require("./aiQuota");
const aiQuota = buildAiQuota({ getAccountSubscription, isExempt: ehCanary });

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

    // TIPO CONFERIDO AQUI, ANTES DE QUALQUER COISA (03/08/2026). O log de
    // produção mostrou "[api/checkout/initiate] erro: SQLite3 can only bind
    // numbers, strings, bigints, buffers, and null": um body com `plan` (ou
    // `coupleName`) vindo como objeto/array atravessava a rota inteira, porque
    // `plan || null` não conserta nada — objeto é truthy — e só estourava lá no
    // fundo, no driver. O cliente levava 500 na ROTA DE PAGAMENTO, que é o
    // último lugar do app onde a pessoa aceita ver um erro genérico.
    //
    // 400 é a resposta certa: o pedido está malformado, e o dono do problema é
    // quem mandou. String, ausente ou null passam — o resto para aqui.
    for (const [nome, valor] of [
      ["coupleName", coupleName],
      ["customerEmail", customerEmail],
      ["plan", plan],
      ["scope", scope],
    ]) {
      if (valor !== undefined && valor !== null && typeof valor !== "string") {
        return res.status(400).json({ error: `${nome} deve ser texto` });
      }
    }
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
// EXCLUSÃO DE CONTA (Google Play) — o que este backend guarda ligado à CONTA e
// some quando ela é apagada. A lista saiu de uma varredura tabela por tabela
// das migrações, não de chute:
//
//   subscriptions   → supabase_user_id/account_email. Desvinculado (o recibo do
//                     pagamento fica; ver o comentário em forgetAccount).
//   ai_free_quota   → subject_type 'account'. NAO apagado, de proposito: a cota
//                     de conta e VITALICIA (ver o comentario de ANON_RETENTION_DAYS
//                     em aiQuota.js), e apagar a linha devolveria as leituras
//                     gratis. Esta rota so exige um token valido — ela nao tem como
//                     provar que a conta morreu de fato —, entao apagar aqui virava
//                     reset infinito do paywall por curl. Sobra um uuid opaco de
//                     conta inexistente, sem dado pessoal.
//   voice_usage_daily → contagem diária ligada ao user_id. Apagada na mesma
//                       transação; não é recibo fiscal nem trava vitalícia.
//   social_*        → perfil, posts, comentários, curtidas, follows e bloqueios
//                     apagados na mesma transação da desvinculação. Denúncias
//                     ficam sem ids/conteúdo da conta apagada; denúncia válida
//                     feita por ela contra conteúdo alheio fica anonimizada.
//
// As outras tabelas não têm caminho de userId e por isso não entram aqui:
// funnel_events é session_id anônimo (e já tem POST /api/track/forget),
// flame_checkins é couple_key+device_id, couple_invites e push_daily_reminder
// são chaveadas pelo endpoint do push. Não existe caminho de userId pra elas.
function deleteAccountData({ userId }) {
  return repository.forgetAccountData({ supabaseUserId: userId });
}

app.use(
  "/api/subscription",
  buildAccountRouter({ getAccountSubscription, claimSubscription, requireAuth, requireVerifiedEmail, deleteAccountData })
);

app.use(
  "/api/memory",
  buildMemoryRouter({ repository: memoryRepository, requireAuth, requireVerifiedEmail })
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
// O IDIOMA DA RESPOSTA DE IA, tirado do body (lib/aiClient.js do app põe em
// TODA chamada desde 03/08/2026). Só as três línguas que o app vende passam;
// qualquer outra coisa — inclusive body ausente, número, objeto — cai em 'pt',
// que é a língua dos prompts e o comportamento de sempre.
function langDoPedido(req) {
  const lang = req.body && req.body.lang;
  return lang === "es" || lang === "en" ? lang : "pt";
}

const CHAT_MESSAGE_MAX_LENGTH = 500;

app.post("/api/chat", aiLimiter, optionalAuth, aiQuota.gate("chat"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { personaId, message, history, contexto: contextoBruto } = req.body || {};
    if (!message) return res.status(400).json({ error: "message é obrigatório" });
    if (typeof message !== "string" || message.length > CHAT_MESSAGE_MAX_LENGTH) {
      return res.status(400).json({ error: `message deve ter no máximo ${CHAT_MESSAGE_MAX_LENGTH} caracteres` });
    }
    // O contexto é opcional e a ausência mantém o contrato antigo. Quando
    // existe, somente signo canônico e os três IDs enumerados do onboarding
    // passam; pergunta, nota, Diário e qualquer texto livre falham antes da
    // chamada paga. O provider repete a validação como defesa em profundidade.
    const contexto = sanitizeChatContext(contextoBruto);
    let memorias = [];
    if (req.userId) {
      try {
        memorias = memoryRepository.relevant({ userId: req.userId, query: message, contexto });
      } catch {
        // Memória enriquece a resposta, mas nunca pode derrubar o chat. O log
        // não inclui texto, id ou quantidade de itens privados.
        console.error("[cosmic-memory] recuperação indisponível");
      }
    }
    const reply = await aiProvider.chat({
      personaId,
      message,
      history,
      contexto,
      memorias,
      lang: langDoPedido(req),
    });
    if (req.userId) {
      try {
        // Só persiste depois de uma resposta real da Anthropic. Falha, cota ou
        // timeout não transformam uma tentativa solta em lembrança permanente.
        memoryRepository.rememberChatMessage({ userId: req.userId, message, contexto });
      } catch {
        console.error("[cosmic-memory] gravação indisponível");
      }
    }
    console.log("[api/chat] sucesso");
    // Único endpoint que o canary chama — ver ehCanary() acima.
    countAiUsage(ehCanary(req) ? `chat${CANARY_SUFFIX}` : "chat");
    res.json({ reply });
  } catch (err) {
    if (err instanceof ChatContextValidationError) {
      return res.status(400).json({
        error: "contexto do chat inválido",
        code: err.code,
      });
    }
    console.error("[api/chat] erro:", err.message);
    res.status(500).json({ error: "falha ao gerar resposta" });
  }
});

app.post("/api/palm", aiLimiter, optionalAuth, aiQuota.gate("palm"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzePalm({ ...compressed, lang: langDoPedido(req) });
    console.log("[api/palm] sucesso");
    countAiUsage("palm");
    res.json(reading);
  } catch (err) {
    console.error("[api/palm] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/coffee", aiLimiter, optionalAuth, aiQuota.gate("coffee"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeCoffee({ ...compressed, lang: langDoPedido(req) });
    console.log("[api/coffee] sucesso");
    countAiUsage("coffee");
    res.json(reading);
  } catch (err) {
    console.error("[api/coffee] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/moles", aiLimiter, optionalAuth, aiQuota.gate("moles"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeMoles({ ...compressed, lang: langDoPedido(req) });
    console.log("[api/moles] sucesso");
    countAiUsage("moles");
    res.json(reading);
  } catch (err) {
    console.error("[api/moles] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/foot", aiLimiter, optionalAuth, aiQuota.gate("foot"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeFoot({ ...compressed, lang: langDoPedido(req) });
    console.log("[api/foot] sucesso");
    countAiUsage("foot");
    res.json(reading);
  } catch (err) {
    console.error("[api/foot] erro:", err.message);
    res.status(500).json({ error: "falha ao analisar a imagem" });
  }
});

app.post("/api/face", aiLimiter, optionalAuth, aiQuota.gate("face"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { imageBase64, mediaType } = req.body || {};
    if (!imageBase64) return res.status(400).json({ error: "imageBase64 é obrigatório" });
    const compressed = await compressImage(imageBase64, mediaType);
    const reading = await aiProvider.analyzeFace({ ...compressed, lang: langDoPedido(req) });
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

app.post("/api/dream", aiLimiter, optionalAuth, aiQuota.gate("dream"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { dreamText } = req.body || {};
    if (!dreamText) return res.status(400).json({ error: "dreamText é obrigatório" });
    if (typeof dreamText !== "string" || dreamText.length > DREAM_TEXT_MAX_LENGTH) {
      return res.status(400).json({ error: `dreamText deve ter no máximo ${DREAM_TEXT_MAX_LENGTH} caracteres` });
    }
    const reading = await aiProvider.interpretDream({ dreamText, lang: langDoPedido(req) });
    console.log("[api/dream] sucesso");
    countAiUsage("dream");
    res.json(reading);
  } catch (err) {
    console.error("[api/dream] erro:", err.message);
    res.status(500).json({ error: "falha ao interpretar o sonho" });
  }
});

const INSIGHT_TRANSCRIPT_MAX_LENGTH = 2000;

app.post("/api/enhance-insight", aiLimiter, optionalAuth, aiQuota.gate("enhance-insight"), async (req, res) => {
  if (!aiProvider) return res.status(503).json({ error: "IA não configurada no servidor" });
  try {
    const { transcript, readingType, readingTitle } = req.body || {};
    if (!transcript) return res.status(400).json({ error: "transcript é obrigatório" });
    if (typeof transcript !== "string" || transcript.length > INSIGHT_TRANSCRIPT_MAX_LENGTH) {
      return res.status(400).json({ error: `transcript deve ter no máximo ${INSIGHT_TRANSCRIPT_MAX_LENGTH} caracteres` });
    }
    const result = await aiProvider.enhanceInsight({ transcript, readingType, readingTitle, lang: langDoPedido(req) });
    console.log("[api/enhance-insight] sucesso");
    countAiUsage("enhance-insight");
    res.json(result);
  } catch (err) {
    console.error("[api/enhance-insight] erro:", err.message);
    res.status(500).json({ error: "falha ao organizar o insight" });
  }
});

// Feed legado de seguidores + salas explícitas da Comunidade. O modo casal
// pode abrir a Comunidade, mas Reconectar/Agir, Diário e leituras não passam por
// aqui automaticamente. Cada rota exige JWT válido (ver socialAuth.js).
app.use("/api/social", socialRouter);

// Denúncia e bloqueio — o que a política de Conteúdo Gerado pelo Usuário do
// Google Play exige pra um feed social poder existir na loja. Router SEPARADO
// do /api/social de propósito: aquele exige JWT em TODA rota (router.use
// (requireAuth)), e denunciar uma saída de IA acontece antes de existir login.
app.use("/api/moderation", moderationRouter);

// Os fundos do card de compartilhar a Frase do Dia/do Amor — público e só
// leitura (quem escreve é o cron de scripts/gerar-cards-do-dia.js). Sem rate
// limiter próprio de propósito: são 3 arquivos por dia com Cache-Control
// agressivo, o CDN/navegador segura o grosso.
app.use("/api/daily-cards", require("./dailyCardsRoutes").dailyCardsRouter);

// Rotas de suporte/admin (buscar/forçar status de assinatura) — protegidas
// por ADMIN_TOKEN (header X-Admin-Token), nunca abertas sem essa var setada.
app.use("/api/admin", buildAdminRouter({ repository, adminToken: ADMIN_TOKEN }));

// O Painel do Dono (04/08/2026): GET /painel e a casca publica sem dado; os
// numeros moram em GET /api/admin/metrics, atras do MESMO ADMIN_TOKEN.
app.use(require("./painelRoutes").buildPainelRouter({ adminToken: ADMIN_TOKEN }));

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

// Lembrete diário do check-in (tabela push_daily_reminder, migração 014) — o
// toggle discreto que aparece dentro do bloco de check-in da Home DEPOIS do
// primeiro check-in (components/DailyMissionsCard.js no app). Quem envia é
// scripts/enviar-lembrete-checkin.js, no cron.
//
// Mesma trava de posse do sync-streak/sync-diary (verifyPushOwnership): sem
// ela, quem descobrisse o endpoint de outra pessoa podia inscrevê-la num push
// diário que ela nunca pediu — ou calar o dela. A marcação é por INSCRIÇÃO,
// não por conta, porque o check-in em si nunca sai do aparelho.
//
// `lang` é aceito só pra escolher a língua do texto do push (normalizado em
// checkinReminderContent.normalizarIdioma; qualquer coisa fora de pt/es/en
// vira pt). Nada do que a pessoa RESPONDEU no check-in trafega aqui.
const { DailyReminderRepository } = require("../infrastructure/DailyReminderRepository");
const dailyReminderRepository = new DailyReminderRepository();

app.post("/api/push/daily-reminder", pushLimiter, (req, res) => {
  try {
    const { endpoint, auth, enabled, lang } = req.body || {};
    if (!endpoint) return res.status(400).json({ error: "endpoint é obrigatório" });
    if (typeof enabled !== "boolean") return res.status(400).json({ error: "enabled deve ser true ou false" });
    const ownership = verifyPushOwnership(endpoint, auth);
    if (!ownership.ok) return res.status(ownership.status).json({ error: ownership.error });

    if (enabled) dailyReminderRepository.enable({ endpoint, lang });
    else dailyReminderRepository.disable(endpoint);

    console.log(`[api/push/daily-reminder] lembrete ${enabled ? "ligado" : "desligado"}`);
    res.json({ ok: true, enabled });
  } catch (err) {
    console.error("[api/push/daily-reminder] erro:", err.message);
    res.status(500).json({ error: "falha ao salvar o lembrete diário" });
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

// Chama do Casal (tabela flame_checkins, migração 012) — a chama do dia só
// acende quando >= 2 aparelhos DISTINTOS do mesmo casal abrem o app no mesmo
// dia. Privacidade primeiro: coupleKey é SHA-256 calculado no client (o
// servidor nunca vê nomes) e deviceId é um UUID aleatório do aparelho. O
// `day` do body é IGNORADO — o servidor decide o dia (senão um client
// alterado fabricaria streak retroativo). Bloco coberto por test/flame.test.js.
//
// HISTÓRICO: este bloco viveu por um dia só no repo obsoleto
// (C:\tmp\gilfforever\backend) e SUMIU de produção quando o deploy.sh
// restaurou src/ a partir daqui — o server-patches não o tinha. As tabelas
// sobreviveram no banco (migração roda uma vez); as rotas não. Restaurado em
// 02/08/2026, agora no repo que é fonte da verdade.
const { FlameRepository, todayUtc: flameTodayUtc } = require("../infrastructure/FlameRepository");
const flameRepository = new FlameRepository();
const FLAME_COUPLE_KEY_RE = /^[a-f0-9]{64}$/;
const FLAME_DEVICE_ID_RE = /^[a-f0-9-]{8,64}$/i;

const flameLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições — tente novamente em alguns minutos." },
});

app.post("/api/flame/checkin", flameLimiter, (req, res) => {
  try {
    const { coupleKey, deviceId } = req.body || {};
    if (typeof coupleKey !== "string" || !FLAME_COUPLE_KEY_RE.test(coupleKey)) {
      return res.status(400).json({ error: "coupleKey deve ser um SHA-256 em hex minúsculo (64 caracteres)" });
    }
    if (typeof deviceId !== "string" || !FLAME_DEVICE_ID_RE.test(deviceId)) {
      return res.status(400).json({ error: "deviceId inválido" });
    }
    flameRepository.checkin({ coupleKey, day: flameTodayUtc(), deviceId });
    res.json(flameRepository.status(coupleKey));
  } catch (err) {
    console.error("[api/flame/checkin] erro:", err.message);
    res.status(500).json({ error: "falha ao registrar presença" });
  }
});

app.get("/api/flame/:coupleKey", flameLimiter, (req, res) => {
  try {
    const { coupleKey } = req.params;
    if (!FLAME_COUPLE_KEY_RE.test(coupleKey)) {
      return res.status(400).json({ error: "coupleKey deve ser um SHA-256 em hex minúsculo (64 caracteres)" });
    }
    res.json(flameRepository.status(coupleKey));
  } catch (err) {
    console.error("[api/flame/status] erro:", err.message);
    res.status(500).json({ error: "falha ao consultar a chama" });
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

app.post("/api/coffee-weekly-summary", aiLimiter, optionalAuth, aiQuota.gate("coffee-weekly-summary"), async (req, res) => {
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
    const summary = await aiProvider.summarizeCoffeeWeek({ readings, lang: langDoPedido(req) });
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
app.post("/api/weekly-insight", aiLimiter, optionalAuth, aiQuota.gate("weekly-insight"), async (req, res) => {
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
    // extras.checkins (04/08/2026): o placar do check-in diario — contagens
    // que a propria pessoa marcou. Saneado numero a numero na porta: extras e
    // body de cliente, e cliente nao dita prompt — so numeros pequenos passam.
    const extrasBrutos = (req.body || {}).extras;
    let extras;
    if (extrasBrutos && extrasBrutos.checkins) {
      const n = (v) => (typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 31 ? Math.floor(v) : 0);
      const placar = (o) => ({ leve: n(o && o.leve), neutro: n(o && o.neutro), pesado: n(o && o.pesado), total: n(o && o.total) });
      extras = { checkins: { atual: placar(extrasBrutos.checkins.atual), anterior: placar(extrasBrutos.checkins.anterior) } };
    }
    const summary = await aiProvider.summarizeWeeklyInsight({ readings, extras, lang: langDoPedido(req) });
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
  // Corpo maior que o teto do parser. Antes isso virava 500 "erro interno" —
  // e passava despercebido porque o teto era 10 MB pra tudo, ou seja,
  // praticamente inalcançável. Com o teto de texto apertado pra 256 kb (ver
  // TEXT_BODY_LIMIT lá em cima), a resposta certa passa a importar: 413 é
  // verdade ("você mandou grande demais") e, principalmente, NÃO é 402 — o app
  // distingue os dois pelo status e pelo `code`, então um corpo grande jamais
  // pode ser confundido com "sua cota acabou" e abrir o paywall à toa.
  if (err && (err.type === "entity.too.large" || err.status === 413 || err.statusCode === 413)) {
    return res.status(413).json({ error: "corpo da requisição grande demais", code: "body_too_large" });
  }
  // JSON malformado é erro do CLIENTE, não do servidor — 400 evita que uma
  // requisição quebrada apareça no log/monitoramento como falha nossa.
  if (err && (err.type === "entity.parse.failed" || err.status === 400 || err.statusCode === 400)) {
    return res.status(400).json({ error: "corpo da requisição inválido", code: "bad_body" });
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
