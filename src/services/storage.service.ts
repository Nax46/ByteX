import { safeStorage } from '@/utils/storage'
import { APP_CONFIG } from '@/constants/app.constants'
import { UserProfile } from '@/types/user.types'

export const storageService = {
  getToken: (): string | null => {
    return safeStorage.getItem<string>(APP_CONFIG.DEFAULT_TOKEN_KEY)
  },

  setToken: (token: string): void => {
    safeStorage.setItem(APP_CONFIG.DEFAULT_TOKEN_KEY, token)
  },

  removeToken: (): void => {
    safeStorage.removeItem(APP_CONFIG.DEFAULT_TOKEN_KEY)
  },

  getUser: (): UserProfile | null => {
    return safeStorage.getItem<UserProfile>(APP_CONFIG.DEFAULT_USER_KEY)
  },

  setUser: (user: UserProfile): void => {
    safeStorage.setItem(APP_CONFIG.DEFAULT_USER_KEY, user)
  },

  removeUser: (): void => {
    safeStorage.removeItem(APP_CONFIG.DEFAULT_USER_KEY)
  },

  clearSession: (): void => {
    safeStorage.removeItem(APP_CONFIG.DEFAULT_TOKEN_KEY)
    safeStorage.removeItem(APP_CONFIG.DEFAULT_USER_KEY)
  },
}
