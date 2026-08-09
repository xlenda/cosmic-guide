// OS FUNDOS DO CARD DE COMPARTILHAR — leitura pública, escrita só pelo cron.
//
// GET /api/daily-cards                  → { date, origem, solo, casal } (URLs prontas)
// GET /api/daily-cards/img/:date/:nome  → o PNG gerado do dia
// GET /api/daily-cards/img/pool/:nome   → um PNG do pool de reserva
//
// Quem GERA é scripts/gerar-cards-do-dia.js (cron diário); esta rota só serve
// o que existe no disco. Se o cron falhar (hoje: Gemini sem chave válida), o
// dia cai no POOL DE RESERVA — imagens prontas em data/daily-cards/pool/,
// escolhidas por dia da semana, mesma imagem pra todo mundo. A decisão inteira
// (gerado × pool × 404) vive em src/application/dailyCardsPool.js, que é puro
// e testado em test/poolFallback.test.js; aqui é só o adaptador HTTP. O campo
// `origem` ("gerado" | "pool") existe pro painel/depuração — o app ignora
// campo extra.
const path = require("node:path");
const fs = require("node:fs");
const express = require("express");

const {
  DATA_RE,
  POOL_NOMES,
  hojeLocal,
  poolDisponivel,
  escolherDoPool,
  decidirCardDoDia,
} = require("../application/dailyCardsPool");

const DIR_CARDS = path.join(__dirname, "..", "..", "data", "daily-cards");
const DIR_POOL = path.join(DIR_CARDS, "pool");

// :date e :nome entram numa allowlist DURA antes de tocar o filesystem — data
// no formato exato e nome dentro de um conjunto fechado (NOMES pro card
// gerado, POOL_NOMES pro pool). Sem isso a rota seria um path traversal de
// brinde (../../forja.sqlite).
const NOMES = new Set(["solo.png", "casal.png"]);

const dailyCardsRouter = express.Router();

dailyCardsRouter.get("/", (_req, res) => {
  const agora = new Date();

  let manifesto; // undefined = latest.json ausente/ilegível (nunca gerou nada)
  try {
    manifesto = JSON.parse(fs.readFileSync(path.join(DIR_CARDS, "latest.json"), "utf8"));
  } catch {
    manifesto = undefined;
  }

  const decisao = decidirCardDoDia({
    manifesto,
    hoje: hojeLocal(agora),
    escolha: escolherDoPool(agora, poolDisponivel(DIR_POOL)),
  });

  if (decisao.tipo === "sem_cards") {
    // Nunca gerou nada e não há pool: 404 com code, pro app saber pular o
    // fundo em vez de tentar carregar imagem que não existe.
    return res.status(404).json({ error: "nenhum card gerado ainda", code: "no_cards_yet" });
  }
  if (decisao.tipo === "manifesto_invalido") {
    return res.status(500).json({ error: "manifesto inválido" });
  }

  res.set("Cache-Control", "public, max-age=900"); // 15 min: troca de dia aparece rápido
  if (decisao.tipo === "pool") {
    return res.json({
      date: decisao.date,
      origem: "pool",
      solo: `/api/daily-cards/img/pool/${decisao.solo}`,
      casal: `/api/daily-cards/img/pool/${decisao.casal}`,
    });
  }
  return res.json({
    date: decisao.date,
    origem: "gerado",
    solo: `/api/daily-cards/img/${decisao.date}/solo.png`,
    casal: `/api/daily-cards/img/${decisao.date}/casal.png`,
  });
});

// ANTES da rota datada de propósito: "pool" não passa no DATA_RE, então se a
// genérica viesse primeiro ela responderia 400 pra todo /img/pool/...
dailyCardsRouter.get("/img/pool/:nome", (req, res) => {
  const { nome } = req.params;
  if (!POOL_NOMES.has(nome)) {
    return res.status(400).json({ error: "caminho inválido" });
  }
  const arquivo = path.join(DIR_POOL, nome);
  if (!fs.existsSync(arquivo)) {
    return res.status(404).json({ error: "card não encontrado" });
  }
  // Imutável de verdade: o conteúdo de pool-*-N.png nunca muda — o que muda
  // com o dia é QUAL deles o manifesto aponta.
  res.set("Cache-Control", "public, max-age=86400, immutable");
  res.sendFile(arquivo);
});

dailyCardsRouter.get("/img/:date/:nome", (req, res) => {
  const { date, nome } = req.params;
  if (!DATA_RE.test(date) || !NOMES.has(nome)) {
    return res.status(400).json({ error: "caminho inválido" });
  }
  const arquivo = path.join(DIR_CARDS, date, nome);
  if (!fs.existsSync(arquivo)) {
    return res.status(404).json({ error: "card não encontrado" });
  }
  // Imutável de verdade: o PNG de um dia nunca é regravado depois de servido
  // (o --forcar do script é ferramenta de bancada, não de produção).
  res.set("Cache-Control", "public, max-age=86400, immutable");
  res.sendFile(arquivo);
});

module.exports = { dailyCardsRouter };
