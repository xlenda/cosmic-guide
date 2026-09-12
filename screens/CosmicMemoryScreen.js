// MEMÓRIA CÓSMICA — o consentimento de continuidade entre conversas com Órbi,
// e a lista do que ficou lembrado.
//
// DIAGRAMAÇÃO (12/09/2026, lote de dado e número). Eram seis caixas com borda
// empilhadas à mesma distância: intro, consentimento, nota de privacidade,
// cabeçalho da lista, e cada lembrança. Agora são DUAS faixas curvas — o que a
// memória é (a intro e o interruptor) e o que ela guardou (a lista) — e os
// cards de lembrança perderam a borda própria: a faixa já é o chão deles.
//
// O TEXTO NÃO FOI TOCADO. Tudo o que se lê aqui vem de lib/cosmicMemoryCopy.js
// e é COMPROMISSO: o que entra na memória, o que nunca entra (Diário, dados
// natais, Comunidade, contexto de casal) e a promessa de que uma lembrança
// nunca é publicada. Isso alimenta o Data Safety da Play Store — aplica-se
// espaço e legibilidade, não se reescreve uma palavra.
//
// A NOTA DE PRIVACIDADE GANHOU A COLUNA DE LEITURA. É o parágrafo mais longo
// e mais importante da tela, e estava em 11,5px cinza apagado, colado embaixo
// do interruptor. Agora é `type.corpoCurto` dentro de ColunaLeitura: a linha
// para de atravessar a tela inteira e o olho acha o começo da seguinte.
//
// ESTADO VAZIO: a faixa da lista fica `rasa` quando não há lembrança nenhuma
// — que é o estado NORMAL de quem acabou de ligar (e o permanente de quem
// nunca ligou). Uma onda de altura inteira em volta de uma linha de texto é o
// bloco de cor sem conteúdo que o guia proíbe.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors, space, type } from '../theme';
import { ROUTES } from '../routes';
import { Alert } from '../lib/webAlert';
import { cosmicMemoryCopy, cosmicMemoryDate } from '../lib/cosmicMemoryCopy';
import {
  clearCosmicMemories,
  deleteCosmicMemoryItem,
  fetchCosmicMemory,
  setCosmicMemoryConsent,
} from '../lib/cosmicMemoryClient';

const EMPTY_STATE = Object.freeze({ enabled: false, consentVersion: null, consentedAt: null, memories: [] });

