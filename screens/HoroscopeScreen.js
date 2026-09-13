// screens/HoroscopeScreen.js
//
// ===========================================================================
// O QUE MUDOU AQUI EM 31/07/2026, e por quê
// ===========================================================================
// Esta tela montava a leitura do dia com três sorteios por hash de
// `signo|aba|data`:
//
//   READING_POOL — 8 textos prontos por aba, girando para 12 signos e 365 dias;
//   SCORE_POOL   — 10 conjuntos fixos de nota ({ Amor: 62, Trabalho: 74… })
//                  desenhados como barra de progresso;
//   LUCK_*       — cor, número e hora "da sorte", também literais sorteados.
//
// Os três eram invenção apresentada como leitura. Pior: os textos AFIRMAVAM
// posição planetária que o app nunca calculou ("A Lua minguante favoreceu o
// encerramento de ciclos" saía em dia de Lua crescente, com o Calendário Lunar
// mostrando a fase certa duas telas adiante), e as notas contradiziam o próprio
// prompt do assistente do app, que proíbe porcentagem porque "a tradição não
// sustenta essa promessa".
//
// Agora a tela não escolhe conteúdo: ela RENDERIZA o que lib/dailyHoroscope.js
// calcula da efeméride. O porquê de cada bloco, com a fonte de cada afirmação,
// está no cabeçalho daquele arquivo — é lá que se discute tradição, não aqui.
//
// AS TRÊS COISAS QUE NÃO PODEM VOLTAR:
//   1. Texto que afirme posição de planeta sem cálculo por trás.
//   2. Nota, porcentagem ou barra preenchida para área da vida.
//   3. Pool de frases sorteado por hash.
// test/dailyHoroscope.test.js cobra as três.
//
// O QUE FOI PRESERVADO DE PROPÓSITO: testID 'horoscope-reading', o OneTimeLock
// da prévia grátis e a marcação de uso — tests/e2e/paywall/one-time-lock.spec.js
// depende dos três, e o funil de assinatura depende do teste.
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, zodiacSigns, space, type } from '../theme';
import CosmicScene from '../components/CosmicScene';
import GradientHeader from '../components/GradientHeader';
import WaveDivider from '../components/WaveDivider';
// AS PEÇAS DE DIAGRAMAÇÃO (12/09/2026) — a leitura longa deixou de ir de borda
// a borda (ColunaLeitura) e o recibo do céu ganhou chão próprio (FaixaCurva).
// Ver design/PECAS-DE-DIAGRAMACAO.md.
import ColunaLeitura from '../components/ColunaLeitura';
import FaixaCurva from '../components/FaixaCurva';
import OneTimeLock from '../components/OneTimeLock';
// AS SUB-ABAS PÍLULA (09/08/2026, Onda Diagramação Espelho) — Ontem/Hoje/Amanhã
// saíram da fileira no topo do rolo e flutuam na pílula em cima do dock, como
// no concorrente. Mesmos ids internos, mesmas chaves de label — só o lugar.
import PillTabs from '../components/PillTabs';
import { elementoDoSigno, polaridadeDoSigno, modalidadeDoSigno } from '../lib/signs';
// O BOTÃO "OUVIR" (08/08/2026) — a leitura do bloco em voz alta, com a voz do
// aparelho (Web Speech API, lib/voz.js). Em plataforma sem a API ele devolve
// null sozinho — nenhum gate aqui.
import BotaoOuvir from '../components/BotaoOuvir';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { horoscopeFor } from '../lib/dailyHoroscope';
import { datasDoSigno, nomeDoSigno } from '../lib/synastry';
// OS LOCALIZADORES (11/09/2026) saíram desta tela pra lib/horoscopoLocalizado.js:
// a Home ganhou um carrossel com o mesmo texto e a tradução precisa ser UMA só,
// senão as duas telas discordam no mesmo idioma. Mesmas funções, mesmo
// comportamento — só o endereço mudou.
import { localizeAstroValue, resolveVars, resumoLocalizadoDoDia, slugPlaneta } from '../lib/horoscopoLocalizado';
// A FICHA DE NASCIMENTO (11/09/2026): Lua e Ascendente da pessoa embaixo da
// ficha do signo — a MESMA conta do Mapa (carregarIdentidade), nunca refeita aqui.
import { carregarIdentidade } from '../lib/identidadeCeleste';
import { ROUTES } from '../routes';
// O MASCOTE (08/08/2026) — o signo vira personagem: lib/ilustracoes.js devolve
// o asset 256px do pack de arte, ou null — e null cai no glifo de fonte de
// sempre. A arte é upgrade, nunca dependência.
// planetaImagem (09/08/2026, Onda Arte Dominante): a arte 256px do planeta
// regente do dia vira cabeçalho do primeiro bloco de leitura — mesmo contrato
// (null → sem cabeçalho, layout de sempre).
import { mascoteDoSigno, planetaImagem } from '../lib/ilustracoes';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';

