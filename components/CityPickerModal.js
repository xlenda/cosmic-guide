// Seletor de cidade de nascimento — componente ÚNICO, compartilhado por
// screens/BirthChartScreen.js e screens/QuizScreen.js (antes era o mesmo
// componente copiado nos dois arquivos, e o bug abaixo existia nas duas cópias).
//
// BUG QUE ESTE ARQUIVO CORRIGE (relato real de tester, 26/07/2026:
// "no Mapa Astral só tem a cidade de São Paulo - SP"):
//
// A versão anterior era uma bottom sheet (`modalOverlay` com
// justifyContent:'flex-end') cuja altura era uma PORCENTAGEM da viewport
// (`citySheet: { maxHeight: '80%' }`), e a lista era o único filho elástico
// (`cityList: { maxHeight: 260 }`, sem minHeight e sem flex). Título, campo de
// busca e os dois botões de 48px do rodapé têm altura fixa (~195px somados),
// então TODO o encolhimento sobrava pra lista.
//
// No Android/Chrome, abrir o teclado encolhe a viewport de layout (740px →
// ~300-360px). 80% disso menos os 195px de "cromo" deixava a lista com 45-93px
// — ou seja, UMA ou DUAS linhas. Como São Paulo é o primeiro item da lista, o
// que o usuário via ao tocar no campo de busca era literalmente só
// "São Paulo, SP — Brasil", sem barra de rolagem visível pra sugerir que havia
// mais 400 cidades abaixo. Medido com Playwright contra o dist/ de produção:
//   375x667 (sem teclado) -> lista 260px, 6 linhas
//   375x340 (com teclado) -> lista  77px, 2 linhas
//   360x300 (com teclado) -> lista  45px, 1 linha  <- o relato do tester
// No iOS/Safari a viewport de layout NÃO encolhe, mas a sheet fica ancorada
// embaixo e o teclado cobre ela — mesmo sintoma por outro caminho.
//
// CORREÇÃO: painel de tela cheia ancorado no TOPO, sem nenhuma altura em
// porcentagem. A lista usa flex:1 + minHeight:0 (nunca maxHeight), então ela
// fica com TODO o espaço que sobrar, seja qual for a altura da viewport, e o
// campo de busca + as primeiras linhas ficam sempre acima do teclado nos dois
// sistemas. O cromo também encolheu (~120px) pra sobrar mais lista em telas
// baixas. Além disso mostramos o contador de resultados e um rodapé de ajuda,
// pra ficar explícito que a lista rola.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Modal, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { searchCities, cityLabel } from '../lib/cities';

const ROW_HEIGHT = 46;

export default function CityPickerModal({ visible, hasSelection, onClose, onSelect, onClear }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const results = useMemo(() => searchCities(query), [query]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View testID="city-picker-modal" style={[styles.panel, { paddingTop: insets.top + 10, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Cidade de nascimento</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} accessibilityLabel="Fechar" testID="city-picker-close">
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar cidade ou estado..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            testID="city-picker-input"
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Text style={styles.counter} testID="city-picker-counter">
          {results.length === 0
            ? 'Nenhuma cidade encontrada'
            : `${results.length} cidade${results.length > 1 ? 's' : ''} — role para ver todas`}
        </Text>

        <FlatList
          testID="city-picker-list"
          data={results}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          initialNumToRender={20}
          windowSize={11}
          getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Não encontramos essa cidade. Tente só o começo do nome (ex.: "sao ber") ou escolha a
              cidade grande mais próxima — o Ascendente muda pouquíssimo em distâncias curtas.
            </Text>
          }
          ListFooterComponent={
            results.length > 0 ? (
              <Text style={styles.footerHint}>
                Não achou a sua? Escolha a cidade mais próxima: até ~50 km de diferença o Ascendente
                é o mesmo em 98% dos casos.
              </Text>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.item} onPress={() => onSelect(item)}>
              <Text style={styles.itemText} numberOfLines={1}>
                {cityLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />

        <View style={styles.actions}>
          {hasSelection ? (
            <TouchableOpacity style={styles.ghost} onPress={onClear}>
              <Text style={styles.ghostText}>Remover cidade</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.ghost} onPress={onClose}>
              <Text style={styles.ghostText}>Pular (opcional)</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Sem porcentagem nenhuma: o painel ocupa a tela inteira e a lista fica com
  // o que sobrar. É isso que impede a lista de colapsar quando o teclado abre.
  panel: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  closeBtn: { position: 'absolute', right: 0, padding: 6 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 11 },
  counter: { color: colors.textMuted, fontSize: 11, marginTop: 8, marginBottom: 2 },
  // flex:1 + minHeight:0 = a lista absorve toda a altura restante e nunca
  // colapsa (minHeight:0 é o que permite ela encolher dentro do flex sem
  // estourar o painel em telas muito baixas).
  list: { flex: 1, minHeight: 0 },
  listContent: { paddingBottom: 8 },
  item: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemText: { color: colors.text, fontSize: 15 },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 24, lineHeight: 19 },
  footerHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', paddingVertical: 16, lineHeight: 16 },
  actions: { paddingTop: 8, paddingBottom: 8 },
  ghost: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
});
