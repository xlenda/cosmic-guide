import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import { SUPPORT_EMAIL, SUPPORT_MAILTO, HOTMART_BUYER_AREA_URL } from '../lib/supportContact';

// DIAGRAMAÇÃO (12/09/2026 — lote das telas legais). Nenhuma pergunta, nenhuma
// resposta e nenhum destino de botão mudaram: as mesmas quatro entradas do FAQ,
// as mesmas chaves, as mesmas ações. Esta tela é o canal de suporte que a Play
// Store exige que exista e funcione.
//
// O DEFEITO (design/lote-legais/antes/ajuda.png): dois cards cinzas iguais, e
// o FAQ inteiro fechado — quatro linhas de 14px separadas por fio de 1px, o
// resto da tela vazio e o mesmo chão do começo ao fim. Fechado é o estado
// PADRÃO desta tela, e no estado padrão ela não tinha diagramação nenhuma.
//
// O CONSERTO:
//   1. DUAS FAIXAS: as perguntas e o contato. Duas é o mínimo da peça e o
//      certo aqui — a tela tem dois assuntos, não quatro.
//   2. A FAIXA DO FAQ É `rasa`. Esta é a tela onde a regra do estado vazio
//      mais importa: com tudo fechado o corpo da faixa mede pouco mais de
//      200px, e a caixa da onda cheia (56px) desenharia um naco de chão liso
//      quase do tamanho do conteúdo — o defeito ALTO que o revisor achou na
//      Home. `rasa` corta a caixa pela metade sem redesenhar a curva.
//   3. CORPO GRANDE e negrito raro: pergunta em type.cartao (17/22, peso 600),
//      resposta em type.corpoCurto (15/24) dentro de ColunaLeitura — as
//      respostas do FAQ têm 4 a 8 linhas, e é aí que a coluna rende.
export { SUPPORT_EMAIL };

// O lado da caixinha do ícone. É TAMANHO DE OBJETO, não degrau de espaço — a
// escala nomeia a RELAÇÃO entre duas coisas, não o quanto um quadrado mede.
// Fica numa constante porque o recuo da resposta e o do botão de ação são
// calculados a partir dele: assim os três andam juntos se ele mudar.
const LADO_ICONE = 32;

// `action` transforma a resposta do FAQ em caminho: toda resposta que MANDA a
// pessoa fazer algo ("vá em Perfil e toque em...", "preenchem no quiz do
// casal") ganha o toque que faz a coisa acontecer, em vez de descrever o
// trajeto. Sem `action` a resposta continua sendo só texto.
//
// TUDO passa pelo dicionário (19/08/2026). Pergunta e resposta eram literais em
// português dentro de um app de três idiomas: quem lia em espanhol/inglês abria
// "Help and support" e recebia o FAQ inteiro em PT.
//
// A resposta de "Minhas leituras são salvas?" era a MESMA promessa falsa que a
// tela de Privacidade acabou de perder ("os dados ficam só neste aparelho",
// citando 4 leituras de IA como se fossem todas). Duas superfícies com a mesma
// mentira é pior que uma: o revisor do Google compara justamente estas duas.
// Agora ela descreve o que o código faz — Diário no aparelho, leituras de IA
// passando pelo servidor e pela Anthropic só na hora, feed social público — e
// manda pra tela de Privacidade, que é a lista completa.
const FAQ = [
  {
    questionKey: 'help.faq.couple.q',
    answerKey: 'help.faq.couple.answer',
    actionKey: 'help.faq.couple.cta',
    actionIcon: 'heart',
    // ProfileStack -> HomeStack: getParent() sobe pro Tab.Navigator.
    actionTarget: { tab: ROUTES.HOME_TAB, screen: ROUTES.QUIZ },
  },
  {
    questionKey: 'help.faq.readings.q',
    answerKey: 'help.faq.readings.answer',
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
    questionKey: 'help.faq.cancel.q',
    answerKey: 'help.faq.cancel.answer',
    actionKey: 'help.faq.cancel.cta',
    actionIcon: 'open-outline',
    actionUrl: HOTMART_BUYER_AREA_URL,
  },
  {
    questionKey: 'help.faq.account.q',
    answerKey: 'help.faq.account.answer',
  },
];

