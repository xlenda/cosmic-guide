// Cliente do proxy de IA real (Anthropic) — mesmo domínio/backend do checkout
// (api-forja, ver lib/coupleData.js). A chave da Anthropic mora só no
// servidor; o app nunca tem acesso a ela, só chama esses dois endpoints.
const API_BASE = 'https://oddpro.pro/api-forja';

// Envolve fetch() com timeout/abort: sem isso, uma requisição travada (rede
// instável, captive portal, troca de rede no meio do request) nunca resolve
// nem rejeita a promise, deixando os flags de loading (isTyping/isAnalyzing/
// isInterpreting) presos em true para sempre nas telas que chamam este client.
export async function fetchWithTimeout(url, options, timeoutMs = 20000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchAiChatReply(personaId, message, history) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId, message, history }),
  });
  if (!resp.ok) throw new Error(`chat falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.reply !== 'string' || !data.reply.trim()) {
    throw new Error('chat retornou resposta vazia/malformada');
  }
  return data.reply;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiPalmReading(imageBase64, mediaType) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/palm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!resp.ok) throw new Error(`palm falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('palm retornou resposta vazia/malformada');
  }
  return data;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiFaceReading(imageBase64, mediaType) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/face`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!resp.ok) throw new Error(`face falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('face retornou resposta vazia/malformada');
  }
  return data;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiFootReading(imageBase64, mediaType) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/foot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!resp.ok) throw new Error(`foot falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('foot retornou resposta vazia/malformada');
  }
  return data;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiMolesReading(imageBase64, mediaType) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/moles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!resp.ok) throw new Error(`moles falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('moles retornou resposta vazia/malformada');
  }
  return data;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiCoffeeReading(imageBase64, mediaType) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/coffee`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!resp.ok) throw new Error(`coffee falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('coffee retornou resposta vazia/malformada');
  }
  return data;
}

// readings: array de até 7 { title, body } já recebidos de verdade (lib/coffeeHistory.js).
export async function fetchAiCoffeeWeeklySummary(readings) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/coffee-weekly-summary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ readings }),
  });
  if (!resp.ok) throw new Error(`coffee-weekly-summary falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('coffee-weekly-summary retornou resposta vazia/malformada');
  }
  return data;
}

// dreamText: descrição livre do sonho digitada pela pessoa. Retorna { title, body }.
export async function fetchAiDreamReading(dreamText) {
  const resp = await fetchWithTimeout(`${API_BASE}/api/dream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dreamText }),
  });
  if (!resp.ok) throw new Error(`dream falhou (${resp.status})`);
  const data = await resp.json();
  if (!data || typeof data.title !== 'string' || typeof data.body !== 'string' || !data.title.trim() || !data.body.trim()) {
    throw new Error('dream retornou resposta vazia/malformada');
  }
  return data;
}
