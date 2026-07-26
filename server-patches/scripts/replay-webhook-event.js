// Reprocessa um webhook da Hotmart que já chegou e foi REJEITADO, usando o
// payload íntegro guardado em subscription_events.raw_payload.
//
// Motivo: o backend sempre responde 200 pro Hotmart (pra ele não ficar
// reentregando), então uma compra rejeitada por bug NOSSO nunca volta sozinha.
// O payload fica salvo, mas até agora não havia jeito de reprocessá-lo — a
// única saída era editar o SQLite na mão.
//
// USO (no servidor, depois de subir o código corrigido):
//   cd /root/forja-backend
//   node --env-file=.env scripts/replay-webhook-event.js --list
//   node --env-file=.env scripts/replay-webhook-event.js 9 --dry-run
//   node --env-file=.env scripts/replay-webhook-event.js 9
//
// A assinatura HOTTOK não é revalidada (os headers originais não são
// guardados) — de propósito: o payload só está no banco PORQUE já passou pela
// verificação de assinatura no momento em que chegou, ou foi registrado como
// "REJEITADO(assinatura inválida)" SEM payload. Ainda assim o script se recusa
// a reprocessar qualquer evento cujo raw_event diga "assinatura inválida".
const { db } = require("../src/infrastructure/db");
const { SubscriptionRepository } = require("../src/infrastructure/SubscriptionRepository");
const { HotmartPaymentProvider } = require("../src/infrastructure/HotmartPaymentProvider");
// normalizeEmail é o MESMO usado pelo webhook de produção — importado em vez de
// reimplementado com trim().toLowerCase(), senão o --dry-run poderia dizer que
// casa (ou que não casa) com um critério diferente do que o replay real usa.
const { ProcessWebhookUseCase, normalizeEmail } = require("../src/application/ProcessWebhookUseCase");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const list = args.includes("--list");
const eventRowId = args.find((a) => /^\d+$/.test(a));

function listRejected() {
  const rows = db
    .prepare(`
      SELECT id, correlation_code, raw_event, created_at, length(raw_payload) AS tamanho
        FROM subscription_events
       WHERE raw_event LIKE 'REJEITADO%'
         AND raw_payload IS NOT NULL AND raw_payload != 'null'
       ORDER BY id DESC
       LIMIT 50
    `)
    .all();
  if (!rows.length) {
    console.log("[replay] nenhum webhook rejeitado com payload guardado.");
    return;
  }
  console.log("[replay] webhooks rejeitados que ainda dá pra reprocessar:\n");
  for (const r of rows) {
    console.log(`  id=${r.id}  ${r.created_at}  (${r.tamanho} bytes)  ${r.raw_event}`);
  }
  console.log("\nReprocessar: node --env-file=.env scripts/replay-webhook-event.js <id>");
}

function main() {
  if (list || !eventRowId) {
    listRejected();
    if (!list && !eventRowId) {
      console.error("\n[replay] informe o id do evento (ex.: `node scripts/replay-webhook-event.js 9`).");
      process.exitCode = 1;
    }
    return;
  }

  const row = db.prepare("SELECT * FROM subscription_events WHERE id = ?").get(Number(eventRowId));
  if (!row) {
    console.error(`[replay] evento id=${eventRowId} não existe.`);
    process.exitCode = 1;
    return;
  }
  if (String(row.raw_event || "").includes("assinatura inválida")) {
    console.error(`[replay] evento id=${eventRowId} foi rejeitado por ASSINATURA INVÁLIDA — não é reprocessável (não há garantia de que veio da Hotmart).`);
    process.exitCode = 1;
    return;
  }

  let payload;
  try {
    payload = JSON.parse(row.raw_payload);
  } catch {
    payload = null;
  }
  if (!payload || typeof payload !== "object") {
    console.error(`[replay] evento id=${eventRowId} não tem payload guardado (raw_payload vazio).`);
    process.exitCode = 1;
    return;
  }

  const hottok = process.env.HOTMART_HOTTOK || "replay";
  const provider = new HotmartPaymentProvider({
    hottok,
    offerCodes: {
      trial: process.env.HOTMART_OFFER_CODE || "",
      quarterly: process.env.HOTMART_OFFER_CODE_QUARTERLY || "7b1wqipw",
      annual: process.env.HOTMART_OFFER_CODE_ANNUAL || "lb6plj87",
    },
  });

  const parsed = provider.parseWebhookEvent(payload);
  console.log(`[replay] evento id=${eventRowId} (${row.created_at}) — ${row.raw_event}`);
  console.log("[replay] campos lidos do payload:");
  console.log(
    JSON.stringify(
      {
        eventId: parsed.eventId,
        rawEvent: parsed.rawEvent,
        status: parsed.status,
        correlationCode: parsed.correlationCode,
        providerSubscriptionId: parsed.providerSubscriptionId,
        transactionId: parsed.transactionId,
        buyerEmail: parsed.buyerEmail,
        amountCents: parsed.amountCents,
        currency: parsed.currency,
        currentPeriodEnd: parsed.currentPeriodEnd,
      },
      null,
      2
    )
  );

  const repository = new SubscriptionRepository();

  if (dryRun) {
    const useCase = new ProcessWebhookUseCase(repository, provider, null);
    const { subscription, matchedBy } = useCase.resolveSubscription(parsed, normalizeEmail(parsed.buyerEmail));
    if (!subscription) {
      console.log("[replay][dry-run] NENHUMA assinatura seria localizada — nada seria alterado.");
    } else {
      console.log(
        `[replay][dry-run] casaria com ${subscription.correlationCode} (via ${matchedBy}), status ${subscription.status} -> ${parsed.status}`
      );
    }
    console.log("[replay][dry-run] nada foi gravado.");
    db.close();
    return;
  }

  // Reprocessa pelo MESMO caminho da produção — verifyWebhookSignature é
  // curto-circuitado porque os headers originais não foram guardados (ver
  // comentário do topo).
  const replayProvider = {
    verifyWebhookSignature: () => true,
    parseWebhookEvent: (p) => provider.parseWebhookEvent(p),
    initiateCheckout: (p) => provider.initiateCheckout(p),
  };
  const useCase = new ProcessWebhookUseCase(repository, replayProvider, null);
  const result = useCase.execute({ rawBody: row.raw_payload, headers: {}, payload });
  console.log("[replay] resultado:", JSON.stringify(result));

  if (result.ok && !result.duplicate) {
    const email = normalizeEmail(parsed.buyerEmail);
    if (email) {
      const restantes = db
        .prepare("SELECT correlation_code, status, created_at FROM subscriptions WHERE LOWER(TRIM(customer_email)) = ? ORDER BY created_at DESC")
        .all(email);
      console.log(`[replay] assinaturas do e-mail ${email}:`);
      for (const s of restantes) console.log(`  ${s.correlation_code}  ${s.status}  ${s.created_at}`);
      const pendentes = restantes.filter((s) => s.status === "pending").length;
      if (pendentes) {
        console.log(
          `[replay] AVISO: ainda existem ${pendentes} pendência(s) desse e-mail (tentativas duplicadas do mesmo checkout). ` +
            "Feche-as pelo painel de suporte (POST /api/admin/subscriptions/:code/status com status=canceled) pra elas não entrarem no e-mail de checkout abandonado."
        );
      }
    }
  }

  db.close();
}

main();
