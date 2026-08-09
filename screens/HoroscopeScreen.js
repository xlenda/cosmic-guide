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
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, gradients, zodiacSigns } from '../theme';
import CosmicScene from '../components/CosmicScene';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { horoscopeFor, resumoDoDia } from '../lib/dailyHoroscope';
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
          pede. Cards continuam com surface própria: legibilidade não negocia. */}
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
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
        {showPicker && (
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>{t('horoscope.pickerTitle')}</Text>
            <View style={styles.pickerGrid}>
              {zodiacSigns.map((z) => (
                <TouchableOpacity
                  key={z.name}
                  style={[styles.pickerItem, sign.name === z.name && { backgroundColor: z.color + '33', borderColor: z.color }]}
                  onPress={() => pickSign(z)}
                >
                  <Text style={[styles.pickerGlyph, { color: z.color }]}>{z.icon}</Text>
                  <Text style={styles.pickerName}>{z.pt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tabs}>
          {TABS.map((tabName) => (
            <TouchableOpacity
              key={tabName}
              style={[styles.tab, tab === tabName && styles.tabActive]}
              onPress={() => { Haptics.selectionAsync(); setTab(tabName); }}
            >
              <Text style={[styles.tabText, tab === tabName && styles.tabTextActive]}>{t(TAB_LABEL_KEYS[tabName])}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.mainCard}>
          <LinearGradient colors={[sign.color + '44', 'transparent']} style={styles.signHeader}>
            <View style={[styles.bigGlyph, { backgroundColor: sign.color + '33' }]}>
              <Text style={[styles.bigGlyphText, { color: sign.color }]}>{sign.icon}</Text>
            </View>
            <View>
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
              return (
                <View key={bloco.id}>
                  <Text style={styles.sub}>{t(bloco.titleKey)}</Text>
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
  tabs: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 9, alignItems: 'center' },
  tabActive: { backgroundColor: colors.accent },
  tabText: { color: colors.textMuted, fontWeight: '700', fontSize: 14 },
  tabTextActive: { color: '#fff' },
  mainCard: { backgroundColor: colors.surface, borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  signHeader: { flexDirection: 'row', alignItems: 'center', padding: 18 },
  bigGlyph: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  bigGlyphText: { fontSize: 30 },
  bigName: { color: colors.text, fontSize: 20, fontWeight: '800' },
  bigDates: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  elementRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  element: { fontSize: 12, fontWeight: '700' },
  unavailable: { color: colors.textSecondary, fontSize: 15, lineHeight: 24, padding: 18, paddingTop: 4 },
  // Respiro (08/08/2026): a leitura é o produto — fonte maior, entrelinha
  // generosa (~1.6) e mais ar entre seções. Padrão medido no concorrente:
  // texto de leitura grande com MUITO espaço vazio é o que faz a tela parecer
  // cara. Nada de conteúdo mudou — só a roupa.
  sub: { color: colors.text, fontSize: 17, fontWeight: '800', marginTop: 28, marginBottom: 12 },
  factsRow: { flexDirection: 'row', gap: 14 },
  factItem: { flex: 1, backgroundColor: colors.surface, borderRadius: 18, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  factIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  factLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center' },
  factValue: { color: colors.text, fontSize: 13, fontWeight: '800', marginTop: 2, textAlign: 'center' },
  factHint: { color: colors.textMuted, fontSize: 10, marginTop: 2, textAlign: 'center' },
  blockCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border },
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
