// Ciclo de vida dos dados da Comunidade.
//
// Esta função recebe o banco por parâmetro para que a mesma regra possa rodar:
//   - dentro da transação maior de DELETE /api/subscription/account; e
//   - sozinha ao apagar apenas o perfil social.
//
// Ela NÃO abre transação por conta própria. Quem chama precisa envolver todas
// as operações em `db.transaction(...)`; assim assinatura, UGC e lápide de
// revogação nunca ficam pela metade.

const EMPTY_SOCIAL_DELETION = Object.freeze({
  profiles: 0,
  posts: 0,
  comments: 0,
  likes: 0,
  follows: 0,
  blocks: 0,
  suspensions: 0,
  reportsByUserAnonymized: 0,
  reportsAboutUserClosed: 0,
});

function changes(result) {
  return result && Number.isFinite(result.changes) ? result.changes : 0;
}

function emptySocialDeletion() {
  return { ...EMPTY_SOCIAL_DELETION };
}

function deleteSocialAccountRows(
  database,
  { userId, now = new Date().toISOString(), deleteSuspension = false } = {}
) {
  if (!database || typeof database.prepare !== "function") {
    throw new TypeError("database com prepare() é obrigatório");
  }

  const cleanUserId = typeof userId === "string" ? userId.trim() : "";
  if (!cleanUserId) return emptySocialDeletion();

  // Uma denúncia feita pela pessoa continua útil para proteger a comunidade,
  // mas deixa de apontar para ela. O detalhe livre é apagado; motivo categórico
  // e instantâneo do conteúdo ALHEIO denunciado permanecem para moderação.
  const reportsByUser = database
    .prepare(
      `UPDATE moderation_reports
          SET reporter_id = NULL,
              detail = NULL
        WHERE reporter_id = ?`
    )
    .run(cleanUserId);

  // Uma denúncia CONTRA a conta apagada deixa somente o registro operacional:
  // nenhum id, perfil ou instantâneo do UGC removido sobrevive. Se ainda estava
  // aberta, fica fechada como removed porque o alvo inteiro já saiu.
  const reportsAboutUser = database
    .prepare(
      `UPDATE moderation_reports
          SET target_id = NULL,
              target_user_id = NULL,
              detail = NULL,
              content = NULL,
              status = CASE WHEN status = 'open' THEN 'removed' ELSE status END,
              reviewed_at = CASE WHEN status = 'open' THEN ? ELSE reviewed_at END
        WHERE target_user_id = ?
           OR (kind = 'user' AND target_id = ?)`
    )
    .run(now, cleanUserId, cleanUserId);

  // Interações vêm antes dos posts. Não há FK/cascade no esquema legado, então
  // a ordem explícita é o que impede curtidas e comentários órfãos.
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
  const blocks = database
    .prepare("DELETE FROM social_blocks WHERE user_id = ? OR blocked_user_id = ?")
    .run(cleanUserId, cleanUserId);
  const profiles = database.prepare("DELETE FROM social_profiles WHERE user_id = ?").run(cleanUserId);
  const suspensions = deleteSuspension
    ? database.prepare("DELETE FROM social_suspensions WHERE user_id = ?").run(cleanUserId)
    : { changes: 0 };

  return {
    profiles: changes(profiles),
    posts: changes(posts),
    comments: changes(comments),
    likes: changes(likes),
    follows: changes(follows),
    blocks: changes(blocks),
    suspensions: changes(suspensions),
    reportsByUserAnonymized: changes(reportsByUser),
    reportsAboutUserClosed: changes(reportsAboutUser),
  };
}

function deleteSocialAccountData(database, options) {
  if (!database || typeof database.transaction !== "function") {
    throw new TypeError("database com transaction() é obrigatório");
  }
  return database.transaction(() => deleteSocialAccountRows(database, options))();
}

module.exports = {
  deleteSocialAccountData,
  deleteSocialAccountRows,
  emptySocialDeletion,
};
