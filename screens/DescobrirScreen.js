// Descobrir — porta fiel de c:/tmp/gilfforever/web/app/(app)/descobrir/page.js:
// 3 abas independentes (Linguagem do amor, Estilo de apego, Conflitos) atrás de
// um controle segmentado com glifo de "concluído" por prova. As duas primeiras
// abas rodam o mesmo motor de quiz (stepper linear + tela de resultado com
// contagem animada); a terceira são 2 perguntas de botão, sem stepper, salvas
// imediatamente a cada escolha — sem etapa de "calcular resultado". Mesma chave
// e mesmo blob no AsyncStorage (ver lib/coupleData.js), cópia traduzida para
// PT-BR. As barras de balanço do resultado reaproveitam o componente ScoreBar
// já usado em Horóscopo/Compatibilidade.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';
// AS PECAS DE DIAGRAMACAO (design/PECAS-DE-DIAGRAMACAO.md, lote de acao
// 12/09/2026). Tres quizzes atras de um controle segmentado, todos correndo
// sobre o mesmo chao: a intro, as abas e o quiz liam como um bloco continuo.
// A faixa separa "onde voce escolhe" de "onde voce responde" sem precisar de
// mais um titulo; a coluna tira a intro da borda.
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { getDescobrirData, saveDescobrirResult } from '../lib/coupleData';

const HEADER_GRADIENT = ['#6C7BFF', '#B57BFF'];

const BAR_GRADIENTS = [
  ['#FF6BA0', '#FF8C5C'],
  ['#5CA8FF', '#6C7BFF'],
  ['#5FD98C', '#5CE0D8'],
  ['#FFB84D', '#FFC85C'],
  ['#B57BFF', '#FF7BD5'],
];

/* ---------------- Quiz 1: Linguagem do amor ----------------
   Textos exibidos viram chaves de tradução (t()) — os ids (k/order) seguem
   estáveis porque são o que o AsyncStorage guarda (ver lib/coupleData.js). */
const LANG_ORDER = ['palavras', 'tempo', 'presentes', 'servico', 'toque'];

const LANG_LABELS = {
  palavras: 'descobrir.lang.label.palavras',
  tempo: 'descobrir.lang.label.tempo',
  presentes: 'descobrir.lang.label.presentes',
  servico: 'descobrir.lang.label.servico',
  toque: 'descobrir.lang.label.toque',
};

const LANG_QUESTIONS = [1, 2, 3, 4, 5, 6].map((n) => ({
  q: `descobrir.lang.q${n}`,
  opts: LANG_ORDER.map((k) => ({ t: `descobrir.lang.q${n}.opt.${k}`, k })),
}));

const LANG_RESULTS = {
  palavras: { emoji: '💬', texto: 'descobrir.lang.result.palavras.texto', dica: 'descobrir.lang.result.palavras.dica' },
  tempo: { emoji: '⏳', texto: 'descobrir.lang.result.tempo.texto', dica: 'descobrir.lang.result.tempo.dica' },
  presentes: { emoji: '🎁', texto: 'descobrir.lang.result.presentes.texto', dica: 'descobrir.lang.result.presentes.dica' },
  servico: { emoji: '🤝', texto: 'descobrir.lang.result.servico.texto', dica: 'descobrir.lang.result.servico.dica' },
  toque: { emoji: '🤍', texto: 'descobrir.lang.result.toque.texto', dica: 'descobrir.lang.result.toque.dica' },
};

/* ---------------- Quiz 2: Estilo de apego ---------------- */
const ATT_ORDER = ['seguro', 'ansioso', 'evitativo'];

const ATT_LABELS = {
  seguro: 'descobrir.att.label.seguro',
  ansioso: 'descobrir.att.label.ansioso',
  evitativo: 'descobrir.att.label.evitativo',
};

const ATT_QUESTIONS = [1, 2, 3, 4, 5].map((n) => ({
  q: `descobrir.att.q${n}`,
  opts: ATT_ORDER.map((k) => ({ t: `descobrir.att.q${n}.opt.${k}`, k })),
}));

const ATT_RESULTS = {
  seguro: { emoji: '🌿', texto: 'descobrir.att.result.seguro.texto', dica: 'descobrir.att.result.seguro.dica' },
  ansioso: { emoji: '🌊', texto: 'descobrir.att.result.ansioso.texto', dica: 'descobrir.att.result.ansioso.dica' },
  evitativo: { emoji: '🏔️', texto: 'descobrir.att.result.evitativo.texto', dica: 'descobrir.att.result.evitativo.dica' },
};

