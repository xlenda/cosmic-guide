// screens/QuizCosmicoScreen.js
// A TELA DO QUIZ "VOCÊ SABIA?" — rodada de 7 perguntas por dia, feedback
// imediato com explicação e recibo, placar com frase por faixa no fim.
//
// NÃO CONFUNDIR com screens/QuizScreen.js, que é o quiz do CASAL — outra
// feature, outro motor. Este arquivo consome lib/quizCosmico.js e mais nada.
//
// ===========================================================================
// O MOTOR JÁ EXISTE. LEIA lib/quizCosmico.js ANTES DE MEXER AQUI.
// ===========================================================================
// Esta tela NÃO escreve conteúdo: pergunta, opções, explicação, recibo e as
// frases de placar saem todos de lib/quizCosmico.js, onde a varredura de
// test/quizCosmico.test.js os segura. Escrever texto de conteúdo AQUI seria
// escapar da varredura pela porta dos fundos — e o teste também varre este
// arquivo inteiro, de propósito, pra fechar essa porta.
//
// O chrome (rótulos de botão, contadores) TAMBÉM sai do motor: chromeDaTela(lang)
// devolve as mesmas frases que viviam aqui como constante PT, agora nos três
// idiomas. lib/i18n.js continua fora desta tela de propósito — o texto do quiz
// inteiro, conteúdo e chrome, viaja pelos packs de lib/traducoes/quiz.<lang>.js.
// O que `lang` NÃO muda: a rodada do dia (mesmas 7 perguntas em qualquer
// língua) e qual alternativa é a certa.
//
// ===========================================================================
// COMO O PROGRESSO FUNCIONA (e por que recarregar no FOCO)
// ===========================================================================
// · A rodada do dia é determinística (rodadaDoDia): sair no meio e voltar não
//   embaralha nada — o emAndamento gravado diz quantas já foram respondidas e
//   a lista se reconstrói sozinha, nas mesmas 7.
// · Cada resposta é gravada na hora (aplicarResposta + salvarQuizCosmico via
//   lib/storage.js). Fechar o app depois da pergunta 5 preserva as 5.
// · useFocusEffect em vez de useEffect pela mesma lição de virada de dia de
//   JornadaScreen.js: a tela pode ficar montada na stack e o dia local mudar
//   embaixo dela — no foco a gente relê o dia e o estado, e quem terminou a
//   rodada ontem encontra a de hoje aberta, sem reiniciar o app.
// · Sem medalha: o único sistema de medalhas do app é o da Jornada. O fim
//   daqui é placar + frase (fraseDoPlacar) + acumulado da vida, e acabou.
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { localDayStr } from '../lib/localDay';
import {
  TAMANHO_RODADA,
  temaRotulos,
  chromeDaTela,
  rodadaDoDia,
  fraseDoPlacar,
  carregarQuizCosmico,
  salvarQuizCosmico,
  aplicarResposta,
  rodadaFeita,
} from '../lib/quizCosmico';

// ---------------------------------------------------------------------------
// Peças pequenas
// ---------------------------------------------------------------------------

