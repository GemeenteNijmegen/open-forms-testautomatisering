import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { expectFormStep } from '../../helpers/form-navigation';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/aanmelden-voor-noodopvang/');

test.setTimeout(600_000);

test('submits the English aanmelden noodopvang happy flow', async ({ page }, testInfo) => {
  const capture = async (label: string): Promise<void> => {
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };
  const selectRadio = async (groupName: string, optionName: 'yes' | 'no'): Promise<void> => {
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
  await page.getByText('EN', { exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Registering for Emergency Shelter', exact: true })).toBeVisible({ timeout: 30_000 });
  await capture('aanmelden-noodopvang-en-01-startpagina');
  await page.getByRole('button', { name: 'Begin form', exact: true }).click();

  await expectFormStep(page, 'Your Data');
  await page.getByLabel('Name', { exact: true }).fill('Playwright test');
  await page.getByLabel('Email Address', { exact: true }).fill('playwright-noodopvang@example.com');
  await page.getByLabel('Telephone Number', { exact: true }).fill('0612345678');
  await page.getByLabel('Details of contact person who speaks Dutch or English', { exact: true }).fill('Playwright test contact');
  await capture('aanmelden-noodopvang-en-02-your-data');
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  await expectFormStep(page, 'Emergency shelter applicant data');
  await selectRadio('Do these persons currently live (temporarily) in the muncipality of Nijmegen?', 'yes');
  await selectRadio('Are any of these persons currently in education?', 'no');
  await selectRadio('Do one or more of these persons currently have paid work?', 'no');
  await selectRadio('Do these persons have pets?', 'no');
  await selectRadio('Are there any medical conditions that make these persons want to go to a special home?', 'no');
  await page.getByText('Add person', { exact: true }).click({ noWaitAfter: true });
  await expect(page.getByText('Person 1', { exact: true })).toBeVisible({ timeout: 30_000 });
  await page.getByLabel('First Name and surname', { exact: true }).fill('Playwright test person');
  await page.getByLabel('Age', { exact: true }).fill('30');
  await page.getByRole('radiogroup', { name: 'Do you currently have a sticker from the IND?' }).getByRole('radio', { name: 'yes', exact: true }).check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await capture('aanmelden-noodopvang-en-03-applicant-data');
  await page.getByRole('button', { name: 'Next', exact: true }).click();

  await expectFormStep(page, 'Check and confirm');
  await capture('aanmelden-noodopvang-en-04-summary');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Your submission was succesful with reference OF-[A-Z0-9]+/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'aanmelden-noodopvang-en-99-bevestiging')}`);
});
