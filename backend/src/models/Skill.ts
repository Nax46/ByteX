import { Schema, model, Document, Model } from 'mongoose';
import { ISkill, SkillCategory } from '../types/intelligence.js';

export interface ISkillDocument extends Omit<ISkill, '_id'>, Document {}

const SkillSchema = new Schema<ISkillDocument>(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
      maxlength: [100, 'Skill name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Skill slug is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens'],
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      enum: {
        values: ['TECHNICAL', 'SOFT', 'TOOL', 'FRAMEWORK', 'CORE_CS'] as SkillCategory[],
        message: '{VALUE} is not a valid skill category',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    maxLevel: {
      type: Number,
      required: true,
      default: 100,
      min: [1, 'maxLevel must be at least 1'],
      max: [100, 'maxLevel cannot exceed 100'],
    },
  },
  {
    timestamps: true,
    collection: 'skills',
  }
);

// Indexes
SkillSchema.index({ slug: 1 }, { unique: true });
SkillSchema.index({ category: 1 });

export const SkillModel: Model<ISkillDocument> = model<ISkillDocument>('Skill', SkillSchema);
