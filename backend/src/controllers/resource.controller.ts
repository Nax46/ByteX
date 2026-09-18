import { Request, Response, NextFunction } from 'express';
import {
  getAllResources,
  getResourceById,
  getRecommendedResourcesForStudent,
} from '../services/resourceRecommendationService.js';
import { ReadoutError } from '../services/skillGapPriorityReadoutService.js';
import { ResourceQueryZodSchema } from '../schemas/intelligenceValidation.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

/**
 * Controller: Get all resources from catalog (with optional filters).
 */
export const getResourcesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = ResourceQueryZodSchema.safeParse(req.query);
    if (!parseResult.success) {
      sendError(
        res,
        'Invalid resource query parameters',
        parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        400
      );
      return;
    }

    const resources = await getAllResources(parseResult.data);
    sendSuccess(res, { resources }, 'Resources retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get a specific resource by ID.
 */
export const getResourceByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const resourceId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!resourceId || !/^[0-9a-fA-F]{24}$/.test(resourceId)) {
      sendError(res, 'Invalid resource ID format', [], 400);
      return;
    }

    const resource = await getResourceById(resourceId);
    if (!resource) {
      sendError(res, 'Resource not found', [], 404);
      return;
    }

    sendSuccess(res, { resource }, 'Resource retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get personalized learning resource recommendations for current student.
 */
export const getRecommendedResourcesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const recommendations = await getRecommendedResourcesForStudent(req.user.userId);
    sendSuccess(res, { recommendations }, 'Recommended resources retrieved successfully', 200);
  } catch (error) {
    if (error instanceof ReadoutError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
