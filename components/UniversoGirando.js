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
import { colors } from '../theme';

// Cada órbita: raio (px), duração de uma volta (ms), tamanho e cor do planeta.
// Durações propositalmente DIFERENTES e não múltiplas entre si — com tempos
// proporcionais os planetas reencontrariam a mesma formação a cada ciclo e o
// olho perceberia a repetição. Assim o desenho nunca se repete igual.
const ORBITAS = [
  { raio: 38, duracao: 11000, planeta: 7, cor: '#FFD98A', sentido: 1 },
  { raio: 58, duracao: 17000, planeta: 9, cor: '#C9A8FF', sentido: -1 },
  { raio: 78, duracao: 26000, planeta: 6, cor: '#8FD4FF', sentido: 1 },
];

const TAMANHO = 176;

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
      {/* O brilho do centro — o "sol". Três camadas concêntricas de opacidade
          crescente dão o halo sem precisar de gradiente radial (que o RN não
          tem nativamente). */}
      <View style={[styles.halo, { width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17 }]} />
      <View style={[styles.halo2, { width: size * 0.22, height: size * 0.22, borderRadius: size * 0.11 }]} />
      <View style={[styles.sol, { width: size * 0.13, height: size * 0.13, borderRadius: size * 0.065 }]} />

      {ORBITAS.map((o, i) => {
        const d = o.raio * 2;
        const rotacao = giros[i].interpolate({
          inputRange: [0, 1],
          outputRange: o.sentido > 0 ? ['0deg', '360deg'] : ['360deg', '0deg'],
        });
        return (
          <React.Fragment key={o.raio}>
            {/* O anel: só a linha da órbita, parado. */}
            <View
              style={[
                styles.anel,
                { width: d, height: d, borderRadius: o.raio, left: centro - o.raio, top: centro - o.raio },
              ]}
            />
            {/* O contêiner que gira. O planeta mora na BORDA SUPERIOR dele,
                então girar o contêiner leva o planeta pela circunferência —
                sem calcular seno e cosseno a cada frame. */}
            <Animated.View
              style={[
                styles.trilho,
                {
                  width: d,
                  height: d,
                  left: centro - o.raio,
                  top: centro - o.raio,
                  transform: [{ rotate: rotacao }],
                },
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
          </React.Fragment>
        );
      })}
    </View>
  );
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
  sol: { position: 'absolute', backgroundColor: colors.gold },
  halo: { position: 'absolute', backgroundColor: 'rgba(255,200,92,0.07)' },
  halo2: { position: 'absolute', backgroundColor: 'rgba(255,200,92,0.14)' },
});
