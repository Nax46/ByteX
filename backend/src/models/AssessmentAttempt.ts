import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export enum AssessmentStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
}

export interface IAssessmentAttempt {
  userId: Types.ObjectId;
  status: AssessmentStatus;
  startedAt: Date;
  submittedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAssessmentAttemptDocument extends IAssessmentAttempt, Document {
  createdAt: Date;
  updatedAt: Date;
}

const assessmentAttemptSchema = new Schema<IAssessmentAttemptDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AssessmentStatus),
      default: AssessmentStatus.IN_PROGRESS,
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
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

// Compound indexes for history queries (newest first) and active attempt lookups
assessmentAttemptSchema.index({ userId: 1, createdAt: -1 });
assessmentAttemptSchema.index({ userId: 1, status: 1 });

export const AssessmentAttempt: Model<IAssessmentAttemptDocument> =
  mongoose.models.AssessmentAttempt ||
  mongoose.model<IAssessmentAttemptDocument>('AssessmentAttempt', assessmentAttemptSchema);

export default AssessmentAttempt;
