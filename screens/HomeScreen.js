import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import HeroSection from '../components/HeroSection';
import CardGrid from '../components/CardGrid';
import { compatibility, compatPercent, aspects } from '../lib/signs';
import { getTodaysThought } from '../lib/dailyThought';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

function pad2(n) {
  return String(n).padStart(2, '0');
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coupleData, soloSign, loading, hasAccess, refresh } = useCouple();
  const { lang, t } = useLanguage();

  // O handoff de URL (?voce=&amor=&sa=&sb=) agora roda uma vez em App.js
  // (useUrlBootstrap), antes do gate decidir entre Quiz e Tab.Navigator — não
  // depende mais de HomeScreen montar, então aqui só resta o refresh normal.
  const load = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'es' ? 'es-ES' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Data de hoje em YYYY-MM-DD (mesmo formato que DatePickerModal já monta a
  // partir de campos locais — `${year}-${pad2(month)}-${pad2(day)}` — e que
  // aspects()/planetPositions() esperam). Usa getFullYear/getMonth/getDate
  // locais, não toISOString/UTC, pra não pular de dia perto da meia-noite em
  // fusos negativos como o do Brasil.
  const todayISO = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

  // Evento cósmico real (lib/signs.js aspects()) — hora omitida de propósito
  // (aspects/planetPositions já usam meio-dia como aproximação aceitável pra
  // planetas além da Lua). Memoizado por todayISO: a trigonometria só roda de
  // novo quando o dia muda, não a cada re-render da tela (loading, foco, etc.).
  const todaysAspects = useMemo(() => aspects(todayISO, null), [todayISO]);
  const cosmicEvent = useMemo(() => {
    if (!todaysAspects || todaysAspects.length === 0) return null;
    // Aspecto mais exato (menor orbe) entre os retornados de verdade — não fabricado.
    return todaysAspects.reduce((best, a) => (a.orb < best.orb ? a : best), todaysAspects[0]);
  }, [todaysAspects]);

  // Três estados possíveis nesta tela (o Gate em App.js garante que ao menos um
  // dos dois sinais existe): casal com quiz feito, solo com signo escolhido, ou
  // (teoricamente) nenhum dos dois — fallback igual ao anterior.
  const isCouple = !!coupleData;

  // Signo usado no badge do topo e na navegação do grid (Horóscopo) — usa o signo real
  // do casal quando existir, senão o signo solo, com o mesmo fallback de antes.
  const sign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || soloSign || zodiacSigns[0];

  // Sinastria real do casal (lib/signs.js) — null enquanto não houver os dois signos salvos.
  const compat = coupleData?.sa && coupleData?.sb ? compatibility(coupleData.sa, coupleData.sb) : null;
  const pct = coupleData?.sa && coupleData?.sb ? compatPercent(coupleData.sa, coupleData.sb) : null;

  const greeting = isCouple
    ? t('home.greetingCouple', { voce: coupleData.voce, amor: coupleData.amor })
    : t('home.greetingSolo', { sign: sign.pt });

  // Cards exclusivos do casal ficam escondidos por completo para usuários solo
  // (em vez de um prompt morto) — o upsell do card de compatibilidade acima já
  // cobre a conversão sem repetir a mensagem quatro vezes.
  const COUPLE_ONLY = ['timeline', 'reconectar', 'descobrir', 'agir', 'progresso', 'retrospectiva'];

  // Exclusivas de assinantes (mesmas 5 rotas bloqueadas por withFeatureGate em
  // App.js) — timeline fica de fora, é livre pra qualquer casal. Mostra o badge
  // de cadeado no grid (FeatureCard.js já tinha o prop `locked` pronto, só não
  // era usado ainda); o bloqueio real acontece na tela em si, via feature gate.
  const LOCKED_KEYS = ['reconectar', 'descobrir', 'agir', 'progresso', 'retrospectiva'];

  const ALL_ITEMS = [
    { key: 'horoscope', title: t('home.card.horoscope.title'), subtitle: t('home.card.horoscope.subtitle'), icon: 'planet', gradient: ['#7B3FB5', '#A66CFF'], onPress: () => navigation.navigate(ROUTES.HOROSCOPE, { sign }) },
    { key: 'birthchart', title: t('home.card.birthchart.title'), subtitle: t('home.card.birthchart.subtitle'), icon: 'compass', gradient: ['#5CA8FF', '#6C7BFF'], onPress: () => navigation.navigate(ROUTES.BIRTH_CHART) },
    { key: 'tarot', title: t('home.card.tarot.title'), subtitle: t('home.card.tarot.subtitle'), icon: 'sparkles', gradient: ['#FF6BA0', '#B57BFF'], onPress: () => navigation.getParent()?.navigate(ROUTES.TAROT_TAB) },
    { key: 'compatibility', title: t('home.card.compatibility.title'), subtitle: t('home.card.compatibility.subtitle'), icon: 'heart', gradient: ['#FF8C5C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.COMPATIBILITY) },
    { key: 'timeline', title: t('home.card.timeline.title'), subtitle: t('home.card.timeline.subtitle'), icon: 'time', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.TIMELINE) },
    { key: 'reconectar', title: t('home.card.reconectar.title'), subtitle: t('home.card.reconectar.subtitle'), icon: 'heart-circle', gradient: ['#FF7BD5', '#FF6BA0'], onPress: () => navigation.navigate(ROUTES.RECONECTAR) },
    { key: 'descobrir', title: t('home.card.descobrir.title'), subtitle: t('home.card.descobrir.subtitle'), icon: 'telescope', gradient: ['#6C7BFF', '#B57BFF'], onPress: () => navigation.navigate(ROUTES.DESCOBRIR) },
    { key: 'agir', title: t('home.card.agir.title'), subtitle: t('home.card.agir.subtitle'), icon: 'flash', gradient: ['#FFC85C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.AGIR) },
    { key: 'progresso', title: t('home.card.progresso.title'), subtitle: t('home.card.progresso.subtitle'), icon: 'trophy', gradient: ['#5FD98C', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.PROGRESSO) },
    { key: 'retrospectiva', title: t('home.card.retrospectiva.title'), subtitle: t('home.card.retrospectiva.subtitle'), icon: 'gift', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.RETROSPECTIVA) },
    { key: 'dream', title: t('home.card.dream.title'), subtitle: t('home.card.dream.subtitle'), icon: 'moon', gradient: ['#5CE0D8', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.DREAM) },
    { key: 'lunarCalendar', title: t('home.card.lunarCalendar.title'), subtitle: t('home.card.lunarCalendar.subtitle'), icon: 'planet', gradient: ['#5CA8FF', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.LUNAR_CALENDAR) },
    { key: 'palm', title: t('home.card.palm.title'), subtitle: t('home.card.palm.subtitle'), icon: 'hand-left', gradient: ['#FFB84D', '#FF8C5C'], onPress: () => navigation.navigate(ROUTES.PALM) },
    { key: 'coffee', title: t('home.card.coffee.title'), subtitle: t('home.card.coffee.subtitle'), icon: 'cafe', gradient: ['#B57BFF', '#7B3FB5'], onPress: () => navigation.navigate(ROUTES.COFFEE) },
    { key: 'chat', title: t('home.card.chat.title'), subtitle: t('home.card.chat.subtitle'), icon: 'chatbubbles', gradient: ['#6C7BFF', '#5CE0D8'], onPress: () => navigation.getParent()?.navigate(ROUTES.CHAT_TAB) },
  ];

  const cardItems = ALL_ITEMS.filter((c) => isCouple || !COUPLE_ONLY.includes(c.key)).map((c) =>
    isCouple && !hasAccess && LOCKED_KEYS.includes(c.key) ? { ...c, locked: true } : c
  );

  // Determinístico por data (lib/dailyThought.js) — mesmo texto pra todo
  // mundo que abrir o app hoje, muda sozinho à meia-noite. Mesmo conteúdo
  // que a notificação diária (Perfil > Pensamento cósmico diário) só avisa
  // que chegou — o texto de verdade sempre vive aqui dentro.
  const todaysThought = getTodaysThought();

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <HeroSection greeting={greeting} dateStr={dateStr} sign={sign} streak={coupleData?.streak} insetTop={insets.top} />

        {/* Pensamento cósmico do dia — mesmo formato de app de versículo
            diário, mas com o mesmo tom simbólico/honesto do resto do app. */}
        <View style={styles.thoughtCard}>
          <View style={styles.thoughtIcon}>
            <Ionicons name="sparkles" size={18} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.thoughtLabel}>Pensamento cósmico do dia</Text>
            <Text style={styles.thoughtText}>{todaysThought}</Text>
          </View>
        </View>

        {/* Compatibilidade do casal (sinastria real, lib/signs.js) */}
        {compat ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.horoCard}
            onPress={() => navigation.navigate(ROUTES.COMPATIBILITY)}
          >
            <LinearGradient colors={gradients.card} style={styles.horoInner}>
              <View style={styles.horoHead}>
                <View style={[styles.signChip, { backgroundColor: sign.color + '33' }]}>
                  <Text style={[styles.signChipGlyph, { color: sign.color }]}>{compat.emojiA}{compat.emojiB}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.horoSign}>{coupleData.sa} + {coupleData.sb}</Text>
                  <Text style={styles.horoDates}>{t('home.compatPercent', { pct })}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.horoText}>{compat.texto}</Text>
              <Text style={styles.horoLink}>{t('home.compatSeeMore')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.horoCard}
            onPress={() => navigation.navigate(ROUTES.QUIZ)}
          >
            <LinearGradient colors={gradients.card} style={styles.horoInner}>
              <View style={styles.horoHead}>
                <View style={[styles.signChip, { backgroundColor: colors.accent + '33' }]}>
                  <Ionicons name="heart-outline" size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.horoSign}>{t('home.compatTitleEmpty')}</Text>
                  <Text style={styles.horoDates}>{t('home.compatSubtitleEmpty')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.horoText}>{t('home.compatTextEmpty')}</Text>
              <Text style={styles.horoLink}>{t('home.compatLinkEmpty')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Feature grid */}
        <Text style={styles.sectionTitle}>{t('home.sectionExplore')}</Text>
        <CardGrid items={cardItems} />

        {/* Cosmic event */}
        <Text style={styles.sectionTitle}>{t('home.sectionCosmicEvent')}</Text>
        <View style={styles.eventCard}>
          <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.eventInner}>
            <View style={styles.eventIcon}>
              <Ionicons name="star" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {cosmicEvent
                  ? t('home.cosmicEventTitle', { planetA: cosmicEvent.planetA, aspect: cosmicEvent.aspectType.toLowerCase(), planetB: cosmicEvent.planetB })
                  : t('home.cosmicEventTitleEmpty')}
              </Text>
              <Text style={styles.eventDesc}>
                {cosmicEvent
                  ? t('home.cosmicEventDesc', { orb: cosmicEvent.orb.toFixed(1) })
                  : t('home.cosmicEventDescEmpty')}
              </Text>
              <Text style={styles.eventDate}>{t('home.cosmicEventDate', { date: dateStr })}</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  thoughtCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: 16, marginTop: -14, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  thoughtIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,200,92,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  thoughtLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thoughtText: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
  horoCard: { marginHorizontal: 16, marginTop: 0, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  horoInner: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  horoHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  signChip: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  signChipGlyph: { fontSize: 18 },
  horoSign: { color: colors.text, fontSize: 17, fontWeight: '800' },
  horoDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  horoText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  horoLink: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12, marginHorizontal: 16 },
  eventCard: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  eventInner: { flexDirection: 'row', padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, alignItems: 'flex-start' },
  eventIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,200,92,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  eventDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  eventDate: { color: colors.gold, fontSize: 12, fontWeight: '700', marginTop: 8 },
});
