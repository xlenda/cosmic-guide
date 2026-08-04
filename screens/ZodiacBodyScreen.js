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
//
// ===========================================================================
// O BLOCO DAS DUAS LISTAS (lib/melotesiaDupla.js) — proposição 2 da tese
// ===========================================================================
// Até 01/08/2026 esta tela mostrava UMA lista de signo↔parte do corpo: a de
// Manílio (Astronomica II.453-465, séc. I), que vive em lib/zodiacBody.js. Só
// que ela nunca foi a única. O Sefer Yetzirah (séc. II–VI, recensão Gra/Ari,
// cap. 5) reparte o corpo por um caminho completamente diferente — e as duas
// não coincidem em nenhuma das doze linhas.
//
// docs/tradicao/00-tese.md, proposição 2: "quando duas fontes discordam,
// mostrar as duas com o nome de cada uma. Nunca escolher em silêncio." O bloco
// abaixo é essa regra virada tela: duas colunas rotuladas, nunca somadas, com o
// zero de coincidências impresso grande — porque o zero é o conteúdo.
//
// O QUE ESTE ARQUIVO NÃO FAZ:
//   · não redige conteúdo. Toda prosa vem do motor (lib/melotesiaDupla.js) e
//     dos packs (lib/traducoes/melotesiaDupla.{pt,es,en}.js). Se faltar texto,
//     o texto nasce no pack, nos três idiomas — nunca aqui dentro.
//   · não funde as duas listas. Não existe neste arquivo nenhuma linha que
//     diga "a parte do corpo do signo é X": existe a coluna de Manílio e a
//     coluna do Sefer Yetzirah, cada uma com o nome da obra grudado.
//   · não fabrica céu. O signo solar de quem lê sai de parDoNascimento (que
//     usa a longitude real do Sol, via lib/signs.js). Sem data de nascimento,
//     o motor devolve indisponível e a tela mostra o que falta e onde resolver.
//
// i18n DO BLOCO NOVO: nada dele passa por t(). O chrome sai do bloco `chrome`
// do pack do próprio módulo, e a tela só repassa o `lang` do useLanguage() —
// não escolhe idioma, não redige e não tem dicionário próprio. Os packs são
// importados aqui porque lib/melotesiaDupla.js ainda não exporta um
// chromeDaTela(lang) como lib/idadeReal.js faz; o mapa PACKS_MELOTESIA abaixo é
// o MESMO packDoIdioma do motor, e some no dia em que esse export existir.
// (O resto da tela — a parte antiga, de Manílio — continua em t() e em
// lib/i18n.js, intocado.)
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, AppState, Share, Platform } from 'react-native';
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
import {
  RELACOES,
  cobreOsDoze,
  fontes as fontesDaMelotesia,
  linhaDoSigno,
  melotesiaDupla,
  parDeSigno,
  parDoNascimento,
} from '../lib/melotesiaDupla';
import { PACK as MELOTESIA_PT } from '../lib/traducoes/melotesiaDupla.pt.js';
import { PACK as MELOTESIA_ES } from '../lib/traducoes/melotesiaDupla.es.js';
import { PACK as MELOTESIA_EN } from '../lib/traducoes/melotesiaDupla.en.js';
import { getAnyBirthData } from '../lib/birthData';

// Mesma regra de packDoIdioma em lib/melotesiaDupla.js — idioma fora dos três
// cai no PT. A tela não escolhe idioma: ela repassa o `lang` do useLanguage().
const PACKS_MELOTESIA = { pt: MELOTESIA_PT, es: MELOTESIA_ES, en: MELOTESIA_EN };

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

