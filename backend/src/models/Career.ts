import { Schema, model, Document, Model } from 'mongoose';
import { ICareer } from '../types/intelligence.js';

export interface ICareerDocument extends Omit<ICareer, '_id'>, Document {}

const CareerSchema = new Schema<ICareerDocument>(
  {
    title: {
      type: String,
      required: [true, 'Career title is required'],
      trim: true,
      maxlength: [100, 'Career title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Career slug is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens'],
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
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
    collection: 'careers',
  }
);

// Indexes
CareerSchema.index({ slug: 1 }, { unique: true });

export const CareerModel: Model<ICareerDocument> = model<ICareerDocument>('Career', CareerSchema);
