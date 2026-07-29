// Descobrir — porta fiel de c:/tmp/gilfforever/web/app/(app)/descobrir/page.js:
// 3 abas independentes (Linguagem do amor, Estilo de apego, Conflitos) atrás de
// um controle segmentado com glifo de "concluído" por prova. As duas primeiras
// abas rodam o mesmo motor de quiz (stepper linear + tela de resultado com
// contagem animada); a terceira são 2 perguntas de botão, sem stepper, salvas
// imediatamente a cada escolha — sem etapa de "calcular resultado". Mesma chave
// e mesmo blob no AsyncStorage (ver lib/coupleData.js), cópia traduzida para
// PT-BR. As barras de balanço do resultado reaproveitam o componente ScoreBar
// já usado em Horóscopo/Compatibilidade.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { getDescobrirData, saveDescobrirResult } from '../lib/coupleData';

const HEADER_GRADIENT = ['#6C7BFF', '#B57BFF'];

const BAR_GRADIENTS = [
  ['#FF6BA0', '#FF8C5C'],
  ['#5CA8FF', '#6C7BFF'],
  ['#5FD98C', '#5CE0D8'],
  ['#FFB84D', '#FFC85C'],
  ['#B57BFF', '#FF7BD5'],
];

/* ---------------- Quiz 1: Linguagem do amor ----------------
   Textos exibidos viram chaves de tradução (t()) — os ids (k/order) seguem
   estáveis porque são o que o AsyncStorage guarda (ver lib/coupleData.js). */
const LANG_ORDER = ['palavras', 'tempo', 'presentes', 'servico', 'toque'];

const LANG_LABELS = {
  palavras: 'descobrir.lang.label.palavras',
  tempo: 'descobrir.lang.label.tempo',
  presentes: 'descobrir.lang.label.presentes',
  servico: 'descobrir.lang.label.servico',
  toque: 'descobrir.lang.label.toque',
};

const LANG_QUESTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({
  q: `descobrir.lang.q${n}`,
  opts: LANG_ORDER.map((k) => ({ t: `descobrir.lang.q${n}.opt.${k}`, k })),
}));

const LANG_RESULTS = {
  palavras: { emoji: '💬', texto: 'descobrir.lang.result.palavras.texto', dica: 'descobrir.lang.result.palavras.dica' },
  tempo: { emoji: '⏳', texto: 'descobrir.lang.result.tempo.texto', dica: 'descobrir.lang.result.tempo.dica' },
  presentes: { emoji: '🎁', texto: 'descobrir.lang.result.presentes.texto', dica: 'descobrir.lang.result.presentes.dica' },
  servico: { emoji: '🤝', texto: 'descobrir.lang.result.servico.texto', dica: 'descobrir.lang.result.servico.dica' },
  toque: { emoji: '🤍', texto: 'descobrir.lang.result.toque.texto', dica: 'descobrir.lang.result.toque.dica' },
};

/* ---------------- Quiz 2: Estilo de apego ---------------- */
const ATT_ORDER = ['seguro', 'ansioso', 'evitativo'];

const ATT_LABELS = {
  seguro: 'descobrir.att.label.seguro',
  ansioso: 'descobrir.att.label.ansioso',
  evitativo: 'descobrir.att.label.evitativo',
};

const ATT_QUESTIONS = [1, 2, 3, 4, 5].map((n) => ({
  q: `descobrir.att.q${n}`,
  opts: ATT_ORDER.map((k) => ({ t: `descobrir.att.q${n}.opt.${k}`, k })),
}));

const ATT_RESULTS = {
  seguro: { emoji: '🌿', texto: 'descobrir.att.result.seguro.texto', dica: 'descobrir.att.result.seguro.dica' },
  ansioso: { emoji: '🌊', texto: 'descobrir.att.result.ansioso.texto', dica: 'descobrir.att.result.ansioso.dica' },
  evitativo: { emoji: '🏔️', texto: 'descobrir.att.result.evitativo.texto', dica: 'descobrir.att.result.evitativo.dica' },
};

/* ---------------- Motor de quiz ---------------- */
function computeTop(answers, order) {
  const counts = {};
  order.forEach((k) => (counts[k] = 0));
  answers.forEach((k) => {
    if (k) counts[k] = (counts[k] || 0) + 1;
  });
  let top = order[0];
  order.forEach((k) => {
    if (counts[k] > counts[top]) top = k;
  });
  return { top, counts };
}

