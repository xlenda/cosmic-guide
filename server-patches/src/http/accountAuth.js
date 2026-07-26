// Autenticação das rotas de CONTA (acesso pago resolvido pelo login, não pelo
// aparelho). Não existe mecanismo novo aqui: tudo reusa o requireAuth de
// socialAuth.js, que já roda em produção há semanas servindo /api/social/*
// (jwtVerify contra o JWKS do Supabase, ES256, issuer e audience validados, sem
// service_role key). Este arquivo só acrescenta duas peças:
//
//   requireVerifiedEmail — exige e-mail VERIFICADO no token;
//   optionalAuth         — usa o token SE vier, mas nunca bloqueia sem ele.
const { requireAuth } = require("./socialAuth");

// POR QUE EXIGIR E-MAIL VERIFICADO: o vínculo por e-mail (GET /me casa
// customer_email com o e-mail do token) é a ÚNICA via de vínculo que não tem
// prova de posse — nenhuma. Se o "Confirm email" for desligado no painel do
// Supabase (config de painel, não código: nada no nosso repositório impede
// isso), qualquer um cria uma conta com carlos.alberto.sanches09@gmail.com e
// herda a assinatura paga do Carlos no primeiro /me. Hoje o app indica
// confirmação ligada (signUpWithEmail devolve needsConfirmation), mas defesa em
// profundidade não depende de configuração de terceiro.
//
// Login social (Google/Apple) conta como verificado: o e-mail foi confirmado
// pelo próprio provedor de identidade antes de o Supabase emitir o token — é
// exatamente como o Carlos entrou.
function isEmailVerified(payload) {
  if (!payload || typeof payload !== "object") return false;
  const userMetadata = payload.user_metadata || {};
  const appMetadata = payload.app_metadata || {};

  if (payload.email_verified === true) return true;
  if (userMetadata.email_verified === true) return true;

  const provider = appMetadata.provider;
  if (typeof provider === "string" && provider && provider !== "email") return true;
  const providers = Array.isArray(appMetadata.providers) ? appMetadata.providers : [];
  if (providers.some((p) => typeof p === "string" && p && p !== "email")) return true;

  return false;
}

// Roda DEPOIS de requireAuth. Nunca lê e-mail de body/query/param — só do
// payload já verificado.
function requireVerifiedEmail(req, res, next) {
  if (!req.userId) return res.status(401).json({ error: "token de autenticação ausente" });
  if (!req.userEmail) {
    return res.status(403).json({ error: "conta sem e-mail confirmado" });
  }
  if (!isEmailVerified(req.authPayload)) {
    return res.status(403).json({ error: "confirme seu e-mail para recuperar a assinatura" });
  }
  next();
}

// Usado só em /api/checkout/initiate, que atende DOIS frontends: o app Cosmic
// Guide (sempre logado — PlanosScreen.js só renderiza o checkout quando existe
// user) e o funil web antigo em oddpro.pro, que não tem Supabase nenhum. Um
// requireAuth ali derrubaria o funil antigo inteiro com 401.
//
// Token presente mas inválido/expirado NÃO vira 401: segue como anônimo (o
// checkout continua funcionando, só nasce sem vínculo de conta). Essa é uma
// decisão deliberada sobre o caminho do DINHEIRO — uma sessão expirada no
// celular do cliente não pode impedir uma compra; o vínculo se resolve depois
// pelo /me (email_match) ou pelo /claim (código do aparelho).
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return next();

  let authenticated = false;
  // requireAuth escreve a resposta de erro no `res` quando o token é ruim —
  // aqui passamos um coletor no lugar pra que esse 401 nunca chegue no cliente.
  const swallowRes = {
    status() {
      return this;
    },
    json() {
      return this;
    },
  };
  try {
    await requireAuth(req, swallowRes, () => {
      authenticated = true;
    });
  } catch (err) {
    console.error("[accountAuth] optionalAuth falhou:", err && err.message);
  }

  if (!authenticated) {
    // Limpa qualquer resquício pra que nenhuma rota abaixo confunda um token
    // recusado com uma sessão válida.
    req.userId = undefined;
    req.userEmail = undefined;
    req.authPayload = undefined;
  }
  next();
}

module.exports = { requireAuth, requireVerifiedEmail, optionalAuth, isEmailVerified };
