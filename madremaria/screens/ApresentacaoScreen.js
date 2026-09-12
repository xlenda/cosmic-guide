/* A APRESENTACAO — a Madre Maria e a PRIMEIRA coisa do funil (09/09; video 10/09).
 *
 * Antes de qualquer pergunta, quem chega VE a Madre Maria: o video dela
 * (HeyGen, gravado pelo dono, assets/video/madre-maria.mp4, 720p ~2,5MB, com
 * faststart para comecar antes de baixar inteiro) na sala dela, falando o
 * roteiro de abertura. O texto na tela e a transcricao palavra por palavra do
 * que ela diz no video e ACENDE frase a frase enquanto ele toca — o mesmo
 * TextoNoRitmo da leitura profunda, lendo o relogio do player de video (ele
 * expoe playing/currentTime/duration como o de audio). Os tempos por frase
 * vieram da transcricao do proprio video (datos/apresentacao-tempos.json).
 * Quem esta sem fone le tudo: nada se esconde, so o brilho muda.
 *
 * O video nao toca sozinho: na web o navegador so libera som depois de um
 * toque, e no nativo comecar a falar sem a pessoa pedir e invasivo. O poster
 * (o primeiro quadro) fica na frente ate o primeiro toque.
 *
 * Nao grava nada no disco. Sem perfil, o App abre aqui; com perfil, nunca mais
 * passa por aqui — o portao e a rota inicial (App.js), nao uma chave nova.
 * Sai por `replace`, como o onboarding: o botao voltar do sistema nao pode
 * trazer a pessoa de volta para uma apresentacao que ela ja recebeu.
 */
