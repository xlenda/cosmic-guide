import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getTokenBalance, spendTokens } from '../lib/tokens';

// Recompensas cosméticas/digitais do próprio app — nada físico, nada que
// prometa dinheiro real ou logística que ainda não existe. Ainda não têm
// efeito visual implementado no resto do app, então o Alert de sucesso é
// honesto sobre isso (o gasto do token em si é real, só o "efeito" é que
// ainda não foi ligado a nada).
const REWARDS = [
  {
    id: 'destaque-diario',
    title: 'Destaque no Diário',
    description: 'Fixa uma entrada do seu Diário do Casal no topo por 7 dias.',
    cost: 30,
    icon: 'bookmark',
  },
  {
    id: 'selo-cosmico',
    title: 'Selo Cósmico no perfil',
    description: 'Um selinho especial ao lado do nome do casal, no Perfil.',
    cost: 50,
    icon: 'ribbon',
  },
  {
    id: 'leitura-bonus',
    title: 'Leitura Bônus',
    description: 'Desbloqueia uma leitura extra de Tarô fora da sua sequência normal.',
    cost: 80,
    icon: 'sparkles',
  },
  {
    id: 'tema-dourado',
    title: 'Tema dourado exclusivo',
    description: 'Um visual dourado especial pra deixar o app com a cara de vocês.',
    cost: 150,
    icon: 'color-palette',
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
    setRedeeming(reward.id);
    try {
      const result = await spendTokens(reward.cost, reward.title);
      if (result.ok) {
        setBalance(result.balance);
        Alert.alert('Resgatado!', `"${reward.title}" resgatado com sucesso. (em breve isso vai aparecer no seu perfil)`);
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
        {REWARDS.map((reward) => {
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
