import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// `title`/`subtitle` já chegam traduzidos de quem monta o grid (ver ALL_ITEMS
// em HomeScreen.js). O único texto escrito aqui dentro é o rótulo de
// acessibilidade do cadeado, que usa o título como variável.
//
// DOIS DESENHOS (09/08/2026, pedido do dono olhando o grid: "precisa de um
// banner pra cada link desse"):
//   - COM `arte` (asset do pack, lib/ilustracoes.js TILES): banner ilustrado
//     em cima + faixa de texto embaixo — o desenho dos cards premium do
//     concorrente. O ícone vira um selinho no canto do banner (identidade).
//   - SEM `arte`: o card de gradiente de sempre, byte a byte — nenhuma
//     feature fica quebrada esperando arte.
export default function FeatureCard({ title, subtitle, icon, gradient, arte, onPress, locked, testID }) {
  const { t } = useLanguage();
  const aoTocar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress && onPress();
  };

  if (arte) {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={aoTocar}
        style={[styles.card, locked && styles.cardLocked]}
        accessibilityRole="button"
        accessibilityLabel={locked ? t('featureCard.lockedA11y', { title }) : title}
        testID={testID}
      >
        <View style={styles.bannerWrap}>
          <Image source={arte} style={styles.banner} resizeMode="cover" accessible={false} />
          <View style={[styles.iconChip, { backgroundColor: (gradient && gradient[0]) || colors.accent }]}>
            <Ionicons name={icon} size={14} color="#fff" />
          </View>
          {locked && (
            <View style={styles.lock}>
              <Ionicons name="lock-closed" size={12} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.texto}>
          <Text style={styles.tituloBanner} numberOfLines={1}>{title}</Text>
          <Text style={styles.subtituloBanner} numberOfLines={1}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={aoTocar}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={locked ? t('featureCard.lockedA11y', { title }) : title}
      testID={testID}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.grad, locked && styles.gradLocked]}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        {locked && (
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: colors.surface,
  },
  cardLocked: { opacity: 0.55 },
  grad: { padding: 14, minHeight: 116, justifyContent: 'space-between' },
  gradLocked: { opacity: 0.55 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  lock: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 5,
  },
  // Desenho com banner: arte 84px em cima, faixa de texto embaixo — a altura
  // total (~132) fica próxima da do card de gradiente (116) pra grade não
  // ficar banguela quando uma linha mistura os dois desenhos.
  bannerWrap: { width: '100%', height: 84 },
  banner: { width: '100%', height: '100%' },
  iconChip: {
    position: 'absolute', top: 8, left: 8,
    width: 26, height: 26, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    opacity: 0.95,
  },
  texto: { paddingHorizontal: 12, paddingVertical: 10 },
  tituloBanner: { color: colors.text, fontSize: 14, fontWeight: '800' },
  subtituloBanner: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
