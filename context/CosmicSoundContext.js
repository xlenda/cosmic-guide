// context/CosmicSoundContext.js
// O "Som do céu" vivo — uma instância só do motor (lib/cosmicSound.js) pro app
// inteiro, montada acima dos navegadores em App.js.
//
// POR QUE UM CONTEXTO E NÃO ESTADO DENTRO DO COMPONENTE:
// o som precisa continuar tocando quando a pessoa troca de aba. Se o motor
// morasse dentro de <CosmicSoundPlayer>, bastaria a tela que o hospeda
// desmontar (trocar de aba desmonta a tela em stack navigator) pro áudio ser
// cortado no meio — que é literalmente o oposto do que esta feature existe pra
// fazer. Aqui o motor vive num nó que nunca desmonta, e o componente vira só
// um controle remoto: dá pra ter dois na tela (o dock flutuante e o card da
// Home) mostrando e comandando exatamente o mesmo som.
//
// ================== HONESTIDADE (régua de lib/cosmicSound.js) ================
// Nenhum texto daqui promete efeito. O que este arquivo faz de "retenção" é
// UMA coisa: depois de MIN_ESCUTA_SEGUNDOS de som realmente tocando, o dia
// entra na sequência pelo caminho que já existe (lib/streak.js
// recordActiveDay), igual a ler o Pensamento do dia. Nenhum contador novo.
// ============================================================================
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import {
  createCosmicSound,
  audioDisponivel,
  getSkyTuning,
  PRESETS,
  presetPorId,
  carregarVolume,
  carregarPreset,
  salvarPreset,
} from '../lib/cosmicSound';
import {
  MIN_ESCUTA_SEGUNDOS,
  SEM_TIMER,
  FADE_PASSO_MS,
  criarContadorEscuta,
  planoDeFade,
  calcularRestante,
  metadadosDeMidia,
  wavSilenciosoDataUri,
} from '../lib/cosmicSoundSession';
import { recordActiveDay } from '../lib/streak';
import { useLanguage } from './LanguageContext';

const CosmicSoundContext = createContext(null);

export function useCosmicSound() {
  return useContext(CosmicSoundContext);
}

