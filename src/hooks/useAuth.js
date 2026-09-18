/**
 * useAuth Hook for AI SkillPath
 * Provides easy access to authentication state and actions from AuthContext.
 */

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Accesses authentication context.
 * @returns {{
 *   user: { id: string, email: string, role: string, createdAt: string } | null,
 *   loading: boolean,
 *   isAuthenticated: boolean,
 *   error: string | null,
 *   login: (credentials: { email: string, password: string }) => Promise<any>,
 *   register: (credentials: { email: string, password: string }) => Promise<any>,
 *   logout: () => void,
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
