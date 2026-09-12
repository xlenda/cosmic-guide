// NOSSA HISTÓRIA — a fusão de Linha do Tempo + Progresso + Retrospectiva
// (10/09/2026, mesmo pedido do dono que criou NosHojeScreen).
//
// POR QUE ESTAS TRÊS: o argumento aqui é mais forte que o de "Nós Hoje".
// Progresso e Retrospectiva NÃO TÊM DADO PRÓPRIO — são duas telas inteiras que
// só reformatam o que a Linha do Tempo gravou. A auditoria mediu ~70% de
// sobreposição entre elas: a contagem de memórias aparece nas três telas, a de
// cápsulas nas três, o recorde de sequência em duas com rótulos diferentes, e
// o componente de contagem animada está copiado byte a byte entre Progresso e
// Retrospectiva. A própria Retrospectiva já admitia a dependência: o botão do
// estado vazio manda a pessoa pra Linha do Tempo.
//
// A ORDEM DAS ABAS não é alfabética nem por tamanho: é a do uso. Primeiro o
// que a pessoa ESCREVE (memórias e cápsulas), depois o que ela COLHE do que
// escreveu (o mês, o ano). Sem a primeira, as outras duas mostram zero — e é
// justamente esse zero que o CTA do estado vazio sempre tentou explicar.
//
// Mesma técnica de NosHojeScreen: abas montando as telas originais, sem
// reescrever conteúdo. O peso visual da Retrospectiva (número gigante animado
// + botão de compartilhar) se preserva porque ela continua ocupando a tela
// toda quando é a aba ativa — não virou seção espremida entre formulários.
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { colors, space, type } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { DentroDeAba } from '../context/AbaContext';
import TimelineScreen from './TimelineScreen';
import ProgressoScreen from './ProgressoScreen';
import RetrospectivaScreen from './RetrospectivaScreen';

const ABAS = [
  { key: 'timeline', icone: 'time', tituloKey: 'home.card.timeline.title', Tela: TimelineScreen },
  { key: 'progresso', icone: 'trophy', tituloKey: 'home.card.progresso.title', Tela: ProgressoScreen },
  { key: 'retrospectiva', icone: 'gift', tituloKey: 'home.card.retrospectiva.title', Tela: RetrospectivaScreen },
];

export default function NossaHistoriaScreen({ route }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
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
        <Text style={styles.titulo}>{t('nossaHistoria.title')}</Text>
        <View style={styles.voltar} />
      </View>

      <View style={styles.abas}>
        {ABAS.map((aba, i) => {
          const sel = i === ativa;
          return (
            <Pressable
              key={aba.key}
              testID={`nossa-historia-aba-${aba.key}`}
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

      {/* Mesma decisão de NosHojeScreen (10/09/2026): as três abas ficam
          montadas e só as inativas se escondem. Aqui pesa ainda mais — a
          Linha do Tempo tem dois formulários (memória e cápsula do tempo), e
          desmontar no meio da digitação apagava o que a pessoa escreveu. */}
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

// DIAGRAMAÇÃO (12/09/2026, lote de dado e número). Esta tela é uma CASCA: o
// conteúdo inteiro são as telas hospedadas, que têm (ou receberam) a
// diagramação delas. O que há aqui pra tratar é o CHROME — e ele estava todo
// em número cru: 16, 6, 10, 38, 12, 9, e dois tamanhos de fonte fora da
// escala. Nada de faixa curva: faixa envolve SEÇÃO de conteúdo, e uma barra
// de abas não é seção — seria cor por cor, sem assunto embaixo.
//
// O RÓTULO DA ABA subiu de 12px pra `type.apoio` (13/20) e o título de 16
// pra `type.cartao` (17/22). Três abas em 390px com rótulos longos ("Quanto
// vocês já caminharam") já truncam; o degrau maior não piora o truncamento
// (numberOfLines={1} continua lá) e pára de parecer letra miúda.
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  topo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: space.tela, paddingTop: space.junto, paddingBottom: space.dentro,
  },
  voltar: {
    width: 38, height: 38, borderRadius: space.dentro, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  titulo: { ...type.cartao, color: colors.text },
  abas: { flexDirection: 'row', gap: space.junto, paddingHorizontal: space.tela, paddingBottom: space.dentro },
  aba: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    paddingVertical: space.dentro, borderRadius: space.dentro, backgroundColor: colors.surface,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  abaAtiva: { borderBottomColor: colors.gold, backgroundColor: colors.surfaceElevated },
  abaTxt: { ...type.apoio, color: colors.textMuted, flexShrink: 1 },
  abaTxtAtiva: { color: colors.text },
  pressed: { opacity: 0.75 },
  corpo: { flex: 1 },
  // Só a aba ativa ocupa espaço; as outras ficam na árvore com display none.
  // Empilhar com absoluteFill fazia o conteúdo de uma vazar sobre a outra.
  painel: { flex: 1 },
  // A aba escondida sai de vista sem sair da árvore: o estado dela sobrevive.
  painelOculto: { display: 'none' },
});
