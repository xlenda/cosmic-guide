import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';

const PLANETS = [
  { key: 'Sol', label: 'Sol', desc: 'Sua essência e identidade', icon: 'sunny', color: '#FFB84D' },
  { key: 'Lua', label: 'Lua', desc: 'Suas emoções e instintos', icon: 'moon', color: '#5CA8FF' },
  { key: 'Asc', label: 'Ascendente', desc: 'Como o mundo te vê', icon: 'trending-up', color: '#B57BFF' },
  { key: 'Mercurio', label: 'Mercúrio', desc: 'Sua comunicação', icon: 'chatbox-ellipses', color: '#5CE0D8' },
  { key: 'Venus', label: 'Vênus', desc: 'Seu amor e valores', icon: 'heart', color: '#FF6BA0' },
  { key: 'Marte', label: 'Marte', desc: 'Sua energia e ação', icon: 'flame', color: '#FF6B7A' },
];

export default function BirthChartScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [chart, setChart] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('birthChart');
      if (saved) {
        const c = JSON.parse(saved);
        setChart(c);
        setName(c.name); setDate(c.date); setTime(c.time); setPlace(c.place);
      }
    })();
  }, []);

  const generate = async () => {
    if (!name || !date) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // deterministic pseudo-random from inputs
    const seed = (name + date + time + place).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const planets = PLANETS.map((p, i) => ({
      ...p,
      sign: zodiacSigns[(seed + i * 5) % 12],
    }));
    const c = { name, date, time, place, planets };
    setChart(c);
    await AsyncStorage.setItem('birthChart', JSON.stringify(c));
  };

  return (
    <View style={styles.root}>
      <GradientHeader title="Mapa Astral" subtitle="Seu retrato cósmico" onBack={() => navigation.goBack()} gradient={['#3A4AB5', '#6C7BFF']} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Dados de nascimento</Text>
          <Field icon="person" placeholder="Nome" value={name} onChangeText={setName} />
          <Field icon="calendar" placeholder="Data (ex: 21/04/1991)" value={date} onChangeText={setDate} />
          <Field icon="time" placeholder="Hora (ex: 07:30)" value={time} onChangeText={setTime} />
          <Field icon="location" placeholder="Local de nascimento" value={place} onChangeText={setPlace} />
          <TouchableOpacity activeOpacity={0.85} onPress={generate} style={styles.btnWrap}>
            <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
              <Ionicons name="planet" size={18} color="#fff" />
              <Text style={styles.btnText}>Gerar Mapa Astral</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {chart && (
          <>
            <View style={styles.summaryCard}>
              <LinearGradient colors={gradients.card} style={styles.summaryInner}>
                <Text style={styles.summaryName}>{chart.name}</Text>
                <Text style={styles.summaryMeta}>{chart.date}{chart.time ? ` · ${chart.time}` : ''}</Text>
                <View style={styles.trio}>
                  {chart.planets.slice(0, 3).map((p) => (
                    <View key={p.key} style={styles.trioItem}>
                      <Text style={styles.trioLabel}>{p.label}</Text>
                      <Text style={[styles.trioGlyph, { color: p.sign.color }]}>{p.sign.icon}</Text>
                      <Text style={styles.trioSign}>{p.sign.pt}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </View>

            <Text style={styles.sub}>Posições planetárias</Text>
            {chart.planets.map((p) => (
              <View key={p.key} style={styles.planetRow}>
                <View style={[styles.planetIcon, { backgroundColor: p.color + '22' }]}>
                  <Ionicons name={p.icon} size={20} color={p.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planetLabel}>{p.label} em {p.sign.pt}</Text>
                  <Text style={styles.planetDesc}>{p.desc}</Text>
                </View>
                <Text style={[styles.planetGlyph, { color: p.sign.color }]}>{p.sign.icon}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Field({ icon, ...props }) {
  return (
    <View style={styles.field}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <TextInput style={styles.input} placeholderTextColor={colors.textMuted} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  formCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 14 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 14, marginLeft: 10 },
  btnWrap: { marginTop: 4, borderRadius: 12, overflow: 'hidden' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  summaryCard: { marginTop: 20, borderRadius: 18, overflow: 'hidden' },
  summaryInner: { padding: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  summaryName: { color: colors.text, fontSize: 20, fontWeight: '800' },
  summaryMeta: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
  trio: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18 },
  trioItem: { alignItems: 'center' },
  trioLabel: { color: colors.textMuted, fontSize: 12 },
  trioGlyph: { fontSize: 30, marginVertical: 6 },
  trioSign: { color: colors.text, fontSize: 14, fontWeight: '700' },
  sub: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  planetRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  planetIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  planetLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  planetDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  planetGlyph: { fontSize: 24 },
});
