import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import HeroSection from '../components/HeroSection';
import CardGrid from '../components/CardGrid';
import NotifPromptCard from '../components/NotifPromptCard';
import DailyMissionsCard from '../components/DailyMissionsCard';
// Som do céu — o card que APRESENTA a feature. O motor e o estado vivem no
// provider em App.js; aqui é só um controle remoto (ver o cabeçalho de
// components/CosmicSoundPlayer.js). Sem este card, a única porta de entrada
// seria a pílula de 40 px acima da barra de abas, que ninguém descobre.
import CosmicSoundPlayer from '../components/CosmicSoundPlayer';
import { compatibility, aspects } from '../lib/signs';
import { CHAVES_DE_TRADUCAO } from '../lib/synastry';
import { getTodaysThought, getThoughtForDate } from '../lib/dailyThought';
import { getTodaysLovePhrase } from '../lib/lovePhrase';
import { personalSkyToday } from '../lib/personalSky';
import { getAnyBirthData } from '../lib/birthData';
import { activeCelestialEvents } from '../lib/celestialSeasons';
import { computeMonthlyWrapped, getWrappedMonth, isWrappedAvailable } from '../lib/monthlyWrapped';
import { getWeekActivity, getStreakInfo, consumePendingMilestoneCelebration, recordActiveDay } from '../lib/streak';
import { recordMissionAction, MISSION_ACTIONS } from '../lib/missions';
import { localDayStr } from '../lib/localDay';
import { getShieldCount } from '../lib/streakShield';
import { getAgirData } from '../lib/coupleData';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';

// Cards do grid que levam a uma LEITURA de verdade (as 9 individuais) — são
// eles que valem como "pediu a 1ª leitura" (reading_start). Os cards de casal
// (timeline/reconectar/descobrir/agir/progresso/retrospectiva) e o feed social
// não são leitura e ficam de fora de propósito: contá-los inflaria o degrau e
// esconderia que ninguém chegou a ler nada.
const READING_CARD_KEYS = new Set([
  'horoscope', 'birthchart', 'tarot', 'compatibility',
  'dream', 'lunarCalendar', 'palm', 'coffee', 'chat',
]);

// Segunda a domingo — mesma ordem que getWeekActivity() já retorna. Viraram
// chaves i18n (inicial do dia muda por idioma: S/T/Q… em PT, L/M/X… em ES,
// M/T/W… em EN) — resolvidas dentro do componente via t().
const WEEK_LABEL_KEYS = [
  'home.week.mon', 'home.week.tue', 'home.week.wed', 'home.week.thu',
  'home.week.fri', 'home.week.sat', 'home.week.sun',
];

// Dia local em YYYY-MM-DD (nunca toISOString/UTC — perto da meia-noite em
// fuso negativo como o do Brasil, o dia UTC já virou e a "leitura de hoje"
// apareceria como lida/não-lida do dia errado). Promovido pra lib/localDay.js,
// que agora é a convenção única de "dia" do app inteiro.

