// components/ContadorAnio.js — O SUBSTITUTO HONESTO DO "EITA! 92%".
//
// ===========================================================================
// O QUE ESTE COMPONENTE E
// ===========================================================================
// No Heat Game, depois de raspar a carta aparece um numero subindo de 50 ate
// 92 com "% dos usuarios" atras. Aquele numero e inventado: nao existe
// medicao, nao existe usuario contado. O movimento e otimo; o dado e mentira.
//
// Aqui o MESMO movimento sobe ate um ANO REAL — o `anios` de datos/hechos.js,
// que por invariante testada aparece textualmente dentro da `fuente` impressa
// logo abaixo. A surpresa continua; ela so passa a ser conferivel.
//
// Por isso este arquivo nunca pode ganhar: sufixo '%', formatacao de milhar,
// numero sem fonte ao lado, ou qualquer valor que nao venha de hechos.js.
// Ele anima UM ANO. Regra 2 do produto vive ou morre aqui.
//
// ===========================================================================
// POR QUE useNativeDriver: false — nao e descuido, e a unica opcao
// ===========================================================================
// O driver nativo so sabe mexer em propriedades de layout/transform do lado
// nativo. Este valor vira TEXTO (o filho do <Text>), e texto so pode ser
// escrito pelo JS. Com useNativeDriver: true o listener abaixo nem seria
// chamado e o numero ficaria congelado em 0. Sao ~84 frames de setState em
// 1400ms, uma vez por leitura — custo aceitavel e medido.
//
// ===========================================================================
// MOVIMENTO REDUZIDO — as tres respostas do hook
// ===========================================================================
// useReducedMotion() devolve true | false | null. O `null` e a janela em que
// ainda nao sabemos (no nativo a consulta ao sistema e assincrona; no web ja
// nasce booleano). Nessa janela NAO animamos e NAO mostramos o valor final:
// mostramos 0, que e exatamente onde a animacao comecaria. Assim:
//   · resolveu false → conta de 0 ate o ano, sem salto;
//   · resolveu true  → crava o ano direto (um frame de "0" no pior caso);
//   · web            → ja nasce resolvido, nao ha janela nenhuma.
// A alternativa (mostrar o ano durante o `null`) faria o numero CAIR de 1911
// para 0 e subir de novo — pior que o flash de um frame.
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text } from 'react-native';

import useReducedMotion from '../../hooks/useReducedMotion';
import { colores, familias } from '../theme';

/** Duracao da contagem. ~1400ms: longo o bastante para o olho pegar o
 *  movimento, curto o bastante para nao segurar a leitura. */
export const DURACION_MS = 1400;

/** Corpo do numero. E o maior tipo do app de proposito: ele e o evento. */
export const TAMANO_ANIO = 64;

const estilos = StyleSheet.create({
  anio: {
    fontFamily: familias.displayNegrita, // Cormorant Garamond 700
    fontSize: TAMANO_ANIO,
    // Cormorant tem ascendente alta; 1.13 evita corte no topo em Android.
    lineHeight: 72,
    letterSpacing: 0,
    color: colores.aguja, // 8,3:1 sobre noche (AAA). Nunca colores.hilo: regra 9.
    // Numerais de largura fixa. Sem isto o "1" e mais estreito que o "8" e o
    // numero inteiro treme de largura a cada frame da contagem.
    fontVariant: ['tabular-nums'],
    // Android reserva um respiro extra acima/abaixo da linha que desalinha
    // display grande. Aplicado so onde existe, para nao gerar
    // "Unsupported style property" no react-native-web.
    ...Platform.select({ android: { includeFontPadding: false }, default: null }),
  },
});

/**
 * Contador que anima de 0 ate um ano verificavel.
 *
 * @param {object} props
 * @param {number} props.hasta   Ano de destino (o `anios` de um Hecho).
 * @param {string} [props.sufijo] Cauda opcional colada ao numero.
 * @param {any}    [props.style]  Estilo do chamador; vence o estilo base.
 */
export function ContadorAnio({ hasta, sufijo, style }) {
  // Aceita numero ou string numerica; qualquer outra coisa vira null e o
  // componente some. Nao existe "ano de enchimento" — sem dado, sem bloco.
  const bruto = typeof hasta === 'string' && hasta.trim() !== '' ? Number(hasta) : hasta;
  const destino = typeof bruto === 'number' && Number.isFinite(bruto) ? Math.round(bruto) : null;
  const cola = typeof sufijo === 'string' ? sufijo : '';

  const movimientoReducido = useReducedMotion();

  // Um unico Animated.Value por instancia, criado na primeira renderizacao.
  const valor = useRef(new Animated.Value(0)).current;

  // Ultimo inteiro que foi para a tela. Evita re-render quando dois frames
  // seguidos arredondam para o mesmo numero (acontece em intervalos curtos).
  const ultimo = useRef(0);

  const [mostrado, setMostrado] = useState(() => (movimientoReducido === true ? destino ?? 0 : 0));

  useEffect(() => {
    // Sem destino nao ha o que animar.
    if (destino === null) return undefined;

    // Janela de indefinicao: nao anima e nao crava. Ver cabecalho.
    if (movimientoReducido === null) return undefined;

    // Movimento reduzido: o valor final, sem nenhum frame de transicao.
    if (movimientoReducido === true) {
      valor.stopAnimation();
      valor.setValue(destino);
      ultimo.current = destino;
      setMostrado(destino);
      return undefined;
    }

    let activo = true;

    valor.stopAnimation();
    valor.setValue(0);
    ultimo.current = 0;
    setMostrado(0);

    const idListener = valor.addListener(({ value }) => {
      if (!activo) return;
      const entero = Math.round(value);
      if (entero === ultimo.current) return;
      ultimo.current = entero;
      setMostrado(entero);
    });

    const animacion = Animated.timing(valor, {
      toValue: destino,
      duration: DURACION_MS,
      // Sai rapido e desacelera na chegada: o ano "assenta" em vez de bater.
      easing: Easing.out(Easing.cubic),
      // Obrigatorio false — o valor e impresso como texto (ver cabecalho).
      useNativeDriver: false,
    });

    animacion.start(({ finished }) => {
      // Garante a aterrissagem exata no ano mesmo com arredondamento de float.
      if (!activo || !finished) return;
      ultimo.current = destino;
      setMostrado(destino);
    });

    // Desmontou (ou trocou de carta) no meio da contagem: para o timing,
    // solta o listener e zera qualquer animacao pendente no valor.
    return () => {
      activo = false;
      animacion.stop();
      valor.removeListener(idListener);
      valor.stopAnimation();
    };
  }, [destino, movimientoReducido, valor]);

  if (destino === null) return null;

  const final = `${destino}${cola}`;

  return (
    <Text
      style={[estilos.anio, style]}
      accessibilityRole="text"
      // O leitor de tela anuncia o ano final, nao os 84 estados do caminho.
      accessibilityLabel={final}
    >
      {`${mostrado}${cola}`}
    </Text>
  );
}

export default ContadorAnio;
