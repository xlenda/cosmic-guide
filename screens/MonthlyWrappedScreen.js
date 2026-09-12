// Retrospectiva Cósmica — wrapped MENSAL individual (a RetrospectivaScreen é a
// ANUAL de casal; esta celebra o mês da própria pessoa, sem par e sem gate).
// Todos os números vêm de lib/monthlyWrapped.js, que agrega só registro local
// real — mês vazio devolve null e a tela mostra um estado honesto em vez de
// celebrar zeros.
//
// DIAGRAMAÇÃO (12/09/2026, lote de dado e número). Esta tela NÃO recebeu faixa
// curva, e é decisão declarada, não esquecimento — a mesma de
// RetroLuaCheiaScreen no lote anterior: cada slide daqui JÁ é um chão inteiro
// (um LinearGradient de tela cheia por assunto). Faixa por cima disso é o
// "dois fundos brigando" que o guia das peças proíbe na primeira página.
//
// O QUE ELA RECEBEU: a escala de espaço e a tipográfica em toda a folha, a
// ColunaLeitura em todo texto de leitura (a frase de energia e o aviso do
// rodapé atravessavam a tela inteira), a FileiraDeTres no slide da presença —
// onde há DOIS números reais de fato comparáveis — e a TabelaDados no slide
// final, que era quatro linhas de emoji + número em texto corrido e agora é
// rótulo→valor alinhado, que é o arranjo dos prints.
//
// NADA AQUI GANHOU NÚMERO NOVO. Os quatro do resumo final são os mesmos quatro
// que os slides já mostraram — leituras, dias ativos, melhor sequência e
// tokens — todos de lib/monthlyWrapped.js, que devolve null pro mês sem
// registro nenhum. Zero continua aparecendo: é valor real.
//
// Decisão de layout: seções full-height em ScrollView comum, sem pagingEnabled
// — paginação vertical nativa não se comporta igual no react-native-web (alvo
// principal do app hoje), e minHeight em vez de height fixa garante que slide
// com texto longo (frase de energia) role em vez de cortar em telas baixas.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Share, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import ColunaLeitura from '../components/ColunaLeitura';
import TabelaDados from '../components/TabelaDados';
import FileiraDeTres from '../components/FileiraDeTres';
import { computeMonthlyWrapped, getWrappedMonth } from '../lib/monthlyWrapped';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';

// Mesma animação de contagem da RetrospectivaScreen (requestAnimationFrame +
// easing cúbico) — copiada em vez de extraída porque extrair tocaria num
// arquivo compartilhado, fora do escopo desta entrega.
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

// Emoji por tipo de leitura, só decoração do slide de favorito — cai num 🔮
// genérico pra tipo novo sem emoji mapeado (nunca quebra o slide).
const TYPE_EMOJI = {
  tarot: '🃏',
  coffee: '☕',
  dream: '🌙',
  palma: '✋',
  rosto: '🪞',
  pe: '🦶',
  pintas: '✨',
  horoscope: '♈',
  birthchart: '🧭',
  compatibility: '💞',
  chat: '💬',
  lunarCalendar: '🌗',
};

