// Como você tá — a entrada por emoção (mecânica do concorrente nº 1).
//
// A pessoa toca no chip que mais parece com ela AGORA — "briguei com quem eu
// amo", "não sei que rumo tomar" — e a tela mostra a(s) ponte(s): o que cada
// leitura do app cobre naquele assunto, com um botão que leva pra feature que
// JÁ EXISTE. Nada de conteúdo novo aqui: os estados, as pontes e os destinos
// vivem em lib/emocoes.js (texto em PT dentro do lib, padrão da casa), e esta
// tela só renderiza e navega.
//
// A regra que governa os textos está no cabeçalho de lib/emocoes.js e no teste
// que a tranca (test/emocoes.test.js): a ponte é de ASSUNTO, nunca de
// tratamento — descreve o que a leitura cobre, jamais efeito sobre a pessoa.
//
// NAVEGAÇÃO: os destinos carregam a rota real de routes.js via lib/emocoes.js
// (nunca string solta). O Tarô mora em outra aba, então alvoDeNavegacao()
// devolve `viaAbaPai` e a tela sobe pro Tab.Navigator com getParent() — o
// mesmo desenho de screens/JornadaScreen.js.
//
// i18n: o texto inteiro desta tela — estados, pontes, destinos E chrome —
// viaja pelos packs de lib/traducoes/emocoes.<lang>.js via lib/emocoes.js.
// `lang` vem do useLanguage() e é passado aos acessores do lib; esta tela
// continua sem redigir nada e sem registrar chave em lib/i18n.js (o chrome
// mora em CHROME_TELA/packs, não no dicionário do app).
import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useLanguage } from '../context/LanguageContext';
import { estadosParaIdioma, estadoPorId, destinoDe, alvoDeNavegacao, chromeDaTela } from '../lib/emocoes';

const HEADER_GRADIENT = ['#B57BFF', '#FF7BD5'];

