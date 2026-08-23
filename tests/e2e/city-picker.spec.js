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
// `api` (opcional) intercepta as chamadas de /api/cities/*. Ele e registrado
// DEPOIS do catch-all de proposito: no Playwright o handler registrado por
// ULTIMO e consultado PRIMEIRO, entao e assim que o mock ganha do abort.
async function abrirPicker(page, { width, height }, { api = null } = {}) {
  await page.setViewportSize({ width, height });
  await page.route('**/*', (route) =>
    route.request().url().startsWith('http://localhost:4173') ? route.continue() : route.abort()
  );
  if (api) await page.route('**/api/cities/**', api);
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ nome: 'Áries', name: 'Áries', signo: 'Áries' })
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText(/undefined/i)).toHaveCount(0);

  // A Home nasce focada no caminho do dia; o catálogo completo continua a um
  // toque e precisa abrir sem perder nenhum card.
  await page.getByTestId('home-explore-toggle').click();

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

// ===========================================================================
// O CAMINHO REMOTO — os dois testes acima provam que SEM servidor nada trava;
// estes provam que COM servidor a coisa realmente entrega. Sem eles, a
// integracao inteira estaria coberta so pelo lado do fallback, e o dia em que
// o dono rodar `node scripts/import-cities.js` seria o primeiro teste de
// verdade da feature — em producao.
//
// Junqueiropolis (geonameid 3459452) e literalmente o pedido do tester de
// 29/07/2026. Ela NAO esta na reserva de 151 e nunca estara: e o municipio de
// ~20 mil habitantes que motivou a mudanca toda.
const JUNQUEIROPOLIS = {
  id: 'gn-3459452',
  geonameid: 3459452,
  name: 'Junqueirópolis',
  admin: 'SP',
  country: 'Brasil',
  countryCode: 'BR',
  lat: -21.51472,
  lon: -51.43361,
  utcOffset: -3,
  timezone: 'America/Sao_Paulo',
  population: 19506,
};

function respostaBusca(items) {
  return {
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      query: 'junqueiropolis',
      lang: 'pt',
      count: items.length,
      items,
      attribution: 'Cidades: GeoNames (CC BY 4.0)',
    }),
  };
}

// O 503 REAL da producao de hoje: a rota existe e responde, mas o
// data/cities.sqlite ainda nao foi gerado no servidor.
function resposta503() {
  return {
    status: 503,
    contentType: 'application/json',
    headers: { 'Retry-After': '300' },
    body: JSON.stringify({ error: 'unavailable', detail: 'base de cidades indisponivel' }),
  };
}

test('com o servidor no ar, a cidade que NAO esta na reserva aparece e da pra escolher', async ({
  page,
}) => {
  await abrirPicker(
    page,
    { width: 375, height: 667 },
    { api: (route) => route.fulfill(respostaBusca([JUNQUEIROPOLIS])) }
  );

  const lista = page.getByTestId('city-picker-list');

  // Confere primeiro que ela NAO vem da reserva, e que 1 letra NAO vai ao
  // servidor (MIN_REMOTE_QUERY=2 em lib/cities.js). Contar as requisicoes e o
  // que torna isto uma asseracao de verdade: a versao anterior so checava
  // `not.toContainText`, que passa instantaneamente porque a lista ainda nao
  // teve tempo de mudar — ela passaria ate se 1 letra disparasse a rede.
  const chamadas = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/cities/')) chamadas.push(r.url());
  });
  await page.getByTestId('city-picker-input').fill('j');
  await page.waitForTimeout(1200); // muito alem dos 280ms de debounce
  expect(chamadas).toEqual([]);
  await expect(lista).not.toContainText('Junqueirópolis');

  // Agora sim: 2+ caracteres disparam o servidor (depois do debounce).
  await page.getByTestId('city-picker-input').fill('junqueiropolis');
  await expect(lista).toContainText('Junqueirópolis, SP — Brasil', { timeout: 15000 });
  // Resultado do servidor => nenhum aviso de rede na tela.
  await expect(page.getByTestId('city-picker-warning')).toHaveCount(0);

  // E o principal: da pra SELECIONAR e o modal fecha com a cidade aplicada.
  await page.getByText('Junqueirópolis, SP — Brasil').first().click();
  await expect(page.getByTestId('city-picker-modal')).toBeHidden({ timeout: 15000 });
  await expect(page.getByText('Junqueirópolis, SP — Brasil').first()).toBeVisible();
});

