import { stat } from 'node:fs/promises';
import path from 'node:path';
import { expect } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';

const fixturesDirectory = path.resolve(process.cwd(), 'test/playwright/test-data/upload-fixtures');

export const uploadFixtures = {
  text109Bytes: { fileName: 'text-109-bytes.txt', mediaType: 'text/plain', sizeBytes: 109 },
  pdf13Kb: { fileName: 'document-13-kb.pdf', mediaType: 'application/pdf', sizeBytes: 13_264 },
  pdf13KbCopy: { fileName: 'document-13-kb-copy.pdf', mediaType: 'application/pdf', sizeBytes: 13_264 },
  jpeg555Kb: { fileName: 'image-555-kb.jpg', mediaType: 'image/jpeg', sizeBytes: 555_181 },
  jpeg1_5Mb: { fileName: 'image-1-5-mb.jpeg', mediaType: 'image/jpeg', sizeBytes: 1_479_511 },
} as const;

export type UploadFixtureName = keyof typeof uploadFixtures;

/** Waits for Open Forms to accept an uploaded submission file. */
export async function waitForOpenFormsUpload(page: Page): Promise<void> {
  const response = await page.waitForResponse(
    (candidate) => {
      const request = candidate.request();

      return request.method() === 'POST' && candidate.url().includes('/api/v2/formio/fileupload');
    },
    { timeout: 30_000 },
  );

  expect(response.ok(), `Upload request failed with HTTP ${response.status()}: ${response.url()}`).toBe(true);
}

/**
 * Selects a reusable fixture, waits for the server to accept it, verifies the
 * user-visible file item and writes the selected file type and actual size to
 * the Playwright output.
 */
export async function uploadFixture(page: Page, filePicker: Locator, fixtureName: UploadFixtureName): Promise<void> {
  const fixture = uploadFixtures[fixtureName];
  const fixturePath = path.join(fixturesDirectory, fixture.fileName);
  const { size } = await stat(fixturePath);

  expect(size).toBe(fixture.sizeBytes);
  console.log(`Upload: selecting ${fixture.fileName} (${fixture.mediaType}, ${size} bytes).`);
  // This listener starts before setFiles, so responses from earlier uploads cannot satisfy it.
  const uploadResponse = waitForOpenFormsUpload(page);
  const fileChooserPromise = page.waitForEvent('filechooser');
  await filePicker.click();
  await (await fileChooserPromise).setFiles(fixturePath);
  console.log(`Upload: waiting for ${fixture.fileName} to be accepted by Open Forms.`);
  await uploadResponse;
  await expect(page.getByText(fixture.fileName, { exact: true })).toBeVisible({ timeout: 30_000 });
  console.log(`Upload: completed ${fixture.fileName}.`);
}
