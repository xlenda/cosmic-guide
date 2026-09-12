// components/ScratchRevealCard.js — O CORACAO DO PRODUTO.
//
// ===========================================================================
// O QUE ELE E
// ===========================================================================
// A carta ja nasce por baixo do veu: `children` esta montado e pintado desde o
// primeiro frame. O que cobre a carta e uma lamina de metal desenhada em SVG,
// e o dedo nao "apaga blocos" — ele risca um traco continuo e arredondado que
// vira o buraco de uma mascara de luminancia. Por isso o gesto parece raspagem
// de verdade e nao uma grade de quadradinhos acendendo.
//
// A grade 41x68 (lib/scratchReveal.js) existe so para MEDIR quanto ja saiu.
// Ela nunca e desenhada. Sao duas camadas independentes de proposito:
//   · o que a usuaria VE   = o traco SVG recortado da mascara;
//   · o que o app SABE     = as celulas marcadas no Set de medicao.
// Trocar uma pela outra e o erro classico: medir por pixel fica caro, e
// desenhar pela grade fica robotico.
//
// ===========================================================================
// O QUE MUDOU NA PORTABILIDADE PARA O FIO VERMELHO (tres coisas, so tres)
// ===========================================================================
// 1. PALETA — o veu era dourado. Aqui ele e `colores.foil`: metal frio, quase
//    roxo-fumaca, para o vermelho do fio nao ter concorrente na tela. Os tres
//    degraus do gradiente 135deg e a banda especular NASCEM do proprio
//    `colorFoil` por deslocamento de canal (ver bloco PALETA DO VELO abaixo).
//    Nenhum literal de cor entra neste arquivo: regra 8 do produto.
// 2. ICONE — a dica era uma digital vinda do pacote de icones do Expo. Virou
//    um traco de fio desenhado a mao em react-native-svg. Isso zera a ultima
//    dependencia opcional do componente: aquele pacote nao esta declarado no
//    package.json (vem de carona com o expo) e o fio e a marca, nao a digital.
// 3. `colorFoil` — o original recebia uma prop de cor de tema que NUNCA era
//    desestruturada: o consumidor passava, o componente ignorava calado, e a
//    cor continuava a mesma. Aqui a prop existe de verdade e move o metal.
//
// ===========================================================================
// O QUE NAO PODE SER TOCADO (foi tudo preservado do original, item a item)
// ===========================================================================
// · Gesture.Pan().runOnJS(true) com minDistance 4 — nunca voltar ao antigo
//   responder de toque do React Native: no web ele perde o pointer capture e
//   o traco corta no meio do movimento.
// · A mascara SVG com maskType="luminance" — sem isso o Android ignora o
//   recorte e o veu fica inteiro.
// · A grade 41x68 medindo a area real (layoutRef alimentado pelo onLayout).
// · Os tres estagios de haptico (start / texture / complete) com caminho
//   nativo Android e fallback iOS, e Promise.resolve() imediato no web.
// · As duas travas anti-rajada do `texture`: degrau monotonico E janela de
//   90ms. Uma so nao basta — ver comentario em scratchAt.
// · O batching por requestAnimationFrame com fallback setTimeout(16).
// · O descarte de ponto abaixo de 4dp.
// · O progressbar invisivel de 1x1 com accessibilityLiveRegion="polite".
// · O Pressable de fallback com minHeight 44 (alvo minimo de toque).
// · onReveal disparando SO depois do fade e SO se ainda estiver montado.
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Mask,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import useReducedMotion from '../../hooks/useReducedMotion';
import {
  SCRATCH_BRUSH_RADIUS,
  SCRATCH_COLUMNS,
  SCRATCH_HAPTIC_PROGRESS_STEP,
  SCRATCH_REVEAL_PROGRESS,
  SCRATCH_ROWS,
  createScratchSvgIdBase,
  scratchHapticMilestone,
  scratchIndexesAlongSegment,
  scratchProgress,
} from '../lib/scratchReveal';
import { colores, espacio, radio, tipo } from '../theme';

/* AS DUAS ORIGENS DE UMA CARTA ABERTA, e por que elas precisam de nome.
 *
 * Ate 31/08 `onReveal` era chamado sem argumento nos DOIS caminhos, e a tela
 * ficava sem como saber se a carta abriu pelo dedo ou pelo botao. lib/missoes.js
 * afirmava no comentario que "o ScratchRevealCard ja distingue raspar de tocar
 * (existe o atalho 'scratch.tap')" — a existencia do BOTAO nao e a existencia da
 * MEDICAO, e a missao "raspe as tres com o dedo" era, na pratica, impossivel de
 * verificar: fechava igual para quem pulou as tres.
 *
 * Sao chave tecnica, nao texto de tela: nunca sao impressas. */
/** O dedo cruzou SCRATCH_REVEAL_PROGRESS. */
export const ORIGEN_RASPADO = 'raspado';
/** A carta abriu pelo botao "revelar sem raspar" (o caminho de acessibilidade). */
export const ORIGEN_ATALHO = 'atalho';

/** Movimento minimo, em dp, para o ponto entrar no traco. Abaixo disso o dedo
 *  parado gera dezenas de pontos identicos e o `d` do Path cresce sem limite. */
const MIN_PATH_POINT_DISTANCE = 4;

/** Piso de tempo entre dois pulsos de textura. Ver as duas travas em scratchAt. */
const HAPTIC_MIN_INTERVAL_MS = 90;

const enDesarrollo = typeof __DEV__ !== 'undefined' && __DEV__;

