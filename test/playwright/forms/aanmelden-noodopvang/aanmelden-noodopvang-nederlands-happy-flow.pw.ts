import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/aanmelden-voor-noodopvang/');

test.setTimeout(600_000);

test('submits the Dutch aanmelden noodopvang happy flow', async ({ page }, testInfo) => {
  const capture = async (label: string): Promise<void> => {
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };
  const selectRadio = async (groupName: string, optionName: 'ja' | 'nee'): Promise<void> => {
    const group = page.getByRole('radiogroup', { name: groupName });
    const logicResponse = page.waitForResponse((response) => response.url().includes('/_check-logic') && response.request().method() === 'POST');
    const option = group.getByRole('radio', { name: optionName, exact: true });

    await option.check();
    await logicResponse;
    await expect(option).toBeChecked();
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  expect(response?.ok()).toBe(true);
  await declineCookies(page);
  await page.getByText('NL', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Aanmelden voor noodopvang', exact: true })).toBeVisible({ timeout: 30_000 });
  await capture('aanmelden-noodopvang-nl-01-startpagina');
  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();

  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);
  await page.getByLabel('Naam', { exact: true }).fill('Playwright test');
  await page.getByLabel('E-mailadres', { exact: true }).fill('playwright-noodopvang@example.com');
  await page.getByLabel('Telefoonnummer', { exact: true }).fill('0612345678');
  await page.getByLabel('Gegevens contactpersoon die Nederlands of Engels spreekt', { exact: true }).fill('Playwright test contactpersoon');
  await capture('aanmelden-noodopvang-nl-02-uw-gegevens');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();

  await expectFormStep(page, 'Gegevens personen noodopvang');
  await selectRadio('Wonen deze personen (tijdelijk) op dit moment in de gemeente Nijmegen?', 'ja');
  await selectRadio('Volgt een of meer van deze personen op dit moment onderwijs?', 'nee');
  await selectRadio('Heeft een of meer van deze personen op dit moment betaald werk?', 'nee');
  await selectRadio('Hebben deze personen huisdieren?', 'nee');
  await selectRadio('Zijn er medische bijzonderheden waardoor deze personen naar een speciale woning willen?', 'nee');
  await page.getByText('Voeg persoon toe', { exact: true }).click({ noWaitAfter: true });
  await expect(page.getByText('Persoon 1', { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByLabel('Voornaam en achternaam', { exact: true }).fill('Playwright testpersoon');
  await page.getByLabel('Leeftijd', { exact: true }).fill('30');
  await page.getByRole('radiogroup', { name: 'Heeft u op dit moment een sticker van het IND?' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('button', { name: 'Opslaan', exact: true }).click();
  await capture('aanmelden-noodopvang-nl-03-personen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();

  await expectFormStep(page, 'Controleer en bevestig');
  await capture('aanmelden-noodopvang-nl-04-overzicht');
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Uw gegevens zijn verstuurd met kenmerk OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-noodopvang-nl-99-bevestiging')}`);
});
