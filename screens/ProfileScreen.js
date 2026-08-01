import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from '../lib/webAlert';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabaseClient';
import { getTokenBalance } from '../lib/tokens';
import { cardComoDecide } from '../lib/comoDecide';
import { hasSeloCosmico, hasGoldTheme } from '../lib/cosmeticRewards';
import { isGoldThemeActive, setGoldThemeActive } from '../theme';
import { shareInvite } from '../lib/coupleInvite';
import { getCorrelationCode, getSoloCorrelationCode } from '../lib/coupleData';
import { recoverSubscriptionFromDevice } from '../lib/accountSubscription';
import {
  isDailyThoughtEnabled,
  requestNotificationPermission,
  scheduleDailyThought,
  cancelDailyThought,
} from '../lib/notifications';
import { isWebPushSupported, isWebPushEnabled, subscribeToWebPush, unsubscribeFromWebPush, webPushFailureMessage } from '../lib/webPush';
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
  const { t } = useLanguage();
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name="language" size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{t('profile.pref.language')}</Text>
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

// Linha INTEIRA tocável, não só o Switch — relato real do dono (26/07/2026):
// "no pensamento cósmico diário não dá pra clicar no ícone". O Switch fica
// dentro de um View pointerEvents="none" (vira indicador visual) pra existir
// UM único dono do toque: sem isso, na web o clique no checkbox nativo e o
// onPress da linha disparariam JUNTOS (toggle duplo na mesma renderização).
// accessibilityRole/State fazem a linha inteira se anunciar como interruptor
// pra leitores de tela.
function ToggleRow({ icon, label, value, onValueChange, last }) {
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View pointerEvents="none">
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.accent }}
          thumbColor="#fff"
        />
      </View>
    </TouchableOpacity>
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

