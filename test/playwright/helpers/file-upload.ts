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

/** Waits until Open Forms has finished uploading the selected file. */
export async function waitForOpenFormsUpload(page: Page): Promise<void> {
  const uploadStatus = page.getByText('Starting upload.', { exact: true });

  await expect(uploadStatus).toBeVisible({ timeout: 30_000 });
  await expect(uploadStatus).toBeHidden({ timeout: 30_000 });
}

/**
 * Selects a reusable fixture, waits for the Open Forms upload to finish and
 * writes the selected file type and actual size to the Playwright output.
 */
export async function uploadFixture(page: Page, filePicker: Locator, fixtureName: UploadFixtureName): Promise<void> {
  const fixture = uploadFixtures[fixtureName];
  const fixturePath = path.join(fixturesDirectory, fixture.fileName);
  const { size } = await stat(fixturePath);

  expect(size).toBe(fixture.sizeBytes);
  console.log(`Upload: selecting ${fixture.fileName} (${fixture.mediaType}, ${size} bytes).`);
  const fileChooserPromise = page.waitForEvent('filechooser');
  await filePicker.click();
  await (await fileChooserPromise).setFiles(fixturePath);
  console.log(`Upload: waiting for ${fixture.fileName} to finish.`);
  await waitForOpenFormsUpload(page);
  console.log(`Upload: completed ${fixture.fileName}.`);
}
