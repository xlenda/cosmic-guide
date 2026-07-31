// components/BreathGuide.js
// O círculo que acompanha a respiração: expande na inspiração, fica parado na
// retenção, contrai na expiração.
//
// ===========================================================================
// LEIA lib/grounding.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// Regra do dono, resumida: respiração é PRÁTICA, nunca tratamento. Todo verbo
// desta tela é de ação observável (inspire, conte, solte) e nenhum é de
// resultado (relaxe, acalme, esvazie a mente). test/grounding.test.js falha o
// build quando isso é violado.
// ===========================================================================
//
// DUAS REGRAS DE DESENHO QUE NÃO SÃO ENFEITE:
//
// 1. O ESTADO NUNCA É SÓ A ANIMAÇÃO. O nome da fase e a contagem estão SEMPRE
//    em texto, nos dois modos. Quem não vê a animação — por preferência de
//    sistema, por leitor de tela, ou porque o dispositivo engasgou — continua
//    sabendo exatamente o que está acontecendo. A animação é reforço, nunca a
//    única portadora da informação.
//
// 2. prefers-reduced-motion É OBEDECIDO DE VERDADE. Quem pede menos movimento
//    não recebe uma animação mais lenta: recebe ZERO animação, com a contagem
//    em texto grande no lugar. O componente nem cria o laço.
//
// SOBRE Animated NA WEB — o custo, declarado. react-native-web não tem driver
// nativo: useNativeDriver cai em silêncio pro driver JS e a animação vira
// requestAnimationFrame escrevendo estilo a cada quadro. Em
// components/CosmicSoundPlayer.js essa conta levou o pulso do ícone pra CSS,
// porque lá a animação é CONTÍNUA e roda por horas em segundo plano enquanto
// ninguém olha. Aqui é o oposto: a animação É a tela, dura de 3 a 20 minutos
// com a pessoa olhando pra ela, e são no máximo 4 timings por ciclo (um por
// fase) em vez de um laço perpétuo. Por isso o Animated fica — mas com
// useNativeDriver ligado onde ele existe de verdade, e com o caminho de
// movimento reduzido desligando tudo.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform, AccessibilityInfo } from 'react-native';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { faseKey } from '../lib/grounding';

// Tamanho do círculo em repouso e no auge. A escala mínima não é zero de
// propósito: um círculo que some no fim da expiração parece erro de render, e
// perto de quem acabou de ler algo que a mexeu, "sumir" é a imagem errada.
const DIAMETRO = 200;
const ESCALA_MIN = 0.45;
const ESCALA_MAX = 1;

// prefers-reduced-motion na web e "reduzir movimento" no sistema, no nativo.
// Mesma lógica de components/CosmicSoundPlayer.js — está duplicada aqui, e não
// importada de lá, porque aquele arquivo é um controle de áudio: fazer uma tela
// de respiração depender do módulo do player só pra ler uma preferência de
// acessibilidade acopla duas features que não têm nada a ver uma com a outra.
// Se um dia aparecer um terceiro consumidor, vale extrair pra um hook próprio.
export function useMovimentoReduzido() {
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

// props:
//   fase          'inspira' | 'seguraCheio' | 'expira' | 'seguraVazio'
//   duracaoFase   segundos da fase atual (dita a duração da animação)
//   contagem      1..duracaoFase — o número que se conta, não um cronômetro
//   ativo         false congela tudo (sessão parada ou terminada)
//   reduzido      força o modo sem movimento; se omitido, lê a preferência
export default function BreathGuide({ fase, duracaoFase, contagem, ativo = true, reduzido }) {
  const { t } = useLanguage();
  const preferenciaReduzida = useMovimentoReduzido();
  const semMovimento = reduzido === undefined ? preferenciaReduzida : !!reduzido;

  const escala = useRef(new Animated.Value(ESCALA_MIN)).current;

  useEffect(() => {
    if (semMovimento) return undefined;
    if (!ativo || !fase) {
      escala.stopAnimation();
      return undefined;
    }
    // Retenção é retenção: o círculo PARA. Animar devagarinho durante a pausa
    // seria mentir sobre o que a pessoa está fazendo — ela não está soltando
    // o ar, está segurando.
    if (fase === 'seguraCheio' || fase === 'seguraVazio') {
      escala.stopAnimation();
      return undefined;
    }
    const alvo = fase === 'inspira' ? ESCALA_MAX : ESCALA_MIN;
    const ms = Math.max(300, (Number(duracaoFase) || 4) * 1000);
    const anim = Animated.timing(escala, {
      toValue: alvo,
      duration: ms,
      easing: Easing.inOut(Easing.quad),
      // Na web isto cai no driver JS de qualquer jeito (o RNW avisa no
      // console); no nativo é o driver de verdade. Deixar sempre true faria a
      // web logar aviso a cada fase.
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
  }, [fase, duracaoFase, ativo, semMovimento, escala]);

  // Sessão parada: volta ao repouso, sem animação de saída.
  useEffect(() => {
    if (!ativo) escala.setValue(ESCALA_MIN);
  }, [ativo, escala]);

  const rotulo = fase ? t(faseKey(fase)) : '';
  const numero = Number.isFinite(contagem) && contagem > 0 ? String(contagem) : '';

  return (
    <View style={styles.raiz} testID="breath-guide">
      <View style={styles.palco}>
        {semMovimento ? (
          // Modo sem movimento: o mesmo círculo, parado, com a contagem no
          // meio. Nenhum Animated é criado.
          <View style={[styles.circulo, styles.circuloParado]} />
        ) : (
          <Animated.View style={[styles.circulo, { transform: [{ scale: escala }] }]} />
        )}
        <View style={styles.centro} pointerEvents="none">
          <Text style={styles.numero} testID="breath-count">
            {numero}
          </Text>
        </View>
      </View>

      {/* O rótulo da fase é texto SEMPRE — nos dois modos. É ele, e não o
          tamanho do círculo, que diz o que fazer agora. */}
      <Text
        style={styles.fase}
        testID="breath-phase"
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
      >
        {rotulo}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { alignItems: 'center', gap: 14, paddingVertical: 8 },
  palco: {
    width: DIAMETRO,
    height: DIAMETRO,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circulo: {
    position: 'absolute',
    width: DIAMETRO,
    height: DIAMETRO,
    borderRadius: DIAMETRO / 2,
    backgroundColor: 'rgba(92,224,216,0.12)',
    borderWidth: 2,
    borderColor: colors.teal,
  },
  circuloParado: { transform: [{ scale: 0.8 }] },
  centro: { alignItems: 'center', justifyContent: 'center' },
  numero: { color: colors.text, fontSize: 44, fontWeight: '200', letterSpacing: 2 },
  fase: { color: colors.teal, fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
});