const DIARY_RECORDED_KEY = 'cosmic-horoscope-diary-date';

const FEATURE_KEY = 'horoscope';

// As strings de TABS seguem sendo os identificadores internos (comparação em
// dateForTab) — só a EXIBIÇÃO passa pelo t().
const TABS = ['Ontem', 'Hoje', 'Amanhã'];
const TAB_LABEL_KEYS = {
  Ontem: 'horoscope.tab.yesterday',
  Hoje: 'horoscope.tab.today',
  'Amanhã': 'horoscope.tab.tomorrow',
};


function isoDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function todayISO() {
  return isoDate(new Date());
}

// Data real que cada aba representa. Ontem e amanhã são dias de verdade, com
// céu de verdade: a Lua pode ter trocado de signo, o quarto lunar pode ter
// virado, Mercúrio pode ter estacionado. É por isso que as três abas mostram
// coisas diferentes agora — antes era o hash da string que mudava.
function dateForTab(tab) {
  const d = new Date();
  if (tab === 'Ontem') d.setDate(d.getDate() - 1);
  if (tab === 'Amanhã') d.setDate(d.getDate() + 1);
  return d;
}

// Mapas LITERAIS (não template) pra varredura estática de
// test/i18nKeysExist.test.js. lib/signs.js devolve 'água' com acento.
const FICHA_ELEMENTO_KEY = {
  fogo: 'birthchart.elements.fire',
  terra: 'birthchart.elements.earth',
  ar: 'birthchart.elements.air',
  'água': 'birthchart.elements.water',
};
const FICHA_POLARIDADE_KEY = { masculino: 'birthchart.ficha.masculino', feminino: 'birthchart.ficha.feminino' };
const FICHA_MODALIDADE_KEY = { cardinal: 'birthchart.ficha.cardinal', fixo: 'birthchart.ficha.fixo', mutavel: 'birthchart.ficha.mutavel' };

function FichaItemSigno({ rotulo, valor, cor }) {
  return (
    <View style={styles.fichaItem}>
      <Text style={styles.fichaRotulo}>{rotulo}</Text>
      <Text style={styles.fichaValor}>{valor}</Text>
    </View>
  );
}

