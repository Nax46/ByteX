import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { isValidEmail } from '@/utils/validation'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError(null)

    if (!name.trim()) {
      setValidationError('Please enter your full name.')
      return
    }

    if (!email || !isValidEmail(email)) {
      setValidationError('Please enter a valid email address.')
      return
    }

    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.')
      return
    }

    try {
      await register({ name, email, password, confirmPassword })
      navigate(ROUTES.ONBOARDING)
    } catch {
      // Handled by AuthContext
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#F8F7F3]">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        <div className="text-center space-y-3">
          <Link to={ROUTES.HOME} className="inline-flex items-center justify-center">
            <SkillPathLogo size="md" />
          </Link>
          <div>
            <h2 className="font-heading text-2xl font-bold tracking-tight text-[#171918]">Create your account</h2>
            <p className="text-xs text-[#626763] mt-1">
              Start assessing your current skills and build your personalized path
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
              id="register-name"
              label="Full Name"
              type="text"
              placeholder="Alex Patel"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (validationError) setValidationError(null)
              }}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="name"
              required
            />

            <Input
              id="register-email"
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
              id="register-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
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
              autoComplete="new-password"
              required
            />

            <Input
              id="register-confirm-password"
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                if (validationError) setValidationError(null)
              }}
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-3"
              isLoading={isLoading}
            >
              Get Started
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-[#626763]">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[#1F6B4F] hover:underline font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
