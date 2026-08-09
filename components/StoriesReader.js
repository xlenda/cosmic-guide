// O LEITOR DE HISTÓRIA — a leitura longa em slides, como stories do Instagram.
//
// Por que existe (08/08/2026): o concorrente entrega a leitura personalizada
// em telas de um trecho só — barra de progresso em cima, toque à direita
// avança, à esquerda volta — e é MUITO mais fácil de ler no celular do que a
// parede de texto que as três leituras longas deste app entregavam. Este
// componente REFORMATA a exibição; ele não escreve, não corta e não descarta
// uma palavra da leitura (a fatia é de lib/storySlides.js, que garante isso
// em teste). Os goldens continuam travando a prosa byte a byte na origem.
//
// Modal do react-native, nunca Alert: Alert.alert é no-op literal na web do
// Expo (regra da casa, ver MEMORY) e o Modal funciona nas duas plataformas.
//
// O texto mora no TERÇO INFERIOR da tela, como no concorrente — o topo fica
// só com o progresso e o X, e o meio respira. As zonas de toque são
// invisíveis e cobrem a tela ATRÁS do texto (o corpo tem pointerEvents
// "none"); topo e botão Concluir vêm DEPOIS na árvore, então recebem o toque
// normalmente.
//
// i18n: todo texto de interface daqui sai de t() — as chaves vivem no bloco
// [BLOCO-STORIES] de lib/i18n.js, nos três idiomas. O conteúdo dos slides
// chega pronto por props, no idioma em que a leitura nasceu.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients } from '../theme';
import { useLanguage } from '../context/LanguageContext';
// O BOTÃO "OUVIR" (08/08/2026) — o slide atual em voz alta com a voz do
// aparelho (Web Speech API, lib/voz.js). Sem a API ele devolve null sozinho.
// Ele troca de texto a cada slide, e é o próprio botão que cala a voz na
// troca (e no desmonte) — avançar a história nunca deixa a fala de trás.
import BotaoOuvir from './BotaoOuvir';

