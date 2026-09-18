import { Request, Response, NextFunction } from 'express';
import { getDashboardSummary, DashboardError } from '../services/dashboard.service';
import { sendSuccess, sendError } from '../utils/api-response';

/**
 * Retrieves the aggregated dashboard summary for the authenticated user.
 */
export const getDashboardHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const dashboard = await getDashboardSummary(req.user.userId);
    sendSuccess(res, dashboard, 'Dashboard fetched successfully', 200);
  } catch (error) {
    if (error instanceof DashboardError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
