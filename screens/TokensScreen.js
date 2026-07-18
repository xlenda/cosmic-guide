import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { ROUTES } from '../routes';
import { getTokenBalance, getTokenHistory } from '../lib/tokens';

function formatDate(iso) {
  try {
    const d = new Date(iso);
    const date = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${date} às ${time}`;
  } catch {
    return '';
  }
}

function HistoryRow({ item, last }) {
  const positive = item.amount > 0;
  return (
    <View style={[styles.histRow, !last && styles.histRowBorder]}>
      <View style={[styles.histIcon, { backgroundColor: (positive ? colors.green : colors.red) + '22' }]}>
        <Ionicons name={positive ? 'add-circle' : 'remove-circle'} size={18} color={positive ? colors.green : colors.red} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.histReason}>{item.reason}</Text>
        <Text style={styles.histDate}>{formatDate(item.date)}</Text>
      </View>
      <Text style={[styles.histAmount, { color: positive ? colors.green : colors.red }]}>
        {positive ? '+' : ''}
        {item.amount}
      </Text>
    </View>
  );
}

export default function TokensScreen() {
  const navigation = useNavigation();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  const load = useCallback(() => {
    getTokenBalance().then(setBalance);
    getTokenHistory().then(setHistory);
  }, []);

  // Recarrega toda vez que a tela ganha foco — o saldo pode ter mudado
  // enquanto a pessoa estava em outra tela (ganhou tokens numa leitura ou
  // gastou na Loja), então um useEffect simples (só no mount) ficaria com
  // dado velho ao voltar.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Meus Tokens"
        subtitle="Sua energia acumulada"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.LOJA)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Ver Loja"
          >
            <Ionicons name="storefront" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceWrap}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
            <View style={styles.balanceIconWrap}>
              <Ionicons name="sparkles" size={30} color="#fff" />
            </View>
            <Text style={styles.balanceValue}>{balance}</Text>
            <Text style={styles.balanceLabel}>tokens acumulados</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.shopLink} activeOpacity={0.8} onPress={() => navigation.navigate(ROUTES.LOJA)}>
          <Ionicons name="storefront-outline" size={16} color={colors.accent} />
          <Text style={styles.shopLinkText}>Ver Loja</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Histórico</Text>
        <View style={styles.card}>
          {history.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="hourglass-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>
                Nenhuma transação ainda — complete uma leitura pra ganhar seus primeiros tokens!
              </Text>
            </View>
          ) : (
            history.map((item, idx) => (
              <HistoryRow key={`${item.date}-${idx}`} item={item} last={idx === history.length - 1} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  balanceWrap: { borderRadius: 20, overflow: 'hidden', marginBottom: 14 },
  balanceCard: { paddingVertical: 28, alignItems: 'center' },
  balanceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceValue: { color: '#fff', fontSize: 40, fontWeight: '800' },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 4, fontWeight: '600' },
  shopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginBottom: 24,
  },
  shopLinkText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyWrap: { padding: 24, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 19, marginTop: 10 },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  histRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  histReason: { color: colors.text, fontSize: 14, fontWeight: '600' },
  histDate: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  histAmount: { fontSize: 15, fontWeight: '800', marginLeft: 8 },
});
