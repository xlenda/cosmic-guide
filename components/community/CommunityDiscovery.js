import React, { memo, useCallback, useMemo } from 'react';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors } from '../../theme';

// A descoberta é deliberadamente estática: nenhum loop, entrada automática ou
// deslocamento comunica estado. Assim, quem reduz movimento recebe a mesma
// hierarquia completa sem depender de uma preferência lida tarde no primeiro frame.
const EMPTY_LIST = Object.freeze([]);
const SELECTED_STATE = Object.freeze({ selected: true });
const UNSELECTED_STATE = Object.freeze({ selected: false });
const DISPLAY_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia',
  default: 'serif',
});

function pressedStyle({ pressed }) {
  return [styles.pressableFill, pressed ? styles.pressed : null];
}

function secondaryActionStyle({ pressed }) {
  return [styles.secondaryAction, pressed ? styles.pressed : null];
}

function primaryActionStyle({ pressed }) {
  return [styles.primaryAction, pressed ? styles.pressed : null];
}

function emptyActionStyle({ pressed }) {
  return [styles.emptyAction, pressed ? styles.pressed : null];
}

function itemKey(item, index) {
  return String(item?.id || item?.roomId || item?.target?.id || index);
}

function signId(sign) {
  if (!sign) return null;
  if (typeof sign === 'string') return sign;
  return sign.id || null;
}

function suggestionTarget(suggestion, publicSign) {
  if (!suggestion) return null;
  if (suggestion.targetSign) return suggestion.targetSign;
  if (suggestion.target) return suggestion.target;

  const publicId = signId(publicSign);
  const first = suggestion.signA || null;
  const second = suggestion.signB || null;
  if (!first) return second;
  if (!second) return first;
  return signId(first) === publicId ? second : first;
}

function suggestionId(suggestion, publicSign, index = 0) {
  return String(
    signId(suggestionTarget(suggestion, publicSign))
      || suggestion?.targetId
      || suggestion?.id
      || index
  );
}

