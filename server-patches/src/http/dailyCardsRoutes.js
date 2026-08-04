// OS FUNDOS DO CARD DE COMPARTILHAR — leitura pública, escrita só pelo cron.
//
// GET /api/daily-cards          → { date, solo, casal } (URLs prontas)
// GET /api/daily-cards/img/:date/:nome → o PNG em si
//
// Quem GERA é scripts/gerar-cards-do-dia.js (cron diário); esta rota só serve
// o que existe no disco. Se o cron falhar num dia, latest.json continua
// apontando pro último dia completo — o app nunca vê buraco, só um fundo de
// ontem, e fundo de ontem ainda é um fundo bonito.
const path = require("node:path");
const fs = require("node:fs");
const express = require("express");

const DIR_CARDS = path.join(__dirname, "..", "..", "data", "daily-cards");

// :date e :nome entram numa allowlist DURA antes de tocar o filesystem — data
// no formato exato e nome dentro de um conjunto de dois. Sem isso a rota seria
// um path traversal de brinde (../../forja.sqlite).
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;
const NOMES = new Set(["solo.png", "casal.png"]);

const dailyCardsRouter = express.Router();

dailyCardsRouter.get("/", (_req, res) => {
  let manifesto;
  try {
    manifesto = JSON.parse(fs.readFileSync(path.join(DIR_CARDS, "latest.json"), "utf8"));
  } catch {
    // Nunca gerou nada ainda: 404 com code, pro app saber pular o fundo em
    // vez de tentar carregar imagem que não existe.
    return res.status(404).json({ error: "nenhum card gerado ainda", code: "no_cards_yet" });
  }
  const { date } = manifesto;
  if (!DATA_RE.test(String(date))) {
    return res.status(500).json({ error: "manifesto inválido" });
  }
  res.set("Cache-Control", "public, max-age=900"); // 15 min: troca de dia aparece rápido
  res.json({
    date,
    solo: `/api/daily-cards/img/${date}/solo.png`,
    casal: `/api/daily-cards/img/${date}/casal.png`,
  });
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
