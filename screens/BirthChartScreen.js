import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import { colors, gradients, zodiacSigns } from '../theme';
import GradientHeader from '../components/GradientHeader';
import DatePickerModal from '../components/DatePickerModal';
import { signoFromDate, moonSign, ascendantSign, houses, aspects, astrocartographyCities } from '../lib/signs';
import { searchCities, cityLabel } from '../lib/cities';
import { getBirthData } from '../lib/coupleData';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import OneTimeLock from '../components/OneTimeLock';

const FEATURE_KEY = 'birthchart';

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
// stub vazio) — sem try/catch, ler/gravar aqui rejeitaria a Promise sem tratamento
// e quebraria a tela inteira na build web (este app é publicado como web export).
// Mesmo padrão de proteção já usado em lib/coupleData.js (readSecureJSON/saveCoupleProfile).
async function readSecureItem(key) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function writeSecureItem(key, value) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {}
}

function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

const ROWS_META = [
  { key: 'Sol', label: 'Sol', desc: 'Sua essência e identidade', icon: 'sunny', color: '#FFB84D', missing: 'Informe a data de nascimento para calcular.' },
  { key: 'Lua', label: 'Lua', desc: 'Suas emoções e instintos', icon: 'moon', color: '#5CA8FF', missing: 'Não foi possível calcular a Lua agora.' },
  { key: 'Asc', label: 'Ascendente', desc: 'Como o mundo te vê', icon: 'trending-up', color: '#B57BFF', missing: 'O Ascendente pede hora exata e cidade de nascimento — adicione os dois para descobrir.' },
];

function ChartResult({ chart }) {
  const rows = [
    { ...ROWS_META[0], sign: chart.sun },
    { ...ROWS_META[1], sign: chart.moon },
    { ...ROWS_META[2], sign: chart.asc },
  ];
  return (
    <>
      <View style={styles.summaryCard}>
        <LinearGradient colors={gradients.card} style={styles.summaryInner}>
          <Text style={styles.summaryMeta}>{formatDateBR(chart.date)}{chart.time ? ` · ${chart.time}` : ' · hora não informada'}</Text>
          <View style={styles.trio}>
            {rows.map((r) => (
              <View key={r.key} style={styles.trioItem}>
                <Text style={styles.trioLabel}>{r.label}</Text>
                <Text style={[styles.trioGlyph, { color: r.sign ? r.sign.color : colors.textMuted }]}>{r.sign ? r.sign.glyph : '—'}</Text>
                <Text style={styles.trioSign}>{r.sign ? r.sign.name : '?'}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
      </View>

      <Text style={styles.sub}>Posições</Text>
      {rows.map((r) => (
        <View key={r.key} style={styles.planetRow}>
          <View style={[styles.planetIcon, { backgroundColor: r.color + '22' }]}>
            <Ionicons name={r.icon} size={20} color={r.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planetLabel}>{r.sign ? `${r.label} em ${r.sign.name}` : r.label}</Text>
            <Text style={styles.planetDesc}>{r.sign ? r.desc : r.missing}</Text>
          </View>
          {r.sign && <Text style={[styles.planetGlyph, { color: r.sign.color }]}>{r.sign.glyph}</Text>}
        </View>
      ))}

      <HousesSection housesList={chart.housesList} />
      <AspectsSection aspectsList={chart.aspectsList} />
      <AstroCartographySection astro={chart.astro} />
    </>
  );
}

// Casas — sistema Casas Inteiras (Whole Sign): Casa 1 = signo do Ascendente.
// Pede hora exata + cidade real (mesma exigência do Ascendente, já que vem do
// mesmo grau exato) — sem isso, mostra o mesmo tipo de aviso honesto já usado
// pro Ascendente, nunca uma casa fabricada.
function HousesSection({ housesList }) {
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
        <View style={styles.planetRow}>
          <Text style={styles.planetDesc}>
            As Casas pedem hora exata e cidade de nascimento (mesma exigência do Ascendente) — adicione os dois para descobrir.
          </Text>
        </View>
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
function AstroCartographySection({ astro }) {
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
        <View style={styles.planetRow}>
          <Text style={styles.planetDesc}>
            A astrocartografia pede hora exata e cidade de nascimento (mesma exigência do Ascendente) — adicione os dois para descobrir.
          </Text>
        </View>
      )}
    </>
  );
}

// Mesmo padrão de busca de cidade do QuizScreen.js (TextInput + FlatList sobre
// lib/cities.js), reaproveitado aqui num único modal compartilhado entre modo
// solo e casal (o chamador decide o que fazer com a cidade escolhida).
function CityPickerModal({ visible, hasSelection, onClose, onSelect, onClear }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const results = searchCities(query);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, styles.citySheet]}>
          <Text style={styles.modalTitle}>Cidade de nascimento</Text>
          <TextInput
            style={styles.citySearchInput}
            placeholder="Buscar cidade..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="words"
            autoCorrect={false}
          />
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            style={styles.cityList}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.mutedCenter}>Nenhuma cidade encontrada.</Text>}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityItem} onPress={() => onSelect(item)}>
                <Text style={styles.cityItemText}>{cityLabel(item)}</Text>
              </TouchableOpacity>
            )}
          />
          <View style={styles.modalActions}>
            {hasSelection ? (
              <TouchableOpacity style={styles.btnGhost} onPress={onClear}>
                <Text style={styles.btnGhostText}>Remover cidade</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.btnGhost} onPress={onClose}>
                <Text style={styles.btnGhostText}>Pular (opcional)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
              <Text style={styles.btnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function BirthChartScreen() {
  const navigation = useNavigation();
  const { coupleData, loading: coupleLoading, hasAccess } = useCouple();
  const isCouple = !!coupleData;

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

  useEffect(() => {
    if (hasAccess) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setLocked);
  }, [hasAccess]);

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

  if (!hasAccess && locked) {
    return <OneTimeLock featureTitle="Mapa Astral" gradient={['#3A4AB5', '#6C7BFF']} />;
  }

  return (
    <View style={styles.root}>
      <GradientHeader title="Mapa Astral" subtitle="Seu retrato cósmico" onBack={() => navigation.goBack()} gradient={['#3A4AB5', '#6C7BFF']} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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

                {coupleChart && <ChartResult chart={coupleChart} />}
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

            {soloChart && <ChartResult chart={soloChart} />}
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  citySheet: { maxHeight: '80%' },
  modalTitle: { color: colors.text, fontSize: 16, fontWeight: '800', textAlign: 'center', marginBottom: 12 },
  citySearchInput: { backgroundColor: colors.surfaceElevated, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.text, fontSize: 15, borderWidth: 1, borderColor: colors.border, marginBottom: 10 },
  cityList: { maxHeight: 260 },
  cityItem: { paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.border },
  cityItemText: { color: colors.text, fontSize: 15 },
  mutedCenter: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  modalBtn: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 26, alignItems: 'center' },
  btnGhost: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
});
