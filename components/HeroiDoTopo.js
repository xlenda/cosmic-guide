// O HERÓI DO TOPO — o gráfico grande que ancora o terço superior da tela.
// (12/09/2026)
//
// O QUE É. Nos prints, o topo NUNCA é uma barra de título: é uma IMAGEM
// GRANDE ocupando o terço de cima — a roda do zodíaco atrás do "Leitura
// Pessoal do Mapa Astral" (print 20.55.50), a paisagem com o sol nascendo
// (print 20.55.54 (1)). O gráfico não é enfeite no canto: é o centro da
// composição, e o texto pousa EM CIMA ou logo abaixo dele. Esta peça é esse
// bloco: arte grande, desvanecendo no fundo, com o título e uma linha de apoio
// por baixo.
//
// QUANDO USAR. Na abertura de uma tela de conteúdo — Mapa, Horóscopo,
// Compatibilidade, uma leitura. Uma por tela.
//
// O QUE NÃO É.
//   · Não é um fundo novo. É a lei mais importante desta peça: o fundo do app
//     é components/CosmicScene.js e continua sendo. DOIS FUNDOS BRIGANDO É
//     PIOR QUE UM FUNDO SIMPLES. Aqui não há gradiente de céu, nem estrelas,
//     nem colinas próprias — só a arte, e ela desaparece por baixo num
//     gradiente até a cor de fundo, pra emendar no cenário que já está lá.
//   · Não é components/HeroSection.js. Aquele é o cabeçalho da HOME
//     (saudação + data + badge do signo, num LinearGradient) e continua sendo
//     dele. Este é o topo ilustrado de uma tela de conteúdo.
//   · Não cria arte. A arte vem de lib/ilustracoes.js (CENAS, MASCOTES,
//     PLANETAS, TILES) — `fonte` aceita o que aqueles require() devolvem. Ou
//     passe `grafico` e desenhe o que quiser (a roda do zodíaco, um Svg).
//
// SEM ARTE, AINDA FUNCIONA. Sem `fonte` e sem `grafico`, a peça vira só o
// título com o respiro do topo — que é o print 20.55.49, a tela de uma ideia
// só com metade em céu vazio. Esse é o estado vazio, e ele é DESEJÁVEL, não um
// remendo: o fundo estrelado já é bonito o bastante pra carregar uma tela.
//
// ALTURA. O terço superior de 844px de tela é ~280px, e é o default. Em tela
// larga a arte não estica além disso: ela é capada por `maxWidth` na coluna e
// centralizada — imagem de 640px esticada em 1200 fica borrada.
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, space, type } from '../theme';
import ColunaLeitura from './ColunaLeitura';

export const ALTURA_HEROI = 280;

export default function HeroiDoTopo({
  fonte,                 // asset de lib/ilustracoes.js (mascoteDoSigno, CENAS…)
  grafico,               // OU um nó qualquer (Svg, a roda do zodíaco…)
  titulo,
  apoio,                 // a linha fina abaixo do título
  altura = ALTURA_HEROI,
  style,
  children,              // o que vier depois do apoio (um botão, uma fileira)
  testID = 'heroi-topo',
}) {
  const temArte = !!(fonte || grafico);

  return (
    <View pointerEvents="box-none" style={[styles.heroi, style]} testID={testID}>
      {temArte && (
        <View pointerEvents="none" style={[styles.arte, { height: altura }]}>
          {grafico || (
            <Image
              source={fonte}
              // COVER, e não contain (medido em 12/09/2026 na vitrine): a arte
              // do pack é QUADRADA (640×640) e tem fundo claro próprio. Num
              // bloco de 390×280 o `contain` deixa o quadrado inteiro visível
              // — e com ele o céu claro do JPEG, que desenha uma CAIXA BRANCA
              // em volta da arte no meio do app escuro. Era exatamente o
              // oposto do print, onde a arte sangra de borda a borda sem
              // moldura nenhuma. `cover` preenche a largura e corta em cima e
              // embaixo; a composição do pack é centrada, então o personagem
              // sobrevive ao corte.
              resizeMode="cover"
              style={styles.imagem}
            />
          )}
          {/* A EMENDA. Sem isto a imagem termina numa borda reta e a tela
              vira "foto colada em cima do céu". O gradiente vai de
              transparente até colors.background — a mesma cor que o
              CosmicScene tem embaixo — então a arte se dissolve no cenário
              em vez de acabar. Cobre o terço de baixo da arte. */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={styles.emenda}
            pointerEvents="none"
          />
        </View>
      )}

      {/* Sem arte, o respiro do topo é o que faz a tela de uma ideia só.
          `respiro` (64) é o degrau reservado exatamente pra isso. */}
      <ColunaLeitura centralizado style={!temArte && styles.semArte}>
        {!!titulo && (
          <Text style={styles.titulo} testID={`${testID}-titulo`}>
            {titulo}
          </Text>
        )}
        {!!apoio && (
          <Text style={styles.apoio} testID={`${testID}-apoio`}>
            {apoio}
          </Text>
        )}
        {children}
      </ColunaLeitura>
    </View>
  );
}

const styles = StyleSheet.create({
  heroi: { width: '100%' },
  arte: {
    width: '100%',
    // A arte do pack é 640px. Esticada em tela larga fica borrada — capa aqui
    // e centraliza.
    maxWidth: 640,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    // -space.secao: o título sobe por cima da barra de emenda, que é o que o
    // print faz (o "O próximo passo rumo à autodescoberta" invade a roda).
    marginBottom: -space.secao,
  },
  imagem: { width: '100%', height: '100%' },
  emenda: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // O terço de baixo da arte. Menos que isso e a emenda se vê; mais e come
    // o desenho.
    height: '38%',
  },
  semArte: { paddingTop: space.respiro },
  titulo: {
    ...type.titulo,
    color: colors.text,
    textAlign: 'center',
  },
  apoio: {
    ...type.corpo,
    color: colors.textSecondary,
    textAlign: 'center',
    // `bloco`: a distância entre um rótulo e o conteúdo que ele nomeia.
    marginTop: space.bloco,
  },
});
