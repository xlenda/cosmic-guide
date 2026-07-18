import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { getMockCoffeeReading } from '../lib/coffeeReadings';
import { fetchAiCoffeeReading, fetchAiCoffeeWeeklySummary } from '../lib/aiClient';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import {
  saveCoffeeReading,
  getReadingsForSummary,
  markWeeklySummaryShown,
  getFallbackWeeklySummary,
} from '../lib/coffeeHistory';
import OneTimeLock from '../components/OneTimeLock';

const FEATURE_KEY = 'coffee';

const COFFEE_GRADIENT = ['#B57BFF', '#7B3FB5'];

// Mesmo motivo/mecânica de PalmScreen.js: reduz pro lado maior no máximo
// 1024px antes de gerar o base64, evitando payloads de vários MB de fotos
// de câmera moderna.
async function resizeForUpload(uri) {
  const result = await manipulateAsync(uri, [{ resize: { width: 1024 } }], {
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return result;
}

const DISCLAIMER =
  'Esta leitura une IA com a tasseografia — tradição milenar de interpretar símbolos na borra ' +
  'do café. Não garante resultados nem prevê eventos específicos; é um espelho simbólico para ' +
  'reflexão.';

// Estados possíveis da tela: intro (sem foto) -> preview (foto escolhida,
// aguardando "Analisar") -> result (leitura exibida).
const STEP = { INTRO: 'intro', PREVIEW: 'preview', RESULT: 'result' };

export default function CoffeeScreen() {
  const navigation = useNavigation();
  const { hasAccess } = useCouple();
  const [step, setStep] = useState(STEP.INTRO);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [reading, setReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [locked, setLocked] = useState(false);
  const [readyForWeeklySummary, setReadyForWeeklySummary] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess]);

  const resetToIntro = () => {
    setStep(STEP.INTRO);
    setImageUri(null);
    setImageBase64(null);
    setReading(null);
    setPermissionError(null);
  };

  const handlePickedResult = async (result) => {
    if (result.canceled || !result.assets || !result.assets[0]) return;
    setPermissionError(null);
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setStep(STEP.PREVIEW);

    // Redimensiona só se a foto for maior que o alvo — evita upscaling
    // desnecessário de fotos já pequenas (ex.: vindas da galeria web).
    try {
      const precisaReduzir = (asset.width || 0) > 1024 || (asset.height || 0) > 1024;
      if (precisaReduzir) {
        const resized = await resizeForUpload(asset.uri);
        setImageBase64(resized.base64 || asset.base64 || null);
        if (resized.uri) setImageUri(resized.uri);
      } else {
        setImageBase64(asset.base64 || null);
      }
    } catch {
      // Se o resize falhar por qualquer motivo, ainda temos o base64 original
      // do picker como fallback — melhor mandar em resolução alta do que não
      // mandar nada.
      setImageBase64(asset.base64 || null);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError(
          'Permissão de câmera negada. Você ainda pode escolher uma foto da galeria.'
        );
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        allowsEditing: Platform.OS !== 'web',
      });
      handlePickedResult(result);
    } catch (err) {
      // Comum em navegadores sem HTTPS/localhost ou sem suporte a getUserMedia.
      setPermissionError(
        'Não foi possível acessar a câmera agora. Tente "Escolher da galeria".'
      );
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setPermissionError('Permissão de galeria negada. Não é possível escolher uma foto.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        base64: true,
        allowsEditing: Platform.OS !== 'web',
      });
      handlePickedResult(result);
    } catch (err) {
      setPermissionError('Não foi possível abrir a galeria agora. Tente novamente.');
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);

    // Tenta a IA real com visão (proxy no backend); se não houver base64
    // (galeria web sem suporte) ou o servidor ainda não tiver a chave
    // configurada, cai pra leitura mockada honesta.
    let result;
    try {
      if (!imageBase64) throw new Error('sem base64 da imagem');
      result = await fetchAiCoffeeReading(imageBase64, 'image/jpeg');
    } catch {
      result = getMockCoffeeReading();
    }

    setReading(result);
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — tocar "Nova leitura" na mesma sessão deixaria repetir o uso
    // grátis várias vezes antes do bloqueio realmente pegar (achado por
    // verificação adversarial).
    if (!hasAccess) setLocked(true);
    setIsAnalyzing(false);
    setStep(STEP.RESULT);

    // Só quem assina chega a acumular 7 leituras reais (quem não assina fica
    // travado em 1 uso vitalício antes disso pelo OneTimeLock).
    const { readyForSummary } = await saveCoffeeReading({ title: result.title, body: result.body });
    setReadyForWeeklySummary(readyForSummary);
  };

  const handleGenerateWeeklySummary = async () => {
    setIsGeneratingSummary(true);
    const readings = await getReadingsForSummary();

    let summary;
    try {
      summary = await fetchAiCoffeeWeeklySummary(readings);
    } catch {
      summary = getFallbackWeeklySummary(readings);
    }

    setWeeklySummary(summary);
    setReadyForWeeklySummary(false);
    await markWeeklySummaryShown();
    setIsGeneratingSummary(false);
  };

  // `step !== STEP.RESULT` importa aqui: marcamos `locked=true` no instante em
  // que a leitura grátis é consumida (handleAnalyze), mas a pessoa ainda
  // precisa VER o resultado que acabou de ganhar — só bloqueamos de fato na
  // próxima tentativa (nova leitura, que chama resetToIntro() e volta pro
  // STEP.INTRO).
  if (!hasAccess && locked && step !== STEP.RESULT) {
    return <OneTimeLock featureTitle="Ritual do Café" gradient={COFFEE_GRADIENT} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Ritual do Café" subtitle="Borra mística" gradient={COFFEE_GRADIENT} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

        {permissionError ? <Text style={styles.errorText}>{permissionError}</Text> : null}

        {readyForWeeklySummary && !weeklySummary && (
          <View style={styles.weeklyCard}>
            <Ionicons name="calendar" size={22} color={colors.gold} />
            <Text style={styles.weeklyTitle}>Sua conclusão da semana está pronta</Text>
            <Text style={styles.weeklyText}>
              Você já tem 7 leituras — dá pra ver o que se repetiu entre elas essa semana.
            </Text>
            {isGeneratingSummary ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <TouchableOpacity style={styles.weeklyBtn} activeOpacity={0.85} onPress={handleGenerateWeeklySummary}>
                <Text style={styles.weeklyBtnText}>Ver conclusão da semana</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {weeklySummary && (
          <View style={styles.weeklyCard}>
            <Ionicons name="calendar" size={22} color={colors.gold} />
            <Text style={styles.weeklyTitle}>{weeklySummary.title}</Text>
            <Text style={styles.weeklyText}>{weeklySummary.body}</Text>
            <TouchableOpacity onPress={() => setWeeklySummary(null)}>
              <Text style={styles.linkText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === STEP.INTRO && (
          <View style={styles.section}>
            <Text style={styles.instructions}>
              Vire a xícara depois de tomar o café e tire uma foto da borra que ficou no fundo e
              nas paredes, com boa luz, ou escolha uma foto já existente na galeria.
            </Text>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Tirar foto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={20} color={colors.accent} />
              <Text style={styles.secondaryBtnText}>Escolher da galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === STEP.PREVIEW && imageUri && (
          <View style={styles.section}>
            <View style={styles.imageBox}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            </View>

            {isAnalyzing ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.loadingText}>Analisando…</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleAnalyze}>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Analisar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetToIntro}>
                  <Text style={styles.linkText}>Trocar foto</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {step === STEP.RESULT && reading && (
          <View style={styles.section}>
            {imageUri && (
              <View style={styles.imageBoxSmall}>
                <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              </View>
            )}

            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{reading.title}</Text>
              <Text style={styles.resultBody}>{reading.body}</Text>
            </View>

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
              <Text style={styles.primaryBtnText}>Nova leitura</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  errorText: {
    color: colors.red,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  section: { gap: 14, alignItems: 'stretch' },
  instructions: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
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
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryBtnText: { color: colors.accent, fontSize: 15, fontWeight: '700' },
  imageBox: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imageBoxSmall: {
    width: 120,
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { width: '100%', height: '100%' },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  linkText: { color: colors.accent, fontSize: 14, textAlign: 'center', fontWeight: '600' },
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
  weeklyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: 8,
    alignItems: 'center',
  },
  weeklyTitle: { color: colors.text, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  weeklyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  weeklyBtn: { backgroundColor: colors.gold, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20, marginTop: 4 },
  weeklyBtnText: { color: '#1A1A1A', fontSize: 13, fontWeight: '700' },
});