// A mesma sanfona da Section acima, só que com os rótulos vindo do pack da
// melotesia em vez de t() — o bloco das duas listas não fala com lib/i18n.js.
function SecaoDupla({ titulo, rotuloAbrir, rotuloFechar, aberta = false, testID, children }) {
  const [open, setOpen] = useState(aberta);
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${titulo} — ${open ? rotuloFechar : rotuloAbrir}`}
        testID={testID}
      >
        <Text style={styles.sectionTitle}>{titulo}</Text>
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

  // =========================================================================
  // AS DUAS LISTAS — dados do bloco novo
  // =========================================================================
  const MELO = PACKS_MELOTESIA[lang] || PACKS_MELOTESIA.pt;
  const UI = MELO.chrome;

  // cobreOsDoze() é a sanidade do motor: se alguém acrescentar um signo em
  // lib/zodiacBody.js e esquecer da segunda lista, isto vira false e a tela
  // declara indisponível em vez de mostrar meia linha.
  const integro = useMemo(() => cobreOsDoze(), []);
  const dupla = useMemo(() => (integro ? melotesiaDupla(lang) : null), [integro, lang]);
  const bibliografia = useMemo(() => fontesDaMelotesia(lang), [lang]);

  // Qual linha da tabela está aberta. Por padrão ela SEGUE a figura: tocar num
  // signo do boneco abre a linha dupla correspondente. Depois que a pessoa toca
  // na própria tabela, a escolha dela manda ('' = nenhuma aberta).
  const [duplaEscolhida, setDuplaEscolhida] = useState(null);
  const linhaDaFigura = active ? linhaDoSigno(active.id) : null;
  const duplaAberta =
    duplaEscolhida !== null ? duplaEscolhida : linhaDaFigura ? linhaDaFigura.id : null;
  const [recadoDupla, setRecadoDupla] = useState(null);

  // O signo solar de quem lê, pela efeméride. getAnyBirthData (lib/birthData.js)
  // devolve { date, time, city } ou null — a tela não toca em AsyncStorage.
  const [nascimento, setNascimento] = useState(undefined);
  useEffect(() => {
    let vivo = true;
    getAnyBirthData()
      .then((d) => {
        if (vivo) setNascimento(d || null);
      })
      .catch(() => {
        if (vivo) setNascimento(null);
      });
    return () => {
      vivo = false;
    };
  }, []);

  const meuPar = useMemo(() => {
    if (nascimento === undefined) return null; // ainda lendo o storage
    const d = nascimento || {};
    return parDoNascimento(d.date || null, d.time || null, d.city || null, lang);
  }, [nascimento, lang]);

  // Sem data de nascimento, ainda resta o signo declarado no perfil (casal ou
  // solo). Ele NÃO é apresentado como equivalente: a nota do pack diz que a
  // data destrava a leitura pela posição real do Sol.
  const parDeclarado = useMemo(() => {
    // Enquanto o storage não respondeu, nada aparece: mostrar o signo declarado
    // e trocá-lo pelo calculado meio segundo depois seria piscar dois signos
    // diferentes na cara de quem nasceu na virada.
    if (nascimento === undefined) return null;
    if (!sunSignName || (meuPar && meuPar.disponivel)) return null;
    const linha = linhaDoSigno(sunSignName);
    return linha ? parDeSigno(linha.id, lang) : null;
  }, [sunSignName, meuPar, nascimento, lang]);

  async function compartilharPar(par) {
    // O texto é feito só de peças que o motor e o pack já escreveram — a tela
    // junta com quebra de linha e não redige uma palavra.
    const texto = [
      `${par.emoji} ${par.signoNome}`,
      `${par.manilio.tradicao}: ${par.manilio.parte}`,
      `${par.sefer.tradicao}: ${par.sefer.orgao}`,
      par.relacaoNome,
      par.recibo,
      UI.marca,
    ].join('\n');
    setRecadoDupla(null);
    const temFolhaWeb =
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function';
    if (Platform.OS !== 'web' || temFolhaWeb) {
      try {
        await Share.share({ message: texto });
      } catch {
        // Cancelou ou a folha falhou: silêncio, igual às outras telas.
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
    setRecadoDupla(copiou ? UI.copiado : UI.naoCopiou);
  }

  // As duas colunas, rotuladas e nunca somadas. É o único desenho em que este
  // arquivo mostra parte do corpo — e sempre com o nome da obra em cima.
  const duasColunas = (par) => (
    <View style={styles.dColunas}>
      <View style={styles.dColuna}>
        <Text style={styles.dTradicao}>{par.manilio.tradicao}</Text>
        <Text style={styles.dParte}>{par.manilio.parte}</Text>
        <Text style={styles.dTipo}>{par.manilio.tipoNome}</Text>
        <Text style={styles.dConfianca}>{UI.confianca[par.manilio.confianca]}</Text>
      </View>
      <Text style={styles.dVersus}>×</Text>
      <View style={styles.dColuna}>
        <Text style={styles.dTradicao}>{par.sefer.tradicao}</Text>
        <Text style={styles.dParte}>{par.sefer.orgao}</Text>
        <Text style={styles.dTipo}>{par.sefer.tipoNome}</Text>
        <Text style={styles.dConfianca}>{UI.confianca[par.sefer.confianca]}</Text>
      </View>
    </View>
  );

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
        {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — o cartão abria com
            "♈ Áries" em corpo grande: a posição, sozinha, antes de qualquer
            motivo para se importar com ela. A linha que diz o que a lista antiga
            punha ali (zodiacBody.moon.part, que já nomeia o signo dentro da
            frase) passa a abrir, e o chip do signo desce para junto do verso
            latino e do locus de Manílio — que é onde a ficha desta tela sempre
            morou. Nada saiu, inclusive a linha em dourado que impede o cartão de
            virar calendário de procedimento.
            test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
        <View style={styles.card} testID="zodiacbody-moon">
          <Text style={styles.cardLabel}>{t('zodiacBody.moon.title')}</Text>
          {transit && moonEntry ? (
            <>
              <Text style={styles.moonPart}>
                {t('zodiacBody.moon.part', {
                  sign: signName(moonEntry.id),
                  part: t(signKey(moonEntry.id, 'part')),
                })}
              </Text>
              <Text style={styles.moonSign}>
                {transit.sign.emoji} {signName(moonEntry.id)}
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
              {/* CORTE DE RISCO SANITÁRIO — não recolocar.
                  Aqui havia zodiacBody.moon.practice: o parágrafo que explicava
                  que, entre os sécs. XIV e XVII, quem seguia o aforismo 20
                  deixava a região do corpo ligada ao signo lunar FORA DA
                  SANGRIA naqueles dois dias e meio. Estava no passado, com
                  fonte, com ressalva — e mesmo assim é o único bloco da tela
                  que atravessa a linha, porque não vinha sozinho: vinha logo
                  abaixo do cálculo REAL da Lua de HOJE e da região de HOJE.
                  Somados, o app entregava a conta pronta — "hoje é dia ruim
                  para mexer nesta parte do corpo" — que é exatamente o
                  momento bom/ruim para procedimento que a regra do dono
                  proíbe. Passava na varredura de test/zodiacBody.test.js
                  porque todo verbo estava no pretérito; a varredura pega
                  palavra, não pega a soma de dado ao vivo com regra
                  operacional.
                  A regra em si continua na tela, onde é história e não conta:
                  zodiacBody.history.rule.* e .instruments.*, dentro da seção
                  recolhida, sem data de hoje e sem o corpo de ninguém.
                  A chave zodiacBody.moon.practice segue no dicionário mas
                  APOSENTADA — o teste "o cartão da Lua de hoje não vira
                  calendário de procedimento" falha o build se ela voltar a ser
                  renderizada aqui. */}
              {/* Em dourado/negrito (noteStrong), não em corpo de texto: esta é
                  a única linha do cartão cuja função é frear uma decisão sobre
                  o corpo. Se ela parecer parágrafo, ninguém lê. */}
              <Text style={styles.noteStrong}>{t('zodiacBody.moon.notACalendar')}</Text>
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

        {/* ================================================================
            AS DUAS LISTAS — Manílio × Sefer Yetzirah
            Tudo daqui para baixo sai de lib/melotesiaDupla.js e do bloco
            `chrome` dos packs. Nenhuma string é escrita neste arquivo.
        ================================================================ */}
        <View style={styles.dSelo} testID="melotesia-selo">
          <Ionicons name="git-compare-outline" size={16} color={colors.gold} />
          <Text style={styles.dSeloTexto}>{UI.selo}</Text>
        </View>

        {!dupla ? (
          <Text style={styles.note} testID="melotesia-indisponivel">
            {UI.indisponivel}
          </Text>
        ) : (
          <>
            {/* A chamada: vida real primeiro, fonte depois. */}
            <Text style={styles.dChamada} testID="melotesia-chamada">
              {dupla.chamada}
            </Text>

            {/* O placar. O zero de coincidências é o conteúdo desta feature —
                por isso ele é o número grande, e não uma linha de rodapé. */}
            <View style={styles.dPlacarRow}>
              {RELACOES.map((k) => (
                <View key={k} style={styles.dPlacar} testID={`melotesia-placar-${k}`}>
                  <Text style={styles.dPlacarNumero}>{dupla.contagem[k]}</Text>
                  <Text style={styles.dPlacarRotulo}>{MELO.relacoes[k]}</Text>
                </View>
              ))}
            </View>
            {/* A etiqueta que separa fonte de leitura do app. Fica ANTES da
                comparação, não depois: quem lê só o placar tem que ter visto. */}
            <Text style={styles.dEtiquetaApp}>{UI.etiquetaApp}</Text>

            {/* ---- A linha do signo solar de quem está lendo ----
                O cartão inteiro só existe depois que o storage responde: um
                cartão com rótulo e sem conteúdo parece tela quebrada. */}
            {meuPar || parDeclarado ? (
            <View style={styles.card} testID="melotesia-meu-signo">
              <Text style={styles.cardLabel}>{UI.rotuloSeuSigno}</Text>
              {meuPar && meuPar.disponivel ? (
                <>
                  <Text style={styles.entryTitle}>
                    {meuPar.par.emoji} {meuPar.par.signoNome}
                  </Text>
                  {duasColunas(meuPar.par)}
                  <Text style={styles.dRelacao}>{meuPar.par.relacaoNome}</Text>
                  {meuPar.notaPrecisao ? (
                    <Text style={styles.note} testID="melotesia-precisao">
                      {meuPar.notaPrecisao}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.dShareBtn}
                    activeOpacity={0.85}
                    onPress={() => compartilharPar(meuPar.par)}
                    accessibilityRole="button"
                    accessibilityLabel={UI.compartilhar}
                    testID="melotesia-share-meu-signo"
                  >
                    <Ionicons name="share-social" size={15} color="#fff" />
                    <Text style={styles.dShareTexto}>{UI.compartilhar}</Text>
                  </TouchableOpacity>
                </>
              ) : parDeclarado ? (
                <>
                  <Text style={styles.entryTitle}>
                    {parDeclarado.emoji} {parDeclarado.signoNome}
                  </Text>
                  {duasColunas(parDeclarado)}
                  <Text style={styles.dRelacao}>{parDeclarado.relacaoNome}</Text>
                  <Text style={styles.note}>{UI.signoDeclarado}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.BIRTH_CHART)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    style={styles.cta}
                  >
                    <Text style={styles.ctaText}>{UI.irParaMapa}</Text>
                  </TouchableOpacity>
                </>
              ) : meuPar ? (
                <>
                  {/* Sem data não se chuta signo: o motor declara o que falta
                      e onde resolver, e a tela só imprime. */}
                  <Text style={styles.gloss} testID="melotesia-sem-data">
                    {meuPar.explicacao}
                  </Text>
                  <Text style={styles.note}>{meuPar.comoResolver}</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate(ROUTES.BIRTH_CHART)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    style={styles.cta}
                  >
                    <Text style={styles.ctaText}>{UI.irParaMapa}</Text>
                  </TouchableOpacity>
                </>
              ) : null}
            </View>
            ) : null}

            {/* ---- As doze linhas ---- */}
            <Text style={styles.dTituloTabela}>{UI.rotuloTabela}</Text>
            <Text style={styles.figureHint}>{UI.ajudaTabela}</Text>

            {dupla.pares.map((par) => {
              const estaAberto = duplaAberta === par.id;
              return (
                <View key={par.id} style={styles.dLinha} testID={`melotesia-linha-${par.id}`}>
                  <TouchableOpacity
                    style={styles.dLinhaTopo}
                    activeOpacity={0.85}
                    onPress={() => setDuplaEscolhida(estaAberto ? '' : par.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: estaAberto }}
                    accessibilityLabel={par.signoNome}
                    accessibilityHint={estaAberto ? UI.fechar : UI.abrir}
                    testID={`melotesia-abrir-${par.id}`}
                  >
                    <Text style={styles.dSigno}>
                      {par.emoji} {par.signoNome}
                    </Text>
                    <Ionicons
                      name={estaAberto ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>

                  {duasColunas(par)}
                  <Text style={styles.dRelacao}>{par.relacaoNome}</Text>

                  {estaAberto ? (
                    <View style={styles.dCorpo}>
                      {/* Prende primeiro: a cena de vida real. */}
                      <Text style={styles.dAbertura}>{par.abertura}</Text>
                      {/* Fonte depois: a leitura com as duas obras nomeadas. */}
                      <Text style={styles.gloss}>{par.leitura}</Text>

                      {par.manilio.camadaTardia ? (
                        <View style={styles.flag}>
                          <Text style={styles.flagText}>{par.manilio.camadaTardia}</Text>
                        </View>
                      ) : null}

                      {par.sefer.notaDaPalavra ? (
                        <Text style={styles.note} testID={`melotesia-korkeban-${par.id}`}>
                          {par.sefer.notaDaPalavra}
                        </Text>
                      ) : null}

                      <View style={styles.dRecibo}>
                        <Text style={styles.dReciboRotulo}>{UI.rotuloRecibo}</Text>
                        <Text style={styles.dReciboTexto} testID={`melotesia-recibo-${par.id}`}>
                          {par.recibo}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.dShareBtn}
                        activeOpacity={0.85}
                        onPress={() => compartilharPar(par)}
                        accessibilityRole="button"
                        accessibilityLabel={UI.compartilhar}
                        testID={`melotesia-share-${par.id}`}
                      >
                        <Ionicons name="share-social" size={15} color="#fff" />
                        <Text style={styles.dShareTexto}>{UI.compartilhar}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              );
            })}

            {recadoDupla ? <Text style={styles.dRecado}>{recadoDupla}</Text> : null}

            {/* ---- A conta, aberta para quem quiser conferir ---- */}
            <SecaoDupla
              titulo={UI.rotuloConta}
              rotuloAbrir={UI.abrir}
              rotuloFechar={UI.fechar}
              aberta
              testID="melotesia-secao-conta"
            >
              <Text style={styles.paragraph}>{dupla.estrutura}</Text>
            </SecaoDupla>

            {/* ---- De onde saíram as duas listas ---- */}
            <SecaoDupla
              titulo={UI.rotuloComoSurgiram}
              rotuloAbrir={UI.abrir}
              rotuloFechar={UI.fechar}
              testID="melotesia-secao-explicacao"
            >
              <Text style={styles.paragraph}>{dupla.explicacao}</Text>
            </SecaoDupla>

            {/* ---- As ressalvas que andam com toda leitura ---- */}
            <SecaoDupla
              titulo={UI.rotuloRessalvas}
              rotuloAbrir={UI.abrir}
              rotuloFechar={UI.fechar}
              testID="melotesia-secao-ressalvas"
            >
              <Text style={styles.paragraph}>{dupla.notaNaoFundir}</Text>
              <Text style={styles.paragraph}>{dupla.notaDaClassificacao}</Text>
              <Text style={styles.paragraph}>{dupla.notaLeituraDoApp}</Text>
              <Text style={styles.paragraph}>{dupla.notaKorkeban}</Text>
            </SecaoDupla>

            {/* ---- O bloqueio declarado, não escondido ---- */}
            {dupla.bloqueio ? (
              <SecaoDupla
                titulo={UI.rotuloBloqueio}
                rotuloAbrir={UI.abrir}
                rotuloFechar={UI.fechar}
                testID="melotesia-secao-bloqueio"
              >
                <Text style={styles.noteStrong}>{dupla.bloqueio}</Text>
              </SecaoDupla>
            ) : null}

            {/* ---- A bibliografia das duas listas ---- */}
            <SecaoDupla
              titulo={UI.rotuloFontes}
              rotuloAbrir={UI.abrir}
              rotuloFechar={UI.fechar}
              testID="melotesia-secao-fontes"
            >
              {bibliografia.map((f) => (
                <Text key={f} style={styles.source}>
                  · {f}
                </Text>
              ))}
            </SecaoDupla>
          </>
        )}

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
          {/* A ressalva vem ANTES da lista de plantas, não depois. Sem esta
              linha o bloco vira catálogo de uso; e no fim da seção ela só
              alcançava quem lesse os sete verbetes até o último. Quem para no
              terceiro é justamente quem precisava ter lido. */}
          <Text style={styles.noteStrong}>{t('zodiacBody.culpeper.warning')}</Text>
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

  // O chip do signo desceu para a ficha (a leitura abre): 16 em vez de 22, com
  // respiro em cima para separar do parágrafo. Continua em dourado — é a mesma
  // informação de sempre, só não é mais a manchete.
  moonSign: { color: colors.gold, fontSize: 16, fontWeight: '800', marginTop: 10 },
  moonPart: { color: colors.text, fontSize: 15, lineHeight: 22 },
  moonNext: { color: colors.teal, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  moonRate: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  // (moonPractice saiu junto com o parágrafo que ela estilizava — ver o
  //  comentário "CORTE DE RISCO SANITÁRIO" no cartão da Lua.)

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

  // ---- As duas listas (lib/melotesiaDupla.js) ----
  dSelo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
  },
  dSeloTexto: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  dChamada: { color: colors.text, fontSize: 15, lineHeight: 23 },

  dPlacarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  dPlacar: {
    flexGrow: 1,
    flexBasis: 96,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 4,
    alignItems: 'center',
  },
  dPlacarNumero: { color: colors.gold, fontSize: 28, fontWeight: '800', lineHeight: 32 },
  dPlacarRotulo: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center' },
  dEtiquetaApp: { color: colors.textMuted, fontSize: 11, lineHeight: 17, fontStyle: 'italic' },

  dTituloTabela: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 6,
  },

  dLinha: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  dLinhaTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dSigno: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },

  dColunas: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  dColuna: { flex: 1, gap: 2 },
  dTradicao: {
    color: colors.purple,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dParte: { color: colors.text, fontSize: 14, lineHeight: 20, fontWeight: '700' },
  dTipo: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  dConfianca: { color: colors.textMuted, fontSize: 10, lineHeight: 15 },
  dVersus: { color: colors.textMuted, fontSize: 14, fontWeight: '800', paddingTop: 14 },
  dRelacao: { color: colors.teal, fontSize: 12, lineHeight: 18, fontWeight: '700' },

  dCorpo: { gap: 10, marginTop: 2 },
  dAbertura: { color: colors.text, fontSize: 14, lineHeight: 21 },
  dRecibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 3,
  },
  dReciboRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dReciboTexto: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  dShareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dShareTexto: { color: '#fff', fontSize: 13, fontWeight: '800' },
  dRecado: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },

  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletMark: { color: colors.red, fontSize: 12, fontWeight: '800', width: 14, lineHeight: 19 },
  bulletText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
});
