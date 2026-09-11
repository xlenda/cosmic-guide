// O UNIVERSO GIRANDO — órbitas animadas com planetas percorrendo-as.
//
// Por que existe (11/09/2026, pedido do dono olhando referências de apps
// premium): o Diário abria numa lista sem respiro. O que faz aquelas telas
// parecerem caras é ter UM elemento vivo no topo — não animação em todo
// canto, um ponto de movimento que dá sinal de "isto está rodando".
//
// SEM SVG, SEM DEPENDÊNCIA NOVA — a convenção do CosmicScene vale aqui:
// react-native-svg não está nas dependências e não entra por causa de um
// enfeite. Cada órbita é uma View circular com borderWidth; cada planeta é
// uma View pequena posicionada na borda de um contêiner que GIRA — girando o
// contêiner, o planeta descreve o círculo sozinho, sem trigonometria por
// frame.
//
// UMA animação por órbita, loop de rotação puro. `useNativeDriver` segue a
// casa (BreathGuide): driver real no nativo, JS na web — transform: rotate é
// das poucas propriedades que o driver nativo aceita, então no celular isto
// roda fora da thread de JS e não disputa com o scroll.
//
// RESPEITA "REDUZIR MOVIMENTO": quem liga a opção de acessibilidade do
// sistema recebe o desenho PARADO, não uma versão mais lenta. Movimento
// contínuo é exatamente o que essa opção existe pra desligar — e o app já
// faz isso no OrbiIntro.
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Platform, AccessibilityInfo } from 'react-native';

// Cada órbita: raio (px), duração de uma volta (ms), tamanho e cor do planeta.
// Durações propositalmente DIFERENTES e não múltiplas entre si — com tempos
// proporcionais os planetas reencontrariam a mesma formação a cada ciclo e o
// olho perceberia a repetição. Assim o desenho nunca se repete igual.
const ORBITAS = [
  { raio: 0.20, duracao: 9000,  planeta: 9,  cor: '#FFE3A8', sentido: 1 },
  { raio: 0.20, duracao: 9000,  planeta: 6,  cor: '#C9A8FF', sentido: 1, fase: 0.55 },
  { raio: 0.31, duracao: 15000, planeta: 13, cor: '#E4CCFF', sentido: -1 },
  { raio: 0.31, duracao: 15000, planeta: 7,  cor: '#9ED8FF', sentido: -1, fase: 0.4 },
  { raio: 0.43, duracao: 24000, planeta: 16, cor: '#F0DFFF', sentido: 1 },
  { raio: 0.43, duracao: 24000, planeta: 8,  cor: '#FFD98A', sentido: 1, fase: 0.3 },
  { raio: 0.43, duracao: 24000, planeta: 5,  cor: '#B6E3FF', sentido: 1, fase: 0.68 },
];

// Estrelas de fundo — mesmo hash determinístico do CosmicScene: o céu é o
// mesmo em toda montagem, não "formiga" quando a tela re-renderiza.
const ESTRELAS = Array.from({ length: 34 }, (_, i) => {
  const a = Math.sin((i + 1) * 127.1) * 43758.5453;
  const b = Math.sin((i + 1) * 311.7) * 12543.2371;
  const fa = a - Math.floor(a);
  const fb = b - Math.floor(b);
  const c = Math.sin((i + 1) * 74.7) * 3571.13;
  return {
    left: `${(fa * 96 + 2).toFixed(2)}%`,
    top: `${(fb * 96 + 2).toFixed(2)}%`,
    tam: 1 + Math.round((c - Math.floor(c)) * 2),
    opacidade: 0.25 + (c - Math.floor(c)) * 0.5,
  };
});

const TAMANHO = 300;

