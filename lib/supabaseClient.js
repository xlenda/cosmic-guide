// lib/supabaseClient.js
// Projeto Supabase "guia cósmico" — usado só pra login/conta (sincronizar
// entre aparelhos e recuperar acesso), NUNCA obrigatório pra usar o app de
// graça. Login só é exigido na hora de assinar (ver PlanosScreen.js).
import 'react-native-url-polyfill/auto';
import { Linking, Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kroadufkgvymsfzulfzn.supabase.co';
// Chave PUBLICÁVEL — feita pra ir no código do cliente (protegida por RLS no
// servidor). A chave secreta (sb_secret_...) nunca entra aqui, nem em nenhum
// arquivo deste app, nem no git — só ficaria num .env de backend, se um dia
// alguma operação admin-side precisar dela.
const SUPABASE_ANON_KEY = 'sb_publishable_WdfVRiNfe-vPQ1NIfXONtA_vOa9F63t';

// URL real do app publicado (mesma que scripts/deploy-vercel.sh usa, ver
// experiments.baseUrl em app.json) — sem isso, o Supabase usa o "Site URL"
// padrão do projeto (localhost:3000, valor de exemplo que nunca foi trocado
// nas configurações do projeto), então o link de confirmação de e-mail leva
// a pessoa pra um localhost que não existe no aparelho dela, dando erro de
// conexão bem no meio do cadastro. É o mesmo redirectTo usado pro login com
// Google, mais abaixo.
const EMAIL_REDIRECT_URL = 'https://cosmicguide.cloud/cosmic-guide/';

// NO ANDROID/iOS esse endereço web não serve: quem aprova o login do Google
// (ou toca no link de confirmação de e-mail) é o NAVEGADOR, e mandá-lo pro
// site deixa a pessoa logada lá fora enquanto o app continua deslogado pra
// sempre — o login simplesmente não existe no aparelho. O caminho de volta
// pro app é o esquema declarado em app.json ("scheme": "cosmicguide").
// É o mesmo valor que makeRedirectUri({ scheme: 'cosmicguide' }) devolveria
// num build nativo, então não vale um pacote a mais só pra montar a string.
// DEPENDE DE CONFIGURAÇÃO MANUAL: 'cosmicguide://' precisa estar na lista de
// Redirect URLs do projeto Supabase (Authentication → URL Configuration). Sem
// isso o Supabase IGNORA este redirectTo e manda a pessoa pro Site URL — o
// login nativo continua sem voltar pro app, por mais correto que seja o código.
const NATIVE_REDIRECT_URL = 'cosmicguide://';
const NATIVO = Platform.OS !== 'web';
// Web fica EXATAMENTE como sempre foi (volta pra própria página publicada).
const REDIRECT_URL = NATIVO ? NATIVE_REDIRECT_URL : EMAIL_REDIRECT_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Precisa ser true na web pra completar o login com Google: depois do
    // redirect de volta do Google/Supabase, é essa opção que faz o cliente
    // ler o token/código na própria URL e efetivar a sessão sozinho — sem
    // isso (como estava antes, sempre false, herdado de um exemplo focado em
    // app nativo), o app recarregava logado como "convidado" mesmo depois de
    // aprovar o Google, porque ninguém nunca lia o que veio na URL.
    detectSessionInUrl: Platform.OS === 'web',
    // Sem isso, o SDK usa 'implicit' (padrão) e o access_token/refresh_token
    // reais voltam crus na URL depois do login com Google (#access_token=...),
    // ficando gravados no histórico do navegador — achado real de auditoria
    // (18/07/2026). Com PKCE, só um "code" de uso único trafega pela URL,
    // trocado por sessão via POST por baixo dos panos pelo próprio SDK.
    flowType: 'pkce',
  },
});

// Cada código PKCE é de USO ÚNICO e, no nativo, o MESMO retorno chega duas
// vezes: pelo listener de deep link abaixo e pelo openAuthSessionAsync. No
// ANDROID quem chega PRIMEIRO é o listener daqui — lá o expo-web-browser não
// tem ASWebAuthenticationSession (_authSessionIsNativelySupported() é
// `Platform.OS !== 'android'`) e cai num polyfill que só registra o listener
// DELE na hora da chamada, enquanto este já está registrado desde o import; o
// emitter do React Native entrega na ordem de registro. Guardando a PROMESSA
// da troca (e não só "esse código já foi usado") existe UM caminho só de
// conclusão: quem chegar depois espera a MESMA troca e recebe a mesma resposta,
// em vez de achar que não tem nada a fazer e deixar a tela de login parada.
// ponytail: Map sem limpeza — são poucos códigos por execução do app.
const trocas = new Map();

async function efetuarTroca(code) {
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return { error: traduzErro(error.message) };
    return { concluido: true };
  } catch (e) {
    // Cair a rede no meio da troca vira mensagem na tela, não uma promessa
    // rejeitada solta (o listener de deep link não tem quem a pegue).
    return { error: traduzErro(e && e.message) };
  }
}

