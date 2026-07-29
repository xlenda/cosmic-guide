// screens/LoginScreen.js
// Login/criar conta (Supabase) — só é aberta em dois lugares: pelo botão
// "Fazer login" no Perfil (opcional) e pelo PlanosScreen no toque do CTA de
// assinar (obrigatório só ali). Nunca bloqueia o resto do app.
//
// Quando vem do checkout (route.params.reason === 'checkout'), esta tela é um
// DESVIO no meio de uma compra, não um destino: ela avisa por que a conta é
// necessária e, ao terminar, devolve a pessoa pra tela de onde veio COM o
// plano que ela já tinha escolhido (returnTo/returnParams). Antes o login
// levava sempre pro goBack cego — quem se perdesse aí desistia da compra.
import React, { useEffect, useState } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';

const MODE = { SIGN_IN: 'signin', SIGN_UP: 'signup' };

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  // De onde a pessoa veio e pra onde ela precisa voltar. Só o PlanosScreen
  // preenche isso hoje (toque no CTA estando deslogado).
  const veioDoCheckout = route.params?.reason === 'checkout';
  const returnTo = route.params?.returnTo;
  const returnParams = route.params?.returnParams;
  const [mode, setMode] = useState(MODE.SIGN_IN);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // "Olhinho" de mostrar/esconder a senha — pedido real de tester (26/07/2026):
  // ele digitou a senha errada, recebeu "E-mail ou senha incorretos." e não
  // tinha como conferir o que tinha digitado.
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // 9º degrau: a tela de login apareceu de fato. Um só evento por execução
  // (dedupe por nome em lib/funnel.js), e o `source` diz se ela apareceu no
  // meio de uma compra ('planos' — o único ponto do app que EXIGE conta) ou se
  // a pessoa entrou por vontade própria pelo Perfil ('login_screen'). Essa
  // distinção é o que separa "desistiu da compra no login" de "só quis logar".
  useEffect(() => {
    funnel.loginView(veioDoCheckout ? 'planos' : 'login_screen');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // O navegador inteiro sai da página nesse redirect (é assim que OAuth
  // funciona na web) — então não tem "voltar" pra tratar aqui: se der erro
  // ANTES de sair da página (ex.: provedor Google desativado no painel do
  // Supabase), mostramos; se der certo, a página inteira troca de URL e essa
  // tela nem existe mais quando a pessoa volta já logada.
  async function handleGoogle() {
    setError('');
    setInfo('');
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (result.error) setError(result.error);
  }

  function toggleMode() {
    setMode(mode === MODE.SIGN_IN ? MODE.SIGN_UP : MODE.SIGN_IN);
    setError('');
    setInfo('');
  }

  async function handleSubmit() {
    setError('');
    setInfo('');
    if (!email.trim() || !password) {
      setError(t('login.errorEmptyFields'));
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
      // Ainda NÃO é login_done: a conta existe mas a pessoa não entrou (falta
      // confirmar o e-mail). Marcar aqui esconderia um funil que morre
      // justamente na caixa de entrada.
      setInfo(t('login.infoConfirmEmail'));
      return;
    }
    // 10º degrau: entrou na conta. Só o caminho de e-mail/senha passa por
    // aqui; o botão do Google sai da página inteira (redirect de OAuth) e
    // volta com a sessão já pronta, sem esta tela existir — esse caso fica
    // como buraco conhecido, e o jeito de fechá-lo seria medir no
    // AuthContext, que hoje não distingue "acabou de logar" de "sessão
    // restaurada no arranque" (todo assinante recorrente viraria login_done
    // toda manhã e o degrau perderia o sentido).
    funnel.loginDone();
    // Voltar pra ONDE a compra parou, com o plano escolhido junto — um
    // goBack() cego devolveria a pessoa pra tela de Planos sem o plano
    // selecionado (e, pior, pra Home nos caminhos em que a pilha mudou).
    // navigate() com o nome da rota reaproveita a tela que já está na pilha e
    // só funde os params novos, então não empilha uma segunda cópia.
    if (returnTo) {
      navigation.navigate(returnTo, returnParams);
      return;
    }
    navigation.goBack();
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={mode === MODE.SIGN_IN ? t('login.mode.signIn') : t('login.mode.signUp')}
        // Quem chegou aqui no meio da compra precisa saber que não perdeu o
        // plano que escolheu — é o momento de maior risco de desistência.
        subtitle={veioDoCheckout ? t('login.checkoutSubtitle') : undefined}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Text style={styles.label}>{t('login.emailLabel')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('login.emailPlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>{t('login.passwordLabel')}</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? t('login.hidePassword') : t('login.showPassword')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {error !== '' && <Text style={styles.errorText}>{error}</Text>}
          {info !== '' && <Text style={styles.infoText}>{info}</Text>}

          {loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={handleSubmit}>
              <Text style={styles.btnText}>{mode === MODE.SIGN_IN ? t('login.mode.signIn') : t('login.mode.signUp')}</Text>
            </TouchableOpacity>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('login.divider')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {googleLoading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <TouchableOpacity style={styles.googleBtn} activeOpacity={0.85} onPress={handleGoogle} disabled={loading}>
              <Ionicons name="logo-google" size={18} color={colors.text} />
              <Text style={styles.googleBtnText}>{t('login.google')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={toggleMode} style={styles.switchLink} disabled={loading}>
            <Text style={styles.switchText}>
              {mode === MODE.SIGN_IN ? t('login.switchToSignUp') : t('login.switchToSignIn')}
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
  // Campo de senha com o "olhinho" sobreposto à direita — o paddingRight extra
  // impede a senha digitada de passar por baixo do ícone.
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 46 },
  eyeBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 14,
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
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    paddingVertical: 14, marginTop: 14,
  },
  googleBtnText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  switchLink: { alignItems: 'center', marginTop: 18 },
  switchText: { color: colors.accent, fontSize: 14, fontWeight: '600' },
});
