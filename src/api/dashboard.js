/**
 * Dashboard Aggregation API Service for AI SkillPath
 * Manages aggregated dashboard summary retrieval.
 */

import { apiClient } from './client.js';

/**
 * Retrieves the aggregated student dashboard summary.
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: {
 *     profile: { completed: boolean, fullName?: string, targetCareer?: string },
 *     onboarding: { completed: boolean },
 *     assessment: { hasActiveAttempt: boolean, latestAttempt: object | null }
 *   }
 * }>}
 */
export const getDashboard = async () => {
  return apiClient('/dashboard', {
    method: 'GET',
  });
};
