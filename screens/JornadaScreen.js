// screens/JornadaScreen.js
// A JORNADA GUIADA — as quatro trilhas de 7 dias, o passo de hoje em destaque,
// o check ao concluir, e as medalhas com nome e legenda.
//
// ===========================================================================
// O MOTOR JÁ EXISTE. LEIA lib/jornada.js ANTES DE MEXER AQUI.
// ===========================================================================
// Esta tela NÃO escreve conteúdo. Título, leitura, pergunta de diário, ação,
// nome e legenda de medalha saem todos de lib/jornada.js, onde estão travados
// por test/jornada.test.js: alegação de saúde, promessa de resultado, prova
// social inventada e data sem lastro em docs/tradicao/ falham o build ali.
// Escrever qualquer uma dessas coisas AQUI seria escapar da varredura pela
// porta dos fundos — a tela consome o que o motor exporta, ela não redige.
//
// O que nasce aqui é só a moldura (rótulos, botões, estados), e ela vai pro
// dicionário nos três idiomas — bloco JORNADA_I18N no fim de lib/i18n.js. O
// CONTEÚDO também é traduzido, mas NÃO por aqui: os packs es/en moram em
// lib/traducoes/jornada.<lang>.js e o motor os aplica quando esta tela passa
// `lang` (useLanguage) para os acessores. A tela continua sem redigir nada —
// ela só escolhe o idioma do que o motor entrega.
//
// ===========================================================================
// AS DUAS TRAVAS DO MOTOR, E COMO A TELA AS MOSTRA SEM PARECER CASTIGO
// ===========================================================================
// lib/jornada.js impede pular dia (motivo 'diaAFrente') e impede dois passos no
// mesmo dia local (motivo 'jaFezHoje'). A tela não repete essa lógica — ela
// PERGUNTA, com podeConcluir(), que é puro e devolve o motivo justamente pra
// isso (ver o comentário da seção 8 de lib/jornada.js).
//
// O jeito de mostrar é a decisão de produto, e ela é deliberada:
//   · dia à frente não vira botão desabilitado com aviso vermelho. Vira uma
//     linha numerada apagada, sem texto de erro nenhum — não dá pra errar o que
//     não é oferecido, e a única frase que acompanha é a do formato ("um por
//     dia, na ordem");
//   · quem já fez o passo de hoje não lê "bloqueado": lê a data em que o
//     próximo abre, ao lado do que ela acabou de fechar. É informação, não
//     punição. A frase que fecha o cartão diz que nenhum dia se perde — porque
//     é verdade: normalizarProgresso guarda o prefixo, nada expira.
//
// ===========================================================================
// O PAYWALL, E POR QUE ELE NÃO É "UM USO" AQUI
// ===========================================================================
// O padrão do app é 1 uso grátis vitalício por feature (lib/featureUsage.js +
// OneTimeLock) e assinatura sem limite. A pergunta é o que conta como UM USO
// numa feature cujo formato é voltar amanhã.
//
// Copiar o Calendário Lunar (marca no primeiro carregamento, bloqueia no
// segundo) MATA a feature: a pessoa leria o dia 1 e encontraria o paywall no
// dia 2 — ou seja, nunca existiria uma trilha, só uma página de texto com muro
// no fim. É o oposto exato do que este formato existe pra fazer.
//
// Então a unidade de uso grátis aqui é UMA TRILHA INTEIRA, os sete dias:
//   · a marca (markFeatureUsedOnce) cai quando a pessoa conclui o PRIMEIRO dia
//     de uma trilha qualquer — é aí que ela escolheu qual trilha é a dela;
//   · uma trilha continua aberta enquanto tiver progresso, então a escolhida
//     roda até o dia 7 sem topar com muro nenhum no meio;
//   · as outras três passam a mostrar cadeado, e o muro chega no melhor momento
//     possível: logo depois da medalha "Desbravador do Céu", com a pessoa
//     querendo a próxima trilha.
// Assinante (hasAccess) nunca é marcado e nunca vê cadeado, e enquanto o acesso
// não estiver confirmado (accessConfirmed=false) não se marca nem se bloqueia —
// mesma regra de LunarCalendarScreen.js.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
import CosmicSoundPlayer from '../components/CosmicSoundPlayer';
import OneTimeLock from '../components/OneTimeLock';
import { useLanguage } from '../context/LanguageContext';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordActiveDay } from '../lib/streak';
import {
  FEATURES,
  carregarJornada,
  concluirDia,
  diaDaTrilha,
  fontesDoDia,
  medalhasJornadaParaIdioma,
  medalhasPara,
  podeConcluir,
  proximaMedalha,
  reiniciarTrilha,
  trilhaPorId,
  trilhasParaIdioma,
} from '../lib/jornada';

