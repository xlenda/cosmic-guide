// screens/GroundingScreen.js
// ASSENTAR — a tela do ritual: alguns minutos de respiração contada e silêncio
// depois de uma leitura.
//
// ===========================================================================
// LEIA lib/grounding.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// Regra do dono, resumida: respiração e presença são PRÁTICA, nunca
// tratamento. Descreva o que a pessoa VAI FAZER e o que a tradição associa
// (com a fonte). Nunca prometa efeito. A diferença entre certo e errado mora
// na preposição de finalidade: "inspire contando até quatro" descreve;
// "inspire para relaxar" promete. test/grounding.test.js falha o build quando
// isso é violado.
// ===========================================================================
//
// A ORDEM DA TELA NÃO É ARBITRÁRIA:
//   1. o aviso de que isto é prática, não saúde;
//   2. o aviso de contraindicação, no padrão que a Headspace usa — nomear as
//      condições e MANDAR PERGUNTAR A UM PROFISSIONAL. Ele fica VISÍVEL antes
//      de começar, nunca no rodapé: aviso embaixo do conteúdo não é aviso;
//   3. só então a escolha de padrão e de duração.
//
// E a proteção que de fato protege não é nenhum dos dois avisos — é o
// desenho: o padrão pré-selecionado NÃO TEM RETENÇÃO (ver PADRAO_PADRAO em
// lib/grounding.js), então quem só apertou começar nunca recebe o elemento de
// maior risco. Um app que confia só no disclaimer terceirizou o problema para
// um texto que ninguém lê.
//
// O QUE ESTA TELA NÃO TEM, DE PROPÓSITO: contagem de progresso própria,
// recompensa, sequência de ritual, badge de "completou". O contexto de uso é
// alguém que acabou de receber um Tarô ou um sonho interpretado e pode estar
// mexida — se sair no meio custar alguma coisa, a pessoa que está mal fica no
// exercício por causa da métrica. Sair no meio aqui não custa nada, e a tela
// diz isso com todas as letras. O único efeito é o mesmo de qualquer leitura:
// terminar marca o dia como ativo (lib/streak.js recordActiveDay), pelo
// caminho que já existe.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import BreathGuide from '../components/BreathGuide';
import CosmicSoundPlayer from '../components/CosmicSoundPlayer';
import { useLanguage } from '../context/LanguageContext';
import { recordActiveDay } from '../lib/streak';
import {
  PADROES,
  PADRAO_PADRAO,
  DURACOES_MIN,
  DURACAO_PADRAO_MIN,
  FONTES,
  NAO_ACHADO,
  PLANETAS_LOCUS,
  SEMANA_LOCUS,
  ARISTOTELES_LOCUS,
  TRIPLICIDADE_TERRA,
  formatarTempo,
  guiaDoDia,
  padraoPorId,
  padraoKey,
  regenteKey,
  elementoKey,
  naoAchadoKey,
  sessaoEm,
} from '../lib/grounding';

// Tique da sessão. 250 ms é o suficiente pra contagem virar no segundo certo
// sem parecer que atrasou, e é 4× menos trabalho que um quadro. O tempo
// decorrido vem de relógio de parede (Date.now), não de contagem de tiques —
// aba em segundo plano tem o setInterval estrangulado pelo navegador, e uma
// sessão de 20 minutos contada por tiques terminaria muito depois do que
// prometeu (mesma lição de context/CosmicSoundContext.js).
const TIQUE_MS = 250;

