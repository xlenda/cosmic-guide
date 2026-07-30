// components/CosmicSoundPlayer.js
// Controle do "Som do céu". Dois formatos, o MESMO som (o motor vive em
// context/CosmicSoundContext.js, acima dos navegadores):
//
//   variant="dock"    pílula flutuante acima da barra de abas. Discreta, some
//                     do caminho, e existe em TODAS as telas — é o que permite
//                     pausar sem procurar onde o som foi ligado.
//   variant="inline"  card dentro de uma tela (a Home usa). É o formato que
//                     APRESENTA a feature: título, a linha do porquê e o botão.
//                     Uma pílula de 40 px nunca seria descoberta sozinha.
//
// A linha do porquê é o ponto inteiro da coisa: "Lua cheia em Aquário — timbre
// mais aberto hoje" é o que separa isto de mais uma playlist de frequências. O
// texto sai do motor astrológico REAL do app (fase, signo lunar, regente do dia
// pela ordem caldaica, aspecto exato, Mercúrio retrógrado).
//
// ================== HONESTIDADE (régua de lib/cosmicSound.js) ================
// Nenhuma string aqui promete efeito sobre corpo ou mente. As frequências
// aparecem como TRADIÇÃO declarada ("a tradição associa..."), com a origem e a
// ausência de confirmação científica escritas na própria tela, e o uso é sempre
// prático: acompanhar a leitura, ficar em silêncio junto. Qualquer frase que um
// órgão de defesa do consumidor pudesse chamar de promessa terapêutica está
// errada e não entra.
// ============================================================================
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Animated,
  Easing,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { PRESETS } from '../lib/cosmicSound';
import { TIMER_MINUTOS, SEM_TIMER, faixaDeBrilho } from '../lib/cosmicSoundSession';
import { useLanguage } from '../context/LanguageContext';
import { useCosmicSound } from '../context/CosmicSoundContext';

// Degraus de volume. Fader contínuo exigiria uma dependência nova (não há
// slider no projeto) e, num controle que se usa uma vez por sessão, sete
// degraus tocáveis são mais rápidos e muito mais acessíveis a leitor de tela do
// que arrastar. A curva perceptual de verdade acontece em ganhoPerceptual().
const NIVEIS_VOLUME = [0, 0.15, 0.3, 0.45, 0.6, 0.8, 1];

const CHAVE_BRILHO = { alto: 'sound.bright.high', medio: 'sound.bright.mid', baixo: 'sound.bright.low' };

// Motivos que o motor devolve (lib/cosmicSound.js start()) e o contexto guarda,
// traduzidos pra frase de tela. Mapa explícito em vez de chave montada com o
// próprio motivo: os motivos têm hífen ('gesto-necessario') e chave de
// dicionário com hífen escapa do teste estático test/i18nKeysExist.test.js.
const CHAVE_AVISO = {
  'sem-suporte': 'sound.warn.unsupported',
  'gesto-necessario': 'sound.warn.gesture',
  'falha-audio': 'sound.warn.failed',
  'segundo-plano': 'sound.warn.background',
};

function textoDeAviso(t, aviso) {
  if (!aviso) return null;
  return t(CHAVE_AVISO[aviso] || 'sound.warn.failed');
}

// prefers-reduced-motion na web e "reduzir movimento" no sistema, no nativo.
// Quem pede menos movimento recebe o player sem pulso nenhum — o estado de
// "tocando" continua legível pelo ícone e pelo texto, nunca só pela animação.
function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(false);
  useEffect(() => {
    let vivo = true;
    if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      let mq;
      try {
        mq = window.matchMedia('(prefers-reduced-motion: reduce)');
      } catch {
        return undefined;
      }
      setReduzido(!!mq.matches);
      const ouvir = (e) => {
        if (vivo) setReduzido(!!e.matches);
      };
      if (typeof mq.addEventListener === 'function') mq.addEventListener('change', ouvir);
      else if (typeof mq.addListener === 'function') mq.addListener(ouvir);
      return () => {
        vivo = false;
        if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', ouvir);
        else if (typeof mq.removeListener === 'function') mq.removeListener(ouvir);
      };
    }
    let sub = null;
    try {
      if (typeof AccessibilityInfo.isReduceMotionEnabled === 'function') {
        AccessibilityInfo.isReduceMotionEnabled()
          .then((v) => {
            if (vivo) setReduzido(!!v);
          })
          .catch(() => {});
      }
      if (typeof AccessibilityInfo.addEventListener === 'function') {
        sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (v) => {
          if (vivo) setReduzido(!!v);
        });
      }
    } catch {}
    return () => {
      vivo = false;
      try {
        if (sub && typeof sub.remove === 'function') sub.remove();
      } catch {}
    };
  }, []);
  return reduzido;
}

