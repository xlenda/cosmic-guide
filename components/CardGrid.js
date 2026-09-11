// Extraído de HomeScreen.js — organiza uma lista plana de itens de feature em
// linhas de `columns` colunas, reaproveitando FeatureCard. Só o layout `grid`
// migrou pra cá; `sectionTitle` continua em HomeScreen (é reusado por "Evento
// cósmico" também).
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FeatureCard from './FeatureCard';
import { tileArte } from '../lib/ilustracoes';

// testIDPrefix existe porque a mesma feature aparece em DUAS telas: a grade da
// Home e a lista do Explorar (que usa `card-${key}` fixo). Com o mesmo testID
// nos dois lugares, todo getByTestId('card-tarot') do e2e acha dois elementos e
// estoura por ambiguidade. A Home passa 'home-card'; o Explorar segue 'card'.
export default function CardGrid({ items, columns = 2, testIDPrefix = 'card' }) {
  const rows = [];
  for (let i = 0; i < items.length; i += columns) {
    rows.push(items.slice(i, i + columns));
  }

  return (
    <>
      {rows.map((row, i) => (
        <View key={i} style={styles.grid}>
          {row.map((item) => (
            <FeatureCard
              key={item.key}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              gradient={item.gradient}
              arte={item.arte !== undefined ? item.arte : tileArte(item.key)}
              // ALTURA VARIADA (11/09/2026, referência trazida pelo dono): a
              // grade tinha todos os banners em 84px e lia como planilha. Os
              // cards de destaque ganham banner alto; o resto fica no de
              // sempre. O ritmo vem da variação, não de cor nova — o dourado
              // continua sendo a única cor de ação do app.
              destaque={item.destaque}
              onPress={item.onPress}
              locked={item.locked}
              testID={`${testIDPrefix}-${item.key}`}
            />
          ))}
        </View>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 12 },
});
