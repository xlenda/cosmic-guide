// Card de opt-in de notificação na Home — aparece UMA vez, e só depois da
// primeira atividade real (leitura concluída), que é o momento de empolgação
// em que a taxa de aceite é maior. Antes o único caminho era o toggle
// escondido em Perfil > Preferências, que quase ninguém acha sozinho.
//
// Regras pra não virar spam: nunca aparece antes da 1ª atividade, some pra
// sempre depois de qualquer decisão ("Ativar" OU "Agora não"), e nunca
// aparece se o push já está ativo ou não é suportado (ex.: iPhone sem
// "Adicionar à Tela de Início").
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from '../lib/webAlert';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { isWebPushSupported, isWebPushEnabled, subscribeToWebPush, webPushFailureMessage } from '../lib/webPush';

const PROMPT_DECIDED_KEY = 'notif-prompt-decided';

export default function NotifPromptCard({ sign, hasActivity }) {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        if (Platform.OS !== 'web' || !isWebPushSupported() || !hasActivity) return;
        const [decided, enabled] = await Promise.all([
          AsyncStorage.getItem(PROMPT_DECIDED_KEY),
          isWebPushEnabled(),
        ]);
        if (active && !decided && !enabled) setVisible(true);
      })();
      return () => {
        active = false;
      };
    }, [hasActivity])
  );

  if (!visible) return null;

  const decide = async () => {
    await AsyncStorage.setItem(PROMPT_DECIDED_KEY, 'true');
    setVisible(false);
  };

  const enable = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { ok, reason } = await subscribeToWebPush(sign && sign.name ? { name: sign.name, icon: sign.icon } : null);
      if (!ok) {
        // NUNCA falhar em silêncio — antes o card sumia sem explicação
        // nenhuma quando a ativação falhava (achado real: bug reportado pelo
        // dono do produto no Brave, que bloqueia push por padrão, 26/07/2026).
        // webPushFailureMessage() ainda devolve texto em PT (mora em
        // lib/webPush.js, fora deste lote) — só a moldura da mensagem
        // (título + o que fazer depois) passa pelo t() por enquanto.
        Alert.alert(t('home.notifPrompt.errorTitle'), webPushFailureMessage(reason) + '\n\n' + t('home.notifPrompt.errorHint'));
      }
    } finally {
      // Decidiu (deu certo ou não) — não insiste de novo; quem mudar de ideia
      // tem o toggle de sempre em Perfil > Preferências.
      await decide();
      setBusy(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name="notifications" size={20} color={colors.gold} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('home.notifPrompt.title')}</Text>
        <Text style={styles.text}>{t('home.notifPrompt.text')}</Text>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={enable} disabled={busy}>
            <Text style={styles.btnText}>{busy ? '…' : t('home.notifPrompt.cta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.laterBtn} activeOpacity={0.7} onPress={decide}>
            <Text style={styles.laterText}>{t('home.notifPrompt.later')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.gold + '55',
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,200,92,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { color: colors.text, fontSize: 14, fontWeight: '800' },
  text: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 3 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  btn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 18 },
  btnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  laterBtn: { paddingVertical: 9 },
  laterText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
});
