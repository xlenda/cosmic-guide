// A TABELA DE DADOS — rótulo à esquerda, valor à direita, fio fino no meio.
// (12/09/2026)
//
// O QUE É. A ficha do print "WhatsApp Image 2026-08-08 at 20.55.50": Nome /
// Género / Data de nasc. / Hora de nasc. / Local de nasc., cada um numa linha,
// rótulo à esquerda com peso um degrau acima, valor à direita, e uma divisória
// de 1px entre as linhas. Alguns valores (os que vêm de escolha — a data, a
// hora) aparecem dentro de uma PÍLULA; os de texto livre ficam soltos. O Mapa
// do Cosmic mostra a mesma informação como texto corrido, e texto corrido não
// se compara nem se confere.
//
// QUANDO USAR. Em qualquer lugar que mostre um conjunto FECHADO de pares
// rótulo→valor: os dados de nascimento, o resumo de um plano, as posições
// planetárias, a ficha de uma tiragem.
//
// O QUE NÃO É. Não é grade nem planilha: uma coluna de rótulo e uma de valor,
// sem cabeçalho. Não é lista clicável de navegação (isso é card). E não é
// formulário — se a linha for tocável (`onPress` no item) o toque serve pra
// PREENCHER aquele dado, não pra navegar.
//
// A LEI DE NÃO FABRICAR, APLICADA AQUI. As linhas passam por
// lib/filtroDado.apenasReais antes de desenhar:
//   · valor real            -> linha normal;
//   · sem valor + `convite` -> linha com o convite em texto apagado ("adicione
//                              sua hora de nascimento"), tocável se houver
//                              onPress;
//   · sem valor e sem convite -> A LINHA NÃO EXISTE. Nunca um traço mudo,
//                              nunca "não informado", nunca zero de enfeite.
// Zero e false são valores REAIS e aparecem (ver lib/filtroDado.js).
//
// ESTADO VAZIO. Se NENHUMA linha sobrar, a tabela devolve `vazio` (um nó que
// quem usa passa) ou, na falta dele, null — a peça some inteira em vez de
// desenhar uma moldura com nada dentro. Moldura vazia é o que mais estraga app
// bonito.
//
// EM 390px. Rótulo e valor dividem a linha com flex; o valor pode quebrar em
// duas linhas e a divisória acompanha. `flexShrink` no rótulo impede que um
// rótulo longo empurre o valor pra fora da tela.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, space, type } from '../theme';
import { apenasReais } from '../lib/filtroDado';

export default function TabelaDados({
  itens,            // [{ chave, rotulo, valor, convite, pilula, onPress }]
  vazio = null,     // o que desenhar se nada sobrar (default: nada)
  style,
  testID = 'tabela-dados',
}) {
  const linhas = apenasReais(itens);
  if (linhas.length === 0) return vazio;

  return (
    <View style={[styles.tabela, style]} testID={testID}>
      {linhas.map((linha, i) => {
        const id = linha.chave || linha.rotulo || String(i);
        const conteudo = (
          <View
            style={[styles.linha, i > 0 && styles.comFio]}
            // A última linha não leva fio embaixo: fio solto no fim da tabela
            // lê como "tem mais coisa que não carregou".
          >
            <Text style={styles.rotulo} numberOfLines={2}>
              {linha.rotulo}
            </Text>
            {linha.pendente ? (
              // O convite honesto. Apagado de propósito: ele não é o dado, é o
              // caminho pro dado.
              <Text style={styles.convite} numberOfLines={2}>
                {linha.convite}
              </Text>
            ) : linha.pilula ? (
              <View style={styles.pilula}>
                <Text style={styles.valorPilula} numberOfLines={2}>
                  {String(linha.valor)}
                </Text>
              </View>
            ) : (
              <Text style={styles.valor} numberOfLines={2}>
                {String(linha.valor)}
              </Text>
            )}
          </View>
        );

        return linha.onPress ? (
          <TouchableOpacity
            key={id}
            onPress={linha.onPress}
            activeOpacity={0.7}
            testID={`${testID}-${id}`}
            // Só o que é tocável anuncia que é tocável.
            accessibilityRole="button"
          >
            {conteudo}
          </TouchableOpacity>
        ) : (
          <View key={id} testID={`${testID}-${id}`}>
            {conteudo}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabela: { width: '100%' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space.bloco,
    // Espaço mínimo entre rótulo e valor quando os dois são longos.
    gap: space.bloco,
  },
  // O FIO. 1px na cor de borda, com alfa: fio forte vira grade de planilha.
  comFio: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  // O rótulo é o único texto aqui que ganha peso — é a hierarquia da ficha
  // deles (rótulo mais forte, valor normal). Fora disso, peso é exceção.
  rotulo: {
    ...type.corpoCurto,
    fontWeight: '600',
    color: colors.text,
    flexShrink: 1,
  },
  valor: {
    ...type.corpoCurto,
    color: colors.textSecondary,
    flexShrink: 1,
    textAlign: 'right',
  },
  convite: {
    ...type.corpoCurto,
    color: colors.textMuted,
    flexShrink: 1,
    textAlign: 'right',
  },
  pilula: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 999,
    paddingVertical: space.junto,
    paddingHorizontal: space.bloco,
    flexShrink: 1,
  },
  valorPilula: {
    ...type.corpoCurto,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
