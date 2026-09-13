// screens/MitosScreen.js
// MITO × FONTE — um card por vez, desenhado pra PRINT: o que te contaram
// (riscado), o que a fonte diz (grande), e o recibo embaixo, discreto.
//
// ===========================================================================
// LEIA lib/mitos.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// ===========================================================================
// Esta tela é uma VITRINE: ela não escreve conteúdo de mito, ela mostra o que
// o motor exporta. Toda regra do cabeçalho de lib/mitos.js vale aqui e é
// varrida por test/mitos.test.js na origem — nenhuma alegação de saúde,
// nenhuma promessa de resultado, nenhum veredito sobre a prática de ninguém.
// O chrome escrito aqui (rótulos, botões) descreve o que a pessoa vai FAZER.
//
// A ORDEM DO CARD É A REGRA DO APP, prende primeiro: o mito como ele circula
// vem em cima (é a frase que a pessoa reconhece da própria timeline), a
// correção vem grande logo abaixo, o `detalhe` conta a história na língua do
// app, em voz de conversa, e o recibo (obra, autor, ano) fecha embaixo, como
// recibo mesmo — caixa pontilhada, cinza, sutil (feedback_design_sutil:
// elemento auxiliar não grita).
//
// i18n: NADA DAQUI PASSA POR t(), e continua não passando — lib/i18n.js segue
// intocado. O que mudou é de onde vem o texto: o chrome que morava em
// constantes locais aqui foi para CHROME_TELA, em lib/mitos.js, e sai
// traduzido por chromeDaTela(lang); o conteúdo dos 25 mitos sai por
// mitosParaIdioma(lang). Esta tela só passa o `lang` do useLanguage() adiante —
// ela não escolhe idioma, não tem fallback próprio e não redige nada. A
// migração pra chave de i18n é do integrador da fase 2, e é de CHROME_TELA que
// ele vai tirar as strings.
//
// MITO DO DIA: determinístico por data (lib/mitos.js, padrão dailyThought) —
// mesmo dia, mesmo mito, em qualquer aparelho. A tela abre nele, e o índice é
// recalculado a cada foco pra quem deixou o app aberto de um dia pro outro
// não ver o selo "MITO DO DIA" no mito de ontem (mesma lição de
// LunarCalendarScreen.js e RituaisScreen.js).
//
// COMPARTILHAR: a mesma cadeia de RituaisScreen.js — Share do react-native
// primeiro (no nativo é a folha do SO; na web, react-native-web delega pra
// navigator.share quando existe), e clipboard como último recurso no desktop
// sem folha. O texto é o de lib/mitos.js, que fecha no link — nunca um texto
// montado aqui.
//
// STORAGE: só através de lib/mitos.js (que usa lib/storage.js). A tela não
// importa AsyncStorage — nunca, regra da casa.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useLanguage } from '../context/LanguageContext';
import {
  chromeDaTela,
  indiceDoMitoDoDia,
  marcarMitoVisto,
  mitosParaIdioma,
  preencher,
  textoCompartilhavel,
} from '../lib/mitos';

