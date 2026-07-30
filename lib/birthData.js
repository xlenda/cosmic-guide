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

// ---- Espelho genérico '-mirror' pro Mapa Astral (BirthChartScreen) ---------
// O BirthChartScreen gravava 'birthChartSolo'/'birthChartCities' SÓ no
// SecureStore, com o erro engolido por catch{} — na web (stub vazio) NADA
// persistia: a pessoa preenchia data/hora/cidade, via Ascendente e casas, dava
// F5 e o formulário voltava vazio, pra sempre (bug real reproduzido por
// tester, 26/07/2026). Estes dois helpers seguem o padrão de
// readSecureJSON/writeSecureJSON de lib/coupleData.js (SecureStore primeiro,
// espelho em AsyncStorage SÓ quando ele falha) — no celular nada muda, o dado
// continua exclusivamente no Keychain/Keystore. O sufixo '-mirror' é
// OBRIGATÓRIO: é exatamente o que deleteAllCoupleData (lib/coupleData.js,
// mirrorKeyFor) já apaga em "apagar meus dados" — outro sufixo viraria um
// vazamento novo de dado de nascimento na web.
function mirrorKeyFor(secureKey) {
  return `${secureKey}-mirror`;
}

// string | null — valor cru (as telas fazem o próprio JSON.parse).
export async function readSecureItemWithMirror(key) {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (raw) return raw;
  } catch {
    // SecureStore indisponível (web) — segue pro espelho abaixo.
  }
  try {
    return await AsyncStorage.getItem(mirrorKeyFor(key));
  } catch {
    return null;
  }
}

export async function writeSecureItemWithMirror(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
    return;
  } catch {
    // web (stub vazio) ou Keychain indisponível — espelha em AsyncStorage.
  }
  try {
    await AsyncStorage.setItem(mirrorKeyFor(key), value);
  } catch {}
}

// Parse do que readSecureItemWithMirror devolver — com o espelho, o
// getAnyBirthData abaixo passa a enxergar o nascimento solo também na web
// (antes só via o SecureStore, morto lá, e dependia do birth-solo-mirror).
async function readSecure(key) {
  try {
    const raw = await readSecureItemWithMirror(key);
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

// A cidade do lado "você" do casal mora em 'birthChartCities' (é o
// BirthChartScreen quem grava, no formato { voce, amor }) — separada de
// birthA/birthB de propósito, então precisa ser lida à parte. Falha em
// silêncio: sem cidade salva o Céu de Hoje volta ao comportamento anterior.
async function cidadeDoCasal() {
  const cidades = await readSecure('birthChartCities');
  return (cidades && cidades.voce) || null;
}

// { date, time, city } | null — nunca fabrica: sem nascimento salvo em nenhuma
// fonte, devolve null e quem chama mostra o convite pra preencher o Mapa.
//
// `city` (pode ser null) foi acrescentado em 30/07/2026: lib/personalSky.js usa
// o fuso da cidade pra ler a hora de nascimento como hora de PAREDE, igual ao
// Mapa Astral faz. Sem ele o Céu de Hoje calcularia a Lua natal num instante
// 2–3h diferente do que o Mapa Astral mostra na tela ao lado. Quem só quer
// data/hora continua funcionando: o campo é opcional em todo consumidor.
export async function getAnyBirthData() {
  try {
    const { birthA } = await getBirthData();
    if (birthA && birthA.date) {
      return { date: birthA.date, time: birthA.time || null, city: await cidadeDoCasal() };
    }
  } catch {}
  const solo = await readSecure('birthChartSolo');
  if (solo && solo.date) return { date: solo.date, time: solo.time || null, city: solo.city || null };
  try {
    const raw = await AsyncStorage.getItem(SOLO_BIRTH_MIRROR_KEY);
    const mirror = raw ? JSON.parse(raw) : null;
    if (mirror && mirror.date) return mirror;
  } catch {}
  return null;
}
