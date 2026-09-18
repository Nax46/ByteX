import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/api-response';

/**
 * Middleware to protect routes by verifying Bearer JWT and attaching req.user.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // 1. Verify Authorization header presence
  if (!authHeader) {
    sendError(res, 'Authentication required: No token provided', [], 401);
    return;
  }

  // 2. Validate Bearer token format: "Bearer <token>"
  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    sendError(res, 'Authentication required: Malformed authorization header', [], 401);
    return;
  }

  const token = parts[1];

  // 3. Verify token and attach user context to request
  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };
    next();
  } catch (error) {
    const message =
      error instanceof Error && error.message === 'Token has expired'
        ? 'Authentication failed: Token has expired'
        : 'Authentication failed: Invalid or malformed token';

    sendError(res, message, [], 401);
  }
};

// Alias export for flexibility
export const protect = requireAuth;
export default requireAuth;
