import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { isValidEmail } from '@/utils/validation'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'

export const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError, isMockMode } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname || ROUTES.DASHBOARD

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
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
      navigate(fromLocation, { replace: true })
    } catch {
      // Error handled by AuthContext
    }
  }

  // Quick Demo Login helper for hackathon judges & testers
  const handleQuickDemoLogin = async () => {
    setEmail('alex.patel@student.edu')
    setPassword('demoPassword123')
    await login({
      email: 'alex.patel@student.edu',
      password: 'demoPassword123',
      rememberMe: true,
    })
    navigate(fromLocation, { replace: true })
  }

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-12 bg-[#F8F7F3]">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        <div className="text-center space-y-3">
          <Link to={ROUTES.HOME} className="inline-flex items-center justify-center">
            <SkillPathLogo size="md" />
          </Link>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#171918]">Welcome back</h2>
            <p className="text-xs text-[#626763] mt-1">
              Sign in to continue your personalized learning roadmap
            </p>
          </div>
        </div>

        <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-sm">
          {(error || validationError) && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              placeholder="alex.patel@student.edu"
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
                  className="p-1 text-[#626763] hover:text-[#171918] focus:outline-none"
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
                onClick={() => alert('Password reset will be sent to your registered academic email.')}
                className="text-[#1F6B4F] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
              disabled={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Switcher */}
          <div className="mt-6 pt-5 border-t border-[#E5E5DF]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickDemoLogin}
              className="w-full text-xs text-[#1F6B4F] border-[#1F6B4F]/40 hover:bg-[#D8E8DE]/40"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Quick Demo Login (Alex Patel)
            </Button>
            {isMockMode && (
              <p className="text-[11px] text-[#626763] text-center mt-2">
                Running in client evaluation mode.
              </p>
            )}
          </div>
        </Card>

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
