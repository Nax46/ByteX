import { User, IUserDocument, UserRole } from '../models/User.js';
import { StudentProfile } from '../models/StudentProfile.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResult {
  token: string;
  user: SafeUser;
}

/**
 * Normalizes user document into a safe response object excluding passwordHash,
 * incorporating name from StudentProfile if available.
 */
export const formatSafeUser = async (user: IUserDocument): Promise<SafeUser> => {
  const profile = await StudentProfile.findOne({ userId: user._id });
  return {
    id: user._id.toString(),
    name: profile?.fullName || user.email.split('@')[0],
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

/**
 * Registers a new student account and creates associated StudentProfile.
 */
export const registerUser = async (input: RegisterInput): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Check for duplicate email
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AuthError('Email already registered', 409);
  }

  // 2. Hash plaintext password
  const passwordHash = await hashPassword(input.password);

  // 3. Persist new user with hashed password
  let user: IUserDocument;
  try {
    user = await User.create({
      email: normalizedEmail,
      passwordHash,
      role: UserRole.STUDENT,
    });
  } catch (err: any) {
    if (err && (err.code === 11000 || err.name === 'MongoServerError')) {
      throw new AuthError('Email already registered', 409);
    }
    throw err;
  }

  // 4. Create initial StudentProfile
  const fullName = input.name && input.name.trim().length >= 2
    ? input.name.trim()
    : normalizedEmail.split('@')[0];

  await StudentProfile.create({
    userId: user._id,
    fullName,
  });

  // 5. Generate JWT
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const safeUser = await formatSafeUser(user);

  return {
    token,
    user: safeUser,
  };
};

/**
 * Authenticates user credentials and issues a JWT.
 */
export const loginUser = async (input: LoginInput): Promise<AuthResult> => {
  const normalizedEmail = input.email.trim().toLowerCase();

  // 1. Retrieve user with explicit passwordHash projection
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
  if (!user || !user.passwordHash) {
    // Generic error to avoid revealing account existence
    throw new AuthError('Invalid email or password', 401);
  }

  // 2. Compare password hash
  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AuthError('Invalid email or password', 401);
  }

  // 3. Issue token
  const token = signToken({
    userId: user._id.toString(),
    role: user.role,
  });

  const safeUser = await formatSafeUser(user);

  return {
    token,
    user: safeUser,
  };
};

/**
 * Retrieves the currently authenticated user by ID.
 */
export const getCurrentUser = async (userId: string): Promise<SafeUser> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AuthError('User not found', 404);
  }

  return await formatSafeUser(user);
};
