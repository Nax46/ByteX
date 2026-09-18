import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SkillPathLogo } from '@/components/ui/SkillPathLogo'
import { isValidEmail } from '@/utils/validation'
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'

export const AdminLoginPage: React.FC = () => {
  const { login, logout, isLoading, error, clearError } = useAuth()
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
      setValidationError('Please enter your administrator email.')
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

      // Check role assignment
      const normalizedEmail = email.trim().toLowerCase()
      const isAdminEmail = normalizedEmail === 'admin@skillpath.demo'

      if (isAdminEmail) {
        const target = fromLocation && fromLocation.startsWith('/admin') ? fromLocation : ROUTES.ADMIN_DASHBOARD
        navigate(target, { replace: true })
      } else {
        // Log out immediately if a non-admin signed in here
        logout()
        setValidationError('Access Denied: This account does not have administrative privileges.')
      }
    } catch {
      // Error is set in AuthContext state
    }
  }

  const handleApplyAdminDemo = () => {
    setEmail('admin@skillpath.demo')
    setPassword('Admin@123')
    clearError?.()
    setValidationError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#F8F7F3]">
      <div className="w-full max-w-md space-y-6 animate-fadeIn">
        {/* Header Security Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white border border-[#E5E5DF] shadow-2xs mb-1">
            <SkillPathLogo size="md" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1F6B4F]/10 border border-[#1F6B4F]/20 text-[#1F6B4F] text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Console • Restricted Access</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-[#171918]">
              Administrator Sign In
            </h1>
            <p className="text-xs text-[#626763] mt-1.5 max-w-sm mx-auto leading-relaxed">
              Authenticate with your institutional administrator credentials to manage cohorts, curriculum, and diagnostic assessments.
            </p>
          </div>
        </div>

        {/* Main Admin Login Card */}
        <Card className="p-6 sm:p-8 bg-white border-[#E5E5DF] shadow-sm">
          {(error || validationError) && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold">Authentication Failed</p>
                <p className="mt-0.5">{validationError || error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="admin-login-email"
              label="Admin Email"
              type="email"
              placeholder="admin@skillpath.demo"
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
              id="admin-login-password"
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
                <span>Keep me signed in</span>
              </label>

              <span className="text-[11px] text-[#8E948F]">
                Session duration: 24h
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2 justify-center"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Admin Console
            </Button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-6 border-t border-[#E5E5DF] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#171918]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F6B4F]" />
                <span>Demo Admin Persona</span>
              </div>
              <Badge variant="outline" size="sm" className="text-[10px] bg-[#D8E8DE]/40 text-[#1F6B4F] border-[#D8E8DE]">
                Role: Administrator
              </Badge>
            </div>

            <div className="p-3 rounded-lg border border-[#E5E5DF] bg-[#F8F7F3]/80 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#171918] truncate">Curriculum Administrator</p>
                <p className="text-[11px] text-[#626763] font-mono truncate">admin@skillpath.demo</p>
              </div>
              <button
                type="button"
                onClick={handleApplyAdminDemo}
                className="shrink-0 py-1.5 px-3 text-xs font-semibold text-[#1F6B4F] bg-white border border-[#D8E8DE] rounded-md hover:bg-[#D8E8DE]/40 transition-colors cursor-pointer shadow-2xs"
              >
                Autofill Admin Demo
              </button>
            </div>
          </div>
        </Card>

        {/* Footer link to return to main website */}
        <div className="text-center">
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center gap-1.5 text-xs text-[#626763] hover:text-[#171918] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to SkillPath Learner Platform</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage
