// Sonda 3 (temporária): 20 play/pause COMPLETOS (esperando cada transição
// terminar), duplo-toque no play, e o estado final parado.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = path.resolve('deploy-vercel');
const PORT = 9177;
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
  const R = { criados: 0, vivos: 0, iniciados: 0, parados: 0, ctxs: 0 };
  window.__A = R;
  const Real = window.AudioContext || window.webkitAudioContext;
  if (!Real) return;
  function P(...a) {
    const c = new Real(...a); R.ctxs++;
    for (const m of ['createOscillator','createGain','createBiquadFilter','createBufferSource']) {
      const o = c[m].bind(c);
      c[m] = (...z) => { const n = o(...z); R.criados++; R.vivos++;
        const od = n.disconnect.bind(n); n.disconnect = (...y) => { R.vivos--; return od(...y); };
        if (n.start) { const os = n.start.bind(n); n.start = (...y) => { R.iniciados++; return os(...y); }; }
        if (n.stop) { const ost = n.stop.bind(n); n.stop = (...y) => { R.parados++; return ost(...y); }; }
        return n; };
    }
    window.__CTX = c; return c;
  }
  P.prototype = Real.prototype; window.AudioContext = P; window.webkitAudioContext = P;
})();`;

const snap = (page) => page.evaluate(() => ({ ...window.__A, estado: window.__CTX && window.__CTX.state }));

(async () => {
  const server = await serve();
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--mute-audio'] });
  const c = await browser.newContext();
  await c.addInitScript(INSTR);
  await c.addInitScript(() => window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' })));
  const page = await c.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(4500);

  const btn = () => page.getByLabel(/Tocar|Pausar|Play|Pause/).first();

  console.log('=== 20 CICLOS COMPLETOS play -> pause (esperando cada fade) ===');
  for (let i = 0; i < 20; i++) {
    await btn().click();            // tocar
    await page.waitForTimeout(1200);
    await btn().click();            // pausar
    await page.waitForTimeout(2200); // fade-out (1,4 s) + folga
    if (i === 0 || i === 9 || i === 19) {
      const s = await snap(page);
      console.log(`  ciclo ${i + 1}: criados=${s.criados} conectados=${s.vivos} iniciados=${s.iniciados} parados=${s.parados} ctxs=${s.ctxs} estado=${s.estado}`);
    }
  }
  const fim = await snap(page);
  console.log(`\nESTADO FINAL (parado): nós conectados=${fim.vivos} (tem que ser 0) | contextos=${fim.ctxs} (tem que ser 1) | estado=${fim.estado}`);
  console.log(`fontes iniciadas=${fim.iniciados} paradas=${fim.parados} -> órfãs=${fim.iniciados - fim.parados} (tem que ser 0)`);

  console.log('\n=== DUPLO-TOQUE no play (primeiro play da sessão, contexto suspenso) ===');
  const c2 = await browser.newContext();
  await c2.addInitScript(INSTR);
  await c2.addInitScript(() => window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' })));
  const p2 = await c2.newPage();
  await p2.goto(BASE, { waitUntil: 'load' });
  await p2.waitForTimeout(4500);
  const b2 = p2.getByLabel(/Tocar|Play/).first();
  console.log('  botões encontrados:', await p2.getByLabel(/Tocar|Play/).count());
  // Dois cliques no MESMO tick, sem dar chance de o React desabilitar o botão
  // entre um e outro — é o cenário que montava dois grafos.
  await b2.evaluate((el) => {
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await p2.waitForTimeout(3000);
  const d = await snap(p2);
  console.log(`  nós criados=${d.criados} conectados=${d.vivos} (um grafo = 19) | contextos=${d.ctxs} | estado=${d.estado}`);
  console.log(d.vivos <= 19 ? '  => UM grafo só ✔' : '  => GRAFO DUPLICADO (volume e CPU dobrados)');

  await browser.close(); server.close(); process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
