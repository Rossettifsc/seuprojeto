import { expect, test } from '@playwright/test';

test('enters the demo and registers an income transaction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Explorar demonstração' }).click();
  await expect(page.getByRole('heading', { name: /Olá, Elisa/ })).toBeVisible();
  await expect(page.locator('.metric-card')).toHaveCount(4);

  await page
    .getByRole('button', { name: /Nova transação/ })
    .first()
    .click();
  await page.getByLabel('Descrição').fill('Bônus do projeto');
  await page.getByRole('button', { name: 'Receita' }).click();
  await page.locator('.modal-form .amount-input input').fill('450');
  await page.getByLabel('Categoria').selectOption('Extra');
  await page.getByRole('button', { name: 'Salvar transação' }).click();

  await expect(page.getByText('Bônus do projeto')).toBeVisible();
  await expect(page.getByText('+R$ 450,00')).toBeVisible();

  await page.getByRole('navigation', { name: 'Navegação móvel' }).getByRole('button', { name: 'Metas' }).click();
  await page.getByRole('button', { name: 'Nova meta' }).click();
  await page.getByLabel('Nome da meta').fill('Fundo educação');
  await page.locator('.modal-form .amount-input input').fill('1200');
  await page.locator('.modal-form input[type="date"]').fill('2027-12-01');
  await page.getByRole('button', { name: 'Criar meta' }).click();
  await expect(page.getByRole('heading', { name: 'Fundo educação' })).toBeVisible();

  await page.locator('.goal-card-footer .link-button').first().click();
  await page.locator('.modal-card .amount-input input').fill('100');
  await page.getByRole('dialog').getByRole('button', { name: 'Adicionar valor' }).click();
  await expect(page.locator('.goal-card').filter({ hasText: 'Fundo educação' }).locator('.goal-amounts')).toContainText(
    'R$ 100,00',
  );

  await page.locator('.theme-button').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
});
