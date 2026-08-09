import React, { useState, useEffect, useMemo } from 'react';
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
import {
  fetchAiCoffeeReading,
  fetchAiCoffeeWeeklySummary,
  isAiAccessError,
  isLoginRequired,
} from '../lib/aiClient';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import {
  saveCoffeeReading,
  getReadingsForSummary,
  markWeeklySummaryShown,
  getFallbackWeeklySummary,
} from '../lib/coffeeHistory';
import { recordReadingCompletion } from '../lib/readingCompletion';
import OneTimeLock from '../components/OneTimeLock';
import VoiceInsightRecorder from '../components/VoiceInsightRecorder';
import GroundingInvite from '../components/GroundingInvite';
// O MODO HISTÓRIA (09/08/2026) — a mesma leitura, um trecho por tela, como
// stories. paraSlides só REFORMATA: nenhum byte de reading.body muda. E é a
// entrega PADRÃO: o leitor abre sozinho quando a leitura da IA chega
// (handleAnalyze), com a página completa esperando atrás do X.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';
// O BOTÃO "OUVIR" (09/08/2026) — reading.body em voz alta com a voz do
// aparelho (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
import BotaoOuvir from '../components/BotaoOuvir';

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

// "Tradição milenar" era falso e dava pra provar: a leitura de borra de café
// aparece nos palácios otomanos no séc. XVI, e não pode ser mais velha que a
// própria bebida por lá. O dicionário de símbolos que todo site repete (cobra =
// inimizade, casa = mudança) é mais novo ainda — entretenimento de salão inglês
// do fim do séc. XIX, consolidado por Cicely Kent em 1922. Datar a prática é
// mais interessante que inflá-la, e é a única versão que aguenta ser checada.
// Ver docs/tradicao/00-tese.md, proposição 3.
// A CAUDA DEFENSIVA SAIU em 31/07/2026, a pedido do dono: "não quero avisando
// que não dá resultado". Ele tem razão de produto — "não garante resultados nem
// prevê eventos específicos" é o app pedindo desculpa por existir bem no
// momento em que a pessoa vai ler. O texto agora só DESCREVE o que a coisa é e
// de quando ela é. Não prometer continua valendo: a diferença é que agora isso
// se cumpre por não afirmar nada, em vez de por negar em voz alta.
const DISCLAIMER =
  'Esta leitura une IA com a tasseografia, a arte de ler símbolos na borra do café. O costume é ' +
  'antigo: aparece nos palácios otomanos lá no século XVI. Já o dicionário de símbolos usado ' +
  'hoje é bem mais novo — foi consolidado na Inglaterra no fim do século XIX.';

// Estados possíveis da tela: intro (sem foto) -> preview (foto escolhida,
// aguardando "Analisar") -> result (leitura exibida).
const STEP = { INTRO: 'intro', PREVIEW: 'preview', RESULT: 'result' };

