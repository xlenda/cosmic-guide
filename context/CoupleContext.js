// Contexto global do perfil do casal — envolve lib/coupleData.js (a camada de
// armazenamento em si não muda) para que HomeScreen, QuizScreen, ProfileScreen e
// PrivacyScreen compartilhem o mesmo estado reativo em vez de cada tela ler/gravar
// o AsyncStorage/SecureStore por conta própria e ficar fora de sincronia.
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getCoupleData,
  saveCoupleProfile,
  deleteAllCoupleData,
  getUserSign,
  saveUserSign,
  checkSubscriptionStatus,
  checkSoloSubscriptionStatus,
  combineAccessResults,
} from '../lib/coupleData';
import { checkAccountAccess, autoLinkDeviceCodes } from '../lib/accountSubscription';
import { unsubscribeFromWebPush } from '../lib/webPush';
import { cancelDailyThought } from '../lib/notifications';
import { resetFunnelSession } from '../lib/funnel';
import { useAuth } from './AuthContext';

const CoupleContext = createContext(null);

// Bypass de revisão pro dono do produto — libera as telas exclusivas de
// assinante (withFeatureGate) só pra essa conta específica, sem tocar em
// hasAccess/subscriptionStatus real nem no que qualquer outro usuário vê.
// Pedido explícito (17/07/2026): poder ver Reconectar/Descobrir/Agir/
// Progresso/Retrospectiva sem precisar assinar de verdade.
const OWNER_EMAIL = 'sanches925@gmail.com';

