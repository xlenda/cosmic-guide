/* eslint-disable no-console */
// Gera screenshots de loja a partir do app REAL publicado e compoe a camada
// editorial localizada. Saida padrao em D:, fora do repo, para nao duplicar
// binarios grandes no drive C:.

const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const { STORE_LOCALES, listings } = require('../metadata/store-listings');

const VIEWPORT = { width: 400, height: 711 };
const DEVICE_SCALE_FACTOR = 2.7; // 400x711 -> 1080x1920
const DEFAULT_BASE = 'https://cosmicguide.cloud/cosmic-guide/';
const DEFAULT_OUTPUT = 'D:\\Projetos\\Cosmic Guide Store\\release-final';

const APP_LANGUAGE = {
  'pt-BR': 'pt',
  'es-419': 'es',
  'en-US': 'en',
};

const TAROT_TAB = {
  'pt-BR': 'Tarô',
  'es-419': 'Tarot',
  'en-US': 'Tarot',
};

const TAROT_REVEAL = {
  'pt-BR': 'Revelar sem raspar',
  'es-419': 'Revelar sin raspar',
  'en-US': 'Reveal without scratching',
};

const COMPATIBILITY_UI = {
  'pt-BR': { calculate: 'Calcular Compatibilidade', closeStory: 'Fechar', result: 'Sem enrolação' },
  'es-419': { calculate: 'Calcular compatibilidad', closeStory: 'Cerrar', result: 'Sin rodeos' },
  'en-US': { calculate: 'Calculate compatibility', closeStory: 'Close', result: 'No sugarcoating' },
};

const DEMO_CITY_A = {
  id: 'sao-paulo-br',
  name: 'São Paulo',
  admin: 'SP',
  country: 'Brasil',
  lat: -23.5505,
  lon: -46.6333,
  utcOffset: -3,
  timezone: 'America/Sao_Paulo',
};

const DEMO_CITY_B = {
  id: 'porto-alegre-br',
  name: 'Porto Alegre',
  admin: 'RS',
  country: 'Brasil',
  lat: -30.0346,
  lon: -51.2177,
  utcOffset: -3,
  timezone: 'America/Sao_Paulo',
};

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function normalizeBase(value) {
  return value.endsWith('/') ? value : `${value}/`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function demoSeed(locale) {
  const country = locale === 'en-US' ? 'Brazil' : 'Brasil';
  return {
    language: APP_LANGUAGE[locale],
    cityA: { ...DEMO_CITY_A, country },
    cityB: { ...DEMO_CITY_B, country },
  };
}

async function installDemoState(context, locale) {
  await context.addInitScript(({ language, cityA, cityB }) => {
    const birthA = { date: '1992-08-11', time: '14:30' };
    const birthB = { date: '1990-11-07', time: '08:15' };
    const solo = { ...birthA, city: cityA };

    localStorage.setItem('app-language', language);
    localStorage.setItem('gff-couple-profile', JSON.stringify({
      voce: 'Lena',
      amor: 'Théo',
      sa: 'Leão',
      sb: 'Escorpião',
    }));
    localStorage.setItem('userSign', JSON.stringify({ name: 'Leão', pt: 'Leão' }));

    localStorage.setItem('gff-birth-a-mirror', JSON.stringify(birthA));
    localStorage.setItem('gff-birth-b-mirror', JSON.stringify(birthB));
    localStorage.setItem('birthChartSolo-mirror', JSON.stringify(solo));
    localStorage.setItem('birth-solo-mirror', JSON.stringify(birthA));
    localStorage.setItem('birthChartCities-mirror', JSON.stringify({
      voce: cityA,
      amor: cityB,
    }));
  }, demoSeed(locale));
}

async function settle(page, delay = 900) {
  await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 30000 });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(delay);
}

async function go(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await settle(page, 1100);
}

async function centerLocator(locator) {
  await locator.scrollIntoViewIfNeeded({ timeout: 20000 });
  await locator.evaluate((element) => {
    element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
  });
  await locator.page().waitForTimeout(500);
}

