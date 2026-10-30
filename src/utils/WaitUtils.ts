import type { Locator, Page } from 'playwright';
import { DEFAULT_TIMEOUT_MS } from '../constants/TestConstants';

export class WaitUtils {
  static async waitForVisible(locator: Locator, timeout = DEFAULT_TIMEOUT_MS): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  static async waitForPageLoad(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
  }
}
