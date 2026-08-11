import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { uploadFixture } from '../../helpers/file-upload';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/kansspelautomaataanwezigheidsvergunningaanvragen/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;

test.setTimeout(600_000);

test('submits the kansspelautomaat aanwezigheidsvergunning happy flow', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Kansspelautomaat aanwezigheidsvergunning aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('kansspelautomaat-aanwezig-vergunning-01-startpagina');

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await declineCookies(page);
  await expectFormStep(page, 'Aanvraag');
  await page.getByLabel('Naam bedrijf waarvoor u een vergunning aanvraagt', { exact: true }).fill('Testbedrijf Playwright');
  await page.getByLabel('Postcode', { exact: true }).fill('6511 PS');
  await page.getByLabel('Straatnaam', { exact: true }).fill('Mariënburg');
  await page.getByLabel('Huisnummer', { exact: true }).fill('30');
  await page.getByLabel('Woonplaats', { exact: true }).fill('Nijmegen');
  await page.getByLabel('Naam zaak waarvoor u een vergunning aanvraagt', { exact: true }).fill('Testcafé Playwright');
  await page.getByLabel('Inschrijfnummer Kamer van Koophandel (KvK)', { exact: true }).fill('69599084');
  await page.getByRole('radio', { name: 'café of restaurant (horeca met alcoholvergunning)', exact: true }).check();
  await page.getByRole('radio', { name: '1 kansspelautomaat', exact: true }).check();
  await page.getByRole('radio', { name: 'onbepaalde tijd', exact: true }).check();
  await captureLoadedFormState('kansspelautomaat-aanwezig-vergunning-02-aanvraag');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bijlage(n)');

  await uploadFixture(page, page.getByRole('link', { name: "selecteer 'Toevoegen'-bestanden", exact: true }), 'pdf13Kb');
  // Open Forms renders this required confirmation checkbox without an accessible name; this step contains exactly one native checkbox.
  const contractCheckbox = page.locator('input[type="checkbox"]');
  await expect(contractCheckbox).toHaveCount(1);
  await contractCheckbox.check();
  await expect(contractCheckbox).toBeChecked();
  await captureLoadedFormState('kansspelautomaat-aanwezig-vergunning-03-bijlagen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Contactgegevens');

  await page.getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radio', { name: 'via e-mail', exact: true }).check();
  await page.getByLabel('E-mailadres', { exact: true }).fill('test@example.com');
  await captureLoadedFormState('kansspelautomaat-aanwezig-vergunning-04-contactgegevens');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');

  await captureLoadedFormState('kansspelautomaat-aanwezig-vergunning-05-controleer-en-bevestig');
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Uw gegevens zijn verstuurd met kenmerk OF-[A-Z0-9]+$/ })).toBeVisible({ timeout: 120_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'kansspelautomaat-aanwezig-vergunning-99-bevestiging')}`);
});
