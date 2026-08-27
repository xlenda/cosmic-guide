import { getAuthToken } from './accountSubscription';

const API_BASE = 'https://api.cosmicguide.cloud';
const REQUEST_TIMEOUT_MS = 12_000;

export class CosmicMemoryClientError extends Error {
  constructor(code, status = null) {
    super(code);
    this.name = 'CosmicMemoryClientError';
    this.code = code;
    this.status = status;
  }
}

function normalizeMemory(item) {
  if (!item || !Number.isInteger(item.id) || typeof item.content !== 'string') return null;
  return {
    id: item.id,
    kind: typeof item.kind === 'string' ? item.kind : 'orbi_statement',
    topic: typeof item.topic === 'string' ? item.topic : 'general',
    content: item.content.trim(),
    source: typeof item.source === 'string' ? item.source : 'orbi_chat',
    occurrenceCount: Number.isInteger(item.occurrenceCount) ? item.occurrenceCount : 1,
    createdAt: typeof item.createdAt === 'string' ? item.createdAt : null,
    updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : null,
  };
}

export function normalizeCosmicMemoryPayload(data) {
  return {
    enabled: Boolean(data && data.enabled),
    consentVersion: data && typeof data.consentVersion === 'string' ? data.consentVersion : null,
    consentedAt: data && typeof data.consentedAt === 'string' ? data.consentedAt : null,
    memories: Array.isArray(data && data.memories) ? data.memories.map(normalizeMemory).filter(Boolean) : [],
  };
}

async function memoryRequest(path = '', options = {}) {
  const token = await getAuthToken();
  if (!token) throw new CosmicMemoryClientError('login_required', 401);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_BASE}/api/memory${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    let data = null;
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new CosmicMemoryClientError(data && data.code || 'memory_request_failed', response.status);
    return data || {};
  } catch (error) {
    if (error instanceof CosmicMemoryClientError) throw error;
    throw new CosmicMemoryClientError(error && error.name === 'AbortError' ? 'memory_timeout' : 'memory_network_error');
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchCosmicMemory() {
  return normalizeCosmicMemoryPayload(await memoryRequest());
}

export async function setCosmicMemoryConsent(enabled) {
  const preference = await memoryRequest('/consent', { method: 'PUT', body: JSON.stringify({ enabled: enabled === true }) });
  return normalizeCosmicMemoryPayload(preference);
}

export async function deleteCosmicMemoryItem(id) {
  if (!Number.isInteger(id) || id <= 0) throw new CosmicMemoryClientError('memory_invalid_id');
  await memoryRequest(`/${id}`, { method: 'DELETE' });
}

export async function clearCosmicMemories() {
  return memoryRequest('', { method: 'DELETE' });
}
