import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/aanmelden-sportactiviteit/startpagina');
let submissionSequence = new Date().getMilliseconds();

function dynamicTestName(baseName: string): string {
  submissionSequence = (submissionSequence + 1) % 1_000;
  return `${baseName}Test${String(submissionSequence).padStart(3, '0')}`;
}

test.setTimeout(600_000);

for (const scenario of [
  { familyName: 'TestDukenburg', school: 'Dominicus College', district: 'Dukenburg', clubSport: 'ja' },
  { familyName: 'TestOudNieuwWest', school: 'Flex College', district: 'Nijmegen-Oud & Nieuw-West', clubSport: 'nee' },
  { familyName: 'TestMiddenZuid', school: 'Joris Mavo', district: 'Nijmegen-Midden & Zuid', clubSport: 'ja' },
  { familyName: 'TestCentrum', school: 'Montessori College', district: 'Nijmegen-Centrum', clubSport: 'nee' },
  { familyName: 'TestCanisius', school: 'Canisius College', district: 'Nijmegen-Oost', clubSport: 'nee' },
  { familyName: 'TestKandinsky', school: 'Kandinsky Malderburcht', district: 'Lindenholt', clubSport: 'ja' },
  { familyName: 'TestNoord', school: 'Stedelijk Gymnasium', district: 'Nijmegen-Noord', clubSport: 'nee' },
]) {
  test(`submits a child application for ${scenario.school} in ${scenario.district}`, async ({ page }, testInfo) => {
    const applicantName = dynamicTestName('Playwright');
    const familyName = dynamicTestName(scenario.familyName);
    const parentName = dynamicTestName('Ouder');
    const captureLoadedFormState = async (label: string): Promise<void> => {
      await expect(page.getByText('Laden...', { exact: true })).toBeHidden({ timeout: 30_000 });
      await page.waitForTimeout(3_000);
      console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
    };

    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: 'Aanmelden sportactiviteit', exact: true })).toBeVisible({ timeout: 30_000 });
    await declineCookies(page);
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-01-startpagina`);

    await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();
    await expectFormStep(page, 'Aanmelden sportactiviteit');
    await page.getByRole('radio', { name: 'een kind (17 jaar of jonger)', exact: true }).check();
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-02-aanmelden`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Gegevens kind');
    await page.getByRole('textbox', { name: 'Voornaam kind *', exact: true }).fill(applicantName);
    await page.getByRole('textbox', { name: 'Achternaam kind *', exact: true }).fill(familyName);
    await fillOpenFormsDate(page, 'Geboortedatum kind', '01-01-2010');
    await page.getByRole('radio', { name: 'voortgezet onderwijs', exact: true }).check();
    await expect(page.getByRole('combobox')).toBeVisible();
    await page.getByRole('combobox').click();
    // Choices.js moves its menu while opening, so use the visible option after opening it.
    await page.getByRole('option', { name: scenario.school, exact: true }).click({ force: true });
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-03-gegevens-kind`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Uw gegevens');
    await page.getByRole('textbox', { name: 'Voornaam *', exact: true }).fill(parentName);
    await page.getByRole('textbox', { name: 'Achternaam *', exact: true }).fill(familyName);
    await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0241234567');
    await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill(`playwright-test-${familyName.toLowerCase()}@example.invalid`);
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-04-uw-gegevens`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Sportactiviteiten');
    await page.getByRole('combobox').click();
    // Choices.js moves its menu while opening, so use the visible option after opening it.
    await page.getByRole('option', { name: scenario.district, exact: true }).click({ force: true });
    await page.getByRole('radio', { name: scenario.clubSport, exact: true }).check();
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-05-sportactiviteiten`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Toestemming');
    await page.getByRole('radiogroup', { name: /kind mag meedoen/i }).getByRole('radio', { name: 'ja', exact: true }).check();
    await page.getByRole('radiogroup', { name: /gegevens van uw kind bewaard/i }).getByRole('radio', { name: 'ja', exact: true }).check();
    await page.getByRole('radiogroup', { name: /maken van foto’s van uw kind/i }).getByRole('radio', { name: 'nee', exact: true }).check();
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-06-toestemming`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Controleer en bevestig');
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-07-overzicht`);

    await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
    await expect(page.getByRole('heading', { name: /\bOF-[A-Z0-9]+\b/ })).toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(5_000);
    await captureLoadedFormState(`aanmelden-sportactiviteit-kind-${scenario.familyName}-99-bevestiging`);
  });
}
