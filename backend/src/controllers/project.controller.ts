import { Request, Response, NextFunction } from 'express';
import {
  getAllProjects,
  getProjectById,
  getRecommendedProjectsForStudent,
} from '../services/projectRecommendationService.js';
import { ReadoutError } from '../services/skillGapPriorityReadoutService.js';
import { ProjectQueryZodSchema } from '../schemas/intelligenceValidation.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

/**
 * Controller: Get all projects from catalog (with optional filters).
 */
export const getProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parseResult = ProjectQueryZodSchema.safeParse(req.query);
    if (!parseResult.success) {
      sendError(
        res,
        'Invalid project query parameters',
        parseResult.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
        400
      );
      return;
    }

    const projects = await getAllProjects(parseResult.data);
    sendSuccess(res, { projects }, 'Projects retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get a specific project by ID.
 */
export const getProjectByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawId = req.params.id;
    const projectId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!projectId || !/^[0-9a-fA-F]{24}$/.test(projectId)) {
      sendError(res, 'Invalid project ID format', [], 400);
      return;
    }

    const project = await getProjectById(projectId);
    if (!project) {
      sendError(res, 'Project not found', [], 404);
      return;
    }

    sendSuccess(res, { project }, 'Project retrieved successfully', 200);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get personalized practical project recommendations for current student.
 */
export const getRecommendedProjectsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const recommendations = await getRecommendedProjectsForStudent(req.user.userId);
    sendSuccess(res, { recommendations }, 'Recommended projects retrieved successfully', 200);
  } catch (error) {
    if (error instanceof ReadoutError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
