import mongoose, { Schema, model, Document, Model, Types } from 'mongoose';
import { IAssessmentAttempt as IPerson2Attempt, AttemptStatus as Person2AttemptStatus } from '../types/assessment.js';

export const AssessmentStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED',
} as const;

export type AssessmentStatus = (typeof AssessmentStatus)[keyof typeof AssessmentStatus];

export interface IAssessmentAttempt {
  userId?: Types.ObjectId;
  studentProfileId?: Types.ObjectId;
  assessmentId?: Types.ObjectId;
  status: AssessmentStatus;
  startedAt?: Date;
  submittedAt?: Date | null;
  answers?: IPerson2Attempt['answers'];
  skillScores?: IPerson2Attempt['skillScores'];
  totalEarnedPoints?: number;
  totalMaxPoints?: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssessmentAttemptDocument extends Omit<IAssessmentAttempt, '_id'>, Document {}

const AnswerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'Question',
      required: true,
    },
    selectedOptionId: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
    },
    pointsEarned: {
      type: Number,
      default: 0,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const SkillScoreSchema = new Schema(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    correctCount: {
      type: Number,
      required: true,
      default: 0,
    },
    earnedPoints: {
      type: Number,
      required: true,
      default: 0,
    },
    maxPoints: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const AssessmentAttemptSchema = new Schema<IAssessmentAttemptDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    studentProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    status: {
      type: String,
      required: true,
      default: 'COMPLETED',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    answers: [AnswerSchema],
    skillScores: [SkillScoreSchema],
    totalEarnedPoints: {
      type: Number,
      default: 0,
    },
    totalMaxPoints: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'assessment_attempts',
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for history queries & lookups
AssessmentAttemptSchema.index({ studentProfileId: 1, completedAt: -1 });
AssessmentAttemptSchema.index({ assessmentId: 1 });
AssessmentAttemptSchema.index({ userId: 1, createdAt: -1 });
AssessmentAttemptSchema.index({ userId: 1, status: 1 });

export const AssessmentAttemptModel: Model<IAssessmentAttemptDocument> =
  mongoose.models.AssessmentAttempt ||
  model<IAssessmentAttemptDocument>('AssessmentAttempt', AssessmentAttemptSchema);

export const AssessmentAttempt = AssessmentAttemptModel;

export default AssessmentAttemptModel;
