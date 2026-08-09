import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/bezwaar-maken/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;

test.setTimeout(600_000);

test('submits the bezwaar maken happy flow', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Bezwaar maken', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-01-startpagina')}`);

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-02-algemeen')}`);

  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Gegevens besluit of beschikking');
  await fillOpenFormsDate(page, 'Op welke datum heeft de gemeente het besluit bekend gemaakt of de beschikking gegeven?', '08-08-2026');
  await page.getByRole('textbox', { name: /Welk kenmerk of referentienummer/ }).fill('TEST-BEZWAAR-2026');
  await page.getByRole('textbox', { name: /Waarom bent u het niet eens/ }).fill('Ik ben het niet eens met het besluit en maak daarom bezwaar.');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-03-gegevens-besluit')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Contactgegevens');
  await page.getByRole('radio', { name: 'mijzelf', exact: true }).check();
  await page.getByRole('radio', { name: 'via e-mail', exact: true }).check();
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-04-contactgegevens')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bijlagen');
  await page.getByRole('radio', { name: 'nee, ik wil geen bijlagen meesturen', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-05-bijlagen')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-06-controleer-en-bevestig')}`);
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 120_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-99-bevestiging')}`);
});
