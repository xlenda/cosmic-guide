// Interface abstrata de processador de pagamento (Dependency Inversion).
// Qualquer processador novo (Stripe, PagSeguro, etc.) implementa esta classe —
// o resto do sistema (casos de uso, rotas HTTP) nunca depende do provedor concreto.

class PaymentProvider {
  async initiateCheckout(_params) {
    throw new Error("initiateCheckout não implementado");
  }

  verifyWebhookSignature(_rawBody, _headers) {
    throw new Error("verifyWebhookSignature não implementado");
  }

  parseWebhookEvent(_payload) {
    throw new Error("parseWebhookEvent não implementado");
  }
}

module.exports = { PaymentProvider };
