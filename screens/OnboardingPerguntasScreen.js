// O ONBOARDING-RECOMPENSA (09/08/2026) — o melhor momento do app concorrente,
// replicado com os motores da casa: UMA pergunta por tela (nome → data →
// horário com saída honesta → cidade) e CADA resposta devolve algo visual no
// centro — a data acende o signo solar com o MASCOTE (lib/ilustracoes.js), e
// hora+cidade acendem Lua/Ascendente ao lado dele. Fecha com a leitura em
// SLIDES (components/StoriesReader.js) e só então grava e cai nas tabs.
//
// NÃO É ROTA. É componente de tela cheia renderizado por
// OnboardingChoiceScreen quando a pessoa escolhe "Pra mim" — zero fiação em
// App.js/routes.js ([AUTO-DECISION]: menos fiação = menos superfície de
// regressão no Gate; voltar do passo 1 devolve pra escolha via onVoltar, e
// fechar/reabrir o app cai no início limpo porque nada daqui persiste antes
// do Concluir). O atalho "já sei meu signo" (onAtalhoSigno) leva pro grid de
// 12 signos DE SEMPRE, intocado, na tela mãe — nenhum beco sem saída.
//
// GRAVAÇÃO 100% compatível com o que o app já lê (nada novo no storage):
//   - userSign: o OBJETO de theme.js zodiacSigns, via saveSolo() do
//     CoupleContext — byte-idêntico ao que o grid grava (pickSign).
//   - birthChartSolo: { date, time|null, city|null } via
//     writeSecureItemWithMirror + saveSoloBirthMirror — byte-idêntico ao
//     generateSolo() do BirthChartScreen; o Mapa e o Céu de Hoje da Home
//     enxergam o nascimento sem saber que o onboarding mudou.
//   - O NOME não persiste em lugar nenhum ([AUTO-DECISION]): nenhuma tela do
//     app consome nome solo hoje (home.greetingSolo usa {sign}), e gravar um
//     dado pessoal que ninguém lê criaria superfície de LGPD fora da lista de
//     deleteAllCoupleData. Ele vive só na saudação dos slides.
//
// AS LEITURAS DOS SLIDES NUNCA NASCEM AQUI: são birthchart.positionIn +
// birthchart.row.*.desc (e o .missing honesto do Ascendente) — os MESMOS
// textos que o Mapa Astral mostra. Sol/Lua/Asc saem de lib/signs.js com as
// MESMAS chamadas de buildChart (BirthChartScreen): signoFromDate(date) puro,
// moonSign(date, time, city), ascendantSign SÓ com hora e cidade reais — sem
// hora/cidade, nada é inventado (nem meia-noite chutada, nem Asc de meio-dia).
//
// Funil: onboarding_start('solo') já disparou em escolherSolo() na tela mãe
// (inalterado); aqui só o onboarding_done('solo') DEPOIS do saveSolo ok —
// mesma regra de sempre: cadastro que falhou no storage não conta concluído.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, zodiacSigns } from '../theme';
import CosmicScene from '../components/CosmicScene';
import StoriesReader from '../components/StoriesReader';
import DatePickerModal from '../components/DatePickerModal';
import CityPickerModal from '../components/CityPickerModal';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import { funnel } from '../lib/funnel';
import { signoFromDate, moonSign, ascendantSign } from '../lib/signs';
import { nomeDoSigno } from '../lib/synastry';
import { mascoteDoSigno } from '../lib/ilustracoes';
import { writeSecureItemWithMirror, saveSoloBirthMirror } from '../lib/birthData';
import { cityLabel } from '../lib/cities';

