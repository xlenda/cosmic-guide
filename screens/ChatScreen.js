import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  AccessibilityInfo,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import OrbiGuide from '../components/OrbiGuide';
import ReportarIA from '../components/ReportarIA';
import { fetchAiChatReply, isAiAccessError, isLoginRequired } from '../lib/aiClient';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { recordMissionAction, MISSION_ACTIONS } from '../lib/missions';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { hasReachedFreeMessageLimit, incrementFreeMessagesSent } from '../lib/chatFreeMessages';
import { getOnboardingProfile } from '../lib/onboardingPlan';
import {
  ORBI_DIARY_RECORDED_KEY,
  ORBI_HISTORY_KEY,
  ORBI_LEGACY_HISTORY_KEYS,
  ORBI_PERSONA_ID,
  buildOrbiChatContext,
  buildOrbiSuggestionSpecs,
} from '../lib/orbiConversation';
import { nomeDoSigno } from '../lib/synastry';
import { Alert } from '../lib/webAlert';

const HISTORY_MAX_MESSAGES = 60;

function cleanStoredMessages(value, legacy = false) {
  if (!Array.isArray(value)) return [];
  let foundFirstUser = !legacy;
  return value
    .filter((item) => item && typeof item.text === 'string' && (item.from === 'user' || item.from === 'persona'))
    .filter((item) => {
      // As conversas antigas começavam com uma apresentação local da persona.
      // Ela não é uma resposta da IA nem deve reaparecer como fala do Órbi.
      if (!foundFirstUser && item.from !== 'user') return false;
      if (item.from === 'user') foundFirstUser = true;
      return true;
    })
    .map((item) => ({
      id: String(item.id || `${Date.now()}-${Math.random()}`),
      from: item.from,
      text: item.text.slice(0, 12000),
      ...(legacy || item.migrated === true ? { migrated: true } : {}),
    }));
}

async function readHistory(key, legacy = false) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? cleanStoredMessages(JSON.parse(raw), legacy) : [];
  } catch {
    return [];
  }
}

function messageTime(item) {
  const value = Number.parseInt(String(item.id).split('-')[0], 10);
  return Number.isFinite(value) ? value : 0;
}

async function loadOrbiHistory() {
  const current = await readHistory(ORBI_HISTORY_KEY);
  if (current.length) return { messages: current, migrated: current.some((item) => item.migrated) };

  // Migração idempotente: junta os dois históricos antigos pela hora do ID,
  // tira apenas as apresentações locais e nunca apaga as chaves originais.
  const legacy = (await Promise.all(ORBI_LEGACY_HISTORY_KEYS.map((key) => readHistory(key, true))))
    .flat()
    .sort((a, b) => messageTime(a) - messageTime(b))
    .slice(-HISTORY_MAX_MESSAGES);
  return { messages: legacy, migrated: legacy.length > 0 };
}

