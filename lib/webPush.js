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
// Devolve { ok, reason } em vez de só um boolean — antes qualquer falha (
// permissão negada, rede fora, navegador sem suporte real de verdade, etc.)
// virava o mesmo "Não foi possível ativar" genérico, sem dar pra pessoa (ou
// pra mim, revisando um bug reportado) diferenciar o motivo real (achado
// real de bug reportado pelo usuário, 25/07/2026: "notificação não funciona
// no perfil"). reason: 'unsupported' | 'permission-denied' | 'server-error'
// | 'browser-error' | null (só quando ok=true).
export async function subscribeToWebPush(personalSign) {
  if (!isWebPushSupported()) return { ok: false, reason: 'unsupported' };

  // `Notification` pode não existir mesmo com serviceWorker + PushManager
  // presentes — é exatamente o caso do Safari no iPhone fora da Tela de Início
  // e de algumas WebViews de Android. Sem esta guarda, a linha abaixo estourava
  // ReferenceError, caía no catch genérico e o usuário recebia a mensagem de
  // "aba anônima", que não tem nada a ver com o problema dele (achado ao
  // investigar "não consigo ativar o pensamento diário", 27/07/2026).
  if (typeof Notification === 'undefined') return { ok: false, reason: 'unsupported' };

  try {
    // Quando a pessoa já negou alguma vez, requestPermission() devolve 'denied'
    // na hora, sem perguntar nada — a tela parecia não reagir. Lendo o estado
    // antes, a mensagem certa (ícone de cadeado ao lado do endereço) aparece
    // sempre, em vez de só quando o navegador resolve perguntar de novo.
    if (Notification.permission === 'denied') return { ok: false, reason: 'permission-denied' };

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, reason: 'permission-denied' };

    const registration = await navigator.serviceWorker.register(SW_URL, { scope: SW_SCOPE });
    await navigator.serviceWorker.ready;

    const keyResp = await fetch(`${API_BASE}/api/push/vapid-public-key`);
    if (!keyResp.ok) return { ok: false, reason: 'server-error' };
    const { publicKey } = await keyResp.json();
    if (!publicKey) return { ok: false, reason: 'server-error' };

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
    if (!resp.ok) return { ok: false, reason: 'server-error' };

    await AsyncStorage.setItem(ENABLED_KEY, 'true');
    return { ok: true, reason: null };
  } catch (err) {
    // O Brave DESLIGA o serviço de push do Google por padrão (política do
    // navegador) — pushManager.subscribe estoura mesmo com permissão
    // concedida. Detectável via navigator.brave, e a solução é uma
    // configuração que só o usuário pode ligar (achado real: bug reportado
    // pelo dono do produto, que usa Brave, 26/07/2026). Chrome em aba
    // anônima falha igual, sem detecção possível — fica como caso genérico.
    try {
      if (typeof navigator !== 'undefined' && navigator.brave && (await navigator.brave.isBrave())) {
        return { ok: false, reason: 'brave-blocked' };
      }
    } catch {}
    return { ok: false, reason: 'browser-error' };
  }
}

// Mensagens por motivo de falha do subscribeToWebPush — num lugar só porque
// DUAS superfícies mostram isso (toggle do Perfil e card da Home); antes o
// card falhava em silêncio total e o Perfil dava mensagem genérica.
export const WEB_PUSH_FAILURE_MESSAGES = {
  unsupported:
    'Este navegador não suporta notificações push. No iPhone, adicione o app à Tela de Início primeiro (Safari > Compartilhar > Adicionar à Tela de Início) e tente de novo a partir dele.',
  'permission-denied':
    'Você negou a permissão de notificações. Ative manualmente nas configurações do site (ícone de cadeado ao lado do endereço) e tente de novo.',
  'server-error': 'Não conseguimos confirmar a ativação com o servidor agora. Tente de novo em instantes.',
  'brave-blocked':
    'O Brave bloqueia notificações push por padrão. Abra brave://settings/privacy, ative "Usar serviços do Google para mensagens push", reinicie o navegador e tente de novo — ou use o app no Chrome.',
  'browser-error':
    'Não foi possível ativar. Se estiver numa aba anônima/privada, isso nunca funciona nela (o próprio navegador bloqueia) — tente numa aba normal.',
};