async function rawScreenshot(page, targetPath) {
  ensureDirectory(path.dirname(targetPath));
  await page.screenshot({ path: targetPath, animations: 'disabled' });
}

function screenshotTemplate({ rawDataUrl, shot, index }) {
  const headlineSize = shot.headline.length > 39 ? 28 : 31;
  const orbitDirection = index < 2 ? 1 : -1;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 400px; height: 711px; overflow: hidden; }
    body {
      position: relative;
      background: #0E0821;
      color: #F7EEDB;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .aura {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 82% 12%, rgba(129, 91, 156, .18), transparent 25%),
        radial-gradient(circle at 8% 52%, rgba(111, 55, 92, .12), transparent 28%);
    }
    .grain {
      position: absolute;
      inset: 0;
      opacity: .24;
      background-image:
        radial-gradient(circle at 13% 18%, #F6E8C8 0 1px, transparent 1.3px),
        radial-gradient(circle at 79% 7%, #DDBE73 0 1px, transparent 1.3px),
        radial-gradient(circle at 91% 31%, #F6E8C8 0 1px, transparent 1.3px),
        radial-gradient(circle at 7% 43%, #B898D0 0 1px, transparent 1.3px);
    }
    .orbit {
      position: absolute;
      width: 450px;
      height: 202px;
      top: -93px;
      left: ${orbitDirection > 0 ? '-74px' : '22px'};
      border: 1px solid rgba(214, 177, 102, .38);
      border-radius: 50%;
      transform: rotate(${orbitDirection > 0 ? '-8deg' : '9deg'});
    }
    .orbit::after {
      content: "";
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #E0BC70;
      box-shadow: 0 0 16px rgba(224, 188, 112, .7);
      ${orbitDirection > 0 ? 'right: 67px; bottom: 21px;' : 'left: 72px; bottom: 20px;'}
    }
    header {
      position: absolute;
      z-index: 3;
      left: 24px;
      right: 22px;
      top: 19px;
    }
    .topline { display: flex; align-items: center; justify-content: space-between; }
    .eyebrow {
      flex: 0 1 auto;
      color: #DDBE73;
      font-size: 9px;
      line-height: 1;
      letter-spacing: 1.55px;
      font-weight: 800;
    }
    .brand {
      flex: 0 0 auto;
      white-space: nowrap;
      text-align: right;
      color: rgba(247, 238, 219, .55);
      font-size: 8px;
      letter-spacing: 1.1px;
      font-weight: 700;
    }
    h1 {
      max-width: 350px;
      margin: 10px 0 0;
      color: #F7EEDB;
      font-family: Georgia, "Times New Roman", serif;
      font-size: ${headlineSize}px;
      line-height: 1.02;
      letter-spacing: -.75px;
      font-weight: 600;
      text-wrap: balance;
    }
    .app {
      position: absolute;
      z-index: 2;
      left: 33px;
      top: 118px;
      width: 334px;
      height: 593px;
      overflow: hidden;
      border-radius: 25px 25px 0 0;
      border: 1px solid rgba(230, 202, 142, .25);
      border-bottom: 0;
      background: #0E0821;
      box-shadow: 0 -12px 45px rgba(0, 0, 0, .28), 0 0 0 7px rgba(255, 255, 255, .018);
    }
    .app img { display: block; width: 100%; height: 100%; object-fit: cover; }
    .app::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: 24px 24px 0 0;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, .14);
    }
  </style>
</head>
<body>
  <div class="aura"></div>
  <div class="grain"></div>
  <div class="orbit"></div>
  <header>
    <div class="topline">
      <div class="eyebrow">${escapeHtml(shot.eyebrow)}</div>
      <div class="brand">COSMIC GUIDE</div>
    </div>
    <h1>${escapeHtml(shot.headline)}</h1>
  </header>
  <div class="app"><img alt="" src="${rawDataUrl}"></div>
</body>
</html>`;
}

function featureTemplate(feature) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1024px; height: 500px; overflow: hidden; }
    body {
      position: relative;
      display: flex;
      align-items: center;
      background: #0E0821;
      color: #F7EEDB;
      font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .aura {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(circle at 82% 50%, rgba(137, 95, 164, .27), transparent 30%),
        radial-gradient(circle at 66% 103%, rgba(126, 67, 101, .18), transparent 38%);
    }
    .stars { position: absolute; inset: 0; opacity: .56; }
    .star { position: absolute; width: 3px; height: 3px; border-radius: 50%; background: #F7EEDB; }
    .copy { position: relative; z-index: 3; width: 610px; padding-left: 77px; }
    .brand { color: #DDBE73; font-size: 14px; font-weight: 800; letter-spacing: 2.8px; }
    h1 {
      max-width: 590px;
      margin: 19px 0 15px;
      color: #F7EEDB;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 58px;
      line-height: .98;
      letter-spacing: -1.6px;
      font-weight: 600;
      text-wrap: balance;
    }
    p { max-width: 540px; margin: 0; color: #CFC2DC; font-size: 19px; line-height: 1.38; }
    .stage { position: absolute; z-index: 2; right: 45px; top: 43px; width: 395px; height: 414px; }
    .disk {
      position: absolute;
      width: 244px;
      height: 244px;
      border-radius: 50%;
      background: #24172F;
      border: 1px solid rgba(221, 190, 115, .66);
      box-shadow: inset 0 0 0 35px rgba(115, 76, 130, .16), inset 0 0 0 36px rgba(243, 228, 196, .12), 0 22px 55px rgba(0, 0, 0, .4);
    }
    .disk::before, .disk::after { content: ""; position: absolute; border-radius: 50%; }
    .disk::before { inset: 31px; border: 1px solid rgba(247, 238, 219, .25); }
    .disk::after { inset: 83px; background: #120B1C; border: 1px solid rgba(221, 190, 115, .42); }
    .natal { left: 17px; top: 114px; opacity: .84; }
    .current { right: 6px; top: 52px; background: #3B2945; }
    .orbit {
      position: absolute;
      left: -10px;
      top: 12px;
      width: 405px;
      height: 365px;
      border: 1px solid rgba(221, 190, 115, .35);
      border-radius: 50%;
      transform: rotate(-18deg);
    }
    .orbit::after {
      content: "";
      position: absolute;
      right: 36px;
      bottom: 52px;
      width: 11px;
      height: 11px;
      border-radius: 50%;
      background: #E0BC70;
      box-shadow: 0 0 26px rgba(224, 188, 112, .8);
    }
    .glyph { position: absolute; z-index: 2; color: #E8CF96; font-family: Georgia, serif; font-size: 38px; }
    .g1 { left: 85px; top: 83px; }.g2 { right: 73px; top: 119px; }.g3 { left: 122px; bottom: 88px; }
  </style>
</head>
<body>
  <div class="aura"></div>
  <div class="stars">
    <i class="star" style="left:7%;top:16%"></i><i class="star" style="left:16%;top:81%"></i>
    <i class="star" style="left:44%;top:9%"></i><i class="star" style="left:54%;top:88%"></i>
    <i class="star" style="left:92%;top:14%"></i><i class="star" style="left:88%;top:84%"></i>
  </div>
  <div class="copy">
    <div class="brand">COSMIC GUIDE</div>
    <h1>${escapeHtml(feature.headline)}</h1>
    <p>${escapeHtml(feature.subheadline)}</p>
  </div>
  <div class="stage" aria-hidden="true">
    <div class="orbit"></div><div class="disk natal"></div><div class="disk current"></div>
    <span class="glyph g1">☉</span><span class="glyph g2">☽</span><span class="glyph g3">✦</span>
  </div>
</body>
</html>`;
}

async function renderHtmlScreenshot(context, html, targetPath) {
  const page = await context.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  ensureDirectory(path.dirname(targetPath));
  await page.screenshot({ path: targetPath, animations: 'disabled' });
  await page.close();
}

async function composeShot(renderContext, rawPath, shot, index, targetPath) {
  const rawDataUrl = `data:image/png;base64,${fs.readFileSync(rawPath).toString('base64')}`;
  await renderHtmlScreenshot(
    renderContext,
    screenshotTemplate({ rawDataUrl, shot, index }),
    targetPath,
  );
}

async function captureAlignment(page, base, rawDir) {
  await go(page, `${base}alinhe-seu-ceu`);
  const stage = page.getByTestId('sky-alignment-stage');
  await stage.waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('sky-alignment-stage-fallback').click();
  await page.getByTestId('sky-alignment-receipt').waitFor({ state: 'visible', timeout: 20000 });

  await centerLocator(stage);
  const stagePath = path.join(rawDir, '01-alignment-stage.png');
  await rawScreenshot(page, stagePath);

  const receipt = page.getByTestId('sky-alignment-receipt');
  const receiptCalculation = page.getByTestId('sky-alignment-receipt-calculation');
  await centerLocator(receiptCalculation);
  const receiptPath = path.join(rawDir, '02-alignment-receipt.png');
  await rawScreenshot(page, receiptPath);

  return { 'alignment-stage': stagePath, 'alignment-receipt': receiptPath };
}

async function openTarotTab(page, base, locale) {
  await go(page, base);
  const tabLabel = TAROT_TAB[locale];
  const tab = page.getByText(tabLabel, { exact: true }).last();
  await tab.waitFor({ state: 'visible', timeout: 20000 });
  await tab.click();
  await page.getByTestId('tarot-album-open').waitFor({ state: 'visible', timeout: 30000 });
  await settle(page, 800);
}

async function captureTarot(page, base, locale, rawDir) {
  await openTarotTab(page, base, locale);
  const questionCard = page.getByTestId('tarot-question-card');
  await questionCard.waitFor({ state: 'visible', timeout: 30000 });

  const firstFocus = page.locator('[data-testid^="tarot-focus-"]').first();
  if (await firstFocus.count()) await firstFocus.click();

  const draw = page.getByTestId('tarot-draw');
  await draw.waitFor({ state: 'visible', timeout: 30000 });
  await draw.click({ timeout: 30000 });

  const scratch = page.getByTestId('tarot-scratch-0');
  await scratch.waitFor({ state: 'visible', timeout: 30000 });
  await centerLocator(scratch);
  const scratchPath = path.join(rawDir, '03-tarot-scratch.png');
  await rawScreenshot(page, scratchPath);

  // Registra um encontro real no album depois de capturar a carta ainda
  // coberta. A alternativa acessivel chama a mesma funcao do gesto de raspar.
  const reveal = page.getByText(TAROT_REVEAL[locale], { exact: true });
  await reveal.click({ timeout: 20000 });
  await page.getByTestId('tarot-card-name-0').waitFor({ state: 'visible', timeout: 20000 });

  const albumButton = page.getByTestId('tarot-album-open');
  await albumButton.click({ timeout: 20000 });
  const albumSearch = page.getByTestId('album-search');
  await albumSearch.waitFor({ state: 'visible', timeout: 30000 });
  await page.getByTestId('album-filter-seen').click();
  const revealedCard = page.getByTestId('album-card-seen').first();
  await revealedCard.waitFor({ state: 'visible', timeout: 20000 });
  await centerLocator(revealedCard);
  const albumPath = path.join(rawDir, '04-tarot-album.png');
  await rawScreenshot(page, albumPath);

  return { 'tarot-scratch': scratchPath, 'tarot-album': albumPath };
}

async function openExploreCard(page, base, cardId) {
  await go(page, `${base}explorar`);
  const explore = page.getByTestId('explore-list');
  await explore.waitFor({ state: 'visible', timeout: 30000 });
  const card = page.getByTestId(cardId);
  await card.scrollIntoViewIfNeeded({ timeout: 20000 });
  await card.click({ timeout: 20000 });
  await settle(page, 1100);
}

async function captureProductScreens(page, base, locale, rawDir) {
  await openExploreCard(page, base, 'card-birthchart');
  const chart = page.getByTestId('birthchart-editar');
  await chart.waitFor({ state: 'visible', timeout: 30000 });
  await centerLocator(chart);
  const chartPath = path.join(rawDir, '05-birth-chart.png');
  await rawScreenshot(page, chartPath);

  await openExploreCard(page, base, 'card-compatibility');
  const compatibilityUi = COMPATIBILITY_UI[locale];
  const calculate = page.getByText(compatibilityUi.calculate, { exact: true });
  await calculate.waitFor({ state: 'visible', timeout: 30000 });
  await calculate.click();
  // O resultado abre automaticamente no leitor em stories. Fechamos o modal
  // para registrar o placar completo, que e a interface permanente da tela.
  const closeStory = page.getByLabel(compatibilityUi.closeStory, { exact: true }).last();
  await closeStory.waitFor({ state: 'visible', timeout: 20000 });
  await closeStory.click();
  const compatibility = page.getByText(compatibilityUi.result, { exact: true });
  await compatibility.waitFor({ state: 'visible', timeout: 30000 });
  await centerLocator(compatibility);
  const compatibilityPath = path.join(rawDir, '06-compatibility.png');
  await rawScreenshot(page, compatibilityPath);

  await openExploreCard(page, base, 'card-horoscope');
  const horoscope = page.getByTestId('horoscope-reading');
  await horoscope.waitFor({ state: 'visible', timeout: 30000 });
  const method = page.locator('[data-testid^="horoscope-method-toggle-"]').first();
  await method.waitFor({ state: 'visible', timeout: 30000 });
  await centerLocator(method);
  const horoscopePath = path.join(rawDir, '07-horoscope.png');
  await rawScreenshot(page, horoscopePath);

  await go(page, `${base}explorar`);
  const explore = page.getByTestId('explore-list');
  await explore.waitFor({ state: 'visible', timeout: 30000 });
  const explorePath = path.join(rawDir, '08-explore.png');
  await rawScreenshot(page, explorePath);

  return {
    'birth-chart': chartPath,
    compatibility: compatibilityPath,
    horoscope: horoscopePath,
    explore: explorePath,
  };
}

async function renderFeature(renderContext, listing, targetPath) {
  await renderHtmlScreenshot(renderContext, featureTemplate(listing.featureGraphic), targetPath);
}

function capturesFromRaw(rawDir) {
  return {
    'alignment-stage': path.join(rawDir, '01-alignment-stage.png'),
    'alignment-receipt': path.join(rawDir, '02-alignment-receipt.png'),
    'tarot-scratch': path.join(rawDir, '03-tarot-scratch.png'),
    'tarot-album': path.join(rawDir, '04-tarot-album.png'),
    'birth-chart': path.join(rawDir, '05-birth-chart.png'),
    compatibility: path.join(rawDir, '06-compatibility.png'),
    horoscope: path.join(rawDir, '07-horoscope.png'),
    explore: path.join(rawDir, '08-explore.png'),
  };
}

async function generateLocale(browser, locale, options) {
  const listing = listings[locale];
  const rawDir = options.composeOnly && options.rawInput
    ? path.join(options.rawInput, locale)
    : path.join(options.output, 'raw', locale);
  const finalDir = path.join(options.output, 'google-play', locale);
  ensureDirectory(rawDir);
  ensureDirectory(finalDir);

  const featureContext = await browser.newContext({
    viewport: { width: 1024, height: 500 },
    deviceScaleFactor: 1,
  });
  const shotContext = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE_FACTOR,
  });

  if (!options.screensOnly) {
    const featurePath = path.join(finalDir, 'feature-graphic.png');
    await renderFeature(featureContext, listing, featurePath);
    console.log(`OK   ${locale} feature-graphic.png`);
  }

  if (!options.featureOnly) {
    let captures = capturesFromRaw(rawDir);
    if (!options.composeOnly) {
      const appContext = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: DEVICE_SCALE_FACTOR,
        locale,
        isMobile: true,
        hasTouch: true,
        reducedMotion: 'reduce',
        colorScheme: 'dark',
      });
      await installDemoState(appContext, locale);
      const page = await appContext.newPage();
      page.on('dialog', (dialog) => dialog.dismiss().catch(() => {}));

      captures = {
        ...(await captureAlignment(page, options.base, rawDir)),
        ...(await captureTarot(page, options.base, locale, rawDir)),
        ...(await captureProductScreens(page, options.base, locale, rawDir)),
      };

      await appContext.close();
    }

    for (let index = 0; index < listing.screenshots.length; index += 1) {
      const shot = listing.screenshots[index];
      const rawPath = captures[shot.scene];
      if (!rawPath || !fs.existsSync(rawPath)) {
        throw new Error(`${locale}/${shot.scene}: capture real ausente`);
      }
      const cleanSlug = shot.slug.replace(/^\d{2}-/u, '');
      const targetPath = path.join(finalDir, `${String(index + 1).padStart(2, '0')}-${cleanSlug}.png`);
      await composeShot(shotContext, rawPath, shot, index, targetPath);
      console.log(`OK   ${locale} ${path.basename(targetPath)}`);
    }
  }

  await Promise.all([featureContext.close(), shotContext.close()]);
}

