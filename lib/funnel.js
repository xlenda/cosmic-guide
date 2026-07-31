// lib/funnel.js
// Rastreamento PRÓPRIO de funil — o lado do APP. Manda lote pra
// POST https://api.cosmicguide.cloud/api/track (server-patches/src/http/
// trackRoutes.js + migração 010), que grava numa tabela do banco que já
// existe. O relatório que lê isso é server-patches/scripts/funil.js.
//
// POR QUE EXISTE: ~40 pessoas entraram no app nos últimos dias e ZERO
// iniciaram checkout. Não havia instrumentação nenhuma, então NÃO SE SABIA
// onde elas param — toda melhoria virava chute. O que já existia
// (lib/conversionTracking.js) dispara UM evento, o ÚLTIMO do funil, e está
// inerte porque EXPO_PUBLIC_FB_PIXEL_ID/EXPO_PUBLIC_GA_ID nunca foram
// configurados. Aquilo continua no lugar e não foi tocado (serve pro Meta Ads
// no dia em que o dono configurar); isto aqui é COMPLEMENTAR: funciona no
// minuto em que subir, o dado é do dono, e não é comido por bloqueador de
// anúncio (que engole boa parte dos eventos de Pixel/GA4).
//
// PRIVACIDADE (inegociável — o app tem tela de LGPD e lida com dado sensível
// de nascimento). Este módulo registra "o que ACONTECEU", nunca "o que a
// pessoa ESCREVEU":
//   - NUNCA nome, e-mail, data/hora/cidade de nascimento, conteúdo de leitura,
//     texto de diário ou mensagem de chat. `props` só aceita chaves de uma
//     lista fixa e valores curtos (PROPS_KEYS/MAX_VALUE_LEN abaixo, espelho
//     exato da validação do servidor) — uma chave estranha é DESCARTADA aqui,
//     antes de sair do aparelho, e nunca chega na rede.
//   - sessionId é um uuid ALEATÓRIO gerado neste aparelho, sem nenhuma relação
//     com a conta (Supabase), com e-mail ou com o perfil do casal. Serve só
//     pra contar "quantas pessoas diferentes chegaram até este degrau".
//   - "Apagar meus dados" mata o sessionId junto (ver resetFunnelSession() e
//     context/CoupleContext.js clearAll) E manda o servidor apagar as linhas
//     daquela sessão (POST /api/track/forget) — depois disso o aparelho volta a
//     ser uma pessoa nova pro relatório e o rastro antigo não existe mais em
//     lugar nenhum. Antes disto o apagamento era só local, e o que estava
//     gravado no servidor ficava lá até a retenção de 90 dias vencer.
//
// FIRE-AND-FORGET DE VERDADE: track() é síncrona, não devolve promise, nunca
// lança e nunca faz a UI esperar. Falha de rede é ignorada em silêncio; a fila
// tem teto e é descartada depois de MAX_ATTEMPTS tentativas, pra telemetria
// nunca virar vazamento de memória nem laço de retry infinito.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

// Mesmo backend do checkout e do proxy de IA (lib/coupleData.js, lib/aiClient.js).
const ENDPOINT = 'https://api.cosmicguide.cloud/api/track';
// "Apagar meus dados" do lado do SERVIDOR — apaga as linhas desta sessão na
// tabela funnel_events (handler em server-patches/src/http/trackRoutes.js).
const FORGET_ENDPOINT = `${ENDPOINT}/forget`;

// Chave do uuid anônimo no AsyncStorage. Prefixo próprio (nada de reaproveitar
// chave de perfil) — ela precisa poder ser apagada sozinha no "apagar meus dados".
export const FUNNEL_SESSION_KEY = 'cg-funnel-session';

// ---------------------------------------------------------------------------
// ALLOWLIST — espelho EXATO de EVENTS em server-patches/src/http/trackRoutes.js.
// O servidor recusa o LOTE INTEIRO se um nome não estiver na lista dele, então
// filtrar aqui também é o que impede um erro de digitação numa tela de derrubar
// os eventos legítimos que estão no mesmo lote.
// ---------------------------------------------------------------------------
export const FUNNEL_EVENTS = new Set([
  'app_open',
  'onboarding_start',
  'onboarding_done',
  'home_view',
  'reading_start',
  'reading_done',
  'paywall_view',
  'plan_select',
  'login_view',
  'login_done',
  'checkout_click',
  'checkout_open',
  // A "linha de hoje" da Home (HomeScreen.js) era a única coisa nova na dobra
  // SEM medição: todo card do grid dispara reading_start antes de navegar, e
  // ela navegava direto. Sem evento não dá pra responder a pergunta que a linha
  // existe pra responder — se ela leva alguém pra Jornada/Rituais, ou se só
  // ocupa o slot mais caro da tela.
  'today_line_tap',
]);

