// screens/ZodiacBodyScreen.js
// O HOMEM ZODIACAL — a tela de HISTÓRIA da astrologia médica medieval e
// renascentista (iatromatemática).
//
// ===========================================================================
// LEIA lib/zodiacBody.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// Regra do dono, resumida: descrever a tradição é seguro; aplicá-la a uma
// pessoa é conselho médico. Tudo no passado, tudo com fonte, nada no
// imperativo, nada que oriente o corpo de quem lê. Se uma frase pudesse fazer
// alguém MUDAR o que faz com o próprio corpo, ela está errada.
// test/zodiacBody.test.js falha o build quando isso é violado.
// ===========================================================================
//
// O QUE FAZ A TELA MUDAR SOZINHA: a Lua troca de signo a cada ~2,5 dias, e com
// ela troca a região do corpo que a tradição associava ao momento. É o mesmo
// relógio que os almanaques dobráveis dos sécs. XIV-XV usavam — só que aqui a
// posição vem de astronomia real (astronomy-engine, via moonSign de
// lib/signs.js), nunca de tabela inventada.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import ZodiacBody from '../components/ZodiacBody';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { recordActiveDay } from '../lib/streak';
import { localDayStr } from '../lib/localDay';
import {
  ZODIAC_BODY,
  PLANET_RULERSHIP,
  PLANET_RULERSHIP_LOCUS,
  HISTORY_BLOCKS,
  CULPEPER_QUOTES,
  CULPEPER_HERBS,
  MODERN_ADDITIONS,
  NOT_VERIFIED,
  SOURCES,
  entryById,
  entryForSign,
  moonBodyTransit,
  signKey,
  planetKey,
  historyKey,
  herbKey,
  modernKey,
  notVerifiedKey,
} from '../lib/zodiacBody';

// Visitar a tela conta como dia ativo — uma vez por dia local, mesmo padrão
// do "pensamento do dia" da Home (screens/HomeScreen.js): chamada direta a
// recordActiveDay() com uma chave de data no AsyncStorage pra não remarcar a
// cada foco. Nenhuma mecânica de retenção nova foi inventada aqui.
const ACTIVE_DAY_KEY = 'cosmic-zodiacbody-active-day';

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
        accessibilityLabel={`${title} — ${open ? t('zodiacBody.collapse') : t('zodiacBody.expand')}`}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

