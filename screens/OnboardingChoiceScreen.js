import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, space, type, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import OrbiGuide from '../components/OrbiGuide';
import OrbiIntro from '../components/OrbiIntro';
import StoriesReader from '../components/StoriesReader';
import CampoNome from '../components/CampoNome';
import OnboardingPerguntasScreen from './OnboardingPerguntasScreen';
import { getOnboardingSignStoryKey } from '../lib/onboardingPlan';
import { setNome } from '../lib/nomeLocal';

// A entrada limpa começa pela pergunta que personaliza o caminho. O seletor
// de signos continua disponível como atalho, sem trazer de volta a antiga
// capa promocional e suas duas decisões concorrentes.
export default function OnboardingChoiceScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { saveSolo } = useCouple();
  const { t } = useLanguage();
  const [fase, setFase] = useState('intro');
  const [retornoSigno, setRetornoSigno] = useState('intro');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedSign, setSelectedSign] = useState(null);
  // Nome é opcional e só vira storage ('gff-nome') no pickSign — abandonar
  // a tela no meio não deixa nome órfão de signo.
  const [nome, setNomeLocal] = useState('');

  useEffect(() => {
    funnel.onboardingStart();
  }, []);

  function marcarCaminhoSolo() {
    funnel.onboardingStart('solo');
  }

  function abrirSignos(origem) {
    setRetornoSigno(origem);
    setFase('signo');
  }

  async function pickSign(z) {
    if (saving) return;
    Haptics.selectionAsync();
    // ANTES de seguir, e sem bloquear: vazio só limpa a chave, e setNome
    // nunca lança (lib/storage.js cai em memória se o disco quebrar).
    // Vazio não apaga nome já salvo (11/09/2026) — mesma regra do fluxo de
    // perguntas: re-onboarding sem digitar nada preserva o que havia.
    if (nome.trim()) await setNome(nome);
    setSelectedSign(z);
  }

  async function confirmSelectedSign() {
    const z = selectedSign;
    if (!z || saving) return;
    setSaving(true);
    setError('');
    const ok = await saveSolo(z);
    if (!ok) {
      setSaving(false);
      setSelectedSign(null);
      setError(t('onboarding.saveError'));
      return;
    }
    funnel.onboardingDone('solo');
  }

  if (fase === 'intro') {
    return (
      <OrbiIntro
        onStart={() => setFase('perguntas')}
        onSkip={() => setFase('perguntas')}
        onShortcut={() => abrirSignos('intro')}
      />
    );
  }

  if (fase === 'perguntas') {
    return (
      <OnboardingPerguntasScreen
        onVoltar={() => setFase('intro')}
        onSoloStart={marcarCaminhoSolo}
        onCasal={() => navigation.navigate(ROUTES.QUIZ)}
        onAtalhoSigno={() => abrirSignos('perguntas')}
      />
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => setFase(retornoSigno)}
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
        <CampoNome valor={nome} onChange={setNomeLocal} />

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
      <StoriesReader
        visible={!!selectedSign}
        slides={selectedSign ? [t(getOnboardingSignStoryKey(selectedSign.name))] : []}
        titulo={selectedSign ? selectedSign.pt : ''}
        onClose={confirmSelectedSign}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: space.fimDaLista },
  backRow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', minHeight: 44 },
  backRowText: { ...type.botao, color: colors.textSecondary, marginLeft: space.grudado },
  orbi: { alignSelf: 'center', marginTop: space.junto },
  // type.titulo (24/30, peso 700): título de tela. O peso 800 saiu — nesta
  // tela ele competia com os 12 nomes de signo logo abaixo, que também
  // estavam em 700. `entre` (24) de respiro antes da grade.
  pickerTitle: {
    ...type.titulo,
    color: colors.text,
    letterSpacing: -0.4,
    marginTop: space.bloco,
    marginBottom: space.entre,
    textAlign: 'center',
  },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.dentro, justifyContent: 'space-between' },
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
  // Peso normal, como o corpo de texto do concorrente: são doze nomes
  // irmãos, nenhum é hierarquia sobre o outro. Quem destaca é o glifo
  // colorido acima, que já é o elemento forte do card.
  pickerName: { ...type.apoio, color: colors.textSecondary, marginTop: space.junto },
  savingWrap: { paddingVertical: space.ar, alignItems: 'center' },
  errorText: { ...type.corpoCurto, color: colors.red, textAlign: 'center', marginBottom: space.dentro },
});
