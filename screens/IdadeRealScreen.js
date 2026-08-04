// screens/IdadeRealScreen.js
// A IDADE REAL DE CADA COISA — a tabela das trinta coisas datadas, ordenável e
// desenhada para PRINT: o número grande de um lado, a coisa do outro, e a
// história inteira a um toque.
//
// ===========================================================================
// LEIA lib/idadeReal.js ANTES DE ESCREVER QUALQUER TEXTO NOVO AQUI.
// ===========================================================================
// Esta tela é uma VITRINE: ela não redige conteúdo, ela mostra o que o motor
// exporta. Toda regra do cabeçalho de lib/idadeReal.js vale aqui e é varrida
// por test/idadeReal.test.js na origem — nenhuma alegação de saúde, nenhuma
// promessa de resultado, nenhum veredito sobre a prática de ninguém.
//
// POR QUE ABRE PELA MAIS NOVA: é onde mora o choque. A primeira linha da lista
// é "o app de astrologia como categoria", com um número de um dígito, e a
// segunda é a "Lua de Sangue" com dezoito. Quem rola até o fim chega no
// zodíaco babilônico com dois mil e quatrocentos e poucos — a lista conta uma
// história sozinha, do mais novo ao mais antigo, e termina nas três coisas que
// a pesquisa procurou datar e não conseguiu.
//
// A IDADE É CONTA, E A TELA DIZ ISSO. O rodapé imprime `comoContamos` com o
// ano corrente dentro: "a idade aqui é conta, não tabela: 2026 menos o ano que
// a fonte dá". É a proposição 1 da tese aplicada ao conteúdo — o que é
// calculado se declara calculado, e o que é citado leva o recibo.
//
// O CARD FECHADO x ABERTO: trinta itens abertos viram um paredão que ninguém
// lê. Fechado, o card mostra o essencial de um print (a coisa, a idade, o que
// se pensa); aberto, mostra a história, o recibo e o botão de compartilhar.
// Abrir marca o item como visto (lib/idadeReal.js → marcarIdadeVista, que
// passa por lib/storage.js) e alimenta a linha de progresso.
//
// i18n: NADA DAQUI PASSA POR t(), e continua não passando — lib/i18n.js segue
// intocado. O chrome sai de chromeDaTela(lang) e o conteúdo de idadesReais
// (lang), ambos de lib/idadeReal.js. Esta tela só repassa o `lang` do
// useLanguage(): não escolhe idioma, não tem fallback próprio e não redige uma
// linha. A migração para chave de i18n é do integrador, e é do bloco `tela` de
// lib/traducoes/idadeReal.{pt,es,en}.js que ele vai tirar as strings — nunca de
// dentro deste componente.
//
// COMPARTILHAR: a mesma cadeia de MitosScreen.js e RituaisScreen.js — Share do
// react-native primeiro (no nativo é a folha do SO; na web, react-native-web
// delega para navigator.share quando existe) e clipboard como último recurso
// no desktop sem folha. O texto é o do motor, que fecha no link — nunca um
// texto montado aqui.
//
// STORAGE: só através de lib/idadeReal.js (que usa lib/storage.js). A tela não
// importa AsyncStorage — nunca, regra da casa.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Share, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import {
  agruparPorTema,
  anoAtual,
  chromeDaTela,
  grauParaIdioma,
  idadesReais,
  lerIdadesVistas,
  marcarIdadeVista,
  ordenarPorIdade,
  preencher,
  textoCompartilhavel,
} from '../lib/idadeReal';

// As três ordens da tela. Os ids são internos (não são texto); os rótulos vêm
// do chrome, no idioma.
const ORDENS = ['maisNovo', 'maisAntigo', 'tema'];

