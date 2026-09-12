// Progresso — porta fiel de c:/tmp/gilfforever/web/app/(app)/progresso/page.js:
// os mesmos três agregadores de lib/activity.js (streak, computeBadges,
// monthlyRecap), só que lidos de forma assíncrona (AsyncStorage) em vez do
// localStorage síncrono original. Tela 100% leitura — não grava nada novo.
// O "ring" de streak do original usa CSS conic-gradient (sem equivalente nativo
// direto sem adicionar react-native-svg como dependência nova); aqui vira um
// círculo com borda sólida + número animado — mesma informação, sem dependência
// extra. CountUp reaproveita a mesma animação do original (requestAnimationFrame
// + performance.now), ambos já disponíveis nativamente em React Native.
//
// DIAGRAMAÇÃO (12/09/2026, lote de dado e número). A tela era seis caixas
// empilhadas sobre o mesmo chão: card de sequência, card de mês, cabeçalho de
// seção, barra, grade de conquistas e rodapé. Tudo à mesma distância de tudo,
// e por isso lida como lista. Agora são TRÊS faixas curvas, uma por assunto —
// hoje (a sequência), o mês (o resumo) e o caminho (as conquistas) — e o olho
// lê a mudança de assunto sem precisar de título.
//
// AS TRÊS DECISÕES DE DADO, e por que nenhuma inventa número:
//   1. A fileira de três da sequência mostra `count`, `longest` e o total de
//      conquistas abertas — TODOS contados de lib/activity.js. O recorde só
//      entra quando é MAIOR que a sequência atual (era assim antes, numa linha
//      solta): recorde igual ao atual é a mesma informação duas vezes.
//   2. O resumo do mês virou TabelaDados. Eram quatro estatísticas com
//      divisórias verticais — e quatro colunas em 390px dão ~85px cada, que é
//      onde "🎯 gestos" quebra em duas linhas e desalinha os números. Em linha
//      de rótulo→valor os quatro cabem inteiros, e é o arranjo dos prints.
//      `0` continua aparecendo: é valor REAL (mês sem memória é um fato).
//   3. A barra de progresso das conquistas ficou. É a única peça daqui que
//      mostra proporção — e é proporção CONTADA (abertas/total), não índice
//      inventado.
//
// ESTADO VAZIO: a tela sem casal não ganha faixa nenhuma. Faixa em volta de
// um convite de três linhas é o defeito "bloco de cor sem conteúdo" — aqui o
// que a tela precisa é de ar em volta do convite, não de chão colorido.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import TabelaDados from '../components/TabelaDados';
import FileiraDeTres from '../components/FileiraDeTres';
import { useCouple } from '../context/CoupleContext';
import { getStreak } from '../lib/coupleData';
import { computeBadges, monthlyRecap } from '../lib/activity';
import { useLanguage } from '../context/LanguageContext';

const HEADER_GRADIENT = ['#5FD98C', '#5CE0D8'];

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

