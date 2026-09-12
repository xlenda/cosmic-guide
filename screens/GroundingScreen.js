// screens/GroundingScreen.js
// ASSENTAR — a tela do ritual: alguns minutos de respiração contada e silêncio
// depois de uma leitura.
//
// ===========================================================================
// LEIA lib/grounding.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// Regra do dono, resumida: respiração e presença são PRÁTICA, nunca
// tratamento. Descreva o que a pessoa VAI FAZER e o que a tradição associa
// (com a fonte). Nunca prometa efeito. A diferença entre certo e errado mora
// na preposição de finalidade: "inspire contando até quatro" descreve;
// "inspire para relaxar" promete. test/grounding.test.js falha o build quando
// isso é violado.
// ===========================================================================
//
// A ORDEM DA TELA NÃO É ARBITRÁRIA:
//   1. o aviso de que isto é prática, não saúde;
//   2. o aviso de contraindicação, no padrão que a Headspace usa — nomear as
//      condições e MANDAR PERGUNTAR A UM PROFISSIONAL. Ele fica VISÍVEL antes
//      de começar, nunca no rodapé: aviso embaixo do conteúdo não é aviso;
//   3. só então a escolha de padrão e de duração.
//
// E a proteção que de fato protege não é nenhum dos dois avisos — é o
// desenho: o padrão pré-selecionado NÃO TEM RETENÇÃO (ver PADRAO_PADRAO em
// lib/grounding.js), então quem só apertou começar nunca recebe o elemento de
// maior risco. Um app que confia só no disclaimer terceirizou o problema para
// um texto que ninguém lê.
//
// O QUE ESTA TELA NÃO TEM, DE PROPÓSITO: contagem de progresso própria,
// recompensa, sequência de ritual, badge de "completou". O contexto de uso é
// alguém que acabou de receber um Tarô ou um sonho interpretado e pode estar
// mexida — se sair no meio custar alguma coisa, a pessoa que está mal fica no
// exercício por causa da métrica. Sair no meio aqui não custa nada, e a tela
// diz isso com todas as letras. O único efeito é o mesmo de qualquer leitura:
// terminar marca o dia como ativo (lib/streak.js recordActiveDay), pelo
// caminho que já existe.
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
// AS PEÇAS DE DIAGRAMAÇÃO (design/PECAS-DE-DIAGRAMACAO.md, lote das práticas
// 12/09/2026). Esta tela é o caso mais puro do "uma ideia por dobra" do
// concorrente: ela é PASSO A PASSO (avisar → escolher o padrão → escolher o
// tempo → começar), e antes corria inteira sobre o mesmo chão, com padding 20 e
// gap 12 — quinze blocos empilhados em lista. As faixas dão o corte que o
// título não dava, e a coluna de leitura tira o parágrafo da borda.
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import BreathGuide from '../components/BreathGuide';
import CosmicSoundPlayer from '../components/CosmicSoundPlayer';
import { useLanguage } from '../context/LanguageContext';
import { recordActiveDay } from '../lib/streak';
import {
  PADROES,
  PADRAO_PADRAO,
  DURACOES_MIN,
  DURACAO_PADRAO_MIN,
  FONTES,
  NAO_ACHADO,
  PLANETAS_LOCUS,
  SEMANA_LOCUS,
  ARISTOTELES_LOCUS,
  TRIPLICIDADE_TERRA,
  formatarTempo,
  guiaDoDia,
  padraoPorId,
  padraoKey,
  regenteKey,
  elementoKey,
  naoAchadoKey,
  sessaoEm,
} from '../lib/grounding';

// Tique da sessão. 250 ms é o suficiente pra contagem virar no segundo certo
// sem parecer que atrasou, e é 4× menos trabalho que um quadro. O tempo
// decorrido vem de relógio de parede (Date.now), não de contagem de tiques —
// aba em segundo plano tem o setInterval estrangulado pelo navegador, e uma
// sessão de 20 minutos contada por tiques terminaria muito depois do que
// prometeu (mesma lição de context/CosmicSoundContext.js).
const TIQUE_MS = 250;

function Section({ title, children, defaultOpen = false }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setOpen((v) => !v)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`${title} — ${open ? t('grounding.collapse') : t('grounding.expand')}`}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

