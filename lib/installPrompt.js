// lib/installPrompt.js
// "Instalar app" (PWA) — como o Cosmic Guide é só web, isso é o mais perto que
// existe de "baixar o app" sem loja. Android/Chrome tem um evento real
// (beforeinstallprompt) que permite um botão de instalação de verdade; iOS/
// Safari não expõe nenhuma API pra isso — só dá pra orientar a pessoa a fazer
// manualmente via Compartilhar → Adicionar à Tela de Início.
import { Platform } from 'react-native';

let deferredEvent = null;
let listeners = [];

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredEvent = e;
    listeners.forEach((cb) => cb(true));
  });
  window.addEventListener('appinstalled', () => {
    deferredEvent = null;
    listeners.forEach((cb) => cb(false));
  });
}

export function isInstallPromptAvailable() {
  return !!deferredEvent;
}

// Devolve uma função de "unsubscribe" (mesmo padrão de listener do React Navigation).
export function onInstallPromptChange(callback) {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

// Dispara o prompt nativo do navegador (só existe depois do evento
// beforeinstallprompt já ter acontecido) — devolve 'accepted'/'dismissed', ou
// null se não havia prompt disponível.
export async function promptInstall() {
  if (!deferredEvent) return null;
  deferredEvent.prompt();
  const choice = await deferredEvent.userChoice;
  deferredEvent = null;
  return choice.outcome;
}

export function isIOS() {
  if (Platform.OS !== 'web' || typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Já rodando como app instalado (não precisa oferecer instalar de novo).
export function isRunningStandalone() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator?.standalone === true;
}
