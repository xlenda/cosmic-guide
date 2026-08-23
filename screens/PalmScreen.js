import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  Easing,
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
import {
  fetchAiPalmReading,
  fetchAiFaceReading,
  fetchAiFootReading,
  fetchAiMolesReading,
  isAiAccessError,
  isLoginRequired,
} from '../lib/aiClient';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import OneTimeLock from '../components/OneTimeLock';
import { recordReadingCompletion } from '../lib/readingCompletion';
import VoiceInsightRecorder from '../components/VoiceInsightRecorder';
import GroundingInvite from '../components/GroundingInvite';
import ReportarIA from '../components/ReportarIA';
import { Alert } from '../lib/webAlert';
// O MODO HISTÓRIA (09/08/2026) — a mesma leitura, um trecho por tela, como
// stories. paraSlides só REFORMATA: nenhum byte de reading.body muda. E é a
// entrega PADRÃO: o leitor abre sozinho quando a leitura da IA chega
// (handleAnalyze), com a página completa esperando atrás do X. Vale pros 4
// modos (Palma/Rosto/Pé/Pintas): todos entregam o mesmo shape {title, body}.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';
// O BOTÃO "OUVIR" (09/08/2026) — reading.body em voz alta com a voz do
// aparelho (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
import BotaoOuvir from '../components/BotaoOuvir';
// A ARTE DA ESPERA ([BLOCO-ESPERA], 09/08/2026) — o tile da palma
// (lib/ilustracoes.js, 256px) pulsa enquanto a IA analisa a foto. A MESMA
// arte pros 4 modos, de propósito: a tela é um hub só e o tile é a cara dela.
import { tileArte } from '../lib/ilustracoes';

// FEATURE_KEY único pra tela inteira (hub de 4 modos) — NÃO varia por modo.
// O bloqueio de 1 uso grátis (lib/featureUsage.js) é vitalício por FEATURE_KEY,
// então trocar de modo (Palma/Rosto/Pé/Pintas) nunca reseta nem contorna o
// paywall: quem já gastou a leitura grátis em qualquer modo fica bloqueado
// nos outros também.
const FEATURE_KEY = 'palm';

// Hub de 4 modos de leitura simbólica, todos usando a mesma câmera/galeria e
// o mesmo fluxo intro -> preview -> result. Cada modo só muda o texto de
// instrução, o disclaimer, o cabeçalho e qual função de IA é chamada em
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
    // "Milênios... refinados através de gerações" sugeria transmissão
    // ininterrupta do sistema que se lê hoje, e isso não se sustenta. Ler as
    // mãos é antigo mesmo (Samudrika Shastra em sânscrito; Anaxágoras na
    // Grécia), mas o sistema atual — montes, tipos de mão, as linhas com os
    // nomes que usamos — é do séc. XIX: D'Arpentigny (1839), Heron-Allen
    // (1883), Benham (1900). E o tratado "de Aristóteles" que os manuais citam
    // não está nas obras dele. Ver docs/tradicao/00-tese.md, proposição 3.
    disclaimer:
      'Esta leitura une IA com a quiromancia, a leitura das linhas da mão. A prática é antiga de ' +
      'verdade: o Samudrika Shastra, em sânscrito, e Anaxágoras, na Grécia, já falam em ler as ' +
      'mãos. Já o sistema usado hoje — montes, tipos de mão e os nomes das linhas que ' +
      'conhecemos — é bem mais novo: foi organizado na Europa do século XIX. Não substitui exame ' +
      'médico.',
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
      'Esta leitura une IA com a fisiognomonia, a tradição de interpretar traços do rosto como ' +
      'espelho de temperamento e caráter. Ela é antiga — há um tratado atribuído a Aristóteles no ' +
      'séc. IV a.C. — e voltou à moda na Europa do séc. XVIII com Lavater.',
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
      'Esta leitura une IA com a podomancia, a tradição de interpretar as linhas e formas da ' +
      'planta do pé como retrato simbólico da jornada de vida. Não substitui exame médico.',
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
      'Esta leitura une IA com a moleosofia, tradição popular de interpretar a posição das pintas ' +
      'no corpo como símbolos de sorte, temperamento e destino. Não substitui exame dermatológico.',
  },
];

// type/typeLabel enviados pro Diário Cósmico (lib/readingCompletion.js) por
// modo — mesmas featureKeys de lib/featureUsage.js, reaproveitadas só como
// rótulo (o Diário não interfere no bloqueio de 1 uso grátis, que é único
// pro FEATURE_KEY 'palm' da tela inteira, independente do modo).
const READING_TYPE_INFO = {
  palma: { type: 'palma', typeLabel: 'Leitura de Palma' },
  rosto: { type: 'rosto', typeLabel: 'Leitura de Rosto' },
  pe: { type: 'pe', typeLabel: 'Leitura de Pé' },
  pintas: { type: 'pintas', typeLabel: 'Leitura de Pintas' },
};

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
// aguardando "Analisar") -> result (leitura real exibida).
const STEP = { INTRO: 'intro', PREVIEW: 'preview', RESULT: 'result' };

