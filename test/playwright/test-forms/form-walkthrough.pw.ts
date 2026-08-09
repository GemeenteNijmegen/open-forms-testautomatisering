import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../helpers/error-artifacts';
import { captureFormState } from '../utils/form-artifacts';
import { openFormsUrl } from '../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/test-doelgroep-energietransitie-eerder-aanvragen');

test('completes the first form step', async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.locator('body')).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, '01-startpagina')}`);

  await page.getByText('Formulier starten', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Doelgroep en bewijs', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, '02-doelgroep-en-bewijs')}`);

  const doelgroep = page.locator('.choices').filter({ has: page.locator('select[name="data[bewijsstukCategorieTest]"]') });
  await doelgroep.click();
  const doelgroepOptie = page.getByRole('option', { name: 'Woonbehoefte algemeen – overheid', exact: true });
  await expect(doelgroepOptie).toBeVisible({ timeout: 10_000 });
  await doelgroepOptie.click();

  const currentUrl = page.url();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect.poll(() => page.url()).not.toBe(currentUrl);
  await expect(page.locator('body')).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, '03-volgende-pagina')}`);
});
