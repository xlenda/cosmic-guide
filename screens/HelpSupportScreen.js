import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';

const FAQ = [
  {
    question: 'Como funciona o modo casal?',
    answer:
      'Vocês dois preenchem nomes, signos e datas de nascimento uma única vez no quiz do casal. A partir daí o app calcula a sinastria (compatibilidade astrológica) e gera horóscopos e leituras pensados pra dupla, não só individualmente.',
  },
  {
    question: 'Minhas leituras são salvas?',
    answer:
      'Os dados do casal (nomes, datas, signos) ficam guardados só neste aparelho. Fotos e textos enviados pra Leitura de Palma, Ritual do Café, Sonhos ou Chat Espiritual são processados na hora e não ficam guardados depois que a resposta é gerada.',
  },
  {
    question: 'Como cancelo minha assinatura?',
    answer:
      'Vá em Perfil e toque em "Gerenciar assinatura". Você também pode cancelar diretamente pela loja de aplicativos (App Store/Google Play) ou pelo portal de pagamento, dependendo de onde você assinou.',
  },
  {
    question: 'Preciso criar uma conta pra usar o app?',
    answer:
      'Não. O app funciona sem login. A conta só é necessária na hora de assinar, pra sincronizar o acesso entre aparelhos e permitir recuperá-lo se precisar.',
  },
];

function FaqItem({ question, answer, last }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.row, !last && styles.rowBorder]}
      onPress={() => setOpen((v) => !v)}
      activeOpacity={0.7}
    >
      <View style={styles.faqHeader}>
        <View style={styles.rowIcon}>
          <Ionicons name="help-circle" size={18} color={colors.accent} />
        </View>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {open && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <GradientHeader title="Ajuda e suporte" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
        <View style={styles.card}>
          {FAQ.map((item, i) => (
            <FaqItem key={item.question} question={item.question} answer={item.answer} last={i === FAQ.length - 1} />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Fale conosco</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              Não achou o que precisava? Manda sua dúvida, sugestão ou problema pra{' '}
              <Text style={styles.emailText}>contato@cosmicguide.cloud</Text> que a gente responde o quanto antes.
            </Text>
          </View>
        </View>
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
  row: { paddingHorizontal: 16, paddingVertical: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqQuestion: { color: colors.text, fontSize: 14, fontWeight: '600', flex: 1 },
  faqAnswer: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 10, marginLeft: 44 },
  emailText: { color: colors.accent, fontWeight: '700' },
});
