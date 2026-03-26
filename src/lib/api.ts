import type { ApiResponse } from './types';

const BASE_URL = 'https://api.moma.org';
const DEFAULT_TIMEOUT_MS = 9000;
const DEFAULT_RETRIES = 1;

export class MoMAAPI {
  private token: string | null = null;

  constructor() {
    // Try to load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('moma_api_token');
    }
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('moma_api_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('moma_api_token');
    if (stored) this.token = stored;
    return stored;
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('moma_api_token');
    }
  }

  async request<T>(
    endpoint: string,
    params: Record<string, any> = {},
    options: { timeoutMs?: number; retries?: number } = {},
  ): Promise<ApiResponse<T>> {
    const url = new URL(endpoint, BASE_URL);
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const retries = options.retries ?? DEFAULT_RETRIES;

    // Always append token
    const token = this.getToken();
    if (token) {
      url.searchParams.set('token', token);
    }

    // Append other params
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    let lastError: ApiResponse<T> | null = null;
    for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
      const startTime = performance.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url.toString(), { signal: controller.signal });
        const duration = Math.round(performance.now() - startTime);

        let data: T;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = text as any;
        }

        const result: ApiResponse<T> = {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText,
          duration,
          data,
          url: url.toString(),
          attempts: attempt,
        };

        if (!result.ok && response.status >= 500 && attempt <= retries) {
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
          continue;
        }
        return result;
      } catch (error) {
        const duration = Math.round(performance.now() - startTime);
        const isTimeout = error instanceof DOMException && error.name === 'AbortError';
        const response: ApiResponse<T> = {
          ok: false,
          status: 0,
          statusText: isTimeout ? 'Request Timeout' : 'Network Error',
          duration,
          error: isTimeout ? `Request timed out after ${timeoutMs}ms` : error instanceof Error ? error.message : 'Unknown error',
          url: url.toString(),
          attempts: attempt,
        };
        lastError = response;
        if (attempt <= retries) {
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
    }
    return (
      lastError ?? {
        ok: false,
        status: 0,
        statusText: 'Network Error',
        duration: 0,
        error: 'Unknown error',
        url: url.toString(),
        attempts: retries + 1,
      }
    );
  }

  // Artists
  searchArtists(search: string) {
    return this.request('/api/artists', { search });
  }

  listArtists(search?: string) {
    return this.request('/api/artists-list', search ? { search } : {});
  }

  getArtist(artistId: number) {
    return this.request(`/api/artists/${artistId}`);
  }

  // Objects
  searchObjects(search: string, searchtype?: string) {
    return this.request('/api/objects', { search, searchtype });
  }

  getObject(objectId: number | string, type?: string) {
    return this.request(`/api/objects/${objectId}`, type ? { type } : {});
  }

  getRandomObject(onview?: boolean, options: { timeoutMs?: number } = {}) {
    return this.request('/api/objects/random', onview !== undefined ? { onview: onview ? 1 : 0 } : {}, options);
  }

  // Exhibitions
  searchExhibitions(search: string) {
    return this.request('/api/exhibitions', { search });
  }

  listExhibitions(search?: string) {
    return this.request('/api/exhibitions-list', search ? { search } : {});
  }

  getExhibition(exhibitionId: number) {
    return this.request(`/api/exhibitions/${exhibitionId}`);
  }

  getExhibitionFromList(exhibitionId: number) {
    return this.request(`/api/exhibitions-list/${exhibitionId}`);
  }

  // Packages
  listPackages(search?: string) {
    return this.request('/api/packages-list', search ? { search } : {});
  }

  getPackage(packageId: number) {
    return this.request(`/api/packages/${packageId}`);
  }
}

export const api = new MoMAAPI();