// Pulso lento do ícone enquanto toca. Desligado por completo com movimento
// reduzido (o valor fica parado em 1, sem loop rodando em segundo plano).
function usePulso(ativo) {
  const reduzido = useMovimentoReduzido();
  const valor = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!ativo || reduzido) {
      valor.stopAnimation(() => valor.setValue(1));
      return undefined;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(valor, { toValue: 0.45, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(valor, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ativo, reduzido, valor]);
  return { opacidade: valor, reduzido };
}

// ---------------------------------------------------------------------------
// Texto: por que o som está assim hoje
// ---------------------------------------------------------------------------
// Nomes de signo, fase e planeta chegam em português do motor astrológico
// (lib/signs.js / lib/lunarCalendar.js). É o MESMO gap já documentado no
// cabeçalho de lib/i18n.js pro conteúdo astrológico — a moldura da frase é
// traduzida, os nomes próprios do céu ainda não.
function linhaCurta(t, af) {
  if (!af) return '';
  if (!af.ceuDisponivel) return t('sound.why.unavailableShort', { regente: af.regente });
  if (af.fase && af.signoLua) {
    return t('sound.why.short', {
      fase: af.fase,
      signo: af.signoLua,
      brilho: t(CHAVE_BRILHO[faixaDeBrilho(af.iluminacao)]),
    });
  }
  return t('sound.why.shortRuler', { regente: af.regente });
}

function linhasLongas(t, af, preset) {
  if (!af) return [];
  if (!af.ceuDisponivel) return [t('sound.why.unavailable', { regente: af.regente })];
  const partes = [t('sound.why.ruler', { regente: af.regente })];
  if (af.fase) partes.push(t('sound.why.phase', { fase: af.fase, luz: af.iluminacao }));
  if (af.signoLua && af.elemento) partes.push(t('sound.why.moon', { signo: af.signoLua, elemento: af.elemento }));
  if (af.aspectoExato) {
    partes.push(t('sound.why.aspect', { a: af.aspectoExato.planetA, b: af.aspectoExato.planetB }));
  }
  if (af.mercurioRetrogrado === true) partes.push(t('sound.why.retro'));
  if (preset && preset.baseHz) partes.push(t('sound.why.presetNote', { hz: preset.baseHz }));
  partes.push(t('sound.why.tomorrow'));
  return partes;
}

function nomeDoPreset(t, preset) {
  return preset.baseHz ? t('sound.hz', { hz: preset.baseHz }) : t('sound.preset.sky');
}

function textoDeTradicao(t, preset) {
  if (!preset.baseHz) return t('sound.preset.skyHint');
  return t(`sound.assoc.${preset.baseHz}`);
}

// ---------------------------------------------------------------------------
// Painel (bottom sheet) — todos os controles
// ---------------------------------------------------------------------------
function Painel({ aberto, aoFechar }) {
  const { t } = useLanguage();
  const som = useCosmicSound();
  const reduzido = useMovimentoReduzido();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (aberto && som) som.atualizarCeu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  if (!som) return null;
  const preset = som.preset;
  const faltamS = Math.max(0, som.minEscutaS - som.escutaS);
  const faltamMin = Math.max(1, Math.ceil(faltamS / 60));

  return (
    <Modal
      visible={aberto}
      transparent
      animationType={reduzido ? 'none' : 'slide'}
      onRequestClose={aoFechar}
      accessibilityViewIsModal
    >
      <View style={s.modalFundo}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={aoFechar} accessibilityLabel={t('sound.close')} />
        <View style={[s.folha, { paddingBottom: 18 + insets.bottom }]}>
          <View style={s.puxador} />

          <View style={s.folhaTopo}>
            <View style={{ flex: 1 }}>
              <Text style={s.folhaTitulo}>{t('sound.title')}</Text>
              <Text style={s.folhaLinha}>{linhaCurta(t, som.afinacao)}</Text>
            </View>
            <TouchableOpacity onPress={aoFechar} accessibilityRole="button" accessibilityLabel={t('sound.close')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[s.botaoGrande, som.tocando && s.botaoGrandeAtivo]}
              activeOpacity={0.85}
              onPress={som.alternar}
              disabled={som.ocupado}
              accessibilityRole="button"
              accessibilityLabel={som.tocando ? t('sound.pause') : t('sound.play')}
            >
              <Ionicons name={som.tocando ? 'pause' : 'play'} size={18} color="#fff" />
              <Text style={s.botaoGrandeTexto}>{som.tocando ? t('sound.pause') : t('sound.play')}</Text>
            </TouchableOpacity>

            {som.aviso ? <Text style={s.aviso}>{textoDeAviso(t, som.aviso)}</Text> : null}

            {/* Volume */}
            <Text style={s.secao}>{t('sound.volume')}</Text>
            <View style={s.linhaNiveis}>
              {NIVEIS_VOLUME.map((n, i) => {
                const ativo = som.volume >= n && !(n === 0 && som.volume > 0);
                return (
                  <TouchableOpacity
                    key={n}
                    style={[s.nivel, ativo && s.nivelAtivo, { height: 12 + i * 4 }]}
                    onPress={() => som.ajustarVolume(n)}
                    accessibilityRole="button"
                    accessibilityLabel={t('sound.a11y.volumeStep', { n: i, total: NIVEIS_VOLUME.length - 1 })}
                  />
                );
              })}
            </View>
            {som.volume === 0 ? <Text style={s.dica}>{t('sound.mutedHint')}</Text> : null}

            {/* Ambiente */}
            <Text style={s.secao}>{t('sound.ambience')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
              {PRESETS.map((p) => {
                const ativo = p.id === som.presetId;
                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[s.chip, ativo && s.chipAtivo]}
                    onPress={() => som.escolherPreset(p.id)}
                    disabled={som.ocupado}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    accessibilityLabel={nomeDoPreset(t, p)}
                  >
                    <Text style={[s.chipTexto, ativo && s.chipTextoAtivo]}>{nomeDoPreset(t, p)}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <Text style={s.tradicao}>{textoDeTradicao(t, preset)}</Text>
            {preset.baseHz ? <Text style={s.disclaimer}>{t('sound.disclaimer')}</Text> : null}

            {/* Timer */}
            <Text style={s.secao}>{t('sound.timer')}</Text>
            <View style={s.linhaChips}>
              {TIMER_MINUTOS.map((m) => {
                const ativo = som.timerMinutos === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[s.chip, ativo && s.chipAtivo]}
                    onPress={() => som.escolherTimer(m)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    accessibilityLabel={t('sound.timer.minutes', { n: m })}
                  >
                    <Text style={[s.chipTexto, ativo && s.chipTextoAtivo]}>{t('sound.timer.minutes', { n: m })}</Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                style={[s.chip, som.timerMinutos === SEM_TIMER && s.chipAtivo]}
                onPress={() => som.escolherTimer(SEM_TIMER)}
                accessibilityRole="button"
                accessibilityState={{ selected: som.timerMinutos === SEM_TIMER }}
                accessibilityLabel={t('sound.timer.off')}
              >
                <Text style={[s.chipTexto, som.timerMinutos === SEM_TIMER && s.chipTextoAtivo]}>{t('sound.timer.off')}</Text>
              </TouchableOpacity>
            </View>
            {som.tocando && som.restanteS !== null ? (
              <Text style={s.dica}>{t('sound.timer.left', { min: Math.max(1, Math.ceil(som.restanteS / 60)) })}</Text>
            ) : (
              <Text style={s.dica}>{t('sound.timer.fadeHint')}</Text>
            )}

            {/* Sequência — o único efeito de retenção, dito na cara */}
            <View style={s.blocoSequencia}>
              <Ionicons
                name={som.contouSequencia ? 'checkmark-circle' : 'flame-outline'}
                size={15}
                color={som.contouSequencia ? colors.green : colors.textMuted}
              />
              <Text style={[s.sequenciaTexto, som.contouSequencia && { color: colors.green }]}>
                {som.contouSequencia
                  ? t('sound.streak.counted')
                  : som.tocando
                    ? t('sound.streak.left', { min: faltamMin })
                    : t('sound.streak.hint', { min: Math.round(som.minEscutaS / 60) })}
              </Text>
            </View>

            {/* Por que o som está assim hoje */}
            <Text style={s.secao}>{t('sound.why.title')}</Text>
            {linhasLongas(t, som.afinacao, preset).map((linha, i) => (
              <Text key={i} style={s.porque}>
                {linha}
              </Text>
            ))}
            <Text style={s.disclaimer}>{t('sound.tagline')}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
export default function CosmicSoundPlayer({ variant = 'dock', style }) {
  const { t } = useLanguage();
  const som = useCosmicSound();
  const insets = useSafeAreaInsets();
  const [aberto, setAberto] = useState(false);
  const { opacidade } = usePulso(!!(som && som.tocando));

  // Um controle embutido na tela avisa o contexto que existe — o dock some
  // enquanto ele está visível e o som está parado, pra não haver dois botões
  // iguais na mesma tela. Tocando, o dock volta: aí ele é o jeito de pausar
  // sem ter que achar de novo a tela onde tudo começou.
  const registrar = som && som.registrarInline;
  useEffect(() => {
    if (variant !== 'inline' || !registrar) return undefined;
    return registrar();
  }, [variant, registrar]);

  const abrir = useCallback(() => setAberto(true), []);
  const fechar = useCallback(() => setAberto(false), []);

  // Sem Web Audio (runtime nativo do RN, navegador antigo) a feature nem
  // aparece — melhor ausente do que um botão que não faz nada.
  if (!som || !som.suportado) return null;

  const linha = linhaCurta(t, som.afinacao);

  if (variant === 'inline') {
    return (
      <View style={[s.card, style]}>
        <View style={s.cardTopo}>
          <Animated.View style={{ opacity: som.tocando ? opacidade : 1 }}>
            <Ionicons name="musical-notes" size={16} color={colors.teal} />
          </Animated.View>
          <Text style={s.cardTitulo}>{t('sound.title')}</Text>
          {som.tocando ? <Text style={s.selo}>{t('sound.playing')}</Text> : null}
        </View>
        <Text style={s.cardLinha}>{linha}</Text>
        <View style={s.cardBotoes}>
          <TouchableOpacity
            style={[s.botaoGrande, { flex: 1 }, som.tocando && s.botaoGrandeAtivo]}
            activeOpacity={0.85}
            onPress={som.alternar}
            disabled={som.ocupado}
            accessibilityRole="button"
            accessibilityLabel={som.tocando ? t('sound.pause') : t('sound.play')}
          >
            <Ionicons name={som.tocando ? 'pause' : 'play'} size={16} color="#fff" />
            <Text style={s.botaoGrandeTexto}>{som.tocando ? t('sound.pause') : t('sound.play')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.botaoSecundario}
            activeOpacity={0.85}
            onPress={abrir}
            accessibilityRole="button"
            accessibilityLabel={t('sound.open')}
          >
            <Ionicons name="options-outline" size={16} color={colors.textSecondary} />
            <Text style={s.botaoSecundarioTexto}>{t('sound.adjust')}</Text>
          </TouchableOpacity>
        </View>
        {som.aviso ? <Text style={s.aviso}>{textoDeAviso(t, som.aviso)}</Text> : null}
        <Text style={s.cardNota}>{t('sound.tagline')}</Text>
        <Painel aberto={aberto} aoFechar={fechar} />
      </View>
    );
  }

  // dock — pílula flutuante, alinhada à direita pra não cobrir texto de leitura.
  // Some enquanto um card embutido está na tela E o som está parado: dois
  // controles idênticos na mesma tela confundem. Tocando, a pílula volta —
  // pausar tem que ser possível de qualquer lugar, sempre.
  if (som.inlinesVisiveis > 0 && !som.tocando) return null;

  return (
    <View style={[s.dockArea, { bottom: 70 + insets.bottom }]} pointerEvents="box-none">
      <View style={s.pilula}>
        <TouchableOpacity
          style={s.pilulaCorpo}
          activeOpacity={0.85}
          onPress={abrir}
          accessibilityRole="button"
          accessibilityLabel={t('sound.open')}
        >
          <Animated.View style={{ opacity: som.tocando ? opacidade : 1 }}>
            <Ionicons name="musical-notes" size={15} color={som.tocando ? colors.teal : colors.textMuted} />
          </Animated.View>
          <Text style={[s.pilulaTexto, som.tocando && { color: colors.text }]} numberOfLines={1}>
            {t('sound.title')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.pilulaBotao}
          activeOpacity={0.85}
          onPress={som.alternar}
          disabled={som.ocupado}
          accessibilityRole="button"
          accessibilityLabel={som.tocando ? t('sound.pause') : t('sound.play')}
        >
          <Ionicons name={som.tocando ? 'pause' : 'play'} size={14} color="#fff" />
        </TouchableOpacity>
      </View>
      <Painel aberto={aberto} aoFechar={fechar} />
    </View>
  );
}

const s = StyleSheet.create({
  // dock
  dockArea: { position: 'absolute', right: 12, left: 12, alignItems: 'flex-end' },
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 4,
    paddingVertical: 4,
    maxWidth: 220,
  },
  pilulaCorpo: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1, paddingVertical: 4 },
  pilulaTexto: { color: colors.textMuted, fontSize: 12, fontWeight: '700', flexShrink: 1 },
  pilulaBotao: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // card (inline)
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 14 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 6 },
  cardTitulo: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  selo: { color: colors.teal, fontSize: 11, fontWeight: '700' },
  cardLinha: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18, marginBottom: 10 },
  cardBotoes: { flexDirection: 'row', gap: 8 },
  cardNota: { color: colors.textMuted, fontSize: 11, lineHeight: 15, marginTop: 10 },

  botaoGrande: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  botaoGrandeAtivo: { backgroundColor: colors.accent2 },
  botaoGrandeTexto: { color: '#fff', fontSize: 13, fontWeight: '800' },
  botaoSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 12,
  },
  botaoSecundarioTexto: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '700' },

  // painel
  modalFundo: { flex: 1, backgroundColor: '#00000088', justifyContent: 'flex-end' },
  folha: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  puxador: { alignSelf: 'center', width: 38, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 12 },
  folhaTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  folhaTitulo: { color: colors.text, fontSize: 17, fontWeight: '800' },
  folhaLinha: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18, marginTop: 3 },

  secao: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: 16, marginBottom: 8 },

  linhaNiveis: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  nivel: { flex: 1, borderRadius: 4, backgroundColor: colors.border },
  nivelAtivo: { backgroundColor: colors.teal },

  linhaChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipAtivo: { borderColor: colors.accent2, backgroundColor: colors.accent2 + '22' },
  chipTexto: { color: colors.textSecondary, fontSize: 12.5, fontWeight: '700' },
  chipTextoAtivo: { color: colors.text },

  tradicao: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 10 },
  disclaimer: { color: colors.textMuted, fontSize: 11, lineHeight: 15, marginTop: 8 },
  dica: { color: colors.textMuted, fontSize: 11.5, marginTop: 8 },
  aviso: { color: colors.amber, fontSize: 12, lineHeight: 17, marginTop: 10 },
  porque: { color: colors.textSecondary, fontSize: 12.5, lineHeight: 18, marginBottom: 5 },

  blocoSequencia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 10,
  },
  sequenciaTexto: { flex: 1, color: colors.textMuted, fontSize: 11.5, lineHeight: 16 },
});
