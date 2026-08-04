// Agir — porta fiel de c:/tmp/gilfforever/web/app/(app)/agir/page.js: 5 seções
// independentes empilhadas numa única tela (como Timeline) — sortear ideia de
// encontro (com peso opcional pela linguagem do amor salva em Descobrir),
// desafio de 7 dias, gesto do dia (determinístico, sem persistência), meta da
// semana e sonhos do casal. Mesma chave e mesmo blob no AsyncStorage (ver
// lib/coupleData.js — saveAgirData espelha o merge parcial do persist()
// original). Cópia traduzida para PT-BR; checkbox HTML virou Switch nativo,
// onSubmit/preventDefault virou onPress.
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import DailyMissionsCard from '../components/DailyMissionsCard';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { getAgirData, saveAgirData, getDescobrirData } from '../lib/coupleData';

const HEADER_GRADIENT = gradients.gold;

// lang: a qual linguagem do amor (de Descobrir) essa ideia mais fala — pra poder priorizar sem inventar nada novo.
// tag/text agora são chaves de tradução (t()); os ids seguem estáveis porque
// são o que o AsyncStorage guarda em favorites/done (ver lib/coupleData.js).
const DATE_IDEAS = [
  { id: 'i1', tag: 'agir.ideas.tag.casa', lang: 'tempo', text: 'agir.ideas.i1' },
  { id: 'i2', tag: 'agir.ideas.tag.casa', lang: 'servico', text: 'agir.ideas.i2' },
  { id: 'i3', tag: 'agir.ideas.tag.casa', lang: 'toque', text: 'agir.ideas.i3' },
  { id: 'i4', tag: 'agir.ideas.tag.casa', lang: 'toque', text: 'agir.ideas.i4' },
  { id: 'i5', tag: 'agir.ideas.tag.arLivre', lang: 'tempo', text: 'agir.ideas.i5' },
  { id: 'i6', tag: 'agir.ideas.tag.arLivre', lang: 'tempo', text: 'agir.ideas.i6' },
  { id: 'i7', tag: 'agir.ideas.tag.arLivre', lang: 'tempo', text: 'agir.ideas.i7' },
  { id: 'i8', tag: 'agir.ideas.tag.arLivre', lang: 'toque', text: 'agir.ideas.i8' },
  { id: 'i9', tag: 'agir.ideas.tag.economico', lang: 'servico', text: 'agir.ideas.i9' },
  { id: 'i10', tag: 'agir.ideas.tag.economico', lang: 'presentes', text: 'agir.ideas.i10' },
  { id: 'i11', tag: 'agir.ideas.tag.economico', lang: 'tempo', text: 'agir.ideas.i11' },
  { id: 'i12', tag: 'agir.ideas.tag.economico', lang: 'tempo', text: 'agir.ideas.i12' },
  { id: 'i13', tag: 'agir.ideas.tag.especial', lang: 'tempo', text: 'agir.ideas.i13' },
  { id: 'i14', tag: 'agir.ideas.tag.especial', lang: 'palavras', text: 'agir.ideas.i14' },
  { id: 'i15', tag: 'agir.ideas.tag.especial', lang: 'tempo', text: 'agir.ideas.i15' },
];

const LANG_LABELS_AGIR = {
  palavras: 'agir.lang.palavras',
  tempo: 'agir.lang.tempo',
  presentes: 'agir.lang.presentes',
  servico: 'agir.lang.servico',
  toque: 'agir.lang.toque',
};

const CHALLENGE = [
  { id: 'd1', text: 'agir.challenge.d1' },
  { id: 'd2', text: 'agir.challenge.d2' },
  { id: 'd3', text: 'agir.challenge.d3' },
  { id: 'd4', text: 'agir.challenge.d4' },
  { id: 'd5', text: 'agir.challenge.d5' },
  { id: 'd6', text: 'agir.challenge.d6' },
  { id: 'd7', text: 'agir.challenge.d7' },
];

