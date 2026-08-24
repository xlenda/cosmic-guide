import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Line,
  Mask,
  Path,
  Pattern,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import useReducedMotion from '../hooks/useReducedMotion';
import {
  SCRATCH_BRUSH_RADIUS,
  SCRATCH_COLUMNS,
  SCRATCH_HAPTIC_PROGRESS_STEP,
  SCRATCH_REVEAL_PROGRESS,
  SCRATCH_ROWS,
  createScratchSvgIdBase,
  scratchHapticMilestone,
  scratchIndexesAlongSegment,
  scratchProgress,
} from '../lib/scratchReveal';

const MIN_PATH_POINT_DISTANCE = 4;
const HAPTIC_MIN_INTERVAL_MS = 90;
const METAL_GOLD = '#D8B16A';

function hapticPromise(stage) {
  if (Platform.OS === 'web') return Promise.resolve();
  try {
    if (
      Platform.OS === 'android'
      && typeof Haptics.performAndroidHapticsAsync === 'function'
      && Haptics.AndroidHaptics
    ) {
      const androidType = {
        start: Haptics.AndroidHaptics.Drag_Start,
        texture: Haptics.AndroidHaptics.Segment_Frequent_Tick,
        complete: Haptics.AndroidHaptics.Confirm,
      }[stage];
      if (androidType) return Haptics.performAndroidHapticsAsync(androidType);
    }

    if (stage === 'start') return Haptics.selectionAsync();
    if (stage === 'texture') return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    return Promise.resolve();
  }
}

// Haptic is reinforcement only. Web and devices with tactile feedback disabled
// remain fully usable and receive the same visual/result state.
function emitHaptic(stage) {
  Promise.resolve(hapticPromise(stage)).catch(() => {});
}

