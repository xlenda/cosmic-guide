import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import Svg, {
  Defs,
  G,
  LinearGradient,
  Mask,
  Path,
  Pattern,
  Rect,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme';
import {
  createScratchTiles,
  scratchIndexesAlongSegment,
  scratchProgress,
} from '../lib/scratchReveal';

const COLUMNS = 24;
const ROWS = 36;
const BRUSH_RADIUS = 24;
const REVEAL_AT = 0.55;

// O conteúdo real já nasce por baixo do véu. A grade fina mede a área revelada,
// mas não desenha a cobertura: uma máscara SVG recorta o traço contínuo e
// arredondado do dedo. Assim o gesto parece raspagem, nunca uma grade de blocos.
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
  const lastPointRef = useRef(null);
  const touchPointRef = useRef(null);
  const hapticMilestoneRef = useRef(0);
  const clearedRef = useRef(new Set());
  const scratchPathRef = useRef('');
  const renderFrameRef = useRef(null);
  const veilOpacity = useRef(new Animated.Value(revealed ? 0 : 1)).current;
  const [cleared, setCleared] = useState(() => new Set());
  const [scratchPath, setScratchPath] = useState('');
  const [touchPoint, setTouchPoint] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    let active = true;
    let subscription;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((enabled) => {
        if (active) setReducedMotion(!!enabled);
      })
      .catch(() => {});
    subscription = AccessibilityInfo.addEventListener?.('reduceMotionChanged', (enabled) => {
      if (active) setReducedMotion(!!enabled);
    });
    return () => {
      active = false;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => () => {
    if (renderFrameRef.current === null) return;
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(renderFrameRef.current);
    else clearTimeout(renderFrameRef.current);
  }, []);

  useEffect(() => {
    completedRef.current = !!revealed;
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setCompleting(false);
    veilOpacity.setValue(revealed ? 0 : 1);
    if (!revealed) {
      if (renderFrameRef.current !== null) {
        if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(renderFrameRef.current);
        else clearTimeout(renderFrameRef.current);
        renderFrameRef.current = null;
      }
      startedRef.current = false;
      hapticMilestoneRef.current = 0;
      clearedRef.current = new Set();
      scratchPathRef.current = '';
      setCleared(clearedRef.current);
      setScratchPath('');
    }
  }, [revealed, resetKey, veilOpacity]);

  const scheduleClearedRender = useCallback(() => {
    if (renderFrameRef.current !== null) return;
    const schedule = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (callback) => setTimeout(callback, 16);
    renderFrameRef.current = schedule(() => {
      renderFrameRef.current = null;
      setCleared(new Set(clearedRef.current));
      setScratchPath(scratchPathRef.current);
      setTouchPoint(touchPointRef.current);
    });
  }, []);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setCompleting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.timing(veilOpacity, {
      toValue: 0,
      duration: reducedMotion ? 80 : 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start(() => {
      if (typeof onReveal === 'function') onReveal();
    });
  }, [onReveal, reducedMotion, veilOpacity]);

  const scratchAt = useCallback((event) => {
    if (completedRef.current) return;
    const point = event?.nativeEvent || {};
    const x = Number(point.locationX);
    const y = Number(point.locationY);
    if (![x, y].every(Number.isFinite)) return;

    if (!startedRef.current) {
      startedRef.current = true;
      Haptics.selectionAsync().catch(() => {});
    }

    const previous = lastPointRef.current;
    if (previous && Math.hypot(x - previous.x, y - previous.y) < 2.5) {
      touchPointRef.current = { x, y };
      scheduleClearedRender();
      return;
    }
    const pointToken = `${x.toFixed(1)} ${y.toFixed(1)}`;
    if (previous) {
      scratchPathRef.current = `${scratchPathRef.current} L ${pointToken}`;
    } else {
      scratchPathRef.current = `${scratchPathRef.current}${scratchPathRef.current ? ' ' : ''}M ${pointToken} L ${pointToken}`;
    }
    const indexes = scratchIndexesAlongSegment({
      fromX: previous?.x,
      fromY: previous?.y,
      toX: x,
      toY: y,
      width: layoutRef.current.width,
      height: layoutRef.current.height,
      columns: COLUMNS,
      rows: ROWS,
      brushRadius: BRUSH_RADIUS,
    });
    lastPointRef.current = { x, y };
    touchPointRef.current = { x, y };
    scheduleClearedRender();
    if (indexes.length === 0) return;

    const next = new Set(clearedRef.current);
    indexes.forEach((index) => next.add(index));
    if (next.size === clearedRef.current.size) return;
    clearedRef.current = next;

    const nextProgress = scratchProgress(next.size, tiles.length);
    const milestone = nextProgress >= 0.45 ? 2 : nextProgress >= 0.25 ? 1 : 0;
    if (milestone > hapticMilestoneRef.current) {
      hapticMilestoneRef.current = milestone;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (nextProgress >= REVEAL_AT) finish();
  }, [finish, scheduleClearedRender, tiles.length]);

  const endGesture = useCallback(() => {
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
  }, []);

  const panResponder = useMemo(() => PanResponder.create({
    // Um toque solto não abre a carta. A cobertura só assume o gesto depois
    // de movimento real; a alternativa de acesso é o botão explícito abaixo.
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gestureState) => (
      !completedRef.current && Math.hypot(gestureState.dx, gestureState.dy) >= 4
    ),
    onPanResponderGrant: scratchAt,
    onPanResponderMove: scratchAt,
    onPanResponderRelease: endGesture,
    onPanResponderTerminate: endGesture,
    onPanResponderTerminationRequest: () => false,
  }), [endGesture, scratchAt]);

  const progress = scratchProgress(cleared.size, tiles.length);
  const idBase = String(testID || 'scratch-card').replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `${idBase}-mask`;
  const foilId = `${idBase}-foil`;
  const sheenId = `${idBase}-sheen`;
  const grainId = `${idBase}-grain`;

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
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.veil,
            Platform.OS === 'web' && styles.webVeil,
            { opacity: veilOpacity },
          ]}
          {...panResponder.panHandlers}
          accessible={false}
        >
          <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#2E2038" />
                <Stop offset="0.28" stopColor="#715374" />
                <Stop offset="0.5" stopColor="#A56B87" />
                <Stop offset="0.7" stopColor="#5B456B" />
                <Stop offset="1" stopColor="#30213B" />
              </LinearGradient>
              <LinearGradient id={sheenId} x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor="#F2C879" stopOpacity="0.04" />
                <Stop offset="0.46" stopColor="#FFF7E6" stopOpacity="0.28" />
                <Stop offset="0.54" stopColor="#FFF7E6" stopOpacity="0.04" />
                <Stop offset="1" stopColor="#F4A9C7" stopOpacity="0.18" />
              </LinearGradient>
              <Pattern id={grainId} width="28" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(32)">
                <Rect width="2" height="28" fill="#FFF8E8" opacity="0.045" />
              </Pattern>
              <Mask
                id={maskId}
                x="0"
                y="0"
                width="100%"
                height="100%"
                maskUnits="userSpaceOnUse"
                maskType="luminance"
              >
                <Rect x="0" y="0" width="100%" height="100%" fill="#FFFFFF" />
                {!!scratchPath && (
                  <Path
                    d={scratchPath}
                    fill="none"
                    stroke="#000000"
                    strokeWidth={BRUSH_RADIUS * 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Mask>
            </Defs>
            <G mask={`url(#${maskId})`}>
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${foilId})`} />
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${sheenId})`} />
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${grainId})`} />
            </G>
          </Svg>

          {touchPoint && !reducedMotion && !completing && (
            <View
              pointerEvents="none"
              style={[
                styles.brush,
                {
                  left: touchPoint.x,
                  top: touchPoint.y,
                  borderColor: `${themeColor}AA`,
                  backgroundColor: `${themeColor}24`,
                },
              ]}
            />
          )}

          {progress < 0.08 && !completing && (
            <View pointerEvents="none" style={styles.hint}>
              <View style={[styles.orbit, { borderColor: `${themeColor}88` }]}>
                <Ionicons name="finger-print" size={28} color={themeColor} />
              </View>
              <Text style={styles.hintText}>{scratchLabel}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <View pointerEvents="none" style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%`, backgroundColor: themeColor }]} />
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.tapFallback, pressed && styles.tapFallbackPressed]}
              onPress={finish}
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabel || tapLabel}
              accessibilityHint={scratchLabel}
              disabled={completing}
            >
              <Text style={styles.tapFallbackText}>{tapLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#160E22',
  },
  veil: { overflow: 'hidden' },
  webVeil: {
    touchAction: 'none',
    cursor: 'crosshair',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  hint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 42,
  },
  orbit: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(20, 11, 30, 0.42)',
  },
  hintText: {
    color: '#FFF9F0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 5,
  },
  brush: {
    position: 'absolute',
    width: BRUSH_RADIUS * 2,
    height: BRUSH_RADIUS * 2,
    marginLeft: -BRUSH_RADIUS,
    marginTop: -BRUSH_RADIUS,
    borderRadius: BRUSH_RADIUS,
    borderWidth: 1.5,
    shadowColor: '#F8D99A',
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(18, 10, 28, 0.58)',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  tapFallback: {
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  tapFallbackPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  tapFallbackText: { color: '#F7E8CD', fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
