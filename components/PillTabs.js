// AS SUB-ABAS PÍLULA — a assinatura de navegação do app premium concorrente.
// (09/08/2026, Onda Diagramação Espelho)
//
// Nos 66 prints, TODA tela com seções tem essa fileira de pílulas flutuando
// logo acima do dock (Compatibilidade/Sinastría/Casamento/Amor; Três cartas/
// Carta diária/Baralho/Diário; Essência/Planetas/Casas/Aspectos). Ela faz
// dois trabalhos ao mesmo tempo: navegação de seção E densidade — a tela
// mostra UMA seção por vez em vez de despejar tudo num rolo.
//
// Uso (dentro do root da tela, DEPOIS do ScrollView na árvore — flutua por
// cima; o contentContainer do ScrollView precisa de paddingBottom ≥ 96 pra
// última linha não morar embaixo da pílula):
//
//   <PillTabs
//     items={[{ id: 'essencia', label: t('...') }, ...]}
//     activeId={aba}
//     onSelect={setAba}
//   />
//
// Toque mínimo 44px de altura; rolagem horizontal quando não couber; a aba
// ativa ganha leito roxo (mesmo desenho da tab bar pílula do App.js).
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function PillTabs({ items, activeId, onSelect, style }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, style]}>
      <View style={styles.pill}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.linha}
        >
          {items.map((item) => {
            const ativo = item.id === activeId;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => onSelect(item.id)}
                style={[styles.item, ativo && styles.itemAtivo]}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={item.label}
                activeOpacity={0.8}
              >
                <Text style={[styles.rotulo, ativo && styles.rotuloAtivo]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Flutua acima do fim da tela (o dock mora FORA do container da tela, então
  // bottom pequeno aqui já pousa logo acima dele).
  wrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 10,
    alignItems: 'center',
  },
  pill: {
    backgroundColor: colors.surface + 'F2',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  linha: { paddingHorizontal: 6, paddingVertical: 5, gap: 4, alignItems: 'center' },
  item: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderRadius: 19,
    justifyContent: 'center',
  },
  itemAtivo: { backgroundColor: colors.accent },
  rotulo: { color: colors.textSecondary, fontSize: 13.5, fontWeight: '700' },
  rotuloAtivo: { color: '#fff' },
});
