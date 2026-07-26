// Checkout real (Hotmart), embutido nesta tela via Checkout Elements — o backend
// (api-forja) gera um correlationCode server-side; a assinatura só ativa de fato
// quando o webhook de pagamento chega (assíncrono), então esta tela nunca assume
// acesso liberado na hora — só reconsulta o servidor (refreshAccess) ao focar.
//
// Mirror quase 1:1 de gilfforever/web/app/(funil)/planos/page.js
// (cargarScriptHotmart/abrirCheckout) — a única diferença estrutural é o ponto de
// montagem: RN's View não aceita `id`, então usamos `nativeID`, que o
// react-native-web repassa como o atributo `id` do <div> real no DOM.
//
// No nativo (Platform.OS !== 'web'), o checkout embutido via Elements não é
// viável (é um script/DOM), então abrirCheckoutNativo abre o fallback Hotmart
// num navegador in-app (expo-web-browser) e anexa o xcod do correlationCode já
// criado por initiateCheckout(), pra manter a mesma correlação que o webhook
// (HotmartPaymentProvider.parseWebhookEvent) já sabe ler em data.purchase.origin.xcod.
import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as WebBrowser from 'expo-web-browser';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { initiateCheckout, initiateSoloCheckout } from '../lib/coupleData';
import { trackInitiateCheckout } from '../lib/conversionTracking';
import GradientHeader from '../components/GradientHeader';

const HOTMART_CHECKOUT_ELEMENTS_SRC = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
// Link avulso de checkout por oferta (confirmado real pelo Lenda, 25/07/2026)
// — usado no fallback da web (quando o Checkout Elements embutido falha) e no
// fluxo nativo inteiro (que nunca usa Elements, é sempre um browser in-app).
// Antes só existia 1 link fixo (?bid=...) pro plano mensal; agora os 3 planos
// abrem o checkout certo em qualquer um dos dois casos.
const HOTMART_PAY_URLS = {
  trial: 'https://pay.hotmart.com/W105128423R?off=aqwv9uci',
  quarterly: 'https://pay.hotmart.com/W105128423R?off=7b1wqipw',
  annual: 'https://pay.hotmart.com/W105128423R?off=lb6plj87',
};
const MOUNT_ID = 'hotmart-checkout-mount';

function loadHotmartScript() {
  return new Promise((resolve, reject) => {
    if (window.checkoutElements) return resolve();
    // Se uma tentativa anterior falhou (rede instável), a tag <script> falha
    // continua no DOM — o browser não redispara load/error num script já
    // resolvido, então um retry que só reanexasse listeners nela nunca
    // resolveria nem rejeitaria de novo, travando "Preparando o checkout
    // seguro…" pra sempre (achado real de auditoria, 25/07/2026). Por isso
    // toda falha remove a tag: a próxima chamada sempre cria uma tag nova e
    // ganha eventos load/error de verdade.
    const existente = document.querySelector(`script[src="${HOTMART_CHECKOUT_ELEMENTS_SRC}"]`);
    if (existente) {
      existente.addEventListener('load', () => resolve());
      existente.addEventListener('error', () => {
        existente.remove();
        reject(new Error('script falhou'));
      });
      return;
    }
    const script = document.createElement('script');
    script.src = HOTMART_CHECKOUT_ELEMENTS_SRC;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error('script falhou'));
    };
    document.body.appendChild(script);
  });
}

// Mapeia o subscriptionStatus (snake_case, vem do backend) pra chave i18n
// (camelCase) — 'pending' nunca chega aqui porque quem chama já trata esse
// caso como "ainda oferecer o checkout".
const STATUS_I18N_KEY = {
  active: 'planos.status.active',
  past_due: 'planos.status.pastDue',
  pending: 'planos.status.pending',
  canceled: 'planos.status.canceled',
  expired: 'planos.status.expired',
};

// Parse simples de um ISO8601 (ex.: "2026-08-07T00:00:00.000Z") pra DD/MM/AAAA,
// sem lib nova. Retorna null se `iso` vier vazio/inválido.
function formatarDataBR(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
}

// Lista real do que a assinatura libera — pedido explícito do Lenda pra
// deixar claro "tudo que ela vai poder usufruir" antes de assinar (21/07/2026).
// As 9 primeiras já são grátis (1 uso) sem assinatura; as 5 seguintes hoje
// também ganharam 1 uso grátis (ver components/FeatureGate.js) — a assinatura
// é o que torna TODAS elas ilimitadas, não a única forma de ver cada uma.
// Traduzido (PT/ES/EN) — chaves planos.benefit.1..7 em lib/i18n.js.
// Solo (sem coupleData) só vê os benefícios 1-2 (trial + as 9 leituras
// individuais) — os benefícios 3-7 são as 5 telas exclusivas de casal
// (Reconectar/Descobrir/Agir/Progresso-Retrospectiva/Linha do tempo), que a
// assinatura solo não desbloqueia (só formar casal desbloqueia, ver
// components/FeatureGate.js e OneTimeLock.js).
const COUPLE_BENEFIT_KEYS = [1, 2, 3, 4, 5, 6, 7].map((n) => `planos.benefit.${n}`);
const SOLO_BENEFIT_KEYS = [1, 2].map((n) => `planos.benefit.${n}`);

