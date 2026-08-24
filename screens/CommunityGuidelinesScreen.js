import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORT_EMAIL, SUPPORT_MAILTO } from '../lib/supportContact';

const RULES = ['respect', 'privacy', 'safety', 'integrity', 'symbolic'];
const MODERATION = ['reports', 'consequences', 'accountDeletion'];

function GuidelineRow({ icon, title, body, last }) {
  return (
    <View style={[styles.row, !last && styles.rowBorder]}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.paragraph}>{body}</Text>
      </View>
    </View>
  );
}

const RULE_ICONS = {
  respect: 'people-outline',
  privacy: 'shield-checkmark-outline',
  safety: 'heart-outline',
  integrity: 'checkmark-circle-outline',
  symbolic: 'sparkles-outline',
};

const MODERATION_ICONS = {
  reports: 'flag-outline',
  consequences: 'hand-left-outline',
  accountDeletion: 'trash-outline',
};

export default function CommunityGuidelinesScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();

  return (
    <View style={styles.root}>
      <GradientHeader title={t('community.guidelines.header')} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>{t('community.guidelines.updated')}</Text>
        <Text style={styles.intro}>{t('community.guidelines.intro')}</Text>

        <View style={styles.notice}>
          <Ionicons name="eye-outline" size={20} color={colors.gold} />
          <View style={styles.noticeCopy}>
            <Text style={styles.noticeTitle}>{t('community.guidelines.before.title')}</Text>
            <Text style={styles.noticeBody}>{t('community.guidelines.before.body')}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>{t('community.guidelines.rules.title')}</Text>
        <View style={styles.card}>
          {RULES.map((rule, index) => (
            <GuidelineRow
              key={rule}
              icon={RULE_ICONS[rule]}
              title={t(`community.guidelines.${rule}.title`)}
              body={t(`community.guidelines.${rule}.body`)}
              last={index === RULES.length - 1}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t('community.guidelines.moderation.title')}</Text>
        <View style={styles.card}>
          {MODERATION.map((item, index) => (
            <GuidelineRow
              key={item}
              icon={MODERATION_ICONS[item]}
              title={t(`community.guidelines.${item}.title`)}
              body={t(`community.guidelines.${item}.body`)}
              last={index === MODERATION.length - 1}
            />
          ))}
        </View>

        <View style={styles.contactCard}>
          <Text style={styles.contactTitle}>{t('community.guidelines.contact.title')}</Text>
          <Text style={styles.contactBody}>
            {t('community.guidelines.contact.body', { email: SUPPORT_EMAIL })}
          </Text>
          <Pressable
            accessibilityRole="link"
            onPress={() => Linking.openURL(SUPPORT_MAILTO)}
            style={({ pressed }) => [styles.contactButton, pressed && styles.contactButtonPressed]}
          >
            <Ionicons name="mail-outline" size={16} color="#fff" />
            <Text style={styles.contactButtonText}>{t('community.guidelines.contact.cta')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 44 },
  eyebrow: {
    color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.1,
    textTransform: 'uppercase', marginBottom: 8,
  },
  intro: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, marginBottom: 18 },
  notice: {
    flexDirection: 'row', gap: 12, padding: 16, borderRadius: 16,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.gold + '55',
    marginBottom: 24,
  },
  noticeCopy: { flex: 1 },
  noticeTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 5 },
  noticeBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 10 },
  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, marginBottom: 24, overflow: 'hidden',
  },
  row: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIcon: {
    width: 34, height: 34, borderRadius: 11, backgroundColor: colors.accent + '22',
    justifyContent: 'center', alignItems: 'center',
  },
  rowCopy: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: 5 },
  paragraph: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  contactCard: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: 16, padding: 17,
  },
  contactTitle: { color: colors.text, fontSize: 15, fontWeight: '800', marginBottom: 6 },
  contactBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  contactButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, marginTop: 14,
  },
  contactButtonPressed: { opacity: 0.78 },
  contactButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
});
