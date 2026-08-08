# Playwright formulier tests

Deze repository bevat end-to-endtests voor formulieren van Gemeente Nijmegen. De tests openen een formulier in Chromium, vullen een route in en leggen per belangrijke stap artifacts vast. Voor de bijstandsuitkering gaat de test via de DigiD-simulator tot en met de bevestigingspagina.

## Installeren

```
npm ci
npx projen build
```

## Chromium

Playwright gebruikt een eigen Chromium-versie die past bij de Playwright-versie van het project.

Installeer Chromium na een nieuwe clone:

```
npx playwright install chromium
```

## Tests draaien

Open een browservenster en draai alle tests:

```
npx playwright test --headed
```

Draai alleen de bijstandsuitkeringstest:

```
npx playwright test bijstandsuitkering --headed
```

## Video opnemen

Video staat standaard uit. Zet voor één run video aan met:

```
PW_VIDEO=1 npx playwright test --headed
```

Of zet `PW_VIDEO=1` in `.env` en gebruik daarna het gewone testcommando. Playwright schrijft dan per test een `video.webm` naar `test-results/`. Open dit bestand in een browser of mediaspeler om de volledige browserrun terug te kijken.

## Lokale instellingen

`.env` is alleen voor jouw lokale instellingen en wordt niet gecommit. Maak hem aan vanuit het voorbeeld:

```
cp .env.example .env
```

Zie `.env.example` voor de mogelijke waarden van `PW_VIDEO` en `OPEN_FORMS_BASE_URL`.

## Documentatie

- [Helpers en herbruikbare flows](docs/helpers-and-flows.md)

## Formulierartifacts

Naast de Playwright-output schrijft elke run formulierartifacts naar:

```
playwright-result-artifacts/form-runs/<run-timestamp>/
```

Daar staan per test en formulierstap onder andere een screenshot, zichtbare tekst, controls en HTML. Deze artifacts zijn bedoeld om een formulierstap achteraf te bekijken.
