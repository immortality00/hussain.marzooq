/**
 * Secure API utility for making HTTP requests with built-in security features:
 * - Request timeouts
 * - Retry logic
 * - Error sanitization
 * - CSRF protection
 * - Response validation
 */

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  validateResponse?: (response: Response) => Promise<boolean>;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

// Default request timeout in milliseconds
const DEFAULT_TIMEOUT = 10000;

// Default number of retries
const DEFAULT_RETRIES = 2;

// Default delay between retries in milliseconds
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Makes a secure API request with built-in security features
 */
export async function secureApiRequest<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = DEFAULT_TIMEOUT,
    retries = DEFAULT_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    validateResponse
  } = options;

  // Add security headers
  const secureHeaders = {
    ...headers,
    'Content-Type': 'application/json',
    // Add CSRF token if available
    ...(typeof document !== 'undefined' && 
      document.querySelector('meta[name="csrf-token"]')
        ? { 'X-CSRF-Token': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement).content }
        : {})
  };

  // Configure fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts <= retries) {
    try {
      attempts++;
      
      const response = await fetch(url, {
        method,
        headers: secureHeaders,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'same-origin', // Include cookies
        signal: controller.signal,
      });

      // Clear the timeout
      clearTimeout(timeoutId);

      // Validate the response if a validator is provided
      if (validateResponse && !(await validateResponse(response))) {
        throw new Error('Response validation failed');
      }

      // Check for successful response
      if (!response.ok) {
        // Don't need to read the error text, but capture status code
        return {
          data: null,
          error: `Request failed with status ${response.status}`,
          status: response.status,
          success: false,
        };
      }

      // Parse the response
      const data = await response.json() as T;

      return {
        data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      // Store the error
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Don't retry if it was a timeout or if we've used all our retries
      if (
        (error instanceof DOMException && error.name === 'AbortError') ||
        attempts > retries
      ) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  // We've exhausted all retries or hit a non-retryable error
  clearTimeout(timeoutId);
  
  return {
    data: null,
    error: lastError?.message || 'Request failed',
    status: 0,
    success: false,
  };
}

/**
 * A simplified, type-safe GET request
 */
export async function secureGet<T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
  return secureApiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * A simplified, type-safe POST request
 */
export async function securePost<T>(url: string, body: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
  return secureApiRequest<T>(url, { ...options, method: 'POST', body });
}

/**
 * A simplified, type-safe PUT request
 */
export async function securePut<T>(url: string, body: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
  return secureApiRequest<T>(url, { ...options, method: 'PUT', body });
}

/**
 * A simplified, type-safe DELETE request
 */
export async function secureDelete<T>(url: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
  return secureApiRequest<T>(url, { ...options, method: 'DELETE' });
}