/** Lado do circulo da dica e do traco de fio dentro dele. Geometria, nao espaco. */
export const TAMANO_ORBITA = 64;
export const TAMANO_HILO = 30;

/** Canais da mascara. NAO sao cor de interface: sao os dois extremos de
 *  luminancia que dizem "aqui o veu fica" (branco) e "aqui o veu sai" (preto).
 *  Por isso nao saem de theme.js — trocar por um token de paleta quebraria o
 *  recorte, porque a mascara le brilho, nao cor. */
const MASCARA_OPACA = 'white';
const MASCARA_ABIERTA = 'black';

/* ===========================================================================
   maskType — a prop que so pode existir no NATIVO. Nao "limpar" este objeto.
   ===========================================================================
   No nativo (react-native-svg -> RNSVGMask) `maskType="luminance"` e OBRIGATORIO:
   sem ele o Android trata a mascara como alpha, o traco preto do dedo nao recorta
   nada e a raspadinha vira um veu que nao abre — falha muda, sem erro no console.

   Na WEB o react-native-svg renderiza <mask> nativo do DOM, e o React repassa as
   props desconhecidas como atributos. `maskType` em camelCase nao e atributo de
   DOM valido (o atributo SVG e `mask-type`, e a propriedade de estilo e
   `mask-type`/`maskType` em CSS), entao o React IGNORA a prop e imprime, a cada
   montagem de carta:
     "React does not recognize the `maskType` prop on a DOM element..."
   Medido no navegador: o <mask> do DOM ja nasce com mask-type: luminance — que e
   o valor INICIAL da propriedade CSS `mask-type` pela especificacao (CSS Masking
   Level 1). Ou seja, o atributo ignorado nao muda o recorte na web; o unico dano
   e o console poluido, e console poluido esconde erro de verdade.

   Por isso a prop entra SO onde ela vale. Spread de objeto e nao `maskType={...}`
   porque passar `undefined` ainda conta como prop presente para o React e o aviso
   voltaria igual — a prop tem de nao existir no elemento. */
const PROPS_MASCARA_LUMINANCIA = Platform.OS === 'web' ? {} : { maskType: 'luminance' };

/* ===========================================================================
   PALETA DO VELO — tudo derivado, nada literal
   ===========================================================================
   O veu e a unica superficie do app que nao usa um token de cor pronto: ele
   precisa de tres degraus do MESMO metal (realce, corpo, sombra) mais a banda
   especular. Em vez de escrever quatro cores na mao — o que a regra 8 proibe e
   o que deixaria a prop `colorFoil` decorativa — os quatro nascem de
   `colorFoil` por deslocamento de canal.

   Com o padrao (colores.foil) o resultado e exatamente o metal especificado:
     realce     = foil + (28, 23, 24)
     corpo      = foil
     sombra     = foil + (-16, -13, -14)
     especular  = foil + (152, 152, 152), aplicado com alfa 0,28

   Os deslocamentos NAO sao iguais nos tres canais de proposito: metal nao e
   cinza neutro. No realce ele puxa para o vermelho (+28 no R contra +23 no G)
   e na sombra afunda tambem pelo vermelho (-16 no R contra -13 no G) — e o R
   ter a maior excursao que faz a lamina parecer quente sob a luz e morta na
   dobra. A especular e a unica que sobe os tres canais junto, porque luz
   branca refletida nao tem matiz.
   =========================================================================== */
const CANAL_MAX = 255;
const REALCE = Object.freeze([28, 23, 24]);
const SOMBRA_METAL = Object.freeze([-16, -13, -14]);
const ESPECULAR = Object.freeze([152, 152, 152]);
const ALFA_ESPECULAR = 0.28;

// O `#` destes padroes e o do proprio formato, nao uma cor: eles LEEM a cor que
// veio de theme.js (ou da prop) para poder desloca-la.
const RE_HEX_CORTO = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/i;
const RE_HEX_LARGO = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const RE_FUNCIONAL = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i;

const recortar = (valor) => Math.max(0, Math.min(CANAL_MAX, Math.round(valor)));

/** Le uma cor em hex de 3 ou 6 digitos, `rgb(...)` ou `rgba(...)` e devolve os
 *  tres canais. Qualquer outra coisa (nome CSS, gradiente, lixo) devolve null —
 *  o chamador cai no metal padrao em vez de inventar uma cor. */
function aCanales(color) {
  if (typeof color !== 'string') return null;
  const texto = color.trim();

  const corto = RE_HEX_CORTO.exec(texto);
  if (corto) return [1, 2, 3].map((i) => parseInt(`${corto[i]}${corto[i]}`, 16));

  const largo = RE_HEX_LARGO.exec(texto);
  if (largo) return [1, 2, 3].map((i) => parseInt(largo[i], 16));

  const funcional = RE_FUNCIONAL.exec(texto);
  if (funcional) {
    const canales = [1, 2, 3].map((i) => Number(funcional[i]));
    if (!canales.every(Number.isFinite)) return null;
    return canales.map(recortar);
  }

  return null;
}

/** Canais -> string que o react-native-svg entende. Alfa ausente (ou >= 1) sai
 *  opaco: `stopOpacity` continua sendo o lugar certo de graduar dentro do SVG. */
const css = (canales, alfa) => (
  typeof alfa === 'number' && alfa < 1
    ? `rgba(${canales.join(', ')}, ${alfa})`
    : `rgb(${canales.join(', ')})`
);

const desplazar = (canales, deltas) => canales.map((canal, i) => recortar(canal + deltas[i]));

