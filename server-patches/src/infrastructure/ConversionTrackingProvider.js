// Confirmação server-side de Purchase via Meta Conversions API. Falhas nunca
// devem invalidar o webhook de pagamento; o chamador usa esta classe em modo
// fire-and-forget.
const crypto = require("crypto");

const META_GRAPH_VERSION = "v21.0";

function hashEmail(email) {
  return crypto.createHash("sha256").update(String(email).trim().toLowerCase()).digest("hex");
}

class ConversionTrackingProvider {
  constructor({ pixelId, accessToken }) {
    this.pixelId = pixelId;
    this.accessToken = accessToken;
  }

  async trackPurchase({ correlationCode, amountCents, currency, customerEmail }) {
    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: correlationCode,
          action_source: "website",
          user_data: customerEmail ? { em: [hashEmail(customerEmail)] } : {},
          custom_data: {
            value: (amountCents || 0) / 100,
            currency: currency || "USD",
          },
        },
      ],
      // O token vai no corpo para não vazar em query strings de proxy/log.
      access_token: this.accessToken,
    };

    const resp = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${this.pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const responseText = await resp.text().catch(() => "");
      throw new Error(`Conversions API respondeu ${resp.status}: ${responseText}`);
    }
  }
}

module.exports = { ConversionTrackingProvider };
