import { GemeenteNijmegenTsApp } from '@gemeentenijmegen/projen-project-type';
const project = new GemeenteNijmegenTsApp({
  defaultReleaseBranch: 'main',
  devDeps: [
    '@gemeentenijmegen/projen-project-type',
    '@playwright/test',
  ],
  name: 'open-forms-testautomatisering',
  description: 'Automatische Playwright-tests voor online formulieren op testomgeving.',
  projenrcTs: true,
  // Playwright-tests gebruiken browser-API's en DOM-typen, zoals document en HTMLElement.
  tsconfigDev: {
    compilerOptions: {
      lib: ['es2020', 'dom'],
    },
  },
  gitignore: ['.env', 'test-results/', 'playwright-result-artifacts/'],
  release: false,
  // deps: [],                /* Runtime dependencies of this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.addTask('test:playwright', { exec: 'playwright test' });
project.addTask('test:playwright:headed', { exec: 'playwright test --headed' });
project.synth();
