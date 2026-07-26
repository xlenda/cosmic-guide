// lib/webPush.js
// Web Push real (chega na tela de bloqueio do celular) — enquanto o app for
// só web (sem publicação em loja), é a ÚNICA forma de notificação de verdade;
// o equivalente nativo (lib/notifications.js, expo-notifications) fica inerte
// no navegador. Depende do backend (forja-backend: /api/push/vapid-public-key,
// /subscribe, /unsubscribe) e do Service Worker em public/sw.js, registrado
// sob o mesmo caminho onde o app é servido (/cosmic-guide/).
//
// No iPhone/Safari, só funciona depois de "Adicionar à Tela de Início"
// (restrição da própria Apple, não deste código) — ver meta tags em
// public/index.html.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = 'https://api.cosmicguide.cloud';
const SW_URL = '/cosmic-guide/sw.js';
const SW_SCOPE = '/cosmic-guide/';
const ENABLED_KEY = 'web-push-enabled';

export function isWebPushSupported() {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    typeof window !== 'undefined' &&
    'PushManager' in window
  );
}

export async function isWebPushEnabled() {
  try {
    const raw = await AsyncStorage.getItem(ENABLED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

// A applicationServerKey da Push API exige Uint8Array, mas o backend devolve
// a chave VAPID pública em base64url (formato padrão do protocolo) — esta
// função só faz essa conversão de formato, nada mais.
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// personalSign: { name, icon } opcional — o mesmo "meu signo" já calculado em
// HomeScreen/ProfileScreen (casal ou solo), nunca escolhido aqui. Vai pro
// backend só pra personalizar o texto do envio diário (ver
// scripts/send-daily-push.js), nada sensível.
export async function subscribeToWebPush(personalSign) {
  if (!isWebPushSupported()) return false;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
    await navigator.serviceWorker.ready;

    const keyResp = await fetch(`${API_BASE}/api/push/vapid-public-key`);
    if (!keyResp.ok) return false;
    const { publicKey } = await keyResp.json();
    if (!publicKey) return false;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const subJson = subscription.toJSON();
    const resp = await fetch(`${API_BASE}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: { endpoint: subJson.endpoint, keys: subJson.keys },
        sign: personalSign && personalSign.name ? { name: personalSign.name, icon: personalSign.icon } : null,
      }),
    });
    if (!resp.ok) return false;

    await AsyncStorage.setItem(ENABLED_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}

// Chamado por lib/streak.js sempre que um dia novo é gravado — deixa o
// servidor saber o streak atual, pra scripts/send-streak-risk-push.js (cron
// noturno) poder decidir quem lembrar. Fire-and-forget: nunca lança, nunca
// bloqueia a tela por causa disso (streak local já foi salvo de qualquer jeito).
export async function syncStreakToServer(currentStreak, lastActiveDate) {
  if (!isWebPushSupported()) return;
  const enabled = await isWebPushEnabled();
  if (!enabled) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    // `auth` prova posse do endpoint pro backend (só quem tem a inscrição de
    // verdade no navegador conhece essa chave) — sem isso, quem descobrisse o
    // endpoint de outra pessoa podia forjar o streak dela (achado real de
    // auditoria, 25/07/2026).
    const { auth } = subscription.toJSON().keys;
    await fetch(`${API_BASE}/api/push/sync-streak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint, auth, lastActiveDate, currentStreak }),
    });
  } catch {}
}

// Chamado por lib/journal.js sempre que uma entrada nova é salva no Diário —
// deixa o servidor saber a data do último registro, pra
// scripts/send-diary-nudge-push.js (cron noturno) poder decidir quem
// lembrar. Fire-and-forget: nunca lança, nunca bloqueia a tela por causa
// disso (entry local já foi salva de qualquer jeito). Espelha
// syncStreakToServer exatamente.
export async function syncDiaryToServer(lastDiaryDate) {
  if (!isWebPushSupported()) return;
  const enabled = await isWebPushEnabled();
  if (!enabled) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    // `auth` prova posse do endpoint pro backend (só quem tem a inscrição de
    // verdade no navegador conhece essa chave) — sem isso, quem descobrisse o
    // endpoint de outra pessoa podia forjar a data do diário dela (mesmo
    // achado real de auditoria do sync-streak, 25/07/2026).
    const { auth } = subscription.toJSON().keys;
    await fetch(`${API_BASE}/api/push/sync-diary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint, auth, lastDiaryDate }),
    });
  } catch {}
}

export async function unsubscribeFromWebPush() {
  await AsyncStorage.setItem(ENABLED_KEY, 'false');
  if (!isWebPushSupported()) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (!registration) return;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return;

    const endpoint = subscription.endpoint;
    // Extrai a chave `auth` ANTES de unsubscribe() (prova de posse, mesmo
    // motivo do sync-streak acima) — depois de desinscrita, não dá mais pra
    // confiar que o objeto ainda exponha as chaves.
    const { auth } = subscription.toJSON().keys;
    await subscription.unsubscribe();
    // Best-effort: se a chamada falhar, o servidor ainda vai descobrir que a
    // inscrição expirou no próximo envio diário (404/410) e vai removê-la
    // sozinho — ver scripts/send-daily-push.js.
    fetch(`${API_BASE}/api/push/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint, auth }),
    }).catch(() => {});
  } catch {}
}
