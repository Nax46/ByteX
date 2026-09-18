/**
 * Core HTTP Client for AI SkillPath
 * Native fetch-based API client with automatic token injection and normalized error handling.
 */

import { getToken } from './storage.js';

/**
 * Normalized API Error representation.
 */
export class ApiError extends Error {
  /**
   * @param {number} status - HTTP status code (0 for network errors)
   * @param {string} message - User-friendly error message
   * @param {Array<any>} [errors=[]] - Detailed validation or server errors
   * @param {any} [data=null] - Optional error data payload
   * @param {boolean} [isNetworkError=false] - True if failure was due to network disconnection
   */
  constructor(status, message, errors = [], data = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = Array.isArray(errors) ? errors : [];
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Resolves the backend API base URL from Vite environment variables.
 * @returns {string} The base URL without trailing slash.
 */
export const getBaseUrl = () => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof globalThis !== 'undefined' && globalThis.process?.env?.VITE_API_BASE_URL);
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://localhost:5000/api';
};

/**
 * Builds a query string from a parameters object.
 * @param {Record<string, any>} [params]
 * @returns {string}
 */
const buildQueryString = (params) => {
  if (!params || typeof params !== 'object') return '';
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

/**
 * Makes an HTTP request to the AI SkillPath backend API.
 * 
 * @template T
 * @param {string} endpoint - API path (e.g. '/auth/login' or 'health')
 * @param {object} [options={}] - Fetch configuration options
 * @param {string} [options.method='GET'] - HTTP method
 * @param {any} [options.body] - Request payload to be serialized as JSON
 * @param {Record<string, any>} [options.params] - Query parameters
 * @param {Record<string, string>} [options.headers] - Additional request headers
 * @param {string} [options.customToken] - Explicit token override (optional)
 * @returns {Promise<{ success: boolean, message: string, data: T }>} Normalized response envelope
 */
export const apiClient = async (endpoint, options = {}) => {
  const {
    method = 'GET',
    body,
    params,
    headers: customHeaders = {},
    customToken,
    ...restOptions
  } = options;

  const baseUrl = getBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const queryString = buildQueryString(params);
  const fullUrl = `${baseUrl}${cleanEndpoint}${queryString}`;

  const headers = new Headers();
  headers.set('Accept', 'application/json');

  // Custom headers
  for (const [headerKey, headerVal] of Object.entries(customHeaders)) {
    if (headerVal) {
      headers.set(headerKey, headerVal);
    }
  }

  // Automatic JSON serialization for body
  let requestBody = undefined;
  if (body !== undefined && body !== null) {
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      requestBody = body;
    } else {
      headers.set('Content-Type', 'application/json');
      requestBody = JSON.stringify(body);
    }
  }

  // JWT Token Handling:
  // Automatically inject Bearer token if present; do not inject if no token exists
  const token = customToken || getToken();
  if (token && typeof token === 'string' && token.trim().length > 0) {
    headers.set('Authorization', `Bearer ${token.trim()}`);
  }

  let response;
  try {
    response = await fetch(fullUrl, {
      method: method.toUpperCase(),
      headers,
      body: requestBody,
      ...restOptions,
    });
  } catch {
    // Graceful network failure handling
    throw new ApiError(
      0,
      'Network error: Unable to communicate with the server. Please check your connection.',
      [],
      null,
      true
    );
  }

  // Parse response safely
  let responseData = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    // Non-JSON response (e.g. 502/504 HTML error page)
    const text = await response.text().catch(() => '');
    if (!response.ok) {
      throw new ApiError(
        response.status,
        response.statusText || 'Unexpected non-JSON response from server',
        text ? [text] : []
      );
    }
  }

  // Verify HTTP status code
  if (!response.ok) {
    const message = responseData?.message || response.statusText || 'Request failed';
    const errors = responseData?.errors || [];
    const data = responseData?.data || null;
    throw new ApiError(response.status, message, errors, data);
  }

  return responseData;
};
