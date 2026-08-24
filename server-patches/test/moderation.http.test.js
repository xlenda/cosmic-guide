// Teste HTTP de ponta a ponta da moderação (denúncia + bloqueio) contra o
// Express e o SQLite reais, no mesmo padrão de socialRoutes.http.test.js.
//
// O que está sendo travado aqui são as três exigências da política de Conteúdo
// Gerado pelo Usuário do Google Play, e cada uma tem um jeito conhecido de
// virar teatro:
//   1) denunciar — precisa GUARDAR o conteúdo, senão a fila é inacionável;
//   2) bloquear  — precisa filtrar no SERVIDOR, senão é só esconder na tela;
//   3) moderação — a denúncia precisa ter uma AÇÃO que resolve de verdade.
// E o teste bate no app REAL (require("../src/http/server")), então ele falha
// se a linha de mount de /api/moderation não estiver lá — a falha que já
// aconteceu neste repositório com /api/track (03/08).
//
// Como rodar (no servidor, dentro de /root/forja-backend):
//   node --experimental-test-module-mocks --test test/moderation.http.test.js
const { mock } = require("node:test");

mock.module("jose", {
  namedExports: {
    createRemoteJWKSet: () => () => {},
    jwtVerify: async (token) => {
      if (typeof token !== "string" || !token.startsWith("user:")) {
        throw new Error("token de teste inválido");
      }
      const userId = token.slice("user:".length);
      return { payload: { sub: userId, email: `${userId}@example.com` } };
    },
  },
});

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const TEST_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-moderation-"));
process.env.DATA_DIR = TEST_DATA_DIR;
process.env.HOTMART_HOTTOK = "test-hottok-secret";
process.env.HOTMART_OFFER_CODE = "test-offer-code";
process.env.ALLOWED_ORIGIN = "http://localhost";
process.env.ADMIN_TOKEN = "admin-token-de-teste-1234";

const test = require("node:test");
const assert = require("node:assert/strict");
const supertest = require("supertest");
const { app } = require("../src/http/server");
const { db } = require("../src/infrastructure/db");

function auth(userId) {
  return { Authorization: `Bearer user:${userId}` };
}

function perfil(userId, username) {
  return supertest(app).put("/api/social/profile").set(auth(userId)).send({ displayName: username, username });
}

async function postar(userId, title, body) {
  const res = await supertest(app).post("/api/social/posts").set(auth(userId)).send({ title, body });
  assert.equal(res.status, 201);
  return res.body.id;
}

test.after(() => {
  try {
    db.close();
  } catch {}
  fs.rmSync(TEST_DATA_DIR, { recursive: true, force: true });
});

test("denúncia de post guarda o CONTEÚDO denunciado (senão a fila é inacionável)", async () => {
  await perfil("m1", "denunciante");
  await perfil("m2", "denunciado");
  const postId = await postar("m2", "Título ofensivo", "Corpo que alguém denunciou");

  const res = await supertest(app)
    .post("/api/moderation/report")
    .set(auth("m1"))
    .send({ kind: "post", targetId: String(postId), reason: "ofensivo" });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });

  const linha = db.prepare("SELECT * FROM moderation_reports WHERE kind = 'post' AND target_id = ?").get(String(postId));
  assert.ok(linha, "a denúncia tem que existir na fila");
  assert.equal(linha.status, "open");
  assert.equal(linha.target_user_id, "m2", "precisa saber QUEM escreveu pra ação de moderação alcançar alguém");
  assert.equal(linha.reporter_id, "m1");
  assert.match(linha.content, /Corpo que alguém denunciou/);
});

test("denunciar IA não exige login; denunciar uma PESSOA exige", async () => {
  const anon = await supertest(app).post("/api/moderation/report").send({ kind: "ai", reason: "ofensivo" });
  assert.equal(anon.status, 200);

  const semToken = await supertest(app).post("/api/moderation/report").send({ kind: "user", targetId: "m2", reason: "spam" });
  assert.equal(semToken.status, 401);
});