// Espelho de PROPS_KEYS do servidor. Chave fora daqui é DESCARTADA (o servidor
// recusaria o lote inteiro por causa dela).
const PROPS_KEYS = new Set(['screen', 'kind', 'plan', 'mode', 'source', 'lang', 'platform']);
// Espelho de CONTROL_CHARS_RE do servidor — ver sanitizeProps().
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F-\u009F]/;
const MAX_PROPS_KEYS = 6;
const MAX_VALUE_LEN = 40;

// Teto do lote aceito pelo servidor (MAX_BATCH lá) — nunca mandar mais que isso
// numa requisição, senão o lote inteiro volta 400.
const MAX_BATCH = 30;
// Teto da fila em memória. Com o dedupe abaixo, uma sessão real gera bem menos
// que isso; o teto existe só pra garantir que uma regressão futura (um track()
// dentro de um render, por exemplo) não cresça sem limite.
const MAX_QUEUE = 30;
// Junta por ~5s OU 10 eventos, o que vier primeiro — o funil inteiro de uma
// pessoa cabe em 2-3 requisições em vez de uma por toque.
const DEBOUNCE_MS = 5000;
const BATCH_TRIGGER = 10;
// Depois de 3 falhas seguidas de rede no MESMO lote, ele é jogado fora. Perder
// evento é aceitável; segurar fila pra sempre não é.
const MAX_ATTEMPTS = 3;
const REQUEST_TIMEOUT_MS = 8000;
// Teto mais curto pro apagamento: diferente do envio de eventos (que roda em
// segundo plano), este é AGUARDADO por clearAll() com a pessoa olhando a tela
// depois de tocar em "Apagar tudo" — 8s de tela parada com a rede ruim seriam
// 8s de "será que travou?". 4s é tempo de sobra pra uma requisição de um
// campo só, e o apagamento LOCAL já aconteceu antes de chegar aqui.
const FORGET_TIMEOUT_MS = 4000;

// Mesma faixa que o servidor valida (SESSION_RE) — um uuid v4 (36 chars, com
// hífens) passa. Validar na leitura evita mandar lixo de um storage corrompido.
const SESSION_RE = /^[A-Za-z0-9_-]{16,64}$/;

// ---------------------------------------------------------------------------
// Estado do módulo. Tudo em memória, tudo reinicializável (resetFunnelSession).
// ---------------------------------------------------------------------------
let queue = [];
let inflight = false;
let attempts = 0;
let timer = null;
let hooksInstalled = false;
let cachedSessionId = null;
let sessionPromise = null;
// DEDUPE: chaves já disparadas nesta EXECUÇÃO do app (ver comentário grande em
// track() sobre por que "por sessão de execução" e não "por foco de tela").
const fired = new Set();

function platformName() {
  try {
    return (Platform && Platform.OS) || 'unknown';
  } catch {
    return 'unknown';
  }
}

// uuid v4 aleatório. crypto.randomUUID quando existe (web moderna, Hermes
// recente), getRandomValues como segundo caminho e, só em último caso,
// Math.random — que é ruim pra criptografia mas aqui só precisa não colidir
// entre aparelhos. NUNCA derivar de e-mail/id de conta/nome: o identificador
// tem que ser anônimo por construção, não por promessa.
function randomSessionId() {
  try {
    const c = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
    if (c && typeof c.getRandomValues === 'function') {
      const bytes = c.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = [];
      for (let i = 0; i < 16; i++) hex.push(bytes[i].toString(16).padStart(2, '0'));
      return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
    }
  } catch {
    // sem crypto — cai no fallback abaixo.
  }
  let out = '';
  for (let i = 0; i < 32; i++) out += Math.floor(Math.random() * 16).toString(16);
  return `${out.slice(0, 8)}-${out.slice(8, 12)}-4${out.slice(13, 16)}-a${out.slice(17, 20)}-${out.slice(20, 32)}`;
}

