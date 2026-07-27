// Extraído de HomeScreen.js — cabeçalho em gradiente com saudação, signo do
// dia e a pill de sequência do casal. Puramente visual: nenhum acesso a
// AsyncStorage/contexto aqui, só props.
//
// Enxugado a pedido do dono do produto em duas rodadas: primeiro a órbita de
// signos encolheu (200px → ~132px, 26/07/2026 de manhã), depois saiu de vez
// (26/07/2026): era decoração pura, sem função nenhuma, e mesmo compactada
// ainda dominava a primeira dobra. O hero agora é só saudação + data + badge
// do signo + pill de sequência — o espaço liberado deixa o conteúdo de
// verdade (leitura do dia, sequência) aparecer sem rolar.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '../theme';
import { streakEmoji } from '../lib/coupleData';

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
  // paddingBottom maior que antes (16 → 26) de propósito: a órbita que ficava
  // aqui embaixo saiu, e o card seguinte na Home (diaryBar) sobe -14 por cima
  // do hero — sem essa folga o badge do signo encostava nele.
  hero: { paddingHorizontal: 20, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { color: '#fff', fontSize: 22, fontWeight: '800' },
  date: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 3, textTransform: 'capitalize' },
  signBadge: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
  },
  signGlyph: { color: '#fff', fontSize: 22 },
  streakPill: {
    alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, marginTop: 14,
  },
  streakPillText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
