// Testes do POOL DE RESERVA dos fundos do card do dia — o que segura o
// GET /api/daily-cards em pé enquanto o gerador (Gemini) está sem chave.
//
// O que está sendo travado aqui é o trio que faz um fallback ser confiável:
//   1) DETERMINISMO — dia fixo → nome fixo (dia-da-semana % quantidade), sem
//      sorteio: mesmo dia = mesma imagem pra quem compartilha e pra quem
//      recebe, igual ao contrato dos TEMAS do gerador;
//   2) ALLOWLIST — só os 8 nomes fixos do pool chegam ao filesystem; intruso
//      dentro de pool/ é invisível e nome hostil de cliente nunca passa;
//   3) SEM POOL → NADA MUDA — em dev local (sem pool/) a rota responde
//      exatamente como antes: 404 no_cards_yet, 500 de manifesto inválido e
//      "fundo de ontem ainda é um fundo bonito".
//
// Este arquivo NÃO precisa de express/supertest de propósito: ele exercita o
// módulo puro (src/application/dailyCardsPool.js) direto, então roda em
// qualquer máquina (as deps do backend não compilam no Windows do Lenda) —
// mesma razão de ownerAllowlist.test.js. A rota é um adaptador fino da
// decisão testada aqui; a camada HTTP roda no servidor com `npm test`.
//
// Como rodar (dentro de server-patches):
//   node --test test/poolFallback.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const {
  DATA_RE,
  POOL_SOLO,
  POOL_CASAL,
  POOL_NOMES,
  hojeLocal,
  poolDisponivel,
  escolherDoPool,
  decidirCardDoDia,
} = require("../src/application/dailyCardsPool");

// Um data/daily-cards de mentira por teste, com pool/ opcional.
const TEMP_DIRS = [];
function novoPoolDir(arquivos) {
  const dirCards = fs.mkdtempSync(path.join(os.tmpdir(), "forja-test-pool-"));
  TEMP_DIRS.push(dirCards);
  const dirPool = path.join(dirCards, "pool");
  if (arquivos !== null) {
    fs.mkdirSync(dirPool);
    for (const nome of arquivos) fs.writeFileSync(path.join(dirPool, nome), "png-de-mentira");
  }
  return dirPool;
}

test.after(() => {
  for (const dir of TEMP_DIRS) fs.rmSync(dir, { recursive: true, force: true });
});

const POOL_COMPLETO = [...POOL_SOLO, ...POOL_CASAL];

// Dias FIXOS com dia-da-semana conhecido: 2026-01-04 é domingo (os asserts de
// getDay() abaixo provam, pra ninguém confiar em conta de cabeça).
const DOMINGO = new Date(2026, 0, 4);
const QUARTA = new Date(2026, 0, 7);

// ---------------------------------------------------------------------------
// 1) DETERMINISMO — dia fixo → nome fixo, sem sorteio
// ---------------------------------------------------------------------------

test("domingo fixo → pool-solo-0 e pool-casal-0, e o MESMO resultado em toda chamada", () => {
  assert.equal(DOMINGO.getDay(), 0, "2026-01-04 tem que ser domingo");
  const disponivel = poolDisponivel(novoPoolDir(POOL_COMPLETO));

  const primeira = escolherDoPool(DOMINGO, disponivel);
  assert.deepEqual(primeira, { solo: "pool-solo-0.png", casal: "pool-casal-0.png" });

  // Sem Math.random escondido: repetir a pergunta dá a MESMA resposta.
  for (let i = 0; i < 20; i++) {
    assert.deepEqual(escolherDoPool(DOMINGO, disponivel), primeira);
  }
});