function Quiz({ questions, order, labels, results, resultBadge, saved, onSave }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState([]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(saved || null);
  const [tick, setTick] = useState(0);

  const total = questions.length;

  // Animação de contagem: quando aparece um resultado, os números do balanço sobem aos poucos.
  useEffect(() => {
    if (!result) {
      setTick(0);
      return;
    }
    const maxNeeded = Math.max(0, ...order.map((k) => result.counts[k] || 0));
    if (maxNeeded === 0) {
      setTick(0);
      return;
    }
    setTick(0);
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setTick(current);
      if (current >= maxNeeded) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, [result]);

  function choose(k) {
    const next = [...answers];
    next[step] = k;
    setAnswers(next);
  }

  function next() {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      const res = computeTop(answers, order);
      setResult(res);
      onSave(res);
    }
  }

  function redo() {
    setAnswers([]);
    setStep(0);
    setResult(null);
  }

  if (result) {
    const r = results[result.top];
    return (
      <View style={styles.card}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.overline}>{resultBadge}</Text>
          <Text style={styles.resultEmoji}>{r.emoji}</Text>
          <Text style={styles.resultTitle}>{t(labels[result.top])}</Text>
        </View>
        <Text style={[styles.mutedText, { marginTop: 10, marginBottom: 16 }]}>{t(r.texto)}</Text>
        <View style={styles.tipCard}>
          <Text style={styles.overline}>{t('descobrir.quiz.dica')}</Text>
          <Text style={styles.mutedText}>{t(r.dica)}</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>{t('descobrir.quiz.balance')}</Text>
        {order.map((k, i) => {
          const shown = Math.min(tick, result.counts[k] || 0);
          const pct = total ? Math.round((shown / total) * 100) : 0;
          return (
            <ScoreBar key={k} label={t(labels[k])} value={pct} gradient={BAR_GRADIENTS[i % BAR_GRADIENTS.length]} />
          );
        })}

        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <TouchableOpacity style={styles.btnGhost} onPress={redo}>
            <Text style={styles.btnGhostText}>{t('descobrir.quiz.redo')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const current = questions[step];
  const chosen = answers[step];
  const pct = Math.round(((step + (chosen ? 1 : 0)) / total) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={[styles.mutedText, { fontSize: 13, marginTop: 8, marginBottom: 6 }]}>{t('descobrir.quiz.progress', { step: step + 1, total })}</Text>
      <Text style={styles.sectionTitle}>{t(current.q)}</Text>

      <View style={{ marginTop: 4 }}>
        {current.opts.map((o, i) => {
          const sel = chosen === o.k;
          return (
            <TouchableOpacity key={i} style={[styles.opt, sel && styles.optSel]} onPress={() => choose(o.k)} activeOpacity={0.85}>
              <Text style={[styles.optText, sel && styles.optTextSel]}>{sel ? '✓ ' : ''}{t(o.t)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.btnGhost, step === 0 && styles.btnDisabled]} onPress={() => setStep(step - 1)} disabled={step === 0}>
          <Text style={styles.btnGhostText}>{t('descobrir.quiz.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, !chosen && styles.btnDisabled]} onPress={next} disabled={!chosen}>
          <Text style={styles.btnText}>{step < total - 1 ? t('descobrir.quiz.next') : t('descobrir.quiz.seeResult')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- Como enfrentam os conflitos (2 perguntas simples, sem motor de quiz) ---------------- */
const DESAFIOS_CONFLITO = [
  'descobrir.conf.desafio.comunicacao',
  'descobrir.conf.desafio.rotina',
  'descobrir.conf.desafio.confianca',
  'descobrir.conf.desafio.redescobrir',
];

function Conflitos({ voce, amor, saved, onSave }) {
  const { t } = useLanguage();
  const [conflicto, setConflicto] = useState(saved?.conflicto || '');
  const [desafio, setDesafio] = useState(saved?.desafio || '');

  function elegirConflicto(op) {
    setConflicto(op);
    onSave({ conflicto: op, desafio });
  }
  function elegirDesafio(op) {
    setDesafio(op);
    onSave({ conflicto, desafio: op });
  }

  const completo = Boolean(conflicto && desafio);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('descobrir.conf.q1', { voce, amor })}</Text>
      <View style={styles.optGrid}>
        {[voce, amor, t('descobrir.conf.both'), t('descobrir.conf.none')].map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.optHalf, conflicto === op && styles.optSel]}
            onPress={() => elegirConflicto(op)}
          >
            <Text style={[styles.optText, { textAlign: 'center' }, conflicto === op && styles.optTextSel]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>{t('descobrir.conf.q2')}</Text>
      <View style={styles.optGrid}>
        {DESAFIOS_CONFLITO.map((opKey) => {
          const op = t(opKey);
          return (
            <TouchableOpacity
              key={opKey}
              style={[styles.optHalf, desafio === op && styles.optSel]}
              onPress={() => elegirDesafio(op)}
            >
              <Text style={[styles.optText, { textAlign: 'center' }, desafio === op && styles.optTextSel]}>{op}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {completo && (
        <>
          <View style={[styles.statRow, { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{conflicto}</Text>
              <Text style={styles.statLabel}>{t('descobrir.conf.statFirstStep')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{desafio}</Text>
              <Text style={styles.statLabel}>{t('descobrir.conf.statChallenge')}</Text>
            </View>
          </View>
          <Text style={[styles.disclaimer, { marginTop: 10 }]}>{t('descobrir.conf.saved')}</Text>
        </>
      )}
    </View>
  );
}

/* ---------------- Tela ---------------- */
const QUIZ_TABS = [
  { id: 'linguagem', labelKey: 'descobrir.tab.linguagem', icon: '💬' },
  { id: 'apego', labelKey: 'descobrir.tab.apego', icon: '🧭' },
  { id: 'conflitos', labelKey: 'descobrir.tab.conflitos', icon: '🤝' },
];

export default function DescobrirScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('linguagem');
  const [data, setData] = useState({ linguagem: null, apego: null, conflictos: null });

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const d = await getDescobrirData(voce, amor);
    setData(d);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function saveQuiz(id, res) {
    const next = await saveDescobrirResult(voce, amor, id, res);
    setData(next);
  }

  function isTabDone(id) {
    if (id === 'conflitos') return Boolean(data.conflictos?.conflicto && data.conflictos?.desafio);
    return Boolean(data[id]);
  }

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title={t('home.card.descobrir.title')} subtitle={t('home.card.descobrir.subtitle')} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>{t('descobrir.empty.title')}</Text>
          <Text style={styles.emptyProfileDesc}>
            {t('descobrir.empty.desc')}
          </Text>
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>{t('descobrir.empty.cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={t('home.card.descobrir.title')} subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.mutedText, { textAlign: 'center', marginBottom: 18 }]}>
          {t('descobrir.intro', { voce, amor })}
        </Text>

        <View style={styles.tabsCard}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {QUIZ_TABS.map((tabDef) => {
              const active = tab === tabDef.id;
              const done = isTabDone(tabDef.id);
              return (
                <TouchableOpacity
                  key={tabDef.id}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setTab(tabDef.id)}
                >
                  <Text style={styles.tabIcon}>{done ? '✓' : tabDef.icon}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t(tabDef.labelKey)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!loaded ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : tab === 'linguagem' ? (
          <Quiz
            questions={LANG_QUESTIONS}
            order={LANG_ORDER}
            labels={LANG_LABELS}
            results={LANG_RESULTS}
            resultBadge={t('descobrir.lang.badge', { name: voce })}
            saved={data.linguagem}
            onSave={(res) => saveQuiz('linguagem', res)}
          />
        ) : tab === 'apego' ? (
          <Quiz
            questions={ATT_QUESTIONS}
            order={ATT_ORDER}
            labels={ATT_LABELS}
            results={ATT_RESULTS}
            resultBadge={t('descobrir.att.badge', { name: voce })}
            saved={data.apego}
            onSave={(res) => saveQuiz('apego', res)}
          />
        ) : (
          <Conflitos voce={voce} amor={amor} saved={data.conflictos} onSave={(res) => saveQuiz('conflictos', res)} />
        )}

        <Text style={styles.disclaimer}>
          {t('descobrir.disclaimer')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  tipCard: {
    backgroundColor: colors.gold + '14', borderWidth: 1, borderColor: colors.gold + '55',
    borderRadius: 14, padding: 14,
  },

  tabsCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 8, marginBottom: 16 },
  tabBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14, borderWidth: 1, borderColor: 'transparent' },
  tabBtnActive: { borderColor: colors.gold + '80', backgroundColor: colors.gold + '18' },
  tabIcon: { fontSize: 18 },
  tabLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  tabLabelActive: { color: colors.gold, fontWeight: '800' },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  mutedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 18, lineHeight: 16 },

  resultEmoji: { fontSize: 40, marginVertical: 10 },
  resultTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  opt: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  optSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  optText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  optTextSel: { color: colors.text, fontWeight: '700' },

  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  optHalf: {
    width: '48%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8,
  },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  btnGhost: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: 10 },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
