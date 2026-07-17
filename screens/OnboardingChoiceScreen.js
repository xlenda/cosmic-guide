// Primeira tela vista por qualquer usuário sem perfil salvo (nem casal, nem
// solo) — ver Gate em App.js. Sem botão de voltar: não há nada antes dela.
// "Só eu" abre um seletor de signo inline (mesmo padrão visual do picker de
// HoroscopeScreen.js, reaproveitando zodiacSigns de theme.js) e salva via
// saveSolo() do CoupleContext. "Eu e meu par" manda para o QuizScreen do
// casal, sem alterar nada do fluxo do quiz.
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';

export default function OnboardingChoiceScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { saveSolo } = useCouple();
  const [showSignPicker, setShowSignPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function pickSign(z) {
    if (saving) return;
    Haptics.selectionAsync();
    setSaving(true);
    setError('');
    // Sem setSaving(false) no caminho feliz: assim que soloSign existir no
    // contexto, o Gate em App.js troca esta tela pelo Tab.Navigator sozinho.
    // Mas se o storage falhar, saveSolo retorna false e precisamos reverter o
    // spinner manualmente — senão o usuário fica preso na tela para sempre.
    const ok = await saveSolo(z);
    if (!ok) {
      setSaving(false);
      setError('Não foi possível salvar seu signo. Tente novamente.');
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 28 }]}
      >
        <Text style={styles.headerEyebrow}>Cosmic Guide</Text>
        <Text style={styles.headerTitle}>Como vamos explorar{'\n'}o cosmos?</Text>
        <Text style={styles.headerSub}>Escolha um caminho para começar. Dá para adicionar seu par depois.</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!showSignPicker ? (
          <>
            <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => setShowSignPicker(true)}>
              <LinearGradient colors={gradients.purple} style={styles.cardIcon}>
                <Ionicons name="person" size={26} color="#fff" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Só eu</Text>
              <Text style={styles.cardDesc}>Descubra seu horóscopo, mapa astral e tarô agora.</Text>
              <View style={styles.cardCta}>
                <Text style={styles.cardCtaText}>Começar</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.accent} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.card}
              onPress={() => navigation.navigate(ROUTES.QUIZ)}
            >
              <LinearGradient colors={gradients.pink} style={styles.cardIcon}>
                <Ionicons name="heart" size={26} color="#fff" />
              </LinearGradient>
              <Text style={styles.cardTitle}>Eu e meu par</Text>
              <Text style={styles.cardDesc}>Descubram juntos a energia e a compatibilidade de vocês.</Text>
              <View style={styles.cardCta}>
                <Text style={styles.cardCtaText}>Começar</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.accent} />
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <View>
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => setShowSignPicker(false)}
              disabled={saving}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
              <Text style={styles.backRowText}>Voltar</Text>
            </TouchableOpacity>

            <Text style={styles.pickerTitle}>Qual é o seu signo?</Text>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {saving ? (
              <View style={styles.savingWrap}>
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : (
              <View style={styles.pickerGrid}>
                {zodiacSigns.map((z) => (
                  <TouchableOpacity
                    key={z.name}
                    style={styles.pickerItem}
                    onPress={() => pickSign(z)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                    <Text style={styles.pickerName}>{z.pt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerEyebrow: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase', textAlign: 'center' },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', marginTop: 10, lineHeight: 32 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, padding: 20, marginTop: 16,
  },
  cardIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  cardTitle: { color: colors.text, fontSize: 19, fontWeight: '800' },
  cardDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 6 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  cardCtaText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  backRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backRowText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 2 },
  pickerTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  pickerItem: {
    width: '31%', backgroundColor: colors.surfaceElevated, borderRadius: 14, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: 4,
  },
  pickerGlyph: { fontSize: 26 },
  pickerName: { color: colors.textSecondary, fontSize: 12, marginTop: 6, fontWeight: '600' },
  savingWrap: { paddingVertical: 40, alignItems: 'center' },
  errorText: { color: colors.red, fontSize: 13, textAlign: 'center', marginBottom: 12 },
});
