// context/AuthContext.js
// Sessão de conta (Supabase) — separada do CoupleContext de propósito: uma
// pessoa pode usar o app inteiro sem nunca logar (login só é exigido na hora
// de assinar, ver PlanosScreen.js). `user`/`session` ficam null até logar.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase, signInWithEmail, signUpWithEmail, signInWithGoogle, resetPasswordForEmail, updatePasswordForCurrentUser, signOut as signOutSupabase } from '../lib/supabaseClient';
import { Alert } from '../lib/webAlert';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

  // Quando o retorno do OAuth/e-mail vem com erro (consentimento cancelado,
  // link expirado, provider mal configurado), o auth-js engole isso num erro
  // interno — nada no app lia esses parâmetros antes, então a pessoa via só
  // o app abrindo como convidada, sem nenhum aviso, achando que tinha logado
  // (achado real de auditoria, 25/07/2026). Só roda na web, onde o retorno
  // vem via query string.
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (!error) return;
    const description = params.get('error_description');
    Alert.alert(
      'Não foi possível entrar',
      description ? decodeURIComponent(description.replace(/\+/g, ' ')) : 'O login não foi concluído. Tente novamente.'
    );
    params.delete('error');
    params.delete('error_description');
    params.delete('error_code');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : '') + window.location.hash);
  }, []);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = {
    session,
    user: session?.user || null,
    loading,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithGoogle,
    resetPassword: resetPasswordForEmail,
    updatePassword: updatePasswordForCurrentUser,
    passwordRecovery,
    finishPasswordRecovery: () => setPasswordRecovery(false),
    signOut: signOutSupabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
