import { Schema, model, Document, Model } from 'mongoose';
import { IAssessmentAttempt, AttemptStatus } from '../types/assessment.js';

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
    studentProfileId: {
      type: Schema.Types.ObjectId,
      required: [true, 'studentProfileId reference is required'],
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: [true, 'assessmentId reference is required'],
    },
    status: {
      type: String,
      required: true,
      default: 'COMPLETED',
      enum: {
        values: ['IN_PROGRESS', 'COMPLETED', 'ABANDONED'] as AttemptStatus[],
        message: '{VALUE} is not a valid attempt status',
      },
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
  }
);

// Indexes for historical queries
AssessmentAttemptSchema.index({ studentProfileId: 1, completedAt: -1 });
AssessmentAttemptSchema.index({ assessmentId: 1 });

export const AssessmentAttemptModel: Model<IAssessmentAttemptDocument> = model<IAssessmentAttemptDocument>(
  'AssessmentAttempt',
  AssessmentAttemptSchema
);
