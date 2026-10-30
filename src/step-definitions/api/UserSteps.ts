import assert from 'node:assert/strict';
import { Given, When, Then } from '@cucumber/cucumber';
import type { APIResponse } from 'playwright';
import type { CustomWorld } from '../../core/fixtures/CustomWorld';
import { UserService } from '../../api/services/UserService';
import {
  assertJsonSchema,
  assertStatus,
  responseJson,
} from '../../api/utils/ApiHelpers';
import { postSchema, userSchema, usersSchema } from '../../api/models/ResponseSchemas';
import type { UserModel } from '../../api/models/UserModel';
import { TestDataGenerator } from '../../utils/TestDataGenerator';
import { TestDataLoader } from '../../utils/TestDataLoader';
import { isRecord } from '../../utils/CommonUtils';
import { environment } from '../../../config/environment';

interface UserTemplateFile {
  validUserTemplate: {
    name: string;
    username: string;
    email: string;
  };
}

function isUserTemplateFile(value: unknown): value is UserTemplateFile {
  return (
    isRecord(value) &&
    isRecord(value.validUserTemplate) &&
    typeof value.validUserTemplate.name === 'string' &&
    typeof value.validUserTemplate.username === 'string' &&
    typeof value.validUserTemplate.email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.validUserTemplate.email)
  );
}

function response(world: CustomWorld): APIResponse {
  if (!world.apiResponse) throw new Error('No API response is available for this step.');
  return world.apiResponse;
}

function userService(world: CustomWorld): UserService {
  return new UserService(world.getApiClient());
}

async function generatedUser(): Promise<UserModel> {
  const { validUserTemplate } = await TestDataLoader.load(
    'users.json',
    isUserTemplateFile,
  );
  return {
    name: TestDataGenerator.uniqueName(validUserTemplate.name),
    username: TestDataGenerator.uniqueUsername(validUserTemplate.username),
    email: TestDataGenerator.uniqueEmail(validUserTemplate.email.split('@')[1]),
  };
}

Given('the API service is ready', function (this: CustomWorld) {
  this.getApiClient();
});

When('I send a GET request to {string}', async function (this: CustomWorld, endpoint: string) {
  this.apiResponse = await this.getApiClient().get(endpoint);
});

Then('the API response status should be {int}', async function (
  this: CustomWorld,
  status: number,
) {
  await assertStatus(response(this), status);
});

Then('the response body should be a non-empty JSON array', async function (
  this: CustomWorld,
) {
  const body = await responseJson(response(this));
  assert.ok(Array.isArray(body) && body.length > 0, 'Expected a non-empty JSON array.');
  assertJsonSchema(body, usersSchema);
});

Then('the response should contain a user with an email address', async function (
  this: CustomWorld,
) {
  const body = await responseJson(response(this));
  assert.ok(Array.isArray(body), 'Expected the users endpoint to return an array.');
  assert.ok(
    body.some((item: unknown) => isRecord(item) && typeof item.email === 'string'),
    'Expected at least one user to include an email address.',
  );
  assertJsonSchema(body, usersSchema);
});

Then('the response should match the user JSON schema', async function (
  this: CustomWorld,
) {
  assertJsonSchema(await responseJson(response(this)), userSchema);
});

Then('the response should match the post JSON schema', async function (
  this: CustomWorld,
) {
  assertJsonSchema(await responseJson(response(this)), postSchema);
});

Then('the API response time should be within the configured limit', function (
  this: CustomWorld,
) {
  assert.ok(
    this.getApiClient().lastResponseDurationMs <= environment.apiMaxResponseTimeMs,
    `API response took ${this.getApiClient().lastResponseDurationMs}ms; configured maximum is ${environment.apiMaxResponseTimeMs}ms.`,
  );
});

When('I create a generated user', async function (this: CustomWorld) {
  this.user = await generatedUser();
  this.apiResponse = await userService(this).createUser(this.user);
});

Then('I store the created user ID from the response', async function (
  this: CustomWorld,
) {
  const body = await responseJson(response(this));
  assert.ok(isRecord(body), 'Expected the created user response to be a JSON object.');
  assertJsonSchema(body, userSchema);
  if (typeof body.id !== 'number' || !Number.isInteger(body.id)) {
    throw new Error('Expected the created user response to contain an integer ID.');
  }
  this.userId = body.id;
});

When('I retrieve the created user by its stored ID', async function (
  this: CustomWorld,
) {
  if (this.userId === undefined) throw new Error('A created user ID is not available.');
  this.apiResponse = await userService(this).getUser(this.userId);
});

When('I replace the created user using its stored ID', async function (
  this: CustomWorld,
) {
  if (this.userId === undefined) throw new Error('A created user ID is not available.');
  this.user = { ...(await generatedUser()), name: 'Updated API User' };
  this.apiResponse = await userService(this).replaceUser(this.userId, this.user);
});

Then('the response should contain the stored user ID', async function (
  this: CustomWorld,
) {
  const body = await responseJson(response(this));
  assert.ok(isRecord(body), 'Expected the API response to be a JSON object.');
  assert.equal(body.id, this.userId);
});

When('I partially update the created user using its stored ID', async function (
  this: CustomWorld,
) {
  if (this.userId === undefined) throw new Error('A created user ID is not available.');
  this.apiResponse = await userService(this).updateUser(this.userId, {
    name: 'Partially Updated API User',
  });
});

Then('the response should contain the updated user name', async function (
  this: CustomWorld,
) {
  const body = await responseJson(response(this));
  assert.ok(isRecord(body), 'Expected the API response to be a JSON object.');
  assert.equal(body.name, 'Partially Updated API User');
});

When('I replace existing user 1 with generated data', async function (
  this: CustomWorld,
) {
  this.user = { ...(await generatedUser()), id: 1 };
  this.apiResponse = await userService(this).replaceUser(1, this.user);
});

Then('the response should contain user ID 1', async function (this: CustomWorld) {
  const body = await responseJson(response(this));
  assert.ok(isRecord(body), 'Expected the API response to be a JSON object.');
  assert.equal(body.id, 1);
});

When('I patch existing user 1 with a generated name', async function (
  this: CustomWorld,
) {
  this.apiResponse = await userService(this).updateUser(1, {
    name: 'Patched Existing API User',
  });
});

Then('the response should contain the patched name', async function (
  this: CustomWorld,
) {
  const body = await responseJson(response(this));
  assert.ok(isRecord(body), 'Expected the API response to be a JSON object.');
  assert.equal(body.name, 'Patched Existing API User');
});

When('I delete existing user 1', async function (this: CustomWorld) {
  this.apiResponse = await userService(this).deleteUser(1);
});

When('I delete the created user using its stored ID', async function (
  this: CustomWorld,
) {
  if (this.userId === undefined) throw new Error('A created user ID is not available.');
  this.apiResponse = await userService(this).deleteUser(this.userId);
});
