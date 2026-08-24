import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Platform, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

// `require` estático por asset é obrigatório no Metro. Um require montado com
// string em runtime não entra no bundle nativo e `require()` tardio tampouco
// reduz bundle; o mapa deixa as cinco poses verificáveis na build.
const ORBI_ASSETS = Object.freeze({
  neutral: require('../assets/mascote/orbi-neutral.png'),
  curious: require('../assets/mascote/orbi-curious.png'),
  thinking: require('../assets/mascote/orbi-thinking.png'),
  pointing: require('../assets/mascote/orbi-pointing.png'),
  celebrating: require('../assets/mascote/orbi-celebrating.png'),
});

// O movimento de marca do Cosmic Guide: entrada curta, sem loop e sem salto.
// Em reduzir movimento sobra apenas um fade de 140ms. O conteúdo nunca depende
// da animação — Órbi orienta, mas não vira uma segunda interface competindo.
export default function OrbiGuide({ size = 112, pose = 'neutral', style, testID = 'orbi-guide' }) {
  const progress = useRef(new Animated.Value(0)).current;
  // `null` significa que a preferência ainda não foi resolvida. Não iniciamos
  // deslocamento nesse intervalo: quem pediu menos movimento nunca deve ver o
  // primeiro frame espacial só porque a consulta ao sistema é assíncrona.
  const [reducedMotion, setReducedMotion] = useState(null);
  const resolvedPose = ORBI_ASSETS[pose] ? pose : 'neutral';

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => mounted && setReducedMotion(!!enabled))
      .catch(() => mounted && setReducedMotion(false));
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => setReducedMotion(!!enabled)
    );
    return () => {
      mounted = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion === null) return undefined;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: reducedMotion ? 140 : Platform.OS === 'web' ? 430 : 360,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: Platform.OS !== 'web',
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reducedMotion, resolvedPose]);

  const poseTransform = reducedMotion !== false
    ? []
    : [
        {
          translateY: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [resolvedPose === 'celebrating' ? 12 : 7, 0],
          }),
        },
        {
          translateX: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [resolvedPose === 'pointing' ? -7 : resolvedPose === 'curious' ? 4 : 0, 0],
          }),
        },
        {
          scale: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [resolvedPose === 'celebrating' ? 0.94 : 0.98, 1],
          }),
        },
        {
          rotate: progress.interpolate({
            inputRange: [0, 1],
            outputRange: [resolvedPose === 'thinking' ? '-2deg' : '0deg', '0deg'],
          }),
        },
      ];

  return (
    <View style={[styles.stage, { width: size, height: size }, style]} testID={testID} accessible={false}>
      <View style={[styles.halo, { width: size * 0.72, height: size * 0.72, borderRadius: size }]} />
      <Animated.View
        style={{
          width: size,
          height: size,
          opacity: progress,
          transform: poseTransform,
        }}
      >
        <Image source={ORBI_ASSETS[resolvedPose]} style={styles.image} resizeMode="contain" />
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
