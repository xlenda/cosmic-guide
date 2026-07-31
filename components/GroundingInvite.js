// components/GroundingInvite.js
// O convite que fecha a leitura: a pessoa acabou de receber um Tarô, um sonho
// interpretado, uma leitura de palma ou de borra de café — está com aquilo na
// cabeça — e, em vez de largá-la ali, o app oferece alguns minutos pra ficar
// com o que leu (screens/GroundingScreen.js).
//
// ===========================================================================
// LEIA lib/grounding.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// Respiração e presença são PRÁTICA, nunca tratamento. Este card não promete
// efeito nenhum: ele descreve o que a pessoa vai fazer e convida.
// test/grounding.test.js falha o build quando isso é violado.
// ===========================================================================
//
// POR QUE ELE É UM CARD E NÃO UM MODAL, E POR QUE NÃO TEM RECOMPENSA:
// o contexto de uso é o ponto mais delicado da feature inteira. Oferecer
// respiração logo depois de conteúdo emocionalmente carregado é diferente de
// oferecer numa tela neutra — a pessoa pode estar mexida. Então o convite
// precisa ser convite mesmo:
//   · fácil de recusar (o "agora não" tem o mesmo peso visual do "ficar");
//   · fácil de ignorar (é um card no fluxo, não uma janela que trava a tela);
//   · sem token, sem badge, sem sequência própria, sem barra de progresso.
// Se o ritual tivesse recompensa, ele deixaria de ser "alguns minutos com o
// que você leu" e viraria obrigação — e aí quem está mal fica no exercício
// por causa da métrica. Não é isso que estamos construindo.
//
// ONDE PLUGAR (documentado aqui pra não precisar caçar no diff):
// nas quatro telas de leitura, logo DEPOIS do <VoiceInsightRecorder> e ANTES
// do card de upsell/assinatura — uma linha, sem props obrigatórias:
//
//   import GroundingInvite from '../components/GroundingInvite';
//   ...
//   <GroundingInvite />
//
//   screens/TarotScreen.js   — no bloco do resultado
//   screens/DreamScreen.js   — dentro de step === STEP.RESULT
//   screens/PalmScreen.js    — no bloco do resultado
//   screens/CoffeeScreen.js  — no bloco do resultado
//
// A posição importa: depois do resultado (a pessoa já leu) e antes do upsell
// (o convite pra ficar não pode vir depois do convite pra pagar).
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';

export default function GroundingInvite({ style }) {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [dispensado, setDispensado] = useState(false);

  if (dispensado) return null;

  // O ritual mora na stack da Home, e o Tarô mora em outra aba. Subir pro
  // navegador de abas e pedir a tela por dentro da Home é o mesmo caminho que
  // as telas de leitura já usam pra chegar em Planos — funciona igual das
  // quatro origens, sem registrar a rota em duas stacks.
  const abrir = () => {
    const pai = navigation.getParent();
    if (pai) pai.navigate(ROUTES.HOME_TAB, { screen: ROUTES.GROUNDING });
    else navigation.navigate(ROUTES.GROUNDING);
  };

  return (
    <View style={[styles.card, style]} testID="grounding-invite">
      <View style={styles.top}>
        <Ionicons name="leaf-outline" size={16} color={colors.teal} />
        <Text style={styles.title}>{t('grounding.invite.title')}</Text>
      </View>
      <Text style={styles.body}>{t('grounding.invite.body')}</Text>
      <Text style={styles.note}>{t('grounding.invite.note')}</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={styles.cta}
          activeOpacity={0.85}
          onPress={abrir}
          accessibilityRole="button"
          testID="grounding-invite-cta"
        >
          <Text style={styles.ctaText}>{t('grounding.invite.cta')}</Text>
        </TouchableOpacity>
        {/* Mesmo tamanho de toque do botão principal. Recusar não pode ser
            mais difícil do que aceitar. */}
        <TouchableOpacity
          style={styles.dismiss}
          activeOpacity={0.85}
          onPress={() => setDispensado(true)}
          accessibilityRole="button"
          testID="grounding-invite-dismiss"
        >
          <Text style={styles.dismissText}>{t('grounding.invite.dismiss')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.teal, fontSize: 14, fontWeight: '800', flex: 1 },
  body: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  note: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  cta: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dismiss: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 11,
    alignItems: 'center',
  },
  dismissText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
});
