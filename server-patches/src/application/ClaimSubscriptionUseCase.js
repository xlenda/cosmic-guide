// "Recuperar minha assinatura": vincula à conta logada a assinatura cujo
// correlationCode ainda está guardado no aparelho.
//
// PRA QUE SERVE, se o /me já vincula sozinho por e-mail: quando o e-mail do
// PAGAMENTO é diferente do e-mail do LOGIN (pagou no PayPal da esposa, cartão de
// terceiro, digitou errado no checkout da Hotmart), o email_match nunca dispara.
// Aí a única prova que a pessoa tem é o código de 128 bits que o aparelho dela
// guardou — que é EXATAMENTE a mesma prova que hoje já concede acesso total via
// GET /api/subscription/:correlationCode. Ou seja: /claim não abre superfície
// nova, ele ESTREITA a que já existe (o código passa a valer pra uma conta).

// Formato de SubscriptionRepository.generateCorrelationCode()
// (crypto.randomBytes(16).toString("hex")) — 32 hex, 128 bits.
const CORRELATION_CODE_RE = /^[a-f0-9]{32}$/i;

class ClaimSubscriptionUseCase {
  constructor(repository, getAccountSubscription) {
    this.repository = repository;
    this.getAccountSubscription = getAccountSubscription;
  }

  // Retorna { ok:false, status:<http>, error } ou { ok:true, account }.
  //
  // emailVerified só existe pra ser REPASSADO ao GetAccountSubscriptionUseCase
  // no fim (a resposta do /claim é o mesmo objeto de conta que o /me devolve).
  // Nada aqui decide nada com ele, e ele vem sempre do token já verificado
  // (isEmailVerified(req.authPayload) em accountRoutes.js) — nunca do corpo.
  execute({ userId, email, correlationCode, emailVerified }) {
    const code = typeof correlationCode === "string" ? correlationCode.trim() : "";
    if (!CORRELATION_CODE_RE.test(code)) {
      return { ok: false, status: 400, error: "código inválido" };
    }

    const subscription = this.repository.findByCorrelationCode(code);

    // Código inexistente e código de OUTRA conta devolvem a MESMA resposta
    // genérica de propósito: senão a rota vira um oráculo — daria pra varrer
    // códigos e descobrir quais existem, e ainda saber quais já têm dono.
    // (Mesma escolha do /api/invite/accept, que responde ok pra tudo.)
    const generic = { ok: false, status: 409, error: "não foi possível vincular essa assinatura" };
    if (!subscription) return generic;

    const owner = subscription.supabaseUserId || null;
    if (owner && owner !== userId) return generic;

    if (!owner) {
      // Vínculo de primeiro dono, atômico (WHERE supabase_user_id IS NULL).
      // Se outra requisição vencer a corrida no meio, changes = 0 e caímos no
      // genérico — nunca em dois donos nem em dois eventos de auditoria.
      const linked = this.repository.linkToAccount({
        correlationCode: subscription.correlationCode,
        supabaseUserId: userId,
        accountEmail: email,
        linkedBy: "device_code",
      });
      if (!linked) return generic;
      this.repository.logEvent({
        correlationCode: subscription.correlationCode,
        fromStatus: null,
        toStatus: null,
        rawEvent: `ACCOUNT_LINK(device_code) user=${userId}`,
        rawPayload: null,
      });
    }
    // owner === userId cai direto aqui: reivindicar de novo o que já é seu é
    // no-op idempotente (o app pode chamar /claim sem medo depois de um retry).

    // emailVerified repassado: sem ele o /claim devolveria um objeto de conta
    // calculado como se o e-mail não fosse verificado — o que, pro dono, quer
    // dizer "sem acesso" numa resposta que o /me acabou de dar como "com
    // acesso". Falha fechada, então não é brecha; é DERIVA: duas rotas que
    // deveriam responder a mesma coisa passam a discordar, e a próxima pessoa
    // que for consertar essa discordância pode "resolver" afrouxando a
    // verificação. Melhor as duas usarem a mesma entrada desde o começo.
    return { ok: true, account: this.getAccountSubscription.execute({ userId, email, emailVerified }) };
  }
}

module.exports = { ClaimSubscriptionUseCase, CORRELATION_CODE_RE };
