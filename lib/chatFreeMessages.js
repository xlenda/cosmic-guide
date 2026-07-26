// lib/chatFreeMessages.js
// Chat libera algumas mensagens grátis (não só 1) antes de pedir assinatura —
// uma única mensagem não parece uma conversa de verdade. Pedido explícito do
// Lenda (25/07/2026): "deixar responder algumas coisas, uma ou duas
// perguntas". Contagem vitalícia (nunca reseta sozinha), mesmo espírito do
// "1 uso grátis" de lib/featureUsage.js, só que contando em vez de booleano.
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'chat-free-messages-sent';
export const FREE_MESSAGE_LIMIT = 2;

// Nunca lança — uma falha de storage devolve 0 (não trava a pessoa por causa
// de um erro técnico que não é culpa dela).
export async function getFreeMessagesSent() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

// Retorna a nova contagem em sucesso, ou null se falhar (quem chama deve
// tratar null como "não sabemos" — nunca travar por causa disso).
export async function incrementFreeMessagesSent() {
  try {
    const next = (await getFreeMessagesSent()) + 1;
    await AsyncStorage.setItem(STORAGE_KEY, String(next));
    return next;
  } catch {
    return null;
  }
}

export async function hasReachedFreeMessageLimit() {
  return (await getFreeMessagesSent()) >= FREE_MESSAGE_LIMIT;
}
