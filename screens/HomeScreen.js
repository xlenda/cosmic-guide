import React, { useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import HeroSection from '../components/HeroSection';
import CardGrid from '../components/CardGrid';
import { compatibility, compatPercent } from '../lib/signs';
import { useCouple } from '../context/CoupleContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coupleData, soloSign, loading, hasAccess, refresh } = useCouple();

  // O handoff de URL (?voce=&amor=&sa=&sb=) agora roda uma vez em App.js
  // (useUrlBootstrap), antes do gate decidir entre Quiz e Tab.Navigator — não
  // depende mais de HomeScreen montar, então aqui só resta o refresh normal.
  const load = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

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

  const greeting = isCouple ? `Olá, ${coupleData.voce} & ${coupleData.amor}` : `Olá, ${sign.pt}`;

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
    { key: 'horoscope', title: 'Horóscopo', subtitle: 'Previsão diária', icon: 'planet', gradient: ['#7B3FB5', '#A66CFF'], onPress: () => navigation.navigate(ROUTES.HOROSCOPE, { sign }) },
    { key: 'birthchart', title: 'Mapa Astral', subtitle: 'Sol, Lua e Asc.', icon: 'compass', gradient: ['#5CA8FF', '#6C7BFF'], onPress: () => navigation.navigate(ROUTES.BIRTH_CHART) },
    { key: 'tarot', title: 'Tarô por Tema', subtitle: 'Passado · Futuro', icon: 'sparkles', gradient: ['#FF6BA0', '#B57BFF'], onPress: () => navigation.getParent()?.navigate(ROUTES.TAROT_TAB) },
    { key: 'compatibility', title: 'Compatibilidade', subtitle: 'Match celestial', icon: 'heart', gradient: ['#FF8C5C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.COMPATIBILITY) },
    { key: 'timeline', title: 'Linha do Tempo', subtitle: 'Memórias do casal', icon: 'time', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.TIMELINE) },
    { key: 'reconectar', title: 'Reconectar', subtitle: 'Fortaleça o vínculo', icon: 'heart-circle', gradient: ['#FF7BD5', '#FF6BA0'], onPress: () => navigation.navigate(ROUTES.RECONECTAR) },
    { key: 'descobrir', title: 'Descobrir', subtitle: 'Conheçam-se mais', icon: 'telescope', gradient: ['#6C7BFF', '#B57BFF'], onPress: () => navigation.navigate(ROUTES.DESCOBRIR) },
    { key: 'agir', title: 'Agir', subtitle: 'Pequenos gestos', icon: 'flash', gradient: ['#FFC85C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.AGIR) },
    { key: 'progresso', title: 'Progresso', subtitle: 'Sequência e conquistas', icon: 'trophy', gradient: ['#5FD98C', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.PROGRESSO) },
    { key: 'retrospectiva', title: 'Retrospectiva', subtitle: 'O ano de vocês', icon: 'gift', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.RETROSPECTIVA) },
    { key: 'dream', title: 'Sonhos', subtitle: 'Interprete já', icon: 'moon', gradient: ['#5CE0D8', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.DREAM) },
    { key: 'palm', title: 'Leitura de Palma', subtitle: 'Sua mão revela', icon: 'hand-left', gradient: ['#FFB84D', '#FF8C5C'], onPress: () => navigation.navigate(ROUTES.PALM) },
    { key: 'coffee', title: 'Ritual do Café', subtitle: 'Borra mística', icon: 'cafe', gradient: ['#B57BFF', '#7B3FB5'], onPress: () => navigation.navigate(ROUTES.COFFEE) },
    { key: 'chat', title: 'Chat Espiritual', subtitle: 'Conselho rápido', icon: 'chatbubbles', gradient: ['#6C7BFF', '#5CE0D8'], onPress: () => navigation.getParent()?.navigate(ROUTES.CHAT_TAB) },
  ];

  const cardItems = ALL_ITEMS.filter((c) => isCouple || !COUPLE_ONLY.includes(c.key)).map((c) =>
    isCouple && !hasAccess && LOCKED_KEYS.includes(c.key) ? { ...c, locked: true } : c
  );

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
                  <Text style={styles.horoDates}>{pct}% de compatibilidade</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.horoText}>{compat.texto}</Text>
              <Text style={styles.horoLink}>Ver compatibilidade completa</Text>
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
                  <Text style={styles.horoSign}>Compatibilidade do casal</Text>
                  <Text style={styles.horoDates}>Ainda não calculada</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.horoText}>Convide seu par para descobrir a compatibilidade entre os signos de vocês e acompanhar a sequência diária.</Text>
              <Text style={styles.horoLink}>Convidar meu par</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Feature grid */}
        <Text style={styles.sectionTitle}>Explore o cosmos</Text>
        <CardGrid items={cardItems} />

        {/* Cosmic event */}
        <Text style={styles.sectionTitle}>Evento cósmico</Text>
        <View style={styles.eventCard}>
          <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.eventInner}>
            <View style={styles.eventIcon}>
              <Ionicons name="star" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>Vênus em oposição a Júpiter</Text>
              <Text style={styles.eventDesc}>Um período poderoso para o amor e a abundância. Aproveite a energia expansiva.</Text>
              <Text style={styles.eventDate}>Hoje · 21h34</Text>
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
  horoCard: { marginHorizontal: 16, marginTop: -14, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
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
