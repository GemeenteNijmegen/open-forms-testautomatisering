import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/individuele-inkomenstoeslag-aanvragen/');
const testPerson = digidSimulatorPersons.persoon999971797;

test.setTimeout(180_000);

test('stops individuele inkomenstoeslag when previously received', { tag: '@digid-999971797' }, async ({ page }, testInfo) => {
  test.fail(true, 'ACCP continues to Uw inkomen after the applicant answers that they received IIT in the past 12 months.');

  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Individuele inkomenstoeslag aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);

  await page.getByRole('radiogroup', { name: 'Woont u korter dan 3 jaar in Nederland? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Hoe wilt u dat de gemeente contact met u opneemt over uw aanvraag? *' }).getByRole('radio', { name: 'via e-mail', exact: true }).check();
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0612345678');
  await page.getByRole('radiogroup', { name: 'U bent *' }).getByRole('radio', { name: 'alleenstaand', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 36 maanden met 1 of meer partner(s) samengewoond? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Bent u jonger dan 21 jaar? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u recht op AOW door de leeftijd? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-eerder-ontvangen-01-uw-gegevens');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Eerder toeslag ontvangen');

  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 12 maanden individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-eerder-ontvangen-02-ja-geselecteerd');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await captureLoadedFormState('individuele-inkomenstoeslag-eerder-ontvangen-03-na-volgende');
  await expect(page.getByRole('heading', { name: 'Eerder toeslag ontvangen', exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(/afgelopen 12 maanden.*individuele inkomenstoeslag/i);
});
