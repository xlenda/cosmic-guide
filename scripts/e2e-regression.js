// Suíte de regressão E2E — roda ANTES de todo deploy (ver deploy-vercel.sh):
// serve a build recém-gerada num porto local e simula uma pessoa real usando
// o app (Playwright/chromium headless). Cada cenário aqui é um BUG REAL já
// corrigido (25-26/07/2026) — se qualquer mudança futura reintroduzir um
// deles, o deploy trava sozinho em vez de o cliente descobrir primeiro.
//
// Uso: node scripts/e2e-regression.js <pasta-da-build>   (a pasta que contém
// cosmic-guide/index.html — no deploy é ./deploy-vercel). Sai com código != 0
// em qualquer falha.
const path = require('path');
const http = require('http');
const fs = require('fs');
const { chromium } = require('playwright-core');

const ROOT = path.resolve(process.argv[2] || 'deploy-vercel');
const PORT = 9099;
const BASE = `http://localhost:${PORT}/cosmic-guide/`;

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.svg': 'image/svg+xml' };

// Servidor estático mínimo com o MESMO fallback SPA do vercel.json — arquivo
// real quando existe, senão o index do app (regressão do "F5 dava 404").
function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = decodeURIComponent(req.url.split('?')[0]);
      // /_vercel/* (script de analytics) não existe localmente — precisa ser
      // 404 DE VERDADE, não o fallback SPA: devolver HTML pra uma tag
      // <script> faz o navegador tentar executar HTML e polui TODA página
      // com um pageerror falso ("Unexpected token '<'").
      if (urlPath.startsWith('/_vercel')) {
        res.writeHead(404);
        return res.end('not found');
      }
      let filePath = path.join(ROOT, urlPath);
      if (urlPath.endsWith('/')) filePath = path.join(filePath, 'index.html');
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(ROOT, 'cosmic-guide', 'index.html');
      }
      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.listen(PORT, () => resolve(server));
  });
}

let failures = [];
function check(label, cond, detail) {
  console.log(`  ${cond ? '✓' : '✗ FALHOU'} ${label}`);
  if (!cond) {
    if (detail) console.log(`      detalhe: ${String(detail).slice(0, 300)}`);
    failures.push(label);
  }
}

