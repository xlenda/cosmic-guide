// components/BotonPrimario.js — O BOTAO QUE ACENDE
//
// Padrao 6 dos 16 da mentoria, copiado do Heat Game: o botao nasce apagado
// (cinza translucido, intocavel) e ACENDE em colores.hilo no instante exato em
// que a resposta fica valida. A transicao de cor E a mensagem — por isso o app
// nao tem, e nao deve ter, nenhum texto de erro embaixo de campo: a usuaria
// nunca le "campo obrigatorio", ela VE o botao ligar. Zero duvida sobre onde tocar.
//
// Quem decide se acende e sempre a tela, via `habilitado` (tipicamente
// preguntas.esValida(...) ou preguntas.onboardingCompleto(...)). Este arquivo
// nao conhece regra de negocio nenhuma: ele so pinta o estado que recebe.
//
// REGRAS DO PROJETO QUE ESTE ARQUIVO CUMPRE
//  · Regra 8 — toda cor sai de theme.js. Aqui nao existe um unico hex nem um
//    unico rgba() escrito na mao: o cinza translucido do estado apagado e
//    colores.bordeSuave (ceniza a 22%), que ja vem derivado do tema.
//  · Regra 9 — colores.hilo nunca e cor de TEXTO. Ele entra como FUNDO do botao,
//    e sobre ele o rotulo em colores.papel da 5,0:1 (passa AA). O texto e SEMPRE
//    papel (nunca branco puro), nas duas variantes e nos dois estados.
//  · O estado pressed usa colores.nudo — o no do fio, hilo escurecido.
//
// ACESSIBILIDADE
//  · accessibilityRole="button" e accessibilityState {disabled, busy}.
//  · `disabled` e `accessibilityState.disabled` andam juntos de proposito: o
//    Pressable do React Native sobrescreve o state com a prop `disabled` quando
//    ela e passada, entao os dois sao calculados do mesmo booleano e nunca
//    divergem para o leitor de tela.
//  · O movimento respeita useReducedMotion. O hook devolve `null` enquanto a
//    consulta ao sistema nao voltou (nativo); tratamos null como "sem movimento",
//    exatamente como o proprio hook manda — ninguem leva um frame animado antes
//    de sabermos a preferencia real.
//
// A cor e animada com Animated do core (useNativeDriver: false — backgroundColor
// e borderColor nao existem no driver nativo, so opacity e transform).

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';

import useReducedMotion from '../../hooks/useReducedMotion';
import { colores, espacio, radio, sombra, tipo } from '../theme';

/** Altura minima de alvo de toque confortavel, travada pelo contrato do design. */
const ALTURA_MINIMA = 52;

/** Acender demora um pouco mais do que apagar: ligar e a recompensa, apagar e correcao. */
const DURACION_ENCENDER = 220;
const DURACION_APAGAR = 140;

/** Rotulo apagado nao muda de cor (segue papel) — perde presenca, nao legibilidade. */
const OPACIDAD_APAGADA = 0.55;

/**
 * As duas variantes, ja resolvidas em tokens.
 *  solido   — a acao principal da tela. Apagado: cinza translucido. Aceso: hilo cheio.
 *  fantasma — a acao secundaria ("ahora no", "volver"). Fundo sempre transparente;
 *             quem acende e a borda, de bordeSuave para bordeHilo.
 *
 * O fundo do fantasma NAO passa pelo Animated porque nao muda: interpolar
 * transparente para transparente so criaria um no animado que recalcula a cada
 * frame para devolver sempre o mesmo valor. Quem carrega a animacao la e a borda.
 *
 * Os pares que SAO interpolados misturam rgba() e hex de proposito, e isso e
 * seguro: o Animated normaliza cada ponta com normalizeColor antes de interpolar
 * (verificado contra o algoritmo real do RN — 'rgba(140, 128, 121, 0.22)' com
 * '#C1121F' aterrissa exatamente em rgba(193, 18, 31, 1) no 1.0).
 */
const VARIANTES = Object.freeze({
  solido: Object.freeze({
    fondoApagado: colores.bordeSuave,
    fondoEncendido: colores.hilo,
    bordeApagado: colores.bordeSuave,
    bordeEncendido: colores.hilo,
    animaFondo: true,
    halo: true,
  }),
  fantasma: Object.freeze({
    fondoApagado: colores.transparente,
    fondoEncendido: colores.transparente,
    bordeApagado: colores.bordeSuave,
    bordeEncendido: colores.bordeHilo,
    animaFondo: false,
    halo: false,
  }),
});

