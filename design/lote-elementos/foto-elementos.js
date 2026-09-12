// Fotografa a HOME nos dois estados (sem nascimento = convite, com nascimento
// = ficha + elementos), 390x844, contra um dist servido na porta do argumento.
//   node foto-elementos.js <dist> <destino> <porta>
// Chaves de storage lidas do codigo (scripts/foto-lote.js), nunca adivinhadas.
const { chromium } = require('playwright');
const path = require('path');
const http = require('http');
const fs = require('fs');

const DIST = process.argv[2];
const DEST = process.argv[3];
const PORTA = Number(process.argv[4] || 4199);
const BASE = `http://localhost:${PORTA}/cosmic-guide`;

const SIGNO = { name: 'Capricórnio', pt: 'Capricórnio' };
const NASCIMENTO = {
  date: '1989-01-09',
  time: '13:42',
  city: { name: 'São Paulo', country: 'BR', lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo' },
};

const TIPOS = { '.js': 'text/javascript', '.html': 'text/html', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };

function servidor() {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]).replace(/^\/cosmic-guide/, '');
    let arq = path.join(DIST, p);
    if (!fs.existsSync(arq) || fs.statSync(arq).isDirectory()) arq = path.join(DIST, 'index.html');
    res.setHeader('Content-Type', TIPOS[path.extname(arq)] || 'application/octet-stream');
    fs.createReadStream(arq).pipe(res);
  });
}

async function foto(browser, nome, comNascimento) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(([signo, nasc]) => {
    try {
      localStorage.setItem('userSign', JSON.stringify(signo));
      if (nasc) localStorage.setItem('birthChartSolo-mirror', JSON.stringify(nasc));
    } catch {}
  }, [SIGNO, comNascimento ? NASCIMENTO : null]);
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: path.join(DEST, `${nome}-dobra1-390x844.png`) });
  const reais = erros.filter((e) => !/404|Failed to load resource|CORS|api\.cosmicguide/.test(e));
  console.log(nome, 'ok', reais.length ? 'ERRO: ' + reais[0].slice(0, 200) : '');
  await ctx.close();
}

(async () => {
  fs.mkdirSync(DEST, { recursive: true });
  const srv = servidor();
  await new Promise((r) => srv.listen(PORTA, r));
  const browser = await chromium.launch();
  await foto(browser, 'home-com-nascimento', true);
  await foto(browser, 'home-sem-nascimento', false);
  await browser.close();
  srv.close();
})();
