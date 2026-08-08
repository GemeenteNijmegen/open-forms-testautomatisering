import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { uploadFixture } from '../../helpers/file-upload';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { testBankAccounts } from '../../test-data/test-bank-accounts';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/bbz-aanvragen/');
const testPerson = digidSimulatorPersons.semVanTHul;

test.setTimeout(600_000);

test('explores the bbz-aanvragen happy flow', async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await page.waitForFunction(() => document.readyState === 'complete');
  await expect(page.getByRole('heading', { name: 'Bijstand voor zelfstandigen aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('bbz-aanvragen-01-startpagina');

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expect(page.getByRole('heading', { name: 'Uw gegevens', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);

  await page.getByRole('radio', { name: 'via e-mail', exact: true }).check();
  const emailAddress = page.getByRole('textbox', { name: 'E-mailadres *', exact: true });
  await expect(emailAddress).toBeVisible();
  await emailAddress.fill('test@example.com');
  await emailAddress.press('Tab');
  await page.getByRole('textbox', { name: 'Telefoonnummer', exact: true }).fill('0612345678');
  await captureLoadedFormState('bbz-aanvragen-02-uw-gegevens');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Partner');

  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-03-partner');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Identiteitsbewijs');

  await page.getByRole('radio', { name: 'Nederlands paspoort', exact: true }).check();
  await page.getByLabel('Vul het documentnummer in van het legitimatiebewijs').fill('TEST12345');
  await fillOpenFormsDate(page, 'Tot wanneer is uw legitimatiebewijs geldig?', '31-12-2030');
  await captureLoadedFormState('bbz-aanvragen-04-identiteitsbewijs');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Kinderen');

  await page.getByRole('radio', { name: 'Nee', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-05-kinderen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw aanvraag');

  await fillOpenFormsDate(page, 'Vanaf wanneer wilt u een uitkering ontvangen?', '08-08-2026');
  await page.getByRole('radio', { name: 'Alleen levensonderhoud', exact: true }).check();
  await page.getByRole('radio', { name: 'Ik ben een startende ondernemer', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-06-uw-aanvraag');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Woonsituatie');

  await page.getByRole('radio', { name: 'Bij mijn ouders', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-07-woonsituatie');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw ondernemingen');

  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-08-uw-ondernemingen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Inkomen');

  await page.getByRole('checkbox', { name: 'Geen inkomen', exact: true }).check();
  await page.getByRole('radio', { name: 'ja', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-09-inkomen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bezittingen en schulden');

  await page.getByRole('button', { name: /Voeg een rekeningnummer toe/ }).click();
  await page.getByRole('radio', { name: 'Nederlandse privérekening', exact: true }).check();
  await page.getByLabel('Bankrekeningnummer (IBAN)').fill(testBankAccounts.nlTestIban.accountNumber);
  await page.getByLabel('Hoeveel geld staat er nu op deze rekening?').fill('100');
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Uzelf', exact: true }).click();
  await uploadFixture(page, page.getByRole('link', { name: /selecteer 'Upload een afschrift/ }), 'pdf13Kb');
  await page.getByRole('button', { name: 'Opslaan', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Opslaan', exact: true })).toBeHidden({ timeout: 30_000 });
  await page.getByRole('group', { name: 'Bezittingen *' }).getByRole('checkbox', { name: 'Geen bezittingen', exact: true }).check();
  await page.getByRole('group', { name: 'Welke bezittingen heeft uw onderneming(en)? *' }).getByRole('checkbox', { name: 'Geen bezittingen', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u schulden (bijvoorbeeld leningen of achterstanden)? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft uw onderneming(en) schulden of achterstanden? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-10-bezittingen-en-schulden');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uitbetaling');
  await page.getByRole('radio', { name: testBankAccounts.nlTestIban.accountNumber, exact: true }).check();
  await captureLoadedFormState('bbz-aanvragen-11-uitbetaling');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opmerkingen');
  await page.getByRole('textbox', { name: 'Opmerkingen over uw aanvraag', exact: true }).fill('Automatische testaanvraag.');
  await captureLoadedFormState('bbz-aanvragen-12-opmerkingen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  await expect(page.getByText('Laden...', { exact: true })).toBeHidden({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Verzenden', exact: true })).toBeVisible({ timeout: 30_000 });
  await captureLoadedFormState('bbz-aanvragen-13-controleer-en-bevestig');
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();

  await expect(page.getByText(/^OF-[A-Z0-9]+$/, { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bbz-aanvragen-99-bevestiging')}`);
});
