-- COTA DE IA NO SERVIDOR (src/http/aiQuota.js).
--
-- POR QUE EXISTE (achado de auditoria, 30/07/2026 — o mais caro de todos):
-- até aqui NENHUMA rota de IA (/api/chat, /api/palm, /api/face, /api/foot,
-- /api/moles, /api/coffee, /api/dream, /api/enhance-insight,
-- /api/weekly-insight, /api/coffee-weekly-summary) checava autenticação nem
-- assinatura. O único freio de pagamento do produto morava no AsyncStorage do
-- APARELHO (lib/featureUsage.js, lib/chatFreeMessages.js no app). Dois ataques,
-- os dois triviais:
--
--   (a) usuário comum: gasta a leitura grátis, roda localStorage.clear() no
--       DevTools (ou abre uma aba anônima) e as 9 leituras voltam a ser
--       grátis — pra sempre, sem limite nenhum;
--   (b) qualquer um: curl direto na API, sem token, ~60 chamadas por IP a
--       cada 15 min (o aiLimiter) = ~5.700 chamadas/dia POR IP, todas pagas
--       na conta Anthropic do dono. O canary só avisa DEPOIS que o crédito
--       zerou.
--
-- Esta tabela é o contador que faz a cota grátis existir FORA do aparelho:
-- limpar o navegador deixa de devolver leitura grátis, porque a contagem
-- pertence à CONTA (o `sub` do JWT do Supabase), não ao localStorage.
--
-- ESTRUTURA — uma tabela genérica pros dois sujeitos que existem:
--
--   subject_type = 'account' → subject_id é o sub (UUID) do JWT verificado,
--                              period é sempre 'lifetime' (a cota grátis é
--                              vitalícia, mesmo espírito do "1 uso grátis"
--                              que o app já aplicava por aparelho).
--   subject_type = 'ip'      → subject_id é o HASH salgado do IP (nunca o IP
--                              em claro — ver abaixo) e period é o dia
--                              'YYYY-MM-DD'. Existe só pra deixar quem ainda
--                              NÃO tem conta experimentar as rotas de texto
--                              antes de criar login; as rotas de imagem
--                              (palm/face/foot/moles/coffee) exigem conta.
--
--   bucket → agrupa rotas que dividem a mesma cota, espelhando o paywall que o
--            app já mostra: 'chat', 'vision' (palma/rosto/pé/pintas — uma
--            tela só, um FEATURE_KEY só), 'coffee', 'dream', 'insight'
--            (enhance-insight/weekly-insight/coffee-weekly-summary) e o
--            teto agregado '__total'. O balde anônimo é '__anon'.
--
-- PRIVACIDADE: o mesmo padrão de funnel_events (migração 010) — IP NUNCA é
-- gravado em claro. O que entra em subject_id é sha256(salt || ip), com o
-- salt aleatório de 32 bytes gerado na primeira execução e guardado em
-- app_secrets abaixo. Sem o salt (que nasce no servidor e nunca sai dele) a
-- coluna não é reversível por força bruta sobre o espaço de IPv4, que é o que
-- aconteceria com um hash sem sal.
--
-- O QUE NÃO ENTRA AQUI: nada de conteúdo. Nem mensagem, nem foto, nem
-- transcrição, nem e-mail. Só "quantas chamadas de graça esse sujeito já fez".
CREATE TABLE IF NOT EXISTS ai_free_quota (
  subject_type TEXT NOT NULL,
  subject_id   TEXT NOT NULL,
  bucket       TEXT NOT NULL,
  period       TEXT NOT NULL,
  used         INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  PRIMARY KEY (subject_type, subject_id, bucket, period)
);

-- Só serve pra limpeza por retenção das linhas anônimas (DELETE ... WHERE
-- subject_type='ip' AND period < corte, ver ANON_RETENTION_DAYS em
-- aiQuota.js). As linhas de CONTA são vitalícias e nunca entram nesse DELETE —
-- apagá-las devolveria a cota grátis, que é exatamente o buraco que estamos
-- fechando. Um índice só: a leitura quente (consumir cota) é sempre pela
-- chave primária, que já resolve tudo sem índice extra, e todo índice a mais
-- é custo em TODA escrita.
CREATE INDEX IF NOT EXISTS idx_ai_free_quota_period ON ai_free_quota(period);

-- Segredos que o SERVIDOR gera pra si mesmo e precisa manter estáveis entre
-- reinícios — hoje só o sal do hash de IP acima. Não é lugar de credencial de
-- terceiro (essas continuam em variável de ambiente, fora do banco): é lugar
-- de valor aleatório que só faz sentido dentro deste banco e que, se fosse
-- gerado a cada boot, zeraria a cota anônima a cada `pm2 restart`.
CREATE TABLE IF NOT EXISTS app_secrets (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  created_at TEXT NOT NULL
);
