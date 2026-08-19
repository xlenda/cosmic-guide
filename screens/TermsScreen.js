import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORT_EMAIL } from '../lib/supportContact';

function TermsSection({ title, children, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.paragraph}>{children}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <View style={styles.root}>
      <GradientHeader title="Termos de uso" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Este é um resumo simples e de boa-fé das regras de uso do Cosmic Guide — não substitui aconselhamento
          jurídico e pode ser atualizado conforme o app evolui.
        </Text>

        <View style={styles.card}>
          <TermsSection title="Sobre o serviço">
            O Cosmic Guide é um app de entretenimento e reflexão pessoal baseado em tradições simbólicas — astrologia,
            tarô, quiromancia, interpretação de sonhos e borra de café. Todo conteúdo gerado, incluindo respostas de
            IA, tem caráter recreativo e não constitui aconselhamento médico, psicológico, financeiro, jurídico ou
            profissional de qualquer tipo. Decisões importantes da sua vida não devem se basear nas leituras do app.
          </TermsSection>
          <TermsSection title="Sua conta">
            Você pode usar boa parte do app sem criar conta. Quando decide assinar, criamos uma conta vinculada ao
            seu e-mail pra sincronizar o acesso entre aparelhos. Você é responsável por manter sua senha em sigilo e
            por tudo que acontecer usando sua conta.
          </TermsSection>
          {/* CORRIGIDO em 29/07/2026. O texto anterior descrevia um app que não
              é este: dizia que a assinatura é cobrada "pela loja de aplicativos"
              e que dá pra cancelar "pelo próprio app (Perfil → Gerenciar
              assinatura)". Não existe venda por loja (a cobrança é da Hotmart,
              por checkout web — ver HOTMART_PAY_URLS em PlanosScreen.js) e o
              item "Gerenciar assinatura" do Perfil só abre a tela de Planos:
              nenhum toque dentro do app interrompe a renovação. Prometer nos
              Termos um cancelamento que o produto não faz é o tipo de promessa
              que vira reclamação — e, no Brasil, infração ao CDC. Passa pelo
              dicionário porque é texto novo: quem lê em espanhol/inglês precisa
              da informação certa no idioma dele. */}
          {/* ATUALIZADO em 19/08/2026 pra loja. Na web a cobrança continua
              sendo só da Hotmart; no app publicado a assinatura passa a ser
              comprada por Google Play Billing (ver lib/purchases.js), e aí o
              cancelamento é em Play Store > Assinaturas. Como o mesmo binário
              atende quem assinou pelo site e depois entrou com a conta, o
              texto nativo cobre os DOIS caminhos em vez de escolher um — dizer
              "cancele na Hotmart" pra quem pagou na Play é mandar a pessoa
              procurar um botão que não existe. */}
          <TermsSection title="Pagamentos e assinatura">
            {t(Platform.OS === 'web' ? 'terms.payments.body' : 'terms.payments.bodyStore')}
          </TermsSection>
          <TermsSection
            title="Uso aceitável"
            last
          >
            Pedimos que você não use o app pra enviar conteúdo ilegal, ofensivo ou que viole direitos de terceiros, não
            tente contornar os limites de uso ou segurança do serviço, e não reutilize as leituras geradas de forma
            comercial sem autorização. Podemos suspender contas que abusem claramente dessas regras.
          </TermsSection>
        </View>

        <Text style={styles.sectionTitle}>Fale conosco</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              Dúvidas sobre estes termos? Escreva para <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>.
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
  intro: { color: colors.textMuted, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10, marginTop: 8 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, marginBottom: 24, overflow: 'hidden',
  },
  cardPad: { padding: 16 },
  row: { paddingHorizontal: 16, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  paragraph: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  emailText: { color: colors.accent, fontWeight: '700' },
});
