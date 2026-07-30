// components/OneTimeLock.js
// Tela de bloqueio mostrada no lugar de uma feature gratuita depois que a
// pessoa já usou sua 1 vez grátis (lib/featureUsage.js) e não tem assinatura
// ativa (hasAccess === false). Solo e casal assinam do mesmo jeito hoje
// (CoupleContext.js checa os dois em paralelo, ver lib/coupleData.js
// initiateSoloCheckout/checkSoloSubscriptionStatus) — por isso "Assinar
// agora" é sempre o CTA principal, pra qualquer um dos dois. Solo (sem
// coupleData) ganha um segundo CTA menor "convidar meu par", já que formar
// casal também desbloqueia as 5 telas exclusivas de casal (Reconectar/
// Descobrir/Agir/Progresso/Retrospectiva) — pedido explícito do Lenda
// (25/07/2026): sempre oferecer as duas opções juntas, nunca só uma.
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import { funnel } from '../lib/funnel';
import GradientHeader from './GradientHeader';
import OfferSummary from './OfferSummary';

// VARIANTES (30/07/2026) — o paywall deixou de existir só no aparelho.
// Agora o SERVIDOR também pode negar uma leitura (cota grátis por CONTA,
// server-patches/src/http/aiQuota.js), e o motivo muda o que faz sentido
// pedir na tela:
//
//   'freeUsed' (padrão) — o que sempre existiu: a marca local de 1 uso grátis
//                         (lib/featureUsage.js). Texto e CTA intocados; o
//                         teste E2E tests/e2e/paywall/one-time-lock.spec.js
//                         trava exatamente este caminho.
//   'quota'            — o servidor respondeu 402: a cota grátis DA CONTA
//                         acabou. Muda só o texto (não adianta dizer "limpe o
//                         app e tente de novo" — não volta mais), o CTA
//                         continua sendo assinar.
//   'login'            — o servidor respondeu 401 login_required: as leituras
//                         com FOTO exigem conta. Aqui o próximo passo NÃO é
//                         pagar, é criar conta (que é de graça) — mandar essa
//                         pessoa direto pra Planos seria pedir cartão de quem
//                         ainda nem experimentou.
const VARIANTES = {
  freeUsed: {
    titulo: (f) => `Você já usou sua leitura gratuita de ${f}`,
    texto: {
      couple:
        'Assine o Cosmic Guide e continue usando esse e todos os outros recursos sem limite, você e seu par.',
      solo: 'Assine o Cosmic Guide e continue usando esse e todos os outros recursos individuais sem limite.',
    },
    cta: 'Assinar agora',
    mostraOferta: true,
  },
  quota: {
    titulo: (f) => `Suas leituras gratuitas de ${f} acabaram`,
    texto: {
      couple:
        'A cota gratuita fica na sua conta, não no aparelho. Assine o Cosmic Guide e continue sem limite, você e seu par.',
      solo: 'A cota gratuita fica na sua conta, não no aparelho. Assine o Cosmic Guide e continue sem limite.',
    },
    cta: 'Assinar agora',
    mostraOferta: true,
  },
  login: {
    titulo: (f) => `Entre na sua conta para usar ${f}`,
    texto: {
      couple: 'As leituras com foto pedem uma conta — é grátis, leva menos de um minuto e guarda seu histórico.',
      solo: 'As leituras com foto pedem uma conta — é grátis, leva menos de um minuto e guarda seu histórico.',
    },
    cta: 'Criar conta / entrar',
    // Sem preço nesta tela: quem ainda não tem conta não deve topar com um
    // valor antes de ter experimentado nada.
    mostraOferta: false,
  },
};

export default function OneTimeLock({ featureTitle, gradient = gradients.hero, variant = 'freeUsed' }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { coupleData } = useCouple();
  const isCouple = !!coupleData;
  const v = VARIANTES[variant] || VARIANTES.freeUsed;

  // 7º degrau do funil pelo terceiro caminho: a leitura grátis vitalícia
  // acabou. Este é provavelmente o muro mais comum de todos (as 9 leituras
  // individuais passam por aqui), e distinguir 'onetime_lock' de 'gate' e de
  // 'planos' é o que vai dizer QUAL muro está segurando as pessoas.
  // `featureTitle` é texto de UI traduzido e NÃO vai junto — só o nome da rota
  // (slug curto e estável), pra props nunca carregar conteúdo/tradução.
  // O nome do degrau distingue a origem: 'onetime_lock' (marca local),
  // 'server_quota' (402 do servidor) e 'login_wall' (401 nas rotas com foto).
  // Sem separar, o relatório do funil (scripts/funil.js) somaria três muros
  // muito diferentes num número só — e é justamente pra saber QUAL muro segura
  // as pessoas que este evento existe.
  const degrauDoFunil =
    variant === 'quota' ? 'server_quota' : variant === 'login' ? 'login_wall' : 'onetime_lock';

  useEffect(() => {
    funnel.paywallView(degrauDoFunil, route?.name);
  }, [degrauDoFunil, route?.name]);

  // Chat (ROUTES.CHAT_TAB) é uma aba direta, sem Stack aninhada dentro dela
  // (App.js: <Tab.Screen name={CHAT_TAB} component={ChatScreen} />, sem
  // ChatStack) — diferente das outras 8 telas, que vivem dentro de HomeStack/
  // TarotStack. Nelas, `navigation` é o navigator da Stack e getParent() sobe
  // pro Tab.Navigator corretamente; no Chat, `navigation` JÁ é o próprio
  // Tab.Navigator (é a raiz), então getParent() devolve undefined e o
  // `?.navigate` nunca disparava — botão "Assinar"/"Convidar par" não fazia
  // nada no Chat (achado real de bug, 25/07/2026). navigateFromTab cai pro
  // `navigation` direto quando não há parent.
  const navigateFromTab = (...args) => (navigation.getParent() || navigation).navigate(...args);

  return (
    <View style={styles.root} testID="onetimelock-container">
      <GradientHeader title={featureTitle} onBack={() => navigation.goBack()} gradient={gradient} />
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={40} color={colors.accent} />
        </View>
        <Text style={styles.title} testID="onetimelock-title">{v.titulo(featureTitle)}</Text>
        <Text style={styles.text}>{isCouple ? v.texto.couple : v.texto.solo}</Text>
        {/* A oferta inteira AQUI, sem sair da tela: preço de entrada, 7 dias
            grátis e cancelamento livre. Antes esta tela só dizia "assine" e o
            primeiro número da vida da pessoa aparecia uma navegação depois, em
            Planos — este é o muro mais comum de todos (as 9 leituras
            individuais passam por aqui), e era exatamente o que o testador
            fotografou sem entender quanto custava. O botão continua indo pra
            Planos; a diferença é que agora ela vai sabendo o preço. */}
        {v.mostraOferta && <OfferSummary testID="onetimelock-offer" />}
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          testID="onetimelock-cta"
          onPress={() =>
            navigateFromTab(ROUTES.HOME_TAB, {
              screen: variant === 'login' ? ROUTES.LOGIN : ROUTES.PLANOS,
            })
          }
        >
          <Text style={styles.btnText}>{v.cta}</Text>
        </TouchableOpacity>
        {variant !== 'login' && !isCouple && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            testID="onetimelock-invite-cta"
            onPress={() => navigateFromTab(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
          >
            <Text style={styles.secondaryBtnText}>ou convide seu par pra assinarem juntos →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  text: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 24 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: { marginTop: 16, paddingVertical: 6, paddingHorizontal: 12 },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
});
