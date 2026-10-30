export function parseJson(value: string, context: string): unknown {
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed;
  } catch (error) {
    throw new Error(`Unable to parse JSON for ${context}.`, { cause: error });
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
