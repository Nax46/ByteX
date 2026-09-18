import { Request, Response, NextFunction } from 'express';
import { generateRoadmapForStudent, RoadmapGenerationError } from '../services/roadmapGenerationService.js';
import { getOrCreateRoadmapProgress } from '../services/roadmapProgressService.js';
import { RoadmapModel } from '../models/Roadmap.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

/**
 * Controller: GET /api/v1/intelligence/roadmap/current (or /api/roadmap)
 * Retrieves student's active baseline/adaptive roadmap.
 * Automatically generates baseline V1 roadmap if none exists for target career.
 */
export const getCurrentRoadmapHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const profile = await StudentProfile.findOne({
      $or: [{ userId: req.user.userId }, { _id: req.user.userId }],
    }).lean();

    if (!profile) {
      sendError(res, 'Student profile not found', [], 404);
      return;
    }

    let roadmap = await RoadmapModel.findOne({
      studentProfileId: profile._id,
      isCurrent: true,
    }).lean();

    if (!roadmap) {
      // Auto-generate initial V1 roadmap if target career set
      const generated = await generateRoadmapForStudent(profile._id.toString());
      await getOrCreateRoadmapProgress(generated._id.toString(), profile._id.toString());
      roadmap = generated.toObject ? generated.toObject() : generated;
    }

    sendSuccess(res, { roadmap }, 'Current active roadmap retrieved successfully', 200);
  } catch (error) {
    if (error instanceof RoadmapGenerationError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Controller: POST /api/v1/intelligence/roadmap/generate
 * Generates a new baseline roadmap for student's target career.
 */
export const generateRoadmapHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const { careerId } = req.body;
    const roadmap = await generateRoadmapForStudent(req.user.userId, careerId);

    // Initialize progress for new roadmap
    await getOrCreateRoadmapProgress(roadmap._id.toString(), req.user.userId);

    sendSuccess(res, { roadmap }, 'Roadmap generated successfully', 201);
  } catch (error) {
    if (error instanceof RoadmapGenerationError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
