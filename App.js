import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState, Suspense, lazy } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

import { colors } from './theme';
import { ROUTES } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlertHost } from './components/AlertHost';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
// Plano que a pessoa escolheu antes de o app pedir login (ver PlanosScreen.js
// e lib/checkoutIntent.js) — é o que permite devolvê-la pra oferta depois do
// login com Google/confirmação de e-mail, que recarregam a página inteira.
import { readCheckoutIntent, clearCheckoutIntent } from './lib/checkoutIntent';
import { initConversionTracking } from './lib/conversionTracking';
// Funil PRÓPRIO (lib/funnel.js → POST /api/track). Complementar ao
// conversionTracking acima, que continua no lugar mas segue inerte enquanto
// EXPO_PUBLIC_FB_PIXEL_ID/EXPO_PUBLIC_GA_ID não forem configurados.
import { funnel } from './lib/funnel';
import { acceptInvite } from './lib/coupleInvite';
import { saveCorrelationCode } from './lib/coupleData';
// Analytics de visitas da própria Vercel (hospeda o app) — não depende de
// Pixel/GA (que ainda esperam ID real do Lenda): já conta visita real hoje,
// sem precisar de nenhuma conta nova (25/07/2026).
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';

// Sem isso, uma notificação chegando com o app ABERTO (foreground) não mostra
// nada — o handler decide o comportamento nesse caso (banner + som, sem
// badge). expo-notifications não existe de verdade na web, por isso o
// require fica dentro do try/catch (mesmo padrão de lib/notifications.js).
if (Platform.OS !== 'web') {
  try {
    const Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch {}
}
import { LanguageProvider, useLanguage } from './context/LanguageContext';
// Som do céu — o motor de áudio vive num provider ACIMA do Tab.Navigator (ver
// o comentário no topo de context/CosmicSoundContext.js): trocar de aba
// desmonta a tela, e se o áudio morasse dentro de uma tela o som cortaria no
// meio, que é o oposto do que esta feature existe pra fazer.
import { CosmicSoundProvider } from './context/CosmicSoundContext';
import CosmicSoundPlayer from './components/CosmicSoundPlayer';
import HomeScreen from './screens/HomeScreen';
import TarotScreen from './screens/TarotScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
// Eager de propósito: é a tela MAIS visitada do produto — 118 das 128 sessões
// de 30/07 passaram por ela (92% dos aparelhos do dia não têm perfil). Estava
// no lote "raramente visitadas" abaixo, e o custo era duplo pra quem chega:
// o spinner do Gate esperando o AsyncStorage e, logo em seguida, o
// LoadingFallback do Suspense — dois spinners idênticos e um round-trip de
// chunk antes da primeira palavra do app.
import OnboardingChoiceScreen from './screens/OnboardingChoiceScreen';
import { withFeatureGate } from './components/FeatureGate';

// Telas raramente visitadas (config/legal, ou exclusivas de assinante e já
// gated por withFeatureGate) — não precisam entrar no parse inicial do bundle
// web (~29 telas eram importadas eagerly antes disso, achado real de
// auditoria de performance, 19/07/2026). Cada Stack.Navigator que renderiza
// alguma destas precisa de um <Suspense> ancestral (ver LoadingFallback).
const PrivacyScreen = lazy(() => import('./screens/PrivacyScreen'));
const TimelineScreen = lazy(() => import('./screens/TimelineScreen'));
const ReconectarScreen = lazy(() => import('./screens/ReconectarScreen'));
const DescobrirScreen = lazy(() => import('./screens/DescobrirScreen'));
const AgirScreen = lazy(() => import('./screens/AgirScreen'));
const ProgressoScreen = lazy(() => import('./screens/ProgressoScreen'));
const RetrospectivaScreen = lazy(() => import('./screens/RetrospectivaScreen'));
const ReportsScreen = lazy(() => import('./screens/ReportsScreen'));
const TokensScreen = lazy(() => import('./screens/TokensScreen'));
const LojaScreen = lazy(() => import('./screens/LojaScreen'));
const HelpSupportScreen = lazy(() => import('./screens/HelpSupportScreen'));
const TermsScreen = lazy(() => import('./screens/TermsScreen'));
// Lote 2 (25/07/2026, achado real de auditoria de performance): mais 12 telas
// que ainda carregavam eager dentro do HomeStack, que já tem <Suspense>
// próprio — Home/Tarot/Chat/Profile ficam de fora de propósito (são as raízes
// das 4 abas, Profile tem timing crítico do listener de instalar, ver
// components/AlertHost.js/lib/installPrompt.js).
const HoroscopeScreen = lazy(() => import('./screens/HoroscopeScreen'));
const BirthChartScreen = lazy(() => import('./screens/BirthChartScreen'));
const CompatibilityScreen = lazy(() => import('./screens/CompatibilityScreen'));
const DreamScreen = lazy(() => import('./screens/DreamScreen'));
const PalmScreen = lazy(() => import('./screens/PalmScreen'));
const LunarCalendarScreen = lazy(() => import('./screens/LunarCalendarScreen'));
// Calendário Cósmico — a grade do mês com as datas reais do céu
// (lib/calendarioCosmico.js). Lazy pelo mesmo motivo das outras, e aqui o peso
// nem é só o do módulo: o motor calcula um mês inteiro de efeméride, e quem
// nunca abrir a tela não paga nem o parse nem a conta.
const CalendarioCosmicoScreen = lazy(() => import('./screens/CalendarioCosmicoScreen'));
// Homem Zodiacal — tela de história (iatromatemática). Entra lazy pelo mesmo
// motivo das outras: é conteúdo denso que nem todo mundo abre, e o HomeStack
// já tem <Suspense> próprio.
const ZodiacBodyScreen = lazy(() => import('./screens/ZodiacBodyScreen'));
// Assentar — o ritual de respiração e presença oferecido no fim de uma leitura
// (components/GroundingInvite.js) e disponível pela Home. Lazy pelo mesmo
// motivo: quem nunca abrir não paga o bundle.
const GroundingScreen = lazy(() => import('./screens/GroundingScreen'));
// Rituais — a biblioteca de 21 rituais em 7 objetivos (lib/rituais.js). Lazy
// pelo mesmo motivo das de cima: o módulo carrega os 21 rituais inteiros, com
// os cinco campos e o aparato de fontes, e quem nunca abrir a tela não paga
// esse peso no parse inicial do bundle.
const RituaisScreen = lazy(() => import('./screens/RituaisScreen'));
// A Jornada Guiada — quatro trilhas de 7 dias (lib/jornada.js). Lazy pelo mesmo
// motivo das de cima: carrega as 28 leituras inteiras junto com o módulo, e
// quem nunca abrir a tela não paga esse peso no parse inicial do bundle.
const JornadaScreen = lazy(() => import('./screens/JornadaScreen'));
// A leva de 31/07/2026 — Mito × Fonte, "Como você tá?", o quiz "Você sabia?"
// e o Papel de Parede do céu. Lazy pelo mesmo motivo das outras telas de
// conteúdo: MitosScreen carrega os 25 mitos inteiros (lib/mitos.js),
// QuizCosmicoScreen as 40 perguntas (lib/quizCosmico.js) — quem nunca abre não
// paga esse peso no parse inicial do bundle.
const MitosScreen = lazy(() => import('./screens/MitosScreen'));
// A Idade Real de Cada Coisa — 30 datacoes navegaveis. Lazy pelo mesmo motivo
// das outras telas de conteudo: quem nunca abrir nao paga o parse.
const IdadeRealScreen = lazy(() => import('./screens/IdadeRealScreen'));
const ProfeccoesScreen = lazy(() => import('./screens/ProfeccoesScreen'));
const ComoDecideScreen = lazy(() => import('./screens/ComoDecideScreen'));
const ComoVoceTaScreen = lazy(() => import('./screens/ComoVoceTaScreen'));
const QuizCosmicoScreen = lazy(() => import('./screens/QuizCosmicoScreen'));
const WallpaperScreen = lazy(() => import('./screens/WallpaperScreen'));
const CoffeeScreen = lazy(() => import('./screens/CoffeeScreen'));
const QuizScreen = lazy(() => import('./screens/QuizScreen'));
const DiaryScreen = lazy(() => import('./screens/DiaryScreen'));
const SocialScreen = lazy(() => import('./screens/SocialScreen'));
const PlanosScreen = lazy(() => import('./screens/PlanosScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));
const TarotAlbumScreen = lazy(() => import('./screens/TarotAlbumScreen'));
const MonthlyWrappedScreen = lazy(() => import('./screens/MonthlyWrappedScreen'));

// ---------------------------------------------------------------------------
// AS SEIS TELAS DE CASAL, JÁ EMBRULHADAS — no escopo do MÓDULO, nunca no corpo
// de HomeStack()
// ---------------------------------------------------------------------------
// withFeatureGate() devolve uma função de componente NOVA a cada chamada
// (components/FeatureGate.js — sem memo). Chamada dentro do corpo de
// HomeStack(), o prop `component` mudava de identidade a cada render, o React
// via um TIPO de elemento diferente e desmontava/remontava a tela. E HomeStack
// re-renderiza quando o estado do Tab.Navigator muda — ou seja, trocar de aba
// e voltar zerava estado interno e posição de scroll de Timeline, Reconectar,
// Descobrir, Agir, Progresso e Retrospectiva, sem motivo nenhum. É o
// anti-padrão que a doc do React Navigation nomeia ("don't define components
// during render").
//
// Nada aqui depende de render: os títulos e descrições são strings PT literais,
// nenhuma passa por t(). Então içar é mudança de zero comportamento — só some
// o remount.
const TimelineGated = withFeatureGate(TimelineScreen, {
  title: 'Linha do Tempo é pra fazer em casal',
  description: 'Guardem memórias e cápsulas do tempo juntos — chame seu par pra começarem a linha do tempo de vocês.',
});
const ReconectarGated = withFeatureGate(ReconectarScreen, {
  title: 'Reconectar é pra fazer em casal',
  description: 'Rotas guiadas de reconexão pro casal — chame seu par pra percorrerem juntos.',
});
const DescobrirGated = withFeatureGate(DescobrirScreen, {
  title: 'Descobrir é pra fazer em casal',
  description: 'Jogos e quizzes pra se conhecerem melhor — chame seu par pra jogarem juntos.',
});
const AgirGated = withFeatureGate(AgirScreen, {
  title: 'Agir é pra fazer em casal',
  description: 'Ideias de encontro e metas da semana pro casal — chame seu par pra colocarem em prática.',
});
const ProgressoGated = withFeatureGate(ProgressoScreen, {
  title: 'Progresso é pra fazer em casal',
  description: 'Acompanhem juntos a evolução da relação de vocês — chame seu par pra começarem.',
});
const RetrospectivaGated = withFeatureGate(RetrospectivaScreen, {
  title: 'Retrospectiva é pra fazer em casal',
  description: 'Revivam os melhores momentos de vocês juntos — chame seu par pra desbloquearem isso.',
});

function LoadingFallback() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Só as rotas com `path` ganham URL própria na web (o app é servido pela Vercel
// em cosmicguide.cloud/oddpro.pro). Sem path, abrir a tela não muda a URL: não
// existe link compartilhável, e o Voltar do navegador SAI DO APP em vez de
// voltar uma tela.
//
// As três telas novas entram aqui porque são justamente o tipo de conteúdo que
// se manda pra alguém — o mês no Calendário Cósmico e um ritual específico. A
// adição é puramente aditiva: nenhuma rota existente muda de path, e o estado
// de navegação já salvo continua válido.
const linking = {
  prefixes: ['https://cosmicguide.cloud/cosmic-guide', 'https://oddpro.pro/cosmic-guide'],
  config: {
    screens: {
      [ROUTES.HOME_TAB]: {
        screens: {
          [ROUTES.HOME_MAIN]: '',
          [ROUTES.QUIZ]: 'quiz',
          [ROUTES.CALENDARIO_COSMICO]: 'calendario',
          [ROUTES.RITUAIS]: 'rituais',
          [ROUTES.JORNADA]: 'jornada',
          // A leva de 31/07: sem path explícito, a web caía no autogerado pelo
          // nome da rota (/cosmic-guide/QuizCosmico, /cosmic-guide/Mitos) —
          // casing inconsistente, e justamente no Mitos, a tela desenhada pra
          // print/compartilhamento, o link feio é a cara da feature.
          [ROUTES.MITOS]: 'mitos',
          [ROUTES.COMO_VOCE_TA]: 'como-voce-ta',
          [ROUTES.QUIZ_COSMICO]: 'voce-sabia',
          [ROUTES.WALLPAPER]: 'papel-de-parede',
        },
      },
    },
  },
};

// O quiz do funil (c:/tmp/gilfforever/web/app/(funil)/quiz) usa nomes de signo em
// ESPANHOL (lib/signs.es.js) — este app usa PORTUGUÊS (../lib/signs.js). Sem esse
// mapa, signByName()/compatibility() não reconhecem "Escorpio", "Capricornio" etc.
// e a compatibilidade do casal simplesmente não aparece.
const SIGN_ES_TO_PT = {
  Aries: 'Áries',
  Tauro: 'Touro',
  Géminis: 'Gêmeos',
  Cáncer: 'Câncer',
  Leo: 'Leão',
  Virgo: 'Virgem',
  Libra: 'Libra',
  Escorpio: 'Escorpião',
  Sagitario: 'Sagitário',
  Capricornio: 'Capricórnio',
  Acuario: 'Aquário',
  Piscis: 'Peixes',
};

// Handoff vindo do quiz do funil (Forja del Amor): ?voce=&amor=&sa=&sb=&en= na URL
// web. Roda uma vez, no topo do app, independente de qual tela monta primeiro —
// antes isso vivia dentro do load() do HomeScreen e só rodava se a Home chegasse a
// montar, o que não acontece mais com o gate do quiz cobrindo a tela inteira.
function useUrlBootstrap() {
  const { save } = useCouple();
  const [checked, setChecked] = useState(Platform.OS !== 'web');

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location.search) {
      setChecked(true);
      return;
    }
    const p = new URLSearchParams(window.location.search);
    const voce = p.get('voce'), amor = p.get('amor'), sa = p.get('sa'), sb = p.get('sb');
    const convite = p.get('convite');
    // &acesso= — o código de assinatura de quem convidou (lib/coupleInvite.js
    // buildInviteUrl). Salvo sob o MESMO par de nomes do perfil que chegou no
    // link, o caminho por código do CoupleContext passa a conceder acesso
    // neste aparelho: é assim que "o par usa de graça" acontece (decisão do
    // dono, 29/07/2026). A regex trava o formato — nada além de 32 hex entra
    // no storage vindo de URL.
    const acesso = p.get('acesso');
    if (voce && amor && sa && sb) {
      save({ voce, amor, sa: SIGN_ES_TO_PT[sa] || sa, sb: SIGN_ES_TO_PT[sb] || sb }).then(async () => {
        if (acesso && /^[a-f0-9]{32}$/.test(acesso)) {
          // Mesma normalização de signos do save — a chave do código é por
          // NOME do casal, não por signo, então basta o par voce/amor.
          try { await saveCorrelationCode(voce, amor, acesso); } catch {}
        }
        // Convite com código (lib/coupleInvite.js): avisa o servidor que o
        // par abriu o link, pra notificar o convidador na hora. Depois do
        // save, nunca antes — a notificação só faz sentido com o perfil já
        // valendo neste aparelho. Fire-and-forget de propósito.
        if (convite) acceptInvite(convite);
        window.history.replaceState({}, '', window.location.pathname);
        setChecked(true);
      });
    } else {
      setChecked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return checked;
}

function HomeStack() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.HOME_MAIN} component={HomeScreen} />
        <Stack.Screen name={ROUTES.HOROSCOPE} component={HoroscopeScreen} />
        <Stack.Screen name={ROUTES.BIRTH_CHART} component={BirthChartScreen} />
        <Stack.Screen name={ROUTES.DREAM} component={DreamScreen} />
        <Stack.Screen name={ROUTES.PALM} component={PalmScreen} />
        <Stack.Screen name={ROUTES.LUNAR_CALENDAR} component={LunarCalendarScreen} />
        {/* Calendário Cósmico — vizinho do Calendário Lunar de propósito: um
            mostra a fase de cada dia, o outro as datas em que o céu de fato
            muda de estado. Sem withFeatureGate na borda da rota: o mês corrente
            é aberto pra todo mundo e a assinatura entra só na navegação entre
            meses, por dentro da tela (a justificativa inteira está no cabeçalho
            de screens/CalendarioCosmicoScreen.js). */}
        <Stack.Screen name={ROUTES.CALENDARIO_COSMICO} component={CalendarioCosmicoScreen} />
        <Stack.Screen name={ROUTES.ZODIAC_BODY} component={ZodiacBodyScreen} />
        {/* Registrada só aqui, na stack da Home. O convite do fim da leitura
            (components/GroundingInvite.js) sobe pro navegador de abas e pede
            esta tela por dentro da Home — funciona igual vindo do Tarô, que
            mora em outra aba, sem duplicar a rota em duas stacks. */}
        <Stack.Screen name={ROUTES.GROUNDING} component={GroundingScreen} />
        {/* Rituais: na stack da Home pelo mesmo motivo de Assentar — é tela de
            conteúdo, alcançável da Home, e o paywall dela mora DENTRO da tela
            (só o detalhe de um ritual é que passa pelo OneTimeLock), então não
            leva withFeatureGate na borda da rota. */}
        <Stack.Screen name={ROUTES.RITUAIS} component={RituaisScreen} />
        {/* Jornada: registrada aqui, na stack da Home, porque quatro das cinco
            features que as ações do dia abrem (Mapa, Calendário Lunar,
            Assentar, Diário) são telas DESTA stack — só o Tarô mora em outra
            aba, e a tela sobe pro Tab.Navigator só nesse caso. */}
        <Stack.Screen name={ROUTES.JORNADA} component={JornadaScreen} />
        {/* A leva de 31/07/2026 — quatro telas de conteúdo, todas alcançáveis
            pelo grid da Home. Sem withFeatureGate na borda: nenhuma delas é
            exclusiva de casal, e o que for de assinatura se resolve DENTRO da
            tela (mesma razão de Rituais/Jornada logo acima). ComoVoceTa navega
            pra telas DESTA stack (e pro Tarô via aba pai, como Jornada faz). */}
        <Stack.Screen name={ROUTES.MITOS} component={MitosScreen} />
        <Stack.Screen name={ROUTES.IDADE_REAL} component={IdadeRealScreen} />
        {/* Profecções: técnica preditiva helenística (Ptolomeu IV.10) — vive
            no grid porque é conteúdo de consulta, como Mapa Astral. */}
        <Stack.Screen name={ROUTES.PROFECCOES} component={ProfeccoesScreen} />
        <Stack.Screen name={ROUTES.COMO_VOCE_TA} component={ComoVoceTaScreen} />
        <Stack.Screen name={ROUTES.QUIZ_COSMICO} component={QuizCosmicoScreen} />
        <Stack.Screen name={ROUTES.WALLPAPER} component={WallpaperScreen} />
        <Stack.Screen name={ROUTES.COFFEE} component={CoffeeScreen} />
        <Stack.Screen name={ROUTES.COMPATIBILITY} component={CompatibilityScreen} />
        <Stack.Screen name={ROUTES.QUIZ} component={QuizScreen} />
        <Stack.Screen name={ROUTES.DIARY} component={DiaryScreen} />
        <Stack.Screen name={ROUTES.REPORTS} component={ReportsScreen} />
        <Stack.Screen name={ROUTES.SOCIAL} component={SocialScreen} />
        {/* Exclusivas de assinantes — a tela real roda de verdade por baixo,
            com o SubscribeTeaser (components/FeatureGate.js) colado na parte
            de baixo pra quem não tem acesso; mesma altitude do FeatureGate do
            funil web (aplicado na borda da rota). Timeline entrou aqui porque
            já era vendida como benefício da assinatura na PlanosScreen mas
            estava sem gate nenhum (achado real de auditoria, 25/07/2026). */}
        <Stack.Screen name={ROUTES.TIMELINE} component={TimelineGated} />
        <Stack.Screen name={ROUTES.RECONECTAR} component={ReconectarGated} />
        <Stack.Screen name={ROUTES.DESCOBRIR} component={DescobrirGated} />
        <Stack.Screen name={ROUTES.AGIR} component={AgirGated} />
        <Stack.Screen name={ROUTES.PROGRESSO} component={ProgressoGated} />
        <Stack.Screen name={ROUTES.RETROSPECTIVA} component={RetrospectivaGated} />
        <Stack.Screen name={ROUTES.PLANOS} component={PlanosScreen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.MONTHLY_WRAPPED} component={MonthlyWrappedScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}

function TarotStack() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.TAROT_MAIN} component={TarotScreen} />
        <Stack.Screen name={ROUTES.TAROT_ALBUM} component={TarotAlbumScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}

function ProfileStack() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name={ROUTES.PROFILE_MAIN} component={ProfileScreen} />
        <Stack.Screen name={ROUTES.PRIVACY} component={PrivacyScreen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <Stack.Screen name={ROUTES.TOKENS} component={TokensScreen} />
        <Stack.Screen name={ROUTES.LOJA} component={LojaScreen} />
        <Stack.Screen name={ROUTES.HELP_SUPPORT} component={HelpSupportScreen} />
        <Stack.Screen name={ROUTES.TERMS} component={TermsScreen} />
        {/* "Como este app decide" mora no Perfil, não no grid: é transparência
            sobre o método (o que é calculado, o que é lido na tradição, o que
            é leitura do app), não conteúdo de consulta diária. */}
        <Stack.Screen name={ROUTES.COMO_DECIDE} component={ComoDecideScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}

// Retoma a compra interrompida pelo login. O login com Google (e o link de
// confirmação de e-mail do Supabase) tira o navegador da página e traz a
// pessoa de volta na RAIZ do app — logada, mas na Home, longe da oferta que
// ela estava prestes a comprar. Este efeito lê a intenção guardada
// (lib/checkoutIntent.js, com validade de 30 min) e devolve a pessoa pra tela
// de Planos com o MESMO plano selecionado, uma única vez por execução.
function useRetomarCheckout(navRef, navPronta) {
  const { user, loading: authLoading } = useAuth();
  const jaRetomou = useRef(false);

  useEffect(() => {
    if (jaRetomou.current || !navPronta || authLoading || !user) return;
    let vivo = true;
    readCheckoutIntent().then((intent) => {
      if (!vivo || jaRetomou.current || !intent || !navRef.isReady()) return;
      jaRetomou.current = true;
      // Consumida aqui: daqui pra frente quem manda é o params da rota, e uma
      // intenção que sobrasse levaria a pessoa pra esta tela de novo amanhã.
      clearCheckoutIntent();
      navRef.navigate(ROUTES.HOME_TAB, {
        screen: ROUTES.PLANOS,
        params: { plan: intent.plan, resume: true },
      });
    });
    return () => {
      vivo = false;
    };
  }, [navRef, navPronta, user, authLoading]);
}

// Gate: decide o que mostrar antes do Tab.Navigator normal. Precisa ser filho do
// CoupleProvider (usa useCouple()). Fica preso no loader enquanto o contexto ainda
// carrega OU o bootstrap de URL ainda não rodou — assim um acesso com ?voce=&amor=…
// válido nunca chega a piscar a escolha: espera o save()+refresh() e já cai direto
// no Tab.Navigator com o perfil recém-criado.
// Sem coupleData E sem soloSign (nenhum onboarding feito ainda) → tela de escolha
// solo/casal. Qualquer um dos dois sinais presentes já libera o Tab.Navigator
// normal — HomeScreen trata os dois casos.
function Gate() {
  const { coupleData, soloSign, loading } = useCouple();
  // Rótulo das abas: sem tabBarLabel o React Navigation usa o `name` da rota,
  // e o name é o literal de ROUTES ('Início', 'Tarô'...). O rodapé fica na
  // tela o tempo todo, em qualquer idioma — era o texto mais visto do app e
  // o único que nunca traduzia. As chaves de ROUTES seguem em português de
  // propósito: são identificadores de navigate() no app inteiro.
  const { t } = useLanguage();
  const bootstrapped = useUrlBootstrap();
  const navRef = useNavigationContainerRef();
  const [navPronta, setNavPronta] = useState(false);
  useRetomarCheckout(navRef, navPronta);

  if (loading || !bootstrapped) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  if (!coupleData && !soloSign) {
    return (
      <NavigationContainer>
        <Suspense fallback={<LoadingFallback />}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name={ROUTES.ONBOARDING_CHOICE} component={OnboardingChoiceScreen} />
            <Stack.Screen name={ROUTES.QUIZ} component={QuizScreen} />
          </Stack.Navigator>
        </Suspense>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer ref={navRef} linking={linking} onReady={() => setNavPronta(true)}>
      {/* O provider do Som do céu envolve o Tab.Navigator inteiro e o dock é
          IRMÃO dele, não filho de nenhuma tela: é o que garante que o áudio
          continue tocando ao trocar de aba (a tela desmonta, o dock não) e que
          o controle de pausa esteja alcançável de qualquer lugar do app,
          inclusive das telas de leitura, onde o som acompanha o momento.
          A <View> existe pra dar um pai com flex aos dois filhos. */}
      <CosmicSoundProvider>
        <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          tabBarIcon: ({ color, size, focused }) => {
            let icon = 'planet';
            if (route.name === ROUTES.HOME_TAB) icon = focused ? 'planet' : 'planet-outline';
            if (route.name === ROUTES.TAROT_TAB) icon = focused ? 'sparkles' : 'sparkles-outline';
            if (route.name === ROUTES.CHAT_TAB) icon = focused ? 'chatbubbles' : 'chatbubbles-outline';
            if (route.name === ROUTES.PROFILE_TAB) icon = focused ? 'person-circle' : 'person-circle-outline';
            return <Ionicons name={icon} size={24} color={color} />;
          },
        })}
      >
        <Tab.Screen name={ROUTES.HOME_TAB} component={HomeStack} options={{ tabBarLabel: t('tab.home') }} />
        {/* Tarô e Chat são as DUAS leituras alcançáveis sem passar pelo card da
            Home (a barra de abas leva direto). Sem estes dois listeners o funil
            mostraria reading_done > reading_start — degrau impossível, que faz
            o relatório parecer quebrado. Os outros pontos de "pediu leitura"
            saem do grid da Home (ver HomeScreen.js). */}
        <Tab.Screen
          name={ROUTES.TAROT_TAB}
          component={TarotStack}
          options={{ tabBarLabel: t('tab.tarot') }}
          listeners={{ tabPress: () => funnel.readingStart('tarot', 'tab') }}
        />
        <Tab.Screen
          name={ROUTES.CHAT_TAB}
          component={ChatScreen}
          options={{ tabBarLabel: t('tab.chat') }}
          listeners={{ tabPress: () => funnel.readingStart('chat', 'tab') }}
        />
        {/* A aba Perfil SEMPRE abre no Perfil, nunca onde a pessoa parou.
            Comportamento padrão do React Navigation é preservar a pilha de cada
            aba — então quem entrou em Tokens, saiu pra outra aba e voltou no
            Perfil caía em Tokens de novo. Relato real do testador (29/07/2026):
            "a tela de perfil tá direcionando pra tela de tokens... sumiu aquela
            tela do perfil, onde tinha login, baixar aplicativo, sair, deletar
            conta, aquilo desapareceu". Ele não achou o botão de voltar — pra ele
            a tela tinha sumido do app, junto com o login e a saída da conta.

            Só reseta quando a aba NÃO está focada (ou seja, ao entrar nela). Se
            já estiver no Perfil, preventDefault não é chamado e o toque segue o
            padrão da plataforma, sem interromper nada que esteja em andamento. */}
        <Tab.Screen
          name={ROUTES.PROFILE_TAB}
          component={ProfileStack}
          options={{ tabBarLabel: t('tab.profile') }}
          listeners={({ navigation }) => ({
            tabPress: () => {
              const aba = navigation.getState().routes.find((r) => r.name === ROUTES.PROFILE_TAB);
              const profundo = aba?.state?.index > 0;
              if (profundo) navigation.navigate(ROUTES.PROFILE_TAB, { screen: ROUTES.PROFILE_MAIN });
            },
          })}
        />
      </Tab.Navigator>
          {/* Pílula flutuante logo acima da barra de abas. Só aparece onde a
              Web Audio API existe (na web) e some sozinha quando a Home está
              mostrando o card do som — ver components/CosmicSoundPlayer.js. */}
          <CosmicSoundPlayer />
        </View>
      </CosmicSoundProvider>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    initConversionTracking();
    // Primeiro degrau do funil: "abriu o app". Uma vez por execução (o dedupe
    // de lib/funnel.js garante), na raiz — antes de qualquer decisão de Gate,
    // pra contar TODO mundo que entrou, inclusive quem sai na tela de escolha.
    funnel.appOpen();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          {Platform.OS === 'web' && <VercelAnalytics />}
          <AlertHost />
          <LanguageProvider>
            <AuthProvider>
              <CoupleProvider>
                <Gate />
              </CoupleProvider>
            </AuthProvider>
          </LanguageProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
});
