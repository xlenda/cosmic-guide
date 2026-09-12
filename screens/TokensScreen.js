// MEUS TOKENS — o saldo e o extrato do que a pessoa ganhou e gastou.
//
// DIAGRAMAÇÃO (12/09/2026, lote de dado e número). Eram três caixas soltas
// sobre o mesmo chão: o cartão dourado do saldo, um link, e o card do
// histórico. Agora são DUAS faixas — o saldo e o extrato — e o olho lê a
// mudança de assunto sem precisar de um título "Histórico" fazendo esse
// trabalho sozinho.
//
// POR QUE NÃO TEM FILEIRA DE TRÊS AQUI, apesar de esta ser a tela mais
// numérica do lote: existe UM número real (o saldo). Ganhos e gastos totais
// seriam somas que nenhuma lib calcula hoje — inventar a soma pra encher três
// colunas é exatamente o que o guia proíbe ("se uma diagramação pedir um
// número que não existe, a diagramação muda, não o dado"). Uma coluna sozinha
// não é comparação, e a peça sabe disso: com menos de duas colunas ela não
// desenha.
//
// O EXTRATO NÃO VIROU TabelaDados, e é decisão: cada linha aqui tem TRÊS
// campos (motivo, data e o valor com sinal e cor) e um ícone de sentido. A
// tabela é rótulo→valor, de dois campos. Forçar a peça custaria a data ou a
// cor do sinal — é o conteúdo que mandaria na diagramação em vez do
// contrário. O que a linha ganhou foi a ESCALA: respiro de `space.bloco`,
// corpo na escala, e o fio entre linhas em vez de borda em volta.
//
// ESTADO VAZIO: a faixa do extrato fica `rasa` quando não há histórico. Sem
// isso, o convite de três linhas ("ainda não há movimentação") mora dentro de
// uma onda de altura inteira e a faixa vira bloco de cor sem conteúdo — o
// defeito que um revisor achou na Home.
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { ROUTES } from '../routes';
import { useLanguage } from '../context/LanguageContext';
import { getTokenBalance, getTokenHistory } from '../lib/tokens';

// Data/hora no formato de cada idioma (pt-BR segue DD/MM/AAAA exatamente como
// antes) e o conector ("às"/"a las"/"at") vindo do dicionário — data crua em
// formato brasileiro dentro de um app em inglês confunde mais do que ajuda.
const DATE_LOCALE = { pt: 'pt-BR', es: 'es-ES', en: 'en-US' };

function formatDate(iso, lang, t) {
  try {
    const locale = DATE_LOCALE[lang] || DATE_LOCALE.pt;
    const d = new Date(iso);
    const date = d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    return t('tokens.history.dateTime', { date, time });
  } catch {
    return '';
  }
}

function HistoryRow({ item, first }) {
  const { lang, t } = useLanguage();
  const positive = item.amount > 0;
  return (
    <View style={[styles.histRow, !first && styles.histRowBorder]}>
      <View style={[styles.histIcon, { backgroundColor: (positive ? colors.green : colors.red) + '22' }]}>
        <Ionicons name={positive ? 'add-circle' : 'remove-circle'} size={18} color={positive ? colors.green : colors.red} />
      </View>
      <View style={styles.histTexto}>
        <Text style={styles.histReason}>{item.reason}</Text>
        <Text style={styles.histDate}>{formatDate(item.date, lang, t)}</Text>
      </View>
      <Text style={[styles.histAmount, { color: positive ? colors.green : colors.red }]}>
        {positive ? '+' : ''}
        {item.amount}
      </Text>
    </View>
  );
}

