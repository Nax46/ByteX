import { Types } from 'mongoose';
import {
  AssessmentAttempt,
  IAssessmentAttemptDocument,
  AssessmentStatus,
  IAssessmentAttempt,
} from '../models/AssessmentAttempt';

export class AssessmentError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AssessmentError';
    this.statusCode = statusCode;
  }
}

export interface SafeAssessmentAttempt {
  id: string;
  userId: string;
  status: AssessmentStatus;
  startedAt: Date;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentHistoryResult {
  attempts: SafeAssessmentAttempt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Formats an AssessmentAttempt document into a clean, safe DTO.
 */
export const formatSafeAttempt = (
  attempt: IAssessmentAttemptDocument | (IAssessmentAttempt & { _id: Types.ObjectId })
): SafeAssessmentAttempt => {
  return {
    id: attempt._id.toString(),
    userId: attempt.userId.toString(),
    status: attempt.status,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt || null,
    createdAt: attempt.createdAt || new Date(),
    updatedAt: attempt.updatedAt || new Date(),
  };
};

/**
 * Starts a new assessment attempt for the authenticated user.
 * If an IN_PROGRESS attempt already exists, returns the active attempt to avoid duplicate orphaned attempts.
 */
export const startAssessment = async (
  userId: string
): Promise<{ attempt: SafeAssessmentAttempt; isExisting: boolean }> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AssessmentError('Invalid user ID format', 400);
  }

  const userObjectId = new Types.ObjectId(userId);

  // Check for an existing active attempt
  const existingAttempt = await AssessmentAttempt.findOne({
    userId: userObjectId,
    status: AssessmentStatus.IN_PROGRESS,
  }).sort({ createdAt: -1 });

  if (existingAttempt) {
    return {
      attempt: formatSafeAttempt(existingAttempt),
      isExisting: true,
    };
  }

  // Create new active attempt
  const newAttempt = await AssessmentAttempt.create({
    userId: userObjectId,
    status: AssessmentStatus.IN_PROGRESS,
    startedAt: new Date(),
  });

  return {
    attempt: formatSafeAttempt(newAttempt),
    isExisting: false,
  };
};

/**
 * Submits an existing IN_PROGRESS assessment attempt.
 * Enforces ownership and rejects already submitted attempts.
 */
export const submitAssessment = async (
  attemptId: string,
  userId: string
): Promise<SafeAssessmentAttempt> => {
  if (!Types.ObjectId.isValid(attemptId)) {
    throw new AssessmentError('Invalid assessment attempt ID format', 400);
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new AssessmentError('Invalid user ID format', 400);
  }

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) {
    throw new AssessmentError('Assessment attempt not found', 404);
  }

  // Verify ownership: users can only submit their own attempts
  if (attempt.userId.toString() !== userId) {
    throw new AssessmentError('Forbidden: You do not have permission to access this assessment attempt', 403);
  }

  // Verify attempt is still IN_PROGRESS
  if (attempt.status === AssessmentStatus.SUBMITTED) {
    throw new AssessmentError('Assessment attempt has already been submitted', 400);
  }

  // Transition to SUBMITTED
  attempt.status = AssessmentStatus.SUBMITTED;
  attempt.submittedAt = new Date();
  await attempt.save();

  return formatSafeAttempt(attempt);
};

/**
 * Retrieves a specific assessment attempt by ID.
 * Enforces ownership verification.
 */
export const getAttemptById = async (
  attemptId: string,
  userId: string
): Promise<SafeAssessmentAttempt> => {
  if (!Types.ObjectId.isValid(attemptId)) {
    throw new AssessmentError('Invalid assessment attempt ID format', 400);
  }
  if (!Types.ObjectId.isValid(userId)) {
    throw new AssessmentError('Invalid user ID format', 400);
  }

  const attempt = await AssessmentAttempt.findById(attemptId);
  if (!attempt) {
    throw new AssessmentError('Assessment attempt not found', 404);
  }

  // Verify ownership: users can only view their own attempts
  if (attempt.userId.toString() !== userId) {
    throw new AssessmentError('Forbidden: You do not have permission to access this assessment attempt', 403);
  }

  return formatSafeAttempt(attempt);
};

/**
 * Retrieves assessment history for the authenticated user, ordered newest first with pagination.
 */
export const getAssessmentHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<AssessmentHistoryResult> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new AssessmentError('Invalid user ID format', 400);
  }

  const validPage = Math.max(1, page);
  const validLimit = Math.min(50, Math.max(1, limit));
  const skip = (validPage - 1) * validLimit;

  const userObjectId = new Types.ObjectId(userId);

  const [attempts, total] = await Promise.all([
    AssessmentAttempt.find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validLimit)
      .lean(),
    AssessmentAttempt.countDocuments({ userId: userObjectId }),
  ]);

  return {
    attempts: attempts.map((doc) => formatSafeAttempt(doc as any)),
    pagination: {
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / validLimit)),
    },
  };
};