export default function ComoVoceTaScreen() {
  const navigation = useNavigation();
  const { lang } = useLanguage();
  const [estadoId, setEstadoId] = useState(null);

  // `lang` é o fio inteiro do i18n de conteúdo aqui: chrome, estados e
  // destinos saem dos acessores do lib já no idioma da pessoa. A navegação
  // (rota, abaPai) não muda com o idioma — id canônico é sempre o mesmo.
  const TXT = chromeDaTela(lang);
  const estados = estadosParaIdioma(lang);
  const estado = estadoId ? estadoPorId(estadoId, lang) : null;

  // Tocar de novo no chip escolhido desfaz a escolha — sair do estado não pode
  // custar mais que entrar nele.
  const escolher = useCallback((id) => {
    setEstadoId((atual) => (atual === id ? null : id));
  }, []);

  const abrirDestino = useCallback(
    (idDestino) => {
      // SEM `lang`, de propósito: navegação não é texto. `rota` e `abaPai` são
      // os mesmos nos três idiomas (os packs só trocam rótulo e botão), e ler a
      // tabela canônica aqui é a garantia de que trocar de idioma nunca move um
      // botão de lugar. test/emocoesIdiomas.test.js cobra essa igualdade.
      const alvo = alvoDeNavegacao(destinoDe(idDestino));
      if (!alvo) return;
      if (alvo.viaAbaPai) {
        // Feature de outra aba (só o Tarô): navega o Tab.Navigator pai.
        (navigation.getParent() || navigation).navigate(alvo.nome);
        return;
      }
      navigation.navigate(alvo.nome);
    },
    [navigation]
  );

  return (
    <View style={styles.root}>
      <GradientHeader
        title={TXT.titulo}
        subtitle={TXT.subtitulo}
        onBack={() => navigation.goBack()}
        gradient={HEADER_GRADIENT}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ATO 1 — a pergunta. Uma faixa só, com a fala de abertura em coluna
            de leitura e os chips logo abaixo: é a "uma ideia por tela" do
            concorrente, onde a única coisa a fazer é escolher. */}
        <FaixaCurva tom="ameixa" semente="emocoes-escolha" estiloCorpo={styles.faixaAbre}>
          <ColunaLeitura centralizado>
            <Text style={styles.intro}>{TXT.intro}</Text>
          </ColunaLeitura>

          {/* Os estados, como chips grandes tocáveis. */}
          <View style={styles.chips} testID="emocoes-estados">
            {estados.map((e) => {
              const ativo = e.id === estadoId;
              return (
                <TouchableOpacity
                  key={e.id}
                  style={[styles.chip, ativo && styles.chipAtivo]}
                  onPress={() => escolher(e.id)}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                >
                  <Text style={styles.chipEmoji}>{e.emoji}</Text>
                  <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>{e.fala}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </FaixaCurva>

        {/* ATO 2 — a resposta. A faixa MUDA DE CHÃO (violeta), que é o recurso
            inteiro: sem nenhum título gritando, o olho lê "agora é outro
            assunto" quando as pontes aparecem.

            ESTADO VAZIO: sem estado escolhido a faixa é `rasa` e não carrega
            conteúdo nenhum — só a onda baixa fechando o primeiro ato. É o
            defeito que o revisor achou na Home (faixa virando bloco de cor sem
            conteúdo) resolvido antes de acontecer. */}
        <FaixaCurva
          tom="violeta"
          semente="emocoes-pontes"
          grude
          rasa={!estado}
          estiloCorpo={estado ? null : styles.faixaVazia}
        >
          {estado ? (
          <View testID="emocoes-pontes">
            <Text style={styles.overline}>{TXT.overlinePontes}</Text>
            {estado.pontes.map((p, i) => {
              // Com `lang`: o rótulo e o texto do botão são texto de tela e
              // viajam pelos packs. Sem ele, o card vinha em espanhol com o
              // botão em português.
              const destino = destinoDe(p.destino, lang);
              if (!destino) return null;
              return (
                <View key={`${estado.id}-${p.destino}-${i}`} style={styles.ponteCard}>
                  <Text style={styles.ponteRotulo}>{destino.rotulo}</Text>
                  <Text style={styles.ponteTexto}>{p.texto}</Text>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() => abrirDestino(p.destino)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                  >
                    <Text style={styles.btnTexto}>{destino.botao}</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
          ) : null}
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  // Sem padding horizontal: as faixas vão de borda a borda (é o que faz a
  // troca de chão se ler) e cada uma já traz o `space.tela` por dentro.
  scrollContent: { paddingBottom: space.fimDaLista },

  // A faixa de abertura encosta no cabeçalho, que já tem folga embaixo —
  // somar o paddingTop 'secao' dela abriria buraco entre os dois.
  faixaAbre: { paddingTop: space.bloco },
  // Estado vazio: a faixa rasa não pode ainda desenhar meia tela de cor.
  faixaVazia: { paddingTop: 0, paddingBottom: 0 },

  intro: { ...type.corpo, color: colors.textSecondary, textAlign: 'center', marginBottom: space.secao },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.dentro, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.junto,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: space.dentro,
    paddingHorizontal: space.bloco,
    maxWidth: '100%',
  },
  chipAtivo: { borderColor: colors.purple, backgroundColor: colors.accent + '33' },
  // Glifo: dimensão de desenho, não degrau de leitura.
  chipEmoji: { fontSize: 18 },
  // O chip escolhido se separa por COR, não por peso — era aqui que morava
  // um dos 471 pesos 800 do diagnóstico.
  chipTexto: { ...type.corpoCurto, color: colors.textSecondary, flexShrink: 1 },
  chipTextoAtivo: { color: colors.text },

  overline: {
    ...type.etiqueta,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: space.entre,
    textAlign: 'center',
  },
  ponteCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: space.bloco,
    marginBottom: space.entre,
  },
  ponteRotulo: { ...type.etiqueta, color: colors.purple, textTransform: 'uppercase' },
  ponteTexto: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.junto },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.junto,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: space.dentro,
    paddingHorizontal: space.bloco,
    marginTop: space.bloco,
    alignSelf: 'flex-start',
  },
  btnTexto: { ...type.botao, color: '#fff' },
});
