// Regressao do seletor de cidade do Mapa Astral (relato de tester 26/07/2026:
// "no item Mapa Astral so tem a cidade de Sao Paulo - SP").
//
// Trava DOIS bugs distintos que causavam esse sintoma:
//
// 1) CRASH: BirthChartScreen renderizava <CityPickerModal> sem importar o
//    componente (a copia local foi extraida pra components/CityPickerModal.js
//    e o import nunca foi adicionado). A tela inteira caia no error boundary
//    com "CityPickerModal is not defined".
//
// 2) LISTA COLAPSADA: a bottom sheet antiga tinha altura em porcentagem e a
//    lista tinha maxHeight sem flex/minHeight. Com o teclado aberto a viewport
//    encolhe e sobrava ~45px de lista = UMA linha visivel ("Sao Paulo, SP"),
//    sem nada indicando que havia mais 400 cidades abaixo.
//    Medido no dist/ antes da correcao: 375x667 -> 260px/6 linhas;
//    375x340 -> 77px/2 linhas; 360x300 -> 45px/1 linha.
//
// Roda contra o dist/ exportado. Se dist/ estiver velho o teste passa/falha
// pelo bundle errado — rodar "npx expo export --platform web" antes.
const { test, expect } = require('@playwright/test');

// Em serie: sao 5 cargas de um bundle de ~2,2 MB servido por um static server
// single-thread. Em paralelo o clique inicial corria antes da hidratacao e o
// teste falhava por timing, nao por regressao.
test.describe.configure({ mode: 'serial' });
test.beforeEach(({}, testInfo) => testInfo.setTimeout(90_000));

// O bundle referencia fontes/APIs externas; esperar 'load' com a rede real
// trava o goto. Bloqueamos tudo que nao for o servidor local.
async function abrirPicker(page, { width, height }) {
  await page.setViewportSize({ width, height });
  await page.route('**/*', (route) =>
    route.request().url().startsWith('http://localhost:4173') ? route.continue() : route.abort()
  );
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ nome: 'Áries', name: 'Áries', signo: 'Áries' })
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  const card = page.getByTestId('card-birthchart');
  await expect(card).toBeVisible({ timeout: 30000 });

  // O bundle e grande e o servidor estatico do E2E e single-thread: com os
  // testes em paralelo o clique pode cair antes do React ligar os handlers.
  // Reclica ate a tela de destino aparecer em vez de assumir que pegou.
  const cityBtn = page.getByText('Cidade de nascimento (opcional)').first();
  await expect(async () => {
    if (!(await cityBtn.isVisible())) {
      await card.click({ timeout: 5000 }).catch(() => {});
      throw new Error('ainda na home');
    }
  }).toPass({ timeout: 60000, intervals: [500, 1000, 2000] });

  // Bug 1: se o import sumir de novo, a tela vira error boundary.
  await expect(page.getByText('Algo deu errado')).toHaveCount(0);

  await cityBtn.click();
  await expect(page.getByTestId('city-picker-modal')).toBeVisible({ timeout: 15000 });
}

// Mede a lista: altura visivel, altura rolavel e quantas linhas cabem inteiras.
async function medirLista(page) {
  return page.evaluate(() => {
    const list = document.querySelector('[data-testid="city-picker-list"]');
    if (!list) return { error: 'lista nao encontrada' };
    const scroller =
      [list, ...list.querySelectorAll('div')].find((d) => {
        const cs = getComputedStyle(d);
        return cs.overflowY === 'auto' || cs.overflowY === 'scroll';
      }) || list;
    const r = scroller.getBoundingClientRect();
    const rows = [...scroller.querySelectorAll('*')].filter(
      (el) => el.children.length === 0 && /—\s*Brasil/.test(el.textContent || '')
    );
    const inteiras = rows.filter((el) => {
      const rr = el.getBoundingClientRect();
      return rr.top >= r.top - 1 && rr.bottom <= r.bottom + 1;
    });
    return {
      listH: Math.round(r.height),
      scrollH: scroller.scrollHeight,
      linhasInteiras: inteiras.length,
      primeira: inteiras[0] && inteiras[0].textContent.trim(),
    };
  });
}

test('Mapa Astral abre o seletor sem crashar', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await abrirPicker(page, { width: 375, height: 667 });
  expect(erros.filter((m) => /is not defined/.test(m))).toEqual([]);
});

// O caso do tester: viewport baixa (teclado aberto). Antes: 1 linha.
for (const vp of [
  { name: '375x667 sem teclado', width: 375, height: 667, minLinhas: 6 },
  { name: '375x340 com teclado', width: 375, height: 340, minLinhas: 3 },
  { name: '360x300 com teclado', width: 360, height: 300, minLinhas: 3 },
]) {
  test(`lista nao colapsa em ${vp.name}`, async ({ page }) => {
    await abrirPicker(page, vp);
    const m = await medirLista(page);
    expect(m.error).toBeUndefined();
    // O sintoma exato do relato era ver SO Sao Paulo.
    expect(m.linhasInteiras).toBeGreaterThanOrEqual(vp.minLinhas);
    // E precisa ser obvio que da pra rolar: muito mais conteudo que a janela.
    expect(m.scrollH).toBeGreaterThan(m.listH * 5);
  });
}

// A partir de 30/07/2026 a busca vai pro servidor (GET /api/cities/search) e a
// lista embutida virou uma RESERVA de 151 cidades. Este teste roda com a rede
// externa BLOQUEADA (ver abrirPicker: tudo que nao for localhost e abortado),
// entao ele mede exatamente o cenario que importa: SEM INTERNET, o cadastro
// continua funcionando. Se um dia a reserva sumir "porque o servidor resolve",
// este teste cai.
test('sem rede, a reserva atende: 151 cidades e a busca filtra', async ({ page }) => {
  await abrirPicker(page, { width: 375, height: 667 });

  const contador = page.getByTestId('city-picker-counter');
  await expect(contador).toContainText('151 cidades');

  const input = page.getByTestId('city-picker-input');
  // acento, sigla de estado, nome de estado por extenso e prefixo parcial
  for (const [q, esperado] of [
    ['uberlandia', 'Uberlândia'],
    ['niteroi', 'Niterói'],
    ['sao ber', 'São Bernardo do Campo'],
    ['osasco', 'Osasco'],
  ]) {
    await input.fill(q);
    await expect(page.getByTestId('city-picker-list')).toContainText(esperado, { timeout: 10000 });
  }

  // Termo inexistente mostra o estado vazio, nao uma lista fantasma.
  await input.fill('xyzzy');
  await expect(contador).toContainText('Nenhuma cidade encontrada', { timeout: 10000 });
});

test('busca sem rede avisa e NAO trava: aviso discreto + lista utilizavel', async ({ page }) => {
  await abrirPicker(page, { width: 375, height: 667 });

  const input = page.getByTestId('city-picker-input');
  // 2+ caracteres = tenta o servidor; com a rede bloqueada, o fetch falha.
  await input.fill('sao paulo');

  // O aviso aparece...
  await expect(page.getByTestId('city-picker-warning')).toBeVisible({ timeout: 15000 });
  // ...e a lista continua com conteudo escolhivel (isto e o que NAO pode
  // quebrar: erro de rede na porta de entrada do app).
  await expect(page.getByTestId('city-picker-list')).toContainText('São Paulo, SP — Brasil');

  // Credito da licenca CC BY 4.0 dos dados do GeoNames.
  await expect(page.getByTestId('city-picker-list')).toContainText('GeoNames');
});
