// Cliente do proxy de IA real (Anthropic) — mesmo domínio/backend do checkout
// (api-forja, ver lib/coupleData.js). A chave da Anthropic mora só no
// servidor; o app nunca tem acesso a ela, só chama esses endpoints.
//
// DUAS COISAS NOVAS AQUI (30/07/2026), e as duas existem pelo mesmo motivo: o
// paywall passou a ser DE VERDADE, no servidor (server-patches/src/http/aiQuota.js
// + migração 011). Até então o único freio de pagamento era o AsyncStorage
// deste aparelho — um localStorage.clear() no DevTools devolvia as 9 leituras
// grátis, e um curl sem token nenhum torrava a conta Anthropic do dono.
//
//   1. TOKEN. Toda chamada sai com o JWT do Supabase quando existe sessão. Sem
//      ele o servidor não tem como contar a cota POR CONTA (só sobraria contar
//      por IP, que é o que a pessoa troca de graça) e o assinante seria tratado
//      como anônimo — levaria paywall depois de pagar.
//
//   2. ERRO TIPADO. "Sem cota" e "falha técnica" não são a mesma coisa: quando
//      o servidor responde com um `code` conhecido, sobe AiAccessError e a tela
//      abre o caminho de conta/assinatura. Qualquer outra falha preserva a
//      entrada e informa que a leitura não foi gerada — nunca finge que um
//      texto local analisou mensagem, sonho ou foto.
const API_BASE = 'https://api.cosmicguide.cloud';

// Envolve fetch() com timeout/abort: sem isso, uma requisição travada (rede
// instável, captive portal, troca de rede no meio do request) nunca resolve
// nem rejeita a promise, deixando os flags de loading (isTyping/isAnalyzing/
// isInterpreting) presos em true para sempre nas telas que chamam este client.
export async function fetchWithTimeout(url, options, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

// --- token da sessão --------------------------------------------------------
// POR QUE INJETADO em vez de importado: quem sabe o token é
// lib/accountSubscription.js (getAuthToken), e esse módulo importa o Supabase,
// que arrasta `react-native` junto. Importar de lá pra cá quebraria os testes
// de node:test que exercitam ESTE arquivo direto (test/aiClient.test.js) — e
// importar ao contrário seria ciclo, porque accountSubscription já depende do
// fetchWithTimeout daqui. Então quem TEM o token se registra, uma vez, no
// carregamento do módulo (ver o fim de lib/accountSubscription.js).
//
// Enquanto ninguém registrar, as chamadas simplesmente saem sem Authorization —
// que é exatamente o comportamento de quem está deslogado. Nada quebra.
let authTokenProvider = null;

export function setAuthTokenProvider(fn) {
  authTokenProvider = typeof fn === 'function' ? fn : null;
}

async function authHeaders() {
  if (!authTokenProvider) return {};
  try {
    const token = await authTokenProvider();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    // Falha ao ler a sessão nunca pode impedir a chamada: segue como anônimo.
    return {};
  }
}

// --- idioma da resposta ------------------------------------------------------
// O app é vendido em 3 línguas, mas até 03/08/2026 NENHUMA chamada de IA dizia
// qual: os prompts do servidor são escritos em português, então um assinante
// espanhol ou inglês pagava e recebia a leitura inteira em português. O idioma
// da interface vive no LanguageContext (React, arrasta react-native junto),
// então entra pela mesma porta injetada do token — importar de lá pra cá
// quebraria test/aiClient.test.js, que roda em node:test puro.
//
// Sem ninguém registrado, sai 'pt' — o comportamento de antes, intacto.
let languageProvider = null;

export function setLanguageProvider(fn) {
  languageProvider = typeof fn === 'function' ? fn : null;
}

function currentLang() {
  if (!languageProvider) return 'pt';
  try {
    const lang = languageProvider();
    return lang === 'es' || lang === 'en' ? lang : 'pt';
  } catch {
    return 'pt';
  }
}

// --- erros de acesso (paywall), separados de erro técnico --------------------
export const AI_QUOTA_EXHAUSTED = 'quota_exhausted';
export const AI_LOGIN_REQUIRED = 'login_required';

export class AiAccessError extends Error {
  constructor({ code, status, scope = null, loginHelps = false, message }) {
    super(message || `IA indisponível (${code})`);
    this.name = 'AiAccessError';
    this.code = code;
    this.status = status;
    // 'account' | 'ip' | 'vision' — de onde veio o bloqueio, pra tela saber se
    // o próximo passo é criar conta ou assinar.
    this.scope = scope;
    this.loginHelps = loginHelps;
  }
}

// As telas usam SÓ estas três funções — nunca comparam status/código na mão.
export function isAiAccessError(err) {
  return Boolean(err) && err.name === 'AiAccessError';
}

export function isQuotaExhausted(err) {
  return isAiAccessError(err) && err.code === AI_QUOTA_EXHAUSTED;
}

export function isLoginRequired(err) {
  return isAiAccessError(err) && err.code === AI_LOGIN_REQUIRED;
}

async function safeJson(resp) {
  try {
    return await resp.json();
  } catch {
    return null;
  }
}

// POST comum a todas as rotas de IA. `label` mantém as mensagens de erro
// exatamente como eram ("chat falhou (500)"), que é o que aparece no log e o
// que os testes existentes travam.
async function postAi(path, label, body) {
  const resp = await fetchWithTimeout(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    // `lang` entra AQUI, num lugar só, e não em cada fetchAiX: assim nenhuma
    // feature nova pode esquecer de mandar. O body vem depois pra que um
    // chamador que já tenha `lang` próprio continue mandando o dele.
    body: JSON.stringify({ lang: currentLang(), ...body }),
  });

  if (!resp.ok) {
    const data = await safeJson(resp);
    const code = data && typeof data.code === 'string' ? data.code : null;
    // SÓ um `code` que o servidor mandou de propósito vira AiAccessError. Um
    // 402/401 sem corpo reconhecível continua sendo erro técnico genérico —
    // nada de abrir paywall por causa de um proxy no caminho.
    if (code === AI_QUOTA_EXHAUSTED || code === AI_LOGIN_REQUIRED) {
      throw new AiAccessError({
        code,
        status: resp.status,
        scope: data.scope || null,
        loginHelps: Boolean(data.loginHelps),
        message: data.error || `${label} bloqueado (${resp.status})`,
      });
    }
    throw new Error(`${label} falhou (${resp.status})`);
  }

  return resp.json();
}