export default function GroundingScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  // 'setup' → 'rodando' → 'fim' (chegou ao tempo) ou 'parou' (saiu no meio).
  const [etapa, setEtapa] = useState('setup');
  const [padraoId, setPadraoId] = useState(PADRAO_PADRAO);
  const [minutos, setMinutos] = useState(DURACAO_PADRAO_MIN);
  const [decorrido, setDecorrido] = useState(0);
  const inicioRef = useRef(0);

  const padrao = padraoPorId(padraoId);

  // O céu de hoje, calculado uma vez por montagem. Determinístico por dia
  // local (ver guiaDoDia): não muda no meio de uma sessão de vinte minutos.
  const guia = useMemo(() => guiaDoDia(new Date()), []);

  const sessao = useMemo(
    () => sessaoEm(padrao, minutos, decorrido),
    [padrao, minutos, decorrido]
  );

  const encerrar = useCallback(() => {
    setEtapa('parou');
    setDecorrido(0);
  }, []);

  const comecar = useCallback(() => {
    inicioRef.current = Date.now();
    setDecorrido(0);
    setEtapa('rodando');
  }, []);

  useEffect(() => {
    if (etapa !== 'rodando') return undefined;
    const totalS = minutos * 60;
    const id = setInterval(() => {
      const t0 = (Date.now() - inicioRef.current) / 1000;
      if (t0 >= totalS) {
        setDecorrido(totalS);
        setEtapa('fim');
        // Terminar conta como dia ativo — o MESMO caminho de qualquer leitura
        // (lib/readingCompletion.js chama a mesma função). Só no fim natural:
        // quem sai no meio não perde nem ganha nada, e não existe contagem
        // própria deste ritual em lugar nenhum.
        // tipo → calendário por cor nos Relatórios (11/09/2026)
        recordActiveDay('grounding').catch(() => {});
        return;
      }
      setDecorrido(t0);
    }, TIQUE_MS);
    return () => clearInterval(id);
  }, [etapa, minutos]);

  const rodando = etapa === 'rodando';
  // Nunca é nulo com os sete regentes deste arquivo (o teste garante que os
  // sete dias da semana resolvam), mas a tela não quebra se um dia faltar: o
  // bloco do dia some e o ritual continua funcionando.
  const regente = guia.regente;

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('grounding.title')}
        subtitle={t('grounding.subtitle')}
        onBack={() => navigation.goBack()}
        gradient={gradients.teal}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {rodando ? (
          // ---------------------------------------------------------------
          // SESSÃO EM CURSO
          // ---------------------------------------------------------------
          // A DOBRA DE UMA IDEIA SÓ. A sessão em curso não leva faixa nenhuma
          // (chão trocando de cor embaixo de quem está respirando é ruído), e
          // por isso ela precisa do próprio respiro — o gap do container saiu.
          <View style={styles.pilha}>
            <BreathGuide
              fase={sessao.fase}
              duracaoFase={sessao.duracaoFase}
              contagem={sessao.contagem}
              ativo
            />

            <Text style={styles.remaining} testID="grounding-remaining">
              {t('grounding.running.remaining', { time: formatarTempo(sessao.restanteS) })}
            </Text>
            <Text style={styles.cycles}>
              {t('grounding.running.cycles', { n: sessao.ciclosCompletos })}
            </Text>

            {/* A permissão de parar fica NA TELA durante a prática, não só no
                aviso do começo. Ela age no momento em que a pessoa precisa e
                desarma a sensação de que interromper é falhar — que é o que de
                fato protege alguém que acabou de ler algo pesado. */}
            <Text style={styles.stopAnytime}>{t('grounding.warning.stopAnytime')}</Text>

            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={encerrar}
              accessibilityRole="button"
            >
              <Ionicons name="stop" size={16} color={colors.textSecondary} />
              <Text style={styles.secondaryBtnText}>{t('grounding.stop')}</Text>
            </TouchableOpacity>

            {/* O som continua sendo o motor único do app (o contexto vive acima
                das abas): aqui é só o mesmo controle remoto. Nunca começa
                sozinho. */}
            <CosmicSoundPlayer variant="inline" />
          </View>
        ) : etapa === 'fim' || etapa === 'parou' ? (
          // ---------------------------------------------------------------
          // DEPOIS — e os dois desfechos valem o mesmo
          // ---------------------------------------------------------------
          <View style={styles.card} testID="grounding-done">
            <Text style={styles.cardLabel}>
              {etapa === 'fim' ? t('grounding.done.title') : t('grounding.stopped.title')}
            </Text>
            <ColunaLeitura>
              <Text style={styles.body}>
                {etapa === 'fim' ? t('grounding.done.body') : t('grounding.stopped.body')}
              </Text>
            </ColunaLeitura>
            {etapa === 'fim' ? <Text style={styles.note}>{t('grounding.done.noCount')}</Text> : null}
            <View style={styles.row}>
              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() => setEtapa('setup')}
                accessibilityRole="button"
              >
                <Ionicons name="refresh" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('grounding.again')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={() => navigation.goBack()}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryBtnText}>{t('grounding.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // ---------------------------------------------------------------
          // ANTES
          // ---------------------------------------------------------------
          <>
            {/* FAIXA 1 — OS DOIS AVISOS. O chão neutro ('noite'): esta é a
                dobra que a pessoa tem que ler antes de respirar, e ela ganha
                seção própria em vez de ser os dois primeiros cartões de uma
                lista de quinze. */}
            <FaixaCurva tom="noite" semente="avisos" style={styles.faixa} estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}>
              {/* Aviso 1: o que esta tela é. Antes de qualquer outra coisa. */}
              <View style={styles.notice} testID="grounding-notice">
                <View style={styles.noticeRow}>
                  <Ionicons name="information-circle" size={18} color={colors.gold} />
                  <Text style={styles.noticeTitle}>{t('grounding.notice.title')}</Text>
                </View>
                <ColunaLeitura>
                  <Text style={styles.noticeBody}>{t('grounding.notice.body')}</Text>
                </ColunaLeitura>
              </View>

            {/* Aviso 2: contraindicação, no padrão da Headspace — nomeia as
                condições e manda perguntar a um profissional. Repare no que
                ele NÃO faz: não descreve sintoma, não explica mecanismo, não
                se coloca como autoridade de saúde. Faz o oposto — aponta pra
                fora. É por isso que ele protege em vez de virar texto médico.
                E repare também que ansiedade aparece aqui como CAUTELA, não
                como público-alvo, ao contrário do que o setor inteiro vende. */}
              <View style={styles.warning} testID="grounding-warning">
                <View style={styles.noticeRow}>
                  <Ionicons name="alert-circle" size={18} color={colors.amber} />
                  <Text style={styles.warningTitle}>{t('grounding.warning.title')}</Text>
                </View>
                <ColunaLeitura>
                  <Text style={styles.warningBody}>{t('grounding.warning.conditions')}</Text>
                </ColunaLeitura>
                <Text style={styles.warningStrong}>{t('grounding.warning.consult')}</Text>
                <Text style={styles.warningBody}>{t('grounding.warning.stopAnytime')}</Text>
              </View>
            </FaixaCurva>

            {/* FAIXA 2 — A ESCOLHA E O COMEÇO. `grude` porque vem logo abaixo
                da anterior (mata o fio de antialias). Aqui mora tudo que é
                DECISÃO: qual padrão, quanto tempo, e o botão. */}
            <FaixaCurva tom="ameixa" semente="escolha" grude style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
            {/* ---- Escolha do padrão ---- */}
            <Text style={styles.groupLabel}>{t('grounding.section.pattern')}</Text>
            {PADROES.map((p) => {
              const ativo = p.id === padraoId;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.option, ativo && styles.optionActive]}
                  activeOpacity={0.85}
                  onPress={() => setPadraoId(p.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: ativo }}
                  accessibilityLabel={t(padraoKey(p.id, 'name'))}
                  testID={`grounding-pattern-${p.id}`}
                >
                  <View style={styles.optionTop}>
                    <Text style={[styles.optionTitle, ativo && styles.optionTitleActive]}>
                      {t(padraoKey(p.id, 'name'))}
                    </Text>
                    <Text style={p.temRetencao ? styles.badgeHold : styles.badgeFree}>
                      {p.temRetencao ? t('grounding.badge.retention') : t('grounding.badge.noRetention')}
                    </Text>
                  </View>
                  <Text style={styles.optionRhythm}>{ritmoDoPadrao(p)}</Text>
                  <ColunaLeitura>
                    <Text style={styles.body}>{t(padraoKey(p.id, 'rhythm'))}</Text>
                  </ColunaLeitura>
                  <Text style={styles.note}>{t(padraoKey(p.id, 'about'))}</Text>
                  <Text style={styles.source}>{p.locus}</Text>
                  <Text style={styles.noteStrong}>{t(padraoKey(p.id, 'caution'))}</Text>
                </TouchableOpacity>
              );
            })}
            {padrao.temRetencao ? (
              <Text style={styles.noteStrong} testID="grounding-retention-note">
                {t('grounding.warning.retention')}
              </Text>
            ) : null}

            {/* ---- Escolha da duração ---- */}
            <Text style={styles.groupLabel}>{t('grounding.section.duration')}</Text>
            <View style={styles.row}>
              {DURACOES_MIN.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.chip, m === minutos && styles.chipActive]}
                  activeOpacity={0.85}
                  onPress={() => setMinutos(m)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: m === minutos }}
                  testID={`grounding-duration-${m}`}
                >
                  <Text style={[styles.chipText, m === minutos && styles.chipTextActive]}>
                    {t('grounding.duration.option', { min: m })}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.note}>{t('grounding.duration.hint')}</Text>

            <TouchableOpacity
              style={styles.primaryBtnWide}
              activeOpacity={0.85}
              onPress={comecar}
              accessibilityRole="button"
              testID="grounding-start"
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>{t('grounding.start')}</Text>
            </TouchableOpacity>

            {/* ---- Som (opcional, controle à mão) ---- */}
            <Text style={styles.groupLabel}>{t('grounding.sound.title')}</Text>
            <Text style={styles.note}>{t('grounding.sound.hint')}</Text>
            <CosmicSoundPlayer variant="inline" />
            </FaixaCurva>

            {/* FAIXA 3 — A TRADIÇÃO. É outro assunto: nada aqui muda o que a
                pessoa vai fazer, é o lastro. O chão muda pra dizer isso sem
                precisar de um título de "referências". */}
            <FaixaCurva tom="violeta" semente="tradicao" grude style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
            {/* ---- O que a tradição associa a hoje ---- */}
            <View style={styles.card} testID="grounding-today">
              <Text style={styles.cardLabel}>{t('grounding.section.today')}</Text>
              {regente ? (
                <>
                  <Text style={styles.todayRuler}>
                    {guia.emoji} {t('grounding.today.ruler', { planet: t(regenteKey(regente.id, 'name')) })}
                  </Text>
                  {/* O sujeito da frase é sempre o PLANETA, nunca quem lê.
                      Ptolomeu descreve efeitos físicos e meteorológicos, não
                      estados de ânimo — "resfriar" e "aquecer" aplicados a uma
                      pessoa, ao lado de um exercício de respiração, leriam como
                      efeito fisiológico. A glosa atribui à tradição e a citação
                      fica ao lado, separada, como em lib/zodiacBody.js. */}
                  <Text style={styles.body}>{t(regenteKey(regente.id, 'quality'))}</Text>
                  <Text style={styles.quote}>«{regente.verbatim}»</Text>
                  <Text style={styles.source}>{PLANETAS_LOCUS}</Text>
                  {regente.temPonte ? (
                    <Text style={styles.note}>{t(regenteKey(regente.id, 'bridge'))}</Text>
                  ) : null}
                </>
              ) : null}
              <Text style={styles.note}>{t('grounding.today.week')}</Text>
              <Text style={styles.source}>{SEMANA_LOCUS}</Text>

              {guia.ceuDisponivel && guia.elemento ? (
                <>
                  <Text style={styles.todayMoon}>
                    {guia.emojiLua}{' '}
                    {t('grounding.today.moon', {
                      sign: guia.signoLua,
                      element: t(elementoKey(guia.elemento.id, 'name')),
                    })}
                  </Text>
                  <Text style={styles.body}>{t(elementoKey(guia.elemento.id, 'qualities'))}</Text>
                  <Text style={styles.source}>{ARISTOTELES_LOCUS}</Text>
                </>
              ) : (
                <Text style={styles.note}>{t('grounding.today.unavailable')}</Text>
              )}
            </View>

            {/* ---- A terra, e as ressalvas que a acompanham ---- */}
            <Section title={t('grounding.terra.title')} defaultOpen={guia.elementoTerra}>
              <Text style={styles.body}>{t('grounding.terra.triplicity')}</Text>
              <Text style={styles.source}>{TRIPLICIDADE_TERRA.locus}</Text>
              <Text style={styles.note}>{t('grounding.terra.divergence')}</Text>
              <Text style={styles.source}>{TRIPLICIDADE_TERRA.divergenciaLocus}</Text>
              {/* A ressalva vem no mesmo bloco, não no fim da tela: a síntese
                  "terra é fria e seca e estes são os signos de terra" não
                  existe inteira em fonte nenhuma, e quem lê a primeira frase
                  tem que ler esta. */}
              <Text style={styles.noteStrong}>{t('grounding.terra.synthesis')}</Text>
            </Section>

            {/* ---- O que a pesquisa não achou ---- */}
            <Section title={t('grounding.section.notFound')}>
              <Text style={styles.body}>{t('grounding.notFound.intro')}</Text>
              {NAO_ACHADO.map((id) => (
                <View key={id} style={styles.bulletRow}>
                  <Text style={styles.bulletMark}>?</Text>
                  <Text style={styles.bulletText}>{t(naoAchadoKey(id))}</Text>
                </View>
              ))}
            </Section>

            {/* ---- Fontes ---- */}
            <Section title={t('grounding.section.sources')}>
              {FONTES.map((f) => (
                <Text key={f} style={styles.source}>
                  · {f}
                </Text>
              ))}
            </Section>

            <ColunaLeitura centralizado>
              <Text style={styles.footerNotice}>{t('grounding.notice.footer')}</Text>
            </ColunaLeitura>
            </FaixaCurva>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// "4-4", "4-4-4-4", "4-7-8" — os números crus, do próprio padrão. Não é texto
