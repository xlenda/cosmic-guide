// Convites de casal (tabela couple_invites, migração 005) — o código é
// aleatório e gerado aqui no servidor (nunca aceito de fora), mesmo espírito
// do correlationCode de SubscriptionRepository.
const crypto = require("crypto");
const { db } = require("./db");

class CoupleInviteRepository {
  create({ inviterEndpoint, coupleName }) {
    const code = crypto.randomBytes(8).toString("hex");
    db.prepare(
      `INSERT INTO couple_invites (code, inviter_endpoint, couple_name, created_at)
       VALUES (@code, @inviterEndpoint, @coupleName, @now)`
    ).run({ code, inviterEndpoint, coupleName: coupleName || null, now: new Date().toISOString() });
    return { code };
  }

  findByCode(code) {
    return db.prepare("SELECT * FROM couple_invites WHERE code = ?").get(code);
  }

  // Marca como aceito SÓ se ainda não foi (retorna se esta chamada foi a
  // primeira) — atômico no SQL, pra dois aceites simultâneos do mesmo código
  // nunca dispararem duas notificações.
  markAccepted(code) {
    const result = db
      .prepare("UPDATE couple_invites SET accepted_at = ? WHERE code = ? AND accepted_at IS NULL")
      .run(new Date().toISOString(), code);
    return result.changes > 0;
  }
}

module.exports = { CoupleInviteRepository };
