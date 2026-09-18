export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  message: string
  status?: number
  code?: string
  errors?: Record<string, string[]>
}

export type AsyncState<T> = {
  data: T | null
  isLoading: boolean
  error: string | null
}