// Na web quem lê o retorno da URL e abre a sessão é o detectSessionInUrl do
// próprio SDK. Fora do navegador ele não roda — a troca do "code" por sessão
// tem que ser feita à mão, e é isso que faltava pro login voltar pro app.
async function trocarCodigoPorSessao(url) {
  const query = url && url.split('#')[0].split('?')[1];
  if (!query) return {};
  const params = new URLSearchParams(query);
  // O que vem aqui é o erro CRU do Supabase/Google ('access_denied',
  // 'server_error', 'Login cancelled'), sempre em inglês — e ia direto pra
  // tela num app que existe em pt/es/en. Vira chave de i18n: a pessoa lê uma
  // frase honesta no idioma dela em vez de um código de erro em outra língua.
  if (params.has('error') || params.has('error_description')) return { error: 'login.error.generic' };
  const code = params.get('code');
  if (!code) return {};
  if (!trocas.has(code)) trocas.set(code, efetuarTroca(code));
  return trocas.get(code);
}

// Link de confirmação de e-mail / recuperação de senha tocado no celular: ele
// abre o app direto (não a tela de login), então ninguém está esperando essa
// resposta — o onAuthStateChange do AuthContext atualiza a UI sozinho.
if (NATIVO) {
  Linking.getInitialURL().then(trocarCodigoPorSessao).catch(() => {});
  Linking.addEventListener('url', ({ url }) => trocarCodigoPorSessao(url));
}

// Devolve { error } em caso de falha — e o valor é uma CHAVE de i18n
// (login.error.*), nunca texto pronto: quem traduz é a tela, no idioma da
// pessoa. Sem sessão de volta (precisa confirmar e-mail) -> needsConfirmation.
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: REDIRECT_URL },
  });
  if (error) return { error: traduzErro(error.message) };
  return { needsConfirmation: !data.session };
}

export async function signInWithEmail(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: traduzErro(error.message) };
  return {};
}

// Redireciona pro Google (fluxo OAuth do próprio navegador) e, na volta, o
// Supabase já devolve a sessão pronta — detectSessionInUrl (acima) é quem
// completa o login sozinho, o AuthContext já escuta onAuthStateChange e
// atualiza a UI. No nativo esse "de volta" não existe de graça: a aba de
// autenticação é aberta por nós e o código que ela devolve é trocado por
// sessão aqui mesmo, devolvendo { concluido: true } pra tela de login saber
// que a pessoa entrou (na web ela nem existe mais nesse momento).
// Exige o provedor Google habilitado nas configurações do
// projeto Supabase (Authentication → Providers) com um Client ID/Secret
// reais do Google Cloud Console — sem isso configurado no painel, o próprio
// Supabase devolve um erro claro dizendo que o provedor não está habilitado.
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: REDIRECT_URL,
      // No nativo o SDK não tem "página" pra abandonar: ele só monta a URL do
      // Google e nós abrimos numa aba de autenticação do sistema, que fecha
      // sozinha no redirect de volta e nos entrega a URL final.
      skipBrowserRedirect: NATIVO,
    },
  });
  if (error) return { error: traduzErro(error.message) };
  if (!NATIVO) return {};
  // Só o nativo abre aba de autenticação: pedir o módulo aqui dentro mantém o
  // expo-web-browser fora do que a web avalia no arranque (o único consumidor
  // web é a tela de Planos, que é chunk lazy).
  const WebBrowser = require('expo-web-browser');
  let result;
  try {
    result = await WebBrowser.openAuthSessionAsync(data.url, NATIVE_REDIRECT_URL);
  } catch {
    // O único await do módulo que LANÇA de verdade: aparelho sem navegador
    // (ActivityNotFoundException no Android) ou aba de autenticação já aberta
    // — a lib re-lança nos dois casos. Como esta função devolve { error } por
    // contrato, deixar a exceção subir matava o setGoogleLoading(false) da
    // LoginScreen e a tela ficava girando pra sempre (o botão já virou
    // ActivityIndicator, não sobra nem um segundo toque pra se recuperar).
    return { error: 'login.error.generic' };
  }
  // Fechou a aba / apertou voltar: desistir não é erro, não há o que avisar.
  if (result.type !== 'success') return {};
  return trocarCodigoPorSessao(result.url);
}

// Recuperar senha — até 29/07/2026 quem esquecia a senha não tinha caminho
// NENHUM na tela de login (nem link, nem chave de tradução), e isso travava o
// funil inteiro de assinatura, já que PlanosScreen exige conta pra comprar.
// Mesmo redirectTo do cadastro: o link do e-mail devolve a pessoa pro app
// publicado, onde o Supabase abre a sessão de recuperação sozinho.
export async function resetPasswordForEmail(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: REDIRECT_URL,
  });
  if (error) return { error: traduzErro(error.message) };
  return {};
}

export async function signOut() {
  await supabase.auth.signOut();
}

// Mensagem do Supabase (sempre em inglês) -> chave de i18n. Antes as frases
// eram CRAVADAS em português, então quem usava o app em es/en via a única tela
// obrigatória do funil de assinatura falar outra língua; e o caso desconhecido
// devolvia a mensagem crua do servidor ('Email rate limit exceeded') pra tela.
// O fallback agora é honesto e traduzido: não completou, tente de novo.
function traduzErro(mensagem) {
  if (!mensagem) return 'login.error.generic';
  if (mensagem.includes('Invalid login credentials')) return 'login.error.credentials';
  if (mensagem.includes('User already registered')) return 'login.error.alreadyRegistered';
  if (mensagem.includes('Password should be at least')) return 'login.error.weakPassword';
  if (mensagem.includes('Unable to validate email address')) return 'login.error.invalidEmail';
  if (mensagem.includes('provider is not enabled')) return 'login.error.googleOff';
  return 'login.error.generic';
}
