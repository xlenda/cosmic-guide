// lib/supabaseClient.js
// Projeto Supabase "guia cósmico" — usado só pra login/conta (sincronizar
// entre aparelhos e recuperar acesso), NUNCA obrigatório pra usar o app de
// graça. Login só é exigido na hora de assinar (ver PlanosScreen.js).
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://kroadufkgvymsfzulfzn.supabase.co';
// Chave PUBLICÁVEL — feita pra ir no código do cliente (protegida por RLS no
// servidor). A chave secreta (sb_secret_...) nunca entra aqui, nem em nenhum
// arquivo deste app, nem no git — só ficaria num .env de backend, se um dia
// alguma operação admin-side precisar dela.
const SUPABASE_ANON_KEY = 'sb_publishable_WdfVRiNfe-vPQ1NIfXONtA_vOa9F63t';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Devolve { error } em caso de falha (mensagem já em português quando o
// Supabase manda uma mensagem conhecida, senão a mensagem crua). Sem sessão
// de volta (precisa confirmar e-mail) -> devolve needsConfirmation: true.
export async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: traduzErro(error.message) };
  return { needsConfirmation: !data.session };
}

export async function signInWithEmail(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
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
  return mensagem;
}
