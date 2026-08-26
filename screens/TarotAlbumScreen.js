import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Share,
  Platform,
  TextInput,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getAlbumState, toggleAlbumFavorite, COLLECTION_GROUPS, COLLECTION_TOTAL } from '../lib/tarotCollection';
import { getCardName, getLocalizedCard } from '../lib/tarotThemes';
import { getCardById } from '../lib/tarotDeck';
import { getTarotImage } from '../lib/tarotImages';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import {
  FASES,
  aberturaDoAlbum,
  cartasComHistoria,
  chromeDaTela,
  fontes as bibliografiaDaHistoria,
  historiaDaCarta,
  historiaDoGrupo,
  linhaDoTempo,
  marcosDaFase,
  oQueNaoSeSustenta,
  paraleloDaAntiguidade,
  textoCompartilhavel,
} from '../lib/tarotHistoria';
import { decanatoDaCarta, porqueEsteDecanato } from '../lib/decanatoPorque';
import { PACK as DECANATO_PT } from '../lib/traducoes/decanatoPorque.pt';
import { PACK as DECANATO_ES } from '../lib/traducoes/decanatoPorque.es';
import { PACK as DECANATO_EN } from '../lib/traducoes/decanatoPorque.en';
import { getJournalEntries } from '../lib/journal';
import { buildCosmicMirror, cosmicMirrorPack } from '../lib/cosmicMirror';
import { cardMatchesAlbumFilter, formatAlbumDate, tarotAlbum2Pack } from '../lib/tarotAlbum2';
import PremiumCosmicCard from '../components/PremiumCosmicCard';
import {
  buildCosmicShareCardContent,
  cosmicShareCardPack,
  sharePremiumCosmicCard,
} from '../lib/cosmicShareCard';

// Álbum das 78 Cartas — mostra a coleção de cartas que a pessoa JÁ VIU em
// tiragens reais (lib/tarotCollection.js). As nunca vistas ficam reunidas em
// um único bloco anônimo por grupo: nenhum verso ocupa a posição canônica de
// uma carta, portanto a ordem não entrega qual arcano ou número ainda falta.
//
// ===========================================================================
// DUAS FEATURES DE TRADIÇÃO MORAM AQUI DENTRO. LEIA OS DOIS MOTORES ANTES DE
// ESCREVER QUALQUER TEXTO NESTE ARQUIVO.
// ===========================================================================
// (A) lib/tarotHistoria.js — A HISTÓRIA REAL DO TARÔ. Ela não é uma tela
//     separada de propósito: o cabeçalho do motor diz que é "a linha do tempo
//     que mora DENTRO do álbum das 78". A informação principal dela é a ORDEM,
//     e o achado é a DISTÂNCIA entre duas datas — as imagens vêm de 1440 em
//     diante e a leitura adivinhatória documentada entra séculos depois. Quem
//     lê um item solto não vê isso; quem desce a linha, vê. Por isso a régua
//     abre com os DOIS números lado a lado (séculos de imagem → anos de
//     leitura), os dois calculados pelo motor contra o ano corrente, e por isso
//     os marcos saem agrupados por fase, na ordem, nunca embaralhados.
//     O bloco do paralelo (Nechepso e Petosiris) vem junto e não é enfeite:
//     sem ele a linha do tempo vira denúncia, que é o que ela não é — inventar
//     antiguidade é um traço da tradição, não a corrupção dela (00-tese.md §3).
//
// (B) lib/decanatoPorque.js — POR QUE ESTA CARTA É ESTE DECANATO, dentro do
//     modal da carta. Entrega a REGRA, nunca o significado: por que o Cinco de
//     Copas é "Marte em Escorpião" e não podia ser outra coisa. Vale só para as
//     36 cartas numeradas de 2 a 10; nas outras 42 decanatoDaCarta devolve null
//     e a seção simplesmente não aparece — nunca um encaixe inventado.
//
// ESTA TELA É VITRINE: ela não redige conteúdo. Todo texto sai dos motores e
// dos packs; se faltar texto, ele nasce no PACK, nos três idiomas, e nunca
// dentro deste componente. As travas de test/tarotHistoria.test.js e
// test/decanatoPorque.test.js valem na origem — nenhuma alegação de saúde,
// nenhuma promessa, nenhum veredito, nenhuma data sem endereço em
// docs/tradicao.
//
// i18n: NADA das duas features passa por t(), e continua não passando —
// lib/i18n.js segue intocado. O chrome da história sai de chromeDaTela(lang)
// (bloco `tela` de lib/traducoes/tarotHistoria.{pt,es,en}.js) e o do decanato
// do bloco `chrome` de lib/traducoes/decanatoPorque.{pt,es,en}.js. A tela só
// repassa o `lang` do useLanguage(). As chaves de t('album.*') que já existiam
// continuam como estavam — a migração do resto é do integrador.
//
// STORAGE: só lib/tarotCollection.js, como já era. Nenhuma das duas features
// grava nada: história e decanato são texto puro.

// Ícone da seção: naipes usam o glifo da própria carta do deck (todas as
// cartas de um naipe compartilham o mesmo icon) — evita manter uma lista
// paralela que pode divergir do baralho. Maiores não têm ícone único, 'star'
// é escolha local de UI.
function groupIcon(group) {
  return group.key === 'maiores' ? 'star' : group.cards[0].icon;
}

// O chrome do decanato vem do PACK do próprio módulo, como manda a regra. A
// resolução de idioma está aqui e não em lib/decanatoPorque.js porque aquele
// arquivo ainda não expõe um chromeDaTela(lang) e não é desta tarefa editá-lo
// — o fallback é exatamente o mesmo do motor (idioma fora dos três cai no PT).
// Ver integrationNotes: o lugar definitivo disto é o motor.
const DECANATO_PACKS = { pt: DECANATO_PT, es: DECANATO_ES, en: DECANATO_EN };
function chromeDoDecanato(lang) {
  return (DECANATO_PACKS[lang] || DECANATO_PACKS.pt).chrome;
}

// As 7 cartas em que a pesquisa achou nota específica. As outras 71 não ganham
// selo — e não é buraco: nota genérica em carta é enchimento.
const CARTAS_COM_HISTORIA = new Set(cartasComHistoria());

// Rótulo curto de uma seção do álbum, para os ganchos da linha do tempo. Usa
// exatamente o mesmo `label` que o cabeçalho da seção já mostra — a tela não
// inventa um segundo nome para a mesma caixa.
function rotuloDoGrupo(key, lang = 'pt') {
  const g = COLLECTION_GROUPS.find((x) => x.key === key);
  const label = tarotAlbum2Pack(lang).groups[key];
  return label || (g ? g.label : key);
}

// O recibo — obra, autor e datação, já montados pelo motor no idioma. A tela
// só imprime `linha`.
function Recibo({ rotulo, linhas }) {
  if (!linhas || !linhas.length) return null;
  return (
    <View style={styles.recibo}>
      <Text style={styles.reciboRotulo}>{rotulo}</Text>
      {linhas.map((r) => (
        <Text key={r.id} style={styles.reciboTexto}>
          {r.linha}
        </Text>
      ))}
    </View>
  );
}

