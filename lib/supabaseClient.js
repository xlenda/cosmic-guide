// lib/supabaseClient.js
// Projeto Supabase "guia cósmico" — usado só pra login/conta (sincronizar
// entre aparelhos e recuperar acesso), NUNCA obrigatório pra usar o app de
// graça. Login só é exigido na hora de assinar (ver PlanosScreen.js).
import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
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

// Devolve { error } em caso de falha (mensagem já em português quando o
// Supabase manda uma mensagem conhecida, senão a mensagem crua). Sem sessão
// de volta (precisa confirmar e-mail) -> devolve needsConfirmation: true.
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: EMAIL_REDIRECT_URL },
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
// atualiza a UI. Exige o provedor Google habilitado nas configurações do
// projeto Supabase (Authentication → Providers) com um Client ID/Secret
// reais do Google Cloud Console — sem isso configurado no painel, o próprio
// Supabase devolve um erro claro dizendo que o provedor não está habilitado.
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: EMAIL_REDIRECT_URL },
  });
  if (error) return { error: traduzErro(error.message) };
  return {};
}

export async function signOut() {
  await supabase.auth.signOut();
}

function traduzErro(mensagem) {
  if (!mensagem) return 'Não foi possível completar. Tente de novo.';
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (mensagem.includes('User already registered')) return 'Já existe uma conta com esse e-mail.';
  if (mensagem.includes('Password should be at least')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (mensagem.includes('Unable to validate email address')) return 'E-mail inválido.';
  if (mensagem.includes('provider is not enabled')) return 'Login com Google ainda não foi ativado nas configurações do projeto.';
  return mensagem;
}
