// Guarda-chuva de erro em torno do <App /> inteiro. Sem isso, qualquer exceção
// de render (import quebrado, hook mal usado, etc.) derruba a árvore toda e o
// usuário vê uma tela branca silenciosa — exatamente o tipo de sintoma que fez o
// bug do cache do Cloudflare (index.html velho apontando pra bundle 404) parecer
// um bug de React por horas. Com isso, um crash real de render vira uma mensagem
// visível em vez de branco.
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

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
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Algo deu errado</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Erro inesperado ao carregar o app.'}
          </Text>
          <Text style={styles.hint}>Recarregue a página. Se persistir, avise o suporte.</Text>
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
});
