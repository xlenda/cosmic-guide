// lib/birthData.js
// Fonte única de "data de nascimento da pessoa" pro Céu de Hoje
// (lib/personalSky.js). Ordem: (1) nascimento do casal (birthA via
// SecureStore, salvo pelo Quiz), (2) nascimento solo via SecureStore
// (BirthChartScreen), (3) espelho em AsyncStorage — necessário porque o
// expo-secure-store é um stub vazio na WEB (o app publicado!): sem o
// espelho, o dado solo nunca persistia entre sessões na web e o Céu de Hoje
// ficaria morto pra todo usuário web (limitação pré-existente do Mapa
// Astral, descoberta ao construir esta feature, 26/07/2026).
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { getBirthData } from './coupleData';

const SOLO_BIRTH_MIRROR_KEY = 'birth-solo-mirror'; // { date, time }

async function readSecure(key) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Chamado por BirthChartScreen.generateSolo junto do SecureStore — na web o
// SecureStore falha silenciosamente e este espelho é o que persiste de fato.
export async function saveSoloBirthMirror({ date, time }) {
  try {
    await AsyncStorage.setItem(SOLO_BIRTH_MIRROR_KEY, JSON.stringify({ date, time: time || null }));
  } catch {}
}

// { date, time } | null — nunca fabrica: sem nascimento salvo em nenhuma
// fonte, devolve null e quem chama mostra o convite pra preencher o Mapa.
export async function getAnyBirthData() {
  try {
    const { birthA } = await getBirthData();
    if (birthA && birthA.date) return { date: birthA.date, time: birthA.time || null };
  } catch {}
  const solo = await readSecure('birthChartSolo');
  if (solo && solo.date) return { date: solo.date, time: solo.time || null };
  try {
    const raw = await AsyncStorage.getItem(SOLO_BIRTH_MIRROR_KEY);
    const mirror = raw ? JSON.parse(raw) : null;
    if (mirror && mirror.date) return mirror;
  } catch {}
  return null;
}
