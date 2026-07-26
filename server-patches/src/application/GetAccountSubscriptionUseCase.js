// Resolve o acesso pago pela CONTA (sub do JWT do Supabase), não pelo aparelho.
//
// Antes disso, a única pergunta que o backend sabia responder era
// "GET /api/subscription/<código guardado no AsyncStorage>". Quem limpava o
// navegador, trocava de celular ou abria no PC pagava e perdia o acesso; e quem
// clicava "Assinar" depois de já ter pago passava a apontar pra uma pendência
// nova e o acesso sumia (o laço real do cliente Carlos, 26/07/2026).

// customer_email é o e-mail do PAGAMENTO — pode ser de outra pessoa (PayPal,
// cartão do cônjuge). Sai sempre mascarado: reduz o que um token roubado
// expõe e impede usar a rota como confirmador de e-mail de terceiro.
function maskEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) return null;
  const [local, domain] = email.split("@");
  if (!local || !domain) return null;
  return `${local.slice(0, 1)}***@${domain}`;
}

// "Melhor" = a que concede acesso; entre duas que concedem, a que vale por mais
// tempo. Sem acesso nenhum, a mais recente (é a que o app deve mostrar como
// "pendente"/"expirada").
function rank(subscription) {
  return subscription.hasAccess() ? 0 : 1;
}

function pickBest(subscriptions) {
  return subscriptions
    .slice()
    .sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      const endA = a.currentPeriodEnd || "";
      const endB = b.currentPeriodEnd || "";
      if (endA !== endB) return endA < endB ? 1 : -1;
      const updA = a.updatedAt || a.createdAt || "";
      const updB = b.updatedAt || b.createdAt || "";
      if (updA !== updB) return updA < updB ? 1 : -1;
      return 0;
    })[0] || null;
}

// ACHADO REAL DE PRODUÇÃO (26/07/2026): as 4 linhas do Carlos estão TODAS
// 'active' com o mesmo provider_subscription_id=6QAE1D6J (o script
// liberar-carlos.js ativou todas as pendências dele). Sem agregar, /me
// devolveria "4 assinaturas ativas" pra uma compra só — e qualquer contagem de
// receita ficaria x4. Uma compra na Hotmart = um subscriber code = UMA
// assinatura aqui. Linhas sem provider_subscription_id (pendências que nunca
// viraram compra) nunca são agrupadas entre si.
function dedupeByProviderSubscription(subscriptions) {
  const byProvider = new Map();
  const standalone = [];
  for (const sub of subscriptions) {
    const key = typeof sub.providerSubscriptionId === "string" ? sub.providerSubscriptionId.trim() : "";
    if (!key) {
      standalone.push(sub);
      continue;
    }
    const current = byProvider.get(key);
    byProvider.set(key, current ? pickBest([current, sub]) : sub);
  }
  return [...byProvider.values(), ...standalone];
}

function toPublicShape(subscription) {
  if (!subscription) return null;
  return {
    correlationCode: subscription.correlationCode,
    status: subscription.status,
    hasAccess: subscription.hasAccess(),
    plan: subscription.plan,
    scope: subscription.scope || "solo",
    currentPeriodEnd: subscription.currentPeriodEnd || null,
    coupleName: subscription.coupleName || null,
    createdAt: subscription.createdAt,
    linkedBy: subscription.linkedBy || null,
    customerEmailMasked: maskEmail(subscription.customerEmail),
  };
}

class GetAccountSubscriptionUseCase {
  constructor(repository) {
    this.repository = repository;
  }

  // userId/email vêm SEMPRE do token verificado (req.userId/req.userEmail) —
  // nunca de body/query. É por isso que não existe rota pública de busca por
  // e-mail: pedir "a assinatura do e-mail X" nunca é possível; só dá pra pedir
  // "a MINHA assinatura", e quem é "eu" é a assinatura do JWT que decide.
  execute({ userId, email }) {
    const repo = this.repository;
    let linkedNow = [];

    // Backfill preguiçoso (email_match): toda linha órfã cujo e-mail do
    // pagamento bate com o e-mail VERIFICADO do login passa a pertencer a esta
    // conta. É o que faz assinante antigo recuperar acesso só logando — sem
    // script de migração, sem service_role key, sem avisar cliente nenhum.
    if (email && typeof repo.linkUnclaimedByCustomerEmail === "function") {
      try {
        linkedNow = repo.linkUnclaimedByCustomerEmail({ supabaseUserId: userId, email }) || [];
      } catch (err) {
        // Um erro no vínculo NUNCA pode derrubar a leitura de acesso: quem já
        // está vinculado continua respondendo normalmente logo abaixo.
        console.error("[GetAccountSubscription] falha no vínculo por e-mail:", err && err.message);
        linkedNow = [];
      }
      for (const correlationCode of linkedNow) {
        // Auditoria sem buraco (mesmo padrão do ADMIN_OVERRIDE): dá pra
        // responder depois "por que essa conta tem acesso a essa assinatura".
        // Só grava quando o UPDATE condicional realmente venceu a corrida.
        try {
          repo.logEvent({
            correlationCode,
            fromStatus: null,
            toStatus: null,
            rawEvent: `ACCOUNT_LINK(email_match) user=${userId}`,
            rawPayload: null,
          });
        } catch (err) {
          console.error("[GetAccountSubscription] falha ao registrar vínculo:", err && err.message);
        }
      }
    }

    const all = dedupeByProviderSubscription(repo.findByUserId(userId) || []);
    const withAccess = all.filter((s) => s.hasAccess());
    const best = pickBest(all);

    return {
      // Fonte autoritativa: quando a conta concede acesso, ela ganha do
      // ponteiro guardado no aparelho (que pode estar velho ou apontando pra
      // linha errada — foi o caso do Carlos, cujo aparelho apontava pra
      // pendência das 17:48 enquanto a compra aprovada era a das 17:14).
      source: "account",
      hasAccess: withAccess.length > 0,
      hasCoupleAccess: withAccess.some((s) => (s.scope || "solo") === "couple"),
      status: best ? best.status : null,
      plan: best ? best.plan : null,
      scope: best ? best.scope || "solo" : null,
      currentPeriodEnd: best ? best.currentPeriodEnd || null : null,
      // O app regrava este código na chave local do AsyncStorage — é o
      // auto-reparo: um aparelho com ponteiro podre se conserta sozinho no
      // primeiro login e continua funcionando depois, offline e deslogado.
      correlationCode: best ? best.correlationCode : null,
      linkedNow: linkedNow.length,
      subscriptions: all.map(toPublicShape),
    };
  }
}

module.exports = { GetAccountSubscriptionUseCase, maskEmail };
