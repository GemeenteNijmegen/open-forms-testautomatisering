import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';

type Address = {
  postcode: string;
  houseNumber: string;
  street: string;
  city: string;
};

/**
 * Fills an Open Forms addressNL field and waits for its postcode lookup.
 *
 * The address component has no accessible group name, so it is scoped from
 * its visible label. This keeps the component-specific fallback in one place.
 */
export async function fillAddress(page: Page, label: string, address: Address): Promise<void> {
  const field = page.getByText(label, { exact: true }).locator('..').locator('..');

  await field.getByLabel('Postcode', { exact: true }).fill(address.postcode);
  const houseNumber = field.getByLabel('Huisnummer', { exact: true });
  await houseNumber.fill(address.houseNumber);
  await houseNumber.press('Tab');
  await expect(field.getByLabel('Straatnaam', { exact: true })).toHaveValue(address.street, { timeout: 30_000 });
  await expect(field.getByLabel('Plaats', { exact: true })).toHaveValue(address.city, { timeout: 30_000 });
}