export function webPushFailureMessage(reason) {
  return WEB_PUSH_FAILURE_MESSAGES[reason] || WEB_PUSH_FAILURE_MESSAGES['browser-error'];
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

// Garante que EXISTE uma inscrição de push, sem estragar a que já existe.
//
// O bug que esta função evita (achado na revisão do lembrete diário,
// 04/08/2026, antes de ir pro ar): o caminho óbvio pro toggle do lembrete era
// chamar subscribeToWebPush(null) — o card do check-in não tem o signo da
// pessoa em mãos. Só que subscribeToWebPush SEMPRE reenvia POST
// /api/push/subscribe, e o `save` do servidor faz
// `sign_name = excluded.sign_name` sem COALESCE. Ou seja: quem já tinha push
// ligado com o signo salvo perderia o signo ao ligar o lembrete — e o
// "Pensamento cósmico do dia" (scripts/send-daily-push.js personaliza o texto
// por row.sign_name) voltaria a ser genérico pra essa pessoa, sem ninguém
// entender por quê. Um recurso novo apagando dado de um recurso antigo é o
// pior tipo de regressão: silenciosa e num lugar que ninguém está olhando.
//
// A saída é não reinscrever quem já está inscrito: se o navegador já tem uma
// PushSubscription viva, não há nada a fazer — ela é exatamente a mesma que o
// servidor conhece (o endpoint é a chave). Só quem ainda não tem passa pelo
// fluxo completo, e nesse caso não existe signo pra perder.
//
// (A correção definitiva é um COALESCE no PushSubscriptionRepository.save do
// servidor. Ele não está em server-patches/ — o repo que é fonte da verdade do
// deploy — e trazer pra cá uma cópia vinda do repo obsoleto foi exatamente o
// que derrubou /api/cities em 01/08. Então a trava fica aqui, do lado do
// chamador, que é onde dá pra fazer certo sem apostar.)
export async function ensureWebPushSubscription() {
  if (!isWebPushSupported()) return { ok: false, reason: 'unsupported' };
  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (registration) {
      const existing = await registration.pushManager.getSubscription();
      if (existing) return { ok: true, reason: null };
    }
  } catch {
    // Falhou ao INSPECIONAR — não conclui nada, deixa o fluxo completo decidir.
  }
  return subscribeToWebPush(null);
}

// Liga/desliga o LEMBRETE DIÁRIO DO CHECK-IN no servidor (tabela
// push_daily_reminder, migração 014) — o toggle discreto que mora dentro do
// bloco de check-in da Home (components/DailyMissionsCard.js). Quem envia é o
// cron server-patches/scripts/enviar-lembrete-checkin.js.
//
// Espelha syncStreakToServer/syncDiaryToServer no formato (endpoint + `auth`
// como prova de posse — sem isso, quem descobrisse o endpoint de outra pessoa
// podia inscrevê-la num push diário que ela nunca pediu), mas com UMA
// diferença deliberada: aqui NÃO é fire-and-forget. Os syncs são efeito
// colateral de algo que já foi salvo no aparelho; este é a ação que a pessoa
// acabou de pedir, e um toggle que finge ter ligado quando o servidor recusou
// é a mesma quebra de confiança do card de notificação que sumia em silêncio
// (achado real, 26/07/2026). Por isso devolve boolean e quem chama decide o
// que mostrar.
//
// `lang` vai junto pro push sair na língua em que a pessoa lê o app — o
// servidor normaliza qualquer coisa fora de pt/es/en pra pt.
export async function setCheckinReminderOnServer(enabled, lang) {
  if (!isWebPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (!registration) return false;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return false;

    const { auth } = subscription.toJSON().keys;
    const resp = await fetch(`${API_BASE}/api/push/daily-reminder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint, auth, enabled, lang }),
    });
    return resp.ok;
  } catch {
    return false;
  }
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
