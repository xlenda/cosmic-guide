// lib/tokens.js
// Economia de tokens local (por aparelho, igual ao resto do app — sem
// backend, mesmo padrão do featureUsage.js/journal.js). Ganha-se token por
// leitura concluída e por manter a sequência diária viva; gasta-se na Loja
// por recompensas do próprio app (nunca dinheiro real, nunca promete algo
// físico que ainda não tem logística resolvida).
import AsyncStorage from '@react-native-async-storage/async-storage';

const BALANCE_KEY = 'cosmic-tokens-balance';
const HISTORY_KEY = 'cosmic-tokens-history';
const READING_CAP_KEY = 'cosmic-tokens-reading-cap';
const MAX_HISTORY = 100;
let tokenMutationQueue = Promise.resolve();

function serializeTokenMutation(operation) {
  const result = tokenMutationQueue.then(operation, operation);
  tokenMutationQueue = result.catch(() => undefined);
  return result;
}

// Teto diário de tokens ganhos POR LEITURA (não afeta o bônus de marco de
// sequência em lib/streak.js, que já é raro por natureza). Sem isso, quem
// assina não tem limite nenhum nas leituras sem tema (Café/Sonhos/Palma/
// Compatibilidade — só o Tarô tinha limite de 1/tema/dia) e conseguia ficar
// clicando "Nova leitura" repetidamente pra resgatar a Loja inteira em
// minutos, o que esvazia o sentido da loja ser uma recompensa (achado real
// de bug reportado pelo usuário, 25/07/2026: "resgatar muito fácil").
export const DAILY_READING_TOKEN_CAP = 50;

export const TOKEN_REWARDS = {
  reading: 10, // qualquer leitura concluída (tarô, palma, café, sonho, etc.)
  streakDay: 5, // manter a sequência viva num dia novo
};

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

async function getTokenBalanceUnsafe() {
  return readJson(BALANCE_KEY, 0);
}

export async function getTokenBalance() {
  await tokenMutationQueue;
  return getTokenBalanceUnsafe();
}

// reason: rótulo curto pro histórico ("Leitura de Tarô", "Sequência de 3 dias")
// meta (opcional): carimbo estruturado no lançamento do histórico — hoje usado
// pelas missões diárias ({ kind: 'mission', day: 'YYYY-MM-DD' local }) pra
// lib/missions.js reforçar o teto diário CONTRA O PRÓPRIO HISTÓRICO (se
// alguém apagar só o estado do dia das missões mantendo o saldo, o extrato
// ainda prova quanto as missões já renderam hoje). Chamadas existentes com 2
// argumentos continuam idênticas.
export async function awardTokens(amount, reason, meta) {
  if (!amount || amount <= 0) return getTokenBalance();
  return serializeTokenMutation(async () => {
    const balance = await getTokenBalanceUnsafe();
    const newBalance = balance + amount;
    await writeJson(BALANCE_KEY, newBalance);

    const history = await readJson(HISTORY_KEY, []);
    history.unshift({ amount, reason, date: new Date().toISOString(), ...(meta ? { meta } : {}) });
    await writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));

    return newBalance;
  });
}

// Gasta tokens numa recompensa da Loja — recusa se não tiver saldo (nunca
// deixa o saldo negativo).
async function spendTokensUnsafe(amount, reason) {
  const balance = await getTokenBalanceUnsafe();
  if (amount > balance) return { ok: false, balance };
  const newBalance = balance - amount;
  const balanceCharged = await writeJson(BALANCE_KEY, newBalance);
  if (!balanceCharged) return { ok: false, balance, reason: 'storage_error' };

  const history = await readJson(HISTORY_KEY, []);
  history.unshift({ amount: -amount, reason, date: new Date().toISOString() });
  await writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));

  return { ok: true, balance: newBalance };
}

export async function spendTokens(amount, reason) {
  return serializeTokenMutation(() => spendTokensUnsafe(amount, reason));
}

// Compensa uma cobranca local quando a entrega digital falha. O saldo e a
// parte critica: `ok` so e true depois de o novo valor ter sido confirmado no
// AsyncStorage. O historico e best-effort, porque uma falha nele nao pode
// desfazer um estorno que ja voltou ao saldo da pessoa.
async function refundTokensUnsafe(amount, reason) {
  const balance = await getTokenBalanceUnsafe();
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, balance };

  const newBalance = balance + amount;
  const balanceRestored = await writeJson(BALANCE_KEY, newBalance);
  if (!balanceRestored) return { ok: false, balance };

  const history = await readJson(HISTORY_KEY, []);
  history.unshift({ amount, reason, date: new Date().toISOString(), meta: { kind: 'refund' } });
  await writeJson(HISTORY_KEY, history.slice(0, MAX_HISTORY));

  return { ok: true, balance: newBalance };
}

export async function refundTokens(amount, reason) {
  return serializeTokenMutation(() => refundTokensUnsafe(amount, reason));
}

// Saga curta para recompensas digitais: cobra, tenta entregar e, se a entrega
// disser explicitamente que falhou (`null`, `false` ou `undefined`), estorna.
// A Loja usa este caminho para a Leitura Bonus e para o brinde que a inclui.
// `deliver` nao deve chamar outra mutacao de tokens; ela entrega apenas o item.
export async function spendTokensForDelivery(amount, reason, deliver, refundReason) {
  return serializeTokenMutation(async () => {
    const spent = await spendTokensUnsafe(amount, reason);
    if (!spent.ok) return { ...spent, reason: spent.reason || 'insufficient' };

    let delivery;
    try {
      delivery = await deliver();
    } catch {
      delivery = null;
    }

    if (delivery !== null && delivery !== false && delivery !== undefined) {
      return { ok: true, balance: spent.balance, delivery };
    }

    const refund = await refundTokensUnsafe(amount, refundReason || reason);
    return {
      ok: false,
      reason: 'delivery_failed',
      refunded: refund.ok,
      balance: refund.balance,
    };
  });
}

export async function getTokenHistory() {
  await tokenMutationQueue;
  return readJson(HISTORY_KEY, []);
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Igual a awardTokens, mas respeitando o teto diário (DAILY_READING_TOKEN_CAP)
// de tokens ganhos por leitura — chamado só por lib/readingCompletion.js.
// Devolve o valor realmente concedido (pode ser menor que `amount`, ou 0 se o
// teto de hoje já foi atingido) — nunca lança, e nunca deixa passar do teto.
export async function awardReadingTokens(amount, reason) {
  if (!amount || amount <= 0) return 0;
  const today = todayISO();
  const state = await readJson(READING_CAP_KEY, { date: null, earned: 0 });
  const todayEarned = state.date === today ? state.earned : 0;
  const granted = Math.max(0, Math.min(amount, DAILY_READING_TOKEN_CAP - todayEarned));
  if (granted > 0) {
    await awardTokens(granted, reason);
    await writeJson(READING_CAP_KEY, { date: today, earned: todayEarned + granted });
  }
  return granted;
}
