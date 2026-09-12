import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../lib/supportContact';

// DIAGRAMAÇÃO (12/09/2026 — lote das telas legais). NENHUMA palavra mudou:
// as mesmas cinco regras, os mesmos três itens de moderação, as mesmas chaves.
// Este texto é o que o revisor da Play Store lê pra julgar moderação de
// conteúdo gerado por usuário — reescrever aqui é mexer em compromisso, e não
// é o trabalho deste lote.
//
// O DEFEITO (design/lote-legais/antes/diretrizes.png): dois cards cinzas
// iguais, oito linhas com o mesmo ícone redondo roxo, todo título em peso 800
// e todo corpo em 13/20. As regras (o que a pessoa DEVE fazer) e a moderação
// (o que acontece se ela não fizer) são dois assuntos opostos desenhados
// exatamente igual.
//
// O CONSERTO:
//   1. QUATRO FAIXAS, uma por assunto: abertura, o aviso de que o feed é
//      público, as regras, a moderação. O contato fecha dentro da última.
//   2. O ÍCONE FICA, o card sai. O ícone é navegação (a pessoa varre a lista
//      procurando a regra que a interessa); a moldura cinza em volta é que era
//      ruído. Sem ela, o espaço entre as linhas passa a ser a divisória.
//   3. CORPO GRANDE: type.corpoCurto (15/24) no corpo e type.cartao (17/22,
//      peso 600) no título de cada regra, no lugar do peso 800 em 14px. Negrito
//      é hierarquia, não ênfase — a lei da fundação.
const RULES = ['respect', 'privacy', 'safety', 'integrity', 'symbolic'];
const MODERATION = ['reports', 'consequences', 'accountDeletion'];

function GuidelineRow({ icon, title, body }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.paragraph}>{body}</Text>
      </View>
    </View>
  );
}

const RULE_ICONS = {
  respect: 'people-outline',
  privacy: 'shield-checkmark-outline',
  safety: 'heart-outline',
  integrity: 'checkmark-circle-outline',
  symbolic: 'sparkles-outline',
};

const MODERATION_ICONS = {
  reports: 'flag-outline',
  consequences: 'hand-left-outline',
  accountDeletion: 'trash-outline',
};

export default function CommunityGuidelinesScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <View style={styles.root}>
      <GradientHeader title={t('community.guidelines.header')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAIXA 1 — abertura. `rasa` + paddingTop 0 pelo mesmo motivo dos
            Termos: o GradientHeader já dá a folga de cima, e a onda cheia
            somada ao padding abre um naco de chão liso maior que a etiqueta. */}
        <FaixaCurva tom="ameixa" semente="diretrizes-abertura" rasa estiloCorpo={styles.faixaAbertura}>
          <ColunaLeitura>
            <Text style={styles.eyebrow}>{t('community.guidelines.updated')}</Text>
            <Text style={styles.intro}>{t('community.guidelines.intro')}</Text>
          </ColunaLeitura>
        </FaixaCurva>

        {/* FAIXA 2 — "antes de publicar, saiba que é público". Dourado: é o
            aviso, a única coisa da tela que a pessoa precisa ler ANTES de
            agir, e o chão quente é o que a separa das regras. `rasa`: o corpo
            é um título e três linhas. O ícone de olho fica; a borda dourada em
            volta sai — o chão já faz o trabalho que a borda fazia. */}
        <FaixaCurva tom="dourado" semente="diretrizes-aviso" grude rasa>
          <View style={styles.notice}>
            <Ionicons name="eye-outline" size={20} color={colors.gold} />
            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>{t('community.guidelines.before.title')}</Text>
              <Text style={styles.paragraph}>{t('community.guidelines.before.body')}</Text>
            </View>
          </View>
        </FaixaCurva>

        {/* FAIXA 3 — as regras. Noite (ardósia): é a faixa longa da tela, e o
            chão que separa sem colorir é o certo pra cinco itens seguidos. */}
        <FaixaCurva tom="noite" semente="diretrizes-regras" grude>
          <Text style={styles.sectionTitle}>{t('community.guidelines.rules.title')}</Text>
          {RULES.map((rule) => (
            <GuidelineRow
              key={rule}
              icon={RULE_ICONS[rule]}
              title={t(`community.guidelines.${rule}.title`)}
              body={t(`community.guidelines.${rule}.body`)}
            />
          ))}
        </FaixaCurva>

        {/* FAIXA 4 — a moderação e o contato. Violeta: é o assunto que PRECISA
            se destacar do vizinho, porque é o que acontece quando a regra é
            quebrada — ler igual à regra é o defeito de antes. O contato fecha
            aqui em vez de virar um quinto chão: cinco faixas já é textura. */}
        <FaixaCurva tom="violeta" semente="diretrizes-moderacao" grude>
          <Text style={styles.sectionTitle}>{t('community.guidelines.moderation.title')}</Text>
          {MODERATION.map((item) => (
            <GuidelineRow
              key={item}
              icon={MODERATION_ICONS[item]}
              title={t(`community.guidelines.${item}.title`)}
              body={t(`community.guidelines.${item}.body`)}
            />
          ))}

          <View style={styles.contato}>
            <ColunaLeitura>
              <Text style={styles.rowTitle}>{t('community.guidelines.contact.title')}</Text>
              <Text style={styles.paragraph}>
                {t('community.guidelines.contact.body', { email: SUPPORT_EMAIL })}
              </Text>
            </ColunaLeitura>
            <Pressable
              accessibilityRole="link"
              onPress={() => Linking.openURL(SUPPORT_MAILTO)}
              style={({ pressed }) => [styles.contactButton, pressed && styles.contactButtonPressed]}
            >
              <Ionicons name="mail-outline" size={16} color="#fff" />
              <Text style={styles.contactButtonText}>{t('community.guidelines.contact.cta')}</Text>
            </Pressable>
          </View>
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // As faixas trazem o próprio paddingHorizontal (space.tela).
  content: { paddingBottom: space.fimDaLista },
  faixaAbertura: { paddingTop: 0 },
  eyebrow: { ...type.etiqueta, color: colors.gold, textTransform: 'uppercase', marginBottom: space.dentro },
  intro: { ...type.corpoCurto, color: colors.textSecondary },
  notice: { flexDirection: 'row', gap: space.dentro },
  noticeCopy: { flex: 1 },
  noticeTitle: { ...type.cartao, color: colors.text, marginBottom: space.junto },
  sectionTitle: { ...type.secao, color: colors.text, marginBottom: space.bloco },
  // O espaço entre as linhas É a divisória (o fio de 1px saiu com o card).
  row: { flexDirection: 'row', gap: space.dentro, marginTop: space.entre },
  rowIcon: {
    width: 34, height: 34, borderRadius: 11, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center',
  },
  rowCopy: { flex: 1 },
  rowTitle: { ...type.cartao, color: colors.text, marginBottom: space.junto },
  paragraph: { ...type.corpoCurto, color: colors.textSecondary },
  // `ar` — o silêncio antes do contato: ele não é mais um item de moderação,
  // é o epílogo da tela, e precisa ler como outra coisa.
  contato: { marginTop: space.ar },
  contactButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: space.dentro, marginTop: space.bloco,
  },
  contactButtonPressed: { opacity: 0.78 },
  contactButtonText: { ...type.botao, color: '#fff' },
});
