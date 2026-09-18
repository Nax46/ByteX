import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import { LoadingState } from '@/components/common/LoadingState'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: ('student' | 'admin' | 'mentor')[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

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
      // Role unauthorized: redirect to respective user area
      if (userRole === 'admin') {
        return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />
      }
      return <Navigate to={ROUTES.DASHBOARD} replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}
