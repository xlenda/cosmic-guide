const { test, expect } = require('@playwright/test');

test.describe.configure({ mode: 'serial' });
test.beforeEach(async ({ page }, testInfo) => {
  testInfo.setTimeout(90_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/*', (route) =>
    route.request().url().startsWith('http://localhost:4173') ? route.continue() : route.abort()
  );
});

async function seedKnownUser(
  page,
  { withBirth = true, invalidBirth = false, legacyOffsetBirth = false, withJournal = true } = {}
) {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ name: 'Touro', pt: 'Touro', icon: '♉', color: '#5FD98C' })
    );
    window.localStorage.setItem(
      'cosmic-onboarding-profile-v1',
      JSON.stringify({ intent: 'self', situation: 'selfEmotions', outcome: 'nextStep' })
    );
  });
  if (withJournal) {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'cosmic-journal',
        JSON.stringify([{ id: 'seed', type: 'tarot', title: 'Leitura', body: 'Corpo', date: '2026-08-23T12:00:00' }])
      );
    });
  }
  if (withBirth) {
    if (invalidBirth) {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          'birth-solo-mirror',
          JSON.stringify({ date: '2026-02-30', time: '14:30', city: null })
        );
      });
    } else if (legacyOffsetBirth) {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          'birth-solo-mirror',
          JSON.stringify({
            date: '2015-01-10',
            time: '13:00',
            city: { utcOffset: -3 },
          })
        );
      });
    } else {
      await page.addInitScript(() => {
        window.localStorage.setItem(
          'birth-solo-mirror',
          JSON.stringify({
            date: '1990-06-15',
            time: '14:30',
            city: {
              name: 'São Paulo',
              timezone: 'America/Sao_Paulo',
              utcOffset: -3,
            },
          })
        );
      });
    }
  }
}

async function openAlignmentFromHome(page) {
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });
  const entry = page.getByTestId('home-sky-alignment');
  await expect(entry).toBeVisible({ timeout: 30_000 });
  await entry.scrollIntoViewIfNeeded();
  await entry.click();
  await expect(page.getByTestId('sky-alignment-stage')).toBeVisible({ timeout: 30_000 });
}

test('arrastar os dois discos revela o recibo calculado sem criar overflow', async ({ page }) => {
  await seedKnownUser(page);
  await openAlignmentFromHome(page);

  const current = page.getByTestId('sky-alignment-stage-current-sky');
  const natal = page.getByTestId('sky-alignment-stage-my-map');
  const currentBox = await current.boundingBox();
  const natalBox = await natal.boundingBox();
  expect(currentBox).not.toBeNull();
  expect(natalBox).not.toBeNull();

  await page.mouse.move(currentBox.x + currentBox.width / 2, currentBox.y + currentBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(natalBox.x + natalBox.width / 2, natalBox.y + natalBox.height / 2, { steps: 14 });
  await page.mouse.up();

  const receipt = page.getByTestId('sky-alignment-receipt');
  await expect(receipt).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('sky-alignment-receipt-data')).toBeVisible();
  await expect(page.getByTestId('sky-alignment-receipt-calculation')).toContainText('Astronomy Engine 2.1.19');
  await expect(page.getByTestId('sky-alignment-receipt-orb')).toContainText(/limite/i);
  await expect(page.getByTestId('sky-alignment-receipt-limit')).toContainText('não leu energia');
  await expect(page.getByTestId('sky-alignment-receipt-source')).toContainText('convenção moderna');
  await expect(page.getByTestId('sky-alignment-source-details')).toHaveCount(0);
  await page.getByTestId('sky-alignment-source-toggle').click();
  await expect(page.getByTestId('sky-alignment-source-details')).toContainText('Ptolomeu');
  await expect(page.getByTestId('sky-alignment-source-details')).toContainText('De quem é o orbe');
  await expect(page.getByTestId('sky-alignment-next-action')).toBeVisible();

  const geometry = await page.evaluate(() => {
    const scroll = document.querySelector('[data-testid="sky-alignment-scroll"]');
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      contentHeight: scroll && scroll.scrollHeight,
      viewportHeight: scroll && scroll.clientHeight,
    };
  });
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.width + 1);
  expect(geometry.contentHeight).toBeGreaterThan(geometry.viewportHeight);

  await page.getByTestId('sky-alignment-scroll').evaluate((node) => {
    node.scrollTop = node.scrollHeight;
  });
  await expect(page.getByText('Tarô raspa. Cosmic Guide alinha.')).toBeVisible();
});

test('movimento reduzido e teclado chegam ao mesmo recibo pelo fallback', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await seedKnownUser(page);
  await openAlignmentFromHome(page);

  const fallback = page.getByTestId('sky-alignment-stage-fallback');
  await fallback.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('sky-alignment-receipt')).toBeVisible({ timeout: 5_000 });
  await expect(page.getByTestId('sky-alignment-stage-status')).toContainText('resultado calculado');
  await expect(page.getByTestId('sky-alignment-stage')).toHaveAttribute('data-reduced-motion', 'true');
});

test('sem nascimento o app pede o dado e não fabrica um encontro', async ({ page }) => {
  // Sem diário, `showFirstPath` está ativo: a porta 3S ainda precisa aparecer.
  await seedKnownUser(page, { withBirth: false, withJournal: false });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });
  const entry = page.getByTestId('home-sky-alignment');
  await expect(entry).toBeVisible({ timeout: 30_000 });
  await entry.scrollIntoViewIfNeeded();
  await entry.click();

  const missing = page.getByTestId('sky-alignment-needs-birth');
  await expect(missing).toBeVisible({ timeout: 30_000 });
  await expect(missing).toContainText('Sem ela, não mostramos um encontro inventado');
  await expect(page.getByTestId('sky-alignment-stage')).toHaveCount(0);
  await expect(page.getByTestId('sky-alignment-receipt')).toHaveCount(0);
});

test('URL canônica direta preserva a rota e abre o estado honesto', async ({ page }) => {
  await seedKnownUser(page, { withBirth: false, withJournal: false });
  await page.goto('/cosmic-guide/alinhe-seu-ceu', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('sky-alignment-needs-birth')).toBeVisible({ timeout: 30_000 });
  expect(new URL(page.url()).pathname).toBe('/cosmic-guide/alinhe-seu-ceu');
  await expect(page.getByTestId('sky-alignment-stage')).toHaveCount(0);
  await expect(page.getByTestId('sky-alignment-receipt')).toHaveCount(0);
});

test('dado natal inválido mostra indisponibilidade sem palco nem recibo', async ({ page }) => {
  await seedKnownUser(page, { invalidBirth: true });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });
  const entry = page.getByTestId('home-sky-alignment');
  await expect(entry).toBeVisible({ timeout: 30_000 });
  await entry.scrollIntoViewIfNeeded();
  await entry.click();

  await expect(page.getByTestId('sky-alignment-unavailable')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('sky-alignment-stage')).toHaveCount(0);
  await expect(page.getByTestId('sky-alignment-receipt')).toHaveCount(0);
});

test('offset legado aparece como aproximação explícita, nunca como cidade ou fuso exato', async ({ page }) => {
  await seedKnownUser(page, { legacyOffsetBirth: true });
  await openAlignmentFromHome(page);
  await page.getByTestId('sky-alignment-stage-fallback').click();

  const data = page.getByTestId('sky-alignment-receipt-data');
  await expect(data).toContainText('UTC−03:00');
  await expect(page.getByText(/cadastro antigo guarda um offset fixo/i)).toBeVisible();
  await expect(page.getByTestId('sky-alignment-next-action')).toContainText('Mapa Astral');
});
