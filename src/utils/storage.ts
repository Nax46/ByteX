export const safeStorage = {
  getItem: <T = string>(key: string, defaultValue: T | null = null): T | null => {
    try {
      const item = localStorage.getItem(key)
      if (item === null) return defaultValue
      try {
        return JSON.parse(item) as T
      } catch {
        return item as unknown as T
      }
    } catch {
      return defaultValue
    }
  },

  setItem: (key: string, value: unknown): void => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (e) {
      console.warn(`Storage setItem failed for key "${key}":`, e)
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.warn(`Storage removeItem failed for key "${key}":`, e)
    }
  },

  clear: (): void => {
    try {
      localStorage.clear()
    } catch (e) {
      console.warn('Storage clear failed:', e)
    }
  },
}