export default function TokensScreen() {
  const navigation = useNavigation();
  const { t } = useLanguage();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  const load = useCallback(() => {
    getTokenBalance().then(setBalance);
    getTokenHistory().then(setHistory);
  }, []);

  // Recarrega toda vez que a tela ganha foco — o saldo pode ter mudado
  // enquanto a pessoa estava em outra tela (ganhou tokens numa leitura ou
  // gastou na Loja), então um useEffect simples (só no mount) ficaria com
  // dado velho ao voltar.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('tokens.header.title')}
        subtitle={t('tokens.header.subtitle')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity
            onPress={() => navigation.navigate(ROUTES.LOJA)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={t('tokens.seeShop')}
          >
            <Ionicons name="storefront" size={22} color={colors.text} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* FAIXA 1 — O SALDO. Uma ideia só: o número e onde gastá-lo. */}
        <FaixaCurva tom="dourado" semente="tokens-saldo" estiloCorpo={styles.faixaCorpo}>
          <View style={styles.balanceWrap}>
            <LinearGradient colors={gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
              <View style={styles.balanceIconWrap}>
                <Ionicons name="sparkles" size={30} color="#fff" />
              </View>
              <Text style={styles.balanceValue}>{balance}</Text>
              <Text style={styles.balanceLabel}>{t('tokens.balanceLabel')}</Text>
            </LinearGradient>
          </View>

          <TouchableOpacity style={styles.shopLink} activeOpacity={0.8} onPress={() => navigation.navigate(ROUTES.LOJA)}>
            <Ionicons name="storefront-outline" size={16} color={colors.accent} />
            <Text style={styles.shopLinkText}>{t('tokens.seeShop')}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </TouchableOpacity>
        </FaixaCurva>

        {/* FAIXA 2 — O EXTRATO. `rasa` no vazio: o convite é curto demais pra
            sustentar uma onda de altura inteira. */}
        <FaixaCurva
          tom="ameixa"
          semente="tokens-extrato"
          grude
          rasa={history.length === 0}
          estiloCorpo={styles.faixaCorpo}
        >
          <Text style={styles.sectionTitle}>{t('tokens.historyTitle')}</Text>
          {history.length === 0 ? (
            <ColunaLeitura centralizado style={styles.emptyWrap}>
              <Ionicons name="hourglass-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>{t('tokens.empty')}</Text>
              {/* O vazio PEDE uma leitura, mas o único caminho da tela era a
                  Loja — que só serve pra gastar token que ainda não existe.
                  Este botão leva onde se GANHA (cards de leitura + missões
                  diárias na Home). Salto de aba: Tokens vive no ProfileStack. */}
              <TouchableOpacity
                style={styles.emptyBtn}
                activeOpacity={0.85}
                accessibilityRole="button"
                onPress={() => navigation.getParent()?.navigate(ROUTES.HOME_TAB, { screen: ROUTES.HOME_MAIN })}
              >
                <Ionicons name="sparkles" size={14} color="#fff" />
                <Text style={styles.emptyBtnText}>{t('tokens.emptyCta')}</Text>
              </TouchableOpacity>
            </ColunaLeitura>
          ) : (
            <View style={styles.extrato}>
              {history.map((item, idx) => (
                <HistoryRow key={`${item.date}-${idx}`} item={item} first={idx === 0} />
              ))}
            </View>
          )}
        </FaixaCurva>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: space.fimDaLista },

  faixaCorpo: { paddingTop: space.secao },

  balanceWrap: { borderRadius: space.entre, overflow: 'hidden' },
  balanceCard: { paddingVertical: space.secao, alignItems: 'center' },
  balanceIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.dentro,
  },
  // 40/46: o número de cartaz do saldo, deliberadamente ACIMA da escala (que
  // termina no display 32, título de primeira dobra — não cartaz dentro de um
  // cartão dourado de tela cheia).
  balanceValue: { color: '#fff', fontSize: 40, lineHeight: 46, fontWeight: '800' },
  balanceLabel: { ...type.apoio, color: 'rgba(255,255,255,0.85)', marginTop: space.grudado },

  shopLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.junto,
    paddingVertical: space.dentro,
    marginTop: space.bloco,
  },
  shopLinkText: { ...type.botao, color: colors.accent },

  sectionTitle: { ...type.secao, color: colors.text },

  // O extrato não tem mais borda em volta: a faixa JÁ é o chão dele. Card
  // dentro de faixa é moldura dentro de moldura.
  extrato: { marginTop: space.bloco },
  histRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.bloco },
  histRowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  histIcon: {
    width: 32, height: 32, borderRadius: space.dentro,
    justifyContent: 'center', alignItems: 'center', marginRight: space.dentro,
  },
  histTexto: { flex: 1 },
  histReason: { ...type.corpoCurto, color: colors.text },
  histDate: { ...type.nota, color: colors.textMuted, marginTop: space.grudado },
  histAmount: { ...type.cartao, marginLeft: space.dentro },

  emptyWrap: { marginTop: space.entre, paddingBottom: space.bloco },
  emptyText: { ...type.corpoCurto, color: colors.textMuted, textAlign: 'center', marginTop: space.dentro },
  // Mesmo botão sólido de ação da Loja (redeemBtn/wallBtn) — telas irmãs do
  // mesmo grupo, sem visual novo.
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.junto,
    backgroundColor: colors.accent,
    borderRadius: space.dentro,
    paddingVertical: space.dentro,
    paddingHorizontal: space.bloco,
    marginTop: space.entre,
  },
  emptyBtnText: { ...type.botao, color: '#fff' },
});
