// screens/LunarCalendarScreen.js
// O CALENDÁRIO LUNAR — a fase de hoje, o mês inteiro e, desde 01/08/2026, a
// LUA FORA DE CURSO (kenodromia) com AS DUAS definições calculadas lado a lado.
//
// ===========================================================================
// LEIA lib/luaForaDeCurso.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// ===========================================================================
// Esta tela é VITRINE: ela mostra o que o motor exporta, ela NÃO redige
// conteúdo. Toda regra do cabeçalho de lib/luaForaDeCurso.js vale aqui e é
// varrida por test/luaForaDeCurso.test.js na origem — nenhuma ordem à pessoa,
// nenhuma alegação de saúde, nenhuma promessa, nenhum veredito sobre o dia de
// ninguém. Se faltar texto, o texto nasce no PACK, nos três idiomas.
//
// POR QUE AS DUAS RÉGUAS APARECEM JUNTAS. Não existe "a" Lua fora de curso:
// existem pelo menos duas contas, de séculos diferentes, que dão PERÍODOS
// DIFERENTES para o mesmo dia. A régua da fronteira de signo (William Lilly,
// Christian Astrology, Londres, 1647, p. 112) é a das tabelas de «dia livre»
// que circulam hoje; a régua dos 30° seguintes é grega (Antíoco de Atenas,
// séc. II; Porfírio de Tiro, séc. III) e não fala de signo nenhum. A tese do
// app (docs/tradicao/00-tese.md, proposição 2) proíbe escolher em silêncio:
// "quando duas fontes discordam, mostrar as duas com o nome de cada uma".
// Por isso a tela chama luaForaDeCurso() DUAS VEZES, uma por definição, e põe
// a divergência no lugar mais visível do bloco em vez de escondê-la no rodapé.
//
// O SELO NÃO É VEREDITO. Ele diz «esta régua vê vazio agora» — sujeito
// explícito, a régua. O concorrente escreve "Dia Livre" e transforma uma conta
// em sentença sobre a vida de quem lê; é exatamente isso que esta tela recusa,
// e o texto `naoDamosVeredito` do pack diz o porquê em voz alta.
//
// NUNCA FABRICAR CÉU. Sem efeméride ou sem convergência, luaForaDeCurso()
// devolve `disponivel: false` com motivo e a tela imprime o texto do motor —
// horário estimado aqui seria invenção. janelasForaDeCurso() devolvendo null
// (lista que não fechou) vira aviso, nunca lista pela metade.
//
// A CONTA É PESADA E POR ISSO É ADIADA. As duas leituras mais as duas
// varreduras do dia custam ~90 ms de efeméride em desktop e mais em aparelho.
// Elas rodam num setTimeout(0) depois da primeira pintura, para a fase da Lua
// (que é o que a pessoa veio ver) aparecer na hora. Enquanto não fecham, o
// bloco mostra `calculando` — declarar que está calculando é honesto; mostrar
// um estado velho de meia hora atrás não é.
//
// i18n: NADA DO BLOCO DA LUA FORA DE CURSO PASSA POR t() — lib/i18n.js segue
// intocado. O chrome sai do bloco `tela` de lib/traducoes/luaForaDeCurso.
// {pt,es,en}.js e o conteúdo sai do próprio motor, já no idioma. Esta tela só
// repassa o `lang` do useLanguage(): não redige uma linha e usa o MESMO
// fallback do motor (packDoIdioma: idioma desconhecido cai no PT). O chrome
// antigo desta tela (título, DISCLAIMER) continua em PT cravado, como estava —
// a migração dele é outro passe.
//
// COMPARTILHAR: a mesma cadeia de IdadeRealScreen.js e MitosScreen.js — Share
// do react-native primeiro (no nativo é a folha do SO; na web,
// react-native-web delega para navigator.share quando existe) e clipboard como
// último recurso no desktop sem folha. O texto é costurado no PACK, a partir
// dos textos do motor — nunca montado dentro deste componente.
//
// STORAGE: só através de lib/storage.js. A tela não importa AsyncStorage —
// nunca, regra da casa (o registro do Diário usava o AsyncStorage direto e
// passou pelos wrappers seguros no mesmo passe).
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform, AppState, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
// A CENA ILUSTRADA (08/08/2026) — o hero desenhado do pack de arte
// (lib/ilustracoes.js, 640px), entre o header e o cartão da fase de hoje.
import { CENAS } from '../lib/ilustracoes';
import OneTimeLock from '../components/OneTimeLock';
import { getMoonPhaseToday, getMoonPhaseForCurrentMonth } from '../lib/lunarCalendar';
import { luaForaDeCurso, janelasForaDeCurso, DEFINICOES } from '../lib/luaForaDeCurso';
import { PACK as PACK_PT } from '../lib/traducoes/luaForaDeCurso.pt.js';
import { PACK as PACK_ES } from '../lib/traducoes/luaForaDeCurso.es.js';
import { PACK as PACK_EN } from '../lib/traducoes/luaForaDeCurso.en.js';
import { getItemSeguro, setItemSeguro } from '../lib/storage';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

