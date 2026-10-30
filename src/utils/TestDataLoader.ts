import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseJson } from './CommonUtils';

export class TestDataLoader {
  static async load<T>(
    relativePath: string,
    validate: (value: unknown) => value is T,
  ): Promise<T> {
    const dataDirectory = path.resolve(process.cwd(), 'test-data');
    const absolutePath = path.resolve(dataDirectory, relativePath);
    const relativeToDataDirectory = path.relative(dataDirectory, absolutePath);
    if (
      relativeToDataDirectory === '..' ||
      relativeToDataDirectory.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeToDataDirectory)
    ) {
      throw new Error('Test data paths must stay inside the test-data directory.');
    }
    let content: string;
    try {
      content = await readFile(absolutePath, 'utf8');
    } catch (error) {
      throw new Error(`Unable to load test data from "${absolutePath}".`, { cause: error });
    }
    const data = parseJson(content, absolutePath);
    if (!validate(data)) {
      throw new Error(`Test data in "${absolutePath}" did not match its expected shape.`);
    }
    return data;
  }
}
