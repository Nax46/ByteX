import { Request, Response } from 'express';
import { sendError } from '../utils/api-response';

/**
 * 404 handler for undefined routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.method} ${req.originalUrl} not found`, [], 404);
};

export default notFoundHandler;
