import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';

function PrivacyRow({ icon, text, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowText}>{text}</Text>
    </View>
  );
}

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { clearAll } = useCouple();

  function confirmDelete() {
    Alert.alert(
      'Apagar todos os dados do casal',
      'Isso apaga para sempre, neste aparelho, os nomes, signos, datas e horas de nascimento e a sequência salva de vocês dois. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            navigation.popToTop();
          },
        },
      ]
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Privacidade" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>O que guardamos</Text>
        <View style={styles.card}>
          <PrivacyRow icon="people" text="Nomes de vocês dois" />
          <PrivacyRow icon="calendar" text="Datas de nascimento" />
          <PrivacyRow icon="time" text="Horários de nascimento (quando informados)" />
          <PrivacyRow icon="planet" text="Signos derivados das datas" last />
        </View>

        <Text style={styles.sectionTitle}>Como usamos</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              Esses dados servem só para calcular a sinastria (compatibilidade astrológica) e o horóscopo diário de vocês dois.
            </Text>
            <Text style={[styles.paragraph, { marginBottom: 0 }]}>
              Tudo fica guardado localmente neste aparelho — nada é enviado para servidores nem compartilhado com terceiros.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={confirmDelete} activeOpacity={0.85}>
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}>Apagar todos os dados do casal</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 8 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, marginBottom: 24, overflow: 'hidden',
  },
  cardPad: { padding: 16 },
  paragraph: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  rowText: { color: colors.textSecondary, fontSize: 14, flex: 1 },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.red, borderRadius: 14, paddingVertical: 14, marginTop: 4,
  },
  dangerBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
