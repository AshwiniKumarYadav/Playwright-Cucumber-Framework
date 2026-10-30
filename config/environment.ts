import path from 'node:path';
import { automationConfig } from '../playwright.config';

const supportedEnvironments = ['qa', 'staging', 'production'] as const;
type EnvironmentName = (typeof supportedEnvironments)[number];
const configuredEnvironment = automationConfig.environmentName;

if (!supportedEnvironments.includes(configuredEnvironment as EnvironmentName)) {
  throw new Error(
    `Unsupported TEST_ENV "${configuredEnvironment}". Use qa, staging, or production.`,
  );
}
const environmentName = configuredEnvironment as EnvironmentName;

if (automationConfig.browsers.length !== 1) {
  throw new Error('BROWSER=all must be run through the npm test scripts.');
}

function requiredUrl(value: string | undefined, name: string): string {
  if (!value?.trim()) throw new Error(`${name} must be configured for TEST_ENV=${environmentName}.`);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch (error) {
    throw new Error(`${name} must be an absolute HTTP(S) URL.`, { cause: error });
  }
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error(`${name} must not contain embedded credentials.`);
  }
  return value;
}

function positiveInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

export const environment = Object.freeze({
  name: environmentName as EnvironmentName,
  browser: automationConfig.browsers[0],
  headless: automationConfig.headless,
  workers: automationConfig.workers,
  appBaseUrl: requiredUrl(
    process.env.APP_BASE_URL ?? (environmentName === 'qa' ? 'https://www.saucedemo.com' : undefined),
    'APP_BASE_URL',
  ),
  apiBaseUrl: requiredUrl(
    process.env.API_BASE_URL ??
      (environmentName === 'qa' ? 'https://jsonplaceholder.typicode.com' : undefined),
    'API_BASE_URL',
  ),
  uiUsername: process.env.UI_USERNAME ?? '',
  uiPassword: process.env.UI_PASSWORD ?? '',
  invalidUiUsername: process.env.INVALID_UI_USERNAME ?? 'invalid-user',
  reuseAuthState: (process.env.REUSE_AUTH_STATE ?? 'false').toLowerCase() === 'true',
  apiTimeoutMs: positiveInteger(process.env.API_TIMEOUT_MS, 30_000, 'API_TIMEOUT_MS'),
  apiMaxResponseTimeMs: positiveInteger(
    process.env.API_MAX_RESPONSE_TIME_MS,
    5_000,
    'API_MAX_RESPONSE_TIME_MS',
  ),
});

export function requireUiCredentials(): { username: string; password: string } {
  const { uiUsername, uiPassword } = environment;
  if (!uiUsername || !uiPassword) {
    throw new Error(
      'Set UI_USERNAME and UI_PASSWORD in .env or .env.example to run UI login scenarios.',
    );
  }
  return { username: uiUsername, password: uiPassword };
}