export default function UniversoGirando({ size = TAMANHO, testID }) {
  const [semMovimento, setSemMovimento] = useState(false);
  // Um Animated.Value por órbita, criados uma vez. ORBITAS é constante de
  // módulo, então a quantidade nunca muda entre renders — a regra dos hooks
  // continua satisfeita.
  const giros = useRef(ORBITAS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let vivo = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((r) => vivo && setSemMovimento(!!r))
      .catch(() => {});
    const assinatura = AccessibilityInfo.addEventListener?.('reduceMotionChanged', setSemMovimento);
    return () => {
      vivo = false;
      assinatura?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (semMovimento) return undefined;
    const animacoes = giros.map((valor, i) =>
      Animated.loop(
        Animated.timing(valor, {
          toValue: 1,
          duration: ORBITAS[i].duracao,
          easing: Easing.linear, // volta constante: qualquer curva faria o planeta "respirar"
          useNativeDriver: Platform.OS !== 'web',
        })
      )
    );
    animacoes.forEach((a) => a.start());
    return () => animacoes.forEach((a) => a.stop());
  }, [giros, semMovimento]);

  const centro = size / 2;
  // Raios são FRAÇÃO do tamanho, não pixel: o mesmo componente serve num
  // cabeçalho de 300px e num card de 160 sem reescrever a tabela.
  const orbitas = ORBITAS.map((o) => ({ ...o, r: o.raio * size }));
  // Anéis únicos — várias órbitas compartilham o mesmo raio (é o que povoa a
  // cena como na referência), mas a LINHA de cada um só pode ser desenhada uma
  // vez, senão a borda soma opacidade e fica mais clara que as outras.
  const aneis = [...new Set(orbitas.map((o) => o.r))];

  return (
    <View
      style={[styles.raiz, { width: size, height: size }]}
      pointerEvents="none"
      accessible={false}
      // O universo é decoração: não descreve nada que o texto já não diga, e
      // um leitor de tela anunciando "imagem" aqui só atrapalharia.
      importantForAccessibility="no-hide-descendants"
      testID={testID}
    >
      {/* Campo de estrelas atrás de tudo — sem ele o fundo é preto chapado e a
          cena flutua no vazio (foi o que separou a primeira versão da
          referência). */}
      {ESTRELAS.map((e, i) => (
        <View
          key={`estrela-${i}`}
          style={[
            styles.estrela,
            { left: e.left, top: e.top, width: e.tam, height: e.tam, borderRadius: e.tam / 2, opacity: e.opacidade },
          ]}
        />
      ))}

      {/* Os anéis, parados. */}
      {aneis.map((r) => (
        <View
          key={`anel-${r}`}
          style={[styles.anel, { width: r * 2, height: r * 2, borderRadius: r, left: centro - r, top: centro - r }]}
        />
      ))}

      {/* O SOL — na referência é o peso da composição, não um ponto. Camadas
          concêntricas do mais difuso ao mais sólido: o RN não tem gradiente
          radial, e empilhar círculos translúcidos é o jeito barato de ter
          halo. */}
      <View style={[styles.halo3, circulo(size * 0.30)]} />
      <View style={[styles.halo2, circulo(size * 0.22)]} />
      <View style={[styles.halo, circulo(size * 0.165)]} />
      <View style={[styles.sol, circulo(size * 0.125)]} />
      <View style={[styles.solNucleo, circulo(size * 0.075)]} />

      {/* Os planetas: cada um num contêiner que gira. O planeta mora na borda
          superior do contêiner, então girar o contêiner o leva pela
          circunferência — sem trigonometria por frame. */}
      {orbitas.map((o, i) => {
        const d = o.r * 2;
        // `fase` desloca o ponto de partida: sem ela os planetas que
        // compartilham raio nasceriam empilhados no mesmo ponto.
        const ini = (o.fase || 0) * 360;
        const rotacao = giros[i].interpolate({
          inputRange: [0, 1],
          outputRange:
            o.sentido > 0 ? [`${ini}deg`, `${ini + 360}deg`] : [`${ini + 360}deg`, `${ini}deg`],
        });
        return (
          <Animated.View
            key={`orbita-${i}`}
            style={[
              styles.trilho,
              { width: d, height: d, left: centro - o.r, top: centro - o.r, transform: [{ rotate: rotacao }] },
            ]}
          >
            <View
              style={[
                styles.planeta,
                {
                  width: o.planeta,
                  height: o.planeta,
                  borderRadius: o.planeta / 2,
                  backgroundColor: o.cor,
                  shadowColor: o.cor,
                  marginLeft: -o.planeta / 2,
                  marginTop: -o.planeta / 2,
                },
              ]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

// Atalho: os cinco círculos do sol só diferem no diâmetro.
function circulo(d) {
  return { width: d, height: d, borderRadius: d / 2 };
}

const styles = StyleSheet.create({
  raiz: { alignItems: 'center', justifyContent: 'center' },
  anel: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(201,168,255,0.22)',
  },
  // O trilho não tem borda nem fundo: é só um quadrado invisível que gira
  // carregando o planeta preso no topo.
  trilho: { position: 'absolute', alignItems: 'center' },
  planeta: {
    position: 'absolute',
    top: 0,
    left: '50%',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  estrela: { position: 'absolute', backgroundColor: '#fff' },
  // Laranja→rosa como na referência, não o dourado chapado da primeira versão.
  solNucleo: { position: 'absolute', backgroundColor: '#FFD27A' },
  sol: { position: 'absolute', backgroundColor: '#FF8A4C' },
  halo: { position: 'absolute', backgroundColor: 'rgba(255,90,120,0.55)' },
  halo2: { position: 'absolute', backgroundColor: 'rgba(214,72,150,0.26)' },
  halo3: { position: 'absolute', backgroundColor: 'rgba(160,60,190,0.14)' },
});