export function CoupleProvider({ children }) {
  // authLoading: o AuthProvider resolve a sessão de forma ASSÍNCRONA — no
  // primeiro render user é SEMPRE null, mesmo pra quem está logado. Enquanto
  // authLoading for true, "deslogado" ainda não é um fato: nenhuma checagem
  // de acesso feita nesse intervalo pode contar como resposta definitiva.
  const { user, loading: authLoading } = useAuth();
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

  // TRÊS fontes em paralelo, resolvidas em UNIÃO (ver combineAccessResults em
  // lib/coupleData.js):
  //   1. CONTA logada (GET /api/subscription/me, JWT do Supabase) — a
  //      autoritativa. É ela que faz o acesso seguir a PESSOA e não o
  //      aparelho: trocar de celular, limpar o navegador ou abrir no PC deixa
  //      de tirar o acesso de quem pagou.
  //   2. código de CASAL guardado neste aparelho;
  //   3. código SOLO guardado neste aparelho.
  // As duas últimas continuam existindo e valendo exatamente como antes —
  // deslogado (a maioria do app), backend antigo sem a rota nova, ou
  // Supabase/JWKS fora do ar, é o aparelho que sustenta o assinante.
  // Casal e solo sempre juntos (nunca só o que bate com o modo atual): quem
  // assinou sozinho e depois forma um casal não perde o que já pagou.
  const refreshAccess = useCallback(async (profile) => {
    const p = profile !== undefined ? profile : coupleData;
    const myId = ++requestIdRef.current;

    const [accountEstado, coupleEstado, soloEstado] = await Promise.all([
      // checkAccountAccess também AUTO-REPARA o ponteiro local: quando a conta
      // concede acesso e traz o correlationCode, ele é regravado no aparelho —
      // então um aparelho novo (ou com ponteiro podre) se conserta sozinho no
      // primeiro login e continua funcionando deslogado depois.
      // user=null com a sessão AINDA carregando não é "deslogado", é "não sei
      // ainda" — por isso confirmed: !authLoading nos dois placeholders que
      // dependem da conta. Sem isso, a checagem do arranque devolvia
      // "não assina, CONFIRMADO" pra um assinante solo logado, e as telas
      // queimavam a prévia grátis vitalícia dele antes da sessão resolver
      // (bug reproduzido ao vivo pelo tester, 26/07/2026).
      user
        ? checkAccountAccess({ voce: p?.voce, amor: p?.amor, email: user.email })
        : Promise.resolve({ available: false, hasAccess: false, confirmed: !authLoading, entries: [] }),
      p ? checkSubscriptionStatus(p.voce, p.amor) : Promise.resolve({ hasAccess: false, confirmed: true }),
      user?.email ? checkSoloSubscriptionStatus(user.email) : Promise.resolve({ hasAccess: false, confirmed: !authLoading }),
    ]);
    if (myId !== requestIdRef.current) return;

    const combinado = combineAccessResults({ account: accountEstado, couple: coupleEstado, solo: soloEstado });

    setHasAccess(combinado.hasAccess);
    setHasCoupleAccess(combinado.hasCoupleAccess);
    setAccessConfirmed(combinado.confirmed);
    setSubscriptionStatus(combinado.status);
    setCurrentPeriodEnd(combinado.currentPeriodEnd);

    // AUTO-VÍNCULO (uma vez por conta+código, silencioso): o aparelho tem
    // acesso por código mas a conta não conhece esse código — é o caso
    // "e-mail do pagamento ≠ e-mail do login" (PayPal, cartão do cônjuge,
    // e-mail digitado errado na Hotmart), que o vínculo por e-mail do /me
    // nunca alcança. Vinculamos AGORA, enquanto a prova de posse ainda existe
    // neste aparelho — senão a pessoa só descobre o problema depois de limpar
    // os dados, quando já não tem mais como provar que é dela.
    // Não muda nada na tela (o acesso já estava concedido), então roda depois
    // do setState e nunca reentra em refreshAccess.
    if (user?.id && accountEstado.available && (coupleEstado?.hasAccess || soloEstado?.hasAccess)) {
      autoLinkDeviceCodes({
        userId: user.id,
        voce: p?.voce,
        amor: p?.amor,
        email: user.email,
        entries: accountEstado.entries,
      }).catch(() => {});
    }
  }, [coupleData, user, authLoading]);

  // refresh é estável (deps []) de propósito — save/saveSolo/clearAll e o
  // efeito de arranque dependem dele e não podem re-rodar a cada render. Mas a
  // versão antiga (eslint-disable + chamada direta) capturava PARA SEMPRE o
  // refreshAccess do PRIMEIRO render, quando user ainda é null — então o
  // arranque só consultava o código de CASAL do aparelho e um assinante SOLO
  // logado abria o app direto no paywall (o bug do "libera uma vez e cai pra
  // assinatura de novo" reproduzido pelo tester, 26/07/2026). O ref entrega
  // sempre a versão mais recente sem desestabilizar refresh.
  const refreshAccessRef = useRef(refreshAccess);
  refreshAccessRef.current = refreshAccess;

  const refresh = useCallback(async () => {
    const [profile, sign] = await Promise.all([getCoupleData(), getUserSign()]);
    setCoupleData(profile);
    setSoloSign(sign);
    setLoading(false);
    await refreshAccessRef.current(profile);
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
    // LGPD: "apagar meus dados" também precisa desfazer o rastro FORA do
    // AsyncStorage do casal — a inscrição de Web Push (o servidor guarda
    // signo/streak/diário vinculados ao endpoint, ver lib/webPush.js) e a
    // notificação diária agendada no aparelho (lib/notifications.js). Sem
    // isso, o servidor continuava sabendo o signo e o streak de quem acabou
    // de pedir pra apagar tudo. Nenhuma das duas pode derrubar o resto da
    // limpeza se falhar (as duas gravam em storage fora de try/catch).
    await unsubscribeFromWebPush().catch(() => {});
    await cancelDailyThought().catch(() => {});
    // O uuid ANÔNIMO do funil (lib/funnel.js) morre junto — e o que ainda
    // estava na fila é descartado sem ser enviado. Ele nunca guardou nada
    // pessoal (é aleatório, sem relação com conta/e-mail/perfil), mas "apagar
    // meus dados" tem que apagar TODO rastro deste aparelho, inclusive o
    // identificador que liga uma visita à seguinte. Fica aqui, ao lado do
    // web-push e da notificação, pelo mesmo motivo dos dois: é limpeza FORA do
    // AsyncStorage do casal, e deleteAllCoupleData (lib/coupleData.js) não
    // pode importar lib/funnel.js sem arrastar react-native pra dentro do
    // grafo dela — o que quebraria os 4 testes que a exercitam em node puro.
    await resetFunnelSession().catch(() => {});
    try {
      // Mesmas chaves de lib/webPush.js (ENABLED_KEY) e lib/notifications.js
      // (ENABLED_KEY/NOTIFICATION_ID_KEY) — as funções acima as deixam como
      // 'false'; aqui elas saem de vez, como todo o resto dos dados.
      await AsyncStorage.multiRemove([
        'web-push-enabled',
        'daily-thought-notifications-enabled',
        'daily-thought-notification-id',
      ]);
    } catch {
      // segue — o que importava pro servidor (unsubscribe) já foi tentado acima.
    }
    await deleteAllCoupleData(user?.email);
    await refresh();
  }, [refresh, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // A sessão do Supabase resolve DEPOIS do arranque (AuthProvider é async) —
  // o refresh() acima roda com user=null e, portanto, sem consultar a conta
  // nem o código solo. Quando a sessão resolve (ou a pessoa loga/desloga
  // depois), reconsulta as três fontes com o user real; sem isso, o assinante
  // solo ficava preso no paywall do arranque até o recheck de 5 minutos.
  // Também espera o `loading` do perfil: se disparasse antes de coupleData
  // existir, esta chamada (a mais nova, ver requestIdRef) descartaria a do
  // arranque e consultaria as fontes SEM o código de casal do aparelho.
  useEffect(() => {
    if (authLoading || loading) return;
    refreshAccessRef.current();
  }, [authLoading, loading, user?.id]);

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
        // Enquanto a sessão não resolveu, "ainda não sei" — nenhuma tela pode
        // marcar prévia grátis usada (lib/featureUsage.js) nem travar no
        // OneTimeLock com base numa checagem que ignorou a conta logada. As
        // telas já tratam accessConfirmed=false como "não marcar, não bloquear".
        accessConfirmed: authLoading ? false : accessConfirmed,
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
