// lib/journal.js
// Diário Cósmico — histórico unificado de todas as leituras (Tarô, Palma,
// Rosto, Pé, Pintas, Café, Sonhos), cada uma podendo carregar um insight
// gravado por voz da própria pessoa + a versão que a IA ajudou a lapidar
// (mantendo sempre o original, nunca substituindo — inspirado no app de
// leitura Ziggur, mas honesto: a IA só organiza o que a pessoa disse, nunca
// inventa um insight que ela não teve).
import AsyncStorage from '@react-native-async-storage/async-storage';

const JOURNAL_KEY = 'cosmic-journal';
const MAX_ENTRIES = 200; // nunca cresce sem limite

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
  } catch {}
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
    date: new Date().toISOString(),
    voiceTranscript: null, // texto bruto, exatamente o que a pessoa falou
    aiInsight: null, // versão que a IA ajudou a organizar, a partir do transcript
  };
  entries.unshift(entry);
  await writeJson(JOURNAL_KEY, entries.slice(0, MAX_ENTRIES));
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

export async function deleteJournalEntry(entryId) {
  const entries = await readJson(JOURNAL_KEY, []);
  await writeJson(JOURNAL_KEY, entries.filter((e) => e.id !== entryId));
}
