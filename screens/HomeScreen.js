import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Share, Image, Pressable, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import HeroSection from '../components/HeroSection';
// O MASCOTE DO HERO (08/08/2026) — o signo do usuário como personagem do pack
// de arte (lib/ilustracoes.js). Devolve o asset 256px ou null — e null cai no
// badge de glifo que o HeroSection sempre desenhou. A arte é upgrade, nunca
// dependência.
// planetaImagem (08/08/2026, última rodada): planeta pintado 256px ou null,
// pras miniaturas do Céu de Hoje e do card de próximos eventos. Mesmo contrato.
import { mascoteDoSigno, planetaImagem, CENAS } from '../lib/ilustracoes';
// O CENÁRIO CÓSMICO — céu gradiente + estrelas + ondas de silhueta. Entra como
// PRIMEIRO filho do root (uso documentado no cabeçalho do próprio arquivo).
import CosmicScene from '../components/CosmicScene';
// A ONDA DIVISÓRIA — a colina EM FLUXO que separa os GRUPOS do rolo (Onda
// Cenográfica, 08/08/2026). Desde as ZONAS DE COR (09/08/2026) sobrou UMA
// onda no arquivo — a do epílogo (ver ONDA 4 no JSX): nas outras três viradas
// a borda arredondada da própria zona faz o corte, e onda + borda seria
// dupla-borda. Decoração ENTRE blocos, nunca reordenação:
// test/quentePrimeiroNasTelas.test.js fatia esta fonte por âncoras e nenhuma
// âncora se move.
import WaveDivider from '../components/WaveDivider';
// A ZONA DE COR — o chão que muda embaixo de uma seção inteira (09/08/2026).
// No concorrente premium as seções moram em FAIXAS arredondadas um degrau
// mais claras que o céu; a onda era só a BORDA dessas faixas, e faltava o
// chão. Wrapper puro: os filhos entram na MESMA ordem de sempre (as âncoras
// do teste acima não se movem), só o fundo embaixo deles muda. Tons e
// porquês no cabeçalho de components/BandaSection.js.
import BandaSection from '../components/BandaSection';
import NotifPromptCard from '../components/NotifPromptCard';
import DailyMissionsCard from '../components/DailyMissionsCard';
import OrbiGuide from '../components/OrbiGuide';
// Som do céu — o card que APRESENTA a feature. O motor e o estado vivem no
// provider em App.js; aqui é só um controle remoto (ver o cabeçalho de
// components/CosmicSoundPlayer.js). Sem este card, a única porta de entrada
// seria a pílula de 40 px acima da barra de abas, que ninguém descobre.
import CosmicSoundPlayer from '../components/CosmicSoundPlayer';
import { compatibility, aspects } from '../lib/signs';
// O motor das Temporadas do Céu continua inteiro (o card saiu da Home, o motor
// não). Ele volta aqui num papel menor e melhor: alimentar o SUBTÍTULO do card
// do Calendário Cósmico, que é a casa pra onde as temporadas foram.
import { activeCelestialEvents } from '../lib/celestialSeasons';
import { CHAVES_DE_TRADUCAO, nomeDoSigno } from '../lib/synastry';
import { getTodaysThought } from '../lib/dailyThought';
import { getTodaysLovePhrase } from '../lib/lovePhrase';
import { compartilharFraseComoCard, fundoDoDia } from '../lib/shareCard';
import { personalSkyToday } from '../lib/personalSky';
import { fasesDoCeuPessoal } from '../lib/transitoFase';
import { getAnyBirthData } from '../lib/birthData';
import { computeMonthlyWrapped, getWrappedMonth, isWrappedAvailable } from '../lib/monthlyWrapped';
// Só a checagem do DIA entra na Home — o balanço em si é da tela. Serve pra
// dizer no subtítulo do card que hoje é o dia, em vez de deixar a pessoa
// descobrir isso só se tocar.
import { ehDiaDeLuaCheia } from '../lib/retroLunacao';
import { getWeekActivity, getStreakInfo, consumePendingMilestoneCelebration, recordActiveDay } from '../lib/streak';
import { recordMissionAction, MISSION_ACTIONS } from '../lib/missions';
import { localDayStr } from '../lib/localDay';
import { getShieldCount } from '../lib/streakShield';
// Storage SEMPRE via lib/storage.js: se o disco falhar (SecurityError em
// iframe/web), os wrappers caem pra memória de sessão em vez de engolir a
// escrita — sem isso o flag "leitura do dia lida" nunca persistia e o card
// voltava a pedir leitura a cada foco.
import { getItemSeguro, setItemSeguro } from '../lib/storage';
import { getAgirData } from '../lib/coupleData';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import { getJournalEntries } from '../lib/journal';
import {
  buildOnboardingPlan,
  getOnboardingIntent,
  getOnboardingIntentDefinition,
  getOnboardingProfile,
  getOnboardingSituationDefinition,
} from '../lib/onboardingPlan';

// Cards do grid que levam a uma LEITURA de verdade. Conversar com Órbi tem
// entrada contextual própria e, por isso, não pertence a este catálogo — são
// eles que valem como "pediu a 1ª leitura" (reading_start). Os cards de casal
// (timeline/reconectar/descobrir/agir/progresso/retrospectiva) e o feed social
// não são leitura e ficam de fora de propósito: contá-los inflaria o degrau e
// esconderia que ninguém chegou a ler nada.
const READING_CARD_KEYS = new Set([
  'horoscope', 'birthchart', 'tarot', 'compatibility',
  'dream', 'lunarCalendar', 'palm', 'coffee',
]);

// Segunda a domingo — mesma ordem que getWeekActivity() já retorna. Viraram
// chaves i18n (inicial do dia muda por idioma: S/T/Q… em PT, L/M/X… em ES,
// M/T/W… em EN) — resolvidas dentro do componente via t().
const WEEK_LABEL_KEYS = [
  'home.week.mon', 'home.week.tue', 'home.week.wed', 'home.week.thu',
  'home.week.fri', 'home.week.sat', 'home.week.sun',
];

// Dia local em YYYY-MM-DD (nunca toISOString/UTC — perto da meia-noite em
// fuso negativo como o do Brasil, o dia UTC já virou e a "leitura de hoje"
// apareceria como lida/não-lida do dia errado). Promovido pra lib/localDay.js,
// que agora é a convenção única de "dia" do app inteiro.

// Último dia (local) em que a pessoa LEU o pensamento do dia — uma chave só,
// sobrescrita a cada leitura, em vez de uma chave por data (não acumula lixo
// no AsyncStorage; só interessa saber se o de HOJE já foi lido).
const THOUGHT_READ_KEY = 'cosmic-daily-thought-last-read';

// TIPO DE EVENTO → PLANETA PINTADO (08/08/2026, última rodada de arte) — só
// onde a ligação é HONESTA: as quatro luas SÃO a Lua no céu, o ingresso solar
// É o Sol mudando de signo, o retrógrado É Mercúrio. `aspectoExato` fica de
// FORA de propósito: um aspecto envolve DOIS planetas, e ilustrar com um só
// seria mentir a metade — o emoji do motor continua contando essa história.
// As chaves são os `tipo` de lib/calendarioCosmico.js (via proximosEventos) —
// dado INTERNO do motor, nunca input de cliente. [AUTO-DECISION] Por isso um
// Object.freeze normal serve, sem Object.create(null): nenhum texto digitado
// consulta este mapa, e planetaImagem() já filtra por hasOwnProperty do lado
// de lá — um `tipo` desconhecido (ou herdado) devolve undefined → null → sem
// imagem, layout de sempre. O MESMO mapa existe em CalendarioCosmicoScreen.js
// (a missão travou as mudanças nestes 3 arquivos de tela; mudou lá, muda cá).
const PLANETA_DO_EVENTO = Object.freeze({
  luaNova: 'Lua',
  quartoCrescente: 'Lua',
  luaCheia: 'Lua',
  quartoMinguante: 'Lua',
  ingressoSolar: 'Sol',
  mercurioRetrogradoInicio: 'Mercúrio',
  mercurioRetrogradoFim: 'Mercúrio',
});

