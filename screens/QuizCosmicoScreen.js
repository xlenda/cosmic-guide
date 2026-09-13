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
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva, { corDoTom } from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
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

  // `escolhida !== null` segura o placar enquanto a 7ª resposta ainda está na
  // tela. BUG QUE ISTO CORRIGE (01/08/2026): rodadaFeita() vira verdadeiro no
  // instante em que responder() grava a 7ª resposta — o motor fecha a rodada
  // no histórico ali mesmo. Como o render testa `feita` ANTES de `pergunta`, o
  // placar substituía o card no MESMO re-render do toque: a pessoa respondia a
  // última e nunca via se acertou, nem a explicação, nem o recibo da fonte.
  // Justamente a pergunta que mais merece o fecho, porque é a que ela lembra.
  const rodadaFechada = estado ? rodadaFeita(estado, dia) : null;
  const feita = rodadaFechada && escolhida === null ? rodadaFechada : null;
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
            {/* FAIXA 1 — a pergunta e as quatro portas (12/09/2026, o lote de
                diagramação). Antes tudo corria sobre o mesmo fundo chapado e a
                tela lia como formulário: contador, pontinhos, pergunta e
                opções sem nenhuma mudança de chão entre eles
                (design/lote-diagramacao/antes/quiz-cosmico*). Ameixa é a faixa
                principal: é onde a pessoa decide. */}
            <FaixaCurva
              tom="ameixa"
              semente="quiz-pergunta"
              // paddingTop 0: MEDIDO em 390px, esta faixa abria com 88px de
              // chao morto acima de "Pergunta 1 de 7" — 56 da caixa da onda
              // mais os 32 do paddingTop padrao. Ela vem logo abaixo do
              // GradientHeader, que JA tem folga embaixo, entao os dois
              // respiros somavam e a faixa lia como bloco de cor antes de
              // qualquer palavra. E o mesmo caso que o cabecalho de
              // components/FaixaCurva.js descreve (a faixa que abre a Home).
              // Com 0 o chao morto cai pra 56, que e a onda — e a onda e o
              // desenho, nao vazio.
              estiloCorpo={styles.faixaPergunta}
            >
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

            </FaixaCurva>

            {/* FAIXA 2 — o fecho: acertou ou não, a explicação, o recibo e o
                botão. Violeta porque ela precisa se destacar da faixa de cima
                — é o momento em que a tela responde. A explicação entra em
                ColunaLeitura: é o único parágrafo longo da tela.
                A faixa só existe DEPOIS da resposta — nunca desenha moldura
                vazia esperando toque. */}
            {escolhida !== null ? (
              <FaixaCurva tom="violeta" semente="quiz-fecho" grude="ameixa">
                <Text style={styles.feedbackTitulo}>
                  {escolhida === pergunta.certaIdx ? TXT.certo : TXT.errado}
                </Text>
                <ColunaLeitura style={styles.colunaExplicacao}>
                  <Text style={styles.explicacao}>{pergunta.explicacao}</Text>
                  <Text style={styles.fonte}>
                    {TXT.fontePrefixo}
                    {pergunta.fonte}
                  </Text>
                </ColunaLeitura>
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
              </FaixaCurva>
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
    <View>
      {/* A NOTA tem chão próprio (12/09/2026): antes o placar inteiro — nota,
          frase, acumulado e o convite de amanhã — vivia numa coluna única
          separada por um fio de 1px, e o fio não diz "outro assunto", só diz
          "linha". Ameixa embaixo da nota, dourado no epílogo (o acumulado da
          vida e o amanhã, que é o convite de voltar). */}
      <FaixaCurva tom="ameixa" semente="quiz-placar" estiloCorpo={styles.placarCorpo}>
        <Text style={styles.placarAviso}>{TXT.rodadaFeitaAviso}</Text>
        <Text style={styles.placarTitulo}>{TXT.placarTitulo}</Text>
        <Text style={styles.placarNota}>{TXT.placarDe(feita.acertos, feita.total)}</Text>
        <ColunaLeitura centralizado>
          <Text style={styles.placarFrase}>{fraseDoPlacar(feita.acertos, feita.total, lang)}</Text>
        </ColunaLeitura>
      </FaixaCurva>

      <FaixaCurva tom="dourado" semente="quiz-amanha" grude="ameixa" estiloCorpo={styles.placarCorpo}>
        <Text style={styles.acumulado}>{TXT.acumulado(totais.respondidas, totais.acertos)}</Text>
        <Text style={styles.amanha}>{TXT.amanha}</Text>
      </FaixaCurva>
    </View>
  );
}

