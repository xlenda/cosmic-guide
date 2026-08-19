// screens/SocialScreen.js
// Feed social entre leitores solo (inspirado no app de leitura Ziggur) — só
// aparece pra quem usa o Cosmic Guide sozinho, sem parceiro pareado. Conteúdo
// de casal (Reconectar/Agir/leituras privadas) nunca passa por aqui: só o que
// a própria pessoa escolhe compartilhar do Diário Cósmico (ver DiaryScreen.js)
// vira post.
import React, { useCallback, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  ActivityIndicator, RefreshControl, FlatList,
} from 'react-native';
import { Alert } from '../lib/webAlert';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { colors, gradients } from '../theme';
import GradientHeader from '../components/GradientHeader';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import {
  getMySocialProfile, upsertSocialProfile, getSocialFeed, deleteSocialPost,
  likeSocialPost, unlikeSocialPost, getSocialComments, addSocialComment,
  searchSocialUsers, followSocialUser, unfollowSocialUser, getSocialUserProfile,
  reportContent, blockSocialUser, unblockSocialUser,
} from '../lib/socialClient';

const AVATAR_OPTIONS = ['🌙', '✨', '🔮', '🌟', '☀️', '🪐', '🦋', '🌊'];

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function ProfileSetup({ onCreated }) {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError('Preencha nome e username.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const profile = await upsertSocialProfile({ displayName, username: username.toLowerCase(), avatarEmoji });
      onCreated(profile);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('social.createProfile.title')}</Text>
        <Text style={styles.cardText}>{t('social.createProfile.desc')}</Text>

        <View style={styles.avatarRow}>
          {AVATAR_OPTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => setAvatarEmoji(emoji)}
              style={[styles.avatarOption, avatarEmoji === emoji && styles.avatarOptionActive]}
            >
              <Text style={styles.avatarEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Nome de exibição"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={60}
        />
        <TextInput
          value={username}
          onChangeText={(t) => setUsername(t.replace(/[^a-z0-9_]/gi, ''))}
          placeholder="username (só letras, números, _)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          maxLength={20}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity activeOpacity={0.85} onPress={submit} disabled={saving} style={{ borderRadius: 12, overflow: 'hidden', marginTop: 6 }}>
          <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('social.createProfile.cta')}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function PostCard({ post, myUserId, onToggleLike, onOpenComments, onOpenProfile, onDeletePost, onModerate }) {
  const { t } = useLanguage();
  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.postHeaderTouchable} onPress={() => onOpenProfile(post)}>
          <Text style={styles.postAvatar}>{post.avatar_emoji || '✨'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.postAuthor} numberOfLines={1}>{post.display_name}</Text>
            <Text style={styles.postMeta} numberOfLines={1}>@{post.username} · {timeAgo(post.created_at)}</Text>
          </View>
        </TouchableOpacity>
        {post.user_id === myUserId ? (
          <TouchableOpacity style={styles.iconBtn} onPress={() => onDeletePost(post)}>
            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onModerate('post', post.id, post.user_id)}
            accessibilityRole="button"
            accessibilityLabel={t('social.mod.cta')}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
      <Text style={styles.postBody} numberOfLines={4}>{post.body}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.postActionBtn} onPress={() => onToggleLike(post)}>
          <Ionicons name={post.liked_by_me ? 'heart' : 'heart-outline'} size={18} color={post.liked_by_me ? colors.pink : colors.textMuted} />
          <Text style={styles.postActionText}>{post.like_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionBtn} onPress={() => onOpenComments(post)}>
          <Ionicons name="chatbubble-outline" size={17} color={colors.textMuted} />
          <Text style={styles.postActionText}>{post.comment_count}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Painel de perfil de outro leitor — mesma estrutura de overlay do
// CommentsPanel (sem rota nova no navigator, self-contained aqui). Mostra
// contagens, botão seguir/deixar de seguir e as leituras compartilhadas
// visíveis (o backend já filtra: só aparece o body dos posts se for o dono ou
// quem segue — GET /users/:userId, canViewPosts).
function UserProfilePanel({ userId, myUserId, onClose, onFollowChange }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSocialUserProfile(userId).then(setData).catch(() => setData(null));
    }, [userId])
  );

  const toggleFollow = async () => {
    if (!data) return;
    setBusy(true);
    try {
      if (data.isFollowing) await unfollowSocialUser(userId);
      else await followSocialUser(userId);
      setData((prev) => ({
        ...prev,
        isFollowing: !prev.isFollowing,
        followers: prev.followers + (prev.isFollowing ? -1 : 1),
      }));
      onFollowChange?.();
    } catch (e) {
      Alert.alert('Não deu', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.commentsOverlay}>
      <View style={styles.commentsPanel}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>{t('social.profile')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {!data ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20, marginBottom: 20 }} />
        ) : (
          <>
            <View style={styles.profilePanelHeader}>
              <Text style={styles.profilePanelAvatar}>{data.profile.avatar_emoji || '✨'}</Text>
              <Text style={styles.postAuthor}>{data.profile.display_name}</Text>
              <Text style={styles.postMeta}>@{data.profile.username}</Text>
              <View style={styles.profilePanelStats}>
                <Text style={styles.profilePanelStat}>{data.followers} seguidores</Text>
                <Text style={styles.profilePanelStat}>{data.following} seguindo</Text>
              </View>
              {userId !== myUserId && (
                <TouchableOpacity disabled={busy} onPress={toggleFollow} style={[styles.followBtn, { marginTop: 10 }]}>
                  <Text style={styles.followBtnText}>{data.isFollowing ? 'Deixar de seguir' : 'Seguir'}</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={data.posts}
              keyExtractor={(p) => String(p.id)}
              style={{ maxHeight: 260 }}
              ListEmptyComponent={
                <Text style={styles.emptyComments}>
                  {data.isFollowing || userId === myUserId ? 'Nenhuma leitura compartilhada ainda.' : 'Siga essa pessoa pra ver as leituras compartilhadas.'}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.postBody} numberOfLines={2}>{item.body}</Text>
                  </View>
                </View>
              )}
            />
          </>
        )}
      </View>
    </View>
  );
}

