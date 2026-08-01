// screens/ComoDecideScreen.js
// COMO ESTE APP DECIDE — o card de transparência, feature por feature: o que
// foi CALCULADO, o que foi LIDO na tradição, o que é LEITURA DO APP, e o que o
// app SE RECUSA a fazer.
//
// ===========================================================================
// LEIA lib/comoDecide.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// ===========================================================================
// Esta tela é uma VITRINE: ela não redige conteúdo, ela mostra o que o motor
// exporta. Toda regra do cabeçalho de lib/comoDecide.js vale aqui e é varrida
// por test/comoDecide.test.js na origem — nenhuma alegação de saúde, nenhuma
// promessa, nenhum veredito sobre a vida de quem lê, nenhuma porcentagem (nem
// para citar a que o app não usa) e nenhum aviso defensivo de volta.
//
// POR QUE A LISTA DE TELAS VEM ANTES DAS CONVENÇÕES. As convenções são o que
// vale no app inteiro e são a parte mais forte do conteúdo — mas são também a
// parte abstrata. Quem abre esta tela abre por causa de UMA coisa que leu no
// Horóscopo ou na Compatibilidade, e a primeira coisa que precisa achar é o
// nome daquela tela. É a proposição "prende primeiro, fonte depois" aplicada à
// ordem da página: o reconhecimento primeiro, a regra geral logo abaixo, o
// recibo no fim.
//
// O CARD FECHADO x ABERTO: dezenove cards abertos (treze telas + seis
// convenções) viram um paredão que ninguém lê. Fechado, o card mostra o nome, a
// tela onde aquilo aparece e a chamada — que já abre na vida real. Aberto,
// mostra as QUATRO camadas separadas, na ordem que o motor manda em `blocos`
// (calculado → tradição → leitura do app → o que o app se recusa a fazer), mais
// o verbatim quando existe e o botão de compartilhar. A tela não escolhe a
// ordem dos blocos nem os títulos deles: os dois vêm de `d.blocos`.
//
// AS QUATRO CAMADAS NÃO PODEM PARECER A MESMA COISA. É o ponto inteiro da
// feature — se o desenho fundir conta com atribuição, a tela comete o erro que
// existe pra corrigir. Por isso cada bloco tem cor e ícone próprios (conta =
// teal e calculadora, tradição = dourado e livro, escolha nossa = roxo e pincel,
// recusa = vermelho e mão), e a camada de tradição é a única com recibo.
//
// O DADO DE NASCIMENTO: a tela lê getAnyBirthData() de lib/birthData.js e
// PASSA para o motor — é assim que o cabeçalho de lib/comoDecide.js manda. Sem
// esse dado, cada conta que depende dele vem com `disponivelParaVoce: null`, e
// null é "o app não sabe", que é diferente de false ("o app sabe que falta").
// A tela respeita a diferença: null não desenha ícone nenhum, false desenha o
// aviso do que falta e onde informar. Nunca preencher, nunca supor.
//
// i18n: NADA DAQUI PASSA POR t(), e continua não passando — lib/i18n.js segue
// intocado. Conteúdo e rótulos saem do módulo: o card de cardComoDecide(lang) e
// o chrome do bloco `chrome` do pack do próprio módulo. E a tela NÃO escolhe
// idioma nem tem fallback próprio: ela lê `card.idioma`, que é o idioma que o
// MOTOR já resolveu (packDoIdioma cai no pt em idioma desconhecido), e pega o
// chrome do pack correspondente. No dia em que lib/comoDecide.js exportar um
// `chromeDaTela(lang)`, esta tela troca três linhas e não muda mais nada.
//
// STORAGE: nada de AsyncStorage aqui — regra da casa. O único acesso a dado
// guardado é getAnyBirthData(), que é a porta do próprio app para isso.
//
// COMPARTILHAR: a mesma cadeia de IdadeRealScreen.js, MitosScreen.js e
// RituaisScreen.js — Share do react-native primeiro (no nativo é a folha do SO;
// na web, react-native-web delega para navigator.share quando existe) e
// clipboard como último recurso no desktop sem folha. O texto é montado pelo
// PACK (chrome.textoCompartilhavel), nunca aqui dentro.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { cardComoDecide } from '../lib/comoDecide';
import { getAnyBirthData } from '../lib/birthData';
import { PACK as PACK_PT } from '../lib/traducoes/comoDecide.pt.js';
import { PACK as PACK_ES } from '../lib/traducoes/comoDecide.es.js';
import { PACK as PACK_EN } from '../lib/traducoes/comoDecide.en.js';