// Lê (ou cria uma vez) o uuid anônimo. Memoizada numa promise: várias chamadas
// concorrentes no arranque não podem gerar dois ids diferentes e gravar por
// cima uma da outra — isso contaria a mesma pessoa como duas no relatório.
function ensureSessionId() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      try {
        const saved = await AsyncStorage.getItem(FUNNEL_SESSION_KEY);
        if (typeof saved === 'string' && SESSION_RE.test(saved)) {
          cachedSessionId = saved;
          return saved;
        }
      } catch {
        // storage indisponível — segue e tenta gravar um novo abaixo.
      }
      const fresh = randomSessionId();
      try {
        await AsyncStorage.setItem(FUNNEL_SESSION_KEY, fresh);
      } catch {
        // não conseguiu persistir: o id ainda vale pra ESTA execução (melhor
        // que perder o funil inteiro), só não sobrevive ao próximo arranque.
      }
      cachedSessionId = fresh;
      return fresh;
    })().catch(() => null);
  }
  return sessionPromise;
}

// Espelho da normalização do servidor. Devolve null quando não sobra nada —
// props é opcional na rota, então mandar sem props é sempre válido.
function sanitizeProps(props) {
  if (!props || typeof props !== 'object' || Array.isArray(props)) return null;
  const out = {};
  let n = 0;
  for (const key of Object.keys(props)) {
    if (!PROPS_KEYS.has(key)) continue; // chave desconhecida derrubaria o LOTE inteiro no servidor
    if (n >= MAX_PROPS_KEYS) break;
    const value = props[key];
    if (typeof value === 'string') {
      const clean = value.trim();
      if (!clean || clean.length > MAX_VALUE_LEN) continue;
      // Mesma regra do servidor (CONTROL_CHARS_RE em trackRoutes.js): valor
      // legítimo aqui é sempre um slug curto ('tarot', 'annual', 'Planos'), e
      // caractere de controle só apareceria por acidente de código ou por
      // alguém tentando plantar sequência ANSI no relatório de terminal.
      // Descartar aqui é o que impede o servidor de recusar o LOTE inteiro.
      if (CONTROL_CHARS_RE.test(clean)) continue;
      out[key] = clean;
      n++;
    } else if (typeof value === 'number') {
      if (!Number.isFinite(value)) continue;
      out[key] = value;
      n++;
    } else if (typeof value === 'boolean') {
      out[key] = value;
      n++;
    }
  }
  return n > 0 ? out : null;
}

function clearTimer() {
  if (timer) {
    try {
      clearTimeout(timer);
    } catch {}
    timer = null;
  }
}

// Dispara o envio sem que ninguém tenha o que esperar. flushFunnel() é async e
// NUNCA rejeita (o corpo inteiro é try/catch/finally), mas o .catch fica aqui
// de propósito: é o único ponto do módulo onde uma promise fica solta, e uma
// rejeição não tratada em RN vira aviso global — telemetria não pode aparecer
// pro usuário nem no console dele.
// ATENÇÃO: chamar `flush()` aqui (nome que não existe neste módulo) foi um bug
// real — dentro do setTimeout o ReferenceError não tinha try/catch nenhum em
// volta e subia como EXCEÇÃO NÃO CAPTURADA a cada 5s, além de nunca enviar
// nada. Ver os dois testes de regressão em test/funnel.test.js ("envio
// automático").
function dispararEnvio() {
  try {
    const p = flushFunnel();
    if (p && typeof p.catch === 'function') p.catch(() => {});
  } catch {
    // nunca acontece (async function não lança síncrono), mas telemetria não
    // propaga erro nem no caminho impossível.
  }
}

// allowImmediate=false é o que impede laço apertado depois de uma falha: sem
// isso, uma fila com 10+ eventos e a rede fora re-disparava o envio na hora,
// sem pausa nenhuma, até estourar MAX_ATTEMPTS em milissegundos.
function scheduleFlush(allowImmediate = true) {
  if (allowImmediate && queue.length >= BATCH_TRIGGER) {
    dispararEnvio();
    return;
  }
  if (timer) return;
  try {
    timer = setTimeout(() => {
      timer = null;
      dispararEnvio();
    }, DEBOUNCE_MS);
    // Em node (testes) um timer pendente segura o processo vivo; telemetria
    // nunca deve impedir um processo de terminar.
    if (timer && typeof timer.unref === 'function') timer.unref();
  } catch {
    timer = null;
  }
}

