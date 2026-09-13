// ALINHE SEU CÉU — assinatura gestual do Cosmic Guide.
//
// A tela não calcula astrologia e o gesto não altera nenhum dado: o nascimento
// vem da porta única do app, buildSkyAlignment fixa o céu num instante UTC e o
// palco apenas revela o resultado que já estava calculado. Se não houver
// aspecto próximo, o mesmo gesto revela o próximo evento real da efeméride.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';
import { getAnyBirthData } from '../lib/birthData';
import { buildSkyAlignment } from '../lib/skyAlignment';
import CosmicScene from '../components/CosmicScene';
import GradientHeader from '../components/GradientHeader';
import PremiumCosmicCard from '../components/PremiumCosmicCard';
import SkyAlignmentStage from '../components/SkyAlignmentStage';
// AS PECAS DE DIAGRAMACAO (design/PECAS-DE-DIAGRAMACAO.md, lote de acao
// 12/09/2026). Esta tela ja tinha composicao no topo (titulo em serifa grande
// + o palco), mas TUDO corria sobre o mesmo chao: convite, gesto e recibo
// empilhados, e o recibo — que e a ficha de rotulo->valor mais literal do app
// inteiro — era desenhado na mao com Ionicon + dois Text. A tabela de dados
// existe exatamente pra isso, e ela ja traz a lei de nao fabricar embutida
// (linha sem valor SOME, nunca traco mudo).
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import TabelaDados from '../components/TabelaDados';
import {
  buildCosmicShareCardContent,
  cosmicShareCardPack,
  sharePremiumCosmicCard,
} from '../lib/cosmicShareCard';

const LOCALES = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };

const PLANET_GLYPHS = Object.freeze({
  Sol: '☉',
  Lua: '☽',
  Mercúrio: '☿',
  Vênus: '♀',
  Marte: '♂',
  Júpiter: '♃',
  Saturno: '♄',
  Urano: '♅',
  Netuno: '♆',
  Plutão: '♇',
});

const ASPECT_GLYPHS = Object.freeze({
  Conjunção: '☌',
  Sextil: '⚹',
  Quadratura: '□',
  Trígono: '△',
  Oposição: '☍',
});

function localeFor(lang) {
  return LOCALES[lang] || LOCALES.pt;
}

function dateOnlyLabel(value, lang) {
  if (typeof value !== 'string') return '';
  const parsed = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  try {
    return parsed.toLocaleDateString(localeFor(lang), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return value;
  }
}

function instantLabel(value, lang) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value || '';
  try {
    return parsed.toLocaleString(localeFor(lang), {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
      timeZoneName: 'short',
    });
  } catch {
    return parsed.toISOString().replace('T', ' ').slice(0, 16) + ' UTC';
  }
}

