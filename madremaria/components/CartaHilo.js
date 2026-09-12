// components/CartaHilo.js
// A carta raspavel do Fio Vermelho: o veu metalico por cima, a ilustracao por baixo.
//
// ===========================================================================
// POR QUE ESTE ARQUIVO EXISTE (o antidoto de uma falha muda)
// ===========================================================================
// ScratchRevealCard NAO tem dimensao intrinseca. Ele mede a si mesmo com
// onLayout e alimenta scratchIndexesAlongSegment com essa largura e altura.
// Se quem o instancia esquecer de dar tamanho pelo style, o onLayout devolve
// 0x0, scratchIndexesAlongSegment devolve [] (ele mesmo barra width <= 0),
// scratchProgress fica travado em 0 e a carta NUNCA revela pelo gesto.
// Sem excecao, sem warning, sem tela vermelha: o dedo passa e nada acontece.
// So o botao de "revelar sin raspar" continua funcionando, o que faz a falha
// parecer decisao de design ate alguem abrir o app com o dedo de verdade.
//
// Por isso este e o UNICO lugar do app autorizado a instanciar o
// ScratchRevealCard. Nenhuma tela o importa direto. Aqui a dimensao e
// explicita e vem primeiro no array de style, e um guarda de desenvolvimento
// grita no console se algum chamador conseguir zerar a medida mesmo assim.
//
// ===========================================================================
// CONTRATO REAL DE ./ScratchRevealCard — as props dele estao em INGLES
// ===========================================================================
// ATENCAO (bug corrigido em 31/08): este arquivo passava `revelada`,
// `onRevelar` e `nombreCarta`. O ScratchRevealCard desestrutura `revealed`,
// `onReveal` e nao conhece `nombreCarta`. Como ele nao faz spread de resto, as
// tres eram IGNORADAS EM SILENCIO: o veu nunca saia por controle da tela e a
// tela nunca ficava sabendo que a carta abriu — o contador de progresso e o
// botao de continuar da TiradaScreen jamais destravavam. So `resetKey` (mesmo
// nome nos dois lados) chegava. A traducao agora acontece aqui, uma vez, e
// nenhuma tela precisa saber que o filho fala ingles.
//
//   style              objeto/array de style aplicado ao container que ele
//                      mede com onLayout. E daqui que sai a dimensao.
//   children           o que fica DEBAIXO do veu (aqui: a face da carta).
//                      O veu e desenhado por cima, em posicao absoluta.
//   revealed           boolean controlado: true = veu ja removido.
//   onReveal           chamado UMA vez quando o progresso cruza
//                      SCRATCH_REVEAL_PROGRESS ou quando o botao de
//                      acessibilidade e acionado.
//   resetKey           qualquer valor; mudar reseta a raspagem para zero.
//   scratchLabel       dica VISIVEL no centro do veu, e tambem o rotulo do
//                      progressbar e o hint do botao de fallback. Sem ela a
//                      dica sai vazia.
//   tapLabel           texto visivel do botao "revelar sem raspar". Sem ela o
//                      caminho alternativo obrigatorio sai sem rotulo.
//   accessibilityLabel etiqueta do botao de fallback, ja montada aqui (nunca
//                      revela o nome da carta antes da hora — ver `etiqueta`).
//   revealAnnouncement frase anunciada pelo leitor de tela quando a carta abre.
//
// ===========================================================================
// REGRAS DE PRODUTO APLICADAS AQUI
// ===========================================================================
// · Nenhum hex literal: toda cor sai de theme.js (regra 8).
// · colores.hilo nunca vira cor de texto (regra 9) — aqui ele nem aparece.
// · Nenhum texto proprio: tudo que e palavra sai de datos/textos.js.
// · A carta coberta fica escondida do leitor de tela. Anunciar "El Sol" por
//   baixo do veu estragaria a raspagem de quem usa VoiceOver ou TalkBack —
//   seria a mesma falha muda, so que ao contrario.
import { memo, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { t } from '../datos/textos';
import { imagenDeCarta } from '../lib/imagenes';
import { colores, espacio, radio, tipo } from '../theme';
import ScratchRevealCard, {
  ORIGEN_ATALHO,
  ORIGEN_RASPADO,
  VersoDeCarta,
} from './ScratchRevealCard';

/* Reexportadas aqui porque este e o UNICO arquivo autorizado a instanciar o
 * ScratchRevealCard (ver o cabecalho): uma tela que precise comparar a origem
 * importa daqui, e nao passa por cima da regra so para pegar uma constante.
 *
 * VersoDeCarta entra na mesma reexportacao e pelo mesmo motivo. Ele NAO e um
 * ScratchRevealCard — e so a lamina de metal, sem gesto, sem dica e sem botao de
 * atalho —, mas quem precisa dele (a grade dos seis versos da leitura de
 * entrada) esta a um passo de instanciar a raspadinha errada. Com a porta aqui,
 * a regra do cabecalho continua valendo para o app inteiro: nenhuma tela importa
 * de ./ScratchRevealCard. */
export { ORIGEN_ATALHO, ORIGEN_RASPADO, VersoDeCarta };

const enDesarrollo = typeof __DEV__ !== 'undefined' && __DEV__;

// A medida da carta. Exportada para que o teste possa afirmar que ela existe
// sem precisar montar a arvore inteira.
//
// aspectRatio 0.6 = 3:5, a proporcao do baralho. Com '96%' e teto de 334 a
// carta ocupa a largura do telefone com folga nas laterais e para de crescer
// no tablet, onde uma carta de 700 de largura ficaria absurda. A altura sai do
// aspectRatio: nunca ha uma altura fixa para brigar com a fonte do sistema.
export const DIMENSION_CARTA = Object.freeze({
  alignSelf: 'center',
  width: '96%',
  maxWidth: 334,
  aspectRatio: 0.6,
  borderRadius: radio.lg,
});

/**
 * CartaHilo — uma carta da tirada, coberta pelo veu ate a usuaria raspar.
 *
 * @param {object}   props
 * @param {object}   props.carta      item de datos/cartas.json ({ id, nombre, ... }).
 * @param {boolean}  props.invertida  gira a ilustracao 180 graus.
 * @param {boolean}  props.revelada   estado controlado pela tela.
 * @param {Function} props.onRevelar  avisa a tela que esta carta acabou de abrir.
 *   Recebe a ORIGEM: ORIGEN_RASPADO (dedo) ou ORIGEN_ATALHO (botao "revelar sem
 *   raspar"), reexportados abaixo. Quem so quer saber que abriu ignora o
 *   argumento; quem precisa distinguir — a missao "raspe as tres com o dedo" —
 *   nao teria como sem ele.
 * @param {*}        props.resetKey   mudar reseta a raspagem (nova tirada).
 * @param {object}   props.posicion   nome da posicao ('EL NUDO'...) so para a
 *                                    etiqueta de acessibilidade. Opcional.
 * @param {*}        props.style      ajuste do chamador (margem, largura menor).
 *
 * @param {*}        props.arte       MODULO DE IMAGEM JA RESOLVIDO, para um baralho
 *   que nao e o tarô. Sem ela a arte sai de lib/imagenes.js (as 78 do tarô), que e
 *   o caso de sempre. Ela existe por causa da LEITURA DE ENTRADA: aquelas tres
 *   cartas sao do baralho cigano e a arte delas mora em lib/imagenesLenormand.js,
 *   sob outros ids. A alternativa seria a tela instanciar o ScratchRevealCard
 *   direto para poder trocar a imagem — e o cabecalho deste arquivo explica por
 *   que isso quebra a raspagem em silencio. Entao a excecao entra AQUI, uma vez.
 *   `null` (id sem arte no mapa do chamador) cai no marcador com o nome, igual ao
 *   tarô; so `undefined` significa "resolva pelo tarô".
 *
 * @param {boolean}  props.sinOrientacion  este baralho nao le carta invertida.
 *   O Lenormand da leitura de entrada nao tem carta em pe e carta de cabeca para
 *   baixo — sao 36 cartas sem inversao, e a voz gravada nunca fala em orientacao.
 *   Com esta flag a etiqueta do leitor de tela diz so o nome da carta, em vez de
 *   anunciar "Em pé" sobre um baralho onde isso nao quer dizer nada.
 */
function CartaHilo({
  carta,
  invertida = false,
  revelada = false,
  onRevelar,
  resetKey,
  posicion,
  style,
  arte: arteExterna,
  sinOrientacion = false,
}) {
  const id = typeof carta?.id === 'string' ? carta.id : '';
  const nombre = typeof carta?.nombre === 'string' ? carta.nombre : '';
  const arte = useMemo(
    () => (arteExterna === undefined ? imagenDeCarta(id) : arteExterna),
    [arteExterna, id]
  );

  // A dimensao entra ANTES do style do chamador: quem chama pode empurrar a
  // carta com margem ou apertar o maxWidth, mas comeca sempre de uma medida
  // valida. O guarda abaixo cobre o caso em que o ajuste zera a medida.
  const estiloCarta = useMemo(() => {
    const plano = StyleSheet.flatten([DIMENSION_CARTA, style]) || {};
    if (enDesarrollo) {
      const sinAncho = plano.width == null || plano.width === 0;
      const sinAlto = (plano.height == null || plano.height === 0) && !plano.aspectRatio;
      if (sinAncho || sinAlto) {
        console.error(
          '[CartaHilo] O style recebido zerou a medida da carta. Sem largura e altura '
            + 'o onLayout do ScratchRevealCard mede 0x0 e a raspagem para de responder ao dedo, '
            + 'sem erro nenhum. Corrija o style de quem chamou CartaHilo.'
        );
      }
    }
    return plano;
  }, [style]);

  // Antes de raspar, a etiqueta fala da posicao na mesa — nunca do nome da
  // carta. Sem posicao informada cai na etiqueta generica, que tambem nao
  // entrega nada: melhor uma frase curta do que um {posicion} cru na tela ou
  // o nome da carta entregue de graca no leitor de tela.
  const etiqueta = posicion ? t('scratch.a11y', { posicion }) : t('scratch.label');

  // Estado da carta dito em voz alta so DEPOIS de revelada. Num baralho sem
  // inversao (sinOrientacion) o estado nao existe: anunciar "Em pé" ali seria
  // inventar uma distincao que aquele baralho nao faz.
  const estado = invertida ? t('tirada.carta.invertida') : t('tirada.carta.derecha');
  let etiquetaCara;
  if (sinOrientacion) etiquetaCara = nombre || undefined;
  else etiquetaCara = nombre ? `${nombre}. ${estado}` : estado;

  // Sem nome nao ha anuncio: t('scratch.revelada', { carta: '' }) diria
  // " revelada. Su lectura esta abajo.", que e pior do que o silencio.
  const anuncio = nombre ? t('scratch.revelada', { carta: nombre }) : undefined;

  return (
    <ScratchRevealCard
      style={estiloCarta}
      revealed={revelada}
      onReveal={onRevelar}
      resetKey={resetKey}
      scratchLabel={t('scratch.label')}
      tapLabel={t('scratch.tap')}
      accessibilityLabel={etiqueta}
      revealAnnouncement={anuncio}
    >
      {/* A face nao participa do toque: quem escuta o dedo e o veu que esta
          por cima. Um Image respondendo a gesto roubaria o PanResponder e a
          raspagem falharia de novo em silencio. */}
      <View
        pointerEvents="none"
        style={estilos.cara}
        accessible={!!revelada}
        accessibilityRole="image"
        accessibilityLabel={etiquetaCara}
        accessibilityElementsHidden={!revelada}
        importantForAccessibility={revelada ? 'yes' : 'no-hide-descendants'}
      >
        {arte ? (
          // Os JPGs tem 420 de largura e altura variavel (700 a 746). O
          // 'contain' absorve essa diferenca: a carta inteira sempre cabe,
          // sem corte e sem distorcao, e a sobra fica no fundo noche.
          <Image
            source={arte}
            resizeMode="contain"
            accessible={false}
            style={[estilos.arte, { transform: [{ rotate: invertida ? '180deg' : '0deg' }] }]}
          />
        ) : (
          // Sem arte (id desconhecido, asset ainda nao gerado) a carta continua
          // legivel: o nome fica no lugar da ilustracao. Nunca quebra a tela.
          <View style={estilos.marcador}>
            <Text style={estilos.nombreMarcador} numberOfLines={3} adjustsFontSizeToFit>
              {nombre}
            </Text>
            {!sinOrientacion && <Text style={estilos.estadoMarcador}>{estado}</Text>}
          </View>
        )}
      </View>
    </ScratchRevealCard>
  );
}

const estilos = StyleSheet.create({
  // absoluteFill: a face ocupa exatamente o container medido pelo
  // ScratchRevealCard, que e o mesmo retangulo que o veu cobre.
  cara: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radio.lg,
    backgroundColor: colores.noche,
  },
  arte: {
    width: '100%',
    height: '100%',
  },
  marcador: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: espacio.xl,
    backgroundColor: colores.penumbra,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    borderRadius: radio.lg,
  },
  nombreMarcador: {
    ...tipo.nombreCarta,
    textAlign: 'center',
  },
  estadoMarcador: {
    ...tipo.sobreceja,
    marginTop: espacio.sm,
    textAlign: 'center',
  },
});

// memo: a tela de tirada mantem tres CartaHilo montadas ao mesmo tempo e
// re-renderiza a cada evento de progresso. Sem memo, raspar a primeira carta
// re-renderizaria as outras duas a cada movimento do dedo.
const CartaHiloMemo = memo(CartaHilo);
CartaHiloMemo.displayName = 'CartaHilo';

export default CartaHiloMemo;
