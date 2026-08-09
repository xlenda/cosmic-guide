// screens/DreamScreen.js
//
// ===========================================================================
// AS CINCO ESPÉCIES DE ARTEMIDORO ENTRARAM AQUI — leia lib/artemidoro.js antes
// de escrever qualquer texto novo nesta tela.
// ===========================================================================
// O que esta tela fazia até 01/08/2026: interpretava TUDO, como se todo sonho
// significasse alguma coisa. Quem sonhou com o chefe depois de um dia infernal
// recebia uma leitura simbólica do chefe — quando o que explica melhor é o dia
// que a pessoa teve. Artemidoro de Daldis faz, no séc. II d.C., a pergunta que
// vem ANTES da interpretação: este sonho diz alguma coisa?
//
// A interpretação por IA NÃO foi removida — ela continua exatamente como
// estava. O bloco novo SOMA: fica em cima dela no resultado (a pergunta que
// vem antes vem antes na tela também) e embaixo do campo de digitar na
// entrada, para não empurrar o fluxo principal para fora da primeira dobra.
// UI.ponteIA diz, com todas as letras, que a leitura por IA é do app e a
// classificação é da fonte — as duas camadas nunca se misturam.
//
// ESTA PARTE É VITRINE: ela não redige conteúdo. Tudo o que se lê no bloco de
// Artemidoro sai de lib/artemidoro.js (classificarSonho, perguntas, especies)
// e do pack do idioma. Se faltar texto, o texto nasce em
// lib/traducoes/artemidoro.{pt,es,en}.js — nos três, com a mesma chave — nunca
// dentro deste componente. test/artemidoro.test.js varre a linha vermelha nos
// três idiomas na origem: nenhuma alegação de saúde, nenhuma promessa, nenhum
// veredito sobre a vida de quem leu, e — a regra desta feature —
// CLASSIFICAR NÃO É INTERPRETAR.
//
// NUNCA CHUTA. Sem resposta, classificarSonho devolve `disponivel: false`, diz
// qual pergunta falta e onde respondê-la; a tela só mostra isso. Pessoa
// desconhecida não vira allotrioi à força e relato fora das cinco não ganha
// uma sexta gaveta — os dois casos saem com o motivo escrito.
//
// i18n: NADA do bloco novo passa por t(), e lib/i18n.js segue intocado. O
// chrome sai de `packDeArtemidoro(lang).chrome` e o conteúdo do motor, ambos
// no idioma do useLanguage(). A tela só repassa o `lang`.
//
// STORAGE: o bloco novo não guarda nada — as respostas vivem no estado da
// tela e somem no "Novo sonho", como o próprio relato. Nenhum AsyncStorage
// aqui, nunca, regra da casa.
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Share,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients } from '../theme';
import { ROUTES } from '../routes';
import GradientHeader from '../components/GradientHeader';
// O CENÁRIO CÓSMICO (08/08/2026) — primeiro filho do root, atrás de tudo; o
// root mantém colors.background por baixo (ver o cabeçalho do componente).
import CosmicScene from '../components/CosmicScene';
import OneTimeLock from '../components/OneTimeLock';
import VoiceInsightRecorder from '../components/VoiceInsightRecorder';
import GroundingInvite from '../components/GroundingInvite';
import { getMockDreamReading } from '../lib/dreamReadings';
import { fetchAiDreamReading, isAiAccessError, isLoginRequired } from '../lib/aiClient';
import { hasUsedFeatureOnce, markFeatureUsedOnce } from '../lib/featureUsage';
import { recordReadingCompletion } from '../lib/readingCompletion';
import { useCouple } from '../context/CoupleContext';
import { useLanguage } from '../context/LanguageContext';
import {
  classificarSonho,
  especies as especiesDeArtemidoro,
  perguntas as perguntasDeArtemidoro,
} from '../lib/artemidoro';
import { PACK as ARTEMIDORO_PT } from '../lib/traducoes/artemidoro.pt.js';
import { PACK as ARTEMIDORO_ES } from '../lib/traducoes/artemidoro.es.js';
import { PACK as ARTEMIDORO_EN } from '../lib/traducoes/artemidoro.en.js';
// O MODO HISTÓRIA (08/08/2026) — a mesma leitura, um trecho por tela, como
// stories. paraSlides só REFORMATA: nenhum byte de reading.body muda.
import StoriesReader from '../components/StoriesReader';
import { paraSlides } from '../lib/storySlides';
// O BOTÃO "OUVIR" (08/08/2026) — reading.body em voz alta com a voz do
// aparelho (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
import BotaoOuvir from '../components/BotaoOuvir';

