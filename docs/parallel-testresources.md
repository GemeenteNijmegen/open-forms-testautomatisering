# Parallelle tests met DigiD en eHerkenning

Playwright geeft iedere test een eigen browsercontext. Cookies en browseropslag worden daardoor niet gedeeld. Dat voorkomt geen botsing bij de externe partij waarmee een test inlogt of gegevens ophaalt.

De DigiD-simulator kan problemen geven wanneer twee tests tegelijk met hetzelfde BSN aanmelden. Voor eHerkenning geldt hetzelfde uitgangspunt voor een KvK-nummer. Een BSN of KvK-nummer is daarom tijdens een test een gereserveerde testresource.

## Tags op tests

Een DigiD-test krijgt een tag met het BSN:

```ts
test('vraagt een uitkering aan', { tag: '@digid-999971785' }, async ({ page }) => {
  // ...
});
```

Een eHerkenningstest krijgt een tag met het KvK-nummer:

```ts
test('vraagt een vergunning aan namens een bedrijf', { tag: '@kvk-69599084' }, async ({ page }) => {
  // ...
});
```

Gebruik de nummers uit `test/playwright/test-data/digid-simulator-persons.ts` en `test/playwright/test-data/kvk-test-companies.ts`. Voeg een nieuw nummer eerst aan het juiste testdatabestand toe.

## Lanes in de Playwright-config

`playwright.config.ts` maakt voor ieder BSN en KvK-nummer uit die twee bestanden een project. Een project selecteert de bijbehorende tag met `grep` en draait met `workers: 1`.

Twee tests met `@digid-999971785` komen dus in hetzelfde project terecht en draaien na elkaar. Een test met `@digid-999971797` kan tegelijk draaien, want die gebruikt een andere persoon. Hetzelfde geldt voor verschillende KvK-nummers.

Tests zonder resource-tag vallen in het project `parallel`. Daar blijft de normale Playwright-parallelliteit gelden.

## Waarom dit niet met een gedeelde fixture gebeurt

Playwright-workers zijn afzonderlijke processen. Een lock in JavaScript-geheugen werkt alleen binnen één worker en beschermt daarom niet tegen een tweede worker. De projectindeling gebeurt vóór de run en voorkomt dat twee workers dezelfde testresource krijgen.

## Aandachtspunten

- Geef een test precies één resource-tag. Twee resource-tags zorgen ervoor dat de test in twee projecten wordt geselecteerd en dus dubbel wordt uitgevoerd.
- Heeft een scenario echt twee exclusieve resources nodig, splits het scenario of stem eerst de indeling af. De huidige projectselectie kan geen twee onafhankelijke locks combineren.
- Een nieuw BSN of KvK-nummer krijgt automatisch een lane zodra het aan het relevante testdatabestand is toegevoegd. De Playwright-config hoeft niet aangepast te worden.
- Een tag is nodig zodra een test de DigiD-simulator of eHerkenning met die resource gebruikt. Een BSN of KvK-nummer dat alleen als formulierwaarde wordt ingevuld, is niet automatisch een ingelogde resource.
