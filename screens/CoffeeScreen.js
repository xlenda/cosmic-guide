import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { colors, space, type } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
// AS PEÇAS DE DIAGRAMAÇÃO (design/PECAS-DE-DIAGRAMACAO.md, lote das práticas
// 12/09/2026). Esta tela é PASSO A PASSO — vire a xícara, fotografe, leia — e
// corria inteira sobre o mesmo chão com `gap: 16` pra tudo: o histórico da
// tasseografia, o botão da câmera e a leitura da IA na MESMA distância uns dos
// outros. As faixas dão o corte por ETAPA; a coluna tira o parágrafo da borda.
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
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
import ReportarIA from '../components/ReportarIA';
import { Alert } from '../lib/webAlert';
// O MODO HISTÓRIA (09/08/2026) — a mesma leitura, um trecho por tela, como
// stories. paraSlides só REFORMATA: nenhum byte de reading.body muda. E é a
// entrega PADRÃO: o leitor abre sozinho quando a leitura da IA chega
// (handleAnalyze), com a página completa esperando atrás do X.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';
// O BOTÃO "OUVIR" (09/08/2026) — reading.body em voz alta com a voz do
// aparelho (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
import BotaoOuvir from '../components/BotaoOuvir';
// A ARTE DA ESPERA ([BLOCO-ESPERA], 09/08/2026) — o tile do café
// (lib/ilustracoes.js, 256px) pulsa enquanto a IA analisa a foto.
import { tileArte } from '../lib/ilustracoes';

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

