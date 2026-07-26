// Normaliza um e-mail pra comparação: a Hotmart devolve o e-mail exatamente
// como a pessoa digitou no checkout (maiúsculas, espaço colado), e o app manda
// o e-mail do login do Supabase. Sem normalizar, "Carlos@Gmail.com " nunca
// casaria com "carlos@gmail.com" salvo no banco. Retorna null pra qualquer
// coisa que não seja um e-mail plausível — NUNCA usamos string vazia/lixo como
// chave de correlação (isso ativaria a assinatura errada).
function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length < 5 || email.length > 254) return null;
  if (/\s/.test(email)) return null;
  const at = email.indexOf("@");
  if (at <= 0 || at !== email.lastIndexOf("@") || at === email.length - 1) return null;
  if (!email.slice(at + 1).includes(".")) return null;
  return email;
}

class ProcessWebhookUseCase {
  constructor(repository, paymentProvider, conversionTracker) {
    this.repository = repository;
    this.paymentProvider = paymentProvider;
    // Opcional — null quando FB_PIXEL_ID/FB_CONVERSIONS_API_TOKEN não estão
    // configurados (ver server.js). Nunca bloqueia nem derruba o
    // processamento do webhook (achado real de auditoria, 19/07/2026).
    this.conversionTracker = conversionTracker || null;
  }

  // Localiza a assinatura de um evento em cascata, do identificador mais forte
  // pro mais fraco. Antes existia SÓ o primeiro degrau (xcod), e como a
  // Hotmart não devolve xcod nenhum no Checkout Elements embutido (confirmado
  // no payload real de produção, 26/07/2026), 100% das compras aprovadas eram
  // rejeitadas com "sem correlationCode no payload" — cliente pagante sem
  // acesso.
  //
  // Segurança: este método só roda DEPOIS de verifyWebhookSignature() passar,
  // ou seja, quem chegou aqui provou conhecer o HOTTOK. Casar por e-mail não
  // abre superfície nova — quem consegue forjar um webmhook válido já podia
  // forjar um xcod.
  resolveSubscription(event, buyerEmail) {
    const repo = this.repository;
    const can = (method) => typeof repo[method] === "function";

    // 1) xcod (fluxo por link do app nativo) — correlação exata e explícita.
    if (event.correlationCode) {
      const sub = repo.findByCorrelationCode(event.correlationCode);
      if (sub) return { subscription: sub, matchedBy: "xcod" };
    }

    // 2) subscriber code da Hotmart — identificador estável da assinatura,
    // gravado em provider_subscription_id na primeira ativação. É o que faz
    // renovação, atraso, cancelamento e estorno acharem a linha certa PRA
    // SEMPRE, mesmo sem xcod e mesmo se o cliente trocar de e-mail.
    if (event.providerSubscriptionId && can("findByProviderSubscriptionId")) {
      const sub = repo.findByProviderSubscriptionId(event.providerSubscriptionId);
      if (sub) return { subscription: sub, matchedBy: "provider_subscription_id" };
    }

    // 3) id da transação — só quando é diferente do subscriber code (compras
    // avulsas antigas gravaram a transação nesse mesmo campo).
    if (event.transactionId && event.transactionId !== event.providerSubscriptionId && can("findByProviderSubscriptionId")) {
      const sub = repo.findByProviderSubscriptionId(event.transactionId);
      if (sub) return { subscription: sub, matchedBy: "transaction" };
    }

    if (!buyerEmail) return { subscription: null, matchedBy: null };

    // 4) e-mail do comprador + status pending, a MAIS RECENTE.
    // Por que "a mais recente" e não "a mais antiga": o app sobrescreve o
    // correlationCode salvo no aparelho a cada clique em "Assinar"
    // (saveSoloCorrelationCode/saveCorrelationCode usam UMA chave por
    // e-mail/casal no AsyncStorage). Ou seja, a única linha que o aparelho da
    // pessoa consegue consultar depois é a da ÚLTIMA tentativa. Ativar
    // qualquer outra deixaria o cliente pagando e vendo o paywall — que é
    // exatamente o bug que estamos corrigindo. O Carlos tinha 4 pendências do
    // mesmo e-mail; só a última é visível pro aparelho dele.
    if (can("findLatestPendingByCustomerEmail")) {
      const sub = repo.findLatestPendingByCustomerEmail(buyerEmail);
      if (sub) return { subscription: sub, matchedBy: "email(pendente mais recente)" };
    }

    // 5) e-mail do comprador em qualquer status — necessário pra eventos
    // NEGATIVOS (estorno/cancelamento) que chegam quando já não existe
    // nenhuma pendência, e pra reentregas depois da ativação (transitionTo
    // pro mesmo status é no-op, então é seguro).
    if (can("findLatestByCustomerEmail")) {
      const sub = repo.findLatestByCustomerEmail(buyerEmail);
      if (sub) return { subscription: sub, matchedBy: "email(qualquer status)" };
    }

    return { subscription: null, matchedBy: null };
  }

