// lib/accountSubscription.js
// ACESSO RESOLVIDO PELA CONTA — não pelo aparelho.
//
// Até aqui, "ser assinante" era ter um correlationCode gravado no AsyncStorage
// DESTE aparelho (ver lib/coupleData.js). Isso amarrava a assinatura ao
// hardware/navegador: limpar dados, trocar de celular ou abrir no PC = pagou e
// perdeu o acesso. Pior: clicar "Assinar" de novo depois de já ter pago
// sobrescrevia a chave local com uma pendência nova e o acesso SUMIA (laço
// real vivido por um cliente pagante em 26/07/2026, 4 checkouts).
//
// A identidade do assinante passa a ser o `sub` (UUID) do JWT do Supabase,
// verificado no servidor via JWKS — exatamente o mesmo mecanismo que
// src/http/socialAuth.js já usa em produção pro feed social (lib/socialClient.js
// é o espelho deste arquivo do lado do cliente). O correlationCode continua
// existindo, mas vira só um PONTEIRO local (cache/fallback), nunca a identidade.
//
// REGRA DE OURO desta camada: nada aqui pode DERRUBAR um acesso concedido por
// outra fonte. A resolução final é uma UNIÃO (conta OR código de casal OR
// código solo — ver combineAccessResults em lib/coupleData.js). Se a conta não
// responder (offline, JWKS fora, backend antigo sem a rota), o app cai no
// código do aparelho e o assinante continua entrando.
//
// Direção da dependência: accountSubscription -> coupleData (nunca o contrário).
// coupleData é a camada de armazenamento pura e NÃO pode importar o Supabase:
// o cliente do Supabase arrasta `react-native` junto, o que quebraria os testes
// de node:test que exercitam coupleData direto (test/coupleData.saveProfile.test.js).
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseClient';
import { fetchWithTimeout } from './aiClient';
import {
  getCorrelationCode,
  getSoloCorrelationCode,
  saveCorrelationCode,
  saveSoloCorrelationCode,
} from './coupleData';

const API_BASE = 'https://api.cosmicguide.cloud';

// Mesmo número de tentativas do checkSubscriptionStatus por código
// (lib/coupleData.js): uma instabilidade passageira não pode virar "sem conta".
const ATTEMPTS = 3;

// "A conta não tem nada a dizer" — estado REAL e conhecido (deslogado, backend
// antigo sem a rota, conta sem assinatura nenhuma). `confirmed: true` porque
// não há incerteza: quem decide é o fallback por aparelho.
const SEM_INFO_DE_CONTA = { available: false, hasAccess: false, hasCoupleAccess: false, confirmed: true, entries: [] };

// "Não deu pra saber" — rede caiu, 5xx, 429 ou o servidor não conseguiu
// verificar o token. `confirmed: false` propaga a incerteza pro
// accessConfirmed do CoupleContext, que é o que impede telas de queimarem a
// prévia grátis vitalícia de um assinante de verdade (lib/featureUsage.js).
const CONTA_INDEFINIDA = { available: false, hasAccess: false, hasCoupleAccess: false, confirmed: false, entries: [] };

// Token real da sessão (o SDK renova sozinho quando está perto de expirar —
// autoRefreshToken em lib/supabaseClient.js). Nunca lança: sem sessão, ou com
// o storage indisponível, devolve null e quem chama trata como "deslogado".
export async function getAuthToken() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session?.access_token || null;
  } catch {
    return null;
  }
}

// Aceita as duas formas de resposta do GET /api/subscription/me: a agregada
// (um único bloco { hasAccess, scope, correlationCode, ... }) e a detalhada
// (com `subscriptions: [...]`, uma entrada por escopo). Assim o app não quebra
// se o backend passar a devolver a lista por escopo depois — e o auto-reparo
// consegue consertar as DUAS chaves locais (casal e solo) quando ela existir.
function normalizeAccountPayload(data) {
  const lista = Array.isArray(data?.subscriptions) ? data.subscriptions : null;
  const entries = (lista && lista.length ? lista : [data])
    .filter((e) => e && e.correlationCode)
    .map((e) => ({
      correlationCode: e.correlationCode,
      // scope só é confiável quando vem explícito — ver repairLocalCorrelationCodes.
      scope: e.scope === 'couple' || e.scope === 'solo' ? e.scope : null,
      hasAccess: Boolean(e.hasAccess ?? data?.hasAccess),
      status: e.status ?? null,
      plan: e.plan ?? null,
      currentPeriodEnd: e.currentPeriodEnd ?? null,
    }));

  const hasAccess = Boolean(data?.hasAccess) || entries.some((e) => e.hasAccess);
  // hasCoupleAccess é o que libera as 5 telas exclusivas de casal — se o
  // servidor não mandar o campo, só um escopo 'couple' EXPLÍCITO pode
  // concedê-lo (nunca inferir por omissão: uma assinatura solo abrindo as
  // telas de casal seria entregar produto que não foi comprado).
  const hasCoupleAccess =
    data?.hasCoupleAccess !== undefined
      ? Boolean(data.hasCoupleAccess)
      : entries.some((e) => e.hasAccess && e.scope === 'couple');

  return {
    available: true,
    confirmed: true,
    hasAccess,
    hasCoupleAccess,
    status: data?.status ?? null,
    plan: data?.plan ?? null,
    currentPeriodEnd: data?.currentPeriodEnd ?? null,
    correlationCode: data?.correlationCode ?? entries[0]?.correlationCode ?? null,
    entries,
    source: 'account',
  };
}

