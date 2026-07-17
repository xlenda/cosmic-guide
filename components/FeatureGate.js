// Gate de feature para as telas exclusivas de assinantes (casal) — mesma altitude
// que o FeatureGate do funil web (gilfforever/web/app/(app)/layout.js): aplicado
// na borda da rota (Stack.Screen), não dentro de cada tela.
//
// Sem blur-behind-real-content (exigiria montar a tela real, com estado, só para
// esmaecer por cima — caro e expo-blur nem está instalado). Em vez disso, um
// card de estado bloqueado, reaproveitando a linguagem visual do `locked` já
// parcialmente construído em FeatureCard.js (badge de cadeado + gradiente).
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';

export function LockedCard() {
  const navigation = useNavigation();
  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.card} style={styles.card}>
        <View style={styles.sealWrap}>
          <Ionicons name="lock-closed" size={28} color={colors.gold} />
        </View>
        <Text style={styles.title}>Isso se abre com a assinatura</Text>
        <Text style={styles.price}>$5 USD/mês · 7 dias grátis, sem compromisso</Text>
        <Text style={styles.text}>
          Linha do tempo, cápsulas do tempo, rotas de reconexão, progresso e retrospectiva ficam guardados
          aqui — é só assinar para abrir.
        </Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate(ROUTES.PLANOS)}
        >
          <Text style={styles.btnText}>Assinar →</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

// HOC — casais sem acesso confirmado veem o LockedCard; solo (sem coupleData) e
// casais com hasAccess=true renderizam a tela normalmente. hasAccess é otimista
// (default true) até o contexto confirmar com o servidor, então nunca pisca um
// bloqueio falso para quem já tem acesso.
export function withFeatureGate(Screen) {
  return function GatedScreen(props) {
    const { coupleData, hasAccess } = useCouple();
    if (!coupleData || hasAccess) return <Screen {...props} />;
    return <LockedCard />;
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
});
