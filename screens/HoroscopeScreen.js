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
import { colors, gradients, zodiacSigns } from '../theme';
import CosmicScene from '../components/CosmicScene';
import GradientHeader from '../components/GradientHeader';
import WaveDivider from '../components/WaveDivider';
import OneTimeLock from '../components/OneTimeLock';
// AS SUB-ABAS PÍLULA (09/08/2026, Onda Diagramação Espelho) — Ontem/Hoje/Amanhã
// saíram da fileira no topo do rolo e flutuam na pílula em cima do dock, como
// no concorrente. Mesmos ids internos, mesmas chaves de label — só o lugar.
import PillTabs from '../components/PillTabs';
// O BOTÃO "OUVIR" (08/08/2026) — a leitura do bloco em voz alta, com a voz do
// aparelho (Web Speech API, lib/voz.js). Em plataforma sem a API ele devolve
// null sozinho — nenhum gate aqui.
import BotaoOuvir from '../components/BotaoOuvir';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { horoscopeFor, resumoDoDia } from '../lib/dailyHoroscope';
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

// Elementos vêm de theme.js em PT ('Fogo'/'Terra'/'Ar'/'Água') e são usados
// como dado — aqui só mapeamos pro rótulo traduzível.
const ELEMENT_LABEL_KEYS = {
  Fogo: 'horoscope.elementName.fogo',
  Terra: 'horoscope.elementName.terra',
  Ar: 'horoscope.elementName.ar',
  'Água': 'horoscope.elementName.agua',
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

// lib/dailyHoroscope.js devolve vars que podem ser string (nome de signo, graus)
// ou { i18n: 'chave' } (nome de planeta, dia da semana). O módulo é puro e não
// conhece idioma; a resolução acontece aqui, onde o `t` do idioma ativo existe.
function resolveVars(vars, t) {
  if (!vars) return undefined;
  const out = {};
  for (const k of Object.keys(vars)) {
    const v = vars[k];
    out[k] = v && typeof v === 'object' && v.i18n ? t(v.i18n) : v;
  }
  return out;
}

export default function HoroscopeScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  const { hasAccess, accessConfirmed } = useCouple();
  const { t } = useLanguage();
  const [sign, setSign] = useState(route.params?.sign || zodiacSigns[0]);
  const [tab, setTab] = useState('Hoje');
  const [showPicker, setShowPicker] = useState(false);
  const [locked, setLocked] = useState(false);
  // Qual bloco está com o método aberto. Começa tudo fechado, e é assim de
  // propósito: a fonte tem que estar A UM TOQUE, não em primeiro plano. Estado
  // por bloco (e não um interruptor geral) porque quem abre a régua do aspecto
  // não está necessariamente querendo reler Plínio no mesmo instante.
  const [metodoAberto, setMetodoAberto] = useState({});

  // lib/dailyHoroscope.js já guarda o céu de cada data em memória, mas o
  // useMemo evita até o trabalho de remontar os blocos a cada render — a tela
  // re-renderiza no toque do seletor de signo e na troca de aba.
  const leitura = useMemo(() => horoscopeFor(sign.name, dateForTab(tab)), [sign.name, tab]);
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
  // REAL do dia — se o motor de efeméride não responder, resumoDoDia devolve
  // null e o Diário simplesmente não recebe entrada, em vez de guardar uma
  // frase inventada para sempre.
  useEffect(() => {
    const today = todayISO();
    AsyncStorage.getItem(DIARY_RECORDED_KEY).then((lastDate) => {
      if (lastDate === today) return;
      const resumo = resumoDoDia(sign.name, new Date());
      if (!resumo) return;
      recordReadingCompletion({
        type: 'horoscope',
        typeLabel: t('home.card.horoscope.title'),
        title: t('horoscope.diary.title', { sign: sign.pt }),
        body: resumo,
      }).then(() => AsyncStorage.setItem(DIARY_RECORDED_KEY, today));
    });
  }, [sign]);

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
        subtitle={sign.pt}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => setShowPicker(!showPicker)}>
            <Ionicons name="swap-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        }
      />
      {/* paddingBottom 120: a pílula de abas flutua sobre o fim do rolo — sem
          esse respiro ela cobriria o footerCard (contrato do PillTabs: ≥96;
          120 dá folga pro card de duas linhas). */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
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
                    <Text style={styles.pickerName}>{z.pt}</Text>
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
              <Text style={styles.bigName}>{sign.pt}</Text>
              <Text style={styles.bigDates}>{sign.dates}</Text>
              <View style={styles.elementRow}>
                <Ionicons name="flash" size={12} color={sign.color} />
                <Text style={[styles.element, { color: sign.color }]}>{t('horoscope.element', { element: ELEMENT_LABEL_KEYS[sign.element] ? t(ELEMENT_LABEL_KEYS[sign.element]) : sign.element })}</Text>
              </View>
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
                .map((line) => t(line.key, resolveVars(line.vars, t)))
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
                  <View style={styles.blockCard} testID={`horoscope-block-${bloco.id}`}>
                    {leituraLinhas.map((line, i) => (
                      <Text key={line.key + i} style={[styles.line, i > 0 && styles.lineSpaced]}>
                        {t(line.key, resolveVars(line.vars, t))}
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
                              {t(line.key, resolveVars(line.vars, t))}
                            </Text>
                          ))}
                      </>
                    )}
                  </View>
                  {/* O céu bruto do dia, logo depois da primeira leitura: os
                      mesmos três fatos de sempre (nada foi apagado), agora no
                      lugar de recibo. */}
                  {indice === 0 && <FichaDoCeu f={f} t={t} />}
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

      {/* As sub-abas de período, flutuando em cima do dock — DEPOIS do
          ScrollView na árvore, como o contrato do PillTabs pede. Os ids
          seguem sendo as strings internas de TABS ('Ontem'/'Hoje'/'Amanhã'),
          que dateForTab compara; só o label passa pelo t(). */}
      <PillTabs
        items={TABS.map((tabName) => ({ id: tabName, label: t(TAB_LABEL_KEYS[tabName]) }))}
        activeId={tab}
        onSelect={(id) => { Haptics.selectionAsync(); setTab(id); }}
      />
    </View>
  );
}

