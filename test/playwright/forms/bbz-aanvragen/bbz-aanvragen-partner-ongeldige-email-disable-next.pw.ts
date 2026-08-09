import { expect, test } from '@playwright/test';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

const url = openFormsUrl('/bbz-aanvragen/');
const testPerson = digidSimulatorPersons.evaVanDeKamp;

test.setTimeout(120_000);

test('shows partner data and blocks continuation when partner email addresses differ', { tag: '@digid-999971803' }, async ({ page }, testInfo) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Bijstand voor zelfstandigen aanvragen', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expect(page.getByRole('heading', { name: 'Uw gegevens', exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
  await declineCookies(page);

  await page.getByRole('radio', { name: 'via e-mail', exact: true }).check();
  const emailAddress = page.getByRole('textbox', { name: 'E-mailadres *', exact: true });
  await emailAddress.fill('test@example.com');
  await emailAddress.press('Tab');
  await page.getByRole('textbox', { name: 'Telefoonnummer', exact: true }).fill('0612345678');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Partner');

  await expect(page.getByText('Peter', { exact: true })).toBeVisible();
  await expect(page.getByText('Hendriks', { exact: true })).toBeVisible();
  await expect(page.getByText('999971797', { exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bbz-aanvragen-partner-gegevens')}`);

  await page.getByRole('radio', { name: 'ja', exact: true }).check();
  const partnerEmailAddress = page.getByRole('textbox', { name: 'E-mailadres partner P. Hendriks *', exact: true });
  const repeatedPartnerEmailAddress = page.getByRole('textbox', { name: 'Herhaal e-mailadres partner *', exact: true });
  await expect(partnerEmailAddress).toBeVisible({ timeout: 30_000 });
  await partnerEmailAddress.fill('partner@example.com');
  await partnerEmailAddress.press('Tab');
  await repeatedPartnerEmailAddress.fill('ander@example.com');
  await repeatedPartnerEmailAddress.press('Tab');

  const nextButton = page.getByRole('button', { name: 'Volgende', exact: true });
  await expect(page.getByText('Zorg ervoor dat het e-mailadres juist is. Zonder ondertekening van uw partner wordt de aanvraag niet verstuurd.', { exact: true })).toBeVisible();
  await expect(nextButton).toHaveAttribute('aria-disabled', 'true');
  await expect(nextButton).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'Partner', exact: true })).toBeVisible();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bbz-aanvragen-partner-ongeldige-email-geblokkeerd')}`);
});
