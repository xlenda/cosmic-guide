// Verifica o JWT que o app Cosmic Guide manda (Authorization: Bearer <token>,
// vindo de supabase.auth.getSession().access_token no client) SEM precisar da
// service_role key — o Lenda pediu explicitamente pra nunca usar/guardar essa
// chave neste projeto. Esse projeto Supabase assina os tokens com ES256
// assimétrico (confirmado em .well-known/jwks.json), então dá pra verificar a
// assinatura só com a chave pública, via JWKS, com cache automático do jose.
const { createRemoteJWKSet, jwtVerify } = require("jose");

// ATENÇÃO: precisa ser o mesmo projeto usado pelo app em lib/supabaseClient.js
// (kroadufkgvymsfzulfzn) — um valor errado aqui faz TODO token real falhar na
// verificação (assinatura nunca bate com o JWKS de outro projeto), derrubando
// o feed social inteiro com "token inválido" sem nenhum erro óbvio no client.
// Isso já aconteceu de verdade (auditoria de segurança, 18/07/2026): o
// fallback apontava pro projeto errado (Ziggur) e a env var nunca tinha sido
// configurada no servidor — 100% das chamadas ao feed social falhavam.
const SUPABASE_URL = process.env.SUPABASE_URL || "https://kroadufkgvymsfzulfzn.supabase.co";
const JWKS = createRemoteJWKSet(new URL(`${SUPABASE_URL}/auth/v1/.well-known/jwks.json`));

// Middleware Express: exige um token válido, popula req.userId com o "sub"
// (UUID estável do usuário) e req.userEmail. Nunca confia em user_id vindo
// cru do corpo/query da requisição — é sempre derivado do token verificado.
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "token de autenticação ausente" });

  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `${SUPABASE_URL}/auth/v1`,
      audience: "authenticated",
    });
    req.userId = payload.sub;
    req.userEmail = payload.email || null;
    // ÚNICA mudança de 26/07/2026 (acesso por conta): expõe o payload já
    // VERIFICADO pra quem precisa de mais que sub/email — hoje só
    // accountAuth.requireVerifiedEmail, que checa email_verified/provider antes
    // de deixar uma conta reivindicar assinatura por e-mail. Aditivo: nenhuma
    // rota existente lê esse campo, e ele nunca carrega nada que não tenha
    // passado por jwtVerify (nada de header/body cru).
    req.authPayload = payload;
    next();
  } catch (err) {
    // POR QUE DISTINGUIR (achado real de produção, 30/07/2026): o log registrou
    // 86 "Invalid Compact JWS" num único dia, todos do MESMO navegador batendo
    // em /api/subscription/me. Como a resposta era um 401 genérico, o app não
    // tinha como saber que a sessão estava CORROMPIDA (não expirada) — então
    // ele revalidava a cada 5 min, pra sempre, com um token que nunca ia
    // funcionar. E o efeito colateral virou grave quando a cota de IA passou a
    // depender do token: sessão quebrada = a pessoa vira anônima, perde a
    // allowlist de dono e vê paywall mesmo tendo direito.
    //
    // "Compact JWS" malformado significa que o valor guardado nem é um JWT —
    // não adianta renovar, só limpar e entrar de novo. Já expirado é o caso
    // normal, que o SDK do Supabase resolve sozinho renovando.
    const code = err && err.code;
    const malformado =
      code === "ERR_JWS_INVALID" ||
      code === "ERR_JWT_MALFORMED" ||
      /Invalid Compact JWS|Invalid JWT/i.test((err && err.message) || "");
    const expirado = code === "ERR_JWT_EXPIRED";

    // Malformado é o único que vale ruído no log: ele indica estado corrompido
    // que alguém precisa olhar. Expirado é rotina e enchia o log de erro que
    // não é erro.
    if (malformado) console.error("[socialAuth] token malformado (sessão corrompida):", err.message);

    res.status(401).json({
      error: "token inválido ou expirado",
      // Aditivo: nenhum cliente antigo lê este campo, e o novo usa pra decidir
      // entre "renova" (expirado) e "limpa a sessão e pede login" (malformado).
      code: malformado ? "token_malformed" : expirado ? "token_expired" : "token_invalid",
    });
  }
}

module.exports = { requireAuth };