function exigirTexto(data, campo, label) {
  if (!data || typeof data[campo] !== 'string' || !data[campo].trim()) {
    throw new Error(`${label} retornou resposta vazia/malformada`);
  }
}

function exigirTituloECorpo(data, label) {
  if (
    !data ||
    typeof data.title !== 'string' ||
    typeof data.body !== 'string' ||
    !data.title.trim() ||
    !data.body.trim()
  ) {
    throw new Error(`${label} retornou resposta vazia/malformada`);
  }
  return data;
}

export async function fetchAiChatReply(personaId, message, history) {
  const data = await postAi('/api/chat', 'chat', { personaId, message, history });
  exigirTexto(data, 'reply', 'chat');
  return data.reply;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiPalmReading(imageBase64, mediaType) {
  return exigirTituloECorpo(await postAi('/api/palm', 'palm', { imageBase64, mediaType }), 'palm');
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiFaceReading(imageBase64, mediaType) {
  return exigirTituloECorpo(await postAi('/api/face', 'face', { imageBase64, mediaType }), 'face');
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiFootReading(imageBase64, mediaType) {
  return exigirTituloECorpo(await postAi('/api/foot', 'foot', { imageBase64, mediaType }), 'foot');
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiMolesReading(imageBase64, mediaType) {
  return exigirTituloECorpo(await postAi('/api/moles', 'moles', { imageBase64, mediaType }), 'moles');
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiCoffeeReading(imageBase64, mediaType) {
  return exigirTituloECorpo(await postAi('/api/coffee', 'coffee', { imageBase64, mediaType }), 'coffee');
}

// readings: array de até 7 { title, body } já recebidos de verdade (lib/coffeeHistory.js).
export async function fetchAiCoffeeWeeklySummary(readings) {
  return exigirTituloECorpo(
    await postAi('/api/coffee-weekly-summary', 'coffee-weekly-summary', { readings }),
    'coffee-weekly-summary'
  );
}

// transcript: texto bruto que a pessoa falou (via Web Speech API). Retorna
// { enhanced } — a versão organizada pela IA, nunca substitui o original.
export async function fetchAiEnhancedInsight(transcript, readingType, readingTitle) {
  const data = await postAi('/api/enhance-insight', 'enhance-insight', {
    transcript,
    readingType,
    readingTitle,
  });
  exigirTexto(data, 'enhanced', 'enhance-insight');
  return data.enhanced;
}

// readings: array de até 7 { type, typeLabel, title, body } de QUALQUER tipo
// de leitura do Diário Cósmico (não só café). Retorna { title, body }.
export async function fetchAiWeeklyInsight(readings, extras) {
  // `extras` (04/08/2026): o placar do check-in diário — o dado mais pessoal
  // que a síntese pode receber. Opcional: sem ele, o corpo é o de sempre.
  return exigirTituloECorpo(await postAi('/api/weekly-insight', 'weekly-insight', { readings, ...(extras ? { extras } : {}) }), 'weekly-insight');
}

// dreamText: descrição livre do sonho digitada pela pessoa. Retorna { title, body }.
export async function fetchAiDreamReading(dreamText) {
  return exigirTituloECorpo(await postAi('/api/dream', 'dream', { dreamText }), 'dream');
}
