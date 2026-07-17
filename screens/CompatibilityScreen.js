import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { compatibility, compatPercent } from '../lib/signs.js';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import OneTimeLock from '../components/OneTimeLock';

const FEATURE_KEY = 'compatibility';

export default function CompatibilityScreen() {
  const navigation = useNavigation();
  const { hasAccess } = useCouple();
  const [signA, setSignA] = useState(zodiacSigns[0]);
  const [signB, setSignB] = useState(zodiacSigns[5]);
  const [picking, setPicking] = useState(null); // 'A' | 'B' | null
  const [result, setResult] = useState(null);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess]);

  const compute = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const compat = compatibility(signA.name, signB.name);
    const pct = compatPercent(signA.name, signB.name);
    if (!compat || pct === null) { setResult(null); return; }
    setResult({ overall: pct, texto: compat.texto, forte: compat.forte, cuidado: compat.cuidado });
    markFeatureUsedOnce(FEATURE_KEY);
  };

  const pick = (z) => {
    Haptics.selectionAsync();
    if (picking === 'A') setSignA(z);
    else setSignB(z);
    setPicking(null);
    setResult(null);
  };

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Compatibilidade" gradient={['#B5286B', '#7B3FB5']} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Compatibilidade" subtitle="Encontre seu par celestial" onBack={() => navigation.goBack()} gradient={['#B5286B', '#7B3FB5']} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.pairRow}>
          <SignSlot sign={signA} onPress={() => setPicking(picking === 'A' ? null : 'A')} active={picking === 'A'} />
          <View style={styles.plusWrap}>
            <Ionicons name="heart" size={26} color={colors.pink} />
          </View>
          <SignSlot sign={signB} onPress={() => setPicking(picking === 'B' ? null : 'B')} active={picking === 'B'} />
        </View>

        {picking && (
          <View style={styles.pickerGrid}>
            {zodiacSigns.map((z) => (
              <TouchableOpacity key={z.name} style={[styles.pickerItem, { borderColor: z.color + '55' }]} onPress={() => pick(z)}>
                <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                <Text style={styles.pickerName}>{z.pt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!picking && (
          <TouchableOpacity activeOpacity={0.85} onPress={compute} style={styles.btnWrap}>
            <LinearGradient colors={gradients.pink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
              <Ionicons name="analytics" size={18} color="#fff" />
              <Text style={styles.btnText}>Calcular Compatibilidade</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {result && (
          <>
            <View style={styles.resultCard}>
              <LinearGradient colors={gradients.card} style={styles.resultInner}>
                <View style={styles.circleWrap}>
                  <LinearGradient colors={gradients.pink} style={styles.circle}>
                    <Text style={styles.circlePct}>{result.overall}%</Text>
                    <Text style={styles.circleLabel}>Combinação</Text>
                  </LinearGradient>
                </View>
                <Text style={styles.resultTitle}>
                  {result.overall >= 80 ? 'O encontro gera paixão!' : result.overall >= 60 ? 'Uma bela conexão em potencial' : 'Requer dedicação e diálogo'}
                </Text>
                <Text style={styles.resultDesc}>{result.texto}</Text>
              </LinearGradient>
            </View>

            <View style={styles.traitCard}>
              <View style={[styles.traitIcon, { backgroundColor: colors.pink + '22' }]}>
                <Ionicons name="heart-circle" size={20} color={colors.pink} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.traitLabel}>Ponto forte</Text>
                <Text style={styles.traitText}>{result.forte}</Text>
              </View>
            </View>

            <View style={styles.traitCard}>
              <View style={[styles.traitIcon, { backgroundColor: colors.accent + '22' }]}>
                <Ionicons name="alert-circle" size={20} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.traitLabel}>Atenção</Text>
                <Text style={styles.traitText}>{result.cuidado}</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function SignSlot({ sign, onPress, active }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[styles.slot, active && { borderColor: sign.color }]}>
      <View style={[styles.slotGlyphWrap, { backgroundColor: sign.color + '22' }]}>
        <Text style={[styles.slotGlyph, { color: sign.color }]}>{sign.icon}</Text>
      </View>
      <Text style={styles.slotName}>{sign.pt}</Text>
      <Text style={styles.slotDates}>{sign.dates}</Text>
      <View style={styles.changeRow}>
        <Ionicons name="swap-vertical" size={12} color={colors.accent} />
        <Text style={styles.changeText}>Trocar</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pairRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  slot: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1.5, borderColor: colors.border },
  slotGlyphWrap: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  slotGlyph: { fontSize: 30 },
  slotName: { color: colors.text, fontSize: 16, fontWeight: '800' },
  slotDates: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  changeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 3 },
  changeText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  plusWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8, borderWidth: 1, borderColor: colors.border },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  pickerItem: { width: '31%', backgroundColor: colors.surface, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  pickerGlyph: { fontSize: 22 },
  pickerName: { color: colors.textSecondary, fontSize: 11, marginTop: 4, fontWeight: '600' },
  btnWrap: { borderRadius: 12, overflow: 'hidden' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  resultCard: { marginTop: 20, borderRadius: 18, overflow: 'hidden' },
  resultInner: { padding: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 18, alignItems: 'center' },
  circleWrap: { marginBottom: 16 },
  circle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  circlePct: { color: '#fff', fontSize: 32, fontWeight: '800' },
  circleLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  resultTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center' },
  resultDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  traitCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  traitIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  traitLabel: { color: colors.text, fontSize: 14, fontWeight: '800' },
  traitText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 3 },
});
