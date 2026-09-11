// Relatórios — a tela da sequência (lib/streak.js). 100% leitura.
//
// REFEITA EM 11/09/2026, pedido do dono olhando referências de apps premium:
// "quando o cliente entra aqui, a diagramação precisa estar foda igual esse".
// A versão anterior era dois números, um calendário de um tom só e um card
// PRO com cadeado pedindo assinatura — numa Home onde TUDO_LIBERADO já valia.
//
// O que mudou, e por quê:
//   - O UNIVERSO GIRANDO abre a tela (components/UniversoGirando): é o
//     elemento vivo que as referências têm no topo e que aqui faltava.
//   - Os números viraram ANÉIS (components/AnelProgresso), mas só com conta
//     real: "quanto falta pro próximo marco" e "quantos dias do mês foram
//     ativos". Nenhuma porcentagem inventada — a doutrina do app proíbe.
//   - O card PRO SAIU. No lugar, o gráfico de evolução DE VERDADE: dias
//     ativos por mês nos últimos seis, lidos do mesmo mapa de dias do
//     streak. Prometer tranca onde não há tranca era pior que não ter nada.
//   - Todo texto saiu do código pro dicionário: esta era a última tela com
//     português cravado no JSX — quem usava em EN/ES abria em PT.
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import UniversoGirando from '../components/UniversoGirando';
import AnelProgresso from '../components/AnelProgresso';
import { getMonthActivity, getMonthTypes, getStreakInfo, STREAK_MILESTONES } from '../lib/streak';
import { readDays } from '../lib/streakDays';
import { useLanguage } from '../context/LanguageContext';

// Domingo a sábado — cabeçalho de calendário tradicional. As letras vêm do
// nome do dia no idioma corrente (primeira letra), então "D S T Q Q S S" em
// PT vira "S M T W T F S" em EN sem chave nova.
const LOCALE = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };
const MESES_NO_GRAFICO = 6;

// COR POR TIPO DE ATIVIDADE (11/09/2026). O tipo NÃO entra no mapa de dias do
// streak: { "AAAA-MM-DD": true|'shield' } é lido por computeCurrentStreak, pelos
// escudos, pelo Céu de Hoje e pelo casal — trocar o valor por um objeto quebrava
// todos de uma vez. Então o tipo vive num MAPA PARALELO (cosmic-active-types,
// lib/streakDays.js) e o calendário cruza os dois pela data.
//
// Histórico anterior a hoje não tem tipo gravado: esses dias ficam na cor
// neutra (o dourado de sempre) com rótulo genérico. NUNCA se inventa tipo pra
// dia antigo — a doutrina do app proíbe fabricar dado.
//
// Dia com mais de uma atividade pinta pelo tipo DOMINANTE = o primeiro gravado
// (ordem do array). Slug desconhecido cai no neutro, igual dia sem tipo.
const TIPOS = {
  tarot:      { cor: colors.gold,   rotulo: 'diary.filter.tarot' },
  dream:      { cor: colors.blue,   rotulo: 'diary.filter.dream' },
  coffee:     { cor: '#FF8C5C',     rotulo: 'diary.filter.coffee' },
  palma:      { cor: colors.teal,   rotulo: 'diary.filter.palma' },
  rosto:      { cor: colors.teal,   rotulo: 'diary.filter.rosto' },
  pe:         { cor: colors.teal,   rotulo: 'diary.filter.pe' },
  pintas:     { cor: colors.teal,   rotulo: 'diary.filter.pintas' },
  grounding:  { cor: colors.green,  rotulo: 'home.card.grounding.title' },
  jornada:    { cor: colors.pink,   rotulo: 'home.card.jornada.title' },
  zodiacbody: { cor: colors.accent, rotulo: 'home.card.zodiacbody.title' },
  horoscope:  { cor: '#C9A8FF',     rotulo: 'home.card.horoscope.title' },
  // Os cinco abaixo entraram em 11/09/2026 (revisor adversarial): são
  // leituras REAIS que passam por readingCompletion/recordActiveDay e caíam
  // no balde neutro "Atividade" — quatro delas nunca ganhavam cor própria.
  birthchart:    { cor: '#8FA9BD', rotulo: 'home.card.birthchart.title' },
  chat:          { cor: '#C88C88', rotulo: 'orbi.chat.diaryLabel' },
  compatibility: { cor: '#FF6BA0', rotulo: 'home.card.compatibility.title' },
  lunarCalendar: { cor: '#B6E3FF', rotulo: 'home.card.lunarCalendar.title' },
  sound:         { cor: '#A3B78D', rotulo: 'sound.title' },
};

