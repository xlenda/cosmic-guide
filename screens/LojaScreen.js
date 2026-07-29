import React, { useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Modal, Image } from 'react-native';
import { Alert } from '../lib/webAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, setGoldThemeActive } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getTokenBalance, spendTokens } from '../lib/tokens';
import { addShield, getShieldCount } from '../lib/streakShield';
import {
  grantSeloCosmico,
  addBonusTarotReading,
  grantGoldTheme,
  hasGoldTheme,
  grantBrinde,
  hasBrinde,
  getOwnedBrindes,
} from '../lib/cosmeticRewards';
import { addPinCredit } from '../lib/journal';
import { getBrindesDisponiveis, BRINDE_CONTEUDO } from '../lib/brindes';
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
      const result = await spendTokens(reward.cost, rewardTitle(t, reward.id));
      if (result.ok) {
        setBalance(result.balance);
        if (reward.id === 'escudo-sequencia') {
          const count = await addShield();
          Alert.alert(t('loja.alert.shield.title'), t('loja.alert.shield.text', { count }));
        } else if (reward.id === 'selo-cosmico') {
          await grantSeloCosmico();
          Alert.alert(t('loja.alert.seal.title'), t('loja.alert.seal.text'));
        } else if (reward.id === 'leitura-bonus') {
          const count = await addBonusTarotReading();
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
      } else {
        Alert.alert(
          t('loja.alert.noBalance.title'),
          t('loja.alert.noBalance.rewardText', { balance: result.balance, cost: reward.cost })
        );
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
      const result = await spendTokens(brinde.cost, brinde.title);
      if (!result.ok) {
        Alert.alert(
          t('loja.alert.noBalance.title'),
          t('loja.alert.noBalance.brindeText', { balance: result.balance, cost: brinde.cost })
        );
        return;
      }
      setBalance(result.balance);
      if (brinde.kind === 'conteudo') {
        await grantBrinde(brinde.id);
        setOwnedBrindes(await getOwnedBrindes());
      }
      if (brinde.grantsBonusReading) {
        await addBonusTarotReading(); // Leitura Bônus real junto com a tiragem exclusiva
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
        <View style={styles.balanceWrap}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <Ionicons name="sparkles" size={26} color="#fff" />
            <Text style={styles.balanceValue}>{balance}</Text>
            <Text style={styles.balanceLabel}>{t('loja.balanceLabel')}</Text>
          </LinearGradient>
        </View>

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

        {/* Brindes: mimos do nicho (ritual, wallpapers, tiragem exclusiva) com
            entrega automática real — catálogo e regras em lib/brindes.js. */}
        <Text style={[styles.sectionTitle, { marginTop: 12 }]}>{t('loja.sectionBrindes')}</Text>
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
                  <Text style={styles.cardTitle}>{brinde.title}</Text>
                  <Text style={styles.cardDesc}>{brinde.description}</Text>
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
  content: { padding: 20, paddingBottom: 40 },
  balanceWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 24 },
  balanceCard: { paddingVertical: 22, alignItems: 'center' },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 6 },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, fontWeight: '600' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
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
  cardTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  cardDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  costRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  costText: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  redeemBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginLeft: 10,
  },
  redeemBtnLow: { backgroundColor: colors.surfaceElevated },
  redeemBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  sectionSubtitle: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginBottom: 10 },
  ownedText: { color: colors.green, fontSize: 12, fontWeight: '700' },

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
