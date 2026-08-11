import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

export type EHerkenningSimulatorLoginStage = 'provider-choice' | 'simulator-choice' | 'simulator-login';

type EHerkenningSimulatorLoginOptions = {
  onStage?: (stage: EHerkenningSimulatorLoginStage) => Promise<void>;
};

/** Signs in through the optional Signicat provider selector and its eHerkenning simulator. */
export async function loginWithEHerkenningSimulator(page: Page, kvkNumber: string, options: EHerkenningSimulatorLoginOptions = {}): Promise<void> {
  const startUrl = page.url();
  await page.getByText('Inloggen met eHerkenning', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(startUrl);
  await page.waitForFunction(() => document.readyState === 'complete');

  const simulator = page.getByText('Simulator', { exact: true });
  if (await simulator.isVisible().catch(() => false)) {
    await options.onStage?.('provider-choice');
    const providerUrl = page.url();
    await simulator.click();
    await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(providerUrl);
    await page.waitForFunction(() => document.readyState === 'complete');
  }

  await options.onStage?.('simulator-choice');
  const simulatorChoiceUrl = page.url();
  await page.getByText('eHerkenning', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(simulatorChoiceUrl);
  await page.waitForFunction(() => document.readyState === 'complete');
  await options.onStage?.('simulator-login');

  const authenticationUrl = page.url();
  // Signicat exposes this custom-element field without an accessible role or label.
  // Its `entityConcernedIdKvKnr` form name is the simulator's stable integration contract.
  await page.locator('input[name="entityConcernedIdKvKnr"]').fill(kvkNumber);
  await page.getByText('Send', { exact: true }).click();
  await expect.poll(() => page.url(), { timeout: 30_000 }).not.toBe(authenticationUrl);
  await page.waitForFunction(() => document.readyState === 'complete');
  console.log(`eHerkenning-login geslaagd voor test-KvK ${kvkNumber}. Terug op: ${new URL(page.url()).pathname}`);
}
