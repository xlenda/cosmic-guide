// A LISTA COM CHECK — itens centralizados, com destaque SELETIVO.
// (12/09/2026)
//
// O QUE É. A lista do print 20.55.50: seis linhas, cada uma com um ✓ antes do
// texto, o bloco inteiro centralizado, e DUAS das seis em negrito. O destaque
// significa alguma coisa porque é raro — e é exatamente essa raridade que o
// Cosmic perdeu (471 usos de peso 800 contra dois de peso leve: quando tudo é
// negrito, nada é).
//
// QUANDO USAR. Pra enumerar o que a pessoa RECEBE: o que vem na leitura, o que
// o plano inclui, os passos de um ritual. Três a sete itens.
//
// O QUE NÃO É. Não é checklist interativo (nada aqui marca ou desmarca; pra
// tarefas do dia existe components/DailyMissionsCard.js). Não é lista de
// navegação. Não é lugar de promessa de desfecho — "Os seus talentos secretos"
// convida; "vai encontrar seu amor em 3 meses" promete, e o app não promete
// (encantamento honesto).
//
// O DESTAQUE É CONTADO, NÃO SUGERIDO. Passar `destaque: true` em mais de
// MAX_DESTAQUE itens não pinta todos: só os primeiros ganham, e os demais saem
// normais. Não é preciosismo — é a única forma de a regra sobreviver às 52
// telas. Um alerta em __DEV__ avisa quem passou demais.
//
// CENTRALIZADO POR PADRÃO, ALINHADO SOB PEDIDO. Centralizado é a variante do
// print e funciona lindo com 4-6 itens curtos. Se os itens tiverem mais de uma
// linha, passe `alinhado` — texto de duas linhas centralizado obriga o olho a
// caçar o começo de cada linha.
//
// EM 390px. Cada item é uma linha flex com o ✓ em largura fixa e o texto em
// flex: 1 — o texto quebra embaixo de si mesmo, nunca embaixo do ✓ (que é o
// defeito clássico de fazer isso com um caractere dentro do mesmo Text).
//
// ESTADO VAZIO: lista sem item devolve null. Nada de moldura vazia.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';

// A raridade É a regra. Dois destaques em seis é o print; acima de três o
// destaque deixa de destacar.
export const MAX_DESTAQUE = 3;

export default function ListaCheck({
  itens,                 // [{ chave, texto, destaque }] ou ['texto', ...]
  alinhado = false,      // true = alinha à esquerda (itens de mais de uma linha)
  cor = colors.accent,   // a cor do ✓
  style,
  testID = 'lista-check',
}) {
  const lista = Array.isArray(itens) ? itens : [];
  if (lista.length === 0) return null;

  const normalizados = lista.map((it, i) =>
    typeof it === 'string' ? { chave: String(i), texto: it, destaque: false } : { chave: String(i), ...it }
  );

  // Corta o excesso de destaque: só os MAX_DESTAQUE primeiros valem.
  let usados = 0;
  const finais = normalizados.map((it) => {
    if (it.destaque && usados < MAX_DESTAQUE) {
      usados += 1;
      return it;
    }
    return it.destaque ? { ...it, destaque: false } : it;
  });

  if (__DEV__) {
    const pedidos = normalizados.filter((it) => it.destaque).length;
    if (pedidos > MAX_DESTAQUE) {
      console.warn(
        `ListaCheck: ${pedidos} itens pediram destaque, só ${MAX_DESTAQUE} ganharam. ` +
          'Destaque em tudo é destaque em nada — escolha quais dois importam.'
      );
    }
  }

  return (
    <View style={[styles.lista, !alinhado && styles.centralizada, style]} testID={testID}>
      {finais.map((it) => (
        <View
          key={it.chave}
          style={[styles.item, !alinhado && styles.itemCentralizado]}
          testID={`${testID}-${it.chave}`}
        >
          <Ionicons
            name="checkmark"
            size={type.corpoCurto.fontSize + 3}
            color={cor}
            style={styles.check}
          />
          <Text style={[styles.texto, it.destaque && styles.textoDestaque, alinhado && styles.textoAlinhado]}>
            {it.texto}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  lista: {
    width: '100%',
    // `junto`: linhas irmãs dentro do mesmo bloco.
    gap: space.junto,
  },
  centralizada: { alignItems: 'center' },
  item: {
    flexDirection: 'row',
    // flex-start, não center: com texto de duas linhas o ✓ tem que ficar na
    // PRIMEIRA linha, não boiando no meio do parágrafo.
    alignItems: 'flex-start',
    gap: space.junto,
  },
  // Centralizado: o item encolhe pro tamanho do seu texto e o conjunto fica
  // centralizado. Sem isto todos ocupariam a largura toda e o ✓ ficaria colado
  // na borda esquerda.
  itemCentralizado: { maxWidth: '100%' },
  // O ✓ desce 2px: o topo do glifo fica acima da altura-x do texto e sem isso
  // parece flutuar.
  check: { marginTop: 2 },
  texto: {
    ...type.corpoCurto,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  textoAlinhado: { flex: 1 },
  // O ÚNICO lugar desta peça onde o peso sobe — e só em dois itens. Cor
  // também muda: branco puro contra o cinza claro dos demais. Os dois juntos
  // é o que faz o destaque se ler sem gritar.
  textoDestaque: {
    fontWeight: '600',
    color: colors.text,
  },
});
