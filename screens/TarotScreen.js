import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import { TAROT_DECK } from '../lib/tarotDeck';
import { getTarotImage } from '../lib/tarotImages';
import { getThemedMeaning } from '../lib/tarotThemes';
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

const FEATURE_KEY = 'tarot';

const THEMES = [
  { key: 'Amor', icon: 'heart', color: '#FF6BA0', grad: ['#FF6BA0', '#B57BFF'] },
  { key: 'Carreira', icon: 'briefcase', color: '#5CA8FF', grad: ['#5CA8FF', '#6C7BFF'] },
  { key: 'Dinheiro', icon: 'cash', color: '#5FD98C', grad: ['#5FD98C', '#5CE0D8'] },
  { key: 'Energia', icon: 'flash', color: '#FFB84D', grad: ['#FFB84D', '#FF8C5C'] },
  { key: 'Saúde', icon: 'medkit', color: '#5CE0D8', grad: ['#5CE0D8', '#6C7BFF'] },
];

const POSITIONS = ['Passado', 'Presente', 'Futuro'];

export default function TarotScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — antes só cobria casal, o que destravava o Tarô por completo
  // pra quem usava sem parceiro (achado real de bug: dava pra tirar cartas em
  // vários temas, repetidas vezes, sem nunca pedir assinatura). Corrigido na
  // origem (contexto), não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  const { t } = useLanguage();
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

    const body = shuffled
      .map((card, i) => {
        const orientationTag = newOrientations[i] ? ' (invertida)' : '';
        return `${POSITIONS[i]} — ${card.name}${orientationTag}: ${getThemedMeaning(card, theme.key, newOrientations[i])}`;
      })
      .join('\n\n');
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
    return <OneTimeLock featureTitle="Tarô por Tema" gradient={gradients.hero} />;
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
            <Text style={styles.title}>Tarô por Tema</Text>
            <Text style={styles.subtitle}>Tarô que não dourá a pílula — Passado · Presente · Futuro</Text>
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
            <Text style={styles.albumBtnText}>Álbum</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Escolha um tema</Text>
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
                <TouchableOpacity activeOpacity={0.85} onPress={() => drawCards()} style={styles.btnWrap}>
                  <LinearGradient colors={theme.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="hand-left" size={18} color="#fff" />
                    <Text style={styles.btnText}>Tirar 3 Cartas</Text>
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
                        {card.name}
                        {orientations[i] ? ' (invertida)' : ''}
                      </Text>
                    </>
                  ) : (
                    <LinearGradient colors={['#2A1D52', '#1A1235']} style={styles.tarotBack}>
                      <Ionicons name="sparkles" size={26} color={theme.color} />
                      <Text style={styles.tapText}>Toque</Text>
                    </LinearGradient>
                  )}
                  <Text style={styles.posLabel}>{POSITIONS[i]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {drawn.map((card, i) => revealed[i] && (
              <View key={i} style={styles.meaningCard}>
                <View style={[styles.meaningIcon, { backgroundColor: theme.color + '22' }]}>
                  <Ionicons name={card.icon} size={20} color={theme.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.meaningPos}>{POSITIONS[i]} · {card.name}{orientations[i] ? " (invertida)" : ""}</Text>
                  <Text style={styles.meaningText}>{getThemedMeaning(card, theme.key, orientations[i])}</Text>
                </View>
              </View>
            ))}

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
                  <Text style={styles.btnText}>Nova Tiragem</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
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
});
