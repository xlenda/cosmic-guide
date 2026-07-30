// Sonda 2 (temporária): (a) os LFOs existem no navegador real? (b) sem
// MediaSession, o som PARA quando a aba vai pro fundo?
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = path.resolve('deploy-vercel');
const PORT = 9166;
const BASE = `http://localhost:${PORT}/cosmic-guide/`;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };
function serve() {
  return new Promise((resolve) => {
    const s = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      if (u.startsWith('/_vercel')) { res.writeHead(404); return res.end('nf'); }
      let fp = path.join(ROOT, u);
      if (u.endsWith('/')) fp = path.join(fp, 'index.html');
      if (!fs.existsSync(fp) || fs.statSync(fp).isDirectory()) fp = path.join(ROOT, 'cosmic-guide', 'index.html');
      try { const d = fs.readFileSync(fp); res.writeHead(200, { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }); res.end(d); }
      catch { res.writeHead(404); res.end('nf'); }
    });
    s.listen(PORT, () => resolve(s));
  });
}

const INSTR = `
(() => {
  const R = { osc: 0, gain: 0, filtro: 0, buffer: 0, conexoesEmParam: 0, vivos: 0 };
  window.__A = R;
  const Real = window.AudioContext || window.webkitAudioContext;
  if (!Real) return;
  function P(...a) {
    const c = new Real(...a);
    const wrap = (m, chave) => {
      const o = c[m].bind(c);
      c[m] = (...z) => { const n = o(...z); R[chave]++; R.vivos++;
        const od = n.disconnect ? n.disconnect.bind(n) : null;
        if (od) n.disconnect = (...y) => { R.vivos--; return od(...y); };
        const oc = n.connect ? n.connect.bind(n) : null;
        if (oc) n.connect = (dest, ...y) => {
          // conectar num AudioParam é o que um LFO faz
          if (dest && typeof dest.setValueAtTime === 'function' && typeof dest.gain === 'undefined' && !(dest instanceof (window.AudioNode||function(){}))) R.conexoesEmParam++;
          return oc(dest, ...y);
        };
        return n; };
    };
    wrap('createOscillator', 'osc'); wrap('createGain', 'gain');
    wrap('createBiquadFilter', 'filtro'); wrap('createBufferSource', 'buffer');
    window.__CTX = c;
    return c;
  }
  P.prototype = Real.prototype;
  window.AudioContext = P; window.webkitAudioContext = P;
  const RA = window.Audio;
  window.Audio = function (...a) { const e = new RA(...a); window.__ANC = e; return e; };
  window.Audio.prototype = RA.prototype;
})();
`;

async function botao(page, nomes) {
  for (const n of nomes) { const e = page.getByLabel(n, { exact: false }).first(); if (await e.count().catch(() => 0)) return e; }
  return null;
}

async function cenario(browser, semMediaSession) {
  const c = await browser.newContext();
  await c.addInitScript(INSTR);
  if (semMediaSession) {
    await c.addInitScript(() => {
      try { Object.defineProperty(navigator, 'mediaSession', { configurable: true, get: () => undefined }); } catch {}
    });
  }
  await c.addInitScript(() => {
    window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' }));
  });
  const page = await c.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(4500);
  const b = await botao(page, ['Tocar', 'Play']);
  if (!b) { console.log('  !! sem botão de tocar'); await c.close(); return; }
  await b.click();
  await page.waitForTimeout(3000);

  const g = await page.evaluate(() => ({ ...window.__A, estado: window.__CTX && window.__CTX.state, anc: window.__ANC ? !window.__ANC.paused : null, ms: navigator.mediaSession ? navigator.mediaSession.playbackState : 'ausente' }));
  console.log(`  grafo: ${g.osc} osciladores, ${g.gain} ganhos, ${g.filtro} filtros, ${g.buffer} fontes-buffer | conexões em AudioParam (LFOs): ${g.conexoesEmParam}`);
  console.log(`  estado=${g.estado} ancora=${g.anc} mediaSession=${g.ms}`);

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('blur'));
  });
  await page.waitForTimeout(3500);
  const d = await page.evaluate(() => ({ estado: window.__CTX && window.__CTX.state, vivos: window.__A.vivos, anc: window.__ANC ? !window.__ANC.paused : null }));
  console.log(`  DEPOIS de esconder a aba: estado=${d.estado} nós-conectados=${d.vivos} ancora=${d.anc}`);
  console.log(d.estado === 'suspended' || d.vivos === 0 ? '  => PAROU ✔' : '  => CONTINUOU TOCANDO');
  await c.close();
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  console.log('\n### COM MediaSession (padrão do Chrome) ###');
  await cenario(browser, false);
  console.log('\n### SEM MediaSession (navegador que não tem a API) ###');
  await cenario(browser, true);
  await browser.close(); server.close(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
