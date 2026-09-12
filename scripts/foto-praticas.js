// Fotografa as telas do LOTE DAS PRÁTICAS em 390x844 contra um servidor
// estático simples.  node foto-praticas.js <dist> <pasta-destino> <porta>
//
// Mesma mecânica de scripts/foto-lote.js (a casa já tinha resolvido isto):
//   · só 'rituais' tem path no `linking` de App.js — as outras se alcançam
//     CLICANDO na vitrine /explorar, que é a navegação real;
//   · a vitrine é lista VIRTUALIZADA num container que rola sozinho (o <body>
//     não rola), então rolar é page.mouse.wheel, nunca window.scrollTo;
//   · storage plantado com as chaves REAIS lidas do código, nunca adivinhadas
//     (userSign -> lib/coupleData.js USER_SIGN_KEY).
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = process.argv[2];
const DESTINO = process.argv[3];
const PORTA = Number(process.argv[4] || 4188);
const BASE = `http://localhost:${PORTA}/cosmic-guide`;

const SIGNO = { name: 'Capricórnio', pt: 'Capricórnio' };

const TIPOS = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

function servidor() {
  return http.createServer((req, res) => {
    let rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/cosmic-guide/, '');
    if (rel === '' || rel === '/') rel = '/index.html';
    let arq = path.join(DIST, rel);
    // SPA fallback: rota sem arquivo devolve o index (o roteador resolve).
    if (!fs.existsSync(arq) || fs.statSync(arq).isDirectory()) arq = path.join(DIST, 'index.html');
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream' });
    fs.createReadStream(arq).pipe(res);
  });
}

// rotulo: o texto na vitrine /explorar. url: quando a tela TEM path próprio.
const TELAS = [
  { nome: 'cafe', rotulo: 'Sua xícara tem recado' },
  { nome: 'palma', rotulo: 'Leituras por imagem' },
  { nome: 'assentar', rotulo: 'Assentar' },
  { nome: 'rituais', url: '/rituais' },
  { nome: 'corpo', rotulo: 'Homem Zodiacal' },
];

async function foto(browser, tela) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  // O storage tem que existir ANTES do bundle rodar (o Gate de App.js lê
  // userSign no arranque). addInitScript planta antes de qualquer script.
  await ctx.addInitScript((s) => {
    try { localStorage.setItem('userSign', JSON.stringify(s)); } catch {}
  }, SIGNO);
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });

  if (tela.url) {
    await page.goto(BASE + tela.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
  } else {
    await page.goto(BASE + '/explorar', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    let alvo = page.getByText(tela.rotulo, { exact: true }).first();
    try {
      await alvo.waitFor({ state: 'attached', timeout: 2500 });
    } catch {
      // Item do fim da lista virtualizada: só entra no DOM perto da rolagem.
      for (let i = 0; i < 30 && !(await alvo.count()); i++) {
        await page.evaluate(() => {
          const rol = Array.from(document.querySelectorAll('div'))
            .filter((d) => d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 200)
            .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
          if (rol) rol.scrollTop += 300;
        });
        await page.waitForTimeout(400);
        alvo = page.getByText(tela.rotulo, { exact: true }).first();
      }
      await alvo.waitFor({ state: 'attached', timeout: 15000 });
    }
    await alvo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await alvo.click({ force: true });
    await page.waitForTimeout(4500);
  }

  // ROLAR PELA RODA, não por window.scrollTo: estas telas rolam num ScrollView
  // INTERNO e window.scrollTo não move nada (a lição já estava em foto-lote.js).
  await page.mouse.move(195, 500);
  for (let i = 0; i < 3; i++) {
    if (i > 0) { await page.mouse.wheel(0, 700); await page.waitForTimeout(1200); }
    await page.screenshot({ path: path.join(DESTINO, `${tela.nome}-dobra${i + 1}-390x844.png`) });
  }
  const reais = erros.filter((e) => !/404|Failed to load resource|CORS|api\.cosmicguide/.test(e));
  console.log(tela.nome, 'ok', reais.length ? 'ERRO: ' + reais[0].slice(0, 140) : '');
  await ctx.close();
}

(async () => {
  fs.mkdirSync(DESTINO, { recursive: true });
  const srv = servidor();
  await new Promise((r) => srv.listen(PORTA, r));
  const browser = await chromium.launch();
  try {
    for (const t of TELAS) {
      try { await foto(browser, t); }
      catch (e) { console.log(t.nome, 'FALHOU:', e.message.split('\n')[0]); }
    }
  } finally { await browser.close(); srv.close(); }
})();