function utcOffsetLabel(value) {
  const offset = Number(value);
  if (!Number.isFinite(offset)) return 'UTC';
  const totalMinutes = Math.round(Math.abs(offset) * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const sign = offset >= 0 ? '+' : '−';
  return `UTC${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function degreeLabel(value, lang) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '—';
  try {
    return number.toLocaleString(localeFor(lang), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return number.toFixed(2);
  }
}

function diskItems(positions, highlightedPlanet, highlightColor) {
  if (!Array.isArray(positions)) return [];
  return positions.map((position) => ({
    id: position.planet,
    glyph: PLANET_GLYPHS[position.planet] || '•',
    longitude: position.longitude,
    color: position.planet === highlightedPlanet ? highlightColor : '#A99BAB',
  }));
}

function PrimaryAction({ icon, label, onPress, testID }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.actionShell, pressed && styles.pressed]}
      testID={testID}
    >
      <LinearGradient
        colors={gradients.gold}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.action}
      >
        <Ionicons name={icon} size={17} color="#21151A" />
        <Text style={styles.actionText}>{label}</Text>
        <Ionicons name="arrow-forward" size={17} color="#21151A" />
      </LinearGradient>
    </Pressable>
  );
}

function StateCard({ icon, title, body, actionLabel, onAction, loading, testID }) {
  return (
    <View style={styles.stateCard} testID={testID}>
      <View style={styles.stateIcon}>
        {loading ? (
          <ActivityIndicator color={colors.gold} />
        ) : (
          <Ionicons name={icon} size={24} color={colors.gold} />
        )}
      </View>
      <Text style={styles.stateTitle}>{title}</Text>
      {!!body && <Text style={styles.stateBody}>{body}</Text>}
      {!!actionLabel && !!onAction && (
        <PrimaryAction
          icon={icon}
          label={actionLabel}
          onPress={onAction}
          testID={`${testID}-action`}
        />
      )}
    </View>
  );
}

export default function SkyAlignmentScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { lang, t } = useLanguage();
  const [snapshot, setSnapshot] = useState({ loading: true, result: null });
  const [revealed, setRevealed] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);
  const [shareStatus, setShareStatus] = useState('idle');
  const [retryKey, setRetryKey] = useState(0);
  const appStateRef = useRef(AppState.currentState);
  const calculatedMinuteRef = useRef(null);
  const shareCardRef = useRef(null);
  const sharePack = useMemo(() => cosmicShareCardPack(lang), [lang]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setSnapshot({ loading: true, result: null });
      setRevealed(false);
      setSourcesExpanded(false);
      setShareStatus('idle');

      getAnyBirthData().then((birth) => {
        if (!active) return;
        const instantISO = new Date().toISOString();
        calculatedMinuteRef.current = instantISO.slice(0, 16);
        let result;
        try {
          result = buildSkyAlignment({ birth, instantISO, lang });
        } catch {
          result = { status: 'unavailable', reason: 'unexpected_error', calculatedAt: instantISO };
        }
        if (active) setSnapshot({ loading: false, result });
      }).catch(() => {
        if (active) {
          setSnapshot({
            loading: false,
            result: { status: 'unavailable', reason: 'birth_storage_unavailable' },
          });
        }
      });

      return () => {
        active = false;
      };
    }, [lang, retryKey])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      if (
        isFocused
        && nextState === 'active'
        && (previousState === 'inactive' || previousState === 'background')
      ) {
        const currentMinute = new Date().toISOString().slice(0, 16);
        if (currentMinute !== calculatedMinuteRef.current) {
          setRetryKey((value) => value + 1);
        }
      }
    });
    return () => subscription.remove();
  }, [isFocused]);

  const result = snapshot.result;
  const hasSky = result?.status === 'aspect' || result?.status === 'next_event';
  const encounter = result?.encounter;

  const stagePositions = useMemo(() => {
    if (!result?.positions) return null;
    return {
      myMap: {
        centerGlyph: '✦',
        accentColor: colors.purple,
        items: diskItems(result.positions.natal, encounter?.natalPlanet, colors.purple),
      },
      currentSky: {
        centerGlyph: '☉',
        accentColor: colors.gold,
        items: diskItems(result.positions.current, encounter?.transitPlanet, colors.gold),
      },
    };
  }, [result?.positions, encounter?.natalPlanet, encounter?.transitPlanet]);

  const nextEventDate = result?.fallbackEvent?.instantISO
    ? instantLabel(result.fallbackEvent.instantISO, lang)
    : '';

  const stageEncounter = useMemo(() => {
    if (result?.status === 'aspect' && encounter) {
      return {
        glyph: ASPECT_GLYPHS[encounter.aspectType] || '✦',
        title: encounter.content?.callout,
        subtitle: encounter.content?.shortLine,
        accentColor: colors.gold,
      };
    }
    if (result?.status === 'next_event' && result.fallbackEvent) {
      return {
        glyph: result.fallbackEvent.emoji || '✦',
        title: t('alignment.noAspect.title'),
        subtitle: `${t('alignment.noAspect.body')}\n\n${result.fallbackEvent.title} · ${nextEventDate}`,
        accentColor: colors.teal,
      };
    }
    return null;
  }, [encounter, nextEventDate, result, t]);

  const receipt = result?.receipt;
  const dataUsed = receipt?.dataUsed;
  const birthDate = dateOnlyLabel(dataUsed?.birthDate, lang);
  const skyDate = instantLabel(dataUsed?.ephemerisMinuteUTC, lang);
  const birthLocation = dataUsed?.birthLocation || utcOffsetLabel(dataUsed?.utcOffsetHours);
  const exactData = result?.dataQuality?.mode === 'exact_birth_moment';
  const fixedOffsetData = result?.dataQuality?.mode === 'fixed_offset_birth_moment';
  const dataValue = dataUsed
    ? exactData
      ? t('alignment.receipt.dataExact', {
          birthDate,
          birthTime: dataUsed.birthTime,
          city: birthLocation,
          skyDate,
        })
      : fixedOffsetData
        ? t('alignment.receipt.dataFixedOffset', {
            birthDate,
            birthTime: dataUsed.birthTime,
            offset: utcOffsetLabel(dataUsed.utcOffsetHours),
            skyDate,
          })
        : t('alignment.receipt.dataDateOnly', { birthDate, skyDate })
    : '';

  const calculationValue = result?.status === 'aspect' && encounter
    ? `${t('alignment.receipt.calculationValue', {
        transit: encounter.transitPlanetLabel,
        natal: encounter.natalPlanetLabel,
        aspect: encounter.aspectLabel,
        angle: receipt?.calculation?.aspectAngle,
      })}\n${receipt?.calculationEngine || ''}`
    : result?.status === 'next_event' && result.fallbackEvent
      ? `${t('alignment.receipt.eventCalculationValue', {
          event: result.fallbackEvent.title,
          date: nextEventDate,
        })}\n${receipt?.calculationEngine || ''}`
      : '';

  const aspectValue = encounter
    ? `${encounter.aspectLabel} · ${encounter.phaseLabel}`
    : '';
  const orbValue = encounter
    ? t('alignment.receipt.orbValue', {
        orb: degreeLabel(encounter.orbDegrees, lang),
        limit: degreeLabel(encounter.orbLimitDegrees, lang),
      })
    : '';
  const sourceDetails = Array.isArray(receipt?.sources)
    ? receipt.sources.filter(Boolean).join('\n\n')
    : receipt?.sources || '';
  const sourceValue = result?.status === 'aspect'
    ? t('alignment.receipt.sourceValue')
    : sourceDetails;
  const completeSourceDetails = result?.status === 'aspect'
    ? [sourceDetails, receipt?.limits?.orbConvention].filter(Boolean).join('\n\n')
    : '';
  const limitValue = [
    t('alignment.receipt.limitValue'),
    result?.status === 'aspect' ? t('alignment.receipt.orbConventionShort') : null,
  ].filter(Boolean).join('\n\n');

  const nextAction = result?.status === 'next_event'
    ? {
        icon: 'calendar-outline',
        label: t('alignment.action.calendar'),
        route: ROUTES.CALENDARIO_COSMICO,
      }
    : exactData
      ? {
          icon: 'book-outline',
          label: t('alignment.action.diary'),
          route: ROUTES.DIARY,
        }
      : {
          icon: 'compass-outline',
          label: t('alignment.action.map'),
          route: ROUTES.BIRTH_CHART,
        };

  const shareCardContent = useMemo(() => {
    if (!hasSky) return null;

    if (result?.status === 'aspect' && encounter) {
      const title = encounter.content?.callout
        || `${encounter.transitPlanetLabel} · ${encounter.aspectLabel} · ${encounter.natalPlanetLabel}`;
      const detail = sharePack.aspectDetail({
        transit: encounter.transitPlanetLabel,
        aspect: encounter.aspectLabel,
        natal: encounter.natalPlanetLabel,
      });
      return buildCosmicShareCardContent({
        brand: sharePack.brand,
        edition: sharePack.edition,
        eyebrow: sharePack.alignmentEyebrow,
        glyph: stageEncounter?.glyph,
        title,
        subtitle: encounter.content?.shortLine,
        detail,
        meta: sharePack.aspectMeta({
          phase: encounter.phaseLabel,
          orb: degreeLabel(encounter.orbDegrees, lang),
        }),
        footer: sharePack.footer,
        shareText: sharePack.shareText({ title, detail }),
        fileName: sharePack.fileName,
      });
    }

    if (result?.status === 'next_event' && result.fallbackEvent) {
      const title = result.fallbackEvent.title;
      const detail = sharePack.nextEventDetail({ date: nextEventDate });
      return buildCosmicShareCardContent({
        brand: sharePack.brand,
        edition: sharePack.edition,
        eyebrow: sharePack.alignmentEyebrow,
        glyph: stageEncounter?.glyph,
        title,
        subtitle: t('alignment.noAspect.body'),
        detail,
        meta: sharePack.nextEventMeta,
        footer: sharePack.footer,
        shareText: sharePack.shareText({ title, detail }),
        fileName: sharePack.fileName,
      });
    }

    return null;
  }, [encounter, hasSky, lang, nextEventDate, result, sharePack, stageEncounter?.glyph, t]);

  const handleShareCard = useCallback(async () => {
    if (!shareCardContent || shareStatus === 'preparing') return;
    setShareStatus('preparing');
    try {
      const outcome = await sharePremiumCosmicCard({
        cardRef: shareCardRef,
        content: shareCardContent,
        dialogTitle: sharePack.dialogTitle,
      });
      if (outcome?.status === 'cancelled') {
        setShareStatus('idle');
      } else if (outcome?.status === 'shared' || outcome?.status === 'downloaded') {
        setShareStatus(outcome.status);
      } else {
        setShareStatus('unavailable');
      }
    } catch {
      setShareStatus('unavailable');
    }
  }, [shareCardContent, sharePack.dialogTitle, shareStatus]);

  const shareFeedback = shareStatus === 'shared'
    ? sharePack.shared
    : shareStatus === 'downloaded'
      ? sharePack.downloaded
      : shareStatus === 'unavailable'
        ? sharePack.unavailable
        : '';
  const shareBusy = shareStatus === 'preparing';

  return (
    <View style={styles.root}>
      <CosmicScene waves={false} />
      <GradientHeader
        title={t('alignment.header.title')}
        onBack={() => navigation.goBack()}
        gradient={gradients.hero}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        testID="sky-alignment-scroll"
      >
        {/* FAIXA 1 — O CONVITE E O GESTO. Uma faixa `noite` que abre a
            tela e vai ate o palco: convite, instrucao e o arrastar sao uma
            coisa so. Fica `rasa` enquanto nao ha ceu (carregando, sem
            nascimento, erro): com um cartao de estado dentro, a caixa cheia
            da onda seria mais chao de cor do que conteudo. */}
        <FaixaCurva
          tom="noite"
          semente="convite"
          rasa={!hasSky}
          style={styles.faixa}
          estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}
        >
        <View style={styles.intro}>
          <Text style={styles.title}>{t('alignment.title')}</Text>
          <ColunaLeitura>
            <Text style={styles.body}>{t('alignment.body')}</Text>
          </ColunaLeitura>
        </View>

        {snapshot.loading && (
          <StateCard
            loading
            icon="sparkles-outline"
            title={t('alignment.loading')}
            testID="sky-alignment-loading"
          />
        )}

        {!snapshot.loading && result?.status === 'needs_birth' && (
          <StateCard
            icon="compass-outline"
            title={t('alignment.missing.title')}
            body={t('alignment.missing.body')}
            actionLabel={t('alignment.missing.cta')}
            onAction={() => navigation.navigate(ROUTES.BIRTH_CHART)}
            testID="sky-alignment-needs-birth"
          />
        )}

        {!snapshot.loading && result?.status === 'unavailable' && (
          <StateCard
            icon="refresh-outline"
            title={t('alignment.error.title')}
            body={t('alignment.error.body')}
            actionLabel={t('alignment.error.retry')}
            onAction={() => setRetryKey((value) => value + 1)}
            testID="sky-alignment-unavailable"
          />
        )}

        {!snapshot.loading && hasSky && stagePositions && stageEncounter && (
            <SkyAlignmentStage
              positions={stagePositions}
              encounter={stageEncounter}
              onAligned={() => setRevealed(true)}
              resetKey={`${result.calculatedAt}-${result.status}`}
              fallbackLabel={t('alignment.manual')}
              labels={{
                instruction: t('alignment.instruction'),
                myMap: t('alignment.disk.natal'),
                currentSky: t('alignment.disk.current'),
                fallback: t('alignment.manual'),
                statusIdle: t('alignment.status.idle'),
                statusDragging: t('alignment.status.dragging'),
                statusMagnetic: t('alignment.status.magnetic'),
                statusAligned: t('alignment.live'),
                dragAccessibilityLabel: t('alignment.dragA11y'),
                dragAccessibilityHint: t('alignment.dragHint'),
                accessibilityAction: t('alignment.manual'),
                encounterEyebrow: result.status === 'aspect'
                  ? t('alignment.result.eyebrow')
                  : t('alignment.nextEvent.eyebrow'),
              }}
              testID="sky-alignment-stage"
            />
        )}
        </FaixaCurva>

        {/* FAIXA 2 — O RECIBO. So existe depois do gesto, e e outro assunto:
            sai de "faca" e entra em "de onde isto veio". O dourado e o acento
            quente da casa — a prova de origem e o que a tela tem de mais
            valioso, e ela merece chao proprio. */}
        {revealed && receipt && hasSky && (
          <FaixaCurva tom="dourado" semente="recibo" grude="noite" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
              <View
                accessibilityLiveRegion="polite"
                style={styles.receipt}
                testID="sky-alignment-receipt"
              >
                <View style={styles.receiptHeader}>
                  <View style={styles.receiptSeal}>
                    <Ionicons name="finger-print-outline" size={20} color={colors.gold} />
                  </View>
                  <Text style={styles.receiptTitle}>{t('alignment.receipt.title')}</Text>
                </View>

                {/* A FICHA. Antes eram seis ReceiptRow desenhados na mao,
                    cada um com um `if (!value) return null` proprio; agora e
                    UMA tabela e o filtro e da peca (lib/filtroDado.js): linha
                    sem valor e sem convite simplesmente nao existe. Vem em
                    dois pedacos de proposito — o aviso sobre a qualidade do
                    dado precisa aparecer COLADO na linha do dado, nao no pe
                    da ficha. */}
                {/* CADA LINHA CONTINUA COM O SEU testID LITERAL, numa View
                    em volta. Nao e enfeite: test/storeMetadata.test.js e
                    test/skyAlignmentScreen.test.js procuram a string
                    testID="sky-alignment-receipt-orb" NO CODIGO-FONTE, e e
                    ela que ancora um claim ja publicado na ficha da Play
                    Store. Um nome montado em runtime (`${testID}-${chave}`)
                    nao aparece num grep de fonte e apagaria essa evidencia.
                    A View e de custo zero e preserva a prova.
                    E cada tabela e uma linha so, ou um grupo: a ficha vem
                    partida de proposito — o aviso sobre a qualidade do dado
                    precisa aparecer COLADO na linha do dado, nao no pe. */}
                <View testID="sky-alignment-receipt-data">
                  <TabelaDados
                    itens={[{ chave: 'data', rotulo: t('alignment.receipt.data'), valor: dataValue }]}
                    testID="sky-alignment-receipt-ficha"
                  />
                </View>
                {!exactData && !fixedOffsetData && (
                  <Text style={styles.warning}>{t('alignment.receipt.warningDateOnly')}</Text>
                )}
                {fixedOffsetData && (
                  <Text style={styles.warning}>{t('alignment.receipt.warningFixedOffset')}</Text>
                )}
                {result.dataQuality?.warnings?.includes('birth_time_ignored_without_timezone') && (
                  <Text style={styles.warning}>{t('alignment.receipt.warningNoLocation')}</Text>
                )}
                <View testID="sky-alignment-receipt-calculation">
                  <TabelaDados
                    itens={[{ chave: 'calculation', rotulo: t('alignment.receipt.calculation'), valor: calculationValue }]}
                    testID="sky-alignment-receipt-calculo"
                  />
                </View>
                <View testID="sky-alignment-receipt-aspect">
                  <TabelaDados
                    itens={[{ chave: 'aspect', rotulo: t('alignment.receipt.aspect'), valor: aspectValue }]}
                    testID="sky-alignment-receipt-asp"
                  />
                </View>
                <View testID="sky-alignment-receipt-orb">
                  <TabelaDados
                    itens={[{ chave: 'orb', rotulo: t('alignment.receipt.orb'), valor: orbValue }]}
                    testID="sky-alignment-receipt-orbe"
                  />
                </View>
                <View testID="sky-alignment-receipt-source">
                  <TabelaDados
                    itens={[{ chave: 'source', rotulo: t('alignment.receipt.source'), valor: sourceValue }]}
                    testID="sky-alignment-receipt-fonte"
                  />
                </View>
                {!!completeSourceDetails && (
                  <>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ expanded: sourcesExpanded }}
                      onPress={() => setSourcesExpanded((value) => !value)}
                      style={({ pressed }) => [
                        styles.sourceDisclosure,
                        pressed && styles.pressed,
                      ]}
                      testID="sky-alignment-source-toggle"
                    >
                      <Text style={styles.sourceDisclosureText}>
                        {t(sourcesExpanded
                          ? 'alignment.receipt.sourcesHide'
                          : 'alignment.receipt.sourcesShow')}
                      </Text>
                      <Ionicons
                        name={sourcesExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.gold}
                      />
                    </Pressable>
                    {sourcesExpanded && (
                      <Text
                        selectable
                        style={styles.sourceDetails}
                        testID="sky-alignment-source-details"
                      >
                        {completeSourceDetails}
                      </Text>
                    )}
                  </>
                )}
                <View testID="sky-alignment-receipt-limit">
                  <TabelaDados
                    itens={[{ chave: 'limit', rotulo: t('alignment.receipt.limit'), valor: limitValue }]}
                    testID="sky-alignment-receipt-limites"
                  />
                </View>

                {shareCardContent ? (
                  <View style={styles.shareSection} testID="sky-alignment-share-card-section">
                    <View style={styles.shareHeader}>
                      <View style={styles.shareSeal}>
                        <Ionicons name="image-outline" size={18} color={colors.gold} />
                      </View>
                      <View style={styles.shareHeaderCopy}>
                        <Text style={styles.shareTitle}>{sharePack.shareTitle}</Text>
                        <Text style={styles.shareBody}>{sharePack.shareBody}</Text>
                      </View>
                    </View>

                    <PremiumCosmicCard
                      ref={shareCardRef}
                      content={shareCardContent}
                      style={styles.sharePreview}
                      testID="sky-alignment-share-card-preview"
                    />

                    <Pressable
                      accessibilityHint={sharePack.shareA11yHint}
                      accessibilityLabel={sharePack.shareButton}
                      accessibilityRole="button"
                      accessibilityState={{ busy: shareBusy, disabled: shareBusy }}
                      disabled={shareBusy}
                      onPress={handleShareCard}
                      style={({ pressed }) => [
                        styles.shareButton,
                        pressed ? styles.pressed : null,
                        shareBusy ? styles.shareButtonDisabled : null,
                      ]}
                      testID="sky-alignment-share-card-button"
                    >
                      {shareBusy ? (
                        <ActivityIndicator color="#21151A" size="small" />
                      ) : (
                        <Ionicons name="share-social-outline" size={18} color="#21151A" />
                      )}
                      <Text style={styles.shareButtonText}>
                        {shareBusy ? sharePack.preparing : sharePack.shareButton}
                      </Text>
                    </Pressable>

                    <Text style={styles.sharePrivacy}>{sharePack.privacyNote}</Text>
                    {shareFeedback ? (
                      <Text accessibilityLiveRegion="polite" style={styles.shareFeedback}>
                        {shareFeedback}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <PrimaryAction
                  icon={nextAction.icon}
                  label={nextAction.label}
                  onPress={() => navigation.navigate(nextAction.route)}
                  testID="sky-alignment-next-action"
                />
              </View>
          </FaixaCurva>
        )}

        <Text style={styles.differentiation}>{t('alignment.differentiation')}</Text>
      </ScrollView>
    </View>
  );
}

const displayFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia, serif',
  default: 'serif',
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  // Sem gap no contentContainer: gap do pai vence o marginTop:-1 do `grude` e
  // abre uma tira preta entre as faixas. Quem da respiro e a propria faixa.
  scroll: {
    width: '100%',
    maxWidth: 680,
    alignSelf: 'center',
    paddingTop: space.entre,
    paddingBottom: space.fimDaLista,
  },
  // Esta tela NAO tem paddingHorizontal no scroll (a faixa precisa sangrar de
  // ponta a ponta); quem devolve o respiro lateral e o corpo da faixa.
  faixa: {},
  faixaCorpo: { paddingHorizontal: space.entre, gap: space.entre },
  faixaCorpoPrimeira: { paddingTop: 0 },

  intro: { gap: space.dentro },
  // A serifa e o display continuam: sao a identidade desta tela, e o degrau
  // `display` da escala tem exatamente o peso de hierarquia que ela pedia.
  title: {
    ...type.display,
    color: colors.text,
    fontFamily: displayFont,
    letterSpacing: -0.7,
  },
  body: { ...type.corpo, color: colors.textSecondary },

  stateCard: {
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(21,16,25,0.94)',
    paddingHorizontal: space.entre,
    paddingVertical: space.secao,
    gap: space.dentro,
  },
  stateIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(227,184,95,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.28)',
  },
  stateTitle: {
    ...type.titulo,
    color: colors.text,
    fontFamily: displayFont,
    textAlign: 'center',
  },
  stateBody: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },

  receipt: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.42)',
    backgroundColor: '#171118',
    padding: space.bloco,
    gap: space.dentro,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
  },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  receiptSeal: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(227,184,95,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.3)',
  },
  receiptTitle: { ...type.titulo, color: colors.text, fontFamily: displayFont },
  // receiptRow/receiptIcon/receiptLabel/receiptValue sairam: a ficha agora e
  // components/TabelaDados.js, que traz o mesmo desenho (rotulo a esquerda,
  // valor a direita, fio fino entre as linhas) E o filtro de nao fabricar.
  warning: { ...type.apoio, color: colors.amber },
  sourceDisclosure: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.junto,
    paddingHorizontal: space.dentro,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.24)',
    backgroundColor: 'rgba(227,184,95,0.055)',
  },
  sourceDisclosureText: { flex: 1, ...type.apoio, color: '#EBD49E' },
  sourceDetails: {
    ...type.apoio,
    color: colors.textMuted,
    padding: space.dentro,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  shareSection: {
    gap: space.bloco,
    paddingTop: space.bloco,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(227,184,95,0.28)',
  },
  shareHeader: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  shareSeal: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(227,184,95,0.09)',
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.3)',
  },
  shareHeaderCopy: { flex: 1, gap: space.grudado },
  shareTitle: { ...type.cartao, color: colors.text, fontFamily: displayFont },
  shareBody: { ...type.apoio, color: colors.textMuted },
  sharePreview: { width: '72%', maxWidth: 260, alignSelf: 'center' },
  shareButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.junto,
    paddingHorizontal: space.bloco,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.gold,
  },
  shareButtonDisabled: { opacity: 0.7 },
  shareButtonText: { ...type.botao, color: '#21151A' },
  sharePrivacy: { ...type.nota, color: colors.textMuted, textAlign: 'center' },
  shareFeedback: { ...type.apoio, color: '#EBD49E', textAlign: 'center' },
  actionShell: { width: '100%', borderRadius: 24, overflow: 'hidden', marginTop: space.bloco },
  action: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto, paddingHorizontal: space.bloco },
  actionText: { flex: 1, ...type.botao, color: '#21151A', textAlign: 'center' },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
  differentiation: {
    ...type.apoio,
    color: colors.textMuted,
    fontFamily: displayFont,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: space.secao,
    paddingHorizontal: space.entre,
  },
});
