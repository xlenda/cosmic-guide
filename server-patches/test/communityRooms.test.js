const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const {
  COMMUNITY_GUIDELINES_VERSION,
  SIGN_IDS,
  ROOM_IDS,
  classifyPair,
  hasCurrentGuidelines,
  resolveCommunityPostMetadata,
} = require("../src/application/communityRooms");

const MIGRATIONS = path.join(__dirname, "..", "src", "infrastructure", "migrations");

function sql(name) {
  return fs.readFileSync(path.join(MIGRATIONS, name), "utf8");
}

function foundation(db) {
  db.exec(sql("016_add_moderation.sql"));
  db.exec(sql("018_version_social_foundation.sql"));
}

function count(db, query, ...params) {
  return db.prepare(query).get(...params).value;
}

test("migração 019 mantém posts antigos followers-only e signo desligado", () => {
  const db = new DatabaseSync(":memory:");
  try {
    foundation(db);
    const now = "2026-08-24T10:00:00.000Z";
    db.prepare(
      "INSERT INTO social_profiles (user_id, display_name, username, created_at, updated_at) VALUES (?, ?, ?, ?, ?)"
    ).run("legacy", "Legacy", "legacy", now, now);
    const legacyPostId = Number(
      db
        .prepare("INSERT INTO social_posts (user_id, title, body, created_at) VALUES (?, ?, ?, ?)")
        .run("legacy", "Antigo", "Nunca deve ficar público", now).lastInsertRowid
    );

    db.exec(sql("019_add_community_rooms.sql"));

    const profile = db
      .prepare(
        `SELECT zodiac_sign, show_zodiac_sign,
                community_guidelines_version, community_guidelines_accepted_at
           FROM social_profiles WHERE user_id = 'legacy'`
      )
      .get();
    assert.deepEqual({ ...profile }, {
      zodiac_sign: null,
      show_zodiac_sign: 0,
      community_guidelines_version: null,
      community_guidelines_accepted_at: null,
    });

    const post = db
      .prepare("SELECT visibility, room_id, sign_a, sign_b, relation FROM social_posts WHERE id = ?")
      .get(legacyPostId);
    assert.deepEqual({ ...post }, {
      visibility: "followers",
      room_id: null,
      sign_a: null,
      sign_b: null,
      relation: null,
    });
    assert.equal(
      count(
        db,
        "SELECT COUNT(*) AS value FROM social_posts WHERE visibility = 'community' AND room_id = 'plaza'"
      ),
      0
    );

    for (const index of ["idx_social_profiles_public_sign", "idx_social_posts_community_room"]) {
      assert.equal(
        count(db, "SELECT COUNT(*) AS value FROM sqlite_master WHERE type = 'index' AND name = ?", index),
        1
      );
    }

    const profileColumns = db.prepare("PRAGMA table_info(social_profiles)").all().map((column) => column.name);
    for (const forbidden of ["birth_date", "birth_time", "birth_city", "latitude", "longitude"]) {
      assert.equal(profileColumns.includes(forbidden), false, `migração não pode guardar ${forbidden}`);
    }
  } finally {
    db.close();
  }
});

test("servidor deriva sala e relação para todos os 144 pares", () => {
  assert.equal(SIGN_IDS.length, 12);
  for (const ownSign of SIGN_IDS) {
    for (const targetSign of SIGN_IDS) {
      const pair = classifyPair(ownSign, targetSign);
      assert.ok(pair);
      assert.notEqual(pair.roomId, "plaza");
      assert.ok(ROOM_IDS.includes(pair.roomId));

      const resolved = resolveCommunityPostMetadata({
        roomId: pair.roomId,
        targetSign,
        profile: { zodiac_sign: ownSign, show_zodiac_sign: 1 },
      });
      assert.deepEqual(
        resolved,
        {
          ok: true,
          value: {
            roomId: pair.roomId,
            signA: ownSign,
            signB: targetSign,
            relation: pair.relation,
          },
        },
        `${ownSign}/${targetSign}`
      );

      const reverse = classifyPair(targetSign, ownSign);
      assert.equal(reverse.roomId, pair.roomId);
      assert.equal(reverse.relation, pair.relation);
    }
  }
});

test("plaza dispensa signo; salas relacionais exigem consentimento e rejeitam classificação falsa", () => {
  assert.deepEqual(resolveCommunityPostMetadata({ roomId: "plaza", profile: null }), {
    ok: true,
    value: { roomId: "plaza", signA: null, signB: null, relation: null },
  });
  assert.equal(
    resolveCommunityPostMetadata({ roomId: "plaza", targetSign: "leo", profile: null }).code,
    "target_sign_not_allowed"
  );
  assert.equal(
    resolveCommunityPostMetadata({
      roomId: "bridges",
      targetSign: "leo",
      profile: { zodiac_sign: "aries", show_zodiac_sign: 0 },
    }).code,
    "public_zodiac_sign_required"
  );

  const mismatch = resolveCommunityPostMetadata({
    roomId: "sparks",
    targetSign: "leo",
    profile: { zodiac_sign: "aries", show_zodiac_sign: 1 },
  });
  assert.equal(mismatch.code, "room_mismatch");
  assert.equal(mismatch.expectedRoomId, "bridges");
});

test("aceite só vale para a versão server-side vigente", () => {
  assert.equal(
    hasCurrentGuidelines({
      community_guidelines_version: COMMUNITY_GUIDELINES_VERSION,
      community_guidelines_accepted_at: "2026-08-24T12:00:00.000Z",
    }),
    true
  );
  assert.equal(
    hasCurrentGuidelines({
      community_guidelines_version: "versao-do-cliente",
      community_guidelines_accepted_at: "2026-08-24T12:00:00.000Z",
    }),
    false
  );
  assert.equal(
    hasCurrentGuidelines({
      community_guidelines_version: COMMUNITY_GUIDELINES_VERSION,
      community_guidelines_accepted_at: null,
    }),
    false
  );
});
