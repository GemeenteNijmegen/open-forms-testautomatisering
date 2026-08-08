import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const formStepTransitionTimeout = 60_000;

/**
 * Waits for the next rendered Open Forms step after a navigation action.
 *
 * A step transition persists the current page and can run form logic on the
 * server, so it intentionally has more time than an ordinary UI assertion.
 */
export async function expectFormStep(page: Page, heading: string): Promise<void> {
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible({ timeout: formStepTransitionTimeout });
}
