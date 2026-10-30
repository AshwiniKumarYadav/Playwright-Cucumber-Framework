import { access, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { BrowserContext } from 'playwright';
import { environment } from '../../../config/environment';

export class SessionManager {
  private readonly stateDirectory = path.resolve(process.cwd(), 'session');

  async getStorageState(role: string): Promise<string | undefined> {
    if (!environment.reuseAuthState) return undefined;
    const statePath = this.statePath(role);
    try {
      await access(statePath);
      return statePath;
    } catch (error) {
      if (this.isMissingFile(error)) return undefined;
      throw error;
    }
  }

  async saveStorageState(context: BrowserContext, role: string): Promise<string> {
    await mkdir(this.stateDirectory, { recursive: true });
    const statePath = this.statePath(role);
    await context.storageState({ path: statePath });
    return statePath;
  }

  async clear(role?: string): Promise<void> {
    const statePath = role ? this.statePath(role) : this.stateDirectory;
    try {
      await rm(statePath, { recursive: !role, force: true });
    } catch (error) {
      throw new Error(`Unable to clear session state at "${statePath}".`, { cause: error });
    }
  }

  private statePath(role: string): string {
    if (!/^[a-zA-Z0-9_-]+$/.test(role)) {
      throw new Error('Session role may contain only letters, numbers, underscores, and hyphens.');
    }
    return path.join(this.stateDirectory, `${role}.state.json`);
  }

  private isMissingFile(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ENOENT'
    );
  }
}
