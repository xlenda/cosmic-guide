// Seletor de cidade de nascimento — componente ÚNICO, compartilhado por
// screens/BirthChartScreen.js e screens/QuizScreen.js (antes era o mesmo
// componente copiado nos dois arquivos, e o bug abaixo existia nas duas cópias).
//
// ===========================================================================
// BUG QUE ESTE ARQUIVO CORRIGE — E QUE NÃO PODE VOLTAR (relato real de tester,
// 26/07/2026: "no Mapa Astral só tem a cidade de São Paulo - SP"):
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
// mais cidades abaixo. Medido com Playwright contra o dist/ de produção:
//   375x667 (sem teclado) -> lista 260px, 6 linhas
//   375x340 (com teclado) -> lista  77px, 2 linhas
//   360x300 (com teclado) -> lista  45px, 1 linha  <- o relato do tester
// No iOS/Safari a viewport de layout NÃO encolhe, mas a sheet fica ancorada
// embaixo e o teclado cobre ela — mesmo sintoma por outro caminho.
//
// CORREÇÃO (preservada intacta nesta versão): painel de tela cheia ancorado no
// TOPO, sem nenhuma altura em porcentagem. A lista usa flex:1 + minHeight:0
// (nunca maxHeight), então fica com TODO o espaço que sobrar, seja qual for a
// altura da viewport. Os estilos `panel` e `list` abaixo são o coração disso —
// mexer neles é reabrir o bug.
//
// ===========================================================================
// O QUE MUDOU AGORA (29-30/07/2026) — relato do tester seguinte:
//
//   "Mapa astral ok mas sem minha cidade Junqueirópolis."
//
// A busca deixou de ser só na lista embutida e passou a consultar o servidor
// (GET /api/cities/search, ~150 mil cidades do GeoNames). Três regras
// inegociáveis nesta tela, que é a PORTA DE ENTRADA do app:
//
//   1. A LISTA NUNCA FICA VAZIA ESPERANDO A REDE. Cada tecla mostra na hora o
//      resultado da reserva offline embutida (lib/cities.js, 151 cidades) e o
//      resultado do servidor SUBSTITUI quando chega. Sem tela em branco, sem
//      spinner no lugar do conteúdo.
//   2. ERRO DE REDE NÃO TRAVA NADA. Sem internet, ou com o servidor sem o
//      banco de referência (503), a reserva continua atendendo e um aviso
//      discreto explica por que a lista está menor. Nada de modal de erro,
//      nada de botão morto.
//   3. UMA REQUISIÇÃO POR PAUSA, NÃO POR TECLA. O debounce vive em
//      createCitySearch() (lib/cities.js): digitar "junqueiropolis" gera 1-2
//      requisições em vez de 14, e resposta de busca velha que chega atrasada
//      é descartada em vez de fazer a lista piscar.
//
// A licença dos dados (GeoNames, CC BY 4.0) exige crédito visível — ele está
// no rodapé da lista.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { cityLabel, createCitySearch, CITY_ATTRIBUTION, CITIES } from '../lib/cities';

const ROW_HEIGHT = 46;

// Estado inicial: a reserva inteira, em ordem de população. É o que aparece
// antes de digitar qualquer coisa — e o que aparece se a rede estiver morta.
const ESTADO_INICIAL = { items: CITIES, source: 'local', loading: false, error: null, query: '' };

// Mensagem do aviso de rede. Distingue os dois casos porque eles pedem
// providências diferentes do DONO (o usuário só precisa saber que pode
// continuar): 'offline' é o aparelho, 'indisponivel' é o servidor ainda sem o
// banco de cidades (`node scripts/import-cities.js` não rodou).
function textoDoAviso(error) {
  if (error === 'indisponivel') return 'Busca completa indisponível no momento — mostrando as principais cidades.';
  if (error === 'offline') return 'Sem conexão — mostrando as principais cidades salvas no app.';
  if (error) return 'Não deu para buscar agora — mostrando as principais cidades salvas no app.';
  return null;
}

