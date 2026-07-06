// Camada de dados do casal — lê/escreve no AsyncStorage os dados que a Home
// precisa exibir (nomes, signos, sequência/streak, contagem de memórias).
// Porta o esquema de chaves de c:/tmp/gilfforever/web/lib/activity.js
// (gff:${voce}:${amor}, gff-streak:${voce}:${amor}) para que uma futura tela
// de quiz/onboarding e a futura Timeline possam reaproveitar exatamente as
// mesmas chaves. Diferente do localStorage original, TODO método aqui é
// assíncrono — AsyncStorage.getItem/setItem sempre retornam Promise.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

// Backend real (api-forja) — mesmo usado pelo funil web (gilfforever/web). Gera o
// correlationCode e o checkoutConfig do Hotmart server-side, e depois expõe o
// status da assinatura por esse código. Nenhuma mudança no backend é necessária.
const API_BASE = 'https://oddpro.pro/api-forja';

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

async function readJSON(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function readSecureJSON(key) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
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
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify({ voce, amor, sa, sb }));
    if (birthA) await SecureStore.setItemAsync(SECURE_BIRTH_A_KEY, JSON.stringify(birthA));
    if (birthB) await SecureStore.setItemAsync(SECURE_BIRTH_B_KEY, JSON.stringify(birthB));
    return true;
  } catch {
    return false;
  }
}

// Objeto de theme.js zodiacSigns (ex.: { name: 'Áries', pt: 'Áries', ... }) | null
// quando o usuário solo ainda não escolheu signo.
export async function getUserSign() {
  return readJSON(USER_SIGN_KEY, null);
}

export async function saveUserSign(signObj) {
  await AsyncStorage.setItem(USER_SIGN_KEY, JSON.stringify(signObj));
}

// { birthA, birthB } — cada um { date, time } | null quando ainda não foi salvo.
export async function getBirthData() {
  const [birthA, birthB] = await Promise.all([
    readSecureJSON(SECURE_BIRTH_A_KEY),
    readSecureJSON(SECURE_BIRTH_B_KEY),
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
  const t = await readJSON(key, { memories: [], capsules: [] });
  const memory = { id: String(Date.now()), date, title, text: text || '', photo: null };
  await AsyncStorage.setItem(key, JSON.stringify({ ...t, memories: [...(t.memories || []), memory] }));
  return memory;
}

export async function deleteMemory(voce, amor, id) {
  const key = timelineKey(voce, amor);
  const t = await readJSON(key, { memories: [], capsules: [] });
  await AsyncStorage.setItem(key, JSON.stringify({ ...t, memories: (t.memories || []).filter((m) => m.id !== id) }));
}

export async function addCapsule(voce, amor, { message, unlockAt }) {
  const key = timelineKey(voce, amor);
  const t = await readJSON(key, { memories: [], capsules: [] });
  const capsule = { id: String(Date.now()), message, unlockAt };
  await AsyncStorage.setItem(key, JSON.stringify({ ...t, capsules: [...(t.capsules || []), capsule] }));
  return capsule;
}

export async function deleteCapsule(voce, amor, id) {
  const key = timelineKey(voce, amor);
  const t = await readJSON(key, { memories: [], capsules: [] });
  await AsyncStorage.setItem(key, JSON.stringify({ ...t, capsules: (t.capsules || []).filter((c) => c.id !== id) }));
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
  const checks = await readJSON(key, {});
  const stepKey = `${trackId}:${stepIndex}`;
  const next = { ...checks, [stepKey]: !checks[stepKey] };
  await AsyncStorage.setItem(key, JSON.stringify(next));
  return next;
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
  const data = await readJSON(key, { favorites: [], done: [], goalSaved: '', goalDone: false, dreams: [] });
  const next = { ...data, ...partial };
  await AsyncStorage.setItem(key, JSON.stringify(next));
  return next;
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

// Inicia o checkout real (Hotmart) no backend — mesmo endpoint do funil web.
// Retorna { correlationCode, checkoutConfig } em sucesso, ou lança em falha (quem
// chama decide como mostrar o erro).
export async function initiateCheckout(voce, amor) {
  const resp = await fetch(`${API_BASE}/api/checkout/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ coupleName: voce && amor ? `${voce} & ${amor}` : undefined }),
  });
  if (!resp.ok) throw new Error('initiate falhou');
  const data = await resp.json();
  if (voce && amor && data?.correlationCode) {
    await saveCorrelationCode(voce, amor, data.correlationCode);
  }
  return data;
}

// { hasAccess, status, plan, currentPeriodEnd } — sempre retorna um shape válido,
// nunca lança: sem correlationCode salvo ainda, ou qualquer falha de rede/parse,
// vira simplesmente { hasAccess: false } (mesmo comportamento do FeatureGate web).
export async function checkSubscriptionStatus(voce, amor) {
  try {
    const correlationCode = await getCorrelationCode(voce, amor);
    if (!correlationCode) return { hasAccess: false };
    const resp = await fetch(`${API_BASE}/api/subscription/${correlationCode}`);
    if (!resp.ok) return { hasAccess: false };
    const data = await resp.json();
    return { ...data, hasAccess: Boolean(data?.hasAccess) };
  } catch {
    return { hasAccess: false };
  }
}

// Dias até `iso` (YYYY-MM-DD), arredondado pra cima — espelha daysUntil() do
// timeline/page.js original. <= 0 significa que a cápsula já pode abrir.
export function daysUntil(iso) {
  const ms = new Date(iso + 'T00:00').getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
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
export async function deleteAllCoupleData() {
  const profile = await getCoupleProfile();

  const keysToRemove = [PROFILE_KEY, USER_SIGN_KEY];
  if (profile?.voce && profile?.amor) {
    keysToRemove.push(streakKey(profile.voce, profile.amor));
    keysToRemove.push(timelineKey(profile.voce, profile.amor));
    keysToRemove.push(reconectarKey(profile.voce, profile.amor));
    keysToRemove.push(descobrirKey(profile.voce, profile.amor));
    keysToRemove.push(agirKey(profile.voce, profile.amor));
  }

  try {
    await AsyncStorage.multiRemove(keysToRemove);
  } catch {
    // segue mesmo se falhar — ainda tentamos limpar o SecureStore abaixo.
  }

  await Promise.all([
    SecureStore.deleteItemAsync(SECURE_BIRTH_A_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(SECURE_BIRTH_B_KEY).catch(() => {}),
  ]);
}
