// Retrospectiva Cósmica — wrapped MENSAL individual (a RetrospectivaScreen é a
// ANUAL de casal; esta celebra o mês da própria pessoa, sem par e sem gate).
// Todos os números vêm de lib/monthlyWrapped.js, que agrega só registro local
// real — mês vazio devolve null e a tela mostra um estado honesto em vez de
// celebrar zeros.
//
// Decisão de layout: seções full-height em ScrollView comum, sem pagingEnabled
// — paginação vertical nativa não se comporta igual no react-native-web (alvo
// principal do app hoje), e minHeight em vez de height fixa garante que slide
// com texto longo (frase de energia) role em vez de cortar em telas baixas.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { computeMonthlyWrapped, getWrappedMonth } from '../lib/monthlyWrapped';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';

// Mesma animação de contagem da RetrospectivaScreen (requestAnimationFrame +
// easing cúbico) — copiada em vez de extraída porque extrair tocaria num
// arquivo compartilhado, fora do escopo desta entrega.
function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const to = Number(value) || 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

// Emoji por tipo de leitura, só decoração do slide de favorito — cai num 🔮
// genérico pra tipo novo sem emoji mapeado (nunca quebra o slide).
const TYPE_EMOJI = {
  tarot: '🃏',
  coffee: '☕',
  dream: '🌙',
  palma: '✋',
  rosto: '🪞',
  pe: '🦶',
  pintas: '✨',
  horoscope: '♈',
  birthchart: '🧭',
  compatibility: '💞',
  chat: '💬',
  lunarCalendar: '🌗',
};

