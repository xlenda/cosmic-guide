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
import { colors, gradients, space, type } from '../theme';
// AS PEÇAS DE DIAGRAMAÇÃO (12/09/2026) — ver design/PECAS-DE-DIAGRAMACAO.md.
// Esta tela era o caso de manual do diagnóstico: nove cards do MESMO tamanho,
// da MESMA cor, empilhados no MESMO chão. Fotografada antes (390x844), a dobra
// 2 mostrava seis checkboxes e dois cards de trilha sem nenhuma marca de "aqui
// mudou de assunto" — o olho lia lista de configurações, não trilha de casal.
// As três faixas dão três chãos: o que é URGENTE (SOS + o que é isto), o que
// já foi FEITO (o placar) e o que HÁ PRA FAZER (as trilhas).
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import ScoreBar from '../components/ScoreBar';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { getReconectarChecks, toggleReconectarStep, getDescobrirData } from '../lib/coupleData';

const HEADER_GRADIENT = gradients.pink;

// title/intro/steps viram chaves i18n — t() onde forem exibidos (mesmo padrão
// do STEPS em QuizScreen.js). Os textos PT continuam idênticos no dicionário.
const TRACKS = [
  {
    id: 'conversar',
    emoji: '💬',
    title: 'reconectar.track.conversar.title',
    intro: 'reconectar.track.conversar.intro',
    gradient: ['#FF7BD5', '#B57BFF'],
    steps: [
      'reconectar.track.conversar.step.0',
      'reconectar.track.conversar.step.1',
      'reconectar.track.conversar.step.2',
      'reconectar.track.conversar.step.3',
      'reconectar.track.conversar.step.4',
      'reconectar.track.conversar.step.5',
    ],
  },
  {
    id: 'frieza',
    emoji: '🌤️',
    title: 'reconectar.track.frieza.title',
    intro: 'reconectar.track.frieza.intro',
    gradient: ['#5CE0D8', '#5CA8FF'],
    steps: [
      'reconectar.track.frieza.step.0',
      'reconectar.track.frieza.step.1',
      'reconectar.track.frieza.step.2',
      'reconectar.track.frieza.step.3',
      'reconectar.track.frieza.step.4',
      'reconectar.track.frieza.step.5',
    ],
  },
  {
    id: 'carinho',
    emoji: '💛',
    title: 'reconectar.track.carinho.title',
    intro: 'reconectar.track.carinho.intro',
    gradient: ['#FFC85C', '#FF8C5C'],
    steps: [
      'reconectar.track.carinho.step.0',
      'reconectar.track.carinho.step.1',
      'reconectar.track.carinho.step.2',
      'reconectar.track.carinho.step.3',
      'reconectar.track.carinho.step.4',
      'reconectar.track.carinho.step.5',
    ],
  },
  {
    id: 'confianca',
    emoji: '🤝',
    title: 'reconectar.track.confianca.title',
    intro: 'reconectar.track.confianca.intro',
    gradient: ['#5FD98C', '#5CE0D8'],
    steps: [
      'reconectar.track.confianca.step.0',
      'reconectar.track.confianca.step.1',
      'reconectar.track.confianca.step.2',
      'reconectar.track.confianca.step.3',
      'reconectar.track.confianca.step.4',
      'reconectar.track.confianca.step.5',
    ],
  },
];

