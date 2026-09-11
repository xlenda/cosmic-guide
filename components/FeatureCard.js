import React, { useRef } from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// `title`/`subtitle` já chegam traduzidos de quem monta o grid (ver ALL_ITEMS
// em HomeScreen.js). O único texto escrito aqui dentro é o rótulo de
// acessibilidade do cadeado, que usa o título como variável.
//
// DOIS DESENHOS (09/08/2026, pedido do dono olhando o grid: "precisa de um
// banner pra cada link desse"):
//   - COM `arte` (asset do pack, lib/ilustracoes.js TILES): banner ilustrado
//     em cima + faixa de texto embaixo — o desenho dos cards premium do
//     concorrente. O ícone vira um selinho no canto do banner (identidade).
//   - SEM `arte`: o card de gradiente de sempre, byte a byte — nenhuma
//     feature fica quebrada esperando arte.
export default function FeatureCard({ title, subtitle, icon, gradient, arte, destaque, onPress, locked, testID }) {
  const { t } = useLanguage();
  // PRESS-IN ENCOLHE, PRESS-OUT DEVOLVE (09/08/2026) — o feedback vivo de app
  // nativo que faltava no toque. O TouchableOpacity FICA (o fade de
  // activeOpacity, a acessibilidade e o testID não mudam uma vírgula): a
  // escala entra por FORA, num Animated.View que embrulha o card inteiro e
  // ouve onPressIn/onPressOut. Springs curtos de propósito — nada aqui atrasa
  // o onPress. useNativeDriver segue a convenção da casa (BreathGuide):
  // driver de verdade no nativo, JS na web, e é one-shot, nunca loop.
  const escala = useRef(new Animated.Value(1)).current;
  const aoApertar = () => {
    Animated.spring(escala, {
      toValue: 0.965,
      speed: 40,
      bounciness: 0,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };
  const aoSoltar = () => {
    Animated.spring(escala, {
      toValue: 1,
      speed: 24,
      bounciness: 5,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  };
  const aoTocar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress && onPress();
  };

  if (arte) {
    return (
      <Animated.View style={[styles.animWrap, { transform: [{ scale: escala }] }]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={aoTocar}
        onPressIn={aoApertar}
        onPressOut={aoSoltar}
        style={[styles.card, locked && styles.cardLocked]}
        accessibilityRole="button"
        accessibilityLabel={locked ? t('featureCard.lockedA11y', { title }) : title}
        testID={testID}
      >
        {/* SEM CHIP DE ÍCONE SOBRE A ARTE (10/09/2026, pedido do dono: "tirar o
            ícone também de cada foto"). O chip existia quando o banner era um
            gradiente liso e o ícone era a única pista do que o card fazia. Com
            a ilustração pintada de 10/09 ele virou ruído: um selo colorido de
            interface tapando o canto de um desenho que já diz do que se trata,
            e a única cor que sobrava fora da arte — contra a regra de que o
            dourado é a única cor de ação. O ícone continua vivo no card SEM
            arte (o return de baixo), que é onde ele ainda informa algo. */}
        <View style={destaque ? styles.corpoAlto : styles.corpoBaixo}>
          {/* A ARTE OCUPA O CARD INTEIRO (11/09/2026, pedido do dono: "pegar a
              tela inteira de cada espaço"). Antes era um quadradinho de 58px ao
              lado do texto, o que desperdiçava ilustrações que têm cenário —
              vistas em miniatura elas viram borrão. Agora é fundo absoluto com
              `cover`, e o texto vem POR CIMA. */}
          <Image
            source={arte}
            style={styles.arteFundo}
            resizeMode="cover"
            accessible={false}
          />
          {/* O VÉU NÃO É ENFEITE: sem ele o título branco cai sobre a parte
              clara de algumas artes (o sol da Compatibilidade, a lua dos
              Sonhos) e some. Gradiente de transparente pro escuro, mais dominante
              embaixo, que é onde o texto mora. */}
          <LinearGradient
            colors={['rgba(11,7,18,0.10)', 'rgba(11,7,18,0.62)', 'rgba(11,7,18,0.93)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <View style={styles.textoSobreposto}>
            <Text style={styles.tituloBanner} numberOfLines={2}>{title}</Text>
            <Text style={styles.subtituloBanner} numberOfLines={2}>{subtitle}</Text>
          </View>
          {locked && (
            <View style={styles.lock}>
              <Ionicons name="lock-closed" size={12} color="#fff" />
            </View>
          )}
        </View>
      </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.animWrap, { transform: [{ scale: escala }] }]}>
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={aoTocar}
      onPressIn={aoApertar}
      onPressOut={aoSoltar}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={locked ? t('featureCard.lockedA11y', { title }) : title}
      testID={testID}
    >
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.grad, locked && styles.gradLocked]}>
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={24} color="#fff" />
        </View>
        {locked && (
          <View style={styles.lock}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </LinearGradient>
    </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // O embrulho da escala de toque. flex: 1 aqui e flex: 1 no card: o wrapper
  // herda o papel de célula do grid (CardGrid.js dá flex por coluna) e o card
  // preenche o wrapper — flexBasis de `flex: 1` é '0%', que dentro de altura
  // indefinida resolve pra conteúdo nas DUAS engines (Yoga e CSS), então a
  // grade mede igualzinho a antes.
  animWrap: { flex: 1 },
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: colors.surface,
  },
  cardLocked: { opacity: 0.55 },
  grad: { padding: 14, minHeight: 116, justifyContent: 'space-between' },
  gradLocked: { opacity: 0.55 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 15, fontWeight: '800', marginTop: 8 },
  subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  lock: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 5,
  },
  // DESENHO DO CONCORRENTE (11/09/2026, referência do dono — a grade "Todos os
  // Recursos"): ícone e texto LADO A LADO dentro do card, não foto em cima com
  // faixa de texto embaixo. O card alto é a exceção — lá a arte vai grande em
  // cima e o texto embaixo, como o "Meditações Espirituais" da referência.
  //
  // O texto continua sendo Text do app, NUNCA escrito dentro da imagem: a arte
  // é a mesma nos dois idiomas, o leitor de tela lê o título, e trocar uma
  // palavra não obriga a regerar 28 arquivos.
  // A arte é fundo absoluto nos dois tamanhos; o corpo só reserva a ALTURA e
  // empurra o texto pro rodapé. `justifyContent: 'flex-end'` é o que faz o
  // texto descer — é lá que o véu é mais forte.
  corpoBaixo: { minHeight: 116, justifyContent: 'flex-end' },
  corpoAlto: { minHeight: 210, justifyContent: 'flex-end' },
  // `absoluteFill` SOZINHO NÃO BASTA (11/09/2026, medido: card 180x116 com
  // imagem renderizando em 256x256, e o horoscope em 512x512). Ele posiciona
  // nos quatro cantos mas não declara width/height, então a Image usava o
  // tamanho NATURAL do arquivo, `cover` não tinha caixa pra encaixar e o
  // overflow:hidden do card cortava um pedaço do meio da arte — era esse o
  // "estrapola as bordas". Com width/height 100% a arte cabe e `cover` volta a
  // fazer o que promete: preencher sem distorcer.
  arteFundo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  textoSobreposto: { paddingHorizontal: 12, paddingBottom: 12, paddingTop: 8 },
  // Órfão desde 10/09/2026 — o chip saiu do card com arte (ver o comentário no
  // JSX). Fica aqui, sem custo, porque voltar a mostrá-lo é uma linha; apagar
  // o estilo obrigaria a reescrevê-lo do zero.
  iconChip: {
    position: 'absolute', top: 8, left: 8,
    width: 26, height: 26, borderRadius: 8,
    justifyContent: 'center', alignItems: 'center',
    opacity: 0.95,
  },
  // Branco puro + sombra: o texto agora vive SOBRE a ilustração, não sobre o
  // fundo liso do card. colors.text/textMuted são calibrados pra superfície
  // escura chapada e sumiriam na parte clara de algumas artes.
  tituloBanner: {
    color: '#fff', fontSize: 15, fontWeight: '800', lineHeight: 19,
    textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },
  subtituloBanner: {
    color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },
});
