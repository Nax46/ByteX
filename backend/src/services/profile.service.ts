import { Types } from 'mongoose';
import { StudentProfile, IStudentProfileDocument } from '../models/StudentProfile';
import { OnboardingInput, UpdateProfileInput } from '../validators/profile.validator';

export class ProfileError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'ProfileError';
    this.statusCode = statusCode;
  }
}

export interface SafeProfile {
  id: string;
  userId: string;
  fullName: string;
  education?: string;
  college?: string;
  semester?: number;
  interests: string[];
  targetCareer?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Formats a StudentProfile document into a clean, safe representation.
 */
export const formatSafeProfile = (profile: IStudentProfileDocument): SafeProfile => {
  return {
    id: profile._id.toString(),
    userId: profile.userId.toString(),
    fullName: profile.fullName,
    education: profile.education,
    college: profile.college,
    semester: profile.semester,
    interests: profile.interests,
    targetCareer: profile.targetCareer,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

/**
 * Retrieves the student profile for an authenticated user.
 */
export const getProfile = async (userId: string): Promise<SafeProfile> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ProfileError('Invalid user ID format', 400);
  }

  const profile = await StudentProfile.findOne({ userId });
  if (!profile) {
    throw new ProfileError('Student profile not found', 404);
  }

  return formatSafeProfile(profile);
};

/**
 * Creates the initial student profile during onboarding.
 * Rejects duplicate profile creations to enforce the 1:1 relationship.
 */
export const createOnboardingProfile = async (
  userId: string,
  data: OnboardingInput
): Promise<SafeProfile> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ProfileError('Invalid user ID format', 400);
  }

  // Enforce 1:1 relationship
  const existingProfile = await StudentProfile.findOne({ userId });
  if (existingProfile) {
    if (existingProfile.targetCareer || (existingProfile.education && existingProfile.college)) {
      throw new ProfileError('Profile already exists for this user', 409);
    }

    // Existing profile was an initial registration stub; update it with onboarding data
    existingProfile.fullName = data.fullName;
    existingProfile.education = data.education;
    existingProfile.college = data.college;
    existingProfile.semester = data.semester;
    existingProfile.interests = data.interests;
    existingProfile.targetCareer = data.targetCareer;
    await existingProfile.save();

    return formatSafeProfile(existingProfile);
  }

  // Create student profile
  const profile = await StudentProfile.create({
    userId: new Types.ObjectId(userId),
    fullName: data.fullName,
    education: data.education,
    college: data.college,
    semester: data.semester,
    interests: data.interests,
    targetCareer: data.targetCareer,
  });

  return formatSafeProfile(profile);
};

/**
 * Updates an existing student profile for an authenticated user.
 * Strips any attempt to overwrite userId or security credentials.
 */
export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<SafeProfile> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new ProfileError('Invalid user ID format', 400);
  }

  // Sanitize: ensure no identity or auth fields can be changed via profile update
  const {
    userId: _ignoreUserId,
    email: _ignoreEmail,
    role: _ignoreRole,
    password: _ignorePassword,
    passwordHash: _ignorePasswordHash,
    ...sanitizedUpdate
  } = data as Record<string, unknown>;

  const profile = await StudentProfile.findOneAndUpdate(
    { userId },
    { $set: sanitizedUpdate },
    { returnDocument: 'after', runValidators: true }
  );

  if (!profile) {
    throw new ProfileError('Student profile not found', 404);
  }

  return formatSafeProfile(profile);
};