// ---------------------------------------------------------------------------
// A LINHA DE HOJE — a única coisa das três telas novas que sobe pra cima
// ---------------------------------------------------------------------------
// AS TRÊS ENTRARAM NO GRID (Rituais, Jornada, Calendário Cósmico), junto das
// outras leituras, que é onde a pessoa vai procurar o que fazer. Nenhuma delas
// virou card na dobra de cima: em 31/07/2026 o dono tirou de lá "Temporada de
// Leão" e "Espiada de Amanhã" porque "fica perdido no meio", e responder a isso
// com três cards novos seria desfazer o pedido no mesmo dia.
//
// O QUE SOBE, E É UMA COISA SÓ: uma LINHA (não card — sem fundo, sem borda, sem
// gradiente, a altura de um texto) com o motivo de voltar HOJE. As duas telas
// que têm esse motivo são a Jornada (o passo do dia) e os Rituais (o que casa
// com a fase da Lua e o dia da semana de hoje). O Calendário Cósmico não tem
// linha nenhuma e não deveria ter: ele é uma consulta, não um compromisso
// diário — nada nele muda entre hoje e amanhã.
//
// QUANDO AS DUAS ESTÃO ATIVAS, GANHA A TRILHA. Três razões, em ordem de peso:
//   1. só a trilha EXPIRA. O passo é um por dia e em ordem: o dia que passa não
//      volta como oportunidade de hoje. A lista de rituais de hoje é uma
//      prateleira que reabre amanhã com outra fase — perder não custa nada.
//   2. a trilha é dela. Ela já concluiu ao menos um dia, tem medalha e
//      progresso guardados; a sugestão de ritual é a mesma pra todo mundo que
//      abrir o app hoje. Lembrar do que a pessoa começou vale mais do que
//      apresentar de novo o que ela ainda não escolheu.
//   3. só a trilha tem fim. Ela caminha pro dia 7 e pra medalha; a prateleira
//      de rituais não vai a lugar nenhum — e é justamente por isso que ela
//      aguenta esperar o dia em que a trilha não tem passo aberto.
// Quando não há trilha em andamento (a maioria dos dias, pra maioria das
// pessoas), a linha é a do ritual. Quando não há nem uma nem outra, não existe
// linha — em vez de uma linha vazia ocupando a dobra.
//
// POR QUE OS DOIS MOTORES ENTRAM POR import() DINÂMICO E NÃO NO TOPO DO
// ARQUIVO. lib/rituais.js carrega os 21 rituais inteiros e lib/jornada.js as 28
// leituras das trilhas — e as duas TELAS são lazy() em App.js exatamente pra
// esse peso não entrar no parse inicial (o comentário está lá, em cada uma).
// A Home é raiz de aba, carrega sempre: um `import` estático aqui em cima
// mataria as duas decisões de lazy em silêncio, porque o conteúdo é o grosso do
// chunk. Aqui os módulos só são pedidos depois que a Home já pintou, dentro do
// efeito, e o chunk que vier fica quente pra quando a tela abrir.
//
// Entre os rituais que casam com hoje, o mais forte é o que declarava OS DOIS
// critérios — fase da Lua E dia da semana — e acertou os dois.
// `rituaisDeHoje().rituais` já só devolve quem bateu tudo o que declarou (o
// matcher é E, não OU: ver a seção 8 de lib/rituais.js), então basta contar
// quantos critérios cada um declarava. Medido sobre 2026 inteiro com o motor de
// verdade: nos 365 dias a lista de casamento exato nunca vem vazia (de 1 a 6
// rituais por dia), então esta linha aparece praticamente todo dia pra quem não
// tem trilha.
//
// O DESEMPATE É POR ROTAÇÃO, NÃO POR ORDEM DE CATÁLOGO — e essa é a correção.
// Com `if (peso > melhorPeso)` ganhava sempre o primeiro do catálogo, e o
// resultado medido sobre 56 dias corridos era: só 13 rituais distintos
// apareciam, "A lista do que eu quero sentir" ocupava 11 dos 56 dias (20%), e a
// maior sequência era de QUATRO DIAS SEGUIDOS com exatamente o mesmo texto. Uma
// linha que se vende como "o motivo de voltar HOJE" e que diz a mesma frase
// quatro manhãs seguidas vira papel de parede — é o mesmo "fica perdido no
// meio" que o dono mandou consertar, só que por repetição em vez de por
// posição.
//
// `diaDoAno % candidatos.length` é determinístico (todo mundo vê o mesmo hoje),
// muda sozinho à meia-noite e não precisa guardar nada — mesma disciplina de
// lib/dailyThought.js.
function ritualMaisForteDeHoje(lista, agora = new Date()) {
  let melhorPeso = -1;
  const candidatos = [];
  for (const r of lista || []) {
    const m = r.momento || {};
    const peso = ((m.fasesLua || []).length > 0 ? 1 : 0) + ((m.diasSemana || []).length > 0 ? 1 : 0);
    if (peso > melhorPeso) {
      melhorPeso = peso;
      candidatos.length = 0;
      candidatos.push(r);
    } else if (peso === melhorPeso) {
      candidatos.push(r);
    }
  }
  if (candidatos.length === 0) return null;
  // Dias inteiros a partir de campos LOCAIS (Date.UTC só pra subtrair sem
  // horário de verão no meio) — a rotação vira na meia-noite de quem lê, não na
  // de Greenwich. Mesma razão de lib/localDay.js.
  const inicioDoAno = Date.UTC(agora.getFullYear(), 0, 1);
  const hoje = Date.UTC(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const diaDoAno = Math.round((hoje - inicioDoAno) / 86400000);
  return candidatos[diaDoAno % candidatos.length];
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coupleData, soloSign, loading, hasAccess, hasCoupleAccess, isOwnerAccount, refresh } = useCouple();
  const { lang, t } = useLanguage();

  // O handoff de URL (?voce=&amor=&sa=&sb=) agora roda uma vez em App.js
  // (useUrlBootstrap), antes do gate decidir entre Quiz e Tab.Navigator — não
  // depende mais de HomeScreen montar, então aqui só resta o refresh normal.
  const load = useCallback(async () => {
    await refresh();
  }, [refresh]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Home progressiva: o primeiro acesso recebe uma única etapa dominante.
  // Assim que existe uma leitura real no Diário, a Home volta a mostrar as
  // superfícies de continuidade. A intenção apenas ORDENA recursos reais.
  const [onboardingIntent, setOnboardingIntentState] = useState(null);
  const [onboardingProfile, setOnboardingProfileState] = useState(null);
  const [journalCount, setJournalCount] = useState(null);
  const [orbiFocused, setOrbiFocused] = useState(false);
  const [alignmentFocused, setAlignmentFocused] = useState(false);
  // O catálogo completo agora tem uma casa permanente própria (Explore).
  // A Home mostra apenas a porta: nenhuma lista enorme monta na primeira
  // pintura e nenhuma experiência foi removida.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getOnboardingIntent(), getOnboardingProfile(), getJournalEntries()]).then(([intent, profile, entries]) => {
        if (!active) return;
        setOnboardingIntentState(intent);
        setOnboardingProfileState(profile);
        setJournalCount(Array.isArray(entries) ? entries.length : 0);
      });
      return () => { active = false; };
    }, [])
  );

  // Widget "sequência da semana" (lib/streak.js) — só leitura/exibição, quem
  // marca o dia como ativo é recordActiveDay() em outro lugar do app. Recarrega
  // toda vez que a Home ganha foco pra refletir uma atividade que acabou de
  // acontecer em outra tela (ex.: acabou de completar uma leitura e voltou).
  const [weekActivity, setWeekActivity] = useState([]);
  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, totalActiveDays: 0 });
  // Escudo(s) da Sequência disponíveis (lib/streakShield.js, comprados na
  // Loja) — só pra mostrar o indicadorzinho ao lado do streak, quem consome
  // de verdade é computeCurrentStreak() (lib/streak.js).
  const [shieldCount, setShieldCount] = useState(0);
  // Marco de sequência (7/30/100 dias) batido em QUALQUER tela de leitura —
  // fica pendente em AsyncStorage (lib/streak.js) até a Home, que é onde
  // sempre se volta depois de uma leitura, consumir e celebrar uma vez só.
  const [milestone, setMilestone] = useState(null);
  // Pensamento do dia recolhido por padrão — 2 linhas + "ler completo".
  const [thoughtExpanded, setThoughtExpanded] = useState(false);
  // "Leitura do dia" (pedido do dono, 26/07/2026): o pensamento é UMA leitura
  // diária de verdade, pra pessoa abrir todo dia — tipo devocional. Este flag
  // diz se o de HOJE já foi lido (expandido); recarrega no foco porque à
  // meia-noite o dia vira e o card volta a mostrar "leia o de hoje".
  const [thoughtReadToday, setThoughtReadToday] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getItemSeguro(THOUGHT_READ_KEY).then((v) => {
        if (active) setThoughtReadToday(v === localDayStr());
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const loadStreak = useCallback(async () => {
    const [week, info, pendingMilestone, shields] = await Promise.all([
      getWeekActivity(),
      getStreakInfo(),
      consumePendingMilestoneCelebration(),
      getShieldCount(),
    ]);
    setWeekActivity(week);
    setStreakInfo(info);
    if (pendingMilestone) setMilestone(pendingMilestone);
    setShieldCount(shields);
  }, []);

  useFocusEffect(useCallback(() => { loadStreak(); }, [loadStreak]));

  // Marca a leitura do dia como lida (uma vez por dia) quando a pessoa expande
  // o card. Ler a leitura do dia É atividade real no app, então conta como dia
  // ativo na sequência — a MESMA recordActiveDay() que as telas de leitura já
  // usam (via readingCompletion.js), nenhum streak novo inventado. Chamada
  // direta (sem journal/tokens de leitura): expandir um texto não é gerar uma
  // leitura de Tarô/Palma, só não pode deixar o dia em branco na sequência.
  const markThoughtReadToday = useCallback(async () => {
    if (thoughtReadToday) return;
    setThoughtReadToday(true);
    await setItemSeguro(THOUGHT_READ_KEY, localDayStr());
    await recordActiveDay();
    // Reflete na hora o dot de hoje + contagem no widget da semana (e, se um
    // marco 7/30/100 acabou de bater, loadStreak consome e celebra já).
    loadStreak();
  }, [thoughtReadToday, loadStreak]);

  // "Meta da semana" já existe dentro de Agir (texto livre + marcar cumprida)
  // mas ficava escondida lá — só ler/mostrar aqui, a interação real (definir/
  // marcar cumprida) continua só em Agir, pra não duplicar a mesma lógica em
  // dois lugares. Só carrega pra casal com acesso (Agir é feature de assinante).
  const [agirGoal, setAgirGoal] = useState(null);
  const loadAgirGoal = useCallback(async () => {
    if (!coupleData?.voce || !coupleData?.amor) return;
    const data = await getAgirData(coupleData.voce, coupleData.amor);
    setAgirGoal({ goalSaved: data.goalSaved || '', goalDone: !!data.goalDone });
  }, [coupleData]);
  useFocusEffect(useCallback(() => { loadAgirGoal(); }, [loadAgirGoal]));

  // Retrospectiva Cósmica mensal — só na janela dos dias 1-7, e só se o mês
  // anterior teve uso real (computeMonthlyWrapped devolve null se não teve).
  const [wrappedReady, setWrappedReady] = useState(false);
  useFocusEffect(
    useCallback(() => {
      if (!isWrappedAvailable()) {
        setWrappedReady(false);
        return;
      }
      let active = true;
      const { year, month } = getWrappedMonth();
      computeMonthlyWrapped(year, month).then((w) => {
        if (active) setWrappedReady(!!w);
      });
      return () => {
        active = false;
      };
    }, [])
  );

  // Céu de hoje pra você (lib/personalSky.js) — trânsitos reais sobre o mapa
  // natal da pessoa. `undefined` = ainda carregando; `null` = sem data de
  // nascimento salva (mostra convite pro Mapa Astral); array = aspectos.
  // Recarrega no foco: a pessoa pode ter acabado de preencher o nascimento
  // no Mapa Astral e voltado pra cá.
  const [personalSky, setPersonalSky] = useState(undefined);
  // O nascimento fica guardado junto porque a DIREÇÃO de cada trânsito
  // (lib/transitoFase.js) precisa dele: personalSky calcula Math.abs(sep -
  // angle) e, com o valor absoluto, perde o sinal — o aspecto que ainda vai
  // fechar e o que já se desfez saíam com a MESMA frase.
  const [personalSkyBirth, setPersonalSkyBirth] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAnyBirthData().then((birth) => {
        if (!active) return;
        setPersonalSkyBirth(birth || null);
        setPersonalSky(birth ? personalSkyToday(birth, 3, lang) : null);
      });
      return () => {
        active = false;
      };
      // `lang` entra nas deps porque desde 03/08/2026 o texto do céu É
      // traduzido: com a lista vazia, quem trocasse de idioma continuava
      // vendo o céu na língua antiga até fechar e reabrir o app.
    }, [lang])
  );

  // UMA chamada para a lista inteira: fasesDoCeuPessoal levanta as longitudes
  // de natal, de hoje e de amanhã uma vez só e as reaproveita item a item,
  // devolvendo um array do MESMO tamanho e na MESMA ordem — dá para casar pelo
  // índice. Falhou, fica null e a tela mostra o texto de sempre, sem a fase.
  const personalSkyFases = useMemo(() => {
    if (!Array.isArray(personalSky) || !personalSkyBirth) return null;
    try {
      return fasesDoCeuPessoal(personalSky, personalSkyBirth, lang);
    } catch {
      return null;
    }
  }, [personalSky, personalSkyBirth, lang]);

  // QUENTE PRIMEIRO, FICHA DEPOIS — lei do dono, aplicada aqui em 04/08/2026.
  // O motor de lib/transitoFase.js já devolvia `chamada`: a frase de vida real
  // da fase ("tem briga que terminou na segunda e continua ocupando a quinta"),
  // sem nome de planeta, sem grau e sem século. A tela mostrava só a FICHA — o
  // texto do trânsito e a linha técnica da fase — e a chamada morria no objeto.
  // Agora ela abre o card e a ficha desce, menor.
  //
  // A chamada é a MESMA para todos os aspectos de uma mesma fase: ela descreve
  // o estado do ângulo, não o planeta. Repetir o mesmo parágrafo três vezes num
  // card de Home vira ruído, então cada fase diz a sua UMA vez, no primeiro
  // aspecto em que aparece. Isso é seguro para quem não assina porque a lista
  // fechada é sempre um PREFIXO da aberta (slice(0, 1)): o primeiro aspecto é
  // sempre a estreia da fase dele, então quem vê um só vê a chamada dele.
  //
  // `temChamada` existe separado de `chamada` para a FICHA não oscilar de
  // tamanho dentro do mesmo card: o segundo aspecto da mesma fase não repete a
  // abertura, mas continua sendo recibo de uma leitura que já foi dada.
  const personalSkyBlocos = useMemo(() => {
    if (!Array.isArray(personalSky)) return [];
    const jaDita = new Set();
    return personalSky.map((aspecto, i) => {
      const fase = (personalSkyFases && personalSkyFases[i]) || null;
      const temChamada = !!(fase && fase.chamada);
      const estreia = temChamada && !jaDita.has(fase.fase);
      if (estreia) jaDita.add(fase.fase);
      return { aspecto, fase, temChamada, chamada: estreia ? fase.chamada : null };
    });
  }, [personalSky, personalSkyFases]);

  // O CÉU NOS PRÓXIMOS DIAS — countdown real do próximo evento do Calendário
  // Cósmico (lib/proximosEventos.js recorta lib/calendarioCosmico.js; nada é
  // calculado aqui). Duas decisões deliberadas:
  //
  //   1. import() DINÂMICO, mesma razão da linha de hoje logo abaixo: o motor
  //      do calendário puxa os TRÊS packs de texto de lib/traducoes/ (centenas
  //      de parágrafos), e a tela do Calendário é lazy() em App.js exatamente
  //      pra esse peso ficar fora do parse inicial. Um import estático aqui
  //      mataria essa decisão em silêncio — a Home é raiz de aba e carrega
  //      sempre. De quebra, a primeira chamada do mês custa ~140 ms de
  //      efeméride: rodando DEPOIS da primeira pintura, dentro do efeito, ela
  //      não segura o primeiro quadro (as chamadas seguintes saem do cache).
  //   2. recalcula a cada FOCO: à meia-noite "faltam 1 dia" vira "Amanhã" e o
  //      evento de ontem sai da lista — a Home fica montada na stack e sem
  //      isso mostraria a contagem de ontem. `lang` nas deps porque o título
  //      do evento vem traduzido do pack do calendário.
  //
  // null = não desenha o card. Motor indisponível, mês sem evento pela frente
  // ou chunk que não baixou dão o MESMO null — nunca um erro na cara de quem
  // só abriu o app, mesma disciplina do subtítulo vivo do card do Calendário.
  const [proximosCeu, setProximosCeu] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      (async () => {
        try {
          const { proximosEventos } = await import('../lib/proximosEventos');
          const lista = proximosEventos(new Date(), lang, 3);
          if (vivo) setProximosCeu(Array.isArray(lista) && lista.length > 0 ? lista : null);
        } catch {
          if (vivo) setProximosCeu(null);
        }
      })();
      return () => {
        vivo = false;
      };
    }, [lang])
  );

  // O FUNDO DO DIA DA FRASE — a mesma URL que o compartilhar usa (fonte
  // única em lib/shareCard.js). Recarrega por foco: à meia-noite o servidor
  // troca o fundo, e a faixa acompanha. null → cena do pack como reserva.
  const [fundoFraseDoDia, setFundoFraseDoDia] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      fundoDoDia('casal')
        .then((url) => {
          if (vivo) setFundoFraseDoDia(url || null);
        })
        .catch(() => {
          if (vivo) setFundoFraseDoDia(null);
        });
      return () => {
        vivo = false;
      };
    }, [])
  );

  // A contagem em palavra: 0 e 1 têm chave própria (Hoje/Amanhã), a chave com
  // {n} só recebe n >= 2 — o plural das três línguas está certo por
  // construção, sem lógica de plural nenhuma.
  const rotuloFaltamDias = (n) =>
    n === 0 ? t('home.eventos.hoje') : n === 1 ? t('home.eventos.amanha') : t('home.eventos.dias', { n });

  // A MINIATURA DO DESTAQUE (08/08/2026, última rodada de arte): o planeta
  // pintado do PRIMEIRO evento do card de próximos dias, quando o tipo tem
  // planeta honesto (PLANETA_DO_EVENTO, no topo do arquivo). Tipo sem planeta
  // (aspectoExato) ou asset faltando → null → o título fica como sempre foi.
  const arteProximoDestaque =
    Array.isArray(proximosCeu) && proximosCeu.length > 0
      ? planetaImagem(PLANETA_DO_EVENTO[proximosCeu[0].tipo])
      : null;

  // A linha de hoje (ver o bloco grande no topo do arquivo pro porquê de ser
  // UMA linha, de a trilha ganhar do ritual, e de os motores virem por import()
  // dinâmico). `null` = não há motivo de voltar hoje, e aí não se desenha nada.
  //
  // Recalcula a cada FOCO, por duas razões que se somam: a pessoa pode ter
  // acabado de fechar o passo do dia na Jornada e voltado pra cá (a linha tem
  // que sumir), e à meia-noite tanto o passo quanto o casamento de fase-e-dia
  // viram outros — a Home fica montada na stack e sem isso mostraria o de
  // ontem. É a mesma lição de virada de dia que as próprias telas resolvem com
  // useFocusEffect.
  const [todayLine, setTodayLine] = useState(null);
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      (async () => {
        let escolha = null;

        // 1º a trilha — ganha sempre que estiver ativa.
        try {
          const { trilhasParaIdioma, carregarJornada, podeConcluir } = await import('../lib/jornada');
          const estado = await carregarJornada();
          // trilhasParaIdioma em vez da constante TRILHAS: a constante e o PT
          // canonico, e era ela que forcava a guarda de idioma la embaixo.
          const TRILHAS = trilhasParaIdioma(lang);
          // Percorre na ordem de TRILHAS, e não em Object.values(estado.trilhas):
          // quem assina pode ter duas trilhas abertas ao mesmo tempo, e a linha
          // tem que ser a MESMA a cada abertura, não a que o objeto devolveu
          // primeiro.
          for (const tr of TRILHAS) {
            const p = estado.trilhas[tr.id];
            // "Ativa" é exigente de propósito: trilha começada (tem dia
            // fechado), ainda não inteira, e com o passo de HOJE liberado pelo
            // motor. Quem já fez o passo hoje não vê linha nenhuma — o app não
            // cutuca pra fazer o que não dá pra fazer, e a trava de um-por-dia é
            // perguntada ao motor (podeConcluir), nunca reimplementada aqui.
            if (!p || p.concluida || p.diasConcluidos.length === 0) continue;
            if (!podeConcluir(p, p.diaAtual).ok) continue;
            escolha = { tipo: 'jornada', nome: tr.nome, dia: p.diaAtual, total: p.total };
            break;
          }
        } catch {
          // Sem o módulo (chunk que não baixou, storage indisponível) a Home
          // não tem linha — nunca um erro na cara de quem só abriu o app.
        }

        // 2º o ritual de hoje, só se a trilha não tomou o lugar. O import fica
        // DENTRO do if: quem está no meio de uma trilha não paga o download dos
        // 21 rituais por causa de uma linha que não vai aparecer.
        if (!escolha) {
          try {
            const { rituaisDeHoje } = await import('../lib/rituais');
            const agoraMesmo = new Date();
            const forte = ritualMaisForteDeHoje(rituaisDeHoje(agoraMesmo, lang).rituais, agoraMesmo);
            if (forte) escolha = { tipo: 'ritual', titulo: forte.titulo };
          } catch {}
        }

        if (vivo) setTodayLine(escolha);
      })();
      return () => {
        vivo = false;
      };
      // `lang` na lista: a linha carrega nome de trilha e titulo de ritual, que
      // agora vem traduzidos do pack. Com a lista vazia, trocar de idioma
      // deixaria a linha no idioma anterior ate o proximo foco de tela.
    }, [lang])
  );

  // Iniciais da semana no idioma atual (mesma ordem seg→dom do getWeekActivity).
  const WEEK_LABELS = WEEK_LABEL_KEYS.map((k) => t(k));

  const today = new Date();
  const dateStr = today.toLocaleDateString(lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  // Data de hoje em YYYY-MM-DD (mesmo formato que DatePickerModal já monta a
  // partir de campos locais e que aspects()/planetPositions() esperam) — ver
  // lib/localDay.js pro porquê de ser dia LOCAL, nunca toISOString/UTC.
  const todayISO = localDayStr(today);

  // Evento cósmico real (lib/signs.js aspects()) — hora omitida de propósito
  // (aspects/planetPositions já usam meio-dia como aproximação aceitável pra
  // planetas além da Lua). Memoizado por todayISO: a trigonometria só roda de
  // novo quando o dia muda, não a cada re-render da tela (loading, foco, etc.).
  // SUBTÍTULO VIVO DO CALENDÁRIO CÓSMICO. O card era estático ("As datas deste
  // mês"), e com isso a Home deixou de avisar que existe uma Temporada de Leão
  // rolando quando o card das Temporadas saiu: o conteúdo mudou de casa e
  // perdeu o sinal. Com isto a mudança volta a ser promoção de casa em vez de
  // sumiço — "Temporada de Leão · Mercúrio retrógrado" em vez de uma frase que
  // é a mesma o ano inteiro.
  //
  // RELIGADO PARA OS TRÊS IDIOMAS em 01/08/2026. A guarda `lang !== 'pt'`
  // existia porque activeCelestialEvents() devolvia título em português, e o
  // comentário antigo dizia "melhor a frase genérica do que a frase híbrida" —
  // certo como paliativo, errado como destino: o gringo PERDIA a informação em
  // vez de recebê-la. Agora o motor tem pack nos três (lib/traducoes/
  // celestial.js) e o subtítulo volta a mostrar o que está acontecendo no céu.
  const calendarioSubtitle = useMemo(() => {
    try {
      const ativos = activeCelestialEvents(new Date(`${todayISO}T12:00:00`), lang);
      if (!ativos || ativos.length === 0) return null;
      return ativos.slice(0, 2).map((e) => e.title).join(' · ');
    } catch {
      // Sem efeméride o card volta ao subtítulo estático — nunca uma data
      // chutada, mesma disciplina do resto do app.
      return null;
    }
  }, [todayISO, lang]);

  // SUBTÍTULO VIVO DA RETROSPECTIVA DA LUA CHEIA. Mesma jogada do subtítulo do
  // Calendário Cósmico logo acima, e aqui ela vale ainda mais: a tela só tem o
  // que mostrar nos dias de Lua Cheia, e um card com a mesma frase o mês
  // inteiro esconderia justamente o dia em que vale a pena tocar. Memoizado por
  // todayISO — é trigonometria barata, mas roda uma vez por dia, não a cada
  // re-render da Home. Sem efeméride ehDiaDeLuaCheia devolve false e o card
  // volta ao subtítulo estático: nunca um "hoje é o dia" chutado.
  const retroLuaHoje = useMemo(() => ehDiaDeLuaCheia(new Date(`${todayISO}T12:00:00`)), [todayISO]);

  const todaysAspects = useMemo(() => aspects(todayISO, null), [todayISO]);
  const cosmicEvent = useMemo(() => {
    if (!todaysAspects || todaysAspects.length === 0) return null;
    // Aspecto mais exato (menor orbe) entre os retornados de verdade — não fabricado.
    return todaysAspects.reduce((best, a) => (a.orb < best.orb ? a : best), todaysAspects[0]);
  }, [todaysAspects]);

  // Três estados possíveis nesta tela (o Gate em App.js garante que ao menos um
  // dos dois sinais existe): casal com quiz feito, solo com signo escolhido, ou
  // (teoricamente) nenhum dos dois — fallback igual ao anterior.
  const isCouple = !!coupleData;

  // 4º degrau: "chegou na Home de verdade, já com perfil". Espera `loading`
  // sair — enquanto o CoupleContext carrega, esta tela é só um spinner, e
  // contar isso como Home vista mentiria sobre onde a pessoa parou. No mount
  // (efeito), nunca no corpo do componente: a Home re-renderiza muito (foco,
  // streak, céu pessoal, missões) e um track() solto aqui viraria dezenas de
  // linhas iguais.
  useEffect(() => {
    if (loading) return;
    funnel.homeView(isCouple ? 'couple' : 'solo');
  }, [loading, isCouple]);

  // Signo usado no badge do topo e na navegação do grid (Horóscopo) — usa o signo real
  // do casal quando existir, senão o signo solo, com o mesmo fallback de antes.
  const sign = (coupleData?.sa && zodiacSigns.find((z) => z.name === coupleData.sa)) || soloSign || zodiacSigns[0];

  // O mascote do signo do usuário (pack de arte). null = pack sem a arte, e aí
  // NADA extra renderiza no hero — o badge de glifo do HeroSection fica como
  // sempre foi, sem quadrado vazio no lugar.
  const mascoteHero = mascoteDoSigno(sign.name);

  // Sinastria por aspecto (lib/signs.js → lib/synastry.js) — null enquanto não
  // houver os dois signos salvos. O cartão mostrava "{pct}% de compatibilidade";
  // mostra o ASPECTO e a CATEGORIA, que é o que o app calcula de verdade.
  // A porcentagem saiu do app inteiro — ver o cabeçalho de lib/synastry.js.
  const compat = coupleData?.sa && coupleData?.sb ? compatibility(coupleData.sa, coupleData.sb, lang) : null;

  const greeting = isCouple
    ? t('home.greetingCouple', { voce: coupleData.voce, amor: coupleData.amor })
    // sign.pt e o nome PORTUGUES do signo — em ingles dava "Hi, Gemeos"
    // dois centimetros acima do pensamento do dia que dizia "Gemini".
    // Perfis legados salvaram `nome`/`signo` antes de o objeto canÃ´nico ganhar
    // `pt`. Aceitar os quatro formatos evita a saudaÃ§Ã£o "OlÃ¡, undefined" para
    // quem apenas atualizou o app.
    : t('home.greetingSolo', { sign: nomeDoSigno(sign.pt || sign.nome || sign.name || sign.signo, lang) });

  // Timeline exige memórias reais do casal — não faz sentido pra quem ainda
  // não tem par, fica escondida por completo pra usuário solo. As outras 5
  // aparecem pra solo também, mas como convite: mostram o cadeado e, ao tocar,
  // o withFeatureGate (App.js) exibe "isso é pra fazer em casal" convidando a
  // pessoa a chamar o par — induz a trazer o parceiro pro app pra reconectar,
  // jogar junto, etc., em vez de esconder a existência da feature.
  const COUPLE_ONLY = ['timeline'];

  // Exclusivas de assinantes (mesmas 5 rotas bloqueadas por withFeatureGate em
  // App.js) — timeline fica de fora, é livre pra qualquer casal. Mostra o badge
  // de cadeado no grid (FeatureCard.js já tinha o prop `locked` pronto, só não
  // era usado ainda); o bloqueio real acontece na tela em si, via feature gate.
  // Solo também vê o cadeado aqui (ainda não tem par pra desbloquear).
  //
  // AS TRÊS TELAS NOVAS (rituais, jornada, calendario) NÃO ENTRAM AQUI, e a
  // decisão de paywall é essa: elas seguem o padrão do app — 1 uso grátis
  // vitalício por feature (lib/featureUsage.js + OneTimeLock), com a assinatura
  // destravando sem limite —, e esse padrão é cobrado DENTRO da tela, no ponto
  // em que a pessoa já viu o que está pedindo (o detalhe do ritual, a segunda
  // trilha, o mês que não é o de agora). Cada uma dessas telas já resolveu isso
  // no próprio arquivo, e cada uma escolheu o que conta como "um uso" pelo
  // formato dela — ritual: o primeiro detalhe aberto fica aberto pra sempre;
  // jornada: a unidade é a TRILHA inteira, senão o muro cairia no dia 2;
  // calendário: o mês vigente é sempre livre, o passeio é que é da assinatura.
  // Pôr `locked: true` no card seria um quarto muro, desenhado por cima, e ele
  // mentiria: mostraria cadeado numa porta que abre. Cadeado no grid é
  // exclusivo de feature que a pessoa NÃO consegue abrir sem formar casal —
  // que é o caso das cinco daqui de cima, e não é o caso das três novas. É a
  // mesma razão por que grounding, palm e coffee nunca tiveram cadeado no card.
  const LOCKED_KEYS = ['reconectar', 'descobrir', 'agir', 'progresso', 'retrospectiva'];

  const ALL_ITEMS = [
    { key: 'horoscope', title: t('home.card.horoscope.title'), subtitle: t('home.card.horoscope.subtitle'), icon: 'planet', gradient: ['#7B3FB5', '#A66CFF'], onPress: () => navigation.navigate(ROUTES.HOROSCOPE, { sign }) },
    // Como você tá?: a entrada por emoção — um ROTEADOR pras leituras que já
    // existem, e roteador que ninguém acha não roteia nada. Por isso mora aqui
    // no COMEÇO de Leituras, logo depois do horóscopo, e não enterrado no fim
    // do grid atrás de chat e social (onde a leva de 31/07 o deixou primeiro).
    // Coração, mas heart-half pra não confundir com o heart cheio da
    // Compatibilidade no mesmo grid.
    { key: 'comovoceta', title: t('home.card.comovoceta.title'), subtitle: t('home.card.comovoceta.subtitle'), icon: 'heart-half', gradient: ['#FF7BD5', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.COMO_VOCE_TA) },
    { key: 'birthchart', title: t('home.card.birthchart.title'), subtitle: t('home.card.birthchart.subtitle'), icon: 'compass', gradient: ['#5CA8FF', '#6C7BFF'], onPress: () => navigation.navigate(ROUTES.BIRTH_CHART) },
    { key: 'tarot', title: t('home.card.tarot.title'), subtitle: t('home.card.tarot.subtitle'), icon: 'sparkles', gradient: ['#FF6BA0', '#B57BFF'], onPress: () => navigation.getParent()?.navigate(ROUTES.TAROT_TAB) },
    { key: 'compatibility', title: t('home.card.compatibility.title'), subtitle: t('home.card.compatibility.subtitle'), icon: 'heart', gradient: ['#FF8C5C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.COMPATIBILITY) },
    { key: 'timeline', title: t('home.card.timeline.title'), subtitle: t('home.card.timeline.subtitle'), icon: 'time', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.TIMELINE) },
    { key: 'reconectar', title: t('home.card.reconectar.title'), subtitle: t('home.card.reconectar.subtitle'), icon: 'heart-circle', gradient: ['#FF7BD5', '#FF6BA0'], onPress: () => navigation.navigate(ROUTES.RECONECTAR) },
    { key: 'descobrir', title: t('home.card.descobrir.title'), subtitle: t('home.card.descobrir.subtitle'), icon: 'telescope', gradient: ['#6C7BFF', '#B57BFF'], onPress: () => navigation.navigate(ROUTES.DESCOBRIR) },
    { key: 'agir', title: t('home.card.agir.title'), subtitle: t('home.card.agir.subtitle'), icon: 'flash', gradient: ['#FFC85C', '#FF6B7A'], onPress: () => navigation.navigate(ROUTES.AGIR) },
    { key: 'progresso', title: t('home.card.progresso.title'), subtitle: t('home.card.progresso.subtitle'), icon: 'trophy', gradient: ['#5FD98C', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.PROGRESSO) },
    { key: 'retrospectiva', title: t('home.card.retrospectiva.title'), subtitle: t('home.card.retrospectiva.subtitle'), icon: 'gift', gradient: ['#FFC85C', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.RETROSPECTIVA) },
    { key: 'dream', title: t('home.card.dream.title'), subtitle: t('home.card.dream.subtitle'), icon: 'moon', gradient: ['#5CE0D8', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.DREAM) },
    { key: 'lunarCalendar', title: t('home.card.lunarCalendar.title'), subtitle: t('home.card.lunarCalendar.subtitle'), icon: 'planet', gradient: ['#5CA8FF', '#5CE0D8'], onPress: () => navigation.navigate(ROUTES.LUNAR_CALENDAR) },
    // Calendário Cósmico: a grade do mês com as datas medidas (lua exata,
    // ingresso do Sol, retrógrado, aspecto exato). Vizinho do Calendário Lunar
    // de propósito — são as duas telas de DATA, e quem procura uma procura a
    // outra. É também a casa pra onde foram as "Temporadas do Céu" que saíram
    // da Home hoje (ver o comentário mais abaixo, onde o card ficava): este
    // card é a entrada que restou pra elas, e é uma entrada melhor, porque lá
    // a temporada aparece em ordem de data junto com o resto do mês.
    // Fora de READING_CARD_KEYS pelo mesmo motivo do Homem Zodiacal: é
    // efeméride do céu, não uma leitura sobre a pessoa.
    { key: 'calendario', title: t('home.card.calendario.title'), subtitle: calendarioSubtitle || t('home.card.calendario.subtitle'), icon: 'calendar', gradient: ['#FFC85C', '#FF8C5C'], onPress: () => navigation.navigate(ROUTES.CALENDARIO_COSMICO) },
    // Homem Zodiacal: tela de HISTÓRIA (o que a astrologia médica medieval
    // dizia), não uma leitura sobre a pessoa — por isso fica fora de
    // READING_CARD_KEYS lá em cima. Entra ao lado do Calendário Lunar porque é
    // a outra tela que muda sozinha com a Lua.
    { key: 'zodiacbody', title: t('home.card.zodiacbody.title'), subtitle: t('home.card.zodiacbody.subtitle'), icon: 'body', gradient: ['#B57BFF', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.ZODIAC_BODY) },
    // Retrospectiva da Lua Cheia: o balanço do ciclo da PESSOA (dias de
    // presença, placar do check-in, leituras) desde a última Lua Nova.
    //
    // Entra no grupo Datas, e não em Leituras, porque o que manda nela é uma
    // data do céu — ela abre na Cheia e, fora dela, avisa quando volta. Quem
    // procura o Calendário Lunar é exatamente quem vai entender por que esta
    // aqui só responde em certos dias. Fora de READING_CARD_KEYS pelo mesmo
    // motivo do Homem Zodiacal e do Calendário: não é uma leitura sobre a
    // pessoa, é a contagem do que ela mesma registrou. Fora de LOCKED_KEYS
    // também — não exige casal nem assinatura (ver App.js).
    // Ícone de gráfico, não de lua: 'moon' já é o card do Sonho no mesmo grid,
    // e duas luas confundiriam. Além disso 'stats-chart' diz a verdade sobre o
    // que a tela é — um balanço contado, não uma leitura.
    { key: 'retrolua', title: t('home.card.retrolua.title'), subtitle: retroLuaHoje ? t('home.card.retrolua.subtitleHoje') : t('home.card.retrolua.subtitle'), icon: 'stats-chart', gradient: ['#FFC85C', '#B57BFF'], onPress: () => navigation.navigate(ROUTES.RETRO_LUA) },
    // Assentar: o ritual de respiração e presença. Também fica fora de
    // READING_CARD_KEYS — não é leitura sobre a pessoa, é uma prática. A porta
    // principal dele é o convite no fim de cada leitura
    // (components/GroundingInvite.js); este card é a porta pra quem quiser
    // voltar sozinho, sem precisar tirar uma carta antes.
    { key: 'grounding', title: t('home.card.grounding.title'), subtitle: t('home.card.grounding.subtitle'), icon: 'leaf', gradient: ['#5CE0D8', '#5FD98C'], onPress: () => navigation.navigate(ROUTES.GROUNDING) },
    // Rituais: 21 práticas em 7 objetivos (lib/rituais.js). Colado em Assentar
    // porque as duas são PRÁTICA — coisa que se faz com o corpo e com a mão,
    // não leitura sobre a pessoa. Por isso as duas ficam fora de
    // READING_CARD_KEYS: contar um toque aqui como "pediu a 1ª leitura"
    // encheria o degrau de gente que não leu nada.
    { key: 'rituais', title: t('home.card.rituais.title'), subtitle: t('home.card.rituais.subtitle'), icon: 'flame', gradient: ['#FFB84D', '#FF6BA0'], onPress: () => navigation.navigate(ROUTES.RITUAIS) },
    // Jornada Guiada: quatro trilhas de 7 dias (lib/jornada.js). Também fora de
    // READING_CARD_KEYS — é estudo em série, com um passo por dia, e a coisa
    // que ela produz não é uma leitura sobre a pessoa.
    { key: 'jornada', title: t('home.card.jornada.title'), subtitle: t('home.card.jornada.subtitle'), icon: 'footsteps', gradient: ['#5FD98C', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.JORNADA) },
    { key: 'palm', title: t('home.card.palm.title'), subtitle: t('home.card.palm.subtitle'), icon: 'hand-left', gradient: ['#FFB84D', '#FF8C5C'], onPress: () => navigation.navigate(ROUTES.PALM) },
    { key: 'coffee', title: t('home.card.coffee.title'), subtitle: t('home.card.coffee.subtitle'), icon: 'cafe', gradient: ['#B57BFF', '#7B3FB5'], onPress: () => navigation.navigate(ROUTES.COFFEE) },
    {
      key: 'social',
      title: t('home.card.social.title'),
      subtitle: t('home.card.social.subtitle'),
      icon: 'people',
      gradient: ['#5CE0D8', '#7B3FB5'],
      onPress: () => navigation.getParent()?.navigate(
        ROUTES.COMMUNITY_TAB,
        { screen: ROUTES.COMMUNITY_MAIN }
      ),
    },
    // -----------------------------------------------------------------------
    // A LEVA DE 31/07/2026 — entradas NO GRID, nenhuma virou card solto na
    // dobra de cima: no mesmo dia o dono tirou dois cards da Home por
    // empilhamento ("fica perdido no meio"), e responder com cards novos fora
    // do grid seria desfazer o pedido. Todas ficam fora de READING_CARD_KEYS —
    // nenhuma é leitura sobre a pessoa (mitos e quiz são história com fonte, e
    // o papel de parede é uma imagem do céu do dia; "Como você tá?", o roteador
    // por emoção da mesma leva, subiu pro começo de Leituras — ver lá em cima,
    // logo após horoscope). Fora de LOCKED_KEYS também: nenhuma exige casal,
    // mesma razão dos cards de Rituais/Jornada logo acima. Estas três formam o
    // grupo "Curiosidades" do grid (CURIOSIDADES_KEYS, abaixo) — são feitas pra
    // compartilhar, não pra assinar.
    // -----------------------------------------------------------------------
    // Mito × Fonte: o card feito pra print/compartilhar — daí o share-social.
    { key: 'mitos', title: t('home.card.mitos.title'), subtitle: t('home.card.mitos.subtitle'), icon: 'share-social', gradient: ['#B57BFF', '#FF7BD5'], onPress: () => navigation.navigate(ROUTES.MITOS) },
    // Você sabia?: sete perguntas por dia — a interrogação é literal.
    { key: 'quizcosmico', title: t('home.card.quizcosmico.title'), subtitle: t('home.card.quizcosmico.subtitle'), icon: 'help-circle', gradient: ['#5CA8FF', '#B57BFF'], onPress: () => navigation.navigate(ROUTES.QUIZ_COSMICO) },
    // Papel de Parede: o PNG do céu de hoje — ícone de imagem.
    { key: 'wallpaper', title: t('home.card.wallpaper.title'), subtitle: t('home.card.wallpaper.subtitle'), icon: 'image', gradient: ['#7B3FB5', '#5CA8FF'], onPress: () => navigation.navigate(ROUTES.WALLPAPER) },
    // A Idade Real de Cada Coisa: as 30 datacoes do doc 10. Fica COLADA em
    // Mitos de proposito — sao as duas telas que corrigem o que o mercado
    // repete, e quem gostou de uma quer a outra. Icone de ampulheta porque a
    // tela inteira e sobre IDADE, nao sobre fonte.
    { key: 'idadereal', title: t('home.card.idadereal.title'), subtitle: t('home.card.idadereal.subtitle'), icon: 'hourglass', gradient: ['#FF7BD5', '#FFB84D'], onPress: () => navigation.navigate(ROUTES.IDADE_REAL) },
    // Profecções (Ptolomeu, Tetrabiblos IV.10) — vizinha de idadereal de
    // propósito: são as duas telas que mostram a fonte na cara. Diferente das
    // outras, esta lê a data de nascimento da pessoa, então tem estado de
    // "ainda não sei sua data" que manda pro Mapa Astral em vez de inventar.
    { key: 'profeccoes', title: t('home.card.profeccoes.title'), subtitle: t('home.card.profeccoes.subtitle'), icon: 'refresh-circle', gradient: ['#B57BFF', '#FFC85C'], onPress: () => navigation.navigate(ROUTES.PROFECCOES) },
  ];
  // Diário Cósmico saiu do grid — vira uma faixa inteira fixa no topo (ver
  // abaixo, logo depois do HeroSection), sempre visível em vez de ser só
  // mais um card entre os outros.

  // A Comunidade é pública e separada dos dados do casal. Ela permanece
  // visível nos dois modos, exatamente como a quarta aba principal.
  const SOLO_ONLY = [];

  const cardItems = ALL_ITEMS.filter((c) => (isCouple || !COUPLE_ONLY.includes(c.key)) && (!isCouple || !SOLO_ONLY.includes(c.key)))
    .map((c) =>
      !isOwnerAccount && (!isCouple || !hasCoupleAccess) && LOCKED_KEYS.includes(c.key) ? { ...c, locked: true } : c
    )
    // 5º degrau: "pediu a 1ª leitura". Marcado no TOQUE do card, que é a
    // intenção real — e não na montagem da tela de leitura, que também
    // acontece quando a pessoa só passa por ali. O evento é enfileirado antes
    // de navegar (fire-and-forget: track() é síncrona e não devolve promise,
    // então a navegação não espera nada).
    .map((c) =>
      READING_CARD_KEYS.has(c.key)
        ? {
            ...c,
            onPress: () => {
              funnel.readingStart(c.key, 'home_card');
              c.onPress();
            },
          }
        : c
    );

  // The Diary lives in its own Home strip, outside the grid. It is still a
  // real route and can be the first step for closure or emotional reflection.
  // This descriptor makes it eligible without duplicating it in the catalog.
  const pathItems = [
    ...cardItems,
    {
      key: 'diary',
      title: t('home.card.diary.title'),
      subtitle: t('home.card.diary.subtitle'),
      icon: 'book-outline',
      onPress: () => navigation.navigate(ROUTES.DIARY),
    },
  ];

  const resolvedIntent = onboardingProfile?.intent || onboardingIntent || 'curiosity';
  const intentDefinition = getOnboardingIntentDefinition(resolvedIntent);
  const situationDefinition = onboardingProfile
    ? getOnboardingSituationDefinition(resolvedIntent, onboardingProfile.situation)
    : null;
  const pathReasonDefinition = situationDefinition || intentDefinition;
  const firstPathKeys = buildOnboardingPlan(
    resolvedIntent,
    isCouple ? 'couple' : 'solo',
    onboardingProfile
  );
  const firstPathItem = pathItems.find((item) => item.key === firstPathKeys[0]) || null;
  const firstPathFeature = firstPathItem?.key === 'tarot' ? t('tab.tarot') : firstPathItem?.title;
  // A trilha dominante só aparece para quem realmente respondeu à pergunta.
  // Perfis antigos continuam com a abertura editorial e encontram todas as
  // experiências na porta permanente de Explore.
  const hasOnboardingChoice = !!(onboardingProfile || onboardingIntent);
  const showFirstPath = journalCount === 0 && hasOnboardingChoice && !!firstPathItem && !!intentDefinition;
  const showPersistentPath = !showFirstPath && hasOnboardingChoice && !!firstPathItem && !!intentDefinition;

  // Determinístico por data (lib/dailyThought.js) — mesmo pensamento-base pra
  // todo mundo que abrir o app hoje, muda sozinho à meia-noite. Desde
  // 31/07/2026 getTodaysThought PREFIXA uma abertura por período (manhã/tarde/
  // noite, hora local — periodoDoDia no mesmo lib), então o texto do card já
  // vem com ela embutida: nada a montar aqui, e como a Home re-renderiza a
  // cada foco, quem volta à noite vê a abertura da noite. Mesmo conteúdo
  // que a notificação diária (Perfil > Pensamento cósmico diário) só avisa
  // que chegou — o texto de verdade sempre vive aqui dentro. Passa o `sign`
  // já calculado acima (real, casal ou solo — nunca inventado aqui) pra
  // personalizar o endereçamento da frase.
  //
  // `lang` é o 3º argumento e é a ÚNICA coisa que mudou aqui em 31/07/2026: o
  // pensamento passou a existir em es/en (packs em lib/traducoes/pensamento.*).
  // O cálculo não muda com o idioma — mesmo dia + mesmo signo dá o mesmo
  // pensamento nos três. `sign.name` continua sendo o nome CANÔNICO em
  // português (theme.js): quem traduz o nome pra tela é o pack, dentro do lib.
  const todaysThought = getTodaysThought(sign, new Date(), lang);

  // A Espiada de Amanhã saiu da Home em 31/07/2026 (ver o comentário no lugar
  // onde o card ficava). O cálculo saiu junto — deixar getThoughtForDate()
  // rodando a cada render pra alimentar uma tela que não existe mais é
  // trabalho jogado fora. O motor continua em lib/dailyThought.js, intacto,
  // pra quando a espiada voltar com corte em ponto de curiosidade.

  // Frase do dia de amor (lib/lovePhrase.js) — feita pra compartilhar de
  // verdade com o par (WhatsApp etc.), não só ler dentro do app: dá um motivo
  // concreto pra abrir todo dia E pra expor o app pra quem ainda não usa
  // (pedido explícito do Lenda, 25/07/2026 — retenção via compartilhamento).
  const todaysLovePhrase = getTodaysLovePhrase(lang);
  const handleShareLovePhrase = async () => {
    // PRIMEIRO O CARD, DEPOIS O TEXTO (04/08/2026, pedido do Lenda): a frase
    // sai como imagem — fundo cinematográfico do dia (/api/daily-cards) com a
    // frase e a marca desenhadas por cima. Três saídas possíveis:
    //   'compartilhado'/'baixado' → deu certo, registra a missão e para;
    //   'cancelado' → a pessoa abriu o share e desistiu — desistir é
    //                 desistir, não empilhamos outro diálogo em cima;
    //   false → falha técnica (rede, canvas, nativo) → o share de TEXTO de
    //           sempre assume, que nunca quebra.
    const viaCard = await compartilharFraseComoCard({ frase: todaysLovePhrase, tipo: 'casal' });
    if (viaCard === 'compartilhado' || viaCard === 'baixado') {
      recordMissionAction(MISSION_ACTIONS.FRASE_COMPARTILHADA);
      return;
    }
    if (viaCard === 'cancelado') return;
    try {
      // O link vai junto de propósito: é ele que faz o WhatsApp/Telegram
      // mostrarem a prévia rica (OG tags em public/index.html) e traz quem
      // recebeu a frase pra dentro do app.
      // A TAGLINE ENTRE A FRASE E A URL (04/08/2026): o link ia pelado, e link
      // pelado quem recebe não abre — lê a frase, acha bonitinha e ignora a
      // URL. "Amanhã tem outra" é o motivo de voltar, e é literal: a frase é
      // determinística por data (lib/lovePhrase.js).
      const result = await Share.share({
        message: `${todaysLovePhrase}\n\n${t('home.lovePhrase.shareTagline')} https://cosmicguide.cloud`,
      });
      // Missão 'compartilhar-frase' (lib/missions.js): marca a ação SÓ quando
      // o share não foi descartado (iOS reporta dismissedAction; Android e web
      // só resolvem em sucesso; cancelar na web rejeita e cai no catch). O
      // crédito continua exclusivo de completeMission, que re-verifica.
      if (!result || result.action !== Share.dismissedAction) {
        recordMissionAction(MISSION_ACTIONS.FRASE_COMPARTILHADA);
      }
    } catch {
      // usuário cancelou ou o compartilhamento falhou — sem tela de erro, mesmo padrão de RetrospectivaScreen.js
    }
  };

  // O texto da linha de hoje, montado uma vez. Os dois casos são a MESMA
  // forma — o que está aberto hoje, e a palavra que leva pra lá — porque a
  // linha precisa ser lida de relance, sem a pessoa ter que descobrir de qual
  // das duas features ela está falando.
  const ehTrilha = todayLine && todayLine.tipo === 'jornada';

  // A GUARDA DE IDIOMA CAIU EM 01/08/2026, e o comentário anterior previa
  // exatamente isso: "a guarda cai sozinha no dia em que `nome` e `titulo`
  // virarem chave". Viraram — lib/jornada.js e lib/rituais.js ganharam packs
  // nos três idiomas, e o efeito acima passou a pedir trilhasParaIdioma(lang)
  // e rituaisDeHoje(agoraMesmo, lang) em vez da constante PT canônica.
  //
  // Por que importa mais do que parece: esta linha é o ÚNICO gancho de
  // reentrada da Home para as duas features novas (Jornada e Rituais). Em ES e
  // EN ela estava desligada, então o app tinha duas features que o gringo só
  // encontrava se caçasse no grid.
  const mostrarTodayLine = !!todayLine;
  const todayLineText = !todayLine
    ? ''
    : ehTrilha
    ? t('home.today.jornada', { nome: todayLine.nome, dia: todayLine.dia, total: todayLine.total })
    : t('home.today.ritual', { titulo: todayLine.titulo });
  const todayLineCta = !todayLine ? '' : t(ehTrilha ? 'home.today.jornada.cta' : 'home.today.ritual.cta');

  // A ZONA DO CÉU só monta quando ao menos um dos três filhos dela monta
  // (convite do céu, céu de hoje, próximos dias) — os três são condicionais,
  // e uma BandaSection sem filho nenhum seria uma faixa clara VAZIA no meio
  // do rolo (acontece no primeiro instante do foco, com personalSky ainda
  // undefined e proximosCeu ainda null). O gate repete as MESMAS condições
  // dos filhos, nunca inventa condição nova.
  const temZonaCeu =
    personalSky === null ||
    (Array.isArray(personalSky) && personalSky.length > 0) ||
    (Array.isArray(proximosCeu) && proximosCeu.length > 0);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* O cenário cobre o fundo chapado por cima; o root MANTÉM
          colors.background por baixo, pra área além do cenário nunca piscar.
          pointerEvents="none" lá dentro — decoração nunca rouba toque. */}
      <CosmicScene />
      {milestone && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setMilestone(null)}>
          <View style={styles.milestoneBackdrop}>
            <LinearGradient colors={gradients.gold} style={styles.milestoneCard}>
              <Text style={styles.milestoneEmoji}>{milestone.days >= 100 ? '👑' : milestone.days >= 30 ? '🌟' : '🔥'}</Text>
              <Text style={styles.milestoneTitle}>{t('home.milestone.title', { days: milestone.days })}</Text>
              <Text style={styles.milestoneSubtitle}>{t('home.milestone.bonus', { tokens: milestone.tokens })}</Text>
              {/* Motor de Oferta (pico emocional): quem sustenta 7+ dias de
                  sequência sem assinar já provou que o app virou hábito — o
                  momento certo de oferecer, uma linha só, sem insistência
                  (o modal de marco já aparece uma única vez por natureza). */}
              {!hasAccess && !isOwnerAccount && (
                <TouchableOpacity
                  style={styles.milestoneOfferBtn}
                  activeOpacity={0.85}
                  onPress={() => {
                    setMilestone(null);
                    navigation.navigate(ROUTES.PLANOS);
                  }}
                >
                  <Text style={styles.milestoneOfferText}>{t('home.milestone.offer')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.milestoneBtn} activeOpacity={0.85} onPress={() => setMilestone(null)}>
                <Text style={styles.milestoneBtnText}>{t('home.milestone.continue')}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </Modal>
      )}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* A pill de sequência do hero usa o MESMO streakInfo do card de
            sequência logo abaixo (lib/streak.js) — antes vinha de
            coupleData.streak, uma contagem que NENHUM arquivo do app gravava:
            a pill dizia "Comecem hoje a sequência de vocês" enquanto o card na
            mesma dobra dizia "4 dias seguidos". Continua exclusiva de casal
            (undefined para solo esconde a pill, como sempre foi). */}
        {/* Saudação em corpo display (reforma 08/08/2026): HeroSection está
            fora do escopo desta reforma (só HomeScreen.js muda), então o
            upgrade entra por Text ANINHADO — no RN o estilo do Text interno
            vence o do externo, e o texto é o MESMO `greeting` de sempre. */}
        {/* O MASCOTE NO HERO [AUTO-DECISION] (08/08/2026): HeroSection.js está
            fora do escopo desta frente, então o avatar entra por SOBREPOSIÇÃO —
            um wrapper relativo em volta do hero e o mascote absoluto no canto
            direito da saudação, exatamente onde o signBadge de glifo vive. O
            mascote de 72px cobre o badge de 44px (top = insets.top + 8 casa com
            o paddingTop insetTop+14 do hero em qualquer altura de saudação):
            visualmente o glifo vira personagem do pack. Sem arte (mascoteHero
            null) NADA disto monta e o badge segue no posto — nunca um quadrado
            vazio. pointerEvents="none": decoração não rouba toque;
            accessible={false}: o signo já está dito em texto na saudação. */}
        <View style={styles.heroWrap}>
          <HeroSection
            greeting={<Text style={styles.greetingDisplay}>{greeting}</Text>}
            dateStr={dateStr}
            sign={sign}
            streak={coupleData ? { count: streakInfo.currentStreak } : undefined}
            insetTop={insets.top}
          />
          {mascoteHero && (
            <View
              pointerEvents="none"
              style={[styles.heroMascoteWrap, { top: insets.top + 8, borderColor: sign.color + '88' }]}
            >
              <Image source={mascoteHero} style={styles.heroMascoteImg} resizeMode="cover" accessible={false} />
            </View>
          )}
        </View>

        {showFirstPath && (
          <Pressable
            testID="home-first-path"
            style={({ pressed }) => [styles.firstPathCard, pressed && styles.firstPathPressed]}
            onPress={firstPathItem.onPress}
            accessibilityRole="button"
          >
            <View style={styles.firstPathInner}>
              <Text style={styles.firstPathEyebrow}>{t('home.firstPath.eyebrow')}</Text>
              <Text style={styles.firstPathTitle}>
                {t('home.firstPath.title', { feature: firstPathFeature })}
              </Text>
              <Text style={styles.firstPathBody}>
                {t('home.firstPath.body', {
                  intent: t(pathReasonDefinition.labelKey),
                })}
              </Text>
              <View style={styles.firstPathCta}>
                <Text style={styles.firstPathCtaText}>{t('home.firstPath.cta')}</Text>
                <View style={styles.firstPathArrow}>
                  <Ionicons name="arrow-forward" size={17} color="#21151A" />
                </View>
              </View>
            </View>
          </Pressable>
        )}
        {showFirstPath && <CosmicSoundPlayer variant="inline" style={styles.hiddenSoundRegistrar} />}

        {showPersistentPath && (
          <View style={styles.forYouWrap}>
            <Text style={styles.forYouEyebrow}>{t('home.forYou.eyebrow')}</Text>
            <Pressable
              style={({ pressed }) => [styles.forYouPrimary, pressed && styles.firstPathPressed]}
              onPress={firstPathItem.onPress}
              accessibilityRole="button"
            >
              <View style={styles.forYouIcon}>
                <Ionicons name={firstPathItem.icon} size={22} color={colors.gold} />
              </View>
              <View style={styles.forYouCopy}>
                <Text style={styles.forYouTitle}>{t('home.forYou.title', { feature: firstPathFeature })}</Text>
                <Text style={styles.forYouBody}>{t('home.forYou.body', { intent: t(pathReasonDefinition.labelKey) })}</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={colors.gold} />
            </Pressable>

          </View>
        )}

        {/* ALINHE SEU CÉU — assinatura gestual em uma porta editorial própria.
            Ela não entra no grid nem recolhe qualquer parte da Home. O caminho
            inicial continua primeiro, mas esta porta nunca some: esconder o
            gesto justamente de quem acabou de chegar quebraria seu papel de
            encantamento e repetiria o incidente da Home incompleta. */}
          <Pressable
            testID="home-sky-alignment"
            style={({ pressed }) => [
              styles.skyAlignmentCard,
              alignmentFocused && styles.keyboardFocus,
              pressed && styles.firstPathPressed,
            ]}
            onPress={() => navigation.navigate(ROUTES.SKY_ALIGNMENT)}
            onFocus={() => setAlignmentFocused(true)}
            onBlur={() => setAlignmentFocused(false)}
            accessibilityRole="button"
          >
            <LinearGradient
              colors={['#2A1A2D', '#171019', '#302027']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.skyAlignmentInner}
            >
              <View style={styles.skyAlignmentTop}>
                <Text style={styles.skyAlignmentTitle}>{t('home.alignment.title')}</Text>
                <View pointerEvents="none" style={styles.skyAlignmentVisual} accessible={false}>
                  <View style={styles.skyAlignmentNatalDisc}>
                    <Ionicons name="compass-outline" size={19} color={colors.gold} />
                  </View>
                  <View style={styles.skyAlignmentCurrentDisc}>
                    <Ionicons name="planet-outline" size={18} color={colors.text} />
                  </View>
                  <View style={styles.skyAlignmentAxis} />
                </View>
              </View>
              <Text style={styles.skyAlignmentInstruction}>{t('home.alignment.instruction')}</Text>
              <Text style={styles.skyAlignmentBody}>{t('home.alignment.body')}</Text>
              <View style={styles.skyAlignmentCta}>
                <Text style={styles.skyAlignmentCtaText}>{t('home.alignment.cta')}</Text>
                <Ionicons name="arrow-forward" size={17} color={colors.gold} />
              </View>
            </LinearGradient>
          </Pressable>

        {/* A biblioteca inteira mora numa rota própria. Esta é a segunda
            ação da abertura: curta, permanente e sem montar dezenas de cards
            dentro da Home. */}
        <View style={styles.exploreGate}>
          <Pressable
            testID="home-explore-toggle"
            style={({ pressed }) => [styles.exploreToggle, pressed && styles.firstPathPressed]}
            onPress={() => navigation.navigate(ROUTES.EXPLORE)}
            accessibilityRole="button"
            accessibilityLabel={`${t('home.explore.open')}. ${t('home.explore.hint')}`}
          >
            <View style={styles.exploreToggleIcon}>
              <Ionicons name="compass-outline" size={20} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.exploreToggleTitle}>{t('home.explore.open')}</Text>
              <Text style={styles.exploreToggleHint}>{t('home.explore.hint')}</Text>
            </View>
            <Ionicons name="arrow-forward" size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {/* Diário Cósmico — faixa inteira sempre visível no topo (pedido
            explícito: não ficar escondido junto dos outros cards do grid). */}
        {journalCount > 0 && (
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate(ROUTES.DIARY)} style={styles.diaryBar}>
          <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.diaryBarInner}>
            <View style={styles.diaryBarIcon}>
              <Ionicons name="book" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.diaryBarTitle}>{t('home.card.diary.title')}</Text>
              <Text style={styles.diaryBarSubtitle}>{t('home.card.diary.subtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
        )}

        {/* Sequência da semana (lib/streak.js) — leva pros Relatórios (calendário
            de sequência completo) ao tocar. */}
        {(journalCount > 0 || streakInfo.totalActiveDays > 0) && (
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.streakCard}
          onPress={() => navigation.navigate(ROUTES.REPORTS)}
        >
          <View style={styles.streakCardHead}>
            <View style={styles.streakCardTitleRow}>
              <Text style={styles.streakCardTitle}>
                {streakInfo.currentStreak > 0
                  ? t(streakInfo.currentStreak === 1 ? 'home.streak.count_one' : 'home.streak.count_other', { count: streakInfo.currentStreak })
                  : t('home.streak.empty')}
              </Text>
              {shieldCount > 0 && (
                <View style={styles.shieldBadge}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.teal} />
                  <Text style={styles.shieldBadgeText}>{shieldCount}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
          <View style={styles.weekRow}>
            {(weekActivity.length ? weekActivity : WEEK_LABELS.map((_, i) => ({ date: String(i), active: false, isToday: false }))).map((day, i) => (
              <View key={day.date} style={styles.weekDayWrap}>
                <Text style={styles.weekDayLabel}>{WEEK_LABELS[i]}</Text>
                <View style={[styles.weekDot, day.active && styles.weekDotActive, day.isToday && styles.weekDotToday]} />
              </View>
            ))}
          </View>
        </TouchableOpacity>
        )}

        {/* Opt-in de notificação no momento certo: só depois da 1ª atividade
            real, uma vez só (ver components/NotifPromptCard.js). */}
        {/* O card traz marginHorizontal 16 interno; o wrapper soma 4 pra bater
            no gutter 20 da reforma sem tocar no componente. */}
        <View style={styles.gutterWrap}>
          <NotifPromptCard sign={sign} hasActivity={streakInfo.totalActiveDays > 0} />
        </View>

        {/* Meta da semana (já existe dentro de Agir, só ganhou visibilidade
            aqui) — só pra casal com acesso à feature. */}
        {isCouple && (isOwnerAccount || hasCoupleAccess) && agirGoal && (
          <TouchableOpacity activeOpacity={0.9} style={styles.goalCard} onPress={() => navigation.navigate(ROUTES.AGIR)}>
            <View style={styles.goalIcon}>
              <Ionicons name={agirGoal.goalDone ? 'checkmark-circle' : 'flag'} size={20} color={agirGoal.goalDone ? colors.green : colors.amber} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.goalLabel}>{t('home.goal.label')}</Text>
              {agirGoal.goalSaved ? (
                <Text style={styles.goalText} numberOfLines={2}>
                  {agirGoal.goalDone ? t('home.goal.done') : ''}{agirGoal.goalSaved}
                </Text>
              ) : (
                <Text style={styles.goalTextEmpty}>{t('home.goal.empty')}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Pensamento cósmico do dia — a LEITURA DO DIA (pedido do dono,
            26/07/2026): um insight por dia pra pessoa abrir todo dia, tipo
            devocional. Recolhido por padrão (2 linhas + "ler completo");
            expandir marca como lida hoje (AsyncStorage) e conta o dia ativo
            na sequência — ver markThoughtReadToday acima. */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.thoughtCard, !thoughtReadToday && styles.thoughtCardUnread]}
          onPress={() => {
            if (!thoughtExpanded) markThoughtReadToday();
            setThoughtExpanded(!thoughtExpanded);
          }}
        >
          <View style={styles.thoughtIcon}>
            <Ionicons name="sparkles" size={18} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.thoughtHead}>
              <Text style={styles.thoughtLabel}>{t('home.thought.label')}</Text>
              <Text style={thoughtReadToday ? styles.thoughtReadBadge : styles.thoughtUnreadBadge}>
                {thoughtReadToday ? t('home.thought.readToday') : t('home.thought.unread')}
              </Text>
            </View>
            <Text style={styles.thoughtDate}>{dateStr}</Text>
            <Text style={styles.thoughtText} numberOfLines={thoughtExpanded ? undefined : 2}>
              {todaysThought}
            </Text>
            <Text style={styles.thoughtToggle}>
              {thoughtExpanded ? t('home.thought.collapse') : t('home.thought.expand')}
            </Text>
            {/* Compartilhar o PENSAMENTO como card (04/08/2026) — mesmo motor
                da Frase do Amor, com o fundo SOLO do dia. O botão fica dentro
                do card existente (regra do dono: nada de card novo na Home) e
                para a propagação pra não disparar o expandir/recolher. */}
            {thoughtExpanded && (
              <TouchableOpacity
                style={styles.thoughtShareBtn}
                activeOpacity={0.8}
                accessibilityRole="button"
                onPress={async (e) => {
                  e.stopPropagation && e.stopPropagation();
                  const via = await compartilharFraseComoCard({ frase: todaysThought, tipo: 'solo' });
                  if (via === 'compartilhado' || via === 'baixado') return;
                  if (via === 'cancelado') return;
                  try {
                    await Share.share({ message: `${todaysThought}\n\n✦ https://cosmicguide.cloud` });
                  } catch {}
                }}
              >
                <Ionicons name="share-social" size={14} color={colors.gold} />
                <Text style={styles.thoughtShareTxt}>{t('home.thought.share')}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>

        {/* Missões de hoje (motor lib/missions.js) — na Home SÓ pra quem está
            solo: casal vê o MESMO card dentro de Agir (a tela de "fazer"),
            mas solo nunca chega lá (SoloTeaser na borda da rota, App.js) e
            ficaria sem o loop missão→token→Loja pedido pelo dono. */}
        {!isCouple && (
          <View style={{ marginHorizontal: 20, marginBottom: 14 }}>
            <DailyMissionsCard />
          </View>
        )}

        {/* A LINHA DE HOJE — encostada no card de MISSÕES, e não mais no card
            de Sequência. Duas razões que se somam:

            1. COLISÃO. Pra usuário solo (a maioria, e a única configuração em
               que DailyMissionsCard aparece na Home) a dobra passava a ter DUAS
               superfícies de "o que fazer hoje": esta linha lá em cima, texto
               cinza de 13 px, e o card "Missões de hoje" logo abaixo — card
               inteiro, checkboxes, contador, tokens, botão de bônus. A linha
               perdia a disputa por construção. Encostada no card ela deixa de
               competir e passa a ler como a quarta linha dele.
            2. SALTO DE LAYOUT. A linha nasce `null` e só é preenchida depois do
               import() dinâmico dos motores e do storage — ou seja, sempre
               DEPOIS da primeira pintura. Como ela aparece em quase toda
               abertura, era um pulo de ~28 pt empurrando o pensamento do dia e
               as missões pra baixo enquanto a pessoa já estava lendo. Aqui o
               salto acontece fora do campo de visão inicial.

            Continua sendo uma LINHA e não um card: sem fundo, sem borda, sem
            gradiente — cards novos na dobra de cima era exatamente o "fica
            perdido no meio" que o dono mandou tirar. Ver o bloco no topo do
            arquivo pra escolha entre trilha e ritual. */}
        {mostrarTodayLine && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.todayLine}
            onPress={() => {
              // Medição antes de navegar (fire-and-forget: track() é síncrona).
              // Era a única coisa nova na dobra sem evento nenhum — sem isto,
              // "manter, mover ou matar a linha" continua sendo opinião em vez
              // de número.
              funnel.todayLineTap(ehTrilha ? 'jornada' : 'ritual');
              navigation.navigate(ehTrilha ? ROUTES.JORNADA : ROUTES.RITUAIS);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${todayLineText} — ${todayLineCta}`}
            testID="home-today-line"
          >
            <Ionicons name={ehTrilha ? 'footsteps' : 'flame'} size={14} color={colors.teal} />
            {/* numberOfLines={1}: o nome da trilha e o título do ritual vêm dos
                motores e podem ser longos — a linha encolhe o texto com
                reticências em vez de virar duas ou três linhas e deixar de ser
                uma linha. */}
            <Text style={styles.todayLineText} numberOfLines={1}>
              {todayLineText}
            </Text>
            <Text style={styles.todayLineCta}>{todayLineCta}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}

        {/* Órbi continua acessível, mas depois do bloco de hoje. Assim ele não
            disputa a primeira dobra com o caminho dominante, o alinhamento e
            a porta de Explore. */}
        {!showFirstPath && (
          <Pressable
            testID="home-orbi-chat"
            style={({ pressed }) => [
              styles.orbiContinuity,
              orbiFocused && styles.keyboardFocus,
              pressed && styles.firstPathPressed,
            ]}
            onPress={() => {
              navigation.getParent()?.navigate(ROUTES.CHAT_TAB);
            }}
            onFocus={() => setOrbiFocused(true)}
            onBlur={() => setOrbiFocused(false)}
            accessibilityRole="button"
            accessibilityLabel={`${t('orbi.home.title')}. ${t('orbi.home.cta')}`}
          >
            <View style={styles.orbiContinuityVisual}>
              <OrbiGuide size={78} pose="pointing" testID="home-orbi-pointing" />
            </View>
            <View style={styles.orbiContinuityCopy}>
              <Text style={styles.orbiContinuityEyebrow}>{t('orbi.home.eyebrow')}</Text>
              <Text style={styles.orbiContinuityTitle}>{t('orbi.home.title')}</Text>
              <Text style={styles.orbiContinuityBody}>{t('orbi.home.body')}</Text>
              <View style={styles.orbiContinuityCta}>
                <Text style={styles.orbiContinuityCtaText}>{t('orbi.home.cta')}</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.gold} />
              </View>
            </View>
          </Pressable>
        )}

        {/* Som do céu — logo DEPOIS do Pensamento do dia e das Missões, de
            propósito: o uso que o card sugere é "deixa tocando enquanto você
            lê", e a leitura do dia acabou de acontecer dois blocos acima.
            Devolve null sozinho onde a Web Audio API não existe. */}
        <CosmicSoundPlayer variant="inline" style={{ marginHorizontal: 20, marginBottom: 14 }} />

        {/* Retrospectiva Cósmica do mês anterior — rito de virada de mês,
            só nos dias 1-7 e só quando houve uso real (ver lib/monthlyWrapped). */}
        {wrappedReady && (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.wrappedBar}
            onPress={() => navigation.navigate(ROUTES.MONTHLY_WRAPPED)}
          >
            <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.wrappedBarInner}>
              <Text style={styles.wrappedBarEmoji}>🔮</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wrappedBarTitle}>{t('home.wrapped.title')}</Text>
                <Text style={styles.wrappedBarSubtitle}>{t('home.wrapped.subtitle')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#2A1D00" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ZONA DO CÉU [AUTO-DECISION: onda 1 REMOVIDA] — no lugar da colina,
            a seção inteira ganha CHÃO: daqui até o fim do card de próximos
            dias é uma faixa 'claro' arredondada (BandaSection). O corte que a
            onda 1 fazia agora é a borda de cima da própria zona — manter as
            duas seria dupla-borda. Hero e grupo do dia (diário, sequência,
            pensamento, missões, linha de hoje, som, retrospectiva) ficam no
            céu escuro de propósito: a abertura respira no cenário, e a
            PRIMEIRA mudança de chão coincide com a primeira virada de assunto
            ("o seu hoje" → "o céu sobre você"). */}
        {temZonaCeu && (
          <BandaSection tom="claro">

            {/* As "Temporadas do Céu" saíram da Home em 31/07/2026 — decisão do
                dono, olhando a tela em produção: "fica perdido no meio". Ele está
                certo, e o motivo é de hierarquia: era um card de LEITURA (conteúdo
                calculado) espremido entre dois cards de OFERTA (a Espiada de
                Amanhã com cadeado e o convite do Céu de Hoje), então o olho pulava.
                O MOTOR não foi apagado: lib/celestialSeasons.js continua inteiro e
                testado, e o mesmo conteúdo tem casa melhor no Calendário Cósmico
                (lib/calendarioCosmico.js), onde temporada zodiacal, retrógrado e
                lua chegando aparecem em ordem de data em vez de soltos. */}

            {/* A "Espiada de Amanhã" saiu da Home em 31/07/2026 — decisão do dono,
                olhando a tela em produção. E o print mostrava por quê: o trecho
                borrado cortava em `slice(0, 70)`, no meio de uma frase técnica
                ("A Lua está em Peixes. A luz…"), então o cadeado guardava um dado
                morno em vez de uma curiosidade. Um teaser que corta no lugar
                errado não vende — só ocupa a dobra e empurra pra baixo o conteúdo
                que a pessoa veio ler.
                O motor NÃO foi apagado: getThoughtForDate() em lib/dailyThought.js
                calcula qualquer data e continua inteiro. Se a espiada voltar, volta
                com corte em ponto de curiosidade, não em contagem de caracteres. */}

            {/* Céu de hoje pra você — trânsitos reais sobre o mapa natal (ver
                lib/personalSky.js). Sem nascimento salvo, vira convite pro Mapa
                Astral; o aspecto mais forte é grátis, o resto pede assinatura. */}
            {personalSky === null && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.skyCard}
                onPress={() => navigation.navigate(ROUTES.BIRTH_CHART)}
              >
                <View style={styles.peekHead}>
                  <Ionicons name="telescope" size={16} color={colors.teal} />
                  <Text style={[styles.peekLabel, { color: colors.teal }]}>{t('home.sky.label')}</Text>
                </View>
                <Text style={styles.peekText}>{t('home.sky.inviteText')}</Text>
                <Text style={styles.skyInviteLink}>{t('home.sky.inviteCta')}</Text>
              </TouchableOpacity>
            )}
            {Array.isArray(personalSky) && personalSky.length > 0 && (
              <View style={styles.skyCard}>
                <View style={styles.peekHead}>
                  <Ionicons name="telescope" size={16} color={colors.teal} />
                  <Text style={[styles.peekLabel, { color: colors.teal }]}>{t('home.sky.label')}</Text>
                </View>
                {(hasAccess || isOwnerAccount ? personalSkyBlocos : personalSkyBlocos.slice(0, 1)).map((b, i) => {
                  // A fase vem do MESMO índice (fasesDoCeuPessoal preserva ordem e
                  // tamanho) e já veio casada em `personalSkyBlocos`. Sem ela — sem
                  // efeméride, ou trânsito parado demais pra ter direção — some a
                  // linha, nunca se inventa um verbo.
                  const { aspecto, fase } = b;
                  // A MINIATURA DO PLANETA EM TRÂNSITO (08/08/2026, última rodada
                  // de arte): `transitPlanet` é a chave PT do motor (lib/
                  // personalSky.js) e casa direto com o registro. Os textos moram
                  // numa variável ÚNICA usada nos dois ramos — a ordem quente →
                  // ficha → fase é uma só no fonte, que é o que
                  // test/quentePrimeiroNasTelas.test.js mede.
                  const artePlaneta = planetaImagem(aspecto.transitPlanet);
                  const conteudo = (
                    <>
                      {/* A ABERTURA: vida real, primeiro. Ver personalSkyBlocos. */}
                      {b.chamada ? <Text style={styles.skyChamada}>{b.chamada}</Text> : null}
                      {/* A FICHA: qual planeta, sobre qual ponto do mapa. Só encolhe
                          quando existe abertura em cima — sem chamada, esta linha É
                          a leitura e continua no corpo de sempre. */}
                      <Text style={b.temChamada ? styles.skyFicha : styles.peekText}>{aspecto.text}</Text>
                      {/* `linhaCurta` é o nome do campo em lib/transitoFase.js —
                          escrevi `fase.texto` aqui em 01/08 e, como undefined é
                          falsy, a linha sumia calada em vez de quebrar. */}
                      {fase && fase.linhaCurta ? <Text style={styles.skyFaseText}>{fase.linhaCurta}</Text> : null}
                    </>
                  );
                  return (
                    <View key={i} style={i > 0 ? { marginTop: 12 } : null}>
                      {artePlaneta ? (
                        // Planeta pintado à esquerda, textos à direita. Sem asset
                        // (registro incompleto, chave nova no motor) → o bloco de
                        // sempre, sem wrapper de linha. accessible={false}: o nome
                        // do planeta já está escrito em aspecto.text.
                        <View style={styles.skyTransitoRow}>
                          <Image source={artePlaneta} style={styles.skyPlanetaMini} resizeMode="cover" accessible={false} />
                          <View style={styles.skyTransitoTextos}>{conteudo}</View>
                        </View>
                      ) : (
                        conteudo
                      )}
                    </View>
                  );
                })}
                {!hasAccess && !isOwnerAccount && personalSky.length > 1 && (
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.peekBtn}
                    onPress={() => navigation.navigate(ROUTES.PLANOS)}
                  >
                    <Ionicons name="lock-closed" size={13} color={colors.teal} />
                    <Text style={[styles.peekBtnText, { color: colors.teal }]}>
                      {t('home.sky.moreAspects', { count: personalSky.length - 1 })}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* O CÉU NOS PRÓXIMOS DIAS — countdown REAL do próximo evento do
                Calendário Cósmico ("Faltam 2 dias · Lua Cheia"). O card é VITRINE,
                não ficha: diz só O QUE acontece e QUANDO — os dois são dado medido
                do motor —; parágrafo, fonte e século moram na tela do Calendário,
                que é pra onde o CTA leva. Nenhum selo de "impacto" ou afim:
                impacto não é efeméride, e o que não é medido não entra.
                POSIÇÃO: colado no Céu de Hoje de propósito — o hoje em cima, os
                próximos dias logo abaixo, uma narrativa só de céu — e ABAIXO da
                primeira dobra (hero, diário, sequência, pensamento e missões
                intocados), porque card novo na dobra de cima é exatamente o "fica
                perdido no meio" que o dono mandou tirar em 31/07. Quando o motor
                devolve null (sem efeméride, sem evento pela frente), o card NEM
                MONTA — sem estado vazio, sem estado de erro. */}
            {Array.isArray(proximosCeu) && proximosCeu.length > 0 && (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.proximosCard}
                onPress={() => navigation.navigate(ROUTES.CALENDARIO_COSMICO)}
                testID="home-proximos-eventos"
              >
                <LinearGradient colors={gradients.card} style={styles.proximosInner}>
                  <View style={styles.peekHead}>
                    <Ionicons name="calendar" size={16} color={colors.gold} />
                    <Text style={[styles.peekLabel, { color: colors.gold }]}>{t('home.eventos.label')}</Text>
                  </View>
                  {/* O mais próximo em destaque: a contagem abre (é o quente) e o
                      título do evento vem em corpo grande logo abaixo. */}
                  <Text style={styles.proximosQuando}>{rotuloFaltamDias(proximosCeu[0].faltamDias)}</Text>
                  {/* [AUTO-DECISION] A miniatura só no DESTAQUE: os 1-2 itens
                      menores são linha única de 13px — um planeta de 24px ali
                      brigaria com o destaque e quebraria o alinhamento da lista.
                      Eles ficam com o emoji do motor, que já conta a história. */}
                  {arteProximoDestaque ? (
                    <View style={styles.proximosDestaqueRow}>
                      <Image
                        source={arteProximoDestaque}
                        style={styles.proximosPlanetaMini}
                        resizeMode="cover"
                        accessible={false}
                      />
                      <Text style={[styles.proximosTitulo, styles.proximosTituloNaLinha]} numberOfLines={2}>
                        {proximosCeu[0].emoji} {proximosCeu[0].titulo}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.proximosTitulo} numberOfLines={2}>
                      {proximosCeu[0].emoji} {proximosCeu[0].titulo}
                    </Text>
                  )}
                  {/* Os 1-2 seguintes, menores — o suficiente pra dizer que o mês
                      continua, sem competir com o destaque. Chave por índice: a
                      lista é recomputada inteira a cada foco, nunca reordenada in
                      loco, e tipo+dia não são únicos (dois aspectos exatos podem
                      cair no mesmo dia). */}
                  {proximosCeu.slice(1).map((ev, i) => (
                    <Text key={i} style={styles.proximosItem} numberOfLines={1}>
                      {rotuloFaltamDias(ev.faltamDias)} · {ev.emoji} {ev.titulo}
                    </Text>
                  ))}
                  <Text style={styles.proximosCta}>{t('home.eventos.cta')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </BandaSection>
        )}

        {/* ZONA DO AMOR [AUTO-DECISION: onda 2 REMOVIDA] — o grupo do
            AMOR/CASAL (frase do dia + cartão de compatibilidade) ganha chão
            próprio 'rosa': o mesmo degrau do claro puxado um fio pro rosa
            (#2A1840 — MUITO sutil, vizinho de tom; o gradiente da frase já
            grita sozinho), porque rosa é a cor da família amor no app
            inteiro. Entre duas zonas o céu escuro aparece no vão das margens
            — o ritmo escuro→claro→escuro→rosa é a própria diagramação do
            concorrente, sem precisar de colina entre duas bordas
            arredondadas. */}
        <BandaSection tom="rosa">

          {/* Frase do dia de amor — feita pra compartilhar de verdade com o
              par, não só ler (ver handleShareLovePhrase acima). */}
          <View style={styles.lovePhraseCard}>
            {/* A FAIXA MOSTRA O QUE O COMPARTILHAR ENVIA (09/08/2026, relato do
                dono: "aparece a imagem nova mas compartilha a antiga"): o fundo
                exibido é o MESMO fundo do dia que compartilharFraseComoCard
                desenha (fonte única: fundoDoDia em lib/shareCard.js, tipo
                'casal' — o mesmo hard-coded do handleShareLovePhrase). Só cai
                na cena do pack quando o servidor não respondeu. */}
            {/* AUDITORIA 09/08/2026: duas camadas, não um source trocado — o
                fundo remoto demora a baixar (3G) e pode falhar (404/rotação no
                servidor); trocando o source, a faixa ficava em BRANCO nesses
                dois casos. Agora a cena local fica SEMPRE por baixo e o fundo
                do dia pinta por cima quando (e se) carregar; onError volta pro
                local em vez de faixa vazia permanente. */}
            <View style={styles.lovePhraseArte}>
              <Image source={CENAS.amor} style={styles.lovePhraseArteCamada} resizeMode="cover" accessible={false} />
              {!!fundoFraseDoDia && (
                <Image
                  source={{ uri: fundoFraseDoDia }}
                  style={styles.lovePhraseArteCamada}
                  resizeMode="cover"
                  accessible={false}
                  onError={() => setFundoFraseDoDia(null)}
                />
              )}
            </View>
            <LinearGradient colors={['#FF6BA0', '#B57BFF']} style={styles.lovePhraseInner}>
              <View style={styles.lovePhraseHead}>
                <Ionicons name="heart" size={18} color="#fff" />
                <Text style={styles.lovePhraseLabel}>{t('home.lovePhrase.label')}</Text>
              </View>
              <Text style={styles.lovePhraseText}>{todaysLovePhrase}</Text>
              <TouchableOpacity activeOpacity={0.85} style={styles.lovePhraseBtn} onPress={handleShareLovePhrase}>
                <Ionicons name="share-social" size={16} color={colors.accent} />
                {/* O card aparece pros dois perfis, então o rótulo muda com quem
                    está olhando: "meu amor" só existe quando há par cadastrado.
                    Chamar de "Compartilhar" nomeava o mecanismo do botão, não o
                    que a pessoa quer fazer com ele. */}
                <Text style={styles.lovePhraseBtnText}>
                  {t(isCouple ? 'home.lovePhrase.share' : 'home.lovePhrase.shareSolo')}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {/* Compatibilidade do casal (sinastria real, lib/signs.js) */}
          {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — abaixo dos dois nomes
              vinha "{aspecto} · {categoria}" (ex.: "trígono · harmônico"), e só
              depois o resumo em língua de gente. É o mesmo movimento que
              screens/CompatibilityScreen.js fez em 31/07: o par de termos não
              some, desce e vira recibo do que acabou de ser lido. Os dois signos
              continuam no topo porque são a identificação do cartão — quem está
              olhando é quem digitou aqueles nomes.
              test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
          {compat ? (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.horoCard}
              onPress={() => navigation.navigate(ROUTES.COMPATIBILITY)}
            >
              <LinearGradient colors={gradients.card} style={styles.horoInner}>
                <View style={styles.horoHead}>
                  {/* Os DOIS mascotes do par no chip (09/08/2026) — com arte, o
                      casal vira personagens sobrepostos; sem, os emojis de
                      sempre. Mesmo contrato de fallback do resto do pack. */}
                  {mascoteDoSigno(coupleData.sa) && mascoteDoSigno(coupleData.sb) ? (
                    <View style={styles.parMascotes}>
                      <Image source={mascoteDoSigno(coupleData.sa)} style={styles.parMascote} resizeMode="cover" accessible={false} />
                      <Image source={mascoteDoSigno(coupleData.sb)} style={[styles.parMascote, styles.parMascoteB]} resizeMode="cover" accessible={false} />
                    </View>
                  ) : (
                    <View style={[styles.signChip, { backgroundColor: sign.color + '33' }]}>
                      <Text style={[styles.signChipGlyph, { color: sign.color }]}>{compat.emojiA}{compat.emojiB}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.horoSign}>{coupleData.sa} + {coupleData.sb}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
                {/* `resumo`, não `texto`: a leitura inteira agora tem quatro
                    frases (elemento, qualidades, modalidade, o que a fonte diz) e
                    não cabe num cartão de Home. O resumo é uma linha e diz a
                    mesma coisa sem prometer nada a mais. */}
                <Text style={styles.horoText}>{compat.resumo}</Text>
                <Text style={[styles.horoDates, styles.horoDatesRecibo]}>
                  {t('home.compatAspect', {
                    aspecto: t(CHAVES_DE_TRADUCAO.aspecto[compat.familia]),
                    categoria: t(CHAVES_DE_TRADUCAO.categoria[compat.categoriaId]),
                  })}
                </Text>
                <Text style={styles.horoLink}>{t('home.compatSeeMore')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.horoCard}
              onPress={() => navigation.navigate(ROUTES.QUIZ)}
            >
              <LinearGradient colors={gradients.card} style={styles.horoInner}>
                <View style={styles.horoHead}>
                  <View style={[styles.signChip, { backgroundColor: colors.accent + '33' }]}>
                    <Ionicons name="heart-outline" size={22} color={colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.horoSign}>{t('home.compatTitleEmpty')}</Text>
                    <Text style={styles.horoDates}>{t('home.compatSubtitleEmpty')}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
                <Text style={styles.horoText}>{t('home.compatTextEmpty')}</Text>
                <Text style={styles.horoLink}>{t('home.compatLinkEmpty')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

        </BandaSection>

        {/* A única onda preservada separa o conteúdo pessoal do epílogo sobre
            o céu de hoje. O catálogo completo saiu deste rolo e vive na rota
            Explore, acessível pela porta permanente no topo. */}
        <WaveDivider />

        {/* Cosmic event */}
        {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — o cartão abria com
            "Marte em quadratura com Saturno" e só embaixo dizia, em língua de
            gente, que dois planetas estão conversando no céu de hoje. O texto
            quente já existia e já estava escrito certo (home.cosmicEventDesc):
            era a ORDEM da tela que punha o nome técnico na frente dele. A
            descrição sobe, o título com os dois planetas e o ângulo desce e vira
            recibo, junto da data. Nenhuma palavra mudou — nem aqui, nem no
            dicionário. test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
        <Text style={[styles.sectionTitle, styles.sectionTitleAposOnda]}>{t('home.sectionCosmicEvent')}</Text>
        {/* DE-BOX (Onda Cenográfica, 08/08/2026): este bloco é informativo e
            NÃO clicável — no concorrente premium só o clicável é caixa. O
            gradiente '#2A1D52'→'#3A1F6B' e a borda saíram (ver eventCard/
            eventInner nos styles); ícone, textos e a ordem quente→recibo→data
            ficam exatamente como estavam. */}
        <View style={styles.eventCard}>
          <View style={styles.eventInner}>
            <View style={styles.eventIcon}>
              <Ionicons name="star" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventDesc}>
                {cosmicEvent
                  ? t('home.cosmicEventDesc', { orb: cosmicEvent.orb.toFixed(1) })
                  : t('home.cosmicEventDescEmpty')}
              </Text>
              <Text style={styles.eventTitle}>
                {cosmicEvent
                  ? t('home.cosmicEventTitle', { planetA: cosmicEvent.planetA, aspect: cosmicEvent.aspectType.toLowerCase(), planetB: cosmicEvent.planetB })
                  : t('home.cosmicEventTitleEmpty')}
              </Text>
              <Text style={styles.eventDate}>{t('home.cosmicEventDate', { date: dateStr })}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // Tipografia display da primeira dobra — aplicada por Text aninhado no
  // greeting do HeroSection (ver o comentário no JSX). Cor explícita porque a
  // herança de estilo em Text aninhado no RN Web nem sempre carrega a do pai.
  greetingDisplay: { color: '#fff', fontSize: 29, fontWeight: '800', lineHeight: 34 },
  // O MASCOTE NO HERO (08/08/2026) — wrapper relativo só pra ancorar o avatar
  // absoluto sobre o canto direito da saudação (ver o comentário no JSX).
  // Redondo de verdade (borderRadius = metade), borda sutil na cor do signo
  // (sign.color + '88' entra inline), overflow hidden pro JPG respeitar o
  // círculo. right 12 < gutter 20 de propósito: o mascote é maior que o badge
  // de 44 que ele cobre, e o excedente cresce pra fora, mantendo os centros
  // próximos.
  heroWrap: { position: 'relative' },
  heroMascoteWrap: {
    position: 'absolute', right: 12, width: 72, height: 72, borderRadius: 36,
    borderWidth: 1.5, overflow: 'hidden',
  },
  heroMascoteImg: { width: '100%', height: '100%' },
  hiddenSoundRegistrar: { display: 'none' },
  forYouWrap: { marginHorizontal: 20, marginTop: 4, marginBottom: 20 },
  forYouEyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 9 },
  forYouPrimary: {
    minHeight: 92, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold + '70',
    borderRadius: 18, paddingHorizontal: 16, paddingVertical: 15,
  },
  forYouIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold + '18' },
  forYouCopy: { flex: 1 },
  forYouTitle: { color: colors.text, fontSize: 16, lineHeight: 21, fontWeight: '800' },
  forYouBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 3 },
  skyAlignmentCard: {
    marginHorizontal: 20,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 24,
    borderCurve: 'continuous',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gold + '55',
    backgroundColor: colors.surface,
  },
  skyAlignmentInner: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 19, overflow: 'hidden' },
  skyAlignmentTop: { minHeight: 72, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  skyAlignmentTitle: {
    flex: 1,
    color: colors.text,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia', default: 'serif' }),
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '700',
    letterSpacing: -0.45,
    paddingTop: 5,
  },
  skyAlignmentVisual: { width: 94, height: 72, position: 'relative' },
  skyAlignmentNatalDisc: {
    position: 'absolute', left: 0, bottom: 0, width: 62, height: 62, borderRadius: 31,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.gold + 'AA',
    backgroundColor: '#211623',
  },
  skyAlignmentCurrentDisc: {
    position: 'absolute', right: 0, top: 0, width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.purple + 'AA',
    backgroundColor: '#3A2940',
  },
  skyAlignmentAxis: {
    position: 'absolute', left: 45, top: 35, width: 5, height: 5, borderRadius: 3,
    backgroundColor: colors.gold,
  },
  skyAlignmentInstruction: { color: colors.text, fontSize: 16, lineHeight: 22, fontWeight: '800', marginTop: 8, maxWidth: 330 },
  skyAlignmentBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 7, maxWidth: 340 },
  skyAlignmentCta: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 16 },
  skyAlignmentCtaText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  // Gutter 20 da reforma pra filhos que já trazem marginHorizontal 16 próprio
  // (NotifPromptCard, linhas do CardGrid): 4 + 16 = 20, sem tocar nos
  // componentes.
  gutterWrap: { paddingHorizontal: 4 },
  exploreGate: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  exploreToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 16, paddingVertical: 15,
    borderWidth: 1, borderColor: colors.border,
  },
  exploreToggleIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold + '16' },
  exploreToggleTitle: { color: colors.text, fontSize: 14, fontWeight: '800' },
  exploreToggleHint: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  firstPathCard: {
    marginHorizontal: 20,
    marginTop: 2,
    marginBottom: 28,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold + '70',
  },
  firstPathPressed: { opacity: 0.9, transform: [{ scale: 0.985 }] },
  keyboardFocus: Platform.select({
    web: {
      outlineStyle: 'solid',
      outlineWidth: 3,
      outlineColor: colors.gold,
      outlineOffset: 3,
    },
    default: {},
  }),
  firstPathInner: { paddingHorizontal: 22, paddingVertical: 24 },
  firstPathIcon: {
    width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)', marginBottom: 14,
  },
  firstPathEyebrow: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  firstPathTitle: { color: colors.text, fontSize: 25, lineHeight: 30, fontWeight: '800', letterSpacing: -0.4, marginTop: 8 },
  firstPathBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 9, maxWidth: 330 },
  firstPathCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 22 },
  firstPathCtaText: { color: colors.text, fontSize: 14, fontWeight: '800' },
  firstPathArrow: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  firstPathHonesty: { color: 'rgba(255,255,255,0.72)', fontSize: 10, lineHeight: 14, marginTop: 14 },
  orbiContinuity: {
    minHeight: 138,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 18,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 22,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold + '30',
    overflow: 'hidden',
  },
  orbiContinuityVisual: {
    width: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbiContinuityCopy: { flex: 1, paddingLeft: 4, paddingRight: 2 },
  orbiContinuityEyebrow: { color: colors.gold, fontSize: 9, fontWeight: '800', letterSpacing: 1.05, textTransform: 'uppercase' },
  orbiContinuityTitle: { color: colors.text, fontSize: 18, lineHeight: 23, fontWeight: '800', letterSpacing: -0.2, marginTop: 5 },
  orbiContinuityBody: { color: colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 4 },
  orbiContinuityCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  orbiContinuityCtaText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  // O Diário agora vem depois da continuidade do Órbi. A margem negativa do
  // hero antigo fazia os dois cartões se sobreporem em telas estreitas.
  diaryBar: { marginHorizontal: 20, marginTop: 14, marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  diaryBarInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  diaryBarIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  diaryBarTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  diaryBarSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  // O card de sequência começa depois do respiro fechado pelo Diário.
  streakCard: {
    marginHorizontal: 20, marginTop: 0, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
  },
  streakCardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakCardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  streakCardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  shieldBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.teal + '22', borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  shieldBadgeText: { color: colors.teal, fontSize: 12, fontWeight: '800' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  weekDayWrap: { alignItems: 'center', gap: 6 },
  weekDayLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  weekDot: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.surfaceElevated, borderWidth: 1.5, borderColor: colors.border,
  },
  weekDotActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  weekDotToday: { borderWidth: 2, borderColor: colors.gold },
  // A linha de hoje. Sem backgroundColor, sem borderWidth, sem borderRadius —
  // a lista de estilos é curta de propósito: o que a distingue de um card é
  // justamente não ter nada disso. O marginTop negativo encosta ela no card de
  // MISSÕES (que fecha com marginBottom: 14), pra as duas lerem como um bloco
  // só de "o que fazer hoje" em vez de duas superfícies disputando o mesmo
  // papel. Antes ela encostava no card de Sequência, que é o bloco errado.
  todayLine: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginTop: -6, marginBottom: 14, paddingVertical: 2,
  },
  todayLineText: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  todayLineCta: { color: colors.teal, fontSize: 13, fontWeight: '800' },
  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 20, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
  },
  goalIcon: {
    width: 36, height: 36, borderRadius: 11, backgroundColor: 'rgba(255,184,77,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  goalLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  goalText: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 3 },
  goalTextEmpty: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  thoughtCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: 20, marginTop: 0, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border,
  },
  thoughtIcon: {
    width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,200,92,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  // Borda dourada sutil só enquanto a leitura de hoje NÃO foi lida — chama o
  // olho pro hábito diário sem gritar; depois de lida volta à borda padrão.
  thoughtCardUnread: { borderColor: colors.gold + '66' },
  thoughtHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  // flexShrink: 1 é obrigatório aqui: Text em row no RN não encolhe por
  // padrão (flexShrink 0) e o label uppercase (~27 chars em ES) + badge não
  // cabem lado a lado em telas de 320pt — sem isso o badge sai da tela.
  thoughtLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 1 },
  thoughtUnreadBadge: { color: colors.gold, fontSize: 11, fontWeight: '800' },
  thoughtReadBadge: { color: colors.teal, fontSize: 11, fontWeight: '800' },
  thoughtDate: { color: colors.textMuted, fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  thoughtText: { color: colors.text, fontSize: 15, lineHeight: 24, marginTop: 4 },
  thoughtShareBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, alignSelf: 'flex-start' },
  thoughtShareTxt: { color: colors.gold, fontSize: 12, fontWeight: '600' },
  thoughtToggle: { color: colors.gold, fontSize: 12, fontWeight: '800', marginTop: 6 },
  lovePhraseCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  lovePhraseArte: { width: '100%', height: 96 },
  lovePhraseArteCamada: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  lovePhraseInner: { padding: 18 },
  lovePhraseHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  lovePhraseLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  lovePhraseText: { color: '#fff', fontSize: 15, lineHeight: 24, fontWeight: '600' },
  lovePhraseBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 12, paddingVertical: 10, marginTop: 14, alignSelf: 'flex-start', paddingHorizontal: 18,
  },
  lovePhraseBtnText: { color: colors.accent, fontSize: 13, fontWeight: '800' },
  // (peekCard saiu junto com a Espiada de Amanhã — a remoção das Temporadas do
  //  Céu já tinha escrito a regra: "estilo órfão é como este arquivo chegou a
  //  15 formatos de card". peekHead/peekLabel/peekText/peekBtn/peekBtnText
  //  FICAM: o card do Céu de Hoje ainda usa os cinco. As chaves home.peek.*
  //  saíram de lib/i18n.js na mesma passada. A decisão inteira continua
  //  preservada no comentário lá em cima, onde o card ficava.)
  skyCard: {
    marginHorizontal: 20, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 18,
    borderWidth: 1, borderColor: colors.teal + '55',
  },
  peekHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  peekLabel: { color: colors.purple, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  peekText: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  // A ABERTURA do céu de hoje: a chamada da fase, em corpo de leitura e na cor
  // do texto. É a primeira coisa que a pessoa lê no card — a lei do dono é
  // quente primeiro, ficha depois, e a hierarquia visual tem que contar isso
  // sem precisar de rótulo.
  skyChamada: { color: colors.text, fontSize: 15, lineHeight: 24, marginBottom: 6 },
  // A FICHA: qual planeta, sobre qual ponto do mapa. Recibo da abertura, então
  // menor e mais apagada que ela.
  skyFicha: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  // A direção do trânsito (chegando/indo embora) vem menor e em teal: é
  // qualificação da linha de cima, não uma segunda leitura.
  skyFaseText: { color: colors.teal, fontSize: 12, lineHeight: 17, marginTop: 2 },
  // A linha do trânsito com planeta pintado (08/08/2026, última rodada de
  // arte): imagem à esquerda, textos à direita. Só monta quando o registro
  // devolve asset — sem ele, o bloco de textos fica solto como sempre foi.
  skyTransitoRow: { flexDirection: 'row', alignItems: 'flex-start' },
  skyPlanetaMini: { width: 28, height: 28, borderRadius: 14, marginRight: 10, marginTop: 2 },
  skyTransitoTextos: { flex: 1 },
  peekBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  peekBtnText: { color: colors.purple, fontSize: 13, fontWeight: '800' },
  skyInviteLink: { color: colors.teal, fontSize: 13, fontWeight: '800', marginTop: 10 },
  // O céu nos próximos dias — mesmo DNA visual dos cards de gradiente da Home
  // (gradients.card + borda padrão, como o cartão do casal), nada de fundo
  // chapado novo. Hierarquia em três degraus: a contagem dourada abre, o
  // título do evento é o corpo de destaque, os eventos seguintes são linhas
  // de apoio e o CTA fecha como texto-link (a seta é do próprio texto — sem
  // Ionicons ao lado, mesma convenção do link do convite do Céu de Hoje).
  proximosCard: { marginHorizontal: 20, marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  proximosInner: { padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  proximosQuando: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  proximosTitulo: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 2 },
  // O destaque com planeta pintado (08/08/2026): linha imagem + título. O
  // respiro de cima sobe pra LINHA e sai do título (proximosTituloNaLinha
  // zera o marginTop pra não somar duas vezes); flex: 1 deixa o
  // numberOfLines={2} quebrar dentro da linha em vez de estourar o card.
  proximosDestaqueRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  proximosPlanetaMini: { width: 26, height: 26, borderRadius: 13, marginRight: 8 },
  proximosTituloNaLinha: { flex: 1, marginTop: 0 },
  proximosItem: { color: colors.textSecondary, fontSize: 13, marginTop: 8 },
  proximosCta: { color: colors.gold, fontSize: 13, fontWeight: '800', marginTop: 12 },
  wrappedBar: { marginHorizontal: 20, marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  wrappedBarInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  wrappedBarEmoji: { fontSize: 24 },
  wrappedBarTitle: { color: '#2A1D00', fontSize: 14, fontWeight: '800' },
  wrappedBarSubtitle: { color: 'rgba(42,29,0,0.75)', fontSize: 12, marginTop: 1 },
  // (os estilos season* saíram junto com o card das Temporadas do Céu —
  //  estilo órfão é como o arquivo chegou a 15 formatos de card diferentes)
  horoCard: { marginHorizontal: 20, marginTop: 0, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  horoInner: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  horoHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  signChip: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  // O par de mascotes sobrepostos do card de compatibilidade: o segundo entra
  // por cima com leve deslocamento, desenho clássico de "dupla".
  parMascotes: { flexDirection: 'row', marginRight: 12, width: 62, height: 40 },
  parMascote: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: colors.surface },
  parMascoteB: { marginLeft: -18 },
  signChipGlyph: { fontSize: 18 },
  horoSign: { color: colors.text, fontSize: 17, fontWeight: '800' },
  horoDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  // O mesmo rótulo, agora embaixo do resumo (a ficha desceu no cartão do
  // casal): só o respiro muda, o estilo continua sendo o de linha de apoio.
  horoDatesRecibo: { marginTop: 8 },
  horoText: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  horoLink: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 12, marginHorizontal: 20 },
  // Título de seção que abre uma virada que JÁ tem respiro próprio — o
  // "Explore" logo após o paddingTop da zona clara, e o epílogo logo após a
  // onda 4: chão e colina já são o respiro da virada, e os 28 de marginTop
  // somados a eles viravam um buraco — a zona (ou a onda) substitui o vão,
  // não soma com ele.
  sectionTitleAposOnda: { marginTop: 6 },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: -8, marginBottom: 12, marginHorizontal: 20 },
  // DE-BOX da Onda Cenográfica (08/08/2026): o Evento cósmico não navega pra
  // lugar nenhum — era a única caixa da Home sem toque. O gradiente e a borda
  // saíram e o bloco flutua sobre a colina da onda 4; o padding interno saiu
  // junto pro ícone alinhar no gutter 20 como os títulos de seção.
  eventCard: { marginHorizontal: 20 },
  eventInner: { flexDirection: 'row', alignItems: 'flex-start' },
  eventIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,200,92,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  // O título com os dois planetas e o ângulo virou recibo (a descrição subiu):
  // um degrau menor, apagado, com respiro em cima. Continua na tela inteiro.
  eventTitle: { color: colors.textMuted, fontSize: 13, fontWeight: '800', marginTop: 8 },
  eventDesc: { color: colors.text, fontSize: 15, lineHeight: 24 },
  eventDate: { color: colors.gold, fontSize: 12, fontWeight: '700', marginTop: 8 },

  milestoneBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 28 },
  milestoneCard: { width: '100%', maxWidth: 340, borderRadius: 24, padding: 32, alignItems: 'center' },
  milestoneEmoji: { fontSize: 56 },
  milestoneTitle: { color: '#2A1D00', fontSize: 22, fontWeight: '800', marginTop: 10, textAlign: 'center' },
  milestoneSubtitle: { color: '#4A3300', fontSize: 15, fontWeight: '700', marginTop: 6 },
  milestoneOfferBtn: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, marginTop: 20 },
  milestoneOfferText: { color: '#7A5A14', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  milestoneBtn: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28, marginTop: 22 },
  milestoneBtnText: { color: '#2A1D00', fontSize: 15, fontWeight: '800' },
});