  // rawBody: string bruta (necessária pra validar assinatura); headers: headers HTTP; payload: JSON já parseado.
  execute({ rawBody, headers, payload }) {
    const signatureOk = this.paymentProvider.verifyWebhookSignature(rawBody, headers);
    if (!signatureOk) {
      // correlation_code é NOT NULL em subscription_events (schema em infrastructure/db.js) e o
      // payload ainda nem foi parseado aqui, então não existe correlationCode de verdade — usamos
      // um marcador textual em vez de null pra não violar a constraint e perder o registro de auditoria.
      // rawPayload NÃO é guardado aqui — assinatura inválida significa que
      // não temos garantia nenhuma de que isso veio da Hotmart de verdade,
      // então pode ser lixo/tentativa de abuso; guardar o corpo inteiro sem
      // necessidade só acumula dado (possivelmente PII real, se for um
      // webhook legítimo que falhou por outro motivo) sem nunca ser
      // revisado ou apagado (achado real de auditoria, 25/07/2026).
      this.repository.logEvent({
        correlationCode: "(sem correlationCode)",
        fromStatus: null,
        toStatus: null,
        rawEvent: "REJEITADO(assinatura inválida)",
        rawPayload: null,
      });
      return { ok: false, reason: "assinatura inválida" };
    }

    const event = this.paymentProvider.parseWebhookEvent(payload);

    // Dedupe de reentrega (achado real de auditoria, 18/07/2026): sem isso,
    // um reenvio fora de ordem do Hotmart podia reaplicar uma transição já
    // processada (ex.: reativar algo que já tinha sido cancelado depois).
    if (this.repository.wasEventProcessed(event.eventId)) {
      this.repository.logEvent({
        correlationCode: event.correlationCode || "(sem correlationCode)",
        fromStatus: null,
        toStatus: null,
        rawEvent: `IGNORADO(evento duplicado, id=${event.eventId}): ${event.rawEvent}`,
        rawPayload: payload,
      });
      return { ok: true, duplicate: true };
    }

    const buyerEmail = normalizeEmail(event.buyerEmail);
    const { subscription, matchedBy } = this.resolveSubscription(event, buyerEmail);

    if (!subscription) {
      // Mensagem explícita do que foi tentado — o "sem correlationCode no
      // payload" antigo escondia que o problema real era não ter NENHUMA
      // forma de correlação.
      const tentativas = [
        event.correlationCode ? `xcod=${event.correlationCode}` : "sem xcod",
        event.providerSubscriptionId ? `subscriber=${event.providerSubscriptionId}` : "sem subscriber code",
        buyerEmail ? "e-mail do comprador sem assinatura correspondente" : "sem e-mail do comprador",
      ].join("; ");
      this.repository.logEvent({
        correlationCode: event.correlationCode || "(sem correlationCode)",
        fromStatus: null,
        toStatus: null,
        rawEvent: `REJEITADO(assinatura não localizada: ${tentativas}): ${event.rawEvent}`,
        rawPayload: payload,
      });
      return { ok: false, reason: "assinatura não localizada (sem xcod, sem subscriber code conhecido e sem pendência pro e-mail)" };
    }

    const correlationCode = subscription.correlationCode;
    const fromStatus = subscription.status;

    if (event.status) {
      try {
        subscription.transitionTo(event.status);
      } catch (err) {
        // Evento fora de ordem (ex: webhook duplicado ou reentregue) — registra mas não derruba o processo.
        this.repository.logEvent({
          correlationCode,
          fromStatus,
          toStatus: fromStatus,
          rawEvent: `IGNORADO(${err.message}) [match:${matchedBy}]: ${event.rawEvent}`,
          rawPayload: payload,
        });
        return { ok: true, ignored: true, reason: err.message, matchedBy };
      }
    }

    // Preço só é sobrescrito quando o evento traz um valor REAL cobrado. No
    // trial "7 dias grátis" a Hotmart manda price.value = 0 nos três campos de
    // preço — gravar isso apagaria o preço do plano (500/1000/2000) que o
    // servidor já fixou em InitiateCheckoutUseCase e faria todo relatório
    // dizer que o assinante paga zero pra sempre.
    if (event.amountCents != null && event.amountCents > 0) subscription.amountCents = event.amountCents;
    if (event.currency) subscription.currency = event.currency;
    // provider_subscription_id é a IDENTIDADE da assinatura no provedor — só é
    // carimbado por evento que representa estado real de compra (event.status
    // preenchido: aprovado, ativo, atrasado, cancelado, estornado). Eventos
    // sem status (PURCHASE_BILLET_PRINTED de boleto/PIX, PURCHASE_DELAYED,
    // PURCHASE_OUT_OF_SHOPPING_CART) agora casam por e-mail com a pendência
    // mais recente — e se eles pudessem gravar esse campo, marcariam a linha
    // com um identificador que o PURCHASE_APPROVED posterior não usa,
    // quebrando a correlação justamente na hora do dinheiro entrar.
    if (event.status && event.providerSubscriptionId) {
      subscription.providerSubscriptionId = event.providerSubscriptionId;
    }
    if (event.currentPeriodEnd) subscription.currentPeriodEnd = event.currentPeriodEnd;
    // Backfill do e-mail quando a linha foi criada sem ele (checkout iniciado
    // deslogado, funil web antigo): sem isso o suporte continua sem conseguir
    // achar a assinatura por e-mail, e o próprio fallback acima nunca
    // funcionaria numa renovação futura. Nunca SOBRESCREVE um e-mail já
    // existente (ver COALESCE em SubscriptionRepository.save).
    if (!subscription.customerEmail && buyerEmail) subscription.customerEmail = buyerEmail;

    this.repository.save(subscription);
    this.repository.logEvent({
      correlationCode,
      fromStatus,
      toStatus: subscription.status,
      rawEvent: `${event.rawEvent} [match:${matchedBy}]`,
      rawPayload: payload,
    });
    // Só marca como processado DEPOIS que a transição de estado real já foi
    // salva — se uma reentrega chegar entre o save() e aqui (nunca acontece
    // de fato, é síncrono, mas por clareza), a reentrega ainda seria pega.
    this.repository.markEventProcessed(event.eventId);

    // Purchase = primeira ativação real (pending -> active), nunca uma
    // renovação nem qualquer outra transição. Fire-and-forget: execute()
    // é síncrono (better-sqlite3) e o Hotmart precisa de resposta rápida do
    // webhook — uma falha na Conversions API (rede, token revogado) nunca
    // pode atrasar nem derrubar o processamento real da compra.
    if (this.conversionTracker && fromStatus === "pending" && subscription.status === "active") {
      this.conversionTracker
        .trackPurchase({
          correlationCode,
          amountCents: subscription.amountCents,
          currency: subscription.currency,
          customerEmail: subscription.customerEmail,
        })
        .catch((err) => console.error("[conversion-tracking] falha ao enviar Purchase:", err.message));
    }

    return { ok: true, status: subscription.status, matchedBy };
  }
}

module.exports = { ProcessWebhookUseCase, normalizeEmail };
