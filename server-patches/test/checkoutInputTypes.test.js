// O 500 REAL que o log de produção mostrou em 03/08/2026:
//
//   [api/checkout/initiate] erro: SQLite3 can only bind numbers, strings,
//   bigints, buffers, and null
//
// Um body com campo não-string (objeto, array, número) passava batido pela
// rota — `plan || null` não filtra objeto, que é truthy — e só quebrava lá
// embaixo, no driver do SQLite, virando 500 na rota de PAGAMENTO.
//
// Estes testes travam o contrato do jeito certo: tipo errado morre com 400 na
// porta, e o caminho normal (string, ausente, null) continua passando.
const test = require("node:test");
const assert = require("node:assert/strict");

// A checagem em si, copiada da rota — o objetivo aqui é travar a REGRA, não
// subir o Express inteiro (que exigiria banco, Supabase e chave da Hotmart).
function validarTipos(body) {
  const { coupleName, customerEmail, plan, scope } = body || {};
  for (const [nome, valor] of [
    ["coupleName", coupleName],
    ["customerEmail", customerEmail],
    ["plan", plan],
    ["scope", scope],
  ]) {
    if (valor !== undefined && valor !== null && typeof valor !== "string") {
      return { status: 400, error: `${nome} deve ser texto` };
    }
  }
  return null;
}

test("o body que quebrou a produção agora para com 400, não com 500", () => {
  for (const ruim of [
    { plan: { nome: "trial" } },
    { plan: ["trial"] },
    { coupleName: { a: "Ana", b: "Bruno" } },
    { customerEmail: ["a@b.com"] },
    { scope: 1 },
    { plan: true },
  ]) {
    const r = validarTipos(ruim);
    assert.ok(r, `deveria recusar: ${JSON.stringify(ruim)}`);
    assert.equal(r.status, 400);
  }
});

test("o caminho normal continua passando — string, ausente e null", () => {
  assert.equal(validarTipos({ plan: "trial", customerEmail: "a@b.com", coupleName: "Ana e Bruno", scope: "couple" }), null);
  assert.equal(validarTipos({}), null);
  assert.equal(validarTipos(null), null);
  assert.equal(validarTipos({ coupleName: null, plan: null, scope: null, customerEmail: null }), null);
});

test("a mensagem diz QUAL campo está errado, sem vazar detalhe interno", () => {
  const r = validarTipos({ plan: {} });
  assert.equal(r.error, "plan deve ser texto");
  assert.ok(!/SQLite|bind|driver/i.test(r.error), "nunca expor o driver pro cliente");
});
