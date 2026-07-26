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
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import { useCouple } from '../context/CoupleContext';
import GradientHeader from './GradientHeader';

export default function OneTimeLock({ featureTitle, gradient = gradients.hero }) {
  const navigation = useNavigation();
  const { coupleData } = useCouple();
  const isCouple = !!coupleData;

  return (
    <View style={styles.root} testID="onetimelock-container">
      <GradientHeader title={featureTitle} onBack={() => navigation.goBack()} gradient={gradient} />
      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-closed" size={40} color={colors.accent} />
        </View>
        <Text style={styles.title} testID="onetimelock-title">Você já usou sua leitura gratuita de {featureTitle}</Text>
        <Text style={styles.text}>
          {isCouple
            ? 'Assine o Cosmic Guide e continue usando esse e todos os outros recursos sem limite, você e seu par.'
            : 'Assine o Cosmic Guide e continue usando esse e todos os outros recursos individuais sem limite.'}
        </Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          testID="onetimelock-cta"
          onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
        >
          <Text style={styles.btnText}>Assinar agora</Text>
        </TouchableOpacity>
        {!isCouple && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.7}
            testID="onetimelock-invite-cta"
            onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })}
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
