import { Types } from 'mongoose';

export type AssessmentType = 'DIAGNOSTIC' | 'SKILL_SPECIFIC' | 'REASSESSMENT';
export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export interface QuestionOption {
  optionId: string;
  text: string;
}

export interface IQuestion {
  _id?: Types.ObjectId;
  skillId: Types.ObjectId;
  assessmentId?: Types.ObjectId;
  text: string;
  options: QuestionOption[];
  correctOptionId: string;
  difficulty: QuestionDifficulty;
  points: number;
  explanation?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentFacingQuestionDTO {
  _id: string;
  skillId: string;
  assessmentId?: string;
  text: string;
  options: QuestionOption[];
  difficulty: QuestionDifficulty;
  points: number;
}

export interface IAssessment {
  _id?: Types.ObjectId;
  title: string;
  slug: string;
  type: AssessmentType;
  description?: string;
  targetCareerId?: Types.ObjectId;
  targetSkillIds: Types.ObjectId[];
  durationMinutes: number;
  version: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssessmentAttemptAnswer {
  questionId: Types.ObjectId;
  selectedOptionId: string;
  isCorrect?: boolean;
  pointsEarned?: number;
  timeTakenSeconds?: number;
}

export interface IAssessmentAttemptSkillScore {
  skillId: Types.ObjectId;
  score: number;
  totalQuestions: number;
  correctCount: number;
  earnedPoints: number;
  maxPoints: number;
}

export interface IAssessmentAttempt {
  _id?: Types.ObjectId;
  studentProfileId: Types.ObjectId;
  assessmentId: Types.ObjectId;
  status: AttemptStatus;
  answers: IAssessmentAttemptAnswer[];
  skillScores?: IAssessmentAttemptSkillScore[];
  totalEarnedPoints?: number;
  totalMaxPoints?: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StudentAnswerSubmissionDTO {
  questionId: string;
  selectedOptionId: string;
  timeTakenSeconds?: number;
}

export interface AssessmentSubmissionPayload {
  studentProfileId: string;
  assessmentId: string;
  answers: StudentAnswerSubmissionDTO[];
}

