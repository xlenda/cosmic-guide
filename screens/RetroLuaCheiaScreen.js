// RETROSPECTIVA DA LUA CHEIA — o balanço do ciclo, aberto pelo céu.
//
// Estrutura e visual seguem screens/MonthlyWrappedScreen.js (slides full-height
// em ScrollView comum, sem pagingEnabled — paginação vertical nativa não se
// comporta igual no react-native-web, que é o alvo principal do app hoje; e
// minHeight em vez de height fixa pra slide com texto longo rolar em vez de
// cortar). A diferença é o RECORTE: o wrapped mensal fecha o mês do calendário
// civil, esta fecha o CICLO LUNAR, e por isso ela não abre quando a pessoa quer
// — abre quando a Lua está cheia.
//
// QUATRO ESTADOS, e três deles são "não". A tela é honesta antes de ser bonita:
//   1. sem efeméride  → indisponível declarado (nunca um ciclo estimado);
//   2. fora da Cheia  → diz que abre na Lua Cheia e QUANDO é a próxima;
//   3. ciclo em branco→ diz que não tem registro em vez de celebrar zeros;
//   4. com registro   → os slides.
// Todo número dos slides sai de lib/retroLunacao.js, que só conta coisa que a
// pessoa fez neste aparelho. O app não sabe se o ciclo dela foi bom; sabe
// quantos dias ela apareceu, e é isso que ele diz.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { retrospectivaDaLunacao, proximaLuaCheia } from '../lib/retroLunacao';
import { lerCheckins, HUMORES } from '../lib/checkin';
import { getJournalEntries } from '../lib/journal';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';

