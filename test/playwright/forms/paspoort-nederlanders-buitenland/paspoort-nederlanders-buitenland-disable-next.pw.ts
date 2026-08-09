import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { declineCookies } from '../../helpers/cookies';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/paspoort-nederlanders-buitenland/');

test.setTimeout(90_000);

test('explores the rejection for an applicant without Dutch nationality', async ({ page }, testInfo) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /paspoort.*nederlanders.*buitenland/i })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click({ timeout: 30_000 });
  await expect(page.getByRole('radio', { name: 'mijzelf', exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('radio', { name: 'mijzelf', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await expect(page.getByRole('radiogroup', { name: 'Heeft u de Nederlandse nationaliteit?' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('radiogroup', { name: 'Heeft u de Nederlandse nationaliteit?' }).getByRole('radio', { name: 'nee', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'paspoort-nederlanders-buitenland-aanvrager-geen-nationaliteit')}`);
});
