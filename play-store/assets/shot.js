const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const alvo = process.argv[2] || 'feature.html';
  const saida = process.argv[3] || 'feature-graphic.png';
  const w = Number(process.argv[4] || 1024);
  const h = Number(process.argv[5] || 500);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.resolve(alvo).split(path.sep).join('/'));
  await p.waitForTimeout(2500);
  await p.screenshot({ path: saida });
  await b.close();
  console.log(saida);
})();
