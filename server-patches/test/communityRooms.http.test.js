// Contrato HTTP das salas. Executa contra o backend completo na VPS/cópia de
// teste, onde db.js, migrations runner, better-sqlite3 e supertest existem.
//
//   node --experimental-test-module-mocks --test test/communityRooms.http.test.js
const { mock } = require("node:test");

mock.module("jose", {
  namedExports: {
    createRemoteJWKSet: () => () => {},
    jwtVerify: async (token) => {
      if (typeof token !== "string" || !token.startsWith("user:")) throw new Error("token inválido");
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
const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-community-rooms-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.HOTMART_HOTTOK = "test-hottok-secret";
process.env.HOTMART_OFFER_CODE = "test-offer-code";
process.env.ALLOWED_ORIGIN = "http://localhost";
process.env.ADMIN_TOKEN = "admin-token-community-rooms";

const test = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");
const { app } = require("../src/http/server");
const { db } = require("../src/infrastructure/db");
const { COMMUNITY_GUIDELINES_VERSION } = require("../src/application/communityRooms");

function auth(userId) {
  return { Authorization: `Bearer user:${userId}` };
}

function createProfile(userId) {
  return supertest(app)
    .put("/api/social/profile")
    .set(auth(userId))
    .send({ displayName: userId, username: userId });
}

function setSign(userId, zodiacSign, showZodiacSign = true) {
  return supertest(app)
    .put("/api/social/profile/community")
    .set(auth(userId))
    .send({ zodiacSign, showZodiacSign });
}

function acceptGuidelines(userId, body = {}) {
  return supertest(app)
    .post("/api/social/community/guidelines")
    .set(auth(userId))
    .send(body);
}

function communityPost(userId, payload) {
  return supertest(app)
    .post("/api/social/community/posts")
    .set(auth(userId))
    .send({ title: "Uma conversa", body: "Texto da conversa", ...payload });
}

test.after(() => {
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

test("signo só sai com consentimento; desligar apaga e dado natal é recusado", async () => {
  await createProfile("priv_alice").expect(200);
  await createProfile("priv_bob").expect(200);

  const enabled = await setSign("priv_alice", "aries", true).expect(200);
  assert.equal(enabled.body.profile.zodiac_sign, "aries");
  assert.equal(enabled.body.profile.show_zodiac_sign, 1);

  const publicView = await supertest(app)
    .get("/api/social/users/priv_alice")
    .set(auth("priv_bob"))
    .expect(200);
  assert.equal(publicView.body.profile.zodiac_sign, "aries");
  assert.equal(Object.hasOwn(publicView.body.profile, "show_zodiac_sign"), false);
  assert.equal(Object.hasOwn(publicView.body.profile, "community_guidelines_version"), false);

  const forbidden = await supertest(app)
    .put("/api/social/profile/community")
    .set(auth("priv_alice"))
    .send({ zodiacSign: "aries", showZodiacSign: true, birthDate: "1990-01-01" })
    .expect(400);
  assert.equal(forbidden.body.code, "invalid_community_profile_payload");

  const disabled = await setSign("priv_alice", "aries", false).expect(200);
  assert.equal(disabled.body.profile.zodiac_sign, null);
  assert.equal(disabled.body.profile.show_zodiac_sign, 0);
  assert.equal(
    db.prepare("SELECT zodiac_sign FROM social_profiles WHERE user_id = 'priv_alice'").get().zodiac_sign,
    null,
    "ocultar precisa apagar o signo, não só esconder"
  );
  const hiddenView = await supertest(app)
    .get("/api/social/users/priv_alice")
    .set(auth("priv_bob"))
    .expect(200);
  assert.equal(hiddenView.body.profile.zodiac_sign, null);
});

test("aceite grava a versão vigente do servidor, nunca a versão pedida pelo cliente", async () => {
  await createProfile("guide_user").expect(200);
  const accepted = await acceptGuidelines("guide_user", { version: "inventada-pelo-cliente" }).expect(200);
  assert.equal(accepted.body.version, COMMUNITY_GUIDELINES_VERSION);
  const row = db
    .prepare(
      "SELECT community_guidelines_version, community_guidelines_accepted_at FROM social_profiles WHERE user_id = 'guide_user'"
    )
    .get();
  assert.equal(row.community_guidelines_version, COMMUNITY_GUIDELINES_VERSION);
  assert.ok(row.community_guidelines_accepted_at);
});

test("post legado nunca entra nas salas; plaza dispensa signo e pagina por cursor", async () => {
  await createProfile("legacy_room").expect(200);
  await acceptGuidelines("legacy_room").expect(200);

  const legacy = await supertest(app)
    .post("/api/social/posts")
    .set(auth("legacy_room"))
    .send({ title: "Antigo", body: "Somente seguidores" })
    .expect(201);
  assert.equal(
    db.prepare("SELECT visibility FROM social_posts WHERE id = ?").get(legacy.body.id).visibility,
    "followers"
  );

  const createdIds = [];
  for (let index = 0; index < 3; index += 1) {
    const created = await communityPost("legacy_room", {
      roomId: "plaza",
      title: `Praça ${index}`,
    }).expect(201);
    createdIds.push(created.body.id);
    assert.equal(created.body.signA, null);
  }

  const first = await supertest(app)
    .get("/api/social/community/plaza?limit=2")
    .set(auth("legacy_room"))
    .expect(200);
  assert.equal(first.body.posts.length, 2);
  assert.equal(first.body.meta.has_next, true);
  assert.equal(first.body.posts.some((post) => post.id === legacy.body.id), false);
  assert.ok(first.body.posts.every((post) => post.visibility === "community"));

  const second = await supertest(app)
    .get(`/api/social/community/plaza?limit=2&before=${first.body.meta.next_cursor}`)
    .set(auth("legacy_room"))
    .expect(200);
  assert.ok(second.body.posts.some((post) => post.id === createdIds[0]));

  const feed = await supertest(app).get("/api/social/feed").set(auth("legacy_room")).expect(200);
  assert.ok(feed.body.posts.some((post) => post.id === legacy.body.id));
  assert.equal(feed.body.posts.some((post) => createdIds.includes(post.id)), false);
});

test("salas relacionais exigem signo público e o servidor recusa classificação falsa", async () => {
  await createProfile("pair_user").expect(200);
  await acceptGuidelines("pair_user").expect(200);

  const privateAttempt = await communityPost("pair_user", {
    roomId: "bridges",
    targetSign: "leo",
  }).expect(403);
  assert.equal(privateAttempt.body.code, "public_zodiac_sign_required");

  await setSign("pair_user", "aries", true).expect(200);
  const wrongRoom = await communityPost("pair_user", {
    roomId: "sparks",
    targetSign: "leo",
  }).expect(400);
  assert.equal(wrongRoom.body.code, "room_mismatch");
  assert.equal(wrongRoom.body.expectedRoomId, "bridges");

  const forged = await communityPost("pair_user", {
    roomId: "bridges",
    targetSign: "leo",
    relation: "oposicao",
  }).expect(400);
  assert.equal(forged.body.code, "invalid_community_post_payload");

  const created = await communityPost("pair_user", {
    roomId: "bridges",
    targetSign: "leo",
  }).expect(201);
  assert.deepEqual(
    {
      roomId: created.body.roomId,
      signA: created.body.signA,
      signB: created.body.signB,
      relation: created.body.relation,
    },
    { roomId: "bridges", signA: "aries", signB: "leo", relation: "trigono" }
  );
  const row = db
    .prepare("SELECT visibility, room_id, sign_a, sign_b, relation FROM social_posts WHERE id = ?")
    .get(created.body.id);
  assert.deepEqual(
    { ...row },
    { visibility: "community", room_id: "bridges", sign_a: "aries", sign_b: "leo", relation: "trigono" }
  );

  await setSign("pair_user", "aries", false).expect(200);
  const scrubbed = db
    .prepare("SELECT room_id, sign_a, sign_b, relation FROM social_posts WHERE id = ?")
    .get(created.body.id);
  assert.deepEqual(
    { ...scrubbed },
    { room_id: "plaza", sign_a: null, sign_b: null, relation: null },
    "revogar consentimento não pode deixar o signo exposto no post antigo"
  );
});

test("post community aceita like sem follow; comentário exige aceite vigente", async () => {
  await createProfile("inter_author").expect(200);
  await createProfile("inter_reader").expect(200);
  await acceptGuidelines("inter_author").expect(200);
  const created = await communityPost("inter_author", { roomId: "plaza" }).expect(201);

  await supertest(app)
    .post(`/api/social/posts/${created.body.id}/like`)
    .set(auth("inter_reader"))
    .expect(200);
  const refused = await supertest(app)
    .post(`/api/social/posts/${created.body.id}/comments`)
    .set(auth("inter_reader"))
    .send({ body: "Olá" })
    .expect(403);
  assert.equal(refused.body.code, "community_guidelines_required");

  await acceptGuidelines("inter_reader").expect(200);
  await supertest(app)
    .post(`/api/social/posts/${created.body.id}/comments`)
    .set(auth("inter_reader"))
    .send({ body: "Olá" })
    .expect(201);
});

test("bloqueio remove posts community nos dois sentidos", async () => {
  await createProfile("block_one").expect(200);
  await createProfile("block_two").expect(200);
  await acceptGuidelines("block_one").expect(200);
  await acceptGuidelines("block_two").expect(200);
  const onePost = await communityPost("block_one", { roomId: "plaza", title: "Um" }).expect(201);
  const twoPost = await communityPost("block_two", { roomId: "plaza", title: "Dois" }).expect(201);

  const before = await supertest(app).get("/api/social/community/plaza").set(auth("block_one")).expect(200);
  assert.ok(before.body.posts.some((post) => post.id === twoPost.body.id));

  await supertest(app)
    .post("/api/moderation/block")
    .set(auth("block_one"))
    .send({ blockedUserId: "block_two" })
    .expect(200);

  const fromBlocker = await supertest(app).get("/api/social/community/plaza").set(auth("block_one")).expect(200);
  assert.equal(fromBlocker.body.posts.some((post) => post.id === twoPost.body.id), false);
  const fromBlocked = await supertest(app).get("/api/social/community/plaza").set(auth("block_two")).expect(200);
  assert.equal(fromBlocked.body.posts.some((post) => post.id === onePost.body.id), false);

  await supertest(app)
    .post(`/api/social/posts/${twoPost.body.id}/like`)
    .set(auth("block_one"))
    .expect(403);
});