export default function TarotAlbumScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const [seenSet, setSeenSet] = useState(new Set());
  const [encounterStats, setEncounterStats] = useState({});
  const [favoriteSet, setFavoriteSet] = useState(new Set());
  const [journalEntries, setJournalEntries] = useState([]);
  const [mode, setMode] = useState('album');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [mirrorPeriod, setMirrorPeriod] = useState(30);
  const [mirrorShareStatus, setMirrorShareStatus] = useState('idle');
  const [studyOrientation, setStudyOrientation] = useState('upright');
  const [selected, setSelected] = useState(null);
  const [hiddenPromptOpen, setHiddenPromptOpen] = useState(false);
  const mirrorShareCardRef = useRef(null);

  // Chrome das duas features, no idioma de quem lê.
  const UI = chromeDaTela(lang);
  const DEC = chromeDoDecanato(lang);
  const ALBUM = tarotAlbum2Pack(lang);
  const MIRROR = cosmicMirrorPack(lang);
  const SHARE = cosmicShareCardPack(lang);

  // A idade é CONTA, não tabela: a abertura calcula "X anos de leitura" contra
  // o ano corrente. Recalcula a cada foco (tique) em vez de congelar no mount —
  // quem deixa o app aberto na virada do ano não pode ver a idade de ontem.
  // Mesma lição de IdadeRealScreen.js e LunarCalendarScreen.js.
  const [tique, setTique] = useState(0);

  const [historiaAberta, setHistoriaAberta] = useState(false);
  const [linhaAberta, setLinhaAberta] = useState(false);
  const [marcoAberto, setMarcoAberto] = useState(null);
  const [mitoAberto, setMitoAberto] = useState(null);
  const [grupoAberto, setGrupoAberto] = useState(null);
  const [decanatoAberto, setDecanatoAberto] = useState(false);
  const [recado, setRecado] = useState(null);

  // Recarrega no foco (não só no mount) — a pessoa pode tirar cartas no Tarô
  // e voltar pro álbum na mesma sessão esperando ver o progresso novo.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setTique((n) => n + 1);
      setMirrorShareStatus('idle');
      Promise.all([getAlbumState(), getJournalEntries()]).then(([albumState, entries]) => {
        if (!active) return;
        setSeenSet(new Set(albumState.seenIds));
        setEncounterStats(albumState.encounterStats || {});
        setFavoriteSet(new Set(albumState.favoriteIds || []));
        setJournalEntries(Array.isArray(entries) ? entries : []);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const abertura = useMemo(() => aberturaDoAlbum(lang), [lang, tique]);
  const linha = useMemo(() => linhaDoTempo(lang), [lang]);
  const fases = useMemo(
    () => FASES.map((fase) => ({ fase, itens: marcosDaFase(fase, lang) })).filter((f) => f.itens.length > 0),
    [lang]
  );
  const mitos = useMemo(() => oQueNaoSeSustenta(lang), [lang]);
  const paralelo = useMemo(() => paraleloDaAntiguidade(lang), [lang]);
  const bibliografia = useMemo(() => bibliografiaDaHistoria(lang), [lang]);
  const mirror = useMemo(
    () => buildCosmicMirror(journalEntries, { period: mirrorPeriod, lang }),
    [journalEntries, mirrorPeriod, lang]
  );
  const mirrorShareCardContent = useMemo(() => {
    if (!mirror || mirror.status === 'empty') return null;
    const title = mirror.topCard
      ? `${mirror.topCard.name} · ${mirror.topCard.count}×`
      : mirror.status === 'first'
        ? MIRROR.firstTitle
        : MIRROR.developingTitle;
    const detail = [
      mirror.topSuit ? mirror.suitLabel : null,
      mirror.topTheme ? mirror.themeLabel : null,
    ].filter(Boolean).join(' · ');
    return buildCosmicShareCardContent({
      brand: SHARE.brand,
      edition: SHARE.mirrorEdition,
      eyebrow: SHARE.mirrorEyebrow,
      glyph: '✦',
      title,
      subtitle: mirror.body,
      detail,
      meta: SHARE.mirrorMeta({ readings: mirror.readingCount, period: mirror.periodLabel }),
      footer: SHARE.mirrorFooter,
      shareText: SHARE.mirrorShareText({ title, detail: mirror.body }),
      fileName: SHARE.mirrorFileName,
    });
  }, [MIRROR.developingTitle, MIRROR.firstTitle, SHARE, mirror]);

  const filteredGroups = useMemo(
    () =>
      COLLECTION_GROUPS.map((group) => ({
        ...group,
        cards: group.cards.filter((card) =>
          cardMatchesAlbumFilter(card, {
            filter,
            search,
            seenIds: seenSet,
            favoriteIds: favoriteSet,
            stats: encounterStats,
            name: getCardName(card, lang),
          })
        ),
      })).filter((group) => group.cards.length > 0),
    [encounterStats, favoriteSet, filter, lang, search, seenSet]
  );

  // Dentro do modal: a nota da carta (null nas 71 sem nota pesquisada) e o
  // decanato (null nas 42 cartas que não são numeradas de 2 a 10).
  const notaDaCarta = useMemo(() => (selected ? historiaDaCarta(selected.id, lang) : null), [selected, lang]);
  const temDecanato = useMemo(() => (selected ? !!decanatoDaCarta(selected.id) : false), [selected]);
  const porque = useMemo(
    () => (selected && temDecanato ? porqueEsteDecanato(selected.id, lang) : null),
    [selected, temDecanato, lang]
  );
  const selectedLocalized = useMemo(() => (selected ? getLocalizedCard(selected, lang) : null), [selected, lang]);
  const selectedStats = selected ? encounterStats[selected.id] || null : null;
  const selectedFavorite = selected ? favoriteSet.has(selected.id) : false;

  const seenTotal = seenSet.size;
  const missing = COLLECTION_TOTAL - seenTotal;
  const pct = Math.round((seenTotal / COLLECTION_TOTAL) * 100);

  const openCard = (card) => {
    Haptics.selectionAsync();
    setDecanatoAberto(false);
    setStudyOrientation('upright');
    setSelected(card);
  };

  const changeFavorite = async () => {
    if (!selected) return;
    const next = await toggleAlbumFavorite(selected.id);
    if (typeof next !== 'boolean') return;
    setFavoriteSet((current) => {
      const updated = new Set(current);
      if (next) updated.add(selected.id);
      else updated.delete(selected.id);
      return updated;
    });
    Haptics.selectionAsync();
  };

  const openHiddenCard = () => {
    Haptics.selectionAsync();
    setHiddenPromptOpen(true);
  };

  const goToDraw = () => {
    setHiddenPromptOpen(false);
    navigation.navigate(ROUTES.TAROT_MAIN);
  };

  // Mesma cadeia de IdadeRealScreen.js e MitosScreen.js: Share do react-native
  // primeiro (no nativo é a folha do SO; na web, react-native-web delega para
  // navigator.share quando existe) e clipboard como último recurso no desktop
  // sem folha. O texto é o do motor, que já fecha no link.
  async function compartilharMito(id) {
    const texto = textoCompartilhavel(id, lang);
    if (!texto) return;
    setRecado(null);
    const temFolhaWeb =
      Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    if (Platform.OS !== 'web' || temFolhaWeb) {
      try {
        await Share.share({ message: texto });
      } catch {
        // Cancelou ou a folha falhou: silêncio, como nas outras telas.
      }
      return;
    }
    let copiou = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
        copiou = true;
      }
    } catch {}
    setRecado(copiou ? UI.copiado : UI.naoCopiou);
  }

  async function compartilharEspelho() {
    if (!mirrorShareCardContent || mirrorShareStatus === 'preparing') return;
    setMirrorShareStatus('preparing');
    try {
      const outcome = await sharePremiumCosmicCard({
        cardRef: mirrorShareCardRef,
        content: mirrorShareCardContent,
        dialogTitle: SHARE.mirrorDialogTitle,
      });
      if (outcome?.status === 'cancelled') setMirrorShareStatus('idle');
      else if (outcome?.status === 'shared' || outcome?.status === 'downloaded') setMirrorShareStatus(outcome.status);
      else setMirrorShareStatus('unavailable');
    } catch {
      setMirrorShareStatus('unavailable');
    }
  }

  const mirrorShareFeedback = mirrorShareStatus === 'shared'
    ? SHARE.shared
    : mirrorShareStatus === 'downloaded'
      ? SHARE.downloaded
      : mirrorShareStatus === 'unavailable'
        ? SHARE.unavailable
        : '';

  return (
    <View style={styles.root}>
      <GradientHeader
        title={ALBUM.title}
        subtitle={ALBUM.subtitle}
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.modeTabs} accessibilityRole="tablist">
          {['album', 'mirror'].map((item) => {
            const active = mode === item;
            return (
              <Pressable
                key={item}
                testID={`album-mode-${item}`}
                style={({ pressed }) => [styles.modeTab, active && styles.modeTabActive, pressed && styles.controlPressed]}
                onPress={() => setMode(item)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Ionicons name={item === 'album' ? 'albums-outline' : 'sparkles-outline'} size={16} color={active ? '#261A17' : colors.textSecondary} />
                <Text style={[styles.modeTabText, active && styles.modeTabTextActive]}>{ALBUM.tabs[item]}</Text>
              </Pressable>
            );
          })}
        </View>

        {mode === 'mirror' ? (
          <View testID="cosmic-mirror">
            <LinearGradient colors={['#291A2D', '#17101D', '#0E0A12']} style={styles.mirrorHero}>
              <View style={styles.mirrorOrb}>
                <Ionicons name="sparkles" size={28} color={colors.gold} />
              </View>
              <Text style={styles.mirrorEyebrow}>{MIRROR.eyebrow}</Text>
              <Text style={styles.mirrorTitle}>{MIRROR.title}</Text>
              <Text style={styles.mirrorSubtitle}>{MIRROR.subtitle}</Text>
            </LinearGradient>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodRow}
            >
              {[7, 30, 'all'].map((period) => {
                const active = mirrorPeriod === period;
                return (
                  <Pressable
                    key={period}
                    style={({ pressed }) => [styles.periodChip, active && styles.periodChipActive, pressed && styles.controlPressed]}
                    onPress={() => {
                      setMirrorPeriod(period);
                      setMirrorShareStatus('idle');
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{MIRROR.periods[period]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {mirror.status === 'empty' ? (
              <View style={styles.mirrorEmpty}>
                <Ionicons name="moon-outline" size={30} color={colors.gold} />
                <Text style={styles.mirrorEmptyTitle}>{MIRROR.emptyTitle}</Text>
                <Text style={styles.mirrorEmptyBody}>{mirror.body}</Text>
                <Pressable
                  style={({ pressed }) => [styles.mirrorCta, pressed && styles.controlPressed]}
                  onPress={() => navigation.navigate(ROUTES.TAROT_MAIN)}
                  accessibilityRole="button"
                >
                  <Text style={styles.mirrorCtaText}>{MIRROR.emptyCta}</Text>
                  <Ionicons name="arrow-forward" size={16} color="#251910" />
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.mirrorReading}>
                  <Text style={styles.mirrorReadingTitle}>
                    {mirror.status === 'first'
                      ? MIRROR.firstTitle
                      : mirror.status === 'developing'
                        ? MIRROR.developingTitle
                        : MIRROR.title}
                  </Text>
                  <Text style={styles.mirrorReadingBody}>{mirror.body}</Text>
                  {mirror.trend ? <Text style={styles.mirrorTrend}>{mirror.trend}</Text> : null}
                </View>

                <View style={styles.metricGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{mirror.readingCount}</Text>
                    <Text style={styles.metricLabel}>{MIRROR.metrics.readings}</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{mirror.uniqueCardCount}</Text>
                    <Text style={styles.metricLabel}>{MIRROR.metrics.unique}</Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{mirror.reversedPct}%</Text>
                    <Text style={styles.metricLabel}>{MIRROR.metrics.reversed}</Text>
                  </View>
                  <View style={[styles.metricCard, styles.metricCardWide]}>
                    <Text style={styles.metricValueSmall}>{mirror.suitLabel}</Text>
                    <Text style={styles.metricLabel}>{MIRROR.metrics.suit}</Text>
                  </View>
                  <View style={[styles.metricCard, styles.metricCardWide]}>
                    <Text style={styles.metricValueSmall}>{mirror.themeLabel}</Text>
                    <Text style={styles.metricLabel}>{MIRROR.metrics.theme}</Text>
                  </View>
                </View>

                <View style={styles.mirrorReceipt}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={colors.gold} />
                  <View style={styles.mirrorReceiptCopy}>
                    <Text style={styles.mirrorReceiptTitle}>{MIRROR.receiptTitle}</Text>
                    <Text style={styles.mirrorReceiptBody}>{mirror.receipt}</Text>
                  </View>
                </View>

                <View style={styles.mirrorArtifact} testID="cosmic-mirror-card-section">
                  <Text style={styles.mirrorArtifactTitle}>{SHARE.mirrorTitle}</Text>
                  <Text style={styles.mirrorArtifactBody}>{SHARE.mirrorBody}</Text>
                  <PremiumCosmicCard
                    ref={mirrorShareCardRef}
                    content={mirrorShareCardContent}
                    style={styles.mirrorArtifactPreview}
                    testID="cosmic-mirror-premium-card"
                  />
                  <View style={styles.mirrorArtifactPrivacy}>
                    <Ionicons name="lock-closed-outline" size={14} color={colors.gold} />
                    <Text style={styles.mirrorArtifactPrivacyText}>{SHARE.mirrorPrivacyNote}</Text>
                  </View>
                </View>

                <Pressable
                  testID="cosmic-mirror-share"
                  style={({ pressed }) => [styles.mirrorShare, pressed && styles.controlPressed]}
                  onPress={compartilharEspelho}
                  accessibilityRole="button"
                  accessibilityLabel={MIRROR.share}
                >
                  <Ionicons name="share-social-outline" size={18} color="#251910" />
                  <Text style={styles.mirrorShareText}>
                    {mirrorShareStatus === 'preparing' ? SHARE.preparing : SHARE.mirrorButton}
                  </Text>
                </Pressable>
                {mirrorShareFeedback ? <Text style={styles.mirrorShareFeedback}>{mirrorShareFeedback}</Text> : null}
              </>
            )}
          </View>
        ) : (
          <>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressCount}>{ALBUM.progress({ seen: seenTotal, total: COLLECTION_TOTAL })}</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            {/* width 0 some o gradiente por completo — sem barra "fantasma" com coleção zerada */}
            {seenTotal > 0 && (
              <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${pct}%` }]}
              />
            )}
          </View>
          <Text style={styles.incentive}>
            {missing > 0 ? ALBUM.progressMissing({ count: missing }) : ALBUM.progressComplete}
          </Text>
          {/* Os dois textos acima PEDEM tiragens e não ofereciam nenhuma — a
              única saída da tela era o botão voltar. TarotMain mora no mesmo
              TarotStack. */}
          {missing > 0 && (
            <Pressable
              style={({ pressed }) => [styles.drawBtnWrap, pressed && styles.controlPressed]}
              onPress={() => navigation.navigate(ROUTES.TAROT_MAIN)}
            >
              <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.drawBtn}>
                <Ionicons name="sparkles" size={17} color="#251910" />
                <Text style={styles.drawBtnText}>{ALBUM.draw}</Text>
              </LinearGradient>
            </Pressable>
          )}
        </View>

        {/* ==================================================================
            (A) A HISTÓRIA REAL DESTE BARALHO — lib/tarotHistoria.js
            Fechado, mostra a chamada e os dois números da distância. Aberto,
            desce a linha do tempo inteira, na ordem, que é o conteúdo.
        ================================================================== */}
        <View style={styles.historiaCard} testID="album-historia">
          <TouchableOpacity
            style={styles.historiaTopo}
            activeOpacity={0.85}
            onPress={() => setHistoriaAberta((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: historiaAberta }}
            accessibilityLabel={UI.titulo}
            accessibilityHint={historiaAberta ? UI.fechar : UI.abrir}
            testID="album-historia-abrir"
          >
            <View style={styles.historiaIcone}>
              <Ionicons name="library" size={16} color={colors.gold} />
            </View>
            <View style={styles.historiaTexto}>
              <Text style={styles.historiaTitulo}>{UI.titulo}</Text>
              <Text style={styles.historiaSub}>{UI.subtitulo}</Text>
            </View>
            <Ionicons name={historiaAberta ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.chamada} numberOfLines={historiaAberta ? undefined : 3}>
            {abertura.chamada}
          </Text>

          {/* A DISTÂNCIA, que é o achado do módulo: os dois números lado a
              lado. Ambos vêm calculados do motor contra o ano corrente. */}
          <View style={styles.numerosRow}>
            <View style={styles.numeroCaixa}>
              <Text style={styles.numeroGrande} testID="album-seculos-imagem">
                {abertura.seculosDeImagem}
              </Text>
              <Text style={styles.numeroRotulo}>{UI.rotuloSeculosDeImagem}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
            <View style={styles.numeroCaixa}>
              <Text style={styles.numeroGrande} testID="album-anos-leitura">
                {abertura.anosDeLeitura}
              </Text>
              <Text style={styles.numeroRotulo}>{UI.rotuloAnosDeLeitura}</Text>
            </View>
          </View>

          {historiaAberta ? (
            <View style={styles.corpo}>
              <Text style={styles.paragrafo}>{abertura.texto}</Text>
              <Recibo rotulo={UI.rotuloRecibo} linhas={abertura.recibo} />

              <TouchableOpacity
                style={styles.linhaBtn}
                activeOpacity={0.85}
                onPress={() => setLinhaAberta((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ expanded: linhaAberta }}
                accessibilityLabel={linhaAberta ? UI.fecharLinhaDoTempo : abertura.cta}
                testID="album-linha-abrir"
              >
                <Ionicons name="git-commit" size={15} color={colors.purple} />
                <Text style={styles.linhaBtnTexto}>{linhaAberta ? UI.fecharLinhaDoTempo : abertura.cta}</Text>
                <Text style={styles.linhaBtnContagem}>{linha.length}</Text>
              </TouchableOpacity>

              {/* A LINHA DO TEMPO — por fase, na ordem. A virada de "jogo" para
                  "leitura" é o argumento inteiro da feature. */}
              {linhaAberta ? (
                <View style={styles.timeline} testID="album-linha">
                  <Text style={styles.rotuloBloco}>{UI.rotuloFases}</Text>
                  {fases.map(({ fase, itens }) => (
                    <View key={fase} style={styles.fase}>
                      <Text style={styles.faseNome} testID={`album-fase-${fase}`}>
                        {itens[0].faseNome}
                      </Text>
                      {itens.map((m) => {
                        const aberto = marcoAberto === m.id;
                        const ganchos = [...m.album.grupos, ...m.album.cartas];
                        return (
                          <View key={m.id} style={styles.marcoCard} testID={`album-marco-${m.id}`}>
                            <TouchableOpacity
                              style={styles.marcoTopo}
                              activeOpacity={0.85}
                              onPress={() => setMarcoAberto(aberto ? null : m.id)}
                              accessibilityRole="button"
                              accessibilityState={{ expanded: aberto }}
                              accessibilityLabel={m.titulo}
                              accessibilityHint={aberto ? UI.fechar : UI.abrir}
                            >
                              <View style={styles.marcoPonto} />
                              <Text style={styles.marcoTitulo}>{m.titulo}</Text>
                              <Ionicons
                                name={aberto ? 'chevron-up' : 'chevron-down'}
                                size={15}
                                color={colors.textMuted}
                              />
                            </TouchableOpacity>
                            {aberto ? (
                              <View style={styles.marcoCorpo}>
                                <Text style={styles.paragrafo}>{m.texto}</Text>
                                <Recibo rotulo={UI.rotuloRecibo} linhas={m.recibo} />
                                {ganchos.length > 0 ? (
                                  <View style={styles.ganchos}>
                                    <Text style={styles.rotuloMini}>{UI.rotuloNoAlbum}</Text>
                                    <View style={styles.chipRow}>
                                      {m.album.grupos.map((g) => (
                                        <Text key={g} style={styles.chip}>
                                          {rotuloDoGrupo(g, lang)}
                                        </Text>
                                      ))}
                                      {m.album.cartas.map((c) => (
                                        <Text key={c} style={styles.chip}>
                                          {getCardName(getCardById(c), lang)}
                                        </Text>
                                      ))}
                                    </View>
                                  </View>
                                ) : null}
                              </View>
                            ) : null}
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>
              ) : null}

              {/* O QUE NÃO SE SUSTENTA — as duas metades nunca saem separadas. */}
              <Text style={styles.rotuloBloco}>{UI.rotuloNaoSeSustenta}</Text>
              {mitos.map((item) => {
                const aberto = mitoAberto === item.id;
                return (
                  <View key={item.id} style={styles.mitoCard} testID={`album-mito-${item.id}`}>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => {
                        setRecado(null);
                        setMitoAberto(aberto ? null : item.id);
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: aberto }}
                      accessibilityLabel={item.oQueSeDiz}
                      accessibilityHint={aberto ? UI.fechar : UI.abrir}
                    >
                      <View style={styles.mitoTopo}>
                        <View style={styles.mitoTexto}>
                          <Text style={styles.rotuloMini}>{UI.rotuloOQueSeDiz}</Text>
                          <Text style={styles.mitoDiz} numberOfLines={aberto ? undefined : 2}>
                            {item.oQueSeDiz}
                          </Text>
                        </View>
                        <Ionicons
                          name={aberto ? 'chevron-up' : 'chevron-down'}
                          size={15}
                          color={colors.textMuted}
                        />
                      </View>
                    </TouchableOpacity>
                    {aberto ? (
                      <View style={styles.marcoCorpo}>
                        <Text style={styles.rotuloMini}>{UI.rotuloOQueAFonteMostra}</Text>
                        <Text style={styles.paragrafo}>{item.oQueAFonteMostra}</Text>
                        <Recibo rotulo={UI.rotuloRecibo} linhas={item.recibo} />
                        <TouchableOpacity
                          style={styles.shareBtn}
                          activeOpacity={0.85}
                          onPress={() => compartilharMito(item.id)}
                          accessibilityRole="button"
                          accessibilityLabel={UI.compartilhar}
                          testID={`album-share-${item.id}`}
                        >
                          <Ionicons name="logo-whatsapp" size={15} color="#fff" />
                          <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {/* O PARALELO — sem ele a linha do tempo vira denúncia. */}
              <Text style={styles.rotuloBloco}>{UI.rotuloParalelo}</Text>
              <Text style={styles.chamada}>{paralelo.chamada}</Text>
              <Text style={styles.paragrafo}>{paralelo.texto}</Text>
              <Recibo rotulo={UI.rotuloRecibo} linhas={paralelo.recibo} />

              <Text style={styles.rotuloBloco}>{UI.rotuloFontes}</Text>
              {bibliografia.map((f) => (
                <Text key={f} style={styles.fonteItem}>
                  {f}
                </Text>
              ))}

              {recado ? <Text style={styles.recado}>{recado}</Text> : null}
              <Text style={styles.marca}>{UI.marca}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.albumTools}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={ALBUM.searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel={ALBUM.searchPlaceholder}
              testID="album-search"
            />
            {search ? (
              <Pressable
                onPress={() => setSearch('')}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={UI.fechar}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            ) : null}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
            {Object.keys(ALBUM.filters).map((key) => {
              const active = filter === key;
              return (
                <Pressable
                  key={key}
                  testID={`album-filter-${key}`}
                  style={({ pressed }) => [styles.filterChip, active && styles.filterChipActive, pressed && styles.controlPressed]}
                  onPress={() => setFilter(key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{ALBUM.filters[key]}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {filteredGroups.length === 0 ? (
          <View style={styles.albumEmpty}>
            <Ionicons name="albums-outline" size={26} color={colors.gold} />
            <Text style={styles.albumEmptyTitle}>{ALBUM.noResultsTitle}</Text>
            <Text style={styles.albumEmptyBody}>{ALBUM.noResultsBody}</Text>
          </View>
        ) : null}

        {filteredGroups.map((group) => {
          const sourceGroup = COLLECTION_GROUPS.find((item) => item.key === group.key) || group;
          const groupSeen = sourceGroup.cards.filter((card) => seenSet.has(card.id)).length;
          // Cartas ainda ocultas não ocupam seus slots canônicos. Mostrar um
          // verso por posição permitiria deduzir o arcano/número pelos
          // vizinhos. A grade exibe as reveladas e resume todas as demais em
          // um único bloco sem correspondência entre placeholder e carta.
          const revealedCards = group.cards.filter((card) => seenSet.has(card.id));
          const hiddenCount = group.cards.length - revealedCards.length;
          const notaAberta = grupoAberto === group.key;
          const nota = notaAberta ? historiaDoGrupo(group.key, lang) : null;
          return (
            <View key={group.key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={groupIcon(group)} size={16} color={colors.gold} />
                <Text style={styles.sectionTitle}>{ALBUM.groups[group.key] || group.label}</Text>
                <Text style={styles.sectionCount}>{groupSeen}/{sourceGroup.cards.length}</Text>
                {/* A nota histórica da seção — lib/tarotHistoria.js. */}
                <TouchableOpacity
                  onPress={() => setGrupoAberto(notaAberta ? null : group.key)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: notaAberta }}
                  accessibilityLabel={UI.rotuloEstaSecao}
                  accessibilityHint={notaAberta ? UI.fechar : UI.abrir}
                  testID={`album-grupo-info-${group.key}`}
                >
                  <Ionicons
                    name={notaAberta ? 'information-circle' : 'information-circle-outline'}
                    size={19}
                    color={colors.purple}
                  />
                </TouchableOpacity>
              </View>

              {nota ? (
                <View style={styles.grupoNota} testID={`album-grupo-nota-${group.key}`}>
                  <Text style={styles.rotuloMini}>{UI.rotuloEstaSecao}</Text>
                  <Text style={styles.notaTitulo}>{nota.titulo}</Text>
                  <Text style={styles.paragrafo}>{nota.texto}</Text>
                  <Recibo rotulo={UI.rotuloRecibo} linhas={nota.recibo} />
                </View>
              ) : null}

              <View style={styles.grid}>
                {revealedCards.map((card) => {
                  const temNota = CARTAS_COM_HISTORIA.has(card.id);
                  return (
                    <Pressable
                      key={card.id}
                      testID="album-card-seen"
                      style={({ pressed }) => [styles.thumb, pressed && styles.thumbPressed]}
                      onPress={() => openCard(card)}
                      accessibilityRole="button"
                      accessibilityLabel={temNota ? `${getCardName(card, lang)} — ${UI.seloHistoria}` : getCardName(card, lang)}
                    >
                      <Image source={getTarotImage(card.id)} style={styles.thumbImage} resizeMode="cover" />
                      {/* Selo de carta com nota de história — só nas 7 que
                          a pesquisa achou, e só depois de revelada (marcar
                          carta não vista seria spoiler). */}
                      {temNota ? (
                        <View style={styles.selo} pointerEvents="none" testID={`album-selo-${card.id}`}>
                          <Ionicons name="bookmark" size={9} color="#1F1640" />
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
                {hiddenCount > 0 ? (
                  <Pressable
                    key={`hidden-group-${group.key}`}
                    testID={`album-hidden-group-${group.key}`}
                    style={({ pressed }) => [styles.hiddenGroup, pressed && styles.thumbPressed]}
                    onPress={openHiddenCard}
                    accessibilityRole="button"
                    accessibilityLabel={ALBUM.hiddenGroupCount({ count: hiddenCount })}
                    accessibilityHint={ALBUM.hiddenGroupHint}
                  >
                    <LinearGradient colors={['#2A1D52', '#1A1235']} style={styles.hiddenGroupSeal}>
                      <Ionicons name="sparkles" size={20} color={colors.purple} />
                      <Ionicons name="lock-closed" size={11} color={colors.gold} />
                    </LinearGradient>
                    <View style={styles.hiddenGroupCopy}>
                      <Text style={styles.hiddenGroupTitle}>{ALBUM.hiddenGroupCount({ count: hiddenCount })}</Text>
                      <Text style={styles.hiddenGroupBody}>{ALBUM.hiddenGroupHint}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={17} color={colors.gold} />
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        })}
          </>
        )}
      </ScrollView>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          {selected && (
            // Pressable interno: o modal agora tem conteúdo rolável e botões, e
            // o toque neles não pode fechar a folha. Fecha pelo fundo ou pelo X.
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <TouchableOpacity
                style={styles.modalClose}
                activeOpacity={0.85}
                onPress={() => setSelected(null)}
                accessibilityRole="button"
                accessibilityLabel={UI.fechar}
                testID="album-modal-fechar"
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>

              <ScrollView
                contentContainerStyle={styles.modalScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <Image source={getTarotImage(selected.id)} style={styles.modalImage} resizeMode="cover" />
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalName}>{getCardName(selected, lang)}</Text>
                  <Pressable
                    testID="album-favorite"
                    style={({ pressed }) => [styles.favoriteButton, selectedFavorite && styles.favoriteButtonActive, pressed && styles.controlPressed]}
                    onPress={changeFavorite}
                    accessibilityRole="button"
                    accessibilityLabel={selectedFavorite ? ALBUM.unfavorite : ALBUM.favorite}
                    accessibilityState={{ selected: selectedFavorite }}
                  >
                    <Ionicons name={selectedFavorite ? 'heart' : 'heart-outline'} size={20} color={selectedFavorite ? '#251910' : colors.gold} />
                  </Pressable>
                </View>

                <View style={styles.encounterCard} testID="album-encounters">
                  <Text style={styles.encounterTitle}>{ALBUM.encountersTitle}</Text>
                  {selectedStats ? (
                    <>
                      <Text style={styles.encounterCount}>{ALBUM.encountersCount({ count: selectedStats.count })}</Text>
                      <Text style={styles.encounterMeta}>
                        {ALBUM.encountersOrientation({
                          upright: selectedStats.uprightCount || 0,
                          reversed: selectedStats.reversedCount || 0,
                        })}
                      </Text>
                      <Text style={styles.encounterMeta}>
                        {ALBUM.firstSeen({ date: formatAlbumDate(selectedStats.firstSeenAt, lang) })}
                      </Text>
                      <Text style={styles.encounterMeta}>
                        {ALBUM.lastSeen({ date: formatAlbumDate(selectedStats.lastSeenAt, lang) })}
                      </Text>
                      {selectedStats.legacyBaseline ? <Text style={styles.encounterLegacy}>{ALBUM.legacyBaseline}</Text> : null}
                    </>
                  ) : (
                    <Text style={styles.encounterLegacy}>{ALBUM.legacyHistory}</Text>
                  )}
                </View>

                {selectedLocalized ? (
                  <View style={styles.studyCard} testID="album-study">
                    <Text style={styles.studyTitle}>{ALBUM.studyTitle}</Text>
                    <Text style={styles.studySubtitle}>{ALBUM.studySubtitle}</Text>
                    <View style={styles.orientationTabs}>
                      {['upright', 'reversed'].map((orientation) => {
                        const active = studyOrientation === orientation;
                        return (
                          <Pressable
                            key={orientation}
                            style={({ pressed }) => [styles.orientationTab, active && styles.orientationTabActive, pressed && styles.controlPressed]}
                            onPress={() => setStudyOrientation(orientation)}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: active }}
                          >
                            <Text style={[styles.orientationTabText, active && styles.orientationTabTextActive]}>
                              {ALBUM[orientation]}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    {Array.isArray(selectedLocalized.keywords) && selectedLocalized.keywords.length > 0 ? (
                      <View style={styles.studySection}>
                        <Text style={styles.studyLabel}>{ALBUM.keywords}</Text>
                        <Text style={styles.studyCopy}>{selectedLocalized.keywords.join(' · ')}</Text>
                      </View>
                    ) : null}
                    {selectedLocalized.cena ? (
                      <View style={styles.studySection}>
                        <Text style={styles.studyLabel}>{ALBUM.scene}</Text>
                        <Text style={styles.studyCopy}>{selectedLocalized.cena}</Text>
                      </View>
                    ) : null}
                    <View style={styles.studySection}>
                      <Text style={styles.studyLabel}>{ALBUM.meaning}</Text>
                      <Text style={styles.studyCopy}>
                        {studyOrientation === 'reversed'
                          ? selectedLocalized.reversedMeaning
                          : selectedLocalized.uprightMeaning}
                      </Text>
                    </View>
                    <View style={styles.studySection}>
                      <Text style={styles.studyLabel}>{ALBUM.advice}</Text>
                      <Text style={styles.studyCopy}>
                        {studyOrientation === 'reversed'
                          ? selectedLocalized.conselhoInvertido
                          : selectedLocalized.conselho}
                      </Text>
                    </View>
                  </View>
                ) : null}

                {/* A nota histórica DESTA carta — null nas 71 sem nota. */}
                {notaDaCarta ? (
                  <View style={styles.blocoModal} testID="album-modal-historia">
                    <Text style={styles.rotuloMini}>{UI.rotuloEstaCarta}</Text>
                    <Text style={styles.notaTitulo}>{notaDaCarta.titulo}</Text>
                    <Text style={styles.paragrafo}>{notaDaCarta.texto}</Text>
                    <Recibo rotulo={UI.rotuloRecibo} linhas={notaDaCarta.recibo} />
                  </View>
                ) : null}

                {/* ==========================================================
                    (B) POR QUE ESTA CARTA É ESTE DECANATO
                    Só nas 36 numeradas de 2 a 10. Nas outras 42 o motor
                    devolve null e a seção inteira não existe.
                ========================================================== */}
                {porque && porque.disponivel ? (
                  <View style={styles.blocoModal} testID="album-modal-decanato">
                    <TouchableOpacity
                      style={styles.blocoTopo}
                      activeOpacity={0.85}
                      onPress={() => setDecanatoAberto((v) => !v)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: decanatoAberto }}
                      accessibilityLabel={DEC.titulo}
                      accessibilityHint={decanatoAberto ? DEC.fechar : DEC.abrir}
                      testID="album-decanato-abrir"
                    >
                      <View style={styles.historiaTexto}>
                        <Text style={styles.notaTitulo}>{DEC.titulo}</Text>
                        <Text style={styles.historiaSub}>{DEC.subtitulo}</Text>
                      </View>
                      <Ionicons
                        name={decanatoAberto ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>

                    {/* O encaixe, sempre visível: o rótulo, a faixa de graus e
                        o nome tradicional. É a resposta curta. */}
                    <View style={styles.encaixe}>
                      <Text style={styles.encaixeRotulo} testID="album-decanato-rotulo">
                        {porque.rotulo}
                      </Text>
                      <Text style={styles.encaixeFaixa}>{porque.decanato.faixa}</Text>
                    </View>
                    <Text style={styles.rotuloMini}>{DEC.rotuloTituloGD}</Text>
                    <Text style={styles.encaixeGD}>{porque.tituloGD}</Text>

                    {decanatoAberto ? (
                      <View style={styles.corpo}>
                        <Text style={styles.chamada}>{porque.chamada}</Text>
                        <Text style={styles.paragrafo}>{porque.explicacao}</Text>

                        <Text style={styles.rotuloBloco}>{DEC.rotuloRegra}</Text>
                        {porque.aRegra.map((passo, i) => (
                          <View key={passo.titulo} style={styles.passo}>
                            <Text style={styles.passoNumero}>{i + 1}</Text>
                            <View style={styles.passoTexto}>
                              <Text style={styles.passoTitulo}>{passo.titulo}</Text>
                              <Text style={styles.paragrafo}>{passo.texto}</Text>
                            </View>
                          </View>
                        ))}

                        <Text style={styles.rotuloMini}>{DEC.rotuloConta}</Text>
                        <Text style={styles.paragrafo}>{porque.aConta}</Text>

                        {/* A conferência: 36 de 36, agora. Não é "confie em
                            nós" — é a regra rodando contra o baralho. */}
                        <View style={styles.conferencia}>
                          <Ionicons name="checkmark-circle" size={15} color={colors.green} />
                          <Text style={styles.conferenciaTexto} testID="album-decanato-conferencia">
                            {porque.conferencia.texto}
                          </Text>
                        </View>

                        <Text style={styles.rotuloBloco}>{DEC.rotuloCamadas}</Text>
                        {porque.camadas.map((camada) => (
                          <View key={camada.id} style={styles.camada}>
                            <Text style={styles.camadaTitulo}>{camada.titulo}</Text>
                            <Text style={styles.camadaIdade}>{camada.idade}</Text>
                            <Text style={styles.paragrafo}>{camada.texto}</Text>
                            {camada.fontes.map((f) => (
                              <Text key={f.linha} style={styles.reciboTexto}>
                                {f.nota ? `${f.linha} · ${f.nota}` : f.linha}
                              </Text>
                            ))}
                          </View>
                        ))}

                        <Text style={styles.rotuloBloco}>{DEC.rotuloCitacoes}</Text>
                        {porque.verbatins.map((v) => (
                          <View key={v.id} style={styles.citacao}>
                            <Text style={styles.citacaoTexto}>“{v.texto}”</Text>
                            <Text style={styles.citacaoLocus}>{v.locus}</Text>
                            <Text style={styles.paragrafo}>{v.parafrase}</Text>
                          </View>
                        ))}

                        <Text style={styles.rotuloBloco}>{DEC.rotuloRessalvas}</Text>
                        <Text style={styles.ressalva}>{porque.notaDaVolta}</Text>
                        <Text style={styles.ressalva}>{porque.notaDoPrimeiroTerco}</Text>
                        <Text style={styles.ressalva}>{porque.notaAtribuicaoRival}</Text>
                        <Text style={styles.ressalva}>{porque.notaArmadilhaPtolomeu}</Text>
                        <Text style={styles.ressalva}>{porque.notaLeituraDoApp}</Text>

                        <Text style={styles.rotuloBloco}>{DEC.rotuloFontes}</Text>
                        {porque.fonte.map((f) => (
                          <Text key={f} style={styles.fonteItem}>
                            {f}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <Text style={styles.modalHint}>{t('album.closeHint')}</Text>
              </ScrollView>
            </Pressable>
          )}
        </Pressable>
      </Modal>

      {/* Uma carta não vista preserva o mistério, mas nunca vira um toque
          morto. A folha explica a regra da coleção e leva à ação que realmente
          pode revelá-la — sem nome, imagem ou posição do baralho como spoiler. */}
      <Modal
        visible={hiddenPromptOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setHiddenPromptOpen(false)}
      >
        <Pressable style={styles.hiddenOverlay} onPress={() => setHiddenPromptOpen(false)}>
          <Pressable
            style={styles.hiddenSheet}
            onPress={() => {}}
            accessibilityViewIsModal
            testID="album-hidden-modal"
          >
            <LinearGradient
              colors={['rgba(155, 116, 255, 0.24)', 'rgba(18, 11, 39, 0.96)']}
              style={styles.hiddenHero}
            >
              <View style={styles.hiddenCardPreview}>
                <LinearGradient colors={['#342260', '#17102F']} style={styles.hiddenCardPreviewInner}>
                  <Ionicons name="sparkles" size={28} color={colors.purple} />
                  <View style={styles.hiddenHeroLock}>
                    <Ionicons name="lock-closed" size={15} color="#21153E" />
                  </View>
                </LinearGradient>
              </View>
              <Text style={styles.hiddenEyebrow}>{t('album.cardHidden')}</Text>
            </LinearGradient>

            <View style={[styles.hiddenCopy, { paddingBottom: Math.max(28, insets.bottom + 16) }]}>
              <Text style={styles.hiddenTitle}>{t('album.cardHiddenTitle')}</Text>
              <Text style={styles.hiddenBody}>{t('album.cardHiddenBody')}</Text>

              <Pressable
                testID="album-hidden-draw"
                style={({ pressed }) => [styles.hiddenCtaWrap, pressed && styles.hiddenButtonPressed]}
                onPress={goToDraw}
                accessibilityRole="button"
                accessibilityLabel={t('album.drawCta')}
              >
                <LinearGradient colors={gradients.gold} style={styles.hiddenCta}>
                  <Ionicons name="sparkles" size={16} color="#21153E" />
                  <Text style={styles.hiddenCtaText}>{t('album.drawCta')}</Text>
                </LinearGradient>
              </Pressable>

              <Pressable
                testID="album-hidden-close"
                style={({ pressed }) => [styles.hiddenSecondary, pressed && styles.hiddenButtonPressed]}
                onPress={() => setHiddenPromptOpen(false)}
                accessibilityRole="button"
                accessibilityLabel={t('album.continueCta')}
              >
                <Text style={styles.hiddenSecondaryText}>{t('album.continueCta')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  controlPressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  modeTabActive: { backgroundColor: colors.gold },
  modeTabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '800' },
  modeTabTextActive: { color: '#261A17' },

  mirrorHero: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold + '55',
    paddingHorizontal: 22,
    paddingVertical: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mirrorOrb: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.gold + '16',
    borderWidth: 1,
    borderColor: colors.gold + '66',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  mirrorEyebrow: { color: colors.gold, fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textTransform: 'uppercase' },
  mirrorTitle: { color: colors.text, fontSize: 28, lineHeight: 34, fontWeight: '900', textAlign: 'center', marginTop: 5 },
  mirrorSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 7, maxWidth: 330 },
  periodRow: { paddingVertical: 16, gap: 8 },
  periodChip: {
    minHeight: 38,
    paddingHorizontal: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodChipActive: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  periodChipText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  periodChipTextActive: { color: colors.gold },
  mirrorEmpty: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 24,
    alignItems: 'center',
    gap: 9,
  },
  mirrorEmptyTitle: { color: colors.text, fontSize: 19, lineHeight: 25, fontWeight: '900', textAlign: 'center' },
  mirrorEmptyBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  mirrorCta: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: colors.gold,
    paddingHorizontal: 18,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mirrorCtaText: { color: '#251910', fontSize: 13, fontWeight: '900' },
  mirrorReading: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 18,
    gap: 8,
  },
  mirrorReadingTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontWeight: '900' },
  mirrorReadingBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  mirrorTrend: { color: colors.gold, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metricCard: {
    minWidth: 96,
    flexBasis: '30%',
    flexGrow: 1,
    minHeight: 94,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 13,
    justifyContent: 'space-between',
  },
  metricCardWide: { flexBasis: '46%' },
  metricValue: { color: colors.gold, fontSize: 25, lineHeight: 30, fontWeight: '900' },
  metricValueSmall: { color: colors.gold, fontSize: 16, lineHeight: 21, fontWeight: '900' },
  metricLabel: { color: colors.textMuted, fontSize: 10, lineHeight: 14, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.6 },
  mirrorReceipt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gold + '42',
    backgroundColor: colors.gold + '0D',
    padding: 14,
    marginTop: 10,
  },
  mirrorReceiptCopy: { flex: 1, gap: 3 },
  mirrorReceiptTitle: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '900' },
  mirrorReceiptBody: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  mirrorArtifact: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gold + '35',
    backgroundColor: '#140D19',
    padding: 16,
    alignItems: 'center',
  },
  mirrorArtifactTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontWeight: '900', textAlign: 'center' },
  mirrorArtifactBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 4 },
  mirrorArtifactPreview: { width: '76%', maxWidth: 270, marginTop: 15, borderRadius: 22 },
  mirrorArtifactPrivacy: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, marginTop: 12, width: '100%' },
  mirrorArtifactPrivacyText: { flex: 1, color: colors.gold, fontSize: 10, lineHeight: 16 },
  mirrorShare: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.gold,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  mirrorShareText: { color: '#251910', fontSize: 14, fontWeight: '900' },
  mirrorShareFeedback: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 7 },

  progressCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  progressCount: { color: colors.text, fontSize: 22, fontWeight: '800' },
  progressPct: { color: colors.gold, fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.surface, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  incentive: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 12 },
  bonusNote: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 6 },
  drawBtnWrap: { marginTop: 14, borderRadius: 12, overflow: 'hidden' },
  drawBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, gap: 8 },
  drawBtnText: { color: '#251910', fontWeight: '900', fontSize: 14 },

  // ---- (A) A história real deste baralho ----
  historiaCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    gap: 10,
  },
  historiaTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  historiaIcone: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historiaTexto: { flex: 1, gap: 2 },
  historiaTitulo: { color: colors.text, fontSize: 15, fontWeight: '800', lineHeight: 20 },
  historiaSub: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },

  chamada: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, fontStyle: 'italic' },

  numerosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  numeroCaixa: { flex: 1, alignItems: 'center', gap: 2 },
  numeroGrande: { color: colors.gold, fontSize: 26, fontWeight: '800', lineHeight: 30 },
  numeroRotulo: { color: colors.textMuted, fontSize: 11, lineHeight: 15, textAlign: 'center' },

  corpo: { gap: 10 },
  paragrafo: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  rotuloBloco: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  rotuloMini: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  linhaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  linhaBtnTexto: { color: colors.text, fontSize: 13, fontWeight: '800', flex: 1 },
  linhaBtnContagem: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },

  timeline: { gap: 8 },
  fase: { gap: 8, marginTop: 4 },
  faseNome: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  marcoCard: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    paddingLeft: 12,
    paddingVertical: 2,
  },
  marcoTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  marcoPonto: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.gold,
    marginLeft: -16,
  },
  marcoTitulo: { color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '700', flex: 1 },
  marcoCorpo: { gap: 10, marginTop: 8, paddingBottom: 6 },
  ganchos: { gap: 6 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    overflow: 'hidden',
  },

  mitoCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 12,
  },
  mitoTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mitoTexto: { flex: 1, gap: 3 },
  mitoDiz: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pink,
  },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 11,
    gap: 3,
  },
  reciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  reciboTexto: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },

  shareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { color: '#fff', fontSize: 13, fontWeight: '800' },

  fonteItem: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  recado: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  marca: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 4 },

  // ---- seções do álbum ----
  albumTools: { marginBottom: 18, gap: 10 },
  searchBox: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
  },
  searchInput: { flex: 1, color: colors.text, fontSize: 14, paddingVertical: 10 },
  filterRow: { gap: 8 },
  filterChip: {
    minHeight: 38,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: { borderColor: colors.gold, backgroundColor: colors.gold + '18' },
  filterChipText: { color: colors.textMuted, fontSize: 12, fontWeight: '800' },
  filterChipTextActive: { color: colors.gold },
  albumEmpty: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.card,
    padding: 22,
    gap: 8,
    marginBottom: 20,
  },
  albumEmptyTitle: { color: colors.text, fontSize: 16, fontWeight: '900', textAlign: 'center' },
  albumEmptyBody: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  sectionCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  grupoNota: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  notaTitulo: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // 23% + gap de 8 fecha 4 colunas na largura de celular; em telas muito
  // estreitas quebra pra 3 sozinho (flexWrap), sem conta manual de largura.
  thumb: {
    width: '23%',
    aspectRatio: 0.66,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumbPressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  thumbImage: { width: '100%', height: '100%' },
  hiddenGroup: {
    width: '100%',
    minHeight: 82,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.gold + '35',
    backgroundColor: '#171020',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  hiddenGroupSeal: { width: 46, height: 58, borderRadius: 10, alignItems: 'center', justifyContent: 'center', gap: 3 },
  hiddenGroupCopy: { flex: 1 },
  hiddenGroupTitle: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '900' },
  hiddenGroupBody: { color: colors.textMuted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  selo: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---- modal da carta ----
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8,4,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalSheet: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '92%',
    borderRadius: 20,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  modalScroll: { padding: 18, paddingTop: 22, alignItems: 'center', gap: 12 },
  modalClose: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: 200,
    aspectRatio: 0.62,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  modalName: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4, textAlign: 'center' },
  modalTitleRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  favoriteButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.gold + '66',
    backgroundColor: colors.gold + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteButtonActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  encounterCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.gold + '42',
    borderRadius: 16,
    backgroundColor: colors.gold + '0D',
    padding: 14,
    gap: 5,
  },
  encounterTitle: { color: colors.gold, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  encounterCount: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  encounterMeta: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  encounterLegacy: { color: colors.textMuted, fontSize: 11, lineHeight: 17, fontStyle: 'italic' },
  studyCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: colors.card,
    padding: 15,
    gap: 10,
  },
  studyTitle: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '900' },
  studySubtitle: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  orientationTabs: { flexDirection: 'row', borderRadius: 12, padding: 3, gap: 3, backgroundColor: colors.surface },
  orientationTab: { flex: 1, minHeight: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  orientationTabActive: { backgroundColor: colors.gold },
  orientationTabText: { color: colors.textSecondary, fontSize: 12, fontWeight: '800' },
  orientationTabTextActive: { color: '#251910' },
  studySection: { gap: 4, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 9 },
  studyLabel: { color: colors.gold, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  studyCopy: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  modalHint: { color: colors.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center' },

  // ---- resposta premium da carta ainda não revelada ----
  hiddenOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 3, 18, 0.88)',
    justifyContent: 'flex-end',
  },
  hiddenSheet: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(155, 116, 255, 0.32)',
    overflow: 'hidden',
  },
  hiddenHero: { alignItems: 'center', paddingTop: 24, paddingBottom: 18, gap: 12 },
  hiddenCardPreview: {
    width: 88,
    aspectRatio: 0.66,
    borderRadius: 14,
    padding: 2,
    backgroundColor: colors.gold + '94',
    shadowColor: colors.purple,
    shadowOpacity: 0.42,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  hiddenCardPreviewInner: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenHeroLock: {
    position: 'absolute',
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hiddenEyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  hiddenCopy: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 28, gap: 12 },
  hiddenTitle: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center' },
  hiddenBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  hiddenCtaWrap: { borderRadius: 14, overflow: 'hidden', marginTop: 6 },
  hiddenCta: {
    minHeight: 50,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  hiddenCtaText: { color: '#21153E', fontSize: 14, fontWeight: '900' },
  hiddenSecondary: { minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  hiddenSecondaryText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  hiddenButtonPressed: { opacity: 0.76 },

  blocoModal: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  blocoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  encaixe: {
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 2,
  },
  encaixeRotulo: { color: colors.gold, fontSize: 16, fontWeight: '800', lineHeight: 21 },
  encaixeFaixa: { color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  encaixeGD: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, fontWeight: '700' },

  passo: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  passoNumero: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceElevated,
    color: colors.purple,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
    overflow: 'hidden',
  },
  passoTexto: { flex: 1, gap: 3 },
  passoTitulo: { color: colors.text, fontSize: 13, fontWeight: '800', lineHeight: 19 },

  conferencia: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 11,
  },
  conferenciaTexto: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, flex: 1 },

  camada: {
    gap: 3,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: 10,
  },
  camadaTitulo: { color: colors.text, fontSize: 13, fontWeight: '800', lineHeight: 19 },
  camadaIdade: { color: colors.gold, fontSize: 11, fontWeight: '700' },

  citacao: {
    gap: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 11,
  },
  citacaoTexto: { color: colors.text, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  citacaoLocus: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },

  ressalva: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
});
