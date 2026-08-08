import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Page, TestInfo } from '@playwright/test';

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function runDirectory(testInfo: TestInfo): string {
  const timestamp = testInfo.config.metadata.formArtifactsRunTimestamp;

  if (typeof timestamp !== 'string' || !timestamp) {
    throw new Error('Missing form artifact run timestamp in the Playwright configuration.');
  }

  return timestamp;
}

function artifactLabel(label: string): string {
  const normalized = label.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');

  if (!normalized) {
    throw new Error(`Invalid empty artifact label: ${label}`);
  }

  return normalized;
}

function relativeTestFile(testInfo: TestInfo): string {
  return path.relative(process.cwd(), testInfo.file).split(path.sep).join('/');
}

function testFileLabel(testInfo: TestInfo): string {
  return artifactLabel(relativeTestFile(testInfo).replace(/^test\/playwright\//, '').replace(/\.pw\.ts$/, ''));
}

async function writeJson(file: string, value: JsonValue): Promise<void> {
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

/**
 * Captures one stabiele formulierstatus als lokale diagnose-artifacts.
 *
 * Roep deze methode aan nadat de relevante UI-conditie is bereikt, bijvoorbeeld
 * nadat de volgende heading zichtbaar is of een validatiemelding volledig is
 * gerenderd. Gebruik een unieke, beschrijvende label per betekenisvolle stap.
 * De artifacts worden gegroepeerd per Playwright-run, testbestand en testtitel.
 *
 * @example
 * await expect(page.getByRole('heading', { name: 'Inkomen', exact: true })).toBeVisible();
 * await captureFormState(page, testInfo, 'bijstand-15-inkomen');
 *
 * Iedere capture bevat page.html, visible-text.txt, controls.json,
 * metadata.json en screenshot.png.
 */
export async function captureFormState(page: Page, testInfo: TestInfo, label: string): Promise<string> {
  const capturedAt = new Date().toISOString();
  const runOutput = path.resolve(process.cwd(), 'playwright-result-artifacts', 'form-runs', runDirectory(testInfo));
  const testOutput = path.join(runOutput, testFileLabel(testInfo), artifactLabel(testInfo.title));
  const output = path.join(testOutput, artifactLabel(label));
  await fs.mkdir(output, { recursive: true });

  const [title, html, visibleText, controls] = await Promise.all([
    page.title(),
    page.content(),
    page.locator('body').innerText().catch(() => ''),
    page.locator('input, textarea, select, button, [role]').evaluateAll((elements) =>
      elements.map((element) => {
        const htmlElement = element as HTMLElement;
        const input = element as HTMLInputElement;
        const select = element as HTMLSelectElement;

        return {
          ariaLabel: element.getAttribute('aria-label'),
          checked: 'checked' in input ? input.checked : null,
          disabled: 'disabled' in input ? input.disabled : null,
          id: htmlElement.id || null,
          name: input.name || null,
          options: element.tagName === 'SELECT'
            ? Array.from(select.options).map((option) => ({ disabled: option.disabled, text: option.text, value: option.value }))
            : null,
          role: element.getAttribute('role'),
          required: 'required' in input ? input.required : null,
          tag: element.tagName.toLowerCase(),
          text: (htmlElement.innerText || element.textContent || '').trim(),
          type: input.type || null,
          value: 'value' in input ? input.value : null,
        };
      }),
    ),
  ]);

  await Promise.all([
    writeJson(path.join(testOutput, 'test-metadata.json'), {
      testFile: relativeTestFile(testInfo),
      testTitle: testInfo.title,
      testTitlePath: testInfo.titlePath,
    }),
    fs.writeFile(path.join(output, 'page.html'), html, 'utf8'),
    fs.writeFile(path.join(output, 'visible-text.txt'), `${visibleText}\n`, 'utf8'),
    writeJson(path.join(output, 'controls.json'), controls as unknown as JsonValue),
    writeJson(path.join(output, 'metadata.json'), {
      capturedAt,
      label: artifactLabel(label),
      testFile: relativeTestFile(testInfo),
      testTitle: testInfo.title,
      title,
      url: page.url(),
    }),
    page.screenshot({ path: path.join(output, 'screenshot.png'), fullPage: true }),
  ]);

  return path.relative(process.cwd(), output);
}
