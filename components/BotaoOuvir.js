import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLanguage } from '../context/LanguageContext';
import { fetchVoiceStatus, requestVoiceAudio, VoiceClientError } from '../lib/voiceClient';
import { voiceCopy, voicePrivacyCopy } from '../lib/voiceCopy';
import { useVoicePlayback } from '../lib/useVoicePlayback';
import { colors } from '../theme';

let nextInstanceId = 1;
let activeVoice = null;

function claimVoice(id, stop) {
  if (activeVoice && activeVoice.id !== id) activeVoice.stop();
  activeVoice = { id, stop };
}

function releaseVoice(id) {
  if (activeVoice && activeVoice.id === id) activeVoice = null;
}

function errorCode(error) {
  if (error instanceof VoiceClientError) return error.code;
  return 'default';
}

// Um único componente serve todas as telas de leitura. O backend só anuncia a
// função quando há voz neural configurada para o idioma; sem isso, nada é
// renderizado e nenhuma voz robótica do aparelho assume silenciosamente.
export default function BotaoOuvir({ texto, style }) {
  const { lang = 'pt' } = useLanguage() || {};
  const copy = voiceCopy(lang);
  const instanceId = useRef(nextInstanceId++).current;
  const requestRef = useRef(null);
  const aliveRef = useRef(true);
  const [availability, setAvailability] = useState(null);
  const [view, setView] = useState({ phase: 'idle', error: null });
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const privacy = voicePrivacyCopy(lang);

  const onStarted = useCallback(() => {
    if (aliveRef.current) setView({ phase: 'playing', error: null });
  }, []);
  const onEnded = useCallback(() => {
    releaseVoice(instanceId);
    if (aliveRef.current) setView({ phase: 'idle', error: null });
  }, [instanceId]);
  const {
    prime: primePlayback,
    play: playAudio,
    stop: stopPlayback,
  } = useVoicePlayback({ onStarted, onEnded });

  const stopCurrent = useCallback((updateView = true) => {
    if (requestRef.current) {
      requestRef.current.abort();
      requestRef.current = null;
    }
    stopPlayback();
    releaseVoice(instanceId);
    if (updateView && aliveRef.current) setView({ phase: 'idle', error: null });
  }, [instanceId, stopPlayback]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setAvailability(null);
    fetchVoiceStatus({ signal: controller.signal })
      .then((status) => {
        if (!active) return;
        setAvailability(status.available && status.languages.includes(lang) ? status : false);
      })
      .catch(() => {
        if (active) setAvailability(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [lang]);

  useEffect(() => {
    stopCurrent();
  }, [lang, stopCurrent, texto]);

  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      stopCurrent(false);
    };
  }, [stopCurrent]);

  const begin = useCallback(async () => {
    if (view.phase === 'requesting' || view.phase === 'buffering' || view.phase === 'playing') {
      stopCurrent();
      return;
    }

    if (Array.from(String(texto || '')).length > availability.maxCharacters) {
      setView({ phase: 'error', error: 'voice_text_too_long' });
      return;
    }

    claimVoice(instanceId, () => stopCurrent());
    primePlayback();
    const controller = new AbortController();
    requestRef.current = controller;
    setView({ phase: 'requesting', error: null });

    try {
      const audio = await requestVoiceAudio({ text: texto, lang, signal: controller.signal });
      if (controller.signal.aborted || !aliveRef.current) return;
      setView({ phase: 'buffering', error: null });
      await playAudio(audio);
    } catch (error) {
      if (!aliveRef.current || (error instanceof VoiceClientError && error.code === 'cancelled')) return;
      stopPlayback();
      releaseVoice(instanceId);
      setView({ phase: 'error', error: errorCode(error) });
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, [availability, instanceId, lang, playAudio, primePlayback, stopCurrent, stopPlayback, texto, view.phase]);

  if (!texto || !String(texto).trim() || !availability) return null;

  const busy = view.phase === 'requesting' || view.phase === 'buffering';
  const label = busy
    ? copy.cancel
    : view.phase === 'playing'
      ? copy.stop
      : view.phase === 'error'
        ? copy.retry
        : copy.listen;
  const icon = view.phase === 'playing'
    ? 'stop'
    : view.phase === 'error'
      ? 'refresh'
      : 'volume-high';
  const message = view.phase === 'error'
    ? copy.errors[view.error] || copy.errors.default
    : busy
      ? copy.preparing
      : '';

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={copy.hint}
        accessibilityState={{ busy }}
        onPress={begin}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <View style={styles.iconShell}>
          {busy
            ? <ActivityIndicator size="small" color={colors.gold} />
            : <Ionicons name={icon} size={17} color={colors.gold} />}
        </View>
        <Text style={styles.label}>{label}</Text>
      </Pressable>
      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.message, view.phase === 'error' && styles.error]}
        >
          {message}
        </Text>
      ) : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.privacyLabel}
        accessibilityState={{ expanded: privacyOpen }}
        onPress={() => setPrivacyOpen((open) => !open)}
        style={styles.privacyButton}
      >
        <Ionicons name="information-circle-outline" size={13} color={colors.textMuted} />
        <Text style={styles.privacyLabel}>{copy.privacyLabel}</Text>
      </Pressable>
      {privacyOpen ? (
        <Text accessibilityLiveRegion="polite" style={styles.privacyText}>
          {privacy.data}{'\n'}{privacy.process}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', maxWidth: 320 },
  button: {
    minHeight: 42,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(227, 184, 95, 0.42)',
    backgroundColor: 'rgba(227, 184, 95, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  pressed: { opacity: 0.72 },
  iconShell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(227, 184, 95, 0.11)',
  },
  label: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: 0.15 },
  message: {
    marginTop: 7,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  error: { color: colors.red },
  privacyButton: {
    marginTop: 8,
    minHeight: 28,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  privacyLabel: { color: colors.textMuted, fontSize: 11, textDecorationLine: 'underline' },
  privacyText: {
    marginTop: 2,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
});
