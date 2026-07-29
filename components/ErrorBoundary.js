// Guarda-chuva de erro em torno do <App /> inteiro. Sem isso, qualquer exceção
// de render (import quebrado, hook mal usado, etc.) derruba a árvore toda e o
// usuário vê uma tela branca silenciosa — exatamente o tipo de sintoma que fez o
// bug do cache do Cloudflare (index.html velho apontando pra bundle 404) parecer
// um bug de React por horas. Com isso, um crash real de render vira uma mensagem
// visível em vez de branco.
import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../theme';
import { translate, DEFAULT_LANGUAGE, LANGUAGES } from '../lib/i18n';

// Contato de suporte — repetido aqui de propósito: este boundary é a última
// linha de defesa e não pode depender de nenhum outro módulo do app (o crash
// pode ter vindo justamente de um import quebrado).
const SUPPORT_MAILTO = 'mailto:contato@cosmicguide.cloud';

// Recarregar a raiz publicada, não a rota atual: em rota interna
// (/cosmic-guide/quiz) um reload cru bate num 404 do host estático, mesmo
// truque já usado em LojaScreen.js. Fora da web não existe reload de página,
// então o botão nem aparece.
function reloadApp() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  window.location.href = '/cosmic-guide/';
}

// Este boundary fica ACIMA do LanguageProvider (ver App.js) — de propósito: se
// o próprio provider for o que quebrou, ainda precisa ter alguém pra mostrar a
// mensagem. O preço é não ter o `t` do contexto aqui, então o idioma é
// detectado na mão, síncrono, com as mesmas duas primeiras regras do
// LanguageContext (?lang= da URL, depois o idioma do navegador). A preferência
// salva no AsyncStorage não entra: leitura async não dá pra fazer no meio de um
// render de crash. Fallback é sempre o português.
function crashLanguage() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return DEFAULT_LANGUAGE;
  try {
    const urlLang = new URLSearchParams(window.location.search).get('lang');
    if (LANGUAGES.includes(urlLang)) return urlLang;
    const locale = (navigator?.language || '').toLowerCase();
    if (locale.startsWith('es')) return 'es';
    if (locale.startsWith('en')) return 'en';
  } catch {}
  return DEFAULT_LANGUAGE;
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] app crashed:', error, info?.componentStack);
  }

  render() {
    if (this.state.error) {
      const t = (key) => translate(crashLanguage(), key);
      return (
        <View style={styles.root}>
          <Text style={styles.title}>{t('errorBoundary.title')}</Text>
          <Text style={styles.message}>
            {this.state.error?.message || t('errorBoundary.fallbackMessage')}
          </Text>
          <Text style={styles.hint}>{t('errorBoundary.hint')}</Text>
          {/* O texto acima pede DUAS ações ("recarregue", "avise o suporte") e
              a tela não tinha um único elemento tocável — era só três <Text>
              num <View>. Aqui não existe navigation (o boundary fica ACIMA do
              NavigationContainer), então as ações são reload e mailto. */}
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={reloadApp}>
              <Text style={styles.btnText}>{t('errorBoundary.reloadCta')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.ghostBtn}
            activeOpacity={0.7}
            onPress={() => Linking.openURL(SUPPORT_MAILTO)}
          >
            <Text style={styles.ghostBtnText}>{t('errorBoundary.supportCta')}</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: { color: colors.text, fontSize: 18, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  message: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 8 },
  hint: { color: colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 },
  btn: {
    backgroundColor: colors.accent, borderRadius: 14,
    paddingVertical: 13, paddingHorizontal: 30, marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  ghostBtn: { paddingVertical: 10, paddingHorizontal: 16, marginTop: 8 },
  ghostBtnText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
});
