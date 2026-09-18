import { Schema, model, Document, Model } from 'mongoose';
import { IProject, ProjectDifficulty } from '../types/intelligence.js';

export interface IProjectDocument extends Omit<IProject, '_id'>, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Project title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens'],
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Project difficulty is required'],
      enum: {
        values: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ProjectDifficulty[],
        message: '{VALUE} is not a valid project difficulty',
      },
    },
    careerId: {
      type: Schema.Types.ObjectId,
      ref: 'Career',
    },
    skillId: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Primary skill reference ID is required'],
    },
    skillsReinforced: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Skill',
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    estimatedHours: {
      type: Number,
      required: [true, 'Estimated hours is required'],
      min: [1, 'Estimated hours must be at least 1'],
    },
    githubStarterUrl: {
      type: String,
      trim: true,
    },
    architectureOverview: {
      type: String,
      trim: true,
    },
    learningObjectives: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'projects',
  }
);

// Indexes defined per P2_DATABASE_INDEX_POLICY.md
ProjectSchema.index({ slug: 1 }, { unique: true });
ProjectSchema.index({ skillId: 1 });
ProjectSchema.index({ careerId: 1 });
ProjectSchema.index({ skillId: 1, difficulty: 1 });

export const ProjectModel: Model<IProjectDocument> = model<IProjectDocument>('Project', ProjectSchema);
