import type {
  APIRequestContext,
  APIResponse,
} from 'playwright';
import { Logger } from '../../utils/Logger';

type ApiRequestOptions = NonNullable<Parameters<APIRequestContext['fetch']>[1]>;

export class ApiClient {
  lastResponseDurationMs = 0;

  constructor(
    private readonly requestContext: APIRequestContext,
    private readonly logger: Logger,
  ) {}

  async get(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.send('GET', path, options);
  }

  async post(
    path: string,
    data?: ApiRequestOptions['data'],
    options?: ApiRequestOptions,
  ): Promise<APIResponse> {
    return this.send('POST', path, { ...options, data });
  }

  async put(
    path: string,
    data?: ApiRequestOptions['data'],
    options?: ApiRequestOptions,
  ): Promise<APIResponse> {
    return this.send('PUT', path, { ...options, data });
  }

  async patch(
    path: string,
    data?: ApiRequestOptions['data'],
    options?: ApiRequestOptions,
  ): Promise<APIResponse> {
    return this.send('PATCH', path, { ...options, data });
  }

  async delete(path: string, options?: ApiRequestOptions): Promise<APIResponse> {
    return this.send('DELETE', path, options);
  }

  private async send(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    options?: ApiRequestOptions,
  ): Promise<APIResponse> {
    const startedAt = Date.now();
    this.logger.info('API request', { method, path });
    let response: APIResponse;
    try {
      response = await this.requestContext.fetch(path, { ...options, method });
    } catch (error) {
      this.logger.error('API request failed', {
        method,
        path,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`API request ${method} ${path} failed.`, { cause: error });
    }
    this.lastResponseDurationMs = Date.now() - startedAt;
    this.logger.info('API response', {
      method,
      path,
      status: response.status(),
      durationMs: this.lastResponseDurationMs,
    });
    return response;
  }
}
