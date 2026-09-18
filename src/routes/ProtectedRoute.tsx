import React, { useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { LoadingState } from '@/components/common/LoadingState'
import { ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: ('student' | 'admin' | 'mentor')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, login } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSwitching, setIsSwitching] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F3]">
        <LoadingState message="Verifying session..." minHeight="min-h-[300px]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // Role validation
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'student'
    if (!allowedRoles.includes(userRole)) {
      // If student is trying to access admin area:
      if (location.pathname.startsWith('/admin')) {
        const handleSwitchToAdmin = async () => {
          try {
            setIsSwitching(true)
            await login({ email: 'admin@skillpath.demo', password: 'Admin@123' })
            navigate(location.pathname || ROUTES.ADMIN_DASHBOARD, { replace: true })
          } catch (err) {
            console.error('Failed to switch to admin demo:', err)
          } finally {
            setIsSwitching(false)
          }
        }

        return (
          <div className="min-h-screen flex items-center justify-center bg-[#F8F7F3] p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-[#E5E5DF] shadow-md p-6 sm:p-8 text-center animate-fadeIn">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#1F6B4F]/10 border border-[#1F6B4F]/20 flex items-center justify-center text-[#1F6B4F] mb-4">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <h2 className="font-heading text-xl font-bold text-[#171918]">
                Admin Portal Access
              </h2>
              <p className="text-xs text-[#626763] mt-2 leading-relaxed">
                You are currently signed in as <strong className="text-[#171918]">{user?.name || 'Student'}</strong> ({user?.email}). The Admin Panel is restricted to administrators.
              </p>

              <div className="mt-5 p-3.5 rounded-xl bg-[#F8F7F3] border border-[#E5E5DF] text-left text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[#171918] font-medium">
                  <span>Demo Admin Persona</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1F6B4F]/10 text-[#1F6B4F] font-semibold uppercase">
                    Ready
                  </span>
                </div>
                <div className="text-[11px] text-[#626763] flex items-center justify-between">
                  <span>Email:</span>
                  <code className="font-mono text-[#171918] font-medium">admin@skillpath.demo</code>
                </div>
                <div className="text-[11px] text-[#626763] flex items-center justify-between">
                  <span>Role:</span>
                  <span className="text-[#171918] font-medium">Curriculum Administrator</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  isLoading={isSwitching}
                  onClick={handleSwitchToAdmin}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Switch to Admin Demo Account
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back to Student Dashboard
                </Button>
              </div>
            </div>
          </div>
        )
      }

      // If user is admin trying to access student-only area (if any):
      if (userRole === 'admin') {
        return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
      }
      return <Navigate to={ROUTES.DASHBOARD} replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}
