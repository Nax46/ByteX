import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  AuthError,
} from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/api-response';

/**
 * Handles user registration request.
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (error) {
    if (error instanceof AuthError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Handles user login request.
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    sendSuccess(res, result, 'Login successful', 200);
  } catch (error) {
    if (error instanceof AuthError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Handles current authenticated user profile retrieval.
 */
export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User context missing', [], 401);
      return;
    }

    const user = await getCurrentUser(req.user.userId);
    sendSuccess(res, { user }, 'Success', 200);
  } catch (error) {
    if (error instanceof AuthError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
