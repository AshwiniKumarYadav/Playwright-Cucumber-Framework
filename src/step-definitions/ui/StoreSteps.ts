import { Given, When, Then } from '@cucumber/cucumber';
import type { CustomWorld } from '../../core/fixtures/CustomWorld';
import { environment, requireUiCredentials } from '../../../config/environment';
import { BookingPage } from '../../pages/BookingPage';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { SearchPage } from '../../pages/SearchPage';
import { TestDataGenerator } from '../../utils/TestDataGenerator';
import { TestDataLoader } from '../../utils/TestDataLoader';
import { isRecord } from '../../utils/CommonUtils';

interface StoreTestData {
  store: { productName: string };
}

function isStoreTestData(value: unknown): value is StoreTestData {
  return isRecord(value) && isRecord(value.store) && typeof value.store.productName === 'string';
}

async function configuredProductName(): Promise<string> {
  const data = await TestDataLoader.load('testData.json', isStoreTestData);
  return data.store.productName;
}

Given('I open the Sauce Demo login page', async function (this: CustomWorld) {
  await new LoginPage(this.page).open(environment.appBaseUrl);
});

When('I log in with valid credentials', async function (this: CustomWorld) {
  const { username, password } = requireUiCredentials();
  await new LoginPage(this.page).login(username, password);
});

When('I log in with invalid credentials', async function (this: CustomWorld) {
  await new LoginPage(this.page).login(environment.invalidUiUsername, 'invalid-password');
});

Given('I am logged in to the store', async function (this: CustomWorld) {
  await new LoginPage(this.page).open(environment.appBaseUrl);
  const { username, password } = requireUiCredentials();
  await new LoginPage(this.page).login(username, password);
  await new LoginPage(this.page).verifySuccessfulLogin();
});

Then('the store inventory should be visible', async function (this: CustomWorld) {
  await new HomePage(this.page).verifyLoaded();
});

Then('the invalid login message should be visible', async function (this: CustomWorld) {
  await new LoginPage(this.page).verifyInvalidLogin();
});

Then('the product listing should be displayed', async function (this: CustomWorld) {
  await new SearchPage(this.page).verifyProductResults();
});

When('I add the configured demo product to the cart', async function (this: CustomWorld) {
  const productName = await configuredProductName();
  await new SearchPage(this.page).selectProduct(productName);
});

When('I open the shopping cart', async function (this: CustomWorld) {
  await new HomePage(this.page).openCart();
});

Then('the cart should contain the configured demo product', async function (this: CustomWorld) {
  const productName = await configuredProductName();
  await new BookingPage(this.page).verifyCartContains(productName);
});

When('I complete checkout with generated customer details', async function (
  this: CustomWorld,
) {
  const name = TestDataGenerator.uniqueName('QA');
  await new BookingPage(this.page).checkout(name, 'Automation', '94000');
});

Then('the order confirmation should be displayed', async function (this: CustomWorld) {
  await new BookingPage(this.page).verifyOrderComplete();
});
