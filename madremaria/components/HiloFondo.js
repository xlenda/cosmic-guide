// Fio Vermelho — HiloFondo: o fundo de marca de toda tela escura.
//
// Tres camadas de luz e uma de marca, nesta ordem exata (de tras para a frente):
//   1. noche      — o vazio. Pintado pela propria View, para que nao exista um frame
//                   claro entre montar e medir.
//   2. halo       — nudo saindo do topo-centro e morrendo em ~55% da altura. E a luz
//                   da vela que a usuaria acendeu; entra por cima, nunca por baixo.
//   3. vinheta    — noche voltando pelas bordas. Fecha a moldura e empurra o olho
//                   para o centro, onde vive o texto da leitura.
//   4. o FIO      — 2px em colores.hilo (mais um resplandor largo em nudo).
//
// REGRA DE MARCA, TRAVADA: o fio NUNCA tem ponta visivel dentro da tela.
// Ponta sugere fim, fim sugere desfecho, e este produto nao promete desfecho
// (regra 1 do contrato). Por isso toda curva de CURVAS_HILO comeca em x < 0 e
// termina em x > 1 (fracoes da largura): os dois cortes caem fora do viewport do
// <Svg>, que recorta, e o que se ve e sempre uma travessia de borda a borda.
// Tambem por isso o fio e desenhado DEPOIS da vinheta: se a vinheta passasse por
// cima, o traco apagaria antes da borda e o olho leria esse apagamento como ponta.
//
// Componente puramente decorativo e estatico: sem animacao, sem estado de negocio,
// sem toque. Nao aceita children de proposito — ele e uma camada, nao um invólucro:
// como tem pointerEvents 'none', qualquer filho ficaria intocavel. O uso e sempre:
//
//   <View style={{ flex: 1 }}>
//     <HiloFondo variante="tenso" />
//     ...conteudo da tela...
//   </View>
//
// Regra 8 do contrato: nenhum hex literal aqui. Toda cor sai de theme.js, e o que
// varia e apenas o alfa do <Stop>, que e opacidade e nao cor nova.

import { useCallback, useId, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colores } from '../theme';

/* ===================================================================================
   O FIO — geometria
   Coordenadas normalizadas: x e fracao da largura, y e fracao da altura. Sao
   multiplicadas pela medida real no trazoHilo(), entao a curva acompanha qualquer
   tela sem distorcer a espessura do traco (o <Svg> usa o espaco do usuario em dp).

   INVARIANTE TESTAVEL: em toda variante, entrada[0] < 0 e o x do ultimo `fin` > 1.
   Quem mexer nestes numeros mantem isso, ou a ponta aparece e a marca quebra.

   As duas variantes mudam SO a curvatura — nunca cor, espessura ou opacidade:
   quieto = uma respiracao longa (excursao vertical ~0,31 da altura);
   tenso  = a mesma linha puxada nas duas pontas (excursao ~0,78), diagonal e inquieta.

   Os pontos de emenda sao C1-continuos de proposito: o vetor que chega ao `fin` do
   primeiro tramo e igual ao que sai dele para o c1 do segundo. Sem isso a emenda
   vira um bico no meio da tela — outro jeito de o olho ver "fim".
   =================================================================================== */
export const VARIANTE_POR_DEFECTO = 'quieto';

export const CURVAS_HILO = Object.freeze({
  quieto: Object.freeze({
    entrada: Object.freeze([-0.12, 0.34]),
    tramos: Object.freeze([
      Object.freeze({
        c1: Object.freeze([0.16, 0.34]),
        c2: Object.freeze([0.28, 0.63]),
        fin: Object.freeze([0.5, 0.645]),
      }),
      Object.freeze({
        c1: Object.freeze([0.72, 0.66]),
        c2: Object.freeze([0.84, 0.36]),
        fin: Object.freeze([1.12, 0.335]),
      }),
    ]),
  }),
  tenso: Object.freeze({
    entrada: Object.freeze([-0.12, 0.14]),
    tramos: Object.freeze([
      Object.freeze({
        c1: Object.freeze([0.18, 0.2]),
        c2: Object.freeze([0.2, 0.6]),
        fin: Object.freeze([0.46, 0.615]),
      }),
      Object.freeze({
        c1: Object.freeze([0.72, 0.63]),
        c2: Object.freeze([0.74, 0.9]),
        fin: Object.freeze([1.12, 0.92]),
      }),
    ]),
  }),
});

export const VARIANTES_HILO = Object.freeze(Object.keys(CURVAS_HILO));

/* Espessuras e alfas. Ficam fora do componente porque nao dependem de props nem de
   medida: sao constantes de marca, iguais nas duas variantes. */
export const GROSOR_HILO = 2; // o traco pedido: 2px de colores.hilo
const GROSOR_RESPLANDOR = 8; // o mesmo fio, borrado em nudo, para o traco nao ficar chapado
const OPACIDAD_HILO = 0.8; // fundo nao compete com o texto da leitura
const OPACIDAD_RESPLANDOR = 0.3;

const ALTURA_HALO = 0.55; // "cobrindo ~55% da altura", contado do topo
const ANCHURA_HALO = 0.85;
const RADIO_VINETA_X = 0.75;
const RADIO_VINETA_Y = 0.72;

const redondear = (n) => Math.round(n * 100) / 100;

/**
 * Monta o atributo `d` do fio para uma medida real.
 * Devolve '' quando a medida ainda nao chegou (ou e invalida) — o chamador entende
 * string vazia como "nao ha o que desenhar" e nao renderiza <Path> nenhum.
 * Variante desconhecida cai em VARIANTE_POR_DEFECTO: um fundo nunca deve sumir por
 * causa de uma prop digitada errado.
 */
