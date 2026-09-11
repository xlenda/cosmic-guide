import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// Só desenha. Quem usa guarda o valor no estado e salva via lib/nomeLocal
// (setNome) no momento certo — o campo não sabe se está no grid de signos ou
// no fim das perguntas, e não deve saber (11/09/2026: um só componente pros
// dois caminhos do onboarding, pra Home cumprimentar igual venha de onde vier).
export default function CampoNome({ valor, onChange }) {
  const { t } = useLanguage();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{t('onboarding.nome.label')}</Text>
      <TextInput
        testID="onboarding-nome"
        style={styles.input}
        value={valor || ''}
        onChangeText={onChange}
        placeholder={t('onboarding.nome.placeholder')}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={40}
        returnKeyType="done"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: { color: colors.textSecondary, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  // Mesmo desenho do input do Perfil (ProfileScreen.styles.input).
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
});
