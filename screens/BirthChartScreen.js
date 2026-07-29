import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
import DatePickerModal from '../components/DatePickerModal';
import CityPickerModal from '../components/CityPickerModal';
import { signoFromDate, moonSign, ascendantSign, houses, aspects, astrocartographyCities } from '../lib/signs';
import { cityLabel } from '../lib/cities';
import { getBirthData } from '../lib/coupleData';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
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
function displaySign(name) {
  if (!name) return null;
  const meta = zodiacSigns.find((z) => z.name === name);
  return { name, glyph: meta ? meta.icon : '', color: meta ? meta.color : colors.textMuted };
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
function buildChart(date, time, city) {
  if (!date) return null;
  const sun = displaySign(signoFromDate(date));
  const moon = displaySign(moonSign(date, time)?.name);
  const asc = time && city ? displaySign(ascendantSign(date, time, city.lat, city.lon, city.utcOffset)?.name) : null;
  const housesList = time && city ? houses(date, time, city.lat, city.lon, city.utcOffset) : null;
  const aspectsList = aspects(date, time);
  const astro = time && city ? astrocartographyCities(date, time, city.utcOffset) : null;
  return { date, time, city, sun, moon, asc, housesList, aspectsList, astro };
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

function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
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

function ChartResult({ chart, isCouple, onFixTime, onFixCity }) {
  const { t } = useLanguage();
  const rows = [
    { ...ROWS_META[0], sign: chart.sun },
    { ...ROWS_META[1], sign: chart.moon },
    { ...ROWS_META[2], sign: chart.asc },
  ];
  return (
    <>
      <View style={styles.summaryCard}>
        <LinearGradient colors={gradients.card} style={styles.summaryInner}>
          <Text style={styles.summaryMeta}>{formatDateBR(chart.date)}{chart.time ? ` · ${chart.time}` : ` · ${t('birthchart.noTime')}`}</Text>
          <View style={styles.trio}>
            {rows.map((r) => (
              <View key={r.key} style={styles.trioItem}>
                <Text style={styles.trioLabel}>{t(r.labelKey)}</Text>
                <Text style={[styles.trioGlyph, { color: r.sign ? r.sign.color : colors.textMuted }]}>{r.sign ? r.sign.glyph : '—'}</Text>
                <Text style={styles.trioSign}>{r.sign ? r.sign.name : '?'}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.sub}>{t('birthchart.positions')}</Text>
      {rows.map((r) => (
        <View key={r.key} style={styles.planetRow}>
          <View style={[styles.planetIcon, { backgroundColor: r.color + '22' }]}>
            <Ionicons name={r.icon} size={20} color={r.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planetLabel}>{r.sign ? t('birthchart.positionIn', { label: t(r.labelKey), sign: r.sign.name }) : t(r.labelKey)}</Text>
            <Text style={styles.planetDesc}>{r.sign ? t(r.descKey) : t(r.missingKey)}</Text>
          </View>
          {r.sign && <Text style={[styles.planetGlyph, { color: r.sign.color }]}>{r.sign.glyph}</Text>}
        </View>
      ))}
      {!chart.asc && <FixNatalDataCTA isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />}

      <HousesSection housesList={chart.housesList} isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />
      <AspectsSection aspectsList={chart.aspectsList} />
      <AstroCartographySection astro={chart.astro} isCouple={isCouple} onFixTime={onFixTime} onFixCity={onFixCity} />
    </>
  );
}

// Casas — sistema Casas Inteiras (Whole Sign): Casa 1 = signo do Ascendente.
// Pede hora exata + cidade real (mesma exigência do Ascendente, já que vem do
// mesmo grau exato) — sem isso, mostra o mesmo tipo de aviso honesto já usado
// pro Ascendente, nunca uma casa fabricada.
function HousesSection({ housesList, isCouple, onFixTime, onFixCity }) {
  return (
    <>
      <Text style={styles.sub}>Casas (Casas Inteiras)</Text>
      {housesList ? (
        <View style={styles.housesGrid}>
          {housesList.map((h) => (
            <View key={h.houseNumber} style={styles.houseCell}>
              <Text style={styles.houseNumber}>Casa {h.houseNumber}</Text>
              <Text style={[styles.houseSign, { color: (zodiacSigns.find((z) => z.name === h.sign.name) || {}).color || colors.text }]}>
                {h.sign.emoji} {h.sign.name}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <>
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>
              As Casas pedem hora exata e cidade de nascimento (mesma exigência do Ascendente) — adicione os dois para descobrir.
            </Text>
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
  return (
    <>
      <Text style={styles.sub}>Aspectos</Text>
      {aspectsList ? (
        aspectsList.length > 0 ? (
          aspectsList.map((a, i) => (
            <View key={`${a.planetA}-${a.planetB}-${i}`} style={styles.aspectRow}>
              <Text style={styles.aspectText}>
                {a.planetA} {a.aspectType.toLowerCase()} {a.planetB}
              </Text>
              <Text style={styles.aspectOrb}>orbe {a.orb.toFixed(1)}°</Text>
            </View>
          ))
        ) : (
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>Nenhum aspecto maior encontrado dentro do orbe padrão para esta data.</Text>
          </View>
        )
      ) : (
        <View style={styles.planetRow}>
          <Text style={styles.planetDesc}>Não foi possível calcular os aspectos agora.</Text>
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
  return (
    <>
      <Text style={styles.sub}>Astrocartografia (prévia por cidades)</Text>
      <Text style={styles.mutedNote}>
        Prévia textual com cidades notáveis — ainda não é um mapa interativo completo.
      </Text>
      {astro ? (
        astro.length > 0 ? (
          astro.map((a, i) => (
            <View key={`${a.city}-${a.planet}-${a.point}-${i}`} style={styles.aspectRow}>
              <Text style={styles.aspectText}>
                {a.planet} perto de {a.point} em {a.city}
              </Text>
              <Text style={styles.aspectOrb}>orbe {a.orb.toFixed(1)}°</Text>
            </View>
          ))
        ) : (
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>Nenhum planeta caiu angular em nenhuma das cidades notáveis para esta data/hora.</Text>
          </View>
        )
      ) : (
        <>
          <View style={styles.planetRow}>
            <Text style={styles.planetDesc}>
              A astrocartografia pede hora exata e cidade de nascimento (mesma exigência do Ascendente) — adicione os dois para descobrir.
            </Text>
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
  const { t } = useLanguage();
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
  const coupleChart = selectedBirth?.date ? buildChart(selectedBirth.date, selectedBirth.time, selectedCity) : null;
  const soloChart = soloBirth?.date ? buildChart(soloBirth.date, soloBirth.time, soloBirth.city) : null;

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
      const partes = [`Sol em ${activeChart.sun.name}`];
      if (activeChart.moon?.name) partes.push(`Lua em ${activeChart.moon.name}`);
      if (activeChart.asc?.name) partes.push(`Ascendente em ${activeChart.asc.name}`);
      recordReadingCompletion({
        type: 'birthchart',
        typeLabel: 'Mapa Astral',
        title: 'Mapa Astral',
        body: partes.join(', ') + '.',
      });
      AsyncStorage.setItem(DIARY_RECORDED_KEY, iso);
    });
  }, [activeChart?.sun?.name, activeChart?.moon?.name, activeChart?.asc?.name]);

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Mapa Astral" gradient={['#3A4AB5', '#6C7BFF']} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Mapa Astral" subtitle="Seu retrato cósmico" onBack={() => navigation.goBack()} gradient={['#3A4AB5', '#6C7BFF']} />
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
                <Text style={styles.formTitle}>Dados de nascimento</Text>
                <Text style={styles.mutedNote}>
                  Não encontramos a data de nascimento de {person === 'voce' ? coupleData.voce : coupleData.amor}. Refaça o Quiz do Casal (em Perfil) para calcular o mapa astral.
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
                <View style={styles.formCard}>
                  <Text style={styles.formTitle}>Dados de nascimento</Text>
                  <Text style={styles.dateReadout}>
                    {formatDateBR(selectedBirth.date)}{selectedBirth.time ? ` · ${selectedBirth.time}` : ' · hora não informada'}
                  </Text>
                  <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerOpen(true)}>
                    <Ionicons name="location" size={16} color={colors.textMuted} />
                    <Text style={[styles.dateBtnText, !selectedCity && styles.dateBtnPlaceholder]}>
                      {selectedCity ? cityLabel(selectedCity) : 'Adicionar cidade (para o Ascendente)'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {coupleChart && (
                  <ChartResult chart={coupleChart} isCouple onFixTime={onFixTime} onFixCity={abrirCidade} />
                )}
              </>
            )}
          </>
        ) : (
          <>
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Dados de nascimento</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setSoloDatePickerOpen(true)}>
                <Ionicons name="calendar" size={16} color={colors.textMuted} />
                <Text style={[styles.dateBtnText, !soloDate && styles.dateBtnPlaceholder]}>
                  {soloDate ? formatDateBR(soloDate) : 'Data de nascimento'}
                </Text>
              </TouchableOpacity>

              <View style={styles.horaRow}>
                <View style={[styles.field, styles.horaField]}>
                  <Ionicons name="time" size={18} color={colors.textMuted} />
                  <TextInput
                    ref={horaRef}
                    style={styles.input}
                    placeholder="Hora"
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
                    placeholder="Min"
                    placeholderTextColor={colors.textMuted}
                    value={soloHoraM}
                    onChangeText={setSoloHoraM}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>
              </View>
              <Text style={styles.mutedNote}>Hora é opcional, mas revela o Ascendente (junto com a cidade).</Text>

              <TouchableOpacity style={styles.dateBtn} onPress={() => setCityPickerOpen(true)}>
                <Ionicons name="location" size={16} color={colors.textMuted} />
                <Text style={[styles.dateBtnText, !soloCity && styles.dateBtnPlaceholder]}>
                  {soloCity ? cityLabel(soloCity) : 'Cidade de nascimento (opcional)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} onPress={generateSolo} style={styles.btnWrap} disabled={!soloDate}>
                <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                  <Ionicons name="planet" size={18} color="#fff" />
                  <Text style={styles.btnText}>Gerar Mapa Astral</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {soloChart && (
              <ChartResult chart={soloChart} isCouple={false} onFixTime={onFixTime} onFixCity={abrirCidade} />
            )}
          </>
        )}
      </ScrollView>

      <DatePickerModal
        visible={soloDatePickerOpen}
        title="Data de nascimento"
        initialDate={soloDate || undefined}
        onClose={() => setSoloDatePickerOpen(false)}
        onConfirm={(dateStr) => setSoloDate(dateStr)}
      />

      <CityPickerModal
        visible={cityPickerOpen}
        hasSelection={!!(isCouple ? selectedCity : soloCity)}
        onClose={() => setCityPickerOpen(false)}
        onSelect={selectCity}
        onClear={clearCity}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  formCard: { backgroundColor: colors.surface, borderRadius: 18, padding: 18, borderWidth: 1, borderColor: colors.border },
  formTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginBottom: 14 },
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
  summaryCard: { marginTop: 20, borderRadius: 18, overflow: 'hidden' },
  summaryInner: { padding: 20, borderWidth: 1, borderColor: colors.border, borderRadius: 18 },
  summaryMeta: { color: colors.textMuted, fontSize: 13 },
  trio: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 18 },
  trioItem: { alignItems: 'center' },
  trioLabel: { color: colors.textMuted, fontSize: 12 },
  trioGlyph: { fontSize: 30, marginVertical: 6 },
  trioSign: { color: colors.text, fontSize: 14, fontWeight: '700' },
  sub: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: 24, marginBottom: 12 },
  planetRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  planetIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  planetLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  planetDesc: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  planetGlyph: { fontSize: 24 },
  housesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  houseCell: { width: '31%', backgroundColor: colors.surface, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  houseNumber: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  houseSign: { fontSize: 13, fontWeight: '700', marginTop: 4, textAlign: 'center' },
  aspectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
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