const RoomTile = memo(function RoomTile({
  id,
  icon,
  title,
  description,
  selected,
  featured,
  onSelect,
}) {
  const handlePress = useCallback(() => onSelect?.(id), [id, onSelect]);

  return (
    <View style={[
      styles.roomFrame,
      featured ? styles.roomFrameFeatured : null,
      selected ? styles.roomFrameSelected : null,
    ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={selected ? SELECTED_STATE : UNSELECTED_STATE}
        onPress={handlePress}
        style={pressedStyle}
        testID={`community-room-${id}`}
      >
        <View style={styles.roomTopLine}>
          <View style={[styles.roomIconWell, selected ? styles.roomIconWellSelected : null]}>
            <Ionicons
              name={icon || 'ellipse-outline'}
              size={18}
              color={selected ? colors.background : colors.gold}
            />
          </View>
          <View style={[styles.roomRule, selected ? styles.roomRuleSelected : null]} />
        </View>
        <Text style={styles.roomTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.roomDescription} numberOfLines={3}>{description}</Text>
      </Pressable>
    </View>
  );
});

const ConversationTile = memo(function ConversationTile({
  id,
  sourceGlyph,
  targetGlyph,
  targetName,
  relation,
  selected,
  onSelect,
}) {
  const handlePress = useCallback(() => onSelect?.(id), [id, onSelect]);

  return (
    <View style={[styles.conversationFrame, selected ? styles.conversationFrameSelected : null]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={selected ? SELECTED_STATE : UNSELECTED_STATE}
        onPress={handlePress}
        style={pressedStyle}
        testID={`community-target-${id}`}
      >
        <View style={styles.miniOrbit} importantForAccessibility="no-hide-descendants">
          <Text style={styles.miniGlyph}>{sourceGlyph || '✦'}</Text>
          <View style={styles.miniThread} />
          <Text style={[styles.miniGlyph, styles.miniGlyphTarget]}>{targetGlyph || '✦'}</Text>
        </View>
        <Text style={styles.conversationName} numberOfLines={1}>{targetName}</Text>
        <Text style={styles.conversationRelation} numberOfLines={2}>{relation}</Text>
      </Pressable>
    </View>
  );
});

function StaticLoading({ t }) {
  return (
    <View
      accessibilityLabel={t('community.discovery.loading')}
      accessibilityRole="progressbar"
      style={styles.loadingPanel}
      testID="community-discovery-loading"
    >
      <View style={styles.loadingLong} />
      <View style={styles.loadingShort} />
      <View style={styles.loadingTiles}>
        <View style={styles.loadingTile} />
        <View style={styles.loadingTileOffset} />
      </View>
    </View>
  );
}

function EmptyConversation({ t, onCompose }) {
  return (
    <View style={styles.emptyPanel} testID="community-discovery-empty">
      <View style={styles.emptyMark} importantForAccessibility="no-hide-descendants">
        <View style={styles.emptyMarkLine} />
        <Text style={styles.emptyMarkGlyph}>✦</Text>
      </View>
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>{t('community.discovery.emptyTitle')}</Text>
        <Text style={styles.emptyBody}>{t('community.discovery.emptyBody')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onCompose}
          style={emptyActionStyle}
          testID="community-empty-compose"
        >
          <Text style={styles.emptyActionText}>{t('community.discovery.emptyCta')}</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.gold} />
        </Pressable>
      </View>
    </View>
  );
}

export function CommunityDiscovery({
  t,
  rooms = EMPTY_LIST,
  selectedRoomId = null,
  onSelectRoom,
  publicSign = null,
  suggestions = EMPTY_LIST,
  selectedTargetId = null,
  onSelectTarget,
  onOpenFollowing,
  onCompose,
  loading = false,
  empty = false,
}) {
  const roomData = Array.isArray(rooms) ? rooms : EMPTY_LIST;
  const suggestionData = Array.isArray(suggestions) ? suggestions : EMPTY_LIST;
  const selectedSuggestion = useMemo(
    () => suggestionData.find(
      (suggestion, index) => suggestionId(suggestion, publicSign, index) === String(selectedTargetId)
    ) || suggestionData[0] || null,
    [publicSign, selectedTargetId, suggestionData]
  );
  const selectedTarget = suggestionTarget(selectedSuggestion, publicSign);
  const publicGlyph = typeof publicSign === 'object' ? publicSign?.emoji : null;
  const targetGlyph = selectedTarget?.emoji || null;
  const hasPublicSign = Boolean(signId(publicSign));

  const renderRoom = useCallback(({ item }) => (
    <RoomTile
      id={String(item.id)}
      icon={item.icon}
      title={t(item.titleKey)}
      description={t(item.descriptionKey)}
      selected={String(item.id) === String(selectedRoomId)}
      featured={item.id === 'plaza'}
      onSelect={onSelectRoom}
    />
  ), [onSelectRoom, selectedRoomId, t]);

  const renderSuggestion = useCallback(({ item, index }) => {
    const target = suggestionTarget(item, publicSign);
    const id = suggestionId(item, publicSign, index);
    return (
      <ConversationTile
        id={id}
        sourceGlyph={publicGlyph}
        targetGlyph={target?.emoji}
        targetName={target?.nameKey ? t(target.nameKey) : ''}
        relation={item.relationKey ? t(item.relationKey) : ''}
        selected={id === String(selectedTargetId)}
        onSelect={onSelectTarget}
      />
    );
  }, [onSelectTarget, publicGlyph, publicSign, selectedTargetId, t]);

  const suggestionKeyExtractor = useCallback(
    (item, index) => suggestionId(item, publicSign, index),
    [publicSign]
  );

  return (
    <View style={styles.root} testID="community-discovery">
      <View style={styles.hero}>
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>{t('community.discovery.eyebrow')}</Text>
          <Text style={styles.title}>{t('community.discovery.title')}</Text>
          <Text style={styles.intro}>{t('community.discovery.body')}</Text>
        </View>

        <View
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          pointerEvents="none"
          style={styles.signature}
        >
          <View style={styles.signatureThread} />
          <View style={styles.signatureNodeStart}>
            <Text style={[styles.signatureGlyph, styles.signatureGlyphStart]}>{publicGlyph || '✦'}</Text>
          </View>
          <View style={styles.signatureNodeEnd}>
            <Text style={styles.signatureGlyph}>{targetGlyph || '✦'}</Text>
          </View>
        </View>
        <Text style={styles.signatureCaption}>{t('community.discovery.signature')}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={onOpenFollowing}
          style={secondaryActionStyle}
          testID="community-open-following"
        >
          <Ionicons name="people-outline" size={17} color={colors.gold} />
          <Text style={styles.secondaryActionText}>{t('community.discovery.following')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onCompose}
          style={primaryActionStyle}
          testID="community-compose"
        >
          <Text style={styles.primaryActionText}>{t('community.discovery.compose')}</Text>
          <Ionicons name="create-outline" size={17} color={colors.background} />
        </Pressable>
      </View>

      {loading ? (
        <StaticLoading t={t} />
      ) : (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('community.discovery.roomsTitle')}</Text>
            <Text style={styles.sectionHint}>{t('community.discovery.roomsHint')}</Text>
          </View>
          <FlatList
            data={roomData}
            horizontal
            initialNumToRender={6}
            keyExtractor={itemKey}
            renderItem={renderRoom}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
            testID="community-room-list"
          />

          <View style={styles.conversationHeading}>
            <Text style={styles.sectionTitle}>{t('community.discovery.conversationsTitle')}</Text>
            <Text style={styles.sectionHint}>
              {t(hasPublicSign
                ? 'community.discovery.conversationsHint'
                : 'community.discovery.noSignBody')}
            </Text>
          </View>

          {hasPublicSign ? (
            <FlatList
              data={suggestionData}
              horizontal
              initialNumToRender={6}
              keyExtractor={suggestionKeyExtractor}
              renderItem={renderSuggestion}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              testID="community-suggestion-list"
            />
          ) : (
            <View style={styles.noSignPanel}>
              <Ionicons name="eye-off-outline" size={18} color={colors.gold} />
              <Text style={styles.noSignTitle}>{t('community.discovery.noSignTitle')}</Text>
            </View>
          )}

          {empty ? <EmptyConversation t={t} onCompose={onCompose} /> : null}
        </>
      )}
    </View>
  );
}

export default memo(CommunityDiscovery);

const styles = StyleSheet.create({
  root: {
    paddingTop: 8,
    paddingBottom: 28,
    gap: 18,
  },
  hero: {
    minHeight: 262,
    marginHorizontal: 16,
    paddingTop: 25,
    paddingRight: 118,
    paddingBottom: 24,
    paddingLeft: 22,
    overflow: 'hidden',
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: '#1A121E',
    borderWidth: 1,
    borderColor: '#4B3946',
  },
  heroCopy: {
    gap: 9,
    zIndex: 2,
  },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    maxWidth: 250,
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 31,
    lineHeight: 34,
    letterSpacing: -0.7,
  },
  intro: {
    maxWidth: 245,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
  },
  signature: {
    position: 'absolute',
    top: 22,
    right: 15,
    width: 103,
    height: 185,
  },
  signatureThread: {
    position: 'absolute',
    top: 41,
    right: 50,
    width: 1,
    height: 113,
    backgroundColor: '#C69654',
    opacity: 0.72,
    transform: [{ rotate: '21deg' }],
  },
  signatureNodeStart: {
    position: 'absolute',
    top: 4,
    right: 2,
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
    borderWidth: 1,
    borderColor: '#6A4E43',
  },
  signatureNodeEnd: {
    position: 'absolute',
    bottom: 2,
    left: 0,
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    borderCurve: 'continuous',
    backgroundColor: '#E3B85F',
    borderWidth: 5,
    borderColor: '#6E4D35',
  },
  signatureGlyph: {
    color: colors.background,
    fontSize: 30,
    lineHeight: 36,
  },
  signatureGlyphStart: {
    color: colors.gold,
  },
  signatureCaption: {
    position: 'absolute',
    right: 15,
    bottom: 17,
    width: 108,
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: 'right',
  },
  actions: {
    minHeight: 48,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  secondaryAction: {
    minHeight: 48,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryActionText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  primaryAction: {
    minHeight: 48,
    flex: 1.1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: colors.gold,
  },
  primaryActionText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 4,
    marginHorizontal: 16,
    gap: 4,
  },
  conversationHeading: {
    marginTop: 8,
    marginHorizontal: 16,
    gap: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    lineHeight: 27,
    letterSpacing: -0.25,
  },
  sectionHint: {
    maxWidth: 335,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  horizontalList: {
    paddingHorizontal: 16,
    paddingVertical: 2,
    gap: 10,
  },
  roomFrame: {
    width: 178,
    minHeight: 142,
    overflow: 'hidden',
    borderRadius: 21,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roomFrameSelected: {
    backgroundColor: '#241A25',
    borderColor: colors.gold,
  },
  roomFrameFeatured: {
    width: 205,
  },
  pressableFill: {
    minHeight: 44,
    flex: 1,
    padding: 15,
  },
  pressed: {
    opacity: 0.74,
  },
  roomTopLine: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  roomIconWell: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    borderCurve: 'continuous',
    backgroundColor: '#2B202B',
  },
  roomIconWellSelected: {
    backgroundColor: colors.gold,
  },
  roomRule: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  roomRuleSelected: {
    backgroundColor: '#8A6847',
  },
  roomTitle: {
    marginTop: 13,
    color: colors.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },
  roomDescription: {
    marginTop: 5,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  conversationFrame: {
    width: 148,
    minHeight: 136,
    overflow: 'hidden',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#171117',
    borderWidth: 1,
    borderColor: colors.border,
  },
  conversationFrameSelected: {
    backgroundColor: '#251B24',
    borderColor: '#9C714D',
  },
  miniOrbit: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniGlyph: {
    width: 36,
    height: 36,
    color: colors.text,
    fontSize: 21,
    lineHeight: 34,
    textAlign: 'center',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
    borderWidth: 1,
    borderColor: '#5A4145',
  },
  miniGlyphTarget: {
    color: colors.background,
    backgroundColor: colors.gold,
    borderColor: '#7A583A',
  },
  miniThread: {
    width: 28,
    height: 1,
    backgroundColor: '#9D744D',
    transform: [{ rotate: '-12deg' }],
  },
  conversationName: {
    marginTop: 8,
    color: colors.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '800',
  },
  conversationRelation: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  noSignPanel: {
    minHeight: 64,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    backgroundColor: '#181218',
  },
  noSignTitle: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  loadingPanel: {
    minHeight: 260,
    marginHorizontal: 16,
    gap: 12,
    padding: 20,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingLong: {
    width: '72%',
    height: 18,
    borderRadius: 7,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
  },
  loadingShort: {
    width: '48%',
    height: 10,
    borderRadius: 5,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
  },
  loadingTiles: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  loadingTile: {
    width: '55%',
    height: 132,
    borderRadius: 19,
    borderCurve: 'continuous',
    backgroundColor: '#241B25',
  },
  loadingTileOffset: {
    width: '32%',
    height: 104,
    marginTop: 18,
    borderRadius: 17,
    borderCurve: 'continuous',
    backgroundColor: '#201820',
  },
  emptyPanel: {
    minHeight: 142,
    marginTop: 8,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderRadius: 6,
    borderTopRightRadius: 26,
    borderBottomLeftRadius: 26,
    borderCurve: 'continuous',
    backgroundColor: '#191219',
    borderWidth: 1,
    borderColor: '#493544',
  },
  emptyMark: {
    width: 64,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMarkLine: {
    position: 'absolute',
    width: 1,
    height: 88,
    backgroundColor: '#8E6747',
    transform: [{ rotate: '18deg' }],
  },
  emptyMarkGlyph: {
    width: 42,
    height: 42,
    color: colors.background,
    fontSize: 22,
    lineHeight: 40,
    textAlign: 'center',
    borderRadius: 21,
    borderCurve: 'continuous',
    backgroundColor: colors.gold,
  },
  emptyCopy: {
    flex: 1,
    gap: 5,
  },
  emptyTitle: {
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 18,
    lineHeight: 23,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 11,
    lineHeight: 16,
  },
  emptyAction: {
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingTop: 9,
    paddingRight: 8,
  },
  emptyActionText: {
    color: colors.gold,
    fontSize: 12,
    fontWeight: '800',
  },
});