// GET /api/subscription/me — a assinatura resolvida pela CONTA logada.
// Nunca lança. O e-mail nunca vai no corpo/query: o servidor usa o e-mail do
// token verificado, então não dá pra reivindicar a assinatura de terceiro
// digitando o e-mail dele.
export async function fetchAccountSubscription() {
  const token = await getAuthToken();
  // Deslogado é a MAIORIA do app (login só é exigido na tela de Planos) — nem
  // chega a bater na rede, e o fluxo continua idêntico ao de hoje.
  if (!token) return { ...SEM_INFO_DE_CONTA, reason: 'no-session' };

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    try {
      const resp = await fetchWithTimeout(`${API_BASE}/api/subscription/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (resp.ok) {
        const data = await resp.json().catch(() => null);
        if (!data) return { ...SEM_INFO_DE_CONTA, reason: 'bad-payload' };
        return normalizeAccountPayload(data);
      }
      // 404 = backend AINDA SEM a rota nova. A rota antiga é
      // `/api/subscription/:correlationCode`, então um servidor velho casa
      // ":correlationCode = 'me'" e responde 404 "não encontrado". Deploy
      // app-antes-backend não pode virar "sem acesso" — é só "sem informação".
      if (resp.status === 404) return { ...SEM_INFO_DE_CONTA, reason: 'route-missing' };
      // 401/403 com token enviado significa que o SERVIDOR não conseguiu
      // validar (JWKS fora do ar, sessão expirada no meio do caminho). É
      // incerteza, não "não assina" — por isso confirmed:false. O acesso em si
      // continua fail-closed (hasAccess:false), mas o fallback por aparelho
      // roda em paralelo e é ele quem sustenta o assinante nesse cenário.
      if (resp.status === 401 || resp.status === 403) return { ...CONTA_INDEFINIDA, reason: 'unauthorized' };
      // 429: o recheck de 5 em 5 minutos + vários aparelhos já estouraram o
      // balde de verdade (25/07/2026). Transitório, nunca "sem acesso".
      if (resp.status === 429) return { ...CONTA_INDEFINIDA, reason: 'rate-limited' };
      if (resp.status < 500) return { ...SEM_INFO_DE_CONTA, reason: `http-${resp.status}` };
      // 5xx cai no retry abaixo.
    } catch {
      // rede/timeout: cai no retry abaixo.
    }
    if (attempt < ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  return { ...CONTA_INDEFINIDA, reason: 'network' };
}

// AUTO-REPARO DO APARELHO: quando a conta concede acesso e traz o
// correlationCode da assinatura, regravamos a chave local com esse código.
// É isso que conserta sozinho um aparelho cujo ponteiro está PODRE (apontando
// pra uma pendência criada por um clique em "Assinar" depois da compra) e é
// isso que faz um aparelho NOVO (ou o navegador limpo) voltar a funcionar
// offline/deslogado depois do primeiro login.
//
// Só grava na chave de CASAL quando o escopo veio explícito como 'couple' —
// escrever um código de assinatura solo ali destravaria as 5 telas exclusivas
// de casal por engano (hasCoupleAccess é calculado justamente pela chave de
// casal). Escopo desconhecido vai só pra chave solo, que é a conservadora.
export async function repairLocalCorrelationCodes(entries, { voce, amor, email } = {}) {
  const repaired = [];
  for (const entry of entries || []) {
    if (!entry?.hasAccess || !entry.correlationCode) continue;

    if (entry.scope === 'couple') {
      if (!voce || !amor) continue;
      const atual = await getCorrelationCode(voce, amor);
      if (atual !== entry.correlationCode) {
        await saveCorrelationCode(voce, amor, entry.correlationCode);
        repaired.push({ scope: 'couple', correlationCode: entry.correlationCode });
      }
      continue;
    }

    if (!email) continue;
    const atual = await getSoloCorrelationCode(email);
    if (atual !== entry.correlationCode) {
      await saveSoloCorrelationCode(email, entry.correlationCode);
      repaired.push({ scope: 'solo', correlationCode: entry.correlationCode });
    }
  }
  return repaired;
}

// O que o CoupleContext chama: consulta a conta e, se ela conceder acesso,
// conserta o ponteiro local antes de devolver.
export async function checkAccountAccess({ voce, amor, email } = {}) {
  const account = await fetchAccountSubscription();
  if (account.available && account.hasAccess) {
    try {
      await repairLocalCorrelationCodes(account.entries, { voce, amor, email });
    } catch {
      // auto-reparo é conveniência — falhar aqui NUNCA pode derrubar o acesso
      // que a conta acabou de conceder.
    }
  }
  return account;
}

// POST /api/subscription/claim — recupera a assinatura quando o e-mail do
// PAGAMENTO é diferente do e-mail do LOGIN (pagou no PayPal, no cartão do
// cônjuge, ou digitou outro e-mail na Hotmart). O correlationCode ainda salvo
// no aparelho é a prova de posse (128 bits gerados no servidor) — é a mesma
// prova que HOJE já concede acesso total; o claim só ESTREITA o poder dela
// (de acesso universal para acesso de uma conta), nunca amplia.
export async function claimSubscription(correlationCode) {
  if (!correlationCode) return { ok: false, reason: 'no-code' };
  const token = await getAuthToken();
  if (!token) return { ok: false, reason: 'no-session' };
  try {
    const resp = await fetchWithTimeout(`${API_BASE}/api/subscription/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ correlationCode }),
    });
    const data = await resp.json().catch(() => ({}));
    if (resp.ok) return { ok: true, data };
    // 409 = a assinatura já pertence a OUTRA conta (o servidor responde
    // genérico de propósito, sem revelar de quem é). 404 = backend antigo sem
    // a rota. Nenhum dos dois é motivo pra tirar acesso de ninguém.
    return { ok: false, status: resp.status, reason: `http-${resp.status}`, error: data?.error };
  } catch {
    return { ok: false, reason: 'network' };
  }
}

