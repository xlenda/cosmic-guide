// Agir — porta fiel de c:/tmp/gilfforever/web/app/(app)/agir/page.js: 5 seções
// independentes empilhadas numa única tela (como Timeline) — sortear ideia de
// encontro (com peso opcional pela linguagem do amor salva em Descobrir),
// desafio de 7 dias, gesto do dia (determinístico, sem persistência), meta da
// semana e sonhos do casal. Mesma chave e mesmo blob no AsyncStorage (ver
// lib/coupleData.js — saveAgirData espelha o merge parcial do persist()
// original). Cópia traduzida para PT-BR; checkbox HTML virou Switch nativo,
// onSubmit/preventDefault virou onPress.
import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import DailyMissionsCard from '../components/DailyMissionsCard';
// AS PECAS DE DIAGRAMACAO (design/PECAS-DE-DIAGRAMACAO.md, lote de acao
// 12/09/2026). Esta tela era o caso mais puro do diagnostico: CINCO assuntos
// independentes (ideia de encontro, desafio de 7 dias, gesto do dia, meta da
// semana, sonhos do casal) empilhados em cards identicos sobre o MESMO chao,
// separados so por um titulo de 16px em peso 800. O olho lia uma lista de
// quinze itens, nao cinco assuntos. As faixas dao o corte que o titulo nao
// dava; a coluna de leitura tira o paragrafo da borda.
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useDentroDeAba } from '../context/AbaContext';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { getAgirData, saveAgirData, getDescobrirData } from '../lib/coupleData';

const HEADER_GRADIENT = gradients.gold;

// lang: a qual linguagem do amor (de Descobrir) essa ideia mais fala — pra poder priorizar sem inventar nada novo.
// tag/text agora são chaves de tradução (t()); os ids seguem estáveis porque
// são o que o AsyncStorage guarda em favorites/done (ver lib/coupleData.js).
const DATE_IDEAS = [
  { id: 'i1', tag: 'agir.ideas.tag.casa', lang: 'tempo', text: 'agir.ideas.i1' },
  { id: 'i2', tag: 'agir.ideas.tag.casa', lang: 'servico', text: 'agir.ideas.i2' },
  { id: 'i3', tag: 'agir.ideas.tag.casa', lang: 'toque', text: 'agir.ideas.i3' },
  { id: 'i4', tag: 'agir.ideas.tag.casa', lang: 'toque', text: 'agir.ideas.i4' },
  { id: 'i5', tag: 'agir.ideas.tag.arLivre', lang: 'tempo', text: 'agir.ideas.i5' },
  { id: 'i6', tag: 'agir.ideas.tag.arLivre', lang: 'tempo', text: 'agir.ideas.i6' },
  { id: 'i7', tag: 'agir.ideas.tag.arLivre', lang: 'tempo', text: 'agir.ideas.i7' },
  { id: 'i8', tag: 'agir.ideas.tag.arLivre', lang: 'toque', text: 'agir.ideas.i8' },
  { id: 'i9', tag: 'agir.ideas.tag.economico', lang: 'servico', text: 'agir.ideas.i9' },
  { id: 'i10', tag: 'agir.ideas.tag.economico', lang: 'presentes', text: 'agir.ideas.i10' },
  { id: 'i11', tag: 'agir.ideas.tag.economico', lang: 'tempo', text: 'agir.ideas.i11' },
  { id: 'i12', tag: 'agir.ideas.tag.economico', lang: 'tempo', text: 'agir.ideas.i12' },
  { id: 'i13', tag: 'agir.ideas.tag.especial', lang: 'tempo', text: 'agir.ideas.i13' },
  { id: 'i14', tag: 'agir.ideas.tag.especial', lang: 'palavras', text: 'agir.ideas.i14' },
  { id: 'i15', tag: 'agir.ideas.tag.especial', lang: 'tempo', text: 'agir.ideas.i15' },
];

const LANG_LABELS_AGIR = {
  palavras: 'agir.lang.palavras',
  tempo: 'agir.lang.tempo',
  presentes: 'agir.lang.presentes',
  servico: 'agir.lang.servico',
  toque: 'agir.lang.toque',
};