// Versão vinda do app.json pelo próprio bundle publicado (expo-constants), em
// vez de um literal aqui: a versão ficou presa em 1.0.0 enquanto o app.json já
// tinha avançado, e a tela mostrava um número que não era o que estava no ar
// (achado do dono, 27/07/2026). Assim ela nunca mais diverge do que foi
// publicado de verdade. O fallback só existe pro caso de o manifesto não estar
// disponível (ambiente de teste) — nunca inventa número novo.
const APP_VERSION =
  Constants.expoConfig?.version || Constants.manifest?.version || '—';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { coupleData, soloSign, hasAccess, hasCoupleAccess, clearAll, refreshAccess } = useCouple();
  const { user, signOut } = useAuth();
  // Pra casal, só a assinatura de CASAL conta como "já assinou" (uma solo
  // ativa não desbloqueia as telas de casal) — mesmo critério de
  // PlanosScreen.js/relevantAccess, senão o menu diria "Gerenciar assinatura"
  // pra quem ainda precisa comprar o plano de casal.
  const relevantAccess = coupleData ? hasCoupleAccess : hasAccess;
  const { lang, changeLanguage, t } = useLanguage();
  const [thoughtEnabled, setThoughtEnabled] = useState(false);
  const [webPushEnabled, setWebPushEnabled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [seloAtivo, setSeloAtivo] = useState(false);
  // Tema dourado (Loja): `owned` decide se o toggle aparece; o ligado/
  // desligado em si vive no localStorage síncrono (theme.js) porque a paleta
  // é aplicada no carregamento do módulo, antes de qualquer tela montar.
  const [goldOwned, setGoldOwned] = useState(false);
  const [goldActive, setGoldActive] = useState(isGoldThemeActive());
  const [recuperando, setRecuperando] = useState(false);
  // user==null NÃO garante que não existe sessão pra sair: o supabase guarda
  // os tokens em AsyncStorage (chave sb-<ref>-auth-token) e, quando o refresh
  // falha (offline, refresh token expirado), getSession devolve null MAS o
  // resíduo continua lá — a pessoa "deslogada" via só o botão vermelho de
  // deletar, sem nenhuma saída. Detectamos o resíduo pela chave pra mostrar
  // a saída também nesse caso; signOut() do supabase limpa o storage mesmo
  // sem sessão ativa (o _removeSession roda incondicionalmente).
  const [authResidue, setAuthResidue] = useState(false);
  // Releitura da VERDADE no storage — usada no mount e depois de cada
  // signOut(). Não dá pra assumir setAuthResidue(false) cegamente após sair:
  // se o aparelho está offline, o auth-js devolve erro retryable e NÃO chega
  // a remover a chave (o early-return de _signOut vem antes do
  // _removeSession) — o resíduo continua lá e o botão precisa continuar
  // visível, senão a sessão pode até "ressuscitar" no auto-refresh quando a
  // rede voltar, depois da pessoa achar que saiu.
  const recheckAuthResidue = React.useCallback(() => {
    AsyncStorage.getAllKeys()
      .then((keys) => setAuthResidue(keys.some((k) => /^sb-.*-auth-token$/.test(k))))
      .catch(() => {});
  }, []);
  useEffect(() => {
    if (user) {
      setAuthResidue(false);
      return;
    }
    recheckAuthResidue();
  }, [user, recheckAuthResidue]);
  const canSignOut = Boolean(user) || authResidue;

  useFocusEffect(
    React.useCallback(() => {
      getTokenBalance().then(setTokenBalance);
      hasSeloCosmico().then(setSeloAtivo);
      hasGoldTheme().then(setGoldOwned);
    }, [])
  );

  function toggleGoldTheme(next) {
    setGoldActive(next);
    setGoldThemeActive(next);
    // A paleta só é recapturada num carregamento novo (ver theme.js) — volta
    // pra RAIZ do app (não reload() da URL atual: a rota interna não existe
    // como arquivo no servidor estático e daria 404 num reload cru).
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.href = '/cosmic-guide/';
  }

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
      Alert.alert(t('profile.name.emptyTitle'), t('profile.name.emptyText'));
      return;
    }
    setSavingName(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: nome } });
    setSavingName(false);
    if (error) {
      Alert.alert(t('profile.name.saveErrorTitle'), error.message || t('profile.name.saveErrorFallback'));
      return;
    }
    setEditingName(false);
  }

  function confirmDeleteAccount() {
    const botoes = [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.delete.confirmWipe'),
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          await signOut();
          navigation.popToTop();
        },
      },
    ];
    // Pedido do dono (26/07/2026): quem só quer TROCAR de conta acabava
    // clicando no destrutivo por falta de opção. Entra como botão do MEIO
    // (Cancelar | Só sair | Sair e apagar) sempre que há sessão pra encerrar
    // — logada de verdade OU resíduo local de sessão expirada (canSignOut).
    // Só desloga, sem clearAll: nomes/signos/sequência ficam intactos e o
    // card de Conta passa a mostrar "Fazer login" pra entrar com outra conta.
    if (canSignOut) {
      botoes.splice(1, 0, {
        text: t('profile.delete.justSignOut'),
        onPress: async () => {
          await signOut();
          recheckAuthResidue();
        },
      });
    }
    Alert.alert(t('profile.delete.title'), t('profile.delete.text'), botoes);
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
      Alert.alert(t('profile.install.iosTitle'), t('profile.install.iosText'));
      return;
    }
    Alert.alert(t('profile.install.genericTitle'), t('profile.install.genericText'));
  }

  async function toggleDailyThought(next) {
    if (next) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(t('profile.notif.permTitle'), t('profile.notif.permText'));
        return;
      }
      const ok = await scheduleDailyThought();
      setThoughtEnabled(ok);
    } else {
      await cancelDailyThought();
      setThoughtEnabled(false);
    }
  }

  // Mensagem específica por motivo (webPushFailureMessage, lib/webPush.js —
  // compartilhada com o card da Home): antes era um texto genérico que
  // escondia o motivo real. O caso mais comum descoberto: Brave bloqueia o
  // push do Google por padrão (achado real, o dono do produto usa Brave).
  async function toggleWebPush(next) {
    if (next) {
      const { ok, reason } = await subscribeToWebPush(mySign);
      if (!ok) {
        Alert.alert(t('push.errorTitle'), webPushFailureMessage(reason));
      }
      setWebPushEnabled(ok);
    } else {
      await unsubscribeFromWebPush();
      setWebPushEnabled(false);
    }
  }

  // "Paguei e não estou vendo a assinatura." Acontece de verdade quando o
  // e-mail do PAGAMENTO é diferente do e-mail do LOGIN (pagou no PayPal, no
  // cartão do cônjuge, ou digitou outro e-mail na Hotmart): o vínculo
  // automático por e-mail nunca dispara. Este botão manda o correlationCode
  // que ainda está guardado NESTE aparelho (prova de posse) pro backend
  // vincular a assinatura à conta logada — a partir daí o acesso segue a
  // conta, não o aparelho.
  async function handleRecoverSubscription() {
    if (recuperando) return;
    setRecuperando(true);
    const resultado = await recoverSubscriptionFromDevice({
      voce: coupleData?.voce,
      amor: coupleData?.amor,
      email: user?.email,
    });
    setRecuperando(false);

    if (resultado.linked > 0) {
      await refreshAccess();
      Alert.alert(t('profile.recover.successTitle'), t('profile.recover.successText'));
      return;
    }
    if (resultado.reason === 'no-code') {
      Alert.alert(t('profile.recover.emptyTitle'), t('profile.recover.emptyText'));
      return;
    }
    if (resultado.alreadyOwned > 0) {
      Alert.alert(t('profile.recover.otherAccountTitle'), t('profile.recover.otherAccountText'));
      return;
    }
    Alert.alert(t('profile.recover.errorTitle'), t('profile.recover.errorText'));
  }

  function confirmSignOut() {
    Alert.alert(t('profile.signOut.title'), t('profile.signOut.text'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.signOut.confirm'),
        style: 'destructive',
        // Recheca o resíduo na mão: quando o signOut limpa só tokens órfãos
        // (user já era null), o AuthContext não re-renderiza nada e o botão
        // ficaria na tela apontando pra uma sessão que não existe mais.
        // Releitura (e não `false` direto) porque o signOut pode ter falhado
        // em limpar — ver comentário de recheckAuthResidue.
        onPress: async () => {
          await signOut();
          recheckAuthResidue();
        },
      },
    ]);
  }

  // Flags de visibilidade calculadas UMA vez por render. Existem porque a
  // última linha visível de cada card não pode ter borda de baixo (senão vira
  // um risco solto colado na borda do card) — e depois da reordenação a última
  // linha de "Preferências" passou a ser condicional. Ver `last` nos MenuRow.
  const showInstall = Platform.OS === 'web' && !isRunningStandalone();
  const showGoldToggle = goldOwned && Platform.OS === 'web';
  // Exatamente UMA das duas linhas de "pensamento cósmico diário" renderiza:
  // notificação local no nativo, Web Push na web (quando suportado).
  const showThought = Platform.OS !== 'web' || isWebPushSupported();
  const showRecover = Boolean(user) && !relevantAccess;

  return (
    <View style={styles.root}>
      <GradientHeader title={t('profile.header.title')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.couple}>
          <View style={styles.coupleAvatar}>
            <Ionicons name="heart" size={26} color={colors.pink} />
          </View>
          {coupleData ? (
            <>
              <View style={styles.coupleNamesRow}>
                <Text style={styles.coupleNames}>{coupleData.voce} & {coupleData.amor}</Text>
                {seloAtivo && <Ionicons name="ribbon" size={18} color={colors.gold} style={{ marginLeft: 6 }} />}
              </View>
              <Text style={styles.coupleSigns}>{coupleData.sa} + {coupleData.sb}</Text>
            </>
          ) : (
            <>
              {/* Selo Cósmico também no modo solo — a Loja vende essa
                  recompensa pra qualquer usuário, então ela precisa aparecer
                  pros dois modos (antes só o ramo de casal renderizava o
                  selo, deixando a compra invisível pra solo — achado real de
                  auditoria adversarial, 26/07/2026). */}
              <View style={styles.coupleNamesRow}>
                <Text style={styles.coupleNames}>{soloSign ? t('profile.soloUniverse', { sign: soloSign.pt || soloSign.name }) : t('profile.noCouple')}</Text>
                {seloAtivo && <Ionicons name="ribbon" size={18} color={colors.gold} style={{ marginLeft: 6 }} />}
              </View>
              <Text style={styles.coupleSigns}>{soloSign ? t('profile.soloInviteHint') : t('profile.noCoupleHint')}</Text>
              {/* Os dois textos acima só INFORMAM onde fica o quiz ("na aba
                  Início") — o botão que realmente leva existia só lá embaixo,
                  no card de Preferências, abaixo da dobra num celular. Aqui
                  ele fica colado no pedido. Mesmo salto de aba usado no
                  MenuRow "Adicionar meu par" (ProfileStack -> HomeStack). */}
              <TouchableOpacity
                style={styles.coupleCta}
                activeOpacity={0.85}
                onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
              >
                <Ionicons name="heart" size={14} color="#fff" />
                <Text style={styles.coupleCtaText}>
                  {soloSign ? t('profile.soloInviteCta') : t('profile.noCoupleCta')}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ORDEM DA TELA (convenção iOS/Android, reordenada em 26/07/2026 a
            partir de relato de tester real): conta/entrada no TOPO → ajustes no
            meio → suporte → e só então as ações de saída/destrutivas no FIM.
            Antes "Sair" ficava no MEIO do card de Preferências e o tester
            procurava no rodapé sem achar. Se for mexer aqui de novo, mantenha
            os itens de saída depois de tudo. */}

        {/* CARD 1 — CONTA. Nunca fica vazio: ou tem nome+e-mail (logado), ou
            tem "Fazer login" (deslogado). Sempre termina em "Assinar/Gerenciar
            assinatura", que é incondicional — por isso `last` aqui pode ser
            estático, sem risco de sobrar borda solta no rodapé do card. */}
        <Text style={styles.sectionTitle}>{t('profile.section.account')}</Text>
        <View style={styles.card}>
          {/* Nome só existe pra quem já tem conta (login continua opcional pro
              resto do app) — editar aqui chama supabase.auth.updateUser, que
              funciona com a chave publishable pro próprio usuário logado. */}
          {user ? (
            <>
              <View style={[styles.row, styles.rowBorder]}>
                <View style={styles.rowIcon}>
                  <Ionicons name="person" size={18} color={colors.accent} />
                </View>
                <Text style={styles.rowLabel}>{displayName || user.email}</Text>
                <TouchableOpacity onPress={openEditName} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <InfoRow icon="mail" label={t('profile.row.email')} value={user.email} />
            </>
          ) : (
            /* Login opcional pra uso grátis — só vira obrigatório na hora de
               assinar (ver PlanosScreen.js). Aqui é só conveniência (sincronizar
               entre aparelhos, recuperar acesso). Fica no TOPO porque é uma
               ação de ENTRADA, não de configuração. */
            <MenuRow icon="log-in" label={t('profile.row.login')} onPress={() => navigation.navigate(ROUTES.LOGIN)} />
          )}
          {/* "Instalar app" só faz sentido na web (nativo já é instalado por
              definição) e só quando ainda não está rodando como app instalado. */}
          {showInstall && (
            <MenuRow icon="download" label={t('profile.row.installApp')} onPress={handleInstallApp} />
          )}
          {/* Assinatura existe pra casal E solo agora (25/07/2026) — hasAccess
              já cobre os dois (CoupleContext.js checa em paralelo). */}
          <MenuRow
            icon={relevantAccess ? 'diamond' : 'lock-open'}
            label={relevantAccess ? t('profile.row.manageSubscription') : t('profile.row.subscribe')}
            onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
            last={!showRecover}
          />
          {/* Só pra quem está logado e NÃO está vendo assinatura nenhuma — é
              exatamente a tela de quem pagou e ficou sem acesso. Quem já tem
              acesso não precisa: o vínculo com a conta acontece sozinho
              (auto-vínculo em CoupleContext.refreshAccess). */}
          {showRecover && (
            <MenuRow
              icon="key"
              label={recuperando ? t('profile.row.recovering') : t('profile.row.recoverSubscription')}
              onPress={handleRecoverSubscription}
              last
            />
          )}
        </View>

        {/* CARD 2 — PREFERÊNCIAS. Só ajustes; nada de entrar/sair aqui. */}
        <Text style={styles.sectionTitle}>{t('profile.section.preferences')}</Text>
        <View style={styles.card}>
          <MenuRow
            icon="heart"
            label={coupleData ? t('profile.row.redoQuiz') : t('profile.row.addPartner')}
            onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
          />
          {/* Convite de verdade pro par (lib/coupleInvite.js): link de handoff
              + código de notificação — quem convidou recebe push na hora em
              que o par abrir o link. Só faz sentido com o casal já criado.

              O convite carrega também o código de acesso de quem convida
              (decisão do dono, 29/07/2026: o par usa de graça). A busca tenta
              o código de casal e cai no solo — quem assinou solo e depois
              formou casal convida com o código que realmente tem. Sem código
              nenhum (nunca assinou), o convite sai igual ao de sempre: leva o
              perfil, não leva acesso. */}
          {coupleData && (
            <MenuRow
              icon="paper-plane"
              label={t('profile.row.sendInvite', { amor: coupleData.amor })}
              onPress={async () => {
                let accessCode = null;
                try {
                  accessCode =
                    (await getCorrelationCode(coupleData.voce, coupleData.amor)) ||
                    (user?.email ? await getSoloCorrelationCode(user.email) : null);
                } catch {}
                shareInvite({ ...coupleData, accessCode });
              }}
            />
          )}
          <MenuRow
            icon="sparkles"
            label={t('profile.row.myTokens', { count: tokenBalance })}
            onPress={() => navigation.navigate(ROUTES.TOKENS)}
          />
          <LanguageRow lang={lang} onChange={changeLanguage} last={!showGoldToggle && !showThought} />
          {/* Só aparece pra quem COMPROU o tema na Loja (compra única) —
              ligar/desligar é grátis a partir daí. Web-only, ver theme.js. */}
          {showGoldToggle && (
            <ToggleRow
              icon="color-palette"
              label={t('profile.row.goldTheme')}
              value={goldActive}
              onValueChange={toggleGoldTheme}
              last={!showThought}
            />
          )}
          {/* Notificação local (expo-notifications) não existe de verdade na
              web — nesse caso mostramos o toggle de Web Push em vez dele
              (mesma ideia, tecnologia diferente por trás). */}
          {Platform.OS !== 'web' && (
            <ToggleRow
              icon="sparkles"
              label={t('profile.row.dailyThought')}
              value={thoughtEnabled}
              onValueChange={toggleDailyThought}
              last
            />
          )}
          {Platform.OS === 'web' && isWebPushSupported() && (
            <ToggleRow
              icon="sparkles"
              label={t('profile.row.dailyThought')}
              value={webPushEnabled}
              onValueChange={toggleWebPush}
              last
            />
          )}
        </View>

        {/* CARD 3 — SUPORTE. "Privacidade" veio do card de Preferências pra cá:
            é documento legal, mora junto com "Termos de uso". */}
        <Text style={styles.sectionTitle}>{t('profile.section.support')}</Text>
        <View style={styles.card}>
          {/* Rótulos reaproveitam a chave do TÍTULO de cada tela de destino
              (help/privacy/terms): rótulo do menu e cabeçalho da tela são o
              mesmo texto — duas chaves poderiam divergir na tradução. */}
          <MenuRow icon="help-circle" label={t('help.header.title')} onPress={() => navigation.navigate(ROUTES.HELP_SUPPORT)} />
          <MenuRow icon="shield-checkmark" label={t('privacy.header.title')} onPress={() => navigation.navigate(ROUTES.PRIVACY)} />
          <MenuRow icon="document-text" label={t('terms.header.title')} onPress={() => navigation.navigate(ROUTES.TERMS)} />
          {/* O rótulo sai do pack do próprio módulo (não de lib/i18n.js) pelo
              mesmo motivo já anotado acima pros outros: rótulo do menu e
              cabeçalho da tela são o MESMO texto, e duas chaves separadas
              divergiriam na tradução. */}
          <MenuRow icon="eye" label={cardComoDecide(lang).titulo} onPress={() => navigation.navigate(ROUTES.COMO_DECIDE)} />
          <InfoRow icon="information-circle" label={t('profile.row.appVersion')} value={APP_VERSION} last />
        </View>

        {/* RODAPÉ — saída e destruição, fora de qualquer card, onde todo mundo
            procura. O e-mail não vai mais no rótulo ("Sair (fulano@...)"):
            ele já aparece no card de Conta lá em cima, e um botão de rodapé com
            e-mail dentro quebra em telas estreitas.
            canSignOut (não `user`): sessão expirada deixa resíduo no storage
            com user==null — sem isso, essa pessoa só via o botão vermelho. */}
        {canSignOut && (
          <TouchableOpacity style={styles.logoutBtn} onPress={confirmSignOut} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={colors.red} />
            <Text style={styles.logoutBtnText}>{t('profile.signOut.title')}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.dangerBtn} onPress={confirmDeleteAccount} activeOpacity={0.85}>
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}>{t('profile.delete.title')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={editingName} transparent animationType="fade" onRequestClose={() => setEditingName(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('profile.name.editTitle')}</Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder={t('profile.name.placeholder')}
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.btnGhost}
                onPress={() => setEditingName(false)}
                disabled={savingName}
              >
                <Text style={styles.btnGhostText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={saveName} disabled={savingName} activeOpacity={0.85}>
                <Text style={styles.btnText}>{savingName ? t('profile.name.saving') : t('profile.name.save')}</Text>
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
  coupleNamesRow: { flexDirection: 'row', alignItems: 'center' },
  coupleNames: { color: colors.text, fontSize: 18, fontWeight: '800' },
  coupleSigns: { color: colors.textMuted, fontSize: 13, marginTop: 4, textAlign: 'center' },
  coupleCta: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accent, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10, marginTop: 12,
  },
  coupleCtaText: { color: '#fff', fontSize: 13, fontWeight: '800' },
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
  // "Sair" é ação de saída, não destrutiva: contorno + texto vermelho, sem
  // fundo cheio — assim não compete visualmente com "Deletar conta" logo
  // abaixo, que é a única de verdade irreversível.
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, paddingVertical: 14, marginBottom: 12,
  },
  logoutBtnText: { color: colors.red, fontSize: 15, fontWeight: '800' },
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
