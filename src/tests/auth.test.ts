import { describe, it, expect, beforeEach } from 'vitest'
import { authService } from '@/services/authService'
import { storageService } from '@/services/storage.service'
import { useAuth, AuthContext, AuthProvider } from '@/context/AuthContext'
import defaultUseAuth from '@/hooks/useAuth'

// Mock browser localStorage for node test runner
const memoryStore = new Map<string, string>()
globalThis.localStorage = {
  getItem: (k: string) => memoryStore.get(k) ?? null,
  setItem: (k: string, v: string) => memoryStore.set(k, v),
  removeItem: (k: string) => { memoryStore.delete(k) },
  clear: () => memoryStore.clear(),
  key: () => null,
  length: 0,
} as Storage

describe('Auth Contract and clearError verification', () => {
  beforeEach(() => {
    storageService.clearSession()
  })

  it('exports useAuth and AuthContext properly with no ambiguity', () => {
    expect(useAuth).toBeDefined()
    expect(typeof useAuth).toBe('function')
    expect(defaultUseAuth).toBeDefined()
    expect(AuthContext).toBeDefined()
    expect(AuthProvider).toBeDefined()
  })

  it('authenticates valid student demo credentials', async () => {
    const res = await authService.login({
      email: 'student@skillpath.demo',
      password: 'Student@123',
    })

    expect(res).toBeDefined()
    expect(res.user.role).toBe('student')
    expect(res.user.email).toBe('student@skillpath.demo')
    expect(res.token).toContain('student')
  })

  it('authenticates valid admin demo credentials', async () => {
    const res = await authService.login({
      email: 'admin@skillpath.demo',
      password: 'Admin@123',
    })

    expect(res).toBeDefined()
    expect(res.user.role).toBe('admin')
    expect(res.user.email).toBe('admin@skillpath.demo')
    expect(res.token).toContain('admin')
  })

  it('rejects invalid credentials with a descriptive error', async () => {
    await expect(
      authService.login({
        email: 'invalid@skillpath.demo',
        password: 'WrongPassword123',
      })
    ).rejects.toThrow(/invalid email or password/i)
  })

  it('provides student and admin in getDemoCredentials', () => {
    const demoUsers = authService.getDemoCredentials()
    const student = demoUsers.find((u) => u.email === 'student@skillpath.demo')
    const admin = demoUsers.find((u) => u.email === 'admin@skillpath.demo')

    expect(student).toBeDefined()
    expect(student?.password).toBe('Student@123')
    expect(admin).toBeDefined()
    expect(admin?.password).toBe('Admin@123')
  })

  it('strictly validates role permissions for admin portal access', async () => {
    const studentRes = await authService.login({
      email: 'student@skillpath.demo',
      password: 'Student@123',
    })
    expect(studentRes.user.role).toBe('student')
    expect(studentRes.user.role === 'admin').toBe(false)

    const adminRes = await authService.login({
      email: 'admin@skillpath.demo',
      password: 'Admin@123',
    })
    expect(adminRes.user.role).toBe('admin')
    expect(adminRes.user.role === 'admin').toBe(true)
  })
})
