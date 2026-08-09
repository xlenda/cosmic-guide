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
// O texto do motor agora sai nos TRÊS idiomas: esta tela passa o `lang` do
// useLanguage() para calendarioCosmico(ano, mes, lang) e o motor escolhe o
// pack (lib/traducoes/calendario.*.js). O que esta tela escreve (cabeçalho,
// navegação, rótulos, a temporada) está nas três línguas em lib/i18n.js, no
// bloco CALENDARIO_COSMICO_I18N do fim. Nome de signo interpolado na
// temporada usa os campos *Display do evento (rótulo por idioma); os campos
// canônicos de `detalhe` seguem sendo a chave de signByName().
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
//
// ===========================================================================
// APLICATIVO × SEPARATIVO — a direção dos encontros de hoje (01/08/2026)
// ===========================================================================
// LEIA lib/transitoFase.js ANTES DE MEXER NO BLOCO DE FASE.
//
// Por que ele mora AQUI e não em outra tela: este calendário é o relógio do
// app. Ele já diz o DIA de cada encontro do céu com ele mesmo (lua, ingresso,
// estação, retrógrado). O que faltava era a outra metade do mesmo assunto — a
// DIREÇÃO de um encontro que envolve a pessoa: o ângulo entre um planeta de
// hoje e um ponto do mapa de nascimento dela está fechando ou abrindo?
//
// O DEFEITO QUE ISSO CONSERTA. lib/personalSky.js calcula `Math.abs(sep -
// angle)` e, com o valor absoluto, PERDE O SINAL: um trânsito que ainda vai
// fechar e um que já fechou saem com o mesmo `orb` e a mesma frase. O card
// "Céu de hoje" da Home mostra exatamente isso. lib/transitoFase.js devolve o
// sinal (resíduo assinado + movimento de 24 horas), e o verbo muda de "está se
// formando" para "está se desfazendo".
//
// SEM DUPLICAR CONTA. A tela chama personalSkyToday UMA vez (é ele quem decide
// quais aspectos estão em orbe e em que ordem) e fasesDoCeuPessoal UMA vez
// sobre a lista inteira — que levanta as três listas de longitudes (natal,
// hoje, amanhã) uma única vez e as reaproveita em todos os itens. A tela não
// recalcula ângulo nenhum: ela mostra o que os dois motores devolveram, um a
// um, na ordem em que vieram.
//
// AS DUAS FONTES DIVERGEM, E ISSO APARECE. Ptolomeu (Tetrabiblos I.24, séc. II)
// define aplicação e separação por POSIÇÃO — "those which precede... apply to
// those which follow" —, o que só fecha com o planeta em marcha direta. Vétio
// Valente (Anthologiae IX.3, mesmo século) registra o caso que sobra: Júpiter
// retrógrado "is being carried towards the position of the Ascendant". O app
// segue Valente e mede o movimento, e o texto do pack diz isso na cara — é o
// bloco `divergencia` do chrome, mais a notaMarcha de cada leitura.
//
// i18n: NADA deste bloco passa por t(). O chrome sai do PACK do próprio módulo
// (lib/traducoes/transitoFase.{pt,es,en}.js, bloco `chrome`) e a leitura sai de
// fasesDoCeuPessoal(..., lang). A tela só repassa o `lang` do useLanguage() e
// não redige uma linha. O bloco se chama `chrome` e não `tela` porque `tela` já
// é o NOME da tela no idioma naquele pack.
//
// A ESCOLHA DE PACK ESTÁ AQUI POR RESTRIÇÃO DE FRENTE, NÃO POR DESENHO: o
// lugar certo dela é lib/transitoFase.js, num `chromeDaTela(lang)` igual ao de
// lib/idadeReal.js, e o motor é arquivo de outro agente nesta rodada. O
// integrador tem o trecho pronto nas notas — quando ele entrar, estas três
// importações viram uma só.
//
// PAYWALL: a mesma régua que a Home já aplica a personalSky — o encontro mais
// exato do dia é aberto, o resto vem com o plano. Nada de cadeado novo: usa o
// `liberado` que esta tela já calcula, e a parte grátis nunca some.
//
// STORAGE: zero. Este bloco não guarda nada; a data de nascimento vem de
// lib/birthData.js, que já é quem fala com o disco.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, AppState, Share, Platform, Image } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
// LinearGradient: só pro fallback do grid de arte (evento sem planeta único,
// tipo aspectoExato) — a faixa em gradients.card com o emoji do motor.
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
// A CENA ILUSTRADA (08/08/2026) — o hero desenhado do pack de arte
// (lib/ilustracoes.js, 640px), primeiro item do rolo, acima da intro.
// planetaImagem (08/08/2026, última rodada): planeta pintado 256px ou null,
// pra miniatura do card de evento — a cena-hero do topo fica intocada.
import { CENAS, planetaImagem } from '../lib/ilustracoes';
import { useLanguage } from '../context/LanguageContext';
// Lua Fora de Curso (kenodromia) — a utilidade diaria que o concorrente
// "Ajuda do Ceu" anuncia como produto principal. Aqui ela entra COM a
// divergencia das fontes: Antioco de Atenas (sec. II) e Porfirio (sec. III)
// definem o estado de formas diferentes, e o motor calcula as DUAS. O
// concorrente da um veredito seco; nos damos o veredito e de onde ele vem.
import { luaForaDeCurso } from '../lib/luaForaDeCurso';
import { useCouple } from '../context/CoupleContext';
import { funnel } from '../lib/funnel';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { localDayStr } from '../lib/localDay';
import { signByName } from '../lib/signs';
import { calendarioCosmico, MARCA_RECIBO } from '../lib/calendarioCosmico';
// A direção dos trânsitos de hoje sobre o mapa da pessoa (ver o bloco grande no
// topo). personalSky decide QUAIS aspectos estão em orbe; transitoFase decide
// para que LADO cada um está indo.
import { getAnyBirthData } from '../lib/birthData';
import { personalSkyToday } from '../lib/personalSky';
import { fasesDoCeuPessoal } from '../lib/transitoFase';
import { PACK as FASE_PACK_PT } from '../lib/traducoes/transitoFase.pt';
import { PACK as FASE_PACK_ES } from '../lib/traducoes/transitoFase.es';
import { PACK as FASE_PACK_EN } from '../lib/traducoes/transitoFase.en';

