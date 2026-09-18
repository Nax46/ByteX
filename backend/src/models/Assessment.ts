import { Schema, model, Document, Model } from 'mongoose';
import { IAssessment, AssessmentType } from '../types/assessment.js';

export interface IAssessmentDocument extends Omit<IAssessment, '_id'>, Document {}

const AssessmentSchema = new Schema<IAssessmentDocument>(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Assessment slug is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens'],
    },
    type: {
      type: String,
      required: [true, 'Assessment type is required'],
      enum: {
        values: ['DIAGNOSTIC', 'SKILL_SPECIFIC', 'REASSESSMENT'] as AssessmentType[],
        message: '{VALUE} is not a valid assessment type',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    targetCareerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
    },
    targetSkillIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        required: true,
      },
    ],
    durationMinutes: {
      type: Number,
      default: 30,
      min: [1, 'Duration must be at least 1 minute'],
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'assessments',
  }
);

// Indexes
AssessmentSchema.index({ slug: 1 }, { unique: true });
AssessmentSchema.index({ targetCareerId: 1 });
AssessmentSchema.index({ isActive: 1 });

export const AssessmentModel: Model<IAssessmentDocument> = model<IAssessmentDocument>('Assessment', AssessmentSchema);
