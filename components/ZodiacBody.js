// components/ZodiacBody.js
// A FIGURA do homem zodiacal — os doze signos sobre as regiões do corpo, na
// ordem em que Manílio as enumera (cabeça → pés). Cada região é tocável e abre
// o verbete daquela correspondência em screens/ZodiacBodyScreen.js.
//
// POR QUE NÃO É SVG: o projeto não tem react-native-svg instalado (conferido
// no package.json em 30/07/2026) e a figura não precisa de curva nenhuma —
// são treze retângulos arredondados e um círculo. Acrescentar dependência
// nativa nova pra desenhar isso seria custo sem necessidade real. Tudo aqui é
// View + StyleSheet, que já roda igual em web e nativo.
//
// SISTEMA DE COORDENADAS: caixa fixa de FIG_W × FIG_H, posições absolutas em
// pixels dentro dela. Mexer num número move só aquela peça.
//
// COMO O TOQUE FUNCIONA (o detalhe que dá errado se for feito do jeito
// ingênuo): cada PEÇA é o seu próprio TouchableOpacity, dimensionado
// exatamente no retângulo que ela ocupa. A primeira versão deste arquivo
// usava um toque por região cobrindo a caixa inteira — na web isso empilha
// doze divs de tela cheia e só o último recebe o clique. Peças de uma mesma
// região (os dois braços, as duas coxas…) chamam o mesmo onSelect.
//
// A figura NÃO é anatomia e não descreve o corpo de ninguém — é o esquema
// iconográfico do «Homme anatomique» (Très Riches Heures, fól. 14v, c. 1411),
// reduzido às regiões que o texto antigo nomeia. Ver o cabeçalho de
// lib/zodiacBody.js pra regra que governa todo texto associado a ela.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, zodiacSigns } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { ZODIAC_BODY, signKey } from '../lib/zodiacBody';

export const FIG_W = 214;
export const FIG_H = 470;

const BADGE_W = 32;
const BADGE_H = 22;

// rects: as peças desenhadas (esquerda/topo/largura/altura/raio). Pares
// (braços, flancos, coxas, joelhos, canelas, pés) têm duas peças espelhadas —
// é a mesma região, o toque em qualquer uma abre o mesmo verbete.
// badge: onde o glifo do signo fica. Dentro da peça quando cabe, ao lado
// quando não cabe (pescoço, virilha, membros). O glifo também é tocável.
const REGIONS = {
  aries: { rects: [{ l: 84, t: 2, w: 46, h: 46, r: 23 }], badge: { l: 91, t: 14 } },
  touro: { rects: [{ l: 98, t: 47, w: 18, h: 16, r: 6 }], badge: { l: 140, t: 44 } },
  gemeos: {
    rects: [
      { l: 57, t: 61, w: 100, h: 16, r: 8 }, // ombros — Manílio liga os braços a eles
      { l: 43, t: 72, w: 18, h: 110, r: 9 },
      { l: 153, t: 72, w: 18, h: 110, r: 9 },
    ],
    badge: { l: 6, t: 112 },
  },
  cancer: { rects: [{ l: 68, t: 77, w: 78, h: 54, r: 14 }], badge: { l: 91, t: 92 } },
  leao: {
    rects: [
      { l: 62, t: 88, w: 11, h: 42, r: 5 },
      { l: 141, t: 88, w: 11, h: 42, r: 5 },
    ],
    badge: { l: 178, t: 98 },
  },
  virgem: { rects: [{ l: 72, t: 132, w: 70, h: 44, r: 12 }], badge: { l: 91, t: 143 } },
  libra: { rects: [{ l: 66, t: 177, w: 82, h: 40, r: 16 }], badge: { l: 91, t: 186 } },
  escorpiao: { rects: [{ l: 94, t: 212, w: 26, h: 20, r: 8 }], badge: { l: 150, t: 211 } },
  sagitario: {
    rects: [
      { l: 74, t: 218, w: 28, h: 88, r: 14 },
      { l: 112, t: 218, w: 28, h: 88, r: 14 },
    ],
    badge: { l: 156, t: 251 },
  },
  capricornio: {
    rects: [
      { l: 74, t: 307, w: 28, h: 24, r: 12 },
      { l: 112, t: 307, w: 28, h: 24, r: 12 },
    ],
    badge: { l: 156, t: 308 },
  },
  aquario: {
    rects: [
      { l: 77, t: 332, w: 22, h: 84, r: 11 },
      { l: 115, t: 332, w: 22, h: 84, r: 11 },
    ],
    badge: { l: 156, t: 363 },
  },
  peixes: {
    rects: [
      { l: 68, t: 417, w: 34, h: 16, r: 8 },
      { l: 112, t: 417, w: 34, h: 16, r: 8 },
    ],
    badge: { l: 91, t: 440 },
  },
};

