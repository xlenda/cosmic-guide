import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { colors } from '../theme';
import useReducedMotion from '../hooks/useReducedMotion';

export const SKY_ALIGNMENT_PHASES = Object.freeze({
  IDLE: 'idle',
  DRAGGING: 'dragging',
  MAGNETIC: 'magnetic',
  ALIGNED: 'aligned',
});

const MAGNET_PROGRESS = 0.78;
const MAX_VERTICAL_DRIFT = 14;
const SETTLE_DURATION_MS = 280;
const RETURN_DURATION_MS = 240;
const PREMIUM_EASING = Easing.bezier(0.4, 0, 0.2, 1);

function clamp(value, minimum, maximum) {
  'worklet';
  return Math.min(maximum, Math.max(minimum, value));
}

function sanitizeSvgId(value) {
  return String(value || 'disk').replace(/[^a-zA-Z0-9_-]/g, '');
}

function asDisk(value) {
  if (Array.isArray(value)) return { items: value };
  return value && typeof value === 'object' ? value : {};
}

function diskFromPositions(positions, key) {
  if (!positions || typeof positions !== 'object') return {};
  if (key === 'myMap') return asDisk(positions.myMap ?? positions.natal);
  return asDisk(positions.currentSky ?? positions.current ?? positions.now);
}

function positionAngle(item) {
  const angle = Number(item?.angle ?? item?.longitude);
  return Number.isFinite(angle) ? angle : null;
}

