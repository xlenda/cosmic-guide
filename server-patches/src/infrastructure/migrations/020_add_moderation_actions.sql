-- HISTÓRICO APPEND-ONLY DAS DECISÕES DE MODERAÇÃO.
--
-- moderation_reports guarda a denúncia e seu estado atual. Esta tabela guarda
-- cada decisão administrativa separadamente para que remover, arquivar,
-- suspender e reverter uma suspensão não desapareçam quando o estado atual
-- mudar. Não há rota de UPDATE/DELETE para estas linhas.
--
-- O alvo não é duplicado aqui de propósito. A ação aponta para a denúncia; se
-- a conta for apagada, o ciclo de vida já anonimiza o alvo na denúncia e este
-- histórico deixa de identificá-lo sem precisar reescrever uma linha de
-- auditoria.

CREATE TABLE IF NOT EXISTS moderation_actions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id  INTEGER,
  action     TEXT NOT NULL CHECK (action IN ('remove', 'dismiss', 'suspend', 'unsuspend')),
  reason     TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_report
  ON moderation_actions(report_id, id DESC);

CREATE INDEX IF NOT EXISTS idx_moderation_actions_created
  ON moderation_actions(created_at DESC, id DESC);

-- A API só insere, mas a garantia também mora no banco: manutenção acidental
-- ou código futuro não pode reescrever a decisão anterior. Exclusão de conta
-- continua compatível porque esta tabela não duplica identificadores pessoais.
CREATE TRIGGER IF NOT EXISTS moderation_actions_reject_update
BEFORE UPDATE ON moderation_actions
BEGIN
  SELECT RAISE(ABORT, 'moderation_actions is append-only');
END;

CREATE TRIGGER IF NOT EXISTS moderation_actions_reject_delete
BEFORE DELETE ON moderation_actions
BEGIN
  SELECT RAISE(ABORT, 'moderation_actions is append-only');
END;
