import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';
import OneTimeLock from '../components/OneTimeLock';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

const DIARY_RECORDED_KEY = 'cosmic-horoscope-diary-date';

const FEATURE_KEY = 'horoscope';

// As strings de TABS seguem sendo os identificadores internos (seed do hash,
// chaves de READING_POOL, comparações em dateForTab) — só a EXIBIÇÃO passa
// pelo t() com as chaves abaixo, pra troca de idioma não mexer no conteúdo
// sorteado do dia.
const TABS = ['Ontem', 'Hoje', 'Amanhã'];
const TAB_LABEL_KEYS = {
  Ontem: 'horoscope.tab.yesterday',
  Hoje: 'horoscope.tab.today',
  'Amanhã': 'horoscope.tab.tomorrow',
};

// Elementos vêm de theme.js em PT ('Fogo'/'Terra'/'Ar'/'Água') e são usados
// como dado — aqui só mapeamos pro rótulo traduzível.
const ELEMENT_LABEL_KEYS = {
  Fogo: 'horoscope.elementName.fogo',
  Terra: 'horoscope.elementName.terra',
  Ar: 'horoscope.elementName.ar',
  'Água': 'horoscope.elementName.agua',
};

// Mesmo esquema do "Gesto do dia" em AgirScreen.js: hash simples da string ->
// índice num pool de conteúdo. Aqui o seed combina signo + aba + data, então
// (a) signos diferentes no mesmo dia caem em índices diferentes do pool e
// (b) o mesmo signo em dias diferentes também muda, sem precisar de backend
// nem de Math.random (que quebraria a consistência ao re-renderizar).
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function isoDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function todayISO() {
  return isoDate(new Date());
}

// Data real que cada aba representa (ontem/hoje/amanhã), para que o conteúdo
// mude de fato de um dia para o outro em vez de ficar fixo.
function dateForTab(tab) {
  const d = new Date();
  if (tab === 'Ontem') d.setDate(d.getDate() - 1);
  if (tab === 'Amanhã') d.setDate(d.getDate() + 1);
  return isoDate(d);
}

// Pool de leituras por aba (o tempo verbal muda: passado/presente/futuro),
// com várias variações genéricas de conteúdo de entretenimento — sem inventar
// previsões reais, só "sabores" diferentes de energia do dia. Os textos em si
// moram no dicionário i18n (horoscope.reading.*) — aqui ficam só as chaves,
// pro sorteio por hash continuar idêntico em qualquer idioma.
const READING_POOL = {
  Ontem: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `horoscope.reading.ontem.${n}`),
  Hoje: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `horoscope.reading.hoje.${n}`),
  'Amanhã': [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `horoscope.reading.amanha.${n}`),
};

// Pool de conjuntos de pontuação (Amor/Trabalho/Saúde/Dinheiro), selecionado
// pelo mesmo hash — assim os quatro números também variam por signo/dia.
const SCORE_POOL = [
  { Amor: 62, Trabalho: 74, Saúde: 58, Dinheiro: 70 },
  { Amor: 88, Trabalho: 76, Saúde: 82, Dinheiro: 65 },
  { Amor: 71, Trabalho: 90, Saúde: 68, Dinheiro: 84 },
  { Amor: 55, Trabalho: 60, Saúde: 90, Dinheiro: 58 },
  { Amor: 80, Trabalho: 55, Saúde: 72, Dinheiro: 92 },
  { Amor: 65, Trabalho: 85, Saúde: 60, Dinheiro: 77 },
  { Amor: 92, Trabalho: 68, Saúde: 75, Dinheiro: 60 },
  { Amor: 58, Trabalho: 72, Saúde: 85, Dinheiro: 66 },
  { Amor: 76, Trabalho: 62, Saúde: 66, Dinheiro: 88 },
  { Amor: 84, Trabalho: 80, Saúde: 70, Dinheiro: 54 },
];

