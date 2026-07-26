// CORRIGE o efeito colateral do liberar-carlos.js: ele ativou as 4 pendências do
// Carlos de uma vez para garantir que o aparelho dele encontrasse alguma ativa, e
// isso deixou 4 assinaturas ativas para 1 pagamento único. Dois estragos reais:
//
//   1. RECEITA INFLADA — qualquer relatório que some amount_cents das ativas conta
//      2000 centavos do Carlos onde entrou 500.
//   2. ESTORNO NÃO REVOGA — as 4 linhas têm o mesmo provider_subscription_id
//      (6QAE1D6J) e findByProviderSubscriptionId devolve LIMIT 1. Num estorno ou
//      cancelamento futuro só UMA linha viraria 'canceled'; as outras 3 continuariam
//      'active' e o Carlos ficaria com acesso vitalício depois de pedir o dinheiro
//      de volta.
//
// Deixa 1 active + 3 canceled. Mantém ativa a 7023e40f… (a mais recente, 17:48:35Z)
// porque o app grava o correlationCode numa única chave por e-mail no AsyncStorage
// (saveSoloCorrelationCode, lib/coupleData.js) e SOBRESCREVE a cada clique em
// "Assinar" — o aparelho do Carlos só sabe consultar a última. É a mesma regra que
// o backend corrigido usa ("pendência mais recente do e-mail"), então banco e código
// concordam.
//
// Também marca o webhook original como processado: sem isso, uma reentrega da
// Hotmart depois do deploy criaria uma SEGUNDA assinatura ativa pra mesma compra.
//
// Idempotente — rodar duas vezes não duplica auditoria nem muda mais nada.
//
// COMO RODAR:
//   scp "server-patches/corrigir-estado-carlos.js" servidor:/root/forja-backend/
//   ssh servidor "cd /root/forja-backend; node corrigir-estado-carlos.js"

const Database = require("better-sqlite3");

const EMAIL = "carlos.alberto.sanches09@gmail.com";
const MANTER_ATIVA = "7023e40f3cde4ca876d0fe9cb4026784";
const EVENT_ID = "4b279cf7-07ae-41a5-a035-f0f7268ab095";
const SUBSCRIBER = "6QAE1D6J";
const FIM_PERIODO = "2026-08-02T12:00:00.000Z";

const db = new Database("./data/forja.sqlite");
const agora = new Date().toISOString();

const linhas = db
  .prepare("SELECT correlation_code, status FROM subscriptions WHERE LOWER(TRIM(customer_email)) = ?")
  .all(EMAIL);

console.log(`assinaturas do Carlos: ${linhas.length}`);
console.log(`ativas antes: ${linhas.filter((l) => l.status === "active").length}`);

const extras = linhas.filter((l) => l.correlation_code !== MANTER_ATIVA && l.status === "active");

if (extras.length === 0) {
  console.log("nada a corrigir — já está com no máximo 1 ativa.");
} else {
  const fecha = db.prepare(
    `UPDATE subscriptions
        SET status = 'canceled',
            provider_subscription_id = NULL,
            reminder_sent_at = COALESCE(reminder_sent_at, ?),
            updated_at = ?
      WHERE correlation_code = ?`
  );

  // provider_subscription_id volta a NULL nas duplicadas de propósito: é ele que
  // faz um estorno futuro achar a linha certa, e ter o mesmo valor em 4 linhas é
  // justamente o que quebraria a revogação.
  const audita = db.prepare(
    `INSERT INTO subscription_events (correlation_code, from_status, to_status, raw_event, raw_payload, created_at)
     SELECT ?, 'active', 'canceled', ?, NULL, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM subscription_events
         WHERE correlation_code = ? AND raw_event LIKE 'ADMIN_OVERRIDE(desfaz ativacao multipla%'
      )`
  );

  const motivo = `ADMIN_OVERRIDE(desfaz ativacao multipla — 1 pagamento HP1260209174 gerou 4 ativas; compra real permanece em ${MANTER_ATIVA})`;

  db.transaction(() => {
    for (const { correlation_code } of extras) {
      fecha.run(agora, agora, correlation_code);
      audita.run(correlation_code, motivo, agora, correlation_code);
      console.log(`  fechada: ${correlation_code}`);
    }

    // Garante que a que fica está completa (o liberar-carlos.js não gravou currency).
    db.prepare(
      `UPDATE subscriptions
          SET provider_subscription_id = ?, current_period_end = ?, currency = COALESCE(NULLIF(currency,''),'USD'), updated_at = ?
        WHERE correlation_code = ?`
    ).run(SUBSCRIBER, FIM_PERIODO, agora, MANTER_ATIVA);

    db.prepare("INSERT OR IGNORE INTO webhook_events_processed (event_id, processed_at) VALUES (?, ?)").run(EVENT_ID, agora);
  })();
}

console.log("\n=== ESTADO FINAL ===");
for (const r of db
  .prepare(
    "SELECT correlation_code, status, amount_cents, provider_subscription_id, current_period_end FROM subscriptions WHERE LOWER(TRIM(customer_email)) = ? ORDER BY created_at DESC"
  )
  .all(EMAIL)) {
  console.log(`  ${r.status.padEnd(9)} ${r.correlation_code} | subId: ${r.provider_subscription_id || "-"} | fim: ${r.current_period_end || "-"}`);
}

const receita = db.prepare("SELECT COALESCE(SUM(amount_cents),0) s FROM subscriptions WHERE status='active'").get().s;
const processados = db.prepare("SELECT COUNT(*) n FROM webhook_events_processed").get().n;
console.log(`\nreceita somada das ativas: ${receita} centavos`);
console.log(`webhooks marcados como processados: ${processados}`);

db.close();
