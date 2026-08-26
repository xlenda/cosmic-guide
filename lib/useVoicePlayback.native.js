import { useCallback, useEffect, useRef } from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

let nextFileId = 1;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function useVoicePlayback({ onStarted, onEnded }) {
  const callbacksRef = useRef({ onStarted, onEnded });
  const player = useAudioPlayer(null, { updateInterval: 200 });
  const status = useAudioPlayerStatus(player);
  const fileRef = useRef(null);
  const generationRef = useRef(0);
  const activeGenerationRef = useRef(null);
  const suppressFinishedRef = useRef(true);
  const audioModePromiseRef = useRef(null);
  callbacksRef.current = { onStarted, onEnded };

  const deleteCurrentFile = useCallback(() => {
    const file = fileRef.current;
    fileRef.current = null;
    if (file) {
      try {
        file.delete();
      } catch {}
    }
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;
    activeGenerationRef.current = null;
    suppressFinishedRef.current = true;
    try {
      player.pause();
      player.replace(null);
    } catch {}
    deleteCurrentFile();
  }, [deleteCurrentFile, player]);

  const prime = useCallback(() => {
    // Reprodução somente: desativa gravação e não solicita microfone.
    if (!audioModePromiseRef.current) {
      audioModePromiseRef.current = setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
      })
        .then(() => true)
        .catch(() => {
          audioModePromiseRef.current = null;
          return false;
        });
    }
    return audioModePromiseRef.current;
  }, []);

  const play = useCallback(async ({ bytes }) => {
    stop();
    const generation = generationRef.current;
    if (!await prime()) throw new Error('audio_mode_unavailable');
    if (generation !== generationRef.current) return false;
    const file = new File(Paths.cache, `cosmic-voice-${Date.now()}-${nextFileId++}.mp3`);
    file.create({ intermediates: true, overwrite: true });
    file.write(bytes);
    if (generation !== generationRef.current) {
      try { file.delete(); } catch {}
      return false;
    }
    fileRef.current = file;
    player.replace({ uri: file.uri });

    // replace() inicia o carregamento nativo e não devolve Promise. Esperar o
    // estado real evita chamar play cedo demais em Androids mais lentos.
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (generation !== generationRef.current) return false;
      if (player.isLoaded) {
        player.play();
        // play() é void no Expo Audio. Confirmar o estado nativo evita dizer
        // "Parar" quando o sistema recusou iniciar a reprodução.
        for (let startAttempt = 0; startAttempt < 40; startAttempt += 1) {
          if (generation !== generationRef.current) return false;
          if (player.playing) break;
          await wait(50);
        }
        if (!player.playing) {
          stop();
          throw new Error('audio_start_timeout');
        }
        activeGenerationRef.current = generation;
        callbacksRef.current.onStarted?.();
        // Deixa qualquer evento didJustFinish da fonte anterior ser consumido
        // antes de aceitar o evento de conclusão desta reprodução.
        await wait(0);
        if (generation === generationRef.current) suppressFinishedRef.current = false;
        return true;
      }
      await wait(50);
    }
    stop();
    throw new Error('audio_load_timeout');
  }, [player, prime, stop]);

  useEffect(() => {
    if (
      !status.didJustFinish ||
      suppressFinishedRef.current ||
      activeGenerationRef.current === null
    ) return;
    activeGenerationRef.current = null;
    suppressFinishedRef.current = true;
    generationRef.current += 1;
    try {
      player.replace(null);
    } catch {}
    deleteCurrentFile();
    callbacksRef.current.onEnded?.();
  }, [deleteCurrentFile, player, status.didJustFinish]);

  useEffect(() => () => stop(), [stop]);

  return { prime, play, stop };
}