export default function CityPickerModal({
  visible,
  hasSelection,
  onClose,
  onSelect,
  onClear,
  // Data e hora de nascimento, quando a tela já tem (o Mapa Astral tem). Vão
  // como `at` na busca, e cada cidade volta com o fuso JÁ resolvido pro
  // instante do nascimento — inclusive horário de verão. Uma chamada a menos.
  birthDate = null,
  birthTime = null,
  lang = 'pt',
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [estado, setEstado] = useState(ESTADO_INICIAL);

  // Um buscador por instância do modal, criado uma vez. Ele guarda o timer do
  // debounce e o AbortController da requisição em voo.
  const buscador = useRef(null);
  if (!buscador.current) buscador.current = createCitySearch();

  const at = useMemo(() => {
    if (!birthDate) return null;
    return birthTime ? `${birthDate}T${birthTime}` : birthDate;
  }, [birthDate, birthTime]);

  useEffect(() => {
    if (visible) {
      setQuery('');
      setEstado(ESTADO_INICIAL);
    } else {
      // Fechou no meio de uma busca: não deixa requisição pendurada nem
      // setState em componente escondido.
      buscador.current.cancel();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    buscador.current.run(query, { lang, at, emit: setEstado });
    return () => buscador.current.cancel();
  }, [query, visible, lang, at]);

  const repetirBusca = useCallback(() => {
    buscador.current.run(query, { lang, at, emit: setEstado });
  }, [query, lang, at]);

  const results = estado.items;
  const aviso = textoDoAviso(estado.error);

  // O contador é o que diz "a lista rola, tem mais coisa aí embaixo" — foi
  // parte da correção do bug do teclado e continua igual. Só ganhou os estados
  // de carregando e de busca do servidor.
  let contador;
  if (estado.loading && results.length === 0) contador = 'Buscando...';
  else if (results.length === 0) contador = 'Nenhuma cidade encontrada';
  else {
    contador = `${results.length} cidade${results.length > 1 ? 's' : ''} — role para ver todas`;
    if (estado.loading) contador += ' · buscando mais...';
  }

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
            placeholder="Buscar qualquer cidade do mundo..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            testID="city-picker-input"
          />
          {estado.loading ? (
            <ActivityIndicator size="small" color={colors.textMuted} testID="city-picker-loading" />
          ) : null}
          {query && !estado.loading ? (
            <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpar busca">
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {aviso ? (
          // Aviso, não erro: informa e oferece o retry, mas a lista abaixo
          // continua utilizável. Nunca bloqueia a escolha.
          <View style={styles.warnRow} testID="city-picker-warning">
            <Ionicons name="cloud-offline-outline" size={14} color={colors.textMuted} />
            <Text style={styles.warnText}>{aviso}</Text>
            <TouchableOpacity onPress={repetirBusca} accessibilityLabel="Tentar de novo">
              <Text style={styles.warnRetry}>Tentar de novo</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.counter} testID="city-picker-counter">
          {contador}
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
            estado.loading ? null : (
              <Text style={styles.empty}>
                {estado.error
                  ? 'A busca completa não está disponível agora. Enquanto isso, procure a cidade grande mais próxima — até ~50 km o Ascendente é o mesmo em 98% dos casos.'
                  : 'Não encontramos essa cidade. Tente só o começo do nome (ex.: "junqueiro"), sem acento, ou o nome do distrito/município vizinho.'}
              </Text>
            )
          }
          ListFooterComponent={
            <View style={styles.footerWrap}>
              {results.length > 0 && estado.source === 'local' ? (
                <Text style={styles.footerHint}>
                  Não achou a sua? Escolha a cidade mais próxima: até ~50 km de diferença o Ascendente
                  é o mesmo em 98% dos casos.
                </Text>
              ) : null}
              {/* Crédito obrigatório da licença CC BY 4.0 dos dados do GeoNames. */}
              <Text style={styles.credit}>{CITY_ATTRIBUTION}</Text>
            </View>
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
  // Aviso de rede: uma linha discreta, altura fixa pequena. NÃO pode crescer a
  // ponto de comer a lista quando o teclado está aberto (ver o bug do topo).
  warnRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  warnText: { color: colors.textMuted, fontSize: 11, flex: 1, lineHeight: 15 },
  warnRetry: { color: colors.accent, fontSize: 11, fontWeight: '700' },
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
  footerWrap: { paddingBottom: 8 },
  footerHint: { color: colors.textMuted, fontSize: 11, textAlign: 'center', paddingVertical: 16, lineHeight: 16 },
  credit: { color: colors.textMuted, fontSize: 10, textAlign: 'center', opacity: 0.7, paddingBottom: 8 },
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
