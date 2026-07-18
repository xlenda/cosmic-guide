import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import VoiceInsightRecorder from '../components/VoiceInsightRecorder';
import { getMockDreamReading } from '../lib/dreamReadings';
import { fetchAiDreamReading } from '../lib/aiClient';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { useCouple } from '../context/CoupleContext';

const DISCLAIMER =
  'Esta interpretação une IA com a tradição milenar da simbologia dos sonhos, de Artemidoro a ' +
  'Jung. Não é diagnóstico psicológico nem previsão; é um espelho simbólico para reflexão.';

// Estados possíveis da tela: intro (digitando o sonho) -> result (leitura exibida).
const STEP = { INTRO: 'intro', RESULT: 'result' };

export default function DreamScreen() {
  const navigation = useNavigation();
  const { hasAccess } = useCouple();
  const [step, setStep] = useState(STEP.INTRO);
  const [dreamText, setDreamText] = useState('');
  const [reading, setReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [journalEntryId, setJournalEntryId] = useState(null);

  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce('dream').then(setLocked);
  }, [hasAccess]);

  const resetToIntro = () => {
    setStep(STEP.INTRO);
    setDreamText('');
    setReading(null);
    setJournalEntryId(null);
  };

  const handleInterpret = async () => {
    if (!dreamText.trim()) return;
    setIsAnalyzing(true);

    // Tenta a IA real (proxy no backend); se falhar por qualquer motivo
    // (sem rede, servidor sem chave configurada, etc.), cai pra leitura
    // mockada honesta — nunca mostra erro pra pessoa, sempre entrega uma leitura.
    let result;
    try {
      result = await fetchAiDreamReading(dreamText.trim());
    } catch {
      result = getMockDreamReading(dreamText.trim());
    }

    setReading(result);
    markFeatureUsedOnce('dream');
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — tocar "Novo sonho" na mesma sessão deixaria repetir o uso grátis
    // várias vezes antes do bloqueio realmente pegar (achado por verificação
    // adversarial).
    if (!hasAccess) setLocked(true);

    const { entryId } = await recordReadingCompletion({
      type: 'dream',
      typeLabel: 'Interpretação de Sonho',
      title: result.title,
      body: result.body,
    });
    setJournalEntryId(entryId);

    setIsAnalyzing(false);
    setStep(STEP.RESULT);
  };

  // `step !== STEP.RESULT` importa aqui: marcamos `locked=true` no instante em
  // que a leitura grátis é consumida (handleInterpret), mas a pessoa ainda
  // precisa VER o resultado que acabou de ganhar — só bloqueamos de fato na
  // próxima tentativa (tocar "Novo sonho", que chama resetToIntro() e volta
  // pro STEP.INTRO).
  if (!hasAccess && locked && step !== STEP.RESULT) {
    return <OneTimeLock featureTitle="Sonhos" gradient={gradients.teal} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Sonhos" subtitle="Interpretação simbólica" gradient={gradients.teal} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

          {step === STEP.INTRO && (
            <View style={styles.section}>
              <Text style={styles.instructions}>
                Descreva o sonho que você teve com o máximo de detalhes que lembrar — lugares, pessoas,
                sensações, o que aconteceu.
              </Text>

              <TextInput
                style={styles.input}
                value={dreamText}
                onChangeText={setDreamText}
                placeholder="Ex.: Sonhei que estava andando numa praia à noite e a maré subia rápido..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                editable={!isAnalyzing}
                maxLength={2000}
              />

              {isAnalyzing ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={styles.loadingText}>Interpretando…</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryBtn, !dreamText.trim() && styles.primaryBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleInterpret}
                  disabled={!dreamText.trim()}
                >
                  <Ionicons name="moon" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Interpretar</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {step === STEP.RESULT && reading && (
            <View style={styles.section}>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>{reading.title}</Text>
                <Text style={styles.resultBody}>{reading.body}</Text>
              </View>

              {journalEntryId && (
                <VoiceInsightRecorder
                  entryId={journalEntryId}
                  readingType="dream"
                  readingTitle={reading.title}
                />
              )}

              {!hasAccess && (
                <View style={styles.upsellCard}>
                  <Text style={styles.upsellText}>
                    Gostou dessa leitura? Assine e desbloqueie a experiência completa do casal — 7 dias grátis
                  </Text>
                  <TouchableOpacity
                    style={styles.upsellBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                  >
                    <Text style={styles.upsellBtnText}>Assinar →</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={resetToIntro}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Novo sonho</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  section: { gap: 14, alignItems: 'stretch' },
  instructions: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  input: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    padding: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  resultTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  resultBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  upsellCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    alignItems: 'center',
  },
  upsellText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  upsellBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  upsellBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});
