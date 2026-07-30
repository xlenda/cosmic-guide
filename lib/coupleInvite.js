// lib/coupleInvite.js
// Convite de casal com notificação: gera o link de handoff (mesmos params
// ?voce=&amor=&sa=&sb= que App.js/useUrlBootstrap já lê desde sempre) e, se
// quem convida tiver Web Push ativo, registra um código no backend
// (/api/invite/create) e anexa como &convite= — quando o par abrir o link, o
// app aceita o convite (/api/invite/accept, ver useUrlBootstrap) e o servidor
// manda push pro convidador na hora ("seu par entrou!"). Sem push ativo, o
// link sai sem código e funciona igual (só não notifica) — o convite nunca
// depende do backend pra funcionar.
import { Platform, Share } from 'react-native';
import { fetchWithTimeout } from './aiClient';

const API_BASE = 'https://api.cosmicguide.cloud';
const SW_SCOPE = '/cosmic-guide/';
const APP_URL = 'https://cosmicguide.cloud/cosmic-guide/';

async function tryCreateInviteCode(coupleName) {
  try {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
    const registration = await navigator.serviceWorker.getRegistration(SW_SCOPE);
    if (!registration) return null;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) return null;
    // `auth` prova posse do endpoint (mesma trava do sync-streak) — só o
    // navegador do convidador conhece essa chave.
    const { auth } = subscription.toJSON().keys;
    const resp = await fetchWithTimeout(`${API_BASE}/api/invite/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: subscription.endpoint, auth, coupleName }),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data && data.code ? data.code : null;
  } catch {
    return null;
  }
}

export async function buildInviteUrl(profile) {
  const params = new URLSearchParams({
    voce: profile.voce,
    amor: profile.amor,
    sa: profile.sa,
    sb: profile.sb,
  });
  const code = await tryCreateInviteCode(`${profile.voce} & ${profile.amor}`);
  if (code) params.set('convite', code);
  // O PAR CONVIDADO HERDA O ACESSO — decisão do dono (29/07/2026): quem assina
  // chama o par e o par usa de graça. O link leva o correlationCode de quem
  // convida (&acesso=); useUrlBootstrap salva no aparelho do par, e o caminho
  // por código que sempre existiu faz o resto. Só entra código no formato
  // exato do nosso (32 hex) — nunca outra coisa que esteja no perfil.
  //
  // Consequência assumida: o link É o acesso. Quem encaminhar o convite pra
  // outra pessoa dá acesso junto — mesmo nível de confiança de emprestar a
  // conta. A alternativa (vincular par por conta no backend) exige cadastro
  // do par ANTES de ver qualquer coisa, que é atrito demais pra um presente.
  if (profile.accessCode && /^[a-f0-9]{32}$/.test(profile.accessCode)) {
    params.set('acesso', profile.accessCode);
  }
  return `${APP_URL}?${params.toString()}`;
}

// Abre a folha de compartilhamento nativa com o link do convite — o texto
// nomeia o par de propósito (mensagem pronta pra encaminhar direto).
export async function shareInvite(profile) {
  const url = await buildInviteUrl(profile);
  try {
    await Share.share({
      message: `${profile.amor}, criei nosso espaço no Cosmic Guide — nosso guia cósmico de casal. Abre aqui: ${url}`,
    });
  } catch {
    // usuário cancelou — sem tela de erro, mesmo padrão das outras telas
  }
}

// Chamado pelo useUrlBootstrap (App.js) quando o link aberto traz &convite= —
// fire-and-forget: o perfil já foi salvo localmente antes disso, a notificação
// pro convidador é cortesia, nunca um gate.
export function acceptInvite(code) {
  if (!code) return;
  fetchWithTimeout(`${API_BASE}/api/invite/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  }).catch(() => {});
}
