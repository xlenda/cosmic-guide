const { test, expect } = require('@playwright/test');

test.describe('Primeiro caminho personalizado', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('app-language', 'pt');
    });
  });

  test('contexto limpo mostra uma ação e muda o plano conforme a resposta', async ({ page }) => {
    await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveTitle('Cosmic Guide');
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

  await expect(page).toHaveTitle('Cosmic Guide');
  await expect(page.getByText('Olá, Touro')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Seu primeiro caminho')).toBeVisible();
  await expect(page.getByTestId('home-explore-toggle')).toBeVisible();
  await expect(page.getByTestId('home-explore-toggle')).toContainText('Explorar todas as experiências');
  await expect(page.getByTestId('card-tarot')).toHaveCount(0);
  await page.getByTestId('home-explore-toggle').click();
  await expect(page.getByText('Escolha o que você quer fazer.')).toBeVisible();
  await expect(page.getByTestId('card-tarot')).toBeVisible();
  await page.getByTestId('explore-back').click();
  await expect(page.getByText('Pensamento cósmico do dia')).toBeVisible();
});

test('deep link frio de Explorar volta para a Home e a aba Início reseta sua pilha', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ name: 'Touro', pt: 'Touro', icon: '♉', color: '#5FD98C' })
    );
    window.localStorage.setItem('cosmic-onboarding-intent-v1', 'self');
  });

  await page.goto('/cosmic-guide/explorar', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Escolha o que você quer fazer.')).toBeVisible({ timeout: 20_000 });
  await page.getByTestId('explore-back').click();
  await expect(page.getByTestId('home-today-line')).toBeVisible({ timeout: 20_000 });

  await page.getByTestId('home-explore-toggle').click();
  await page.getByTestId('card-tarot').click();
  await expect(page.getByTestId('tarot-draw')).toBeVisible({ timeout: 20_000 });
  // Bottom tabs do React Navigation viram links semânticos na web. `tab`
  // era um seletor antigo e falhava mesmo com a navegação visível e funcional.
  await page.getByRole('link', { name: /Início/ }).click();
  await expect(page.getByTestId('home-today-line')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Escolha o que você quer fazer.')).toHaveCount(0);
});

test('atalho de signo mostra a leitura do signo tocado antes da Home', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('app-language', 'pt'));
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await page.getByTestId('onboarding-intro-shortcut').click();
  await page.getByText('Touro', { exact: true }).click();

  await expect(page.getByText(/Touro é terra fixa/)).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Áries é fogo cardinal/)).toHaveCount(0);
});

