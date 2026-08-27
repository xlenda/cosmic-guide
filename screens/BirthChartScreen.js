import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Share, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
// O CENÁRIO CÓSMICO (08/08/2026) — primeiro filho do root, atrás de tudo; o
// root mantém colors.background por baixo (ver o cabeçalho do componente).
import CosmicScene from '../components/CosmicScene';
// A colina que separa o bloco FLUTUANTE (trio + elementos, sem caixa) da
// terra dos cards (posições, seita, casas...) — ver o cabeçalho do componente.
import WaveDivider from '../components/WaveDivider';
// DIAGRAMAÇÃO ESPELHO (09/08/2026): a fileira de pílulas flutuante do
// concorrente premium — uma seção por vez, escolhida logo acima do dock.
// Renderizada no ROOT da tela (depois do ScrollView na árvore), nunca dentro
// do rolo — ver o cabeçalho do componente.
import PillTabs from '../components/PillTabs';
import DatePickerModal from '../components/DatePickerModal';
import CityPickerModal from '../components/CityPickerModal';
import { signoFromDate, moonSign, ascendantSign, houses, aspects, astrocartographyCities } from '../lib/signs';
// MASCOTES (08/08/2026) — o pack de ilustração (ver lib/ilustracoes.js): os
// medalhões do trio trocam o glifo de fonte pelo personagem do signo. A regra
// do registro vale aqui: mascoteDoSigno() devolve o asset ou null, e null →
// glifo de sempre. A arte é upgrade, nunca dependência.
// elementoImagem (08/08/2026, última rodada): mesmo contrato pros 4 círculos
// de elemento — espírito pintado ou o emoji de sempre.
import { mascoteDoSigno, elementoImagem } from '../lib/ilustracoes';
import { cityLabel, upgradeCityTimezone } from '../lib/cities';
import { offsetHoursFor, formatOffset } from '../lib/timezone';
import { getBirthData } from '../lib/coupleData';
import { nomeDoSigno } from '../lib/synastry';
import { rotuloDoAspecto, rotuloDoPlaneta } from '../lib/transitoFase';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
// ===========================================================================
// SEITA (hairesis) — LEIA lib/seita.js ANTES DE MEXER EM QUALQUER TEXTO DAQUI
// ===========================================================================
// O que e: o Sol estava ACIMA ou ABAIXO do horizonte no instante do
// nascimento. E um booleano, e e — em Ptolomeu (Tetrabiblos I.7) e em Valente
// (Anthologiae I.1), os dois do sec. II — o principal modulador de tudo o
// mais: um Saturno de mapa diurno e um Saturno de mapa noturno nao se leem
// igual.
//
// POR QUE E SECAO E NAO TELA. A seita nao e uma leitura a parte: e uma
// PROPRIEDADE do mapa que esta tela ja calcula, e uma chave de leitura dos
// planetas que a tela ja mostra logo acima. Tela propria a transformaria em
// mais um item de menu, desligado do Sol e da Lua que ela reenquadra. Por isso
// ela entra depois dos planetas e antes das Casas — enquanto Sol, Lua e
// Ascendente ainda estao na memoria de quem le — e por isso a linha de cada
// planeta (linhaDeSeita) fica pendurada NA PROPRIA linha do Sol e da Lua.
//
// SEM HORA OU SEM CIDADE, DECLARA INDISPONIVEL. O motor nunca chuta: meio-dia
// e meia-noite do mesmo dia dao seitas OPOSTAS, entao aqui nao existe o
// "chuta meio-dia" que a Lua se permite. A secao mostra o que falta e onde
// resolver, com o texto do proprio pack.
//
// O CASO LIMITROFE APARECE, NAO SOME. Dentro de LIMIAR_LIMITROFE_GRAUS (3
// graus do horizonte, escolha declarada deste app e nao regra antiga) alguns
// minutos de relogio trocam o resultado inteiro. Nessa faixa o aviso fica no
// card FECHADO, junto do resultado — esconder a duvida dentro do acordeao
// seria mostrar so a parte bonita da conta.
//
// CARD FECHADO x ABERTO: a leitura inteira sao ~10 blocos (explicacao, os sete
// planeta a planeta, Mercurio, duas ressalvas, cinco citacoes verbatim e seis
// fontes). Aberto de cara, vira um paredao no meio do Mapa Astral. Fechado,
// mostra o essencial de um print — o que deu, e a duvida quando ha duvida.
//
// i18n: NADA DAQUI PASSA POR t(). O chrome sai do bloco `chrome` dos packs
// (lib/traducoes/seita.{pt,es,en}.js) e o conteudo sai de seitaDoMapa(...,
// lang) e linhaDeSeita(..., lang). Esta secao so repassa o `lang` do
// useLanguage() e nao redige uma linha: se faltar texto, ele nasce no pack,
// nos tres idiomas, nunca dentro deste componente.
import { seitaDoMapa, linhaDeSeita } from '../lib/seita';
import { PACK as SEITA_PACK_PT } from '../lib/traducoes/seita.pt.js';
import { PACK as SEITA_PACK_ES } from '../lib/traducoes/seita.es.js';
import { PACK as SEITA_PACK_EN } from '../lib/traducoes/seita.en.js';
// Profeccoes anuais — a tecnica preditiva mais bem documentada da tradicao
// helenistica, e que praticamente nenhum app popular tem. Precisa APENAS da
// data de nascimento (fica melhor com hora), entao entrega valor pra quem so
// preencheu o minimo — ao contrario da Seita, que exige hora e cidade.
import { profeccaoAnual } from '../lib/profeccoes';
// Elementos com % — aritmética pura sobre planetPositions (10 planetas, % =
// contagem × 10, soma sempre 100). Null sem data/motor → a seção nem aparece.
import { distribuicaoDeElementos } from '../lib/elementos';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { saveSoloBirthMirror, readSecureItemWithMirror, writeSecureItemWithMirror } from '../lib/birthData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OneTimeLock from '../components/OneTimeLock';
import { ROUTES } from '../routes';

const FEATURE_KEY = 'birthchart';
const DIARY_RECORDED_KEY = 'cosmic-birthchart-diary-date';

function todayISODiary() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Reaproveita as mesmas cores/glyphs de theme.js (zodiacSigns) para exibir um
// nome de signo vindo de lib/signs.js — os nomes batem 1:1 nas duas listas
// (ex.: "Áries"), só o shape do objeto é diferente (lib/signs.js não tem
// .color/.icon), então este helper faz a ponte sem duplicar dados.
function displaySign(name, lang = 'pt') {
  if (!name) return null;
  const meta = zodiacSigns.find((z) => z.name === name);
  return { name, label: nomeDoSigno(name, lang), glyph: meta ? meta.icon : '', color: meta ? meta.color : colors.textMuted };
}

// Monta o mapa real (Sol/Lua/Ascendente/Casas/Aspectos/Astrocartografia) a
// partir de data/hora/cidade — nunca fabrica: Sol e Lua só exigem data (Lua
// usa meio-dia como aproximação quando falta hora, comportamento já embutido
// em moonSign); Ascendente e Casas exigem data + hora + cidade reais (mesma
// exigência, já que Casas Inteiras vêm do grau exato do Ascendente); Aspectos
// só exige data (mesma aproximação de meio-dia da Lua quando falta hora);
// Astrocartografia exige data + hora + cidade (o fuso da cidade de nascimento
// é o que converte a hora local pro instante UTC exato, indispensável pro
// cálculo) — sem essas exigências, as funções de lib/signs.js já devolvem
// null sozinhas.
//
// FUSO: repare que o 5º argumento agora é a CIDADE INTEIRA, não `city.utcOffset`.
// lib/signs.js aceita as duas coisas (ver offsetHorasDe lá) e prefere o fuso
// IANA `city.timezone`, que resolve o HORÁRIO DE VERÃO do instante exato de
// nascimento. Cidade salva antes desta versão não tem `timezone` — nesse caso
// signs.js cai sozinho no `city.utcOffset` de sempre, e o mapa de quem já
// existia continua idêntico ao que ele viu ontem. Por que isso importa: o
// Brasil teve horário de verão até 2019, e varrendo um dia de janeiro em São
// Paulo, 120 de 240 combinações data×hora MUDAM DE SIGNO entre -3 e -2.
function buildChart(date, time, city, lang = 'pt') {
  if (!date) return null;
  const sun = displaySign(signoFromDate(date), lang);
  // 3º argumento = a cidade, pelo mesmo motivo do 5º do Ascendente: sem ele,
  // moonSign/aspects liam a hora da maternidade como se fosse UTC e o mapa
  // ficava com DOIS instantes de nascimento (Ascendente às 04:00Z, Lua às
  // 02:00Z). Medido: 5,15% das Luas natais de São Paulo saíam com o signo
  // errado (16,6% em Tóquio, 22,6% em Auckland) e 43,9% das listas de aspectos
  // mudavam. `city` nulo mantém o comportamento antigo, sem fuso.
  const moon = displaySign(moonSign(date, time, city || undefined)?.name, lang);
  const asc = time && city ? displaySign(ascendantSign(date, time, city.lat, city.lon, city)?.name, lang) : null;
  const housesList = time && city ? houses(date, time, city.lat, city.lon, city) : null;
  const aspectsList = aspects(date, time, city || undefined);
  const astro = time && city ? astrocartographyCities(date, time, city) : null;
  // A seita depende de hora + cidade (precisa do Sol em relacao ao horizonte),
  // e o proprio motor declara o que falta quando nao da — nunca chuta.
  const seita = seitaDoMapa(date, time, city || undefined, lang);
  // A profecção anda um signo por ano de vida a partir do Ascendente — e cai
  // pro Sol só quando não há hora, declarando qual usou.
  //
  // PASSAR O NASCIMENTO INTEIRO IMPORTA (corrigido em 01/08/2026): antes ia só
  // `date`, então normalizarNascimento zerava hora e cidade e o motor caía no
  // Sol SEMPRE, mesmo pra quem já tinha preenchido tudo. Com a tela nova de
  // Profecções lendo o mesmo dado por getAnyBirthData (com hora e cidade), as
  // duas telas mostravam signo do ano DIFERENTE pra mesma pessoa — o app se
  // contradizia em duas telas vizinhas.
  const profeccao = profeccaoAnual({ date, time, city }, new Date(), lang);
  return { date, time, city, sun, moon, asc, housesList, aspectsList, astro, seita, profeccao, zone: describeZone(city, date, time) };
}

