// screens/CalendarioCosmicoScreen.js
// CALENDÁRIO CÓSMICO — o mês do céu numa grade, os dias que têm data marcada
// destacados, e embaixo o que é cada uma delas em português de conversa.
//
// ===========================================================================
// LEIA lib/calendarioCosmico.js ANTES DE MEXER AQUI.
// ===========================================================================
// Esta tela NÃO escreve conteúdo: ela consome o que o motor exporta. Todo
// título, parágrafo, fonte, bloco de tradição e aviso de idade nasce lá, sob
// as regras do cabeçalho de lá — nenhuma alegação de saúde nem por metáfora,
// nenhuma promessa de resultado, nenhuma instrução ao leitor, toda afirmação
// histórica com obra, autor e século. test/calendarioCosmico.test.js varre
// aquele vocabulário e derruba o build.
//
// O texto interno do motor está em português nos três idiomas — é o gap
// CONHECIDO e declarado no cabeçalho dele (mesma situação de lib/synastry.js).
// O que esta tela escreve (cabeçalho, navegação, rótulos, a temporada) está
// nas três línguas em lib/i18n.js, no bloco CALENDARIO_COSMICO_I18N do fim.
//
// ===========================================================================
// A FORMA DE CADA CARD: PRENDE PRIMEIRO, RECIBO DEPOIS — E DÁ PRA VER
// ===========================================================================
// O motor entrega o parágrafo com o marcador literal MARCA_RECIBO no meio
// ("Quem escreveu isso:"), e o teste dele exige que a primeira metade não
// tenha autor nem século e a segunda tenha os dois. A tela CORTA nesse
// marcador e desenha as duas metades com pesos diferentes: a conversa em
// corpo de leitura, o recibo menor e apagado logo abaixo. O contrato do texto
// vira contrato visual — quem inverter a ordem no motor vê a inversão na tela.
//
// ===========================================================================
// POR QUE lib/celestialSeasons.js NÃO É CONSUMIDO AQUI
// ===========================================================================
// As "Temporadas do Céu" saíram da Home em 31/07/2026 e esta tela é a casa
// certa delas (ver o comentário que ficou em screens/HomeScreen.js). A
// TEMPORADA aparece — é o primeiro bloco depois da grade. O que não entra é o
// texto de activeCelestialEvents(), e são três motivos medidos, não gosto:
//
//   1. FONTE DA DATA. currentZodiacSeason() lê as faixas FIXAS de zodiacSigns
//      (theme.js, '21 Mar - 19 Abr'). Este calendário calcula o ingresso por
//      bissecção sobre efeméride, até o minuto. Pôr os dois na mesma tela
//      significa, nos dias de fronteira, uma temporada em cima discordando do
//      ingresso listado logo abaixo — e tabela fixa de signo é exatamente o
//      pior bug da história do app (00-tese.md, proposição 1: 293 dias errados
//      em 29.585). Aqui a temporada sai do MESMO evento de ingresso que a
//      lista mostra, então as duas nunca podem divergir.
//   2. VOCABULÁRIO. O detalhe do item de retrógrado de lá manda "reconferir
//      antes de assinar qualquer coisa" (instrução de agenda ao leitor) e o da
//      Lua Nova fala em "tradição de plantar intenções" — que o próprio
//      avisoDeIdade da Lua Nova, no motor deste calendário, classifica como
//      prática popular contemporânea sem fonte antiga localizada. Importar
//      aquele texto seria a tela contradizendo o card que ela mesma desenha.
//   3. DUPLICATA. Retrógrado e próxima lua já são eventos desta lista, com
//      instante exato em vez de contagem de dias.
//
// O motor de lá continua inteiro e testado, para quando o banner voltar à
// Home. Ele só não é a fonte desta tela.
//
// ===========================================================================
// A DECISÃO DO PAYWALL, e ela é diferente das outras nove telas
// ===========================================================================
// O padrão do app é 1 uso grátis vitalício por feature (lib/featureUsage.js +
// OneTimeLock) e assinatura sem limite. Aqui a régua é outra:
//
//   · O MÊS QUE A PESSOA ESTÁ VIVENDO É SEMPRE ABERTO, sem contador.
//   · Andar para outros meses é a parte da assinatura — com UM passeio grátis
//     vitalício antes, marcado em lib/featureUsage.js, que é o padrão do app
//     aplicado à parte que de fato tem valor de assinatura.
//
// Por quê, em quatro razões que se somam:
//
//   1. ISTO SUBSTITUI UM BANNER QUE ERA GRÁTIS PRA TODO MUNDO. As Temporadas
//      do Céu ficavam na Home, abertas. Mudar de lugar não pode virar
//      pedágio — seria tirar da pessoa uma coisa que ela já tinha.
//   2. A PRIMEIRA TELA DO APP PROMETE NOVE. 'onboarding.headerTitle' diz "Nove
//      leituras. A primeira de cada, grátis.", e o número é verificado no
//      código: são exatamente nove OneTimeLock (horoscope, birthchart, tarot,
//      compatibility, chat, palm, coffee, dream, lunarCalendar). Um décimo
//      cadeado faria a primeira frase do app virar mentira aritmética.
//   3. ISTO NÃO É UMA LEITURA, É UM RELÓGIO. Não tem IA, não tem foto, não
//      tem dado pessoal, não custa nada por uso e é conferível em qualquer
//      efeméride pública. Trancar o que é público não cria escassez, só
//      irritação — e é o motivo de voltar ao app ("abre pra não perder data")
//      que alimenta as nove leituras que de fato se paga.
//   4. O APP JÁ FAZ ISSO EM OUTRO LUGAR. Em lib/personalSky.js/HomeScreen o
//      aspecto mais forte é grátis e o resto pede assinatura. "O agora é
//      aberto, o resto vem com o plano" é régua que já existe na casa.
//
// E o passeio grátis é marcado NO TOQUE, nunca na montagem — o bug que
// components/FeatureGate.js documenta ("marcava o uso no mount, não no uso de
// fato, e podia queimar a prévia de um assinante numa instabilidade de rede").
// Voltar para o mês corrente nunca gasta nada e nunca é bloqueado: a saída
// tem que estar sempre aberta.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { useCouple } from '../context/CoupleContext';
import { funnel } from '../lib/funnel';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { localDayStr } from '../lib/localDay';
import { signByName } from '../lib/signs';
import { calendarioCosmico, MARCA_RECIBO } from '../lib/calendarioCosmico';

