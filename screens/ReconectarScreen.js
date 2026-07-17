// Reconectar — porta fiel de c:/tmp/gilfforever/web/app/(app)/reconectar/page.js:
// mesmas 4 trilhas fixas (conversar/frieza/carinho/confiança) com 6 passos cada,
// mesmo esquema de mapa achatado no AsyncStorage (ver lib/coupleData.js), mesmo
// "Modo SOS" efêmero (nunca persistido) e mesma trilha recomendada calculada a
// partir do estilo de apego e do desafio salvos em Descobrir. A cópia foi
// traduzida para PT-BR e adaptada aos primitivos do React Native (accordion em
// View/TouchableOpacity em vez de <details>/CSS, toast de celebração com
// setTimeout, sem localStorage síncrono). A leitura de "clima de hoje" do
// original (`gff-hoje:...`) fica sempre null aqui — a tela "Hoje" ainda não foi
// portada para este app.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';
import { useCouple } from '../context/CoupleContext';
import { getReconectarChecks, toggleReconectarStep, getDescobrirData } from '../lib/coupleData';

const HEADER_GRADIENT = gradients.pink;

const TRACKS = [
  {
    id: 'conversar',
    emoji: '💬',
    title: 'Voltar a conversar',
    intro: 'Pequenos gestos para reabrir o canal e se escutarem de verdade.',
    gradient: ['#FF7BD5', '#B57BFF'],
    steps: [
      'Escute seu par por 2 minutos sem interromper e resuma com suas palavras o que ouviu.',
      'Envie uma mensagem curta perguntando como foi o dia dele(a) — e leia a resposta com atenção.',
      'Escolham um momento sem pressa para conversar, com os celulares longe.',
      'Faça uma pergunta aberta ("o que você tem sentido ultimamente?") em vez de uma de sim ou não.',
      'Compartilhe algo seu primeiro: conte como você tem se sentido, começando com "eu sinto...".',
      'Combinem um horário fixo na semana, só para vocês, para se atualizarem.',
    ],
  },
  {
    id: 'frieza',
    emoji: '🌤️',
    title: 'Reduzir a frieza',
    intro: 'Esquentar o ambiente aos poucos, sem pressão e no ritmo dos dois.',
    gradient: ['#5CE0D8', '#5CA8FF'],
    steps: [
      'Cumprimente seu par com um bom dia ou boa noite, mesmo nos dias mais difíceis.',
      'Reconheça em voz alta algo que você admira nele(a).',
      'Ofereça um contato carinhoso — a mão no ombro, um abraço — se for confortável para os dois.',
      'Respire antes de falar quando sentir vontade de se fechar, para não responder no automático.',
      'Diga "senti sua falta" quando for verdade, sem esperar nada em troca.',
      'Retomem um pequeno hábito de vocês: um café juntos, uma música, uma caminhada.',
    ],
  },
  {
    id: 'carinho',
    emoji: '💛',
    title: 'Reconstruir o carinho',
    intro: 'Regar o afeto com atenção, gratidão e presença.',
    gradient: ['#FFC85C', '#FF8C5C'],
    steps: [
      'Agradeça algo específico que seu par fez hoje, por menor que pareça.',
      'Envie uma mensagem lembrando um bom momento que vocês viveram juntos.',
      'Faça um elogio sincero sobre quem ele(a) é, não só sobre o que faz.',
      'Ofereça ajuda em algo que você sabe que pesa para ele(a), sem esperar que peça.',
      'Reservem 10 minutos só para ficarem juntos, sem resolver nada — só presença.',
      'Escreva um bilhete curto dizendo o que você valoriza em ter essa pessoa por perto.',
    ],
  },
  {
    id: 'confianca',
    emoji: '🤝',
    title: 'Retomar a confiança',
    intro: 'Reconstruir a segurança com transparência e reparos honestos.',
    gradient: ['#5FD98C', '#5CE0D8'],
    steps: [
      'Cumpra uma pequena promessa esta semana e avise com carinho quando cumprir.',
      'Peça desculpas por algo específico, sem acrescentar um "mas" depois.',
      'Escute a dor do seu par até o fim, sem se defender, e valide o que ele(a) sentiu.',
      'Faça um pedido começando com "eu sinto..." em vez de acusar ("sinto insegurança quando...").',
      'Seja transparente sobre algo que você costumava evitar contar, no seu próprio ritmo.',
      'Combinem juntos um pequeno pacto de convivência e revisem daqui a uma semana.',
    ],
  },
];

const SOS_STEPS = [
  'Respirem fundo, cada um à sua maneira, antes de dizer qualquer outra coisa.',
  'O primeiro que conseguir, diga em voz alta: "não quero brigar com você, quero te entender".',
  'Escutem um ao outro sem interromper nem se defender — só para entender, não para responder já.',
  'Ofereçam um abraço de 20 segundos, mesmo que ainda falte algo para resolver.',
];

