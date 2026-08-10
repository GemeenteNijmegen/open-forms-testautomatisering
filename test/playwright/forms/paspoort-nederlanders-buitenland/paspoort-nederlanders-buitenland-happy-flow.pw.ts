import { expect, test } from '@playwright/test';
import { declineCookies } from '../../helpers/cookies';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { uploadFixture } from '../../helpers/file-upload';
import { expectFormStep } from '../../helpers/form-navigation';
import { fillOpenFormsDate } from '../../helpers/open-forms-date';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/paspoort-nederlanders-buitenland/');

test.setTimeout(600_000);

test('submits the paspoort voor Nederlanders in het buitenland happy flow', async ({ page }, testInfo) => {
  const captureLoadedFormState = async (label: string): Promise<void> => {
    await expect(page.getByText('Loading form...', { exact: true })).toBeHidden({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, label)}`);
  };

  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

  expect(response?.ok()).toBe(true);
  await expect(page.getByRole('heading', { name: /paspoort.*nederlanders.*buitenland/i })).toBeVisible({ timeout: 30_000 });
  await declineCookies(page);
  await captureLoadedFormState('paspoort-nederlanders-buitenland-01-startpagina');

  await page.getByRole('button', { name: 'Formulier starten', exact: true }).click({ timeout: 30_000 });
  await page.getByRole('radio', { name: 'mijzelf', exact: true }).check();
  await captureLoadedFormState('paspoort-nederlanders-buitenland-02-voor-wie');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await page.getByRole('radiogroup', { name: 'Heeft u de Nederlandse nationaliteit?' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await captureLoadedFormState('paspoort-nederlanders-buitenland-03-nationaliteit');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await page.getByRole('radiogroup', { name: 'Heeft u in Nederland gewoond?' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await captureLoadedFormState('paspoort-nederlanders-buitenland-04-in-nederland-gewoond');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await page.getByRole('textbox', { name: 'Wat was de laatste gemeente waar u heeft gewoond?' }).fill('Nijmegen');
  await page.getByRole('radiogroup', { name: 'Heeft u zich in Nederland laten uitschrijven?' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await captureLoadedFormState('paspoort-nederlanders-buitenland-05-uitgeschreven');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await captureLoadedFormState('paspoort-nederlanders-buitenland-06-documenten-meesturen');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await captureLoadedFormState('paspoort-nederlanders-buitenland-07-aanvraag');
  await page.getByRole('checkbox', { name: 'paspoort', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u een Burgerservicenummer (BSN)?' }).getByRole('radio', { name: 'ja', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Hoe heeft u de Nederlandse nationaliteit gekregen?' }).getByRole('radio', { name: 'geboorte', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Heeft u een Nederlands document?' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Is het document vermist of gestolen?' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('radiogroup', { name: 'Bent u in het bezit van een andere nationaliteit?' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await page.getByRole('textbox', { name: 'Hoeveel gezinsleden willen tegelijk een paspoort of een identiteitskaart aanvragen?' }).fill('0');
  await captureLoadedFormState('paspoort-nederlanders-buitenland-07-aanvraag-ingevuld');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await expectFormStep(page, 'Uw gegevens');
  await page.getByRole('textbox', { name: 'Voornamen *', exact: true }).fill('Test');
  await page.getByRole('textbox', { name: 'Achternaam *', exact: true }).fill('Aanvrager');
  await fillOpenFormsDate(page, 'Geboortedatum', '01-01-2000');
  await page.getByRole('textbox', { name: 'Geboorteplaats *', exact: true }).fill('Nijmegen');
  await page.getByRole('textbox', { name: 'Geboorteland *', exact: true }).fill('Nederland');
  await page.getByRole('radiogroup', { name: 'Burgerlijke staat *' }).getByRole('radio', { name: 'ongetrouwd / geen geregistreerd partner', exact: true }).check();
  await page.getByRole('textbox', { name: 'Adres 1 *', exact: true }).fill('Teststraat 1');
  await fillOpenFormsDate(page, 'Sinds wanneer woont u in het buitenland?', '01-01-2020');
  await page.getByRole('radiogroup', { name: 'Heeft u een ander adres waar post naar toegestuurd mag worden (correspondentieadres)? *' }).getByRole('radio', { name: 'nee', exact: true }).check();
  await captureLoadedFormState('paspoort-nederlanders-buitenland-08-uw-gegevens-ingevuld');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await expectFormStep(page, 'Contactgegevens');
  await page.getByRole('textbox', { name: 'E-mailadres *', exact: true }).fill('test@example.com');
  await captureLoadedFormState('paspoort-nederlanders-buitenland-09-contactgegevens-ingevuld');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await expectFormStep(page, 'Bijlagen');
  await uploadFixture(page, page.getByRole('link', { name: /selecteer.*bestand/i }), 'pdf13Kb');
  await page.getByText('Documenten volgens de checklist', { exact: true }).click();
  await captureLoadedFormState('paspoort-nederlanders-buitenland-10-bijlagen-ingevuld');
  await page.getByRole('button', { name: 'Volgende', exact: true }).click({ timeout: 30_000 });
  await expectFormStep(page, 'Controleer en bevestig');
  await captureLoadedFormState('paspoort-nederlanders-buitenland-11-overzicht');
  await page.getByRole('button', { name: 'Verzenden', exact: true }).click({ timeout: 30_000 });
  await expect(page.getByRole('heading', { name: /^Uw gegevens zijn verstuurd met kenmerk OF-[A-Z0-9]+$/ })).toBeVisible({ timeout: 60_000 });
  await page.waitForTimeout(5_000);
  console.log(`Form artifacts: ${await captureFormState(page, testInfo, 'paspoort-nederlanders-buitenland-99-bevestiging')}`);
});
