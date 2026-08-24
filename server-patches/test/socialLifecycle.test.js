const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const {
  deleteSocialAccountData,
  deleteSocialAccountRows,
} = require("../src/infrastructure/SocialAccountCleanup");

const ROOT = path.join(__dirname, "..");

function openDatabase() {
  const native = new DatabaseSync(":memory:");
  native.exec("PRAGMA foreign_keys = ON");
  const database = {
    prepare(sql) {
      return native.prepare(sql);
    },
    transaction(fn) {
      return (...args) => {
        native.exec("BEGIN IMMEDIATE");
        try {
          const value = fn(...args);
          native.exec("COMMIT");
          return value;
        } catch (error) {
          native.exec("ROLLBACK");
          throw error;
        }
      };
    },
  };
  return { native, database };
}

function migration(number, name) {
  return fs.readFileSync(
    path.join(ROOT, "src", "infrastructure", "migrations", `${number}_${name}.sql`),
    "utf8"
  );
}

function applySocialSchema(native) {
  native.exec(migration("016", "add_moderation"));
  native.exec(migration("018", "version_social_foundation"));
}

function scalar(native, sql, ...params) {
  return native.prepare(sql).get(...params).value;
}

function seedLifecycle(native) {
  const now = "2026-08-24T12:00:00.000Z";
  const profile = native.prepare(
    "INSERT INTO social_profiles (user_id, display_name, username, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
  );
  profile.run("victim", "Victim", "victim", now, now);
  profile.run("other", "Other", "other", now, now);
  profile.run("third", "Third", "third", now, now);

  const post = native.prepare(
    "INSERT INTO social_posts (user_id, title, body, created_at) VALUES (?, ?, ?, ?)"
  );
  const victimPost = Number(post.run("victim", "V", "post da vítima", now).lastInsertRowid);
  const otherPost = Number(post.run("other", "O", "post alheio", now).lastInsertRowid);

  const like = native.prepare("INSERT INTO social_likes (post_id, user_id, created_at) VALUES (?, ?, ?)");
  like.run(victimPost, "other", now); // interação alheia no post que será apagado
  like.run(otherPost, "victim", now); // interação da conta em post preservado
  like.run(otherPost, "third", now); // precisa permanecer

  const comment = native.prepare(
    "INSERT INTO social_comments (post_id, user_id, body, created_at) VALUES (?, ?, ?, ?)"
  );
  comment.run(victimPost, "other", "no post removido", now);
  comment.run(otherPost, "victim", "escrito pela conta", now);
  comment.run(otherPost, "third", "precisa permanecer", now);

  const follow = native.prepare("INSERT INTO social_follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)");
  follow.run("victim", "other", now);
  follow.run("other", "victim", now);
  follow.run("third", "other", now);

  const block = native.prepare("INSERT INTO social_blocks (user_id, blocked_user_id, created_at) VALUES (?, ?, ?)");
  block.run("victim", "third", now);
  block.run("other", "victim", now);
  block.run("third", "other", now);

  const report = native.prepare(
    `INSERT INTO moderation_reports
       (kind, target_id, target_user_id, reporter_id, reason, detail, content, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?)`
  );
  report.run("post", String(otherPost), "other", "victim", "spam", "texto privado do denunciante", "post alheio", now);
  report.run("post", String(victimPost), "victim", "other", "abuso", "menciona a vítima", "post da vítima", now);
  report.run("user", "victim", "victim", "third", "abuso", "perfil denunciado", "Victim (@victim)", now);

  native
    .prepare("INSERT INTO social_suspensions (user_id, report_id, reason, created_at) VALUES (?, ?, ?, ?)")
    .run("victim", null, "teste", now);

  return { victimPost, otherPost };
}

test("migração 018 cria a fundação social completa e pode rodar duas vezes", () => {
  const { native } = openDatabase();
  try {
    native.exec(migration("016", "add_moderation"));
    const sql = migration("018", "version_social_foundation");
    native.exec(sql);
    native.exec(sql);

    const tables = native
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE 'social_%' ORDER BY name")
      .all()
      .map((row) => row.name);
    assert.deepEqual(tables, [
      "social_blocks",
      "social_comments",
      "social_follows",
      "social_likes",
      "social_posts",
      "social_profiles",
      "social_suspensions",
    ]);

    for (const index of [
      "idx_social_posts_user_created",
      "idx_social_follows_followee",
      "idx_social_comments_post",
      "idx_social_comments_user",
      "idx_social_likes_user",
      "idx_moderation_reports_target_user",
      "idx_moderation_reports_reporter",
    ]) {
      assert.equal(
        scalar(native, "SELECT COUNT(*) AS value FROM sqlite_master WHERE type = 'index' AND name = ?", index),
        1,
        `${index} precisa existir`
      );
    }
  } finally {
    native.close();
  }
});

