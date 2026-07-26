// Extraído de HomeScreen.js — cabeçalho em gradiente com saudação, signo do dia,
// órbita dos signos e a pill de sequência do casal. Puramente visual:
// nenhum acesso a AsyncStorage/contexto aqui, só props.
//
// Compactado a pedido do dono do produto (26/07/2026): a órbita ocupava 200px
// de altura com um ícone genérico de planeta no centro — encolhida (~132px) e
// o centro agora é a LOGO real do app; tagline saiu (a Home abaixo já
// comunica o que o app faz, o hero não precisa repetir).
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients, zodiacSigns } from '../theme';
import { streakEmoji } from '../lib/coupleData';

const ORBIT_SIZE = 124;
const ORBIT_RADIUS = 62;

export default function HeroSection({ greeting, dateStr, sign, streak, insetTop }) {
  return (
    <LinearGradient
      colors={gradients.hero}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: insetTop + 14 }]}
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
          <Image source={require('../assets/icon.png')} style={styles.logoCore} resizeMode="cover" />
          {zodiacSigns.slice(0, 8).map((z, i) => {
            const angle = (i / 8) * 2 * Math.PI;
            return (
              <Text
                key={z.name}
                style={[
                  styles.orbitGlyph,
                  {
                    left: ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.cos(angle) - 8,
                    top: ORBIT_SIZE / 2 + ORBIT_RADIUS * Math.sin(angle) - 9,
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '800' },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3, textTransform: 'capitalize' },
  signBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
  },
  signGlyph: { color: '#fff', fontSize: 22 },
  orbitWrap: { alignItems: 'center', marginTop: 12, marginBottom: 6, height: ORBIT_SIZE + 8 },
  orbit: {
    width: ORBIT_SIZE, height: ORBIT_SIZE, borderRadius: ORBIT_SIZE / 2,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  logoCore: {
    width: 64, height: 64, borderRadius: 18,
    // Sem fundo translúcido: a logo já tem a própria arte/fundo.
  },
  orbitGlyph: { position: 'absolute', color: 'rgba(255,255,255,0.85)', fontSize: 16 },
  streakPill: {
    alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginTop: 4,
  },
  streakPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
