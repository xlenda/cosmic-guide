// components/VoiceInsightRecorder.js
// Gravação de insight por voz + versão lapidada pela IA (inspirado no app de
// leitura Ziggur, ver memória do projeto). Web Speech API transcreve local no
// navegador (Chrome/Edge/Safari — sem custo, sem backend); só o texto já
// transcrito vai pro endpoint /api/enhance-insight, que só organiza a fala,
// nunca inventa conteúdo. Se o navegador não suportar a API (Firefox, por
// exemplo), cai num campo de texto manual — nunca deixa a pessoa sem opção.
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import { attachVoiceInsight } from '../lib/journal';
import { fetchAiEnhancedInsight, isAiAccessError, isLoginRequired } from '../lib/aiClient';
import { useLanguage } from '../context/LanguageContext';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const STEP = { IDLE: 'idle', RECORDING: 'recording', REVIEW: 'review', ENHANCING: 'enhancing', DONE: 'done' };

// entryId: id da entrada já salva no Diário Cósmico (lib/journal.js) pra essa
// leitura — o insight é anexado nela, nunca cria uma entrada nova.
export default function VoiceInsightRecorder({ entryId, readingType, readingTitle }) {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const [step, setStep] = useState(STEP.IDLE);
  const [transcript, setTranscript] = useState('');
  const [enhanced, setEnhanced] = useState(null);
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState(null);
  // Evita a corrida achada em auditoria (18/07/2026): "Salvar assim" não
  // trocava de step antes do await, então "Lapidar com IA" ficava clicável
  // ao mesmo tempo — as duas chamadas concorrentes ao mesmo
  // attachVoiceInsight (read-modify-write sem lock) podiam apagar uma à
  // outra silenciosamente. `busy` desabilita os dois botões assim que
  // qualquer um dos dois é acionado.
  const [busy, setBusy] = useState(false);
  const recognitionRef = useRef(null);

  const speechSupported = !!getSpeechRecognitionCtor();

  // Sem isso (achado real de auditoria, 18/07/2026), trocar de tema ou tirar
  // nova leitura enquanto step ainda é RECORDING desmontava o componente sem
  // nunca chamar stop() — o microfone continuava ouvindo em segundo plano,
  // sem nenhuma indicação visual, até expirar sozinho. Zera os handlers antes
  // de parar pra nenhum callback tardio (onend/onresult) tocar state depois
  // do componente já ter desmontado.
  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.stop();
      }
    };
  }, []);

  const startRecording = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const recognition = new Ctor();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    let finalText = '';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += chunk + ' ';
        else interim += chunk;
      }
      setTranscript((finalText + interim).trim());
    };
    recognition.onerror = () => setError('Não consegui ouvir direito — tenta de novo ou escreve seu insight.');
    recognition.onend = () => setStep((s) => (s === STEP.RECORDING ? STEP.REVIEW : s));
    recognitionRef.current = recognition;
    setTranscript('');
    setError(null);
    setStep(STEP.RECORDING);
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setStep(STEP.REVIEW);
  };

  const useManualText = () => {
    if (!manualText.trim()) return;
    setTranscript(manualText.trim());
    setStep(STEP.REVIEW);
  };

  const saveOriginalOnly = async () => {
    if (busy) return;
    setBusy(true);
    await attachVoiceInsight(entryId, { voiceTranscript: transcript });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep(STEP.DONE);
  };

  const enhanceWithAi = async () => {
    if (busy) return;
    setBusy(true);
    setStep(STEP.ENHANCING);
    setError(null);
    try {
      const result = await fetchAiEnhancedInsight(transcript, readingType, readingTitle);
      setEnhanced(result);
      await attachVoiceInsight(entryId, { voiceTranscript: transcript, aiInsight: result });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(STEP.DONE);
    } catch (err) {
      // O insight ORIGINAL (o que a pessoa falou) é dela e é salvo dos dois
      // jeitos — isso não muda. O que muda (30/07/2026) é a explicação: um
      // 402/401 com `code` conhecido é o paywall do servidor, não "a IA
      // falhou". Dizer "não consegui agora" quando na verdade a cota grátis
      // acabou é mentir pra quem paga a conta e pra quem poderia assinar.
      await attachVoiceInsight(entryId, { voiceTranscript: transcript });
      if (isAiAccessError(err)) {
        setError(
          isLoginRequired(err)
            ? 'Seu insight foi salvo. Crie sua conta (é grátis) para lapidar com IA.'
            : 'Seu insight foi salvo. Suas lapidações gratuitas com IA acabaram — assine para continuar.'
        );
      } else {
        setError('Não consegui lapidar com IA agora, mas seu insight original foi salvo.');
      }
      setStep(STEP.DONE);
    }
  };

  if (step === STEP.DONE) {
    return (
      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={22} color={colors.green} />
        <Text style={styles.doneTitle}>{t('voice.saved')}</Text>
        {enhanced && <Text style={styles.enhancedText}>{enhanced}</Text>}
        {!enhanced && <Text style={styles.transcriptText}>{transcript}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
        {/* "Guardado no Diário" sem o caminho pro Diário era um beco: o
            testador salvou insights e ficou procurando onde tinham ido parar
            ("preciso descobrir aonde estão os insights salvos", 29/07/2026).
            Mesmo padrão navigateFromTab do OneTimeLock — este componente vive
            dentro das telas de leitura (TarotStack etc.) e o Diário mora no
            HomeStack, então o navigate precisa borbulhar pro tab navigator. */}
        <TouchableOpacity
          style={styles.diaryLink}
          activeOpacity={0.7}
          onPress={() => (navigation.getParent() || navigation).navigate(ROUTES.HOME_TAB, { screen: ROUTES.DIARY })}
        >
          <Text style={styles.diaryLinkText}>{t('voice.seeInDiary')}</Text>
          <Ionicons name="arrow-forward" size={14} color={colors.accent} />
        </TouchableOpacity>
      </View>
    );
  }

  if (step === STEP.ENHANCING) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.teal} />
        <Text style={styles.hint}>{t('voice.polishing')}</Text>
      </View>
    );
  }

  if (step === STEP.REVIEW) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>{t('voice.yourInsight')}</Text>
        <Text style={styles.transcriptText}>{transcript}</Text>
        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={saveOriginalOnly} disabled={busy}>
            <Text style={styles.secondaryBtnText}>{t('voice.saveAsIs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} onPress={enhanceWithAi} disabled={busy} style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
            <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Ionicons name="sparkles" size={16} color="#0E0821" />
              <Text style={styles.primaryBtnText}>{t('voice.polish')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (step === STEP.RECORDING) {
    return (
      <View style={styles.card}>
        <View style={styles.recordingRow}>
          <View style={styles.recDot} />
          <Text style={styles.recordingText}>{t('voice.recording')}</Text>
        </View>
        {!!transcript && <Text style={styles.transcriptText}>{transcript}</Text>}
        <TouchableOpacity activeOpacity={0.85} onPress={stopRecording} style={styles.finishBtn}>
          <Ionicons name="stop-circle" size={18} color={colors.red} />
          <Text style={styles.finishBtnText}>{t('voice.finish')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STEP.IDLE
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{t('voice.ask')}</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {speechSupported ? (
        <TouchableOpacity activeOpacity={0.85} onPress={startRecording} style={{ borderRadius: 12, overflow: 'hidden' }}>
          <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            <Ionicons name="mic" size={18} color="#0E0821" />
            <Text style={styles.primaryBtnText}>{t('voice.record')}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.hint}>{t('voice.noMic')}</Text>
          <TextInput
            value={manualText}
            onChangeText={setManualText}
            placeholder="O que essa leitura despertou em você?"
            placeholderTextColor={colors.textMuted}
            style={styles.textInput}
            multiline
          />
          <TouchableOpacity activeOpacity={0.85} onPress={useManualText} style={{ borderRadius: 12, overflow: 'hidden', marginTop: 8 }}>
            <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>{t('voice.continue')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginTop: 16, borderWidth: 1, borderColor: colors.border, gap: 10 },
  label: { color: colors.text, fontSize: 14, fontWeight: '700' },
  hint: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  errorText: { color: colors.amber, fontSize: 12, lineHeight: 17 },
  diaryLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10, alignSelf: 'flex-start' },
  diaryLinkText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  transcriptText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  enhancedText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  doneTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  primaryBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, gap: 6 },
  primaryBtnText: { color: '#0E0821', fontWeight: '800', fontSize: 13 },
  secondaryBtn: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  secondaryBtnText: { color: colors.textSecondary, fontWeight: '700', fontSize: 13 },
  rowButtons: { flexDirection: 'row', gap: 10 },
  recordingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  recDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.red },
  recordingText: { color: colors.text, fontWeight: '700', fontSize: 13 },
  finishBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: colors.red, borderRadius: 12, paddingVertical: 10 },
  finishBtnText: { color: colors.red, fontWeight: '700', fontSize: 13 },
  textInput: { backgroundColor: colors.card, borderRadius: 12, padding: 12, color: colors.text, fontSize: 14, minHeight: 70, textAlignVertical: 'top', borderWidth: 1, borderColor: colors.border },
});
