// components/TextoNoRitmo.js — O TEXTO ACOMPANHANDO A VOZ.
//
// ===========================================================================
// O PEDIDO
// ===========================================================================
// "quando o audio vai tocando a escrita tem que vir aparecendo e tremendo o
// teclado" — a frase que a voz esta dizendo fica em destaque, e o aparelho da um
// toquinho a cada frase nova.
//
// ===========================================================================
// A REGRA QUE MANDA AQUI: NADA SE ESCONDE
// ===========================================================================
// "vir aparecendo" NAO e revelar o texto aos poucos. As frases que ainda nao
// chegaram continuam na tela, legiveis, desde o primeiro frame. Quem le mais
// rapido que a voz — que e a maioria — pode ler adiantado; quem esta no onibus
// sem fone le tudo sem tocar em nada. Esconder texto de quem esta lendo e o
// oposto do que a leitura profunda existe para fazer
// (screens/LeituraProfundaScreen.js, "LER BASTA").
//
// O que muda com a voz e so o BRILHO. Sem audio tocando (indice -1), nem isso:
// as frases ficam todas no mesmo estado, e a pagina e a pagina de sempre.
//
// ===========================================================================
// UMA FRASE POR LINHA — E UMA ESCOLHA, NAO UM DESCUIDO
// ===========================================================================
// Antes o card desenhava um <Cuerpo> por PARAGRAFO. Agora desenha um por FRASE,
// e os paragrafos viram grupos (o respiro maior entre eles continua: as frases
// carregam o indice do paragrafo a que pertencem, de datos/profunda.js).
//
// A alternativa era manter o paragrafo inteiro num <Cuerpo> so e acender a frase
// com um <Text> aninhado. Foi descartada por duas razoes praticas: um <Text>
// aninhado nao tem layout proprio no React Native — nao da para saber ONDE ele
// esta, e sem isso a rolagem automatica so consegue mirar o paragrafo, que num
// bloco de seis frases erra por meia tela; e ele tambem nao aceita Animated, o
// que mataria o acender.
//
// O texto nao muda, nao se perde e nao troca de ordem: emendadas, as frases dao
// exatamente o `texto` do bloco (test/madremaria-profunda.test.js prova palavra por
// palavra).
//
// ===========================================================================
// OS TRES ESTADOS, E POR QUE O DEGRAU DO ULTIMO E PEQUENO
// ===========================================================================
// Contraste medido contra `colores.noche` (#0B0708), como manda o theme.js:
//
//   AGORA          colores.papel        16,2:1   + a marca do fio a esquerda
//   JA DITA        colores.ceniza        5,2:1   (AA)
//   AINDA NAO VEM  colores.ceniza @ 90%  4,5:1   (AA, no limite)
//
// O terceiro estado nao pode ficar mais apagado que isso. Ceniza a 90% sobre
// noche da 4,53:1 — o piso de AA para texto de corpo. A 85% cai para 4,04:1 e
// reprova. Entao o degrau entre "ja dita" e "ainda nao vem" e de proposito
// pequeno: o contraste e o piso, nao o gosto. Quem precisa enxergar a diferenca
// grande e o estado AGORA, e esse pula de 5,2:1 para 16,2:1 — nao tem como
// passar despercebido.
//
// Nenhuma frase e borrada, nenhuma fica transparente, nenhuma some.
//
// ===========================================================================
// A ANIMACAO: OPACIDADE, NAO ESCALA
// ===========================================================================
// A frase que entra acende (0,55 -> 1) em 220 ms. Escala foi descartada: numa
// linha que ocupa a largura do card, um scale de 1,015 desloca a borda esquerda
// uns 2 px e borra os glifos durante o tween — o texto TREME, e tremer e o que
// este componente faz o telefone fazer, nao a letra.
//
// Com movimento reduzido (hooks/useReducedMotion.js, onde `null` ja conta como
// reduzido) nao ha tween nenhum e nao ha rolagem automatica: so a troca de cor,
// que e informacao e nao enfeite.
//
// ===========================================================================
// A ROLAGEM: SO QUANDO A FRASE SAI DA TELA
// ===========================================================================
// Rolar a cada frase e enjoativo — sao 13 frases num bloco, e a pagina ficaria
// se mexendo sozinha o tempo todo. Entao a conta e: a frase atual esta dentro da
// janela visivel? Fica tudo quieto. Saiu? Um `scrollTo` que a traz para o terco
// de cima, uma vez.
//
// A janela chega por REFERENCIA (`janelaRef`), nunca por prop de estado: o
// `onScroll` do card escreve `{ y, altura }` direto no objeto, sem setState. Com
// estado, cada evento de rolagem re-renderizaria as 13 frases — dezenas de
// renders por segundo enquanto o dedo arrasta, para desenhar exatamente a mesma
// coisa.
//
// ===========================================================================
// CONTRATOS DE ARQUIVO
// ===========================================================================
//  · Nenhum hex e nenhum rgba: toda cor vem de theme.js.
//  · colores.hilo so como TRACO (a marca da frase atual), nunca como cor de
//    texto — regra 9 do theme.js.
//  · Toda tipografia sai de components/Texto.js.
//  · Nenhuma string nova: este componente so desenha o texto que recebe.
import { memo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { deveVibrar } from '../hooks/useFraseAtual';
import useReducedMotion from '../../hooks/useReducedMotion';
import { leerAjustes } from '../lib/ajustes';
import { colores, espacio } from '../theme';
import { Cuerpo } from './Texto';

/* Quanto tempo a frase leva para acender. Curto o bastante para acompanhar a
 * fala, longo o bastante para nao piscar. */
const ACENDER_MS = 220;
const OPACIDADE_INICIAL = 0.55;

/* A folga que a frase precisa ter dentro da janela para ser considerada visivel.
 * Sem ela, uma frase colada na dobra conta como visivel e a pessoa le metade. */
const MARGEM = espacio.xxl;

/* Onde a frase e reposicionada quando precisa rolar: um terco a partir do topo.
 * Encostada no topo ela parece o fim da pagina; no meio, some rapido demais. */
const TERCO = 0.32;

/* ===================================================================================
   O TOQUINHO
   ===================================================================================
   `selectionAsync` e nao `impactAsync(Light)`, por tres razoes nesta ordem:

    1. E O QUE ELA JA TESTOU. A linha "Vibração" de screens/AjustesScreen.js toca
       exatamente `Haptics.selectionAsync()` no botao de prova, com o texto "É
       assim que se sente". Se aqui saisse outra coisa, a amostra que ela aprovou
       nao seria a que ela recebe 56 vezes seguidas.
    2. SEMANTICA. No iOS, selection e o UISelectionFeedbackGenerator — o tique de
       "mudou de valor", feito para repetir enquanto algo corre (o dedo num
       seletor). E literalmente isto: a leitura passou para a proxima frase.
       `impact` simula uma COLISAO, e uma colisao a cada 4,7 s durante 4,4
       minutos vira marreta.
    3. PESO. Selection e o mais leve dos tres geradores da plataforma, e o pedido
       foi "de leve".

   Nunca vibra na web: la o expo-haptics ja e um no-op, mas a checagem de
   Platform fica assim mesmo — no-op depende de a lib continuar sendo no-op, e
   uma promise rejeitada dentro de um setInterval nao aparece em lugar nenhum.
   =================================================================================== */
function tocarDeLeve() {
  if (Platform.OS === 'web') return;
  try {
    Promise.resolve(Haptics.selectionAsync()).catch(() => {});
  } catch {
    /* haptico e reforco, nunca requisito: um aparelho sem motor nao derruba a leitura */
  }
}

/* ===================================================================================
   UMA FRASE
   ===================================================================================
   `memo` porque so DUAS mudam de estado por vez (a que sai e a que entra) e as
   outras onze nao tem por que voltar ao desenho a cada troca. */
const Frase = memo(function Frase({ texto, estado, animada, opacidade, aoMedir, margemTopo }) {
  const corpo = [
    estado === 'dita' && estilos.dita,
    estado === 'porVir' && estilos.porVir,
    estado === 'agora' && estilos.agora,
  ];

  const conteudo = <Cuerpo style={corpo}>{texto}</Cuerpo>;

  return (
    <View
      onLayout={aoMedir}
      style={[
        estilos.linha,
        { marginTop: margemTopo },
        estado === 'agora' && estilos.linhaAgora,
      ]}
    >
      {animada ? (
        <Animated.View style={{ opacity: opacidade }}>{conteudo}</Animated.View>
      ) : (
        conteudo
      )}
    </View>
  );
});

/**
 * @param {object} props
 * @param {ReadonlyArray<{ini:number|null, texto:string, paragrafo:number}>} props.trechos
 *   as frases do bloco, de `trechosDe` (datos/profunda.js). Sem tempo medido
 *   elas viram os paragrafos de sempre e nada acende — o componente continua
 *   valendo, so nao acompanha nada.
 * @param {number} props.indice  a frase que a voz esta dizendo, de
 *   `useFraseAtual`. -1 = ninguem em destaque, e e o estado normal da pagina.
 * @param {boolean} props.tocando  se a voz esta REALMENTE tocando. E o portao do
 *   haptico: rolar o texto com o dedo, trocar de card ou pausar nao vibra nada.
 * @param {object} [props.scrollRef]  o ScrollView do card, para a rolagem
 *   automatica. Sem ele, nao ha rolagem — e so isso.
 * @param {{current:{y:number, altura:number}}} [props.janelaRef]  onde o card
 *   escreve o deslocamento e a altura visiveis. Ver o cabecalho.
 * @param {object} [props.style]
 */
export default function TextoNoRitmo({ trechos, indice, tocando, scrollRef, janelaRef, style }) {
  const reduzido = useReducedMotion();
  const podeAnimar = reduzido === false; // `null` conta como reduzido

  const lista = Array.isArray(trechos) ? trechos : [];

  /* --- ACENDER ------------------------------------------------------------
   * Um unico valor animado para o componente inteiro: so uma frase esta em
   * destaque por vez, entao 13 valores seriam 12 parados. */
  const brilho = useRef(new Animated.Value(1)).current;

  // useLayoutEffect e nao useEffect: com o efeito normal, a frase nova aparece
  // ACESA no primeiro frame (o valor ainda e o 1 que a anterior deixou), so
  // depois cai para 0,55 e sobe de novo. O olho le isso como um piscar. O efeito
  // de layout roda antes de a tela pintar, e o acender comeca do escuro.
  useLayoutEffect(() => {
    if (!podeAnimar || indice < 0) {
      brilho.setValue(1);
      return undefined;
    }
    brilho.setValue(OPACIDADE_INICIAL);
    const tween = Animated.timing(brilho, {
      toValue: 1,
      duration: ACENDER_MS,
      // No react-native-web nao existe modulo nativo de animacao: pedir o driver
      // nativo la nao acelera nada e imprime um aviso no console a cada frase —
      // 56 avisos por leitura, escondendo qualquer erro de verdade que aparecer.
      useNativeDriver: Platform.OS !== 'web',
    });
    tween.start();
    return () => tween.stop();
  }, [indice, podeAnimar, brilho]);

  /* --- O HAPTICO ----------------------------------------------------------
   * A preferencia entra num ref e nao no estado: ela nao desenha nada, e um
   * setState aqui re-renderizaria as frases por um booleano.
   *
   * Comeca `null` (= desconhecida) e nao `true`: o padrao de fabrica e vibracao
   * ligada, mas de quem DESLIGOU nao se pode arrancar um toque so porque o disco
   * ainda nao respondeu. A leitura resolve em milissegundos, e o audio so comeca
   * depois de um toque no botao — na pratica ela sempre chega antes. */
  const hapticaRef = useRef(null);

  useEffect(() => {
    let vivo = true;
    leerAjustes()
      .then((ajustes) => {
        if (vivo) hapticaRef.current = ajustes?.haptica !== false;
      })
      .catch(() => {
        if (vivo) hapticaRef.current = null;
      });
    return () => {
      vivo = false;
    };
  }, []);

  /* O `ini` da frase que vibrou por ultimo. E ele, e nao o indice, que a regra
   * de intervalo minimo compara — dois indices vizinhos podem estar a 0,49 s um
   * do outro (bloco 8) ou a 6 s (bloco 11), e so o tempo sabe a diferenca. */
  const ultimoIniRef = useRef(null);

  useEffect(() => {
    if (!tocando) return; // rolar o texto a mao nunca vibra
    if (indice < 0) return;
    if (hapticaRef.current !== true) return; // desligada em Ajustes, ou ainda desconhecida

    // Sem `Number()`: `Number(null)` e 0, e uma frase sem tempo medido viraria
    // uma frase que comeca no segundo zero. Ver `inicioDe` em useFraseAtual.js.
    const bruto = lista[indice]?.ini;
    const ini = typeof bruto === 'number' ? bruto : NaN;
    if (!deveVibrar(ultimoIniRef.current, ini)) return;

    ultimoIniRef.current = ini;
    tocarDeLeve();
    // `lista` fica fora das dependencias de proposito: ela e uma tabela congelada
    // por bloco (datos/profunda.js devolve sempre a mesma instancia), e inclui-la
    // so acrescentaria uma chance de o efeito rodar duas vezes na mesma frase.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, tocando]);

  /* --- AS MEDIDAS ---------------------------------------------------------
   * `posicoes` guarda o topo e a altura de cada frase DENTRO deste componente, e
   * `raizY` guarda onde este componente comeca dentro do conteudo rolavel do
   * card. A soma dos dois e a coordenada que o `scrollTo` entende. Tudo em ref:
   * medida nao desenha nada sozinha. */
  const posicoes = useRef([]);
  const raizY = useRef(0);

  const medirRaiz = useCallback((evento) => {
    raizY.current = evento?.nativeEvent?.layout?.y || 0;
  }, []);

  const medidores = useRef(new Map());
  const medidorDe = useCallback((i) => {
    if (!medidores.current.has(i)) {
      medidores.current.set(i, (evento) => {
        const layout = evento?.nativeEvent?.layout;
        if (!layout) return;
        posicoes.current[i] = { y: layout.y || 0, altura: layout.height || 0 };
      });
    }
    return medidores.current.get(i);
  }, []);

  /* --- A ROLAGEM ----------------------------------------------------------
   * Depende so de [indice, tocando, podeAnimar]. A janela e lida do ref na hora:
   * se ela entrasse nas dependencias, cada frame da propria rolagem dispararia o
   * efeito de novo e o `scrollTo` brigaria com a animacao que ele mesmo comecou. */
  useEffect(() => {
    if (!podeAnimar) return; // movimento reduzido: a pagina nao anda sozinha
    if (!tocando || indice < 0) return;

    const rolador = scrollRef?.current;
    if (!rolador || typeof rolador.scrollTo !== 'function') return;

    const janela = janelaRef?.current;
    const altura = Number(janela?.altura) || 0;
    if (altura <= 0) return;

    const pos = posicoes.current[indice];
    if (!pos) return; // ainda nao mediu: a proxima frase resolve

    const topo = raizY.current + pos.y;
    const base = topo + pos.altura;
    const deslocamento = Number(janela?.y) || 0;

    const dentro = topo >= deslocamento + MARGEM && base <= deslocamento + altura - MARGEM;
    if (dentro) return; // ja da para ler: nao se mexe

    try {
      rolador.scrollTo({ y: Math.max(0, topo - altura * TERCO), animated: true });
    } catch {
      /* um ScrollView ja desmontado nao e erro para quem esta ouvindo */
    }
  }, [indice, tocando, podeAnimar, scrollRef, janelaRef]);

  return (
    <View style={[estilos.raiz, style]} onLayout={medirRaiz}>
      {lista.map((trecho, i) => {
        // Sem frase em destaque, TODAS ficam no mesmo estado: a pagina normal.
        let estado = 'normal';
        if (indice >= 0) {
          if (i === indice) estado = 'agora';
          else if (i < indice) estado = 'dita';
          else estado = 'porVir';
        }

        const abreParagrafo = i > 0 && trecho.paragrafo !== lista[i - 1].paragrafo;

        return (
          <Frase
            // O indice E a identidade: os trechos sao uma tabela congelada que
            // nao reordena nem se filtra em runtime (datos/profunda.js).
            key={i}
            texto={trecho.texto}
            estado={estado}
            animada={podeAnimar && estado === 'agora'}
            opacidade={brilho}
            aoMedir={medidorDe(i)}
            margemTopo={i === 0 ? 0 : (abreParagrafo ? espacio.lg : espacio.sm)}
          />
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { alignSelf: 'stretch' },

  /* A calha da esquerda existe em TODAS as linhas, com ou sem marca. Sem ela, a
   * frase em destaque saltaria 10 px para a direita ao acender e o paragrafo
   * inteiro pularia junto — o texto tremendo, que e exatamente o que nao pode. */
  linha: {
    paddingLeft: espacio.md,
    borderLeftWidth: 2,
    borderLeftColor: colores.transparente,
  },
  // A marca da frase atual. colores.hilo como TRACO, nunca como cor de texto
  // (regra 9 do theme.js) — o mesmo tratamento da nota do audio no card.
  linhaAgora: { borderLeftColor: colores.hilo },

  // Sem audio tocando nao ha 'normal' com estilo proprio: o padrao de <Cuerpo>
  // ja e colores.papel, e e esse o estado de leitura da pagina.
  agora: { color: colores.papel },
  dita: { color: colores.ceniza },
  // 4,53:1 sobre noche. Ver o cabecalho: nao pode descer daqui.
  porVir: { color: colores.ceniza, opacity: 0.9 },
});