export function trazoHilo(variante, ancho, alto) {
  if (![ancho, alto].every(Number.isFinite) || ancho <= 0 || alto <= 0) return '';

  const curva = CURVAS_HILO[variante] || CURVAS_HILO[VARIANTE_POR_DEFECTO];
  const punto = ([x, y]) => `${redondear(x * ancho)} ${redondear(y * alto)}`;
  const tramos = curva.tramos
    .map((tramo) => `C ${punto(tramo.c1)} ${punto(tramo.c2)} ${punto(tramo.fin)}`)
    .join(' ');

  return `M ${punto(curva.entrada)} ${tramos}`;
}

const estilos = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colores.noche,
    overflow: 'hidden',
  },
});

/**
 * @param {object} props
 * @param {'quieto'|'tenso'} [props.variante] muda SO a curvatura do fio
 * @param {object} [props.style] posicionamento extra; por padrao preenche o pai
 * @param {string} [props.testID]
 */
export function HiloFondo({ variante = VARIANTE_POR_DEFECTO, style, testID }) {
  const [medida, setMedida] = useState({ ancho: 0, alto: 0 });

  // A medida e arredondada para dp inteiro antes de virar estado: o layout pode
  // reenviar fracoes minimamente diferentes a cada frame (rotacao, teclado, barra
  // do navegador) e cada uma dessas seria um re-render inutil de tres gradientes.
  const medir = useCallback((evento) => {
    const { width, height } = evento.nativeEvent.layout;
    const ancho = Math.round(width);
    const alto = Math.round(height);
    setMedida((anterior) =>
      anterior.ancho === ancho && anterior.alto === alto ? anterior : { ancho, alto }
    );
  }, []);

  const { ancho, alto } = medida;
  const trazo = useMemo(() => trazoHilo(variante, ancho, alto), [variante, ancho, alto]);

  // Na web os ids de <Defs> vivem no documento inteiro: duas telas montadas ao mesmo
  // tempo (uma saindo, outra entrando na transicao do stack) colidiriam e a segunda
  // roubaria o gradiente da primeira. useId da um sufixo estavel por instancia; os
  // caracteres que o React usa como cerca (':') sao removidos porque entram num url(#...).
  const semilla = useId().replace(/[^a-zA-Z0-9]/g, '') || 'unico';
  const idHalo = `hilofondo-halo-${semilla}`;
  const idVineta = `hilofondo-vineta-${semilla}`;

  return (
    <View
      testID={testID}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      collapsable={false}
      onLayout={medir}
      style={[estilos.base, style]}
    >
      {trazo ? (
        <Svg width={ancho} height={alto}>
          <Defs>
            {/* Halo: elipse achatada nascendo no topo-centro (cy=0), larga em x e
                morta em ~55% da altura. userSpaceOnUse porque os raios ja vem em dp
                medidos — evita depender de como cada plataforma estica um
                objectBoundingBox. */}
            <RadialGradient
              id={idHalo}
              gradientUnits="userSpaceOnUse"
              cx={ancho / 2}
              cy={0}
              rx={ancho * ANCHURA_HALO}
              ry={alto * ALTURA_HALO}
            >
              <Stop offset="0" stopColor={colores.nudo} stopOpacity={0.55} />
              <Stop offset="0.55" stopColor={colores.nudo} stopOpacity={0.18} />
              {/* Some pelo alfa e nao por colores.transparente: 'transparent' e um
                  preto com alfa 0 e deixaria uma franja cinza no meio do degrade. */}
              <Stop offset="1" stopColor={colores.nudo} stopOpacity={0} />
            </RadialGradient>

            {/* Vinheta: o inverso — clara (alfa 0) no centro, noche cheia no canto.
                Com estes raios o canto cai em ~0,96 do degrade, entao a moldura
                fecha de verdade em vez de parar num cinza. */}
            <RadialGradient
              id={idVineta}
              gradientUnits="userSpaceOnUse"
              cx={ancho / 2}
              cy={alto / 2}
              rx={ancho * RADIO_VINETA_X}
              ry={alto * RADIO_VINETA_Y}
            >
              <Stop offset="0.55" stopColor={colores.noche} stopOpacity={0} />
              <Stop offset="0.82" stopColor={colores.noche} stopOpacity={0.42} />
              <Stop offset="1" stopColor={colores.noche} stopOpacity={0.92} />
            </RadialGradient>
          </Defs>

          <Rect x={0} y={0} width={ancho} height={alto} fill={`url(#${idHalo})`} />
          <Rect x={0} y={0} width={ancho} height={alto} fill={`url(#${idVineta})`} />

          {/* O fio, em duas passadas do MESMO `d`: primeiro o resplandor largo,
              depois o traco. Os dois herdam a invariante da geometria — os cortes
              estao fora do viewport, entao nenhuma tampa aparece na tela. */}
          <Path
            d={trazo}
            fill="none"
            stroke={colores.nudo}
            strokeWidth={GROSOR_RESPLANDOR}
            strokeOpacity={OPACIDAD_RESPLANDOR}
            strokeLinecap="round"
          />
          <Path
            d={trazo}
            fill="none"
            stroke={colores.hilo}
            strokeWidth={GROSOR_HILO}
            strokeOpacity={OPACIDAD_HILO}
            strokeLinecap="round"
          />
        </Svg>
      ) : null}
    </View>
  );
}

export default HiloFondo;