export default function CoffeeScreen() {
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  // coupleData volta a ser lido só pelo upsell do fim da leitura, que prometia
  // "a experiência completa do casal" pra quem está SOZINHO — e a assinatura
  // individual não abre nenhuma tela de casal (ver components/FeatureGate.js).
  const { hasAccess, accessConfirmed, coupleData } = useCouple();
  const { t } = useLanguage();
  const [step, setStep] = useState(STEP.INTRO);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [reading, setReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [locked, setLocked] = useState(false);
  // Bloqueio vindo do SERVIDOR (402 cota esgotada / 401 exige conta) — ver o
  // comentário longo em PalmScreen.js: `locked` é a marca no aparelho, este é
  // a palavra final de quem cobra, e por isso vale mesmo com hasAccess=true.
  const [serverBlock, setServerBlock] = useState(null);
  const [readyForWeeklySummary, setReadyForWeeklySummary] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [journalEntryId, setJournalEntryId] = useState(null);
  // O MODO HISTÓRIA — só estado de tela; os slides saem de reading.body no
  // useMemo abaixo, sem tocar no texto. Abre sozinho SÓ no instante em que a
  // leitura chega (fim de handleAnalyze) — nunca ao voltar pra tela com
  // resultado antigo, porque `reading` vive só em estado e morre com a tela.
  const [historiaAberta, setHistoriaAberta] = useState(false);
  const slidesDaLeitura = useMemo(() => (reading ? paraSlides(reading.body) : []), [reading]);

  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess, accessConfirmed]);

  const resetToIntro = () => {
    setStep(STEP.INTRO);
    setImageUri(null);
    setImageBase64(null);
    setReading(null);
    setPermissionError(null);
    setJournalEntryId(null);
    setHistoriaAberta(false); // leitura descartada: o leitor de stories não sobrevive a ela
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
    } catch (err) {
      // PAYWALL DE VERDADE (30/07/2026): 402/401 com `code` conhecido não é
      // queda de rede — é a cota grátis da CONTA acabando (ou a exigência de
      // conta nas leituras com foto). Servir o mock aqui entregaria de graça
      // exatamente o que acabou de ser negado. Ver lib/aiClient.js.
      if (isAiAccessError(err)) {
        setIsAnalyzing(false);
        setServerBlock(isLoginRequired(err) ? 'login' : 'quota');
        setStep(STEP.INTRO);
        return;
      }
      result = getMockCoffeeReading();
    }

    setReading(result);
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — tocar "Nova leitura" na mesma sessão deixaria repetir o uso
    // grátis várias vezes antes do bloqueio realmente pegar (achado por
    // verificação adversarial).
    if (!hasAccess) setLocked(true);

    const { entryId } = await recordReadingCompletion({
      type: 'coffee',
      typeLabel: 'Ritual do Café',
      title: result.title,
      body: result.body,
    });
    setJournalEntryId(entryId);

    setIsAnalyzing(false);
    setStep(STEP.RESULT);
    // ENTREGA EM STORIES POR PADRÃO (09/08/2026): a leitura acabou de NASCER —
    // este é o único lugar que abre o leitor sozinho. Fechar (X ou Concluir)
    // deixa a página completa de sempre, e o botão "Ver como história" reabre.
    setHistoriaAberta(true);

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
    } catch (err) {
      if (isAiAccessError(err)) {
        setIsGeneratingSummary(false);
        setServerBlock(isLoginRequired(err) ? 'login' : 'quota');
        return;
      }
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
  if (serverBlock) {
    return <OneTimeLock featureTitle="Ritual do Café" gradient={COFFEE_GRADIENT} variant={serverBlock} />;
  }

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
            <Text style={styles.weeklyTitle}>{t('coffee.weekly.ready')}</Text>
            <Text style={styles.weeklyText}>
              Você já tem 7 leituras — dá pra ver o que se repetiu entre elas essa semana.
            </Text>
            {isGeneratingSummary ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <TouchableOpacity style={styles.weeklyBtn} activeOpacity={0.85} onPress={handleGenerateWeeklySummary}>
                <Text style={styles.weeklyBtnText}>{t('coffee.weekly.cta')}</Text>
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
              <Text style={styles.linkText}>{t('coffee.close')}</Text>
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
              <Text style={styles.primaryBtnText}>{t('coffee.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={20} color={colors.accent} />
              <Text style={styles.secondaryBtnText}>{t('coffee.pickPhoto')}</Text>
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
                <Text style={styles.loadingText}>{t('coffee.analyzing')}</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleAnalyze}>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>{t('coffee.analyze')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetToIntro}>
                  <Text style={styles.linkText}>{t('coffee.changePhoto')}</Text>
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

            {/* O MODO HISTÓRIA — acima do texto da leitura, no ponto em que o
                resultado já está inteiro na tela: reabre a MESMA leitura que o
                auto-open acabou de mostrar, um trecho por tela. */}
            <TouchableOpacity
              style={styles.historiaBtn}
              activeOpacity={0.85}
              onPress={() => setHistoriaAberta(true)}
              accessibilityRole="button"
              accessibilityLabel={t('stories.ver')}
            >
              <Ionicons name="sparkles" size={16} color={colors.accent} />
              <Text style={styles.historiaBtnText}>{t('stories.ver')}</Text>
            </TouchableOpacity>

            {/* O BOTÃO "OUVIR" — a leitura em voz alta (o mesmo reading.body
                do card logo abaixo e do modo história), com a voz do aparelho.
                Só fala no toque — voz nunca sai sozinha (regra de iOS). */}
            <BotaoOuvir texto={reading.body} style={styles.ouvirBtn} />

            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>{reading.title}</Text>
              <Text style={styles.resultBody}>{reading.body}</Text>
              {reading.isGeneric && (
                                /* Fallback que nao se declara e quebra de confianca: o
                                   testador mandou um sonho de evacuacao de predio e recebeu
                                   'Aguas que revelam emocoes' SEM saber que a IA nao tinha
                                   respondido (29/07/2026). A leitura enlatada continua — e
                                   melhor que erro cru — mas agora se apresenta como o que e. */
                                <Text style={styles.genericNote}>{t('reading.genericNote')}</Text>
                              )}
            </View>

            {journalEntryId && (
              <VoiceInsightRecorder
                entryId={journalEntryId}
                readingType="coffee"
                readingTitle={reading.title}
              />
            )}

            {/* Fecha a leitura: convite pra ficar alguns minutos com o que
                acabou de ler (screens/GroundingScreen.js). Card, nunca modal,
                e sem recompensa nenhuma — o porquê está em
                components/GroundingInvite.js. */}
            <GroundingInvite />

            {!hasAccess && (
              <View style={styles.upsellCard}>
                <Text style={styles.upsellText}>
                  {coupleData
                    ? 'Gostou dessa leitura? Assine e desbloqueie a experiência completa do casal — 7 dias grátis'
                    : t('upsell.solo.text')}
                </Text>
                <TouchableOpacity
                  style={styles.upsellBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                >
                  <Text style={styles.upsellBtnText}>{t('coffee.subscribe')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={resetToIntro}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('coffee.newReading')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <StoriesReader
        visible={historiaAberta}
        slides={slidesDaLeitura}
        titulo={reading ? reading.title : ''}
        onClose={() => setHistoriaAberta(false)}
      />
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
  genericNote: { color: colors.gold, fontSize: 12, lineHeight: 17, marginTop: 10, fontStyle: 'italic' },
  // O botão do modo história — contorno no accent da tela, sem fundo: porta
  // pra mesma leitura, não call-to-action (mesmo desenho de DreamScreen.js).
  historiaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.accent + '66',
    paddingVertical: 12, paddingHorizontal: 18,
  },
  historiaBtnText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  // O Ouvir centrado entre o modo história e o card da leitura (a section já
  // dá o respiro com o gap: 14).
  ouvirBtn: { alignSelf: 'center' },
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
