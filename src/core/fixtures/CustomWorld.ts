import {
  World,
  type IWorldOptions,
} from '@cucumber/cucumber';
import type {
  APIRequestContext,
  APIResponse,
  Browser,
  BrowserContext,
  Page,
} from 'playwright';
import { SessionManager } from '../context/SessionManager';
import { Logger } from '../../utils/Logger';
import type { ApiClient } from '../../api/clients/ApiClient';
import type { UserModel } from '../../api/models/UserModel';

export class CustomWorld extends World {
  readonly sessionManager = new SessionManager();
  readonly testData: Record<string, unknown> = {};
  readonly logger = new Logger();
  apiRequestContext?: APIRequestContext;
  apiResponse?: APIResponse;
  apiClient?: ApiClient;
  authenticationToken?: string;
  userId?: number;
  user?: UserModel;
  private currentBrowser?: Browser;
  private currentContext?: BrowserContext;
  private currentPage?: Page;

  constructor(options: IWorldOptions) {
    super(options);
  }

  set browser(value: Browser) {
    this.currentBrowser = value;
  }

  get browser(): Browser {
    if (!this.currentBrowser) throw new Error('Scenario browser is not initialized.');
    return this.currentBrowser;
  }

  set context(value: BrowserContext) {
    this.currentContext = value;
  }

  get context(): BrowserContext {
    if (!this.currentContext) throw new Error('Scenario browser context is not initialized.');
    return this.currentContext;
  }

  get hasContext(): boolean {
    return this.currentContext !== undefined;
  }

  set page(value: Page) {
    this.currentPage = value;
  }

  get page(): Page {
    if (!this.currentPage) throw new Error('Scenario page is not initialized.');
    return this.currentPage;
  }

  get hasPage(): boolean {
    return this.currentPage !== undefined;
  }

  getApiClient(): ApiClient {
    if (!this.apiClient) throw new Error('Scenario API client is not initialized.');
    return this.apiClient;
  }
}