// Sete pontinhos de progresso da rodada — mesma leitura de relance das
// Bolinhas de JornadaScreen.js, sem barra contínua.
function Pontos({ feitos, total, atual }) {
  const pontos = [];
  for (let n = 1; n <= total; n += 1) pontos.push(n);
  return (
    <View style={styles.dots}>
      {pontos.map((n) => (
        <View
          key={n}
          style={[styles.dot, n <= feitos && styles.dotFeito, n === atual && styles.dotAtual]}
        />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// A tela
// ---------------------------------------------------------------------------
export default function QuizCosmicoScreen() {
  const navigation = useNavigation();
  // `lang` é o fio inteiro do idioma aqui: chrome, perguntas, rótulo de tema e
  // frase de placar saem do motor já na língua da pessoa. Nada de texto escrito
  // nesta tela — ver cabeçalho.
  const { lang } = useLanguage();
  const TXT = chromeDaTela(lang);

  const [estado, setEstado] = useState(null); // carregarQuizCosmico()
  const [dia, setDia] = useState(localDayStr());
  const [posicao, setPosicao] = useState(0); // 0..6 dentro da rodada
  const [escolhida, setEscolhida] = useState(null); // índice tocado, null = ainda não respondeu
  const [gravando, setGravando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      (async () => {
        const hoje = localDayStr();
        const e = await carregarQuizCosmico();
        if (!vivo) return;
        setDia(hoje);
        setEstado(e);
        setEscolhida(null);
        // Retoma de onde parou SE a rodada em andamento é a de hoje; rodada de
        // outro dia fica pra trás (as perguntas de hoje são outras — o motor
        // descarta o emAndamento velho na primeira resposta).
        const ea = e.emAndamento && e.emAndamento.dia === hoje ? e.emAndamento : null;
        setPosicao(ea ? ea.respondidas : 0);
      })();
      return () => {
        vivo = false;
      };
    }, [])
  );

  // Determinística por dia: recarregar no meio da rodada devolve as MESMAS 7.
  // Trocar de idioma no meio também: a rodada não depende de `lang`, só o texto.
  const perguntas = useMemo(() => rodadaDoDia(dia, lang), [dia, lang]);

  const feita = estado ? rodadaFeita(estado, dia) : null;
  const pergunta = !feita && posicao < TAMANHO_RODADA ? perguntas[posicao] : null;
  const ultimaDaRodada = posicao === TAMANHO_RODADA - 1;

  const responder = useCallback(
    async (idx) => {
      if (escolhida !== null || !pergunta || gravando) return;
      setEscolhida(idx);
      setGravando(true);
      const novo = aplicarResposta(estado, dia, idx === pergunta.certaIdx);
      setEstado(novo);
      // Grava a cada resposta — sair no meio preserva o que já foi feito.
      await salvarQuizCosmico(novo);
      setGravando(false);
    },
    [escolhida, pergunta, gravando, estado, dia]
  );

  const avancar = useCallback(() => {
    setEscolhida(null);
    setPosicao((p) => p + 1);
    // Depois da 7ª resposta o motor já fechou a rodada no historico — na
    // próxima renderização `feita` existe e a tela cai no placar sozinha.
  }, []);

  return (
    <View style={styles.tela}>
      <GradientHeader
        title={TXT.titulo}
        subtitle={TXT.subtitulo}
        onBack={() => navigation.goBack()}
      />
      <ScrollView style={styles.corpo} contentContainerStyle={styles.corpoConteudo}>
        {!estado ? (
          <ActivityIndicator color={colors.purple} style={styles.carregando} />
        ) : feita ? (
          <Placar feita={feita} totais={estado.totais} TXT={TXT} lang={lang} />
        ) : pergunta ? (
          <View>
            <View style={styles.topoRodada}>
              <Text style={styles.contador}>{TXT.contador(posicao + 1, TAMANHO_RODADA)}</Text>
              <View style={styles.temaBadge}>
                <Text style={styles.temaTexto}>{temaRotulos(lang)[pergunta.tema] || ''}</Text>
              </View>
            </View>
            <Pontos
              feitos={escolhida !== null ? posicao + 1 : posicao}
              total={TAMANHO_RODADA}
              atual={posicao + 1}
            />

            <Text style={styles.pergunta}>{pergunta.pergunta}</Text>

            {pergunta.opcoes.map((opcao, idx) => {
              const respondeu = escolhida !== null;
              const ehCerta = idx === pergunta.certaIdx;
              const ehEscolhida = idx === escolhida;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.opcao,
                    respondeu && ehCerta && styles.opcaoCerta,
                    respondeu && ehEscolhida && !ehCerta && styles.opcaoErrada,
                  ]}
                  onPress={() => responder(idx)}
                  disabled={respondeu}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`${TXT.a11yOpcao(idx + 1)}: ${opcao}`}
                >
                  <Text
                    style={[
                      styles.opcaoTexto,
                      respondeu && ehCerta && styles.opcaoTextoCerta,
                      respondeu && ehEscolhida && !ehCerta && styles.opcaoTextoErrada,
                    ]}
                  >
                    {opcao}
                  </Text>
                  {respondeu && ehCerta ? (
                    <Ionicons name="checkmark-circle" size={20} color={colors.green} />
                  ) : null}
                  {respondeu && ehEscolhida && !ehCerta ? (
                    <Ionicons name="close-circle" size={20} color={colors.red} />
                  ) : null}
                </TouchableOpacity>
              );
            })}

            {escolhida !== null ? (
              <View style={styles.feedback}>
                <Text style={styles.feedbackTitulo}>
                  {escolhida === pergunta.certaIdx ? TXT.certo : TXT.errado}
                </Text>
                <Text style={styles.explicacao}>{pergunta.explicacao}</Text>
                <Text style={styles.fonte}>
                  {TXT.fontePrefixo}
                  {pergunta.fonte}
                </Text>
                <TouchableOpacity
                  style={styles.botao}
                  onPress={avancar}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                >
                  <Text style={styles.botaoTexto}>
                    {ultimaDaRodada ? TXT.verPlacar : TXT.proxima}
                  </Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.text} />
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        ) : (
          // posicao passou do fim sem historico — estado transitório raro
          // (ex.: resposta ainda gravando); o foco seguinte normaliza.
          <ActivityIndicator color={colors.purple} style={styles.carregando} />
        )}
      </ScrollView>
    </View>
  );
}