/** Os quatro tons do veu a partir de uma cor de metal. Puro e deterministico:
 *  a mesma entrada devolve sempre a mesma lamina. */
function paletaDeVelo(colorFoil) {
  // colores.foil sempre resolve (theme.js e congelado e valida no teste de tema).
  // O terceiro elo so existe para o parser nunca devolver undefined; com o tema
  // atual ele e inalcancavel.
  const cuerpo = aCanales(colorFoil) || aCanales(colores.foil) || [0, 0, 0];
  return {
    cuerpo,
    realce: desplazar(cuerpo, REALCE),
    sombra: desplazar(cuerpo, SOMBRA_METAL),
    especular: desplazar(cuerpo, ESPECULAR),
  };
}

/* ===========================================================================
   GRAO — a sujeira da lamina
   ===========================================================================
   Sem grao o veu vira um gradiente liso de tela de computador. Sao 13
   particulas em `colores.papel` (o po claro do papel velho) das quais 2 estao
   em `colores.aguja` — 15,4%, o brilho ocasional do latao da agulha no meio da
   poeira. A lista e fixa e nao aleatoria: o veu precisa ser identico entre
   renders, senao o grao pisca a cada frame do gesto.
   =========================================================================== */
const GRANO = Object.freeze([
  Object.freeze({ cx: 5, cy: 7, r: 0.9, opacidad: 0.24 }),
  Object.freeze({ cx: 24, cy: 13, r: 0.6, opacidad: 0.16 }),
  Object.freeze({ cx: 14, cy: 29, r: 0.75, opacidad: 0.2, aguja: true }),
  Object.freeze({ cx: 30, cy: 25, r: 0.55, opacidad: 0.14 }),
  Object.freeze({ cx: 9, cy: 19, r: 0.5, opacidad: 0.12 }),
  Object.freeze({ cx: 19, cy: 4, r: 0.45, opacidad: 0.1 }),
  Object.freeze({ cx: 27, cy: 32, r: 0.7, opacidad: 0.18 }),
  Object.freeze({ cx: 2, cy: 31, r: 0.5, opacidad: 0.13 }),
  Object.freeze({ cx: 33, cy: 8, r: 0.42, opacidad: 0.11 }),
  Object.freeze({ cx: 17, cy: 16, r: 0.62, opacidad: 0.15 }),
  Object.freeze({ cx: 11, cy: 11, r: 0.38, opacidad: 0.09 }),
  Object.freeze({ cx: 22, cy: 22, r: 0.48, opacidad: 0.12, aguja: true }),
  Object.freeze({ cx: 6, cy: 25, r: 0.35, opacidad: 0.08 }),
]);

/* ===========================================================================
   HAPTICO — reforco, nunca requisito
   ===========================================================================
   Web e aparelho com vibracao desligada continuam 100% usaveis e recebem o
   mesmo estado visual e o mesmo resultado. Nada aqui pode virar condicao para
   revelar a carta.
   =========================================================================== */
function hapticPromise(stage) {
  if (Platform.OS === 'web') return Promise.resolve();
  try {
    // Android 14+ tem uma tabela propria de efeitos: Drag_Start para o inicio do
    // arrasto, Segment_Frequent_Tick para a textura e Confirm para o fim. Da uma
    // raspagem muito mais crivel que o impacto generico.
    if (
      Platform.OS === 'android'
      && typeof Haptics.performAndroidHapticsAsync === 'function'
      && Haptics.AndroidHaptics
    ) {
      const androidType = {
        start: Haptics.AndroidHaptics.Drag_Start,
        texture: Haptics.AndroidHaptics.Segment_Frequent_Tick,
        complete: Haptics.AndroidHaptics.Confirm,
      }[stage];
      if (androidType) return Haptics.performAndroidHapticsAsync(androidType);
    }

    // iOS (e Android antigo): o mais proximo de cada estagio.
    if (stage === 'start') return Haptics.selectionAsync();
    if (stage === 'texture') return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    return Promise.resolve();
  }
}

function emitHaptic(stage) {
  Promise.resolve(hapticPromise(stage)).catch(() => {});
}

/* ===========================================================================
   TRAZO DE HILO — o icone da dica, desenhado aqui
   ===========================================================================
   Substitui a digital que vinha do pacote de icones. Um fio que entra por
   baixo a esquerda, da um no no meio e sai por cima a direita. Duas passadas:
   uma escura por baixo (colores.velo) que separa o fio do metal, e a vermelha
   por cima. Sem a passada escura o vermelho do fio sobre o metal do veu perde
   definicao — sao dois tons escuros vizinhos.
   E decorativo: quem anuncia a acao e o progressbar e o botao de fallback.
   =========================================================================== */
const CAMINO_HILO = 'M 3 27 C 9 27, 12 22, 16 18 C 20 14, 12 10, 10 15 C 8 20, 16 22, 20 17 C 23 13, 25 9, 29 6';

function TrazoDeHilo({ size = TAMANO_HILO }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" pointerEvents="none">
      <Path
        d={CAMINO_HILO}
        fill="none"
        stroke={colores.velo}
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d={CAMINO_HILO}
        fill="none"
        stroke={colores.hilo}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* O no: o ponto onde o fio aperta. */}
      <Circle cx={15} cy={16.4} r={1.7} fill={colores.hilo} />
    </Svg>
  );
}

