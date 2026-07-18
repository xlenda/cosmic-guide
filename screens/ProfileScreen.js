import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import {
  isDailyThoughtEnabled,
  requestNotificationPermission,
  scheduleDailyThought,
  cancelDailyThought,
} from '../lib/notifications';
import { isWebPushSupported, isWebPushEnabled, subscribeToWebPush, unsubscribeFromWebPush } from '../lib/webPush';
import {
  isInstallPromptAvailable,
  onInstallPromptChange,
  promptInstall,
  isIOS,
  isRunningStandalone,
} from '../lib/installPrompt';

function MenuRow({ icon, label, onPress, last }) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function ToggleRow({ icon, label, value, onValueChange, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { coupleData, soloSign, hasAccess, clearAll } = useCouple();
  const { user, signOut } = useAuth();
  const [thoughtEnabled, setThoughtEnabled] = useState(false);
  const [webPushEnabled, setWebPushEnabled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  // Mesmo "meu signo" já calculado em HomeScreen.js (casal usa coupleData.sa,
  // solo usa soloSign) — reaproveitado aqui só pra personalizar o texto que o
  // Web Push manda todo dia (ver lib/webPush.js).
  const mySign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || soloSign || null;

  useEffect(() => {
    isDailyThoughtEnabled().then(setThoughtEnabled);
    if (Platform.OS === 'web') {
      isWebPushEnabled().then(setWebPushEnabled);
      setCanInstall(isInstallPromptAvailable());
      return onInstallPromptChange(setCanInstall);
    }
  }, []);

  async function handleInstallApp() {
    if (canInstall) {
      const outcome = await promptInstall();
      if (outcome === 'accepted') setCanInstall(false);
      return;
    }
    if (isIOS()) {
      Alert.alert(
        'Instalar no iPhone',
        'Toque no ícone de Compartilhar (□↑) na barra do Safari e depois em "Adicionar à Tela de Início".'
      );
      return;
    }
    Alert.alert(
      'Instalar o app',
      'Abra o menu do navegador e procure por "Instalar app" ou "Adicionar à Tela de Início".'
    );
  }

  async function toggleDailyThought(next) {
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          'Permissão necessária',
          'Ative as notificações do Cosmic Guide nas configurações do aparelho para receber o pensamento cósmico diário.'
        );
        return;
      }
      const ok = await scheduleDailyThought();
      setThoughtEnabled(ok);
    } else {
      await cancelDailyThought();
      setThoughtEnabled(false);
    }
  }

  async function toggleWebPush(next) {
    if (next) {
      const ok = await subscribeToWebPush(mySign);
      if (!ok) {
        Alert.alert(
          'Não foi possível ativar',
          'Permita notificações para o Cosmic Guide nas configurações do navegador (ou, no iPhone, adicione o app à Tela de Início primeiro) e tente de novo.'
        );
      }
      setWebPushEnabled(ok);
    } else {
      await unsubscribeFromWebPush();
      setWebPushEnabled(false);
    }
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Perfil" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.couple}>
          <View style={styles.coupleAvatar}>
            <Ionicons name="heart" size={26} color={colors.pink} />
          </View>
          {coupleData ? (
            <>
              <Text style={styles.coupleNames}>{coupleData.voce} & {coupleData.amor}</Text>
              <Text style={styles.coupleSigns}>{coupleData.sa} + {coupleData.sb}</Text>
            </>
          ) : (
            <>
              <Text style={styles.coupleNames}>Casal ainda não cadastrado</Text>
              <Text style={styles.coupleSigns}>Complete o quiz do casal na aba Início</Text>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.card}>
          <MenuRow
            icon="heart"
            label={coupleData ? 'Refazer quiz do casal' : 'Adicionar parceiro(a)'}
            onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
          />
          {/* Notificação local (expo-notifications) não existe de verdade na
              web — nesse caso mostramos o toggle de Web Push em vez dele
              (mesma ideia, tecnologia diferente por trás). */}
          {Platform.OS !== 'web' && (
            <ToggleRow
              icon="sparkles"
              label="Pensamento cósmico diário"
              value={thoughtEnabled}
              onValueChange={toggleDailyThought}
            />
          )}
          {Platform.OS === 'web' && isWebPushSupported() && (
            <ToggleRow
              icon="sparkles"
              label="Pensamento cósmico diário"
              value={webPushEnabled}
              onValueChange={toggleWebPush}
            />
          )}
          {/* "Instalar app" só faz sentido na web (nativo já é instalado por
              definição) e só quando ainda não está rodando como app instalado. */}
          {Platform.OS === 'web' && !isRunningStandalone() && (
            <MenuRow icon="download" label="Instalar app" onPress={handleInstallApp} />
          )}
          {/* Login opcional pra uso grátis — só vira obrigatório na hora de
              assinar (ver PlanosScreen.js). Aqui é só conveniência (sincronizar
              entre aparelhos, recuperar acesso). */}
          {user ? (
            <MenuRow
              icon="log-out"
              label={`Sair (${user.email})`}
              onPress={() =>
                Alert.alert('Sair da conta', 'Tem certeza que quer sair?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Sair', style: 'destructive', onPress: signOut },
                ])
              }
            />
          ) : (
            <MenuRow icon="log-in" label="Fazer login" onPress={() => navigation.navigate(ROUTES.LOGIN)} />
          )}
          <MenuRow icon="shield-checkmark" label="Privacidade" onPress={() => navigation.navigate(ROUTES.PRIVACY)} last={!coupleData} />
          {/* Assinatura só existe para casais — modo solo fica de fora (ver
              decisão do plano: monetização é a experiência de casal). */}
          {coupleData && (
            <MenuRow
              icon={hasAccess ? 'diamond' : 'lock-open'}
              label={hasAccess ? 'Gerenciar assinatura' : 'Assinar'}
              onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
              last
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  couple: { alignItems: 'center', marginBottom: 28, marginTop: 8 },
  coupleAvatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surfaceElevated,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  coupleNames: { color: colors.text, fontSize: 18, fontWeight: '800' },
  coupleSigns: { color: colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowLabel: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
});
