// Rotas de assinatura resolvidas pela CONTA (montadas em /api/subscription,
// ANTES da rota antiga /api/subscription/:correlationCode — ver server.js).
//
// A rota antiga continua idêntica, pública e sem auth: é ela que mantém
// funcionando quem já tem código salvo, quem está deslogado (a maioria — o app
// só exige login na tela de Planos) e as 14 pendências legadas sem e-mail
// nenhum. Nada é depreciado aqui; isto é UNIÃO, não substituição.
const express = require("express");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
// requireVerifiedEmail continua chegando por injeção (é middleware, e o teste
// troca o requireAuth por um falso). isEmailVerified vem importado direto de
// propósito: é uma função PURA sobre o payload já verificado, e o resultado dela
// é o que autoriza a allowlist de dono (OWNER_EMAILS) — a única concessão de
// acesso sem assinatura. Calcular no próprio handler, em vez de confiar num
// efeito colateral do middleware, faz esse caminho continuar FECHADO mesmo que
// alguém remova o requireVerifiedEmail da rota um dia.
const { isEmailVerified } = require("./accountAuth");

// Chaveia o balde por usuário quando há sessão, por IP quando não há.
// POR QUÊ: em rede móvel dezenas de assinantes saem pelo MESMO IP (NAT), e o
// app rechecha o acesso a cada 5 min (CoupleContext) em cada aparelho — chavear
// só por IP já fez assinante real tomar 429 (achado de 25/07/2026). O
// ipKeyGenerator da própria lib é usado no fallback porque ele normaliza IPv6
// por sub-rede (/56); um keyGenerator caseiro com req.ip cru deixaria qualquer
// abusador com IPv6 trocar de endereço a cada requisição.
function keyByUserOrIp(req) {
  return req.userId ? `u:${req.userId}` : ipKeyGenerator(req.ip);
}

function buildAccountRouter({ getAccountSubscription, claimSubscription, requireAuth, requireVerifiedEmail }) {
  const router = express.Router();

  // Limite por IP ANTES da autenticação: sem ele, token inválido nunca chegaria
  // no limitador por usuário e daria pra martelar a verificação de JWT de graça.
  const preAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 240,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Muitas requisições — tente novamente em alguns minutos." },
  });

  // Depois da autenticação, por usuário. 120/15min = 8/min: folga confortável
  // pro recheck de 5 min somado a vários aparelhos e ao refresh ao focar a aba.
  const meLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyByUserOrIp,
    message: { error: "Muitas requisições — tente novamente em alguns minutos." },
  });

  // Estrito: /claim é a única rota que aceita um código vindo do cliente, e
  // 10/15min por conta torna varredura de códigos inviável muito antes de o
  // espaço de 128 bits importar.
  const claimLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyByUserOrIp,
    message: { error: "Muitas requisições — tente novamente em alguns minutos." },
  });

  // GET com efeito colateral de escrita (o vínculo por e-mail) é impuro de
  // propósito e conscientemente: é o que faz a migração acontecer sozinha no
  // primeiro login, sem script e sem avisar cliente. O UPDATE é condicional e
  // atômico (WHERE supabase_user_id IS NULL), então duas chamadas simultâneas —
  // o app dispara refreshAccess no foco E no intervalo de 5 min — não vinculam
  // duas vezes nem duplicam auditoria.
  router.get("/me", preAuthLimiter, requireAuth, requireVerifiedEmail, meLimiter, (req, res) => {
    try {
      // Resposta é POR USUÁRIO e o Express põe ETag em todo JSON por padrão —
      // em produção isso já estava rendendo 304 de verdade (visto no log do
      // nginx, 27/07/2026). Cache de navegador é indexado por URL, não pelo
      // Authorization: duas contas no MESMO navegador (ou qualquer proxy no
      // caminho) podiam receber uma a resposta da outra, incluindo o
      // correlationCode. `no-store` + `Vary: Authorization` fecham os dois
      // casos; `Pragma`/`Expires` cobrem proxy velho que ignora Cache-Control.
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
        Vary: "Authorization",
      });
      res.json(
        getAccountSubscription.execute({
          userId: req.userId,
          email: req.userEmail,
          // Sempre do token verificado — nunca de body/query. Ver ownerAllowlist.js.
          emailVerified: isEmailVerified(req.authPayload),
        })
      );
    } catch (err) {
      console.error("[api/subscription/me] erro:", err && err.message);
      res.status(500).json({ error: "falha ao consultar assinatura" });
    }
  });

  router.post("/claim", preAuthLimiter, requireAuth, requireVerifiedEmail, claimLimiter, (req, res) => {
    try {
      const { correlationCode } = req.body || {};
      const result = claimSubscription.execute({
        userId: req.userId,
        email: req.userEmail,
        correlationCode,
        // Mesma origem do /me — token verificado, nunca body/query. O /claim
        // termina devolvendo o MESMO objeto de conta que o /me monta, então ele
        // precisa das mesmas entradas, senão as duas rotas discordam.
        emailVerified: isEmailVerified(req.authPayload),
      });
      if (!result.ok) return res.status(result.status).json({ error: result.error });
      res.json(result.account);
    } catch (err) {
      console.error("[api/subscription/claim] erro:", err && err.message);
      res.status(500).json({ error: "falha ao vincular assinatura" });
    }
  });

  return router;
}

module.exports = { buildAccountRouter, keyByUserOrIp };
