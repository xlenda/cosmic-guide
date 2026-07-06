// Extraído de HomeScreen.js — organiza uma lista plana de itens de feature em
// linhas de `columns` colunas, reaproveitando FeatureCard. Só o layout `grid`
// migrou pra cá; `sectionTitle` continua em HomeScreen (é reusado por "Evento
// cósmico" também).
import React from 'react';
import { View, StyleSheet } from 'react-native';
import FeatureCard from './FeatureCard';

export default function CardGrid({ items, columns = 2 }) {
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
              onPress={item.onPress}
              locked={item.locked}
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