const SOS_STEPS = [
  'reconectar.sos.step.0',
  'reconectar.sos.step.1',
  'reconectar.sos.step.2',
  'reconectar.sos.step.3',
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
  const { t } = useLanguage();
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
        <GradientHeader title={t('reconectar.header.title')} subtitle={t('reconectar.header.subtitle')} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>{t('reconectar.gate.title')}</Text>
          <Text style={styles.emptyProfileDesc}>
            {t('reconectar.gate.desc')}
          </Text>
          <TouchableOpacity style={[styles.btn, { marginTop: space.entre }]} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>{t('reconectar.gate.cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader title={t('reconectar.header.title')} subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {celebrate && (
          <View style={styles.celebrateCard}>
            <TouchableOpacity style={styles.celebrateClose} onPress={() => setCelebrate(null)}>
              <Ionicons name="close" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.celebrateEmoji}>🎉{celebrate.emoji}</Text>
            <Text style={styles.celebrateTitle}>{t('reconectar.celebrate.title', { voce, amor })}</Text>
            <Text style={styles.celebrateDesc}>
              {t('reconectar.celebrate.desc', { title: t(celebrate.title) })}
            </Text>
          </View>
        )}

        {/* FAIXA 1 — O QUE É URGENTE. Chão rosa (a família do pink, o tom dos
            assuntos de casal) com o SOS e o "o que é isto" juntos: os dois são
            o que a pessoa lê ANTES de escolher trilha. Antes eram dois cards
            soltos no mesmo fundo de todo o resto. */}
        <FaixaCurva tom="rosa" semente="reconectar-agora" estiloCorpo={styles.faixaTopo}>
        {/* Modo SOS — ação mais urgente, ephemeral (nunca persiste) */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.rowBtn} onPress={() => setSosOpen((v) => !v)} activeOpacity={0.8}>
            <Text style={styles.rowEmoji}>🆘</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.overline}>{t('reconectar.sos.overline')}</Text>
              <Text style={styles.rowTitle}>{t('reconectar.sos.title')}</Text>
              <Text style={styles.rowDesc}>{t('reconectar.sos.desc')}</Text>
            </View>
            <Ionicons name={sosOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
          {sosOpen && (
            <View style={{ marginTop: space.bloco }}>
              <Text style={styles.sosStepText}>{t(SOS_STEPS[sosStep])}</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${((sosStep + 1) / SOS_STEPS.length) * 100}%` }]} />
              </View>
              <View style={{ alignItems: 'center', marginTop: space.dentro }}>
                {sosStep < SOS_STEPS.length - 1 ? (
                  <TouchableOpacity style={styles.btn} onPress={() => setSosStep((s) => s + 1)}>
                    <Text style={styles.btnText}>{t('reconectar.sos.next')}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.btn} onPress={() => { setSosOpen(false); setSosStep(0); }}>
                    <Text style={styles.btnText}>{t('reconectar.sos.finish')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>

        {/* O "o que é isto" SEM card: é parágrafo de abertura, e parágrafo
            pede COLUNA DE LEITURA, não moldura. A faixa já é o chão dele.
            Em 390px a coluna não corta nada (o certo); no tablet e na web ela
            impede a linha de atravessar a tela inteira. */}
        <ColunaLeitura style={styles.introColuna}>
          <Text style={styles.sectionTitle}>{t('reconectar.intro.title')}</Text>
          <Text style={styles.mutedText}>
            {t('reconectar.intro.text')}
          </Text>
          <Text style={styles.disclaimer}>{t('reconectar.intro.disclaimer')}</Text>
        </ColunaLeitura>
        </FaixaCurva>

        {/* FAIXA 2 — O QUE JÁ FOI FEITO. Só existe com `loaded`: sem dado
            carregado não há faixa nenhuma, porque faixa em volta de nada é
            exatamente o bloco de cor vazio que o revisor pegou na Home. */}
        {loaded && (
          <FaixaCurva tom="ameixa" semente="reconectar-placar" grude>
          <View style={styles.card}>
            <Text style={styles.overline}>{t('reconectar.progress.overline')}</Text>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalDone}</Text>
                <Text style={styles.statLabel}>{t('reconectar.progress.done')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalSteps - totalDone}</Text>
                <Text style={styles.statLabel}>{t('reconectar.progress.pending')}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{trilhasCompletas}/{TRACKS.length}</Text>
                <Text style={styles.statLabel}>{t('reconectar.progress.tracks')}</Text>
              </View>
            </View>
            <View style={{ marginTop: space.bloco }}>
              {TRACKS.map((tr) => (
                <ScoreBar
                  key={tr.id}
                  label={tr.emoji + ' ' + t(tr.title).split(' ').slice(-1)[0]}
                  value={Math.round((doneCount(checks, tr) / tr.steps.length) * 100)}
                  gradient={tr.gradient}
                />
              ))}
            </View>
          </View>
          </FaixaCurva>
        )}

        {/* FAIXA 3 — O QUE HÁ PRA FAZER. Chão neutro (ardósia) porque é a
            faixa MAIS LONGA da tela: cor cromática numa faixa de nove cards
            lava a tela (foi a medida que segurou o violeta fora da Home). */}
        <FaixaCurva tom="noite" semente="reconectar-trilhas" grude>
        <Text style={styles.pageSectionTitle}>{t('reconectar.tracksTitle')}</Text>
        {recomendada && (
          <Text style={[styles.mutedText, { marginBottom: space.dentro }]}>
            {t('reconectar.recommendedIntro')}
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
                  {isRecommended && <Text style={styles.recommendedBadge}>{t('reconectar.recommendedBadge')}</Text>}
                  <Text style={styles.rowTitle}>{t(track.title)}</Text>
                  <Text style={styles.rowDesc}>{t(track.intro)}</Text>
                </View>
                <Text style={styles.fractionBadge}>{loaded ? (complete ? `✓ ${done}/${total}` : `${done}/${total}`) : `0/${total}`}</Text>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
              </TouchableOpacity>

              {isOpen && (
                <View style={{ marginTop: space.bloco }}>
                  {track.steps.map((step, i) => {
                    const checked = loaded && !!checks[`${track.id}:${i}`];
                    return (
                      <TouchableOpacity key={i} style={styles.stepRow} onPress={() => handleToggleStep(track, i)} activeOpacity={0.8}>
                        <View style={[styles.stepCheck, checked && styles.stepCheckOn]}>
                          {checked && <Ionicons name="checkmark" size={14} color={colors.gold} />}
                        </View>
                        <Text style={[styles.stepText, checked && styles.stepTextDone]}>{t(step)}</Text>
                      </TouchableOpacity>
                    );
                  })}
                  {complete && (
                    <Text style={styles.hint}>{t('reconectar.trackComplete')}</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}

        <Text style={styles.disclaimer}>
          {t('reconectar.disclaimer')}
        </Text>
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // SEM padding horizontal: as faixas sangram de ponta a ponta e cada uma traz
  // o proprio space.tela por dentro. Com o padding aqui, a faixa terminava 16px
  // antes da borda e lia como card gigante, que e justamente o que ela nao e.
  scrollContent: { paddingBottom: space.fimDaLista },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: space.bloco,
  },
  // A primeira faixa ja traz o respiro dela; o card do SOS nao precisa somar
  // outro em cima. So o degrau ate o paragrafo de abertura.
  faixaTopo: { paddingTop: space.entre },
  introColuna: { marginTop: space.entre },
  trackCard: { marginBottom: space.bloco },
  trackCardRecommended: { borderColor: colors.gold },

  rowBtn: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  rowEmoji: { fontSize: 28 },
  // O titulo da linha sai do peso 800 pro type.cartao (600): negrito e
  // HIERARQUIA, e aqui ele competia com o titulo de secao logo acima.
  rowTitle: { ...type.cartao, color: colors.text },
  rowDesc: { ...type.apoio, color: colors.textMuted, marginTop: space.grudado },
  overline: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },

  recommendedBadge: {
    ...type.etiqueta, color: colors.gold, marginBottom: space.grudado,
  },
  fractionBadge: {
    color: colors.accent, fontSize: 12, fontWeight: '700',
    backgroundColor: colors.accent + '22', borderRadius: 10,
    paddingHorizontal: space.junto, paddingVertical: space.grudado, marginRight: space.junto,
  },

  sectionTitle: { ...type.secao, color: colors.text, marginBottom: space.dentro },
  pageSectionTitle: { ...type.secao, color: colors.text, marginBottom: space.bloco },
  // O corpo sobe pro degrau de leitura da fundacao (15/24 em vez de 14/21):
  // e o paragrafo que explica a tela, e era o texto mais apertado dela.
  mutedText: { ...type.corpoCurto, color: colors.textSecondary },
  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.bloco },
  hint: { ...type.apoio, color: colors.textMuted, marginTop: space.dentro },

  statRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: space.dentro },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...type.numero, color: colors.text },
  statLabel: { ...type.apoio, color: colors.textMuted, marginTop: space.grudado },
  statDivider: { width: 1, height: 30, backgroundColor: colors.border, marginHorizontal: space.dentro },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.dentro, paddingVertical: space.junto },
  stepCheck: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.gold + '99',
    justifyContent: 'center', alignItems: 'center', marginTop: 1,
  },
  stepCheckOn: { backgroundColor: colors.gold + '2E' },
  stepText: { ...type.corpoCurto, flex: 1, color: colors.textSecondary },
  stepTextDone: { textDecorationLine: 'line-through', opacity: 0.75 },

  progressTrack: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: colors.accent },

  celebrateCard: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.gold, borderRadius: 16,
    padding: space.bloco, marginBottom: space.bloco, alignItems: 'center',
  },
  celebrateClose: { position: 'absolute', top: space.dentro, right: space.dentro },
  celebrateEmoji: { fontSize: 30, marginBottom: space.junto },
  celebrateTitle: { ...type.cartao, color: colors.text },
  celebrateDesc: { ...type.apoio, color: colors.textSecondary, textAlign: 'center', marginTop: space.grudado },

  sosStepText: { ...type.corpo, color: colors.text, marginBottom: space.dentro },

  btn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: space.dentro, paddingHorizontal: space.entre, alignItems: 'center',
  },
  btnText: { ...type.botao, color: '#fff' },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao },
  emptyProfileTitle: { ...type.cartao, color: colors.text, textAlign: 'center', marginTop: space.bloco },
  emptyProfileDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.junto },
});