// O BLOCO DE ESPERA ILUSTRADO ([BLOCO-ESPERA], 09/08/2026) — enquanto a IA
// analisa a borra, a arte do tile do café respira no lugar do spinner seco.
// O pulso de opacidade (0.55↔1) nasce no mount e morre no cleanup: o bloco só
// renderiza enquanto isAnalyzing, então o fim da espera DESMONTA e para o
// loop — nada roda em segundo plano. useNativeDriver só fora da web
// (react-native-web não tem o driver nativo). A frase é convite honesto ao
// que está acontecendo, nunca promessa; o rodapé de sempre (coffee.analyzing)
// segue embaixo, intocado, ao lado do indicador pequeno.
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

    // A foto só produz resultado quando a análise real termina. Falha de rede,
    // imagem ou provedor mantém a prévia para uma nova tentativa; nunca troca a
    // foto por uma leitura genérica.
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
      setIsAnalyzing(false);
      Alert.alert(t('ai.unavailable.title'), t('ai.unavailable.body'));
      return;
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
        {/* FAIXA 1 — O QUE ISTO É. O parágrafo da tasseografia é o texto mais
            longo da tela e ia de borda a borda; agora ele tem chão próprio e
            coluna de leitura. */}
        <FaixaCurva tom="noite" semente="oquee" style={styles.faixa} estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}>
          <ColunaLeitura centralizado>
            <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
          </ColunaLeitura>
        </FaixaCurva>

        {permissionError ? <Text style={[styles.errorText, styles.avulso]}>{permissionError}</Text> : null}

        {readyForWeeklySummary && !weeklySummary && (
          <View style={[styles.weeklyCard, styles.avulso]}>
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
          <View style={[styles.weeklyCard, styles.avulso]}>
            <Ionicons name="calendar" size={22} color={colors.gold} />
            <Text style={styles.weeklyTitle}>{weeklySummary.title}</Text>
            <ColunaLeitura>
              <Text style={styles.weeklyText}>{weeklySummary.body}</Text>
            </ColunaLeitura>
            <ReportarIA kind="coffee_weekly" />
            <TouchableOpacity onPress={() => setWeeklySummary(null)}>
              <Text style={styles.linkText}>{t('coffee.close')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === STEP.INTRO && (
          // FAIXA 2 — O GESTO. A instrução e as duas portas pra foto, num chão
          // que é só delas: é a única coisa que a pessoa tem pra fazer aqui.
          <FaixaCurva
            tom="ameixa"
            semente="gesto"
            grude
            style={styles.faixa}
            estiloCorpo={[styles.faixaCorpo, styles.section]}
          >
            <ColunaLeitura centralizado>
              <Text style={styles.instructions}>
                Vire a xícara depois de tomar o café e tire uma foto da borra que ficou no fundo e
                nas paredes, com boa luz, ou escolha uma foto já existente na galeria.
              </Text>
            </ColunaLeitura>

            <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('coffee.takePhoto')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.85} onPress={handlePickFromGallery}>
              <Ionicons name="images" size={20} color={colors.accent} />
              <Text style={styles.secondaryBtnText}>{t('coffee.pickPhoto')}</Text>
            </TouchableOpacity>
          </FaixaCurva>
        )}

        {step === STEP.PREVIEW && imageUri && (
          <View style={styles.section}>
            <View style={styles.imageBox}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            </View>

            {isAnalyzing ? (
              <EsperaIlustrada
                arte={tileArte('coffee')}
                frase={t('espera.coffee')}
                rodape={t('coffee.analyzing')}
              />
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
              {/* A LEITURA. É o texto mais longo da tela e o motivo dela
                  existir: coluna de leitura + type.corpo (17/27), que é o
                  degrau do parágrafo do print. Era 14/21 de borda a borda. */}
              <ColunaLeitura>
                <Text style={styles.resultBody}>{reading.body}</Text>
              </ColunaLeitura>
            </View>

            {/* Denúncia da saída de IA — rodapé do resultado, exigido pela
                política de Conteúdo Gerado por IA do Google Play. */}
            <ReportarIA kind="coffee" />

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

            <ColunaLeitura centralizado>
              <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
            </ColunaLeitura>

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
  // `padding: 20` fica: é ele que a faixa anula com marginHorizontal:-20.
  //
  // O `gap` DO CONTAINER SAIU, e o motivo foi medido na foto (390x844,
  // 12/09/2026): com gap no contentContainer aparecia uma TIRA PRETA de 24px
  // entre a faixa 1 e a faixa 2, porque o gap do pai é aplicado DEPOIS do
  // marginTop:-1 do `grude` e vence. Faixa que não encosta na seguinte perde
  // exatamente o efeito de paisagem que ela existe pra dar — a onda passa a
  // flutuar no vazio em vez de cortar o chão anterior.
  // Quem dá respiro agora é a própria faixa (paddingTop/Bottom `secao` da
  // peça); só os elementos SOLTOS entre faixas levam margem própria.
  scrollContent: { padding: 20, paddingBottom: space.fimDaLista },
  // Os avulsos que podem cair entre duas faixas (erro de permissão, o cartão
  // do resumo semanal): eles é que pedem a distância, não o container.
  avulso: { marginVertical: space.entre },
  // A pilha das dobras SEM faixa: o respiro que o container deixou de dar.
  pilha: { gap: space.entre },
  faixa: { marginHorizontal: -20 },
  faixaCorpo: { paddingHorizontal: 20 },
  // A PRIMEIRA FAIXA DA TELA NAO LEVA O paddingTop DA PECA. Medido na foto
  // (390x844, 12/09/2026): a caixa da onda ja tem ONDA_ALTURA (56px) e, logo
  // abaixo do cabecalho — que ja traz folga propria —, somar o space.secao (32)
  // padrao abria ~88px de chao liso antes da primeira palavra. Isso e o defeito
  // ALTO que o revisor achou na Home: a faixa lendo como bloco de cor vazio em
  // vez de secao. E o mesmo remedio que a Home usou (ver o prop estiloCorpo em
  // components/FaixaCurva.js); as faixas seguintes, que nao encostam no
  // cabecalho, seguem com o degrau cheio.
  faixaCorpoPrimeira: { paddingTop: 0 },
  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center' },
  errorText: { ...type.apoio, color: colors.red, textAlign: 'center' },
  // `entre` entre a instrução e o botão, e entre um botão e o outro: eram 14
  // pra tudo, e a instrução colava na câmera.
  section: { gap: space.entre, alignItems: 'stretch' },
  instructions: { ...type.corpo, color: colors.textSecondary, textAlign: 'center' },
  primaryBtn: {
    flexDirection: 'row',
    gap: space.junto,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: space.bloco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { ...type.botao, color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    gap: space.junto,
    borderRadius: 16,
    paddingVertical: space.bloco,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryBtnText: { ...type.botao, color: colors.accent, fontWeight: '700' },
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
  loadingRow: {
    flexDirection: 'row',
    gap: space.dentro,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.dentro,
  },
  loadingText: { ...type.corpoCurto, color: colors.textSecondary },
  // O bloco de espera ilustrado ([BLOCO-ESPERA]) — arte 96px redonda pulsando
  // + frase de convite; o indicador pequeno de sempre fecha como rodapé.
  // `ar` em volta: a espera é a dobra de uma ideia só enquanto ela dura.
  esperaWrap: { alignItems: 'center', gap: space.bloco, paddingVertical: space.ar },
  esperaArte: { width: 96, height: 96, borderRadius: 48 },
  esperaFrase: { ...type.cartao, color: colors.text, textAlign: 'center' },
  linkText: { ...type.botao, color: colors.accent, textAlign: 'center' },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: space.entre,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.bloco,
  },
  resultTitle: { ...type.secao, color: colors.text },
  // O degrau do parágrafo longo — 17/27, o "Casamentos de Áries" do print.
  resultBody: { ...type.corpo, color: colors.textSecondary },
  // O botão do modo história — contorno no accent da tela, sem fundo: porta
  // pra mesma leitura, não call-to-action (mesmo desenho de DreamScreen.js).
  historiaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    borderRadius: 12, borderWidth: 1, borderColor: colors.accent + '66',
    paddingVertical: space.dentro, paddingHorizontal: space.bloco + space.grudado,
  },
  historiaBtnText: { ...type.apoio, color: colors.accent, fontWeight: '600' },
  // O Ouvir centrado entre o modo história e o card da leitura (a section já
  // dá o respiro com o gap: 14).
  ouvirBtn: { alignSelf: 'center' },
  upsellCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: space.bloco,
    borderWidth: 1,
    borderColor: colors.border,
    gap: space.bloco,
    alignItems: 'center',
  },
  upsellText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  upsellBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: space.dentro,
    paddingHorizontal: space.entre,
  },
  upsellBtnText: { ...type.apoio, color: '#fff', fontWeight: '600' },
  weeklyCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: space.bloco,
    borderWidth: 1,
    borderColor: colors.gold,
    gap: space.dentro,
    alignItems: 'center',
  },
  weeklyTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  weeklyText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  weeklyBtn: {
    backgroundColor: colors.gold,
    borderRadius: 12,
    paddingVertical: space.dentro,
    paddingHorizontal: space.entre,
    marginTop: space.junto,
  },
  weeklyBtnText: { ...type.apoio, color: '#1A1A1A', fontWeight: '600' },
});
