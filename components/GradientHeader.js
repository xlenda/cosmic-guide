import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { useLanguage } from '../context/LanguageContext';

// Estrelinhas determinísticas do cabeçalho — mesmo truque de hash por índice
// do CosmicScene.js (sin(i*k)*grande, pega a fração): espalha bem, custa nada
// e o céu é idêntico em toda montagem — nada de Math.random "formigando" a
// cada re-render. Poucas e discretas (opacity ≤ 0.5): o header é palco do
// título, as estrelas são textura, não protagonista.
const ESTRELAS = Array.from({ length: 8 }, (_, i) => {
  const a = Math.sin((i + 1) * 127.1) * 43758.5453;
  const b = Math.sin((i + 1) * 311.7) * 12543.2371;
  const fx = a - Math.floor(a);
  const fy = b - Math.floor(b);
  return {
    left: `${(fx * 92 + 4).toFixed(2)}%`,
    top: `${(fy * 76 + 8).toFixed(2)}%`,
    size: 1.5 + ((i * 7) % 3) * 0.75, // 1.5–3px
    opacity: +(0.18 + fy * 0.3).toFixed(2), // 0.18–0.48
  };
});

// `title`/`subtitle` chegam prontos (e já traduzidos) de cada tela — o único
// texto que nasce aqui é o rótulo de acessibilidade do botão de voltar, usado
// por todas as telas que têm este cabeçalho.
export default function GradientHeader({ title, subtitle, onBack, right, gradient = gradients.hero }) {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  return (
    <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.wrap, { paddingTop: insets.top + 18 }]}>
      {/* Cenário: estrelas absolutas atrás do conteúdo. pointerEvents="none"
          pra decoração nunca roubar toque (lição do CosmicScene), e o
          overflow:hidden do wrap clipa tudo nos cantos arredondados. */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {ESTRELAS.map((e, i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: e.left,
              top: e.top,
              width: e.size,
              height: e.size,
              borderRadius: e.size / 2,
              backgroundColor: '#F3EEFF',
              opacity: e.opacity,
            }}
          />
        ))}
      </View>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.iconBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('header.backA11y')}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : <View style={styles.iconBtn} />}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <View style={styles.iconBtn}>{right}</View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 26,
    paddingHorizontal: 16,
    // O "palco" do concorrente: cantos inferiores bem arredondados. Sem
    // marginBottom — as telas que empilham conteúdo já trazem respiro
    // próprio (paddingTop 10–20) e o root de todas é colors.background
    // escuro, então o recorte do canto revela céu, não fresta.
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    // Clipa as estrelas absolutas dentro do formato arredondado.
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  // 44×44: área mínima de toque acessível (antes 40 — abaixo do mínimo).
  iconBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  titleWrap: { flex: 1, alignItems: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 3 },
});
