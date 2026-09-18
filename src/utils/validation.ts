export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPassword(password: string): {
  isValid: boolean
  message?: string
} {
  if (password.length < 6) {
    return { isValid: false, message: 'Password must be at least 6 characters.' }
  }
  return { isValid: true }
}
