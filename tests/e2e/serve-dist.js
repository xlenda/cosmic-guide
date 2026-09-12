// Servidor estático mínimo (sem dependência nova) pra rodar o E2E contra o
// mesmo dist/ exportado que vai pra produção — respeita o baseUrl
// "/cosmic-guide" configurado em app.json (experiments.baseUrl), senão os
// assets referenciados pelo bundle (caminho absoluto) dariam 404.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.E2E_PORT || 4173;
// E2E_DIST permite servir OUTRA pasta exportada (ex.: dist-lote/) sem mexer no
// servidor que já estiver de pé sobre dist/ — é como se fotografa um "depois"
// enquanto outra sessão continua usando o dist/ de sempre. Sem a variável,
// nada muda: continua dist/.
// path.resolve aceita tanto caminho relativo a raiz do projeto ("dist-lote")
// quanto ABSOLUTO — o absoluto e o que permite servir um export feito fora da
// arvore do projeto, onde a limpeza de outra sessao nao o apaga no meio da
// fotografia (aconteceu duas vezes em 12/09/2026).
const DIST_DIR = process.env.E2E_DIST
  ? path.resolve(__dirname, '..', '..', process.env.E2E_DIST)
  : path.join(__dirname, '..', '..', 'dist');
const BASE_PREFIX = '/cosmic-guide';

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.ico': 'image/x-icon',
};

if (!fs.existsSync(DIST_DIR)) {
  console.error(`[e2e-serve] dist/ não existe em ${DIST_DIR} — rode "npx expo export --platform web" antes.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') {
    res.writeHead(302, { Location: `${BASE_PREFIX}/` });
    return res.end();
  }
  if (!urlPath.startsWith(BASE_PREFIX)) {
    res.writeHead(404);
    return res.end('not found');
  }
  let relPath = urlPath.slice(BASE_PREFIX.length) || '/index.html';
  if (relPath === '/') relPath = '/index.html';
  let filePath = path.join(DIST_DIR, relPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: rota client-side desconhecida (ex.: deep link) cai no index.html.
      return fs.readFile(path.join(DIST_DIR, 'index.html'), (err2, indexData) => {
        if (err2) { res.writeHead(404); return res.end('not found'); }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(indexData);
      });
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`[e2e-serve] servindo ${path.basename(DIST_DIR)}/ em http://localhost:${PORT}${BASE_PREFIX}/`);
});
