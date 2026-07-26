// Alert.alert é um no-op literal no react-native-web (a classe instalada só
// tem `static alert() {}`, ignora qualquer argumento) e este app roda só como
// web — todo Alert.alert com confirmação (logout, deletar conta, apagar post,
// instruções de instalar no iOS) ficava mudo em produção, sem erro nenhum
// (achado real de auditoria, 25/07/2026). Mesma assinatura do Alert do RN, só
// trocando o import nos call sites, pra não precisar reescrever cada tela.
import { Alert as NativeAlert, Platform } from 'react-native';

let listener = null;

export function subscribeAlertHost(fn) {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

function alert(title, message, buttons) {
  if (Platform.OS !== 'web') {
    return NativeAlert.alert(title, message, buttons);
  }
  const normalizedButtons = buttons && buttons.length ? buttons : [{ text: 'OK' }];
  if (!listener) {
    // AlertHost deveria estar sempre montado em App.js; se não estiver por
    // algum motivo, cai pro window.alert do browser em vez de ficar em silêncio.
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert([title, message].filter(Boolean).join('\n\n'));
    }
    return;
  }
  listener({ title, message, buttons: normalizedButtons });
}

export const Alert = { alert };
