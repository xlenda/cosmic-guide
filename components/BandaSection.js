// A ZONA DE COR — o CHÃO que muda embaixo de uma seção inteira. (09/08/2026)
//
// Nos prints do concorrente premium a tela não é um céu único com cards em
// cima: é dividida em ZONAS — céu escuro → uma faixa larga ARREDONDADA um
// degrau mais clara contendo uma seção inteira → escuro de novo → outra
// faixa. As ondas/colinas são as BORDAS dessas zonas, não enfeite solto. A
// nossa WaveDivider resolvia a borda mas nunca mudava o chão: o rolo seguia
// sendo caixas flutuando no mesmo escuro. Este wrapper é o chão que faltava.
//
// TONS: sempre VIZINHOS da paleta (theme.js), nunca cor nova gritante — o
// print do concorrente usa degraus de tom, não blocos berrantes:
//   'claro' #221A48 — um degrau acima do background #0E0821, no caminho do
//                     surfaceElevated #251A46 (os cards surface #1A1235
//                     continuam legíveis por cima);
//   'medio' #1C1440 — meio degrau, parente direto do surface #1A1235;
//   'rosa'  #2A1840 — o degrau do claro puxado um fio pro rosa (a família
//                     do pink #FF7BD5, que é a cor do amor no app), pro
//                     grupo do casal ter chão próprio sem virar outdoor.
//
// FULL-BLEED: a Home monta as zonas direto no ScrollView, que é edge-to-edge
// (só paddingBottom) — largura total já sangra até as bordas da tela, e os
// filhos trazem o próprio gutter 20 (marginHorizontal deles), então não há o
// que compensar. Se um dia a zona morar dentro de um container COM padding
// horizontal, é pelo `style` que entra o marginHorizontal negativo
// equivalente — nunca cravado aqui, senão a Home sangraria pra fora da tela.
//
// pointerEvents="box-none": a zona é chão, nunca alvo de toque — mas os
// filhos (cards com onPress) continuam vivos; "none" mataria o toque deles
// (a lição do iOS da WaveDivider vale ao contrário aqui: lá é decoração sem
// filho interativo, aqui o chão CARREGA os interativos).
// overflow: 'visible': cards da Home têm sombra (horoCard) e ela não pode
// ser decepada na borda da zona.
import React from 'react';
import { View, StyleSheet } from 'react-native';

const TONS = {
  claro: '#221A48',
  medio: '#1C1440',
  rosa: '#2A1840',
};

export default function BandaSection({ tom = 'claro', style, children }) {
  return (
    <View pointerEvents="box-none" style={[styles.banda, { backgroundColor: TONS[tom] || TONS.claro }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  banda: {
    // Raio GRANDE nas quatro pontas — a borda arredondada da zona É o corte
    // que a onda fazia; raio tímido leria como card gigante, não como chão.
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 26,
    // O vão entre zonas (e entre zona e grupo vizinho) é o céu escuro
    // aparecendo — o ritmo escuro→claro→escuro é a diagramação inteira.
    marginTop: 12,
    marginBottom: 20,
    overflow: 'visible',
  },
});
