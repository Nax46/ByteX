import { Types } from 'mongoose';

export class ReassessmentError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ReassessmentError';
    this.statusCode = statusCode;
  }
}

export type ScoreTrend = 'IMPROVED' | 'DECLINED' | 'UNCHANGED' | 'NEW_EVIDENCE';

export interface ISkillScoreComparison {
  skillId: Types.ObjectId;
  skillName?: string;
  skillSlug?: string;
  previousScore: number | null;
  currentScore: number;
  change: number | null;
  trend: ScoreTrend;
}

export interface IReassessmentSummary {
  studentProfileId: Types.ObjectId;
  latestAttemptId: Types.ObjectId;
  previousAttemptId: Types.ObjectId | null;
  latestCompletedAt: Date;
  previousCompletedAt: Date | null;
  skillComparisons: ISkillScoreComparison[];
  overallPreviousScore: number | null;
  overallCurrentScore: number;
  overallChange: number | null;
  attemptCount: number;
}