export default function ProgressoScreen() {
  const { t } = useLanguage();
  const navigation = useNavigation();
  const { coupleData } = useCouple();
  const voce = coupleData?.voce;
  const amor = coupleData?.amor;

  const [loaded, setLoaded] = useState(false);
  const [streak, setStreak] = useState({ count: 0, longest: 0 });
  const [badges, setBadges] = useState([]);
  const [recap, setRecap] = useState(null);

  const load = useCallback(async () => {
    if (!voce || !amor) return;
    const [s, b, r] = await Promise.all([
      getStreak(voce, amor),
      computeBadges(voce, amor),
      monthlyRecap(voce, amor),
    ]);
    setStreak(s);
    setBadges(b);
    setRecap(r);
    setLoaded(true);
  }, [voce, amor]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!voce || !amor) {
    return (
      <View style={styles.root}>
        <GradientHeader title="Progresso" subtitle="Sequência e conquistas" onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />
        <View style={styles.emptyProfile}>
          <Ionicons name="heart-outline" size={40} color={colors.accent} />
          <Text style={styles.emptyProfileTitle}>{t('retro.needQuiz')}</Text>
          <Text style={styles.emptyProfileDesc}>
            Precisamos saber os nomes de vocês para acompanhar a sequência e as conquistas do casal.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate(ROUTES.QUIZ)}>
            <Text style={styles.btnText}>{t('retro.doQuiz')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const desbloqueadas = badges.filter((b) => b.unlocked).length;
  const todasDesbloqueadas = loaded && badges.length > 0 && desbloqueadas === badges.length;

  return (
    <View style={styles.root}>
      <GradientHeader title="Progresso" subtitle={`${voce} & ${amor}`} onBack={() => navigation.goBack()} gradient={HEADER_GRADIENT} />

      {!loaded ? (
        <ActivityIndicator color={colors.accent} style={styles.carregando} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* FAIXA 1 — HOJE. A sequência é o número que a pessoa vem ver, e
              agora tem o chão só dela. `rasa` quando a sequência é zero: sem
              recorde e sem conquista aberta a faixa carrega três linhas de
              texto, e a onda inteira viraria bloco de cor. */}
          <FaixaCurva
            tom="noite"
            semente="progresso-hoje"
            rasa={streak.count === 0 && desbloqueadas === 0}
            estiloCorpo={styles.faixaCorpo}
          >
            <View style={styles.anelBloco}>
              <View style={styles.ring}>
                <Text style={styles.ringValue}><CountUp value={streak.count} /></Text>
              </View>
              {streak.count > 0 ? (
                <Text style={styles.mutedText}>
                  {streak.count === 1 ? 'dia seguido' : 'dias seguidos'} cuidando da relação 🔥
                </Text>
              ) : (
                <Text style={styles.mutedText}>
                  Cada dia que vocês cuidam um do outro conta. Comecem hoje, {voce} e {amor} 💛
                </Text>
              )}
            </View>

            {/* A fileira só desenha com DUAS colunas de pé (regra da peça). O
                recorde some quando é igual à sequência atual — não é dado
                novo, é o mesmo número com outro rótulo. */}
            <FileiraDeTres
              style={styles.fileira}
              itens={[
                { chave: 'atual', valor: streak.count, rotulo: streak.count === 1 ? 'dia seguido' : 'dias seguidos' },
                {
                  chave: 'recorde',
                  valor: streak.longest > streak.count ? streak.longest : null,
                  rotulo: 'recorde de vocês',
                },
                { chave: 'conquistas', valor: desbloqueadas, rotulo: 'conquistas abertas', cor: colors.gold },
              ]}
            />
          </FaixaCurva>

          {/* FAIXA 2 — O MÊS. */}
          {recap && (
            <FaixaCurva tom="ameixa" semente="progresso-mes" grude estiloCorpo={styles.faixaCorpo}>
              <ColunaLeitura>
                <Text style={styles.etiqueta}>{t('progresso.monthSummary')}</Text>
                <Text style={styles.tituloSecao}>{recap.mesLabel}</Text>
                {/* Rótulo→valor: os quatro cabem inteiros, sem quebra de linha
                    nem divisória vertical. Zero é valor real e aparece. */}
                <TabelaDados
                  style={styles.tabela}
                  itens={[
                    { chave: 'memorias', rotulo: t('progresso.memories'), valor: recap.memoriesThisMonth },
                    { chave: 'capsulas', rotulo: t('progresso.capsules'), valor: recap.capsulesSealedThisMonth },
                    { chave: 'missoes', rotulo: t('progresso.missions'), valor: recap.reconectarChecks },
                    { chave: 'gestos', rotulo: t('progresso.gestures'), valor: recap.agirDoneCount },
                  ]}
                />
              </ColunaLeitura>
            </FaixaCurva>
          )}

          {/* FAIXA 3 — O CAMINHO. */}
          <FaixaCurva tom="violeta" semente="progresso-conquistas" grude estiloCorpo={styles.faixaCorpo}>
            <Text style={styles.etiqueta}>Conquistas ({desbloqueadas}/{badges.length})</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${badges.length ? (desbloqueadas / badges.length) * 100 : 0}%` }]} />
            </View>
            {todasDesbloqueadas && (
              <ColunaLeitura centralizado>
                <Text style={styles.celebration}>
                  🎉 Vocês desbloquearam todas as conquistas, {voce} e {amor}! Continuem escrevendo a história de vocês.
                </Text>
              </ColunaLeitura>
            )}

            <View style={styles.badgeGrid}>
              {badges.map((b) => (
                <View key={b.id} style={[styles.badgeCard, !b.unlocked && styles.badgeCardLocked]}>
                  <Text style={styles.badgeEmoji}>{b.unlocked ? b.emoji : '🔒'}</Text>
                  <Text style={styles.badgeTitle}>{b.title}</Text>
                  <Text style={styles.badgeDesc}>{b.desc}</Text>
                </View>
              ))}
            </View>
          </FaixaCurva>

          <ColunaLeitura centralizado style={styles.rodape}>
            <Text style={styles.disclaimer}>
              A sequência e as conquistas de vocês vêm só do que já foi guardado em Linha do Tempo, Reconectar,
              Descobrir e Agir — nada aqui é inventado.
            </Text>
          </ColunaLeitura>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: space.fimDaLista },
  carregando: { marginTop: space.ar },

  // A faixa já traz padding próprio (space.secao em cima e embaixo,
  // space.tela nas laterais); aqui só o que ela não sabe: o espaço extra que
  // o corpo desta tela pede entre a onda e o primeiro número.
  faixaCorpo: { paddingTop: space.secao },

  anelBloco: { alignItems: 'center' },
  ring: {
    width: 150, height: 150, borderRadius: 75, borderWidth: 10, borderColor: colors.green,
    backgroundColor: colors.surfaceElevated, justifyContent: 'center', alignItems: 'center',
    marginBottom: space.bloco,
  },
  // 44/48: o número de cartaz do anel, deliberadamente ACIMA da escala (que
  // termina no display 32, título de primeira dobra — não cartaz dentro de um
  // círculo de 150px).
  ringValue: { color: colors.text, fontSize: 44, lineHeight: 48, fontWeight: '800' },

  mutedText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },

  fileira: { marginTop: space.secao },

  etiqueta: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  tituloSecao: { ...type.secao, color: colors.text, marginTop: space.junto, textTransform: 'capitalize' },
  tabela: { marginTop: space.bloco },

  progressTrack: {
    height: space.junto, borderRadius: space.grudado, backgroundColor: colors.border,
    overflow: 'hidden', marginTop: space.bloco,
  },
  progressFill: { height: space.junto, borderRadius: space.grudado, backgroundColor: colors.green },
  celebration: { ...type.corpoCurto, color: colors.gold, textAlign: 'center', marginTop: space.entre },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.dentro, marginTop: space.entre },
  // Sem fundo proprio: a faixa JA e o chao do card, e card escuro sobre faixa
  // clara lia como buraco recortado no meio da onda (medido na foto de
  // 12/09/2026). O que separa uma conquista da vizinha e o fio e o respiro,
  // nao um segundo retangulo de cor.
  badgeCard: {
    flexGrow: 1, flexBasis: '45%', borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    borderRadius: space.bloco, padding: space.bloco, alignItems: 'center',
  },
  badgeCardLocked: { opacity: 0.5 },
  // 30: o emoji da conquista. Emoji não tem entrelinha de parágrafo nem
  // hierarquia de título — medir um 🔥 pela escala tipográfica é régua errada.
  badgeEmoji: { fontSize: 30, marginBottom: space.junto },
  badgeTitle: { ...type.corpoCurto, color: colors.text, textAlign: 'center' },
  badgeDesc: { ...type.nota, color: colors.textMuted, marginTop: space.grudado, textAlign: 'center' },

  rodape: { marginTop: space.secao },
  disclaimer: { ...type.nota, color: colors.textMuted, textAlign: 'center' },

  btn: {
    backgroundColor: colors.accent, borderRadius: space.bloco,
    paddingVertical: space.bloco, paddingHorizontal: space.entre,
    alignItems: 'center', marginTop: space.entre,
  },
  btnText: { ...type.botao, color: '#fff' },

  emptyProfile: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.secao },
  emptyProfileTitle: { ...type.cartao, color: colors.text, textAlign: 'center', marginTop: space.bloco },
  emptyProfileDesc: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center', marginTop: space.dentro },
});