test('503 (banco ainda nao gerado) nao trava, e a tela se cura quando o servidor volta', async ({
  page,
}) => {
  // Comeca como a producao esta HOJE: 503 em toda chamada.
  let bancoPronto = false;
  await abrirPicker(
    page,
    { width: 375, height: 667 },
    { api: (route) => route.fulfill(bancoPronto ? respostaBusca([JUNQUEIROPOLIS]) : resposta503()) }
  );

  const lista = page.getByTestId('city-picker-list');
  await page.getByTestId('city-picker-input').fill('junqueiropolis');

  // Aviso proprio do 503 + a reserva continua utilizavel (nada de beco sem saida).
  await expect(page.getByTestId('city-picker-warning')).toContainText('Busca completa indisponível', {
    timeout: 15000,
  });
  await expect(lista).not.toContainText('Junqueirópolis');

  // O dono roda `node scripts/import-cities.js` no servidor...
  bancoPronto = true;
  // ...e o app se cura sem reinstalar, sem F5: o proprio "Tentar de novo".
  await page.getByText('Tentar de novo').click();

  await expect(lista).toContainText('Junqueirópolis, SP — Brasil', { timeout: 15000 });
  await expect(page.getByTestId('city-picker-warning')).toHaveCount(0);
});

// ===========================================================================
// O RISCO QUE NENHUM DOS TESTES ACIMA COBRIA: QUEM JA USA O APP.
//
// Todos os cenarios anteriores comecam com o aparelho VAZIO. Mas o perigo real
// desta mudanca nao e a pessoa nova — e o mapa de quem ja tem cidade salva no
// formato de ONTEM (lat/lon/utcOffset, SEM o campo `timezone`), gravado por uma
// versao anterior do app. Na abertura da tela o BirthChartScreen chama
// upgradeCityTimezone(), e o resultado depende de onde a cidade estava:
//
//   · id que EXISTE na reserva ("sao-paulo-br") -> ganha o fuso na hora, offline,
//     e o Ascendente e RECALCULADO com horario de verao. Muda de proposito, e a
//     tela passa a anunciar "UTC-02:00 · horario de verao".
//   · id FORA da reserva (320 dos 471 ids antigos, ex. "canoas-rs-br") -> so o
//     servidor resolveria, e o servidor esta em 503 hoje. Entao NADA muda: o
//     mapa sai exatamente como saia ontem, pelo utcOffset salvo.
//
// Os dois caminhos precisam abrir sem crashar com a API fora do ar. Este teste
// nao usa abrirPicker porque precisa semear o storage ANTES do goto.
// `birthChartSolo-mirror` e a chave real: na web o expo-secure-store e um stub
// vazio e lib/birthData.js cai no espelho em AsyncStorage, que por sua vez e o
// localStorage cru.
async function abrirMapaComCidadeSalva(page, cidadeSalva) {
  await page.setViewportSize({ width: 390, height: 780 });
  await page.route('**/*', (route) =>
    route.request().url().startsWith('http://localhost:4173') ? route.continue() : route.abort()
  );
  // O 503 REAL da producao de hoje tem que ser exercitado aqui tambem: e nele
  // que upgradeCityTimezone precisa devolver a cidade intacta em vez de lancar.
  await page.route('**/api/cities/**', (route) => route.fulfill(resposta503()));
  await page.addInitScript((salva) => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ nome: 'Áries', name: 'Áries', signo: 'Áries' })
    );
    window.localStorage.setItem('birthChartSolo-mirror', JSON.stringify(salva));
  }, cidadeSalva);
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await page.getByTestId('home-explore-toggle').click();
  const card = page.getByTestId('card-birthchart');
  await expect(card).toBeVisible({ timeout: 30000 });
  await expect(async () => {
    if (!(await page.getByText('Dados de nascimento').first().isVisible())) {
      await card.click({ timeout: 5000 }).catch(() => {});
      throw new Error('ainda na home');
    }
  }).toPass({ timeout: 60000, intervals: [500, 1000, 2000] });
  await expect(page.getByText('Algo deu errado')).toHaveCount(0);
}

