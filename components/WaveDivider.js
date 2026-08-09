// A ONDA DIVISÓRIA — a faixa orgânica que separa seções, no lugar do "vão
// entre cards". (08/08/2026, Onda Cenográfica)
//
// A diagramação do concorrente premium não divide seções com espaço: divide
// com uma COLINA — uma banda escura de borda curva atravessando a tela, que
// faz o rolo ler como paisagem contínua ("agora entramos em outra parte do
// céu") em vez de lista de caixas. Este componente é essa colina, EM FLUXO
// (dentro do ScrollView, ocupa altura de verdade): 2 camadas de roxo vizinho
// com raio gigante no topo e rotação leve, mesmo truque sem-SVG do
// CosmicScene.js.
//
// pointerEvents none SEMPRE: decoração nunca rouba toque (lição do iOS).
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function WaveDivider({ height = 64, style }) {
  return (
    <View pointerEvents="none" style={[{ height, overflow: 'visible' }, styles.wrap, style]}>
      <View style={[styles.onda, styles.ondaTras]} />
      <View style={[styles.onda, styles.ondaFrente]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    // Sangra até as bordas da tela mesmo dentro de conteúdo com gutter:
    // a colina é da PAISAGEM, não do bloco de conteúdo.
    marginHorizontal: -40,
  },
  onda: {
    position: 'absolute',
    left: '-12%',
    right: '-12%',
    height: 200,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  // NUVENS PÉROLA (08/08/2026): a divisória acompanha o cenário — lavanda
  // clara em opacidade baixa, nuvem e não muro. Ver CosmicScene.js.
  ondaTras: {
    top: 18,
    backgroundColor: '#C9CFF2',
    opacity: 0.10,
    transform: [{ rotate: '1.6deg' }],
  },
  ondaFrente: {
    top: 34,
    backgroundColor: '#8F9AE5',
    opacity: 0.18,
    transform: [{ rotate: '-1.2deg' }],
  },
});
