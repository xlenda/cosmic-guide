const { chromium } = require('playwright');
const BASE = 'https://cosmicguide.cloud/cosmic-guide/';
const VW = 400, VH = 711, SCALE = 2.7;

const TELAS = [
  ['01-mapa-astral',    'Mapa Astral'],
  ['02-compatibilidade','Compatibilidade'],
  ['03-taro',           'Tarô por Tema'],
  ['04-horoscopo',      'Horóscopo'],
  ['05-diario',         'Diário Cósmico'],
  ['06-lua',            'Calendário Lunar'],
  ['07-jornada',        'Jornada Guiada'],
];

(async () => {
  const b = await chromium.launch();
  for (const [nome, texto] of TELAS) {
    const ctx = await b.newContext({
      viewport: { width: VW, height: VH }, deviceScaleFactor: SCALE,
      locale: 'pt-BR', isMobile: true, hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('gff-couple-profile', JSON.stringify({
        voce: 'Lena', amor: 'Théo', sa: 'Leão', sb: 'Escorpião' }));
      localStorage.setItem('userSign', JSON.stringify({ name: 'Leão', pt: 'Leão' }));
      localStorage.setItem('app-language', 'pt');
      const a = JSON.stringify({ date: '1992-08-11', time: '14:30' });
      const b = JSON.stringify({ date: '1990-11-07', time: '08:15' });
      for (const k of ['gff-birth-a','gff-birth-a-mirror']) localStorage.setItem(k, a);
      for (const k of ['gff-birth-b','gff-birth-b-mirror']) localStorage.setItem(k, b);
    });
    try {
      await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(3500);
      const alvo = page.getByText(texto, { exact: false }).first();
      await alvo.scrollIntoViewIfNeeded({ timeout: 10000 });
      await page.waitForTimeout(600);
      await alvo.click({ timeout: 10000 });
      await page.waitForTimeout(4000);
      await page.screenshot({ path: 'shot-' + nome + '.png' });
      console.log('OK   ' + nome);
    } catch (e) {
      console.log('FALHOU ' + nome + ': ' + String(e.message).split('\n')[0].slice(0, 70));
    }
    await ctx.close();
  }
  await b.close();
})();
