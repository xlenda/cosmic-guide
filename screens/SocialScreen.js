// screens/SocialScreen.js
// Feed de pessoas seguidas, acessível dentro da aba Comunidade nos modos solo
// e casal. Conteúdo de casal (Reconectar/Agir/leituras privadas) nunca passa
// por aqui: só o que a própria pessoa escolhe compartilhar do Diário Cósmico
// (ver DiaryScreen.js) vira post.
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
import { colors, gradients, space, type } from '../theme';
import GradientHeader from '../components/GradientHeader';
// AS PECAS DE DIAGRAMACAO (design/PECAS-DE-DIAGRAMACAO.md, lote de acao
// 12/09/2026). O FEED em si NAO leva faixa: faixa em volta de card de post
// seria textura, e o rolo de posts ja e a paisagem (mesma decisao do chat e
// do diario no lote anterior). Quem recebe faixa sao as TRES telas que nao
// sao feed e que hoje eram um cartao boiando no meio do preto: o portao de
// login, a criacao de perfil e o feed vazio.
import FaixaCurva from '../components/FaixaCurva';
import ColunaLeitura from '../components/ColunaLeitura';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ROUTES } from '../routes';
import { formatSocialTimeAgo } from '../lib/socialTime';
import {
  getMySocialProfile, upsertSocialProfile, getSocialFeed, deleteSocialPost,
  likeSocialPost, unlikeSocialPost, getSocialComments, addSocialComment,
  searchSocialUsers, followSocialUser, unfollowSocialUser, getSocialUserProfile,
  reportContent, blockSocialUser, unblockSocialUser,
} from '../lib/socialClient';

const AVATAR_OPTIONS = ['🌙', '✨', '🔮', '🌟', '☀️', '🪐', '🦋', '🌊'];

