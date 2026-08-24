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

// Dia LOCAL, igual ao app (lib/localDay.js). Era toISOString() (UTC) e isso
// fazia o cenário [2] do Escudo falhar SÓ depois das 21h no Brasil: o app
// conta em dia local desde 29/07/2026, então às 23h54 o teste semeava
// 2026-07-30 (UTC) enquanto o app procurava 2026-07-29 — os dois deixavam de
// se falar e a suíte acusava um bug que não existia. Teste que passa de manhã
// e falha à noite é pior que teste nenhum: ensina a ignorar o portão.
function iso(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
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

async function openExplore(page) {
  // A Home agora nasce completa. A checagem condicional também mantém este
  // portão compatível se um teste abrir uma sessão antiga já recolhida.
  const toggle = page.getByTestId('home-explore-toggle');
  await toggle.scrollIntoViewIfNeeded();
  if (/explorar/i.test(await toggle.innerText())) await toggle.click();
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
    // Desde o ritual sequencial, trocar de tema com carta fechada é bloqueado
    // para não descartar uma tiragem já consumida. Concluímos as três cartas
    // pela alternativa acessível e só então testamos a segunda tentativa.
    for (let index = 0; index < 3; index += 1) {
      const scratch = page.getByTestId(`tarot-scratch-${index}`);
      await scratch.getByText('Revelar sem raspar', { exact: false }).click();
      await page.getByTestId(`tarot-card-name-${index}`).waitFor({ state: 'visible' });
      if (index < 2) await page.getByTestId(`tarot-next-${index}`).click();
    }
    await page.getByText('Carreira', { exact: false }).first().click();
    await page.waitForTimeout(1200);
    const body = await page.evaluate(() => document.body.innerText);
    check('2º tema bloqueia e pede assinatura', /Ver meus 7 dias grátis|Assinar agora/.test(body));
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
    const scratchVisible = await page.getByTestId('tarot-scratch-0').isVisible().catch(() => false);
    check('bônus tirou cartas de verdade', body.includes('Passado') && scratchVisible);
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
    // A conta não é a fonte que este cenário testa. Deixá-la bater no backend
    // real fazia o localhost depender de CORS/rede e podia segurar o
    // Promise.all do CoupleContext por várias tentativas. O 404 representa o
    // backend sem informação de conta e prova justamente que o código SOLO do
    // aparelho, sozinho, concede o acesso combinado — sem disparar auto-vínculo.
    await page.route('**/api/subscription/me**', (r) =>
      r.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'not_found' }),
      })
    );
    await page.addInitScript(() => {
      window.localStorage.setItem('gff-couple-profile', JSON.stringify({ voce: 'RegX', amor: 'RegY', sa: 'Áries', sb: 'Touro' }));
      window.localStorage.setItem(
        'sb-kroadufkgvymsfzulfzn-auth-token',
        JSON.stringify({ access_token: 'fake', refresh_token: 'fake', expires_at: Math.floor(Date.now() / 1000) + 3600, token_type: 'bearer', user: { id: 'fake', email: 'reg@reg.com', user_metadata: {} } })
      );
      window.localStorage.setItem('gff-correlation:solo:reg@reg.com', 'solo-corr-1');
    });
    const soloAccessResponse = page.waitForResponse(
      (response) => response.url().includes('/api/subscription/solo-corr-1') && response.status() === 200
    );
    await page.goto(BASE);
    await soloAccessResponse;
    await page.waitForTimeout(2800);
    await page.getByText('Perfil', { exact: false }).first().click();
    // Espera o estado real da UI, não um número arbitrário de milissegundos.
    // Se a regra regredir para "Assinar", o timeout expira e o portão falha.
    const manageSubscription = page.getByText('Gerenciar assinatura', { exact: false }).first();
    const manageVisible = await manageSubscription
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    const menu = await page.evaluate(() => document.body.innerText);
    check(
      'menu mostra "Gerenciar assinatura" pra casal com sub solo ativa (1 assinatura = tudo)',
      manageVisible && menu.includes('Gerenciar assinatura')
    );
    if (manageVisible) await manageSubscription.click();
    const subscriberTitle = page.getByText('Você já é assinante', { exact: false }).first();
    const activeStatus = page.getByText('Status: Ativa', { exact: false }).first();
    const subscriberStateVisible = await Promise.all([
      subscriberTitle.waitFor({ state: 'visible', timeout: 5000 }),
      activeStatus.waitFor({ state: 'visible', timeout: 5000 }),
    ]).then(() => true).catch(() => false);
    const body = await page.evaluate(() => document.body.innerText);
    check(
      'Planos confirma positivamente a assinatura ativa (não reoferece checkout do zero)',
      subscriberStateVisible && body.includes('Você já é assinante') && body.includes('Status: Ativa') && !body.includes('Faça login para assinar')
    );
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  console.log('\n[5] Chat: Assinar navega + limite de 2 msgs (bugs de 25-26/07)');
  {
    const { context, page } = await newSoloPage(browser, {
      'chat-free-messages-sent': '2',
    });
    // Órbi não mora mais no catálogo: a entrada contextual fica visível na
    // Home depois do primeiro caminho, sem exigir abrir “Explore”.
    await page.getByTestId('home-orbi-chat').click();
    await page.waitForTimeout(1300);
    let body = await page.evaluate(() => document.body.innerText);
    check('limite atingido mostra bloqueio', /a primeira foi por conta da casa|Você já usou sua leitura gratuita/.test(body));
    // Copy do copy-chief (04/08): o CTA do bloqueio virou 'Ver meus 7 dias
    // grátis →' (onetimelock.cta.subscribe). O regex aceita o antigo tambem
    // pra o portao nao quebrar de novo se a copy for revertida.
    await page.getByText(/Ver meus 7 dias grátis|Assinar agora/).first().click();
    await page.waitForTimeout(1500);
    body = await page.evaluate(() => document.body.innerText);
    check('botão Assinar do Chat NAVEGA de verdade (bug do getParent)', body.includes('Assinatura') || body.includes('Faça login para assinar'));
    check('sem erros JS', page.__errors.length === 0, page.__errors.join(' | '));
    await context.close();
  }

  console.log('\n[6] Telas de casal pro solo (bug: cartão duplicado + ícone sobreposto, 26/07)');
  {
    const { context, page } = await newSoloPage(browser);
    await openExplore(page);
    await page.getByTestId('card-reconectar').click();
    await page.waitForTimeout(1400);
    const body = await page.evaluate(() => document.body.innerText);
    check('cartão único (sem "Complete o quiz" duplicado)', !body.includes('Complete o quiz do casal primeiro'));
    check('copy específica da tela', body.includes('Reconectar é pra fazer em casal'));
    // Os dois CTAs de peso igual (decisão do dono, 29/07). Confere pelo RÓTULO
    // real dos botões — a versão anterior procurava a frase "convide seu par",
    // que vivia no texto explicativo e sumiu quando a regra mudou (agora uma
    // assinatura libera tudo e o par entra de graça pelo link). Checar botão
    // por rótulo de botão, não por frase de parágrafo, é o que impede o teste
    // de quebrar toda vez que alguém melhora uma copy.
    check('as 2 CTAs presentes', /Ver meus 7 dias grátis|Assinar agora/.test(body) && /convid(ar meu|e seu) par/i.test(body));
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
    await openExplore(page);
    await page.getByTestId('card-reconectar').click();
    await page.waitForTimeout(1400);
    const body = await page.evaluate(() => document.body.innerText);
    check('conteúdo real + SubscribeTeaser', /O resto desta tela está logo aí embaixo|Continue com a assinatura/.test(body));
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
