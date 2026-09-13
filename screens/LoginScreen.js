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
//
// DIAGRAMAÇÃO (12/09/2026 — lote das telas legais). Nenhum campo, nenhum
// botão, nenhum destino e nenhuma regra de erro mudaram: os mesmos dois
// caminhos (e-mail/senha e Google), a mesma recuperação de senha, o mesmo
// concluirLogin.
//
// O DEFEITO (design/lote-legais/antes/login.png): tudo no mesmo chão preto do
// começo ao fim, seis textos em peso 700/800 seguidos (rótulo, botão, "esqueci
// minha senha", "continuar com Google", "criar uma") e um terço da tela morto
// embaixo do último link. Num app inteiro tratado, esta era uma das telas que
// ainda gritava — e é a tela que aparece no MEIO de uma compra, o momento de
// maior risco de desistência.
//
// O CONSERTO:
//   1. DUAS FAIXAS: o formulário (ameixa, a faixa principal) e as outras
//      formas de entrar (noite — o chão que separa sem colorir). São dois
//      assuntos: "digite seus dados" e "ou entre por outro caminho", e antes
//      eles corriam juntos separados só por um fiozinho com "ou" no meio.
//   2. NEGRITO VIRA EXCEÇÃO. O rótulo dos campos desce de peso 700 pra
//      type.apoio, e "esqueci minha senha" sai do peso 700 pro mesmo degrau:
//      são apoio, não hierarquia. O peso fica nos dois botões (é toque) e no
//      título do cabeçalho. Cinco negritos viraram dois.
//   3. RESPIRO EM VEZ DE BURACO. O espaço morto do fim vira `ar` deliberado
//      antes da segunda faixa — o silêncio dos prints, que separa a decisão
//      principal da alternativa.
//
// ESTADO VAZIO: as duas faixas têm conteúdo FIXO (campos e botões escritos no
// código) — nenhuma pode ficar sem nada dentro. O que varia é o aviso de erro
// e o de "confira seu e-mail", que aparecem e somem DENTRO da primeira faixa e
// nunca desenham moldura própria quando estão vazios (é `''` que some, não um
// traço mudo).
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
  Linking,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';

const MODE = { SIGN_IN: 'signin', SIGN_UP: 'signup' };

