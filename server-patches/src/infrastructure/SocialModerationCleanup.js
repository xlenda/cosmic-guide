// Remoção da PRESENÇA social durante uma suspensão administrativa.
//
// Isto não pode reutilizar SocialAccountCleanup: apagar uma conta e suspender
// sua participação têm contratos diferentes. Na suspensão a conta continua
// existindo, então as provas da decisão e os bloqueios de segurança precisam
// sobreviver. Se o dono reverter a suspensão, os antigos bloqueios continuam
// valendo para o mesmo user_id.
//
// A função não abre transação. O chamador inclui limpeza, lápide, estado da
// denúncia e histórico da ação na mesma transação.

const { normalizeSocialUserId } = require("./normalizeSocialUserId");

function changes(result) {
  return result && Number.isFinite(result.changes) ? result.changes : 0;
}

function count(database, sql, userId) {
  return database.prepare(sql).get(userId, userId).n;
}

function suspendSocialPresenceRows(database, { userId } = {}) {
  if (!database || typeof database.prepare !== "function") {
    throw new TypeError("database com prepare() é obrigatório");
  }

  const cleanUserId = normalizeSocialUserId(userId);
  if (!cleanUserId) {
    return {
      profiles: 0,
      posts: 0,
      comments: 0,
      likes: 0,
      follows: 0,
      blocksPreserved: 0,
      reportsPreserved: 0,
    };
  }

  const blocksPreserved = count(
    database,
    "SELECT COUNT(*) AS n FROM social_blocks WHERE user_id = ? OR blocked_user_id = ?",
    cleanUserId
  );
  const reportsPreserved = count(
    database,
    `SELECT COUNT(*) AS n
       FROM moderation_reports
      WHERE target_user_id = ? OR (kind = 'user' AND target_id = ?)`,
    cleanUserId
  );

  // Interações vêm antes dos posts porque o esquema social legado não possui
  // FK/cascade. Nenhuma consulta abaixo toca social_blocks ou
  // moderation_reports: essa ausência é parte do contrato de segurança.
  const likes = database
    .prepare(
      `DELETE FROM social_likes
        WHERE user_id = ?
           OR post_id IN (SELECT id FROM social_posts WHERE user_id = ?)`
    )
    .run(cleanUserId, cleanUserId);

  const comments = database
    .prepare(
      `DELETE FROM social_comments
        WHERE user_id = ?
           OR post_id IN (SELECT id FROM social_posts WHERE user_id = ?)`
    )
    .run(cleanUserId, cleanUserId);

  const posts = database.prepare("DELETE FROM social_posts WHERE user_id = ?").run(cleanUserId);
  const follows = database
    .prepare("DELETE FROM social_follows WHERE follower_id = ? OR followee_id = ?")
    .run(cleanUserId, cleanUserId);
  const profiles = database.prepare("DELETE FROM social_profiles WHERE user_id = ?").run(cleanUserId);

  return {
    profiles: changes(profiles),
    posts: changes(posts),
    comments: changes(comments),
    likes: changes(likes),
    follows: changes(follows),
    blocksPreserved,
    reportsPreserved,
  };
}

module.exports = { suspendSocialPresenceRows };
