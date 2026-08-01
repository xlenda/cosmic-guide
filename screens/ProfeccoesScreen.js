// screens/ProfeccoesScreen.js
// PROFECÇÕES ANUAIS E MENSAIS — a casa do ano, o senhor do ano e o trecho de
// 28 dias em que a pessoa está agora, com o verbatim de Ptolomeu e o recibo.
//
// ===========================================================================
// LEIA lib/profeccoes.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// ===========================================================================
// Esta tela é uma VITRINE: ela não redige conteúdo, ela mostra o que o motor
// exporta. Toda regra do cabeçalho de lib/profeccoes.js vale aqui e é varrida
// por test/profeccoes.test.js na origem — nenhuma alegação de saúde, nenhuma
// promessa de resultado, nenhum veredito sobre a vida de quem lê, e nenhuma
// afirmação histórica sem obra, autor e século.
//
// POR QUE ESTA TELA EXISTE E POR QUE ELA ABRE ASSIM. A profecção é a técnica
// preditiva mais bem documentada da tradição helenística — Ptolomeu,
// Tetrabiblos IV.10 — e a conta inteira dela cabe numa linha:
// `casa = (idade % 12) + 1`. Isso a torna a coisa mais rara que um app de
// astrologia pode oferecer: uma previsão que a pessoa consegue CONFERIR na
// mão, com o capítulo aberto do lado. Por isso a ordem da tela é a da tese —
// PRENDE PRIMEIRO, FONTE DEPOIS: no topo vem o assunto do ano em português de
// conversa (o que o motor devolve em `texto`), e o recibo (obra, livro.capítulo,
// tradutor e edição) vem embaixo, num bloco cinza, junto do verbatim em inglês
// que não se traduz.
//
// NUNCA FABRICAR NASCIMENTO. A data vem de getAnyBirthData() (lib/birthData.js),
// exatamente a mesma fonte que o Céu de Hoje da Home usa — nascimento do casal,
// depois o solo do Mapa Astral, depois o espelho em AsyncStorage que existe
// porque o SecureStore é um stub vazio na web. Quando não há data salva, a tela
// NÃO inventa mapa: ela mostra o texto de indisponível que o próprio motor
// devolve (`profeccaoAnual(null, …).texto`) e um botão que leva ao Mapa Astral.
// O mesmo caminho cobre data inválida, "hoje" anterior ao nascimento e a
// efeméride que não carregou — o motor declara o motivo, a tela só desenha.
//
// SEM HORA/CIDADE A FEATURE EXISTE. É decisão nº 2 do motor, com fonte
// primária: Ptolomeu manda profeccionar a partir de cada um dos lugares
// prorrogativos e nomeia cinco; o do Sol cobre "dignities and glory". Então
// quem só tem a data vê a leitura inteira, rotulada com a origem
// (`origemRotulo`) e com `melhoraCom` dizendo o que falta — nunca beco sem
// saída, e o botão que resolve fica colado no aviso.
//
// A VIRADA DO ANO É RECALCULADA A CADA FOCO. O ano profectado não vira à
// meia-noite do aniversário: vira no retorno do Sol ao grau natal, e esse
// instante desliza quase seis horas por ano. Congelar `new Date()` no mount
// deixaria quem passa a virada com o app aberto vendo o senhor do ano de
// ontem — mesma lição de IdadeRealScreen.js e LunarCalendarScreen.js.
//
// i18n: NADA DAQUI PASSA POR t(), e continua não passando — lib/i18n.js segue
// intocado. O conteúdo sai de profeccaoAnual/profeccaoMensal(…, lang) e o
// chrome do bloco `tela` dos packs. Esta tela só repassa o `lang` do
// useLanguage(): não escolhe idioma, não redige uma linha, e a tabela
// PACKS/pacoteDoIdioma abaixo é a MESMA de lib/profeccoes.js (packDoIdioma),
// copiada porque o motor ainda não exporta um `chromeDaTela(lang)`. No dia em
// que ele exportar, estas cinco linhas somem e o import vira um só.
//
// COMPARTILHAR: a mesma cadeia de IdadeRealScreen.js e MitosScreen.js — Share
// do react-native primeiro (no nativo é a folha do SO; na web,
// react-native-web delega para navigator.share quando existe) e clipboard como
// último recurso no desktop sem folha. As linhas compartilhadas são as do
// motor (título, texto e fonte), nunca um texto montado aqui.
//
// STORAGE: só através de lib/birthData.js. A tela não importa AsyncStorage —
// nunca, regra da casa.
import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Platform,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import { getAnyBirthData } from '../lib/birthData';
import { profeccaoAnual, profeccaoMensal } from '../lib/profeccoes';
import PACK_PT from '../lib/traducoes/profeccoes.pt';
import PACK_ES from '../lib/traducoes/profeccoes.es';
import PACK_EN from '../lib/traducoes/profeccoes.en';

