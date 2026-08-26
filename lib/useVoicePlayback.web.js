import { useCallback, useEffect, useRef } from 'react';

function audioContextClass() {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

/** Player web separado por extensão: o Metro não leva expo-audio/FileSystem
 * para o bundle web, e o clique desbloqueia o AudioContext antes do fetch. */
export function useVoicePlayback({ onStarted, onEnded }) {
  const callbacksRef = useRef({ onStarted, onEnded });
  const contextRef = useRef(null);
  const sourceRef = useRef(null);
  const generationRef = useRef(0);
  callbacksRef.current = { onStarted, onEnded };

  const prime = useCallback(() => {
    const AudioContext = audioContextClass();
    if (!AudioContext) return false;
    if (!contextRef.current || contextRef.current.state === 'closed') {
      contextRef.current = new AudioContext();
    }
    const context = contextRef.current;
    context.resume().catch(() => {});

    // Um frame silencioso, iniciado dentro do gesto, libera a sessão de áudio
    // no Safari/iOS. A fala só começa depois que o MP3 real chegar.
    try {
      const silent = context.createBufferSource();
      silent.buffer = context.createBuffer(1, 1, context.sampleRate || 44_100);
      silent.connect(context.destination);
      silent.start(0);
    } catch {}
    return true;
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;
    const source = sourceRef.current;
    sourceRef.current = null;
    if (source) {
      source.onended = null;
      try {
        source.stop(0);
      } catch {}
      try {
        source.disconnect();
      } catch {}
    }
  }, []);

  const play = useCallback(async ({ bytes }) => {
    stop();
    const generation = generationRef.current;
    const context = contextRef.current;
    if (!context || context.state === 'closed') throw new Error('audio_context_unavailable');
    await context.resume();
    const raw = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    const decoded = await context.decodeAudioData(raw);
    if (generation !== generationRef.current) return false;

    const source = context.createBufferSource();
    source.buffer = decoded;
    source.connect(context.destination);
    source.onended = () => {
      if (generation !== generationRef.current) return;
      sourceRef.current = null;
      callbacksRef.current.onEnded?.();
    };
    sourceRef.current = source;
    source.start(0);
    callbacksRef.current.onStarted?.();
    return true;
  }, [stop]);

  useEffect(() => () => {
    stop();
    const context = contextRef.current;
    contextRef.current = null;
    if (context && context.state !== 'closed') context.close().catch(() => {});
  }, [stop]);

  return { prime, play, stop };
}
