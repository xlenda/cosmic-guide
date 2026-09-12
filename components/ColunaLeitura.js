// A COLUNA DE LEITURA — a largura máxima do parágrafo. (12/09/2026)
//
// O QUE É. Um container que impede o texto longo de ir de borda a borda:
// largura limitada, centralizado na tela, com margem dos dois lados. Nos prints
// do concorrente NENHUM parágrafo encosta na borda — o "Como funciona?" deles é
// uma coluna estreita, centralizada, com bastante ar em volta. No Cosmic o
// texto ocupa toda a largura, e é isso que faz ler como documento e não como
// leitura.
//
// QUANDO USAR. Em volta de parágrafo, de texto de introdução de seção, de
// qualquer bloco com mais de duas linhas. E também em volta de um TÍTULO que vai
// quebrar em duas linhas — título largo demais quebra feio.
//
// O QUE NÃO É. Não é padding de tela (isso é space.tela no ScrollView) e não
// serve pra grade de cards, linha de estatísticas nem tabela: essas querem a
// largura toda. Não define cor nem fonte — quem usa aplica type.corpo e a cor.
//
// POR QUE 34em E NÃO UM NÚMERO DE PIXELS. A medida de legibilidade é em
// CARACTERES POR LINHA (o confortável fica entre 45 e 75), não em pixels — se
// o corpo crescer de 17 pra 19px, uma coluna em px passa a caber MAIS
// caracteres e piora. Mas React Native não aceita `em`: o cálculo é feito aqui,
// contra type.corpo.fontSize, e acompanha a fundação sozinho.
//
// EM 390px NÃO FAZ NADA — e é o certo. A coluna calculada dá ~380px; num
// celular de 390 com gutter, a largura disponível já é menor que isso, então o
// maxWidth não corta nada e o texto usa a tela inteira (que é o que se quer no
// celular). O efeito aparece no tablet e na web larga, onde hoje a linha
// atravessa 1200px e ninguém consegue achar o começo da linha seguinte.
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { space, type } from '../theme';

// ~22 caracteres por "em" de fonte é a conversão prática pra fonte de texto
// (a largura média do caractere fica perto de 0,5em). 22 × 17px ≈ 374px, que
// cai na faixa dos 45-75 caracteres.
export const LARGURA_COLUNA = Math.round(type.corpo.fontSize * 22);

export default function ColunaLeitura({
  centralizado = false, // centraliza o TEXTO também, não só a coluna
  style,
  children,
  testID,
}) {
  return (
    <View
      pointerEvents="box-none"
      style={[styles.coluna, centralizado && styles.centralizado, style]}
      testID={testID}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  coluna: {
    width: '100%',
    maxWidth: LARGURA_COLUNA,
    // alignSelf, não margin auto: funciona igual em web e nativo.
    alignSelf: 'center',
    // A margem dos dois lados que o briefing pede. Some com o padding do pai
    // quando houver — e é isso mesmo: parágrafo pede mais gutter que card.
    paddingHorizontal: space.dentro,
  },
  // Texto centralizado é a variante DELES pro bloco curto de abertura. Para
  // parágrafo de 7 linhas prefira alinhado à esquerda: centralizado longo
  // obriga o olho a caçar o começo de cada linha.
  centralizado: { alignItems: 'center' },
});
