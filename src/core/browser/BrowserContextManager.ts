import type { BrowserContext } from 'playwright';
import type { CustomWorld } from '../fixtures/CustomWorld';

export class BrowserContextManager {
  static async create(world: CustomWorld): Promise<BrowserContext> {
    const storageState = await world.sessionManager.getStorageState('default');
    return world.browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...(storageState ? { storageState } : {}),
    });
  }
}
