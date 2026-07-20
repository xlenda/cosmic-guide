// Cobre o fluxo mais barato de testar (lib/featureUsage.js é puro
// AsyncStorage/localStorage, sem dependência de rede): a 1ª visita ao
// Horóscopo libera o conteúdo e marca o uso; a 2ª visita mostra OneTimeLock.
//
// Precisa ser um CASAL, não modo solo: CoupleContext.js mantém hasAccess
// sempre true pra solo ("modo solo nunca chama o backend"), então o paywall
// nunca aparece nesse modo. Um casal SEM correlationCode salvo (nunca
// assinou) faz checkSubscriptionStatus (lib/coupleData.js) devolver
// hasAccess:false direto, sem precisar mockar rede nenhuma.
const { test, expect } = require('@playwright/test');

const COUPLE_PROFILE = { voce: 'Ana', amor: 'Bruno', sa: 'Áries', sb: 'Touro' };

test.describe('Paywall — 1 uso grátis do Horóscopo', () => {
  test.beforeEach(async ({ page }) => {
    // addInitScript roda antes de QUALQUER navegação nesta página, inclusive
    // no goto() da "segunda visita" mais abaixo — por isso só faz set do
    // perfil do casal aqui (idempotente, reaplicar o mesmo valor não quebra
    // nada). Nunca dar removeItem de feature-used-once-horoscope aqui: isso
    // apagaria a marcação de uso real que o próprio teste grava entre as duas
    // visitas. Um contexto novo do Playwright já começa com localStorage
    // vazio, então não precisa de limpeza defensiva.
    await page.addInitScript((profile) => {
      window.localStorage.setItem('gff-couple-profile', JSON.stringify(profile));
    }, COUPLE_PROFILE);
  });

  test('primeira visita libera a leitura e marca como usada; segunda visita bloqueia', async ({ page }) => {
    await page.goto('/cosmic-guide/');

    const horoscopeCard = page.getByTestId('card-horoscope');
    await expect(horoscopeCard).toBeVisible({ timeout: 15000 });
    await horoscopeCard.click();

    await expect(page.getByTestId('horoscope-reading')).toBeVisible();
    await expect(page.getByTestId('onetimelock-container')).toHaveCount(0);

    // markFeatureUsedOnce (lib/featureUsage.js) grava no storage sem await
    // dentro do useEffect — a escrita pode não ter terminado ainda no exato
    // instante em que o conteúdo aparece na tela, por isso poll em vez de
    // uma leitura única.
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('feature-used-once-horoscope')))
      .toBe('true');

    // Simula a "segunda visita" (app fechado e reaberto) navegando de volta pra
    // raiz conhecida — NÃO page.reload(): ao entrar no Horóscopo, o
    // react-navigation reescreve a URL do browser pra fora do prefixo
    // /cosmic-guide (rota não mapeada em linking.config, App.js), então um
    // reload bruto cairia num 404 real. Isso é uma lacuna de roteamento web
    // pré-existente e separada do que este teste cobre — dar goto direto na
    // raiz é a forma correta de simular reabrir o app, e preserva o
    // localStorage (mesmo contexto de browser).
    await page.goto('/cosmic-guide/');
    await expect(horoscopeCard).toBeVisible({ timeout: 15000 });
    await horoscopeCard.click();

    await expect(page.getByTestId('onetimelock-container')).toBeVisible();
    await expect(page.getByTestId('onetimelock-title')).toContainText('Horóscopo');
    await expect(page.getByTestId('horoscope-reading')).toHaveCount(0);
  });
});
