import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/aanmelden-voor-noodopvang/');
const municipalityMessage = 'De personen wonen niet in de gemeente Nijmegen. Zij kunnen geen noodopvang krijgen in de gemeente Nijmegen. U kunt noodopvang aanvragen in de gemeente waar de personen nu (tijdelijk) wonen.';

test.setTimeout(90_000);

test('blocks continuing when people do not currently live in Nijmegen', async ({ page }, testInfo) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await declineCookies(page);
  await page.getByText('NL', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Aanmelden voor noodopvang', exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();

  await expectFormStep(page, 'Uw gegevens');
  await page.getByLabel('Naam', { exact: true }).fill('Playwright test');
  await page.getByLabel('E-mailadres', { exact: true }).fill('playwright-noodopvang@example.com');
  await page.getByLabel('Telefoonnummer', { exact: true }).fill('0612345678');
  await page.getByLabel('Gegevens contactpersoon die Nederlands of Engels spreekt', { exact: true }).fill('Playwright test contactpersoon');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-noodopvang-blokkering-01-uw-gegevens')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();

  await expectFormStep(page, 'Gegevens personen noodopvang');
  const municipalityGroup = page.getByRole('radiogroup', { name: 'Wonen deze personen (tijdelijk) op dit moment in de gemeente Nijmegen?' });
  await municipalityGroup.getByRole('radio', { name: 'nee', exact: true }).check();
  await expect(page.getByText(municipalityMessage, { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-noodopvang-blokkering-02-niet-in-nijmegen')}`);
});