export default function HoroscopeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  const { t, lang } = useLanguage();
  const [sign, setSign] = useState(route.params?.sign || zodiacSigns[0]);
  const [tab, setTab] = useState('Hoje');
  const [showPicker, setShowPicker] = useState(false);
  const [locked, setLocked] = useState(false);
  // Qual bloco está com o método aberto. Começa tudo fechado, e é assim de
  // propósito: a fonte tem que estar A UM TOQUE, não em primeiro plano. Estado
  // por bloco (e não um interruptor geral) porque quem abre a régua do aspecto
  // não está necessariamente querendo reler Plínio no mesmo instante.
  const [metodoAberto, setMetodoAberto] = useState({});
  // A identidade celeste da pessoa (Lua, Ascendente, nascimento) — TRÊS estados,
  // como no CabecalhoIdentidade da Home: undefined = carregando (nada na tela,
  // pra ficha não piscar), null = sem nascimento salvo (nada extra — a Home já
  // convida a preencher o Mapa), objeto = a ficha. carregarIdentidade nunca
  // lança; o catch é cinto de segurança pra um erro de import não virar tela
  // em branco.
  const [identidade, setIdentidade] = useState(undefined);
  useEffect(() => {
    carregarIdentidade().then(setIdentidade).catch(() => setIdentidade(null));
  }, []);

  // lib/dailyHoroscope.js já guarda o céu de cada data em memória, mas o
  // useMemo evita até o trabalho de remontar os blocos a cada render — a tela
  // re-renderiza no toque do seletor de signo e na troca de aba.
  const leitura = useMemo(() => horoscopeFor(sign.name, dateForTab(tab)), [sign.name, tab]);
  const signLabel = nomeDoSigno(sign.name, lang);
  const f = leitura.facts;
  // O mascote do signo selecionado — null quando o pack não tem a arte, e aí
  // o glifo de fonte segue no posto (fallback obrigatório, nunca buraco).
  const mascote = mascoteDoSigno(sign.name);
  // A ARTE DO REGENTE (09/08/2026, Onda Arte Dominante) — o cabeçalho de arte
  // do primeiro bloco de leitura é o planeta REGENTE DO DIA: arte com dado
  // real por trás (o mesmo fato que a FichaDoCeu reciba logo abaixo), nunca
  // ilustração sorteada. f é null quando o motor não respondeu, e aí não há
  // cabeçalho — o layout de sempre, sem buraco.
  const arteRegente = f ? planetaImagem(f.regenteDoDia) : null;

  // Sem botão de ação aqui — o conteúdo já aparece ao montar a tela. Por isso
  // checagem e marcação acontecem juntas: só marca como usado quando a checagem
  // confirma que ainda não tinha sido usado, garantindo que a pessoa sempre veja
  // o conteúdo completo nessa primeira visita (não bloqueia na mesma passada).
  useEffect(() => {
    // accessConfirmed=false = a checagem de assinatura falhou por rede, não
    // confirmou nada de verdade — nunca marcar a prévia grátis como usada
    // nesse caso (achado real de auditoria, 25/07/2026).
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then((used) => {
      if (used) {
        setLocked(true);
      } else {
        markFeatureUsedOnce(FEATURE_KEY);
      }
    });
  }, [hasAccess, accessConfirmed]);

  // Vira entrada no Diário Cósmico 1x por dia (não a cada troca de aba/signo,
  // senão o Diário enche de quase-duplicatas). O corpo agora é o resumo do céu
  // REAL do dia — se o motor de efeméride não responder, o resumo localizado
  // devolve null e o Diário simplesmente não recebe entrada, em vez de guardar
  // uma frase inventada para sempre.
  useEffect(() => {
    const today = todayISO();
    AsyncStorage.getItem(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === today) return;
      const resumo = resumoLocalizadoDoDia(sign.name, new Date(), t, lang);
      if (!resumo) return;
      recordReadingCompletion({
        type: 'horoscope',
        typeLabel: t('home.card.horoscope.title'),
        title: t('horoscope.diary.title', { sign: signLabel }),
        body: resumo,
        // Trava idempotente (lib/journal.js): a guarda de storage acima e
        // read-then-write e `t` nasce novo a cada render do LanguageContext,
        // entao o efeito pode disparar duas vezes antes do primeiro setItem.
        completionId: `horoscope:${today}:${sign.name}`,
      }).then(() => AsyncStorage.setItem(DIARY_RECORDED_KEY, today));
    });
  }, [sign, signLabel, t]);

  const pickSign = async (z) => {
    Haptics.selectionAsync();
    setSign(z);
    setShowPicker(false);
    await AsyncStorage.setItem('userSign', JSON.stringify(z));
  };

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle={t('home.card.horoscope.title')} gradient={['#7B3FB5', '#A66CFF']} />;
  }

  return (
    <View style={styles.root} testID="horoscope-reading">
      {/* O cenário em camadas (céu + estrelas + ondas) atrás de tudo — o root
          mantém colors.background por baixo, como o contrato do CosmicScene
          pede. Onda Cenográfica (08/08/2026): o TEXTO DE LEITURA flutua direto
          no cenário, como no concorrente premium — caixa é só pro interativo
          (seletor de signo, tabs) e pro recibo (FichaDoCeu, footer). */}
      <CosmicScene />
      <GradientHeader
        title={t('home.card.horoscope.title')}
        subtitle={signLabel}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
            <Ionicons name="swap-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />
      {/* ONTEM / HOJE / AMANHÃ NO TOPO (11/09/2026, pedido do dono: "aquela
          parte de ontem e hoje, consegue incorporar?"). As abas JÁ EXISTIAM —
          mas como pílula flutuando no rodapé, por cima dos cards, e ele
          nunca as viu. Na referência elas ficam logo abaixo do cabeçalho,
          onde a pessoa escolhe o dia ANTES de ler. Mesmo componente, mesmos
          ids ('Ontem'/'Hoje'/'Amanhã' que dateForTab compara); só o `style`
          desliga o absoluto e a põe no fluxo. O paddingBottom do rolo volta
          ao normal — não há mais nada flutuando sobre o fim dele. */}
      <PillTabs
        items={TABS.map((tabName) => ({ id: tabName, label: t(TAB_LABEL_KEYS[tabName]) }))}
        activeId={tab}
        onSelect={(id) => { Haptics.selectionAsync(); setTab(id); }}
        style={styles.abasTopo}
      />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: space.fimDaLista }} showsVerticalScrollIndicator={false}>
        {showPicker && (
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>{t('horoscope.pickerTitle')}</Text>
            <View style={styles.pickerGrid}>
              {zodiacSigns.map((z) => {
                // Cada casinha do seletor mostra o mascote pequeno quando o
                // pack tem a arte; sem arte, o glifo de fonte de sempre.
                const mascoteZ = mascoteDoSigno(z.name);
                return (
                  <TouchableOpacity
                    key={z.name}
                    style={[styles.pickerItem, sign.name === z.name && { backgroundColor: z.color + '33', borderColor: z.color }]}
                    onPress={() => pickSign(z)}
                  >
                    {mascoteZ ? (
                      <Image source={mascoteZ} style={styles.mascotePequeno} resizeMode="cover" accessible={false} />
                    ) : (
                      <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                    )}
                    <Text style={styles.pickerName}>{nomeDoSigno(z.name, lang)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.mainCard}>
          <LinearGradient colors={[sign.color + '44', 'transparent']} style={styles.signHeader}>
            {/* O signo como PERSONAGEM: quando o pack tem o mascote, ele toma o
                lugar do glifo de fonte — e o fundo na cor do signo continua,
                agora como moldura da arte. Sem mascote, tudo como sempre foi. */}
            <View style={[styles.bigGlyph, { backgroundColor: sign.color + '33' }, mascote && styles.bigGlyphComMascote]}>
              {mascote ? (
                <Image source={mascote} style={styles.mascoteGrande} resizeMode="cover" accessible={false} />
              ) : (
                <Text style={[styles.bigGlyphText, { color: sign.color }]}>{sign.icon}</Text>
              )}
            </View>
            <View style={styles.signInfo}>
              <Text style={styles.bigName}>{signLabel}</Text>
              <Text style={styles.bigDates}>{datasDoSigno(sign.dates, lang)}</Text>
              {/* A FICHA DO SIGNO (11/09/2026). Antes era uma linha "Elemento
                  {sign.element}" — e `sign` chega pela rota como { name, pt }
                  (do userSign salvo), SEM element: a tela mostrava "Elemento
                  undefined". Medido no navegador. Agora os três atributos
                  fixos vêm pelo NOME (lib/signs.js), o mesmo desenho da ficha
                  do Sol no Mapa — e as chaves de i18n são as mesmas de lá. */}
              <View style={styles.fichaRow}>
                <FichaItemSigno rotulo={t('birthchart.ficha.elemento')} valor={t(FICHA_ELEMENTO_KEY[elementoDoSigno(sign.name)] || 'birthchart.ficha.elemento')} cor={sign.color} />
                <FichaItemSigno rotulo={t('birthchart.ficha.polaridade')} valor={t(FICHA_POLARIDADE_KEY[polaridadeDoSigno(sign.name)] || 'birthchart.ficha.polaridade')} cor={sign.color} />
                <FichaItemSigno rotulo={t('birthchart.ficha.modalidade')} valor={t(FICHA_MODALIDADE_KEY[modalidadeDoSigno(sign.name)] || 'birthchart.ficha.modalidade')} cor={sign.color} />
              </View>
              {/* A FICHA DE NASCIMENTO (11/09/2026), logo abaixo da ficha do
                  signo: Lua e Ascendente da pessoa (o Sol já é o herói do
                  card), a data de nascimento e a porta pro Mapa. Sem
                  nascimento salvo não desenha nada — a Home já convida. */}
              {/* Só sob o signo da PRÓPRIA pessoa (11/09/2026, revisor adversarial):
                  a tela tem um seletor de signos, e a ficha — Lua, Ascendente
                  e nascimento REAIS de quem usa — aparecia embaixo de qualquer
                  signo escolhido ali. Nada fabricado, mas dado de uma pessoa
                  sob o cabeçalho de outro signo. Trocou o signo → some. */}
              <FichaNascimento
                identidade={identidade && identidade.sun === sign.name ? identidade : identidade === undefined ? undefined : null}
                t={t}
                lang={lang}
                onMapa={() => navigation.navigate(ROUTES.BIRTH_CHART)}
              />
            </View>
          </LinearGradient>

          {/* Sem céu calculado não há leitura. Antes, este era o caso em que a
              tela caía num texto genérico — que é justamente o defeito. */}
          {!leitura.available && (
            <Text style={styles.unavailable} testID="horoscope-unavailable">
              {t('horoscope.sky.unavailable')}
            </Text>
          )}
        </View>

        {leitura.available && (
          <>
            {/* QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — os três chips do céu
                (Lua, fase, regente do dia) ABRIAM esta tela. Eram o primeiro
                card do rolo: quem chegava pra ler o dia lia "🌙 Escorpião ·
                🌗 Quarto minguante · Marte" antes de uma linha sequer sobre si.
                A ficha não sumiu nem virou toque: ela DESCEU um bloco, e agora
                é recibo do que já foi lido — o primeiro bloco de leitura abre,
                e logo abaixo dele vem de onde saiu a conta. A ordem é a mesma
                que o card do dia já usava por dentro (leitura, e o método atrás
                do metodoToggle). test/quentePrimeiroNasTelas.test.js falha se
                <FichaDoCeu> voltar pra cima do primeiro bloco. */}

            {/* LEITURA em cima, MÉTODO atrás de um toque.
                (31/07/2026) Auditoria de leitura: renderizados os doze signos
                no mesmo dia, cada um recebia 596 palavras, e a sobreposição
                entre dois signos quaisquer era de 0,81 — pior par 0,93. As
                oito palavras em dez que se repetiam não eram enchimento: eram
                as FONTES (a dedução de Ptolomeu em I.17, a régua de signo
                inteiro, Plínio e Columela, o aviso sobre Rudhyar). O que é
                sobre ESTE signo HOJE cabe em ~60 palavras e ficava soterrado.
                Nada saiu. Cada linha declara em lib/dailyHoroscope.js se é
                leitura ou método, e o método fica um toque adiante, por bloco.
                Quem quer a costura abre; quem quer o dia lê o dia. */}
            {leitura.blocks.map((bloco, indice) => {
              const leituraLinhas = bloco.lines.filter((l) => l.role !== 'metodo');
              const metodoLinhas = bloco.lines.filter((l) => l.role === 'metodo');
              const aberto = !!metodoAberto[bloco.id];
              // O que o botão Ouvir fala é EXATAMENTE o que o bloco mostra: as
              // mesmas linhas de leitura, resolvidas pelo mesmo t() — o método
              // (recolhido) fica fora da fala como fica fora da primeira vista.
              const textoFalado = leituraLinhas
                .map((line) => t(line.key, resolveVars(line.vars, t, lang)))
                .join(' ');
              return (
                <View key={bloco.id}>
                  {/* A colina entre "o seu dia" e o próximo capítulo: UMA onda,
                      logo depois da FichaDoCeu (que fecha o primeiro bloco como
                      recibo) e antes do título do bloco seguinte. Renderizada
                      aqui — e não colada na ficha — para só existir quando
                      existe próximo capítulo. */}
                  {indice === 1 && <WaveDivider />}
                  {/* O CABEÇALHO DE ARTE (09/08/2026, Onda Arte Dominante) —
                      no concorrente os cards do horóscopo são 70% imagem; aqui
                      a leitura flutuava sem uma. SÓ o primeiro bloco ganha o
                      cabeçalho, e é a arte do regente do dia (dado que a
                      FichaDoCeu reciba embaixo). Os blocos seguintes ficam sem
                      arte de propósito: os ids reais (ruler/moon/quarter/day/
                      retro/aspect) falam de astros DIFERENTES — repetir a Lua
                      em cima de Mercúrio retrógrado seria decoração desmentindo
                      o fato, e uma imagem forte vale mais que quatro iguais.
                      Decoração pura: accessible={false}, nada de texto novo, e
                      vem ANTES do título — não entre a leitura e a ficha. */}
                  {indice === 0 && arteRegente && (
                    <Image source={arteRegente} style={styles.arteBloco} resizeMode="cover" accessible={false} />
                  )}
                  <Text style={[styles.sub, indice === 0 && arteRegente && styles.subComArte]}>{t(bloco.titleKey)}</Text>
                  {/* Ouvir, entre o título e o texto — alinhado com a leitura
                      (o blockCard indenta 18). Um botão POR bloco: quem toca
                      ouve este capítulo, não a tela inteira. */}
                  <BotaoOuvir texto={textoFalado} style={styles.ouvirBtn} />
                  {/* A COLUNA DE LEITURA (12/09/2026) — o parágrafo parou de ir
                      de borda a borda. Nos prints de referência nenhum texto
                      encosta na margem: a leitura mora numa coluna mais
                      estreita, centrada. Em 390px a coluna calculada é maior
                      que a tela, então o celular continua usando a largura
                      toda (o certo); o efeito aparece no tablet e na web
                      larga, onde a linha atravessava 1200px e ninguém achava
                      o começo da linha seguinte. Ver components/ColunaLeitura.js. */}
                  <ColunaLeitura style={styles.blockCard} testID={`horoscope-block-${bloco.id}`}>
                    {leituraLinhas.map((line, i) => (
                      <Text key={line.key + i} style={[styles.line, i > 0 && styles.lineSpaced]}>
                        {t(line.key, resolveVars(line.vars, t, lang))}
                      </Text>
                    ))}
                    {metodoLinhas.length > 0 && (
                      <>
                        <TouchableOpacity
                          onPress={() => setMetodoAberto((s) => ({ ...s, [bloco.id]: !s[bloco.id] }))}
                          style={styles.methodToggle}
                          testID={`horoscope-method-toggle-${bloco.id}`}
                          accessibilityRole="button"
                        >
                          <Ionicons
                            name={aberto ? 'chevron-up' : 'chevron-down'}
                            size={13}
                            color={colors.textMuted}
                          />
                          <Text style={styles.methodToggleText}>
                            {t('horoscope.sky.methodToggle')}
                          </Text>
                        </TouchableOpacity>
                        {aberto &&
                          metodoLinhas.map((line, i) => (
                            <Text
                              key={line.key + i}
                              style={[styles.methodLine, i > 0 && styles.lineSpaced]}
                              testID={`horoscope-method-${bloco.id}`}
                            >
                              {t(line.key, resolveVars(line.vars, t, lang))}
                            </Text>
                          ))}
                      </>
                    )}
                  </ColunaLeitura>
                  {/* O céu bruto do dia, logo depois da primeira leitura: os
                      mesmos três fatos de sempre (nada foi apagado), agora no
                      lugar de recibo — e agora numa FAIXA CURVA, que é o que
                      separa "o que o céu diz de você" (leitura) de "que céu é
                      esse" (ficha). Antes os dois corriam sobre o mesmo fundo
                      e liam como um bloco só. A faixa sangra até as bordas
                      (o ScrollView tem padding 20; ver styles.faixaCeu). */}
                  {indice === 0 && (
                    <FaixaCurva tom="noite" semente="ceu-do-dia" style={styles.faixaCeu}>
                      <FichaDoCeu f={f} t={t} lang={lang} />
                    </FaixaCurva>
                  )}
                </View>
              );
            })}

            {/* Rodapé: a régua do app declarada, e a explicação de por que não
                há mais barras de nota. Não é letra miúda por acaso — é o
                contrato com quem lê. */}
            <View style={styles.footerCard}>
              <Text style={styles.footerText}>{t('horoscope.sky.footer.tropical')}</Text>
              <Text style={[styles.footerText, styles.lineSpaced]}>{t('horoscope.sky.footer.noScores')}</Text>
            </View>
          </>
        )}
      </ScrollView>

    </View>
  );
}

// A FICHA DE NASCIMENTO (11/09/2026) — Lua e Ascendente da pessoa logo abaixo
// da ficha do signo, a data de nascimento e a porta pro Mapa. Mesmo desenho
// dos chips e da pílula do CabecalhoIdentidade da Home, COPIADO e não
// importado: aquele componente traz junto o convite e o anel de elementos, que
// aqui seriam ruído em cima do card do signo. NUNCA FABRICA: undefined (ainda
// carregando) e null (sem nascimento salvo) não desenham nada, e Ascendente
// sem hora+cidade aparece como '—' apagado — nunca um signo chutado.
// Chaves LITERAIS (não template) pra varredura de test/i18nKeysExist.test.js.
const CHIPS_NASCIMENTO = [
  { campo: 'moon', icone: 'moon-outline', rotulo: 'home.identidade.lua' },
  { campo: 'asc', icone: 'trending-up-outline', rotulo: 'home.identidade.asc' },
];

// Mesma formatação de formatBirthDate em BirthChartScreen.js: ancorada ao
// meio-dia UTC pra a data não voltar um dia em fuso negativo. A hora só entra
// quando foi informada — sem hora não há o que mostrar.
const DATE_LOCALES = { pt: 'pt-BR', es: 'es-419', en: 'en-US' };
function dataDeNascimento(iso, time, lang) {
  const d = new Date(`${iso}T12:00:00.000Z`);
  let texto = iso;
  if (!Number.isNaN(d.getTime())) {
    try {
      texto = d.toLocaleDateString(DATE_LOCALES[lang] || DATE_LOCALES.pt, { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    } catch {
      texto = iso;
    }
  }
  return time ? `${texto} · ${time}` : texto;
}

function FichaNascimento({ identidade, t, lang, onMapa }) {
  if (!identidade) return null;
  return (
    <View style={styles.nascimento} testID="horoscope-ficha-nascimento">
      <View style={styles.chips}>
        {CHIPS_NASCIMENTO.map((c) => {
          const nome = identidade[c.campo];
          return (
            <View key={c.campo} style={styles.chip}>
              <Ionicons name={c.icone} size={14} color={colors.textMuted} accessible={false} />
              <Text style={styles.chipRotulo}>{t(c.rotulo)}</Text>
              <Text style={[styles.chipValor, !nome && styles.chipMudo]}>
                {nome ? nomeDoSigno(nome, lang) : '—'}
              </Text>
            </View>
          );
        })}
      </View>
      <Text style={styles.nascimentoData}>
        {t('horoscope.ficha.nascimento')} · {dataDeNascimento(identidade.date, identidade.time, lang)}
      </Text>
      <TouchableOpacity onPress={onMapa} style={styles.pill} accessibilityRole="button" testID="horoscope-ficha-mapa">
        <Ionicons name="planet-outline" size={16} color={colors.gold} accessible={false} />
        <Text style={styles.pillTexto}>{t('horoscope.ficha.explorarMapa')}</Text>
      </TouchableOpacity>
    </View>
  );
}

// A FICHA DO CÉU — os três fatos brutos, no lugar exato onde ficavam a cor, o
// número e a hora "da sorte". Ali havia literal sorteado; aqui há efeméride.
// Virou componente em 04/08/2026 só para poder DESCER sem perder nada: ela é
// renderizada depois do primeiro bloco de leitura, e o arquivo a declara aqui
// embaixo para que a ordem do código-fonte conte a mesma história que a tela.
function FichaDoCeu({ f, t, lang }) {
  return (
    <>
      <Text style={styles.sub}>{t('horoscope.sky.factsTitle')}</Text>
      <View style={styles.factsRow}>
        <FactItem
          icon="moon"
          color={colors.teal}
          label={t('horoscope.sky.fact.moon')}
          value={`${f.luaEmoji || ''} ${nomeDoSigno(f.luaSigno, lang)}`.trim()}
        />
        <FactItem
          icon="ellipse"
          color={colors.gold}
          label={t('horoscope.sky.fact.phase')}
          value={`${f.faseEmoji || ''} ${localizeAstroValue(f.faseNome, t, lang)}`.trim()}
          hint={typeof f.iluminacao === 'number' ? t('horoscope.sky.fact.illum', { pct: String(f.iluminacao) }) : null}
        />
        <FactItem
          icon="planet"
          color={colors.pink}
          label={t('horoscope.sky.fact.dayRuler')}
          value={t(`grounding.ruler.${slugPlaneta(f.regenteDoDia)}.name`)}
        />
      </View>
    </>
  );
}

function FactItem({ icon, color, label, value, hint }) {
  return (
    <View style={styles.factItem}>
      <View style={[styles.factIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
      {hint ? <Text style={styles.factHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  pickerCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  pickerTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 12 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerItem: { width: '31%', backgroundColor: colors.surfaceElevated, borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pickerGlyph: { fontSize: 22 },
  pickerName: { color: colors.textSecondary, fontSize: 11, marginTop: 4, fontWeight: '600' },
  // Onda Cenográfica (08/08/2026): o card do signo perdeu a moldura — o glifo
  // grande e o degradê na cor do signo flutuam no cenário. borderRadius +
  // overflow ficam só para o degradê manter cantos suaves, lendo como mancha
  // de luz e não como caixa.
  mainCard: { borderRadius: 18, overflow: 'hidden' },
  // COMPOSIÇÃO CENTRADA (08/08/2026): o card do signo virou COLUNA centrada
  // (mascote em cima, nome, datas, elemento embaixo) em vez de linha à
  // esquerda — o hero simétrico do padrão do concorrente.
  signHeader: { alignItems: 'center', padding: 18 },
  bigGlyph: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  bigGlyphText: { fontSize: 30 },
  // O MASCOTE (08/08/2026): a moldura cresce 4px em volta da arte de 64 para o
  // fundo sign.color+'33' aparecer como aro, em vez de sumir atrás do JPG.
  bigGlyphComMascote: { width: 72, height: 72, borderRadius: 20 },
  mascoteGrande: { width: 64, height: 64, borderRadius: 18 },
  mascotePequeno: { width: 36, height: 36, borderRadius: 12 },
  // O bloco de texto do hero centrado (nome, datas, elemento) — acompanha a
  // coluna do signHeader acima.
  signInfo: { alignItems: 'center' },
  bigName: { color: colors.text, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  bigDates: { color: colors.textMuted, fontSize: 12, marginTop: 2, textAlign: 'center' },
  // As abas no fluxo, não flutuando: desliga o absoluto do PillTabs.
  abasTopo: { position: 'relative', left: 0, right: 0, bottom: 0, marginTop: 12, marginBottom: 2 },
  // A ficha do signo sob o nome — mesmo par rótulo/valor da ficha do Sol.
  // A FICHA DO SIGNO — três colunas de peso igual (12/09/2026).
  // MESMO defeito e MESMA causa do Mapa, medido no navegador em 390px
  // (design/lote-texto-longo/antes/horoscopo-cheio-dobra2-390x844.png): com
  // `minWidth: 72` o rótulo "MODALIDADE" estoura a coluna e invade a vizinha,
  // e as palavras se sobrepõem no print. Largura fixa trocada por flex —
  // a regra de components/FileiraDeTres.js. Um terço da tela por coluna, em
  // qualquer largura, e o rótulo quebra em vez de invadir.
  fichaRow: { flexDirection: 'row', alignItems: 'flex-start', alignSelf: 'stretch', gap: space.junto, marginTop: space.dentro },
  fichaItem: { flex: 1, flexBasis: 0, alignItems: 'center' },
  // O letterSpacing 1.2 do degrau `etiqueta` foi feito pra rótulo SOLTO;
  // em três colunas de 11px numa tela de 390 ele é o que ainda deixava
  // 'POLARIDADE' e 'MODALIDADE' encostadas (medido no navegador). Meia
  // unidade devolve o ar entre as palavras e mantém a maiúscula
  // intencional — a única sobrescrita da fundação aqui, e declarada.
  fichaRotulo: { ...type.etiqueta, letterSpacing: 0.6, color: colors.textMuted, textTransform: 'uppercase', textAlign: 'center' },
  fichaValor: { ...type.apoio, color: colors.text, fontWeight: '700', marginTop: space.grudado, textAlign: 'center' },
  // A FAIXA DO CÉU: faixa é chão e precisa sangrar de ponta a ponta — o
  // ScrollView tem padding 20, que a deixaria ilhada. `secao` em volta é o
  // degrau entre assuntos.
  faixaCeu: { marginHorizontal: -20, marginTop: space.secao, marginBottom: space.secao },
  // A ficha de nascimento sob a ficha do signo — chips e pílula no desenho do
  // CabecalhoIdentidade da Home (mesmas cores, mesmos tamanhos), pra as duas
  // telas lerem como a mesma coisa. Dourado é a única cor de ação do app; o
  // '99' é o alpha da borda, pra não competir com o texto.
  nascimento: { alignItems: 'center', marginTop: 12 },
  chips: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 14 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  chipRotulo: { color: colors.textMuted, fontSize: 11 },
  chipValor: { color: colors.text, fontSize: 13, fontWeight: '700' },
  chipMudo: { color: colors.textMuted },
  nascimentoData: { color: colors.textMuted, fontSize: 11, marginTop: 6 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: colors.gold + '99', borderRadius: 22,
    paddingVertical: 8, paddingHorizontal: 16, marginTop: 10,
  },
  pillTexto: { color: colors.gold, fontSize: 13, fontWeight: '700' },
  elementRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4, gap: 4 },
  element: { fontSize: 12, fontWeight: '700' },
  unavailable: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, padding: 18, paddingTop: 4 },
  // Respiro (08/08/2026): a leitura é o produto — fonte maior, entrelinha
  // generosa (~1.6) e mais ar entre seções. Padrão medido no concorrente:
  // texto de leitura grande com MUITO espaço vazio é o que faz a tela parecer
  // cara. Nada de conteúdo mudou — só a roupa.
  // COMPOSIÇÃO CENTRADA (08/08/2026): título de seção grande e centrado, com
  // muito ar em cima — o padrão medido no concorrente premium (22-26/800,
  // centrado, simétrico). Só a roupa muda; o conteúdo é o mesmo.
  sub: { color: colors.text, fontSize: 22, fontWeight: '800', textAlign: 'center', alignSelf: 'center', marginTop: 34, marginBottom: 14, letterSpacing: 0.2 },
  // Onda Arte Dominante (09/08/2026): o cabeçalho de arte do primeiro bloco —
  // largura total, faixa de ~120 em cover (a arte 256px sobra), cantos 18 como
  // todo card da tela. O marginTop 34 é o respiro que era do título…
  arteBloco: { width: '100%', height: 120, borderRadius: 18, marginTop: 34 },
  // …e o título que vem logo abaixo da arte devolve o respiro (34 → 14) pra
  // colar na imagem como legenda dela, não como seção nova.
  subComArte: { marginTop: 14 },
  factsRow: { flexDirection: 'row', gap: 14 },
  factItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  factIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  factLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  factValue: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  factHint: { color: colors.textMuted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  // Onda Cenográfica (08/08/2026): a leitura SOLTA no cenário — sem fundo nem
  // borda, como no concorrente premium (caixa é só pro interativo e pro
  // recibo). O paddingHorizontal preserva o alinhamento que o texto tinha
  // dentro do card; a única linha que resta é o borderTop do methodToggle.
  // A leitura agora mora numa <ColunaLeitura>, que ja traz o proprio
  // paddingHorizontal (space.dentro) e o maxWidth de legibilidade. Repor 18px
  // aqui somaria dois recuos. Sobra o respiro VERTICAL, que a coluna nao opina.
  blockCard: { alignSelf: 'center' },
  // O Ouvir acompanha a indentação da leitura solta (blockCard = 18) e cola
  // no texto que vai falar.
  ouvirBtn: { marginLeft: 18, marginBottom: 12 },
  // O CORPO DA LEITURA pela escala da fundação (12/09/2026): 17px com
  // entrelinha 27 (~1,6) e peso NORMAL, em cinza claro — a medida tirada do
  // print "Plutão na Casa 7" do concorrente, onde o texto de leitura é o
  // produto. Era 15/25. Sem fontWeight reposto: a lei da fundação é que peso
  // é hierarquia, não ênfase.
  line: { ...type.corpo, color: colors.textSecondary },
  lineSpaced: { marginTop: space.entre },
  // O método é discreto de propósito — menor, apagado, atrás de um toque —, e
  // discreto NÃO é escondido: fica no mesmo cartão do bloco a que se refere,
  // com rótulo próprio, e a ressalva que enquadra a leitura nunca é removida.
  methodToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  methodToggleText: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  methodLine: { color: colors.textMuted, fontSize: 12, lineHeight: 19, marginTop: 8 },
  footerCard: { backgroundColor: colors.surfaceElevated, borderRadius: 18, padding: 14, borderWidth: 1, borderColor: colors.border, marginTop: 24 },
  footerText: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
});
