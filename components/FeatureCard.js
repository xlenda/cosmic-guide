import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';

export default function FeatureCard({ title, subtitle, icon, gradient, onPress, locked, testID }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress && onPress();
      }}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={locked ? `${title}, recurso bloqueado, requer assinatura` : title}
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
  },
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
});
