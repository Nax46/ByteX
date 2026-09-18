import { Request, Response, NextFunction } from 'express';
import {
  getRoadmapProgressSummary,
  startModuleProgress,
  updateModuleProgress,
  completeModuleProgress,
} from '../services/roadmapProgressService.js';
import { RoadmapProgressError } from '../types/progress.js';
import { updateModuleProgressZodSchema } from '../schemas/progressValidation.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

const resolveSingleString = (val: unknown): string | undefined => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
};

/**
 * Controller: GET roadmap progress for current active roadmap (or specific roadmapId via query/params).
 */
export const getRoadmapProgressHandler = async (
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

    const roadmapId = resolveSingleString(req.params.roadmapId || req.query.roadmapId);

    const progress = await getRoadmapProgressSummary(roadmapId, userId);

    sendSuccess(res, { progress }, 'Roadmap progress retrieved successfully', 200);
  } catch (error) {
    if (error instanceof RoadmapProgressError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: POST start module progress (LOCKED -> IN_PROGRESS).
 */
export const startModuleProgressHandler = async (
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

    const moduleId = resolveSingleString(req.params.moduleId) || '';
    const roadmapId = resolveSingleString(
      req.body?.roadmapId || req.query?.roadmapId || req.params?.roadmapId
    );

    const progress = await startModuleProgress(roadmapId, moduleId, userId);

    sendSuccess(res, { progress }, `Module '${moduleId}' started successfully`, 200);
  } catch (error) {
    if (error instanceof RoadmapProgressError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: PATCH update module progress percentage (0-100%).
 */
export const updateModuleProgressHandler = async (
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

    const parseResult = updateModuleProgressZodSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issueMsgs = parseResult.error.issues.map((i) => i.message);
      sendError(res, `Validation error: ${issueMsgs.join(', ')}`, issueMsgs, 400);
      return;
    }

    const moduleId = resolveSingleString(req.params.moduleId) || '';
    const roadmapId = resolveSingleString(
      req.body?.roadmapId || req.query?.roadmapId || req.params?.roadmapId
    );
    const { progressPercent } = parseResult.data;

    const progress = await updateModuleProgress(roadmapId, moduleId, progressPercent, userId);

    sendSuccess(res, { progress }, `Module '${moduleId}' progress updated to ${progressPercent}%`, 200);
  } catch (error) {
    if (error instanceof RoadmapProgressError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: POST complete module progress (status = COMPLETED, progressPercent = 100).
 */
export const completeModuleProgressHandler = async (
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

    const moduleId = resolveSingleString(req.params.moduleId) || '';
    const roadmapId = resolveSingleString(
      req.body?.roadmapId || req.query?.roadmapId || req.params?.roadmapId
    );

    const progress = await completeModuleProgress(roadmapId, moduleId, userId);

    sendSuccess(res, { progress }, `Module '${moduleId}' completed successfully`, 200);
  } catch (error) {
    if (error instanceof RoadmapProgressError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
