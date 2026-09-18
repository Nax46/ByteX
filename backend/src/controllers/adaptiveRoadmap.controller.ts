import { Request, Response, NextFunction } from 'express';
import { generateAdaptiveRoadmapForStudent } from '../services/adaptiveRoadmapService.js';
import { RoadmapGenerationError } from '../services/roadmapGenerationService.js';
import { sendSuccess, sendError } from '../utils/api-response.js';

const resolveSingleString = (val: unknown): string | undefined => {
  if (typeof val === 'string') return val;
  if (Array.isArray(val) && typeof val[0] === 'string') return val[0];
  return undefined;
};

/**
 * Controller: POST /api/v1/intelligence/roadmap/adaptive
 * Generates an adaptive roadmap version (V2, V3...) derived from latest reassessment evidence.
 */
export const generateAdaptiveRoadmapHandler = async (
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

    const targetCareerId = resolveSingleString(req.body?.careerId || req.query?.careerId);
    const force = req.body?.force === true || req.query?.force === 'true';

    const roadmap = await generateAdaptiveRoadmapForStudent(userId, targetCareerId, { force });

    sendSuccess(
      res,
      { roadmap },
      `Adaptive roadmap V${roadmap.version} generated successfully`,
      roadmap.version === 1 ? 201 : 200
    );
  } catch (error) {
    if (error instanceof RoadmapGenerationError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
