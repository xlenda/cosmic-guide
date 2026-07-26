// Libera o acesso do Carlos Alberto Sanches, cujo pagamento na Hotmart foi aprovado
// (transacao HP1260209174, 26/07/2026 14:28) mas cujo webhook PURCHASE_APPROVED o
// backend rejeitou — o parser lia o codigo de correlacao de data.purchase.origin.xcod,
// campo que nao existe no payload real da Hotmart (ver subscription_events id=9).
//
// Ele iniciou o checkout 4 vezes tentando destravar, entao existem 4 registros pending
// com o e-mail dele. O app guarda UM correlationCode no dispositivo (AsyncStorage) e
// consulta /api/subscription/{code} — como nao da pra saber qual dos 4 o celular dele
// guardou, ativamos todos. Sao todos checkouts do mesmo comprador para a mesma oferta,
// entao nao ha risco de liberar acesso para outra pessoa.
//
// COMO RODAR (na VPS):
//   scp "server-patches/liberar-carlos.js" servidor:/root/forja-backend/
//   ssh servidor "cd /root/forja-backend && node liberar-carlos.js"
//
// Faca backup antes se ainda nao houver:
//   ssh servidor "cd /root/forja-backend && cp data/forja.sqlite data/backups/forja-pre-unlock-$(date +%Y%m%d-%H%M).sqlite"

const Database = require("better-sqlite3");

const EMAIL = "carlos.alberto.sanches09@gmail.com";
const SUBSCRIBER_CODE = "6QAE1D6J"; // data.subscription.subscriber.code do webhook real
const TRANSACTION = "HP1260209174"; // data.purchase.transaction do webhook real
const NEXT_CHARGE_MS = 1785672000000; // data.purchase.date_next_charge -> 02/08/2026 09:00 BRT

const db = new Database("./data/forja.sqlite");

const agora = new Date().toISOString();
const fimDoPeriodo = new Date(NEXT_CHARGE_MS).toISOString();

const pendentes = db
  .prepare("SELECT correlation_code FROM subscriptions WHERE customer_email = ? AND status = 'pending'")
  .all(EMAIL);

console.log(`checkouts pendentes de ${EMAIL}: ${pendentes.length}`);
if (pendentes.length === 0) {
  console.log("nada a fazer — nenhum pendente encontrado.");
  db.close();
  process.exit(0);
}

const atualiza = db.prepare(
  `UPDATE subscriptions
      SET status = 'active',
          provider_subscription_id = ?,
          current_period_end = ?,
          updated_at = ?
    WHERE correlation_code = ?`
);

// Registra a ativacao manual em subscription_events para a trilha de auditoria nao ter
// buraco: sem isso, a assinatura apareceria ativa sem nenhum evento que explicasse como.
const registra = db.prepare(
  `INSERT INTO subscription_events (correlation_code, from_status, to_status, raw_event, raw_payload, created_at)
   VALUES (?, ?, ?, ?, ?, ?)`
);

db.transaction(() => {
  for (const { correlation_code } of pendentes) {
    atualiza.run(SUBSCRIBER_CODE, fimDoPeriodo, agora, correlation_code);
    registra.run(
      correlation_code,
      "pending",
      "active",
      `ATIVACAO_MANUAL(webhook PURCHASE_APPROVED rejeitado por falta de origin.xcod; transacao=${TRANSACTION})`,
      null,
      agora
    );
    console.log(`  ativado: ${correlation_code}`);
  }
})();

console.log("\nestado final:");
for (const r of db
  .prepare("SELECT correlation_code, status, current_period_end FROM subscriptions WHERE customer_email = ? ORDER BY created_at DESC")
  .all(EMAIL)) {
  console.log(" ", JSON.stringify(r));
}

db.close();
