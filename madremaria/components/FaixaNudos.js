// components/FaixaNudos.js — O FIO COM NÓS, o desenho que duas telas usam.
//
// ===========================================================================
// DE ONDE ISTO VEIO
// ===========================================================================
// Este arquivo nasceu de dentro de screens/HiloScreen.js, onde o desenho era
// uma funcao local chamada `FaixaSemana`. Quando a tela do ritual precisou do
// MESMO fio com sete nos, havia dois caminhos: copiar a geometria para o outro
// arquivo, ou tirar o desenho de dentro da tela. Copiar significaria duas
// curvas que comecam iguais e divergem no primeiro ajuste — e o fio e a marca,
// entao ele nao pode ter duas versoes. O desenho mora aqui, e as duas telas
// passam so o DADO: quais nos estao atados e qual e o de hoje.
//
// ===========================================================================
// POR QUE UM <Path> UNICO, E NAO SETE BOLINHAS
// ===========================================================================
// Sete circulos em linha sao sete dias. Um traco continuo que ATRAVESSA os sete
// e um fio. Por isso o desenho e um <Path> so que entra pela borda esquerda,
// passa por dentro de cada no, forma barriga entre um no e o outro (a comba de
// um fio pendurado) e sai pela borda direita: ele nao comeca nem termina na
// tela, so passa por aqui.
//
//   sem no (futuro, ou dia sem registro) → o fio liso, com um ponto vazado
//   no atado                             → no cheio em colores.hilo, halo em nudo
//   hoje                                 → o maior dos tres, com um halo que respira
//
// O NO VAZIO NUNCA E MARCA DE FALTA. Ele e a ausencia de afirmacao: o fio
// passando liso por ali. Um dia que a pessoa nao fez nao ganha X, nao ganha
// cinza de "perdido" e nao ganha aviso nenhum — nem aqui, nem em quem chama.
//
// ===========================================================================
// O PULSO DE HOJE
// ===========================================================================
// O no de hoje respira. Ele respira ANTES de ser atado (e um convite) e continua
// respirando depois (e o dia vivo) — em nenhum dos dois casos ele pisca, corre
// ou avisa que o tempo esta acabando.
//
// A animacao e uma <Animated.View> comum posicionada por cima do SVG, e nao um
// atributo animado de <Circle>. Duas razoes: (a) opacidade e escala de View
// rodam no driver nativo, fora da thread de JS, o que mantem o pulso liso
// enquanto a tela carrega o disco; (b) evita depender do suporte a Animated de
// dentro do react-native-svg, que se comporta diferente no react-native-web.
// A geometria e a mesma dos dois lados porque ambos leem os mesmos centros
// calculados no onLayout.
//
// useReducedMotion() devolve true | false | null. So `false` anima: o `null` da
// janela em que a consulta ao sistema ainda nao voltou conta como movimento
// reduzido, e o halo fica parado no seu estado de repouso. Nada some, nada
// salta — quem pediu menos movimento ve o mesmo desenho, imovel.
//
// ===========================================================================
// ACESSIBILIDADE
// ===========================================================================
// A faixa inteira sai da arvore de acessibilidade. Quem usa leitor de tela ja
// recebeu o mesmo dado em TEXTO, em quem chama ('hilo.conteo' na tela do fio,
// 'ritual.sobreceja' na tela do ritual). Sete letras soltas ("L M M J V S D")
// ou sete pontos sem rotulo seriam ruido, nao dado. Quem instanciar isto sem
// ter o numero escrito em algum lugar da tela esta escondendo informacao.
//
// ===========================================================================
// CONTRATOS QUE ESTE ARQUIVO CUMPRE
// ===========================================================================
//  · Regra 8 — nenhum hex e nenhum rgba escrito aqui; toda cor sai de theme.js.
//  · Regra 9 — colores.hilo so como traco, ponto e halo. Nunca como texto.
//  · Nenhuma string propria: `etiquetas` chega pronta de quem chama.
//  · Nenhuma biblioteca nova: react-native-svg ja esta no package.json.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { GROSOR_HILO } from './HiloFondo';
import { Sobreceja } from './Texto';
import useReducedMotion from '../../hooks/useReducedMotion';
import { colores, espacio } from '../theme';

