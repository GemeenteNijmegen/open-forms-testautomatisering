import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

type SaveRepeatingGroupRowOptions = {
  description: string;
  saveButton: Locator;
  successIndicator: Locator;
};

async function visibleValidationMessages(page: Page): Promise<string[]> {
  const messages = await page.getByRole('alert').allTextContents();

  return messages.map((message) => message.trim()).filter(Boolean);
}

/**
 * Saves a row in an Open Forms repeating group and verifies a user-visible
 * outcome. Callers supply both locators because edit-grid buttons and their
 * post-save rendering differ between forms.
 *
 * Pass the actual save button from the form under test. Check its visible text
 * first; "Opslaan" is not a shared component contract.
 */
export async function saveRepeatingGroupRow(page: Page, options: SaveRepeatingGroupRowOptions): Promise<void> {
  console.log(`Repeating group: saving ${options.description}.`);
  await expect(options.saveButton).toBeVisible({ timeout: 30_000 });
  await expect(options.saveButton).toBeEnabled({ timeout: 30_000 });
  await options.saveButton.click();

  try {
    await expect(options.successIndicator).toBeVisible({ timeout: 30_000 });
  } catch (error) {
    const messages = await visibleValidationMessages(page);

    console.log(`Repeating group: saving ${options.description} did not complete.${messages.length ? ` Validation: ${messages.join(' | ')}` : ''}`);
    throw error;
  }

  console.log(`Repeating group: saved ${options.description}.`);
}
