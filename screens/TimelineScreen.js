// Linha do tempo do casal — porta de
// c:/tmp/gilfforever/web/app/(app)/timeline/page.js: mesmo schema de dados
// (gff:${voce}:${amor} -> { memories, capsules }, ver lib/coupleData.js), mesmo
// fluxo de adicionar/eliminar memória e cápsula do tempo, mesma lógica de
// cápsula selada vs. aberta (daysUntil(unlockAt) <= 0), com a cópia traduzida
// para PT-BR (mesmo padrão adotado em QuizScreen.js) e adaptada aos primitivos
// do React Native. Suporte a foto foi adiado (decisão explícita) — toda memória
// criada aqui salva photo: null, sem <input type="file">/canvas/base64.
//
// DIVERGÊNCIA PROPOSITAL do original (29/07/2026): as 3 "memórias padrão"
// (primeiro encontro / primeira viagem / "eu te amo") FORAM REMOVIDAS. Elas
// faziam todo casal novo abrir a tela vendo "3 memórias" que nunca viveram,
// com o botão de apagar escondido justamente nessas três — e ainda punham a
// tela em contradição com Progresso ("0 memórias", conquista "Primeira
// memória" trancada) e Retrospectiva ("o ano de vocês ainda está sendo
// escrito"), que sempre contaram só o que a pessoa realmente salvou
// (lib/activity.js lê timeline.memories direto do storage). Agora as três
// telas leem a MESMA lista. O estado vazio honesto abaixo, que era código
// morto, é o que roda pra quem chega.
import React, { useCallback, useRef, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import DatePickerModal from '../components/DatePickerModal';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import FileiraDeTres from '../components/FileiraDeTres';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { getTimeline, addMemory, deleteMemory, addCapsule, deleteCapsule, daysUntil } from '../lib/coupleData';

const HEADER_GRADIENT = ['#B5387A', '#FF8C5C'];

function fmt(iso, t) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return t('timeline.dateFormat', { d, month: t(`timeline.month.${+m - 1}`), y });
}