test('carta oculta do Álbum responde ao toque sem revelar o segredo', async ({ page }, testInfo) => {
  testInfo.setTimeout(60_000);
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
  const albumOpen = page.getByTestId('tarot-album-open');
  await expect(albumOpen).toBeVisible({ timeout: 20_000 });
  const hiddenGroups = page.getByTestId(/^album-hidden-group-/);
  // O servidor estático do E2E é single-thread e o chunk lazy do Álbum é
  // grande. Se o primeiro clique cair antes da hidratação, tenta de novo até
  // a rota realmente montar — o mesmo cuidado dos testes do Mapa Astral.
  await expect(async () => {
    if ((await hiddenGroups.count()) !== 5) {
      if (await albumOpen.isVisible().catch(() => false)) {
        await albumOpen.click({ timeout: 5_000 }).catch(() => {});
      }
      throw new Error('o Álbum ainda não montou');
    }
  }).toPass({ timeout: 35_000, intervals: [500, 1_000, 2_000] });
  await hiddenGroups.first().click();

  const prompt = page.getByTestId('album-hidden-modal');
  await expect(prompt).toBeVisible();
  await expect(prompt).toContainText('Estas cartas ainda estão guardadas');
  await expect(prompt).toContainText('depois de aparecerem em uma tiragem');
  await expect(prompt).not.toContainText(/O Louco|O Mago|A Sacerdotisa/);

  await page.getByTestId('album-hidden-draw').click();
  await expect(page.getByTestId('tarot-draw')).toBeVisible({ timeout: 20_000 });
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
  await expect(page.getByTestId('tarot-sign-lens')).toContainText('Áries');
  await page.getByTestId('tarot-focus-mutuality-boundaries').click();
  await expect(page.getByTestId('tarot-guide-receipt')).toContainText('reciprocidade');
  await page.getByTestId('tarot-draw').click();

  const scratch = page.getByTestId('tarot-scratch-0');
  await expect(scratch).toBeVisible();
  const box = await scratch.boundingBox();
  expect(box).not.toBeNull();
  const viewport = page.viewportSize();
  expect(box.width).toBeGreaterThanOrEqual(viewport.width * 0.8);

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
  await expect(page.getByTestId('tarot-card-meaning-0')).toBeVisible();
  await expect(page.getByTestId('tarot-card-meaning-0')).not.toBeEmpty();
  await expect(page.getByTestId('tarot-personal-synthesis')).toBeHidden();

  await page.getByTestId('tarot-next-0').click();
  await expect(page.getByTestId('tarot-scratch-1')).toBeVisible();
  await page.getByTestId('tarot-scratch-1').getByText('Revelar sem raspar').click();
  await expect(page.getByTestId('tarot-card-name-1')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('tarot-card-meaning-1')).toBeVisible();
  await expect(page.getByTestId('tarot-personal-synthesis')).toBeHidden();

  await page.getByTestId('tarot-next-1').click();
  await expect(page.getByTestId('tarot-scratch-2')).toBeVisible();
  await page.getByTestId('tarot-scratch-2').getByText('Revelar sem raspar').click();

  await expect(page.getByTestId('tarot-personal-synthesis')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId('tarot-community-card')).toBeVisible();

  // A terceira revelação só conclui depois de persistir o Álbum. Abrir sem
  // sair e voltar precisa mostrar exatamente as três cartas recém-vistas.
  await page.getByTestId('tarot-album-open').click();
  await expect(page.getByTestId('album-card-seen')).toHaveCount(3);
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

test('Órbi sai do catálogo e sugere perguntas a partir do perfil completo', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem(
      'userSign',
      JSON.stringify({ name: 'Touro', pt: 'Touro', icon: '♉', color: '#5FD98C' })
    );
    window.localStorage.setItem('cosmic-onboarding-intent-v1', 'love');
    window.localStorage.setItem(
      'cosmic-onboarding-profile-v1',
      JSON.stringify({ intent: 'love', situation: 'loveDistance', outcome: 'nextStep' })
    );
    window.localStorage.setItem(
      'cosmic-journal',
      JSON.stringify([{ id: 'seed', type: 'tarot', title: 'Leitura', body: 'Corpo', date: '2026-08-23T12:00:00' }])
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  await expect(page.getByTestId('home-orbi-chat')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('card-chat')).toHaveCount(0);
  await page.getByTestId('home-orbi-chat').click();

  await expect(page).toHaveTitle('Cosmic Guide');
  await expect(page.getByTestId('orbi-chat-guide')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByTestId('orbi-ai-disclosure')).toContainText('usa IA da Anthropic');
  await expect(page.getByTestId('orbi-suggestions')).toContainText('Existe distância ou dúvida');
  await expect(page.getByTestId('orbi-suggestions')).toContainText('Sair com um próximo passo');
  await expect(page.getByTestId('orbi-suggestions')).toContainText('Touro');
  await expect(page.getByText(/^(Luna|Arcano|Chat Espiritual)$/)).toHaveCount(0);
});

test('Órbi mantém a primeira ação visível e o foco perceptível em tela pequena', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem('userSign', JSON.stringify({ name: 'Touro', pt: 'Touro' }));
    window.localStorage.setItem(
      'cosmic-onboarding-profile-v1',
      JSON.stringify({ intent: 'love', situation: 'loveDistance', outcome: 'nextStep' })
    );
    window.localStorage.setItem(
      'cosmic-journal',
      JSON.stringify([{ id: 'seed', type: 'tarot', title: 'Leitura', body: 'Corpo', date: '2026-08-23T12:00:00' }])
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });

  const homeOrbi = page.getByTestId('home-orbi-chat');
  await expect(homeOrbi).toBeVisible({ timeout: 20_000 });
  await homeOrbi.focus();
  expect(await homeOrbi.evaluate((node) => getComputedStyle(node).outlineStyle)).toBe('solid');
  await homeOrbi.click();

  const firstSuggestion = page.getByTestId('orbi-suggestion-situation-loveDistance');
  await expect(firstSuggestion).toBeVisible({ timeout: 20_000 });
  await expect(firstSuggestion).toBeInViewport({ ratio: 0.5 });
  await firstSuggestion.focus();
  const focusStyle = await firstSuggestion.evaluate((node) => {
    const style = getComputedStyle(node);
    return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
  });
  expect(focusStyle.outlineStyle).toBe('solid');
  expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3);
});

test('migração rotula o histórico importado e nunca o reenvia como fala do Órbi', async ({ page }) => {
  let chatPayload = null;
  await page.route('**/api/chat', async (route) => {
    chatPayload = route.request().postDataJSON();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ reply: 'Resposta nova do Órbi' }),
    });
  });
  await page.addInitScript(() => {
    window.localStorage.setItem('app-language', 'pt');
    window.localStorage.setItem('userSign', JSON.stringify({ name: 'Áries', pt: 'Áries' }));
    window.localStorage.setItem('cosmic-journal', JSON.stringify([{ id: 'seed', type: 'tarot', title: 'Leitura', body: 'Corpo', date: '2026-08-23T12:00:00' }]));
    window.localStorage.setItem(
      'cosmic-chat-history-luna',
      JSON.stringify([
        { id: '1750000000000-1', from: 'persona', text: 'apresentação antiga' },
        { id: '1750000000001-2', from: 'user', text: 'Minha pergunta que não pode sumir' },
        { id: '1750000000002-3', from: 'persona', text: 'Minha resposta antiga preservada' },
      ])
    );
  });
  await page.goto('/cosmic-guide/', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('home-orbi-chat').click();

  await expect(page.getByText('Minha pergunta que não pode sumir')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Minha resposta antiga preservada')).toBeVisible();
  await expect(page.getByText('Histórico importado', { exact: true })).toBeVisible();
  await expect(
    page.getByText('Mensagens anteriores disponíveis neste aparelho foram importadas só para consulta; elas não são enviadas ao Órbi.')
  ).toBeVisible();
  await expect(page.getByText('apresentação antiga')).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Escreva o que você quer entender…' }).fill('Esta é uma pergunta nova');
  await page.getByRole('button', { name: 'Enviar mensagem para Órbi' }).click();
  await expect(page.getByText('Resposta nova do Órbi')).toBeVisible({ timeout: 20_000 });

  expect(chatPayload).not.toBeNull();
  expect(chatPayload.personaId).toBe('orbi');
  expect(chatPayload.message).toBe('Esta é uma pergunta nova');
  expect(chatPayload.history).toEqual([]);
});