// O rótulo do mês segue o idioma do APP (LanguageContext), não o locale do
// aparelho — 'pt-BR' cravado aqui era o exemplo citado no cabeçalho do bloco
// CALENDARIO_COSMICO_I18N de lib/i18n.js do que não repetir.
const LOCALE_DO_IDIOMA = { pt: 'pt-BR', es: 'es', en: 'en-US' };

// O chrome da Lua fora de curso vem do pack do PRÓPRIO módulo, com o mesmo
// fallback do motor (lib/luaForaDeCurso.js → packDoIdioma): idioma desconhecido
// cai no PT. A tela não escolhe idioma — ela repassa o que o contexto deu.
const PACKS_VOC = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };
function chromeDaLuaForaDeCurso(lang) {
  return (PACKS_VOC[lang] || PACKS_VOC.pt).tela;
}

const FEATURE_KEY = 'lunarCalendar';
const DIARY_RECORDED_KEY = 'cosmic-lunar-diary-date';

function todayISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Formatação de instante — dia e hora do relógio do aparelho, no locale que o
// PACK indica. Isto é formatação de número, não redação: a prosa toda vem
// pronta do motor.
function instanteLocal(data, locale) {
  if (!(data instanceof Date) || Number.isNaN(data.getTime())) return null;
  try {
    return data.toLocaleString(locale, {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return data.toISOString().slice(0, 16).replace('T', ' ');
  }
}

// Mesmo tom honesto de lib/palmReadings.js / lib/chatResponses.js: a fase em
// si é astronomia real (astronomy-engine), mas a reflexão que a acompanha é
// simbólica — nunca previsão garantida.
// A primeira metade deste texto é verificável e continua igual. A segunda dizia
// "seguem a tradição milenar dos ciclos lunares", e era falsa no pior lugar
// possível — a frase que se apresenta como o selo de honestidade da tela.
// A divisão em OITO fases nomeadas, com leitura de cada uma, é de Dane Rudhyar,
// "The Lunation Cycle", 1967. A moldura milenar é a de QUATRO quartos
// (Ptolomeu, Tetrabiblos I.8). Ver docs/tradicao/04, §3.1 e §6.
const DISCLAIMER =
  'A fase da Lua é calculada com astronomia real (posição Sol-Lua). As reflexões que ' +
  'acompanham cada fase misturam duas idades, e a tela diz qual é qual: a divisão em quatro ' +
  'quartos e o calendário agrícola romano são antigos; a leitura das oito fases nomeadas é ' +
  'de 1967 (Dane Rudhyar). Convite simbólico, não garantia de resultado.';

function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export default function LunarCalendarScreen() {
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  // O fio do idioma: o CONTEÚDO (nome da fase + reflexão, e todo o bloco da Lua
  // fora de curso) sai dos motores já no idioma do app. O chrome antigo desta
  // tela (título, disclaimer) ainda é PT cravado — segundo passe, junto com o
  // resto do chrome antigo.
  const { lang } = useLanguage() || {};
  const [refreshTick, setRefreshTick] = useState(0);
  const [locked, setLocked] = useState(false);

  // Sem botão de ação nesta tela — o conteúdo aparece já ao montar, então o
  // próprio "uso" é a montagem. Por isso a checagem e a marcação acontecem
  // juntas aqui: só marca como usado quando a checagem confirma que ainda
  // não tinha sido usado (senão marcaria de novo a cada montagem), e só
  // bloqueia (setLocked(true)) quando já tinha sido usado antes — nunca na
  // mesma visita em que a pessoa está consumindo seu uso grátis.
  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (used) {
        setLocked(true);
      } else {
        markFeatureUsedOnce(FEATURE_KEY);
      }
    });
  }, [hasAccess, accessConfirmed]);

  // A tela fica montada dentro da stack da Tab (não desmonta ao navegar pra
  // outra aba), então "hoje" precisa ser recalculado sempre que ela ganha
  // foco de novo OU quando o app volta do background enquanto ela já é a
  // tela atual — senão, deixar o app em segundo plano de um dia pro outro
  // mantinha a fase da Lua calculada na primeira montagem, mostrando a fase
  // de ontem rotulada como "hoje". Vale em dobro para a Lua fora de curso,
  // que muda de estado várias vezes por dia.
  useFocusEffect(
    useCallback(() => {
      setRefreshTick((tick) => tick + 1);

      const subscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          setRefreshTick((tick) => tick + 1);
        }
      });

      return () => subscription.remove();
    }, [])
  );

  // getMoonPhaseForCurrentMonth já é barata (no máximo 31 cálculos
  // trigonométricos O(1)), então recalcular a cada refreshTick não pesa.
  const today = useMemo(() => getMoonPhaseToday(lang), [refreshTick, lang]);
  const monthDays = useMemo(() => getMoonPhaseForCurrentMonth(lang), [refreshTick, lang]);
  const monthLabel = useMemo(
    () =>
      capitalize(
        new Date().toLocaleDateString(LOCALE_DO_IDIOMA[lang] || LOCALE_DO_IDIOMA.pt, {
          month: 'long',
          year: 'numeric',
        })
      ),
    [refreshTick, lang]
  );
  const todayNumber = new Date().getDate();

  // -------------------------------------------------------------------------
  // LUA FORA DE CURSO — as duas contas
  // -------------------------------------------------------------------------
  const UI = chromeDaLuaForaDeCurso(lang);
  const [voc, setVoc] = useState(null);
  const [reguaAberta, setReguaAberta] = useState(null);
  const [fontesAbertas, setFontesAbertas] = useState(false);
  const [recado, setRecado] = useState(null);

  useEffect(() => {
    let vivo = true;
    setVoc(null);
    setReguaAberta(null);
    setRecado(null);
    // Adiado um tique para a fase da Lua pintar antes: são quatro passagens de
    // efeméride e elas bloqueiam a thread enquanto rodam.
    const id = setTimeout(() => {
      if (!vivo) return;
      const agora = new Date();
      const inicioDoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
      const fimDoDia = new Date(inicioDoDia.getTime() + 24 * 60 * 60 * 1000);
      const leituras = {};
      const janelas = {};
      for (const def of DEFINICOES) {
        try {
          leituras[def] = luaForaDeCurso(agora, def, lang);
        } catch {
          // O motor já se declara indisponível sozinho; isto é a rede para o
          // caso de o próprio require da efeméride explodir.
          leituras[def] = null;
        }
        try {
          janelas[def] = janelasForaDeCurso(inicioDoDia, fimDoDia, def, lang);
        } catch {
          janelas[def] = null;
        }
      }
      if (vivo) setVoc({ leituras, janelas });
    }, 0);
    return () => {
      vivo = false;
      clearTimeout(id);
    };
  }, [refreshTick, lang]);

  // A leitura de referência para o que é COMUM às duas réguas (glosa,
  // divergência, indisponibilidade): as duas saem do mesmo céu, então qualquer
  // uma serve — e `divergem` é simétrico por construção.
  const referencia = voc ? DEFINICOES.map((d) => voc.leituras[d]).find(Boolean) : null;
  const vocDisponivel = !!(referencia && referencia.disponivel);

  async function compartilharVoc() {
    if (!vocDisponivel) return;
    const primeira = voc.leituras[DEFINICOES[0]];
    const segunda = voc.leituras[DEFINICOES[1]];
    if (!primeira || !segunda || !primeira.disponivel || !segunda.disponivel) return;
    const texto = UI.textoCompartilhavel({
      termo: primeira.termo,
      quando: instanteLocal(primeira.instante, UI.locale) || '',
      primeira: primeira.textos.estado,
      segunda: segunda.textos.estado,
      divergencia: primeira.textos.divergencia,
    });
    setRecado(null);
    const temFolhaWeb =
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function';
    if (Platform.OS !== 'web' || temFolhaWeb) {
      try {
        await Share.share({ message: texto });
      } catch {
        // Cancelou ou a folha falhou: silêncio, mesmo comportamento das outras
        // telas que compartilham.
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

  // Vira entrada no Diário Cósmico 1x por dia — antes essa tela não deixava
  // rastro nenhum de uso real (achado real de auditoria de retenção, 25/07/2026).
  useEffect(() => {
    if (!today) return;
    const iso = todayISO();
    getItemSeguro(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === iso) return;
      recordReadingCompletion({
        type: 'lunarCalendar',
        typeLabel: 'Calendário Lunar',
        title: `${today.emoji} ${today.name}`,
        body: today.reflexao,
      });
      setItemSeguro(DIARY_RECORDED_KEY, iso);
    });
  }, [today]);

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Calendário Lunar" gradient={gradients.hero} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Calendário Lunar"
        subtitle="Fases da Lua em tempo real"
        onBack={() => navigation.goBack()}
        gradient={gradients.teal}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* A CENA DA LUA (08/08/2026) — hero (CENAS.lua) entre o header e o
            cartão da fase, o slot "entre o header e o conteúdo": 160 de altura
            deixa a reflexão de hoje (o que a pessoa veio ver) inteira na
            primeira dobra. É <Image/>, pinta na primeira passada — não atrasa
            a fase nem entra na conta adiada da Lua fora de curso.
            accessible={false}: é cenário, não informação. */}
        <View style={styles.cenaWrap}>
          <Image source={CENAS.lua} style={styles.cenaImg} resizeMode="cover" accessible={false} />
        </View>

        {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — o cartão abria com
            "Lua Cheia" em corpo 22 e "97% iluminada hoje" logo abaixo, e só
            então a reflexão. Nome de fase e porcentagem são medida: dizem o que
            a Lua está fazendo, não o que isso tem a ver com quem está lendo. A
            reflexão passa a abrir; o desenho da Lua (emoji) fica onde estava,
            porque ilustra em vez de informar. O nome e a iluminação DESCERAM
            para a linha de recibo — a conta continua à vista, e continua sendo
            astronomia de verdade (ver o disclaimer logo abaixo).
            test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
        {today ? (
          <View style={styles.todayCard}>
            <Text style={styles.todayEmoji}>{today.emoji}</Text>
            <Text style={styles.todayReflection}>{today.reflexao}</Text>
            <Text style={styles.todayName}>{today.name}</Text>
            {today.illumination !== null ? (
              <Text style={styles.todayIllum}>{today.illumination}% iluminada hoje</Text>
            ) : null}
          </View>
        ) : (
          <View style={styles.todayCard}>
            <Text style={styles.todayReflection}>
              Não foi possível calcular a fase da Lua agora. Tente novamente mais tarde.
            </Text>
          </View>
        )}

        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>

        {/* ==================================================================
            LUA FORA DE CURSO — as DUAS definições, e a divergência à vista
        ================================================================== */}
        <View style={styles.vocBloco} testID="voc-bloco">
          <Text style={styles.vocKicker}>{UI.kicker}</Text>
          <Text style={styles.vocTitulo}>{UI.titulo}</Text>

          {/* Prende primeiro, fonte depois: o print que circula, e só então de
              onde cada régua vem. */}
          <Text style={styles.vocIntro}>{UI.intro}</Text>
          <Text style={styles.vocIntro}>{UI.porQueDuas}</Text>
          <Text style={styles.vocIntro}>{UI.naoDamosVeredito}</Text>
          {referencia ? <Text style={styles.vocGlosa}>{referencia.textos.glosa}</Text> : null}

          {!voc ? (
            <Text style={styles.vocNota} testID="voc-calculando">
              {UI.calculando}
            </Text>
          ) : !vocDisponivel ? (
            // NUNCA FABRICA: sem céu, o motivo vem do motor e nenhum horário
            // aparece na tela.
            <View style={styles.vocIndisponivel} testID="voc-indisponivel">
              <Ionicons name="cloud-offline-outline" size={20} color={colors.textMuted} />
              <Text style={styles.vocIndisponivelTitulo}>{UI.indisponivelTitulo}</Text>
              <Text style={styles.vocCorpo}>
                {referencia ? referencia.textos.indisponivel : UI.janelasIndisponiveis}
              </Text>
            </View>
          ) : (
            <>
              {/* O selo da divergência: quando as duas discordam, essa é a
                  informação mais interessante do dia — não uma nota de rodapé. */}
              <View
                style={[styles.vocSelo, referencia.divergem ? styles.vocSeloDivergem : styles.vocSeloConcordam]}
                testID="voc-selo-divergencia"
              >
                <Ionicons
                  name={referencia.divergem ? 'git-compare-outline' : 'checkmark-done-outline'}
                  size={14}
                  color={referencia.divergem ? colors.gold : colors.teal}
                />
                <Text style={styles.vocSeloTexto}>
                  {referencia.divergem ? UI.divergemSim : UI.divergemNao}
                </Text>
              </View>

              <Text style={styles.vocRotulo}>{UI.rotuloReguas}</Text>

              {DEFINICOES.map((def) => {
                const r = voc.leituras[def];
                if (!r || !r.disponivel) return null;
                const d = r.definicaoUsada;
                const vazio = r.foraDeCurso;
                const aberta = reguaAberta === def;
                const inicio = instanteLocal(r.desde, UI.locale);
                const fim = instanteLocal(r.ate, UI.locale);
                return (
                  <View
                    key={def}
                    style={[styles.vocCard, vazio && styles.vocCardVazio]}
                    testID={`voc-card-${def}`}
                  >
                    <Text style={styles.vocRegua}>{d.nome}</Text>

                    {/* O estado NUNCA é veredito sobre o dia: o sujeito da
                        frase é a régua, e ela vem com o nome de quem a defende
                        logo abaixo. */}
                    <View style={[styles.vocEstado, vazio ? styles.vocEstadoVazio : styles.vocEstadoCheio]}>
                      <Text
                        style={[styles.vocEstadoTexto, vazio && styles.vocEstadoTextoVazio]}
                        testID={`voc-estado-${def}`}
                      >
                        {vazio ? UI.seloVazio : UI.seloCheio}
                      </Text>
                    </View>

                    <View style={styles.vocPar}>
                      <Text style={styles.vocParRotulo}>{UI.rotuloDefende}</Text>
                      <Text style={styles.vocParValor} testID={`voc-autor-${def}`}>
                        {d.autor} · {d.seculo}
                      </Text>
                    </View>

                    <Text style={styles.vocCorpo}>{r.textos.estado}</Text>

                    {vazio && inicio && fim ? (
                      <View style={styles.vocPar}>
                        <Text style={styles.vocParRotulo}>{UI.rotuloJanelaAgora}</Text>
                        <Text style={styles.vocParValor} testID={`voc-janela-${def}`}>
                          {UI.faixa({ inicio, fim })}
                        </Text>
                      </View>
                    ) : null}

                    <TouchableOpacity
                      style={styles.vocAbrir}
                      activeOpacity={0.85}
                      onPress={() => setReguaAberta(aberta ? null : def)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: aberta }}
                      accessibilityLabel={`${d.nome} — ${aberta ? UI.fechar : UI.abrir}`}
                      testID={`voc-abrir-${def}`}
                    >
                      <Text style={styles.vocAbrirTexto}>{aberta ? UI.fechar : UI.abrir}</Text>
                      <Ionicons
                        name={aberta ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>

                    {aberta ? (
                      <View style={styles.vocAberto}>
                        <Text style={styles.vocParRotulo}>{UI.rotuloCriterio}</Text>
                        <Text style={styles.vocCorpo}>{d.criterio}</Text>

                        <Text style={styles.vocCorpo}>{r.textos.janela}</Text>

                        <Text style={styles.vocParRotulo}>{UI.rotuloProximo}</Text>
                        <Text style={styles.vocCorpo}>{r.textos.proximoEncontro}</Text>

                        <Text style={styles.vocParRotulo}>{UI.rotuloQuemUsa}</Text>
                        <Text style={styles.vocCorpo}>{d.quemUsa}</Text>
                        <Text style={styles.vocCorpo}>{d.porQueEssa}</Text>

                        {/* O recibo: obra, autor, século — caixa pontilhada, no
                            fim, como nas outras telas de tradição. */}
                        <View style={styles.vocRecibo}>
                          <Text style={styles.vocParRotulo}>{UI.rotuloRecibo}</Text>
                          <Text style={styles.vocReciboTexto} testID={`voc-recibo-${def}`}>
                            {r.textos.recibo}
                          </Text>
                          <Text style={styles.vocLocus}>{d.locus}</Text>
                        </View>
                      </View>
                    ) : null}
                  </View>
                );
              })}

              {/* A DIVERGÊNCIA, escrita pelo motor: por que as duas contas
                  recortam o mesmo dia de jeitos diferentes. */}
              <Text style={styles.vocRotulo}>{UI.rotuloDivergencia}</Text>
              <Text style={styles.vocCorpo} testID="voc-divergencia">
                {referencia.textos.divergencia}
              </Text>

              {/* AS JANELAS DE HOJE — uma lista por régua. É aqui que a
                  divergência deixa de ser teoria: uma lista vem cheia e a
                  outra costuma vir vazia. */}
              <Text style={styles.vocRotulo}>{UI.rotuloHoje}</Text>
              <Text style={styles.vocCorpo}>{UI.hojeIntro}</Text>

              {DEFINICOES.map((def) => {
                const r = voc.leituras[def];
                const lista = voc.janelas[def];
                if (!r || !r.disponivel) return null;
                return (
                  <View key={`hoje-${def}`} style={styles.vocHojeBloco} testID={`voc-hoje-${def}`}>
                    <Text style={styles.vocHojeRegua}>{r.definicaoUsada.nome}</Text>
                    {lista === null ? (
                      // Lista truncada em silêncio seria pior que lista nenhuma.
                      <Text style={styles.vocNota}>{UI.janelasIndisponiveis}</Text>
                    ) : lista.length === 0 ? (
                      <Text style={styles.vocNota}>{UI.semJanelaHoje}</Text>
                    ) : (
                      lista.map((j) => {
                        const inicio = instanteLocal(j.desde, UI.locale);
                        const fim = instanteLocal(j.ate, UI.locale);
                        return (
                          <View key={`${def}-${j.desde.getTime()}`} style={styles.vocJanela}>
                            <Text style={styles.vocJanelaFaixa}>
                              {inicio && fim ? UI.faixa({ inicio, fim }) : ''}
                            </Text>
                            <Text style={styles.vocJanelaResumo}>{j.resumo}</Text>
                          </View>
                        );
                      })
                    )}
                  </View>
                );
              })}

              {/* DE ONDE VEM TUDO ISTO — fechado por padrão: são sete blocos de
                  fonte e um paredão aberto ninguém lê. */}
              <TouchableOpacity
                style={styles.vocFontesBtn}
                activeOpacity={0.85}
                onPress={() => setFontesAbertas((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ expanded: fontesAbertas }}
                accessibilityLabel={fontesAbertas ? UI.fecharFontes : UI.verFontes}
                testID="voc-fontes-toggle"
              >
                <Ionicons name="library-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.vocFontesBtnTexto}>
                  {fontesAbertas ? UI.fecharFontes : UI.verFontes}
                </Text>
              </TouchableOpacity>

              {fontesAbertas ? (
                <View style={styles.vocFontes} testID="voc-fontes">
                  <Text style={styles.vocCorpo}>{referencia.textos.oQuantoIssoMuda}</Text>
                  <Text style={styles.vocCorpo}>{referencia.textos.comoOMercadoUsa}</Text>

                  {/* Citação não se traduz: o inglês fica como está, com a
                      paráfrase ao lado rotulada como nossa. */}
                  {referencia.verbatins.map((v) => (
                    <View key={v.locus} style={styles.vocCitacao}>
                      <Text style={styles.vocParRotulo}>{UI.rotuloNoOriginal}</Text>
                      <Text style={styles.vocVerbatim}>{v.texto}</Text>
                      <Text style={styles.vocParRotulo}>{UI.rotuloParafrase}</Text>
                      <Text style={styles.vocCorpo}>{v.parafrase}</Text>
                      <Text style={styles.vocLocus}>{v.locus}</Text>
                    </View>
                  ))}

                  <Text style={styles.vocCorpo}>{referencia.textos.notaConjuncao}</Text>
                  <Text style={styles.vocCorpo}>{referencia.textos.osSeteEOsTres}</Text>
                  <Text style={styles.vocCorpo}>{referencia.textos.oQueNaoSeAchou}</Text>
                  <Text style={styles.vocCorpo}>{referencia.textos.comoFoiCalculado}</Text>
                  <Text style={styles.vocCorpo}>{referencia.textos.leituraDoApp}</Text>
                  <Text style={styles.vocCorpo}>{referencia.textos.semDadoPessoal}</Text>

                  <Text style={styles.vocParRotulo}>{UI.rotuloFontes}</Text>
                  {referencia.fonte.map((f) => (
                    <Text key={f} style={styles.vocFonteItem}>
                      • {f}
                    </Text>
                  ))}
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.vocShareBtn}
                activeOpacity={0.85}
                onPress={compartilharVoc}
                accessibilityRole="button"
                accessibilityLabel={UI.compartilhar}
                testID="voc-share"
              >
                <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                <Text style={styles.vocShareBtnTexto}>{UI.compartilhar}</Text>
              </TouchableOpacity>

              {recado ? <Text style={styles.vocNota}>{recado}</Text> : null}
              <Text style={styles.vocMarca}>{UI.marca}</Text>
            </>
          )}
        </View>

        <Text style={styles.sectionTitle}>{monthLabel}</Text>
        <View style={styles.monthList}>
          {monthDays.map(({ day, phase }) => {
            const isToday = day === todayNumber;
            return (
              <View key={day} style={[styles.dayRow, isToday && styles.dayRowToday]}>
                <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{day}</Text>
                <Text style={styles.dayEmoji}>{phase ? phase.emoji : '—'}</Text>
                <Text style={styles.dayPhaseName} numberOfLines={1}>
                  {phase ? phase.name : 'Indisponível'}
                </Text>
                {phase && phase.illumination !== null ? (
                  <Text style={styles.dayIllum}>{phase.illumination}%</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  // A cena ilustrada do topo — o gap:16 do scrollContent já dá o respiro.
  cenaWrap: { borderRadius: 18, overflow: 'hidden' },
  cenaImg: { width: '100%', height: 160 },
  todayCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 6,
  },
  todayEmoji: { fontSize: 56 },
  // O nome da fase e a iluminação viraram a linha de recibo do cartão (a
  // reflexão subiu). Menores e com o fio em cima: continuam legíveis, continuam
  // sendo a medida que o app fez — só não são mais a manchete.
  todayName: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 12 },
  todayIllum: { color: colors.teal, fontSize: 13, fontWeight: '700' },
  todayReflection: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 8,
  },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },

  // ---- Lua fora de curso ----
  vocBloco: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  vocKicker: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 },
  vocTitulo: { color: colors.text, fontSize: 19, fontWeight: '800', lineHeight: 25 },
  vocIntro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  vocGlosa: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },
  vocNota: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },

  vocIndisponivel: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 14,
    gap: 6,
    alignItems: 'center',
  },
  vocIndisponivelTitulo: { color: colors.text, fontSize: 14, fontWeight: '800', textAlign: 'center' },

  vocSelo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  vocSeloDivergem: { borderColor: colors.gold, backgroundColor: 'rgba(255,200,92,0.10)' },
  vocSeloConcordam: { borderColor: colors.border, backgroundColor: colors.surfaceElevated },
  vocSeloTexto: { color: colors.text, fontSize: 12, fontWeight: '800' },

  vocRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 6,
  },

  vocCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  vocCardVazio: { borderColor: colors.purple },
  vocRegua: { color: colors.text, fontSize: 16, fontWeight: '800', lineHeight: 22 },

  vocEstado: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  vocEstadoVazio: { borderColor: colors.purple, backgroundColor: 'rgba(181,123,255,0.12)' },
  vocEstadoCheio: { borderColor: colors.border, backgroundColor: colors.surface },
  vocEstadoTexto: { color: colors.textSecondary, fontSize: 11, fontWeight: '700' },
  vocEstadoTextoVazio: { color: colors.text },

  vocPar: { gap: 2 },
  vocParRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  vocParValor: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  vocCorpo: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  vocAbrir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 2,
  },
  vocAbrirTexto: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  vocAberto: { gap: 8 },

  vocRecibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  vocReciboTexto: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  vocLocus: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },

  vocHojeBloco: { gap: 6, marginTop: 4 },
  vocHojeRegua: { color: colors.teal, fontSize: 13, fontWeight: '800' },
  vocJanela: {
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
    paddingLeft: 10,
    gap: 2,
  },
  vocJanelaFaixa: { color: colors.text, fontSize: 13, fontWeight: '700' },
  vocJanelaResumo: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },

  vocFontesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingVertical: 11,
    marginTop: 6,
  },
  vocFontesBtnTexto: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  vocFontes: { gap: 10 },
  vocCitacao: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    padding: 12,
    gap: 4,
  },
  vocVerbatim: { color: colors.text, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  vocFonteItem: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },

  vocShareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  vocShareBtnTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },
  vocMarca: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },

  sectionTitle: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 8 },
  monthList: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  dayRowToday: { backgroundColor: 'rgba(92,224,216,0.12)' },
  dayNumber: { color: colors.textMuted, fontSize: 14, fontWeight: '700', width: 22 },
  dayNumberToday: { color: colors.teal },
  dayEmoji: { fontSize: 20, width: 28 },
  dayPhaseName: { color: colors.text, fontSize: 14, flex: 1 },
  dayIllum: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
});
