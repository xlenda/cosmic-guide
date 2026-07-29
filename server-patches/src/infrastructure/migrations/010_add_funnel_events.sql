-- Rastreamento PRÓPRIO de funil (POST /api/track, src/http/trackRoutes.js).
--
-- POR QUE EXISTE: ~40 pessoas entraram no app nos últimos dias e ZERO
-- iniciaram checkout (0 linhas em subscriptions vindas do app nesse período).
-- Não existe instrumentação nenhuma, então ninguém sabe ONDE elas param —
-- toda melhoria de produto hoje é chute. O único evento que o app dispara
-- (trackInitiateCheckout, lib/conversionTracking.js) é o ÚLTIMO passo do
-- funil e está inerte (EXPO_PUBLIC_FB_PIXEL_ID/EXPO_PUBLIC_GA_ID nunca foram
-- configurados). Esta tabela responde a pergunta com dado do próprio dono,
-- sem depender de conta em lugar nenhum e sem ser comida por bloqueador de
-- anúncio (que engole boa parte de Pixel/GA4).
--
-- PRIVACIDADE (regra dura, o app tem tela de LGPD e dado sensível de
-- nascimento): aqui só entra "o que ACONTECEU", nunca "o que a pessoa
-- ESCREVEU". Nada de nome, e-mail, data/hora/cidade de nascimento, conteúdo
-- de leitura, texto de diário, mensagem de chat ou IP. session_id é um uuid
-- aleatório gerado no aparelho, sem nenhuma relação com a conta (Supabase) —
-- serve só pra contar "quantas pessoas diferentes chegaram até aqui", e é
-- justamente por ser anônimo que ele pode existir numa rota pública.
--
--   id         — chave técnica, ordem de chegada.
--   session_id — uuid anônimo do aparelho (validado por regex na rota).
--   event      — nome curto de uma ALLOWLIST fixa (ver trackRoutes.js). Texto
--                livre aqui viraria porta pra encher o banco.
--   props      — JSON pequeno e opcional, só com chaves conhecidas
--                (screen/kind/plan/mode/source/lang/platform), teto de 300
--                caracteres. NUNCA texto do usuário.
--   created_at — ISO UTC do SERVIDOR (o relógio do aparelho não é confiável e
--                não vale a pena confiar num timestamp que o cliente manda).
CREATE TABLE IF NOT EXISTS funnel_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  event TEXT NOT NULL,
  props TEXT,
  created_at TEXT NOT NULL
);

-- VOLUME: isto é evento de navegação, não de compra — cresce muito mais rápido
-- que qualquer outra tabela daqui (dezenas de linhas por pessoa por sessão,
-- contra 1 linha por compra em subscriptions). Os dois índices abaixo são
-- COBRINDO de propósito (incluem session_id no fim): as duas únicas consultas
-- que o scripts/funil.js faz são COUNT(DISTINCT session_id), então elas se
-- resolvem só no índice, sem tocar na tabela, mesmo com milhões de linhas.
-- Três índices e não mais: cada índice a mais é custo em TODO insert, e insert
-- aqui é o caminho quente. O terceiro (session_id) não serve pro relatório —
-- ele existe só pra "apagar meus dados" ser barato, ver o comentário dele.

-- 1) "sessões únicas por dia" + a limpeza por retenção (DELETE ... WHERE
--    created_at < corte, ver TRACK_RETENTION_DAYS em trackRoutes.js). O
--    prefixo created_at sozinho já serve pro DELETE.
CREATE INDEX IF NOT EXISTS idx_funnel_events_created_session
  ON funnel_events(created_at, session_id);

-- 2) cada degrau do funil é "quantas sessões distintas dispararam ESTE evento
--    na janela" — event primeiro (seletividade alta: são ~12 nomes possíveis),
--    depois created_at pra cortar a janela, depois session_id pro DISTINCT.
CREATE INDEX IF NOT EXISTS idx_funnel_events_event_created_session
  ON funnel_events(event, created_at, session_id);

-- 3) "apagar meus dados" (POST /api/track/forget → DELETE ... WHERE
--    session_id = ?). Nenhum dos dois índices acima começa por session_id,
--    então sem este o apagamento seria varredura da tabela INTEIRA — e
--    better-sqlite3 é síncrono, ou seja, a varredura trava o event loop da API
--    (checkout e webhook de pagamento junto). Pior: a rota é pública, então
--    bastaria repetir /forget com uuid inventado pra transformar uma promessa
--    de LGPD em negação de serviço. O custo (um índice a mais em todo insert)
--    é o preço de "apagar" ser barato e previsível; a alternativa era não
--    apagar de verdade.
CREATE INDEX IF NOT EXISTS idx_funnel_events_session
  ON funnel_events(session_id);