test("ID de pessoa é canonicalizado antes da denúncia e da suspensão", async () => {
  await perfil("space-reporter", "space_reporter");
  await perfil("space-victim", "space_victim");
  await postar("space-victim", "Post da pessoa", "conteúdo social");

  await supertest(app)
    .post("/api/moderation/report")
    .set(auth("space-reporter"))
    .send({ kind: "user", targetId: " \u0000 space-victim\t ", reason: "assédio" })
    .expect(200);

  const report = db
    .prepare(
      "SELECT id, target_id, target_user_id FROM moderation_reports WHERE reporter_id = ? ORDER BY id DESC"
    )
    .get("space-reporter");
  assert.equal(report.target_id, "space-victim");
  assert.equal(report.target_user_id, "space-victim");

  const suspended = await supertest(app)
    .post(`/api/admin/reports/${report.id}`)
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .send({ action: "suspend", reason: "risco confirmado" })
    .expect(200);

  assert.equal(suspended.body.suspendedUserId, "space-victim");
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_profiles WHERE user_id = ?").get("space-victim").c, 0);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_posts WHERE user_id = ?").get("space-victim").c, 0);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_suspensions WHERE user_id = ?").get("space-victim").c, 1);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_suspensions WHERE user_id = ?").get("  space-victim  ").c, 0);

  const refused = await supertest(app).get("/api/social/profile/me").set(auth("space-victim")).expect(403);
  assert.equal(refused.body.code, "community_suspended");
});

test("kind desconhecido e reason vazio são recusados", async () => {
  const k = await supertest(app).post("/api/moderation/report").send({ kind: "qualquer", reason: "x" });
  assert.equal(k.status, 400);
  const r = await supertest(app).post("/api/moderation/report").send({ kind: "ai", reason: "   " });
  assert.equal(r.status, 400);
});

test("bloquear tira os posts do feed NO SERVIDOR, nos dois sentidos", async () => {
  await perfil("b1", "bloqueador");
  await perfil("b2", "bloqueado");
  await supertest(app).post("/api/social/follow/b2").set(auth("b1")).expect(200);
  await supertest(app).post("/api/social/follow/b1").set(auth("b2")).expect(200);
  await postar("b2", "Post do bloqueado", "corpo");
  await postar("b1", "Post do bloqueador", "corpo");

  const antes = await supertest(app).get("/api/social/feed").set(auth("b1"));
  assert.ok(antes.body.posts.some((p) => p.user_id === "b2"), "antes do bloqueio o post aparece");

  const bloqueio = await supertest(app).post("/api/moderation/block").set(auth("b1")).send({ blockedUserId: "b2" });
  assert.equal(bloqueio.status, 200);

  const lista = await supertest(app).get("/api/moderation/blocks").set(auth("b1"));
  assert.equal(lista.status, 200);
  assert.deepEqual(lista.body.blocked.map((item) => item.user_id), ["b2"]);

  const depois = await supertest(app).get("/api/social/feed").set(auth("b1"));
  assert.equal(depois.body.posts.filter((p) => p.user_id === "b2").length, 0, "quem bloqueia deixa de ver");

  // O corte do "seguir" nos dois sentidos é o OUTRO mecanismo do bloqueio (o
  // filtro do feed é a reserva). Sem esta linha, apagar a limpeza de follow
  // passava verde — as asserções acima ficam de pé só com o filtro.
  const vinculos = db
    .prepare(
      "SELECT COUNT(*) c FROM social_follows WHERE (follower_id = 'b1' AND followee_id = 'b2') OR (follower_id = 'b2' AND followee_id = 'b1')"
    )
    .get().c;
  assert.equal(vinculos, 0, "bloquear tem que cortar o 'seguir' dos dois lados");

  const doOutroLado = await supertest(app).get("/api/social/feed").set(auth("b2"));
  assert.equal(doOutroLado.body.posts.filter((p) => p.user_id === "b1").length, 0, "quem foi bloqueado também deixa de ver");

  // Seguir de novo não pode devolver o feed que o bloqueio cortou.
  const reFollow = await supertest(app).post("/api/social/follow/b1").set(auth("b2"));
  assert.equal(reFollow.status, 403);

  // E o perfil some da busca e do acesso direto.
  const busca = await supertest(app).get("/api/social/search?username=bloq").set(auth("b1"));
  assert.equal(busca.body.profiles.filter((p) => p.user_id === "b2").length, 0);
  const direto = await supertest(app).get("/api/social/users/b2").set(auth("b1"));
  assert.equal(direto.status, 404);
});

// O teste acima passa VERDE mesmo se as duas cláusulas de social_blocks
// sumirem do GET /feed: bloquear também apaga os follows, e sem follow o post
// já não entrava no feed. Os dois mecanismos se cobriam, e o de reserva — o
// que existe "pro caso em que a limpeza de follow falhe" (socialRoutes.js:216)
// — era justamente o único sem cobertura. Provado por mutação: apagar as duas
// cláusulas deixava a suíte inteira verde.
//
// Este aqui ressuscita o follow por baixo do bloqueio, que é exatamente o
// estado que as cláusulas existem pra cobrir — some uma delas, fica vermelho.
test("o filtro de bloqueio do feed segura sozinho, mesmo com o follow de volta", async () => {
  await perfil("f1", "filtrador");
  await perfil("f2", "filtrado");
  await postar("f2", "Post do filtrado", "corpo");
  await postar("f1", "Post do filtrador", "corpo");
  await supertest(app).post("/api/moderation/block").set(auth("f1")).send({ blockedUserId: "f2" }).expect(200);

  const revive = db.prepare(
    "INSERT OR IGNORE INTO social_follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)"
  );
  revive.run("f1", "f2", new Date().toISOString());
  revive.run("f2", "f1", new Date().toISOString());

  const deQuemBloqueou = await supertest(app).get("/api/social/feed").set(auth("f1"));
  assert.equal(
    deQuemBloqueou.body.posts.filter((p) => p.user_id === "f2").length,
    0,
    "quem bloqueia não pode ver o bloqueado nem com o follow de volta"
  );

  const deQuemFoiBloqueado = await supertest(app).get("/api/social/feed").set(auth("f2"));
  assert.equal(
    deQuemFoiBloqueado.body.posts.filter((p) => p.user_id === "f1").length,
    0,
    "quem foi bloqueado não pode ver quem bloqueou nem com o follow de volta"
  );
});

test("comentário de quem eu bloqueei some até dos MEUS posts", async () => {
  await perfil("c1", "dono");
  await perfil("c2", "chato");
  const postId = await postar("c1", "Meu post", "corpo");
  await supertest(app).post("/api/social/follow/c1").set(auth("c2")).expect(200);
  await supertest(app).post(`/api/social/posts/${postId}/comments`).set(auth("c2")).send({ body: "comentário chato" }).expect(201);

  const antes = await supertest(app).get(`/api/social/posts/${postId}/comments`).set(auth("c1"));
  assert.equal(antes.body.comments.length, 1);

  await supertest(app).post("/api/moderation/block").set(auth("c1")).send({ blockedUserId: "c2" }).expect(200);

  const depois = await supertest(app).get(`/api/social/posts/${postId}/comments`).set(auth("c1"));
  assert.equal(depois.body.comments.length, 0);
});

test("desbloquear devolve o acesso", async () => {
  await supertest(app).delete("/api/moderation/block").set(auth("c1")).send({ blockedUserId: "c2" }).expect(200);
  const perfilDoOutro = await supertest(app).get("/api/social/users/c2").set(auth("c1"));
  assert.equal(perfilDoOutro.status, 200);
});

test("bloquear exige login e não aceita a si mesmo", async () => {
  await supertest(app).post("/api/moderation/block").send({ blockedUserId: "b2" }).expect(401);
  await supertest(app).post("/api/moderation/block").set(auth("b1")).send({ blockedUserId: "b1" }).expect(400);
  await supertest(app).get("/api/moderation/blocks").expect(401);
  await supertest(app).post("/api/moderation/block").set(auth("b1")).send({ blockedUserId: "nao-existe" }).expect(404);
});

test("o dono resolve a denúncia: 'remove' apaga o conteúdo e fecha a linha", async () => {
  await perfil("a1", "autoradmin");
  const postId = await postar("a1", "Post que vai sair", "corpo");
  await supertest(app)
    .post("/api/moderation/report")
    .send({ kind: "post", targetId: String(postId), reason: "spam" })
    .expect(200);
  const denuncia = db.prepare("SELECT id FROM moderation_reports WHERE target_id = ? AND reason = 'spam'").get(String(postId));

  const semToken = await supertest(app).post(`/api/admin/reports/${denuncia.id}`).send({ action: "remove" });
  assert.equal(semToken.status, 401);

  const res = await supertest(app)
    .post(`/api/admin/reports/${denuncia.id}`)
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .send({ action: "remove" });
  assert.equal(res.status, 200);

  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_posts WHERE id = ?").get(postId).c, 0, "o post denunciado tem que sumir");
  assert.equal(db.prepare("SELECT status FROM moderation_reports WHERE id = ?").get(denuncia.id).status, "removed");
  const action = db
    .prepare("SELECT action, reason FROM moderation_actions WHERE report_id = ? ORDER BY id DESC")
    .get(denuncia.id);
  assert.equal(action.action, "remove");
  assert.match(action.reason, /conteúdo removido/);

  // Resolver duas vezes não pode apagar outra coisa por engano.
  const denovo = await supertest(app)
    .post(`/api/admin/reports/${denuncia.id}`)
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .send({ action: "remove" });
  assert.equal(denovo.status, 409);
});

