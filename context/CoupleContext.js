// Contexto global do perfil do casal — envolve lib/coupleData.js (a camada de
// armazenamento em si não muda) para que HomeScreen, QuizScreen, ProfileScreen e
// PrivacyScreen compartilhem o mesmo estado reativo em vez de cada tela ler/gravar
// o AsyncStorage/SecureStore por conta própria e ficar fora de sincronia.
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

  // Só existe assinatura para casais (o produto monetizado é a experiência de
  // casal) — modo solo nunca chama o backend e fica sempre com hasAccess=true.
  const refreshAccess = useCallback(async (profile) => {
    const p = profile !== undefined ? profile : coupleData;
    if (!p) {
      setHasAccess(true);
      return;
    }
    const estado = await checkSubscriptionStatus(p.voce, p.amor);
    setHasAccess(Boolean(estado?.hasAccess));
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
      await saveCoupleProfile(partial);
      await refresh();
    },
    [refresh]
  );

  // Onboarding solo ("Só eu"): salva o signo escolhido e recarrega o contexto.
  // soloSign passa a existir e o Gate em App.js troca sozinho para o
  // Tab.Navigator, sem precisar de outro sinal.
  const saveSolo = useCallback(
    async (signObj) => {
      await saveUserSign(signObj);
      await refresh();
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

  return (
    <CoupleContext.Provider
      value={{ coupleData, soloSign, loading, hasAccess, refresh, refreshAccess, save, saveSolo, clearAll }}
    >
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  return useContext(CoupleContext);
}
