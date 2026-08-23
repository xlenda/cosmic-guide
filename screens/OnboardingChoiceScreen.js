import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import OrbiGuide from '../components/OrbiGuide';
import OnboardingPerguntasScreen from './OnboardingPerguntasScreen';

// A entrada limpa começa pela pergunta que personaliza o caminho. O seletor
// de signos continua disponível como atalho, sem trazer de volta a antiga
// capa promocional e suas duas decisões concorrentes.
export default function OnboardingChoiceScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { saveSolo } = useCouple();
  const { t } = useLanguage();
  const [fase, setFase] = useState('perguntas');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    funnel.onboardingStart();
  }, []);

  function marcarCaminhoSolo() {
    funnel.onboardingStart('solo');
  }

  async function pickSign(z) {
    if (saving) return;
    Haptics.selectionAsync();
    setSaving(true);
    setError('');
    const ok = await saveSolo(z);
    if (!ok) {
      setSaving(false);
      setError(t('onboarding.saveError'));
      return;
    }
    funnel.onboardingDone('solo');
  }

  if (fase === 'perguntas') {
    return (
      <OnboardingPerguntasScreen
        hideBackOnFirst
        onVoltar={() => {}}
        onSoloStart={marcarCaminhoSolo}
        onCasal={() => navigation.navigate(ROUTES.QUIZ)}
        onAtalhoSigno={() => setFase('signo')}
      />
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => setFase('perguntas')}
          disabled={saving}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.back')}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          <Text style={styles.backRowText}>{t('onboarding.back')}</Text>
        </TouchableOpacity>

        <OrbiGuide size={76} style={styles.orbi} />
        <Text style={styles.pickerTitle}>{t('onboarding.pickerTitle')}</Text>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {saving ? (
          <View style={styles.savingWrap}>
            <ActivityIndicator color={colors.gold} size="large" />
          </View>
        ) : (
          <View style={styles.pickerGrid}>
            {zodiacSigns.map((z) => (
              <TouchableOpacity
                key={z.name}
                style={styles.pickerItem}
                onPress={() => pickSign(z)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                <Text style={styles.pickerName}>{z.pt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  backRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', minHeight: 44 },
  backRowText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 2 },
  orbi: { alignSelf: 'center', marginTop: 8 },
  pickerTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: 8,
    marginBottom: 22,
    textAlign: 'center',
  },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  pickerItem: {
    width: '31%',
    minHeight: 88,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 4,
  },
  pickerGlyph: { fontSize: 27 },
  pickerName: { color: colors.textSecondary, fontSize: 12, marginTop: 7, fontWeight: '700' },
  savingWrap: { paddingVertical: 40, alignItems: 'center' },
  errorText: { color: colors.red, fontSize: 13, textAlign: 'center', marginBottom: 12 },
});