const styles = StyleSheet.create({
  // O CHÃO DA TELA É O TOM DA ÚLTIMA FAIXA, não o fundo cru (12/09/2026,
  // medido em foto). Com `colors.background` aqui, todo espaço que o conteúdo
  // não preenche vira #0B0712 — 128px de buraco abaixo das quatro opções, com
  // a pergunta boiando. A faixa é translúcida sobre este chão, então pintá-lo
  // com o mesmo tom faz a seção simplesmente CONTINUAR até o pé em tela curta.
  // Em tela cheia nada muda: o conteúdo cobre o chão inteiro.
  tela: { flex: 1, backgroundColor: corDoTom('ameixa') },
  corpo: { flex: 1 },
  // Sem padding lateral: as faixas sangram de ponta a ponta e trazem o
  // próprio space.tela por dentro.
  // flexGrow 1: com conteúdo mais curto que a tela o container encolhia até o
  // conteúdo e sobrava FUNDO CRU embaixo da última faixa — medido 128px aqui,
  // e a pergunta ficava boiando num buraco. Crescendo, a faixa de baixo chega
  // até o pé em tela curta e nada muda em tela cheia (flexGrow só age quando
  // sobra espaço).
  corpoConteudo: { flexGrow: 1, paddingBottom: space.ar },
  carregando: { marginTop: space.ar },

  topoRodada: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.dentro,
  },
  contador: { ...type.apoio, color: colors.textMuted },
  temaBadge: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: space.dentro,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  temaTexto: { ...type.nota, color: colors.purple, fontWeight: '600' },

  faixaPergunta: { paddingTop: 0 },
  dots: { flexDirection: 'row', gap: space.junto, marginBottom: space.entre },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotFeito: { backgroundColor: colors.purple },
  dotAtual: { borderWidth: 1, borderColor: colors.gold },

  // Degrau `secao` da escala (20/26) no lugar de 18/26 solto, e o respiro
  // abaixo sobe de 16 pra `entre`: a pergunta é a manchete da faixa e precisa
  // de ar antes das portas.
  pergunta: { ...type.secao, color: colors.text, marginBottom: space.entre },

  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: space.bloco,
    paddingVertical: space.bloco,
    // marginTop, nao marginBottom (12/09/2026): com marginBottom a ULTIMA
    // opcao somava a propria margem ao paddingBottom da faixa e o pe da secao
    // ficava 12px mais fundo que o topo — medido 61 contra 32. Com marginTop a
    // margem cai entre as opcoes, que e onde ela serve, e a primeira nao leva
    // nenhuma (ela ja tem o respiro da pergunta acima).
    marginTop: space.dentro,
    gap: space.junto,
  },
  opcaoCerta: { borderColor: colors.green, backgroundColor: colors.surface },
  opcaoErrada: { borderColor: colors.red },
  // Degrau de texto em espaço apertado (15/24): a opção é leitura, não
  // rótulo, e 14/20 fazia quatro alternativas lerem como lista de sistema.
  opcaoTexto: { ...type.corpoCurto, color: colors.textSecondary, flex: 1 },
  opcaoTextoCerta: { color: colors.text, fontWeight: '600' },
  opcaoTextoErrada: { color: colors.textMuted },

  feedbackTitulo: { ...type.cartao, color: colors.gold, marginBottom: space.dentro },
  // A explicação é o único parágrafo da tela: degrau de texto corrido.
  explicacao: { ...type.corpoCurto, color: colors.textSecondary },
  // O recibo vem DEPOIS da explicação, menor e mais apagado — é recibo, não
  // manchete. Prende primeiro, fonte depois: a ordem visual repete a regra.
  fonte: { ...type.apoio, color: colors.textMuted, marginTop: space.dentro },
  colunaExplicacao: { paddingHorizontal: 0 },

  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.junto,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: space.bloco,
    marginTop: space.entre,
  },
  botaoTexto: { ...type.botao, color: colors.text },

  placarCorpo: { alignItems: 'center' },
  placarAviso: { ...type.apoio, color: colors.textMuted, marginBottom: space.entre },
  placarTitulo: { ...type.apoio, color: colors.textSecondary, marginBottom: space.grudado },
  // A nota é O número da tela — fica no degrau `display` (32/40) em vez de
  // um 40 solto que não existe em lugar nenhum da escala.
  placarNota: { ...type.display, color: colors.text, marginBottom: space.dentro },
  placarFrase: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  acumulado: { ...type.apoio, color: colors.textSecondary, textAlign: 'center', marginBottom: space.junto },
  amanha: { ...type.apoio, color: colors.textMuted, textAlign: 'center' },
});
