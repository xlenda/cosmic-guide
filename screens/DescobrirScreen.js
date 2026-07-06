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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';
import { useCouple } from '../context/CoupleContext';
import { getDescobrirData, saveDescobrirResult } from '../lib/coupleData';

const HEADER_GRADIENT = ['#6C7BFF', '#B57BFF'];

const BAR_GRADIENTS = [
  ['#FF6BA0', '#FF8C5C'],
  ['#5CA8FF', '#6C7BFF'],
  ['#5FD98C', '#5CE0D8'],
  ['#FFB84D', '#FFC85C'],
  ['#B57BFF', '#FF7BD5'],
];

/* ---------------- Quiz 1: Linguagem do amor ---------------- */
const LANG_ORDER = ['palavras', 'tempo', 'presentes', 'servico', 'toque'];

const LANG_LABELS = {
  palavras: 'Palavras de afirmação',
  tempo: 'Tempo de qualidade',
  presentes: 'Presentes',
  servico: 'Atos de serviço',
  toque: 'Toque físico',
};

const LANG_QUESTIONS = [
  {
    q: 'O que mais faz você se sentir amado(a) no dia a dia?',
    opts: [
      { t: 'Ouvir um elogio sincero ou um "obrigado" de verdade', k: 'palavras' },
      { t: 'Passar um tempo que seja só nosso, sem pressa e sem celular', k: 'tempo' },
      { t: 'Receber um detalhe que mostre que pensaram em mim', k: 'presentes' },
      { t: 'Que alguém resolva algo por mim antes mesmo de eu pedir', k: 'servico' },
      { t: 'Um abraço forte ou estar de mãos dadas', k: 'toque' },
    ],
  },
  {
    q: 'Depois de um dia difícil, o que mais te reconforta?',
    opts: [
      { t: 'Ouvir "estou com você, vai ficar tudo bem"', k: 'palavras' },
      { t: 'Sentar juntos e conversar com calma sobre tudo', k: 'tempo' },
      { t: 'Chegar em casa e encontrar um detalhe me esperando', k: 'presentes' },
      { t: 'Que alguém tenha cuidado de uma tarefa que era minha', k: 'servico' },
      { t: 'Um abraço longo, um carinho na cabeça, me sentir aconchegado(a)', k: 'toque' },
    ],
  },
  {
    q: 'Como você costuma demonstrar carinho a quem ama?',
    opts: [
      { t: 'Dizendo com todas as letras o quanto admiro essa pessoa', k: 'palavras' },
      { t: 'Reservando um tempo só para ficarmos juntos', k: 'tempo' },
      { t: 'Escolhendo presentes com significado', k: 'presentes' },
      { t: 'Fazendo coisas práticas que facilitam a vida dele(a)', k: 'servico' },
      { t: 'Com abraços, beijos e proximidade', k: 'toque' },
    ],
  },
  {
    q: 'Como seria o seu fim de semana ideal a dois?',
    opts: [
      { t: 'Compartilhando muitas boas conversas e palavras carinhosas', k: 'palavras' },
      { t: 'Um plano tranquilo, com atenção total um no outro', k: 'tempo' },
      { t: 'Uma pequena surpresa ou uma trocinha simples de presentes', k: 'presentes' },
      { t: 'Resolver a casa juntos e depois relaxar sem preocupações', k: 'servico' },
      { t: 'Muito mimo, desde o café da manhã na cama até um filme abraçados', k: 'toque' },
    ],
  },
  {
    q: 'Quando estão longe, do que mais sente falta?',
    opts: [
      { t: 'Das mensagens carinhosas e do "bom dia, meu amor"', k: 'palavras' },
      { t: 'Das nossas conversas sem hora para acabar', k: 'tempo' },
      { t: 'De receber (e mandar) aquele detalhe à distância', k: 'presentes' },
      { t: 'De ter alguém com quem dividir as tarefas do dia', k: 'servico' },
      { t: 'Do abraço e de simplesmente estar pertinho', k: 'toque' },
    ],
  },
  {
    q: 'Qual gesto do seu amor te toca mais fundo?',
    opts: [
      { t: 'Quando ele(a) nota algo em mim e diz em voz alta', k: 'palavras' },
      { t: 'Quando ele(a) larga tudo só para me dar atenção', k: 'tempo' },
      { t: 'Quando ele(a) guarda um detalhe e transforma em presente', k: 'presentes' },
      { t: 'Quando ele(a) age para aliviar um peso meu sem que eu peça', k: 'servico' },
      { t: 'Quando ele(a) me puxa para perto num momento inesperado', k: 'toque' },
    ],
  },
];