export default function MitosScreen() {
  const navigation = useNavigation();
  const { lang } = useLanguage();

  // Chrome e catálogo no idioma do app. `mitosParaIdioma` preserva a ORDEM de
  // MITOS, que é o que faz o índice do mito do dia continuar valendo.
  const UI = chromeDaTela(lang);
  const mitosDoIdioma = React.useMemo(() => mitosParaIdioma(lang), [lang]);

  // O índice do dia é recalculado a cada foco (tique), nunca congelado no
  // mount — ver o cabeçalho. O índice NAVEGADO começa no do dia.
  const [tique, setTique] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTique((n) => n + 1);
    }, [])
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const indiceDoDia = React.useMemo(() => indiceDoMitoDoDia(new Date()), [tique]);

  const [indice, setIndice] = useState(() => indiceDoMitoDoDia(new Date()));
  const [vistos, setVistos] = useState(0);
  const [recado, setRecado] = useState(null);

  const mito = mitosDoIdioma[indice];
  const total = mitosDoIdioma.length;

  // Marca o mito atual como visto e atualiza a contagem. marcarMitoVisto nunca
  // lança (lib/storage.js cai pra memória de sessão) e devolve a lista já
  // atualizada — a tela só lê o length.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const lista = await marcarMitoVisto(mito.id);
      if (vivo) setVistos(lista.length);
    })();
    return () => {
      vivo = false;
    };
  }, [mito.id]);

  function irPara(novoIndice) {
    setRecado(null);
    setIndice(((novoIndice % total) + total) % total);
  }

  // A mesma cadeia de RituaisScreen.compartilhar — folha do SO primeiro,
  // clipboard só quando não existe folha nenhuma (desktop antigo).
  async function compartilhar() {
    const texto = textoCompartilhavel(mito, lang);
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
        // telas que compartilham.
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

  const ehDoDia = indice === indiceDoDia;

  return (
    <View style={styles.root}>
      <GradientHeader
        title={UI.titulo}
        subtitle={UI.subtitulo}
        onBack={() => navigation.goBack()}
        gradient={gradients.purple}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ------------------------------------------------------------------
            TRÊS FAIXAS, TRÊS ASSUNTOS (12/09/2026 — o lote de diagramação).
            O card único de antes punha o mito, a correção, a história e o
            recibo no MESMO chão: quatro coisas diferentes lidas como uma só
            parede de texto (foto em design/lote-diagramacao/antes/mitos*).
            Agora cada beat tem chão próprio e a borda de cima é onda, então o
            olho lê "mudou de assunto" sem precisar de linha divisória — e o
            divisor ✦ que fazia esse trabalho à mão sai de cena.
            NADA DE TEXTO MUDOU: são os mesmos seis campos, na mesma ordem.
        ------------------------------------------------------------------ */}
        <View testID={`mitos-card-${mito.id}`}>
          {/* FAIXA 1 — o que te contaram. Ameixa: é a faixa principal, a
              frase que a pessoa reconhece da própria timeline.
              `rasa` MEDIDO: o corpo desta faixa tem 205px de conteúdo, e a
              caixa da onda cheia tem 56px — na borda da tela, onde a curva
              desce, essa caixa fica quase toda preenchida, então a faixa abria
              com um naco de cor lisa maior que o rótulo que vem depois. É o
              mesmo defeito ALTO que o revisor achou na Home. `rasa` corta a
              caixa pela metade (28px) sem redesenhar a onda. A faixa 2 (598px
              de corpo) NÃO leva `rasa`: lá a onda cheia é a entrada que a
              seção merece. */}
          <FaixaCurva
            tom="ameixa"
            semente="mito-contaram"
            rasa
            // paddingTop 0 pelo mesmo motivo da faixa que abre o Quiz: esta
            // vem logo abaixo do GradientHeader, que ja tem folga embaixo, e
            // os dois respiros somavam. MEDIDO: 60px de chao morto acima de
            // "22 de 25" (28 da onda rasa + 32 do padding). Sem o padding
            // sobra so a onda, que e desenho.
            estiloCorpo={styles.faixaAbertura}
          >
            <View style={styles.cardTopo}>
              <Text style={styles.contador}>{preencher(UI.contador, { n: indice + 1, total })}</Text>
              {ehDoDia ? (
                <View style={styles.pillDia} testID="mitos-pill-dia">
                  <Ionicons name="sunny" size={11} color={colors.gold} />
                  <Text style={styles.pillDiaTexto}>{UI.mitoDoDia}</Text>
                </View>
              ) : null}
            </View>

            {/* O mito, do jeito que circula — riscado e apagado de propósito:
                a tipografia já conta a história antes de qualquer leitura. */}
            <Text style={styles.rotuloMito}>{UI.teContaram}</Text>
            <Text style={styles.textoMito} testID="mitos-te-contaram">
              {mito.oQueTeContaram}
            </Text>
          </FaixaCurva>

          {/* FAIXA 2 — a correção e a história. Violeta: é a seção que PRECISA
              se destacar das vizinhas, porque é a foto que a pessoa tira.
              A história longa entra em ColunaLeitura: são 6 a 8 linhas, e de
              borda a borda o olho perde o começo da linha seguinte. */}
          <FaixaCurva tom="violeta" semente="mito-fonte" grude="ameixa">
            <Text style={styles.rotuloFonte}>{UI.fonteDiz}</Text>
            <Text style={styles.textoFonte} testID="mitos-fonte-diz">
              {mito.oQueAFonteDiz}
            </Text>

            <ColunaLeitura style={styles.colunaDetalhe}>
              <Text style={styles.detalhe}>{mito.detalhe}</Text>
            </ColunaLeitura>
          </FaixaCurva>

          {/* FAIXA 3 — o recibo e a marca. Dourado: o chão quente do epílogo.
              Continua sendo recibo (cinza, pontilhado, pequeno) — o que mudou
              é que ele agora tem chão próprio em vez de flutuar no fim do
              mesmo card da correção. `rasa` pelo mesmo motivo da faixa 1:
              187px de corpo medidos. */}
          <FaixaCurva tom="dourado" semente="mito-recibo" grude="violeta" rasa>
            <View style={styles.recibo}>
              <Text style={styles.reciboRotulo}>{UI.recibo}</Text>
              <Text style={styles.reciboTexto} testID="mitos-recibo">
                {mito.fonte}
              </Text>
            </View>

            {/* A marca d'água do print — uma linha cinza, nada além. */}
            <Text style={styles.marca}>{UI.marca}</Text>
          </FaixaCurva>
        </View>

        {/* ------------------------------------------------------------------
            NAVEGAÇÃO — anterior / próximo, circular
        ------------------------------------------------------------------ */}
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.85}
            onPress={() => irPara(indice - 1)}
            accessibilityRole="button"
            accessibilityLabel={UI.anterior}
            testID="mitos-anterior"
          >
            <Ionicons name="chevron-back" size={18} color={colors.textSecondary} />
            <Text style={styles.navBtnTexto}>{UI.anterior}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navBtn}
            activeOpacity={0.85}
            onPress={() => irPara(indice + 1)}
            accessibilityRole="button"
            accessibilityLabel={UI.proximo}
            testID="mitos-proximo"
          >
            <Text style={styles.navBtnTexto}>{UI.proximo}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {!ehDoDia ? (
          <TouchableOpacity
            style={styles.voltarDia}
            activeOpacity={0.7}
            onPress={() => irPara(indiceDoDia)}
            accessibilityRole="button"
            testID="mitos-voltar-dia"
          >
            <Text style={styles.voltarDiaTexto}>{UI.voltarAoDia}</Text>
          </TouchableOpacity>
        ) : null}

        {/* ------------------------------------------------------------------
            COMPARTILHAR — o texto é o do motor, fecha no link, sempre
        ------------------------------------------------------------------ */}
        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.85}
          onPress={compartilhar}
          accessibilityRole="button"
          testID="mitos-share"
        >
          <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
        </TouchableOpacity>
        {recado ? <Text style={styles.nota}>{recado}</Text> : null}

        {/* Progresso — informação, nunca cobrança. */}
        {vistos > 0 ? (
          <Text style={styles.progresso}>{preencher(UI.progresso, { n: vistos, total })}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // As faixas sangram de ponta a ponta — elas trazem o próprio
  // paddingHorizontal (space.tela). O padding lateral do scroll saiu por isso;
  // o que sobrou aqui é só o respiro de baixo e o gap entre os blocos QUE
  // NÃO SÃO faixa (navegação, compartilhar, progresso).
  scroll: { paddingBottom: space.ar, gap: space.dentro },

  faixaAbertura: { paddingTop: 0 },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { ...type.etiqueta, color: colors.textMuted },
  pillDia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.grudado,
    backgroundColor: 'rgba(255,200,92,0.15)',
    borderRadius: 8,
    paddingHorizontal: space.junto,
    paddingVertical: 3,
  },
  pillDiaTexto: { ...type.nota, color: colors.gold, fontWeight: '600', letterSpacing: 0.5 },

  rotuloMito: { ...type.etiqueta, color: colors.textMuted, marginTop: space.bloco },
  // Riscado E apagado: o mito aparece do jeito que circula, mas a tipografia
  // já avisa que ele não fica de pé. Sobe de 20 pro degrau `secao` da escala
  // (20/26) e ganha o respiro `junto` acima — antes o rótulo e a frase vinham
  // grudados como uma coisa só.
  textoMito: {
    ...type.secao,
    color: colors.textMuted,
    marginTop: space.junto,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pink,
  },

  rotuloFonte: { ...type.etiqueta, color: colors.gold },
  // A correção é a foto que a pessoa tira. MEDIDO e corrigido: `titulo`
  // (24/30) empurrava a explicação inteira pra fora da primeira dobra — a
  // correção ficava sozinha na tela e a história, que é o que prende, só
  // aparecia rolando. `secao` (20/26) é o mesmo degrau do mito riscado, e aí
  // quem cria a hierarquia é a COR (text aceso contra textMuted riscado) e o
  // chão que mudou, não mais tamanho — que é a regra da casa: o peso e o
  // tamanho são exceção, o espaço e a cor fazem o trabalho.
  textoFonte: { ...type.secao, color: colors.text, marginTop: space.junto },

  // A história: degrau de texto corrido (17/27), não mais 14/21. Peso normal
  // — o destaque aqui é espaço e cor, nunca negrito.
  colunaDetalhe: { marginTop: space.entre, paddingHorizontal: 0 },
  detalhe: { ...type.corpo, color: colors.textSecondary },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: space.bloco,
    gap: space.grudado,
  },
  reciboRotulo: { ...type.etiqueta, color: colors.textMuted },
  reciboTexto: { ...type.apoio, color: colors.textMuted },

  marca: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.dentro },

  navRow: { flexDirection: 'row', gap: space.dentro, marginHorizontal: space.tela, marginTop: space.entre },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: space.junto,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: space.bloco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnTexto: { ...type.botao, color: colors.textSecondary },

  // Sutil de propósito — linha de texto, sem caixa (feedback_design_sutil).
  voltarDia: { alignItems: 'center', paddingVertical: space.grudado },
  voltarDiaTexto: {
    ...type.apoio,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },

  shareBtn: {
    flexDirection: 'row',
    gap: space.junto,
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: space.bloco,
    marginHorizontal: space.tela,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { ...type.botao, color: '#fff' },

  nota: { ...type.apoio, color: colors.textSecondary, textAlign: 'center', marginHorizontal: space.tela },
  progresso: { ...type.apoio, color: colors.textMuted, textAlign: 'center', marginHorizontal: space.tela },
});
