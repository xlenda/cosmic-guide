// O CENÁRIO CÓSMICO — o fundo em camadas que transforma tela em paisagem.
//
// Por que existe (08/08/2026): nos 66 prints do concorrente, o que faz cada
// tela parecer cara NÃO é o conteúdo — é o fundo ser um CENÁRIO: céu com
// gradiente profundo, estrelas espalhadas e ondas/colinas de silhueta
// emoldurando o rodapé. O nosso fundo era uma cor chapada (#0E0821), e cor
// chapada lê como "lista"; cenário lê como "lugar". O dono pediu base 100%
// no visual dele — esta é a peça central da reforma.
//
// SEM ASSETS, SEM SVG, SEM ANIMAÇÃO — de propósito:
//   - react-native-svg não está nas dependências, e não entra por causa de
//     um fundo. As ondas são Views largas (160% da tela) com borderRadius
//     gigante no topo e uma rotação leve — a sobreposição de 3 delas em
//     roxos vizinhos dá a silhueta orgânica dos prints.
//   - As estrelas são ~44 pontinhos absolutos DETERMINÍSTICOS (função de
//     hash por índice via Math.sin, resolvida no carregamento do módulo) —
//     nada de Math.random por render: o céu é o mesmo em toda montagem,
//     não "formiga" quando a tela re-renderiza.
//   - Estático = barato: nenhum frame de animação disputando com o scroll.
//
// USO: primeiro filho do root da tela (o root mantém colors.background por
// baixo, pra área além do cenário nunca piscar branco):
//
//   <View style={styles.root}>
//     <CosmicScene />
//     <GradientHeader ... />
//     <ScrollView ...>
//
// pointerEvents="none" no cenário inteiro: ele nunca rouba um toque — a
// lição do bug de scroll do iOS (mobile-web-real.md) vale pra decoração.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Hash determinístico → posição/tamanho/brilho de cada estrela. O truque do
// sin(i*k)*grande e pegar a fração é o clássico de shader portado pra JS:
// espalha bem, custa nada e é idêntico em toda montagem.
const ESTRELAS = Array.from({ length: 44 }, (_, i) => {
  const a = Math.sin((i + 1) * 127.1) * 43758.5453;
  const b = Math.sin((i + 1) * 311.7) * 12543.2371;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  return {
    left: `${(fx * 96 + 2).toFixed(2)}%`,
    // Só o céu: as estrelas param antes da faixa das ondas (62% da altura).
    top: `${(fy * 62).toFixed(2)}%`,
    size: 1 + ((i * 7) % 3), // 1–3px
    opacity: 0.22 + fy * 0.45,
  };
});

export default function CosmicScene({ waves = true, style }) {
  return (
    // overflow:hidden OBRIGATÓRIO (09/08/2026): as ondas têm width 170% com
    // `left` negativo — sem clipe elas VAZAM pra fora da tela, o documento
    // fica mais largo que o viewport e o navegador mobile responde dando
    // ZOOM OUT na página inteira (medido no fluxo de perguntas: innerWidth
    // saltou de 375 pra 588, ou seja, tudo encolheu). O cenário é fundo:
    // tem que ser recortado pela tela, nunca esticá-la.
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.recorte, style]}>
      {/* O céu: do roxo profundo do topo ao quase-preto do rodapé — mesma
          família do colors.background, então a transição pro que estiver
          além do cenário é invisível. */}
      <LinearGradient
        colors={['#241448', '#140C2E', '#0E0821']}
        style={StyleSheet.absoluteFill}
      />
      {ESTRELAS.map((e, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: e.left,
            top: e.top,
            width: e.size,
            height: e.size,
            borderRadius: e.size / 2,
            backgroundColor: '#F3EEFF',
            opacity: e.opacity,
          }}
        />
      ))}
      {waves && (
        <>
          {/* Três colinas de roxos vizinhos, da mais clara (fundo) pra mais
              escura (frente) — a mais escura por último pra ficar POR CIMA
              e desenhar a borda da silhueta. */}
          <View style={[styles.onda, styles.ondaFundo]} />
          <View style={[styles.onda, styles.ondaMeio]} />
          <View style={[styles.onda, styles.ondaFrente]} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Ver o comentário no JSX: sem isto as ondas alargam o documento e o
  // navegador dá zoom out na página toda.
  recorte: { overflow: 'hidden' },
  onda: {
    position: 'absolute',
    width: '170%',
    height: 300,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  ondaFundo: {
    left: '-40%',
    bottom: -200,
    backgroundColor: '#2E2352',
    opacity: 0.55,
    transform: [{ rotate: '-3deg' }],
  },
  ondaMeio: {
    left: '-15%',
    bottom: -230,
    backgroundColor: '#251A46',
    opacity: 0.85,
    transform: [{ rotate: '2.5deg' }],
  },
  ondaFrente: {
    left: '-30%',
    bottom: -258,
    backgroundColor: '#1C1240',
    transform: [{ rotate: '-1.5deg' }],
  },
});
