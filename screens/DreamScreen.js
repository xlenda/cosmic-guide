import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DreamScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DreamScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#111' },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
});
