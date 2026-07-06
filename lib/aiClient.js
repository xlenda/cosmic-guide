// Cliente do proxy de IA real (Anthropic) — mesmo domínio/backend do checkout
// (api-forja, ver lib/coupleData.js). A chave da Anthropic mora só no
// servidor; o app nunca tem acesso a ela, só chama esses dois endpoints.
const API_BASE = 'https://oddpro.pro/api-forja';

export async function fetchAiChatReply(personaId, message, history) {
  const resp = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ personaId, message, history }),
  });
  if (!resp.ok) throw new Error(`chat falhou (${resp.status})`);
  const data = await resp.json();
  return data.reply;
}

// mediaType ex.: 'image/jpeg'. Retorna { title, body }.
export async function fetchAiPalmReading(imageBase64, mediaType) {
  const resp = await fetch(`${API_BASE}/api/palm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mediaType }),
  });
  if (!resp.ok) throw new Error(`palm falhou (${resp.status})`);
  return resp.json();
}
