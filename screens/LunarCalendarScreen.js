import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import { getMoonPhaseToday, getMoonPhaseForCurrentMonth } from '../lib/lunarCalendar';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

// O rótulo do mês segue o idioma do APP (LanguageContext), não o locale do
// aparelho — 'pt-BR' cravado aqui era o exemplo citado no cabeçalho do bloco
// CALENDARIO_COSMICO_I18N de lib/i18n.js do que não repetir.
const LOCALE_DO_IDIOMA = { pt: 'pt-BR', es: 'es', en: 'en-US' };

const FEATURE_KEY = 'lunarCalendar';
const DIARY_RECORDED_KEY = 'cosmic-lunar-diary-date';

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Mesmo tom honesto de lib/palmReadings.js / lib/chatResponses.js: a fase em
// si é astronomia real (astronomy-engine), mas a reflexão que a acompanha é
// simbólica — nunca previsão garantida.
// A primeira metade deste texto é verificável e continua igual. A segunda dizia
// "seguem a tradição milenar dos ciclos lunares", e era falsa no pior lugar
// possível — a frase que se apresenta como o selo de honestidade da tela.
// A divisão em OITO fases nomeadas, com leitura de cada uma, é de Dane Rudhyar,
// "The Lunation Cycle", 1967. A moldura milenar é a de QUATRO quartos
// (Ptolomeu, Tetrabiblos I.8). Ver docs/tradicao/04, §3.1 e §6.
const DISCLAIMER =
  'A fase da Lua é calculada com astronomia real (posição Sol-Lua). As reflexões que ' +
  'acompanham cada fase misturam duas idades, e a tela diz qual é qual: a divisão em quatro ' +
  'quartos e o calendário agrícola romano são antigos; a leitura das oito fases nomeadas é ' +
  'de 1967 (Dane Rudhyar). Convite simbólico, não garantia de resultado.';

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export default function LunarCalendarScreen() {
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  // O fio do idioma: o CONTEÚDO (nome da fase + reflexão) sai do motor já no
  // idioma do app. O chrome desta tela (título, disclaimer) ainda é PT
  // cravado — segundo passe, junto com o resto do chrome antigo.
  const { lang } = useLanguage() || {};
  const [refreshTick, setRefreshTick] = useState(0);
  const [locked, setLocked] = useState(false);

  // Sem botão de ação nesta tela — o conteúdo aparece já ao montar, então o
  // próprio "uso" é a montagem. Por isso a checagem e a marcação acontecem
  // juntas aqui: só marca como usado quando a checagem confirma que ainda
  // não tinha sido usado (senão marcaria de novo a cada montagem), e só
  // bloqueia (setLocked(true)) quando já tinha sido usado antes — nunca na
  // mesma visita em que a pessoa está consumindo seu uso grátis.
  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (used) {
        setLocked(true);
      } else {
        markFeatureUsedOnce(FEATURE_KEY);
      }
    });
  }, [hasAccess, accessConfirmed]);

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
  const today = useMemo(() => getMoonPhaseToday(lang), [refreshTick, lang]);
  const monthDays = useMemo(() => getMoonPhaseForCurrentMonth(lang), [refreshTick, lang]);
  const monthLabel = useMemo(
    () =>
      capitalize(
        new Date().toLocaleDateString(LOCALE_DO_IDIOMA[lang] || LOCALE_DO_IDIOMA.pt, {
          month: 'long',
          year: 'numeric',
        })
      ),
    [refreshTick, lang]
  );
  const todayNumber = new Date().getDate();

  // Vira entrada no Diário Cósmico 1x por dia — antes essa tela não deixava
  // rastro nenhum de uso real (achado real de auditoria de retenção, 25/07/2026).
  useEffect(() => {
    if (!today) return;
    const iso = todayISO();
    AsyncStorage.getItem(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === iso) return;
      recordReadingCompletion({
        type: 'lunarCalendar',
        typeLabel: 'Calendário Lunar',
        title: `${today.emoji} ${today.name}`,
        body: today.reflexao,
      });
      AsyncStorage.setItem(DIARY_RECORDED_KEY, iso);
    });
  }, [today]);

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
