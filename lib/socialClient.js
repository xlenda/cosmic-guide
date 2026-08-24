// lib/socialClient.js
// Cliente da Comunidade. Perfis solo e casal podem abrir a mesma superfície,
// mas conteúdo de casal como Reconectar/Agir nunca passa por aqui. Cada chamada
// exige a pessoa logada (Supabase) e manda o token real da sessão — o backend
// verifica a assinatura via JWKS, nunca confia num id cru.
import { supabase } from './supabaseClient';
import { fetchWithTimeout } from './aiClient';

const API_BASE = 'https://api.cosmicguide.cloud';

async function authedFetch(path, options = {}, base = '/api/social') {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('É preciso estar logado para usar o feed social');

  const resp = await fetchWithTimeout(`${API_BASE}${base}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data2 = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const error = new Error(data2.error || `falha na requisição (${resp.status})`);
    // Telas traduzem por código estável. A mensagem do servidor fica só como
    // diagnóstico/fallback; nunca deve forçar português numa interface ES/EN.
    error.code = data2.code || null;
    error.status = resp.status;
    throw error;
  }
  return data2;
}

export async function getMySocialProfile() {
  const { profile } = await authedFetch('/profile/me');
  return profile;
}

export async function upsertSocialProfile({ displayName, username, avatarEmoji }) {
  const { profile } = await authedFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify({ displayName, username, avatarEmoji }),
  });
  return profile;
}

export async function updateCommunityProfile({ zodiacSign, showZodiacSign }) {
  const { profile } = await authedFetch('/profile/community', {
    method: 'PUT',
    body: JSON.stringify({ zodiacSign, showZodiacSign }),
  });
  return profile;
}

export async function leaveCommunity() {
  return authedFetch('/profile', { method: 'DELETE' });
}

export async function acceptCommunityGuidelines() {
  return authedFetch('/community/guidelines', { method: 'POST' });
}

export async function getCommunityRoomFeed(roomId, before) {
  const query = new URLSearchParams();
  if (before) query.set('before', String(before));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  const { posts, meta } = await authedFetch(
    `/community/${encodeURIComponent(roomId)}${suffix}`
  );
  return { posts, meta };
}

export async function createCommunityPost({ roomId, targetSign, title, body }) {
  return authedFetch('/community/posts', {
    method: 'POST',
    body: JSON.stringify({ roomId, targetSign, title, body }),
  });
}

// Antes descartava `meta` (has_next/next_cursor) que o backend já retorna —
// SocialScreen nunca conseguia paginar além da primeira página. Achado real
// de auditoria (19/07/2026).
export async function getSocialFeed(before) {
  const qs = before ? `?before=${before}` : '';
  const { posts, meta } = await authedFetch(`/feed${qs}`);
  return { posts, meta };
}

export async function shareToFeed({ readingType, title, body }) {
  return authedFetch('/posts', { method: 'POST', body: JSON.stringify({ readingType, title, body }) });
}

export async function deleteSocialPost(postId) {
  return authedFetch(`/posts/${postId}`, { method: 'DELETE' });
}

export async function likeSocialPost(postId) {
  return authedFetch(`/posts/${postId}/like`, { method: 'POST' });
}

export async function unlikeSocialPost(postId) {
  return authedFetch(`/posts/${postId}/like`, { method: 'DELETE' });
}

export async function getSocialComments(postId) {
  const { comments } = await authedFetch(`/posts/${postId}/comments`);
  return comments;
}

export async function addSocialComment(postId, body) {
  return authedFetch(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ body }) });
}

export async function deleteSocialComment(commentId) {
  return authedFetch(`/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
}

export async function followSocialUser(userId) {
  return authedFetch(`/follow/${userId}`, { method: 'POST' });
}

export async function unfollowSocialUser(userId) {
  return authedFetch(`/follow/${userId}`, { method: 'DELETE' });
}

export async function getSocialUserProfile(userId) {
  return authedFetch(`/users/${userId}`);
}

export async function searchSocialUsers(usernamePrefix) {
  const { profiles } = await authedFetch(`/search?username=${encodeURIComponent(usernamePrefix)}`);
  return profiles;
}

// MODERAÇÃO (/api/moderation, router separado do feed) — o trio que a política
// de Conteúdo Gerado pelo Usuário do Google Play exige: denunciar, bloquear e
// desfazer o bloqueio. Denunciar guarda o conteúdo no servidor; bloquear
// filtra o feed lá também, não só na tela.
export function reportContent({ kind, targetId, reason, detail }) {
  return authedFetch('/report', { method: 'POST', body: JSON.stringify({ kind, targetId, reason, detail }) }, '/api/moderation');
}

export function blockSocialUser(blockedUserId) {
  return authedFetch('/block', { method: 'POST', body: JSON.stringify({ blockedUserId }) }, '/api/moderation');
}

export function unblockSocialUser(blockedUserId) {
  return authedFetch('/block', { method: 'DELETE', body: JSON.stringify({ blockedUserId }) }, '/api/moderation');
}

export async function getBlockedSocialUsers() {
  const { blocked } = await authedFetch('/blocks', {}, '/api/moderation');
  return blocked;
}