/* ===========================================================================
 * A PINTURA DA LAMINA — uma copia so do metal, usada por dois lugares
 * ===========================================================================
 * Este bloco desenhava direto dentro do ScratchRevealCard. Ele saiu para ca
 * porque a LEITURA DE ENTRADA passou a mostrar SEIS VERSOS numa grade
 * (screens/LeituraDeEntradaScreen.js), e aqueles versos tem de ser o MESMO metal
 * da raspadinha — se fossem um retangulo parecido, desenhado a mao noutro
 * arquivo, a primeira mudanca de cor do foil deixaria a grade e a carta com dois
 * metais diferentes na mesma sessao, sem nada acusar.
 *
 * A UNICA diferenca entre os dois usos e o RECORTE: a raspadinha passa uma
 * mascara (o traco do dedo abre o buraco), e o verso da grade nao passa nada.
 * Por isso `mascara` e um parametro, e nao dois desenhos parecidos.
 *
 * @param {string} idBase      prefixo dos ids de SVG. Eles sao GLOBAIS no
 *   documento na web: dois versos com o mesmo id fariam o segundo usar o
 *   degrade do primeiro. Quem chama gera o seu com createScratchSvgIdBase.
 * @param {object} paleta      saida de paletaDeVelo(cor).
 * @param {object|null} mascara  `{ id, elemento }` — o <Mask> ja montado e o id
 *   com que ele e referenciado. `null` = metal inteiro, sem buraco nenhum.
 */