/* ===================================================================================
   GEOMETRIA
   Numeros de desenho, nao tokens: eles descrevem uma curva, nao um espacamento.
   Ficam juntos aqui para que a faixa inteira possa ser reajustada em um lugar so.
   =================================================================================== */
export const ALTO_TRAZO = 46; // altura da caixa de desenho
const Y_HILO = 20; // linha por onde o fio passa
const COMBA = 9; // quanto o fio cede entre um no e o seguinte
const RADIO_LISO = 3.5; // dia sem no: um ponto discreto sobre o fio
const RADIO_NUDO = 6; // dia com no atado
const RADIO_HOY = 7.5; // hoje: o maior dos tres
const LADO_HALO = 34; // o circulo que respira por cima do no de hoje
const DURACION_PULSO_MS = 1200;

/** Duas casas bastam para o SVG e mantem o `d` curto o suficiente para ler. */
const redondear = (n) => Math.round(n * 100) / 100;

/**
 * O `d` do fio: entra pela borda esquerda na altura da linha, corre reto ate o
 * primeiro no e dali segue em curvas quadraticas de no em no, com o ponto de
 * controle abaixo da linha — a barriga de um fio pendurado. Depois do ultimo no
 * volta a correr reto ate a borda direita.
 *
 * Exportada porque e pura: da para conferir a forma da curva num teste sem
 * montar a tela nem medir layout nenhum.
 */
export function trazoNudos(centros, ancho) {
  if (!Array.isArray(centros) || centros.length === 0) return null;
  if (!Number.isFinite(ancho) || ancho <= 0) return null;

  const partes = [`M 0 ${Y_HILO}`, `L ${redondear(centros[0])} ${Y_HILO}`];
  for (let i = 1; i < centros.length; i += 1) {
    const medio = (centros[i - 1] + centros[i]) / 2;
    partes.push(
      `Q ${redondear(medio)} ${redondear(Y_HILO + COMBA)} ${redondear(centros[i])} ${Y_HILO}`
    );
  }
  partes.push(`L ${redondear(ancho)} ${Y_HILO}`);
  return partes.join(' ');
}

/**
 * Quantos nos desenhar. A ordem da decisao importa: `total` manda, porque e a
 * unica das tres fontes que continua correta enquanto o disco nao respondeu —
 * a tela do fio desenha a semana inteira antes de saber quais dias tem no, e a
 * do ritual desenha os sete dias antes de saber em qual deles a pessoa esta.
 */
export function cantidadDeNudos({ total, etiquetas, nudos }) {
  if (Number.isFinite(total) && total > 0) return Math.floor(total);
  if (Array.isArray(etiquetas) && etiquetas.length > 0) return etiquetas.length;
  return Array.isArray(nudos) ? nudos.length : 0;
}

/**
 * A faixa: o fio, os nos e (quando quem chama manda) uma etiqueta por no.
 *
 * @param {object}    props
 * @param {boolean[]} [props.nudos]      um por posicao; true = no atado. Faltando
 *                                       ou curto, as posicoes restantes ficam lisas.
 * @param {number}    [props.indiceHoy]  posicao de hoje (base 0). -1, undefined ou
 *                                       fora da faixa = nenhum no pulsa, e e assim
 *                                       que se desenha um ritual ja terminado.
 * @param {number}    [props.total]      quantos nos desenhar quando `nudos` ainda
 *                                       nao chegou. Ver cantidadDeNudos().
 * @param {string[]}  [props.etiquetas]  uma linha de rotulos embaixo dos nos. Sem
 *                                       ela nao existe linha nenhuma — a tela do
 *                                       ritual nao repete "1 2 3 4 5 6 7" debaixo
 *                                       de uma sobreceja que ja diz "DIA 3 DE 7".
 * @param {*}         [props.style]      margem de quem chama.
 */
