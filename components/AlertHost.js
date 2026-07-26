// Host único (montado 1x em App.js) que renderiza os pedidos de Alert.alert
// como um modal de verdade na web — ver lib/webAlert.js pro porquê.
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { subscribeAlertHost } from '../lib/webAlert';

function buttonColors(style) {
  if (style === 'destructive') return { bg: colors.red, text: '#fff', border: colors.red };
  if (style === 'cancel') return { bg: 'transparent', text: colors.textSecondary, border: colors.border };
  return { bg: colors.accent, text: '#fff', border: colors.accent };
}

export function AlertHost() {
  const [request, setRequest] = useState(null);

  useEffect(() => subscribeAlertHost(setRequest), []);

  if (!request) return null;

  const { title, message, buttons } = request;

  function press(btn) {
    setRequest(null);
    btn.onPress?.();
  }

  return (
    <Modal transparent animationType="fade" visible onRequestClose={() => setRequest(null)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttonRow}>
            {buttons.map((btn, i) => {
              const c = buttonColors(btn.style);
              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.85}
                  style={[styles.button, { backgroundColor: c.bg, borderColor: c.border, marginLeft: i === 0 ? 0 : 10 }]}
                  onPress={() => press(btn)}
                >
                  <Text style={[styles.buttonText, { color: c.text }]}>{btn.text || 'OK'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    width: '100%', maxWidth: 380, backgroundColor: colors.card, borderRadius: 20,
    borderWidth: 1, borderColor: colors.border, padding: 24,
  },
  title: { color: colors.text, fontSize: 17, fontWeight: '800', marginBottom: 8 },
  message: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1 },
  buttonText: { fontWeight: '700', fontSize: 14 },
});
