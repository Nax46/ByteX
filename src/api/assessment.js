/**
 * Assessment API Service for AI SkillPath
 * Manages assessment attempt lifecycle: starting, submitting, retrieving, and history.
 */

import { apiClient } from './client.js';

/**
 * Starts a new assessment attempt or resumes an existing active attempt.
 * @returns {Promise<{ success: boolean, message: string, data: { attempt: object, isExisting: boolean } }>}
 */
export const startAssessment = async () => {
  return apiClient('/assessment/start', {
    method: 'POST',
  });
};

/**
 * Submits an in-progress assessment attempt.
 * @param {string} attemptId - The 24-character hexadecimal assessment attempt ID.
 * @returns {Promise<{ success: boolean, message: string, data: { attempt: object } }>}
 */
export const submitAssessment = async (attemptId) => {
  if (!attemptId) {
    throw new Error('Attempt ID is required to submit an assessment');
  }
  return apiClient(`/assessment/${encodeURIComponent(attemptId)}/submit`, {
    method: 'POST',
  });
};

/**
 * Retrieves a specific assessment attempt by ID.
 * @param {string} attemptId - The 24-character hexadecimal assessment attempt ID.
 * @returns {Promise<{ success: boolean, message: string, data: { attempt: object } }>}
 */
export const getAssessmentAttempt = async (attemptId) => {
  if (!attemptId) {
    throw new Error('Attempt ID is required to retrieve an assessment attempt');
  }
  return apiClient(`/assessment/${encodeURIComponent(attemptId)}`, {
    method: 'GET',
  });
};

/**
 * Retrieves the authenticated student's assessment attempt history.
 * @param {{ page?: number, limit?: number }} [params={}] - Optional pagination parameters.
 * @returns {Promise<{ success: boolean, message: string, data: { attempts: object[], pagination: object } }>}
 */
export const getAssessmentHistory = async (params = {}) => {
  return apiClient('/assessment/history', {
    method: 'GET',
    params,
  });
};