function PinturaDaLamina({ idBase, paleta, mascara = null }) {
  const foilId = `${idBase}-foil`;
  const sheenId = `${idBase}-sheen`;
  const auraId = `${idBase}-aura`;
  const grainId = `${idBase}-grain`;

  const cuerpoCss = css(paleta.cuerpo);
  const realceCss = css(paleta.realce);
  const sombraCss = css(paleta.sombra);
  const especularCss = css(paleta.especular);

  return (
    <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
      <Defs>
        {/* 135deg: do canto superior esquerdo ao inferior direito. */}
        <LinearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={realceCss} />
          <Stop offset="0.5" stopColor={cuerpoCss} />
          <Stop offset="1" stopColor={sombraCss} />
        </LinearGradient>
        {/* Banda especular: uma faixa estreita de luz atravessando na
            diagonal oposta. E ela que faz a lamina parecer inclinada. */}
        <LinearGradient id={sheenId} x1="0" y1="1" x2="1" y2="0">
          <Stop offset="0" stopColor={especularCss} stopOpacity="0.04" />
          <Stop offset="0.44" stopColor={especularCss} stopOpacity="0.06" />
          <Stop offset="0.5" stopColor={especularCss} stopOpacity={ALFA_ESPECULAR} />
          <Stop offset="0.56" stopColor={especularCss} stopOpacity="0.05" />
          <Stop offset="1" stopColor={especularCss} stopOpacity="0.12" />
        </LinearGradient>
        {/* Aura: clareia o centro e afunda as bordas, para o olho cair
            no meio da carta — que e onde o dedo deve comecar. */}
        <RadialGradient id={auraId} cx="50%" cy="42%" r="70%">
          <Stop offset="0" stopColor={realceCss} stopOpacity="0.22" />
          <Stop offset="0.52" stopColor={especularCss} stopOpacity="0.05" />
          <Stop offset="1" stopColor={sombraCss} stopOpacity="0.4" />
        </RadialGradient>
        {/* Grao: 13 particulas, 2 em colores.aguja (15,4%). */}
        <Pattern id={grainId} width="34" height="34" patternUnits="userSpaceOnUse">
          {GRANO.map((particula) => (
            <Circle
              key={`${particula.cx}-${particula.cy}`}
              cx={particula.cx}
              cy={particula.cy}
              r={particula.r}
              fill={particula.aguja ? colores.aguja : colores.papel}
              opacity={particula.opacidad}
            />
          ))}
          <Path d="M 0 25 L 34 3" stroke={colores.papel} strokeWidth="0.7" opacity="0.035" />
        </Pattern>
        {mascara ? mascara.elemento : null}
      </Defs>
      <G mask={mascara ? `url(#${mascara.id})` : undefined}>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${foilId})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${auraId})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${sheenId})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${grainId})`} />
        {/* Ornamento gravado na lamina: dois aneis e a cruz de mira.
            Tudo em tom do proprio metal — o veu nunca compete com o fio. */}
        <Circle cx="50%" cy="41%" r="18%" fill="none" stroke={especularCss} strokeWidth="1" opacity="0.18" />
        <Circle cx="50%" cy="41%" r="9%" fill="none" stroke={especularCss} strokeWidth="0.8" opacity="0.24" />
        <Line x1="31%" y1="41%" x2="69%" y2="41%" stroke={especularCss} strokeWidth="0.7" opacity="0.16" />
        <Line x1="50%" y1="27%" x2="50%" y2="55%" stroke={especularCss} strokeWidth="0.7" opacity="0.16" />
        <Circle cx="35%" cy="33%" r="1.4" fill={especularCss} opacity="0.42" />
        <Circle cx="66%" cy="48%" r="1.1" fill={especularCss} opacity="0.36" />
        <Rect
          x="2%"
          y="1.25%"
          width="96%"
          height="97.5%"
          rx={radio.lg}
          fill="none"
          stroke={especularCss}
          strokeWidth="1.2"
          opacity="0.26"
        />
      </G>
    </Svg>
  );
}

/**
 * O VERSO DE UMA CARTA — o mesmo metal da raspadinha, sem gesto nenhum.
 *
 * Nao raspa, nao abre, nao escuta o dedo e nao tem botao de atalho: e so a
 * lamina. Quem escuta o toque e quem chama (na leitura de entrada, o Pressable
 * da grade dos seis versos), e por isso ele nasce com `pointerEvents="none"` —
 * um verso que capturasse o toque deixaria o Pressable de fora mudo em silencio.
 *
 * POR QUE ELE NAO E UM ScratchRevealCard SEM GESTO: o veu do ScratchRevealCard
 * desenha, por cima do metal, a dica visivel ("Raspe para revelar") e o botao
 * obrigatorio de "Revelar sem raspar". Numa grade de seis versos aquilo seria
 * seis instrucoes erradas na tela — o gesto ali e tocar, nao raspar — e seis
 * botoes que abririam a carta antes da hora.
 *
 * A DIMENSAO VEM DE QUEM CHAMA, pelo `style` (largura e aspectRatio). Aqui isso
 * nao tem a armadilha de medida zerada que o cabecalho de components/CartaHilo.js
 * descreve: este componente nao mede nada com onLayout — o SVG e 100% x 100% do
 * container. Sem style ele simplesmente nao ocupa espaco, e a falta aparece na
 * primeira vez que alguem abre a tela.
 */
export function VersoDeCarta({ style }) {
  const reactId = useId();
  const idBase = useMemo(() => createScratchSvgIdBase('verso-carta', reactId), [reactId]);
  const paleta = useMemo(() => paletaDeVelo(colores.foil), []);

  return (
    <View pointerEvents="none" style={[estilos.root, estilos.verso, style]}>
      <PinturaDaLamina idBase={idBase} paleta={paleta} />
    </View>
  );
}

/**
 * Carta coberta por uma lamina que a usuaria raspa com o dedo.
 *
 * O componente NAO conhece datos/textos.js: todo texto entra por prop, porque
 * a mesma raspadinha serve a tirada, a sintese e ao paywall com copy diferente.
 *
 * @param {object}   props
 * @param {React.ReactNode} props.children        A carta. Ja montada por baixo do veu.
 * @param {boolean}  [props.revealed]             Verdadeiro = sem veu, sem gesto.
 * @param {Function} [props.onReveal]             Chamado UMA vez, depois do fade, com
 *   a ORIGEM da abertura: ORIGEN_RASPADO quando o dedo cruzou
 *   SCRATCH_REVEAL_PROGRESS, ORIGEN_ATALHO quando a carta abriu pelo botao
 *   "revelar sem raspar". Sem esse argumento nao ha como uma tela distinguir as
 *   duas — e a missao "raspe as tres com o dedo" seria impossivel de verificar.
 * @param {any}      [props.resetKey]             Mudar isto rearma a lamina.
 * @param {string}   [props.scratchLabel]         Dica visivel e rotulo do progressbar.
 * @param {string}   [props.tapLabel]             Texto do botao de fallback.
 * @param {string}   [props.accessibilityLabel]   Rotulo do botao; cai em tapLabel.
 * @param {string}   [props.revealAnnouncement]   Anuncio do leitor de tela ao abrir.
 * @param {string}   [props.colorFoil]            Cor do metal. Padrao colores.foil.
 * @param {string}   [props.testID]
 * @param {any}      [props.style]
 */
export function ScratchRevealCard({
  children,
  revealed,
  onReveal,
  resetKey,
  scratchLabel,
  tapLabel,
  accessibilityLabel,
  revealAnnouncement,
  colorFoil = colores.foil,
  testID,
  style,
}) {
  const reactId = useId();
  const layoutRef = useRef({ width: 0, height: 0 });
  const mountedRef = useRef(true);
  const completedRef = useRef(!!revealed);
  const startedRef = useRef(false);
  const lastPointRef = useRef(null);
  const touchPointRef = useRef(null);
  const hapticMilestoneRef = useRef(0);
  const lastHapticAtRef = useRef(0);
  const clearedRef = useRef(new Set());
  // Trava do aviso de medida zerada: onLayout e o gesto disparam dezenas de
  // vezes: o alerta e util uma vez, nao trezentas.
  const avisoMedidaRef = useRef(false);
  const scratchPathRef = useRef('');
  const renderFrameRef = useRef(null);
  const completionAnimationRef = useRef(null);
  const veilOpacity = useRef(new Animated.Value(revealed ? 0 : 1)).current;
  const [clearedCount, setClearedCount] = useState(0);
  const [scratchPath, setScratchPath] = useState('');
  const [touchPoint, setTouchPoint] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);
  const reducedMotion = useReducedMotion();
  // `null` e a janela em que ainda nao sabemos (consulta assincrona no nativo).
  // Nessa janela tratamos como movimento reduzido: ninguem recebe um primeiro
  // frame animado antes de o sistema responder.
  const motionAllowed = reducedMotion === false;

  // A lamina so e recalculada quando a cor do metal muda.
  const paleta = useMemo(() => paletaDeVelo(colorFoil), [colorFoil]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      completionAnimationRef.current?.stop?.();
      if (renderFrameRef.current === null) return;
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(renderFrameRef.current);
      else clearTimeout(renderFrameRef.current);
    };
  }, []);

  useEffect(() => {
    completedRef.current = !!revealed;
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setCompleting(false);
    setGestureActive(false);
    completionAnimationRef.current?.stop?.();
    completionAnimationRef.current = null;
    veilOpacity.setValue(revealed ? 0 : 1);
    if (!revealed) {
      if (renderFrameRef.current !== null) {
        if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(renderFrameRef.current);
        else clearTimeout(renderFrameRef.current);
        renderFrameRef.current = null;
      }
      startedRef.current = false;
      hapticMilestoneRef.current = 0;
      lastHapticAtRef.current = 0;
      clearedRef.current = new Set();
      scratchPathRef.current = '';
      setClearedCount(0);
      setScratchPath('');
    }
  }, [revealed, resetKey, veilOpacity]);

  // O dedo entrega dezenas de eventos por segundo. Sem este agrupamento por
  // frame, cada um viraria um setState e o traco engasgaria justo no movimento
  // rapido. O fallback de 16ms cobre ambiente sem requestAnimationFrame.
  const scheduleClearedRender = useCallback(() => {
    if (renderFrameRef.current !== null) return;
    const schedule = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (callback) => setTimeout(callback, 16);
    renderFrameRef.current = schedule(() => {
      renderFrameRef.current = null;
      if (!mountedRef.current) return;
      setClearedCount(clearedRef.current.size);
      setScratchPath(scratchPathRef.current);
      setTouchPoint(touchPointRef.current);
    });
  }, []);

  const finish = useCallback((origen = ORIGEN_RASPADO) => {
    if (completedRef.current) return;
    // O default e o raspado porque o caminho do dedo chama `finish()` sem
    // argumento; o botao de fallback passa ORIGEN_ATALHO explicitamente. Nunca
    // encaixar `finish` direto num onPress: o Pressable passaria o evento
    // sintetico como origem e a distincao morreria em silencio.
    const origem = origen === ORIGEN_ATALHO ? ORIGEN_ATALHO : ORIGEN_RASPADO;
    completedRef.current = true;
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setGestureActive(false);
    setCompleting(true);
    emitHaptic('complete');

    const animation = Animated.timing(veilOpacity, {
      toValue: 0,
      duration: motionAllowed ? 360 : 80,
      // No web o driver nativo nao existe para opacity em Animated.View.
      useNativeDriver: Platform.OS !== 'web',
    });
    completionAnimationRef.current = animation;
    animation.start(({ finished }) => {
      completionAnimationRef.current = null;
      // Duas guardas: animacao interrompida no meio nao "revela", e componente
      // desmontado no meio nao chama nada. Sem elas, sair da tela raspando
      // marcava a carta como aberta.
      if (!finished || !mountedRef.current) return;
      if (revealAnnouncement) {
        AccessibilityInfo.announceForAccessibility?.(revealAnnouncement);
      }
      if (typeof onReveal === 'function') onReveal(origem);
    });
  }, [motionAllowed, onReveal, revealAnnouncement, veilOpacity]);

  const scratchAt = useCallback((xValue, yValue) => {
    if (completedRef.current) return;
    const x = Number(xValue);
    const y = Number(yValue);
    if (![x, y].every(Number.isFinite)) return;

    if (!startedRef.current) {
      startedRef.current = true;
      emitHaptic('start');
    }

    // A FALHA MUDA, apanhada no unico instante em que ela e certeza.
    //
    // Sem largura e altura o scratchIndexesAlongSegment devolve [] (ele mesmo
    // barra width <= 0), nenhuma celula entra no Set, o progresso fica cravado
    // em 0 e a carta nunca revela pelo gesto — sem excecao e sem warning.
    //
    // O guarda de components/CartaHilo.js le o STYLE e pega o caso comum, mas
    // nao pega tudo: um `maxWidth: 0`, um pai de largura zero ou um transform
    // degenerado passam pelo style e so aparecem na medida. Aqui a checagem e
    // sobre a MEDIDA REAL, e no momento em que o dedo ja esta na carta — por
    // isso nao ha falso positivo com o layout transitorio do primeiro frame:
    // se ha toque e a medida e zero, a raspagem esta quebrada de fato.
    if (enDesarrollo && !avisoMedidaRef.current) {
      const { width, height } = layoutRef.current;
      if (!(width > 0) || !(height > 0)) {
        avisoMedidaRef.current = true;
        console.error(
          `[ScratchRevealCard] Medida ${width}x${height}: a carta nao tem dimensao e a `
            + 'raspagem NUNCA vai revelar pelo dedo (so pelo botao "revelar sin raspar"). '
            + 'Este componente nao tem dimensao intrinseca: quem o instancia precisa dar '
            + 'largura E altura por style. Use components/CartaHilo.js, que ja passa '
            + 'DIMENSION_CARTA, em vez de instanciar o ScratchRevealCard direto.'
        );
      }
    }

    // Ponto colado no anterior: move o brilho do pincel, mas nao entra no traco.
    const previous = lastPointRef.current;
    if (previous && Math.hypot(x - previous.x, y - previous.y) < MIN_PATH_POINT_DISTANCE) {
      touchPointRef.current = { x, y };
      scheduleClearedRender();
      return;
    }
    const pointToken = `${x.toFixed(1)} ${y.toFixed(1)}`;
    if (previous) {
      scratchPathRef.current = `${scratchPathRef.current} L ${pointToken}`;
    } else {
      // `M p L p` e proposital: um Path so com M nao pinta nada, e o primeiro
      // toque precisa deixar marca mesmo antes do segundo ponto chegar.
      scratchPathRef.current = `${scratchPathRef.current}${scratchPathRef.current ? ' ' : ''}M ${pointToken} L ${pointToken}`;
    }
    const indexes = scratchIndexesAlongSegment({
      fromX: previous?.x,
      fromY: previous?.y,
      toX: x,
      toY: y,
      width: layoutRef.current.width,
      height: layoutRef.current.height,
      columns: SCRATCH_COLUMNS,
      rows: SCRATCH_ROWS,
      brushRadius: SCRATCH_BRUSH_RADIUS,
    });
    lastPointRef.current = { x, y };
    touchPointRef.current = { x, y };
    scheduleClearedRender();
    if (indexes.length === 0) return;

    const next = clearedRef.current;
    const previousSize = next.size;
    indexes.forEach((index) => next.add(index));
    if (next.size === previousSize) return;

    const nextProgress = scratchProgress(next.size, SCRATCH_COLUMNS * SCRATCH_ROWS);
    const milestone = scratchHapticMilestone(nextProgress, SCRATCH_HAPTIC_PROGRESS_STEP);
    const now = Date.now();
    // DUAS travas, e as duas sao necessarias:
    //   · degrau monotonico (milestone > o ultimo) impede repetir o mesmo passo;
    //   · janela de 90ms impede que UM evento que atravessa varios degraus de
    //     uma vez (dedo rapido) dispare uma rajada de pulsos.
    // Com so a primeira, um arrasto veloz vibra tres vezes no mesmo frame; com
    // so a segunda, um dedo lento vibra a cada 90ms sem progresso nenhum.
    if (
      nextProgress < SCRATCH_REVEAL_PROGRESS
      && milestone > hapticMilestoneRef.current
      && now - lastHapticAtRef.current >= HAPTIC_MIN_INTERVAL_MS
    ) {
      hapticMilestoneRef.current = milestone;
      lastHapticAtRef.current = now;
      emitHaptic('texture');
    }
    if (nextProgress >= SCRATCH_REVEAL_PROGRESS) finish();
  }, [finish, scheduleClearedRender]);

  const endGesture = useCallback(() => {
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setGestureActive(false);
  }, []);

  const panGesture = useMemo(() => Gesture.Pan()
    // Um toque solto nao abre a carta. A cobertura so assume o gesto depois
    // de movimento real; a alternativa de acesso e o botao explicito abaixo.
    .enabled(!revealed && !completing)
    .minDistance(MIN_PATH_POINT_DISTANCE)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    // runOnJS(true) e obrigatorio: os callbacks abaixo mexem em estado React e
    // em Set. Sem isto o handler roda na UI thread e o Set nao existe la.
    .runOnJS(true)
    .onStart((event) => {
      setGestureActive(true);
      scratchAt(event.x, event.y);
    })
    .onUpdate((event) => scratchAt(event.x, event.y))
    .onFinalize(endGesture), [completing, endGesture, revealed, scratchAt]);

  const progress = scratchProgress(clearedCount, SCRATCH_COLUMNS * SCRATCH_ROWS);
  // O leitor de tela recebe quatro marcos, nao 2788 celulas: anunciar cada
  // celula transformaria o gesto numa metralhadora de fala.
  const accessibleProgressPercent = completing
    ? 100
    : progress >= 0.5
      ? 50
      : progress >= 0.25 ? 25 : 0;
  // Os ids do SVG sao globais no documento web: duas cartas na mesma tela com
  // o mesmo id fariam a segunda usar a mascara da primeira.
  const idBase = useMemo(
    () => createScratchSvgIdBase(testID, reactId),
    [reactId, testID],
  );
  // Os outros quatro ids (foil, sheen, aura, grain) nascem dentro de
  // PinturaDaLamina, a partir deste mesmo `idBase`. So o da mascara fica aqui,
  // porque so a raspadinha tem mascara.
  const maskId = `${idBase}-mask`;

  return (
    <View
      testID={testID}
      style={[estilos.root, style]}
      onLayout={(event) => {
        // A medicao vive aqui e nao no estado: ela e lida dentro do gesto, que
        // roda entre renders. Em ref o valor esta sempre fresco e nao re-renderiza.
        const { width, height } = event.nativeEvent.layout;
        layoutRef.current = { width, height };
      }}
    >
      {children}
      {!revealed && (
        <GestureDetector gesture={panGesture} touchAction="none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              estilos.veil,
              Platform.OS === 'web' && estilos.webVeil,
              Platform.OS === 'web' && gestureActive && estilos.webVeilActive,
              { opacity: veilOpacity },
            ]}
            accessible={false}
          >
            {/* O METAL. Mesmo desenho do verso da grade da leitura de entrada
                (ver PinturaDaLamina, la em cima): aqui ele vai com o RECORTE,
                que e o traco do dedo abrindo o buraco.

                Luminancia: o branco mantem o veu, o preto abre o buraco. No
                nativo isso exige maskType="luminance" — sem ele o Android trata
                a mascara como alpha e o traco do dedo nao recorta nada. Na web o
                valor ja e o inicial e a prop so poluiria o console. O porque
                completo esta em PROPS_MASCARA_LUMINANCIA, la em cima. */}
            <PinturaDaLamina
              idBase={idBase}
              paleta={paleta}
              mascara={{
                id: maskId,
                elemento: (
                  <Mask
                    id={maskId}
                    x="0"
                    y="0"
                    width="100%"
                    height="100%"
                    maskUnits="userSpaceOnUse"
                    {...PROPS_MASCARA_LUMINANCIA}
                  >
                    <Rect x="0" y="0" width="100%" height="100%" fill={MASCARA_OPACA} />
                    {!!scratchPath && (
                      <Path
                        d={scratchPath}
                        fill="none"
                        stroke={MASCARA_ABIERTA}
                        strokeWidth={SCRATCH_BRUSH_RADIUS * 2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </Mask>
                ),
              }}
            />

            {/* O halo que segue o dedo. So com movimento permitido: e enfeite. */}
            {touchPoint && motionAllowed && !completing && (
              <View
                pointerEvents="none"
                style={[
                  estilos.brush,
                  {
                    left: touchPoint.x,
                    top: touchPoint.y,
                    borderColor: css(paleta.realce, 0.66),
                    backgroundColor: css(paleta.especular, 0.13),
                  },
                ]}
              />
            )}

            {/* A dica some assim que o gesto comeca de verdade (8% raspado). */}
            {progress < 0.08 && !completing && (
              <View pointerEvents="none" style={estilos.hint}>
                <View style={estilos.orbit}>
                  <TrazoDeHilo size={TAMANO_HILO} />
                </View>
                <Text style={estilos.hintText}>{scratchLabel}</Text>
              </View>
            )}

            {/* 1x1 e invisivel: existe so para o leitor de tela ter onde
                ouvir o progresso. `polite` nao interrompe a fala em curso.
                pointerEvents none — nao rouba nenhum toque do veu. */}
            <View
              pointerEvents="none"
              style={estilos.accessibleProgress}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={scratchLabel}
              accessibilityLiveRegion="polite"
              accessibilityValue={{ min: 0, max: 100, now: accessibleProgressPercent }}
            />
          </Animated.View>
        </GestureDetector>
      )}

      {/* ====================================================================
          O ATALHO FICA FORA DA AREA RASPAVEL (bug de 10/09)
          ====================================================================
          Ate aqui este botao vivia DENTRO do veu, ancorado em `bottom: 8`, e
          por isso ocupava os ultimos ~9% da propria area que o dedo raspa.
          Quem raspava ate a base da carta — o gesto natural de quem quer
          limpar o metal todo — soltava o dedo em cima dele. O Pressable
          disparava, `finish(ORIGEN_ATALHO)` abria a carta pelo atalho, e o
          efeito visivel era a carta SEGUINTE nascendo ja revelada: foi assim
          que a carta extra da variante B (A Ancora) apareceu aberta sem
          ninguem ter raspado, reproduzido em producao.

          Agora ele mora abaixo da carta, irmao do veu e nunca sob o dedo que
          raspa. Continua sendo o caminho obrigatorio de acessibilidade — o
          mesmo rotulo, o mesmo alvo de 44px, o mesmo `finish(ORIGEN_ATALHO)`
          —, so que num lugar onde o gesto de raspar nao passa.

          Some junto com o veu: carta aberta nao tem o que revelar. */}
      {!revealed && (
        <Pressable
          style={({ pressed }) => [estilos.tapFallback, pressed && estilos.tapFallbackPressed]}
          onPress={() => finish(ORIGEN_ATALHO)}
          hitSlop={espacio.xs}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || tapLabel}
          accessibilityHint={scratchLabel}
          accessibilityState={{ disabled: completing }}
          focusable={!completing}
          disabled={completing}
        >
          <Text style={estilos.tapFallbackText}>{tapLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  root: {
    position: 'relative',
    // overflow hidden e o que segura o veu dentro do raio da carta.
    overflow: 'hidden',
    backgroundColor: colores.penumbra,
  },
  // O verso solto (VersoDeCarta) nao recebe o borderRadius de DIMENSION_CARTA
  // como a carta recebe: quem o usa e uma grade, e cada celula da a largura e a
  // proporcao. O canto entra aqui para que os seis versos nunca saiam quadrados
  // por esquecimento de quem monta a grade.
  verso: { borderRadius: radio.lg },

  veil: { overflow: 'hidden' },
  webVeil: {
    // touchAction none impede o navegador de roubar o arrasto para rolar a
    // pagina no meio da raspagem.
    touchAction: 'none',
    cursor: 'grab',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  webVeilActive: { cursor: 'grabbing' },
  hint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.xl,
    // Levanta a dica acima do botao de fallback.
    paddingBottom: espacio.xxxl,
  },
  orbit: {
    width: TAMANO_ORBITA,
    height: TAMANO_ORBITA,
    borderRadius: TAMANO_ORBITA / 2,
    borderWidth: 1,
    borderColor: colores.bordeHilo,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.velo,
  },
  hintText: {
    ...tipo.rotulo,
    textAlign: 'center',
    marginTop: espacio.md,
    // Sombra de texto para o rotulo nao brigar com o grao do metal.
    textShadowColor: colores.velo,
    textShadowRadius: 5,
  },
  brush: {
    position: 'absolute',
    width: SCRATCH_BRUSH_RADIUS * 2,
    height: SCRATCH_BRUSH_RADIUS * 2,
    marginLeft: -SCRATCH_BRUSH_RADIUS,
    marginTop: -SCRATCH_BRUSH_RADIUS,
    borderRadius: SCRATCH_BRUSH_RADIUS,
    borderWidth: 1,
    // O brilho da agulha de latao no ponto raspado. Android ignora sombra
    // colorida; la sobra a borda, que ja basta.
    shadowColor: colores.aguja,
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  /* `footer` saiu em 10/09: o botao de revelar sem raspar nao mora mais
   * DENTRO do veu (ver o comentario no JSX). Se algo voltar a precisar de um
   * rodape sobre a lamina, ele nao pode conter nada tocavel. */
  accessibleProgress: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  tapFallback: {
    // Abaixo da carta, nunca sobre ela: `marginTop` no lugar do antigo
    // posicionamento absoluto dentro do veu.
    marginTop: espacio.sm,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.velo,
    paddingHorizontal: espacio.md,
  },
  tapFallbackPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  tapFallbackText: {
    ...tipo.rotulo,
    textAlign: 'center',
  },
});

export default ScratchRevealCard;
