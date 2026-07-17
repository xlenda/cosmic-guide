import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import { PERSONAS, ACTIVE_PERSONA_ID } from '../lib/chatPersonas';
import { getMockReply } from '../lib/chatResponses';
import { fetchAiChatReply } from '../lib/aiClient';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';

const FEATURE_KEY = 'chat';

let nextId = 1;
function makeMessage(from, text) {
  nextId += 1;
  return { id: `${Date.now()}-${nextId}`, from, text };
}

export default function ChatScreen() {
  const { hasAccess } = useCouple();
  const [personaId, setPersonaId] = useState(ACTIVE_PERSONA_ID);
  const persona = PERSONAS[personaId];
  const [messages, setMessages] = useState([makeMessage('persona', persona.introMessage)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [locked, setLocked] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess]);

  // Trocar de persona reinicia a conversa com a intro da nova persona — evita
  // misturar histórico de Luna com Arcano na mesma janela de chat/contexto da IA.
  const handleSwitchPersona = (nextPersonaId) => {
    if (nextPersonaId === personaId || isTyping) return;
    setPersonaId(nextPersonaId);
    setMessages([makeMessage('persona', PERSONAS[nextPersonaId].introMessage)]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMessage = makeMessage('user', text);
    const history = messages.map((m) => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    // Tenta a IA real (proxy no backend); se o servidor ainda não tiver a
    // chave configurada (ou a rede falhar), cai pro mock local honesto.
    let reply;
    try {
      reply = await fetchAiChatReply(persona.id, text, history);
    } catch {
      reply = getMockReply(persona.id, text);
    }

    setMessages((prev) => [...prev, makeMessage('persona', reply)]);
    markFeatureUsedOnce(FEATURE_KEY);
    setIsTyping(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const renderItem = ({ item }) => {
    const isUser = item.from === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowPersona]}>
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: colors.accent }]
              : [styles.bubblePersona, { backgroundColor: persona.bubbleColor }],
          ]}
        >
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Chat Espiritual" gradient={gradients.hero} />;
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title={persona.name} subtitle={persona.tagline} gradient={persona.gradient} />

      <View style={styles.personaSwitchRow}>
        {Object.values(PERSONAS).map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.personaPill, p.id === personaId && { backgroundColor: p.bubbleColor }]}
            activeOpacity={0.85}
            onPress={() => handleSwitchPersona(p.id)}
          >
            <Ionicons
              name={p.icon}
              size={15}
              color={p.id === personaId ? '#fff' : colors.textMuted}
            />
            <Text style={[styles.personaPillText, p.id === personaId && styles.personaPillTextActive]}>
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.disclaimer}>
        {persona.name} une IA e tradições simbólicas de séculos (astrologia, tarot) para
        reflexão — as respostas não preveem eventos específicos nem substituem orientação profissional.
      </Text>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          isTyping ? (
            <View style={[styles.bubbleRow, styles.bubbleRowPersona]}>
              <View style={[styles.bubble, styles.bubblePersona, { backgroundColor: persona.bubbleColor }]}>
                <Text style={styles.bubbleTextTyping}>{persona.name} está digitando…</Text>
              </View>
            </View>
          ) : null
        }
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Escreva sua mensagem…"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSend}
          disabled={!input.trim() || isTyping}
          style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          accessibilityState={{ disabled: !input.trim() || isTyping }}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  personaSwitchRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    justifyContent: 'center',
  },
  personaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personaPillText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  personaPillTextActive: { color: '#fff' },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 4,
  },
  listContent: { padding: 16, paddingBottom: 8, gap: 10 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowPersona: { justifyContent: 'flex-start' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubblePersona: { borderBottomLeftRadius: 4 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  bubbleTextTyping: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.border },
});