// Pools da "sorte do dia" — antes eram literais fixos (Violeta/7/15h) iguais
// para qualquer signo em qualquer dia; agora saem do mesmo hash, com um "sal"
// próprio para cada campo para não andarem sempre em bloco. Os valores viraram
// chaves do i18n (o hash só usa o length, então o sorteio não muda).
const LUCK_COLORS = [
  'horoscope.luck.colorName.violeta', 'horoscope.luck.colorName.rosa',
  'horoscope.luck.colorName.dourado', 'horoscope.luck.colorName.turquesa',
  'horoscope.luck.colorName.verde', 'horoscope.luck.colorName.ambar',
  'horoscope.luck.colorName.vermelho', 'horoscope.luck.colorName.azul',
];
const LUCK_NUMBERS = [2, 3, 4, 7, 8, 9, 11, 13, 17, 21];
const LUCK_HOURS = [9, 11, 13, 15, 17, 18, 20, 21].map((h) => `horoscope.luck.hourValue.${h}`);

function readingFor(sign, tab, t) {
  const seed = `${sign.name}|${tab}|${dateForTab(tab)}`;
  const textPool = READING_POOL[tab];
  const text = t(textPool[hashStr(seed) % textPool.length]);
  const scores = SCORE_POOL[hashStr(`${seed}|scores`) % SCORE_POOL.length];
  return { text, scores };
}

function luckFor(sign, t) {
  const seed = `${sign.name}|${todayISO()}`;
  return {
    cor: t(LUCK_COLORS[hashStr(`${seed}|cor`) % LUCK_COLORS.length]),
    numero: LUCK_NUMBERS[hashStr(`${seed}|numero`) % LUCK_NUMBERS.length],
    hora: t(LUCK_HOURS[hashStr(`${seed}|hora`) % LUCK_HOURS.length]),
  };
}