const CHALLENGE = [
  { id: 'd1', text: 'agir.challenge.d1' },
  { id: 'd2', text: 'agir.challenge.d2' },
  { id: 'd3', text: 'agir.challenge.d3' },
  { id: 'd4', text: 'agir.challenge.d4' },
  { id: 'd5', text: 'agir.challenge.d5' },
  { id: 'd6', text: 'agir.challenge.d6' },
  { id: 'd7', text: 'agir.challenge.d7' },
];

const DAILY_GESTURES = [
  'agir.gesture.g1',
  'agir.gesture.g2',
  'agir.gesture.g3',
  'agir.gesture.g4',
  'agir.gesture.g5',
  'agir.gesture.g6',
  'agir.gesture.g7',
  'agir.gesture.g8',
  'agir.gesture.g9',
  'agir.gesture.g10',
];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function AgirScreen() {
  const navigation = useNavigation();
  // MISSÕES SÓ FORA DA ABA (10/09/2026). Este mesmo card já abre a Home; dentro
  // de "Nós Hoje" a pessoa via as três tarefas duas vezes na mesma sessão.
  // Antes do paywall desligar isso não acontecia, porque o solo nem chegava
  // aqui. Aberto por rota direta, o card continua onde sempre esteve.
  const dentroDeAba = useDentroDeAba();
  const { t } = useLanguage();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  // Refs pra levar a pessoa até o botão de sortear: o estado vazio das
  // favoritas fica embaixo, e só PEDIR "sorteiem uma ideia" não resolve —
  // o CTA sorteia na hora e rola a tela até o resultado (mesma tela, ação local).
  const scrollRef = useRef(null);
  const ideasSectionY = useRef(0);

  const [loaded, setLoaded] = useState(false);
  const [idea, setIdea] = useState(null);
  const [drawKey, setDrawKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [done, setDone] = useState([]);
  const [goal, setGoal] = useState('');
  const [goalSaved, setGoalSaved] = useState('');
  const [goalDone, setGoalDone] = useState(false);
  const [linguagem, setLinguagem] = useState(null);
  const [usarLinguagem, setUsarLinguagem] = useState(true);
  const [dreams, setDreams] = useState([]);
  const [dreamInput, setDreamInput] = useState('');

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const [d, descobrir] = await Promise.all([getAgirData(voce, amor), getDescobrirData(voce, amor)]);
    setFavorites(d.favorites || []);
    setDone(d.done || []);
    setGoalSaved(d.goalSaved || '');
    setGoal(d.goalSaved || '');
    setGoalDone(!!d.goalDone);
    setDreams(d.dreams || []);
    setLinguagem(descobrir.linguagem?.top || null);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // 1) Ideia de encontro
  function sortear() {
    let pool = DATE_IDEAS;
    if (usarLinguagem && linguagem) {
      const matching = DATE_IDEAS.filter((d) => d.lang === linguagem);
      if (matching.length > 0) pool = matching;
    }
    let i = Math.floor(Math.random() * pool.length);
    if (idea && pool.length > 1 && pool[i].id === idea.id) {
      i = (i + 1) % pool.length;
    }
    setIdea(pool[i]);
    setDrawKey((k) => k + 1);
  }

  // CTA do estado vazio das favoritas: sorteia e leva a pessoa até a ideia.
  function sortearEVer() {
    sortear();
    const y = Math.max(0, ideasSectionY.current - 12);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo?.({ y, animated: true });
    });
  }

  async function toggleFav(id) {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    await saveAgirData(voce, amor, { favorites: next });
  }

  const favList = DATE_IDEAS.filter((d) => favorites.includes(d.id));

  // 2) Desafio de 7 dias
  async function toggleDone(id) {
    const next = done.includes(id) ? done.filter((d) => d !== id) : [...done, id];
    setDone(next);
    await saveAgirData(voce, amor, { done: next });
  }
  const progress = Math.round((done.length / CHALLENGE.length) * 100);

  // 3) Gesto do dia (determinístico segundo a data)
  const iso = todayISO();
  const gesture = DAILY_GESTURES[hashStr(iso) % DAILY_GESTURES.length];

  // 4) Meta da semana
  async function handleSaveGoal() {
    const g = goal.trim();
    if (!g) return;
    setGoalSaved(g);
    setGoalDone(false);
    await saveAgirData(voce, amor, { goalSaved: g, goalDone: false });
  }
  async function markGoalDone() {
    setGoalDone(true);
    await saveAgirData(voce, amor, { goalDone: true });
  }
  async function clearGoal() {
    setGoalSaved('');
    setGoal('');
    setGoalDone(false);
    await saveAgirData(voce, amor, { goalSaved: '', goalDone: false });
  }

  // 5) Sonhos do casal (metas de longo prazo, persistentes)
  async function addDream() {
    const t = dreamInput.trim();
    if (!t) return;
    const next = [...dreams, { id: String(Date.now()), text: t, done: false, createdAt: todayISO() }];
    setDreams(next);
    await saveAgirData(voce, amor, { dreams: next });
    setDreamInput('');
  }
  async function toggleDream(id) {
    const next = dreams.map((d) => (d.id === id ? { ...d, done: !d.done } : d));
    setDreams(next);
    await saveAgirData(voce, amor, { dreams: next });
  }
  async function delDream(id) {
    const next = dreams.filter((d) => d.id !== id);
    setDreams(next);
    await saveAgirData(voce, amor, { dreams: next });
  }

  if (!voce || !amor) {
    // As missões diárias são PESSOAIS (não dependem do quiz do casal), então
    // o card aparece mesmo aqui — quem ainda não fez o quiz não fica sem a
    // parte de "fazer missão, acumular token".
    return (
      <View style={styles.root}>
        <GradientHeader title={t('home.card.agir.title')} subtitle={t('home.card.agir.subtitle')} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {!dentroDeAba && <DailyMissionsCard />}
          <View style={[styles.emptyProfile, { paddingVertical: space.ar }]}>
            <Ionicons name="heart-outline" size={40} color={colors.accent} />
            <Text style={styles.emptyProfileTitle}>{t('agir.empty.title')}</Text>
            <ColunaLeitura centralizado>
              <Text style={styles.emptyProfileDesc}>
                {t('agir.empty.desc')}
              </Text>
            </ColunaLeitura>
            <TouchableOpacity style={[styles.btn, { marginTop: space.junto }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
              <Text style={styles.btnText}>{t('agir.empty.cta')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <GradientHeader title={t('home.card.agir.title')} subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* 0) Missões de hoje — motor em lib/missions.js, card em
            components/DailyMissionsCard.js (pedido do dono: missões diárias
            que acumulam token, trocáveis por brindes na Loja). */}
        {!dentroDeAba && <DailyMissionsCard />}

        {/* FAIXA 1 — A IDEIA DE ENCONTRO. O chao neutro ('noite'): e a dobra
            de abertura, e a acao principal da tela mora nela (sortear). */}
        <FaixaCurva tom="noite" semente="encontro" style={styles.faixa} estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}>
        {/* 1) Ideia de encontro */}
        <Text
          style={styles.sectionTitle}
          onLayout={(e) => { ideasSectionY.current = e.nativeEvent.layout.y; }}
        >
          {t('agir.ideas.title')}
        </Text>
        <View style={styles.card}>
          <ColunaLeitura>
            <Text style={styles.mutedText}>{t('agir.ideas.subtitle')}</Text>
          </ColunaLeitura>
          {loaded && linguagem && (
            <View style={styles.switchRow}>
              <Switch
                value={usarLinguagem}
                onValueChange={setUsarLinguagem}
                trackColor={{ false: colors.border, true: colors.gold + '99' }}
                thumbColor={usarLinguagem ? colors.gold : colors.textMuted}
              />
              <Text style={styles.switchLabel}>
                {t('agir.ideas.prioritize', { lang: t(LANG_LABELS_AGIR[linguagem]) })}
              </Text>
            </View>
          )}
          <TouchableOpacity style={[styles.btn, { alignSelf: 'flex-start' }]} onPress={sortear}>
            <Text style={styles.btnText}>{t('agir.ideas.draw')}</Text>
          </TouchableOpacity>
        </View>

        {idea && (
          <View key={drawKey} style={[styles.card, styles.ideaCard]}>
            <Text style={styles.fractionBadge}>{t(idea.tag)}</Text>
            <ColunaLeitura centralizado>
              <Text style={styles.ideaText}>{t(idea.text)}</Text>
            </ColunaLeitura>
            <TouchableOpacity style={styles.favBtn} onPress={() => toggleFav(idea.id)}>
              <Text style={styles.favBtnText}>{favorites.includes(idea.id) ? t('agir.ideas.inFavs') : t('agir.ideas.addFav')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {loaded && (
          <View style={styles.card}>
            {favList.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>🤍</Text>
                <Text style={styles.emptyStateTitle}>{t('agir.ideas.emptyFavTitle')}</Text>
                <Text style={styles.emptyStateDesc}>{t('agir.ideas.emptyFavDesc')}</Text>
                <TouchableOpacity style={[styles.btn, { marginTop: space.junto }]} onPress={sortearEVer}>
                  <Text style={styles.btnText}>{t('agir.ideas.emptyFavCta')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.overline}>{t('agir.ideas.favCount', { count: favList.length })}</Text>
                <View style={{ marginTop: space.junto }}>
                  {favList.map((f) => (
                    <View key={f.id} style={styles.listItem}>
                      <TouchableOpacity onPress={() => toggleFav(f.id)}>
                        <Text style={styles.listItemIcon}>💛</Text>
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.listItemTag}>{t(f.tag)}</Text>
                        <Text style={styles.listItemText}>{t(f.text)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}

        </FaixaCurva>

        {/* FAIXA 2 — O QUE SE FAZ TODO DIA. `grude` porque encosta na de cima.
            Desafio de 7 dias e gesto do dia sao o MESMO assunto (o gesto
            pequeno, repetido) e por isso dividem uma faixa so em vez de
            virarem dois blocos soltos. */}
        <FaixaCurva tom="ameixa" semente="rotina" grude="noite" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
        {/* 2) Desafio de 7 dias */}
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionTitle}>{t('agir.challenge.title')}</Text>
          {loaded && <Text style={styles.sectionHeadAction}>{done.length}/{CHALLENGE.length}</Text>}
        </View>
        <View style={styles.card}>
          <ColunaLeitura>
            <Text style={styles.mutedText}>{t('agir.challenge.subtitle')}</Text>
          </ColunaLeitura>
          {loaded && (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          )}
          <View style={{ marginTop: space.junto }}>
            {CHALLENGE.map((c, idx) => {
              const isDone = done.includes(c.id);
              return (
                <TouchableOpacity key={c.id} style={[styles.opt, isDone && styles.optSel]} onPress={() => toggleDone(c.id)}>
                  <Text style={styles.optCheck}>{isDone ? '✅' : '⬜'}</Text>
                  <Text style={styles.optText}>
                    <Text style={styles.optDay}>{t('agir.challenge.day', { n: idx + 1 })}</Text>
                    {t(c.text)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {loaded && progress === 100 && (
            <Text style={styles.completeText}>{t('agir.challenge.complete', { voce, amor })}</Text>
          )}
        </View>

        {/* 3) Gesto do dia */}
        <Text style={styles.sectionTitle}>{t('agir.gesture.title')}</Text>
        <View style={[styles.card, { alignItems: 'center' }]}>
          <ColunaLeitura centralizado>
            <Text style={styles.mutedText}>{t('agir.gesture.subtitle')}</Text>
          </ColunaLeitura>
          <View style={styles.gestureBox}>
            <Text style={styles.gestureEmoji}>💛</Text>
            <ColunaLeitura centralizado>
              <Text style={styles.gestureText}>{t(gesture)}</Text>
            </ColunaLeitura>
          </View>
        </View>

        </FaixaCurva>

        {/* FAIXA 3 — O QUE VOCES QUEREM. Meta da semana e sonhos do casal sao
            o mesmo assunto em dois prazos.
            ROSA, E NAO VIOLETA — MEDIDO NA FOTO (390x844, 12/09/2026). Com
            'violeta' o pixel desta faixa deu rgb(75,51,102): contraste 1,865
            contra o fundo, praticamente o teto de 1,869 que o lote da Home
            registrou como "lavando a tela em faixa longa" — e esta faixa E
            longa (meta + sonhos + a lista inteira). O 'rosa' resolve em
            rgb(64,30,53):
              contra o fundo   1,865 -> 1,381  (o mesmo patamar do 'noite'
                                                calibrado, 1,399)
              contra a ameixa  dE 31,1 -> 16,9 (continua sendo outro assunto,
                                                sem gritar)
            Fica na mesma familia cromatica da ameixa (339 graus contra 320),
            que e o que faz a tela parecer o mesmo app. */}
        <FaixaCurva tom="rosa" semente="planos" grude="ameixa" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
        {/* 4) Meta da semana */}
        <Text style={styles.sectionTitle}>{t('agir.goal.title')}</Text>
        <View style={styles.card}>
          <ColunaLeitura>
            <Text style={styles.mutedText}>{t('agir.goal.subtitle')}</Text>
          </ColunaLeitura>
          <View style={styles.field}>
            <Text style={styles.label}>{t('agir.goal.label')}</Text>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              placeholder={t('agir.goal.placeholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
          <TouchableOpacity style={[styles.btn, { alignSelf: 'flex-start' }]} onPress={handleSaveGoal}>
            <Text style={styles.btnText}>{t('agir.goal.save')}</Text>
          </TouchableOpacity>

          {loaded && goalSaved && (
            <View style={styles.goalCard}>
              <Text style={[styles.goalText, goalDone && styles.goalTextDone]}>
                {goalDone ? '✅ ' : '🎯 '}{goalSaved}
              </Text>
              <View style={styles.goalActions}>
                {!goalDone && (
                  <TouchableOpacity style={styles.btn} onPress={markGoalDone}>
                    <Text style={styles.btnText}>{t('agir.markDone')}</Text>
                  </TouchableOpacity>
                )}
                {goalDone && <Text style={styles.completeTextInline}>{t('agir.done')}</Text>}
                <TouchableOpacity onPress={clearGoal}>
                  <Text style={styles.delText}>{t('agir.swapGoal')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 5) Sonhos do casal */}
        <View style={styles.sectionHeadRow}>
          <Text style={styles.sectionTitle}>{t('agir.dreams')}</Text>
          {loaded && dreams.length > 0 && (
            <Text style={styles.sectionHeadAction}>{dreams.filter((d) => d.done).length}/{dreams.length}</Text>
          )}
        </View>
        <View style={styles.card}>
          <ColunaLeitura>
            <Text style={styles.mutedText}>{t('agir.dreamsDesc')}</Text>
          </ColunaLeitura>

          <View style={styles.dreamInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={dreamInput}
              onChangeText={setDreamInput}
              placeholder="Ex.: Economizar para nossa primeira viagem juntos"
              placeholderTextColor={colors.textMuted}
              onSubmitEditing={addDream}
            />
            <TouchableOpacity style={styles.btn} onPress={addDream}>
              <Text style={styles.btnText}>{t('agir.add')}</Text>
            </TouchableOpacity>
          </View>

          {loaded && dreams.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌠</Text>
              <Text style={styles.emptyStateTitle}>{t('agir.empty.title')}</Text>
              <Text style={styles.emptyStateDesc}>{t('agir.empty.desc')}</Text>
            </View>
          )}

          {loaded && dreams.length > 0 && (
            <View style={{ marginTop: space.junto }}>
              {dreams.map((d) => (
                <View key={d.id} style={styles.listItem}>
                  <TouchableOpacity onPress={() => toggleDream(d.id)}>
                    <Text style={styles.listItemIcon}>{d.done ? '✅' : '⬜'}</Text>
                  </TouchableOpacity>
                  <Text style={[styles.listItemText, { flex: 1 }, d.done && styles.listItemTextDone]}>{d.text}</Text>
                  <TouchableOpacity onPress={() => delDream(d.id)}>
                    <Text style={styles.delText}>{t('agir.remove')}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        </FaixaCurva>

        <Text style={styles.disclaimer}>
          As ideias, desafios e metas de vocês ficam salvos apenas neste aparelho.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // O padding horizontal sai da escala. O gap do container NAO existe: com gap
  // no contentContainer aparece uma tira preta entre uma faixa e a seguinte,
  // porque o gap do pai e aplicado DEPOIS do marginTop:-1 do `grude` e vence
  // (medido no lote das praticas). Quem da respiro agora e a propria faixa.
  scrollContent: { padding: space.tela, paddingBottom: space.fimDaLista },

  // A faixa SANGRA pra fora do padding do scroll: faixa que nao sangra e
  // cartao com onda em cima. O corpo dela respira nas laterais de volta.
  faixa: { marginHorizontal: -space.tela },
  faixaCorpo: { paddingHorizontal: space.tela, gap: space.bloco },
  // A PRIMEIRA FAIXA NAO LEVA O paddingTop DA PECA: a caixa da onda ja tem
  // ONDA_ALTURA e, logo abaixo do cabecalho (que traz folga propria), somar o
  // space.secao padrao abre um chao liso grande demais antes da primeira
  // palavra — a faixa lendo como bloco de cor em vez de secao.
  faixaCorpoPrimeira: { paddingTop: 0 },

  // O titulo de secao era fontSize 16 / peso '800' — o negrito que o
  // diagnostico chamou de "grita em vez de convidar". Agora e hierarquia de
  // verdade (type.secao) e quem separa e o espaco, nao o peso.
  sectionTitle: { ...type.secao, color: colors.text, marginBottom: space.dentro },
  sectionHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionHeadAction: { ...type.apoio, color: colors.accent },
  overline: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  mutedText: { ...type.corpoCurto, color: colors.textSecondary },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: space.bloco, gap: space.dentro },

  switchRow: { flexDirection: 'row', alignItems: 'center', gap: space.junto },
  switchLabel: { flex: 1, ...type.apoio, color: colors.textSecondary },

  ideaCard: { alignItems: 'center' },
  fractionBadge: {
    ...type.nota, color: colors.accent,
    backgroundColor: colors.accent + '22', borderRadius: 10,
    paddingHorizontal: space.dentro, paddingVertical: space.grudado,
  },
  ideaText: { ...type.corpo, color: colors.text, textAlign: 'center' },
  favBtn: { paddingVertical: space.junto, paddingHorizontal: space.bloco, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  favBtnText: { ...type.botao, color: colors.text },

  // ESTADO VAZIO. O respiro vertical e generoso de proposito: dentro de uma
  // faixa, um vazio apertado faz o chao de cor parecer bloco sem conteudo —
  // o defeito ALTO que o revisor achou na Home.
  emptyState: { alignItems: 'center', paddingVertical: space.bloco, gap: space.junto },
  emptyStateIcon: { fontSize: 32 },
  emptyStateTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  emptyStateDesc: { ...type.apoio, color: colors.textMuted, textAlign: 'center' },

  listItem: { flexDirection: 'row', alignItems: 'center', gap: space.dentro, paddingVertical: space.junto },
  listItemIcon: { fontSize: 18 },
  listItemTag: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  listItemText: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.grudado },
  listItemTextDone: { textDecorationLine: 'line-through', opacity: 0.7 },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  opt: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space.dentro,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: space.dentro, marginBottom: space.junto,
  },
  optSel: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  optCheck: { fontSize: 16, lineHeight: 20 },
  optText: { flex: 1, ...type.corpoCurto, color: colors.textSecondary },
  // O dia continua marcado — pela COR, nao por mais um peso 800 no meio de
  // um texto que ja e todo peso normal.
  optDay: { color: colors.gold },
  completeText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  completeTextInline: { ...type.apoio, color: colors.textSecondary },

  gestureBox: {
    padding: space.bloco, borderRadius: 12, alignItems: 'center', width: '100%', gap: space.junto,
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.gold + '40',
  },
  gestureEmoji: { fontSize: 26 },
  gestureText: { ...type.corpo, color: colors.text, textAlign: 'center' },

  field: { gap: space.junto },
  label: { ...type.apoio, color: colors.textSecondary },
  input: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingHorizontal: space.bloco, paddingVertical: space.dentro,
    ...type.corpoCurto, color: colors.text,
  },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: space.dentro, paddingHorizontal: space.entre, alignItems: 'center' },
  btnText: { ...type.botao, color: '#fff' },

  goalCard: { padding: space.bloco, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, gap: space.dentro },
  goalText: { ...type.corpoCurto, color: colors.text },
  goalTextDone: { textDecorationLine: 'line-through', opacity: 0.7 },
  goalActions: { flexDirection: 'row', alignItems: 'center', gap: space.bloco, flexWrap: 'wrap' },
  delText: { ...type.apoio, color: colors.red },

  dreamInputRow: { flexDirection: 'row', gap: space.junto, alignItems: 'center' },

  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.entre, paddingHorizontal: space.junto },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao, gap: space.dentro },
  emptyProfileTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  emptyProfileDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
});
