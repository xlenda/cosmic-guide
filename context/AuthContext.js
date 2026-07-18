// context/AuthContext.js
// Sessão de conta (Supabase) — separada do CoupleContext de propósito: uma
// pessoa pode usar o app inteiro sem nunca logar (login só é exigido na hora
// de assinar, ver PlanosScreen.js). `user`/`session` ficam null até logar.
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, signInWithEmail, signUpWithEmail, signOut as signOutSupabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
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
    signOut: signOutSupabase,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
