import assert from 'node:assert/strict';
import Ajv, { type AnySchema } from 'ajv';
import type { APIResponse } from 'playwright';

const ajv = new Ajv({ allErrors: true });

export async function assertStatus(response: APIResponse, expectedStatus: number): Promise<void> {
  assert.equal(
    response.status(),
    expectedStatus,
    `Expected HTTP ${expectedStatus}, received ${response.status()}.`,
  );
}

export async function responseJson(response: APIResponse): Promise<unknown> {
  try {
    return await response.json();
  } catch (error) {
    throw new Error(`Response from ${response.url()} was not valid JSON.`, { cause: error });
  }
}

export function assertJsonSchema(value: unknown, schema: AnySchema): void {
  const validate = ajv.compile(schema);
  assert.ok(validate(value), `JSON schema validation failed: ${ajv.errorsText(validate.errors)}`);
}
