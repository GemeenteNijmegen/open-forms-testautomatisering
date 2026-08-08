# Helpers en herbruikbare flows

## Uploads

Gebruik `uploadFixture` voor een Open Forms-bestandsupload. De helper opent de bestandkiezer, kiest een fixture, wacht op de upload en logt bestandsnaam, MIME-type en grootte.

```ts
import { uploadFixture } from '../../helpers/file-upload';

await uploadFixture(
  page,
  page.getByRole('link', { name: "selecteer een 'Plan van aanpak Werkbedrijf'-bestand" }),
  'pdf13Kb',
);
```

Beschikbare fixtures staan in `uploadFixtures`:

| Sleutel | Bestand | Type | Grootte |
| --- | --- | --- | --- |
| `text109Bytes` | `text-109-bytes.txt` | `text/plain` | 109 bytes |
| `pdf13Kb` | `document-13-kb.pdf` | `application/pdf` | 13.264 bytes |
| `pdf13KbCopy` | `document-13-kb-copy.pdf` | `application/pdf` | 13.264 bytes |
| `jpeg555Kb` | `image-555-kb.jpg` | `image/jpeg` | 555.181 bytes |
| `jpeg1_5Mb` | `image-1-5-mb.jpeg` | `image/jpeg` | 1.479.511 bytes |

### Nieuwe uploadfixture toevoegen

1. Plaats het bestand in `test/playwright/test-data/upload-fixtures/`.
2. Gebruik een naam met type en grootte, bijvoorbeeld `document-250-kb.pdf`.
3. Controleer de exacte grootte:

   ```bash
   wc -c < test/playwright/test-data/upload-fixtures/document-250-kb.pdf
   ```

4. Voeg een entry toe aan `uploadFixtures` in `test/playwright/helpers/file-upload.ts` met `fileName`, `mediaType` en `sizeBytes`.
5. Gebruik de nieuwe sleutel in een test met `uploadFixture`.

De helper controleert de bestandsgrootte vóór de upload. Pas `sizeBytes` alleen aan wanneer de fixture bewust is vervangen.

## Datumvelden

Gebruik `fillOpenFormsDate` voor Open Forms-datumvelden:

```ts
await fillOpenFormsDate(page, 'Vanaf wanneer wilt u een uitkering ontvangen?', '01-01-2026');
```

Open Forms gebruikt Flatpickr. Het zichtbare datumveld heeft geen gekoppeld label. Gebruik daarom deze helper en geen gegenereerde ids of CSS-selectors in een test.

## DigiD-simulator

Gebruik `loginWithDigiDSimulator` met een persoon uit `digidSimulatorPersons`:

```ts
await loginWithDigiDSimulator(page, digidSimulatorPersons.semVanTHul.bsn);
```

De beschikbare personen en hun BRP-situatie staan in `test/playwright/test-data/digid-simulator-persons.ts`. Kies een persoon die past bij de route die je test.

## Formuliernavigatie

Wacht na `Volgende` op de volgende heading:

```ts
await page.getByRole('button', { name: 'Volgende', exact: true }).click();
await expectFormStep(page, 'Inkomen');
```

Gebruik role- en label-locators. Gebruik geen gegenereerde ids, CSS-classes of `nth()` voor gewone formuliercontrols.

## Formulierartifacts

Maak een capture na een stabiele formulierstap:

```ts
await captureFormState(page, testInfo, 'bijstand-15-inkomen');
```

Artifacts staan onder `playwright-result-artifacts/form-runs/` en bevatten HTML, zichtbare tekst, controls, metadata en een screenshot.
