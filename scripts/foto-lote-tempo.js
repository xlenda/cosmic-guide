// Fotografa as telas do LOTE DE TEMPO E DADO em 390x844 contra o servidor
// e2e (porta 4173).
//   node scripts/foto-lote-tempo.js <pasta-destino>
//
// Irmao de scripts/foto-lote.js (lote de texto longo) — mesma mecanica, outras
// telas. O que foi reaproveitado de la, e nao redescoberto: as chaves REAIS de
// storage (userSign de lib/coupleData.js USER_SIGN_KEY, e o espelho
// birthChartSolo-mirror de lib/birthData.js mirrorKeyFor), o addInitScript que
// planta antes do bundle, e a rolagem por RODA DE MOUSE em vez de
// window.scrollTo — estas telas rolam num ScrollView INTERNO e window.scrollTo
// devolve tres dobras identicas.
//
// COMO CADA TELA E ALCANCADA, e por que nao e tudo por URL:
//   · calendario     — tem path proprio no `linking` de App.js: vai por URL.
//   · calendario lunar e idade real — NAO tem path; a URL /cosmic-guide/<Nome>
//     cai na Home. Vao pela VITRINE (/explorar), clicando no rotulo, que e a
//     navegacao real da pessoa.
//   · relatorios     — nao esta na vitrine; abre pelo cartao de sequencia da
//     Home (testID 'home-streak-card').
//   · profeccoes     — NAO ENTRA nesta lista, e nao e esquecimento: a tela saiu
//     da vitrine em 10/09/2026 a pedido do dono e o card dela na Home esta
//     comentado (HomeScreen.js:909). A rota existe, a tela existe, mas nao ha
//     NENHUM caminho de toque ate ela nesta build — nao da pra fotografar pela
//     navegacao real, e forjar uma rota so pra foto mostraria uma tela que a
//     pessoa nao alcanca.
//   · retrospectiva, linha do tempo e retro da lua cheia — dependem de estado
//     que o storage sozinho nao monta (casal com nomes pelo Quiz; e a retro da
//     Lua so abre NO DIA da Lua Cheia, por decisao da propria tela). Ficam de
//     fora pelo mesmo motivo: a foto seria de um estado vazio forjado.
// ponytail: sem retry nem paralelismo; se travar, roda de novo.
const { chromium } = require('playwright');
const path = require('path');

const PORTA = process.env.FOTO_PORT || 4173;
const BASE = `http://localhost:${PORTA}/cosmic-guide`;

const SIGNO = { name: 'Capricórnio', pt: 'Capricórnio' };
const NASCIMENTO = {
  date: '1989-01-09',
  time: '13:42',
  city: { name: 'São Paulo', country: 'BR', lat: -23.5505, lon: -46.6333, timezone: 'America/Sao_Paulo' },
};

const TELAS = [
  // url: vai direto. rotulo: clica na vitrine. testID: clica na Home.
  { nome: 'calendario', url: '/calendario', dobras: 4 },
  { nome: 'lunar', rotulo: ['Calendário Lunar', 'Lunar Calendar'], dobras: 4 },
  { nome: 'idaderreal', rotulo: ['A idade real de cada coisa', 'Idade real'], dobras: 3 },
  { nome: 'relatorios', testID: 'home-streak-card', dobras: 3 },
];

async function abrirPelaVitrine(page, rotulos) {
  await page.goto(BASE + '/explorar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const achar = () => {
    for (const r of rotulos) {
      const t = page.getByText(r, { exact: true }).first();
      if (t) return t;
    }
    return null;
  };
  let alvo = achar();
  for (const r of rotulos) {
    const t = page.getByText(r, { exact: true }).first();
    if (await t.count()) { alvo = t; break; }
  }
  // A vitrine e uma lista VIRTUALIZADA num container que rola por conta
  // propria (o <body> nao rola). Item do fim so entra no DOM quando a rolagem
  // chega perto — entao: espera primeiro, e so rola se nao apareceu.
  try {
    await alvo.waitFor({ state: 'attached', timeout: 2500 });
  } catch {
    for (let i = 0; i < 30 && !(await alvo.count()); i++) {
      await page.evaluate(() => {
        const roladores = Array.from(document.querySelectorAll('div'))
          .filter((d) => d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 200);
        const lista = roladores.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
        if (lista) lista.scrollTop += 300;
      });
      await page.waitForTimeout(400);
      for (const r of rotulos) {
        const t = page.getByText(r, { exact: true }).first();
        if (await t.count()) { alvo = t; break; }
      }
    }
    await alvo.waitFor({ state: 'attached', timeout: 15000 });
  }
  await alvo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await alvo.click({ force: true });
}

async function foto(browser, destino, tela) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  // O storage tem que existir ANTES do bundle rodar: o Gate de App.js le
  // userSign no arranque.
  await ctx.addInitScript(
    ([signo, nascimento]) => {
      try {
        localStorage.setItem('userSign', JSON.stringify(signo));
        localStorage.setItem('birthChartSolo-mirror', JSON.stringify(nascimento));
      } catch {}
    },
    [SIGNO, NASCIMENTO]
  );
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });

  if (tela.url) {
    await page.goto(BASE + tela.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
  } else if (tela.rotulo) {
    await abrirPelaVitrine(page, tela.rotulo);
    await page.waitForTimeout(4000);
  } else {
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000);
    const alvo = page.getByTestId(tela.testID).first();
    await alvo.waitFor({ state: 'attached', timeout: 15000 });
    await alvo.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await alvo.click({ force: true });
    await page.waitForTimeout(4000);
  }

  // RODA DO MOUSE, nao window.scrollTo: estas telas rolam num ScrollView
  // interno e o wheel entrega o evento ao container sob o ponteiro, que e o
  // mesmo caminho do dedo.
  await page.mouse.move(195, 500);
  for (let i = 0; i < tela.dobras; i++) {
    if (i > 0) {
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: path.join(destino, `${tela.nome}-dobra${i + 1}-390x844.png`) });
  }
  const reais = erros.filter((e) => !/404|Failed to load resource|CORS|api\.cosmicguide/.test(e));
  console.log(tela.nome, 'ok', reais.length ? 'ERRO: ' + reais[0].slice(0, 160) : '');
  await ctx.close();
}

(async () => {
  const destino = process.argv[2];
  if (!destino) throw new Error('falta a pasta destino');
  const browser = await chromium.launch();
  try {
    for (const tela of TELAS) await foto(browser, destino, tela);
  } finally { await browser.close(); }
})();