export default function CosmicMemoryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { lang = 'pt' } = useLanguage();
  const copy = useMemo(() => cosmicMemoryCopy(lang), [lang]);
  const [memory, setMemory] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(Boolean(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user) {
      setMemory(EMPTY_STATE);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setMemory(await fetchCosmicMemory());
    } catch {
      setError(copy.loadError);
    } finally {
      setLoading(false);
    }
  }, [copy.loadError, user]);

  useEffect(() => { load(); }, [load]);

  const toggleConsent = useCallback(async (enabled) => {
    if (saving || !user) return;
    setSaving(true);
    setError(null);
    try {
      const preference = await setCosmicMemoryConsent(enabled);
      setMemory((current) => ({ ...current, ...preference, memories: current.memories }));
    } catch {
      setError(copy.saveError);
    } finally {
      setSaving(false);
    }
  }, [copy.saveError, saving, user]);

  const removeOne = useCallback((item) => {
    Alert.alert(copy.removeTitle, copy.removeBody, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.removeConfirm,
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCosmicMemoryItem(item.id);
            setMemory((current) => ({ ...current, memories: current.memories.filter((entry) => entry.id !== item.id) }));
          } catch {
            setError(copy.deleteError);
          }
        },
      },
    ]);
  }, [copy]);

  const clearAll = useCallback(() => {
    Alert.alert(copy.clearTitle, copy.clearBody, [
      { text: copy.cancel, style: 'cancel' },
      {
        text: copy.clearConfirm,
        style: 'destructive',
        onPress: async () => {
          try {
            await clearCosmicMemories();
            setMemory((current) => ({ ...current, memories: [] }));
          } catch {
            setError(copy.deleteError);
          }
        },
      },
    ]);
  }, [copy]);

  const semLembranca = !user || memory.memories.length === 0;

  const header = (
    <View>
      {/* FAIXA 1 — O QUE ESTA MEMÓRIA É. Intro, o interruptor e o compromisso
          de privacidade num assunto só: são a mesma decisão. */}
      <FaixaCurva tom="ameixa" semente="memoria-o-que-e" estiloCorpo={styles.faixaCorpo}>
        <View style={styles.heroLinha}>
          <View style={styles.heroIcon}><Ionicons name="sparkles" size={22} color={colors.gold} /></View>
          <Text style={styles.intro}>{copy.intro}</Text>
        </View>

        {!user ? (
          <ColunaLeitura style={styles.blocoLogin}>
            <Text style={styles.cardTitle}>{copy.loginTitle}</Text>
            <Text style={styles.body}>{copy.loginBody}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>{copy.loginCta}</Text>
            </Pressable>
          </ColunaLeitura>
        ) : (
          <>
            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: memory.enabled, disabled: saving }}
              onPress={() => toggleConsent(!memory.enabled)}
              disabled={saving}
              style={({ pressed }) => [styles.consentCard, pressed && !saving && styles.pressed]}
            >
              <View style={styles.consentCopy}>
                <Text style={styles.cardTitle}>{copy.consentTitle}</Text>
                <Text style={styles.body}>{copy.consentBody}</Text>
                <Text style={[styles.status, memory.enabled && styles.statusEnabled]}>
                  {memory.enabled ? copy.enabled : copy.disabled}
                </Text>
              </View>
              <View pointerEvents="none">
                <Switch
                  value={memory.enabled}
                  onValueChange={toggleConsent}
                  disabled={saving}
                  trackColor={{ false: colors.border, true: colors.accent }}
                  thumbColor="#fff"
                />
              </View>
            </Pressable>
            {/* O compromisso: o parágrafo mais importante da tela, agora em
                corpo de leitura e coluna medida em caracteres por linha. */}
            <ColunaLeitura style={styles.privacyNote}>
              <View style={styles.privacyLinha}>
                <Ionicons name="shield-checkmark-outline" size={17} color={colors.textMuted} style={styles.privacyIcone} />
                <Text style={styles.privacyText}>{copy.privacy}</Text>
              </View>
            </ColunaLeitura>
          </>
        )}

        {error ? (
          <View style={styles.errorCard}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>{error}</Text>
            <Pressable accessibilityRole="button" onPress={load} style={styles.retryButton}>
              <Text style={styles.retryText}>{copy.retry}</Text>
            </Pressable>
          </View>
        ) : null}
      </FaixaCurva>

      {/* FAIXA 2 — O QUE ELA GUARDOU. Abre aqui e o corpo continua embaixo,
          nas linhas da FlatList: a faixa é o CHÃO da lista, não uma caixa em
          volta dela. `rasa` sem lembrança nenhuma. */}
      {user ? (
        <FaixaCurva
          tom="noite"
          semente="memoria-lembrancas"
          grude
          rasa={semLembranca}
          estiloCorpo={styles.faixaLista}
        >
          <View style={styles.listHeading}>
            <Text style={styles.sectionTitle}>{copy.rememberedTitle}</Text>
            {memory.memories.length > 0 ? (
              <Pressable accessibilityRole="button" onPress={clearAll} hitSlop={8}>
                <Text style={styles.clearText}>{copy.clearAll}</Text>
              </Pressable>
            ) : null}
          </View>
        </FaixaCurva>
      ) : null}
    </View>
  );

  const renderMemory = useCallback(({ item }) => (
    <View style={styles.memoryCard}>
      <View style={styles.memoryMeta}>
        <Text style={styles.topic}>{copy.topics[item.topic] || copy.topics.general}</Text>
        <Text style={styles.date}>{cosmicMemoryDate(item.updatedAt || item.createdAt, lang)}</Text>
      </View>
      <Text style={styles.memoryText}>“{item.content}”</Text>
      <View style={styles.memoryFooter}>
        <Text style={styles.source}>{copy.source}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.removeLabel}
          onPress={() => removeOne(item)}
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.red} />
        </Pressable>
      </View>
    </View>
  ), [copy, lang, removeOne]);

  return (
    <View style={styles.root}>
      <GradientHeader title={copy.title} onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.loadingText}>{copy.loading}</Text>
        </View>
      ) : (
        <FlatList
          data={user ? memory.memories : []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderMemory}
          ListHeaderComponent={header}
          ListEmptyComponent={user ? (
            <ColunaLeitura centralizado>
              <Text style={styles.emptyText}>{memory.enabled ? copy.emptyEnabled : copy.emptyDisabled}</Text>
            </ColunaLeitura>
          ) : null}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // Sem padding horizontal: as faixas sangram de ponta a ponta e trazem o
  // próprio `space.tela` por dentro. O que sobra é a margem das linhas da
  // lista, que vivem FORA da faixa e por isso pedem a sua.
  content: { paddingBottom: space.fimDaLista },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space.dentro },
  loadingText: { ...type.apoio, color: colors.textMuted },

  faixaCorpo: { paddingTop: space.secao },
  // A faixa da lista só carrega o cabeçalho: as linhas continuam embaixo dela,
  // no corpo da FlatList. Por isso não tem respiro embaixo — o assunto segue.
  faixaLista: { paddingTop: space.secao, paddingBottom: space.bloco },

  heroLinha: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  heroIcon: {
    width: 44, height: 44, borderRadius: space.bloco,
    alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold + '14',
  },
  intro: { ...type.corpoCurto, flex: 1, color: colors.text },

  blocoLogin: { marginTop: space.entre, paddingHorizontal: 0 },
  consentCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.bloco,
    paddingVertical: space.entre, marginTop: space.entre,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border,
  },
  consentCopy: { flex: 1 },
  cardTitle: { ...type.cartao, color: colors.text },
  body: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.junto },
  status: { ...type.etiqueta, color: colors.textMuted, marginTop: space.dentro },
  statusEnabled: { color: colors.gold },
  primaryButton: {
    minHeight: 48, alignItems: 'center', justifyContent: 'center',
    borderRadius: space.bloco, backgroundColor: colors.accent, marginTop: space.entre,
  },
  primaryButtonText: { ...type.botao, color: '#fff' },

  privacyNote: { marginTop: space.entre, paddingHorizontal: 0 },
  privacyLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: space.dentro },
  privacyIcone: { marginTop: space.grudado },
  privacyText: { ...type.corpoCurto, flex: 1, color: colors.textMuted },

  listHeading: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    gap: space.dentro, minHeight: 44,
  },
  sectionTitle: { ...type.secao, color: colors.text },
  clearText: { ...type.botao, color: colors.red, textAlign: 'right' },

  memoryCard: {
    padding: space.bloco, marginHorizontal: space.tela, marginTop: space.dentro,
    borderRadius: space.bloco, backgroundColor: colors.card,
    borderWidth: 1, borderColor: colors.border,
  },
  memoryMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: space.dentro },
  topic: { ...type.etiqueta, color: colors.gold, textTransform: 'uppercase' },
  date: { ...type.nota, color: colors.textMuted },
  memoryText: { ...type.corpoCurto, color: colors.text, marginTop: space.dentro },
  memoryFooter: {
    minHeight: 44, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginTop: space.junto,
  },
  source: { ...type.nota, flex: 1, color: colors.textMuted },
  deleteButton: { width: 44, height: 44, borderRadius: space.bloco, alignItems: 'center', justifyContent: 'center' },

  emptyText: {
    ...type.corpoCurto, color: colors.textMuted, textAlign: 'center',
    paddingVertical: space.secao,
  },

  errorCard: {
    flexDirection: 'row', alignItems: 'center', gap: space.dentro,
    padding: space.bloco, borderRadius: space.bloco,
    backgroundColor: colors.red + '12', marginTop: space.entre,
  },
  errorText: { ...type.corpoCurto, flex: 1, color: colors.red },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: space.junto },
  retryText: { ...type.botao, color: colors.text },
  pressed: { opacity: 0.72 },
});