// Cidade salva pela versao ANTERIOR do app: nota que NAO existe campo
// `timezone` — e exatamente o que esta no aparelho de quem instalou antes.
const SP_LEGADO = {
  id: 'sao-paulo-br',
  name: 'São Paulo',
  admin: 'SP',
  country: 'Brasil',
  lat: -23.5505,
  lon: -46.6333,
  utcOffset: -3,
};
const CANOAS_LEGADO = {
  id: 'canoas-rs-br', // estava na lista antiga de 426, NAO esta na reserva de 151
  name: 'Canoas',
  admin: 'RS',
  country: 'Brasil',
  lat: -29.9177,
  lon: -51.1839,
  utcOffset: -3,
};

test('usuario ANTIGO com cidade da reserva: mapa abre, Ascendente e corrigido e o app AVISA o horario de verao', async ({
  page,
}) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  // 10/01/2015 as 13:00 em Sao Paulo: dentro do horario de verao brasileiro.
  await abrirMapaComCidadeSalva(page, { date: '2015-01-10', time: '13:00', city: SP_LEGADO });

  // A cidade continua no dado salvo depois do upgrade. A versão compacta do
  // resultado não imprime a cidade; validar o storage é mais direto do que
  // abrir o formulário e esconder o próprio mapa que este teste confere.
  await expect.poll(() => page.evaluate(() => {
    const raw = window.localStorage.getItem('birthChartSolo-mirror');
    return raw ? JSON.parse(raw)?.city?.name : null;
  })).toBe('São Paulo');
  // O mapa saiu.
  await expect(page.getByText('Ascendente', { exact: true }).first()).toBeVisible({ timeout: 20000 });
  // E o numero se explica: sem esta linha o usuario confere em outro site, ve
  // 1h de diferenca e acha que o app errou.
  await expect(page.getByText(/UTC-02:00/).first()).toBeVisible({ timeout: 20000 });
  await expect(page.getByText(/horário de verão/).first()).toBeVisible({ timeout: 20000 });

  // O VALOR, nao so a presenca do rotulo: com -3 fixo este nascimento dava
  // Touro; com o horario de verao na conta ele e Aries. Sem esta linha o teste
  // passaria mesmo que o Ascendente voltasse a ser calculado do jeito errado.
  const trio = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  expect(trio).toMatch(/Ascendente[^A-Za-zÀ-ÿ]*Áries/);
  expect(erros).toEqual([]);
});

test('usuario ANTIGO com cidade FORA da reserva e servidor em 503: o mapa dele sai igual ao de ontem', async ({
  page,
}) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await abrirMapaComCidadeSalva(page, { date: '2015-01-10', time: '13:00', city: CANOAS_LEGADO });

  await expect.poll(() => page.evaluate(() => {
    const raw = window.localStorage.getItem('birthChartSolo-mirror');
    return raw ? JSON.parse(raw)?.city?.name : null;
  })).toBe('Canoas');
  await expect(page.getByText('Ascendente', { exact: true }).first()).toBeVisible({ timeout: 20000 });
  // Sem fuso IANA nao ha o que anunciar — e, sobretudo, nao ha nada mudando.
  await expect(page.getByText(/horário de verão/)).toHaveCount(0);
  await expect(page.getByText(/UTC-0[23]:00/)).toHaveCount(0);

  // E o valor bate com o que o app de ONTEM entregava pra este mesmo dado
  // (utcOffset -3 salvo no aparelho): Aries. Este e o teste que prova
  // "nao quebramos o mapa de quem ja usa".
  const corpo = await page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  expect(corpo).toMatch(/Ascendente[^A-Za-zÀ-ÿ]*Áries/);
  expect(erros).toEqual([]);
});
