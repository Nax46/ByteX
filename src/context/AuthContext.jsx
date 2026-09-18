/**
 * Authentication Context for AI SkillPath
 * Provides global authentication state, session restoration, login, registration, and logout.
 */

import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getMe as apiGetMe,
  logout as apiLogout,
} from '../api/auth.js';
import { hasToken } from '../api/storage.js';

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state on application startup
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // If no token exists, do NOT make a network call to /auth/me
      if (!hasToken()) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await apiGetMe();
        if (isMounted && response?.data?.user) {
          setUser(response.data.user);
          setError(null);
        }
      } catch (err) {
        // If token is invalid or expired (401/403), clear local token state
        if (err?.status === 401 || err?.status === 403) {
          apiLogout();
          if (isMounted) {
            setUser(null);
          }
        } else {
          // Non-auth failure (e.g. network failure)
          if (isMounted) {
            setError(err?.message || 'Failed to authenticate session');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await apiLogin(credentials);
      if (response?.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (err) {
      setError(err?.message || 'Login failed');
      throw err;
    }
  }, []);

  // Registration handler
  const register = useCallback(async (credentials) => {
    setError(null);
    try {
      const response = await apiRegister(credentials);
      if (response?.data?.user) {
        setUser(response.data.user);
      }
      return response;
    } catch (err) {
      setError(err?.message || 'Registration failed');
      throw err;
    }
  }, []);

  // Logout handler
  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      error,
      login,
      register,
      logout,
    }),
    [user, loading, error, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
