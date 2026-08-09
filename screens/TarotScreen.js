import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import { TAROT_DECK, getSpreadPattern } from '../lib/tarotDeck';
import { getTarotImage } from '../lib/tarotImages';
// getCardName entra aqui em 01/08/2026. O pack de nomes existia e estava
// traduzido desde o passe de idioma; a tela nunca o chamou — lia card.name, que
// vem do TAROT_DECK em portugues. Resultado: em ingles o rotulo dizia "A Torre"
// e o paragrafo logo abaixo, traduzido, dizia "The Tower". O comentario em
// lib/tarotThemes.js:271 ja descrevia o contrato que a tela nao cumpria.
import { getThemedMeaning, getElementalDignity, getWaiteNote, getCardName } from '../lib/tarotThemes';
import { canDrawToday, recordDraw } from '../lib/tarotDailyLimit';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { getBonusTarotReadings, consumeBonusTarotReading } from '../lib/cosmeticRewards';
import { recordCardsSeen } from '../lib/tarotCollection';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';
import OneTimeLock from '../components/OneTimeLock';
import { recordReadingCompletion } from '../lib/readingCompletion';
import VoiceInsightRecorder from '../components/VoiceInsightRecorder';
import GroundingInvite from '../components/GroundingInvite';
// O PREPARO DE WAITE (01/08/2026) — lib/waiteRegras.js existia, com pack nos
// três idiomas e teste próprio passando, e NUNCA tinha sido ligado a uma tela.
// O cabeçalho do módulo já dizia onde ele encaixa: "o vão que hoje está vazio —
// o segundo entre escolher o tema e apertar tirar".
import { avaliarPergunta, preparoDaTiragem, progressoDoPreparo } from '../lib/waiteRegras';
import { PACK as PACK_WAITE_PT } from '../lib/traducoes/waiteRegras.pt.js';
import { PACK as PACK_WAITE_ES } from '../lib/traducoes/waiteRegras.es.js';
import { PACK as PACK_WAITE_EN } from '../lib/traducoes/waiteRegras.en.js';
// O MODO HISTÓRIA (08/08/2026) — a mesma leitura, um trecho por tela, como
// stories. paraSlides só REFORMATA: nenhum byte da prosa muda de lugar.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';

const FEATURE_KEY = 'tarot';

const THEMES = [
  { key: 'Amor', icon: 'heart', color: '#FF6BA0', grad: ['#FF6BA0', '#B57BFF'] },
  { key: 'Carreira', icon: 'briefcase', color: '#5CA8FF', grad: ['#5CA8FF', '#6C7BFF'] },
  { key: 'Dinheiro', icon: 'cash', color: '#5FD98C', grad: ['#5FD98C', '#5CE0D8'] },
  { key: 'Energia', icon: 'flash', color: '#FFB84D', grad: ['#FFB84D', '#FF8C5C'] },
  { key: 'Saúde', icon: 'medkit', color: '#5CE0D8', grad: ['#5CE0D8', '#6C7BFF'] },
];

// As três casas da tiragem. A POSIÇÃO É PARTE DO SIGNIFICADO — isso é a
// afirmação mais antiga e mais segura da leitura documentada (Etteilla,
// 1770/1783; Waite, "Pictorial Key", 1911). Por isso ela é passada para
// getThemedMeaning e a mesma carta lê diferente em cada casa.
//
// BUG QUE ISTO CORRIGE (31/07/2026): as três chamadas de getThemedMeaning aqui
// omitiam o quarto argumento. O rótulo "Passado / Presente / Futuro" aparecia
// em cima da carta, mas o texto embaixo ignorava a casa: A Torre no Passado e
// A Torre no Futuro saíam com a MESMA leitura, palavra por palavra. A camada de
// interpretação sabia ler por casa desde a véspera; a tela nunca perguntou.
//
// E o que NÃO se pode dizer: esta tiragem de três rotulada
// Passado/Presente/Futuro é popularização do século XX. Não está em Waite (que
// dá 10, 42 e 35 cartas), não está no "Book T", e não há fonte primária datada
// para ela. Por isso o app nunca a chama de "clássica" nem de "tradicional".
// Ver docs/tradicao/05, §3.6.
const POSITIONS = ['Passado', 'Presente', 'Futuro'];

// ---------------------------------------------------------------------------
// O CHROME DO PREPARO — sai do PACK do próprio módulo, nunca de lib/i18n.js
// ---------------------------------------------------------------------------
// Esta tela não redige uma linha do preparo: título, aberturas, as quatro
// regras, os recibos e a datação vêm de preparoDaTiragem(opcoes, lang), e os
// rótulos de interface vêm do bloco `tela` dos packs de lib/traducoes/
// waiteRegras.{pt,es,en}.js. Se faltar palavra, ela nasce lá nos três — nunca
// aqui dentro.
//
// PARA O INTEGRADOR: este mapa é o mesmo `packDoIdioma` de lib/waiteRegras.js e
// o lugar dele é lá, exportado como `chromeDoPreparo(lang)`. Ele mora aqui só
// porque a passagem que ligou o módulo não podia editar o motor; mover é uma
// linha de import a menos nesta tela e nenhuma mudança de comportamento.
const PACKS_DO_PREPARO = { pt: PACK_WAITE_PT, es: PACK_WAITE_ES, en: PACK_WAITE_EN };

function chromeDoPreparo(lang) {
  const pack = PACKS_DO_PREPARO[lang] || PACKS_DO_PREPARO.pt;
  // `rotuloCampo` e `ajudaCampo` já existiam no pack (bloco `pergunta`) e não
  // saem por nenhuma função do motor — são repassados, nunca reescritos.
  return { ...pack.tela, rotuloCampo: pack.pergunta.rotulo, ajudaCampo: pack.pergunta.ajuda };
}

// Molde → texto, o mesmo `preencher` de lib/idadeReal.js e lib/mitos.js: chave
// ausente fica à vista em vez de virar "undefined" no meio da frase. É
// mecânica, não redação — o único molde do preparo é `{s}`, os segundos que
// faltam na contagem.
function preencherMolde(molde, vars = {}) {
  return String(molde).replace(/\{(\w+)\}/g, (bruto, chave) =>
    Object.prototype.hasOwnProperty.call(vars, chave) ? String(vars[chave]) : bruto
  );
}

