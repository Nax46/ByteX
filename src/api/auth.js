/**
 * Authentication API Service for AI SkillPath
 * Manages user registration, login, session inspection, and logout.
 */

import { apiClient } from './client.js';
import { setToken, removeToken } from './storage.js';

/**
 * Registers a new student account and persists the resulting JWT token.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, message: string, data: { user: object, token: string } }>}
 */
export const register = async ({ email, password }) => {
  const response = await apiClient('/auth/register', {
    method: 'POST',
    body: { email, password },
  });

  if (response?.data?.token) {
    setToken(response.data.token);
  }

  return response;
};

/**
 * Logs in an existing student and persists the resulting JWT token.
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ success: boolean, message: string, data: { user: object, token: string } }>}
 */
export const login = async ({ email, password }) => {
  const response = await apiClient('/auth/login', {
    method: 'POST',
    body: { email, password },
  });

  if (response?.data?.token) {
    setToken(response.data.token);
  }

  return response;
};

/**
 * Retrieves the currently authenticated user's profile and credentials information.
 * @returns {Promise<{ success: boolean, message: string, data: { user: object } }>}
 */
export const getMe = async () => {
  return apiClient('/auth/me', {
    method: 'GET',
  });
};

/**
 * Clears the authenticated session locally.
 */
export const logout = () => {
  removeToken();
};