// A marca de "já gastou o passeio grátis por outros meses". Nome próprio, sem
// colidir com 'lunarCalendar' (que é a outra tela de calendário e tem cadeado
// próprio, das nove).
const FEATURE_KEY = 'calendarioCosmicoOutrosMeses';

// Chaves em ARRAY LITERAL, não montadas em runtime: assim
// test/i18nKeysExist.test.js enxerga as 19 e cobra as três línguas de cada
// uma. O cabeçalho daquele teste recusa registrar o prefixo `calendarioCosmico.`
// como dinâmico justamente pra não abrir buraco — então nada aqui é montado
// por template.
const MES_KEYS = [
  'calendario.mes.1', 'calendario.mes.2', 'calendario.mes.3', 'calendario.mes.4',
  'calendario.mes.5', 'calendario.mes.6', 'calendario.mes.7', 'calendario.mes.8',
  'calendario.mes.9', 'calendario.mes.10', 'calendario.mes.11', 'calendario.mes.12',
];

// Domingo primeiro, que é o que Date.getDay() devolve como 0.
const SEMANA_KEYS = [
  'calendario.weekday.0', 'calendario.weekday.1', 'calendario.weekday.2', 'calendario.weekday.3',
  'calendario.weekday.4', 'calendario.weekday.5', 'calendario.weekday.6',
];

function pad2(n) {
  return String(n).padStart(2, '0');
}

function diasNoMes(ano, mes) {
  // Dia 0 do mês seguinte = último dia deste. Local, como todo o resto da grade.
  return new Date(ano, mes, 0).getDate();
}

// Rótulo curto de data, sempre a partir dos campos LOCAIS (ver o cabeçalho de
// lib/calendarioCosmico.js: instante em UTC para conferir, dia local para
// mostrar — por isso nunca escrevemos "UTC" ao lado da hora).
function diaMesLocal(d) {
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
}

