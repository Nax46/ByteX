import mongoose, { Schema, model, Document, Model, Types } from 'mongoose';
import {
  IRoadmap,
  IRoadmapModule,
  RoadmapModuleStatus,
  RoadmapStatus,
} from '../types/intelligence.js';

export interface IRoadmapDocument extends Omit<IRoadmap, '_id'>, Document {}

const RoadmapModuleSchema = new Schema(
  {
    moduleId: {
      type: String,
      required: [true, 'moduleId is required'],
      trim: true,
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'skillId reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Module sequence order is required'],
      min: [1, 'Order must be at least 1'],
    },
    targetLevel: {
      type: Number,
      required: [true, 'targetLevel is required'],
      min: [0, 'targetLevel cannot be negative'],
      max: [100, 'targetLevel cannot exceed 100'],
    },
    currentLevel: {
      type: Number,
      default: null,
    },
    gapMagnitude: {
      type: Number,
      required: [true, 'gapMagnitude is required'],
      min: [0, 'gapMagnitude cannot be negative'],
      max: [100, 'gapMagnitude cannot exceed 100'],
    },
    priorityScore: {
      type: Number,
      required: [true, 'priorityScore is required'],
      min: [0, 'priorityScore cannot be negative'],
    },
    prerequisites: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    recommendedResourceIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Resource',
      },
    ],
    recommendedProjectIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Project',
      },
    ],
    status: {
      type: String,
      required: true,
      default: 'LOCKED',
      enum: {
        values: ['LOCKED', 'IN_PROGRESS', 'COMPLETED'] as RoadmapModuleStatus[],
        message: '{VALUE} is not a valid roadmap module status',
      },
    },
  },
  { _id: false }
);

const RoadmapSchema = new Schema<IRoadmapDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    studentProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      index: true,
    },
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
      required: [true, 'careerId reference is required'],
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      min: [1, 'Roadmap version must be at least 1'],
    },
    isCurrent: {
      type: Boolean,
      required: true,
      default: true,
    },
    status: {
      type: String,
      required: true,
      default: 'ACTIVE',
      enum: {
        values: ['ACTIVE', 'ARCHIVED', 'COMPLETED'] as RoadmapStatus[],
        message: '{VALUE} is not a valid roadmap status',
      },
    },
    modules: [RoadmapModuleSchema],
    generatedFromAssessmentAttemptId: {
      type: Schema.Types.ObjectId,
      ref: 'AssessmentAttempt',
      default: null,
    },
    generationReason: {
      type: String,
      default: 'INITIAL',
      enum: {
        values: ['INITIAL', 'REASSESSMENT', 'ADAPTIVE'],
        message: '{VALUE} is not a valid generation reason',
      },
    },
  },
  {
    timestamps: true,
    collection: 'roadmaps',
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

// Compound indexes for fast lookups & adaptive version querying
RoadmapSchema.index({ studentProfileId: 1, isCurrent: 1 });
RoadmapSchema.index({ userId: 1, isCurrent: 1 });
RoadmapSchema.index({ studentProfileId: 1, version: -1 });
RoadmapSchema.index({ studentProfileId: 1, generatedFromAssessmentAttemptId: 1 });
RoadmapSchema.index({ careerId: 1 });

export const RoadmapModel: Model<IRoadmapDocument> =
  mongoose.models.Roadmap || model<IRoadmapDocument>('Roadmap', RoadmapSchema);

export const Roadmap = RoadmapModel;

export default RoadmapModel;
