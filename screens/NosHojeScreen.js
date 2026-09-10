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
//
// CORREÇÃO DE 10/09/2026: a frase acima ("agora dividem um só") era falsa na
// primeira versão. Eu passava uma prop `dentroDeAba` e NENHUMA das seis telas
// a lia — os dois cabeçalhos apareciam empilhados, com duas setas de voltar, e
// a de baixo saía da porta inteira. Quem apaga o cabeçalho de baixo hoje é o
// contexto DentroDeAba (context/AbaContext.js), lido dentro do próprio
// GradientHeader: um ponto de leitura em vez de doze.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { DentroDeAba } from '../context/AbaContext';
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

      {/* TODAS AS ABAS FICAM MONTADAS; as inativas só ficam escondidas
          (10/09/2026, achado da auditoria). Trocar de aba desmontava a tela e
          levava junto o que a pessoa tinha escrito — quiz pela metade, memória
          em digitação, formulário preenchido. Manter na árvore custa memória e
          paga com o trabalho de quem está usando.

          A aba escondida não recebe toque nem é lida por leitor de tela.

          O contexto DentroDeAba apaga o GradientHeader de cada tela hospedada:
          elas já têm título e seta aqui em cima. */}
      <View style={styles.corpo}>
        {ABAS.map((aba, i) => (
          <View
            key={aba.key}
            style={[styles.painel, i !== ativa && styles.painelOculto]}
            pointerEvents={i === ativa ? 'auto' : 'none'}
            accessibilityElementsHidden={i !== ativa}
            importantForAccessibility={i === ativa ? 'auto' : 'no-hide-descendants'}
          >
            <DentroDeAba>
              <aba.Tela />
            </DentroDeAba>
          </View>
        ))}
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
  // Só a aba ativa ocupa espaço; as outras ficam na árvore com display none.
  // A primeira tentativa usou absoluteFill: as três se empilhavam no mesmo
  // ponto e o conteúdo de uma vazava sobre a outra — abri "Nós Hoje" na aba
  // Agir e vi o rodapé dela ("Ainda não há sonhos guardados") no lugar do topo.
  painel: { flex: 1 },
  // A aba escondida sai de vista sem sair da árvore: o estado dela sobrevive.
  painelOculto: { display: 'none' },
});
