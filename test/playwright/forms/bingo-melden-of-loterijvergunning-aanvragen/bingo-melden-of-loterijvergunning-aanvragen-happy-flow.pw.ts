import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { uploadFixture } from '../../helpers/file-upload';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillAddress } from '../../helpers/open-forms-address';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { saveRepeatingGroupRow } from '../../helpers/repeating-group';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/bingomeldenofloterijvergunningaanvragen/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;
const testAddress = { postcode: '6511 PS', houseNumber: '30', street: 'Mariënburg', city: 'Nijmegen' };

test.setTimeout(600_000);

test('submits the bingo melden happy flow', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  const initialResponse = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(initialResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Bingo melden of loterijvergunning aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-01-startpagina')}`);

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await declineCookies(page);
  await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
  await expectFormStep(page, 'Algemeen');

  await page.getByRole('radio', { name: 'mijzelf', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Bent u zelf de contactpersoon van deze aanvraag?' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByLabel('E-mailadres', { exact: true }).fill('test@example.com');
  await page.getByRole('radiogroup', { name: 'De gemeente mag dit e-mailadres gebruiken om te reageren op mijn aanvraag.' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByLabel('Telefoonnummer', { exact: true }).fill('0612345678');
  await fillOpenFormsDate(page, 'Wanneer is uw organisatie (vereniging/stichting) opgericht?', '01-01-2020');
  await page.getByLabel('Naam voorzitter', { exact: true }).fill('Test voorzitter');
  await fillAddress(page, 'Adres voorzitter', testAddress);
  await page.getByLabel('Naam secretaris', { exact: true }).fill('Test secretaris');
  await fillAddress(page, 'Adres secretaris', testAddress);
  await page.getByLabel('Naam penningmeester', { exact: true }).fill('Test penningmeester');
  await fillAddress(page, 'Adres penningmeester', testAddress);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-02-algemeen')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bingo of loterij');
  const logicResponse = page.waitForResponse((candidate) => candidate.url().includes('/_check-logic') && candidate.request().method() === 'POST');
  await page.getByRole('radio', { name: 'bingo (of kienen of rad van avontuur)', exact: true }).check();
  await logicResponse;
  await expect(page.getByRole('status')).toBeHidden({ timeout: 60_000 });
  await page.getByLabel('Naar welk goed doel gaan de inkomsten van de bingo of de loterij?', { exact: true }).fill('Een lokaal goed doel.');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-03-bingo-of-loterij')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bingo');
  await page.getByRole('checkbox', { name: 'voorzitter', exact: true }).check();
  await page.getByLabel('Waar wordt de bingo georganiseerd?', { exact: true }).fill('Wijkcentrum Test');
  await fillOpenFormsDate(page, 'Datum bingo', '01-09-2026');
  await page.getByLabel('Starttijd bingo', { exact: true }).fill('19:00');
  await page.getByLabel('Eindtijd bingo', { exact: true }).fill('22:00');
  const bingoLogicResponse = page.waitForResponse((candidate) => candidate.url().includes('/_check-logic') && candidate.request().method() === 'POST');
  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  await bingoLogicResponse;
  await expect(page.getByRole('status')).toBeHidden({ timeout: 60_000 });
  // The editgrid button's accessible name includes its rendered Font Awesome plus icon, so exact matching must include `+`.
  const addPrizeRound = page.getByRole('button', { name: '+ Nog één toevoegen', exact: true });
  // Editgrid rows are rendered dynamically. Scope the textbox to its visible row group so future rows cannot make the locator ambiguous.
  const prizeValue = page.getByRole('group', { name: 'Ronde 1', exact: true }).getByRole('textbox', { name: "Waarde prijzen in euro's *", exact: true });
  await page.getByLabel('Wat is het totaalbedrag aan prijzen?', { exact: true }).fill('150');
  await expect(addPrizeRound).toBeEnabled();
  await expect(addPrizeRound).toBeInViewport();
  // The form applies input updates asynchronously; let the completed currency update settle before opening the editgrid row.
  await page.waitForTimeout(3_000);
  await addPrizeRound.click();
  await expect(prizeValue).toBeVisible({ timeout: 30_000 });
  await prizeValue.fill('150');
  await saveRepeatingGroupRow(page, {
    description: 'bingo-prijsronde',
    saveButton: page.getByRole('button', { name: 'Opslaan', exact: true }),
    successIndicator: page.getByText(/150,00/),
  });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-04-bingo')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bijlage(n)');
  await uploadFixture(page, page.getByRole('link', { name: "selecteer 'Toevoegen'-bestanden", exact: true }), 'pdf13Kb');
  // Open Forms does not expose an accessible name for this required checkbox; this step has exactly one native checkbox.
  const statutesCheckbox = page.locator('input[type="checkbox"]');
  await expect(statutesCheckbox).toHaveCount(1);
  await statutesCheckbox.check({ noWaitAfter: true, timeout: 5_000 });
  await expect(statutesCheckbox).toBeChecked();
  // Let Open Forms apply the checkbox value before continuing to the overview.
  await page.waitForTimeout(3_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-05-bijlagen')}`);

  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-06-controleer-en-bevestig')}`);
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Uw gegevens zijn verstuurd met kenmerk OF-[A-Z0-9]+$/ })).toBeVisible({ timeout: 120_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-99-bevestiging')}`);
});
