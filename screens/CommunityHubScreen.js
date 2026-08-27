import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Alert } from '../lib/webAlert';
import { colors } from '../theme';
import GradientHeader from '../components/GradientHeader';
import CommunityDiscovery from '../components/community/CommunityDiscovery';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import {
  COMMUNITY_ROOMS,
  COMMUNITY_SIGNS,
  communitySuggestionsFor,
  getCommunityRoom,
  getCommunitySign,
} from '../lib/communityRooms';
import { formatSocialTimeAgo } from '../lib/socialTime';
import {
  acceptCommunityGuidelines,
  addSocialComment,
  blockSocialUser,
  createCommunityPost,
  deleteSocialComment,
  deleteSocialPost,
  getCommunityRoomFeed,
  getMySocialProfile,
  getSocialComments,
  likeSocialPost,
  reportContent,
  unlikeSocialPost,
  unblockSocialUser,
  updateCommunityProfile,
} from '../lib/socialClient';

const DISPLAY_FONT = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  web: 'Georgia',
  default: 'serif',
});

const ERROR_KEY_BY_CODE = Object.freeze({
  community_guidelines_required: 'community.error.community_guidelines_required',
  public_zodiac_sign_required: 'community.error.community_public_sign_required',
  room_mismatch: 'community.error.community_room_mismatch',
  community_suspended: 'community.error.community_suspended',
  community_content_rejected: 'community.error.community_content_rejected',
});

const COMMUNITY_SUSPENDED_ERROR_KEY = ERROR_KEY_BY_CODE.community_suspended;

const EMPTY_POSTS = Object.freeze([]);
const EMPTY_SUGGESTIONS = Object.freeze([]);

export function communityErrorKey(error) {
  return ERROR_KEY_BY_CODE[error?.code] || 'community.error.generic';
}

export function isCommunitySuspendedError(error) {
  return error?.code === 'community_suspended';
}

export function hasPublicCommunitySign(profile) {
  return Boolean(
    profile
      && (profile.show_zodiac_sign === true || profile.show_zodiac_sign === 1)
      && getCommunitySign(profile.zodiac_sign)
  );
}

export function hasAcceptedCommunityGuidelines(profile) {
  return Boolean(
    profile?.community_guidelines_version
      && profile?.community_guidelines_accepted_at
  );
}

export function targetIdForSuggestion(suggestion) {
  return suggestion?.targetSign?.id
    || suggestion?.target?.id
    || suggestion?.signB?.id
    || null;
}

export function buildCommunityPostPayload({ roomId, targetSign, title, body }) {
  const cleanRoomId = getCommunityRoom(roomId)?.id || 'plaza';
  return {
    roomId: cleanRoomId,
    targetSign: cleanRoomId === 'plaza' ? null : (targetSign || null),
    title: String(title || '').trim(),
    body: String(body || '').trim(),
  };
}

export function updatePostLikeState(post, liked) {
  if (!post) return post;
  const wasLiked = Boolean(post.liked_by_me);
  const nextLiked = Boolean(liked);
  const currentCount = Number.isFinite(Number(post.like_count)) ? Number(post.like_count) : 0;
  return {
    ...post,
    liked_by_me: nextLiked,
    like_count: Math.max(0, currentCount + (nextLiked === wasLiked ? 0 : (nextLiked ? 1 : -1))),
  };
}

export function updatePostCommentCount(post, count) {
  if (!post) return post;
  const parsed = Number(count);
  return {
    ...post,
    comment_count: Number.isFinite(parsed) ? Math.max(0, parsed) : post.comment_count,
  };
}

export function removeUserContent(items, blockedUserId) {
  return Array.isArray(items)
    ? items.filter((item) => String(item?.user_id) !== String(blockedUserId))
    : [];
}

function pressedOpacity(style) {
  return ({ pressed }) => [style, pressed ? styles.pressed : null];
}

function ScreenHeader({ t }) {
  return (
    <GradientHeader
      title={t('community.header.title')}
      subtitle={t('community.header.subtitle')}
    />
  );
}

function LoadingState({ t }) {
  return (
    <View
      accessibilityLabel={t('community.discovery.loading')}
      accessibilityRole="progressbar"
      style={styles.centerState}
      testID="community-hub-loading"
    >
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={styles.centerStateBody}>{t('community.discovery.loading')}</Text>
    </View>
  );
}

