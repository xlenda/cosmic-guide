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
  checkSoloSubscriptionStatus,
} from '../lib/coupleData';
import { useAuth } from './AuthContext';

const CoupleContext = createContext(null);

// Bypass de revisão pro dono do produto — libera as telas exclusivas de
// assinante (withFeatureGate) só pra essa conta específica, sem tocar em
// hasAccess/subscriptionStatus real nem no que qualquer outro usuário vê.
// Pedido explícito (17/07/2026): poder ver Reconectar/Descobrir/Agir/
// Progresso/Retrospectiva sem precisar assinar de verdade.
const OWNER_EMAIL = 'sanches925@gmail.com';

export function CoupleProvider({ children }) {
  const { user } = useAuth();
  const isOwnerAccount = user?.email === OWNER_EMAIL;
  const [coupleData, setCoupleData] = useState(null);
  const [soloSign, setSoloSign] = useState(null);
  const [loading, setLoading] = useState(true);
  // Otimista (mesmo padrão do FeatureGate/AppNavInner do funil web): não bloqueia
  // nada até confirmar, via servidor, que o casal realmente não tem acesso.
  const [hasAccess, setHasAccess] = useState(true);
  // true até a primeira resposta real do servidor chegar, e sempre que
  // checkSubscriptionStatus conseguir confirmar de verdade (mesmo que a
  // resposta seja "sem acesso"). Só vira false no fallback final de rede
  // (3 tentativas falhas, lib/coupleData.js) — telas que marcam "prévia
  // grátis usada" (lib/featureUsage.js) devem checar isto antes de marcar,
  // senão queimam a prévia de um assinante de verdade por causa de uma
  // instabilidade de rede passageira (achado real de auditoria, 25/07/2026).
  const [accessConfirmed, setAccessConfirmed] = useState(true);
  // Só true com assinatura de CASAL ativa (nunca solo) — usado pelo
  // FeatureGate.js pras 5 telas exclusivas de casal (Reconectar/Descobrir/
  // Agir/Progresso/Retrospectiva), que continuam "casal only" mesmo agora que
  // solo também pode assinar (hasAccess combinado desbloquearia isso por
  // engano se usado aqui — pedido explícito do Lenda, 25/07/2026).
  const [hasCoupleAccess, setHasCoupleAccess] = useState(true);
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

  // Existe assinatura tanto pra casal (voce+amor) quanto solo (e-mail de login,
  // já que não há par) — pedido explícito do Lenda (25/07/2026): monetizar os
  // dois jeitos de usar o app, não só casal. As duas checagens rodam em
  // paralelo e sempre em conjunto (não só a que bate com o modo atual): assim,
  // quem assinou sozinho e depois forma um casal (ou vice-versa) não perde o
  // acesso que já pagou só porque `coupleData` mudou de estado.
  const refreshAccess = useCallback(async (profile) => {
    const p = profile !== undefined ? profile : coupleData;
    const myId = ++requestIdRef.current;

    const [coupleEstado, soloEstado] = await Promise.all([
      p ? checkSubscriptionStatus(p.voce, p.amor) : Promise.resolve({ hasAccess: false, confirmed: true }),
      user?.email ? checkSoloSubscriptionStatus(user.email) : Promise.resolve({ hasAccess: false, confirmed: true }),
    ]);
    if (myId !== requestIdRef.current) return;

    const hasAccessNow = Boolean(coupleEstado?.hasAccess || soloEstado?.hasAccess);
    // Confirmado de verdade se qualquer um dos dois já confirmou acesso (não
    // precisa esperar o outro), ou se os dois confirmaram "sem acesso". Só
    // fica incerto (confirmed=false) se pelo menos um falhou por rede/5xx e
    // nenhum dos dois confirmou acesso — mesmo espírito do confirmed original,
    // agora olhando as duas fontes juntas.
    const confirmedNow = hasAccessNow || (coupleEstado?.confirmed !== false && soloEstado?.confirmed !== false);
    const winner = coupleEstado?.hasAccess ? coupleEstado : soloEstado?.hasAccess ? soloEstado : coupleEstado;

    setHasAccess(hasAccessNow);
    setHasCoupleAccess(Boolean(coupleEstado?.hasAccess));
    setAccessConfirmed(confirmedNow);
    setSubscriptionStatus(winner?.status || null);
    setCurrentPeriodEnd(winner?.currentPeriodEnd || null);
  }, [coupleData, user]);

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
    await deleteAllCoupleData(user?.email);
    await refresh();
  }, [refresh, user]);

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
        hasCoupleAccess,
        accessConfirmed,
        isOwnerAccount,
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
