import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { loginWithEHerkenningSimulator } from '../../authentication/eherkenning-simulator';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { kvkTestCompanies } from '../../test-data/kvk-test-companies';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/individuele-inkomenstoeslag-aanvragen/');
const outsideNijmegenPerson = digidSimulatorPersons.jaelDeJager;
const testCompany = kvkTestCompanies.emzDagobert;
const municipalityMessage = 'U woont niet in de gemeente Nijmegen. Hierdoor kunt u geen individuele inkomenstoeslag bij ons aanvragen. U kunt de individuele inkomenstoeslag aanvragen in de gemeente waar u staat ingeschreven.';

test.setTimeout(600_000);

test('blocks individuele inkomenstoeslag for a DigiD applicant living outside Nijmegen', { tag: '@digid-999992740' }, async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Individuele inkomenstoeslag aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await loginWithDigiDSimulator(page, outsideNijmegenPerson.bsn);
  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);

  await expect(page.getByText(municipalityMessage, { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(3_000);
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'individuele-inkomenstoeslag-woonplaats-blokkering-01-digid-buiten-nijmegen')}`);
});

test('blocks individuele inkomenstoeslag for an eHerkenning application outside Nijmegen', { tag: '@kvk-69599084' }, async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Individuele inkomenstoeslag aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await loginWithEHerkenningSimulator(page, testCompany.kvkNumber);
  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);

  await page.getByRole('radiogroup', { name: 'Woont de persoon waarvoor u toeslag aanvraagt in Nijmegen? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await expect(page.getByText(municipalityMessage, { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(3_000);
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'individuele-inkomenstoeslag-woonplaats-blokkering-02-eherkenning-buiten-nijmegen')}`);
});
