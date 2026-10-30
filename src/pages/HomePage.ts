import { expect } from '@playwright/test';
import type { Page } from 'playwright';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyLoaded(): Promise<void> {
    await expect(this.page.getByText('Products', { exact: true })).toBeVisible();
    await expect(this.page.getByTestId('inventory-container')).toBeVisible();
  }

  async openCart(): Promise<void> {
    await this.click(this.page.getByTestId('shopping-cart-link'));
  }
}
