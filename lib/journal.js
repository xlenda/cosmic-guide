// lib/journal.js
// Diário Cósmico — histórico unificado de todas as leituras (Tarô, Palma,
// Rosto, Pé, Pintas, Café, Sonhos), cada uma podendo carregar um insight
// gravado por voz da própria pessoa + a versão que a IA ajudou a lapidar
// (mantendo sempre o original, nunca substituindo — inspirado no app de
// leitura Ziggur, mas honesto: a IA só organiza o que a pessoa disse, nunca
// inventa um insight que ela não teve).
import AsyncStorage from '@react-native-async-storage/async-storage';
// O miolo de readJson/writeJson usa os wrappers de lib/storage.js: na primeira
// falha real de disco (SecurityError em iframe, cota cheia) a sessão inteira
// passa a ler e gravar em memória, em vez de "gravar e sumir" — a história
// completa está no cabeçalho de lib/storage.js. Chaves e chamadores não mudam.
import { getItemSeguro, setItemSeguro } from './storage';
import { syncDiaryToServer } from './webPush';
import { localDayStr, localISOString } from './localDay';

const JOURNAL_KEY = 'cosmic-journal';
const MAX_ENTRIES = 200; // nunca cresce sem limite
const WEEKLY_INSIGHTS_KEY = 'cosmic-weekly-insights';
const MAX_WEEKLY_INSIGHTS = 52; // ~1 ano de histórico semanal, nunca cresce sem limite

async function readJson(key, fallback) {
  try {
    const raw = await getItemSeguro(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    // getItemSeguro nunca lança — o try/catch aqui cobre só JSON.parse.
    return fallback;
  }
}

async function writeJson(key, value) {
  // setItemSeguro nunca lança: com o disco quebrado ele grava em memória de
  // sessão e devolve false — nada de escrita engolida em silêncio.
  await setItemSeguro(key, JSON.stringify(value));
}

// type: 'tarot' | 'palma' | 'rosto' | 'pe' | 'pintas' | 'coffee' | 'dream'
// (mesmas featureKeys já usadas em lib/featureUsage.js, reaproveitadas aqui
// só como rótulo — o Diário não interfere no bloqueio de 1 uso grátis).
export async function saveJournalEntry({ type, typeLabel, title, body }) {
  const entries = await readJson(JOURNAL_KEY, []);
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    typeLabel,
    title,
    body,
    // Timestamp LOCAL sem 'Z' (lib/localDay.js) — antes era toISOString()
    // (UTC): uma leitura de 31/07 21h30 no Brasil ganhava date de 01/08 e
    // caía no Wrapped de AGOSTO (monthlyWrapped.js filtra por prefixo de
    // mês). new Date(date) continua parseando certo (sem offset = hora
    // local), então exibição e ordenação não mudam; entradas antigas em UTC
    // seguem sendo datas válidas.
    date: localISOString(),
    voiceTranscript: null, // texto bruto, exatamente o que a pessoa falou
    aiInsight: null, // versão que a IA ajudou a organizar, a partir do transcript
  };
  entries.unshift(entry);
  // O CORTE RESPEITA AS FAVORITAS (01/08/2026). Antes era um slice(0, 200) seco
  // sobre a lista ordenada por data — e os Favoritos nasceram na véspera
  // justamente para "guardar e rever o que tocou". O corte apagava em silêncio
  // a leitura mais ANTIGA, que é exatamente a que a pessoa marcou com o
  // coração meses atrás: sem aviso, sem chance de recuperar, e mais garantido
  // quanto mais ela usa o app. Perder o que o usuário marcou pra guardar é o
  // pior tipo de bug — ele não aparece em tela nenhuma, só some.
  //
  // Agora as favoritas ficam FORA da conta do teto: cortamos só as não
  // favoritas. O teto vira "200 não favoritas + as favoritas", e quem marcou
  // pouco (o caso normal) não sente diferença nenhuma.
  // Percorre na ORDEM EM QUE JÁ ESTÁ (mais recente primeiro, garantido pelo
  // unshift acima) e vai deixando cair só as não favoritas depois do teto.
  // Nada de reordenar por data: a lista já está na ordem certa, e reordenar
  // com localeCompare quebrou o histórico numa primeira tentativa — entrada
  // antiga sem `date` no formato esperado subia pro topo. A ordem do Diário é
  // a ordem de inserção; o corte não é lugar de mexer nisso.
  let naoFavoritas = 0;
  const guardar = entries.filter((e) => {
    if (isEntradaFavorita(e)) return true;
    naoFavoritas += 1;
    return naoFavoritas <= MAX_ENTRIES;
  });
  await writeJson(JOURNAL_KEY, guardar);

  // Lembra o servidor de que o Diário foi usado hoje (scripts/send-diary-nudge-push.js
  // decide quem lembrar quando fica sem uso) — fire-and-forget, nunca trava o
  // retorno desta função nem fabrica um erro se falhar (mesmo espírito de
  // syncStreakToServer em lib/streak.js).
  // Dia LOCAL, mesma convenção do streak (syncStreakToServer também recebe o
  // dia local) — nunca toISOString/UTC.
  syncDiaryToServer(localDayStr());

  return entry.id;
}