// true  = lote resolvido (gravado, ou recusado de um jeito que não adianta
//         repetir — 4xx é payload que NUNCA vai ser aceito).
// false = falha transitória (rede, timeout, 5xx, 429): vale tentar de novo.
async function postBatch(sessionId, events) {
  let controller = null;
  let abortTimer = null;
  try {
    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      abortTimer = setTimeout(() => {
        try {
          controller.abort();
        } catch {}
      }, REQUEST_TIMEOUT_MS);
    }
    const resp = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, events }),
      // Deixa a requisição sobreviver à navegação/fechamento da aba na web.
      keepalive: true,
      ...(controller ? { signal: controller.signal } : {}),
    });
    if (!resp) return false;
    if (resp.ok) return true;
    if (resp.status >= 400 && resp.status < 500 && resp.status !== 429) return true;
    return false;
  } catch {
    return false;
  } finally {
    if (abortTimer) {
      try {
        clearTimeout(abortTimer);
      } catch {}
    }
  }
}

// Nunca lança e nunca rejeita: todo o corpo está protegido. Exportada só pra
// os testes e pros hooks de ciclo de vida poderem forçar o envio.
export async function flushFunnel() {
  if (inflight || queue.length === 0) return;
  inflight = true;
  clearTimer();
  try {
    const sessionId = await ensureSessionId();
    if (!sessionId) {
      // Sem identificador não há o que mandar (o servidor recusaria) — descarta
      // em vez de acumular pra sempre.
      queue = [];
      return;
    }
    const batch = queue.slice(0, MAX_BATCH);
    const resolvido = await postBatch(sessionId, batch);
    if (resolvido) {
      // slice(batch.length) e não `queue = []`: eventos que chegaram DURANTE a
      // requisição foram para o fim da fila e não podem ser jogados fora aqui.
      queue = queue.slice(batch.length);
      attempts = 0;
    } else {
      attempts += 1;
      if (attempts >= MAX_ATTEMPTS) {
        queue = queue.slice(batch.length);
        attempts = 0;
      }
    }
  } catch {
    // telemetria nunca propaga erro.
  } finally {
    inflight = false;
    if (queue.length > 0) scheduleFlush(false);
  }
}

// Último envio antes da aba morrer. sendBeacon é o único caminho confiável no
// unload (fetch normal é cancelado junto com a página) e só escapa do preflight
// de CORS com Content-Type da lista segura — por isso vai como text/plain, que
// o parser do trackRoutes.js aceita de propósito. O corpo continua sendo JSON.
function flushBeacon() {
  try {
    if (queue.length === 0) return true;
    // sendBeacon é síncrono: sem o id já em memória não dá pra esperar o
    // AsyncStorage. Nesse caso cai no flush() normal (que pode não chegar).
    if (!cachedSessionId) return false;
    if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return false;
    const batch = queue.slice(0, MAX_BATCH);
    const ok = navigator.sendBeacon(ENDPOINT, JSON.stringify({ sessionId: cachedSessionId, events: batch }));
    if (ok) queue = queue.slice(batch.length);
    return !!ok;
  } catch {
    return false;
  }
}

// Instalados na PRIMEIRA chamada de track(), nunca no import: um listener
// registrado só por importar o módulo quebraria em ambiente sem DOM/AppState
// (testes, SSR) e rodaria mesmo em telas que não medem nada.
function installLifecycleHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  try {
    const isWeb = platformName() === 'web';
    if (isWeb && typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && !flushBeacon()) flushFunnel();
      });
      if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
        // Safari/iOS muitas vezes não emite visibilitychange ao fechar a aba.
        window.addEventListener('pagehide', () => {
          if (!flushBeacon()) flushFunnel();
        });
      }
      return;
    }
    if (AppState && typeof AppState.addEventListener === 'function') {
      AppState.addEventListener('change', (next) => {
        if (next !== 'active') flushFunnel();
      });
    }
  } catch {
    // sem ciclo de vida observável — o debounce por tempo continua valendo.
  }
}

