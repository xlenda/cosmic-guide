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
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// Largura do card = tela menos os 20 de margem de cada lado que todo card da
// Home usa (styles.topoCard em HomeScreen.js). Calculada UMA vez no módulo,
// sem listener: a Home é uma tela só e o snap precisa de um número fixo —
// recalcular a cada render desalinharia as páginas no meio do gesto. O piso
// de 1 é só pra `x / LARGURA` nunca virar NaN se a janela medir 0 no momento
// do import (bundle avaliado antes do layout) — em tela real nunca acontece.
const LARGURA = Math.max(1, Dimensions.get('window').width - 40);

export default function CarrosselHoroscopo({ itens, onAbrir }) {
  const { t } = useLanguage();
  const [ativo, setAtivo] = useState(0);

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
  const aoRolar = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / LARGURA);
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
        snapToInterval={LARGURA}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={aoRolar}
        onMomentumScrollEnd={aoRolar}
        style={styles.faixa}
      >
        {itens.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.85}
            onPress={() => onAbrir && onAbrir()}
            style={styles.card}
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
  // Mesmo desenho de styles.sectionTitle da Home, com o marginTop menor porque
  // o carrossel vem logo abaixo do cabeçalho de identidade, não de um grid.
  secao: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 18, marginBottom: 12, marginHorizontal: 20 },
  faixa: { marginHorizontal: 20 },
  card: {
    width: LARGURA,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
  },
  titulo: { color: colors.text, fontSize: 15, fontWeight: '800' },
  texto: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 6 },
  rodape: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  // Dourado é a única cor de ação do app (ver FeatureCard.js).
  ler: { color: colors.gold, fontSize: 12, fontWeight: '700' },
  bolinhas: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  bolinha: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  bolinhaAtiva: { backgroundColor: colors.gold },
});
