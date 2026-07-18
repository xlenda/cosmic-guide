import React, { useEffect, useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { getMockPalmReading } from '../lib/palmReadings';
import { getMockFaceReading } from '../lib/faceReadings';
import { getMockFootReading } from '../lib/footReadings';
import { getMockMolesReading } from '../lib/molesReadings';
import {
  fetchAiPalmReading,
  fetchAiFaceReading,
  fetchAiFootReading,
  fetchAiMolesReading,
} from '../lib/aiClient';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import OneTimeLock from '../components/OneTimeLock';

// FEATURE_KEY único pra tela inteira (hub de 4 modos) — NÃO varia por modo.
// O bloqueio de 1 uso grátis (lib/featureUsage.js) é vitalício por FEATURE_KEY,
// então trocar de modo (Palma/Rosto/Pé/Pintas) nunca reseta nem contorna o
// paywall: quem já gastou a leitura grátis em qualquer modo fica bloqueado
// nos outros também.
const FEATURE_KEY = 'palm';

// Hub de 4 modos de leitura simbólica, todos usando a mesma câmera/galeria e
// o mesmo fluxo intro -> preview -> result. Cada modo só muda o texto de
// instrução, o disclaimer, o cabeçalho e qual função de IA/mock é chamada em
// handleAnalyze — mesmo padrão visual de seletor de chips de THEMES em
// screens/TarotScreen.js.
const MODES = [
  {
    key: 'palma',
    label: 'Palma',
    icon: 'hand-left',
    color: colors.purple,
    grad: gradients.purple,
    headerTitle: 'Leitura de Mão',
    headerSubtitle: 'Quiromancia simbólica',
    instructions:
      'Tire uma foto da palma da sua mão bem aberta, com boa luz, ou escolha uma foto já existente na galeria.',
    disclaimer:
      'Esta leitura une IA com milênios de tradição da quiromancia — símbolos das linhas da mão ' +
      'interpretados e refinados através de gerações. Não substitui exame médico nem garante ' +
      'resultados; é um espelho simbólico para autoconhecimento.',
  },
  {
    key: 'rosto',
    label: 'Rosto',
    icon: 'happy',
    color: colors.pink,
    grad: gradients.pink,
    headerTitle: 'Leitura de Rosto',
    headerSubtitle: 'Fisiognomonia simbólica',
    instructions:
      'Aponte a câmera pro seu rosto, de frente e com boa luz, ou escolha uma foto já existente na galeria.',
    disclaimer:
      'Esta leitura une IA com a fisiognomonia — tradição milenar de interpretar traços do rosto ' +
      'como espelho de temperamento e caráter. Não substitui exame médico nem garante resultados; ' +
      'é um espelho simbólico para autoconhecimento.',
  },
  {
    key: 'pe',
    label: 'Pé',
    icon: 'footsteps',
    color: colors.teal,
    grad: gradients.teal,
    headerTitle: 'Leitura de Pé',
    headerSubtitle: 'Podomancia simbólica',
    instructions:
      'Tire uma foto da sola do seu pé bem aberta, com boa luz, ou escolha uma foto já existente na galeria.',
    disclaimer:
      'Esta leitura une IA com a podomancia — tradição de interpretar as linhas e formas da planta ' +
      'do pé como espelho simbólico da jornada de vida. Não substitui exame médico nem garante ' +
      'resultados; é um espelho simbólico para autoconhecimento.',
  },
  {
    key: 'pintas',
    label: 'Pintas',
    icon: 'ellipse',
    color: colors.gold,
    grad: gradients.gold,
    headerTitle: 'Leitura de Pintas',
    headerSubtitle: 'Moleosofia simbólica',
    instructions:
      'Tire uma foto nítida da região do corpo com as pintas que você quer interpretar, com boa luz, ' +
      'ou escolha uma foto já existente na galeria.',
    disclaimer:
      'Esta leitura une IA com a moleosofia — tradição popular de interpretar a posição das pintas ' +
      'no corpo como símbolos de sorte, temperamento e destino. Não substitui exame dermatológico ' +
      'nem garante resultados; é um espelho simbólico para autoconhecimento.',
  },
];

// Redimensiona pro lado maior no máximo 1024px antes de gerar o base64 —
// uma foto de câmera moderna (ex.: 4000x3000) vira alguns MB em base64 sem
// isso, arriscando timeout/limite de tamanho no backend. Ajustar quality
// aqui (compressão JPEG) não reduz a resolução, só o tamanho do arquivo —
// por isso o resize explícito, não só um quality mais baixo.
async function resizeForUpload(uri) {
  const result = await manipulateAsync(uri, [{ resize: { width: 1024 } }], {
    compress: 0.7,
    format: SaveFormat.JPEG,
    base64: true,
  });
  return result;
}

// Estados possíveis da tela: intro (sem foto) -> preview (foto escolhida,
// aguardando "Analisar") -> result (leitura mockada exibida).
const STEP = { INTRO: 'intro', PREVIEW: 'preview', RESULT: 'result' };

export default function PalmScreen() {
  const navigation = useNavigation();
  const { hasAccess } = useCouple();
  const [mode, setMode] = useState(MODES[0].key);
  const [step, setStep] = useState(STEP.INTRO);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [reading, setReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [locked, setLocked] = useState(false);

  const activeMode = MODES.find((m) => m.key === mode) || MODES[0];

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

  // Troca de modo (Palma/Rosto/Pé/Pintas) só muda qual leitura será feita —
  // nunca mexe em `locked`/FEATURE_KEY, então o paywall de 1 uso grátis
  // continua valendo pra tela inteira, independente do modo escolhido.
  const handleSelectMode = (key) => {
    if (key === mode) return;
    Haptics.selectionAsync();
    setMode(key);
    resetToIntro();
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
        // Resolução de verdade é tratada em resizeForUpload (expo-image-manipulator,
        // handlePickedResult) — quality aqui só afeta a prévia local antes do resize.
        quality: 0.8,
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
        // Resolução de verdade é tratada em resizeForUpload (expo-image-manipulator,
        // handlePickedResult) — quality aqui só afeta a prévia local antes do resize.
        quality: 0.8,
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

    // Tenta a IA real com visão (proxy no backend), escolhendo a função certa
    // pro modo ativo; se não houver base64 (galeria web sem suporte) ou o
    // servidor ainda não tiver a chave configurada, cai pro mock do mesmo modo.
    let result;
    try {
      if (!imageBase64) throw new Error('sem base64 da imagem');
      if (mode === 'palma') result = await fetchAiPalmReading(imageBase64, 'image/jpeg');
      else if (mode === 'rosto') result = await fetchAiFaceReading(imageBase64, 'image/jpeg');
      else if (mode === 'pe') result = await fetchAiFootReading(imageBase64, 'image/jpeg');
      else result = await fetchAiMolesReading(imageBase64, 'image/jpeg');
    } catch {
      if (mode === 'palma') result = getMockPalmReading();
      else if (mode === 'rosto') result = getMockFaceReading();
      else if (mode === 'pe') result = getMockFootReading();
      else result = getMockMolesReading();
    }

    setReading(result);
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — trocar de modo (Palma/Rosto/Pé/Pintas) ou tocar "Nova leitura"
    // na mesma sessão deixaria repetir o uso grátis várias vezes antes do
    // bloqueio realmente pegar (achado por verificação adversarial).
    if (!hasAccess) setLocked(true);
    setIsAnalyzing(false);
    setStep(STEP.RESULT);
  };

  // `step !== STEP.RESULT` importa aqui: marcamos `locked=true` no instante em
  // que a leitura grátis é consumida (handleAnalyze), mas a pessoa ainda
  // precisa VER o resultado que acabou de ganhar — só bloqueamos de fato na
  // próxima tentativa (troca de modo ou nova leitura, que chamam
  // resetToIntro() e voltam pro STEP.INTRO).
  if (!hasAccess && locked && step !== STEP.RESULT) {
    return <OneTimeLock featureTitle="Leitura de Palma" gradient={gradients.purple} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={activeMode.headerTitle} subtitle={activeMode.headerSubtitle} gradient={activeMode.grad} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Escolha o tipo de leitura</Text>
        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeChip, mode === m.key && { borderColor: m.color, backgroundColor: m.color + '22' }]}
              activeOpacity={0.85}
              onPress={() => handleSelectMode(m.key)}
            >
              <Ionicons name={m.icon} size={20} color={m.color} />
              <Text style={styles.modeChipText}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.disclaimer}>{activeMode.disclaimer}</Text>

        {permissionError ? <Text style={styles.errorText}>{permissionError}</Text> : null}

        {step === STEP.INTRO && (
          <View style={styles.section}>
            <Text style={styles.instructions}>{activeMode.instructions}</Text>

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

            <Text style={styles.disclaimer}>{activeMode.disclaimer}</Text>

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
  sectionLabel: { color: colors.text, fontSize: 16, fontWeight: '800' },
  modeRow: { flexDirection: 'row', gap: 8 },
  modeChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  modeChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
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
});
