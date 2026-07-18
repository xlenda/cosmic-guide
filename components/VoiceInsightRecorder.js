// components/VoiceInsightRecorder.js
// Gravação de insight por voz + versão lapidada pela IA (inspirado no app de
// leitura Ziggur, ver memória do projeto). Web Speech API transcreve local no
// navegador (Chrome/Edge/Safari — sem custo, sem backend); só o texto já
// transcrito vai pro endpoint /api/enhance-insight, que só organiza a fala,
// nunca inventa conteúdo. Se o navegador não suportar a API (Firefox, por
// exemplo), cai num campo de texto manual — nunca deixa a pessoa sem opção.
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import { attachVoiceInsight } from '../lib/journal';
import { fetchAiEnhancedInsight } from '../lib/aiClient';

function getSpeechRecognitionCtor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const STEP = { IDLE: 'idle', RECORDING: 'recording', REVIEW: 'review', ENHANCING: 'enhancing', DONE: 'done' };

// entryId: id da entrada já salva no Diário Cósmico (lib/journal.js) pra essa
// leitura — o insight é anexado nela, nunca cria uma entrada nova.
export default function VoiceInsightRecorder({ entryId, readingType, readingTitle }) {
  const [step, setStep] = useState(STEP.IDLE);
  const [transcript, setTranscript] = useState('');
  const [enhanced, setEnhanced] = useState(null);
  const [manualText, setManualText] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const speechSupported = !!getSpeechRecognitionCtor();

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
    await attachVoiceInsight(entryId, { voiceTranscript: transcript });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStep(STEP.DONE);
  };

  const enhanceWithAi = async () => {
    setStep(STEP.ENHANCING);
    setError(null);
    try {
      const result = await fetchAiEnhancedInsight(transcript, readingType, readingTitle);
      setEnhanced(result);
      await attachVoiceInsight(entryId, { voiceTranscript: transcript, aiInsight: result });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep(STEP.DONE);
    } catch {
      // Nunca mostra erro cru — mantém o transcript original salvo mesmo se a IA falhar.
      await attachVoiceInsight(entryId, { voiceTranscript: transcript });
      setError('Não consegui lapidar com IA agora, mas seu insight original foi salvo.');
      setStep(STEP.DONE);
    }
  };

  if (step === STEP.DONE) {
    return (
      <View style={styles.card}>
        <Ionicons name="checkmark-circle" size={22} color={colors.green} />
        <Text style={styles.doneTitle}>Insight guardado no seu Diário Cósmico</Text>
        {enhanced && <Text style={styles.enhancedText}>{enhanced}</Text>}
        {!enhanced && <Text style={styles.transcriptText}>{transcript}</Text>}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  if (step === STEP.ENHANCING) {
    return (
      <View style={styles.card}>
        <ActivityIndicator color={colors.teal} />
        <Text style={styles.hint}>Organizando seu insight com IA...</Text>
      </View>
    );
  }

  if (step === STEP.REVIEW) {
    return (
      <View style={styles.card}>
        <Text style={styles.label}>Seu insight</Text>
        <Text style={styles.transcriptText}>{transcript}</Text>
        <View style={styles.rowButtons}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={saveOriginalOnly}>
            <Text style={styles.secondaryBtnText}>Salvar assim</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.85} onPress={enhanceWithAi} style={{ flex: 1, borderRadius: 12, overflow: 'hidden' }}>
            <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
              <Ionicons name="sparkles" size={16} color="#0E0821" />
              <Text style={styles.primaryBtnText}>Lapidar com IA</Text>
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
          <Text style={styles.recordingText}>Gravando insight...</Text>
        </View>
        {!!transcript && <Text style={styles.transcriptText}>{transcript}</Text>}
        <TouchableOpacity activeOpacity={0.85} onPress={stopRecording} style={styles.finishBtn}>
          <Ionicons name="stop-circle" size={18} color={colors.red} />
          <Text style={styles.finishBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // STEP.IDLE
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Quer guardar um insight dessa leitura?</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {speechSupported ? (
        <TouchableOpacity activeOpacity={0.85} onPress={startRecording} style={{ borderRadius: 12, overflow: 'hidden' }}>
          <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            <Ionicons name="mic" size={18} color="#0E0821" />
            <Text style={styles.primaryBtnText}>Gravar meu insight</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <>
          <Text style={styles.hint}>Seu navegador não grava voz aqui — escreva seu insight:</Text>
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
              <Text style={styles.primaryBtnText}>Continuar</Text>
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
