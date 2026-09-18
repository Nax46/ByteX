import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  AuthContextValue,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types'
import { UserProfile } from '@/types/user.types'
import { storageService } from '@/services/storage.service'
import { authService } from '@/services/authService'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => storageService.getUser())
  const [token, setToken] = useState<string | null>(() => storageService.getToken())
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isMockMode, setIsMockMode] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Sync token state changes & listen for unauthorized events
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      setToken(null)
      storageService.clearSession()
      setError('Your session has expired. Please log in again.')
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized)
    }
  }, [])

  // Validate existing stored session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = storageService.getToken()

      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const liveUser = await authService.getCurrentUser()
        if (liveUser) {
          setUser(liveUser)
          storageService.setUser(liveUser)
        }
      } catch (err: unknown) {
        console.warn('Live session check note:', err)
        // Keep stored demo session if present
        if (!storageService.getUser()) {
          storageService.clearSession()
          setUser(null)
          setToken(null)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(credentials)
      storageService.setToken(response.token)
      storageService.setUser(response.user)
      setToken(response.token)
      setUser(response.user)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Failed to log in. Please verify your credentials.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.register(credentials)
      storageService.setToken(response.token)
      storageService.setUser(response.user)
      setToken(response.token)
      setUser(response.user)
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Registration failed. Please try again.'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    storageService.clearSession()
    setUser(null)
    setToken(null)
    setError(null)
    authService.logout().catch(() => {})
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const liveUser = await authService.getCurrentUser()
      if (liveUser) {
        setUser(liveUser)
        storageService.setUser(liveUser)
      }
    } catch {
      // Silent error on refresh
    }
  }

  const toggleMockMode = (enabled?: boolean) => {
    setIsMockMode((prev) => (enabled !== undefined ? enabled : !prev))
  }

  const value: AuthContextValue = {
    user,
    token,
    role: user?.role || 'student',
    isAuthenticated: !!token && !!user,
    isLoading,
    isMockMode,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    toggleMockMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
