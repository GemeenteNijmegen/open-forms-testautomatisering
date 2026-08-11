import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/kansspelautomaataanwezigheidsvergunningaanvragen/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;
const blokkadeMelding = 'U mag geen kansspelautomaat plaatsen in uw bedrijf. Dit kan alleen in een café of restaurant. U kunt geen vergunning aanvragen.';

test.setTimeout(600_000);

test('blocks a kansspelautomaat vergunning for horeca zonder alcoholvergunning', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Kansspelautomaat aanwezigheidsvergunning aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await loginWithDigiDSimulator(page, testPerson.bsn);
  await declineCookies(page);
  await expect(page.getByRole('heading', { name: 'Aanvraag', exact: true })).toBeVisible({ timeout: 60_000 });

  await page.getByLabel('Naam bedrijf waarvoor u een vergunning aanvraagt', { exact: true }).fill('Testbedrijf Playwright');
  await page.getByLabel('Postcode', { exact: true }).fill('6511 PS');
  await page.getByLabel('Straatnaam', { exact: true }).fill('Mariënburg');
  await page.getByLabel('Huisnummer', { exact: true }).fill('30');
  await page.getByLabel('Woonplaats', { exact: true }).fill('Nijmegen');
  await page.getByLabel('Naam zaak waarvoor u een vergunning aanvraagt', { exact: true }).fill('Testsnackbar Playwright');
  await page.getByLabel('Inschrijfnummer Kamer van Koophandel (KvK)', { exact: true }).fill('69599084');
  await page.getByRole('radio', { name: 'kantine, snackbar, lunchroom, ijssalon (horeca zonder alcoholvergunning)', exact: true }).check();

  await expect(page.getByText(blokkadeMelding, { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  await captureLoadedFormState('kansspelautomaat-aanwezig-vergunning-02-blokkade-horeca-zonder-alcoholvergunning');
});
