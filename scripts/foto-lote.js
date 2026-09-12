// Fotografa as telas do LOTE DE TEXTO LONGO (Horoscopo, Mapa, Sonho) em
// 390x844 contra o servidor e2e (porta 4173).
//   node scripts/foto-lote.js <pasta-destino>
//
// POR QUE CLICA EM VEZ DE USAR URL. Horoscope, BirthChart e Dream NAO estao no
// mapa de `linking` de App.js: /cosmic-guide/Horoscope cai na Home (conferido,
// 12/09/2026). Entao a navegacao e a real, pela Home/Explorar, como a pessoa faz.
//
// DOIS ESTADOS POR TELA, porque o briefing exige os dois:
//   ...-vazio  = so o signo salvo (o minimo pra passar do onboarding). E o
//                estado SEM nascimento: o Mapa abre no convite/formulario.
//   ...-cheio  = signo + nascimento completo (data, hora, cidade).
// Contexto NOVO por foto (deviceScaleFactor 2), storage plantado com as chaves
// REAIS lidas do codigo (nunca adivinhadas):
//   userSign              -> lib/coupleData.js USER_SIGN_KEY
//   birthChartSolo-mirror -> lib/birthData.js mirrorKeyFor('birthChartSolo')
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

// Cada tela e alcancada pela VITRINE (/explorar), que e a unica dessas rotas
// com URL no `linking` de App.js — Horoscope, BirthChart e Dream nao tem path
// proprio (conferido 12/09/2026: /cosmic-guide/Horoscope cai na Home). Clicar
// no rotulo da vitrine e a navegacao real, a mesma que a pessoa faz.
const TELAS = [
  { nome: 'horoscopo', rotulo: 'Horóscopo' },
  { nome: 'mapa',      rotulo: 'Mapa Astral' },
  // O rotulo da vitrine NAO e o nome da tela: e a chamada
  // 'explore.item.dream.title'. Outra sessao a trocou de "Sonhos" para
  // "Aquele sonho quer te dizer algo" em 12/09/2026 — o "antes" (build do
  // HEAD) ainda diz "Sonhos" e o "depois" ja diz a frase. Aceitar os DOIS e o
  // que permite fotografar os dois lados com o mesmo script; quem casar
  // primeiro vale. Conferido lendo o texto da propria vitrine, nao chutado.
  { nome: 'sonho',     rotulo: ['Aquele sonho quer te dizer algo', 'Sonhos'] },
];

async function foto(browser, destino, tela, comNascimento) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  // O storage tem que existir ANTES do bundle rodar: o Gate de App.js le
  // userSign no arranque. addInitScript planta antes de qualquer script da pagina.
  await ctx.addInitScript(
    ([signo, nascimento]) => {
      try {
        localStorage.setItem('userSign', JSON.stringify(signo));
        if (nascimento) localStorage.setItem('birthChartSolo-mirror', JSON.stringify(nascimento));
      } catch {}
    },
    [SIGNO, comNascimento ? NASCIMENTO : null]
  );
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await page.goto(BASE + '/explorar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  // A vitrine e uma lista VIRTUALIZADA dentro de um container que rola por
  // conta propria (o <body> nao rola: window.scrollTo nao move nada aqui — o
  // container so foi encontrado medindo scrollHeight > clientHeight). Itens do
  // fim da lista ("Sonhos" e o 6o) so entram no DOM quando a rolagem chega
  // perto deles; os do topo ("Horoscopo") ja estao la e NAO se deve rolar,
  // senao eles saem do DOM pelo outro lado. Por isso: espera primeiro, e so
  // rola se ainda nao apareceu.
  const rotulos = Array.isArray(tela.rotulo) ? tela.rotulo : [tela.rotulo];
  // O primeiro rotulo que existir nesta build e o alvo.
  let alvo = page.getByText(rotulos[0], { exact: true }).first();
  for (const r of rotulos) {
    const tentativa = page.getByText(r, { exact: true }).first();
    if (await tentativa.count()) { alvo = tentativa; break; }
  }
  try {
    await alvo.waitFor({ state: 'attached', timeout: 2500 });
  } catch {
    for (let tentativa = 0; tentativa < 30 && !(await alvo.count()); tentativa++) {
      await page.evaluate(() => {
        const roladores = Array.from(document.querySelectorAll('div'))
          .filter((d) => d.scrollHeight > d.clientHeight + 50 && d.clientHeight > 200);
        const lista = roladores.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
        if (lista) lista.scrollTop += 300;
      });
      await page.waitForTimeout(400);
      for (const r of rotulos) {
        const tentativa = page.getByText(r, { exact: true }).first();
        if (await tentativa.count()) { alvo = tentativa; break; }
      }
    }
    await alvo.waitFor({ state: 'attached', timeout: 15000 });
  }
  await alvo.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await alvo.click({ force: true });
  await page.waitForTimeout(4000);

  const sufixo = comNascimento ? 'cheio' : 'vazio';
  // ROLAR PELA RODA DO MOUSE, NAO POR window.scrollTo. Estas telas rolam num
  // ScrollView INTERNO (o <body> nao rola): com window.scrollTo as tres dobras
  // saiam IDENTICAS — conferido comparando mapa-cheio-dobra1 e dobra2 do
  // "antes". page.mouse.wheel entrega o evento ao container que esta debaixo
  // do ponteiro, que e o mesmo caminho do dedo de verdade.
  const dobras = 3;
  await page.mouse.move(195, 500);
  for (let i = 0; i < dobras; i++) {
    if (i > 0) {
      await page.mouse.wheel(0, 700);
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: path.join(destino, `${tela.nome}-${sufixo}-dobra${i + 1}-390x844.png`) });
  }
  // CORS do api.cosmicguide.cloud e 404 de asset nao sao erro desta tela.
  const reais = erros.filter((e) => !/404|Failed to load resource|CORS|api\.cosmicguide/.test(e));
  console.log(tela.nome, sufixo, 'ok', reais.length ? 'ERRO: ' + reais[0].slice(0, 160) : '');
  await ctx.close();
}

(async () => {
  const destino = process.argv[2];
  if (!destino) throw new Error('falta a pasta destino');
  const browser = await chromium.launch();
  try {
    for (const tela of TELAS) {
      await foto(browser, destino, tela, false);
      await foto(browser, destino, tela, true);
    }
  } finally { await browser.close(); }
})();