// A mesma tabela de lib/profeccoes.js: idioma desconhecido cai no PT, nunca
// numa tradução inventada na hora. Ver o cabeçalho, bloco i18n.
const PACKS = { pt: PACK_PT, es: PACK_ES, en: PACK_EN };
function pacoteDoIdioma(lang) {
  return PACKS[lang] || PACKS.pt;
}

// Os dois motivos de indisponível que a pessoa consegue resolver sozinha — e
// só nesses dois o botão do Mapa Astral aparece. "semEfemeride" é do aparelho
// e "antesDoNascimento" é da data escolhida: mandar para o Mapa ali seria
// prometer uma solução que não está lá.
const MOTIVOS_COM_SAIDA = ['semData', 'dataInvalida'];

// Instante ISO → data legível no idioma da pessoa. Não é conteúdo: é formato,
// e a etiqueta de idioma sai do pack (`tela.locale`). Sem `Intl` no aparelho,
// cai no ISO cortado — que é feio, mas é o instante certo; inventar formato
// seria pior que mostrar o número cru.
function instanteLegivel(iso, locale) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
  }
}

// Bloco fechado/aberto. Doze blocos abertos viram um paredão que ninguém lê;
// fechados, a tela cabe num print e cada recibo fica a um toque.
function Bloco({ id, titulo, aberto, onToggle, abrirRotulo, fecharRotulo, children }) {
  const estaAberto = aberto === id;
  return (
    <View style={styles.bloco} testID={`profeccoes-bloco-${id}`}>
      <TouchableOpacity
        style={styles.blocoTopo}
        activeOpacity={0.85}
        onPress={() => onToggle(id)}
        accessibilityRole="button"
        accessibilityState={{ expanded: estaAberto }}
        accessibilityLabel={titulo}
        accessibilityHint={estaAberto ? fecharRotulo : abrirRotulo}
        testID={`profeccoes-abrir-${id}`}
      >
        <Text style={styles.blocoTitulo}>{titulo}</Text>
        <Ionicons
          name={estaAberto ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textMuted}
        />
      </TouchableOpacity>
      {estaAberto ? <View style={styles.blocoCorpo}>{children}</View> : null}
    </View>
  );
}

