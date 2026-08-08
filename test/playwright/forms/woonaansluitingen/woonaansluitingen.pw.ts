import { expect, test } from '@playwright/test';
import { expectFormStep } from '../../helpers/form-navigation';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/test-woonaansluitingen-etc');

test.setTimeout(90_000);

test('captures the KOVA ja route', async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await page.waitForFunction(() => document.readyState === 'complete');
  await expect(page.locator('#openforms-container')).toBeVisible({ timeout: 10_000 });
  await page.getByText('Formulier starten', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'KOVA', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-kova-ja-01-kova')}`);

  await page.getByRole('radio', { name: 'Ja', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect(page.getByRole('status', { name: 'Laden...' })).toBeHidden({ timeout: 15_000 });
  await expect(page.getByRole('heading', { name: 'KOVA', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-kova-ja-02-vervolgstap')}`);

  await page.getByRole('button', { name: 'Nog een KOVA-activiteit toevoegen', exact: true }).click();
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-kova-ja-03-activiteit')}`);

  await page.locator('input[name="kovaAansluitingen:0.kovaActiviteit"]').fill('Test koffietent');
  await page.locator('input[name="kovaAansluitingen:0.kovaAantalAansluitingen"]').fill('1');
  await page.locator('input[name="kovaAansluitingen:0.kovaTransportvermogenAfnameKw"]').fill('1');
  await page.locator('input[name="kovaAansluitingen:0.kovaTransportvermogenInvoedingKw"]').fill('0');
  await page.getByRole('combobox').click();
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-kova-ja-04-aansluitopties')}`);

  await page.getByRole('option', { name: '3 x 25 A', exact: true }).click();
  await page.getByRole('button', { name: 'KOVA-activiteit opslaan', exact: true }).click();
  await page.getByRole('radio', { name: 'Nee, alleen voor deze projectfase', exact: true }).check();
  const kovaOnderbouwing = page.locator('textarea[name="kovaOnderbouwing"]');
  await kovaOnderbouwing.fill('Testactiviteit is kleinschalig, ondergeschikt aan wonen en nodig voor het woningbouwproject.');
  await kovaOnderbouwing.press('Tab');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-kova-ja-05-ingevuld')}`);

  const nextButton = page.getByRole('button', { name: 'Volgende', exact: true });
  await expect(nextButton).toBeEnabled({ timeout: 10_000 });
  await nextButton.click();
  await expectFormStep(page, 'Woningen, energie en aansluitingen');
  await expect(page.getByRole('status', { name: 'Laden...' })).toBeHidden({ timeout: 15_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-kova-ja-06-woningen-energie-aansluitingen')}`);
});

test('captures the woonaansluitingen start page', async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await page.waitForFunction(() => document.readyState === 'complete');
  await expect(page.locator('#openforms-container')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Formulier starten', { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('body')).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-01-startpagina')}`);

  await page.getByText('Formulier starten', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'KOVA', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-02-kova')}`);

  await page.getByRole('radio', { name: 'Nee', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Woningen, energie en aansluitingen', exact: true })).toBeVisible();
  await expect(page.getByRole('status', { name: 'Laden...' })).toBeHidden({ timeout: 15_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-03-woningen-energie-aansluitingen')}`);

  await page.getByRole('radio', { name: 'Alleen laagbouw', exact: true }).check();
  await page.getByRole('radio', { name: 'Nee, de gegevens zijn een voorlopige inschatting', exact: true }).check();
  await page.getByRole('button', { name: 'Nog een woninggroep toevoegen', exact: true }).click();
  await expect.poll(async () => page.locator('form').first().locator('input:not([type="radio"])').count()).toBeGreaterThan(0);
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-04-woninggroep')}`);

  await page.getByRole('combobox').click();
  await expect(page.getByRole('option').first()).toBeVisible({ timeout: 10_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-05-aansluitopties')}`);

  await page.locator('input[name="woningAansluitingscombinaties:0.bouwvorm"][value="laagbouw"]').check();
  await page.locator('input[name="woningAansluitingscombinaties:0.omschrijvingWoninggroep"]').fill('Test laagbouw');
  await page.locator('input[name="woningAansluitingscombinaties:0.aantalAansluitingen"]').fill('1');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: '3 x 25 A', exact: true }).click();
  await page.locator('textarea[name="aansluitgegevensToelichting"]').fill('Testgegevens voor geautomatiseerde controle.');
  await page.getByRole('button', { name: 'Woninggroep opslaan', exact: true }).click();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Collectieve voorzieningen');
  await expect(page.getByRole('status', { name: 'Laden...' })).toBeHidden({ timeout: 15_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-06-collectieve-voorzieningen')}`);

  await page.getByRole('radio', { name: 'Nee', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Controleer en bevestig', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Verzenden', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'woonaansluitingen-07-controleer-en-bevestig')}`);
});