export default function TarotScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — antes só cobria casal, o que destravava o Tarô por completo
  // pra quem usava sem parceiro (achado real de bug: dava pra tirar cartas em
  // vários temas, repetidas vezes, sem nunca pedir assinatura). Corrigido na
  // origem (contexto), não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  // `lang` é tão obrigatório aqui quanto `t`: os packs de tradução do tarô
  // (lib/traducoes/tarot.{es,en}.js, 118 KB escritos em 31/07/2026) só entram
  // se a tela PEDIR o idioma. Sem isso os motores caem no default 'pt' e o
  // usuário em espanhol/inglês lê a tiragem inteira em português com a
  // tradução publicada ao lado, sem ser chamada. Foi exatamente o que
  // aconteceu — a auditoria pegou, e é o bug mais caro do lote.
  const { t, lang } = useLanguage();
  // Tarô vive no TarotStack (dentro de TAROT_TAB) e Planos/Loja vivem em
  // outras abas — mesmo helper do OneTimeLock.js: getParent() sobe pro
  // Tab.Navigator, e o fallback cobre o caso de a tela ser a própria raiz.
  const navigateFromTab = (...args) => (navigation.getParent() || navigation).navigate(...args);
  const [theme, setTheme] = useState(THEMES[0]);
  const [drawn, setDrawn] = useState(null);
  const [revealed, setRevealed] = useState([false, false, false]);
  const [orientations, setOrientations] = useState([false, false, false]);
  const [dailyBlocked, setDailyBlocked] = useState(false);
  const [locked, setLocked] = useState(false);
  const [journalEntryId, setJournalEntryId] = useState(null);
  // Leitura Bônus, comprada na Loja (lib/cosmeticRewards.js) — deixa furar o
  // limite diário do tema UMA vez por bônus guardado. Recarrega no foco (não
  // só no mount) pra refletir uma compra feita na Loja e voltar direto pro Tarô.
  const [bonusReadings, setBonusReadings] = useState(0);

  // ---- O PREPARO DE WAITE, no vão antes de tirar ----
  // Só DUAS coisas moram aqui em cima; o resto do estado é do próprio painel.
  // `preparoFeitas` sobe porque o rótulo do botão de tirar depende dele — e é
  // exatamente para isso que progressoDoPreparo() devolve `completo`: para
  // TROCAR O RÓTULO, nunca para desabilitar o botão (lib/waiteRegras.js, "O APP
  // NÃO TRANCA O BOTÃO"). Waite chamou os quatro itens de notas de prática, não
  // de condições, e gatear a tiragem seria inventar rigor que a fonte não tem.
  // Nada aqui toca paywall, limite diário ou leitura bônus.
  const [preparoAberto, setPreparoAberto] = useState(false);
  const [preparoFeitas, setPreparoFeitas] = useState([]);
  const marcarRegraDoPreparo = useCallback((id, feita) => {
    Haptics.selectionAsync();
    setPreparoFeitas((prev) => {
      if (feita) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  }, []);
  const progressoDoWaite = useMemo(() => progressoDoPreparo(preparoFeitas, lang), [preparoFeitas, lang]);

  // ---- O MODO HISTÓRIA ----
  // O corpo é o MESMO que drawCards() grava no Diário (casa por casa + a
  // leitura transversal da tiragem), remontado aqui porque a tela guarda a
  // tiragem em estado, não o texto pronto. São as mesmas funções do motor com
  // os mesmos argumentos — o modo história só reformata a exibição. Vazio
  // enquanto houver carta fechada: o leitor não entrega o desfecho de uma
  // carta que a pessoa ainda não abriu.
  const [historiaAberta, setHistoriaAberta] = useState(false);
  const slidesDaTiragem = useMemo(() => {
    if (!drawn || !revealed.every(Boolean)) return [];
    const readings = drawn.map((card, i) => {
      const orientationTag = orientations[i] ? t('tarot.reversedTag') : '';
      const casa = t(`tarot.position.${POSITIONS[i]}`);
      return `${casa} — ${getCardName(card, lang)}${orientationTag}: ${getThemedMeaning(card, theme.key, orientations[i], POSITIONS[i], lang)}`;
    });
    const body = [...readings, getElementalDignity(drawn, lang), getSpreadPattern(drawn, lang)]
      .filter(Boolean)
      .join('\n\n');
    return paraSlides(body);
  }, [drawn, revealed, orientations, theme.key, lang, t]);

  // Todo tema libera só 1 tiragem por dia (ver lib/tarotDailyLimit) — recheca
  // sempre que o tema muda, já que a resposta é assíncrona (AsyncStorage).
  useEffect(() => {
    let active = true;
    canDrawToday(theme.key).then((ok) => {
      if (active) setDailyBlocked(!ok);
    });
    return () => {
      active = false;
    };
  }, [theme.key]);

  useFocusEffect(
    useCallback(() => {
      getBonusTarotReadings().then(setBonusReadings);
    }, [])
  );

  // Bloqueio vitalício (1 uso grátis, pra tela inteira, qualquer tema) — pra
  // quem NÃO tem acesso completo (solo, ou casal sem assinatura). Independente
  // do dailyBlocked acima, que é o limite diário por tema (vale até pra quem
  // já assina).
  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess, accessConfirmed]);

  // viaBonus=true (botão "Usar Leitura Bônus") fura AS DUAS travas — o
  // limite diário do tema E o bloqueio vitalício de quem não assina —
  // consumindo 1 recompensa comprada na Loja (lib/cosmeticRewards.js). É um
  // consumível pago com tokens: quem comprou tem direito de usar, assinante
  // ou não (antes só furava o limite diário, então quem não assinava e já
  // tinha gasto a leitura grátis ficava com a recompensa presa pra sempre —
  // achado real de auditoria adversarial, 26/07/2026).
  const drawCards = async (viaBonus = false) => {
    if (viaBonus) {
      const consumed = await consumeBonusTarotReading();
      if (!consumed) return;
      setBonusReadings((n) => Math.max(0, n - 1));
    } else {
      // Guarda o uso-único-na-vida aqui dentro, não só no gate de render — sem
      // isso, "Nova Tiragem" reatribui `drawn` diretamente (nunca passa por
      // null), então o gate baseado em `!drawn` nunca voltaria a bloquear
      // (achado por verificação adversarial: dava tiragens grátis infinitas
      // no mesmo tema, sem sair da tela).
      if (!hasAccess && locked) return;
      // Guarda também aqui, não só no botão inicial — sem isso, "Nova Tiragem"
      // (que chama esta mesma função) deixaria redesenhar à vontade num tema
      // com limite diário, mesmo já tendo consultado hoje.
      if (dailyBlocked) return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const shuffled = [...TAROT_DECK].sort(() => Math.random() - 0.5).slice(0, 3);
    const newOrientations = shuffled.map(() => Math.random() < 0.5);
    setDrawn(shuffled);
    setRevealed([false, false, false]);
    setOrientations(newOrientations);
    setJournalEntryId(null); // nova tiragem: solta o gravador de voz da entrada anterior
    recordDraw(theme.key);
    // Álbum das 78 Cartas (lib/tarotCollection.js) — toda carta tirada fica
    // colecionada; fire-and-forget, nunca atrasa a tiragem em si.
    recordCardsSeen(shuffled.map((c) => c.id));
    markFeatureUsedOnce(FEATURE_KEY);
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — trocar de tema ou tocar "Nova Tiragem" na mesma sessão deixaria
    // repetir o uso grátis várias vezes antes do bloqueio realmente pegar
    // (achado por verificação adversarial).
    //
    // As DUAS travas realmente ficam de pé na mesma tiragem, e isso está
    // certo como ESTADO: a pessoa consumiu a prévia vitalícia (se não assina)
    // E consumiu a tiragem de hoje daquele tema. O que estava errado era o
    // app FALAR as duas ao mesmo tempo — ver `previaVitaliciaGasta` /
    // `limiteDiarioReal` mais abaixo, que decidem qual das duas é a verdade
    // que a pessoa lê na tela.
    if (!hasAccess) setLocked(true);
    setDailyBlocked(true);

    // O que vai pro Diário Cósmico é a leitura INTEIRA, casa por casa, mais a
    // leitura transversal da tiragem (dignidade elemental + grau repetido /
    // naipe dominante). Sem isso o diário guardava três verbetes soltos, e a
    // tiragem de três não é três leituras soltas.
    const readings = shuffled
      .map((card, i) => {
        // O que vai pro Diário também é traduzido: era aqui que a entrada
        // nascia com 'Passado' e '(invertida)' em português mesmo no app em
        // inglês, e ficava gravada assim pra sempre.
        const orientationTag = newOrientations[i] ? t('tarot.reversedTag') : '';
        const casa = t(`tarot.position.${POSITIONS[i]}`);
        return `${casa} — ${getCardName(card, lang)}${orientationTag}: ${getThemedMeaning(card, theme.key, newOrientations[i], POSITIONS[i], lang)}`;
      });
    const dignity = getElementalDignity(shuffled, lang);
    const pattern = getSpreadPattern(shuffled, lang);
    const body = [...readings, dignity, pattern].filter(Boolean).join('\n\n');
    const { entryId } = await recordReadingCompletion({
      type: 'tarot',
      typeLabel: 'Leitura de Tarô',
      title: `Tarô de ${theme.key} — Passado, Presente e Futuro`,
      body,
    });
    setJournalEntryId(entryId);
  };

  const reveal = (i) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRevealed((prev) => prev.map((v, idx) => (idx === i ? true : v)));
  };

  // `!drawn` importa aqui: marcamos `locked=true` no instante em que a
  // tiragem grátis é consumida (drawCards), mas a pessoa ainda precisa VER
  // as cartas que acabou de ganhar — só bloqueamos de fato na próxima
  // tentativa (troca de tema ou nova tiragem, que zeram `drawn`).
  // `bonusReadings === 0` também importa: quem tem Leitura Bônus comprada na
  // Loja precisa da tela real pra USAR o bônus — este OneTimeLock em tela
  // cheia escondia o botão de usar e deixava a recompensa presa pra sempre
  // pra quem não assina (achado real de auditoria adversarial, 26/07/2026).
  const lockedSemBonus = !hasAccess && locked && bonusReadings === 0;
  if (lockedSemBonus && !drawn) {
    return <OneTimeLock featureTitle={t('tarot.title')} gradient={gradients.hero} />;
  }
  // Estado "só com bônus": sem assinatura, leitura grátis já gasta, mas com
  // Leitura Bônus guardada — a área vazia abaixo mostra o botão de usar o
  // bônus no lugar do "Tirar 3 Cartas" normal.
  const soPodeUsarBonus = !hasAccess && locked && bonusReadings > 0;

  // ---- Qual das duas réguas é a verdade PRA ESTA PESSOA, agora ----
  // O Tarô tem dois limites e eles não valem pro mesmo público:
  //   • prévia grátis VITALÍCIA (lib/featureUsage.js) — quem NÃO assina tira
  //     uma tiragem na vida. Não renova amanhã, nem depois de amanhã.
  //   • limite DIÁRIO por tema (lib/tarotDailyLimit.js) — a régua de quem
  //     ASSINA: 1 tiragem por tema por dia, essa sim volta amanhã.
  // O bug (achado 29/07/2026): drawCards() liga as duas na mesma tiragem e a
  // tela escolhia a frase errada. Quem não assina tirava as 3 cartas, lia
  // "volta amanhã pra uma nova" — e, saindo da aba e voltando no MESMO dia,
  // encontrava a aba inteira virada em "Você já usou sua leitura gratuita".
  // O app se contradizia em minutos e, amanhã, entregava paywall no lugar da
  // tiragem prometida. Além disso o botão de assinar nunca aparecia nesse
  // primeiro estado, porque o ramo do limite diário vinha primeiro.
  // Regra agora: na hora de FALAR, a prévia vitalícia tem precedência sobre o
  // limite diário. Quem não assina nunca lê "amanhã"; só quem assina lê.
  const previaVitaliciaGasta = !hasAccess && locked;
  const limiteDiarioReal = dailyBlocked && !previaVitaliciaGasta;

  return (
    <View style={styles.root}>
      <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{t('tarot.title')}</Text>
            <Text style={styles.subtitle}>{t('tarot.subtitle')}</Text>
          </View>
          {/* Álbum das 78 Cartas — cada carta tirada fica colecionada lá. */}
          <TouchableOpacity
            style={styles.albumBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate(ROUTES.TAROT_ALBUM)}
            accessibilityRole="button"
            accessibilityLabel="Abrir Álbum de Cartas"
          >
            <Ionicons name="albums" size={20} color="#fff" />
            <Text style={styles.albumBtnText}>{t('tarot.album')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>{t('tarot.chooseTheme')}</Text>
        <View style={styles.themeRow}>
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.themeChip, theme.key === t.key && { borderColor: t.color, backgroundColor: t.color + '22' }]}
              onPress={() => { Haptics.selectionAsync(); setTheme(t); setDrawn(null); setJournalEntryId(null); }}
            >
              <Ionicons name={t.icon} size={20} color={t.color} />
              <Text style={styles.themeText}>{t.key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!drawn ? (
          <View style={styles.emptyWrap}>
            <View style={styles.deckStack}>
              <LinearGradient colors={theme.grad} style={[styles.deckCard, { transform: [{ rotate: '-8deg' }] }]} />
              <LinearGradient colors={theme.grad} style={[styles.deckCard, { transform: [{ rotate: '4deg' }] }]}>
                <Ionicons name="sparkles" size={40} color="rgba(255,255,255,0.6)" />
              </LinearGradient>
            </View>
            {limiteDiarioReal || soPodeUsarBonus ? (
              <>
                <Ionicons
                  name={previaVitaliciaGasta ? 'lock-closed-outline' : 'time-outline'}
                  size={40}
                  color={theme.color}
                  style={{ marginBottom: 12 }}
                />
                <Text style={styles.emptyTitle}>
                  {/* Duas frases, dois públicos. "Volta amanhã" só sai pra
                      quem realmente vai ter tiragem amanhã (assinante). Pra
                      quem não assina, a verdade é que a prévia é uma só e não
                      renova — dizer o contrário é prometer o que o app não
                      vai cumprir. */}
                  {limiteDiarioReal
                    ? `Você já consultou o tema ${theme.key} hoje. Essa tiragem é única por dia — assuntos sérios como esse merecem uma resposta, não uma repetição até achar a que você quer ouvir. Volta amanhã.`
                    : 'Você já usou sua leitura gratuita de Tarô — ela é uma só e não renova amanhã. Mas você tem Leitura Bônus guardada da Loja: use uma agora, ou assine pra tirar cartas todo dia.'}
                </Text>
                {bonusReadings > 0 ? (
                  <TouchableOpacity activeOpacity={0.85} onPress={() => drawCards(true)} style={styles.btnWrap}>
                    <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                      <Ionicons name="sparkles" size={18} color="#fff" />
                      <Text style={styles.btnText}>Usar Leitura Bônus ({bonusReadings})</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  // Quem TEM bônus ganha botão logo acima; quem não tem ficava
                  // sem ação nenhuma neste bloco, e o único jeito de conseguir
                  // uma tiragem hoje (comprar Leitura Bônus na Loja) não era
                  // oferecido em lugar nenhum do app.
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.bonusStoreBtn}
                    onPress={() => navigateFromTab(ROUTES.PROFILE_TAB, { screen: ROUTES.LOJA })}
                  >
                    <Ionicons name="bag-handle" size={16} color={colors.gold} />
                    <Text style={styles.bonusStoreText}>{t('tarot.dailyLimit.storeCta')}</Text>
                  </TouchableOpacity>
                )}
                {/* Quem não assina lê aqui "ou assine pra tirar cartas todo
                    dia" — pedido sem botão é pedido morto. O toque que leva a
                    Planos vem colado na frase (mesmo padrão já aplicado no
                    resto do app). */}
                {previaVitaliciaGasta && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.bonusStoreBtn, { marginTop: 10 }]}
                    onPress={() => navigateFromTab(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                  >
                    <Ionicons name="diamond" size={16} color={colors.gold} />
                    <Text style={styles.bonusStoreText}>{t('tarot.locked.cta')}</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <Text style={styles.emptyTitle}>Concentre-se na sua pergunta sobre {theme.key.toLowerCase()}</Text>

                {/* AS QUATRO NOTAS DE PRÁTICA DE WAITE (1911) — convite, nunca
                    obstáculo: entra fechado, abre com um toque, fecha com
                    outro, e o botão de tirar continua logo abaixo o tempo
                    todo, habilitado, faça a pessoa zero ou quatro. */}
                <PreparoDeWaite
                  lang={lang}
                  aberto={preparoAberto}
                  onAlternar={() => setPreparoAberto((v) => !v)}
                  feitas={preparoFeitas}
                  onMarcar={marcarRegraDoPreparo}
                  progresso={progressoDoWaite}
                />

                <TouchableOpacity activeOpacity={0.85} onPress={() => drawCards()} style={styles.btnWrap}>
                  <LinearGradient colors={theme.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="hand-left" size={18} color="#fff" />
                    {/* Feitas as quatro, o rótulo muda — e só o rótulo. Quem
                        não fez nenhuma lê o de sempre, do dicionário da tela. */}
                    <Text style={styles.btnText}>
                      {progressoDoWaite.completo ? progressoDoWaite.botao : t('tarot.draw')}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.cardsRow}>
              {drawn.map((card, i) => (
                <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => reveal(i)} style={styles.tarotCard}>
                  {revealed[i] ? (
                    <>
                      <View style={styles.tarotFace}>
                        <Image
                          source={getTarotImage(card.id)}
                          style={[styles.tarotImage, orientations[i] && { transform: [{ rotate: '180deg' }] }]}
                          resizeMode="cover"
                        />
                      </View>
                      <Text style={styles.tarotName} numberOfLines={2}>
                        {getCardName(card, lang)}
                        {orientations[i] ? t('tarot.reversedTag') : ''}
                      </Text>
                    </>
                  ) : (
                    <LinearGradient colors={['#2A1D52', '#1A1235']} style={styles.tarotBack}>
                      <Ionicons name="sparkles" size={26} color={theme.color} />
                      <Text style={styles.tapText}>{t('tarot.tap')}</Text>
                    </LinearGradient>
                  )}
                  <Text style={styles.posLabel}>{t(`tarot.position.${POSITIONS[i]}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* O MODO HISTÓRIA — acima do texto da leitura, e só com as três
                cartas viradas: o botão abre a MESMA leitura que está logo
                abaixo, um trecho por tela. Nenhum gate muda: quem chegou aqui
                já tem a tiragem na tela. */}
            {revealed.every(Boolean) && (
              <TouchableOpacity
                style={styles.historiaBtn}
                activeOpacity={0.85}
                onPress={() => setHistoriaAberta(true)}
                accessibilityRole="button"
                accessibilityLabel={t('stories.ver')}
              >
                <Ionicons name="sparkles" size={16} color={colors.gold} />
                <Text style={styles.historiaBtnText}>{t('stories.ver')}</Text>
              </TouchableOpacity>
            )}

            {drawn.map((card, i) => {
              if (!revealed[i]) return null;
              // Waite, 1911, verbatim — só nas cartas em que a citação está
              // conferida (11 das 78). Fica FORA da leitura, numa nota
              // rotulada: é história do baralho, não é o app dizendo isso
              // sobre a vida de quem consultou. Nas outras 67 cartas não
              // aparece nada, porque não citar é melhor que citar de ouvido.
              const waite = getWaiteNote(card, lang);
              return (
                <View key={i} style={styles.meaningCard}>
                  <View style={[styles.meaningIcon, { backgroundColor: theme.color + '22' }]}>
                    <Ionicons name={card.icon} size={20} color={theme.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.meaningPos}>{t(`tarot.position.${POSITIONS[i]}`)} · {getCardName(card, lang)}{orientations[i] ? t('tarot.reversedTag') : ''}</Text>
                    <Text style={styles.meaningText}>
                      {getThemedMeaning(card, theme.key, orientations[i], POSITIONS[i], lang)}
                    </Text>
                    {waite && (
                      <View style={styles.sourceBox}>
                        <Text style={styles.sourceTitle}>{waite.titulo}</Text>
                        <Text style={styles.sourceQuote}>“{waite.verbatim}”</Text>
                        <Text style={styles.sourceNote}>{waite.nota}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}

            {/* AS RESSALVAS, UMA VEZ — e só as que valem para ESTA tiragem.
                (31/07/2026) Antes elas vinham coladas dentro do texto de cada
                carta: "que pode ser uma pessoa ou uma postura sua" nas 16
                cortes, "travado, em excesso ou virado pra dentro" nas 78
                invertidas, e "um Arcano Maior põe em jogo o eixo da relação,
                não o episódio" nos 22 Maiores. As três são verdadeiras. As três
                são iguais para dezenas de cartas — e é por isso mesmo que elas
                não podem morar dentro da leitura: uma frase que serve para 22
                arcanos não diz nada sobre o arcano que saiu, e repetida três
                vezes na mesma tela ela deixa de ser lida.
                Ressalva é contrato: vale uma vez, no lugar de contrato. Aqui.
                E aparece condicional — quem tirou três cartas direitas e sem
                corte não lê nada disto. */}
            {revealed.every(Boolean) && (() => {
              const temInvertida = orientations.some(Boolean);
              const temCorte = drawn.some((c) => c.suit && c.number >= 11);
              const temMaior = drawn.some((c) => c.arcana === 'maior');
              if (!temInvertida && !temCorte && !temMaior) return null;
              return (
                <View style={styles.spreadCard}>
                  <Text style={styles.spreadTitle}>{t('tarot.howToRead')}</Text>
                  {temMaior && (
                    <Text style={styles.spreadText}>
                      Saiu Arcano Maior. A tradição lê os 22 como assunto de outra ordem de grandeza:
                      o eixo, não o episódio; o rumo, não a tarefa. Isso vale igual para os 22 — o que
                      diferencia o seu está na leitura dele, acima.
                    </Text>
                  )}
                  {temCorte && (
                    <Text style={[styles.spreadText, temMaior && { marginTop: 10 }]}>
                      Saiu figura de corte (Valete, Cavaleiro, Rainha ou Rei). Corte pode ser uma pessoa
                      da sua vida ou uma postura sua — ler corte como se fosse sempre gente é o erro mais
                      comum da tiragem de três.
                    </Text>
                  )}
                  {temInvertida && (
                    <Text style={[styles.spreadText, (temMaior || temCorte) && { marginTop: 10 }]}>
                      Saiu carta invertida. Invertida aqui não é o oposto da carta: é a mesma energia
                      travada, em excesso ou virada para dentro — qual das três é o caso está escrito na
                      leitura da carta. Nota honesta: ler assim é escola contemporânea (Eden Gray,
                      Rachel Pollack, Mary K. Greer). Em Waite, 1911, a invertida costuma ser lateral, e
                      às vezes melhor que a direta.
                    </Text>
                  )}
                </View>
              );
            })()}

            {/* A TIRAGEM INTEIRA, não três leituras soltas.
                Duas camadas, as duas com fonte e as duas marcadas com o grau
                da fonte:
                • Dignidade elemental — regra da tríade do "Book T" (Mathers,
                  fim do séc. XIX, publicado por Regardie em 1937-1940): a
                  carta do meio é lida através das duas ao lado. A tiragem
                  deste app é exatamente uma tríade, então a doutrina cabe
                  inteira, sem adaptação.
                • Grau repetido / naipe dominante / concentração de Maiores —
                  leitura transversal consolidada no séc. XX. É boa, e o
                  código não a chama de antiga.
                As duas funções devolvem null quando a doutrina não se aplica
                (Maior de atribuição planetária no meio, nenhum padrão na
                tiragem) — nunca fabricam padrão onde não há. Só aparece com as
                três cartas viradas: antes disso seria entregar o desfecho de
                uma carta que a pessoa ainda não abriu. */}
            {revealed.every(Boolean) && (() => {
              const dignity = getElementalDignity(drawn, lang);
              const pattern = getSpreadPattern(drawn, lang);
              if (!dignity && !pattern) return null;
              return (
                <View style={styles.spreadCard}>
                  <Text style={styles.spreadTitle}>{t('tarot.threeTogether')}</Text>
                  {dignity && <Text style={styles.spreadText}>{dignity}</Text>}
                  {pattern && <Text style={[styles.spreadText, dignity && { marginTop: 10 }]}>{pattern}</Text>}
                  {/* Toda vez que o app cita astrologia de carta, ele diz de
                      QUEM é a tabela. Há pelo menos três incompatíveis entre
                      si, e quem escreve "a correspondência astrológica do
                      tarô" está escondendo uma escolha. */}
                  <Text style={styles.spreadFootnote}>
                    As atribuições acima são as da Golden Dawn (“Book T”). Existem pelo menos três tabelas
                    incompatíveis — a continental de Lévi/Papus desloca todas as letras em uma casa, e o Thoth
                    de Crowley (1944) troca Heh e Tzaddi. Este app escolheu uma e diz qual.
                  </Text>
                </View>
              );
            })()}

            {journalEntryId && (
              <VoiceInsightRecorder
                entryId={journalEntryId}
                readingType="tarot"
                readingTitle={`Tarô de ${theme.key} — Passado, Presente e Futuro`}
              />
            )}

            {/* Fecha a leitura: convite pra ficar alguns minutos com o que
                acabou de ler (screens/GroundingScreen.js). Card, nunca modal,
                e sem recompensa nenhuma — o porquê está em
                components/GroundingInvite.js. */}
            <GroundingInvite />

            {/* ORDEM IMPORTA: o ramo do limite diário vinha primeiro e, como
                drawCards() liga dailyBlocked em TODA tiragem, quem não assina
                lia "volta amanhã pra uma nova" logo abaixo das cartas — e o
                botão de assinar nunca chegava a aparecer neste primeiro
                estado. A prévia vitalícia vem primeiro agora, porque é ela
                que decide o que acontece amanhã pra essa pessoa. */}
            {previaVitaliciaGasta ? (
              // drawCards() já recusa redesenhar nesse caso — aqui é só pra não
              // deixar um botão "morto" que não faz nada visível ao tocar.
              // O texto ocupa o lugar do botão "Nova Tiragem": pedia assinatura
              // e não levava a Planos. Agora o pedido vem com o toque colado.
              <>
                {/* Frase que vale pros dois jeitos de chegar aqui (tiragem
                    grátis OU Leitura Bônus): o que importa é que a prévia é
                    uma só e não renova. Nada de "volta amanhã" — amanhã, sem
                    assinatura, é paywall. */}
                <Text style={styles.dailyLimitNote}>
                  Sua prévia grátis de Tarô é uma só e não renova amanhã — assine pra tirar cartas todo dia, em qualquer tema.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.btnWrap, { marginTop: 14 }]}
                  onPress={() => navigateFromTab(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                >
                  <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="diamond" size={18} color="#fff" />
                    <Text style={styles.btnText}>{t('tarot.locked.cta')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
                {/* Ainda tem bônus guardado da Loja: dá pra tirar outra agora
                    mesmo, sem assinar — a recompensa paga com tokens não pode
                    ficar presa atrás do paywall (mesmo motivo do cenário [3]
                    da regressão E2E). */}
                {bonusReadings > 0 && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.bonusStoreBtn, { marginTop: 10 }]}
                    onPress={() => drawCards(true)}
                  >
                    <Ionicons name="sparkles" size={16} color={colors.gold} />
                    <Text style={styles.bonusStoreText}>Usar Leitura Bônus ({bonusReadings})</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : limiteDiarioReal ? (
              // Aqui "amanhã" é verdade: quem assina tem tiragem nova em cada
              // tema quando o dia virar. E hoje ainda sobram os outros temas —
              // por isso a frase aponta pra saída que existe agora.
              <>
                <Text style={styles.dailyLimitNote}>
                  Essa foi a sua tiragem de {theme.key} de hoje — volta amanhã pra uma nova. Os outros temas lá em cima ainda têm a tiragem deles hoje.
                </Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.bonusStoreBtn, { marginTop: 10 }]}
                  onPress={() => navigateFromTab(ROUTES.PROFILE_TAB, { screen: ROUTES.LOJA })}
                >
                  <Ionicons name="bag-handle" size={16} color={colors.gold} />
                  <Text style={styles.bonusStoreText}>{t('tarot.dailyLimit.storeCta')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity activeOpacity={0.85} onPress={() => drawCards()} style={[styles.btnWrap, { marginTop: 16 }]}>
                <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.btn}>
                  <Ionicons name="refresh" size={18} color="#fff" />
                  <Text style={styles.btnText}>{t('tarot.drawAgain')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <StoriesReader
        visible={historiaAberta}
        slides={slidesDaTiragem}
        titulo={t('tarot.title')}
        onClose={() => setHistoriaAberta(false)}
      />
    </View>
  );
}

// ===========================================================================
// O PREPARO DE WAITE — as quatro notas de prática, entre escolher o tema e
// apertar tirar
// ===========================================================================
// LEIA lib/waiteRegras.js ANTES DE MEXER EM QUALQUER TEXTO DAQUI. Este painel é
// VITRINE: ele mostra o que o motor exporta e não redige conteúdo. Todo texto
// vem de preparoDaTiragem(), avaliarPergunta(), progressoDoPreparo() e do bloco
// `tela` dos três packs. Se faltar palavra, ela nasce no pack, nos três
// idiomas — nunca dentro deste componente.
//
// TRÊS DECISÕES QUE NÃO SÃO ESTÉTICA:
//
// 1. FECHADO POR PADRÃO, E FÁCIL DE FECHAR DE NOVO. Quatro regras abertas em
//    cima de quem só quer tirar carta viram paredão, e paredão é obstáculo. O
//    cartão fechado mostra a isca (vida real, sem Waite e sem ano — a fonte
//    está a um toque, dentro) e a linha de estado. Tem "fechar e tirar direto"
//    no fim do painel, e o botão de tirar nunca sai da tela.
// 2. NADA AQUI TRANCA NADA. Não há gate, não há `disabled`, não há tempo
//    mínimo: paywall, limite diário por tema e leitura bônus continuam sendo os
//    únicos donos do que pode ou não ser tirado, exatamente como estavam. O
//    progresso serve para trocar o rótulo do botão e para a linha de estado.
// 3. A CONTAGEM É UMA OFERTA. Os vinte segundos são medida do app (o pack diz
//    isso com todas as letras onde aparece) e o botão de contar é opcional:
//    quem não quiser contar marca a regra como feita na mão, ou não marca.
//
// STORAGE: nenhum. O preparo é o gesto de agora, nesta cadeira — não há o que
// guardar, e por isso esta tela continua sem tocar em AsyncStorage.
function PreparoDeWaite({ lang, aberto, onAlternar, feitas, onMarcar, progresso }) {
  const UI = chromeDoPreparo(lang);
  // 'voce' | 'outra' — a única coisa que muda a saída do motor, e a quarta
  // regra é a única regra que responde a ela.
  const [paraQuem, setParaQuem] = useState('voce');
  const [pergunta, setPergunta] = useState('');
  const [restam, setRestam] = useState(null);
  const [fontesAbertas, setFontesAbertas] = useState(false);

  const preparo = useMemo(() => preparoDaTiragem({ paraQuem }, lang), [paraQuem, lang]);
  const avaliacao = useMemo(() => avaliarPergunta(pergunta, lang), [pergunta, lang]);

  // A contagem regressiva do embaralho. Chegando a zero, marca a segunda regra
  // como feita — é o único lugar em que o app marca algo sozinho, e é porque o
  // gesto acabou de acontecer na tela.
  useEffect(() => {
    if (restam === null) return undefined;
    if (restam <= 0) {
      setRestam(null);
      onMarcar('embaralhar', true);
      return undefined;
    }
    const id = setTimeout(() => setRestam((s) => (s === null ? null : s - 1)), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restam]);

  if (!aberto) {
    return (
      <TouchableOpacity
        style={styles.preparoConvite}
        activeOpacity={0.85}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: false }}
        accessibilityLabel={UI.convite}
        accessibilityHint={UI.abrir}
        testID="preparo-abrir"
      >
        <View style={styles.preparoConviteTexto}>
          <Text style={styles.preparoConviteTitulo}>{UI.convite}</Text>
          <Text style={styles.preparoConviteLinha}>{UI.conviteLinha}</Text>
          <Text style={styles.preparoEstado}>{progresso.texto}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.preparoPainel} testID="preparo-painel">
      <TouchableOpacity
        style={styles.preparoTopo}
        activeOpacity={0.85}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: true }}
        accessibilityLabel={preparo.titulo}
        accessibilityHint={UI.fechar}
        testID="preparo-fechar"
      >
        <Text style={styles.preparoTitulo}>{preparo.titulo}</Text>
        <Ionicons name="chevron-up" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      {/* A abertura inteira: parágrafo de vida real primeiro, fonte depois. */}
      {preparo.abertura.split('\n\n').map((paragrafo, i) => (
        <Text key={i} style={styles.preparoAbertura}>
          {paragrafo}
        </Text>
      ))}

      {/* PARA QUEM É A LEITURA — muda só a quarta regra, que é a única em que a
          fonte distingue os casos. */}
      <Text style={styles.preparoRotulo}>{UI.paraQuemRotulo}</Text>
      <View style={styles.preparoChipRow}>
        {[
          ['voce', UI.paraQuemVoce],
          ['outra', UI.paraQuemOutra],
        ].map(([id, rotulo]) => {
          const ativo = paraQuem === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.preparoChip, ativo && styles.preparoChipAtivo]}
              activeOpacity={0.85}
              onPress={() => setParaQuem(id)}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={rotulo}
              testID={`preparo-paraquem-${id}`}
            >
              <Text style={[styles.preparoChipTexto, ativo && styles.preparoChipTextoAtivo]}>{rotulo}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* AS QUATRO, NA ORDEM DE WAITE */}
      {preparo.regras.map((regra) => {
        const feita = feitas.includes(regra.id);
        return (
          <View
            key={regra.id}
            style={[styles.preparoRegra, feita && styles.preparoRegraFeita]}
            testID={`preparo-regra-${regra.id}`}
          >
            <View style={styles.preparoRegraTopo}>
              <View style={styles.preparoOrdem}>
                <Text style={styles.preparoOrdemTexto}>{regra.ordem}</Text>
              </View>
              <Text style={styles.preparoRegraTitulo}>{regra.titulo}</Text>
            </View>

            {/* Prende primeiro: a vida real. */}
            <Text style={styles.preparoChamada}>{regra.chamada}</Text>

            <Text style={styles.preparoRotulo}>{UI.rotuloGesto}</Text>
            <Text style={styles.preparoTexto}>{regra.oQueVoceFaz}</Text>

            {/* A PRIMEIRA REGRA TEM CAMPO — e a avaliação é do TEXTO digitado,
                nunca da vida de quem digitou. O motor se rotula leitura do app
                onde o critério é do app; a tela só imprime o que ele devolve. */}
            {regra.pedeTexto ? (
              <View style={styles.preparoCampoBox}>
                <Text style={styles.preparoRotulo}>{UI.rotuloCampo}</Text>
                <TextInput
                  style={styles.preparoInput}
                  value={pergunta}
                  onChangeText={setPergunta}
                  placeholder={UI.ajudaCampo}
                  placeholderTextColor={colors.textMuted}
                  multiline
                  accessibilityLabel={UI.rotuloCampo}
                  testID="preparo-campo-pergunta"
                />
                <Text style={styles.preparoAvaliacao} testID="preparo-avaliacao">
                  {avaliacao.mensagem}
                </Text>
                {avaliacao.definida ? (
                  <Text style={styles.preparoAvaliacao}>{avaliacao.proximoPasso}</Text>
                ) : null}
                <Text style={styles.preparoRotulo}>{UI.rotuloExemplos}</Text>
                {avaliacao.exemplos.map((exemplo) => (
                  <TouchableOpacity
                    key={exemplo}
                    activeOpacity={0.7}
                    onPress={() => setPergunta(exemplo)}
                    accessibilityRole="button"
                    accessibilityLabel={exemplo}
                  >
                    <Text style={styles.preparoExemplo}>· {exemplo}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {/* A SEGUNDA REGRA TEM CONTAGEM — vinte segundos, que são medida do
                app e o pack declara isso onde o texto aparece. Opcional: quem
                não quiser contar marca a regra na mão. */}
            {regra.segundos ? (
              <TouchableOpacity
                style={styles.preparoContador}
                activeOpacity={0.85}
                onPress={() => setRestam(regra.segundos)}
                disabled={restam !== null}
                accessibilityRole="button"
                accessibilityLabel={UI.contar}
                testID="preparo-contador"
              >
                <Ionicons name="timer-outline" size={16} color={colors.gold} />
                <Text style={styles.preparoContadorTexto}>
                  {restam !== null
                    ? preencherMolde(UI.contando, { s: restam })
                    : feita
                      ? UI.contada
                      : UI.contar}
                </Text>
              </TouchableOpacity>
            ) : null}

            <Text style={styles.preparoRotulo}>{UI.rotuloPorQue}</Text>
            <Text style={styles.preparoTexto}>{regra.porQue}</Text>

            {/* O RECIBO, por último: obra, autor, ano e parte. */}
            <View style={styles.preparoRecibo}>
              <Text style={styles.preparoReciboRotulo}>{UI.rotuloRecibo}</Text>
              <Text style={styles.preparoReciboTexto} testID={`preparo-recibo-${regra.id}`}>
                {regra.recibo}
              </Text>
            </View>

            {/* A ÚNICA CITAÇÃO ENTRE ASPAS DESTA FEATURE, e ela mora onde
                decide: é a linha em que a carta invertida entra na prática, no
                mesmo parágrafo do embaralho. As quatro notas NÃO vão entre
                aspas — esta base não tem o inglês literal delas. */}
            {regra.id === 'embaralhar'
              ? preparo.verbatins.map((v) => (
                  <View key={v.texto} style={styles.preparoVerbatim}>
                    <Text style={styles.preparoReciboRotulo}>{UI.rotuloVerbatim}</Text>
                    <Text style={styles.preparoVerbatimTexto}>“{v.texto}”</Text>
                    <Text style={styles.preparoTexto}>{v.parafrase}</Text>
                    <Text style={styles.preparoReciboTexto}>{v.locus}</Text>
                  </View>
                ))
              : null}

            <TouchableOpacity
              style={[styles.preparoMarcar, feita && styles.preparoMarcarFeita]}
              activeOpacity={0.85}
              onPress={() => onMarcar(regra.id, !feita)}
              accessibilityRole="button"
              accessibilityState={{ checked: feita }}
              accessibilityLabel={feita ? UI.marcada : UI.marcar}
              testID={`preparo-marcar-${regra.id}`}
            >
              <Ionicons
                name={feita ? 'checkmark-circle' : 'ellipse-outline'}
                size={18}
                color={feita ? colors.gold : colors.textMuted}
              />
              <Text style={[styles.preparoMarcarTexto, feita && styles.preparoMarcarTextoFeita]}>
                {feita ? UI.marcada : UI.marcar}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <Text style={styles.preparoEstado} testID="preparo-estado">
        {progresso.texto}
      </Text>

      {/* As duas ressalvas do motor: por que o app não tranca, e o que é de
          Waite e o que é do app. */}
      <Text style={styles.preparoNota}>{preparo.notaSemTranca}</Text>
      <Text style={styles.preparoNota}>{preparo.notaLeituraDoApp}</Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setFontesAbertas((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: fontesAbertas }}
        accessibilityLabel={fontesAbertas ? UI.ocultarFontes : UI.verFontes}
        testID="preparo-fontes"
      >
        <Text style={styles.preparoLink}>{fontesAbertas ? UI.ocultarFontes : UI.verFontes}</Text>
      </TouchableOpacity>

      {fontesAbertas ? (
        <View style={styles.preparoFontesBox}>
          <Text style={styles.preparoRotulo}>{UI.rotuloDatacao}</Text>
          {preparo.datacao.map((d) => (
            <View key={d.id} style={styles.preparoDatacao}>
              <Text style={styles.preparoDatacaoLinha}>
                {d.linha} · {d.grauNome}
              </Text>
              <Text style={styles.preparoReciboTexto}>{d.nota}</Text>
            </View>
          ))}
          <Text style={styles.preparoRotulo}>{UI.rotuloFontes}</Text>
          {preparo.fonte.map((f) => (
            <Text key={f} style={styles.preparoReciboTexto}>
              {f}
            </Text>
          ))}
        </View>
      ) : null}

      {/* A saída, dita com todas as letras: dá para fechar e tirar direto. */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityLabel={UI.pular}
        testID="preparo-pular"
      >
        <Text style={styles.preparoLink}>{UI.pular}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  albumBtn: {
    alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, gap: 2,
  },
  albumBtnText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  title: { color: '#fff', fontSize: 24, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 },
  sectionLabel: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  themeChip: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 6 },
  themeText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', marginTop: 20 },
  deckStack: { width: 120, height: 170, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  deckCard: { position: 'absolute', width: 110, height: 160, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  emptyTitle: { color: colors.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 24, paddingHorizontal: 20, lineHeight: 22 },
  dailyLimitNote: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: 16, lineHeight: 19, paddingHorizontal: 10 },
  bonusStoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.gold + '66',
    paddingVertical: 12, paddingHorizontal: 18, marginTop: 4,
  },
  bonusStoreText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  // O botão do modo história — a mesma gramática do bonusStoreBtn (contorno
  // dourado, sem fundo): é porta, não call-to-action de venda.
  historiaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.gold + '66',
    paddingVertical: 12, paddingHorizontal: 18, marginBottom: 14,
  },
  historiaBtnText: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  btnWrap: { borderRadius: 12, overflow: 'hidden', width: '100%' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  cardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  tarotCard: { alignItems: 'center', width: '31%' },
  tarotFace: {
    width: '100%', height: 150, borderRadius: 14, overflow: 'hidden',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  tarotImage: { width: '100%', height: '100%' },
  tarotBack: { width: '100%', height: 150, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, gap: 8 },
  tarotName: { color: colors.text, fontSize: 12, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  tapText: { color: colors.textMuted, fontSize: 11 },
  posLabel: { color: colors.textMuted, fontSize: 12, marginTop: 8, fontWeight: '600' },
  meaningCard: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'flex-start' },
  meaningIcon: { width: 40, height: 40, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  meaningPos: { color: colors.text, fontSize: 14, fontWeight: '800' },
  meaningText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 3 },
  sourceBox: {
    marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border,
  },
  sourceTitle: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  sourceQuote: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontStyle: 'italic', marginTop: 4 },
  sourceNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  spreadCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginTop: 4, marginBottom: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  spreadTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 6 },
  spreadText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  spreadFootnote: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 10 },

  // ---- O PREPARO DE WAITE ----
  // Mobile-first e alinhado à esquerda: o painel vive dentro de `emptyWrap`,
  // que centraliza, então tudo aqui declara largura cheia e texto à esquerda.
  preparoConvite: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
  },
  preparoConviteTexto: { flex: 1, gap: 4 },
  preparoConviteTitulo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  preparoConviteLinha: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  preparoPainel: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  preparoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preparoTitulo: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '800' },
  preparoAbertura: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  preparoRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 6,
  },
  preparoChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  preparoChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  preparoChipAtivo: { borderColor: colors.gold },
  preparoChipTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  preparoChipTextoAtivo: { color: colors.gold },

  preparoRegra: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginTop: 4,
    gap: 6,
  },
  preparoRegraFeita: { borderColor: colors.gold + '66' },
  preparoRegraTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  preparoOrdem: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preparoOrdemTexto: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  preparoRegraTitulo: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  preparoChamada: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  preparoTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  preparoCampoBox: { gap: 6, marginTop: 2 },
  preparoInput: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    minHeight: 64,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },
  preparoAvaliacao: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  preparoExemplo: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

  preparoContador: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold + '66',
    paddingVertical: 11,
    marginTop: 4,
  },
  preparoContadorTexto: { color: colors.gold, fontSize: 13, fontWeight: '700' },

  preparoRecibo: {
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 10,
    gap: 3,
    marginTop: 4,
  },
  preparoReciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  preparoReciboTexto: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  preparoVerbatim: { gap: 5, marginTop: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  preparoVerbatimTexto: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

  preparoMarcar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 11,
    marginTop: 6,
  },
  preparoMarcarFeita: { borderColor: colors.gold + '66' },
  preparoMarcarTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  preparoMarcarTextoFeita: { color: colors.gold },

  preparoEstado: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  preparoNota: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  preparoLink: { color: colors.gold, fontSize: 13, fontWeight: '700', paddingVertical: 6 },
  preparoFontesBox: { gap: 6 },
  preparoDatacao: { gap: 2 },
  preparoDatacaoLinha: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, fontWeight: '700' },
});
