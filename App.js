import 'react-native-gesture-handler';
import React, { useEffect, useState, Suspense, lazy } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';

import { colors } from './theme';
import { ROUTES } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AlertHost } from './components/AlertHost';
import { CoupleProvider, useCouple } from './context/CoupleContext';
import { AuthProvider } from './context/AuthContext';
import { initConversionTracking } from './lib/conversionTracking';
import { acceptInvite } from './lib/coupleInvite';
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
import { LanguageProvider } from './context/LanguageContext';
import HomeScreen from './screens/HomeScreen';
import TarotScreen from './screens/TarotScreen';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';
import { withFeatureGate } from './components/FeatureGate';

// Telas raramente visitadas (config/legal, ou exclusivas de assinante e já
// gated por withFeatureGate) — não precisam entrar no parse inicial do bundle
// web (~29 telas eram importadas eagerly antes disso, achado real de
// auditoria de performance, 19/07/2026). Cada Stack.Navigator que renderiza
// alguma destas precisa de um <Suspense> ancestral (ver LoadingFallback).
const PrivacyScreen = lazy(() => import('./screens/PrivacyScreen'));
const OnboardingChoiceScreen = lazy(() => import('./screens/OnboardingChoiceScreen'));
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
const CoffeeScreen = lazy(() => import('./screens/CoffeeScreen'));
const QuizScreen = lazy(() => import('./screens/QuizScreen'));
const DiaryScreen = lazy(() => import('./screens/DiaryScreen'));
const SocialScreen = lazy(() => import('./screens/SocialScreen'));
const PlanosScreen = lazy(() => import('./screens/PlanosScreen'));
const LoginScreen = lazy(() => import('./screens/LoginScreen'));

function LoadingFallback() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator color={colors.accent} size="large" />
    </View>
  );
}

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const linking = {
  prefixes: ['https://cosmicguide.cloud/cosmic-guide', 'https://oddpro.pro/cosmic-guide'],
  config: {
    screens: {
      [ROUTES.HOME_TAB]: {
        screens: {
          [ROUTES.HOME_MAIN]: '',
          [ROUTES.QUIZ]: 'quiz',
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
    if (voce && amor && sa && sb) {
      save({ voce, amor, sa: SIGN_ES_TO_PT[sa] || sa, sb: SIGN_ES_TO_PT[sb] || sb }).then(() => {
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
        <Stack.Screen
          name={ROUTES.TIMELINE}
          component={withFeatureGate(TimelineScreen, {
            title: 'Linha do Tempo é pra fazer em casal',
            description: 'Guardem memórias e cápsulas do tempo juntos — chame seu par pra começarem a linha do tempo de vocês.',
          })}
        />
        <Stack.Screen
          name={ROUTES.RECONECTAR}
          component={withFeatureGate(ReconectarScreen, {
            title: 'Reconectar é pra fazer em casal',
            description: 'Rotas guiadas de reconexão pro casal — chame seu par pra percorrerem juntos.',
          })}
        />
        <Stack.Screen
          name={ROUTES.DESCOBRIR}
          component={withFeatureGate(DescobrirScreen, {
            title: 'Descobrir é pra fazer em casal',
            description: 'Jogos e quizzes pra se conhecerem melhor — chame seu par pra jogarem juntos.',
          })}
        />
        <Stack.Screen
          name={ROUTES.AGIR}
          component={withFeatureGate(AgirScreen, {
            title: 'Agir é pra fazer em casal',
            description: 'Ideias de encontro e metas da semana pro casal — chame seu par pra colocarem em prática.',
          })}
        />
        <Stack.Screen
          name={ROUTES.PROGRESSO}
          component={withFeatureGate(ProgressoScreen, {
            title: 'Progresso é pra fazer em casal',
            description: 'Acompanhem juntos a evolução da relação de vocês — chame seu par pra começarem.',
          })}
        />
        <Stack.Screen
          name={ROUTES.RETROSPECTIVA}
          component={withFeatureGate(RetrospectivaScreen, {
            title: 'Retrospectiva é pra fazer em casal',
            description: 'Revivam os melhores momentos de vocês juntos — chame seu par pra desbloquearem isso.',
          })}
        />
        <Stack.Screen name={ROUTES.PLANOS} component={PlanosScreen} />
        <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
      </Stack.Navigator>
    </Suspense>
  );
}

function TarotStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.TAROT_MAIN} component={TarotScreen} />
    </Stack.Navigator>
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
      </Stack.Navigator>
    </Suspense>
  );
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
  const bootstrapped = useUrlBootstrap();

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
    <NavigationContainer linking={linking}>
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
        <Tab.Screen name={ROUTES.HOME_TAB} component={HomeStack} />
        <Tab.Screen name={ROUTES.TAROT_TAB} component={TarotStack} />
        <Tab.Screen name={ROUTES.CHAT_TAB} component={ChatScreen} />
        <Tab.Screen name={ROUTES.PROFILE_TAB} component={ProfileStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    initConversionTracking();
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