export default function TimelineScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
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

  // O CTA do estado vazio precisa LEVAR ao formulário, não só pedir. O
  // formulário mora nesta mesma tela, logo abaixo, então "levar" aqui é rolar
  // até ele: guardamos o y do bloco (relativo ao conteúdo do ScrollView, que é
  // o que scrollTo espera) no onLayout e usamos no toque.
  const scrollRef = useRef(null);
  const addMemoryY = useRef(0);

  function scrollToAddMemory() {
    scrollRef.current?.scrollTo({ y: Math.max(0, addMemoryY.current - 12), animated: true });
  }

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const tl = await getTimeline(voce, amor);
    setMemories(tl.memories || []);
    setCapsules(tl.capsules || []);
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

  // Só o que o casal salvou de verdade — mesma lista que lib/activity.js conta
  // em Progresso e Retrospectiva.
  const allMemories = [...memories].sort((a, b) => a.date.localeCompare(b.date));
  const sign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || zodiacSigns[0];

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title={t('timeline.header.title')} subtitle={t('timeline.header.subtitle')} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>{t('timeline.gate.title')}</Text>
          <ColunaLeitura centralizado>
            <Text style={styles.emptyProfileDesc}>
              {t('timeline.gate.desc')}
            </Text>
          </ColunaLeitura>
          <TouchableOpacity style={[styles.btn, styles.btnDoGate]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>{t('timeline.gate.cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title={t('timeline.header.title')} subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.linkCard}
          onPress={() => navigation.navigate(ROUTES.HOROSCOPE, { sign })}
        >
          <Text style={styles.linkBadge}>{t('timeline.link.badge')}</Text>
          <Text style={styles.linkText}>{t('timeline.link.text', { voce, amor })}</Text>
        </TouchableOpacity>

        {/* TRES FAIXAS. A tela empilhava SEIS cards iguais no mesmo chao —
            linha do tempo, formulario, capsulas, formulario de capsula — e o
            olho nao tinha onde separar "o que ja aconteceu" de "o que eu
            escrevo agora". Os cortes reais sao tres: A HISTORIA (memorias +
            o formulario que alimenta a lista), AS CAPSULAS (as seladas + o
            formulario que sela) e nada mais. O cartao de link do topo fica de
            fora: e o convite de entrada, nao uma secao. */}
        <FaixaCurva tom="ameixa" semente="timeline-memorias" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
        {/* Linha do tempo — memórias */}
        <Text style={styles.sectionTitle}>{t('timeline.section.timeline')}</Text>
        <View style={styles.card}>
          {/* A FILEIRA no lugar dos dois numeros com um fio vertical no meio:
              mesmas duas contagens, agora alinhadas pelo topo e com o peso
              igual que faz as duas lerem como UMA peca.
              DUAS COLUNAS, E NAO TRES, DE PROPOSITO. Cheguei a montar uma
              terceira (capsulas ja abertas, contada de daysUntil <= 0 — dado
              real) e desisti: o unico rotulo que o dicionario tem pra isso e
              "Capsula aberta!", que e o titulo comemorativo do card, nao um
              rotulo de coluna — e inventar copy nova nao e o que este lote
              faz. A peca aceita duas colunas; ela so se recusa a desenhar
              UMA, que ai nao e comparacao.
              Zero e valor real e aparece: casal sem nenhuma memoria le "0",
              que e a verdade, em vez da coluna sumir. */}
          <View style={styles.fileiraWrap}>
            <FileiraDeTres
              testID="timeline-fileira"
              itens={[
                { chave: 'memorias', valor: allMemories.length, rotulo: t('timeline.stat.memories') },
                { chave: 'capsulas', valor: capsules.length, rotulo: t('timeline.stat.capsules') },
              ]}
            />
          </View>

          {allMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>💌</Text>
              <Text style={styles.emptyStateTitle}>{t('timeline.empty.memories.title')}</Text>
              <Text style={styles.emptyStateDesc}>{t('timeline.empty.memories.desc', { voce, amor })}</Text>
              <TouchableOpacity style={[styles.btn, styles.emptyStateBtn]} onPress={scrollToAddMemory}>
                <Text style={styles.btnText}>{t('timeline.empty.memories.cta')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timeline}>
              {allMemories.map((m) => (
                <View key={m.id} style={[styles.tlItem, m.id === justAddedId && styles.tlItemNew]}>
                  <Text style={styles.tlDate}>{fmt(m.date, t)}</Text>
                  <Text style={styles.tlTitle}>{m.title}</Text>
                  {!!m.text && <Text style={styles.tlText}>{m.text}</Text>}
                  {/* Toda memória na lista agora é do casal, então toda memória
                      pode ser apagada. O antigo `!id.startsWith('d')` só existia
                      pra blindar as memórias inventadas. */}
                  <TouchableOpacity style={styles.delBtn} onPress={() => handleDeleteMemory(m.id)}>
                    <Text style={styles.delText}>{t('timeline.delete')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Adicionar memória — alvo do CTA do estado vazio */}
        <View onLayout={(e) => { addMemoryY.current = e.nativeEvent.layout.y; }}>
        <Text style={styles.sectionTitle}>{t('timeline.addMemory.section')}</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('timeline.addMemory.titleLabel')}</Text>
            <TextInput
              style={styles.input}
              value={mTitle}
              onChangeText={setMTitle}
              placeholder={t('timeline.addMemory.titlePlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('timeline.addMemory.dateLabel')}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('memory')}>
              <Text style={[styles.dateBtnText, !mDate && styles.dateBtnPlaceholder]}>
                {mDate ? fmt(mDate, t) : t('timeline.selectDate')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('timeline.addMemory.descLabel')}</Text>
            <TextInput
              style={styles.input}
              value={mText}
              onChangeText={setMText}
              placeholder={t('timeline.addMemory.descPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity
            style={[styles.btn, (!mTitle.trim() || !mDate) && styles.btnDisabled]}
            onPress={handleAddMemory}
            disabled={!mTitle.trim() || !mDate}
          >
            <Text style={styles.btnText}>{t('timeline.addMemory.save')}</Text>
          </TouchableOpacity>
        </View>
        </View>

        </FaixaCurva>

        <FaixaCurva tom="noite" semente="timeline-capsulas" grude="ameixa" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
        {/* Cápsulas do tempo */}
        <Text style={styles.sectionTitle}>{t('timeline.capsules.section')}</Text>
        {capsules.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>⏳</Text>
              <Text style={styles.emptyStateTitle}>{t('timeline.capsules.empty.title')}</Text>
              <Text style={styles.emptyStateDesc}>{t('timeline.capsules.empty.desc')}</Text>
            </View>
          </View>
        ) : (
          capsules.map((c) => {
            const restam = daysUntil(c.unlockAt);
            const aberta = restam <= 0;
            return (
              <View key={c.id} style={[styles.card, styles.capsuleCard, aberta && styles.capsuleOpened]}>
                <Text style={styles.capsuleLock}>{aberta ? '💛' : '🔒'}</Text>
                <Text style={styles.capsuleTitle}>{aberta ? t('timeline.capsule.opened') : t('timeline.capsule.sealed')}</Text>
                {aberta ? (
                  <Text style={styles.capsuleMsg}>{c.message}</Text>
                ) : (
                  <>
                    <Text style={styles.capsuleCount}>{t(restam === 1 ? 'timeline.capsule.daysLeft_one' : 'timeline.capsule.daysLeft_other', { n: restam })}</Text>
                    <Text style={styles.capsuleSmall}>{t('timeline.capsule.opensOn', { date: fmt(c.unlockAt, t) })}</Text>
                  </>
                )}
                <TouchableOpacity style={styles.delBtn} onPress={() => handleDeleteCapsule(c.id)}>
                  <Text style={styles.delText}>{t('timeline.delete')}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        {/* Criar cápsula */}
        <Text style={styles.sectionTitle}>{t('timeline.createCapsule.section')}</Text>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>{t('timeline.createCapsule.msgLabel')}</Text>
            <TextInput
              style={styles.input}
              value={cMsg}
              onChangeText={setCMsg}
              placeholder={t('timeline.createCapsule.msgPlaceholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>{t('timeline.createCapsule.openAtLabel')}</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setDatePickerFor('capsule')}>
              <Text style={[styles.dateBtnText, !cDate && styles.dateBtnPlaceholder]}>
                {cDate ? fmt(cDate, t) : t('timeline.selectDate')}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.btn, (!cMsg.trim() || !cDate) && styles.btnDisabled]}
            onPress={handleAddCapsule}
            disabled={!cMsg.trim() || !cDate}
          >
            <Text style={styles.btnText}>{t('timeline.createCapsule.seal')}</Text>
          </TouchableOpacity>
          <Text style={styles.hint}>{t('timeline.createCapsule.hint')}</Text>
        </View>

        </FaixaCurva>

        <ColunaLeitura centralizado>
          <Text style={styles.disclaimer}>{t('timeline.disclaimer')}</Text>
        </ColunaLeitura>
      </ScrollView>

      <DatePickerModal
        visible={!!datePickerFor}
        title={datePickerFor === 'capsule' ? t('timeline.createCapsule.openAtLabel') : t('timeline.datePicker.memoryTitle')}
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
  // Sem padding lateral aqui: quem sangra de ponta a ponta e a FAIXA, e e ela
  // que devolve o gutter por dentro. O que fica fora de faixa (o cartao de
  // link e o disclaimer) traz o seu proprio.
  scrollContent: { paddingBottom: space.fimDaLista },

  faixa: { width: '100%' },
  faixaCorpo: { gap: space.bloco },

  linkCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: space.bloco, alignItems: 'center',
    marginHorizontal: space.tela, marginBottom: space.entre,
  },
  linkBadge: {
    ...type.etiqueta, color: colors.accent,
    backgroundColor: colors.accent + '22', borderRadius: 10,
    paddingHorizontal: space.dentro, paddingVertical: space.grudado,
  },
  linkText: { ...type.apoio, color: colors.textSecondary, marginTop: space.junto, textAlign: 'center' },

  // `secao` em cima: e o degrau entre SECOES da tela, que e exatamente o que
  // este titulo marca. Era um 20 solto.
  sectionTitle: { ...type.secao, color: colors.text, marginTop: space.junto },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: space.bloco },

  fileiraWrap: { marginBottom: space.bloco },

  emptyState: { alignItems: 'center', paddingVertical: space.dentro },
  emptyStateIcon: { fontSize: 32, marginBottom: space.junto },
  emptyStateTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  emptyStateDesc: { ...type.apoio, color: colors.textMuted, textAlign: 'center', marginTop: space.grudado },
  emptyStateBtn: { marginTop: space.bloco, paddingHorizontal: space.entre, alignSelf: 'center' },

  timeline: { marginTop: space.grudado },
  tlItem: { borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: space.dentro, paddingBottom: space.bloco },
  tlItemNew: { backgroundColor: colors.accent + '18', borderRadius: 10, paddingTop: space.junto, paddingRight: space.junto, marginLeft: -8, paddingLeft: space.entre },
  tlDate: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  tlTitle: { ...type.cartao, color: colors.text, marginTop: space.grudado },
  tlText: { ...type.apoio, color: colors.textSecondary, marginTop: space.grudado },

  delBtn: { marginTop: space.junto, alignSelf: 'flex-start' },
  delText: { ...type.apoio, color: colors.red, fontWeight: '600' },

  field: { marginBottom: space.bloco },
  label: { ...type.apoio, color: colors.textSecondary, fontWeight: '600', marginBottom: space.junto },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: space.bloco, paddingVertical: space.dentro,
    color: colors.text, ...type.corpoCurto,
  },
  dateBtn: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: space.bloco, paddingVertical: space.dentro,
  },
  dateBtnText: { ...type.corpoCurto, color: colors.text },
  dateBtnPlaceholder: { color: colors.textMuted },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: space.bloco, alignItems: 'center', marginTop: space.grudado },
  btnDisabled: { opacity: 0.5 },
  btnText: { ...type.botao, color: '#fff' },
  btnDoGate: { marginTop: space.entre },

  hint: { ...type.apoio, color: colors.textMuted, marginTop: space.dentro },

  capsuleCard: { alignItems: 'center', marginBottom: space.bloco },
  capsuleOpened: { borderColor: colors.gold },
  capsuleLock: { fontSize: 26 },
  capsuleTitle: { ...type.cartao, color: colors.text, marginTop: space.junto },
  capsuleMsg: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.junto },
  capsuleCount: { ...type.numero, color: colors.gold, marginTop: space.junto },
  capsuleSmall: { ...type.apoio, color: colors.textMuted, marginTop: space.grudado },

  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.entre },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao },
  emptyProfileTitle: { ...type.cartao, color: colors.text, textAlign: 'center', marginTop: space.bloco },
  emptyProfileDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.junto },
});
