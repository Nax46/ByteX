/**
 * ProtectedRoute Guard Component for AI SkillPath
 * Conditionally renders children if authenticated, or a fallback if unauthenticated.
 */

import { useAuth } from '../hooks/useAuth.js';

/**
 * Reusable authentication guard.
 *
 * @param {{
 *   children: any,
 *   fallback?: any,
 *   loadingFallback?: any
 * }} props
 */
export const ProtectedRoute = ({
  children,
  fallback = null,
  loadingFallback = (
    <div className="flex items-center justify-center p-8 text-slate-500 font-medium text-sm">
      Loading authentication state...
    </div>
  ),
}) => {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return loadingFallback;
  }

  if (!isAuthenticated) {
    return fallback;
  }

  return children;
};

export default ProtectedRoute;
