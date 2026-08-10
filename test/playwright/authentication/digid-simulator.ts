import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export type DigiDSimulatorLoginStage = 'provider-choice' | 'simulator' | 'simulator-login';

type DigiDSimulatorLoginOptions = {
  onStage?: (stage: DigiDSimulatorLoginStage) => Promise<void>;
};

async function throwIfOpenFormsReturnedError(page: Page): Promise<void> {
  const errorHeading = page.getByRole('heading', { name: /^Bad Request \(400\)$/ });

  if (await errorHeading.isVisible()) {
    const message = `DigiD-login: Open Forms gaf Bad Request (400) terug na de callback van de simulator. De formulierstap is niet bereikt. Callbackpad: ${new URL(page.url()).pathname}. Dit wijst op een fout in de ACCP-authenticatieketen, niet op een ontbrekende locator.`;

    console.error(message);
    throw new Error(message);
  }
}

/** Signs in through the DigiD simulator. The caller verifies form-specific post-login UI. */
export async function loginWithDigiDSimulator(page: Page, bsn: string, options: DigiDSimulatorLoginOptions = {}): Promise<void> {
  const startUrl = page.url();
  await page.getByText('Inloggen met DigiD', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(startUrl);
  await page.waitForFunction(() => document.readyState === 'complete');
  await options.onStage?.('provider-choice');

  const providerUrl = page.url();
  await page.getByText('Simulator', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(providerUrl);
  await page.waitForFunction(() => document.readyState === 'complete');
  await options.onStage?.('simulator');

  const simulatorUrl = page.url();
  await page.getByText('DigiD', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(simulatorUrl);
  await page.waitForFunction(() => document.readyState === 'complete');
  await options.onStage?.('simulator-login');

  const authenticationUrl = page.url();
  // Signicat exposes this custom-element field without an accessible role or label.
  // Its `bsn` form name is the simulator's stable integration contract.
  await page.locator('input[name="bsn"]').fill(bsn);
  await page.getByText('Send', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(authenticationUrl);
  await page.waitForFunction(() => document.readyState === 'complete');
  await throwIfOpenFormsReturnedError(page);
  console.log(`DigiD-login geslaagd voor test-BSN ${bsn}. Terug op: ${new URL(page.url()).pathname}`);
}
