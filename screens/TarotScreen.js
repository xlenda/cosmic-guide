import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import { TAROT_DECK, getSpreadPattern } from '../lib/tarotDeck';
import { drawTarotCards } from '../lib/tarotShuffle';
import { getTarotImage } from '../lib/tarotImages';
// getCardName entra aqui em 01/08/2026. O pack de nomes existia e estava
// traduzido desde o passe de idioma; a tela nunca o chamou — lia card.name, que
// vem do TAROT_DECK em portugues. Resultado: em ingles o rotulo dizia "A Torre"
// e o paragrafo logo abaixo, traduzido, dizia "The Tower". O comentario em
// lib/tarotThemes.js:271 ja descrevia o contrato que a tela nao cumpria.
import { getThemedMeaning, getElementalDignity, getWaiteNote, getCardName } from '../lib/tarotThemes';
import { canDrawToday, recordDraw } from '../lib/tarotDailyLimit';
import { useCouple } from '../context/CoupleContext';
import { useAuth } from '../context/AuthContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { getBonusTarotReadings, consumeBonusTarotReading } from '../lib/cosmeticRewards';
import { recordCardsSeen } from '../lib/tarotCollection';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';
import { translate } from '../lib/i18n';
import OneTimeLock from '../components/OneTimeLock';
import CosmicScene from '../components/CosmicScene';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { attachReflection } from '../lib/journal';
import VoiceInsightRecorder from '../components/VoiceInsightRecorder';
import GroundingInvite from '../components/GroundingInvite';
import ScratchRevealCard from '../components/ScratchRevealCard';
import OrbiGuide from '../components/OrbiGuide';
// O PREPARO DE WAITE (01/08/2026) — lib/waiteRegras.js existia, com pack nos
// três idiomas e teste próprio passando, e NUNCA tinha sido ligado a uma tela.
// O cabeçalho do módulo já dizia onde ele encaixa: "o vão que hoje está vazio —
// o segundo entre escolher o tema e apertar tirar".
import { avaliarPergunta, preparoDaTiragem, progressoDoPreparo } from '../lib/waiteRegras';
import { PACK as PACK_WAITE_PT } from '../lib/traducoes/waiteRegras.pt.js';
import { PACK as PACK_WAITE_ES } from '../lib/traducoes/waiteRegras.es.js';
import { PACK as PACK_WAITE_EN } from '../lib/traducoes/waiteRegras.en.js';
// O MODO HISTÓRIA (08/08/2026) — a mesma leitura, um trecho por tela, como
// stories. paraSlides só REFORMATA: nenhum byte da prosa muda de lugar.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';
// O BOTÃO "OUVIR" (08/08/2026) — a tiragem em voz alta com a voz do aparelho
// (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
import BotaoOuvir from '../components/BotaoOuvir';
import { funnel } from '../lib/funnel';
import { Alert } from '../lib/webAlert';
import { getMySocialProfile, shareToFeed } from '../lib/socialClient';
import { getOnboardingProfile } from '../lib/onboardingPlan';
import {
  buildPublicTarotBody,
  buildTarotSynthesisModel,
  normalizeTarotQuestion,
  resolveTarotOutcome,
} from '../lib/tarotPersonalization';
import {
  clearPendingTarotReading,
  clearPendingTarotReadingIfMatches,
  getPendingTarotReading,
  savePendingTarotReading,
  updatePendingTarotRevealed,
} from '../lib/tarotPendingReading';
import {
  buildTarotRitualGuide,
  getTarotGuideFocuses,
  getTarotGuideSpread,
  normalizeTarotGuideSign,
} from '../lib/tarotRitualGuide';
import { getMajorThemeLens } from '../lib/tarotMajorThemeLenses';
import { getMinorThemeLens } from '../lib/tarotMinorThemeLenses';
import { commitTarotDrawSnapshot } from '../lib/tarotDrawCommit';

const FEATURE_KEY = 'tarot';

const THEMES = [
  { key: 'Amor', guideId: 'love', icon: 'heart', color: '#C88C88' },
  { key: 'Carreira', guideId: 'career', icon: 'briefcase', color: '#8FA9BD' },
  { key: 'Dinheiro', guideId: 'money', icon: 'cash', color: '#A3B78D' },
  { key: 'Energia', guideId: 'energy', icon: 'flash', color: '#C79B64' },
  { key: 'Saúde', guideId: 'wellbeing', icon: 'medkit', color: '#86AAA1' },
];

const TAROT_HEADER_GRADIENT = ['#120C18', '#2A1B2B', '#5A4430'];
const TAROT_ACTION_GRADIENT = ['#A98242', '#E0BE78', '#8C672F'];
const PROFILE_THEME_BY_INTENT = Object.freeze({
  love: 'Amor',
  work: 'Carreira',
  decision: 'Energia',
  self: 'Energia',
  curiosity: 'Energia',
});
const PROFILE_PATH_BY_SITUATION = Object.freeze({
  loveBeginning: { themeKey: 'Amor', focusId: 'new-bond' },
  loveRelationship: { themeKey: 'Amor', focusId: 'mutuality-boundaries' },
  loveDistance: { themeKey: 'Amor', focusId: 'mutuality-boundaries' },
  loveClosure: { themeKey: 'Amor', focusId: 'closure-renewal' },
  workChange: { themeKey: 'Carreira', focusId: 'decision-transition' },
  workGrowth: { themeKey: 'Carreira', focusId: 'visibility-growth' },
  workBlock: { themeKey: 'Carreira', focusId: 'decision-transition' },
  workPurpose: { themeKey: 'Carreira', focusId: 'direction-purpose' },
  decisionOptions: { themeKey: 'Energia', focusId: 'motivation-focus' },
  decisionTiming: { themeKey: 'Energia', focusId: 'rhythm-recovery' },
  decisionFear: { themeKey: 'Energia', focusId: 'overload-drain' },
  decisionPressure: { themeKey: 'Energia', focusId: 'overload-drain' },
  selfPatterns: { themeKey: 'Energia', focusId: 'motivation-focus' },
  selfEmotions: { themeKey: 'Saúde', focusId: 'emotional-balance' },
  selfDirection: { themeKey: 'Energia', focusId: 'motivation-focus' },
  selfConfidence: { themeKey: 'Saúde', focusId: 'self-care-boundaries' },
  curiositySign: { themeKey: 'Energia', focusId: 'rhythm-recovery' },
  curiosityMap: { themeKey: 'Energia', focusId: 'rhythm-recovery' },
  curiosityTarot: { themeKey: 'Energia', focusId: 'motivation-focus' },
  curiositySky: { themeKey: 'Energia', focusId: 'rhythm-recovery' },
});

// As três casas da tiragem. A POSIÇÃO É PARTE DO SIGNIFICADO — isso é a
// afirmação mais antiga e mais segura da leitura documentada (Etteilla,
// 1770/1783; Waite, "Pictorial Key", 1911). Por isso ela é passada para
// getThemedMeaning e a mesma carta lê diferente em cada casa.
//
// BUG QUE ISTO CORRIGE (31/07/2026): as três chamadas de getThemedMeaning aqui
// omitiam o quarto argumento. O rótulo "Passado / Presente / Futuro" aparecia
// em cima da carta, mas o texto embaixo ignorava a casa: A Torre no Passado e
// A Torre no Futuro saíam com a MESMA leitura, palavra por palavra. A camada de
// interpretação sabia ler por casa desde a véspera; a tela nunca perguntou.
//
// E o que NÃO se pode dizer: esta tiragem de três rotulada
// Passado/Presente/Futuro é popularização do século XX. Não está em Waite (que
// dá 10, 42 e 35 cartas), não está no "Book T", e não há fonte primária datada
// para ela. Por isso o app nunca a chama de "clássica" nem de "tradicional".
// Ver docs/tradicao/05, §3.6.
const POSITIONS = ['Passado', 'Presente', 'Futuro'];

function canonicalPosition(position, index) {
  if (position?.id === 'past') return 'Passado';
  if (position?.id === 'present') return 'Presente';
  if (position?.id === 'future') return 'Futuro';
  if (position?.id === 'situation') return 'Situação';
  if (position?.id === 'tension') return 'Tensão';
  if (position?.id === 'next-step') return 'Próximo passo';
  return POSITIONS[index] || 'Presente';
}

// ---------------------------------------------------------------------------
// O CHROME DO PREPARO — sai do PACK do próprio módulo, nunca de lib/i18n.js
// ---------------------------------------------------------------------------
// Esta tela não redige uma linha do preparo: título, aberturas, as quatro
// regras, os recibos e a datação vêm de preparoDaTiragem(opcoes, lang), e os
// rótulos de interface vêm do bloco `tela` dos packs de lib/traducoes/
// waiteRegras.{pt,es,en}.js. Se faltar palavra, ela nasce lá nos três — nunca
// aqui dentro.
//
// PARA O INTEGRADOR: este mapa é o mesmo `packDoIdioma` de lib/waiteRegras.js e
// o lugar dele é lá, exportado como `chromeDoPreparo(lang)`. Ele mora aqui só
// porque a passagem que ligou o módulo não podia editar o motor; mover é uma
// linha de import a menos nesta tela e nenhuma mudança de comportamento.
const PACKS_DO_PREPARO = { pt: PACK_WAITE_PT, es: PACK_WAITE_ES, en: PACK_WAITE_EN };

function chromeDoPreparo(lang) {
  const pack = PACKS_DO_PREPARO[lang] || PACKS_DO_PREPARO.pt;
  // `rotuloCampo` e `ajudaCampo` já existiam no pack (bloco `pergunta`) e não
  // saem por nenhuma função do motor — são repassados, nunca reescritos.
  return { ...pack.tela, rotuloCampo: pack.pergunta.rotulo, ajudaCampo: pack.pergunta.ajuda };
}

// Molde → texto, o mesmo `preencher` de lib/idadeReal.js e lib/mitos.js: chave
// ausente fica à vista em vez de virar "undefined" no meio da frase. É
// mecânica, não redação — o único molde do preparo é `{s}`, os segundos que
// faltam na contagem.
function preencherMolde(molde, vars = {}) {
  return String(molde).replace(/\{(\w+)\}/g, (bruto, chave) =>
    Object.prototype.hasOwnProperty.call(vars, chave) ? String(vars[chave]) : bruto
  );
}

