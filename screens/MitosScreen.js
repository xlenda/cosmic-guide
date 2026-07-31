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
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
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
            O CARD — tudo que precisa estar num print cabe aqui dentro
        ------------------------------------------------------------------ */}
        <View style={styles.card} testID={`mitos-card-${mito.id}`}>
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

          <View style={styles.divisor}>
            <View style={styles.divisorLinha} />
            <Text style={styles.divisorEstrela}>✦</Text>
            <View style={styles.divisorLinha} />
          </View>

          {/* A correção, grande e acesa — é a foto que a pessoa tira. */}
          <Text style={styles.rotuloFonte}>{UI.fonteDiz}</Text>
          <Text style={styles.textoFonte} testID="mitos-fonte-diz">
            {mito.oQueAFonteDiz}
          </Text>

          {/* A história em português de conversa — prende primeiro. */}
          <Text style={styles.detalhe}>{mito.detalhe}</Text>

          {/* O recibo: caixa pontilhada, cinza, no fim — sutil de propósito. */}
          <View style={styles.recibo}>
            <Text style={styles.reciboRotulo}>{UI.recibo}</Text>
            <Text style={styles.reciboTexto} testID="mitos-recibo">
              {mito.fonte}
            </Text>
          </View>

          {/* A marca d'água do print — uma linha cinza, nada além. */}
          <Text style={styles.marca}>{UI.marca}</Text>
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
  scroll: { padding: 20, paddingBottom: 48, gap: 12 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    gap: 10,
  },
  cardTopo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  contador: { color: colors.textMuted, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  pillDia: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,200,92,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillDiaTexto: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  rotuloMito: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  // Riscado E apagado: o mito aparece do jeito que circula, mas a tipografia
  // já avisa que ele não fica de pé.
  textoMito: {
    color: colors.textMuted,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pink,
  },

  divisor: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 2 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  divisorEstrela: { color: colors.purple, fontSize: 12 },

  rotuloFonte: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  textoFonte: { color: colors.text, fontSize: 18, lineHeight: 26, fontWeight: '700' },

  detalhe: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 2 },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 3,
    marginTop: 4,
  },
  reciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  reciboTexto: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },

  marca: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },

  navRow: { flexDirection: 'row', gap: 10 },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnTexto: { color: colors.textSecondary, fontSize: 14, fontWeight: '700' },

  // Sutil de propósito — linha de texto, sem caixa (feedback_design_sutil).
  voltarDia: { alignItems: 'center', paddingVertical: 4 },
  voltarDiaTexto: {
    color: colors.textMuted,
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  shareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { color: '#fff', fontSize: 15, fontWeight: '800' },

  nota: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  progresso: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
