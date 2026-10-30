import { expect } from '@playwright/test';
import type { Page } from 'playwright';
import { BasePage } from './BasePage';
import { TEST_IDS } from '../constants/TestConstants';

export class LoginPage extends BasePage {
  private readonly username = this.page.getByPlaceholder('Username');
  private readonly password = this.page.getByPlaceholder('Password');
  private readonly loginButton = this.page.getByRole('button', { name: 'Login' });
  private readonly errorMessage = this.page.getByTestId(TEST_IDS.loginError);

  constructor(page: Page) {
    super(page);
  }

  async open(baseUrl: string): Promise<void> {
    await this.navigate(baseUrl);
  }

  async login(username: string, password: string): Promise<void> {
    await this.fill(this.username, username);
    await this.fill(this.password, password);
    await this.click(this.loginButton);
  }

  async verifySuccessfulLogin(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory\.html/);
    await expect(this.page.getByText('Products', { exact: true })).toBeVisible();
  }

  async verifyInvalidLogin(): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
  }
}
