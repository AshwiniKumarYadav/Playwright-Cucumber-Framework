import { randomUUID } from 'node:crypto';

export class TestDataGenerator {
  static uniqueName(prefix = 'Automation User'): string {
    return `${prefix} ${randomUUID().slice(0, 8)}`;
  }

  static uniqueEmail(domain = 'example.test'): string {
    return `qa-${randomUUID()}@${domain}`;
  }

  static uniqueUsername(prefix = 'qa-user'): string {
    return `${prefix}-${randomUUID().slice(0, 8)}`;
  }
}