test("a semana inteira mapeia pra dia % quantidade (5 solo, 3 casal)", () => {
  const disponivel = poolDisponivel(novoPoolDir(POOL_COMPLETO));
  // Tabela LITERAL, de domingo (04/01/2026) a sábado — se alguém trocar a
  // fórmula ou a ordem da allowlist, é aqui que estoura.
  const esperado = [
    { solo: "pool-solo-0.png", casal: "pool-casal-0.png" }, // dom
    { solo: "pool-solo-1.png", casal: "pool-casal-1.png" }, // seg
    { solo: "pool-solo-2.png", casal: "pool-casal-2.png" }, // ter
    { solo: "pool-solo-3.png", casal: "pool-casal-0.png" }, // qua
    { solo: "pool-solo-4.png", casal: "pool-casal-1.png" }, // qui
    { solo: "pool-solo-0.png", casal: "pool-casal-2.png" }, // sex
    { solo: "pool-solo-1.png", casal: "pool-casal-0.png" }, // sáb
  ];
  for (let i = 0; i < 7; i++) {
    const dia = new Date(2026, 0, 4 + i);
    assert.equal(dia.getDay(), i);
    assert.deepEqual(escolherDoPool(dia, disponivel), esperado[i], `dia da semana ${i}`);
  }
});

test("pool parcial: só o que EXISTE no disco conta, ainda determinístico", () => {
  // No servidor estão todos; em cópia parcial (ou depois de perder um arquivo)
  // o índice encolhe pro que há — nunca 404 por apontar pra buraco.
  const disponivel = poolDisponivel(novoPoolDir(["pool-solo-1.png", "pool-solo-3.png", "pool-casal-2.png"]));
  assert.deepEqual(disponivel, { solo: ["pool-solo-1.png", "pool-solo-3.png"], casal: ["pool-casal-2.png"] });

  assert.equal(QUARTA.getDay(), 3);
  // quarta: solo 3 % 2 = 1 → pool-solo-3; casal 3 % 1 = 0 → pool-casal-2
  assert.deepEqual(escolherDoPool(QUARTA, disponivel), { solo: "pool-solo-3.png", casal: "pool-casal-2.png" });
});

test("hojeLocal usa a MESMA fórmula de data local do gerador", () => {
  assert.equal(hojeLocal(new Date(2026, 0, 4)), "2026-01-04");
  assert.equal(hojeLocal(new Date(2026, 11, 31, 23, 59, 59)), "2026-12-31");
  assert.ok(DATA_RE.test(hojeLocal(new Date())));
});

// ---------------------------------------------------------------------------
// 2) ALLOWLIST — o conjunto fechado que protege o filesystem
// ---------------------------------------------------------------------------

test("POOL_NOMES é EXATAMENTE os 8 arquivos do pool do servidor", () => {
  assert.deepEqual(
    [...POOL_NOMES].sort(),
    [
      "pool-casal-0.png",
      "pool-casal-1.png",
      "pool-casal-2.png",
      "pool-solo-0.png",
      "pool-solo-1.png",
      "pool-solo-2.png",
      "pool-solo-3.png",
      "pool-solo-4.png",
    ]
  );
});

test("nome hostil NUNCA está na allowlist (é o Set que barra o :nome da rota)", () => {
  // A rota do pool faz `if (!POOL_NOMES.has(nome)) → 400` antes de qualquer
  // path.join — estes são os nomes que ela recebe de fora e tem que barrar.
  for (const hostil of [
    "../../forja.sqlite",
    "..\\..\\forja.sqlite",
    "../2026-01-04/solo.png",
    "pool-solo-5.png", // fora da lista, mesmo seguindo o padrão
    "pool-casal-3.png",
    "pool-solo-00.png",
    "pool-solo-0.PNG", // allowlist é sensível a caixa: nome estável é nome exato
    "pool-solo-0.png ", // com espaço não é o mesmo nome
    "solo.png", // os nomes do card GERADO não abrem o pool
    "casal.png",
    "latest.json",
    "",
    "pool",
    42,
    null,
    undefined,
    { toString: () => "pool-solo-0.png" },
    ["pool-solo-0.png"],
  ]) {
    assert.equal(POOL_NOMES.has(hostil), false, `passou na allowlist: ${JSON.stringify(hostil)}`);
  }
});

test("intruso DENTRO de pool/ é invisível: a escolha sai sempre da allowlist", () => {
  // Mesmo que alguém largue um arquivo estranho no diretório, a
  // disponibilidade é a interseção com a allowlist — readdir cru não decide.
  const disponivel = poolDisponivel(
    novoPoolDir([...POOL_COMPLETO, "hacker.png", "pool-solo-9.png", "pool-casal-3.png", "nota.txt"])
  );
  assert.deepEqual(disponivel, { solo: [...POOL_SOLO], casal: [...POOL_CASAL] });

  for (let i = 0; i < 7; i++) {
    const escolha = escolherDoPool(new Date(2026, 0, 4 + i), disponivel);
    assert.ok(POOL_NOMES.has(escolha.solo), `solo fora da allowlist: ${escolha.solo}`);
    assert.ok(POOL_NOMES.has(escolha.casal), `casal fora da allowlist: ${escolha.casal}`);
  }
});

