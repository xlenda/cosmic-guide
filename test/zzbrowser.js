// Sonda temporária de auditoria em NAVEGADOR REAL (apagada depois).
// Instrumenta AudioContext antes de o bundle carregar e mede: custo de boot,
// nós vivos, vazamento em 20 play/pause, 10 navegações, rAF por segundo e o
// comportamento em segundo plano.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = path.resolve('deploy-vercel');
const PORT = 9155;
const BASE = `http://localhost:${PORT}/cosmic-guide/`;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath.startsWith('/_vercel')) { res.writeHead(404); return res.end('nf'); }
      let fp = path.join(ROOT, urlPath);
      if (urlPath.endsWith('/')) fp = path.join(fp, 'index.html');
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(ROOT, 'cosmic-guide', 'index.html');
      try {
        const d = fs.readFileSync(fp);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' });
        res.end(d);
      } catch { res.writeHead(404); res.end('nf'); }
    });
    server.listen(PORT, () => resolve(server));
  });
}

const INSTRUMENTO = `
(() => {
  const R = { criados: 0, porTipo: {}, contextos: 0, vivos: new Set(), iniciados: 0, parados: 0, elementosAudio: 0, marcos: [] };
  window.__AUDIT = R;
  const Real = window.AudioContext || window.webkitAudioContext;
  if (!Real) return;
  const METODOS = ['createOscillator','createGain','createBiquadFilter','createBufferSource','createConvolver','createDelay','createDynamicsCompressor','createWaveShaper','createStereoPanner','createAnalyser','createPanner','createChannelMerger','createChannelSplitter'];
  function Patched(...a) {
    const ctx = new Real(...a);
    R.contextos++;
    R.marcos.push('novo AudioContext em ' + Math.round(performance.now()) + 'ms');
    for (const m of METODOS) {
      if (typeof ctx[m] !== 'function') continue;
      const orig = ctx[m].bind(ctx);
      ctx[m] = (...args) => {
        const n = orig(...args);
        R.criados++;
        R.porTipo[m] = (R.porTipo[m] || 0) + 1;
        R.vivos.add(n);
        const od = n.disconnect ? n.disconnect.bind(n) : null;
        if (od) n.disconnect = (...z) => { R.vivos.delete(n); return od(...z); };
        if (typeof n.start === 'function') {
          const os = n.start.bind(n); n.start = (...z) => { R.iniciados++; return os(...z); };
        }
        if (typeof n.stop === 'function') {
          const ost = n.stop.bind(n); n.stop = (...z) => { R.parados++; return ost(...z); };
        }
        return n;
      };
    }
    window.__CTX = ctx;
    return ctx;
  }
  Patched.prototype = Real.prototype;
  window.AudioContext = Patched;
  window.webkitAudioContext = Patched;

  const RealAudio = window.Audio;
  window.Audio = function (...a) { R.elementosAudio++; const el = new RealAudio(...a); window.__ANCORA = el; return el; };
  window.Audio.prototype = RealAudio.prototype;

  // contador de requestAnimationFrame
  R.rafs = 0;
  const oraf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => oraf((t) => { R.rafs++; return cb(t); });
})();
`;