function espera(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Arte da tela de bloqueio: o ícone que o PWA já publica (public/manifest.json
// aponta pro mesmo arquivo). Se o caminho não existir — servidor de
// desenvolvimento sem o baseUrl /cosmic-guide, por exemplo — o navegador
// simplesmente não mostra capa; nada quebra.
function urlDaArte() {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.location) return null;
  try {
    return `${window.location.origin}/cosmic-guide/icon.png`;
  } catch {
    return null;
  }
}

function temSessaoDeMidia() {
  return (
    Platform.OS === 'web' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaSession &&
    typeof navigator.mediaSession.setActionHandler === 'function'
  );
}

export function CosmicSoundProvider({ children }) {
  // Defensivo: se um dia alguém montar este provider fora do LanguageProvider,
  // o som continua funcionando e só a tela de bloqueio perde os rótulos — em
  // vez de o app inteiro cair no ErrorBoundary por causa de música ambiente.
  const idioma = useLanguage();
  const t = idioma && idioma.t ? idioma.t : (chave) => chave;

  // Web Audio não existe no runtime nativo do RN — audioDisponivel() devolve
  // false lá e a feature inteira some da tela (o componente devolve null), em
  // vez de oferecer um botão que não faz nada.
  const [suportado] = useState(() => audioDisponivel());

  const [tocando, setTocando] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  // A afinação PARADA existe só pra tela poder explicar o som ANTES de a
  // pessoa tocar. Enquanto toca, vale a afinação que o motor montou de fato —
  // o grafo não muda de timbre no meio da sessão, então dizer outra coisa
  // seria mentira.
  //
  // COMEÇA NULA DE PROPÓSITO: getSkyTuning() roda a efeméride
  // (astronomy-engine) e este provider fica ACIMA de todas as telas. Calcular
  // no inicializador do useState punha esse custo no PRIMEIRO RENDER de todo
  // mundo — inclusive de quem nunca vai ligar o som e de quem abriu direto num
  // link pra uma tela que não usa astrologia nenhuma. O efeito logo abaixo
  // calcula depois da primeira pintura; até lá a tela só não mostra a linha do
  // porquê, e nada mais muda.
  const [afinacao, setAfinacao] = useState(null);
  const [timerMinutos, setTimerMinutos] = useState(SEM_TIMER);
  const [restanteS, setRestanteS] = useState(null);
  const [escutaS, setEscutaS] = useState(0);
  const [contouSequencia, setContouSequencia] = useState(false);
  // 'sem-suporte' | 'gesto-necessario' | 'falha-audio' | 'segundo-plano'
  const [aviso, setAviso] = useState(null);
  // Quantos controles EMBUTIDOS (o card da Home) estão montados agora. Serve
  // pra o dock flutuante não duplicar o mesmo controle na mesma tela.
  const [inlinesVisiveis, setInlinesVisiveis] = useState(0);

  const motorRef = useRef(null);
  const ancoraRef = useRef(null);
  const contadorRef = useRef(null);
  const tocandoRef = useRef(false);
  const volumeRef = useRef(0.45);
  const timerRef = useRef(SEM_TIMER);
  const fimTimerRef = useRef(null);
  const ultimoTiqueRef = useRef(0);
  // Últimos valores JÁ publicados no estado — o tique é de 1 s, a tela não
  // precisa de 1 s (ver os comentários no tique).
  const ultimaEscutaPublicadaRef = useRef(0);
  const ultimoMinutoPublicadoRef = useRef(-1);
  const fechandoRef = useRef(false);
  const sessaoAtivaRef = useRef(false);
  // Nº do pedido de "tocar" em voo. Todo pararTudo() incrementa, invalidando
  // qualquer start que ainda esteja esperando o navegador liberar o áudio —
  // sem isso, quem apertasse pausar durante a liberação via o botão voltar
  // sozinho pra "tocando" quando o start antigo finalmente resolvesse.
  const pedidoRef = useRef(0);
  // Os controles da tela de bloqueio são registrados uma vez e vivem fora do
  // ciclo de render — por isso chamam as ações por ref, e não pela closure da
  // render em que foram criados (que ficaria velha na primeira troca de
  // preset e pausaria um som que já não é o que está tocando).
  const pausarRef = useRef(null);
  const tocarRef = useRef(null);

  // "A sessão de mídia está de fato segurando o áudio?" — só é verdade se a
  // API existe E a âncora silenciosa está tocando. Com API mas sem âncora (o
  // navegador recusou o play do elemento), o som seria cortado ao minimizar de
  // qualquer jeito e, pior, ficaria tocando sem controle nenhum visível.
  const sessaoDeMidiaSegurando = useCallback(() => {
    if (!sessaoAtivaRef.current) return false;
    const a = ancoraRef.current;
    return !!(a && a.paused === false);
  }, []);

  if (!contadorRef.current) contadorRef.current = criarContadorEscuta();

  // Preferências salvas (volume e ambiente). Carregar NÃO toca nada: som nunca
  // começa sozinho, em nenhuma hipótese — ver o comentário do autoplay em
  // lib/cosmicSound.js start().
  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const [v, p] = await Promise.all([carregarVolume(), carregarPreset()]);
        if (!vivo) return;
        setVolume(v);
        volumeRef.current = v;
        setPresetId(p);
      } catch {}
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // O céu de hoje, calculado DEPOIS da primeira pintura (ver o comentário do
  // useState de `afinacao`). Um efeito é passivo: não atrasa o primeiro
  // desenho de ninguém, e quem nunca liga o som paga no máximo uma renderização
  // a mais de dois controles pequenos.
  useEffect(() => {
    try {
      setAfinacao(getSkyTuning());
    } catch {}
  }, []);

  // ---------------------------------------------------------------------
  // Âncora de sessão de mídia (ver lib/cosmicSoundSession.js): um WAV de
  // silêncio gerado em memória, tocando em loop, só pra o navegador entender
  // que ESTA aba está tocando mídia. Sem ele, o áudio da Web Audio morre ao
  // minimizar e nada aparece na tela de bloqueio.
  // ---------------------------------------------------------------------
  const obterAncora = useCallback(() => {
    if (ancoraRef.current) return ancoraRef.current;
    if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.Audio !== 'function') return null;
    try {
      const el = new window.Audio(wavSilenciosoDataUri(2));
      el.loop = true;
      el.volume = 0.0001;
      // Nunca vira "download do áudio" no menu do navegador nem entra no
      // histórico de mídia — é infraestrutura, não conteúdo.
      el.setAttribute('aria-hidden', 'true');
      ancoraRef.current = el;
      return el;
    } catch {
      return null;
    }
  }, []);

  const sincronizarSessaoDeMidia = useCallback(
    (estado) => {
      if (!temSessaoDeMidia()) {
        sessaoAtivaRef.current = false;
        return false;
      }
      try {
        const preset = presetPorId(presetId);
        const nomeAmbiente = preset.baseHz ? t('sound.hz', { hz: preset.baseHz }) : t('sound.preset.sky');
        if (typeof window !== 'undefined' && typeof window.MediaMetadata === 'function') {
          navigator.mediaSession.metadata = new window.MediaMetadata(
            metadadosDeMidia({
              titulo: t('sound.title'),
              artista: nomeAmbiente,
              album: t('sound.media.album'),
              artwork: urlDaArte(),
            })
          );
        }
        navigator.mediaSession.playbackState = estado;
        // Só as três ações que existem de verdade. Um drone contínuo não tem
        // faixa anterior, próxima nem linha do tempo — declarar essas ações
        // colocaria botões mortos na tela de bloqueio.
        try {
          navigator.mediaSession.setActionHandler('play', () => {
            const fn = tocarRef.current;
            if (fn) fn();
          });
        } catch {}
        try {
          navigator.mediaSession.setActionHandler('pause', () => {
            const fn = pausarRef.current;
            if (fn) fn();
          });
        } catch {}
        try {
          navigator.mediaSession.setActionHandler('stop', () => {
            const fn = pausarRef.current;
            if (fn) fn();
          });
        } catch {}
        for (const acao of ['seekbackward', 'seekforward', 'seekto', 'previoustrack', 'nexttrack']) {
          try {
            navigator.mediaSession.setActionHandler(acao, null);
          } catch {}
        }
        sessaoAtivaRef.current = estado === 'playing';
        return true;
      } catch {
        sessaoAtivaRef.current = false;
        return false;
      }
    },
    [presetId, t]
  );

  const obterMotor = useCallback(async () => {
    if (motorRef.current) return motorRef.current;
    const motor = createCosmicSound();
    motorRef.current = motor;
    try {
      const prefs = await motor.carregarPreferencias();
      if (prefs) {
        setVolume(prefs.volume);
        volumeRef.current = prefs.volume;
        setPresetId(prefs.presetId);
      }
    } catch {}
    return motor;
  }, []);

  const pararTudo = useCallback(
    async (motivo) => {
      const motor = motorRef.current;
      pedidoRef.current += 1; // invalida um tocar() que ainda esteja em voo
      tocandoRef.current = false;
      setTocando(false);
      fimTimerRef.current = null;
      setRestanteS(null);
      try {
        const a = ancoraRef.current;
        if (a && typeof a.pause === 'function') a.pause();
      } catch {}
      sincronizarSessaoDeMidia('paused');
      if (motivo) setAviso(motivo);
      if (motor) await motor.stop();
    },
    [sincronizarSessaoDeMidia]
  );

  const pausar = useCallback(() => pararTudo(null), [pararTudo]);
  pausarRef.current = pausar;

  // Fim do timer: fade LONGO (ver planoDeFade) e só então o stop do motor.
  // setVolume persiste a preferência, então o volume original é devolvido no
  // fim — quem escolheu 70% não acorda amanhã com o som no mínimo.
  const encerrarComFade = useCallback(async () => {
    if (fechandoRef.current) return;
    fechandoRef.current = true;
    const original = volumeRef.current;
    try {
      const motor = motorRef.current;
      if (motor) {
        for (const passo of planoDeFade(original)) {
          if (!tocandoRef.current) break;
          await motor.setVolume(passo);
          await espera(FADE_PASSO_MS);
        }
      }
      await pararTudo(null);
      if (motor) await motor.setVolume(original);
      setVolume(original);
      volumeRef.current = original;
    } finally {
      fechandoRef.current = false;
    }
  }, [pararTudo]);

  const tocar = useCallback(async () => {
    if (!suportado) {
      setAviso('sem-suporte');
      return;
    }
    if (tocandoRef.current || fechandoRef.current) return;
    const meuPedido = ++pedidoRef.current;
    setOcupado(true);
    setAviso(null);
    try {
      const motor = await obterMotor();
      const r = await motor.start();
      // Pausou no meio da liberação do áudio: pararTudo() já incrementou o
      // pedido e já mandou o motor parar. Marcar "tocando" aqui deixaria a tela
      // anunciando um som que não existe (e o dock com botão de pausa que não
      // pausa nada).
      if (pedidoRef.current !== meuPedido) {
        try {
          await motor.stop();
        } catch {}
        return;
      }
      if (!r || !r.ok) {
        setAviso((r && r.motivo) || 'falha-audio');
        return;
      }
      tocandoRef.current = true;
      setTocando(true);
      if (r.afinacao) setAfinacao(r.afinacao);
      const ancora = obterAncora();
      if (ancora) {
        // play() devolve promessa rejeitada quando o navegador ainda não
        // liberou mídia — o som principal já está tocando de qualquer jeito, a
        // âncora só some (e aí a sessão de mídia não existe, o que o
        // AppState abaixo trata parando em segundo plano em vez de esconder).
        try {
          const p = ancora.play();
          if (p && typeof p.catch === 'function') p.catch(() => {});
        } catch {}
      }
      sincronizarSessaoDeMidia('playing');
      ultimoTiqueRef.current = Date.now();
      if (timerRef.current > SEM_TIMER) {
        fimTimerRef.current = Date.now() + timerRef.current * 60000;
        ultimoMinutoPublicadoRef.current = -1;
        setRestanteS(calcularRestante(fimTimerRef.current));
      }
    } catch {
      setAviso('falha-audio');
    } finally {
      setOcupado(false);
    }
  }, [obterAncora, obterMotor, sincronizarSessaoDeMidia, suportado]);

  tocarRef.current = tocar;

  const alternar = useCallback(() => {
    if (tocandoRef.current) return pausar();
    return tocar();
  }, [pausar, tocar]);

  // Tique de 1 s enquanto toca: escuta acumulada (→ dia ativo) e vencimento do
  // timer. Usa relógio de parede, não contagem de tiques — aba em segundo
  // plano tem o setInterval estrangulado pelo navegador.
  useEffect(() => {
    if (!tocando) return undefined;
    ultimoTiqueRef.current = Date.now();
    const id = setInterval(() => {
      const agora = Date.now();
      const decorrido = (agora - ultimoTiqueRef.current) / 1000;
      ultimoTiqueRef.current = agora;

      // Volume no zero é silêncio de verdade (ganhoPerceptual(0) === 0): não
      // pode contar como escuta, senão bastava deixar mudo o dia inteiro.
      if (volumeRef.current > 0) {
        const r = contadorRef.current.registrar(decorrido);
        // Publica no estado a cada 5 s, não a cada tique. O tique precisa ser
        // de 1 s pra contagem ser precisa, mas cada setState aqui re-renderiza
        // os controles do som — e a tela só mostra minutos. 5 s é invisível
        // pra quem olha e 5× menos trabalho pra quem não está olhando.
        if (r.atingiu || Math.abs(r.segundos - ultimaEscutaPublicadaRef.current) >= 5) {
          ultimaEscutaPublicadaRef.current = r.segundos;
          setEscutaS(Math.floor(r.segundos));
          setContouSequencia(contadorRef.current.estado().jaContou);
        }
        if (r.atingiu) {
          // Único efeito de retenção da feature — e é o MESMO caminho das
          // leituras (lib/readingCompletion.js chama a mesma função).
          recordActiveDay().catch(() => {});
        }
      }

      const fim = fimTimerRef.current;
      if (fim) {
        const resta = calcularRestante(fim, agora);
        // Mesma economia: a tela mostra "desliga em X min", então só publica
        // quando o minuto vira (ou no fim, que é o que dispara o fade).
        const minuto = Math.ceil(resta / 60);
        if (resta <= 0 || minuto !== ultimoMinutoPublicadoRef.current) {
          ultimoMinutoPublicadoRef.current = minuto;
          setRestanteS(resta);
        }
        if (resta <= 0) encerrarComFade();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [tocando, encerrarComFade]);

  // Trocar de ambiente com o som tocando tem que trocar também o que a tela de
  // bloqueio mostra — senão o celular fica anunciando "Céu de hoje" enquanto
  // toca 528 Hz. (Achado real no smoke test de navegador, 30/07/2026.)
  useEffect(() => {
    if (tocandoRef.current) sincronizarSessaoDeMidia('playing');
  }, [presetId, sincronizarSessaoDeMidia]);

  // App saiu da frente. Com sessão de mídia ativa, continuar tocando é uma
  // escolha VISÍVEL (a pessoa vê os controles na tela de bloqueio e desliga
  // quando quiser). Sem sessão de mídia, um som que continua é um som
  // escondido — e aí para, sempre.
  useEffect(() => {
    const aoMudar = (estado) => {
      if (estado === 'active') return;
      if (!tocandoRef.current) return;
      if (sessaoDeMidiaSegurando()) return;
      pararTudo('segundo-plano');
    };
    let sub = null;
    try {
      sub = AppState.addEventListener('change', aoMudar);
    } catch {}
    return () => {
      try {
        if (sub && typeof sub.remove === 'function') sub.remove();
      } catch {}
    };
  }, [pararTudo, sessaoDeMidiaSegurando]);

  // Fecha a aba / desmonta o app: libera o contexto de áudio. Vazamento de
  // oscilador é O bug clássico desta feature (ver lib/cosmicSound.js).
  useEffect(() => {
    return () => {
      const motor = motorRef.current;
      if (motor) motor.dispose().catch(() => {});
      try {
        const a = ancoraRef.current;
        if (a && typeof a.pause === 'function') a.pause();
      } catch {}
    };
  }, []);

  const ajustarVolume = useCallback(async (v) => {
    const alvo = Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
    setVolume(alvo);
    volumeRef.current = alvo;
    const motor = motorRef.current;
    if (motor) await motor.setVolume(alvo);
  }, []);

  const escolherPreset = useCallback(
    async (id) => {
      const escolhido = presetPorId(id).id;
      setPresetId(escolhido);
      setOcupado(true);
      try {
        const motor = motorRef.current;
        if (motor) {
          // O motor para e remonta sozinho quando está tocando (rampa dos dois
          // lados, sem corte seco) — ver setPreset em lib/cosmicSound.js.
          await motor.setPreset(escolhido);
        } else {
          // Motor ainda nem existe (a pessoa escolheu o ambiente antes de
          // tocar): grava a preferência, que é o que o motor vai ler no start.
          await salvarPreset(escolhido);
        }
      } catch {
      } finally {
        setOcupado(false);
      }
    },
    []
  );

  const escolherTimer = useCallback((minutos) => {
    const m = Number.isFinite(minutos) && minutos > 0 ? Math.floor(minutos) : SEM_TIMER;
    setTimerMinutos(m);
    timerRef.current = m;
    if (!tocandoRef.current || m === SEM_TIMER) {
      fimTimerRef.current = m === SEM_TIMER ? null : fimTimerRef.current;
      if (m === SEM_TIMER) setRestanteS(null);
      return;
    }
    // Com o som já tocando, escolher um tempo recomeça a contagem a partir de
    // AGORA — é o que a pessoa espera ao tocar em "30 min" no meio da sessão.
    fimTimerRef.current = Date.now() + m * 60000;
    ultimoMinutoPublicadoRef.current = -1;
    setRestanteS(calcularRestante(fimTimerRef.current));
  }, []);

  // Recalcula o céu quando o controle é aberto com o som PARADO (o dia pode ter
  // virado desde que o app abriu). Com o som tocando não mexe: o grafo montado
  // é do dia em que começou, e a tela tem que descrever o que está soando.
  const atualizarCeu = useCallback(() => {
    if (tocandoRef.current) return;
    try {
      setAfinacao(getSkyTuning());
    } catch {}
  }, []);

  const registrarInline = useCallback(() => {
    setInlinesVisiveis((n) => n + 1);
    return () => setInlinesVisiveis((n) => Math.max(0, n - 1));
  }, []);

  const valor = {
    suportado,
    tocando,
    ocupado,
    volume,
    presetId,
    preset: presetPorId(presetId),
    afinacao,
    timerMinutos,
    restanteS,
    escutaS,
    contouSequencia,
    minEscutaS: MIN_ESCUTA_SEGUNDOS,
    aviso,
    limparAviso: () => setAviso(null),
    inlinesVisiveis,
    tocar,
    pausar,
    alternar,
    ajustarVolume,
    escolherPreset,
    escolherTimer,
    atualizarCeu,
    registrarInline,
  };

  return <CosmicSoundContext.Provider value={valor}>{children}</CosmicSoundContext.Provider>;
}