export function FaixaNudos({ nudos, indiceHoy = -1, total, etiquetas, style }) {
  const [ancho, setAncho] = useState(0);
  const movimientoReducido = useReducedMotion();
  const pulso = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // null (ainda nao sabemos) conta como reduzido: nada se move ate a resposta
    // do sistema chegar. So `false` explicito liga o pulso.
    if (movimientoReducido !== false) {
      pulso.stopAnimation();
      pulso.setValue(0);
      return undefined;
    }

    const bucle = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1,
          duration: DURACION_PULSO_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 0,
          duration: DURACION_PULSO_MS,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    bucle.start();

    return () => {
      bucle.stop();
      pulso.stopAnimation();
      pulso.setValue(0);
    };
  }, [movimientoReducido, pulso]);

  const alMedir = useCallback((evento) => {
    const medida = Math.round(evento.nativeEvent.layout.width);
    // Sem o guarda, cada re-render de layout dispara um setState identico.
    setAncho((previa) => (previa === medida ? previa : medida));
  }, []);

  const cantidad = useMemo(
    () => cantidadDeNudos({ total, etiquetas, nudos }),
    [total, etiquetas, nudos]
  );

  const centros = useMemo(() => {
    if (!(ancho > 0) || cantidad <= 0) return [];
    const paso = ancho / cantidad;
    return Array.from({ length: cantidad }, (_, i) => paso * (i + 0.5));
  }, [ancho, cantidad]);

  const trazo = useMemo(() => trazoNudos(centros, ancho), [centros, ancho]);

  const escala = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1.16] });
  const opacidad = pulso.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0.06] });
  const centroHoy = centros[indiceHoy];

  return (
    <View
      style={[estilos.faixa, style]}
      onLayout={alMedir}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
    >
      <View style={estilos.lienzo}>
        {ancho > 0 && trazo ? (
          <Svg width={ancho} height={ALTO_TRAZO}>
            {/* O fio: um traco so, de borda a borda. colores.hilo como stroke e
                o uso permitido da cor da marca (regra 9). */}
            <Path
              d={trazo}
              stroke={colores.hilo}
              strokeWidth={GROSOR_HILO}
              strokeLinecap="round"
              fill="none"
            />

            {centros.map((cx, i) => {
              const atado = Array.isArray(nudos) && nudos[i] === true;
              const esHoy = i === indiceHoy;
              const radioNudo = esHoy ? RADIO_HOY : atado ? RADIO_NUDO : RADIO_LISO;
              return (
                <Circle
                  key={`nudo-${i}`}
                  cx={redondear(cx)}
                  cy={Y_HILO}
                  r={radioNudo}
                  // Cheio quando o dia tem no; vazado (a noite por dentro)
                  // quando ainda nao tem. Vazio nunca vira marca de falta: e
                  // so o fio passando liso por ali.
                  fill={atado ? colores.hilo : colores.noche}
                  stroke={atado ? colores.nudo : esHoy ? colores.bordeHilo : colores.bordeSuave}
                  strokeWidth={GROSOR_HILO}
                />
              );
            })}
          </Svg>
        ) : null}

        {/* O halo que respira, por cima do no de hoje. View comum: escala e
            opacidade rodam no driver nativo (ver cabecalho). */}
        {Number.isFinite(centroHoy) ? (
          <Animated.View
            pointerEvents="none"
            style={[
              estilos.halo,
              {
                left: centroHoy - LADO_HALO / 2,
                top: Y_HILO - LADO_HALO / 2,
                opacity: opacidad,
                transform: [{ scale: escala }],
              },
            ]}
          />
        ) : null}
      </View>

      {Array.isArray(etiquetas) && etiquetas.length > 0 ? (
        <View style={estilos.etiquetas}>
          {etiquetas.map((texto, i) => (
            <Sobreceja
              key={`etiqueta-${i}`}
              style={[estilos.etiqueta, i === indiceHoy ? estilos.etiquetaHoy : null]}
            >
              {texto}
            </Sobreceja>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  faixa: {
    alignSelf: 'stretch',
  },
  lienzo: {
    height: ALTO_TRAZO,
    justifyContent: 'flex-start',
  },
  halo: {
    position: 'absolute',
    width: LADO_HALO,
    height: LADO_HALO,
    borderRadius: LADO_HALO / 2,
    // Halo e luz, nao texto: uso permitido da cor da marca.
    backgroundColor: colores.hilo,
  },
  etiquetas: {
    flexDirection: 'row',
    marginTop: espacio.xs,
  },
  etiqueta: {
    flex: 1,
    textAlign: 'center',
    // O tracking de `sobreceja` empurra a letra para a esquerda do centro
    // quando o texto tem um caractere so; aqui ele nao serve para nada.
    letterSpacing: 0,
  },
  etiquetaHoy: {
    color: colores.papel,
  },
});

export default FaixaNudos;