// Cruza o desafio marcado em Descobrir com o estilo de apego para sugerir a
// trilha mais útil agora. `clima` fica sempre null (tela "Hoje" não existe aqui).
const DESAFIO_TRACK = {
  'Comunicação': 'conversar',
  'Rotina vs. romance': 'carinho',
  'Confiança': 'confianca',
  'Redescobrir-se': 'carinho',
};

function trilhaRecomendada(apego, clima, desafio) {
  if (clima === 'distante') return 'frieza';
  if (desafio && DESAFIO_TRACK[desafio]) return DESAFIO_TRACK[desafio];
  if (apego === 'ansioso') return 'confianca';
  if (apego === 'evitativo') return 'conversar';
  if (apego === 'seguro') return 'carinho';
  return null;
}

function doneCount(checks, track) {
  return track.steps.reduce((n, _s, i) => n + (checks[`${track.id}:${i}`] ? 1 : 0), 0);
}

export default function ReconectarScreen() {
  const navigation = useNavigation();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [loaded, setLoaded] = useState(false);
  const [checks, setChecks] = useState({});
  const [open, setOpen] = useState(TRACKS[0].id);
  const [recomendada, setRecomendada] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosStep, setSosStep] = useState(0);
  const recomendadaAppliedRef = useRef(false);

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const [c, descobrir] = await Promise.all([getReconectarChecks(voce, amor), getDescobrirData(voce, amor)]);
    setChecks(c);
    const rec = trilhaRecomendada(descobrir.apego?.top, null, descobrir.conflictos?.desafio);
    setRecomendada(rec);
    if (!recomendadaAppliedRef.current) {
      if (rec) setOpen(rec);
      recomendadaAppliedRef.current = true;
    }
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(null), 5000);
    return () => clearTimeout(t);
  }, [celebrate]);

  async function handleToggleStep(track, i) {
    const stepKey = `${track.id}:${i}`;
    const willBeChecked = !checks[stepKey];
    const next = await toggleReconectarStep(voce, amor, track.id, i);
    setChecks(next);
    if (willBeChecked) {
      const doneAfter = track.steps.reduce((n, _s, idx) => n + (next[`${track.id}:${idx}`] ? 1 : 0), 0);
      if (doneAfter === track.steps.length) setCelebrate(track);
    }
  }

  const totalSteps = TRACKS.reduce((n, t) => n + t.steps.length, 0);
  const totalDone = TRACKS.reduce((n, t) => n + doneCount(checks, t), 0);
  const trilhasCompletas = TRACKS.filter((t) => doneCount(checks, t) === t.steps.length).length;

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title="Reconectar" subtitle="Fortaleça o vínculo" onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>Complete o quiz do casal primeiro</Text>
          <Text style={styles.emptyProfileDesc}>
            Precisamos saber os nomes de vocês para guardar o progresso das trilhas no lugar certo.
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
      <GradientHeader title="Reconectar" subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {celebrate && (
          <View style={styles.celebrateCard}>
            <TouchableOpacity style={styles.celebrateClose} onPress={() => setCelebrate(null)}>
              <Ionicons name="close" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.celebrateEmoji}>🎉{celebrate.emoji}</Text>
            <Text style={styles.celebrateTitle}>Conseguiram, {voce} & {amor}!</Text>
            <Text style={styles.celebrateDesc}>
              Completaram juntos a trilha "{celebrate.title}". Mais um passo, real e dos dois.
            </Text>
          </View>
        )}

        {/* Modo SOS — ação mais urgente, ephemeral (nunca persiste) */}
        <View style={[styles.card, { marginBottom: 14 }]}>
          <TouchableOpacity style={styles.rowBtn} onPress={() => setSosOpen((v) => !v)} activeOpacity={0.8}>
            <Text style={styles.rowEmoji}>🆘</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.overline}>Ajuda imediata</Text>
              <Text style={styles.rowTitle}>Modo SOS — logo após uma briga</Text>
              <Text style={styles.rowDesc}>4 passos curtos para baixar a tensão agora, sem escolher trilha.</Text>
            </View>
            <Ionicons name={sosOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
          {sosOpen && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sosStepText}>{SOS_STEPS[sosStep]}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((sosStep + 1) / SOS_STEPS.length) * 100}%` }]} />
              </View>
              <View style={{ alignItems: 'center', marginTop: 12 }}>
                {sosStep < SOS_STEPS.length - 1 ? (
                  <TouchableOpacity style={styles.btn} onPress={() => setSosStep((s) => s + 1)}>
                    <Text style={styles.btnText}>Pronto, próximo passo</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.btn} onPress={() => { setSosOpen(false); setSosStep(0); }}>
                    <Text style={styles.btnText}>Terminamos os 4 passos 💛</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reavivar a conexão</Text>
          <Text style={styles.mutedText}>
            Reconectar não é convencer nem controlar ninguém — é voltar a se escutar, se cuidar e se
            comunicar com honestidade. Escolham uma trilha e façam uma pequena missão por dia, no
            ritmo de vocês. Os gestos pequenos, repetidos, reconstroem o vínculo.
          </Text>
          <Text style={styles.disclaimer}>Para questões sérias, considerem terapia de casal com um profissional.</Text>
        </View>

        {loaded && (
          <View style={[styles.card, { marginTop: 14, marginBottom: 14 }]}>
            <Text style={styles.overline}>Avanço conjunto de vocês</Text>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalDone}</Text>
                <Text style={styles.statLabel}>✅ feitos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalSteps - totalDone}</Text>
                <Text style={styles.statLabel}>⏳ pendentes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{trilhasCompletas}/{TRACKS.length}</Text>
                <Text style={styles.statLabel}>🏁 trilhas</Text>
              </View>
            </View>
            <View style={{ marginTop: 14 }}>
              {TRACKS.map((t) => (
                <ScoreBar
                  key={t.id}
                  label={t.emoji + ' ' + t.title.split(' ').slice(-1)[0]}
                  value={Math.round((doneCount(checks, t) / t.steps.length) * 100)}
                  gradient={t.gradient}
                />
              ))}
            </View>
          </View>
        )}

        <Text style={styles.pageSectionTitle}>Trilhas de reconexão</Text>
        {recomendada && (
          <Text style={[styles.mutedText, { marginBottom: 10 }]}>
            De acordo com o jeito de vocês se vincularem e o momento de hoje, sugerimos começar pela trilha marcada abaixo.
          </Text>
        )}

        {TRACKS.map((track) => {
          const done = doneCount(checks, track);
          const total = track.steps.length;
          const isOpen = open === track.id;
          const complete = loaded && done === total;
          const isRecommended = recomendada === track.id;
          return (
            <View key={track.id} style={[styles.card, styles.trackCard, isRecommended && styles.trackCardRecommended]}>
              <TouchableOpacity style={styles.rowBtn} onPress={() => setOpen(isOpen ? '' : track.id)} activeOpacity={0.8}>
                <Text style={styles.rowEmoji}>{track.emoji}</Text>
                <View style={{ flex: 1 }}>
                  {isRecommended && <Text style={styles.recommendedBadge}>✷ sugerida para hoje</Text>}
                  <Text style={styles.rowTitle}>{track.title}</Text>
                  <Text style={styles.rowDesc}>{track.intro}</Text>
                </View>
                <Text style={styles.fractionBadge}>{loaded ? (complete ? `✓ ${done}/${total}` : `${done}/${total}`) : `0/${total}`}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              {isOpen && (
                <View style={{ marginTop: 14 }}>
                  {track.steps.map((step, i) => {
                    const checked = loaded && !!checks[`${track.id}:${i}`];
                    return (
                      <TouchableOpacity key={i} style={styles.stepRow} onPress={() => handleToggleStep(track, i)} activeOpacity={0.8}>
                        <View style={[styles.stepCheck, checked && styles.stepCheckOn]}>
                          {checked && <Ionicons name="checkmark" size={14} color={colors.gold} />}
                        </View>
                        <Text style={[styles.stepText, checked && styles.stepTextDone]}>{step}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {complete && (
                    <Text style={styles.hint}>Trilha completa. Quando quiserem, podem revisitá-la juntos.</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.disclaimer}>
          As memórias de progresso das trilhas de vocês ficam salvas apenas neste aparelho.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  trackCard: { marginBottom: 14 },
  trackCardRecommended: { borderColor: colors.gold },

  rowBtn: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowEmoji: { fontSize: 28 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  rowDesc: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  overline: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  recommendedBadge: {
    color: colors.gold, fontSize: 11, fontWeight: '700', marginBottom: 4,
  },
  fractionBadge: {
    color: colors.accent, fontSize: 12, fontWeight: '700',
    backgroundColor: colors.accent + '22', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginRight: 8,
  },

  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 8 },
  pageSectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 6, marginBottom: 10 },
  mutedText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  disclaimer: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 12, lineHeight: 16 },
  hint: { color: colors.textMuted, fontSize: 12, marginTop: 10, lineHeight: 17 },

  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.text, fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: 10 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 8 },
  stepCheck: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.gold + '99',
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  stepCheckOn: { backgroundColor: colors.gold + '2E' },
  stepText: { flex: 1, color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  stepTextDone: { textDecorationLine: 'line-through', opacity: 0.75 },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  celebrateCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.gold, borderRadius: 16,
    padding: 18, marginBottom: 14, alignItems: 'center',
  },
  celebrateClose: { position: 'absolute', top: 10, right: 10 },
  celebrateEmoji: { fontSize: 30, marginBottom: 6 },
  celebrateTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  celebrateDesc: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },

  sosStepText: { color: colors.text, fontSize: 16, marginBottom: 12, lineHeight: 22 },

  btn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyProfileTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  emptyProfileDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
