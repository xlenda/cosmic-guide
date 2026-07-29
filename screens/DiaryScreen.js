// screens/DiaryScreen.js
// Diário Cósmico — histórico unificado de todas as leituras já feitas no app
// (tarô, palma, rosto, pé, pintas, café, sonho), lidas de lib/journal.js.
// Recarrega a cada foco de tela (useFocusEffect) porque a pessoa normalmente
// chega aqui vindo de uma leitura que acabou de salvar uma entrada nova.
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Alert } from '../lib/webAlert';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import {
  getJournalEntries,
  deleteJournalEntry,
  getRecentEntriesForWeeklyInsight,
  getFallbackWeeklyInsight,
  saveWeeklyInsight,
  getLatestWeeklyInsight,
  getActivePin,
  getPinCredits,
  pinEntry,
} from '../lib/journal';
import { fetchAiWeeklyInsight } from '../lib/aiClient';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { shareToFeed } from '../lib/socialClient';
import { ROUTES } from '../routes';

const TYPE_ICONS = {
  tarot: 'albums',
  palma: 'hand-left',
  rosto: 'happy',
  pe: 'footsteps',
  pintas: 'ellipse',
  coffee: 'cafe',
  dream: 'moon',
};

// labels viram chaves i18n — t() onde forem exibidos (padrão do STEPS em QuizScreen.js).
const FILTERS = [
  { key: 'all', label: 'diary.filter.all' },
  { key: 'tarot', label: 'diary.filter.tarot' },
  { key: 'palma', label: 'diary.filter.palma' },
  { key: 'rosto', label: 'diary.filter.rosto' },
  { key: 'pe', label: 'diary.filter.pe' },
  { key: 'pintas', label: 'diary.filter.pintas' },
  { key: 'coffee', label: 'diary.filter.coffee' },
  { key: 'dream', label: 'diary.filter.dream' },
];

function formatDate(iso, t) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return t('diary.date', { d: d.getDate(), month: t(`diary.month.${d.getMonth()}`) });
}

function excerpt(body, length = 80) {
  if (!body) return '';
  const clean = body.trim();
  if (clean.length <= length) return clean;
  return `${clean.slice(0, length).trim()}...`;
}