// O BLOCO DE ESPERA ILUSTRADO ([BLOCO-ESPERA], 09/08/2026) — enquanto a IA
// analisa a foto, a arte do tile respira no lugar do spinner seco. O pulso de
// opacidade (0.55↔1) nasce no mount e morre no cleanup: o bloco só renderiza
// enquanto isAnalyzing, então o fim da espera DESMONTA e para o loop — nada
// roda em segundo plano. useNativeDriver só fora da web (react-native-web não
// tem o driver nativo). A frase é convite honesto ao que está acontecendo,
// nunca promessa; o rodapé de sempre (palm.analyzing) segue embaixo,
// intocado, ao lado do indicador pequeno.
function EsperaIlustrada({ arte, frase, rodape }) {
  const opacidade = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacidade, {
          toValue: 0.55,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacidade, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacidade]);

  return (
    <View style={styles.esperaWrap}>
      {/* arte null → sem imagem, o bloco continua inteiro (contrato de
          lib/ilustracoes.js). accessible={false}: é cenário, não informação. */}
      {arte ? (
        <Animated.Image
          source={arte}
          style={[styles.esperaArte, { opacity: opacidade }]}
          resizeMode="cover"
          accessible={false}
        />
      ) : null}
      <Text style={styles.esperaFrase}>{frase}</Text>
      <View style={styles.loadingRow}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={styles.loadingText}>{rodape}</Text>
      </View>
    </View>
  );
}