// A marca de "já gastou o passeio grátis por outros meses". Nome próprio, sem
// colidir com 'lunarCalendar' (que é a outra tela de calendário e tem cadeado
// próprio, das nove).
const FEATURE_KEY = 'calendarioCosmicoOutrosMeses';

// Os três packs do módulo da fase. O fallback é o MESMO de lib/transitoFase.js
// (idioma fora dos três cai no PT), copiado de propósito em uma linha só e
// destinado a sumir quando o motor ganhar `chromeDaTela(lang)` — ver o bloco
// grande no topo do arquivo.
const FASE_PACKS = { pt: FASE_PACK_PT, es: FASE_PACK_ES, en: FASE_PACK_EN };

// O mesmo recorte do card "Céu de hoje" da Home (personalSkyToday usa 3 por
// padrão): os encontros mais exatos do dia, já ordenados por camada de tempo.
const MAX_TRANSITOS = 3;

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
// FORMATO POR IDIOMA (01/08/2026). Antes toda data saia DD/MM e toda hora em
// 24h, nos tres idiomas — para um leitor em ingles "08/01" nao e 1o de agosto,
// e 8 de janeiro. Data ambigua e pior que data traduzida pela metade: ela nao
// parece errada, so esta.
//
// Intl faz o trabalho e ja vem no runtime (web e Hermes moderno). Se faltar,
// cai no formato PT de sempre — nunca inventa nem quebra a tela.
const LOCALE = { pt: 'pt-BR', es: 'es-419', en: 'en-US' };