// O chrome dos três packs, indexado pelo idioma QUE O MOTOR RESOLVEU (card.
// idioma). A tela não decide idioma: ela obedece o que o motor devolveu.
const CHROME = { pt: PACK_PT.chrome, es: PACK_ES.chrome, en: PACK_EN.chrome };

// Ícone por feature. Não é texto — é o id interno do motor virando símbolo, do
// mesmo jeito que os ids de bloco viram cor logo abaixo.
const ICONE_DA_FEATURE = {
  horoscopo: 'sunny',
  mapa: 'planet',
  ceu: 'telescope',
  taro: 'albums',
  compatibilidade: 'heart',
  lua: 'moon',
  calendario: 'calendar',
  rituais: 'flame',
  sonhos: 'cloudy-night',
  corpo: 'accessibility',
  fotos: 'camera',
  cafe: 'cafe',
  chat: 'chatbubbles',
};

// A cara de cada uma das quatro camadas. Elas precisam ser distinguíveis de
// relance: fundir a conta com a atribuição é o erro que esta tela combate.
const CARA_DO_BLOCO = {
  calculado: { icone: 'calculator', cor: colors.teal },
  tradicao: { icone: 'library', cor: colors.gold },
  leituraDoApp: { icone: 'color-palette', cor: colors.purple },
  naoFaz: { icone: 'hand-left', cor: colors.red },
};