export default function MonthlyWrappedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { height: winH } = useWindowDimensions();

  // Por padrão celebra o mês anterior (janela dos dias 1–7, ver
  // isWrappedAvailable) — params permitem abrir outro mês sem mudar esta tela.
  const target = route.params?.year != null && route.params?.month != null
    ? { year: route.params.year, month: route.params.month }
    : getWrappedMonth();

  const [loaded, setLoaded] = useState(false);
  const [wrapped, setWrapped] = useState(null);

  const wrappedTypeLabel = (item) => (
    item?.type === 'chat' ? t('orbi.chat.diaryLabel') : item?.typeLabel
  );
  const wrappedEnergyPhrase = (energy) => (
    energy?.type === 'chat' ? t('wrapped.orbiEnergy') : energy?.phrase
  );

  const load = useCallback(async () => {
    const w = await computeMonthlyWrapped(target.year, target.month);
    setWrapped(w);
    setLoaded(true);
  }, [target.year, target.month]);

  // useEffect (não useFocusEffect): os números são de um mês já fechado, não
  // mudam enquanto a tela está aberta — recarregar a cada foco só faria a
  // animação de contagem reiniciar do zero sem informação nova.
  useEffect(() => { load(); }, [load]);

  async function handleShare() {
    if (!wrapped) return;
    const leituras = `${wrapped.totalReadings} ${wrapped.totalReadings === 1 ? 'leitura' : 'leituras'}`;
    const dias = `${wrapped.activeDays} ${wrapped.activeDays === 1 ? 'dia ativo' : 'dias ativos'}`;
    try {
      await Share.share({ message: `Meu mês cósmico de ${wrapped.monthLabel}: ${leituras}, ${dias} 🔮 — cosmicguide.cloud` });
    } catch {
      // cancelou ou o SO falhou — silêncio, mesmo padrão da RetrospectivaScreen
    }
  }

  const backBtn = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[styles.backBtn, { top: insets.top + 8 }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <Ionicons name="chevron-back" size={26} color="#fff" />
    </TouchableOpacity>
  );

  if (!loaded) {
    return (
      <View style={styles.root}>
        {backBtn}
        <ActivityIndicator color={colors.accent} style={{ marginTop: winH / 3 }} />
      </View>
    );
  }

  // Mês sem registro nenhum: estado honesto, sem número fabricado.
  if (!wrapped) {
    return (
      <View style={styles.root}>
        {backBtn}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌑</Text>
          <Text style={styles.emptyTitle}>{t('wrapped.empty')}</Text>
          <Text style={styles.emptyDesc}>
            A retrospectiva só conta o que você mesmo registrou no app — quando houver leituras, ela nasce sozinha.
          </Text>
          {/* O texto PEDE leituras; o único botão daqui era "Voltar", que não
              é a coisa pedida. HomeMain (a grade de leituras) mora no mesmo
              HomeStack — "Voltar" segue existindo, agora como secundário. */}
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate(ROUTES.HOME_MAIN)}>
            <Text style={styles.btnText}>{t('wrapped.empty.readingsCta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.goBack()}>
            <Text style={styles.btnGhostText}>{t('wrapped.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const slideStyle = [styles.slide, { minHeight: winH }];
  const hint = (
    <View style={styles.hint}>
      <Text style={styles.hintText}>{t('wrapped.swipe')}</Text>
      <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.7)" />
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slide 1 — total de leituras do mês */}
        <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.title')}</Text>
          <Text style={styles.monthLabel}>{wrapped.monthLabel}</Text>
          <Text style={styles.bigNumber}><CountUp value={wrapped.totalReadings} /></Text>
          <Text style={styles.caption}>
            {wrapped.totalReadings === 1 ? 'leitura registrada no seu Diário' : 'leituras registradas no seu Diário'}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide 2 — tipo favorito + energia do mês (só existe com leitura no mês) */}
        {wrapped.topType && (
          <LinearGradient colors={gradients.pink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
            <Text style={styles.overline}>{t('wrapped.favorite')}</Text>
            <Text style={styles.slideEmoji}>{TYPE_EMOJI[wrapped.topType.type] || '🔮'}</Text>
            <Text style={styles.mediumTitle}>{wrappedTypeLabel(wrapped.topType)}</Text>
            <Text style={styles.caption}>
              {wrapped.topType.count} {wrapped.topType.count === 1 ? 'vez este mês' : 'vezes este mês'}
            </Text>
            {wrapped.energy && <Text style={styles.energyPhrase}>{wrappedEnergyPhrase(wrapped.energy)}</Text>}
            {hint}
          </LinearGradient>
        )}

        {/* Slide 3 — dias ativos + melhor sequência dentro do mês */}
        <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.presence')}</Text>
          <Text style={styles.bigNumber}><CountUp value={wrapped.activeDays} /></Text>
          <Text style={styles.caption}>
            {wrapped.activeDays === 1 ? 'dia ativo no mês' : 'dias ativos no mês'}
          </Text>
          <View style={styles.divider} />
          <Text style={styles.secondaryNumber}>🔥 <CountUp value={wrapped.bestStreakInMonth} /></Text>
          <Text style={styles.caption}>
            {wrapped.bestStreakInMonth === 1 ? 'dia foi sua maior sequência' : 'dias seguidos foi sua maior sequência'}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide 4 — tokens ganhos no mês */}
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.harvest')}</Text>
          <Text style={styles.bigNumber}><CountUp value={wrapped.tokensEarned} /></Text>
          <Text style={styles.caption}>
            {wrapped.tokensEarned === 1 ? 'token ganho no mês' : 'tokens ganhos no mês'}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide final — resumo + compartilhar */}
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.glance')}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryRow}>
              🔮 {wrapped.totalReadings} {wrapped.totalReadings === 1 ? 'leitura' : 'leituras'}
            </Text>
            <Text style={styles.summaryRow}>
              📅 {wrapped.activeDays} {wrapped.activeDays === 1 ? 'dia ativo' : 'dias ativos'}
            </Text>
            <Text style={styles.summaryRow}>
              🔥 {wrapped.bestStreakInMonth} {wrapped.bestStreakInMonth === 1 ? 'dia de sequência' : 'dias de melhor sequência'}
            </Text>
            <Text style={styles.summaryRow}>
              🪙 {wrapped.tokensEarned} {wrapped.tokensEarned === 1 ? 'token ganho' : 'tokens ganhos'}
            </Text>
            {wrapped.energy && <Text style={styles.summaryEnergy}>{wrappedEnergyPhrase(wrapped.energy)}</Text>}
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleShare}>
            <Text style={styles.btnText}>{t('wrapped.share')}</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            Todos os números vêm do que você mesmo registrou no app — nada aqui foi inventado. Leituras são tradição simbólica, pra reflexão e entretenimento.
          </Text>
        </LinearGradient>
      </ScrollView>
      {backBtn}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  backBtn: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  slide: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 64 },

  overline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  monthLabel: { color: '#fff', fontSize: 22, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  bigNumber: { color: '#fff', fontSize: 96, fontWeight: '800', lineHeight: 104 },
  secondaryNumber: { color: '#fff', fontSize: 48, fontWeight: '800', lineHeight: 56 },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 16, textAlign: 'center', marginTop: 4 },

  slideEmoji: { fontSize: 72, marginVertical: 8 },
  mediumTitle: { color: '#fff', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  energyPhrase: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },

  divider: { width: 48, height: 2, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 1, marginVertical: 24 },

  summaryCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  summaryRow: { color: '#fff', fontSize: 17, fontWeight: '700', marginVertical: 4 },
  summaryEnergy: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
    lineHeight: 20,
  },

  btn: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
  btnText: { color: colors.background, fontSize: 15, fontWeight: '800' },
  btnGhost: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center', marginTop: 10 },
  btnGhostText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },

  hint: { position: 'absolute', bottom: 20, alignItems: 'center' },
  hintText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },

  disclaimer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 20 },
});
