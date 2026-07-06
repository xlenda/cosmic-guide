// Progresso — porta fiel de c:/tmp/gilfforever/web/app/(app)/progresso/page.js:
// os mesmos três agregadores de lib/activity.js (streak, computeBadges,
// monthlyRecap), só que lidos de forma assíncrona (AsyncStorage) em vez do
// localStorage síncrono original. Tela 100% leitura — não grava nada novo.
// O "ring" de streak do original usa CSS conic-gradient (sem equivalente nativo
// direto sem adicionar react-native-svg como dependência nova); aqui vira um
// círculo com borda sólida + número animado — mesma informação, sem dependência
// extra. CountUp reaproveita a mesma animação do original (requestAnimationFrame
// + performance.now), ambos já disponíveis nativamente em React Native.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';
import { getStreak } from '../lib/coupleData';
import { computeBadges, monthlyRecap } from '../lib/activity';

const HEADER_GRADIENT = ['#5FD98C', '#5CE0D8'];

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

export default function ProgressoScreen() {
  const navigation = useNavigation();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState({ count: 0, longest: 0 });
  const [badges, setBadges] = useState([]);
  const [recap, setRecap] = useState(null);

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const [s, b, r] = await Promise.all([
      getStreak(voce, amor),
      computeBadges(voce, amor),
      monthlyRecap(voce, amor),
    ]);
    setStreak(s);
    setBadges(b);
    setRecap(r);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title="Progresso" subtitle="Sequência e conquistas" onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>Complete o quiz do casal primeiro</Text>
          <Text style={styles.emptyProfileDesc}>
            Precisamos saber os nomes de vocês para acompanhar a sequência e as conquistas do casal.
          </Text>
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>Fazer o quiz do casal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const desbloqueadas = badges.filter((b) => b.unlocked).length;
  const todasDesbloqueadas = loaded && badges.length > 0 && desbloqueadas === badges.length;

  return (
    <View style={styles.root}>
      <GradientHeader title="Progresso" subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />

      {!loaded ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Sequência (streak) */}
          <View style={[styles.card, { alignItems: 'center' }]}>
            <View style={styles.ring}>
              <Text style={styles.ringValue}><CountUp value={streak.count} /></Text>
            </View>
            {streak.count > 0 ? (
              <Text style={styles.mutedText}>
                {streak.count === 1 ? 'dia seguido' : 'dias seguidos'} cuidando da relação 🔥
              </Text>
            ) : (
              <Text style={styles.mutedText}>
                Cada dia que vocês cuidam um do outro conta. Comecem hoje, {voce} e {amor} 💛
              </Text>
            )}
            {streak.longest > streak.count && (
              <Text style={styles.disclaimerInline}>Recorde de vocês: {streak.longest} dias seguidos.</Text>
            )}
          </View>

          {/* Resumo do mês */}
          {recap && (
            <View style={[styles.card, { marginTop: 14 }]}>
              <Text style={styles.overline}>Resumo do mês</Text>
              <Text style={[styles.sectionTitle, { marginTop: 2, textTransform: 'capitalize' }]}>{recap.mesLabel}</Text>
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{recap.memoriesThisMonth}</Text>
                  <Text style={styles.statLabel}>📸 memórias</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{recap.capsulesSealedThisMonth}</Text>
                  <Text style={styles.statLabel}>⏳ cápsulas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{recap.reconectarChecks}</Text>
                  <Text style={styles.statLabel}>💞 missões</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{recap.agirDoneCount}</Text>
                  <Text style={styles.statLabel}>🎯 gestos</Text>
                </View>
              </View>
            </View>
          )}

          {/* Conquistas */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionHeadTitle}>Conquistas ({desbloqueadas}/{badges.length})</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${badges.length ? (desbloqueadas / badges.length) * 100 : 0}%` }]} />
          </View>
          {todasDesbloqueadas && (
            <Text style={styles.celebration}>
              🎉 Vocês desbloquearam todas as conquistas, {voce} e {amor}! Continuem escrevendo a história de vocês.
            </Text>
          )}

          <View style={styles.badgeGrid}>
            {badges.map((b) => (
              <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeCardLocked]}>
                <Text style={styles.badgeEmoji}>{b.unlocked ? b.emoji : '🔒'}</Text>
                <Text style={styles.badgeTitle}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.disclaimer}>
            A sequência e as conquistas de vocês vêm só do que já foi guardado em Linha do Tempo, Reconectar,
            Descobrir e Agir — nada aqui é inventado.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },

  ring: {
    width: 150, height: 150, borderRadius: 75, borderWidth: 10, borderColor: colors.green,
    backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  ringValue: { color: colors.text, fontSize: 44, fontWeight: '800' },

  mutedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  disclaimerInline: { color: colors.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' },

  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },

  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 28, backgroundColor: colors.border, marginHorizontal: 6 },

  sectionHead: { marginTop: 24, marginBottom: 10 },
  sectionHeadTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },

  progressTrack: { height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4, backgroundColor: colors.green },
  celebration: { color: colors.gold, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 12 },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  badgeCard: {
    width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 14, padding: 14, alignItems: 'center',
  },
  badgeCardLocked: { opacity: 0.5 },
  badgeEmoji: { fontSize: 30, marginBottom: 6 },
  badgeTitle: { color: colors.text, fontSize: 13, fontWeight: '800', textAlign: 'center' },
  badgeDesc: { color: colors.textMuted, fontSize: 11, marginTop: 4, textAlign: 'center', lineHeight: 15 },

  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 8 },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
