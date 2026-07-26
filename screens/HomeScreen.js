import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import HeroSection from '../components/HeroSection';
import CardGrid from '../components/CardGrid';
import NotifPromptCard from '../components/NotifPromptCard';
import { compatibility, compatPercent, aspects } from '../lib/signs';
import { getTodaysThought, getThoughtForDate } from '../lib/dailyThought';
import { getTodaysLovePhrase } from '../lib/lovePhrase';
import { personalSkyToday } from '../lib/personalSky';
import { getAnyBirthData } from '../lib/birthData';
import { getWeekActivity, getStreakInfo, consumePendingMilestoneCelebration } from '../lib/streak';
import { getShieldCount } from '../lib/streakShield';
import { getAgirData } from '../lib/coupleData';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

// Segunda a domingo — mesma ordem que getWeekActivity() já retorna.
const WEEK_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

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

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'es' ? 'es-ES' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Data de hoje em YYYY-MM-DD (mesmo formato que DatePickerModal já monta a
  // partir de campos locais — `${year}-${pad2(month)}-${pad2(day)}` — e que
  // aspects()/planetPositions() esperam). Usa getFullYear/getMonth/getDate
  // locais, não toISOString/UTC, pra não pular de dia perto da meia-noite em
  // fusos negativos como o do Brasil.
  const todayISO = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

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

  // Signo usado no badge do topo e na navegação do grid (Horóscopo) — usa o signo real
  // do casal quando existir, senão o signo solo, com o mesmo fallback de antes.
  const sign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || soloSign || zodiacSigns[0];

  // Sinastria real do casal (lib/signs.js) — null enquanto não houver os dois signos salvos.
  const compat = coupleData?.sa && coupleData?.sb ? compatibility(coupleData.sa, coupleData.sb) : null;
  const pct = coupleData?.sa && coupleData?.sb ? compatPercent(coupleData.sa, coupleData.sb) : null;

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

  const cardItems = ALL_ITEMS.filter((c) => (isCouple || !COUPLE_ONLY.includes(c.key)) && (!isCouple || !SOLO_ONLY.includes(c.key))).map((c) =>
    !isOwnerAccount && (!isCouple || !hasCoupleAccess) && LOCKED_KEYS.includes(c.key) ? { ...c, locked: true } : c
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
      await Share.share({ message: `${todaysLovePhrase}\n\n💜 https://cosmicguide.cloud` });
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
              <Text style={styles.milestoneTitle}>{milestone.days} dias seguidos!</Text>
              <Text style={styles.milestoneSubtitle}>+{milestone.tokens} tokens de bônus</Text>
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
                  <Text style={styles.milestoneOfferText}>Comemorar com 7 dias grátis de assinatura →</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.milestoneBtn} activeOpacity={0.85} onPress={() => setMilestone(null)}>
                <Text style={styles.milestoneBtnText}>Continuar</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <HeroSection greeting={greeting} dateStr={dateStr} sign={sign} streak={coupleData?.streak} insetTop={insets.top} />

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
                  ? `🔥 ${streakInfo.currentStreak} ${streakInfo.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}`
                  : 'Comece sua sequência hoje'}
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
              <Text style={styles.goalLabel}>Meta da semana</Text>
              {agirGoal.goalSaved ? (
                <Text style={styles.goalText} numberOfLines={2}>
                  {agirGoal.goalDone ? 'Cumprida: ' : ''}{agirGoal.goalSaved}
                </Text>
              ) : (
                <Text style={styles.goalTextEmpty}>Vocês ainda não definiram uma meta pra essa semana</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Pensamento cósmico do dia — mesmo formato de app de versículo
            diário, mas com o mesmo tom simbólico/honesto do resto do app. */}
        <View style={styles.thoughtCard}>
          <View style={styles.thoughtIcon}>
            <Ionicons name="sparkles" size={18} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.thoughtLabel}>Pensamento cósmico do dia</Text>
            <Text style={styles.thoughtText}>{todaysThought}</Text>
          </View>
        </View>

        {/* Espiada de Amanhã — assinante espia o pensamento de amanhã hoje;
            quem não assina vê o começo + cadeado (motivo pra assinar E pra
            voltar amanhã). isOwnerAccount espia também (revisão do dono). */}
        <View style={styles.peekCard}>
          <View style={styles.peekHead}>
            <Ionicons name="eye" size={16} color={colors.purple} />
            <Text style={styles.peekLabel}>Espiada de amanhã</Text>
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
                <Text style={styles.peekBtnText}>Assine pra espiar amanhã hoje →</Text>
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
              <Text style={[styles.peekLabel, { color: colors.teal }]}>Céu de hoje pra você</Text>
            </View>
            <Text style={styles.peekText}>
              Informe sua data de nascimento no Mapa Astral e veja, todo dia, como o céu de hoje toca o SEU mapa — não o de todo mundo.
            </Text>
            <Text style={styles.skyInviteLink}>Preencher meu Mapa Astral →</Text>
          </TouchableOpacity>
        )}
        {Array.isArray(personalSky) && personalSky.length > 0 && (
          <View style={styles.skyCard}>
            <View style={styles.peekHead}>
              <Ionicons name="telescope" size={16} color={colors.teal} />
              <Text style={[styles.peekLabel, { color: colors.teal }]}>Céu de hoje pra você</Text>
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
                  +{personalSky.length - 1} aspecto(s) no seu céu hoje — assine pra ver →
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
                  <Text style={styles.horoDates}>{t('home.compatPercent', { pct })}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <Text style={styles.horoText}>{compat.texto}</Text>
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
  thoughtLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  thoughtText: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
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
