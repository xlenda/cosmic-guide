// CARROSSEL DE HORÓSCOPO — os blocos do horóscopo do dia (amor, trabalho,
// energia…) em cards deslizáveis na Home, um por página, com bolinhas embaixo
// (referência do dono, 11/09/2026: a faixa "Horóscopo Diário" do concorrente,
// que dá o gostinho de cada tema e manda pra tela completa num toque).
//
// Este componente NÃO calcula nem localiza nada: recebe `itens` já prontos de
// lib/horoscopoLocalizado.js (itensDoCarrossel) e só desenha. Regra "NUNCA
// FABRICAR": sem horóscopo disponível `itens` chega vazio e o carrossel some
// inteiro — nenhum card com texto genérico pra tapar buraco.
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// A LARGURA DO CARD É MEDIDA, NÃO CALCULADA (13/09/2026 — conserto do texto
// cortado na lateral).
//
// O QUE ESTAVA ERRADO. A largura saía de `Dimensions.get('window').width - 40`:
// um palpite sobre o PAI, escrito em 11/09 quando o carrossel morava direto no
// chão da Home e tinha só a própria margem de 20 de cada lado. Em 12/09 a
// reforma de diagramação enfiou o carrossel DENTRO da FaixaCurva 'você hoje',
// que tem `paddingHorizontal: space.tela` (16) — e ninguém refez a conta.
// Medido na build, janela de 390:
//   corpo da faixa      x=16   largura 358
//   trilho do carrossel x=36   VIEWPORT 318   (358 - 20 - 20 de margem própria)
//   card                x=36   largura 350   -> passa 32px do viewport
// O card era 32px mais largo que a janela que o mostra, e o ScrollView corta
// tudo que passa: o texto sumia no meio da palavra, sem reticência e sem
// margem, e a borda direita do card nem aparecia.
//
// POR QUE MEDIR EM VEZ DE SUBTRAIR MAIS 32. Descontar a faixa na conta
// conserta HOJE e quebra de novo no dia em que o carrossel mudar de pai ou a
// faixa mudar de padding — foi exatamente assim que este bug nasceu. O
// `onLayout` do trilho devolve a largura REAL de quem quer que seja o pai, e a
// conta deixa de existir.
//
// O ZERO INICIAL é de propósito: antes da primeira medida não há número
// honesto pra dar. `larguraCard` só vira número depois do layout, e até lá o
// card usa '100%' — que já é a página certa quando só existe uma. Sem isso o
// primeiro quadro desenharia com a largura errada e piscaria.
export default function CarrosselHoroscopo({ itens, onAbrir }) {
  const { t } = useLanguage();
  const [ativo, setAtivo] = useState(0);
  const [largura, setLargura] = useState(0);

  if (!itens || itens.length === 0) return null;

  // Clampa NA HORA DE DESENHAR, não só no scroll: se `itens` encolher entre
  // renders (virada de dia com menos blocos) com `ativo` apontando pra uma
  // página que já não existe, nenhuma bolinha acenderia até o próximo gesto.
  const pagina = Math.min(ativo, itens.length - 1);

  // UM handler pros DOIS eventos. onMomentumScrollEnd é o certo no nativo, mas
  // a react-native-web (0.21) nunca o dispara: ScrollViewBase só emite
  // onScroll, e o "fim" do gesto é um onScroll extra 100ms depois do último
  // tick. Só com onMomentumScrollEnd as bolinhas ficariam congeladas na
  // primeira posição na web — que é onde o app é publicado. No nativo o
  // onScroll só repete o mesmo índice; setState com valor igual não re-renderiza.
  // Divide pela largura MEDIDA. Enquanto ela for 0 (antes do primeiro layout)
  // não há o que rolar ainda, e dividir por zero daria NaN — fica na página 0.
  const aoRolar = (e) => {
    if (!largura) return;
    const i = Math.round(e.nativeEvent.contentOffset.x / largura);
    setAtivo(Math.max(0, Math.min(itens.length - 1, i)));
  };

  return (
    <View testID="home-horoscopo-carrossel">
      <Text style={styles.secao}>{t('home.horoscopoDiario.title')}</Text>
      {/* A faixa tem a MESMA margem dos cards (20) e cada card tem a largura
          exata da faixa: assim página, snap e card medem o mesmo número e o
          pagingEnabled do nativo bate com o scroll-snap que a web gera. */}
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={largura || undefined}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={aoRolar}
        onMomentumScrollEnd={aoRolar}
        onLayout={(e) => setLargura(Math.round(e.nativeEvent.layout.width))}
        style={styles.faixa}
      >
        {itens.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => onAbrir && onAbrir()}
            style={[styles.card, { width: largura || '100%' }]}
            accessibilityRole="button"
          >
            <Text style={styles.titulo} numberOfLines={1}>{item.titulo}</Text>
            <Text style={styles.texto} numberOfLines={3}>{item.texto}</Text>
            <View style={styles.rodape}>
              <Text style={styles.ler}>{t('home.horoscopoDiario.ler')}</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.gold} accessible={false} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {/* Com um item só não há pra onde rolar; uma bolinha sozinha seria ruído.
          As bolinhas são redundantes ao próprio scroll — fora do leitor de tela. */}
      {itens.length > 1 && (
        <View style={styles.bolinhas} accessible={false}>
          {itens.map((item, i) => (
            <View
              key={item.id}
              style={[styles.bolinha, i === pagina && styles.bolinhaAtiva]}
              testID="home-horoscopo-bolinha"
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // CENTRALIZADO desde 12/09/2026 (reforma de diagramação da Home). O
  // carrossel mora dentro da faixa "Você hoje", junto do cabeçalho de
  // identidade — que é centralizado. Encostado à esquerda, este título era o
  // único elemento desalinhado da faixa e denunciava que os dois blocos ainda
  // eram duas coisas coladas em vez de um assunto só. Componente usado APENAS
  // pela Home (conferido), então centralizar aqui não afeta outra tela.
  secao: {
    color: colors.text, fontSize: 18, fontWeight: '800',
    marginTop: space.bloco, marginBottom: space.dentro, marginHorizontal: space.entre,
    textAlign: 'center',
  },
  faixa: { marginHorizontal: space.entre },
  // Sem `width` aqui: ela vem MEDIDA, no style inline do card.
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: space.bloco,
  },
  titulo: { color: colors.text, fontSize: 15, fontWeight: '800' },
  texto: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: space.grudado },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: space.grudado, marginTop: space.junto },
  // Dourado é a única cor de ação do app (ver FeatureCard.js).
  ler: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  bolinhas: { flexDirection: 'row', justifyContent: 'center', gap: space.grudado, marginTop: space.junto },
  bolinha: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  bolinhaAtiva: { backgroundColor: colors.gold },
});
