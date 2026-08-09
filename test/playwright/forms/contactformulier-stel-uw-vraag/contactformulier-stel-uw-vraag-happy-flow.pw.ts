import { expect, test } from '@playwright/test';
import { registerErrorArtifactCapture } from '../../helpers/error-artifacts';
import { declineCookies } from '../../helpers/cookies';
import { expectFormStep } from '../../helpers/form-navigation';
import { captureFormState } from '../../utils/form-artifacts';
import { openFormsUrl } from '../../utils/open-forms-url';

registerErrorArtifactCapture();

const url = openFormsUrl('/contactformulier/');

const categories = [
  { label: 'Bouwen of overlast (overlast, overtredingen of andere activiteiten melden)', slug: 'bouwen-of-overlast', referencePrefix: 'Z' },
  { label: 'Burgemeester of wethouder', slug: 'burgemeester-of-wethouder', referencePrefix: 'OF' },
  { label: 'Gemeentelijke belastingen (bijvoorbeeld WOZ, rioolheffing of afvalstoffenheffing)', slug: 'gemeentelijke-belastingen', referencePrefix: 'OF' },
  { label: 'Inwonerszaken (bijvoorbeeld paspoort, rijbewijs, geboorte, verhuizen, huwelijk of overlijden)', slug: 'inwonerszaken', referencePrefix: 'OF' },
  { label: 'Laag inkomen, uitkering, vergoedingen (bijvoorbeeld bijstandsuitkering, bijzondere bijstand of meedoenregeling)', slug: 'laag-inkomen-uitkering-vergoedingen', referencePrefix: 'OF' },
  { label: 'Mijn wijk', slug: 'mijn-wijk', referencePrefix: 'OF' },
  { label: 'Ondernemerszaken', slug: 'ondernemerszaken', referencePrefix: 'OF' },
  { label: 'Parkeren, verkeer en vervoer', slug: 'parkeren-verkeer-en-vervoer', referencePrefix: 'OF' },
  { label: 'Subsidies', slug: 'subsidies', referencePrefix: 'OF' },
  { label: 'Vergunningen (bijvoorbeeld evenementen, horeca, markt/standplaatsen of object)', slug: 'vergunningen', referencePrefix: 'OF' },
  { label: 'Zorg en hulp (bijvoorbeeld CAZ, mantelzorg of juridische hulp)', slug: 'zorg-en-hulp', referencePrefix: 'OF', followUpLabel: 'ik heb al zorg en hulp en heb daar een vraag over' },
  { label: 'Anders', slug: 'anders', referencePrefix: 'OF' },
];

test.setTimeout(600_000);

for (const category of categories) {
  test(`submits the ${category.slug} contact form`, async ({ page }, testInfo) => {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded' });

    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { name: 'Stel uw vraag aan de gemeente', exact: true })).toBeVisible({ timeout: 30_000 });
    await declineCookies(page);
    await page.getByRole('button', { name: 'Formulier starten', exact: true }).click();
    const logicResponse = page.waitForResponse((request) => request.url().includes('/_check-logic') && request.request().method() === 'POST');
    await page.getByRole('radio', { name: category.label, exact: true }).click();
    await logicResponse;
    await expect(page.getByRole('status')).toBeHidden({ timeout: 60_000 });
    if (category.followUpLabel) {
      const followUpLogicResponse = page.waitForResponse((request) => request.url().includes('/_check-logic') && request.request().method() === 'POST');
      await page.getByRole('radio', { name: category.followUpLabel, exact: true }).click();
      await followUpLogicResponse;
      await expect(page.getByRole('status')).toBeHidden({ timeout: 60_000 });
    }
    await page.getByRole('textbox', { name: /^Uw vraag/ }).fill('Dit is een geautomatiseerde testvraag.');
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, `contactformulier-stel-uw-vraag-${category.slug}-01-uw-vraag`)}`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Bijlagen');
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, `contactformulier-stel-uw-vraag-${category.slug}-02-bijlagen`)}`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Uw gegevens');
    await page.getByRole('textbox', { name: 'Naam', exact: true }).fill('Playwright test');
    await page.getByRole('radio', { name: /ik wil anoniem blijven/i }).check();
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, `contactformulier-stel-uw-vraag-${category.slug}-03-uw-gegevens`)}`);

    await page.getByRole('button', { name: 'Volgende', exact: true }).click();
    await expectFormStep(page, 'Controleer en bevestig');
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, `contactformulier-stel-uw-vraag-${category.slug}-04-controleer-en-bevestig`)}`);
    await page.getByRole('button', { name: 'Verzenden', exact: true }).click();
    await expect(page.getByRole('heading', { name: new RegExp(`^Uw gegevens zijn verstuurd met kenmerk ${category.referencePrefix}[A-Z0-9-]+$`) })).toBeVisible({ timeout: 60_000 });
    await page.waitForTimeout(5_000);
    console.log(`Form artifacts: ${await captureFormState(page, testInfo, `contactformulier-stel-uw-vraag-${category.slug}-99-bevestiging`)}`);
  });
}