import { useCallback, useRef, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

import BotonPrimario from '../components/BotonPrimario';
import HiloFondo from '../components/HiloFondo';
import TextoNoRitmo from '../components/TextoNoRitmo';
import { Micro, Sobreceja, Titulo } from '../components/Texto';
import TEMPOS from '../datos/apresentacao-tempos.json' with { type: 'json' };
import { t } from '../datos/textos';
import { useFraseAtual } from '../hooks/useFraseAtual';
import { RUTAS } from '../routes';
import { colores, espacio, radio } from '../theme';

// Requires ESTATICOS, como todo asset do app (o Metro resolve no build).
export const VIDEO_APRESENTACAO = require('../../assets/madremaria/video/madre-maria.mp4');
const POSTER_APRESENTACAO = require('../../assets/madremaria/video/madre-maria-poster.jpg');

/* As frases, com a hora de cada uma, montadas UMA vez e congeladas: a
 * identidade estavel importa, useFraseAtual tem os trechos numa lista de
 * dependencias. Se o JSON nao bater com o texto, a tela cai para o texto
 * inteiro sem tempo — nada acende, nada some (test/apresentacao.test.js prova
 * que bate). */
const TEXTO = t('apresentacao.texto');
const TRECHOS = Object.freeze(
  Array.isArray(TEMPOS?.trechos) && TEMPOS.trechos.map((x) => x.texto).join(' ') === TEXTO
    ? TEMPOS.trechos.map((x) => Object.freeze({ ini: Number(x.ini), fim: Number(x.fim), texto: x.texto, paragrafo: 0 }))
    : [Object.freeze({ ini: null, fim: null, texto: TEXTO, paragrafo: 0 })]
);
const DURACAO = Number(TEMPOS?.duracao) > 0 ? Number(TEMPOS.duracao) : 0;

export default function ApresentacaoScreen({ navigation }) {
  const comecar = () => {
    if (typeof navigation?.replace === 'function') navigation.replace(RUTAS.ONBOARDING);
    else navigation?.navigate?.(RUTAS.ONBOARDING);
  };

  /* O PLAYER nasce com a tela (o video e o centro dela), mas nao toca sozinho. */
  const player = useVideoPlayer(VIDEO_APRESENTACAO, (p) => {
    p.loop = false;
    /* PAUSE EXPLICITO na montagem. Na web o elemento <video> que o expo-video
     * cria pode comecar sozinho (o navegador libera a partida automatica
     * enquanto o som ainda nao acordou), e a Madre Maria falando sem ninguem
     * ter pedido e exatamente o que esta tela nao pode fazer — visto em
     * producao em 10/09, o video ja estava rodando ao abrir. */
    try {
      p.pause();
    } catch {
      /* player recem-nascido em alguma plataforma: o toque resolve */
    }
  });
  const [jaTocou, setJaTocou] = useState(false);
  const { indice, tocando } = useFraseAtual(player, TRECHOS, { ativo: true, duracao: DURACAO });

  const alternar = useCallback(() => {
    try {
      if (player.playing) {
        player.pause();
      } else {
        // Terminou? Volta ao comeco antes de tocar de novo.
        if (DURACAO > 0 && player.currentTime >= DURACAO - 0.3) player.currentTime = 0;
        player.play();
        setJaTocou(true);
      }
    } catch {
      /* player ja descartado (a pessoa saiu da tela) — nada a fazer */
    }
  }, [player]);

  const scrollRef = useRef(null);
  const janela = useRef({ y: 0, altura: 0 });
  const aoRolar = useCallback((evento) => {
    janela.current.y = evento?.nativeEvent?.contentOffset?.y || 0;
  }, []);
  const aoMedirJanela = useCallback((evento) => {
    janela.current.altura = evento?.nativeEvent?.layout?.height || 0;
  }, []);

  const rotulo = tocando ? t('apresentacao.video.pausar') : jaTocou ? t('apresentacao.video.denovo') : t('apresentacao.video.assistir');

  return (
    <View style={estilos.raiz}>
      {/* Irmao em posicao absoluta, nunca pai: HiloFondo ignora children.
          'tenso' de proposito: o fio puxado e a entrada, nao a conversa. */}
      <HiloFondo variante="tenso" />

      <SafeAreaView style={estilos.seguro}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={estilos.conteudo}
          onScroll={aoRolar}
          onLayout={aoMedirJanela}
          scrollEventThrottle={32}
        >
          <Sobreceja>{t('apresentacao.sobreceja')}</Sobreceja>
          <Titulo style={estilos.titulo}>{t('apresentacao.titulo')}</Titulo>

          {/* O VIDEO. Tocar nele tambem toca/pausa; o botao abaixo e o mesmo
              comando com nome, para leitor de tela e para quem prefere botao. */}
          <Pressable
            onPress={alternar}
            accessibilityRole="button"
            accessibilityLabel={rotulo}
            style={estilos.moldura}
          >
            <VideoView
              player={player}
              style={estilos.video}
              contentFit="cover"
              nativeControls={false}
              allowsFullscreen={false}
              allowsPictureInPicture={false}
            />
            {!jaTocou ? (
              <Image source={POSTER_APRESENTACAO} style={estilos.poster} resizeMode="cover" accessible={false} />
            ) : null}
          </Pressable>
          <BotonPrimario titulo={rotulo} onPress={alternar} style={estilos.assistir} />
          <Micro style={estilos.nota}>{t('apresentacao.video.nota')}</Micro>

          {/* Com o video parado (indice -1) e o texto inteiro, sem destaque. */}
          <TextoNoRitmo
            trechos={TRECHOS}
            indice={indice}
            tocando={tocando}
            scrollRef={scrollRef}
            janelaRef={janela}
            style={estilos.texto}
          />

          <BotonPrimario titulo={t('apresentacao.botao')} onPress={comecar} style={estilos.botao} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const estilos = StyleSheet.create({
  raiz: {
    flex: 1,
    backgroundColor: colores.noche,
  },
  seguro: { flex: 1 },
  conteudo: {
    padding: espacio.xl,
    paddingBottom: espacio.xxxl,
  },
  titulo: { marginTop: espacio.sm },
  /* A moldura: 4:5 com o video em `cover` — o quadro original e 9:16, e o
   * corte tira so um pouco do teto e da mesa; ela fica inteira. Borda do fio
   * como TRACO (regra 9 do theme). */
  moldura: {
    marginTop: espacio.lg,
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: radio.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colores.bordeHilo,
    backgroundColor: colores.penumbra,
  },
  video: { width: '100%', height: '100%' },
  poster: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  assistir: { marginTop: espacio.md },
  nota: { marginTop: espacio.sm, textAlign: 'center', color: colores.ceniza },
  texto: { marginTop: espacio.lg },
  botao: { marginTop: espacio.xxl },
});
