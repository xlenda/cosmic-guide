-- MODERAÇÃO DE CONTEÚDO GERADO PELO USUÁRIO (Google Play, política de UGC).
--
-- POR QUE EXISTE: o feed social (social_posts/social_comments) vai pra Play
-- Store. A política de Conteúdo Gerado pelo Usuário exige três coisas que o
-- app não tinha: denunciar conteúdo DENTRO do app, bloquear uma pessoa (e não
-- ver mais nada dela), e um caminho de moderação — a denúncia precisa CHEGAR
-- em alguém e ser acionável. Até aqui só existia "o autor apaga o próprio
-- post" (DELETE /api/social/posts/:id).
--
-- As duas tabelas abaixo são o que faltava do lado do servidor. A parte
-- "chega em alguém" é o Painel do Dono (GET /painel), que passa a listar a
-- fila aberta e a agir sobre ela (src/http/painelRoutes.js + adminRoutes.js).

-- Bloqueio: quem bloqueou → quem foi bloqueado. Direcional na tabela, mas
-- aplicado nos DOIS sentidos na consulta (src/http/socialRoutes.js): quem
-- bloqueia deixa de ver e também deixa de ser visto — senão bloquear serviria
-- pra esconder o incômodo de si mesmo e continuar exposto a ele.
CREATE TABLE IF NOT EXISTS social_blocks (
  user_id         TEXT NOT NULL,
  blocked_user_id TEXT NOT NULL,
  created_at      TEXT NOT NULL,
  PRIMARY KEY (user_id, blocked_user_id)
);
-- A chave primária já resolve "quem EU bloqueei"; este índice é pro sentido
-- contrário ("quem me bloqueou"), que roda em todo feed.
CREATE INDEX IF NOT EXISTS idx_social_blocks_blocked ON social_blocks(blocked_user_id);

-- Fila de denúncias. Guarda o CONTEÚDO denunciado num instantâneo (coluna
-- `content`) de propósito: sem isso a fila é inacionável — o autor apaga o
-- post e quem modera fica com um id órfão e um motivo, sem nada pra julgar.
--
--   kind        'ai' | 'post' | 'comment' | 'user'
--   target_id   id do post/comentário, ou o user_id (kind 'user'). 'ai' não
--               tem linha no banco: o texto denunciado, se o app mandar,
--               chega em `detail`.
--   content     instantâneo do que foi denunciado NA HORA da denúncia
--   target_user_id  autor do conteúdo — é quem sofre a ação de moderação
--   reporter_id quem denunciou (null quando a denúncia é anônima; só kind
--               'user' exige login)
--   status      'open' → 'removed' (conteúdo apagado) | 'dismissed'
CREATE TABLE IF NOT EXISTS moderation_reports (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  kind           TEXT NOT NULL,
  target_id      TEXT,
  target_user_id TEXT,
  reporter_id    TEXT,
  reason         TEXT NOT NULL,
  detail         TEXT,
  content        TEXT,
  status         TEXT NOT NULL DEFAULT 'open',
  created_at     TEXT NOT NULL,
  reviewed_at    TEXT
);
-- A única leitura quente é "o que está aberto, mais novo primeiro" (o Painel
-- do Dono). Um índice só: todo índice a mais é custo em toda escrita.
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status, id DESC);
