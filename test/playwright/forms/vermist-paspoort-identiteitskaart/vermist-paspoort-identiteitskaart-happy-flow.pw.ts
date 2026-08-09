import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/vermistpaspoortofidentiteitskaartmelden/');
// De happy flow is alleen mogelijk voor een inwoner van Nijmegen.
const testPerson = digidSimulatorPersons.persoon999971797;

test.setTimeout(600_000);

test('submits the vermist paspoort of identiteitskaart melden happy flow', { tag: '@digid-999971797' }, async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: /Vermist paspoort of identiteitskaart melden/i })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('vermist-paspoort-01-startpagina');

  console.log('Happy flow gebruikt een BRP-testidentiteit die in Nijmegen woont; andere gemeenten worden op deze stap geblokkeerd.');
  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);
  // BRP-prefill completes asynchronously after DigiD returns.
  await page.waitForTimeout(10_000);
  await expect(page.getByRole('textbox', { name: 'Gemeente van inschrijving *', exact: true })).toHaveValue(/Nijmegen/i, { timeout: 30_000 });
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0612345678');
  await captureLoadedFormState('vermist-paspoort-02-uw-gegevens');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Gegevens vermissing');
  await page.getByRole('radiogroup', { name: 'Voor wie wilt u een vermist paspoort of identiteitskaart melden? *' }).getByRole('radio', { name: 'voor mijzelf', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Soort reisdocument *' }).getByRole('radio', { name: 'Paspoort', exact: true }).check();
  await page.getByRole('textbox', { name: 'Documentnummer (als u dit weet)', exact: true }).fill('TEST-PASPOORT-2026');
  await page.getByRole('textbox', { name: 'Datum vermissing *', exact: true }).fill('1 augustus 2026');
  await page.getByRole('textbox', { name: 'Op welke datum of in welke periode is het reisdocument voor het laatst gezien of gebruikt? *', exact: true }).fill('1 augustus 2026');
  await page.getByRole('textbox', { name: 'Op welke plaats was het reisdocument toen het voor het laatst gezien of gebruikt is? *', exact: true }).fill('Nijmegen');
  await page.getByRole('radiogroup', { name: 'Hoe is het reisdocument vermist? *' }).getByRole('radio', { name: 'Verloren', exact: true }).check();
  await page.getByRole('textbox', { name: 'Omschrijf zo precies mogelijk hoe het reisdocument is vermist. *', exact: true }).fill('Het testreisdocument is tijdens een wandeling verloren.');
  await captureLoadedFormState('vermist-paspoort-03-gegevens-vermissing');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  await captureLoadedFormState('vermist-paspoort-04-controleer-en-bevestig');

  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'vermist-paspoort-99-bevestiging')}`);
});