/**
 * Enfileira um evento de funil. SÍNCRONA, não devolve promise, NUNCA lança.
 *
 * @param {string} event   um dos nomes de FUNNEL_EVENTS (allowlist do servidor).
 * @param {object} [props] contexto mínimo — só chaves de PROPS_KEYS, valores
 *                         curtos. NUNCA conteúdo escrito pela pessoa.
 * @param {object} [options]
 *        options.once  (padrão true) dispara no máximo uma vez por chave.
 *        options.key   chave de dedupe (padrão: o próprio nome do evento) —
 *                      use quando a VARIAÇÃO importa (ex.: 'reading_start:tarot').
 *
 * DEDUPE — POR SESSÃO DE EXECUÇÃO, não por foco de tela. Motivo concreto: o
 * relatório (server-patches/scripts/funil.js) mede cada degrau com
 * COUNT(DISTINCT session_id), então a segunda cópia do mesmo evento na mesma
 * sessão soma ZERO no funil — ela só gasta banda, linha no banco e cota do
 * rate-limiter. Um paywall que re-renderiza 8 vezes no mesmo foco (FeatureGate
 * re-renderiza a cada mudança de hasAccess/hasCoupleAccess do CoupleContext,
 * que recheca sozinho a cada 5 min e a cada volta pro primeiro plano) viraria
 * 8 linhas idênticas e um número inflado se alguém um dia olhasse COUNT(*).
 * "Por foco" também não resolveria isso: as re-renderizações acontecem DENTRO
 * do mesmo foco.
 * O conjunto de dedupe vive só em memória, então ele zera quando o app é
 * reaberto — o que é o comportamento certo: `sessionId` é do APARELHO e
 * persiste, mas cada abertura precisa poder registrar seu app_open.
 */
export function track(event, props, options = {}) {
  try {
    if (typeof event !== 'string' || !FUNNEL_EVENTS.has(event)) return;
    const once = options.once !== false;
    const key = typeof options.key === 'string' && options.key ? options.key : event;
    if (once) {
      if (fired.has(key)) return;
      fired.add(key);
    }
    if (queue.length >= MAX_QUEUE) return;
    const clean = sanitizeProps(props);
    queue.push(clean ? { event, props: clean } : { event });
    installLifecycleHooks();
    scheduleFlush();
  } catch {
    // telemetria NUNCA pode quebrar a tela de quem está usando o produto.
  }
}

// Avisa o servidor pra apagar as linhas desta sessão (POST /api/track/forget).
// Melhor esforço, sem retry e sem bloquear nada por muito tempo: se falhar, o
// aparelho já está limpo e o que sobrou no servidor é um uuid órfão que ninguém
// consegue ligar a pessoa nenhuma, e que a retenção derruba sozinha. Nunca
// lança, nunca rejeita.
async function postForget(sessionId) {
  let controller = null;
  let abortTimer = null;
  try {
    if (typeof AbortController !== 'undefined') {
      controller = new AbortController();
      abortTimer = setTimeout(() => {
        try {
          controller.abort();
        } catch {}
      }, FORGET_TIMEOUT_MS);
    }
    await fetch(FORGET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // SÓ o uuid. Nada de e-mail, id de conta ou qualquer outra coisa que
      // "ajudasse a achar os dados": é justamente por não haver esse vínculo
      // que a tabela do funil é anônima, e mandá-lo aqui criaria o vínculo que
      // o resto do módulo existe pra evitar.
      body: JSON.stringify({ sessionId }),
      keepalive: true,
      ...(controller ? { signal: controller.signal } : {}),
    });
  } catch {
    // rede fora / rota ainda não montada no server.js: segue em silêncio.
  } finally {
    if (abortTimer) {
      try {
        clearTimeout(abortTimer);
      } catch {}
    }
  }
}

/**
 * "Apagar meus dados" também apaga o rastro do funil, DOS DOIS LADOS:
 *   - no aparelho: o uuid anônimo sai do storage e o que ainda estava na fila é
 *     descartado sem nunca ser enviado;
 *   - no servidor: POST /api/track/forget apaga as linhas daquela sessão em
 *     funnel_events (antes disto, "apagar tudo" só apagava a metade local e o
 *     rastro ficava no banco até a retenção de 90 dias vencer).
 * Chamada por context/CoupleContext.js clearAll, junto do resto da limpeza de
 * LGPD. Nunca lança.
 *
 * A ordem importa: o lado LOCAL é apagado primeiro, e a requisição de rede vai
 * depois. Assim uma rede ruim (ou a rota ainda não montada) nunca impede a
 * pessoa de apagar o que está no aparelho dela.
 */