// O conteúdo real já nasce por baixo do véu. A grade fina mede a área revelada,
// mas não desenha a cobertura: uma máscara SVG recorta o traço contínuo e
// arredondado do dedo. Assim o gesto parece raspagem, nunca uma grade de blocos.
export default function ScratchRevealCard({
  children,
  revealed,
  onReveal,
  resetKey,
  scratchLabel,
  tapLabel,
  accessibilityLabel,
  revealAnnouncement,
  testID,
  style,
}) {
  const reactId = useId();
  const layoutRef = useRef({ width: 0, height: 0 });
  const mountedRef = useRef(true);
  const completedRef = useRef(!!revealed);
  const startedRef = useRef(false);
  const lastPointRef = useRef(null);
  const touchPointRef = useRef(null);
  const hapticMilestoneRef = useRef(0);
  const lastHapticAtRef = useRef(0);
  const clearedRef = useRef(new Set());
  const scratchPathRef = useRef('');
  const renderFrameRef = useRef(null);
  const completionAnimationRef = useRef(null);
  const veilOpacity = useRef(new Animated.Value(revealed ? 0 : 1)).current;
  const [clearedCount, setClearedCount] = useState(0);
  const [scratchPath, setScratchPath] = useState('');
  const [touchPoint, setTouchPoint] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [gestureActive, setGestureActive] = useState(false);
  const reducedMotion = useReducedMotion();
  const motionAllowed = reducedMotion === false;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      completionAnimationRef.current?.stop?.();
      if (renderFrameRef.current === null) return;
      if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(renderFrameRef.current);
      else clearTimeout(renderFrameRef.current);
    };
  }, []);

  useEffect(() => {
    completedRef.current = !!revealed;
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setCompleting(false);
    setGestureActive(false);
    completionAnimationRef.current?.stop?.();
    completionAnimationRef.current = null;
    veilOpacity.setValue(revealed ? 0 : 1);
    if (!revealed) {
      if (renderFrameRef.current !== null) {
        if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(renderFrameRef.current);
        else clearTimeout(renderFrameRef.current);
        renderFrameRef.current = null;
      }
      startedRef.current = false;
      hapticMilestoneRef.current = 0;
      lastHapticAtRef.current = 0;
      clearedRef.current = new Set();
      scratchPathRef.current = '';
      setClearedCount(0);
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
      if (!mountedRef.current) return;
      setClearedCount(clearedRef.current.size);
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
    setGestureActive(false);
    setCompleting(true);
    emitHaptic('complete');

    const animation = Animated.timing(veilOpacity, {
      toValue: 0,
      duration: motionAllowed ? 360 : 80,
      useNativeDriver: Platform.OS !== 'web',
    });
    completionAnimationRef.current = animation;
    animation.start(({ finished }) => {
      completionAnimationRef.current = null;
      if (!finished || !mountedRef.current) return;
      if (revealAnnouncement) {
        AccessibilityInfo.announceForAccessibility?.(revealAnnouncement);
      }
      if (typeof onReveal === 'function') onReveal();
    });
  }, [motionAllowed, onReveal, revealAnnouncement, veilOpacity]);

  const scratchAt = useCallback((xValue, yValue) => {
    if (completedRef.current) return;
    const x = Number(xValue);
    const y = Number(yValue);
    if (![x, y].every(Number.isFinite)) return;

    if (!startedRef.current) {
      startedRef.current = true;
      emitHaptic('start');
    }

    const previous = lastPointRef.current;
    if (previous && Math.hypot(x - previous.x, y - previous.y) < MIN_PATH_POINT_DISTANCE) {
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
      columns: SCRATCH_COLUMNS,
      rows: SCRATCH_ROWS,
      brushRadius: SCRATCH_BRUSH_RADIUS,
    });
    lastPointRef.current = { x, y };
    touchPointRef.current = { x, y };
    scheduleClearedRender();
    if (indexes.length === 0) return;

    const next = clearedRef.current;
    const previousSize = next.size;
    indexes.forEach((index) => next.add(index));
    if (next.size === previousSize) return;

    const nextProgress = scratchProgress(next.size, SCRATCH_COLUMNS * SCRATCH_ROWS);
    const milestone = scratchHapticMilestone(nextProgress, SCRATCH_HAPTIC_PROGRESS_STEP);
    const now = Date.now();
    if (
      nextProgress < SCRATCH_REVEAL_PROGRESS
      && milestone > hapticMilestoneRef.current
      && now - lastHapticAtRef.current >= HAPTIC_MIN_INTERVAL_MS
    ) {
      hapticMilestoneRef.current = milestone;
      lastHapticAtRef.current = now;
      emitHaptic('texture');
    }
    if (nextProgress >= SCRATCH_REVEAL_PROGRESS) finish();
  }, [finish, scheduleClearedRender]);

  const endGesture = useCallback(() => {
    lastPointRef.current = null;
    touchPointRef.current = null;
    setTouchPoint(null);
    setGestureActive(false);
  }, []);

  const panGesture = useMemo(() => Gesture.Pan()
    // Um toque solto não abre a carta. A cobertura só assume o gesto depois
    // de movimento real; a alternativa de acesso é o botão explícito abaixo.
    .enabled(!revealed && !completing)
    .minDistance(MIN_PATH_POINT_DISTANCE)
    .maxPointers(1)
    .shouldCancelWhenOutside(false)
    .runOnJS(true)
    .onStart((event) => {
      setGestureActive(true);
      scratchAt(event.x, event.y);
    })
    .onUpdate((event) => scratchAt(event.x, event.y))
    .onFinalize(endGesture), [completing, endGesture, revealed, scratchAt]);

  const progress = scratchProgress(clearedCount, SCRATCH_COLUMNS * SCRATCH_ROWS);
  const accessibleProgressPercent = completing
    ? 100
    : progress >= 0.5
      ? 50
      : progress >= 0.25 ? 25 : 0;
  const idBase = useMemo(
    () => createScratchSvgIdBase(testID, reactId),
    [reactId, testID],
  );
  const maskId = `${idBase}-mask`;
  const foilId = `${idBase}-foil`;
  const sheenId = `${idBase}-sheen`;
  const auraId = `${idBase}-aura`;
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
        <GestureDetector gesture={panGesture} touchAction="none">
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.veil,
              Platform.OS === 'web' && styles.webVeil,
              Platform.OS === 'web' && gestureActive && styles.webVeilActive,
              { opacity: veilOpacity },
            ]}
            accessible={false}
          >
          <Svg pointerEvents="none" width="100%" height="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id={foilId} x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor="#121416" />
                <Stop offset="0.25" stopColor="#4A4235" />
                <Stop offset="0.5" stopColor="#987342" />
                <Stop offset="0.72" stopColor="#534633" />
                <Stop offset="1" stopColor="#17191B" />
              </LinearGradient>
              <LinearGradient id={sheenId} x1="0" y1="1" x2="1" y2="0">
                <Stop offset="0" stopColor="#B88A4B" stopOpacity="0.06" />
                <Stop offset="0.46" stopColor="#FFF0C2" stopOpacity="0.3" />
                <Stop offset="0.54" stopColor="#FFF0C2" stopOpacity="0.04" />
                <Stop offset="1" stopColor="#A77A3E" stopOpacity="0.16" />
              </LinearGradient>
              <RadialGradient id={auraId} cx="50%" cy="42%" r="70%">
                <Stop offset="0" stopColor="#D2A65F" stopOpacity="0.2" />
                <Stop offset="0.52" stopColor="#FFF0C5" stopOpacity="0.055" />
                <Stop offset="1" stopColor="#101214" stopOpacity="0.36" />
              </RadialGradient>
              <Pattern id={grainId} width="34" height="34" patternUnits="userSpaceOnUse">
                <Circle cx="5" cy="7" r="0.9" fill="#FFF8E8" opacity="0.24" />
                <Circle cx="24" cy="13" r="0.6" fill="#FFF8E8" opacity="0.16" />
                <Circle cx="14" cy="29" r="0.75" fill="#F2C879" opacity="0.2" />
                <Path d="M 0 25 L 34 3" stroke="#FFF8E8" strokeWidth="0.7" opacity="0.035" />
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
                    strokeWidth={SCRATCH_BRUSH_RADIUS * 2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </Mask>
            </Defs>
            <G mask={`url(#${maskId})`}>
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${foilId})`} />
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${auraId})`} />
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${sheenId})`} />
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${grainId})`} />
              <Circle cx="50%" cy="41%" r="18%" fill="none" stroke="#E1BC78" strokeWidth="1" opacity="0.22" />
              <Circle cx="50%" cy="41%" r="9%" fill="none" stroke="#F4D99E" strokeWidth="0.8" opacity="0.28" />
              <Line x1="31%" y1="41%" x2="69%" y2="41%" stroke="#E1BC78" strokeWidth="0.7" opacity="0.2" />
              <Line x1="50%" y1="27%" x2="50%" y2="55%" stroke="#E1BC78" strokeWidth="0.7" opacity="0.2" />
              <Circle cx="35%" cy="33%" r="1.4" fill="#F4D99E" opacity="0.5" />
              <Circle cx="66%" cy="48%" r="1.1" fill="#F4D99E" opacity="0.44" />
              <Rect
                x="2%"
                y="1.25%"
                width="96%"
                height="97.5%"
                rx="18"
                fill="none"
                stroke="#F7DEAA"
                strokeWidth="1.2"
                opacity="0.32"
              />
            </G>
          </Svg>

          {touchPoint && motionAllowed && !completing && (
            <View
              pointerEvents="none"
              style={[
                styles.brush,
                {
                  left: touchPoint.x,
                  top: touchPoint.y,
                  borderColor: `${METAL_GOLD}AA`,
                  backgroundColor: `${METAL_GOLD}22`,
                },
              ]}
            />
          )}

          {progress < 0.08 && !completing && (
            <View pointerEvents="none" style={styles.hint}>
              <View style={styles.orbit}>
                <Ionicons name="finger-print" size={28} color={METAL_GOLD} />
              </View>
              <Text style={styles.hintText}>{scratchLabel}</Text>
            </View>
          )}

          <View style={styles.footer}>
            <View
              pointerEvents="none"
              style={styles.accessibleProgress}
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={scratchLabel}
              accessibilityLiveRegion="polite"
              accessibilityValue={{ min: 0, max: 100, now: accessibleProgressPercent }}
            />
            <Pressable
              style={({ pressed }) => [styles.tapFallback, pressed && styles.tapFallbackPressed]}
              onPress={finish}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={accessibilityLabel || tapLabel}
              accessibilityHint={scratchLabel}
              accessibilityState={{ disabled: completing }}
              focusable={!completing}
              disabled={completing}
            >
              <Text style={styles.tapFallbackText}>{tapLabel}</Text>
            </Pressable>
          </View>
          </Animated.View>
        </GestureDetector>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#111315',
  },
  veil: { overflow: 'hidden' },
  webVeil: {
    touchAction: 'none',
    cursor: 'grab',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  webVeilActive: { cursor: 'grabbing' },
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
    borderColor: 'rgba(216,177,106,0.62)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(17, 18, 19, 0.52)',
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
    width: SCRATCH_BRUSH_RADIUS * 2,
    height: SCRATCH_BRUSH_RADIUS * 2,
    marginLeft: -SCRATCH_BRUSH_RADIUS,
    marginTop: -SCRATCH_BRUSH_RADIUS,
    borderRadius: SCRATCH_BRUSH_RADIUS,
    borderWidth: 1,
    shadowColor: '#F8D99A',
    shadowOpacity: 0.42,
    shadowRadius: 10,
  },
  footer: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  accessibleProgress: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  tapFallback: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(216,177,106,0.38)',
    backgroundColor: 'rgba(17,18,19,0.78)',
    paddingHorizontal: 12,
  },
  tapFallbackPressed: { opacity: 0.78, transform: [{ scale: 0.99 }] },
  tapFallbackText: { color: '#F7E8CD', fontSize: 11, fontWeight: '700', textAlign: 'center' },
});
