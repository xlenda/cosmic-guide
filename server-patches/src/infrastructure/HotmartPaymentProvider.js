// Primeira implementação concreta de PaymentProvider — trocável por outra sem
// tocar em domínio, casos de uso ou rotas HTTP.
//
// CORREÇÃO 26/07/2026 (incidente real: Carlos Alberto, compra APROVADA na
// Hotmart e REJEITADA aqui). O parser lia três campos em caminhos que NÃO
// existem no payload real de produção (payload salvo em
// subscription_events id=9):
//   1. correlationCode vinha de data.purchase.origin.xcod — `origin` não vem
//      no evento. O Checkout Elements embutido (checkoutElements.init({xcod}))
//      NÃO devolve o xcod no webhook. Resultado: correlationCode = null e o
//      ProcessWebhookUseCase rejeitava TODA compra aprovada.
//   2. currentPeriodEnd vinha de data.subscription.date_next_charge — o valor
//      real está em data.purchase.date_next_charge e em EPOCH MILISSEGUNDOS
//      (1785672000000), não ISO. Ia cru pro banco e o app não formatava.
//   3. amount/currency vinham só de data.purchase.price — no trial "7 dias
//      grátis" isso é {value: 0, currency_value: "USD"}.
// Além disso, reembolso/chargeback nunca revogavam acesso quando a Hotmart
// mandava data.subscription.status = "ACTIVE" no mesmo payload.

const { PaymentProvider } = require("../domain/PaymentProvider");
const { timingSafeStringEqual } = require("./timingSafeCompare");

// Formato do código gerado por SubscriptionRepository.generateCorrelationCode()
// (crypto.randomBytes(16).toString("hex")) = 32 hex. Serve pra separar um xcod
// NOSSO de um parâmetro de tracking qualquer que a Hotmart devolva no mesmo
// objeto `origin` (ex.: `src` de campanha) — nunca tratamos "utm-facebook"
// como se fosse uma correlação de assinatura.
const CORRELATION_CODE_RE = /^[a-f0-9]{32}$/i;

// Hotmart manda data em DOIS formatos, dependendo do campo e da versão do
// evento: string ISO 8601 ("2026-08-06", "2026-08-02T00:00:00Z") ou epoch em
// milissegundos (1785672000000 — confirmado no payload real de produção).
// String já legível volta como veio (nunca reformatamos o que o provedor
// mandou pronto); número vira ISO.
function epochToIso(n) {
  if (!Number.isFinite(n) || n <= 0) return null;
  // Abaixo de 1e12 só pode ser epoch em SEGUNDOS (1e12 ms = ano 2001).
  const ms = n < 1e12 ? n * 1000 : n;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function toIsoDate(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return epochToIso(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) return epochToIso(Number(trimmed));
    return trimmed;
  }
  return null;
}

// Primeiro objeto de preço com valor > 0. No trial os três vêm zerados —
// nesse caso devolvemos 0 mesmo (é o valor real cobrado agora), e quem decide
// se sobrescreve o preço do plano é o caso de uso.
function pickPrice(purchase) {
  const candidates = [purchase?.price, purchase?.full_price, purchase?.original_offer_price];
  for (const c of candidates) {
    if (c && typeof c.value === "number" && c.value > 0) return c;
  }
  for (const c of candidates) {
    if (c && typeof c.value === "number") return c;
  }
  return null;
}

