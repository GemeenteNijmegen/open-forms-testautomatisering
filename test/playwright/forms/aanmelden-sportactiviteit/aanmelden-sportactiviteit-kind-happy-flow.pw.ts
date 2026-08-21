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

test('submits a child application for a sport activity', async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Laden...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Aanmelden sportactiviteit', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-01-startpagina');

  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();
  await expectFormStep(page, 'Aanmelden sportactiviteit');
  await page.getByRole('radio', { name: 'een kind (17 jaar of jonger)', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-02-aanmelden');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Gegevens kind');
  await page.getByRole('textbox', { name: 'Voornaam kind *', exact: true }).fill('Playwright');
  await page.getByRole('textbox', { name: 'Achternaam kind *', exact: true }).fill('Kind');
  await fillOpenFormsDate(page, 'Geboortedatum kind', '01-01-2024');
  await page.getByRole('radio', { name: 'mijn kind volgt (nog) geen onderwijs', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-03-gegevens-kind');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw gegevens');
  await page.getByRole('textbox', { name: 'Voornaam *', exact: true }).fill('Playwright');
  await page.getByRole('textbox', { name: 'Achternaam *', exact: true }).fill('Ouder');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0241234567');
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('playwright-test@example.invalid');
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-04-uw-gegevens');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Sportactiviteiten');
  const stadsdeel = page.getByRole('combobox');
  await stadsdeel.click();
  const dukenburg = page.getByRole('option', { name: 'Dukenburg', exact: true });
  await expect(dukenburg).toBeVisible();
  // Choices.js renders the native select hidden and moves the open menu during its animation.
  await dukenburg.click({ force: true });
  await page.getByRole('radio', { name: 'ja', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-05-sportactiviteiten');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Toestemming');
  await page.getByRole('radiogroup', { name: /kind mag meedoen/i }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radiogroup', { name: /gegevens van uw kind bewaard/i }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radiogroup', { name: /maken van foto’s van uw kind/i }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-06-toestemming');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-07-overzicht');

  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /\bOF-[A-Z0-9]+\b/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  await captureLoadedFormState('aanmelden-sportactiviteit-kind-99-bevestiging');
});
