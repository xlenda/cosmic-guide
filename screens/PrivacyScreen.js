import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Alert } from '../lib/webAlert';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../lib/supportContact';
import { voicePrivacyCopy } from '../lib/voiceCopy';

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
//     banco nem em disco, e o log só diz "sucesso". O que sobra é a linha diária
//     de ai_usage (endpoint + contagem). Por isso o texto promete só o que dá
//     pra provar aqui ("o NOSSO servidor não guarda") e não afirma nada sobre o
//     que a Anthropic mantém, que não está sob o nosso controle.
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
        <Text style={styles.sectionTitle}>{t('privacy.local.title')}</Text>
        <View style={styles.card}>
          <PrivacyRow icon="people" text={t('privacy.local.names')} />
          <PrivacyRow icon="calendar" text={t('privacy.local.dates')} />
          <PrivacyRow icon="time" text={t('privacy.local.times')} />
          <PrivacyRow icon="location" text={t('privacy.local.city')} />
          <PrivacyRow icon="planet" text={t('privacy.local.signs')} />
          <PrivacyRow icon="compass" text={t('privacy.local.intent')} />
          <PrivacyRow icon="chatbubbles" text={t('privacy.local.chat')} />
          <PrivacyRow icon="journal" text={t('privacy.local.journal')} last />
        </View>

        <Text style={styles.sectionTitle}>{t('privacy.ai.title')}</Text>
        <View style={styles.card}>
          <PrivacyRow icon="hand-left" text={t('privacy.ai.palm')} />
          <PrivacyRow icon="person" text={t('privacy.ai.face')} />
          <PrivacyRow icon="walk" text={t('privacy.ai.foot')} />
          <PrivacyRow icon="scan" text={t('privacy.ai.moles')} />
          <PrivacyRow icon="cafe" text={t('privacy.ai.coffee')} />
          <PrivacyRow icon="moon" text={t('privacy.ai.dream')} />
          <PrivacyRow icon="chatbubbles" text={t('privacy.ai.chat')} />
          <PrivacyRow icon="sparkles" text={t('privacy.ai.weekly')} />
          <PrivacyRow icon="mic" text={t('privacy.ai.voice')} last />
        </View>

        {/* Rastreamento próprio de funil (lib/funnel.js → POST /api/track).
            Esta seção existe porque a tela de LGPD tem que descrever TODO
            tratamento de dado, e passou a existir um que não estava aqui: o
            app manda pro nosso servidor um registro de "o que aconteceu"
            (abriu, viu o paywall, clicou em assinar), sem nada do que a pessoa
            escreve ou informa. Medir sem contar que mede é justamente o que a
            LGPD chama de tratamento sem transparência. */}
        <Text style={styles.sectionTitle}>{t('privacy.track.title')}</Text>
        <View style={styles.card}>
          <PrivacyRow icon="footsteps" text={t('privacy.track.steps')} />
          <PrivacyRow icon="shuffle" text={t('privacy.track.code')} />
          <PrivacyRow icon="globe" text={t('privacy.track.country')} />
          <PrivacyRow icon="eye-off" text={t('privacy.track.noContent')} last />
        </View>
        <View style={[styles.card, { marginTop: -14 }]}>
          <View style={styles.cardPad}>
            <Text style={[styles.paragraph, { marginBottom: 0 }]}>{t('privacy.track.note')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('privacy.use.title')}</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>{t('privacy.use.localFirst')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.exceptionCheckout')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.exceptionCity')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.account')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.ai')}</Text>
            <Text style={styles.paragraph}>{voicePrivacy.data}</Text>
            <Text style={styles.paragraph}>{voicePrivacy.process}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.social')}</Text>
            <Text style={styles.paragraph}>{t('privacy.use.report')}</Text>
            <Text style={[styles.paragraph, { marginBottom: 0 }]}>{t('privacy.use.push')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('privacy.rights.title')}</Text>
        <View style={styles.card}>
          <PrivacyRow icon="eye" text={t('privacy.rights.access')} />
          <PrivacyRow icon="create" text={t('privacy.rights.fix')} />
          <PrivacyRow icon="trash-bin" text={t('privacy.rights.erase')} />
          <PrivacyRow icon="information-circle" text={t('privacy.rights.sharing')} last />
        </View>

        <Text style={styles.sectionTitle}>{t('privacy.contact.title')}</Text>
        <View style={styles.card}>
          <View style={styles.cardPad}>
            <Text style={styles.paragraph}>
              {t('privacy.contact.intro')} <Text style={styles.emailText}>{SUPPORT_EMAIL}</Text>.
            </Text>
            <Text style={[styles.paragraph, { marginBottom: 0 }]}>{t('privacy.contact.retention')}</Text>
            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8} onPress={abrirEmail}>
              <Ionicons name="mail" size={16} color="#fff" />
              <Text style={styles.contactBtnText}>{t('support.emailCta')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.dangerBtn} onPress={confirmDelete} activeOpacity={0.85}>
          <Ionicons name="trash" size={18} color="#fff" />
          <Text style={styles.dangerBtnText}>{t('privacy.delete.cta')}</Text>
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
  contactBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, marginTop: 4,
  },
  contactBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.red, borderRadius: 14, paddingVertical: 14, marginTop: 4,
  },
  dangerBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
