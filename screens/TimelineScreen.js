// Linha do tempo do casal — porta fiel de
// c:/tmp/gilfforever/web/app/(app)/timeline/page.js: mesmo schema de dados
// (gff:${voce}:${amor} -> { memories, capsules }, ver lib/coupleData.js), mesmas
// 3 memórias padrão sempre presentes e não removíveis, mesmo fluxo de
// adicionar/eliminar memória e cápsula do tempo, mesma lógica de cápsula
// selada vs. aberta (daysUntil(unlockAt) <= 0), com a cópia traduzida para
// PT-BR (mesmo padrão adotado em QuizScreen.js) e adaptada aos primitivos do
// React Native. Suporte a foto foi adiado (decisão explícita) — toda memória
// criada aqui salva photo: null, sem <input type="file">/canvas/base64.
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import DatePickerModal from '../components/DatePickerModal';
import { useCouple } from '../context/CoupleContext';
import { getTimeline, addMemory, deleteMemory, addCapsule, deleteCapsule, daysUntil } from '../lib/coupleData';

const HEADER_GRADIENT = ['#B5387A', '#FF8C5C'];

const DEFAULT_MEMORIES = [
  { id: 'd1', date: '2023-03-12', title: 'Primeiro encontro', text: 'Aquele café que virou 4 horas de conversa.', photo: null },
  { id: 'd2', date: '2023-07-28', title: 'Primeira viagem juntos', text: 'Praia, chuva e nós rindo de tudo.', photo: null },
  { id: 'd3', date: '2024-02-14', title: 'Um "eu te amo" de verdade', text: 'Sem pressa, como devia ser.', photo: null },
];

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function fmt(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d} ${MESES[+m - 1]} ${y}`;
}

export default function TimelineScreen() {
  const navigation = useNavigation();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [memories, setMemories] = useState([]);
  const [capsules, setCapsules] = useState([]);
  const [justAddedId, setJustAddedId] = useState(null);

  const [mTitle, setMTitle] = useState('');
  const [mDate, setMDate] = useState('');
  const [mText, setMText] = useState('');

  const [cMsg, setCMsg] = useState('');
  const [cDate, setCDate] = useState('');

  const [datePickerFor, setDatePickerFor] = useState(null); // null | 'memory' | 'capsule'

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const t = await getTimeline(voce, amor);
    setMemories(t.memories || []);
    setCapsules(t.capsules || []);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function handleAddMemory() {
    if (!mTitle.trim() || !mDate) return;
    const memory = await addMemory(voce, amor, { title: mTitle.trim(), date: mDate, text: mText.trim() });
    setMemories((prev) => [...prev, memory]);
    setMTitle('');
    setMDate('');
    setMText('');
    // Resalta brevemente a memória recém-salva na linha do tempo (mesmos 2.4s do original).
    setJustAddedId(memory.id);
    setTimeout(() => setJustAddedId((cur) => (cur === memory.id ? null : cur)), 2400);
  }

  async function handleDeleteMemory(id) {
    await deleteMemory(voce, amor, id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleAddCapsule() {
    if (!cMsg.trim() || !cDate) return;
    const capsule = await addCapsule(voce, amor, { message: cMsg.trim(), unlockAt: cDate });
    setCapsules((prev) => [...prev, capsule]);
    setCMsg('');
    setCDate('');
  }

  async function handleDeleteCapsule(id) {
    await deleteCapsule(voce, amor, id);
    setCapsules((prev) => prev.filter((c) => c.id !== id));
  }

  const allMemories = [...DEFAULT_MEMORIES, ...memories].sort((a, b) => a.date.localeCompare(b.date));
  const sign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || zodiacSigns[0];

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title="Linha do tempo" subtitle="Memórias do casal" onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>Complete o quiz do casal primeiro</Text>
          <Text style={styles.emptyProfileDesc}>
            Precisamos saber os nomes de vocês para guardar as memórias no lugar certo.
          </Text>
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>Fazer o quiz do casal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title="Linha do tempo" subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.linkCard}
          onPress={() => navigation.navigate(ROUTES.HOROSCOPE, { sign })}
        >
          <Text style={styles.linkBadge}>✷ Horóscopo do casal ✷</Text>
          <Text style={styles.linkText}>Veja a energia de hoje entre {voce} e {amor} →</Text>
        </TouchableOpacity>

        {/* Linha do tempo — memórias */}
        <Text style={styles.sectionTitle}>Linha do tempo</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{allMemories.length}</Text>
              <Text style={styles.statLabel}>📸 memórias</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{capsules.length}</Text>
              <Text style={styles.statLabel}>⏳ cápsulas</Text>
            </View>
          </View>

          {allMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💌</Text>
              <Text style={styles.emptyStateTitle}>Ainda não há memórias salvas</Text>
              <Text style={styles.emptyStateDesc}>Adicionem o primeiro capítulo da história de {voce} e {amor} 👇</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {allMemories.map((m) => (
                <View key={m.id} style={[styles.tlItem, m.id === justAddedId && styles.tlItemNew]}>
                  <Text style={styles.tlDate}>{fmt(m.date)}</Text>
                  <Text style={styles.tlTitle}>{m.title}</Text>
                  {!!m.text && <Text style={styles.tlText}>{m.text}</Text>}
                  {!String(m.id).startsWith('d') && (
                    <TouchableOpacity style={styles.delBtn} onPress={() => handleDeleteMemory(m.id)}>
                      <Text style={styles.delText}>eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Adicionar memória */}
        <Text style={styles.sectionTitle}>Adicionar uma memória</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Título</Text>
            <TextInput
              style={styles.input}
              value={mTitle}
              onChangeText={setMTitle}
              placeholder="Ex.: Nossa primeira viagem"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('memory')}>
              <Text style={[styles.dateBtnText, !mDate && styles.dateBtnPlaceholder]}>
                {mDate ? fmt(mDate) : 'Selecionar data'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={styles.input}
              value={mText}
              onChangeText={setMText}
              placeholder="Um detalhe para nunca esquecer"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={[styles.btn, (!mTitle.trim() || !mDate) && styles.btnDisabled]}
            onPress={handleAddMemory}
            disabled={!mTitle.trim() || !mDate}
          >
            <Text style={styles.btnText}>Salvar memória 💛</Text>
          </TouchableOpacity>
        </View>

        {/* Cápsulas do tempo */}
        <Text style={styles.sectionTitle}>Cápsulas do tempo ⏳</Text>
        {capsules.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>⏳</Text>
              <Text style={styles.emptyStateTitle}>Ainda não há nenhuma cápsula</Text>
              <Text style={styles.emptyStateDesc}>Grave uma mensagem que se abra no futuro 👇</Text>
            </View>
          </View>
        ) : (
          capsules.map((c) => {
            const restam = daysUntil(c.unlockAt);
            const aberta = restam <= 0;
            return (
              <View key={c.id} style={[styles.card, styles.capsuleCard, aberta && styles.capsuleOpened]}>
                <Text style={styles.capsuleLock}>{aberta ? '💛' : '🔒'}</Text>
                <Text style={styles.capsuleTitle}>{aberta ? 'Cápsula aberta!' : 'Cápsula selada'}</Text>
                {aberta ? (
                  <Text style={styles.capsuleMsg}>{c.message}</Text>
                ) : (
                  <>
                    <Text style={styles.capsuleCount}>{restam} {restam === 1 ? 'dia' : 'dias'}</Text>
                    <Text style={styles.capsuleSmall}>abre em {fmt(c.unlockAt)}</Text>
                  </>
                )}
                <TouchableOpacity style={styles.delBtn} onPress={() => handleDeleteCapsule(c.id)}>
                  <Text style={styles.delText}>eliminar</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Criar cápsula */}
        <Text style={styles.sectionTitle}>Criar uma cápsula</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Mensagem para o futuro</Text>
            <TextInput
              style={styles.input}
              value={cMsg}
              onChangeText={setCMsg}
              placeholder="Ex.: Lembra desse dia?"
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Abrir em</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('capsule')}>
              <Text style={[styles.dateBtnText, !cDate && styles.dateBtnPlaceholder]}>
                {cDate ? fmt(cDate) : 'Selecionar data'}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.btn, (!cMsg.trim() || !cDate) && styles.btnDisabled]}
            onPress={handleAddCapsule}
            disabled={!cMsg.trim() || !cDate}
          >
            <Text style={styles.btnText}>Selar cápsula ⏳</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>Dica: para ver uma cápsula "abrir", escolha a data de hoje ou de ontem.</Text>
        </View>

        <Text style={styles.disclaimer}>As memórias e cápsulas de vocês ficam salvas apenas neste aparelho.</Text>
      </ScrollView>

      <DatePickerModal
        visible={!!datePickerFor}
        title={datePickerFor === 'capsule' ? 'Abrir em' : 'Data da memória'}
        initialDate={datePickerFor === 'capsule' ? cDate : mDate}
        onClose={() => setDatePickerFor(null)}
        onConfirm={(dateStr) => {
          if (datePickerFor === 'capsule') setCDate(dateStr);
          else setMDate(dateStr);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  linkCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 20,
  },
  linkBadge: {
    color: colors.accent, fontSize: 12, fontWeight: '700',
    backgroundColor: colors.accent + '22', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4,
  },
  linkText: { color: colors.textSecondary, fontSize: 13, marginTop: 8, textAlign: 'center' },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },

  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border, marginHorizontal: 12 },

  emptyState: { alignItems: 'center', paddingVertical: 12 },
  emptyStateIcon: { fontSize: 32, marginBottom: 8 },
  emptyStateTitle: { color: colors.text, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyStateDesc: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 4 },

  timeline: { marginTop: 4 },
  tlItem: { borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 12, paddingBottom: 16 },
  tlItemNew: { backgroundColor: colors.accent + '18', borderRadius: 10, paddingTop: 8, paddingRight: 8, marginLeft: -8, paddingLeft: 20 },
  tlDate: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tlTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginTop: 2 },
  tlText: { color: colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 19 },

  delBtn: { marginTop: 8, alignSelf: 'flex-start' },
  delText: { color: colors.red, fontSize: 12, fontWeight: '700' },

  field: { marginBottom: 14 },
  label: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15,
  },
  dateBtn: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
  },
  dateBtnText: { color: colors.text, fontSize: 15 },
  dateBtnPlaceholder: { color: colors.textMuted },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },

  hint: { color: colors.textMuted, fontSize: 12, marginTop: 12, lineHeight: 17 },

  capsuleCard: { alignItems: 'center', marginBottom: 14 },
  capsuleOpened: { borderColor: colors.gold },
  capsuleLock: { fontSize: 26 },
  capsuleTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginTop: 6 },
  capsuleMsg: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  capsuleCount: { color: colors.gold, fontSize: 22, fontWeight: '800', marginTop: 8 },
  capsuleSmall: { color: colors.textMuted, fontSize: 12, marginTop: 2 },

  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 16, paddingHorizontal: 8 },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
