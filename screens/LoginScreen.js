// screens/LoginScreen.js
// Login/criar conta (Supabase) — só é aberta em dois lugares: pelo botão
// "Fazer login" no Perfil (opcional) e pelo PlanosScreen antes do checkout
// (obrigatório na hora de assinar). Nunca bloqueia o resto do app.
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../context/AuthContext';

const MODE = { SIGN_IN: 'signin', SIGN_UP: 'signup' };

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState(MODE.SIGN_IN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  function toggleMode() {
    setMode(mode === MODE.SIGN_IN ? MODE.SIGN_UP : MODE.SIGN_IN);
    setError('');
    setInfo('');
  }

  async function handleSubmit() {
    setError('');
    setInfo('');
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }

    setLoading(true);
    const action = mode === MODE.SIGN_IN ? signIn : signUp;
    const result = await action(email.trim(), password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setInfo('Conta criada! Confira seu e-mail para confirmar antes de entrar.');
      return;
    }
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={mode === MODE.SIGN_IN ? 'Entrar' : 'Criar conta'} onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seuemail@exemplo.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            editable={!loading}
          />

          {error !== '' && <Text style={styles.errorText}>{error}</Text>}
          {info !== '' && <Text style={styles.infoText}>{info}</Text>}

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={handleSubmit}>
              <Text style={styles.btnText}>{mode === MODE.SIGN_IN ? 'Entrar' : 'Criar conta'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={toggleMode} style={styles.switchLink} disabled={loading}>
            <Text style={styles.switchText}>
              {mode === MODE.SIGN_IN ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, gap: 6 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6 },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  errorText: { color: colors.red, fontSize: 13, marginTop: 14, textAlign: 'center', lineHeight: 19 },
  infoText: { color: colors.gold, fontSize: 13, marginTop: 14, textAlign: 'center', lineHeight: 19 },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  switchLink: { alignItems: 'center', marginTop: 18 },
  switchText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});
