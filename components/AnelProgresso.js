// ANEL DE PROGRESSO — o círculo que DESENHA a porcentagem, como nos medidores
// das referências que o dono trouxe (o "Foco de hoje" com Amor/Carreira/...).
//
// Por que existe (11/09/2026): "Seus elementos" já mostrava % de Fogo/Terra/
// Ar/Água, mas como um chip de texto ao lado de um círculo decorativo — o
// número estava lá, a LEITURA VISUAL não. Num medidor a pessoa compara os
// quatro de relance, sem ler quatro números.
//
// SEM SVG — react-native-svg não está nas dependências e não entra por causa
// de um anel (mesma regra do CosmicScene e do UniversoGirando). O truque é
// clássico e roda em Yoga e CSS igual:
//
//   Um círculo com borda colorida é cortado ao meio por duas máscaras. Cada
//   metade tem DENTRO dela um semicírculo de borda colorida que gira. Girando
//   a metade direita de 0° a 180° preenche o primeiro 50%; a partir daí ela
//   fica parada em 180° e a metade esquerda começa a girar. É o "two-half
//   trick", o mesmo que CSS puro usa quando não há conic-gradient.
//
// A conta é de UMA VEZ, no render — não há animação por frame, nada disputa
// com o scroll.
import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function AnelProgresso({
  pct = 0,
  size = 66,
  espessura = 5,
  cor = '#FF8C5C',
  // A trilha precisa ficar visível no escuro sem competir com o preenchido.
  corTrilha = 'rgba(255,255,255,0.10)',
  children,
}) {
  // Clamp explícito: pct vem de conta (lib/elementos.js dá 0..100), mas um
  // valor fora da faixa giraria o semicírculo além do meio e desenharia um
  // anel maior que o total — erro silencioso e difícil de achar depois.
  const p = Math.max(0, Math.min(100, Number(pct) || 0));
  const metadeDireita = Math.min(50, p);
  const metadeEsquerda = Math.max(0, p - 50);
  const grausDireita = (metadeDireita / 50) * 180;
  const grausEsquerda = (metadeEsquerda / 50) * 180;

  const raio = size / 2;
  const meia = { width: raio, height: size, overflow: 'hidden' };
  // O semicírculo interno tem o tamanho CHEIO e é deslocado pra dentro da
  // máscara — é a borda dele que vira o arco visível.
  const arcoBase = {
    width: size,
    height: size,
    borderRadius: raio,
    borderWidth: espessura,
    borderColor: cor,
    position: 'absolute',
    top: 0,
  };

  return (
    <View style={[styles.raiz, { width: size, height: size }]}>
      {/* A trilha completa, por baixo. */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius: raio,
          borderWidth: espessura,
          borderColor: corTrilha,
          position: 'absolute',
        }}
      />

      {/* Metade DIREITA: cobre de 0% a 50%. */}
      <View style={[styles.metadeDireita, meia]}>
        <View
          style={[
            arcoBase,
            {
              left: -raio,
              // Só a borda de cima e da direita compõem o arco da direita; as
              // outras duas ficam transparentes pra não pintar o lado errado.
              borderLeftColor: 'transparent',
              borderBottomColor: 'transparent',
              // -45° alinha o começo do arco ao topo do círculo (12 horas).
              transform: [{ rotate: `${grausDireita - 45}deg` }],
            },
          ]}
        />
      </View>

      {/* Metade ESQUERDA: só entra acima de 50%. Antes disso fica escondida —
          com 0° ela desenharia um arco no topo esquerdo que não corresponde a
          porcentagem nenhuma. */}
      {metadeEsquerda > 0 && (
        <View style={[styles.metadeEsquerda, meia]}>
          <View
            style={[
              arcoBase,
              {
                left: 0,
                borderRightColor: 'transparent',
                borderTopColor: 'transparent',
                transform: [{ rotate: `${grausEsquerda - 45}deg` }],
              },
            ]}
          />
        </View>
      )}

      {/* O miolo: número, emoji ou o que quem chama puser. */}
      <View style={styles.miolo}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { alignItems: 'center', justifyContent: 'center' },
  metadeDireita: { position: 'absolute', right: 0, top: 0 },
  metadeEsquerda: { position: 'absolute', left: 0, top: 0 },
  miolo: { alignItems: 'center', justifyContent: 'center' },
});