// Mesmo mapa de lib/dailyHoroscope.js — aqui só para o chip do regente do dia
// reaproveitar o nome já traduzido em grounding.ruler.<slug>.name.
function slugPlaneta(planeta) {
  return {
    'Sol': 'sol', 'Lua': 'lua', 'Mercúrio': 'mercurio', 'Vênus': 'venus',
    'Marte': 'marte', 'Júpiter': 'jupiter', 'Saturno': 'saturno',
  }[planeta] || 'sol';
}

// A FICHA DO CÉU — os três fatos brutos, no lugar exato onde ficavam a cor, o
// número e a hora "da sorte". Ali havia literal sorteado; aqui há efeméride.
// Virou componente em 04/08/2026 só para poder DESCER sem perder nada: ela é
// renderizada depois do primeiro bloco de leitura, e o arquivo a declara aqui
// embaixo para que a ordem do código-fonte conte a mesma história que a tela.
function FichaDoCeu({ f, t }) {
  return (
    <>
      <Text style={styles.sub}>{t('horoscope.sky.factsTitle')}</Text>
      <View style={styles.factsRow}>
        <FactItem
          icon="moon"
          color={colors.teal}
          label={t('horoscope.sky.fact.moon')}
          value={`${f.luaEmoji || ''} ${f.luaSigno}`.trim()}
        />
        <FactItem
          icon="ellipse"
          color={colors.gold}
          label={t('horoscope.sky.fact.phase')}
          value={`${f.faseEmoji || ''} ${f.faseNome}`.trim()}
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
  blockCard: { paddingHorizontal: 18 },
  // O Ouvir acompanha a indentação da leitura solta (blockCard = 18) e cola
  // no texto que vai falar.
  ouvirBtn: { marginLeft: 18, marginBottom: 12 },
  line: { color: colors.textSecondary, fontSize: 15, lineHeight: 25 },
  lineSpaced: { marginTop: 12 },
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