function iso(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

async function newSoloPage(browser, extraStorage = {}) {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.__errors = [];
  page.on('pageerror', (e) => page.__errors.push(e.message));
  await page.addInitScript((storage) => {
    window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' }));
    for (const [k, v] of Object.entries(storage)) window.localStorage.setItem(k, v);
  }, extraStorage);
  await page.goto(BASE);
  await page.waitForTimeout(2500);
  return { context, page };
}

(async () => {
  if (!fs.existsSync(path.join(ROOT, 'cosmic-guide', 'index.html'))) {
    console.error(`Build não encontrada em ${ROOT}/cosmic-guide/index.html`);
    process.exit(1);
  }
  const server = await serve();
  const browser = await chromium.launch();

  console.log('\n[1] Paywall solo (bug: solo destravava tudo, 25/07)');
  {
    const { context, page } = await newSoloPage(browser);
    await page.getByText('Tarô', { exact: false }).first().click();
    await page.waitForTimeout(1300);
    await page.getByText('Tirar 3 Cartas', { exact: false }).first().click();
    await page.waitForTimeout(1000);
    await page.getByText('Carreira', { exact: false }).first().click();
    await page.waitForTimeout(1200);
    const body = await page.evaluate(() => document.body.innerText);
    check('2º tema bloqueia e pede assinatura', body.includes('Assinar agora'));
    check('CTA de convidar par também presente', /convide seu par/i.test(body));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  console.log('\n[2] Escudo da Sequência (bug: drenava sem proteger, 26/07)');
  {
    const days = JSON.stringify({ [iso(-3)]: true, [iso(-2)]: true, [iso(0)]: true });
    const { context, page } = await newSoloPage(browser, {
      'cosmic-active-days': days,
      'cosmic-streak-shields': '3',
    });
    await page.waitForTimeout(800);
    const page2 = await context.newPage();
    await page2.goto(BASE);
    await page2.waitForTimeout(2800);
    const body = await page2.evaluate(() => document.body.innerText);
    const shields = await page2.evaluate(() => window.localStorage.getItem('cosmic-streak-shields'));
    const m = body.match(/(\d+) dias? seguido/);
    check('streak 4 com ponte do escudo', m && m[1] === '4');
    check('consumiu exatamente 1 escudo (3→2), estável entre visitas', shields === '2');
    await context.close();
  }

  console.log('\n[3] Leitura Bônus presa (bug: paywall escondia o botão, 26/07)');
  {
    const { context, page } = await newSoloPage(browser, {
      'feature-used-once-tarot': 'true',
      'cosmic-reward-bonus-tarot': '1',
    });
    await page.getByText('Tarô', { exact: false }).first().click();
    await page.waitForTimeout(1300);
    let body = await page.evaluate(() => document.body.innerText);
    check('botão Usar Leitura Bônus visível (não OneTimeLock)', body.includes('Usar Leitura Bônus'));
    await page.getByText('Usar Leitura Bônus', { exact: false }).first().click();
    await page.waitForTimeout(1200);
    body = await page.evaluate(() => document.body.innerText);
    check('bônus tirou cartas de verdade', body.includes('Passado') && body.includes('Toque'));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  // REGRA MUDOU em 29/07/2026 (decisão do dono): UMA assinatura libera o app
  // inteiro, casal incluso — "quando ele assina pode deixar funcionar o casal
  // também". Este cenário validava a regra ANTERIOR (solo não desbloqueia
  // casal, então casal com sub solo via "Assinar" e o seletor de planos).
  // Agora o MESMO seed — casal com assinatura solo ativa — tem que ver
  // "Gerenciar assinatura" e a tela de assinante, porque a assinatura dele
  // vale pra tudo. Se este cenário voltar a exigir "Assinar", é a regra velha
  // ressuscitando por engano.
  console.log('\n[4] Planos: uma assinatura vale pra tudo (regra de 29/07)');
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.__errors = [];
    page.on('pageerror', (e) => page.__errors.push(e.message));
    await page.route('**/api/subscription/solo-corr**', (r) =>
      r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ hasAccess: true, status: 'active', confirmed: true }) })
    );
    await page.addInitScript(() => {
      window.localStorage.setItem('gff-couple-profile', JSON.stringify({ voce: 'RegX', amor: 'RegY', sa: 'Áries', sb: 'Touro' }));
      window.localStorage.setItem(
        'sb-kroadufkgvymsfzulfzn-auth-token',
        JSON.stringify({ access_token: 'fake', refresh_token: 'fake', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: { id: 'fake', email: 'reg@reg.com', user_metadata: {} } })
      );
      window.localStorage.setItem('gff-correlation:solo:reg@reg.com', 'solo-corr-1');
    });
    await page.goto(BASE);
    await page.waitForTimeout(2800);
    await page.getByText('Perfil', { exact: false }).first().click();
    await page.waitForTimeout(1000);
    const menu = await page.evaluate(() => document.body.innerText);
    check('menu mostra "Gerenciar assinatura" pra casal com sub solo ativa (1 assinatura = tudo)', menu.includes('Gerenciar assinatura'));
    await page.getByText('Gerenciar assinatura', { exact: false }).first().click();
    await page.waitForTimeout(1800);
    const body = await page.evaluate(() => document.body.innerText);
    check('Planos trata como assinante (não reoferece checkout do zero)', !body.includes('Faça login para assinar'));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  console.log('\n[5] Chat: Assinar navega + limite de 2 msgs (bugs de 25-26/07)');
  {
    const { context, page } = await newSoloPage(browser, {
      'chat-free-messages-sent': '2',
    });
    await page.getByText('Chat', { exact: false }).first().click();
    await page.waitForTimeout(1300);
    let body = await page.evaluate(() => document.body.innerText);
    check('limite atingido mostra bloqueio', body.includes('Você já usou sua leitura gratuita de Chat Espiritual'));
    await page.getByText('Assinar agora', { exact: false }).first().click();
    await page.waitForTimeout(1500);
    body = await page.evaluate(() => document.body.innerText);
    check('botão Assinar do Chat NAVEGA de verdade (bug do getParent)', body.includes('Assinatura') || body.includes('Faça login para assinar'));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  console.log('\n[6] Telas de casal pro solo (bug: cartão duplicado + ícone sobreposto, 26/07)');
  {
    const { context, page } = await newSoloPage(browser);
    await page.getByText('Reconectar', { exact: false }).first().click();
    await page.waitForTimeout(1400);
    const body = await page.evaluate(() => document.body.innerText);
    check('cartão único (sem "Complete o quiz" duplicado)', !body.includes('Complete o quiz do casal primeiro'));
    check('copy específica da tela', body.includes('Reconectar é pra fazer em casal'));
    check('as 2 CTAs presentes', body.includes('Assinar agora') && /convide seu par/i.test(body));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  console.log('\n[7] SPA fallback (bug: F5 em rota interna dava 404, 26/07)');
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    const resp = await page.goto(`http://localhost:${PORT}/Planos`);
    await page.waitForTimeout(2000);
    check('rota interna direta responde 200 com o app', resp.status() === 200);
    await context.close();
  }

  console.log('\n[8] Casal sem assinatura: véu de sempre (regressão de referência)');
  {
    const context = await browser.newContext();
    const page = await context.newPage();
    page.__errors = [];
    page.on('pageerror', (e) => page.__errors.push(e.message));
    await page.addInitScript(() => {
      window.localStorage.setItem('gff-couple-profile', JSON.stringify({ voce: 'RegA', amor: 'RegB', sa: 'Áries', sb: 'Touro' }));
    });
    await page.goto(BASE);
    await page.waitForTimeout(2500);
    await page.getByText('Reconectar', { exact: false }).first().click();
    await page.waitForTimeout(1400);
    const body = await page.evaluate(() => document.body.innerText);
    check('conteúdo real + SubscribeTeaser', body.includes('Continue com a assinatura'));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  await browser.close();
  server.close();

  console.log('');
  if (failures.length > 0) {
    console.error(`REGRESSÃO: ${failures.length} FALHA(S) — deploy deve ser ABORTADO:`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
  }
  console.log('REGRESSÃO: tudo verde — seguro pra publicar.');
})().catch((err) => {
  console.error('REGRESSÃO: erro inesperado —', err.message);
  process.exit(1);
});
