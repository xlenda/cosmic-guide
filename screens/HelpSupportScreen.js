import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import { SUPPORT_EMAIL, SUPPORT_MAILTO, HOTMART_BUYER_AREA_URL } from '../lib/supportContact';

// Reexportado pra não quebrar quem já importava daqui (PrivacyScreen). A fonte
// da verdade agora é lib/supportContact.js — inclusive o aviso de que este
// endereço ainda não recebe mensagem (o domínio está sem MX).
export { SUPPORT_EMAIL };

// `action` transforma a resposta do FAQ em caminho: toda resposta que MANDA a
// pessoa fazer algo ("vá em Perfil e toque em...", "preenchem no quiz do
// casal") ganha o toque que faz a coisa acontecer, em vez de descrever o
// trajeto. Sem `action` a resposta continua sendo só texto.
//
// `answerKey` (em vez de `answer` solto) existe pras respostas que mudaram
// depois da primeira escrita: elas passam pelo dicionário, então quem lê o app
// em espanhol/inglês recebe a informação certa no idioma dele — e não uma
// instrução errada em português.
const FAQ = [
  {
    question: 'Como funciona o modo casal?',
    answer:
      'Vocês dois preenchem nomes, signos e datas de nascimento uma única vez no quiz do casal. A partir daí o app calcula a sinastria (compatibilidade astrológica) e gera horóscopos e leituras pensados pra dupla, não só individualmente.',
    actionKey: 'help.faq.couple.cta',
    actionIcon: 'heart',
    // ProfileStack -> HomeStack: getParent() sobe pro Tab.Navigator.
    actionTarget: { tab: ROUTES.HOME_TAB, screen: ROUTES.QUIZ },
  },
  {
    question: 'Minhas leituras são salvas?',
    answer:
      'Os dados do casal (nomes, datas, signos) ficam guardados só neste aparelho. Fotos e textos enviados pra Leitura de Palma, Ritual do Café, Sonhos ou Chat Espiritual são processados na hora e não ficam guardados depois que a resposta é gerada.',
  },
  // CORRIGIDO em 29/07/2026. A resposta antiga mandava a pessoa cancelar
  // "em Perfil → Gerenciar assinatura" ou "pela App Store/Google Play" — e
  // NENHUMA das duas coisas existe: "Gerenciar assinatura" só abre a tela de
  // Planos (ver ProfileScreen.js, MenuRow do card CONTA), e o app nunca foi
  // vendido por loja de aplicativo — a cobrança é da Hotmart, por checkout web
  // (HOTMART_PAY_URLS em PlanosScreen.js). Quem seguisse a instrução dava
  // várias voltas, não achava botão nenhum e concluía que não dava pra
  // cancelar — que é exatamente a suspeita que faz alguém não assinar.
  {
    question: 'Como cancelo minha assinatura?',
    answerKey: 'help.faq.cancel.answer',
    actionKey: 'help.faq.cancel.cta',
    actionIcon: 'open-outline',
    actionUrl: HOTMART_BUYER_AREA_URL,
  },
  {
    question: 'Preciso criar uma conta pra usar o app?',
    answer:
      'Não. O app funciona sem login. A conta só é necessária na hora de assinar, pra sincronizar o acesso entre aparelhos e permitir recuperá-lo se precisar.',
  },
];

function FaqItem({ question, answer, last, actionLabel, actionIcon, onAction }) {
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
      {open && actionLabel && (
        <TouchableOpacity style={styles.faqActionBtn} activeOpacity={0.8} onPress={onAction}>
          <Ionicons name={actionIcon} size={15} color="#fff" />
          <Text style={styles.faqActionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

export default function HelpSupportScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  const abrirEmail = () => Linking.openURL(SUPPORT_MAILTO);

  return (
    <View style={styles.root}>
      <GradientHeader title="Ajuda e suporte" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Perguntas frequentes</Text>
        <View style={styles.card}>
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.question}
              question={item.question}
              answer={item.answerKey ? t(item.answerKey) : item.answer}
              last={i === FAQ.length - 1}
              actionLabel={item.actionKey ? t(item.actionKey) : null}
              actionIcon={item.actionIcon}
              onAction={
                item.actionUrl
                  ? () => Linking.openURL(item.actionUrl)
                  : item.actionTarget
                    ? () => navigation.getParent()?.navigate(item.actionTarget.tab, { screen: item.actionTarget.screen })
                    : undefined
              }
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Fale conosco</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              Não achou o que precisava? Manda sua dúvida, sugestão ou problema pra{' '}
              <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text> que a gente responde o quanto antes.
            </Text>
            {/* O e-mail acima é pintado de cor de link mas nunca foi tocável —
                parecia botão e não era. Este abre o app de e-mail de verdade. */}
            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={abrirEmail}>
              <Ionicons name="mail" size={16} color="#fff" />
              <Text style={styles.contactBtnText}>{t('support.emailCta')}</Text>
            </TouchableOpacity>
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
  faqActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: 11, paddingHorizontal: 16, marginTop: 12, marginLeft: 44,
  },
  faqActionText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12,
  },
  contactBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
