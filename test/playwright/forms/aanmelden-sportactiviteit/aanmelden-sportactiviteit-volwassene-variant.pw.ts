import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/aanmelden-sportactiviteit/startpagina');
const submissionSuffix = String(new Date().getMilliseconds()).padStart(3, '0');

test.setTimeout(600_000);

test('submits an adult Dukenburg application for music exercise', async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Laden...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Aanmelden sportactiviteit', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-01-startpagina');

  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();
  await expectFormStep(page, 'Aanmelden sportactiviteit');
  await page.getByRole('radio', { name: 'een volwassene (18 jaar of ouder)', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-02-aanmelden');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw gegevens');
  await page.getByRole('textbox', { name: 'Voornaam *', exact: true }).fill(`PlaywrightTest${submissionSuffix}`);
  await page.getByRole('textbox', { name: 'Achternaam *', exact: true }).fill(`MuziekbewegenTest${submissionSuffix}`);
  await fillOpenFormsDate(page, 'Geboortedatum', '01-01-1985');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0241234567');
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill(`playwright-test-muziek-${submissionSuffix}@example.invalid`);
  await page.getByRole('textbox', { name: 'Voornaam en achternaam van de persoon met wie contact opgenomen kan worden bij noodgevallen. *', exact: true }).fill(`Testcontact Muziek${submissionSuffix}`);
  await page.getByRole('textbox', { name: 'Telefoonnummer bij noodgevallen *', exact: true }).fill('0247654321');
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-03-uw-gegevens');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Sportactiviteiten');
  await page.getByRole('combobox').click();
  // Choices.js moves its menu while opening, so use the visible option after opening it.
  await page.getByRole('option', { name: 'Dukenburg', exact: true }).click({ force: true });
  await page.getByRole('checkbox', { name: 'bewegen op muziek voor dames/vrouwen (wijkcentrum Dukenburg)', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-04-sportactiviteiten');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Toestemming');
  await page.getByRole('radiogroup', { name: /benaderd kan worden/i }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radiogroup', { name: /gegevens bewaard/i }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radiogroup', { name: /maken van foto’s/i }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-05-toestemming');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-06-overzicht');

  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /\bOF-[A-Z0-9]+\b/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  await captureLoadedFormState('aanmelden-sportactiviteit-volwassene-variant-99-bevestiging');
});