// O placar do dia: nota da rodada, frase por faixa (do motor), acumulado da
// vida e o convite de amanhã. Nenhuma medalha — ver cabeçalho.
function Placar({ feita, totais, TXT, lang }) {
  return (
    <View style={styles.placar}>
      <Text style={styles.placarAviso}>{TXT.rodadaFeitaAviso}</Text>
      <Text style={styles.placarTitulo}>{TXT.placarTitulo}</Text>
      <Text style={styles.placarNota}>{TXT.placarDe(feita.acertos, feita.total)}</Text>
      <Text style={styles.placarFrase}>{fraseDoPlacar(feita.acertos, feita.total, lang)}</Text>
      <View style={styles.separador} />
      <Text style={styles.acumulado}>{TXT.acumulado(totais.respondidas, totais.acertos)}</Text>
      <Text style={styles.amanha}>{TXT.amanha}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  corpo: { flex: 1 },
  corpoConteudo: { padding: 16, paddingBottom: 40 },
  carregando: { marginTop: 48 },

  topoRodada: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contador: { color: colors.textMuted, fontSize: 13 },
  temaBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  temaTexto: { color: colors.purple, fontSize: 12, fontWeight: '600' },

  dots: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotFeito: { backgroundColor: colors.purple },
  dotAtual: { borderWidth: 1, borderColor: colors.gold },

  pergunta: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 16,
  },

  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 8,
  },
  opcaoCerta: { borderColor: colors.green, backgroundColor: colors.surface },
  opcaoErrada: { borderColor: colors.red },
  opcaoTexto: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, flex: 1 },
  opcaoTextoCerta: { color: colors.text, fontWeight: '600' },
  opcaoTextoErrada: { color: colors.textMuted },

  feedback: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginTop: 8,
  },
  feedbackTitulo: { color: colors.gold, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  explicacao: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  // O recibo vem DEPOIS da explicação, menor e mais apagado — é recibo, não
  // manchete. Prende primeiro, fonte depois: a ordem visual repete a regra.
  fonte: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 8 },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  botaoTexto: { color: colors.text, fontSize: 14, fontWeight: '700' },

  placar: { alignItems: 'center', paddingTop: 24 },
  placarAviso: { color: colors.textMuted, fontSize: 12, marginBottom: 16 },
  placarTitulo: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
  placarNota: { color: colors.text, fontSize: 40, fontWeight: '800', marginBottom: 12 },
  placarFrase: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  separador: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  acumulado: { color: colors.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 8 },
  amanha: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
