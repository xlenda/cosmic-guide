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
import OfferSummary from './OfferSummary';

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
        {/* Substitui a linha `gate.teaser.price`, que trazia o preço DIGITADO
            DE NOVO ("$5 USD/mês · 7 dias grátis"): dois lugares com o mesmo
            número é o jeito garantido de um dia mudarem um e esquecerem o
            outro. OfferSummary lê a MESMA chave do card do plano Mensal em
            Planos (planos.plan.trial.detail) e ainda acrescenta o que faltava
            aqui — que dá pra cancelar quando quiser. A chave antiga fica no
            dicionário, sem uso, pra não mexer em tradução alheia. */}
        <OfferSummary compact style={styles.teaserOffer} testID="gate-teaser-offer" />
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
// ESTA tela específica).
//
// HIERARQUIA INVERTIDA em 29/07/2026 — o botão PRINCIPAL era "Assinar agora",
// mas assinar sozinho NÃO abre nenhuma destas 5 telas: withFeatureGate testa
// hasCoupleAccess, que exige o casal formado (ver CoupleContext.js e o
// comentário de SOLO_BENEFIT_KEYS em PlanosScreen.js). Ou seja, o CTA mais
// destacado da tela vendia exatamente aquilo que a compra não entregava — a
// pessoa pagava e continuava vendo este mesmo cartão. Agora o principal é
// convidar o par (o único caminho que realmente destrava), "Assinar" desce
// pra secundário e ganha uma linha honesta dizendo o que cada coisa abre.
// Cheguei a tentar o mesmo véu-sobre-conteúdo do
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
        {/* PESO IGUAL — decisão do dono (29/07/2026), consultado justamente
            porque as duas leituras eram defensáveis:
              · "Convidar" primário = o único caminho que abre ESTA tela
                (withFeatureGate exige hasCoupleAccess, que não existe sem
                casal formado), mas empurra pra ação grátis;
              · "Assinar" primário = o botão que gera receita, mas prometia o
                que não entrega.
            O dono escolheu os dois no mesmo peso, com o texto deixando claro
            que a tela precisa dos dois. Nenhum dos botões some, nenhum vira
            fantasma, e a nota honesta abaixo explica o que cada um resolve.

            O convite passa pelo Quiz do casal antes de virar link: é lá que
            voce/amor/sa/sb são preenchidos, e sem eles lib/coupleInvite.js
            shareInvite não tem o que compartilhar. */}
        <View style={styles.dualCtaRow}>
          <TouchableOpacity
            style={[styles.btn, styles.dualCta]}
            activeOpacity={0.85}
            testID="gate-solo-invite-cta"
            onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
          >
            <Text style={styles.btnText} numberOfLines={2}>{t('gate.solo.invitePrimaryCta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.dualCta]}
            activeOpacity={0.85}
            testID="gate-solo-subscribe-cta"
            onPress={() => navigation.navigate(ROUTES.PLANOS)}
          >
            <Text style={styles.btnText} numberOfLines={2}>{t('gate.solo.cta')}</Text>
          </TouchableOpacity>
        </View>
        {/* A nota honesta continua: é ela que separa "o que a assinatura abre"
            de "o que só o convite abre". Sem isso, dois botões de peso igual
            viram duas promessas iguais — e uma delas seria falsa. */}
        <Text style={styles.honestNote}>{t('gate.solo.subscribeNote')}</Text>
        <Text style={styles.hint}>{t('gate.solo.inviteHint')}</Text>
        <OfferSummary compact style={styles.soloOffer} testID="gate-solo-offer" />
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
  text: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 14 },
  // O respiro de baixo já vem do marginTop do botão — sem isso o cartão do solo
  // ficaria com um vão duplo entre a oferta e o CTA.
  soloOffer: { marginTop: 18, marginBottom: 0 },
  btn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 28, marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  // Os dois CTAs de peso igual (decisão do dono). `flex: 1` nos dois garante
  // MESMA largura independente do tamanho do texto — sem isso "Assinar agora"
  // ficaria menor que "Convidar meu par" e voltaria a existir hierarquia
  // visual, que é justamente o que a decisão pediu pra não haver.
  dualCtaRow: { flexDirection: 'row', alignSelf: 'stretch', gap: 10 },
  dualCta: {
    flex: 1, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center',
    // minHeight pra os dois casarem quando um texto quebra em 2 linhas e o
    // outro não — sem isso um botão fica visivelmente mais alto que o irmão.
    minHeight: 52,
  },
  // Linha de expectativa logo abaixo do CTA principal (o que acontece ao
  // tocar). Menor e mais apagada que o botão de propósito — informa sem
  // competir, mesmo padrão do loginNote em PlanosScreen.js.
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 10 },
  // Separa visualmente as duas ofertas do cartão (convite grátis × assinatura),
  // pra ninguém ler o preço logo abaixo do botão de convidar e achar que
  // convidar custa.
  divider: { height: 1, alignSelf: 'stretch', backgroundColor: colors.border, marginTop: 20 },
  honestNote: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 18 },
  // Botão fantasma (mesma linguagem do btnGhost em PlanosScreen.js): agora que
  // "Assinar" é o segundo caminho, ele precisa continuar parecendo um BOTÃO —
  // como texto de 12px solto embaixo da nota honesta ele sumiria. Contorno em
  // vez de preenchimento é o que mantém a hierarquia sem escondê-lo.
  secondaryBtn: {
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 22,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
  },
  secondaryBtnText: { color: colors.text, fontSize: 13, fontWeight: '700' },

  teaserWrap: {
    position: 'absolute', left: 0, right: 0, bottom: 0, height: '46%',
    alignItems: 'center', justifyContent: 'flex-end',
  },
  teaserFade: { ...StyleSheet.absoluteFillObject },
  // Mesma lógica do soloOffer: o vão até o botão é do próprio botão.
  teaserOffer: { marginTop: 8, marginBottom: 0 },
  teaserCard: {
    alignItems: 'center', paddingHorizontal: 28, paddingBottom: 36, paddingTop: 12, width: '100%',
  },
});
