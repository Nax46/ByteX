import { Schema, model, Document, Model } from 'mongoose';
import { ICareerSkill, SkillImportance } from '../types/intelligence.js';

export interface ICareerSkillDocument extends Omit<ICareerSkill, '_id'>, Document {}

const CareerSkillSchema = new Schema<ICareerSkillDocument>(
  {
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'careerId reference is required'],
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'skillId reference is required'],
    },
    requiredLevel: {
      type: Number,
      required: [true, 'requiredLevel is required'],
      min: [0, 'requiredLevel cannot be negative'],
      max: [100, 'requiredLevel cannot exceed 100'],
    },
    importance: {
      type: String,
      required: [true, 'importance is required'],
      enum: {
        values: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SkillImportance[],
        message: '{VALUE} is not a valid skill importance level',
      },
    },
    weight: {
      type: Number,
      default: 1.0,
      min: [0.0, 'weight cannot be negative'],
      max: [1.0, 'weight cannot exceed 1.0'],
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
  },
  {
    timestamps: true,
    collection: 'career_skills',
  }
);

// Compound Unique Index to prevent duplicate career+skill mappings
CareerSkillSchema.index({ careerId: 1, skillId: 1 }, { unique: true });

// Individual Indexes for fast lookups by career or skill
CareerSkillSchema.index({ careerId: 1 });
CareerSkillSchema.index({ skillId: 1 });

export const CareerSkillModel: Model<ICareerSkillDocument> = model<ICareerSkillDocument>('CareerSkill', CareerSkillSchema);