test("denúncia social suspende sem apagar evidência/bloqueio e a reversão fica auditável", async () => {
  await perfil("s1", "denuncias1");
  await perfil("s2", "suspenso2");
  const postId = await postar("s2", "Conteúdo do perfil suspenso", "prova preservada para recurso");

  await supertest(app)
    .post("/api/moderation/block")
    .set(auth("s1"))
    .send({ blockedUserId: "s2" })
    .expect(200);

  await supertest(app)
    .post("/api/moderation/report")
    .set(auth("s1"))
    .send({ kind: "post", targetId: String(postId), reason: "assédio" })
    .expect(200);
  const denuncia = db
    .prepare("SELECT id FROM moderation_reports WHERE kind = 'post' AND target_user_id = 's2' ORDER BY id DESC")
    .get();

  const suspended = await supertest(app)
    .post(`/api/admin/reports/${denuncia.id}`)
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .send({ action: "suspend", reason: "risco confirmado na revisão" })
    .expect(200);
  assert.equal(suspended.body.suspendedUserId, "s2");
  assert.equal(suspended.body.deleted.blocksPreserved, 1);
  assert.ok(suspended.body.deleted.reportsPreserved >= 1);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_profiles WHERE user_id = 's2'").get().c, 0);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_posts WHERE user_id = 's2'").get().c, 0);
  assert.equal(db.prepare("SELECT COUNT(*) c FROM social_suspensions WHERE user_id = 's2'").get().c, 1);
  assert.equal(
    db.prepare("SELECT COUNT(*) c FROM social_blocks WHERE user_id = 's1' AND blocked_user_id = 's2'").get().c,
    1,
    "suspender não pode desfazer a proteção escolhida por outra pessoa"
  );

  const preservedReport = db
    .prepare("SELECT target_user_id, content, status FROM moderation_reports WHERE id = ?")
    .get(denuncia.id);
  assert.equal(preservedReport.target_user_id, "s2");
  assert.match(preservedReport.content, /prova preservada para recurso/);
  assert.equal(preservedReport.status, "suspended");
  const suspendAction = db
    .prepare("SELECT action, reason FROM moderation_actions WHERE report_id = ? ORDER BY id DESC")
    .get(denuncia.id);
  assert.deepEqual(suspendAction, { action: "suspend", reason: "risco confirmado na revisão" });

  const refused = await supertest(app).get("/api/social/profile/me").set(auth("s2")).expect(403);
  assert.equal(refused.body.code, "community_suspended");

  const list = await supertest(app)
    .get("/api/admin/social-suspensions")
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .expect(200);
  assert.ok(list.body.suspensions.some((item) => item.user_id === "s2"));

  await supertest(app)
    .delete("/api/admin/social-suspensions/s2")
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .send({})
    .expect(400);
  await supertest(app)
    .delete("/api/admin/social-suspensions/s2")
    .set("X-Admin-Token", process.env.ADMIN_TOKEN)
    .send({ reason: "revisão concluída" })
    .expect(200);

  const after = await supertest(app).get("/api/social/profile/me").set(auth("s2")).expect(200);
  assert.equal(after.body.profile, null, "reverter suspensão não ressuscita conteúdo removido");
  const actions = db
    .prepare("SELECT action, reason FROM moderation_actions WHERE report_id = ? ORDER BY id")
    .all(denuncia.id);
  assert.deepEqual(actions, [
    { action: "suspend", reason: "risco confirmado na revisão" },
    { action: "unsuspend", reason: "revisão concluída" },
  ]);

  await perfil("s2", "retorno2");
  await supertest(app).get("/api/social/users/s2").set(auth("s1")).expect(404);
});
