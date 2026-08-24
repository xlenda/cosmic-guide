const { db } = require("./db");

class PushSubscriptionRepository {
  save({ endpoint, p256dh, auth, signName, signIcon }) {
    db.prepare(`
      INSERT INTO push_subscriptions (endpoint, p256dh, auth, sign_name, sign_icon, created_at)
      VALUES (@endpoint, @p256dh, @auth, @signName, @signIcon, @now)
      ON CONFLICT(endpoint) DO UPDATE SET
        p256dh = excluded.p256dh,
        auth = excluded.auth,
        sign_name = excluded.sign_name,
        sign_icon = excluded.sign_icon
    `).run({
      endpoint,
      p256dh,
      auth,
      signName: signName || null,
      signIcon: signIcon || null,
      now: new Date().toISOString(),
    });
  }

  remove(endpoint) {
    db.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").run(endpoint);
  }

  findByEndpoint(endpoint) {
    return db.prepare("SELECT * FROM push_subscriptions WHERE endpoint = ?").get(endpoint) || null;
  }

  all() {
    return db.prepare("SELECT * FROM push_subscriptions").all();
  }

  updateStreak({ endpoint, lastActiveDate, currentStreak }) {
    db.prepare(
      "UPDATE push_subscriptions SET last_active_date = ?, current_streak = ? WHERE endpoint = ?"
    ).run(lastActiveDate, currentStreak, endpoint);
  }

  updateDiaryDate({ endpoint, lastDiaryDate }) {
    db.prepare(
      "UPDATE push_subscriptions SET last_diary_date = ? WHERE endpoint = ?"
    ).run(lastDiaryDate, endpoint);
  }
}

module.exports = { PushSubscriptionRepository };
