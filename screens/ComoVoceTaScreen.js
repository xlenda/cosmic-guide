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
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
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
        <Text style={styles.intro}>{TXT.intro}</Text>

        {/* Os estados, como chips grandes tocáveis. */}
        <View style={styles.chips} testID="emocoes-estados">
          {ESTADOS.map((e) => {
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

        {/* As pontes do estado escolhido — o que cada leitura cobre, com o
            botão que leva até ela. */}
        {estado ? (
          <View style={styles.pontes} testID="emocoes-pontes">
            <Text style={styles.overline}>{TXT.overlinePontes}</Text>
            {estado.pontes.map((p, i) => {
              const destino = destinoDe(p.destino);
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16, paddingBottom: 40 },

  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 16 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxWidth: '100%',
  },
  chipAtivo: { borderColor: colors.purple, backgroundColor: colors.accent + '33' },
  chipEmoji: { fontSize: 18 },
  chipTexto: { color: colors.textSecondary, fontSize: 15, fontWeight: '600', flexShrink: 1 },
  chipTextoAtivo: { color: colors.text, fontWeight: '800' },

  pontes: { marginTop: 22 },
  overline: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    textAlign: 'center',
  },
  ponteCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  ponteRotulo: { color: colors.purple, fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  ponteTexto: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, marginTop: 6 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  btnTexto: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
