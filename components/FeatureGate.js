// Gate de feature para as telas exclusivas de assinantes (casal) — mesma altitude
// que o FeatureGate do funil web (gilfforever/web/app/(app)/layout.js): aplicado
// na borda da rota (Stack.Screen), não dentro de cada tela.
//
// Sem blur-behind-real-content (exigiria montar a tela real, com estado, só para
// esmaecer por cima — caro e expo-blur nem está instalado). Em vez disso, um
// card de estado bloqueado, reaproveitando a linguagem visual do `locked` já
// parcialmente construído em FeatureCard.js (badge de cadeado + gradiente).
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';

// Véu de assinatura: fica colado na parte de baixo da tela, por cima do
// conteúdo real (que continua rodando e interativo por trás, atrás do
// gradiente). Não veda com um sólido — o degradê deixa o topo do conteúdo
// visível e "sangrando" por trás, de propósito: cria curiosidade (a pessoa vê
// e usa o começo de verdade) sem deixar avançar até o fim. Substitui o
// esquema antigo de "1ª visita grátis inteira, trava da 2ª em diante"
// (pedido explícito do Lenda, 25/07/2026 — queria que desse pra começar a
// usar mas travasse no meio do caminho, não tudo ou nada).
export function SubscribeTeaser() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  // 7º degrau do funil: "bateu no paywall". É AQUI, e não só na tela de
  // Planos, que a maioria encontra o muro — este véu é o que barra a pessoa no
  // meio da tela. Sem medir o gate, o relatório mostraria "ninguém viu o
  // paywall" enquanto todo mundo esbarra nele.
  // Efeito no MOUNT, nunca no corpo do componente: este teaser re-renderiza a
  // cada mudança de hasAccess/hasCoupleAccess do CoupleContext — que se
  // recheca sozinho a cada 5 min e a cada volta pro primeiro plano — e viraria
  // um evento por re-render. O dedupe de lib/funnel.js (chave
  // 'paywall_view:gate:<rota>') fecha o resto.
  useEffect(() => {
    funnel.paywallView('gate', route?.name);
  }, [route?.name]);
  return (
    <View style={styles.teaserWrap} pointerEvents="box-none">
      <LinearGradient colors={['transparent', colors.background]} style={styles.teaserFade} pointerEvents="none" />
      <View style={styles.teaserCard}>
        <View style={styles.sealWrap}>
          <Ionicons name="lock-closed" size={24} color={colors.gold} />
        </View>
        <Text style={styles.title}>{t('gate.teaser.title')}</Text>
        <Text style={styles.price}>{t('gate.teaser.price')}</Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(ROUTES.PLANOS)}
        >
          <Text style={styles.btnText}>{t('gate.teaser.cta')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Solo (sem par) vê um cartão de TELA CHEIA com a copy específica da tela +
// as DUAS opções juntas — assinar sozinho (desbloqueia as 9 leituras
// individuais, não estas telas) e convidar o par (única forma de desbloquear
// ESTA tela específica). Cheguei a tentar o mesmo véu-sobre-conteúdo do
// SubscribeTeaser aqui, mas não funciona pra solo: todas as telas de casal
// têm um guard próprio `if (!voce || !amor)` que troca o conteúdo real por um
// cartão "Complete o quiz do casal primeiro" — o resultado era esse cartão
// genérico duplicado embaixo do véu, com o ícone do teaser sobreposto ao
// botão dele (achado real de auditoria adversarial, confirmado em screenshot
// nas 5 telas, 26/07/2026). Sem conteúdo real pra espiar, o véu só gerava
// bagunça — o cartão único com copy específica da tela comunica melhor.
export function SoloTeaser({ title, description }) {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  // Mesmo degrau (paywall_view) pelo outro caminho do gate: quem está solo vê
  // este cartão de tela cheia em vez do véu. Mesma chave de dedupe ('gate'),
  // porque para o funil os dois são "bateu no muro da assinatura".
  useEffect(() => {
    funnel.paywallView('gate', route?.name);
  }, [route?.name]);
  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.card} style={styles.card}>
        <View style={styles.sealWrap}>
          <Ionicons name="people" size={24} color={colors.gold} />
        </View>
        <Text style={styles.title}>{title || t('gate.solo.title')}</Text>
        <Text style={styles.text}>
          {description || t('gate.solo.text')}
        </Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(ROUTES.PLANOS)}
        >
          <Text style={styles.btnText}>{t('gate.solo.cta')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
        >
          <Text style={styles.secondaryBtnText}>{t('gate.solo.inviteCta')}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

// HOC — dono do produto logado (isOwnerAccount) vê a tela real direto, sem
// nenhum bloqueio, pra poder revisar o conteúdo sem precisar assinar; depois
// disso, casal com hasAccess=true renderiza a tela normalmente. hasAccess é
// otimista (default true) até o contexto confirmar com o servidor, então
// nunca pisca um bloqueio falso pra quem já tem acesso.
//
// Casal SEM acesso: a tela real monta e roda por baixo (sem featureKey, sem
// AsyncStorage, sem "1 uso grátis" — esse rastreamento foi removido daqui
// porque tinha um bug real: marcava o uso no mount, não no uso de fato, e
// podia queimar a prévia de um assinante de verdade numa instabilidade de
// rede), com o SubscribeTeaser colado por cima.
//
// Solo: NÃO monta a tela real — o guard `if (!voce || !amor)` dela renderia
// só o cartão "Complete o quiz do casal", duplicando a mensagem e brigando
// visualmente com o teaser (ver comentário do SoloTeaser acima) — mostra
// direto o SoloTeaser em tela cheia com a copy específica.
//
// options.title/description (opcional): copy específica da tela — passada em
// cada Stack.Screen (App.js), pra o teaser de solo nomear o que tem ali em vez
// de um texto genérico igual pras 5 rotas.
export function withFeatureGate(Screen, options = {}) {
  return function GatedScreen(props) {
    // hasCoupleAccess (não hasAccess) — hasAccess combinado incluiria uma
    // assinatura SOLO, que não deve desbloquear estas 5 telas exclusivas de
    // casal (ver comentário em CoupleContext.js).
    const { coupleData, hasCoupleAccess, isOwnerAccount } = useCouple();
    const isCouple = !!coupleData;

    if (isOwnerAccount || hasCoupleAccess) return <Screen {...props} />;

    if (!isCouple) {
      return <SoloTeaser title={options.title} description={options.description} />;
    }

    return (
      <View style={{ flex: 1 }}>
        <Screen {...props} />
        <SubscribeTeaser />
      </View>
    );
  };
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', padding: 20 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 28,
    alignItems: 'center',
  },
  sealWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,200,92,0.15)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  price: { color: colors.gold, fontSize: 13, fontWeight: '700', marginTop: 8 },
  text: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 14 },
  btn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 12 },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },

  teaserWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%',
    alignItems: 'center', justifyContent: 'flex-end',
  },
  teaserFade: { ...StyleSheet.absoluteFillObject },
  teaserCard: {
    alignItems: 'center', paddingHorizontal: 28, paddingBottom: 36, paddingTop: 12, width: '100%',
  },
});
