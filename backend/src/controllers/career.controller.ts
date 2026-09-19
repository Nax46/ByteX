import { Request, Response, NextFunction } from 'express';
import {
  getCareersListService,
  getCareerDetailsService,
  getCareerSkillsService,
  getStudentCareerReadinessService,
  CareerServiceError,
} from '../services/career.service.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

/**
 * Controller: Handles GET request to list all careers from MongoDB.
 */
export const getCareersHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const careers = await getCareersListService();
    sendSuccess(res, { careers, total: careers.length }, 'Career catalog retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Handles GET request for career details by ID or slug.
 */
export const getCareerDetailsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const careerIdOrSlug = Array.isArray(req.params.careerId) ? req.params.careerId[0] : (req.params.careerId as string);
    if (!careerIdOrSlug) {
      sendError(res, 'Career ID or slug is required', [], 400);
      return;
    }

    const details = await getCareerDetailsService(careerIdOrSlug);
    sendSuccess(res, details, 'Career details retrieved successfully', 200);
  } catch (error) {
    if (error instanceof CareerServiceError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: Handles GET request for career skills by ID or slug.
 */
export const getCareerSkillsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const careerIdOrSlug = Array.isArray(req.params.careerId) ? req.params.careerId[0] : (req.params.careerId as string);
    if (!careerIdOrSlug) {
      sendError(res, 'Career ID or slug is required', [], 400);
      return;
    }

    const skillsData = await getCareerSkillsService(careerIdOrSlug);
    sendSuccess(res, skillsData, 'Career skills retrieved successfully', 200);
  } catch (error) {
    if (error instanceof CareerServiceError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: Handles GET request for student-specific career readiness.
 * Requires authentication.
 */
export const getStudentCareerReadinessHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const careerIdOrSlug = Array.isArray(req.params.careerId) ? req.params.careerId[0] : (req.params.careerId as string);
    if (!careerIdOrSlug) {
      sendError(res, 'Career ID or slug is required', [], 400);
      return;
    }

    const readiness = await getStudentCareerReadinessService(req.user.userId, careerIdOrSlug);
    sendSuccess(res, readiness, 'Student career readiness retrieved successfully', 200);
  } catch (error) {
    if (error instanceof CareerServiceError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