const FEATURE_KEY = 'jornada';

// ---------------------------------------------------------------------------
// Peças pequenas
// ---------------------------------------------------------------------------

// As bolinhas de progresso. Sete pontos são lidos de relance ("faltam três")
// de um jeito que uma barra contínua não é — e sete é pouco o bastante pra
// caber numa linha em qualquer largura de tela.
function Bolinhas({ feitos, total, atual, rotulo }) {
  const pontos = [];
  for (let n = 1; n <= total; n += 1) pontos.push(n);
  return (
    <View style={styles.dots} accessibilityLabel={rotulo}>
      {pontos.map((n) => (
        <View
          key={n}
          style={[
            styles.dot,
            n <= feitos && styles.dotFeito,
            n === atual && styles.dotAtual,
          ]}
        />
      ))}
    </View>
  );
}

// Bloco recolhível — mesma peça de screens/GroundingScreen.js. Usada nas fontes
// do dia e na releitura de um dia já fechado: as duas são conteúdo que a pessoa
// pode querer, mas que empurraria o passo de hoje pra fora da tela se viesse
// aberto.
function Dobra({ titulo, aberta, onToggle, children, testID }) {
  return (
    <View style={styles.dobra}>
      <TouchableOpacity
        style={styles.dobraHeader}
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ expanded: aberta }}
        testID={testID}
      >
        <Text style={styles.dobraTitulo}>{titulo}</Text>
        <Ionicons
          name={aberta ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {aberta ? <View style={styles.dobraCorpo}>{children}</View> : null}
    </View>
  );
}