// O chrome do bloco de Artemidoro mora no pack de cada idioma (bloco `chrome`),
// que é onde nasce toda prosa desta feature. Este seletor é o MESMO
// packDoIdioma de lib/artemidoro.js e devia morar lá, como `chromeDaTela(lang)`
// — a tela não deveria ter fallback próprio. Não migrou junto porque
// lib/artemidoro.js está fora do alcance desta mudança; o snippet exato para
// mover está nas notas de integração, e quando ele entrar bastam duas linhas
// aqui (import de chromeDaTela e `const UI = chromeDaTela(lang)`).
const PACKS_ARTEMIDORO = { pt: ARTEMIDORO_PT, es: ARTEMIDORO_ES, en: ARTEMIDORO_EN };
function packDeArtemidoro(lang) {
  return PACKS_ARTEMIDORO[lang] || PACKS_ARTEMIDORO.pt;
}

// A pergunta condicional só aparece quando a fonte a pede: `soQuando` é dado do
// motor (1.2.45 define a segunda espécie como outra pessoa CONHECIDA, e é só
// nesse ramo que perguntar faz sentido). A tela lê a condição, não a inventa.
function perguntaCabe(p, respostas) {
  if (!p.soQuando) return true;
  return Object.entries(p.soQuando).every(([campo, valores]) => valores.includes(respostas[campo]));
}

// Cauda defensiva removida em 31/07/2026 (mesma decisão do dono explicada em
// CoffeeScreen). Aqui sobrou UMA linha, e ela não é ressalva de efeito: é a
// única do app que manda procurar gente de verdade. Sonho é a porta por onde
// entra quem está em sofrimento — a pessoa digita o pesadelo às três da manhã.
// A linha é curta, no fim, e não desmente a leitura; só diz onde fica a ajuda.
//
// QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026) — o texto era literal aqui, em
// português, e ABRIA por "a tradição milenar... o grego Artemidoro... Carl
// Jung". Como ele é o primeiro parágrafo da tela, o app se apresentava por
// currículo antes de dizer uma palavra sobre quem acordou com o sonho. O texto
// foi reescrito para abrir na cena real e fechar com a linhagem como recibo, e
// mudou de casa: mora em lib/i18n.js ('dream.disclaimer'), nas três línguas.
// A ordem dentro do parágrafo é a lei; a frase que manda procurar ajuda
// continua sendo a última, intacta.

// Estados possíveis da tela: intro (digitando o sonho) -> result (leitura exibida).
const STEP = { INTRO: 'intro', RESULT: 'result' };