function horaLocal(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Corta o parágrafo no marcador do motor. Sem marcador (não deve acontecer —
// o teste do motor exige), o texto inteiro vira conversa e nada some.
//
// AS DUAS FUNÇÕES DE MARCA_RECIBO ESTÃO SEPARADAS AQUI, e essa é a correção:
// ele era usado ao mesmo tempo como marcador de corte E como texto visível, o
// que fazia "Quem escreveu isso:" aparecer em português no meio de uma tela em
// inglês. Ele continua sendo o sentinela (é o que existe dentro das strings do
// motor), mas é DESCARTADO do texto — o rótulo que a pessoa lê é
// 'calendario.event.receiptMark', que tem os três idiomas.
function partesDoParagrafo(paragrafo) {
  const corte = typeof paragrafo === 'string' ? paragrafo.indexOf(MARCA_RECIBO) : -1;
  if (corte < 0) return { conversa: paragrafo || '', recibo: null };
  return {
    conversa: paragrafo.slice(0, corte).trim(),
    recibo: paragrafo.slice(corte + MARCA_RECIBO.length).trim(),
  };
}

// ---------------------------------------------------------------------------
// O card de um evento
// ---------------------------------------------------------------------------
// Tradição, fonte e aviso de idade ficam num bloco recolhido: um mês tem entre
// 4 e 20 eventos (test/calendarioCosmico.test.js), e vinte fichas completas
// abertas transformariam a lista num paredão que ninguém rola até o fim. O que
// fica SEMPRE visível é o que o dono pediu: título curto, data e o parágrafo —
// conversa em cima, recibo embaixo.
function EventoCard({ evento, selecionado, onLayout }) {
  const { t } = useLanguage();
  const [aberto, setAberto] = useState(false);
  const { conversa, recibo } = partesDoParagrafo(evento.paragrafo);
  const ehInstante = evento.precisao === 'instante';
  const data = diaMesLocal(evento.data);
  const temFicha = Boolean(evento.tradicao || evento.avisoDeIdade || evento.fonte);

  return (
    <View
      style={[styles.evento, selecionado && styles.eventoSelecionado]}
      onLayout={onLayout}
      testID={`calendario-evento-${evento.tipo}-${evento.diaLocal}`}
    >
      <View style={styles.eventoTopo}>
        <Text style={styles.eventoEmoji}>{evento.emoji}</Text>
        <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
        <Text style={styles.eventoQuando}>
          {ehInstante ? t('calendario.event.dateTime', { data, hora: horaLocal(evento.data) }) : data}
        </Text>
      </View>

      <Text style={styles.body}>{conversa}</Text>
      {recibo ? (
        <Text style={styles.recibo}>
          <Text style={styles.reciboMarca}>{t('calendario.event.receiptMark')}</Text> {recibo}
        </Text>
      ) : null}

      {/* Precisão declarada onde ela é menor. Mercúrio retrógrado sai do motor
          com precisao 'dia' porque a detecção é por diferença centrada de dois
          dias — anunciar hora exata ali seria fingir uma resolução que a conta
          não tem. */}
      {ehInstante ? null : <Text style={styles.note}>{t('calendario.event.dayPrecision')}</Text>}

      {temFicha ? (
        <>
          <TouchableOpacity
            style={styles.toggleRow}
            activeOpacity={0.7}
            onPress={() => setAberto((v) => !v)}
            accessibilityRole="button"
            accessibilityState={{ expanded: aberto }}
            accessibilityLabel={`${evento.titulo} — ${t('calendario.event.sourceToggle')}`}
          >
            <Text style={styles.toggleText}>{t('calendario.event.sourceToggle')}</Text>
            <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
          </TouchableOpacity>

          {aberto ? (
            <View style={styles.ficha}>
              {evento.tradicao ? (
                <>
                  <Text style={styles.fichaLabel}>{t('calendario.event.traditionLabel')}</Text>
                  <Text style={styles.body}>{evento.tradicao.texto}</Text>
                  <Text style={styles.source}>
                    {`${evento.tradicao.obra} — ${evento.tradicao.autor}, ${evento.tradicao.seculo}`}
                  </Text>
                </>
              ) : null}
              {evento.avisoDeIdade ? (
                <>
                  <Text style={styles.fichaLabel}>{t('calendario.event.ageLabel')}</Text>
                  <Text style={styles.noteStrong}>{evento.avisoDeIdade}</Text>
                </>
              ) : null}
              {evento.fonte ? <Text style={styles.source}>{evento.fonte}</Text> : null}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

export default function CalendarioCosmicoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useLanguage();
  const { hasAccess, accessConfirmed, isOwnerAccount } = useCouple();

  // Mesmo cuidado de screens/LunarCalendarScreen.js: a tela fica montada dentro
  // da stack da aba, então "hoje" precisa ser recalculado ao reganhar foco e ao
  // voltar do segundo plano — senão o app aberto de um dia pro outro continua
  // destacando o dia de ontem, e na virada do mês mostraria o mês errado.
  const [tique, setTique] = useState(0);
  const [offset, setOffset] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [passeioGasto, setPasseioGasto] = useState(false);
  const [ofertaVisivel, setOfertaVisivel] = useState(false);

  const scrollRef = useRef(null);
  const posicoesRef = useRef({});

  useFocusEffect(
    useCallback(() => {
      setTique((n) => n + 1);
      const sub = AppState.addEventListener('change', (estado) => {
        if (estado === 'active') setTique((n) => n + 1);
      });
      return () => sub.remove();
    }, [])
  );

  const agora = useMemo(() => new Date(), [tique]);
  const hojeISO = localDayStr(agora);

  const alvo = useMemo(
    () => new Date(agora.getFullYear(), agora.getMonth() + offset, 1),
    [agora, offset]
  );
  const ano = alvo.getFullYear();
  const mes = alvo.getMonth() + 1;

  // Assinante e dono do produto passam direto. hasAccess é otimista (default
  // true) até accessConfirmed — por isso nada é marcado antes da confirmação.
  const liberado = hasAccess || isOwnerAccount;

  useEffect(() => {
    if (liberado || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((usado) => {
      if (usado) setPasseioGasto(true);
    });
  }, [liberado, accessConfirmed]);

  // O motor cacheia por `${ano}-${mes}` (138 ms na primeira conta de um mês,
  // ~52 ms depois), então o useMemo aqui é só pra não recalcular a cada
  // re-render de estado local.
  const resultado = useMemo(() => calendarioCosmico(ano, mes), [ano, mes]);
  const eventos = resultado.eventos;

  // A TEMPORADA CORRENTE, tirada do MESMO evento de ingresso que a lista
  // mostra (ver o cabeçalho, "por que celestialSeasons não é consumido aqui").
  // Sai sempre do mês de HOJE, mesmo com a grade navegada pra outro mês — é um
  // "onde o Sol está agora", não uma propriedade do mês exibido. Custo zero no
  // caso comum: é a mesma chave de cache do mês que abre por padrão.
  const temporada = useMemo(() => {
    const mesDeHoje = calendarioCosmico(agora.getFullYear(), agora.getMonth() + 1);
    if (!mesDeHoje.ceuDisponivel) return null;
    const ingressos = mesDeHoje.eventos.filter((e) => e.tipo === 'ingressoSolar');
    if (ingressos.length === 0) return null;
    const jaPassaram = ingressos.filter((e) => e.data.getTime() <= agora.getTime());
    if (jaPassaram.length > 0) {
      const ultimo = jaPassaram[jaPassaram.length - 1];
      return {
        fase: 'comecou',
        signo: ultimo.detalhe.signoNovo,
        outro: ultimo.detalhe.signoAnterior,
        quando: ultimo.data,
      };
    }
    const proximo = ingressos[0];
    return {
      fase: 'termina',
      signo: proximo.detalhe.signoAnterior,
      outro: proximo.detalhe.signoNovo,
      quando: proximo.data,
    };
  }, [agora]);

  // Agrupamento pela data LOCAL, que é o campo que a tela consome por convenção
  // do app (lib/localDay.js). EFEITO DE BORDA CONHECIDO: um evento cujo
  // instante UTC cai nas primeiras/últimas horas do mês pode ter dia local no
  // mês vizinho — nesse caso ele continua na LISTA, com a data local correta, e
  // simplesmente não acha célula pra marcar na grade deste mês. Preferir isso a
  // marcar uma célula errada: a grade nunca aponta um dia em que não acontece
  // nada no fuso de quem lê.
  const porDia = useMemo(() => {
    const mapa = new Map();
    for (const e of eventos) {
      const lista = mapa.get(e.dataLocal) || [];
      lista.push(e);
      mapa.set(e.dataLocal, lista);
    }
    return mapa;
  }, [eventos]);

  const semanas = useMemo(() => {
    const total = diasNoMes(ano, mes);
    const vazias = new Date(ano, mes - 1, 1).getDay();
    const celulas = [];
    for (let i = 0; i < vazias; i++) celulas.push(null);
    for (let d = 1; d <= total; d++) celulas.push({ dia: d, iso: `${ano}-${pad2(mes)}-${pad2(d)}` });
    while (celulas.length % 7 !== 0) celulas.push(null);
    const linhas = [];
    for (let i = 0; i < celulas.length; i += 7) linhas.push(celulas.slice(i, i + 7));
    return linhas;
  }, [ano, mes]);

  const irPara = useCallback(
    (delta) => {
      const destino = offset + delta;
      const voltandoPraHoje = destino === 0;

      if (!liberado && !voltandoPraHoje) {
        if (passeioGasto) {
          setOfertaVisivel(true);
          funnel.paywallView('calendario_outro_mes', route?.name);
          return;
        }
        // Marcado no TOQUE, não na montagem — e só quando a pessoa de fato sai
        // do mês corrente.
        setPasseioGasto(true);
        markFeatureUsedOnce(FEATURE_KEY);
      }

      posicoesRef.current = {};
      setDiaSelecionado(null);
      setOfertaVisivel(false);
      setOffset(destino);
    },
    [offset, liberado, passeioGasto, route]
  );

  const voltarPraHoje = useCallback(() => {
    posicoesRef.current = {};
    setDiaSelecionado(null);
    setOfertaVisivel(false);
    setOffset(0);
  }, []);

  // Tocar num dia marcado leva até o card dele. É o que faz a grade valer a
  // pena: a pessoa vê o 🌕 no dia 29 e quer saber o que é, sem rolar caçando.
  const abrirDia = useCallback(
    (iso) => {
      setDiaSelecionado(iso);
      const primeiro = (porDia.get(iso) || [])[0];
      const y = primeiro ? posicoesRef.current[primeiro.dataISO] : undefined;
      if (typeof y === 'number' && scrollRef.current && scrollRef.current.scrollTo) {
        scrollRef.current.scrollTo({ y: Math.max(y - 12, 0), animated: true });
      }
    },
    [porDia]
  );

  const rotuloMes = t('calendario.monthLabel', { mes: t(MES_KEYS[mes - 1]), ano });
  const emojiTemporada = temporada ? (signByName(temporada.signo) || {}).emoji : null;

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('calendario.title')}
        subtitle={t('calendario.subtitle')}
        onBack={() => navigation.goBack()}
        gradient={gradients.hero}
      />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>{t('calendario.intro')}</Text>

        {/* ---- Navegação de mês ---- */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.8}
            onPress={() => irPara(-1)}
            accessibilityRole="button"
            accessibilityLabel={t('calendario.prevMonth')}
            testID="calendario-mes-anterior"
          >
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.navLabel} testID="calendario-mes-atual">{rotuloMes}</Text>
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.8}
            onPress={() => irPara(1)}
            accessibilityRole="button"
            accessibilityLabel={t('calendario.nextMonth')}
            testID="calendario-mes-proximo"
          >
            <Ionicons name="chevron-forward" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {offset !== 0 ? (
          <TouchableOpacity
            style={styles.hojeBtn}
            activeOpacity={0.8}
            onPress={voltarPraHoje}
            accessibilityRole="button"
            testID="calendario-voltar-hoje"
          >
            <Ionicons name="today-outline" size={14} color={colors.teal} />
            <Text style={styles.hojeBtnText}>{t('calendario.backToToday')}</Text>
          </TouchableOpacity>
        ) : null}

        {/* ---- A grade ---- */}
        <View style={styles.grade} testID="calendario-grade">
          <View style={styles.semana}>
            {SEMANA_KEYS.map((chave) => (
              <Text key={chave} style={styles.semanaLabel}>
                {t(chave)}
              </Text>
            ))}
          </View>

          {semanas.map((linha, i) => (
            <View key={i} style={styles.semana}>
              {linha.map((celula, j) => {
                if (!celula) return <View key={`v${j}`} style={styles.celula} />;
                const doDia = porDia.get(celula.iso) || [];
                const ehHoje = celula.iso === hojeISO;
                const marcado = doDia.length > 0;
                const selecionado = celula.iso === diaSelecionado;
                const rotuloA11y = marcado
                  ? doDia.length === 1
                    ? t('calendario.a11y.dayEvents_one', { dia: celula.dia })
                    : t('calendario.a11y.dayEvents_other', { dia: celula.dia, n: doDia.length })
                  : t('calendario.a11y.dayEmpty', { dia: celula.dia });

                const conteudo = (
                  <>
                    <Text
                      style={[
                        styles.celulaDia,
                        marcado && styles.celulaDiaMarcado,
                        ehHoje && styles.celulaDiaHoje,
                      ]}
                    >
                      {celula.dia}
                    </Text>
                    <Text style={styles.celulaMarca} numberOfLines={1}>
                      {marcado ? doDia.slice(0, 3).map((e) => e.emoji).join('') : ' '}
                    </Text>
                  </>
                );

                if (!marcado) {
                  return (
                    <View
                      key={celula.iso}
                      style={[styles.celula, ehHoje && styles.celulaHoje]}
                      accessible
                      accessibilityLabel={rotuloA11y}
                    >
                      {conteudo}
                    </View>
                  );
                }

                return (
                  <TouchableOpacity
                    key={celula.iso}
                    style={[
                      styles.celula,
                      styles.celulaMarcada,
                      ehHoje && styles.celulaHoje,
                      selecionado && styles.celulaSelecionada,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => abrirDia(celula.iso)}
                    accessibilityRole="button"
                    accessibilityLabel={rotuloA11y}
                    testID={`calendario-dia-${celula.dia}`}
                  >
                    {conteudo}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.legenda}>
          <View style={styles.legendaItem}>
            <View style={styles.legendaPonto} />
            <Text style={styles.legendaTexto}>{t('calendario.legend.event')}</Text>
          </View>
          <View style={styles.legendaItem}>
            <View style={styles.legendaHoje} />
            <Text style={styles.legendaTexto}>{t('calendario.legend.today')}</Text>
          </View>
        </View>

        {/* ---- A oferta, só depois que o passeio grátis foi gasto ---- */}
        {ofertaVisivel ? (
          <View style={styles.oferta} testID="calendario-oferta">
            <View style={styles.ofertaTopo}>
              <Ionicons name="lock-closed" size={18} color={colors.gold} />
              <Text style={styles.ofertaTitulo}>{t('calendario.gate.title')}</Text>
            </View>
            <Text style={styles.body}>{t('calendario.gate.text')}</Text>
            <TouchableOpacity
              style={styles.ofertaBtn}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(ROUTES.PLANOS)}
              accessibilityRole="button"
              testID="calendario-oferta-cta"
            >
              <Text style={styles.ofertaBtnText}>{t('calendario.gate.cta')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ---- A temporada corrente ---- */}
        {temporada ? (
          <View style={styles.temporada} testID="calendario-temporada">
            <Text style={styles.kicker}>{t('calendario.season.kicker')}</Text>
            <Text style={styles.temporadaTitulo}>
              {emojiTemporada ? `${emojiTemporada} ` : ''}
              {t('calendario.season.title', { signo: temporada.signo })}
            </Text>
            <Text style={styles.temporadaQuando}>
              {temporada.fase === 'comecou'
                ? t('calendario.season.startedAt', {
                    data: diaMesLocal(temporada.quando),
                    anterior: temporada.outro,
                  })
                : t('calendario.season.endsAt', {
                    data: diaMesLocal(temporada.quando),
                    proximo: temporada.outro,
                  })}
            </Text>
            <Text style={styles.body}>{t('calendario.season.note')}</Text>
          </View>
        ) : null}

        {/* ---- A lista ---- */}
        {!resultado.ceuDisponivel ? (
          // NUNCA FABRICA. Sem efeméride o motor devolve lista vazia e a razão
          // pra ser lida por gente (o campo técnico motivoIndisponivel não
          // chega aqui, de propósito). Isto é ERRO DE UI, não conteúdo
          // histórico — então tem chave nos três idiomas (`mensagemKey`), com a
          // `mensagem` em português como último fallback.
          <View style={styles.indisponivel} testID="calendario-indisponivel">
            <Ionicons name="cloud-offline-outline" size={20} color={colors.textMuted} />
            <Text style={styles.indisponivelTitulo}>{t('calendario.unavailable.title')}</Text>
            <Text style={styles.body}>
              {resultado.mensagemKey ? t(resultado.mensagemKey) : resultado.mensagem}
            </Text>
          </View>
        ) : eventos.length === 0 ? (
          <Text style={styles.note} testID="calendario-lista-vazia">
            {t('calendario.list.empty')}
          </Text>
        ) : (
          <>
            <Text style={styles.listaTitulo}>{t('calendario.list.title')}</Text>
            <Text style={styles.listaContagem}>
              {eventos.length === 1
                ? t('calendario.list.count_one')
                : t('calendario.list.count_other', { n: eventos.length })}
            </Text>
            {eventos.map((evento) => (
              <EventoCard
                key={`${evento.tipo}-${evento.dataISO}`}
                evento={evento}
                selecionado={evento.dataLocal === diaSelecionado}
                onLayout={(e) => {
                  // y relativo ao contentContainer — os cards são filhos
                  // diretos do ScrollView, então serve direto pro scrollTo.
                  posicoesRef.current[evento.dataISO] = e.nativeEvent.layout.y;
                }}
              />
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navLabel: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1, textAlign: 'center' },

  hojeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  hojeBtnText: { color: colors.teal, fontSize: 13, fontWeight: '700' },

  grade: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    gap: 4,
  },
  semana: { flexDirection: 'row', gap: 4 },
  semanaLabel: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingVertical: 4,
  },
  celula: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  celulaMarcada: { backgroundColor: 'rgba(181,123,255,0.12)' },
  celulaHoje: { borderWidth: 1, borderColor: colors.teal },
  celulaSelecionada: { borderWidth: 1, borderColor: colors.purple, backgroundColor: 'rgba(181,123,255,0.22)' },
  celulaDia: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  celulaDiaMarcado: { color: colors.text },
  celulaDiaHoje: { color: colors.teal, fontWeight: '800' },
  celulaMarca: { fontSize: 10, lineHeight: 14, color: colors.purple },

  legenda: { flexDirection: 'row', gap: 16, justifyContent: 'center', flexWrap: 'wrap' },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaPonto: { width: 10, height: 10, borderRadius: 3, backgroundColor: 'rgba(181,123,255,0.55)' },
  legendaHoje: { width: 10, height: 10, borderRadius: 3, borderWidth: 1, borderColor: colors.teal },
  legendaTexto: { color: colors.textMuted, fontSize: 11 },

  oferta: {
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.45)',
    padding: 14,
    gap: 8,
  },
  ofertaTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ofertaTitulo: { color: colors.gold, fontSize: 14, fontWeight: '800', flex: 1 },
  ofertaBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 2,
  },
  ofertaBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  temporada: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  kicker: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  temporadaTitulo: { color: colors.gold, fontSize: 18, fontWeight: '800' },
  temporadaQuando: { color: colors.teal, fontSize: 13, fontWeight: '700' },

  listaTitulo: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 6 },
  listaContagem: { color: colors.textMuted, fontSize: 12, marginTop: -6 },

  evento: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  eventoSelecionado: { borderColor: colors.purple },
  eventoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  eventoEmoji: { fontSize: 20 },
  eventoTitulo: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  eventoQuando: { color: colors.teal, fontSize: 12, fontWeight: '700' },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    gap: 10,
  },
  toggleText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', flex: 1 },
  ficha: { gap: 8 },
  fichaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  indisponivel: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
    alignItems: 'flex-start',
  },
  indisponivelTitulo: { color: colors.text, fontSize: 15, fontWeight: '800' },

  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  recibo: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  // O rótulo do recibo, agora traduzido — negrito só pra ele continuar sendo
  // lido como rótulo e não como começo da frase.
  reciboMarca: { color: colors.textMuted, fontWeight: '800' },
  note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  noteStrong: { color: colors.gold, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  source: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
});
