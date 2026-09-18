import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthTokenPayload } from '../types/auth.types';

/**
 * Signs a JWT with the minimal user identity payload.
 * @param payload The minimal user payload containing userId and role
 * @param expiresIn Optional expiration duration (defaults to validated env.JWT_EXPIRES_IN)
 * @returns Signed JWT string
 */
export const signToken = (
  payload: AuthTokenPayload,
  expiresIn: string | number = env.JWT_EXPIRES_IN
): string => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.JWT_SECRET, options);
};

/**
 * Verifies a JWT token and extracts the decoded authentication payload.
 * Safely rejects invalid, expired, malformed, or incorrectly signed tokens.
 * @param token JWT string
 * @returns Validated AuthTokenPayload
 */
export const verifyToken = (token: string): AuthTokenPayload => {
  if (!token || typeof token !== 'string') {
    throw new Error('Token is required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;

    if (!decoded.userId || !decoded.role) {
      throw new Error('Invalid token payload');
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token signature or format');
    }
    throw new Error('Token verification failed');
  }
};
