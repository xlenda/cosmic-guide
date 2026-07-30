// Camada de dados do casal — lê/escreve no AsyncStorage os dados que a Home
// precisa exibir (nomes, signos, sequência/streak, contagem de memórias).
// Porta o esquema de chaves de c:/tmp/gilfforever/web/lib/activity.js
// (gff:${voce}:${amor}, gff-streak:${voce}:${amor}) para que uma futura tela
// de quiz/onboarding e a futura Timeline possam reaproveitar exatamente as
// mesmas chaves. Diferente do localStorage original, TODO método aqui é
// assíncrono — AsyncStorage.getItem/setItem sempre retornam Promise.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { fetchWithTimeout } from './aiClient';

// Backend real (api-forja) — mesmo usado pelo funil web (gilfforever/web). Gera o
// correlationCode e o checkoutConfig do Hotmart server-side, e depois expõe o
// status da assinatura por esse código. Nenhuma mudança no backend é necessária.
const API_BASE = 'https://api.cosmicguide.cloud';

// Perfil do casal (nomes + signos) ainda não tem uma tela de quiz nesta versão
// do RN app, então guardamos numa chave própria e simples até essa tela existir.
const PROFILE_KEY = 'gff-couple-profile';

// Signo do modo solo (usuário sem parceiro) — mesma chave/formato que
// HoroscopeScreen.js já usa no seletor de signo (JSON.stringify do objeto de
// theme.js zodiacSigns). Ver plano de onboarding solo-vs-casal: reaproveita a
// chave existente em vez de forçar esse caso dentro do shape do casal.
const USER_SIGN_KEY = 'userSign';

// Data/hora de nascimento são mais sensíveis (dão base pra terceiros calcularem
// idade/identidade), então ficam no SecureStore (Keychain/Keystore) em vez do
// AsyncStorage — mesmo dispositivo, mesmo app, mas camada de armazenamento
// separada e criptografada.
const SECURE_BIRTH_A_KEY = 'gff-birth-a';
const SECURE_BIRTH_B_KEY = 'gff-birth-b';

// ...MAS o expo-secure-store não tem implementação na WEB — que é justamente
// como este app é publicado. `node_modules/expo-secure-store/build/
// ExpoSecureStore.web.js` é literalmente `export default {}`, então
// SecureStore.setItemAsync() chama `undefined(...)` e lança
// `TypeError: setValueWithKeyAsync is not a function` em TODA gravação web.
// Espelho em AsyncStorage pra web — mesmo padrão já usado em lib/birthData.js
// (SOLO_BIRTH_MIRROR_KEY) e em screens/BirthChartScreen.js. Só é escrito
// quando o SecureStore realmente falha: no celular (iOS/Android) nada muda, a
// data continua exclusivamente no Keychain/Keystore criptografado.
const MIRROR_BIRTH_A_KEY = 'gff-birth-a-mirror';
const MIRROR_BIRTH_B_KEY = 'gff-birth-b-mirror';

// Nascimento do modo SOLO (Mapa Astral) — escrito FORA deste módulo:
//   - 'birthChartSolo'  (SecureStore) e 'birthChartCities' (SecureStore) por
//     screens/BirthChartScreen.js (writeSecureItem);
//   - 'birth-solo-mirror' (AsyncStorage) por lib/birthData.js
//     (saveSoloBirthMirror), que é o que de fato persiste na WEB, onde o
//     SecureStore é um stub vazio.
// Mesmo escritas por outros arquivos, elas precisam morrer aqui: esta função é
// o ÚNICO "apagar meus dados" do app (context/CoupleContext.clearAll). Antes,
// ela só apagava o nascimento do CASAL — a data de nascimento solo continuava
// viva no localStorage de todo usuário web depois de "apagar meus dados"
// (achado real de auditoria de privacidade, 26/07/2026).
const SECURE_BIRTH_SOLO_KEY = 'birthChartSolo';
const SECURE_BIRTH_CITIES_KEY = 'birthChartCities';
const SOLO_BIRTH_MIRROR_KEY = 'birth-solo-mirror';

