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

// LÁPIDE DE CONTA APAGADA (migração 017, escrita por
// SubscriptionRepository.forgetAccount).
//
// O require é PREGUIÇOSO de propósito, e não por estilo: server-patches é
// espelho PARCIAL da VPS — src/infrastructure/db.js nem existe aqui — e os
// testes de rota que trocam o requireAuth por uma auth falsa
// (test/accountDelete.test.js, test/accountSubscription.test.js) carregam este
// arquivo sem abrir banco nenhum e sem DATA_DIR isolado. Um require no topo
// faria esses dois abrirem o SQLite de PRODUÇÃO ao rodar no servidor. Na VPS
// nada muda: aiQuota, socialRoutes, painelRoutes, trackRoutes e moderationRoutes
// já exigem db.js no topo, então na primeira requisição isto é um require em
// cache e uma leitura por chave primária — o mesmo custo que o aiQuota já paga.
//
// FALHA É FECHADA, MAS BARULHENTA: se o banco não responder, todo mundo toma
// 401 — e sem o log ninguém descobriria por quê (já aconteceu: em 18/07 o JWKS
// apontava pro projeto errado e 100% das chamadas falhavam em silêncio). Na
// prática o SQLite é local e, se ele caiu, a cota de IA e o feed já caíram
// junto — fechar aqui não perde nada que já não estivesse perdido.
let consultaRevogado;
function contaApagada(userId) {
  if (!userId) return false;
  try {
    if (!consultaRevogado) {
      const { db } = require("../infrastructure/db");
      consultaRevogado = db.prepare("SELECT 1 FROM revoked_accounts WHERE user_id = ?");
    }
    return Boolean(consultaRevogado.get(userId));
  } catch (err) {
    console.error("[socialAuth] não consegui ler revoked_accounts — recusando o token:", err && err.message);
    return true;
  }
}

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

    // CONTA APAGADA — a única checagem aqui que não é sobre o token, e por isso
    // ela existe (auditoria de 19/08/2026). O Supabase derruba auth.sessions e
    // auth.refresh_tokens em cascata ao apagar auth.users
    // (supabase/001_delete_own_account.sql), ou seja: nenhum token NOVO é
    // emitido. Mas o access token já na mão continua com assinatura válida até
    // o `exp` (1h no padrão), e jwtVerify não consulta usuário nenhum — então,
    // sem esta linha, o token de um morto ainda postava no feed, gastava IA e,
    // no GET /api/subscription/me, fazia o backfill por e-mail REGRAVAR o
    // e-mail e o uuid dele na linha da assinatura que o DELETE tinha acabado de
    // desvincular. Exclusão que se desfaz sozinha não é exclusão.
    //
    // A ÚNICA exceção é a própria rota de exclusão, que se marca com
    // req.allowDeletedAccount (accountRoutes.js): ela é idempotente e o app a
    // REPETE quando a resposta se perde — um 401 ali viraria "não conseguimos
    // apagar tudo" na cara de quem acabou de apagar tudo.
    if (!req.allowDeletedAccount && contaApagada(payload.sub)) {
      return res.status(401).json({ error: "conta apagada", code: "account_deleted" });
    }

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