export default function ZodiacBodyScreen() {
  const navigation = useNavigation();
  const { t, lang } = useLanguage();
  const { coupleData, soloSign } = useCouple();

  const [selectedId, setSelectedId] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  // Mesmo motivo do Calendário Lunar: a tela fica montada dentro da stack da
  // aba, então "agora" precisa ser recalculado no foco E quando o app volta do
  // background — senão a Lua fica congelada na posição da primeira montagem e
  // a tela mente sobre o dia de hoje.
  useFocusEffect(
    useCallback(() => {
      setRefreshTick((n) => n + 1);
      const sub = AppState.addEventListener('change', (next) => {
        if (next === 'active') setRefreshTick((n) => n + 1);
      });
      return () => sub.remove();
    }, [])
  );

  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(ACTIVE_DAY_KEY)
      .then((last) => {
        if (!alive) return;
        const day = localDayStr();
        if (last === day) return;
        AsyncStorage.setItem(ACTIVE_DAY_KEY, day).catch(() => {});
        recordActiveDay();
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // ~90 cálculos O(1) de posição lunar (varredura de hora + bisseção) — barato,
  // mas só refaz quando o dia/foco muda, nunca a cada re-render.
  const transit = useMemo(() => moonBodyTransit(new Date()), [refreshTick]);

  // Signo solar: a MESMA fonte que a Home usa (signo do casal quando existe,
  // senão o solo). Sem fallback pro primeiro signo da lista — aqui, ao
  // contrário da Home, mostrar Áries pra quem não informou nada seria afirmar
  // um dado que não temos.
  const sunSignName = coupleData?.sa || soloSign?.name || null;
  const sunEntry = sunSignName ? entryForSign(sunSignName) : null;

  const moonEntry = transit && transit.entry ? transit.entry : null;
  const active = entryById(selectedId) || moonEntry || sunEntry || ZODIAC_BODY[0];

  const dateLocale = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'pt-BR';

  const duration = useMemo(() => {
    if (!transit || transit.msUntilChange == null) return null;
    const totalH = Math.max(0, Math.round(transit.msUntilChange / (3600 * 1000)));
    const d = Math.floor(totalH / 24);
    const h = totalH % 24;
    return d > 0 ? t('zodiacBody.moon.durDH', { d, h }) : t('zodiacBody.moon.durH', { h });
  }, [transit, t]);

  const changesAtLabel = useMemo(() => {
    if (!transit || !transit.changesAt) return null;
    try {
      return transit.changesAt.toLocaleString(dateLocale, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return null;
    }
  }, [transit, dateLocale]);

  const signName = (id) => t(signKey(id, 'name'));

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('zodiacBody.title')}
        subtitle={t('zodiacBody.subtitle')}
        onBack={() => navigation.goBack()}
        gradient={gradients.purple}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* O aviso vem ANTES de qualquer conteúdo histórico, não no rodapé —
            quem lê metade da tela e sai tem que ter visto este parágrafo. */}
        <View style={styles.notice} testID="zodiacbody-notice">
          <View style={styles.noticeRow}>
            <Ionicons name="information-circle" size={18} color={colors.gold} />
            <Text style={styles.noticeTitle}>{t('zodiacBody.notice.title')}</Text>
          </View>
          <Text style={styles.noticeBody}>{t('zodiacBody.notice.body')}</Text>
        </View>

        {/* ---- A Lua caminhando pelo corpo ---- */}
        <View style={styles.card} testID="zodiacbody-moon">
          <Text style={styles.cardLabel}>{t('zodiacBody.moon.title')}</Text>
          {transit && moonEntry ? (
            <>
              <Text style={styles.moonSign}>
                {transit.sign.emoji} {signName(moonEntry.id)}
              </Text>
              <Text style={styles.moonPart}>
                {t('zodiacBody.moon.part', {
                  sign: signName(moonEntry.id),
                  part: t(signKey(moonEntry.id, 'part')),
                })}
              </Text>
              <Text style={styles.latin}>«{moonEntry.latin}»</Text>
              <Text style={styles.source}>
                {t('zodiacBody.author.manilius')}, {moonEntry.locus} · {t('zodiacBody.manilius.when')}
              </Text>
              {transit.nextEntry && duration ? (
                <Text style={styles.moonNext}>
                  {t('zodiacBody.moon.changes', {
                    sign: signName(transit.nextEntry.id),
                    part: t(signKey(transit.nextEntry.id, 'part')),
                    duration,
                  })}
                  {changesAtLabel ? ` (${changesAtLabel})` : ''}
                </Text>
              ) : null}
              <Text style={styles.moonRate}>{t('zodiacBody.moon.rate')}</Text>
              <Text style={styles.moonPractice}>{t('zodiacBody.moon.practice')}</Text>
            </>
          ) : (
            <Text style={styles.moonPart}>{t('zodiacBody.moon.unavailable')}</Text>
          )}
        </View>

        {/* ---- A figura ---- */}
        <Text style={styles.figureHint}>{t('zodiacBody.figure.hint')}</Text>
        <ZodiacBody
          selectedId={active ? active.id : null}
          onSelect={setSelectedId}
          sunSignId={sunEntry ? sunEntry.id : null}
          moonSignId={moonEntry ? moonEntry.id : null}
        />
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: colors.text }]} />
            <Text style={styles.legendText}>{t('zodiacBody.figure.legendSun')}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { borderColor: colors.gold, backgroundColor: 'rgba(255,200,92,0.25)' }]} />
            <Text style={styles.legendText}>{t('zodiacBody.figure.legendMoon')}</Text>
          </View>
        </View>

        {/* ---- O verbete do signo selecionado ---- */}
        {active ? (
          <View style={styles.card} testID="zodiacbody-entry">
            <Text style={styles.cardLabel}>{t('zodiacBody.entry.label')}</Text>
            <Text style={styles.entryTitle}>
              {active.emoji} {signName(active.id)} · {t(signKey(active.id, 'part'))}
            </Text>
            <Text style={styles.latin}>«{active.latin}»</Text>
            <Text style={styles.gloss}>{t(signKey(active.id, 'gloss'))}</Text>
            <Text style={styles.source}>
              {t('zodiacBody.author.manilius')}, {active.locus} · {t('zodiacBody.manilius.when')}
            </Text>
            {active.lateLayer ? (
              <View style={styles.flag}>
                <Text style={styles.flagText}>{t('zodiacBody.entry.flagLateLayer')}</Text>
              </View>
            ) : null}
            <Text style={styles.noteLabel}>{t('zodiacBody.entry.noteLabel')}</Text>
            <Text style={styles.note}>{t(signKey(active.id, 'note'))}</Text>
          </View>
        ) : null}

        {/* ---- O signo solar de quem está lendo ---- */}
        <View style={styles.card} testID="zodiacbody-sun">
          <Text style={styles.cardLabel}>{t('zodiacBody.sun.title')}</Text>
          {sunEntry ? (
            <>
              <Text style={styles.entryTitle}>
                {sunEntry.emoji} {signName(sunEntry.id)} · {t(signKey(sunEntry.id, 'part'))}
              </Text>
              <Text style={styles.gloss}>
                {t('zodiacBody.sun.body', {
                  sign: signName(sunEntry.id),
                  part: t(signKey(sunEntry.id, 'part')),
                })}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.gloss}>{t('zodiacBody.sun.none')}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate(ROUTES.QUIZ)}
                activeOpacity={0.8}
                accessibilityRole="button"
                style={styles.cta}
              >
                <Text style={styles.ctaText}>{t('zodiacBody.sun.noneCta')}</Text>
              </TouchableOpacity>
            </>
          )}
          {/* A ressalva é o ponto mais importante deste cartão: a tradição não
              lia o corpo pelo signo de nascimento. */}
          <Text style={styles.note}>{t('zodiacBody.sun.caveat')}</Text>
        </View>

        {/* ---- Regência planetária (Ptolomeu) ---- */}
        <Section title={t('zodiacBody.section.planets')}>
          <Text style={styles.paragraph}>{t('zodiacBody.planets.intro')}</Text>
          {PLANET_RULERSHIP.map((p) => (
            <View key={p.id} style={styles.planetRow}>
              <Text style={styles.planetSymbol}>{p.symbol}</Text>
              <View style={styles.planetTexts}>
                <Text style={styles.planetName}>{t(planetKey(p.id, 'name'))}</Text>
                <Text style={styles.planetParts}>{t(planetKey(p.id, 'parts'))}</Text>
                {p.hasNote ? <Text style={styles.note}>{t(planetKey(p.id, 'note'))}</Text> : null}
              </View>
            </View>
          ))}
          <Text style={styles.source}>
            {t('zodiacBody.author.ptolemy')}, {PLANET_RULERSHIP_LOCUS}
          </Text>
          <Text style={styles.paragraph}>{t('zodiacBody.planets.qualities')}</Text>
          <Text style={styles.note}>{t('zodiacBody.planets.humours')}</Text>
        </Section>

        {/* ---- A história ---- */}
        <Section title={t('zodiacBody.section.history')}>
          {HISTORY_BLOCKS.map((b) => (
            <View key={b.id} style={styles.block}>
              <Text style={styles.blockTitle}>{t(historyKey(b.id, 'title'))}</Text>
              <Text style={styles.paragraph}>{t(historyKey(b.id, 'body'))}</Text>
              {b.latin ? <Text style={styles.latin}>«{b.latin}»</Text> : null}
              {b.english ? <Text style={styles.latin}>«{b.english}»</Text> : null}
              {b.locus ? <Text style={styles.source}>{b.locus}</Text> : null}
              {b.confidence === 'media' ? (
                <Text style={styles.note}>{t('zodiacBody.confidence.media')}</Text>
              ) : null}
            </View>
          ))}
        </Section>

        {/* ---- Culpeper ---- */}
        <Section title={t('zodiacBody.section.culpeper')}>
          <Text style={styles.paragraph}>{t('zodiacBody.culpeper.who')}</Text>
          <Text style={styles.paragraph}>{t('zodiacBody.culpeper.method')}</Text>
          <Text style={styles.quote}>«{CULPEPER_QUOTES.method}»</Text>
          <Text style={styles.quote}>«{CULPEPER_QUOTES.pattern}»</Text>
          <Text style={styles.paragraph}>{t('zodiacBody.culpeper.chain')}</Text>
          <Text style={styles.quote}>«{CULPEPER_QUOTES.chain}»</Text>
          <Text style={styles.paragraph}>{t('zodiacBody.culpeper.antipathy')}</Text>
          <Text style={styles.quote}>«{CULPEPER_QUOTES.antipathy}»</Text>
          <Text style={styles.blockTitle}>{t('zodiacBody.culpeper.examplesLabel')}</Text>
          {CULPEPER_HERBS.map((h) => (
            <View key={h.id} style={styles.herbRow}>
              <Text style={styles.herbName}>{t(herbKey(h.id))}</Text>
              <Text style={styles.quote}>«{h.quote}»</Text>
            </View>
          ))}
          <Text style={styles.paragraph}>{t('zodiacBody.culpeper.politics')}</Text>
          <Text style={styles.quote}>«{CULPEPER_QUOTES.politics}»</Text>
          <Text style={styles.source}>
            {t('zodiacBody.author.culpeper')}, The Complete Herbal, 1653
          </Text>
          {/* Sem esta linha o bloco inteiro vira catálogo de uso. Com ela, é o
              que é: registro do que um autor escreveu em 1653. */}
          <Text style={styles.noteStrong}>{t('zodiacBody.culpeper.warning')}</Text>
        </Section>

        {/* ---- O que NÃO é da tradição ---- */}
        <Section title={t('zodiacBody.section.modern')}>
          <Text style={styles.paragraph}>{t('zodiacBody.modern.intro')}</Text>
          {MODERN_ADDITIONS.map((id) => (
            <View key={id} style={styles.bulletRow}>
              <Text style={styles.bulletMark}>✕</Text>
              <Text style={styles.bulletText}>{t(modernKey(id))}</Text>
            </View>
          ))}
        </Section>

        {/* ---- O que a pesquisa não conseguiu confirmar ---- */}
        <Section title={t('zodiacBody.section.notVerified')}>
          <Text style={styles.paragraph}>{t('zodiacBody.notVerified.intro')}</Text>
          {NOT_VERIFIED.map((id) => (
            <View key={id} style={styles.bulletRow}>
              <Text style={styles.bulletMark}>?</Text>
              <Text style={styles.bulletText}>{t(notVerifiedKey(id))}</Text>
            </View>
          ))}
        </Section>

        {/* ---- Bibliografia ---- */}
        <Section title={t('zodiacBody.section.sources')}>
          {SOURCES.map((s) => (
            <Text key={s} style={styles.source}>
              · {s}
            </Text>
          ))}
        </Section>

        <Text style={styles.footerNotice}>{t('zodiacBody.notice.footer')}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 14 },

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
  footerNotice: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 8,
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

  moonSign: { color: colors.gold, fontSize: 22, fontWeight: '800' },
  moonPart: { color: colors.text, fontSize: 15, lineHeight: 22 },
  moonNext: { color: colors.teal, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  moonRate: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  moonPractice: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  figureHint: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  legendText: { color: colors.textMuted, fontSize: 11 },

  entryTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  latin: { color: colors.purple, fontSize: 13, fontStyle: 'italic', lineHeight: 20 },
  gloss: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  source: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  noteLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  noteStrong: {
    color: colors.gold,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  flag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,184,77,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flagText: { color: colors.amber, fontSize: 11, fontWeight: '700' },

  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ctaText: { color: '#fff', fontSize: 13, fontWeight: '800' },

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

  paragraph: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  quote: { color: colors.purple, fontSize: 12, fontStyle: 'italic', lineHeight: 19 },
  block: { gap: 6, paddingBottom: 6 },
  blockTitle: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 4 },

  planetRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  planetSymbol: { color: colors.gold, fontSize: 20, width: 24, textAlign: 'center' },
  planetTexts: { flex: 1, gap: 3 },
  planetName: { color: colors.text, fontSize: 13, fontWeight: '800' },
  planetParts: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  herbRow: { gap: 3 },
  herbName: { color: colors.text, fontSize: 12, fontWeight: '800' },

  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletMark: { color: colors.red, fontSize: 12, fontWeight: '800', width: 14, lineHeight: 19 },
  bulletText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
});
