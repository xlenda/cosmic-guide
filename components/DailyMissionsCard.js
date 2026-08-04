// components/DailyMissionsCard.js
// Card "Missões de hoje" — a cara do pedido do dono ("faz as missões diárias,
// vai acumulando token"). UI pura por cima do motor lib/missions.js: as 3
// missões do dia com estado, recompensa visível (+5 cada), progresso 3/3 e o
// bônus de +10 pra quem fecha o dia.
//
// Como o crédito acontece (retenção saudável, sem clique-isca):
// - No FOCO da tela, o card tenta concluir cada missão pendente via
//   completeMission() — que só credita se o verificador achar a EVIDÊNCIA
//   real (marcador de ação do dia ou entrada de hoje no Diário Cósmico).
//   Quem fez, ganha ao voltar; quem não fez, não ganha — nunca há botão
//   "resgatar" em cima de nada que não aconteceu.
// - Missão pendente é tocável e leva DIRETO pra tela da ação (ROUTES), que é
//   o único jeito honesto de "completar": fazendo.
// - O bônus 3/3 é o único toque de resgate explícito — um momento de
//   celebração, não uma engrenagem escondida.
//
// Ponte do Pensamento Cósmico: a Home JÁ grava 'cosmic-daily-thought-last-read'
// (YYYY-MM-DD local) quando a pessoa abre o pensamento do dia — usamos essa
// chave como evidência e convertemos em recordMissionAction() aqui, sem tocar
// na HomeScreen (outro time está nela agora).
import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import { Alert } from '../lib/webAlert';
import { localDayStr } from '../lib/localDay';
import { getTodaysLovePhrase } from '../lib/lovePhrase';
import { useLanguage } from '../context/LanguageContext';
import {
  getTodaysMissions,
  getMissionProgress,
  completeMission,
  claimDailyBonus,
  recordMissionAction,
  MISSION_ACTIONS,
  ALL_DONE_BONUS,
} from '../lib/missions';

// Chave que a HomeScreen já grava (THOUGHT_READ_KEY lá) — só LEMOS aqui.
const THOUGHT_READ_KEY = 'cosmic-daily-thought-last-read';

// Pra onde cada missão pendente leva ao ser tocada. CHAT_TAB e TAROT_TAB são
// tabs (o navigate borbulha do stack pro tab navigator); o resto vive no
// mesmo HomeStack em que Agir está registrado (ver App.js).
const MISSION_ROUTE = {
  'pensamento-do-dia': ROUTES.HOME_MAIN,
  'compartilhar-frase': ROUTES.HOME_MAIN,
  'calendario-lunar': ROUTES.LUNAR_CALENDAR,
  'horoscopo-do-dia': ROUTES.HOROSCOPE,
  'conversa-mistica': ROUTES.CHAT_TAB,
  'tiragem-tarot': ROUTES.TAROT_TAB,
  'leitura-do-dia': ROUTES.TAROT_TAB,
  'ritual-do-cafe': ROUTES.COFFEE,
  'leitura-de-sonho': ROUTES.DREAM,
  'insight-no-diario': ROUTES.DIARY,
};

