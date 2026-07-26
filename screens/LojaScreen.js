import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Alert } from '../lib/webAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, setGoldThemeActive } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getTokenBalance, spendTokens } from '../lib/tokens';
import { addShield, getShieldCount } from '../lib/streakShield';
import { grantSeloCosmico, addBonusTarotReading, grantGoldTheme, hasGoldTheme } from '../lib/cosmeticRewards';
import { addPinCredit } from '../lib/journal';

// Recompensas cosméticas/digitais do próprio app — nada físico, nada que
// prometa dinheiro real ou logística que ainda não existe. REGRA DURA: só
// entra na lista recompensa com efeito real implementado no handleRedeem
// (bug real de 25/07/2026: duas recompensas gastavam o token sem fazer nada).
// `webOnly` esconde a recompensa no nativo quando o efeito só existe na web
// (ex.: Tema Dourado, que depende de localStorage síncrono — ver theme.js).
const REWARDS = [
  {
    id: 'selo-cosmico',
    title: 'Selo Cósmico no perfil',
    description: 'Um selinho especial ao lado do seu nome no Perfil — sozinho ou em casal.',
    cost: 50,
    icon: 'ribbon',
  },
  {
    id: 'destaque-diario',
    title: 'Destaque no Diário',
    description: 'Fixa uma leitura à sua escolha no topo do Diário Cósmico por 7 dias.',
    cost: 30,
    icon: 'bookmark',
  },
  {
    id: 'leitura-bonus',
    title: 'Leitura Bônus',
    description: 'Desbloqueia uma leitura extra de Tarô fora da sua sequência normal (mesmo tema já consultado hoje).',
    cost: 80,
    icon: 'sparkles',
  },
  {
    id: 'escudo-sequencia',
    title: 'Escudo da Sequência',
    description: 'Protege sua sequência de quebrar se vocês esquecerem de usar o app por 1 dia.',
    cost: 60,
    icon: 'shield-checkmark',
  },
  {
    id: 'tema-dourado',
    title: 'Tema dourado exclusivo',
    description: 'O app inteiro em dourado — compra única, liga e desliga quando quiser no Perfil.',
    cost: 150,
    icon: 'color-palette',
    webOnly: true,
  },
];

export default function LojaScreen() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [redeeming, setRedeeming] = useState(null);

  const load = useCallback(() => {
    getTokenBalance().then(setBalance);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleRedeem(reward) {
    if (redeeming) return;
    // Tema dourado é compra ÚNICA — recusa antes de gastar token de novo
    // (quem já tem liga/desliga de graça no Perfil).
    if (reward.id === 'tema-dourado' && (await hasGoldTheme())) {
      Alert.alert('Você já tem o Tema dourado', 'Liga e desliga quando quiser em Perfil > Preferências.');
      return;
    }
    setRedeeming(reward.id);
    try {
      const result = await spendTokens(reward.cost, reward.title);
      if (result.ok) {
        setBalance(result.balance);
        if (reward.id === 'escudo-sequencia') {
          const count = await addShield();
          Alert.alert('Escudo ativado!', `${count} escudo(s) guardado(s) — protege a próxima sequência quebrada.`);
        } else if (reward.id === 'selo-cosmico') {
          await grantSeloCosmico();
          Alert.alert('Selo ativado!', 'Já apareceu ao lado do nome de vocês no Perfil.');
        } else if (reward.id === 'leitura-bonus') {
          const count = await addBonusTarotReading();
          Alert.alert('Leitura Bônus guardada!', `Vá no Tarô, escolha o tema (mesmo já consultado hoje) e use o botão "Usar Leitura Bônus" (${count} disponível).`);
        } else if (reward.id === 'destaque-diario') {
          await addPinCredit();
          Alert.alert('Destaque guardado!', 'Abra o Diário Cósmico, toque na leitura que quiser e use "Fixar no topo por 7 dias".');
        } else if (reward.id === 'tema-dourado') {
          await grantGoldTheme();
          setGoldThemeActive(true);
          Alert.alert('Tema dourado seu!', 'Recarregando pra aplicar o visual novo…', [
            {
              text: 'Aplicar agora',
              onPress: () => {
                // Volta pra RAIZ do app de propósito, não reload() da URL
                // atual — a rota interna (/Loja) não existe como arquivo no
                // servidor estático e daria 404 num reload cru.
                if (Platform.OS === 'web' && typeof window !== 'undefined') window.location.href = '/cosmic-guide/';
              },
            },
          ]);
        } else {
          Alert.alert('Resgatado!', `"${reward.title}" resgatado com sucesso.`);
        }
      } else {
        Alert.alert(
          'Saldo insuficiente',
          `Você tem ${result.balance} tokens, mas essa recompensa custa ${reward.cost}. Complete mais leituras pra ganhar tokens.`
        );
      }
    } finally {
      setRedeeming(null);
    }
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Loja" subtitle="Troque tokens por recompensas" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceWrap}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <Ionicons name="sparkles" size={26} color="#fff" />
            <Text style={styles.balanceValue}>{balance}</Text>
            <Text style={styles.balanceLabel}>tokens disponíveis</Text>
          </LinearGradient>
        </View>

        <Text style={styles.sectionTitle}>Recompensas</Text>
        {REWARDS.filter((r) => !r.webOnly || Platform.OS === 'web').map((reward) => {
          const affordable = balance >= reward.cost;
          const isRedeeming = redeeming === reward.id;
          return (
            <View key={reward.id} style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={reward.icon} size={22} color={colors.gold} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{reward.title}</Text>
                <Text style={styles.cardDesc}>{reward.description}</Text>
                <View style={styles.costRow}>
                  <Ionicons name="diamond" size={13} color={colors.gold} />
                  <Text style={styles.costText}>{reward.cost} tokens</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.redeemBtn, !affordable && styles.redeemBtnLow]}
                activeOpacity={0.8}
                onPress={() => handleRedeem(reward)}
                disabled={isRedeeming}
              >
                <Text style={styles.redeemBtnText}>{isRedeeming ? '...' : 'Resgatar'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
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
});
