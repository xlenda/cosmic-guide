import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors } from '../theme';
import { createScratchTiles, scratchIndexesAtPoint, scratchProgress } from '../lib/scratchReveal';

const COLUMNS = 6;
const ROWS = 8;
const REVEAL_AT = 0.58;

// Raspagem sem canvas: uma grade de pequenas placas cobre o conteúdo real e
// desaparece sob o dedo. Funciona no RN nativo e na web sem window/document.
// O conteúdo já está renderizado por baixo; não há loading falso nem resultado
// trocado depois do gesto.
export default function ScratchRevealCard({
  children,
  revealed,
  onReveal,
  resetKey,
  themeColor = colors.accent,
  scratchLabel,
  tapLabel,
  accessibilityLabel,
  testID,
  style,
}) {
  const tiles = useMemo(() => createScratchTiles(COLUMNS, ROWS), []);
  const layoutRef = useRef({ width: 0, height: 0 });
  const completedRef = useRef(!!revealed);
  const startedRef = useRef(false);
  const clearedRef = useRef(new Set());
  const [cleared, setCleared] = useState(() => new Set());

  useEffect(() => {
    completedRef.current = !!revealed;
    if (!revealed) {
      startedRef.current = false;
      clearedRef.current = new Set();
      setCleared(clearedRef.current);
    }
  }, [revealed, resetKey]);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    clearedRef.current = new Set(tiles.map((tile) => tile.index));
    setCleared(clearedRef.current);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    if (typeof onReveal === 'function') onReveal();
  }, [onReveal, tiles]);

  const scratchAt = useCallback((event) => {
    if (completedRef.current) return;
    const point = event?.nativeEvent || {};
    if (!startedRef.current) {
      startedRef.current = true;
      Haptics.selectionAsync().catch(() => {});
    }
    const indexes = scratchIndexesAtPoint({
      x: Number(point.locationX),
      y: Number(point.locationY),
      width: layoutRef.current.width,
      height: layoutRef.current.height,
      columns: COLUMNS,
      rows: ROWS,
      radius: 1,
    });
    if (indexes.length === 0) return;
    const next = new Set(clearedRef.current);
    indexes.forEach((index) => next.add(index));
    clearedRef.current = next;
    setCleared(next);
    const shouldFinish = scratchProgress(next.size, tiles.length) >= REVEAL_AT;
    if (shouldFinish) finish();
  }, [finish, tiles.length]);

  const panResponder = useMemo(() => PanResponder.create({
    // O toque simples fica com o botão acessível de fallback. A raspagem só
    // assume o gesto quando o dedo realmente se move; assim "toque para abrir"
    // é uma ação verdadeira também na web e não apenas um texto na carta.
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: () => !completedRef.current,
    onPanResponderGrant: scratchAt,
    onPanResponderMove: scratchAt,
    onPanResponderTerminationRequest: () => true,
  }), [scratchAt]);

  const progress = scratchProgress(cleared.size, tiles.length);

  return (
    <View
      testID={testID}
      style={[styles.root, style]}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        layoutRef.current = { width, height };
      }}
    >
      {children}
      {!revealed && (
        <View
          style={StyleSheet.absoluteFill}
          {...panResponder.panHandlers}
          accessible
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel || scratchLabel}
          accessibilityHint={tapLabel}
          onAccessibilityTap={finish}
        >
          {tiles.map((tile) => (
            cleared.has(tile.index) ? null : (
              <View
                key={tile.index}
                pointerEvents="none"
                style={[
                  styles.tile,
                  {
                    left: tile.left,
                    top: tile.top,
                    width: tile.width,
                    height: tile.height,
                    backgroundColor: tile.row % 2 === 0 ? '#261746' : '#301B58',
                    borderColor: `${themeColor}35`,
                  },
                ]}
              />
            )
          ))}
          {progress < 0.12 && (
            <View pointerEvents="none" style={styles.hint}>
              <Ionicons name="finger-print" size={24} color={themeColor} />
              <Text style={styles.hintText}>{scratchLabel}</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.tapFallback}
            activeOpacity={0.8}
            onPress={finish}
            accessibilityRole="button"
            accessibilityLabel={tapLabel}
          >
            <Text style={styles.tapFallbackText}>{tapLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: 'relative', overflow: 'hidden' },
  tile: { position: 'absolute', borderWidth: 0.35 },
  hint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  hintText: { color: '#fff', fontSize: 11, lineHeight: 14, fontWeight: '800', textAlign: 'center', marginTop: 5 },
  tapFallback: {
    position: 'absolute', left: 6, right: 6, bottom: 5,
    alignItems: 'center', paddingVertical: 4,
    borderRadius: 8, backgroundColor: 'rgba(14,8,33,0.78)',
  },
  tapFallbackText: { color: colors.textSecondary, fontSize: 9, fontWeight: '700', textAlign: 'center' },
});