function DiaryItem({ entry, expanded, onToggle, onDelete, canShare, onShare, sharing, pinned, canPin, onPin }) {
  const { t } = useLanguage();
  const hasInsight = !!(entry.voiceTranscript || entry.aiInsight);
  const iconName = TYPE_ICONS[entry.type] || 'sparkles';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggle}
      onLongPress={onDelete}
      style={[styles.card, pinned && styles.cardPinned]}
    >
      {pinned && (
        <View style={styles.pinnedBanner}>
          <Ionicons name="bookmark" size={12} color={colors.gold} />
          <Text style={styles.pinnedBannerText}>{t('diary.pinned.banner')}</Text>
        </View>
      )}
      <View style={styles.cardHeader}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName} size={18} color={colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.typeLabel}>{entry.typeLabel}</Text>
          <Text style={styles.title}>{entry.title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.date}>{formatDate(entry.date, t)}</Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textMuted}
            style={{ marginTop: 4 }}
          />
        </View>
      </View>

      {!expanded && <Text style={styles.excerpt}>{excerpt(entry.body)}</Text>}
      {!expanded && hasInsight && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('diary.withInsight')}</Text>
        </View>
      )}

      {expanded && (
        <View style={styles.expandedArea}>
          <Text style={styles.fullBody}>{entry.body}</Text>

          {!!entry.voiceTranscript && (
            <View style={styles.insightBlock}>
              <Text style={styles.insightLabel}>Seu insight original</Text>
              <Text style={styles.voiceText}>{entry.voiceTranscript}</Text>
            </View>
          )}

          {!!entry.aiInsight && (
            <View style={styles.insightBlock}>
              <Text style={styles.insightLabel}>Versão lapidada pela IA</Text>
              <Text style={styles.aiText}>{entry.aiInsight}</Text>
            </View>
          )}

          {canPin && !pinned && (
            <TouchableOpacity style={styles.pinBtn} onPress={onPin} activeOpacity={0.8}>
              <Ionicons name="bookmark" size={16} color={colors.gold} />
              <Text style={styles.pinText}>Fixar no topo por 7 dias</Text>
            </TouchableOpacity>
          )}

          {canShare && (
            <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.8} disabled={sharing}>
              <Ionicons name="share-social" size={16} color={colors.teal} />
              <Text style={styles.shareText}>{sharing ? 'Compartilhando...' : 'Compartilhar no Feed'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} activeOpacity={0.8}>
            <Ionicons name="trash" size={16} color={colors.red} />
            <Text style={styles.deleteText}>Apagar esta leitura</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function DiaryScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { coupleData } = useCouple();
  // Compartilhar no feed social é só pra quem usa o app sozinho (sem parceiro
  // pareado) — leituras salvas dentro de um casal continuam privadas.
  const canShare = !!user && !coupleData;
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [sharingId, setSharingId] = useState(null);
  const [weeklyInsight, setWeeklyInsight] = useState(null);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [weeklyEligibleCount, setWeeklyEligibleCount] = useState(0);
  // Destaque no Diário (recompensa da Loja, lib/journal.js): a fixação
  // vigente e quantos créditos ainda dá pra usar.
  const [activePin, setActivePin] = useState(null);
  const [pinCredits, setPinCredits] = useState(0);

  const load = useCallback(async () => {
    const data = await getJournalEntries();
    setEntries(Array.isArray(data) ? data : []);
    setLoading(false);
    const [pin, credits] = await Promise.all([getActivePin(), getPinCredits()]);
    setActivePin(pin);
    setPinCredits(credits);
    const recent = await getRecentEntriesForWeeklyInsight();
    setWeeklyEligibleCount(recent.length);
    // Se já existe um Insight da Semana gerado nos últimos 7 dias, mostra ele
    // direto — antes o insight nascia e morria na mesma sessão (useState
    // puro), então reabrir o app perdia o que a IA já tinha gerado, mesmo sem
    // nada de novo ter acontecido na semana (achado real de auditoria de
    // retenção, 25/07/2026).
    const persisted = await getLatestWeeklyInsight();
    if (persisted) setWeeklyInsight(persisted);
  }, []);

  async function generateWeeklyInsight() {
    setLoadingWeekly(true);
    const recent = await getRecentEntriesForWeeklyInsight();
    let result;
    try {
      result = await fetchAiWeeklyInsight(
        recent.map((e) => ({ type: e.type, typeLabel: e.typeLabel, title: e.title, body: e.body }))
      );
    } catch {
      // Nunca mostra erro cru — cai no fallback honesto (só lista o que
      // realmente aconteceu, sem inventar síntese).
      result = getFallbackWeeklyInsight(recent);
    }
    setWeeklyInsight(result);
    await saveWeeklyInsight(result);
    setLoadingWeekly(false);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  function confirmDelete(entryId) {
    Alert.alert(
      'Apagar esta leitura',
      'Isso remove esta entrada do seu Diário Cósmico para sempre. Essa ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: async () => {
            await deleteJournalEntry(entryId);
            setEntries((prev) => prev.filter((e) => e.id !== entryId));
            setExpandedId((cur) => (cur === entryId ? null : cur));
          },
        },
      ]
    );
  }

  async function share(entry) {
    // Sem essa guarda síncrona (achado real de auditoria, 18/07/2026), dois
    // toques rápidos no botão antes do primeiro re-render disparavam duas
    // chamadas concorrentes a shareToFeed, publicando a mesma leitura
    // duplicada no Feed Social (POST /posts não é idempotente).
    if (sharingId) return;
    setSharingId(entry.id);
    try {
      await shareToFeed({ readingType: entry.type, title: entry.title, body: entry.body });
      Alert.alert('Compartilhado!', 'Sua leitura já apareceu no Feed Social.', [
        { text: 'Ver Feed', onPress: () => navigation.navigate(ROUTES.SOCIAL) },
        { text: 'Ok', style: 'cancel' },
      ]);
    } catch (e) {
      Alert.alert('Não deu', e.message);
    } finally {
      setSharingId(null);
    }
  }

  async function handlePin(entry) {
    const ok = await pinEntry(entry.id);
    if (!ok) return;
    const [pin, credits] = await Promise.all([getActivePin(), getPinCredits()]);
    setActivePin(pin);
    setPinCredits(credits);
    Alert.alert('Fixada!', `"${entry.title}" fica no topo do seu Diário pelos próximos 7 dias.`);
  }

  const filtered = filter === 'all' ? entries : entries.filter((e) => e.type === filter);
  // Entrada em destaque sempre primeiro (dentro do filtro atual) — a ordem
  // original (mais recente primeiro) continua pras demais.
  const pinnedId = activePin?.entryId || null;
  const visibleEntries = pinnedId
    ? [...filtered.filter((e) => e.id === pinnedId), ...filtered.filter((e) => e.id !== pinnedId)]
    : filtered;
  const usedTypes = new Set(entries.map((e) => e.type));
  const visibleFilters = FILTERS.filter((f) => f.key === 'all' || usedTypes.has(f.key));

  return (
    <View style={styles.root}>
      <GradientHeader title="Diário Cósmico" subtitle="Sua jornada até aqui" onBack={() => navigation.goBack()} />

      {!loading && weeklyEligibleCount >= 2 && !weeklyInsight && !loadingWeekly && (
        <TouchableOpacity activeOpacity={0.9} onPress={generateWeeklyInsight} style={styles.weeklyBtnWrap}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.weeklyBtn}>
            <Ionicons name="sparkles" size={18} color="#2A1D00" />
            <Text style={styles.weeklyBtnText}>Ver Insight da Semana</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {loadingWeekly && (
        <View style={styles.weeklyLoading}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.weeklyLoadingText}>Buscando o fio condutor da sua semana...</Text>
        </View>
      )}

      {weeklyInsight && (
        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyCardLabel}>INSIGHT DA SEMANA</Text>
          <Text style={styles.weeklyCardTitle}>{weeklyInsight.title}</Text>
          <Text style={styles.weeklyCardBody}>{weeklyInsight.body}</Text>
          <TouchableOpacity onPress={() => setWeeklyInsight(null)} style={{ marginTop: 10 }}>
            <Text style={styles.weeklyCardClose}>Fechar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && entries.length > 0 && visibleFilters.length > 1 && (
        <FlatList
          data={visibleFilters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(f) => f.key}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item }) => {
            const active = item.key === filter;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {!loading && entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="book" size={48} color={colors.accent} />
          <Text style={styles.emptyTitle}>Seu diário está esperando sua primeira leitura</Text>
          <Text style={styles.emptyDesc}>
            Toda leitura de tarô, palma, rosto, pé, pintas, café ou sonho que você fizer aparece aqui, guardadinha
            para você reviver quando quiser.
          </Text>
          {/* O texto lista SETE tipos de leitura e não oferecia nenhuma — com
              o diário vazio a barra de filtros nem renderiza, então a tela
              ficava sem uma única ação possível. HomeMain é a grade de
              leituras e mora no mesmo HomeStack. */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.emptyBtn}
            onPress={() => navigation.navigate(ROUTES.HOME_MAIN)}
          >
            <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.emptyBtnInner}>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.emptyBtnText}>{t('diary.empty.cta')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={visibleEntries}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <DiaryItem
              entry={item}
              expanded={expandedId === item.id}
              onToggle={() => setExpandedId((cur) => (cur === item.id ? null : item.id))}
              onDelete={() => confirmDelete(item.id)}
              canShare={canShare}
              sharing={sharingId === item.id}
              onShare={() => share(item)}
              pinned={item.id === pinnedId}
              canPin={pinCredits > 0}
              onPin={() => handlePin(item)}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyFilterWrap}>
                <Text style={styles.emptyFilterText}>Nenhuma leitura desse tipo ainda.</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  weeklyBtnWrap: { marginHorizontal: 16, marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  weeklyBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, gap: 8 },
  weeklyBtnText: { color: '#2A1D00', fontWeight: '800', fontSize: 14 },
  weeklyLoading: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  weeklyLoadingText: { color: colors.textMuted, fontSize: 13 },
  weeklyCard: {
    marginHorizontal: 16, marginTop: 16, padding: 16, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold + '55',
  },
  weeklyCardLabel: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 6 },
  weeklyCardTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  weeklyCardBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 8 },
  weeklyCardClose: { color: colors.accent, fontSize: 13, fontWeight: '700' },

  filterRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  chip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  listContent: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  cardPinned: { borderColor: colors.gold + '88', borderWidth: 1.5 },
  pinnedBanner: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  pinnedBannerText: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  pinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: colors.gold + '55',
  },
  pinText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  typeLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  title: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
  headerRight: { alignItems: 'flex-end', marginLeft: 8 },
  date: { color: colors.textMuted, fontSize: 12 },

  excerpt: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 10 },

  badge: {
    alignSelf: 'flex-start', backgroundColor: colors.accent + '22', borderRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 10,
  },
  badgeText: { color: colors.purple, fontSize: 11, fontWeight: '700' },

  expandedArea: { marginTop: 12, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 },
  fullBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  insightBlock: { marginTop: 14 },
  insightLabel: { color: colors.gold, fontSize: 12, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase' },
  voiceText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
  aiText: { color: colors.text, fontSize: 14, lineHeight: 20 },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: colors.teal + '55',
  },
  shareText: { color: colors.teal, fontSize: 13, fontWeight: '700' },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 16, paddingVertical: 10, borderRadius: 12,
    borderWidth: 1, borderColor: colors.red + '55',
  },
  deleteText: { color: colors.red, fontSize: 13, fontWeight: '700' },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 16 },
  emptyDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 22, borderRadius: 14, overflow: 'hidden', alignSelf: 'stretch' },
  emptyBtnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, gap: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  emptyFilterWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyFilterText: { color: colors.textMuted, fontSize: 13 },
});
