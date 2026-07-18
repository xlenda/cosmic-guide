import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabaseClient';
import { getTokenBalance } from '../lib/tokens';
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

const LANGUAGE_LABELS = { pt: '🇧🇷 PT', es: '🇪🇸 ES', en: '🇺🇸 EN' };

function LanguageRow({ lang, onChange, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name="language" size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>Idioma</Text>
      <View style={styles.langPills}>
        {Object.keys(LANGUAGE_LABELS).map((code) => (
          <TouchableOpacity
            key={code}
            style={[styles.langPill, lang === code && styles.langPillActive]}
            onPress={() => onChange(code)}
            activeOpacity={0.8}
          >
            <Text style={[styles.langPillText, lang === code && styles.langPillTextActive]}>
              {LANGUAGE_LABELS[code]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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

function InfoRow({ icon, label, value, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

// App version — hardcoded honestamente (não lê de lugar nenhum que possa
// divergir do que foi de fato publicado); atualizar manualmente se um dia
// isso importar de verdade pro usuário.
const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { coupleData, soloSign, hasAccess, clearAll } = useCouple();
  const { user, signOut } = useAuth();
  const { lang, changeLanguage } = useLanguage();
  const [thoughtEnabled, setThoughtEnabled] = useState(false);
  const [webPushEnabled, setWebPushEnabled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      getTokenBalance().then(setTokenBalance);
    }, [])
  );

  // Nome mostrado no card de conta: prioriza o que a pessoa já salvou, senão
  // cai pro início do e-mail (nunca mostra "undefined" ou vazio).
  const displayName = user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : '');

  function openEditName() {
    setNameInput(displayName);
    setEditingName(true);
  }

  async function saveName() {
    const nome = nameInput.trim();
    if (!nome) {
      Alert.alert('Nome vazio', 'Digite um nome antes de salvar.');
      return;
    }
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: nome } });
    setSavingName(false);
    if (error) {
      Alert.alert('Não foi possível salvar', error.message || 'Tente de novo em instantes.');
      return;
    }
    setEditingName(false);
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Deletar conta',
      'Isso vai sair da sua conta e apagar os dados salvos neste aparelho (nomes, signos, datas e sequência do casal). A conta de login em si continua existindo — pra removê-la de vez, escreva pra contato@cosmicguide.cloud.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair e apagar dados locais',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            await signOut();
            navigation.popToTop();
          },
        },
      ]
    );
  }

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

        {/* Nome só existe pra quem já tem conta (login continua opcional pro
            resto do app) — editar aqui chama supabase.auth.updateUser, que
            funciona com a chave publishable pro próprio usuário logado. */}
        {user && (
          <>
            <Text style={styles.sectionTitle}>Conta</Text>
            <View style={styles.card}>
              <View style={[styles.row, styles.rowBorder]}>
                <View style={styles.rowIcon}>
                  <Ionicons name="person" size={18} color={colors.accent} />
                </View>
                <Text style={styles.rowLabel}>{displayName || user.email}</Text>
                <TouchableOpacity onPress={openEditName} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <InfoRow icon="mail" label="E-mail" value={user.email} last />
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Preferências</Text>
        <View style={styles.card}>
          <MenuRow
            icon="heart"
            label={coupleData ? 'Refazer quiz do casal' : 'Adicionar parceiro(a)'}
            onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
          />
          <MenuRow
            icon="sparkles"
            label={`Meus Tokens (${tokenBalance})`}
            onPress={() => navigation.navigate(ROUTES.TOKENS)}
          />
          <LanguageRow lang={lang} onChange={changeLanguage} />
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

        <Text style={styles.sectionTitle}>Suporte</Text>
        <View style={styles.card}>
          <MenuRow icon="help-circle" label="Ajuda e suporte" onPress={() => navigation.navigate(ROUTES.HELP_SUPPORT)} />
          <MenuRow icon="document-text" label="Termos de uso" onPress={() => navigation.navigate(ROUTES.TERMS)} />
          <InfoRow icon="information-circle" label="Versão do app" value={APP_VERSION} last />
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={confirmDeleteAccount} activeOpacity={0.85}>
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}>Deletar conta</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Editar nome</Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Seu nome"
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setEditingName(false)}
                disabled={savingName}
              >
                <Text style={styles.btnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={saveName} disabled={savingName} activeOpacity={0.85}>
                <Text style={styles.btnText}>{savingName ? 'Salvando...' : 'Salvar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 8 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowLabel: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  rowValue: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  langPills: { flexDirection: 'row', gap: 6 },
  langPill: {
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  langPillActive: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  langPillText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  langPillTextActive: { color: colors.accent },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.red, borderRadius: 14, paddingVertical: 14, marginTop: 4,
  },
  dangerBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  modalSheet: {
    width: '100%', maxWidth: 360, backgroundColor: colors.surface, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, padding: 20,
  },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 16,
  },
  btn: { flex: 1, backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnGhost: {
    flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  btnGhostText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
});