export default function ComoDecideScreen() {
  const navigation = useNavigation();
  const { lang } = useLanguage();

  // null = ainda não leu / não existe. O motor entende os dois como "o app não
  // sabe", e é exatamente o que deve aparecer enquanto a leitura não volta.
  const [nascimento, setNascimento] = useState(null);
  const [abertoFeature, setAbertoFeature] = useState(null);
  const [abertoConvencao, setAbertoConvencao] = useState(null);
  const [recado, setRecado] = useState(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        const dado = await getAnyBirthData();
        if (vivo && dado) setNascimento(dado);
      } catch {
        // Sem dado é um estado legítimo desta tela, não um erro a mostrar.
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const card = useMemo(() => cardComoDecide(lang, nascimento), [lang, nascimento]);
  const UI = CHROME[card.idioma];

  // A abertura vem em parágrafos separados por linha em branco — o motor manda
  // assim de propósito (é onde as três camadas são nomeadas em voz alta).
  const paragrafos = useMemo(() => card.explicacao.split('\n\n'), [card.explicacao]);

  function alternarFeature(id) {
    setRecado(null);
    setAbertoFeature((atual) => (atual === id ? null : id));
  }

  function alternarConvencao(id) {
    setRecado(null);
    setAbertoConvencao((atual) => (atual === id ? null : id));
  }

  async function compartilhar(decisao) {
    const texto = UI.textoCompartilhavel(decisao);
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
        // Cancelou ou a folha falhou: silêncio, como nas outras telas que
        // compartilham.
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

  // -------------------------------------------------------------------------
  // OS QUATRO BLOCOS DE UMA FEATURE
  // -------------------------------------------------------------------------
  function renderBloco(featureId, bloco) {
    const cara = CARA_DO_BLOCO[bloco.tipo];
    return (
      <View key={bloco.tipo} style={styles.bloco} testID={`decide-bloco-${featureId}-${bloco.tipo}`}>
        <View style={styles.blocoTopo}>
          <Ionicons name={cara.icone} size={14} color={cara.cor} />
          <Text style={[styles.blocoTitulo, { color: cara.cor }]}>{bloco.titulo}</Text>
        </View>

        {bloco.itens.map((item) => (
          <View key={item.id} style={[styles.item, { borderLeftColor: cara.cor }]}>
            <Text style={styles.itemTexto}>{item.texto}</Text>

            {/* CONTA — o que ela precisa de você, e se roda com o que já tem.
                disponivelParaVoce null não desenha nada: o app não sabe. */}
            {bloco.tipo === 'calculado' && item.aviso ? (
              <View style={styles.avisoLinha}>
                {item.disponivelParaVoce === true ? (
                  <Ionicons name="checkmark-circle" size={13} color={colors.green} />
                ) : null}
                {item.disponivelParaVoce === false ? (
                  <Ionicons name="alert-circle" size={13} color={colors.amber} />
                ) : null}
                <Text style={styles.avisoTexto} testID={`decide-aviso-${featureId}-${item.id}`}>
                  {item.aviso}
                  {item.comoResolver ? ` ${item.comoResolver}` : ''}
                </Text>
              </View>
            ) : null}

            {/* TRADIÇÃO — o recibo vem DEPOIS do texto, sempre. */}
            {bloco.tipo === 'tradicao' ? (
              <View style={[styles.recibo, item.semFontePrimaria && styles.reciboPendente]}>
                {item.semFontePrimaria ? (
                  <Text style={styles.pendenciaRotulo}>{UI.pendencia}</Text>
                ) : null}
                <Text style={styles.reciboTexto} testID={`decide-recibo-${featureId}-${item.id}`}>
                  {item.recibo}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    );
  }

  function renderVerbatim(v, i) {
    return (
      <View key={`${v.locus}-${i}`} style={styles.verbatim}>
        <Text style={styles.verbatimRotulo}>{UI.verbatim}</Text>
        <Text style={styles.verbatimTexto}>“{v.texto}”</Text>
        <Text style={styles.verbatimLocus}>{v.locus}</Text>
        <Text style={styles.verbatimParafrase}>{v.parafrase}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={card.titulo}
        subtitle={UI.subtitulo}
        onBack={() => navigation.goBack()}
        gradient={gradients.purple}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* A ABERTURA — a pergunta de quem lê, antes de qualquer método. */}
        <Text style={styles.chamada} testID="decide-chamada">
          {card.chamada}
        </Text>
        {paragrafos.map((p, i) => (
          <Text key={i} style={styles.explicacao}>
            {p}
          </Text>
        ))}

        {/* ------------------------------------------------------------------
            TELA POR TELA — o reconhecimento primeiro
        ------------------------------------------------------------------ */}
        <View style={styles.secaoTopo}>
          <View style={styles.secaoLinha} />
          <Text style={styles.secaoTitulo}>{card.rotulos.decisoes}</Text>
          <View style={styles.secaoLinha} />
        </View>

        {card.decisoes.map((d) => {
          const estaAberto = abertoFeature === d.id;
          return (
            <View key={d.id} style={styles.card} testID={`decide-card-${d.id}`}>
              <TouchableOpacity
                style={styles.linhaTopo}
                activeOpacity={0.85}
                onPress={() => alternarFeature(d.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: estaAberto }}
                accessibilityLabel={d.nome}
                accessibilityHint={estaAberto ? UI.fechar : UI.abrir}
                testID={`decide-abrir-${d.id}`}
              >
                <View style={styles.iconeCaixa}>
                  <Ionicons name={ICONE_DA_FEATURE[d.id] || 'sparkles'} size={18} color={colors.purple} />
                </View>

                <View style={styles.linhaTexto}>
                  <Text style={styles.nome}>{d.nome}</Text>
                  <Text style={styles.ondeAparece}>
                    {UI.ondeAparece} · {d.tela}
                  </Text>
                </View>

                <Ionicons
                  name={estaAberto ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {/* A chamada fica visível fechada: é ela que abre na vida real. */}
              <Text style={styles.chamadaCard} numberOfLines={estaAberto ? undefined : 3}>
                {d.chamada}
              </Text>

              {estaAberto ? (
                <View style={styles.corpo}>
                  <View style={styles.divisor}>
                    <View style={styles.divisorLinha} />
                    <Text style={styles.divisorEstrela}>✦</Text>
                    <View style={styles.divisorLinha} />
                  </View>

                  {d.blocos.map((bloco) => renderBloco(d.id, bloco))}

                  {d.verbatins.map(renderVerbatim)}

                  <TouchableOpacity
                    style={styles.shareBtn}
                    activeOpacity={0.85}
                    onPress={() => compartilhar(d)}
                    accessibilityRole="button"
                    accessibilityLabel={UI.compartilhar}
                    testID={`decide-share-${d.id}`}
                  >
                    <Ionicons name="share-social" size={16} color="#fff" />
                    <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })}

        {/* ------------------------------------------------------------------
            AS CONVENÇÕES — o que vale no app inteiro
        ------------------------------------------------------------------ */}
        <View style={styles.secaoTopo}>
          <View style={styles.secaoLinha} />
          <Text style={styles.secaoTitulo}>{card.rotulos.convencoes}</Text>
          <View style={styles.secaoLinha} />
        </View>

        {card.convencoes.map((c) => {
          const estaAberto = abertoConvencao === c.id;
          return (
            <View key={c.id} style={styles.card} testID={`decide-convencao-${c.id}`}>
              <TouchableOpacity
                style={styles.linhaTopo}
                activeOpacity={0.85}
                onPress={() => alternarConvencao(c.id)}
                accessibilityRole="button"
                accessibilityState={{ expanded: estaAberto }}
                accessibilityLabel={c.nome}
                accessibilityHint={estaAberto ? UI.fechar : UI.abrir}
                testID={`decide-abrir-convencao-${c.id}`}
              >
                <View style={styles.iconeCaixa}>
                  <Ionicons name="git-branch" size={18} color={colors.gold} />
                </View>
                <View style={styles.linhaTexto}>
                  <Text style={styles.nome}>{c.nome}</Text>
                </View>
                <Ionicons
                  name={estaAberto ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              <Text style={styles.chamadaCard} numberOfLines={estaAberto ? undefined : 3}>
                {c.chamada}
              </Text>

              {estaAberto ? (
                <View style={styles.corpo}>
                  <View style={styles.divisor}>
                    <View style={styles.divisorLinha} />
                    <Text style={styles.divisorEstrela}>✦</Text>
                    <View style={styles.divisorLinha} />
                  </View>

                  {c.texto.split('\n\n').map((p, i) => (
                    <Text key={i} style={styles.convencaoTexto}>
                      {p}
                    </Text>
                  ))}

                  {c.verbatins.map(renderVerbatim)}

                  {c.fontes.length > 0 ? (
                    <View style={styles.recibo}>
                      {c.fontes.map((linha, i) => (
                        <Text key={i} style={styles.reciboTexto}>
                          {linha}
                        </Text>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}

        {/* ------------------------------------------------------------------
            A BIBLIOGRAFIA — o recibo de tudo, no fim
        ------------------------------------------------------------------ */}
        <View style={styles.secaoTopo}>
          <View style={styles.secaoLinha} />
          <Text style={styles.secaoTitulo}>{card.rotulos.fontes}</Text>
          <View style={styles.secaoLinha} />
        </View>

        <Text style={styles.bibliografiaNota}>{UI.bibliografiaNota}</Text>
        <View style={styles.bibliografia} testID="decide-bibliografia">
          {card.fontes.map((linha, i) => (
            <Text key={i} style={styles.bibliografiaLinha}>
              {linha}
            </Text>
          ))}
        </View>

        {recado ? <Text style={styles.nota}>{recado}</Text> : null}

        <Text style={styles.rodape}>{UI.rodape}</Text>
        <Text style={styles.marca}>{UI.marca}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 10 },

  chamada: { color: colors.text, fontSize: 16, lineHeight: 24, fontWeight: '700' },
  explicacao: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  secaoTopo: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18, marginBottom: 2 },
  secaoLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  secaoTitulo: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 8,
  },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconeCaixa: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linhaTexto: { flex: 1, gap: 3 },
  nome: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700' },
  ondeAparece: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  chamadaCard: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  corpo: { gap: 12, marginTop: 4 },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  divisorEstrela: { color: colors.purple, fontSize: 12 },

  bloco: { gap: 8 },
  blocoTopo: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  blocoTitulo: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, textTransform: 'uppercase', flex: 1 },

  item: { borderLeftWidth: 2, paddingLeft: 10, gap: 6 },
  itemTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  avisoLinha: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  avisoTexto: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 10,
    gap: 4,
  },
  reciboPendente: { borderColor: colors.amber },
  reciboTexto: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  pendenciaRotulo: { color: colors.amber, fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  verbatim: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    gap: 5,
  },
  verbatimRotulo: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  verbatimTexto: { color: colors.text, fontSize: 13, lineHeight: 20, fontStyle: 'italic' },
  verbatimLocus: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },
  verbatimParafrase: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  convencaoTexto: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },

  shareBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },

  bibliografiaNota: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  bibliografia: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    gap: 7,
  },
  bibliografiaLinha: { color: colors.textMuted, fontSize: 11, lineHeight: 17 },

  nota: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  rodape: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 14 },
  marca: { color: colors.textMuted, fontSize: 10, textAlign: 'center', marginTop: 2 },
});
