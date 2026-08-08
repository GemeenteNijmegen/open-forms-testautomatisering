import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { testBankAccounts } from '../../test-data/test-bank-accounts';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/individuele-inkomenstoeslag-aanvragen/');
const testPerson = digidSimulatorPersons.persoon999971797;

test.setTimeout(600_000);

async function completeStandardFlow(page: Page, captureLoadedFormState: (label: string) => Promise<void>): Promise<void> {
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 12 maanden individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-02-eerder-toeslag-ontvangen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw inkomen');
  await page.getByRole('checkbox', { name: 'bijstandsuitkering', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Hoe lang heeft u een bijstandsuitkering? *' }).getByRole('radio', { name: 'langer dan 3 jaar', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-03-uw-inkomen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bank en bewindvoering');
  await page.getByRole('radiogroup', { name: 'Heeft u een bewindvoerder of budgetbeheerder? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('textbox', { name: 'IBAN rekening waar de inkomenstoeslag naar over gemaakt mag worden. *', exact: true }).fill(testBankAccounts.gbTestIban.accountNumber);
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-04-bank-en-bewindvoering');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Wonen');
  await page.getByRole('radiogroup', { name: 'U woont *' }).getByRole('radio', { name: 'in een huurwoning', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-05-wonen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opleiding');
  await page.getByRole('radiogroup', { name: 'Volgt u een MBO/HBO/WO of een andere beroepsopleiding? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 36 maanden een MBO/HBO/WO of een andere beroepsopleiding gevolgd? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-06-opleiding');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Besluit');
  await page.getByRole('radiogroup', { name: 'Hoe wilt u de brief met het besluit over de individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'per post', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-07-besluit');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opmerkingen');
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-08-opmerkingen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Controleer en bevestig', exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Laden...', { exact: true })).toBeHidden({ timeout: 30_000 });
  await page.getByRole('checkbox', { name: /kennis genomen van het privacybeleid/ }).check();
  await page.locator('input[name="statementOfTruthAccepted"]').check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-09-overzicht');
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 60_000 });
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-99-bevestiging');
}

test('continues individuele inkomenstoeslag with alternative uw gegevens choices', async ({ page }, testInfo) => {
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
  await page.getByRole('radiogroup', { name: 'Hoe wilt u dat de gemeente contact met u opneemt over uw aanvraag? *' }).getByRole('radio', { name: 'via telefoon', exact: true }).check();
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0612345678');
  await page.getByRole('radiogroup', { name: 'U bent *' }).getByRole('radio', { name: 'alleenstaand', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 36 maanden met 1 of meer partner(s) samengewoond? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Bent u jonger dan 21 jaar? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u recht op AOW door de leeftijd? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-01-uw-gegevens-via-telefoon');

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Eerder toeslag ontvangen');
  await completeStandardFlow(page, captureLoadedFormState);
});

test('submits individuele inkomenstoeslag for an AOW-age applicant', async ({ page }, testInfo) => {
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
  await loginWithDigiDSimulator(page, digidSimulatorPersons.persoon999971773.bsn);
  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);

  await page.getByRole('radiogroup', { name: 'Woont u korter dan 3 jaar in Nederland? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Hoe wilt u dat de gemeente contact met u opneemt over uw aanvraag? *' }).getByRole('radio', { name: 'via e-mail', exact: true }).check();
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0612345678');
  await page.getByRole('radiogroup', { name: 'U bent *' }).getByRole('radio', { name: 'alleenstaand', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u in de afgelopen 36 maanden met 1 of meer partner(s) samengewoond? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Bent u jonger dan 21 jaar? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u recht op AOW door de leeftijd? *' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await expect(page.getByText(/U voldoet niet aan de voorwaarden.*geen recht op individuele inkomenstoeslag/i)).toBeVisible({ timeout: 20_000 });
  await captureLoadedFormState('individuele-inkomenstoeslag-variant-03-uw-gegevens-aow');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Eerder toeslag ontvangen');
  await completeStandardFlow(page, captureLoadedFormState);
});

test('submits individuele inkomenstoeslag with a partner', async ({ page }, testInfo) => {
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
  await page.getByRole('radiogroup', { name: 'U bent *' }).getByRole('radio', { name: 'samenwonend/getrouwd', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Mijn partner geeft mij toestemming dat ik voor ons samen deze aanvraag invul. *', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Woont uw partner korter dan 3 jaar in Nederland? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('textbox', { name: 'Voor- en achternaam van uw partner *', exact: true }).fill('Test Partner');
  await page.getByRole('textbox', { name: 'BSN partner *', exact: true }).fill(digidSimulatorPersons.persoon999971773.bsn);
  await page.getByRole('radiogroup', { name: 'Bent u of is uw partner jonger dan 21 jaar? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u of uw partner recht op AOW door de leeftijd? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-01-uw-gegevens');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Eerder toeslag ontvangen');
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-02-eerder-toeslag-ontvangen');
  await page.getByRole('radiogroup', { name: 'Heeft u of uw partner in de afgelopen 12 maanden individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw inkomen');
  await page.getByRole('checkbox', { name: 'bijstandsuitkering', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Hoe lang heeft u een bijstandsuitkering? *' }).getByRole('radio', { name: 'langer dan 3 jaar', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-03-uw-inkomen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Inkomen Partner');
  await page.getByRole('checkbox', { name: 'bijstandsuitkering', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-04-inkomen-partner');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bank en bewindvoering');
  await page.getByRole('radiogroup', { name: 'Heeft u of uw partner een bewindvoerder of budgetbeheerder? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('textbox', { name: 'IBAN rekening waar de inkomenstoeslag naar over gemaakt mag worden. *', exact: true }).fill(testBankAccounts.gbTestIban.accountNumber);
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-05-bank-en-bewindvoering');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Wonen');
  await page.getByRole('radiogroup', { name: 'U woont *' }).getByRole('radio', { name: 'in een huurwoning', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Betaalt u een eigen bijdrage voor kinderopvang? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-06-wonen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opleiding');
  await page.getByRole('radiogroup', { name: 'Volgt u en/of uw partner een MBO/HBO/WO of een andere beroepsopleiding? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u en/of uw partner in de afgelopen 36 maanden een MBO/HBO/WO of een andere beroepsopleiding gevolgd? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-07-opleiding');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Besluit');
  await page.getByRole('radiogroup', { name: 'Hoe wilt u de brief met het besluit over de individuele inkomenstoeslag ontvangen? *' }).getByRole('radio', { name: 'per post', exact: true }).check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-08-besluit');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opmerkingen');
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-09-opmerkingen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Controleer en bevestig', exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('checkbox', { name: /kennis genomen van het privacybeleid/ }).check();
  await page.locator('input[name="statementOfTruthAccepted"]').check();
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-10-overzicht');
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 60_000 });
  await captureLoadedFormState('individuele-inkomenstoeslag-partner-99-bevestiging');
});
