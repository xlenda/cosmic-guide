// Extraído de HomeScreen.js — organiza uma lista plana de itens de feature em
// `columns` colunas, reaproveitando FeatureCard. Só o layout `grid` migrou pra
// cá; `sectionTitle` continua em HomeScreen (é reusado por "Evento cósmico").
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FeatureCard from './FeatureCard';
import { tileArte } from '../lib/ilustracoes';

// MASONRY, NÃO FILEIRAS (11/09/2026, referência do dono: a grade "Todos os
// Recursos" do concorrente). Antes isto montava LINHAS — `items.slice(i, i+2)`
// dentro de um `flexDirection: 'row'`. Numa linha o flex iguala a altura das
// duas células, então um card alto SEMPRE levantava o vizinho junto: era
// impossível ter um alto ao lado de um baixo, que é justamente o que dá o
// ritmo de cascata da referência. Medido no navegador antes de reescrever —
// marcar 3 cards altos deixou as 3 primeiras LINHAS inteiras altas.
//
// Agora são COLUNAS verticais independentes: cada card entra na coluna mais
// curta no momento, então as duas descem em ritmos diferentes e um card alto
// na esquerda convive com dois curtos na direita. Como a altura real só é
// conhecida em tempo de layout, a distribuição usa o peso declarado do item
// (`destaque` = alto) em vez de medir — determinístico, sem flicker de
// remontagem, e é o que o desenho da tela pede: o alto é uma ESCOLHA de
// hierarquia, não um acidente de quanto texto coube.
// Pesos = a altura mínima que cada desenho de FeatureCard declara (corpoAlto e
// corpoBaixo). Se aqueles minHeight mudarem, estes números mudam junto — são a
// mesma medida vista de dois lugares.
const PESO_ALTO = 210;
const PESO_BAIXO = 116;

export default function CardGrid({ items, columns = 2, testIDPrefix = 'card' }) {
  const colunas = Array.from({ length: columns }, () => []);
  const alturas = new Array(columns).fill(0);

  items.forEach((item) => {
    // Coluna mais curta; empate vai pra da esquerda (indexOf pega a primeira),
    // que é o que mantém a leitura natural quando tudo tem o mesmo tamanho.
    const alvo = alturas.indexOf(Math.min(...alturas));
    colunas[alvo].push(item);
    alturas[alvo] += item.destaque ? PESO_ALTO : PESO_BAIXO;
  });

  return (
    <View style={styles.masonry}>
      {colunas.map((coluna, i) => (
        <View key={i} style={styles.coluna}>
          {coluna.map((item) => (
            <FeatureCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              gradient={item.gradient}
              arte={item.arte !== undefined ? item.arte : tileArte(item.key)}
              destaque={item.destaque}
              onPress={item.onPress}
              locked={item.locked}
              // testIDPrefix existe porque a mesma feature aparece em DUAS
              // telas: a grade da Home e a lista do Explorar (que usa
              // `card-${key}` fixo). Com o mesmo testID nos dois lugares, todo
              // getByTestId('card-tarot') do e2e acha dois elementos e estoura
              // por ambiguidade. A Home passa 'home-card'; o Explorar segue
              // 'card'.
              testID={`${testIDPrefix}-${item.key}`}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  masonry: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 12 },
  // `alignItems: 'flex-start'` é o que impede o card de esticar pra preencher
  // a coluna: sem ele o último de cada coluna cresceria pra fechar a diferença
  // de altura entre as duas, e a cascata viraria duas barras iguais de novo.
  coluna: { flex: 1, gap: 12, alignItems: 'stretch', alignSelf: 'flex-start' },
});