export default function ProfeccoesScreen() {
  const navigation = useNavigation();
  const { lang } = useLanguage();

  const P = pacoteDoIdioma(lang);
  const UI = P.tela;

  // `undefined` = ainda lendo o disco · `null` = não há nascimento salvo em
  // fonte nenhuma · objeto = { date, time, city }. Recarrega no foco porque a
  // pessoa pode ter acabado de preencher a hora no Mapa Astral e voltado.
  const [nascimento, setNascimento] = useState(undefined);
  const [tique, setTique] = useState(0);
  useFocusEffect(
    useCallback(() => {
      let vivo = true;
      setTique((n) => n + 1);
      getAnyBirthData().then((b) => {
        if (vivo) setNascimento(b || null);
      });
      return () => {
        vivo = false;
      };
    }, [])
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const agora = useMemo(() => new Date(), [tique]);

  const carregando = nascimento === undefined;
  const anual = useMemo(
    () => (carregando ? null : profeccaoAnual(nascimento, agora, lang)),
    [carregando, nascimento, agora, lang]
  );
  const mensal = useMemo(
    () => (carregando ? null : profeccaoMensal(nascimento, agora, lang)),
    [carregando, nascimento, agora, lang]
  );

  const [aberto, setAberto] = useState(null);
  const [recado, setRecado] = useState(null);

  function alternar(id) {
    setRecado(null);
    setAberto((atual) => (atual === id ? null : id));
  }

  function irParaMapa() {
    navigation.navigate(ROUTES.BIRTH_CHART);
  }

  // As linhas são as do motor; a única coisa que a tela acrescenta é a marca,
  // que também vem do pack. Nada de prosa montada aqui.
  async function compartilhar(partes) {
    const texto = partes.filter(Boolean).join('\n\n');
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
        // Cancelou ou a folha falhou: silêncio, igual às outras telas.
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
    setRecado(copiou ? UI.copiado : UI.naoCopiou);
  }

  const disponivel = !!anual && anual.disponivel === true;
  const rotulos = disponivel ? anual.rotulos : P.rotulos;

  return (
    <View style={styles.root}>
      <GradientHeader
        title={UI.titulo}
        subtitle={UI.subtitulo}
        onBack={() => navigation.goBack()}
        gradient={gradients.purple}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>{UI.intro}</Text>
        <Text style={styles.intro}>{UI.introDois}</Text>

        {/* ------------------------------------------------------------------
            CARREGANDO — o disco ainda está sendo lido
        ------------------------------------------------------------------ */}
        {carregando ? (
          <View style={styles.carregando} testID="profeccoes-carregando">
            <ActivityIndicator color={colors.purple} />
            <Text style={styles.carregandoTexto}>{UI.carregando}</Text>
          </View>
        ) : null}

        {/* ------------------------------------------------------------------
            SEM CÉU — o motor declarou indisponível e disse o motivo. A tela
            não inventa nascimento nem data: mostra o texto dele e, quando há
            saída, o botão que resolve.
        ------------------------------------------------------------------ */}
        {!carregando && !disponivel ? (
          <View style={styles.aviso} testID={`profeccoes-indisponivel-${anual.motivo}`}>
            <Ionicons name="calendar-outline" size={22} color={colors.gold} />
            <Text style={styles.avisoTitulo}>{UI.indisponivelTitulo}</Text>
            <Text style={styles.avisoTexto}>{anual.texto}</Text>
            {MOTIVOS_COM_SAIDA.includes(anual.motivo) ? (
              <TouchableOpacity
                style={styles.botao}
                activeOpacity={0.85}
                onPress={irParaMapa}
                accessibilityRole="button"
                accessibilityLabel={UI.botaoMapa}
                testID="profeccoes-ir-mapa"
              >
                <Ionicons name="compass" size={16} color="#fff" />
                <Text style={styles.botaoTexto}>{UI.botaoMapa}</Text>
              </TouchableOpacity>
            ) : null}
            <Text style={styles.reciboTexto}>{anual.fonte}</Text>
          </View>
        ) : null}

        {/* ------------------------------------------------------------------
            O ANO — casa do ano, signo do ano e Senhor do Ano
        ------------------------------------------------------------------ */}
        {disponivel ? (
          <View style={styles.cardDestaque} testID="profeccoes-ano">
            <Text style={styles.olho}>{rotulos.titulo}</Text>
            <Text style={styles.tituloGrande} testID="profeccoes-ano-titulo">
              {anual.titulo}
            </Text>

            <View style={styles.paresRow}>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.casaDoAno}</Text>
                <Text style={styles.parValor} testID="profeccoes-casa-ano">
                  {anual.casaProfectada}
                </Text>
              </View>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.signoDoAno}</Text>
                <Text style={styles.parValor}>{anual.signoDoAno}</Text>
              </View>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.senhorDoAno}</Text>
                <Text style={[styles.parValor, styles.parDestaque]} testID="profeccoes-senhor-ano">
                  {anual.senhorDoAno}
                </Text>
              </View>
            </View>

            {/* Prende primeiro: a vida real abre, o recibo desce. */}
            <Text style={styles.texto} testID="profeccoes-texto-ano">
              {anual.texto}
            </Text>

            <View style={styles.par}>
              <Text style={styles.parRotulo}>{rotulos.nomeAntigo}</Text>
              <Text style={styles.parValor}>{anual.nomeAntigoDaCasa}</Text>
            </View>

            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Ionicons name="locate" size={12} color={colors.textSecondary} />
                <Text style={styles.chipTexto} testID="profeccoes-origem">
                  {anual.origemRotulo}
                </Text>
              </View>
            </View>

            <View style={styles.paresRow}>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.viradaDoAno}</Text>
                <Text style={styles.parValor} testID="profeccoes-virada">
                  {instanteLegivel(anual.viradaDoAno, UI.locale)}
                </Text>
              </View>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.proximaVirada}</Text>
                <Text style={styles.parValor}>
                  {instanteLegivel(anual.proximaVirada, UI.locale)}
                </Text>
              </View>
            </View>

            <View style={styles.recibo}>
              <Text style={styles.reciboRotulo}>{rotulos.fontes}</Text>
              <Text style={styles.reciboTexto} testID="profeccoes-fonte-ano">
                {anual.fonte}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.85}
              onPress={() => compartilhar([anual.titulo, anual.texto, anual.fonte, UI.marca])}
              accessibilityRole="button"
              accessibilityLabel={UI.compartilhar}
              testID="profeccoes-share-ano"
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ------------------------------------------------------------------
            O MÊS — 28 dias por signo, contados do retorno solar
        ------------------------------------------------------------------ */}
        {disponivel && mensal && mensal.disponivel ? (
          <View style={styles.card} testID="profeccoes-mes">
            <Text style={styles.olho}>{rotulos.tituloMensal}</Text>
            <Text style={styles.tituloMedio} testID="profeccoes-mes-titulo">
              {mensal.titulo}
            </Text>

            <View style={styles.paresRow}>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.casaDoMes}</Text>
                <Text style={styles.parValor}>{mensal.casaDoMes}</Text>
              </View>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.signoDoMes}</Text>
                <Text style={styles.parValor}>{mensal.signoDoMes}</Text>
              </View>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.senhorDoMes}</Text>
                <Text style={[styles.parValor, styles.parDestaque]} testID="profeccoes-senhor-mes">
                  {mensal.senhorDoMes}
                </Text>
              </View>
            </View>

            <Text style={styles.texto} testID="profeccoes-texto-mes">
              {mensal.texto}
            </Text>

            <View style={styles.par}>
              <Text style={styles.parRotulo}>{rotulos.nomeAntigo}</Text>
              <Text style={styles.parValor}>{mensal.nomeAntigoDaCasaDoMes}</Text>
            </View>

            <View style={styles.paresRow}>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.inicioDoMes}</Text>
                <Text style={styles.parValor}>{instanteLegivel(mensal.inicio, UI.locale)}</Text>
              </View>
              <View style={styles.par}>
                <Text style={styles.parRotulo}>{rotulos.fimDoMes}</Text>
                <Text style={styles.parValor}>{instanteLegivel(mensal.fim, UI.locale)}</Text>
              </View>
            </View>

            <View style={styles.recibo}>
              <Text style={styles.reciboRotulo}>{rotulos.fontes}</Text>
              <Text style={styles.reciboTexto} testID="profeccoes-fonte-mes">
                {mensal.fonte}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.85}
              onPress={() => compartilhar([mensal.titulo, mensal.texto, mensal.fonte, UI.marca])}
              accessibilityRole="button"
              accessibilityLabel={UI.compartilhar}
              testID="profeccoes-share-mes"
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {recado ? <Text style={styles.nota}>{recado}</Text> : null}

        {/* ------------------------------------------------------------------
            AS CAMADAS DE TRÁS — a conta, a fonte, o verbatim e o que a
            pesquisa não achou. Tudo do motor (ou do pack, quando o motor não
            devolve por estar indisponível), nada redigido aqui.
        ------------------------------------------------------------------ */}
        {!carregando ? (
          <>
            <Bloco
              id="comoFunciona"
              titulo={rotulos.comoFunciona}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              <Text style={styles.texto}>{disponivel ? anual.comoFunciona : P.comoFunciona}</Text>
            </Bloco>

            <Bloco
              id="deOndeVem"
              titulo={rotulos.deOndeVem}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              <Text style={styles.texto}>{disponivel ? anual.deOndeVem : P.deOndeVem}</Text>
              {/* O verbatim de Robbins não se traduz — é o recibo que aguenta
                  ser conferido, e ele viaja igual nos três packs. */}
              <View style={styles.recibo}>
                <Text style={styles.reciboRotulo}>{rotulos.verbatim}</Text>
                <Text style={styles.verbatim} testID="profeccoes-verbatim-anual">
                  “{P.verbatim.anual.texto}”
                </Text>
                <Text style={styles.reciboTexto}>{P.verbatim.anual.obra}</Text>
              </View>
            </Bloco>

            <Bloco
              id="pontoDePartida"
              titulo={UI.rotuloPontoDePartida}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              {disponivel ? (
                <>
                  <Text style={styles.texto}>{anual.origemTexto}</Text>
                  {anual.origemGlosa ? (
                    <Text style={styles.glosa}>{anual.origemGlosa}</Text>
                  ) : null}
                  <View style={styles.recibo}>
                    <Text style={styles.reciboRotulo}>{rotulos.verbatim}</Text>
                    <Text style={styles.verbatim} testID="profeccoes-verbatim-prorrogativos">
                      “{P.verbatim.prorrogativos.texto}”
                    </Text>
                    <Text style={styles.reciboTexto}>{P.verbatim.prorrogativos.obra}</Text>
                  </View>
                  {/* Nunca beco sem saída: o que falta vem com o botão que
                      resolve, colado. */}
                  {anual.melhoraCom ? (
                    <View style={styles.melhora} testID="profeccoes-melhora">
                      <Text style={styles.parRotulo}>{rotulos.oQueMelhora}</Text>
                      <Text style={styles.texto}>{anual.melhoraCom.texto}</Text>
                      <TouchableOpacity
                        style={styles.botao}
                        activeOpacity={0.85}
                        onPress={irParaMapa}
                        accessibilityRole="button"
                        accessibilityLabel={UI.botaoMapa}
                        testID="profeccoes-melhora-mapa"
                      >
                        <Ionicons name="compass" size={16} color="#fff" />
                        <Text style={styles.botaoTexto}>{UI.botaoMapa}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </>
              ) : (
                <Text style={styles.texto}>{P.origem.sol.texto}</Text>
              )}
            </Bloco>

            <Bloco
              id="quandoVira"
              titulo={UI.rotuloQuandoVira}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              <Text style={styles.texto}>
                {disponivel ? anual.quandoViraOAno : P.quandoViraOAno}
              </Text>
              {disponivel ? (
                <View style={styles.par}>
                  <Text style={styles.parRotulo}>{rotulos.precisao}</Text>
                  <Text style={styles.texto} testID="profeccoes-precisao">
                    {anual.precisaoTexto}
                  </Text>
                </View>
              ) : null}
            </Bloco>

            <Bloco
              id="camadaMensal"
              titulo={UI.rotuloCamadaMensal}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              <Text style={styles.texto}>
                {mensal && mensal.disponivel ? mensal.camadaMensal : P.camadaMensal}
              </Text>
              <View style={styles.recibo}>
                <Text style={styles.reciboRotulo}>{rotulos.verbatim}</Text>
                <Text style={styles.verbatim} testID="profeccoes-verbatim-mensal">
                  “{P.verbatim.mensal.texto}”
                </Text>
                <Text style={styles.reciboTexto}>{P.verbatim.mensal.obra}</Text>
              </View>
            </Bloco>

            {/* A camada moderna vem separada e datada — proposição 3 da tese.
                Só existe quando há leitura: ela fala DA casa e DO senhor que
                saíram na conta. */}
            {disponivel ? (
              <Bloco
                id="moderno"
                titulo={rotulos.oQueOModernoDiz}
                aberto={aberto}
                onToggle={alternar}
                abrirRotulo={UI.abrir}
                fecharRotulo={UI.fechar}
              >
                <Text style={styles.texto} testID="profeccoes-moderno-casa">
                  {anual.detalhe.casaModerno}
                </Text>
                <Text style={styles.texto}>{anual.detalhe.senhorModerno}</Text>
              </Bloco>
            ) : null}

            {disponivel ? (
              <Bloco
                id="tradicao"
                titulo={UI.rotuloTradicao}
                aberto={aberto}
                onToggle={alternar}
                abrirRotulo={UI.abrir}
                fecharRotulo={UI.fechar}
              >
                <Text style={styles.texto} testID="profeccoes-tradicao-casa">
                  {anual.detalhe.casaTradicao}
                </Text>
                <Text style={styles.reciboTexto}>{anual.detalhe.casaFonte}</Text>
                <Text style={styles.texto}>{anual.detalhe.senhorTradicao}</Text>
                <Text style={styles.reciboTexto}>{anual.detalhe.senhorFonte}</Text>
              </Bloco>
            ) : null}

            <Bloco
              id="casasInteiras"
              titulo={UI.rotuloCasasInteiras}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              <Text style={styles.texto}>
                {disponivel ? anual.sistemaDeCasas : P.sistemaDeCasas}
              </Text>
            </Bloco>

            <Bloco
              id="aPalavra"
              titulo={UI.rotuloAPalavra}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              <Text style={styles.texto}>{disponivel ? anual.aPalavra : P.aPalavra}</Text>
            </Bloco>

            {/* Lei 2: o que a pesquisa NÃO achou fica declarado, e na tela. */}
            <Bloco
              id="naoAchado"
              titulo={rotulos.naoAchado}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              {(disponivel ? anual.naoAchado : P.naoAchado).map((linha, i) => (
                <Text key={`naoachado-${i}`} style={styles.texto} testID={`profeccoes-naoachado-${i}`}>
                  {linha}
                </Text>
              ))}
            </Bloco>

            <Bloco
              id="fontes"
              titulo={rotulos.fontes}
              aberto={aberto}
              onToggle={alternar}
              abrirRotulo={UI.abrir}
              fecharRotulo={UI.fechar}
            >
              {(disponivel ? anual.fontes : P.fontes).map((f, i) => (
                <View key={`fonte-${i}`} style={styles.fonteItem} testID={`profeccoes-fonte-${i}`}>
                  <Text style={styles.fonteObra}>{f.obra}</Text>
                  <Text style={styles.reciboTexto}>
                    {f.autor} · {f.seculo} · {f.grau}
                  </Text>
                  <Text style={styles.reciboTexto}>{f.nota}</Text>
                </View>
              ))}
            </Bloco>
          </>
        ) : null}

        <Text style={styles.marca}>{UI.marca}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 10 },

  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  carregando: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  carregandoTexto: { color: colors.textMuted, fontSize: 13 },

  aviso: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    marginTop: 6,
  },
  avisoTitulo: { color: colors.text, fontSize: 16, fontWeight: '800' },
  avisoTexto: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  cardDestaque: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.purple,
    padding: 16,
    gap: 12,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
  },

  olho: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  tituloGrande: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  tituloMedio: { color: colors.text, fontSize: 17, fontWeight: '800', lineHeight: 23 },

  paresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  par: { flexGrow: 1, flexBasis: 120, gap: 3 },
  parRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  parValor: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  parDestaque: { color: colors.gold, fontWeight: '800' },

  texto: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  glosa: { color: colors.textMuted, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 4,
  },
  reciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  reciboTexto: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  verbatim: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },

  melhora: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 12,
    gap: 8,
  },

  bloco: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  blocoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  blocoTitulo: { flex: 1, color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 20 },
  blocoCorpo: { gap: 10, marginTop: 10 },

  fonteItem: { gap: 2 },
  fonteObra: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, fontWeight: '700' },

  botao: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },

  shareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },

  nota: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  marca: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 6 },
});
