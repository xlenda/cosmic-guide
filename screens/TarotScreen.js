import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import { TAROT_DECK } from '../lib/tarotDeck';
import { getThemedMeaning } from '../lib/tarotThemes';
import { canDrawToday, recordDraw, DAILY_LIMIT_THEMES } from '../lib/tarotDailyLimit';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import OneTimeLock from '../components/OneTimeLock';

const FEATURE_KEY = 'tarot';

const THEMES = [
  { key: 'Amor', icon: 'heart', color: '#FF6BA0', grad: ['#FF6BA0', '#B57BFF'] },
  { key: 'Carreira', icon: 'briefcase', color: '#5CA8FF', grad: ['#5CA8FF', '#6C7BFF'] },
  { key: 'Dinheiro', icon: 'cash', color: '#5FD98C', grad: ['#5FD98C', '#5CE0D8'] },
  { key: 'Energia', icon: 'flash', color: '#FFB84D', grad: ['#FFB84D', '#FF8C5C'] },
  { key: 'Saúde', icon: 'medkit', color: '#5CE0D8', grad: ['#5CE0D8', '#6C7BFF'] },
];

const POSITIONS = ['Passado', 'Presente', 'Futuro'];

export default function TarotScreen() {
  const insets = useSafeAreaInsets();
  const { hasAccess } = useCouple();
  const [theme, setTheme] = useState(THEMES[0]);
  const [drawn, setDrawn] = useState(null);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [orientations, setOrientations] = useState([false, false, false]);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const [locked, setLocked] = useState(false);

  // Dinheiro e Saúde liberam só 1 tiragem por dia (ver lib/tarotDailyLimit) —
  // recheca sempre que o tema muda, já que a resposta é assíncrona (AsyncStorage).
  useEffect(() => {
    let active = true;
    canDrawToday(theme.key).then((ok) => {
      if (active) setDailyBlocked(!ok);
    });
    return () => {
      active = false;
    };
  }, [theme.key]);

  // Bloqueio vitalício (1 uso grátis, pra tela inteira, qualquer tema) —
  // independente do dailyBlocked acima, que é o limite diário de Dinheiro/Saúde.
  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess]);

  const drawCards = () => {
    // Guarda também aqui, não só no botão inicial — sem isso, "Nova Tiragem"
    // (que chama esta mesma função) deixaria redesenhar à vontade num tema
    // com limite diário, mesmo já tendo consultado hoje.
    if (dailyBlocked) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5).slice(0, 3);
    const newOrientations = shuffled.map(() => Math.random() < 0.5);
    setDrawn(shuffled);
    setRevealed([false, false, false]);
    setOrientations(newOrientations);
    recordDraw(theme.key);
    markFeatureUsedOnce(FEATURE_KEY);
    if (DAILY_LIMIT_THEMES.includes(theme.key)) setDailyBlocked(true);
  };

  const reveal = (i) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  };

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Tarô por Tema" gradient={gradients.hero} />;
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title}>Tarô por Tema</Text>
        <Text style={styles.subtitle}>Tarô que não dourá a pílula — Passado · Presente · Futuro</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Escolha um tema</Text>
        <View style={styles.themeRow}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.themeChip, theme.key === t.key && { borderColor: t.color, backgroundColor: t.color + '22' }]}
              onPress={() => { Haptics.selectionAsync(); setTheme(t); setDrawn(null); }}
            >
              <Ionicons name={t.icon} size={20} color={t.color} />
              <Text style={styles.themeText}>{t.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!drawn ? (
          <View style={styles.emptyWrap}>
            <View style={styles.deckStack}>
              <LinearGradient colors={theme.grad} style={[styles.deckCard, { transform: [{ rotate: '-8deg' }] }]} />
              <LinearGradient colors={theme.grad} style={[styles.deckCard, { transform: [{ rotate: '4deg' }] }]}>
                <Ionicons name="sparkles" size={40} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </View>
            {dailyBlocked ? (
              <>
                <Ionicons name="time-outline" size={40} color={theme.color} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyTitle}>
                  Você já consultou o tema {theme.key} hoje. Essa tiragem é única por dia — assuntos sérios
                  como esse merecem uma resposta, não uma repetição até achar a que você quer ouvir. Volta amanhã.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>Concentre-se na sua pergunta sobre {theme.key.toLowerCase()}</Text>
                <TouchableOpacity activeOpacity={0.85} onPress={drawCards} style={styles.btnWrap}>
                  <LinearGradient colors={theme.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="hand-left" size={18} color="#fff" />
                    <Text style={styles.btnText}>Tirar 3 Cartas</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.cardsRow}>
              {drawn.map((card, i) => (
                <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => reveal(i)} style={styles.tarotCard}>
                  {revealed[i] ? (
                    <LinearGradient colors={theme.grad} style={[styles.tarotFace, orientations[i] && { transform: [{ rotate: "180deg" }] }]}>
                      <Ionicons name={card.icon} size={30} color="#fff" />
                      <Text style={styles.tarotName}>{card.name}</Text>
                      {orientations[i] && <Text style={styles.tarotName}>Invertida</Text>}
                    </LinearGradient>
                  ) : (
                    <LinearGradient colors={['#2A1D52', '#1A1235']} style={styles.tarotBack}>
                      <Ionicons name="sparkles" size={26} color={theme.color} />
                      <Text style={styles.tapText}>Toque</Text>
                    </LinearGradient>
                  )}
                  <Text style={styles.posLabel}>{POSITIONS[i]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {drawn.map((card, i) => revealed[i] && (
              <View key={i} style={styles.meaningCard}>
                <View style={[styles.meaningIcon, { backgroundColor: theme.color + '22' }]}>
                  <Ionicons name={card.icon} size={20} color={theme.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meaningPos}>{POSITIONS[i]} · {card.name}{orientations[i] ? " (invertida)" : ""}</Text>
                  <Text style={styles.meaningText}>{getThemedMeaning(card, theme.key, orientations[i])}</Text>
                </View>
              </View>
            ))}

            {dailyBlocked ? (
              <Text style={styles.dailyLimitNote}>
                Essa foi a sua tiragem de {theme.key} de hoje — volta amanhã pra uma nova.
              </Text>
            ) : (
              <TouchableOpacity activeOpacity={0.85} onPress={drawCards} style={[styles.btnWrap, { marginTop: 16 }]}>
                <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.btn}>
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.btnText}>Nova Tiragem</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  sectionLabel: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  themeChip: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 6 },
  themeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 20 },
  deckStack: { width: 120, height: 170, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  deckCard: { position: 'absolute', width: 110, height: 160, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  emptyTitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20, lineHeight: 22 },
  dailyLimitNote: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 19, paddingHorizontal: 10 },
  btnWrap: { borderRadius: 12, overflow: 'hidden', width: '100%' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  tarotCard: { alignItems: 'center', width: '31%' },
  tarotFace: { width: '100%', height: 150, borderRadius: 14, justifyContent: 'center', alignItems: 'center', padding: 8 },
  tarotBack: { width: '100%', height: 150, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 8 },
  tarotName: { color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  tapText: { color: colors.textMuted, fontSize: 11 },
  posLabel: { color: colors.textMuted, fontSize: 12, marginTop: 8, fontWeight: '600' },
  meaningCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  meaningIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  meaningPos: { color: colors.text, fontSize: 14, fontWeight: '800' },
  meaningText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 3 },
});
