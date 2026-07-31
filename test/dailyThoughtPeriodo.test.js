// Variação por período do pensamento do dia (Frente 6): o motor determinístico
// de getThoughtForDate NÃO muda — só a frase de abertura varia entre manhã,
// tarde e noite. Data de referência é a mesma já validada em
// test/dailyThought.test.js e test/lunarCalendar.test.js (25/jan/2024 =
// Lua Cheia real, quinta-feira).
const test = require("node:test");
const assert = require("node:assert/strict");
const {
  periodoDoDia,
  getTodaysThought,
  getThoughtForDate,
  ABERTURA_POR_PERIODO,
} = require("../lib/dailyThought.js");

// Mesmo dia LOCAL em três horários — o pensamento-base é ancorado à data
// (meio-dia UTC), então só a abertura pode variar entre eles.
const diaAs = (hora, minuto = 0) => new Date(2024, 0, 25, hora, minuto, 0);

test("periodoDoDia acerta as bordas exatas dos três períodos", () => {
  assert.equal(periodoDoDia(diaAs(4, 59)), "noite", "4h59 ainda é noite");
  assert.equal(periodoDoDia(diaAs(5, 0)), "manha", "5h em ponto vira manhã");
  assert.equal(periodoDoDia(diaAs(11, 59)), "manha", "11h59 ainda é manhã");
  assert.equal(periodoDoDia(diaAs(12, 0)), "tarde", "12h em ponto vira tarde");
  assert.equal(periodoDoDia(diaAs(17, 59)), "tarde", "17h59 ainda é tarde");
  assert.equal(periodoDoDia(diaAs(18, 0)), "noite", "18h em ponto vira noite");
  assert.equal(periodoDoDia(diaAs(23, 59)), "noite", "23h59 é noite");
  assert.equal(periodoDoDia(diaAs(0, 0)), "noite", "meia-noite é noite");
});

test("os três períodos devolvem aberturas distintas entre si", () => {
  const { manha, tarde, noite } = ABERTURA_POR_PERIODO;
  assert.ok(manha && tarde && noite, "as três aberturas existem");
  assert.notEqual(manha, tarde);
  assert.notEqual(tarde, noite);
  assert.notEqual(manha, noite);

  const m = getTodaysThought(null, diaAs(8));
  const t = getTodaysThought(null, diaAs(14));
  const n = getTodaysThought(null, diaAs(21));
  assert.notEqual(m, t);
  assert.notEqual(t, n);
  assert.notEqual(m, n);
});

test("o corpo do pensamento é o MESMO nos três períodos (o motor do dia não mudou)", () => {
  const base = getThoughtForDate(diaAs(12));
  assert.equal(getTodaysThought(null, diaAs(8)), `${ABERTURA_POR_PERIODO.manha} ${base}`);
  assert.equal(getTodaysThought(null, diaAs(14)), `${ABERTURA_POR_PERIODO.tarde} ${base}`);
  assert.equal(getTodaysThought(null, diaAs(21)), `${ABERTURA_POR_PERIODO.noite} ${base}`);
});

test("getThoughtForDate continua sem abertura de período (motor intocado)", () => {
  const base = getThoughtForDate(diaAs(12));
  for (const abertura of Object.values(ABERTURA_POR_PERIODO)) {
    assert.ok(!base.startsWith(abertura), `motor ganhou abertura indevida: ${abertura}`);
  }
});

test("é determinístico: mesma data e hora sempre devolvem o mesmo texto", () => {
  assert.equal(getTodaysThought(null, diaAs(9)), getTodaysThought(null, diaAs(9)));
});

test("abertura vem primeiro e a saudação do signo continua logo depois", () => {
  const out = getTodaysThought({ name: "Touro", icon: "♉" }, diaAs(8));
  assert.ok(out.startsWith(ABERTURA_POR_PERIODO.manha), out);
  assert.ok(out.includes("♉ Touro,"), out);
  assert.ok(out.includes("Lua Cheia"), out);
});

test("assinatura antiga continua funcionando: sem data, recebe o período de agora", () => {
  const out = getTodaysThought();
  const aberturas = Object.values(ABERTURA_POR_PERIODO);
  const abertura = aberturas.find((a) => out.startsWith(a));
  assert.ok(abertura, `texto não começa com nenhuma abertura conhecida: ${out}`);
  // depois da abertura vem o pensamento-base de verdade, não string vazia
  assert.ok(out.length > abertura.length + 10, out);
});

test("assinatura antiga com signo pessoal continua endereçando a pessoa", () => {
  const out = getTodaysThought({ name: "Touro", icon: "♉" });
  assert.ok(out.includes("♉ Touro,"), out);
});

test("nenhuma palavra proibida nas aberturas nem no texto completo dos três períodos", () => {
  // Regra de PALAVRA (linha vermelha do app): estas cinco são proibidas em
  // qualquer conteúdo, independente da intenção da frase.
  const PROIBIDAS = /(aliviar|acalmar|curar|tratar|energizar)/i;
  for (const abertura of Object.values(ABERTURA_POR_PERIODO)) {
    assert.ok(!PROIBIDAS.test(abertura), abertura);
  }
  for (const hora of [8, 14, 21]) {
    const out = getTodaysThought({ name: "Touro", icon: "♉" }, diaAs(hora));
    assert.ok(!PROIBIDAS.test(out), out);
  }
});