function ErrorState({ t, onRetry, compact = false, bodyKey = 'community.error.generic' }) {
  return (
    <View style={[styles.errorCard, compact ? styles.errorCardCompact : null]} testID="community-hub-error">
      <Ionicons name="cloud-offline-outline" size={21} color={colors.red} />
      <View style={styles.errorCopy}>
        <Text style={styles.errorTitle}>{t('community.error.title')}</Text>
        <Text style={styles.errorBody}>{t(bodyKey)}</Text>
      </View>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={pressedOpacity(styles.retryButton)}
          testID="community-retry"
        >
          <Ionicons name="refresh" size={17} color={colors.gold} />
          <Text style={styles.retryText}>{t('community.error.retry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function LoggedOutState({ t, onLogin }) {
  return (
    <ScrollView contentContainerStyle={styles.guestContent} testID="community-logged-out">
      <View style={styles.guestCard}>
        <View style={styles.guestOrbit} importantForAccessibility="no-hide-descendants">
          <Text style={styles.guestGlyph}>✦</Text>
          <View style={styles.guestThread} />
          <Text style={[styles.guestGlyph, styles.guestGlyphGold]}>☼</Text>
        </View>
        <Text style={styles.eyebrow}>{t('community.discovery.eyebrow')}</Text>
        <Text style={styles.guestTitle}>{t('community.discovery.title')}</Text>
        <Text style={styles.guestBody}>{t('community.discovery.body')}</Text>
        <View style={styles.truthNote}>
          <Ionicons name="compass-outline" size={18} color={colors.gold} />
          <Text style={styles.truthNoteText}>{t('community.discovery.conversationsHint')}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onLogin}
          style={pressedOpacity(styles.primaryButton)}
          testID="community-login"
        >
          <Text style={styles.primaryButtonText}>{t('social.loginCta')}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ProfileRequiredState({ t, onCreateProfile }) {
  return (
    <ScrollView contentContainerStyle={styles.guestContent} testID="community-profile-required">
      <View style={styles.profileRequiredCard}>
        <View style={styles.profileRequiredIcon}>
          <Ionicons name="person-add-outline" size={24} color={colors.gold} />
        </View>
        <Text style={styles.profileRequiredTitle}>{t('social.createProfile.title')}</Text>
        <Text style={styles.profileRequiredBody}>{t('social.createProfile.desc')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={onCreateProfile}
          style={pressedOpacity(styles.primaryButton)}
          testID="community-create-profile"
        >
          <Text style={styles.primaryButtonText}>{t('social.createProfile.cta')}</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

function SignControl({ t, publicSign, onOpen }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('community.signConsent.choose')}
      onPress={onOpen}
      style={pressedOpacity(styles.signControl)}
      testID="community-open-sign-consent"
    >
      <View style={styles.signControlIcon}>
        <Text style={styles.signControlGlyph}>{publicSign?.emoji || '✦'}</Text>
      </View>
      <View style={styles.signControlCopy}>
        <Text style={styles.signControlTitle}>
          {publicSign ? t(publicSign.nameKey) : t('community.discovery.noSignTitle')}
        </Text>
        <Text style={styles.signControlBody} numberOfLines={2}>
          {t(publicSign
            ? 'community.discovery.conversationsHint'
            : 'community.discovery.noSignBody')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={colors.gold} />
    </Pressable>
  );
}

function Notice({ t, noticeKey, errorKey }) {
  const key = errorKey || noticeKey;
  if (!key) return null;
  const isError = Boolean(errorKey);
  return (
    <View
      accessibilityRole={isError ? 'alert' : undefined}
      style={[styles.notice, isError ? styles.noticeError : styles.noticeSuccess]}
      testID={isError ? 'community-operation-error' : 'community-operation-success'}
    >
      <Ionicons
        name={isError ? 'alert-circle-outline' : 'checkmark-circle-outline'}
        size={19}
        color={isError ? colors.red : colors.green}
      />
      <Text style={styles.noticeText}>{t(key)}</Text>
    </View>
  );
}

export const FeedPost = React.memo(function FeedPost({
  post,
  t,
  myUserId,
  onOpen,
  onToggleLike,
  onDelete,
  onModerate,
}) {
  const signA = getCommunitySign(post?.sign_a);
  const signB = getCommunitySign(post?.sign_b);
  const hasRelation = Boolean(signA && signB && post?.relation);
  const isMine = String(post?.user_id) === String(myUserId);
  return (
    <View style={styles.postCard} testID={`community-post-${post?.id}`}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('social.comments.open')}
        onPress={() => onOpen(post)}
        style={pressedOpacity(styles.postOpenArea)}
        testID={`community-open-post-${post?.id}`}
      >
        <View style={styles.postAuthorRow}>
          <View style={styles.avatarWell}>
            <Text style={styles.avatarEmoji}>{post?.avatar_emoji || '✦'}</Text>
          </View>
          <View style={styles.postAuthorCopy}>
            <Text style={styles.postAuthor} numberOfLines={1}>{post?.display_name}</Text>
            <Text style={styles.postMeta} numberOfLines={1}>
              @{post?.username} · {formatSocialTimeAgo(post?.created_at, t)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </View>

        {hasRelation ? (
          <View style={styles.relationChip}>
            <Text style={styles.relationGlyph}>{signA.emoji}</Text>
            <View style={styles.relationRule} />
            <Text style={styles.relationGlyph}>{signB.emoji}</Text>
            <Text style={styles.relationText} numberOfLines={1}>
              {t(`community.relation.${post.relation}`)}
            </Text>
          </View>
        ) : null}

        <Text style={styles.postTitle}>{post?.title}</Text>
        <Text style={styles.postBody} numberOfLines={5}>{post?.body}</Text>
      </Pressable>

      <View style={styles.postActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(post?.liked_by_me ? 'social.unlike' : 'social.like')}
          onPress={() => onToggleLike(post)}
          style={pressedOpacity(styles.postAction)}
          testID={`community-like-post-${post?.id}`}
        >
          <Ionicons
            name={post?.liked_by_me ? 'heart' : 'heart-outline'}
            size={18}
            color={post?.liked_by_me ? colors.pink : colors.textMuted}
          />
          <Text style={[styles.postCountText, post?.liked_by_me ? styles.postCountLiked : null]}>
            {String(Number(post?.like_count) || 0)}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.comments.open')}
          onPress={() => onOpen(post)}
          style={pressedOpacity(styles.postAction)}
          testID={`community-comments-post-${post?.id}`}
        >
          <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
          <Text style={styles.postCountText}>{String(Number(post?.comment_count) || 0)}</Text>
        </Pressable>
        <View style={styles.postActionSpacer} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(isMine ? 'social.delete.cta' : 'social.mod.cta')}
          onPress={() => (isMine ? onDelete(post) : onModerate('post', post?.id, post?.user_id))}
          style={pressedOpacity(styles.postMenuAction)}
          testID={`community-${isMine ? 'delete' : 'moderate'}-post-${post?.id}`}
        >
          <Ionicons name={isMine ? 'trash-outline' : 'ellipsis-horizontal'} size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
});

function postKey(post, index) {
  return String(post?.id || index);
}

export function CommunityHubState({
  t,
  user,
  authLoading,
  profile,
  profileLoading,
  profileError,
  posts = EMPTY_POSTS,
  feedLoading,
  feedError,
  refreshing,
  selectedRoomId,
  selectedTargetId,
  publicSign,
  suggestions = EMPTY_SUGGESTIONS,
  noticeKey,
  operationErrorKey,
  onLogin,
  onCreateProfile,
  onRetryProfile,
  onRetryFeed,
  onRefresh,
  onOpenSign,
  onSelectRoom,
  onSelectTarget,
  onOpenFollowing,
  onCompose,
  onOpenPost,
  onToggleLike,
  onDeletePost,
  onModerate,
}) {
  const selectedRoom = getCommunityRoom(selectedRoomId) || COMMUNITY_ROOMS[0];

  if (authLoading) {
    return (
      <View style={styles.stateRoot}>
        <ScreenHeader t={t} />
        <LoadingState t={t} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.stateRoot}>
        <ScreenHeader t={t} />
        <LoggedOutState t={t} onLogin={onLogin} />
      </View>
    );
  }

  // A suspensão confirmada pelo servidor sempre prevalece sobre qualquer
  // perfil/feed mantido em memória por uma sessão anterior.
  if (profileError === COMMUNITY_SUSPENDED_ERROR_KEY) {
    return (
      <View style={styles.stateRoot}>
        <ScreenHeader t={t} />
        <View style={styles.centerState}>
          <ErrorState
            t={t}
            bodyKey={COMMUNITY_SUSPENDED_ERROR_KEY}
            onRetry={null}
          />
        </View>
      </View>
    );
  }

  if (profileLoading && profile === undefined) {
    return (
      <View style={styles.stateRoot}>
        <ScreenHeader t={t} />
        <LoadingState t={t} />
      </View>
    );
  }

  if (profileError && profile === undefined) {
    return (
      <View style={styles.stateRoot}>
        <ScreenHeader t={t} />
        <View style={styles.centerState}>
          <ErrorState
            t={t}
            bodyKey="community.error.generic"
            onRetry={onRetryProfile}
          />
        </View>
      </View>
    );
  }

  if (profile === null) {
    return (
      <View style={styles.stateRoot}>
        <ScreenHeader t={t} />
        <ProfileRequiredState t={t} onCreateProfile={onCreateProfile} />
      </View>
    );
  }

  const listHeader = (
    <View>
      <SignControl t={t} publicSign={publicSign} onOpen={onOpenSign} />
      <Notice t={t} noticeKey={noticeKey} errorKey={operationErrorKey} />
      <CommunityDiscovery
        t={t}
        rooms={COMMUNITY_ROOMS}
        selectedRoomId={selectedRoomId}
        onSelectRoom={onSelectRoom}
        publicSign={publicSign}
        suggestions={publicSign ? suggestions : EMPTY_SUGGESTIONS}
        selectedTargetId={selectedTargetId}
        onSelectTarget={onSelectTarget}
        onOpenFollowing={onOpenFollowing}
        onCompose={onCompose}
        loading={false}
        empty={!feedLoading && !feedError && posts.length === 0}
      />
      <View style={styles.feedHeading}>
        <View style={styles.feedHeadingRule} />
        <View style={styles.feedHeadingCopy}>
          <Text style={styles.feedTitle}>{t(selectedRoom.titleKey)}</Text>
          <Text style={styles.feedDescription}>{t(selectedRoom.descriptionKey)}</Text>
        </View>
      </View>
      {feedError ? <ErrorState t={t} onRetry={onRetryFeed} compact /> : null}
      {feedLoading ? (
        <View
          accessibilityLabel={t('community.discovery.loading')}
          accessibilityRole="progressbar"
          style={styles.feedLoading}
          testID="community-feed-loading"
        >
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : null}
    </View>
  );

  const renderPost = ({ item }) => (
    <FeedPost
      post={item}
      t={t}
      myUserId={user?.id}
      onOpen={onOpenPost}
      onToggleLike={onToggleLike}
      onDelete={onDeletePost}
      onModerate={onModerate}
    />
  );

  return (
    <View style={styles.stateRoot} testID="community-hub-authenticated">
      <ScreenHeader t={t} />
      <FlatList
        data={feedLoading || feedError ? EMPTY_POSTS : posts}
        keyExtractor={postKey}
        renderItem={renderPost}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.feedContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={(
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={colors.gold}
          />
        )}
        showsVerticalScrollIndicator={false}
        testID="community-room-feed"
      />
    </View>
  );
}

function ModalFrame({ children, onClose, testID }) {
  return (
    <View style={styles.modalBackdrop} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel=""
        onPress={onClose}
        style={StyleSheet.absoluteFill}
        testID={`${testID}-backdrop`}
      />
      <View accessibilityViewIsModal style={styles.modalCard}>
        {children}
      </View>
    </View>
  );
}

export function SignConsentModal({
  visible,
  t,
  selectedSignId,
  hasPublicSign,
  busy,
  errorKey,
  onSelect,
  onSave,
  onHide,
  onClose,
}) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(visible)}
      onRequestClose={busy ? undefined : onClose}
    >
      <ModalFrame onClose={busy ? undefined : onClose} testID="community-sign-modal">
        <ScrollView
          contentContainerStyle={styles.modalScroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalEyebrow}>{t('community.discovery.eyebrow')}</Text>
          <Text style={styles.modalTitle}>{t('community.signConsent.title')}</Text>
          <Text style={styles.modalBody}>{t('community.signConsent.body')}</Text>
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark-outline" size={19} color={colors.teal} />
            <Text style={styles.privacyNoteText}>{t('community.signConsent.privacy')}</Text>
          </View>

          <View style={styles.signGrid}>
            {COMMUNITY_SIGNS.map((sign) => {
              const selected = sign.id === selectedSignId;
              return (
                <Pressable
                  key={sign.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => onSelect(sign.id)}
                  style={({ pressed }) => [
                    styles.signOption,
                    selected ? styles.signOptionSelected : null,
                    pressed ? styles.pressed : null,
                  ]}
                  testID={`community-consent-sign-${sign.id}`}
                >
                  <Text style={styles.signOptionGlyph}>{sign.emoji}</Text>
                  <Text style={styles.signOptionName} numberOfLines={1}>{t(sign.nameKey)}</Text>
                </Pressable>
              );
            })}
          </View>

          {errorKey ? <Notice t={t} errorKey={errorKey} /> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy || !selectedSignId }}
            disabled={busy || !selectedSignId}
            onPress={onSave}
            style={({ pressed }) => [
              styles.primaryButton,
              busy || !selectedSignId ? styles.disabled : null,
              pressed ? styles.pressed : null,
            ]}
            testID="community-consent-save"
          >
            {busy ? <ActivityIndicator color={colors.background} /> : (
              <>
                <Text style={styles.primaryButtonText}>{t('community.signConsent.save')}</Text>
                <Ionicons name="eye-outline" size={18} color={colors.background} />
              </>
            )}
          </Pressable>

          {hasPublicSign ? (
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onHide}
              style={pressedOpacity(styles.destructiveQuietButton)}
              testID="community-consent-hide"
            >
              <Ionicons name="eye-off-outline" size={17} color={colors.textSecondary} />
              <Text style={styles.destructiveQuietText}>{t('community.signConsent.hide')}</Text>
            </Pressable>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={onClose}
            style={pressedOpacity(styles.quietButton)}
            testID="community-consent-close"
          >
            <Text style={styles.quietButtonText}>{t('community.signConsent.notNow')}</Text>
          </Pressable>
        </ScrollView>
      </ModalFrame>
    </Modal>
  );
}

export function ConversationComposerModal({
  visible,
  t,
  room,
  targetSign,
  title,
  body,
  busy,
  errorKey,
  onChangeTitle,
  onChangeBody,
  onPublish,
  onClose,
}) {
  const disabled = busy || !String(title || '').trim() || !String(body || '').trim();
  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(visible)}
      onRequestClose={busy ? undefined : onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardFill}
      >
        <ModalFrame onClose={busy ? undefined : onClose} testID="community-composer-modal">
          <ScrollView
            contentContainerStyle={styles.modalScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.modalEyebrow}>{room ? t(room.titleKey) : ''}</Text>
            <Text style={styles.modalTitle}>{t('community.composer.title')}</Text>
            <Text style={styles.modalBody}>{t('community.composer.body')}</Text>

            {room?.id !== 'plaza' && targetSign ? (
              <View style={styles.targetChip}>
                <Text style={styles.targetChipGlyph}>{targetSign.emoji}</Text>
                <Text style={styles.targetChipText}>{t(targetSign.nameKey)}</Text>
              </View>
            ) : null}

            <TextInput
              accessibilityLabel={t('community.composer.titlePlaceholder')}
              autoCapitalize="sentences"
              editable={!busy}
              maxLength={120}
              onChangeText={onChangeTitle}
              placeholder={t('community.composer.titlePlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.composerTitleInput}
              value={title}
            />
            <TextInput
              accessibilityLabel={t('community.composer.bodyPlaceholder')}
              editable={!busy}
              maxLength={2000}
              multiline
              onChangeText={onChangeBody}
              placeholder={t('community.composer.bodyPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.composerBodyInput}
              textAlignVertical="top"
              value={body}
            />

            {errorKey ? <Notice t={t} errorKey={errorKey} /> : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={onPublish}
              style={({ pressed }) => [
                styles.primaryButton,
                disabled ? styles.disabled : null,
                pressed ? styles.pressed : null,
              ]}
              testID="community-composer-publish"
            >
              {busy ? <ActivityIndicator color={colors.background} /> : (
                <>
                  <Text style={styles.primaryButtonText}>{t('community.composer.publish')}</Text>
                  <Ionicons name="send-outline" size={17} color={colors.background} />
                </>
              )}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onClose}
              style={pressedOpacity(styles.quietButton)}
              testID="community-composer-close"
            >
              <Text style={styles.quietButtonText}>{t('community.composer.cancel')}</Text>
            </Pressable>
          </ScrollView>
        </ModalFrame>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const ThreadComment = React.memo(function ThreadComment({
  comment,
  t,
  myUserId,
  onDelete,
  onModerate,
}) {
  const isMine = String(comment?.user_id) === String(myUserId);
  return (
    <View style={styles.threadComment} testID={`community-comment-${comment?.id}`}>
      <View style={styles.threadCommentAvatar}>
        <Text style={styles.threadCommentAvatarText}>{comment?.avatar_emoji || '✦'}</Text>
      </View>
      <View style={styles.threadCommentCopy}>
        <View style={styles.threadCommentHeading}>
          <View style={styles.threadCommentAuthorCopy}>
            <Text style={styles.commentAuthor} numberOfLines={1}>{comment?.display_name}</Text>
            <Text style={styles.commentMeta} numberOfLines={1}>
              @{comment?.username} · {formatSocialTimeAgo(comment?.created_at, t)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(isMine ? 'community.comment.delete' : 'social.mod.cta')}
            onPress={() => (
              isMine
                ? onDelete(comment)
                : onModerate('comment', comment?.id, comment?.user_id)
            )}
            style={pressedOpacity(styles.threadMenuButton)}
            testID={`community-${isMine ? 'delete' : 'moderate'}-comment-${comment?.id}`}
          >
            <Ionicons
              name={isMine ? 'trash-outline' : 'ellipsis-horizontal'}
              size={17}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
        <Text style={styles.commentBody}>{comment?.body}</Text>
      </View>
    </View>
  );
});

export function ConversationThreadModal({
  visible,
  t,
  post,
  myUserId,
  comments,
  commentsLoading,
  errorKey,
  noticeKey,
  text,
  busy,
  onChangeText,
  onSend,
  onRetry,
  onClose,
  onToggleLike,
  onDeletePost,
  onDeleteComment,
  onModerate,
}) {
  if (!post) return null;
  const isMine = String(post.user_id) === String(myUserId);
  const signA = getCommunitySign(post.sign_a);
  const signB = getCommunitySign(post.sign_b);
  const hasRelation = Boolean(signA && signB && post.relation);
  const cleanText = String(text || '').trim();
  const sendDisabled = busy || !cleanText;

  const postHeader = (
    <View style={styles.threadPost}>
      <View style={styles.threadPostHeader}>
        <View style={styles.avatarWell}>
          <Text style={styles.avatarEmoji}>{post.avatar_emoji || '✦'}</Text>
        </View>
        <View style={styles.postAuthorCopy}>
          <Text style={styles.postAuthor} numberOfLines={1}>{post.display_name}</Text>
          <Text style={styles.postMeta} numberOfLines={1}>
            @{post.username} · {formatSocialTimeAgo(post.created_at, t)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(isMine ? 'social.delete.cta' : 'social.mod.cta')}
          onPress={() => (
            isMine
              ? onDeletePost(post)
              : onModerate('post', post.id, post.user_id)
          )}
          style={pressedOpacity(styles.threadMenuButton)}
          testID={`community-thread-${isMine ? 'delete' : 'moderate'}-post`}
        >
          <Ionicons
            name={isMine ? 'trash-outline' : 'ellipsis-horizontal'}
            size={18}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {hasRelation ? (
        <View style={styles.relationChip}>
          <Text style={styles.relationGlyph}>{signA.emoji}</Text>
          <View style={styles.relationRule} />
          <Text style={styles.relationGlyph}>{signB.emoji}</Text>
          <Text style={styles.relationText}>{t(`community.relation.${post.relation}`)}</Text>
        </View>
      ) : null}

      <Text style={styles.threadPostTitle}>{post.title}</Text>
      <Text style={styles.threadPostBody}>{post.body}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(post.liked_by_me ? 'social.unlike' : 'social.like')}
        onPress={() => onToggleLike(post)}
        style={pressedOpacity(styles.threadLikeButton)}
        testID="community-thread-like"
      >
        <Ionicons
          name={post.liked_by_me ? 'heart' : 'heart-outline'}
          size={19}
          color={post.liked_by_me ? colors.pink : colors.textMuted}
        />
        <Text style={[styles.postCountText, post.liked_by_me ? styles.postCountLiked : null]}>
          {String(Number(post.like_count) || 0)}
        </Text>
      </Pressable>
      <View style={styles.threadDivider} />
      <Text style={styles.commentsHeading}>{t('social.comments')}</Text>
      {noticeKey ? <Notice t={t} noticeKey={noticeKey} /> : null}
      {errorKey ? <Notice t={t} errorKey={errorKey} /> : null}
      {commentsLoading ? (
        <View
          accessibilityLabel={t('community.discovery.loading')}
          accessibilityRole="progressbar"
          style={styles.threadLoading}
          testID="community-comments-loading"
        >
          <ActivityIndicator color={colors.gold} />
        </View>
      ) : null}
      {!commentsLoading && comments === null ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={pressedOpacity(styles.threadRetry)}
          testID="community-comments-retry"
        >
          <Ionicons name="refresh" size={17} color={colors.gold} />
          <Text style={styles.threadRetryText}>{t('community.error.retry')}</Text>
        </Pressable>
      ) : null}
    </View>
  );

  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(visible)}
      onRequestClose={busy ? undefined : onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardFill}
      >
        <ModalFrame onClose={busy ? undefined : onClose} testID="community-thread-modal">
          <View style={styles.threadHeaderBar}>
            <View>
              <Text style={styles.modalEyebrow}>{t('community.discovery.eyebrow')}</Text>
              <Text style={styles.threadHeaderTitle}>{t('social.comments')}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.comments.close')}
              disabled={busy}
              onPress={onClose}
              style={pressedOpacity(styles.threadCloseButton)}
              testID="community-thread-close"
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <FlatList
            style={styles.threadList}
            contentContainerStyle={styles.threadListContent}
            data={Array.isArray(comments) ? comments : EMPTY_POSTS}
            keyExtractor={postKey}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={postHeader}
            ListEmptyComponent={commentsLoading || comments === null ? null : (
              <Text style={styles.emptyComments}>{t('social.noComments')}</Text>
            )}
            renderItem={({ item }) => (
              <ThreadComment
                comment={item}
                t={t}
                myUserId={myUserId}
                onDelete={onDeleteComment}
                onModerate={onModerate}
              />
            )}
            showsVerticalScrollIndicator={false}
            testID="community-thread-comments"
          />

          <View style={styles.commentComposer}>
            <TextInput
              accessibilityLabel={t('community.composer.commentPlaceholder')}
              editable={!busy}
              maxLength={500}
              multiline
              onChangeText={onChangeText}
              placeholder={t('community.composer.commentPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={styles.commentInput}
              value={text}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.comments.send')}
              accessibilityState={{ disabled: sendDisabled }}
              disabled={sendDisabled}
              onPress={onSend}
              style={({ pressed }) => [
                styles.commentSendButton,
                sendDisabled ? styles.disabled : null,
                pressed ? styles.pressed : null,
              ]}
              testID="community-comment-send"
            >
              {busy ? (
                <ActivityIndicator color={colors.background} size="small" />
              ) : (
                <Ionicons name="arrow-up" size={20} color={colors.background} />
              )}
            </Pressable>
          </View>
        </ModalFrame>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function GuidelinesConsentModal({
  visible,
  t,
  checked,
  busy,
  errorKey,
  onToggle,
  onOpenGuidelines,
  onAccept,
  onClose,
}) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(visible)}
      onRequestClose={busy ? undefined : onClose}
    >
      <ModalFrame onClose={busy ? undefined : onClose} testID="community-guidelines-modal">
        <View style={styles.modalScroll}>
          <View style={styles.guidelinesIcon}>
            <Ionicons name="shield-checkmark-outline" size={26} color={colors.gold} />
          </View>
          <Text style={styles.modalTitle}>{t('community.guidelines.accept.title')}</Text>
          <Text style={styles.modalBody}>{t('community.guidelines.accept.body')}</Text>

          <Pressable
            accessibilityRole="link"
            disabled={busy}
            onPress={onOpenGuidelines}
            style={pressedOpacity(styles.guidelinesLink)}
            testID="community-guidelines-open"
          >
            <Text style={styles.guidelinesLinkText}>{t('community.guidelines.accept.open')}</Text>
            <Ionicons name="open-outline" size={17} color={colors.gold} />
          </Pressable>

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            disabled={busy}
            onPress={onToggle}
            style={pressedOpacity(styles.checkboxRow)}
            testID="community-guidelines-check"
          >
            <View style={[styles.checkbox, checked ? styles.checkboxChecked : null]}>
              {checked ? <Ionicons name="checkmark" size={16} color={colors.background} /> : null}
            </View>
            <Text style={styles.checkboxText}>{t('community.guidelines.accept.checkbox')}</Text>
          </Pressable>

          {errorKey ? <Notice t={t} errorKey={errorKey} /> : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy || !checked }}
            disabled={busy || !checked}
            onPress={onAccept}
            style={({ pressed }) => [
              styles.primaryButton,
              busy || !checked ? styles.disabled : null,
              pressed ? styles.pressed : null,
            ]}
            testID="community-guidelines-accept"
          >
            {busy ? <ActivityIndicator color={colors.background} /> : (
              <>
                <Text style={styles.primaryButtonText}>{t('community.guidelines.accept.cta')}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.background} />
              </>
            )}
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={onClose}
            style={pressedOpacity(styles.quietButton)}
            testID="community-guidelines-close"
          >
            <Text style={styles.quietButtonText}>{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </ModalFrame>
    </Modal>
  );
}

export default function CommunityHubScreen() {
  const navigation = useNavigation();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(undefined);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [posts, setPosts] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState('plaza');
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [noticeKey, setNoticeKey] = useState(null);
  const [operationErrorKey, setOperationErrorKey] = useState(null);
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [signDraft, setSignDraft] = useState(null);
  const [composerVisible, setComposerVisible] = useState(false);
  const [composerTitle, setComposerTitle] = useState('');
  const [composerBody, setComposerBody] = useState('');
  const [guidelinesVisible, setGuidelinesVisible] = useState(false);
  const [guidelinesChecked, setGuidelinesChecked] = useState(false);
  const [pendingPost, setPendingPost] = useState(null);
  const [pendingComment, setPendingComment] = useState(null);
  const [operationBusy, setOperationBusy] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [comments, setComments] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [threadBusy, setThreadBusy] = useState(false);
  const [threadErrorKey, setThreadErrorKey] = useState(null);
  const [threadNoticeKey, setThreadNoticeKey] = useState(null);
  const selectedRoomRef = useRef('plaza');
  const loadedUserRef = useRef(null);
  const profileRequestRef = useRef(0);
  const feedRequestRef = useRef(0);
  const commentsRequestRef = useRef(0);
  const likingPostIdsRef = useRef(new Set());

  const publicSign = useMemo(
    () => (hasPublicCommunitySign(profile) ? getCommunitySign(profile.zodiac_sign) : null),
    [profile]
  );
  const suggestions = useMemo(
    () => (publicSign ? communitySuggestionsFor(publicSign) : EMPTY_SUGGESTIONS),
    [publicSign]
  );
  const selectedRoom = getCommunityRoom(selectedRoomId) || COMMUNITY_ROOMS[0];
  const selectedTargetSign = getCommunitySign(selectedTargetId);

  const handleCommunitySuspension = useCallback((error) => {
    if (!isCommunitySuspendedError(error)) return false;

    // Invalida respostas em voo antes de apagar qualquer dado visível. Assim,
    // uma resposta antiga não consegue repor perfil, feed ou comentários após
    // o servidor confirmar que a participação desta conta está suspensa.
    profileRequestRef.current += 1;
    feedRequestRef.current += 1;
    commentsRequestRef.current += 1;
    likingPostIdsRef.current.clear();

    selectedRoomRef.current = 'plaza';
    setProfile(undefined);
    setProfileLoading(false);
    setProfileError(COMMUNITY_SUSPENDED_ERROR_KEY);
    setPosts([]);
    setFeedLoading(false);
    setFeedError(false);
    setRefreshing(false);
    setSelectedRoomId('plaza');
    setSelectedTargetId(null);
    setNoticeKey(null);
    setOperationErrorKey(null);
    setSignModalVisible(false);
    setSignDraft(null);
    setComposerVisible(false);
    setComposerTitle('');
    setComposerBody('');
    setGuidelinesVisible(false);
    setGuidelinesChecked(false);
    setPendingPost(null);
    setPendingComment(null);
    setOperationBusy(false);
    setActivePost(null);
    setComments(null);
    setCommentsLoading(false);
    setCommentText('');
    setThreadBusy(false);
    setThreadErrorKey(null);
    setThreadNoticeKey(null);
    return true;
  }, []);

  const loadRoom = useCallback(async (roomId) => {
    const validRoomId = getCommunityRoom(roomId)?.id || 'plaza';
    const requestId = feedRequestRef.current + 1;
    feedRequestRef.current = requestId;
    setFeedLoading(true);
    setFeedError(false);
    setPosts([]);
    try {
      const result = await getCommunityRoomFeed(validRoomId);
      if (feedRequestRef.current !== requestId) return;
      setPosts(Array.isArray(result?.posts) ? result.posts : []);
    } catch (error) {
      if (feedRequestRef.current !== requestId) return;
      if (handleCommunitySuspension(error)) return;
      setFeedError(true);
    } finally {
      if (feedRequestRef.current === requestId) setFeedLoading(false);
    }
  }, [handleCommunitySuspension]);

  const loadHub = useCallback(async () => {
    if (!user) {
      loadedUserRef.current = null;
      setProfile(undefined);
      setProfileLoading(false);
      setProfileError(null);
      setPosts([]);
      setActivePost(null);
      setComments(null);
      return;
    }
    const nextUserId = String(user.id || '');
    if (loadedUserRef.current !== nextUserId) {
      // Uma troca de sessão nunca pode mostrar por um frame o perfil ou o feed
      // da conta anterior enquanto a nova chamada ainda está em andamento.
      loadedUserRef.current = nextUserId;
      setProfile(undefined);
      setPosts([]);
      setActivePost(null);
      setComments(null);
    }
    const requestId = profileRequestRef.current + 1;
    profileRequestRef.current = requestId;
    setProfileLoading(true);
    setProfileError(null);
    try {
      const nextProfile = await getMySocialProfile();
      if (profileRequestRef.current !== requestId) return;
      setProfile(nextProfile || null);
      if (nextProfile) await loadRoom(selectedRoomRef.current);
      else setPosts([]);
    } catch (error) {
      if (profileRequestRef.current !== requestId) return;
      if (handleCommunitySuspension(error)) return;
      setProfileError(communityErrorKey(error));
    } finally {
      if (profileRequestRef.current === requestId) setProfileLoading(false);
    }
  }, [handleCommunitySuspension, loadRoom, user]);

  useFocusEffect(
    useCallback(() => {
      loadHub();
      return () => {
        profileRequestRef.current += 1;
        feedRequestRef.current += 1;
        commentsRequestRef.current += 1;
      };
    }, [loadHub])
  );

  const resetMessages = useCallback(() => {
    setNoticeKey(null);
    setOperationErrorKey(null);
  }, []);

  const selectRoom = useCallback((roomId) => {
    const room = getCommunityRoom(roomId);
    if (!room) return;
    resetMessages();
    commentsRequestRef.current += 1;
    setActivePost(null);
    setComments(null);
    let targetId = null;
    if (room.id !== 'plaza') {
      targetId = targetIdForSuggestion(
        suggestions.find((suggestion) => suggestion?.roomId === room.id)
      );
    }
    selectedRoomRef.current = room.id;
    setSelectedRoomId(room.id);
    setSelectedTargetId(targetId);
    loadRoom(room.id);
  }, [loadRoom, resetMessages, suggestions]);

  const selectTarget = useCallback((targetId) => {
    const suggestion = suggestions.find(
      (item) => targetIdForSuggestion(item) === String(targetId)
    );
    if (!suggestion?.roomId) return;
    resetMessages();
    commentsRequestRef.current += 1;
    setActivePost(null);
    setComments(null);
    selectedRoomRef.current = suggestion.roomId;
    setSelectedRoomId(suggestion.roomId);
    setSelectedTargetId(String(targetId));
    loadRoom(suggestion.roomId);
  }, [loadRoom, resetMessages, suggestions]);

  const openSignConsent = useCallback(() => {
    resetMessages();
    setSignDraft(publicSign?.id || null);
    setSignModalVisible(true);
  }, [publicSign, resetMessages]);

  const savePublicSign = useCallback(async () => {
    if (!signDraft) return;
    setOperationBusy(true);
    setOperationErrorKey(null);
    try {
      const nextProfile = await updateCommunityProfile({
        zodiacSign: signDraft,
        showZodiacSign: true,
      });
      setProfile(nextProfile);
      const nextSuggestions = communitySuggestionsFor(signDraft);
      if (selectedRoomRef.current !== 'plaza') {
        const nextTarget = targetIdForSuggestion(
          nextSuggestions.find((suggestion) => suggestion?.roomId === selectedRoomRef.current)
        );
        setSelectedTargetId(nextTarget);
      }
      setSignModalVisible(false);
      setNoticeKey('community.success.signSaved');
    } catch (error) {
      if (handleCommunitySuspension(error)) return;
      setOperationErrorKey(communityErrorKey(error));
    } finally {
      setOperationBusy(false);
    }
  }, [handleCommunitySuspension, signDraft]);

  const hidePublicSign = useCallback(async () => {
    setOperationBusy(true);
    setOperationErrorKey(null);
    try {
      const nextProfile = await updateCommunityProfile({
        zodiacSign: null,
        showZodiacSign: false,
      });
      setProfile(nextProfile);
      setSelectedTargetId(null);
      selectedRoomRef.current = 'plaza';
      setSelectedRoomId('plaza');
      setSignModalVisible(false);
      setNoticeKey('community.success.signHidden');
      await loadRoom('plaza');
    } catch (error) {
      if (handleCommunitySuspension(error)) return;
      setOperationErrorKey(communityErrorKey(error));
    } finally {
      setOperationBusy(false);
    }
  }, [handleCommunitySuspension, loadRoom]);

  const openComposer = useCallback(() => {
    resetMessages();
    if (selectedRoomId !== 'plaza' && !publicSign) {
      setSignDraft(null);
      setSignModalVisible(true);
      return;
    }
    if (selectedRoomId !== 'plaza' && !selectedTargetId) {
      const nextTarget = targetIdForSuggestion(
        suggestions.find((suggestion) => suggestion?.roomId === selectedRoomId)
      );
      if (!nextTarget) {
        setSignDraft(publicSign?.id || null);
        setSignModalVisible(true);
        return;
      }
      setSelectedTargetId(nextTarget);
    }
    setComposerVisible(true);
  }, [publicSign, resetMessages, selectedRoomId, selectedTargetId, suggestions]);

  const updateVisiblePost = useCallback((postId, transform) => {
    setPosts((current) => current.map((post) => (
      String(post.id) === String(postId) ? transform(post) : post
    )));
    setActivePost((current) => (
      current && String(current.id) === String(postId) ? transform(current) : current
    ));
  }, []);

  const loadComments = useCallback(async (postId) => {
    if (!postId) return;
    const requestId = commentsRequestRef.current + 1;
    commentsRequestRef.current = requestId;
    setCommentsLoading(true);
    setComments(null);
    setThreadErrorKey(null);
    try {
      const nextComments = await getSocialComments(postId);
      if (commentsRequestRef.current !== requestId) return;
      const safeComments = Array.isArray(nextComments) ? nextComments : [];
      setComments(safeComments);
      updateVisiblePost(postId, (post) => updatePostCommentCount(post, safeComments.length));
    } catch (error) {
      if (commentsRequestRef.current !== requestId) return;
      if (handleCommunitySuspension(error)) return;
      setThreadErrorKey(communityErrorKey(error));
      setComments(null);
    } finally {
      if (commentsRequestRef.current === requestId) setCommentsLoading(false);
    }
  }, [handleCommunitySuspension, updateVisiblePost]);

  const openThread = useCallback((post) => {
    if (!post?.id) return;
    setActivePost(post);
    setComments(null);
    setCommentText('');
    setThreadErrorKey(null);
    setThreadNoticeKey(null);
    loadComments(post.id);
  }, [loadComments]);

  const closeThread = useCallback(() => {
    if (threadBusy) return;
    commentsRequestRef.current += 1;
    setActivePost(null);
    setComments(null);
    setCommentText('');
    setThreadErrorKey(null);
    setThreadNoticeKey(null);
    setPendingComment(null);
  }, [threadBusy]);

  const togglePostLike = useCallback(async (post) => {
    if (!post?.id || likingPostIdsRef.current.has(String(post.id))) return;
    const postId = String(post.id);
    const nextLiked = !Boolean(post.liked_by_me);
    likingPostIdsRef.current.add(postId);
    setThreadErrorKey(null);
    try {
      if (nextLiked) await likeSocialPost(post.id);
      else await unlikeSocialPost(post.id);
      updateVisiblePost(post.id, (current) => updatePostLikeState(current, nextLiked));
    } catch (error) {
      if (handleCommunitySuspension(error)) return;
      const key = communityErrorKey(error);
      setThreadErrorKey(key);
      setOperationErrorKey(key);
    } finally {
      likingPostIdsRef.current.delete(postId);
    }
  }, [handleCommunitySuspension, updateVisiblePost]);

  const deletePost = useCallback((post) => {
    if (!post?.id) return;
    Alert.alert(t('social.delete.title'), t('social.delete.body'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('social.delete.cta'),
        style: 'destructive',
        onPress: async () => {
          setThreadBusy(true);
          setThreadErrorKey(null);
          try {
            await deleteSocialPost(post.id);
            setPosts((current) => current.filter((item) => String(item.id) !== String(post.id)));
            setActivePost((current) => (
              current && String(current.id) === String(post.id) ? null : current
            ));
            setComments(null);
            setCommentText('');
            setNoticeKey('community.success.postDeleted');
          } catch (error) {
            if (handleCommunitySuspension(error)) return;
            setThreadErrorKey('social.error.deletePost');
            setOperationErrorKey('social.error.deletePost');
          } finally {
            setThreadBusy(false);
          }
        },
      },
    ]);
  }, [handleCommunitySuspension, t]);

  const deleteComment = useCallback((comment) => {
    if (!comment?.id || !activePost?.id) return;
    Alert.alert(t('community.comment.deleteTitle'), t('community.comment.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('community.comment.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          setThreadBusy(true);
          setThreadErrorKey(null);
          setThreadNoticeKey(null);
          try {
            await deleteSocialComment(comment.id);
            const next = Array.isArray(comments)
              ? comments.filter((item) => String(item.id) !== String(comment.id))
              : [];
            setComments(next);
            updateVisiblePost(activePost.id, (post) => updatePostCommentCount(post, next.length));
            setThreadNoticeKey('community.success.commentDeleted');
          } catch (error) {
            if (handleCommunitySuspension(error)) return;
            setThreadErrorKey('community.error.deleteComment');
          } finally {
            setThreadBusy(false);
          }
        },
      },
    ]);
  }, [activePost?.id, comments, handleCommunitySuspension, t, updateVisiblePost]);

  const submitComment = useCallback(async ({ postId, body }) => {
    setThreadBusy(true);
    setThreadErrorKey(null);
    setThreadNoticeKey(null);
    try {
      await addSocialComment(postId, body);
      setCommentText('');
      setPendingComment(null);
      updateVisiblePost(postId, (post) => updatePostCommentCount(
        post,
        (Number(post.comment_count) || 0) + 1
      ));
      try {
        const nextComments = await getSocialComments(postId);
        const safeComments = Array.isArray(nextComments) ? nextComments : [];
        setComments(safeComments);
        updateVisiblePost(postId, (post) => updatePostCommentCount(post, safeComments.length));
      } catch (reloadError) {
        if (handleCommunitySuspension(reloadError)) return false;
        setComments(null);
        setThreadErrorKey(communityErrorKey(reloadError));
      }
      return true;
    } catch (error) {
      if (handleCommunitySuspension(error)) return false;
      if (error?.code === 'community_guidelines_required') {
        setPendingPost(null);
        setPendingComment({ postId, body });
        setGuidelinesChecked(false);
        setGuidelinesVisible(true);
      } else {
        setThreadErrorKey(communityErrorKey(error));
      }
      return false;
    } finally {
      setThreadBusy(false);
    }
  }, [handleCommunitySuspension, updateVisiblePost]);

  const beginComment = useCallback(() => {
    const body = String(commentText || '').trim();
    if (!activePost?.id || !body) return;
    const payload = { postId: activePost.id, body };
    setPendingPost(null);
    setOperationErrorKey(null);
    if (!hasAcceptedCommunityGuidelines(profile)) {
      setPendingComment(payload);
      setGuidelinesChecked(false);
      setGuidelinesVisible(true);
      return;
    }
    submitComment(payload);
  }, [activePost?.id, commentText, profile, submitComment]);

  const moderateContent = useCallback((kind, targetId, targetUserId) => {
    if (!targetId || !targetUserId || String(targetUserId) === String(user?.id)) return;

    const report = () => {
      const sendReport = async (reason) => {
        setThreadBusy(true);
        setThreadErrorKey(null);
        try {
          await reportContent({ kind, targetId, reason });
          Alert.alert(
            t('report.thanks.title'),
            t('report.thanks.body'),
            [{ text: t('common.ok') }]
          );
        } catch (error) {
          if (handleCommunitySuspension(error)) return;
          Alert.alert(t('social.mod.failed'), t('social.mod.failedBody'));
        } finally {
          setThreadBusy(false);
        }
      };

      Alert.alert(t('social.mod.report'), t('social.mod.reportBody'), [
        { text: t('report.reason.offensive'), onPress: () => sendReport('offensive') },
        { text: t('social.mod.reasonSpam'), onPress: () => sendReport('spam') },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    };

    const block = () => {
      Alert.alert(t('social.mod.block'), t('social.mod.blockBody'), [
        {
          text: t('social.mod.block'),
          style: 'destructive',
          onPress: async () => {
            setThreadBusy(true);
            setThreadErrorKey(null);
            try {
              await blockSocialUser(targetUserId);
              setPosts((current) => removeUserContent(current, targetUserId));
              if (activePost && String(activePost.user_id) === String(targetUserId)) {
                setComments(null);
                setCommentText('');
              } else {
                const remainingComments = removeUserContent(comments, targetUserId);
                setComments(remainingComments);
                if (activePost?.id) {
                  updateVisiblePost(
                    activePost.id,
                    (post) => updatePostCommentCount(post, remainingComments.length)
                  );
                }
              }
              setActivePost((current) => (
                current && String(current.user_id) === String(targetUserId) ? null : current
              ));
              Alert.alert(t('social.mod.blockedTitle'), t('social.mod.blockedBody'), [
                {
                  text: t('social.mod.undo'),
                  onPress: async () => {
                    try {
                      await unblockSocialUser(targetUserId);
                      await loadRoom(selectedRoomRef.current);
                    } catch (error) {
                      if (handleCommunitySuspension(error)) return;
                      Alert.alert(t('social.mod.failed'), t('social.mod.failedBody'));
                    }
                  },
                },
                { text: t('common.ok'), style: 'cancel' },
              ]);
            } catch (error) {
              if (handleCommunitySuspension(error)) return;
              Alert.alert(t('social.mod.failed'), t('social.mod.failedBody'));
            } finally {
              setThreadBusy(false);
            }
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    };

    Alert.alert(t('social.mod.cta'), t('social.mod.menuBody'), [
      { text: t('social.mod.report'), onPress: report },
      { text: t('social.mod.block'), style: 'destructive', onPress: block },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }, [activePost, comments, handleCommunitySuspension, loadRoom, t, updateVisiblePost, user?.id]);

  const finishPublishedPost = useCallback(async (payload) => {
    setComposerVisible(false);
    setGuidelinesVisible(false);
    setComposerTitle('');
    setComposerBody('');
    setPendingPost(null);
    setGuidelinesChecked(false);
    setOperationErrorKey(null);
    setNoticeKey('community.success.conversationPublished');
    await loadRoom(payload.roomId);
  }, [loadRoom]);

  const publishPayload = useCallback(async (payload) => {
    setOperationBusy(true);
    setOperationErrorKey(null);
    try {
      await createCommunityPost(payload);
      await finishPublishedPost(payload);
    } catch (error) {
      if (handleCommunitySuspension(error)) return;
      const key = communityErrorKey(error);
      setOperationErrorKey(key);
      if (error?.code === 'community_guidelines_required') {
        setPendingPost(payload);
        setComposerVisible(false);
        setGuidelinesChecked(false);
        setGuidelinesVisible(true);
      }
    } finally {
      setOperationBusy(false);
    }
  }, [finishPublishedPost, handleCommunitySuspension]);

  const beginPublish = useCallback(() => {
    setPendingComment(null);
    const payload = buildCommunityPostPayload({
      roomId: selectedRoomId,
      targetSign: selectedTargetId,
      title: composerTitle,
      body: composerBody,
    });
    if (!payload.title || !payload.body) return;
    if (payload.roomId !== 'plaza' && !payload.targetSign) {
      setOperationErrorKey('community.error.community_public_sign_required');
      return;
    }
    if (!hasAcceptedCommunityGuidelines(profile)) {
      setPendingPost(payload);
      setComposerVisible(false);
      setGuidelinesChecked(false);
      setGuidelinesVisible(true);
      return;
    }
    publishPayload(payload);
  }, [composerBody, composerTitle, profile, publishPayload, selectedRoomId, selectedTargetId]);

  const acceptAndPublish = useCallback(async () => {
    if (!guidelinesChecked || (!pendingPost && !pendingComment)) return;
    setOperationBusy(true);
    setOperationErrorKey(null);
    try {
      const acceptance = await acceptCommunityGuidelines();
      setProfile((current) => ({
        ...current,
        community_guidelines_version: acceptance?.version || current?.community_guidelines_version,
        community_guidelines_accepted_at: acceptance?.acceptedAt || new Date().toISOString(),
      }));
      if (pendingComment) {
        await addSocialComment(pendingComment.postId, pendingComment.body);
        setCommentText('');
        setPendingComment(null);
        setGuidelinesVisible(false);
        setGuidelinesChecked(false);
        setThreadErrorKey(null);
        setThreadNoticeKey('community.success.guidelinesAccepted');
        updateVisiblePost(
          pendingComment.postId,
          (post) => updatePostCommentCount(post, (Number(post.comment_count) || 0) + 1)
        );
        try {
          const nextComments = await getSocialComments(pendingComment.postId);
          const safeComments = Array.isArray(nextComments) ? nextComments : [];
          setComments(safeComments);
          updateVisiblePost(
            pendingComment.postId,
            (post) => updatePostCommentCount(post, safeComments.length)
          );
        } catch (reloadError) {
          if (handleCommunitySuspension(reloadError)) return;
          setComments(null);
          setThreadErrorKey(communityErrorKey(reloadError));
          setThreadNoticeKey(null);
        }
        return;
      }
      await createCommunityPost(pendingPost);
      await finishPublishedPost(pendingPost);
    } catch (error) {
      if (handleCommunitySuspension(error)) return;
      const key = communityErrorKey(error);
      if (pendingComment) setThreadErrorKey(key);
      setOperationErrorKey(key);
    } finally {
      setOperationBusy(false);
    }
  }, [finishPublishedPost, guidelinesChecked, handleCommunitySuspension, pendingComment, pendingPost, updateVisiblePost]);

  const closeGuidelines = useCallback(() => {
    setGuidelinesVisible(false);
    setGuidelinesChecked(false);
    setComposerVisible(Boolean(pendingPost));
  }, [pendingPost]);

  const openGuidelines = useCallback(() => {
    setGuidelinesVisible(false);
    setGuidelinesChecked(false);
    setComposerVisible(Boolean(pendingPost));
    navigation.navigate(ROUTES.COMMUNITY_GUIDELINES);
  }, [navigation, pendingPost]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await loadHub();
    setRefreshing(false);
  }, [loadHub]);

  return (
    <View style={styles.root}>
      <CommunityHubState
        t={t}
        user={user}
        authLoading={authLoading}
        profile={profile}
        profileLoading={profileLoading}
        profileError={profileError}
        posts={posts}
        feedLoading={feedLoading}
        feedError={feedError}
        refreshing={refreshing}
        selectedRoomId={selectedRoomId}
        selectedTargetId={selectedTargetId}
        publicSign={publicSign}
        suggestions={suggestions}
        noticeKey={noticeKey}
        operationErrorKey={signModalVisible || composerVisible || guidelinesVisible ? null : operationErrorKey}
        onLogin={() => navigation.navigate(ROUTES.LOGIN)}
        onCreateProfile={() => navigation.navigate(ROUTES.SOCIAL)}
        onRetryProfile={loadHub}
        onRetryFeed={() => loadRoom(selectedRoomId)}
        onRefresh={refresh}
        onOpenSign={openSignConsent}
        onSelectRoom={selectRoom}
        onSelectTarget={selectTarget}
        onOpenFollowing={() => navigation.navigate(ROUTES.SOCIAL)}
        onCompose={openComposer}
        onOpenPost={openThread}
        onToggleLike={togglePostLike}
        onDeletePost={deletePost}
        onModerate={moderateContent}
      />

      <SignConsentModal
        visible={signModalVisible}
        t={t}
        selectedSignId={signDraft}
        hasPublicSign={Boolean(publicSign)}
        busy={operationBusy}
        errorKey={signModalVisible ? operationErrorKey : null}
        onSelect={setSignDraft}
        onSave={savePublicSign}
        onHide={hidePublicSign}
        onClose={() => {
          if (!operationBusy) {
            setSignModalVisible(false);
            setOperationErrorKey(null);
          }
        }}
      />

      <ConversationComposerModal
        visible={composerVisible}
        t={t}
        room={selectedRoom}
        targetSign={selectedTargetSign}
        title={composerTitle}
        body={composerBody}
        busy={operationBusy}
        errorKey={composerVisible ? operationErrorKey : null}
        onChangeTitle={setComposerTitle}
        onChangeBody={setComposerBody}
        onPublish={beginPublish}
        onClose={() => {
          if (!operationBusy) {
            setComposerVisible(false);
            setOperationErrorKey(null);
          }
        }}
      />

      <ConversationThreadModal
        visible={Boolean(activePost)}
        t={t}
        post={activePost}
        myUserId={user?.id}
        comments={comments}
        commentsLoading={commentsLoading}
        errorKey={threadErrorKey}
        noticeKey={threadNoticeKey}
        text={commentText}
        busy={threadBusy}
        onChangeText={setCommentText}
        onSend={beginComment}
        onRetry={() => loadComments(activePost?.id)}
        onClose={closeThread}
        onToggleLike={togglePostLike}
        onDeletePost={deletePost}
        onDeleteComment={deleteComment}
        onModerate={moderateContent}
      />

      <GuidelinesConsentModal
        visible={guidelinesVisible}
        t={t}
        checked={guidelinesChecked}
        busy={operationBusy}
        errorKey={guidelinesVisible ? operationErrorKey : null}
        onToggle={() => setGuidelinesChecked((value) => !value)}
        onOpenGuidelines={openGuidelines}
        onAccept={acceptAndPublish}
        onClose={closeGuidelines}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  stateRoot: { flex: 1, minHeight: 0, backgroundColor: colors.background },
  centerState: {
    flex: 1,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    padding: 24,
  },
  centerStateBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  guestContent: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingBottom: 44 },
  guestCard: {
    overflow: 'hidden',
    padding: 24,
    borderRadius: 28,
    borderCurve: 'continuous',
    backgroundColor: '#19121E',
    borderWidth: 1,
    borderColor: '#553C49',
  },
  guestOrbit: { height: 92, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  guestGlyph: {
    width: 66,
    height: 66,
    color: colors.gold,
    fontSize: 28,
    lineHeight: 64,
    textAlign: 'center',
    borderRadius: 33,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
    borderWidth: 1,
    borderColor: '#664B43',
  },
  guestGlyphGold: { color: colors.background, backgroundColor: colors.gold, borderColor: '#A27543' },
  guestThread: { width: 54, height: 1, backgroundColor: '#9D744D', transform: [{ rotate: '-12deg' }] },
  eyebrow: {
    color: colors.gold,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  guestTitle: {
    maxWidth: 330,
    marginTop: 9,
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.5,
  },
  guestBody: { marginTop: 12, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  truthNote: {
    minHeight: 58,
    marginTop: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    backgroundColor: '#211820',
  },
  truthNoteText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 18 },
  primaryButton: {
    minHeight: 50,
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: colors.gold,
  },
  primaryButtonText: { color: colors.background, fontSize: 14, fontWeight: '900' },
  profileRequiredCard: {
    alignItems: 'center',
    padding: 25,
    borderRadius: 24,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRequiredIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
  },
  profileRequiredTitle: {
    marginTop: 17,
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 23,
    lineHeight: 28,
    textAlign: 'center',
  },
  profileRequiredBody: {
    maxWidth: 310,
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  feedContent: { paddingBottom: 48 },
  signControl: {
    minHeight: 74,
    marginTop: 16,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 13,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signControlIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: '#2B202B',
  },
  signControlGlyph: { color: colors.gold, fontSize: 23 },
  signControlCopy: { flex: 1, gap: 2 },
  signControlTitle: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  signControlBody: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  notice: {
    minHeight: 50,
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
  },
  noticeSuccess: { backgroundColor: '#12201A', borderColor: '#315343' },
  noticeError: { backgroundColor: '#241416', borderColor: '#63383D' },
  noticeText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  feedHeading: {
    marginTop: 4,
    marginHorizontal: 16,
    marginBottom: 13,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 13,
  },
  feedHeadingRule: { width: 2, minHeight: 54, backgroundColor: colors.gold },
  feedHeadingCopy: { flex: 1, justifyContent: 'center', gap: 3 },
  feedTitle: { color: colors.text, fontFamily: DISPLAY_FONT, fontSize: 21, lineHeight: 26 },
  feedDescription: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  feedLoading: { minHeight: 124, alignItems: 'center', justifyContent: 'center' },
  errorCard: {
    width: '100%',
    maxWidth: 440,
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 15,
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#211419',
    borderWidth: 1,
    borderColor: '#65373D',
  },
  errorCardCompact: { width: 'auto', marginHorizontal: 16, marginBottom: 16 },
  errorCopy: { flex: 1, gap: 3 },
  errorTitle: { color: colors.text, fontSize: 13, lineHeight: 17, fontWeight: '800' },
  errorBody: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  retryButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
  },
  retryText: { color: colors.gold, fontSize: 10, lineHeight: 13, fontWeight: '800' },
  postCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  postOpenArea: { paddingTop: 17, paddingHorizontal: 17 },
  postAuthorRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatarWell: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
  },
  avatarEmoji: { fontSize: 21 },
  postAuthorCopy: { flex: 1 },
  postAuthor: { color: colors.text, fontSize: 13, lineHeight: 18, fontWeight: '800' },
  postMeta: { marginTop: 2, color: colors.textMuted, fontSize: 10, lineHeight: 14 },
  relationChip: {
    alignSelf: 'flex-start',
    minHeight: 34,
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderCurve: 'continuous',
    backgroundColor: '#241A23',
    borderWidth: 1,
    borderColor: '#513C43',
  },
  relationGlyph: { color: colors.gold, fontSize: 15 },
  relationRule: { width: 12, height: 1, backgroundColor: '#8E6747' },
  relationText: { maxWidth: 190, color: colors.textMuted, fontSize: 10, lineHeight: 13 },
  postTitle: { marginTop: 14, color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: '800' },
  postBody: { marginTop: 6, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  postCountText: { color: colors.textMuted, fontSize: 11 },
  postCountLiked: { color: colors.pink, fontWeight: '800' },
  postActions: {
    minHeight: 52,
    marginTop: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  postAction: {
    minWidth: 56,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 9,
    borderRadius: 13,
    borderCurve: 'continuous',
  },
  postActionSpacer: { flex: 1 },
  postMenuAction: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderCurve: 'continuous',
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: 40,
    backgroundColor: 'rgba(5, 3, 9, 0.82)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    overflow: 'hidden',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderCurve: 'continuous',
    backgroundColor: '#151019',
    borderWidth: 1,
    borderColor: '#503A48',
  },
  modalScroll: { padding: 22, paddingBottom: 28 },
  modalEyebrow: {
    color: colors.gold,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  modalTitle: {
    marginTop: 6,
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  modalBody: { marginTop: 8, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  privacyNote: {
    minHeight: 68,
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: '#11201E',
    borderWidth: 1,
    borderColor: '#31534E',
  },
  privacyNoteText: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 17 },
  signGrid: { marginTop: 18, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  signOption: {
    width: '31%',
    minWidth: 88,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 15,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOptionSelected: { backgroundColor: '#30231F', borderColor: colors.gold },
  signOptionGlyph: { color: colors.gold, fontSize: 22 },
  signOptionName: { marginTop: 3, color: colors.textSecondary, fontSize: 10, lineHeight: 13 },
  quietButton: {
    minHeight: 46,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderRadius: 14,
    borderCurve: 'continuous',
  },
  quietButtonText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  destructiveQuietButton: {
    minHeight: 46,
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
  },
  destructiveQuietText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  keyboardFill: { flex: 1 },
  targetChip: {
    alignSelf: 'flex-start',
    minHeight: 40,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderCurve: 'continuous',
    backgroundColor: '#282025',
    borderWidth: 1,
    borderColor: '#604743',
  },
  targetChipGlyph: { color: colors.gold, fontSize: 19 },
  targetChipText: { color: colors.text, fontSize: 12, fontWeight: '800' },
  composerTitleInput: {
    minHeight: 50,
    marginTop: 17,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 14,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composerBodyInput: {
    minHeight: 142,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  threadHeaderBar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadHeaderTitle: {
    marginTop: 2,
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 20,
    lineHeight: 25,
  },
  threadCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
  },
  threadList: { flexShrink: 1 },
  threadListContent: { paddingBottom: 16 },
  threadPost: { paddingHorizontal: 20, paddingTop: 20 },
  threadPostHeader: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 11 },
  threadMenuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderCurve: 'continuous',
  },
  threadPostTitle: {
    marginTop: 17,
    color: colors.text,
    fontFamily: DISPLAY_FONT,
    fontSize: 22,
    lineHeight: 28,
  },
  threadPostBody: { marginTop: 9, color: colors.textSecondary, fontSize: 14, lineHeight: 22 },
  threadLikeButton: {
    alignSelf: 'flex-start',
    minWidth: 58,
    minHeight: 44,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
  },
  threadDivider: { height: 1, marginTop: 12, backgroundColor: colors.border },
  commentsHeading: {
    marginTop: 17,
    marginBottom: 7,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  threadLoading: { minHeight: 84, alignItems: 'center', justifyContent: 'center' },
  threadRetry: {
    minHeight: 48,
    marginVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
  },
  threadRetryText: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  threadComment: {
    minHeight: 72,
    marginHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  threadCommentAvatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderCurve: 'continuous',
    backgroundColor: '#2A2029',
  },
  threadCommentAvatarText: { fontSize: 19 },
  threadCommentCopy: { flex: 1, minWidth: 0 },
  threadCommentHeading: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  threadCommentAuthorCopy: { flex: 1, minWidth: 0 },
  commentAuthor: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  commentMeta: { marginTop: 1, color: colors.textMuted, fontSize: 9, lineHeight: 13 },
  commentBody: { marginTop: 3, color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  emptyComments: {
    marginHorizontal: 20,
    paddingVertical: 28,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  commentComposer: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: '#151019',
  },
  commentInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 112,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentSendButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderCurve: 'continuous',
    backgroundColor: colors.gold,
  },
  guidelinesIcon: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderCurve: 'continuous',
    backgroundColor: '#2B202B',
  },
  guidelinesLink: {
    minHeight: 46,
    marginTop: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderRadius: 13,
    borderCurve: 'continuous',
    backgroundColor: '#251C24',
    borderWidth: 1,
    borderColor: '#5A4145',
  },
  guidelinesLinkText: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  checkboxRow: {
    minHeight: 60,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceElevated,
  },
  checkbox: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.textMuted,
  },
  checkboxChecked: { backgroundColor: colors.gold, borderColor: colors.gold },
  checkboxText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
});
