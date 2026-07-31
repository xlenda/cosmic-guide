// screens/RituaisScreen.js
// RITUAIS — a biblioteca de 21 rituais em 7 objetivos, com o que casa com HOJE
// no topo.
//
// ===========================================================================
// LEIA lib/rituais.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// ===========================================================================
// Esta tela é uma VITRINE: ela não escreve conteúdo de ritual, ela mostra o que
// o motor exporta. Toda regra do cabeçalho de lib/rituais.js vale aqui e é
// varrida por test/rituais.test.js na origem — nenhuma alegação de saúde (nem
// implícita), nenhuma promessa de resultado, nenhum mecanismo pseudocientífico.
// O texto de CHROME escrito aqui (rótulos, botões, vazios) segue a mesma régua:
// ele descreve o que a pessoa vai FAZER e o que o app tem pra mostrar, nunca o
// que o universo devolve.
//
// E segue a regra de escrita do app: PRENDE PRIMEIRO, FONTE DEPOIS. O topo é a
// vida real de hoje ("terça, dia de Marte") e a lista do que dá pra fazer; o
// recibo (obra, autor, século) vem depois, dentro do ritual e no bloco de
// lastro do fim.
//
// ---------------------------------------------------------------------------
// O AVISO ÉTICO — uma cópia só, e ela NÃO abre a tela
// ---------------------------------------------------------------------------
// ISTO MUDOU EM 31/07/2026, e as duas mudanças andam juntas.
//
// ANTES: o aviso vivia numa barra PINNED fora do ScrollView, colada embaixo do
// cabeçalho, visível em todos os estados. Dois problemas concretos:
//
//   1. A TELA ABRIA EM RESSALVA. Das três telas novas, Rituais era a única sem
//      intro — Jornada tem 'jornada.intro' e Calendário tem 'calendario.intro'.
//      O primeiro texto corrido depois do cabeçalho era "Antes de qualquer
//      ritual" seguido do disclaimer. Isso é o oposto da regra do app (prende
//      primeiro, fonte depois): o gancho bom já existia e estava logo abaixo,
//      empurrado pra segundo lugar — a linha da fase da Lua com o dia da semana
//      e o que casa com hoje.
//   2. AVISO EM DOSE DUPLA. Na visão de detalhe a MESMA sentença aparecia duas
//      vezes ao mesmo tempo: na barra pinned (que nunca some) e dentro da caixa
//      de CUIDADOS E ÉTICA. O split de dois pedaços descrito abaixo resolvia a
//      adjacência DENTRO do campo, mas não impedia a segunda cópia vinda de
//      cima.
//
// AGORA: a tela abre na vida real de hoje — 'rituais.intro' e, logo em seguida,
// a fase + o dia da semana com os rituais que casam. O aviso continua garantido
// onde ele de fato importa e onde o teste o exige: dentro do campo CUIDADOS E
// ÉTICA de cada ritual (é ele que fecha `cuidados`, byte a byte) e no texto de
// compartilhar. Uma cópia por vez, nunca duas.
//
// A constante vem de lib/rituais.js e NÃO passa por t(): o cabeçalho de lá diz
// "não reescreva, não melhore, não traduza sem o dono", e o teste confere a
// igualdade byte a byte. Traduzir aqui quebraria as duas coisas.
//
// No campo CUIDADOS E ÉTICA o texto é partido em dois pedaços — o corpo dos
// cuidados e o aviso — pra ele ganhar caixa própria sem aparecer duas vezes
// seguidas. A soma dos dois pedaços é exatamente a string original: nada é
// reescrito, nada é cortado.
//
// ---------------------------------------------------------------------------
// O PAYWALL — a decisão, e por que ela não é o padrão cru
// ---------------------------------------------------------------------------
// O padrão do app é 1 uso grátis vitalício por feature (lib/featureUsage.js +
// OneTimeLock) e assinatura sem limite. Aqui ele entra assim:
//
//   GRÁTIS PARA SEMPRE: "Rituais de hoje" (o casamento de fase da Lua com dia
//   da semana), as 7 categorias, a lista de cada categoria com título e momento
//   ideal, e o botão de compartilhar. É o motivo de voltar amanhã e é a
//   prateleira que vende — trancar isso mataria a feature no segundo dia.
//
//   COM A ASSINATURA: abrir o DETALHE de um ritual (os cinco campos). É o
//   entregável, e é onde o muro chega no ponto de maior vontade: "hoje casam
//   três, você já tem um".
//
// UM DESVIO DELIBERADO DO PADRÃO, e ele é o único: além da marca padrão de uso
// gasto, a tela guarda QUAL ritual consumiu o uso grátis — e aquele ritual
// continua abrindo pra sempre. Motivo concreto: ritual não se lê, se FAZ, e
// vários deles duram dias ("guarde o papel até a próxima Lua minguante").
// Perder o acesso à instrução no dia seguinte quebraria justamente o ritual que
// a pessoa começou. A marca padrão (markFeatureUsedOnce) continua sendo escrita
// do mesmo jeito — o que muda é só que o app lembra qual foi.
//
// Compartilhar nunca é trancado: textoCompartilhavel() manda título, momento
// ideal, o aviso ético e o link — não vaza nenhum dos cinco campos. É
// distribuição, não conteúdo.
//
// ---------------------------------------------------------------------------
// i18n — o que é traduzido e o que não é
// ---------------------------------------------------------------------------
// O chrome desta tela tem chave nos três idiomas (bloco RITUAIS_I18N no fim de
// lib/i18n.js). A TAXONOMIA (nome/descrição das 7 categorias, nome do dia,
// planeta do dia, nome da fase) também já tem — ela foi a primeira parcela da
// migração de lib/rituais.js, e veio primeiro porque essas strings entram
// INTERPOLADAS dentro de frase traduzida: 'rituais.today.dayOnly' em inglês é
// "{dia}, day of {planeta}" e saía "segunda-feira, day of Lua". Por isso esta
// tela nunca lê `.nome` cru — sempre pelos helpers nomeDaCategoria/nomeDoDia/
// nomeDaFase/nomeDoPlaneta, com o `t` do contexto.
//
// O que AINDA está em português nos três idiomas: título e os cinco campos dos
// 21 rituais, e os três blocos de lastro. É o gap declarado no topo de
// lib/rituais.js, com o resto do caminho escrito lá. Não é esquecimento, e a
// tela não reescreve nada pra disfarçar.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import OneTimeLock from '../components/OneTimeLock';
import { useLanguage } from '../context/LanguageContext';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import {
  AVISO_ETICO,
  CATEGORIAS,
  LASTRO_MOMENTO_IDEAL,
  descricaoDaCategoria,
  lerRitualLivre,
  marcarRitualLivre,
  nomeDaCategoria,
  nomeDaFase,
  nomeDoDia,
  nomeDoPlaneta,
  recibo,
  resumoDoMomento,
  rituaisDeHoje,
  rituaisPorCategoria,
  ritualPorId,
  textoCompartilhavel,
} from '../lib/rituais';