async function acharBotao(page, nomes) {
  for (const n of nomes) {
    const el = page.getByLabel(n, { exact: false }).first();
    if (await el.count().catch(() => 0)) return el;
  }
  return null;
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const ctxB = await browser.newContext();
  await ctxB.addInitScript(INSTRUMENTO);
  // Pula o onboarding, igual scripts/e2e-regression.js faz.
  await ctxB.addInitScript(() => {
    window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' }));
    window.localStorage.setItem('gff-couple-profile', JSON.stringify({ voce: 'Reg', amor: 'Amor', sa: 'Áries', sb: 'Touro' }));
  });
  const page = await ctxB.newPage();
  page.on('pageerror', (e) => console.log('  [pageerror]', String(e).slice(0, 160)));

  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(5000);

  // ---- boot: o AudioContext foi criado no arranque? ----
  const boot = await page.evaluate(() => ({
    contextos: window.__AUDIT.contextos,
    marcos: window.__AUDIT.marcos,
    nosNoBoot: window.__AUDIT.criados,
    elementosAudio: window.__AUDIT.elementosAudio,
  }));
  console.log('\n=== BOOT (ninguém tocou em nada) ===');
  console.log('AudioContext criados no arranque:', boot.contextos, boot.marcos);
  console.log('nós de áudio criados no arranque:', boot.nosNoBoot);
  console.log('elementos <audio> criados no arranque:', boot.elementosAudio);

  // custo do céu no arranque, medido no próprio navegador
  const perf = await page.evaluate(() => {
    const e = performance.getEntriesByType('navigation')[0];
    return { domInteractive: Math.round(e.domInteractive), loadEnd: Math.round(e.loadEventEnd) };
  });
  console.log('domInteractive:', perf.domInteractive, 'ms | loadEventEnd:', perf.loadEnd, 'ms');

  // ---- rAF em repouso (som parado) ----
  await page.evaluate(() => { window.__AUDIT.rafs = 0; });
  await page.waitForTimeout(3000);
  const rafParado = await page.evaluate(() => window.__AUDIT.rafs);
  console.log('\nrequestAnimationFrame em 3 s com o som PARADO:', rafParado, `(~${(rafParado / 3).toFixed(1)}/s)`);

  // ---- achar e apertar o play ----
  const play = await acharBotao(page, ['Tocar', 'Play', 'Reproduzir']);
  if (!play) {
    console.log('!! não achei o botão de tocar — dump dos aria-labels:');
    const labels = await page.evaluate(() => Array.from(document.querySelectorAll('[aria-label]')).map((e) => e.getAttribute('aria-label')).slice(0, 60));
    console.log(labels);
    await browser.close(); server.close(); process.exit(1);
  }
  await play.click();
  await page.waitForTimeout(3500);

  const tocando = await page.evaluate(() => ({
    estado: window.__CTX ? window.__CTX.state : null,
    criados: window.__AUDIT.criados,
    vivos: window.__AUDIT.vivos.size,
    porTipo: window.__AUDIT.porTipo,
    iniciados: window.__AUDIT.iniciados,
    contextos: window.__AUDIT.contextos,
    ancoraTocando: window.__ANCORA ? !window.__ANCORA.paused : null,
    sessaoEstado: navigator.mediaSession ? navigator.mediaSession.playbackState : null,
  }));
  console.log('\n=== TOCANDO ===');
  console.log('estado do contexto:', tocando.estado, '| contextos:', tocando.contextos);
  console.log('nós criados:', tocando.criados, '| conectados agora:', tocando.vivos);
  console.log('por tipo:', JSON.stringify(tocando.porTipo));
  console.log('âncora <audio> tocando:', tocando.ancoraTocando, '| mediaSession:', tocando.sessaoEstado);

  // ---- rAF tocando ----
  await page.evaluate(() => { window.__AUDIT.rafs = 0; });
  await page.waitForTimeout(3000);
  const rafTocando = await page.evaluate(() => window.__AUDIT.rafs);
  console.log('requestAnimationFrame em 3 s TOCANDO:', rafTocando, `(~${(rafTocando / 3).toFixed(1)}/s)`);

  // ---- navegar entre telas com o som ligado ----
  console.log('\n=== 10 NAVEGAÇÕES COM O SOM LIGADO ===');
  const abas = ['Home', 'Tarô', 'Chat', 'Perfil'];
  for (let i = 0; i < 10; i++) {
    const nome = abas[i % abas.length];
    const aba = page.getByText(nome, { exact: true }).first();
    if (await aba.count().catch(() => 0)) { await aba.click({ timeout: 3000 }).catch(() => {}); }
    await page.waitForTimeout(450);
  }
  const posNav = await page.evaluate(() => ({
    estado: window.__CTX ? window.__CTX.state : null,
    criados: window.__AUDIT.criados,
    vivos: window.__AUDIT.vivos.size,
    contextos: window.__AUDIT.contextos,
  }));
  console.log('depois de 10 navegações -> contextos:', posNav.contextos, '| nós criados:', posNav.criados, '| conectados:', posNav.vivos, '| estado:', posNav.estado);

  // ---- 20x play/pause ----
  console.log('\n=== 20x PLAY/PAUSE ===');
  await page.getByText('Home', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  const antes = await page.evaluate(() => ({ criados: window.__AUDIT.criados, vivos: window.__AUDIT.vivos.size }));
  for (let i = 0; i < 20; i++) {
    const b = await acharBotao(page, ['Pausar', 'Tocar', 'Pause', 'Play']);
    if (b) await b.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(3000);
  const depois = await page.evaluate(() => ({
    criados: window.__AUDIT.criados,
    vivos: window.__AUDIT.vivos.size,
    contextos: window.__AUDIT.contextos,
    iniciados: window.__AUDIT.iniciados,
    parados: window.__AUDIT.parados,
    estado: window.__CTX ? window.__CTX.state : null,
  }));
  console.log('nós criados nos 20 ciclos:', depois.criados - antes.criados);
  console.log('nós AINDA CONECTADOS no fim:', depois.vivos, '(era', antes.vivos, 'antes)');
  console.log('contextos totais:', depois.contextos, '| fontes iniciadas:', depois.iniciados, '| paradas:', depois.parados);
  console.log('estado do contexto no fim:', depois.estado);

  // ---- segundo plano ----
  console.log('\n=== ABA VAI PRO SEGUNDO PLANO ===');
  const b2 = await acharBotao(page, ['Tocar', 'Play']);
  if (b2) await b2.click().catch(() => {});
  await page.waitForTimeout(2500);
  const antesFundo = await page.evaluate(() => ({
    estado: window.__CTX ? window.__CTX.state : null,
    ancora: window.__ANCORA ? !window.__ANCORA.paused : null,
    sessao: navigator.mediaSession ? navigator.mediaSession.playbackState : null,
    vivos: window.__AUDIT.vivos.size,
  }));
  console.log('antes de esconder:', JSON.stringify(antesFundo));
  // esconde a aba de verdade (visibilitychange + hidden)
  const cdp = await ctxB.newCDPSession(page);
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(3000);
  const depoisFundo = await page.evaluate(() => ({
    estado: window.__CTX ? window.__CTX.state : null,
    ancora: window.__ANCORA ? !window.__ANCORA.paused : null,
    sessao: navigator.mediaSession ? navigator.mediaSession.playbackState : null,
    vivos: window.__AUDIT.vivos.size,
  }));
  console.log('depois de esconder:', JSON.stringify(depoisFundo));
  console.log(depoisFundo.estado === 'suspended' || depoisFundo.vivos === 0
    ? '-> o som PAROU em segundo plano'
    : '-> o som CONTINUOU em segundo plano (ancora=' + depoisFundo.ancora + ', mediaSession=' + depoisFundo.sessao + ')');

  await browser.close();
  server.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