// Anexa o insight de voz (+ versão da IA, se existir) numa entrada já salva —
// chamado depois que a pessoa grava e a IA processa, não author no momento
// da leitura em si (a pessoa pode fechar a tela sem gravar nada, e a leitura
// continua salva normalmente).
export async function attachVoiceInsight(entryId, { voiceTranscript, aiInsight }) {
  const entries = await readJson(JOURNAL_KEY, []);
  const updated = entries.map((e) =>
    e.id === entryId ? { ...e, voiceTranscript: voiceTranscript ?? e.voiceTranscript, aiInsight: aiInsight ?? e.aiInsight } : e
  );
  await writeJson(JOURNAL_KEY, updated);
}

export async function getJournalEntries() {
  return readJson(JOURNAL_KEY, []);
}

// ---- Destaque no Diário (recompensa da Loja, lib/cosmeticRewards é só
// tokens/selo — o efeito real de fixar vive aqui, junto do dono dos dados).
// Resgatar na Loja dá 1 crédito; a pessoa escolhe QUAL entrada fixar no topo
// (botão na DiaryScreen), e o destaque dura 7 dias. Uma fixação por vez —
// fixar outra substitui a anterior (não acumula banner infinito no topo).
const PIN_KEY = 'cosmic-journal-pin'; // { entryId, until: ISO }
const PIN_CREDITS_KEY = 'cosmic-journal-pin-credits';

