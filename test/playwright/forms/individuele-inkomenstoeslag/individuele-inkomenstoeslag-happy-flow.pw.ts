import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { testBankAccounts } from '../../test-data/test-bank-accounts';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/individuele-inkomenstoeslag-aanvragen/');
const testPerson = digidSimulatorPersons.persoon999971797;

test.setTimeout(600_000);

test('submits the individuele inkomenstoeslag happy flow', { tag: '@digid-999971797' }, async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await page.waitForFunction(() => document.readyState === 'complete');
  await expect(page.getByRole('heading', { name: 'Individuele inkomenstoeslag aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('individuele-inkomenstoeslag-01-startpagina');

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
  await captureLoadedFormState('individuele-inkomenstoeslag-02-uw-gegevens');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Eerder toeslag ontvangen');
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 12 maanden individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-03-eerder-toeslag-ontvangen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw inkomen');
  await page.getByRole('checkbox', { name: 'bijstandsuitkering', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Hoe lang heeft u een bijstandsuitkering? *' }).getByRole('radio', { name: 'langer dan 3 jaar', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-04-uw-inkomen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bank en bewindvoering');
  await page.getByRole('radiogroup', { name: 'Heeft u een bewindvoerder of budgetbeheerder? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('textbox', { name: 'IBAN rekening waar de inkomenstoeslag naar over gemaakt mag worden. *', exact: true }).fill(testBankAccounts.gbTestIban.accountNumber);
  await captureLoadedFormState('individuele-inkomenstoeslag-05-bank-en-bewindvoering');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Wonen');
  await page.getByRole('radiogroup', { name: 'U woont *' }).getByRole('radio', { name: 'in een huurwoning', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-06-wonen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opleiding');
  await page.getByRole('radiogroup', { name: 'Volgt u een MBO/HBO/WO of een andere beroepsopleiding? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 36 maanden een MBO/HBO/WO of een andere beroepsopleiding gevolgd? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-07-opleiding');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Besluit');
  await page.getByRole('radiogroup', { name: 'Hoe wilt u de brief met het besluit over de individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'per post', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-08-besluit');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opmerkingen');
  await captureLoadedFormState('individuele-inkomenstoeslag-09-opmerkingen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Controleer en bevestig', exact: true })).toBeVisible({ timeout: 20_000 });
  const privacyConsent = page.getByRole('checkbox', { name: /kennis genomen van het privacybeleid/ });
  await expect(privacyConsent).toBeEnabled({ timeout: 30_000 });
  await privacyConsent.check();
  // Open Forms does not expose the declaration label as the checkbox's accessible name.
  // Its stable form-submission name is the smallest available integration contract.
  await page.locator('input[name="statementOfTruthAccepted"]').check();
  await expect(page.getByRole('button', { name: 'Verzenden', exact: true })).toBeVisible({ timeout: 30_000 });
  await captureLoadedFormState('individuele-inkomenstoeslag-10-overzicht');

  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 20_000 });
  await captureLoadedFormState('individuele-inkomenstoeslag-99-bevestiging');
});
