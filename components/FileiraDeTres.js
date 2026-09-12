// A FILEIRA DE TRÊS — três colunas de peso igual, número em cima, rótulo
// embaixo. (12/09/2026)
//
// O QUE É. O "Somente astrólogos verificados | 4.9 Avaliação Geral | 100 mil+
// leituras realizadas" do print 20.55.51 (1): três colunas do MESMO tamanho,
// alinhadas no topo, repetidas pelo app deles inteiro como um padrão só. É a
// peça que transforma três fatos soltos em um bloco.
//
// QUANDO USAR. Onde houver exatamente dois a quatro números que se comparam
// entre si e explicam a mesma coisa: dias de sequência / leituras / cartas
// viradas; Fogo / Terra / Ar / Água; três marcos de uma jornada.
//
// O QUE NÃO É. Não é grade de navegação (cada coluna não abre uma tela) e não
// é gráfico. Não serve pra três coisas que não se comparam — isso é lista. E
// NÃO É LUGAR DE PORCENTAGEM INVENTADA: o número tem que sair de cálculo real
// (os anéis de elementos da Home, por exemplo, já saem do mapa de nascimento) —
// a lei de não fabricar não abre exceção porque a diagramação ficaria bonita
// com um número ali.
//
// A LEI DE NÃO FABRICAR, APLICADA AQUI. Passa por lib/filtroDado.apenasReais,
// igual à tabela:
//   · com valor          -> a coluna aparece;
//   · sem valor + convite -> a coluna aparece com o convite no lugar do número,
//                            apagada;
//   · sem valor nem convite -> a coluna NÃO ENTRA. E se sobrar menos de duas
//     colunas a fileira inteira devolve `vazio` (ou null): uma coluna sozinha
//     não é fileira, é um número perdido no meio da tela.
//
// EM 390px. Três colunas em `flex: 1` com o rótulo quebrando em até duas
// linhas — é exatamente como o print se comporta ("Somente / astrólogos /
// verificados" em três linhas). Nada de scroll horizontal, nada de encolher a
// fonte: o rótulo quebra e pronto.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, space, type } from '../theme';
import { apenasReais } from '../lib/filtroDado';

export default function FileiraDeTres({
  itens,            // [{ chave, valor, rotulo, convite, cor }]
  vazio = null,
  style,
  testID = 'fileira-tres',
}) {
  const colunas = apenasReais(itens);
  // Menos de duas colunas não é comparação — é número solto. Melhor não
  // desenhar do que desenhar uma fileira torta.
  if (colunas.length < 2) return vazio;

  return (
    <View style={[styles.fileira, style]} testID={testID}>
      {colunas.map((c, i) => (
        <View key={c.chave || c.rotulo || String(i)} style={styles.coluna} testID={`${testID}-${c.chave || i}`}>
          {c.pendente ? (
            <Text style={styles.convite} numberOfLines={2}>
              {c.convite}
            </Text>
          ) : (
            <Text style={[styles.numero, c.cor ? { color: c.cor } : null]} numberOfLines={1}>
              {String(c.valor)}
            </Text>
          )}
          <Text style={styles.rotulo} numberOfLines={2}>
            {c.rotulo}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fileira: {
    flexDirection: 'row',
    // alignItems flex-start: as colunas alinham pelo TOPO. Com 'center', uma
    // coluna de rótulo em duas linhas desalinha os três números entre si — e é
    // o alinhamento dos números que faz a fileira ler como uma peça só.
    alignItems: 'flex-start',
    width: '100%',
    gap: space.junto,
  },
  coluna: {
    // Peso igual: é a regra da peça. flexBasis 0 para que o conteúdo mais
    // largo não roube espaço das vizinhas.
    flex: 1,
    flexBasis: 0,
    alignItems: 'center',
  },
  numero: {
    ...type.numero,
    color: colors.text,
    textAlign: 'center',
  },
  rotulo: {
    ...type.apoio,
    color: colors.textSecondary,
    textAlign: 'center',
    // `grudado`: o rótulo e o número são UMA coisa só. Qualquer degrau maior
    // e o olho lê dois elementos.
    marginTop: space.grudado,
  },
  convite: {
    ...type.corpoCurto,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
