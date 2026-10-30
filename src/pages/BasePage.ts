import type { Locator, Page } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { WaitUtils } from '../utils/WaitUtils';

export class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async waitForElement(locator: Locator): Promise<void> {
    await WaitUtils.waitForVisible(locator);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async takeScreenshot(name: string): Promise<Buffer> {
    const safeName = name.replace(/[^a-zA-Z0-9_-]+/g, '_') || 'screenshot';
    const directory = path.resolve(process.cwd(), 'screenshots');
    await mkdir(directory, { recursive: true });
    return this.page.screenshot({
      path: path.join(directory, `${safeName}.png`),
      fullPage: true,
    });
  }

  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }
}
