import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { declineCookies } from '../../helpers/cookies';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/contactformulier/');

test.setTimeout(90_000);

test('blocks afval of overlast with an explanation', async ({ page }, testInfo) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Stel uw vraag aan de gemeente', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();
  const logicResponse = page.waitForResponse((request) => request.url().includes('/_check-logic') && request.request().method() === 'POST');
  await page.getByRole('radio', { name: /afval.*overlast/i }).click();
  await logicResponse;
  await expect(page.getByRole('status')).toBeHidden({ timeout: 60_000 });
  await expect(page.getByText('Meld uw klacht', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Uw vraag', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'contactformulier-stel-uw-vraag-afval-of-overlast-geblokkeerd')}`);
});
