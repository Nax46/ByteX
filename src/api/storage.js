/**
 * Token Storage Utility for AI SkillPath
 * Manages JWT authentication token persistence in browser storage.
 */

const TOKEN_KEY = 'ai_skillpath_token';
let memoryToken = null;

/**
 * Retrieves the stored JWT authentication token.
 * @returns {string | null} The token or null if not found.
 */
export const getToken = () => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(TOKEN_KEY);
      if (stored) return stored;
    }
  } catch {
    // Gracefully handle environments where storage access is restricted
  }
  return memoryToken;
};

/**
 * Stores the JWT authentication token.
 * @param {string} token - The JWT token to persist.
 */
export const setToken = (token) => {
  memoryToken = token || null;
  try {
    if (typeof window !== 'undefined' && window.localStorage && token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    }
  } catch {
    // Gracefully handle storage errors
  }
};

/**
 * Removes the stored JWT authentication token.
 */
export const removeToken = () => {
  memoryToken = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // Gracefully handle storage errors
  }
};

/**
 * Checks whether an authentication token currently exists.
 * @returns {boolean} True if token exists.
 */
export const hasToken = () => {
  return !!getToken();
};