// Nome do espelho AsyncStorage de uma chave do SecureStore. Desde 27/07/2026 o
// BirthChartScreen espelha birthChartSolo/birthChartCities com exatamente este
// sufixo (via readSecureItemWithMirror/writeSecureItemWithMirror de
// lib/birthData.js) — então estas duas remoções abaixo são o que impede o
// nascimento/cidade do Mapa Astral solo de sobreviver a "apagar meus dados"
// no localStorage de todo usuário web.
function mirrorKeyFor(secureKey) {
  return `${secureKey}-mirror`;
}

function streakKey(voce, amor) {
  return `gff-streak:${voce}:${amor}`;
}
function timelineKey(voce, amor) {
  return `gff:${voce}:${amor}`;
}
function reconectarKey(voce, amor) {
  return `gff-reconectar:${voce}:${amor}`;
}
function descobrirKey(voce, amor) {
  return `gff-descobrir:${voce}:${amor}`;
}
function agirKey(voce, amor) {
  return `gff-agir:${voce}:${amor}`;
}
// Mesma chave usada pelo funil web (localStorage) — aqui via AsyncStorage.
function correlationKey(voce, amor) {
  return `gff-correlation:${voce}:${amor}`;
}
// Assinatura SOLO (usuário sem parceiro pareado) — identidade é o e-mail de
// login (só existe login na hora de assinar, ver PlanosScreen.js), nunca o
// par voce/amor (que não existe pra quem usa sozinho). Chave própria, nunca
// reaproveita correlationKey — evita colidir/confundir uma assinatura solo
// com uma de casal caso a mesma pessoa forme um casal depois.
function soloCorrelationKey(email) {
  return `gff-correlation:solo:${email}`;
}

// Serializa escritas concorrentes contra a MESMA chave do AsyncStorage. Cada
// mutator abaixo faz um read-modify-write do blob inteiro; sem isso, dois
// toques quase simultâneos no mesmo botão (ou dois botões que mexem na mesma
// chave) podem ler o mesmo estado "antigo" e um deles sobrescrever o outro ao
// gravar. withWriteLock encadeia as chamadas por chave (FIFO) em vez de
// deixá-las correr em paralelo.
const writeChains = new Map();
function withWriteLock(key, fn) {
  const prev = writeChains.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  writeChains.set(key, next.catch(() => {}));
  return next;
}

async function readJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Lê do SecureStore e, se ele não existir/falhar (web) ou estiver vazio, cai no
// espelho do AsyncStorage. Nunca lança.
async function readSecureJSON(key, mirrorKey) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // SecureStore indisponível (web) — segue pro espelho abaixo.
  }
  if (!mirrorKey) return null;
  try {
    const raw = await AsyncStorage.getItem(mirrorKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Grava no SecureStore; só usa o espelho do AsyncStorage se o SecureStore
// falhar de verdade. NUNCA lança — nascimento é dado complementar e não pode
// derrubar o salvamento do perfil.
async function writeSecureJSON(key, mirrorKey, value) {
  const payload = JSON.stringify(value);
  try {
    await SecureStore.setItemAsync(key, payload);
    return true;
  } catch {
    // web (stub vazio) ou Keychain indisponível — espelha em AsyncStorage.
  }
  try {
    await AsyncStorage.setItem(mirrorKey, payload);
    return true;
  } catch {
    return false;
  }
}

// { voce, amor, sa, sb } | null — sa/sb são os nomes de signo (ex.: "Áries"), o mesmo
// formato que lib/signs.js espera em signByName/compatibility/compatPercent.
export async function getCoupleProfile() {
  return readJSON(PROFILE_KEY, null);
}

// birthA/birthB são opcionais — { date, time } de cada um do casal. Quando
// presentes, vão pro SecureStore; chamadas existentes que só passam
// { voce, amor, sa, sb } continuam funcionando exatamente como antes.
export async function saveCoupleProfile({ voce, amor, sa, sb, birthA, birthB }) {
  // O PERFIL é o único dado essencial — é ele que o Gate (App.js) e a Home
  // leem, e é só ele que decide o boolean devolvido a quem chamou.
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ voce, amor, sa, sb }));
  } catch {
    return false;
  }

  // Nascimento é COMPLEMENTAR (Ascendente, Mapa Astral, Céu de Hoje). Antes,
  // estas duas linhas estavam dentro do MESMO try/catch do perfil acima e um
  // throw aqui devolvia `false` mesmo com o perfil já gravado — e na web o
  // SecureStore lança SEMPRE (stub vazio, ver comentário nas chaves acima).
  // Resultado: o botão final do Quiz do Casal ("Salvar e ver meu painel")
  // mostrava "Não foi possível salvar. Tente novamente." em 100% dos acessos
  // web, mesmo com tudo preenchido corretamente. Agora cada gravação de
  // nascimento é isolada, tem espelho e nunca reprova o quiz inteiro.
  await Promise.all([
    birthA ? writeSecureJSON(SECURE_BIRTH_A_KEY, MIRROR_BIRTH_A_KEY, birthA) : Promise.resolve(true),
    birthB ? writeSecureJSON(SECURE_BIRTH_B_KEY, MIRROR_BIRTH_B_KEY, birthB) : Promise.resolve(true),
  ]);

  return true;
}

