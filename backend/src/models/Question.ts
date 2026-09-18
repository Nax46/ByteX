import { Schema, model, Document, Model } from 'mongoose';
import { IQuestion, QuestionDifficulty } from '../types/assessment.js';

export interface IQuestionDocument extends Omit<IQuestion, '_id'>, Document {}

const QuestionOptionSchema = new Schema(
  {
    optionId: {
      type: String,
      required: true,
      trim: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'skillId reference is required'],
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    options: {
      type: [QuestionOptionSchema],
      required: [true, 'Question options are required'],
      validate: [
        (opts: any[]) => Array.isArray(opts) && opts.length >= 2,
        'Question must have at least 2 options',
      ],
    },
    correctOptionId: {
      type: String,
      required: [true, 'correctOptionId is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Question difficulty is required'],
      enum: {
        values: ['EASY', 'MEDIUM', 'HARD'] as QuestionDifficulty[],
        message: '{VALUE} is not a valid question difficulty',
      },
    },
    points: {
      type: Number,
      default: 10,
      min: [1, 'Points must be at least 1'],
    },
    explanation: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'questions',
  }
);

// Indexes
QuestionSchema.index({ skillId: 1, difficulty: 1 });
QuestionSchema.index({ assessmentId: 1 });
QuestionSchema.index({ isActive: 1 });

export const QuestionModel: Model<IQuestionDocument> = model<IQuestionDocument>('Question', QuestionSchema);
