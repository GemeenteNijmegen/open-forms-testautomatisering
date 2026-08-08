import { existsSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const formArtifactsRunTimestamp = new Date().toISOString().replace(/[:.]/g, '-');

export default defineConfig({
  metadata: {
    formArtifactsRunTimestamp,
  },
  preserveOutput: 'always',
  testDir: './test/playwright',
  testMatch: '**/*.pw.ts',
  use: {
    browserName: 'chromium',
    video: process.env.PW_VIDEO === '1' ? 'on' : 'off',
  },
});