// Objeto de theme.js zodiacSigns (ex.: { name: 'Áries', pt: 'Áries', ... }) | null
// quando o usuário solo ainda não escolheu signo.
export async function getUserSign() {
  return readJSON(USER_SIGN_KEY, null);
}

export async function saveUserSign(signObj) {
  try {
    await AsyncStorage.setItem(USER_SIGN_KEY, JSON.stringify(signObj));
    return true;
  } catch {
    return false;
  }
}

// { birthA, birthB } — cada um { date, time } | null quando ainda não foi salvo.
export async function getBirthData() {
  const [birthA, birthB] = await Promise.all([
    readSecureJSON(SECURE_BIRTH_A_KEY, MIRROR_BIRTH_A_KEY),
    readSecureJSON(SECURE_BIRTH_B_KEY, MIRROR_BIRTH_B_KEY),
  ]);
  return { birthA, birthB };
}

// { lastDate, count, longest }
export async function getStreak(voce, amor) {
  return readJSON(streakKey(voce, amor), { lastDate: null, count: 0, longest: 0 });
}

export async function getMemoriesCount(voce, amor) {
  const t = await readJSON(timelineKey(voce, amor), { memories: [] });
  return (t.memories || []).length;
}

// Porta o storageKey/schema de c:/tmp/gilfforever/web/app/(app)/timeline/page.js:
// mesma chave (timelineKey), mesmo blob { memories: [], capsules: [] }. Cada mutator
// lê o blob inteiro, faz spread (preserva chaves extras como um eventual `startDate`
// que activity.js possa gravar) e só troca o array alterado antes de regravar.
export async function getTimeline(voce, amor) {
  return readJSON(timelineKey(voce, amor), { memories: [], capsules: [] });
}

// photo fica sempre null nesta versão (suporte a foto adiado — ver Timeline).
export async function addMemory(voce, amor, { title, date, text }) {
  const key = timelineKey(voce, amor);
  return withWriteLock(key, async () => {
    const t = await readJSON(key, { memories: [], capsules: [] });
    const memory = { id: String(Date.now()), date, title, text: text || '', photo: null };
    await AsyncStorage.setItem(key, JSON.stringify({ ...t, memories: [...(t.memories || []), memory] }));
    return memory;
  });
}

export async function deleteMemory(voce, amor, id) {
  const key = timelineKey(voce, amor);
  return withWriteLock(key, async () => {
    const t = await readJSON(key, { memories: [], capsules: [] });
    await AsyncStorage.setItem(key, JSON.stringify({ ...t, memories: (t.memories || []).filter((m) => m.id !== id) }));
  });
}

export async function addCapsule(voce, amor, { message, unlockAt }) {
  const key = timelineKey(voce, amor);
  return withWriteLock(key, async () => {
    const t = await readJSON(key, { memories: [], capsules: [] });
    const capsule = { id: String(Date.now()), message, unlockAt, createdAt: new Date().toISOString() };
    await AsyncStorage.setItem(key, JSON.stringify({ ...t, capsules: [...(t.capsules || []), capsule] }));
    return capsule;
  });
}

