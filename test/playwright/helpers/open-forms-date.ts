import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Fills an Open Forms date field using its visible label.
 *
 * Open Forms currently connects the label to Flatpickr's hidden source input.
 * The visible textbox is exposed only by its `dd-mm-jjjj` placeholder, so this
 * helper scopes that textbox from the visible label itself. It keeps the
 * accessibility workaround in one place until the component
 * exposes the label on its visible input.
 */
export async function fillOpenFormsDate(page: Page, label: string, value: string): Promise<void> {
  const field = page.getByText(label, { exact: true }).locator('..').locator('..');
  const visibleInput = field.getByRole('textbox', { name: 'dd-mm-jjjj', exact: true });
  await expect(visibleInput).toBeVisible({ timeout: 30_000 });
  await visibleInput.fill(value);
  await visibleInput.press('Tab');
}
