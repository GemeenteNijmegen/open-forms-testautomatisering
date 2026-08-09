import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/bijstandsuitkering-aanvragen');
const testPerson = digidSimulatorPersons.persoon999971815;

test.setTimeout(90_000);

test('blocks a minor from continuing past uw gegevens', { tag: '@digid-999971815' }, async ({ page }, testInfo) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Bijstandsuitkering aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expect(page.getByRole('heading', { name: 'Uw gegevens', exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
  await declineCookies(page);

  // BRP-prefill and disable-next logic complete asynchronously after DigiD returns.
  await page.waitForTimeout(10_000);

  await expect(page.getByText('U bent jonger dan 18 jaar.', { exact: true })).toBeVisible();
  await expect(page.getByText('U krijgt geen bijstandsuitkering als u jonger bent dan 18 jaar.', { exact: true })).toBeVisible();
  const nextButton = page.getByRole('button', { name: 'Volgende', exact: true });
  await expect(nextButton).toHaveAttribute('aria-disabled', 'true');
  await expect(nextButton).toBeDisabled();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-minderjarig-uw-gegevens-geblokkeerd')}`);
});