const LANG_RESULTS = {
  palavras: {
    emoji: '💬',
    texto:
      'Você floresce quando o amor vira palavra: um elogio sincero, um "tenho orgulho de você", um bilhete inesperado. Ouvir em voz alta que você é amado(a) te dá segurança e aquece o seu dia. O reconhecimento, para você, é uma forma concreta de cuidado.',
    dica:
      'Dica para vocês: combinem dizer, todas as noites, algo que admiraram um no outro naquele dia — também vale por mensagem.',
  },
  tempo: {
    emoji: '⏳',
    texto:
      'O que mais te preenche é a atenção de verdade: estar juntos, sem pressa e sem distrações. Um tempo que seja só de vocês vale mais que qualquer coisa material. A presença, para você, é a maior prova de amor.',
    dica:
      'Dica para vocês: reservem um momento fixo na semana sem telas — mesmo que sejam só 20 minutos para conversar se olhando nos olhos.',
  },
  presentes: {
    emoji: '🎁',
    texto:
      'Para você, um presente não é sobre o preço — é sobre a intenção por trás dele. Um detalhe simples mostra que alguém pensou em você mesmo à distância. Esses gestos viram símbolos de carinho que você carrega consigo.',
    dica:
      'Dica para vocês: mantenham uma "listinha de detalhes" um do outro (gostos, sonhos, desejos) para acertar em cheio nas próximas surpresas.',
  },
  servico: {
    emoji: '🤝',
    texto:
      'Você sente o amor quando ele vira ação: alguém que resolve, ajuda e tira um peso das suas costas. As atitudes práticas, para você, falam mais alto que as promessas. Cuidar do dia a dia juntos é sua forma favorita de amar e ser amado(a).',
    dica:
      'Dica para vocês: perguntem-se "o que posso tirar das suas costas hoje?" — e deixem o outro sentir que não está sozinho.',
  },
  toque: {
    emoji: '🤍',
    texto:
      'Para você, a conexão passa muito pelo corpo: um abraço, a mão dada, o mimo que acalma. O contato carinhoso te faz sentir seguro(a) e presente no vínculo. É por aí que o carinho chega mais fundo.',
    dica:
      'Dica para vocês: criem pequenos rituais de contato — um abraço de 20 segundos ao se reencontrarem já muda o clima do dia.',
  },
};

/* ---------------- Quiz 2: Estilo de apego ---------------- */
const ATT_ORDER = ['seguro', 'ansioso', 'evitativo'];

const ATT_LABELS = {
  seguro: 'Estilo seguro',
  ansioso: 'Estilo ansioso',
  evitativo: 'Estilo evitativo',
};

const ATT_QUESTIONS = [
  {
    q: 'Quando surge um desentendimento entre vocês, você tende a...',
    opts: [
      { t: 'Conversar com calma, confiando que vão resolver juntos', k: 'seguro' },
      { t: 'Ficar angustiado(a) e querer resolver tudo na hora', k: 'ansioso' },
      { t: 'Precisar de um tempo sozinho(a) antes de conseguir falar', k: 'evitativo' },
    ],
  },
  {
    q: 'Quando seu amor demora para responder uma mensagem...',
    opts: [
      { t: 'Fico tranquilo(a), sei que ele(a) responde quando pode', k: 'seguro' },
      { t: 'Começo a imaginar que talvez algo esteja errado', k: 'ansioso' },
      { t: 'Nem noto tanto — cada um no seu ritmo', k: 'evitativo' },
    ],
  },
  {
    q: 'Sobre falar de sentimentos no relacionamento...',
    opts: [
      { t: 'Me sinto à vontade para abrir o coração', k: 'seguro' },
      { t: 'Quero muito, mas às vezes temo estar sendo demais', k: 'ansioso' },
      { t: 'Prefiro guardar algumas coisas para mim', k: 'evitativo' },
    ],
  },
  {
    q: 'Nos momentos de muita proximidade e intimidade...',
    opts: [
      { t: 'Aproveito a conexão sem deixar de ser eu mesmo(a)', k: 'seguro' },
      { t: 'Eu gostaria que fosse assim, bem coladinhos, o tempo todo', k: 'ansioso' },
      { t: 'De vez em quando sinto necessidade de um respiro', k: 'evitativo' },
    ],
  },
  {
    q: 'Pensando em contar com o outro no dia a dia...',
    opts: [
      { t: 'Confio nele(a) e também gosto de ser um apoio', k: 'seguro' },
      { t: 'Tenho medo que, algum dia, me deixem de lado', k: 'ansioso' },
      { t: 'Prefiro, na maioria das vezes, contar comigo mesmo(a)', k: 'evitativo' },
    ],
  },
];

