import { Schema, model, Document, Model } from 'mongoose';
import { IResource, ResourceType, ResourceDifficulty } from '../types/intelligence.js';

export interface IResourceDocument extends Omit<IResource, '_id'>, Document {}

const ResourceSchema = new Schema<IResourceDocument>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [200, 'Resource title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Resource slug is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens'],
    },
    description: {
      type: String,
      required: [true, 'Resource description is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: {
        values: ['ARTICLE', 'VIDEO', 'COURSE', 'DOCUMENTATION', 'BOOK', 'PRACTICE', 'QUIZ'] as ResourceType[],
        message: '{VALUE} is not a valid resource type',
      },
    },
    provider: {
      type: String,
      required: [true, 'Resource provider is required'],
      trim: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Skill reference ID is required'],
    },
    skillTag: {
      type: String,
      lowercase: true,
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Resource difficulty is required'],
      enum: {
        values: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ResourceDifficulty[],
        message: '{VALUE} is not a valid resource difficulty',
      },
    },
    estimatedDuration: {
      type: String,
      required: [true, 'Estimated duration is required'],
      trim: true,
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
      default: 4.5,
    },
    authorOrInstructor: {
      type: String,
      trim: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'resources',
  }
);

// Indexes defined per P2_DATABASE_INDEX_POLICY.md
ResourceSchema.index({ slug: 1 }, { unique: true });
ResourceSchema.index({ skillId: 1 });
ResourceSchema.index({ skillId: 1, difficulty: 1 });
ResourceSchema.index({ skillTag: 1 });

export const ResourceModel: Model<IResourceDocument> = model<IResourceDocument>('Resource', ResourceSchema);
