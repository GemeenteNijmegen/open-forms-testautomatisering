import { test } from '@playwright/test';
import { captureFormState } from '../utils/form-artifacts';

export function registerErrorArtifactCapture(): void {
  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status === testInfo.expectedStatus) {
      return;
    }

    try {
      await page.waitForTimeout(3_000);
      const artifact = await captureFormState(page, testInfo, `error-${testInfo.title}`);
      console.log(`Error artifacts: ${artifact}`);
    } catch (captureError) {
      console.error('Error artifacts could not be captured.', captureError);
    }
  });
}
