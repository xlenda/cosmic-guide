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
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';
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

  const header = (
    <View>
      <View style={styles.heroCard}>
        <View style={styles.heroIcon}><Ionicons name="sparkles" size={22} color={colors.gold} /></View>
        <Text style={styles.intro}>{copy.intro}</Text>
      </View>

      {!user ? (
        <View style={styles.loginCard}>
          <Text style={styles.cardTitle}>{copy.loginTitle}</Text>
          <Text style={styles.body}>{copy.loginBody}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.navigate(ROUTES.LOGIN)}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{copy.loginCta}</Text>
          </Pressable>
        </View>
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
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={17} color={colors.textMuted} />
            <Text style={styles.privacyText}>{copy.privacy}</Text>
          </View>
          <View style={styles.listHeading}>
            <Text style={styles.sectionTitle}>{copy.rememberedTitle}</Text>
            {memory.memories.length > 0 ? (
              <Pressable accessibilityRole="button" onPress={clearAll} hitSlop={8}>
                <Text style={styles.clearText}>{copy.clearAll}</Text>
              </Pressable>
            ) : null}
          </View>
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
            <Text style={styles.emptyText}>{memory.enabled ? copy.emptyEnabled : copy.emptyDisabled}</Text>
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
  content: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 42 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { color: colors.textMuted, fontSize: 13 },
  heroCard: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 17, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold + '32', marginBottom: 14 },
  heroIcon: { width: 44, height: 44, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold + '14' },
  intro: { flex: 1, color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  loginCard: { padding: 18, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  consentCard: { minHeight: 116, flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  consentCopy: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '800' },
  body: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  status: { color: colors.textMuted, fontSize: 12, fontWeight: '800', marginTop: 10 },
  statusEnabled: { color: colors.gold },
  primaryButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 14, backgroundColor: colors.accent, marginTop: 16 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingHorizontal: 4, marginTop: 13 },
  privacyText: { flex: 1, color: colors.textMuted, fontSize: 11.5, lineHeight: 17 },
  listHeading: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 16 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  clearText: { color: colors.red, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  memoryCard: { padding: 16, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: 11 },
  memoryMeta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  topic: { color: colors.gold, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.45 },
  date: { color: colors.textMuted, fontSize: 11 },
  memoryText: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 10 },
  memoryFooter: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  source: { flex: 1, color: colors.textMuted, fontSize: 11.5 },
  deleteButton: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 13, lineHeight: 20, textAlign: 'center', paddingHorizontal: 20, paddingVertical: 34 },
  errorCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14, backgroundColor: colors.red + '12', marginTop: 14 },
  errorText: { flex: 1, color: colors.red, fontSize: 12.5, lineHeight: 18 },
  retryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  retryText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