// Qual fuso foi REALMENTE aplicado — pra mostrar na tela. Sem isso, quem
// conferir a conta em outro site vê 1h de diferença e acha que o app errou;
// com isso, a linha diz "UTC-02:00 · horário de verão" e o número se explica.
// Devolve null quando não há como aplicar fuso nenhum (sem cidade ou sem hora),
// que é exatamente quando o Ascendente também não é calculado.
function describeZone(city, date, time) {
  if (!city || !date || !time) return null;
  if (!city.timezone) return null; // cidade antiga, sem fuso: nada novo a dizer
  const real = offsetHoursFor(city.timezone, date, time);
  if (real === null) return null; // aparelho sem tzdata: seguiu pelo caminho velho
  const padrao = typeof city.utcOffset === 'number' ? city.utcOffset : real;
  return { offset: real, dst: Math.abs(real - padrao) > 1 / 60 };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// SecureStore não tem implementação real na web (expo-secure-store/*.web.ts é um
// stub vazio) — e as versões antigas destes helpers só engoliam o erro num
// catch{}: na web NADA persistia, a pessoa preenchia data/hora/cidade, via o
// mapa, dava F5 e o formulário voltava vazio, pra sempre (bug real reproduzido
// por tester, 26/07/2026). Agora ambos vêm de lib/birthData.js e espelham em
// AsyncStorage ('<chave>-mirror') quando o SecureStore falha — mesmo padrão de
// lib/coupleData.js (writeSecureJSON) e mesmo sufixo que deleteAllCoupleData
// já apaga em "apagar meus dados". No celular nada muda (Keychain/Keystore).
const readSecureItem = readSecureItemWithMirror;
const writeSecureItem = writeSecureItemWithMirror;

const DATE_LOCALES = { pt: 'pt-BR', es: 'es-419', en: 'en-US' };

function formatBirthDate(iso, lang = 'pt') {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso || ''))) return '';
  const parsed = new Date(`${iso}T12:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return '';
  try {
    return parsed.toLocaleDateString(DATE_LOCALES[lang] || DATE_LOCALES.pt, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

const ASTRO_POINT_LABEL_KEYS = {
  Ascendente: 'birthchart.astroPoint.ascendant',
  Descendente: 'birthchart.astroPoint.descendant',
  'Meio-do-Céu': 'birthchart.astroPoint.midHeaven',
  'Fundo do Céu': 'birthchart.astroPoint.imumCoeli',
};

function rotuloDoPonto(ponto, t) {
  return ASTRO_POINT_LABEL_KEYS[ponto] ? t(ASTRO_POINT_LABEL_KEYS[ponto]) : ponto;
}

// O rótulo de cada pílula é o PRÓPRIO título da seção que o app já tem em
// lib/i18n.js (intocável — nenhuma chave nasce aqui), encurtado no " (" do
// texto já traduzido: "Casas (Casas Inteiras)" vira "Casas", "Astrocartografia
// (prévia por cidades)" vira "Astrocartografia". O título INTEIRO continua
// aparecendo dentro da própria seção — a pílula é atalho, não substituto.
function rotuloDePilula(texto) {
  return String(texto).split(' (')[0];
}

const ROWS_META = [
  { key: 'Sol', labelKey: 'birthchart.row.sun.label', descKey: 'birthchart.row.sun.desc', icon: 'sunny', color: '#FFB84D', missingKey: 'birthchart.row.sun.missing' },
  { key: 'Lua', labelKey: 'birthchart.row.moon.label', descKey: 'birthchart.row.moon.desc', icon: 'moon', color: '#5CA8FF', missingKey: 'birthchart.row.moon.missing' },
  { key: 'Asc', labelKey: 'birthchart.row.asc.label', descKey: 'birthchart.row.asc.desc', icon: 'trending-up', color: '#B57BFF', missingKey: 'birthchart.row.asc.missing' },
];

// "Adicione os dois" nunca deve ser só uma frase: todo aviso de hora/cidade
// faltando nasce colado nos dois toques que resolvem — abrir o seletor de
// cidade na hora e ir onde a hora se informa (campo local no solo, Quiz do
// Casal no modo casal, único lugar onde a hora do casal existe). Princípio:
// mensagem que PEDE algo == botão que FAZ a coisa acontecer.
function FixNatalDataCTA({ isCouple, onFixTime, onFixCity }) {
  const { t } = useLanguage();
  return (
    <View style={styles.fixRow}>
      <TouchableOpacity style={styles.fixBtn} activeOpacity={0.8} onPress={onFixTime}>
        <Ionicons name="time" size={14} color={colors.accent} />
        <Text style={styles.fixBtnText}>
          {isCouple ? t('birthchart.fix.timeCoupleCta') : t('birthchart.fix.timeCta')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.fixBtn} activeOpacity={0.8} onPress={onFixCity}>
        <Ionicons name="location" size={14} color={colors.accent} />
        <Text style={styles.fixBtnText}>{t('birthchart.fix.cityCta')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// O chrome da secao, no idioma pedido. Espelha packDoIdioma() de lib/seita.js
// (idioma fora dos tres cai no PT, mesmo fallback de lib/i18n.js e do proprio
// motor) — a tela nao redige nem escolhe texto, so entrega o `lang`.
//
// ISTO DEVERIA MORAR EM lib/seita.js, como `chromeDaSeita(lang)`, do mesmo
// jeito que lib/idadeReal.js exporta `chromeDaTela(lang)`. Esta frente nao
// pode tocar lib/seita.js (o motor esta congelado por golden), entao a funcao
// nasce aqui e a mudanca de casa esta descrita para o integrador.
const SEITA_CHROME = {
  pt: SEITA_PACK_PT.chrome,
  es: SEITA_PACK_ES.chrome,
  en: SEITA_PACK_EN.chrome,
};

function chromeDaSeita(lang) {
  return SEITA_CHROME[lang] || SEITA_CHROME.pt;
}

// Um bloco de planetas — "jogando em casa", "fora do proprio time", os
// indeterminados e os tres modernos. Cada linha traz a classe de Tetrabiblos
// I.5 como etiqueta (benefico/malefico/comum: e vocabulario de fisica antiga,
// nao juizo moral, e a linha do planeta diz isso em palavras), o texto do
// motor e o recibo miudo embaixo.
function SeitaGrupo({ titulo, planetas, reciboRotulo }) {
  if (!planetas || planetas.length === 0) return null;
  return (
    <View style={styles.seitaGrupo}>
      <Text style={styles.seitaGrupoTitulo}>{titulo}</Text>
      {planetas.map((p) => (
        <View key={p.planeta} style={styles.seitaPlaneta} testID={`seita-planeta-${p.planeta}`}>
          <View style={styles.seitaPlanetaTopo}>
            <Text style={styles.seitaPlanetaNome}>{p.nome}</Text>
            {!!p.classeNome && <Text style={styles.seitaClasse}>{p.classeNome}</Text>}
          </View>
          <Text style={styles.seitaTexto}>{p.linha}</Text>
          <Text style={styles.seitaReciboRotulo}>{reciboRotulo}</Text>
          <Text style={styles.seitaRecibo}>{p.recibo}</Text>
        </View>
      ))}
    </View>
  );
}

// A citacao verbatim. O ingles de Robbins e de Riley e o MESMO nos tres packs
// — traduzir citacao e falsifica-la —, entao a parafrase (assinada pelo app,
// fora das aspas) e o locus e que falam a lingua de quem le.
function SeitaCitacao({ v }) {
  return (
    <View style={styles.seitaCitacao}>
      <Text style={styles.seitaVerbatim}>“{v.texto}”</Text>
      <Text style={styles.seitaNota}>{v.parafrase}</Text>
      <Text style={styles.seitaRecibo}>{v.locus}</Text>
    </View>
  );
}

// A SECAO DA SEITA. Vitrine: mostra o que seitaDoMapa() exporta, nada mais.
function SeitaSection({ seita, lang }) {
  const UI = chromeDaSeita(lang);
  const [aberto, setAberto] = useState(false);
  const [recado, setRecado] = useState(null);

  // Mesma cadeia de IdadeRealScreen.js e MitosScreen.js: Share do react-native
  // primeiro (no nativo e a folha do SO; na web, react-native-web delega para
  // navigator.share quando existe) e clipboard como ultimo recurso no desktop
  // sem folha. O texto vem do pack — nunca montado aqui.
  async function compartilhar() {
    const texto = UI.compartilhavel(seita);
    if (!texto) return;
    setRecado(null);
    const temFolhaWeb =
      Platform.OS === 'web' && typeof navigator !== 'undefined' && typeof navigator.share === 'function';
    if (Platform.OS !== 'web' || temFolhaWeb) {
      try {
        await Share.share({ message: texto });
      } catch {
        // Cancelou ou a folha falhou: silencio, igual as outras telas.
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

  if (!seita) return null;

  // ---- INDISPONIVEL: falta hora, cidade, data ou efemeride ----------------
  // Nunca chuta. Diz o que falta (texto do pack) e onde se informa. O par de
  // botoes de "adicione hora e cidade" ja vive logo acima (FixNatalDataCTA),
  // entao aqui o pedido nao se repete em botao — so em palavra.
  if (!seita.disponivel) {
    return (
      <View style={styles.seitaCard} testID="seita-indisponivel">
        <Text style={styles.seitaTitulo}>{UI.rotulo}</Text>
        {/* Sem textTransform: aqui o destaque é uma FRASE, e "Ainda Não Dá
            Para Dizer" com maiúscula em toda palavra vira letreiro. */}
        <Text style={[styles.seitaDestaque, styles.seitaDestaqueFrase]}>{UI.indisponivelTitulo}</Text>
        <Text style={styles.seitaTexto}>{seita.explicacao}</Text>
        {!!seita.comoResolver && (
          <View style={styles.seitaCaixa}>
            <Text style={styles.seitaReciboRotulo}>{UI.comoResolverRotulo}</Text>
            <Text style={styles.seitaRecibo}>{seita.comoResolver}</Text>
          </View>
        )}
      </View>
    );
  }

  const modernos = seita.planetas.filter((p) => p.moderno);

  return (
    <View style={styles.seitaCard} testID="seita-secao">
      <Text style={styles.seitaTitulo}>{UI.rotulo}</Text>
      {/* QUENTE PRIMEIRO, FICHA DEPOIS — lei do dono, aplicada em 04/08/2026.
          A chamada ja existia e ja abria na vida real, sem nome proprio e sem
          capitulo; era a TELA que punha "mapa diurno" grande em cima dela. Um
          rotulo tecnico nao segura ninguem antes de a pessoa ter motivo pra se
          importar com ele — entao a leitura abre e o resultado desce, em linha
          de ficha. O dado nao sumiu: continua no card, com o mesmo testID, e o
          acordeao logo abaixo explica de onde ele vem. */}
      <Text style={[styles.seitaTexto, styles.seitaAbertura]}>{seita.chamada}</Text>
      <Text style={styles.seitaFicha} testID="seita-resultado">{seita.seitaMapa}</Text>

      {/* CASO LIMITROFE — fica FORA do acordeao de proposito: quando a hora
          informada decide o resultado, a duvida vale tanto quanto o resultado. */}
      {seita.limitrofe && !!seita.notaLimitrofe && (
        <View style={styles.seitaAviso} testID="seita-limitrofe">
          <View style={styles.seitaAvisoTopo}>
            <Ionicons name="alert-circle" size={14} color={colors.gold} />
            <Text style={styles.seitaAvisoRotulo}>{UI.limitrofeRotulo}</Text>
          </View>
          <Text style={styles.seitaTexto}>{seita.notaLimitrofe}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.seitaToggle}
        activeOpacity={0.85}
        onPress={() => setAberto((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberto }}
        accessibilityLabel={aberto ? UI.fechar : UI.abrir}
        testID="seita-toggle"
      >
        <Text style={styles.seitaToggleTexto}>{aberto ? UI.fechar : UI.abrir}</Text>
        <Ionicons name={aberto ? 'chevron-up' : 'chevron-down'} size={16} color={colors.gold} />
      </TouchableOpacity>

      {aberto && (
        <View style={styles.seitaCorpo}>
          {/* A explicacao ja vem em paragrafos separados por \n\n: abre
              concreto e fecha no recibo, nessa ordem. */}
          <Text style={styles.seitaTexto}>{seita.explicacao}</Text>

          {!!seita.mercurio && !!seita.mercurio.texto && (
            <>
              <Text style={styles.seitaSubtitulo}>{UI.mercurioTitulo}</Text>
              <Text style={styles.seitaTexto}>{seita.mercurio.texto}</Text>
            </>
          )}

          <Text style={styles.seitaSubtitulo}>{UI.planetasTitulo}</Text>
          <SeitaGrupo titulo={UI.grupoNaSeita} planetas={seita.planetasDaSeita} reciboRotulo={UI.reciboRotulo} />
          <SeitaGrupo titulo={UI.grupoForaDaSeita} planetas={seita.planetasForaDaSeita} reciboRotulo={UI.reciboRotulo} />
          <SeitaGrupo
            titulo={UI.grupoIndeterminado}
            planetas={seita.planetasIndeterminados}
            reciboRotulo={UI.reciboRotulo}
          />
          {/* Os tres modernos respondem sempre, e a resposta deles e a
              declaracao de que seita nao se aplica — com o ano da descoberta,
              que e o argumento inteiro. Deixar a linha em branco seria pior. */}
          <SeitaGrupo titulo={UI.grupoModernos} planetas={modernos} reciboRotulo={UI.reciboRotulo} />

          {/* As duas ressalvas que andam junto com TODA leitura: a condicao
              dupla de Valente (o app calcula metade da regra) e a separacao
              entre o que e conta e o que e leitura do app. */}
          <Text style={styles.seitaSubtitulo}>{UI.notasTitulo}</Text>
          <Text style={styles.seitaNota}>{seita.notaCondicao}</Text>
          <Text style={styles.seitaNota}>{seita.notaLeituraDoApp}</Text>

          <Text style={styles.seitaSubtitulo}>{UI.citacoesTitulo}</Text>
          {[...seita.verbatins, ...seita.verbatinsDasClasses].map((v, i) => (
            <SeitaCitacao key={`${v.locus}-${i}`} v={v} />
          ))}

          {/* `fonte` E UMA LISTA de seis strings, nunca uma string: dentro de
              um <Text> sozinho ela sairia emendada numa linha so, sem
              separador. Uma bibliografia por linha. */}
          <Text style={styles.seitaSubtitulo}>{UI.fontesTitulo}</Text>
          <View style={styles.seitaCaixa}>
            {seita.fonte.map((f, i) => (
              <Text key={i} style={styles.seitaRecibo}>
                · {f}
              </Text>
            ))}
          </View>

          <TouchableOpacity
            style={styles.seitaShareBtn}
            activeOpacity={0.85}
            onPress={compartilhar}
            accessibilityRole="button"
            accessibilityLabel={UI.compartilhar}
            testID="seita-share"
          >
            <Ionicons name="logo-whatsapp" size={16} color="#fff" />
            <Text style={styles.seitaShareTexto}>{UI.compartilhar}</Text>
          </TouchableOpacity>
          {!!recado && <Text style={styles.seitaRecado}>{recado}</Text>}
          <Text style={styles.seitaMarca}>{UI.marca}</Text>
        </View>
      )}
    </View>
  );
}

// Os 4 elementos na ordem clássica (a mesma de lib/elementos.js). Cores da
// paleta do próprio theme.js: Fogo pega o laranja de Leão/gradients.gold,
// Terra o verde, Ar o teal claro e Água o azul — nada de cor nova no app.
const ELEMENTOS_META = [
  { key: 'fogo', emoji: '🔥', labelKey: 'birthchart.elements.fire', color: '#FF8C5C' },
  { key: 'terra', emoji: '🌱', labelKey: 'birthchart.elements.earth', color: colors.green },
  { key: 'ar', emoji: '💨', labelKey: 'birthchart.elements.air', color: colors.teal },
  { key: 'agua', emoji: '💧', labelKey: 'birthchart.elements.water', color: colors.blue },
];

// A leitura do dominante mora no i18n ([BLOCO-ELEMENTOS]); o sufixo é o
// identificador do motor. Mapa literal (não template) pra varredura estática
// de test/i18nKeysExist.test.js enxergar cada chave uma a uma.
const ELEMENTOS_READING_KEY = {
  fogo: 'birthchart.elements.reading.fogo',
  terra: 'birthchart.elements.reading.terra',
  ar: 'birthchart.elements.reading.ar',
  agua: 'birthchart.elements.reading.agua',
};

// SEUS ELEMENTOS — os 4 círculos com % que o concorrente mostra, só que com a
// conta na cara. A % daqui é a única que a doutrina permite: contagem real
// (lib/elementos.js) — nenhum número nasce nesta tela.
//
// ORDEM DENTRO DA SEÇÃO: os 4 círculos ABREM porque eles são o conteúdo da
// feature (o retrato, não a ficha) — % de elemento é a leitura em forma de
// desenho. Embaixo, a linha de leitura do dominante (convite, "repare se..."),
// e por último o recibo: de onde saiu o número, e a nota de meio-dia quando
// não há hora de nascimento. Empate no topo (dominante vem como array do
// motor) → texto neutro de equilíbrio, sem inventar desempate.
function ElementosSection({ elementos, temHora }) {
  const { t } = useLanguage();
  if (!elementos) return null;
  const empate = Array.isArray(elementos.dominante);
  // No empate o recibo exemplifica com o PRIMEIRO empatado (ordem fixa do
  // motor) — o número continua sendo a contagem real dele, nunca um ajuste.
  const exemploKey = empate ? elementos.dominante[0] : elementos.dominante;
  const exemploMeta = ELEMENTOS_META.find((e) => e.key === exemploKey);
  // ONDA CENOGRÁFICA (08/08/2026): a caixa externa (LinearGradient + borda)
  // saiu — os 4 círculos flutuam direto no cenário, maiores, e a % virou CHIP
  // SOBREPOSTO no canto superior direito de cada círculo (pill escura com
  // borda na cor do elemento), o desenho exato do concorrente. As barrinhas
  // proporcionais saíram: círculo + chip já contam a história, e a barra era
  // a mesma informação pela terceira vez. Nenhum texto/testID mudou.
  return (
    <View style={styles.elementosCard}>
      <Text style={styles.elementosTitulo}>{t('birthchart.elements.title')}</Text>
      <View style={styles.elementosRow}>
        {ELEMENTOS_META.map((e) => {
          // ESPÍRITO DO ELEMENTO (08/08/2026, última rodada de arte): mesmo
          // contrato dos mascotes do trio — elementoImagem(chave) devolve o
          // asset pintado ou null, e null mantém o emoji exatamente como era.
          // O círculo vira MOLDURA: overflow hidden (no style) recorta o JPG
          // por dentro da borda colorida, igual ao trioHalo. O chip de % NÃO
          // muda de lugar: ele é irmão POSTERIOR do círculo dentro do wrap,
          // então pinta POR CIMA da imagem por ordem natural de render (RN
          // desenha o último filho em cima; nenhum zIndex necessário).
          // accessible={false}: decorativa — o nome do elemento está escrito
          // logo embaixo, no elementoNome.
          const arte = elementoImagem(e.key);
          return (
            <View key={e.key} style={styles.elementoCol} testID={`elementos-${e.key}`}>
              <View style={styles.elementoCirculoWrap}>
                <View style={[styles.elementoCirculo, { backgroundColor: e.color + '22', borderColor: e.color + '55' }]}>
                  {arte ? (
                    <Image source={arte} style={styles.elementoArte} resizeMode="cover" accessible={false} />
                  ) : (
                    <Text style={styles.elementoEmoji}>{e.emoji}</Text>
                  )}
                </View>
                <View style={[styles.elementoChip, { borderColor: e.color + '66' }]}>
                  <Text style={[styles.elementoChipTexto, { color: e.color }]}>{elementos.pct[e.key]}%</Text>
                </View>
              </View>
              <Text style={styles.elementoNome}>{t(e.labelKey)}</Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.elementosLeitura}>
        {empate ? t('birthchart.elements.reading.equilibrio') : t(ELEMENTOS_READING_KEY[elementos.dominante])}
      </Text>
      <Text style={styles.elementosRecibo}>
        {t('birthchart.elements.receipt', {
          n: elementos.contagem[exemploKey],
          elemento: t(exemploMeta.labelKey),
          pct: elementos.pct[exemploKey],
        })}
        {!temHora ? ` ${t('birthchart.elements.receiptNoTime')}` : ''}
      </Text>
    </View>
  );
}

// DIAGRAMAÇÃO ESPELHO (09/08/2026): ChartResult ganhou quatro props de
// composição — `aba` (qual seção as pílulas escolheram), `formulario` (o
// formulário de nascimento INTEIRO, que desceu da abertura da tela pra trás
// de um botão recolhido), `formAberto`/`onToggleForm` (o estado vive na tela,
// que também renderiza as pílulas). Nenhum conteúdo mudou de texto — só de
// lugar.
function ChartResult({ chart, isCouple, onFixTime, onFixCity, aba = 'essencia', formulario = null, formAberto = false, onToggleForm }) {
  // `lang` alimenta linhaDeSeita nas linhas do Sol e da Lua — sem ele a seita
  // falaria portugues no meio de uma tela em espanhol.
  const { t, lang } = useLanguage();
  const rows = [
    { ...ROWS_META[0], sign: chart.sun },
    { ...ROWS_META[1], sign: chart.moon },
    { ...ROWS_META[2], sign: chart.asc },
  ];
  // Mesma convenção de buildChart: a cidade INTEIRA como 3º argumento, pra
  // conta usar o fuso IANA (e o horário de verão) do instante de nascimento.
  // Null (sem data/motor) → a seção não renderiza, sem estado de erro.
  // useMemo porque esta tela tem TextInputs: sem ele, cada tecla digitada
  // re-renderiza o ChartResult e roda astronomy-engine pros 10 planetas de novo.
  const elementos = React.useMemo(
    () => distribuicaoDeElementos(chart.date, chart.time, chart.city || undefined),
    [chart.date, chart.time, chart.city]
  );
  return (
    <>
      {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — este cartão abria pela
          linha de cadastro: data, hora, UTC-03:00 e "horário de verão". É a
          primeira coisa da tela inteira, e é a única que ninguém veio ver: a
          pessoa já sabe quando nasceu. Nada saiu: fuso e horário de verão
          continuam na tela, e continuam sendo a prova de que a conta usou o
          instante certo. test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
      {/* DIAGRAMAÇÃO ESPELHO (09/08/2026): o desenho do concorrente premium,
          espelhado. A tela abre pela IDENTIDADE — o mascote do signo SOLAR
          gigante, centrado, com o nome do signo embaixo — e não mais pelo trio
          em fileira. O Sol SAIU do trio (virou o herói), então o que sobra é o
          PAR simétrico Lua | Ascendente, os medalhões de 80px de sempre. No
          meio dos dois blocos, o recibo do instante (a mesma linha de sempre) e
          o formulário — que descia o rolo inteiro lá de cima e agora mora atrás
          do botão ✏️ recolhido (a maior ficha da tela finalmente virou ficha).
          O nome do estilo do bloco segue sendo a âncora que
          test/quentePrimeiroNasTelas.test.js usa pra recortar este trecho. */}
      <View style={styles.summaryCard}>
        {(() => {
          // O HERO SOLAR: mesmo contrato do medalhão de sempre (mascote do
          // registro, ou o glifo de fonte quando não há asset/signo), só que
          // em tamanho de protagonista — 132px, halo na cor do signo.
          const corSol = chart.sun ? chart.sun.color : colors.textMuted;
          const mascoteSol = chart.sun ? mascoteDoSigno(chart.sun.name) : null;
          return (
            <>
              <Text style={styles.trioLabel}>{t(ROWS_META[0].labelKey)}</Text>
              <View style={[styles.heroHalo, { backgroundColor: corSol + '22', borderColor: corSol + '44' }]}>
                {mascoteSol ? (
                  <Image source={mascoteSol} style={styles.heroMascote} resizeMode="cover" accessible={false} />
                ) : (
                  <Text style={[styles.heroGlyph, { color: corSol }]}>{chart.sun ? chart.sun.glyph : '—'}</Text>
                )}
              </View>
              <Text style={styles.heroNome}>{chart.sun ? chart.sun.label : '?'}</Text>
            </>
          );
        })()}
        <Text style={[styles.summaryMeta, styles.summaryMetaRecibo]}>
          {formatBirthDate(chart.date, lang)}{chart.time ? ` · ${chart.time}` : ` · ${t('birthchart.noTime')}`}
          {chart.zone ? ` · UTC${formatOffset(chart.zone.offset)}` : ''}
          {chart.zone && chart.zone.dst ? ` · ${t('birthchart.dst')}` : ''}
        </Text>
        {/* O FORMULÁRIO, recolhido: o botão reaproveita o título que o próprio
            form sempre teve (chart.birthData) — nenhuma chave nova — e o form
            expandido é EXATAMENTE o de sempre, 100% operável (data, hora,
            cidade, gerar; no casal, a cidade da pessoa selecionada). */}
        {!!formulario && (
          <TouchableOpacity
            testID="birthchart-editar"
            style={styles.editBtn}
            onPress={onToggleForm}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ expanded: !!formAberto }}
            accessibilityLabel={t('chart.birthData')}
          >
            <Ionicons name="pencil" size={13} color={colors.textMuted} />
            <Text style={styles.editBtnTexto}>{t('chart.birthData')}</Text>
          </TouchableOpacity>
        )}
        {!!formulario && formAberto && <View style={styles.formWrap}>{formulario}</View>}
        <View style={styles.trio}>
          {rows.slice(1).map((r) => {
            // O medalhão: círculo com halo na cor do próprio signo (fundo na
            // cor + '22', borda + '44'), rótulo em cima, nome embaixo — o
            // desenho de sempre, agora em PAR (Lua | Ascendente).
            //
            // MASCOTE NO MEDALHÃO (08/08/2026): dentro do halo entra o
            // personagem ilustrado do signo — o halo vira MOLDURA (a borda
            // colorida fica por cima, o fundo cor+'22' fica atrás da imagem).
            // Sem asset no registro, ou sem signo calculado, o glifo de fonte
            // continua exatamente como era: a arte é upgrade, não dependência.
            // accessible={false} porque a imagem é decorativa — o nome do
            // signo está escrito logo embaixo, no trioSign.
            const cor = r.sign ? r.sign.color : colors.textMuted;
            const mascote = r.sign ? mascoteDoSigno(r.sign.name) : null;
            return (
              <View key={r.key} style={styles.trioItem}>
                <Text style={styles.trioLabel}>{t(r.labelKey)}</Text>
                <View style={[styles.trioHalo, { backgroundColor: cor + '22', borderColor: cor + '44' }]}>
                  {mascote ? (
                    <Image source={mascote} style={styles.trioMascote} resizeMode="cover" accessible={false} />
                  ) : (
                    <Text style={[styles.trioGlyph, { color: cor }]}>{r.sign ? r.sign.glyph : '—'}</Text>
                  )}
                </View>
                <Text style={styles.trioSign}>{r.sign ? r.sign.label : '?'}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* SEUS ELEMENTOS — logo depois do trio e antes das Posições, de
          propósito: é o resumo do céu inteiro (os 10 planetas) e prepara a
          lista detalhada que vem embaixo. Null (sem data ou sem motor) →
          nada renderiza, nunca um número inventado. */}
      {!!elementos && <ElementosSection elementos={elementos} temHora={!!chart.time} />}

      {/* A ONDA: fecha o bloco cenográfico (trio + elementos flutuando) e abre
          a parte de cards da tela. Uma só, de propósito — divisória, não
          papel de parede. Fica fora do condicional dos elementos porque o trio
          flutua sempre, com ou sem motor de elementos. */}
      <WaveDivider />

      {/* SUB-ABAS PÍLULA (09/08/2026, Diagramação Espelho): daqui pra baixo a
          tela mostra UMA seção por vez — quem escolhe é a fileira de pílulas
          flutuante (components/PillTabs.js), renderizada no root da tela.
          Nenhuma seção foi apagada: 'essencia' = Posições + Seita + Profecções
          (a espinha da leitura, na MESMA ordem e com os MESMOS textos),
          'casas', 'aspectos' e 'astro' continuam inteiros — só que atrás da
          própria pílula. O hero + medalhões + elementos (acima da onda) são a
          âncora fixa da tela; as pílulas só trocam o que vem depois. */}
      {aba === 'essencia' && (
        <>
      <Text style={styles.sub}>{t('birthchart.positions')}</Text>
      {rows.map((r) => {
        // A LINHA EXTRA DA SEITA, pendurada no proprio planeta — e para isso
        // que linhaDeSeita() existe. So o Sol e a Lua a recebem aqui: o
        // Ascendente e um ponto do horizonte, nao um planeta, e nao tem seita.
        // Sem mapa calculado (falta hora ou cidade) nao aparece nada: o motor
        // ja declara o que falta dentro da secao da seita, logo abaixo, e
        // repetir o aviso em cada linha seria pedir a mesma coisa tres vezes.
        const seitaDoPlaneta =
          (r.key === 'Sol' || r.key === 'Lua') && chart.seita && chart.seita.disponivel
            ? linhaDeSeita(r.key, chart.seita, lang)
            : null;
        return (
          <View key={r.key} style={styles.planetRow}>
            <View style={[styles.planetIcon, { backgroundColor: r.color + '22' }]}>
              <Ionicons name={r.icon} size={20} color={r.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planetLabel}>{r.sign ? t('birthchart.positionIn', { label: t(r.labelKey), sign: r.sign.label }) : t(r.labelKey)}</Text>
              <Text style={styles.planetDesc}>{r.sign ? t(r.descKey) : t(r.missingKey)}</Text>
              {!!seitaDoPlaneta && seitaDoPlaneta.disponivel && (
                <Text style={styles.planetSeita} testID={`birthchart-seita-${r.key}`}>
                  {seitaDoPlaneta.linha}
                </Text>
              )}
            </View>
            {r.sign && <Text style={[styles.planetGlyph, { color: r.sign.color }]}>{r.sign.glyph}</Text>}
          </View>
        );
      })}
      {!chart.asc && <FixNatalDataCTA isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />}

      {/* SEITA — logo depois dos planetas e ANTES das casas, de proposito: ela
          e a chave de leitura de tudo que veio acima (Ptolomeu I.7 e Valente
          I.1 dizem quem joga em casa de dia e quem joga em casa de noite),
          entao precisa aparecer enquanto Sol, Lua e Ascendente ainda estao na
          memoria de quem le. Renderiza SEMPRE: com os dados, a leitura; sem
          hora ou sem cidade, a declaracao do que falta e de onde se informa —
          nunca um palpite, e nunca silencio. */}
      <SeitaSection seita={chart.seita} lang={lang} />

      {/* PROFECCOES — o ano em que a pessoa esta. Vem depois da seita e ainda
          antes das casas: e a unica coisa da tela que fala do AGORA, e o resto
          do Mapa e retrato de nascimento. Renderiza mesmo sem hora, com o
          motor declarando a precisao que conseguiu. */}
      {chart.profeccao && chart.profeccao.disponivel && (
        <View style={styles.seitaCard}>
          {/* QUENTE PRIMEIRO, FICHA DEPOIS — lei do dono, aplicada em
              04/08/2026. O card abria com "Ano 34 · casa 11 · Aquário" e com o
              rótulo da origem, ou seja: duas linhas de ficha antes de qualquer
              motivo pra ler o resto. O olho de cima agora é só o NOME da seção
              (vem do mesmo pack, `rotulos.titulo`), o texto do ano abre, e a
              ficha desce inteira logo abaixo dele. */}
          {!!(chart.profeccao.rotulos && chart.profeccao.rotulos.titulo) && (
            <Text style={styles.seitaTitulo}>{chart.profeccao.rotulos.titulo}</Text>
          )}
          <Text style={[styles.seitaTexto, styles.seitaAbertura]}>{chart.profeccao.texto}</Text>
          <Text style={styles.seitaFicha}>{chart.profeccao.titulo}</Text>
          {/* DE ONDE A CONTAGEM SAIU, dito na cara (03/08/2026).
              Este card mora logo abaixo do Ascendente, e sem hora de
              nascimento o motor conta a partir do SOL — legítimo, Ptolomeu
              nomeia cinco lugares prorrogativos. Só que o card não dizia qual
              tinha usado: quem não informou a hora lia o ano inteiro achando
              que veio do Ascendente logo acima. A tela de Profecções já era
              honesta nisso; esta não era. Continua dito — como recibo, embaixo
              da leitura, e não como porteiro dela. */}
          {!!chart.profeccao.origemRotulo && (
            <Text style={styles.seitaNota}>{chart.profeccao.origemRotulo}</Text>
          )}
          {/* `detalhe` E UM OBJETO DE OITO CAMPOS, nunca uma string. Antes
              estava aqui dentro de um <Text> sozinho — objeto dentro de <Text>
              nao renderiza, quebra a tela, e quebrava o Mapa Astral inteiro
              para QUALQUER pessoa que tivesse data de nascimento (a profeccao
              nao precisa de hora nem de cidade, entao ela aparece pra todo
              mundo). Achado por varredura em 01/08/2026.

              Os nomes dos campos sao a regra do app escrita no motor:
              prende -> tradicao -> moderno -> fonte. Renderizo nessa ordem, a
              casa primeiro e o senhor do ano depois, e deixo o `fonte` de baixo
              como recibo unico — ele ja concatena casaFonte e senhorFonte, e
              repetir os dois aqui seria mostrar a mesma linha tres vezes. */}
          {!!chart.profeccao.detalhe && (
            <>
              {!!chart.profeccao.detalhe.casaTradicao && (
                <Text style={styles.seitaTexto}>{chart.profeccao.detalhe.casaTradicao}</Text>
              )}
              {!!chart.profeccao.detalhe.casaModerno && (
                <Text style={styles.seitaNota}>{chart.profeccao.detalhe.casaModerno}</Text>
              )}
              {!!chart.profeccao.detalhe.senhorPrende && (
                <Text style={styles.seitaTexto}>{chart.profeccao.detalhe.senhorPrende}</Text>
              )}
              {!!chart.profeccao.detalhe.senhorTradicao && (
                <Text style={styles.seitaTexto}>{chart.profeccao.detalhe.senhorTradicao}</Text>
              )}
              {!!chart.profeccao.detalhe.senhorModerno && (
                <Text style={styles.seitaNota}>{chart.profeccao.detalhe.senhorModerno}</Text>
              )}
            </>
          )}
          {/* O QUE FALTA, e onde resolver. Mesma regra da tela de Profecções:
              nunca deixar a pessoa num beco — se a leitura saiu do Sol por
              falta de hora/cidade, o card diz o que preencher. O botão não
              precisa: os campos de nascimento estão nesta mesma tela. */}
          {!!chart.profeccao.melhoraCom && (
            <Text style={styles.seitaNota}>{chart.profeccao.melhoraCom.texto}</Text>
          )}
          {!!chart.profeccao.fonte && <Text style={styles.seitaRecibo}>{chart.profeccao.fonte}</Text>}
        </View>
      )}
        </>
      )}

      {aba === 'casas' && (
        <HousesSection housesList={chart.housesList} isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />
      )}
      {aba === 'aspectos' && <AspectsSection aspectsList={chart.aspectsList} />}
      {aba === 'astro' && (
        <AstroCartographySection astro={chart.astro} isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />
      )}
    </>
  );
}

// Casas — sistema Casas Inteiras (Whole Sign): Casa 1 = signo do Ascendente.
// Pede hora exata + cidade real (mesma exigência do Ascendente, já que vem do
// mesmo grau exato) — sem isso, mostra o mesmo tipo de aviso honesto já usado
// pro Ascendente, nunca uma casa fabricada.
function HousesSection({ housesList, isCouple, onFixTime, onFixCity }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <Text style={styles.sub}>{t('chart.houses')}</Text>
      {housesList ? (
        <View style={styles.housesGrid}>
          {housesList.map((h) => (
            <View key={h.houseNumber} style={styles.houseCell}>
              <Text style={styles.houseNumber}>{t('birthchart.houseNumber', { n: h.houseNumber })}</Text>
              <Text style={[styles.houseSign, { color: (zodiacSigns.find((z) => z.name === h.sign.name) || {}).color || colors.text }]}>
                {h.sign.emoji} {nomeDoSigno(h.sign.name, lang)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>{t('birthchart.housesNeed')}</Text>
          </View>
          <FixNatalDataCTA isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />
        </>
      )}
    </>
  );
}

// Aspectos — todas as combinações de planetas clássicos que caem dentro do
// orbe padrão de algum aspecto maior (conjunção/sextil/quadratura/trígono/
// oposição). Só exige data (mesma aproximação de meio-dia da Lua quando falta
// hora) — se lib/signs.js não conseguir calcular (ex.: astronomy-engine
// indisponível), mostra aviso honesto em vez de lista vazia silenciosa.
function AspectsSection({ aspectsList }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <Text style={styles.sub}>{t('chart.aspects')}</Text>
      {aspectsList ? (
        aspectsList.length > 0 ? (
          aspectsList.map((a, i) => (
            <View key={`${a.planetA}-${a.planetB}-${i}`} style={styles.aspectRow}>
              <Text style={styles.aspectText}>
                {rotuloDoPlaneta(a.planetA, lang) || a.planetA}{' '}
                {(rotuloDoAspecto(a.aspectType, lang) || a.aspectType).toLocaleLowerCase()}{' '}
                {rotuloDoPlaneta(a.planetB, lang) || a.planetB}
              </Text>
              <Text style={styles.aspectOrb}>{t('birthchart.orb', { deg: a.orb.toFixed(1) })}</Text>
            </View>
          ))
        ) : (
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>{t('chart.noAspects')}</Text>
          </View>
        )
      ) : (
        <View style={styles.planetRow}>
          <Text style={styles.planetDesc}>{t('chart.aspectsError')}</Text>
        </View>
      )}
    </>
  );
}

// Astrocartografia — v1 textual e escopada (não é um mapa interativo: o app
// não tem nenhuma lib de mapa instalada). Varre uma lista curada de ~20
// cidades notáveis e mostra só onde algum planeta cai perto de um dos 4
// ângulos (Ascendente/Descendente/Meio-do-Céu/Fundo do Céu) no instante exato
// de nascimento — sempre calculado de verdade, nunca fabricado. Pede hora +
// cidade de nascimento (pro fuso/instante UTC exato), mesma exigência do
// Ascendente.
function AstroCartographySection({ astro, isCouple, onFixTime, onFixCity }) {
  const { t, lang } = useLanguage();
  return (
    <>
      <Text style={styles.sub}>{t('chart.astrocarto')}</Text>
      <Text style={styles.mutedNote}>{t('birthchart.astroPreviewNote')}</Text>
      {astro ? (
        astro.length > 0 ? (
          astro.map((a, i) => (
            <View key={`${a.city}-${a.planet}-${a.point}-${i}`} style={styles.aspectRow}>
              <Text style={styles.aspectText}>
                {t('birthchart.astroLine', {
                  planet: rotuloDoPlaneta(a.planet, lang) || a.planet,
                  point: rotuloDoPonto(a.point, t),
                  city: a.city,
                })}
              </Text>
              <Text style={styles.aspectOrb}>{t('birthchart.orb', { deg: a.orb.toFixed(1) })}</Text>
            </View>
          ))
        ) : (
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>{t('chart.noAngular')}</Text>
          </View>
        )
      ) : (
        <>
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>{t('birthchart.astroNeed')}</Text>
          </View>
          <FixNatalDataCTA isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />
        </>
      )}
    </>
  );
}

// A cópia local do CityPickerModal que existia aqui foi removida em
// 26/07/2026 e virou components/CityPickerModal.js (compartilhado com
// QuizScreen.js). Ela era uma bottom sheet com altura em porcentagem e lista
// com maxHeight/sem minHeight: ao abrir o teclado, a viewport encolhia e a
// lista colapsava pra 1-2 linhas — o usuário via só "São Paulo, SP — Brasil"
// e concluía que o app tinha uma cidade só (relato real de tester). Ver o
// cabeçalho do componente novo para as medições.

export default function BirthChartScreen() {
  const navigation = useNavigation();
  // `lang` alimenta buildChart, que passa adiante pra seitaDoMapa e
  // profeccaoAnual — os dois motores novos desta tela. Sem isso eles cairiam
  // no default 'pt' e a tela ficaria bilingue, que e exatamente o defeito que
  // a auditoria achou em sete telas hoje.
  const { t, lang } = useLanguage();
  const { coupleData, loading: coupleLoading, hasAccess, accessConfirmed } = useCouple();
  const isCouple = !!coupleData;
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.

  // ---- Modo casal: data/hora de nascimento já existem (getBirthData) desde o
  // Quiz do casal — só falta a cidade (nunca persistida pelo Quiz hoje) para
  // desbloquear o Ascendente real, então guardamos ela localmente aqui mesmo.
  const [birthData, setBirthData] = useState(null); // { birthA, birthB } | null
  const [person, setPerson] = useState('voce'); // 'voce' | 'amor'
  const [cities, setCities] = useState({ voce: null, amor: null });

  // ---- Modo solo: não existe nenhuma data de nascimento salva em lugar
  // nenhum (onboarding solo só guarda o signo escolhido), então esta tela
  // precisa coletar data (obrigatória), hora e cidade (opcionais) uma vez.
  const [soloBirth, setSoloBirth] = useState(null); // { date, time, city } | null
  const [soloDate, setSoloDate] = useState('');
  const [soloHoraH, setSoloHoraH] = useState('');
  const [soloHoraM, setSoloHoraM] = useState('');
  const [soloTime, setSoloTime] = useState('');
  const [soloCity, setSoloCity] = useState(null);
  const [soloDatePickerOpen, setSoloDatePickerOpen] = useState(false);

  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [locked, setLocked] = useState(false);

  // DIAGRAMAÇÃO ESPELHO (09/08/2026) — os dois estados de composição:
  // `aba` é a seção que a pílula flutuante escolheu ('essencia' abre, como a
  // primeira pílula do concorrente); `formAberto` é o formulário de nascimento,
  // que NASCE RECOLHIDO quando já existe mapa calculado — a tela abre pela
  // identidade, e o form vira ficha atrás do botão ✏️. Sem mapa, o form abre
  // sozinho como sempre (os estados nem entram em cena).
  const [aba, setAba] = useState('essencia');
  const [formAberto, setFormAberto] = useState(false);
  const alternarForm = () => setFormAberto((v) => !v);

  // Refs pros CTAs de "adicione hora e cidade": no modo solo os campos já
  // existem NESTA tela, só ficam muito acima do aviso (o aviso aparece depois
  // do gráfico, do trio, dos planetas e das casas) — então o toque rola a tela
  // até o formulário e põe o cursor na hora, em vez de mandar a pessoa
  // procurar. No modo casal a hora só existe no Quiz, então o toque vai lá.
  const scrollRef = useRef(null);
  const horaRef = useRef(null);

  const irParaQuiz = () => navigation.navigate(ROUTES.QUIZ);
  const abrirCidade = () => setCityPickerOpen(true);
  const focarHoraSolo = () => {
    // O form pode estar RECOLHIDO atrás do ✏️ (Diagramação Espelho): abrir
    // antes de rolar/focar, senão o horaRef nem existe montado.
    setFormAberto(true);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setTimeout(() => horaRef.current?.focus(), 350);
  };
  const onFixTime = isCouple ? irParaQuiz : focarHoraSolo;

  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess, accessConfirmed]);

  useEffect(() => {
    if (coupleLoading) return;
    (async () => {
      if (isCouple) {
        const [bd, savedCities] = await Promise.all([
          getBirthData(),
          readSecureItem('birthChartCities'),
        ]);
        setBirthData(bd);
        let parsedCities = { voce: null, amor: null };
        try {
          if (savedCities) parsedCities = JSON.parse(savedCities);
        } catch {}
        setCities(parsedCities);
        // Upgrade silencioso: cidade salva antes desta versão não tem fuso.
        const melhores = {
          voce: await upgradeCityTimezone(parsedCities.voce),
          amor: await upgradeCityTimezone(parsedCities.amor),
        };
        if (melhores.voce !== parsedCities.voce || melhores.amor !== parsedCities.amor) {
          setCities(melhores);
          await writeSecureItem('birthChartCities', JSON.stringify(melhores));
        }
      } else {
        const raw = await readSecureItem('birthChartSolo');
        if (raw) {
          let c = null;
          try {
            c = JSON.parse(raw);
          } catch {}
          if (c) {
            setSoloBirth(c);
            setSoloDate(c.date || '');
            setSoloCity(c.city || null);
            if (c.time) {
              const [hh, mm] = c.time.split(':');
              setSoloHoraH(hh);
              setSoloHoraM(mm);
            }
            // Mesmo upgrade do lado solo. É best-effort de verdade: sem rede,
            // upgradeCityTimezone devolve a MESMA cidade e nada acontece — o
            // mapa continua saindo pelo caminho de sempre.
            const melhor = await upgradeCityTimezone(c.city);
            if (melhor && melhor !== c.city) {
              const atualizado = { ...c, city: melhor };
              setSoloCity(melhor);
              setSoloBirth(atualizado);
              await writeSecureItem('birthChartSolo', JSON.stringify(atualizado));
              await saveSoloBirthMirror(atualizado);
            }
          }
        }
      }
    })();
  }, [isCouple, coupleLoading]);

  // Hora opcional do modo solo: combina HH + MM em "HH:MM" só quando os dois
  // campos são números válidos — mesmo padrão do QuizScreen.js.
  useEffect(() => {
    const h = parseInt(soloHoraH, 10);
    const m = parseInt(soloHoraM, 10);
    if (!Number.isNaN(h) && !Number.isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      setSoloTime(`${pad2(h)}:${pad2(m)}`);
    } else {
      setSoloTime('');
    }
  }, [soloHoraH, soloHoraM]);

  async function generateSolo() {
    if (!soloDate) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const data = { date: soloDate, time: soloTime || null, city: soloCity || null };
    setSoloBirth(data);
    await writeSecureItem('birthChartSolo', JSON.stringify(data));
    // Espelho persistente pra web (SecureStore é stub vazio lá) — é o que o
    // "Céu de hoje pra você" da Home lê (ver lib/birthData.js).
    await saveSoloBirthMirror(data);
    // Gerou → o form recolhe e a identidade assume a tela (Diagramação
    // Espelho). Sem mapa ainda, o estado é inócuo: o form fica visível.
    setFormAberto(false);
  }

  async function selectCity(city) {
    if (isCouple) {
      const next = { ...cities, [person]: city };
      setCities(next);
      await writeSecureItem('birthChartCities', JSON.stringify(next));
    } else {
      setSoloCity(city);
      if (soloBirth) {
        const next = { ...soloBirth, city };
        setSoloBirth(next);
        await writeSecureItem('birthChartSolo', JSON.stringify(next));
      }
    }
    setCityPickerOpen(false);
  }

  async function clearCity() {
    if (isCouple) {
      const next = { ...cities, [person]: null };
      setCities(next);
      await writeSecureItem('birthChartCities', JSON.stringify(next));
    } else {
      setSoloCity(null);
      if (soloBirth) {
        const next = { ...soloBirth, city: null };
        setSoloBirth(next);
        await writeSecureItem('birthChartSolo', JSON.stringify(next));
      }
    }
    setCityPickerOpen(false);
  }

  const selectedBirth = person === 'voce' ? birthData?.birthA : birthData?.birthB;
  const selectedCity = person === 'voce' ? cities.voce : cities.amor;
  const coupleChart = selectedBirth?.date ? buildChart(selectedBirth.date, selectedBirth.time, selectedCity, lang) : null;
  const soloChart = soloBirth?.date ? buildChart(soloBirth.date, soloBirth.time, soloBirth.city, lang) : null;

  // Marca o uso assim que QUALQUER UM dos dois mapas (casal ou solo) existe de
  // verdade — cobre tanto o caminho solo (logo depois de generateSolo() gravar
  // os dados) quanto o caminho de casal (dados já vêm prontos do Quiz).
  useEffect(() => {
    if (coupleChart || soloChart) markFeatureUsedOnce(FEATURE_KEY);
  }, [coupleChart, soloChart]);

  // Vira entrada no Diário Cósmico 1x por dia — antes essa tela não deixava
  // rastro nenhum de uso real (achado real de auditoria de retenção, 25/07/2026).
  const activeChart = coupleChart || soloChart;
  useEffect(() => {
    if (!activeChart?.sun?.name) return;
    const iso = todayISODiary();
    AsyncStorage.getItem(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === iso) return;
      // Gravado no idioma ATUAL via t() — o Diário reexibe este texto depois,
      // então PT cravado aqui viraria entrada em português pra quem usa es/en.
      // Reusa birthchart.positionIn + os rótulos das rows (nenhuma chave nova);
      // o nome exibido vem do `label` localizado, sem alterar o dado do motor.
      const partes = [
        t('birthchart.positionIn', { label: t('birthchart.row.sun.label'), sign: activeChart.sun.label }),
      ];
      if (activeChart.moon?.label)
        partes.push(t('birthchart.positionIn', { label: t('birthchart.row.moon.label'), sign: activeChart.moon.label }));
      if (activeChart.asc?.label)
        partes.push(t('birthchart.positionIn', { label: t('birthchart.row.asc.label'), sign: activeChart.asc.label }));
      recordReadingCompletion({
        type: 'birthchart',
        typeLabel: t('home.card.birthchart.title'),
        title: t('home.card.birthchart.title'),
        body: partes.join(', ') + '.',
      });
      AsyncStorage.setItem(DIARY_RECORDED_KEY, iso);
    });
  }, [activeChart?.sun?.label, activeChart?.moon?.label, activeChart?.asc?.label, t]);

  // DIAGRAMAÇÃO ESPELHO (09/08/2026): o formulário virou CONST porque agora
  // ele tem duas casas — sozinho na tela quando ainda NÃO há mapa (abertura de
  // sempre), e dentro do ChartResult (atrás do botão ✏️, recolhido) quando o
  // mapa já existe. Mesmo JSX, mesmos textos, mesmos handlers nos dois lugares:
  // extrair é o que impede o form de divergir de si mesmo.
  const formCasal = isCouple && selectedBirth?.date ? (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>{t('chart.birthData')}</Text>
      <Text style={styles.dateReadout}>
        {formatBirthDate(selectedBirth.date, lang)}{selectedBirth.time ? ` · ${selectedBirth.time}` : ` · ${t('birthchart.noTime')}`}
      </Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerOpen(true)}>
        <Ionicons name="location" size={16} color={colors.textMuted} />
        <Text style={[styles.dateBtnText, !selectedCity && styles.dateBtnPlaceholder]}>
          {selectedCity ? cityLabel(selectedCity) : t('birthchart.form.addCityAsc')}
        </Text>
      </TouchableOpacity>
    </View>
  ) : null;

  const formSolo = !isCouple ? (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>{t('chart.birthData')}</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setSoloDatePickerOpen(true)}>
        <Ionicons name="calendar" size={16} color={colors.textMuted} />
        <Text style={[styles.dateBtnText, !soloDate && styles.dateBtnPlaceholder]}>
          {soloDate ? formatBirthDate(soloDate, lang) : t('birthchart.form.birthDate')}
        </Text>
      </TouchableOpacity>

      <View style={styles.horaRow}>
        <View style={[styles.field, styles.horaField]}>
          <Ionicons name="time" size={18} color={colors.textMuted} />
          <TextInput
            ref={horaRef}
            style={styles.input}
            placeholder={t('birthchart.form.hourPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={soloHoraH}
            onChangeText={setSoloHoraH}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
        <Text style={styles.horaColon}>:</Text>
        <View style={[styles.field, styles.horaField]}>
          <TextInput
            style={styles.input}
            placeholder={t('birthchart.form.minPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={soloHoraM}
            onChangeText={setSoloHoraM}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>
      </View>
      <Text style={styles.mutedNote}>{t('chart.timeOptional')}</Text>

      <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerOpen(true)}>
        <Ionicons name="location" size={16} color={colors.textMuted} />
        <Text style={[styles.dateBtnText, !soloCity && styles.dateBtnPlaceholder]}>
          {soloCity ? cityLabel(soloCity) : t('birthchart.form.cityOptional')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity activeOpacity={0.85} onPress={generateSolo} style={styles.btnWrap} disabled={!soloDate}>
        <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
          <Ionicons name="planet" size={18} color="#fff" />
          <Text style={styles.btnText}>{t('chart.generate')}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  ) : null;

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle={t('home.card.birthchart.title')} gradient={['#3A4AB5', '#6C7BFF']} />;
  }

  return (
    <View style={styles.root}>
      <CosmicScene />
      <GradientHeader title={t('home.card.birthchart.title')} subtitle={t('birthchart.header.subtitle')} onBack={() => navigation.goBack()} gradient={['#3A4AB5', '#6C7BFF']} />
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 20, paddingBottom: activeChart ? 120 : 40 }} showsVerticalScrollIndicator={false}>
        {coupleLoading ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
        ) : isCouple ? (
          <>
            <View style={styles.personToggle}>
              <TouchableOpacity
                style={[styles.personBtn, person === 'voce' && styles.personBtnActive]}
                onPress={() => setPerson('voce')}
              >
                <Text style={[styles.personBtnText, person === 'voce' && styles.personBtnTextActive]}>{coupleData.voce}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.personBtn, person === 'amor' && styles.personBtnActive]}
                onPress={() => setPerson('amor')}
              >
                <Text style={[styles.personBtnText, person === 'amor' && styles.personBtnTextActive]}>{coupleData.amor}</Text>
              </TouchableOpacity>
            </View>

            {!selectedBirth?.date ? (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>{t('chart.birthData')}</Text>
                <Text style={styles.mutedNote}>
                  {t('birthchart.couple.missingDate', { name: person === 'voce' ? coupleData.voce : coupleData.amor })}
                </Text>
                {/* O texto acima só INFORMA onde ficam os dados; sem este
                    botão a tela inteira ficava sem uma única ação possível
                    (só o voltar e o toggle você/amor). Quiz mora no mesmo
                    HomeStack, então navigate() leva direto. */}
                <TouchableOpacity activeOpacity={0.85} onPress={irParaQuiz} style={styles.btnWrap}>
                  <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                    <Ionicons name="calendar" size={18} color="#fff" />
                    <Text style={styles.btnText}>{t('birthchart.couple.missingDateCta')}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Com mapa calculado, o form (formCasal) desce pra dentro do
                    ChartResult — botão ✏️, recolhido. Sem mapa, ele abre a
                    tela sozinho, como sempre. */}
                {!coupleChart && formCasal}
                {coupleChart && (
                  <ChartResult
                    chart={coupleChart}
                    isCouple
                    onFixTime={onFixTime}
                    onFixCity={abrirCidade}
                    aba={aba}
                    formulario={formCasal}
                    formAberto={formAberto}
                    onToggleForm={alternarForm}
                  />
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* HERO-FIRST: com mapa calculado o form (formSolo) desce pra
                dentro do ChartResult — botão ✏️, recolhido — e a tela abre
                pela identidade. Sem mapa, nada mudou: abre pelo formulário. */}
            {!soloChart && formSolo}
            {soloChart && (
              <ChartResult
                chart={soloChart}
                isCouple={false}
                onFixTime={onFixTime}
                onFixCity={abrirCidade}
                aba={aba}
                formulario={formSolo}
                formAberto={formAberto}
                onToggleForm={alternarForm}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* AS PÍLULAS DO MAPA — flutuam por cima do fim do rolo (por isso moram
          aqui no root, DEPOIS do ScrollView na árvore; o contentContainer
          ganhou paddingBottom 120 ≥ 96 pra última linha não morar embaixo
          delas). Só existem quando há mapa calculado: sem mapa a tela é só o
          formulário, como sempre foi. Os rótulos são títulos de seção que o
          app JÁ tem em lib/i18n.js — 'essencia' usa o título de Posições, e os
          longos passam por rotuloDePilula (encurta no " (" do próprio texto
          traduzido), nunca por chave nova. */}
      {!coupleLoading && !!activeChart && (
        <PillTabs
          items={[
            { id: 'essencia', label: t('birthchart.positions') },
            { id: 'casas', label: rotuloDePilula(t('chart.houses')) },
            { id: 'aspectos', label: t('chart.aspects') },
            { id: 'astro', label: rotuloDePilula(t('chart.astrocarto')) },
          ]}
          activeId={aba}
          onSelect={(id) => {
            setAba(id);
            // Trocar de pílula troca a SEÇÃO inteira, mas o scroll da anterior
            // ficava: vindo do fim de uma seção longa, a nova abria no meio.
            // Volta pro topo sem animação — troca de aba é troca de página.
            scrollRef.current?.scrollTo({ y: 0, animated: false });
          }}
        />
      )}

      <DatePickerModal
        visible={soloDatePickerOpen}
        title={t('chart.birthData')}
        // NASCIMENTO NÃO ACONTECE NO FUTURO (03/08/2026). O padrão do modal é
        // CURRENT_YEAR + 15, que serve pra data de cápsula do tempo, não pra
        // nascimento: dava pra escolher 2039 e aí a profecção — que conta anos
        // de vida — respondia "a data escolhida é anterior ao seu nascimento"
        // e a pessoa ficava sem saída, sem nada dizendo que o erro era o ano.
        // Fechado na raiz: o ano nem aparece na lista.
        maxYear={new Date().getFullYear()}
        initialDate={soloDate || undefined}
        onClose={() => setSoloDatePickerOpen(false)}
        onConfirm={(dateStr) => setSoloDate(dateStr)}
      />

      {/* birthDate/birthTime viram o parâmetro `at` da busca: o servidor já
          devolve cada cidade com o fuso resolvido pro instante do nascimento
          (horário de verão incluído), sem uma segunda chamada. A tela já tem
          esses dois valores na mão quando o seletor abre — seria desperdício
          não mandar. */}
      <CityPickerModal
        visible={cityPickerOpen}
        birthDate={isCouple ? selectedBirth?.date || null : soloDate || soloBirth?.date || null}
        birthTime={isCouple ? selectedBirth?.time || null : soloTime || soloBirth?.time || null}
        hasSelection={!!(isCouple ? selectedCity : soloCity)}
        onClose={() => setCityPickerOpen(false)}
        onSelect={selectCity}
        onClear={clearCity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Seita — cartao de LEITURA (superficie lisa, sem gradiente), no padrao dos
  // outros blocos de conteudo do Mapa. Borda dourada discreta porque e a
  // camada que reenquadra tudo acima dela, nao mais um item da lista.
  // marginHorizontal era 16 dentro de um ScrollView que ja tem padding 16: o
  // card ficava 32px encolhido em relacao a TODO o resto da tela (planetRow,
  // houseCell, aspectRow nao tem margem lateral nenhuma). Zerado — o
  // alinhamento e o que faz a secao parecer parte do Mapa, e nao um encarte.
  seitaCard: {
    marginTop: 8, marginBottom: 14, padding: 16,
    backgroundColor: colors.surface, borderRadius: 18,
    borderWidth: 1, borderColor: colors.gold + '44',
  },
  seitaTitulo: {
    color: colors.gold, fontSize: 12, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  // O resultado, grande: e o que a pessoa fotografa.
  seitaDestaque: {
    color: colors.text, fontSize: 20, fontWeight: '800',
    textTransform: 'capitalize', marginBottom: 10,
  },
  seitaDestaqueFrase: { textTransform: 'none', fontSize: 18 },
  // A ABERTURA de um card que segue a lei "quente primeiro": a leitura de vida
  // real vem em corpo maior que o resto do card, porque é ela que segura.
  // (Reforma 08/08: o corpo subiu pra 15/24, então a abertura sobe junto —
  // 16/25 — pra hierarquia entre as duas não sumir.)
  seitaAbertura: { fontSize: 16, lineHeight: 25 },
  // A FICHA depois da abertura: o resultado técnico ("mapa diurno", "Ano 34 ·
  // casa 11 · Aquário") em tamanho de etiqueta. O dado continua na tela — ele
  // só deixou de ser porteiro da leitura.
  seitaFicha: {
    color: colors.textSecondary, fontSize: 12, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10,
  },
  seitaSubtitulo: {
    color: colors.gold, fontSize: 11, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 8,
  },
  seitaTexto: { color: colors.text, fontSize: 15, lineHeight: 24, marginBottom: 8 },
  seitaCorpo: { marginTop: 4 },

  // O aviso de chamada apertada: dourado, no corpo do card, fora do acordeao.
  seitaAviso: {
    borderRadius: 12, borderWidth: 1, borderColor: colors.gold + '55',
    backgroundColor: colors.gold + '12', padding: 12, marginBottom: 8,
  },
  seitaAvisoTopo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  seitaAvisoRotulo: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1 },

  seitaToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, borderWidth: 1, borderColor: colors.gold + '55',
    paddingVertical: 11, marginTop: 4,
  },
  seitaToggleTexto: { color: colors.gold, fontSize: 13, fontWeight: '800' },

  seitaGrupo: { marginBottom: 10 },
  seitaGrupoTitulo: { color: colors.textSecondary, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  seitaPlaneta: {
    backgroundColor: colors.surfaceElevated, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 8,
  },
  seitaPlanetaTopo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  seitaPlanetaNome: { color: colors.text, fontSize: 15, fontWeight: '800' },
  // A classe de Tetrabiblos I.5 como etiqueta — vocabulario de fisica antiga,
  // e a linha do planeta explica isso em palavras logo abaixo.
  seitaClasse: {
    color: colors.textMuted, fontSize: 10, fontWeight: '800',
    textTransform: 'uppercase', letterSpacing: 1,
    borderWidth: 1, borderColor: colors.border, borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 2,
  },

  // A citacao verbatim: aspas e italico. O ingles de Robbins e de Riley e o
  // mesmo nos tres packs — quem traduz uma citacao a falsifica.
  seitaCitacao: { marginBottom: 10 },
  seitaVerbatim: {
    color: colors.textSecondary, fontSize: 13, lineHeight: 20,
    fontStyle: 'italic', marginBottom: 4,
  },

  seitaCaixa: {
    borderRadius: 12, borderWidth: 1, borderStyle: 'dotted',
    borderColor: colors.border, padding: 12, gap: 4,
  },
  seitaReciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 4 },

  seitaShareBtn: {
    flexDirection: 'row', gap: 8, backgroundColor: '#25D366', borderRadius: 14,
    paddingVertical: 11, alignItems: 'center', justifyContent: 'center', marginTop: 16,
  },
  seitaShareTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },
  seitaRecado: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8 },
  seitaMarca: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 8 },
  // A camada MODERNA fica visivelmente mais apagada que a antiga: o app
  // distingue o que a fonte diz do que o seculo XX passou a dizer, e a
  // hierarquia visual tem que contar isso sem precisar de rotulo.
  seitaNota: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, marginBottom: 8, fontStyle: 'italic' },
  seitaRecibo: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
  root: { flex: 1, backgroundColor: colors.background },
  formCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border },
  formTitle: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 14 },
  field: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 14, marginLeft: 10 },
  horaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  horaField: { flex: 1 },
  horaColon: { color: colors.textMuted, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  mutedNote: { color: colors.textMuted, fontSize: 12, marginTop: -6, marginBottom: 12, lineHeight: 17 },
  dateReadout: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 12 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  dateBtnText: { color: colors.text, fontSize: 15 },
  dateBtnPlaceholder: { color: colors.textMuted },
  btnWrap: { marginTop: 4, borderRadius: 12, overflow: 'hidden' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, gap: 8 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  personToggle: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  personBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  personBtnActive: { backgroundColor: colors.accent + '22', borderColor: colors.accent },
  personBtnText: { color: colors.textSecondary, fontWeight: '700', fontSize: 14 },
  personBtnTextActive: { color: colors.text },
  // ONDA CENOGRÁFICA (08/08/2026): summaryCard deixou de ser card — sem fundo,
  // sem borda, sem overflow. O nome fica porque é a âncora do teste de ordem
  // (test/quentePrimeiroNasTelas.test.js recorta o bloco pela âncora summaryCard
  // — citada aqui sem aspas de propósito: string com pontos entre aspas é o que
  // o vigia de i18nKeysExist trata como chave de tradução).
  // DIAGRAMAÇÃO ESPELHO (09/08/2026): o bloco inteiro virou coluna CENTRADA —
  // herói solar, nome, recibo, botão ✏️ e o par de medalhões, tudo no eixo.
  summaryCard: { marginTop: 16, alignItems: 'center' },
  // O HERO SOLAR: o medalhão do Sol em tamanho de protagonista (132px, dentro
  // da faixa 120-140 do desenho do concorrente). Cor do halo chega inline do
  // próprio chart.sun.color (fundo +'22', borda +'44'), como nos medalhões;
  // overflow hidden recorta o mascote por dentro da borda, igual ao trioHalo.
  heroHalo: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
    overflow: 'hidden',
  },
  heroMascote: { width: 132, height: 132, borderRadius: 66 },
  heroGlyph: { fontSize: 72, lineHeight: 82 },
  // O nome do signo solar embaixo do herói — 24/800 centrado, o letreiro da
  // identidade que abre a tela.
  heroNome: { color: colors.text, fontSize: 24, fontWeight: '800', textAlign: 'center' },
  // O botão ✏️ que guarda o formulário recolhido: chip discreto, do tamanho do
  // próprio rótulo — ele é porta de ficha, nunca CTA.
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface + 'CC',
  },
  editBtnTexto: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  // O formulário expandido dentro do bloco centrado: estica de volta pra
  // largura toda (o pai tem alignItems center, que encolheria o formCard).
  formWrap: { alignSelf: 'stretch', marginTop: 12 },
  summaryMeta: { color: colors.textMuted, fontSize: 12 },
  // A mesma linha de sempre — agora recibo do HERÓI: pequena, central, logo
  // abaixo do nome do signo solar.
  summaryMetaRecibo: {
    marginTop: 6,
    textAlign: 'center',
  },
  // O PAR de medalhões (Lua | Ascendente) — o Sol saiu do trio e virou o herói,
  // então os dois que ficaram se centram lado a lado, simétricos, com um vão
  // de respiro entre eles.
  trio: { flexDirection: 'row', justifyContent: 'center', gap: 44, alignSelf: 'stretch', marginTop: 18 },
  trioItem: { alignItems: 'center' },
  trioLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  // O medalhão do glifo (08/08/2026, crescido na Onda Cenográfica): círculo com
  // o fundo na cor do signo a ~13% de opacidade (+ '22') e borda a ~27%
  // (+ '44') — a cor vem inline do próprio r.sign.color, aqui fica só a
  // geometria. Sem card em volta, o medalhão É a superfície: 80px de halo e
  // glifo de 44, tamanho de protagonista. lineHeight ~fontSize pra centralizar
  // o glifo unicode no círculo nas duas plataformas.
  trioHalo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    // overflow hidden desde os mascotes (08/08/2026): recorta a imagem no
    // círculo POR DENTRO da borda — sem isso o JPG de 80px cobriria o fio de
    // 1px (border-box: área útil de 78px) e a moldura colorida sumiria. Para
    // o glifo de fonte não muda nada.
    overflow: 'hidden',
  },
  trioGlyph: { fontSize: 44, lineHeight: 50 },
  // O mascote ilustrado dentro do medalhão — mesmo diâmetro do halo, o próprio
  // borderRadius garante o círculo também onde overflow se comportar diferente
  // (RN web x nativo). 'cover' porque o asset é quadrado de 256px: preenche
  // sem distorcer.
  trioMascote: { width: 80, height: 80, borderRadius: 40 },
  trioSign: { color: colors.text, fontSize: 16, fontWeight: '800' },
  // --- Seus elementos (08/08/2026, flutuante desde a Onda Cenográfica) ---
  // Sem caixa externa: os 4 círculos flutuam no cenário, 4 colunas flex
  // iguais. As cores por elemento chegam inline de ELEMENTOS_META (são 4,
  // variam por coluna); aqui, como sempre, só a geometria e o texto neutro.
  // Centrado desde a Diagramação Espelho (09/08/2026): título e leituras no
  // eixo; a fileira de círculos estica de volta (alignSelf stretch) pra manter
  // as 4 colunas flex de largura igual.
  elementosCard: { marginTop: 28, alignItems: 'center' },
  elementosTitulo: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 14, textAlign: 'center' },
  elementosRow: { flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'stretch' },
  elementoCol: { flex: 1, alignItems: 'center', marginHorizontal: 3 },
  // O wrap existe SÓ pra ancorar o chip absoluto no canto do círculo — ele
  // mede exatamente o círculo, e o chip vaza um pouco pra fora, de propósito.
  elementoCirculoWrap: { marginBottom: 8 },
  elementoCirculo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // overflow hidden desde o espírito pintado (08/08/2026): recorta o JPG no
    // círculo POR DENTRO da borda colorida — mesma razão do trioHalo. O chip
    // de % não é afetado: ele mora no WRAP (irmão do círculo), não aqui dentro.
    overflow: 'hidden',
  },
  elementoEmoji: { fontSize: 30 },
  // O espírito do elemento preenche o círculo inteiro; o recorte redondo vem
  // do overflow do círculo, o borderRadius aqui é só cinto-e-suspensório pro
  // RN Web antigo que não recorta filho em raio.
  elementoArte: { width: 68, height: 68, borderRadius: 34 },
  elementoNome: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  // O chip de %: pill pequena SOBREPOSTA no canto superior direito do círculo
  // (o desenho do concorrente) — fundo escuro do cenário + borda na cor do
  // elemento (inline), pra % ler como etiqueta pendurada, não como botão.
  elementoChip: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  elementoChipTexto: { fontSize: 12, fontWeight: '800' },
  elementosLeitura: { color: colors.text, fontSize: 15, lineHeight: 24, marginTop: 16, textAlign: 'center' },
  elementosRecibo: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 8, textAlign: 'center' },
  // Título de seção em corpo de display (18/800) e com respiro de verdade em
  // cima — é o que separa "lista" de "capítulo" nos prints do concorrente.
  sub: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 14, letterSpacing: 0.2 },
  planetRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 18, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  planetIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  planetLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  planetDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  // A linha de seita pendurada no Sol e na Lua. Fica em cima de um filete
  // dourado para separar o que e camada da tradicao (Ptolomeu I.7) do que e
  // a descricao geral do planeta que vem do dicionario da tela.
  planetSeita: {
    color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 8,
    paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.gold + '33',
  },
  planetGlyph: { fontSize: 24 },
  housesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  houseCell: { width: '31%', backgroundColor: colors.surface, borderRadius: 14, padding: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  houseNumber: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  houseSign: { fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  aspectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  aspectText: { color: colors.text, fontSize: 14, flex: 1, marginRight: 8 },
  aspectOrb: { color: colors.textMuted, fontSize: 12 },
  // Os estilos do city picker local (modalOverlay/modalSheet/citySheet/
  // cityList/cityItem/...) sairam daqui em 26/07/2026 junto com o componente,
  // que virou components/CityPickerModal.js. Ficaram orfaos e sem nenhuma
  // referencia — inclusive o citySheet:'80%' + cityList:260 que causavam o
  // colapso da lista. Removidos pra ninguem reaproveitar o padrao quebrado.
  btnGhostText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  // Par de toques que acompanha todo aviso de "falta hora e cidade" — visual
  // de chip discreto (mesma família do dateBtn), pra resolver o pedido sem
  // competir com o CTA principal da tela.
  fixRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  fixBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.accent + '1A', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.accent + '55',
  },
  fixBtnText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
});
