import mongoose, { Schema, model, Document, Model } from 'mongoose';
import { IRoadmapProgress, IModuleProgressItem } from '../types/progress.js';
import { RoadmapModuleStatus } from '../types/intelligence.js';

export interface IRoadmapProgressDocument extends Omit<IRoadmapProgress, '_id'>, Document {}

const ModuleProgressItemSchema = new Schema<IModuleProgressItem>(
  {
    moduleId: {
      type: String,
      required: [true, 'moduleId is required'],
      trim: true,
    },
    status: {
      type: String,
      required: true,
      default: 'LOCKED',
      enum: {
        values: ['LOCKED', 'IN_PROGRESS', 'COMPLETED'] as RoadmapModuleStatus[],
        message: '{VALUE} is not a valid module status',
      },
    },
    progressPercent: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'progressPercent cannot be negative'],
      max: [100, 'progressPercent cannot exceed 100'],
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    lastActivityAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const RoadmapProgressSchema = new Schema<IRoadmapProgressDocument>(
  {
    roadmapId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'roadmapId reference is required'],
      unique: true,
      index: true,
    },
    studentProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: [true, 'studentProfileId reference is required'],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    modules: [ModuleProgressItemSchema],
    overallProgress: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 100,
    },
    totalModules: {
      type: Number,
      required: true,
      default: 0,
    },
    completedModules: {
      type: Number,
      required: true,
      default: 0,
    },
    inProgressModules: {
      type: Number,
      required: true,
      default: 0,
    },
    lockedModules: {
      type: Number,
      required: true,
      default: 0,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'roadmap_progress',
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

RoadmapProgressSchema.index({ studentProfileId: 1, roadmapId: 1 });
RoadmapProgressSchema.index({ userId: 1, roadmapId: 1 });

export const RoadmapProgressModel: Model<IRoadmapProgressDocument> =
  mongoose.models.RoadmapProgress ||
  model<IRoadmapProgressDocument>('RoadmapProgress', RoadmapProgressSchema);

export const RoadmapProgress = RoadmapProgressModel;
export default RoadmapProgressModel;
