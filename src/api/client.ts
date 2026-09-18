import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { storageService } from '@/services/storage.service'
import { ApiError, ApiResponse } from '@/types/api.types'

/**
 * Reads API base URL from environment.
 * The backend team can configure the host, port, and prefix via VITE_API_BASE_URL.
 * No hardcoded ports or endpoints exist here.
 */
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim()
  }
  // Default relative API path when proxying or backend is configured on same origin
  return '/api'
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Attach authentication token if available
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storageService.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response Interceptor: Normalize responses and catch 401 / unauthenticated
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred'

    const normalizedError: ApiError = {
      message,
      status,
      errors: error.response?.data?.errors,
    }

    if (status === 401) {
      // Clear expired local session without forcing harsh reload
      storageService.clearSession()
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }

    return Promise.reject(normalizedError)
  }
)

/**
 * Standardized API client helpers to enforce consistent types across all endpoint modules.
 */
export const apiClient = {
  get: async <T>(url: string, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config)
    return response.data
  },

  post: async <T, B = unknown>(url: string, data?: B, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.post<ApiResponse<T>>(url, data, config)
    return response.data
  },

  put: async <T, B = unknown>(url: string, data?: B, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config)
    return response.data
  },

  delete: async <T>(url: string, config?: InternalAxiosRequestConfig): Promise<ApiResponse<T>> => {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config)
    return response.data
  },
}
