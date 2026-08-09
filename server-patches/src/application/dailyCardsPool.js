// POOL DE RESERVA dos fundos do card do dia — a decisão PURA de qual fundo
// servir quando o gerador (Gemini) não produziu o card de HOJE.
//
// POR QUE EXISTE (08/08/2026): o gerador de scripts/gerar-cards-do-dia.js está
// sem chave válida, e "fundo de ontem" só segura enquanto existir um ontem
// recente — a faxina de 14 dias do próprio script apagaria tudo e o card
// morreria. A reserva são imagens JÁ PRONTAS em data/daily-cards/pool/
// (pool-solo-0..4.png e pool-casal-0..2.png, semeadas à mão no servidor).
//
// SEM SORTEIO, DE PROPÓSITO: a escolha é dia-da-semana % quantidade — mesmo
// dia, mesma imagem pra todo mundo, igual ao contrato dos TEMAS do gerador.
// Determinismo é o que deixa o card do dia ser "o" card do dia, idêntico pra
// quem compartilha e pra quem recebe.
//
// SEGURANÇA: o nome que vai pro filesystem sai SEMPRE das listas fixas abaixo
// (allowlist explícita + Set pro handler HTTP), nunca de input do cliente. O
// que existir a mais dentro de pool/ é invisível: a disponibilidade é a
// INTERSEÇÃO do disco com a allowlist, não o readdir cru. E não há aqui nenhum
// objeto de lookup indexado por valor externo — se um dia precisar, ele nasce
// com Object.create(null).
//
// Este módulo é a fonte da verdade que test/poolFallback.test.js exercita sem
// precisar de express/supertest (mesma razão de ownerAllowlist.js: rodar em
// qualquer máquina). A rota (src/http/dailyCardsRoutes.js) é só o adaptador
// HTTP das decisões daqui.
const fs = require("node:fs");

// O formato de data do manifesto/URLs — compartilhado com a rota (era uma
// cópia local lá; a fonte única agora é esta).
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;

// A allowlist do pool: nomes FIXOS, na ordem que define o índice do dia.
// Ampliar o pool = adicionar o arquivo no servidor E o nome aqui — o preço de
// uma allowlist dura, e é barato.
const POOL_SOLO = Object.freeze([
  "pool-solo-0.png",
  "pool-solo-1.png",
  "pool-solo-2.png",
  "pool-solo-3.png",
  "pool-solo-4.png",
]);
const POOL_CASAL = Object.freeze(["pool-casal-0.png", "pool-casal-1.png", "pool-casal-2.png"]);
const POOL_NOMES = new Set([...POOL_SOLO, ...POOL_CASAL]);

// A MESMA fórmula de data local do gerador (gerar-cards-do-dia.js): o dia
// "vira" no fuso do servidor, nos dois lados, ou o manifesto de hoje seria
// considerado velho por engano perto da meia-noite.
function hojeLocal(agora = new Date()) {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(
    agora.getDate()
  ).padStart(2, "0")}`;
}

// O que EXISTE no disco, filtrado pela allowlist e na ordem dela.
// null = pool inutilizável (diretório ausente — dev local — ou faltando um dos
// lados; a resposta do manifesto tem solo E casal, então é tudo ou nada).
function poolDisponivel(dirPool) {
  let nomesNoDisco;
  try {
    nomesNoDisco = new Set(fs.readdirSync(dirPool));
  } catch {
    return null; // sem pool/ (dev local): quem chama volta ao comportamento antigo
  }
  const solo = POOL_SOLO.filter((n) => nomesNoDisco.has(n));
  const casal = POOL_CASAL.filter((n) => nomesNoDisco.has(n));
  if (solo.length === 0 || casal.length === 0) return null;
  return { solo, casal };
}

// dia da semana % quantidade disponível — pura, pro teste fixar o dia.
function escolherDoPool(agora, disponivel) {
  if (!disponivel) return null;
  const dia = agora.getDay();
  return {
    solo: disponivel.solo[dia % disponivel.solo.length],
    casal: disponivel.casal[dia % disponivel.casal.length],
  };
}

// A DECISÃO inteira do GET /api/daily-cards, sem HTTP e sem filesystem:
//   manifesto — objeto parseado do latest.json, ou undefined se ilegível/ausente
//   hoje      — hojeLocal() do momento da requisição
//   escolha   — escolherDoPool(...) ou null se não há pool utilizável
// Retorna um de:
//   { tipo: "gerado", date }                → 200 com as URLs datadas de sempre
//   { tipo: "pool", date, solo, casal }     → 200 servindo a reserva
//   { tipo: "sem_cards" }                   → o 404 code no_cards_yet de sempre
//   { tipo: "manifesto_invalido" }          → o 500 de sempre
// A tabela: card gerado HOJE sempre vence o pool; pool cobre manifesto ausente,
// velho OU inválido; e SEM pool o comportamento é exatamente o de antes
// (inclusive "fundo de ontem ainda é um fundo bonito").
function decidirCardDoDia({ manifesto, hoje, escolha }) {
  const legivel = manifesto !== undefined;
  const date = legivel && manifesto !== null ? String(manifesto.date) : "";
  const dataValida = DATA_RE.test(date);

  if (dataValida && date === hoje) return { tipo: "gerado", date };
  if (escolha) return { tipo: "pool", date: hoje, solo: escolha.solo, casal: escolha.casal };

  // Daqui pra baixo é o comportamento pré-pool, intocado.
  if (!legivel) return { tipo: "sem_cards" };
  if (!dataValida) return { tipo: "manifesto_invalido" };
  return { tipo: "gerado", date };
}

module.exports = {
  DATA_RE,
  POOL_SOLO,
  POOL_CASAL,
  POOL_NOMES,
  hojeLocal,
  poolDisponivel,
  escolherDoPool,
  decidirCardDoDia,
};
