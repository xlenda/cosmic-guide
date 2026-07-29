// components/OfferSummary.js
// Resumo da oferta (preço de entrada + 7 dias grátis + cancele quando quiser)
// para ser mostrado DENTRO de cada paywall, no instante em que a pessoa bate na
// trava — não uma tela depois.
//
// Por que existe: até 29/07/2026 os dois muros que alguém encontra no dia 1
// (components/OneTimeLock.js e o SoloTeaser/SubscribeTeaser daqui do lado, em
// components/FeatureGate.js) só diziam "assine e continue usando" e mandavam
// pra tela de Planos. Ninguém sabia quanto custava, nem que havia teste grátis,
// nem que dava pra cancelar, antes de navegar pra outra tela (~40 visitantes,
// ZERO checkouts iniciados). A decisão de comprar precisa da oferta inteira no
// mesmo lugar onde ela é interrompida.
//
// FONTE ÚNICA DO PREÇO: `planos.plan.trial.detail` é EXATAMENTE a mesma chave
// que o card do plano Mensal usa em screens/PlanosScreen.js (PlanPicker). O
// número não é redigitado aqui de propósito — no dia em que a oferta mudar,
// muda num lugar só e os três paywalls acompanham juntos. Nunca troque este
// t() por um literal.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// Só o que tira dúvida antes de tocar no botão: sem risco (cancela quando
// quiser) e que existe opção mais barata por mês (trimestral/anual) — sem
// repetir nenhum valor, que continua vivendo apenas na chave do plano.
const NOTE_KEYS = ['offer.cancelAnytime', 'offer.morePlans'];

export default function OfferSummary({ style, compact = false, testID = 'offer-summary' }) {
  const { t } = useLanguage();
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact, style]} testID={testID}>
      <Text style={styles.price} testID={`${testID}-price`}>
        {t('planos.plan.trial.detail')}
      </Text>
      {NOTE_KEYS.map((key) => (
        <View key={key} style={styles.row}>
          <Ionicons name="checkmark-circle" size={13} color={colors.accent} />
          <Text style={styles.rowText}>{t(key)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: 20, gap: 6 },
  // No véu do SubscribeTeaser o espaço é curto (o cartão fica colado no rodapé,
  // por cima do conteúdo real) — mesma informação, respiro menor.
  wrapCompact: { marginBottom: 12, gap: 4 },
  price: { color: colors.gold, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
});
