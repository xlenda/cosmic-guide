import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import { Alert } from '../lib/webAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, setGoldThemeActive, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import { getTokenBalance, spendTokens } from '../lib/tokens';
import { addShield } from '../lib/streakShield';
import {
  grantSeloCosmico,
  redeemBonusTarotReadingWithTokens,
  grantGoldTheme,
  hasGoldTheme,
  grantBrinde,
  hasBrinde,
  getOwnedBrindes,
} from '../lib/cosmeticRewards';
import { addPinCredit } from '../lib/journal';
import { getBrindesDisponiveis, BRINDE_CONTEUDO } from '../lib/brindes';
import { CENAS } from '../lib/ilustracoes';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';

// Recompensas cosméticas/digitais do próprio app — nada físico, nada que
// prometa dinheiro real ou logística que ainda não existe. REGRA DURA: só
// entra na lista recompensa com efeito real implementado no handleRedeem
// (bug real de 25/07/2026: duas recompensas gastavam o token sem fazer nada).
// `webOnly` esconde a recompensa no nativo quando o efeito só existe na web
// (ex.: Tema Dourado, que depende de localStorage síncrono — ver theme.js).
// title/description são traduzidos (loja.reward.<id>.title/.description em
// lib/i18n.js) — mesmo esquema dos planos em PlanosScreen.js: o id é a chave,
// só custo/ícone/plataforma ficam aqui.
const REWARDS = [
  { id: 'selo-cosmico', cost: 50, icon: 'ribbon' },
  { id: 'destaque-diario', cost: 30, icon: 'bookmark' },
  { id: 'leitura-bonus', cost: 80, icon: 'sparkles' },
  { id: 'escudo-sequencia', cost: 60, icon: 'shield-checkmark' },
  { id: 'tema-dourado', cost: 150, icon: 'color-palette', webOnly: true },
];

const rewardTitle = (t, id) => t(`loja.reward.${id}.title`);