function Section({ title, children, defaultOpen = false }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title} — ${open ? t('grounding.collapse') : t('grounding.expand')}`}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

export default function GroundingScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  // 'setup' → 'rodando' → 'fim' (chegou ao tempo) ou 'parou' (saiu no meio).
  const [etapa, setEtapa] = useState('setup');
  const [padraoId, setPadraoId] = useState(PADRAO_PADRAO);
  const [minutos, setMinutos] = useState(DURACAO_PADRAO_MIN);
  const [decorrido, setDecorrido] = useState(0);
  const inicioRef = useRef(0);

  const padrao = padraoPorId(padraoId);

  // O céu de hoje, calculado uma vez por montagem. Determinístico por dia
  // local (ver guiaDoDia): não muda no meio de uma sessão de vinte minutos.
  const guia = useMemo(() => guiaDoDia(new Date()), []);

  const sessao = useMemo(
    () => sessaoEm(padrao, minutos, decorrido),
    [padrao, minutos, decorrido]
  );

  const encerrar = useCallback(() => {
    setEtapa('parou');
    setDecorrido(0);
  }, []);

  const comecar = useCallback(() => {
    inicioRef.current = Date.now();
    setDecorrido(0);
    setEtapa('rodando');
  }, []);

  useEffect(() => {
    if (etapa !== 'rodando') return undefined;
    const totalS = minutos * 60;
    const id = setInterval(() => {
      const t0 = (Date.now() - inicioRef.current) / 1000;
      if (t0 >= totalS) {
        setDecorrido(totalS);
        setEtapa('fim');
        // Terminar conta como dia ativo — o MESMO caminho de qualquer leitura
        // (lib/readingCompletion.js chama a mesma função). Só no fim natural:
        // quem sai no meio não perde nem ganha nada, e não existe contagem
        // própria deste ritual em lugar nenhum.
        recordActiveDay().catch(() => {});
        return;
      }
      setDecorrido(t0);
    }, TIQUE_MS);
    return () => clearInterval(id);
  }, [etapa, minutos]);

  const rodando = etapa === 'rodando';
  // Nunca é nulo com os sete regentes deste arquivo (o teste garante que os
  // sete dias da semana resolvam), mas a tela não quebra se um dia faltar: o
  // bloco do dia some e o ritual continua funcionando.
  const regente = guia.regente;

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('grounding.title')}
        subtitle={t('grounding.subtitle')}
        onBack={() => navigation.goBack()}
        gradient={gradients.teal}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {rodando ? (
          // ---------------------------------------------------------------
          // SESSÃO EM CURSO
          // ---------------------------------------------------------------
          <>
            <BreathGuide
              fase={sessao.fase}
              duracaoFase={sessao.duracaoFase}
              contagem={sessao.contagem}
              ativo
            />

            <Text style={styles.remaining} testID="grounding-remaining">
              {t('grounding.running.remaining', { time: formatarTempo(sessao.restanteS) })}
            </Text>
            <Text style={styles.cycles}>
              {t('grounding.running.cycles', { n: sessao.ciclosCompletos })}
            </Text>

            {/* A permissão de parar fica NA TELA durante a prática, não só no
                aviso do começo. Ela age no momento em que a pessoa precisa e
                desarma a sensação de que interromper é falhar — que é o que de
                fato protege alguém que acabou de ler algo pesado. */}
            <Text style={styles.stopAnytime}>{t('grounding.warning.stopAnytime')}</Text>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={encerrar}
              accessibilityRole="button"
            >
              <Ionicons name="stop" size={16} color={colors.textSecondary} />
              <Text style={styles.secondaryBtnText}>{t('grounding.stop')}</Text>
            </TouchableOpacity>

            {/* O som continua sendo o motor único do app (o contexto vive acima
                das abas): aqui é só o mesmo controle remoto. Nunca começa
                sozinho. */}
            <CosmicSoundPlayer variant="inline" />
          </>
        ) : etapa === 'fim' || etapa === 'parou' ? (
          // ---------------------------------------------------------------
          // DEPOIS — e os dois desfechos valem o mesmo
          // ---------------------------------------------------------------
          <View style={styles.card} testID="grounding-done">
            <Text style={styles.cardLabel}>
              {etapa === 'fim' ? t('grounding.done.title') : t('grounding.stopped.title')}
            </Text>
            <Text style={styles.body}>
              {etapa === 'fim' ? t('grounding.done.body') : t('grounding.stopped.body')}
            </Text>
            {etapa === 'fim' ? <Text style={styles.note}>{t('grounding.done.noCount')}</Text> : null}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() => setEtapa('setup')}
                accessibilityRole="button"
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('grounding.again')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryBtnText}>{t('grounding.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // ---------------------------------------------------------------
          // ANTES
          // ---------------------------------------------------------------
          <>
            {/* Aviso 1: o que esta tela é. Antes de qualquer outra coisa. */}
            <View style={styles.notice} testID="grounding-notice">
              <View style={styles.noticeRow}>
                <Ionicons name="information-circle" size={18} color={colors.gold} />
                <Text style={styles.noticeTitle}>{t('grounding.notice.title')}</Text>
              </View>
              <Text style={styles.noticeBody}>{t('grounding.notice.body')}</Text>
            </View>

            {/* Aviso 2: contraindicação, no padrão da Headspace — nomeia as
                condições e manda perguntar a um profissional. Repare no que
                ele NÃO faz: não descreve sintoma, não explica mecanismo, não
                se coloca como autoridade de saúde. Faz o oposto — aponta pra
                fora. É por isso que ele protege em vez de virar texto médico.
                E repare também que ansiedade aparece aqui como CAUTELA, não
                como público-alvo, ao contrário do que o setor inteiro vende. */}
            <View style={styles.warning} testID="grounding-warning">
              <View style={styles.noticeRow}>
                <Ionicons name="alert-circle" size={18} color={colors.amber} />
                <Text style={styles.warningTitle}>{t('grounding.warning.title')}</Text>
              </View>
              <Text style={styles.warningBody}>{t('grounding.warning.conditions')}</Text>
              <Text style={styles.warningStrong}>{t('grounding.warning.consult')}</Text>
              <Text style={styles.warningBody}>{t('grounding.warning.stopAnytime')}</Text>
            </View>

            {/* ---- Escolha do padrão ---- */}
            <Text style={styles.groupLabel}>{t('grounding.section.pattern')}</Text>
            {PADROES.map((p) => {
              const ativo = p.id === padraoId;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.option, ativo && styles.optionActive]}
                  activeOpacity={0.85}
                  onPress={() => setPadraoId(p.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: ativo }}
                  accessibilityLabel={t(padraoKey(p.id, 'name'))}
                  testID={`grounding-pattern-${p.id}`}
                >
                  <View style={styles.optionTop}>
                    <Text style={[styles.optionTitle, ativo && styles.optionTitleActive]}>
                      {t(padraoKey(p.id, 'name'))}
                    </Text>
                    <Text style={p.temRetencao ? styles.badgeHold : styles.badgeFree}>
                      {p.temRetencao ? t('grounding.badge.retention') : t('grounding.badge.noRetention')}
                    </Text>
                  </View>
                  <Text style={styles.optionRhythm}>{ritmoDoPadrao(p)}</Text>
                  <Text style={styles.body}>{t(padraoKey(p.id, 'rhythm'))}</Text>
                  <Text style={styles.note}>{t(padraoKey(p.id, 'about'))}</Text>
                  <Text style={styles.source}>{p.locus}</Text>
                  <Text style={styles.noteStrong}>{t(padraoKey(p.id, 'caution'))}</Text>
                </TouchableOpacity>
              );
            })}
            {padrao.temRetencao ? (
              <Text style={styles.noteStrong} testID="grounding-retention-note">
                {t('grounding.warning.retention')}
              </Text>
            ) : null}

            {/* ---- Escolha da duração ---- */}
            <Text style={styles.groupLabel}>{t('grounding.section.duration')}</Text>
            <View style={styles.row}>
              {DURACOES_MIN.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, m === minutos && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setMinutos(m)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: m === minutos }}
                  testID={`grounding-duration-${m}`}
                >
                  <Text style={[styles.chipText, m === minutos && styles.chipTextActive]}>
                    {t('grounding.duration.option', { min: m })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.note}>{t('grounding.duration.hint')}</Text>

            <TouchableOpacity
              style={styles.primaryBtnWide}
              activeOpacity={0.85}
              onPress={comecar}
              accessibilityRole="button"
              testID="grounding-start"
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('grounding.start')}</Text>
            </TouchableOpacity>

            {/* ---- Som (opcional, controle à mão) ---- */}
            <Text style={styles.groupLabel}>{t('grounding.sound.title')}</Text>
            <Text style={styles.note}>{t('grounding.sound.hint')}</Text>
            <CosmicSoundPlayer variant="inline" />

            {/* ---- O que a tradição associa a hoje ---- */}
            <View style={styles.card} testID="grounding-today">
              <Text style={styles.cardLabel}>{t('grounding.section.today')}</Text>
              {regente ? (
                <>
                  <Text style={styles.todayRuler}>
                    {guia.emoji} {t('grounding.today.ruler', { planet: t(regenteKey(regente.id, 'name')) })}
                  </Text>
                  {/* O sujeito da frase é sempre o PLANETA, nunca quem lê.
                      Ptolomeu descreve efeitos físicos e meteorológicos, não
                      estados de ânimo — "resfriar" e "aquecer" aplicados a uma
                      pessoa, ao lado de um exercício de respiração, leriam como
                      efeito fisiológico. A glosa atribui à tradição e a citação
                      fica ao lado, separada, como em lib/zodiacBody.js. */}
                  <Text style={styles.body}>{t(regenteKey(regente.id, 'quality'))}</Text>
                  <Text style={styles.quote}>«{regente.verbatim}»</Text>
                  <Text style={styles.source}>{PLANETAS_LOCUS}</Text>
                  {regente.temPonte ? (
                    <Text style={styles.note}>{t(regenteKey(regente.id, 'bridge'))}</Text>
                  ) : null}
                </>
              ) : null}
              <Text style={styles.note}>{t('grounding.today.week')}</Text>
              <Text style={styles.source}>{SEMANA_LOCUS}</Text>

              {guia.ceuDisponivel && guia.elemento ? (
                <>
                  <Text style={styles.todayMoon}>
                    {guia.emojiLua}{' '}
                    {t('grounding.today.moon', {
                      sign: guia.signoLua,
                      element: t(elementoKey(guia.elemento.id, 'name')),
                    })}
                  </Text>
                  <Text style={styles.body}>{t(elementoKey(guia.elemento.id, 'qualities'))}</Text>
                  <Text style={styles.source}>{ARISTOTELES_LOCUS}</Text>
                </>
              ) : (
                <Text style={styles.note}>{t('grounding.today.unavailable')}</Text>
              )}
            </View>

            {/* ---- A terra, e as ressalvas que a acompanham ---- */}
            <Section title={t('grounding.terra.title')} defaultOpen={guia.elementoTerra}>
              <Text style={styles.body}>{t('grounding.terra.triplicity')}</Text>
              <Text style={styles.source}>{TRIPLICIDADE_TERRA.locus}</Text>
              <Text style={styles.note}>{t('grounding.terra.divergence')}</Text>
              <Text style={styles.source}>{TRIPLICIDADE_TERRA.divergenciaLocus}</Text>
              {/* A ressalva vem no mesmo bloco, não no fim da tela: a síntese
                  "terra é fria e seca e estes são os signos de terra" não
                  existe inteira em fonte nenhuma, e quem lê a primeira frase
                  tem que ler esta. */}
              <Text style={styles.noteStrong}>{t('grounding.terra.synthesis')}</Text>
            </Section>

            {/* ---- O que a pesquisa não achou ---- */}
            <Section title={t('grounding.section.notFound')}>
              <Text style={styles.body}>{t('grounding.notFound.intro')}</Text>
              {NAO_ACHADO.map((id) => (
                <View key={id} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>?</Text>
                  <Text style={styles.bulletText}>{t(naoAchadoKey(id))}</Text>
                </View>
              ))}
            </Section>

            {/* ---- Fontes ---- */}
            <Section title={t('grounding.section.sources')}>
              {FONTES.map((f) => (
                <Text key={f} style={styles.source}>
                  · {f}
                </Text>
              ))}
            </Section>

            <Text style={styles.footerNotice}>{t('grounding.notice.footer')}</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// "4-4", "4-4-4-4", "4-7-8" — os números crus, do próprio padrão. Não é texto
// traduzível: é o ritmo, e ele é o mesmo em qualquer idioma.
function ritmoDoPadrao(p) {
  return ['inspira', 'seguraCheio', 'expira', 'seguraVazio']
    .map((f) => p.tempos[f])
    .filter((n) => n > 0)
    .join('-');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  notice: {
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.45)',
    padding: 14,
    gap: 6,
  },
  noticeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noticeTitle: { color: colors.gold, fontSize: 14, fontWeight: '800', flex: 1 },
  noticeBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  warning: {
    backgroundColor: 'rgba(255,184,77,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,184,77,0.5)',
    padding: 14,
    gap: 6,
  },
  warningTitle: { color: colors.amber, fontSize: 14, fontWeight: '800', flex: 1 },
  warningBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  warningStrong: { color: colors.amber, fontSize: 13, lineHeight: 19, fontWeight: '800' },

  footerNotice: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
  },

  groupLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },

  option: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 6,
  },
  optionActive: { borderColor: colors.teal, backgroundColor: 'rgba(92,224,216,0.08)' },
  optionTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  optionTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  optionTitleActive: { color: colors.teal },
  optionRhythm: { color: colors.purple, fontSize: 13, fontWeight: '700', letterSpacing: 1 },
  badgeHold: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(255,184,77,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },
  badgeFree: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '800',
    backgroundColor: 'rgba(95,217,140,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    overflow: 'hidden',
  },

  row: { flexDirection: 'row', gap: 10, alignItems: 'center', flexWrap: 'wrap' },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipActive: { borderColor: colors.teal, backgroundColor: 'rgba(92,224,216,0.12)' },
  chipText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  chipTextActive: { color: colors.teal },

  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  primaryBtnWide: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },

  remaining: { color: colors.text, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  cycles: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  stopAnytime: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  todayRuler: { color: colors.gold, fontSize: 18, fontWeight: '800' },
  todayMoon: { color: colors.teal, fontSize: 15, fontWeight: '700', marginTop: 6 },

  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  noteStrong: { color: colors.gold, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  quote: { color: colors.purple, fontSize: 12, fontStyle: 'italic', lineHeight: 19 },
  source: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },

  section: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },

  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletMark: { color: colors.amber, fontSize: 12, fontWeight: '800', width: 14, lineHeight: 19 },
  bulletText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
});