// traduzível: é o ritmo, e ele é o mesmo em qualquer idioma.
function ritmoDoPadrao(p) {
  return ['inspira', 'seguraCheio', 'expira', 'seguraVazio']
    .map((f) => p.tempos[f])
    .filter((n) => n > 0)
    .join('-');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // O `padding: 20` fica (é ele que a faixa anula com marginHorizontal:-20, o
  // mesmo contrato de PlanosScreen.js). O que mudou é o gap: era 12 pra tudo —
  // cartão de aviso, opção de padrão e bloco de tradição na MESMA distância, e
  // por isso a tela lia como lista de quinze itens. Agora o irmão dentro da
  // faixa fica em `bloco` e quem separa seção é a própria faixa.
  scroll: { padding: 20, paddingBottom: space.fimDaLista },
  //
  // O `gap` DO CONTAINER SAIU, e o motivo foi medido na foto (390x844,
  // 12/09/2026): com gap no contentContainer aparecia uma TIRA PRETA entre uma
  // faixa e a seguinte, porque o gap do pai e aplicado DEPOIS do marginTop:-1
  // do `grude` e vence. Faixa que nao encosta na proxima perde exatamente o
  // efeito de paisagem que ela existe pra dar: a onda passa a flutuar no vazio
  // em vez de cortar o chao anterior. Quem da respiro agora e a propria faixa
  // (paddingTop/Bottom `secao` da peca); os blocos SOLTOS levam margem propria.
  // Os avulsos entre faixas (erro, cartao solto) pedem a distancia eles mesmos.
  avulso: { marginVertical: space.entre },
  // A pilha das dobras SEM faixa (sessão em curso, desfecho): o respiro que o
  // container deixou de dar.
  pilha: { gap: space.entre },
  // A faixa sangra pra fora do padding: faixa que não sangra é cartão com onda
  // em cima. O corpo dela respira nas laterais de volta.
  faixa: { marginHorizontal: -20 },
  faixaCorpo: { paddingHorizontal: 20, gap: space.bloco },
  // A PRIMEIRA FAIXA DA TELA NAO LEVA O paddingTop DA PECA. Medido na foto
  // (390x844, 12/09/2026): a caixa da onda ja tem ONDA_ALTURA (56px) e, logo
  // abaixo do cabecalho — que ja traz folga propria —, somar o space.secao (32)
  // padrao abria ~88px de chao liso antes da primeira palavra. Isso e o defeito
  // ALTO que o revisor achou na Home: a faixa lendo como bloco de cor vazio em
  // vez de secao. E o mesmo remedio que a Home usou (ver o prop estiloCorpo em
  // components/FaixaCurva.js); as faixas seguintes, que nao encostam no
  // cabecalho, seguem com o degrau cheio.
  faixaCorpoPrimeira: { paddingTop: 0 },

  notice: {
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.45)',
    padding: space.bloco,
    gap: space.junto,
  },
  noticeRow: { flexDirection: 'row', alignItems: 'center', gap: space.junto },
  noticeTitle: { ...type.cartao, color: colors.gold, flex: 1 },
  noticeBody: { ...type.corpoCurto, color: colors.textSecondary },

  warning: {
    backgroundColor: 'rgba(255,184,77,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,184,77,0.5)',
    padding: space.bloco,
    gap: space.junto,
  },
  warningTitle: { ...type.cartao, color: colors.amber, flex: 1 },
  warningBody: { ...type.corpoCurto, color: colors.textSecondary },
  // O único negrito da caixa: é a linha que manda procurar um profissional.
  warningStrong: { ...type.corpoCurto, color: colors.amber, fontWeight: '700' },

  footerNotice: {
    ...type.nota,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: space.dentro,
  },

  // A etiqueta maiúscula da escala — o letterSpacing já vem com ela.
  groupLabel: {
    ...type.etiqueta,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: space.dentro,
  },

  option: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.bloco,
    gap: space.junto,
  },
  optionActive: { borderColor: colors.teal, backgroundColor: 'rgba(92,224,216,0.08)' },
  optionTop: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  optionTitle: { ...type.cartao, color: colors.text, flex: 1 },
  optionTitleActive: { color: colors.teal },
  optionRhythm: { ...type.apoio, color: colors.purple, fontWeight: '700', letterSpacing: 1 },
  badgeHold: {
    ...type.nota,
    color: colors.amber,
    fontWeight: '600',
    backgroundColor: 'rgba(255,184,77,0.15)',
    borderRadius: 8,
    paddingHorizontal: space.junto,
    paddingVertical: space.grudado,
    overflow: 'hidden',
  },
  badgeFree: {
    ...type.nota,
    color: colors.green,
    fontWeight: '600',
    backgroundColor: 'rgba(95,217,140,0.15)',
    borderRadius: 8,
    paddingHorizontal: space.junto,
    paddingVertical: space.grudado,
    overflow: 'hidden',
  },

  row: { flexDirection: 'row', gap: space.dentro, alignItems: 'center', flexWrap: 'wrap' },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.bloco,
    paddingVertical: space.dentro,
  },
  chipActive: { borderColor: colors.teal, backgroundColor: 'rgba(92,224,216,0.12)' },
  chipText: { ...type.botao, color: colors.textSecondary },
  chipTextActive: { color: colors.teal },

  primaryBtn: {
    flexDirection: 'row',
    gap: space.junto,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: space.dentro,
    paddingHorizontal: space.bloco + space.grudado,
    alignItems: 'center',
  },
  // O botão de começar é o fim da dobra da DECISÃO: `entre` acima dele separa
  // a escolha do ato (era marginTop 4, que colava um no outro).
  primaryBtnWide: {
    flexDirection: 'row',
    gap: space.junto,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: space.bloco,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space.entre,
  },
  primaryBtnText: { ...type.botao, color: '#fff', fontWeight: '700' },
  secondaryBtn: {
    flexDirection: 'row',
    gap: space.junto,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: space.dentro,
    paddingHorizontal: space.bloco + space.grudado,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { ...type.botao, color: colors.textSecondary },

  // A SESSÃO EM CURSO — a tela de uma ideia só do print ("Carta diária":
  // título, data, duas linhas finas e metade em céu). O tempo que falta é o
  // único número grande, e `ar` acima dele é o silêncio que faz o olho pousar.
  remaining: { ...type.numero, color: colors.text, textAlign: 'center', marginTop: space.ar },
  cycles: { ...type.apoio, color: colors.textMuted, textAlign: 'center' },
  stopAnytime: {
    ...type.corpoCurto,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: space.entre,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.bloco,
    gap: space.dentro,
  },
  cardLabel: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  todayRuler: { ...type.secao, color: colors.gold },
  todayMoon: { ...type.cartao, color: colors.teal, marginTop: space.junto },

  body: { ...type.corpoCurto, color: colors.textSecondary },
  note: { ...type.apoio, color: colors.textSecondary },
  noteStrong: { ...type.apoio, color: colors.gold, fontWeight: '700' },
  quote: { ...type.apoio, color: colors.purple, fontStyle: 'italic' },
  source: { ...type.nota, color: colors.textMuted },

  section: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.bloco,
    gap: space.dentro,
  },
  sectionTitle: { ...type.cartao, color: colors.text, flex: 1 },
  sectionBody: { paddingHorizontal: space.bloco, paddingBottom: space.bloco, gap: space.dentro },

  bulletRow: { flexDirection: 'row', gap: space.junto, alignItems: 'flex-start' },
  bulletMark: { ...type.apoio, color: colors.amber, fontWeight: '700', width: 14 },
  bulletText: { ...type.corpoCurto, color: colors.textSecondary, flex: 1 },
});