/* ---------------- Motor de quiz ---------------- */
function computeTop(answers, order) {
  const counts = {};
  order.forEach((k) => (counts[k] = 0));
  answers.forEach((k) => {
    if (k) counts[k] = (counts[k] || 0) + 1;
  });
  let top = order[0];
  order.forEach((k) => {
    if (counts[k] > counts[top]) top = k;
  });
  return { top, counts };
}

function Quiz({ questions, order, labels, results, resultBadge, saved, onSave }) {
  const { t } = useLanguage();
  const [answers, setAnswers] = useState([]);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(saved || null);
  const [tick, setTick] = useState(0);

  const total = questions.length;

  // Animação de contagem: quando aparece um resultado, os números do balanço sobem aos poucos.
  useEffect(() => {
    if (!result) {
      setTick(0);
      return;
    }
    const maxNeeded = Math.max(0, ...order.map((k) => result.counts[k] || 0));
    if (maxNeeded === 0) {
      setTick(0);
      return;
    }
    setTick(0);
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setTick(current);
      if (current >= maxNeeded) clearInterval(id);
    }, 110);
    return () => clearInterval(id);
  }, [result]);

  function choose(k) {
    const next = [...answers];
    next[step] = k;
    setAnswers(next);
  }

  function next() {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      const res = computeTop(answers, order);
      setResult(res);
      onSave(res);
    }
  }

  function redo() {
    setAnswers([]);
    setStep(0);
    setResult(null);
  }

  if (result) {
    const r = results[result.top];
    return (
      <View style={styles.card}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.overline}>{resultBadge}</Text>
          <Text style={styles.resultEmoji}>{r.emoji}</Text>
          <Text style={styles.resultTitle}>{t(labels[result.top])}</Text>
        </View>
        <ColunaLeitura>
          <Text style={styles.mutedText}>{t(r.texto)}</Text>
        </ColunaLeitura>
        <View style={styles.tipCard}>
          <Text style={styles.overline}>{t('descobrir.quiz.dica')}</Text>
          <ColunaLeitura>
            <Text style={styles.mutedText}>{t(r.dica)}</Text>
          </ColunaLeitura>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: space.bloco }]}>{t('descobrir.quiz.balance')}</Text>
        {order.map((k, i) => {
          const shown = Math.min(tick, result.counts[k] || 0);
          const pct = total ? Math.round((shown / total) * 100) : 0;
          return (
            <ScoreBar key={k} label={t(labels[k])} value={pct} gradient={BAR_GRADIENTS[i % BAR_GRADIENTS.length]} />
          );
        })}

        <View style={{ alignItems: 'center', marginTop: space.junto }}>
          <TouchableOpacity style={styles.btnGhost} onPress={redo}>
            <Text style={styles.btnGhostText}>{t('descobrir.quiz.redo')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const current = questions[step];
  const chosen = answers[step];
  const pct = Math.round(((step + (chosen ? 1 : 0)) / total) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{t('descobrir.quiz.progress', { step: step + 1, total })}</Text>
      <Text style={styles.sectionTitle}>{t(current.q)}</Text>

      <View>
        {current.opts.map((o, i) => {
          const sel = chosen === o.k;
          return (
            <TouchableOpacity key={i} style={[styles.opt, sel && styles.optSel]} onPress={() => choose(o.k)} activeOpacity={0.85}>
              <Text style={[styles.optText, sel && styles.optTextSel]}>{sel ? '✓ ' : ''}{t(o.t)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.btnGhost, step === 0 && styles.btnDisabled]} onPress={() => setStep(step - 1)} disabled={step === 0}>
          <Text style={styles.btnGhostText}>{t('descobrir.quiz.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, !chosen && styles.btnDisabled]} onPress={next} disabled={!chosen}>
          <Text style={styles.btnText}>{step < total - 1 ? t('descobrir.quiz.next') : t('descobrir.quiz.seeResult')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- Como enfrentam os conflitos (2 perguntas simples, sem motor de quiz) ---------------- */
const DESAFIOS_CONFLITO = [
  'descobrir.conf.desafio.comunicacao',
  'descobrir.conf.desafio.rotina',
  'descobrir.conf.desafio.confianca',
  'descobrir.conf.desafio.redescobrir',
];

function Conflitos({ voce, amor, saved, onSave }) {
  const { t } = useLanguage();
  const [conflicto, setConflicto] = useState(saved?.conflicto || '');
  const [desafio, setDesafio] = useState(saved?.desafio || '');

  function elegirConflicto(op) {
    setConflicto(op);
    onSave({ conflicto: op, desafio });
  }
  function elegirDesafio(op) {
    setDesafio(op);
    onSave({ conflicto, desafio: op });
  }

  const completo = Boolean(conflicto && desafio);

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{t('descobrir.conf.q1', { voce, amor })}</Text>
      <View style={styles.optGrid}>
        {[voce, amor, t('descobrir.conf.both'), t('descobrir.conf.none')].map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.optHalf, conflicto === op && styles.optSel]}
            onPress={() => elegirConflicto(op)}
          >
            <Text style={[styles.optText, { textAlign: 'center' }, conflicto === op && styles.optTextSel]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: space.entre }]}>{t('descobrir.conf.q2')}</Text>
      <View style={styles.optGrid}>
        {DESAFIOS_CONFLITO.map((opKey) => {
          const op = t(opKey);
          return (
            <TouchableOpacity
              key={opKey}
              style={[styles.optHalf, desafio === op && styles.optSel]}
              onPress={() => elegirDesafio(op)}
            >
              <Text style={[styles.optText, { textAlign: 'center' }, desafio === op && styles.optTextSel]}>{op}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {completo && (
        <>
          <View style={[styles.statRow, { marginTop: space.bloco, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.bloco }]}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{conflicto}</Text>
              <Text style={styles.statLabel}>{t('descobrir.conf.statFirstStep')}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{desafio}</Text>
              <Text style={styles.statLabel}>{t('descobrir.conf.statChallenge')}</Text>
            </View>
          </View>
          <Text style={styles.disclaimer}>{t('descobrir.conf.saved')}</Text>
        </>
      )}
    </View>
  );
}

/* ---------------- Tela ---------------- */
const QUIZ_TABS = [
  { id: 'linguagem', labelKey: 'descobrir.tab.linguagem', icon: '💬' },
  { id: 'apego', labelKey: 'descobrir.tab.apego', icon: '🧭' },
  { id: 'conflitos', labelKey: 'descobrir.tab.conflitos', icon: '🤝' },
];

export default function DescobrirScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [loaded, setLoaded] = useState(false);
  const [tab, setTab] = useState('linguagem');
  const [data, setData] = useState({ linguagem: null, apego: null, conflictos: null });

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const d = await getDescobrirData(voce, amor);
    setData(d);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function saveQuiz(id, res) {
    const next = await saveDescobrirResult(voce, amor, id, res);
    setData(next);
  }

  function isTabDone(id) {
    if (id === 'conflitos') return Boolean(data.conflictos?.conflicto && data.conflictos?.desafio);
    return Boolean(data[id]);
  }

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title={t('home.card.descobrir.title')} subtitle={t('home.card.descobrir.subtitle')} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>{t('descobrir.empty.title')}</Text>
          <ColunaLeitura centralizado>
            <Text style={styles.emptyProfileDesc}>
              {t('descobrir.empty.desc')}
            </Text>
          </ColunaLeitura>
          <TouchableOpacity style={[styles.btn, { marginTop: space.junto }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>{t('descobrir.empty.cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={t('home.card.descobrir.title')} subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FAIXA 1 — A ESCOLHA. Intro e o seletor de quiz sao o mesmo
            assunto: "o que voces vao descobrir agora". Chao neutro
            ('noite'), que e o degrau que separa sem colorir. */}
        <FaixaCurva tom="noite" semente="escolha" style={styles.faixa} estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}>
        <ColunaLeitura centralizado>
          <Text style={[styles.mutedText, { textAlign: 'center' }]}>
            {t('descobrir.intro', { voce, amor })}
          </Text>
        </ColunaLeitura>

        <View style={styles.tabsCard}>
          <View style={{ flexDirection: 'row', gap: space.junto }}>
            {QUIZ_TABS.map((tabDef) => {
              const active = tab === tabDef.id;
              const done = isTabDone(tabDef.id);
              return (
                <TouchableOpacity
                  key={tabDef.id}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setTab(tabDef.id)}
                >
                  <Text style={styles.tabIcon}>{done ? '✓' : tabDef.icon}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t(tabDef.labelKey)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        </FaixaCurva>

        {/* FAIXA 2 — A RESPOSTA. Aqui mora o quiz inteiro (pergunta, opcoes,
            resultado). `grude` porque encosta na de cima. A faixa e `rasa`
            enquanto carrega: com so um spinner dentro, a caixa cheia da onda
            seria mais chao de cor do que conteudo — que e exatamente o
            defeito de "faixa virando bloco de cor sem conteudo". */}
        <FaixaCurva tom="ameixa" semente="quiz" grude="noite" rasa={!loaded} style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
        {!loaded ? (
          <ActivityIndicator color={colors.accent} />
        ) : tab === 'linguagem' ? (
          <Quiz
            questions={LANG_QUESTIONS}
            order={LANG_ORDER}
            labels={LANG_LABELS}
            results={LANG_RESULTS}
            resultBadge={t('descobrir.lang.badge', { name: voce })}
            saved={data.linguagem}
            onSave={(res) => saveQuiz('linguagem', res)}
          />
        ) : tab === 'apego' ? (
          <Quiz
            questions={ATT_QUESTIONS}
            order={ATT_ORDER}
            labels={ATT_LABELS}
            results={ATT_RESULTS}
            resultBadge={t('descobrir.att.badge', { name: voce })}
            saved={data.apego}
            onSave={(res) => saveQuiz('apego', res)}
          />
        ) : (
          <Conflitos voce={voce} amor={amor} saved={data.conflictos} onSave={(res) => saveQuiz('conflictos', res)} />
        )}

        </FaixaCurva>

        <Text style={styles.disclaimer}>
          {t('descobrir.disclaimer')}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // Sem gap no contentContainer: gap do pai vence o marginTop:-1 do `grude` e
  // abre uma tira preta entre duas faixas — a onda passa a flutuar no vazio em
  // vez de cortar o chao anterior. Quem da respiro e a propria faixa.
  scrollContent: { padding: space.tela, paddingBottom: space.fimDaLista },

  // A faixa sangra pra fora do padding; o corpo dela devolve o respiro lateral.
  faixa: { marginHorizontal: -space.tela },
  faixaCorpo: { paddingHorizontal: space.tela, gap: space.bloco },
  // A primeira faixa nao leva o paddingTop da peca: a caixa da onda ja abre
  // ONDA_ALTURA logo abaixo de um cabecalho que ja tem folga propria.
  faixaCorpoPrimeira: { paddingTop: 0 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: space.bloco, gap: space.dentro },
  tipCard: {
    backgroundColor: colors.gold + '14', borderWidth: 1, borderColor: colors.gold + '55',
    borderRadius: 14, padding: space.bloco, gap: space.junto,
  },

  tabsCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: space.junto },
  tabBtn: { flex: 1, alignItems: 'center', gap: space.grudado, paddingVertical: space.dentro, paddingHorizontal: space.grudado, borderRadius: 14, borderWidth: 1, borderColor: 'transparent' },
  tabBtnActive: { borderColor: colors.gold + '80', backgroundColor: colors.gold + '18' },
  tabIcon: { fontSize: 18 },
  tabLabel: { ...type.nota, color: colors.textSecondary, textAlign: 'center' },
  // A aba ativa se marca pela COR e pela borda, nao por mais um peso 800.
  tabLabelActive: { color: colors.gold },

  // Era fontSize 16 / peso '800' em tudo — a pergunta do quiz, o titulo do
  // balanco e o titulo de conflitos no mesmo grito. Agora e hierarquia.
  sectionTitle: { ...type.secao, color: colors.text },
  overline: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  mutedText: { ...type.corpoCurto, color: colors.textSecondary },
  progressLabel: { ...type.apoio, color: colors.textSecondary },
  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.entre },

  resultEmoji: { fontSize: 40, marginVertical: space.junto },
  resultTitle: { ...type.titulo, color: colors.text },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  opt: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: space.bloco, marginBottom: space.junto,
  },
  optSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  optText: { ...type.corpoCurto, color: colors.textSecondary },
  // A escolha ja se marca pelo ✓, pela borda e pelo fundo — a cor do texto
  // fecha a conta sem repor peso.
  optTextSel: { color: colors.text },

  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto },
  optHalf: {
    width: '48%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: space.dentro, paddingHorizontal: space.junto,
  },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.junto },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: space.dentro, paddingHorizontal: space.entre, alignItems: 'center' },
  btnText: { ...type.botao, color: '#fff' },
  btnGhost: { borderRadius: 14, paddingVertical: space.dentro, paddingHorizontal: space.bloco, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { ...type.botao, color: colors.textSecondary },
  btnDisabled: { opacity: 0.5 },

  statRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' },
  // Alinhadas pelo TOPO, como a fileira de tres: com 'center', um rotulo de
  // duas linhas desalinha os dois valores entre si.
  stat: { flex: 1, alignItems: 'center', gap: space.grudado },
  statValue: { ...type.cartao, color: colors.text, textAlign: 'center' },
  statLabel: { ...type.apoio, color: colors.textMuted, textAlign: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: space.junto },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao, gap: space.dentro },
  emptyProfileTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  emptyProfileDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
});
