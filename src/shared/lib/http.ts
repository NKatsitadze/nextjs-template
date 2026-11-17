import { AUTH_ROUTES, SIGN_IN_ROUTE } from '@/shared/constants/routes';
import { setHttpSpanStatus } from '@/shared/lib/set-http-span-status';
import { type HttpMethod } from '@/shared/types/http-method';

import { forceNavigate } from './force-navigate';
import { sendHttpErrorToSentry, startHttpSpan } from './sentry';

type ResponseType = 'json' | 'blob' | 'text' | 'arrayBuffer';

export type HttpError = Error & {
  code?: string;
  status?: number;
};

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof Error && 'status' in error;
}

type RequestConfig = Omit<RequestInit, 'body'> & {
  body?: unknown;
  baseUrl?: string;
  params?: Record<string, string | number | boolean | undefined>;
  responseType?: ResponseType;
};

type HttpErrorBody = { error?: string; message?: string };

function buildQuery(params: RequestConfig['params']): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()}`;
}

function isOnAuthPage(): boolean {
  return AUTH_ROUTES.some((route) => window.location.pathname.startsWith(route));
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'GET', config);
  }

  async post<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'POST', { ...config, body });
  }

  async put<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'PUT', { ...config, body });
  }

  async patch<T>(endpoint: string, body?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'PATCH', { ...config, body });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', config);
  }

  private async request<T>(endpoint: string, method: HttpMethod, config: RequestConfig = {}): Promise<T> {
    const { baseUrl, params, headers, body, responseType = 'json', ...init } = config;
    const url = `${baseUrl ?? this.baseURL}${endpoint}${buildQuery(params)}`;
    const isFormData = body instanceof FormData;
    const requestHeaders = new Headers(headers);
    if (!isFormData && body !== undefined) requestHeaders.set('Content-Type', 'application/json');

    const span = startHttpSpan(method, endpoint, url);
    const sentryContext = { endpoint, method, url };

    try {
      const response = await fetch(url, {
        ...init,
        method,
        headers: requestHeaders,
        body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
      });
      setHttpSpanStatus(span, response.status);

      if (!response.ok) throw await this.toHttpError(response, sentryContext);
      if (response.status === 204) return undefined as T;
      return await this.parseBody<T>(response, responseType);
    } catch (error) {
      if (isHttpError(error)) throw error;
      setHttpSpanStatus(span, error);
      const networkError = error instanceof Error ? error : new Error('An unexpected error occurred');
      if (networkError.name !== 'AbortError') sendHttpErrorToSentry(networkError, sentryContext);
      throw networkError;
    } finally {
      span?.end();
    }
  }

  private async toHttpError(response: Response, sentryContext: { endpoint: string; method: string; url: string }) {
    const errorBody = (await response.json().catch(() => ({}))) as HttpErrorBody;
    const error: HttpError = new Error(errorBody.error ?? errorBody.message ?? `HTTP Error: ${response.status}`);
    error.code = errorBody.error;
    error.status = response.status;

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !isOnAuthPage()) forceNavigate(SIGN_IN_ROUTE);
    } else {
      sendHttpErrorToSentry(error, { ...sentryContext, status: response.status });
    }
    return error;
  }

  private async parseBody<T>(response: Response, responseType: ResponseType): Promise<T> {
    switch (responseType) {
      case 'blob':
        return (await response.blob()) as T;
      case 'text':
        return (await response.text()) as T;
      case 'arrayBuffer':
        return (await response.arrayBuffer()) as T;
      case 'json':
        return (await response.json().catch(() => undefined)) as T;
    }
  }
}

export const http = new HttpClient();

export { HttpClient };
