import { Request, Response, NextFunction } from 'express';
import {
  getReassessmentSummary,
  createReassessmentAttempt,
} from '../services/reassessmentService.js';
import { ReassessmentError } from '../types/reassessment.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

const resolveSingleString = (val: unknown): string | undefined => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
};

/**
 * Controller: GET comparative reassessment summary for authenticated student.
 */
export const getReassessmentSummaryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const assessmentId = resolveSingleString(req.query.assessmentId || req.params.assessmentId);

    const summary = await getReassessmentSummary(userId, assessmentId);

    sendSuccess(res, { summary }, 'Reassessment summary retrieved successfully', 200);
  } catch (error) {
    if (error instanceof ReassessmentError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: POST submit reassessment attempt.
 */
export const submitReassessmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const assessmentId = resolveSingleString(req.params.assessmentId || req.body?.assessmentId);
    if (!assessmentId) {
      sendError(res, 'Assessment ID is required', [], 400);
      return;
    }

    const answers = req.body?.answers;
    if (!answers || !Array.isArray(answers)) {
      sendError(res, 'Answers array is required', [], 400);
      return;
    }

    const attempt = await createReassessmentAttempt(userId, assessmentId, answers);

    sendSuccess(res, { attempt }, 'Reassessment submitted and evaluated successfully', 201);
  } catch (error) {
    if (error instanceof ReassessmentError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
