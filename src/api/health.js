/**
 * Health API Service for AI SkillPath
 * Verifies backend service and database connectivity.
 */

import { apiClient } from './client.js';

/**
 * Checks backend health and database readiness status.
 * @returns {Promise<{
 *   success: boolean,
 *   message: string,
 *   data: { status: string, timestamp: string, uptime: number, environment: string }
 * }>}
 */
export const getHealth = async () => {
  return apiClient('/health', {
    method: 'GET',
  });
};