function ProfileSetup({ onCreated }) {
  const { t } = useLanguage();
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_OPTIONS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const submit = async () => {
    if (!displayName.trim() || !username.trim()) {
      setError(t('social.createProfile.required'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const profile = await upsertSocialProfile({ displayName, username: username.toLowerCase(), avatarEmoji });
      onCreated(profile);
    } catch {
      setError(t('social.error.profileSave'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {/* FAIXA — A CRIACAO DE PERFIL. E uma tela de uma ideia so (escolher
          como aparecer), e antes era um cartao centrado no meio do preto. A
          faixa da chao a essa unica ideia. */}
      <FaixaCurva tom="noite" semente="perfil" style={styles.faixa} estiloCorpo={[styles.faixaCorpo, styles.faixaCorpoPrimeira]}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('social.createProfile.title')}</Text>
        <ColunaLeitura centralizado>
          <Text style={styles.cardText}>{t('social.createProfile.desc')}</Text>
        </ColunaLeitura>

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
          placeholder={t('social.createProfile.displayNamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          maxLength={60}
        />
        <TextInput
          value={username}
          onChangeText={(t) => setUsername(t.replace(/[^a-z0-9_]/gi, ''))}
          placeholder={t('social.createProfile.usernamePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCapitalize="none"
          maxLength={20}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}

        <TouchableOpacity activeOpacity={0.85} onPress={submit} disabled={saving} style={{ borderRadius: 12, overflow: 'hidden', marginTop: space.grudado }}>
          <LinearGradient colors={gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryBtn}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>{t('social.createProfile.cta')}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </FaixaCurva>
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
            <Text style={styles.postMeta} numberOfLines={1}>@{post.username} · {formatSocialTimeAgo(post.created_at, t)}</Text>
          </View>
        </TouchableOpacity>
        {post.user_id === myUserId ? (
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => onDeletePost(post)}
            accessibilityRole="button"
            accessibilityLabel={t('social.delete.cta')}
          >
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
      <ColunaLeitura>
        <Text style={styles.postBody} numberOfLines={4}>{post.body}</Text>
      </ColunaLeitura>
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.postActionBtn}
          onPress={() => onToggleLike(post)}
          accessibilityRole="button"
          accessibilityLabel={t(post.liked_by_me ? 'social.unlike' : 'social.like')}
        >
          <Ionicons name={post.liked_by_me ? 'heart' : 'heart-outline'} size={18} color={post.liked_by_me ? colors.pink : colors.textMuted} />
          <Text style={styles.postActionText}>{post.like_count}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.postActionBtn}
          onPress={() => onOpenComments(post)}
          accessibilityRole="button"
          accessibilityLabel={t('social.comments.open')}
        >
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
  const [erro, setErro] = useState(false);
  const [busy, setBusy] = useState(false);

  // Desde o bloqueio, GET /users/:userId devolve 404 pra quem te bloqueou — e
  // sem estado de erro o painel ficava com o spinner girando pra sempre.
  useFocusEffect(
    useCallback(() => {
      getSocialUserProfile(userId)
        .then((d) => { setData(d); setErro(false); })
        .catch(() => setErro(true));
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
    } catch {
      Alert.alert(t('social.error.title'), t('social.error.follow'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.commentsOverlay}>
      <View style={styles.commentsPanel}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>{t('social.profile')}</Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('social.profile.close')}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {erro ? (
          <Text style={styles.emptyComments}>{t('social.profileUnavailable')}</Text>
        ) : !data ? (
          <ActivityIndicator color={colors.accent} style={{ marginVertical: space.entre }} />
        ) : (
          <>
            <View style={styles.profilePanelHeader}>
              <Text style={styles.profilePanelAvatar}>{data.profile.avatar_emoji || '✨'}</Text>
              <Text style={styles.postAuthor}>{data.profile.display_name}</Text>
              <Text style={styles.postMeta}>@{data.profile.username}</Text>
              <View style={styles.profilePanelStats}>
                <Text style={styles.profilePanelStat}>
                  {t(data.followers === 1 ? 'social.profile.followers_one' : 'social.profile.followers_other', { count: data.followers })}
                </Text>
                <Text style={styles.profilePanelStat}>{t('social.profile.following', { count: data.following })}</Text>
              </View>
              {userId !== myUserId && (
                <TouchableOpacity disabled={busy} onPress={toggleFollow} style={[styles.followBtn, { marginTop: space.junto }]}>
                  <Text style={styles.followBtnText}>{t(data.isFollowing ? 'social.unfollow' : 'social.follow')}</Text>
                </TouchableOpacity>
              )}
            </View>
            <FlatList
              data={data.posts}
              keyExtractor={(p) => String(p.id)}
              style={{ maxHeight: 260 }}
              ListEmptyComponent={
                <ColunaLeitura centralizado>
                  <Text style={styles.emptyComments}>
                    {t(data.isFollowing || userId === myUserId ? 'social.profile.noShared' : 'social.profile.followToSee')}
                  </Text>
                </ColunaLeitura>
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
    } catch {
      Alert.alert(t('social.error.title'), t('social.error.comment'));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.commentsOverlay}>
      <View style={styles.commentsPanel}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>{t('social.comments')}</Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('social.comments.close')}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        {comments === null ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: space.entre }} />
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
            placeholder={t('social.comments.placeholder')}
            placeholderTextColor={colors.textMuted}
            style={styles.commentInput}
          />
          <TouchableOpacity
            onPress={send}
            disabled={sending}
            style={styles.commentSendBtn}
            accessibilityRole="button"
            accessibilityLabel={t('social.comments.send')}
          >
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
    } catch {
      Alert.alert(t('social.error.title'), t('social.error.follow'));
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
          placeholder={t('social.search.placeholder')}
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
    Alert.alert(t('social.delete.title'), t('social.delete.body'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('social.delete.cta'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteSocialPost(post.id);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch {
            Alert.alert(t('social.error.title'), t('social.error.deletePost'));
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
  // O bloqueio apaga o "seguir" dos dois lados no servidor e o desbloqueio NÃO
  // refaz (moderationRoutes.js) — por isso o botão do diálogo é "Desbloquear",
  // não "Desfazer": prometer desfazer seria mentir sobre o que a rota entrega.
  //
  // ponytail: o único caminho de desbloqueio é esse botão — não existe tela de
  // "bloqueados". Vale criar quando alguém pedir pra desbloquear depois.
  const moderar = useCallback(
    (kind, targetId, targetUserId) => {
      const denunciar = () => {
        const enviar = (reason) =>
          reportContent({ kind, targetId, reason })
            .then(() => Alert.alert(t('report.thanks.title'), t('report.thanks.body'), [{ text: t('common.ok') }]))
            .catch(() => Alert.alert(t('social.mod.failed'), t('social.mod.failedBody')));
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
                // Desbloquear no mesmo diálogo: bloquear por engano no meio de
                // um feed é fácil, e sem isto não haveria caminho de volta. O
                // erro APARECE — falhar calado deixaria a pessoa achando que
                // desbloqueou com o bloqueio ainda de pé.
                Alert.alert(t('social.mod.blockedTitle'), t('social.mod.blockedBody'), [
                  {
                    // A chave ainda se chama 'undo' por herança, mas o rótulo
                    // agora é "Desbloquear" nas 3 línguas: é o que a rota faz.
                    text: t('social.mod.undo'),
                    onPress: () =>
                      unblockSocialUser(targetUserId)
                        .then(load)
                        .catch(() => Alert.alert(t('social.mod.failed'), t('social.mod.failedBody'))),
                  },
                  { text: t('common.ok'), style: 'cancel' },
                ]);
              } catch {
                Alert.alert(t('social.mod.failed'), t('social.mod.failedBody'));
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
        <GradientHeader title={t('social.header.title')} subtitle={t('social.header.subtitle')} gradient={gradients.purple} />
        {/* FAIXA — O PORTAO. Fotografado antes desta obra: o cartao de login
            ficava sozinho no alto e o resto da tela era um retangulo preto de
            600px. A faixa `rasa` da chao ao cartao sem virar bloco de cor —
            que e exatamente o que a caixa cheia da onda faria aqui, com uma
            frase e um botao dentro. */}
        <FaixaCurva tom="noite" semente="portao" rasa style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
          <View style={styles.card}>
            <Ionicons name="lock-closed" size={30} color={colors.gold} />
            <Text style={styles.cardTitle}>{t('social.loginNeeded')}</Text>
            <TouchableOpacity style={styles.primaryBtnFlat} onPress={() => navigation.navigate(ROUTES.LOGIN)}>
              <Text style={styles.primaryBtnFlatText}>{t('social.loginCta')}</Text>
            </TouchableOpacity>
          </View>
        </FaixaCurva>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <GradientHeader
        title={t('social.header.title')}
        subtitle={t('social.header.subtitle')}
        gradient={gradients.purple}
        right={
          profile ? (
            <TouchableOpacity
              onPress={() => setShowSearch((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={t('social.search.open')}
            >
              <Ionicons name="person-add-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          ) : null
        }
      />

      {profile === undefined && <ActivityIndicator color={colors.accent} style={{ marginTop: space.ar }} />}

      {profile === null && <ProfileSetup onCreated={(p) => { setProfile(p); load(); }} />}

      {profile && (
        <FlatList
          data={posts}
          keyExtractor={(p) => String(p.id)}
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListHeaderComponent={showSearch ? <SearchPanel onFollowChange={load} /> : null}
          // FAIXA — O FEED VAZIO. `rasa` pelo mesmo motivo do portao: duas
          // frases e dois botoes nao enchem a caixa cheia da onda, e faixa
          // cheia com pouco dentro e bloco de cor, nao secao.
          ListEmptyComponent={
            <FaixaCurva tom="ameixa" semente="vazio" rasa style={styles.faixa} estiloCorpo={styles.faixaCorpo}>
              <ColunaLeitura centralizado>
                <Text style={styles.emptyText}>{t('social.empty.body')}</Text>
              </ColunaLeitura>
              {/* Duas instruções, zero toques: o texto citava um "ícone no
                  topo" e outra tela pelo nome. Agora cada pedido tem o toque
                  que o cumpre — o primeiro abre a busca aqui mesmo, o segundo
                  leva ao Diário (ambos são destinos do CommunityStack). */}
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
            </FaixaCurva>
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.accent} style={{ marginTop: space.dentro }} /> : null}
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
  content: { padding: space.tela, paddingBottom: space.fimDaLista },

  // A faixa sangra pra fora do padding do conteudo; o corpo dela devolve o
  // respiro lateral. Faixa que nao sangra e cartao com onda em cima.
  faixa: { marginHorizontal: -space.tela },
  faixaCorpo: { paddingHorizontal: space.tela, gap: space.bloco },
  faixaCorpoPrimeira: { paddingTop: 0 },

  card: {
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: 18, padding: space.entre, alignItems: 'center', gap: space.dentro,
  },
  cardTitle: { ...type.cartao, color: colors.text, textAlign: 'center' },
  cardText: { ...type.corpoCurto, color: colors.textSecondary, textAlign: 'center' },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.junto, justifyContent: 'center' },
  avatarOption: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  avatarOptionActive: { borderColor: colors.accent, backgroundColor: colors.accent + '33' },
  avatarEmoji: { fontSize: 20 },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: space.dentro,
    ...type.corpoCurto, color: colors.text, borderWidth: 1, borderColor: colors.border, alignSelf: 'stretch',
  },
  errorText: { ...type.apoio, color: colors.amber },
  primaryBtn: { paddingVertical: space.dentro, alignItems: 'center' },
  primaryBtnText: { ...type.botao, color: '#fff' },
  primaryBtnFlat: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: space.dentro, paddingHorizontal: space.entre },
  primaryBtnFlatText: { ...type.botao, color: '#fff' },

  // ESTADO VAZIO. O marginTop de 40 saiu: quem separa agora e a faixa, e um
  // vazio empurrado pra baixo dentro de uma faixa rasa deixava o chao de cor
  // sozinho no topo — o defeito de "faixa virando bloco sem conteudo".
  emptyText: { ...type.corpoCurto, color: colors.textMuted, textAlign: 'center' },
  emptyActions: { gap: space.junto },
  emptyActionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    backgroundColor: colors.accent, borderRadius: 12, paddingVertical: space.dentro,
  },
  emptyActionText: { ...type.botao, color: '#fff' },
  emptyActionGhost: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.junto,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: space.dentro,
  },
  emptyActionGhostText: { ...type.botao, color: colors.accent },

  postCard: {
    backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border,
    padding: space.bloco, marginBottom: space.dentro, gap: space.junto,
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  postHeaderTouchable: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: space.dentro },
  // 48x48 e o minimo de alvo de toque que o pre-launch report do Google Play
  // cobra — e sao justamente os controles que a politica de moderacao exige
  // que a pessoa ache e consiga apertar (denunciar/bloquear/apagar).
  iconBtn: { minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  postAvatar: { fontSize: 24 },
  profilePanelHeader: { alignItems: 'center', paddingBottom: space.bloco, marginBottom: space.dentro, borderBottomWidth: 1, borderBottomColor: colors.border, gap: space.grudado },
  profilePanelAvatar: { fontSize: 40 },
  profilePanelStats: { flexDirection: 'row', gap: space.bloco, marginTop: space.junto },
  profilePanelStat: { ...type.apoio, color: colors.textMuted },
  // O nome de quem postou e o unico lugar do feed onde o peso e legitimo: e
  // hierarquia (quem falou), do mesmo jeito que no concorrente.
  postAuthor: { ...type.cartao, color: colors.text },
  postMeta: { ...type.nota, color: colors.textMuted },
  postTitle: { ...type.cartao, color: colors.text },
  postBody: { ...type.corpoCurto, color: colors.textSecondary },
  postActions: { flexDirection: 'row', gap: space.entre, marginTop: space.grudado },
  postActionBtn: { flexDirection: 'row', alignItems: 'center', gap: space.grudado },
  postActionText: { ...type.apoio, color: colors.textMuted },

  searchWrap: {
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    padding: space.dentro, marginBottom: space.bloco, gap: space.junto,
  },
  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: space.junto, backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: space.dentro },
  searchInput: { flex: 1, ...type.corpoCurto, color: colors.text, paddingVertical: space.junto },
  searchResultRow: { flexDirection: 'row', alignItems: 'center', gap: space.dentro, paddingVertical: space.junto },
  followBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: space.junto, paddingHorizontal: space.dentro },
  followBtnText: { ...type.apoio, color: '#fff' },

  commentsOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, top: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  commentsPanel: { backgroundColor: colors.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: space.bloco, borderWidth: 1, borderColor: colors.border },
  commentsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.dentro },
  commentsTitle: { ...type.cartao, color: colors.text },
  emptyComments: { ...type.corpoCurto, color: colors.textMuted, textAlign: 'center', paddingVertical: space.entre },
  commentRow: { flexDirection: 'row', gap: space.junto, paddingVertical: space.junto, borderBottomWidth: 1, borderBottomColor: colors.border },
  commentAuthor: { ...type.apoio, color: colors.text },
  commentBody: { ...type.corpoCurto, color: colors.textSecondary, marginTop: space.grudado },
  commentInputRow: { flexDirection: 'row', gap: space.junto, marginTop: space.dentro, alignItems: 'center' },
  commentInput: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 10,
    paddingHorizontal: space.dentro, paddingVertical: space.dentro,
    ...type.corpoCurto, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  commentSendBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border },
});