export function BotonPrimario({
  titulo,
  onPress,
  habilitado = true,
  cargando = false,
  variante = 'solido',
  style,
}) {
  const paleta = VARIANTES[variante] || VARIANTES.solido;

  // Aceso e uma coisa; tocavel e outra. Enquanto `cargando`, o botao continua
  // ACESO (ele esta trabalhando, nao esta desligado) mas para de aceitar toque,
  // que e o que impede o toque duplo em "generar la tirada".
  const encendido = habilitado === true;
  const interactivo = encendido && cargando !== true;

  const [presionado, setPresionado] = useState(false);
  const reducirMovimiento = useReducedMotion();
  // null (ainda nao sabemos) conta como "reduzido": nunca animar no escuro.
  const sinMovimiento = reducirMovimiento !== false;

  // 0 = apagado, 1 = aceso. Nasce ja no valor certo, entao a primeira pintura
  // nunca mostra o botao ligando sozinho.
  const brillo = useRef(new Animated.Value(encendido ? 1 : 0)).current;

  useEffect(() => {
    const destino = encendido ? 1 : 0;

    if (sinMovimiento) {
      brillo.setValue(destino);
      return undefined;
    }

    const animacion = Animated.timing(brillo, {
      toValue: destino,
      duration: encendido ? DURACION_ENCENDER : DURACION_APAGAR,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    });

    animacion.start();
    return () => animacion.stop();
  }, [brillo, encendido, sinMovimiento]);

  const fondoAnimado = useMemo(
    () =>
      paleta.animaFondo
        ? brillo.interpolate({
            inputRange: [0, 1],
            outputRange: [paleta.fondoApagado, paleta.fondoEncendido],
          })
        : paleta.fondoApagado,
    [brillo, paleta]
  );

  const bordeAnimado = useMemo(
    () =>
      brillo.interpolate({
        inputRange: [0, 1],
        outputRange: [paleta.bordeApagado, paleta.bordeEncendido],
      }),
    [brillo, paleta]
  );

  const opacidadRotulo = useMemo(
    () =>
      brillo.interpolate({
        inputRange: [0, 1],
        outputRange: [OPACIDAD_APAGADA, 1],
      }),
    [brillo]
  );

  const manejarPress = useCallback(
    (evento) => {
      if (!interactivo) return;
      if (typeof onPress === 'function') onPress(evento);
    },
    [interactivo, onPress]
  );

  const alPresionar = useCallback(() => setPresionado(true), []);
  const alSoltar = useCallback(() => setPresionado(false), []);

  // Pressed vence a animacao: enquanto o dedo esta em cima, fundo e borda sao
  // nudo solido. So vale quando o botao aceita toque — botao apagado nao reage.
  const enPresion = presionado && interactivo;

  return (
    <Pressable
      onPress={manejarPress}
      onPressIn={alPresionar}
      onPressOut={alSoltar}
      disabled={!interactivo}
      accessibilityRole="button"
      accessibilityState={{ disabled: !interactivo, busy: cargando === true }}
      accessibilityLabel={titulo}
      style={[estilos.toque, style]}
    >
      <Animated.View
        style={[
          estilos.caja,
          paleta.halo && encendido ? sombra.halo : sombra.ninguna,
          {
            backgroundColor: enPresion ? colores.nudo : fondoAnimado,
            borderColor: enPresion ? colores.nudo : bordeAnimado,
          },
        ]}
      >
        <Animated.View style={[estilos.contenido, { opacity: opacidadRotulo }]}>
          {cargando === true ? (
            <ActivityIndicator
              size="small"
              color={colores.papel}
              style={estilos.girador}
            />
          ) : null}
          <Text style={estilos.rotulo}>{titulo}</Text>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  // A area de toque e a casca externa: e ela que recebe o `style` da tela
  // (margens, alinhamento, largura) sem mexer na geometria da pilula.
  toque: {
    alignSelf: 'stretch',
  },
  caja: {
    minHeight: ALTURA_MINIMA,
    borderRadius: radio.lg,
    borderWidth: 1,
    paddingHorizontal: espacio.xl,
    paddingVertical: espacio.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contenido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  girador: {
    marginRight: espacio.sm,
  },
  // tipo.rotulo ja traz Inter 600, caixa alta, tracking 1.2 e color papel.
  rotulo: {
    ...tipo.rotulo,
    textAlign: 'center',
  },
});

export default BotonPrimario;