export default function IdadeRealScreen() {
  const navigation = useNavigation();
  const { lang } = useLanguage();

  const UI = chromeDaTela(lang);

  // O ano é recalculado a cada foco (tique), nunca congelado no mount: quem
  // deixa o app aberto na virada do ano não pode continuar vendo a idade de
  // ontem. Mesma lição de LunarCalendarScreen.js e MitosScreen.js.
  const [tique, setTique] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setTique((n) => n + 1);
    }, [])
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ano = useMemo(() => anoAtual(), [tique]);

  const lista = useMemo(() => idadesReais(lang, ano), [lang, ano]);
  const total = lista.length;

  const [ordem, setOrdem] = useState('maisNovo');
  const [aberto, setAberto] = useState(null);
  const [vistas, setVistas] = useState(0);
  const [recado, setRecado] = useState(null);

  // Grupos prontos para render: no modo "tema" são as seções; nos outros dois
  // é um grupo só, sem cabeçalho.
  const grupos = useMemo(() => {
    if (ordem === 'tema') return agruparPorTema(lista, lang);
    return [{ tema: null, nome: null, itens: ordenarPorIdade(lista, { crescente: ordem === 'maisNovo' }) }];
  }, [lista, lang, ordem]);

  // Contagem inicial do que já foi aberto — a tela só lê o length.
  useEffect(() => {
    let vivo = true;
    (async () => {
      const jaVistas = await lerIdadesVistas();
      if (vivo) setVistas(jaVistas.length);
    })();
    return () => {
      vivo = false;
    };
  }, []);

  async function alternar(id) {
    setRecado(null);
    if (aberto === id) {
      setAberto(null);
      return;
    }
    setAberto(id);
    // marcarIdadeVista nunca lança (lib/storage.js cai para memória de sessão)
    // e devolve a lista já atualizada.
    const jaVistas = await marcarIdadeVista(id);
    setVistas(jaVistas.length);
  }

  async function compartilhar(item) {
    const texto = textoCompartilhavel(item, lang, ano);
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

        {/* ------------------------------------------------------------------
            ORDENAR — três chips, sutis (feedback_design_sutil)
        ------------------------------------------------------------------ */}
        <Text style={styles.rotuloOrdenar}>{UI.ordenarPor}</Text>
        <View style={styles.chipRow}>
          {ORDENS.map((id) => {
            const rotulo =
              id === 'maisNovo' ? UI.ordemMaisNovo : id === 'maisAntigo' ? UI.ordemMaisAntigo : UI.ordemTema;
            const ativo = ordem === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.chip, ativo && styles.chipAtivo]}
                activeOpacity={0.85}
                onPress={() => setOrdem(id)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={rotulo}
                testID={`idade-ordem-${id}`}
              >
                <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{rotulo}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ------------------------------------------------------------------
            A TABELA
        ------------------------------------------------------------------ */}
        {grupos.map((grupo) => (
          <View key={grupo.tema || 'todos'} style={styles.grupo}>
            {grupo.nome ? (
              <Text style={styles.grupoTitulo} testID={`idade-tema-${grupo.tema}`}>
                {grupo.nome}
              </Text>
            ) : null}

            {grupo.itens.map((item) => {
              const estaAberto = aberto === item.id;
              const grau = grauParaIdioma(item.grau, lang);
              return (
                <View key={item.id} style={styles.card} testID={`idade-card-${item.id}`}>
                  <TouchableOpacity
                    style={styles.linhaTopo}
                    activeOpacity={0.85}
                    onPress={() => alternar(item.id)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: estaAberto }}
                    accessibilityLabel={`${item.coisa} — ${item.idadeReal}`}
                    accessibilityHint={estaAberto ? UI.fechar : UI.abrir}
                    testID={`idade-abrir-${item.id}`}
                  >
                    {/* A IDADE, grande — é o que a pessoa fotografa. */}
                    <View style={styles.idadeCaixa}>
                      <Text
                        style={[styles.idadeNumero, item.anosAtras === null && styles.idadeSemData]}
                        testID={`idade-numero-${item.id}`}
                      >
                        {item.anosAtras === null ? '—' : item.idadeReal}
                      </Text>
                      <Text style={styles.grauSigla}>{item.grau}</Text>
                    </View>

                    <View style={styles.linhaTexto}>
                      <Text style={styles.coisa}>{item.coisa}</Text>
                      {/* O que se pensa: riscado e apagado de propósito — a
                          tipografia conta a história antes da leitura. */}
                      <Text style={styles.pensam} numberOfLines={estaAberto ? undefined : 2}>
                        {item.oQuePensam}
                      </Text>
                    </View>

                    <Ionicons
                      name={estaAberto ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>

                  {estaAberto ? (
                    <View style={styles.corpo}>
                      <View style={styles.divisor}>
                        <View style={styles.divisorLinha} />
                        <Text style={styles.divisorEstrela}>✦</Text>
                        <View style={styles.divisorLinha} />
                      </View>

                      {/* A história, em voz de conversa — prende primeiro.
                          QUENTE PRIMEIRO, FICHA DEPOIS (04/08/2026): o
                          comentário já dizia "prende primeiro" e a tela fazia o
                          contrário — quem abria o card lia "Quem inventou:
                          Nicholas Culpeper / Quando: 1652" antes da frase que
                          explica por que aquilo importa. Os dois campos descem
                          para junto do recibo, que é o lugar de quem-e-quando
                          neste app. Nenhum texto do pack mudou (o golden de
                          idadeReal segue intacto).
                          test/quentePrimeiroNasTelas.test.js trava esta ordem. */}
                      <Text style={styles.detalhe}>{item.detalhe}</Text>

                      <View style={styles.paresRow}>
                        <View style={styles.par}>
                          <Text style={styles.parRotulo}>{UI.rotuloQuem}</Text>
                          <Text style={styles.parValor} testID={`idade-quem-${item.id}`}>
                            {item.quemInventou}
                          </Text>
                        </View>
                        <View style={styles.par}>
                          <Text style={styles.parRotulo}>{UI.rotuloQuando}</Text>
                          <Text style={styles.parValor}>{item.quando}</Text>
                        </View>
                      </View>

                      {/* Sem data não é zero: é ausência declarada. */}
                      {item.anosAtras === null ? (
                        <Text style={styles.semData} testID={`idade-semdata-${item.id}`}>
                          {UI.semDataLonga}
                        </Text>
                      ) : null}

                      {/* O recibo: caixa pontilhada, cinza, no fim. */}
                      <View style={styles.recibo}>
                        <Text style={styles.reciboRotulo}>{UI.recibo}</Text>
                        <Text style={styles.reciboTexto} testID={`idade-recibo-${item.id}`}>
                          {item.fonte}
                        </Text>
                        {grau ? (
                          <Text style={styles.grauTexto}>
                            {item.grau} · {grau.nome} — {grau.glosa}
                          </Text>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        style={styles.shareBtn}
                        activeOpacity={0.85}
                        onPress={() => compartilhar(item)}
                        accessibilityRole="button"
                        accessibilityLabel={UI.compartilhar}
                        testID={`idade-share-${item.id}`}
                      >
                        <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                        <Text style={styles.shareBtnTexto}>{UI.compartilhar}</Text>
                      </TouchableOpacity>

                      <Text style={styles.marca}>{UI.marca}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}

        {recado ? <Text style={styles.nota}>{recado}</Text> : null}

        {/* Progresso — informação, nunca cobrança. */}
        {vistas > 0 ? (
          <Text style={styles.progresso}>{preencher(UI.progresso, { n: vistas, total })}</Text>
        ) : null}

        {/* De onde vem o número. Uma linha, cinza, no fim. */}
        <Text style={styles.comoContamos}>{preencher(UI.comoContamos, { ano })}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 20, paddingBottom: 48, gap: 10 },

  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },

  rotuloOrdenar: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipAtivo: { borderColor: colors.purple, backgroundColor: colors.surfaceElevated },
  chipTexto: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  chipTextoAtivo: { color: colors.text },

  grupo: { gap: 10, marginTop: 6 },
  grupoTitulo: {
    color: colors.gold,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 8,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  idadeCaixa: { width: 92, alignItems: 'center', gap: 2 },
  idadeNumero: { color: colors.gold, fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 19 },
  idadeSemData: { color: colors.textMuted },
  grauSigla: { color: colors.textMuted, fontSize: 9, fontWeight: '800', letterSpacing: 1 },

  linhaTexto: { flex: 1, gap: 3 },
  coisa: { color: colors.text, fontSize: 15, lineHeight: 21, fontWeight: '700' },
  pensam: {
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pink,
  },

  corpo: { gap: 10, marginTop: 10 },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  divisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  divisorEstrela: { color: colors.purple, fontSize: 12 },

  paresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  par: { flexGrow: 1, flexBasis: 140, gap: 2 },
  parRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  parValor: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },

  detalhe: { color: colors.textSecondary, fontSize: 14, lineHeight: 21 },
  semData: { color: colors.textMuted, fontSize: 12, lineHeight: 18, fontStyle: 'italic' },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: 12,
    gap: 3,
  },
  reciboRotulo: { color: colors.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  reciboTexto: { color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  grauTexto: { color: colors.textMuted, fontSize: 11, lineHeight: 17, marginTop: 2 },

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

  marca: { color: colors.textMuted, fontSize: 10, textAlign: 'center' },

  nota: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  progresso: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  comoContamos: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 4,
  },
});