async function saveOrbiHistory(messages) {
  try {
    await AsyncStorage.setItem(ORBI_HISTORY_KEY, JSON.stringify(messages.slice(-HISTORY_MAX_MESSAGES)));
  } catch {}
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

let nextId = 1;
function makeMessage(from, text) {
  nextId += 1;
  return { id: `${Date.now()}-${nextId}`, from, text };
}

export default function ChatScreen() {
  const { hasAccess, accessConfirmed, coupleData, soloSign } = useCouple();
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [historyReady, setHistoryReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [legacyMigrated, setLegacyMigrated] = useState(false);
  const [profile, setProfile] = useState(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [locked, setLocked] = useState(false);
  const [serverBlock, setServerBlock] = useState(null);
  const [sessionReplies, setSessionReplies] = useState(0);
  const [lastReplyId, setLastReplyId] = useState(null);
  const [focusedControl, setFocusedControl] = useState(null);
  // Conservador até o sistema responder: rolagem nenhuma começa animada por
  // acidente para quem ativou "reduzir movimento".
  const [reducedMotion, setReducedMotion] = useState(true);
  const listRef = useRef(null);
  const sendingRef = useRef(false);
  const { width, height } = useWindowDimensions();
  const compactLayout = width <= 360 || height <= 650;
  const interactionReady = historyReady && profileReady;

  const signName = coupleData?.sa || soloSign?.name || soloSign?.nome || soloSign?.signo || null;
  const signDisplay = signName ? nomeDoSigno(signName, lang) : null;
  const chatContext = useMemo(() => buildOrbiChatContext(profile, signName), [profile, signName]);
  const suggestionSpecs = useMemo(
    () => buildOrbiSuggestionSpecs(profile, signName),
    [profile, signName]
  );

  function suggestionText(spec) {
    const vars = { ...(spec.vars || {}) };
    if (spec.valueKey && spec.valueVar) vars[spec.valueVar] = t(spec.valueKey);
    if (vars.sign && signDisplay) vars.sign = signDisplay;
    return t(spec.textKey, vars);
  }

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setProfileReady(false);
      getOnboardingProfile()
        .then((value) => {
          if (active) setProfile(value);
        })
        .catch(() => {
          if (active) setProfile(null);
        })
        .finally(() => {
          if (active) setProfileReady(true);
        });
      if (!hasAccess && accessConfirmed) hasReachedFreeMessageLimit().then(setLocked);
      return () => { active = false; };
    }, [accessConfirmed, hasAccess])
  );

  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => active && setReducedMotion(!!enabled))
      .catch(() => active && setReducedMotion(false));
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      (enabled) => setReducedMotion(!!enabled)
    );
    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    let active = true;
    loadOrbiHistory().then((result) => {
      if (!active) return;
      setMessages(result.messages);
      setLegacyMigrated(result.migrated);
      setHistoryReady(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (historyReady) saveOrbiHistory(messages);
  }, [historyReady, messages]);

  const handleSend = async (suggestedText) => {
    const text = (typeof suggestedText === 'string' ? suggestedText : input).trim();
    if (!interactionReady || !text || isTyping || sendingRef.current) return;
    sendingRef.current = true;
    try {
      if (!hasAccess) {
        const reached = await hasReachedFreeMessageLimit();
        if (reached) {
          setLocked(true);
          return;
        }
      }
      await doSend(text);
    } finally {
      sendingRef.current = false;
    }
  };

  const doSend = async (text) => {
    const userMessage = makeMessage('user', text);
    // O conteúdo antigo continua legível, mas não vira fala anterior do Órbi
    // nem volta a ser enviado ao provedor. A nova conversa começa no turno
    // atual, com o contexto explicitamente declarado na tela.
    const history = messages
      .filter((item) => !item.migrated)
      .map((item) => ({
        role: item.from === 'user' ? 'user' : 'assistant',
        content: item.text,
      }));
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    recordMissionAction(MISSION_ACTIONS.CHAT_MENSAGEM_ENVIADA);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !reducedMotion }));

    let reply;
    try {
      reply = await fetchAiChatReply(ORBI_PERSONA_ID, text, history, chatContext);
    } catch (err) {
      setMessages((prev) => prev.filter((item) => item.id !== userMessage.id));
      setInput(text);
      setIsTyping(false);
      if (isAiAccessError(err)) {
        setServerBlock(isLoginRequired(err) ? 'login' : 'quota');
        return;
      }
      Alert.alert(t('ai.unavailable.title'), t('ai.unavailable.body'));
      return;
    }

    const replyMessage = makeMessage('persona', reply);
    setMessages((prev) => [...prev, replyMessage]);
    setLastReplyId(replyMessage.id);
    setSessionReplies((count) => count + 1);
    if (!hasAccess) await incrementFreeMessagesSent();

    const today = todayISO();
    AsyncStorage.getItem(ORBI_DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === today) return;
      recordReadingCompletion({
        type: 'chat',
        typeLabel: t('orbi.chat.diaryLabel'),
        title: t('orbi.chat.diaryLabel'),
        body: reply,
      });
      AsyncStorage.setItem(ORBI_DIARY_RECORDED_KEY, today);
    });
    setIsTyping(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: !reducedMotion }));
  };

  const renderItem = ({ item }) => {
    const isUser = item.from === 'user';
    const speaker = isUser
      ? t('orbi.chat.you')
      : item.migrated
        ? t('orbi.chat.legacySpeaker')
        : t('orbi.name');
    return (
      <View style={styles.messageCell}>
        {!isUser && (
          <Text style={styles.responseLabel}>
            {speaker}
          </Text>
        )}
        <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowOrbi]}>
          <View
            style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleOrbi]}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${speaker}: ${item.text}`}
            accessibilityLiveRegion={item.id === lastReplyId ? 'polite' : 'none'}
          >
            <Text style={styles.bubbleText}>{item.text}</Text>
          </View>
        </View>
        {!isUser && (
          <View style={styles.reportRow}>
            <ReportarIA kind="chat" texto={item.text} />
          </View>
        )}
      </View>
    );
  };

  if (serverBlock) {
    return <OneTimeLock featureTitle={t('orbi.chat.lockTitle')} gradient={gradients.hero} variant={serverBlock} />;
  }
  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle={t('orbi.chat.lockTitle')} gradient={gradients.hero} />;
  }

  const listHeader = (
    <View>
      <View style={[styles.orbiHero, compactLayout && styles.orbiHeroCompact]}>
        <View style={styles.heroGlow} />
        <OrbiGuide size={compactLayout ? 74 : 106} pose="curious" testID="orbi-chat-guide" />
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>{t('orbi.chat.kicker')}</Text>
          <Text style={[styles.intro, compactLayout && styles.introCompact]}>{t('orbi.chat.intro')}</Text>
        </View>
      </View>

      <View style={styles.disclosure} testID="orbi-ai-disclosure">
        <Ionicons name="information-circle-outline" size={16} color={colors.gold} />
        <Text style={styles.disclosureText}>{t('orbi.chat.disclosure')}</Text>
      </View>

      {legacyMigrated && (
        <View style={styles.legacyNotice}>
          <Ionicons name="archive-outline" size={15} color={colors.textMuted} />
          <Text style={styles.legacyText}>{t('orbi.chat.legacy')}</Text>
        </View>
      )}

      {interactionReady && messages.length === 0 && (
        <View style={[styles.suggestions, compactLayout && styles.suggestionsCompact]} testID="orbi-suggestions">
          <Text style={styles.suggestionsTitle}>{t('orbi.chat.suggestions')}</Text>
          {suggestionSpecs.map((spec) => {
            const text = suggestionText(spec);
            return (
              <Pressable
                key={spec.id}
                testID={`orbi-suggestion-${spec.id}`}
                style={({ pressed }) => [
                  styles.suggestion,
                  focusedControl === `suggestion-${spec.id}` && styles.keyboardFocus,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSend(text)}
                onFocus={() => setFocusedControl(`suggestion-${spec.id}`)}
                onBlur={() => setFocusedControl(null)}
                accessibilityRole="button"
                accessibilityLabel={text}
              >
                <Text style={styles.suggestionText}>{text}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.gold} />
              </Pressable>
            );
          })}
        </View>
      )}

      {!interactionReady && (
        <View
          style={styles.loadingContext}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
          testID="orbi-context-loading"
        >
          <Text style={styles.loadingContextText}>{t('orbi.chat.loading')}</Text>
        </View>
      )}
    </View>
  );

  const listFooter = isTyping ? (
    <View
      style={styles.typingRow}
      testID="orbi-typing"
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('orbi.chat.typing')}
    >
      <OrbiGuide size={48} pose="thinking" testID="orbi-thinking" />
      <View style={[styles.bubble, styles.bubbleOrbi, styles.typingBubble]}>
        <Text style={styles.typingText}>{t('orbi.chat.typing')}</Text>
      </View>
    </View>
  ) : sessionReplies === 1 ? (
    <View
      style={styles.completion}
      testID="orbi-first-completion"
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={t('orbi.chat.completion')}
    >
      <OrbiGuide size={58} pose="celebrating" testID="orbi-celebrating" />
      <Text style={styles.completionText}>{t('orbi.chat.completion')}</Text>
    </View>
  ) : null;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      accessibilityState={{ busy: isTyping || !interactionReady }}
    >
      <GradientHeader
        title={compactLayout ? t('orbi.name') : t('orbi.chat.title')}
        subtitle={compactLayout ? null : t('orbi.chat.subtitle')}
        gradient={gradients.hero}
      />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={[styles.listContent, compactLayout && styles.listContentCompact]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (messages.length > 0 || isTyping) {
            listRef.current?.scrollToEnd({ animated: !reducedMotion });
          }
        }}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, focusedControl === 'input' && styles.keyboardFocus]}
          value={input}
          onChangeText={setInput}
          placeholder={t('orbi.chat.placeholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
          editable={interactionReady && !isTyping}
          onFocus={() => setFocusedControl('input')}
          onBlur={() => setFocusedControl(null)}
          accessibilityLabel={t('orbi.chat.placeholder')}
          accessibilityState={{ disabled: !interactionReady || isTyping }}
        />
        <Pressable
          onPress={() => handleSend()}
          disabled={!interactionReady || !input.trim() || isTyping}
          style={({ pressed }) => [
            styles.sendButton,
            (!interactionReady || !input.trim() || isTyping) && styles.sendButtonDisabled,
            focusedControl === 'send' && styles.keyboardFocus,
            pressed && interactionReady && input.trim() && !isTyping && styles.sendButtonPressed,
          ]}
          onFocus={() => setFocusedControl('send')}
          onBlur={() => setFocusedControl(null)}
          accessibilityRole="button"
          accessibilityLabel={t('orbi.chat.send')}
          accessibilityState={{ disabled: !interactionReady || !input.trim() || isTyping }}
        >
          <Ionicons name="arrow-up" size={20} color="#21151A" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  listContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 },
  listContentCompact: { paddingTop: 8, paddingHorizontal: 12 },
  orbiHero: {
    minHeight: 132,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold + '32',
    paddingHorizontal: 14,
    paddingVertical: 12,
    overflow: 'hidden',
  },
  orbiHeroCompact: { minHeight: 92, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 20 },
  heroGlow: {
    position: 'absolute',
    width: 148,
    height: 148,
    borderRadius: 74,
    left: -20,
    backgroundColor: colors.gold + '0B',
  },
  heroCopy: { flex: 1, paddingLeft: 4, paddingRight: 6 },
  kicker: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.25, textTransform: 'uppercase' },
  intro: { color: colors.text, fontSize: 15, lineHeight: 22, fontWeight: '600', marginTop: 7 },
  introCompact: { fontSize: 12.5, lineHeight: 17, marginTop: 4 },
  disclosure: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, paddingHorizontal: 4 },
  disclosureText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  legacyNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 12, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, backgroundColor: colors.surface },
  legacyText: { flex: 1, color: colors.textMuted, fontSize: 11, lineHeight: 15 },
  suggestions: { marginTop: 24, marginBottom: 6 },
  suggestionsCompact: { marginTop: 12 },
  suggestionsTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '800', letterSpacing: 0.3, marginBottom: 10 },
  suggestion: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 9, borderRadius: 16, borderCurve: 'continuous', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
  suggestionText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  keyboardFocus: Platform.select({
    web: {
      outlineStyle: 'solid',
      outlineWidth: 3,
      outlineColor: colors.gold,
      outlineOffset: 2,
    },
    default: {},
  }),
  loadingContext: { alignItems: 'center', paddingVertical: 18 },
  loadingContextText: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  messageCell: { marginTop: 12 },
  responseLabel: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginLeft: 5, marginBottom: 5 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowOrbi: { justifyContent: 'flex-start' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '84%', borderRadius: 19, borderCurve: 'continuous', paddingHorizontal: 15, paddingVertical: 11 },
  bubbleOrbi: { backgroundColor: colors.surfaceElevated, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: colors.border },
  bubbleUser: { backgroundColor: colors.accent2, borderBottomRightRadius: 5 },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  reportRow: { alignSelf: 'flex-start', marginTop: 1 },
  typingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12 },
  typingBubble: { paddingVertical: 10 },
  typingText: { color: colors.textSecondary, fontSize: 13, fontStyle: 'italic' },
  completion: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 16, backgroundColor: colors.gold + '0D', borderWidth: 1, borderColor: colors.gold + '2A' },
  completionText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 9, paddingHorizontal: 12, paddingTop: 10, paddingBottom: Platform.OS === 'ios' ? 10 : 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface },
  input: { flex: 1, minHeight: 46, maxHeight: 110, borderRadius: 18, borderCurve: 'continuous', paddingHorizontal: 15, paddingVertical: 11, color: colors.text, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border, fontSize: 14 },
  sendButton: { width: 46, height: 46, borderRadius: 16, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold },
  sendButtonDisabled: { backgroundColor: colors.border },
  sendButtonPressed: { opacity: 0.84, transform: [{ scale: 0.97 }] },
});