function CommentsPanel({ post, myUserId, onClose, onModerate }) {
  const { t } = useLanguage();
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getSocialComments(post.id).then(setComments).catch(() => setComments([]));
    }, [post.id])
  );

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await addSocialComment(post.id, text.trim());
      setText('');
      setComments(await getSocialComments(post.id));
    } catch (e) {
      Alert.alert('Não deu', e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.commentsOverlay}>
      <View style={styles.commentsPanel}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>{t('social.comments')}</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {comments === null ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(c) => String(c.id)}
            style={{ maxHeight: 260 }}
            ListEmptyComponent={<Text style={styles.emptyComments}>{t('social.noComments')}</Text>}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Text style={styles.postAvatar}>{item.avatar_emoji || '✨'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentAuthor} numberOfLines={1}>{item.display_name}</Text>
                  <Text style={styles.commentBody}>{item.body}</Text>
                </View>
                {item.user_id !== myUserId && (
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => onModerate('comment', item.id, item.user_id)}
                    accessibilityRole="button"
                    accessibilityLabel={t('social.mod.cta')}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
        )}
        <View style={styles.commentInputRow}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Escreva um comentário..."
            placeholderTextColor={colors.textMuted}
            style={styles.commentInput}
          />
          <TouchableOpacity onPress={send} disabled={sending} style={styles.commentSendBtn}>
            <Ionicons name="send" size={18} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SearchPanel({ onFollowChange }) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);

  const search = async (q) => {
    setQuery(q);
    if (!q.trim()) return setResults([]);
    try {
      setResults(await searchSocialUsers(q.trim().toLowerCase()));
    } catch {
      setResults([]);
    }
  };

  const follow = async (userId) => {
    setBusy(true);
    try {
      await followSocialUser(userId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFollowChange?.();
    } catch (e) {
      Alert.alert('Não deu', e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.searchWrap}>
      <View style={styles.searchInputRow}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={search}
          placeholder="Buscar por @username pra seguir"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>
      {results.map((r) => (
        <View key={r.user_id} style={styles.searchResultRow}>
          <Text style={styles.postAvatar}>{r.avatar_emoji || '✨'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.postAuthor}>{r.display_name}</Text>
            <Text style={styles.postMeta}>@{r.username}</Text>
          </View>
          <TouchableOpacity disabled={busy} onPress={() => follow(r.user_id)} style={styles.followBtn}>
            <Text style={styles.followBtnText}>{t('social.follow')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export default function SocialScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(undefined); // undefined=carregando, null=não criado
  const [posts, setPosts] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeComments, setActiveComments] = useState(null);
  const [activeProfileUserId, setActiveProfileUserId] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  // Try/catch separado por chamada (achado real de auditoria, 18/07/2026): um
  // único try/catch envolvendo as duas chamadas fazia uma falha de rede só do
  // feed (getSocialFeed) derrubar um perfil que tinha acabado de carregar com
  // sucesso — jogando a pessoa de volta pra tela "Criar perfil social" por
  // causa de um hiccup que não tinha nada a ver com o perfil em si.
  const load = useCallback(async () => {
    if (!user) return;
    let p;
    try {
      p = await getMySocialProfile();
    } catch {
      setProfile(null);
      return;
    }
    setProfile(p);
    if (p) {
      try {
        const { posts: firstPage, meta } = await getSocialFeed();
        setPosts(firstPage);
        setNextCursor(meta?.next_cursor ?? null);
        setHasMore(!!meta?.has_next);
      } catch {
        // Feed não carregou agora — mantém o perfil válido e os posts
        // antigos na tela, em vez de resetar tudo por uma falha só do feed.
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Antes o feed ignorava has_next/next_cursor que o backend já expõe — a
  // FlatList nunca buscava além da primeira página. Achado real de auditoria
  // (19/07/2026).
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;
    setLoadingMore(true);
    try {
      const { posts: nextPage, meta } = await getSocialFeed(nextCursor);
      setPosts((prev) => [...prev, ...nextPage]);
      setNextCursor(meta?.next_cursor ?? null);
      setHasMore(!!meta?.has_next);
    } catch {
      // falha ao paginar — mantém o que já tem carregado, tenta de novo no próximo onEndReached
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  const toggleLike = async (post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? { ...p, liked_by_me: !p.liked_by_me, like_count: p.like_count + (p.liked_by_me ? -1 : 1) }
          : p
      )
    );
    try {
      if (post.liked_by_me) await unlikeSocialPost(post.id);
      else await likeSocialPost(post.id);
    } catch {
      load();
    }
  };

  // Antes deleteSocialPost existia no client mas nenhuma tela chamava —
  // quem compartilhava uma leitura não tinha como apagar depois. Achado real
  // de auditoria (19/07/2026).
  const handleDeletePost = (post) => {
    Alert.alert('Apagar publicação?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSocialPost(post.id);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e) {
            Alert.alert('Não deu', e.message);
          }
        },
      },
    ]);
  };

  // MODERAÇÃO (política de Conteúdo Gerado pelo Usuário do Google Play): o
  // mesmo menu serve post e comentário — denunciar manda o conteúdo pra fila
  // do servidor, bloquear tira a pessoa do feed no SERVIDOR (o filtro local
  // abaixo é só pra tela não esperar o próximo carregamento).
  //
  // ponytail: o único desfazer é o botão do diálogo logo depois de bloquear —
  // não existe tela de "bloqueados". Vale criar quando alguém pedir pra
  // desbloquear depois do fato (DELETE /api/moderation/block já atende).
  const moderar = useCallback(
    (kind, targetId, targetUserId) => {
      const denunciar = () => {
        const enviar = (reason) =>
          reportContent({ kind, targetId, reason })
            .then(() => Alert.alert(t('report.thanks.title'), t('report.thanks.body')))
            .catch((e) => Alert.alert(t('social.mod.failed'), e.message));
        Alert.alert(t('social.mod.report'), t('social.mod.reportBody'), [
          { text: t('report.reason.offensive'), onPress: () => enviar('ofensivo') },
          { text: t('social.mod.reasonSpam'), onPress: () => enviar('spam') },
          { text: t('common.cancel'), style: 'cancel' },
        ]);
      };

      const bloquear = () => {
        Alert.alert(t('social.mod.block'), t('social.mod.blockBody'), [
          {
            text: t('social.mod.block'),
            style: 'destructive',
            onPress: async () => {
              try {
                await blockSocialUser(targetUserId);
                setActiveComments(null);
                setActiveProfileUserId(null);
                setPosts((prev) => prev.filter((p) => p.user_id !== targetUserId));
                // Desfazer no mesmo diálogo: bloquear por engano no meio de um
                // feed é fácil, e sem isto não haveria caminho nenhum de volta.
                Alert.alert(t('social.mod.blockedTitle'), t('social.mod.blockedBody'), [
                  { text: t('social.mod.undo'), onPress: () => unblockSocialUser(targetUserId).then(load).catch(() => {}) },
                  { text: t('common.ok'), style: 'cancel' },
                ]);
              } catch (e) {
                Alert.alert(t('social.mod.failed'), e.message);
              }
            },
          },
          { text: t('common.cancel'), style: 'cancel' },
        ]);
      };

      Alert.alert(t('social.mod.cta'), t('social.mod.menuBody'), [
        { text: t('social.mod.report'), onPress: denunciar },
        { text: t('social.mod.block'), style: 'destructive', onPress: bloquear },
        { text: t('common.cancel'), style: 'cancel' },
      ]);
    },
    [t, load]
  );

  if (!user) {
    return (
      <View style={styles.root}>
        <GradientHeader title="Feed Social" subtitle="Entre em contato com outros leitores" gradient={gradients.purple} />
        <View style={styles.card}>
          <Ionicons name="lock-closed" size={30} color={colors.gold} />
          <Text style={styles.cardTitle}>{t('social.loginNeeded')}</Text>
          <TouchableOpacity style={styles.primaryBtnFlat} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.primaryBtnFlatText}>{t('social.loginCta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title="Feed Social"
        subtitle="Entre em contato com outros leitores"
        gradient={gradients.purple}
        right={
          profile ? (
            <TouchableOpacity onPress={() => setShowSearch((s) => !s)}>
              <Ionicons name="person-add-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : null
        }
      />

      {profile === undefined && <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />}

      {profile === null && <ProfileSetup onCreated={(p) => { setProfile(p); load(); }} />}

      {profile && (
        <FlatList
          data={posts}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListHeaderComponent={showSearch ? <SearchPanel onFollowChange={load} /> : null}
          ListEmptyComponent={
            <View>
              <Text style={styles.emptyText}>
                Seu feed está vazio — siga outros leitores (ícone no topo) ou compartilhe uma leitura do seu Diário Cósmico.
              </Text>
              {/* Duas instruções, zero toques: o texto citava um "ícone no
                  topo" e outra tela pelo nome. Agora cada pedido tem o toque
                  que o cumpre — o primeiro abre a busca aqui mesmo, o segundo
                  leva ao Diário (Social e Diary vivem no mesmo HomeStack). */}
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  activeOpacity={0.85}
                  onPress={() => setShowSearch(true)}
                >
                  <Ionicons name="person-add" size={15} color="#fff" />
                  <Text style={styles.emptyActionText}>{t('social.empty.findCta')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.emptyActionGhost}
                  activeOpacity={0.8}
                  onPress={() => navigation.navigate(ROUTES.DIARY)}
                >
                  <Ionicons name="book" size={15} color={colors.accent} />
                  <Text style={styles.emptyActionGhostText}>{t('social.empty.diaryCta')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.accent} style={{ marginTop: 12 }} /> : null}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              myUserId={profile?.user_id}
              onToggleLike={toggleLike}
              onOpenComments={setActiveComments}
              onOpenProfile={(p) => setActiveProfileUserId(p.user_id)}
              onDeletePost={handleDeletePost}
              onModerate={moderar}
            />
          )}
        />
      )}

      {activeComments && (
        <CommentsPanel
          post={activeComments}
          myUserId={profile?.user_id}
          onClose={() => setActiveComments(null)}
          onModerate={moderar}
        />
      )}
      {activeProfileUserId && (
        <UserProfilePanel
          userId={activeProfileUserId}
          myUserId={profile?.user_id}
          onClose={() => setActiveProfileUserId(null)}
          onFollowChange={load}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 22, alignItems: 'center', margin: 20 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  cardText: { color: colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' },
  avatarOption: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  avatarOptionActive: { borderColor: colors.accent, backgroundColor: colors.accent + '33' },
  avatarEmoji: { fontSize: 20 },
  input: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, color: colors.text, fontSize: 14, borderWidth: 1, borderColor: colors.border, marginTop: 12, alignSelf: 'stretch' },
  errorText: { color: colors.amber, fontSize: 12, marginTop: 8 },
  primaryBtn: { paddingVertical: 13, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  primaryBtnFlat: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, marginTop: 16 },
  primaryBtnFlatText: { color: '#fff', fontWeight: '800', fontSize: 14 },
  emptyText: { color: colors.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 40, paddingHorizontal: 20 },
  emptyActions: { gap: 10, marginTop: 18, paddingHorizontal: 20 },
  emptyActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12,
  },
  emptyActionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  emptyActionGhost: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 12,
  },
  emptyActionGhostText: { color: colors.accent, fontSize: 14, fontWeight: '700' },
  postCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 14, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  postHeaderTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  // 48x48 é o mínimo de alvo de toque que o pre-launch report do Google Play
  // cobra — e são justamente os controles que a política de moderação exige
  // que a pessoa ache e consiga apertar (denunciar/bloquear/apagar).
  iconBtn: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  postAvatar: { fontSize: 24 },
  profilePanelHeader: { alignItems: 'center', paddingBottom: 14, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  profilePanelAvatar: { fontSize: 40, marginBottom: 6 },
  profilePanelStats: { flexDirection: 'row', gap: 16, marginTop: 8 },
  profilePanelStat: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  postAuthor: { color: colors.text, fontWeight: '700', fontSize: 13 },
  postMeta: { color: colors.textMuted, fontSize: 11 },
  postTitle: { color: colors.text, fontWeight: '800', fontSize: 15, marginBottom: 4 },
  postBody: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  postActions: { flexDirection: 'row', gap: 20, marginTop: 12 },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  postActionText: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  searchWrap: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 14 },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 10 },
  searchInput: { flex: 1, color: colors.text, fontSize: 13, paddingVertical: 8 },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  followBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 12 },
  followBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  commentsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  commentsPanel: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, borderWidth: 1, borderColor: colors.border },
  commentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  commentsTitle: { color: colors.text, fontWeight: '800', fontSize: 16 },
  emptyComments: { color: colors.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  commentRow: { flexDirection: 'row', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentAuthor: { color: colors.text, fontWeight: '700', fontSize: 12 },
  commentBody: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  commentInputRow: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  commentInput: { flex: 1, backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontSize: 13, borderWidth: 1, borderColor: colors.border },
  commentSendBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
});
