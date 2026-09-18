import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/api-response';

const router = Router();

/**
 * Health check endpoint to verify backend service status.
 */
router.get('/health', (_req: Request, res: Response) => {
  return sendSuccess(res, { status: 'ok' }, 'Success');
});

export default router;