// A medalha, do jeito que o Bible Path faz: NOME grande (é o que se printa) e
// legenda embaixo. Os dois vêm de lib/jornada.js, onde o teste garante que a
// legenda descreve o feito e não afirma nada sobre quem lê.
function Medalha({ nome, legenda, nova, rotuloNova }) {
  return (
    <View style={[styles.medalha, nova && styles.medalhaNova]}>
      <View style={styles.medalhaIcone}>
        <Ionicons name="ribbon" size={20} color={nova ? colors.gold : colors.purple} />
      </View>
      <View style={styles.medalhaTexto}>
        {nova ? <Text style={styles.medalhaKicker}>{rotuloNova}</Text> : null}
        <Text style={styles.medalhaNome}>{nome}</Text>
        <Text style={styles.medalhaLegenda}>{legenda}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// A tela
// ---------------------------------------------------------------------------
export default function JornadaScreen() {
  const navigation = useNavigation();
  // `lang` é o fio inteiro do i18n de conteúdo aqui: ele vai pros acessores do
  // motor (trilhasParaIdioma, trilhaPorId, diaDaTrilha, medalhas*) e pro
  // concluirDia — a tela nunca escolhe texto, só o idioma do que o motor dá.
  const { t, lang } = useLanguage();
  const { hasAccess, accessConfirmed } = useCouple();

  const [estado, setEstado] = useState(null); // carregarJornada()
  const [trilhaId, setTrilhaId] = useState(null); // null = lista das trilhas
  const [gasta, setGasta] = useState(false); // a trilha grátis já foi escolhida
  const [bloqueio, setBloqueio] = useState(false); // tocou numa trilha travada
  const [ultimo, setUltimo] = useState(null); // resultado do último concluirDia
  const [gravando, setGravando] = useState(false);
  const [fontesAbertas, setFontesAbertas] = useState(false);
  const [revendo, setRevendo] = useState(null); // dia anterior aberto pra reler

  const recarregar = useCallback(async () => {
    const j = await carregarJornada(lang);
    setEstado(j);
    return j;
  }, [lang]);

  // Recarrega a cada FOCO, não só na montagem — e são duas razões distintas:
  //   · a tela fica montada na stack da aba enquanto a pessoa vai fazer a ação
  //     do dia (abrir o Tarô, o Mapa, o Diário) e volta;
  //   · a trava de um passo por dia é comparada com o dia LOCAL de agora
  //     (podeConcluir recebe new Date()). Sem recarregar, quem fechou o dia 3 às
  //     23h50 continuaria lendo "abre amanhã" às 00h05 — o botão só voltaria
  //     numa reabertura do app. É a mesma lição de virada de dia que
  //     LunarCalendarScreen.js resolve com useFocusEffect.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce(FEATURE_KEY).then(setGasta);
  }, [hasAccess, accessConfirmed]);

  // Uma trilha está aberta se a pessoa assina, se a trilha grátis ainda não foi
  // escolhida, ou se é justamente a que ela já começou. A terceira condição é o
  // que garante que a trilha escolhida vá até o dia 7 sem muro no meio.
  const liberada = useCallback(
    (p) => hasAccess || !gasta || (!!p && p.diasConcluidos.length > 0),
    [hasAccess, gasta]
  );

  const abrirTrilha = useCallback(
    (id) => {
      const p = estado && estado.trilhas[id];
      if (!liberada(p)) {
        setBloqueio(true);
        return;
      }
      setTrilhaId(id);
      setUltimo(null);
      setRevendo(null);
      setFontesAbertas(false);
    },
    [estado, liberada]
  );

  // A ação do dia nunca inventa destino: `rota` sai de FEATURES, que importa
  // routes.js. O Tarô é o único que mora em OUTRA aba (TarotStack dentro de
  // TAROT_TAB) — daí o getParent(), mesmo helper de components/OneTimeLock.js.
  // As outras quatro telas são do próprio HomeStack, e 'som' tem rota nula de
  // propósito: o Som do Céu é um controle montado, não um destino.
  const irParaFeature = useCallback(
    (id) => {
      const f = FEATURES[id];
      if (!f || !f.rota) return;
      if (f.rota === ROUTES.TAROT_MAIN) {
        (navigation.getParent() || navigation).navigate(ROUTES.TAROT_TAB);
        return;
      }
      navigation.navigate(f.rota);
    },
    [navigation]
  );

  const concluir = useCallback(
    async (dia) => {
      if (gravando) return;
      setGravando(true);
      try {
        // `lang` só localiza o texto das medalhas devolvidas — a trava, a
        // gravação e os ids são idênticos nos três idiomas (lib/jornada.js).
        const r = await concluirDia(trilhaId, dia, new Date(), { lang });
        setUltimo(r);
        await recarregar();
        if (r.ok) {
          // A marca do uso grátis cai no PRIMEIRO dia concluído — é o momento
          // em que a pessoa escolheu qual trilha é a dela (ver o cabeçalho).
          if (!hasAccess && accessConfirmed && !gasta) {
            markFeatureUsedOnce(FEATURE_KEY);
            setGasta(true);
          }
          // Mesmo caminho de qualquer leitura terminada (lib/streak.js), o
          // mesmo que GroundingScreen.js usa. A Jornada não inventa contagem
          // própria: fechar um dia marca o dia como ativo e mais nada.
          recordActiveDay().catch(() => {});
        }
      } finally {
        setGravando(false);
      }
    },
    [gravando, trilhaId, lang, recarregar, hasAccess, accessConfirmed, gasta]
  );

  const refazer = useCallback(async () => {
    await reiniciarTrilha(trilhaId);
    setUltimo(null);
    setRevendo(null);
    await recarregar();
  }, [trilhaId, recarregar]);

  const trilha = trilhaId ? trilhaPorId(trilhaId, lang) : null;
  const progresso = estado && trilhaId ? estado.trilhas[trilhaId] : null;

  // O passo de hoje e o veredito do motor sobre ele. `diaAtual` é null quando a
  // trilha fechou — aí não existe passo, existe a medalha final.
  const passo = useMemo(() => {
    if (!progresso || progresso.concluida || progresso.diaAtual === null) return null;
    return diaDaTrilha(trilhaId, progresso.diaAtual, lang);
  }, [progresso, trilhaId, lang]);

  const veredito = useMemo(() => {
    if (!progresso || !passo) return null;
    return podeConcluir(progresso, passo.dia);
  }, [progresso, passo]);

  const fontes = useMemo(
    () => (passo ? fontesDoDia(trilhaId, passo.dia) : []),
    [passo, trilhaId]
  );

  // -------------------------------------------------------------------------
  // Muro: a trilha grátis já foi escolhida e esta não é ela.
  // -------------------------------------------------------------------------
  if (bloqueio && !hasAccess) {
    return <OneTimeLock featureTitle={t('jornada.title')} gradient={gradients.purple} />;
  }

  if (!estado) {
    return (
      <View style={styles.root}>
        <GradientHeader
          title={t('jornada.title')}
          subtitle={t('jornada.subtitle')}
          onBack={() => navigation.goBack()}
          gradient={gradients.purple}
        />
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // 1. A LISTA DAS QUATRO TRILHAS
  // -------------------------------------------------------------------------
  if (!trilha || !progresso) {
    // Memoizado no motor por idioma — chamar na renderização é barato.
    const trilhas = trilhasParaIdioma(lang);
    const proximaDaJornada =
      medalhasJornadaParaIdioma(lang).find((m) => estado.trilhasConcluidas < m.trilhas) || null;

    return (
      <View style={styles.root}>
        <GradientHeader
          title={t('jornada.title')}
          subtitle={t('jornada.subtitle')}
          onBack={() => navigation.goBack()}
          gradient={gradients.purple}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.intro}>{t('jornada.intro')}</Text>

          <View style={styles.resumoRow}>
            <Ionicons name="footsteps" size={16} color={colors.teal} />
            <Text style={styles.resumoTexto}>
              {t('jornada.resumo', {
                feitas: estado.trilhasConcluidas,
                total: trilhas.length,
              })}
            </Text>
          </View>

          <Text style={styles.grupo}>{t('jornada.trilhas.title')}</Text>

          {trilhas.map((tr) => {
            const p = estado.trilhas[tr.id];
            const feitos = p.diasConcluidos.length;
            const aberta = liberada(p);
            const cta = !aberta
              ? t('jornada.trilha.travada')
              : p.concluida
              ? t('jornada.trilha.rever')
              : feitos > 0
              ? t('jornada.trilha.continuar', { dia: p.diaAtual })
              : t('jornada.trilha.comecar');

            return (
              <TouchableOpacity
                key={tr.id}
                style={[styles.trilhaCard, !aberta && styles.trilhaTravada]}
                activeOpacity={0.85}
                onPress={() => abrirTrilha(tr.id)}
                accessibilityRole="button"
                accessibilityLabel={t('jornada.trilha.a11y', {
                  nome: tr.nome,
                  feitos,
                  total: p.total,
                })}
                testID={`jornada-trilha-${tr.id}`}
              >
                <View style={styles.trilhaTop}>
                  <Text style={styles.trilhaNome}>{tr.nome}</Text>
                  {!aberta ? (
                    <Ionicons name="lock-closed" size={15} color={colors.textMuted} />
                  ) : p.concluida ? (
                    <Ionicons name="checkmark-circle" size={17} color={colors.green} />
                  ) : null}
                </View>
                <Text style={styles.trilhaSub}>{tr.subtitulo}</Text>
                <Bolinhas
                  feitos={feitos}
                  total={p.total}
                  atual={p.diaAtual}
                  rotulo={t('jornada.trilha.progresso', { feitos, total: p.total })}
                />
                <View style={styles.trilhaBottom}>
                  <Text style={styles.trilhaProgresso}>
                    {p.concluida
                      ? t('jornada.trilha.concluida')
                      : t('jornada.trilha.progresso', { feitos, total: p.total })}
                  </Text>
                  <Text style={[styles.trilhaCta, !aberta && styles.trilhaCtaTravada]}>{cta}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* ---- Medalhas da Jornada inteira (dependem de trilhas fechadas) ---- */}
          <Text style={styles.grupo}>{t('jornada.medalhasJornada')}</Text>
          {estado.medalhasJornada.length === 0 ? (
            <Text style={styles.hint}>{t('jornada.medalhasJornada.vazio')}</Text>
          ) : (
            estado.medalhasJornada.map((m) => (
              <Medalha key={m.id} nome={m.nome} legenda={m.legenda} />
            ))
          )}
          {proximaDaJornada ? (
            <View style={styles.alvo}>
              <Ionicons name="flag-outline" size={15} color={colors.gold} />
              <Text style={styles.alvoTexto}>
                {t('jornada.medalhasJornada.proxima', { nome: proximaDaJornada.nome })}
              </Text>
              <Text style={styles.alvoFaltam}>
                {proximaDaJornada.trilhas - estado.trilhasConcluidas === 1
                  ? t('jornada.medalhasJornada.faltamUma')
                  : t('jornada.medalhasJornada.faltam', {
                      n: proximaDaJornada.trilhas - estado.trilhasConcluidas,
                    })}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>
    );
  }

  // -------------------------------------------------------------------------
  // 2. DENTRO DE UMA TRILHA
  // -------------------------------------------------------------------------
  const feitos = progresso.diasConcluidos.length;
  const conquistadas = medalhasPara(feitos, lang);
  const proxima = proximaMedalha(feitos, lang);
  const novas = ultimo && ultimo.ok ? ultimo.medalhasNovas : [];
  const novasDaJornada = ultimo && ultimo.ok ? ultimo.medalhasJornadaNovas : [];
  const idsNovas = new Set(novas.map((m) => m.id));
  const diaFechadoAgora =
    ultimo && ultimo.ok
      ? ultimo.progresso.diasConcluidos[ultimo.progresso.diasConcluidos.length - 1]
      : null;
  const podeHoje = !!veredito && veredito.ok;
  const anteriores = trilha.dias.filter((d) => progresso.diasConcluidos.includes(d.dia));
  const futuros = trilha.dias.filter(
    (d) => !progresso.diasConcluidos.includes(d.dia) && (!passo || d.dia > passo.dia)
  );

  return (
    <View style={styles.root}>
      <GradientHeader
        title={trilha.nome}
        subtitle={trilha.subtitulo}
        onBack={() => setTrilhaId(null)}
        gradient={gradients.purple}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.voltar}
          activeOpacity={0.7}
          onPress={() => setTrilhaId(null)}
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={14} color={colors.textMuted} />
          <Text style={styles.voltarTexto}>{t('jornada.voltar')}</Text>
        </TouchableOpacity>

        {/* ---- Progresso, visível antes de qualquer conteúdo ---- */}
        <View style={styles.progressoBloco}>
          <Text style={styles.progressoTexto}>
            {t('jornada.trilha.progresso', { feitos, total: progresso.total })}
          </Text>
          <Bolinhas
            feitos={feitos}
            total={progresso.total}
            atual={progresso.diaAtual}
            rotulo={t('jornada.trilha.progresso', { feitos, total: progresso.total })}
          />
        </View>

        {/* ---- O que acabou de acontecer ---- */}
        {diaFechadoAgora ? (
          <View style={styles.feito} testID="jornada-feito">
            <Ionicons name="checkmark-circle" size={18} color={colors.green} />
            <Text style={styles.feitoTexto}>{t('jornada.feito', { dia: diaFechadoAgora })}</Text>
          </View>
        ) : null}
        {ultimo && !ultimo.ok ? (
          <Text style={styles.erro}>
            {ultimo.motivo === 'jaFezHoje' && passo
              ? t('jornada.esperaAmanha', { dia: passo.dia })
              : t('jornada.erro')}
          </Text>
        ) : null}
        {novas.map((m) => (
          <Medalha
            key={m.id}
            nome={m.nome}
            legenda={m.legenda}
            nova
            rotuloNova={t('jornada.medalhaNova')}
          />
        ))}
        {novasDaJornada.map((m) => (
          <Medalha
            key={m.id}
            nome={m.nome}
            legenda={m.legenda}
            nova
            rotuloNova={t('jornada.medalhaNova')}
          />
        ))}

        {/* ---- O PASSO DE HOJE ---- */}
        {passo ? (
          <View style={styles.hoje} testID="jornada-hoje">
            <Text style={styles.kicker}>{t('jornada.hoje.kicker')}</Text>
            <Text style={styles.diaLabel}>
              {t('jornada.dia', { dia: passo.dia, total: progresso.total })}
            </Text>
            <Text style={styles.diaTitulo}>{passo.titulo}</Text>

            {/* O CORPO SÓ EXISTE NO DIA EM QUE ELE PODE SER FECHADO.
                podeConcluir() só devolve !ok aqui por 'jaFezHoje' (os outros
                motivos são inalcançáveis neste ponto: a trilha fechada não tem
                passo, e diaAtual nunca está concluído nem à frente de si
                mesmo). Ou seja: quando isto está escondido, é porque a pessoa
                JÁ fez o passo de hoje.
                Mostrar a leitura de amanhã aqui seria entregar hoje o conteúdo
                de amanhã e deixar pra amanhã só o toque no botão — o formato
                perde exatamente o que o faz valer (lib/jornada.js, seção 8: uma
                trilha lida numa sentada é uma página de texto). O título fica
                visível de propósito: é gancho, não conteúdo. */}
            {podeHoje ? (
              <>
                <Text style={styles.leitura}>{passo.leitura}</Text>

                {/* O recibo já fecha a leitura em prosa; esta dobra é o mesmo
                    dado em forma de tabela — obra, autor e século separados —,
                    que é o que permite conferir de relance. Vem recolhida de
                    propósito (é o uso que fontesDoDia foi feita pra ter). */}
                <Dobra
                  titulo={t('jornada.recibo')}
                  aberta={fontesAbertas}
                  onToggle={() => setFontesAbertas((v) => !v)}
                  testID="jornada-fontes"
                >
                  {fontes.map((f) => (
                    <View key={f.id} style={styles.fonteLinha}>
                      <Text style={styles.fonteObra}>{f.obra}</Text>
                      <Text style={styles.fonteAutor}>
                        {f.autor} · {f.quando}
                      </Text>
                    </View>
                  ))}
                </Dobra>

                <Text style={styles.blocoLabel}>{t('jornada.pergunta')}</Text>
                <Text style={styles.pergunta}>{passo.pergunta}</Text>
                <Text style={styles.hint}>{t('jornada.pergunta.hint')}</Text>

                <Text style={styles.blocoLabel}>{t('jornada.acao')}</Text>
                <Text style={styles.body}>{passo.acao.texto}</Text>
                {passo.acao.feature === 'som' ? (
                  // 'som' não é destino de navegação: é o <CosmicSoundPlayer>
                  // que já vive montado acima das abas. Em vez de um botão pra
                  // lugar nenhum, o próprio controle entra aqui — mesmo uso
                  // inline de GroundingScreen.js.
                  <>
                    <Text style={styles.hint}>{t('jornada.acao.som')}</Text>
                    <CosmicSoundPlayer variant="inline" />
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.secundario}
                    activeOpacity={0.85}
                    onPress={() => irParaFeature(passo.acao.feature)}
                    accessibilityRole="button"
                    testID="jornada-acao"
                  >
                    <Ionicons name="arrow-forward" size={15} color={colors.teal} />
                    {/* `rotulo` é CHAVE, não texto (lib/jornada.js seção 2) —
                        por isso o t() duplo. Sem isso o botão em inglês lia
                        "Open Diário Cósmico": nome de tela do próprio app
                        interpolado cru dentro de frase traduzida. */}
                    <Text style={styles.secundarioTexto}>
                      {t('jornada.acao.abrir', { feature: t(FEATURES[passo.acao.feature].rotulo) })}
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            ) : null}

            {/* ---- O botão de concluir, ou a data em que o próximo abre ---- */}
            {podeHoje ? (
              <TouchableOpacity
                style={[styles.principal, gravando && styles.principalOcupado]}
                activeOpacity={0.85}
                disabled={gravando}
                onPress={() => concluir(passo.dia)}
                accessibilityRole="button"
                testID="jornada-concluir"
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.principalTexto}>
                  {t('jornada.concluir', { dia: passo.dia })}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.espera} testID="jornada-espera">
                <Ionicons name="moon-outline" size={15} color={colors.gold} />
                <Text style={styles.esperaTexto}>
                  {t('jornada.esperaAmanha', { dia: passo.dia })}
                </Text>
              </View>
            )}
            <Text style={styles.hint}>{t('jornada.umPorDia')}</Text>
          </View>
        ) : (
          // ---- Trilha inteira: nada de oitavo dia, só o que ela virou ----
          <View style={styles.hoje} testID="jornada-concluida">
            <Ionicons name="trophy" size={26} color={colors.gold} />
            <Text style={styles.diaTitulo}>{t('jornada.concluida.title')}</Text>
            <Text style={styles.body}>{t('jornada.concluida.body')}</Text>
            {/* Refazer só aparece pra quem não perde nada refazendo.
                reiniciarTrilha() apaga os dias concluídos, e é justamente o
                progresso que mantém a trilha grátis destravada (ver `liberada`)
                — pra quem já gastou a trilha grátis, o botão seria uma armadilha
                de um toque: apagaria as medalhas E trancaria a única trilha que
                ela tinha. Quem assina refaz à vontade. Reler continua possível
                pra todo mundo, logo abaixo, em "dias que você já fechou". */}
            {hasAccess || !gasta ? (
              <TouchableOpacity
                style={styles.secundario}
                activeOpacity={0.85}
                onPress={refazer}
                accessibilityRole="button"
                testID="jornada-refazer"
              >
                <Ionicons name="refresh" size={15} color={colors.teal} />
                <Text style={styles.secundarioTexto}>{t('jornada.refazer')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        {/* ---- DIAS JÁ FECHADOS — check e releitura ---- */}
        {anteriores.length > 0 ? (
          <>
            <Text style={styles.grupo}>{t('jornada.anteriores')}</Text>
            {anteriores.map((d) => (
              <View key={d.dia} style={styles.anterior}>
                <TouchableOpacity
                  style={styles.anteriorHeader}
                  activeOpacity={0.7}
                  onPress={() => setRevendo((v) => (v === d.dia ? null : d.dia))}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: revendo === d.dia }}
                  testID={`jornada-anterior-${d.dia}`}
                >
                  <Ionicons name="checkmark-circle" size={18} color={colors.green} />
                  <View style={styles.anteriorTextos}>
                    <Text style={styles.anteriorDia}>
                      {t('jornada.futuros.dia', { dia: d.dia })}
                    </Text>
                    <Text style={styles.anteriorTitulo}>{d.titulo}</Text>
                  </View>
                  <Text style={styles.anteriorRever}>{t('jornada.anteriores.rever')}</Text>
                </TouchableOpacity>
                {revendo === d.dia ? (
                  <View style={styles.anteriorCorpo}>
                    <Text style={styles.leitura}>{d.leitura}</Text>
                    <Text style={styles.pergunta}>{d.pergunta}</Text>
                    <Text style={styles.body}>{d.acao.texto}</Text>
                  </View>
                ) : null}
              </View>
            ))}
          </>
        ) : null}

        {/* ---- O QUE VEM PELA FRENTE — número apagado, sem texto de erro ---- */}
        {futuros.length > 0 ? (
          <>
            <Text style={styles.grupo}>{t('jornada.futuros')}</Text>
            {futuros.map((d) => (
              <View key={d.dia} style={styles.futuro}>
                <Ionicons name="ellipse-outline" size={14} color={colors.textMuted} />
                <Text style={styles.futuroTexto}>{t('jornada.futuros.dia', { dia: d.dia })}</Text>
              </View>
            ))}
            <Text style={styles.hint}>{t('jornada.futuros.hint')}</Text>
          </>
        ) : null}

        {/* ---- MEDALHAS DA TRILHA, e a próxima como alvo visível ---- */}
        <Text style={styles.grupo}>{t('jornada.medalhas')}</Text>
        {conquistadas.length === 0 ? (
          <Text style={styles.hint}>{t('jornada.medalhas.vazio')}</Text>
        ) : (
          conquistadas.map((m) => (
            <Medalha
              key={m.id}
              nome={m.nome}
              legenda={m.legenda}
              nova={idsNovas.has(m.id)}
              rotuloNova={t('jornada.medalhaNova')}
            />
          ))
        )}
        {proxima ? (
          <View style={styles.alvo} testID="jornada-proxima-medalha">
            <Ionicons name="flag-outline" size={15} color={colors.gold} />
            <Text style={styles.alvoTexto}>
              {t('jornada.medalhas.proxima', { nome: proxima.nome })}
            </Text>
            <Text style={styles.alvoFaltam}>
              {proxima.marco - feitos === 1
                ? t('jornada.medalhas.faltamUm')
                : t('jornada.medalhas.faltam', { n: proxima.marco - feitos })}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  hint: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  grupo: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 10,
  },

  resumoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resumoTexto: { color: colors.teal, fontSize: 13, fontWeight: '700' },

  // ---- bolinhas ----
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'transparent',
  },
  dotFeito: { backgroundColor: colors.green, borderColor: colors.green },
  dotAtual: { borderColor: colors.gold, backgroundColor: 'rgba(255,200,92,0.25)' },

  // ---- lista de trilhas ----
  trilhaCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 6,
  },
  trilhaTravada: { opacity: 0.6 },
  trilhaTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trilhaNome: { color: colors.text, fontSize: 17, fontWeight: '800', flex: 1 },
  trilhaSub: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  trilhaBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 10,
  },
  trilhaProgresso: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  trilhaCta: { color: colors.teal, fontSize: 13, fontWeight: '800' },
  trilhaCtaTravada: { color: colors.textMuted },

  // ---- dentro da trilha ----
  voltar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  voltarTexto: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },

  progressoBloco: { gap: 4 },
  progressoTexto: { color: colors.text, fontSize: 15, fontWeight: '800' },

  feito: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(95,217,140,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(95,217,140,0.45)',
    padding: 12,
  },
  feitoTexto: { color: colors.green, fontSize: 14, fontWeight: '800', flex: 1 },
  erro: { color: colors.amber, fontSize: 13, lineHeight: 19 },

  hoje: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.purple,
    padding: 16,
    gap: 10,
  },
  kicker: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  diaLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700' },
  diaTitulo: { color: colors.text, fontSize: 19, fontWeight: '800' },
  leitura: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  blocoLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  pergunta: { color: colors.gold, fontSize: 15, lineHeight: 22, fontWeight: '700' },

  // ---- dobra ----
  dobra: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  dobraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  dobraTitulo: { color: colors.textSecondary, fontSize: 13, fontWeight: '800', flex: 1 },
  dobraCorpo: { paddingHorizontal: 14, paddingBottom: 12, gap: 8 },
  fonteLinha: { gap: 1 },
  fonteObra: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', lineHeight: 18 },
  fonteAutor: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },

  // ---- botões ----
  principal: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  principalOcupado: { opacity: 0.6 },
  principalTexto: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secundario: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secundarioTexto: { color: colors.teal, fontSize: 13, fontWeight: '800' },

  espera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.35)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
  },
  esperaTexto: { color: colors.gold, fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 19 },

  // ---- dias anteriores ----
  anterior: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  anteriorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  anteriorTextos: { flex: 1, gap: 1 },
  anteriorDia: { color: colors.textMuted, fontSize: 11, fontWeight: '800' },
  anteriorTitulo: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
  anteriorRever: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
  anteriorCorpo: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },

  // ---- dias à frente ----
  futuro: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 },
  futuroTexto: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },

  // ---- medalhas ----
  medalha: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    alignItems: 'flex-start',
  },
  medalhaNova: { borderColor: colors.gold, backgroundColor: 'rgba(255,200,92,0.08)' },
  medalhaIcone: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(181,123,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalhaTexto: { flex: 1, gap: 2 },
  medalhaKicker: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  medalhaNome: { color: colors.text, fontSize: 16, fontWeight: '800' },
  medalhaLegenda: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },

  alvo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,200,92,0.45)',
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  alvoTexto: { color: colors.gold, fontSize: 13, fontWeight: '800', flex: 1 },
  alvoFaltam: { color: colors.textMuted, fontSize: 11, fontWeight: '700' },
});
