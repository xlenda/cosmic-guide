import React from 'react';
import { Image, Platform, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import CosmicScene from '../components/CosmicScene';
import CosmicSoundPlayer from '../components/CosmicSoundPlayer';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import { tileArte } from '../lib/ilustracoes';
import { ROUTES } from '../routes';
import { colors, space, type, zodiacSigns } from '../theme';
import ColunaLeitura from '../components/ColunaLeitura';
import FaixaCurva from '../components/FaixaCurva';

const READING_KEYS = new Set([
  'horoscope',
  'birthchart',
  'tarot',
  'compatibility',
  'dream',
  'lunarCalendar',
  'palm',
  'coffee',
]);

// O CHÃO DE CADA SEÇÃO (12/09/2026). Alterna de propósito: seções vizinhas
// nunca repetem tom, e as cinco ondas saem de cinco sementes diferentes. Chave
// nova sem tom cai em 'noite', o degrau neutro — seção nova nunca nasce sem
// chão.
const TOM_DA_SECAO = {
  readings: 'ameixa',
  practices: 'noite',
  sky: 'violeta',
  discoveries: 'ameixa',
  couple: 'rosa',
};

const COUPLE_LOCKED_KEYS = new Set([
  'reconectar',
  'timeline',
  'descobrir',
  'agir',
  'progresso',
  'retrospectiva',
]);

function ExperienceRow({ item, onPress, t }) {
  const accessibilityLabel = item.locked
    ? t('featureCard.lockedA11y', { title: item.title })
    : `${item.title}. ${item.subtitle}`;
  // Pack pintado de 10/09/2026 (lib/ilustracoes.js TILES). Mesmo contrato do
  // resto do app: sem arte pra chave, o ponto da constelação segue sendo o
  // ícone de sempre — experiência nova nunca nasce quebrada esperando desenho.
  const arte = tileArte(item.key);

  return (
    <Pressable
      testID={`card-${item.key}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.experienceRow, pressed && styles.pressed]}
    >
      <View style={styles.constellationPoint} accessible={false}>
        {arte ? (
          <Image source={arte} style={styles.constellationArte} resizeMode="cover" accessible={false} />
        ) : (
          <Ionicons name={item.icon} size={19} color={colors.gold} />
        )}
      </View>
      <View style={styles.experienceCopy}>
        <View style={styles.experienceTitleRow}>
          <Text style={styles.experienceTitle}>{item.title}</Text>
          {item.locked ? (
            <View style={styles.lockLabel}>
              <Ionicons name="lock-closed" size={10} color={colors.gold} />
              <Text style={styles.lockLabelText}>{t('explore.locked')}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.experienceSubtitle}>{item.subtitle}</Text>
      </View>
      <Ionicons name="arrow-forward" size={17} color={colors.textMuted} />
    </Pressable>
  );
}

export default function ExploreScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coupleData, soloSign, hasCoupleAccess, isOwnerAccount } = useCouple();
  const { t } = useLanguage();
  const isCouple = Boolean(coupleData);
  const sign = (coupleData?.sa && zodiacSigns.find((candidate) => candidate.name === coupleData.sa))
    || soloSign
    || zodiacSigns[0];

  const openTab = (tab, params) => {
    navigation.getParent()?.navigate(tab, params);
  };

  const item = (key, titleKey, subtitleKey, icon, destination, options = {}) => ({
    key,
    title: t(titleKey),
    subtitle: t(subtitleKey),
    icon,
    destination,
    ...options,
  });

  const readings = [
    item('horoscope', 'home.card.horoscope.title', 'explore.item.horoscope.description', 'planet-outline', ROUTES.HOROSCOPE, { params: { sign } }),
    item('comovoceta', 'home.card.comovoceta.title', 'explore.item.comovoceta.description', 'heart-half-outline', ROUTES.COMO_VOCE_TA),
    item('birthchart', 'home.card.birthchart.title', 'explore.item.birthchart.description', 'compass-outline', ROUTES.BIRTH_CHART),
    item('tarot', 'home.card.tarot.title', 'explore.item.tarot.description', 'sparkles-outline', ROUTES.TAROT_TAB, { tab: true }),
    item('compatibility', 'home.card.compatibility.title', 'explore.item.compatibility.description', 'heart-outline', ROUTES.COMPATIBILITY),
    item('dream', 'home.card.dream.title', 'explore.item.dream.description', 'moon-outline', ROUTES.DREAM),
    item('palm', 'explore.item.palm.title', 'explore.item.palm.description', 'hand-left-outline', ROUTES.PALM),
    item('coffee', 'home.card.coffee.title', 'explore.item.coffee.description', 'cafe-outline', ROUTES.COFFEE),
    // Profecções saiu da vitrine em 10/09/2026 (pedido do dono). A rota
    // ROUTES.PROFECCOES e a tela continuam vivas — ver o comentário em
    // screens/HomeScreen.js. A chamada item() foi REMOVIDA em vez de
    // comentada: test/exploreScreen.test.js conta as entradas por regex sobre
    // a fonte, e uma linha comentada ainda casaria com o padrão.
  ];

  const practices = [
    {
      key: 'alignment',
      title: t('home.alignment.title'),
      subtitle: t('explore.item.alignment.description'),
      icon: 'aperture-outline',
      destination: ROUTES.SKY_ALIGNMENT,
    },
    item('grounding', 'home.card.grounding.title', 'explore.item.grounding.description', 'leaf-outline', ROUTES.GROUNDING),
    item('rituais', 'home.card.rituais.title', 'explore.item.rituais.description', 'flame-outline', ROUTES.RITUAIS),
    item('jornada', 'home.card.jornada.title', 'explore.item.jornada.description', 'footsteps-outline', ROUTES.JORNADA),
    item('diary', 'home.card.diary.title', 'explore.item.diary.description', 'book-outline', ROUTES.DIARY),
  ];

  const skyAndTime = [
    item('lunarCalendar', 'home.card.lunarCalendar.title', 'explore.item.lunarCalendar.description', 'moon-outline', ROUTES.LUNAR_CALENDAR),
    item('calendario', 'home.card.calendario.title', 'explore.item.calendario.description', 'calendar-outline', ROUTES.CALENDARIO_COSMICO),
    item('zodiacbody', 'home.card.zodiacbody.title', 'explore.item.zodiacbody.description', 'body-outline', ROUTES.ZODIAC_BODY),
    item('retrolua', 'home.card.retrolua.title', 'explore.item.retrolua.description', 'stats-chart-outline', ROUTES.RETRO_LUA),
  ];

  const discoveries = [
    item('mitos', 'home.card.mitos.title', 'explore.item.mitos.description', 'library-outline', ROUTES.MITOS),
    item('quizcosmico', 'home.card.quizcosmico.title', 'explore.item.quizcosmico.description', 'help-circle-outline', ROUTES.QUIZ_COSMICO),
    item('wallpaper', 'home.card.wallpaper.title', 'explore.item.wallpaper.description', 'image-outline', ROUTES.WALLPAPER),
    item('idadereal', 'home.card.idadereal.title', 'explore.item.idadereal.description', 'hourglass-outline', ROUTES.IDADE_REAL),
    item('social', 'home.card.social.title', 'explore.item.social.description', 'people-outline', ROUTES.COMMUNITY_TAB, {
      tab: true,
      params: { screen: ROUTES.COMMUNITY_MAIN },
    }),
  ];

  const coupleItems = [
    // A Linha do Tempo aparecia aqui só pra quem já estava em casal. Virou a
    // primeira aba de 'Nossa História' em 10/09/2026, então sai da lista — o
    // condicional `isCouple` some junto, porque as duas portas valem pros dois
    // estados (quem está sozinho vê o convite ao abrir, que é onde ele deve
    // aparecer).
    // AS SEIS VIRARAM DUAS (10/09/2026, pedido do dono). Ver o comentário em
    // screens/HomeScreen.js: as rotas antigas seguem vivas, só saíram da
    // vitrine. A descrição de cada porta lista o que ela reúne, pra ninguém
    // procurar "Reconectar" e achar que sumiu.
    item('nosHoje', 'nosHoje.title', 'explore.item.nosHoje.description', 'flash-outline', ROUTES.NOS_HOJE),
    item('nossaHistoria', 'nossaHistoria.title', 'explore.item.nossaHistoria.description', 'time-outline', ROUTES.NOSSA_HISTORIA),
  ].map((experience) => ({
    ...experience,
    // Mesma correção da Home (10/09/2026): com TUDO_LIBERADO, `!isCouple`
    // deixava o cadeado aparecer sobre features já abertas. Só tranca o que
    // está de fato trancado.
    locked: !isOwnerAccount
      && !hasCoupleAccess
      && COUPLE_LOCKED_KEYS.has(experience.key),
  }));

  const sections = [
    {
      key: 'readings',
      eyebrow: t('explore.section.readings.eyebrow'),
      title: t('explore.section.readings.title'),
      subtitle: t('explore.section.readings.subtitle'),
      data: readings,
    },
    {
      key: 'practices',
      eyebrow: t('explore.section.practices.eyebrow'),
      title: t('explore.section.practices.title'),
      subtitle: t('explore.section.practices.subtitle'),
      data: practices,
    },
    {
      key: 'sky',
      eyebrow: t('explore.section.sky.eyebrow'),
      title: t('explore.section.sky.title'),
      subtitle: t('explore.section.sky.subtitle'),
      data: skyAndTime,
    },
    {
      key: 'discoveries',
      eyebrow: t('explore.section.discoveries.eyebrow'),
      title: t('explore.section.discoveries.title'),
      subtitle: t('explore.section.discoveries.subtitle'),
      data: discoveries,
    },
    {
      key: 'couple',
      eyebrow: t('explore.section.couple.eyebrow'),
      title: t('explore.section.couple.title'),
      subtitle: t('explore.section.couple.subtitle'),
      data: coupleItems,
    },
  ];

  const handleOpen = (experience) => {
    if (READING_KEYS.has(experience.key)) {
      funnel.readingStart(experience.key, 'explore');
    }
    if (experience.tab) {
      openTab(experience.destination, experience.params);
      return;
    }
    navigation.navigate(experience.destination, experience.params);
  };

  const goHome = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.reset({ index: 0, routes: [{ name: ROUTES.HOME_MAIN }] });
  };

  return (
    <View style={styles.root}>
      <CosmicScene />
      <SectionList
        testID="explore-list"
        sections={sections}
        keyExtractor={(experience) => experience.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 112 },
        ]}
        contentInsetAdjustmentBehavior="automatic"
        stickySectionHeadersEnabled={false}
        initialNumToRender={10}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        ListHeaderComponent={(
          <>
            <View style={styles.topBar}>
              <Pressable
                testID="explore-back"
                onPress={goHome}
                accessibilityRole="button"
                accessibilityLabel={t('explore.back')}
                style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
              </Pressable>
              <Text style={styles.topBarLabel}>{t('explore.topLabel')}</Text>
              <View style={styles.topBarBalance} />
            </View>

            {/* A abertura ganhou coluna de leitura: em 390px ela não faz
                nada (e é o certo), mas na web o parágrafo atravessava os
                680px do container e o olho perdia o começo da linha
                seguinte. */}
            <ColunaLeitura style={styles.intro}>
              <Text style={styles.introEyebrow}>{t('explore.eyebrow')}</Text>
              <Text style={styles.introTitle}>{t('explore.title')}</Text>
              <Text style={styles.introBody}>{t('explore.body')}</Text>
            </ColunaLeitura>
          </>
        )}
        // A FAIXA CURVA NO CABEÇALHO DE SEÇÃO (12/09/2026, o lote de
        // diagramação). As cinco seções corriam sobre o MESMO chão, separadas
        // só por 28px de vazio — exatamente o defeito nº 1 do diagnóstico
        // ("tudo corre junto no mesmo fundo → parece lista"), visível na foto
        // design/lote-diagramacao/antes/explorar-dobra1.png. Agora cada
        // cabeçalho entra numa faixa com onda própria: o olho lê "mudou de
        // assunto" antes de ler o título.
        //
        // CINCO SEÇÕES, e a regra diz duas a quatro faixas por tela — cinco
        // viraria textura. Por isso os TONS alternam em vez de escalar: as
        // seções vizinhas nunca repetem chão, e a mesma cor voltando lá na
        // quarta lê como ritmo, não como papel de parede. A SEMENTE é a chave
        // da seção, então as cinco ondas são cinco desenhos diferentes.
        renderSectionHeader={({ section }) => (
          <FaixaCurva
            tom={TOM_DA_SECAO[section.key] || 'noite'}
            semente={`explorar-${section.key}`}
            style={styles.sectionFaixa}
            estiloCorpo={styles.sectionFaixaCorpo}
            // MEDIDO em 390px (12/09/2026): os corpos destes cabecalhos dao
            // 133 e 153px. Com a caixa de onda cheia (56px) a faixa abria com
            // mais chao liso do que o rotulo dourado que vem logo abaixo — o
            // defeito ALTO que o revisor achou na Home ("a faixa virou bloco
            // de cor"). `rasa` corta a caixa pela metade sem redesenhar a onda,
            // entao a secao nao troca de identidade.
            rasa
          >
            <Text style={styles.sectionEyebrow}>{section.eyebrow}</Text>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          </FaixaCurva>
        )}
        renderItem={({ item: experience }) => (
          <View style={styles.sectionRail}>
            <ExperienceRow item={experience} onPress={() => handleOpen(experience)} t={t} />
          </View>
        )}
        // O SOM DO CÉU FECHA AS PRÁTICAS (10/09/2026, pedido do dono: "essa
        // parte do som do céu pode colocar na parte de meditações também").
        // Entra como RODAPÉ da seção, e não como linha da lista, porque o som
        // não tem tela pra navegar: ele É o controle. Uma linha com seta
        // levaria a lugar nenhum. O player devolve null sozinho onde a Web
        // Audio API não existe, então nada nasce quebrado.
        //
        // BUG CORRIGIDO EM 12/09/2026: havia DOIS renderSectionFooter nas props
        // deste SectionList. Em JSX a chave repetida vence a última, então o
        // segundo (o espaçador) apagava este — o player nunca renderizou nas
        // Práticas desde que foi escrito. Virou UM só rodapé, que desenha o
        // player nas práticas e o espaçador em toda seção.
        renderSectionFooter={({ section }) => (
          <View style={styles.sectionFooter}>
            {section.key === 'practices' ? (
              <CosmicSoundPlayer variant="inline" style={styles.soundFooter} />
            ) : null}
          </View>
        )}
      />
    </View>
  );
}

const displayFont = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia',
  default: 'serif',
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // O padding lateral saiu daqui e foi pros filhos: as faixas de seção
  // precisam SANGRAR de ponta a ponta (faixa com margem é card, e card no meio
  // da tela é exatamente o que a faixa veio substituir).
  scrollContent: { width: '100%', maxWidth: 680, alignSelf: 'center' },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.tela,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topBarLabel: { ...type.apoio, color: colors.textSecondary, fontWeight: '600' },
  topBarBalance: { width: 44, height: 44 },
  // ColunaLeitura ja traz paddingHorizontal (space.dentro); somo o que falta
  // pra bater com a margem lateral das linhas (space.tela).
  intro: {
    paddingTop: space.secao,
    paddingBottom: space.ar,
    paddingHorizontal: space.tela,
    alignSelf: 'flex-start',
  },
  introEyebrow: { ...type.etiqueta, color: colors.gold, textTransform: 'uppercase' },
  // Degrau `display` (32/40) no lugar de 35/41 solto. A serifa (displayFont) e
  // o letterSpacing negativo continuam: sao identidade desta tela, e a escala
  // governa TAMANHO e ENTRELINHA, nao a familia.
  introTitle: {
    ...type.display,
    color: colors.text,
    fontFamily: displayFont,
    letterSpacing: -0.7,
    marginTop: space.dentro,
    maxWidth: 430,
  },
  // Degrau de texto corrido (17/27) no lugar de 14/21: a abertura é a única
  // leitura da tela e era o degrau mais apertado dela.
  introBody: { ...type.corpo, color: colors.textSecondary, marginTop: space.bloco },
  // A FAIXA da seção: sangra de ponta a ponta e só precisa de respiro ACIMA
  // (o rodapé da seção anterior já traz o de baixo).
  sectionFaixa: { marginTop: space.entre, marginBottom: space.bloco },
  // A faixa de cabeçalho é FINA — três linhas de texto. O paddingBottom
  // padrão (`secao`) deixava um naco de chão liso embaixo do subtítulo, que é
  // o defeito ALTO que o revisor achou na Home: faixa com mais chão do que
  // conteúdo lê como bloco de cor. `entre` fecha a faixa logo depois da
  // última palavra.
  sectionFaixaCorpo: { paddingBottom: space.entre },
  sectionEyebrow: { ...type.etiqueta, color: colors.gold, textTransform: 'uppercase' },
  // Degrau `titulo` (24/30) no lugar de 23/28 — um pixel de diferenca do que a
  // escala ja tem nao e hierarquia, e desalinho.
  sectionTitle: {
    ...type.titulo,
    color: colors.text,
    fontFamily: displayFont,
    letterSpacing: -0.3,
    marginTop: space.junto,
  },
  sectionSubtitle: { ...type.apoio, color: colors.textMuted, marginTop: space.junto },
  // A trilha das linhas recupera a margem lateral que saiu do container.
  sectionRail: {
    borderLeftWidth: 1,
    borderLeftColor: colors.gold + '45',
    marginLeft: space.ar - space.bloco + space.junto,
    marginRight: space.tela,
    paddingLeft: space.bloco,
  },
  sectionFooter: { paddingTop: space.entre },
  experienceRow: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.dentro,
    paddingVertical: space.bloco,
    paddingLeft: 0,
    paddingRight: space.dentro,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  // 64px, não 42: com a arte pintada de 10/09/2026 dentro, o medalhão antigo
  // reduzia a ilustração a uma mancha escura — o desenho só se lê a partir
  // desse tamanho. marginLeft acompanha pra manter o centro na mesma trilha.
  constellationPoint: {
    width: 64,
    height: 64,
    marginLeft: -49,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#211921',
    borderWidth: 1,
    borderColor: colors.gold + '70',
    overflow: 'hidden',
  },
  // A arte preenche o medalhão inteiro; o raio é 1px menor que o do contêiner
  // pra imagem não vazar por cima da borda dourada no Android.
  constellationArte: { width: '100%', height: '100%', borderRadius: 19 },
  // O player entra fora da trilha da constelação (sem o marginLeft negativo
  // das linhas), então leva a margem lateral do próprio conteúdo.
  soundFooter: { marginHorizontal: space.tela, marginBottom: space.junto },
  experienceCopy: { flex: 1, minWidth: 0 },
  experienceTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  experienceTitle: { ...type.cartao, color: colors.text },
  // 15/24 no lugar de 12/18: a descrição de cada porta é a única coisa que
  // diz o que a experiência faz, e estava no degrau de legenda.
  experienceSubtitle: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.junto },
  lockLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: colors.gold + '15',
  },
  // 11 (o menor degrau legivel da escala) no lugar de 9: abaixo de `nota` o
  // texto deixa de ser lido e vira ruido — e este diz "trancado", que e
  // informacao que importa.
  lockLabelText: { ...type.nota, color: colors.gold, fontWeight: '600' },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
});
