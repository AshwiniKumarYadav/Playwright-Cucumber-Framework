import { expect } from '@playwright/test';
import type { Page } from 'playwright';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyProductResults(): Promise<void> {
    await expect(this.page.getByTestId('inventory-item')).toHaveCount(6);
  }

  async selectProduct(name: string): Promise<void> {
    await this.click(
      this.page
        .getByTestId('inventory-item')
        .filter({ hasText: name })
        .getByRole('button', { name: 'Add to cart' }),
    );
  }
}
