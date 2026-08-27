// Contratos HTTP da fundação da Comunidade. Este arquivo usa o servidor e o
// SQLite reais; portanto também trava o mount das rotas, a autenticação e as
// migrações — não apenas funções isoladas.
//
// Rodar no backend completo:
//   node --experimental-test-module-mocks --test test/socialLifecycle.http.test.js
const { mock } = require("node:test");

mock.module("jose", {
  namedExports: {
    createRemoteJWKSet: () => () => {},
    jwtVerify: async (token) => {
      if (typeof token !== "string" || !token.startsWith("user:")) {
        throw new Error("token de teste inválido");
      }
      const userId = token.slice("user:".length);
      return {
        payload: {
          sub: userId,
          email: `${userId}@example.com`,
          email_verified: true,
          user_metadata: { email_verified: true },
        },
      };
    },
  },
});

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-social-lifecycle-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.HOTMART_HOTTOK = "test-hottok-secret";
process.env.HOTMART_OFFER_CODE = "test-offer-code";
process.env.ALLOWED_ORIGIN = "http://localhost";
process.env.ADMIN_TOKEN = "admin-token-social-lifecycle";

const test = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");
const { app } = require("../src/http/server");
const { db } = require("../src/infrastructure/db");

function auth(userId) {
  return { Authorization: `Bearer user:${userId}` };
}

function profile(userId) {
  return supertest(app)
    .put("/api/social/profile")
    .set(auth(userId))
    .send({ displayName: userId, username: userId });
}

async function post(userId, title = "Título") {
  const response = await supertest(app)
    .post("/api/social/posts")
    .set(auth(userId))
    .send({ title, body: "Corpo" });
  assert.equal(response.status, 201);
  return response.body.id;
}

test.after(() => {
  if (db.open) db.close();
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

test("DELETE /comments/:id permite apagar só o próprio comentário", async () => {
  await profile("autor").expect(200);
  await profile("comentador").expect(200);
  await profile("terceiro").expect(200);
  const postId = await post("autor");
  await supertest(app).post("/api/social/follow/autor").set(auth("comentador")).expect(200);

  const created = await supertest(app)
    .post(`/api/social/posts/${postId}/comments`)
    .set(auth("comentador"))
    .send({ body: "meu comentário" })
    .expect(201);

  await supertest(app).delete(`/api/social/comments/${created.body.id}`).set(auth("terceiro")).expect(403);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_comments WHERE id = ?").get(created.body.id).value, 1);

  await supertest(app).delete(`/api/social/comments/${created.body.id}`).set(auth("comentador")).expect(204);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_comments WHERE id = ?").get(created.body.id).value, 0);
  await supertest(app).delete(`/api/social/comments/${created.body.id}`).set(auth("comentador")).expect(404);
});

test("DELETE /profile apaga a presença social sem revogar a conta", async () => {
  await profile("perfil_apaga").expect(200);
  const postId = await post("perfil_apaga");
  db.prepare("INSERT INTO social_likes (post_id, user_id, created_at) VALUES (?, ?, ?)").run(
    postId,
    "perfil_apaga",
    new Date().toISOString()
  );

  const deleted = await supertest(app).delete("/api/social/profile").set(auth("perfil_apaga")).expect(200);
  assert.equal(deleted.body.ok, true);
  assert.equal(deleted.body.deleted.profiles, 1);
  assert.equal(deleted.body.deleted.posts, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_profiles WHERE user_id = ?").get("perfil_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_posts WHERE user_id = ?").get("perfil_apaga").value, 0);

  // O mesmo JWT segue válido: só o perfil da Comunidade foi removido.
  const me = await supertest(app).get("/api/social/profile/me").set(auth("perfil_apaga")).expect(200);
  assert.equal(me.body.profile, null);
});

test("DELETE /subscription/account limpa UGC, grava lápide e é idempotente", async () => {
  await profile("conta_apaga").expect(200);
  await profile("conta_fica").expect(200);
  const ownPostId = await post("conta_apaga", "Vai sair");
  const otherPostId = await post("conta_fica", "Fica");
  await supertest(app).post("/api/social/follow/conta_fica").set(auth("conta_apaga")).expect(200);
  await supertest(app)
    .post(`/api/social/posts/${otherPostId}/comments`)
    .set(auth("conta_apaga"))
    .send({ body: "também sai" })
    .expect(201);
  db.prepare("INSERT INTO social_likes (post_id, user_id, created_at) VALUES (?, ?, ?)").run(
    ownPostId,
    "conta_fica",
    new Date().toISOString()
  );
  db.prepare(`
    INSERT INTO voice_usage_daily (user_id, day, requests, characters, updated_at)
    VALUES (?, ?, 1, 120, ?)
  `).run("conta_apaga", "2026-08-26", new Date().toISOString());
  db.prepare(`
    INSERT INTO cosmic_memory_preferences (user_id, enabled, consent_version, consented_at, updated_at)
    VALUES (?, 1, 'teste-v1', ?, ?)
  `).run("conta_apaga", new Date().toISOString(), new Date().toISOString());
  db.prepare(`
    INSERT INTO cosmic_memories
      (user_id, kind, topic, content, source, fingerprint, occurrence_count, created_at, updated_at)
    VALUES (?, 'orbi_statement', 'self', 'Quero lembrar desta mudança.', 'orbi_chat', 'fingerprint-teste', 1, ?, ?)
  `).run("conta_apaga", new Date().toISOString(), new Date().toISOString());

  const first = await supertest(app)
    .delete("/api/subscription/account")
    .set(auth("conta_apaga"))
    .expect(200);
  assert.equal(first.body.ok, true);
  assert.equal(first.body.social.profiles, 1);
  assert.equal(first.body.social.posts, 1);
  assert.equal(first.body.social.comments, 1);
  assert.equal(first.body.social.likes, 1);
  assert.equal(first.body.clearedVoiceUsage, 1);
  assert.deepEqual(first.body.clearedCosmicMemory, { memories: 1, preferences: 1 });
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_profiles WHERE user_id = ?").get("conta_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_posts WHERE user_id = ?").get("conta_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_comments WHERE user_id = ?").get("conta_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM revoked_accounts WHERE user_id = ?").get("conta_apaga").value, 1);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM voice_usage_daily WHERE user_id = ?").get("conta_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM cosmic_memories WHERE user_id = ?").get("conta_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM cosmic_memory_preferences WHERE user_id = ?").get("conta_apaga").value, 0);
  assert.equal(db.prepare("SELECT COUNT(*) AS value FROM social_posts WHERE id = ?").get(otherPostId).value, 1);

  // A rota de exclusão é a única que aceita repetir o token revogado; todas as
  // demais fecham imediatamente com account_deleted.
  const retry = await supertest(app)
    .delete("/api/subscription/account")
    .set(auth("conta_apaga"))
    .expect(200);
  assert.equal(retry.body.social.profiles, 0);
  assert.equal(retry.body.clearedVoiceUsage, 0);
  assert.deepEqual(retry.body.clearedCosmicMemory, { memories: 0, preferences: 0 });
  const revoked = await supertest(app).get("/api/social/profile/me").set(auth("conta_apaga")).expect(401);
  assert.equal(revoked.body.code, "account_deleted");
});
