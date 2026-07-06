// Retrospectiva — porta fiel de c:/tmp/gilfforever/web/app/(app)/retrospectiva/page.js:
// yearlyRecap (agora em lib/activity.js — no original vivia inline na própria
// página) + readStreak (.longest) + reconectarChecks (via collectData, acumulado
// desde sempre). Tela 100% leitura, nada novo é gravado.
//
// Decisão sobre o bloco de compartilhar do original: o link `wa.me/?text=` vira
// o Share.share() nativo do RN (zero dependência nova — a folha de
// compartilhamento do próprio SO já mostra o WhatsApp entre as opções). Já o
// botão "Copiar texto" (navigator.clipboard.writeText) não tem equivalente sem
// adicionar expo-clipboard como dependência nova — não está no package.json — e
// foi deixado de fora, mesmo precedente de features só-de-navegador já adiadas
// nesta versão (fotos em Timeline, exportar imagem via html2canvas no Quiz
// original).
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';
import { getStreak } from '../lib/coupleData';
import { yearlyRecap, collectData } from '../lib/activity';

const HEADER_GRADIENT = ['#FFC85C', '#FF7BD5'];

// Mesma animação de contagem do original (requestAnimationFrame + easing cúbico).
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

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function fmt(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d} ${MESES[+m - 1]} ${y}`;
}

export default function RetrospectivaScreen() {
  const navigation = useNavigation();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [loaded, setLoaded] = useState(false);
  const [recap, setRecap] = useState(null);
  const [streak, setStreak] = useState({ count: 0, longest: 0 });
  const [reconectarChecks, setReconectarChecks] = useState(0);

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    // Mesma fonte que o original usava (collectData(...).reconectarChecks) —
    // acumulado desde sempre, não escopado ao ano.
    const [r, s, data] = await Promise.all([
      yearlyRecap(voce, amor),
      getStreak(voce, amor),
      collectData(voce, amor),
    ]);
    setRecap(r);
    setStreak(s);
    setReconectarChecks(data.reconectarChecks);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title="Retrospectiva" subtitle="O ano de vocês" onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>Complete o quiz do casal primeiro</Text>
          <Text style={styles.emptyProfileDesc}>
            Precisamos saber os nomes de vocês para montar a retrospectiva do casal.
          </Text>
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>Fazer o quiz do casal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const semMemorias = loaded && recap && recap.memoriesCount === 0;

  const shareText = recap
    ? `Ano de ${voce} e ${amor}: ${recap.memoriesCount} ${recap.memoriesCount === 1 ? 'memória guardada' : 'memórias guardadas'}, ${recap.capsulesSealedThisYear} ${recap.capsulesSealedThisYear === 1 ? 'cápsula selada' : 'cápsulas seladas'} 💛`
    : '';

  async function handleShare() {
    try {
      await Share.share({ message: shareText });
    } catch {
      // usuário cancelou ou o compartilhamento falhou — sem tela de erro, mesmo silêncio do original quando o clipboard falhava
    }
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Retrospectiva"
        subtitle={recap ? recap.year : String(new Date().getFullYear())}
        onBack={() => navigation.goBack()}
        gradient={HEADER_GRADIENT}
      />

      {!loaded ? (
        <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {semMemorias ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌱</Text>
              <Text style={styles.emptyStateTitle}>O ano de vocês ainda está sendo escrito</Text>
              <Text style={styles.emptyStateDesc}>Comecem a guardar memórias na Linha do Tempo 💛</Text>
              <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={() => navigation.navigate(ROUTES.TIMELINE)}>
                <Text style={styles.btnText}>Guardar a primeira memória →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={styles.overline}>Total do ano</Text>
                <Text style={styles.bigNumber}><CountUp value={recap.memoriesCount} /></Text>
                <Text style={styles.mutedText}>
                  {recap.memoriesCount === 1 ? 'memória guardada' : 'memórias guardadas'} em {recap.year}
                </Text>
              </View>

              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadTitle}>Resumo do ano</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>⏳</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureBold}><CountUp value={recap.capsulesSealedThisYear} /></Text>
                    <Text style={styles.featureText}>
                      {recap.capsulesSealedThisYear === 1 ? 'cápsula selada' : 'cápsulas seladas'} este ano
                    </Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>💞</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureBold}><CountUp value={reconectarChecks} /></Text>
                    <Text style={styles.featureText}>missões de reconexão completadas desde o início</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🔥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureBold}><CountUp value={streak.longest} /></Text>
                    <Text style={styles.featureText}>sequência mais longa de dias seguidos</Text>
                  </View>
                </View>

                {recap.oldest && (
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🌱</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureBold}>{recap.oldest.title}</Text>
                      <Text style={styles.featureText}>memória mais antiga do ano · {fmt(recap.oldest.date)}</Text>
                    </View>
                  </View>
                )}

                {recap.newest && recap.newest.id !== recap.oldest?.id && (
                  <View style={styles.featureItem}>
                    <Text style={styles.featureIcon}>🌟</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.featureBold}>{recap.newest.title}</Text>
                      <Text style={styles.featureText}>memória mais recente do ano · {fmt(recap.newest.date)}</Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadTitle}>🎁 Guardem esse ano</Text>
              </View>
              <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={[styles.mutedText, { marginBottom: 12 }]}>
                  Compartilhem a retrospectiva de vocês com quem torce pela história de vocês.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={handleShare}>
                  <Text style={styles.btnText}>Compartilhar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          <Text style={styles.disclaimer}>
            Todos os números acima vêm das memórias e cápsulas que vocês mesmos guardaram — nada aqui foi inventado.
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

  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  bigNumber: { color: colors.text, fontSize: 52, fontWeight: '800', marginVertical: 4 },
  mutedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },

  sectionHead: { marginTop: 20, marginBottom: 10 },
  sectionHeadTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },

  featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  featureIcon: { fontSize: 22, marginRight: 12, width: 26, textAlign: 'center' },
  featureBold: { color: colors.text, fontSize: 15, fontWeight: '800' },
  featureText: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  emptyState: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 16 },
  emptyStateIcon: { fontSize: 40, marginBottom: 10 },
  emptyStateTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  emptyStateDesc: { color: colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 6 },

  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 8 },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
