// screens/DiaryScreen.js
// Diário Cósmico — histórico unificado de todas as leituras já feitas no app
// (tarô, palma, rosto, pé, pintas, café, sonho), lidas de lib/journal.js.
// Recarrega a cada foco de tela (useFocusEffect) porque a pessoa normalmente
// chega aqui vindo de uma leitura que acabou de salvar uma entrada nova.
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
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
  toggleFavorito,
  isEntradaFavorita,
} from '../lib/journal';
import { fetchAiWeeklyInsight, isAiAccessError, isLoginRequired } from '../lib/aiClient';
import { lerCheckins, resumoDaSemana } from '../lib/checkin';
import { useAuth } from '../context/AuthContext';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { shareToFeed } from '../lib/socialClient';
import { ROUTES } from '../routes';
// O VAZIO ILUSTRADO ([BLOCO-ESPERA], 09/08/2026) — o diário sem entradas já
// tinha empty-state decente (título, texto e CTA, que FICAM intocados); entrou
// só a arte acima deles, e o vazio vira convite visual.
// [AUTO-DECISION] tile-retrospectiva, como a missão sugeriu: é a arte de
// "olhar o caminho percorrido", exatamente o que o diário promete guardar.
// Contrato de lib/ilustracoes.js: arte null → o ícone de livro de sempre
// continua no lugar (a arte é upgrade, nunca dependência).
import { tileArte } from '../lib/ilustracoes';

const ARTE_VAZIO = tileArte('retrospectiva');

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
  // 'fav' não é um TYPE de leitura — é um corte transversal (favoritas de
  // qualquer tipo). O tratamento especial dele vive em `filtered` e em
  // `visibleFilters`, nunca aqui no array.
  { key: 'fav', label: 'diary.filter.fav' },
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

