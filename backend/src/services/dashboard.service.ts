import { Types } from 'mongoose';
import { StudentProfile } from '../models/StudentProfile';
import { AssessmentAttempt, AssessmentStatus } from '../models/AssessmentAttempt';

export class DashboardError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'DashboardError';
    this.statusCode = statusCode;
  }
}

export interface DashboardProfileData {
  completed: boolean;
  fullName?: string;
  targetCareer?: string;
}

export interface DashboardOnboardingData {
  completed: boolean;
}

export interface DashboardLatestAttempt {
  id: string;
  status: AssessmentStatus;
  startedAt: Date;
  submittedAt: Date | null;
}

export interface DashboardAssessmentData {
  hasActiveAttempt: boolean;
  latestAttempt: DashboardLatestAttempt | null;
}

export interface DashboardSummary {
  profile: DashboardProfileData;
  onboarding: DashboardOnboardingData;
  assessment: DashboardAssessmentData;
}

/**
 * Aggregates Person 1 dashboard summary for the authenticated user.
 * Executes lean, indexed queries in parallel for optimal response times.
 */
export const getDashboardSummary = async (userId: string): Promise<DashboardSummary> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new DashboardError('Invalid user ID format', 400);
  }

  const userObjectId = new Types.ObjectId(userId);

  // Parallel execution of lean queries utilizing existing indexes
  const [profileDoc, latestAttemptDoc, activeAttemptDoc] = await Promise.all([
    StudentProfile.findOne({ userId: userObjectId }).select('fullName targetCareer').lean(),
    AssessmentAttempt.findOne({ userId: userObjectId }).sort({ createdAt: -1 }).lean(),
    AssessmentAttempt.findOne({ userId: userObjectId, status: AssessmentStatus.IN_PROGRESS })
      .select('_id')
      .lean(),
  ]);

  const profileCompleted = !!profileDoc;
  const profile: DashboardProfileData = profileCompleted
    ? {
        completed: true,
        fullName: profileDoc.fullName,
        ...(profileDoc.targetCareer ? { targetCareer: profileDoc.targetCareer } : {}),
      }
    : {
        completed: false,
      };

  const onboarding: DashboardOnboardingData = {
    completed: profileCompleted,
  };

  const hasActiveAttempt = !!activeAttemptDoc;
  const latestAttempt: DashboardLatestAttempt | null = latestAttemptDoc
    ? {
        id: latestAttemptDoc._id.toString(),
        status: latestAttemptDoc.status,
        startedAt: latestAttemptDoc.startedAt,
        submittedAt: latestAttemptDoc.submittedAt || null,
      }
    : null;

  return {
    profile,
    onboarding,
    assessment: {
      hasActiveAttempt,
      latestAttempt,
    },
  };
};