// O tipo que pinta o dia: o PRIMEIRO CONHECIDO da lista, não o primeiro
// gravado. Um dia que começa pelo chat e depois tira Tarô mostrava o neutro e
// escondia o Tarô. Object.hasOwn e não TIPOS[x]: slug igual a nome herdado
// ('constructor', '__proto__') vindo de storage corrompido entrava na legenda
// como item vazio. Sem tipo conhecido → null → neutro + "Atividade".
function tipoDominante(tipos) {
  if (!Array.isArray(tipos)) return null;
  return tipos.find((tp) => typeof tp === 'string' && Object.hasOwn(TIPOS, tp)) || null;
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatMonthLabel(year, month, locale) {
  const label = new Date(year, month, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function weekdayLetters(locale) {
  // 4/01/2026 foi um domingo — qualquer domingo serve de âncora.
  const domingo = new Date(2026, 0, 4);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(domingo);
    d.setDate(domingo.getDate() + i);
    return d.toLocaleDateString(locale, { weekday: 'narrow' }).toUpperCase();
  });
}

// Dias ativos por mês, nos últimos N meses (o corrente incluído), a partir
// do mapa cru { "AAAA-MM-DD": true|'shield' }. Dia protegido por escudo CONTA
// como ativo — é o que o escudo promete.
function evolucaoMensal(days, agora, meses) {
  const out = [];
  for (let k = meses - 1; k >= 0; k--) {
    const d = new Date(agora.getFullYear(), agora.getMonth() - k, 1);
    const prefixo = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
    const ativos = Object.keys(days).filter((key) => key.startsWith(prefixo) && days[key]).length;
    const diasNoMes = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    out.push({ ano: d.getFullYear(), mes: d.getMonth(), ativos, diasNoMes });
  }
  return out;
}

export default function ReportsScreen() {
  const navigation = useNavigation();
  const { t, lang } = useLanguage();
  const locale = LOCALE[lang] || LOCALE.pt;
  const now = new Date();

  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed, igual getMonthActivity()

  const [monthActivity, setMonthActivity] = useState({});
  const [monthTypes, setMonthTypes] = useState({}); // { "AAAA-MM-DD": ['tarot', ...] }
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, totalActiveDays: 0, longest: 0 });
  const [evolucao, setEvolucao] = useState([]);

  const loadMonth = useCallback(async () => {
    const [ativos, tipos] = await Promise.all([getMonthActivity(year, month), getMonthTypes(year, month)]);
    setMonthActivity(ativos);
    setMonthTypes(tipos);
  }, [year, month]);

  const loadResumo = useCallback(async () => {
    const [info, days] = await Promise.all([getStreakInfo(), readDays()]);
    setStreakInfo(info);
    setEvolucao(evolucaoMensal(days, new Date(), MESES_NO_GRAFICO));
  }, []);

  // Recarrega ao ganhar foco (voltando de uma leitura que acabou de marcar o
  // dia) e sempre que o mês exibido muda.
  useFocusEffect(
    useCallback(() => {
      loadMonth();
      loadResumo();
    }, [loadMonth, loadResumo])
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

  // OS DOIS ANÉIS — cada um é uma fração de coisas contáveis, nunca um índice:
  //   marco: quanto da distância até o PRÓXIMO marco (7/30/100) já foi
  //          percorrida. Passou do último marco → anel cheio.
  //   mês:   dias ativos ÷ dias já decorridos do mês exibido (o mês corrente
  //          só conta até hoje — cobrar dia que ainda não chegou é injusto).
  const proximoMarco =
    STREAK_MILESTONES.find((m) => m.days > streakInfo.currentStreak) || STREAK_MILESTONES[STREAK_MILESTONES.length - 1];
  const pctMarco = Math.min(100, Math.round((streakInfo.currentStreak / proximoMarco.days) * 100));
  const ativosNoMes = Object.keys(monthActivity).length;
  const diasDecorridos = isCurrentMonth ? now.getDate() : daysInMonth;
  const pctMes = diasDecorridos > 0 ? Math.round((ativosNoMes / diasDecorridos) * 100) : 0;

  const maxAtivos = Math.max(1, ...evolucao.map((e) => e.ativos));
  const semanaLetras = weekdayLetters(locale);

  // Legenda do mês: tipos dominantes distintos, na ordem da primeira aparição
  // no mês. A bolinha neutra só entra se algum dia ativo ficou sem tipo.
  const legenda = [];
  let temSemTipo = false;
  Object.keys(monthActivity).sort().forEach((key) => {
    const dominante = tipoDominante(monthTypes[key]);
    if (!dominante) temSemTipo = true;
    else if (!legenda.includes(dominante)) legenda.push(dominante);
  });

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        onBack={() => navigation.goBack()}
        gradient={gradients.gold}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* O universo abre a tela. pointerEvents none vem de dentro dele:
            decoração nunca rouba toque. */}
        <View style={styles.universoWrap}>
          <UniversoGirando size={220} testID="reports-universo" />
        </View>

        <View style={styles.resumoCard}>
          <View style={styles.aneisRow}>
            <View style={styles.anelCol} testID="reports-anel-marco">
              <AnelProgresso pct={pctMarco} size={84} espessura={7} cor={colors.gold}>
                <Text style={styles.anelValor}>🔥 {streakInfo.currentStreak}</Text>
              </AnelProgresso>
              <Text style={styles.anelRotulo}>
                {t(streakInfo.currentStreak === 1 ? 'reports.streak_one' : 'reports.streak_other')}
              </Text>
              <Text style={styles.anelSub}>{t('reports.nextMilestone', { days: proximoMarco.days })}</Text>
            </View>
            <View style={styles.anelCol} testID="reports-anel-mes">
              <AnelProgresso pct={pctMes} size={84} espessura={7} cor={colors.teal}>
                <Text style={styles.anelValor}>{ativosNoMes}</Text>
              </AnelProgresso>
              <Text style={styles.anelRotulo}>{t('reports.monthActive')}</Text>
              <Text style={styles.anelSub}>{pctMes}%</Text>
            </View>
          </View>
          <View style={styles.numerosRow}>
            <View style={styles.numeroItem}>
              <Text style={styles.numeroValor}>{streakInfo.totalActiveDays}</Text>
              <Text style={styles.numeroRotulo}>{t('reports.total')}</Text>
            </View>
            <View style={styles.numeroDivisor} />
            <View style={styles.numeroItem}>
              <Text style={styles.numeroValor}>{streakInfo.longest || 0}</Text>
              <Text style={styles.numeroRotulo}>{t('reports.bestStreak')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHead}>
            <TouchableOpacity onPress={goPrevMonth} style={styles.navBtn} activeOpacity={0.7} accessibilityRole="button">
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{formatMonthLabel(year, month, locale)}</Text>
            <TouchableOpacity onPress={goNextMonth} style={styles.navBtn} activeOpacity={0.7} accessibilityRole="button">
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekdayRow}>
            {semanaLetras.map((label, i) => (
              <Text key={`${label}-${i}`} style={styles.weekdayLabel}>{label}</Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {cells.map((day, i) => {
              if (day === null) return <View key={`blank-${i}`} style={styles.dayCell} />;
              const dateKey = `${year}-${pad2(month + 1)}-${pad2(day)}`;
              const active = !!monthActivity[dateKey];
              const isToday = isCurrentMonth && day === now.getDate();
              const corDia = TIPOS[tipoDominante(monthTypes[dateKey])]?.cor || colors.gold;
              return (
                <View key={dateKey} style={styles.dayCell}>
                  <View style={[styles.dayCircle, active && { backgroundColor: corDia }, isToday && styles.dayCircleToday]}>
                    <Text style={[styles.dayNumber, active && styles.dayNumberActive]}>{day}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {ativosNoMes > 0 && (
            <View style={styles.legenda} testID="reports-legenda">
              {legenda.map((tipo) => (
                <View key={tipo} style={styles.legendaItem}>
                  <View style={[styles.legendaBola, { backgroundColor: TIPOS[tipo].cor }]} />
                  <Text style={styles.legendaTexto}>{t(TIPOS[tipo].rotulo)}</Text>
                </View>
              ))}
              {temSemTipo && (
                <View style={styles.legendaItem}>
                  <View style={[styles.legendaBola, { backgroundColor: colors.gold }]} />
                  <Text style={styles.legendaTexto}>{t('reports.legendaSemTipo')}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* GRÁFICO DE EVOLUÇÃO — o que o card PRO prometia atrás do cadeado,
            entregue. Barras são Views (sem lib de gráfico): altura proporcional
            ao mês com mais dias ativos na janela, número em cima, mês embaixo.
            Mês zerado ainda mostra uma base fininha — barra que some lê como
            "faltou dado", não como "zero". */}
        <View style={styles.evolucaoCard} testID="reports-evolucao">
          <Text style={styles.evolucaoTitulo}>{t('reports.evolutionTitle')}</Text>
          <Text style={styles.evolucaoDesc}>{t('reports.evolutionDesc')}</Text>
          <View style={styles.barrasRow}>
            {evolucao.map((e) => {
              const altura = e.ativos > 0 ? Math.max(6, Math.round((e.ativos / maxAtivos) * 88)) : 3;
              const ehAtual = e.ano === now.getFullYear() && e.mes === now.getMonth();
              const rotulo = new Date(e.ano, e.mes, 1).toLocaleDateString(locale, { month: 'short' }).replace('.', '');
              return (
                <View key={`${e.ano}-${e.mes}`} style={styles.barraCol}>
                  <Text style={styles.barraValor}>{e.ativos}</Text>
                  <View style={styles.barraTrilho}>
                    <View style={[styles.barra, { height: altura }, ehAtual && styles.barraAtual]} />
                  </View>
                  <Text style={[styles.barraMes, ehAtual && styles.barraMesAtual]}>{rotulo}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  universoWrap: { alignItems: 'center', marginTop: -6, marginBottom: 4 },

  resumoCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 16, marginBottom: 16,
  },
  aneisRow: { flexDirection: 'row', justifyContent: 'space-around' },
  anelCol: { alignItems: 'center', flex: 1 },
  anelValor: { color: colors.text, fontSize: 17, fontWeight: '800' },
  anelRotulo: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  anelSub: { color: colors.textMuted, fontSize: 11, marginTop: 2, textAlign: 'center' },
  numerosRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 16, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  numeroItem: { flex: 1, alignItems: 'center' },
  numeroDivisor: { width: 1, height: 28, backgroundColor: colors.border },
  numeroValor: { color: colors.text, fontSize: 20, fontWeight: '800' },
  numeroRotulo: { color: colors.textMuted, fontSize: 11, marginTop: 2 },

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
  // O fundo do dia ativo é inline: vem da cor do tipo dominante (TIPOS), com
  // o dourado — cor de conquista do app — como neutro pra dia sem tipo.
  dayCircleToday: { borderColor: colors.gold },
  dayNumber: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  dayNumberActive: { color: colors.background, fontWeight: '800' },

  legenda: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendaBola: { width: 10, height: 10, borderRadius: 5 },
  legendaTexto: { color: colors.textMuted, fontSize: 11 },

  evolucaoCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: 16,
  },
  evolucaoTitulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  evolucaoDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2, marginBottom: 14 },
  barrasRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 6 },
  barraCol: { flex: 1, alignItems: 'center' },
  barraValor: { color: colors.textSecondary, fontSize: 11, fontWeight: '700', marginBottom: 4 },
  barraTrilho: { height: 88, width: '100%', justifyContent: 'flex-end', alignItems: 'center' },
  barra: { width: '70%', maxWidth: 28, borderRadius: 6, backgroundColor: colors.gold + '77' },
  barraAtual: { backgroundColor: colors.gold },
  barraMes: { color: colors.textMuted, fontSize: 11, marginTop: 6, textTransform: 'capitalize' },
  barraMesAtual: { color: colors.text, fontWeight: '700' },
});
