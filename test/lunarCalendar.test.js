// Valida getMoonPhase contra os mesmos casos de referência REAIS já
// documentados/spot-checados no cabeçalho de lib/lunarCalendar.js (lua cheia e
// lua nova conhecidas de 2024) — ver skills/new-app-playbook/sensitive-calculations.md,
// Regra 1: nunca confiar em "rodou sem erro", validar contra um caso conhecido.
const test = require("node:test");
const assert = require("node:assert/strict");
const { getMoonPhase } = require("../lib/lunarCalendar.js");

test("lua cheia conhecida (25/jan/2024 17:54 UTC) é classificada como Lua Cheia com iluminação alta", () => {
  const result = getMoonPhase(new Date("2024-01-25T17:54:00Z"));
  assert.ok(result, "astronomy-engine precisa estar disponível pro teste rodar");
  assert.equal(result.name, "Lua Cheia");
  assert.ok(result.illumination >= 95, `esperado >=95% de iluminação, veio ${result.illumination}`);
});

test("lua nova conhecida (11/jan/2024 11:57 UTC) é classificada como Lua Nova com iluminação baixa", () => {
  const result = getMoonPhase(new Date("2024-01-11T11:57:00Z"));
  assert.ok(result);
  assert.equal(result.name, "Lua Nova");
  assert.ok(result.illumination <= 5, `esperado <=5% de iluminação, veio ${result.illumination}`);
});

test("getMoonPhase devolve null pra data inválida (nunca fabrica)", () => {
  assert.equal(getMoonPhase(new Date("data-invalida")), null);
});

test("todas as 8 fases têm nome, emoji e reflexão", () => {
  // 8 instantes espaçados 1/8 do ciclo sinódico (~29.53 dias) a partir da lua
  // nova conhecida acima — cobre as 8 fatias de PHASES sem depender de outra
  // efeméride externa.
  const newMoon = new Date("2024-01-11T11:57:00Z").getTime();
  const synodicMs = 29.53 * 24 * 60 * 60 * 1000;
  const seen = new Set();
  for (let i = 0; i < 8; i++) {
    const d = new Date(newMoon + (i / 8) * synodicMs);
    const result = getMoonPhase(d);
    assert.ok(result.name, `fase ${i}`);
    assert.ok(result.emoji, `fase ${i}`);
    assert.ok(result.reflexao, `fase ${i}`);
    seen.add(result.name);
  }
  assert.equal(seen.size, 8, "as 8 fatias devem cobrir as 8 fases distintas");
});

// ---------------------------------------------------------------------------
// A IDADE DA MOLDURA (portão acrescentado em 31/07/2026)
// ---------------------------------------------------------------------------
// docs/tradicao/04, §3.1 e §6: a divisão em OITO fases nomeadas, com leitura
// de cada uma, é de Dane Rudhyar, "The Lunation Cycle", 1967. A moldura
// milenar é a de QUATRO quartos (Ptolomeu, Tetrabiblos I.8). As oito reflexões
// abriam com "a tradição lunar milenar aponta…" / "na tradição lunar" — a base
// aponta isso arquivo por arquivo, e o teste existe para não deixar voltar.
test("nenhuma reflexão de fase vende a moldura de oito fases como antiga", () => {
  const newMoon = new Date("2024-01-11T11:57:00Z").getTime();
  const synodicMs = 29.53 * 24 * 60 * 60 * 1000;
  const PROIBIDO = [
    "tradição lunar milenar",
    "tradição milenar",
    "na tradição lunar",
    "leitura tradicional dos ciclos lunares",
    "leitura tradicional deste quarto",
  ];
  for (let i = 0; i < 8; i++) {
    const { name, reflexao } = getMoonPhase(new Date(newMoon + (i / 8) * synodicMs));
    const texto = reflexao.toLowerCase();
    for (const termo of PROIBIDO) {
      assert.ok(
        !texto.includes(termo),
        `${name}: "${termo}" credita a Rudhyar (1967) uma idade que ele não tem.`
      );
    }
  }
});

test("a Lua Cheia não inverte Plínio: colher para guardar é minguante", () => {
  // Plínio, Naturalis Historia XVIII.321: tudo que se corta, se colhe e se
  // tosquia sofre menos dano com a lua DECRESCENTE. Columela XI.2.85 põe na
  // cheia o semear fava. O texto da fase cheia dizia "momento de colher", o
  // que inverte a fonte — e o app já afirma o contrário no cartão do quarto
  // lunar do horóscopo (lib/i18n.js, 'horoscope.sky.quarter.*'). Contradizer-se
  // de uma tela para a outra sobre a MESMA fonte é o pior dos dois mundos.
  const cheia = getMoonPhase(new Date("2024-01-25T17:54:00Z"));
  assert.equal(cheia.name, "Lua Cheia");
  assert.ok(
    !/momento de colher|hora de colher/i.test(cheia.reflexao),
    "a Lua Cheia voltou a se vender como hora de colher, contra Plínio XVIII.321"
  );
  assert.ok(
    /XVIII\.321|minguante|Columela/i.test(cheia.reflexao),
    "a Lua Cheia deveria nomear a fonte que corrige o clichê"
  );
});