const ANO_ATUAL = new Date().getFullYear();
const ITEM_ALTURA = 44;
const HORAS = Array.from({ length: 24 }, (_, i) => i);
const MINUTOS = Array.from({ length: 60 }, (_, i) => i);

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDateBR(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

// Coluna rolável de números — mesmo desenho do PickerColumn interno de
// DatePickerModal (não exportado lá; duplicar 20 linhas é mais barato que
// mexer num componente que Timeline já usa).
function ColunaNumeros({ dados, selecionado, aoEscolher }) {
  const idx = Math.max(0, dados.indexOf(selecionado));
  return (
    <FlatList
      data={dados}
      keyExtractor={(item) => String(item)}
      style={styles.coluna}
      showsVerticalScrollIndicator={false}
      initialScrollIndex={idx}
      getItemLayout={(_, i) => ({ length: ITEM_ALTURA, offset: ITEM_ALTURA * i, index: i })}
      renderItem={({ item }) => {
        const sel = item === selecionado;
        return (
          <TouchableOpacity
            style={[styles.colunaItem, sel && styles.colunaItemSel]}
            onPress={() => aoEscolher(item)}
          >
            <Text style={[styles.colunaTexto, sel && styles.colunaTextoSel]}>{pad2(item)}</Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

export default function OnboardingPerguntasScreen({ onVoltar, onAtalhoSigno }) {
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const { saveSolo } = useCouple();

  // 0 nome · 1 data · 2 hora · 3 cidade · 4 revelação. Nada persiste até o
  // Concluir dos slides — abandonar no meio nunca deixa perfil pela metade.
  const [passo, setPasso] = useState(0);
  const [nome, setNome] = useState('');
  const [data, setData] = useState(null);
  const [horaH, setHoraH] = useState(null);
  const [horaM, setHoraM] = useState(null);
  const [semHora, setSemHora] = useState(false);
  const [cidade, setCidade] = useState(null);
  const [dataAberta, setDataAberta] = useState(false);
  const [cidadeAberta, setCidadeAberta] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const hora = !semHora && horaH != null && horaM != null ? `${pad2(horaH)}:${pad2(horaM)}` : null;

  // O TRIO, pelas MESMAS chamadas de buildChart (BirthChartScreen.js):
  // Sol só com a data (byte-compatível com o Mapa — divergir aqui seria o app
  // dizendo dois signos pra mesma pessoa), Lua com o que houver (meio-dia é a
  // aproximação documentada do motor), Ascendente SÓ com hora e cidade reais.
  const sol = useMemo(() => (data ? signoFromDate(data) : null), [data]);
  const lua = useMemo(
    () => (data ? (moonSign(data, hora, cidade || undefined) || {}).name || null : null),
    [data, hora, cidade]
  );
  const asc = useMemo(
    () =>
      data && hora && cidade
        ? (ascendantSign(data, hora, cidade.lat, cidade.lon, cidade) || {}).name || null
        : null,
    [data, hora, cidade]
  );

  // RECOMPENSA 1: o mascote entra com spring quando o Sol é descoberto.
  // Driver JS na web (mesma decisão de StoriesReader/BreathGuide).
  const aparecer = useRef(new Animated.Value(0)).current;
  const solExiste = !!sol;
  useEffect(() => {
    if (!solExiste) return;
    aparecer.setValue(0);
    Animated.spring(aparecer, {
      toValue: 1,
      friction: 6,
      tension: 60,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solExiste]);

  // RECOMPENSA 2: Lua/Ascendente acendem ao lado do mascote na revelação
  // (logo depois de hora+cidade respondidas). Fade simples.
  const parFade = useRef(new Animated.Value(0)).current;
  const parAceso = passo === 4 && (!!lua || !!asc);
  useEffect(() => {
    if (!parAceso) {
      parFade.setValue(0);
      return;
    }
    Animated.timing(parFade, {
      toValue: 1,
      duration: 450,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parAceso]);

  // Os SLIDES — saudação com o nome + as leituras que o Mapa já mostra
  // (positionIn + row.desc; o Asc sem hora/cidade vira o .missing honesto,
  // que também é o convite pra completar depois no Mapa). Nada redigido aqui.
  const slides = useMemo(() => {
    const linha = (rowKey, signo) =>
      `${t('birthchart.positionIn', {
        label: t(`birthchart.row.${rowKey}.label`),
        sign: nomeDoSigno(signo, lang),
      })}. ${t(`birthchart.row.${rowKey}.desc`)}.`;
    const out = [t('onboarding.q.slides.greeting', { name: nome.trim() })];
    if (sol) out.push(linha('sun', sol));
    if (lua) out.push(linha('moon', lua));
    out.push(asc ? linha('asc', asc) : t('birthchart.row.asc.missing'));
    out.push(t('onboarding.q.slides.closing'));
    return out;
  }, [t, lang, nome, sol, lua, asc]);

  function voltar() {
    if (salvando) return;
    if (passo === 0) {
      onVoltar();
      return;
    }
    setErro('');
    setPasso(passo - 1);
  }

  function avancar() {
    Haptics.selectionAsync();
    setPasso(passo + 1);
  }

  // Grava TUDO e entrega pro Gate — só no fim dos slides (ou no retry após
  // erro). Ordem: nascimento primeiro (falha ali não trava nada — o Mapa pede
  // de novo), userSign por último porque é ele que vira a chave do Gate.
  async function concluir() {
    setLendo(false);
    if (salvando) return;
    setSalvando(true);
    setErro('');
    try {
      if (data) {
        const registro = { date: data, time: hora || null, city: cidade || null };
        await writeSecureItemWithMirror('birthChartSolo', JSON.stringify(registro));
        await saveSoloBirthMirror(registro);
      }
      const signoObj = zodiacSigns.find((z) => z.name === sol);
      const ok = signoObj ? await saveSolo(signoObj) : false;
      if (!ok) {
        setSalvando(false);
        setErro(t('onboarding.saveError'));
        return;
      }
      // Só DEPOIS do ok — mesma regra do grid (pickSign): cadastro que falhou
      // no storage não aparece concluído no relatório.
      funnel.onboardingDone('solo');
      // Sem setSalvando(false) no caminho feliz: soloSign no contexto faz o
      // Gate (App.js) trocar esta árvore inteira pelo Tab.Navigator sozinho.
    } catch {
      setSalvando(false);
      setErro(t('onboarding.saveError'));
    }
  }

  const nomeOk = nome.trim().length > 0;
  const horaOk = horaH != null && horaM != null;

  // O PALCO — o círculo central com o mascote do signo solar (glifo colorido
  // como reserva, mesma regra de mascoteDoSigno: arte é upgrade, nunca
  // dependência) e, na revelação, os medalhões de Lua e Ascendente ao lado.
  // CHAMADO COMO FUNÇÃO ({palco()}), nunca como <Palco/>: definido dentro do
  // componente, como elemento JSX ele seria um TIPO novo a cada render e o
  // React remontaria mascote e medalhões a cada toque na tela.
  function palco({ compacto } = {}) {
    if (!sol) return null;
    const mascote = mascoteDoSigno(sol);
    const tema = zodiacSigns.find((z) => z.name === sol);
    return (
      <View style={[styles.palco, compacto && styles.palcoCompacto]}>
        <View style={styles.palcoLinha}>
          {parAceso && lua ? (
            <Animated.View style={[styles.medalha, { opacity: parFade }]}>
              <Text style={styles.medalhaGlifo}>🌙</Text>
              <Text style={styles.medalhaRotulo}>{t('birthchart.row.moon.label')}</Text>
              <Text style={styles.medalhaSigno}>{nomeDoSigno(lua, lang)}</Text>
            </Animated.View>
          ) : (
            <View style={styles.medalhaVaga} />
          )}
          <Animated.View
            style={[
              styles.planeta,
              compacto && styles.planetaCompacto,
              {
                opacity: aparecer,
                transform: [
                  { scale: aparecer.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
                ],
              },
            ]}
          >
            {mascote ? (
              <Image source={mascote} style={styles.mascote} resizeMode="cover" accessible={false} />
            ) : (
              <Text style={[styles.planetaGlifo, { color: tema ? tema.color : colors.accent }]}>
                {tema ? tema.icon : '✦'}
              </Text>
            )}
          </Animated.View>
          {parAceso && asc ? (
            <Animated.View style={[styles.medalha, { opacity: parFade }]}>
              <Text style={styles.medalhaGlifo}>✧</Text>
              <Text style={styles.medalhaRotulo}>{t('birthchart.row.asc.label')}</Text>
              <Text style={styles.medalhaSigno}>{nomeDoSigno(asc, lang)}</Text>
            </Animated.View>
          ) : (
            <View style={styles.medalhaVaga} />
          )}
        </View>
        <Text style={styles.palcoEyebrow}>{t('onboarding.q.reward.sun')}</Text>
        <Text style={styles.palcoSigno}>{nomeDoSigno(sol, lang)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <CosmicScene />

      {/* Topo padrão stories: barra de progresso segmentada + voltar. */}
      <View style={[styles.topo, { paddingTop: insets.top + 14 }]}>
        <View style={styles.barras}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.barra, i > Math.min(passo, 3) && styles.barraFutura]} />
          ))}
        </View>
        <TouchableOpacity
          style={styles.voltarRow}
          onPress={voltar}
          disabled={salvando}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('onboarding.back')}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          <Text style={styles.voltarTexto}>{t('onboarding.back')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {passo === 0 && (
          <View style={styles.passo}>
            <Text style={styles.pergunta}>{t('onboarding.q.name.title')}</Text>
            <TextInput
              style={styles.inputNome}
              value={nome}
              onChangeText={setNome}
              placeholder={t('onboarding.q.name.placeholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={() => nomeOk && avancar()}
            />
            <Text style={styles.dica}>{t('onboarding.q.name.hint')}</Text>
            {/* O botão vem COLADO no bloco do input (não ancorado no pé da
                viewport): com o teclado aberto ele continua logo abaixo do
                campo, nunca coberto. O respiro de pé fica no paddingBottom
                do scroll (lei do dvh, ≥140). */}
            <TouchableOpacity
              style={[styles.continuar, !nomeOk && styles.continuarApagado]}
              onPress={avancar}
              disabled={!nomeOk}
              activeOpacity={0.85}
            >
              <Text style={styles.continuarTexto}>{t('onboarding.q.continue')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.atalho} onPress={onAtalhoSigno} activeOpacity={0.7}>
              <Text style={styles.atalhoTexto}>{t('onboarding.q.shortcut')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {passo === 1 && (
          <View style={styles.passo}>
            <Text style={styles.pergunta}>{t('onboarding.q.birth.title')}</Text>
            <TouchableOpacity
              style={styles.pilula}
              onPress={() => setDataAberta(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar" size={18} color={colors.accent} />
              <Text style={styles.pilulaTexto}>
                {data ? formatDateBR(data) : t('onboarding.q.birth.pick')}
              </Text>
            </TouchableOpacity>

            {/* RECOMPENSA 1 — respondeu a data, o signo solar aparece com o
                mascote, calculado de verdade (signoFromDate). */}
            {palco()}

            <TouchableOpacity
              style={[styles.continuar, !data && styles.continuarApagado]}
              onPress={avancar}
              disabled={!data}
              activeOpacity={0.85}
            >
              <Text style={styles.continuarTexto}>{t('onboarding.q.continue')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
            {!data && (
              <TouchableOpacity style={styles.atalho} onPress={onAtalhoSigno} activeOpacity={0.7}>
                <Text style={styles.atalhoTexto}>{t('onboarding.q.shortcut')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {passo === 2 && (
          <View style={styles.passo}>
            {palco({ compacto: true })}
            <Text style={styles.pergunta}>{t('onboarding.q.time.title')}</Text>
            <Text style={styles.dica}>{t('onboarding.q.time.why')}</Text>
            <View style={styles.relogio}>
              <ColunaNumeros
                dados={HORAS}
                selecionado={horaH}
                aoEscolher={(h) => {
                  setSemHora(false);
                  setHoraH(h);
                }}
              />
              <Text style={styles.relogioSep}>:</Text>
              <ColunaNumeros
                dados={MINUTOS}
                selecionado={horaM}
                aoEscolher={(m) => {
                  setSemHora(false);
                  setHoraM(m);
                }}
              />
            </View>
            <TouchableOpacity
              style={[styles.continuar, !horaOk && styles.continuarApagado]}
              onPress={() => {
                setSemHora(false);
                avancar();
              }}
              disabled={!horaOk}
              activeOpacity={0.85}
            >
              <Text style={styles.continuarTexto}>{t('onboarding.q.continue')}</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
            {/* A SAÍDA HONESTA — mesma aproximação que o app inteiro já usa
                (meio-dia, lib/signs.js): sem hora não nasce Ascendente chutado. */}
            <TouchableOpacity
              style={styles.atalho}
              onPress={() => {
                setSemHora(true);
                avancar();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.atalhoTexto}>{t('onboarding.q.time.skip')}</Text>
            </TouchableOpacity>
            <Text style={styles.nota}>{t('onboarding.q.time.skipNote')}</Text>
          </View>
        )}

        {passo === 3 && (
          <View style={styles.passo}>
            {palco({ compacto: true })}
            <Text style={styles.pergunta}>{t('onboarding.q.city.title')}</Text>
            <Text style={styles.dica}>{t('onboarding.q.city.why')}</Text>
            <TouchableOpacity
              style={styles.pilula}
              onPress={() => setCidadeAberta(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="location" size={18} color={colors.accent} />
              <Text style={styles.pilulaTexto}>
                {cidade ? cityLabel(cidade) : t('onboarding.q.city.pick')}
              </Text>
            </TouchableOpacity>
            {cidade ? (
              <TouchableOpacity style={[styles.continuar]} onPress={avancar} activeOpacity={0.85}>
                <Text style={styles.continuarTexto}>{t('onboarding.q.continue')}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.atalho} onPress={avancar} activeOpacity={0.7}>
                <Text style={styles.atalhoTexto}>{t('onboarding.q.city.skip')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {passo === 4 && (
          <View style={styles.passo}>
            <Text style={styles.pergunta}>{t('onboarding.q.reveal.title')}</Text>
            {/* RECOMPENSA 2 — com hora+cidade, Lua e Ascendente acendem ao
                lado do mascote (parAceso). Sem eles, o palco segue só com o
                Sol — nada aceso na base de chute. */}
            {palco()}
            {!!erro && <Text style={styles.erro}>{erro}</Text>}
            {salvando ? (
              <View style={styles.salvando}>
                <ActivityIndicator color={colors.accent} size="large" />
              </View>
            ) : (
              <TouchableOpacity
                style={styles.continuar}
                onPress={erro ? concluir : () => setLendo(true)}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.continuarTexto}>{t('onboarding.q.reveal.cta')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      <DatePickerModal
        visible={dataAberta}
        title={t('onboarding.q.birth.title')}
        initialDate={data}
        minYear={ANO_ATUAL - 100}
        maxYear={ANO_ATUAL}
        onClose={() => setDataAberta(false)}
        onConfirm={(d) => {
          Haptics.selectionAsync();
          setData(d);
        }}
      />

      <CityPickerModal
        visible={cidadeAberta}
        hasSelection={!!cidade}
        birthDate={data}
        birthTime={hora}
        lang={lang}
        onClose={() => setCidadeAberta(false)}
        onSelect={(c) => {
          Haptics.selectionAsync();
          setCidade(c);
          setCidadeAberta(false);
          // Respondeu a última pergunta — vai direto pro palco aceso.
          setPasso(4);
        }}
        onClear={() => {
          setCidade(null);
          setCidadeAberta(false);
        }}
      />

      {/* A LEITURA-REVELAÇÃO em slides. Concluir (ou fechar no X — quem viu a
          leitura não pode cair num beco) grava tudo e o Gate assume. */}
      <StoriesReader
        visible={lendo}
        slides={slides}
        titulo={t('onboarding.q.slides.title')}
        onClose={concluir}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  topo: { paddingHorizontal: 16 },
  barras: { flexDirection: 'row', gap: 4 },
  barra: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.text },
  barraFutura: { opacity: 0.3 },
  voltarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, alignSelf: 'flex-start' },
  voltarTexto: { color: colors.textSecondary, fontSize: 14, fontWeight: '600', marginLeft: 2 },

  // paddingBottom 160 ≥ 140: lei do dvh — o botão do pé nunca morre atrás de
  // barra de navegador/teclado; o conteúdo rola até folgar.
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 160 },
  passo: { flex: 1, justifyContent: 'center' },

  pergunta: {
    color: colors.text,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  dica: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  nota: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 12,
  },

  inputNome: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
    paddingVertical: 12,
    marginHorizontal: 12,
  },

  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    minHeight: 48,
  },
  pilulaTexto: { color: colors.text, fontSize: 16, fontWeight: '700' },

  relogio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_ALTURA * 4,
    marginTop: 14,
  },
  coluna: { width: 76, flexGrow: 0 },
  colunaItem: { height: ITEM_ALTURA, justifyContent: 'center', alignItems: 'center' },
  colunaItemSel: { backgroundColor: colors.accent + '22', borderRadius: 10 },
  colunaTexto: { color: colors.textSecondary, fontSize: 18 },
  colunaTextoSel: { color: colors.text, fontWeight: '800' },
  relogioSep: { color: colors.text, fontSize: 22, fontWeight: '800', marginHorizontal: 6 },

  palco: { alignItems: 'center', marginVertical: 22 },
  palcoCompacto: { marginVertical: 10 },
  palcoLinha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  planeta: {
    width: 148,
    height: 148,
    borderRadius: 74,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(243,238,255,0.35)',
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planetaCompacto: { width: 88, height: 88, borderRadius: 44 },
  planetaGlifo: { fontSize: 56 },
  mascote: { width: '100%', height: '100%' },
  medalha: {
    width: 78,
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 10,
  },
  medalhaVaga: { width: 78 },
  medalhaGlifo: { fontSize: 20 },
  medalhaRotulo: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 4,
  },
  medalhaSigno: { color: colors.text, fontSize: 12, fontWeight: '700', marginTop: 2 },
  palcoEyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 14,
  },
  palcoSigno: { color: colors.text, fontSize: 28, fontWeight: '800', marginTop: 4 },

  continuar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 28,
    minHeight: 50,
    alignSelf: 'stretch',
    marginTop: 22,
  },
  continuarApagado: { opacity: 0.4 },
  continuarTexto: { color: '#fff', fontSize: 16, fontWeight: '800' },

  atalho: { alignSelf: 'center', paddingVertical: 14, paddingHorizontal: 10, marginTop: 6 },
  atalhoTexto: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },

  erro: { color: colors.red, fontSize: 13, textAlign: 'center', marginBottom: 10 },
  salvando: { paddingVertical: 24, alignItems: 'center' },
});
