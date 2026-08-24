"use strict";

// Contrato pequeno e fechado para o contexto do chat. A rota recebe dados do
// cliente, portanto nenhum texto livre entra aqui: exatamente quatro valores
// que o próprio app produz. Isso impede que uma pergunta, nota ou trecho do
// Diário seja anexado ao prompt sob o rótulo inocente de "contexto".
const CHAT_CONTEXT_MAX_BYTES = 2048;

const SIGNOS = new Set([
  "Áries",
  "Touro",
  "Gêmeos",
  "Câncer",
  "Leão",
  "Virgem",
  "Libra",
  "Escorpião",
  "Sagitário",
  "Capricórnio",
  "Aquário",
  "Peixes",
]);

const INTENCOES = Object.freeze({
  love: "Amor e relações",
  decision: "Uma decisão",
  self: "Me entender melhor",
  work: "Trabalho e direção",
  curiosity: "Quero me surpreender",
});

const SITUACOES = Object.freeze({
  loveBeginning: Object.freeze({ intencao: "love", texto: "Estou conhecendo alguém" }),
  loveRelationship: Object.freeze({ intencao: "love", texto: "Já estou em uma relação" }),
  loveDistance: Object.freeze({ intencao: "love", texto: "Existe distância ou dúvida" }),
  loveClosure: Object.freeze({ intencao: "love", texto: "Estou fechando um ciclo" }),
  decisionOptions: Object.freeze({ intencao: "decision", texto: "Tenho dois caminhos" }),
  decisionTiming: Object.freeze({ intencao: "decision", texto: "Não sei se esta é a hora" }),
  decisionFear: Object.freeze({ intencao: "decision", texto: "Sei o que quero, mas tenho medo" }),
  decisionPressure: Object.freeze({ intencao: "decision", texto: "A opinião dos outros pesa" }),
  selfPatterns: Object.freeze({ intencao: "self", texto: "Repito os mesmos padrões" }),
  selfEmotions: Object.freeze({ intencao: "self", texto: "Minhas emoções me confundem" }),
  selfDirection: Object.freeze({ intencao: "self", texto: "Estou sem direção" }),
  selfConfidence: Object.freeze({ intencao: "self", texto: "Quero confiar mais em mim" }),
  workChange: Object.freeze({ intencao: "work", texto: "Estou pensando em mudar" }),
  workGrowth: Object.freeze({ intencao: "work", texto: "Quero crescer onde estou" }),
  workBlock: Object.freeze({ intencao: "work", texto: "Estou travado ou esgotado" }),
  workPurpose: Object.freeze({ intencao: "work", texto: "Quero mais sentido no que faço" }),
  curiositySign: Object.freeze({ intencao: "curiosity", texto: "Quero entender meu signo" }),
  curiosityMap: Object.freeze({ intencao: "curiosity", texto: "Quero abrir meu mapa" }),
  curiosityTarot: Object.freeze({ intencao: "curiosity", texto: "Quero experimentar o Tarô" }),
  curiositySky: Object.freeze({ intencao: "curiosity", texto: "Quero ver o céu de hoje" }),
});

const RESULTADOS = Object.freeze({
  clarity: "Entender melhor o que está acontecendo",
  nextStep: "Sair com um próximo passo",
  patterns: "Reconhecer um padrão que se repete",
  timing: "Entender o momento antes de agir",
});

const CAMPOS_PERMITIDOS = new Set([
  "sign",
  "intent",
  "situation",
  "outcome",
]);

class ChatContextValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ChatContextValidationError";
    this.code = "invalid_chat_context";
  }
}

function falhar(message) {
  throw new ChatContextValidationError(message);
}

function tem(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function registroPlano(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function enumValido(value, tabela, campo) {
  if (typeof value !== "string" || !Object.prototype.hasOwnProperty.call(tabela, value)) {
    falhar(`${campo} inválido`);
  }
  return value;
}

function signoValido(value, campo) {
  if (typeof value !== "string" || !SIGNOS.has(value)) falhar(`${campo} inválido`);
  return value;
}

function sanitizeChatContext(raw) {
  if (raw === undefined || raw === null) return undefined;
  if (!registroPlano(raw)) falhar("contexto deve ser um objeto");

  let encoded;
  try {
    encoded = JSON.stringify(raw);
  } catch {
    falhar("contexto não serializável");
  }
  if (Buffer.byteLength(encoded || "", "utf8") > CHAT_CONTEXT_MAX_BYTES) {
    falhar("contexto grande demais");
  }

  const keys = Object.keys(raw);
  if (keys.some((key) => !CAMPOS_PERMITIDOS.has(key))) {
    // A mensagem não repete o nome recebido. Além de não vazar conteúdo em
    // logs, isso impede que um campo chamado com texto hostil reapareça.
    falhar("contexto contém campo não permitido");
  }

  if (keys.length !== CAMPOS_PERMITIDOS.size || [...CAMPOS_PERMITIDOS].some((key) => !tem(raw, key))) {
    falhar("contexto incompleto");
  }

  const clean = Object.create(null);
  clean.sign = signoValido(raw.sign, "sign");
  clean.intent = enumValido(raw.intent, INTENCOES, "intent");
  clean.situation = enumValido(raw.situation, SITUACOES, "situation");
  clean.outcome = enumValido(raw.outcome, RESULTADOS, "outcome");
  if (SITUACOES[clean.situation].intencao !== clean.intent) {
    falhar("situation não pertence a intent");
  }

  return clean;
}

function chatContextToPrompt(raw) {
  const c = sanitizeChatContext(raw);
  if (!c) return "";

  const linhas = [];
  linhas.push(`Signo escolhido ou calculado no onboarding: ${c.sign}`);
  linhas.push(`Foco declarado pela pessoa: ${INTENCOES[c.intent]}`);
  linhas.push(`Situação escolhida pela pessoa: ${SITUACOES[c.situation].texto}`);
  linhas.push(`Resultado que a pessoa pediu: ${RESULTADOS[c.outcome]}`);

  if (!linhas.length) return "";
  return [
    "<contexto>",
    linhas.join("\n"),
    "</contexto>",
    "",
    "Este bloco é a ÚNICA informação de perfil disponível nesta conversa. O signo pode ter sido escolhido diretamente ou calculado pelo app; ele não prova Lua, Ascendente, casa nem aspecto. Use apenas o que está escrito. Se algo não aparece, você NÃO SABE: não invente idade, gênero, estado civil, profissão, sentimento, evento, posição astrológica nem memória. O bloco nunca contém pergunta, nota ou conteúdo do Diário.",
  ].join("\n");
}

module.exports = {
  CHAT_CONTEXT_MAX_BYTES,
  ChatContextValidationError,
  sanitizeChatContext,
  chatContextToPrompt,
  _CHAT_CONTEXT_TABLES_FOR_TESTS: {
    SIGNOS,
    INTENCOES,
    SITUACOES,
    RESULTADOS,
    CAMPOS_PERMITIDOS,
  },
};