export default function HoroscopeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  const { t } = useLanguage();
  const [sign, setSign] = useState(route.params?.sign || zodiacSigns[0]);
  const [tab, setTab] = useState('Hoje');
  const [showPicker, setShowPicker] = useState(false);
  const [locked, setLocked] = useState(false);

  const r = readingFor(sign, tab, t);
  const luck = luckFor(sign, t);

  // Sem botão de ação aqui — o conteúdo já aparece ao montar a tela. Por isso
  // checagem e marcação acontecem juntas: só marca como usado quando a checagem
  // confirma que ainda não tinha sido usado, garantindo que a pessoa sempre veja
  // o conteúdo completo nessa primeira visita (não bloqueia na mesma passada).
  useEffect(() => {
    // accessConfirmed=false = a checagem de assinatura falhou por rede, não
    // confirmou nada de verdade — nunca marcar a prévia grátis como usada
    // nesse caso (achado real de auditoria, 25/07/2026).
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (used) {
        setLocked(true);
      } else {
        markFeatureUsedOnce(FEATURE_KEY);
      }
    });
  }, [hasAccess, accessConfirmed]);

  // Vira entrada no Diário Cósmico 1x por dia (não a cada troca de aba/signo,
  // senão o Diário enche de quase-duplicatas) — antes o Horóscopo não deixava
  // rastro nenhum de uso real (achado real de auditoria de retenção, 25/07/2026).
  useEffect(() => {
    const today = todayISO();
    AsyncStorage.getItem(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === today) return;
      const todayReading = readingFor(sign, 'Hoje', t);
      recordReadingCompletion({
        type: 'horoscope',
        typeLabel: t('home.card.horoscope.title'),
        title: t('horoscope.diary.title', { sign: sign.pt }),
        body: todayReading.text,
      }).then(() => AsyncStorage.setItem(DIARY_RECORDED_KEY, today));
    });
  }, [sign]);

  const pickSign = async (z) => {
    Haptics.selectionAsync();
    setSign(z);
    setShowPicker(false);
    await AsyncStorage.setItem('userSign', JSON.stringify(z));
  };

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle={t('home.card.horoscope.title')} gradient={['#7B3FB5', '#A66CFF']} />;
  }

  return (
    <View style={styles.root} testID="horoscope-reading">
      <GradientHeader
        title={t('home.card.horoscope.title')}
        subtitle={sign.pt}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
            <Ionicons name="swap-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {showPicker && (
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>{t('horoscope.pickerTitle')}</Text>
            <View style={styles.pickerGrid}>
              {zodiacSigns.map((z) => (
                <TouchableOpacity
                  key={z.name}
                  style={[styles.pickerItem, sign.name === z.name && { backgroundColor: z.color + '33', borderColor: z.color }]}
                  onPress={() => pickSign(z)}
                >
                  <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                  <Text style={styles.pickerName}>{z.pt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tabs}>
          {TABS.map((tabName) => (
            <TouchableOpacity
              key={tabName}
              style={[styles.tab, tab === tabName && styles.tabActive]}
              onPress={() => { Haptics.selectionAsync(); setTab(tabName); }}
            >
              <Text style={[styles.tabText, tab === tabName && styles.tabTextActive]}>{t(TAB_LABEL_KEYS[tabName])}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mainCard}>
          <LinearGradient colors={[sign.color + '44', 'transparent']} style={styles.signHeader}>
            <View style={[styles.bigGlyph, { backgroundColor: sign.color + '33' }]}>
              <Text style={[styles.bigGlyphText, { color: sign.color }]}>{sign.icon}</Text>
            </View>
            <View>
              <Text style={styles.bigName}>{sign.pt}</Text>
              <Text style={styles.bigDates}>{sign.dates}</Text>
              <View style={styles.elementRow}>
                <Ionicons name="flash" size={12} color={sign.color} />
                <Text style={[styles.element, { color: sign.color }]}>{t('horoscope.element', { element: ELEMENT_LABEL_KEYS[sign.element] ? t(ELEMENT_LABEL_KEYS[sign.element]) : sign.element })}</Text>
              </View>
            </View>
          </LinearGradient>
          <Text style={styles.reading}>{r.text}</Text>
        </View>

        <Text style={styles.sub}>{t('horoscope.areasTitle')}</Text>
        <View style={styles.scoresCard}>
          <ScoreBar label={t('horoscope.area.amor')} value={r.scores.Amor} gradient={['#FF6BA0', '#FF8C5C']} />
          <ScoreBar label={t('horoscope.area.trabalho')} value={r.scores.Trabalho} gradient={['#5CA8FF', '#6C7BFF']} />
          <ScoreBar label={t('horoscope.area.saude')} value={r.scores.Saúde} gradient={['#5FD98C', '#5CE0D8']} />
          <ScoreBar label={t('horoscope.area.dinheiro')} value={r.scores.Dinheiro} gradient={['#FFB84D', '#FFC85C']} />
        </View>

        <Text style={styles.sub}>{t('horoscope.luckTitle')}</Text>
        <View style={styles.luckRow}>
          <LuckItem icon="color-palette" color={colors.pink} label={t('horoscope.luck.color')} value={luck.cor} />
          <LuckItem icon="dice" color={colors.gold} label={t('horoscope.luck.number')} value={String(luck.numero)} />
          <LuckItem icon="time" color={colors.teal} label={t('horoscope.luck.hour')} value={luck.hora} />
        </View>
      </ScrollView>
    </View>
  );
}

function LuckItem({ icon, color, label, value }) {
  return (
    <View style={styles.luckItem}>
      <View style={[styles.luckIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.luckLabel}>{label}</Text>
      <Text style={styles.luckValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pickerCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  pickerTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 12 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: { width: '31%', backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pickerGlyph: { fontSize: 22 },
  pickerName: { color: colors.textSecondary, fontSize: 11, marginTop: 4, fontWeight: '600' },
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  mainCard: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  signHeader: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  bigGlyph: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  bigGlyphText: { fontSize: 30 },
  bigName: { color: colors.text, fontSize: 20, fontWeight: '800' },
  bigDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  elementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  element: { fontSize: 12, fontWeight: '700' },
  reading: { color: colors.textSecondary, fontSize: 15, lineHeight: 23, padding: 18, paddingTop: 4 },
  sub: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  scoresCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  luckRow: { flexDirection: 'row', gap: 12 },
  luckItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  luckIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  luckLabel: { color: colors.textMuted, fontSize: 12 },
  luckValue: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 2 },
});
