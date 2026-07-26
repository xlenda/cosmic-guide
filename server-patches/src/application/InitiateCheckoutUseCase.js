// Preço de cada plano, fixado AQUI no servidor (espelha as 3 ofertas reais do
// Hotmart — ver HotmartPaymentProvider.js). Antes amountCents/currency vinham
// do body da requisição: não dava pra pagar menos com isso (o webhook do
// Hotmart sobrescreve com o valor real da compra), mas deixava qualquer um
// gravar um valor mentiroso no registro pendente — dado do cliente nunca
// deve decidir preço, nem cosmético (achado de auditoria, 26/07/2026).
const PLAN_PRICING = {
  trial: { amountCents: 500, currency: "USD" },
  quarterly: { amountCents: 1000, currency: "USD" },
  annual: { amountCents: 2000, currency: "USD" },
};

// Janela de reuso de pendência. Dentro dela, clicar "Assinar" de novo devolve a
// MESMA linha em vez de criar outra (o Carlos gerou 4 linhas pendentes pra 1
// compra em 26/07 — e a cascata de correlação do webhook por e-mail tem que
// escolher uma delas no escuro).
//
// 24h é um chute com viés pro lado seguro: curto demais volta a criar linha por
// clique; longo demais reabre um checkout de um plano que a pessoa nem quer
// mais. Constante nomeada de propósito — revisar com dado real de funil depois
// de 1-2 semanas.
const PENDING_REUSE_WINDOW_MS = 24 * 60 * 60 * 1000;

function normalizeScope({ scope, coupleName }) {
  if (scope === "couple" || scope === "solo") return scope;
  return typeof coupleName === "string" && coupleName.trim() ? "couple" : "solo";
}

class InitiateCheckoutUseCase {
  constructor(repository, paymentProvider) {
    this.repository = repository;
    this.paymentProvider = paymentProvider;
  }

  // supabaseUserId/accountEmail vêm do JWT verificado (optionalAuth em
  // server.js), NUNCA do body. Sem token (funil web antigo em oddpro.pro, ou
  // sessão expirada) tudo continua funcionando exatamente como antes: cria
  // pendência nova e devolve checkoutConfig.
  async execute({ coupleName, customerEmail, plan = "trial", supabaseUserId, accountEmail, scope }) {
    const repo = this.repository;
    const can = (method) => typeof repo[method] === "function";
    const resolvedScope = normalizeScope({ scope, coupleName });

    // O e-mail do checkout passa a ser o da SESSÃO quando existe token. Dois
    // motivos: (1) antes qualquer um podia POSTar o e-mail de outra pessoa e
    // criar uma pendência "dela", que a cascata do webhook por e-mail poderia
    // casar; (2) mandar o e-mail do login no prefilledInfo aumenta a chance de
    // o buyerEmail que volta no webhook casar com a linha certa.
    const effectiveEmail = supabaseUserId && accountEmail ? accountEmail : customerEmail;

    if (supabaseUserId) {
      // 1) Conta já tem acesso NESTE escopo -> não cria nada.
      // Isto é o que mata o laço do Carlos: clicar "Assinar" depois de pago
      // vira no-op em vez de criar pendência nova e roubar o ponteiro do
      // aparelho. Sem checkoutConfig, o app mostra "você já assina" em vez de
      // abrir a Hotmart.
      //
      // O ESCOPO é obrigatório aqui: assinante SOLO que forma casal PRECISA
      // conseguir comprar o upgrade de casal — bloquear por conta sem olhar o
      // escopo cria um beco sem saída (encontrado ao vivo em 26/07).
      if (can("findActiveForAccount")) {
        const active = repo.findActiveForAccount({ supabaseUserId, scope: resolvedScope });
        if (active) {
          return {
            alreadyActive: true,
            correlationCode: active.correlationCode,
            status: active.status,
            plan: active.plan,
            scope: active.scope || resolvedScope,
            currentPeriodEnd: active.currentPeriodEnd || null,
          };
        }
      }

      // 2) Pendência recente da mesma conta + mesmo plano + mesmo escopo ->
      // reaproveita a linha (um checkout novo em cima do MESMO correlationCode).
      if (can("findRecentPendingForAccount")) {
        const sinceIso = new Date(Date.now() - PENDING_REUSE_WINDOW_MS).toISOString();
        const pending = repo.findRecentPendingForAccount({ supabaseUserId, plan, scope: resolvedScope, sinceIso });
        if (pending) {
          const checkoutConfig = await this.paymentProvider.initiateCheckout({
            correlationCode: pending.correlationCode,
            coupleName: coupleName || pending.coupleName,
            customerEmail: effectiveEmail,
            plan,
          });
          return { correlationCode: pending.correlationCode, checkoutConfig, reused: true };
        }
      }
    }

    // 3) Cria pendência nova — já vinculada à conta quando há token.
    // Plano desconhecido cai pro trial — mesmo fallback que o
    // HotmartPaymentProvider já aplica ao escolher o offerCode.
    const pricing = PLAN_PRICING[plan] || PLAN_PRICING.trial;
    const subscription = repo.createPending({
      coupleName,
      provider: "hotmart",
      plan,
      amountCents: pricing.amountCents,
      currency: pricing.currency,
      customerEmail: effectiveEmail,
      supabaseUserId: supabaseUserId || null,
      accountEmail: supabaseUserId ? accountEmail || null : null,
      scope: resolvedScope,
    });

    const checkoutConfig = await this.paymentProvider.initiateCheckout({
      correlationCode: subscription.correlationCode,
      coupleName,
      customerEmail: effectiveEmail,
      plan,
    });

    return { correlationCode: subscription.correlationCode, checkoutConfig };
  }
}

module.exports = { InitiateCheckoutUseCase, PENDING_REUSE_WINDOW_MS };