export default function PalmScreen() {
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  // coupleData volta só pelo upsell do fim da leitura (mesmo motivo comentado
  // em CoffeeScreen.js: a promessa "experiência completa do casal" não se
  // cumpre pra quem assina sozinho).
  const { hasAccess, accessConfirmed, coupleData } = useCouple();
  const { t } = useLanguage();
  const [mode, setMode] = useState(MODES[0].key);
  const [step, setStep] = useState(STEP.INTRO);
  const [imageUri, setImageUri] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [reading, setReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [locked, setLocked] = useState(false);
  // Bloqueio vindo do SERVIDOR (402 cota esgotada / 401 exige conta), separado
  // do `locked` local: `locked` é a marca no aparelho (lib/featureUsage.js),
  // que o servidor não vê; este aqui é a palavra final de quem cobra. Por isso
  // ele vale mesmo com hasAccess=true — hasAccess pode estar concedido pelo
  // fallback por aparelho (um correlationCode velho no AsyncStorage), e nesse
  // desacordo quem manda é a conta, não o aparelho.
  const [serverBlock, setServerBlock] = useState(null);
  const [journalEntryId, setJournalEntryId] = useState(null);
  // O MODO HISTÓRIA — só estado de tela; os slides saem de reading.body no
  // useMemo abaixo, sem tocar no texto. Abre sozinho SÓ no instante em que a
  // leitura chega (fim de handleAnalyze) — nunca ao voltar pra tela com
  // resultado antigo, porque `reading` vive só em estado e morre com a tela.
  const [historiaAberta, setHistoriaAberta] = useState(false);
  // Uma confirmação por passagem pela tela — quem já leu o aviso não precisa
  // relê-lo a cada foto refeita.
  const [pintasCiente, setPintasCiente] = useState(false);
  const slidesDaLeitura = useMemo(() => (reading ? paraSlides(reading.body) : []), [reading]);

  const activeMode = MODES.find((m) => m.key === mode) || MODES[0];

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
    setJournalEntryId(null); // nova leitura/troca de modo: solta o gravador de voz da entrada anterior
    setHistoriaAberta(false); // leitura descartada: o leitor de stories não sobrevive a ela
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

  // AVISO BLOQUEANTE DA LEITURA DE PINTAS (19/08/2026). O modo "Pintas" é o
  // único que faz a pessoa fotografar uma marca real da pele dela, e a leitura
  // é simbólica: não olha, não avalia e não rastreia pinta nenhuma. Um aviso
  // que dá pra ignorar rolando a tela (o `disclaimer` do MODES) não basta —
  // aqui a câmera/galeria só abre depois de um toque explícito em "Entendi".
  // Vale pros DOIS caminhos (câmera e galeria): a foto vira a mesma leitura.
  const confirmarAvisoDePintas = (seguir) => {
    if (mode !== 'pintas' || pintasCiente) return seguir();
    Alert.alert(t('palm.moles.warnTitle'), t('palm.moles.warnBody'), [
      {
        text: t('palm.moles.warnOk'),
        onPress: () => {
          setPintasCiente(true);
          seguir();
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
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

    // A imagem só produz resultado quando a análise real termina. Qualquer
    // falha técnica preserva a prévia para nova tentativa; nunca substitui a
    // foto por uma leitura local genérica.
    let result;
    try {
      if (!imageBase64) throw new Error('sem base64 da imagem');
      if (mode === 'palma') result = await fetchAiPalmReading(imageBase64, 'image/jpeg');
      else if (mode === 'rosto') result = await fetchAiFaceReading(imageBase64, 'image/jpeg');
      else if (mode === 'pe') result = await fetchAiFootReading(imageBase64, 'image/jpeg');
      else result = await fetchAiMolesReading(imageBase64, 'image/jpeg');
    } catch (err) {
      // PAYWALL DE VERDADE (30/07/2026) — não é queda de rede. O servidor
      // passou a contar a cota grátis por CONTA (aiQuota.js no backend) e
      // devolve um erro RECONHECÍVEL quando ela acaba (402) ou quando a rota
      // exige conta (401, caso destas 4 leituras com foto). Falha técnica não
      // consome a prévia nem fabrica uma leitura local.
      if (isAiAccessError(err)) {
        setIsAnalyzing(false);
        setServerBlock(isLoginRequired(err) ? 'login' : 'quota');
        setStep(STEP.INTRO);
        return;
      }
      setIsAnalyzing(false);
      Alert.alert(t('ai.unavailable.title'), t('ai.unavailable.body'));
      return;
    }

    setReading(result);
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — trocar de modo (Palma/Rosto/Pé/Pintas) ou tocar "Nova leitura"
    // na mesma sessão deixaria repetir o uso grátis várias vezes antes do
    // bloqueio realmente pegar (achado por verificação adversarial).
    if (!hasAccess) setLocked(true);

    const typeInfo = READING_TYPE_INFO[mode];
    const { entryId } = await recordReadingCompletion({
      type: typeInfo.type,
      typeLabel: typeInfo.typeLabel,
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
  };

  // `step !== STEP.RESULT` importa aqui: marcamos `locked=true` no instante em
  // que a leitura grátis é consumida (handleAnalyze), mas a pessoa ainda
  // precisa VER o resultado que acabou de ganhar — só bloqueamos de fato na
  // próxima tentativa (troca de modo ou nova leitura, que chamam
  // resetToIntro() e voltam pro STEP.INTRO).
  // O bloqueio do SERVIDOR vem antes e ignora `hasAccess`: ver o comentário na
  // declaração de serverBlock.
  if (serverBlock) {
    return <OneTimeLock featureTitle="Leitura de Palma" gradient={gradients.purple} variant={serverBlock} />;
  }

  if (!hasAccess && locked && step !== STEP.RESULT) {
    return <OneTimeLock featureTitle="Leitura de Palma" gradient={gradients.purple} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={activeMode.headerTitle} subtitle={activeMode.headerSubtitle} gradient={activeMode.grad} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t('palm.chooseType')}</Text>
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

            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => confirmarAvisoDePintas(handleTakePhoto)}
            >
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('palm.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={() => confirmarAvisoDePintas(handlePickFromGallery)}
            >
              <Ionicons name="images" size={20} color={colors.accent} />
              <Text style={styles.secondaryBtnText}>{t('palm.pickPhoto')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === STEP.PREVIEW && imageUri && (
          <View style={styles.section}>
            <View style={styles.imageBox}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            </View>

            {isAnalyzing ? (
              <EsperaIlustrada
                arte={tileArte('palm')}
                frase={t('espera.palm')}
                rodape={t('palm.analyzing')}
              />
            ) : (
              <>
                <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleAnalyze}>
                  <Ionicons name="sparkles" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>{t('palm.analyze')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetToIntro}>
                  <Text style={styles.linkText}>{t('palm.changePhoto')}</Text>
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
            </View>

            {/* Canal de denúncia da saída de IA. Esta tela sozinha gera QUATRO
                leituras (palma/rosto/pé/pintas) e era a superfície de IA mais
                visível do app sem nenhum canal — a bandeirinha do
                VoiceInsightRecorder abaixo só aparece pra quem gravou voz. */}
            <ReportarIA kind={`palm_${mode}`} texto={reading.body} />

            {journalEntryId && (
              <VoiceInsightRecorder
                entryId={journalEntryId}
                readingType={READING_TYPE_INFO[mode].type}
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
                  <Text style={styles.upsellBtnText}>{t('palm.subscribe')}</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.disclaimer}>{activeMode.disclaimer}</Text>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={resetToIntro}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('palm.newReading')}</Text>
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
  // O bloco de espera ilustrado ([BLOCO-ESPERA]) — arte 96px redonda pulsando
  // + frase de convite; o indicador pequeno de sempre fecha como rodapé.
  esperaWrap: { alignItems: 'center', gap: 12, paddingVertical: 14 },
  esperaArte: { width: 96, height: 96, borderRadius: 48 },
  esperaFrase: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
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
});