const FEATURE_KEY = 'rituais';
// QUAL ritual gastou o uso grátis mora em lib/rituais.js (lerRitualLivre/
// marcarRitualLivre), não aqui. Era a única regra de negócio que decide se o
// paywall desta tela abre, e ela ficava numa tela que o node:test não consegue
// importar — ou seja, fora de qualquer teste. A marca PADRÃO de uso gasto
// continua sendo a de lib/featureUsage.js, ao lado, nunca no lugar dela.

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
        accessibilityLabel={`${title} — ${open ? t('rituais.collapse') : t('rituais.expand')}`}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </TouchableOpacity>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

// Um item de lista. O motivo do encaixe (`motivo`, montado por lib/rituais.js)
// só aparece quando existe — na lista por categoria não existe, e inventar um
// "combina com você" aqui seria promessa.
function CardRitual({ ritual, onPress, bloqueado }) {
  const { t } = useLanguage();
  const momento = resumoDoMomento(ritual, t);
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={ritual.titulo}
      testID={`rituais-card-${ritual.id}`}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle}>{ritual.titulo}</Text>
        {bloqueado ? (
          <View style={styles.lockPill}>
            <Ionicons name="lock-closed" size={11} color={colors.gold} />
            <Text style={styles.lockPillText}>{t('rituais.lock.badge')}</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        )}
      </View>
      {momento ? (
        <Text style={styles.cardMomento}>{t('rituais.card.momento', { momento })}</Text>
      ) : null}
      {ritual.motivo ? (
        <Text style={styles.cardMatch}>{t('rituais.match', { motivo: ritual.motivo })}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

export default function RituaisScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — mesma leitura das outras nove telas com uso grátis.
  const { hasAccess, accessConfirmed } = useCouple();

  const [categoriaId, setCategoriaId] = useState(null);
  const [ritualId, setRitualId] = useState(null);
  const [recado, setRecado] = useState(null);

  // Estado do uso grátis. `pronto` existe pra nunca decidir bloqueio com o
  // AsyncStorage ainda no ar: enquanto não voltou, a tela libera (mesma
  // filosofia de lib/featureUsage.js — falha de storage nunca prende ninguém).
  const [usoGasto, setUsoGasto] = useState(false);
  const [ritualLivreId, setRitualLivreId] = useState(null);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const gasto = await hasUsedFeatureOnce(FEATURE_KEY);
      // lerRitualLivre() nunca lança e já devolve null pra id que não existe
      // mais no catálogo — o try/catch que morava aqui virou responsabilidade
      // do motor, onde dá pra testar.
      const livre = await lerRitualLivre();
      if (!vivo) return;
      setUsoGasto(gasto);
      setRitualLivreId(livre);
      setPronto(true);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  // "Hoje" recalculado a cada foco: a tela fica montada dentro da stack da aba
  // e alguém que deixou o app aberto de um dia pro outro veria a fase e o dia
  // de ontem rotulados como hoje (mesma lição de LunarCalendarScreen.js).
  const [tique, setTique] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTique((n) => n + 1);
    }, [])
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hoje = useMemo(() => rituaisDeHoje(new Date()), [tique]);

  const categoria = categoriaId ? CATEGORIAS.find((c) => c.id === categoriaId) : null;
  const ritual = ritualId ? ritualPorId(ritualId) : null;
  const ritualLivre = ritualLivreId ? ritualPorId(ritualLivreId) : null;

  // Trancado = já gastou o uso grátis E não é o ritual que ficou sendo dele.
  const bloqueado = useCallback(
    (id) => !hasAccess && pronto && usoGasto && ritualLivreId !== id,
    [hasAccess, pronto, usoGasto, ritualLivreId]
  );

  function abrirRitual(id) {
    // Consome o uso grátis na abertura do PRIMEIRO detalhe — e guarda qual foi,
    // pra esse continuar abrindo pra sempre. Assinante nunca passa por aqui.
    if (!hasAccess && accessConfirmed && pronto && !usoGasto) {
      setUsoGasto(true);
      setRitualLivreId(id);
      markFeatureUsedOnce(FEATURE_KEY);
      // marcarRitualLivre trata a falha por dentro (lib/storage.js cai pra
      // memória de sessão em vez de perder a marca): mesmo com o disco fora do
      // ar, a pessoa não reabre a tela com outro ritual grátis dentro da mesma
      // sessão.
      marcarRitualLivre(id);
    }
    setRecado(null);
    setRitualId(id);
  }

  function voltar() {
    if (ritualId) {
      setRecado(null);
      setRitualId(null);
      return;
    }
    if (categoriaId) {
      setCategoriaId(null);
      return;
    }
    navigation.goBack();
  }

  // COMPARTILHAR — pedido explícito do dono, e o texto é o de lib/rituais.js,
  // não um inventado aqui (ele já vem com o aviso ético e o link, e sem
  // promessa nenhuma).
  //
  // A cadeia: Share do react-native primeiro. No nativo é a folha do SO, onde o
  // WhatsApp é a primeira opção de quem tem WhatsApp; na web, react-native-web
  // delega pra navigator.share quando ele existe e REJEITA quando não existe.
  // Por isso a presença de navigator.share é checada ANTES em vez de depois: se
  // caísse no catch pra tentar navigator.share de novo, cancelar a folha abriria
  // a folha uma segunda vez. Sem folha nenhuma (desktop antigo), copia pro
  // clipboard do navegador — API do próprio navegador, sem dependência nova
  // (expo-clipboard não está no package.json, e no nativo esse caminho não roda).
  async function compartilhar(r) {
    // `t` vai junto: este é o único artefato desta tela que sai do app e
    // circula em público, e sem ele um usuário EN/ES publicava um texto em
    // português com o nome da marca colado.
    const texto = textoCompartilhavel(r, t);
    if (!texto) return;
    setRecado(null);
    const temFolhaWeb =
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function';
    if (Platform.OS !== 'web' || temFolhaWeb) {
      try {
        await Share.share({ message: texto });
      } catch {
        // Cancelou ou a folha falhou: silêncio, mesmo comportamento das outras
        // telas que compartilham (RetrospectivaScreen.js, HomeScreen.js).
      }
      return;
    }
    let copiou = false;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(texto);
        copiou = true;
      }
    } catch {}
    setRecado(copiou ? t('rituais.share.copied') : t('rituais.share.failed'));
  }

  if (ritual && bloqueado(ritual.id)) {
    return <OneTimeLock featureTitle={t('rituais.title')} gradient={gradients.purple} />;
  }

  const subtitulo = ritual
    ? ritual.titulo
    : categoria
    ? nomeDaCategoria(categoria, t)
    : t('rituais.subtitle');

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('rituais.title')}
        subtitle={subtitulo}
        onBack={voltar}
        gradient={gradients.purple}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {ritual ? (
          // -----------------------------------------------------------------
          // DETALHE — os cinco campos, nesta ordem, sempre
          // -----------------------------------------------------------------
          <DetalheRitual
            ritual={ritual}
            recado={recado}
            onShare={() => compartilhar(ritual)}
            onVoltar={() => {
              setRecado(null);
              setRitualId(null);
            }}
          />
        ) : (
          <>
            {!categoria ? (
              // -------------------------------------------------------------
              // 1. RITUAIS DE HOJE — o motivo de voltar amanhã
              // -------------------------------------------------------------
              <View testID="rituais-hoje">
                {/* A PRIMEIRA COISA QUE A PESSOA LÊ. Era o disclaimer; agora é
                    o gancho, no mesmo padrão de 'jornada.intro' e
                    'calendario.intro'. Prende primeiro, fonte depois. */}
                <Text style={styles.intro}>{t('rituais.intro')}</Text>
                <Text style={styles.groupLabel}>{t('rituais.today.title')}</Text>
                {/* fase, dia e planeta saem pelos helpers de lib/rituais.js: os
                    três entram DENTRO de uma frase traduzida, e ler `.nome` cru
                    aqui é o que produzia "segunda-feira, day of Lua". */}
                <Text style={styles.hojeLinha}>
                  {hoje.ceuDisponivel
                    ? t('rituais.today.sky', {
                        emoji: hoje.emojiLua || '',
                        fase: nomeDaFase(hoje.faseLua, t),
                        dia: nomeDoDia(hoje.diaSemana, t),
                        planeta: nomeDoPlaneta(hoje.diaSemana, t),
                      })
                    : t('rituais.today.dayOnly', {
                        dia: nomeDoDia(hoje.diaSemana, t),
                        planeta: nomeDoPlaneta(hoje.diaSemana, t),
                      })}
                </Text>
                {/* NUNCA FABRICA: sem efeméride, lib/rituais.js devolve
                    ceuDisponivel=false e some com quem depende da fase. A tela
                    diz por quê em vez de mostrar sugestão inventada. */}
                {!hoje.ceuDisponivel ? (
                  <Text style={styles.noteStrong}>{t('rituais.today.skyOff')}</Text>
                ) : null}

                {hoje.rituais.length > 0 ? (
                  <>
                    <Text style={styles.subLabel}>{t('rituais.today.exactTitle')}</Text>
                    {hoje.rituais.map((r) => (
                      <CardRitual
                        key={r.id}
                        ritual={r}
                        bloqueado={bloqueado(r.id)}
                        onPress={() => abrirRitual(r.id)}
                      />
                    ))}
                  </>
                ) : (
                  <Text style={styles.note}>{t('rituais.today.empty')}</Text>
                )}

                {hoje.parciais.length > 0 ? (
                  <>
                    <Text style={styles.subLabel}>{t('rituais.today.partialTitle')}</Text>
                    <Text style={styles.note}>{t('rituais.today.partialHint')}</Text>
                    {hoje.parciais.map((r) => (
                      <CardRitual
                        key={r.id}
                        ritual={r}
                        bloqueado={bloqueado(r.id)}
                        onPress={() => abrirRitual(r.id)}
                      />
                    ))}
                  </>
                ) : null}
              </View>
            ) : null}

            {/* ---------------------------------------------------------------
                2. AS 7 CATEGORIAS — ficam visíveis também dentro de uma
                categoria, pra trocar de objetivo sem voltar duas telas.
            --------------------------------------------------------------- */}
            <Text style={styles.groupLabel}>{t('rituais.categories.title')}</Text>
            <View style={styles.chips} testID="rituais-categorias">
              {CATEGORIAS.map((c) => {
                const ativa = c.id === categoriaId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, ativa && styles.chipAtivo]}
                    activeOpacity={0.85}
                    onPress={() => setCategoriaId(ativa ? null : c.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: ativa }}
                    testID={`rituais-cat-${c.id}`}
                  >
                    <Text style={[styles.chipText, ativa && styles.chipTextAtivo]}>
                      {nomeDaCategoria(c, t)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {!categoria ? <Text style={styles.note}>{t('rituais.categories.hint')}</Text> : null}

            {/* ---------------------------------------------------------------
                3. A LISTA DA CATEGORIA ESCOLHIDA
            --------------------------------------------------------------- */}
            {categoria ? (
              <View testID="rituais-lista">
                <Text style={styles.body}>{descricaoDaCategoria(categoria, t)}</Text>
                <Text style={styles.subLabel}>
                  {t('rituais.category.count', { n: rituaisPorCategoria(categoria.id).length })}
                </Text>
                {rituaisPorCategoria(categoria.id).map((r) => (
                  <CardRitual
                    key={r.id}
                    ritual={r}
                    bloqueado={bloqueado(r.id)}
                    onPress={() => abrirRitual(r.id)}
                  />
                ))}
              </View>
            ) : null}

            {/* Onde o uso grátis está, dito na cara. Antes de gastar é uma
                oferta; depois de gasto é um lembrete de que aquele ritual
                continua sendo dele — nunca uma promessa do que a assinatura
                faz acontecer na vida da pessoa. */}
            {!hasAccess && pronto ? (
              <Text style={styles.paywallHint} testID="rituais-paywall-hint">
                {usoGasto && ritualLivre
                  ? t('rituais.paywall.used', { titulo: ritualLivre.titulo })
                  : t('rituais.paywall.firstFree')}
              </Text>
            ) : null}

            {/* ---------------------------------------------------------------
                O LASTRO DO "MOMENTO IDEAL" — mostrado UMA VEZ, no fim da lista,
                nunca repetido ritual a ritual. Prende primeiro (o app inteiro
                já mostrou o que fazer hoje), fonte depois.
            --------------------------------------------------------------- */}
            <Text style={styles.groupLabel}>{t('rituais.lastro.title')}</Text>
            {Object.entries(LASTRO_MOMENTO_IDEAL).map(([chave, bloco]) => (
              <Section key={chave} title={bloco.titulo}>
                <Text style={styles.body}>{bloco.texto}</Text>
                {(bloco.ressalvas || []).map((r, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>!</Text>
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}
                {recibo(bloco.fontes) ? (
                  <Text style={styles.source}>{recibo(bloco.fontes)}</Text>
                ) : null}
              </Section>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// O DETALHE
// ---------------------------------------------------------------------------
// A ordem dos cinco campos é a aprovada pelo dono e não é negociável:
// INTENÇÃO · MATERIAIS · PASSO A PASSO · MOMENTO IDEAL · CUIDADOS E ÉTICA.
// Nenhum deles é colapsável — ritual escondido atrás de um chevron é ritual que
// não se faz.
function DetalheRitual({ ritual, recado, onShare, onVoltar }) {
  const { t } = useLanguage();
  const categoria = CATEGORIAS.find((c) => c.id === ritual.categoria);
  const momento = resumoDoMomento(ritual, t);
  const fontes = recibo(ritual.fontes);

  // O aviso ético é o FIM literal de `cuidados` (lib/rituais.js cola nos dois
  // lugares). Aqui ele é separado só pra ganhar caixa própria — a soma dos dois
  // pedaços continua sendo a string inteira, sem uma palavra a mais nem a menos.
  const cuidados = ritual.cuidados || '';
  const pedacos = cuidados.split(AVISO_ETICO);
  const corpoCuidados = (pedacos.length > 1 ? pedacos[0] : cuidados).trim();

  return (
    <View testID="rituais-detalhe">
      <View style={styles.detalheTopo}>
        <Text style={styles.detalheCategoria}>
          {categoria ? nomeDaCategoria(categoria, t) : ritual.categoria}
        </Text>
        <Text style={styles.detalheTitulo}>{ritual.titulo}</Text>
        {momento ? <Text style={styles.cardMomento}>{momento}</Text> : null}
      </View>

      {/* 1 */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.intencao')}</Text>
        <Text style={styles.body}>{ritual.intencao}</Text>
      </View>

      {/* 2 */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.materiais')}</Text>
        {(ritual.materiais || []).map((m, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletMark}>·</Text>
            <Text style={styles.bulletText}>{m}</Text>
          </View>
        ))}
      </View>

      {/* 3 */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.passos')}</Text>
        {(ritual.passos || []).map((p, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.passoNumero}>{i + 1}</Text>
            <Text style={styles.bulletText}>{p}</Text>
          </View>
        ))}
      </View>

      {/* 4 */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.momento')}</Text>
        {momento ? <Text style={styles.momentoResumo}>{momento}</Text> : null}
        <Text style={styles.body}>{ritual.momento ? ritual.momento.texto : ''}</Text>
      </View>

      {/* 5 — e o aviso, literal, dentro dele */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.cuidados')}</Text>
        {corpoCuidados ? <Text style={styles.body}>{corpoCuidados}</Text> : null}
        <View style={styles.avisoCaixa}>
          <Text style={styles.avisoTexto}>{ritual.aviso || AVISO_ETICO}</Text>
        </View>
      </View>

      {/* COMPARTILHAR — pedido explícito do dono. Fica depois dos cinco campos:
          primeiro a pessoa tem o ritual inteiro, só então manda pra alguém. */}
      <TouchableOpacity
        style={styles.shareBtn}
        activeOpacity={0.85}
        onPress={onShare}
        accessibilityRole="button"
        testID="rituais-share"
      >
        <Ionicons name="logo-whatsapp" size={18} color="#fff" />
        <Text style={styles.shareBtnText}>{t('rituais.share.cta')}</Text>
      </TouchableOpacity>
      {recado ? <Text style={styles.note}>{recado}</Text> : null}

      {/* O RECIBO, depois do ritual — a ordem do app: prende primeiro. */}
      {fontes ? (
        <Section title={t('rituais.detail.sources')}>
          <Text style={styles.source}>{fontes}</Text>
        </Section>
      ) : null}

      {/* E o que a fonte antiga NÃO sustenta, dito na cara em vez de escondido —
          proposição 3 da tese (docs/tradicao/00-tese.md). */}
      {(ritual.naoTemFonte || []).length > 0 ? (
        <Section title={t('rituais.detail.noSource')}>
          <Text style={styles.note}>{t('rituais.detail.noSourceHint')}</Text>
          {ritual.naoTemFonte.map((linha, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletMark}>?</Text>
              <Text style={styles.bulletText}>{linha}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      <TouchableOpacity
        style={styles.secondaryBtn}
        activeOpacity={0.85}
        onPress={onVoltar}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
        <Text style={styles.secondaryBtnText}>{t('rituais.detail.back')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  // A linha de gancho que abre a tela — mesma altitude de 'jornada.intro' e
  // 'calendario.intro'. (Os estilos avisoFixo/avisoFixoTexto/avisoLabel saíram
  // junto com a barra pinned: estilo órfão é como um arquivo de tela chega a
  // quinze formatos de card diferentes.)
  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginBottom: 2 },
  avisoTexto: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  avisoCaixa: {
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.45)',
    padding: 12,
    marginTop: 4,
  },

  groupLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 6,
  },
  subLabel: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },

  hojeLinha: { color: colors.gold, fontSize: 16, fontWeight: '800', marginTop: 2 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 5,
    marginTop: 8,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: colors.text, fontSize: 16, fontWeight: '800', flex: 1 },
  cardMomento: { color: colors.teal, fontSize: 12, lineHeight: 18 },
  cardMatch: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,200,92,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  lockPillText: { color: colors.gold, fontSize: 10, fontWeight: '800' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  chipAtivo: { borderColor: colors.purple, backgroundColor: 'rgba(181,123,255,0.12)' },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  chipTextAtivo: { color: colors.purple },

  detalheTopo: { gap: 4, marginBottom: 4 },
  detalheCategoria: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detalheTitulo: { color: colors.text, fontSize: 22, fontWeight: '800' },

  campo: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 8,
  },
  campoLabel: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  momentoResumo: { color: colors.teal, fontSize: 14, fontWeight: '700' },

  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  note: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  noteStrong: { color: colors.gold, fontSize: 12, lineHeight: 18, fontWeight: '700' },
  source: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  paywallHint: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },

  bulletRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  bulletMark: { color: colors.purple, fontSize: 13, fontWeight: '800', width: 14, lineHeight: 21 },
  passoNumero: {
    color: colors.purple,
    fontSize: 13,
    fontWeight: '800',
    width: 14,
    lineHeight: 21,
  },
  bulletText: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, flex: 1 },

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
    padding: 16,
    gap: 10,
  },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  sectionBody: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },

  shareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  shareBtnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  secondaryBtnText: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },
});
