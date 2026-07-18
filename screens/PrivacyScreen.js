import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
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
        <Text style={styles.sectionTitle}>O que guardamos neste aparelho</Text>
        <View style={styles.card}>
          <PrivacyRow icon="people" text="Nomes de vocês dois" />
          <PrivacyRow icon="calendar" text="Datas de nascimento" />
          <PrivacyRow icon="time" text="Horários de nascimento (quando informados)" />
          <PrivacyRow icon="planet" text="Signos derivados das datas" last />
        </View>

        <Text style={styles.sectionTitle}>O que enviamos para gerar leituras de IA</Text>
        <View style={styles.card}>
          <PrivacyRow icon="hand-left" text="Foto da palma da mão (Leitura de Palma)" />
          <PrivacyRow icon="cafe" text="Foto da borra de café (Ritual do Café)" />
          <PrivacyRow icon="moon" text="Texto do sonho que você descreve (Sonhos)" />
          <PrivacyRow icon="chatbubbles" text="Mensagens da conversa (Chat Espiritual)" last />
        </View>

        <Text style={styles.sectionTitle}>Como usamos</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              Nomes, datas, horários e signos servem só para calcular a sinastria (compatibilidade astrológica) e o
              horóscopo diário de vocês dois — ficam guardados só neste aparelho, nunca são enviados para nenhum servidor.
            </Text>
            <Text style={[styles.paragraph, { marginBottom: 0 }]}>
              Já a foto ou o texto que você envia para uma leitura de Palma, Café, Sonhos ou Chat é enviado para o
              nosso servidor e processado por um serviço de IA de terceiros (Anthropic) só na hora de gerar aquela
              interpretação — não fica guardado depois que a resposta é gerada.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Seus direitos (LGPD)</Text>
        <View style={styles.card}>
          <PrivacyRow icon="eye" text="Confirmar se tratamos algum dado seu e acessá-lo" />
          <PrivacyRow icon="create" text="Corrigir dados incompletos, inexatos ou desatualizados" />
          <PrivacyRow icon="trash-bin" text="Pedir a eliminação dos dados tratados com seu consentimento" />
          <PrivacyRow icon="information-circle" text="Saber com quem compartilhamos seus dados (hoje, só a Anthropic, e só na hora de gerar uma leitura)" last />
        </View>

        <Text style={styles.sectionTitle}>Fale conosco</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              Para exercer qualquer um desses direitos, ou tirar dúvidas sobre como tratamos seus dados, escreva para{' '}
              <Text style={styles.emailText}>contato@cosmicguide.cloud</Text>.
            </Text>
            <Text style={[styles.paragraph, { marginBottom: 0 }]}>
              Nomes, datas e signos ficam só no seu aparelho enquanto você usa o app — apagá-los aqui embaixo remove
              tudo de vez. Fotos e textos enviados para leituras de IA não ficam guardados depois da resposta gerada.
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
  emailText: { color: colors.accent, fontWeight: '700' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.red, borderRadius: 14, paddingVertical: 14, marginTop: 4,
  },
  dangerBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
