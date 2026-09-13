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
import { colors, gradients, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import TabelaDados from '../components/TabelaDados';
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
        {/* DUAS FAIXAS, e só duas. A tela tem trinta cards iguais: cada um já
            é um bloco, e dar faixa a cada seção viraria a textura que o guia
            proíbe. O corte que existe de verdade é um só — a ABERTURA (o que
            é isto, e como ordenar) contra A LISTA. */}
        <FaixaCurva tom="ameixa" semente="idade-abertura" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
          <ColunaLeitura>
            <Text style={styles.intro}>{UI.intro}</Text>
          </ColunaLeitura>

          {/* ----------------------------------------------------------------
              ORDENAR — três chips, sutis (feedback_design_sutil)
          ---------------------------------------------------------------- */}
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
        </FaixaCurva>

        {/* ------------------------------------------------------------------
            A TABELA
        ------------------------------------------------------------------ */}
        <FaixaCurva tom="noite" semente="idade-lista" grude="ameixa" style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
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
                      {/* NUNCA TRAÇO MUDO (12/09/2026). A tela imprimia '—'
                          quando anosAtras era null — o exato traço que a lei da
                          casa proíbe, e ainda por cima jogando fora o texto que
                          o motor JÁ devolve pra esse caso: rotuloDeIdade()
                          (lib/idadeReal.js:464) retorna `tela.semData`, que é
                          "sem data" / "sin fecha" / "no date" nos três packs.
                          Ausência DECLARADA em palavra, não um risco que a
                          pessoa tem que adivinhar. O texto longo que explica
                          por quê continua aparecendo no card aberto. */}
                      <Text
                        style={[styles.idadeNumero, item.anosAtras === null && styles.idadeSemData]}
                        testID={`idade-numero-${item.id}`}
                      >
                        {item.idadeReal}
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
                      <ColunaLeitura>
                        <Text style={styles.detalhe}>{item.detalhe}</Text>
                      </ColunaLeitura>

                      {/* QUEM E QUANDO viraram a tabela. Eram dois pares em
                          flexBasis 140 que, em 390px, ora caíam lado a lado
                          ora empilhavam conforme o tamanho do nome — o mesmo
                          dado mudando de forma de item pra item. Rótulo à
                          esquerda, valor à direita, fio entre eles: confere-se
                          um item contra o outro sem reaprender o desenho.
                          E o filtro entra de graça: item cuja pesquisa não
                          achou o inventor não ganha linha vazia — ela some,
                          e o "não achamos" continua dito por extenso abaixo. */}
                      <TabelaDados
                        testID={`idade-ficha-${item.id}`}
                        itens={[
                          { chave: 'quem', rotulo: UI.rotuloQuem, valor: item.quemInventou },
                          { chave: 'quando', rotulo: UI.rotuloQuando, valor: item.quando },
                        ]}
                      />

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
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // O gutter e o respiro saíram daqui: quem sangra de ponta a ponta é a FAIXA,
  // e é ela que carrega o padding horizontal agora.
  scroll: { paddingBottom: space.fimDaLista },

  faixa: { width: '100%' },
  faixaCorpo: { gap: space.bloco },

  intro: { ...type.corpo, color: colors.textSecondary },

  rotuloOrdenar: { ...type.etiqueta, color: colors.textMuted, marginTop: space.junto },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: space.dentro,
    paddingVertical: space.junto,
  },
  chipAtivo: { borderColor: colors.purple, backgroundColor: colors.surfaceElevated },
  chipTexto: { ...type.apoio, color: colors.textSecondary },
  chipTextoAtivo: { color: colors.text },

  grupo: { gap: space.dentro, marginTop: space.junto },
  grupoTitulo: {
    ...type.etiqueta,
    color: colors.gold,
    textTransform: 'uppercase',
    marginTop: space.dentro,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.bloco,
  },
  linhaTopo: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },

  idadeCaixa: { width: 92, alignItems: 'center', gap: space.grudado },
  // A idade é o número que a pessoa fotografa: sobe do 15 solto pro degrau de
  // card da escala, que é onde o olho pousa primeiro na linha.
  idadeNumero: { ...type.cartao, color: colors.gold, textAlign: 'center' },
  // "sem data" não é número: perde o dourado e vira texto apagado, pra ninguém
  // confundir ausência declarada com medida.
  idadeSemData: { ...type.apoio, color: colors.textMuted },
  grauSigla: { ...type.etiqueta, color: colors.textMuted },

  linhaTexto: { flex: 1, gap: space.grudado },
  coisa: { ...type.cartao, color: colors.text },
  pensam: {
    ...type.apoio,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.pink,
  },

  corpo: { gap: space.bloco, marginTop: space.bloco },
  divisor: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  divisorLinha: { flex: 1, height: 1, backgroundColor: colors.border },
  divisorEstrela: { color: colors.purple, fontSize: 12 },

  detalhe: { ...type.corpoCurto, color: colors.textSecondary },
  semData: { ...type.apoio, color: colors.textMuted, fontStyle: 'italic' },

  recibo: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: colors.border,
    padding: space.dentro,
    gap: space.grudado,
  },
  reciboRotulo: { ...type.etiqueta, color: colors.textMuted },
  reciboTexto: { ...type.apoio, color: colors.textMuted },
  grauTexto: { ...type.nota, color: colors.textMuted, marginTop: space.grudado },

  shareBtn: {
    flexDirection: 'row',
    gap: space.junto,
    backgroundColor: '#25D366',
    borderRadius: 14,
    paddingVertical: space.dentro,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnTexto: { ...type.botao, color: '#fff' },

  marca: { ...type.nota, color: colors.textMuted, textAlign: 'center' },

  nota: { ...type.apoio, color: colors.textSecondary, textAlign: 'center' },
  progresso: { ...type.apoio, color: colors.textMuted, textAlign: 'center', marginTop: space.junto },
  comoContamos: { ...type.nota, color: colors.textMuted, textAlign: 'center', marginTop: space.grudado },
});
