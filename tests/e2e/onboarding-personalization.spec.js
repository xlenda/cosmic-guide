const { test, expect } = require('@playwright/test');

test.describe('Primeiro caminho personalizado', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('app-language', 'pt');
    });
  });

  test('contexto limpo mostra uma ação e muda o plano conforme a resposta', async ({ page }) => {
    await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('onboarding-intro')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByText('Tem algo que você quer entender melhor hoje.')).toBeVisible();
    await expect(page.getByTestId('orbi-guide')).toBeVisible();
    await page.getByTestId('onboarding-intro-primary').click();

    await expect(page.getByText('O que você quer entender agora?')).toBeVisible({ timeout: 20_000 });
    await expect(page.getByTestId('onboarding-primary')).toBeVisible();
    await expect(page.getByTestId('pill-premium')).toHaveCount(0);

    await page.getByTestId('onboarding-intent-love').click();
    const plan = page.getByTestId('onboarding-plan-preview');
    await expect(plan).toContainText('Seu caminho começa pelos vínculos');

    await page.getByTestId('onboarding-intent-self').click();
    await expect(plan).toContainText('Seu caminho começa pelo que é calculável no nascimento');
    await expect(plan).not.toContainText('vínculos');

    // Responder só personaliza a prévia. O tema não persiste antes de o
    // cadastro real terminar, para abandono no meio não deixar dado órfão.
    await page.getByTestId('onboarding-primary').click();
    await expect(page.getByTestId('onboarding-situation-selfEmotions')).toBeVisible();
    await expect(page.getByTestId('onboarding-situation-loveBeginning')).toHaveCount(0);

    await page.getByTestId('onboarding-situation-selfEmotions').click();
    await expect(page.getByTestId('onboarding-situation-preview')).toBeVisible();
    await page.getByTestId('onboarding-situation-next').click();

    await expect(page.getByTestId('onboarding-outcome-nextStep')).toBeVisible();
    await page.getByTestId('onboarding-outcome-nextStep').click();
    await expect(page.getByTestId('onboarding-outcome-preview')).toBeVisible();

    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('cosmic-onboarding-intent-v1'))).toBe(null);
    await expect.poll(() => page.evaluate(() => window.localStorage.getItem('cosmic-onboarding-profile-v1'))).toBe(null);
  });
});

test('usuário novo recebe o primeiro caminho sem perder a Home', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ name: 'Touro', pt: 'Touro', icon: '♉', color: '#5FD98C' })
    );
    window.localStorage.setItem('cosmic-onboarding-intent-v1', 'self');
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByText('Olá, Touro')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Seu primeiro caminho')).toBeVisible();
  await expect(page.getByTestId('home-explore-toggle')).toBeVisible();
  await expect(page.getByTestId('card-tarot')).toHaveCount(0);
  await page.getByTestId('home-explore-toggle').click();
  await expect(page.getByTestId('card-tarot')).toBeVisible();
  await expect(page.getByText('Pensamento cósmico do dia')).toBeVisible();
});

test('atalho de signo mostra a leitura do signo tocado antes da Home', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('app-language', 'pt'));
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await page.getByTestId('onboarding-intro-shortcut').click();
  await page.getByText('Touro', { exact: true }).click();

  await expect(page.getByText(/Touro é terra fixa/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Áries é fogo cardinal/)).toHaveCount(0);
});

test('a primeira tiragem revela três cartas grandes em sequência', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ nome: 'Áries', name: 'Áries', signo: 'Áries' })
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await page.getByTestId('home-explore-toggle').click();
  await page.getByTestId('card-tarot').click();
  await expect(page.getByTestId('tarot-draw')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('tarot-draw').click();

  const scratch = page.getByTestId('tarot-scratch-0');
  await expect(scratch).toBeVisible();
  const box = await scratch.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(box.width).toBeGreaterThanOrEqual(viewport.width * 0.72);

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

  await page.getByTestId('tarot-next-0').click();
  await expect(page.getByTestId('tarot-scratch-1')).toBeVisible();
  await page.getByTestId('tarot-scratch-1').getByText('Revelar sem raspar').click();
  await expect(page.getByTestId('tarot-card-name-1')).toBeVisible({ timeout: 10_000 });

  await page.getByTestId('tarot-next-1').click();
  await expect(page.getByTestId('tarot-scratch-2')).toBeVisible();
  await page.getByTestId('tarot-scratch-2').getByText('Revelar sem raspar').click();

  await expect(page.getByTestId('tarot-personal-synthesis')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('tarot-community-card')).toBeVisible();
});

test('perfil adaptativo muda a primeira ferramenta e abre a rota prometida', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ name: 'Touro', pt: 'Touro', icon: '♉', color: '#5FD98C' })
    );
    window.localStorage.setItem('cosmic-onboarding-intent-v1', 'love');
    window.localStorage.setItem(
      'cosmic-onboarding-profile-v1',
      JSON.stringify({ intent: 'love', situation: 'loveClosure', outcome: 'clarity' })
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  const firstPath = page.getByTestId('home-first-path');
  await expect(firstPath).toContainText('Primeiro passo: Diário Cósmico', { timeout: 20_000 });
  await expect(firstPath).toContainText('Estou fechando um ciclo');
  await firstPath.click();
  await expect(page.getByText('Diário Cósmico', { exact: true })).toBeVisible({ timeout: 20_000 });
});
