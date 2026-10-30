import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({
  path: [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.example'),
  ],
});

const supportedEnvironments = ['qa', 'staging', 'production'] as const;
const environmentName = (process.env.TEST_ENV ?? 'qa').toLowerCase();
if (!supportedEnvironments.includes(environmentName as (typeof supportedEnvironments)[number])) {
  throw new Error(`Unsupported TEST_ENV "${environmentName}". Use qa, staging, or production.`);
}

dotenv.config({
  path: path.resolve(process.cwd(), 'config', 'env', `${environmentName}.env`),
});

const supportedBrowsers = ['chromium', 'firefox', 'webkit'] as const;
type BrowserName = (typeof supportedBrowsers)[number];

function selectedBrowsers(value: string | undefined): BrowserName[] {
  const selected = (value ?? 'chromium').toLowerCase();
  if (selected === 'all') return [...supportedBrowsers];
  if (!supportedBrowsers.includes(selected as BrowserName)) {
    throw new Error(`Unsupported BROWSER "${selected}". Use chromium, firefox, webkit, or all.`);
  }
  return [selected as BrowserName];
}

function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

export const automationConfig = Object.freeze({
  environmentName,
  browsers: selectedBrowsers(process.env.BROWSER),
  headless: (process.env.HEADLESS ?? 'true').toLowerCase() !== 'false',
  workers: positiveInteger(process.env.WORKERS, 1, 'WORKERS'),
  captureScreenshotOnFailure: true,
  reports: Object.freeze({
    cucumberJson: 'reports/cucumber-report.json',
    cucumberHtmlDirectory: 'reports',
    playwrightHtmlDirectory: 'playwright-report',
    playwrightResultsDirectory: 'test-results',
  }),
});

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.pw.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: automationConfig.workers,
  reporter: [
    ['list'],
    ['html', { outputFolder: automationConfig.reports.playwrightHtmlDirectory, open: 'never' }],
  ],
  outputDir: automationConfig.reports.playwrightResultsDirectory,
  use: {
    headless: automationConfig.headless,
    screenshot: automationConfig.captureScreenshotOnFailure ? 'only-on-failure' : 'off',
  },
  projects: supportedBrowsers.map((browserName) => ({
    name: browserName,
    use: { browserName },
  })),
});
