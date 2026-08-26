import React from 'react';
import { Platform, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import CosmicScene from '../components/CosmicScene';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import { ROUTES } from '../routes';
import { colors, zodiacSigns } from '../theme';

const READING_KEYS = new Set([
  'horoscope',
  'birthchart',
  'tarot',
  'compatibility',
  'dream',
  'lunarCalendar',
  'palm',
  'coffee',
]);

const COUPLE_LOCKED_KEYS = new Set([
  'reconectar',
  'timeline',
  'descobrir',
  'agir',
  'progresso',
  'retrospectiva',
]);

function ExperienceRow({ item, onPress, t }) {
  const accessibilityLabel = item.locked
    ? t('featureCard.lockedA11y', { title: item.title })
    : `${item.title}. ${item.subtitle}`;

  return (
    <Pressable
      testID={`card-${item.key}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.experienceRow, pressed && styles.pressed]}
    >
      <View style={styles.constellationPoint} accessible={false}>
        <Ionicons name={item.icon} size={19} color={colors.gold} />
      </View>
      <View style={styles.experienceCopy}>
        <View style={styles.experienceTitleRow}>
          <Text style={styles.experienceTitle}>{item.title}</Text>
          {item.locked ? (
            <View style={styles.lockLabel}>
              <Ionicons name="lock-closed" size={10} color={colors.gold} />
              <Text style={styles.lockLabelText}>{t('explore.locked')}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.experienceSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={17} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ExploreScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coupleData, soloSign, hasCoupleAccess, isOwnerAccount } = useCouple();
  const { t } = useLanguage();
  const isCouple = Boolean(coupleData);
  const sign = (coupleData?.sa && zodiacSigns.find((candidate) => candidate.name === coupleData.sa))
    || soloSign
    || zodiacSigns[0];

  const openTab = (tab, params) => {
    navigation.getParent()?.navigate(tab, params);
  };

  const item = (key, titleKey, subtitleKey, icon, destination, options = {}) => ({
    key,
    title: t(titleKey),
    subtitle: t(subtitleKey),
    icon,
    destination,
    ...options,
  });

  const readings = [
    item('horoscope', 'home.card.horoscope.title', 'explore.item.horoscope.description', 'planet-outline', ROUTES.HOROSCOPE, { params: { sign } }),
    item('comovoceta', 'home.card.comovoceta.title', 'explore.item.comovoceta.description', 'heart-half-outline', ROUTES.COMO_VOCE_TA),
    item('birthchart', 'home.card.birthchart.title', 'explore.item.birthchart.description', 'compass-outline', ROUTES.BIRTH_CHART),
    item('tarot', 'home.card.tarot.title', 'explore.item.tarot.description', 'sparkles-outline', ROUTES.TAROT_TAB, { tab: true }),
    item('compatibility', 'home.card.compatibility.title', 'explore.item.compatibility.description', 'heart-outline', ROUTES.COMPATIBILITY),
    item('dream', 'home.card.dream.title', 'explore.item.dream.description', 'moon-outline', ROUTES.DREAM),
    item('palm', 'explore.item.palm.title', 'explore.item.palm.description', 'hand-left-outline', ROUTES.PALM),
    item('coffee', 'home.card.coffee.title', 'explore.item.coffee.description', 'cafe-outline', ROUTES.COFFEE),
    item('profeccoes', 'home.card.profeccoes.title', 'explore.item.profeccoes.description', 'refresh-circle-outline', ROUTES.PROFECCOES),
  ];

  const practices = [
    {
      key: 'alignment',
      title: t('home.alignment.title'),
      subtitle: t('explore.item.alignment.description'),
      icon: 'aperture-outline',
      destination: ROUTES.SKY_ALIGNMENT,
    },
    item('grounding', 'home.card.grounding.title', 'explore.item.grounding.description', 'leaf-outline', ROUTES.GROUNDING),
    item('rituais', 'home.card.rituais.title', 'explore.item.rituais.description', 'flame-outline', ROUTES.RITUAIS),
    item('jornada', 'home.card.jornada.title', 'explore.item.jornada.description', 'footsteps-outline', ROUTES.JORNADA),
    item('diary', 'home.card.diary.title', 'explore.item.diary.description', 'book-outline', ROUTES.DIARY),
  ];

  const skyAndTime = [
    item('lunarCalendar', 'home.card.lunarCalendar.title', 'explore.item.lunarCalendar.description', 'moon-outline', ROUTES.LUNAR_CALENDAR),
    item('calendario', 'home.card.calendario.title', 'explore.item.calendario.description', 'calendar-outline', ROUTES.CALENDARIO_COSMICO),
    item('zodiacbody', 'home.card.zodiacbody.title', 'explore.item.zodiacbody.description', 'body-outline', ROUTES.ZODIAC_BODY),
    item('retrolua', 'home.card.retrolua.title', 'explore.item.retrolua.description', 'stats-chart-outline', ROUTES.RETRO_LUA),
  ];

  const discoveries = [
    item('mitos', 'home.card.mitos.title', 'explore.item.mitos.description', 'library-outline', ROUTES.MITOS),
    item('quizcosmico', 'home.card.quizcosmico.title', 'explore.item.quizcosmico.description', 'help-circle-outline', ROUTES.QUIZ_COSMICO),
    item('wallpaper', 'home.card.wallpaper.title', 'explore.item.wallpaper.description', 'image-outline', ROUTES.WALLPAPER),
    item('idadereal', 'home.card.idadereal.title', 'explore.item.idadereal.description', 'hourglass-outline', ROUTES.IDADE_REAL),
    item('social', 'home.card.social.title', 'explore.item.social.description', 'people-outline', ROUTES.COMMUNITY_TAB, {
      tab: true,
      params: { screen: ROUTES.COMMUNITY_MAIN },
    }),
  ];

  const coupleItems = [
    ...(isCouple
      ? [item('timeline', 'home.card.timeline.title', 'explore.item.timeline.description', 'time-outline', ROUTES.TIMELINE)]
      : []),
    item('reconectar', 'home.card.reconectar.title', 'explore.item.reconectar.description', 'heart-circle-outline', ROUTES.RECONECTAR),
    item('descobrir', 'home.card.descobrir.title', 'explore.item.descobrir.description', 'telescope-outline', ROUTES.DESCOBRIR),
    item('agir', 'home.card.agir.title', 'explore.item.agir.description', 'flash-outline', ROUTES.AGIR),
    item('progresso', 'home.card.progresso.title', 'explore.item.progresso.description', 'trophy-outline', ROUTES.PROGRESSO),
    item('retrospectiva', 'home.card.retrospectiva.title', 'explore.item.retrospectiva.description', 'gift-outline', ROUTES.RETROSPECTIVA),
  ].map((experience) => ({
    ...experience,
    locked: !isOwnerAccount
      && (!isCouple || !hasCoupleAccess)
      && COUPLE_LOCKED_KEYS.has(experience.key),
  }));

  const sections = [
    {
      key: 'readings',
      eyebrow: t('explore.section.readings.eyebrow'),
      title: t('explore.section.readings.title'),
      subtitle: t('explore.section.readings.subtitle'),
      data: readings,
    },
    {
      key: 'practices',
      eyebrow: t('explore.section.practices.eyebrow'),
      title: t('explore.section.practices.title'),
      subtitle: t('explore.section.practices.subtitle'),
      data: practices,
    },
    {
      key: 'sky',
      eyebrow: t('explore.section.sky.eyebrow'),
      title: t('explore.section.sky.title'),
      subtitle: t('explore.section.sky.subtitle'),
      data: skyAndTime,
    },
    {
      key: 'discoveries',
      eyebrow: t('explore.section.discoveries.eyebrow'),
      title: t('explore.section.discoveries.title'),
      subtitle: t('explore.section.discoveries.subtitle'),
      data: discoveries,
    },
    {
      key: 'couple',
      eyebrow: t('explore.section.couple.eyebrow'),
      title: t('explore.section.couple.title'),
      subtitle: t('explore.section.couple.subtitle'),
      data: coupleItems,
    },
  ];

  const handleOpen = (experience) => {
    if (READING_KEYS.has(experience.key)) {
      funnel.readingStart(experience.key, 'explore');
    }
    if (experience.tab) {
      openTab(experience.destination, experience.params);
      return;
    }
    navigation.navigate(experience.destination, experience.params);
  };

  const goHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME_MAIN }] });
  };

  return (
    <View style={styles.root}>
      <CosmicScene />
      <SectionList
        testID="explore-list"
        sections={sections}
        keyExtractor={(experience) => experience.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 112 },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        stickySectionHeadersEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={(
          <>
            <View style={styles.topBar}>
              <Pressable
                testID="explore-back"
                onPress={goHome}
                accessibilityRole="button"
                accessibilityLabel={t('explore.back')}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.topBarLabel}>{t('explore.topLabel')}</Text>
              <View style={styles.topBarBalance} />
            </View>

            <View style={styles.intro}>
              <Text style={styles.introEyebrow}>{t('explore.eyebrow')}</Text>
              <Text style={styles.introTitle}>{t('explore.title')}</Text>
              <Text style={styles.introBody}>{t('explore.body')}</Text>
            </View>
          </>
        )}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEyebrow}>{section.eyebrow}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </View>
        )}
        renderItem={({ item: experience }) => (
          <View style={styles.sectionRail}>
            <ExperienceRow item={experience} onPress={() => handleOpen(experience)} t={t} />
          </View>
        )}
        renderSectionFooter={() => <View style={styles.sectionFooter} />}
      />
    </View>
  );
}

const displayFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia',
  default: 'serif',
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { width: '100%', maxWidth: 680, alignSelf: 'center', paddingHorizontal: 20 },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topBarLabel: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  topBarBalance: { width: 44, height: 44 },
  intro: { paddingTop: 28, paddingBottom: 34, maxWidth: 520 },
  introEyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  introTitle: {
    color: colors.text,
    fontFamily: displayFont,
    fontSize: 35,
    lineHeight: 41,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginTop: 10,
    maxWidth: 430,
  },
  introBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 13, maxWidth: 450 },
  sectionHeader: { paddingLeft: 4, marginBottom: 14, maxWidth: 500 },
  sectionEyebrow: {
    color: colors.gold,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.25,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: displayFont,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginTop: 5,
  },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  sectionRail: {
    borderLeftWidth: 1,
    borderLeftColor: colors.gold + '45',
    marginLeft: 18,
    paddingLeft: 16,
  },
  sectionFooter: { height: 28 },
  experienceRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingLeft: 0,
    paddingRight: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  constellationPoint: {
    width: 42,
    height: 42,
    marginLeft: -38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#211921',
    borderWidth: 1,
    borderColor: colors.gold + '70',
  },
  experienceCopy: { flex: 1, minWidth: 0 },
  experienceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  experienceTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  experienceSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 5, maxWidth: 520 },
  lockLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: colors.gold + '15',
  },
  lockLabelText: { color: colors.gold, fontSize: 9, fontWeight: '800', letterSpacing: 0.35 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
