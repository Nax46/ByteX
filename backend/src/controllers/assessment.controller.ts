import { Request, Response, NextFunction } from 'express';
import {
  startAssessment,
  submitAssessment,
  getAttemptById,
  getAssessmentHistory,
  AssessmentError,
} from '../services/assessment.service';
import { sendSuccess, sendError } from '../utils/api-response';

/**
 * Starts a new assessment attempt or resumes an existing IN_PROGRESS attempt.
 */
export const startAssessmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const { attempt, isExisting } = await startAssessment(req.user.userId);

    const statusCode = isExisting ? 200 : 201;
    const message = isExisting
      ? 'Active assessment attempt already in progress'
      : 'Assessment attempt started successfully';

    sendSuccess(res, { attempt, isExisting }, message, statusCode);
  } catch (error) {
    if (error instanceof AssessmentError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Submits an active IN_PROGRESS assessment attempt.
 */
export const submitAssessmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const attemptId = String(req.params.attemptId);
    const attempt = await submitAssessment(attemptId, req.user.userId);

    sendSuccess(res, { attempt }, 'Assessment submitted successfully', 200);
  } catch (error) {
    if (error instanceof AssessmentError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Retrieves a specific assessment attempt by ID.
 */
export const getAttemptHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const attemptId = String(req.params.attemptId);
    const attempt = await getAttemptById(attemptId, req.user.userId);

    sendSuccess(res, { attempt }, 'Assessment attempt retrieved successfully', 200);
  } catch (error) {
    if (error instanceof AssessmentError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Retrieves assessment attempt history for the authenticated student.
 */
export const getHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const historyQuery = res.locals.historyQuery || {};
    const page = typeof historyQuery.page === 'number' ? historyQuery.page : (Number(req.query.page) || 1);
    const limit = typeof historyQuery.limit === 'number' ? historyQuery.limit : (Number(req.query.limit) || 10);

    const history = await getAssessmentHistory(req.user.userId, page, limit);

    sendSuccess(res, history, 'Assessment history retrieved successfully', 200);
  } catch (error) {
    if (error instanceof AssessmentError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
