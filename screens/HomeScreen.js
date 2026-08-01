import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, zodiacSigns } from '../theme';
import { ROUTES } from '../routes';
import HeroSection from '../components/HeroSection';
import CardGrid from '../components/CardGrid';
import NotifPromptCard from '../components/NotifPromptCard';
import DailyMissionsCard from '../components/DailyMissionsCard';
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
import { personalSkyToday } from '../lib/personalSky';
import { getAnyBirthData } from '../lib/birthData';
import { computeMonthlyWrapped, getWrappedMonth, isWrappedAvailable } from '../lib/monthlyWrapped';
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

// Cards do grid que levam a uma LEITURA de verdade (as 9 individuais) — são
// eles que valem como "pediu a 1ª leitura" (reading_start). Os cards de casal
// (timeline/reconectar/descobrir/agir/progresso/retrospectiva) e o feed social
// não são leitura e ficam de fora de propósito: contá-los inflaria o degrau e
// esconderia que ninguém chegou a ler nada.
const READING_CARD_KEYS = new Set([
  'horoscope', 'birthchart', 'tarot', 'compatibility',
  'dream', 'lunarCalendar', 'palm', 'coffee', 'chat',
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
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getAnyBirthData().then((birth) => {
        if (!active) return;
        setPersonalSky(birth ? personalSkyToday(birth) : null);
      });
      return () => {
        active = false;
      };
    }, [])
  );

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
          const { TRILHAS, carregarJornada, podeConcluir } = await import('../lib/jornada');
          const estado = await carregarJornada();
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
            const forte = ritualMaisForteDeHoje(rituaisDeHoje(agoraMesmo).rituais, agoraMesmo);
            if (forte) escolha = { tipo: 'ritual', titulo: forte.titulo };
          } catch {}
        }

        if (vivo) setTodayLine(escolha);
      })();
      return () => {
        vivo = false;
      };
    }, [])
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

  // Sinastria por aspecto (lib/signs.js → lib/synastry.js) — null enquanto não
  // houver os dois signos salvos. O cartão mostrava "{pct}% de compatibilidade";
  // mostra o ASPECTO e a CATEGORIA, que é o que o app calcula de verdade.
  // A porcentagem saiu do app inteiro — ver o cabeçalho de lib/synastry.js.
  const compat = coupleData?.sa && coupleData?.sb ? compatibility(coupleData.sa, coupleData.sb, lang) : null;

  const greeting = isCouple
    ? t('home.greetingCouple', { voce: coupleData.voce, amor: coupleData.amor })
    // sign.pt e o nome PORTUGUES do signo — em ingles dava "Hi, Gemeos"
    // dois centimetros acima do pensamento do dia que dizia "Gemini".
    : t('home.greetingSolo', { sign: nomeDoSigno(sign.pt, lang) });

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
    { key: 'chat', title: t('home.card.chat.title'), subtitle: t('home.card.chat.subtitle'), icon: 'chatbubbles', gradient: ['#6C7BFF', '#5CE0D8'], onPress: () => navigation.getParent()?.navigate(ROUTES.CHAT_TAB) },
    { key: 'social', title: t('home.card.social.title'), subtitle: t('home.card.social.subtitle'), icon: 'people', gradient: ['#5CE0D8', '#7B3FB5'], onPress: () => navigation.navigate(ROUTES.SOCIAL) },
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
  ];
  // Diário Cósmico saiu do grid — vira uma faixa inteira fixa no topo (ver
  // abaixo, logo depois do HeroSection), sempre visível em vez de ser só
  // mais um card entre os outros.

  // Feed social é só pra quem usa o app sozinho (sem parceiro pareado) —
  // conteúdo de casal nunca aparece lá, então o card nem existe pra casal.
  const SOLO_ONLY = ['social'];

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

  // Separação visual pedida pelo Lenda (25/07/2026): desde que solo também
  // assina (as 9 leituras individuais), fica confuso misturar no mesmo grid
  // features que solo pode assinar direto com as 5 que exigem formar casal —
  // duas seções com título/subtítulo próprios em vez de um grid só.
  const COUPLE_SECTION_KEYS = [...COUPLE_ONLY, ...LOCKED_KEYS];
  const individualCardItems = cardItems.filter((c) => !COUPLE_SECTION_KEYS.includes(c.key));
  const coupleCardItems = cardItems.filter((c) => COUPLE_SECTION_KEYS.includes(c.key));

  // SUBDIVISÃO DO GRID INDIVIDUAL — mesma jogada que já tinha sido feita entre
  // individual e casal, agora dentro do individual.
  //
  // O grid foi de 12 pra 15 cards no mesmo bloco "Explore", sem subdivisão
  // nenhuma: oito fileiras de dois, chapadas. E as posições novas caíram na
  // metade de baixo — rituais em 10º e jornada em 11º de 15 —, justamente as
  // duas features de HÁBITO, as que precisam ser descobertas pra que a linha de
  // hoje um dia tenha o que mostrar. Quinze cards chapados é a definição do
  // problema que o dono apontou.
  //
  // Três grupos, por NATUREZA do que se faz ali: Leituras (o que o app conta
  // sobre você), Práticas (o que você faz com a mão) e Datas (o que o céu faz,
  // com dia e hora). Quem não cai em Práticas nem Datas fica em Leituras — o
  // grupo padrão —, então card novo nunca some do grid por esquecimento.
  // Curiosidades: a leva de 31/07 menos o roteador — mitos, quiz e papel de
  // parede são compartilhamento/curiosidade gratuitos, não leitura sobre a
  // pessoa nem coisa que se "assine e use sem limite". Sem este grupo os
  // quatro caíam todos em Leituras pelo grupo-padrão, inflando-o pra 13 cards
  // — a escala menor do mesmo problema que a subdivisão em grupos resolveu.
  const PRATICAS_KEYS = ['grounding', 'rituais', 'jornada'];
  const DATAS_KEYS = ['lunarCalendar', 'calendario', 'zodiacbody'];
  const CURIOSIDADES_KEYS = ['mitos', 'quizcosmico', 'wallpaper'];
  const praticasCardItems = individualCardItems.filter((c) => PRATICAS_KEYS.includes(c.key));
  const datasCardItems = individualCardItems.filter((c) => DATAS_KEYS.includes(c.key));
  const curiosidadesCardItems = individualCardItems.filter((c) => CURIOSIDADES_KEYS.includes(c.key));
  const leiturasCardItems = individualCardItems.filter(
    (c) => !PRATICAS_KEYS.includes(c.key) && !DATAS_KEYS.includes(c.key) && !CURIOSIDADES_KEYS.includes(c.key)
  );

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
    try {
      // O link vai junto de propósito: é ele que faz o WhatsApp/Telegram
      // mostrarem a prévia rica (OG tags em public/index.html) e traz quem
      // recebeu a frase pra dentro do app.
      const result = await Share.share({ message: `${todaysLovePhrase}\n\n💜 https://cosmicguide.cloud` });
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

  // A GUARDA DE IDIOMA, e ela é temporária de propósito.
  //
  // A moldura tem chave nos três idiomas, mas o MIOLO ({nome} da trilha, {titulo}
  // do ritual) vem de lib/jornada.js e lib/rituais.js, que ainda declaram
  // TODO(i18n) no cabeçalho para esses dois campos. Resultado sem guarda:
  // "Ritual de hoy: A carta que não se envia", "Trail 7 dias de Lua · day 3 of
  // 7" — e a frase em volta ("Ritual de hoy:") marca o miolo como nome próprio,
  // o que deixa o descasamento mais visível, não menos.
  //
  // O app já tem esse defeito no pensamento do dia e nas missões, então não é
  // regressão de classe; o que era novo é a POSIÇÃO — mistura de idioma abrindo
  // a dobra da primeira tela. Entre uma dobra sem linha e uma dobra bilíngue,
  // fica sem linha. A guarda cai sozinha no dia em que `nome` e `titulo`
  // virarem chave (segunda parcela dos dois TODO(i18n)).
  const mostrarTodayLine = !!todayLine && lang === 'pt';
  const todayLineText = !todayLine
    ? ''
    : ehTrilha
    ? t('home.today.jornada', { nome: todayLine.nome, dia: todayLine.dia, total: todayLine.total })
    : t('home.today.ritual', { titulo: todayLine.titulo });
  const todayLineCta = !todayLine ? '' : t(ehTrilha ? 'home.today.jornada.cta' : 'home.today.ritual.cta');

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
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
        <HeroSection
          greeting={greeting}
          dateStr={dateStr}
          sign={sign}
          streak={coupleData ? { count: streakInfo.currentStreak } : undefined}
          insetTop={insets.top}
        />

        {/* Diário Cósmico — faixa inteira sempre visível no topo (pedido
            explícito: não ficar escondido junto dos outros cards do grid). */}
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

        {/* Sequência da semana (lib/streak.js) — leva pros Relatórios (calendário
            de sequência completo) ao tocar. */}
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

        {/* Opt-in de notificação no momento certo: só depois da 1ª atividade
            real, uma vez só (ver components/NotifPromptCard.js). */}
        <NotifPromptCard sign={sign} hasActivity={streakInfo.totalActiveDays > 0} />

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
          </View>
        </TouchableOpacity>

        {/* Missões de hoje (motor lib/missions.js) — na Home SÓ pra quem está
            solo: casal vê o MESMO card dentro de Agir (a tela de "fazer"),
            mas solo nunca chega lá (SoloTeaser na borda da rota, App.js) e
            ficaria sem o loop missão→token→Loja pedido pelo dono. */}
        {!isCouple && (
          <View style={{ marginHorizontal: 16, marginBottom: 14 }}>
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

        {/* Som do céu — logo DEPOIS do Pensamento do dia e das Missões, de
            propósito: o uso que o card sugere é "deixa tocando enquanto você
            lê", e a leitura do dia acabou de acontecer dois blocos acima.
            Devolve null sozinho onde a Web Audio API não existe. */}
        <CosmicSoundPlayer variant="inline" style={{ marginHorizontal: 16, marginBottom: 14 }} />

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
            {(hasAccess || isOwnerAccount ? personalSky : personalSky.slice(0, 1)).map((a, i) => (
              <Text key={i} style={[styles.peekText, i > 0 && { marginTop: 8 }]}>
                {a.text}
              </Text>
            ))}
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

        {/* Frase do dia de amor — feita pra compartilhar de verdade com o
            par, não só ler (ver handleShareLovePhrase acima). */}
        <View style={styles.lovePhraseCard}>
          <LinearGradient colors={['#FF6BA0', '#B57BFF']} style={styles.lovePhraseInner}>
            <View style={styles.lovePhraseHead}>
              <Ionicons name="heart" size={18} color="#fff" />
              <Text style={styles.lovePhraseLabel}>{t('home.lovePhrase.label')}</Text>
            </View>
            <Text style={styles.lovePhraseText}>{todaysLovePhrase}</Text>
            <TouchableOpacity activeOpacity={0.85} style={styles.lovePhraseBtn} onPress={handleShareLovePhrase}>
              <Ionicons name="share-social" size={16} color={colors.accent} />
              <Text style={styles.lovePhraseBtnText}>{t('home.lovePhrase.share')}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Compatibilidade do casal (sinastria real, lib/signs.js) */}
        {compat ? (
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.horoCard}
            onPress={() => navigation.navigate(ROUTES.COMPATIBILITY)}
          >
            <LinearGradient colors={gradients.card} style={styles.horoInner}>
              <View style={styles.horoHead}>
                <View style={[styles.signChip, { backgroundColor: sign.color + '33' }]}>
                  <Text style={[styles.signChipGlyph, { color: sign.color }]}>{compat.emojiA}{compat.emojiB}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.horoSign}>{coupleData.sa} + {coupleData.sb}</Text>
                  <Text style={styles.horoDates}>
                    {t('home.compatAspect', {
                      aspecto: t(CHAVES_DE_TRADUCAO.aspecto[compat.familia]),
                      categoria: t(CHAVES_DE_TRADUCAO.categoria[compat.categoriaId]),
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              {/* `resumo`, não `texto`: a leitura inteira agora tem quatro
                  frases (elemento, qualidades, modalidade, o que a fonte diz) e
                  não cabe num cartão de Home. O resumo é uma linha e diz a
                  mesma coisa sem prometer nada a mais. */}
              <Text style={styles.horoText}>{compat.resumo}</Text>
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

        {/* Feature grid — individual (solo ou casal, assina direto), em quatro
            grupos: Leituras, Práticas, Datas e Curiosidades. Ver o porquê
            acima, onde as listas são montadas. */}
        <Text style={styles.sectionTitle}>{t('home.sectionExplore')}</Text>
        <Text style={styles.sectionSubtitle}>{t('home.sectionExploreSubtitle')}</Text>
        <CardGrid items={leiturasCardItems} />

        {praticasCardItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.sectionPraticas')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.sectionPraticasSubtitle')}</Text>
            <CardGrid items={praticasCardItems} />
          </>
        )}

        {datasCardItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.sectionDatas')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.sectionDatasSubtitle')}</Text>
            <CardGrid items={datasCardItems} />
          </>
        )}

        {curiosidadesCardItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.sectionCuriosidades')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.sectionCuriosidadesSubtitle')}</Text>
            <CardGrid items={curiosidadesCardItems} />
          </>
        )}

        {/* Feature grid — exclusivo de casal (só desbloqueia formando casal) */}
        {coupleCardItems.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>{t('home.sectionCouple')}</Text>
            <Text style={styles.sectionSubtitle}>{t('home.sectionCoupleSubtitle')}</Text>
            <CardGrid items={coupleCardItems} />
          </>
        )}

        {/* Cosmic event */}
        <Text style={styles.sectionTitle}>{t('home.sectionCosmicEvent')}</Text>
        <View style={styles.eventCard}>
          <LinearGradient colors={['#2A1D52', '#3A1F6B']} style={styles.eventInner}>
            <View style={styles.eventIcon}>
              <Ionicons name="star" size={22} color={colors.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eventTitle}>
                {cosmicEvent
                  ? t('home.cosmicEventTitle', { planetA: cosmicEvent.planetA, aspect: cosmicEvent.aspectType.toLowerCase(), planetB: cosmicEvent.planetB })
                  : t('home.cosmicEventTitleEmpty')}
              </Text>
              <Text style={styles.eventDesc}>
                {cosmicEvent
                  ? t('home.cosmicEventDesc', { orb: cosmicEvent.orb.toFixed(1) })
                  : t('home.cosmicEventDescEmpty')}
              </Text>
              <Text style={styles.eventDate}>{t('home.cosmicEventDate', { date: dateStr })}</Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  diaryBar: { marginHorizontal: 16, marginTop: -14, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  diaryBarInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  diaryBarIcon: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  diaryBarTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  diaryBarSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  streakCard: {
    marginHorizontal: 16, marginTop: -14, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
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
    marginHorizontal: 16, marginTop: -6, marginBottom: 14, paddingVertical: 2,
  },
  todayLineText: { color: colors.textSecondary, fontSize: 13, flex: 1 },
  todayLineCta: { color: colors.teal, fontSize: 13, fontWeight: '800' },
  goalCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
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
    marginHorizontal: 16, marginTop: 0, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
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
  thoughtText: { color: colors.text, fontSize: 14, lineHeight: 20, marginTop: 4 },
  thoughtToggle: { color: colors.gold, fontSize: 12, fontWeight: '800', marginTop: 6 },
  lovePhraseCard: { marginHorizontal: 16, marginBottom: 14, borderRadius: 18, overflow: 'hidden' },
  lovePhraseInner: { padding: 18 },
  lovePhraseHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  lovePhraseLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  lovePhraseText: { color: '#fff', fontSize: 15, lineHeight: 22, fontWeight: '600' },
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
    marginHorizontal: 16, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 16,
    borderWidth: 1, borderColor: colors.teal + '55',
  },
  peekHead: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 },
  peekLabel: { color: colors.purple, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  peekText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  peekBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  peekBtnText: { color: colors.purple, fontSize: 13, fontWeight: '800' },
  skyInviteLink: { color: colors.teal, fontSize: 13, fontWeight: '800', marginTop: 10 },
  wrappedBar: { marginHorizontal: 16, marginBottom: 14, borderRadius: 16, overflow: 'hidden' },
  wrappedBarInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  wrappedBarEmoji: { fontSize: 24 },
  wrappedBarTitle: { color: '#2A1D00', fontSize: 14, fontWeight: '800' },
  wrappedBarSubtitle: { color: 'rgba(42,29,0,0.75)', fontSize: 12, marginTop: 1 },
  // (os estilos season* saíram junto com o card das Temporadas do Céu —
  //  estilo órfão é como o arquivo chegou a 15 formatos de card diferentes)
  horoCard: { marginHorizontal: 16, marginTop: 0, borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  horoInner: { padding: 18, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  horoHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  signChip: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  signChipGlyph: { fontSize: 18 },
  horoSign: { color: colors.text, fontSize: 17, fontWeight: '800' },
  horoDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  horoText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  horoLink: { color: colors.accent, fontSize: 13, fontWeight: '700', marginTop: 12 },
  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 24, marginBottom: 12, marginHorizontal: 16 },
  sectionSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: -8, marginBottom: 12, marginHorizontal: 16 },
  eventCard: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  eventInner: { flexDirection: 'row', padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: 16, alignItems: 'flex-start' },
  eventIcon: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,200,92,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  eventTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  eventDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },
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
