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
    item('horoscope', 'home.card.horoscope.title', 'home.card.horoscope.subtitle', 'planet-outline', ROUTES.HOROSCOPE, { params: { sign } }),
    item('comovoceta', 'home.card.comovoceta.title', 'home.card.comovoceta.subtitle', 'heart-half-outline', ROUTES.COMO_VOCE_TA),
    item('birthchart', 'home.card.birthchart.title', 'home.card.birthchart.subtitle', 'compass-outline', ROUTES.BIRTH_CHART),
    item('tarot', 'home.card.tarot.title', 'home.card.tarot.subtitle', 'sparkles-outline', ROUTES.TAROT_TAB, { tab: true }),
    item('compatibility', 'home.card.compatibility.title', 'home.card.compatibility.subtitle', 'heart-outline', ROUTES.COMPATIBILITY),
    item('dream', 'home.card.dream.title', 'home.card.dream.subtitle', 'moon-outline', ROUTES.DREAM),
    item('palm', 'home.card.palm.title', 'home.card.palm.subtitle', 'hand-left-outline', ROUTES.PALM),
    item('coffee', 'home.card.coffee.title', 'home.card.coffee.subtitle', 'cafe-outline', ROUTES.COFFEE),
    item('profeccoes', 'home.card.profeccoes.title', 'home.card.profeccoes.subtitle', 'refresh-circle-outline', ROUTES.PROFECCOES),
  ];

  const practices = [
    {
      key: 'alignment',
      title: t('home.alignment.title'),
      subtitle: t('home.alignment.body'),
      icon: 'aperture-outline',
      destination: ROUTES.SKY_ALIGNMENT,
    },
    item('grounding', 'home.card.grounding.title', 'home.card.grounding.subtitle', 'leaf-outline', ROUTES.GROUNDING),
    item('rituais', 'home.card.rituais.title', 'home.card.rituais.subtitle', 'flame-outline', ROUTES.RITUAIS),
    item('jornada', 'home.card.jornada.title', 'home.card.jornada.subtitle', 'footsteps-outline', ROUTES.JORNADA),
    item('diary', 'home.card.diary.title', 'home.card.diary.subtitle', 'book-outline', ROUTES.DIARY),
  ];

  const skyAndTime = [
    item('lunarCalendar', 'home.card.lunarCalendar.title', 'home.card.lunarCalendar.subtitle', 'moon-outline', ROUTES.LUNAR_CALENDAR),
    item('calendario', 'home.card.calendario.title', 'home.card.calendario.subtitle', 'calendar-outline', ROUTES.CALENDARIO_COSMICO),
    item('zodiacbody', 'home.card.zodiacbody.title', 'home.card.zodiacbody.subtitle', 'body-outline', ROUTES.ZODIAC_BODY),
    item('retrolua', 'home.card.retrolua.title', 'home.card.retrolua.subtitle', 'stats-chart-outline', ROUTES.RETRO_LUA),
  ];

  const discoveries = [
    item('mitos', 'home.card.mitos.title', 'home.card.mitos.subtitle', 'library-outline', ROUTES.MITOS),
    item('quizcosmico', 'home.card.quizcosmico.title', 'home.card.quizcosmico.subtitle', 'help-circle-outline', ROUTES.QUIZ_COSMICO),
    item('wallpaper', 'home.card.wallpaper.title', 'home.card.wallpaper.subtitle', 'image-outline', ROUTES.WALLPAPER),
    item('idadereal', 'home.card.idadereal.title', 'home.card.idadereal.subtitle', 'hourglass-outline', ROUTES.IDADE_REAL),
    item('social', 'home.card.social.title', 'home.card.social.subtitle', 'people-outline', ROUTES.COMMUNITY_TAB, {
      tab: true,
      params: { screen: ROUTES.COMMUNITY_MAIN },
    }),
  ];

  const coupleItems = [
    ...(isCouple
      ? [item('timeline', 'home.card.timeline.title', 'home.card.timeline.subtitle', 'time-outline', ROUTES.TIMELINE)]
      : []),
    item('reconectar', 'home.card.reconectar.title', 'home.card.reconectar.subtitle', 'heart-circle-outline', ROUTES.RECONECTAR),
    item('descobrir', 'home.card.descobrir.title', 'home.card.descobrir.subtitle', 'telescope-outline', ROUTES.DESCOBRIR),
    item('agir', 'home.card.agir.title', 'home.card.agir.subtitle', 'flash-outline', ROUTES.AGIR),
    item('progresso', 'home.card.progresso.title', 'home.card.progresso.subtitle', 'trophy-outline', ROUTES.PROGRESSO),
    item('retrospectiva', 'home.card.retrospectiva.title', 'home.card.retrospectiva.subtitle', 'gift-outline', ROUTES.RETROSPECTIVA),
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
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 13,
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
  experienceSubtitle: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
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