export default function LoginScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
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
  const [resetting, setResetting] = useState(false);

  // 9º degrau: a tela de login apareceu de fato. Um só evento por execução
  // (dedupe por nome em lib/funnel.js), e o `source` diz se ela apareceu no
  // meio de uma compra ('planos' — o único ponto do app que EXIGE conta) ou se
  // a pessoa entrou por vontade própria pelo Perfil ('login_screen'). Essa
  // distinção é o que separa "desistiu da compra no login" de "só quis logar".
  useEffect(() => {
    funnel.loginView(veioDoCheckout ? 'planos' : 'login_screen');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Na WEB o navegador inteiro sai da página nesse redirect (é assim que OAuth
  // funciona) — então não tem "voltar" pra tratar: se der erro ANTES de sair da
  // página (ex.: provedor Google desativado no painel do Supabase), mostramos;
  // se der certo, a página troca de URL e essa tela nem existe mais quando a
  // pessoa volta já logada.
  // No NATIVO a aba de login fecha e a execução continua bem aqui, com a sessão
  // já pronta: sem o concluirLogin() abaixo a pessoa aprovava o Google e ficava
  // parada nesta mesma tela — e, vindo do checkout, perdia o plano escolhido.
  async function handleGoogle() {
    setError('');
    setInfo('');
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    // result.error é CHAVE de i18n (lib/supabaseClient.js), não texto pronto —
    // antes o erro cru do Google/Supabase chegava aqui em inglês e ia direto
    // pra tela de quem usa o app em pt/es.
    if (result.error) {
      setError(t(result.error));
      return;
    }
    if (result.concluido) concluirLogin();
  }

  // "Esqueci minha senha" — antes não existia caminho NENHUM aqui, e como o
  // PlanosScreen exige conta pra assinar, esquecer a senha fechava o funil
  // inteiro. O toque manda o e-mail de recuperação na hora usando o campo que
  // a pessoa já preencheu; se estiver vazio, pede o e-mail em vez de falhar
  // em silêncio.
  async function handleForgotPassword() {
    if (resetting) return;
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError(t('login.forgot.needEmail'));
      return;
    }
    setResetting(true);
    const result = await resetPassword(email.trim());
    setResetting(false);
    if (result?.error) {
      setError(t(result.error));
      return;
    }
    setInfo(t('login.forgot.sent'));
  }

  // Abrir a caixa de entrada é a próxima coisa a fazer depois de "confira seu
  // e-mail" — sem isso o aviso só informava. mailto: sem destinatário abre o
  // app de e-mail padrão; se o aparelho não tiver nenhum, o catch evita que a
  // promessa rejeitada estoure.
  function abrirCaixaDeEntrada() {
    Linking.openURL('mailto:').catch(() => {});
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
      setError(t(result.error));
      return;
    }
    if (result.needsConfirmation) {
      // Ainda NÃO é login_done: a conta existe mas a pessoa não entrou (falta
      // confirmar o e-mail). Marcar aqui esconderia um funil que morre
      // justamente na caixa de entrada.
      setInfo(t('login.infoConfirmEmail'));
      return;
    }
    // 10º degrau: entrou na conta. Na WEB só o caminho de e-mail/senha passa
    // por aqui; o botão do Google sai da página inteira (redirect de OAuth) e
    // volta com a sessão já pronta, sem esta tela existir — esse caso fica
    // como buraco conhecido na web, e o jeito de fechá-lo seria medir no
    // AuthContext, que hoje não distingue "acabou de logar" de "sessão
    // restaurada no arranque" (todo assinante recorrente viraria login_done
    // toda manhã e o degrau perderia o sentido). No nativo o Google volta pra
    // esta tela e passa pelo mesmo concluirLogin(), então lá o degrau é medido.
    concluirLogin();
  }

  // Voltar pra ONDE a compra parou, com o plano escolhido junto — um goBack()
  // cego devolveria a pessoa pra tela de Planos sem o plano selecionado (e,
  // pior, pra Home nos caminhos em que a pilha mudou). navigate() com o nome
  // da rota reaproveita a tela que já está na pilha e só funde os params
  // novos, então não empilha uma segunda cópia.
  function concluirLogin() {
    funnel.loginDone();
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
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* ScrollView porque as duas faixas somadas passam de 844px com o
            teclado aberto — sem ele o botão do Google fica embaixo do teclado
            e a pessoa não alcança o segundo caminho de entrada. */}
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* FAIXA 1 — o formulário. Ameixa: é a faixa principal, a decisão que
              a tela pede. paddingTop 0 porque o GradientHeader já dá a folga de
              cima; a onda cheia fica (o corpo é alto, é a entrada que merece). */}
          <FaixaCurva tom="ameixa" semente="login-formulario" estiloCorpo={styles.faixaAbertura}>
            <ColunaLeitura>
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

              <Text style={[styles.label, styles.labelSeguinte]}>{t('login.passwordLabel')}</Text>
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
              {info !== '' && (
                <TouchableOpacity style={styles.inboxBtn} activeOpacity={0.8} onPress={abrirCaixaDeEntrada}>
                  <Ionicons name="mail-open" size={16} color={colors.accent} />
                  <Text style={styles.inboxBtnText}>{t('login.openInboxCta')}</Text>
                </TouchableOpacity>
              )}

              {loading ? (
                <ActivityIndicator color={colors.accent} style={styles.carregando} />
              ) : (
                <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={handleSubmit}>
                  <Text style={styles.btnText}>{mode === MODE.SIGN_IN ? t('login.mode.signIn') : t('login.mode.signUp')}</Text>
                </TouchableOpacity>
              )}

              {mode === MODE.SIGN_IN && (
                <TouchableOpacity
                  style={styles.forgotLink}
                  activeOpacity={0.7}
                  onPress={handleForgotPassword}
                  disabled={loading || resetting}
                >
                  <Text style={styles.forgotText}>
                    {resetting ? t('login.forgot.sending') : t('login.forgot.cta')}
                  </Text>
                </TouchableOpacity>
              )}
            </ColunaLeitura>
          </FaixaCurva>

          {/* FAIXA 2 — as outras formas de entrar. Noite (ardósia): o chão que
              separa sem colorir. O fio com "ou" no meio saiu: a troca de chão
              faz o mesmo trabalho e não parece remendo. `rasa` porque o corpo
              é um botão e um link — onda cheia aqui seria mais chão que
              conteúdo (o defeito ALTO da Home). */}
          <FaixaCurva tom="noite" semente="login-alternativas" grude="ameixa" rasa>
            <ColunaLeitura>
              <Text style={styles.dividerText}>{t('login.divider')}</Text>

              {googleLoading ? (
                <ActivityIndicator color={colors.text} style={styles.carregando} />
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
            </ColunaLeitura>
          </FaixaCurva>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  // As faixas trazem o próprio paddingHorizontal (space.tela).
  content: { paddingBottom: space.fimDaLista },
  faixaAbertura: { paddingTop: 0 },
  // O rótulo é APOIO, não hierarquia: era peso 700 em 13px, agora é o degrau
  // de apoio sem peso reposto (a lei da fundação — não repor fontWeight depois
  // do spread).
  label: { ...type.apoio, color: colors.textSecondary, marginBottom: space.junto },
  labelSeguinte: { marginTop: space.entre },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...type.corpoCurto,
    color: colors.text,
    paddingHorizontal: space.bloco,
    paddingVertical: space.dentro,
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
    paddingHorizontal: space.bloco,
  },
  errorText: { ...type.apoio, color: colors.red, marginTop: space.bloco, textAlign: 'center' },
  infoText: { ...type.apoio, color: colors.gold, marginTop: space.bloco, textAlign: 'center' },
  carregando: { marginTop: space.entre },
  btn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: space.bloco,
    alignItems: 'center',
    // `ar` — o silêncio antes da decisão. Era 20 cru; o degrau maior é o certo
    // aqui, porque o defeito do app era aperto, não folga.
    marginTop: space.ar,
  },
  btnText: { ...type.botao, color: '#fff' },
  // "Esqueci minha senha" também é apoio: perdeu o peso 700 e ganhou espaço.
  forgotLink: { alignItems: 'center', marginTop: space.entre, paddingVertical: space.grudado },
  forgotText: { ...type.apoio, color: colors.textSecondary },
  // O "ou" virou etiqueta centralizada: o fio dos dois lados saiu junto com a
  // necessidade dele (a faixa é que separa agora).
  dividerText: { ...type.etiqueta, color: colors.textMuted, textAlign: 'center' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    paddingVertical: space.bloco, marginTop: space.entre,
  },
  googleBtnText: { ...type.botao, color: colors.text },
  switchLink: { alignItems: 'center', marginTop: space.entre },
  switchText: { ...type.botao, color: colors.accent },
  inboxBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    paddingVertical: space.dentro, marginTop: space.bloco,
  },
  inboxBtnText: { ...type.apoio, color: colors.accent },
});
