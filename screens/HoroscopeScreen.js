import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';

const TABS = ['Ontem', 'Hoje', 'Amanhã'];

const READINGS = {
  Ontem: {
    text: 'A energia de ontem trouxe reflexões importantes sobre seus vínculos. O que ficou pendente pede resolução calma. A Lua minguante favoreceu o encerramento de ciclos.',
    scores: { Amor: 62, Trabalho: 74, Saúde: 58, Dinheiro: 70 },
  },
  Hoje: {
    text: 'O céu de hoje pede coragem para dizer sim ao novo. Vênus ilumina seus relacionamentos e traz suavidade às conversas difíceis. Confie na sua intuição — ela raramente falha. É um bom dia para iniciar projetos que envolvam criatividade e conexão.',
    scores: { Amor: 88, Trabalho: 76, Saúde: 82, Dinheiro: 65 },
  },
  Amanhã: {
    text: 'Amanhã Mercúrio favorece decisões práticas. Uma oportunidade profissional pode surgir de onde você menos espera. Mantenha os olhos abertos e o coração leve.',
    scores: { Amor: 71, Trabalho: 90, Saúde: 68, Dinheiro: 84 },
  },
};

export default function HoroscopeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [sign, setSign] = useState(route.params?.sign || zodiacSigns[0]);
  const [tab, setTab] = useState('Hoje');
  const [showPicker, setShowPicker] = useState(false);

  const r = READINGS[tab];

  const pickSign = async (z) => {
    Haptics.selectionAsync();
    setSign(z);
    setShowPicker(false);
    await AsyncStorage.setItem('userSign', JSON.stringify(z));
  };

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Horóscopo"
        subtitle={sign.pt}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
            <Ionicons name="swap-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {showPicker && (
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Escolha seu signo</Text>
            <View style={styles.pickerGrid}>
              {zodiacSigns.map((z) => (
                <TouchableOpacity
                  key={z.name}
                  style={[styles.pickerItem, sign.name === z.name && { backgroundColor: z.color + '33', borderColor: z.color }]}
                  onPress={() => pickSign(z)}
                >
                  <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                  <Text style={styles.pickerName}>{z.pt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tabs}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => { Haptics.selectionAsync(); setTab(t); }}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mainCard}>
          <LinearGradient colors={[sign.color + '44', 'transparent']} style={styles.signHeader}>
            <View style={[styles.bigGlyph, { backgroundColor: sign.color + '33' }]}>
              <Text style={[styles.bigGlyphText, { color: sign.color }]}>{sign.icon}</Text>
            </View>
            <View>
              <Text style={styles.bigName}>{sign.pt}</Text>
              <Text style={styles.bigDates}>{sign.dates}</Text>
              <View style={styles.elementRow}>
                <Ionicons name="flash" size={12} color={sign.color} />
                <Text style={[styles.element, { color: sign.color }]}>Elemento {sign.element}</Text>
              </View>
            </View>
          </LinearGradient>
          <Text style={styles.reading}>{r.text}</Text>
        </View>

        <Text style={styles.sub}>Áreas da sua vida</Text>
        <View style={styles.scoresCard}>
          <ScoreBar label="Amor" value={r.scores.Amor} gradient={['#FF6BA0', '#FF8C5C']} />
          <ScoreBar label="Trabalho" value={r.scores.Trabalho} gradient={['#5CA8FF', '#6C7BFF']} />
          <ScoreBar label="Saúde" value={r.scores.Saúde} gradient={['#5FD98C', '#5CE0D8']} />
          <ScoreBar label="Dinheiro" value={r.scores.Dinheiro} gradient={['#FFB84D', '#FFC85C']} />
        </View>

        <Text style={styles.sub}>Sua sorte hoje</Text>
        <View style={styles.luckRow}>
          <LuckItem icon="color-palette" color={colors.pink} label="Cor" value="Violeta" />
          <LuckItem icon="dice" color={colors.gold} label="Número" value="7" />
          <LuckItem icon="time" color={colors.teal} label="Hora" value="15h" />
        </View>
      </ScrollView>
    </View>
  );
}

function LuckItem({ icon, color, label, value }) {
  return (
    <View style={styles.luckItem}>
      <View style={[styles.luckIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.luckLabel}>{label}</Text>
      <Text style={styles.luckValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pickerCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  pickerTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 12 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: { width: '31%', backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pickerGlyph: { fontSize: 22 },
  pickerName: { color: colors.textSecondary, fontSize: 11, marginTop: 4, fontWeight: '600' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  mainCard: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  signHeader: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  bigGlyph: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  bigGlyphText: { fontSize: 30 },
  bigName: { color: colors.text, fontSize: 20, fontWeight: '800' },
  bigDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  elementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  element: { fontSize: 12, fontWeight: '700' },
  reading: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, padding: 18, paddingTop: 4 },
  sub: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  scoresCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  luckRow: { flexDirection: 'row', gap: 12 },
  luckItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  luckIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  luckLabel: { color: colors.textMuted, fontSize: 12 },
  luckValue: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
});
