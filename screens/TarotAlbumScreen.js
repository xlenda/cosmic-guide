import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Modal, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { getCollection, COLLECTION_GROUPS, COLLECTION_TOTAL } from '../lib/tarotCollection';
import { getTarotImage } from '../lib/tarotImages';

// Álbum das 78 Cartas — mostra a coleção de cartas que a pessoa JÁ VIU em
// tiragens reais (lib/tarotCollection.js). Carta nunca vista aparece como
// verso genérico, sem revelar qual é: o mistério de "qual carta falta" é o
// que dá vontade de voltar pra tirar de novo — mostrar silhueta/nome mataria
// a graça e ainda daria spoiler do baralho.

// Ícone da seção: naipes usam o glifo da própria carta do deck (todas as
// cartas de um naipe compartilham o mesmo icon) — evita manter uma lista
// paralela que pode divergir do baralho. Maiores não têm ícone único, 'star'
// é escolha local de UI.
function groupIcon(group) {
  return group.key === 'maiores' ? 'star' : group.cards[0].icon;
}

export default function TarotAlbumScreen() {
  const navigation = useNavigation();
  const [seenSet, setSeenSet] = useState(new Set());
  const [selected, setSelected] = useState(null);

  // Recarrega no foco (não só no mount) — a pessoa pode tirar cartas no Tarô
  // e voltar pro álbum na mesma sessão esperando ver o progresso novo.
  useFocusEffect(
    useCallback(() => {
      let active = true;
      getCollection().then(({ seenIds }) => {
        if (active) setSeenSet(new Set(seenIds));
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const seenTotal = seenSet.size;
  const missing = COLLECTION_TOTAL - seenTotal;
  const pct = Math.round((seenTotal / COLLECTION_TOTAL) * 100);

  const openCard = (card) => {
    Haptics.selectionAsync();
    setSelected(card);
  };

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Álbum das 78 Cartas"
        subtitle="Sua coleção de cartas reveladas"
        onBack={() => navigation.goBack()}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressCount}>{seenTotal}/{COLLECTION_TOTAL}</Text>
            <Text style={styles.progressPct}>{pct}%</Text>
          </View>
          <View style={styles.progressTrack}>
            {/* width 0 some o gradiente por completo — sem barra "fantasma" com coleção zerada */}
            {seenTotal > 0 && (
              <LinearGradient
                colors={gradients.gold}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${pct}%` }]}
              />
            )}
          </View>
          <Text style={styles.incentive}>
            {missing > 0
              ? `Faltam ${missing} ${missing === 1 ? 'carta' : 'cartas'} pra completar seu álbum — cada tiragem pode revelar cartas novas.`
              : 'Álbum completo! Todas as 78 cartas do baralho já passaram pelas suas mãos.'}
          </Text>
          {missing > 0 && (
            <Text style={styles.bonusNote}>
              Complete os 22 Arcanos Maiores (+100 tokens) ou um naipe inteiro (+50 tokens) — o prêmio cai sozinho na hora.
            </Text>
          )}
        </View>

        {COLLECTION_GROUPS.map((group) => {
          const groupSeen = group.cards.filter((card) => seenSet.has(card.id)).length;
          return (
            <View key={group.key} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name={groupIcon(group)} size={16} color={colors.gold} />
                <Text style={styles.sectionTitle}>{group.label}</Text>
                <Text style={styles.sectionCount}>{groupSeen}/{group.cards.length}</Text>
              </View>
              <View style={styles.grid}>
                {group.cards.map((card) => {
                  const seen = seenSet.has(card.id);
                  return (
                    <TouchableOpacity
                      key={card.id}
                      style={styles.thumb}
                      activeOpacity={0.85}
                      disabled={!seen}
                      onPress={() => openCard(card)}
                      accessibilityRole="button"
                      accessibilityLabel={seen ? card.name : 'Carta ainda não revelada'}
                    >
                      {seen ? (
                        <Image source={getTarotImage(card.id)} style={styles.thumbImage} resizeMode="cover" />
                      ) : (
                        // Mesmo visual do verso das cartas no TarotScreen
                        // (gradiente escuro + sparkles) — cores hardcoded lá
                        // também, manter iguais pro verso ser reconhecível.
                        <LinearGradient colors={['#2A1D52', '#1A1235']} style={styles.thumbBack}>
                          <Ionicons name="sparkles" size={18} color={colors.purple} />
                        </LinearGradient>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={!!selected}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          {selected && (
            <View style={styles.modalCard}>
              <Image source={getTarotImage(selected.id)} style={styles.modalImage} resizeMode="cover" />
              <Text style={styles.modalName}>{selected.name}</Text>
              <Text style={styles.modalHint}>Toque fora da carta pra fechar</Text>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  progressCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  progressCount: { color: colors.text, fontSize: 22, fontWeight: '800' },
  progressPct: { color: colors.gold, fontSize: 14, fontWeight: '700' },
  progressTrack: { height: 10, borderRadius: 5, backgroundColor: colors.surface, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  incentive: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 12 },
  bonusNote: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 6 },
  section: { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionTitle: { color: colors.text, fontSize: 15, fontWeight: '800', flex: 1 },
  sectionCount: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // 23% + gap de 8 fecha 4 colunas na largura de celular; em telas muito
  // estreitas quebra pra 3 sozinho (flexWrap), sem conta manual de largura.
  thumb: {
    width: '23%',
    aspectRatio: 0.66,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  thumbImage: { width: '100%', height: '100%' },
  thumbBack: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8,4,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: { alignItems: 'center' },
  modalImage: {
    width: 240,
    aspectRatio: 0.62,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  modalName: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 16, textAlign: 'center' },
  modalHint: { color: colors.textMuted, fontSize: 12, marginTop: 6 },
});
