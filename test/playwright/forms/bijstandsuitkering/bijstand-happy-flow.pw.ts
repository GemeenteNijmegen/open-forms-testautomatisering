import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { loginWithDigiDSimulator } from '../../authentication/digid-simulator';
import { declineCookies } from '../../helpers/cookies';
import { uploadFixture } from '../../helpers/file-upload';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { digidSimulatorPersons } from '../../test-data/digid-simulator-persons';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/bijstandsuitkering-aanvragen');
const testPerson = digidSimulatorPersons.semVanTHul;

test.setTimeout(240_000);

test('submits the bijstandsuitkering happy flow', { tag: '@digid-999971785' }, async ({ page }, testInfo) => {
  if (process.env.PW_VIDEO !== '1') {
    await page.route('**/*', (route) => {
      const type = route.request().resourceType();
      return ['font', 'image', 'media'].includes(type) ? route.abort() : route.continue();
    });
  }
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await page.waitForFunction(() => document.readyState === 'complete');

  await expect(page.getByRole('heading', { name: 'Bijstandsuitkering aanvragen', exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 20_000 });
  await declineCookies(page);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-01-startpagina')}`);

  await loginWithDigiDSimulator(page, testPerson.bsn, {
    onStage: async (stage) => {
      const labels = {
        'provider-choice': 'bijstandsuitkering-02-digid-keuze',
        'simulator': 'bijstandsuitkering-03-simulator',
        'simulator-login': 'bijstandsuitkering-04-digid-simulator',
      } as const;
      console.log(`Form artifacts: ${await captureFormState(page, testInfo, labels[stage])}`);
    },
  });
  await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 20_000 });
  await expect(page.getByRole('heading', { name: 'Uw gegevens', exact: true })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-05-aangemeld')}`);

  await page.getByRole('radio', { name: 'Ja', exact: true }).check();
  await uploadFixture(page, page.getByRole('link', { name: "selecteer een 'Plan van aanpak Werkbedrijf'-bestand" }), 'pdf13Kb');
  await page.getByRole('checkbox', { name: "Ik heb het 'plan van aanpak van het Werkbedrijf' toegevoegd als bijlage" }).check();
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  await page.getByRole('textbox', { name: 'Telefoonnummer *', exact: true }).fill('0612345678');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-06-plan-van-aanpak')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Partner');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-07-partner')}`);
  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-08-partner-geen-partner')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Identiteitsbewijs');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-09-identiteitsbewijs')}`);
  await page.getByRole('radio', { name: 'Nederlands paspoort', exact: true }).check();
  await page.getByLabel('Vul het documentnummer in van het legitimatiebewijs').fill('TEST12345');
  await fillOpenFormsDate(page, 'Tot wanneer is uw legitimatiebewijs geldig?', '31-12-2030');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-10-identiteitsbewijs-ingevuld')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Kinderen');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-11-kinderen')}`);
  await page.getByRole('radio', { name: 'Nee', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-12-kinderen-geen-thuiswonende-kinderen')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uw aanvraag');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-13-uw-aanvraag')}`);

  await fillOpenFormsDate(page, 'Datum van inschrijving UWV (werk.nl)', '01-01-2026');
  await fillOpenFormsDate(page, 'Vanaf wanneer wilt u een uitkering ontvangen?', '01-01-2026');
  const toelichtingAanvraagdatum = page.getByLabel(/Waarom wilt u vanaf 1 januari 2026 een uitkering ontvangen\?/);
  await expect(toelichtingAanvraagdatum).toBeVisible({ timeout: 30_000 });
  await toelichtingAanvraagdatum.fill('Ik vraag vanaf deze datum een uitkering aan wegens het einde van mijn studie.');
  await toelichtingAanvraagdatum.press('Tab');
  await page.getByRole('radio', { name: 'Einde studie of studiefinanciering', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Woonsituatie');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-14-woonsituatie')}`);

  await page.getByRole('radio', { name: 'Anders', exact: true }).check();
  const toelichtingWoonsituatie = page.getByRole('textbox', { name: 'Namelijk *', exact: true });
  await expect(toelichtingWoonsituatie).toBeVisible();
  await toelichtingWoonsituatie.fill('Tijdelijke testwoonsituatie');
  await toelichtingWoonsituatie.press('Tab');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Inkomen');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-15-inkomen')}`);
  await page.getByRole('checkbox', { name: 'Geen inkomen', exact: true }).check();
  await page.getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radio', { name: 'Nee', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-16-inkomen-ingevuld')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bezittingen en schulden');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-17-bezittingen-en-schulden')}`);
  await page.getByRole('checkbox', { name: 'Ik heb geen bankrekening of mag geen bankrekening hebben.', exact: true }).check();
  await page.getByRole('checkbox', { name: 'Geen bezittingen', exact: true }).check();
  await page.getByRole('radio', { name: 'nee', exact: true }).check();
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-18-bezittingen-ingevuld')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Uitbetaling en bewindvoering');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-19-uitbetaling-en-bewindvoering')}`);
  await page.getByRole('radio', { name: 'Nee', exact: true }).check();
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Opmerkingen');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-20-opmerkingen')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Bewijsstukken');
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-21-bewijsstukken')}`);
  await page.getByRole('button', { name: 'Volgende', exact: true }).click();
  await expectFormStep(page, 'Controleer en bevestig');
  await expect(page.getByRole('button', { name: 'Verzenden', exact: true })).toBeEnabled({ timeout: 30_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-22-controleer-en-bevestig')}`);
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
  await expect(page.getByText(/^OF-[A-Z0-9]+$/, { exact: true })).toBeVisible({ timeout: 120_000 });
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'bijstandsuitkering-23-bevestiging')}`);
});