// Peças pequenas ganham área de toque extra (o pescoço tem 18×16 px reais).
const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

const COLOR_BY_SIGN = zodiacSigns.reduce((acc, s) => {
  acc[s.name] = s.color;
  return acc;
}, {});

// #RRGGBB → rgba(). A opacidade do container apagaria o glifo junto com a
// peça, então a transparência tem que estar na própria cor de fundo.
function rgba(hex, alpha) {
  const h = String(hex || '#8A7CB0').replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(138,124,176,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function ZodiacBody({ selectedId, onSelect, sunSignId, moonSignId }) {
  const { t } = useLanguage();

  return (
    <View style={styles.canvas} accessibilityLabel={t('zodiacBody.figure.a11y')}>
      {ZODIAC_BODY.map((entry) => {
        const region = REGIONS[entry.id];
        if (!region) return null;

        const base = COLOR_BY_SIGN[entry.sign] || colors.purple;
        const isSelected = selectedId === entry.id;
        const isSun = sunSignId === entry.id;
        const isMoon = moonSignId === entry.id;

        // Prioridade da borda: seleção (o que a pessoa acabou de tocar) > Lua
        // de hoje (o que muda sozinho) > signo solar (fixo). Nunca as três na
        // mesma peça ao mesmo tempo, senão vira ruído.
        const borderColor = isSelected
          ? '#FFFFFF'
          : isMoon
            ? colors.gold
            : isSun
              ? colors.text
              : rgba(base, 0.5);
        const borderWidth = isSelected || isMoon || isSun ? 2 : 1;
        const backgroundColor = isSelected ? rgba(base, 0.85) : rgba(base, 0.26);

        const signName = t(signKey(entry.id, 'name'));
        const partName = t(signKey(entry.id, 'part'));
        const a11y = t('zodiacBody.figure.regionA11y', { sign: signName, part: partName });
        const press = () => onSelect && onSelect(entry.id);

        return (
          <React.Fragment key={entry.id}>
            {region.rects.map((r, i) => (
              <TouchableOpacity
                key={`${entry.id}-${i}`}
                activeOpacity={0.7}
                onPress={press}
                hitSlop={HIT_SLOP}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                // Só a primeira peça do par entra na leitura de tela — duas
                // vozes dizendo "Sagitário, coxas" seguidas é ruído.
                accessibilityElementsHidden={i > 0}
                importantForAccessibility={i > 0 ? 'no-hide-descendants' : 'yes'}
                accessibilityLabel={a11y}
                testID={i === 0 ? `zodiacbody-region-${entry.id}` : undefined}
                style={{
                  position: 'absolute',
                  left: r.l,
                  top: r.t,
                  width: r.w,
                  height: r.h,
                  borderRadius: r.r,
                  backgroundColor,
                  borderWidth,
                  borderColor,
                }}
              />
            ))}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={press}
              hitSlop={HIT_SLOP}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              testID={`zodiacbody-badge-${entry.id}`}
              style={[
                styles.badge,
                {
                  left: region.badge.l,
                  top: region.badge.t,
                  backgroundColor: isMoon ? colors.gold : rgba(base, isSelected ? 0.95 : 0.55),
                  borderColor: isSelected ? '#FFFFFF' : isSun ? colors.text : 'transparent',
                  borderWidth: isSelected || isSun ? 1.5 : 0,
                },
              ]}
            >
              <Text style={[styles.badgeText, isMoon && styles.badgeTextMoon]}>{entry.emoji}</Text>
            </TouchableOpacity>
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { width: FIG_W, height: FIG_H, alignSelf: 'center', position: 'relative' },
  badge: {
    position: 'absolute',
    width: BADGE_W,
    height: BADGE_H,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  badgeTextMoon: { color: '#2A1D52' },
});
