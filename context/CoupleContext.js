// Contexto global do perfil do casal — envolve lib/coupleData.js (a camada de
// armazenamento em si não muda) para que HomeScreen, QuizScreen, ProfileScreen e
// PrivacyScreen compartilhem o mesmo estado reativo em vez de cada tela ler/gravar
// o AsyncStorage/SecureStore por conta própria e ficar fora de sincronia.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  getCoupleData,
  saveCoupleProfile,
  deleteAllCoupleData,
  getUserSign,
  saveUserSign,
  checkSubscriptionStatus,
} from '../lib/coupleData';

const CoupleContext = createContext(null);

export function CoupleProvider({ children }) {
  const [coupleData, setCoupleData] = useState(null);
  const [soloSign, setSoloSign] = useState(null);
  const [loading, setLoading] = useState(true);
  // Otimista (mesmo padrão do FeatureGate/AppNavInner do funil web): não bloqueia
  // nada até confirmar, via servidor, que o casal realmente não tem acesso.
  const [hasAccess, setHasAccess] = useState(true);
  // status/currentPeriodEnd vêm do mesmo checkSubscriptionStatus que já preenche
  // hasAccess — antes eram descartados, então nenhuma tela sabia se um assinante
  // estava em trial, quando renovava, ou já tinha cancelado. null até a primeira
  // resposta real do servidor chegar (nunca inventa um valor antes disso).
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);

  // Guarda qual foi a chamada mais recente a refreshAccess: se duas se
  // sobrepuserem (ex.: PlanosScreen ganhando foco de novo rapidamente), só o
  // resultado da chamada MAIS NOVA pode aplicar setHasAccess — sem isso, uma
  // resposta de rede antiga que demora mais para voltar podia chegar depois e
  // sobrescrever um resultado mais recente e correto.
  const requestIdRef = useRef(0);

  // Só existe assinatura para casais (o produto monetizado é a experiência de
  // casal) — modo solo nunca chama o backend e fica sempre com hasAccess=true.
  const refreshAccess = useCallback(async (profile) => {
    const p = profile !== undefined ? profile : coupleData;
    const myId = ++requestIdRef.current;
    if (!p) {
      if (myId === requestIdRef.current) setHasAccess(true);
      return;
    }
    const estado = await checkSubscriptionStatus(p.voce, p.amor);
    if (myId === requestIdRef.current) {
      setHasAccess(Boolean(estado?.hasAccess));
      setSubscriptionStatus(estado?.status || null);
      setCurrentPeriodEnd(estado?.currentPeriodEnd || null);
    }
  }, [coupleData]);

  const refresh = useCallback(async () => {
    const [profile, sign] = await Promise.all([getCoupleData(), getUserSign()]);
    setCoupleData(profile);
    setSoloSign(sign);
    setLoading(false);
    await refreshAccess(profile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useCallback(
    async (partial) => {
      const ok = await saveCoupleProfile(partial);
      await refresh();
      return ok;
    },
    [refresh]
  );

  // Onboarding solo ("Só eu"): salva o signo escolhido e recarrega o contexto.
  // soloSign passa a existir e o Gate em App.js troca sozinho para o
  // Tab.Navigator, sem precisar de outro sinal. Propaga o boolean de sucesso
  // para quem chamou poder mostrar um erro/retry em vez de assumir sucesso.
  const saveSolo = useCallback(
    async (signObj) => {
      const ok = await saveUserSign(signObj);
      await refresh();
      return ok;
    },
    [refresh]
  );

  const clearAll = useCallback(async () => {
    await deleteAllCoupleData();
    await refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // A checagem do cold start (dentro de refresh()) já tenta 3x sozinha, mas uma
  // falha realmente prolongada (ex.: backend fora do ar por minutos) só seria
  // corrigida se o usuário abrisse a tela de Planos manualmente. Recheca de novo
  // quando o app volta pro primeiro plano e periodicamente enquanto está aberto,
  // pra um cliente que já pagou nunca ficar preso num hasAccess=false antigo.
  const RECHECK_INTERVAL_MS = 5 * 60 * 1000;
  useEffect(() => {
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') refreshAccess();
    }, RECHECK_INTERVAL_MS);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') refreshAccess();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [refreshAccess]);

  return (
    <CoupleContext.Provider
      value={{
        coupleData,
        soloSign,
        loading,
        hasAccess,
        subscriptionStatus,
        currentPeriodEnd,
        refresh,
        refreshAccess,
        save,
        saveSolo,
        clearAll,
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  return useContext(CoupleContext);
}