export async function resetFunnelSession() {
  queue = [];
  attempts = 0;
  const idEmMemoria = cachedSessionId;
  cachedSessionId = null;
  sessionPromise = null;
  fired.clear();
  clearTimer();

  // Lê o uuid ANTES de apagar — é ele que o servidor precisa receber pra saber
  // o que apagar. Se nem o storage nem a memória tiverem um id válido, é porque
  // este aparelho nunca chegou a mandar evento nenhum: não há o que apagar lá.
  let salvo = null;
  try {
    salvo = await AsyncStorage.getItem(FUNNEL_SESSION_KEY);
  } catch {
    // storage indisponível — cai pro id que estava em memória.
  }
  const alvo =
    typeof salvo === 'string' && SESSION_RE.test(salvo)
      ? salvo
      : typeof idEmMemoria === 'string' && SESSION_RE.test(idEmMemoria)
        ? idEmMemoria
        : null;

  try {
    await AsyncStorage.removeItem(FUNNEL_SESSION_KEY);
  } catch {
    // nada a fazer — o id já não vale mais nesta execução.
  }

  if (alvo) await postForget(alvo);
}

// Só para os testes: expõe o estado interno sem obrigar a mexer no relógio.
export function __funnelDebug() {
  return { queue: queue.slice(), fired: new Set(fired), attempts, inflight, sessionId: cachedSessionId };
}

// Só para os testes: reinicia o módulo inteiro (inclusive os hooks de ciclo de
// vida) sem tocar no AsyncStorage.
export function __funnelResetForTests() {
  queue = [];
  attempts = 0;
  inflight = false;
  cachedSessionId = null;
  sessionPromise = null;
  fired.clear();
  hooksInstalled = false;
  clearTimer();
}

// Atalhos nomeados — o ponto de chamada fica legível e o dedupe por VARIAÇÃO
// (kind/plan/source) já vem certo, em vez de cada tela inventar a chave.
export const funnel = {
  appOpen: () => track('app_open', { platform: platformName() }),
  // Sem chave por variação, esta era a única linha que descumpria o comentário
  // acima: OnboardingChoiceScreen dispara primeiro (sem mode) e engolia em
  // silêncio o disparo do QuizScreen('couple') pra todo mundo que passou pela
  // tela de escolha. Resultado: quem saiu em 2s e quem travou no passo 2 do
  // quiz de casal viravam a MESMA linha do relatório, e os 96 que somem entre
  // 118 e 22 ficavam numa caixa preta. 'choice' nomeia o disparo sem mode.
  onboardingStart: (mode) =>
    track('onboarding_start', { mode }, { key: `onboarding_start:${mode || 'choice'}` }),
  onboardingDone: (mode) => track('onboarding_done', { mode }, { key: `onboarding_done:${mode}` }),
  homeView: (mode) => track('home_view', { mode }),
  readingStart: (kind, source) => track('reading_start', { kind, source }, { key: `reading_start:${kind}` }),
  readingDone: (kind) => track('reading_done', { kind }, { key: `reading_done:${kind}` }),
  paywallView: (source, screen) =>
    track('paywall_view', { source, screen }, { key: `paywall_view:${source}:${screen || ''}` }),
  planSelect: (plan) => track('plan_select', { plan }, { key: `plan_select:${plan}` }),
  loginView: (source) => track('login_view', { source }),
  loginDone: () => track('login_done'),
  checkoutClick: (plan) => track('checkout_click', { plan }, { key: `checkout_click:${plan}` }),
  checkoutOpen: (plan) => track('checkout_open', { plan }, { key: `checkout_open:${plan}` }),
  // `tipo` é 'jornada' ou 'ritual'. Vai em `kind` e não numa chave nova de
  // props: PROPS_KEYS é allowlist espelhada do servidor, e chave fora dela faz
  // o servidor RECUSAR O LOTE INTEIRO — o evento chegaria sem o dado que é o
  // motivo dele existir. Dedupe por variação, como os outros: dois toques na
  // mesma linha no mesmo dia são a mesma informação.
  todayLineTap: (tipo) => track('today_line_tap', { kind: tipo }, { key: `today_line_tap:${tipo}` }),
};