export async function deleteCapsule(voce, amor, id) {
  const key = timelineKey(voce, amor);
  return withWriteLock(key, async () => {
    const t = await readJSON(key, { memories: [], capsules: [] });
    await AsyncStorage.setItem(key, JSON.stringify({ ...t, capsules: (t.capsules || []).filter((c) => c.id !== id) }));
  });
}

// Reconectar — porta fiel de c:/tmp/gilfforever/web/app/(app)/reconectar/page.js:
// mesma chave (reconectarKey) e mesmo esquema de mapa achatado
// { "<trackId>:<stepIndex>": true }, regravado por inteiro a cada toggle (sem
// merge parcial — igual ao persist() original).
export async function getReconectarChecks(voce, amor) {
  return readJSON(reconectarKey(voce, amor), {});
}

export async function toggleReconectarStep(voce, amor, trackId, stepIndex) {
  const key = reconectarKey(voce, amor);
  return withWriteLock(key, async () => {
    const checks = await readJSON(key, {});
    const stepKey = `${trackId}:${stepIndex}`;
    const next = { ...checks, [stepKey]: !checks[stepKey] };
    await AsyncStorage.setItem(key, JSON.stringify(next));
    return next;
  });
}

// Descobrir — porta fiel de c:/tmp/gilfforever/web/app/(app)/descobrir/page.js:
// mesma chave (descobrirKey), mesmo blob com 3 sub-resultados independentes.
// saveDescobrirResult espelha o saveQuiz() original: lê o blob inteiro, troca só
// a chave do quiz salvo agora e regrava tudo.
export async function getDescobrirData(voce, amor) {
  return readJSON(descobrirKey(voce, amor), { linguagem: null, apego: null, conflictos: null });
}

export async function saveDescobrirResult(voce, amor, quizId, result) {
  const key = descobrirKey(voce, amor);
  const data = await readJSON(key, { linguagem: null, apego: null, conflictos: null });
  const next = { ...data, [quizId]: result };
  await AsyncStorage.setItem(key, JSON.stringify(next));
  return next;
}

// Agir — porta fiel de c:/tmp/gilfforever/web/app/(app)/agir/page.js: mesma
// chave (agirKey), mesmo blob com as 5 seções. saveAgirData espelha o persist()
// original — merge parcial: lê o blob inteiro, espalha `partial` por cima e
// regrava tudo.
export async function getAgirData(voce, amor) {
  return readJSON(agirKey(voce, amor), { favorites: [], done: [], goalSaved: '', goalDone: false, dreams: [] });
}

export async function saveAgirData(voce, amor, partial) {
  const key = agirKey(voce, amor);
  return withWriteLock(key, async () => {
    const data = await readJSON(key, { favorites: [], done: [], goalSaved: '', goalDone: false, dreams: [] });
    const next = { ...data, ...partial };
    await AsyncStorage.setItem(key, JSON.stringify(next));
    return next;
  });
}

// correlationCode salvo pelo checkout — mesmo formato do funil web
// (localStorage `gff-correlation:${voce}:${amor}`), aqui persistido no AsyncStorage.
export async function getCorrelationCode(voce, amor) {
  try {
    return await AsyncStorage.getItem(correlationKey(voce, amor));
  } catch {
    return null;
  }
}

export async function saveCorrelationCode(voce, amor, correlationCode) {
  try {
    await AsyncStorage.setItem(correlationKey(voce, amor), correlationCode);
  } catch {
    // segue mesmo se falhar — o checkout já aconteceu, só o cache local que não salvou.
  }
}

// Equivalentes solo das duas funções acima — mesmo formato, só troca a chave
// (soloCorrelationKey, indexada por e-mail em vez de voce+amor).
export async function getSoloCorrelationCode(email) {
  try {
    return await AsyncStorage.getItem(soloCorrelationKey(email));
  } catch {
    return null;
  }
}

export async function saveSoloCorrelationCode(email, correlationCode) {
  try {
    await AsyncStorage.setItem(soloCorrelationKey(email), correlationCode);
  } catch {
    // segue mesmo se falhar — o checkout já aconteceu, só o cache local que não salvou.
  }
}

