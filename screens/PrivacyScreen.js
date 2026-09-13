import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Alert } from '../lib/webAlert';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../lib/supportContact';
import { voicePrivacyCopy } from '../lib/voiceCopy';

// DIAGRAMAÇÃO (12/09/2026 — lote das telas legais). NENHUMA frase mudou, e a
// ordem das seções é a mesma: esta tela é o texto que o revisor do Google lê e
// que alimenta o formulário Data Safety da Play Store, e cada linha dela tem
// um recibo no código (ver o bloco de recibos abaixo, intocado). O trabalho
// aqui foi só de onde as palavras pousam.
//
// O DEFEITO (design/lote-legais/antes/privacidade.png — a foto tem 1,1 MB, que
// já diz o tamanho da parede): SETE cards cinzas idênticos, 26 linhas com o
// mesmo ícone redondo roxo, sete títulos em peso 800 e 14px, e onze parágrafos
// de 14/21 empilhados dentro de um único card. Sete assuntos jurídicos
// diferentes — o que fica no aparelho, o que vai pra IA, o que medimos, seus
// direitos — desenhados exatamente igual. Numa política de privacidade isso
// não é só feio: é o que faz a pessoa rolar até o fim sem ler nada.
//
// O CONSERTO, em quatro faixas e zero palavra nova:
//   1. QUATRO CHÃOS, agrupando as sete seções pelo que elas respondem:
//      ameixa  = O QUE FICA NO APARELHO (o que a pessoa mais quer saber);
//      noite   = O QUE SAI DAQUI (leituras de IA + medição de funil) — os dois
//                assuntos que tratam de dado que atravessa a rede;
//      violeta = COMO USAMOS (o miolo em prosa) e SEUS DIREITOS;
//      dourado = contato e exclusão da conta, o epílogo.
//      Sete faixas seria textura; quatro é paisagem.
//   2. O ÍCONE FICA, o card sai. O ícone é varredura (a pessoa procura a linha
//      do dado dela); a moldura cinza em volta é que era ruído.
//   3. CORPO GRANDE: type.corpoCurto (15/24) e título em type.secao / cartao.
//      O peso 800 de sete títulos virou peso 700/600 — negrito é hierarquia.
//   4. COLUNA DE LEITURA nos parágrafos de prosa (a seção "Como usamos" tem
//      onze seguidos) — é onde ela mais rende.
//
// ESTADO VAZIO: não existe nesta tela. Toda seção é uma lista FIXA escrita no
// código, nenhuma depende de dado da pessoa — nenhuma faixa pode ficar sem
// conteúdo. (A única parte variável é o texto de voz, que vem de
// voicePrivacyCopy e é sempre uma string.)
function PrivacyRow({ icon, text }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <Text style={styles.rowText}>{text}</Text>
    </View>
  );
}