export default function LojaScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [redeeming, setRedeeming] = useState(null);
  // Guard SÍNCRONO contra toque duplo: `redeeming` é state (só atualiza no
  // re-render) — dois toques no mesmo frame passavam ambos pelo
  // `if (redeeming) return` e gastavam tokens 2x (auditoria 27/07/2026).
  // O ref muda na hora, dentro do mesmo tick.
  const redeemingRef = useRef(false);
  const [ownedBrindes, setOwnedBrindes] = useState({});
  const [brindeAberto, setBrindeAberto] = useState(null); // id do brinde com o conteúdo na tela

  // "Saldo insuficiente" pedia DUAS coisas concretas (leituras e missões
  // diárias) e não levava a nenhuma — o alerta tinha só um OK. As duas moram na
  // Home (cards de leitura + DailyMissionsCard), então o botão leva pra lá.
  // Salto de aba: a Loja está no ProfileStack, o destino está no HomeStack.
  const irGanharTokens = useCallback(() => {
    navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.HOME_MAIN });
  }, [navigation]);

  const alertaSemSaldo = useCallback(
    (texto) => {
      Alert.alert(t('loja.alert.noBalance.title'), texto, [
        { text: t('loja.alert.noBalance.cta'), onPress: irGanharTokens },
        { text: t('loja.alert.noBalance.dismiss'), style: 'cancel' },
      ]);
    },
    [t, irGanharTokens]
  );

  // Falha de persistência não pode parecer sucesso. Quando o crédito do
  // bônus falha, a saga em lib/tokens estorna primeiro; este alerta diz
  // exatamente o que foi (ou não foi) confirmado no aparelho.
  const alertaFalhaEntrega = useCallback(
    (result, cost) => {
      setBalance(result.balance);
      if (result.reason === 'storage_error') {
        Alert.alert(t('loja.alert.storageError.title'), t('loja.alert.storageError.text'));
        return;
      }
      Alert.alert(
        t('loja.alert.deliveryFailed.title'),
        t(
          result.refunded
            ? 'loja.alert.deliveryFailed.refundedText'
            : 'loja.alert.deliveryFailed.unconfirmedText',
          { cost, balance: result.balance }
        )
      );
    },
    [t]
  );

  const load = useCallback(() => {
    getTokenBalance().then(setBalance);
    getOwnedBrindes().then(setOwnedBrindes);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleRedeem(reward) {
    if (redeemingRef.current) return;
    redeemingRef.current = true;
    try {
      // Tema dourado é compra ÚNICA — recusa antes de gastar token de novo
      // (quem já tem liga/desliga de graça no Perfil).
      if (reward.id === 'tema-dourado' && (await hasGoldTheme())) {
        Alert.alert(t('loja.alert.goldAlready.title'), t('loja.alert.goldAlready.text'));
        return;
      }
      setRedeeming(reward.id);
      const title = rewardTitle(t, reward.id);
      const result =
        reward.id === 'leitura-bonus'
          ? await redeemBonusTarotReadingWithTokens({
              cost: reward.cost,
              purchaseReason: title,
              refundReason: t('loja.refund.reason', { title }),
            })
          : await spendTokens(reward.cost, title);
      if (result.ok) {
        setBalance(result.balance);
        if (reward.id === 'escudo-sequencia') {
          const count = await addShield();
          Alert.alert(t('loja.alert.shield.title'), t('loja.alert.shield.text', { count }));
        } else if (reward.id === 'selo-cosmico') {
          await grantSeloCosmico();
          Alert.alert(t('loja.alert.seal.title'), t('loja.alert.seal.text'));
        } else if (reward.id === 'leitura-bonus') {
          const count = result.delivery;
          Alert.alert(t('loja.alert.bonusReading.title'), t('loja.alert.bonusReading.text', { count }));
        } else if (reward.id === 'destaque-diario') {
          await addPinCredit();
          Alert.alert(t('loja.alert.pin.title'), t('loja.alert.pin.text'));
        } else if (reward.id === 'tema-dourado') {
          await grantGoldTheme();
          setGoldThemeActive(true);
          Alert.alert(t('loja.alert.goldGranted.title'), t('loja.alert.goldGranted.text'), [
            {
              text: t('loja.alert.goldGranted.cta'),
              onPress: () => {
                // Volta pra RAIZ do app de propósito, não reload() da URL
                // atual — a rota interna (/Loja) não existe como arquivo no
                // servidor estático e daria 404 num reload cru.
                if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.href = '/cosmic-guide/';
              },
            },
          ]);
        } else {
          Alert.alert(t('loja.alert.redeemed.title'), t('loja.alert.redeemed.text', { title: rewardTitle(t, reward.id) }));
        }
      } else if (result.reason === 'delivery_failed' || result.reason === 'storage_error') {
        alertaFalhaEntrega(result, reward.cost);
      } else {
        alertaSemSaldo(t('loja.alert.noBalance.rewardText', { balance: result.balance, cost: reward.cost }));
      }
    } finally {
      redeemingRef.current = false;
      setRedeeming(null);
    }
  }

  // ---- Brindes (lib/brindes.js) --------------------------------------------
  // Mesma regra dura das REWARDS: todo resgate tem efeito real NA HORA.
  // 'conteudo' é compra única — quem já tem só reabre, sem cobrar de novo.
  async function handleRedeemBrinde(brinde) {
    if (redeemingRef.current) return;
    redeemingRef.current = true;
    try {
      await redeemBrindeInner(brinde);
    } finally {
      redeemingRef.current = false;
    }
  }

  async function redeemBrindeInner(brinde) {
    if (brinde.fisico) {
      // Inalcançável com BRINDES_FISICOS_ATIVOS=false (getBrindesDisponiveis
      // filtra), mas se a flag ligar sem o fluxo de endereço pronto, NUNCA
      // cobra token por promessa: avisa e sai.
      Alert.alert(t('loja.alert.physical.title'), t('loja.alert.physical.text'));
      return;
    }
    if (brinde.kind === 'conteudo' && (await hasBrinde(brinde.id))) {
      setBrindeAberto(brinde.id); // já é seu — abre de graça
      return;
    }
    setRedeeming(brinde.id);
    try {
      const title = t(`loja.brinde.${brinde.id}.title`);
      // O brinde da tiragem só vira "seu" depois de a Leitura Bônus prometida
      // ter sido persistida. Se isso falhar, a saga estorna e não grava posse.
      const result = brinde.grantsBonusReading
        ? await redeemBonusTarotReadingWithTokens({
            cost: brinde.cost,
            purchaseReason: title,
            refundReason: t('loja.refund.reason', { title }),
          })
        : await spendTokens(brinde.cost, title);
      if (!result.ok) {
        if (result.reason === 'delivery_failed' || result.reason === 'storage_error') {
          alertaFalhaEntrega(result, brinde.cost);
          return;
        }
        alertaSemSaldo(t('loja.alert.noBalance.brindeText', { balance: result.balance, cost: brinde.cost }));
        return;
      }
      setBalance(result.balance);
      if (brinde.kind === 'conteudo') {
        await grantBrinde(brinde.id);
        setOwnedBrindes(await getOwnedBrindes());
      }
      setBrindeAberto(brinde.id); // entrega imediata: conteúdo abre na hora
    } finally {
      setRedeeming(null);
    }
  }

  // Download real do wallpaper (só web — o brinde é webOnly, mesmo critério
  // do Tema Dourado: nunca vender efeito que a plataforma não entrega).
  function baixarWallpaper(w) {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const a = document.createElement('a');
    a.href = w.uri;
    a.download = `cosmic-guide-${w.arquivo}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const conteudoAberto = brindeAberto ? BRINDE_CONTEUDO[brindeAberto] : null;

  return (
    <View style={styles.root}>
      <GradientHeader title={t('loja.header.title')} subtitle={t('loja.header.subtitle')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cena do pack (lib/ilustracoes.js; full-bleed 09/08/2026) — baú de
            tesouro no topo da loja, acima do saldo e da grade. Deixou de ser
            card emoldurado: a arte SANGRA das bordas (margens negativas anulam
            o padding:20 do content), cola no header sem raio de canto, e o
            LinearGradient funde o terço inferior no fundo — o card de saldo
            pousa sobre o fim da arte (marginTop negativo no balanceWrap).
            Decorativa (accessible=false). */}
        <View style={styles.cenaWrap}>
          <Image source={CENAS.loja} style={styles.cenaImg} resizeMode="cover" accessible={false} />
          <LinearGradient colors={['transparent', colors.background]} style={styles.cenaFade} pointerEvents="none" />
        </View>
        <View style={styles.balanceWrap}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <Ionicons name="sparkles" size={26} color="#fff" />
            <Text style={styles.balanceValue}>{balance}</Text>
            <Text style={styles.balanceLabel}>{t('loja.balanceLabel')}</Text>
          </LinearGradient>
        </View>

        {/* FAIXA 1 — AS RECOMPENSAS. Sangra até as bordas com a mesma margem
            negativa que a cena do topo já usava pra anular o padding do
            content. Sem a faixa as duas seções corriam no mesmo chão e a Loja
            lia como uma lista só, com dois títulos no meio dela. */}
        <FaixaCurva tom="ameixa" semente="loja-recompensas" style={[styles.faixaSangra, styles.faixaPrimeira]} testID="loja-faixa-recompensas">
        <Text style={styles.sectionTitle}>{t('loja.sectionRewards')}</Text>
        {REWARDS.filter((r) => !r.webOnly || Platform.OS === 'web').map((reward) => {
          const affordable = balance >= reward.cost;
          const isRedeeming = redeeming === reward.id;
          return (
            <View key={reward.id} style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={reward.icon} size={22} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{t(`loja.reward.${reward.id}.title`)}</Text>
                <Text style={styles.cardDesc}>{t(`loja.reward.${reward.id}.description`)}</Text>
                <View style={styles.costRow}>
                  <Ionicons name="diamond" size={13} color={colors.gold} />
                  <Text style={styles.costText}>{t('loja.costTokens', { cost: reward.cost })}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, !affordable && styles.redeemBtnLow]}
                activeOpacity={0.8}
                onPress={() => handleRedeem(reward)}
                disabled={isRedeeming}
              >
                <Text style={styles.redeemBtnText}>{isRedeeming ? '...' : t('loja.redeem')}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        </FaixaCurva>

        {/* FAIXA 2 — OS BRINDES. Mimos do nicho (ritual, wallpapers, tiragem
            exclusiva) com entrega automática real — catálogo e regras em
            lib/brindes.js. Outro chão, outra onda: é outro tipo de coisa, e
            agora o olho vê isso sem precisar ler os dois títulos. */}
        <FaixaCurva tom="noite" semente="loja-brindes" grude="ameixa" style={styles.faixaSangra} testID="loja-faixa-brindes">
        <Text style={styles.sectionTitle}>{t('loja.sectionBrindes')}</Text>
        <Text style={styles.sectionSubtitle}>{t('loja.sectionBrindesSubtitle')}</Text>
        {getBrindesDisponiveis()
          .filter((b) => !b.webOnly || Platform.OS === 'web')
          .map((brinde) => {
            const owned = brinde.kind === 'conteudo' && !!ownedBrindes[brinde.id];
            const affordable = balance >= brinde.cost;
            const isRedeeming = redeeming === brinde.id;
            return (
              <View key={brinde.id} style={styles.card}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name={brinde.icon} size={22} color={colors.gold} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{t(`loja.brinde.${brinde.id}.title`)}</Text>
                  <Text style={styles.cardDesc}>{t(`loja.brinde.${brinde.id}.description`)}</Text>
                  <View style={styles.costRow}>
                    {owned ? (
                      <>
                        <Ionicons name="checkmark-circle" size={13} color={colors.green} />
                        <Text style={styles.ownedText}>{t('loja.owned')}</Text>
                      </>
                    ) : (
                      <>
                        <Ionicons name="diamond" size={13} color={colors.gold} />
                        <Text style={styles.costText}>{t('loja.costTokens', { cost: brinde.cost })}</Text>
                      </>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, !owned && !affordable && styles.redeemBtnLow]}
                  activeOpacity={0.8}
                  onPress={() => handleRedeemBrinde(brinde)}
                  disabled={isRedeeming}
                >
                  <Text style={styles.redeemBtnText}>{isRedeeming ? '...' : owned ? t('loja.open') : t('loja.redeem')}</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </FaixaCurva>
      </ScrollView>

      {/* Conteúdo do brinde resgatado — abre na hora do resgate e sempre que
          tocar em "Abrir" (compra única, sem cobrar de novo). */}
      <Modal visible={!!conteudoAberto} transparent animationType="slide" onRequestClose={() => setBrindeAberto(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>{conteudoAberto?.titulo}</Text>
              <TouchableOpacity onPress={() => setBrindeAberto(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {(conteudoAberto?.secoes || []).map((sec) => (
                <View key={sec.t} style={{ marginBottom: 14 }}>
                  <Text style={styles.modalSectionTitle}>{sec.t}</Text>
                  <Text style={styles.modalSectionBody}>{sec.p}</Text>
                </View>
              ))}
              {(conteudoAberto?.wallpapers || []).map((w) => (
                <View key={w.arquivo} style={styles.wallItem}>
                  <Image source={{ uri: w.uri }} style={styles.wallPreview} resizeMode="cover" />
                  <TouchableOpacity style={styles.wallBtn} activeOpacity={0.8} onPress={() => baixarWallpaper(w)}>
                    <Ionicons name="download" size={14} color="#fff" />
                    <Text style={styles.wallBtnText}>{t('loja.wallpaperDownload', { nome: w.nome })}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: space.fimDaLista },
  // A cena full-bleed do topo — margens negativas anulam o padding:20 do
  // content (sangra até as bordas e cola no header, sem borderRadius); o
  // saldo sobe -28 (marginTop do balanceWrap) e pousa na zona do fade.
  cenaWrap: { marginTop: -20, marginHorizontal: -20 },
  cenaImg: { width: '100%', height: 200 },
  cenaFade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 66 },
  // `marginBottom` foi a ZERO: quem dá o respiro abaixo do saldo agora é a
  // onda da faixa logo em seguida. Somar os dois deixava uma faixa de fundo
  // preto morto entre o cartão dourado e a curva — buraco, não respiro.
  balanceWrap: { borderRadius: 20, overflow: 'hidden', marginTop: -28 },
  balanceCard: { paddingVertical: 22, alignItems: 'center' },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 6 },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, fontWeight: '600' },
  // COMPOSIÇÃO CENTRADA (08/08/2026): título de seção grande e centrado, com
  // muito ar em cima — o padrão do concorrente premium (22/800, simétrico).
  // O `marginTop: 34` saiu: a FaixaCurva já traz `space.secao` de respiro em
  // cima, e somar os dois abria um buraco de 66px no alto de cada seção.
  sectionTitle: { ...type.secao, color: colors.text, textAlign: 'center', alignSelf: 'center', marginBottom: space.bloco, letterSpacing: 0.2 },
  card: {
    flexDirection: 'row',
    // Alinhado pelo TOPO, não pelo centro: com a descrição em 2-3 linhas o
    // `center` empurrava o ícone pro meio do parágrafo e o botão pra baixo —
    // três elementos em três alturas diferentes na mesma linha.
    alignItems: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: space.bloco,
    marginBottom: space.dentro,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: colors.gold + '22',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  // A MESMA MARGEM NEGATIVA DA CENA DO TOPO: anula o padding:20 do content pra
  // a faixa sangrar até as bordas. Card tem borda nos quatro lados e some no
  // meio da tela; faixa é o CHÃO embaixo dos cards e precisa tocar a borda.
  faixaSangra: { marginHorizontal: -20 },
  // A PRIMEIRA faixa sobe `space.entre` pra encostar a crista da onda no
  // rodapé do cartão de saldo. Sem isso sobrava uma tira de fundo preto entre
  // o dourado e a curva — a onda precisa NASCER de alguma coisa, e quando
  // nasce do vazio ela lê como erro de recorte em vez de virada de seção.
  faixaPrimeira: { marginTop: -space.entre },
  // Era 14/800 — peso máximo, e num corpo MENOR que o do texto de apoio. Vira
  // `corpoCurto` com peso 600: perde o grito, ganha um degrau de tamanho.
  // NÃO vai pra `cartao` (17): a linha tem ícone à esquerda e botão à direita,
  // e a 17 o título quebrava em duas linhas em quase toda recompensa — foi o
  // que a foto mostrou, e diagramação que precisa de 4 linhas onde cabiam 2
  // não é respiro, é aperto disfarçado de escala.
  cardTitle: { ...type.corpoCurto, fontWeight: '600', color: colors.text },
  cardDesc: { ...type.apoio, color: colors.textSecondary, marginTop: space.grudado },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: space.grudado, marginTop: space.junto },
  costText: { ...type.apoio, fontWeight: '600', color: colors.gold },
  redeemBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: space.dentro,
    paddingHorizontal: space.bloco,
    marginLeft: space.dentro,
  },
  redeemBtnLow: { backgroundColor: colors.surfaceElevated },
  redeemBtnText: { ...type.botao, color: '#fff' },

  // O subtítulo acompanha o título de seção centrado logo acima; o marginTop
  // negativo encosta nele (o título já traz os 14 de respiro embaixo).
  sectionSubtitle: { ...type.apoio, color: colors.textMuted, marginTop: -space.dentro, marginBottom: space.bloco, textAlign: 'center', alignSelf: 'center' },
  ownedText: { ...type.apoio, fontWeight: '600', color: colors.green },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(6,3,18,0.7)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '85%',
  },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
  modalTitle: { flex: 1, color: colors.text, fontSize: 17, fontWeight: '800' },
  modalSectionTitle: { color: colors.gold, fontSize: 13, fontWeight: '800', marginBottom: 4 },
  modalSectionBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  wallItem: { alignItems: 'center', marginBottom: 18 },
  wallPreview: {
    width: 150,
    height: 267,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  wallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  wallBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
