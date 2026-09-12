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
import { colors, gradients, space, type } from '../theme';
import ColunaLeitura from '../components/ColunaLeitura';
import GradientHeader from '../components/GradientHeader';
import UniversoGirando from '../components/UniversoGirando';
import ReportarIA from '../components/ReportarIA';
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

function socialBodyForEntry(entry) {
  if (typeof entry?.shareBody === 'string' && entry.shareBody.trim()) return entry.shareBody.trim();
  // Entradas antigas não tinham corpo público separado. O fallback só é
  // permitido quando também não existe nenhum campo privado novo; retirar
  // pergunta/reflexão de um texto pronto seria uma proteção frágil.
  if (entry?.question || entry?.reflection || entry?.readingDetails) return '';
  return typeof entry?.body === 'string' ? entry.body : '';
}

function entryLabels(entry, t) {
  if (entry?.type === 'chat') {
    const label = t('orbi.chat.diaryLabel');
    return { typeLabel: label, title: label };
  }
  return { typeLabel: entry?.typeLabel, title: entry?.title };
}

function DiaryItem({ entry, expanded, onToggle, onDelete, canShare, onShare, sharing, pinned, canPin, onPin, onToggleFavorito }) {
  const { t } = useLanguage();
  const hasInsight = !!(entry.voiceTranscript || entry.aiInsight);
  const iconName = TYPE_ICONS[entry.type] || 'sparkles';
  // Entradas do chat antigo preservam o conteúdo e a data, mas a superfície
  // atual usa uma única voz de produto. Assim, histórico de Luna/Arcano não
  // reaparece como uma segunda identidade dentro do Diário.
  const visibleLabels = entryLabels(entry, t);
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
          <Text style={styles.typeLabel}>{visibleLabels.typeLabel}</Text>
          <Text style={styles.title}>{visibleLabels.title}</Text>
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
          {!!entry.question && (
            <View style={styles.privateBlock}>
              <View style={styles.privateLabelRow}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.gold} />
                <Text style={styles.insightLabel}>{t('tarot.diary.question')}</Text>
              </View>
              <Text style={styles.privateText}>“{entry.question}”</Text>
            </View>
          )}

          <Text style={styles.fullBody}>{entry.body}</Text>

          {!!entry.reflection && (
            <View style={styles.privateBlock}>
              <View style={styles.privateLabelRow}>
                <Ionicons name="lock-closed-outline" size={13} color={colors.gold} />
                <Text style={styles.insightLabel}>{t('tarot.diary.reflection')}</Text>
              </View>
              <Text style={styles.privateText}>{entry.reflection}</Text>
            </View>
          )}

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
              <Text style={styles.shareText}>
                {sharing ? t('tarot.community.sharing') : t('tarot.community.share')}
              </Text>
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
      const safeRecent = recent.map((e) => ({ type: e.type, ...entryLabels(e, t), body: e.body }));
      result = await fetchAiWeeklyInsight(
        safeRecent,
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
      result = getFallbackWeeklyInsight(
        recent.map((e) => ({ ...e, ...entryLabels(e, t) })),
        t
      );
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
      const publicBody = socialBodyForEntry(entry);
      if (!publicBody) throw new Error(t('tarot.community.privateBodyMissing'));
      await shareToFeed({ readingType: entry.type, title: entry.title, body: publicBody });
      Alert.alert(t('tarot.community.sharedTitle'), t('tarot.community.sharedBody'), [
        {
          text: t('tarot.community.view'),
          onPress: () => (navigation.getParent() || navigation).navigate(
            ROUTES.COMMUNITY_TAB,
            { screen: ROUTES.SOCIAL }
          ),
        },
        { text: t('tarot.community.ok'), style: 'cancel' },
      ]);
    } catch {
      Alert.alert(t('tarot.community.errorTitle'), t('tarot.community.errorBody'));
    } finally {
      setSharingId(null);
    }
  }

  function confirmShare(entry) {
    const publicBody = socialBodyForEntry(entry);
    if (!publicBody) {
      Alert.alert(t('tarot.community.errorTitle'), t('tarot.community.privateBodyMissing'));
      return;
    }
    Alert.alert(
      t('tarot.community.previewTitle'),
      [t('tarot.community.previewBody'), entry.title, publicBody].filter(Boolean).join('\n\n'),
      [
        { text: t('tarot.community.cancel'), style: 'cancel' },
        { text: t('tarot.community.publish'), onPress: () => share(entry) },
      ]
    );
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
      {/* Título e subtítulo saíram do código pro dicionário (10/09/2026): eram
          as duas únicas strings em português desta tela, cercadas de texto já
          traduzido — quem usa em ES ou EN abria uma tela inteira no idioma
          certo com o cabeçalho em português. */}
      <GradientHeader title={t('diary.headerTitle')} subtitle={t('diary.headerSubtitle')} onBack={() => navigation.goBack()} />

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
          <Text style={styles.weeklyCardLabel}>{t('diary.weekly.label')}</Text>
          <Text style={styles.weeklyCardTitle}>{weeklyInsight.title}</Text>
          {/* O Insight é o único parágrafo longo do Diário — o testador
              relatou "tenta subir a tela achando que tem mais coisas
              escritas", e linha comprida demais é parte desse efeito. */}
          <ColunaLeitura style={styles.weeklyColuna}>
            <Text style={styles.weeklyCardBody}>{weeklyInsight.body}</Text>
          </ColunaLeitura>
          {/* Marcador de fim — o insight é um texto longo e a pessoa não sabia
              se tinha acabado ou se a tela cortou ("tenta subir a tela achando
              que tem mais coisas escritas" — relato real do testador,
              29/07/2026). O ornamento diz visualmente "terminou aqui". */}
          <Text style={styles.weeklyCardEnd}>✦ ✦ ✦</Text>
          {/* Denúncia da saída de IA — o Insight da Semana é gerado por IA
              (fetchAiWeeklyInsight), e a política do Google Play exige o canal
              dentro do app. */}
          <ReportarIA kind="weekly_insight" />
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
          {/* O UNIVERSO GIRANDO no lugar da arte parada (11/09/2026, pedido do
              dono: "o universo girando lá igual as fotos"). O diário vazio é
              justamente onde a tela precisava de sinal de vida — antes era uma
              ilustração estática sobre fundo chapado, e o vazio lia como tela
              quebrada. Movimento lento e contínuo diz "isto está rodando,
              falta você começar". Respeita "reduzir movimento" do sistema:
              quem liga a opção vê o mesmo desenho, parado. */}
          <UniversoGirando size={300} testID="diary-universo" />
          <Text style={styles.emptyTitle}>{t('diary.empty.waiting')}</Text>
          <ColunaLeitura centralizado>
            <Text style={styles.emptyDesc}>{t('diary.empty.desc')}</Text>
          </ColunaLeitura>
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
              onShare={() => confirmShare(item)}
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

  weeklyBtnWrap: { marginHorizontal: space.tela, marginTop: space.bloco, borderRadius: 14, overflow: 'hidden' },
  weeklyBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: space.bloco, gap: space.junto },
  weeklyBtnText: { ...type.botao, color: '#2A1D00' },
  weeklyLoading: { alignItems: 'center', paddingVertical: space.entre, gap: space.junto },
  weeklyLoadingText: { ...type.apoio, color: colors.textMuted },
  weeklyCard: {
    marginHorizontal: space.tela, marginTop: space.bloco, padding: space.entre, borderRadius: 16,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold + '55',
  },
  weeklyCardLabel: { ...type.etiqueta, color: colors.gold, marginBottom: space.junto },
  // 20/26 no lugar de 16/800: o título do Insight é o título de seção desta
  // tela, e o degrau existe. Peso vem do degrau — nada reposto depois do spread.
  weeklyCardTitle: { ...type.secao, color: colors.text },
  weeklyColuna: { marginTop: space.dentro, paddingHorizontal: 0 },
  weeklyCardBody: { ...type.corpo, color: colors.textSecondary },
  weeklyCardClose: { ...type.botao, color: colors.accent },
  weeklyCardEnd: { ...type.apoio, color: colors.gold, textAlign: 'center', marginTop: space.bloco, letterSpacing: 6, opacity: 0.7 },

  filterRow: { paddingHorizontal: space.tela, paddingVertical: space.dentro, gap: space.junto },
  chip: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 20, paddingHorizontal: space.bloco, paddingVertical: space.junto, marginRight: space.junto,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { ...type.apoio, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  listContent: { padding: space.tela, paddingBottom: space.fimDaLista },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: space.entre, marginBottom: space.dentro,
  },
  cardPinned: { borderColor: colors.gold + '88', borderWidth: 1.5 },
  pinnedBanner: { flexDirection: 'row', alignItems: 'center', gap: space.junto, marginBottom: space.dentro },
  pinnedBannerText: { ...type.etiqueta, color: colors.gold },
  pinBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    marginTop: space.bloco, paddingVertical: space.dentro, borderRadius: 12,
    borderWidth: 1, borderColor: colors.gold + '55',
  },
  pinText: { ...type.botao, color: colors.gold },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center', marginRight: space.dentro,
  },
  typeLabel: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  // 17/22 no lugar de 15/800: é o nome do item de lista, que é exatamente o
  // degrau `cartao`. O peso desce de 800 pra 600 (o do degrau) — 800 em todo
  // título de card é o "negrito em tudo" do diagnóstico.
  title: { ...type.cartao, color: colors.text, marginTop: space.grudado },
  headerRight: { alignItems: 'flex-end', marginLeft: space.junto },
  headerRightTop: { flexDirection: 'row', alignItems: 'center', gap: space.junto },
  date: { ...type.apoio, color: colors.textMuted },

  excerpt: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.dentro },

  badge: {
    alignSelf: 'flex-start', backgroundColor: colors.accent + '22', borderRadius: 10,
    paddingHorizontal: space.dentro, paddingVertical: space.grudado, marginTop: space.dentro,
  },
  badgeText: { ...type.nota, color: colors.purple, fontWeight: '600' },

  expandedArea: { marginTop: space.bloco, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.bloco },
  // O corpo da leitura guardada: degrau de texto corrido (17/27). É A leitura,
  // não uma legenda dela.
  fullBody: { ...type.corpo, color: colors.textSecondary },

  insightBlock: { marginTop: space.entre },
  insightLabel: { ...type.etiqueta, color: colors.gold, marginBottom: space.junto, textTransform: 'uppercase' },
  voiceText: { ...type.corpoCurto, color: colors.textSecondary, fontStyle: 'italic' },
  aiText: { ...type.corpoCurto, color: colors.text },
  privateBlock: {
    marginBottom: space.bloco,
    padding: space.bloco,
    borderRadius: 12,
    backgroundColor: colors.gold + '0D',
    borderWidth: 1,
    borderColor: colors.gold + '26',
  },
  privateLabelRow: { flexDirection: 'row', alignItems: 'center', gap: space.junto },
  privateText: { ...type.corpoCurto, color: colors.textSecondary },

  shareBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    marginTop: space.bloco, paddingVertical: space.dentro, borderRadius: 12,
    borderWidth: 1, borderColor: colors.teal + '55',
  },
  shareText: { ...type.botao, color: colors.teal },

  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    marginTop: space.bloco, paddingVertical: space.dentro, borderRadius: 12,
    borderWidth: 1, borderColor: colors.red + '55',
  },
  deleteText: { ...type.botao, color: colors.red },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.entre },
  // A arte do vazio ([BLOCO-ESPERA]) — 112px redonda, dentro da faixa 96-120
  // pedida; convite visual, sem animação (vazio não é espera).
  // ESTADO VAZIO CONFERIDO (12/09/2026): não há faixa aqui, e de propósito —
  // o vazio do Diário é o UniversoGirando centralizado em tela cheia, não uma
  // seção. Pôr uma faixa em volta de um convite de 3 linhas seria exatamente o
  // "bloco de cor vazio" que o revisor achou na Home.
  emptyTitle: { ...type.secao, color: colors.text, textAlign: 'center', marginTop: space.bloco },
  emptyDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.dentro },
  emptyBtn: { marginTop: space.secao, borderRadius: 14, overflow: 'hidden', alignSelf: 'stretch' },
  emptyBtnInner: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: space.bloco, gap: space.junto },
  emptyBtnText: { ...type.botao, color: '#fff' },

  emptyFilterWrap: { alignItems: 'center', paddingVertical: space.ar },
  emptyFilterText: { ...type.apoio, color: colors.textMuted },
});
