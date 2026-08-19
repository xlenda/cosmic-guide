// components/ReportarIA.js
// Canal de denúncia de saída de IA. O núcleo do produto é texto gerado por IA
// (chat, leitura de foto, sonho, insight lapidado, síntese da semana) e a
// política de Conteúdo Gerado por IA do Google Play exige um mecanismo DENTRO
// do app pra sinalizar uma resposta ofensiva. Este link fica no rodapé de cada
// superfície que mostra saída de IA.
//
// A DENÚNCIA CARREGA O TEXTO DENUNCIADO (mudança de 19/08/2026). Antes ela
// virava só uma contagem anônima em funnel_events: a moderação recebia
// "alguém achou algo ofensivo no chat" e nada mais — inacionável, e a política
// do Google exige que o canal INFORME a moderação. Agora vai no contrato de
// moderação (POST /api/moderation/report, kind "ai"), com `detail` = a
// resposta da IA que a pessoa está denunciando. O que NÃO vai continua não
// indo: nada que a PESSOA escreveu, nenhum id de conta (kind "ai" não exige
// login). O texto sai só porque ela tocou no botão e escolheu o motivo.
import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../theme';
import { Alert } from '../lib/webAlert';
import { fetchWithTimeout } from '../lib/aiClient';
import { useLanguage } from '../context/LanguageContext';

const API_BASE = 'https://api.cosmicguide.cloud';

// DOIS motivos, não quatro: o Alert nativo do Android só tem três slots de
// botão (positivo/negativo/neutro) e o app vai pra Play Store como app nativo —
// o quarto botão simplesmente não apareceria no aparelho de quem denuncia.
const MOTIVOS = [
  { reason: 'ofensivo', key: 'report.reason.offensive' },
  { reason: 'impreciso', key: 'report.reason.wrong' },
];

// `kind` = qual superfície gerou o texto (chat, dream, palm_pintas...). Vai
// como targetId porque o `kind` do contrato de moderação é o tipo de alvo
// ("ai"), não a tela. `texto` = a resposta denunciada (opcional: superfícies
// que ainda não passam ficam só com a superfície e o motivo).
export default function ReportarIA({ kind, texto }) {
  const { t } = useLanguage();

  const enviar = async (reason) => {
    try {
      const resp = await fetchWithTimeout(
        `${API_BASE}/api/moderation/report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // 2000 chars: uma leitura inteira cabe e nenhum corpo absurdo passa.
          body: JSON.stringify({ kind: 'ai', targetId: kind, reason, detail: texto ? String(texto).slice(0, 2000) : undefined }),
        },
        10000
      );
      if (!resp.ok) throw new Error(`status ${resp.status}`);
      Alert.alert(t('report.thanks.title'), t('report.thanks.body'));
    } catch {
      // Sem esse aviso a denúncia falha em silêncio e a pessoa vai embora
      // achando que reportou — justamente o que a política não aceita.
      Alert.alert(t('report.fail.title'), t('report.fail.body'));
    }
  };

  const abrir = () =>
    Alert.alert(t('report.title'), t('report.body'), [
      ...MOTIVOS.map((m) => ({ text: t(m.key), onPress: () => enviar(m.reason) })),
      { text: t('report.cancel'), style: 'cancel' },
    ]);

  return (
    <TouchableOpacity
      style={styles.btn}
      activeOpacity={0.7}
      onPress={abrir}
      accessibilityRole="button"
      accessibilityLabel={t('report.cta')}
    >
      <Ionicons name="flag-outline" size={14} color={colors.textMuted} />
      <Text style={styles.txt}>{t('report.cta')}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // minHeight 48 + padding horizontal: o pre-launch report do Google reprova
  // alvo de toque abaixo de 48dp, e este é o controle que a POLÍTICA exige que
  // a pessoa consiga apertar. Antes tinha ~30px de altura e a largura do texto.
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  txt: { color: colors.textMuted, fontSize: 12, textDecorationLine: 'underline' },
});
