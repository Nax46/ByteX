import { Request, Response, NextFunction } from 'express';
import { getStudentSkillGapPriority, ReadoutError } from '../services/skillGapPriorityReadoutService';
import { sendSuccess, sendError } from '../utils/api-response';

/**
 * Express Controller: Handles GET request for student skill gap and priority analysis.
 * Enforces authentication and student ownership.
 */
export const getSkillGapPriorityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const snapshots = await getStudentSkillGapPriority(req.user.userId);

    sendSuccess(
      res,
      { snapshots },
      'Skill gap and priority analysis retrieved successfully',
      200
    );
  } catch (error) {
    if (error instanceof ReadoutError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