async function main() {
  const requestedLocale = argumentValue('--locale');
  const locales = hasFlag('--all')
    ? STORE_LOCALES
    : [requestedLocale || 'pt-BR'];

  for (const locale of locales) {
    if (!STORE_LOCALES.includes(locale)) {
      throw new Error(`Locale invalido: ${locale}. Use ${STORE_LOCALES.join(', ')}`);
    }
  }

  const options = {
    base: normalizeBase(argumentValue('--base') || DEFAULT_BASE),
    output: path.resolve(argumentValue('--output') || DEFAULT_OUTPUT),
    featureOnly: hasFlag('--feature-only'),
    screensOnly: hasFlag('--screens-only'),
    composeOnly: hasFlag('--compose-only'),
    rawInput: argumentValue('--raw-input')
      ? path.resolve(argumentValue('--raw-input'))
      : null,
    headed: hasFlag('--headed'),
  };

  if (options.featureOnly && options.screensOnly) {
    throw new Error('Use somente um entre --feature-only e --screens-only.');
  }

  ensureDirectory(options.output);
  const browser = await chromium.launch({ headless: !options.headed });
  try {
    for (const locale of locales) {
      console.log(`\nGerando ${locale} a partir de ${options.base}`);
      await generateLocale(browser, locale, options);
    }
  } finally {
    await browser.close();
  }

  const googlePlayRoot = path.join(options.output, 'google-play');
  ensureDirectory(googlePlayRoot);
  const iconSource = path.join(__dirname, 'icone-loja-512.png');
  if (fs.existsSync(iconSource)) {
    fs.copyFileSync(iconSource, path.join(googlePlayRoot, 'icone-loja-512.png'));
  }
  const readme = `COSMIC GUIDE — ASSETS GOOGLE PLAY

Origem das telas: ${options.base}
Localizacoes geradas: ${locales.join(', ')}

Em cada pasta de idioma:
- feature-graphic.png: 1024x500, PNG opaco;
- 01 a 08: screenshots 1080x1920, PNG opaco, na ordem de upload.

Arquivo compartilhado:
- icone-loja-512.png: icone 512x512.

Os perfis usados nas capturas sao demonstrativos. As telas sao do app real e
os textos editoriais saem de play-store/metadata/store-listings.js.
`;
  fs.writeFileSync(path.join(googlePlayRoot, 'LEIA-ME.txt'), readme, 'utf8');

  console.log(`\nAssets exportados para ${options.output}`);
}

main().catch((error) => {
  console.error(`FALHOU: ${error.stack || error.message || error}`);
  process.exitCode = 1;
});
