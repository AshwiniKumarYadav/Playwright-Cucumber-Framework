import {
  After,
  AfterAll,
  Before,
  BeforeAll,
  setDefaultTimeout,
  setWorldConstructor,
  Status,
} from '@cucumber/cucumber';
import { readFile } from 'node:fs/promises';
import { request, selectors } from 'playwright';
import { environment } from '../../../config/environment';
import { automationConfig } from '../../../playwright.config';
import { ApiClient } from '../../api/clients/ApiClient';
import { browserManager } from '../browser/BrowserManager';
import { BrowserContextManager } from '../browser/BrowserContextManager';
import { CustomWorld } from '../fixtures/CustomWorld';
import { redactText } from '../../utils/Logger';

setWorldConstructor(CustomWorld);
setDefaultTimeout(30_000);

BeforeAll(async function () {
  selectors.setTestIdAttribute('data-test');
  await browserManager.launch();
});

Before(async function (this: CustomWorld, { pickle }) {
  this.logger.setScenarioName(pickle.name);
  this.logger.info('Scenario started', { environment: environment.name });
  this.testData.startedAt = Date.now();
  this.browser = browserManager.browser;
  this.context = await BrowserContextManager.create(this);
  this.apiRequestContext = await request.newContext({
    baseURL: environment.apiBaseUrl,
    timeout: environment.apiTimeoutMs,
    extraHTTPHeaders: { Accept: 'application/json' },
  });
  this.apiClient = new ApiClient(this.apiRequestContext, this.logger);
});

Before({ tags: '@ui' }, async function (this: CustomWorld) {
  this.page = await this.context.newPage();
});

After(async function (this: CustomWorld, { result, pickle }) {
  try {
    if (result?.status === Status.FAILED) {
      if (this.hasPage && automationConfig.captureScreenshotOnFailure) {
        try {
          await this.page.addStyleTag({
            content: 'input, textarea, select { color: transparent !important; text-shadow: none !important; }',
          });
          const screenshot = await this.page.screenshot({ fullPage: true });
          await this.attach(screenshot, 'image/png');
        } catch (error) {
          this.logger.warn('Failed to capture or attach the failure screenshot', {
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
      if (result.message) await this.attach(redactText(result.message), 'text/plain');
      this.logger.error('Scenario failed', { scenario: pickle.name, error: result.message });
    }
    try {
      await this.attach(await readFile(this.logger.logFilePath, 'utf8'), 'text/plain');
    } catch (error) {
      this.logger.warn('Failed to attach scenario log to the report', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } finally {
    try {
      await this.apiRequestContext?.dispose();
    } finally {
      if (this.hasContext) await this.context.close();
      this.logger.info('Scenario finished', {
        scenario: pickle.name,
        durationMs: Date.now() - Number(this.testData.startedAt),
        status: result?.status,
      });
    }
  }
});

AfterAll(async function () {
  await browserManager.close();
});
