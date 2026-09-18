import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { isValidEmail } from '@/utils/validation'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError?.()
    setValidationError(null)

    if (!email) {
      setValidationError('Please enter your email address.')
      return
    }

    if (!isValidEmail(email)) {
      setValidationError('Please enter a valid email address.')
      return
    }

    if (!password) {
      setValidationError('Please enter your password.')
      return
    }

    try {
      await login({ email, password, rememberMe })
      
      // Route based on role
      const normalizedEmail = email.trim().toLowerCase()
      const isAdmin = normalizedEmail === 'admin@skillpath.demo'

      if (isAdmin) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true })
      } else {
        const target = fromLocation && !fromLocation.startsWith('/admin') ? fromLocation : ROUTES.DASHBOARD
        navigate(target, { replace: true })
      }
    } catch {
      // Error handled by AuthContext
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-[#F8F7F3]">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to={ROUTES.HOME} className="inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F6B4F] rounded-lg">
            <SkillPathLogo size="md" />
          </Link>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#171918]">Welcome back</h2>
            <p className="text-xs text-[#626763] mt-1">
              Sign in to continue your personalized SkillPath journey.
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-sm">
          {(error || validationError) && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="student@skillpath.demo"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (validationError) setValidationError(null)
              }}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (validationError) setValidationError(null)
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#626763] hover:text-[#171918] focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#626763] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E5E5DF] text-[#1F6B4F] focus:ring-[#1F6B4F] h-3.5 w-3.5"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Password reset instructions will be sent to your registered email address.')}
                className="text-[#1F6B4F] hover:underline transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </Card>

        {/* Footer link */}
        <p className="text-center text-xs text-[#626763]">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-[#1F6B4F] hover:underline font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
