import React, { forwardRef, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cosmicCardStars } from '../lib/cosmicShareCardContent';

const displayFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia, serif',
  default: 'serif',
});

const PremiumCosmicCard = forwardRef(function PremiumCosmicCard(
  { content, style, testID = 'premium-cosmic-card' },
  ref
) {
  const stars = useMemo(() => cosmicCardStars(content), [content]);

  if (!content) return null;

  return (
    <View
      ref={ref}
      accessible
      accessibilityLabel={`${content.eyebrow}. ${content.title}`}
      collapsable={false}
      style={[styles.card, style]}
      testID={testID}
    >
      <LinearGradient
        colors={['#0B0712', '#211025', '#100914']}
        locations={[0, 0.52, 1]}
        start={{ x: 0.08, y: 0 }}
        end={{ x: 0.92, y: 1 }}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />

      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={styles.atmosphere}>
        {stars.map((star) => (
          <View
            key={star.id}
            style={[
              styles.star,
              {
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
        <View style={styles.orbitWide} />
        <View style={styles.orbitTall} />
        <View style={styles.meridian} />
      </View>

      <View pointerEvents="none" style={styles.frame} />

      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.brand}>{content.brand}</Text>
        <View style={styles.headerRule} />
        <Text numberOfLines={1} style={styles.edition}>{content.edition}</Text>
      </View>

      <View style={styles.center}>
        <Text numberOfLines={1} style={styles.eyebrow}>{content.eyebrow}</Text>
        <View style={styles.sealOuter}>
          <View style={styles.sealOffset} />
          <View style={styles.sealInner}>
            <Text adjustsFontSizeToFit numberOfLines={1} style={styles.glyph}>{content.glyph}</Text>
          </View>
        </View>
        <Text adjustsFontSizeToFit minimumFontScale={0.68} numberOfLines={4} style={styles.title}>
          {content.title}
        </Text>
        {content.subtitle ? (
          <Text adjustsFontSizeToFit minimumFontScale={0.75} numberOfLines={5} style={styles.subtitle}>
            {content.subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.bottom}>
        {content.detail ? (
          <Text adjustsFontSizeToFit minimumFontScale={0.76} numberOfLines={3} style={styles.detail}>
            {content.detail}
          </Text>
        ) : null}
        {content.meta ? <Text numberOfLines={2} style={styles.meta}>{content.meta}</Text> : null}
        <View style={styles.footerRule} />
        <Text numberOfLines={1} style={styles.footer}>{content.footer}</Text>
      </View>
    </View>
  );
});

PremiumCosmicCard.displayName = 'PremiumCosmicCard';

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 9 / 16,
    overflow: 'hidden',
    borderRadius: 30,
    borderCurve: 'continuous',
    backgroundColor: '#0B0712',
  },
  atmosphere: { ...StyleSheet.absoluteFillObject },
  star: { position: 'absolute', backgroundColor: '#F6E7BE' },
  orbitWide: {
    position: 'absolute',
    width: '122%',
    aspectRatio: 1,
    left: '-11%',
    top: '19%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.19)',
    transform: [{ scaleY: 0.42 }, { rotate: '-11deg' }],
  },
  orbitTall: {
    position: 'absolute',
    width: '82%',
    aspectRatio: 1,
    left: '9%',
    top: '23%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.13)',
    transform: [{ scaleX: 0.54 }, { rotate: '19deg' }],
  },
  meridian: {
    position: 'absolute',
    width: 1,
    height: '45%',
    left: '50%',
    top: '21%',
    backgroundColor: 'rgba(227,184,95,0.12)',
    transform: [{ rotate: '19deg' }],
  },
  frame: {
    ...StyleSheet.absoluteFillObject,
    margin: '5%',
    borderWidth: 1,
    borderRadius: 22,
    borderCurve: 'continuous',
    borderColor: 'rgba(227,184,95,0.46)',
  },
  header: {
    position: 'absolute',
    top: '7.7%',
    left: '9%',
    right: '9%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brand: { color: '#F4E8CC', fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 1.5 },
  headerRule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(227,184,95,0.4)' },
  edition: { color: '#B9A2BC', fontSize: 6, lineHeight: 9, fontWeight: '800', letterSpacing: 1.1 },
  center: {
    position: 'absolute',
    top: '16%',
    left: '10%',
    right: '10%',
    bottom: '29%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 11,
  },
  eyebrow: { color: '#E3B85F', fontSize: 8, lineHeight: 11, fontWeight: '900', letterSpacing: 2 },
  sealOuter: {
    width: '34%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.68)',
    backgroundColor: 'rgba(11,7,18,0.48)',
  },
  sealOffset: {
    position: 'absolute',
    width: '84%',
    aspectRatio: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.3)',
    transform: [{ translateX: 8 }],
  },
  sealInner: {
    width: '62%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#170C1B',
    borderWidth: 1,
    borderColor: 'rgba(244,232,204,0.2)',
  },
  glyph: { color: '#F4E8CC', fontFamily: displayFont, fontSize: 30, lineHeight: 36, textAlign: 'center' },
  title: {
    color: '#F4E8CC',
    fontFamily: displayFont,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: { color: '#C6B3C7', fontSize: 10, lineHeight: 15, textAlign: 'center', maxWidth: '92%' },
  bottom: {
    position: 'absolute',
    left: '9%',
    right: '9%',
    bottom: '8%',
    minHeight: '18%',
    justifyContent: 'flex-end',
    gap: 7,
  },
  detail: { color: '#F4E8CC', fontFamily: displayFont, fontSize: 12, lineHeight: 16, textAlign: 'center' },
  meta: { color: '#B9A2BC', fontSize: 7, lineHeight: 10, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center', textTransform: 'uppercase' },
  footerRule: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(227,184,95,0.38)', marginTop: 4 },
  footer: { color: '#E3B85F', fontSize: 6, lineHeight: 9, fontWeight: '900', letterSpacing: 1.1, textAlign: 'center' },
});

export default PremiumCosmicCard;
