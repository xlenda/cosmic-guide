// Quem quer o lembrete diário do check-in (tabela push_daily_reminder, migração
// 014). Marcação por INSCRIÇÃO de push, não por conta: o check-in é local do
// aparelho (lib/checkin.js no app), então o sujeito certo aqui é o mesmo
// endpoint que já identifica a inscrição em push_subscriptions.
//
// Este repositório é NOVO de propósito, em vez de dois métodos dentro de
// PushSubscriptionRepository.js — aquele arquivo não existe em server-patches/
// (ver o comentário longo da migração 014). Tocar só em arquivo que eu enxergo
// por inteiro é o que impede o deploy de subir uma cópia velha por cima da
// versão viva.
const { db } = require("./db");
const { normalizarIdioma } = require("./checkinReminderContent");

class DailyReminderRepository {
  // Ligar duas vezes (pessoa reabre o app, o toggle reenvia) não duplica nada e
  // não reseta created_at — só atualiza o idioma, que é a única coisa que muda
  // de verdade quando alguém troca a língua do app.
  enable({ endpoint, lang }) {
    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO push_daily_reminder (endpoint, lang, created_at, updated_at)
       VALUES (@endpoint, @lang, @now, @now)
       ON CONFLICT(endpoint) DO UPDATE SET
         lang = excluded.lang,
         updated_at = excluded.updated_at`
    ).run({ endpoint, lang: normalizarIdioma(lang), now });
  }

  // Desligar APAGA a linha em vez de guardar um booleano falso: "não quer ser
  // lembrada" é a ausência de marcação, e sem linha morta o cron não precisa
  // filtrar nada. Desligar quem nunca ligou é no-op silencioso.
  disable(endpoint) {
    db.prepare("DELETE FROM push_daily_reminder WHERE endpoint = ?").run(endpoint);
  }

  findByEndpoint(endpoint) {
    return db.prepare("SELECT * FROM push_daily_reminder WHERE endpoint = ?").get(endpoint) || null;
  }

  // O que o cron precisa, em UMA consulta: marcação + chaves de envio. O JOIN
  // (em vez de dois SELECTs) já descarta quem foi marcado mas cuja inscrição
  // sumiu de push_subscriptions — nunca tentamos enviar pra uma inscrição que
  // não existe mais.
  allWithSubscription() {
    return db
      .prepare(
        `SELECT r.endpoint AS endpoint,
                r.lang     AS lang,
                s.p256dh   AS p256dh,
                s.auth     AS auth
           FROM push_daily_reminder r
           JOIN push_subscriptions s ON s.endpoint = r.endpoint
          ORDER BY r.endpoint`
      )
      .all();
  }

  // Faxina das marcações cujo endpoint já saiu de push_subscriptions (a pessoa
  // desativou as notificações, limpou o navegador, ou o cron removeu a inscrição
  // expirada num 404/410). O JOIN acima já as ignora, então elas nunca causariam
  // envio errado — mas sem esta limpeza a tabela cresceria pra sempre com linhas
  // que não representam mais ninguém. Devolve quantas saíram, pro log dizer.
  removeOrphans() {
    return db
      .prepare(
        `DELETE FROM push_daily_reminder
          WHERE endpoint NOT IN (SELECT endpoint FROM push_subscriptions)`
      )
      .run().changes;
  }
}

module.exports = { DailyReminderRepository };
