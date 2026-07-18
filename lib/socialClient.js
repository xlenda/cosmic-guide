// lib/socialClient.js
// Cliente do feed social (só usuários solo — sem parceiro pareado — usam
// isso; conteúdo de casal como Reconectar/Agir nunca passa por aqui). Cada
// chamada exige a pessoa logada (Supabase) e manda o token real da sessão —
// o backend verifica a assinatura via JWKS, nunca confia num id cru.
import { supabase } from './supabaseClient';
import { fetchWithTimeout } from './aiClient';

const API_BASE = 'https://oddpro.pro/api-forja';

async function authedFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('É preciso estar logado para usar o feed social');

  const resp = await fetchWithTimeout(`${API_BASE}/api/social${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  const data2 = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data2.error || `falha na requisição (${resp.status})`);
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

export async function getSocialFeed(before) {
  const qs = before ? `?before=${before}` : '';
  const { posts } = await authedFetch(`/feed${qs}`);
  return posts;
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
