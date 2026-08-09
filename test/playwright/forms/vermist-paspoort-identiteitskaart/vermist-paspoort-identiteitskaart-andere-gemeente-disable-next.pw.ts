import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/vermistpaspoortofidentiteitskaartmelden/');
const testPerson = digidSimulatorPersons.adamArendsen;
const municipalityMessage = 'U woont niet in de gemeente Nijmegen. U kunt uw paspoort of identiteitskaart niet als vermist melden bij de gemeente Nijmegen. Dit kan alleen als u in de gemeente Nijmegen woont.';

test.setTimeout(90_000);

test('blocks continuing when BRP municipality is not Nijmegen', { tag: '@digid-999998791' }, async ({ page }, testInfo) => {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: /Vermist paspoort of identiteitskaart melden/i })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);

  await loginWithDigiDSimulator(page, testPerson.bsn);
  await expectFormStep(page, 'Uw gegevens');
  await declineCookies(page);
  // BRP-prefill and the resulting disable-next logic complete after DigiD returns.
  await page.waitForTimeout(10_000);
  await expect(page.getByText(municipalityMessage, { exact: true })).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Volgende', exact: true })).toBeDisabled();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'vermist-paspoort-andere-gemeente-geblokkeerd')}`);
});
