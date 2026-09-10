// NÓS HOJE — a fusão de Agir + Reconectar + Descobrir (10/09/2026)
//
// Pedido do dono: "eu preciso que para fazer junto com o casal seja menos
// funções ali, depois junte tudo em 2 funções só".
//
// POR QUE ESTAS TRÊS, E NÃO OUTRAS: o código já desenhava essa fronteira
// sozinho. As três são AÇÃO — o que o casal FAZ hoje —, e há uma cadeia de
// dependência real entre elas que hoje obriga a pessoa a sair de uma tela pra
// outra funcionar: o quiz de Descobrir alimenta a trilha recomendada de
// Reconectar (ReconectarScreen.js) e prioriza as ideias de encontro de Agir
// (AgirScreen.js). Separadas, a pessoa precisa descobrir sozinha essa ligação.
//
// COMO A FUSÃO FOI FEITA, E POR QUE ASSIM: por ABAS, montando as telas que já
// existem, sem reescrever uma linha do que elas fazem. A alternativa — copiar
// as seções pra um arquivo novo — significaria reproduzir 1.400 linhas de
// lógica de storage, quiz e progresso, e cada bug corrigido no futuro teria
// dois lugares pra corrigir. Aqui, o conteúdo continua sendo o arquivo
// original: mexer em Agir continua mexendo na aba Agir.
//
// O QUE SE PERDE, dito com honestidade: cada tela tinha seu próprio cabeçalho
// com gradiente (rosa, roxo, dourado) e agora dividem um só. É perda estética,
// não de função. O que NÃO se perde: o quiz de Descobrir continua ocupando a
// tela inteira quando aberto, porque ele é a aba — não virou seção espremida
// dentro de um scroll alheio.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import AgirScreen from './AgirScreen';
import ReconectarScreen from './ReconectarScreen';
import DescobrirScreen from './DescobrirScreen';

const ABAS = [
  { key: 'agir', icone: 'flash', tituloKey: 'home.card.agir.title', Tela: AgirScreen },
  { key: 'reconectar', icone: 'heart-circle', tituloKey: 'home.card.reconectar.title', Tela: ReconectarScreen },
  { key: 'descobrir', icone: 'telescope', tituloKey: 'home.card.descobrir.title', Tela: DescobrirScreen },
];

export default function NosHojeScreen({ route }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // `aba` na rota permite entrar direto numa delas — é o que mantém vivos os
  // atalhos e deep links das três telas antigas (ver App.js).
  const inicial = ABAS.findIndex((a) => a.key === route?.params?.aba);
  const [ativa, setAtiva] = useState(inicial >= 0 ? inicial : 0);
  const Atual = ABAS[ativa].Tela;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.topo}>
        <Pressable
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel={t('explore.back')}
          style={({ pressed }) => [styles.voltar, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.titulo}>{t('nosHoje.title')}</Text>
        <View style={styles.voltar} />
      </View>

      {/* As abas: rótulo curto e ícone, sem gradiente. Uma cor de ação só (o
          dourado), como no resto do app — a aba ativa ganha o filete, não um
          fundo colorido. */}
      <View style={styles.abas}>
        {ABAS.map((aba, i) => {
          const sel = i === ativa;
          return (
            <Pressable
              key={aba.key}
              testID={`nos-hoje-aba-${aba.key}`}
              onPress={() => setAtiva(i)}
              accessibilityRole="tab"
              accessibilityState={{ selected: sel }}
              accessibilityLabel={t(aba.tituloKey)}
              style={({ pressed }) => [styles.aba, sel && styles.abaAtiva, pressed && styles.pressed]}
            >
              <Ionicons name={aba.icone} size={16} color={sel ? colors.gold : colors.textMuted} />
              <Text style={[styles.abaTxt, sel && styles.abaTxtAtiva]} numberOfLines={1}>
                {t(aba.tituloKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* A tela original inteira, intacta. Ela traz o próprio scroll e o
          próprio gate de casal — nada aqui duplica essa lógica. */}
      <View style={styles.corpo}>
        <Atual dentroDeAba />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10,
  },
  voltar: {
    width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  titulo: { color: colors.text, fontSize: 16, fontWeight: '700' },
  abas: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, paddingBottom: 10 },
  aba: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 9, borderRadius: 12, backgroundColor: colors.surface,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  abaAtiva: { borderBottomColor: colors.gold, backgroundColor: colors.surfaceElevated },
  abaTxt: { color: colors.textMuted, fontSize: 12, fontWeight: '600', flexShrink: 1 },
  abaTxtAtiva: { color: colors.text },
  pressed: { opacity: 0.75 },
  corpo: { flex: 1 },
});
