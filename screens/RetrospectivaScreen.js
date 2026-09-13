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
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useCouple } from '../context/CoupleContext';
import { getStreak } from '../lib/coupleData';
import { yearlyRecap, collectData } from '../lib/activity';
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();
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
          <Text style={styles.emptyProfileTitle}>{t('retro.needQuiz')}</Text>
          <ColunaLeitura centralizado>
            <Text style={styles.emptyProfileDesc}>
              Precisamos saber os nomes de vocês para montar a retrospectiva do casal.
            </Text>
          </ColunaLeitura>
          <TouchableOpacity style={[styles.btn, styles.btnDoGate]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>{t('retro.doQuiz')}</Text>
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
              <Text style={styles.emptyStateTitle}>{t('retro.empty.title')}</Text>
              <Text style={styles.emptyStateDesc}>{t('retro.empty.desc')}</Text>
              <TouchableOpacity style={[styles.btn, styles.btnDoVazio]} onPress={() => navigation.navigate(ROUTES.TIMELINE)}>
                <Text style={styles.btnText}>{t('retro.empty.cta')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FaixaCurva tom="ameixa" semente="retro-total" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
              <View style={[styles.card, { alignItems: 'center' }]}>
                <Text style={styles.overline}>{t('retro.yearTotal')}</Text>
                <Text style={styles.bigNumber}><CountUp value={recap.memoriesCount} /></Text>
                <Text style={styles.mutedText}>
                  {recap.memoriesCount === 1 ? 'memória guardada' : 'memórias guardadas'} em {recap.year}
                </Text>
              </View>

              </FaixaCurva>

              <FaixaCurva tom="noite" semente="retro-resumo" grude="ameixa" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadTitle}>{t('retro.yearSummary')}</Text>
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
                    <Text style={styles.featureText}>{t('retro.missionsDone')}</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>🔥</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.featureBold}><CountUp value={streak.longest} /></Text>
                    <Text style={styles.featureText}>{t('retro.longestStreak')}</Text>
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

              </FaixaCurva>

              <FaixaCurva tom="dourado" semente="retro-compartilhar" grude="noite" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionHeadTitle}>{t('retro.keepYear')}</Text>
              </View>
              <View style={[styles.card, { alignItems: 'center' }]}>
                <ColunaLeitura centralizado>
                  <Text style={[styles.mutedText, styles.convite]}>
                    Compartilhem a retrospectiva de vocês com quem torce pela história de vocês.
                  </Text>
                </ColunaLeitura>
                <TouchableOpacity style={styles.btn} onPress={handleShare}>
                  <Text style={styles.btnText}>{t('retro.share')}</Text>
                </TouchableOpacity>
              </View>
              </FaixaCurva>
            </>
          )}

          <ColunaLeitura centralizado>
            <Text style={styles.disclaimer}>
              Todos os números acima vêm das memórias e cápsulas que vocês mesmos guardaram — nada aqui foi inventado.
            </Text>
          </ColunaLeitura>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // Sem padding lateral: quem carrega o gutter agora e a FAIXA, que sangra de
  // ponta a ponta e devolve o respiro por dentro.
  scrollContent: { paddingBottom: space.fimDaLista },

  faixa: { width: '100%' },
  faixaCorpo: { gap: space.bloco },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: space.bloco },

  overline: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  // O numero do ano e a manchete da tela: fica no degrau de display da escala
  // (32) em vez do 52 solto, que era maior que qualquer outro numero do app e
  // por isso lia como outro produto. A entrelinha vem junto, que e metade do
  // efeito.
  bigNumber: { ...type.display, color: colors.text, marginVertical: space.grudado },
  mutedText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  convite: { marginBottom: space.dentro },

  sectionHead: { marginTop: space.junto },
  sectionHeadTitle: { ...type.secao, color: colors.text },

  featureItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: space.bloco },
  featureIcon: { fontSize: 22, marginRight: space.dentro, width: 26, textAlign: 'center' },
  featureBold: { ...type.cartao, color: colors.text },
  featureText: { ...type.apoio, color: colors.textSecondary, marginTop: space.grudado },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: space.bloco, paddingHorizontal: space.entre, alignItems: 'center' },
  btnText: { ...type.botao, color: '#fff' },
  btnDoGate: { marginTop: space.entre },
  btnDoVazio: { marginTop: space.bloco },

  emptyState: { alignItems: 'center', paddingVertical: space.ar, paddingHorizontal: space.tela },
  emptyStateIcon: { fontSize: 40, marginBottom: space.dentro },
  emptyStateTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  emptyStateDesc: { ...type.corpoCurto, color: colors.textMuted, textAlign: 'center', marginTop: space.junto },

  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.entre },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao },
  emptyProfileTitle: { ...type.cartao, color: colors.text, textAlign: 'center', marginTop: space.bloco },
  emptyProfileDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.junto },
});
