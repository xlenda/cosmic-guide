// O botao de ouvir a carta.
//
// O funil de WhatsApp do dono converte por AUDIO: a leitura das tres cartas sao
// tres faixas gravadas com a voz dele. Este botao traz esse mecanismo para o
// app — quem prefere ouvir a ler ouve, e quem prefere ler nao e obrigado a nada.
//
// REGRAS DESTE COMPONENTE
// · Sem audio, ele NAO renderiza. Nada de botao cinza que nao faz nada: a
//   ausencia de audio nao vira uma promessa quebrada na tela.
// · O texto escrito continua na tela SEMPRE. O audio e alternativa, nunca
//   substituto — quem esta no onibus sem fone precisa da leitura inteira.
// · Um audio por vez: comecar um para o outro. Duas vozes juntas nao e leitura,
//   e barulho.
// · Nao toca sozinho. Autoplay em app de intimidade e invasao — a pessoa pode
//   estar em qualquer lugar quando abre.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

import { t } from '../datos/textos';
import { guardarVelocidade, leerAjustes, proximaVelocidade } from '../lib/ajustes';
import { audioDaCarta } from '../lib/audios';
import useReducedMotion from '../../hooks/useReducedMotion';
import { colores, espacio, radio, sombra, tipo } from '../theme';
import { Micro } from './Texto';

/* expo-audio pode nao estar instalado num checkout antigo. No Metro a resolucao
 * e ESTATICA: um require de pacote ausente derruba o bundle inteiro, mesmo
 * dentro de try/catch. Por isso a checagem e por modulo ja importado, e o
 * componente degrada para "sem audio" em vez de quebrar o app. */
let Audio = null;
try {
  // eslint-disable-next-line global-require
  Audio = require('expo-audio');
} catch (e) {
  Audio = null;
}

/** Quem esta tocando agora. Modulo-level de proposito: e a trava de "um por vez". */
let tocandoAgora = null;

/**
 * PARA O QUE ESTIVER TOCANDO, venha de onde vier o pedido.
 *
 * A trava de "um por vez" la em cima resolve o caso de dois botoes: comecar um
 * para o outro. Ela NAO resolve o caso do carrossel da leitura profunda
 * (screens/LeituraProfundaScreen.js), onde a pessoa desliza do card 2 para o 3
 * sem tocar em botao nenhum: sem isto, a voz do card 2 continua falando por cima
 * do texto do card 3 — duas leituras ao mesmo tempo, que e o defeito que este
 * componente inteiro existe para nao ter.
 *
 * Nao quebra ninguem: quem nao chamar continua com exatamente o comportamento
 * de antes, e chamar sem nada tocando nao faz nada.
 */
export function pararAudioAtual() {
  if (typeof tocandoAgora === 'function') tocandoAgora();
}

function IconeTocar({ tocando, cor }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {tocando ? (
        <>
          <Rect x="6" y="5" width="4" height="14" rx="1.2" fill={cor} />
          <Rect x="14" y="5" width="4" height="14" rx="1.2" fill={cor} />
        </>
      ) : (
        <Path d="M8 5.5v13l11-6.5-11-6.5z" fill={cor} />
      )}
    </Svg>
  );
}

/**
 * @param {object} props
 * @param {string} props.audioId  a chave de lib/audios.js. Sem arquivo, o botao
 *   nao renderiza.
 * @param {() => void} [props.onTocar]  avisado UMA VEZ por toque que de fato
 *   comecou a tocar — nunca na pausa, nunca quando o audio falhou. O carrossel
 *   da leitura profunda usa isto para guardar que ela OUVIU aquele bloco, que e
 *   diferente de ter visto o card (lib/profunda.js explica a diferenca).
 *   Opcional: quem nao passa continua com o comportamento de antes, e um
 *   callback que estoura nunca derruba o botao nem a leitura.
 * @param {string} [props.rotulo]  o texto do botao parado. O padrao e 'Ouvir a
 *   carta', que e verdade nas tres cartas da leitura de entrada e MENTIRA no
 *   carrossel da leitura profunda, onde nao ha carta nenhuma — la o que se ouve
 *   e uma parte da leitura. Quem passa manda o texto ja resolvido por t().
 * @param {string} [props.rotuloPausar]  o mesmo, com o audio tocando.
 * @param {(player: object|null) => void} [props.onPlayer]  recebe o AudioPlayer
 *   do expo-audio assim que ele nasce, e `null` quando ele e descartado.
 *
 *   POR QUE ISTO EXISTE: a leitura profunda precisa saber, 8 vezes por segundo,
 *   em que SEGUNDO a voz esta, para acender a frase que ela esta dizendo
 *   (hooks/useFraseAtual.js). Esse numero so existe dentro do player, e o player
 *   nasce aqui — de proposito tarde, no primeiro toque, para que os cinco cards
 *   do carrossel nao instanciem cinco players para tocar um.
 *
 *   NAO MUDA NADA PARA QUEM JA USAVA: quem nao passa `onPlayer` continua com o
 *   comportamento de antes (as tres cartas da leitura de entrada nao passam), e
 *   um callback que estoure e engolido aqui, como o de `onTocar` — problema de
 *   quem chamou, nunca da leitura.
 *
 *   Quem recebe o player NAO e dono dele: nao chame `play`, `pause` nem `remove`
 *   nele. Este botao cria, para e descarta; de fora, so se LE.
 * @param {object} [props.style]
 */
