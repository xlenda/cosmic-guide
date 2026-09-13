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
// A SEGUNDA PARCELA SAIU: título e os cinco campos dos 21 rituais, o aviso
// ético, os blocos de lastro e os recibos agora vêm do motor JÁ NO IDIOMA —
// esta tela só passa o `lang` do useLanguage() adiante (ritualPorId,
// rituaisPorCategoria, rituaisDeHoje, textoCompartilhavel, recibo,
// lastroMomentoIdeal). Ela continua sem escrever conteúdo nenhum: quem traduz
// é lib/traducoes/rituais.<lang>.js, cobrado por test/rituaisIdiomas.test.js.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
// AS PEÇAS DE DIAGRAMAÇÃO (design/PECAS-DE-DIAGRAMACAO.md, lote das práticas
// 12/09/2026). Esta tela tem DOIS arranjos, e os dois pediam coisas
// diferentes:
//   · A VITRINE (hoje → categorias → lista) são três assuntos que corriam no
//     mesmo chão — faixa curva em cada um, e o olho lê o corte sem título.
//   · O DETALHE é o passo a passo do concorrente: os cinco campos são a tela.
//     Aqui NÃO entra faixa (cinco faixas viram textura, e a ordem dos campos
//     não é negociável) — entra a escala de espaço e a coluna de leitura, que
//     é o que faltava: o parágrafo da INTENÇÃO ia de borda a borda.
import FaixaCurva, { corDoTom } from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import OneTimeLock from '../components/OneTimeLock';
import { useLanguage } from '../context/LanguageContext';
import { useCouple } from '../context/CoupleContext';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import {
  AVISO_ETICO,
  CATEGORIAS,
  lastroMomentoIdeal,
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
  // `lang` é o fio novo: ele desce pro motor em toda chamada que devolve
  // conteúdo, e o motor decide o pack. `t` continua cuidando do chrome.
  const { t, lang } = useLanguage();
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
  const hoje = useMemo(() => rituaisDeHoje(new Date(), lang, t), [tique, lang]);

  const categoria = categoriaId ? CATEGORIAS.find((c) => c.id === categoriaId) : null;
  // UMA chamada só (01/08/2026). Antes a tela pedia a lista DUAS vezes: uma sem
  // `lang` para contar e outra com `lang` para renderizar. A contagem batia por
  // sorte — localizarRitual devolve o ritual PT intacto quando não acha pack —
  // mas era o mesmo trabalho feito duas vezes a cada render, e a próxima pessoa
  // que mexesse no filtro corrigiria uma das duas e não a outra.
  const daCategoria = categoria ? rituaisPorCategoria(categoria.id, lang) : [];
  const ritual = ritualId ? ritualPorId(ritualId, lang) : null;
  const ritualLivre = ritualLivreId ? ritualPorId(ritualLivreId, lang) : null;

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
    const texto = textoCompartilhavel(r, t, lang);
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
              //    FAIXA 1: o gancho e o que casa com a data de verdade.
              // -------------------------------------------------------------
              <FaixaCurva
                tom="ameixa"
                semente="hoje"
                style={styles.faixa}
                estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}
                testID="rituais-hoje"
              >
                {/* A PRIMEIRA COISA QUE A PESSOA LÊ. Era o disclaimer; agora é
                    o gancho, no mesmo padrão de 'jornada.intro' e
                    'calendario.intro'. Prende primeiro, fonte depois. */}
                <ColunaLeitura>
                  <Text style={styles.intro}>{t('rituais.intro')}</Text>
                </ColunaLeitura>
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
              </FaixaCurva>
            ) : null}

            {/* ---------------------------------------------------------------
                2. AS 7 CATEGORIAS — ficam visíveis também dentro de uma
                categoria, pra trocar de objetivo sem voltar duas telas.

                FAIXA 2. `grude` só quando a faixa de hoje existe acima (dentro
                de uma categoria ela não é desenhada, e aí esta faixa é a
                primeira da tela — grudar numa faixa que não existe abriria o
                -1px contra o cabeçalho).
            --------------------------------------------------------------- */}
            <FaixaCurva
              tom="noite"
              semente="categorias"
              // O NOME DO TOM, não `true` (13/09/2026): booleano só encosta as
              // duas faixas — o trecho transparente acima da crista continua
              // mostrando o fundo PRETO da tela, e sai a mesma cunha escura
              // medida na tela de Assinatura. A faixa de cima é `ameixa`, então
              // é ela que tem que ser pintada atrás da onda. A condição não
              // muda: sem categoria, gruda na de hoje; dentro de uma, esta é a
              // primeira da tela e não gruda em nada.
              grude={!categoria && 'ameixa'}
              style={styles.faixa}
              // Dentro de uma categoria a faixa de hoje não é desenhada e ESTA
              // vira a primeira da tela — então é ela que tem que largar o
              // paddingTop, pela mesma medição. A condição é a mesma do
              // `grude`: uma decide a emenda, a outra decide o respiro.
              estiloCorpo={categoria ? [styles.faixaCorpo, styles.faixaCorpoPrimeira] : styles.faixaCorpo}
            >
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
                <ColunaLeitura>
                  <Text style={styles.body}>{descricaoDaCategoria(categoria, t)}</Text>
                </ColunaLeitura>
                <Text style={styles.subLabel}>
                  {t('rituais.category.count', { n: daCategoria.length })}
                </Text>
                {daCategoria.map((r) => (
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
            </FaixaCurva>

            {/* ---------------------------------------------------------------
                O LASTRO DO "MOMENTO IDEAL" — mostrado UMA VEZ, no fim da lista,
                nunca repetido ritual a ritual. Prende primeiro (o app inteiro
                já mostrou o que fazer hoje), fonte depois.

                FAIXA 3 — a última. É o recibo: outro assunto, outro chão.
            --------------------------------------------------------------- */}
            <FaixaCurva tom="violeta" semente="lastro" grude="noite" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
            <Text style={styles.groupLabel}>{t('rituais.lastro.title')}</Text>
            {Object.entries(lastroMomentoIdeal(lang)).map(([chave, bloco]) => (
              <Section key={chave} title={bloco.titulo}>
                <ColunaLeitura>
                  <Text style={styles.body}>{bloco.texto}</Text>
                </ColunaLeitura>
                {(bloco.ressalvas || []).map((r, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bulletMark}>!</Text>
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}
                {recibo(bloco.fontes, lang) ? (
                  <Text style={styles.source}>{recibo(bloco.fontes, lang)}</Text>
                ) : null}
              </Section>
            ))}
            </FaixaCurva>
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
  const { t, lang } = useLanguage();
  const categoria = CATEGORIAS.find((c) => c.id === ritual.categoria);
  const momento = resumoDoMomento(ritual, t);
  const fontes = recibo(ritual.fontes, lang);

  // O aviso ético é o FIM literal de `cuidados` (lib/rituais.js cola nos dois
  // lugares, em qualquer idioma). Aqui ele é separado só pra ganhar caixa
  // própria — a soma dos dois pedaços continua sendo a string inteira, sem uma
  // palavra a mais nem a menos. O separador é `ritual.aviso` porque num ritual
  // localizado o fim de `cuidados` é o aviso DO IDIOMA; AVISO_ETICO fica só de
  // rede de segurança.
  const cuidados = ritual.cuidados || '';
  const aviso = ritual.aviso || AVISO_ETICO;
  const pedacos = cuidados.split(aviso);
  const corpoCuidados = (pedacos.length > 1 ? pedacos[0] : cuidados).trim();

  return (
    /* O DETALHE não leva faixa (cinco faixas viram textura), então a pilha dos
       cinco campos carrega o próprio respiro — antes ela pegava carona no gap
       do contentContainer, que saiu pra as faixas poderem encostar. */
    <View style={styles.pilha} testID="rituais-detalhe">
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
        <ColunaLeitura>
          <Text style={styles.body}>{ritual.intencao}</Text>
        </ColunaLeitura>
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
        {/* Os passos numa lista própria, com `entre` entre um e outro: dentro
            do `campo` o gap é `dentro` (12), que serve pra rótulo e parágrafo
            mas cola uma AÇÃO na seguinte. É o "uma ideia por vez" do print,
            aplicado dentro do cartão. */}
        <View style={styles.passos}>
          {(ritual.passos || []).map((p, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.passoNumero}>{i + 1}</Text>
              <Text style={styles.bulletText}>{p}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 4 */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.momento')}</Text>
        {momento ? <Text style={styles.momentoResumo}>{momento}</Text> : null}
        <ColunaLeitura>
          <Text style={styles.body}>{ritual.momento ? ritual.momento.texto : ''}</Text>
        </ColunaLeitura>
      </View>

      {/* 5 — e o aviso, literal, dentro dele */}
      <View style={styles.campo}>
        <Text style={styles.campoLabel}>{t('rituais.field.cuidados')}</Text>
        {corpoCuidados ? (
          <ColunaLeitura>
            <Text style={styles.body}>{corpoCuidados}</Text>
          </ColunaLeitura>
        ) : null}
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
  // O CHAO DA TELA E O TOM DA ULTIMA FAIXA, nao o fundo cru (12/09/2026,
  // medido em foto). Com colors.background aqui, o espaco que o conteudo nao
  // preenche em tela curta vira #0B0712 — um buraco embaixo da ultima secao.
  // A faixa e translucida sobre este chao, entao o mesmo tom faz a secao
  // CONTINUAR ate o pe. Em tela cheia nada muda.
  root: { flex: 1, backgroundColor: corDoTom('violeta') },
  // `padding: 20` fica: é ele que a faixa anula com marginHorizontal:-20.
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
  // A pilha das dobras SEM faixa: o respiro que o container deixou de dar.
  pilha: { gap: space.entre },
  faixa: { marginHorizontal: -20 },
  faixaCorpo: { paddingHorizontal: 20, gap: space.dentro },
  // A PRIMEIRA FAIXA DA TELA NAO LEVA O paddingTop DA PECA. Medido na foto
  // (390x844, 12/09/2026): a caixa da onda ja tem ONDA_ALTURA (56px) e, logo
  // abaixo do cabecalho — que ja traz folga propria —, somar o space.secao (32)
  // padrao abria ~88px de chao liso antes da primeira palavra. Isso e o defeito
  // ALTO que o revisor achou na Home: a faixa lendo como bloco de cor vazio em
  // vez de secao. E o mesmo remedio que a Home usou (ver o prop estiloCorpo em
  // components/FaixaCurva.js); as faixas seguintes, que nao encostam no
  // cabecalho, seguem com o degrau cheio.
  faixaCorpoPrimeira: { paddingTop: 0 },

  // A linha de gancho que abre a tela — mesma altitude de 'jornada.intro' e
  // 'calendario.intro'. (Os estilos avisoFixo/avisoFixoTexto/avisoLabel saíram
  // junto com a barra pinned: estilo órfão é como um arquivo de tela chega a
  // quinze formatos de card diferentes.)
  intro: { ...type.corpoCurto, color: colors.textSecondary },
  avisoTexto: { ...type.apoio, color: colors.textSecondary },
  avisoCaixa: {
    backgroundColor: 'rgba(255,200,92,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,200,92,0.45)',
    padding: space.dentro,
    marginTop: space.junto,
  },

  groupLabel: {
    ...type.etiqueta,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: space.junto,
  },
  // "Combinam exatamente" / "Combinam em parte" — sub-rótulo dentro da seção.
  // Era negrito 800 num corpo de 12: agora é a etiqueta da escala, e o que
  // separa do bloco de cima é ESPAÇO, não peso.
  subLabel: {
    ...type.etiqueta,
    color: colors.purple,
    marginTop: space.bloco,
    marginBottom: space.grudado,
  },

  hojeLinha: { ...type.secao, color: colors.gold, marginTop: space.grudado },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.bloco,
    gap: space.junto,
    marginTop: space.dentro,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  cardTitle: { ...type.cartao, color: colors.text, flex: 1 },
  cardMomento: { ...type.apoio, color: colors.teal },
  cardMatch: { ...type.apoio, color: colors.textMuted },
  lockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.grudado,
    backgroundColor: 'rgba(255,200,92,0.15)',
    borderRadius: 8,
    paddingHorizontal: space.junto,
    paddingVertical: space.grudado,
  },
  lockPillText: { ...type.nota, color: colors.gold, fontWeight: '600' },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto, marginTop: space.grudado },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.bloco,
    paddingVertical: space.dentro,
  },
  chipAtivo: { borderColor: colors.purple, backgroundColor: 'rgba(181,123,255,0.12)' },
  chipText: { ...type.apoio, color: colors.textSecondary, fontWeight: '600' },
  chipTextAtivo: { color: colors.purple },

  // O TOPO DO DETALHE — o print do concorrente abre a tela de uma ideia só com
  // ar de sobra antes do primeiro campo. `entre` embaixo é esse ar; era 4.
  detalheTopo: { gap: space.junto, marginBottom: space.entre },
  detalheCategoria: { ...type.etiqueta, color: colors.textMuted, textTransform: 'uppercase' },
  detalheTitulo: { ...type.titulo, color: colors.text },

  campo: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.bloco,
    gap: space.dentro,
  },
  campoLabel: { ...type.etiqueta, color: colors.gold, textTransform: 'uppercase' },
  momentoResumo: { ...type.corpoCurto, color: colors.teal, fontWeight: '600' },

  body: { ...type.corpoCurto, color: colors.textSecondary },
  note: { ...type.apoio, color: colors.textSecondary },
  noteStrong: { ...type.apoio, color: colors.gold, fontWeight: '700' },
  source: { ...type.nota, color: colors.textMuted },
  paywallHint: { ...type.apoio, color: colors.textMuted, marginTop: space.junto },

  // O PASSO A PASSO. `entre` entre um passo e o seguinte: cada passo é uma
  // AÇÃO, e ação colada na próxima vira parágrafo picado. Era o gap 8 do campo
  // pra tudo — material e passo na mesma distância.
  passos: { gap: space.entre },
  bulletRow: { flexDirection: 'row', gap: space.dentro, alignItems: 'flex-start' },
  bulletMark: { ...type.corpoCurto, color: colors.purple, fontWeight: '700', width: 16 },
  // O número do passo ganha peso e largura fixa: é ele que faz a coluna dos
  // números alinhar, e é a única hierarquia de verdade dentro do campo.
  passoNumero: {
    ...type.corpoCurto,
    color: colors.purple,
    fontWeight: '700',
    width: 16,
  },
  bulletText: { ...type.corpoCurto, color: colors.textSecondary, flex: 1 },

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

  shareBtn: {
    flexDirection: 'row',
    gap: space.junto,
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: space.bloco,
    alignItems: 'center',
    justifyContent: 'center',
    // O compartilhar vem DEPOIS dos cinco campos: `entre` diz que acabou o
    // ritual e começou outra coisa.
    marginTop: space.entre,
  },
  shareBtnText: { ...type.botao, color: '#fff', fontWeight: '700' },
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
    marginTop: space.bloco,
  },
  secondaryBtnText: { ...type.botao, color: colors.textSecondary },
});