test("exclusão social remove todo UGC e vínculo sem apagar conteúdo alheio", () => {
  const { native, database } = openDatabase();
  try {
    applySocialSchema(native);
    const { victimPost, otherPost } = seedLifecycle(native);
    const deleted = deleteSocialAccountRows(database, {
      userId: "victim",
      now: "2026-08-24T13:00:00.000Z",
      deleteSuspension: true,
    });

    assert.deepEqual(deleted, {
      profiles: 1,
      posts: 1,
      comments: 2,
      likes: 2,
      follows: 2,
      blocks: 2,
      suspensions: 1,
      reportsByUserAnonymized: 1,
      reportsAboutUserClosed: 2,
    });

    for (const [table, column] of [
      ["social_profiles", "user_id"],
      ["social_posts", "user_id"],
      ["social_comments", "user_id"],
      ["social_likes", "user_id"],
      ["social_suspensions", "user_id"],
    ]) {
      assert.equal(scalar(native, `SELECT COUNT(*) AS value FROM ${table} WHERE ${column} = ?`, "victim"), 0);
    }
    assert.equal(
      scalar(native, "SELECT COUNT(*) AS value FROM social_follows WHERE follower_id = ? OR followee_id = ?", "victim", "victim"),
      0
    );
    assert.equal(
      scalar(native, "SELECT COUNT(*) AS value FROM social_blocks WHERE user_id = ? OR blocked_user_id = ?", "victim", "victim"),
      0
    );
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_comments WHERE post_id = ?", victimPost), 0);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_likes WHERE post_id = ?", victimPost), 0);

    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_posts WHERE id = ?", otherPost), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_comments WHERE post_id = ?", otherPost), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_likes WHERE post_id = ?", otherPost), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_follows"), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_blocks"), 1);

    const reportByUser = native
      .prepare("SELECT reporter_id, target_user_id, detail, content, status FROM moderation_reports WHERE reason = 'spam'")
      .get();
    assert.equal(reportByUser.reporter_id, null);
    assert.equal(reportByUser.detail, null);
    assert.equal(reportByUser.target_user_id, "other");
    assert.equal(reportByUser.content, "post alheio");
    assert.equal(reportByUser.status, "open");

    const reportsAboutUser = native
      .prepare("SELECT target_id, target_user_id, detail, content, status, reviewed_at FROM moderation_reports WHERE reason = 'abuso'")
      .all();
    assert.equal(reportsAboutUser.length, 2);
    for (const report of reportsAboutUser) {
      assert.equal(report.target_id, null);
      assert.equal(report.target_user_id, null);
      assert.equal(report.detail, null);
      assert.equal(report.content, null);
      assert.equal(report.status, "removed");
      assert.equal(report.reviewed_at, "2026-08-24T13:00:00.000Z");
    }
  } finally {
    native.close();
  }
});

test("exclusão social é transacional: falha não deixa limpeza pela metade", () => {
  const { native, database } = openDatabase();
  try {
    applySocialSchema(native);
    seedLifecycle(native);
    native.exec(`
      CREATE TRIGGER fail_profile_delete
      BEFORE DELETE ON social_profiles
      WHEN OLD.user_id = 'victim'
      BEGIN
        SELECT RAISE(ABORT, 'falha simulada');
      END;
    `);

    assert.throws(
      () => deleteSocialAccountData(database, { userId: "victim", deleteSuspension: true }),
      /falha simulada/
    );
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_profiles WHERE user_id = 'victim'"), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_posts WHERE user_id = 'victim'"), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_comments WHERE user_id = 'victim'"), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_likes WHERE user_id = 'victim'"), 1);
    assert.equal(scalar(native, "SELECT COUNT(*) AS value FROM social_suspensions WHERE user_id = 'victim'"), 1);
    assert.equal(
      native.prepare("SELECT reporter_id FROM moderation_reports WHERE reason = 'spam'").get().reporter_id,
      "victim"
    );
  } finally {
    native.close();
  }
});