export default function BotaoOuvir({ audioId, onTocar, onPlayer, rotulo, rotuloPausar, style }) {
  const fonte = audioDaCarta(audioId);
  const player = useRef(null);
  const [tocando, setTocando] = useState(false);
  const [falhou, setFalhou] = useState(false);

  /* O CONVITE PULSA. O dono viu o botao "escondido" no aparelho real (03/09):
   * a voz e o coracao do funil e o botao dela nao pode sumir na tela. Parado,
   * ele respira (1 -> 1.05, loop suave); tocando, fica quieto — animacao em
   * cima de voz e ruido. Movimento reduzido (ou ainda nao sabido — nunca
   * animar no escuro, regra do BotonPrimario) = quieto tambem. */
  const movimientoReducido = useReducedMotion();
  const pulso = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (movimientoReducido !== false || tocando) {
      pulso.setValue(1);
      return undefined;
    }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulso, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => {
      anim.stop();
      pulso.setValue(1);
    };
  }, [movimientoReducido, tocando, pulso]);

  /* `onPlayer` vive num ref, e nao numa lista de dependencias.
   *
   * O efeito de descarte la embaixo depende de [parar]. Se `onPlayer` entrasse
   * nele, um pai que passasse uma funcao inline (o caso normal) recriaria o
   * efeito a cada render — e a limpeza do efeito anterior chamaria `remove()` no
   * player NO MEIO DA REPRODUCAO. O audio morreria sozinho, sem erro nenhum. */
  const avisarPlayer = useRef(onPlayer);
  useEffect(() => {
    avisarPlayer.current = onPlayer;
  }, [onPlayer]);

  const notificarPlayer = useCallback((instancia) => {
    try {
      if (typeof avisarPlayer.current === 'function') avisarPlayer.current(instancia);
    } catch (erroDeFora) {
      /* problema de quem chamou, nao da leitura */
    }
  }, []);

  const parar = useCallback(() => {
    try {
      if (player.current) player.current.pause();
    } catch (e) {
      /* um player ja descartado nao e erro para quem esta lendo a carta */
    }
    setTocando(false);
    if (tocandoAgora === parar) tocandoAgora = null;
  }, []);

  // Descarta o player ao sair da tela: audio que continua tocando depois de a
  // pessoa fechar a leitura e o tipo de coisa que faz desinstalar o app.
  useEffect(
    () => () => {
      try {
        if (player.current) player.current.remove?.();
      } catch (e) {
        /* nada a fazer no unmount */
      }
      // Quem estava lendo o tempo daquele player precisa saber que ele acabou:
      // um relogio apontando para um objeto descartado le lixo ou lanca.
      if (player.current) {
        player.current = null;
        try {
          if (typeof avisarPlayer.current === 'function') avisarPlayer.current(null);
        } catch (erroDeFora) {
          /* problema de quem chamou, nao da leitura */
        }
      }
      if (tocandoAgora === parar) tocandoAgora = null;
    },
    [parar]
  );

  /* A VELOCIDADE (11/09). Comeca em 1 e e trocada pelo disco assim que ele
   * responde — nunca depois do primeiro toque, para nao mudar o ritmo no meio
   * de uma frase. Fica num ref ALEM do estado porque `aplicarVelocidade` roda
   * dentro do `alternar`, que nao pode depender do estado sem recriar o
   * callback a cada troca. */
  const [velocidade, setVelocidade] = useState(1);
  const velocidadeRef = useRef(1);
  useEffect(() => {
    let vivo = true;
    leerAjustes()
      .then((a) => {
        if (!vivo) return;
        velocidadeRef.current = a.velocidade;
        setVelocidade(a.velocidade);
      })
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, []);

  /* `shouldCorrectPitch` e o que separa "voz mais rapida" de "voz de desenho
   * animado". Os dois campos entram dentro de try: um player ja descartado, ou
   * uma plataforma que nao conheca a propriedade, nao pode derrubar a leitura. */
  const aplicarVelocidade = useCallback((instancia, valor) => {
    if (!instancia) return;
    try {
      instancia.shouldCorrectPitch = true;
      instancia.playbackRate = valor;
    } catch {
      /* sem controle de velocidade nesta plataforma: toca no ritmo normal */
    }
  }, []);

  const trocarVelocidade = useCallback(() => {
    const nova = proximaVelocidade(velocidadeRef.current);
    velocidadeRef.current = nova;
    setVelocidade(nova);
    aplicarVelocidade(player.current, nova);
    guardarVelocidade(nova).catch(() => {});
  }, [aplicarVelocidade]);

  const alternar = useCallback(() => {
    if (!fonte || !Audio) return;
    if (tocando) {
      parar();
      return;
    }
    try {
      // Um por vez.
      if (tocandoAgora && tocandoAgora !== parar) tocandoAgora();

      let nasceuAgora = false;
      if (!player.current) {
        player.current = Audio.createAudioPlayer ? Audio.createAudioPlayer(fonte) : null;
        nasceuAgora = !!player.current;
      }
      if (!player.current) {
        setFalhou(true);
        return;
      }
      // Antes do play: quem le o tempo ja fica apontado para o player quando o
      // primeiro segundo comeca a correr.
      if (nasceuAgora) notificarPlayer(player.current);

      player.current.seekTo?.(0);
      aplicarVelocidade(player.current, velocidadeRef.current);
      player.current.play();
      tocandoAgora = parar;
      setTocando(true);

      // O aviso vai no fim e no proprio try/catch: um callback de fora que
      // estoure nao pode virar `falhou` aqui dentro e apagar o botao de ouvir.
      try {
        if (typeof onTocar === 'function') onTocar();
      } catch (erroDeFora) {
        /* problema de quem chamou, nao da leitura */
      }
    } catch (e) {
      // Falha de audio nunca derruba a leitura: o texto continua na tela.
      setFalhou(true);
      setTocando(false);
    }
  }, [aplicarVelocidade, fonte, notificarPlayer, onTocar, parar, tocando]);

  // Sem arquivo, sem biblioteca, ou depois de falhar: o botao simplesmente nao existe.
  if (!fonte || !Audio || falhou) return null;

  // Uma so resolucao do texto, usada no rotulo visivel E no leitor de tela: dois
  // caminhos separados e como o botao passa a dizer uma coisa na tela e outra no
  // VoiceOver sem ninguem perceber.
  const texto = tocando
    ? rotuloPausar || t('audio.pausar')
    : rotulo || t('audio.ouvir');

  return (
    <View style={[estilos.raiz, style]}>
      <Animated.View style={{ transform: [{ scale: pulso }] }}>
        <Pressable
          onPress={alternar}
          accessibilityRole="button"
          accessibilityLabel={texto}
          accessibilityState={{ busy: tocando }}
          hitSlop={8}
          style={({ pressed }) => [estilos.botao, pressed && estilos.pressionado]}
        >
          <IconeTocar tocando={tocando} cor={colores.papel} />
          <Micro style={estilos.rotulo}>{texto}</Micro>
        </Pressable>
      </Animated.View>

      {/* A VELOCIDADE (11/09). Discreto ao lado, nunca competindo com o Ouvir:
          quem nao quer acelerar nem repara nele. Cicla 1x -> 1,5x -> 2x, e o
          rotulo E o estado — nao ha menu para abrir no meio de uma leitura. */}
      <Pressable
        onPress={trocarVelocidade}
        accessibilityRole="button"
        accessibilityLabel={t('audio.velocidade.rotulo', { valor: t(`audio.velocidade.${velocidade}`) })}
        accessibilityHint={t('audio.velocidade.ajuda')}
        hitSlop={8}
        style={({ pressed }) => [estilos.velocidade, pressed && estilos.pressionado]}
      >
        <Micro style={estilos.velocidadeTexto}>{t(`audio.velocidade.${velocidade}`)}</Micro>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: espacio.sm },
  /* ACESO de proposito: fundo nudo, borda do fio viva e halo — a voz e o
   * produto, e o botao dela estava sumindo em penumbra (dono, 03/09). */
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacio.sm,
    minHeight: 44,
    paddingHorizontal: espacio.lg,
    borderRadius: radio.lg,
    borderWidth: 1.5,
    borderColor: colores.hilo,
    backgroundColor: colores.nudo,
    ...sombra.halo,
  },
  pressionado: { backgroundColor: colores.penumbra },
  rotulo: { color: colores.papel, letterSpacing: tipo.rotulo.letterSpacing },
  /* Discreto de proposito: borda suave, sem halo e sem fundo aceso. O Ouvir e o
   * convite; este e so um ajuste para quem ja decidiu ouvir. */
  velocidade: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: espacio.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radio.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
  },
  velocidadeTexto: { color: colores.ceniza, letterSpacing: tipo.rotulo.letterSpacing },
});
