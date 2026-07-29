// Auditoria de navegacao — serve a build e navega de verdade.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(process.argv[2] || 'verify-build');
const PORT = 9111;
const BASE = `http://localhost:${PORT}/cosmic-guide/`;
const SHOTS = process.argv[3] || '.';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      if (urlPath.startsWith('/_vercel')) { res.writeHead(404); return res.end('nf'); }
      let filePath = path.join(ROOT, urlPath);
      if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(ROOT, 'cosmic-guide', 'index.html');
      }
      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch { res.writeHead(404); res.end('nf'); }
    });
    server.listen(PORT, () => resolve(server));
  });
}

(async () => {
  const server = await serve();
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
  const page = await context.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await page.addInitScript(() => {
    window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' }));
  });
  await page.goto(BASE);
  await page.waitForTimeout(6000);
  const body = await page.evaluate(() => document.body.innerText);
  console.log('=== BODY ===');
  console.log(body.slice(0, 2500));
  console.log('=== ERRORS ===');
  console.log(errs.slice(0, 10).join('\n---\n'));
  await page.screenshot({ path: path.join(SHOTS, 'home.png'), fullPage: false });
  await browser.close();
  server.close();
})();
