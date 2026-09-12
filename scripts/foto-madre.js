// Fotografa telas da Madre Maria em 390x844 contra o servidor e2e (porta 4173).
// Uso: node scripts/foto-madre.js <pasta-destino>
//
// ESTADO VAZIO (a exigencia do briefing): contexto NOVO por tela, sem leitura
// feita, sem perfil da Madre. O UNICO estado plantado e `userSign`, porque sem
// ele o App.js do Cosmic nem monta o NavigationContainer com linking — o gate
// (`!coupleData && !soloSign`, App.js:722) cai na tela de escolha e nenhuma URL
// da Madre resolve. A chave foi LIDA do app (fluxo "Ja sei meu signo" -> Leao
// -> Concluir), nunca adivinhada, e e a mesma USER_SIGN_KEY de lib/coupleData.js:43.
const { chromium } = require('playwright');
const path = require('path');

const BASE = 'http://localhost:4173/cosmic-guide';
const SIGNO = JSON.stringify({
  name: 'Leão', pt: 'Leão', icon: '♌', symbol: 'sunny',
  dates: '23 Jul - 22 Ago', element: 'Fogo', color: '#FF8C5C',
});

const TELAS = [
  ['apresentacao', '/amor'],
  ['metodo', '/amor/metodo'],
  ['ajuda', '/amor/ajuda'],
  ['privacidade', '/amor/privacidade'],
  ['termos', '/amor/termos'],
];

(async () => {
  const destino = process.argv[2];
  if (!destino) throw new Error('falta a pasta destino');
  const browser = await chromium.launch();
  try {
    for (const [nome, rota] of TELAS) {
      const ctx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
      });
      await ctx.addInitScript((s) => {
        try { window.localStorage.setItem('userSign', s); } catch {}
      }, SIGNO);
      const page = await ctx.newPage();
      const erros = [];
      page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
      await page.goto(BASE + rota, { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: path.join(destino, `${nome}-390x844.png`) });
      // Segunda dobra: rola uma tela. Telas curtas ficam iguais, e tudo bem.
      await page.evaluate(() => window.scrollTo(0, 844));
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(destino, `${nome}-390x844-dobra2.png`) });
      console.log(nome, 'ok url=', page.url(), erros.length ? 'ERR:' + erros[0].slice(0, 120) : '');
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
})();
