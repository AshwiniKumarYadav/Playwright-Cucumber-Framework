import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  chromium,
  firefox,
  webkit,
  type Browser,
  type BrowserType,
} from 'playwright';
import { environment } from '../../../config/environment';
import { Logger } from '../../utils/Logger';

export class BrowserManager {
  private instance?: Browser;
  private readonly logger = new Logger('browser');

  async launch(): Promise<Browser> {
    if (this.instance?.isConnected()) return this.instance;
    const types: Record<typeof environment.browser, BrowserType> = {
      chromium,
      firefox,
      webkit,
    };
    this.logger.info('Launching browser', {
      browser: environment.browser,
      headless: environment.headless,
    });
    this.instance = await types[environment.browser].launch({
      headless: environment.headless,
    });
    const browserInfo = {
      name: environment.browser,
      version: this.instance.version(),
    };
    this.logger.info('Browser initialized', browserInfo);
    const reportsDirectory = path.resolve(process.cwd(), 'reports');
    mkdirSync(reportsDirectory, { recursive: true });
    writeFileSync(
      path.join(reportsDirectory, `browser-info-${process.pid}.json`),
      JSON.stringify(browserInfo),
      'utf8',
    );
    return this.instance;
  }

  get browser(): Browser {
    if (!this.instance?.isConnected()) {
      throw new Error('Browser has not been launched or is no longer connected.');
    }
    return this.instance;
  }

  async close(): Promise<void> {
    if (!this.instance) return;
    await this.instance.close();
    this.instance = undefined;
    this.logger.info('Browser closed');
  }
}

export const browserManager = new BrowserManager();