// Mesma animação de contagem da RetrospectivaScreen e da MonthlyWrappedScreen
// (requestAnimationFrame + easing cúbico). É a TERCEIRA cópia, e está copiada
// pelo mesmo motivo declarado lá: extrair mexeria em duas telas fora do escopo
// desta entrega. Quando a quarta aparecer, aí vale a extração — e as três
// existentes migram juntas, não uma por vez.
function CountUp({ value, duration = 900 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const to = Number(value) || 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

// Uma cor por resposta, só pra barra do placar. Os ids e os emojis NÃO moram
// aqui — vêm de HUMORES (lib/checkin.js), a mesma fonte que desenha o check-in
// na Home. Duplicar a lista faria a retro mostrar um emoji e a Home outro no
// dia em que alguém trocasse um deles.
const COR_DA_RESPOSTA = {
  leve: colors.gold,
  neutro: colors.teal,
  pesado: colors.blue,
};

export default function RetroLuaCheiaScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { t, lang } = useLanguage();
  const { height: winH } = useWindowDimensions();

  const [loaded, setLoaded] = useState(false);
  const [dados, setDados] = useState(null);
  const [proximaCheia, setProximaCheia] = useState(null);

  const load = useCallback(async () => {
    const [checkins, leituras] = await Promise.all([lerCheckins(), getJournalEntries()]);
    const hoje = new Date();
    const r = retrospectivaDaLunacao(checkins, hoje, leituras);
    setDados(r);
    // Só interessa quando a tela vai dizer "hoje não" — e mesmo aí pode vir
    // null (sem efeméride), caso em que o texto sem data assume.
    setProximaCheia(r && !r.ehLuaCheia ? proximaLuaCheia(hoje) : null);
    setLoaded(true);
  }, []);

  // useEffect e não useFocusEffect: os números são de um ciclo que só muda no
  // dia seguinte — recarregar a cada foco reiniciaria a contagem animada do
  // zero sem nenhuma informação nova, que é o mesmo motivo do wrapped mensal.
  useEffect(() => { load(); }, [load]);

  // Data por extenso no idioma da pessoa. As três locales são as mesmas que a
  // Home já usa — não inventamos locale pra idioma que o app não tem.
  const locale = lang === 'es' ? 'es-ES' : lang === 'en' ? 'en-US' : 'pt-BR';
  const porExtenso = (d) => d.toLocaleDateString(locale, { day: 'numeric', month: 'long' });

  const backBtn = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[styles.backBtn, { top: insets.top + 8 }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={t('retroLua.back')}
    >
      <Ionicons name="chevron-back" size={26} color="#fff" />
    </TouchableOpacity>
  );

  // Moldura dos três estados de "não": mesmo desenho do estado vazio do wrapped
  // mensal, pra pessoa reconhecer que é o app falando com ela, não um erro.
  const estado = (icone, titulo, descricao, cta) => (
    <View style={styles.root}>
      {backBtn}
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>{icone}</Text>
        <Text style={styles.emptyTitle}>{titulo}</Text>
        <Text style={styles.emptyDesc}>{descricao}</Text>
        {cta}
        <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.goBack()}>
          <Text style={styles.btnGhostText}>{t('retroLua.back')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!loaded) {
    return (
      <View style={styles.root}>
        {backBtn}
        <ActivityIndicator color={colors.accent} style={{ marginTop: winH / 3 }} />
      </View>
    );
  }

  // ESTADO 1 — sem efeméride. O ciclo inteiro depende de saber a data exata da
  // Lua Nova; sem ela, qualquer número seria chute com cara de medida.
  if (!dados) {
    return estado('🌑', t('retroLua.indisponivel.title'), t('retroLua.indisponivel.desc'), null);
  }

  // ESTADO 2 — hoje não é Lua Cheia. Diz o dia em que volta (efeméride real);
  // sem a data, o texto sem data assume em vez de arriscar um palpite.
  if (!dados.ehLuaCheia) {
    return estado(
      '🌒',
      t('retroLua.aguarde.title'),
      proximaCheia ? t('retroLua.aguarde.desc', { data: porExtenso(proximaCheia) }) : t('retroLua.aguarde.descSemData'),
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate(ROUTES.LUNAR_CALENDAR)}>
        <Text style={styles.btnText}>{t('retroLua.aguarde.cta')}</Text>
      </TouchableOpacity>
    );
  }

  // ESTADO 3 — é Lua Cheia, mas o ciclo está em branco. Manda pra grade de
  // leituras, que é a coisa pedida pelo texto (o botão "Voltar" segue existindo
  // logo abaixo, como secundário — mesma correção já feita no wrapped mensal).
  if (!dados.temRegistro) {
    return estado(
      '🌕',
      t('retroLua.vazio.title'),
      t('retroLua.vazio.desc'),
      <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate(ROUTES.HOME_MAIN)}>
        <Text style={styles.btnText}>{t('retroLua.vazio.cta')}</Text>
      </TouchableOpacity>
    );
  }

  // ESTADO 4 — os slides.
  const slideStyle = [styles.slide, { minHeight: winH }];
  const hint = (
    <View style={styles.hint}>
      <Text style={styles.hintText}>{t('retroLua.swipe')}</Text>
      <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.7)" />
    </View>
  );

  const { placar, diasDePresenca, leiturasNoCiclo, humorDominante } = dados;
  // Largura da barra proporcional à MAIOR resposta, não ao total: com três
  // categorias, proporção do total achata tudo e a barra deixa de comunicar.
  const maiorResposta = Math.max(placar.leve, placar.neutro, placar.pesado, 1);

  async function handleShare() {
    try {
      await Share.share({
        message: t('retroLua.share.message', { dias: diasDePresenca, leituras: leiturasNoCiclo }),
      });
    } catch {
      // cancelou ou o SO falhou — silêncio, mesmo padrão do wrapped mensal
    }
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slide 1 — onde a pessoa está no ciclo, com as datas reais do céu */}
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('retroLua.title')}</Text>
          <Text style={styles.slideEmoji}>🌕</Text>
          <Text style={styles.mediumTitle}>
            {t('retroLua.ciclo', { dia: dados.diaDoCiclo, duracao: dados.duracaoDoCiclo })}
          </Text>
          <Text style={styles.caption}>{t('retroLua.desdeNova', { data: porExtenso(dados.abertura) })}</Text>
          {hint}
        </LinearGradient>

        {/* Slide 2 — dias de presença: a contagem de check-ins do ciclo, o
            mesmo número que o termômetro da Home mostra (ver retroLunacao.js) */}
        <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('retroLua.presenca')}</Text>
          <Text style={styles.bigNumber}><CountUp value={diasDePresenca} /></Text>
          <Text style={styles.caption}>
            {t(diasDePresenca === 1 ? 'retroLua.presenca.caption_one' : 'retroLua.presenca.caption_other')}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide 3 — o placar leve/tranquilo/pesado. Só existe se houve
            resposta: sem check-in não há placar, e barra zerada nos três não
            informa nada além de "você não respondeu". */}
        {placar.total > 0 && (
          <LinearGradient colors={gradients.pink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
            <Text style={styles.overline}>{t('retroLua.placar')}</Text>
            <View style={styles.placarCard}>
              {HUMORES.map((h) => (
                <View key={h.id} style={styles.placarRow}>
                  <Text style={styles.placarEmoji}>{h.emoji}</Text>
                  <Text style={styles.placarLabel}>{t(`checkin.${h.id}`)}</Text>
                  <View style={styles.placarTrack}>
                    <View
                      style={[
                        styles.placarFill,
                        {
                          width: `${Math.round((placar[h.id] / maiorResposta) * 100)}%`,
                          backgroundColor: COR_DA_RESPOSTA[h.id] || colors.purple,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.placarValor}>{placar[h.id]}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.caption}>
              {t(placar.total === 1 ? 'retroLua.placar.caption_one' : 'retroLua.placar.caption_other', { n: placar.total })}
            </Text>
            <Text style={styles.energyPhrase}>
              {humorDominante
                ? t('retroLua.placar.dominante', { humor: t(`checkin.${humorDominante}`) })
                : t('retroLua.placar.empate')}
            </Text>
            {hint}
          </LinearGradient>
        )}

        {/* Slide 4 — leituras do Diário dentro do ciclo */}
        <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('retroLua.leituras')}</Text>
          <Text style={styles.bigNumber}><CountUp value={leiturasNoCiclo} /></Text>
          <Text style={styles.caption}>
            {t(leiturasNoCiclo === 1 ? 'retroLua.leituras.caption_one' : 'retroLua.leituras.caption_other')}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide final — resumo + compartilhar + o recibo do que é medido */}
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('retroLua.resumo')}</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryRow}>{t('retroLua.resumo.presenca', { n: diasDePresenca })}</Text>
            <Text style={styles.summaryRow}>{t('retroLua.resumo.leituras', { n: leiturasNoCiclo })}</Text>
            <Text style={styles.summaryRow}>{t('retroLua.resumo.leves', { n: placar.leve })}</Text>
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleShare}>
            <Text style={styles.btnText}>{t('retroLua.share')}</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>{t('retroLua.disclaimer')}</Text>
        </LinearGradient>
      </ScrollView>
      {backBtn}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  backBtn: {
    position: 'absolute',
    left: 12,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  slide: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 64 },

  overline: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  bigNumber: { color: '#fff', fontSize: 96, fontWeight: '800', lineHeight: 104 },
  caption: { color: 'rgba(255,255,255,0.85)', fontSize: 16, textAlign: 'center', marginTop: 4 },

  slideEmoji: { fontSize: 72, marginVertical: 8 },
  mediumTitle: { color: '#fff', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  energyPhrase: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 24,
  },

  placarCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  placarRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  placarEmoji: { fontSize: 20, width: 30 },
  placarLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700', width: 80 },
  placarTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden' },
  placarFill: { height: 10, borderRadius: 5 },
  placarValor: { color: '#fff', width: 34, textAlign: 'right', fontSize: 15, fontWeight: '800' },

  summaryCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  summaryRow: { color: '#fff', fontSize: 17, fontWeight: '700', marginVertical: 4 },

  btn: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, alignItems: 'center' },
  btnText: { color: colors.background, fontSize: 15, fontWeight: '800' },
  btnGhost: { borderRadius: 14, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center', marginTop: 10 },
  btnGhostText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },

  hint: { position: 'absolute', bottom: 20, alignItems: 'center' },
  hintText: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 },

  disclaimer: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
    paddingHorizontal: 8,
  },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  emptyDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20, marginBottom: 20 },
});
