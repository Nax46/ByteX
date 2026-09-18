/**
 * Student Profile & Onboarding API Service for AI SkillPath
 * Manages student onboarding and profile retrieval/updating.
 */

import { apiClient } from './client.js';

/**
 * Retrieves the authenticated student's profile.
 * @returns {Promise<{ success: boolean, message: string, data: { profile: object } }>}
 */
export const getProfile = async () => {
  return apiClient('/profile', {
    method: 'GET',
  });
};

/**
 * Completes student onboarding by creating the initial profile.
 * @param {{
 *   fullName: string,
 *   education?: string,
 *   college?: string,
 *   semester?: number,
 *   interests?: string[],
 *   targetCareer?: string
 * }} payload
 * @returns {Promise<{ success: boolean, message: string, data: { profile: object } }>}
 */
export const completeOnboarding = async (payload) => {
  return apiClient('/profile/onboarding', {
    method: 'POST',
    body: payload,
  });
};

/**
 * Updates the authenticated student's existing profile.
 * @param {{
 *   fullName?: string,
 *   education?: string,
 *   college?: string,
 *   semester?: number,
 *   interests?: string[],
 *   targetCareer?: string
 * }} payload
 * @returns {Promise<{ success: boolean, message: string, data: { profile: object } }>}
 */
export const updateProfile = async (payload) => {
  return apiClient('/profile', {
    method: 'PUT',
    body: payload,
  });
};