// Cabeçalhos do checkout: manda o JWT do Supabase QUANDO a pessoa está logada
// (o app já exige login pra assinar, ver PlanosScreen.js). Com token, o backend
// (1) ignora o customerEmail do corpo e usa o e-mail verificado do token — sem
// isso qualquer um podia POSTar o e-mail de outra pessoa e criar uma pendência
// "dela"; e (2) consegue ser IDEMPOTENTE por conta, devolvendo alreadyActive em
// vez de criar mais uma pendência. Sem token (funil web antigo, oddpro.pro) o
// comportamento é exatamente o de hoje.
function checkoutHeaders(authToken) {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  return headers;
}

// Inicia o checkout real (Hotmart) no backend — mesmo endpoint do funil web.
// Retorna { correlationCode, checkoutConfig } em sucesso, ou lança em falha (quem
// chama decide como mostrar o erro).
// plan: 'trial' | 'quarterly' | 'annual' — decide qual das 3 ofertas reais do
// Hotmart o checkout embutido abre (ver HotmartPaymentProvider.js no backend).
// 'trial' é o default (mesmo comportamento de sempre) pra nunca quebrar quem
// chamar sem escolher plano.
// authToken (opcional): access_token do Supabase — ver getAuthToken() em
// lib/accountSubscription.js.
export async function initiateCheckout(voce, amor, customerEmail, plan = 'trial', authToken) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/checkout/initiate`, {
    method: 'POST',
    headers: checkoutHeaders(authToken),
    body: JSON.stringify({
      coupleName: voce && amor ? `${voce} & ${amor}` : undefined,
      // Sem isso, o suporte não tinha como localizar uma assinatura pelo
      // e-mail do cliente — só pelo correlationCode, que vive só no
      // aparelho da pessoa. Achado real de auditoria (18/07/2026).
      customerEmail: customerEmail || undefined,
      plan,
      scope: 'couple',
    }),
  });
  if (!resp.ok) throw new Error('initiate falhou');
  const data = await resp.json();
  // NUNCA sobrescrever o ponteiro local quando o backend respondeu
  // "você já assina" (alreadyActive) — nesse caso NÃO houve checkout novo e o
  // correlationCode devolvido é o da assinatura que já existe. Este era o laço
  // que fazia o acesso SUMIR: clicar "Assinar" depois de já ter pago repontava
  // o aparelho pra uma pendência nova (achado real, cliente pagante, 26/07/2026).
  if (data?.alreadyActive !== true && voce && amor && data?.correlationCode) {
    await saveCorrelationCode(voce, amor, data.correlationCode);
  }
  return data;
}

// Equivalente solo de initiateCheckout — mesmo endpoint/backend (que é
// agnóstico a casal-vs-solo: correlationCode é a PK, coupleName/customerEmail
// são só metadado informativo), só não manda coupleName (não existe par) e
// salva o correlationCode na chave solo (soloCorrelationKey), nunca na de
// casal — pra uma assinatura solo nunca colidir com uma de casal do mesmo
// e-mail caso a pessoa forme um casal depois.
export async function initiateSoloCheckout(customerEmail, plan = 'trial', authToken) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/checkout/initiate`, {
    method: 'POST',
    headers: checkoutHeaders(authToken),
    body: JSON.stringify({ customerEmail: customerEmail || undefined, plan, scope: 'solo' }),
  });
  if (!resp.ok) throw new Error('initiate falhou');
  const data = await resp.json();
  // Mesma proteção do initiateCheckout: alreadyActive:true significa que NÃO
  // houve checkout novo, então o ponteiro local não pode ser mexido.
  if (data?.alreadyActive !== true && customerEmail && data?.correlationCode) {
    await saveSoloCorrelationCode(customerEmail, data.correlationCode);
  }
  return data;
}

