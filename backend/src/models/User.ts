import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
}

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  createdAt: Date;
  updatedAt: Date;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      match: [EMAIL_REGEX, 'Please provide a valid email address'],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: '{VALUE} is not a supported role',
      },
      default: UserRole.STUDENT,
      required: [true, 'Role is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);

export default User;
