// lib/notifications.js
// Notificação diária local (sem backend nenhum) — usa o trigger nativo
// "DAILY" do expo-notifications, que o próprio sistema operacional repete
// sozinho todo dia no horário configurado (não precisa reagendar, não
// precisa o app estar aberto). O CONTEÚDO da notificação em si é sempre o
// mesmo texto genérico — o pensamento do dia de verdade (que muda por data)
// é mostrado dentro do app, via lib/dailyThought.js, quando a pessoa abre.
//
// expo-notifications não tem suporte real a agendamento local na web —
// todas as funções aqui viram no-op segura (Platform.OS === 'web'), pra
// nunca quebrar a versão web publicada em oddpro.pro/cosmic-guide.
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ENABLED_KEY = 'daily-thought-notifications-enabled';
const NOTIFICATION_ID_KEY = 'daily-thought-notification-id';
const DEFAULT_HOUR = 9;
const DEFAULT_MINUTE = 0;

// Import lazy (dentro de cada função) — mesmo padrão já usado em
// lib/signs.js pro astronomy-engine: se o pacote não estiver disponível por
// algum motivo, as funções abaixo falham graciosamente em vez de quebrar o
// require/bundling de quem importa este arquivo.
function getNotifications() {
  try {
    return require('expo-notifications');
  } catch {
    return null;
  }
}

export async function isDailyThoughtEnabled() {
  try {
    const raw = await AsyncStorage.getItem(ENABLED_KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;
  const Notifications = getNotifications();
  if (!Notifications) return false;
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const requested = await Notifications.requestPermissionsAsync();
    return !!requested.granted;
  } catch {
    return false;
  }
}

// Cancela a notificação diária anterior (se houver) e agenda uma nova via
// trigger DAILY — o SO repete sozinho, todo dia, nesse horário, até ser
// cancelada. hour/minute em horário local do aparelho.
export async function scheduleDailyThought(hour = DEFAULT_HOUR, minute = DEFAULT_MINUTE) {
  if (Platform.OS === 'web') return false;
  const Notifications = getNotifications();
  if (!Notifications) return false;

  try {
    await cancelDailyThought();

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '✨ Seu pensamento cósmico do dia chegou',
        body: 'Toque para ver a reflexão de hoje.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    await AsyncStorage.setItem(NOTIFICATION_ID_KEY, id);
    await AsyncStorage.setItem(ENABLED_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}

export async function cancelDailyThought() {
  await AsyncStorage.setItem(ENABLED_KEY, 'false');
  if (Platform.OS === 'web') return;
  const Notifications = getNotifications();
  if (!Notifications) return;

  try {
    const id = await AsyncStorage.getItem(NOTIFICATION_ID_KEY);
    if (id) {
      await Notifications.cancelScheduledNotificationAsync(id);
      await AsyncStorage.removeItem(NOTIFICATION_ID_KEY);
    }
  } catch {}
}
