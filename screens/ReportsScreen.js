// Relatórios — calendário de sequência (lib/streak.js). Tela 100% leitura:
// mostra o streak atual, o total de dias ativos e um calendário mensal
// simples (heatmap de um tom só) com navegação entre meses. A seção PRO no
// fim é só a prévia visual do paywall (o gate real fica pra depois) — aqui
// é só o card com cadeado + botão "Assinar" levando pra tela de Planos.
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { getMonthActivity, getStreakInfo } from '../lib/streak';

// Domingo a sábado — cabeçalho de calendário tradicional (D S T Q Q S S).
const WEEKDAY_LABELS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatMonthLabel(year, month) {
  const label = new Date(year, month, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export default function ReportsScreen() {
  const navigation = useNavigation();
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed, igual getMonthActivity()

  const [monthActivity, setMonthActivity] = useState({});
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, totalActiveDays: 0 });

  const loadMonth = useCallback(async () => {
    const activity = await getMonthActivity(year, month);
    setMonthActivity(activity);
  }, [year, month]);

  const loadStreak = useCallback(async () => {
    const info = await getStreakInfo();
    setStreakInfo(info);
  }, []);

  // Recarrega ao ganhar foco (ex.: voltando de uma leitura que acabou de
  // marcar o dia como ativo) e também sempre que o mês exibido muda.
  useFocusEffect(
    useCallback(() => {
      loadMonth();
      loadStreak();
    }, [loadMonth, loadStreak])
  );

  const goPrevMonth = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=domingo ... 6=sábado
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Relatórios"
        subtitle="Sua constância ao longo do tempo"
        onBack={() => navigation.goBack()}
        gradient={gradients.gold}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🔥 {streakInfo.currentStreak}</Text>
            <Text style={styles.statLabel}>
              {streakInfo.currentStreak === 1 ? 'dia seguido' : 'dias seguidos'}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streakInfo.totalActiveDays}</Text>
            <Text style={styles.statLabel}>
              {streakInfo.totalActiveDays === 1 ? 'dia ativo no total' : 'dias ativos no total'}
            </Text>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHead}>
            <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{formatMonthLabel(year, month)}</Text>
            <TouchableOpacity onPress={goNextMonth} style={styles.navBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Text key={`${label}-${i}`} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={`blank-${i}`} style={styles.dayCell} />;
              const dateKey = `${year}-${pad2(month + 1)}-${pad2(day)}`;
              const active = !!monthActivity[dateKey];
              const isToday = isCurrentMonth && day === now.getDate();
              return (
                <View key={dateKey} style={styles.dayCell}>
                  <View style={[styles.dayCircle, active && styles.dayCircleActive, isToday && styles.dayCircleToday]}>
                    <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{day}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.proCard}>
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>
          <View style={styles.proIconWrap}>
            <Ionicons name="lock-closed" size={24} color={colors.gold} />
          </View>
          <Text style={styles.proTitle}>Gráfico de evolução</Text>
          <Text style={styles.proDesc}>
            Exclusivo assinantes — acompanhe sua constância mês a mês em um gráfico completo.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.proBtn}
            onPress={() => navigation.navigate(ROUTES.PLANOS)}
          >
            <Text style={styles.proBtnText}>Assinar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 16, alignItems: 'center',
  },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' },

  calendarCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 16, marginBottom: 16,
  },
  calendarHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  navBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.surfaceElevated,
    justifyContent: 'center', alignItems: 'center',
  },
  monthLabel: { color: colors.text, fontSize: 16, fontWeight: '800' },

  weekdayRow: { flexDirection: 'row', marginBottom: 8 },
  weekdayLabel: { width: `${100 / 7}%`, textAlign: 'center', color: colors.textMuted, fontSize: 12, fontWeight: '700' },

  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  dayCircle: {
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  dayCircleActive: { backgroundColor: colors.teal },
  dayCircleToday: { borderColor: colors.gold },
  dayNumber: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  dayNumberActive: { color: colors.background, fontWeight: '800' },

  proCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 20, alignItems: 'center',
  },
  proBadge: {
    alignSelf: 'center', backgroundColor: colors.gold + '22',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12,
  },
  proBadgeText: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  proIconWrap: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold + '18',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  proTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  proDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 16 },
  proBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28 },
  proBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
