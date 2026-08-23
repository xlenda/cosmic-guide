import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import OrbiGuide from './OrbiGuide';

// A primeira impressão do produto tem uma única assinatura: a lente do Órbi
// entra em foco e apresenta a promessa verificável do onboarding. Não há voz
// automática aqui enquanto o app não tiver um serviço de voz neural real.
export default function OrbiIntro({ onStart, onSkip, onShortcut }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const [reducedMotion, setReducedMotion] = useState(false);
  const visual = useRef(new Animated.Value(0)).current;
  const copy = useRef(new Animated.Value(0)).current;
  const proof = useRef(new Animated.Value(0)).current;
  const actions = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => mounted && setReducedMotion(!!enabled))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setReducedMotion);
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    const values = [visual, copy, proof, actions];
    values.forEach((value) => value.setValue(0));
    const duration = reducedMotion ? 140 : 430;
    const timing = (value) => Animated.timing(value, {
      toValue: 1,
      duration,
      easing: (progress) => 1 - Math.pow(1 - progress, 3),
      useNativeDriver: Platform.OS !== 'web',
    });
    const animation = reducedMotion
      ? Animated.parallel(values.map(timing))
      : Animated.stagger(150, values.map(timing));
    animation.start();
    return () => animation.stop();
  }, [actions, copy, proof, reducedMotion, visual]);

  function enterStyle(value, distance = 10) {
    return {
      opacity: value,
      transform: reducedMotion
        ? []
        : [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }],
    };
  }

  function start() {
    Haptics.selectionAsync();
    onStart?.();
  }

  function shortcut() {
    Haptics.selectionAsync();
    onShortcut?.();
  }

  return (
    <View style={styles.root} testID="onboarding-intro">
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topRow}>
          <Text style={styles.brand}>COSMIC GUIDE</Text>
          <Pressable
            testID="onboarding-intro-skip"
            style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
            onPress={onSkip}
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>{t('onboarding.intro.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <Animated.View style={[styles.visual, enterStyle(visual, 6)]}>
            <View style={styles.lensGlow} />
            <Animated.View
              style={[
                styles.focusLine,
                {
                  opacity: visual,
                  transform: reducedMotion
                    ? []
                    : [{ scaleX: visual.interpolate({ inputRange: [0, 1], outputRange: [0.18, 1] }) }],
                },
              ]}
            />
            <OrbiGuide size={136} testID="orbi-guide" />
          </Animated.View>

          <Animated.View style={[styles.copy, enterStyle(copy)]}>
            <Text style={styles.focus}>{t('onboarding.intro.focus')}</Text>
            <Text style={styles.name}>{t('onboarding.intro.name')}</Text>
            <Text style={styles.promise}>{t('onboarding.intro.promise')}</Text>
          </Animated.View>

          <Animated.View style={[styles.proof, enterStyle(proof, 8)]}>
            <View style={styles.steps} accessible={false}>
              <View style={styles.stepActive} />
              <View style={styles.step} />
              <View style={styles.step} />
            </View>
            <Text style={styles.control}>{t('onboarding.intro.control')}</Text>
          </Animated.View>

          <Animated.View style={[styles.actions, enterStyle(actions, 8)]}>
            <Pressable
              testID="onboarding-intro-primary"
              style={({ pressed }) => [styles.primary, pressed && styles.primaryPressed]}
              onPress={start}
              accessibilityRole="button"
            >
              <Text style={styles.primaryText}>{t('onboarding.intro.primary')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#21151A" />
            </Pressable>
            <Pressable
              testID="onboarding-intro-shortcut"
              style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
              onPress={shortcut}
              accessibilityRole="button"
            >
              <Text style={styles.shortcutText}>{t('onboarding.intro.shortcut')}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  topRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 2.2 },
  skip: { minHeight: 44, justifyContent: 'center', paddingLeft: 16 },
  skipText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', paddingTop: 8, paddingBottom: 12 },
  visual: { alignItems: 'center', justifyContent: 'center', minHeight: 154 },
  lensGlow: {
    position: 'absolute',
    width: 154,
    height: 154,
    borderRadius: 77,
    backgroundColor: colors.gold + '0B',
    borderWidth: 1,
    borderColor: colors.gold + '1F',
  },
  focusLine: { position: 'absolute', width: 214, height: 1, backgroundColor: colors.gold + '72' },
  copy: { alignItems: 'center', marginTop: 12 },
  focus: {
    maxWidth: 330,
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  name: {
    color: colors.gold,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    marginTop: 14,
    textAlign: 'center',
  },
  promise: {
    maxWidth: 320,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 5,
    textAlign: 'center',
  },
  proof: { alignItems: 'center', marginTop: 18 },
  steps: { flexDirection: 'row', gap: 6 },
  stepActive: { width: 24, height: 3, borderRadius: 2, backgroundColor: colors.gold },
  step: { width: 24, height: 3, borderRadius: 2, backgroundColor: colors.border },
  control: {
    maxWidth: 310,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
  actions: { marginTop: 22 },
  primary: {
    minHeight: 52,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: 20,
  },
  primaryPressed: { transform: [{ scale: 0.985 }], opacity: 0.92 },
  primaryText: { color: '#21151A', fontSize: 16, fontWeight: '800' },
  shortcut: { minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  shortcutText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.65 },
});