export default function MonthlyWrappedScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const { height: winH } = useWindowDimensions();

  // Por padrão celebra o mês anterior (janela dos dias 1–7, ver
  // isWrappedAvailable) — params permitem abrir outro mês sem mudar esta tela.
  const target = route.params?.year != null && route.params?.month != null
    ? { year: route.params.year, month: route.params.month }
    : getWrappedMonth();

  const [loaded, setLoaded] = useState(false);
  const [wrapped, setWrapped] = useState(null);

  const wrappedTypeLabel = (item) => (
    item?.type === 'chat' ? t('orbi.chat.diaryLabel') : item?.typeLabel
  );
  const wrappedEnergyPhrase = (energy) => (
    energy?.type === 'chat' ? t('wrapped.orbiEnergy') : energy?.phrase
  );

  const load = useCallback(async () => {
    const w = await computeMonthlyWrapped(target.year, target.month);
    setWrapped(w);
    setLoaded(true);
  }, [target.year, target.month]);

  // useEffect (não useFocusEffect): os números são de um mês já fechado, não
  // mudam enquanto a tela está aberta — recarregar a cada foco só faria a
  // animação de contagem reiniciar do zero sem informação nova.
  useEffect(() => { load(); }, [load]);

  async function handleShare() {
    if (!wrapped) return;
    const leituras = `${wrapped.totalReadings} ${wrapped.totalReadings === 1 ? 'leitura' : 'leituras'}`;
    const dias = `${wrapped.activeDays} ${wrapped.activeDays === 1 ? 'dia ativo' : 'dias ativos'}`;
    try {
      await Share.share({ message: `Meu mês cósmico de ${wrapped.monthLabel}: ${leituras}, ${dias} 🔮 — cosmicguide.cloud` });
    } catch {
      // cancelou ou o SO falhou — silêncio, mesmo padrão da RetrospectivaScreen
    }
  }

  const backBtn = (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={[styles.backBtn, { top: insets.top + 8 }]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
    >
      <Ionicons name="chevron-back" size={26} color="#fff" />
    </TouchableOpacity>
  );

  if (!loaded) {
    return (
      <View style={styles.root}>
        {backBtn}
        <ActivityIndicator color={colors.accent} style={{ marginTop: winH / 3 }} />
      </View>
    );
  }

  // Mês sem registro nenhum: estado honesto, sem número fabricado.
  if (!wrapped) {
    return (
      <View style={styles.root}>
        {backBtn}
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🌑</Text>
          <ColunaLeitura centralizado>
            <Text style={styles.emptyTitle}>{t('wrapped.empty')}</Text>
            <Text style={styles.emptyDesc}>
              A retrospectiva só conta o que você mesmo registrou no app — quando houver leituras, ela nasce sozinha.
            </Text>
          </ColunaLeitura>
          {/* O texto PEDE leituras; o único botão daqui era "Voltar", que não
              é a coisa pedida. HomeMain (a grade de leituras) mora no mesmo
              HomeStack — "Voltar" segue existindo, agora como secundário. */}
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate(ROUTES.HOME_MAIN)}>
            <Text style={styles.btnText}>{t('wrapped.empty.readingsCta')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={() => navigation.goBack()}>
            <Text style={styles.btnGhostText}>{t('wrapped.back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const slideStyle = [styles.slide, { minHeight: winH }];
  const hint = (
    <View style={styles.hint}>
      <Text style={styles.hintText}>{t('wrapped.swipe')}</Text>
      <Ionicons name="chevron-down" size={20} color="rgba(255,255,255,0.7)" />
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Slide 1 — total de leituras do mês */}
        <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.title')}</Text>
          <Text style={styles.monthLabel}>{wrapped.monthLabel}</Text>
          <Text style={styles.bigNumber}><CountUp value={wrapped.totalReadings} /></Text>
          <Text style={styles.caption}>
            {wrapped.totalReadings === 1 ? 'leitura registrada no seu Diário' : 'leituras registradas no seu Diário'}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide 2 — tipo favorito + energia do mês (só existe com leitura no mês) */}
        {wrapped.topType && (
          <LinearGradient colors={gradients.pink} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
            <Text style={styles.overline}>{t('wrapped.favorite')}</Text>
            <Text style={styles.slideEmoji}>{TYPE_EMOJI[wrapped.topType.type] || '🔮'}</Text>
            <Text style={styles.mediumTitle}>{wrappedTypeLabel(wrapped.topType)}</Text>
            <Text style={styles.caption}>
              {wrapped.topType.count} {wrapped.topType.count === 1 ? 'vez este mês' : 'vezes este mês'}
            </Text>
            {wrapped.energy && (
              <ColunaLeitura centralizado>
                <Text style={styles.energyPhrase}>{wrappedEnergyPhrase(wrapped.energy)}</Text>
              </ColunaLeitura>
            )}
            {hint}
          </LinearGradient>
        )}

        {/* Slide 3 — dias ativos + melhor sequência dentro do mês */}
        <LinearGradient colors={gradients.teal} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.presence')}</Text>
          <Text style={styles.bigNumber}><CountUp value={wrapped.activeDays} /></Text>
          <Text style={styles.caption}>
            {wrapped.activeDays === 1 ? 'dia ativo no mês' : 'dias ativos no mês'}
          </Text>
          <View style={styles.divider} />
          {/* Dois números REAIS e comparáveis — dias ativos e a melhor sequência
              dentro do mês, ambos de lib/monthlyWrapped.js. A peça não desenha
              com menos de duas colunas de pé, e é exatamente essa regra que
              impede inventar uma terceira só pra encher a fileira. */}
          <FileiraDeTres
            style={styles.fileiraClara}
            itens={[
              { chave: 'ativos', valor: wrapped.activeDays, rotulo: wrapped.activeDays === 1 ? 'dia ativo no mês' : 'dias ativos no mês' },
              { chave: 'sequencia', valor: wrapped.bestStreakInMonth, rotulo: wrapped.bestStreakInMonth === 1 ? 'dia de melhor sequência' : 'dias de melhor sequência' },
            ]}
          />
          {hint}
        </LinearGradient>

        {/* Slide 4 — tokens ganhos no mês */}
        <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.harvest')}</Text>
          <Text style={styles.bigNumber}><CountUp value={wrapped.tokensEarned} /></Text>
          <Text style={styles.caption}>
            {wrapped.tokensEarned === 1 ? 'token ganho no mês' : 'tokens ganhos no mês'}
          </Text>
          {hint}
        </LinearGradient>

        {/* Slide final — resumo + compartilhar */}
        <LinearGradient colors={gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={slideStyle}>
          <Text style={styles.overline}>{t('wrapped.glance')}</Text>
          <View style={styles.summaryCard}>
            {/* Rótulo→valor: os quatro números do mês, os MESMOS que os slides
                já mostraram. `0` é valor real e aparece — a peça só some com a
                linha que não tem dado nenhum. */}
            <TabelaDados
              testID="wrapped-resumo"
              itens={[
                { chave: 'leituras', rotulo: '🔮 ' + (wrapped.totalReadings === 1 ? 'leitura' : 'leituras'), valor: wrapped.totalReadings },
                { chave: 'ativos', rotulo: '📅 ' + (wrapped.activeDays === 1 ? 'dia ativo' : 'dias ativos'), valor: wrapped.activeDays },
                { chave: 'sequencia', rotulo: '🔥 ' + (wrapped.bestStreakInMonth === 1 ? 'dia de sequência' : 'dias de melhor sequência'), valor: wrapped.bestStreakInMonth },
                { chave: 'tokens', rotulo: '🪙 ' + (wrapped.tokensEarned === 1 ? 'token ganho' : 'tokens ganhos'), valor: wrapped.tokensEarned },
              ]}
            />
            {wrapped.energy && (
              <ColunaLeitura style={styles.resumoEnergia}>
                <Text style={styles.summaryEnergy}>{wrappedEnergyPhrase(wrapped.energy)}</Text>
              </ColunaLeitura>
            )}
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleShare}>
            <Text style={styles.btnText}>{t('wrapped.share')}</Text>
          </TouchableOpacity>
          <ColunaLeitura centralizado>
            <Text style={styles.disclaimer}>
              Todos os números vêm do que você mesmo registrou no app — nada aqui foi inventado. Leituras são tradição simbólica, pra reflexão e entretenimento.
            </Text>
          </ColunaLeitura>
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
    left: space.dentro,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  // `respiro` (64) em cima e embaixo: cada slide é uma tela de UMA ideia só,
  // e é exatamente o degrau reservado pra primeira dobra desse tipo de tela.
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: space.secao,
    paddingVertical: space.respiro,
  },

  overline: {
    ...type.etiqueta,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: space.dentro,
    textAlign: 'center',
  },
  monthLabel: { ...type.titulo, color: '#fff', marginBottom: space.junto, textAlign: 'center' },
  // 96/104 e 30/38: número e título de CARTAZ, deliberadamente acima da escala
  // (que termina no display 32, título de primeira dobra — não cartaz de tela
  // cheia). Mesma exceção já declarada em RetroLuaCheiaScreen.
  bigNumber: { color: '#fff', fontSize: 96, fontWeight: '800', lineHeight: 104 },
  caption: { ...type.corpo, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: space.grudado },

  // 72 e 44: emoji de slide e de estado vazio. Emoji não tem entrelinha de
  // parágrafo nem hierarquia de título — medir um 🔮 pela escala tipográfica
  // seria usar a régua errada.
  slideEmoji: { fontSize: 72, marginVertical: space.junto },
  mediumTitle: { color: '#fff', fontSize: 30, lineHeight: 38, fontWeight: '800', textAlign: 'center' },
  energyPhrase: {
    ...type.corpo,
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: space.entre,
  },

  divider: {
    width: space.ar, height: 2, backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 1, marginVertical: space.entre,
  },
  // A fileira pousa sobre um gradiente claro, não sobre o fundo do app: ela
  // só precisa de largura pra que as duas colunas dividam a tela por igual.
  fileiraClara: { alignSelf: 'stretch' },

  summaryCard: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: space.bloco,
    paddingVertical: space.junto,
    paddingHorizontal: space.entre,
    alignSelf: 'stretch',
    marginBottom: space.entre,
  },
  resumoEnergia: { paddingHorizontal: 0, marginTop: space.bloco },
  summaryEnergy: {
    ...type.corpoCurto,
    color: 'rgba(255,255,255,0.85)',
    fontStyle: 'italic',
  },

  btn: {
    backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: space.bloco,
    paddingVertical: space.bloco, paddingHorizontal: space.secao, alignItems: 'center',
  },
  btnText: { ...type.botao, color: colors.background },
  btnGhost: {
    borderRadius: space.bloco, paddingVertical: space.dentro,
    paddingHorizontal: space.secao, alignItems: 'center', marginTop: space.dentro,
  },
  btnGhostText: { ...type.botao, color: colors.textSecondary },

  hint: { position: 'absolute', bottom: space.entre, alignItems: 'center' },
  hintText: { ...type.nota, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 1 },

  disclaimer: {
    ...type.nota,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginTop: space.entre,
  },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao },
  emptyIcon: { fontSize: 44, marginBottom: space.dentro },
  emptyTitle: { ...type.secao, color: colors.text, textAlign: 'center' },
  emptyDesc: {
    ...type.corpo, color: colors.textSecondary, textAlign: 'center',
    marginTop: space.dentro, marginBottom: space.entre,
  },
});