function BenefitsList({ isCouple }) {
  const { t } = useLanguage();
  const keys = isCouple ? COUPLE_BENEFIT_KEYS : SOLO_BENEFIT_KEYS;
  return (
    <View style={styles.benefitsList}>
      {keys.map((key) => (
        <View key={key} style={styles.benefitRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
          <Text style={styles.benefitText}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );
}

// As 3 ofertas reais já cadastradas no mesmo produto Hotmart (Forja del amor)
// — mesmas features pras 3, a diferença é só o compromisso/economia. Preço
// mensal efetivo calculado só pra deixar a economia óbvia (não é cobrado
// assim, é sempre cobrado no valor cheio a cada ciclo). Pedido explícito do
// Lenda: oferecer o benefício de cada plano e deixar a pessoa escolher antes
// de abrir o checkout (25/07/2026).
// Os 3 planos têm 7 dias grátis (confirmado no painel Hotmart) — por isso
// o detalhe de cada card sempre menciona o trial, não só o mensal. price é
// universal (US$ é o mesmo símbolo nos 3 idiomas) — só label/cycle/detail/
// badge são traduzidos via lib/i18n.js (planos.plan.<id>.*).
const PLANS = [
  { id: 'trial', price: 'US$ 5' },
  { id: 'quarterly', price: 'US$ 10' },
  { id: 'annual', price: 'US$ 20' },
];

function PlanPicker({ selected, onSelect }) {
  const { t } = useLanguage();
  return (
    <View style={styles.planRow}>
      {PLANS.map((plan) => {
        const isSelected = plan.id === selected;
        const badge = t(`planos.plan.${plan.id}.badge`);
        const hasBadge = badge && badge !== `planos.plan.${plan.id}.badge`;
        return (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.85}
            onPress={() => onSelect(plan.id)}
            style={[styles.planCard, isSelected && styles.planCardSelected]}
          >
            {hasBadge && (
              <View style={styles.planBadge}>
                <Text style={styles.planBadgeText}>{badge}</Text>
              </View>
            )}
            <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>{t(`planos.plan.${plan.id}.label`)}</Text>
            <Text style={[styles.planPrice, isSelected && styles.planLabelSelected]}>{plan.price}</Text>
            <Text style={styles.planCycle}>{t(`planos.plan.${plan.id}.cycle`)}</Text>
            <Text style={styles.planDetail}>{t(`planos.plan.${plan.id}.detail`)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Reusado pela versão web e pela nativa: quem já é assinante nunca deve ver o
// botão de checkout de novo (esse era o bug original de reoferecer "Começar 7
// dias grátis" pra quem já paga) — por isso este card não tem CTA nenhum.
function SubscriptionStatusCard({ status, currentPeriodEnd, onBack }) {
  const { t } = useLanguage();
  const label = STATUS_I18N_KEY[status] ? t(STATUS_I18N_KEY[status]) : status;
  const dataRenovacao = formatarDataBR(currentPeriodEnd);
  return (
    <View style={styles.root}>
      <GradientHeader title={t('planos.header.title')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={40} color={colors.accent} />
          <Text style={styles.cardTitle}>{t('planos.alreadySubscriber')}</Text>
          <Text style={styles.cardText}>Status: {label}</Text>
          {dataRenovacao && <Text style={styles.cardText}>{t('planos.renewsOn', { date: dataRenovacao })}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

function PlanosScreenWeb() {
  const navigation = useNavigation();
  const { coupleData, refreshAccess, hasAccess, hasCoupleAccess, subscriptionStatus, currentPeriodEnd } = useCouple();
  const isCouple = !!coupleData;
  // O que decide se ainda há algo a comprar AQUI: pra casal, só a assinatura
  // de CASAL conta (uma assinatura solo ativa não desbloqueia as telas de
  // casal — ver hasCoupleAccess em CoupleContext.js); pra solo, o hasAccess
  // combinado. Sem essa distinção, um assinante solo que formava casal caía
  // num beco sem saída: o teaser mandava "Assinar" pra desbloquear as telas
  // de casal, mas esta tela respondia "Você já é assinante" sem nenhum CTA —
  // impossível comprar o upgrade (achado real de auditoria adversarial,
  // confirmado ao vivo, 26/07/2026).
  const relevantAccess = isCouple ? hasCoupleAccess : hasAccess;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('trial');

  const abrirCheckout = useCallback(async () => {
    trackInitiateCheckout();
    setErro('');
    setCarregando(true);
    setAberto(true);
    try {
      const data = isCouple
        ? await initiateCheckout(coupleData?.voce, coupleData?.amor, user?.email, selectedPlan)
        : await initiateSoloCheckout(user?.email, selectedPlan);
      await loadHotmartScript();
      window.checkoutElements
        .init('inlineCheckout', {
          offer: data.checkoutConfig.offerCode,
          xcod: data.checkoutConfig.xcod,
          ...(data.checkoutConfig.prefilledInfo || {}),
        })
        .mount(`#${MOUNT_ID}`);
      setCarregando(false);
    } catch (err) {
      setErro(t('planos.errorGeneric'));
      setCarregando(false);
    }
  }, [coupleData, user, selectedPlan, t]);

  const fecharCheckout = useCallback(() => {
    setAberto(false);
    setErro('');
  }, []);

  // A ativação real só chega pelo webhook do Hotmart, nunca na hora — então em
  // vez de assumir acesso liberado ao fechar o painel, só reconsultamos o
  // servidor sempre que a tela ganha foco de novo (voltar do checkout, etc.).
  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess])
  );

  // Quem já é assinante DO QUE ESTA TELA VENDE (trial, ativo, past_due,
  // cancelado, expirado) nunca deve ver o fluxo de checkout de novo — só
  // 'pending' (aguardando confirmação do webhook) ainda cai no fluxo normal
  // abaixo, porque nesse ponto o checkout pode não ter sido concluído de fato.
  if (relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
    return (
      <SubscriptionStatusCard
        status={subscriptionStatus}
        currentPeriodEnd={currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('planos.header.title')}
        subtitle={t('planos.header.subtitle')}
        onBack={() => (aberto ? fecharCheckout() : navigation.goBack())}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!aberto && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t(isCouple ? 'planos.unlockTitle' : 'planos.unlockTitleSolo')}</Text>
            <PlanPicker selected={selectedPlan} onSelect={setSelectedPlan} />
            <BenefitsList isCouple={isCouple} />
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={abrirCheckout}>
              <Text style={styles.btnText}>{t(`planos.cta.${selectedPlan}`)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {aberto && carregando && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.centerText}>{t('planos.preparing')}</Text>
          </View>
        )}

        {aberto && erro !== '' && (
          <View style={styles.card}>
            <Text style={styles.errorText}>{erro}</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(HOTMART_PAY_URLS[selectedPlan] || HOTMART_PAY_URLS.trial)}
            >
              <Text style={styles.btnGhostText}>{t('planos.openOtherTab')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ponto de montagem do Hotmart Checkout Elements. RN's View não aceita
            `id` — `nativeID` é o que react-native-web repassa como o atributo
            `id` do <div> real, exatamente o seletor que checkoutElements.mount()
            espera (#hotmart-checkout-mount, igual ao funil web). */}
        {aberto && (
          <View nativeID={MOUNT_ID} style={carregando ? styles.mountHidden : styles.mount} />
        )}

        {aberto && !carregando && (
          <TouchableOpacity style={styles.backLink} onPress={fecharCheckout}>
            <Text style={styles.backLinkText}>{t('planos.back')}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// Fluxo nativo (iOS/Android da loja): o Hotmart Checkout Elements é um script
// carregado no DOM, então não roda aqui — em vez disso abrimos o link avulso
// da oferta escolhida (HOTMART_PAY_URLS[selectedPlan]) num navegador in-app
// via expo-web-browser, com o xcod do correlationCode já criado por
// initiateCheckout() anexado à URL, pra o webhook
// (HotmartPaymentProvider.parseWebhookEvent) conseguir correlacionar a compra
// a este casal do mesmo jeito que faz no funil web. Antes os 3 planos abriam
// o mesmo link fixo do mensal — corrigido com os links reais de cada oferta
// (confirmados pelo Lenda, 25/07/2026).
function PlanosScreenNative() {
  const navigation = useNavigation();
  const { coupleData, hasAccess, hasCoupleAccess, subscriptionStatus, currentPeriodEnd, refreshAccess } = useCouple();
  const isCouple = !!coupleData;
  // Mesma distinção da versão web (ver comentário em PlanosScreenWeb).
  const relevantAccess = isCouple ? hasCoupleAccess : hasAccess;
  const { user } = useAuth();
  const { t } = useLanguage();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('trial');

  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess])
  );

  const abrirCheckoutNativo = useCallback(async () => {
    trackInitiateCheckout();
    setErro('');
    setCarregando(true);
    try {
      const data = isCouple
        ? await initiateCheckout(coupleData?.voce, coupleData?.amor, user?.email, selectedPlan)
        : await initiateSoloCheckout(user?.email, selectedPlan);
      const xcod = data?.checkoutConfig?.xcod;
      const baseUrl = HOTMART_PAY_URLS[selectedPlan] || HOTMART_PAY_URLS.trial;
      const url = xcod ? `${baseUrl}&xcod=${encodeURIComponent(xcod)}` : baseUrl;
      await WebBrowser.openBrowserAsync(url);
      setCarregando(false);
      // A ativação real só chega pelo webhook (assíncrono) — isso só reflete o
      // que já processou até agora, igual ao refreshAccess-no-foco da web.
      refreshAccess();
    } catch (err) {
      setErro(t('planos.errorGeneric'));
      setCarregando(false);
      refreshAccess();
    }
  }, [coupleData, refreshAccess, user, selectedPlan, t]);

  if (relevantAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
    return (
      <SubscriptionStatusCard
        status={subscriptionStatus}
        currentPeriodEnd={currentPeriodEnd}
        onBack={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('planos.header.title')}
        subtitle={t('planos.header.subtitle')}
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t(isCouple ? 'planos.unlockTitle' : 'planos.unlockTitleSolo')}</Text>
          <PlanPicker selected={selectedPlan} onSelect={setSelectedPlan} />
          <BenefitsList isCouple={isCouple} />
          {carregando ? (
            <ActivityIndicator color={colors.accent} size="large" style={styles.nativeLoader} />
          ) : (
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={abrirCheckoutNativo}>
              <Text style={styles.btnText}>{t(`planos.cta.${selectedPlan}`)}</Text>
            </TouchableOpacity>
          )}
          {erro !== '' && <Text style={[styles.errorText, styles.nativeErrorSpacing]}>{erro}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

// Login só é exigido AQUI, na hora de assinar — o resto do app funciona sem
// conta nenhuma. Motivo: sincronizar a assinatura com uma conta recuperável
// em vez de depender só do correlationCode local (frágil se a pessoa trocar
// de aparelho/limpar dados).
function LoginRequiredCard({ onLogin, onBack }) {
  const { t } = useLanguage();
  return (
    <View style={styles.root}>
      <GradientHeader title={t('planos.header.title')} subtitle={t('planos.header.subtitle')} onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Ionicons name="lock-closed" size={32} color={colors.gold} />
          <Text style={styles.cardTitle}>{t('planos.loginRequired.title')}</Text>
          <Text style={styles.cardText}>{t('planos.loginRequired.text')}</Text>
          <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={onLogin}>
            <Text style={styles.btnText}>{t('planos.loginRequired.cta')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

export default function PlanosScreen() {
  const navigation = useNavigation();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }
  if (!user) {
    return (
      <LoginRequiredCard
        onLogin={() => navigation.navigate(ROUTES.LOGIN)}
        onBack={() => navigation.goBack()}
      />
    );
  }

  if (Platform.OS !== 'web') return <PlanosScreenNative />;
  return <PlanosScreenWeb />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 22, alignItems: 'center',
  },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  benefitsList: { alignSelf: 'stretch', marginTop: 16, gap: 10 },
  benefitRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  benefitText: { flex: 1, color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  cardText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 10 },
  errorText: { color: colors.gold, fontSize: 14, textAlign: 'center', fontWeight: '600' },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 24, marginTop: 18, alignSelf: 'stretch', alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  center: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  centerText: { color: colors.textMuted, fontSize: 13, marginTop: 8, textAlign: 'center', lineHeight: 19 },
  mount: { minHeight: 480, marginTop: 16 },
  mountHidden: { minHeight: 0 },
  backLink: { alignItems: 'center', marginTop: 20 },
  backLinkText: { color: colors.textMuted, fontSize: 14, fontWeight: '600' },
  nativeLoader: { marginTop: 18 },
  nativeErrorSpacing: { marginTop: 14 },

  planRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 16 },
  planCard: {
    flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8, alignItems: 'center', backgroundColor: colors.surfaceElevated,
  },
  planCardSelected: { borderColor: colors.accent, backgroundColor: colors.accent + '18' },
  planBadge: {
    position: 'absolute', top: -10, backgroundColor: colors.gold, borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  planBadgeText: { color: '#2A1D00', fontSize: 9, fontWeight: '800' },
  planLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginTop: 6 },
  planLabelSelected: { color: colors.text },
  planPrice: { color: colors.textSecondary, fontSize: 18, fontWeight: '800', marginTop: 4 },
  planCycle: { color: colors.textMuted, fontSize: 11 },
  planDetail: { color: colors.gold, fontSize: 11, fontWeight: '700', marginTop: 6, textAlign: 'center' },
});
