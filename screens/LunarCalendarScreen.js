import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, AppState } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import { getMoonPhaseToday, getMoonPhaseForCurrentMonth } from '../lib/lunarCalendar';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { useCouple } from '../context/CoupleContext';

const FEATURE_KEY = 'lunarCalendar';

// Mesmo tom honesto de lib/palmReadings.js / lib/chatResponses.js: a fase em
// si é astronomia real (astronomy-engine), mas a reflexão que a acompanha é
// simbólica — nunca previsão garantida.
const DISCLAIMER =
  'A fase da Lua é calculada com astronomia real (posição Sol-Lua). As reflexões que ' +
  'acompanham cada fase seguem a tradição milenar dos ciclos lunares — um convite simbólico, ' +
  'não uma garantia de resultado.';

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export default function LunarCalendarScreen() {
  const navigation = useNavigation();
  const { hasAccess } = useCouple();
  const [refreshTick, setRefreshTick] = useState(0);
  const [locked, setLocked] = useState(false);

  // Sem botão de ação nesta tela — o conteúdo aparece já ao montar, então o
  // próprio "uso" é a montagem. Por isso a checagem e a marcação acontecem
  // juntas aqui: só marca como usado quando a checagem confirma que ainda
  // não tinha sido usado (senão marcaria de novo a cada montagem), e só
  // bloqueia (setLocked(true)) quando já tinha sido usado antes — nunca na
  // mesma visita em que a pessoa está consumindo seu uso grátis.
  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (used) {
        setLocked(true);
      } else {
        markFeatureUsedOnce(FEATURE_KEY);
      }
    });
  }, [hasAccess]);

  // A tela fica montada dentro da stack da Tab (não desmonta ao navegar pra
  // outra aba), então "hoje" precisa ser recalculado sempre que ela ganha
  // foco de novo OU quando o app volta do background enquanto ela já é a
  // tela atual — senão, deixar o app em segundo plano de um dia pro outro
  // mantinha a fase da Lua calculada na primeira montagem, mostrando a fase
  // de ontem rotulada como "hoje".
  useFocusEffect(
    useCallback(() => {
      setRefreshTick((tick) => tick + 1);

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          setRefreshTick((tick) => tick + 1);
        }
      });

      return () => subscription.remove();
    }, [])
  );

  // getMoonPhaseForCurrentMonth já é barata (no máximo 31 cálculos
  // trigonométricos O(1)), então recalcular a cada refreshTick não pesa.
  const today = useMemo(() => getMoonPhaseToday(), [refreshTick]);
  const monthDays = useMemo(() => getMoonPhaseForCurrentMonth(), [refreshTick]);
  const monthLabel = useMemo(
    () => capitalize(new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })),
    [refreshTick]
  );
  const todayNumber = new Date().getDate();

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Calendário Lunar" gradient={gradients.hero} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Calendário Lunar"
        subtitle="Fases da Lua em tempo real"
        onBack={() => navigation.goBack()}
        gradient={gradients.teal}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {today ? (
          <View style={styles.todayCard}>
            <Text style={styles.todayEmoji}>{today.emoji}</Text>
            <Text style={styles.todayName}>{today.name}</Text>
            {today.illumination !== null ? (
              <Text style={styles.todayIllum}>{today.illumination}% iluminada hoje</Text>
            ) : null}
            <Text style={styles.todayReflection}>{today.reflexao}</Text>
          </View>
        ) : (
          <View style={styles.todayCard}>
            <Text style={styles.todayReflection}>
              Não foi possível calcular a fase da Lua agora. Tente novamente mais tarde.
            </Text>
          </View>
        )}

        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

        <Text style={styles.sectionTitle}>{monthLabel}</Text>
        <View style={styles.monthList}>
          {monthDays.map(({ day, phase }) => {
            const isToday = day === todayNumber;
            return (
              <View key={day} style={[styles.dayRow, isToday && styles.dayRowToday]}>
                <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{day}</Text>
                <Text style={styles.dayEmoji}>{phase ? phase.emoji : '—'}</Text>
                <Text style={styles.dayPhaseName} numberOfLines={1}>
                  {phase ? phase.name : 'Indisponível'}
                </Text>
                {phase && phase.illumination !== null ? (
                  <Text style={styles.dayIllum}>{phase.illumination}%</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  todayCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  todayEmoji: { fontSize: 56 },
  todayName: { color: colors.text, fontSize: 22, fontWeight: '800', marginTop: 4 },
  todayIllum: { color: colors.teal, fontSize: 14, fontWeight: '700' },
  todayReflection: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  monthList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  dayRowToday: { backgroundColor: 'rgba(92,224,216,0.12)' },
  dayNumber: { color: colors.textMuted, fontSize: 14, fontWeight: '700', width: 22 },
  dayNumberToday: { color: colors.teal },
  dayEmoji: { fontSize: 20, width: 28 },
  dayPhaseName: { color: colors.text, fontSize: 14, flex: 1 },
  dayIllum: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
