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
import { useCouple } from '../context/CoupleContext';
import { initiateCheckout } from '../lib/coupleData';
import GradientHeader from '../components/GradientHeader';

const HOTMART_CHECKOUT_ELEMENTS_SRC = 'https://checkout.hotmart.com/lib/hotmart-checkout-elements.js';
// Mesmo fallback hardcoded do funil web — mesmo produto/oferta Hotmart (ver
// blocker de "1 produto x 2 ofertas" reportado ao usuário).
const HOTMART_CHECKOUT_FALLBACK = 'https://pay.hotmart.com/W105128423R?bid=1783049846019';
const MOUNT_ID = 'hotmart-checkout-mount';

function loadHotmartScript() {
  return new Promise((resolve, reject) => {
    if (window.checkoutElements) return resolve();
    const existente = document.querySelector(`script[src="${HOTMART_CHECKOUT_ELEMENTS_SRC}"]`);
    if (existente) {
      existente.addEventListener('load', () => resolve());
      existente.addEventListener('error', () => reject(new Error('script falhou')));
      return;
    }
    const script = document.createElement('script');
    script.src = HOTMART_CHECKOUT_ELEMENTS_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('script falhou'));
    document.body.appendChild(script);
  });
}

// pt-BR amigável pra cada subscriptionStatus retornado pelo backend
// (checkSubscriptionStatus / CoupleContext) — 'pending' nunca chega aqui porque
// quem chama já trata esse caso como "ainda oferecer o checkout".
const STATUS_LABELS = {
  active: 'Ativa',
  past_due: 'Pagamento pendente',
  pending: 'Aguardando confirmação',
  canceled: 'Cancelada',
  expired: 'Expirada',
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

// Reusado pela versão web e pela nativa: quem já é assinante nunca deve ver o
// botão de checkout de novo (esse era o bug original de reoferecer "Começar 7
// dias grátis" pra quem já paga) — por isso este card não tem CTA nenhum.
function SubscriptionStatusCard({ status, currentPeriodEnd, onBack }) {
  const label = STATUS_LABELS[status] || status;
  const dataRenovacao = formatarDataBR(currentPeriodEnd);
  return (
    <View style={styles.root}>
      <GradientHeader title="Assinatura" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle" size={40} color={colors.accent} />
          <Text style={styles.cardTitle}>Você já é assinante</Text>
          <Text style={styles.cardText}>Status: {label}</Text>
          {dataRenovacao && <Text style={styles.cardText}>Renova em {dataRenovacao}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

function PlanosScreenWeb() {
  const navigation = useNavigation();
  const { coupleData, refreshAccess, hasAccess, subscriptionStatus, currentPeriodEnd } = useCouple();
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const abrirCheckout = useCallback(async () => {
    setErro('');
    setCarregando(true);
    setAberto(true);
    try {
      const data = await initiateCheckout(coupleData?.voce, coupleData?.amor);
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
      setErro('Não conseguimos abrir o checkout agora. Tente de novo em instantes.');
      setCarregando(false);
    }
  }, [coupleData]);

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

  // Quem já é assinante (trial, ativo, past_due, cancelado, expirado) nunca deve
  // ver o fluxo de checkout de novo — só 'pending' (aguardando confirmação do
  // webhook) ainda cai no fluxo normal abaixo, porque nesse ponto o checkout
  // pode não ter sido concluído de fato.
  if (hasAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
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
        title="Assinatura"
        subtitle="$5 USD/mês · 7 dias grátis"
        onBack={() => (aberto ? fecharCheckout() : navigation.goBack())}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!aberto && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Desbloqueie a experiência completa do casal</Text>
            <Text style={styles.cardText}>
              Linha do tempo, cápsulas do tempo, rotas de reconexão, progresso e retrospectiva — tudo isso
              fica liberado com a assinatura.
            </Text>
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={abrirCheckout}>
              <Text style={styles.btnText}>Começar meus 7 dias grátis →</Text>
            </TouchableOpacity>
          </View>
        )}

        {aberto && carregando && (
          <View style={styles.center}>
            <ActivityIndicator color={colors.accent} size="large" />
            <Text style={styles.centerText}>Preparando o checkout seguro…</Text>
          </View>
        )}

        {aberto && erro !== '' && (
          <View style={styles.card}>
            <Text style={styles.errorText}>{erro}</Text>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost]}
              activeOpacity={0.85}
              onPress={() => Linking.openURL(HOTMART_CHECKOUT_FALLBACK)}
            >
              <Text style={styles.btnGhostText}>Abrir o checkout em outra aba →</Text>
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
            <Text style={styles.backLinkText}>← Voltar</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// Fluxo nativo (iOS/Android da loja): o Hotmart Checkout Elements é um script
// carregado no DOM, então não roda aqui — em vez disso abrimos o fallback
// (HOTMART_CHECKOUT_FALLBACK) num navegador in-app via expo-web-browser, com o
// xcod do correlationCode já criado por initiateCheckout() anexado à URL, pra
// o webhook (HotmartPaymentProvider.parseWebhookEvent) conseguir correlacionar
// a compra a este casal do mesmo jeito que faz no funil web.
function PlanosScreenNative() {
  const navigation = useNavigation();
  const { coupleData, hasAccess, subscriptionStatus, currentPeriodEnd, refreshAccess } = useCouple();
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  useFocusEffect(
    useCallback(() => {
      refreshAccess();
    }, [refreshAccess])
  );

  const abrirCheckoutNativo = useCallback(async () => {
    setErro('');
    setCarregando(true);
    try {
      const data = await initiateCheckout(coupleData?.voce, coupleData?.amor);
      const xcod = data?.checkoutConfig?.xcod;
      const url = xcod
        ? `${HOTMART_CHECKOUT_FALLBACK}&xcod=${encodeURIComponent(xcod)}`
        : HOTMART_CHECKOUT_FALLBACK;
      await WebBrowser.openBrowserAsync(url);
      setCarregando(false);
      // A ativação real só chega pelo webhook (assíncrono) — isso só reflete o
      // que já processou até agora, igual ao refreshAccess-no-foco da web.
      refreshAccess();
    } catch (err) {
      setErro('Não conseguimos abrir o checkout agora. Tente de novo em instantes.');
      setCarregando(false);
      refreshAccess();
    }
  }, [coupleData, refreshAccess]);

  if (hasAccess && subscriptionStatus && subscriptionStatus !== 'pending') {
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
        title="Assinatura"
        subtitle="$5 USD/mês · 7 dias grátis"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Desbloqueie a experiência completa do casal</Text>
          <Text style={styles.cardText}>
            Linha do tempo, cápsulas do tempo, rotas de reconexão, progresso e retrospectiva — tudo isso
            fica liberado com a assinatura.
          </Text>
          {carregando ? (
            <ActivityIndicator color={colors.accent} size="large" style={styles.nativeLoader} />
          ) : (
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={abrirCheckoutNativo}>
              <Text style={styles.btnText}>Começar meus 7 dias grátis →</Text>
            </TouchableOpacity>
          )}
          {erro !== '' && <Text style={[styles.errorText, styles.nativeErrorSpacing]}>{erro}</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

export default function PlanosScreen() {
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
});
