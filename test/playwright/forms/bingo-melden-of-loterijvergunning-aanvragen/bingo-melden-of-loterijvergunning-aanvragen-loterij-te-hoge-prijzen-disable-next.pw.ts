import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillAddress } from '../../helpers/open-forms-address';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/bingomeldenofloterijvergunningaanvragen/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;
const testAddress = { postcode: '6511 PS', houseNumber: '30', street: 'Mariënburg', city: 'Nijmegen' };
const prizeLimitMessage = 'De totale waarde van de prijzen is hoger dan €4.500,-. U krijgt geen loterijvergunning.';

test.setTimeout(180_000);

test('blocks continuing with lottery prizes over the allowed total', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  const initialResponse = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(initialResponse?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Bingo melden of loterijvergunning aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
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
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-loterij-te-hoge-prijzen-01-algemeen')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();

  await expectFormStep(page, 'Bingo of loterij');
  await page.getByRole('radio', { name: 'loterij (of prijsvraag)', exact: true }).check();
  await page.getByLabel('Naar welk goed doel gaan de inkomsten van de bingo of de loterij?', { exact: true }).fill('Een lokaal goed doel.');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-loterij-te-hoge-prijzen-02-bingo-of-loterij')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();

  await expectFormStep(page, 'Loterij');
  await fillOpenFormsDate(page, 'Vanaf wanneer verkoopt u loten?', '01-09-2026');
  await fillOpenFormsDate(page, 'Tot wanneer verkoopt u loten?', '30-09-2026');
  await fillOpenFormsDate(page, 'Datum van de trekking van de loterij', '01-10-2026');
  await page.getByLabel('Tijd van de trekking', { exact: true }).fill('20:00');
  await page.getByLabel('Waar organiseert u de trekking?', { exact: true }).fill('Wijkcentrum Test');
  await page.getByLabel('Aantal loten dat u verkoopt', { exact: true }).fill('1000');
  await page.getByLabel('Prijs per lot', { exact: true }).fill('10');
  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  const lotteryLogicResponse = page.waitForResponse((candidate) => candidate.url().includes('/_check-logic') && candidate.request().method() === 'POST');
  await page.getByLabel('Totale waarde van de prijzen die u verloot', { exact: true }).fill('5000');
  await lotteryLogicResponse;
  await expect(page.getByRole('status')).toBeHidden({ timeout: 60_000 });

  const nextButton = page.getByRole('button', { name: 'Volgende', exact: true });
  await expect(page.getByText(prizeLimitMessage, { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(nextButton).toBeDisabled();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bingo-melden-of-loterijvergunning-aanvragen-loterij-te-hoge-prijzen-03-loterij-geblokkeerd')}`);
});
