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
import { useCouple } from '../context/CoupleContext';

const FEATURE_KEY = 'horoscope';

const TABS = ['Ontem', 'Hoje', 'Amanhã'];

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
// previsões reais, só "sabores" diferentes de energia do dia.
const READING_POOL = {
  Ontem: [
    'A energia de ontem trouxe reflexões importantes sobre seus vínculos. O que ficou pendente pede resolução calma. A Lua minguante favoreceu o encerramento de ciclos.',
    'Ontem foi um dia de olhar para dentro. Uma conversa deixou lições valiosas, mesmo que o momento tenha sido desconfortável. O que passou já cumpriu seu papel.',
    'O dia de ontem pediu paciência com você mesmo(a). Pequenos atritos revelaram o que precisa de mais atenção esta semana. Nada se perdeu, só amadureceu.',
    'Ontem trouxe um convite silencioso para soltar o que já não serve. A energia de Marte ainda ecoava em decisões rápidas, mas a calma venceu no fim do dia.',
    'A Lua de ontem favoreceu memórias e reencontros. Algo do passado voltou à mente para ser finalmente compreendido, não revivido.',
    'Ontem exigiu organização e método. Tarefas represadas começaram a andar, mesmo que o ritmo tenha parecido lento demais para o seu gosto.',
    'O céu de ontem trouxe clareza sobre um sentimento que você vinha evitando nomear. Encarar isso foi o primeiro passo para virar a página.',
    'Ontem foi propício para ajustar expectativas. O que parecia urgente perdeu força assim que você respirou fundo e observou com mais distância.',
  ],
  Hoje: [
    'O céu de hoje pede coragem para dizer sim ao novo. Vênus ilumina seus relacionamentos e traz suavidade às conversas difíceis. Confie na sua intuição — ela raramente falha. É um bom dia para iniciar projetos que envolvam criatividade e conexão.',
    'Hoje o dia pede foco e menos dispersão. Mercúrio favorece conversas objetivas, então aproveite para resolver o que anda te tirando o sono.',
    'O sol de hoje ilumina sua autoconfiança. É um bom momento para se posicionar sobre algo que você vinha adiando por medo do julgamento alheio.',
    'Hoje sua intuição está mais afiada que o normal. Preste atenção aos pequenos sinais — eles tendem a apontar na direção certa.',
    'O dia de hoje favorece parcerias. Uma troca sincera pode destravar algo que estava emperrado há tempos, no trabalho ou em casa.',
    'Hoje pede leveza. Não force respostas: algumas coisas se resolvem sozinhas quando você para de empurrar tanto.',
    'O céu de hoje aquece os relacionamentos próximos. Vale a pena reservar um tempo para quem importa, mesmo que a agenda esteja cheia.',
    'Hoje é um dia de ajustes finos. Pequenas mudanças de rotina rendem mais do que grandes decisões tomadas às pressas.',
  ],
  Amanhã: [
    'Amanhã Mercúrio favorece decisões práticas. Uma oportunidade profissional pode surgir de onde você menos espera. Mantenha os olhos abertos e o coração leve.',
    'Amanhã tende a exigir paciência com prazos. Uma notícia inesperada pode reorganizar seus planos — encare como ajuste, não como obstáculo.',
    'O dia de amanhã favorece conversas francas. Se há algo pendente para dizer a alguém, esse pode ser o momento certo.',
    'Amanhã a Lua favorece o descanso. Vale desacelerar antes de tomar decisões importantes que podem esperar mais um dia.',
    'Amanhã promete movimento nas finanças. Um gasto ou uma entrada inesperada pede atenção redobrada ao planejamento.',
    'O céu de amanhã abre espaço para recomeços pequenos. Não precisa ser um grande gesto — um passo simples já muda o rumo do dia.',
    'Amanhã tende a trazer clareza sobre um dilema recente. A resposta pode não ser a que você esperava, mas será a mais honesta.',
    'Amanhã favorece a criatividade. Se algo trava no modo tradicional, vale tentar um caminho diferente do habitual.',
  ],
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
// próprio para cada campo para não andarem sempre em bloco.
const LUCK_COLORS = [
  'Violeta', 'Rosa', 'Dourado', 'Turquesa', 'Verde', 'Âmbar', 'Vermelho', 'Azul',
];
const LUCK_NUMBERS = [2, 3, 4, 7, 8, 9, 11, 13, 17, 21];
const LUCK_HOURS = ['9h', '11h', '13h', '15h', '17h', '18h', '20h', '21h'];

function readingFor(sign, tab) {
  const seed = `${sign.name}|${tab}|${dateForTab(tab)}`;
  const textPool = READING_POOL[tab];
  const text = textPool[hashStr(seed) % textPool.length];
  const scores = SCORE_POOL[hashStr(`${seed}|scores`) % SCORE_POOL.length];
  return { text, scores };
}

function luckFor(sign) {
  const seed = `${sign.name}|${todayISO()}`;
  return {
    cor: LUCK_COLORS[hashStr(`${seed}|cor`) % LUCK_COLORS.length],
    numero: LUCK_NUMBERS[hashStr(`${seed}|numero`) % LUCK_NUMBERS.length],
    hora: LUCK_HOURS[hashStr(`${seed}|hora`) % LUCK_HOURS.length],
  };
}

export default function HoroscopeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { hasAccess } = useCouple();
  const [sign, setSign] = useState(route.params?.sign || zodiacSigns[0]);
  const [tab, setTab] = useState('Hoje');
  const [showPicker, setShowPicker] = useState(false);
  const [locked, setLocked] = useState(false);

  const r = readingFor(sign, tab);
  const luck = luckFor(sign);

  // Sem botão de ação aqui — o conteúdo já aparece ao montar a tela. Por isso
  // checagem e marcação acontecem juntas: só marca como usado quando a checagem
  // confirma que ainda não tinha sido usado, garantindo que a pessoa sempre veja
  // o conteúdo completo nessa primeira visita (não bloqueia na mesma passada).
  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (used) {
        setLocked(true);
      } else {
        markFeatureUsedOnce(FEATURE_KEY);
      }
    });
  }, [hasAccess]);

  const pickSign = async (z) => {
    Haptics.selectionAsync();
    setSign(z);
    setShowPicker(false);
    await AsyncStorage.setItem('userSign', JSON.stringify(z));
  };

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Horóscopo" gradient={['#7B3FB5', '#A66CFF']} />;
  }

  return (
    <View style={styles.root} testID="horoscope-reading">
      <GradientHeader
        title="Horóscopo"
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
            <Text style={styles.pickerTitle}>Escolha seu signo</Text>
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
          {TABS.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.tab, tab === t && styles.tabActive]}
              onPress={() => { Haptics.selectionAsync(); setTab(t); }}
            >
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
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
                <Text style={[styles.element, { color: sign.color }]}>Elemento {sign.element}</Text>
              </View>
            </View>
          </LinearGradient>
          <Text style={styles.reading}>{r.text}</Text>
        </View>

        <Text style={styles.sub}>Áreas da sua vida</Text>
        <View style={styles.scoresCard}>
          <ScoreBar label="Amor" value={r.scores.Amor} gradient={['#FF6BA0', '#FF8C5C']} />
          <ScoreBar label="Trabalho" value={r.scores.Trabalho} gradient={['#5CA8FF', '#6C7BFF']} />
          <ScoreBar label="Saúde" value={r.scores.Saúde} gradient={['#5FD98C', '#5CE0D8']} />
          <ScoreBar label="Dinheiro" value={r.scores.Dinheiro} gradient={['#FFB84D', '#FFC85C']} />
        </View>

        <Text style={styles.sub}>Sua sorte hoje</Text>
        <View style={styles.luckRow}>
          <LuckItem icon="color-palette" color={colors.pink} label="Cor" value={luck.cor} />
          <LuckItem icon="dice" color={colors.gold} label="Número" value={String(luck.numero)} />
          <LuckItem icon="time" color={colors.teal} label="Hora" value={luck.hora} />
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
