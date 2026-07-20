// components/OneTimeLock.js
// Tela de bloqueio mostrada no lugar de uma feature gratuita depois que a
// pessoa já usou sua 1 vez grátis (lib/featureUsage.js) e não tem assinatura
// ativa (hasAccess === false). CTA muda conforme o modo:
//   - Casal sem assinatura → manda pra tela de Planos (assinar).
//   - Solo (sem coupleData) → manda pro Quiz (convidar o par), já que hoje
//     não existe assinatura solo — decisão explícita do produto.
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
            : 'Convide seu par pra formarem um casal no app — assinando juntos, os dois usam tudo sem limite.'}
        </Text>
        <TouchableOpacity
          style={styles.btn}
          activeOpacity={0.85}
          testID="onetimelock-cta"
          onPress={() =>
            isCouple
              ? navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })
              : navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.QUIZ })
          }
        >
          <Text style={styles.btnText}>{isCouple ? 'Assinar agora' : 'Convidar meu par'}</Text>
        </TouchableOpacity>
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
});