function diaMesLocal(d, lang = 'pt') {
  try {
    return new Intl.DateTimeFormat(LOCALE[lang] || LOCALE.pt, { day: '2-digit', month: '2-digit' }).format(d);
  } catch {
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}`;
  }
}

function horaLocal(d, lang = 'pt') {
  try {
    // hour12 fica a cargo do locale: en-US da "6:45 AM", pt/es dao "06:45".
    return new Intl.DateTimeFormat(LOCALE[lang] || LOCALE.pt, { hour: '2-digit', minute: '2-digit' }).format(d);
  } catch {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
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

// TIPO DE EVENTO → PLANETA PINTADO (08/08/2026, última rodada de arte) — só
// onde a ligação é HONESTA: as quatro luas SÃO a Lua no céu, o ingresso solar
// É o Sol mudando de signo, o retrógrado É Mercúrio. `aspectoExato` fica de
// FORA de propósito: um aspecto envolve DOIS planetas, e ilustrar com um só
// seria mentir a metade — o emoji do motor continua contando essa história.
// As chaves são os `tipo` de lib/calendarioCosmico.js — dado INTERNO do motor,
// nunca input de cliente. [AUTO-DECISION] Por isso um Object.freeze normal
// serve, sem Object.create(null): nenhum texto digitado consulta este mapa, e
// planetaImagem() já filtra por hasOwnProperty — tipo desconhecido devolve
// undefined → null → sem imagem, card de sempre. O MESMO mapa existe em
// HomeScreen.js (a missão travou as mudanças nos 3 arquivos de tela; mudou lá,
// muda cá).
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
// O grid de arte dos eventos (09/08/2026)
// ---------------------------------------------------------------------------
// A lista do mês virou um grid de DUAS colunas de cards ilustrados, no padrão
// do concorrente: o planeta pintado domina o card (~104 de altura, cover), uma
// pill discreta com a contagem por cima e o título numa faixa embaixo. O card
// do grid é só a PORTA — mostra pouco de propósito. Tocar nele abre o
// EventoCard completo (parágrafo, recibo, ficha — TODO o conteúdo de sempre,
// na ordem de sempre), renderizado logo abaixo do PAR onde o card mora, pra
// expansão acontecer perto do dedo e não no fim do grid. A lei do quente
// primeiro segue valendo onde há leitura: o grid não mostra parágrafo nenhum,
// e o detalhe que abre continua travado por test/quentePrimeiroNasTelas.test.js
// (EventoCard não mudou uma linha).
//
// A contagem da pill compara a dataLocal do evento ('YYYY-MM-DD') com o dia
// local de hoje, os dois em meia-noite LOCAL — o Math.round come qualquer
// degrau de horário de verão no meio. Zero texto novo: 0/1/n usam as chaves
// home.eventos.hoje/amanha/dias que a Home já usa no card de countdown, e
// evento PASSADO do mês mostra a data curta (diaMesLocal, a mesma do card
// completo) em vez de contagem — nenhuma chave nova foi criada.
function diasAte(dataLocal, hojeISO) {
  const [y1, m1, d1] = String(dataLocal).split('-').map(Number);
  const [y2, m2, d2] = String(hojeISO).split('-').map(Number);
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return null;
  return Math.round((new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2)) / 86400000);
}

function EventoArteCard({ evento, hojeISO, selecionado, aberto, onPress }) {
  const { t, lang } = useLanguage();
  // O mesmo mapa honesto do card completo (PLANETA_DO_EVENTO): aspectoExato
  // não tem planeta único, então cai na faixa em gradiente com o emoji grande
  // do motor — a arte é upgrade, nunca dependência.
  const arte = planetaImagem(PLANETA_DO_EVENTO[evento.tipo]);
  const n = diasAte(evento.dataLocal, hojeISO);
  const pill =
    n === null || n < 0
      ? diaMesLocal(evento.data, lang)
      : n === 0
        ? t('home.eventos.hoje')
        : n === 1
          ? t('home.eventos.amanha')
          : t('home.eventos.dias', { n });

  return (
    <TouchableOpacity
      style={[styles.arteCard, selecionado && styles.arteCardSelecionado]}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ expanded: aberto }}
      accessibilityLabel={`${evento.titulo} — ${pill}`}
      testID={`calendario-arte-${evento.tipo}-${evento.diaLocal}`}
    >
      <View style={styles.arteTopo}>
        {arte ? (
          <Image source={arte} style={styles.arteImg} resizeMode="cover" accessible={false} />
        ) : (
          <LinearGradient colors={gradients.card} style={styles.arteFallback}>
            <Text style={styles.arteFallbackEmoji}>{evento.emoji}</Text>
          </LinearGradient>
        )}
        <View style={styles.artePill}>
          <Text style={styles.artePillTexto}>{pill}</Text>
        </View>
      </View>
      <View style={styles.arteRodape}>
        <Text style={styles.arteTitulo} numberOfLines={2}>
          {evento.titulo}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// O card de um evento — desde 09/08/2026, o DETALHE do grid de arte
// ---------------------------------------------------------------------------
// Ele não fica mais sempre visível na lista: renderiza quando um card do grid
// está aberto (eventoAberto), com o MESMO conteúdo na MESMA ordem de sempre —
// test/quentePrimeiroNasTelas.test.js segue travando o quente primeiro aqui.
// Tradição, fonte e aviso de idade ficam num bloco recolhido: um mês tem entre
// 4 e 20 eventos (test/calendarioCosmico.test.js), e vinte fichas completas
// abertas transformariam a lista num paredão que ninguém rola até o fim. O que
// fica SEMPRE visível é o que o dono pediu: título curto, data e o parágrafo —
// conversa em cima, recibo embaixo.
function EventoCard({ evento, selecionado, onLayout }) {
  const { t, lang } = useLanguage();
  const [aberto, setAberto] = useState(false);
  const { conversa, recibo } = partesDoParagrafo(evento.paragrafo);
  const ehInstante = evento.precisao === 'instante';
  const data = diaMesLocal(evento.data, lang);
  const temFicha = Boolean(evento.tradicao || evento.avisoDeIdade || evento.fonte);
  // O planeta pintado do evento, quando o tipo tem planeta honesto (mapa
  // acima). Null → a linha de identificação fica como sempre foi: só emoji,
  // nome e data. accessible={false}: decorativa — o título já nomeia o evento.
  const artePlaneta = planetaImagem(PLANETA_DO_EVENTO[evento.tipo]);

  return (
    <View
      style={[styles.evento, selecionado && styles.eventoSelecionado]}
      onLayout={onLayout}
      testID={`calendario-evento-${evento.tipo}-${evento.diaLocal}`}
    >
      {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — cada card abria por
          "🌑 Lua Nova · 05/08": nome do fenômeno e data, que é geometria, e só
          depois o parágrafo que explica o que está acontecendo no céu. O pack já
          escreve esse parágrafo abrindo pela cena ("A Lua sumiu do céu — e sumiu
          porque..."), então bastou reordenar: nenhuma palavra do pack mudou, e
          nenhum golden foi recapturado. A leitura abre, o recibo do parágrafo
          continua colado nela, e a linha de identificação (emoji, nome, data)
          desce para junto da nota de precisão — a ficha do card num lugar só.
          test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
      <Text style={styles.body}>{conversa}</Text>
      {recibo ? (
        <Text style={styles.recibo}>
          <Text style={styles.reciboMarca}>{t('calendario.event.receiptMark')}</Text> {recibo}
        </Text>
      ) : null}

      <View style={styles.eventoTopo}>
        {artePlaneta ? (
          <Image source={artePlaneta} style={styles.eventoPlaneta} resizeMode="cover" accessible={false} />
        ) : null}
        <Text style={styles.eventoEmoji}>{evento.emoji}</Text>
        <Text style={styles.eventoTitulo}>{evento.titulo}</Text>
        <Text style={styles.eventoQuando}>
          {ehInstante ? t('calendario.event.dateTime', { data, hora: horaLocal(evento.data, lang) }) : data}
        </Text>
      </View>

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

// ---------------------------------------------------------------------------
// O card de um encontro do céu de hoje com o mapa de nascimento
// ---------------------------------------------------------------------------
// Mesma forma do EventoCard acima e da tela da Idade Real: fechado mostra o
// essencial (quem × quem, o selo da direção e a linha única do motor); aberto
// mostra a leitura inteira, as ressalvas que andam com ela e o recibo.
//
// A tela não escolhe UMA palavra: `UI` é o bloco `chrome` do pack e `leitura` é
// o que fasesDoCeuPessoal devolveu. Quando a leitura vem indisponível (sem data
// de nascimento, sem efeméride, ou aspecto à Lua natal sem hora — a recusa
// medida do módulo), o card mostra o que falta e ONDE resolver, e não desenha
// selo, verbo nem botão de compartilhar: não há fase para compartilhar.
function FaseCard({ leitura, UI, aberto, onAlternar, onCompartilhar }) {
  const disponivel = leitura.disponivel;
  const titulo = leitura.transitoRotulo && leitura.natalRotulo ? UI.tituloDoCard(leitura) : null;
  const subtitulo = UI.subtituloDoCard(leitura);
  const selo = disponivel ? UI.selo[leitura.fase] : null;

  return (
    <View style={styles.faseCard} testID={`calendario-fase-card-${leitura.transito || 'sem'}-${leitura.natal || 'sem'}`}>
      <TouchableOpacity
        style={styles.faseTopo}
        activeOpacity={0.85}
        onPress={onAlternar}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={titulo || UI.titulo}
        accessibilityHint={aberto ? UI.fechar : UI.abrir}
      >
        <View style={styles.faseTopoTexto}>
          {titulo ? <Text style={styles.faseTitulo}>{titulo}</Text> : null}
          {subtitulo ? <Text style={styles.faseSubtitulo}>{subtitulo}</Text> : null}
        </View>
        {selo ? (
          <Text style={styles.faseSelo} testID={`calendario-fase-selo-${leitura.fase}`}>
            {selo}
          </Text>
        ) : null}
        <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textMuted} />
      </TouchableOpacity>

      {/* A linha única do motor: é o verbo, e é o que a Home não conseguia
          dizer. Sem leitura disponível, entra no lugar dela o que falta. */}
      <Text style={disponivel ? styles.faseLinha : styles.body}>
        {disponivel ? leitura.linhaCurta : leitura.leitura}
      </Text>
      {!disponivel && leitura.comoResolver ? (
        <Text style={styles.faseComoResolver}>{leitura.comoResolver}</Text>
      ) : null}

      {aberto && disponivel ? (
        <View style={styles.faseCorpo}>
          <View style={styles.divisor}>
            <View style={styles.divisorLinha} />
            <Text style={styles.divisorEstrela}>✦</Text>
            <View style={styles.divisorLinha} />
          </View>

          {/* Prende primeiro: a chamada abre na vida real, sem nome próprio e
              sem século. O recibo vem depois, dentro da leitura. */}
          <Text style={styles.body}>{leitura.chamada}</Text>
          <Text style={styles.body}>{leitura.leitura}</Text>

          {/* A marcha de hoje — é aqui que a divergência entre as duas fontes
              do séc. II aparece no caso concreto do planeta retrógrado. */}
          <Text style={styles.note}>{leitura.notaMarcha}</Text>
          {leitura.notaHorizonte ? <Text style={styles.note}>{leitura.notaHorizonte}</Text> : null}

          <View style={styles.faseRecibo}>
            <Text style={styles.fichaLabel}>{UI.rotuloRecibo}</Text>
            {leitura.fonte.map((f, i) => (
              <Text key={i} style={styles.source}>
                {f}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.shareBtn}
            activeOpacity={0.85}
            onPress={onCompartilhar}
            accessibilityRole="button"
            accessibilityLabel={UI.compartilhar}
            testID="calendario-fase-share"
          >
            <Ionicons name="logo-whatsapp" size={16} color="#fff" />
            <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
          </TouchableOpacity>

          <Text style={styles.marca}>{UI.marca}</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function CalendarioCosmicoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t, lang } = useLanguage();
  const { hasAccess, accessConfirmed, isOwnerAccount } = useCouple();

  // Mesmo cuidado de screens/LunarCalendarScreen.js: a tela fica montada dentro
  // da stack da aba, então "hoje" precisa ser recalculado ao reganhar foco e ao
  // voltar do segundo plano — senão o app aberto de um dia pro outro continua
  // destacando o dia de ontem, e na virada do mês mostraria o mês errado.
  const [tique, setTique] = useState(0);
  const [offset, setOffset] = useState(0);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  // O card do grid aberto em detalhe, chaveado por `${tipo}-${dataISO}` (a
  // mesma chave da lista de sempre) — ver o bloco do grid de arte lá em cima.
  // Navegar de mês fecha; trocar idioma preserva (a chave não tem idioma).
  const [eventoAberto, setEventoAberto] = useState(null);
  const [passeioGasto, setPasseioGasto] = useState(false);
  const [ofertaVisivel, setOfertaVisivel] = useState(false);

  // Bloco da fase (aplicativo × separativo). `undefined` = ainda carregando o
  // nascimento; `null` = sem data salva (vira convite pro Mapa Astral).
  const [nascimento, setNascimento] = useState(undefined);
  const [faseAberta, setFaseAberta] = useState(null);
  const [faseReciboAberto, setFaseReciboAberto] = useState(false);
  const [faseRecado, setFaseRecado] = useState(null);

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

  // O motor cacheia por `${ano}-${mes}-${idioma}` (138 ms na primeira conta
  // de um mês, ~52 ms depois), então o useMemo aqui é só pra não recalcular a
  // cada re-render de estado local. O `lang` entra nas dependências: trocar o
  // idioma do app troca o texto dos eventos.
  const resultado = useMemo(() => calendarioCosmico(ano, mes, lang), [ano, mes, lang]);
  const eventos = resultado.eventos;

  // A TEMPORADA CORRENTE, tirada do MESMO evento de ingresso que a lista
  // mostra (ver o cabeçalho, "por que celestialSeasons não é consumido aqui").
  // Sai sempre do mês de HOJE, mesmo com a grade navegada pra outro mês — é um
  // "onde o Sol está agora", não uma propriedade do mês exibido. Custo zero no
  // caso comum: é a mesma chave de cache do mês que abre por padrão.
  const temporada = useMemo(() => {
    const mesDeHoje = calendarioCosmico(agora.getFullYear(), agora.getMonth() + 1, lang);
    if (!mesDeHoje.ceuDisponivel) return null;
    const ingressos = mesDeHoje.eventos.filter((e) => e.tipo === 'ingressoSolar');
    if (ingressos.length === 0) return null;
    const jaPassaram = ingressos.filter((e) => e.data.getTime() <= agora.getTime());
    // `signo`/`outro` seguem CANÔNICOS (chave de signByName); os campos
    // *Display são o rótulo no idioma do app, que é o que se interpola em
    // 'calendario.season.*'. Em PT os dois coincidem.
    if (jaPassaram.length > 0) {
      const ultimo = jaPassaram[jaPassaram.length - 1];
      return {
        fase: 'comecou',
        signo: ultimo.detalhe.signoNovo,
        signoDisplay: ultimo.detalhe.signoNovoDisplay || ultimo.detalhe.signoNovo,
        outro: ultimo.detalhe.signoAnterior,
        outroDisplay: ultimo.detalhe.signoAnteriorDisplay || ultimo.detalhe.signoAnterior,
        quando: ultimo.data,
      };
    }
    const proximo = ingressos[0];
    return {
      fase: 'termina',
      signo: proximo.detalhe.signoAnterior,
      signoDisplay: proximo.detalhe.signoAnteriorDisplay || proximo.detalhe.signoAnterior,
      outro: proximo.detalhe.signoNovo,
      outroDisplay: proximo.detalhe.signoNovoDisplay || proximo.detalhe.signoNovo,
      quando: proximo.data,
    };
  }, [agora, lang]);

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

  // Os eventos do mês em PARES, pro grid de duas colunas (ver o bloco do grid
  // de arte no topo). Mês com contagem ímpar fecha com um espaçador flex na
  // última linha — o card solitário não estica a largura toda.
  const paresDeEventos = useMemo(() => {
    const pares = [];
    for (let i = 0; i < eventos.length; i += 2) pares.push(eventos.slice(i, i + 2));
    return pares;
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
      setEventoAberto(null);
      setOfertaVisivel(false);
      setOffset(destino);
    },
    [offset, liberado, passeioGasto, route]
  );

  const voltarPraHoje = useCallback(() => {
    posicoesRef.current = {};
    setDiaSelecionado(null);
    setEventoAberto(null);
    setOfertaVisivel(false);
    setOffset(0);
  }, []);

  // Tocar num dia marcado leva até o card dele. É o que faz a grade valer a
  // pena: a pessoa vê o 🌕 no dia 29 e quer saber o que é, sem rolar caçando.
  // Com o grid de arte, rolar até um card que só repete título não responde
  // "o que é" — então tocar no dia também ABRE o detalhe do primeiro evento
  // dele, que renderiza colado no par.
  const abrirDia = useCallback(
    (iso) => {
      setDiaSelecionado(iso);
      const primeiro = (porDia.get(iso) || [])[0];
      if (primeiro) setEventoAberto(`${primeiro.tipo}-${primeiro.dataISO}`);
      const y = primeiro ? posicoesRef.current[primeiro.dataISO] : undefined;
      if (typeof y === 'number' && scrollRef.current && scrollRef.current.scrollTo) {
        scrollRef.current.scrollTo({ y: Math.max(y - 12, 0), animated: true });
      }
    },
    [porDia]
  );

  const rotuloMes = t('calendario.monthLabel', { mes: t(MES_KEYS[mes - 1]), ano });
  const emojiTemporada = temporada ? (signByName(temporada.signo) || {}).emoji : null;

  // Lua Fora de Curso de AGORA. Depende do dia local e do idioma; o motor
  // devolve disponivel:false sem efemeride e a tela simplesmente nao renderiza
  // — nunca chuta um estado que muda de hora em hora.
  const vocEstado = useMemo(() => {
    try {
      // Os TRÊS argumentos, na ordem: (quando, definicao, lang). Passar
      // `lang` no 2º slot — que era o que estava aqui — não dava erro nenhum:
      // 'es' não está em DEFINICOES, então caía em 'moderna' calado, e `lang`
      // ficava no default 'pt'. O gringo lia "Lua fora de curso" em português.
      // A suíte não pegava porque os testes chamam com os três certos.
      return luaForaDeCurso(new Date(), 'moderna', lang);
    } catch {
      return null;
    }
  }, [lang, hojeISO]);

  // ---------------------------------------------------------------------------
  // A DIREÇÃO DOS ENCONTROS DE HOJE — ver o bloco grande no topo do arquivo
  // ---------------------------------------------------------------------------
  // Recarrega no foco, como a Home: a pessoa pode ter acabado de preencher o
  // nascimento no Mapa Astral e voltado pra cá.
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      getAnyBirthData().then((b) => {
        if (vivo) setNascimento(b || null);
      });
      return () => {
        vivo = false;
      };
    }, [])
  );

  const FASE_UI = (FASE_PACKS[lang] || FASE_PACKS.pt).chrome;

  // UMA chamada de personalSkyToday (quais aspectos estão em orbe) e UMA de
  // fasesDoCeuPessoal (para que lado cada um vai) — esta segunda levanta as
  // três listas de longitudes uma vez só e as reaproveita item a item. O
  // `hojeISO` entra nas dependências para a lista virar sozinha na virada do
  // dia, junto com o resto da tela.
  const fases = useMemo(() => {
    if (nascimento === undefined) return undefined; // ainda lendo o disco
    if (!nascimento || !nascimento.date) return null; // sem data: vira convite
    try {
      const aspectos = personalSkyToday(nascimento, MAX_TRANSITOS, lang);
      // `null` aqui é motor de efeméride indisponível, não dia sem encontro —
      // e as duas coisas não podem sair com o mesmo texto. Nesse caso o bloco
      // inteiro não desenha: o card de indisponibilidade da lista abaixo já
      // explica que o céu não pôde ser calculado, e dizer "hoje não há
      // encontro" seria afirmar uma coisa que ninguém mediu.
      if (!Array.isArray(aspectos)) return undefined;
      if (aspectos.length === 0) return [];
      const leituras = fasesDoCeuPessoal(aspectos, nascimento, lang);
      return Array.isArray(leituras) ? leituras : undefined;
    } catch {
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nascimento, lang, hojeISO]);

  // A régua da Home aplicada aqui: o encontro mais exato é aberto, o resto vem
  // com o plano. Assinante e dono veem a lista inteira.
  const fasesVisiveis = useMemo(() => {
    if (!Array.isArray(fases)) return [];
    return liberado ? fases : fases.slice(0, 1);
  }, [fases, liberado]);

  const fasesTrancadas = useMemo(() => {
    if (!Array.isArray(fases) || liberado) return [];
    return fases.slice(1).filter((r) => r.transitoRotulo && r.natalRotulo);
  }, [fases, liberado]);

  // O recibo da seção sai da PRIMEIRA leitura: as ressalvas, os verbatins e a
  // bibliografia são os mesmos em todas elas (vêm do pack, não do aspecto), e
  // repeti-los card a card seria paredão.
  const faseBase = Array.isArray(fases) && fases.length > 0 ? fases[0] : null;

  const compartilharFase = useCallback(
    async (leitura) => {
      const texto = FASE_UI.textoCompartilhavel(leitura);
      if (!texto) return;
      setFaseRecado(null);
      const temFolhaWeb =
        Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.share === 'function';
      if (Platform.OS !== 'web' || temFolhaWeb) {
        try {
          await Share.share({ message: texto });
        } catch {
          // Cancelou ou a folha falhou: silêncio, como nas outras telas que
          // compartilham (MitosScreen, RituaisScreen, IdadeRealScreen).
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
      setFaseRecado(copiou ? FASE_UI.copiado : FASE_UI.naoCopiou);
    },
    [FASE_UI]
  );

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
        {/* A CENA DO PLANETA (08/08/2026) — hero (CENAS.planeta) no topo do
            rolo, acima da intro: 150 de altura (o piso do padrão) porque a
            grade do mês é o conteúdo funcional mais próximo da dobra e não
            pode descer mais que isso. accessible={false}: é cenário, não
            informação. */}
        <View style={styles.cenaWrap}>
          <Image source={CENAS.planeta} style={styles.cenaImg} resizeMode="cover" accessible={false} />
        </View>

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
        {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — o gancho deste bloco
            estava na QUARTA linha: "A gente ouve 'temporada de Leão' o ano
            inteiro e ninguém diz o que é. É isto: ...". Antes dele vinham o
            título e a data de ingresso — a resposta impressa em cima da
            pergunta que faz alguém querer lê-la. A nota sobe para logo depois do
            kicker; título e datas descem e viram o recibo que a própria nota
            promete ("sai da mesma conta que marca o ingresso na lista aqui
            embaixo"). Nenhuma palavra do pack mudou.
            test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
        {temporada ? (
          <View style={styles.temporada} testID="calendario-temporada">
            <Text style={styles.kicker}>{t('calendario.season.kicker')}</Text>
            <Text style={styles.body}>{t('calendario.season.note')}</Text>
            <Text style={styles.temporadaTitulo}>
              {emojiTemporada ? `${emojiTemporada} ` : ''}
              {t('calendario.season.title', { signo: temporada.signoDisplay })}
            </Text>
            <Text style={styles.temporadaQuando}>
              {temporada.fase === 'comecou'
                ? t('calendario.season.startedAt', {
                    data: diaMesLocal(temporada.quando, lang),
                    anterior: temporada.outroDisplay,
                  })
                : t('calendario.season.endsAt', {
                    data: diaMesLocal(temporada.quando, lang),
                    proximo: temporada.outroDisplay,
                  })}
            </Text>
          </View>
        ) : null}

        {/* ---- Lua Fora de Curso: o estado de AGORA ---- */}
        {vocEstado && vocEstado.disponivel ? (
          <View style={styles.temporada} testID="calendario-voc">
            <Text style={styles.kicker}>{vocEstado.termo}</Text>
            <Text style={styles.body}>{vocEstado.textos.abertura}</Text>
            {!!vocEstado.textos.estado && <Text style={styles.body}>{vocEstado.textos.estado}</Text>}
            {/* A divergencia so aparece quando as duas reguas DISCORDAM — e
                nesse dia ela e a informacao mais interessante da tela, nao
                uma nota de rodape. */}
            {vocEstado.divergem && !!vocEstado.textos.divergencia && (
              <Text style={styles.body}>{vocEstado.textos.divergencia}</Text>
            )}
            {!!vocEstado.textos.recibo && <Text style={styles.temporadaQuando}>{vocEstado.textos.recibo}</Text>}
          </View>
        ) : null}

        {/* ---- APLICATIVO × SEPARATIVO: a direção dos encontros de hoje ---- */}
        {fases === undefined ? null : (
          <View style={styles.faseBloco} testID="calendario-fase">
            <Text style={styles.kicker}>{FASE_UI.kicker}</Text>
            <Text style={styles.faseBlocoTitulo}>{FASE_UI.titulo}</Text>
            {/* Prende primeiro: dois parágrafos de vida real e só depois o
                recibo com a divergência das duas fontes. */}
            <Text style={styles.body}>{FASE_UI.intro}</Text>
            <Text style={styles.body}>{FASE_UI.porQue}</Text>
            <Text style={styles.source}>{FASE_UI.divergencia}</Text>

            {fases === null ? (
              // NUNCA FABRICA MAPA: sem data de nascimento não há o que
              // comparar, e o app diz onde informá-la.
              <View testID="calendario-fase-convite">
                <Text style={styles.body}>{FASE_UI.semNascimento.texto}</Text>
                <TouchableOpacity
                  style={styles.faseCta}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate(ROUTES.BIRTH_CHART)}
                  accessibilityRole="button"
                  testID="calendario-fase-cta-nascimento"
                >
                  <Ionicons name="telescope" size={14} color={colors.teal} />
                  <Text style={styles.faseCtaTexto}>{FASE_UI.semNascimento.cta}</Text>
                </TouchableOpacity>
              </View>
            ) : fases.length === 0 ? (
              <Text style={styles.note} testID="calendario-fase-vazio">
                {FASE_UI.semAspectos}
              </Text>
            ) : (
              <>
                <Text style={styles.fichaLabel}>{FASE_UI.rotuloLista}</Text>

                {fasesVisiveis.map((leitura, i) => {
                  const chave = `${leitura.transito || 'x'}-${leitura.natal || 'x'}-${leitura.aspecto || i}`;
                  return (
                    <FaseCard
                      key={chave}
                      leitura={leitura}
                      UI={FASE_UI}
                      aberto={faseAberta === chave}
                      onAlternar={() => {
                        setFaseRecado(null);
                        setFaseAberta((atual) => (atual === chave ? null : chave));
                      }}
                      onCompartilhar={() => compartilharFase(leitura)}
                    />
                  );
                })}

                {faseRecado ? <Text style={styles.note}>{faseRecado}</Text> : null}

                {/* O resto do céu de hoje: mostra QUEM está lá, guarda a
                    direção e a leitura para a assinatura. */}
                {fasesTrancadas.length > 0 ? (
                  <View style={styles.oferta} testID="calendario-fase-oferta">
                    <View style={styles.ofertaTopo}>
                      <Ionicons name="lock-closed" size={18} color={colors.gold} />
                      <Text style={styles.ofertaTitulo}>{FASE_UI.bloqueado.titulo}</Text>
                    </View>
                    <Text style={styles.body}>{FASE_UI.bloqueado.texto}</Text>
                    {fasesTrancadas.map((leitura, i) => (
                      <Text key={i} style={styles.source}>
                        {FASE_UI.tituloDoCard(leitura)}
                      </Text>
                    ))}
                    <TouchableOpacity
                      style={styles.ofertaBtn}
                      activeOpacity={0.85}
                      onPress={() => {
                        funnel.paywallView('calendario_fase_transito', route?.name);
                        navigation.navigate(ROUTES.PLANOS);
                      }}
                      accessibilityRole="button"
                      testID="calendario-fase-oferta-cta"
                    >
                      <Text style={styles.ofertaBtnText}>{FASE_UI.bloqueado.cta}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* O recibo da seção: o que é conta e o que é leitura, o orbe
                    de quem é, o que o prazo não é — e as fontes palavra por
                    palavra, com a divergência entre as duas do séc. II. */}
                {faseBase ? (
                  <>
                    <TouchableOpacity
                      style={styles.toggleRow}
                      activeOpacity={0.7}
                      onPress={() => setFaseReciboAberto((v) => !v)}
                      accessibilityRole="button"
                      accessibilityState={{ expanded: faseReciboAberto }}
                      accessibilityLabel={FASE_UI.rotuloVerbatim}
                      testID="calendario-fase-recibo-toggle"
                    >
                      <Text style={styles.toggleText}>{FASE_UI.rotuloVerbatim}</Text>
                      <Ionicons
                        name={faseReciboAberto ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.textMuted}
                      />
                    </TouchableOpacity>

                    {faseReciboAberto ? (
                      <View style={styles.ficha} testID="calendario-fase-recibo">
                        {faseBase.verbatins.map((v, i) => (
                          <View key={i} style={styles.verbatim}>
                            <Text style={styles.verbatimTexto}>“{v.texto}”</Text>
                            <Text style={styles.note}>{v.parafrase}</Text>
                            <Text style={styles.source}>{v.locus}</Text>
                          </View>
                        ))}
                        <Text style={styles.fichaLabel}>{FASE_UI.rotuloNotas}</Text>
                        <Text style={styles.note}>{faseBase.notaLeituraDoApp}</Text>
                        <Text style={styles.note}>{faseBase.notaOrbe}</Text>
                        <Text style={styles.note}>{faseBase.notaDataDeEvento}</Text>
                      </View>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </View>
        )}

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
            {paresDeEventos.map((par) => {
              const abertoNoPar = par.find((e) => `${e.tipo}-${e.dataISO}` === eventoAberto) || null;
              return (
                <React.Fragment key={`${par[0].tipo}-${par[0].dataISO}`}>
                  <View
                    style={styles.arteLinha}
                    onLayout={(e) => {
                      // y relativo ao contentContainer — as LINHAS do grid são
                      // filhas diretas do ScrollView, então serve direto pro
                      // scrollTo; os dois eventos do par apontam pro mesmo y.
                      const y = e.nativeEvent.layout.y;
                      for (const ev of par) posicoesRef.current[ev.dataISO] = y;
                    }}
                  >
                    {par.map((evento) => {
                      const chave = `${evento.tipo}-${evento.dataISO}`;
                      return (
                        <EventoArteCard
                          key={chave}
                          evento={evento}
                          hojeISO={hojeISO}
                          selecionado={evento.dataLocal === diaSelecionado}
                          aberto={chave === eventoAberto}
                          onPress={() => setEventoAberto((atual) => (atual === chave ? null : chave))}
                        />
                      );
                    })}
                    {par.length === 1 ? <View style={styles.arteVazio} /> : null}
                  </View>
                  {/* O detalhe abre COLADO no par do card tocado, não no fim
                      do grid. É o EventoCard de sempre — parágrafo, recibo e
                      ficha, conteúdo e ordem interna intactos. */}
                  {abertoNoPar ? (
                    <EventoCard evento={abertoNoPar} selecionado={abertoNoPar.dataLocal === diaSelecionado} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  // A cena ilustrada do topo — o gap:12 do scroll já dá o respiro.
  cenaWrap: { borderRadius: 18, overflow: 'hidden' },
  cenaImg: { width: '100%', height: 150 },

  // COMPOSIÇÃO CENTRADA (08/08/2026): a intro vem logo abaixo da cena-hero do
  // planeta e lê como subtítulo dele — centrada, como no padrão do concorrente.
  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center' },

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

  // COMPOSIÇÃO CENTRADA (08/08/2026): título de seção grande e centrado, com
  // muito ar em cima — o padrão do concorrente premium (22/800, simétrico). A
  // contagem acompanha o título centrado, como subtítulo da seção.
  listaTitulo: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', alignSelf: 'center', marginTop: 34, marginBottom: 14, letterSpacing: 0.2 },
  listaContagem: { color: colors.textMuted, fontSize: 12, marginTop: -14, textAlign: 'center', alignSelf: 'center' },

  // ---- O grid de arte dos eventos (09/08/2026) ----
  // Linha = par de cards; align 'stretch' (default de row) iguala as alturas
  // do par mesmo com títulos de 1 e 2 linhas.
  arteLinha: { flexDirection: 'row', gap: 12 },
  arteVazio: { flex: 1 },
  arteCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  arteCardSelecionado: { borderColor: colors.purple },
  arteTopo: { width: '100%', height: 104 },
  arteImg: { width: '100%', height: '100%' },
  arteFallback: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  arteFallbackEmoji: { fontSize: 40 },
  artePill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(14,8,33,0.72)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  artePillTexto: { color: colors.text, fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
  arteRodape: { paddingHorizontal: 10, paddingVertical: 10, flexGrow: 1, justifyContent: 'center' },
  arteTitulo: { color: colors.text, fontSize: 14, fontWeight: '800', lineHeight: 18 },

  evento: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  eventoSelecionado: { borderColor: colors.purple },
  // A linha de identificação do evento desceu para depois do parágrafo (a
  // leitura abre), então ela ganhou o fio de cima que todo recibo tem aqui.
  eventoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  eventoEmoji: { fontSize: 20 },
  // O planeta pintado da linha de identificação (08/08/2026): entra ANTES do
  // emoji quando o tipo tem planeta honesto; o gap do eventoTopo já espaça.
  eventoPlaneta: { width: 30, height: 30, borderRadius: 15 },
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

  // ---- Aplicativo × separativo ----
  faseBloco: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  faseBlocoTitulo: { color: colors.gold, fontSize: 18, fontWeight: '800' },
  faseCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 8,
  },
  faseTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  faseTopoTexto: { flex: 1, gap: 2 },
  faseTitulo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  faseSubtitulo: { color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  faseSelo: {
    color: colors.teal,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  faseLinha: { color: colors.text, fontSize: 14, lineHeight: 21, fontWeight: '600' },
  faseComoResolver: { color: colors.teal, fontSize: 13, lineHeight: 19, fontWeight: '700' },
  faseCorpo: { gap: 10, marginTop: 2 },
  faseCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 8,
  },
  faseCtaTexto: { color: colors.teal, fontSize: 13, fontWeight: '800' },
  faseRecibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  divisorEstrela: { color: colors.purple, fontSize: 12 },
  verbatim: { gap: 4, marginBottom: 6 },
  verbatimTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  shareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },
  marca: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },

  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  recibo: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  // O rótulo do recibo, agora traduzido — negrito só pra ele continuar sendo
  // lido como rótulo e não como começo da frase.
  reciboMarca: { color: colors.textMuted, fontWeight: '800' },
  note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  noteStrong: { color: colors.gold, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  source: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
});