export default function TarotScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — antes só cobria casal, o que destravava o Tarô por completo
  // pra quem usava sem parceiro (achado real de bug: dava pra tirar cartas em
  // vários temas, repetidas vezes, sem nunca pedir assinatura). Corrigido na
  // origem (contexto), não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed, coupleData, soloSign } = useCouple();
  const { user } = useAuth();
  // `lang` é tão obrigatório aqui quanto `t`: os packs de tradução do tarô
  // (lib/traducoes/tarot.{es,en}.js, 118 KB escritos em 31/07/2026) só entram
  // se a tela PEDIR o idioma. Sem isso os motores caem no default 'pt' e o
  // usuário em espanhol/inglês lê a tiragem inteira em português com a
  // tradução publicada ao lado, sem ser chamada. Foi exatamente o que
  // aconteceu — a auditoria pegou, e é o bug mais caro do lote.
  const { t, lang } = useLanguage();
  // Tarô vive no TarotStack (dentro de TAROT_TAB) e Planos/Loja vivem em
  // outras abas — mesmo helper do OneTimeLock.js: getParent() sobe pro
  // Tab.Navigator, e o fallback cobre o caso de a tela ser a própria raiz.
  const navigateFromTab = (...args) => (navigation.getParent() || navigation).navigate(...args);
  const [theme, setTheme] = useState(THEMES[0]);
  const [drawn, setDrawn] = useState(null);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [orientations, setOrientations] = useState([false, false, false]);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const [dailyHydrated, setDailyHydrated] = useState(false);
  const [locked, setLocked] = useState(false);
  const [accessHydrated, setAccessHydrated] = useState(false);
  const [journalEntryId, setJournalEntryId] = useState(null);
  const [ritualIndex, setRitualIndex] = useState(0);
  const [question, setQuestion] = useState('');
  const [customQuestionOpen, setCustomQuestionOpen] = useState(false);
  const [focusId, setFocusId] = useState('new-bond');
  const [spreadId, setSpreadId] = useState('past-present-future');
  const [readingQuestion, setReadingQuestion] = useState(null);
  const [readingCompletionId, setReadingCompletionId] = useState(null);
  const [readingCreatedAt, setReadingCreatedAt] = useState(null);
  const [onboardingProfile, setOnboardingProfile] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [pendingHydrated, setPendingHydrated] = useState(false);
  const [bonusHydrated, setBonusHydrated] = useState(false);
  const [drawInFlight, setDrawInFlight] = useState(false);
  const [readingOutcome, setReadingOutcome] = useState('clarity');
  const [readingLanguage, setReadingLanguage] = useState(lang);
  const [readingFocusId, setReadingFocusId] = useState('new-bond');
  const [readingSpreadId, setReadingSpreadId] = useState('past-present-future');
  const [readingSign, setReadingSign] = useState(null);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const completionInFlightRef = useRef(null);
  const activeReadingIdRef = useRef(null);
  const drawInFlightRef = useRef(false);
  const selectionGenerationRef = useRef(0);
  const themeTouchedRef = useRef(false);
  const scrollRef = useRef(null);
  const ritualOffsetRef = useRef(0);
  const focusOnRitualLayoutRef = useRef(false);
  const focusRitual = useCallback((animated = true) => {
    const schedule = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (callback) => setTimeout(callback, 16);
    schedule(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, ritualOffsetRef.current - 8),
        animated,
      });
    });
  }, []);
  // Leitura Bônus, comprada na Loja (lib/cosmeticRewards.js) — deixa furar o
  // limite diário do tema UMA vez por bônus guardado. Recarrega no foco (não
  // só no mount) pra refletir uma compra feita na Loja e voltar direto pro Tarô.
  const [bonusReadings, setBonusReadings] = useState(0);
  const themeLabel = t(`tarot.theme.${theme.key}`);
  const signName = coupleData?.sa
    || soloSign?.name
    || soloSign?.nome
    || soloSign?.signo
    || null;
  const guideFocuses = useMemo(
    () => getTarotGuideFocuses(theme.guideId, lang),
    [theme.guideId, lang]
  );
  const ritualGuide = useMemo(
    () => buildTarotRitualGuide({ themeId: theme.guideId, focusId, sign: signName, lang }),
    [theme.guideId, focusId, signName, lang]
  );
  const activeSpread = useMemo(
    () => getTarotGuideSpread(spreadId, lang) || ritualGuide?.spread || null,
    [spreadId, lang, ritualGuide]
  );
  const readingGuide = useMemo(
    () => buildTarotRitualGuide({
      themeId: theme.guideId,
      focusId: readingFocusId,
      sign: readingSign,
      lang: readingLanguage,
    }),
    [theme.guideId, readingFocusId, readingSign, readingLanguage]
  );
  const readingSpread = useMemo(
    () => getTarotGuideSpread(readingSpreadId, readingLanguage) || readingGuide?.spread || null,
    [readingSpreadId, readingLanguage, readingGuide]
  );
  const readingPositions = readingSpread?.positions || POSITIONS.map((position) => ({
    id: position.toLowerCase(),
    label: readingLanguage === lang
      ? t(`tarot.position.${position}`)
      : translate(readingLanguage, `tarot.position.${position}`),
    prompt: '',
  }));

  useEffect(() => {
    if (guideFocuses.some((focus) => focus.id === focusId)) return;
    const first = guideFocuses[0];
    if (!first) return;
    setFocusId(first.id);
    setSpreadId(first.spreadId);
    setQuestion('');
    setCustomQuestionOpen(false);
  }, [guideFocuses, focusId]);

  // ---- O PREPARO DE WAITE, no vão antes de tirar ----
  // Só DUAS coisas moram aqui em cima; o resto do estado é do próprio painel.
  // `preparoFeitas` sobe porque o rótulo do botão de tirar depende dele — e é
  // exatamente para isso que progressoDoPreparo() devolve `completo`: para
  // TROCAR O RÓTULO, nunca para desabilitar o botão (lib/waiteRegras.js, "O APP
  // NÃO TRANCA O BOTÃO"). Waite chamou os quatro itens de notas de prática, não
  // de condições, e gatear a tiragem seria inventar rigor que a fonte não tem.
  // Nada aqui toca paywall, limite diário ou leitura bônus.
  const [preparoAberto, setPreparoAberto] = useState(false);
  const [preparoFeitas, setPreparoFeitas] = useState([]);
  const marcarRegraDoPreparo = useCallback((id, feita) => {
    Haptics.selectionAsync();
    setPreparoFeitas((prev) => {
      if (feita) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  }, []);
  const progressoDoWaite = useMemo(() => progressoDoPreparo(preparoFeitas, lang), [preparoFeitas, lang]);
  const readingTranslate = useCallback((key, vars) => (
    readingLanguage === lang ? t(key, vars) : translate(readingLanguage, key, vars)
  ), [readingLanguage, lang, t]);
  const drawReady = profileHydrated
    && pendingHydrated
    && dailyHydrated
    && accessHydrated
    && bonusHydrated;
  // Um bonus comprado nao depende da resposta da assinatura nem do limite
  // diario. Ainda esperamos perfil + snapshot pendente para nao misturar duas
  // leituras ou congelar o fallback antes da personalizacao chegar.
  const bonusDrawReady = profileHydrated
    && pendingHydrated
    && bonusHydrated;
  const selectionLocked = !profileHydrated || !pendingHydrated || drawInFlight;
  const markSelectionTouched = useCallback(() => {
    if (drawInFlightRef.current || !profileHydrated || !pendingHydrated) return false;
    themeTouchedRef.current = true;
    selectionGenerationRef.current += 1;
    return true;
  }, [profileHydrated, pendingHydrated]);
  const handleQuestionChange = useCallback((value) => {
    if (!markSelectionTouched()) return;
    setQuestion(Array.from(value || '').slice(0, 220).join(''));
  }, [markSelectionTouched]);

  // ---- O MODO HISTÓRIA ----
  // O corpo é o MESMO que drawCards() grava no Diário (casa por casa + a
  // leitura transversal da tiragem), remontado aqui porque a tela guarda a
  // tiragem em estado, não o texto pronto. São as mesmas funções do motor com
  // os mesmos argumentos — o modo história só reformata a exibição. Vazio
  // enquanto houver carta fechada: o leitor não entrega o desfecho de uma
  // carta que a pessoa ainda não abriu.
  const [historiaAberta, setHistoriaAberta] = useState(false);
  // A História agora é uma escolha explícita depois da revelação. Abrir um
  // modal automaticamente no mesmo momento da terceira carta fazia o gesto
  // parecer interrompido e escondia o resultado que a pessoa acabou de abrir.
  // O corpo vive num memo próprio porque agora tem DOIS consumidores com a
  // mesma exigência de fidelidade: os slides do modo história e o botão Ouvir
  // (components/BotaoOuvir.js), que fala a tiragem inteira em voz alta. Um
  // texto só, dois formatos — nenhum deles reescreve uma palavra.
  const readingArtifacts = useMemo(() => {
    if (!drawn) return null;
    const snapshotThemeLabel = readingTranslate(`tarot.theme.${theme.key}`);
    const cardNames = drawn.map((card, index) => (
      `${getCardName(card, readingLanguage)}${orientations[index] ? readingTranslate('tarot.reversedTag') : ''}`
    ));
    const canonicalMeanings = drawn.map((card, index) => (
      getThemedMeaning(
        card,
        theme.key,
        orientations[index],
        canonicalPosition(readingPositions[index], index),
        readingLanguage
      )
    ));
    const thematicLenses = drawn.map((card) => (
      getMajorThemeLens(card, theme.key, readingLanguage)
      || getMinorThemeLens(card, theme.key, readingLanguage)
    ));
    const interpretations = canonicalMeanings.map((canonicalMeaning, index) => {
      const positionFrame = readingSpreadId === 'situation-tension-next-step'
        ? readingPositions[index]?.interpretationFrame
        : null;
      return [positionFrame, thematicLenses[index], canonicalMeaning].filter(Boolean).join('\n\n');
    });
    const model = buildTarotSynthesisModel({
      question: readingQuestion,
      themeLabel: snapshotThemeLabel,
      profile: { outcome: readingOutcome },
      cards: cardNames,
      canonicalMeanings: interpretations,
    });
    const context = model.question
      ? readingTranslate('tarot.personal.withQuestion', { question: model.question, theme: snapshotThemeLabel })
      : readingTranslate('tarot.personal.withoutQuestion', { theme: snapshotThemeLabel });
    const guidePlan = readingSpread?.id && readingSpread.id !== readingGuide?.focus?.spreadId
      ? readingSpread.description
      : readingGuide?.focus?.plan;
    const guideContext = [readingGuide?.focus?.acknowledgement, guidePlan]
      .filter(Boolean)
      .join(' ');
    const signLens = readingGuide?.signLens
      ? `${readingGuide.signLens.label}: ${readingGuide.signLens.text}`
      : null;
    const bridge = readingTranslate(`tarot.personal.bridge.${readingSpreadId === 'situation-tension-next-step' ? 'situation' : 'timeline'}`, {
      first: model.bridgeVars.firstCardName,
      second: model.bridgeVars.secondCardName,
      third: model.bridgeVars.thirdCardName,
    });
    const reflectionPrompt = readingTranslate(`tarot.personal.prompt.${model.outcome}`);
    const canonicalLines = drawn.map((card, index) => {
      const position = readingPositions[index]?.label || readingTranslate(`tarot.position.${POSITIONS[index]}`);
      return `${position} — ${cardNames[index]}: ${interpretations[index]}`;
    });
    const dignity = getElementalDignity(drawn, readingLanguage);
    const pattern = getSpreadPattern(drawn, readingLanguage);
    const fullBody = [
      `${readingTranslate('tarot.personal.title')}\n${context}\n${guideContext}\n${signLens || ''}\n${bridge}\n${reflectionPrompt}`,
      ...canonicalLines,
      dignity,
      pattern,
    ].filter(Boolean).join('\n\n');
    const publicBody = buildPublicTarotBody({
      themeLabel: snapshotThemeLabel,
      cardNames: cardNames.map((name, index) => `${readingPositions[index]?.label || readingTranslate(`tarot.position.${POSITIONS[index]}`)} — ${name}`),
      // O Feed recebe um resumo deliberado, não a leitura privada inteira.
      // Nos Maiores a lente editorial tema×carta é suficiente; nos Menores o
      // motor canônico continua sendo o fallback. Assim o corpo cabe no
      // contrato real de 2.000 caracteres sem cortar frase no meio.
      canonicalSnippets: canonicalMeanings.map((meaning, index) => thematicLenses[index] || meaning),
    });
    return {
      model,
      themeLabel: snapshotThemeLabel,
      context,
      guideContext,
      signLens,
      bridge,
      reflectionPrompt,
      canonicalMeanings,
      interpretations,
      canonicalLines,
      dignity,
      pattern,
      fullBody,
      publicBody,
      readingDetails: {
        version: 2,
        lang: readingLanguage,
        themeKey: theme.key,
        themeLabel: snapshotThemeLabel,
        focusId: readingGuide?.focus?.id || null,
        focusLabel: readingGuide?.focus?.label || null,
        spreadId: readingSpread?.id || null,
        signId: readingGuide?.signLens?.id || null,
        outcome: model.outcome,
        cards: drawn.map((card, index) => ({
          id: card.id,
          name: cardNames[index],
          position: readingPositions[index]?.id || POSITIONS[index],
          positionLabel: readingPositions[index]?.label || readingTranslate(`tarot.position.${POSITIONS[index]}`),
          reversed: orientations[index],
          canonicalMeaning: canonicalMeanings[index],
          thematicLens: thematicLenses[index],
          interpretation: interpretations[index],
        })),
        synthesis: { context, guideContext, signLens, bridge, reflectionPrompt },
      },
    };
  }, [
    drawn,
    orientations,
    theme.key,
    readingLanguage,
    readingQuestion,
    readingOutcome,
    readingTranslate,
    readingGuide,
    readingSpread,
    readingSpreadId,
    readingPositions,
  ]);
  const corpoDaTiragem = drawn && revealed.every(Boolean) ? readingArtifacts?.fullBody || '' : '';
  const slidesDaTiragem = useMemo(() => paraSlides(corpoDaTiragem), [corpoDaTiragem]);

  // Todo tema libera só 1 tiragem por dia (ver lib/tarotDailyLimit) — recheca
  // sempre que o tema muda, já que a resposta é assíncrona (AsyncStorage).
  useEffect(() => {
    let active = true;
    let midnightTimer = null;
    const hydrate = () => {
      setDailyHydrated(false);
      return canDrawToday(theme.key).then((ok) => {
        if (active) setDailyBlocked(!ok);
      }).catch(() => {
        if (active) setDailyBlocked(false);
      }).finally(() => {
        if (active) setDailyHydrated(true);
      });
    };
    const scheduleMidnight = () => {
      if (!active) return;
      const now = new Date();
      const next = new Date(now);
      next.setHours(24, 0, 1, 0);
      midnightTimer = setTimeout(async () => {
        await hydrate();
        scheduleMidnight();
      }, Math.max(1000, next.getTime() - now.getTime()));
    };
    hydrate();
    scheduleMidnight();
    return () => {
      active = false;
      if (midnightTimer) clearTimeout(midnightTimer);
    };
  }, [theme.key]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setDailyHydrated(false);
      canDrawToday(theme.key).then((ok) => {
        if (active) setDailyBlocked(!ok);
      }).catch(() => {
        if (active) setDailyBlocked(false);
      }).finally(() => {
        if (active) setDailyHydrated(true);
      });
      return () => {
        active = false;
      };
    }, [theme.key])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setBonusHydrated(false);
      getBonusTarotReadings().then((count) => {
        if (active) setBonusReadings(count);
      }).catch(() => {
        if (active) setBonusReadings(0);
      }).finally(() => {
        if (active) setBonusHydrated(true);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    if (!profileLoaded) return;
    if (onboardingProfile && !drawn && !themeTouchedRef.current) {
      const suggestedPath = PROFILE_PATH_BY_SITUATION[onboardingProfile.situation];
      const suggestedThemeKey = suggestedPath?.themeKey || PROFILE_THEME_BY_INTENT[onboardingProfile.intent];
      const suggestedTheme = THEMES.find((item) => item.key === suggestedThemeKey);
      if (suggestedTheme) {
        const availableFocuses = getTarotGuideFocuses(suggestedTheme.guideId, lang);
        const nextFocus = availableFocuses.find((item) => item.id === suggestedPath?.focusId) || availableFocuses[0];
        if (suggestedTheme.key !== theme.key || nextFocus?.id !== focusId) {
          selectionGenerationRef.current += 1;
        }
        if (suggestedTheme.key !== theme.key) setTheme(suggestedTheme);
        if (nextFocus?.id !== focusId || suggestedTheme.key !== theme.key) {
          setFocusId(nextFocus?.id || 'new-bond');
          setSpreadId(nextFocus?.spreadId || 'past-present-future');
          setQuestion('');
          setCustomQuestionOpen(false);
        }
      }
    }
    // Só libera o CTA no mesmo commit em que tema/foco derivados do perfil
    // também são publicados. Não existe um frame clicável com Amor/clarity de
    // fallback antes de a resposta do onboarding chegar.
    setProfileHydrated(true);
  }, [profileLoaded, onboardingProfile, drawn, theme.key, focusId, lang]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      // Fecha o gate enquanto o perfil real e relido ao voltar para a aba.
      // Sem isso, o CTA podia usar por alguns frames o perfil da visita anterior.
      setProfileLoaded(false);
      setProfileHydrated(false);
      getOnboardingProfile().then((profile) => {
        if (active) {
          selectionGenerationRef.current += 1;
          setOnboardingProfile(profile);
        }
      }).catch(() => {
        if (active) {
          selectionGenerationRef.current += 1;
          setOnboardingProfile(null);
        }
      }).finally(() => {
        if (active) setProfileLoaded(true);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    let active = true;
    getPendingTarotReading().then(async (pending) => {
      if (!active || !pending) return;
      const restoredCards = pending.cardIds.map((id) => TAROT_DECK.find((card) => card.id === id));
      const restoredTheme = THEMES.find((item) => item.key === pending.themeKey);
      if (!restoredTheme || restoredCards.some((card) => !card)) {
        await clearPendingTarotReading();
        return;
      }
      const firstClosed = pending.revealed.findIndex((value) => !value);
      const restoredFocuses = getTarotGuideFocuses(restoredTheme.guideId, pending.lang);
      const restoredFocus = restoredFocuses.find((item) => item.id === pending.focusId) || restoredFocuses[0];
      const restoredSpreadId = pending.spreadKey || restoredFocus?.spreadId || 'past-present-future';
      selectionGenerationRef.current += 1;
      focusOnRitualLayoutRef.current = true;
      setTheme(restoredTheme);
      setDrawn(restoredCards);
      setOrientations(pending.orientations);
      setRevealed(pending.revealed);
      setRitualIndex(firstClosed === -1 ? 2 : firstClosed);
      setQuestion(pending.question);
      setReadingQuestion(pending.question || null);
      setReadingCompletionId(`tarot:${pending.createdAt}:${pending.cardIds.join('.')}`);
      setReadingCreatedAt(pending.createdAt);
      setReadingOutcome(pending.outcome);
      setReadingLanguage(pending.lang);
      setFocusId(restoredFocus?.id || 'new-bond');
      setSpreadId(restoredSpreadId);
      setReadingFocusId(restoredFocus?.id || 'new-bond');
      setReadingSpreadId(restoredSpreadId);
      setReadingSign(pending.sign || null);
      setCustomQuestionOpen(false);
      setJournalEntryId(null);
      setReflection('');
      setReflectionSaved(false);
      setShared(false);
      activeReadingIdRef.current = `tarot:${pending.createdAt}:${pending.cardIds.join('.')}`;
      completionInFlightRef.current = null;
    }).catch(() => {
      // Sem snapshot, a leitura nova continua disponível. O gate abaixo evita
      // apenas competir com uma leitura ainda não verificada.
    }).finally(() => {
      if (active) setPendingHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    // Idioma faz parte do snapshot. Uma troca durante uma verificacao
    // assincrona invalida a tentativa antiga em vez de misturar dois packs.
    selectionGenerationRef.current += 1;
  }, [lang]);

  useEffect(() => {
    // A permissao tambem pode mudar enquanto o contexto confirma a assinatura.
    selectionGenerationRef.current += 1;
  }, [hasAccess, accessConfirmed]);

  // Bloqueio vitalício (1 uso grátis, pra tela inteira, qualquer tema) — pra
  // quem NÃO tem acesso completo (solo, ou casal sem assinatura). Independente
  // do dailyBlocked acima, que é o limite diário por tema (vale até pra quem
  // já assina).
  useEffect(() => {
    let active = true;
    setAccessHydrated(false);
    if (!accessConfirmed) {
      return () => {
        active = false;
      };
    }
    if (hasAccess) {
      setLocked(false);
      setAccessHydrated(true);
      return () => {
        active = false;
      };
    }
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (active) setLocked(used);
    }).catch(() => {
      if (active) setLocked(false);
    }).finally(() => {
      if (active) setAccessHydrated(true);
    });
    return () => {
      active = false;
    };
  }, [hasAccess, accessConfirmed]);

  // viaBonus=true (botão "Usar Leitura Bônus") fura AS DUAS travas — o
  // limite diário do tema E o bloqueio vitalício de quem não assina —
  // consumindo 1 recompensa comprada na Loja (lib/cosmeticRewards.js). É um
  // consumível pago com tokens: quem comprou tem direito de usar, assinante
  // ou não (antes só furava o limite diário, então quem não assinava e já
  // tinha gasto a leitura grátis ficava com a recompensa presa pra sempre —
  // achado real de auditoria adversarial, 26/07/2026).
  const drawCards = async (viaBonus = false) => {
    const readyForThisPath = viaBonus ? bonusDrawReady : drawReady;
    if (!readyForThisPath || drawInFlightRef.current) return;
    drawInFlightRef.current = true;
    setDrawInFlight(true);

    // Congela as escolhas antes do primeiro await. Os controles tambem ficam
    // desabilitados; a geracao fecha mudancas vindas de hidratacoes/contextos.
    const selectionGeneration = selectionGenerationRef.current;
    const themeSnapshot = theme;
    const languageSnapshot = lang;
    const guideSnapshot = ritualGuide || buildTarotRitualGuide({
      themeId: themeSnapshot.guideId,
      focusId: guideFocuses[0]?.id,
      sign: signName,
      lang: languageSnapshot,
    });
    const spreadSnapshot = activeSpread || guideSnapshot?.spread;
    const questionSnapshot = normalizeTarotQuestion(question)
      || guideSnapshot?.focus?.suggestedQuestion
      || null;
    const outcomeSnapshot = resolveTarotOutcome(onboardingProfile);
    const signSnapshot = normalizeTarotGuideSign(signName) || null;
    const selectionStillCurrent = () => selectionGenerationRef.current === selectionGeneration;

    try {
      if (!viaBonus) {
        // O estado hidratado tira o frame clicável; estas releituras fecham a
        // segunda janela, entre o último render e o toque, inclusive em troca
        // rápida de tema ou em dois eventos quase simultâneos.
        if (!accessConfirmed) return;
        const allowedToday = await canDrawToday(themeSnapshot.key);
        setDailyBlocked(!allowedToday);
        if (!allowedToday) return;
        if (!hasAccess) {
          const alreadyUsed = await hasUsedFeatureOnce(FEATURE_KEY);
          setLocked(alreadyUsed);
          if (alreadyUsed) return;
        }
      }
      if (!selectionStillCurrent()) return;

      const shuffled = drawTarotCards(TAROT_DECK, 3);
      const newOrientations = shuffled.map(() => Math.random() < 0.5);
      const createdAt = new Date().toISOString();
      const completionId = `tarot:${createdAt}:${shuffled.map((card) => card.id).join('.')}`;
      const snapshot = {
        themeKey: themeSnapshot.key,
        cardIds: shuffled.map((card) => card.id),
        orientations: newOrientations,
        revealed: [false, false, false],
        question: questionSnapshot || '',
        outcome: outcomeSnapshot,
        lang: languageSnapshot,
        createdAt,
        focusId: guideSnapshot?.focus?.id,
        spreadKey: spreadSnapshot?.id,
        sign: signSnapshot,
        guideVersion: guideSnapshot?.version,
      };

      // A leitura so e consumida depois que o snapshot confirma escrita
      // duravel. Fechar o app no meio nunca perde cartas nem um bonus pago.
      const commit = await commitTarotDrawSnapshot({
        snapshot,
        viaBonus,
        isSelectionCurrent: selectionStillCurrent,
        savePending: savePendingTarotReading,
        consumeBonus: consumeBonusTarotReading,
        clearPendingIfMatches: clearPendingTarotReadingIfMatches,
      });
      if (!commit.ok && commit.reason === 'persist_failed') {
        Alert.alert(t('tarot.draw.saveErrorTitle'), t('tarot.draw.saveErrorBody'));
        return;
      }
      if (!commit.ok && commit.reason === 'bonus_unavailable') {
        setBonusReadings(await getBonusTarotReadings());
        Alert.alert(t('tarot.draw.bonusUnavailableTitle'), t('tarot.draw.bonusUnavailableBody'));
        return;
      }
      if (!commit.ok) return;

      if (viaBonus) {
        setBonusReadings((n) => Math.max(0, n - 1));
      } else {
        await recordDraw(themeSnapshot.key);
        await markFeatureUsedOnce(FEATURE_KEY);
        if (!hasAccess) setLocked(true);
        setDailyBlocked(true);
      }

      try {
        const haptic = Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (haptic && typeof haptic.catch === 'function') haptic.catch(() => {});
      } catch {}
      activeReadingIdRef.current = completionId;
      completionInFlightRef.current = null;
      focusOnRitualLayoutRef.current = true;
      setDrawn(shuffled);
      setRevealed([false, false, false]);
      setOrientations(newOrientations);
      setRitualIndex(0);
      setReadingQuestion(questionSnapshot);
      setReadingCompletionId(completionId);
      setReadingCreatedAt(createdAt);
      setReadingOutcome(outcomeSnapshot);
      setReadingLanguage(languageSnapshot);
      setReadingFocusId(guideSnapshot?.focus?.id || 'new-bond');
      setReadingSpreadId(spreadSnapshot?.id || 'past-present-future');
      setReadingSign(signSnapshot);
      setHistoriaAberta(false);
      setJournalEntryId(null);
      setReflection('');
      setReflectionSaved(false);
      setShared(false);
    } catch {
      Alert.alert(t('tarot.draw.saveErrorTitle'), t('tarot.draw.saveErrorBody'));
    } finally {
      drawInFlightRef.current = false;
      setDrawInFlight(false);
    }
  };

  const completeReading = useCallback(async () => {
    const targetReadingId = readingCompletionId;
    if (!drawn || !readingArtifacts || !targetReadingId) return;
    if (completionInFlightRef.current === targetReadingId) return;
    completionInFlightRef.current = targetReadingId;
    try {
      const { entryId } = await recordReadingCompletion({
        type: 'tarot',
        typeLabel: readingTranslate('tarot.diary.type'),
        title: readingTranslate('tarot.diary.title', { theme: readingArtifacts.themeLabel }),
        body: readingArtifacts.fullBody,
        shareBody: readingArtifacts.publicBody,
        question: readingQuestion,
        readingDetails: readingArtifacts.readingDetails,
        completionId: targetReadingId,
      });
      if (activeReadingIdRef.current === targetReadingId) {
        setJournalEntryId(entryId);
      }
      // A conclusão só fica pronta depois que o Álbum recebeu as cartas. Sem
      // aguardar esta gravação, abrir o Álbum logo após a terceira revelação
      // podia mostrar 0/78 até a pessoa sair e voltar.
      await recordCardsSeen(drawn.map((card) => card.id));
      // A limpeza e condicional e deve acontecer mesmo quando a UI ja mudou.
      // Assim a leitura antiga completa nao reaparece; uma nova nunca e apagada.
      await clearPendingTarotReadingIfMatches({
        createdAt: readingCreatedAt,
        cardIds: drawn.map((card) => card.id),
      });
    } catch {
      // O snapshot continua no aparelho. Ao voltar para a tela, a conclusão é
      // tentada de novo sem trocar carta, pergunta ou orientação.
      if (completionInFlightRef.current === targetReadingId) {
        completionInFlightRef.current = null;
      }
    }
  }, [
    drawn,
    readingArtifacts,
    readingQuestion,
    readingCompletionId,
    readingCreatedAt,
    readingTranslate,
  ]);

  const reveal = async (i) => {
    funnel.scratchReveal('tarot', String(readingPositions[i]?.id || POSITIONS[i] || i).toLowerCase());
    const next = revealed.map((value, index) => (index === i ? true : value));
    // Persiste a coleção antes de publicar o estado final na tela. Assim o
    // botão Álbum, que continua disponível no cabeçalho, nunca vence a escrita
    // da terceira carta. recordCardsSeen é idempotente e completeReading
    // repete a chamada para também cobrir uma tiragem retomada do snapshot.
    if (next.every(Boolean) && drawn) {
      await recordCardsSeen(drawn.map((card) => card.id));
    }
    const persisted = await updatePendingTarotRevealed(next);
    setRevealed(next);
    if (!persisted && !next.every(Boolean)) {
      Alert.alert(t('tarot.draw.saveErrorTitle'), t('tarot.draw.progressErrorBody'));
    }
    if (next.every(Boolean)) await completeReading();
  };

  useEffect(() => {
    if (drawn && revealed.every(Boolean) && !journalEntryId) completeReading();
  }, [drawn, revealed, journalEntryId, completeReading]);

  const saveReflectionToDiary = async () => {
    const clean = reflection.trim();
    if (!journalEntryId || !clean || reflectionSaving) return;
    setReflectionSaving(true);
    const saved = await attachReflection(journalEntryId, clean);
    setReflectionSaved(saved);
    setReflectionSaving(false);
  };

  const openCommunity = () => navigateFromTab(ROUTES.COMMUNITY_TAB, { screen: ROUTES.SOCIAL });

  const publishReading = async () => {
    if (sharing || !readingArtifacts?.publicBody) return;
    setSharing(true);
    try {
      const profile = await getMySocialProfile();
      if (!profile) {
        Alert.alert(t('tarot.community.profileTitle'), t('tarot.community.profileBody'), [
          { text: t('tarot.community.cancel'), style: 'cancel' },
          { text: t('tarot.community.profileCta'), onPress: openCommunity },
        ]);
        return;
      }
      await shareToFeed({
        readingType: 'tarot',
        title: readingTranslate('tarot.diary.title', { theme: readingArtifacts.themeLabel }),
        body: readingArtifacts.publicBody,
      });
      setShared(true);
      Alert.alert(t('tarot.community.sharedTitle'), t('tarot.community.sharedBody'), [
        { text: t('tarot.community.view'), onPress: openCommunity },
        { text: t('tarot.community.ok'), style: 'cancel' },
      ]);
    } catch {
      Alert.alert(t('tarot.community.errorTitle'), t('tarot.community.errorBody'));
    } finally {
      setSharing(false);
    }
  };

  const confirmCommunityShare = () => {
    if (!user) {
      navigateFromTab(ROUTES.HOME_TAB, { screen: ROUTES.LOGIN });
      return;
    }
    const publicTitle = readingTranslate('tarot.diary.title', { theme: readingArtifacts?.themeLabel || themeLabel });
    const preview = [t('tarot.community.previewBody'), publicTitle, readingArtifacts?.publicBody]
      .filter(Boolean)
      .join('\n\n');
    Alert.alert(t('tarot.community.previewTitle'), preview, [
      { text: t('tarot.community.cancel'), style: 'cancel' },
      { text: t('tarot.community.publish'), onPress: publishReading },
    ]);
  };

  // `!drawn` importa aqui: marcamos `locked=true` no instante em que a
  // tiragem grátis é consumida (drawCards), mas a pessoa ainda precisa VER
  // as cartas que acabou de ganhar — só bloqueamos de fato na próxima
  // tentativa (troca de tema ou nova tiragem, que zeram `drawn`).
  // `bonusReadings === 0` também importa: quem tem Leitura Bônus comprada na
  // Loja precisa da tela real pra USAR o bônus — este OneTimeLock em tela
  // cheia escondia o botão de usar e deixava a recompensa presa pra sempre
  // pra quem não assina (achado real de auditoria adversarial, 26/07/2026).
  const lockedSemBonus = drawReady && !hasAccess && locked && bonusReadings === 0;
  if (lockedSemBonus && !drawn && !drawInFlight) {
    return <OneTimeLock featureTitle={t('tarot.title')} gradient={gradients.hero} />;
  }
  // Estado "só com bônus": sem assinatura, leitura grátis já gasta, mas com
  // Leitura Bônus guardada — a área vazia abaixo mostra o botão de usar o
  // bônus no lugar do "Tirar 3 Cartas" normal.
  const soPodeUsarBonus = bonusDrawReady
    && accessHydrated
    && !hasAccess
    && locked
    && bonusReadings > 0;

  // ---- Qual das duas réguas é a verdade PRA ESTA PESSOA, agora ----
  // O Tarô tem dois limites e eles não valem pro mesmo público:
  //   • prévia grátis VITALÍCIA (lib/featureUsage.js) — quem NÃO assina tira
  //     uma tiragem na vida. Não renova amanhã, nem depois de amanhã.
  //   • limite DIÁRIO por tema (lib/tarotDailyLimit.js) — a régua de quem
  //     ASSINA: 1 tiragem por tema por dia, essa sim volta amanhã.
  // O bug (achado 29/07/2026): drawCards() liga as duas na mesma tiragem e a
  // tela escolhia a frase errada. Quem não assina tirava as 3 cartas, lia
  // "volta amanhã pra uma nova" — e, saindo da aba e voltando no MESMO dia,
  // encontrava a aba inteira virada em "Você já usou sua leitura gratuita".
  // O app se contradizia em minutos e, amanhã, entregava paywall no lugar da
  // tiragem prometida. Além disso o botão de assinar nunca aparecia nesse
  // primeiro estado, porque o ramo do limite diário vinha primeiro.
  // Regra agora: na hora de FALAR, a prévia vitalícia tem precedência sobre o
  // limite diário. Quem não assina nunca lê "amanhã"; só quem assina lê.
  const previaVitaliciaGasta = accessHydrated && !hasAccess && locked;
  const limiteDiarioReal = accessHydrated && hasAccess && dailyHydrated && dailyBlocked;
  const ritualComplete = !!drawn && revealed.every(Boolean);
  const currentCard = drawn?.[ritualIndex] || null;
  const currentOutcome = resolveTarotOutcome(onboardingProfile);
  const outcomeLabel = t(`onboarding.outcome.${currentOutcome}.label`);
  const selectedFocus = ritualGuide?.focus || guideFocuses[0] || null;
  const bonusPrimaryWhileAccessPending = !accessConfirmed && bonusReadings > 0 && bonusDrawReady;
  const primaryDrawReady = drawReady || bonusPrimaryWhileAccessPending;
  const effectiveQuestion = normalizeTarotQuestion(question) || selectedFocus?.suggestedQuestion || '';
  const selectedPlan = activeSpread?.id && activeSpread.id !== selectedFocus?.spreadId
    ? activeSpread.description
    : selectedFocus?.plan;
  const visibleDisclosures = [
    ritualGuide?.disclosures?.randomness,
    ritualGuide?.signLens ? ritualGuide?.disclosures?.sign : null,
    ritualGuide?.disclosures?.future,
    theme.guideId === 'wellbeing' ? ritualGuide?.disclosures?.wellbeing : null,
  ].filter(Boolean);
  const spreadOptions = ['past-present-future', 'situation-tension-next-step']
    .map((id) => getTarotGuideSpread(id, lang))
    .filter(Boolean);

  return (
    <View style={styles.root}>
      {/* O cenário em camadas (céu + estrelas + ondas) atrás de tudo — o root
          mantém colors.background por baixo, como o contrato do CosmicScene
          pede. Cards continuam com surface própria: legibilidade não negocia. */}
      <CosmicScene />
      <LinearGradient colors={TAROT_HEADER_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('tarot.title')}</Text>
            <Text style={styles.subtitle}>{t('tarot.subtitle')}</Text>
          </View>
          {/* Álbum das 78 Cartas — cada carta tirada fica colecionada lá. */}
          <TouchableOpacity
            style={styles.albumBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.TAROT_ALBUM)}
            accessibilityRole="button"
            accessibilityLabel={t('tarot.albumA11y')}
            testID="tarot-album-open"
          >
            <Ionicons name="albums" size={20} color="#fff" />
            <Text style={styles.albumBtnText}>{t('tarot.album')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 20, paddingBottom: Math.max(96, insets.bottom + 88) }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>{t('tarot.chooseTheme')}</Text>
        <View style={styles.themeRow}>
          {THEMES.map((themeOption) => (
            <TouchableOpacity
              key={themeOption.key}
              style={[
                styles.themeChip,
                theme.key === themeOption.key && { borderColor: themeOption.color, backgroundColor: themeOption.color + '22' },
                (selectionLocked || (drawn && !ritualComplete)) && styles.themeChipDisabled,
              ]}
              disabled={selectionLocked || (!!drawn && !ritualComplete)}
              onPress={() => {
                if (!markSelectionTouched()) return;
                Haptics.selectionAsync();
                setDailyHydrated(false);
                setTheme(themeOption);
                const nextFocus = getTarotGuideFocuses(themeOption.guideId, lang)[0];
                setFocusId(nextFocus?.id || 'new-bond');
                setSpreadId(nextFocus?.spreadId || 'past-present-future');
                setQuestion('');
                setCustomQuestionOpen(false);
                setDrawn(null);
                setRevealed([false, false, false]);
                setRitualIndex(0);
                setJournalEntryId(null);
                setReadingQuestion(null);
                setReadingCompletionId(null);
                setReadingCreatedAt(null);
                setReadingLanguage(lang);
                setReflection('');
                setReflectionSaved(false);
                setShared(false);
                activeReadingIdRef.current = null;
                completionInFlightRef.current = null;
              }}
              accessibilityRole="button"
              accessibilityState={{
                selected: theme.key === themeOption.key,
                disabled: selectionLocked || (!!drawn && !ritualComplete),
              }}
            >
              <Ionicons
                name={themeOption.icon}
                size={20}
                color={theme.key === themeOption.key ? themeOption.color : colors.textMuted}
              />
              <Text style={[styles.themeText, theme.key === themeOption.key && styles.themeTextSelected]}>
                {t(`tarot.theme.${themeOption.key}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!drawn ? (
          <View style={styles.emptyWrap}>
            {limiteDiarioReal || soPodeUsarBonus ? (
              <>
                <Ionicons
                  name={previaVitaliciaGasta ? 'lock-closed-outline' : 'time-outline'}
                  size={40}
                  color={theme.color}
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.emptyTitle}>
                  {/* Duas frases, dois públicos. "Volta amanhã" só sai pra
                      quem realmente vai ter tiragem amanhã (assinante). Pra
                      quem não assina, a verdade é que a prévia é uma só e não
                      renova — dizer o contrário é prometer o que o app não
                      vai cumprir. */}
                  {limiteDiarioReal
                    ? t('tarot.dailyBlocked', { theme: themeLabel })
                    : t('tarot.previewBlocked')}
                </Text>
                {bonusReadings > 0 ? (
                  <TouchableOpacity
                    testID="tarot-bonus-draw"
                    activeOpacity={0.85}
                    onPress={() => drawCards(true)}
                    disabled={!bonusDrawReady || drawInFlight}
                    style={[styles.btnWrap, (!bonusDrawReady || drawInFlight) && styles.drawDisabled]}
                  >
                    <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                      <Ionicons name="sparkles" size={18} color="#fff" />
                      <Text style={styles.btnText}>{t('tarot.bonusUse', { count: bonusReadings })}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  // Quem TEM bônus ganha botão logo acima; quem não tem ficava
                  // sem ação nenhuma neste bloco, e o único jeito de conseguir
                  // uma tiragem hoje (comprar Leitura Bônus na Loja) não era
                  // oferecido em lugar nenhum do app.
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.bonusStoreBtn}
                    onPress={() => navigateFromTab(ROUTES.PROFILE_TAB, { screen: ROUTES.LOJA })}
                  >
                    <Ionicons name="bag-handle" size={16} color={colors.gold} />
                    <Text style={styles.bonusStoreText}>{t('tarot.dailyLimit.storeCta')}</Text>
                  </TouchableOpacity>
                )}
                {/* Quem não assina lê aqui "ou assine pra tirar cartas todo
                    dia" — pedido sem botão é pedido morto. O toque que leva a
                    Planos vem colado na frase (mesmo padrão já aplicado no
                    resto do app). */}
                {previaVitaliciaGasta && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.bonusStoreBtn, { marginTop: 10 }]}
                    onPress={() => navigateFromTab(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                  >
                    <Ionicons name="diamond" size={16} color={colors.gold} />
                    <Text style={styles.bonusStoreText}>{t('tarot.locked.cta')}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <View style={styles.questionCard} testID="tarot-question-card">
                  <View style={styles.guideIntro}>
                    <OrbiGuide size={82} pose="curious" testID="tarot-orbi-guide" />
                    <View style={styles.guideIntroCopy}>
                      <Text style={styles.questionEyebrow}>{t('tarot.guide.eyebrow')}</Text>
                      <Text style={styles.guideTitle}>{t('tarot.guide.title')}</Text>
                      <Text style={styles.guideBody}>{t('tarot.guide.body')}</Text>
                    </View>
                  </View>

                  <Text style={styles.guidePrompt}>{t('tarot.guide.focusTitle')}</Text>
                  <View style={styles.focusList}>
                    {guideFocuses.map((focus) => {
                      const selected = focus.id === selectedFocus?.id;
                      return (
                        <Pressable
                          key={focus.id}
                          testID={`tarot-focus-${focus.id}`}
                          disabled={selectionLocked}
                          onPress={() => {
                            if (!markSelectionTouched()) return;
                            Haptics.selectionAsync().catch(() => {});
                            setFocusId(focus.id);
                            setSpreadId(focus.spreadId);
                            setQuestion('');
                            setCustomQuestionOpen(false);
                          }}
                          style={({ pressed }) => [
                            styles.focusOption,
                            selected && { borderColor: theme.color, backgroundColor: `${theme.color}16` },
                            pressed && styles.choicePressed,
                          ]}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected, disabled: selectionLocked }}
                        >
                          <View style={[styles.focusDot, selected && { borderColor: theme.color }]}>
                            {selected && <View style={[styles.focusDotCore, { backgroundColor: theme.color }]} />}
                          </View>
                          <Text style={[styles.focusOptionText, selected && styles.focusOptionTextSelected]}>{focus.label}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {selectedFocus && (
                    <View style={styles.guideReceipt} testID="tarot-guide-receipt">
                      <Text style={styles.guideAcknowledgement}>{selectedFocus.acknowledgement}</Text>
                      <Text style={styles.guidePlan}>{selectedPlan}</Text>
                    </View>
                  )}

                  {ritualGuide?.signLens && (
                    <View style={styles.signLens} testID="tarot-sign-lens">
                      <View style={styles.signLensIcon}>
                        <Text style={styles.signLensGlyph}>✦</Text>
                      </View>
                      <View style={styles.signLensCopy}>
                        <Text style={styles.signLensTitle}>
                          {t('tarot.guide.signLens', { sign: ritualGuide.signLens.label })}
                        </Text>
                        <Text style={styles.signLensText}>{ritualGuide.signLens.text}</Text>
                      </View>
                    </View>
                  )}

                  <Text style={styles.guidePrompt}>{t('tarot.guide.spreadTitle')}</Text>
                  <View style={styles.spreadChoices}>
                    {spreadOptions.map((spread) => {
                      const selected = spread.id === activeSpread?.id;
                      return (
                        <Pressable
                          key={spread.id}
                          testID={`tarot-spread-${spread.id}`}
                          disabled={selectionLocked}
                          onPress={() => {
                            if (!markSelectionTouched()) return;
                            Haptics.selectionAsync().catch(() => {});
                            setSpreadId(spread.id);
                          }}
                          style={({ pressed }) => [
                            styles.spreadChoice,
                            selected && styles.spreadChoiceSelected,
                            pressed && styles.choicePressed,
                          ]}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected, disabled: selectionLocked }}
                        >
                          <Text style={[styles.spreadChoiceLabel, selected && styles.spreadChoiceLabelSelected]}>{spread.label}</Text>
                          <Text style={styles.spreadChoiceBody}>{spread.description}</Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  <View style={styles.suggestedQuestion}>
                    <View style={styles.suggestedQuestionHeader}>
                      <Text style={styles.suggestedQuestionLabel}>{t('tarot.guide.questionLabel')}</Text>
                      <Pressable
                        testID="tarot-question-edit"
                        disabled={selectionLocked}
                        onPress={() => {
                          if (!markSelectionTouched()) return;
                          setQuestion(effectiveQuestion);
                          setCustomQuestionOpen((open) => !open);
                        }}
                        hitSlop={8}
                        accessibilityRole="button"
                      >
                        <Text style={styles.suggestedQuestionEdit}>
                          {t(customQuestionOpen ? 'tarot.guide.questionDone' : 'tarot.guide.questionEdit')}
                        </Text>
                      </Pressable>
                    </View>
                    <Text style={styles.suggestedQuestionText}>{effectiveQuestion}</Text>
                  </View>

                  {customQuestionOpen && (
                    <View style={styles.questionInputShell}>
                      <TextInput
                        testID="tarot-question"
                        style={styles.questionInput}
                        value={question}
                        onChangeText={handleQuestionChange}
                        editable={!selectionLocked}
                        placeholder={t('tarot.question.placeholder')}
                        placeholderTextColor={colors.textMuted}
                        multiline
                        accessibilityLabel={t('tarot.question.title')}
                      />
                      <Text style={styles.questionCount}>{Array.from(question).length}/220</Text>
                    </View>
                  )}

                  <View style={styles.questionPrivacyRow}>
                    <Ionicons name="lock-closed-outline" size={13} color={colors.gold} />
                    <Text style={styles.questionPrivacy}>{t('tarot.question.private')}</Text>
                  </View>
                  {onboardingProfile && (
                    <View style={[styles.profileLens, { borderColor: `${theme.color}55` }]}>
                      <Ionicons name="options-outline" size={15} color={theme.color} />
                      <Text style={styles.profileLensText}>
                        {t('tarot.question.profileLens', { outcome: outcomeLabel.toLocaleLowerCase(lang) })}
                      </Text>
                    </View>
                  )}
                  <View style={styles.guideDisclosures} testID="tarot-guide-disclosures">
                    {visibleDisclosures.map((disclosure) => (
                      <View key={disclosure} style={styles.guideDisclosureRow}>
                        <Text style={styles.guideDisclosureDot}>•</Text>
                        <Text style={styles.guideDisclosure}>{disclosure}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  testID="tarot-draw"
                  activeOpacity={0.85}
                  onPress={() => drawCards(bonusPrimaryWhileAccessPending)}
                  disabled={!primaryDrawReady || !selectedFocus || drawInFlight}
                  style={[
                    styles.btnWrap,
                    (!primaryDrawReady || !selectedFocus || drawInFlight) && styles.drawDisabled,
                  ]}
                >
                  <LinearGradient colors={TAROT_ACTION_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="hand-left" size={18} color="#21160D" />
                    <Text style={[styles.btnText, styles.tarotActionText]}>
                      {drawInFlight
                        ? t('tarot.guide.loading')
                        : bonusPrimaryWhileAccessPending
                          ? t('tarot.bonusUse', { count: bonusReadings })
                          : !drawReady
                        ? t('tarot.guide.loading')
                        : progressoDoWaite.completo ? progressoDoWaite.botao : selectedFocus?.cta || t('tarot.draw')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* O CTA entrega o primeiro valor antes da camada de estudo.
                    As notas continuam disponíveis, mas não empurram a ação
                    principal para fora da primeira dobra. */}
                <PreparoDeWaite
                  lang={lang}
                  aberto={preparoAberto}
                  onAlternar={() => setPreparoAberto((v) => !v)}
                  feitas={preparoFeitas}
                  onMarcar={marcarRegraDoPreparo}
                  progresso={progressoDoWaite}
                  pergunta={effectiveQuestion}
                  onPerguntaChange={handleQuestionChange}
                />
              </>
            )}
          </View>
        ) : (
          <>
            <View
              style={styles.ritualStage}
              testID="tarot-ritual-stage"
              onLayout={(event) => {
                ritualOffsetRef.current = event.nativeEvent.layout.y;
                if (!focusOnRitualLayoutRef.current) return;
                focusOnRitualLayoutRef.current = false;
                focusRitual(false);
              }}
            >
              <View style={styles.ritualMarkers}>
                {drawn.map((card, index) => (
                  <View
                    key={card.id}
                    style={[
                      styles.ritualMarker,
                      index === ritualIndex && { borderColor: theme.color },
                      revealed[index] && { backgroundColor: theme.color, borderColor: theme.color },
                    ]}
                  >
                    {revealed[index] && <Ionicons name="checkmark" size={12} color="#fff" />}
                  </View>
                ))}
              </View>
              <Text style={styles.ritualStep}>
                {t('tarot.ritual.step', { current: ritualIndex + 1, total: drawn.length })}
              </Text>
              <Text style={styles.ritualPosition}>
                {readingPositions[ritualIndex]?.label || readingTranslate(`tarot.position.${POSITIONS[ritualIndex]}`)}
              </Text>
              {!!readingPositions[ritualIndex]?.prompt && (
                <Text style={styles.ritualPositionPrompt}>{readingPositions[ritualIndex].prompt}</Text>
              )}

              {currentCard && (
                <View style={styles.tarotCardLarge}>
                  <ScratchRevealCard
                    key={`${currentCard.id}:${ritualIndex}`}
                    testID={`tarot-scratch-${ritualIndex}`}
                    revealed={revealed[ritualIndex]}
                    resetKey={`${currentCard.id}:${orientations[ritualIndex] ? 'r' : 'u'}`}
                    onReveal={() => reveal(ritualIndex)}
                    themeColor={theme.color}
                    scratchLabel={t('tarot.scratch')}
                    tapLabel={t('tarot.scratch.tapAlternative')}
                    accessibilityLabel={t('tarot.scratch.a11y')}
                    revealAnnouncement={readingTranslate('tarot.scratch.revealed', {
                      card: getCardName(currentCard, readingLanguage),
                    })}
                    style={[styles.scratchCard, { shadowColor: theme.color }]}
                  >
                    <View style={styles.tarotFace}>
                      <Image
                        source={getTarotImage(currentCard.id)}
                        style={[styles.tarotImage, orientations[ritualIndex] && { transform: [{ rotate: '180deg' }] }]}
                        resizeMode="contain"
                      />
                    </View>
                  </ScratchRevealCard>
                  {revealed[ritualIndex] && (
                    <>
                      <Text testID={`tarot-card-name-${ritualIndex}`} style={styles.tarotName}>
                        {getCardName(currentCard, readingLanguage)}
                        {orientations[ritualIndex] ? readingTranslate('tarot.reversedTag') : ''}
                      </Text>
                      <View style={styles.immediateReading} testID={`tarot-card-meaning-${ritualIndex}`}>
                        <Text style={styles.immediateEyebrow}>{t('tarot.ritual.interpretation')}</Text>
                        <Text style={styles.immediateMeaning}>{readingArtifacts?.interpretations[ritualIndex]}</Text>
                      </View>
                    </>
                  )}
                </View>
              )}

              {revealed[ritualIndex] && ritualIndex < drawn.length - 1 && (
                <Pressable
                  testID={`tarot-next-${ritualIndex}`}
                  style={({ pressed }) => [styles.nextCardBtn, pressed && styles.nextCardBtnPressed]}
                  onPress={() => {
                    Haptics.selectionAsync().catch(() => {});
                    setRitualIndex((index) => Math.min(index + 1, drawn.length - 1));
                    focusRitual();
                  }}
                  accessibilityRole="button"
                >
                  <Text style={styles.nextCardBtnText}>{t('tarot.ritual.next')}</Text>
                  <Ionicons name="arrow-forward" size={18} color="#1B1224" />
                </Pressable>
              )}

              {ritualComplete && (
                <View style={styles.ritualCompletePill}>
                  <Ionicons name="sparkles" size={15} color={colors.gold} />
                  <Text style={styles.ritualCompleteText}>{t('tarot.ritual.complete')}</Text>
                </View>
              )}
            </View>

            {/* O MODO HISTÓRIA — acima do texto da leitura, e só com as três
                cartas viradas: o botão abre a MESMA leitura que está logo
                abaixo, um trecho por tela. Nenhum gate muda: quem chegou aqui
                já tem a tiragem na tela. */}
            {ritualComplete && readingArtifacts && (
              <View style={styles.personalCard} testID="tarot-personal-synthesis">
                <View style={styles.personalHeader}>
                  <View style={[styles.personalIcon, { backgroundColor: `${theme.color}22` }]}>
                    <Ionicons name="git-branch-outline" size={19} color={theme.color} />
                  </View>
                  <View style={styles.personalHeaderText}>
                    <Text style={styles.personalTitle}>{readingTranslate('tarot.personal.title')}</Text>
                    <Text style={styles.personalLens}>
                      {readingTranslate(`onboarding.outcome.${readingArtifacts.model.outcome}.label`)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.personalContext}>{readingArtifacts.context}</Text>
                {!!readingArtifacts.guideContext && (
                  <Text style={styles.personalGuideContext}>{readingArtifacts.guideContext}</Text>
                )}
                {!!readingArtifacts.signLens && (
                  <View style={styles.personalSignLens}>
                    <Ionicons name="sparkles-outline" size={16} color={colors.gold} />
                    <Text style={styles.personalSignLensText}>{readingArtifacts.signLens}</Text>
                  </View>
                )}
                <Text style={styles.personalBridge}>{readingArtifacts.bridge}</Text>
                <View style={[styles.personalPrompt, { borderColor: `${theme.color}55` }]}>
                  <Ionicons name="compass-outline" size={18} color={theme.color} />
                  <Text style={styles.personalPromptText}>{readingArtifacts.reflectionPrompt}</Text>
                </View>
                <Text style={styles.personalDisclaimer}>{t('tarot.personal.disclaimer')}</Text>
              </View>
            )}

            {revealed.every(Boolean) && (
              <TouchableOpacity
                style={styles.historiaBtn}
                activeOpacity={0.85}
                onPress={() => setHistoriaAberta(true)}
                accessibilityRole="button"
                accessibilityLabel={t('stories.ver')}
              >
                <Ionicons name="sparkles" size={16} color={colors.gold} />
                <Text style={styles.historiaBtnText}>{t('stories.ver')}</Text>
              </TouchableOpacity>
            )}

            {/* O BOTÃO "OUVIR" — a tiragem inteira em voz alta (o MESMO corpo
                do modo história e do Diário), com a voz do aparelho. Mesma
                condição do modo história: só com as três cartas viradas. */}
            {revealed.every(Boolean) && (
              <BotaoOuvir texto={corpoDaTiragem} style={styles.ouvirBtn} />
            )}

            {drawn.map((card, i) => {
              if (!ritualComplete) return null;
              // Waite, 1911, verbatim — só nas cartas em que a citação está
              // conferida (11 das 78). Fica FORA da leitura, numa nota
              // rotulada: é história do baralho, não é o app dizendo isso
              // sobre a vida de quem consultou. Nas outras 67 cartas não
              // aparece nada, porque não citar é melhor que citar de ouvido.
              const waite = getWaiteNote(card, readingLanguage);
              return (
                <View key={i} style={styles.meaningCard}>
                  <View style={[styles.meaningIcon, { backgroundColor: theme.color + '22' }]}>
                    <Ionicons name={card.icon} size={20} color={theme.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.meaningPos}>{readingPositions[i]?.label || readingTranslate(`tarot.position.${POSITIONS[i]}`)} · {getCardName(card, readingLanguage)}{orientations[i] ? readingTranslate('tarot.reversedTag') : ''}</Text>
                    <Text style={styles.meaningText}>
                      {readingArtifacts?.interpretations[i] || getThemedMeaning(card, theme.key, orientations[i], canonicalPosition(readingPositions[i], i), lang)}
                    </Text>
                    {waite && (
                      <View style={styles.sourceBox}>
                        <Text style={styles.sourceTitle}>{waite.titulo}</Text>
                        <Text style={styles.sourceQuote}>“{waite.verbatim}”</Text>
                        <Text style={styles.sourceNote}>{waite.nota}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* AS RESSALVAS, UMA VEZ — e só as que valem para ESTA tiragem.
                (31/07/2026) Antes elas vinham coladas dentro do texto de cada
                carta: "que pode ser uma pessoa ou uma postura sua" nas 16
                cortes, "travado, em excesso ou virado pra dentro" nas 78
                invertidas, e "um Arcano Maior põe em jogo o eixo da relação,
                não o episódio" nos 22 Maiores. As três são verdadeiras. As três
                são iguais para dezenas de cartas — e é por isso mesmo que elas
                não podem morar dentro da leitura: uma frase que serve para 22
                arcanos não diz nada sobre o arcano que saiu, e repetida três
                vezes na mesma tela ela deixa de ser lida.
                Ressalva é contrato: vale uma vez, no lugar de contrato. Aqui.
                E aparece condicional — quem tirou três cartas direitas e sem
                corte não lê nada disto. */}
            {revealed.every(Boolean) && (() => {
              const temInvertida = orientations.some(Boolean);
              const temCorte = drawn.some((c) => c.suit && c.number >= 11);
              const temMaior = drawn.some((c) => c.arcana === 'maior');
              if (!temInvertida && !temCorte && !temMaior) return null;
              return (
                <View style={styles.spreadCard}>
                  <Text style={styles.spreadTitle}>{t('tarot.howToRead')}</Text>
                  {temMaior && (
                    <Text style={styles.spreadText}>
                      {t('tarot.note.major')}
                    </Text>
                  )}
                  {temCorte && (
                    <Text style={[styles.spreadText, temMaior && { marginTop: 10 }]}>
                      {t('tarot.note.court')}
                    </Text>
                  )}
                  {temInvertida && (
                    <Text style={[styles.spreadText, (temMaior || temCorte) && { marginTop: 10 }]}>
                      {t('tarot.note.reversed')}
                    </Text>
                  )}
                </View>
              );
            })()}

            {/* A TIRAGEM INTEIRA, não três leituras soltas.
                Duas camadas, as duas com fonte e as duas marcadas com o grau
                da fonte:
                • Dignidade elemental — regra da tríade do "Book T" (Mathers,
                  fim do séc. XIX, publicado por Regardie em 1937-1940): a
                  carta do meio é lida através das duas ao lado. A tiragem
                  deste app é exatamente uma tríade, então a doutrina cabe
                  inteira, sem adaptação.
                • Grau repetido / naipe dominante / concentração de Maiores —
                  leitura transversal consolidada no séc. XX. É boa, e o
                  código não a chama de antiga.
                As duas funções devolvem null quando a doutrina não se aplica
                (Maior de atribuição planetária no meio, nenhum padrão na
                tiragem) — nunca fabricam padrão onde não há. Só aparece com as
                três cartas viradas: antes disso seria entregar o desfecho de
                uma carta que a pessoa ainda não abriu. */}
            {revealed.every(Boolean) && (() => {
              const dignity = readingArtifacts?.dignity;
              const pattern = readingArtifacts?.pattern;
              if (!dignity && !pattern) return null;
              return (
                <View style={styles.spreadCard}>
                  <Text style={styles.spreadTitle}>{t('tarot.threeTogether')}</Text>
                  {dignity && <Text style={styles.spreadText}>{dignity}</Text>}
                  {pattern && <Text style={[styles.spreadText, dignity && { marginTop: 10 }]}>{pattern}</Text>}
                  {/* Toda vez que o app cita astrologia de carta, ele diz de
                      QUEM é a tabela. Há pelo menos três incompatíveis entre
                      si, e quem escreve "a correspondência astrológica do
                      tarô" está escondendo uma escolha. */}
                  <Text style={styles.spreadFootnote}>
                    {t('tarot.note.system')}
                  </Text>
                </View>
              );
            })()}

            {journalEntryId && (
              <VoiceInsightRecorder
                entryId={journalEntryId}
                readingType="tarot"
                readingTitle={readingTranslate('tarot.diary.title', { theme: readingArtifacts?.themeLabel || themeLabel })}
              />
            )}

            {/* Fecha a leitura: convite pra ficar alguns minutos com o que
                acabou de ler (screens/GroundingScreen.js). Card, nunca modal,
                e sem recompensa nenhuma — o porquê está em
                components/GroundingInvite.js. */}
            {ritualComplete && journalEntryId && (
              <View style={styles.reflectionCard} testID="tarot-reflection-card">
                <View style={styles.reflectionHeader}>
                  <View style={styles.reflectionIcon}>
                    <Ionicons name="create-outline" size={20} color={colors.gold} />
                  </View>
                  <View style={styles.reflectionHeaderText}>
                    <Text style={styles.reflectionTitle}>{t('tarot.reflection.title')}</Text>
                    <Text style={styles.reflectionBody}>{t('tarot.reflection.body')}</Text>
                  </View>
                </View>
                <TextInput
                  testID="tarot-reflection-input"
                  style={styles.reflectionInput}
                  value={reflection}
                  onChangeText={(value) => {
                    setReflection(value);
                    setReflectionSaved(false);
                  }}
                  placeholder={t('tarot.reflection.placeholder')}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={600}
                  accessibilityLabel={t('tarot.reflection.title')}
                />
                <View style={styles.reflectionFooter}>
                  <View style={styles.reflectionPrivate}>
                    <Ionicons name="lock-closed-outline" size={13} color={colors.gold} />
                    <Text style={styles.reflectionPrivateText}>{t('tarot.reflection.private')}</Text>
                  </View>
                  <Pressable
                    testID="tarot-reflection-save"
                    style={({ pressed }) => [
                      styles.reflectionSave,
                      (!reflection.trim() || reflectionSaving) && styles.reflectionSaveDisabled,
                      pressed && styles.reflectionSavePressed,
                    ]}
                    onPress={saveReflectionToDiary}
                    disabled={!reflection.trim() || reflectionSaving}
                    accessibilityRole="button"
                  >
                    <Ionicons name={reflectionSaved ? 'checkmark' : 'bookmark-outline'} size={15} color="#21152D" />
                    <Text style={styles.reflectionSaveText}>
                      {reflectionSaved ? t('tarot.reflection.saved') : t('tarot.reflection.save')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}

            {ritualComplete && readingArtifacts && (
              <View style={styles.communityCard} testID="tarot-community-card">
                <View style={styles.communityHeader}>
                  <View style={styles.communityIcon}>
                    <Ionicons name="people-outline" size={21} color={colors.gold} />
                  </View>
                  <View style={styles.communityHeaderText}>
                    <Text style={styles.communityTitle}>{t('tarot.community.title')}</Text>
                    <Text style={styles.communityBody}>{t('tarot.community.body')}</Text>
                  </View>
                </View>
                <View style={styles.communityPrivacy}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={colors.gold} />
                  <Text style={styles.communityPrivacyText}>
                    {coupleData ? t('tarot.community.couplePrivate') : t('tarot.community.privacy')}
                  </Text>
                </View>
                {!coupleData && (
                  <View style={styles.communityActions}>
                    <Pressable
                      style={({ pressed }) => [styles.communityPrimary, pressed && styles.communityPressed, shared && styles.communityShared]}
                      onPress={confirmCommunityShare}
                      disabled={sharing || shared}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={shared ? 'checkmark-circle' : user ? 'share-social-outline' : 'log-in-outline'}
                        size={17}
                        color="#21152D"
                      />
                      <Text style={styles.communityPrimaryText}>
                        {shared
                          ? t('tarot.community.sharedCta')
                          : sharing
                            ? t('tarot.community.sharing')
                            : user
                              ? t('tarot.community.share')
                              : t('tarot.community.login')}
                      </Text>
                    </Pressable>
                    {user && (
                      <Pressable
                        style={({ pressed }) => [styles.communitySecondary, pressed && styles.communityPressed]}
                        onPress={openCommunity}
                        accessibilityRole="button"
                      >
                        <Text style={styles.communitySecondaryText}>{t('tarot.community.view')}</Text>
                        <Ionicons name="arrow-forward" size={16} color={colors.gold} />
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            )}

            {ritualComplete && <GroundingInvite />}

            {/* ORDEM IMPORTA: o ramo do limite diário vinha primeiro e, como
                a tiragem normal liga dailyBlocked, quem não assina
                lia "volta amanhã pra uma nova" logo abaixo das cartas — e o
                botão de assinar nunca chegava a aparecer neste primeiro
                estado. A prévia vitalícia vem primeiro agora, porque é ela
                que decide o que acontece amanhã pra essa pessoa. */}
            {ritualComplete && (previaVitaliciaGasta ? (
              // drawCards() já recusa redesenhar nesse caso — aqui é só pra não
              // deixar um botão "morto" que não faz nada visível ao tocar.
              // O texto ocupa o lugar do botão "Nova Tiragem": pedia assinatura
              // e não levava a Planos. Agora o pedido vem com o toque colado.
              <>
                {/* Frase que vale pros dois jeitos de chegar aqui (tiragem
                    grátis OU Leitura Bônus): o que importa é que a prévia é
                    uma só e não renova. Nada de "volta amanhã" — amanhã, sem
                    assinatura, é paywall. */}
                <Text style={styles.dailyLimitNote}>
                  {t('tarot.previewAfter')}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.btnWrap, { marginTop: 14 }]}
                  onPress={() => navigateFromTab(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                >
                  <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="diamond" size={18} color="#fff" />
                    <Text style={styles.btnText}>{t('tarot.locked.cta')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* Ainda tem bônus guardado da Loja: dá pra tirar outra agora
                    mesmo, sem assinar — a recompensa paga com tokens não pode
                    ficar presa atrás do paywall (mesmo motivo do cenário [3]
                    da regressão E2E). */}
                {bonusReadings > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    disabled={!bonusDrawReady || drawInFlight}
                    style={[
                      styles.bonusStoreBtn,
                      { marginTop: 10 },
                      (!bonusDrawReady || drawInFlight) && styles.drawDisabled,
                    ]}
                    onPress={() => drawCards(true)}
                  >
                    <Ionicons name="sparkles" size={16} color={colors.gold} />
                    <Text style={styles.bonusStoreText}>{t('tarot.bonusUse', { count: bonusReadings })}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : limiteDiarioReal ? (
              // Aqui "amanhã" é verdade: quem assina tem tiragem nova em cada
              // tema quando o dia virar. E hoje ainda sobram os outros temas —
              // por isso a frase aponta pra saída que existe agora.
              <>
                <Text style={styles.dailyLimitNote}>
                  {t('tarot.dailyAfter', { theme: themeLabel })}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.bonusStoreBtn, { marginTop: 10 }]}
                  onPress={() => navigateFromTab(ROUTES.PROFILE_TAB, { screen: ROUTES.LOJA })}
                >
                  <Ionicons name="bag-handle" size={16} color={colors.gold} />
                  <Text style={styles.bonusStoreText}>{t('tarot.dailyLimit.storeCta')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => drawCards()}
                disabled={!drawReady || drawInFlight}
                style={[
                  styles.btnWrap,
                  { marginTop: 16 },
                  (!drawReady || drawInFlight) && styles.drawDisabled,
                ]}
              >
                <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.btn}>
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.btnText}>{t('tarot.drawAgain')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <StoriesReader
        visible={historiaAberta}
        slides={slidesDaTiragem}
        titulo={t('tarot.title')}
        onClose={() => setHistoriaAberta(false)}
      />
    </View>
  );
}

// ===========================================================================
// O PREPARO DE WAITE — as quatro notas de prática, entre escolher o tema e
// apertar tirar
// ===========================================================================
// LEIA lib/waiteRegras.js ANTES DE MEXER EM QUALQUER TEXTO DAQUI. Este painel é
// VITRINE: ele mostra o que o motor exporta e não redige conteúdo. Todo texto
// vem de preparoDaTiragem(), avaliarPergunta(), progressoDoPreparo() e do bloco
// `tela` dos três packs. Se faltar palavra, ela nasce no pack, nos três
// idiomas — nunca dentro deste componente.
//
// TRÊS DECISÕES QUE NÃO SÃO ESTÉTICA:
//
// 1. FECHADO POR PADRÃO, E FÁCIL DE FECHAR DE NOVO. Quatro regras abertas em
//    cima de quem só quer tirar carta viram paredão, e paredão é obstáculo. O
//    cartão fechado mostra a isca (vida real, sem Waite e sem ano — a fonte
//    está a um toque, dentro) e a linha de estado. Tem "fechar e tirar direto"
//    no fim do painel, e o botão de tirar nunca sai da tela.
// 2. NADA AQUI TRANCA NADA. Não há gate, não há `disabled`, não há tempo
//    mínimo: paywall, limite diário por tema e leitura bônus continuam sendo os
//    únicos donos do que pode ou não ser tirado, exatamente como estavam. O
//    progresso serve para trocar o rótulo do botão e para a linha de estado.
// 3. A CONTAGEM É UMA OFERTA. Os vinte segundos são medida do app (o pack diz
//    isso com todas as letras onde aparece) e o botão de contar é opcional:
//    quem não quiser contar marca a regra como feita na mão, ou não marca.
//
// STORAGE: nenhum. O preparo é o gesto de agora, nesta cadeira — não há o que
// guardar, e por isso esta tela continua sem tocar em AsyncStorage.
function PreparoDeWaite({ lang, aberto, onAlternar, feitas, onMarcar, progresso, pergunta, onPerguntaChange }) {
  const UI = chromeDoPreparo(lang);
  // 'voce' | 'outra' — a única coisa que muda a saída do motor, e a quarta
  // regra é a única regra que responde a ela.
  const [paraQuem, setParaQuem] = useState('voce');
  const [restam, setRestam] = useState(null);
  const [fontesAbertas, setFontesAbertas] = useState(false);

  const preparo = useMemo(() => preparoDaTiragem({ paraQuem }, lang), [paraQuem, lang]);
  const avaliacao = useMemo(() => avaliarPergunta(pergunta, lang), [pergunta, lang]);

  // A contagem regressiva do embaralho. Chegando a zero, marca a segunda regra
  // como feita — é o único lugar em que o app marca algo sozinho, e é porque o
  // gesto acabou de acontecer na tela.
  useEffect(() => {
    if (restam === null) return undefined;
    if (restam <= 0) {
      setRestam(null);
      onMarcar('embaralhar', true);
      return undefined;
    }
    const id = setTimeout(() => setRestam((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restam]);

  if (!aberto) {
    return (
      <TouchableOpacity
        style={styles.preparoConvite}
        activeOpacity={0.85}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: false }}
        accessibilityLabel={UI.convite}
        accessibilityHint={UI.abrir}
        testID="preparo-abrir"
      >
        <View style={styles.preparoConviteTexto}>
          <Text style={styles.preparoConviteTitulo}>{UI.convite}</Text>
          <Text style={styles.preparoConviteLinha}>{UI.conviteLinha}</Text>
          <Text style={styles.preparoEstado}>{progresso.texto}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.preparoPainel} testID="preparo-painel">
      <TouchableOpacity
        style={styles.preparoTopo}
        activeOpacity={0.85}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: true }}
        accessibilityLabel={preparo.titulo}
        accessibilityHint={UI.fechar}
        testID="preparo-fechar"
      >
        <Text style={styles.preparoTitulo}>{preparo.titulo}</Text>
        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {/* A abertura inteira: parágrafo de vida real primeiro, fonte depois. */}
      {preparo.abertura.split('\n\n').map((paragrafo, i) => (
        <Text key={i} style={styles.preparoAbertura}>
          {paragrafo}
        </Text>
      ))}

      {/* PARA QUEM É A LEITURA — muda só a quarta regra, que é a única em que a
          fonte distingue os casos. */}
      <Text style={styles.preparoRotulo}>{UI.paraQuemRotulo}</Text>
      <View style={styles.preparoChipRow}>
        {[
          ['voce', UI.paraQuemVoce],
          ['outra', UI.paraQuemOutra],
        ].map(([id, rotulo]) => {
          const ativo = paraQuem === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.preparoChip, ativo && styles.preparoChipAtivo]}
              activeOpacity={0.85}
              onPress={() => setParaQuem(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={rotulo}
              testID={`preparo-paraquem-${id}`}
            >
              <Text style={[styles.preparoChipTexto, ativo && styles.preparoChipTextoAtivo]}>{rotulo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* AS QUATRO, NA ORDEM DE WAITE */}
      {preparo.regras.map((regra) => {
        const feita = feitas.includes(regra.id);
        return (
          <View
            key={regra.id}
            style={[styles.preparoRegra, feita && styles.preparoRegraFeita]}
            testID={`preparo-regra-${regra.id}`}
          >
            <View style={styles.preparoRegraTopo}>
              <View style={styles.preparoOrdem}>
                <Text style={styles.preparoOrdemTexto}>{regra.ordem}</Text>
              </View>
              <Text style={styles.preparoRegraTitulo}>{regra.titulo}</Text>
            </View>

            {/* Prende primeiro: a vida real. */}
            <Text style={styles.preparoChamada}>{regra.chamada}</Text>

            <Text style={styles.preparoRotulo}>{UI.rotuloGesto}</Text>
            <Text style={styles.preparoTexto}>{regra.oQueVoceFaz}</Text>

            {/* A PRIMEIRA REGRA TEM CAMPO — e a avaliação é do TEXTO digitado,
                nunca da vida de quem digitou. O motor se rotula leitura do app
                onde o critério é do app; a tela só imprime o que ele devolve. */}
            {regra.pedeTexto ? (
              <View style={styles.preparoCampoBox}>
                <Text style={styles.preparoRotulo}>{UI.rotuloCampo}</Text>
                <TextInput
                  style={styles.preparoInput}
                  value={pergunta}
                  onChangeText={onPerguntaChange}
                  placeholder={UI.ajudaCampo}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  maxLength={220}
                  accessibilityLabel={UI.rotuloCampo}
                  testID="preparo-campo-pergunta"
                />
                <Text style={styles.preparoAvaliacao} testID="preparo-avaliacao">
                  {avaliacao.mensagem}
                </Text>
                {avaliacao.definida ? (
                  <Text style={styles.preparoAvaliacao}>{avaliacao.proximoPasso}</Text>
                ) : null}
                <Text style={styles.preparoRotulo}>{UI.rotuloExemplos}</Text>
                {avaliacao.exemplos.map((exemplo) => (
                  <TouchableOpacity
                    key={exemplo}
                    activeOpacity={0.7}
                    onPress={() => onPerguntaChange(exemplo)}
                    accessibilityRole="button"
                    accessibilityLabel={exemplo}
                  >
                    <Text style={styles.preparoExemplo}>· {exemplo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* A SEGUNDA REGRA TEM CONTAGEM — vinte segundos, que são medida do
                app e o pack declara isso onde o texto aparece. Opcional: quem
                não quiser contar marca a regra na mão. */}
            {regra.segundos ? (
              <TouchableOpacity
                style={styles.preparoContador}
                activeOpacity={0.85}
                onPress={() => setRestam(regra.segundos)}
                disabled={restam !== null}
                accessibilityRole="button"
                accessibilityLabel={UI.contar}
                testID="preparo-contador"
              >
                <Ionicons name="timer-outline" size={16} color={colors.gold} />
                <Text style={styles.preparoContadorTexto}>
                  {restam !== null
                    ? preencherMolde(UI.contando, { s: restam })
                    : feita
                      ? UI.contada
                      : UI.contar}
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.preparoRotulo}>{UI.rotuloPorQue}</Text>
            <Text style={styles.preparoTexto}>{regra.porQue}</Text>

            {/* O RECIBO, por último: obra, autor, ano e parte. */}
            <View style={styles.preparoRecibo}>
              <Text style={styles.preparoReciboRotulo}>{UI.rotuloRecibo}</Text>
              <Text style={styles.preparoReciboTexto} testID={`preparo-recibo-${regra.id}`}>
                {regra.recibo}
              </Text>
            </View>

            {/* A ÚNICA CITAÇÃO ENTRE ASPAS DESTA FEATURE, e ela mora onde
                decide: é a linha em que a carta invertida entra na prática, no
                mesmo parágrafo do embaralho. As quatro notas NÃO vão entre
                aspas — esta base não tem o inglês literal delas. */}
            {regra.id === 'embaralhar'
              ? preparo.verbatins.map((v) => (
                  <View key={v.texto} style={styles.preparoVerbatim}>
                    <Text style={styles.preparoReciboRotulo}>{UI.rotuloVerbatim}</Text>
                    <Text style={styles.preparoVerbatimTexto}>“{v.texto}”</Text>
                    <Text style={styles.preparoTexto}>{v.parafrase}</Text>
                    <Text style={styles.preparoReciboTexto}>{v.locus}</Text>
                  </View>
                ))
              : null}

            <TouchableOpacity
              style={[styles.preparoMarcar, feita && styles.preparoMarcarFeita]}
              activeOpacity={0.85}
              onPress={() => onMarcar(regra.id, !feita)}
              accessibilityRole="button"
              accessibilityState={{ checked: feita }}
              accessibilityLabel={feita ? UI.marcada : UI.marcar}
              testID={`preparo-marcar-${regra.id}`}
            >
              <Ionicons
                name={feita ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={feita ? colors.gold : colors.textMuted}
              />
              <Text style={[styles.preparoMarcarTexto, feita && styles.preparoMarcarTextoFeita]}>
                {feita ? UI.marcada : UI.marcar}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.preparoEstado} testID="preparo-estado">
        {progresso.texto}
      </Text>

      {/* As duas ressalvas do motor: por que o app não tranca, e o que é de
          Waite e o que é do app. */}
      <Text style={styles.preparoNota}>{preparo.notaSemTranca}</Text>
      <Text style={styles.preparoNota}>{preparo.notaLeituraDoApp}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setFontesAbertas((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: fontesAbertas }}
        accessibilityLabel={fontesAbertas ? UI.ocultarFontes : UI.verFontes}
        testID="preparo-fontes"
      >
        <Text style={styles.preparoLink}>{fontesAbertas ? UI.ocultarFontes : UI.verFontes}</Text>
      </TouchableOpacity>

      {fontesAbertas ? (
        <View style={styles.preparoFontesBox}>
          <Text style={styles.preparoRotulo}>{UI.rotuloDatacao}</Text>
          {preparo.datacao.map((d) => (
            <View key={d.id} style={styles.preparoDatacao}>
              <Text style={styles.preparoDatacaoLinha}>
                {d.linha} · {d.grauNome}
              </Text>
              <Text style={styles.preparoReciboTexto}>{d.nota}</Text>
            </View>
          ))}
          <Text style={styles.preparoRotulo}>{UI.rotuloFontes}</Text>
          {preparo.fonte.map((f) => (
            <Text key={f} style={styles.preparoReciboTexto}>
              {f}
            </Text>
          ))}
        </View>
      ) : null}

      {/* A saída, dita com todas as letras: dá para fechar e tirar direto. */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityLabel={UI.pular}
        testID="preparo-pular"
      >
        <Text style={styles.preparoLink}>{UI.pular}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  albumBtn: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, gap: 2,
  },
  albumBtnText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  // COMPOSIÇÃO CENTRADA (08/08/2026): título de seção grande e CENTRADO
  // (22/800, muito ar em cima) — o padrão medido no concorrente premium. O vão
  // entre o header e o primeiro título deixa o cenário aparecer — é o respiro
  // que faz a tela ler como paisagem, não como lista.
  sectionLabel: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', alignSelf: 'center', marginTop: 34, marginBottom: 14, letterSpacing: 0.2 },
  themeRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 20 },
  themeChip: {
    width: '31%', minHeight: 64, backgroundColor: '#171419', borderRadius: 14,
    paddingVertical: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#4B4146', gap: 5,
  },
  themeChipDisabled: { opacity: 0.48 },
  themeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  themeTextSelected: { color: colors.text },
  emptyWrap: { alignItems: 'center', marginTop: 4 },
  emptyTitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20, lineHeight: 24 },
  questionCard: {
    width: '100%',
    alignItems: 'stretch',
    backgroundColor: '#151218',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold + '35',
    padding: 18,
    marginBottom: 16,
  },
  guideIntro: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  guideIntroCopy: { flex: 1, marginLeft: 8 },
  guideTitle: { color: '#FFF8EC', fontSize: 19, lineHeight: 24, fontWeight: '800', marginTop: 5 },
  guideBody: { color: '#C8BEC8', fontSize: 12, lineHeight: 18, marginTop: 6 },
  guidePrompt: { color: '#E9D5AD', fontSize: 12, lineHeight: 17, fontWeight: '800', marginTop: 15, marginBottom: 9 },
  focusList: { gap: 8 },
  focusOption: {
    minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 14, borderWidth: 1, borderColor: '#4B4146',
    backgroundColor: '#1B171D', paddingVertical: 10, paddingHorizontal: 12,
  },
  choicePressed: { opacity: 0.82, transform: [{ scale: 0.995 }] },
  focusDot: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: '#756B72',
    alignItems: 'center', justifyContent: 'center',
  },
  focusDotCore: { width: 8, height: 8, borderRadius: 4 },
  focusOptionText: { flex: 1, color: '#BDB4BC', fontSize: 13, lineHeight: 18, fontWeight: '700' },
  focusOptionTextSelected: { color: '#FFF8EC' },
  guideReceipt: {
    marginTop: 12, borderRadius: 16, borderLeftWidth: 2, borderLeftColor: colors.gold,
    backgroundColor: '#211B1A', paddingVertical: 12, paddingHorizontal: 14,
  },
  guideAcknowledgement: { color: '#FFF8EC', fontSize: 13, lineHeight: 20, fontWeight: '700' },
  guidePlan: { color: '#C9BCA9', fontSize: 12, lineHeight: 19, marginTop: 6 },
  signLens: {
    marginTop: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: 16, borderWidth: 1, borderColor: '#6A5534',
    backgroundColor: '#1D1917', padding: 12,
  },
  signLensIcon: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#3B2F1C',
  },
  signLensGlyph: { color: '#E0BE78', fontSize: 17 },
  signLensCopy: { flex: 1 },
  signLensTitle: { color: '#E0BE78', fontSize: 11, lineHeight: 15, fontWeight: '900', letterSpacing: 0.45 },
  signLensText: { color: '#D3C9BD', fontSize: 12, lineHeight: 18, marginTop: 3 },
  spreadChoices: { gap: 8 },
  spreadChoice: {
    minHeight: 62, borderRadius: 14, borderWidth: 1, borderColor: '#4B4146',
    backgroundColor: '#1B171D', paddingVertical: 10, paddingHorizontal: 12,
  },
  spreadChoiceSelected: { borderColor: colors.gold, backgroundColor: '#241E19' },
  spreadChoiceLabel: { color: '#BDB4BC', fontSize: 12, lineHeight: 17, fontWeight: '800' },
  spreadChoiceLabelSelected: { color: '#F2D8A4' },
  spreadChoiceBody: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 3 },
  suggestedQuestion: {
    marginTop: 14, borderRadius: 16, borderWidth: 1, borderColor: '#5F4D34',
    backgroundColor: '#1C1817', padding: 13,
  },
  suggestedQuestionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  suggestedQuestionLabel: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  suggestedQuestionEdit: { color: '#E8D1A7', fontSize: 11, fontWeight: '800', textDecorationLine: 'underline' },
  suggestedQuestionText: { color: '#FFF8EC', fontSize: 15, lineHeight: 22, fontWeight: '700', marginTop: 8 },
  guideDisclosures: { marginTop: 12, gap: 5 },
  guideDisclosureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  guideDisclosureDot: { color: colors.gold, fontSize: 12, lineHeight: 16 },
  guideDisclosure: { flex: 1, color: '#9C9196', fontSize: 10, lineHeight: 15 },
  questionEyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  questionTitle: { color: colors.text, fontSize: 20, lineHeight: 26, fontWeight: '800', marginTop: 7 },
  questionInputShell: {
    marginTop: 14,
    minHeight: 116,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.035)',
    padding: 13,
  },
  questionInput: { minHeight: 72, color: colors.text, fontSize: 16, lineHeight: 23, textAlignVertical: 'top' },
  questionCount: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textAlign: 'right', marginTop: 4 },
  questionHelp: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 11 },
  questionPrivacyRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  questionPrivacy: { flex: 1, color: colors.gold, fontSize: 11, lineHeight: 16, fontWeight: '700' },
  profileLens: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12,
    padding: 10, borderRadius: 12, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.025)',
  },
  profileLensText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  dailyLimitNote: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 19, paddingHorizontal: 10 },
  bonusStoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.gold + '66',
    paddingVertical: 12, paddingHorizontal: 18, marginTop: 4,
  },
  bonusStoreText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  // O botão do modo história — a mesma gramática do bonusStoreBtn (contorno
  // dourado, sem fundo): é porta, não call-to-action de venda.
  historiaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.gold + '66',
    paddingVertical: 12, paddingHorizontal: 18, marginBottom: 14,
  },
  historiaBtnText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  // O Ouvir abaixo do modo história, com o mesmo respiro que ele tem do texto.
  ouvirBtn: { alignSelf: 'center', marginBottom: 14 },
  btnWrap: { borderRadius: 12, overflow: 'hidden', width: '100%' },
  drawDisabled: { opacity: 0.52 },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  tarotActionText: { color: '#21160D' },
  ritualStage: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#121014',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.gold + '2D',
    paddingVertical: 22,
    paddingHorizontal: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ritualMarkers: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  ritualMarker: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  ritualStep: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.45, marginTop: 14 },
  ritualPosition: { color: colors.text, fontSize: 24, lineHeight: 30, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  ritualPositionPrompt: { color: '#AFA4AD', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5, marginBottom: 16, paddingHorizontal: 16 },
  tarotCardLarge: { width: '100%', alignItems: 'center' },
  scratchCard: {
    width: '96%',
    maxWidth: 334,
    aspectRatio: 0.6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold + '55',
    shadowOpacity: 0.34,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  tarotFace: {
    width: '100%', height: '100%', borderRadius: 20, overflow: 'hidden',
    backgroundColor: '#09080B', borderWidth: 1, borderColor: '#4B4146',
  },
  tarotImage: { width: '100%', height: '100%' },
  tarotBack: { width: '100%', height: 150, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 8 },
  // O nome da carta revelada é o momento da tela — tipografia display (20/800).
  // numberOfLines={2} segue no JSX; a orientação também está na imagem girada e
  // repetida em meaningPos, então nome longo truncado não esconde informação.
  tarotName: { color: colors.text, fontSize: 24, fontWeight: '800', lineHeight: 30, marginTop: 14, textAlign: 'center', paddingHorizontal: 18 },
  immediateReading: {
    width: '96%', maxWidth: 334, marginTop: 12, borderRadius: 17,
    borderWidth: 1, borderColor: colors.gold + '55', backgroundColor: '#1B1717', padding: 15,
  },
  immediateEyebrow: { color: colors.gold, fontSize: 10, lineHeight: 14, fontWeight: '900', letterSpacing: 1.15 },
  immediateMeaning: { color: '#EFE7DD', fontSize: 14, lineHeight: 22, marginTop: 7 },
  tapText: { color: colors.textMuted, fontSize: 11 },
  posLabel: { color: colors.textMuted, fontSize: 12, marginTop: 8, fontWeight: '600' },
  nextCardBtn: {
    width: '96%', maxWidth: 334, minHeight: 52, marginTop: 18, borderRadius: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
    backgroundColor: colors.gold,
  },
  nextCardBtnPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  nextCardBtnText: { color: '#1B1224', fontSize: 14, fontWeight: '900' },
  ritualCompletePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 18,
    borderRadius: 999, borderWidth: 1, borderColor: colors.gold + '55',
    backgroundColor: colors.gold + '12', paddingHorizontal: 14, paddingVertical: 8,
  },
  ritualCompleteText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  personalCard: {
    backgroundColor: '#191121', borderRadius: 22, padding: 18, marginBottom: 16,
    borderWidth: 1, borderColor: colors.gold + '38',
  },
  personalHeader: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  personalIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  personalHeaderText: { flex: 1 },
  personalTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  personalLens: { color: colors.gold, fontSize: 11, fontWeight: '800', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.55 },
  personalContext: { color: colors.text, fontSize: 15, lineHeight: 23, marginTop: 16 },
  personalGuideContext: { color: '#D1C4B5', fontSize: 14, lineHeight: 22, marginTop: 9 },
  personalSignLens: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12,
    borderRadius: 13, backgroundColor: '#211B17', padding: 11,
  },
  personalSignLensText: { flex: 1, color: '#DDC9A5', fontSize: 12, lineHeight: 18 },
  personalBridge: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, marginTop: 10 },
  personalPrompt: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 15,
    borderRadius: 14, borderWidth: 1, padding: 13, backgroundColor: 'rgba(255,255,255,0.025)',
  },
  personalPromptText: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  personalDisclaimer: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 12 },
  meaningCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  meaningIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  meaningPos: { color: colors.text, fontSize: 15, fontWeight: '800' },
  meaningText: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, marginTop: 6 },
  sourceBox: {
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  sourceTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  sourceQuote: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontStyle: 'italic', marginTop: 4 },
  sourceNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  spreadCard: {
    backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginTop: 4, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  spreadTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 8 },
  spreadText: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  spreadFootnote: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 10 },
  reflectionCard: {
    backgroundColor: '#17101F', borderRadius: 20, padding: 17, marginTop: 2, marginBottom: 16,
    borderWidth: 1, borderColor: colors.gold + '35',
  },
  reflectionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  reflectionIcon: {
    width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.gold + '14',
  },
  reflectionHeaderText: { flex: 1 },
  reflectionTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  reflectionBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  reflectionInput: {
    minHeight: 104, marginTop: 14, padding: 13, borderRadius: 14, textAlignVertical: 'top',
    borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.03)',
    color: colors.text, fontSize: 15, lineHeight: 22,
  },
  reflectionFooter: { marginTop: 11, gap: 10 },
  reflectionPrivate: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reflectionPrivateText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  reflectionSave: {
    minHeight: 44, borderRadius: 13, backgroundColor: colors.gold,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
  },
  reflectionSaveDisabled: { opacity: 0.42 },
  reflectionSavePressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  reflectionSaveText: { color: '#21152D', fontSize: 13, fontWeight: '900' },
  communityCard: {
    backgroundColor: '#17101F', borderRadius: 20, padding: 17, marginBottom: 16,
    borderWidth: 1, borderColor: colors.gold + '35',
  },
  communityHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  communityIcon: {
    width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.gold + '14',
  },
  communityHeaderText: { flex: 1 },
  communityTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: '800' },
  communityBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 3 },
  communityPrivacy: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 13,
    padding: 11, borderRadius: 12, backgroundColor: colors.gold + '0D',
  },
  communityPrivacyText: { flex: 1, color: colors.gold, fontSize: 11, lineHeight: 17, fontWeight: '700' },
  communityActions: { marginTop: 13, gap: 9 },
  communityPrimary: {
    minHeight: 46, borderRadius: 13, backgroundColor: colors.gold,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  communityShared: { backgroundColor: '#DDBA70' },
  communityPrimaryText: { color: '#21152D', fontSize: 13, fontWeight: '900' },
  communitySecondary: {
    minHeight: 43, borderRadius: 13, borderWidth: 1, borderColor: colors.gold + '44',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
  },
  communitySecondaryText: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  communityPressed: { opacity: 0.8, transform: [{ scale: 0.99 }] },

  // ---- O PREPARO DE WAITE ----
  // Mobile-first e alinhado à esquerda: o painel vive dentro de `emptyWrap`,
  // que centraliza, então tudo aqui declara largura cheia e texto à esquerda.
  preparoConvite: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  preparoConviteTexto: { flex: 1, gap: 4 },
  preparoConviteTitulo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  preparoConviteLinha: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  preparoPainel: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  preparoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preparoTitulo: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '800' },
  preparoAbertura: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  preparoRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 6,
  },
  preparoChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preparoChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  preparoChipAtivo: { borderColor: colors.gold },
  preparoChipTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  preparoChipTextoAtivo: { color: colors.gold },

  preparoRegra: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 4,
    gap: 6,
  },
  preparoRegraFeita: { borderColor: colors.gold + '66' },
  preparoRegraTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preparoOrdem: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preparoOrdemTexto: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  preparoRegraTitulo: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  preparoChamada: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  preparoTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  preparoCampoBox: { gap: 6, marginTop: 2 },
  preparoInput: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  preparoAvaliacao: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  preparoExemplo: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

  preparoContador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold + '66',
    paddingVertical: 11,
    marginTop: 4,
  },
  preparoContadorTexto: { color: colors.gold, fontSize: 13, fontWeight: '700' },

  preparoRecibo: {
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 10,
    gap: 3,
    marginTop: 4,
  },
  preparoReciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  preparoReciboTexto: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  preparoVerbatim: { gap: 5, marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  preparoVerbatimTexto: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

  preparoMarcar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    marginTop: 6,
  },
  preparoMarcarFeita: { borderColor: colors.gold + '66' },
  preparoMarcarTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  preparoMarcarTextoFeita: { color: colors.gold },

  preparoEstado: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  preparoNota: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  preparoLink: { color: colors.gold, fontSize: 13, fontWeight: '700', paddingVertical: 6 },
  preparoFontesBox: { gap: 6 },
  preparoDatacao: { gap: 2 },
  preparoDatacaoLinha: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: '700' },
});