// { hasAccess, status, plan, currentPeriodEnd, confirmed } — sempre retorna um
// shape válido, nunca lança: sem correlationCode salvo ainda, vira
// { hasAccess: false, confirmed: true } (esse "false" é um estado real: nunca
// assinou). Uma falha TRANSITÓRIA (rede instável, 5xx passageiro do servidor)
// não pode virar "sem acesso" pra quem já pagou — por isso tenta até 3 vezes
// com um pequeno intervalo antes de desistir. Um 4xx (ex.: correlationCode
// desconhecido) é um estado real, não transitório, e não é retentado.
// `confirmed: false` SÓ acontece quando as 3 tentativas falharam por rede/5xx
// — ou seja, não sabemos de verdade se a pessoa tem acesso ou não. Sem essa
// distinção, telas que usam hasAccess pra decidir "já gastou a prévia grátis"
// (lib/featureUsage.js) queimavam a prévia vitalícia de um ASSINANTE de
// verdade só porque a checagem de rede falhou num momento ruim (achado real
// de auditoria, 25/07/2026) — nunca marcar uso grátis com confirmed=false.
export async function checkSubscriptionStatus(voce, amor) {
  const correlationCode = await getCorrelationCode(voce, amor);
  if (!correlationCode) return { hasAccess: false, confirmed: true };

  const ATTEMPTS = 3;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const resp = await fetchWithTimeout(`${API_BASE}/api/subscription/${correlationCode}`);
      if (resp.ok) {
        const data = await resp.json();
        return { ...data, hasAccess: Boolean(data?.hasAccess), confirmed: true };
      }
      // 429 (rate limit — o recheck de 5 em 5 minutos x vários aparelhos já
      // estourou o balde de verdade) e 408 (timeout do servidor) são
      // TRANSITÓRIOS, não "não assina": tratá-los como resposta definitiva
      // revogava o acesso de um pagante E queimava a prévia grátis vitalícia
      // dele — mesma regra que lib/accountSubscription.js já aplica ao /me.
      // Caem no retry abaixo e, esgotadas as tentativas, viram confirmed:false.
      if (resp.status !== 429 && resp.status !== 408 && resp.status < 500) {
        return { hasAccess: false, confirmed: true };
      }
      // 5xx/429/408: cai para o retry abaixo.
    } catch {
      // falha de rede/timeout: cai para o retry abaixo.
    }
    if (attempt < ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  return { hasAccess: false, confirmed: false };
}

// Equivalente solo de checkSubscriptionStatus — mesma lógica de retry/
// confirmed exatamente igual (evita queimar a prévia grátis de um assinante
// solo real por causa de uma instabilidade de rede passageira), só troca a
// origem do correlationCode (soloCorrelationKey por e-mail, não voce+amor).
export async function checkSoloSubscriptionStatus(email) {
  const correlationCode = await getSoloCorrelationCode(email);
  if (!correlationCode) return { hasAccess: false, confirmed: true };

  const ATTEMPTS = 3;
  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const resp = await fetchWithTimeout(`${API_BASE}/api/subscription/${correlationCode}`);
      if (resp.ok) {
        const data = await resp.json();
        return { ...data, hasAccess: Boolean(data?.hasAccess), confirmed: true };
      }
      // 429/408 transitórios — mesma regra do checkSubscriptionStatus acima:
      // retry e, esgotado, confirmed:false (nunca "não assina" definitivo).
      if (resp.status !== 429 && resp.status !== 408 && resp.status < 500) {
        return { hasAccess: false, confirmed: true };
      }
      // 5xx/429/408: cai para o retry abaixo.
    } catch {
      // falha de rede/timeout: cai para o retry abaixo.
    }
    if (attempt < ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  return { hasAccess: false, confirmed: false };
}

