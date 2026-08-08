import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Dismisses the optional cookie banner when the current page displays it. */
export async function declineCookies(page: Page): Promise<void> {
  for (const label of ['Decline all', 'Alles weigeren']) {
    const button = page.getByRole('button', { name: label, exact: true });

    if (await button.isVisible().catch(() => false)) {
      await button.click();
      await expect(button).toBeHidden();
      return;
    }
  }
}
