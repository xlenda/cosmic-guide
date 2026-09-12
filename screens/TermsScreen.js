import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORT_EMAIL } from '../lib/supportContact';

// DIAGRAMAÇÃO (12/09/2026 — lote das telas legais). O texto NÃO mudou: são os
// mesmos seis blocos, na mesma ordem, com as mesmas chaves de i18n. Este texto
// é COMPROMISSO JURÍDICO e alimenta o Data Safety da Play Store; a única coisa
// que mudou aqui é onde as palavras pousam.
//
// O DEFEITO, fotografado em design/lote-legais/antes/termos.png: as seis
// seções viviam dentro de UM card cinza de borda a borda, separadas por um fio
// de 1px, em corpo de 14px com entrelinha 21. Seis assuntos jurídicos
// diferentes lidos como uma parede só — e parede de texto é exatamente onde a
// pessoa para de ler e vai clicar em "aceito" sem saber o que aceitou.
//
// O CONSERTO tem três partes e nenhuma é cor:
//   1. TRÊS FAIXAS, não uma. Abertura (o que este documento é), o corpo das
//      regras, e o contato. O olho lê "mudou de assunto" pela mudança de chão.
//   2. COLUNA DE LEITURA em cada parágrafo. É onde ela mais rende: são
//      parágrafos de 5 a 10 linhas, e de borda a borda numa tela larga a pessoa
//      perde o começo da linha seguinte.
//   3. CORPO GRANDE. type.corpoCurto (15/24) no lugar do 14/21, e o título de
//      cada seção em type.cartao (17/22, peso 600) no lugar de 14 com peso 700.
//      O card e o fio de 1px saíram: com chão próprio e space.secao entre as
//      seções, a divisória virou o espaço — que é como os prints separam.

// `primeira` MEDIDO (12/09/2026, na foto do depois): dentro da faixa, o
// espaço acima do primeiro título é a soma de três coisas — a caixa da onda
// (56px cheios), o paddingTop da faixa (space.secao) e o marginTop da seção
// (outro space.secao). Deu 120px de chão liso antes da primeira palavra: o
// mesmo defeito ALTO que o revisor achou na Home, só que no meio da tela. A
// primeira seção não leva o degrau porque a faixa já deu o dela; da segunda em
// diante ele é a divisória que substituiu o fio de 1px.
function TermsSection({ title, children, primeira }) {
  return (
    <View style={primeira ? null : styles.secao}>
      <ColunaLeitura>
        <Text style={styles.secaoTitulo}>{title}</Text>
        <Text style={styles.paragraph}>{children}</Text>
      </ColunaLeitura>
    </View>
  );
}

export default function TermsScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <View style={styles.root}>
      <GradientHeader title={t('terms.header.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAIXA 1 — a abertura. `rasa` e paddingTop 0: vem logo abaixo do
            GradientHeader, que já tem folga embaixo, e a onda cheia somada ao
            padding abriria um naco de chão liso maior que o próprio parágrafo
            de duas linhas (o defeito ALTO que o revisor achou na Home). */}
        <FaixaCurva tom="ameixa" semente="termos-abertura" rasa estiloCorpo={styles.faixaAbertura}>
          <ColunaLeitura>
            <Text style={styles.intro}>{t('terms.intro')}</Text>
          </ColunaLeitura>
        </FaixaCurva>

        {/* FAIXA 2 — o corpo das regras. Noite (ardósia): é a faixa mais longa
            da tela e precisa do chão que separa sem colorir. Violeta aqui
            lavaria a tela inteira — foi o que o lote da Home mediu em faixa
            longa. */}
        <FaixaCurva tom="noite" semente="termos-regras" grude>
          <TermsSection title={t('terms.service.title')} primeira>
            {t('terms.service.body')}
          </TermsSection>
          <TermsSection title={t('terms.account.title')}>
            {t('terms.account.body')}
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
          <TermsSection title={t('terms.payments.title')}>
            {t(Platform.OS === 'web' ? 'terms.payments.body' : 'terms.payments.bodyStore')}
          </TermsSection>
          <TermsSection title={t('terms.community.title')}>
            {t('terms.community.body')}
          </TermsSection>
          <TermsSection title={t('terms.acceptable.title')}>
            {t('terms.acceptable.body')}
          </TermsSection>
          <TermsSection title={t('terms.deletion.title')}>
            {t('terms.deletion.body')}
          </TermsSection>
        </FaixaCurva>

        {/* FAIXA 3 — o contato. Dourado: o chão quente do epílogo, a única
            linha desta tela que convida em vez de reger. `rasa` porque o corpo
            é um título e um parágrafo de duas linhas — onda cheia aqui seria
            mais chão que conteúdo. */}
        <FaixaCurva tom="dourado" semente="termos-contato" grude rasa>
          <ColunaLeitura>
            <Text style={styles.contatoTitulo}>{t('terms.contact.title')}</Text>
            <Text style={styles.paragraph}>{t('terms.contact.body', { email: SUPPORT_EMAIL })}</Text>
          </ColunaLeitura>
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // As faixas sangram de ponta a ponta e trazem o próprio paddingHorizontal
  // (space.tela) — por isso o scroll não tem padding lateral nenhum.
  content: { paddingBottom: space.fimDaLista },
  faixaAbertura: { paddingTop: 0 },
  intro: { ...type.corpoCurto, color: colors.textSecondary },
  // O espaço É a divisória: `secao` entre um assunto jurídico e o próximo, no
  // lugar do fio de 1px. A PRIMEIRA seção não recebe este estilo (ver
  // `primeira` no TermsSection): lá o degrau somaria com o padding da faixa.
  secao: { marginTop: space.secao },
  secaoTitulo: { ...type.cartao, color: colors.text, marginBottom: space.dentro },
  paragraph: { ...type.corpoCurto, color: colors.textSecondary },
  contatoTitulo: { ...type.cartao, color: colors.text, marginBottom: space.dentro },
});