// ORDEM DE RESOLUÇÃO DO ACESSO: CONTA primeiro, APARELHO como fallback — e em
// UNIÃO (OR), nunca com early-return.
//
// `account` vem de checkAccountAccess() (lib/accountSubscription.js, resolve
// pela conta logada); `couple`/`solo` vêm de checkSubscriptionStatus/
// checkSoloSubscriptionStatus (resolvem pelo código guardado NESTE aparelho).
//
// Por que os três juntos, e não "conta e pronto":
//  - deslogado é a maioria do app (login só é exigido na tela de Planos), e
//    essa gente só tem o código do aparelho;
//  - o JWKS/Supabase pode estar fora e a rota de conta responder 401 — o
//    fallback local é o que segura o assinante nesse minuto;
//  - as 14 pendências antigas do funil web não têm e-mail nem conta: só o
//    código as alcança.
// Por que conta é AUTORITATIVA quando concede: um ponteiro local pode estar
// PODRE (apontando pra pendência errada) — foi literalmente o caso do cliente
// que pagou 17:14 e cujo aparelho apontava pra uma pendência de 17:48. A conta
// não erra de linha.
//
// Nenhuma resposta negativa (401/404/timeout) pode DERRUBAR um hasAccess que
// outra fonte concedeu — é isso que garante que o deploy do app antes do
// backend, ou uma queda de rede, não deslogue quem pagou.
export function combineAccessResults({ account, couple, solo } = {}) {
  const a = account || {};
  const c = couple || {};
  const s = solo || {};

  // `available` distingue "a conta disse que não tem" de "a conta não disse
  // nada" (deslogado, backend antigo, rede fora) — só o primeiro é resposta.
  const contaOK = Boolean(a.available && a.hasAccess);
  const casalOK = Boolean(c.hasAccess);
  const soloOK = Boolean(s.hasAccess);

  const hasAccess = contaOK || casalOK || soloOK;
  // UMA assinatura libera o app INTEIRO — decisão do dono (29/07/2026), na
  // fala dele: "quando ele assina pode deixar funcionar o casal também, aí
  // quando ele chama o casal dele funciona de graça para o outro par". A
  // separação solo/casal por escopo de assinatura deixou de existir no ACESSO
  // (continua existindo nos DADOS: as telas de casal ainda precisam do quiz e
  // do convite pra terem o que mostrar — mas isso é cadastro, não paywall).
  // O convite carrega o código de acesso (&acesso= em lib/coupleInvite.js),
  // então o par convidado herda o acesso sem pagar de novo.
  const hasCoupleAccess = hasAccess;

  // confirmed=false SÓ quando ninguém concedeu acesso E pelo menos uma fonte
  // ficou no escuro (rede/5xx/JWKS). É esse flag que impede queimar a prévia
  // grátis vitalícia de um assinante real (lib/featureUsage.js).
  const confirmed =
    hasAccess || (a.confirmed !== false && c.confirmed !== false && s.confirmed !== false);

  // Quem dita status/plan/currentPeriodEnd: a fonte que CONCEDEU o acesso, na
  // ordem conta > casal > solo. Sem acesso nenhum, vale a primeira fonte que
  // ao menos tenha um status real pra mostrar (ex.: 'pending', que a tela de
  // Planos usa pra continuar oferecendo o checkout).
  const winner =
    (contaOK && a) ||
    (casalOK && c) ||
    (soloOK && s) ||
    (a.available && a.status && a) ||
    (c.status && c) ||
    (s.status && s) ||
    null;

  return {
    hasAccess,
    hasCoupleAccess,
    confirmed,
    status: winner?.status || null,
    plan: winner?.plan || null,
    currentPeriodEnd: winner?.currentPeriodEnd || null,
    source: contaOK ? 'account' : casalOK ? 'couple' : soloOK ? 'solo' : 'none',
  };
}

// Dias até `iso` (YYYY-MM-DD), arredondado pra cima — espelha daysUntil() do
// timeline/page.js original. <= 0 significa que a cápsula já pode abrir.
export function daysUntil(iso) {
  const target = new Date(iso + 'T00:00');
  const now = new Date();
  // Compara os componentes de calendário (ano/mês/dia) locais de cada data via
  // Date.UTC, em vez de subtrair milissegundos brutos — assim uma transição de
  // horário de verão em qualquer um dos dois dias nunca desloca a contagem de
  // dias inteiros (Date.now() traz a hora do dia junto, o que podia arredondar
  // errado bem perto da virada do dia).
  const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  const utcNow = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((utcTarget - utcNow) / (1000 * 60 * 60 * 24));
}

// Emoji que evolui com o tamanho da racha — mesma escala de gilfforever/web/lib activity/hub.
export function streakEmoji(count) {
  if (count >= 30) return '💎';
  if (count >= 14) return '🏆';
  if (count >= 7) return '🌟';
  if (count >= 3) return '🔥';
  return '✨';
}

