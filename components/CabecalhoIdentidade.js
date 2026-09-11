// CABEÇALHO DE IDENTIDADE — Sol, Lua e Ascendente da pessoa no topo da Home,
// com os quatro elementos desenhados em anel (referência do dono, 11/09/2026:
// o cabeçalho do concorrente que "diz quem você é" antes de qualquer card).
//
// Este componente NÃO calcula nada: recebe `identidade` já pronta de
// lib/identidadeCeleste.js (carregarIdentidade) e só desenha. Regra "NUNCA
// FABRICAR": sem data de nascimento salva `identidade` chega null, e aqui isso
// vira um convite pra preencher — nunca um signo chutado. Ascendente sem hora
// ou cidade chega null e aparece como '—' apagado, pelo mesmo motivo.
//
// Nome do signo: o motor devolve o nome canônico em PT ('Touro'); a tradução é
// a MESMA função da saudação da Home (nomeDoSigno de lib/synastry), pra os dois
// textos nunca discordarem no mesmo idioma.
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useLanguage } from '../context/LanguageContext';
import { nomeDoSigno } from '../lib/synastry';
import AnelProgresso from './AnelProgresso';

// Chaves LITERAIS (não template) pra varredura estática de
// test/i18nKeysExist.test.js enxergar cada uma.
const CHIPS = [
  { campo: 'sun', icone: 'sunny-outline', rotulo: 'home.identidade.sol' },
  { campo: 'moon', icone: 'moon-outline', rotulo: 'home.identidade.lua' },
  { campo: 'asc', icone: 'trending-up-outline', rotulo: 'home.identidade.asc' },
];

// Mesma ordem e mesmas cores de ELEMENTOS_META em BirthChartScreen.js — o anel
// da Home e o do Mapa precisam ser reconhecidos como a mesma coisa.
const ELEMENTOS = [
  { key: 'fogo', labelKey: 'birthchart.elements.fire', cor: '#FF8C5C' },
  { key: 'terra', labelKey: 'birthchart.elements.earth', cor: colors.green },
  { key: 'ar', labelKey: 'birthchart.elements.air', cor: colors.teal },
  { key: 'agua', labelKey: 'birthchart.elements.water', cor: colors.blue },
];

export default function CabecalhoIdentidade({ identidade, onMapa }) {
  const { t, lang } = useLanguage();

  // TRÊS ESTADOS, não dois (11/09/2026, apontado pelos dois revisores):
  // `undefined` = ainda carregando → não desenha NADA. Antes o convite
  // "Adicionar data de nascimento" piscava por ~25ms na abertura pra quem JÁ
  // tinha data salva, até readSecureItem + astronomy-engine resolverem.
  // `null` = carregou e não há data → convite. Objeto = a ficha.
  if (identidade === undefined) return null;
  if (!identidade) {
    return (
      <View style={styles.raiz}>
        <TouchableOpacity
          onPress={onMapa}
          style={styles.pill}
          accessibilityRole="button"
          testID="home-identidade-convite"
        >
          <Ionicons name="planet-outline" size={16} color={colors.gold} accessible={false} />
          <Text style={styles.pillTexto}>{t('home.identidade.adicionar')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.raiz} testID="home-identidade">
      <View style={styles.chips}>
        {CHIPS.map((c) => {
          const nome = identidade[c.campo];
          return (
            <View key={c.campo} style={styles.chip}>
              <Ionicons name={c.icone} size={14} color={colors.textMuted} accessible={false} />
              <Text style={styles.chipRotulo}>{t(c.rotulo)}</Text>
              <Text style={[styles.chipValor, !nome && styles.chipMudo]}>
                {nome ? nomeDoSigno(nome, lang) : '—'}
              </Text>
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        onPress={onMapa}
        style={styles.pill}
        accessibilityRole="button"
        testID="home-identidade-mapa"
      >
        <Ionicons name="planet-outline" size={16} color={colors.gold} accessible={false} />
        <Text style={styles.pillTexto}>{t('home.identidade.mapa')}</Text>
      </TouchableOpacity>

      {identidade.elementos && (
        <View style={styles.aneis}>
          {ELEMENTOS.map((e) => {
            const pct = identidade.elementos.pct[e.key];
            return (
              <View key={e.key} style={styles.anelCol}>
                {/* O anel é redundante ao número que ele embrulha; só o texto
                    precisa chegar ao leitor de tela. */}
                <View accessible={false}>
                  <AnelProgresso pct={pct} size={62} espessura={5} cor={e.cor}>
                    <Text style={[styles.anelPct, { color: e.cor }]}>{pct}%</Text>
                  </AnelProgresso>
                </View>
                <Text style={styles.anelRotulo}>{t(e.labelKey)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { marginHorizontal: 20, marginTop: 6, marginBottom: 4, alignItems: 'center' },
  chips: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipRotulo: { color: colors.textMuted, fontSize: 11 },
  chipValor: { color: colors.text, fontSize: 13, fontWeight: '700' },
  chipMudo: { color: colors.textMuted },
  // Dourado é a única cor de ação do app (ver FeatureCard.js); o '99' no fim
  // é o alpha da borda, pra não competir com o texto.
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold + '99', borderRadius: 22,
    paddingVertical: 10, paddingHorizontal: 18, marginTop: 12,
  },
  pillTexto: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  aneis: { flexDirection: 'row', justifyContent: 'space-around', alignSelf: 'stretch', marginTop: 14 },
  anelCol: { alignItems: 'center' },
  anelPct: { fontSize: 12, fontWeight: '800' },
  anelRotulo: { color: colors.textMuted, fontSize: 11, marginTop: 5 },
});