// Último dia (local) em que a pessoa LEU o pensamento do dia — uma chave só,
// sobrescrita a cada leitura, em vez de uma chave por data (não acumula lixo
// no AsyncStorage; só interessa saber se o de HOJE já foi lido).
const THOUGHT_READ_KEY = 'cosmic-daily-thought-last-read';

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coupleData, soloSign, loading, hasAccess, hasCoupleAccess, isOwnerAccount, refresh } = useCouple();
  const { lang, t } = useLanguage();

  // O handoff de URL (?voce=&amor=&sa=&sb=) agora roda uma vez em App.js
  // (useUrlBootstrap), antes do gate decidir entre Quiz e Tab.Navigator — não
  // depende mais de HomeScreen montar, então aqui só resta o refresh normal.
  const load = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Widget "sequência da semana" (lib/streak.js) — só leitura/exibição, quem
  // marca o dia como ativo é recordActiveDay() em outro lugar do app. Recarrega
  // toda vez que a Home ganha foco pra refletir uma atividade que acabou de
  // acontecer em outra tela (ex.: acabou de completar uma leitura e voltou).
  const [weekActivity, setWeekActivity] = useState([]);
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, totalActiveDays: 0 });
  // Escudo(s) da Sequência disponíveis (lib/streakShield.js, comprados na
  // Loja) — só pra mostrar o indicadorzinho ao lado do streak, quem consome
  // de verdade é computeCurrentStreak() (lib/streak.js).
  const [shieldCount, setShieldCount] = useState(0);
  // Marco de sequência (7/30/100 dias) batido em QUALQUER tela de leitura —
  // fica pendente em AsyncStorage (lib/streak.js) até a Home, que é onde
  // sempre se volta depois de uma leitura, consumir e celebrar uma vez só.
  const [milestone, setMilestone] = useState(null);
  // Pensamento do dia recolhido por padrão — 2 linhas + "ler completo".
  const [thoughtExpanded, setThoughtExpanded] = useState(false);
  // "Leitura do dia" (pedido do dono, 26/07/2026): o pensamento é UMA leitura
  // diária de verdade, pra pessoa abrir todo dia — tipo devocional. Este flag
  // diz se o de HOJE já foi lido (expandido); recarrega no foco porque à
  // meia-noite o dia vira e o card volta a mostrar "leia o de hoje".
  const [thoughtReadToday, setThoughtReadToday] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      AsyncStorage.getItem(THOUGHT_READ_KEY)
        .then((v) => {
          if (active) setThoughtReadToday(v === localDayStr());
        })
        .catch(() => {});
      return () => {
        active = false;
      };
    }, [])
  );

  const loadStreak = useCallback(async () => {
    const [week, info, pendingMilestone, shields] = await Promise.all([
      getWeekActivity(),
      getStreakInfo(),
      consumePendingMilestoneCelebration(),
      getShieldCount(),
    ]);
    setWeekActivity(week);
    setStreakInfo(info);
    if (pendingMilestone) setMilestone(pendingMilestone);
    setShieldCount(shields);
  }, []);

  useFocusEffect(useCallback(() => { loadStreak(); }, [loadStreak]));

  // Marca a leitura do dia como lida (uma vez por dia) quando a pessoa expande
  // o card. Ler a leitura do dia É atividade real no app, então conta como dia
  // ativo na sequência — a MESMA recordActiveDay() que as telas de leitura já
  // usam (via readingCompletion.js), nenhum streak novo inventado. Chamada
  // direta (sem journal/tokens de leitura): expandir um texto não é gerar uma
  // leitura de Tarô/Palma, só não pode deixar o dia em branco na sequência.
  const markThoughtReadToday = useCallback(async () => {
    if (thoughtReadToday) return;
    setThoughtReadToday(true);
    try {
      await AsyncStorage.setItem(THOUGHT_READ_KEY, localDayStr());
    } catch {}
    await recordActiveDay();
    // Reflete na hora o dot de hoje + contagem no widget da semana (e, se um
    // marco 7/30/100 acabou de bater, loadStreak consome e celebra já).
    loadStreak();
  }, [thoughtReadToday, loadStreak]);

  // "Meta da semana" já existe dentro de Agir (texto livre + marcar cumprida)
  // mas ficava escondida lá — só ler/mostrar aqui, a interação real (definir/
  // marcar cumprida) continua só em Agir, pra não duplicar a mesma lógica em
  // dois lugares. Só carrega pra casal com acesso (Agir é feature de assinante).
  const [agirGoal, setAgirGoal] = useState(null);
  const loadAgirGoal = useCallback(async () => {
    if (!coupleData?.voce || !coupleData?.amor) return;
    const data = await getAgirData(coupleData.voce, coupleData.amor);
    setAgirGoal({ goalSaved: data.goalSaved || '', goalDone: !!data.goalDone });
  }, [coupleData]);
  useFocusEffect(useCallback(() => { loadAgirGoal(); }, [loadAgirGoal]));

  // Retrospectiva Cósmica mensal — só na janela dos dias 1-7, e só se o mês
  // anterior teve uso real (computeMonthlyWrapped devolve null se não teve).
  const [wrappedReady, setWrappedReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!isWrappedAvailable()) {
        setWrappedReady(false);
        return;
      }
      let active = true;
      const { year, month } = getWrappedMonth();
      computeMonthlyWrapped(year, month).then((w) => {
        if (active) setWrappedReady(!!w);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  // Céu de hoje pra você (lib/personalSky.js) — trânsitos reais sobre o mapa
  // natal da pessoa. `undefined` = ainda carregando; `null` = sem data de
  // nascimento salva (mostra convite pro Mapa Astral); array = aspectos.
  // Recarrega no foco: a pessoa pode ter acabado de preencher o nascimento
  // no Mapa Astral e voltado pra cá.
  const [personalSky, setPersonalSky] = useState(undefined);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAnyBirthData().then((birth) => {
        if (!active) return;
        setPersonalSky(birth ? personalSkyToday(birth) : null);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  // Iniciais da semana no idioma atual (mesma ordem seg→dom do getWeekActivity).
  const WEEK_LABELS = WEEK_LABEL_KEYS.map((k) => t(k));

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Data de hoje em YYYY-MM-DD (mesmo formato que DatePickerModal já monta a
  // partir de campos locais e que aspects()/planetPositions() esperam) — ver
  // lib/localDay.js pro porquê de ser dia LOCAL, nunca toISOString/UTC.
  const todayISO = localDayStr(today);

  // Evento cósmico real (lib/signs.js aspects()) — hora omitida de propósito
  // (aspects/planetPositions já usam meio-dia como aproximação aceitável pra
  // planetas além da Lua). Memoizado por todayISO: a trigonometria só roda de
  // novo quando o dia muda, não a cada re-render da tela (loading, foco, etc.).
  const todaysAspects = useMemo(() => aspects(todayISO, null), [todayISO]);
  const cosmicEvent = useMemo(() => {
    if (!todaysAspects || todaysAspects.length === 0) return null;
    // Aspecto mais exato (menor orbe) entre os retornados de verdade — não fabricado.
    return todaysAspects.reduce((best, a) => (a.orb < best.orb ? a : best), todaysAspects[0]);
  }, [todaysAspects]);

  // Três estados possíveis nesta tela (o Gate em App.js garante que ao menos um
  // dos dois sinais existe): casal com quiz feito, solo com signo escolhido, ou
  // (teoricamente) nenhum dos dois — fallback igual ao anterior.
  const isCouple = !!coupleData;

  // 4º degrau: "chegou na Home de verdade, já com perfil". Espera `loading`
  // sair — enquanto o CoupleContext carrega, esta tela é só um spinner, e
  // contar isso como Home vista mentiria sobre onde a pessoa parou. No mount
  // (efeito), nunca no corpo do componente: a Home re-renderiza muito (foco,
  // streak, céu pessoal, missões) e um track() solto aqui viraria dezenas de
  // linhas iguais.
  useEffect(() => {
    if (loading) return;
    funnel.homeView(isCouple ? 'couple' : 'solo');
  }, [loading, isCouple]);

  // Signo usado no badge do topo e na navegação do grid (Horóscopo) — usa o signo real
  // do casal quando existir, senão o signo solo, com o mesmo fallback de antes.
  const sign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || soloSign || zodiacSigns[0];

  // Sinastria por aspecto (lib/signs.js → lib/synastry.js) — null enquanto não
  // houver os dois signos salvos. O cartão mostrava "{pct}% de compatibilidade";
  // mostra o ASPECTO e a CATEGORIA, que é o que o app calcula de verdade.
  // A porcentagem saiu do app inteiro — ver o cabeçalho de lib/synastry.js.
  const compat = coupleData?.sa && coupleData?.sb ? compatibility(coupleData.sa, coupleData.sb) : null;

  const greeting = isCouple
    ? t('home.greetingCouple', { voce: coupleData.voce, amor: coupleData.amor })
    : t('home.greetingSolo', { sign: sign.pt });

  // Timeline exige memórias reais do casal — não faz sentido pra quem ainda
  // não tem par, fica escondida por completo pra usuário solo. As outras 5
  // aparecem pra solo também, mas como convite: mostram o cadeado e, ao tocar,
  // o withFeatureGate (App.js) exibe "isso é pra fazer em casal" convidando a
  // pessoa a chamar o par — induz a trazer o parceiro pro app pra reconectar,
  // jogar junto, etc., em vez de esconder a existência da feature.
  const COUPLE_ONLY = ['timeline'];

  // Exclusivas de assinantes (mesmas 5 rotas bloqueadas por withFeatureGate em
  // App.js) — timeline fica de fora, é livre pra qualquer casal. Mostra o badge
  // de cadeado no grid (FeatureCard.js já tinha o prop `locked` pronto, só não
  // era usado ainda); o bloqueio real acontece na tela em si, via feature gate.
  // Solo também vê o cadeado aqui (ainda não tem par pra desbloquear).
  const LOCKED_KEYS = ['reconectar', 'descobrir', 'agir', 'progresso', 'retrospectiva'];

  const ALL_ITEMS = [
    { key: 'horoscope', title: t('home.card.horoscope.title'), subtitle: t('home.card.horoscope.subtitle'), icon: 'planet', gradient: ['#7B3FB5', '#A66CFF'], onPress: () => navigation.navigate(ROUTES.HOROSCOPE, { sign }) },
    { key: 'birthchart', title: t('home.card.birthchart.title'), subtitle: t('home.card.birthchart.subtitle'), icon: 'compass', gradient: ['#5CA8FF', '#6C7BFF'], onPress: () => navigation.navigate(ROUTES.BIRTH_CHART) },
    { key: 'tarot', title: t('home.card.tarot.title'), subtitle: t('home.card.tarot.subtitle'), icon: 'sparkles', gradient: ['#FF6BA0', '#B57BFF'], onPress: () => navigation.getParent()?.navigate(ROUTES.TAROT_TAB) },
    { key: 'compatibility', title: t('home.card.compatibility.title'), subtitle: t('home.card.compatibility.subtitle'), icon: 'heart', gradient: ['#FF8C5C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.COMPATIBILITY) },
    { key: 'timeline', title: t('home.card.timeline.title'), subtitle: t('home.card.timeline.subtitle'), icon: 'time', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.TIMELINE) },
    { key: 'reconectar', title: t('home.card.reconectar.title'), subtitle: t('home.card.reconectar.subtitle'), icon: 'heart-circle', gradient: ['#FF7BD5', '#FF6BA0'], onPress: () => navigation.navigate(ROUTES.RECONECTAR) },
    { key: 'descobrir', title: t('home.card.descobrir.title'), subtitle: t('home.card.descobrir.subtitle'), icon: 'telescope', gradient: ['#6C7BFF', '#B57BFF'], onPress: () => navigation.navigate(ROUTES.DESCOBRIR) },
    { key: 'agir', title: t('home.card.agir.title'), subtitle: t('home.card.agir.subtitle'), icon: 'flash', gradient: ['#FFC85C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.AGIR) },
    { key: 'progresso', title: t('home.card.progresso.title'), subtitle: t('home.card.progresso.subtitle'), icon: 'trophy', gradient: ['#5FD98C', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.PROGRESSO) },
    { key: 'retrospectiva', title: t('home.card.retrospectiva.title'), subtitle: t('home.card.retrospectiva.subtitle'), icon: 'gift', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.RETROSPECTIVA) },
    { key: 'dream', title: t('home.card.dream.title'), subtitle: t('home.card.dream.subtitle'), icon: 'moon', gradient: ['#5CE0D8', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.DREAM) },
    { key: 'lunarCalendar', title: t('home.card.lunarCalendar.title'), subtitle: t('home.card.lunarCalendar.subtitle'), icon: 'planet', gradient: ['#5CA8FF', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.LUNAR_CALENDAR) },
    // Homem Zodiacal: tela de HISTÓRIA (o que a astrologia médica medieval
    // dizia), não uma leitura sobre a pessoa — por isso fica fora de
    // READING_CARD_KEYS lá em cima. Entra ao lado do Calendário Lunar porque é
    // a outra tela que muda sozinha com a Lua.
    { key: 'zodiacbody', title: t('home.card.zodiacbody.title'), subtitle: t('home.card.zodiacbody.subtitle'), icon: 'body', gradient: ['#B57BFF', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.ZODIAC_BODY) },
    // Assentar: o ritual de respiração e presença. Também fica fora de
    // READING_CARD_KEYS — não é leitura sobre a pessoa, é uma prática. A porta
    // principal dele é o convite no fim de cada leitura
    // (components/GroundingInvite.js); este card é a porta pra quem quiser
    // voltar sozinho, sem precisar tirar uma carta antes.
    { key: 'grounding', title: t('home.card.grounding.title'), subtitle: t('home.card.grounding.subtitle'), icon: 'leaf', gradient: ['#5CE0D8', '#5FD98C'], onPress: () => navigation.navigate(ROUTES.GROUNDING) },
    { key: 'palm', title: t('home.card.palm.title'), subtitle: t('home.card.palm.subtitle'), icon: 'hand-left', gradient: ['#FFB84D', '#FF8C5C'], onPress: () => navigation.navigate(ROUTES.PALM) },
    { key: 'coffee', title: t('home.card.coffee.title'), subtitle: t('home.card.coffee.subtitle'), icon: 'cafe', gradient: ['#B57BFF', '#7B3FB5'], onPress: () => navigation.navigate(ROUTES.COFFEE) },
    { key: 'chat', title: t('home.card.chat.title'), subtitle: t('home.card.chat.subtitle'), icon: 'chatbubbles', gradient: ['#6C7BFF', '#5CE0D8'], onPress: () => navigation.getParent()?.navigate(ROUTES.CHAT_TAB) },
    { key: 'social', title: t('home.card.social.title'), subtitle: t('home.card.social.subtitle'), icon: 'people', gradient: ['#5CE0D8', '#7B3FB5'], onPress: () => navigation.navigate(ROUTES.SOCIAL) },
  ];
  // Diário Cósmico saiu do grid — vira uma faixa inteira fixa no topo (ver
  // abaixo, logo depois do HeroSection), sempre visível em vez de ser só
  // mais um card entre os outros.

  // Feed social é só pra quem usa o app sozinho (sem parceiro pareado) —
  // conteúdo de casal nunca aparece lá, então o card nem existe pra casal.
  const SOLO_ONLY = ['social'];

  const cardItems = ALL_ITEMS.filter((c) => (isCouple || !COUPLE_ONLY.includes(c.key)) && (!isCouple || !SOLO_ONLY.includes(c.key)))
    .map((c) =>
      !isOwnerAccount && (!isCouple || !hasCoupleAccess) && LOCKED_KEYS.includes(c.key) ? { ...c, locked: true } : c
    )
    // 5º degrau: "pediu a 1ª leitura". Marcado no TOQUE do card, que é a
    // intenção real — e não na montagem da tela de leitura, que também
    // acontece quando a pessoa só passa por ali. O evento é enfileirado antes
    // de navegar (fire-and-forget: track() é síncrona e não devolve promise,
    // então a navegação não espera nada).
    .map((c) =>
      READING_CARD_KEYS.has(c.key)
        ? {
            ...c,
            onPress: () => {
              funnel.readingStart(c.key, 'home_card');
              c.onPress();
            },
          }
        : c
    );

  // Separação visual pedida pelo Lenda (25/07/2026): desde que solo também
  // assina (as 9 leituras individuais), fica confuso misturar no mesmo grid
  // features que solo pode assinar direto com as 5 que exigem formar casal —
  // duas seções com título/subtítulo próprios em vez de um grid só.
  const COUPLE_SECTION_KEYS = [...COUPLE_ONLY, ...LOCKED_KEYS];
  const individualCardItems = cardItems.filter((c) => !COUPLE_SECTION_KEYS.includes(c.key));
  const coupleCardItems = cardItems.filter((c) => COUPLE_SECTION_KEYS.includes(c.key));

  // Determinístico por data (lib/dailyThought.js) — mesmo texto pra todo
  // mundo que abrir o app hoje, muda sozinho à meia-noite. Mesmo conteúdo
  // que a notificação diária (Perfil > Pensamento cósmico diário) só avisa
  // que chegou — o texto de verdade sempre vive aqui dentro. Passa o `sign`
  // já calculado acima (real, casal ou solo — nunca inventado aqui) pra
  // personalizar o endereçamento da frase.
  const todaysThought = getTodaysThought(sign);

  // Temporadas do Céu (lib/celestialSeasons.js) — eventos celestes REAIS
  // ativos (retrógrado, lua cheia/nova chegando, temporada zodiacal).
  // Memoizado por dia: trigonometria só roda de novo quando o dia muda.
  const celestialEvents = useMemo(() => activeCelestialEvents().slice(0, 2), [todayISO]);

  // Espiada de Amanhã — o MESMO motor determinístico calcula o pensamento de
  // amanhã hoje (fase da Lua, regente, aspectos de amanhã são matemática,
  // não segredo). Assinante espia; quem não assina vê o começo borrado + CTA
  // — dá um motivo concreto pra assinar E pra voltar amanhã (loop de
  // reabertura diária, padrão Co-Star, custo zero de IA).
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowsThought = getThoughtForDate(tomorrow, sign);

  // Frase do dia de amor (lib/lovePhrase.js) — feita pra compartilhar de
  // verdade com o par (WhatsApp etc.), não só ler dentro do app: dá um motivo
  // concreto pra abrir todo dia E pra expor o app pra quem ainda não usa
  // (pedido explícito do Lenda, 25/07/2026 — retenção via compartilhamento).
  const todaysLovePhrase = getTodaysLovePhrase(lang);
  const handleShareLovePhrase = async () => {
    try {
      // O link vai junto de propósito: é ele que faz o WhatsApp/Telegram
      // mostrarem a prévia rica (OG tags em public/index.html) e traz quem
      // recebeu a frase pra dentro do app.
      const result = await Share.share({ message: `${todaysLovePhrase}\n\n💜 https://cosmicguide.cloud` });
      // Missão 'compartilhar-frase' (lib/missions.js): marca a ação SÓ quando
      // o share não foi descartado (iOS reporta dismissedAction; Android e web
      // só resolvem em sucesso; cancelar na web rejeita e cai no catch). O
      // crédito continua exclusivo de completeMission, que re-verifica.
      if (!result || result.action !== Share.dismissedAction) {
        recordMissionAction(MISSION_ACTIONS.FRASE_COMPARTILHADA);
      }
    } catch {
      // usuário cancelou ou o compartilhamento falhou — sem tela de erro, mesmo padrão de RetrospectivaScreen.js
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {milestone && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setMilestone(null)}>
          <View style={styles.milestoneBackdrop}>
            <LinearGradient colors={gradients.gold} style={styles.milestoneCard}>
              <Text style={styles.milestoneEmoji}>{milestone.days >= 100 ? '👑' : milestone.days >= 30 ? '🌟' : '🔥'}</Text>
              <Text style={styles.milestoneTitle}>{t('home.milestone.title', { days: milestone.days })}</Text>
              <Text style={styles.milestoneSubtitle}>{t('home.milestone.bonus', { tokens: milestone.tokens })}</Text>
              {/* Motor de Oferta (pico emocional): quem sustenta 7+ dias de
                  sequência sem assinar já provou que o app virou hábito — o
                  momento certo de oferecer, uma linha só, sem insistência
                  (o modal de marco já aparece uma única vez por natureza). */}
              {!hasAccess && !isOwnerAccount && (
                <TouchableOpacity
                  style={styles.milestoneOfferBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setMilestone(null);
                    navigation.navigate(ROUTES.PLANOS);
                  }}
                >
                  <Text style={styles.milestoneOfferText}>{t('home.milestone.offer')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.milestoneBtn} activeOpacity={0.85} onPress={() => setMilestone(null)}>
                <Text style={styles.milestoneBtnText}>{t('home.milestone.continue')}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* A pill de sequência do hero usa o MESMO streakInfo do card de
            sequência logo abaixo (lib/streak.js) — antes vinha de
            coupleData.streak, uma contagem que NENHUM arquivo do app gravava:
            a pill dizia "Comecem hoje a sequência de vocês" enquanto o card na
            mesma dobra dizia "4 dias seguidos". Continua exclusiva de casal
            (undefined para solo esconde a pill, como sempre foi). */}
        <HeroSection
          greeting={greeting}
          dateStr={dateStr}
          sign={sign}
          streak={coupleData ? { count: streakInfo.currentStreak } : undefined}
          insetTop={insets.top}
        />

        {/* Diário Cósmico — faixa inteira sempre visível no topo (pedido
            explícito: não ficar escondido junto dos outros cards do grid). */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(ROUTES.DIARY)} style={styles.diaryBar}>
          <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.diaryBarInner}>
            <View style={styles.diaryBarIcon}>
              <Ionicons name="book" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.diaryBarTitle}>{t('home.card.diary.title')}</Text>
              <Text style={styles.diaryBarSubtitle}>{t('home.card.diary.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Sequência da semana (lib/streak.js) — leva pros Relatórios (calendário
            de sequência completo) ao tocar. */}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.streakCard}
          onPress={() => navigation.navigate(ROUTES.REPORTS)}
        >
          <View style={styles.streakCardHead}>
            <View style={styles.streakCardTitleRow}>
              <Text style={styles.streakCardTitle}>
                {streakInfo.currentStreak > 0
                  ? t(streakInfo.currentStreak === 1 ? 'home.streak.count_one' : 'home.streak.count_other', { count: streakInfo.currentStreak })
                  : t('home.streak.empty')}
              </Text>
              {shieldCount > 0 && (
                <View style={styles.shieldBadge}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.teal} />
                  <Text style={styles.shieldBadgeText}>{shieldCount}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.weekRow}>
            {(weekActivity.length ? weekActivity : WEEK_LABELS.map((_, i) => ({ date: String(i), active: false, isToday: false }))).map((day, i) => (
              <View key={day.date} style={styles.weekDayWrap}>
                <Text style={styles.weekDayLabel}>{WEEK_LABELS[i]}</Text>
                <View style={[styles.weekDot, day.active && styles.weekDotActive, day.isToday && styles.weekDotToday]} />
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* Opt-in de notificação no momento certo: só depois da 1ª atividade
            real, uma vez só (ver components/NotifPromptCard.js). */}
        <NotifPromptCard sign={sign} hasActivity={streakInfo.totalActiveDays > 0} />

        {/* Meta da semana (já existe dentro de Agir, só ganhou visibilidade
            aqui) — só pra casal com acesso à feature. */}
        {isCouple && (isOwnerAccount || hasCoupleAccess) && agirGoal && (
          <TouchableOpacity activeOpacity={0.9} style={styles.goalCard} onPress={() => navigation.navigate(ROUTES.AGIR)}>
            <View style={styles.goalIcon}>
              <Ionicons name={agirGoal.goalDone ? 'checkmark-circle' : 'flag'} size={20} color={agirGoal.goalDone ? colors.green : colors.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalLabel}>{t('home.goal.label')}</Text>
              {agirGoal.goalSaved ? (
                <Text style={styles.goalText} numberOfLines={2}>
                  {agirGoal.goalDone ? t('home.goal.done') : ''}{agirGoal.goalSaved}
                </Text>
              ) : (
                <Text style={styles.goalTextEmpty}>{t('home.goal.empty')}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Pensamento cósmico do dia — a LEITURA DO DIA (pedido do dono,
            26/07/2026): um insight por dia pra pessoa abrir todo dia, tipo
            devocional. Recolhido por padrão (2 linhas + "ler completo");
            expandir marca como lida hoje (AsyncStorage) e conta o dia ativo
            na sequência — ver markThoughtReadToday acima. */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.thoughtCard, !thoughtReadToday && styles.thoughtCardUnread]}
          onPress={() => {
            if (!thoughtExpanded) markThoughtReadToday();
            setThoughtExpanded(!thoughtExpanded);
          }}
        >
          <View style={styles.thoughtIcon}>
            <Ionicons name="sparkles" size={18} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.thoughtHead}>
              <Text style={styles.thoughtLabel}>{t('home.thought.label')}</Text>
              <Text style={thoughtReadToday ? styles.thoughtReadBadge : styles.thoughtUnreadBadge}>
                {thoughtReadToday ? t('home.thought.readToday') : t('home.thought.unread')}
              </Text>
            </View>
            <Text style={styles.thoughtDate}>{dateStr}</Text>
            <Text style={styles.thoughtText} numberOfLines={thoughtExpanded ? undefined : 2}>
              {todaysThought}
            </Text>
            <Text style={styles.thoughtToggle}>
              {thoughtExpanded ? t('home.thought.collapse') : t('home.thought.expand')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Missões de hoje (motor lib/missions.js) — na Home SÓ pra quem está
            solo: casal vê o MESMO card dentro de Agir (a tela de "fazer"),
            mas solo nunca chega lá (SoloTeaser na borda da rota, App.js) e
            ficaria sem o loop missão→token→Loja pedido pelo dono. */}
        {!isCouple && (
          <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
            <DailyMissionsCard />
          </View>
        )}

        {/* Som do céu — logo DEPOIS do Pensamento do dia e das Missões, de
            propósito: o uso que o card sugere é "deixa tocando enquanto você
            lê", e a leitura do dia acabou de acontecer dois blocos acima.
            Devolve null sozinho onde a Web Audio API não existe. */}
        <CosmicSoundPlayer variant="inline" style={{ marginHorizontal: 16, marginBottom: 14 }} />

        {/* Retrospectiva Cósmica do mês anterior — rito de virada de mês,
            só nos dias 1-7 e só quando houve uso real (ver lib/monthlyWrapped). */}
        {wrappedReady && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.wrappedBar}
            onPress={() => navigation.navigate(ROUTES.MONTHLY_WRAPPED)}
          >
            <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.wrappedBarInner}>
              <Text style={styles.wrappedBarEmoji}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wrappedBarTitle}>{t('home.wrapped.title')}</Text>
                <Text style={styles.wrappedBarSubtitle}>{t('home.wrapped.subtitle')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2A1D00" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Temporadas do Céu — o que está acontecendo AGORA no céu real
            (retrógrado, lua chegando, temporada do signo). Mostra os 2 mais
            quentes; datas vêm do cálculo astronômico, nunca de contador falso. */}
        {celestialEvents.length > 0 && (
          <View style={styles.seasonCard}>
            {celestialEvents.map((ev, i) => (
              <View key={ev.title} style={[styles.seasonRow, i > 0 && styles.seasonRowBorder]}>
                <Text style={styles.seasonEmoji}>{ev.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.seasonTitle}>{ev.title}</Text>
                  <Text style={styles.seasonDetail}>{ev.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Espiada de Amanhã — assinante espia o pensamento de amanhã hoje;
            quem não assina vê o começo + cadeado (motivo pra assinar E pra
            voltar amanhã). isOwnerAccount espia também (revisão do dono). */}
        <View style={styles.peekCard}>
          <View style={styles.peekHead}>
            <Ionicons name="eye" size={16} color={colors.purple} />
            <Text style={styles.peekLabel}>{t('home.peek.label')}</Text>
          </View>
          {hasAccess || isOwnerAccount ? (
            <Text style={styles.peekText}>{tomorrowsThought}</Text>
          ) : (
            <>
              <Text style={styles.peekText} numberOfLines={2}>
                {tomorrowsThought.slice(0, 70)}…
              </Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.peekBtn}
                onPress={() => navigation.navigate(ROUTES.PLANOS)}
              >
                <Ionicons name="lock-closed" size={13} color={colors.purple} />
                <Text style={styles.peekBtnText}>{t('home.peek.cta')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Céu de hoje pra você — trânsitos reais sobre o mapa natal (ver
            lib/personalSky.js). Sem nascimento salvo, vira convite pro Mapa
            Astral; o aspecto mais forte é grátis, o resto pede assinatura. */}
        {personalSky === null && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.skyCard}
            onPress={() => navigation.navigate(ROUTES.BIRTH_CHART)}
          >
            <View style={styles.peekHead}>
              <Ionicons name="telescope" size={16} color={colors.teal} />
              <Text style={[styles.peekLabel, { color: colors.teal }]}>{t('home.sky.label')}</Text>
            </View>
            <Text style={styles.peekText}>{t('home.sky.inviteText')}</Text>
            <Text style={styles.skyInviteLink}>{t('home.sky.inviteCta')}</Text>
          </TouchableOpacity>
        )}
        {Array.isArray(personalSky) && personalSky.length > 0 && (
          <View style={styles.skyCard}>
            <View style={styles.peekHead}>
              <Ionicons name="telescope" size={16} color={colors.teal} />
              <Text style={[styles.peekLabel, { color: colors.teal }]}>{t('home.sky.label')}</Text>
            </View>
            {(hasAccess || isOwnerAccount ? personalSky : personalSky.slice(0, 1)).map((a, i) => (
              <Text key={i} style={[styles.peekText, i > 0 && { marginTop: 8 }]}>
                {a.text}
              </Text>
            ))}
            {!hasAccess && !isOwnerAccount && personalSky.length > 1 && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.peekBtn}
                onPress={() => navigation.navigate(ROUTES.PLANOS)}
              >
                <Ionicons name="lock-closed" size={13} color={colors.teal} />
                <Text style={[styles.peekBtnText, { color: colors.teal }]}>
                  {t('home.sky.moreAspects', { count: personalSky.length - 1 })}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Frase do dia de amor — feita pra compartilhar de verdade com o
            par, não só ler (ver handleShareLovePhrase acima). */}
        <View style={styles.lovePhraseCard}>
          <LinearGradient colors={['#FF6BA0', '#B57BFF']} style={styles.lovePhraseInner}>
            <View style={styles.lovePhraseHead}>
              <Ionicons name="heart" size={18} color="#fff" />
              <Text style={styles.lovePhraseLabel}>{t('home.lovePhrase.label')}</Text>
            </View>
            <Text style={styles.lovePhraseText}>{todaysLovePhrase}</Text>
            <TouchableOpacity activeOpacity={0.85} style={styles.lovePhraseBtn} onPress={handleShareLovePhrase}>
              <Ionicons name="share-social" size={16} color={colors.accent} />
              <Text style={styles.lovePhraseBtnText}>{t('home.lovePhrase.share')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Compatibilidade do casal (sinastria real, lib/signs.js) */}
        {compat ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.horoCard}
            onPress={() => navigation.navigate(ROUTES.COMPATIBILITY)}
          >
            <LinearGradient colors={gradients.card} style={styles.horoInner}>
              <View style={styles.horoHead}>
                <View style={[styles.signChip, { backgroundColor: sign.color + '33' }]}>
                  <Text style={[styles.signChipGlyph, { color: sign.color }]}>{compat.emojiA}{compat.emojiB}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.horoSign}>{coupleData.sa} + {coupleData.sb}</Text>
                  <Text style={styles.horoDates}>
                    {t('home.compatAspect', {
                      aspecto: t(CHAVES_DE_TRADUCAO.aspecto[compat.familia]),
                      categoria: t(CHAVES_DE_TRADUCAO.categoria[compat.categoriaId]),
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              {/* `resumo`, não `texto`: a leitura inteira agora tem quatro
                  frases (elemento, qualidades, modalidade, o que a fonte diz) e
                  não cabe num cartão de Home. O resumo é uma linha e diz a
                  mesma coisa sem prometer nada a mais. */}
              <Text style={styles.horoText}>{compat.resumo}</Text>
              <Text style={styles.horoLink}>{t('home.compatSeeMore')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.horoCard}
            onPress={() => navigation.navigate(ROUTES.QUIZ)}
          >
            <LinearGradient colors={gradients.card} style={styles.horoInner}>
              <View style={styles.horoHead}>
                <View style={[styles.signChip, { backgroundColor: colors.accent + '33' }]}>
                  <Ionicons name="heart-outline" size={22} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.horoSign}>{t('home.compatTitleEmpty')}</Text>
                  <Text style={styles.horoDates}>{t('home.compatSubtitleEmpty')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.horoText}>{t('home.compatTextEmpty')}</Text>
              <Text style={styles.horoLink}>{t('home.compatLinkEmpty')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Feature grid — individual (solo ou casal, assina direto) */}
        <Text style={styles.sectionTitle}>{t('home.sectionExplore')}</Text>
        <Text style={styles.sectionSubtitle}>{t('home.sectionExploreSubtitle')}</Text>
        <CardGrid items={individualCardItems} />

        {/* Feature grid — exclusivo de casal (só desbloqueia formando casal) */}
        {coupleCardItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.sectionCouple')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.sectionCoupleSubtitle')}</Text>
            <CardGrid items={coupleCardItems} />
          </>
        )}

        {/* Cosmic event */}
        <Text style={styles.sectionTitle}>{t('home.sectionCosmicEvent')}</Text>
        <View style={styles.eventCard}>
          <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.eventInner}>
            <View style={styles.eventIcon}>
              <Ionicons name="star" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {cosmicEvent
                  ? t('home.cosmicEventTitle', { planetA: cosmicEvent.planetA, aspect: cosmicEvent.aspectType.toLowerCase(), planetB: cosmicEvent.planetB })
                  : t('home.cosmicEventTitleEmpty')}
              </Text>
              <Text style={styles.eventDesc}>
                {cosmicEvent
                  ? t('home.cosmicEventDesc', { orb: cosmicEvent.orb.toFixed(1) })
                  : t('home.cosmicEventDescEmpty')}
              </Text>
              <Text style={styles.eventDate}>{t('home.cosmicEventDate', { date: dateStr })}</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  diaryBar: { marginHorizontal: 16, marginTop: -14, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  diaryBarInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  diaryBarIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  diaryBarTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  diaryBarSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  streakCard: {
    marginHorizontal: 16, marginTop: -14, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  streakCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  streakCardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  shieldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.teal + '22', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  shieldBadgeText: { color: colors.teal, fontSize: 12, fontWeight: '800' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  weekDayWrap: { alignItems: 'center', gap: 6 },
  weekDayLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  weekDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.border,
  },
  weekDotActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  weekDotToday: { borderWidth: 2, borderColor: colors.gold },
  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  goalIcon: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,184,77,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  goalLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  goalText: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 3 },
  goalTextEmpty: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  thoughtCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: 16, marginTop: 0, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  thoughtIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,200,92,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  // Borda dourada sutil só enquanto a leitura de hoje NÃO foi lida — chama o
  // olho pro hábito diário sem gritar; depois de lida volta à borda padrão.
  thoughtCardUnread: { borderColor: colors.gold + '66' },
  thoughtHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  // flexShrink: 1 é obrigatório aqui: Text em row no RN não encolhe por
  // padrão (flexShrink 0) e o label uppercase (~27 chars em ES) + badge não
  // cabem lado a lado em telas de 320pt — sem isso o badge sai da tela.
  thoughtLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 1 },
  thoughtUnreadBadge: { color: colors.gold, fontSize: 11, fontWeight: '800' },
  thoughtReadBadge: { color: colors.teal, fontSize: 11, fontWeight: '800' },
  thoughtDate: { color: colors.textMuted, fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  thoughtText: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
  thoughtToggle: { color: colors.gold, fontSize: 12, fontWeight: '800', marginTop: 6 },
  lovePhraseCard: { marginHorizontal: 16, marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  lovePhraseInner: { padding: 18 },
  lovePhraseHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  lovePhraseLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  lovePhraseText: { color: '#fff', fontSize: 15, lineHeight: 22, fontWeight: '600' },
  lovePhraseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, marginTop: 14, alignSelf: 'flex-start', paddingHorizontal: 18,
  },
  lovePhraseBtnText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  peekCard: {
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.purple + '55',
  },
  skyCard: {
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.teal + '55',
  },
  peekHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  peekLabel: { color: colors.purple, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  peekText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  peekBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  peekBtnText: { color: colors.purple, fontSize: 13, fontWeight: '800' },
  skyInviteLink: { color: colors.teal, fontSize: 13, fontWeight: '800', marginTop: 10 },
  wrappedBar: { marginHorizontal: 16, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  wrappedBarInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  wrappedBarEmoji: { fontSize: 24 },
  wrappedBarTitle: { color: '#2A1D00', fontSize: 14, fontWeight: '800' },
  wrappedBarSubtitle: { color: 'rgba(42,29,0,0.75)', fontSize: 12, marginTop: 1 },
  seasonCard: {
    marginHorizontal: 16, marginBottom: 14, paddingHorizontal: 16, paddingVertical: 6,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
  },
  seasonRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  seasonRowBorder: { borderTopWidth: 1, borderTopColor: colors.border },
  seasonEmoji: { fontSize: 22, marginTop: 1 },
  seasonTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  seasonDetail: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  horoCard: { marginHorizontal: 16, marginTop: 0, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  horoInner: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  horoHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  signChip: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  signChipGlyph: { fontSize: 18 },
  horoSign: { color: colors.text, fontSize: 17, fontWeight: '800' },
  horoDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  horoText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  horoLink: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12, marginHorizontal: 16 },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: -8, marginBottom: 12, marginHorizontal: 16 },
  eventCard: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  eventInner: { flexDirection: 'row', padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, alignItems: 'flex-start' },
  eventIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,200,92,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  eventDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
  eventDate: { color: colors.gold, fontSize: 12, fontWeight: '700', marginTop: 8 },

  milestoneBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  milestoneCard: { width: '100%', maxWidth: 340, borderRadius: 24, padding: 32, alignItems: 'center' },
  milestoneEmoji: { fontSize: 56 },
  milestoneTitle: { color: '#2A1D00', fontSize: 22, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  milestoneSubtitle: { color: '#4A3300', fontSize: 15, fontWeight: '700', marginTop: 6 },
  milestoneOfferBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, marginTop: 20 },
  milestoneOfferText: { color: '#7A5A14', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  milestoneBtn: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28, marginTop: 22 },
  milestoneBtnText: { color: '#2A1D00', fontSize: 15, fontWeight: '800' },
});