// Chave de "já tentei vincular este código nesta conta" — o rate limit do
// /claim é estrito (10/15min) e o refreshAccess roda de 5 em 5 minutos, então
// sem essa marca o auto-vínculo torraria o balde sozinho.
function claimTriedKey(userId, correlationCode) {
  return `gff-claim-tried:${userId}:${correlationCode}`;
}

async function jaTentouVincular(userId, correlationCode) {
  try {
    return (await AsyncStorage.getItem(claimTriedKey(userId, correlationCode))) !== null;
  } catch {
    // Sem storage não dá pra garantir "uma vez só" — melhor NÃO tentar do que
    // martelar o /claim a cada 5 minutos e tomar 429 na conta inteira.
    return true;
  }
}

async function marcarTentativaDeVinculo(userId, correlationCode) {
  try {
    await AsyncStorage.setItem(claimTriedKey(userId, correlationCode), String(Date.now()));
  } catch {
    // segue — o pior caso é tentar de novo no próximo ciclo.
  }
}

// Códigos que ESTE aparelho conhece (casal + solo), sem repetição.
async function localCorrelationCodes({ voce, amor, email }) {
  const codes = [];
  if (voce && amor) {
    const code = await getCorrelationCode(voce, amor);
    if (code) codes.push(code);
  }
  if (email) {
    const code = await getSoloCorrelationCode(email);
    if (code && !codes.includes(code)) codes.push(code);
  }
  return codes;
}

// AUTO-VÍNCULO SILENCIOSO (uma vez por conta+código): o aparelho tem acesso
// por código, mas a conta logada não conhece esse código — ou seja, é o caso
// "e-mail do pagamento ≠ e-mail do login", que o auto-vínculo por e-mail do
// GET /me nunca alcança. Vinculamos agora, enquanto a prova de posse (o
// código) ainda existe neste aparelho; sem isso, a pessoa só descobriria o
// problema depois de limpar os dados — quando já não teria mais como provar.
// Não muda nada na tela: quem já tinha acesso continua com acesso.
export async function autoLinkDeviceCodes({ userId, voce, amor, email, entries }) {
  if (!userId) return [];
  const conhecidos = new Set((entries || []).map((e) => e?.correlationCode).filter(Boolean));
  const codes = await localCorrelationCodes({ voce, amor, email });
  const linked = [];
  for (const code of codes) {
    if (conhecidos.has(code)) continue;
    if (await jaTentouVincular(userId, code)) continue;
    await marcarTentativaDeVinculo(userId, code);
    const result = await claimSubscription(code);
    if (result.ok) linked.push(code);
  }
  return linked;
}

// Versão MANUAL do auto-vínculo, disparada pelo botão "Recuperar minha
// assinatura" no Perfil: ignora a marca de "já tentei" (a pessoa pediu
// explicitamente) e devolve um resumo pra tela conseguir explicar o que houve.
export async function recoverSubscriptionFromDevice({ voce, amor, email } = {}) {
  const token = await getAuthToken();
  if (!token) return { attempted: 0, linked: 0, alreadyOwned: 0, failed: 0, reason: 'no-session' };

  const codes = await localCorrelationCodes({ voce, amor, email });
  if (codes.length === 0) return { attempted: 0, linked: 0, alreadyOwned: 0, failed: 0, reason: 'no-code' };

  let linked = 0;
  let alreadyOwned = 0;
  let failed = 0;
  for (const code of codes) {
    const result = await claimSubscription(code);
    if (result.ok) linked += 1;
    else if (result.status === 409) alreadyOwned += 1;
    else failed += 1;
  }
  return { attempted: codes.length, linked, alreadyOwned, failed };
}
