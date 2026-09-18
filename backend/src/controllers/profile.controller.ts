import { Request, Response, NextFunction } from 'express';
import {
  getProfile as fetchProfile,
  createOnboardingProfile,
  updateProfile as modifyProfile,
  ProfileError,
} from '../services/profile.service';
import { sendSuccess, sendError } from '../utils/api-response';

/**
 * Retrieves the authenticated student's profile.
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const profile = await fetchProfile(req.user.userId);
    sendSuccess(res, { profile }, 'Profile retrieved successfully', 200);
  } catch (error) {
    if (error instanceof ProfileError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Completes student onboarding by creating their initial profile.
 */
export const onboarding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const profile = await createOnboardingProfile(req.user.userId, req.body);
    sendSuccess(res, { profile }, 'Onboarding completed successfully', 201);
  } catch (error) {
    if (error instanceof ProfileError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};

/**
 * Updates the authenticated student's profile.
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.userId) {
      sendError(res, 'Authentication required: User identity missing', [], 401);
      return;
    }

    const profile = await modifyProfile(req.user.userId, req.body);
    sendSuccess(res, { profile }, 'Profile updated successfully', 200);
  } catch (error) {
    if (error instanceof ProfileError) {
      sendError(res, error.message, [], error.statusCode);
      return;
    }
    next(error);
  }
};