const ATT_RESULTS = {
  seguro: {
    emoji: '🌿',
    texto:
      'Você tende a se sentir confortável tanto na proximidade quanto na sua individualidade. Confia com naturalidade e consegue falar do que sente sem se perder no processo. Isso não é um rótulo fixo — é uma forma de ser que se constrói e se cultiva no dia a dia.',
    dica:
      'Dica para vocês: usem essa base de confiança para criar um "espaço seguro" onde possam falar de inseguranças sem medo de ser julgados.',
  },
  ansioso: {
    emoji: '🌊',
    texto:
      'Você valoriza muito a conexão e às vezes fica atento(a) a sinais de distância, buscando reforçar o vínculo. Esse cuidado mostra o quanto a relação importa para você. Não é um defeito — é uma necessidade de proximidade que pode ser conversada com carinho.',
    dica:
      'Dica para vocês: combinem pequenos gestos de reafirmação (um "estou aqui", um bom dia pontual) que acalmam sem virar uma cobrança.',
  },
  evitativo: {
    emoji: '🏔️',
    texto:
      'Você valoriza sua autonomia e às vezes precisa de um espaço próprio para processar antes de compartilhar. Isso não significa amar menos — é uma forma de se sentir seguro(a). Reconhecer esse ritmo ajuda os dois a se encontrarem no meio do caminho.',
    dica:
      'Dica para vocês: quando precisar de espaço, avise com carinho ("preciso de um tempinho e já volto") para que o outro não interprete como afastamento.',
  },
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
          <Text style={styles.resultTitle}>{labels[result.top]}</Text>
        </View>
        <Text style={[styles.mutedText, { marginTop: 10, marginBottom: 16 }]}>{r.texto}</Text>
        <View style={styles.tipCard}>
          <Text style={styles.overline}>Dica</Text>
          <Text style={styles.mutedText}>{r.dica}</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Assim ficou o balanço de vocês</Text>
        {order.map((k, i) => {
          const shown = Math.min(tick, result.counts[k] || 0);
          const pct = total ? Math.round((shown / total) * 100) : 0;
          return (
            <ScoreBar key={k} label={labels[k]} value={pct} gradient={BAR_GRADIENTS[i % BAR_GRADIENTS.length]} />
          );
        })}

        <View style={{ alignItems: 'center', marginTop: 18 }}>
          <TouchableOpacity style={styles.btnGhost} onPress={redo}>
            <Text style={styles.btnGhostText}>Refazer</Text>
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
      <Text style={[styles.mutedText, { fontSize: 13, marginTop: 8, marginBottom: 6 }]}>Pergunta {step + 1} de {total}</Text>
      <Text style={styles.sectionTitle}>{current.q}</Text>

      <View style={{ marginTop: 4 }}>
        {current.opts.map((o, i) => {
          const sel = chosen === o.k;
          return (
            <TouchableOpacity key={i} style={[styles.opt, sel && styles.optSel]} onPress={() => choose(o.k)} activeOpacity={0.85}>
              <Text style={[styles.optText, sel && styles.optTextSel]}>{sel ? '✓ ' : ''}{o.t}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.navRow}>
        <TouchableOpacity style={[styles.btnGhost, step === 0 && styles.btnDisabled]} onPress={() => setStep(step - 1)} disabled={step === 0}>
          <Text style={styles.btnGhostText}>Voltar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, !chosen && styles.btnDisabled]} onPress={next} disabled={!chosen}>
          <Text style={styles.btnText}>{step < total - 1 ? 'Próxima' : 'Ver resultado'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------- Como enfrentam os conflitos (2 perguntas simples, sem motor de quiz) ---------------- */
const DESAFIOS_CONFLITO = ['Comunicação', 'Rotina vs. romance', 'Confiança', 'Redescobrir-se'];

function Conflitos({ voce, amor, saved, onSave }) {
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
      <Text style={styles.sectionTitle}>Quando há um conflito entre {voce} e {amor}, quem costuma dar o primeiro passo?</Text>
      <View style={styles.optGrid}>
        {[voce, amor, 'Os dois igualmente', 'Ainda nenhum'].map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.optHalf, conflicto === op && styles.optSel]}
            onPress={() => elegirConflicto(op)}
          >
            <Text style={[styles.optText, { textAlign: 'center' }, conflicto === op && styles.optTextSel]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Qual é o desafio que vocês mais querem resolver juntos?</Text>
      <View style={styles.optGrid}>
        {DESAFIOS_CONFLITO.map((op) => (
          <TouchableOpacity
            key={op}
            style={[styles.optHalf, desafio === op && styles.optSel]}
            onPress={() => elegirDesafio(op)}
          >
            <Text style={[styles.optText, { textAlign: 'center' }, desafio === op && styles.optTextSel]}>{op}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {completo && (
        <>
          <View style={[styles.statRow, { marginTop: 20, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }]}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{conflicto}</Text>
              <Text style={styles.statLabel}>dá o primeiro passo</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{desafio}</Text>
              <Text style={styles.statLabel}>desafio a resolver</Text>
            </View>
          </View>
          <Text style={[styles.disclaimer, { marginTop: 10 }]}>Salvo — isso ajuda a personalizar o que vocês veem em Reconectar.</Text>
        </>
      )}
    </View>
  );
}

/* ---------------- Tela ---------------- */
const QUIZ_TABS = [
  { id: 'linguagem', label: 'Linguagem do amor', icon: '💬' },
  { id: 'apego', label: 'Estilo de apego', icon: '🧭' },
  { id: 'conflitos', label: 'Conflitos', icon: '🤝' },
];

export default function DescobrirScreen() {
  const navigation = useNavigation();
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
        <GradientHeader title="Descobrir" subtitle="Conheçam-se mais" onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>Complete o quiz do casal primeiro</Text>
          <Text style={styles.emptyProfileDesc}>
            Precisamos saber os nomes de vocês para guardar os resultados no lugar certo.
          </Text>
          <TouchableOpacity style={[styles.btn, { marginTop: 20 }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>Fazer o quiz do casal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Descobrir" subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.mutedText, { textAlign: 'center', marginBottom: 18 }]}>
          Dois testes rápidos para que {voce} e {amor} abram uma boa conversa. Não há respostas certas
          ou erradas — só um convite para se entenderem com mais carinho.
        </Text>

        <View style={styles.tabsCard}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {QUIZ_TABS.map((t) => {
              const active = tab === t.id;
              const done = isTabDone(t.id);
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tabBtn, active && styles.tabBtnActive]}
                  onPress={() => setTab(t.id)}
                >
                  <Text style={styles.tabIcon}>{done ? '✓' : t.icon}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{t.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {!loaded ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : tab === 'linguagem' ? (
          <Quiz
            questions={LANG_QUESTIONS}
            order={LANG_ORDER}
            labels={LANG_LABELS}
            results={LANG_RESULTS}
            resultBadge={`A linguagem principal de ${voce}`}
            saved={data.linguagem}
            onSave={(res) => saveQuiz('linguagem', res)}
          />
        ) : tab === 'apego' ? (
          <Quiz
            questions={ATT_QUESTIONS}
            order={ATT_ORDER}
            labels={ATT_LABELS}
            results={ATT_RESULTS}
            resultBadge={`O estilo predominante de ${voce}`}
            saved={data.apego}
            onSave={(res) => saveQuiz('apego', res)}
          />
        ) : (
          <Conflitos voce={voce} amor={amor} saved={data.conflictos} onSave={(res) => saveQuiz('conflictos', res)} />
        )}

        <Text style={styles.disclaimer}>
          Isso é uma reflexão para vocês conversarem, não um diagnóstico. Ninguém se resume a um
          rótulo — e essas formas de amar e se vincular podem mudar e crescer com o tempo.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  tipCard: {
    backgroundColor: colors.gold + '14', borderWidth: 1, borderColor: colors.gold + '55',
    borderRadius: 14, padding: 14,
  },

  tabsCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 8, marginBottom: 16 },
  tabBtn: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14, borderWidth: 1, borderColor: 'transparent' },
  tabBtnActive: { borderColor: colors.gold + '80', backgroundColor: colors.gold + '18' },
  tabIcon: { fontSize: 18 },
  tabLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  tabLabelActive: { color: colors.gold, fontWeight: '800' },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  mutedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 18, lineHeight: 16 },

  resultEmoji: { fontSize: 40, marginVertical: 10 },
  resultTitle: { color: colors.text, fontSize: 22, fontWeight: '800' },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  opt: {
    backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, padding: 14, marginBottom: 10,
  },
  optSel: { borderColor: colors.accent, backgroundColor: colors.accent + '22' },
  optText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  optTextSel: { color: colors.text, fontWeight: '700' },

  optGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  optHalf: {
    width: '48%', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border,
    borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8,
  },

  navRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  btnGhost: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 18, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: 10 },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