export default function DreamScreen() {
  const navigation = useNavigation();
  // hasAccess já cobre casal E solo (CoupleContext.js checa os dois em
  // paralelo) — corrigido na origem, não precisa mais recombinar isCouple aqui.
  // coupleData volta só pelo upsell do fim da leitura (mesmo motivo comentado
  // em CoffeeScreen.js: a promessa "experiência completa do casal" não se
  // cumpre pra quem assina sozinho).
  const { hasAccess, accessConfirmed, coupleData } = useCouple();
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(STEP.INTRO);
  const [dreamText, setDreamText] = useState('');
  const [reading, setReading] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [locked, setLocked] = useState(false);
  // Bloqueio vindo do SERVIDOR (402 cota esgotada / 401 exige conta) — ver o
  // comentário longo em PalmScreen.js. Vale mesmo com hasAccess=true: quem
  // cobra é a conta, não o ponteiro guardado no aparelho.
  const [serverBlock, setServerBlock] = useState(null);
  const [journalEntryId, setJournalEntryId] = useState(null);
  // O MODO HISTÓRIA — só estado de tela; os slides saem de reading.body no
  // useMemo abaixo, sem tocar no texto.
  const [historiaAberta, setHistoriaAberta] = useState(false);
  const slidesDoSonho = useMemo(() => (reading ? paraSlides(reading.body) : []), [reading]);

  // ---------------------------------------------------------------------
  // O BLOCO DE ARTEMIDORO — estado só de tela, nada persistido
  // ---------------------------------------------------------------------
  const UI = packDeArtemidoro(lang).chrome;
  const [artAberto, setArtAberto] = useState(false);
  const [artRespostas, setArtRespostas] = useState({});
  const [artExplicacao, setArtExplicacao] = useState(false);
  const [artCincoAbertas, setArtCincoAbertas] = useState(false);
  const [artRessalvas, setArtRessalvas] = useState(false);
  const [artRecado, setArtRecado] = useState(null);

  // Resposta fora das opções o motor já trata como ausente; aqui só se repassa
  // o que a pessoa tocou. A classificação é recalculada a cada resposta e a
  // cada troca de idioma — nunca congelada.
  const artClassificacao = useMemo(() => classificarSonho(artRespostas, lang), [artRespostas, lang]);
  const artPerguntas = useMemo(() => perguntasDeArtemidoro(lang), [lang]);
  const artCinco = useMemo(() => especiesDeArtemidoro(lang), [lang]);

  useEffect(() => {
    if (hasAccess || !accessConfirmed) return;
    hasUsedFeatureOnce('dream').then(setLocked);
  }, [hasAccess, accessConfirmed]);

  const resetToIntro = () => {
    setStep(STEP.INTRO);
    setDreamText('');
    setReading(null);
    setJournalEntryId(null);
    setHistoriaAberta(false);
    // Sonho novo, relato novo: as respostas do sonho anterior não podem
    // classificar o próximo.
    setArtRespostas({});
    setArtRecado(null);
  };

  function responderArtemidoro(id, valor) {
    setArtRecado(null);
    setArtRespostas((prev) => {
      const proximo = { ...prev, [id]: valor };
      // Trocar quem apareceu invalida a resposta condicional: ela só existe no
      // ramo de "outra pessoa" (1.2.45).
      if (id === 'quemApareceu' && valor !== 'outra-pessoa') delete proximo.conheceQuemApareceu;
      return proximo;
    });
  }

  // Mesma cadeia de IdadeRealScreen.js e MitosScreen.js: Share do react-native
  // primeiro (folha do SO no nativo, navigator.share na web quando existe) e
  // clipboard como último recurso. O texto vem do pack — a tela não monta uma
  // palavra.
  async function compartilharArtemidoro() {
    const texto = packDeArtemidoro(lang).textoCompartilhavel(artClassificacao);
    if (!texto) return;
    setArtRecado(null);
    const temFolhaWeb =
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function';
    if (Platform.OS !== 'web' || temFolhaWeb) {
      try {
        await Share.share({ message: texto });
      } catch {
        // Cancelou ou a folha falhou: silêncio, como nas outras telas.
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
    setArtRecado(copiou ? UI.copiado : UI.naoCopiou);
  }

  function renderArtemidoro() {
    const r = artClassificacao;
    return (
      <View style={styles.artCard} testID="artemidoro-card">
        <TouchableOpacity
          style={styles.artTopo}
          activeOpacity={0.85}
          onPress={() => {
            setArtAberto((v) => !v);
            setArtRecado(null);
          }}
          accessibilityRole="button"
          accessibilityState={{ expanded: artAberto }}
          accessibilityLabel={UI.titulo}
          accessibilityHint={artAberto ? UI.fechar : UI.abrir}
          testID="artemidoro-abrir"
        >
          <View style={styles.artTopoTexto}>
            <Text style={styles.artKicker}>{UI.kicker}</Text>
            <Text style={styles.artTitulo}>{UI.titulo}</Text>
          </View>
          <Ionicons name={artAberto ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
        </TouchableOpacity>

        {/* A chamada abre na vida real — é ela que prende, antes de qualquer
            nome próprio. Fechada, mostra três linhas; aberta, inteira. */}
        <Text style={styles.artChamada} numberOfLines={artAberto ? undefined : 3}>
          {r.chamada}
        </Text>

        {!artAberto ? (
          <Text style={styles.artDica}>{UI.abrir}</Text>
        ) : (
          <View style={styles.artCorpo}>
            {/* ----------------------------------------------------------
                AS PERGUNTAS — três da fonte, uma nossa e declarada nossa
            ---------------------------------------------------------- */}
            <Text style={styles.artRotulo}>{UI.perguntasTitulo}</Text>
            {artPerguntas
              .filter((p) => perguntaCabe(p, artRespostas))
              .map((p) => (
                <View key={p.id} style={styles.artPergunta} testID={`artemidoro-pergunta-${p.id}`}>
                  <Text style={[styles.artTag, p.doApp && styles.artTagApp]}>
                    {p.doApp ? UI.rotuloDoApp : UI.rotuloDaFonte}
                  </Text>
                  <Text style={styles.artPerguntaTexto}>{p.pergunta}</Text>
                  <View style={styles.artChipRow}>
                    {p.opcoes.map((o) => {
                      const ativo = artRespostas[p.id] === o.id;
                      return (
                        <TouchableOpacity
                          key={o.id}
                          style={[styles.artChip, ativo && styles.artChipAtivo]}
                          activeOpacity={0.85}
                          onPress={() => responderArtemidoro(p.id, o.id)}
                          accessibilityRole="button"
                          accessibilityState={{ selected: ativo }}
                          accessibilityLabel={o.texto}
                          testID={`artemidoro-op-${p.id}-${o.id}`}
                        >
                          <Text style={[styles.artChipTexto, ativo && styles.artChipTextoAtivo]}>{o.texto}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.artNota}>{p.nota}</Text>
                </View>
              ))}

            {/* ----------------------------------------------------------
                O QUE SAIU — ou o que falta, com o motivo e onde responder
            ---------------------------------------------------------- */}
            {r.disponivel ? (
              <View style={styles.artResultado} testID="artemidoro-resultado">
                <View style={styles.artDivisor}>
                  <View style={styles.artDivisorLinha} />
                  <Text style={styles.artDivisorEstrela}>✦</Text>
                  <View style={styles.artDivisorLinha} />
                </View>

                <Text style={styles.artRotulo}>{UI.rotuloCamada}</Text>
                <Text style={styles.artValor} testID="artemidoro-camada">
                  {r.camadaNome} — {r.camadaTransliteracao} ({r.camadaGrego})
                </Text>
                <Text style={styles.artTexto}>{r.camadaTexto}</Text>
                <Text style={styles.artRecibo}>{r.camadaRecibo}</Text>

                <Text style={styles.artRotulo}>{r.especie ? UI.rotuloEspecie : UI.rotuloSemEspecie}</Text>
                {r.especie ? (
                  <Text style={styles.artValor} testID="artemidoro-especie">
                    {r.especieNome} — {r.especieTransliteracao} ({r.especieGrego})
                  </Text>
                ) : null}
                <Text style={styles.artTexto} testID="artemidoro-especie-texto">
                  {r.especie ? r.especieTexto : r.textoSemEspecie}
                </Text>
                {r.especieRecibo ? <Text style={styles.artRecibo}>{r.especieRecibo}</Text> : null}

                <Text style={styles.artRotulo}>{UI.rotuloPorque}</Text>
                <Text style={styles.artTexto}>{r.porque}</Text>

                {/* A discordância entre a pergunta da fonte e a nossa não se
                    esconde — e não troca a camada. */}
                {r.sinaisDiscordam ? (
                  <View style={styles.artDiscordancia} testID="artemidoro-discordancia">
                    <Text style={styles.artRotulo}>{UI.rotuloDiscordancia}</Text>
                    <Text style={styles.artTexto}>{r.notaDiscordancia}</Text>
                  </View>
                ) : null}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setArtExplicacao((v) => !v)}
                  accessibilityRole="button"
                  accessibilityState={{ expanded: artExplicacao }}
                  testID="artemidoro-explicacao"
                >
                  <Text style={styles.artLink}>{artExplicacao ? UI.explicacaoFechar : UI.explicacaoAbrir}</Text>
                </TouchableOpacity>
                {artExplicacao ? <Text style={styles.artTexto}>{r.explicacao}</Text> : null}

                <TouchableOpacity
                  style={styles.artShareBtn}
                  activeOpacity={0.85}
                  onPress={compartilharArtemidoro}
                  accessibilityRole="button"
                  accessibilityLabel={UI.compartilhar}
                  testID="artemidoro-share"
                >
                  <Ionicons name="share-social" size={16} color="#fff" />
                  <Text style={styles.artShareBtnTexto}>{UI.compartilhar}</Text>
                </TouchableOpacity>
                {artRecado ? <Text style={styles.artNota}>{artRecado}</Text> : null}
              </View>
            ) : (
              <View style={styles.artResultado} testID="artemidoro-falta">
                <Text style={styles.artTexto}>{r.explicacao}</Text>
                <Text style={styles.artNota}>{r.comoResolver}</Text>
              </View>
            )}

            {Object.keys(artRespostas).length > 0 ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setArtRespostas({});
                  setArtRecado(null);
                }}
                accessibilityRole="button"
                testID="artemidoro-limpar"
              >
                <Text style={styles.artLink}>{UI.limpar}</Text>
              </TouchableOpacity>
            ) : null}

            {/* ----------------------------------------------------------
                AS CINCO ESPÉCIES — a lista da fonte, sempre disponível,
                com resposta ou sem resposta nenhuma
            ---------------------------------------------------------- */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setArtCincoAbertas((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: artCincoAbertas }}
              testID="artemidoro-cinco"
            >
              <Text style={styles.artLink}>{artCincoAbertas ? UI.especiesFechar : UI.especiesAbrir}</Text>
            </TouchableOpacity>
            {artCincoAbertas ? (
              <View style={styles.artLista}>
                <Text style={styles.artRotulo}>{UI.especiesTitulo}</Text>
                {artCinco.map((e) => (
                  <View key={e.id} style={styles.artEspecie} testID={`artemidoro-especie-${e.id}`}>
                    <Text style={styles.artValor}>
                      {e.nome} — {e.transliteracao} ({e.grego})
                    </Text>
                    <Text style={styles.artTexto}>{e.oQueE}</Text>
                    <Text style={styles.artRotulo}>{UI.exemploRotulo}</Text>
                    <Text style={styles.artTexto}>{e.exemplo}</Text>
                    <Text style={styles.artRecibo}>{e.recibo}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* ----------------------------------------------------------
                AS RESSALVAS, O CHECKLIST DE 1.9, AS CITAÇÕES E A FONTE
            ---------------------------------------------------------- */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setArtRessalvas((v) => !v)}
              accessibilityRole="button"
              accessibilityState={{ expanded: artRessalvas }}
              testID="artemidoro-ressalvas"
            >
              <Text style={styles.artLink}>{artRessalvas ? UI.ressalvasFechar : UI.ressalvasAbrir}</Text>
            </TouchableOpacity>
            {artRessalvas ? (
              <View style={styles.artLista}>
                <Text style={styles.artTexto}>{r.notaSubespecie}</Text>
                <Text style={styles.artTexto}>{r.notaNaoEDicionario}</Text>
                <Text style={styles.artTexto}>{r.notaLeituraDoApp}</Text>

                <Text style={styles.artRotulo}>{UI.checklistTitulo}</Text>
                <Text style={styles.artTexto}>{r.checklist.intro}</Text>
                {r.checklist.itens.map((i) => (
                  <Text
                    key={i.id}
                    style={[styles.artItem, i.foraDoApp && styles.artItemForaDoApp]}
                    testID={`artemidoro-checklist-${i.id}`}
                  >
                    · {i.texto}
                  </Text>
                ))}
                <Text style={styles.artRecibo}>{r.checklist.recibo}</Text>

                <Text style={styles.artRotulo}>{UI.verbatimTitulo}</Text>
                {r.verbatins.map((v) => (
                  <View key={v.locus} style={styles.artVerbatim}>
                    <Text style={styles.artCitacao}>“{v.texto}”</Text>
                    <Text style={styles.artRotulo}>{UI.verbatimParafrase}</Text>
                    <Text style={styles.artTexto}>{v.parafrase}</Text>
                    {v.elisao ? <Text style={styles.artRotulo}>{UI.verbatimElisao}</Text> : null}
                    {v.elisao ? <Text style={styles.artTexto}>{v.elisao}</Text> : null}
                    <Text style={styles.artRecibo}>{v.locus}</Text>
                  </View>
                ))}

                <Text style={styles.artRotulo}>{UI.fontesTitulo}</Text>
                {r.fonte.map((f) => (
                  <Text key={f} style={styles.artRecibo}>
                    · {f}
                  </Text>
                ))}
              </View>
            ) : null}

            {/* A linha que separa as duas camadas: o que é da fonte e o que é
                do app. Fecha o bloco, e é curta de propósito. */}
            <Text style={styles.artPonte}>{UI.ponteIA}</Text>
            <Text style={styles.artMarca}>{UI.marca}</Text>
          </View>
        )}
      </View>
    );
  }

  const handleInterpret = async () => {
    if (!dreamText.trim()) return;
    setIsAnalyzing(true);

    // Tenta a IA real (proxy no backend); se falhar por qualquer motivo
    // (sem rede, servidor sem chave configurada, etc.), cai pra leitura
    // mockada honesta — nunca mostra erro pra pessoa, sempre entrega uma leitura.
    let result;
    try {
      result = await fetchAiDreamReading(dreamText.trim());
    } catch (err) {
      // PAYWALL DE VERDADE (30/07/2026): 402/401 com `code` conhecido é a cota
      // grátis da CONTA acabando, não falha técnica. O mock honesto continua
      // valendo pra tudo o mais (rede, 500, servidor sem chave).
      if (isAiAccessError(err)) {
        setIsAnalyzing(false);
        setServerBlock(isLoginRequired(err) ? 'login' : 'quota');
        setStep(STEP.INTRO);
        return;
      }
      result = getMockDreamReading(dreamText.trim());
    }

    setReading(result);
    markFeatureUsedOnce('dream');
    // Sem isso, `locked` só seria relido do AsyncStorage no próximo mount da
    // tela — tocar "Novo sonho" na mesma sessão deixaria repetir o uso grátis
    // várias vezes antes do bloqueio realmente pegar (achado por verificação
    // adversarial).
    if (!hasAccess) setLocked(true);

    const { entryId } = await recordReadingCompletion({
      type: 'dream',
      typeLabel: 'Interpretação de Sonho',
      title: result.title,
      body: result.body,
    });
    setJournalEntryId(entryId);

    setIsAnalyzing(false);
    setStep(STEP.RESULT);
  };

  // `step !== STEP.RESULT` importa aqui: marcamos `locked=true` no instante em
  // que a leitura grátis é consumida (handleInterpret), mas a pessoa ainda
  // precisa VER o resultado que acabou de ganhar — só bloqueamos de fato na
  // próxima tentativa (tocar "Novo sonho", que chama resetToIntro() e volta
  // pro STEP.INTRO).
  if (serverBlock) {
    return <OneTimeLock featureTitle="Sonhos" gradient={gradients.teal} variant={serverBlock} />;
  }

  if (!hasAccess && locked && step !== STEP.RESULT) {
    return <OneTimeLock featureTitle="Sonhos" gradient={gradients.teal} />;
  }

  return (
    <View style={styles.root}>
      <CosmicScene />
      <GradientHeader title="Sonhos" subtitle="Interpretação simbólica" gradient={gradients.teal} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.disclaimer}>{t('dream.disclaimer')}</Text>

          {step === STEP.INTRO && (
            <View style={styles.section}>
              <Text style={styles.instructions}>
                Descreva o sonho que você teve com o máximo de detalhes que lembrar — lugares, pessoas,
                sensações, o que aconteceu.
              </Text>

              <TextInput
                style={styles.input}
                value={dreamText}
                onChangeText={setDreamText}
                placeholder="Ex.: Sonhei que estava andando numa praia à noite e a maré subia rápido..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                editable={!isAnalyzing}
                maxLength={2000}
              />

              {isAnalyzing ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.accent} />
                  <Text style={styles.loadingText}>{t('dream.interpreting')}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryBtn, !dreamText.trim() && styles.primaryBtnDisabled]}
                  activeOpacity={0.85}
                  onPress={handleInterpret}
                  disabled={!dreamText.trim()}
                >
                  <Ionicons name="moon" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>{t('dream.interpret')}</Text>
                </TouchableOpacity>
              )}

              {/* Na entrada o bloco fica DEPOIS do campo: quem chegou para
                  contar o sonho conta primeiro. No resultado ele vem antes da
                  leitura, porque a pergunta que vem antes vem antes. */}
              {renderArtemidoro()}
            </View>
          )}

          {step === STEP.RESULT && reading && (
            <View style={styles.section}>
              {renderArtemidoro()}

              {/* O MODO HISTÓRIA — acima do texto da leitura, no ponto em que
                  o texto liberado já está inteiro na tela (nenhum gate muda:
                  este bloco só renderiza com a leitura entregue). */}
              <TouchableOpacity
                style={styles.historiaBtn}
                activeOpacity={0.85}
                onPress={() => setHistoriaAberta(true)}
                accessibilityRole="button"
                accessibilityLabel={t('stories.ver')}
              >
                <Ionicons name="sparkles" size={16} color={colors.teal} />
                <Text style={styles.historiaBtnText}>{t('stories.ver')}</Text>
              </TouchableOpacity>

              {/* O BOTÃO "OUVIR" — a leitura do sonho em voz alta (o mesmo
                  reading.body do card logo abaixo e do modo história), com a
                  voz do aparelho. */}
              <BotaoOuvir texto={reading.body} style={styles.ouvirBtn} />

              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>{reading.title}</Text>
                <Text style={styles.resultBody}>{reading.body}</Text>
                {reading.isGeneric && (
                                  /* Fallback que nao se declara e quebra de confianca: o
                                     testador mandou um sonho de evacuacao de predio e recebeu
                                     'Aguas que revelam emocoes' SEM saber que a IA nao tinha
                                     respondido (29/07/2026). A leitura enlatada continua — e
                                     melhor que erro cru — mas agora se apresenta como o que e. */
                                  <Text style={styles.genericNote}>{t('reading.genericNote')}</Text>
                                )}
              </View>

              {journalEntryId && (
                <VoiceInsightRecorder
                  entryId={journalEntryId}
                  readingType="dream"
                  readingTitle={reading.title}
                />
              )}

              {/* Fecha a leitura: convite pra ficar alguns minutos com o que
                  acabou de ler (screens/GroundingScreen.js). Card, nunca modal,
                  e sem recompensa nenhuma — o porquê está em
                  components/GroundingInvite.js. */}
              <GroundingInvite />

              {!hasAccess && (
                <View style={styles.upsellCard}>
                  <Text style={styles.upsellText}>
                    {coupleData
                      ? 'Gostou dessa leitura? Assine e desbloqueie a experiência completa do casal — 7 dias grátis'
                      : t('upsell.solo.text')}
                  </Text>
                  <TouchableOpacity
                    style={styles.upsellBtn}
                    activeOpacity={0.85}
                    onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.PLANOS })}
                  >
                    <Text style={styles.upsellBtnText}>{t('dream.subscribe')}</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.disclaimer}>{t('dream.disclaimer')}</Text>

              <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.85} onPress={resetToIntro}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>{t('dream.new')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <StoriesReader
        visible={historiaAberta}
        slides={slidesDoSonho}
        titulo={reading ? reading.title : ''}
        onClose={() => setHistoriaAberta(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 20, paddingBottom: 40, gap: 16 },
  disclaimer: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
  section: { gap: 14, alignItems: 'stretch' },
  instructions: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  input: {
    minHeight: 140,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
  },
  primaryBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  loadingRow: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  loadingText: { color: colors.textSecondary, fontSize: 14 },
  resultCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  resultTitle: { color: colors.text, fontSize: 18, fontWeight: '800' },
  resultBody: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  genericNote: { color: colors.gold, fontSize: 12, lineHeight: 17, marginTop: 10, fontStyle: 'italic' },
  // O botão do modo história — contorno no teal da tela, sem fundo: porta
  // pra mesma leitura, não call-to-action.
  historiaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.teal + '66',
    paddingVertical: 12, paddingHorizontal: 18,
  },
  historiaBtnText: { color: colors.teal, fontSize: 13, fontWeight: '700' },
  // O Ouvir centrado entre o modo história e o card da leitura (a section já
  // dá o respiro com o gap: 14).
  ouvirBtn: { alignSelf: 'center' },
  upsellCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
    alignItems: 'center',
  },
  upsellText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  upsellBtn: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 20 },
  upsellBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ---- O bloco de Artemidoro (mesma gramática visual de IdadeRealScreen) ----
  artCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  artTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  artTopoTexto: { flex: 1, gap: 3 },
  artKicker: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  artTitulo: { color: colors.text, fontSize: 17, lineHeight: 23, fontWeight: '800' },
  artChamada: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  artDica: { color: colors.teal, fontSize: 12, fontWeight: '700' },

  artCorpo: { gap: 10, marginTop: 2 },

  artRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 4 },
  artValor: { color: colors.text, fontSize: 15, lineHeight: 22, fontWeight: '700' },
  artTexto: { color: colors.textSecondary, fontSize: 15, lineHeight: 24 },
  artNota: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  artRecibo: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  artLink: { color: colors.teal, fontSize: 13, fontWeight: '700', marginTop: 4 },

  artPergunta: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 8,
  },
  artTag: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  artTagApp: { color: colors.pink },
  artPerguntaTexto: { color: colors.text, fontSize: 15, lineHeight: 22 },
  artChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  artChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  artChipAtivo: { borderColor: colors.teal, backgroundColor: colors.surfaceElevated },
  artChipTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  artChipTextoAtivo: { color: colors.text },

  artResultado: { gap: 6 },
  artDivisor: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  artDivisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  artDivisorEstrela: { color: colors.teal, fontSize: 12 },
  artDiscordancia: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 4,
    marginTop: 6,
  },

  artLista: { gap: 8 },
  artEspecie: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 4,
  },
  artItem: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  // O sexto item de 1.9 é citado e NÃO usado — a tipografia diz isso antes da
  // leitura, e o próprio texto do item repete o motivo.
  artItemForaDoApp: { color: colors.textMuted, fontStyle: 'italic' },
  artVerbatim: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  artCitacao: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  artShareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  artShareBtnTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },

  artPonte: { color: colors.textMuted, fontSize: 12, lineHeight: 18, marginTop: 6 },
  artMarca: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },
});
