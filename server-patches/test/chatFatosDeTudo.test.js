// O CHAT DIZIA QUE A PESQUISA NAO DATOU O QUE ELA DATOU — achado da auditoria
// de 02/08/2026.
//
// As personas do Chat (Órbi e as antigas Luna/Arcano) recebem
// a lista de fatos do proprio dominio. A regra de disciplina de fonte manda
// dizer "a pesquisa do app nao localizou fonte datada" quando o fato nao esta
// no prompt — entao, perguntando a Luna sobre linha da mao ou sobre sonho, ela
// seguia a regra a risca e negava datacao que existe, e que o proprio app
// mostra em OUTRA tela. O app desmentindo a si mesmo, com falsa modestia.
//
// A distincao que estes testes travam:
//
//   LEITURA  = um assunto so  -> fatos do assunto, e so eles. Uma leitura de
//              mao citando data de taro seria ruido, nao honestidade.
//   CONVERSA = qualquer assunto -> todos os fatos, porque a pessoa pergunta o
//              que quiser e a alternativa e o app mentir que nao sabe.
const test = require("node:test");
const assert = require("node:assert/strict");

const { PROMPTS } = require("../src/infrastructure/AnthropicChatProvider");

// Uma marca inconfundivel de cada lista de fatos — nome proprio que so aparece
// naquela e em nenhuma outra. As marcas foram TIRADAS das listas, nao
// chutadas: as duas primeiras que escrevi de cabeca ("Saunders" pra pintas,
// "reflexologia" pros pes) nao existiam em lugar nenhum, e o teste acusou
// falta de fato que estava la.
const MARCAS = {
  astrologia: /Tetrabiblos/,
  taro: /Gebelin|Marselha|Waite/,
  quiromancia: /Hartlieb|Chiromantia|Indagine/i,
  tasseografia: /Kent|Tea Leaves/i,
  fisiognomonia: /Della Porta|Lavater/i,
  moleosofia: /Melampo|Altenburg/i,
  pes: /Varāhamihira|samudrika/i,
  sonhos: /Artemidoro|Oneirocritica/,
};

const CONVERSAS = ["persona-orbi", "persona-luna", "persona-arcano"];
const LEITURAS = ["palm", "coffee", "face", "foot", "moles", "dream", "tarot"];

test("todas as personas compatíveis do Chat carregam TODAS as listas de fatos", () => {
  for (const chave of CONVERSAS) {
    const prompt = PROMPTS[chave];
    assert.ok(prompt, `${chave} precisa existir`);
    const faltando = Object.entries(MARCAS)
      .filter(([, re]) => !re.test(prompt))
      .map(([nome]) => nome);
    assert.deepEqual(
      faltando,
      [],
      `${chave} nao recebeu os fatos de: ${faltando.join(", ")} — perguntar sobre isso faria o Chat negar datacao que existe`
    );
  }
});

test("as LEITURAS continuam restritas ao proprio assunto — a correcao nao vazou pra elas", () => {
  // A leitura de mao nao pode citar Artemidoro nem Gebelin: seria mudar de
  // assunto no meio de uma leitura de mao.
  assert.doesNotMatch(PROMPTS.palm, MARCAS.sonhos, "palm nao pode carregar fatos de sonhos");
  assert.doesNotMatch(PROMPTS.palm, MARCAS.taro, "palm nao pode carregar fatos de taro");
  assert.doesNotMatch(PROMPTS.dream, MARCAS.quiromancia, "dream nao pode carregar fatos de quiromancia");
  assert.doesNotMatch(PROMPTS.tarot, MARCAS.sonhos, "tarot nao pode carregar fatos de sonhos");
});

test("cada leitura carrega os fatos do PROPRIO assunto", () => {
  const esperado = {
    palm: "quiromancia",
    coffee: "tasseografia",
    face: "fisiognomonia",
    foot: "pes",
    moles: "moleosofia",
    dream: "sonhos",
    tarot: "taro",
  };
  for (const [chave, assunto] of Object.entries(esperado)) {
    assert.match(PROMPTS[chave], MARCAS[assunto], `${chave} perdeu os fatos de ${assunto}`);
  }
});

test("a regra de nao inventar continua valendo em todo prompt que tem fatos", () => {
  for (const chave of [...CONVERSAS, ...LEITURAS]) {
    assert.match(
      PROMPTS[chave],
      /FATOS DATADOS QUE VOCÊ PODE CITAR — e SOMENTE estes/,
      `${chave} perdeu a fronteira "e SOMENTE estes"`
    );
  }
});

test("o prompt do Chat nao explodiu de tamanho — o custo por conversa continua sob controle", () => {
  // ~2.000 tokens de fatos e o teto aceito (o system e cacheado, entao isso e
  // leitura de cache a 0,1x). Se um dia passar disso, e decisao consciente.
  for (const chave of CONVERSAS) {
    assert.ok(
      PROMPTS[chave].length < 26000,
      `${chave} esta com ${PROMPTS[chave].length} chars — reveja antes de deixar crescer`
    );
  }
});
