const crypto = require("crypto");
const { db } = require("./db");
const { Subscription } = require("../domain/Subscription");

// Token gerado SEMPRE no servidor (nunca no navegador) — é o que liga o casal ao
// pagamento sem precisar de conta/senha. Se fosse gerado no cliente, qualquer um
// conseguiria forjar um código e ganhar acesso sem pagar.
function generateCorrelationCode() {
  return crypto.randomBytes(16).toString("hex");
}

// Mesma normalização de ProcessWebhookUseCase.normalizeEmail, aplicada aos dois
// lados da comparação: o e-mail salvo veio do login do Supabase e o e-mail do
// webhook veio do que a pessoa digitou no checkout da Hotmart — sem
// LOWER(TRIM(...)) dos dois lados, "Carlos@Gmail.com " nunca casa com
// "carlos@gmail.com". O índice de expressão criado na migração 008 cobre
// exatamente essa forma da consulta.
function normalizeEmailForLookup(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

// 'couple' | 'solo'. Até a migração 009 isso vivia SÓ no aparelho (qual chave do
// AsyncStorage guardou o código). No servidor é derivado de couple_name, que é o
// único sinal que o checkout já mandava. Escopo explícito ('solo'/'couple')
// ganha do derivado — é o que o app passa a mandar no /initiate.
function resolveScope({ scope, coupleName }) {
  if (scope === "couple" || scope === "solo") return scope;
  return typeof coupleName === "string" && coupleName.trim() ? "couple" : "solo";
}

function toEntity(row) {
  if (!row) return null;
  const subscription = new Subscription({
    id: row.correlation_code,
    correlationCode: row.correlation_code,
    coupleName: row.couple_name,
    status: row.status,
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id,
    plan: row.plan,
    amountCents: row.amount_cents,
    currency: row.currency,
    currentPeriodEnd: row.current_period_end,
    customerEmail: row.customer_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
  // Colunas da migração 009 penduradas fora do construtor de propósito: o
  // domínio (Subscription) continua sem saber que existe Supabase, e save()
  // não toca em nenhuma delas — vínculo só muda pelos métodos dedicados abaixo,
  // que são condicionais e auditados.
  subscription.supabaseUserId = row.supabase_user_id || null;
  subscription.accountEmail = row.account_email || null;
  subscription.linkedAt = row.linked_at || null;
  subscription.linkedBy = row.linked_by || null;
  subscription.scope = row.scope || null;
  return subscription;
}

class SubscriptionRepository {
  // Chamado ao iniciar o checkout — cria o registro em "pending" antes de qualquer pagamento existir.
  // supabaseUserId/accountEmail vêm do JWT verificado (nunca do body) quando o
  // app está logado: assim TODO checkout novo já nasce vinculado à conta e
  // nunca mais depende do aparelho pra ser encontrado.
  createPending({ coupleName, provider, plan, amountCents, currency, customerEmail, supabaseUserId, accountEmail, scope }) {
    const correlationCode = generateCorrelationCode();
    const now = new Date().toISOString();
    const userId = typeof supabaseUserId === "string" && supabaseUserId.trim() ? supabaseUserId.trim() : null;
    db.prepare(`
      INSERT INTO subscriptions (
        correlation_code, couple_name, status, provider, plan, amount_cents, currency, customer_email,
        supabase_user_id, account_email, linked_at, linked_by, scope, created_at, updated_at
      )
      VALUES (
        @correlationCode, @coupleName, 'pending', @provider, @plan, @amountCents, @currency, @customerEmail,
        @supabaseUserId, @accountEmail, @linkedAt, @linkedBy, @scope, @now, @now
      )
    `).run({
      correlationCode,
      coupleName: coupleName || null,
      provider,
      plan: plan || null,
      amountCents: amountCents || null,
      currency: currency || null,
      // Guardado já normalizado: é assim que o webhook vai procurar depois.
      customerEmail: normalizeEmailForLookup(customerEmail) || null,
      supabaseUserId: userId,
      accountEmail: userId ? normalizeEmailForLookup(accountEmail) || null : null,
      linkedAt: userId ? now : null,
      linkedBy: userId ? "checkout" : null,
      scope: resolveScope({ scope, coupleName }),
      now,
    });
    return this.findByCorrelationCode(correlationCode);
  }

  // Suporte sem correlationCode em mãos — só o que o cliente lembra (e-mail).
  findByCustomerEmail(customerEmail) {
    const email = normalizeEmailForLookup(customerEmail);
    if (!email) return [];
    const rows = db
      .prepare("SELECT * FROM subscriptions WHERE LOWER(TRIM(customer_email)) = ? ORDER BY created_at DESC")
      .all(email);
    return rows.map(toEntity);
  }

  // Correlação do webhook quando NÃO vem xcod (caso real de produção com o
  // Checkout Elements embutido). "Mais recente" de propósito: o app sobrescreve
  // o correlationCode salvo no aparelho a cada clique em "Assinar", então a
  // última pendência é a única linha que o aparelho da pessoa consegue
  // consultar em /api/subscription/:correlationCode.
  // A ORDENAÇÃO AQUI É DEFESA, NÃO SÓ PREFERÊNCIA (02/08/2026).
  //
  // /api/checkout/initiate é público de propósito (o funil não tem login), e
  // aceita `customerEmail` cru do body. Sem o desempate abaixo, um anônimo
  // podia criar uma pendência com o e-mail de OUTRA pessoa e, como a busca era
  // só `ORDER BY created_at DESC`, a linha dele venceria a corrida no webhook
  // quando a vítima comprasse de verdade: a vítima pagava e via paywall,
  // enquanto o atacante ficava com o correlationCode de uma assinatura ativa.
  //
  // O desempate: linha ligada a uma CONTA cujo e-mail é o mesmo do comprador
  // ganha de qualquer linha anônima. Quem provou posse do e-mail (login no
  // Supabase) vence quem só digitou o e-mail num body de requisição. Só quando
  // não existe nenhuma linha de conta é que as anônimas concorrem entre si
  // pela data — que é o caso legítimo do funil (comprador sem login).
  //
  // Isto NÃO substitui a checagem de e-mail em ClaimSubscriptionUseCase: são
  // as duas portas do mesmo ataque (esta fecha "quem o webhook ativa", a de lá
  // fecha "quem consegue vincular à própria conta").
  findLatestPendingByCustomerEmail(customerEmail) {
    const email = normalizeEmailForLookup(customerEmail);
    if (!email) return null;
    const row = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE LOWER(TRIM(customer_email)) = ? AND status = 'pending'
        ORDER BY
          CASE
            WHEN supabase_user_id IS NOT NULL AND LOWER(TRIM(COALESCE(account_email, ''))) = ? THEN 0
            ELSE 1
          END,
          created_at DESC,
          rowid DESC
        LIMIT 1
      `)
      .get(email, email);
    return toEntity(row);
  }

  // Último recurso pra eventos negativos (estorno/cancelamento) que chegam
  // quando já não existe nenhuma pendência daquele e-mail.
  findLatestByCustomerEmail(customerEmail) {
    const email = normalizeEmailForLookup(customerEmail);
    if (!email) return null;
    const row = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE LOWER(TRIM(customer_email)) = ?
        ORDER BY created_at DESC, rowid DESC
        LIMIT 1
      `)
      .get(email);
    return toEntity(row);
  }

  // Identificador estável da assinatura no provedor (subscriber code da
  // Hotmart, gravado na primeira ativação) — é o que faz renovação, atraso,
  // cancelamento e estorno acharem a linha certa sem depender de xcod nem de
  // e-mail. Ignora string vazia de propósito: um '' casaria com toda linha que
  // ficou com o campo vazio.
  findByProviderSubscriptionId(providerSubscriptionId) {
    const id = typeof providerSubscriptionId === "string" ? providerSubscriptionId.trim() : "";
    if (!id) return null;
    const row = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE provider_subscription_id = ?
        ORDER BY updated_at DESC, rowid DESC
        LIMIT 1
      `)
      .get(id);
    return toEntity(row);
  }

  findByCorrelationCode(correlationCode) {
    const row = db.prepare("SELECT * FROM subscriptions WHERE correlation_code = ?").get(correlationCode);
    return toEntity(row);
  }

  // ------------------------------------------------------------------
  // Acesso pela CONTA (migração 009)
  // ------------------------------------------------------------------

  // Todas as assinaturas de uma conta. Ignora string vazia porque um userId ''
  // casaria com toda linha que ficou sem dono (é o mesmo cuidado do
  // findByProviderSubscriptionId).
  findByUserId(supabaseUserId) {
    const userId = typeof supabaseUserId === "string" ? supabaseUserId.trim() : "";
    if (!userId) return [];
    const rows = db
      .prepare("SELECT * FROM subscriptions WHERE supabase_user_id = ? ORDER BY created_at DESC, rowid DESC")
      .all(userId);
    return rows.map(toEntity);
  }

  // A assinatura que DÁ ACESSO àquela conta naquele escopo, se existir.
  // 'past_due' entra junto com 'active' porque é a janela de dunning — o
  // assinante ainda tem acesso (Subscription.hasAccess) e portanto NÃO pode ser
  // mandado pro checkout de novo.
  //
  // O escopo é obrigatório: sem ele, um assinante SOLO que forma casal ficaria
  // impedido de comprar o plano de casal ("você já assina") — beco sem saída
  // real, encontrado ao vivo em 26/07.
  findActiveForAccount({ supabaseUserId, scope }) {
    const userId = typeof supabaseUserId === "string" ? supabaseUserId.trim() : "";
    if (!userId) return null;
    const row = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE supabase_user_id = ?
          AND COALESCE(scope, 'solo') = ?
          AND status IN ('active', 'past_due')
        ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END,
                 COALESCE(current_period_end, '') DESC,
                 updated_at DESC, rowid DESC
        LIMIT 1
      `)
      .get(userId, resolveScope({ scope }));
    return toEntity(row);
  }

  // Pendência recente da MESMA conta + MESMO plano + MESMO escopo, pra
  // reaproveitar em vez de criar linha nova a cada clique em "Assinar" (o
  // Carlos gerou 4 linhas pra 1 compra). sinceIso é a janela de reuso, decidida
  // no caso de uso.
  findRecentPendingForAccount({ supabaseUserId, plan, scope, sinceIso }) {
    const userId = typeof supabaseUserId === "string" ? supabaseUserId.trim() : "";
    if (!userId) return null;
    const row = db
      .prepare(`
        SELECT * FROM subscriptions
        WHERE supabase_user_id = ?
          AND status = 'pending'
          AND COALESCE(scope, 'solo') = ?
          AND COALESCE(plan, '') = ?
          AND created_at >= ?
        ORDER BY created_at DESC, rowid DESC
        LIMIT 1
      `)
      .get(userId, resolveScope({ scope }), plan || "", sinceIso || "");
    return toEntity(row);
  }

  // Vínculo MONOTÔNICO e de primeiro dono: só toca em linha SEM dono
  // (supabase_user_id IS NULL). UPDATE condicional atômico (mesmo padrão do
  // markAccepted em CoupleInviteRepository) porque o app dispara refreshAccess
  // no foco E a cada 5 min — duas chamadas simultâneas de /me tentariam vincular
  // a mesma linha, e sem a condição no WHERE as duas achariam que venceram e
  // gravariam dois eventos de auditoria pro mesmo fato.
  //
  // Devolve true só quando ESTA chamada foi a que vinculou (changes > 0) — é o
  // que decide se o evento de auditoria é gravado.
  linkToAccount({ correlationCode, supabaseUserId, accountEmail, linkedBy }) {
    const userId = typeof supabaseUserId === "string" ? supabaseUserId.trim() : "";
    if (!userId || !correlationCode) return false;
    const result = db
      .prepare(`
        UPDATE subscriptions
           SET supabase_user_id = @supabaseUserId,
               account_email = COALESCE(NULLIF(@accountEmail, ''), account_email),
               linked_at = @now,
               linked_by = @linkedBy,
               -- Linha legada (criada antes da 009) nasce sem escopo; aproveita
               -- o vínculo pra derivar o mesmo valor que o backfill derivaria.
               scope = COALESCE(scope, CASE WHEN couple_name IS NOT NULL AND TRIM(couple_name) <> '' THEN 'couple' ELSE 'solo' END),
               updated_at = @now
         WHERE correlation_code = @correlationCode
           AND supabase_user_id IS NULL
      `)
      .run({
        correlationCode,
        supabaseUserId: userId,
        accountEmail: normalizeEmailForLookup(accountEmail),
        linkedBy: linkedBy || "unknown",
        now: new Date().toISOString(),
      });
    return result.changes > 0;
  }

  // Backfill preguiçoso: toda linha órfã cujo e-mail do PAGAMENTO bate com o
  // e-mail VERIFICADO do token vira daquela conta. É o que faz o Carlos (e
  // qualquer assinante antigo) recuperar o acesso só logando, sem script de
  // migração e sem service_role key.
  //
  // Devolve os códigos efetivamente vinculados por ESTA chamada, pra quem
  // chamou gravar um evento de auditoria por linha.
  linkUnclaimedByCustomerEmail({ supabaseUserId, email }) {
    const userId = typeof supabaseUserId === "string" ? supabaseUserId.trim() : "";
    const normalized = normalizeEmailForLookup(email);
    if (!userId || !normalized) return [];

    const candidates = db
      .prepare(`
        SELECT correlation_code FROM subscriptions
        WHERE LOWER(TRIM(customer_email)) = ? AND supabase_user_id IS NULL
      `)
      .all(normalized);

    const linked = [];
    for (const row of candidates) {
      // Cada linha passa pelo mesmo UPDATE condicional — se outra requisição
      // ganhou a corrida no meio do laço, aquela linha simplesmente não conta.
      if (this.linkToAccount({ correlationCode: row.correlation_code, supabaseUserId: userId, accountEmail: normalized, linkedBy: "email_match" })) {
        linked.push(row.correlation_code);
      }
    }
    return linked;
  }

  // Só o suporte (ADMIN_TOKEN) — é o ÚNICO caminho sem prova de posse, usado
  // quando a pessoa perdeu o aparelho E pagou com outro e-mail. Sobrescreve
  // dono existente e aceita null pra DESvincular (erro de suporte tem que ser
  // reversível). Sempre auditado por quem chama (reason obrigatório).
  setAccountLink({ correlationCode, supabaseUserId, accountEmail }) {
    const userId = typeof supabaseUserId === "string" && supabaseUserId.trim() ? supabaseUserId.trim() : null;
    const now = new Date().toISOString();
    const result = db
      .prepare(`
        UPDATE subscriptions
           SET supabase_user_id = @supabaseUserId,
               account_email = @accountEmail,
               linked_at = CASE WHEN @supabaseUserId IS NULL THEN NULL ELSE @now END,
               linked_by = CASE WHEN @supabaseUserId IS NULL THEN NULL ELSE 'admin' END,
               updated_at = @now
         WHERE correlation_code = @correlationCode
      `)
      .run({
        correlationCode,
        supabaseUserId: userId,
        accountEmail: userId ? normalizeEmailForLookup(accountEmail) || null : null,
        now,
      });
    return result.changes > 0;
  }

  // EXCLUSÃO DE CONTA (política do Google Play) — chamado pelo
  // DELETE /api/subscription/account, sempre com o `sub` do token verificado.
  //
  // DESVINCULA em vez de DELETAR, e isso é decisão consciente, não preguiça:
  // esta linha é o registro do PAGAMENTO (correlation_code, valor, provedor,
  // customer_email do checkout da Hotmart). Apagá-la levaria junto a
  // conciliação de estorno/chargeback e a receita do dono no relatório —
  // documento fiscal não é dado de perfil. O que some é tudo que liga a linha à
  // CONTA que está sendo apagada: supabase_user_id, account_email e a marca do
  // vínculo. Depois disto a linha não aponta mais pra pessoa nenhuma.
  //
  // A retenção do recibo é declarada na página pública de exclusão
  // (public/excluir-conta.html) — a política do Google aceita reter o que a lei
  // exige, DESDE QUE esteja escrito lá.
  forgetAccount({ supabaseUserId }) {
    const userId = typeof supabaseUserId === "string" ? supabaseUserId.trim() : "";
    if (!userId) return 0;
    const result = db
      .prepare(`
        UPDATE subscriptions
           SET supabase_user_id = NULL,
               account_email = NULL,
               linked_at = NULL,
               linked_by = 'account_deleted',
               updated_at = @now
         WHERE supabase_user_id = @userId
      `)
      .run({ userId, now: new Date().toISOString() });
    return result.changes;
  }

  save(subscription) {
    db.prepare(`
      UPDATE subscriptions
      SET status = @status,
          provider_subscription_id = COALESCE(@providerSubscriptionId, provider_subscription_id),
          amount_cents = COALESCE(@amountCents, amount_cents),
          currency = COALESCE(@currency, currency),
          current_period_end = COALESCE(@currentPeriodEnd, current_period_end),
          customer_email = COALESCE(NULLIF(TRIM(customer_email), ''), @customerEmail),
          updated_at = @updatedAt
      WHERE correlation_code = @correlationCode
    `).run({
      status: subscription.status,
      // COALESCE acima: um evento posterior que não traga o subscriber code
      // (ex.: envelope de cancelamento atípico) não pode APAGAR o id que já
      // tínhamos — é justamente ele que faz os próximos eventos acharem a
      // linha certa.
      providerSubscriptionId: subscription.providerSubscriptionId || null,
      amountCents: subscription.amountCents || null,
      currency: subscription.currency || null,
      currentPeriodEnd: subscription.currentPeriodEnd || null,
      // Só PREENCHE quando está vazio (COALESCE olha a coluna primeiro) —
      // nunca troca o e-mail que o cliente usou no checkout por outro.
      customerEmail: normalizeEmailForLookup(subscription.customerEmail) || null,
      updatedAt: new Date().toISOString(),
      correlationCode: subscription.correlationCode,
    });
    // save() NÃO escreve supabase_user_id/account_email/linked_*/scope de
    // propósito: o webhook trafega essa mesma entidade e um COALESCE errado ali
    // poderia trocar o dono de uma assinatura paga a partir de dado do
    // provedor. Vínculo só muda por linkToAccount/setAccountLink.
  }

  logEvent({ correlationCode, fromStatus, toStatus, rawEvent, rawPayload }) {
    db.prepare(`
      INSERT INTO subscription_events (correlation_code, from_status, to_status, raw_event, raw_payload, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(correlationCode, fromStatus || null, toStatus || null, rawEvent || null, JSON.stringify(rawPayload || null), new Date().toISOString());
  }

  // Dedupe de reentrega de webhook — Hotmart pode reenviar a mesma
  // notificação mais de uma vez (achado real de auditoria, 18/07/2026).
  wasEventProcessed(eventId) {
    if (!eventId) return false; // sem id no payload, não dá pra deduplicar — segue o fluxo normal
    return !!db.prepare("SELECT 1 FROM webhook_events_processed WHERE event_id = ?").get(eventId);
  }

  markEventProcessed(eventId) {
    if (!eventId) return;
    db.prepare("INSERT OR IGNORE INTO webhook_events_processed (event_id, processed_at) VALUES (?, ?)").run(eventId, new Date().toISOString());
  }
}

module.exports = { SubscriptionRepository, normalizeEmailForLookup, resolveScope };
