import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function PasswordRecoveryModal() {
  const { passwordRecovery, updatePassword, finishPasswordRecovery } = useAuth();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    if (saving) return;
    setError('');
    if (password.length < 6) {
      setError(t('login.error.weakPassword'));
      return;
    }
    if (password !== confirmation) {
      setError(t('login.recovery.mismatch'));
      return;
    }
    setSaving(true);
    const result = await updatePassword(password);
    setSaving(false);
    if (result?.error) {
      setError(t(result.error));
      return;
    }
    setPassword('');
    setConfirmation('');
    finishPasswordRecovery();
  }

  return (
    <Modal
      visible={!!passwordRecovery}
      transparent
      animationType="fade"
      onRequestClose={() => {}}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.card} accessibilityViewIsModal>
          <View style={styles.icon}>
            <Ionicons name="key" size={24} color={colors.gold} />
          </View>
          <Text style={styles.title}>{t('login.recovery.title')}</Text>
          <Text style={styles.body}>{t('login.recovery.body')}</Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              placeholder={t('login.recovery.newPassword')}
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!show}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="newPassword"
            />
            <TouchableOpacity
              onPress={() => setShow((value) => !value)}
              style={styles.eye}
              accessibilityRole="button"
              accessibilityLabel={t(show ? 'login.hidePassword' : 'login.showPassword')}
            >
              <Ionicons name={show ? 'eye-off' : 'eye'} size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TextInput
            value={confirmation}
            onChangeText={setConfirmation}
            style={styles.input}
            placeholder={t('login.recovery.confirmPassword')}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!show}
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="newPassword"
            onSubmitEditing={save}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, saving && styles.buttonDisabled]}
            onPress={save}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('login.recovery.save')}</Text>}
          </TouchableOpacity>
          <Text style={styles.note}>{t('login.recovery.note')}</Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', padding: 22, backgroundColor: 'rgba(5,3,14,0.86)' },
  card: { backgroundColor: colors.surface, borderRadius: 22, borderWidth: 1, borderColor: colors.border, padding: 22 },
  icon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gold + '18', alignSelf: 'center' },
  title: { color: colors.text, fontSize: 22, lineHeight: 28, fontWeight: '800', textAlign: 'center', marginTop: 14 },
  body: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 7, marginBottom: 18 },
  inputWrap: { position: 'relative', marginBottom: 12 },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceElevated, color: colors.text, paddingHorizontal: 14, paddingRight: 48, fontSize: 15 },
  eye: { position: 'absolute', right: 4, top: 3, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  error: { color: colors.red, fontSize: 13, lineHeight: 18, textAlign: 'center', marginTop: 12 },
  button: { minHeight: 50, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  note: { color: colors.textMuted, fontSize: 11, lineHeight: 16, textAlign: 'center', marginTop: 12 },
});
