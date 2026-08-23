import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import ReportarIA from '../components/ReportarIA';
import { PERSONAS, ACTIVE_PERSONA_ID } from '../lib/chatPersonas';
import { CENAS } from '../lib/ilustracoes';
import { fetchAiChatReply, isAiAccessError, isLoginRequired } from '../lib/aiClient';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { recordMissionAction, MISSION_ACTIONS } from '../lib/missions';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { hasReachedFreeMessageLimit, incrementFreeMessagesSent, FREE_MESSAGE_LIMIT } from '../lib/chatFreeMessages';
import { Alert } from '../lib/webAlert';

const DIARY_RECORDED_KEY = 'cosmic-chat-diary-date';
// Histórico do Chat ANTES vivia só em useState — sair da tela (ou dar reload
// na web) apagava a conversa inteira e a pessoa via só a intro de novo, tendo
// que recomeçar do zero. Persistir por persona (mesmo padrão de MAX_ENTRIES
// do lib/journal.js) resolve sem misturar Luna com Arcano (achado real de
// auditoria de retenção, 25/07/2026).
const HISTORY_MAX_MESSAGES = 60; // nunca cresce sem limite

function historyKey(personaId) {
  return `cosmic-chat-history-${personaId}`;
}

// Retorna o histórico salvo da persona se existir e tiver ao menos 1
// mensagem; caso contrário null (fallback pro comportamento de hoje: só intro).
async function loadPersonaHistory(personaId) {
  try {
    const raw = await AsyncStorage.getItem(historyKey(personaId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

async function savePersonaHistory(personaId, msgs) {
  try {
    await AsyncStorage.setItem(historyKey(personaId), JSON.stringify(msgs.slice(-HISTORY_MAX_MESSAGES)));
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
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  const { t } = useLanguage();
  const [personaId, setPersonaId] = useState(ACTIVE_PERSONA_ID);
  const persona = PERSONAS[personaId];
  const [messages, setMessages] = useState([makeMessage('persona', persona.introMessage)]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [locked, setLocked] = useState(false);
  // Bloqueio vindo do SERVIDOR (402 cota esgotada / 401 exige conta), separado
  // do `locked` local. `locked` é a contagem no aparelho
  // (lib/chatFreeMessages.js), que o servidor não vê e que um
  // localStorage.clear() zerava — este aqui é a palavra final de quem cobra, e
  // por isso vale mesmo com hasAccess=true (que pode vir do fallback por
  // aparelho, com um correlationCode velho no AsyncStorage).
  const [serverBlock, setServerBlock] = useState(null);
  const listRef = useRef(null);
  // Trava SÍNCRONA de envio em andamento — `isTyping` (state) só atualiza no
  // próximo render, então dois cliques rápidos no Enviar passavam juntos pelo
  // guard `if (isTyping)` antes de qualquer setState, e a checagem async do
  // limite grátis (hasReachedFreeMessageLimit) via a MESMA contagem antiga
  // pros dois — furava o limite de 2 mensagens (race check-then-act, achado
  // real de auditoria adversarial, 26/07/2026). Ref muda na hora, sem esperar
  // render nenhum.
  const sendingRef = useRef(false);
  // Guarda a persona ativa "de verdade" pra evitar que uma restauração de
  // histórico assíncrona (loadPersonaHistory) sobrescreva a conversa se a
  // pessoa trocar de persona de novo antes da leitura do AsyncStorage terminar.
  const activePersonaRef = useRef(personaId);
  useEffect(() => {
    activePersonaRef.current = personaId;
  }, [personaId]);

  // useFocusEffect (não useEffect simples) — a tab bar do app não desmonta
  // telas ao trocar de aba (unmountOnBlur padrão é false), então ChatScreen
  // nunca remonta só por sair e voltar pro Chat. Com useEffect puro, `locked`
  // só era calculado 1x na montagem inicial: mandar 1 mensagem, trocar de aba
  // e voltar deixava continuar conversando à vontade na mesma sessão, sem
  // nunca ver o bloqueio (só bloqueava reabrindo o app do zero) — achado real
  // de auditoria, 25/07/2026. useFocusEffect recheca hasReachedFreeMessageLimit
  // toda vez que a aba Chat ganha foco de novo, cobrindo esse caminho.
  useFocusEffect(
    useCallback(() => {
      // accessConfirmed=false = a checagem de assinatura falhou por rede, não
      // confirmou nada de verdade — nunca marcar a prévia grátis como usada
      // nesse caso (achado real de auditoria, 25/07/2026).
      if (hasAccess || !accessConfirmed) return;
      hasReachedFreeMessageLimit().then(setLocked);
    }, [hasAccess, accessConfirmed])
  );

  // No mount, tenta restaurar o histórico já salvo da persona inicial em vez
  // de deixar só a intro (que é o valor inicial de `messages` acima, usado
  // como fallback honesto enquanto o AsyncStorage ainda não respondeu).
  useEffect(() => {
    let cancelled = false;
    loadPersonaHistory(personaId).then((saved) => {
      if (!cancelled && saved) setMessages(saved);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toda mudança em `messages` persiste na chave da persona ATUAL (capado nas
  // últimas HISTORY_MAX_MESSAGES) — cobre tanto mensagens novas quanto a troca
  // de persona abaixo.
  useEffect(() => {
    savePersonaHistory(personaId, messages);
  }, [messages, personaId]);

  // Trocar de persona reinicia a conversa com a intro da nova persona — evita
  // misturar histórico de Luna com Arcano na mesma janela de chat/contexto da
  // IA. Mas se já existir histórico salvo daquela persona (de uma troca
  // anterior), restaura ele em vez de sempre voltar só pra intro.
  const handleSwitchPersona = (nextPersonaId) => {
    if (nextPersonaId === personaId || isTyping) return;
    setPersonaId(nextPersonaId);
    setMessages([makeMessage('persona', PERSONAS[nextPersonaId].introMessage)]);
    loadPersonaHistory(nextPersonaId).then((saved) => {
      if (saved && activePersonaRef.current === nextPersonaId) {
        setMessages(saved);
      }
    });
  };

  const handleSend = async () => {
    const text = input.trim();
    // sendingRef primeiro (síncrono, ver declaração) — isTyping sozinho não
    // segura dois cliques no mesmo frame de render.
    if (!text || isTyping || sendingRef.current) return;
    sendingRef.current = true;
    try {
      // Checa ANTES de mandar, usando a contagem atual (não incrementada ainda)
      // — assim as mensagens dentro do limite (FREE_MESSAGE_LIMIT) sempre são
      // enviadas e respondidas por completo; só a tentativa SEGUINTE (a que já
      // estouraria o limite) é bloqueada antes mesmo de sair do campo de texto,
      // trocando a tela inteira pro OneTimeLock. Mesmo espírito do guard em
      // TarotScreen.drawCards — nunca deixa o bloqueio interromper uma resposta
      // que a pessoa já ganhou o direito de ver.
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
    const history = messages.map((m) => ({
      role: m.from === 'user' ? 'user' : 'assistant',
      content: m.text,
    }));
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    // Missão diária 'conversa-mistica' (lib/missions.js) — marca a ação do
    // dia; o crédito de tokens só acontece via completeMission, com evidência.
    recordMissionAction(MISSION_ACTIONS.CHAT_MENSAGEM_ENVIADA);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));

    // Uma falha técnica nunca pode virar uma resposta local apresentada como
    // se tivesse lido a mensagem. O texto volta ao campo e a pessoa pode tentar
    // de novo sem gastar sua prévia.
    let reply;
    try {
      reply = await fetchAiChatReply(persona.id, text, history);
    } catch (err) {
      // PAYWALL DE VERDADE (30/07/2026): a cota grátis do chat passou a ser
      // contada no SERVIDOR, por CONTA. Um 402/401 com `code` conhecido não é
      // falha técnica — responder com o mock aqui daria de graça exatamente a
      // mensagem que acabou de ser negada. Devolvemos o texto pro campo (a
      // pessoa não perde o que escreveu), tiramos a bolha que já tinha
      // entrado na lista e trocamos a tela pelo muro.
      if (isAiAccessError(err)) {
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        setInput(text);
        setIsTyping(false);
        setServerBlock(isLoginRequired(err) ? 'login' : 'quota');
        return;
      }
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
      setInput(text);
      setIsTyping(false);
      Alert.alert(t('ai.unavailable.title'), t('ai.unavailable.body'));
      return;
    }

    setMessages((prev) => [...prev, makeMessage('persona', reply)]);
    if (!hasAccess) await incrementFreeMessagesSent();
    // Vira entrada no Diário Cósmico 1x por dia (não por mensagem, senão o
    // Diário enche de dezenas de entradas numa conversa só) — antes o Chat não
    // deixava rastro nenhum (achado real de auditoria de retenção, 25/07/2026).
    const today = todayISO();
    AsyncStorage.getItem(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === today) return;
      recordReadingCompletion({
        type: 'chat',
        typeLabel: `Conversa com ${persona.name}`,
        title: `Conversa com ${persona.name}`,
        body: reply,
      });
      AsyncStorage.setItem(DIARY_RECORDED_KEY, today);
    });
    setIsTyping(false);
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  };

  const renderItem = ({ item }) => {
    const isUser = item.from === 'user';
    // Denúncia embaixo de TODA resposta da persona. Antes só a última tinha a
    // bandeirinha: bastava mandar mais uma mensagem pra resposta ofensiva ficar
    // sem canal de denúncia — e, como a denúncia agora carrega o texto
    // (components/ReportarIA.js), cada bolha denuncia a si mesma. A única que
    // fica de fora é a intro da persona, que é texto local de
    // lib/chatPersonas.js e não saída de IA.
    //
    // O critério é o TEXTO, não o índice: o histórico salvo é cortado nas
    // últimas HISTORY_MAX_MESSAGES (60), então passando disso a intro sai pela
    // frente da lista e o item 0 vira uma resposta real da IA — que com
    // `index > 0` perdia o canal de denúncia pra sempre, em todo reload.
    const mostrarDenuncia = !isUser && item.text !== persona.introMessage;
    return (
      <View>
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
        {/* A célula da FlatList ocupa a largura toda e o link vem com
            alignSelf 'center' (as outras seis telas que usam ReportarIA são
            painéis full-width, onde centralizado é o certo). Sem esta caixa
            ele aparecia CENTRALIZADO embaixo de uma bolha alinhada à
            esquerda; encolhida ao conteúdo e ancorada em flex-start, o link
            nasce junto da bolha que ele denuncia. */}
        {mostrarDenuncia && (
          <View style={styles.reportRow}>
            <ReportarIA kind="chat" texto={item.text} />
          </View>
        )}
      </View>
    );
  };

  if (serverBlock) {
    return <OneTimeLock featureTitle="Chat Espiritual" gradient={gradients.hero} variant={serverBlock} />;
  }

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
        // Cena ilustrada do pack (lib/ilustracoes.js) — guia místico como
        // boas-vindas visual, só enquanto a conversa está "vazia" (a lista tem
        // apenas a intro da persona, nenhuma mensagem trocada). Vive no header
        // da FlatList (abaixo do seletor de persona e do disclaimer) e some no
        // primeiro envio. Decorativa (accessible=false); a input row é ancorada
        // pelo flex, então a cena não empurra o campo de digitar pra fora.
        ListHeaderComponent={
          messages.length <= 1 ? (
            <View style={styles.cenaWrap}>
              <Image source={CENAS.guia} style={styles.cenaImg} resizeMode="cover" accessible={false} />
            </View>
          ) : null
        }
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
  cenaWrap: { borderRadius: 18, overflow: 'hidden' },
  cenaImg: { width: '100%', height: 150 },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowPersona: { justifyContent: 'flex-start' },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubblePersona: { borderBottomLeftRadius: 4 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  reportRow: { alignSelf: 'flex-start' },
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