export default function StoriesReader({ visible, slides, onClose, titulo }) {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  // Fade sutil a cada troca de slide. Na web o driver nativo não existe e o
  // RNW cai no driver JS com aviso no console — mesma decisão comentada em
  // components/BreathGuide.js: true onde existe de verdade, false na web.
  const fade = useRef(new Animated.Value(1)).current;

  const lista = Array.isArray(slides) ? slides.filter(Boolean) : [];
  const total = lista.length;
  // Clampa em vez de confiar: se a lista mudar com o leitor aberto (troca de
  // idioma, releitura), um index antigo não pode apontar pro vazio.
  const atual = Math.min(index, Math.max(total - 1, 0));
  const ehUltimo = atual >= total - 1;

  // Abrir sempre recomeça do primeiro slide — reabrir uma história no meio é
  // o comportamento de quem perdeu o fio, não de quem pediu pra rever.
  useEffect(() => {
    if (visible) setIndex(0);
  }, [visible]);

  useEffect(() => {
    if (!visible) return undefined;
    fade.setValue(0);
    const anim = Animated.timing(fade, {
      toValue: 1,
      duration: 200,
      useNativeDriver: Platform.OS !== 'web',
    });
    anim.start();
    return () => anim.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atual, visible]);

  const avancar = () => {
    if (!ehUltimo) setIndex(atual + 1);
  };
  const voltar = () => {
    if (atual > 0) setIndex(atual - 1);
  };

  if (!total) return null;

  const contador = t('stories.contador', { i: atual + 1, n: total });

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      transparent={false}
      onRequestClose={onClose}
    >
      <LinearGradient colors={gradients.night} style={styles.root}>
        {/* AS ZONAS DE TOQUE — invisíveis, atrás de tudo: 35% à esquerda
            volta, 65% à direita avança (a mão segura o celular pela direita,
            e avançar é o gesto frequente). */}
        <TouchableOpacity
          style={styles.zonaVoltar}
          activeOpacity={1}
          onPress={voltar}
          accessibilityRole="button"
          accessibilityLabel={t('stories.voltar')}
          accessibilityHint={contador}
        />
        <TouchableOpacity
          style={styles.zonaAvancar}
          activeOpacity={1}
          onPress={avancar}
          accessibilityRole="button"
          accessibilityLabel={t('stories.avancar')}
          accessibilityHint={contador}
        />

        {/* O TEXTO, no terço inferior — pointerEvents none deixa o toque
            atravessar até as zonas. O contador vai no accessibilityLabel:
            quem ouve a tela sabe onde está na história. */}
        <Animated.View pointerEvents="none" style={[styles.corpo, { opacity: fade }]}>
          <View style={styles.respiro} />
          <View style={styles.textoWrap}>
            <Text style={styles.texto} accessibilityLabel={`${contador}. ${lista[atual]}`}>
              {lista[atual]}
            </Text>
          </View>
        </Animated.View>

        {/* O OUVIR DO SLIDE ATUAL — o corpo inteiro é pointerEvents="none"
            (o toque precisa atravessar até as zonas), então o botão mora em
            CAMADA própria, depois das zonas na árvore: ela espelha o flex do
            corpo (respiro 1.4 / texto 1) pra pousar o botão logo acima do
            texto, e é toda box-none — só a pill recebe toque, o resto deixa
            o gesto de avançar/voltar passar. */}
        <View style={styles.camadaOuvir} pointerEvents="box-none">
          <View style={styles.ouvirZona} pointerEvents="box-none">
            <BotaoOuvir texto={lista[atual]} />
          </View>
          <View style={styles.ouvirResto} pointerEvents="none" />
        </View>

        {/* O TOPO — barras de progresso (atual e passadas cheias, futuras a
            30%) e o X. Depois das zonas na árvore, então o toque é dele. */}
        <View style={[styles.topo, { paddingTop: insets.top + 14 }]}>
          <View style={styles.barras}>
            {lista.map((_, i) => (
              <View key={i} style={[styles.barra, i > atual && styles.barraFutura]} />
            ))}
          </View>
          <View style={styles.topoLinha}>
            {titulo ? (
              <Text style={styles.titulo} numberOfLines={1}>
                {titulo}
              </Text>
            ) : (
              <View style={{ flex: 1 }} />
            )}
            <TouchableOpacity
              style={styles.fechar}
              activeOpacity={0.8}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('stories.fechar')}
            >
              <Ionicons name="close" size={26} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* O ÚLTIMO SLIDE fecha com botão dito com todas as letras — o toque
            à direita para de avançar e a saída vira gesto explícito. */}
        {ehUltimo && (
          <TouchableOpacity
            style={[styles.concluir, { bottom: insets.bottom + 28 }]}
            activeOpacity={0.85}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('stories.concluir')}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.concluirTexto}>{t('stories.concluir')}</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Zonas de toque: a assimetria 35/65 é a do gesto de stories.
  zonaVoltar: { position: 'absolute', top: 0, bottom: 0, left: 0, width: '35%' },
  zonaAvancar: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '65%' },

  corpo: { flex: 1, flexDirection: 'column' },
  // O respiro empurra o texto pro terço inferior: ~55% de céu vazio em cima.
  respiro: { flex: 1.4 },
  // A camada do Ouvir espelha corpo/respiro/textoWrap: mesmo flex, então o
  // fim da ouvirZona coincide com o começo do texto — o botão, ancorado no
  // fim dela, fica logo acima da primeira linha.
  camadaOuvir: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'column' },
  ouvirZona: { flex: 1.4, justifyContent: 'flex-end', alignItems: 'flex-start', paddingHorizontal: 28, paddingBottom: 12 },
  ouvirResto: { flex: 1 },
  textoWrap: { flex: 1, paddingHorizontal: 28, paddingBottom: 96, justifyContent: 'flex-start' },
  texto: { color: colors.text, fontSize: 23, lineHeight: 34, fontWeight: '500' },

  topo: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16 },
  barras: { flexDirection: 'row', gap: 4 },
  barra: { flex: 1, height: 3, borderRadius: 2, backgroundColor: colors.text },
  barraFutura: { opacity: 0.3 },
  topoLinha: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 10 },
  titulo: { flex: 1, color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  // Área de toque ≥44px pro X, como manda a regra de acessibilidade.
  fechar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  concluir: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingVertical: 13,
    paddingHorizontal: 28,
    minHeight: 44,
  },
  concluirTexto: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