export default function DailyMissionsCard() {
  const navigation = useNavigation();
  const { lang, t } = useLanguage();
  const [missions, setMissions] = useState(null); // null = ainda carregando (não pisca card vazio)
  const [progress, setProgress] = useState(null);
  const [justAwarded, setJustAwarded] = useState(0);
  const [claiming, setClaiming] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        // 1) Ponte do Pensamento: chave da Home de hoje vira marcador de ação.
        try {
          const last = await AsyncStorage.getItem(THOUGHT_READ_KEY);
          if (last === localDayStr()) {
            await recordMissionAction(MISSION_ACTIONS.PENSAMENTO_LIDO);
          }
        } catch {}

        // 2) Auto-crédito honesto: tenta concluir cada pendente; o motor só
        //    deixa passar com evidência de HOJE (e nunca credita duas vezes).
        let list = await getTodaysMissions();
        let awardedNow = 0;
        for (const m of list) {
          if (m.done) continue;
          const res = await completeMission(m.id);
          if (res.ok) awardedNow += res.awarded;
        }
        if (awardedNow > 0) list = await getTodaysMissions();
        const prog = await getMissionProgress();

        if (!active) return;
        setMissions(list);
        setProgress(prog);
        setJustAwarded(awardedNow);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

  async function claimBonus() {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await claimDailyBonus();
      if (res.ok) {
        Alert.alert('Bônus cósmico! ✨', `+${res.awarded} tokens por completar as 3 missões de hoje.`);
        setProgress(await getMissionProgress());
      } else {
        // 'ja-resgatado' / 'missoes-pendentes' — só realinha a UI, sem drama.
        setProgress(await getMissionProgress());
      }
    } finally {
      setClaiming(false);
    }
  }

  async function goDo(mission) {
    // Compartilhar a frase acontece AQUI, num toque — não navega. A missão
    // mandava pra HOME_MAIN, mas o cartão da frase fica no FIM do scroll da
    // Home: o testador caiu no topo, não viu frase nenhuma e entendeu que a
    // missão "não está liberada" (relato real, 29/07/2026). Mesmo texto e
    // mesmo registro de ação do handleShareLovePhrase da Home — a folha de
    // compartilhar abre direto e a missão se completa no retorno do foco.
    if (mission.id === 'compartilhar-frase') {
      try {
        const frase = getTodaysLovePhrase(lang);
        const result = await Share.share({ message: `${frase}\n\n💜 https://cosmicguide.cloud` });
        // Na web, Share.share resolve sem action quando usa navigator.share;
        // só registra quando não foi cancelado explicitamente.
        if (!result || result.action !== Share.dismissedAction) {
          await recordMissionAction(MISSION_ACTIONS.FRASE_COMPARTILHADA);
          // Credita e re-renderiza na hora — sem esperar o próximo foco da
          // tela (a pessoa está olhando pro card agora; "compartilhei e não
          // marcou" seria o mesmo bug de confiança com outra roupa).
          await completeMission(mission.id);
          setMissions(await getTodaysMissions());
          setProgress(await getMissionProgress());
        }
      } catch {
        // navegador sem navigator.share (desktop antigo): cai pro caminho
        // antigo — leva pra Home, onde o cartão da frase tem o botão.
        navigation.navigate(ROUTES.HOME_MAIN);
      }
      return;
    }
    const route = MISSION_ROUTE[mission.id];
    if (route) navigation.navigate(route);
  }

  function goLoja() {
    navigation.navigate(ROUTES.PROFILE_TAB, { screen: ROUTES.LOJA });
  }

  if (!missions || !progress) return null;

  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <View>
      <View style={s.headRow}>
        <Text style={s.title}>{t('missions.today')}</Text>
        <Text style={s.count}>{progress.done}/{progress.total}</Text>
      </View>
      <View style={s.card}>
        {justAwarded > 0 && (
          <View style={s.awardBanner}>
            <Ionicons name="sparkles" size={14} color={colors.gold} />
            <Text style={s.awardBannerText}>+{justAwarded} tokens pelas missões que você já fez hoje</Text>
          </View>
        )}

        <View style={s.progressTrack}>
          <View style={[s.progressFill, { width: `${pct}%` }]} />
        </View>

        {missions.map((m) => (
          <TouchableOpacity
            key={m.id}
            style={[s.row, m.done && s.rowDone]}
            activeOpacity={0.8}
            disabled={m.done}
            onPress={() => goDo(m)}
          >
            <Text style={s.rowEmoji}>{m.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.rowTitle, m.done && s.rowTitleDone]}>{m.title}</Text>
              <Text style={s.rowDesc}>{m.done ? 'Concluída — tokens no seu saldo ✓' : m.desc}</Text>
            </View>
            <View style={[s.chip, m.done && s.chipDone]}>
              <Ionicons name={m.done ? 'checkmark' : 'diamond'} size={11} color={m.done ? colors.green : colors.gold} />
              <Text style={[s.chipText, m.done && s.chipTextDone]}>+{m.reward}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {progress.bonusAvailable ? (
          <TouchableOpacity style={s.bonusBtn} activeOpacity={0.85} onPress={claimBonus} disabled={claiming}>
            <Ionicons name="gift" size={15} color="#fff" />
            <Text style={s.bonusBtnText}>{claiming ? '...' : `Resgatar bônus de +${progress.bonusReward} ✨`}</Text>
          </TouchableOpacity>
        ) : progress.bonusClaimed ? (
          <Text style={s.bonusDoneText}>Dia completo! Bônus de +{ALL_DONE_BONUS} resgatado ✓</Text>
        ) : (
          <Text style={s.bonusHint}>Complete as 3 missões e ganhe +{ALL_DONE_BONUS} de bônus.</Text>
        )}

        {/* Link auxiliar SUTIL de propósito (linha cinza dotted) — o destaque
            visual fica com as missões, não com a Loja. */}
        <TouchableOpacity onPress={goLoja}>
          <Text style={s.lojaLink}>{t('missions.storeLink')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, marginBottom: 10 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  count: { color: colors.gold, fontSize: 13, fontWeight: '700' },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },

  awardBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.gold + '18', borderWidth: 1, borderColor: colors.gold + '40',
    borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10,
  },
  awardBannerText: { flex: 1, color: colors.gold, fontSize: 12, fontWeight: '700' },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.gold },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  rowDone: { borderColor: colors.green + '55', backgroundColor: colors.green + '10' },
  rowEmoji: { fontSize: 20 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  rowTitleDone: { opacity: 0.75 },
  rowDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },

  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    borderWidth: 1, borderColor: colors.gold + '55', backgroundColor: colors.gold + '14',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
  },
  chipDone: { borderColor: colors.green + '55', backgroundColor: colors.green + '14' },
  chipText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  chipTextDone: { color: colors.green },

  bonusBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 11, marginTop: 4,
  },
  bonusBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  bonusDoneText: { color: colors.green, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  bonusHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 6 },

  lojaLink: {
    color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 10,
    textDecorationLine: 'underline', textDecorationStyle: 'dotted',
  },
});
