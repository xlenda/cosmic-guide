import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function ScoreBar({ label, value, gradient = ['#FF6BA0', '#B57BFF'], icon }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${value}%` }]}
        />
      </View>
      <Text style={styles.value}>{value}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  label: { color: colors.textSecondary, width: 90, fontSize: 13, fontWeight: '600' },
  track: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  value: { color: colors.text, width: 42, textAlign: 'right', fontSize: 12, fontWeight: '700' },
});