function hapticPromise(stage) {
  try {
    if (
      Platform.OS === 'android'
      && typeof Haptics.performAndroidHapticsAsync === 'function'
      && Haptics.AndroidHaptics
    ) {
      const androidType = {
        pickup: Haptics.AndroidHaptics.Drag_Start,
        magnetic: Haptics.AndroidHaptics.Segment_Tick,
        aligned: Haptics.AndroidHaptics.Confirm,
      }[stage];
      if (androidType) return Haptics.performAndroidHapticsAsync(androidType);
    }

    if (stage === 'pickup') return Haptics.selectionAsync();
    if (stage === 'magnetic') {
      return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  } catch {
    return Promise.resolve();
  }
}

// Haptic é reforço, nunca portador de estado. Web e aparelhos com a resposta
// tátil desligada podem ficar silenciosos sem mudar o resultado da interação.
function emitHaptic(stage) {
  Promise.resolve(hapticPromise(stage)).catch(() => {});
}

function SkyDisk({
  accentColor,
  disk,
  label,
  size,
  testID,
  variant,
}) {
  const gradientId = `sky-${sanitizeSvgId(testID)}-metal`;
  const items = Array.isArray(disk.items) ? disk.items : [];
  const center = size / 2;
  const itemRadius = size * 0.365;
  const markerSize = clamp(size * 0.135, 18, 24);
  const isCurrent = variant === 'current';
  const outerStroke = isCurrent ? '#E8C879' : '#B991CC';

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[styles.disk, { width: size, height: size, borderRadius: size / 2 }]}
      testID={testID}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        accessible={false}
        focusable={false}
        style={StyleSheet.absoluteFill}
      >
        <Defs>
          <SvgLinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={isCurrent ? '#38273F' : '#251B2C'} />
            <Stop offset="0.42" stopColor={isCurrent ? '#6D5069' : '#4B3554'} />
            <Stop offset="0.66" stopColor={isCurrent ? '#33243C' : '#201724'} />
            <Stop offset="1" stopColor="#100B14" />
          </SvgLinearGradient>
        </Defs>

        <Circle
          cx={center}
          cy={center}
          r={center - 3}
          fill={`url(#${gradientId})`}
          stroke={outerStroke}
          strokeOpacity={isCurrent ? 0.82 : 0.56}
          strokeWidth={1.4}
        />
        <Circle
          cx={center}
          cy={center}
          r={size * 0.39}
          fill="none"
          stroke="#F4E5C1"
          strokeOpacity={0.2}
          strokeWidth={1}
        />
        <Circle
          cx={center}
          cy={center}
          r={size * 0.22}
          fill="#100B16"
          fillOpacity={0.54}
          stroke={accentColor}
          strokeOpacity={0.58}
          strokeWidth={1}
        />

        {Array.from({ length: 12 }, (_, index) => {
          const angle = ((index * 30) - 90) * (Math.PI / 180);
          const innerRadius = size * 0.415;
          const outerRadius = size * 0.455;
          return (
            <Line
              key={`tick-${index}`}
              x1={center + Math.cos(angle) * innerRadius}
              y1={center + Math.sin(angle) * innerRadius}
              x2={center + Math.cos(angle) * outerRadius}
              y2={center + Math.sin(angle) * outerRadius}
              stroke="#F7E8CD"
              strokeOpacity={index % 3 === 0 ? 0.55 : 0.28}
              strokeWidth={index % 3 === 0 ? 1.4 : 0.8}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>

      {items.map((item, index) => {
        const angle = positionAngle(item);
        const glyph = item?.glyph || item?.symbol;
        if (angle === null || !glyph) return null;
        const radians = (angle - 90) * (Math.PI / 180);
        const left = center + Math.cos(radians) * itemRadius - (markerSize / 2);
        const top = center + Math.sin(radians) * itemRadius - (markerSize / 2);
        return (
          <View
            key={String(item.id ?? item.key ?? `${angle}-${index}`)}
            pointerEvents="none"
            accessible={false}
            style={[
              styles.positionMarker,
              {
                left,
                top,
                width: markerSize,
                height: markerSize,
                borderRadius: markerSize / 2,
                borderColor: item.color || accentColor,
              },
            ]}
          >
            <Text
              accessible={false}
              style={[
                styles.positionGlyph,
                {
                  color: item.color || '#FAF3E5',
                  fontSize: markerSize * 0.62,
                  lineHeight: markerSize * 0.72,
                },
              ]}
            >
              {glyph}
            </Text>
          </View>
        );
      })}

      {!!(disk.centerGlyph || disk.glyph) && (
        <Text
          accessible={false}
          style={[
            styles.centerGlyph,
            { color: disk.accentColor || accentColor, fontSize: size * 0.19 },
          ]}
        >
          {disk.centerGlyph || disk.glyph}
        </Text>
      )}
      {!!label && (
        <View pointerEvents="none" style={styles.diskLabelChip}>
          <Text accessible={false} numberOfLines={1} style={styles.diskLabel}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

function phaseLabel(labels, phase) {
  if (labels?.status && typeof labels.status === 'object') {
    return labels.status[phase] || '';
  }
  const key = {
    [SKY_ALIGNMENT_PHASES.IDLE]: 'statusIdle',
    [SKY_ALIGNMENT_PHASES.DRAGGING]: 'statusDragging',
    [SKY_ALIGNMENT_PHASES.MAGNETIC]: 'statusMagnetic',
    [SKY_ALIGNMENT_PHASES.ALIGNED]: 'statusAligned',
  }[phase];
  return labels?.[key] || '';
}

/**
 * Palco visual do gesto “Alinhe seu céu”. O componente NÃO calcula aspectos:
 * `positions` apenas posiciona os glifos recebidos e `encounter` é devolvido
 * intacto em `onAligned`.
 *
 * Shape esperado:
 * positions={{
 *   myMap: { centerGlyph, accentColor, items: [{ id, glyph, angle, color }] },
 *   currentSky: { centerGlyph, accentColor, items: [...] },
 * }}
 * encounter={{ glyph, title, subtitle, accentColor }}
 * labels={{
 *   instruction, myMap, currentSky, fallback,
 *   statusIdle, statusDragging, statusMagnetic, statusAligned,
 *   dragAccessibilityLabel, dragAccessibilityHint, accessibilityAction,
 *   encounterEyebrow,
 * }}
 */
export default function SkyAlignmentStage({
  positions,
  encounter,
  onAligned,
  labels = {},
  fallbackLabel,
  reducedMotion: reducedMotionOverride,
  resetKey,
  disabled = false,
  style,
  testID = 'sky-alignment-stage',
}) {
  const systemReducedMotion = useReducedMotion();
  // `null` é a preferência nativa ainda não resolvida: até ela chegar, o
  // caminho conservador é não disparar movimento automático.
  const reducedMotion = reducedMotionOverride === undefined
    ? systemReducedMotion !== false
    : !!reducedMotionOverride;

  const [stageWidth, setStageWidth] = useState(320);
  const [phase, setPhase] = useState(SKY_ALIGNMENT_PHASES.IDLE);
  const [interactionLocked, setInteractionLocked] = useState(false);
  const completedRef = useRef(false);
  const programmaticAlignmentRef = useRef(false);
  const mountedRef = useRef(true);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const gestureStartX = useSharedValue(0);
  const gestureStartY = useSharedValue(0);
  const lift = useSharedValue(0);
  const magnetic = useSharedValue(0);
  const magneticHapticFired = useSharedValue(0);
  const aligned = useSharedValue(0);

  const diskSize = Math.round(clamp(stageWidth * 0.46, 112, 176));
  const travel = Math.round(clamp(stageWidth * 0.27, 56, 104));
  const targetLeft = Math.round((stageWidth - diskSize - travel) / 2);
  const movingLeft = targetLeft + travel;
  const stageHeight = diskSize + 44;

  const myMapDisk = diskFromPositions(positions, 'myMap');
  const currentSkyDisk = diskFromPositions(positions, 'currentSky');
  const targetAccent = myMapDisk.accentColor || colors.purple;
  const currentAccent = currentSkyDisk.accentColor || colors.gold;
  const encounterAccent = encounter?.accentColor || colors.gold;

  const progress = useDerivedValue(() => {
    if (travel <= 0) return 0;
    return clamp((-translateX.get()) / travel, 0, 1);
  }, [travel]);

  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  useEffect(() => {
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    if (completedRef.current) {
      translateX.set(-travel);
      translateY.set(0);
      return;
    }

    // Uma mudança de largura pode cancelar o callback de `withTiming`. O
    // rollback precisa ser atômico: sem isso o disco volta visualmente, mas a
    // trava da interação continua ligada e a pessoa não consegue tentar de
    // novo.
    programmaticAlignmentRef.current = false;
    aligned.set(0);
    magnetic.set(0);
    magneticHapticFired.set(0);
    lift.set(0);
    setInteractionLocked(false);
    setPhase(SKY_ALIGNMENT_PHASES.IDLE);
    translateX.set(0);
    translateY.set(0);
  }, [
    travel,
    aligned,
    lift,
    magnetic,
    magneticHapticFired,
    translateX,
    translateY,
  ]);

  useEffect(() => {
    completedRef.current = false;
    programmaticAlignmentRef.current = false;
    aligned.set(0);
    magnetic.set(0);
    magneticHapticFired.set(0);
    lift.set(0);
    cancelAnimation(translateX);
    cancelAnimation(translateY);
    translateX.set(0);
    translateY.set(0);
    setInteractionLocked(false);
    setPhase(SKY_ALIGNMENT_PHASES.IDLE);
  }, [
    resetKey,
    aligned,
    lift,
    magnetic,
    magneticHapticFired,
    translateX,
    translateY,
  ]);

  const reportPhase = useCallback((nextPhase) => {
    if (mountedRef.current && !completedRef.current) setPhase(nextPhase);
  }, []);

  const lockInteraction = useCallback(() => {
    if (mountedRef.current) setInteractionLocked(true);
  }, []);

  const finishAlignment = useCallback((source) => {
    if (!mountedRef.current || completedRef.current) return;
    completedRef.current = true;
    setPhase(SKY_ALIGNMENT_PHASES.ALIGNED);
    emitHaptic('aligned');
    onAligned?.(encounter, { source });
  }, [encounter, onAligned]);

  const isAligned = phase === SKY_ALIGNMENT_PHASES.ALIGNED;

  const panGesture = useMemo(() => Gesture.Pan()
    .enabled(!disabled && !isAligned && !interactionLocked)
    .maxPointers(1)
    .activeOffsetX([-6, 6])
    .failOffsetY([-12, 12])
    .shouldCancelWhenOutside(false)
    .onStart(() => {
      gestureStartX.set(translateX.get());
      gestureStartY.set(translateY.get());
      magnetic.set(0);
      magneticHapticFired.set(0);
      if (reducedMotion) lift.set(0);
      else {
        lift.set(withTiming(1, {
          duration: 90,
          easing: PREMIUM_EASING,
          reduceMotion: ReduceMotion.System,
        }));
      }
      runOnJS(reportPhase)(SKY_ALIGNMENT_PHASES.DRAGGING);
      runOnJS(emitHaptic)('pickup');
    })
    .onUpdate((event) => {
      const nextX = clamp(gestureStartX.get() + event.translationX, -travel, 8);
      const nextY = clamp(
        gestureStartY.get() + event.translationY,
        -MAX_VERTICAL_DRIFT,
        MAX_VERTICAL_DRIFT,
      );
      translateX.set(nextX);
      translateY.set(nextY);

      const nextProgress = travel > 0 ? clamp((-nextX) / travel, 0, 1) : 0;
      const isMagnetic = nextProgress >= MAGNET_PROGRESS;
      if (isMagnetic && magnetic.get() === 0) {
        magnetic.set(1);
        runOnJS(reportPhase)(SKY_ALIGNMENT_PHASES.MAGNETIC);
      } else if (!isMagnetic && magnetic.get() === 1) {
        magnetic.set(0);
        runOnJS(reportPhase)(SKY_ALIGNMENT_PHASES.DRAGGING);
      }
      if (isMagnetic && magneticHapticFired.get() === 0) {
        magneticHapticFired.set(1);
        runOnJS(emitHaptic)('magnetic');
      }
    })
    .onEnd((event) => {
      // `progress` é derivado de translateX. No navegador, o último frame do
      // pointer pode chegar no mesmo tick do onEnd e o derived value ainda
      // refletir o frame anterior. Calcular pelo evento final elimina essa
      // corrida sem mudar o gesto nativo nem o limiar magnético.
      const finalX = clamp(gestureStartX.get() + event.translationX, -travel, 8);
      const finalProgress = travel > 0 ? clamp((-finalX) / travel, 0, 1) : 0;
      const isInMagneticZone = finalProgress >= MAGNET_PROGRESS;
      translateX.set(finalX);
      if (reducedMotion) lift.set(0);
      else {
        lift.set(withTiming(0, {
          duration: 160,
          easing: PREMIUM_EASING,
          reduceMotion: ReduceMotion.System,
        }));
      }

      if (isInMagneticZone) {
        aligned.set(1);
        runOnJS(lockInteraction)();
        const settleConfig = {
          duration: reducedMotion ? 0 : SETTLE_DURATION_MS,
          easing: PREMIUM_EASING,
          reduceMotion: ReduceMotion.System,
        };
        translateY.set(withTiming(0, settleConfig));
        translateX.set(withTiming(-travel, settleConfig, (finished) => {
          if (finished) runOnJS(finishAlignment)('drag');
        }));
        return;
      }

      magnetic.set(0);
      runOnJS(reportPhase)(SKY_ALIGNMENT_PHASES.IDLE);
      const returnConfig = {
        duration: reducedMotion ? 0 : RETURN_DURATION_MS,
        easing: PREMIUM_EASING,
        reduceMotion: ReduceMotion.System,
      };
      translateX.set(withTiming(0, returnConfig));
      translateY.set(withTiming(0, returnConfig));
    })
    .onFinalize((_event, success) => {
      if (success || aligned.get() === 1) return;
      magnetic.set(0);
      lift.set(0);
      const returnConfig = {
        duration: reducedMotion ? 0 : RETURN_DURATION_MS,
        easing: PREMIUM_EASING,
        reduceMotion: ReduceMotion.System,
      };
      translateX.set(withTiming(0, returnConfig));
      translateY.set(withTiming(0, returnConfig));
      runOnJS(reportPhase)(SKY_ALIGNMENT_PHASES.IDLE);
    }), [
    aligned,
    disabled,
    finishAlignment,
    gestureStartX,
    gestureStartY,
    lift,
    magnetic,
    magneticHapticFired,
    isAligned,
    interactionLocked,
    lockInteraction,
    progress,
    reducedMotion,
    reportPhase,
    translateX,
    translateY,
    travel,
  ]);

  const alignWithoutDrag = useCallback(() => {
    if (disabled || completedRef.current || programmaticAlignmentRef.current) return;
    programmaticAlignmentRef.current = true;
    setInteractionLocked(true);
    aligned.set(1);
    magnetic.set(1);
    lift.set(0);

    if (reducedMotion || travel <= 0) {
      translateX.set(-travel);
      translateY.set(0);
      finishAlignment('fallback');
      return;
    }

    const settleConfig = {
      duration: SETTLE_DURATION_MS,
      easing: PREMIUM_EASING,
      reduceMotion: ReduceMotion.System,
    };
    translateY.set(withTiming(0, settleConfig));
    translateX.set(withTiming(-travel, settleConfig, (finished) => {
      if (finished) runOnJS(finishAlignment)('fallback');
    }));
  }, [
    aligned,
    disabled,
    finishAlignment,
    lift,
    magnetic,
    reducedMotion,
    translateX,
    translateY,
    travel,
  ]);

  const currentDiskStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.get() },
      { translateY: translateY.get() },
      { scale: reducedMotion ? 1 : 1 + (lift.get() * 0.015) },
    ],
  }), [reducedMotion]);

  const targetHaloStyle = useAnimatedStyle(() => {
    const amount = aligned.get() === 1 ? 1 : progress.get();
    return {
      opacity: interpolate(amount, [0, MAGNET_PROGRESS, 1], [0.12, 0.42, 0.9]),
      transform: [{ scale: reducedMotion ? 1 : interpolate(amount, [0, 1], [0.98, 1.025]) }],
    };
  }, [reducedMotion]);

  const currentLabel = currentSkyDisk.label || labels.currentSky || '';
  const myMapLabel = myMapDisk.label || labels.myMap || '';
  const fallbackText = fallbackLabel || labels.fallback || '';
  const statusText = phaseLabel(labels, phase);
  const encounterTitle = typeof encounter === 'string'
    ? encounter
    : encounter?.title || encounter?.label || '';
  const encounterSubtitle = typeof encounter === 'object'
    ? encounter?.subtitle || encounter?.summary || ''
    : '';

  const accessibilityActionLabel = labels.accessibilityAction || fallbackText;
  const accessibilityActions = accessibilityActionLabel
    ? [{ name: 'activate', label: accessibilityActionLabel }]
    : [{ name: 'activate' }];
  const nativeDiskIsActionable = Platform.OS !== 'web' && !disabled && !isAligned;

  return (
    <View
      style={[styles.root, style]}
      testID={testID}
      dataSet={Platform.OS === 'web' ? {
        alignmentPhase: phase,
        reducedMotion: reducedMotion ? 'true' : 'false',
      } : undefined}
    >
      {!!labels.instruction && (
        <Text style={styles.instruction}>{labels.instruction}</Text>
      )}

      <View
        style={[styles.stage, { height: stageHeight }]}
        onLayout={(event) => {
          const nextWidth = Math.round(event.nativeEvent.layout.width);
          if (nextWidth > 0) {
            setStageWidth((previous) => (previous === nextWidth ? previous : nextWidth));
          }
        }}
        testID={`${testID}-canvas`}
      >
        <View
          pointerEvents="none"
          style={[
            styles.rail,
            {
              left: targetLeft + (diskSize / 2),
              top: 20 + (diskSize / 2),
              width: travel,
            },
          ]}
        />

        <Animated.View
          pointerEvents="none"
          style={[
            styles.targetHalo,
            {
              left: targetLeft - 9,
              top: 11,
              width: diskSize + 18,
              height: diskSize + 18,
              borderRadius: (diskSize + 18) / 2,
              borderColor: encounterAccent,
            },
            targetHaloStyle,
          ]}
        />

        <View
          pointerEvents="none"
          style={[styles.diskSlot, { left: targetLeft, top: 20 }]}
        >
          <SkyDisk
            accentColor={targetAccent}
            disk={myMapDisk}
            label={myMapLabel}
            size={diskSize}
            testID={`${testID}-my-map`}
            variant="natal"
          />
        </View>

        <GestureDetector gesture={panGesture} touchAction="pan-y">
          <Animated.View
            collapsable={false}
            accessible={nativeDiskIsActionable}
            focusable={nativeDiskIsActionable}
            accessibilityRole={nativeDiskIsActionable ? 'button' : undefined}
            accessibilityLabel={labels.dragAccessibilityLabel || currentLabel}
            accessibilityHint={labels.dragAccessibilityHint || labels.instruction}
            accessibilityState={{ disabled: disabled || isAligned, selected: isAligned }}
            accessibilityValue={statusText ? { text: statusText } : undefined}
            accessibilityActions={nativeDiskIsActionable ? accessibilityActions : undefined}
            onAccessibilityAction={(event) => {
              if (nativeDiskIsActionable && event.nativeEvent.actionName === 'activate') {
                alignWithoutDrag();
              }
            }}
            onAccessibilityTap={nativeDiskIsActionable ? alignWithoutDrag : undefined}
            style={[
              styles.diskSlot,
              styles.movingDisk,
              Platform.OS === 'web' && styles.webDraggable,
              { left: movingLeft, top: 20 },
              currentDiskStyle,
            ]}
            testID={`${testID}-current-sky`}
          >
            <SkyDisk
              accentColor={currentAccent}
              disk={currentSkyDisk}
              label={currentLabel}
              size={diskSize}
              testID={`${testID}-current-sky-visual`}
              variant="current"
            />
          </Animated.View>
        </GestureDetector>
      </View>

      <Text
        accessibilityLiveRegion="polite"
        accessibilityRole="text"
        style={[
          styles.status,
          phase === SKY_ALIGNMENT_PHASES.MAGNETIC && styles.statusMagnetic,
          phase === SKY_ALIGNMENT_PHASES.ALIGNED && styles.statusAligned,
        ]}
        testID={`${testID}-status`}
      >
        {statusText || ' '}
      </Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={fallbackText}
        accessibilityHint={labels.fallbackHint}
        accessibilityState={{
          disabled: disabled || isAligned,
        }}
        disabled={disabled || isAligned}
        onPress={alignWithoutDrag}
        style={({ pressed }) => [
          styles.fallback,
          pressed && styles.fallbackPressed,
          (disabled || isAligned) && styles.fallbackDisabled,
        ]}
        testID={`${testID}-fallback`}
      >
        <Text style={styles.fallbackText}>{fallbackText}</Text>
      </Pressable>

      {isAligned && (!!encounterTitle || !!encounterSubtitle) && (
        <View
          style={[styles.encounter, { borderColor: `${encounterAccent}66` }]}
          testID={`${testID}-encounter`}
        >
          {!!labels.encounterEyebrow && (
            <Text style={[styles.encounterEyebrow, { color: encounterAccent }]}>
              {labels.encounterEyebrow}
            </Text>
          )}
          <View style={styles.encounterTitleRow}>
            {!!encounter?.glyph && (
              <Text style={[styles.encounterGlyph, { color: encounterAccent }]}>
                {encounter.glyph}
              </Text>
            )}
            {!!encounterTitle && (
              <Text style={styles.encounterTitle}>{encounterTitle}</Text>
            )}
          </View>
          {!!encounterSubtitle && (
            <Text style={styles.encounterSubtitle}>{encounterSubtitle}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    alignSelf: 'center',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(21,16,25,0.94)',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  instruction: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  stage: {
    width: '100%',
    position: 'relative',
    alignSelf: 'stretch',
    overflow: 'hidden',
    marginTop: 4,
  },
  rail: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(227,184,95,0.25)',
  },
  targetHalo: {
    position: 'absolute',
    borderWidth: 1.5,
    backgroundColor: 'rgba(227,184,95,0.035)',
  },
  diskSlot: {
    position: 'absolute',
  },
  movingDisk: {
    zIndex: 4,
    elevation: 7,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
  },
  webDraggable: {
    cursor: 'grab',
    userSelect: 'none',
  },
  disk: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  positionMarker: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(11,7,18,0.88)',
    borderWidth: 1,
  },
  positionGlyph: {
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  centerGlyph: {
    color: colors.gold,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    fontWeight: '400',
    textAlign: 'center',
  },
  diskLabelChip: {
    position: 'absolute',
    left: '17%',
    right: '17%',
    bottom: '17%',
    minHeight: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    backgroundColor: 'rgba(11,7,18,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(250,245,234,0.13)',
  },
  diskLabel: {
    color: colors.text,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 0.25,
    textAlign: 'center',
  },
  status: {
    minHeight: 20,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 2,
  },
  statusMagnetic: { color: colors.gold },
  statusAligned: { color: colors.green },
  fallback: {
    minHeight: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(227,184,95,0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    backgroundColor: 'rgba(227,184,95,0.09)',
  },
  fallbackPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  fallbackDisabled: { opacity: 0.48 },
  fallbackText: {
    color: '#F3D99A',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
  },
  encounter: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 14,
    backgroundColor: colors.surfaceElevated,
  },
  encounterEyebrow: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    letterSpacing: 1.15,
    textTransform: 'uppercase',
  },
  encounterTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },
  encounterGlyph: {
    fontSize: 23,
    lineHeight: 28,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  encounterTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '800',
  },
  encounterSubtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
  },
});
