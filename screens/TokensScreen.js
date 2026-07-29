import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';
import { getTokenBalance, getTokenHistory } from '../lib/tokens';

// Data/hora no formato de cada idioma (pt-BR segue DD/MM/AAAA exatamente como
// antes) e o conector ("às"/"a las"/"at") vindo do dicionário — data crua em
// formato brasileiro dentro de um app em inglês confunde mais do que ajuda.
const DATE_LOCALE = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };

function formatDate(iso, lang, t) {
  try {
    const locale = DATE_LOCALE[lang] || DATE_LOCALE.pt;
    const d = new Date(iso);
    const date = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return t('tokens.history.dateTime', { date, time });
  } catch {
    return '';
  }
}

function HistoryRow({ item, last }) {
  const { lang, t } = useLanguage();
  const positive = item.amount > 0;
  return (
    <View style={[styles.histRow, !last && styles.histRowBorder]}>
      <View style={[styles.histIcon, { backgroundColor: (positive ? colors.green : colors.red) + '22' }]}>
        <Ionicons name={positive ? 'add-circle' : 'remove-circle'} size={18} color={positive ? colors.green : colors.red} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.histReason}>{item.reason}</Text>
        <Text style={styles.histDate}>{formatDate(item.date, lang, t)}</Text>
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
  const { t } = useLanguage();
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
        title={t('tokens.header.title')}
        subtitle={t('tokens.header.subtitle')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.LOJA)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('tokens.seeShop')}
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
            <Text style={styles.balanceLabel}>{t('tokens.balanceLabel')}</Text>
          </LinearGradient>
        </View>

        <TouchableOpacity style={styles.shopLink} activeOpacity={0.8} onPress={() => navigation.navigate(ROUTES.LOJA)}>
          <Ionicons name="storefront-outline" size={16} color={colors.accent} />
          <Text style={styles.shopLinkText}>{t('tokens.seeShop')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('tokens.historyTitle')}</Text>
        <View style={styles.card}>
          {history.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="hourglass-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('tokens.empty')}</Text>
              {/* O vazio PEDE uma leitura, mas o único caminho da tela era a
                  Loja — que só serve pra gastar token que ainda não existe.
                  Este botão leva onde se GANHA (cards de leitura + missões
                  diárias na Home). Salto de aba: Tokens vive no ProfileStack. */}
              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                accessibilityRole="button"
                onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.HOME_MAIN })}
              >
                <Ionicons name="sparkles" size={14} color="#fff" />
                <Text style={styles.emptyBtnText}>{t('tokens.emptyCta')}</Text>
              </TouchableOpacity>
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
  // Mesmo botão sólido de ação da Loja (redeemBtn/wallBtn) — telas irmãs do
  // mesmo grupo, sem visual novo.
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginTop: 14,
  },
  emptyBtnText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  histRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  histIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  histReason: { color: colors.text, fontSize: 14, fontWeight: '600' },
  histDate: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  histAmount: { fontSize: 15, fontWeight: '800', marginLeft: 8 },
});
