import { expect } from '@playwright/test';
import type { Page } from 'playwright';
import { BasePage } from './BasePage';

export class BookingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async verifyCartContains(name: string): Promise<void> {
    await expect(
      this.page.getByTestId('inventory-item').filter({ hasText: name }),
    ).toContainText(name);
  }

  async checkout(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.click(this.page.getByRole('button', { name: 'Checkout' }));
    await this.fill(this.page.getByPlaceholder('First Name'), firstName);
    await this.fill(this.page.getByPlaceholder('Last Name'), lastName);
    await this.fill(this.page.getByPlaceholder('Zip/Postal Code'), postalCode);
    await this.click(this.page.getByRole('button', { name: 'Continue' }));
    await this.click(this.page.getByRole('button', { name: 'Finish' }));
  }

  async verifyOrderComplete(): Promise<void> {
    await expect(this.page.getByText('Thank you for your order!')).toBeVisible();
  }
}
