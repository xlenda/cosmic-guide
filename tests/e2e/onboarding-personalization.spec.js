const { test, expect } = require('@playwright/test');

test.describe('Primeiro caminho personalizado', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('app-language', 'pt');
    });
  });

  test('contexto limpo mostra uma ação e muda o plano conforme a resposta', async ({ page }) => {
    await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Uma pergunta. Uma revelação. Um próximo passo.')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('onboarding-primary')).toBeVisible();
    await expect(page.getByTestId('pill-premium')).toHaveCount(0);

    await page.getByTestId('onboarding-primary').click();
    await expect(page.getByText('O que você quer entender agora?')).toBeVisible();

    await page.getByTestId('onboarding-intent-love').click();
    const plan = page.getByTestId('onboarding-plan-preview');
    await expect(plan).toContainText('Tarô');
    await expect(plan).toContainText('Horóscopo');

    await page.getByTestId('onboarding-intent-self').click();
    await expect(plan).toContainText('Mapa Astral');
    await expect(plan).toContainText('Horóscopo');
    await expect(plan).not.toContainText('Tarô');

    // Responder só personaliza a prévia. O tema não persiste antes de o
    // cadastro real terminar, para abandono no meio não deixar dado órfão.
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('cosmic-onboarding-intent-v1'))).toBe(null);
  });
});

test('a primeira tiragem revela a carta por raspagem', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ nome: 'Áries', name: 'Áries', signo: 'Áries' })
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await page.getByTestId('card-tarot').click();
  await expect(page.getByTestId('tarot-draw')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('tarot-draw').click();

  const scratch = page.getByTestId('tarot-scratch-0');
  await expect(scratch).toBeVisible();
  const box = await scratch.boundingBox();
  expect(box).not.toBeNull();

  await page.mouse.move(box.x + 8, box.y + 8);
  await page.mouse.down();
  for (let row = 0; row < 8; row += 1) {
    const y = box.y + ((row + 0.5) * box.height) / 8;
    const xs = row % 2 === 0
      ? [0.08, 0.28, 0.48, 0.68, 0.88]
      : [0.88, 0.68, 0.48, 0.28, 0.08];
    for (const ratio of xs) await page.mouse.move(box.x + box.width * ratio, y, { steps: 2 });
  }
  await page.mouse.up();

  await expect(page.getByTestId('tarot-card-name-0')).toBeVisible({ timeout: 10_000 });
});
