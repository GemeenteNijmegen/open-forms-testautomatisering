import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';
import { digidSimulatorPersons } from './test/playwright/test-data/digid-simulator-persons';
import { kvkTestCompanies } from './test/playwright/test-data/kvk-test-companies';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const formArtifactsRunTimestamp = new Date().toISOString().replace(/[:.]/g, '-');

// De DigiD-simulator kan niet betrouwbaar twee gelijktijdige aanmeldingen met hetzelfde BSN verwerken.
// Ook een KvK-nummer behandelen we als gereserveerd zolang een test daarmee bezig is.
// Voeg aan zo'n test een tag toe in de vorm @digid-<bsn> of @kvk-<nummer>.
const testResourceLanes = [
  ...Object.values(digidSimulatorPersons).map(({ bsn }) => ({ name: `digid-${bsn}`, tag: `@digid-${bsn}` })),
  ...Object.values(kvkTestCompanies).map(({ kvkNumber }) => ({ name: `kvk-${kvkNumber}`, tag: `@kvk-${kvkNumber}` })),
];

const testResourceLaneTags = new RegExp(testResourceLanes.map(({ tag }) => tag).join('|'));

export default defineConfig({
  metadata: {
    formArtifactsRunTimestamp,
  },
  preserveOutput: 'always',
  // ACCP gaf bij bredere paralleliteit incidenteel 400-responses na de DigiD-callback.
  // Drie workers houden de suite parallel zonder de authenticatieketen onnodig te belasten.
  workers: 3,
  testDir: './test/playwright',
  testMatch: '**/*.pw.ts',
  projects: [
    ...testResourceLanes.map(({ name, tag }) => ({
      name,
      grep: new RegExp(tag),
      // Eén worker per lane voorkomt dat hetzelfde BSN of KvK-nummer dubbel wordt gebruikt.
      workers: 1,
    })),
    {
      name: 'parallel',
      grepInvert: testResourceLaneTags,
    },
  ],
  use: {
    browserName: 'chromium',
    video: process.env.PW_VIDEO === '1' ? 'on' : 'off',
  },
});
