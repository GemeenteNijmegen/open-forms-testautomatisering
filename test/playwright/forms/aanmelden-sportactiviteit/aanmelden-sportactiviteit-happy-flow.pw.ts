import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/aanmelden-sportactiviteit/startpagina');

test.setTimeout(600_000);

test('submits an application for a sport activity', async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Aanmelden sportactiviteit', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-01-startpagina')}`);

  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();
  await expectFormStep(page, 'Aanmelden sportactiviteit');
  await page.getByRole('radio', { name: 'een volwassene (18 jaar of ouder)', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-02-aanmelden')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw gegevens');
  await page.getByRole('textbox', { name: 'Voornaam *', exact: true }).fill('Playwright');
  await page.getByRole('textbox', { name: 'Achternaam *', exact: true }).fill('Test');
  await fillOpenFormsDate(page, 'Geboortedatum', '01-01-1990');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0241234567');
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('playwright-test@example.invalid');
  await page.getByRole('textbox', { name: 'Voornaam en achternaam van de persoon met wie contact opgenomen kan worden bij noodgevallen. *', exact: true }).fill('Testcontact Persoon');
  await page.getByRole('textbox', { name: 'Telefoonnummer bij noodgevallen *', exact: true }).fill('0247654321');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-03-uw-gegevens')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Sportactiviteiten');

  const stadsdeel = page.getByRole('combobox');
  await stadsdeel.click();
  const dukenburg = page.getByRole('option', { name: 'Dukenburg', exact: true });
  await expect(dukenburg).toBeVisible();
  // Choices.js renders the native select hidden and moves the open menu during its animation.
  await dukenburg.click({ force: true });
  await page.getByRole('checkbox', { name: 'onbeperkt wijksporten: sport- en spelactiviteiten voor volwassenen (sporthal Meijhorst)', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-04-sportactiviteiten')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Toestemming');
  await page.getByRole('radiogroup', { name: /benaderd kan worden/i }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: /gegevens bewaard/i }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radiogroup', { name: /maken van foto’s/i }).getByRole('radio', { name: 'nee', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-05-toestemming')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-06-overzicht')}`);

  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /\bOF-[A-Z0-9]+\b/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-sportactiviteit-99-bevestiging')}`);
});
