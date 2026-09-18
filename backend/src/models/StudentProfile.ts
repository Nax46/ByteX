import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IStudentProfile {
  userId: Types.ObjectId;
  fullName: string;
  education?: string;
  college?: string;
  semester?: number;
  interests: string[];
  targetCareer?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStudentProfileDocument extends IStudentProfile, Document {
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeStringArray = (vals: string[]): string[] => {
  if (!Array.isArray(vals)) return [];
  return Array.from(
    new Set(vals.map((v) => (typeof v === 'string' ? v.trim() : '')).filter((v) => v.length > 0))
  );
};

const studentProfileSchema = new Schema<IStudentProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters long'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    education: {
      type: String,
      trim: true,
      maxlength: [200, 'Education cannot exceed 200 characters'],
    },
    college: {
      type: String,
      trim: true,
      maxlength: [200, 'College cannot exceed 200 characters'],
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [20, 'Semester cannot exceed 20'],
      validate: {
        validator: (v: number) => v === undefined || v === null || Number.isInteger(v),
        message: 'Semester must be an integer',
      },
    },
    interests: {
      type: [String],
      default: [],
      set: sanitizeStringArray,
    },
    targetCareer: {
      type: String,
      trim: true,
      maxlength: [100, 'Target career cannot exceed 100 characters'],
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

export const StudentProfile: Model<IStudentProfileDocument> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfileDocument>('StudentProfile', studentProfileSchema);

export default StudentProfile;