function DiaryItem({ entry, expanded, onToggle, onDelete, canShare, onShare, sharing, pinned, canPin, onPin, onToggleFavorito }) {
  const { t } = useLanguage();
  const hasInsight = !!(entry.voiceTranscript || entry.aiInsight);
  const iconName = TYPE_ICONS[entry.type] || 'sparkles';
  // Sempre pelo predicado de lib/journal.js — entrada antiga não tem o campo
  // `favorito` e a regra "ausente = não-favorita" mora lá, não aqui.
  const favorito = isEntradaFavorita(entry);

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
          <View style={styles.headerRightTop}>
            {/* Coração TouchableOpacity aninhado no card: o toque no filho não
                propaga pro pai no RN, então favoritar não expande o card. Pink,
                não red — red aqui é a cor de apagar (deleteBtn), e coração da
                mesma cor do lixo confunde. */}
            <TouchableOpacity
              onPress={onToggleFavorito}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={favorito ? 'heart' : 'heart-outline'}
                size={18}
                color={favorito ? colors.pink : colors.textMuted}
              />
            </TouchableOpacity>
            <Text style={styles.date}>{formatDate(entry.date, t)}</Text>
          </View>
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
              <Text style={styles.insightLabel}>{t('diary.insight.original')}</Text>
              <Text style={styles.voiceText}>{entry.voiceTranscript}</Text>
            </View>
          )}

          {!!entry.aiInsight && (
            <View style={styles.insightBlock}>
              <Text style={styles.insightLabel}>{t('diary.insight.polished')}</Text>
              <Text style={styles.aiText}>{entry.aiInsight}</Text>
            </View>
          )}

          {canPin && !pinned && (
            <TouchableOpacity style={styles.pinBtn} onPress={onPin} activeOpacity={0.8}>
              <Ionicons name="bookmark" size={16} color={colors.gold} />
              <Text style={styles.pinText}>{t('diary.pin.cta')}</Text>
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
            <Text style={styles.deleteText}>{t('diary.delete.cta')}</Text>
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
      // O placar do check-in vai junto (04/08/2026): a síntese passa a ler
      // como a pessoa MARCOU a própria semana — dado dela, contagem literal.
      // Falha ao ler o placar nunca segura o insight: extras é opcional.
      let extras;
      try {
        const dados = await lerCheckins();
        const placar = resumoDaSemana(dados);
        if (placar.atual.total > 0) extras = { checkins: placar };
      } catch {}
      result = await fetchAiWeeklyInsight(
        recent.map((e) => ({ type: e.type, typeLabel: e.typeLabel, title: e.title, body: e.body })),
        extras
      );
    } catch (err) {
      // PAYWALL DE VERDADE (30/07/2026): a cota grátis do Insight da Semana
      // passou a ser contada no SERVIDOR, por CONTA. Um 402/401 com `code`
      // conhecido não é falha técnica, então NÃO cai no fallback: o Diário não
      // vira um muro (ele tem todo o resto do histórico, que continua sendo
      // dela), mas o insight não é entregue e a pessoa é levada pro lugar que
      // resolve — assinar, ou criar conta se for esse o caso.
      if (isAiAccessError(err)) {
        setLoadingWeekly(false);
        Alert.alert(
          isLoginRequired(err) ? 'Entre na sua conta' : 'Insight da Semana',
          isLoginRequired(err)
            ? 'Crie sua conta (é grátis) para gerar o Insight da Semana.'
            : 'Suas gerações gratuitas acabaram. Assine o Cosmic Guide para continuar gerando o Insight da Semana.',
          [
            { text: 'Agora não', style: 'cancel' },
            {
              text: isLoginRequired(err) ? 'Criar conta' : 'Assinar',
              onPress: () => navigation.navigate(isLoginRequired(err) ? ROUTES.LOGIN : ROUTES.PLANOS),
            },
          ]
        );
        return;
      }
      // Nunca mostra erro cru — cai no fallback honesto (só lista o que
      // realmente aconteceu, sem inventar síntese).
      result = getFallbackWeeklyInsight(recent, t);
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

  async function handleToggleFavorito(entry) {
    const next = await toggleFavorito(entry.id);
    if (next === null) return; // id sumiu do storage (ex.: apagada em outra aba) — nada a refletir
    // Espelha só a entrada tocada no estado local — sem reload da lista
    // inteira, o coração responde no mesmo frame do toque.
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, favorito: next } : e)));
  }

  async function handlePin(entry) {
    const ok = await pinEntry(entry.id);
    if (!ok) return;
    const [pin, credits] = await Promise.all([getActivePin(), getPinCredits()]);
    setActivePin(pin);
    setPinCredits(credits);
    Alert.alert('Fixada!', `"${entry.title}" fica no topo do seu Diário pelos próximos 7 dias.`);
  }

  const filtered =
    filter === 'all'
      ? entries
      : filter === 'fav'
        ? entries.filter(isEntradaFavorita)
        : entries.filter((e) => e.type === filter);
  // Entrada em destaque sempre primeiro (dentro do filtro atual) — a ordem
  // original (mais recente primeiro) continua pras demais.
  const pinnedId = activePin?.entryId || null;
  const visibleEntries = pinnedId
    ? [...filtered.filter((e) => e.id === pinnedId), ...filtered.filter((e) => e.id !== pinnedId)]
    : filtered;
  const usedTypes = new Set(entries.map((e) => e.type));
  // O chip Favoritas segue a mesma regra dos chips de tipo (só aparece quando
  // tem o que mostrar) — MAS nunca some enquanto está selecionado: sem o
  // `filter === 'fav'`, desfavoritar a última favorita com o filtro ativo
  // apagava o chip debaixo do dedo e deixava a tela presa num filtro sem botão.
  const hasFavorites = entries.some(isEntradaFavorita);
  const visibleFilters = FILTERS.filter((f) => {
    if (f.key === 'all') return true;
    if (f.key === 'fav') return hasFavorites || filter === 'fav';
    return usedTypes.has(f.key);
  });

  return (
    <View style={styles.root}>
      <GradientHeader title="Diário Cósmico" subtitle="Sua jornada até aqui" onBack={() => navigation.goBack()} />

      {!loading && weeklyEligibleCount >= 2 && !weeklyInsight && !loadingWeekly && (
        <TouchableOpacity activeOpacity={0.9} onPress={generateWeeklyInsight} style={styles.weeklyBtnWrap}>
          <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.weeklyBtn}>
            <Ionicons name="sparkles" size={18} color="#2A1D00" />
            <Text style={styles.weeklyBtnText}>{t('diary.weekly.cta')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {loadingWeekly && (
        <View style={styles.weeklyLoading}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.weeklyLoadingText}>{t('diary.weekly.loading')}</Text>
        </View>
      )}

      {weeklyInsight && (
        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyCardLabel}>INSIGHT DA SEMANA</Text>
          <Text style={styles.weeklyCardTitle}>{weeklyInsight.title}</Text>
          <Text style={styles.weeklyCardBody}>{weeklyInsight.body}</Text>
          {/* Marcador de fim — o insight é um texto longo e a pessoa não sabia
              se tinha acabado ou se a tela cortou ("tenta subir a tela achando
              que tem mais coisas escritas" — relato real do testador,
              29/07/2026). O ornamento diz visualmente "terminou aqui". */}
          <Text style={styles.weeklyCardEnd}>✦ ✦ ✦</Text>
          <TouchableOpacity onPress={() => setWeeklyInsight(null)} style={{ marginTop: 10 }}>
            <Text style={styles.weeklyCardClose}>{t('diary.close')}</Text>
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
                {/* t() aqui é obrigatório: item.label é a CHAVE de tradução
                    ('diary.filter.tarot'), não o texto. Sem o t() o chip
                    mostrava a chave crua pro usuário — print real do dono em
                    31/07/2026. As chaves sempre existiram nos três idiomas; o
                    guarda de i18n não pega porque ele confere dicionário, não
                    render — era a tela que não traduzia. */}
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(item.label)}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {!loading && entries.length === 0 ? (
        <View style={styles.emptyWrap}>
          {/* A arte no lugar do ícone seco — mesma regra dos mascotes: com
              imagem, imagem; sem imagem, o glifo de sempre. accessible=false
              porque é cenário, não informação (o texto abaixo diz tudo). */}
          {ARTE_VAZIO ? (
            <Image source={ARTE_VAZIO} style={styles.emptyArte} resizeMode="cover" accessible={false} />
          ) : (
            <Ionicons name="book" size={48} color={colors.accent} />
          )}
          <Text style={styles.emptyTitle}>{t('diary.empty.waiting')}</Text>
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
              onToggleFavorito={() => handleToggleFavorito(item)}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyFilterWrap}>
                {/* O vazio dos FAVORITOS merece frase propria: 'Nenhuma leitura
                    desse tipo ainda' e verdade pros chips de tipo, mas pro coracao
                    a pessoa precisa saber COMO favoritar — senao o chip parece
                    quebrado. */}
                <Text style={styles.emptyFilterText}>
                  {t(filter === 'fav' ? 'diary.empty.fav' : 'diary.empty.filtered')}
                </Text>
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
  weeklyCardEnd: { color: colors.gold, fontSize: 12, textAlign: 'center', marginTop: 14, letterSpacing: 6, opacity: 0.7 },

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
  headerRightTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  // A arte do vazio ([BLOCO-ESPERA]) — 112px redonda, dentro da faixa 96-120
  // pedida; convite visual, sem animação (vazio não é espera).
  emptyArte: { width: 112, height: 112, borderRadius: 56 },
  emptyTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 16 },
  emptyDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  emptyBtn: { marginTop: 22, borderRadius: 14, overflow: 'hidden', alignSelf: 'stretch' },
  emptyBtnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, gap: 8 },
  emptyBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  emptyFilterWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyFilterText: { color: colors.textMuted, fontSize: 13 },
});
