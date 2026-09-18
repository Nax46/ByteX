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

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

export const RegisterPage: React.FC = () => {
  const { register, isLoading, error, clearError } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formWarning, setFormWarning] = useState<string | null>(null)

  const validate = (): { errors: FieldErrors; emptyFields: string[] } => {
    const errors: FieldErrors = {}
    const emptyFields: string[] = []

    if (!name.trim()) {
      errors.name = 'Full name is required.'
      emptyFields.push('Full Name')
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.'
      emptyFields.push('Email Address')
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address.'
    }

    if (!password) {
      errors.password = 'Password is required.'
      emptyFields.push('Password')
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.'
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.'
      emptyFields.push('Confirm Password')
    } else if (password && confirmPassword && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    }

    return { errors, emptyFields }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError?.()
    setFormWarning(null)

    const { errors, emptyFields } = validate()
    setFieldErrors(errors)

    if (emptyFields.length > 0) {
      setFormWarning(`All fields are required. Please fill in: ${emptyFields.join(', ')}.`)
      return
    }

    if (Object.keys(errors).length > 0) {
      setFormWarning('Please fix the highlighted errors before proceeding.')
      return
    }

    try {
      await register({ name, email, password, confirmPassword })
      navigate(ROUTES.ONBOARDING)
    } catch {
      // Handled by AuthContext
    }
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (fieldErrors.name) {
      setFieldErrors((prev) => ({ ...prev, name: undefined }))
    }
    if (formWarning) setFormWarning(null)
  }

  const handleEmailChange = (val: string) => {
    setEmail(val)
    if (fieldErrors.email) {
      setFieldErrors((prev) => ({ ...prev, email: undefined }))
    }
    if (formWarning) setFormWarning(null)
  }

  const handlePasswordChange = (val: string) => {
    setPassword(val)
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }))
    }
    if (confirmPassword && val !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }))
    } else if (confirmPassword && val === confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
    if (formWarning) setFormWarning(null)
  }

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val)
    if (fieldErrors.confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }))
    }
    if (password && val && password !== val) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }))
    }
    if (formWarning) setFormWarning(null)
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
          {(error || formWarning) && (
            <div className="mb-5 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-800 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold">{error ? 'Registration Failed' : 'Action Required'}</p>
                <p className="mt-0.5">{formWarning || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              id="register-name"
              label="Full Name *"
              type="text"
              placeholder="e.g. Alex Patel"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              error={fieldErrors.name}
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="name"
              required
            />

            <Input
              id="register-email"
              label="Email Address *"
              type="email"
              placeholder="student@skillpath.demo"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              error={fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              required
            />

            <Input
              id="register-password"
              label="Password *"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              error={fieldErrors.password}
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
              autoComplete="new-password"
              required
            />

            <Input
              id="register-confirm-password"
              label="Confirm Password *"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              error={fieldErrors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="p-1 text-[#626763] hover:text-[#171918] focus:outline-none cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
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