// TELA DE POLÍTICA — toda frase daqui é conferida contra o código antes de
// entrar, e vale nos três idiomas (o revisor do Google lê em inglês; até
// 19/08/2026 esta tela inteira era só português, dentro de um app traduzido).
// Os recibos de cada afirmação:
//   · Diário: deleteAllCoupleData (lib/coupleData.js) NÃO apaga cosmic-journal,
//     de propósito — então o alerta diz, com todas as letras, que ele FICA.
//   · Cidade: CityPickerModal recebe birthDate/birthTime nas TRÊS telas que o
//     abrem (OnboardingPerguntasScreen, QuizScreen, BirthChartScreen), então a
//     data e a hora saem no `at` da busca em todas elas — não só no Mapa Astral.
//   · Login: existem DOIS caminhos, e-mail/senha e Google (signInWithGoogle em
//     lib/supabaseClient.js, botão em LoginScreen.js).
//   · Comunidade: lib/socialClient.js publica em api.cosmicguide.cloud/api/social
//     com o token da conta. Ao excluir a conta, SocialAccountCleanup remove
//     perfil, posts, comentários, curtidas, follows e bloqueios ligados ao uuid.
//   · Push: lib/webPush.js manda endpoint + signo + sequência + a DATA do último
//     registro do Diário (nunca o texto), mais as chaves de criptografia da
//     inscrição do navegador.
//   · Leitura de IA: as rotas de IA (server-patches/src/http/server.js) mandam a
//     foto/texto pra Anthropic e devolvem a interpretação — não gravam nada em
//     banco nem em disco por padrão, e o log só diz "sucesso". Quando a pessoa
//     ativa a Memória Cósmica, um trecho das NOVAS mensagens dela ao Órbi
//     pode ficar no backend até ser apagada; nunca o Diário nem a resposta da IA.
//   · Voz neural: ao tocar em Ouvir, o texto da leitura vai ao nosso backend e
//     à ElevenLabs. A conta precisa estar confirmada; guardamos a contagem
//     diária e um cache temporário do MP3 identificado por hash por até 24h.
//   · Denúncia e bloqueio (moderationRoutes.js, migrações 016/018): a denúncia
//     grava o motivo, o conteúdo necessário e os ids enquanto a conta existe.
//     SocialAccountCleanup apaga os bloqueios e anonimiza a denúncia em relação
//     à conta excluída: ids e detalhes livres saem; se o alvo era a conta
//     apagada, a cópia do conteúdo dela também sai.
// Sem contagem no texto ("existem duas exceções"): número em política de
// privacidade desmente sozinho na primeira feature nova — a lista fala por si.
export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { clearAll } = useCouple();
  const { t, lang = 'pt' } = useLanguage();
  const voicePrivacy = voicePrivacyCopy(lang);

  // O e-mail no corpo do texto é pintado de cor de link mas não é tocável —
  // este botão abre o app de e-mail de verdade (mesma correção do
  // HelpSupportScreen, que usa a mesma constante).
  const abrirEmail = () => Linking.openURL(SUPPORT_MAILTO);

  function confirmDelete() {
    Alert.alert(t('privacy.delete.title'), t('privacy.delete.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('privacy.delete.confirm'),
        style: 'destructive',
        onPress: async () => {
          await clearAll();
          navigation.popToTop();
        },
      },
    ]);
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={t('privacy.header.title')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAIXA 1 — O QUE FICA NO APARELHO. Ameixa: é a faixa principal, a
            resposta que a pessoa abriu esta tela pra achar. paddingTop 0
            porque o GradientHeader já dá a folga de cima; a onda cheia fica
            (são oito linhas, a entrada que a seção merece). */}
        <FaixaCurva tom="ameixa" semente="privacidade-aparelho" estiloCorpo={styles.faixaAbertura}>
          <Text style={styles.sectionTitle}>{t('privacy.local.title')}</Text>
          <PrivacyRow icon="people" text={t('privacy.local.names')} />
          <PrivacyRow icon="calendar" text={t('privacy.local.dates')} />
          <PrivacyRow icon="time" text={t('privacy.local.times')} />
          <PrivacyRow icon="location" text={t('privacy.local.city')} />
          <PrivacyRow icon="planet" text={t('privacy.local.signs')} />
          <PrivacyRow icon="compass" text={t('privacy.local.intent')} />
          <PrivacyRow icon="chatbubbles" text={t('privacy.local.chat')} />
          <PrivacyRow icon="journal" text={t('privacy.local.journal')} />
        </FaixaCurva>

        {/* FAIXA 2 — O QUE SAI DAQUI. Noite (ardósia): o chão que separa sem
            colorir, e é a faixa mais longa da tela (dez leituras de IA + a
            medição de funil + a nota). As duas seções vivem no MESMO chão de
            propósito: são o mesmo assunto pra quem lê — dado que atravessa a
            rede. O chão mudou; o título de cada uma continua separando. */}
        <FaixaCurva tom="noite" semente="privacidade-rede" grude="ameixa">
          <Text style={styles.sectionTitle}>{t('privacy.ai.title')}</Text>
          <PrivacyRow icon="hand-left" text={t('privacy.ai.palm')} />
          <PrivacyRow icon="person" text={t('privacy.ai.face')} />
          <PrivacyRow icon="walk" text={t('privacy.ai.foot')} />
          <PrivacyRow icon="scan" text={t('privacy.ai.moles')} />
          <PrivacyRow icon="cafe" text={t('privacy.ai.coffee')} />
          <PrivacyRow icon="moon" text={t('privacy.ai.dream')} />
          <PrivacyRow icon="chatbubbles" text={t('privacy.ai.chat')} />
          <PrivacyRow icon="sparkles" text={t('privacy.ai.memory')} />
          <PrivacyRow icon="sparkles" text={t('privacy.ai.weekly')} />
          <PrivacyRow icon="mic" text={t('privacy.ai.voice')} />

          {/* Rastreamento próprio de funil (lib/funnel.js → POST /api/track).
              Esta seção existe porque a tela de LGPD tem que descrever TODO
              tratamento de dado, e passou a existir um que não estava aqui: o
              app manda pro nosso servidor um registro de "o que aconteceu"
              (abriu, viu o paywall, clicou em assinar), sem nada do que a pessoa
              escreve ou informa. Medir sem contar que mede é justamente o que a
              LGPD chama de tratamento sem transparência. */}
          <Text style={[styles.sectionTitle, styles.tituloSeguinte]}>{t('privacy.track.title')}</Text>
          <PrivacyRow icon="footsteps" text={t('privacy.track.steps')} />
          <PrivacyRow icon="shuffle" text={t('privacy.track.code')} />
          <PrivacyRow icon="globe" text={t('privacy.track.country')} />
          <PrivacyRow icon="eye-off" text={t('privacy.track.noContent')} />
          {/* A nota que explica a medição: prosa, então coluna de leitura. O
              card solto de marginTop negativo que a grudava na lista saiu — o
              espaço faz isso agora. */}
          <ColunaLeitura style={styles.colunaNota}>
            <Text style={styles.paragraph}>{t('privacy.track.note')}</Text>
          </ColunaLeitura>
        </FaixaCurva>

        {/* FAIXA 3 — COMO USAMOS e SEUS DIREITOS. Violeta: é a seção que
            precisa se destacar das vizinhas, porque é a única em PROSA — onze
            parágrafos seguidos, o trecho mais denso da tela. Coluna de leitura
            em todos, que é exatamente o caso que ela resolve. */}
        <FaixaCurva tom="violeta" semente="privacidade-uso" grude="noite">
          <Text style={styles.sectionTitle}>{t('privacy.use.title')}</Text>
          <ColunaLeitura>
            <Text style={styles.paragraph}>{t('privacy.use.localFirst')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.exceptionCheckout')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.exceptionCity')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.account')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.ai')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.memory')}</Text>
            <Text style={styles.paragraph}>{voicePrivacy.data}</Text>
            <Text style={styles.paragraph}>{voicePrivacy.process}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.social')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.report')}</Text>
            <Text style={styles.paragraphFim}>{t('privacy.use.push')}</Text>
          </ColunaLeitura>

          <Text style={[styles.sectionTitle, styles.tituloSeguinte]}>{t('privacy.rights.title')}</Text>
          <PrivacyRow icon="eye" text={t('privacy.rights.access')} />
          <PrivacyRow icon="create" text={t('privacy.rights.fix')} />
          <PrivacyRow icon="trash-bin" text={t('privacy.rights.erase')} />
          <PrivacyRow icon="information-circle" text={t('privacy.rights.sharing')} />
        </FaixaCurva>

        {/* FAIXA 4 — o contato e a exclusão da conta. Dourado: o chão quente do
            epílogo. Os dois botões (falar com a gente, apagar tudo) vivem aqui
            porque são a única AÇÃO da tela — o resto é leitura. */}
        <FaixaCurva tom="dourado" semente="privacidade-contato" grude="violeta">
          <Text style={styles.sectionTitle}>{t('privacy.contact.title')}</Text>
          <ColunaLeitura>
            <Text style={styles.paragraph}>
              {t('privacy.contact.intro')} <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>.
            </Text>
            <Text style={styles.paragraphFim}>{t('privacy.contact.retention')}</Text>
          </ColunaLeitura>

          <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={abrirEmail}>
            <Ionicons name="mail" size={16} color="#fff" />
            <Text style={styles.contactBtnText}>{t('support.emailCta')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerBtn} onPress={confirmDelete} activeOpacity={0.85}>
            <Ionicons name="trash" size={18} color="#fff" />
            <Text style={styles.dangerBtnText}>{t('privacy.delete.cta')}</Text>
          </TouchableOpacity>
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // As faixas sangram de ponta a ponta e trazem o próprio paddingHorizontal.
  content: { paddingBottom: space.fimDaLista },
  faixaAbertura: { paddingTop: 0 },
  sectionTitle: { ...type.secao, color: colors.text, marginBottom: space.junto },
  // `ar` antes do segundo título DENTRO da mesma faixa: sem chão novo pra
  // separar, o silêncio é o que diz "outro assunto".
  tituloSeguinte: { marginTop: space.ar },
  // O espaço entre as linhas É a divisória — o fio de 1px saiu com o card.
  row: { flexDirection: 'row', alignItems: 'center', marginTop: space.bloco },
  rowIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: space.dentro,
  },
  rowText: { ...type.corpoCurto, color: colors.textSecondary, flex: 1 },
  paragraph: { ...type.corpoCurto, color: colors.textSecondary, marginBottom: space.bloco },
  paragraphFim: { ...type.corpoCurto, color: colors.textSecondary },
  colunaNota: { marginTop: space.entre, paddingHorizontal: 0 },
  emailText: { color: colors.accent },
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    backgroundColor: colors.accent, borderRadius: 12,
    paddingVertical: space.dentro, marginTop: space.entre,
  },
  contactBtnText: { ...type.botao, color: '#fff' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    backgroundColor: colors.red, borderRadius: 14,
    paddingVertical: space.bloco, marginTop: space.bloco,
  },
  dangerBtnText: { ...type.botao, color: '#fff' },
});