export async function getPinCredits() {
  try {
    const raw = await AsyncStorage.getItem(PIN_CREDITS_KEY);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function addPinCredit() {
  const next = (await getPinCredits()) + 1;
  await writeJson(PIN_CREDITS_KEY, next);
  return next;
}

// { entryId, until } da fixação vigente, ou null se não há/expirou (expirada
// é apagada na leitura — nunca fica lixo pra trás).
export async function getActivePin() {
  const pin = await readJson(PIN_KEY, null);
  if (!pin || !pin.entryId) return null;
  if (new Date(pin.until).getTime() < Date.now()) {
    try {
      await AsyncStorage.removeItem(PIN_KEY);
    } catch {}
    return null;
  }
  return pin;
}

// Consome 1 crédito e fixa a entrada por 7 dias. Retorna false sem crédito —
// nunca fixa "de graça" nem deixa crédito negativo.
export async function pinEntry(entryId) {
  const credits = await getPinCredits();
  if (credits <= 0) return false;
  await writeJson(PIN_CREDITS_KEY, credits - 1);
  const until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await writeJson(PIN_KEY, { entryId, until });
  return true;
}

// Últimas até 7 leituras dos últimos `days` dias, mais recente primeiro —
// usado pelo "Insight da Semana" (lib/aiClient.js fetchAiWeeklyInsight).
// Nunca inventa: se não houver leitura nenhuma no período, devolve [].
export async function getRecentEntriesForWeeklyInsight(days = 7) {
  const entries = await getJournalEntries();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return entries.filter((e) => new Date(e.date).getTime() >= cutoff).slice(0, 7);
}

// Fallback honesto caso a IA real falhe (mesmo padrão de getFallbackWeeklySummary
// do café): nunca fabrica uma síntese nova, só lista as leituras reais já feitas.
export function getFallbackWeeklyInsight(entries) {
  const titles = entries.map((e) => `${e.typeLabel}: ${e.title}`).join('; ');
  return {
    title: 'Sua semana em revisão',
    body: `Essa semana você teve: ${titles}. Vale revisitar cada uma e notar o que se repete entre elas — às vezes o padrão só aparece quando se olha o conjunto.`,
  };
}

export async function deleteJournalEntry(entryId) {
  const entries = await readJson(JOURNAL_KEY, []);
  await writeJson(JOURNAL_KEY, entries.filter((e) => e.id !== entryId));
}

// ---- Favoritos (mecânica do nº 1 do mercado: guardar e rever o que tocou).
// O campo `favorito` NÃO existe nas entradas antigas de propósito — a regra de
// leitura é "ausente = não-favorita" (isEntradaFavorita), então nenhuma
// migração é necessária e nenhum dado antigo quebra. Persistência pelo MESMO
// readJson/writeJson do resto do journal — favoritar não cria chave nova de
// storage, a entrada inteira continua morando em JOURNAL_KEY.

// Único lugar que decide o que é "favorita" — a tela e getFavoriteEntries
// usam ESTE predicado, nunca leem e.favorito direto (senão a retrocompat
// viraria uma convenção espalhada em vez de uma função).
export function isEntradaFavorita(entry) {
  return !!(entry && entry.favorito === true);
}

// Liga/desliga o coração de UMA entrada. Devolve o novo estado (true/false),
// ou null se o id não existe — e nesse caso NÃO grava nada (toggle de id
// fantasma não pode reescrever a lista inteira à toa).
export async function toggleFavorito(entryId) {
  const entries = await readJson(JOURNAL_KEY, []);
  let next = null;
  const updated = entries.map((e) => {
    if (e.id !== entryId) return e;
    next = !isEntradaFavorita(e);
    return { ...e, favorito: next };
  });
  if (next === null) return null;
  await writeJson(JOURNAL_KEY, updated);
  return next;
}

// Só as favoritas, na MESMA ordem do diário (mais recente primeiro) — é o que
// alimenta o chip "Favoritas" da DiaryScreen.
export async function getFavoriteEntries() {
  const entries = await getJournalEntries();
  return entries.filter(isEntradaFavorita);
}

// Insight da Semana ANTES nascia e morria na mesma sessão (puro useState na
// DiaryScreen, jogado fora ao fechar ou trocar de tela) — mesmo a IA real
// tendo gerado uma síntese boa, ela nunca ficava disponível de novo. Persistir
// aqui é só parar de jogar fora o que já é gerado, sem nenhuma feature nova
// (achado real de auditoria de retenção, 25/07/2026).
export async function saveWeeklyInsight({ title, body }) {
  const history = await readJson(WEEKLY_INSIGHTS_KEY, []);
  const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, body, createdAt: new Date().toISOString() };
  history.unshift(entry);
  await writeJson(WEEKLY_INSIGHTS_KEY, history.slice(0, MAX_WEEKLY_INSIGHTS));
  return entry;
}

export async function getWeeklyInsightHistory() {
  return readJson(WEEKLY_INSIGHTS_KEY, []);
}

// O mais recente, só se ainda for desta semana (< 7 dias) — passado esse
// prazo já não representa "a semana atual", então a tela volta a oferecer
// gerar um novo em vez de reexibir um insight velho como se fosse atual.
export async function getLatestWeeklyInsight() {
  const history = await getWeeklyInsightHistory();
  if (!history.length) return null;
  const latest = history[0];
  const ageMs = Date.now() - new Date(latest.createdAt).getTime();
  if (ageMs > 7 * 24 * 60 * 60 * 1000) return null;
  return latest;
}
