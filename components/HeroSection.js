// Extraído de HomeScreen.js — cabeçalho em gradiente com saudação, signo do dia,
// órbita animada dos signos e a pill de sequência do casal. Puramente visual:
// nenhum acesso a AsyncStorage/contexto aqui, só props.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { gradients, zodiacSigns } from '../theme';
import { streakEmoji } from '../lib/coupleData';

export default function HeroSection({ greeting, dateStr, sign, streak, insetTop }) {
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insetTop + 16 }]}
    >
      <View style={styles.heroTop}>
        <View>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <View style={styles.signBadge}>
          <Text style={styles.signGlyph}>{sign.icon}</Text>
        </View>
      </View>

      <View style={styles.orbitWrap}>
        <View style={styles.orbit}>
          <View style={styles.planetCore}>
            <Ionicons name="planet" size={38} color="#fff" />
          </View>
          {zodiacSigns.slice(0, 8).map((z, i) => {
            const angle = (i / 8) * 2 * Math.PI;
            const r = 92;
            return (
              <Text
                key={z.name}
                style={[
                  styles.orbitGlyph,
                  {
                    left: 92 + r * Math.cos(angle) - 10,
                    top: 92 + r * Math.sin(angle) - 12,
                  },
                ]}
              >
                {z.icon}
              </Text>
            );
          })}
        </View>
      </View>

      {streak && (
        <View style={styles.streakPill}>
          <Text style={styles.streakPillText}>
            {streak.count > 0
              ? `${streakEmoji(streak.count)} ${streak.count} ${streak.count === 1 ? 'dia seguido' : 'dias seguidos'}`
              : '✨ Comecem hoje a sequência de vocês'}
          </Text>
        </View>
      )}

      <Text style={styles.tagline}>Leituras astrológicas precisas e conselhos intuitivos para uma vida guiada</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 24, fontWeight: '800' },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3, textTransform: 'capitalize' },
  signBadge: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
  },
  signGlyph: { color: '#fff', fontSize: 24 },
  orbitWrap: { alignItems: 'center', marginVertical: 16, height: 200 },
  orbit: { width: 184, height: 184, borderRadius: 92, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  planetCore: {
    width: 74, height: 74, borderRadius: 37,
    backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  orbitGlyph: { position: 'absolute', color: 'rgba(255,255,255,0.85)', fontSize: 20 },
  streakPill: {
    alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginBottom: 10,
  },
  streakPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  tagline: { color: 'rgba(255,255,255,0.85)', fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 4 },
});
