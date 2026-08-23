import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const ORBI = require('../assets/mascote/orbi-neutral.png');

// O movimento de marca do Cosmic Guide: entrada curta, sem loop e sem salto.
// Em reduzir movimento sobra apenas um fade de 140ms. O conteúdo nunca depende
// da animação — Órbi orienta, mas não vira uma segunda interface competindo.
export default function OrbiGuide({ size = 112, style, testID = 'orbi-guide' }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reducedMotion, setReducedMotion] = useState(false);

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
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? 140 : Platform.OS === 'web' ? 430 : 360,
      easing: (value) => 1 - Math.pow(1 - value, 3),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [progress, reducedMotion]);

  return (
    <View style={[styles.stage, { width: size, height: size }, style]} testID={testID} accessible={false}>
      <View style={[styles.halo, { width: size * 0.72, height: size * 0.72, borderRadius: size }]} />
      <Animated.View
        style={{
          width: size,
          height: size,
          opacity: progress,
          transform: reducedMotion
            ? []
            : [
                { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
                { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] }) },
              ],
        }}
      >
        <Image source={ORBI} style={styles.image} resizeMode="contain" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    backgroundColor: colors.gold + '12',
    borderWidth: 1,
    borderColor: colors.gold + '24',
  },
  image: { width: '100%', height: '100%' },
});