// ---------------------------------------------------------------------------
// 3) SEM POOL → COMPORTAMENTO ATUAL PRESERVADO (e nunca 500 por causa do pool)
// ---------------------------------------------------------------------------

test("pool/ inexistente, vazio ou sem um dos lados → pool inutilizável (null)", () => {
  // Diretório que não existe (dev local)
  assert.equal(poolDisponivel(novoPoolDir(null)), null);
  // Diretório vazio
  assert.equal(poolDisponivel(novoPoolDir([])), null);
  // Só solo, sem casal (a resposta tem os DOIS campos: é tudo ou nada)
  assert.equal(poolDisponivel(novoPoolDir(["pool-solo-0.png"])), null);
  // Só casal, sem solo
  assert.equal(poolDisponivel(novoPoolDir(["pool-casal-0.png"])), null);
  // E escolher de um pool inutilizável não explode nem inventa nome
  assert.equal(escolherDoPool(DOMINGO, null), null);
});

test("a tabela de decisão inteira do GET /api/daily-cards", () => {
  const HOJE = "2026-01-04";
  const escolha = { solo: "pool-solo-0.png", casal: "pool-casal-0.png" };

  // Card gerado HOJE sempre vence o pool — o cron voltar = pool sai de cena.
  assert.deepEqual(
    decidirCardDoDia({ manifesto: { date: HOJE }, hoje: HOJE, escolha }),
    { tipo: "gerado", date: HOJE }
  );
  assert.deepEqual(
    decidirCardDoDia({ manifesto: { date: HOJE }, hoje: HOJE, escolha: null }),
    { tipo: "gerado", date: HOJE }
  );

  // Manifesto VELHO ou AUSENTE com pool → pool, datado de hoje.
  assert.deepEqual(
    decidirCardDoDia({ manifesto: { date: "2026-01-03" }, hoje: HOJE, escolha }),
    { tipo: "pool", date: HOJE, solo: "pool-solo-0.png", casal: "pool-casal-0.png" }
  );
  assert.deepEqual(decidirCardDoDia({ manifesto: undefined, hoje: HOJE, escolha }), {
    tipo: "pool",
    date: HOJE,
    solo: "pool-solo-0.png",
    casal: "pool-casal-0.png",
  });
  // Manifesto CORROMPIDO com pool → pool serve, em vez do 500 (nunca pior).
  assert.deepEqual(decidirCardDoDia({ manifesto: { date: "lixo" }, hoje: HOJE, escolha }).tipo, "pool");
  assert.deepEqual(decidirCardDoDia({ manifesto: null, hoje: HOJE, escolha }).tipo, "pool");

  // SEM pool: exatamente o comportamento de antes, caso a caso.
  // a) nunca gerou nada → o 404 code no_cards_yet
  assert.deepEqual(decidirCardDoDia({ manifesto: undefined, hoje: HOJE, escolha: null }), {
    tipo: "sem_cards",
  });
  // b) manifesto corrompido → o 500 de sempre
  assert.deepEqual(decidirCardDoDia({ manifesto: { date: "lixo" }, hoje: HOJE, escolha: null }), {
    tipo: "manifesto_invalido",
  });
  assert.deepEqual(decidirCardDoDia({ manifesto: null, hoje: HOJE, escolha: null }), {
    tipo: "manifesto_invalido",
  });
  assert.deepEqual(
    decidirCardDoDia({ manifesto: { date: "04/01/2026" }, hoje: HOJE, escolha: null }),
    { tipo: "manifesto_invalido" }
  );
  // c) manifesto de ontem → serve ontem ("fundo de ontem ainda é um fundo bonito")
  assert.deepEqual(
    decidirCardDoDia({ manifesto: { date: "2026-01-03" }, hoje: HOJE, escolha: null }),
    { tipo: "gerado", date: "2026-01-03" }
  );
});