function FaqItem({ question, answer, primeiro, actionLabel, actionIcon, onAction }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity
      style={[styles.row, !primeiro && styles.rowSeguinte]}
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
      {open && (
        <ColunaLeitura style={styles.colunaResposta}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </ColunaLeitura>
      )}
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
      <GradientHeader title={t('help.header.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAIXA 1 — as perguntas. `rasa` pelo estado FECHADO (ver o cabeçalho):
            é o estado padrão da tela, e é nele que a onda cheia viraria bloco
            de cor. paddingTop 0 porque o GradientHeader já dá a folga. */}
        <FaixaCurva tom="ameixa" semente="ajuda-perguntas" rasa estiloCorpo={styles.faixaAbertura}>
          <Text style={styles.sectionTitle}>{t('help.faq.title')}</Text>
          {FAQ.map((item, i) => (
            <FaqItem
              key={item.questionKey}
              question={t(item.questionKey)}
              answer={t(item.answerKey)}
              primeiro={i === 0}
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
        </FaixaCurva>

        {/* FAIXA 2 — o contato. Dourado: o chão quente do epílogo, e aqui ele
            tem função além de estética — é a linha "não achou a resposta? fala
            com a gente", e ela precisa ler como outra coisa, não como a quinta
            pergunta. `rasa`: o corpo é um título, uma linha e um botão. */}
        <FaixaCurva tom="dourado" semente="ajuda-contato" grude rasa>
          <Text style={styles.sectionTitle}>{t('help.contact.title')}</Text>
          <ColunaLeitura>
            <Text style={styles.paragraph}>
              {t('help.contact.intro')} <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>
            </Text>
          </ColunaLeitura>
          {/* O e-mail acima é pintado de cor de link mas nunca foi tocável —
              parecia botão e não era. Este abre o app de e-mail de verdade. */}
          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={abrirEmail}>
            <Ionicons name="mail" size={16} color="#fff" />
            <Text style={styles.contactBtnText}>{t('support.emailCta')}</Text>
          </TouchableOpacity>
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: space.fimDaLista },
  faixaAbertura: { paddingTop: 0 },
  sectionTitle: { ...type.secao, color: colors.text, marginBottom: space.junto },
  row: { marginTop: space.bloco },
  // O espaço entre as perguntas É a divisória (o fio de 1px saiu com o card).
  rowSeguinte: { marginTop: space.entre },
  rowIcon: {
    width: LADO_ICONE, height: LADO_ICONE, borderRadius: 10, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: space.dentro,
  },
  faqHeader: { flexDirection: 'row', alignItems: 'center' },
  faqQuestion: { ...type.cartao, color: colors.text, flex: 1 },
  // A resposta alinha com a PERGUNTA, não com o ícone: 32 do ícone + 12 do
  // respiro. Os dois saem da escala, então o recuo acompanha se ela mudar.
  colunaResposta: { marginTop: space.dentro, marginLeft: LADO_ICONE + space.dentro, paddingHorizontal: 0 },
  faqAnswer: { ...type.corpoCurto, color: colors.textSecondary },
  paragraph: { ...type.corpoCurto, color: colors.textSecondary },
  emailText: { color: colors.accent },
  faqActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: space.dentro, paddingHorizontal: space.bloco,
    marginTop: space.bloco, marginLeft: LADO_ICONE + space.dentro,
  },
  faqActionText: { ...type.botao, color: '#fff' },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: space.dentro, marginTop: space.bloco,
  },
  contactBtnText: { ...type.botao, color: '#fff' },
});
