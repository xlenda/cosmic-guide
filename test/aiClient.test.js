// Cobre o mecanismo de fallback honesto do cliente de IA (lib/aiClient.js):
// cada tela (ChatScreen, CoffeeScreen, PalmScreen, DiaryScreen...) faz
// try{fetchAiX()}catch{getMockX()}, mas esse mecanismo em si nunca tinha
// teste — o mesmo padrão já mascarou silenciosamente um bug real de produção
// (CORS) por um tempo. Achado real de auditoria (19/07/2026).
const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");
const {
  fetchAiChatReply, fetchAiPalmReading, fetchAiWeeklyInsight, fetchWithTimeout,
} = require("../lib/aiClient.js");

function mockFetchOnce(impl) {
  mock.method(globalThis, "fetch", impl);
}

test.afterEach(() => {
  mock.restoreAll();
});

test("fetchAiChatReply: resposta ok com reply válido retorna o texto", async () => {
  mockFetchOnce(async () => ({ ok: true, json: async () => ({ reply: "Olá! Como posso ajudar?" }) }));
  const reply = await fetchAiChatReply("luna", "oi", []);
  assert.equal(reply, "Olá! Como posso ajudar?");
});

test("fetchAiChatReply: resp.ok=false lança (backend fora do ar, CORS, 500 etc.)", async () => {
  mockFetchOnce(async () => ({ ok: false, status: 500, json: async () => ({}) }));
  await assert.rejects(() => fetchAiChatReply("luna", "oi", []), /chat falhou \(500\)/);
});

test("fetchAiChatReply: resposta ok mas sem campo reply (payload malformado) lança — nunca fabrica um texto", async () => {
  mockFetchOnce(async () => ({ ok: true, json: async () => ({}) }));
  await assert.rejects(() => fetchAiChatReply("luna", "oi", []), /resposta vazia\/malformada/);
});

test("fetchAiChatReply: reply em branco (só espaços) também conta como malformado", async () => {
  mockFetchOnce(async () => ({ ok: true, json: async () => ({ reply: "   " }) }));
  await assert.rejects(() => fetchAiChatReply("luna", "oi", []), /resposta vazia\/malformada/);
});

test("fetchAiPalmReading: resposta ok com title/body válidos retorna o objeto", async () => {
  mockFetchOnce(async () => ({
    ok: true,
    json: async () => ({ title: "Recomeços e coragem", body: "Sua linha da vida indica..." }),
  }));
  const reading = await fetchAiPalmReading("base64==", "image/jpeg");
  assert.deepEqual(reading, { title: "Recomeços e coragem", body: "Sua linha da vida indica..." });
});

test("fetchAiPalmReading: falta o campo body lança — nunca devolve leitura pela metade", async () => {
  mockFetchOnce(async () => ({ ok: true, json: async () => ({ title: "Só o título" }) }));
  await assert.rejects(() => fetchAiPalmReading("base64==", "image/jpeg"), /resposta vazia\/malformada/);
});

test("fetchAiWeeklyInsight: array de leituras de tipos diferentes retorna title/body", async () => {
  mockFetchOnce(async () => ({
    ok: true,
    json: async () => ({ title: "Uma semana de recomeços", body: "Entre o tarô e o sonho..." }),
  }));
  const readings = [
    { type: "tarot", typeLabel: "Tarô", title: "A Torre", body: "..." },
    { type: "dream", typeLabel: "Sonho", title: "Queda", body: "..." },
  ];
  const insight = await fetchAiWeeklyInsight(readings);
  assert.equal(insight.title, "Uma semana de recomeços");
});

test("fetchWithTimeout: aborta e rejeita quando a chamada trava além do timeout", async () => {
  mockFetchOnce((url, options) => new Promise((resolve, reject) => {
    options.signal.addEventListener("abort", () => reject(new Error("AbortError")));
  }));
  await assert.rejects(() => fetchWithTimeout("https://exemplo.com", {}, 10));
});
