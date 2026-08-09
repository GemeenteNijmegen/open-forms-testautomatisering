import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/bezwaar-maken/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;

test.setTimeout(90_000);

test('blocks bezwaar maken for belastingen or parkeerboete', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: 'Bezwaar maken', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expect(page.getByRole('heading', { name: 'Algemeen', exact: true })).toBeVisible({ timeout: 30_000 });

  await page.getByRole('radio', { name: 'ja', exact: true }).check();
  await page.waitForTimeout(5_000);
  await expect(page.getByText('U kunt met dit formulier geen bezwaar maken tegen belastingen of een parkeerboete. U kunt dit doen bij het belastingen portaal. Uw bezwaar wordt dan sneller afgehandeld.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Algemeen', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bezwaar-maken-belastingen-geblokkeerd')}`);
});