const DAILY_GESTURES = [
  'agir.gesture.g1',
  'agir.gesture.g2',
  'agir.gesture.g3',
  'agir.gesture.g4',
  'agir.gesture.g5',
  'agir.gesture.g6',
  'agir.gesture.g7',
  'agir.gesture.g8',
  'agir.gesture.g9',
  'agir.gesture.g10',
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function AgirScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  // Refs pra levar a pessoa até o botão de sortear: o estado vazio das
  // favoritas fica embaixo, e só PEDIR "sorteiem uma ideia" não resolve —
  // o CTA sorteia na hora e rola a tela até o resultado (mesma tela, ação local).
  const scrollRef = useRef(null);
  const ideasSectionY = useRef(0);

  const [loaded, setLoaded] = useState(false);
  const [idea, setIdea] = useState(null);
  const [drawKey, setDrawKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [done, setDone] = useState([]);
  const [goal, setGoal] = useState('');
  const [goalSaved, setGoalSaved] = useState('');
  const [goalDone, setGoalDone] = useState(false);
  const [linguagem, setLinguagem] = useState(null);
  const [usarLinguagem, setUsarLinguagem] = useState(true);
  const [dreams, setDreams] = useState([]);
  const [dreamInput, setDreamInput] = useState('');

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const [d, descobrir] = await Promise.all([getAgirData(voce, amor), getDescobrirData(voce, amor)]);
    setFavorites(d.favorites || []);
    setDone(d.done || []);
    setGoalSaved(d.goalSaved || '');
    setGoal(d.goalSaved || '');
    setGoalDone(!!d.goalDone);
    setDreams(d.dreams || []);
    setLinguagem(descobrir.linguagem?.top || null);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 1) Ideia de encontro
  function sortear() {
    let pool = DATE_IDEAS;
    if (usarLinguagem && linguagem) {
      const matching = DATE_IDEAS.filter((d) => d.lang === linguagem);
      if (matching.length > 0) pool = matching;
    }
    let i = Math.floor(Math.random() * pool.length);
    if (idea && pool.length > 1 && pool[i].id === idea.id) {
      i = (i + 1) % pool.length;
    }
    setIdea(pool[i]);
    setDrawKey((k) => k + 1);
  }

  // CTA do estado vazio das favoritas: sorteia e leva a pessoa até a ideia.
  function sortearEVer() {
    sortear();
    const y = Math.max(0, ideasSectionY.current - 12);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo?.({ y, animated: true });
    });
  }

  async function toggleFav(id) {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    await saveAgirData(voce, amor, { favorites: next });
  }

  const favList = DATE_IDEAS.filter((d) => favorites.includes(d.id));

  // 2) Desafio de 7 dias
  async function toggleDone(id) {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    await saveAgirData(voce, amor, { done: next });
  }
  const progress = Math.round((done.length / CHALLENGE.length) * 100);

  // 3) Gesto do dia (determinístico segundo a data)
  const iso = todayISO();
  const gesture = DAILY_GESTURES[hashStr(iso) % DAILY_GESTURES.length];

  // 4) Meta da semana
  async function handleSaveGoal() {
    const g = goal.trim();
    if (!g) return;
    setGoalSaved(g);
    setGoalDone(false);
    await saveAgirData(voce, amor, { goalSaved: g, goalDone: false });
  }
  async function markGoalDone() {
    setGoalDone(true);
    await saveAgirData(voce, amor, { goalDone: true });
  }
  async function clearGoal() {
    setGoalSaved('');
    setGoal('');
    setGoalDone(false);
    await saveAgirData(voce, amor, { goalSaved: '', goalDone: false });
  }

  // 5) Sonhos do casal (metas de longo prazo, persistentes)
  async function addDream() {
    const t = dreamInput.trim();
    if (!t) return;
    const next = [...dreams, { id: String(Date.now()), text: t, done: false, createdAt: todayISO() }];
    setDreams(next);
    await saveAgirData(voce, amor, { dreams: next });
    setDreamInput('');
  }
  async function toggleDream(id) {
    const next = dreams.map((d) => (d.id === id ? { ...d, done: !d.done } : d));
    setDreams(next);
    await saveAgirData(voce, amor, { dreams: next });
  }
  async function delDream(id) {
    const next = dreams.filter((d) => d.id !== id);
    setDreams(next);
    await saveAgirData(voce, amor, { dreams: next });
  }

  if (!voce || !amor) {
    // As missões diárias são PESSOAIS (não dependem do quiz do casal), então
    // o card aparece mesmo aqui — quem ainda não fez o quiz não fica sem a
    // parte de "fazer missão, acumular token".
    return (
      <View style={styles.root}>
        <GradientHeader title={t('home.card.agir.title')} subtitle={t('home.card.agir.subtitle')} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <DailyMissionsCard />
          <View style={[styles.emptyProfile, { paddingVertical: 36 }]}>
            <Ionicons name="heart-outline" size={40} color={colors.accent} />
            <Text style={styles.emptyProfileTitle}>{t('agir.empty.title')}</Text>
            <Text style={styles.emptyProfileDesc}>
              {t('agir.empty.desc')}
            </Text>
            <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
              <Text style={styles.btnText}>{t('agir.empty.cta')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title={t('home.card.agir.title')} subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* 0) Missões de hoje — motor em lib/missions.js, card em
            components/DailyMissionsCard.js (pedido do dono: missões diárias
            que acumulam token, trocáveis por brindes na Loja). */}
        <DailyMissionsCard />

        {/* 1) Ideia de encontro */}
        <Text
          style={styles.sectionTitle}
          onLayout={(e) => { ideasSectionY.current = e.nativeEvent.layout.y; }}
        >
          {t('agir.ideas.title')}
        </Text>
        <View style={styles.card}>
          <Text style={styles.mutedText}>{t('agir.ideas.subtitle')}</Text>
          {loaded && linguagem && (
            <View style={styles.switchRow}>
              <Switch
                value={usarLinguagem}
                onValueChange={setUsarLinguagem}
                trackColor={{ false: colors.border, true: colors.gold + '99' }}
                thumbColor={usarLinguagem ? colors.gold : colors.textMuted}
              />
              <Text style={styles.switchLabel}>
                {t('agir.ideas.prioritize', { lang: t(LANG_LABELS_AGIR[linguagem]) })}
              </Text>
            </View>
          )}
          <TouchableOpacity style={[styles.btn, { marginTop: 12, alignSelf: 'flex-start' }]} onPress={sortear}>
            <Text style={styles.btnText}>{t('agir.ideas.draw')}</Text>
          </TouchableOpacity>
        </View>

        {idea && (
          <View key={drawKey} style={[styles.card, styles.ideaCard]}>
            <Text style={styles.fractionBadge}>{t(idea.tag)}</Text>
            <Text style={styles.ideaText}>{t(idea.text)}</Text>
            <TouchableOpacity style={styles.favBtn} onPress={() => toggleFav(idea.id)}>
              <Text style={styles.favBtnText}>{favorites.includes(idea.id) ? t('agir.ideas.inFavs') : t('agir.ideas.addFav')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {loaded && (
          <View style={[styles.card, { marginTop: 14 }]}>
            {favList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🤍</Text>
                <Text style={styles.emptyStateTitle}>{t('agir.ideas.emptyFavTitle')}</Text>
                <Text style={styles.emptyStateDesc}>{t('agir.ideas.emptyFavDesc')}</Text>
                <TouchableOpacity style={[styles.btn, { marginTop: 14 }]} onPress={sortearEVer}>
                  <Text style={styles.btnText}>{t('agir.ideas.emptyFavCta')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.overline}>{t('agir.ideas.favCount', { count: favList.length })}</Text>
                <View style={{ marginTop: 10 }}>
                  {favList.map((f) => (
                    <View key={f.id} style={styles.listItem}>
                      <TouchableOpacity onPress={() => toggleFav(f.id)}>
                        <Text style={styles.listItemIcon}>💛</Text>
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTag}>{t(f.tag)}</Text>
                        <Text style={styles.listItemText}>{t(f.text)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        {/* 2) Desafio de 7 dias */}
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionTitle}>{t('agir.challenge.title')}</Text>
          {loaded && <Text style={styles.sectionHeadAction}>{done.length}/{CHALLENGE.length}</Text>}
        </View>
        <View style={styles.card}>
          <Text style={styles.mutedText}>{t('agir.challenge.subtitle')}</Text>
          {loaded && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
          <View style={{ marginTop: 10 }}>
            {CHALLENGE.map((c, idx) => {
              const isDone = done.includes(c.id);
              return (
                <TouchableOpacity key={c.id} style={[styles.opt, isDone && styles.optSel]} onPress={() => toggleDone(c.id)}>
                  <Text style={styles.optCheck}>{isDone ? '✅' : '⬜'}</Text>
                  <Text style={styles.optText}>
                    <Text style={styles.optDay}>{t('agir.challenge.day', { n: idx + 1 })}</Text>
                    {t(c.text)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {loaded && progress === 100 && (
            <Text style={styles.completeText}>{t('agir.challenge.complete', { voce, amor })}</Text>
          )}
        </View>

        {/* 3) Gesto do dia */}
        <Text style={styles.sectionTitle}>{t('agir.gesture.title')}</Text>
        <View style={[styles.card, { alignItems: 'center' }]}>
          <Text style={styles.mutedText}>{t('agir.gesture.subtitle')}</Text>
          <View style={styles.gestureBox}>
            <Text style={{ fontSize: 26 }}>💛</Text>
            <Text style={styles.gestureText}>{t(gesture)}</Text>
          </View>
        </View>

        {/* 4) Meta da semana */}
        <Text style={styles.sectionTitle}>{t('agir.goal.title')}</Text>
        <View style={styles.card}>
          <Text style={styles.mutedText}>{t('agir.goal.subtitle')}</Text>
          <View style={styles.field}>
            <Text style={styles.label}>{t('agir.goal.label')}</Text>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              placeholder={t('agir.goal.placeholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity style={[styles.btn, { alignSelf: 'flex-start' }]} onPress={handleSaveGoal}>
            <Text style={styles.btnText}>{t('agir.goal.save')}</Text>
          </TouchableOpacity>

          {loaded && goalSaved && (
            <View style={styles.goalCard}>
              <Text style={[styles.goalText, goalDone && styles.goalTextDone]}>
                {goalDone ? '✅ ' : '🎯 '}{goalSaved}
              </Text>
              <View style={styles.goalActions}>
                {!goalDone && (
                  <TouchableOpacity style={styles.btn} onPress={markGoalDone}>
                    <Text style={styles.btnText}>{t('agir.markDone')}</Text>
                  </TouchableOpacity>
                )}
                {goalDone && <Text style={styles.completeTextInline}>{t('agir.done')}</Text>}
                <TouchableOpacity onPress={clearGoal}>
                  <Text style={styles.delText}>{t('agir.swapGoal')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 5) Sonhos do casal */}
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionTitle}>{t('agir.dreams')}</Text>
          {loaded && dreams.length > 0 && (
            <Text style={styles.sectionHeadAction}>{dreams.filter((d) => d.done).length}/{dreams.length}</Text>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.mutedText}>{t('agir.dreamsDesc')}</Text>

          <View style={styles.dreamInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={dreamInput}
              onChangeText={setDreamInput}
              placeholder="Ex.: Economizar para nossa primeira viagem juntos"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addDream}
            />
            <TouchableOpacity style={styles.btn} onPress={addDream}>
              <Text style={styles.btnText}>{t('agir.add')}</Text>
            </TouchableOpacity>
          </View>

          {loaded && dreams.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌠</Text>
              <Text style={styles.emptyStateTitle}>{t('agir.empty.title')}</Text>
              <Text style={styles.emptyStateDesc}>{t('agir.empty.desc')}</Text>
            </View>
          )}

          {loaded && dreams.length > 0 && (
            <View style={{ marginTop: 14 }}>
              {dreams.map((d) => (
                <View key={d.id} style={styles.listItem}>
                  <TouchableOpacity onPress={() => toggleDream(d.id)}>
                    <Text style={styles.listItemIcon}>{d.done ? '✅' : '⬜'}</Text>
                  </TouchableOpacity>
                  <Text style={[styles.listItemText, { flex: 1 }, d.done && styles.listItemTextDone]}>{d.text}</Text>
                  <TouchableOpacity onPress={() => delDream(d.id)}>
                    <Text style={styles.delText}>{t('agir.remove')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.disclaimer}>
          As ideias, desafios e metas de vocês ficam salvos apenas neste aparelho.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  sectionHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  sectionHeadAction: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  mutedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },

  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  switchLabel: { flex: 1, color: colors.textSecondary, fontSize: 13 },

  ideaCard: { marginTop: 14, alignItems: 'center' },
  fractionBadge: {
    color: colors.accent, fontSize: 12, fontWeight: '700',
    backgroundColor: colors.accent + '22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  ideaText: { color: colors.text, fontSize: 17, textAlign: 'center', marginTop: 14 },
  favBtn: { marginTop: 14, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  favBtnText: { color: colors.text, fontWeight: '700' },

  emptyState: { alignItems: 'center', paddingVertical: 12 },
  emptyStateIcon: { fontSize: 32, marginBottom: 8 },
  emptyStateTitle: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyStateDesc: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },

  listItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  listItemIcon: { fontSize: 18 },
  listItemTag: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  listItemText: { color: colors.textSecondary, fontSize: 14, marginTop: 2 },
  listItemTextDone: { textDecorationLine: 'line-through', opacity: 0.7 },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden', marginTop: 12 },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  opt: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 12, marginBottom: 8,
  },
  optSel: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  optCheck: { fontSize: 16, lineHeight: 20 },
  optText: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  optDay: { color: colors.gold, fontWeight: '800' },
  completeText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 14 },
  completeTextInline: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },

  gestureBox: {
    marginTop: 10, padding: 18, borderRadius: 12, alignItems: 'center', width: '100%',
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.gold + '40',
  },
  gestureText: { color: colors.text, fontSize: 17, textAlign: 'center', marginTop: 8 },

  field: { marginVertical: 10 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15,
  },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  goalCard: { marginTop: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated },
  goalText: { color: colors.text, fontSize: 16 },
  goalTextDone: { textDecorationLine: 'line-through', opacity: 0.7 },
  goalActions: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' },
  delText: { color: colors.red, fontSize: 13, fontWeight: '700' },

  dreamInputRow: { flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' },

  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 8 },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
