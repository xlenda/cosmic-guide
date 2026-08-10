// A PILL PREMIUM FLUTUANTE — o lembrete de assinar presente em toda tela,
// como no app concorrente premium (canto inferior direito, acima do dock).
// (09/08/2026, pedido do dono: "faltou aquele botão flutuante de assinar")
//
// HONESTIDADE DE EXIBIÇÃO (quem decide é o Gate, que passa `visivel`):
//   • aparece SÓ para quem comprovadamente NÃO assina (accessConfirmed &&
//     !hasAccess) — em dúvida de rede não pisca "assine" pra pagante;
//   • some na própria tela de Planos (oferta em cima de oferta é ruído);
//   • o texto é oferta real ("Acesse tudo / Premium"), zero urgência falsa.
//
// Decorativa no toque não é: navega pra PlanosScreen. Área ≥44px.
import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

export default function PillPremium({ visivel, onPress }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  if (!visivel) return null;
  return (
    <TouchableOpacity
      // ACIMA DO DOCK DO SOM (09/08/2026, achado de review): o dock mora em
      // `bottom: 70 + insets` com ~44 de altura, então ocupa até ~114+insets
      // — a pill a 86 cobria o play/pause. 124+insets a empilha em cima dele,
      // e continua colada no rodapé quando o dock não está na tela.
      style={[styles.pill, { bottom: 124 + insets.bottom }]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${t('planos.pill.top')} ${t('planos.pill.premium')}`}
      testID="pill-premium"
    >
      <View>
        <Text style={styles.topo}>{t('planos.pill.top')}</Text>
        <Text style={styles.premium}>{t('planos.pill.premium')}</Text>
      </View>
      <View style={styles.estrela}>
        <Ionicons name="sparkles" size={14} color="#fff" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: 'absolute',
    right: 12,
    // `bottom` vem do componente (124 + safe area) — ver o comentário no JSX.
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface + 'F2',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 8,
    minHeight: 44,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  topo: { color: colors.textMuted, fontSize: 10.5, fontWeight: '600' },
  premium: { color: colors.text, fontSize: 14, fontWeight: '800', marginTop: 1 },
  estrela: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