function firstNonEmptyString(...values) {
  for (const v of values) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

// Mapeia os eventos/estado do Hotmart para o vocabulário interno
// (pending/active/past_due/canceled/expired).
function normalizeStatus({ event, subscriptionStatus }) {
  // Dinheiro DEVOLVIDO tem precedência sobre qualquer status de assinatura que
  // venha no mesmo payload: em reembolso/chargeback a Hotmart continua mandando
  // data.subscription.status = "ACTIVE" com frequência, e a ordem antiga
  // (status da assinatura primeiro) devolvia "active" — ou seja, um estorno
  // NUNCA revogava o acesso do cliente estornado. Só estes dois preemptam;
  // PURCHASE_CANCELED/EXPIRED continuam cedendo pro status da assinatura
  // (uma cobrança avulsa cancelada não encerra uma assinatura ainda ativa).
  if (event === "PURCHASE_REFUNDED" || event === "PURCHASE_CHARGEBACK") return "expired";

  if (subscriptionStatus === "ACTIVE") return "active";
  if (subscriptionStatus === "STARTED") return "active";
  if (subscriptionStatus === "OVERDUE" || subscriptionStatus === "DELAYED") return "past_due";
  if (
    subscriptionStatus === "CANCELLED_BY_CUSTOMER" ||
    subscriptionStatus === "CANCELLED_BY_SELLER" ||
    subscriptionStatus === "CANCELLED_BY_ADMIN"
  ) {
    return "canceled";
  }
  if (event === "PURCHASE_APPROVED" || event === "PURCHASE_COMPLETE") return "active";
  // SUBSCRIPTION_CANCELLATION é o evento dedicado de cancelamento de
  // assinatura da Hotmart (envelope diferente do PURCHASE_*) — antes caía no
  // `return null` e o cancelamento era silenciosamente ignorado.
  if (event === "PURCHASE_CANCELED" || event === "SUBSCRIPTION_CANCELLATION") return "canceled";
  if (event === "PURCHASE_REFUNDED" || event === "PURCHASE_CHARGEBACK" || event === "PURCHASE_EXPIRED") return "expired";
  return null;
}

class HotmartPaymentProvider extends PaymentProvider {
  // offerCodes: { trial, quarterly, annual } — 3 ofertas reais cadastradas no
  // mesmo produto Hotmart (Planos: 7 dias grátis/mensal $5, Trimestral $10,
  // Anual $20), pra deixar a pessoa escolher o plano na hora de assinar em
  // vez de só existir a única oferta mensal (achado real de auditoria de
  // retenção, 25/07/2026 — "oferecer o benefício de cada plano").
  constructor({ hottok, offerCodes }) {
    super();
    if (!hottok) throw new Error("HotmartPaymentProvider precisa de hottok (token do webhook configurado no painel Hotmart)");
    this.hottok = hottok;
    this.offerCodes = offerCodes || {};
  }

  async initiateCheckout({ correlationCode, coupleName, customerEmail, plan }) {
    // Checkout Elements é montado no NAVEGADOR (biblioteca JS do Hotmart) — aqui só
    // devolvemos a configuração pronta pro frontend chamar checkoutElements.init(...).
    // Plano desconhecido/ausente cai no trial (mesmo comportamento de sempre,
    // pra nunca quebrar quem já chama sem informar plano).
    //
    // ATENÇÃO (confirmado em produção, 26/07/2026): a Hotmart NÃO devolve esse
    // xcod no webhook do Checkout Elements embutido. Ele continua sendo enviado
    // (é grátis, e volta em `data.purchase.origin.xcod` no fluxo por LINK, que
    // é o usado no app nativo), mas o backend NÃO PODE depender dele — a
    // correlação real por e-mail/subscriber code vive em ProcessWebhookUseCase.
    const offerCode = this.offerCodes[plan] || this.offerCodes.trial;
    return {
      provider: "hotmart",
      renderMode: "inline",
      offerCode,
      xcod: correlationCode,
      prefilledInfo: {
        name: coupleName || undefined,
        email: customerEmail || undefined,
      },
    };
  }

  verifyWebhookSignature(rawBody, headers) {
    const received = headers["x-hotmart-hottok"] || headers["X-HOTMART-HOTTOK"];
    return Boolean(received) && timingSafeStringEqual(received, this.hottok);
  }

  parseWebhookEvent(payload) {
    const event = payload?.event || null;
    const data = payload?.data || {};
    const purchase = data.purchase || {};
    const subscription = data.subscription || {};
    const buyer = data.buyer || {};
    // SUBSCRIPTION_CANCELLATION usa data.subscriber em vez de data.buyer.
    const subscriber = data.subscriber || subscription.subscriber || {};

    // xcod só chega no fluxo por LINK (app nativo, ?xcod=...). `origin.src` é
    // o mesmo campo usado pra tracking de campanha, então só aceitamos quando
    // ele tem exatamente o formato do nosso correlationCode.
    const origin = purchase.origin || subscription.origin || {};
    const rawXcod = firstNonEmptyString(origin.xcod, data.xcod, purchase.xcod);
    const rawSrc = firstNonEmptyString(origin.src, purchase.src);
    const correlationCode =
      rawXcod || (rawSrc && CORRELATION_CODE_RE.test(rawSrc) ? rawSrc : null) || null;

    const status = normalizeStatus({ event, subscriptionStatus: subscription.status });
    const price = pickPrice(purchase);

    // Renovação/cancelamento futuros chegam SEM xcod — o subscriber code
    // (data.subscription.subscriber.code, "6QAE1D6J" no payload real) é o
    // identificador estável da assinatura na Hotmart e é o que grava em
    // subscriptions.provider_subscription_id pra casar os próximos eventos.
    //
    // NUNCA cai pro id de TRANSAÇÃO aqui (purchase.transaction). Isso era um
    // fallback tentador e errado: eventos que chegam ANTES do pagamento existir
    // (PURCHASE_BILLET_PRINTED de boleto/PIX, PURCHASE_OUT_OF_SHOPPING_CART,
    // PURCHASE_DELAYED) não trazem subscriber code nenhum, então carimbariam a
    // linha da assinatura com um id de transação — e o PURCHASE_APPROVED real,
    // que chega depois com o subscriber code de verdade, não acharia mais nada
    // por esse campo. É literalmente o bug "pagou e ficou sem acesso" voltando
    // por outra porta. A transação continua disponível em `transactionId`
    // (campo separado abaixo), que ProcessWebhookUseCase usa como degrau
    // PRÓPRIO da cascata de correlação — sem nunca virar identidade da
    // assinatura.
    const providerSubscriptionId = firstNonEmptyString(
      subscriber.code,
      subscription.subscriber_code,
      subscription.code
    );

    return {
      // UUID único da notificação (confirmado em exemplo real da doc oficial
      // do Hotmart — todo tipo de evento manda esse envelope). Usado pra
      // dedupe de reentrega — null se um payload antigo/atípico não tiver.
      eventId: payload?.id || null,
      correlationCode,
      status,
      providerSubscriptionId,
      // Transação da compra (HP1260209174) — guardada separada do subscriber
      // code pra servir de segunda chave de correlação sem sobrescrever a
      // primeira.
      transactionId: firstNonEmptyString(purchase.transaction),
      // E-mail do comprador: a ÚNICA correlação que sobrou quando não vem
      // xcod. Vem em data.buyer.email (PURCHASE_*) ou data.subscriber.email
      // (SUBSCRIPTION_CANCELLATION).
      buyerEmail: firstNonEmptyString(buyer.email, subscriber.email, data.contact?.email),
      amountCents: price && typeof price.value === "number" ? Math.round(price.value * 100) : null,
      currency: firstNonEmptyString(
        price && price.currency_value,
        purchase.price?.currency_value,
        purchase.full_price?.currency_value,
        purchase.original_offer_price?.currency_value
      ),
      // Data da próxima cobrança. No payload REAL de produção ela vem em
      // data.purchase.date_next_charge como epoch em MILISSEGUNDOS
      // (1785672000000 = 2026-08-02T12:00:00.000Z) — a leitura antiga
      // (data.subscription.date_next_charge) devolvia undefined em 100% dos
      // eventos reais, então current_period_end nunca era preenchido e o app
      // nunca mostrava "renova em".
      currentPeriodEnd: toIsoDate(
        purchase.date_next_charge != null ? purchase.date_next_charge : subscription.date_next_charge
      ),
      // Momento real do evento (epoch ms no envelope) — usado só pra
      // auditoria/ordenação; nunca decide status.
      eventTime: toIsoDate(payload?.creation_date) || toIsoDate(purchase.approved_date) || toIsoDate(purchase.order_date),
      rawEvent: event,
    };
  }
}

module.exports = { HotmartPaymentProvider };