// Chamada única pra Home: junta perfil + streak + memórias.
// Retorna null quando ainda não existe nenhum dado de casal salvo (primeiro uso,
// sem onboarding ainda) — a tela deve tratar esse caso mostrando um estado vazio.
export async function getCoupleData() {
  const profile = await getCoupleProfile();
  if (!profile || !profile.voce || !profile.amor) return null;

  const { voce, amor, sa, sb } = profile;
  const [streak, memoriesCount] = await Promise.all([
    getStreak(voce, amor),
    getMemoriesCount(voce, amor),
  ]);

  return { voce, amor, sa, sb, streak, memoriesCount };
}

// Apaga todos os dados locais do casal e do modo solo: perfil, streak,
// timeline, reconectar, descobrir, agir e o signo solo (AsyncStorage) e as
// datas/horas de nascimento (SecureStore). Lê o perfil antes de remover as
// chaves para saber os nomes usados em
// streakKey/timelineKey/reconectarKey/descobrirKey/agirKey.
// soloEmail (opcional): quando quem está apagando os dados é um usuário solo
// logado com assinatura própria, passa o e-mail pra também remover o
// correlationCode solo — sem isso, uma assinatura solo ficaria órfã no
// aparelho depois de "apagar meus dados" (mesma classe de bug que o
// correlationCode de casal abaixo já evita).
export async function deleteAllCoupleData(soloEmail) {
  const profile = await getCoupleProfile();

  // USER_SIGN_KEY (o signo do modo solo) sai SEMPRE: esta função é o ÚNICO
  // "apagar meus dados" do app, e o signo é dado pessoal de quem pediu pra
  // apagar — antes ele só saía quando existia um perfil de CASAL, então o
  // usuário 100% solo "apagava tudo" e o signo dele sobrevivia no aparelho
  // (achado real de auditoria de privacidade, 27/07/2026).
  // Os espelhos de nascimento (usados quando o SecureStore não existe — web)
  // saem SEMPRE, igual aos deleteItemAsync do SecureStore lá embaixo. Sem
  // isso, "apagar meus dados" deixaria a data de nascimento do casal viva no
  // localStorage de todo usuário web. O mesmo vale pro nascimento SOLO
  // (birth-solo-mirror, escrito por lib/birthData.js): é dado de nascimento da
  // pessoa, não do casal, e não pode depender de existir um perfil de casal
  // pra ser apagado.
  const keysToRemove = [
    PROFILE_KEY,
    USER_SIGN_KEY,
    MIRROR_BIRTH_A_KEY,
    MIRROR_BIRTH_B_KEY,
    SOLO_BIRTH_MIRROR_KEY,
    mirrorKeyFor(SECURE_BIRTH_SOLO_KEY),
    mirrorKeyFor(SECURE_BIRTH_CITIES_KEY),
  ];
  // O correlationCode do casal é específico do par voce/amor e precisa sair
  // junto, pra não ressuscitar uma assinatura antiga se o mesmo par se
  // cadastrar de novo.
  if (profile?.voce && profile?.amor) {
    keysToRemove.push(streakKey(profile.voce, profile.amor));
    keysToRemove.push(timelineKey(profile.voce, profile.amor));
    keysToRemove.push(reconectarKey(profile.voce, profile.amor));
    keysToRemove.push(descobrirKey(profile.voce, profile.amor));
    keysToRemove.push(agirKey(profile.voce, profile.amor));
    keysToRemove.push(correlationKey(profile.voce, profile.amor));
  }
  if (soloEmail) {
    keysToRemove.push(soloCorrelationKey(soloEmail));
  }

  try {
    await AsyncStorage.multiRemove(keysToRemove);
  } catch {
    // segue mesmo se falhar — ainda tentamos limpar o SecureStore abaixo.
  }

  // No CELULAR o nascimento vive só no Keychain/Keystore — as 4 chaves precisam
  // sair aqui (as duas do casal e as duas do Mapa Astral solo, incluindo a
  // cidade de nascimento, que é localização e também é dado pessoal).
  // deleteItemAsync lança na web (stub vazio) — o .catch mantém isso inofensivo,
  // já que lá o dado real está nos espelhos do AsyncStorage acima.
  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_BIRTH_A_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(SECURE_BIRTH_B_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(SECURE_BIRTH_SOLO_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(SECURE_BIRTH_CITIES_KEY).catch(() => {}),
  ]);
}
